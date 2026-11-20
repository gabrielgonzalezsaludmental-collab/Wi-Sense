# Wi-Sense · Estrategia, competencia y hoja de ruta

Documento de trabajo. Fecha: noviembre de 2026. Autor: equipo Wi-Sense con apoyo de Claude.

## 1. Resumen ejecutivo

Wi-Sense es un sistema de monitoreo domiciliario pasivo. Usa las variaciones de la señal Wi-Fi del hogar para estimar respiración, ritmo cardíaco, movimiento, zona de la casa, sueño y caídas, sin cámaras ni dispositivos que la persona deba llevar puestos. Un motor de riesgo compara cada valor con la línea de base individual, anticipa deterioros y dispara alertas escalonadas a familiares, a un operador y al SAME 107. Un asistente de IA construido sobre Claude ayuda al operador a interpretar, priorizar y comunicar.

El mercado argentino de teleasistencia es hoy casi exclusivamente de botón de pánico. Ningún actor local ofrece sensado pasivo con signos vitales y predicción. Las alternativas internacionales con sensado sin contacto son caras, cubren una sola habitación por dispositivo o dependen de video. Esa brecha es la oportunidad.

El riesgo principal no es comercial sino técnico: la tasa de falsas alarmas y la precisión de los signos vitales en condiciones reales. Por eso la hoja de ruta pone la validación clínica antes del lanzamiento comercial.

## 2. Propuesta de valor

| Para | Dolor actual | Qué resuelve Wi-Sense |
|---|---|---|
| Familias con padres que viven solos | El botón de pánico no sirve en una caída con pérdida de conciencia. Las cámaras invaden. Los relojes se quedan sin batería o se los sacan. | Detección sin acción de la persona, sin imagen ni audio, con aviso directo al celular. |
| Residencias geriátricas | Rondas nocturnas cada 2 horas. Caídas descubiertas tarde. Personal escaso. | Un panel con todas las habitaciones, priorizado por riesgo, con registro de eventos. |
| Prepagas y obras sociales | Internaciones evitables y reinternaciones a 30 días del alta. | Señales tempranas de descompensación y un programa post alta con datos objetivos. |
| Profesionales de salud | Entre consultas no hay datos. En salud mental, el aislamiento y los cambios de sueño son invisibles. | Patrones de sueño, actividad y aislamiento como señales objetivas, con consentimiento. |

## 3. Mercado

Datos públicos recientes para Argentina:

| Dato | Valor | Fuente |
|---|---|---|
| Personas de 65 años o más | 5.373.423 en 2022, desde 4.097.093 en 2010 | Censo 2022, INDEC, citado por Mercado |
| Proyección 2025 | 12,7 % de la población, cerca de 8 millones si se cuenta desde 60 años | Universidad Austral, estimación |
| Mayores que viven solos en CABA | Casi 40 % de los residentes en hogares particulares | Dirección General de Estadística y Censos de la Ciudad |
| Mayores que viven solos en Rosario | Unos 40.000, el 30 % de los mayores de 65 | Diario La Capital |
| Vivienda | 84 % de los adultos mayores vive en casas | Fundación Tejido Urbano |
| Posición regional | Argentina entre los tres países más envejecidos de América Latina | UCA, Observatorio de la Deuda Social |

Estimación conservadora de mercado direccionable: si el 30 % de los mayores de 65 vive solo, son unas 1,6 millones de personas. Con una penetración del 1 % a USD 29 por mes, el ingreso anual sería de unos USD 5,6 millones solo en el segmento hogar. El segmento institucional y el de prepagas se suman a eso.

No encontramos un conteo nacional oficial de residencias geriátricas. Es un dato a relevar con el Ministerio de Salud y las direcciones provinciales de fiscalización.

## 4. Competencia

### 4.1 Argentina

| Actor | Qué ofrece | Precio público | Limitación frente a Wi-Sense |
|---|---|---|---|
| CallCare, Cruz Roja Argentina | Teleasistencia con botón de pánico en app, operadores 24 h | Plan Premium ARS 30.127 por mes, primer mes gratis, fecha de la tarifa no indicada | Requiere que la persona apriete el botón. Sin signos vitales ni caídas. |
| URG Conecta, Grupo OSDE | Botón de pánico y asistencia, lanzado en Córdoba y Rosario | No publicado | Muestra que una prepaga grande ya invierte en el segmento. Es socio potencial, no solo competidor. |
| NBS Seguros | Seguro con componentes de teleasistencia | Desde ARS 12.000 por mes, dato de unos dos años | Mismo modelo de botón. |
| Referencia BID | Teleasistencia privada en Argentina | Unos USD 27 por mes | Marca el precio de referencia que el mercado ya acepta. |

### 4.2 Internacional

| Actor | Tecnología | Precio público | Comparación |
|---|---|---|---|
| Medical Guardian, EE. UU. | Botón y pulsera con detección de caídas | USD 27,45 a 50 por mes más equipo de USD 150 a 200 | Requiere llevar el dispositivo. Sin signos vitales continuos. |
| CarePredict | Pulsera con IA para residencias y hogar | USD 499 más USD 69,99 por mes | Cara. Depende de la adherencia al wearable. |
| Vayyar Care, Israel | Radar por habitación, sin cámara | Unos USD 240 por sensor más suscripción Alexa Together de USD 20 por mes; típicamente 3 sensores por casa | Buena privacidad, pero un dispositivo por ambiente y sin signos vitales completos ni predicción. |
| Origin Wireless y Hex Home | Wi-Fi sensing, licenciado a terceros | No publica precio al consumidor | El competidor tecnológico más directo. No tiene presencia en América Latina ni foco clínico. |
| SafelyYou | Cámaras con IA en residencias de memoria | Solo institucional | Video: inaceptable para el hogar. |
| Aloe Care, Lively | Hubs con botón y voz | USD 20 a 60 por mes según guías de 2026 | Dependen de la acción de la persona. |

### 4.3 Posicionamiento

Wi-Sense es la única propuesta en América Latina que combina sensado pasivo de toda la casa, signos vitales sin contacto, predicción de deterioro y un asistente de IA para el operador, con precio dentro del rango que el mercado local ya paga por un botón de pánico.

## 5. Evidencia técnica y riesgos

- Un estudio con sensado CSI por Wi-Fi en personas mayores en cuidado validó dos mediciones cardiorrespiratorias contra una faja respiratoria y un fotopletismógrafo, en 2025. Es la evidencia más cercana a nuestro caso de uso.
- Un sistema temprano de detección de caídas por Wi-Fi reportó 87 % de detección con 18 % de falsas alarmas. Trabajos posteriores reportan hasta 98 % en laboratorio.
- El estándar IEEE 802.11bf de sensado por WLAN ya está formalizado, lo que anticipa routers comerciales con esta capacidad. Eso baja el costo de hardware a mediano plazo, pero también baja la barrera de entrada para competidores.
- Los wearables tienen baja adherencia en personas mayores y problemas de batería. Es el argumento central a favor del sensado pasivo.

Riesgos y mitigación:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Falsas alarmas altas | Fatiga del operador, abandono del servicio | Piloto que mida sensibilidad y especificidad por tipo de evento. Umbral de alerta ajustable por persona. Confirmación humana antes del 107. |
| Precisión de signos vitales con varias personas o mascotas | Lecturas erróneas | Modo multi persona explícito. Declarar la limitación. Validar con dos personas en el piloto. |
| Regulación | Retraso del lanzamiento | Lanzar como sistema de apoyo y bienestar, no como diagnóstico. Preparar expediente SaMD en paralelo. |
| Entrada de un router con 802.11bf | Competencia de bajo costo | Diferenciarse por el modelo clínico, el operador, la integración con el SAME y las prepagas, no por el hardware. |

## 6. Marco regulatorio y legal en Argentina

- Software como dispositivo médico: la Disposición ANMAT 64/2025 incorporó la Resolución GMC MERCOSUR 25/2021, que define el software con finalidad médica y lo somete a clasificación por riesgo, registro y vigilancia poscomercialización.
- Tecnovigilancia: la Disposición 8194/2023 fija requisitos obligatorios para titulares de registro.
- Simplificación: las Disposiciones 4446/2025, 8799/2025 y 236/2026 introdujeron regímenes simplificados de habilitación y registro.
- Datos personales: la Ley 25.326 clasifica los datos de salud como sensibles. Se requiere consentimiento informado, finalidad explícita, medidas de seguridad y derecho de acceso y supresión.
- Derechos del paciente: la Ley 26.529 regula la historia clínica y el consentimiento informado.
- Salud mental: la Ley 26.657 es relevante si el producto se usa para seguimiento de pacientes psiquiátricos, en especial sobre autonomía y consentimiento.

Camino propuesto: etapa 1 como sistema de apoyo y alerta temprana sin pretensión diagnóstica, con disclaimers claros. Etapa 2, tras la validación clínica, registro como SaMD de clase II. Un abogado especializado en productos médicos debe revisar el expediente. Verificar los textos oficiales en el Boletín Oficial antes de cualquier decisión.

## 7. Modelo de negocio

| Segmento | Precio orientativo | Costo estimado | Margen bruto estimado |
|---|---|---|---|
| Hogar | USD 29 por mes, sensor en comodato | Hardware USD 40 a 60 amortizado en 24 meses, operador compartido, IA | 55 a 65 % |
| Residencia | USD 12 por cama por mes | Un sensor por habitación, panel compartido | 60 a 70 % |
| Prepaga | A convenir, por afiliado de riesgo | Integración y reportes | 50 a 60 % |

Costo del asistente de IA: con el modelo por defecto, una consulta típica del operador consume unos 1.500 tokens de entrada y 150 de salida. Con caché del prompt de sistema, el costo por consulta es de fracciones de centavo de dólar. Un operador que hace 200 consultas por día cuesta menos de USD 10 por mes.

## 8. Hoja de ruta

| Fase | Duración | Entregable | Métrica de salida |
|---|---|---|---|
| 0. Sitio y demo | Hecho | Landing, demo interactivo, asistente de IA, captura de leads | 50 leads calificados |
| 1. Prototipo de hardware | 3 meses | Sensor con radio Wi-Fi y extracción de CSI, inferencia local de respiración y movimiento | Respiración con error menor a 2 rpm contra faja |
| 2. Piloto en 20 hogares y 3 residencias | 4 meses | Medición de sensibilidad y falsas alarmas, UX del operador, consentimientos | Falsas alarmas por debajo de 1 por semana por hogar |
| 3. Validación clínica | 6 meses | Estudio con hospital o universidad, protocolo registrado | Publicación o informe auditable |
| 4. Registro ANMAT y lanzamiento | 6 meses | Expediente SaMD, acuerdo con una prepaga | Primer contrato B2B |

Hardware sugerido para la fase 1: módulos con acceso a CSI de 802.11n y una placa de cómputo de borde con aceleración para inferencia. Explorar también routers con 802.11bf a medida que lleguen al mercado.

## 9. Asistente de IA

Qué hace hoy en el demo: lee el estado de todos los hogares y responde preguntas del operador con un motor local basado en reglas o, si el sitio está desplegado en Netlify con la clave de API configurada, con Claude.

Diseño de seguridad:

- La clave de API nunca viaja al navegador. Vive en una función serverless.
- El prompt de sistema es fijo y está cacheado. El cliente solo envía historial y una foto del estado.
- Nunca diagnostica ni indica medicación. Toda alerta crítica la confirma una persona.
- En producción, el estado enviado a la nube debe estar seudonimizado y amparado por consentimiento. Para datos identificables, evaluar un acuerdo de procesamiento de datos con el proveedor o inferencia local.

Próximos pasos de IA: resumen automático de turno para el operador saliente, detección de patrones semanales de sueño y aislamiento para el profesional tratante, y respuestas por WhatsApp a familiares con confirmación humana.

## 10. Sitio web y marketing

Hecho en esta entrega:

- Landing con propuesta de valor, problema con datos, cómo funciona, funciones, segmentos, comparativa, IA, planes, preguntas frecuentes y formulario de piloto.
- Demo interactivo con escenarios, pausa, reinicio, accesibilidad básica y asistente de IA.
- Función serverless lista para Netlify, con configuración y variables de entorno documentadas.

Pendiente para lanzar:

1. Desplegar en Netlify y configurar ANTHROPIC_API_KEY.
2. Dominio propio, por ejemplo wisense.com.ar, con certificado automático.
3. Analítica de privacidad respetuosa, por ejemplo Plausible o Umami.
4. Página de política de privacidad y términos, revisadas por un abogado.
5. Contenido: tres artículos sobre caídas en personas mayores, vivir solo y tecnología sin cámaras, orientados a búsquedas de hijos adultos.
6. Canal de WhatsApp Business para el piloto.
7. Un video de 60 segundos con la simulación.

## 11. Indicadores a seguir

| Indicador | Meta a 6 meses |
|---|---|
| Leads calificados por mes | 30 |
| Hogares en piloto | 20 |
| Falsas alarmas por hogar por semana | menos de 1 |
| Sensibilidad de detección de caídas en piloto | mayor a 90 % |
| Tiempo desde alerta crítica hasta contacto humano | menor a 3 minutos |
| Costo de IA por operador por mes | menor a USD 10 |

## 12. Fuentes

- Censo y envejecimiento: https://mercado.com.ar/informes-especiales/el-crecimiento-de-la-poblacion-adulta-mayor-redefine-la-situacion-habitacional-en-argentina
- Proyección 2025: https://www.austral.edu.ar/wp-content/uploads/2025/05/2025-Familia-Argentina.V8.pdf
- CABA, mayores que viven solos: https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/09/ir_2025_1979.pdf
- Rosario: https://www.lacapital.com.ar/la-ciudad/en-rosario-hay-40-mil-adultos-mayores-que-viven-solos-n10272829.html
- UCA, envejecimiento regional: https://repositorio.uca.edu.ar/bitstream/123456789/18958/1/desafios-oportunidades-envejecimiento.pdf
- CallCare: http://www.callcare.com.ar/
- URG Conecta OSDE: https://radiovillamaria.com.ar/nota-186666/grupo-osde-lanza-un-servicio-de-asistencia-inteligente-para-adultos-mayores
- NBS: https://nbs.ar/nuevas-cobertura-de-seguros-y-teleasistencia-para-adultos-mayores/
- BID, teleasistencia: https://publications.iadb.org/publications/spanish/document/Teleasistencia-innovaciones-tecnologicas-para-el-cuidado-de-personas-a-distancia.pdf
- Precios de monitoreo 2026: https://odecare.com/blog/elderly-monitoring-system-cost
- Vayyar Care: https://millennialhawk.com/vayyar-fall-detection-review/ y https://www.calcalistech.com/ctechnews/article/rj0cnyqiq
- Origin Wireless: https://originwirelessai.com/insights/a-non-wearable-approach-to-elderly-monitoring-the-value-and-benefits
- Validación CSI en mayores, 2025: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12599888/
- Detección de caídas por Wi-Fi, revisión: https://www.sciencedirect.com/science/article/abs/pii/S0263224124000708
- IEEE 802.11bf: https://arxiv.org/pdf/2207.04859 y https://en.wikipedia.org/wiki/WiFi_Sensing
- ANMAT y SaMD: https://www.allende.com/life-sciences/inteligencia-artificial-y-software-medico-en-argentina-desafios-regulatorios-para-el-regimen-de-productos-medicos-08-26-2026/
- Disposición ANMAT 9688/2019: https://www.argentina.gob.ar/normativa/nacional/norma-332646/texto
