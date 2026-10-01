# Inventario vigente de mejoras — GCODE Studio

Corte: **2026-10-01, segunda pasada después de la implementación**. Esta auditoría terminó en el alcance de código y pruebas descrito. **Ninguna tarea GST-017–026 se implementó durante ella.** Se mantienen los identificadores anteriores; las nuevas tareas describen diferencias concretas, no una reescritura.

[Benchmark con los diez repositorios, commits y enlaces](benchmark-github.md) · [Evidencia ejecutada](auditoria-actual-20261001.json) · [Implementación anterior](implementacion-2026-10-01.md) · [Diagnóstico histórico, no backlog actual](mejoras-studio-historico-20261001.md).

## Estados separados y alcance

Investigación: [x] estructura/documentación; [x] código pertinente; [x] comparación; [x] validación práctica propia cuando procede (90 pruebas existentes, integración aislada y fixtures nuevos). [ ] Ejecución de aplicaciones externas: no realizada ni necesaria para seleccionar patrones. Ninguna dependencia instalada, modificación funcional, cambio en n8n, generación pagada ni publicación.

Capacidad: **YA RESUELTO / PARCIAL / FALTANTE VERIFICADO / NO VERIFICABLE / NO APLICA**. “YA RESUELTO” se limita al contrato probado; no certifica perfección audiovisual, permisos de proveedor ni todos los casos posibles. “FALTANTE VERIFICADO” exige seguir consumidores/rutas, no buscar un nombre de archivo.

Base: HEAD `9817a41` **más cambios previos sin commit**. Las 68 huellas de fuentes y el estado del servidor se registran en el JSON. En la auditoría no se hizo commit, push ni despliegue; la implementación posterior se registra en el documento de cierre. La copia temporal verificó UI/API/render/caché y generó TAR/XML; no importó XML en un NLE. La verificación remota comparó el directorio app, no todos los archivos internos de la imagen Docker.

## Seguimiento de implementación posterior a la auditoría

GST-017–026 implementados y probados; despliegue privado realizado el 2026-10-01. Estado detallado y límites en [implementacion-mejoras-20261001.md](implementacion-mejoras-20261001.md). Las tablas de hallazgos que siguen describen la base auditada; no deben interpretarse como carencias actuales sin consultar ese cierre.

## Lo implementado que no debe volver a proponerse

| ID | Capacidad actual | Estado vigente | Comprobación / límite |
|---|---|---|---|
| GST-001 | Conservar caption, brief, creative/campaign/concept al reintentar | YA RESUELTO | `jobs.mjs:192`, prueba retry preserves editorial context. La asociación de piece.job_id es otro caso: GST-020. |
| GST-002 | Presupuesto con lock recuperable | YA RESUELTO | `file-lock.mjs`, `budget.mjs:7`; SIGKILL y concurrencia pasan. |
| GST-003 | Costes completos por trabajo y conciliación | YA RESUELTO para registro | `budget.mjs:13`; fixture de 251 entradas, UI de conciliación. Reserva no equivale a factura; agregación entre intentos en GST-017. |
| GST-004 | Conciliar entregas inciertas | YA RESUELTO en código/tests | `marketing.mjs:65 reconcileDelivery`, UI. Vincula recibo, no autoriza reenvío. Consulta real pendiente. |
| GST-005 | Ajustes de diseño efectivos | YA RESUELTO en alcance probado | `design.mjs`, `visual-runtime.js`, `brand-feed.mjs`; integración de selector pasa. Solo Montserrat. Regresión visual completa en GST-025. |
| GST-006 | Comparador de versiones/escenas | YA RESUELTO | `version-diff.mjs`, editor y tests. Fallback posicional explícito para versiones antiguas sin ID. |
| GST-007 | Evidencia revisada por persona en todos los formatos | YA RESUELTO como trazabilidad | `evidence.mjs`, `creative.mjs`, `brand-feed` UI; no prueba verdad semántica de cada frase. |
| GST-008 | Producción de cuatro derivados | PARCIAL operacionalmente | `batches.mjs` implementado, pruebas mock pasan; reanudación tras registro Creative fallido falla en fixture real del guard: GST-019. No se generó lote pagado. |
| GST-009 | Una publicación real aprobada y recibo | NO VERIFICABLE en esta pasada | Sigue pendiente de pieza/cuenta/aprobación y permiso de envío. No crear otro publicador. |
| GST-010 | Identidad de caché visual completa para contexto probado | YA RESUELTO | `scene-cache.mjs`, dos renders aislados: repeat 2 hits, cambio de familia 0 hits. |
| GST-011 | Paginación y resaltado de subtítulos | YA RESUELTO en algoritmo probado | `captions.mjs`: ancho/puntuación/pausas/lectura. No prueba naturalidad de voz ni comprensión humana de cada pieza. |
| GST-012 | Manifiestos versionados de plantillas | YA RESUELTO para tres familias de plantilla | `styles.mjs:27`, `design.mjs`, UI. No confundir tres manifiestos con nueve renderizadores. |
| GST-013 | Caché ASR ligada a audio/modelo/binario/pipeline | YA RESUELTO en identidad y tests | `subtitulos.mjs:7–24`. Revisión de discrepancias sigue distinta, GST-018. |
| GST-014 | Espacio libre y limpieza segura de caché | YA RESUELTO en preflight/dry-run/tests | `storage.mjs`, UI comprobada. No se limpió producción. |
| GST-015 | Capacidades por destino antes de producir/programar | PARCIAL | Contrato y UI existentes; permiso efectivo de cuenta explícitamente no verificado. |
| GST-016 | Entrega a editor profesional | PARCIAL | `handoff.mjs`, TAR/XML creado; elementos visuales horneados, sin importación real en Resolve/Premiere. |

## Inventario nuevo y prioridades

Supuestos de planificación: un desarrollador, plataforma privada, una instancia y producción de decenas de piezas al mes como escenario de diseño, **no volumen medido**. Se desconocen presupuesto de desarrollo, tasas reales de corrección y facturas. Esfuerzo relativo P=pequeño, M=medio, A=alto; no son plazos. Las primeras mejoras usan módulos existentes y no requieren un proveedor nuevo.

| ID | Hallazgo / consecuencia | Capacidad | Decisión | Impacto / esfuerzo | Coste operativo | Prioridad / implementación |
|---|---|---|---|---|---|---|
| GST-017 | Techo se reinicia por nuevo job; gasto acumulado de la pieza puede superar el techo inicial | YA RESUELTO en el contrato probado; límites en cierre | MEJORAR, patrón propio | Alto / M | JSON/lock existente | P1 · [x] Implementado y probado |
| GST-018 | Discrepancia ASR bloquea sin revisión por frase ni evidencia durable conectada | YA RESUELTO en el contrato probado; límites en cierre | INSPIRARSE VideoLingo/MPT | Alto / M | Disco + ASR local; sin TTS al aceptar audio | P1 · [x] Implementado y probado |
| GST-019 | Reanudar lote no recupera un Creative fallido persistido | YA RESUELTO en el contrato probado; límites en cierre | MEJORAR, patrones de recuperación | Alto / M | Local; nueva compra solo autorizada y presupuestada | P1 · [x] Implementado y probado |
| GST-020 | Reintento normal no actualiza la pieza de campaña que lo referenciaba | YA RESUELTO en el contrato probado; límites en cierre | MEJORAR función compartida | Alto / P–M | Local | P1 · [x] Implementado y probado |
| GST-021 | Carrusel fijo de cuatro páginas/recurso global limita adaptación | YA RESUELTO en el contrato probado; límites en cierre | INSPIRARSE Carousel | Medio–alto / M | Render proporcional a páginas | P2 · [x] Implementado y probado |
| GST-022 | Fuentes de imagen congeladas, runtime de imagen no versionado por job como video | YA RESUELTO en el contrato probado; límites en cierre | MEJORAR | Medio / M | Snapshots/almacenamiento | P2 · [x] Implementado y probado |
| GST-023 | Se crean nuevas tomas, falta selector de tomas previas con escucha/comparación | YA RESUELTO en el contrato probado; límites en cierre | INSPIRARSE LTX | Medio / M | Reusar WAV; sin nueva generación | P2 · [x] Implementado y probado |
| GST-024 | Propuestas repiten hechos; no hay estructura explícita de ángulos/objetivos | YA RESUELTO en el contrato probado; límites en cierre | MEJORAR; propuesta original | Medio / M | Reglas primero; IA adicional solo medida | P3 · [x] Implementado y probado |
| GST-025 | Prueba de integración cubría pocos ejemplos; matriz representativa añadida | PARCIAL: 36 combinaciones verificadas; falta baseline audiovisual aprobado | MEJORAR tests/fixtures | Medio–alto / M | CPU/artefactos locales | P2 · [x] Implementado y probado |
| GST-026 | Lote queda submitted aunque hijos hayan terminado/fallado; requiere interpretar estados | YA RESUELTO en el contrato probado; límites en cierre | MEJORAR; propuesta original | Medio / P | Local | P2 · [x] Implementado y probado |

Investigación GST-017–026: [x] estructura [x] código [x] comparación [x] validación práctica propia en el alcance del cierre. No se ejecutaron tests de terceros. GST-025 conserva pendiente la regresión audiovisual completa con muestras aprobadas por una persona.

## Las cinco tareas prioritarias de la auditoría (implementadas; criterios originales)

Las descripciones siguientes preservan el diagnóstico anterior al cambio. El estado vigente y los resultados de aceptación están en el cierre de implementación; no son nuevas tareas pendientes.

### GST-017 — Un techo de presupuesto para toda la operación

**Problema comprobado.** `jobs.mjs:192 retry` crea otro ID con el mismo `max_budget_usd`. `budget.mjs:9 reserve` agrega por `job`; solo hay techo compartido cuando existe `budget_group`. Fixture ejecutado con JobStore y Budget reales: primer intento reserva 1.20 y falla; retry reserva 1.20 y falla; total **2.40 ante un techo inicial de 2.00**. El límite diario de 5 sigue funcionando. Son reservas sintéticas, no cargos ni prueba de cobro duplicado. No es el bug de los 250 registros, ya resuelto.

**Cambio.** Crear identidad de operación económica raíz, heredada por reintentos, y presentar presupuesto original/reservado/restante por pieza. Reusar grupos/lock de Budget; asignar grupo al primer trabajo; mapear linajes antiguos sin cambiar entradas ya conciliadas. La ampliación del techo, si se ofrece, debe ser una acción explícita auditada, nunca efecto de pulsar retry. Conservar techo diario y de lote.

**Módulos:** `budget.mjs`, `jobs.mjs`, `creative.mjs`/`local.mjs:createPiece`, `operations-ui.js`. **Referencia:** [waoowaoo: prueba snapshot/cotización/grant](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/tests/integration/task/approval-plan-change-replay.integration.test.ts). Se aprovecha la separación operación/intento; implementación propia, no copia ELv2 ni sustitución de ledger.

**Dependencias:** resolver dónde empieza la operación (incluye guion y recursos asociados); conservar compatibilidad de grupos de lote. **Beneficio:** límite entendible por pieza y reparación sin sorpresa de gasto. **Esfuerzo:** M. **Riesgos:** contabilizar dos veces una reserva compartida, heredar grupos incompatibles, reasignar incorrectamente deuda histórica.

**Aceptación:** original + 3 reintentos nunca reservan juntos más que el techo autorizado; fixture 1.20+1.20 sobre 2.00 rechaza el segundo; caché no reserva otra voz; concurrencia no rebasa grupo/día; UI suma el linaje; trabajos antiguos siguen legibles; nueva aprobación pending.

### GST-018 — Escuchar y resolver la frase retenida sin regenerar todo

**Problema comprobado por lectura.** `alinear.py:7–21 verify_meaning` exige marcas, cifras y condiciones; un desacuerdo ASR no prueba por sí solo mala pronunciación. `subtitulos.mjs:25` elimina la transcripción temporal aun si falla. `render.mjs:53–54` copia el stem después del alineado. `preview.mjs:6` recorre todas las escenas y aborta si una falta/falla; WaveSurfer llama a ese preview. Hay edición manual de tiempos y nueva toma: **no faltan por completo**. Falta el recorrido de revisar una frase retenida, con audio y transcripción asociados. El incidente previo de pronunciación está documentado; no se reescuchó ni reejecutó en esta auditoría.

**Cambio.** Guardar paquete de revisión por escena: audio/hash, texto esperado, ASR, modelo/pipeline, diferencias, código de causa. Servir escucha de una escena sin depender de las demás. UI ofrece confirmar discrepancia del transcriptor tras escucha, corregir texto o preparar una nueva toma. Confirmación ligada al audio/texto/modelo/escena, con actor/fecha; una edición invalida la resolución. No desactivar globalmente controles de cifras, negaciones ni marca. Reanudar desde alineación/render y conservar WAV existente.

**Módulos:** `subtitulos.mjs`, `alinear.py`, `render.mjs`, `jobs.mjs`, `preview.mjs`, `editor-tools.js`, rutas `local.mjs`. **Referencias:** [VideoLingo: checkpoint](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/pipeline.py#L62), [MPT: artefactos](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/task_artifacts.py). Patrones, no aplicaciones completas.

**Dependencias:** GST-017 para nuevas tomas; contrato estructurado de error/revisión; permisos de edición existentes. **Beneficio:** corrección localizada y diagnóstico útil. **Esfuerzo:** M. **Coste:** almacenamiento y procesamiento local; nueva voz solo con consentimiento de gasto. **Riesgos:** dar por correcto audio equivocado, autorización reutilizada sobre otro audio, guardar datos privados en logs públicos.

**Aceptación:** con escenas 1–2 listas y 3 retenida se escuchan las tres disponibles por separado; JSON de ASR persiste sin secretos; aceptar discrepancia ejecuta cero TTS; cambiar texto/audio revoca aceptación; caso “sin cebolla”/“con cebolla” permanece retenido hasta decisión explícita; toda pieza final requiere aprobación editorial posterior.

### GST-019 — Reanudar Creative por etapa sin una segunda compra incierta

**Problema comprobado.** `creative.mjs:21` solo devuelve un registro previo si tiene `result`; cualquier otro estado lanza “quedó pendiente o falló”. `batches.mjs:9 resume/run` usa la misma clave. Fixture con registro failed persistido + Creative real: dos reanudaciones fallan antes de llamar al proveedor. La prueba previa de lote usaba un productor mock que sí permitía la segunda llamada; no cubría este contrato real. Además Creative guarda `provider_output/response_id` antes de validar, pero no reutiliza esa respuesta al recuperar. Sus escrituras son directas, mientras jobs/marketing ya usan renombrado atómico.

**Cambio.** Estado creativo durable por fases: respuesta solicitada / resultado incierto / respuesta recibida / validación / borrador guardado. Si la respuesta existe, revalidar y finalizar localmente. Si se desconoce si el proveedor ejecutó, conservar retención y explicar siguiente acción; no borrar el archivo y reenviar. Nuevo intento pagado solo con presupuesto/consentimiento y parentesco. Escritura atómica del registro. Lote debe diferenciar “reanudar localmente”, “requiere revisar” y “nuevo intento autorizado”.

**Módulos:** `creative.mjs`, `batches.mjs`, `local.mjs:createPiece`, `operations-ui.js`, tests de Creative y lote. **Referencias:** [Postiz V112: consulta frente a mutación](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts#L74), [MPT: escritura atómica](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/task_artifacts.py#L21). Inspiración conceptual; no copiar publicador AGPL.

**Dependencias:** GST-017; inventario de errores proveedor vs validación local. **Beneficio:** reanudar lo ya pagado y no prometer un botón que repite el mismo bloqueo. **Esfuerzo:** M. **Riesgos:** reejecutar una operación desconocida, crear nombres/versiones duplicados, truncar JSON ante caída. **Coste:** cero proveedor al reprocesar salida guardada; otros intentos se cotizan.

**Aceptación:** integración con Creative real y proveedor falso, no solo mock del productor: caída después de respuesta recupera con una única llamada total; salida inválida se muestra para corregir; timeout sin respuesta no llama otra vez; reinicio mantiene registro íntegro; lote conserva hijos exitosos y no duplica jobs/versiones/piezas.

### GST-020 — Reintento enlazado a la pieza correcta

**Problema comprobado por trazado.** Rutas `/api/v1/jobs/:id/retry` y `/api/jobs/:id/retry` (`local.mjs:125,186`) solo llaman `store.retry`; este conserva metadatos pero no modifica Marketing. La pieza sigue con el job anterior hasta una edición manual. El lote **sí** tiene `linkJob` (`local.mjs:68`, `batches.mjs:10`). No es pérdida de caption/brief GST-001.

**Cambio.** Extraer una operación de reintento contextual común para UI/lote/API. El caller identifica pieza, servidor verifica job actual, campaña, marca y ausencia de entrega activa; reasocia por comparación del job esperado. Si hay varias piezas derivadas del mismo job, no elegir una arbitrariamente: selección explícita. Devolver padre/nuevo job/piece_id para que n8n siga la nueva identidad; conservar historial y revocar cualquier release afectado.

**Módulos:** `local.mjs`, `jobs.mjs`, `marketing.mjs:savePiece`, `batches.mjs`, `operations-ui.js`, contrato API/documentación n8n. **Referencia conceptual:** [LTX asset/take/clip](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/types/project-model.ts#L290). Reutilizar principalmente nuestro linkJob; no adoptar Zod/Electron.

**Dependencias:** GST-017; idempotencia entre creación y reasociación. **Beneficio:** campaña y cola muestran el intento vigente. **Esfuerzo:** P–M. **Coste:** local. **Riesgos:** carrera con edición/programación, referencia compartida, crash entre crear y enlazar.

**Aceptación:** fallo→retry deja la pieza seleccionada apuntando al nuevo job, mismo caption/concepto y pending; doble solicitud obtiene el mismo intento; caída intermedia se reconcilia; otra marca/versión se rechaza; entrega claimed/published/uncertain jamás se reasigna. Fixture de API + Marketing real, sin envío social.

### GST-021 — Carrusel con páginas independientes

**Problema comprobado.** `brand-feed.mjs:8` y `feed.mjs:33` exigen cuatro; `creative.mjs` pide exactamente cuatro; `jobs.mjs:186` solo sirve image-1 a image-4. En composición brand, foto/recurso es global, reutilizado en páginas. No basta cambiar un selector.

**Cambio.** Documento de páginas con ID estable, texto, recurso opcional y claims por página; insertar/duplicar/mover/quitar en UI. Mantener cuatro como preset compatible. Primera ampliación local propuesta: 2–8 páginas; **es límite de producto propuesto, no límite oficial de una red**. Validar capacidades reales antes de programar. Render de servidor y aprobación del orden/hashes intactos.

**Módulos:** `brand-feed.mjs`, `feed.mjs`, `creative.mjs`/contratos, `marketing-ui.js`, `feed-editor.html`, `jobs.mjs:artifactPath`, `version-diff.mjs`, publicador/manifest si asumen cuatro. **Componente:** [Carousel DocumentSchema](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/validation/document-schema.tsx) y [slide-menubar](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/components/slide-menubar.tsx). Inspiración/patrón; MIT si se adapta código, conservando avisos. No portar Next ni exportar capturas del navegador.

**Dependencias:** GST-006/007 existentes; revisión de rutas/índices y capacidad del destino. **Beneficio:** campañas con profundidad adecuada y corrección por página. **Esfuerzo:** M. **Coste:** CPU/almacenamiento proporcional a páginas; no IA al reordenar. **Riesgos:** pérdida de IDs/claims, overflow, publicación fuera de capacidad, ruptura de cuatro páginas existentes.

**Aceptación:** exportar 3/4/6 páginas; duplicar crea otro ID; reordenar conserva recursos/claims; cada JPG es descargable; cambiar una página/orden invalida release; variante antigua de cuatro conserva composición; ningún cambio publica por sí mismo.

## Otras oportunidades nuevas, sin confundirlas con fallos ya demostrados

### GST-022 — Procedencia del runtime de imágenes

**Evidencia/estado:** PARCIAL. `jobs.mjs:124` congela fuentes/runtime solo en video; `prepareFeed` congela foto, fuentes y capturas, `prepareBrandFeed` perfil y recursos; `executeFeed` importa renderer vivo y `executeBrandFeed` ejecuta código actual. No se reprodujo divergencia visual tras despliegue; es riesgo de reproducibilidad. **Propuesta/decisión:** MEJORAR con versión/huella del renderer de imagen y manifest, o impedir update con pendientes y documentar versión efectiva; preferible paridad de snapshot cuando se necesite reexportación exacta. **Referencia:** MPT artefactos y LTX generationParams, no sustitución. **Módulos:** feed, brand-feed, jobs, deploy. **Beneficio:** explicar/reproducir cambios. **Esfuerzo:** M; **dependencia:** contrato de runtime; **riesgo:** snapshots sin dependencias/fuentes exactas; **coste:** disco. **Aceptación:** imagen en cola mantiene el renderer elegido ante cambio de código; manifest registra runtime; fixtures antiguos siguen pasando. P2; implementación y alcance en el cierre.

### GST-023 — Galería de tomas existentes

**Evidencia/estado:** PARCIAL. `editor-tools.js:18` incrementa voice_take; `voz.mjs` cachea por texto/perfil/toma. No se encontró selector/listado de alternativas conectado a la UI; cambiar contador no equivale a galería. **Propuesta:** INSPIRARSE en LTX assetTakeSchema/activeTakeIndex: listar tomas con duración, estado ASR, coste registrado y botón escuchar/elegir; guardar selección como versión. **Módulos:** voz/preview/editor-tools/versions. **Beneficio:** recuperar la toma preferida sin pagar otra. **Esfuerzo:** M; **dependencias:** GST-018; **riesgos:** mostrar audio de otra marca/texto, retención; **coste:** local. **Aceptación:** alternar dos WAV cacheados hace cero peticiones TTS, invalida aprobación, conserva historial. P2; implementación y alcance en el cierre.

### GST-024 — Ángulos editoriales por hecho y objetivo

**Evidencia/estado:** PARCIAL. `planning.mjs:11–22` ordena hechos por similitud lexical con historial/caption y objetivo; `styles.mjs:automaticBrief` rota seis estructuras. No hay campo explícito de ángulo/cobertura por campaña en ese flujo. **Propuesta original:** hecho → problema/público/objetivo/ángulo → formato; reservar calendario editorial y marcar qué explicación ya se usó, conservando claims. No se observó un componente listo que justifique dependencia. VideoLingo inspira glosario consistente, no un planificador. **Módulos:** planning, creative, campañas/UI. **Beneficio:** variedad sin inventar funciones. **Esfuerzo:** M; **dependencias:** taxonomía pequeña revisada; **riesgo:** confundir similitud con repetición, sugerir evidencia inexistente; **coste:** reglas primero, IA opcional con presupuesto medido. **Aceptación:** fixtures de una misma función generan enfoques diferentes, no se repite un ángulo reservado, referencias permanecen válidas. Comparar aceptación humana y correcciones; no prometer engagement. P3; implementación y alcance en el cierre.

### GST-025 — Matriz visual y auditiva de regresión

**Evidencia/estado:** PARCIAL. `scripts/verify-implementation.mjs` renderiza dos escenas media sin voz, cambia familia y prueba carrusel; tests unitarios no prueban los nueve estilos × formatos × límites de texto. `render.mjs:93` muestrea cuadros, no toda la secuencia. **Propuesta:** MEJORAR fixtures representativos versionados (incluyendo comercial con voz cacheada, texto largo, cifras, distintos recortes) y comparación visual tolerante; revisión humana de castellano dominicano y pronunciación. **Referencias:** LTX tests de routing/retake; Short Video Maker captions; no adoptar sus motores. **Módulos:** scripts, captions, visual-runtime, tests. **Beneficio:** proteger estética que ya gusta y detectar degradación. **Esfuerzo:** M; **dependencias:** selección de muestras aprobadas; **riesgo:** snapshots frágiles por fuentes/Chromium; **coste:** CPU, sin TTS nuevo usando WAV autorizados. **Aceptación:** cambio que corta título o esconde palabra falla; variantes normales pasan con tolerancia documentada; errores auditivos solo declarados resueltos después de escucha. P2; implementación y alcance en el cierre.

### GST-026 — Estado agregado del lote

**Evidencia/estado:** PARCIAL. `batches.mjs:6 list` agrega cada job actual; `run` termina en submitted y no calcula un estado final de conjunto. La información individual existe, no está perdida. **Propuesta original:** proyectar produciendo/listo para revisar/parcialmente fallido/aprobado sobre hijos, con next_action; conservar estado durable de envío separado del agregado. Inspiración waoowaoo: progreso como proyección, terminal separado. **Módulos:** batches y operations-ui. **Beneficio:** usuario sabe qué requiere atención. **Esfuerzo:** P; **dependencias:** GST-019/020; **riesgo:** confundir submitted con publicado/aprobado; **coste:** local. **Aceptación:** lote de cuatro, uno fallido, informa tres listos y una acción concreta; no cambia aprobación ni publica. P2; implementación y alcance en el cierre.

## Secuencia de ejecución recomendada

1. **Inmediata:** GST-017 → GST-018/GST-019 → GST-020. Añadir regresiones de los fixtures reproducidos, no sustituir pruebas actuales. Primer cambio recomendado: techo por operación (GST-017); así la recuperación posterior conserva el límite de gasto.
2. **Siguiente etapa:** GST-021 y GST-025 para mejora visible con protección de calidad; GST-026 para claridad operacional; GST-022/023 según uso y necesidades de reexportación/voz.
3. **Posterior:** GST-024 tras medir repetición real; completar GST-016 con importación NLE cuando se use; GST-009 y permisos reales de GST-015 requieren validación controlada y pieza concreta, no más código supuesto.

Medir antes/después: minutos de trabajo humano hasta pieza aprobada, éxito de reanudación sin proveedor nuevo, reservas/facturas por operación, tasa de aceptación al primer pase, correcciones de voz/subtítulos, páginas/recursos reutilizados, porcentaje de render cacheado. El sistema ya tiene timestamps/ledger; agregar eventos medibles donde falten. No hay datos para estimar porcentajes de ahorro o aumento de ventas.

## Flujo de uso tras estas mejoras

Usuario selecciona marca/campaña → Studio propone tema/ángulo con fuentes → usuario acepta o corrige → Studio muestra alcance/presupuesto de operación → guion y derivados en cola → editor corrige escena/frase/página usando recursos y voces existentes → problemas ASR se revisan por frase → Studio reúne resultados y costes → persona resuelve comentarios y aprueba archivo/texto/cuenta exactos → Studio programa → n8n reclama, envía y concilia sin duplicar → Studio registra fecha/enlace/recibo y métricas disponibles. Un cambio crea nueva versión y requiere aprobación; n8n no decide si el contenido está aprobado ni redacta por su cuenta una publicación distinta.

No hacen falta agentes para locks, cuotas, reintentos, programación o releases. IA sigue siendo útil para redactar/adaptar dentro de hechos y plantillas; las verificaciones no pueden declararse verdaderas por la misma IA que inventó el texto. Para desarrollar Studio, priorizar fixtures y diagnósticos por fase antes que añadir un agente que reinicie trabajos de pago.

## Lo que se mantiene, descarta o pospone

**MANTENER:** voz/perfil n8n preferidos, subtítulos animados, compositor, nueve estilos actuales, marcas, versiones, caché, controles de gasto, aprobación inmutable y publicador. No migrar tecnologías para imitar pantallas.

**POSPONER/DESCARTAR:** integración de OpenCut main mientras el editor/exportación del candidato no estén conectados; aplicación completa AiToEarn/Postiz/waoowaoo; GPU y modelos LTX sin caso concreto; sustituir voz por Kokoro sin casting español; Remotion solo por popularidad; editor multicapa propio, SaaS/multitenancy/billing, clonación de voces, tendencias/atribución de ventas sin fuentes. Estas decisiones están cerradas para esta etapa, no son tareas pendientes indefinidas.

**Punto exacto de continuación:** GST-017–026 tienen implementación y pruebas según `implementacion-mejoras-20261001.md`. No repetir presupuesto, recuperación, carruseles ni selector de tomas. La siguiente validación requiere una pieza real: escuchar las frases retenidas, corregir si es necesario y aprobar una versión concreta. Con muestras aprobadas, ampliar GST-025 a regresión audiovisual temporal y baseline visual. Importación XML en NLE, permisos efectivos/publicación real y métricas siguen pendientes de sus operaciones específicas. No hay procesos de trabajo prometidos en segundo plano.


## GST-027 — Paridad editorial y calendario legado

**Implementado y comprobado** en código, pruebas y producción de una historia pendiente de revisión. Migrados 72 temas, cuotas 60/25/15 y 40/30/20/10, feriados, fotografías con caché/reconsulta, 24 temas de historias y seis diseños, horarios diarios 13:00/18:00. Se mantienen releases humanos y publicador n8n. Evidencia y excepciones deliberadas: `migracion-editorial-completa-20261001.md`. No se marca publicación real como comprobada; no se publicó contenido de prueba.
