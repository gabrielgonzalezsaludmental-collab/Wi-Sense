// Wi-Sense · Asistente IA del operador
// Función serverless de Netlify (Functions v2). Expone POST /api/asistente.
// Requiere la variable de entorno ANTHROPIC_API_KEY en el sitio de Netlify.
// El cliente (public/assets/demo.js) usa un motor local si esta función no responde.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.WISENSE_MODEL || "claude-opus-5-5";
const MAX_HISTORY = 8;
const MAX_CHARS = 2000;

const SYSTEM = `Sos el asistente del operador de Wi-Sense, un sistema de monitoreo domiciliario pasivo por Wi-Fi para personas mayores o con enfermedades crónicas en Argentina. Hablás en español rioplatense, claro y breve.

Recibís un JSON con el estado actual: personas monitoreadas, su nivel (Crítico, Urgente, Predictivo, Vigilar, Estable), riesgo 0-100, frecuencia cardíaca (fc), frecuencia respiratoria (fr), saturación (spo2), zona de la casa, factores detectados, minutos estimados hasta cruzar un umbral (eta_min) y alertas recientes.

Reglas:
- Priorizá siempre por nivel y riesgo. Crítico primero.
- Para Crítico: indicá llamar al contacto familiar y en paralelo al SAME 107. Si hay posible caída, recomendá no mover a la persona hasta que llegue la ambulancia.
- Para Urgente: llamar al contacto para verificación en persona; si no responde en 2 minutos, escalar al 107.
- Para Predictivo: explicá que es una tendencia, no una emergencia, y sugerí aviso preventivo al contacto.
- Si te piden un mensaje para la familia, redactalo entre comillas, sin jerga médica, con tono calmado, nombrando a la persona y al contacto.
- Nunca diagnostiques ni indiques medicación. Sos apoyo a la decisión; la decisión final es de una persona.
- Si no hay alertas, decilo en una línea y no inventes problemas.
- Respondé en texto plano, sin Markdown, máximo 120 palabras salvo que pidan un mensaje o un listado.
- Los datos son de una simulación con personas ficticias.`;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function sanitizeHistory(messages) {
  if (!Array.isArray(messages)) return [];
  const out = [];
  for (const m of messages.slice(-MAX_HISTORY)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
    const content = m.content.slice(0, MAX_CHARS).trim();
    if (content) out.push({ role: m.role, content });
  }
  // La conversación debe empezar con un mensaje de usuario
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "no_api_key", hint: "Configurá ANTHROPIC_API_KEY en Netlify." }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }

  const history = sanitizeHistory(body.messages);
  if (!history.length) return json({ error: "empty" }, 400);
  const snapshot = body.snapshot && typeof body.snapshot === "object" ? body.snapshot : {};
  const snapshotText = JSON.stringify(snapshot).slice(0, 12000);

  // La última pregunta del usuario se envía junto con el estado actual del sistema.
  const last = history.pop();
  const messages = [
    ...history,
    { role: "user", content: `Estado actual del sistema (JSON):\n${snapshotText}\n\nPregunta del operador: ${last.content}` },
  ];

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2048,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages,
    });

    if (response.stop_reason === "refusal") {
      return json({ text: "No puedo responder esa consulta desde el asistente. Ante una emergencia llamá al 107.", model: response.model, refusal: true });
    }
    const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return json({ text, model: response.model, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens, cached: response.usage.cache_read_input_tokens || 0 } });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return json({ error: "auth", hint: "ANTHROPIC_API_KEY inválida." }, 503);
    if (error instanceof Anthropic.RateLimitError) return json({ error: "rate_limit" }, 429);
    if (error instanceof Anthropic.APIError) return json({ error: "api", status: error.status, message: error.message }, 502);
    return json({ error: "internal", message: String(error && error.message || error) }, 500);
  }
};

export const config = { path: "/api/asistente" };
