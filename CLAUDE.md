# Wi-Sense

Monitoreo domiciliario (Wi-Fi sensing) con nodos ESP32. Piezas del proyecto, todas sin dependencias:

- `index.html`: el dashboard (HTML + CSS + JS inline). En vivo cuando lo sirve el servidor local;
  simula los mismos 3 nodos si no hay servidor; con `?modo=demo` muestra la demo original de 6 pacientes.
- `server/wisense-server.mjs`: servidor local (Node 18+). Recibe los ESP32 en `/ingest`, calcula riesgo
  y alarmas, sirve el dashboard y la API `/api/*`. Nodos en `server/nodes.json`.
- `server/wisense-mcp.mjs`: servidor MCP por stdio que expone el monitoreo a Claude (consulta la API del anterior).
- `firmware/esp32_wisense/esp32_wisense.ino`: sketch del ESP32 (POST JSON al servidor). `docs/ESP32_MCP_SETUP.md`: puesta en marcha.

## Reglas para sesiones de Claude Code

- **No hay dependencias ni build.** No existe `package.json`, no hay `node_modules`,
  no hay librerías externas ni CDN; el servidor y el MCP usan solo la biblioteca estándar de Node.
  No ejecutar `npm install`, `pip install` ni ningún paso de instalación: no hace falta y solo consume tiempo.
- **Probar el dashboard** abriendo `index.html` en un navegador, o headless con el Chromium
  preinstalado (Playwright en `/opt/node22/lib/node_modules/playwright`).
  Chequeo mínimo: cargar la página, esperar 4 s y verificar que no haya `pageerror` en consola y que
  existan 3 `.tile` y 3 `.card` (6 con `?modo=demo`). Para el modo simulación puro usar `?api=http://127.0.0.1:1`.
- **Probar el servidor**: `node server/wisense-server.mjs` (puerto 8787), luego `curl -X POST
  http://127.0.0.1:8787/ingest -H 'content-type: application/json' -d '{"node":"esp32-01","hr":74,"rr":15}'`
  y `curl http://127.0.0.1:8787/api/state`. El dashboard en `http://127.0.0.1:8787/` debe decir "En vivo".
- **Probar el MCP**: con el servidor corriendo, enviar por stdin las líneas JSON-RPC `initialize`,
  `tools/list` y `tools/call` (ver `docs/ESP32_MCP_SETUP.md`). Responde una línea JSON por pedido.
- **Idioma**: la interfaz, los mensajes del servidor y los commits van en español.
- **Simulación**: en el navegador los datos se generan cada 1,5 s (`tick()`); en el servidor, solo para los
  nodos con `sim=true` (escenario aplicado por `/api/sim` o `WISENSE_SIM=1`). Un ESP32 real que manda datos
  apaga la simulación de su nodo. No es un dispositivo médico certificado; mantener el aviso del pie de página.

## Estructura del script de `index.html`

- `NODES` (3 nodos ESP32, iguales a `server/nodes.json`) y `DEMO` (6 pacientes). `residents` se arma de uno u otro
  según `?modo=demo`. El `forEach` inicial debe dejar **todos** los campos que `render()` lee
  (`level`, `factors`, `risk`, `pred`, `eta`, `online`, `presence`), porque `render()` corre antes que el primer `step()`.
- `step(r, dt)`: simula signos vitales según el escenario (`normal`, `deterioro`, `evento`, `caida`), calcula riesgo/nivel y genera alarmas.
- `render(items, alerts, stats, meta)`: repinta KPIs, leyenda, tiles, tarjetas y alarmas; `meta.nodes` cambia los rótulos
  (nodos vs. hogares) y `meta.live` marca el subtítulo. Acepta tanto los `residents` simulados como `state.nodes` del servidor.
- `tick()`: intenta `GET /api/state` (hasta 3 fallos seguidos y luego un reintento cada 20 ciclos); si no hay servidor, simula.
- `applyScn()`: en vivo hace `POST /api/sim` al servidor; en simulación aplica el escenario en el navegador.

## Estructura del servidor (`server/wisense-server.mjs`)

- `ingest(id, data)`: valida y guarda la lectura del nodo (campos opcionales), apaga su simulación y llama a `evaluate()`.
- `evaluate(n)`: reglas de riesgo/nivel (umbrales `RANGES`, caída, predicción por pendiente de FR en 2 min) y alarmas.
- `stepSim(n, dt)`: misma simulación que el navegador, para nodos sin sensor.
- Un nodo sin datos durante `WISENSE_STALE_S` (30 s) pasa a `offline`.

## Git

- Trabajar en la rama `claude/...` que indique la sesión y abrir PR en borrador.
- Si el push devuelve **403 "Claude doesn't have GitHub access"**, no es un
  problema del código: hay que instalar la app de GitHub de Claude en el repo
  o reconectar GitHub desde https://claude.ai/customize/connectors y luego
  reintentar el push desde la misma sesión.

## Alcance del repositorio

- Este repositorio es **solo** para Wi-Sense: la demo `index.html` y su documentación.
- Documentos de otros proyectos (casos legales o periciales, investigaciones sobre
  terceros, trámites fiscales, carrera internacional, material personal) **no se suben
  acá**. Van a Google Drive, en `00_SISTEMA_ORDENADO_2026/`, dentro de la carpeta
  numerada del proyecto que corresponda, o en `99_BANDEJA_INGRESO/` si no está claro.
- Si una sesión produce un informe que no es de Wi-Sense, lo entrega como archivo o lo
  sube a Drive; no abre una rama ni un PR en este repo para eso.
