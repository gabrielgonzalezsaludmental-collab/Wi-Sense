# Wi-Sense

Demo estática de monitoreo domiciliario (Wi-Fi sensing) para adultos mayores.
Todo el proyecto es **un solo archivo**: `index.html` (HTML + CSS + JS inline).

## Reglas para sesiones de Claude Code

- **No hay dependencias ni build.** No existe `package.json`, no hay `node_modules`,
  no hay librerías externas ni CDN. No ejecutar `npm install`, `pip install` ni
  ningún paso de instalación: no hace falta y solo consume tiempo.
- **Probar** abriendo `index.html` en un navegador, o headless con el Chromium
  preinstalado (Playwright en `/opt/node22/lib/node_modules/playwright`).
  Un chequeo mínimo: cargar la página, esperar 4 s y verificar que no haya
  `pageerror` en consola y que existan 6 `.tile` y 6 `.card`.
- **Idioma**: la interfaz y los commits van en español.
- **Simulación**: los datos se generan en el navegador cada 1,5 s
  (`setInterval` al final del script). No es un dispositivo médico certificado;
  mantener el aviso del pie de página.

## Estructura del script

- `residents`: lista de 6 pacientes con línea base (`bHr`, `bRr`). El `forEach`
  inicial debe dejar **todos** los campos que `render()` lee (`level`, `factors`,
  `risk`, `pred`, `eta`), porque `render()` corre antes que el primer `step()`.
- `step(r, dt)`: simula signos vitales según el escenario (`normal`, `deterioro`,
  `evento`, `caida`), calcula riesgo/nivel y genera alarmas.
- `render()`: repinta KPIs, leyenda, tiles, tarjetas y alarmas.
- `applyScn()`: aplica el escenario elegido en los selectores.

## Registro de datos (persistencia)

- En cada tick se guarda una lectura por paciente en `LOG.readings` como fila compacta
  `[ts, id, FC, FR, SpO2, mov, zona, sueño, escenario, riesgo, nivel, pred, eta, caída, factores]`,
  y cada alarma, cambio de escenario e inicio de sesión como objeto en `LOG.events`.
- Persistencia en `localStorage` bajo la clave `wisense.registro.v1`: guardado automático
  cada 10 s y al cerrar u ocultar la pestaña. Tope de ~3 M de caracteres; al superarlo
  se recortan las lecturas más antiguas (los eventos se conservan, hasta 1000) y se avisa
  en el panel. Si `localStorage` falla, los datos siguen en memoria y se avisa.
- Exportación desde el panel "Registro de datos": `exportCSV("lecturas"|"eventos")`
  (separador `;`, decimal con coma y BOM UTF-8, pensado para Excel en español) y
  `exportJSON()` con todo. `clearLog()` borra con confirmación.
- Al cargar, `loadLog()` restaura lecturas y eventos, recompone el contador de alarmas
  y las últimas 12 alarmas del panel lateral.
- `importJSON(file)` (botón "Importar JSON", input `#reg-imp`) une un JSON exportado en
  otro dispositivo: deduplica lecturas por `ts|id` y eventos por `ts|type|id`, reordena,
  recompone alarmas y deja un evento `importacion`. Es la forma de unificar registros
  entre dispositivos sin servidor.
- `shareLog()` usa Web Share con los dos CSV como archivos (móvil); si no hay soporte
  abre un `mailto:` con el texto de `shareSummary()`. `printReport()` pone la vista
  "Resumen por paciente", rellena `#print-head` e imprime con la hoja `@media print`.
- Tendencias: cada tarjeta muestra tres sparklines SVG (`trendHTML`, últimas
  `TREND_N`=120 lecturas del paciente, escala que siempre incluye el rango normal).
- Vista "Resumen por paciente" en `#reg-v`: `summaryFor(id)` calcula lecturas, período,
  media/mín/máx de FC, FR y SpO₂, % de lecturas en alarma, nº de alarmas y última alarma.
- Chequeo headless ampliado: además de 6 `.tile` y 6 `.card`, verificar 18 `svg.spark`,
  filas en `#reg-b` en las tres vistas, la clave en `localStorage` después de 10 s, que al
  recargar el panel diga "restauradas", y que exportar JSON → borrar → importar recupere
  las lecturas y una segunda importación no duplique (con `navigator.share` y
  `window.print` stubeados).

## Git

- Trabajar en la rama `claude/...` que indique la sesión y abrir PR en borrador.
- Si el push devuelve **403 "Claude doesn't have GitHub access"**, no es un
  problema del código: hay que instalar la app de GitHub de Claude en el repo
  o reconectar GitHub desde https://claude.ai/customize/connectors y luego
  reintentar el push desde la misma sesión.
