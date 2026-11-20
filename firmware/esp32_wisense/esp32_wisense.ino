// Wi-Sense · nodo ESP32 · envía lecturas al servidor local por HTTP
// Placa: ESP32 (Arduino core 2.x o 3.x). Sin librerías externas: WiFi.h y HTTPClient.h vienen con el core.
// Un sketch por ESP32: cambiar NODE_ID y NODE_ZONE en cada uno (esp32-01 pieza, esp32-02 living, esp32-03 cocina).

#include <WiFi.h>
#include <HTTPClient.h>

// ===== Configuración del nodo =====
#define NODE_ID     "esp32-01"
#define NODE_ZONE   "pieza"
#define WIFI_SSID   "TU_WIFI"
#define WIFI_PASS   "TU_CLAVE"
#define SERVER_URL  "http://192.168.1.50:8787/ingest"   // IP de la computadora donde corre: node server/wisense-server.mjs
#define PERIOD_MS   2000                                 // cada cuánto envía (ms)

struct Reading { float hr; float rr; float spo2; float mov; bool presence; bool fall; };

// ===== Lectura del sensor =====
// Reemplazá el cuerpo de esta función por la lectura real del sensor que tenga cada nodo:
//   - Radar mmWave de respiración / frecuencia cardíaca (p. ej. Seeed MR60BHA1) por Serial2 → hr, rr, presence.
//   - Sensor de presencia y movimiento (p. ej. HLK-LD2410C) por Serial2 → presence, mov.
//   - Oxímetro MAX30102 por I2C → hr, spo2.
// Convención: un valor en -1 significa "no disponible" y no se envía; el servidor no lo usa para el riesgo.
Reading readSensor() {
  Reading r;
  r.hr = -1; r.rr = -1; r.spo2 = -1; r.mov = -1; r.presence = true; r.fall = false;
  // Mientras no haya sensor: movimiento aproximado por variación del RSSI, solo para probar la conectividad.
  static long lastRssi = 0;
  long rssi = WiFi.RSSI();
  r.mov = constrain(fabs((float)(rssi - lastRssi)) / 20.0f, 0.0f, 1.0f);
  lastRssi = rssi;
  return r;
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando a Wi-Fi");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) { delay(500); Serial.print("."); }
  if (WiFi.status() == WL_CONNECTED) { Serial.print(" OK "); Serial.println(WiFi.localIP()); }
  else Serial.println(" sin conexión, reintento en el próximo ciclo");
}

String toJson(const Reading& r) {
  String s = "{\"node\":\"" NODE_ID "\",\"zone\":\"" NODE_ZONE "\"";
  if (r.hr >= 0)   s += ",\"hr\":"   + String(r.hr, 1);
  if (r.rr >= 0)   s += ",\"rr\":"   + String(r.rr, 1);
  if (r.spo2 >= 0) s += ",\"spo2\":" + String(r.spo2, 1);
  if (r.mov >= 0)  s += ",\"mov\":"  + String(r.mov, 2);
  s += ",\"presence\":"; s += (r.presence ? "true" : "false");
  s += ",\"fall\":";     s += (r.fall ? "true" : "false");
  s += ",\"rssi\":" + String(WiFi.RSSI());
  s += "}";
  return s;
}

void setup() {
  Serial.begin(115200);
  delay(200);
  connectWifi();
}

void loop() {
  connectWifi();
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(3000);
    String body = toJson(readSensor());
    int code = http.POST(body);
    Serial.printf("[%s] POST %d  %s\n", NODE_ID, code, body.c_str());
    http.end();
  }
  delay(PERIOD_MS);
}
