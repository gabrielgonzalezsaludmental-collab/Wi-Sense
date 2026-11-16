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

## Git

- Trabajar en la rama `claude/...` que indique la sesión y abrir PR en borrador.
- Si el push devuelve **403 "Claude doesn't have GitHub access"**, no es un
  problema del código: hay que instalar la app de GitHub de Claude en el repo
  o reconectar GitHub desde https://claude.ai/customize/connectors y luego
  reintentar el push desde la misma sesión.
