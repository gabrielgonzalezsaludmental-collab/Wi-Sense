# Nota de retoma: investigación CellGenic / GSCG / RMTG

**Última actualización:** 2 de noviembre de 2026 (tercera edición: adenda sobre el manual de protocolos y el formulario de receta, informe de opinión; entregables regenerados, versión 1.1)
**Rama:** `claude/kind-mccarthy-63mh1o` · **PR:** gabrielgonzalezsaludmental-collab/Wi-Sense#1 (listo para revisión, sin conflictos, sin CI en el repo). Los commits posteriores al 31/10/2026 están solo en el clon local hasta que se autorice el `git push`.

## Archivos

| Archivo | Contenido | Estado |
|---|---|---|
| `informe_cellgenic_rmtg.md` | Informe de investigación en siete partes y 42 secciones: estructura corporativa, finanzas SEC, personas, productos, historial regulatorio, domicilios, eventos, difusión, habilitaciones por jurisdicción, análisis del catálogo y la lista de precios, transcripción y análisis de los tres audios, autoevaluación (Parte VI) y adenda del 2/11/2026 sobre el manual de protocolos y el formulario de receta (Parte VII). | Completo al 2/11/2026 |
| `informe_legal_cellgenic_argentina.md` | Dictamen preliminar (secciones I a XIV): calificación de los productos, situación de la empresa, esquema de "receta magistral", escenarios del médico, prueba, vías de actuación, estrategia ordenada (XII), autoevaluación (XIII) y adenda bajo derecho argentino sobre el manual y el formulario, con ajuste de la estrategia (XIV). | Completo; con puntos marcados "[verificar]" para un abogado |
| `opinion_cellgenic.md` | Opinión personal del analista (2/11/2026): qué pienso de la empresa, de los productos, de la situación legal y qué haría en el lugar del Dr. González, con grado de convicción y dónde puedo estar equivocado. | Completo |
| `NOTAS_RETOMA_cellgenic.md` | Esta nota. | — |
| `entregables/Opinion_Analista_CellGenic_2026-11-02.pdf` y `.docx` | Informe de opinión con diseño corporativo (6 páginas). | Generado el 2/11/2026 |
| `entregables/Dossier_CellGenic_Argentina_2026-11-02.pdf` y `.docx` | Dossier integral con diseño corporativo: Parte A dictamen jurídico, Parte B informe de investigación. | Generado el 2/11/2026 (reemplaza la edición del 31/10, que queda en el historial de git) |
| `entregables/Dictamen_Legal_CellGenic_Argentina_2026-11-02.pdf` y `.docx` | Dictamen jurídico solo. | Generado el 2/11/2026 |
| `entregables/Informe_Investigacion_CellGenic_2026-11-02.pdf` y `.docx` | Informe de investigación solo. | Generado el 2/11/2026 |
| `herramientas/docs/` | Plantilla corporativa (`style.css`, `cover.html`, `template.html`), renderizador Chromium (`render_pdf.js`) y constructor (`build_docs.py`). Regenerar todo con `python3 herramientas/docs/build_docs.py`; la fecha y el sufijo de los archivos se fijan en `DATE` y `SLUG`. | — |

Material de origen que **no** está en el repositorio (quedó solo en la sesión y en el dispositivo del Dr. González): catálogo 2026 (PDF, 44 páginas), lista de precios V1.0 septiembre 2026 (PDF, 7 páginas), tres notas de voz de WhatsApp del 31/10/2026 (10:47:41, 10:47:42, 11:18:55), el manual "Protocolos ISSCA – Cellgenic" (PDF, 99 páginas, recibido el 2/11/2026) y el formulario "Receta para péptidos" completado (PDF, 1 página, recibido el 2/11/2026). Se excluyeron por confidencialidad y por ser comunicaciones privadas. **El formulario contiene nombre, DNI, edad y diagnóstico de un paciente y la matrícula de un médico: no debe subirse al repositorio ni circular sin tachar; en los informes está anonimizado.** Si se retoma en otra sesión, volver a subir los archivos.

## Diseño corporativo

Los entregables usan una identidad derivada de la paleta del proyecto Wi-Sense (azul marino `#0c3a5f`, celeste `#3ba9ff`, verde azulado `#22d3a8`, fondo de portada `#0a0e1a`), tipografía Inter en PDF y Arial en Word. No se pudo acceder al proyecto de Claude Design desde la sesión en la nube (requiere `/design-login` interactivo); si se comparte con "Send to Claude Code Web", se pueden reemplazar los tokens en `style.css` y en `build_docs.py` y regenerar. En Word, el índice y la numeración total de páginas se completan al abrir el archivo (campos con actualización automática).

## Hallazgos que ordenan todo lo demás

1. El vendedor admitió en audio que péptidos, exosomas y células no tienen registro de ANMAT, y describió el esquema de "receta magistral" con el que operan "únicamente en Argentina".
2. Afirmó tener un "laboratorio en Buenos Aires con todas las habilitaciones, incluyendo ANMAT". No hay rastro público de entidad, CUIT, domicilio ni habilitación.
3. El catálogo rotula los viales "Physician Use Only" y da indicaciones, vías y dosis; la lista de precios dice "Research Use Only". El vendedor dosifica tirzepatida por tipo de paciente y propone viales de 60 mg compartidos entre pacientes.
4. RMTG: sociedad de Nevada, pérdida de US$ 7,8 M en 2025, déficit acumulado de US$ 76 M, deuda en mora, going concern, capitalización menor a US$ 1 M, un solo directivo, familiares del fundador como consultores.
5. Única dirección documentada: 433 Plaza Real, Suite 275, Boca Raton, FL (10-K). Sede operativa: Datran Center, 9100 S. Dadeland Blvd., Suite 1500, Miami. Clínica en Cancún con dos direcciones; laboratorio de Cancún sin dirección publicada.
6. **(2/11)** El manual de 99 páginas "Protocolos ISSCA – Cellgenic" asigna a cada producto dosis, vía, ciclo y jeringa por indicación clínica (tirzepatida 2,5 a 15 mg/semana; retatrutida hasta 12 mg; Selank y Semax nasales para ansiedad, déficit de atención y depresión; Cerebrolisina intravenosa para ictus y Alzheimer; células Muse intratecales), con consentimiento informado, seguimiento del paciente y "cuántos millones comprar". Rotula todo "Research Use Only" o "Uso bajo criterio médico" y su aviso remite a "excepciones señaladas en el manual" que no existen. Es información para prescribir medicamentos sin registro y destruye la defensa de "uso en investigación".
7. **(2/11)** El formulario "Receta para péptidos" (CLGN-MED-RX-PEP-01 Rev 1.2, "en alianza con RegenCell") llegó completado para un paciente real: Selank nasal, 4 pulverizaciones por día, "tratamiento prolongado: sí", diagnóstico "ansiedad hiperactividad", fecha 19/10/2026, firma y matrícula. Prueba que el esquema ya opera en Argentina y que el canal comercial difunde datos de salud de terceros (Ley 25.326). "RegenCell" no pudo identificarse.

## Pendientes de verificación (no accesibles desde la sesión por la política de red)

- Item 3 (procedimientos legales) e Item 12 (tenencia accionaria) del 10-K 2025 en sec.gov.
- Padrón CENATRA/COFEPRIS de bancos de células en Quintana Roo (datos.gob.mx).
- Titular de las marcas CELLGENIC ante USPTO (series 99343222 y 99343235) y marcas en IMPI.
- Registro de establecimientos FDA (HCT/P) y base de cartas de advertencia.
- Calificación y quejas en BBB; registros de Nevada.
- Texto consolidado de: Ley 16.463 art. 19 (literales), Ley 17.132 arts. 19 inc. 7 y 20 (numeración de incisos), Ley 27.447 (artículos sobre intermediación lucrativa en células), Código Aduanero art. 865 (incisos), Código Penal art. 204 quinquies (texto vigente), Resolución MS 627/2007 (vigencia), Resolución MS 1814/2015 (anexo vigente), registro local de la marca "GoQuick", vigencia de patentes de tirzepatida y semaglutida en el INPI.
- Declaración original de Liquilabs sobre el certificado de análisis de Cellgenic (nootroholic.com bloqueado).
- Resolución de la Facultad de Medicina de la UBA que habría "declarado de interés" el congreso ISSCA 124.
- **Identidad de "RegenCell":** IGJ y ARCA por la razón social (pista no confirmada: "Reg Cell Argentina S.A.", CUIT 30-71153775-5, Virrey Loreto 1721, CABA), INPI por la marca, base de establecimientos de ANMAT, registros jurisdiccionales de farmacias y droguerías.

Para destrabar desde una sesión en la nube: habilitar sec.gov, datos.gob.mx, cenatra.salud.gob.mx, tsdrapi.uspto.gov, bbb.org, search.sunbiz.org, nootroholic.com, infoleg.gob.ar, argentina.gob.ar y boletinoficial.gob.ar en la configuración de red del entorno.

## Preguntas abiertas al vendedor (formular por escrito, conservar respuestas)

1. Razón social, CUIT y domicilio del "laboratorio en Buenos Aires"; número de disposición de habilitación (jurisdiccional y ANMAT) y nombre y matrícula del director técnico farmacéutico.
2. Razón social que factura, país de origen del péptido y fabricante real.
3. Nombre completo, dirección y número de acreditación ISO 17025 de "Oracle" y "Vanguard", y certificado externo con espectrometría de masas del lote de tirzepatida que se enviaría.
4. Número de registro ANMAT de cada producto ofrecido.
5. Confirmación escrita de si los productos son para uso humano.
6. Qué es RegenCell (razón social, CUIT, domicilio, habilitación); quién dispensa el producto una vez completado el formulario y desde qué establecimiento.
7. Dónde se aloja el formulario web de receta, quién es el responsable de la base de datos, si está inscripta ante la AAIP y quién accede a los datos de los pacientes.
8. Con qué autorización se envió a un tercero un formulario con nombre, DNI, edad y diagnóstico de un paciente.
9. Quién es el autor del manual y cuáles son las "excepciones señaladas en el manual".
10. Cómo se reconstituye el vial de Cerebrolisina de 60 mg para aplicar las pautas en mililitros de su ficha.

## Estrategia legal recomendada (secciones XII y XIV del dictamen)

Semana 1: constatación notarial de PDF, audios, manual y formulario (el formulario íntegro queda en el protocolo del escribano; en copias circula tachado), con captura del chat que acredite remitente, fecha y hora; preguntas 1 a 10 por escrito al vendedor; solicitud de supresión de datos propios. Semana 2, en paralelo y con el mismo expediente: presentación ante ANMAT (Pesquisa de Medicamentos Ilegítimos, con el manual como prueba de promoción con posología y el formulario como prueba de paciente concreto), copia a INCUCAI y a la autoridad sanitaria de CABA o PBA; aviso a Lilly, Novo Nordisk y Pfizer; aviso a COFA y al colegio de farmacéuticos; **denuncia penal ante el Ministerio Público Fiscal** (adelantada porque hay prueba de paciente identificado); **denuncia ante la Agencia de Acceso a la Información Pública** por tratamiento ilícito y cesión de datos sensibles. Reserva: acción preventiva colectiva. Para la práctica propia: no firmar el formulario, no usar el manual como referencia posológica; Mounjaro con receta o protocolo de investigación; ninguna vía lícita para BPC-157, Selank, Semax, retatrutida y similares.

Recaudos del Dr. González con el formulario recibido: conservar el original sin alterarlo; no reenviarlo a nadie que no sea ANMAT, la AAIP o el Ministerio Público Fiscal; no contactar al paciente ni al médico firmante; no usar la matrícula para identificarlo. No existe deber legal de denunciar (art. 177 CPPN no alcanza este supuesto); existe la facultad (art. 174), y el dictamen recomienda ejercerla.

## Próximos pasos sugeridos

1. Constatación notarial de todo el material (PDF, tres audios, manual, formulario, capturas del chat).
2. Presentación ante ANMAT (pesquisa@anmat.gob.ar y formulario del Programa de Pesquisa de Medicamentos Ilegítimos), con copia al INCUCAI por los productos celulares, y denuncias ante la AAIP y el Ministerio Público Fiscal.
3. Revisión del dictamen por un abogado, en particular los puntos "[verificar]" y la competencia para la denuncia penal.
4. Identificar RegenCell antes de la presentación, si es posible; si no, pedir a ANMAT que lo investigue.
5. Si hace falta tirzepatida en un paciente: Mounjaro con receta, consentimiento informado y bibliografía en la historia clínica.

## Cómo se procesaron los archivos

Audios: localmente, sin servicios externos (ffmpeg a WAV 16 kHz, detector de voz Silero y Whisper base y small en ONNX vía sherpa-onnx, modelos descargados de los releases de GitHub de k2-fsa/sherpa-onnx). PDF: pdftotext y pdfinfo (poppler) para texto y metadatos; pdftoppm para revisar páginas como imagen; pypdf para campos de formulario. Nada del material de origen salió de la sesión.
