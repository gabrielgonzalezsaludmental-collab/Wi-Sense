# Wi-Sense

Sitio y demo de monitoreo domiciliario (Wi-Fi sensing) para adultos mayores, con un
asistente de IA para el operador. Interfaz, commits y documentación en español.

## Estructura

```
public/                      Sitio estático publicado tal cual (Netlify: publish = public)
  index.html                 Landing comercial. Usa assets/styles.css y una mini simulación propia en el hero.
  demo.html                  Demo interactivo. UN SOLO ARCHIVO (HTML + CSS + JS inline), sin dependencias.
  gracias.html               Confirmación del formulario de piloto (Netlify Forms).
  assets/styles.css          Estilos de la landing y gracias.html. El demo NO lo usa.
netlify/functions/asistente.mjs   Función serverless: POST /api/asistente -> Claude (Anthropic SDK).
netlify.toml                 Publicación, carpeta de funciones y cabeceras.
package.json                 Solo para la función serverless (@anthropic-ai/sdk). El sitio no tiene build.
docs/ESTRATEGIA.md           Mercado, competencia, regulación, modelo de negocio y hoja de ruta.
```

## Reglas para sesiones de Claude Code

- **El sitio no tiene build.** `public/` se publica sin transformar. No agregar bundlers, frameworks ni CDN
  a la landing o al demo (la landing solo carga la fuente Inter desde Google Fonts).
- **`npm install` solo hace falta** para ejecutar o validar la función serverless. Para tocar HTML, CSS o
  el JS inline del demo no instales nada. `npm run check` hace `node --check` de la función.
- **Probar el demo** abriendo `public/demo.html` en un navegador, o headless con el Chromium preinstalado
  (`require('playwright')` funciona con Node; sirve `public/` con `python3 -m http.server`).
  Chequeo mínimo: cargar la página, esperar 4 s y verificar que no haya `pageerror` y que existan
  6 `.tile`, 6 `.card`, 18 `svg.spark` y al menos 1 `.bub` en `#chat`.
- **Probar la landing**: cargar `public/index.html`, verificar `h1`, 4 `.tile` en `#live-tiles` y que no haya
  desborde horizontal a 390 px de ancho.
- **Idioma**: la interfaz y los commits van en español rioplatense.
- **Simulación**: los datos se generan en el navegador cada 1,5 s (`setInterval` al final del script).
  No es un dispositivo médico certificado; mantener el aviso del pie de página y el "llamá al 107".
- **Asistente IA**: el demo llama a `POST /api/asistente`; si no responde (archivo local, servidor
  estático), usa `aiLocal()` y marca el modo "local". La clave de API nunca va al navegador.

## Estructura del script del demo (`public/demo.html`)

- `residents`: lista de 6 pacientes con línea base (`bHr`, `bRr`). El `forEach` inicial debe dejar
  **todos** los campos que `render()` lee (`level`, `factors`, `risk`, `pred`, `eta`), porque
  `render()` corre antes que el primer `step()`.
- `step(r, dt)`: simula signos vitales según el escenario (`normal`, `deterioro`, `evento`, `caida`),
  calcula riesgo/nivel y genera alarmas.
- `render()`: repinta KPIs, leyenda, tiles, tarjetas, alarmas y el registro (`renderLog()`).
- `applyScn()`: aplica el escenario elegido en los selectores.
- `togglePause()` / `resetSim()`: pausa el tick (el reloj sigue) y reinicia el estado de los pacientes.
  El registro se conserva en ambos casos y se deja un evento `sesion`.
- Asistente: `aiState()` arma la foto del estado, `askAI(q)` consulta `/api/asistente` y cae en
  `aiLocal(q, st)` (reglas) si falla, `initAI()` conecta botones y formulario. Cada consulta deja un
  evento `asistente` en el registro. `CONTACTO` mapea id de paciente a su contacto familiar.

## Registro de datos (persistencia)

- En cada tick se guarda una lectura por paciente en `LOG.readings` como fila compacta
  `[ts, id, FC, FR, SpO2, mov, zona, sueño, escenario, riesgo, nivel, pred, eta, caída, factores]`,
  y cada alarma, cambio de escenario, pausa, reinicio, consulta al asistente e inicio de sesión como
  objeto en `LOG.events`.
- Persistencia en `localStorage` bajo la clave `wisense.registro.v1`: guardado automático cada 10 s y
  al cerrar u ocultar la pestaña. Tope de ~3 M de caracteres; al superarlo se recortan las lecturas más
  antiguas (los eventos se conservan, hasta 1000) y se avisa en el panel. Si `localStorage` falla, los
  datos siguen en memoria y se avisa.
- Exportación desde el panel "Registro de datos": `exportCSV("lecturas"|"eventos")` (separador `;`,
  decimal con coma y BOM UTF-8, pensado para Excel en español) y `exportJSON()` con todo. `clearLog()`
  borra con confirmación.
- Al cargar, `loadLog()` restaura lecturas y eventos, recompone el contador de alarmas y las últimas 12
  alarmas del panel lateral.
- `importJSON(file)` (botón "Importar JSON", input `#reg-imp`) une un JSON exportado en otro dispositivo:
  deduplica lecturas por `ts|id` y eventos por `ts|type|id`, reordena, recompone alarmas y deja un evento
  `importacion`.
- `shareLog()` usa Web Share con los dos CSV como archivos (móvil); si no hay soporte abre un `mailto:`
  con el texto de `shareSummary()`. `printReport()` pone la vista "Resumen por paciente", rellena
  `#print-head` e imprime con la hoja `@media print`.
- Tendencias: cada tarjeta muestra tres sparklines SVG (`trendHTML`, últimas `TREND_N`=120 lecturas).
- Vista "Resumen por paciente" en `#reg-v`: `summaryFor(id)`.
- Chequeo headless ampliado: además de lo anterior, verificar filas en `#reg-b` en las tres vistas, la
  clave en `localStorage` después de 10 s, que al recargar el panel diga "restauradas", y que exportar
  JSON → borrar → importar recupere las lecturas y una segunda importación no duplique (con
  `navigator.share` y `window.print` stubeados).

## Función serverless (`netlify/functions/asistente.mjs`)

- Netlify Functions v2 (`export default async (req) => Response`, `config.path = "/api/asistente"`).
- Modelo por defecto `claude-opus-5-5` (variable `WISENSE_MODEL` para cambiarlo). Prompt de sistema fijo
  con `cache_control`, `fallbacks: "default"` con el beta `server-side-fallback-2026-07-01`,
  `output_config.effort = "medium"`, `max_tokens` 2048.
- Valida método, JSON, historial (máx. 8 mensajes de 2000 caracteres) y recorta el estado a 12 000
  caracteres. Devuelve `{text, model, usage}`; errores como JSON con código HTTP (405, 400, 503, 429, 502).
- Para probar sin red: importar el módulo y llamar a `default(new Request(...))` sin `ANTHROPIC_API_KEY`
  (debe responder 503) y con JSON inválido (400).

## Git

- Trabajar en la rama `claude/...` que indique la sesión y abrir PR en borrador.
- Si el push devuelve **403 "Claude doesn't have GitHub access"**, no es un problema del código: hay que
  instalar la app de GitHub de Claude en el repo o reconectar GitHub desde
  https://claude.ai/customize/connectors y luego reintentar el push desde la misma sesión.
