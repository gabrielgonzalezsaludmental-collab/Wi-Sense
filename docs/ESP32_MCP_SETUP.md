# Wi-Sense · ESP32 + servidor local + MCP

Cómo pasar de la demo simulada al monitoreo real de los tres ESP32 de la casa, y cómo consultarlo desde Claude por MCP.

## 1. Arrancar el servidor local (en la Mac o PC de la casa)

```bash
cd Wi-Sense
node server/wisense-server.mjs
# Wi-Sense · servidor local en http://0.0.0.0:8787
```

- Dashboard en vivo: http://127.0.0.1:8787 (desde otro dispositivo de la red: http://IP-DE-LA-MAC:8787).
- Sin Node instalado: https://nodejs.org (LTS). No hace falta `npm install`: el servidor no usa dependencias.
- Nodos configurados en `server/nodes.json` (id, nombre, ambiente, paciente). Un ESP32 con un id desconocido se registra solo como "sin asignar".

## 2. Probar sin sensores (simulación en el servidor)

```bash
curl -X POST http://127.0.0.1:8787/api/sim -H 'content-type: application/json' -d '{"node":"esp32-01","scn":"normal"}'
curl -X POST http://127.0.0.1:8787/api/sim -H 'content-type: application/json' -d '{"node":"esp32-02","scn":"deterioro"}'
curl -X POST http://127.0.0.1:8787/api/sim -H 'content-type: application/json' -d '{"node":"esp32-02","scn":"off"}'   # vuelve a datos reales
```

O arrancar con todo simulado: `WISENSE_SIM=1 node server/wisense-server.mjs`. En cuanto un ESP32 real manda datos, ese nodo deja de simularse.

## 3. Mandar una lectura a mano (lo mismo que hará el ESP32)

```bash
curl -X POST http://127.0.0.1:8787/ingest -H 'content-type: application/json' \
  -d '{"node":"esp32-01","hr":74,"rr":15,"spo2":97,"mov":0.2,"presence":true,"fall":false}'
# también sirve GET: curl "http://127.0.0.1:8787/ingest?node=esp32-01&hr=74&rr=15"
```

Campos: `node` (obligatorio), `hr` lpm, `rr` rpm, `spo2` %, `mov` 0 a 1, `presence` true/false, `fall` true/false, `temp` °C, `rssi` dBm, `zone`.
Los que falten no se usan. Un nodo sin datos durante 30 s pasa a "SIN DATOS" (`WISENSE_STALE_S` lo cambia).

## 4. Firmware del ESP32

`firmware/esp32_wisense/esp32_wisense.ino` (Arduino IDE, placa ESP32). En cada nodo cambiar:

- `NODE_ID` y `NODE_ZONE` (esp32-01 pieza · esp32-02 living · esp32-03 cocina),
- `WIFI_SSID` y `WIFI_PASS`,
- `SERVER_URL` con la IP de la computadora donde corre el servidor.

La función `readSensor()` es el único lugar que hay que adaptar al sensor de cada nodo (radar de respiración, sensor de presencia, oxímetro). Mientras no haya sensor, manda movimiento aproximado por RSSI para probar la conectividad.

## 5. Conectar el MCP a Claude

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "wisense": {
      "command": "node",
      "args": ["/RUTA/A/Wi-Sense/server/wisense-mcp.mjs"],
      "env": { "WISENSE_URL": "http://127.0.0.1:8787" }
    }
  }
}
```

Claude Code:

```bash
claude mcp add wisense -e WISENSE_URL=http://127.0.0.1:8787 -- node /RUTA/A/Wi-Sense/server/wisense-mcp.mjs
```

Herramientas que expone:

| Herramienta | Qué devuelve |
|---|---|
| `wisense_status` | nodos en línea, alarmas, críticos |
| `wisense_nodes` | última lectura y riesgo de cada ESP32 |
| `wisense_vitals` | mín/máx/promedio de un nodo en N minutos (y muestras si se piden) |
| `wisense_alerts` | últimas alarmas con factores y notificados |
| `wisense_patient_summary` | ubicación probable, estado por nodo, tendencias |
| `wisense_set_scenario` | simular `normal`, `deterioro`, `evento`, `caida` u `off` en un nodo (pruebas) |

Recursos: `wisense://state` y `wisense://alerts`.

Prueba rápida por consola:

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"wisense_status","arguments":{}}}' \
  | node server/wisense-mcp.mjs
```

## 6. Dashboard: modos

- Abierto desde el servidor (`http://…:8787`): **en vivo**, muestra los nodos de `nodes.json`.
- Abierto como archivo o publicado en la web: **simulación** de los mismos 3 nodos. Con `?api=http://IP:8787` intenta conectarse a un servidor de la red (solo funciona desde `http`, no desde `https`).
- Con `?modo=demo`: la demo original de 6 pacientes.
