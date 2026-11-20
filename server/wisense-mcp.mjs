#!/usr/bin/env node
/**
 * Wi-Sense · servidor MCP (stdio, Node 18+, sin dependencias)
 * Expone el monitoreo del servidor local (server/wisense-server.mjs) como herramientas y recursos MCP,
 * para consultarlo desde Claude Desktop, Claude Code o cualquier cliente MCP.
 *
 *  Uso: node server/wisense-mcp.mjs      (variable opcional: WISENSE_URL=http://127.0.0.1:8787)
 */
import readline from "node:readline";

const BASE = (process.env.WISENSE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const SERVER = { name: "wisense", version: "1.0.0" };
const INSTRUCTIONS = "Monitoreo domiciliario Wi-Sense (nodos ESP32 en la casa del paciente). Empezá con wisense_status; usá wisense_patient_summary para un resumen clínico y wisense_vitals para el detalle de un nodo. Es un sistema de apoyo y alerta temprana, no un dispositivo médico certificado.";

const TOOLS = [
  { name: "wisense_status", description: "Estado general del monitoreo Wi-Sense: hogar, paciente, nodos ESP32 en línea, alarmas acumuladas y nodos críticos.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "wisense_nodes", description: "Lista los nodos ESP32 con su última lectura (FC, FR, SpO₂, movimiento, presencia), nivel de riesgo, factores y si están en línea.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "wisense_vitals", description: "Resumen (mín/máx/promedio) y, opcionalmente, muestras crudas de los signos vitales de un nodo en los últimos N minutos.", inputSchema: { type: "object", properties: { node: { type: "string", description: "id del nodo, por ejemplo esp32-01" }, minutes: { type: "integer", minimum: 1, maximum: 120, default: 10 }, include_samples: { type: "boolean", default: false, description: "incluir las muestras crudas (puede ser largo)" } }, required: ["node"], additionalProperties: false } },
  { name: "wisense_alerts", description: "Alarmas recientes (críticas, urgentes y predictivas) con nodo, ambiente, factores y a quién se notificó.", inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 50, default: 10 } }, additionalProperties: false } },
  { name: "wisense_patient_summary", description: "Resumen clínico del paciente: ubicación probable en la casa, estado por nodo, tendencias de los últimos minutos y alarmas.", inputSchema: { type: "object", properties: { minutes: { type: "integer", minimum: 1, maximum: 120, default: 30 } }, additionalProperties: false } },
  { name: "wisense_set_scenario", description: "Solo para pruebas y demos: simula un escenario en un nodo (normal, deterioro, evento, caida) u 'off' para volver a los datos reales del ESP32.", inputSchema: { type: "object", properties: { node: { type: "string" }, scn: { type: "string", enum: ["normal", "deterioro", "evento", "caida", "off"] } }, required: ["node", "scn"], additionalProperties: false } },
];
const RESOURCES = [
  { uri: "wisense://state", name: "Estado Wi-Sense", description: "Estado actual de todos los nodos y últimas alarmas (JSON)", mimeType: "application/json" },
  { uri: "wisense://alerts", name: "Alarmas Wi-Sense", description: "Últimas 20 alarmas (JSON)", mimeType: "application/json" },
];

async function api(p, opts) {
  const r = await fetch(BASE + p, opts);
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${p}: ${t.slice(0, 200)}`);
  return j;
}
async function callTool(name, a = {}) {
  switch (name) {
    case "wisense_status": { const s = await api("/api/state"); return { home: s.home, patient: s.patient, stats: s.stats, nodes: s.nodes.map((n) => ({ id: n.id, label: n.label, zone: n.zone, online: n.online, level: n.level, risk: n.risk, lastSeenAgo: n.lastSeenAgo, simulado: n.sim })) }; }
    case "wisense_nodes": return api("/api/nodes");
    case "wisense_vitals": { const h = await api(`/api/history?node=${encodeURIComponent(a.node)}&minutes=${a.minutes ?? 10}`); if (!a.include_samples) delete h.samples; return h; }
    case "wisense_alerts": return api(`/api/alerts?limit=${a.limit ?? 10}`);
    case "wisense_patient_summary": return api(`/api/summary?minutes=${a.minutes ?? 30}`);
    case "wisense_set_scenario": return api("/api/sim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ node: a.node, scn: a.scn }) });
    default: throw new Error("herramienta desconocida: " + name);
  }
}

const out = (m) => process.stdout.write(JSON.stringify(m) + "\n");
const reply = (id, result) => out({ jsonrpc: "2.0", id, result });
const fail = (id, code, message) => out({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(msg) {
  const { id, method, params = {} } = msg;
  if (method === "initialize") return reply(id, { protocolVersion: params.protocolVersion || "2025-03-26", capabilities: { tools: {}, resources: {} }, serverInfo: SERVER, instructions: INSTRUCTIONS });
  if (typeof method === "string" && method.startsWith("notifications/")) return;
  if (method === "ping") return reply(id, {});
  if (method === "tools/list") return reply(id, { tools: TOOLS });
  if (method === "tools/call") {
    try { const r = await callTool(params.name, params.arguments || {}); return reply(id, { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] }); }
    catch (e) {
      const m = String(e.message || e);
      const hint = /fetch failed|ECONN|HTTP \d/.test(m) ? `\n¿Está corriendo el servidor local en ${BASE}? Arrancalo con: node server/wisense-server.mjs` : "";
      return reply(id, { content: [{ type: "text", text: `Error: ${m}${hint}` }], isError: true });
    }
  }
  if (method === "resources/list") return reply(id, { resources: RESOURCES });
  if (method === "resources/read") {
    const uri = params.uri;
    try {
      const data = uri === "wisense://state" ? await api("/api/state") : uri === "wisense://alerts" ? await api("/api/alerts?limit=20") : null;
      if (!data) return fail(id, -32602, "recurso desconocido: " + uri);
      return reply(id, { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }] });
    } catch (e) { return fail(id, -32000, String(e.message || e)); }
  }
  if (id !== undefined) return fail(id, -32601, "método no soportado: " + method);
}

let pending = 0;
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  line = line.trim(); if (!line) return;
  let msg; try { msg = JSON.parse(line); } catch { return fail(null, -32700, "JSON inválido"); }
  pending++;
  handle(msg).catch((e) => { if (msg.id !== undefined) fail(msg.id, -32000, String(e.message || e)); }).finally(() => { pending--; });
});
// Al cerrarse la entrada, esperar a que se respondan las llamadas en curso antes de salir.
process.stdin.on("end", () => { const t = setInterval(() => { if (pending === 0) { clearInterval(t); process.exit(0); } }, 25); });
console.error(`[wisense-mcp] listo · servidor local esperado en ${BASE}`);
