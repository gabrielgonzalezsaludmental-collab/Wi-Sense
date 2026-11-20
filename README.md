# Wi-Sense

Monitoreo domiciliario pasivo por Wi-Fi para personas mayores o con enfermedades crónicas. Sin cámaras, sin wearables, sin botones. Este repositorio contiene el sitio público, el demo interactivo y el asistente de IA para el operador.

## Estructura

```
public/                 Sitio estático (se publica tal cual)
  index.html            Landing: propuesta de valor, comparativa, planes, formulario de piloto
  demo.html             Demo interactivo del panel del operador: simulación, registro persistente
                        con exportación e importación, tendencias, informe imprimible y asistente de IA.
                        Es un solo archivo (HTML + CSS + JS) sin dependencias.
  gracias.html          Confirmación del formulario
  assets/styles.css     Estilos de la landing
netlify/functions/
  asistente.mjs         Función serverless que llama a Claude. Expone POST /api/asistente
docs/ESTRATEGIA.md      Análisis de mercado, competencia, regulación y hoja de ruta
netlify.toml            Configuración de despliegue
```

## Ver el sitio localmente

```bash
npm run dev
```

Abre http://localhost:8080. El asistente responde con el motor local porque la función serverless no corre en este modo.

## Desplegar en Netlify con el asistente de IA

1. Conectá el repositorio en Netlify. La configuración se lee de `netlify.toml`.
2. En Site configuration, Environment variables, agregá `ANTHROPIC_API_KEY`.
3. Deploy. El formulario de contacto queda activo automáticamente con Netlify Forms.

Para probar la función en local con Netlify CLI:

```bash
npm install
npx netlify dev
```

## Verificación rápida

```bash
npm run check
```

## Aviso

Wi-Sense es un sistema de apoyo y alerta temprana en desarrollo. No es un dispositivo médico certificado ni reemplaza la atención médica o un servicio de emergencias. Ante una emergencia llamá al 107 o al 911.
