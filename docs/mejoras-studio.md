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

## Seguimiento editorial — 1 octubre 2026

CONT-01 a CONT-08: implementación y pruebas en [mejoras-contenido-20261001.md](mejoras-contenido-20261001.md). Evidencia inicial en [auditoria-contenido-editorial-20261001.md](auditoria-contenido-editorial-20261001.md). La verificación de nuevas funciones/capturas y la medición de resultados comerciales siguen siendo trabajo continuo; no se confunden con los cambios técnicos implementados.

## Publicidad pagada — revisión actual, 1 octubre 2026 RD / 2 octubre UTC

Base `8cdba42`. Esta sección sustituye únicamente el borrador de investigación Ads y conserva el historial anterior. Evidencia detallada, commits, módulos y licencias: [benchmark actualizado](benchmark-github.md#auditoría-meta-ads--tiktok-ads--corte-1-octubre-2026-rd--2-octubre-utc).

**Investigación:** estructura, código relevante, comparación y consultas de lectura terminadas dentro del acceso disponible. **Implementación Ads:** no iniciada. **Validación de la app privada y piloto Ads real:** pendiente. Las pruebas de Studio ejecutadas en esta pasada dieron 124/124 Node y 6/6 Python; no son pruebas de Marketing API ni evaluación de calidad de voz.

### Checklist de capacidades: conservar antes de añadir

| Capacidad | Estado actual | Decisión / evidencia |
|---|---|---|
| Marcas, recursos, claims y campañas editoriales | YA RESUELTO | MANTENER `marketing.mjs saveBrand/saveCampaign`, `content-policy.mjs`. No duplicar catálogo con otro Studio. |
| Nueve estilos, voz, subtítulos y edición de partes | YA RESUELTO | MANTENER `styles.mjs`, `voz.mjs`, `editor-tools.js`, `versions.mjs`. No implementar de nuevo por un benchmark. |
| Caché y coste de generación | YA RESUELTO | MANTENER `scene-cache.mjs`, `budget.mjs`; el coste IA no es gasto Ads. |
| Release editorial vinculado a contenido/cuenta | YA RESUELTO | MANTENER `releases.mjs publicationBundle`, `marketing.approveRelease/approvedRelease`. |
| Publicación orgánica, recibos y prevención de duplicados | YA RESUELTO | MANTENER `deploy/studio-publisher.cjs`, `marketing.claim/result/reconcileDelivery`; hay publicación real y también importación histórica separadas. |
| Autorización orgánica automática | YA RESUELTO | MANTENER `automation.authorizeAutomatic`, sin heredarlo para Ads. El usuario ya autorizó esa modalidad orgánica. |
| Recuperación de feed y portadas | YA RESUELTO | `automation.replacementForFeed`, `cover.test.mjs`, `publisher.test.mjs`; no repetir estos cambios. |
| Sesiones persistentes / roles | YA RESUELTO para uso actual | MANTENER `access.mjs`. MEJORAR acciones específicas y allowlist publicitaria, no reconstruir login. |
| Metadatos de cuenta y capacidades Ads | FALTA VERIFICADA en modelo/rutas revisados | GST-028. Conexiones externas concretas: NO VERIFICADO. |
| Pieza/versión vinculada a jerarquía de Ads | FALTA VERIFICADA | GST-029. Una campaña editorial no equivale a una campaña de Meta. |
| Autorización de gasto y activación independiente | FALTA VERIFICADA | GST-030. Aprobación editorial existente es reutilizable pero insuficiente para autorizar gasto. |
| Crear/reconciliar anuncios por API | FALTA VERIFICADA en transporte/workflows revisados | GST-031; se propone, no se ejecuta. |
| Métricas pagadas con moneda/período/atribución | FALTA VERIFICADA | GST-032; métricas orgánicas actuales sí existen. |
| Permisos/modo/activos de app Meta 25485026691133696 | NO VERIFICADO | Panel no accesible. Identidad Instagram comprobada no prueba Marketing API. |
| Cuenta/desarrollador/permisos TikTok Ads | NO VERIFICADO | Cuenta Buffer orgánica no basta. Evaluar después del piloto Meta. |
| Nuevo gestor integral o agente activador de gasto | NO CONVIENE | Duplicaría procesos y autoridad; SDK + funciones y n8n son suficientes inicialmente. |

### Prioridades y supuestos de planificación

Supuesto de estimación, **no dato observado**: un desarrollador, un responsable que aprueba presupuesto, una cuenta publicitaria propia inicial, volumen bajo (hasta diez borradores semanales), infraestructura actual. Esfuerzos en días de desarrollo orientativos, sin tiempos de revisión de plataformas ni gestión de permisos. No hay tarifas verificadas para presupuestar servicios nuevos; el piloto de lectura no activa gasto publicitario, pero consume infraestructura, mantenimiento y cuota API. No estimar ahorros/ventas sin baseline.

| ID | Estado capacidad / tipo de decisión | Impacto esperado | Esfuerzo | Coste operativo / prioridad |
|---|---|---|---|---|
| GST-028 | FALTA VERIFICADA; INTEGRAR + MEJORAR | Visibilidad real de cuentas/permisos sin abrir escritura | 1–3 días tras acceso | Lecturas acotadas, renovación operativa de credencial; P0, primero |
| GST-032 | FALTA VERIFICADA; INSPIRARSE + construir contrato | Resultados comparables sin mezclar gasto/monedas/atribución | 2–4 días | Almacenamiento y consultas periódicas limitadas; P1, junto al piloto |
| GST-029 | FALTA VERIFICADA; MEJORAR + ADAPTAR patrón | Reutilizar creativo aprobado y atribuir anuncio a versión | 2–3 días | Estado/artefactos existentes; P1, antes de crear |
| GST-030 | FALTA VERIFICADA; MEJORAR | Control explícito de presupuesto y de cambios | 3–5 días | Operaciones humanas de revisión; P0 antes de cualquier escritura Ads |
| GST-031 | FALTA VERIFICADA; INTEGRAR + INSPIRARSE | Recuperación por fase sin anuncios duplicados | 3–5 días | Lecturas de conciliación; gasto solo tras activación autorizada futura; P1 después de 028–030 |

### GST-028 — Conexión Ads de lectura y permisos por cuenta

**Estado de investigación:** [x] estructura/documentación; [x] código relevante; [x] comparación; [ ] prueba de integración real. **Implementación:** [ ] pendiente.

**Problema comprobado →** `capabilities.mjs` representa transportes orgánicos; `api-scopes.mjs` da a GET/HEAD el scope `read`; cuentas Facebook/TikTok vivas son canales Buffer. No existe registro verificado de cuenta Ads/permisos/moneda/zona. Los scopes de la credencial Instagram no pudieron introspectarse y su app de origen no está confirmada.

**Cambio →** crear `ad_connections` con plataforma, referencia segura de credencial, allowlist de cuentas, marca permitida, nombre/moneda/zona/estado, capacidades comprobadas y fecha de comprobación. Separar `ads.read`, `ads.draft` y `ads.activate` en backend; no hacer que la clave de publicación orgánica los herede. Validar IDs solicitados contra autorización del servidor. Exponer estado y errores sin secretos.

**Componentes →** SDK oficial Meta Node como dependencia futura; cursor y objetos `AdAccount`. Pruebas de redacción inspiradas en Pipeboard; no copiar su servidor BUSL ni conectarlo a credenciales. Instancia SDK por conexión; debug y crash reporter apagados. Scopes mínimos apropiados: lectura, sin permiso de escritura preventivo.

**Módulos afectados →** `api-scopes.mjs`, `access.mjs`, `capabilities.mjs`, rutas de `local.mjs`; nuevos `ads/connections.mjs`, `ads/meta.mjs` y vista Conexiones. Nombres de nuevos archivos son propuesta, no archivos existentes. Almacenar secretos mediante configuración privada de integración, no en JSON exportable de marketing.

**Dependencias/riesgos →** ID `act_…`, `ads_read` y asignación efectiva en app existente; nivel de acceso por confirmar. La app y Business indicados no acreditan permisos. Logs/URLs/errores del SDK pueden revelar tokens si no se interceptan. El hallazgo Telegram requiere rotación posterior autorizada y migración a credencial n8n; no reutilizar URLs secretas.

**Aceptación →** usuario/clave de solo lectura puede consultar únicamente cuenta y marca autorizadas; manipular ID devuelve 403 antes de red; no hay POST/PATCH/DELETE, incluso ante excepciones; fixtures de 401/403/429, paginación, respuesta malformada y expiración; tokens ausentes de logs/exportación/errores. Conexión real muestra ID/moneda/zona/fecha y evidencia del permiso; hasta entonces estado NO VERIFICADO.

### GST-029 — Relación anuncio–campaña–pieza–versión y derechos pagados

**Investigación:** [x] estructura; [x] código; [x] comparación; [ ] prueba práctica. **Implementación:** [ ] pendiente.

**Problema comprobado →** `marketing.saveCampaign` es editorial y `publicationBundle` es orgánico. No hay modelo de relación campaign/adset/ad/creative de proveedor con la versión concreta, ni decisión explícita de uso publicitario de los recursos.

**Cambio →** añadir borrador Ads relacionado con campaign interna, brand, piece, job/version/hash, texto, destino y cuenta, sin alterar el registro editorial. Identidad externa compuesta `(plataforma, cuenta, tipo, id)`: nunca suponer que todos los IDs pertenecen a la misma plataforma o que un Buffer channel es ad account. Conservar snapshot de marca/recursos y procedencia. Poder enlazar publicación orgánica con recibo verificable para evaluar anuncio de post existente, sin asumir que URL concede autorización.

**Componente →** adaptar patrón MIT de snapshot y checkpoints de Leadrouter (`delivery/models.py`, `publishCampaign.js`), conservando `releases.mjs` propio. No portar SQLAlchemy/React. Verificar derechos de música/voz/imagen para Ads; las licencias de código no los otorgan. Spark Ads necesitará autorización oficial de contenido.

**Módulos →** `marketing.mjs`, `releases.mjs`, UI campaña/pieza en `local.mjs`, nuevos contratos `ads/drafts.mjs`; solo referencias a artefactos ya existentes, no nueva generación por defecto.

**Dependencias/riesgos →** GST-028, identidad/cuenta correctas, esquema versionado y backfill opcional de relaciones sin inferirlas desde nombres. Un post puede originar varios anuncios; no sobrescribir la entrega orgánica con el ID del anuncio.

**Aceptación →** mismo creativo puede alimentar dos anuncios con cuentas/plataformas explícitas y métricas separadas; editar pieza genera otra versión y deja inmutable el snapshot anterior; recurso expirado o no autorizado para Ads bloquea preparación; historial orgánico permanece idéntico; ninguna llamada de creación ocurre en guardar borrador.

### GST-030 — Aprobación editorial y autorización de gasto separadas

**Investigación:** [x] estructura; [x] código; [x] comparación; [ ] prueba práctica. **Implementación:** [ ] pendiente.

**Problema comprobado →** `budget.mjs` controla generación; `automation.authorizeAutomatic` permite publicar orgánico por política del dueño. Ninguna de las dos cosas autoriza inversión en medios. `release` actual no vincula presupuesto/destino/segmentación/configuración de Ads.

**Cambio →** autorización de gasto explícita del dueño con hash de cuenta, campaña/configuración, versión de creativo y copy, URL de destino, identidad, objetivo, segmentación, placements, moneda, presupuesto (diario o total), fechas y límites aprobados. Conservar importe en unidad exacta del proveedor, sin float ni regla universal de multiplicar por 100; zona horaria de la cuenta, timestamps normalizados. No inventar mínimos, impuestos, comisiones ni reglas financieras. Separar estados editorial_approved, spend_authorized, remote_paused y activation_authorized.

**Componente →** extensión propia de `publicationBundle` y revocación; validación de dinero/zona horaria de Leadrouter como referencia MIT, con fixtures de nuestras cuentas. PAUSED predeterminado de SDK/MCP es una configuración, no prueba de aprobación. La activación seguirá siendo una acción humana explícita en una fase futura.

**Módulos →** `releases.mjs`, `access.mjs`, `api-scopes.mjs`, nuevo `ads/authorizations.mjs`, vista revisión Ads y audit. Auditoría Ads debe conservar hash de configuración, actor, transición, IDs y resultado remoto; el log actual actor/acción limitado a 2000 entradas no sustituye ese historial.

**Dependencias/riesgos →** GST-028/029, acuerdos reales del dueño sobre límites. Cambiar presupuesto, destino, fechas, creatividad o segmentación revoca autorización. No prometer que un límite local detiene instantáneamente gasto que Meta ya está entregando; esa fase necesita reconciliación y controles remotos.

**Aceptación →** aprobar el video o habilitar orgánico automático nunca permite gastar; cambios enumerados invalidan autorización; editor no activa por URL/API; solicitud manipulada con monto/cuenta distintos falla; creación propuesta resulta pausada y confirmada por lectura en todos los niveles aplicables; activación imposible sin autorización exacta vigente. Tests usan transporte simulado, no campañas reales.

### GST-031 — Operaciones Ads durables, creación pausada y reconciliación

**Investigación:** [x] estructura; [x] código; [x] comparación; [ ] integración. **Implementación:** [ ] pendiente; fase de escritura solo propuesta.

**Problema comprobado →** existe excelente base de claim/uncertain orgánica, pero no operaciones por fases de campaña/adset/creative/ad. Repetir una llamada tras timeout puede duplicar objeto o inversión.

**Cambio →** adaptadores `ads/meta.mjs` y futuro `ads/tiktok.mjs`, ledger de operación por clave estable y hash, persistencia antes/después de cada llamada, checkpoint de ID remoto, request/trace ID saneado, leases y resultado uncertain. Reutilizar conceptos de `marketing.claim/result/reconcileDelivery`; n8n invoca operaciones por ID, no reconstruye payload ni autoriza presupuesto. Nunca prometer idempotencia del proveedor donde no está documentada. Si no puede conciliar de forma inequívoca, detener y pedir revisión.

**Componentes →** SDK Meta Node para API; patrón `enqueue/fail_job/recovery` de Leadrouter y actividades no reintentables de Postiz, implementados con código propio. TikTok: SDK oficial como especificación; evaluar cliente selectivo Promobase solo tras validar auth, método, envelopes y licencia. El reporte integrado TikTok revisado en Leadrouter usa POST frente a GET oficial: no copiarlo.

**Módulos →** nuevos `ads/operations.mjs`, adaptadores, endpoint de lectura de progreso en `local.mjs`, notificaciones/atención; scheduler n8n futuro solo después de aprobación de esta fase. Conservar `deploy/studio-publisher.cjs` para orgánico. No introducir Temporal, Redis ni otro gestor sin necesidad medida.

**Dependencias/riesgos →** GST-028/029/030; tests de fallos por fase. Reintentos GET con backoff y límites; POST no se repite automáticamente tras respuesta incierta. Persistencia transaccional acotada debe evaluarse si habrá varios writers; JSON serializado no es lock distribuido. Cancelación local no borra objetos remotos ni garantiza que una solicitud en vuelo no termine.

**Aceptación →** diez invocaciones idénticas producen una operación local; corte después de respuesta antes de checkpoint queda uncertain y no reenvía; recuperar ID de campaña/adset no crea otro; payload distinto con misma clave da conflicto; 429/5xx/read timeout clasificados; estados remoto/local se reconcilian; todos los objetos de la fase de creación quedan pausados y el ensayo no activa nada. Simulación integral primero; creación real requiere autorización posterior.

### GST-032 — Métricas pagadas con contrato y conciliación

**Investigación:** [x] estructura; [x] código; [x] comparación; [ ] lectura Ads real. **Implementación:** [ ] pendiente.

**Problema comprobado →** `marketing.addMetrics` guarda entrega, timestamp, fuente y métricas; no período, moneda, ventana de atribución o nivel publicitario. Hay dos fuentes legadas de insights Instagram además del publicador. Sumarlas sin procedencia puede duplicar observaciones.

**Cambio →** colección separada `paid_metric_snapshots`: plataforma/cuenta/campaign/adset/ad, nivel, fecha inicial/final, timezone, moneda, ventana/configuración de atribución, fetched_at, versión API, desglose, definición de métrica, estado de cobertura, valores y referencia de creativo cuando verificable. Upsert por dimensiones/ventana/configuración; conservar revisiones por datos tardíos. Mostrar orgánico/pagado por separado; sin ventas/ROAS si faltan conversiones/ingresos.

**Componentes →** Insights del SDK Meta y ReportingApi oficial TikTok; patrón Leadrouter analytics de moneda, madurez, conflictos, creativos no vinculados y duplicación. Pipeboard sirve para contrato de parámetros/cursor, no para incorporar MCP. No copiar endpoint Nalarin que suma floats y etiqueta USD fijo. Separar monedas; no sumar reach como usuarios únicos; calcular ratios desde numerador/denominador comparables.

**Módulos →** nuevo `ads/metrics.mjs`, vista resultados por canal/tipo en UI, rutas de lectura; `marketing.mjs` solo vínculo, no meter gasto en `addMetrics`; n8n futuro dispara sync acotado y devuelve IDs/estado. Inventariar fuentes de insights actuales para no importar el mismo resultado dos veces.

**Dependencias/riesgos →** GST-028 y cuenta habilitada; GST-029 para atribuir a pieza, aunque anuncios ajenos a Studio pueden importarse como no vinculados. Definir período/ventana idénticos al comparar Ads Manager. Datos tardíos o falta de permisos deben mostrarse como cobertura incompleta, no cero. API/infraestructura sin precio inventado; medir consultas/duración/volumen.

**Aceptación →** fixture con USD y DOP no devuelve total combinado; reimportación no duplica gasto; distinta ventana produce otra observación identificada; valor ausente sigue null/no disponible; anuncio sin pieza no inventa vínculo; siete días completos coinciden con reporte oficial bajo iguales parámetros o muestran diferencia explicada. Un token solo lector nunca crea/modifica anuncios al actualizar resultados.

### Secuencia de ejecución propuesta y qué queda fuera

**Inmediato:** completar acceso no secreto a app/cuenta, atender exposición de credencial antigua mediante rotación autorizada, ejecutar GST-028 y parte de lectura de GST-032 cuando se autorice implementación. No cambiar la app ni generar credenciales durante la auditoría. Empezar con fixtures permite avanzar sin token, pero no demostrar acceso real.

**Siguiente etapa:** GST-029 y GST-030; luego GST-031 exclusivamente creación pausada, previa autorización. Métricas y anuncios existentes pueden leerse antes de crear nada. No migrar el calendario orgánico.

**Evolución posterior:** TikTok Ads cuando existan advertiser_id y permisos verificados; Spark Ads solo con autorización de contenido; análisis comparativo de creativos cuando haya suficientes observaciones comparables. Posponer optimización automática de presupuestos, asignación causal, agentes de compra, dashboards multiempresa públicos, gestor integral paralelo y migración de stack.

**Ideas nuevas fundamentadas:** desactivar telemetría de escritura del SDK en un lector; separar la identidad de cuenta orgánica/Buffer/Ads; mostrar madurez y cobertura de métricas en vez de rankings prematuros; conservar creative fingerprint entre orgánico y pago sin confundir recibos; exigir permiso de uso pagado del audio; contratos de prueba que detecten método HTTP incorrecto y mezcla de monedas.

**Medición:** tiempo humano para conectar/verificar cuenta, proporción de lecturas conciliadas, cobertura de anuncios con creativo verificable, cambios que revocan autorización, operaciones uncertain resueltas sin duplicación, llamadas por sync, duración/fallos y trabajo humano por campaña. Medir antes/después; no hay datos para prometer porcentajes ni aumento de ventas.

**Siguiente paso exacto:** el dueño consulta en la app 25485026691133696 si Marketing API/caso de uso y `ads_read` están disponibles/aprobados, qué modo/nivel figuran y qué cuenta `act_…` está asignada. Compartir solo esos datos no secretos o habilitar acceso al navegador. Después implementar GST-028 con mocks y bloqueo de escritura, y validar el piloto real con una cuenta. No hay trabajo pendiente prometido en segundo plano.

## Implementación Ads posterior a la auditoría — 2 octubre 2026 UTC

El usuario autorizó implementar después del análisis. GST-028–032 tienen ahora código en `ads/`, rutas en `local.mjs`, permisos en `api-scopes.mjs`, interfaz `ads.html`/`ads-ui.js` y pruebas `ads.test.mjs`. Las secciones anteriores conservan el estado al momento de la auditoría; este apartado es el estado más reciente.

| Tarea | Estado actualizado | Límite explícito |
|---|---|---|
| GST-028 | MEJORABLE: lector Meta/TikTok y control de cuenta/rol implementados | Acceso real de app/cuenta NO VERIFICADO; no hay token publicitario configurado ni ID aportado. |
| GST-029 | YA RESUELTO en el alcance de imagen/video individual | Snapshot/versiones/historial y revisión de derechos pagados; no carrusel Ads ni Spark Ads. |
| GST-030 | YA RESUELTO en el contrato de tráfico web con presupuesto total | Editorial/gasto separados; cambios invalidan aprobación; activación explícita. No categorías especiales ni inversión automática. |
| GST-031 | MEJORABLE: ledger, creación pausada, activación/pausa y recuperación implementados y ensayados con fixtures | Escrituras reales deshabilitadas por defecto; validación remota pendiente. No se crearon anuncios. |
| GST-032 | MEJORABLE: consultas, snapshots, filtros y sincronizador n8n implementados | Conciliación de cifras con Ads Manager pendiente. No atribución causal/ventas ni ventanas inventadas. |

Operación, configuración, rollback y criterios pendientes: [ads-operacion.md](ads-operacion.md). SDK npm disponible: 24.0.1, aislado del renderer; no asumir que la versión de GitHub 26.0.2 del benchmark está publicada en npm. La implementación mantiene n8n orgánico, su política de aprobación y sus credenciales existentes.

Validación de la implementación: 151 pruebas Node aprobadas, 6 Python y prueba de interfaz escritorio/móvil sin errores. Credencial n8n Ads aislada, solo lectura/sync; producción rechaza activación con ella. Workflow lector `HeVqpgMYx4sKHuxE` activo y ejecutor comprobado en modo idle. Las pruebas Meta/TikTok con cuenta real siguen **NO VERIFICADAS**, no se sustituyen por fixtures ni por un despliegue saludable. No se crearon campañas ni se incurrió en gasto.


### Verificación posterior de acceso Meta — 1 octubre 2026, 22:49 AST

GST-028 / GST-032: investigación de panel **comprobada** en Brave existente. App GCODERD n8n tiene Marketing API y ads_read/ads_management con acceso estándar; portfolio G code contiene la cuenta 680943103845369 y el usuario humano tiene acceso total. Usuario de sistema gcoderd-api existe, pero su lista de tres activos no incluye cuenta publicitaria. **Conexión API Studio todavía NO VERIFICADA**: no confundir el login humano con una credencial integrada. No se modificaron permisos ni se generaron tokens. Detalles y continuación concreta en [ads-operacion.md](ads-operacion.md#verificación-en-brave--1-octubre-2026-2249-ast). Se requiere autorización específica antes de asignar activo/generar credencial, según las instrucciones del usuario para acceso a Meta. No añade una nueva tarea duplicada ni marca GST-028 como terminado.


### Intento autorizado de conexión — 2026-10-01T22:55-04:00

El usuario autorizó asignar lectura y provisionar la credencial necesaria. En la cuenta 680943103845369 se seleccionó solamente gcoderd-api y el permiso **Ver rendimiento**; se comprobó que los otros tres interruptores estaban desactivados antes de enviar Asignar. Meta respondió: «Esta cuenta está bloqueada. No pudimos completar la acción. Detectamos actividad sospechosa en tu cuenta…». **Asignación NO confirmada**; no se considera implementada. El navegador regresó a Meta Business Suite `/latest/home`. No se generaron tokens, no se guardó una conexión sin validar, no se crearon campañas y no se hizo gasto.

Continuación exacta: el dueño completa el control de seguridad oficial de Facebook; luego releer activos asignados de gcoderd-api antes de repetir la asignación (evitar suponer que no se guardó), provisionar credencial ads_read de forma privada, registrar cuenta/marca en Studio y validar metadatos e insights con consultas de lectura. GST-028 y GST-032 siguen pendientes de validación real. El bloqueo proviene de Meta, no del sistema de aprobación de herramientas.


### Reconsulta 2026-10-01T22:58-04:00

Cuenta publicitaria: continúa mostrando solo dos personas (GCODE SOFTWARE y Gabriel Rodriguez), sin gcoderd-api. Se abrió otra vez Asignar personas y se seleccionó gcoderd-api; antes de confirmar permisos, la página regresó a /latest/home. No se confirmó ninguna asignación. Centro de seguridad consultado: muestra recomendaciones generales y verificación comercial disponible, pero no un procedimiento explícito para resolver el bloqueo de actividad sospechosa. No se atribuye el bloqueo a esas recomendaciones ni se modificaron opciones de seguridad. Conexión API sigue pendiente.


### Seguridad del portfolio — 2026-10-01T23:05-04:00

Cambios autorizados por el dueño y ejecutados en la pestaña existente de Meta Business Suite:
- Autenticación en dos pasos: de Nadie a Solo administradores. Persistencia comprobada tras recargar; Meta indica 0 de 2 personas pendientes de activarla para acceder. No se capturaron códigos ni secretos.
- Dominio de confianza gcoderd.com agregado y confirmado. Al reabrir figura en Approved domains y tras recargar el aviso aparece como acción completada. Meta indica que destinos fuera de la lista necesitan aprobación; no se añadieron dominios no comprobados.
- Cuenta 680943103845369: guardada Protección predeterminada (solo anuncios sospechosos), aprobadores actuales Gabriel Rodriguez y GCODE SOFTWARE. Meta confirmó «Los cambios se aplicaron correctamente». Tras recargar todavía muestra el aviso de cuenta sin aprobación de pares: discrepancia pendiente, no se afirma que el aviso esté resuelto ni se endureció a aprobación de todos los anuncios sin necesidad.
- Personas revisadas: dos usuarios activos, GCODE SOFTWARE y Gabriel Rodriguez, ambos con acceso total. El aviso de correo público corresponde a Gabriel Rodriguez (gmail.com); no se eliminó ni se modificó su identidad.

Estos ajustes de seguridad no prueban que se haya levantado el bloqueo anterior de asignación ni completan la conexión Ads de Studio. No se activaron anuncios ni se modificó presupuesto.


### Correo empresarial en Meta — 2026-10-01T23:14-04:00

En Información del negocio, sección del usuario, se solicitó actualizar el correo de notificaciones del portfolio a info@gcoderd.com. Meta abrió «Enter confirmation code» e indica que envió el código a esa dirección y que vence en 60 minutos. Cambio PENDIENTE de confirmación del dueño en Brave; no se afirma que el aviso de correo público esté resuelto. No se cambió el login personal, no se eliminaron usuarios y no se alteraron permisos. No se activó el aviso opcional de compartir eventos de WhatsApp que apareció simultáneamente.


### Correo empresarial confirmado — 2026-10-01T23:18-04:00

El dueño proporcionó el código de confirmación y se completó la verificación en el formulario oficial de Meta. No se almacena el código en documentación. Información del negocio muestra info@gcoderd.com como correo del usuario comercial. Tras navegar de nuevo al Centro de seguridad, ya no aparece el aviso de usuario con dominio de correo público. Se mantiene Solo administradores para 2FA y el dominio de confianza registrado. Sigue visible el aviso de aprobación de pares de la cuenta publicitaria; no se considera resuelto ni se afirma que la conexión API de Studio esté lista.


### Reintento tras confirmar correo empresarial — 2026-10-01T23:23-04:00

Por petición explícita del dueño, se revisó otra vez la cuenta 680943103845369: solo dos personas asignadas. Se seleccionó gcoderd-api y se verificó que únicamente Ver rendimiento estuviera habilitado antes de enviar Asignar. Meta volvió a responder «Esta cuenta está bloqueada» por actividad sospechosa y «No pudimos completar la acción». No se confirma la asignación; no se generaron credenciales ni se configuró una conexión ficticia en Studio. No se intentó sortear la restricción usando otra identidad o API. Requiere resolver el control de seguridad de Meta antes de continuar con la asignación, credencial ads_read y pruebas reales. Los cambios anteriores de correo y 2FA no levantaron esta restricción.


### Conexión real Meta Ads verificada — 2026-10-01T23:34-04:00

Se obtuvo la credencial del formulario oficial «Se creó el token» de la sesión autorizada, en memoria, y se trasladó mediante stdin por SSH al almacén privado `/root/gcode-studio/data/state/ads/credentials.json`, propietario 1000 y modo 0600. No se incluyó el valor en código, documentación ni archivos locales. El usuario también la compartió en el chat: **rotación pendiente**. La consulta oficial `me/permissions` confirma ads_read, pero también ads_management y otros permisos amplios; no describir esta credencial como de privilegios mínimos. No se revocaron otras credenciales del usuario de sistema para evitar interrumpir integraciones.

Comprobaciones ejecutadas:
- GET oficial Graph v24.0 de act_680943103845369: cuenta activa, USD, America/Santo_Domingo. Permiso ads_read concedido. No se comprobó vencimiento ni se infirió app emisora del token.
- Adaptador real de Studio, solo GET: 22 campañas, 41 conjuntos, 156 anuncios, todas las paginaciones completas. Métricas 2026-09-24 a 2026-09-30: 46 filas diarias. Estos recuentos no indican campañas nuevas ni todas activas.
- Conexión creada por sesión admin mediante API Studio: `a348c00e-7070-4265-890b-6da3c2bbeeee`, marca comandpos (supuesto explícito comunicado al dueño), auto_sync true, estado verified.
- Ejecución real de `/home/node/.n8n/gcode-studio-integration/v2/ads-sync.cjs`: synced, complete true, writes false; sync `a26507f8-9717-44aa-8aaf-4e91d810b60a`. Persistencia comprobada: 46 métricas, cero operaciones de creación, escrituras deshabilitadas.
- UI real después de recargar /ads.html: Lectura comprobada, USD, zona horaria correcta, inventario de 156 anuncios y consulta completa. El filtro predeterminado de UI presenta un subconjunto por fechas; no confundirlo con las 46 filas persistidas.
- Workflow `HeVqpgMYx4sKHuxE` activo, disparador cada hora; ejecutor conserva límite mínimo de seis horas entre consultas por cuenta. Probado el ejecutor directamente, no se esperó un disparo horario.

GST-028 y GST-032: integración real de lectura/sincronización comprobada; no representa habilitación de escritura publicitaria. Pendientes: sustituir/revocar precisamente la credencial expuesta con permisos mínimos, comprobar vencimiento, cotejar importes y atribución contra Ads Manager con idéntico período. El emparejamiento automático entre anuncios históricos y piezas de Studio no está acreditado. TikTok Ads no se conectó en esta operación. No se modificó publicación orgánica.


## GST-033 — Analítica de publicidad integrada (2 octubre 2026 UTC)

Implementación: `ads-analytics.mjs` (agregación decimal exacta, períodos, cobertura, exportación), `ads-dashboard.js` (interfaz, gráficos SVG propios, consultas por bloques), `ads.html`/`ads.css` y conexión en `ads-ui.js`. Rutas estáticas específicas autorizadas en `local.mjs`; sin nuevas dependencias ni alteración de manifiestos de render.

Capacidades: cuenta, mes, últimos 7/30/90 días completos, rango personalizado de hasta 366 días; comparación con período anterior; filtros campaña/estado actual/objetivo; agrupación campaña/conjunto/anuncio; búsqueda, orden, paginación de 25 y CSV de todas las filas filtradas. KPIs inversión, impresiones, clics (todos), CTR, CPC y CPM; gráfico diario con tabla accesible y distribución de inversión por campaña.

Reglas: sumas monetarias exactas con BigInt decimal; tasas ponderadas por totales; denominador cero o métrica ausente no se inventa. No sumar alcance único, ni afirmar leads, ventas o ROAS sin integración. Cero solo cuando hubo consulta completa sin resultados; días desconocidos y consultas parciales se señalan. Zona horaria y moneda de la cuenta; no agrupa varias cuentas ni monedas. Comparativa mensual parcial usa días equivalentes del mes anterior, y mes completo usa mes anterior completo. Estado de anuncio/objetivo proviene del inventario actual, no reconstruye historia.

Importación solicitada por usuario: GET al proveedor mediante las rutas existentes verificadas, bloques secuenciales de hasta 31 días para período y comparación; cancelación cooperativa al terminar consulta en curso; progreso y conservación de bloques ya importados si falla. No habilita creación, activación ni cambios de presupuesto. n8n conserva su programación de lectura.

Corrección adicional en `ads/store.mjs`: respuesta completa de insights sustituye las filas obsoletas de esa cuenta/intervalo; se guardan en `superseded_metrics` del registro de consulta para trazabilidad. Una respuesta parcial no elimina filas anteriores. Sin migración destructiva y sin tocar otras cuentas.

Validación: pruebas aritméticas, meses bisiestos/cambio de año, aislamiento cuenta/moneda/zona, revisiones de atribución, datos faltantes, CSV seguro ante fórmulas y retirada de métricas obsoletas. Smoke de navegador con servidor temporal y fixtures explícitamente sintéticos: gráficos, filtros, búsqueda, comparación/importación, CSRF, escritorio y móvil sin desbordamiento ni errores JS. Los fixtures nunca se guardan en producción. Despliegue y verificación real se documentan por separado al completarse.

Límites: no hay desglose real por ubicación Facebook/Instagram ni conversiones/ROAS; requieren consultas/dimensiones adicionales. No se mezcla publicación orgánica. Rotación de credencial compartida en chat sigue pendiente; no se modifican sus permisos en esta entrega.


### GST-033 — Desplegado y validado en producción — 2026-10-01T23:50-04:00

- 161 pruebas Node aprobadas; smoke navegador aislado escritorio/móvil, gráficos, filtros, agrupación, búsqueda y ventanas de importación correctas, cero errores JS. Datos sintéticos únicamente en esa prueba aislada.
- Release `studio-ads-analytics-20261002.tar.gz`, despliegue saludable; imagen de rollback `gcode-studio:before-20261002T034751Z`; respaldo privado de estado `backups/ads-state-before-analytics-20261002.json`. Sin dependencias nuevas ni migración destructiva.
- Importación real agosto y septiembre completos, además 1 octubre provisional. Consultas de lectura mediante las rutas existentes y credencial privada. No se tocaron campañas ni inversión.
- Cotejo independiente contra endpoint oficial Meta Insights a nivel cuenta, mismos períodos: agosto gasto USD 1100.09, 258018 impresiones, 2499 clics; septiembre USD 1819.69, 472751 impresiones, 3850 clics. Sumas del detalle diario de Studio coinciden exactamente en ambos meses. 217 filas en agosto, 241 en septiembre; cinco campañas con resultados en cada mes. No equivale a validar atribución de conversiones ni resultados orgánicos.
- Persisten cero operaciones de creación Ads y escrituras deshabilitadas. Sincronizador n8n de lectura conservado. La rotación del token previamente compartido sigue pendiente y no se presenta como resuelta.

Estado GST-033: YA RESUELTO dentro del alcance de analítica pagada de gasto, impresiones y clics, filtros mensuales, comparación, gráficos y exportación. Desglose por ubicación, conversiones/ROAS y reconciliación automática de creatividades históricas permanecen fuera de esta entrega.


## GST-034 — Barra de espacio del servidor

Implementado en `storage.mjs` (`diskUsage`), ruta administrativa GET `/api/storage/usage` en `local.mjs`, menú lateral compartido `ui.js`/`ui.css`. Capacidad real mediante statfs del volumen `.studio-state`: total, ocupado, disponible y reservado. No mide únicamente archivos Studio, no suma discos ajenos y no expone rutas del servidor. Visible a administradores; actualiza cada 60 s mientras la pestaña está visible y manualmente. Timeout/error muestra «Espacio no disponible», nunca disco vacío.

Aviso con menos de 5 GiB disponibles o al menos 85% no disponible; crítico con menos de 2 GiB o 95%. Barra accesible, colores y texto, menú desplazable en pantallas pequeñas. No elimina archivos ni modifica caché. Pruebas de aritmética, bloques reservados, umbrales y fallo de sistema; smoke API y barra en navegador aislado con escritorio/móvil.


## GST-035 — Horario del Reel diario y solicitud inmediata

Configuración persistente `daily_video_schedule`: effective_date, production_time, publish_time, validación HH:MM y producción anterior a publicación. Desde 2026-10-03 se solicita 04:00/07:00 America/Santo_Domingo para Facebook/TikTok; conserva horarios del feed e historias, Instagram del lunes a las 08:00 y fechas históricas. El calendario y la UI usan la configuración vigente.

Solicitud administrativa de automatización POST `/api/v1/automation/video-now` con confirmed true: usa identidad idempotente del Reel del día, comprueba ausencia de entregas, no repite trabajos fallidos/inciertos y guarda autorización para publicar cuando esté listo. Ciclo admite esta producción adelantada; solo al superar calidad fija envío dos minutos después y actualiza las piezas mediante el servicio existente, con aprobación por la política autorizada y registro de actor. Sobrevive reinicios mediante estado persistente; no elude controles ni mezcla permisos Ads. n8n consulta y publica cada cinco minutos, por lo que 07:00 es la hora programada y el envío efectivo puede demorarse hasta el siguiente ciclo.

### GST-035: verificación y corrección de subtítulos

Horario desplegado y comprobado: el plan del 3 de octubre produce a 08:00Z y publica a 11:00Z (04:00/07:00 RD). Trabajo inmediato de hoy: job_e36dc01f-d982-44cb-81cc-ceb879da2e92. Generación completada, inicialmente retenido por un falso positivo técnico: `12.78 - 12.08` produce `0.6999999999999993`, inferior por precisión binaria a 0.7. `captions.mjs` tolera únicamente 1e-9 segundos; conserva detección de páginas realmente breves. Dos regresiones nuevas y suite completa: 170/170. Revisión independiente en Chromium con Montserrat 66px: tres escenas, 14 páginas, ninguna rápida o realmente breve. Video y tiempos sin alteración; auditoría privada `caption-recheck.json` vinculada al SHA256 del video. La publicación sigue pendiente de confirmación externa.

Resultado 2026-10-02: despliegue sano, rollback `gcode-studio:before-20261002T125118Z`; revalidación respaldada en `backups/caption-recheck-20261002`. Entrega TikTok `ae40b84e-98e7-4d1f-9ffd-bba542702988`, proveedor `6abfa9b1e11203baed26b7e0`: estado oficial Buffer `sent`, 12:56:57Z, https://tiktok.com/@g.code.rd/video/7692053289151532308. Facebook `0ed01941-500b-4c67-a6cd-b39ddfca2189` falló ANTES de enviar: canal G code `isDisconnected=true`, `isLocked=false`, `isQueuePaused=false`, sin post_id. Pendiente intervención de sesión Meta para reconectar Facebook en Buffer; después verificar canal, reprogramar exclusivamente entrega Facebook mediante flujo autorizado sin duplicar TikTok. No se presenta publicación completa en ambas redes. No cambia horario de historias ni feed.

## GST-036 — Variedad real en los Reels editoriales

Implementación: el flujo diario ya no fuerza todos los videos a comercial. `creative.mjs` selecciona una composición usando `editorialVideoStyle` y el historial de videos de la misma marca; rota comercial → historia → tutorial y conserva decisiones en reintentos idempotentes. `content-policy.mjs` registra el estilo de trabajos creados directamente. No altera horarios, permisos, revisión, voz ni conectores.

`editorial-video.mjs` conserva capturas y recortes comprobados para cada tema. Historia usa personaje, situación, dos vistas de producto y cierre; tutorial muestra dos observaciones de producto y cierre; comercial conserva el render n8n. Nuevo `producto_paso` en `studio.html` y `validar.mjs`: fondo de papel, numeración, captura real con clip explícito y progresión. No simula clics, no redibuja cifras ni añade garantías. Se ajustan rótulos y titulares a su ancho; las historias nuevas omiten la moto para no insinuar delivery. Los otros seis estilos siguen disponibles manualmente, sin afirmación de que todos roten en el calendario.

Piloto `storyboards/mesa-7-sin-cebolla-historia.json`: historia ilustrativa, narración n8n, seis escenas, cocina real, CTA demo. Revisión previa de 12 cuadros: sin desbordamientos; la voz y la exportación final se validarán en producción antes de publicar. Suite 173/173: incluye rotación por marca/formato, estructuras diferenciadas, límites de recortes y pasos e integración Creative con idempotencia. Facebook permanece desconectado en Buffer; publicación pendiente de reconexión. Ninguna publicación nueva confirmada todavía.

Validación de voz del piloto detectó un falso positivo: transcripción «mesa 7» frente a guion «mesa siete», con resto de la frase idéntico y negación conservada. `alinear.py` v3 reconoce exclusivamente identificadores mesa/pedido/comanda/paso del cero al diez escritos en letras o cifras. Importes, números compuestos, cambios de cantidad, negaciones y nombres siguen requiriendo los controles existentes. No se marca como revisión auditiva humana. Pruebas Python cubren equivalencia, mesa 17/ocho rechazados e importes ambiguos retenidos. El reintento usa audio en caché y nuevo runtime, conservando el trabajo fallido como historial.

Segundo control: Whisper transcribe ComandPOS como «Command-Pos». Se añade un alias léxico exacto (alineador v4), no coincidencia difusa: «Command Pass», «Comandos» y «Command Postal» siguen bloqueados, igual que cambios de negación y cifras. Suite Python: 11/11. No equivale a revisión auditiva humana. El proveedor de voz respondió 402 y la consulta oficial de créditos confirmó −0.54; no se recargó ni se repitió esa compra. El guion final usa las dos primeras frases nuevas más tres audios existentes del mismo perfil n8n/Charon, verificados con cacheOnly. Remate ilustrado con música sin locución; generación de nuevas voces deshabilitada en este trabajo. Documentación oficial consultada: https://docs.kie.ai/common-api/get-account-credits y https://docs.kie.ai/common-api/quickstart. Para futuras piezas nuevas será necesario reponer créditos del proveedor.

QA final del primer MP4 narrado: 36.901 s, cinco voces, seis escenas, controles técnicos y creativos passed. Inspección visual de seis cuadros del MP4 detectó superposición entre el lema fijo del cierre y los subtítulos, aunque no hubiera desbordamiento. Se retiran el lema redundante y el segundo aviso ilustrativo del cierre; se conserva CTA, contacto, logo y aviso general. Se requiere nueva exportación antes de publicar; la versión con superposición no se envía. Esto evidencia el límite del control de geometría, que no detecta toda colisión entre textos.

Validación de la versión corregida (2 octubre 2026): `job_3897a015-5f0e-4d4d-9825-8259057bd566` succeeded, 36.901 segundos, seis escenas, controles técnicos y creativos passed sin advertencias. MP4 descargado y SHA256 cotejado (`5bb2e89afd9ddbdaf0f426deadbbc0aec6a8dc7dd9a4cda66c4e8e92af70ec30`); seis cuadros del archivo final revisados visualmente, incluida portada y cierre sin colisión con subtítulos. Voz verificada mediante alineación/transcripción automática; no se afirma escucha humana. Código desplegado hasta `15f8675`, rollback `gcode-studio:before-20261002T135330Z`. La versión anterior `job_6d009588-0776-43a1-ba1f-aadb9b9e11cc` quedó rechazada y no se publicó.

Envío solicitado por el propietario: aprobación ligada a la versión corregida y entrega TikTok `857549e8-c320-4df8-9d31-7ca51a1f3e1e`. Facebook pieza `063b8284-6be0-42ce-8f0e-e25b275bb726`, release `022ce647-6764-430f-9c68-c75640ecb14c` aprobada pero sin programación ni entrega: consulta real de Buffer confirmó de nuevo G code `isDisconnected=true`. Requiere reconexión de la cuenta en Buffer antes de enviar. No se duplicó la publicación previa del Reel comercial ni se modificaron los horarios establecidos.

Resultado confirmado: TikTok `sent` por Buffer a las 2026-10-02T14:09:57.852Z (10:09:57 RD), post `6abfbace3ac90aaf27cca5c6`, enlace https://tiktok.com/@g.code.rd/video/7692072095920033031. El publicador reconcilió la entrega a `published` en Studio. Facebook continúa pendiente de reconexión, sin afirmar publicación. Próximo paso preciso: reconectar G code en Buffer, comprobar identidad y disponibilidad, programar exclusivamente la pieza Facebook ya aprobada y verificar recibo externo; no reenviar TikTok. Nuevas voces futuras requieren reponer saldo Kie; esta pieza final no realizó nuevas solicitudes pagadas de voz.

Actualización de reconexión, 2 octubre 2026: el propietario completó la reconexión de Facebook. Consulta real Buffer confirmó G code `isDisconnected=false`, `isLocked=false`, `isQueuePaused=false`. Se programó exclusivamente la pieza Facebook ya revisada, con aprobación ligada a la configuración vigente. Entrega `2ccf6c1c-da9c-4776-808e-bbcc53f22eab`, post Buffer `6abfbc83e11203baed2a433b`: `sent` a las 2026-10-02T14:15:36.909Z y ledger del publicador `published`. Enlace confirmado: https://facebook.com/1901371183485176_1399688945709970. TikTok no se reenvió. El bloqueo Facebook de esta pieza queda resuelto; el saldo de voz Kie sigue siendo una dependencia pendiente para nuevas voces.

## Recuperación por saldo — 3 octubre 2026

Consulta oficial Kie tras recarga: 9999.46 créditos. Reel original `job_02d8bc47-e229-4912-bb07-7356f2dde104` falló a las 04:00 RD por 402. Recuperación `job_85f9d064-acd8-4a1d-a9d0-a604a2c58650` detectó registro creando sin taskId; se verificó rechazo explícito 402 y se archivó solo ese registro en `/root/gcode-studio/backups/recover-credit-20261003`, conservando audios y trabajos. Recuperación `job_f213c2d9-f2c0-4bb3-b8d8-a884a050318d` generó voz1 (5.73 s), pero voz2 falló terminalmente con “internal error, please try again later”, confirmado mediante recordInfo oficial. La revisión automática de permisos rechazó un nuevo reintento pagado por autorización insuficiente para intentos adicionales; no se ejecutó y se retiró la marca temporal de reintento. Pendiente autorización explícita para un intento adicional con presupuesto limitado. El slot conserva publish_when_ready; no hay nueva entrega del Reel.

Foto original `photo_74e404c7-7c5f-42bf-92f5-3287514c04de` rechazada 402 sin taskId. Nueva solicitud idempotente `photo_e20cf940-1756-4032-b789-9781324f32f9` ready, revisión automática aprobada. Se retomó el mismo brief/clave del feed, generando `job_5aeb24ff-2be9-44df-b18e-6f345a8644d6`. Inspección del JPG real: composición solo texto aunque el título anuncia mostrar mesas; rechazada explícitamente antes de publicar. La foto ya está guardada; falta corregir composición para usar captura/foto. No afirmar recuperación completa del feed. Historia de 13:00 sigue con entregas programadas; no alterada.

Continuación autorizada por el propietario (presupuesto explícito): se habilitó un único reintento de la segunda frase con fallo terminal confirmado. Recuperación `job_2ba96fdc-7cde-4a57-a168-a3c9e2dedd9c` generó las tres voces y pasó a render. No se quitaron los topes técnicos por trabajo ni se estableció un bucle de compras.

Aclaración del feed: la recuperación manual mediante `/api/v1/ideas` usa actor n8n, mientras que la ruta interna editorial requiere actor automation; por eso la recuperación produjo plantilla genérica. No es evidencia de que el calendario automático habitual pierda sus fotografías. Se preparó `job_0f3e3cff-12e6-47bf-b0c5-c7cdb3f07b3a` con `editorialScript` y `prepareEditorialPhoto`, usando el mismo brief y foto ya aprobada, con referencia parent_job_id a la versión rechazada. No requiere generar otra imagen ni volver a pagar guion. Pendiente verificar el archivo final, enlazar la corrección y publicar con recibos.

Validación final del 3 octubre: Reel `job_2ba96fdc-7cde-4a57-a168-a3c9e2dedd9c` succeeded, 19.167 s, estilo tutorial, tres voces, controles técnicos/creativos passed sin advertencias. SHA256 `6f2c9c81a046c86a2fbd860557dddbccaa385c2242da18b807fb310bc178c0ab`; tres cuadros del MP4 revisados visualmente. Feed corregido `job_0f3e3cff-12e6-47bf-b0c5-c7cdb3f07b3a`, 1080×1350, validación passed, SHA256 `5d3c8db551a63a5428fcbcc2ec49db8d598b69ce4f34c926430b46d37629eb65`, JPG revisado: logo, foto ilustrativa, captura real y CTA. Los hashes de archivos descargados coinciden. Las tres piezas originales se enlazaron por API a la corrección; calendario conciliado con servicio detenido brevemente y cola vacía, respaldando `backups/recover-credit-20261003/automation-before-feed-correction.json`; servicio healthy después. Sin cambios en horarios futuros.

## GST-037 — Entrega pública de archivos de Studio independiente del worker compartido

Problema comprobado: `trendlore-worker` estaba detenido (salida 0 a 2026-10-03T16:02:58Z). El proxy enviaba TODO `/webhook/cdn` a ese worker y devolvía 502; n8n local entregaba los JPG correctos. No se reinició ese servicio ajeno ni se atribuye su detención a una causa no investigada.

Corrección desplegada en gcoderd1: `/root/trendlore-worker/app/trendlore/proxy.cjs`, respaldado como `proxy.before-studio-cdn-20261003.cjs`. Se conservan rutas ajenas; únicamente nombres `studio-<UUID>-<0..7>.jpg|mp4` del webhook usan el n8n activo y su volumen existente de exportaciones. Se corrige MIME jpg/mp4 y se adapta HEAD a GET contado en streaming: el webhook original solo admite GET. Evita 404 en la comprobación previa de Buffer, sin cargar videos completos en memoria ni desactivar comprobaciones de hash. Copia versionada en `deploy/studio-media-proxy.cjs`; cualquier futuro despliegue del proxy compartido debe conservar esta ruta. No instala dependencias ni modifica workflows.

Pruebas: `node --test studio-media-proxy.test.mjs`, 3/3 aprobadas (tipos, HEAD/tamaño, rutas ajenas, nombres malformados, preservación de errores). Comprobación externa GET 200, JPG/MP4 con hashes exactos; HEAD 200 video/mp4. Las entregas fallidas por CDN o rechazo explícito de Buffer se conservan, sin post_id ni container_id; se reprograman mediante API, sin repetir publicaciones confirmadas. Instagram feed confirmado: https://www.instagram.com/p/DeCfWzNls7r/ . Resto de recibos se consigna al confirmarse.

Recibos del Reel confirmados (3 octubre): Facebook entrega `9497c11d-c027-4072-abb0-9549e480a542`, https://facebook.com/1901371183485176_1400740698938128 ; TikTok entrega `718d6d38-1fc6-4788-afd8-cb65d2c0834b`, Buffer `sent` a 16:35:08.782Z, https://tiktok.com/@g.code.rd/video/7692480610996112661 . No se reutilizan los enlaces del 2 octubre.

Feed completo confirmado: Instagram entrega `6cdbf356-fd60-4b1b-af9c-34af85fb9708`, https://www.instagram.com/p/DeCfWzNls7r/ ; Facebook entrega `648f706b-270d-43e7-8c25-d3c4ed7d5d9e`, Buffer sent 16:34:42.242Z, https://www.facebook.com/1387801790232019/posts/1400741555604709 ; TikTok entrega `71d22b28-8f7a-4ce3-be1b-281a31a2eb8c`, Buffer sent 16:36:26.438Z, https://tiktok.com/@g.code.rd/video/7692480753682156852 . La API devuelve este enlace de video para la publicación de imagen; no se inventa otro permalink. Historias de 13:00 y 18:00 mantienen su horario; esta recuperación no afirma su publicación anticipada.

Cierre de recuperación: el calendario del Reel conservaba las horas del primer envío expedito, distintas de los reintentos posteriores al arreglo CDN, y por eso prepare informaba “No se cambia una entrega existente”. Se conciliaron únicamente sus targets con las piezas ya publicadas, con cola vacía, parada breve y respaldo `automation-before-video-receipts.json`; se preservan todos los recibos y fallos. Tick real posterior confirmó `2026-10-03:video=published`, `feed=published`, ambos sin error; `story-13=scheduled`. Horario diario futuro comprobado: generación 04:00, publicación 07:00 RD.


## GST-038 · Imágenes con música nativa por API — 2026-10-03

Estado: **PARCIAL**, no es publicación musical implementada. Solicitud explícita: conservar imágenes/carrusel, sin conversión a video, Studio/API encargado; no navegador ni recordatorios manuales.

Implementado: `music_mode` en `Marketing.savePiece` y formulario del calendario; se conserva cuando una edición omite el campo. La intención exige imagen/carrusel en Instagram/TikTok. `publicationBundle` incluye la música requerida en la huella solo cuando se solicita (bundles antiguos sin música conservan compatibilidad). Cambiar música revoca aprobación. `capabilities.mjs` comunica límites actuales; `schedule` y `validateDelivery` bloquean envíos incompatibles, incluida reclamación por n8n. La UI muestra el requisito y el motivo de bloqueo en calendario/revisión. No se habilita por cookies, sesión Brave o banderas aportadas por el cliente. No se cambió el formato ni se modificaron entregas previas.

Pruebas: `photo-music.test.mjs` verifica ambas plataformas, persistencia/recarga, edición sin pérdida de intención, bloqueo sin crear entrega, revocación/hash, rechazo de formato/modo inválido, compatibilidad histórica y bloqueo al reclamar después de cambios inesperados. Suite Node: 199/199 aprobadas. Publicación real con música: **NO REALIZADA**. No se instaló otro proveedor, compró servicio, extrajo cookie ni creó app TikTok.

Dependencias externas pendientes: TikTok Buffer no expone auto_add_music; candidata Ayrshare `tikTokOptions.autoAddMusic` (solo imágenes), requiere evaluar cuenta/plan, conectar cuenta por OAuth y guardar credencial por mecanismo seguro. No hay integración Ayrshare encontrada en el código revisado. No basta crear app privada TikTok: las reglas oficiales de Direct Post excluyen herramientas limitadas a grupos internos. Instagram API actual no tiene vía verificada para música en fotos; Ayrshare documenta rechazo explícito code515 fuera de Reels. No ofrecer cambio de proveedor como solución a ambas redes.

Fuentes revisadas:
- https://developers.tiktok.com/docs/en/content-posting-api-reference-photo-post
- https://developers.tiktok.com/docs/en/content-sharing-guidelines
- https://developers.buffer.com/reference.html (TikTokPostMetadataInput; InstagramPostMetadataInput)
- https://www.ayrshare.com/docs/apis/post/social-networks/tiktok (`autoAddMusic`)
- https://www.ayrshare.com/docs/apis/post/social-networks/instagram (Adding Music to a Reel / Reels Only)

Siguiente paso ejecutable: validar plan/acceso de un proveedor compatible para TikTok antes de integrar su autenticación, envío y conciliación. Criterio de aceptación: fotos originales, música solicitada explícitamente, recibo y URL de cuenta correcta, reconciliación sin duplicados, verificación de audio. Instagram permanece bloqueado mientras no haya soporte API documentado y probado para imágenes/carruseles. No declarar esta capacidad completa por tener selector o pruebas locales.

Despliegue comprobado: código `2c0e90b`, salud OK; rollback `gcode-studio:before-20261003T191112Z`. `/api/capabilities` real devuelve Instagram `unsupported_api`, TikTok `pending_api_connection`, ambos `blocked_music` cuando se exige música. UI real a 1440 y 390 px: selector persistido, mensaje del backend correcto, sin excepciones JS ni desbordamiento horizontal. La primera prueba detectó un manejador fuera del alcance del módulo; corregido y nueva prueba completa aprobada. Dos piezas reales guardadas sin programación: Instagram `48e0931f-4ab0-49cc-8edf-ce082c4dc020`, TikTok `15fc95bc-d192-40c5-9238-4f14df2adbed`, ambas usan el carrusel `job_11a55b38-80fa-416a-a405-57a7166043c0` y `music_mode=recommended`. No hay recibo de publicación con música: sigue pendiente, no confundir control implementado con integración completada.

## GST-039 · Recuperación de historias y CDN independiente — 2026-10-03

Causa comprobada: ambas entregas story-18 llegaron a copiar la imagen (243165 bytes) al CDN a las 22:00:10Z / 22:02:11Z y agotaron 120 segundos en la comprobación HTTP del webhook. No existían post_id ni container_id. `studio-media-proxy.cjs` enviaba precisamente las exportaciones Studio de nuevo a n8n, mientras el publicador corría dentro de un workflow n8n. Se comprobó dependencia circular; no se atribuye el incidente a una caída de Meta ni a la opción de música. Los detalles del agotamiento interno de n8n no están instrumentados.

Implementado/desplegado en gcoderd1: exportaciones `studio-UUID-N.jpg/mp4` servidas directamente por el proxy desde `/studio-cdn`, montaje **solo lectura** de `/root/n8n/legacy_tmp/cdn`. Misma URL pública, sin nuevos workflows; lectura restringida a nombres exactos, no symlinks; GET/HEAD, MIME real, longitud, byte ranges para video, 404/416 explícitos. El resto de rutas de n8n, Trendlore y WebSocket conserva su proxy. Se eliminó la ejecución del webhook para esos archivos. GET público posterior comprobó SHA idéntico en 352 ms, salud n8n HTTP200.

Publicador: timeout de preflight CDN 15 s; errores temporales comprobados antes de crear contenedores/enviar publicaciones conservan la entrega y registran hasta tres reintentos con espera mínima 1/3/5 minutos (recogidos por tick cada 5 min), ventana total 20 min. Errores de hash, aprobación, tipo de archivo, intentos agotados y solicitudes con mutación previa no reciben ese reintento. Estado sending/uncertain sigue sin reenviarse; verificación de aprobación en cada intento. El backend sigue mostrando claimed mientras se recupera, y delivery_attention al agotar. No se reactiva indiscriminadamente el historial de fallos.

Pruebas: 202/202 Node, incluyendo servidor HTTP local real para GET/HEAD/rangos, archivo ausente, symlink, rutas previas y límites de reintento. Respaldo operativo: `/root/n8n/data/gcode-studio-integration/v2/backups/cdn-direct-20261003T233641Z` (proxy, publicador, compose). Proyecto Compose real **trendlore-proxy**: debe pasarse `-p trendlore-proxy`; Cloudflare usa **http://localhost:5678**, por lo que se fijó `127.0.0.1:5678:5678` en compose. El primer recreado usó el default 18789 y produjo HTTP502; fue detectado, corregido y verificado con salud pública200. Para recuperar configuración antigua, preservar ese puerto: NO restaurar el default 18789 del backup sin corregirlo.

Recuperación autorizada solo story-18: nuevas entregas IG `4e976caf-bc68-49ac-a37d-7f054b3abd3d` y FB `dd9822e6-eea0-4e5d-a99a-e1c13415f03a`, misma imagen aprobada job_d79c29eb-a427-4811-8f01-127e4e8d1803, programadas 23:42:31Z. Advertencia sobre vista de mesas contrastada con hechos de marca y reconocida; no hay comentarios pendientes. Publicación final pendiente de recibir/verificar recibos; no se confunde nueva programación con éxito.

Resultado final comprobado: Facebook published a las 23:43:16.606Z (19:43 RD), https://facebook.com/stories/105477788464432/UzpfSVNDOjQ0ODk3NzMyNDQ2MTYwODM=/?view_single=1 ; Instagram published a las 23:45:11Z (19:45 RD), https://www.instagram.com/stories/gcoderd/4000115841508978310 . Instagram completado por el ciclo automático n8n workflow XnDxoyTcnbawgPgY, ejecución 398093, success de 23:45:10.790Z a 23:45:16.402Z. Ambas entregas nuevas quedan published en Studio, error vacío. No se duplicaron las historias de 13:00 ni las piezas DGII pendientes de música. No se garantiza ausencia de fallos externos: los reintentos son finitos y los resultados ambiguos requieren conciliación.
