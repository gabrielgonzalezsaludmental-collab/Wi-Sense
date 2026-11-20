/* Wi-Sense · Demo interactivo + Asistente IA
   Simulación en el navegador. El asistente usa /api/asistente (Claude) si está desplegado;
   si no, responde con un motor local basado en reglas. */
(function () {
  "use strict";

  // ---------- Constantes ----------
  const COL = { ok: "#22c55e", aviso: "#facc15", urgente: "#fb923c", critico: "#ef4444", predictivo: "#a855f7" };
  const LBL = { ok: "ESTABLE", aviso: "VIGILAR", urgente: "URGENTE", critico: "CRÍTICO", predictivo: "PREDICTIVO" };
  const CLBL = { critico: "Crítico", urgente: "Urgente", predictivo: "Predictivo", aviso: "Vigilar", ok: "Estable" };
  const ZONES = ["dormitorio", "baño", "cocina", "sala"];
  const RANGES = { hr: { lo: 50, hi: 100, cl: 40, ch: 130 }, rr: { lo: 12, hi: 20, cl: 8, ch: 28 }, spo2: { lo: 94, hi: 100, cl: 90, ch: 100 } };
  const ORDER = { critico: 0, urgente: 1, predictivo: 2, aviso: 3, ok: 4 };
  const TICK_MS = 1500;

  const R = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (id) => document.getElementById(id);

  // ---------- Estado ----------
  const BASE = [
    { id: "r1", name: "Dolores Martinez", home: "Casa Martinez", cond: "Hipertensión", bHr: 74, bRr: 16, contacto: "su hija Carla" },
    { id: "r2", name: "Jorge Martinez", home: "Casa Martinez", cond: "Diabetes tipo 2", bHr: 78, bRr: 17, contacto: "su hija Carla" },
    { id: "r3", name: "Héctor Ferreyra", home: "Depto Ferreyra", cond: "EPOC / insuf. cardíaca", bHr: 80, bRr: 18, contacto: "su hijo Martín" },
    { id: "r4", name: "Susana Quiroga", home: "Casa Quiroga", cond: "Post-operatorio", bHr: 72, bRr: 16, contacto: "su esposo Raúl" },
    { id: "r5", name: "Ramón Benítez", home: "Casa Benítez", cond: "Parkinson, riesgo caídas", bHr: 76, bRr: 17, contacto: "su nieta Sofía" },
    { id: "r6", name: "Nilda Vega", home: "Casa Vega", cond: "Seguimiento general", bHr: 75, bRr: 16, contacto: "su vecina Ana" },
  ];
  let residents = [];
  let alerts = [];
  let stats = { alerts: 0, predictive: 0 };
  let paused = false;
  let timer = null;

  function initResidents() {
    residents = BASE.map((b) => Object.assign({}, b, {
      hr: b.bHr, rr: b.bRr, spo2: 97, mov: 0.15, zone: "dormitorio", sleep: "despierto",
      scn: "normal", t0: 0, fall: 0, risk: 0, level: "ok", factors: [], pred: false, eta: null, _lastAl: 0, _lastLvl: null,
    }));
    alerts = []; stats = { alerts: 0, predictive: 0 };
  }

  // ---------- Simulación ----------
  function step(r, dt) {
    r.t0 += dt;
    let dHr = 0, dRr = 0, dSpo = 0, mov = R(0.05, 0.4);
    if (r.scn === "deterioro") { const k = Math.min(r.t0 / 40, 1); dRr += 9 * k; dHr += 14 * k; dSpo -= 6 * k; }
    else if (r.scn === "evento") { if (r.t0 > 3) { dHr += 58; dRr += 14; dSpo -= 11; mov = 0.05; } }
    else if (r.scn === "caida") { if (r.t0 > 3) { r.fall = 1; mov = 0.02; r.zone = "baño"; } }
    r.hr += 0.3 * ((r.bHr + 10 * mov + dHr) - r.hr) + R(-1, 1);
    r.rr += 0.3 * ((r.bRr + 4 * mov + dRr) - r.rr) + R(-0.4, 0.4);
    r.spo2 += 0.3 * ((97.5 - 1.5 * mov + dSpo) - r.spo2) + R(-0.3, 0.3);
    r.spo2 = Math.max(80, Math.min(100, r.spo2)); r.mov = mov;
    if (r.scn === "normal" && Math.random() < 0.05) r.zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    r.sleep = mov > 0.3 ? "despierto" : "ligero";

    let risk = 0, factors = [], level = "ok", pred = false, eta = null;
    if (r.hr >= RANGES.hr.ch) { factors.push("Taquicardia crítica (" + Math.round(r.hr) + " lpm)"); risk = Math.max(risk, 95); }
    if (r.rr >= RANGES.rr.ch) { factors.push("Taquipnea marcada (" + Math.round(r.rr) + " rpm)"); risk = Math.max(risk, 70); }
    if (r.spo2 <= RANGES.spo2.cl) { factors.push("Desaturación (" + Math.round(r.spo2) + "%)"); risk = Math.max(risk, 88); }
    if (r.fall) { factors.push("Posible caída + inmovilidad"); risk = Math.max(risk, 96); }
    if (r.scn === "deterioro" && r.rr < RANGES.rr.ch && r.rr > r.bRr + 2) {
      const slope = (r.rr - r.bRr) / Math.max(r.t0, 1);
      if (slope > 0.02) { eta = Math.max(1, Math.round((RANGES.rr.ch - r.rr) / slope)); if (eta <= 30) { pred = true; factors.push("Predicción: FR cruzaría umbral en ~" + eta + " min"); } }
    }
    if (risk === 0) risk = Math.round(R(0, 12));
    if (risk >= 80) level = "critico"; else if (risk >= 55) level = "urgente"; else if (pred) level = "predictivo"; else if (risk >= 30) level = "aviso"; else level = "ok";
    r.risk = Math.round(risk); r.level = level; r.factors = factors; r.pred = pred; r.eta = eta;

    if ((level === "critico" || level === "urgente" || level === "predictivo") && (!r._lastAl || r._lastLvl !== level || (Date.now() - r._lastAl) > 20000)) {
      r._lastAl = Date.now(); r._lastLvl = level;
      const notified = level === "critico" ? ["FAMILIAR", "SAME 107"] : (level === "predictivo" ? ["FAMILIAR (preventivo)"] : ["FAMILIAR"]);
      alerts.unshift({ level, home: r.home, name: r.name, factors: factors.slice(0, 2), notified, ts: Date.now() });
      alerts = alerts.slice(0, 12); stats[level === "predictivo" ? "predictive" : "alerts"]++;
    }
  }

  // ---------- Render ----------
  function sorted() { return [...residents].sort((a, b) => ORDER[a.level] - ORDER[b.level] || b.risk - a.risk); }

  function render() {
    $("clock").textContent = new Date().toLocaleTimeString() + (paused ? " · pausado" : "");
    $("k-h").textContent = new Set(residents.map((r) => r.home)).size;
    $("k-a").textContent = stats.alerts;
    $("k-p").textContent = stats.predictive;
    $("k-c").textContent = residents.filter((r) => r.level === "critico").length;

    const counts = { critico: 0, urgente: 0, predictivo: 0, aviso: 0, ok: 0 };
    residents.forEach((r) => counts[r.level]++);
    $("legend").innerHTML = ["critico", "urgente", "predictivo", "aviso", "ok"].map((k) =>
      `<div class="lc" style="opacity:${counts[k] ? 1 : 0.45}"><i style="background:${COL[k]}"></i>${CLBL[k]} <b style="color:${COL[k]}">${counts[k]}</b></div>`).join("");

    const s = sorted();
    $("tiles").innerHTML = s.map((r) => {
      const c = COL[r.level];
      const eta = (r.pred && r.eta) ? ` · <span class="eta">🔮 ~${r.eta} min</span>` : "";
      return `<div class="tile" style="border-left-color:${c}"><div class="r1">
        <span class="dot" style="background:${c};color:${c}"></span>
        <div class="nm"><div class="n">${esc(r.name)}</div><div class="h">${esc(r.home)}</div></div>
        <span class="bd" style="color:${c}">${LBL[r.level]}</span></div>
        <div class="vt">FC ${Math.round(r.hr)} · FR ${Math.round(r.rr)} · SpO₂ ${Math.round(r.spo2)}% · 📍${r.zone}${eta}</div></div>`;
    }).join("");

    $("cards").innerHTML = s.map((r) => {
      const c = COL[r.level];
      const eta = (r.pred && r.eta) ? `<div style="font-size:11px;color:var(--predictivo);margin-top:5px">🔮 Predicción: posible deterioro en ~${r.eta} min</div>` : "";
      return `<article class="pcard" style="border-top-color:${c}"><div class="top">
        <div><div class="n">${esc(r.name)}</div><div class="meta">${esc(r.home)} · ${esc(r.cond)}</div></div>
        <span class="badge" style="background:${c}22;color:${c}">${LBL[r.level]}</span></div>
        <div class="grid4">
          <div class="v"><b>${Math.round(r.hr)}</b><span>FC lpm</span></div>
          <div class="v"><b>${Math.round(r.rr)}</b><span>FR rpm</span></div>
          <div class="v"><b>${Math.round(r.spo2)}</b><span>SpO₂ %</span></div>
          <div class="v"><b style="color:${c}">${r.risk}</b><span>Riesgo</span></div></div>
        <div class="loc">📍 ${r.zone} · 😴 ${r.sleep}</div>${eta}
        <div class="fct">${(r.factors.length && r.level !== "ok") ? "⚠ " + esc(r.factors.join(" · ")) : "Parámetros dentro de la normalidad individual"}</div>
      </article>`;
    }).join("");

    $("al-list").innerHTML = alerts.length ? alerts.map((a) => {
      const c = COL[a.level];
      return `<div class="al" style="border-left-color:${c}"><div class="t" style="color:${c}">${LBL[a.level]} · ${esc(a.home)}</div>
        <div class="s">${esc((a.factors || []).join(" · "))}</div><div class="nt">📨 ${esc(a.notified.join(" ; "))}</div></div>`;
    }).join("") : '<div style="color:var(--muted);font-size:12px">Sin alarmas.</div>';
  }

  // ---------- Controles ----------
  function applyScn() {
    const rid = $("sel-res").value, scn = $("sel-scn").value;
    const r = residents.find((x) => x.id === rid);
    if (r) { r.scn = scn; r.t0 = 0; r.fall = 0; if (scn !== "caida") r.zone = "dormitorio"; }
    flash("✓ " + scn + " aplicado a " + (r ? r.name : ""));
  }
  function flash(t) { $("msg").textContent = t; setTimeout(() => { $("msg").textContent = ""; }, 2500); }
  function togglePause() {
    paused = !paused;
    const b = $("btn-pause"); b.textContent = paused ? "▶ Reanudar" : "⏸ Pausar"; b.setAttribute("aria-pressed", String(paused));
    render();
  }
  function reset() { initResidents(); render(); flash("↺ Simulación reiniciada"); }
  function tick() { if (!paused) residents.forEach((r) => step(r, TICK_MS / 1000)); render(); }

  // ---------- Asistente IA ----------
  const history = []; // {role, content}
  let aiMode = "local"; // "local" | "cloud"
  let cloudChecked = false;

  function snapshot() {
    return {
      hora: new Date().toLocaleTimeString(),
      hogares: new Set(residents.map((r) => r.home)).size,
      personas: sorted().map((r) => ({
        nombre: r.name, hogar: r.home, condicion: r.cond, contacto: r.contacto,
        nivel: CLBL[r.level], riesgo: r.risk,
        fc: Math.round(r.hr), fr: Math.round(r.rr), spo2: Math.round(r.spo2),
        zona: r.zone, sueno: r.sleep, factores: r.factors, eta_min: r.pred ? r.eta : null, caida: !!r.fall,
      })),
      alertas_recientes: alerts.slice(0, 6).map((a) => ({ nivel: CLBL[a.level], hogar: a.home, persona: a.name, factores: a.factors, notificados: a.notified })),
    };
  }

  function addBubble(role, text, cls) {
    const d = document.createElement("div");
    d.className = "bub " + (role === "user" ? "u" : "a") + (cls ? " " + cls : "");
    d.textContent = text;
    $("chat").appendChild(d); $("chat").scrollTop = $("chat").scrollHeight;
    return d;
  }
  function setMode(m) { aiMode = m; const el = $("ai-mode"); el.textContent = m === "cloud" ? "Claude" : "local"; el.classList.toggle("cloud", m === "cloud"); }

  // Motor local basado en reglas: respuestas útiles sin backend
  function localAnswer(q, snap) {
    const s = q.toLowerCase();
    const worst = snap.personas[0];
    const activos = snap.personas.filter((p) => p.nivel !== "Estable");
    const fmt = (p) => `${p.nombre} (${p.hogar}): ${p.nivel}, riesgo ${p.riesgo}. FC ${p.fc}, FR ${p.fr}, SpO₂ ${p.spo2} %, en ${p.zona}.`;
    const accion = (p) => {
      if (p.nivel === "Crítico") return `Llamá ya a ${p.contacto} y, en paralelo, al SAME 107. ${p.caida ? "Hay posible caída con inmovilidad: pedí que no la muevan hasta que llegue la ambulancia." : "Confirmá estado de conciencia por teléfono."}`;
      if (p.nivel === "Urgente") return `Llamá a ${p.contacto} para que verifique en persona. Si no responde en 2 minutos, escalá al SAME 107.`;
      if (p.nivel === "Predictivo") return `Aviso preventivo a ${p.contacto}: la frecuencia respiratoria viene subiendo y cruzaría el umbral en unos ${p.eta_min} minutos. Que la observen y la hagan sentar; si aparece disnea, llamar al 107.`;
      if (p.nivel === "Vigilar") return `Sin acción inmediata. Revisar de nuevo en 10 minutos.`;
      return "Sin acción.";
    };
    if (/predic/.test(s)) {
      return "Una alerta PREDICTIVA no significa que la persona esté mal ahora. El sistema compara la tendencia de un parámetro, por ejemplo la frecuencia respiratoria, con la línea de base personal y estima en cuántos minutos cruzaría el umbral crítico si sigue así. Sirve para avisar al familiar antes de que ocurra la descompensación. " +
        (activos.find((p) => p.nivel === "Predictivo") ? "Ahora mismo: " + fmt(activos.find((p) => p.nivel === "Predictivo")) : "En este momento no hay alertas predictivas activas.");
    }
    if (/famil|mensaje|redact|hija|hijo|explic/.test(s)) {
      const p = worst;
      if (p.nivel === "Estable") return `Todos los hogares están estables. Un mensaje posible: "Hola, te escribimos de Wi-Sense. Todo está en orden en la casa de ${p.nombre}. Respiración, ritmo cardíaco y movimiento dentro de lo habitual. Cualquier cambio te avisamos."`;
      const motivo = p.caida ? "detectamos una posible caída en el baño y no vemos movimiento desde entonces" : p.nivel === "Predictivo" ? "notamos que la respiración viene acelerándose de a poco" : "notamos que la respiración y el pulso están más rápidos de lo habitual y la oxigenación un poco baja";
      const pedido = p.nivel === "Crítico" ? "Ya dimos aviso al SAME. ¿Podés ir o llamar ahora?" : "¿Podés llamarla o pasar a verla? Si la notás agitada o confundida, llamá al 107.";
      return `Mensaje sugerido para ${p.contacto}:\n\n"Hola, te escribimos de Wi-Sense por ${p.nombre}. Hace unos minutos ${motivo}. ${pedido} Nosotros seguimos atentos y te avisamos de cualquier cambio."`;
    }
    if (/llam|primero|priori|qué hago|que hago|acción|accion/.test(s)) {
      if (!activos.length) return "No hay alertas activas. Nadie necesita una llamada ahora. Los seis hogares están dentro de su normalidad.";
      return "Orden sugerido:\n" + activos.slice(0, 3).map((p, i) => `${i + 1}. ${fmt(p)}\n   → ${accion(p)}`).join("\n") + (activos.length > 3 ? `\n...y ${activos.length - 3} más en observación.` : "");
    }
    // Resumen general
    if (!activos.length) return `Las ${snap.hora}. ${snap.hogares} hogares monitoreados, todos estables. Sin alarmas activas. Podés aplicar un escenario desde los controles para ver cómo responde el sistema.`;
    return `Las ${snap.hora}. ${activos.length} de ${snap.personas.length} personas requieren atención:\n` + activos.map((p) => "• " + fmt(p)).join("\n") + `\n\nPrioridad: ${worst.nombre}. ${accion(worst)}`;
  }

  async function ask(q) {
    q = (q || "").trim(); if (!q) return;
    addBubble("user", q);
    history.push({ role: "user", content: q });
    const thinking = addBubble("assistant", "Analizando...", "think");
    const snap = snapshot();
    let text = null;
    try {
      const res = await fetch("/api/asistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8), snapshot: snap }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.text === "string" && data.text.trim()) { text = data.text.trim(); setMode("cloud"); }
      }
    } catch (_) { /* sin backend: usamos el motor local */ }
    if (!text) { text = localAnswer(q, snap); setMode("local"); }
    cloudChecked = true;
    thinking.remove();
    addBubble("assistant", text);
    history.push({ role: "assistant", content: text });
    if (history.length > 16) history.splice(0, history.length - 16);
  }

  // ---------- Init ----------
  function init() {
    initResidents();
    $("sel-res").innerHTML = residents.map((r) => `<option value="${r.id}">${esc(r.name)} (${esc(r.home)})</option>`).join("");
    $("btn-apply").addEventListener("click", applyScn);
    $("btn-pause").addEventListener("click", togglePause);
    $("btn-reset").addEventListener("click", reset);
    $("ai-quick").addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) ask(b.dataset.q); });
    $("ai-form").addEventListener("submit", (e) => { e.preventDefault(); const i = $("ai-input"); ask(i.value); i.value = ""; });
    addBubble("assistant", "Hola. Soy el asistente del operador. Preguntame qué está pasando, a quién llamar primero o pedime un mensaje para la familia. También podés aplicar un escenario arriba y volver a preguntar.");
    render();
    timer = setInterval(tick, TICK_MS);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
