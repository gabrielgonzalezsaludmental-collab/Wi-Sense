#!/usr/bin/env bash
# Wi-Sense · instalador para Linux (sin sudo, sin git)
#   bash <(curl -fsSL https://raw.githubusercontent.com/gabrielgonzalezsaludmental-collab/Wi-Sense/claude/amazing-edison-l2r1zk/instalar.sh)
# Qué hace: 1) instala Node 22 en ~/.local/opt/node si falta o es viejo, 2) descarga el proyecto en ~/Wi-Sense,
#           3) crea ~/Wi-Sense/arrancar.sh y 4) arranca el servidor (http://127.0.0.1:8787).
# Variables opcionales: WISENSE_DIR (carpeta destino), WISENSE_RAMA (rama de GitHub), WISENSE_NO_ARRANCAR=1 (no arrancar al final).
set -euo pipefail

REPO="gabrielgonzalezsaludmental-collab/Wi-Sense"
RAMA="${WISENSE_RAMA:-claude/amazing-edison-l2r1zk}"
DESTINO="${WISENSE_DIR:-$HOME/Wi-Sense}"
NODE_DIR="$HOME/.local/opt/node"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

paso() { printf '\n\033[1;36m== %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
falla(){ printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v curl >/dev/null 2>&1 || falla "falta curl (instalalo con: sudo apt install curl) y volvé a correr este instalador"
command -v tar  >/dev/null 2>&1 || falla "falta tar"

# ---------- 1. Node ----------
paso "Node"
node_ok=0
if command -v node >/dev/null 2>&1; then
  mayor="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
  [ "$mayor" -ge 18 ] && node_ok=1
fi
if [ "$node_ok" = 0 ] && [ -x "$NODE_DIR/bin/node" ]; then
  export PATH="$NODE_DIR/bin:$PATH"; node_ok=1
fi
if [ "$node_ok" = 0 ]; then
  echo "Node no está instalado o es anterior a la versión 18. Instalo Node 22 en $NODE_DIR (sin sudo)…"
  case "$(uname -m)" in
    x86_64) narch=x64 ;;
    aarch64|arm64) narch=arm64 ;;
    *) falla "arquitectura no soportada: $(uname -m)" ;;
  esac
  archivo="$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | grep -o "node-v22[0-9.]*-linux-${narch}\.tar\.xz" | head -1)"
  [ -n "$archivo" ] || falla "no pude determinar la versión de Node a descargar"
  echo "Descargando $archivo…"
  curl -fL --progress-bar "https://nodejs.org/dist/latest-v22.x/$archivo" -o "$TMP/$archivo"
  mkdir -p "$HOME/.local/opt"
  tar -xJf "$TMP/$archivo" -C "$TMP"
  rm -rf "$NODE_DIR"
  mv "$TMP/${archivo%.tar.xz}" "$NODE_DIR"
  export PATH="$NODE_DIR/bin:$PATH"
  for rc in "$HOME/.bashrc" "$HOME/.profile"; do
    [ -f "$rc" ] && ! grep -q '.local/opt/node/bin' "$rc" && printf '\n# Node para Wi-Sense\nexport PATH="$HOME/.local/opt/node/bin:$PATH"\n' >> "$rc"
  done
fi
ok "Node $(node --version) en $(command -v node)"

# ---------- 2. Proyecto ----------
paso "Proyecto Wi-Sense → $DESTINO"
curl -fL --progress-bar "https://github.com/$REPO/archive/refs/heads/$RAMA.tar.gz" -o "$TMP/wisense.tgz"
mkdir -p "$DESTINO"
tar -xzf "$TMP/wisense.tgz" -C "$DESTINO" --strip-components=1
[ -f "$DESTINO/server/wisense-server.mjs" ] || falla "la descarga no trajo server/wisense-server.mjs"
node --check "$DESTINO/server/wisense-server.mjs"
node --check "$DESTINO/server/wisense-mcp.mjs"
ok "proyecto descargado (rama $RAMA)"

# ---------- 3. Script de arranque ----------
cat > "$DESTINO/arrancar.sh" <<EOT
#!/usr/bin/env bash
# Arranca el servidor Wi-Sense (dashboard en vivo + API para los ESP32 y el MCP)
export PATH="$NODE_DIR/bin:\$PATH"
cd "$DESTINO"
exec node server/wisense-server.mjs
EOT
chmod +x "$DESTINO/arrancar.sh"
ok "creado $DESTINO/arrancar.sh"

# ---------- 4. Datos útiles ----------
paso "Datos para los ESP32 y el MCP"
ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "IP de esta PC en la red: ${ip:-no detectada}"
echo "SERVER_URL para el sketch del ESP32: http://${ip:-IP-DE-ESTA-PC}:8787/ingest"
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q '^Status: active'; then
  echo "Firewall ufw activo: para que los ESP32 lleguen, ejecutá:  sudo ufw allow 8787/tcp"
fi
echo "MCP para Claude Code:  claude mcp add wisense -e WISENSE_URL=http://127.0.0.1:8787 -- $(command -v node) $DESTINO/server/wisense-mcp.mjs"
echo "Dashboard: http://127.0.0.1:8787   (en otro dispositivo de la casa: http://${ip:-IP}:8787)"
echo "Volver a arrancar más tarde: $DESTINO/arrancar.sh"

if [ "${WISENSE_NO_ARRANCAR:-0}" = "1" ]; then ok "instalación lista (no se arranca el servidor)"; exit 0; fi
paso "Arrancando el servidor (Ctrl+C para detenerlo)"
exec "$DESTINO/arrancar.sh"
