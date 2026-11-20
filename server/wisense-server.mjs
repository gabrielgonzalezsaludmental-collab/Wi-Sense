#!/usr/bin/env node
/**
 * Wi-Sense · servidor local (Node 18+, sin dependencias)
 *
 *  - Recibe las lecturas de los ESP32 por HTTP:
 *      POST /ingest   (JSON: {"node":"esp32-01","hr":72,"rr":15,"spo2":97,"mov":0.2,"presence":true,"fall":false})
 *      GET  /ingest?node=esp32-01&hr=72&rr=15   (para firmware mínimo)
 *  - Calcula riesgo, nivel y alarmas con las mismas reglas que la demo.
 *  - Sirve el dashboard (index.html) y la API JSON que usan el dashboard y el servidor MCP.
 *
 *  Uso:  node server/wisense-server.mjs
 *  Variables opcionales: WISENSE_PORT=8787  WISENSE_HOST=0.0.0.0  WISENSE_STALE_S=30  WISENSE_SIM=1 (simula los nodos sin datos)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.WISENSE_PORT || 8787);
const HOST = process.env.WISENSE_HOST || "0.0.0.0";
const STALE_MS = Number(process.env.WISENSE_STALE_S || 30) * 1000;
const SIM_ALL = process.env.WISENSE_SIM === "1";
const TICK_MS = 1500;
const HIST_MAX = 2400; // ~1 h con un dato cada 1,5 s
const RANGES = { hr: { lo: 50, hi: 100, cl: 40, ch: 130 }, rr: { lo: 12, hi: 20, cl: 8, ch: 28 }, spo2: { lo: 94, hi: 100, cl: 90, ch: 100 } };
const SCENARIOS = ["normal", "deterioro", "evento", "caida", "off"];

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "nodes.json"), "utf8"));
const nodes = new Map();
const alerts = [];
const stats = { alerts: 0, predictive: 0 };

const R = (a, b) => a + Math.random() * (b - a);
const num = (v) => { if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const bool = (v) => { if (v === true || v === false) return v; if (v === null || v === undefined || v === "") return null; const s = String(v).toLowerCase(); return s === "1" || s === "true" || s === "on" || s === "yes"; };
const rnd = (v) => (v == null ? null : Math.round(v));

function makeNode(n) {
  return {
    id: n.id, label: n.label || n.id, zone: n.zone || "sin asignar", patient: n.patient || cfg.patient || "GG", home: cfg.home || "Casa",
    bHr: n.baseline?.hr ?? 72, bRr: n.baseline?.rr ?? 15,
    hr: null, rr: null, spo2: null, mov: 0, presence: null, temp: null, rssi: null, fall: false,
    lastSeen: 0, online: false, source: "none", scn: "normal", t0: 0, sim: false,
    risk: 0, level: "offline", factors: ["Esperando datos del ESP32"], pred: false, eta: null, sleep: "-",
    hist: [], _lastAl: 0, _lastLvl: null,
  };
}
cfg.nodes.forEach((n) => nodes.set(n.id, makeNode(n)));
if (SIM_ALL) nodes.forEach((n) => { n.sim = true; });

function pushHist(n) {
  n.hist.push({ ts: n.lastSeen, hr: n.hr, rr: n.rr, spo2: n.spo2, mov: n.mov, presence: n.presence });
  if (n.hist.length > HIST_MAX) n.hist.splice(0, n.hist.length - HIST_MAX);
}

function ingest(id, data, ip) {
  if (!id) return { ok: false, error: "falta el campo node (p. ej. esp32-01)" };
  let n = nodes.get(id);
  if (!n) { n = makeNode({ id, label: `${id} · sin asignar` }); nodes.set(id, n); }
  const hr = num(data.hr), rr = num(data.rr), spo2 = num(data.spo2), mov = num(data.mov), temp = num(data.temp), rssi = num(data.rssi);
  if (hr != null) n.hr = hr;
  if (rr != null) n.rr = rr;
  if (spo2 != null) n.spo2 = Math.max(50, Math.min(100, spo2));
  if (mov != null) n.mov = Math.max(0, Math.min(1, mov));
  if (temp != null) n.temp = temp;
  if (rssi != null) n.rssi = rssi;
  const p = bool(data.presence); if (p != null) n.presence = p;
  const f = bool(data.fall); if (f != null) n.fall = f;
  if (data.zone) n.zone = String(data.zone).slice(0, 40);
  n.lastSeen = Date.now(); n.online = true; n.sim = false; n.scn = "normal"; n.source = ip || "http";
  n.sleep = n.presence === false ? "ausente" : (n.mov > 0.3 ? "despierto" : "ligero");
  pushHist(n);
  evaluate(n);
  return { ok: true, node: n.id, level: n.level, risk: n.risk };
}

function stepSim(n, dt) {
  n.t0 += dt;
  let dHr = 0, dRr = 0, dSpo = 0, mov = R(0.05, 0.4);
  if (n.scn === "deterioro") { const k = Math.min(n.t0 / 40, 1); dRr += 9 * k; dHr += 14 * k; dSpo -= 6 * k; }
  else if (n.scn === "evento") { if (n.t0 > 3) { dHr += 58; dRr += 14; dSpo -= 11; mov = 0.05; } }
  else if (n.scn === "caida") { if (n.t0 > 3) { n.fall = true; mov = 0.02; } }
  if (n.hr == null) n.hr = n.bHr;
  if (n.rr == null) n.rr = n.bRr;
  if (n.spo2 == null) n.spo2 = 97;
  n.hr += 0.3 * ((n.bHr + 10 * mov + dHr) - n.hr) + R(-1, 1);
  n.rr += 0.3 * ((n.bRr + 4 * mov + dRr) - n.rr) + R(-0.4, 0.4);
  n.spo2 += 0.3 * ((97.5 - 1.5 * mov + dSpo) - n.spo2) + R(-0.3, 0.3);
  n.spo2 = Math.max(80, Math.min(100, n.spo2)); n.mov = mov; n.presence = true;
  n.sleep = mov > 0.3 ? "despierto" : "ligero";
  n.lastSeen = Date.now(); n.online = true; n.source = "simulado";
  pushHist(n);
}

function evaluate(n) {
  let risk = 0, factors = [], level = "ok", pred = false, eta = null;
  if (n.hr != null && n.hr >= RANGES.hr.ch) { factors.push(`Taquicardia crítica (${Math.round(n.hr)} lpm)`); risk = Math.max(risk, 95); }
  if (n.rr != null && n.rr >= RANGES.rr.ch) { factors.push(`Taquipnea marcada (${Math.round(n.rr)} rpm)`); risk = Math.max(risk, 70); }
  if (n.spo2 != null && n.spo2 <= RANGES.spo2.cl) { factors.push(`Desaturación (${Math.round(n.spo2)}%)`); risk = Math.max(risk, 88); }
  if (n.fall) { factors.push("Posible caída + inmovilidad"); risk = Math.max(risk, 96); }
  // Predicción: pendiente de la frecuencia respiratoria en los últimos 2 minutos.
  if (n.rr != null && n.rr < RANGES.rr.ch && n.rr > n.bRr + 2 && n.hist.length >= 10) {
    const now = Date.now();
    const win = n.hist.filter((h) => h.rr != null && now - h.ts <= 120000);
    if (win.length >= 5) {
      const first = win[0], last = win[win.length - 1];
      const mins = Math.max((last.ts - first.ts) / 60000, 0.5);
      const slope = (last.rr - first.rr) / mins; // rpm por minuto
      if (slope > 0.3) {
        eta = Math.max(1, Math.round((RANGES.rr.ch - n.rr) / slope));
        if (eta <= 30) { pred = true; factors.push(`Predicción: FR cruzaría umbral en ~${eta} min`); }
      }
    }
  }
  if (risk === 0) risk = (n.hr == null && n.rr == null) ? 0 : Math.round(R(0, 12));
  if (risk >= 80) level = "critico"; else if (risk >= 55) level = "urgente"; else if (pred) level = "predictivo"; else if (risk >= 30) level = "aviso"; else level = "ok";
  n.risk = Math.round(risk); n.level = level; n.factors = factors; n.pred = pred; n.eta = eta;
  if ((level === "critico" || level === "urgente" || level === "predictivo") && (!n._lastAl || n._lastLvl !== level || Date.now() - n._lastAl > 20000)) {
    n._lastAl = Date.now(); n._lastLvl = level;
    const notified = level === "critico" ? ["FAMILIAR", "SAME 107"] : (level === "predictivo" ? ["FAMILIAR (preventivo)"] : ["FAMILIAR"]);
    alerts.unshift({ level, node: n.id, label: n.label, home: n.home, zone: n.zone, factors: factors.slice(0, 2), notified, ts: Date.now() });
    if (alerts.length > 50) alerts.length = 50;
    stats[level === "predictivo" ? "predictive" : "alerts"]++;
  }
}

setInterval(() => {
  const now = Date.now();
  nodes.forEach((n) => {
    if (n.sim) { stepSim(n, TICK_MS / 1000); evaluate(n); return; }
    if (!n.lastSeen) { n.online = false; n.level = "offline"; n.factors = ["Esperando datos del ESP32"]; n.pred = false; n.eta = null; return; }
    if (now - n.lastSeen > STALE_MS) { n.online = false; n.level = "offline"; n.factors = [`Sin datos hace ${Math.round((now - n.lastSeen) / 1000)} s`]; n.pred = false; n.eta = null; }
  });
}, TICK_MS);

function view(n) {
  const { hist, _lastAl, _lastLvl, bHr, bRr, ...rest } = n;
  return { ...rest, hr: rnd(n.hr), rr: rnd(n.rr), spo2: rnd(n.spo2), mov: +(n.mov || 0).toFixed(2), lastSeenAgo: n.lastSeen ? Math.round((Date.now() - n.lastSeen) / 1000) : null, samples: hist.length };
}
function state() {
  const list = [...nodes.values()];
  return {
    mode: "live", home: cfg.home, patient: cfg.patient, ts: Date.now(),
    stats: { ...stats, online: list.filter((n) => n.online).length, nodes: list.length, critical: list.filter((n) => n.level === "critico").length },
    nodes: list.map(view), alerts: alerts.slice(0, 12),
  };
}
function summary(n, minutes) {
  const since = Date.now() - minutes * 60000;
  const h = n.hist.filter((x) => x.ts >= since);
  const agg = (k) => { const v = h.map((x) => x[k]).filter((x) => x != null); if (!v.length) return null; return { min: +Math.min(...v).toFixed(1), max: +Math.max(...v).toFixed(1), avg: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1), n: v.length }; };
  const present = h.filter((x) => x.presence === true).length;
  return { node: n.id, label: n.label, zone: n.zone, minutes, samples: h.length, hr: agg("hr"), rr: agg("rr"), spo2: agg("spo2"), mov: agg("mov"), presencePct: h.length ? Math.round(100 * present / h.length) : null, current: view(n) };
}

function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Cache-Control": "no-store" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => { d += c; if (d.length > 65536) { reject(new Error("cuerpo demasiado grande")); req.destroy(); } });
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
}
async function parseBody(req) {
  const raw = await readBody(req);
  if (!raw) return {};
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("json")) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const p = url.pathname;
  try {
    if (req.method === "OPTIONS") return send(res, 204, "");
    if (p === "/" || p === "/index.html") return send(res, 200, fs.readFileSync(path.join(ROOT, "index.html"), "utf8"), "text/html; charset=utf-8");
    if (p === "/ingest" || p === "/api/ingest") {
      const data = req.method === "POST" ? await parseBody(req) : {};
      url.searchParams.forEach((v, k) => { if (data[k] === undefined) data[k] = v; });
      const id = String(data.node || data.id || "").trim().toLowerCase();
      const r = ingest(id, data, req.socket.remoteAddress);
      return send(res, r.ok ? 200 : 400, r);
    }
    if (p === "/api/state") return send(res, 200, state());
    if (p === "/api/nodes") return send(res, 200, [...nodes.values()].map(view));
    if (p === "/api/alerts") return send(res, 200, alerts.slice(0, Math.min(Number(url.searchParams.get("limit") || 20), 50)));
    if (p === "/api/history") {
      const id = url.searchParams.get("node"); const minutes = Math.min(Math.max(Number(url.searchParams.get("minutes") || 10), 1), 120);
      const n = id ? nodes.get(id) : null;
      if (!n) return send(res, 404, { error: "nodo no encontrado", nodes: [...nodes.keys()] });
      const since = Date.now() - minutes * 60000;
      return send(res, 200, { node: id, minutes, summary: summary(n, minutes), samples: n.hist.filter((h) => h.ts >= since) });
    }
    if (p === "/api/summary") {
      const minutes = Math.min(Math.max(Number(url.searchParams.get("minutes") || 30), 1), 120);
      const list = [...nodes.values()];
      const where = list.filter((n) => n.online && n.presence !== false).map((n) => n.zone);
      return send(res, 200, { home: cfg.home, patient: cfg.patient, minutes, ubicacion_probable: where[0] || "sin señal de presencia", nodes: list.map((n) => summary(n, minutes)), alerts: alerts.slice(0, 10), stats: state().stats });
    }
    if (p === "/api/sim" && req.method === "POST") {
      const b = await parseBody(req);
      const n = nodes.get(String(b.node || "").trim().toLowerCase());
      if (!n) return send(res, 404, { error: "nodo no encontrado", nodes: [...nodes.keys()] });
      const scn = String(b.scn || "normal");
      if (!SCENARIOS.includes(scn)) return send(res, 400, { error: "escenario inválido", scenarios: SCENARIOS });
      if (scn === "off") { n.sim = false; n.scn = "normal"; n.t0 = 0; n.fall = false; n.source = "none"; n.lastSeen = 0; n.online = false; n.hr = n.rr = n.spo2 = null; n.level = "offline"; n.factors = ["Esperando datos del ESP32"]; }
      else { n.sim = true; n.scn = scn; n.t0 = 0; n.fall = false; }
      return send(res, 200, { ok: true, node: n.id, scn, sim: n.sim });
    }
    if (p === "/health") return send(res, 200, { ok: true, nodes: nodes.size, uptime: Math.round(process.uptime()) });
    return send(res, 404, { error: "ruta no encontrada", rutas: ["/", "/ingest", "/api/state", "/api/nodes", "/api/alerts", "/api/history?node=&minutes=", "/api/summary?minutes=", "POST /api/sim", "/health"] });
  } catch (e) {
    return send(res, 400, { error: String(e.message || e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Wi-Sense · servidor local en http://${HOST}:${PORT}  (dashboard en /, API en /api/state, ingesta de ESP32 en /ingest)`);
  console.log(`Nodos configurados: ${[...nodes.keys()].join(", ")}${SIM_ALL ? "  [WISENSE_SIM=1: simulando los nodos sin datos]" : ""}`);
});
