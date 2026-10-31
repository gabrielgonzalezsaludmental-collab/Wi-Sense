# Nota de retoma: investigación CellGenic / GSCG / RMTG

**Última actualización:** 31 de octubre de 2026
**Rama:** `claude/kind-mccarthy-63mh1o` · **PR:** gabrielgonzalezsaludmental-collab/Wi-Sense#1 (listo para revisión, sin conflictos, sin CI en el repo)

## Archivos

| Archivo | Contenido | Estado |
|---|---|---|
| `informe_cellgenic_rmtg.md` | Informe de investigación en cinco partes y 29 secciones: estructura corporativa, finanzas SEC, personas, productos, historial regulatorio, domicilios, eventos, difusión, habilitaciones por jurisdicción, análisis del catálogo y la lista de precios, transcripción y análisis de los tres audios del vendedor. | Completo al 31/10/2026 |
| `informe_legal_cellgenic_argentina.md` | Dictamen preliminar: calificación de los productos, situación de la empresa (societaria, sanitaria, publicitaria, penal, civil), esquema de "receta magistral", escenarios de exposición del médico, prueba, vías de actuación, recaudos, normas citadas. | Completo; con puntos marcados "[verificar]" para un abogado |
| `NOTAS_RETOMA_cellgenic.md` | Esta nota. | — |

Material de origen que **no** está en el repositorio (quedó solo en la sesión y en el dispositivo del Dr. González): catálogo 2026 (PDF, 44 páginas), lista de precios V1.0 septiembre 2026 (PDF, 7 páginas) y tres notas de voz de WhatsApp del 31/10/2026 (10:47:41, 10:47:42, 11:18:55). Se excluyeron por confidencialidad y por ser comunicaciones privadas. Si se retoma en otra sesión, volver a subirlos.

## Hallazgos que ordenan todo lo demás

1. El vendedor admitió en audio que péptidos, exosomas y células no tienen registro de ANMAT, y describió el esquema de "receta magistral" con el que operan "únicamente en Argentina".
2. Afirmó tener un "laboratorio en Buenos Aires con todas las habilitaciones, incluyendo ANMAT". No hay rastro público de entidad, CUIT, domicilio ni habilitación.
3. El catálogo rotula los viales "Physician Use Only" y da indicaciones, vías y dosis; la lista de precios dice "Research Use Only". El vendedor dosifica tirzepatida por tipo de paciente y propone viales de 60 mg compartidos entre pacientes.
4. RMTG: sociedad de Nevada, pérdida de US$ 7,8 M en 2025, déficit acumulado de US$ 76 M, deuda en mora, going concern, capitalización menor a US$ 1 M, un solo directivo, familiares del fundador como consultores.
5. Única dirección documentada: 433 Plaza Real, Suite 275, Boca Raton, FL (10-K). Sede operativa: Datran Center, 9100 S. Dadeland Blvd., Suite 1500, Miami. Clínica en Cancún con dos direcciones; laboratorio de Cancún sin dirección publicada (alquiler 2025 de 120 m² a US$ 10.000/mes según el 10-K).

## Pendientes de verificación (no accesibles desde la sesión por la política de red)

- Item 3 (procedimientos legales) e Item 12 (tenencia accionaria) del 10-K 2025 en sec.gov.
- Padrón CENATRA/COFEPRIS de bancos de células en Quintana Roo (datos.gob.mx).
- Titular de las marcas CELLGENIC ante USPTO (series 99343222 y 99343235) y marcas en IMPI.
- Registro de establecimientos FDA (HCT/P) y base de cartas de advertencia.
- Calificación y quejas en BBB; registros de Nevada.
- Texto consolidado de: Ley 17.132 art. 20 (numeración de incisos), Ley 27.447 (artículos sobre intermediación lucrativa en células), Código Aduanero art. 865 (incisos), Resolución MS 1814/2015 (anexo vigente), registro local de la marca "GoQuick", vigencia de patentes de tirzepatida y semaglutida en el INPI.
- Declaración original de Liquilabs sobre el certificado de análisis de Cellgenic (nootroholic.com bloqueado).
- Resolución de la Facultad de Medicina de la UBA que habría "declarado de interés" el congreso ISSCA 124.

Para destrabar desde una sesión en la nube: habilitar sec.gov, datos.gob.mx, cenatra.salud.gob.mx, tsdrapi.uspto.gov, bbb.org, search.sunbiz.org, nootroholic.com e infoleg.gob.ar en la configuración de red del entorno.

## Preguntas abiertas al vendedor (formular por escrito, conservar respuestas)

1. Razón social, CUIT y domicilio del "laboratorio en Buenos Aires"; número de disposición de habilitación (jurisdiccional y ANMAT) y nombre y matrícula del director técnico farmacéutico.
2. Razón social que factura, país de origen del péptido y fabricante real.
3. Nombre completo, dirección y número de acreditación ISO 17025 de "Oracle" y "Vanguard", y certificado externo con espectrometría de masas del lote de tirzepatida que se enviaría.
4. Número de registro ANMAT de cada producto ofrecido.
5. Confirmación escrita de si los productos son para uso humano.

## Próximos pasos sugeridos

1. Constatación notarial de los PDF y los tres audios (número emisor, fecha, hora, contenido).
2. Presentación ante ANMAT (pesquisa@anmat.gob.ar y formulario del Programa de Pesquisa de Medicamentos Ilegítimos), con copia al INCUCAI por los productos celulares.
3. Revisión del dictamen por un abogado, en particular los puntos "[verificar]".
4. Si hace falta tirzepatida en un paciente: Mounjaro con receta, consentimiento informado y bibliografía en la historia clínica.

## Cómo se transcribieron los audios

Localmente, sin servicios externos: ffmpeg a WAV 16 kHz, detector de voz Silero y Whisper (modelos base y small en ONNX vía sherpa-onnx, descargados de los releases de GitHub de k2-fsa/sherpa-onnx). Script en `/tmp/scripts/transcribe.py` de la sesión (no versionado).
