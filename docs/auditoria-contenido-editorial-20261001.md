# Auditoría del contenido editorial — 1 octubre 2026

## Alcance y método

Lectura de configuración y piezas reales de producción, historial de ideas, catálogos completos de feed/historias y rutas de selección, guion y aprobación. Comparación SHA-256 local/producción de `automation.mjs`, `creative.mjs`, `planning.mjs` y `editorial-calendar.mjs`: coinciden. Se ejecutaron las ocho pruebas existentes de `editorial-calendar.test.mjs`: todas pasan, incluidas composiciones reales de las 48 variantes de texto de historias. No hubo generación pagada, publicación ni modificación funcional en esta auditoría.

Se simuló una semana con historial inicialmente vacío para observar la selección. No es una predicción de la agenda real: el historial importado y los trabajos futuros modifican el resultado. No se consultaron métricas sociales; no se puede atribuir eficacia comercial al contenido.

## Dictamen

Hay una base útil de temas y composición, pero el contenido necesita mejora antes de considerar la variedad editorial resuelta. La calidad técnica no basta. La lista semanal propuesta en el chat anterior era una propuesta, no el calendario configurado.

## Evidencia y tareas

| ID | Estado / prioridad | Hallazgo comprobado | Acción ejecutable y aceptación |
|---|---|---|---|
| CONT-01 | MEJORAR / P0 | `creative.mjs:36` convierte el editorial automático en `style:'lista', resources:[]`. No utiliza el `asset` del plan para el video. | Seleccionar estilo según intención y recurso disponible; adaptar las capturas de `feed/brand` al contrato de video. Prueba: plan cocina usa cocina; plan mesas usa mesas; demo sin evidencia queda retenida. No exigir una biblioteca nueva: ya existen ocho capturas en producción. |
| CONT-02 | MEJORAR / P1 | Los 72 temas de `editorial/feed-catalog.json` contienen 39 arrays distintos de `consejos`. Doce títulos reutilizan el mismo array de tres puntos sobre una cuenta. No significa que todos los renders sean idénticos: título, humor, formato y recursos pueden variar. | Agrupar por enseñanza, acción y evidencia, no solo ID/título. Cada variante debe aportar un aprendizaje concreto diferente. Prueba: dos temas con distinto título e idéntica enseñanza se consideran repetidos; reutilizar una captura con una explicación nueva sigue permitido. |
| CONT-03 | MEJORAR / P1 | `chooseStory` evita coincidencias con temas del día y entre horarios; busca diversidad, no una secuencia. `deriveCampaign` crea briefs editables, pero no conecta el calendario diario a una microcampaña. | Añadir intención común opcional para 13h, video y 18h, con mensajes diferentes. Prueba: problema → demostración → pregunta/CTA, sin repetir narración ni usar el mismo título. No es obligatorio que todos los días sean monotemáticos. |
| CONT-04 | MEJORAR / P0 | `render.mjs` escribe `quality.status='review'|'passed'`, mientras `automation.mjs:42` comprueba `quality.passed===false`. Además `:44` acepta advertencias de release por política. No hay garantía de bloqueo de advertencias de lectura. | Normalizar contrato de calidad y clasificar advertencias bloqueantes/informativas. Prueba con informe `{status:'review',warnings:[...]}`: una advertencia bloqueante no recibe autorización automática; un trabajo rechazado por el propietario continúa retenido. Mantener la automatización autorizada para contenido conforme. |
| CONT-05 | MEJORAR / P1 | `editorialWeights` usa 30% `social_proof`, pero los ejemplos son demostraciones de mesas/cocina/cuentas, no testimonios ni resultados de clientes. | Renombrar la categoría como demostración de producto. Reservar prueba social para evidencia real autorizada. Prueba: demo no se etiqueta como caso de éxito. No inventar testimonios para completar la cuota. |
| CONT-06 | MEJORAR / P1 | Catálogo: pesos 60% ComandPOS, 25% facturación electrónica, 15% ERP; la ficha de marca declara solo cuatro funciones generales. Algunos textos incorporan otras funciones desde el catálogo. La procedencia editorial no equivale a validación del producto. | Vincular cada afirmación comercial a pantalla/documentación y alcance de plan. Para contenidos normativos, verificar fuentes oficiales antes de producir afirmaciones; esta auditoría no valida legislación ni requisitos fiscales. Prueba: consejo operativo no se convierte automáticamente en promesa de función. |
| CONT-07 | MEJORAR / P1 | `creative.history()` registra resultados de ideas; los videos recientes creados directamente con `/api/v1/jobs`, pendientes y sin campaña, no están en ese historial. `proposals` consulta ideas, publicaciones y piezas vinculadas, no todos los trabajos manuales. | Registrar decisiones editoriales también para creaciones directas: tema, ángulo, recursos, estado y huella del guion. Prueba: el nuevo video de mermas se reconoce como contenido reciente sin aprobarlo ni programarlo. Distinguir descartado de publicado. |
| CONT-08 | MANTENER y ajustar / P2 | CTA educativo «Guarda esta guía» y comercial «Solicita tu demo» están separados en `chooseFeed`. Las historias tienen preguntas específicas. Los hashtags del feed se construyen con un bloque fijo (`editorial-calendar.mjs:47`). | Conservar CTA por objetivo; adaptar caption por canal y contenido, sin prometer interactividad inexistente. Prueba: un video con consejo breve no se describe como guía extensa; no agregar hashtags de comandas a temas ajenos solo por defecto. |

## Lo que ya funciona y no debe repetirse

- 72 temas, 24 temas de historias con versiones para las 13 y 18 horas; cuotas y ventanas horarias implementadas.
- Historias con situaciones concretas: «¿Y el sin cebolla?», «El conteo no coincide», «La receta cambió. ¿Y su costo?».
- Prevención de títulos repetidos en historias durante 14 días y controles de encaje de texto.
- Separación de consejo, explicación del producto y CTA en el catálogo, aunque la clasificación de prueba social necesita corregirse.
- Capturas existentes: cocina, mesas, cuenta, cuentas por cobrar, contabilidad, reportes, empleados y nómina. Se comprobó presencia, no actualidad funcional de todas las pantallas.
- Estética comercial, voz y subtítulos reutilizables. No hace falta cambiar de motor para resolver la planificación.

## Ejemplo de mejora editorial (propuesta, no programada)

Tema: mermas.

- Historia 13h: «¿Qué se descartó hoy?» Una pregunta concreta y dos comprobaciones operativas, sin cifras inventadas.
- Reel: «Lo que desperdicias también cuesta». Mostrar la tarjeta de mermas, explicar qué dato se consulta y dejar un único CTA.
- Historia 18h: acercamiento a esa tarjeta con «¿Quieres ver dónde consultarlo?». Captura etiquetada como ejemplo, sin afirmar que sea una encuesta interactiva.
- Carrusel otro día: causas que conviene documentar, un ejemplo ilustrativo y cómo revisar la información. No volver a publicar el guion del Reel dividido en cuatro láminas.

El video nuevo de mermas mejora foco y legibilidad respecto al genérico de mesas. Aún puede mejorar: juntar merma y costo de receta introduce dos indicadores en 18 segundos sin explicar su relación. En una siguiente versión conviene profundizar en uno por pieza. Es una valoración editorial, no una prueba de retención.

## Orden recomendado

1. CONT-01 + CONT-04: unir demostración y evidencia, y corregir el contrato de calidad.
2. CONT-02 + CONT-07: historial unificado por enseñanza y ángulo.
3. CONT-03 + CONT-05 + CONT-06: coordinación diaria, etiquetas honestas y afirmaciones respaldadas.
4. CONT-08: adaptación de captions por canal.

Medir tiempo hasta pieza aceptada, correcciones por pieza, repeticiones detectadas, coste de regeneración y cobertura de recursos. Medir retención/completitud solo cuando exista integración de métricas con datos reales. No se modificó el calendario ni se aprobó el video pendiente.
