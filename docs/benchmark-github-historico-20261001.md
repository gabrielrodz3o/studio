> HISTÓRICO de la primera auditoría. Los pendientes y conteos de pruebas de este archivo no describen el estado actual. Consultar benchmark-github.md.

# Benchmark de GitHub — GCODE Studio

## Segunda pasada: estado actual después de la implementación

Corte: 2026-10-01. **Investigación en curso.** Esta pasada contrasta el árbol de trabajo actual (incluidos cambios todavía sin commit) con las referencias. Las secciones anteriores se conservan como historial: los defectos GST-001–016 no deben interpretarse como pendientes sin consultar su implementación y revalidación. No se modifica funcionalidad ni se ejecutan proveedores de pago.

- [x] Inventario e historial actuales localizados.
- [ ] Código propio y pruebas revalidados.
- [ ] Diez referencias revalidadas.
- [ ] Nuevas oportunidades comparadas y priorizadas.


> Seguimiento de aplicación posterior: [implementacion-2026-10-01.md](implementacion-2026-10-01.md). Se aplicaron patrones con código propio; esta ejecución no equivale a haber integrado o validado en producción las aplicaciones externas.

**Corte: 1 de octubre de 2026.** Auditoría de estructura y flujos seleccionados completada; integraciones externas y publicación real **no ejecutadas**. Base local: `9817a41f6fa8ac13e4f052e97f1c6c5326a21c88`. Las recomendaciones no están implementadas.

## Método y límites

Se revisaron el historial local, documentación, frontend, servidor, contratos, persistencia, generación, composición, edición, revisión, publicador y despliegue. Se siguieron los flujos relevantes de diez referencias mediante copias aisladas en `/private/tmp/gcode-benchmark-20261001`, rama `main`, clones superficiales. No se instalaron dependencias ni ejecutaron scripts de terceros. Se excluyeron binarios, pesos, grabaciones, fuentes binarias, archivos generados/vendorizados y lockfiles de la lectura detallada. No se auditó cada línea de cada aplicación ni todas sus integraciones. El apéndice registra los módulos efectivamente consultados; los límites particulares están indicados abajo.

Mantenimiento comprobado significa commit/fecha, estructura de pruebas y configuración disponibles, **no** calidad demostrada, CI aprobado ni promesa de continuidad. No se usaron estrellas como criterio. La historia superficial no permite medir cadencia de releases. La licencia raíz fue leída; no sustituye la licencia de modelos, voces, música o dependencias.

**Pruebas propias:** 47/47 Node y 6/6 Python pasaron en esta auditoría. Tres fixtures reprodujeron pérdida de contexto al reintentar, bloqueo abandonado de presupuesto y coste incompleto de trabajos antiguos. Otro fixture verificó una colisión lógica de claves de escena al cambiar contexto visual. Este último prueba la identidad de caché, no un video renderizado incorrectamente. No hubo gasto de IA, envío social ni cambios de producción. No se repitieron el render audiovisual completo, pruebas de navegador ni verificaciones remotas de la etapa anterior. No se evaluó escuchando un casting nuevo.

## Base real de Studio

La implementación es Node ESM con servidor HTTP propio, HTML/CSS/JS, Ajv, Sharp y WaveSurfer; render de SVG/HTML con Chromium y FFmpeg; voz por kie.ai y alineación local whisper.cpp/Python. No se propone migrarla a React, Python, Rust o Temporal. Los archivos JSON y escrituras atómicas sirven a una instancia con cola limitada; no equivalen a una base distribuida. `Dockerfile` y `deploy/compose.yaml` contienen usuario no root, límites de recursos, volúmenes y healthcheck. Su funcionamiento remoto actual queda sin nueva comprobación.

| Etapa | Estado de capacidad | Lo que realmente conecta el flujo / límite |
|---|---|---|
| Marca | PARCIAL | `marketing.mjs:17 saveBrand`, biblioteca por marca, logotipo, colores, público, tono, restricciones y claims; `jobs.mjs:101` congela perfil/recursos. Ajustes `brand.design` no gobiernan todas las familias (GST-005). |
| Campaña / idea | YA RESUELTO para propuestas y organización | `planning.mjs:5 campaignContext`, `proposals:11`; `creative.mjs` usa selección, campaña e historial. Sin idea propone tres hechos priorizados. Similitud lexical, no detector semántico ni acceso probado a tendencias. |
| Guion | PARCIAL | `creative.mjs:38–57`, contratos Ajv y salida estructurada, IDs de afirmaciones en video. Evidencia declarada puede presentarse como verificada; cobertura desigual en imágenes (GST-007). |
| Recursos | PARCIAL | Biblioteca y comprobación de marca; `feed.mjs`, `photo-jobs.mjs:13–29` persisten taskId, generan foto, OCR y revisión visual. El flujo fotográfico inspeccionado está orientado a ComandPOS; no demuestra generación contextual para toda marca. Los derechos declarados no son una auditoría legal de cada recurso. |
| Composición | PARCIAL | `styles.mjs:1` ofrece nueve estructuras, `render.mjs:110` segmentos cacheados, `feed.mjs:21`/`brand-feed.mjs:10` imágenes, historia y carrusel. Cuatro formatos de video; carrusel actual de cuatro páginas. Familias compartidas, no nueve motores independientes. GST-010. |
| Edición | YA RESUELTO para edición acotada; PARCIAL para comparación | `editor.html`, `editor-tools.js:15`, `versions.mjs:9`: texto/escenas, medios, recorte de voz, nueva toma, snapshots. No es una timeline multicapa general. Comparador omite cambios relevantes (GST-006). |
| Revisión | YA RESUELTO para el flujo implementado | `jobs.mjs:186`, notas/actor/fecha; informe geométrico/lectura/audio en `render.mjs:92`; validación técnica de codecs/dimensiones en `jobs.mjs:160`. Muestreo de cuadros no garantiza legibilidad de todo el video ni calidad narrativa. |
| Aprobación | YA RESUELTO en código y pruebas | `releases.mjs:9 publicationBundle`, `marketing.mjs:33–53`: aprobación de archivo, texto, destino y recursos; alterarlos invalida su uso. No sustituir por un booleano suelto. |
| Programación / publicación | PARCIAL operacionalmente | Studio conserva programación y entregas. n8n ejecuta `deploy/studio-publisher.cjs`: Instagram por Meta; Facebook/TikTok por Buffer; verifica hashes/recibos y bloquea incertidumbre. Registrar enlace y enviar son rutas distintas. Primer envío real del flujo nuevo pendiente (GST-009). YouTube en selector/registro no demuestra un conector implementado en este publicador. |
| Resultados | PARCIAL / NO VERIFICABLE en vivo | `marketing.mjs:63 addMetrics`, UI/historial y `studio-publisher.cjs:39` consultan métricas cuando existe entrega confirmada. No afirmar que faltan integraciones; sí falta comprobar disponibilidad real de cada métrica y su recepción con cuenta vigente. No atribuir ventas al contenido por inferencia. |

Fechas de creación, programación y publicación, enlaces, filtros por fechas/canal/estado **ya existen**: `history.mjs`, `marketing-ui.js:16`, `marketing.mjs:59`. Autenticación, roles, sesiones y scopes también: `access.mjs`, `api-scopes.mjs`, `local.mjs:102–135`; comprobados por lectura y pruebas existentes, no por pentest. La generación se recupera como `interrupted` al arrancar (`jobs.mjs:27–35`), admite cancelación y reintento; los proveedores conservan IDs para evitar recompras inciertas. Hay fallos acotados, no ausencia de toda recuperación.

## Registro de investigación

E = estructura/documentación; C = código relevante del alcance descrito; G = comparación; V = ejecución práctica externa. `[x] C` **no significa lectura exhaustiva**. V queda pendiente/no necesaria para esta etapa de selección, y será requisito antes de integrar. Estado de capacidad de GCODE se registra aparte en `mejoras-studio.md`.

| Referencia (URL en texto) | Commit main | Fecha del commit | Licencia raíz | E | C | G | V |
|---|---|---|---|---|---|---|---|
| https://github.com/yikart/AiToEarn | `3581f511293236044e56fad67958cfcea0def6b5` | 2026-09-18T15:18:17+08:00 | MIT | [x] | [x] | [x] | [ ] |
| https://github.com/ATH-MaaS/Pixelle-Video | `848b054e4fae40dabc62ec58e960b573e83793ac` | 2026-06-14T20:40:58+08:00 | Apache-2.0 | [x] | [x] | [x] | [ ] |
| https://github.com/gitroomhq/postiz-app | `e0a08a7d9592fdc1ef1e82cb7cb781489fceade3` | 2026-10-01T04:40:47Z | AGPL-3.0 | [x] | [x] | [x] | [ ] |
| https://github.com/Lightricks/LTX-Desktop | `68cd86c15e5fd25f56229ea63c0dbcb0338f7812` | 2026-08-26T15:31:12+01:00 | Apache-2.0 | [x] | [x] | [x] | [ ] |
| https://github.com/harry0703/MoneyPrinterTurbo | `2e1b30396e059e55939cc802c60faac2061e4d41` | 2026-10-01T10:14:44+08:00 | MIT | [x] | [x] | [x] | [ ] |
| https://github.com/waooAI/waoowaoo | `dfec20e32298ed675050329e4a41477024148399` | 2026-09-21T18:39:25+08:00 | Elastic License 2.0 | [x] | [x] | [x] | [ ] |
| https://github.com/OpenCut-app/OpenCut | `e668010778568641babef2cc40be4703ae6916d6` | 2026-09-24T10:58:46+02:00 | MIT | [x] | [x] | [x] | [ ] |
| https://github.com/FranciscoMoretti/carousel-generator | `4bc98958a038717775c1b1d57124b8a6b0095f9a` | 2024-09-29T10:58:39+01:00 | MIT | [x] | [x] | [x] | [ ] |
| https://github.com/Huanshere/VideoLingo | `01f843492759be9bbfd1a5cb697b799cc9de1609` | 2026-10-01T01:03:30+08:00 | Apache-2.0 | [x] | [x] | [x] | [ ] |
| https://github.com/gyoridavid/short-video-maker | `9bb9a212ced86caa7e09099c382da1a44d638760` | 2025-06-21T13:17:09+02:00 | MIT | [x] | [x] | [x] | [ ] |

## Referencias y decisiones basadas en código

### 1. AiToEarn — distribución y estados por plataforma

**Alcance:** estructura de monorepo, paquete backend, esquema Mongo/Mongoose de publicación, formulario web, creación del flujo, cola BullMQ, consumidor, servicio de ejecución, proveedor Instagram y pruebas de recuperación. No se auditó su motor de agentes completo ni todos los canales. Nest/Nx + frontend React y persistencia Mongo/Redis; esa infraestructura sería una adopción amplia para Studio.

**Recorrido comprobado:** formulario valida por cuenta → `createFlow` rechaza cuentas/plataformas duplicadas y revisa propiedad → persiste registros → encola inmediatamente o con demora → consumidor llama `processPublishJob` → proveedor publica → diferencia publicado, pendiente, programado por plataforma o acción del usuario → finalización/consulta recoge recibo. Evidencia: [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/flows/publish-flow.service.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/flows/publish-flow.service.ts#L55), [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.ts#L58), [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-queue.service.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-queue.service.ts#L10), [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/platforms/instagram/instagram-publish.provider.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/platforms/instagram/instagram-publish.provider.ts#L28).

**Práctica aprovechable:** contrato por canal con `validate`, reglas del medio, `publish`, `verify/finalize`; distinguir validación del archivo, aceptación del proveedor y publicación confirmada. [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.spec.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.spec.ts#L159) prueba que recuperar una publicación antigua no vuelve a llamar `publish` (leída, no ejecutada).

**Comparación:** [deploy/studio-publisher.cjs:15](../deploy/studio-publisher.cjs#L15) ya evita reenvíos y guarda recibos; [marketing.mjs:54](../marketing.mjs#L54) ya reclama entregas. INSPIRARSE en preflight común/capacidades por canal (GST-015), mantener el mecanismo propio. MIT permite evaluar adaptación conservando avisos, pero no copiar reglas numéricas de plataformas sin verificar vigencia. Esfuerzo medio; sustituir por todo AiToEarn sería alto, duplicaría editor, cuentas y colas. Actividad comprobada: commit septiembre 2026, specs de proveedores y workflow de comprobación presentes; CI no ejecutado ni verificado en remoto.

### 2. Pixelle-Video — plantillas y pipeline por fotograma narrativo

**Alcance:** Python/FastAPI/Streamlit, Pydantic, pipeline estándar, storyboard/config/frame, generador HTML, catálogo de plantillas y gestor API asíncrono. No se ejecutó ComfyUI/RunningHub ni se verificó calidad de sus voces. [pyproject.toml](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pyproject.toml) declara pytest, pero no se encontraron archivos de pruebas en el árbol revisado; no confundir dependencia con cobertura.

**Recorrido:** tema o texto → narraciones/prompts → storyboard → `produce_assets` procesa cada frame con voz/medio/composición → concatenación y música → resultado/historial. Evidencias: [pixelle_video/pipelines/standard.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/pipelines/standard.py#L275), [pixelle_video/models/storyboard.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/models/storyboard.py), [api/tasks/manager.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/api/tasks/manager.py#L105). Las tareas API están en memoria; el historial final no demuestra recuperación durable de todas las tareas interrumpidas.

**Componente:** [pixelle_video/services/frame_html.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/services/frame_html.py#L180) interpreta parámetros de texto/número/color/bool con defaults; [pixelle_video/utils/template_util.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/utils/template_util.py#L316) resuelve plantillas por dimensiones; [templates/1080x1920/image_default.html](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/templates/1080x1920/image_default.html#L5) declara área del medio. La composición usa navegador, pero genera cuadros; no asumir un editor de animación equivalente a Studio.

**Aplicación:** INSPIRARSE en un manifiesto de plantillas tipado con Ajv sobre [styles.mjs:1](../styles.mjs#L1), [media-scenes.js:15](../media-scenes.js#L15) y [brand-feed.mjs:10](../brand-feed.mjs#L10) (GST-012, después de GST-005/010). Mantener Chromium/FFmpeg y animación actual; no introducir Python/Streamlit ni un runtime de HTML arbitrario. Apache-2.0, respetar avisos si se adapta código. Último commit junio 2026; documentación/estructura revisadas, tests ejecutados: ninguno. Beneficio esperado: personalizar un estilo sin editar JS; no se ha medido ahorro.

### 3. Postiz — publicador durable, no sustituto del estudio creativo

**Alcance:** paquetes, Docker Compose, modelos Post/Organization, controlador/servicio de posts, registro de workflow vigente, workflow Temporal, proveedor TikTok y opciones por plataforma. No se auditó su subsistema de agentes, facturación ni todos los conectores. Stack Nest/Next/Prisma/PostgreSQL, Redis y Temporal.

**Recorrido:** API/formulario → validar proveedor → `createOrUpdatePost` → `startWorkflow` → espera hasta fecha → envío → sondeo/finalización → estado/URL/webhooks. Importante: [libraries/nestjs-libraries/src/database/prisma/posts/posts.service.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/libraries/nestjs-libraries/src/database/prisma/posts/posts.service.ts#L751) invoca **V112**; también se leyó V106 como antecedente, pero no se presenta como workflow actual. [apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts#L74) desactiva reintentos automáticos de mutaciones; [apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts#L330) separa sondeo y finalización. [libraries/nestjs-libraries/src/database/prisma/schema.prisma](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/libraries/nestjs-libraries/src/database/prisma/schema.prisma#L456) guarda Post, estado, fecha y URL; `releaseId` no prueba por sí solo una aprobación por hash como la nuestra.

**Aplicación:** INSPIRARSE en recuperación de envíos inciertos para GST-004 y preflight GST-015. Studio ya posee el bloqueo esencial; no añadir Temporal solo para repetirlo. [libraries/nestjs-libraries/src/integrations/social/tiktok.provider.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/libraries/nestjs-libraries/src/integrations/social/tiktok.provider.ts#L420) consulta capacidades del creador. Un proveedor de código abierto no concede permisos de plataforma. AGPL-3.0: copiar o modificar exige evaluar obligaciones, incluido acceso por red; preferir patrón propio o integración separada si alguna vez se justifica. No se afirma que uso privado exima automáticamente. Commit octubre 2026; script Jest/CI presentes, no se localizaron pruebas unitarias del flujo seleccionado en el árbol inspeccionado. No se ejecutó CI.

### 4. LTX Desktop — edición localizada y salida a herramientas profesionales

**Alcance:** Electron/React, esquema de proyecto Zod, persistencia localStorage con migración, exportador XML, flatten de timeline, backend Python y handler Retake, espacio libre/IPC y sus tests. No se descargaron pesos ni se ejecutó GPU/API; no se evaluaron todas las transiciones.

**Recorrido relevante:** asset/toma → clip con tiempo/recorte → editor → exportación; retake recibe rango/prompt, valida medio y capacidad del modelo, elige API o modelo local. [frontend/types/project-model.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/types/project-model.ts#L64), [backend/handlers/retake_handler.py](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/backend/handlers/retake_handler.py#L59), [frontend/views/editor/useTimelineXmlExport.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/views/editor/useTimelineXmlExport.ts#L38), [frontend/lib/timeline-import.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/lib/timeline-import.ts#L945). Es **FCP 7 XML**, no confundir con FCPXML moderno. El hook revisado fija 24 fps/1920×1080: hay que sustituirlos por los datos reales de Studio; no copiarlo literalmente.

**Aplicación:** ADAPTAR la función pequeña [electron/free-disk-space.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/electron/free-disk-space.ts#L27) y sus pruebas [electron/free-disk-space.test.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/electron/free-disk-space.test.ts#L6) para GST-014; exportador como opción posterior GST-016. [editor-tools.js:15](../editor-tools.js#L15) ya permite retoma/recorte de voz; no volver a construirlo. Apache-2.0 del código no cubre automáticamente modelos/LoRA/servicio; integración generativa pospuesta hasta conocer hardware, términos y necesidad. Commit agosto 2026, suites backend y node:test/CI presentes, no ejecutadas. No asumir que modelos locales son gratis de operar ni que corrigen con fidelidad pantallas de ComandPOS.

### 5. MoneyPrinterTurbo — preflight, artefactos y mantenimiento del caché

**Alcance:** estructura FastAPI/Streamlit/Python, pipeline task, puntos de salida intermedios, gestor de cola en memoria, persistencia de artefactos, caché y dos suites de pruebas específicas. No se validó cada proveedor ni licencias de su material descargable.

**Recorrido:** `_run_pipeline` comprueba dependencias/proveedores antes de producir → guion → términos → audio → subtítulos → materiales → video; permite etapas intermedias. [app/services/task.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/task.py#L1465) comprueba FFmpeg antes del gasto de recursos posteriores. [app/services/task_artifacts.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/task_artifacts.py) actualiza JSON preservando campos, con temporal/flush/fsync/replace; [test/services/test_task_artifacts.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/test/services/test_task_artifacts.py) prueba conservación e inválidos. El gestor de cola inspeccionado es `InMemoryTaskManager`; no recomendarlo como mejora durable frente a GCODE.

**Componente concreto:** [app/services/cache_manager.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/cache_manager.py#L67) enumera solo archivos administrados, evita symlinks y limita limpieza; [test/services/test_cache_manager.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/test/services/test_cache_manager.py#L33) prueba archivos ajenos, sustituciones y errores. INSPIRARSE/ADAPTAR algoritmo a Node en GST-014, añadiendo protección por trabajos activos y versiones aprobadas de Studio. No copiar una política por antigüedad sin referencias. MANTENER escrituras atómicas que ya existen en [jobs.mjs:14](../jobs.mjs#L14) y caché de voz; GST-001 es pérdida de datos al reconstruir petición, no ausencia de atomicidad. MIT, commit octubre 2026; pruebas específicas leídas, no ejecutadas. Esfuerzo medio para mantenimiento local; no necesita otro servicio.

### 6. waoowaoo — contratos de operaciones y recursos versionados

**Alcance:** Next, Prisma/MySQL, configuración Temporal/Redis/MinIO, modelos de snapshot/aprobación/recurso, workflow de tarea, cierre transaccional, prueba de replay de aprobación y prueba de consentimiento del navegador. No se auditó completo su agente ni todas las generaciones cinematográficas.

**Recorrido seleccionado:** operación normalizada → snapshot de entrada/plan/cotización → consentimiento/grant → ejecución Temporal con intentos/cancelación → cierre que vincula resultado/facturación/recursos y eventos. [prisma/schema.prisma](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/prisma/schema.prisma#L696), [src/lib/wao-mcp/approval-proof.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/wao-mcp/approval-proof.ts#L40), [src/lib/temporal/workflows/task.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/temporal/workflows/task.ts#L41), [src/lib/task/terminal/service.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/task/terminal/service.ts#L300). [tests/integration/task/approval-plan-change-replay.integration.test.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/tests/integration/task/approval-plan-change-replay.integration.test.ts#L48) ejercita contratos de plan: su presencia no acredita que pasen en este entorno.

**Diferencia:** aprobación de gasto/operación no equivale a aprobación editorial de publicación. Studio ya tiene reserva y permiso `allow_paid`, así como release firmado por contenido. INSPIRARSE en mostrar una cotización acotada de los derivados antes de GST-008 y en separar progreso visual de estado durable; no importar su economía de créditos ni orquestación completa. Elastic License 2.0, **no MIT ni Apache**: restringe servicio alojado a terceros, eludir funciones protegidas y retirar avisos. Decisión: patrón propio, no copiar código durante esta etapa. Commit septiembre 2026; tests de concurrencia/Temporal/contratos y CI presentes. Migración completa sería alta y no se justifica para la operación privada actual.

### 7. OpenCut — el main actual no es un editor listo para integrar

**Alcance:** árbol de 130 archivos, README de reescritura, workspace Cargo/GPUI, ruta web de editor, paneles escritorio, API Elysia y CI. [README.md](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/README.md#L19) declara reescritura y remite la versión anterior a otro repositorio. No se sustituyó silenciosamente el candidato por `opencut-classic`.

**Recorrido real en este commit:** [apps/web/src/routes/editor.tsx](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/web/src/routes/editor.tsx) termina en Coming soon; [apps/desktop/src/panels/timeline.rs](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/desktop/src/panels/timeline.rs) y [apps/desktop/src/panels/preview.rs](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/desktop/src/panels/preview.rs) son paneles iniciales. [apps/api/src/index.ts](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/api/src/index.ts) ofrece rutas básicas de salud/echo. No se encontró un flujo conectado de edición→exportación en estos puntos de entrada/árbol. No significa que nunca existiera en la historia del proyecto.

**Decisión:** POSPONER integración de editor; Studio ya compone, exporta y revisa piezas. MIT, commit septiembre 2026, workflows Bun/media presentes, no prueba de editor funcional. Adoptar su reescritura Rust/GPUI introduciría un proyecto paralelo. Revisar otra versión futura solo si hay exportación funcional y una necesidad no cubierta; no dejarlo como implementación pendiente indefinida.

### 8. Carousel Generator — modelo de documento y controles de página

**Alcance:** Next14/React18, Zod/react-hook-form, acción de servidor, generación estructurada, proveedor del documento, menú de diapositiva y exportador navegador. [src/lib/validation/document-schema.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/validation/document-schema.tsx) separa config de contenido; [src/lib/validation/slide-schema.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/validation/slide-schema.tsx) usa elementos tipados; [src/lib/langchain.ts](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/langchain.ts) convierte prompt en documento sin estilo; [src/lib/providers/document-provider.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/providers/document-provider.tsx) enlaza formulario/persistencia.

**Recorrido:** tema → acción/LLM → documento validado → marca/tema/fuentes → editar/reordenar/duplicar página → DOM/canvas → PDF. [src/lib/hooks/use-component-printer.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/hooks/use-component-printer.tsx#L151) implementa PDF; exportar PNG/SVG aparece como TODO, no capacidad probada. [src/lib/hooks/use-persist-form.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/hooks/use-persist-form.tsx) incluye un `localStorage.clear()` al fallar validación: no copiarlo, borraría datos ajenos del origen.

**Aplicación:** INSPIRARSE en config+slides/elementos y controles, sobre [brand-feed.mjs:10](../brand-feed.mjs#L10) y editor existente (GST-012); no instalar Next antiguo ni su SDK LangChain/OpenAI. Studio ya ofrece marca, cuatro páginas y JPG de servidor; no sustituirlos por captura del navegador. MIT, último commit septiembre **2024**, sin suite/CI identificados en árbol/paquete revisados. Esfuerzo medio; fonts/avatares no quedan automáticamente licenciados por MIT del código.

### 9. VideoLingo — alineación, caché y revisión de texto

**Alcance:** pipeline de subtitulado/doblaje, checkpoints de terminología/traducción, split de líneas, ASR cache, normalización temporal, estimación lingüística y pruebas de caché/audio. No se ejecutó ASR/TTS ni traducción de una pieza privada.

**Recorrido:** transcripción/importación → división NLP/semántica → terminología → pausa opcional/revisión → traducción → ajuste y alineación de líneas → subtítulos; doblaje es etapa posterior. [core/pipeline.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/pipeline.py#L62) conserva revisión antes y después de traducir; [core/_5_split_sub.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/_5_split_sub.py#L25) verifica alineación de textos y conserva original cuando falla. Esto inspira, no demuestra calidad superior en español dominicano.

**Componente prioritario:** [core/asr_backend/transcription_cache.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/asr_backend/transcription_cache.py#L20) identifica audio+modelo/backend/idioma/preproceso/versiones, valida resultado y escribe atómicamente; [tests/test_transcription_cache.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/tests/test_transcription_cache.py#L30) prueba invalidaciones. Studio [subtitulos.mjs:11](../subtitulos.mjs#L11) identifica audio+texto+`alignment-v2`, sin modelo/binario/algoritmo efectivo: GST-013. ADAPTAR el patrón a Node y conservar `alinear.py`; no migrar a WhisperX solo por verlo como dependencia.

[docs/audio-timeline.md](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/docs/audio-timeline.md) y [tests/test_audio_timeline.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/tests/test_audio_timeline.py#L52) muestran cómo probar discontinuidades de medios importados. Es prevención para futuros clips, **no** fallo demostrado de la voz actual. Apache-2.0, commit octubre 2026; pruebas leídas, no ejecutadas. Revisión de términos por marca es una idea útil futura, sin reemplazar la voz aprobada por el usuario.

### 10. Short Video Maker — agrupación y resaltado de subtítulos

**Alcance:** TS/Express/MCP, contrato Zod, `ShortCreator`, Kokoro/Whisper/Pexels, componente Remotion vertical, agrupador y prueba de creación. [src/short-creator/ShortCreator.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/short-creator/ShortCreator.ts#L90) conecta TTS → normalización → ASR → búsqueda de stock → escenas → Remotion → archivo. Su cola es un array en memoria; no mejora la persistencia de Studio.

**Componente prioritario:** [src/components/utils.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/components/utils.ts#L37) agrupa por longitud/líneas/pausas conservando tiempos; [src/components/videos/PortraitVideo.tsx](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/components/videos/PortraitVideo.tsx) resalta palabra activa. ADAPTAR solo el agrupador, reemplazando conteo por ancho real y añadiendo puntuación/pausas en español (GST-011). Studio [media-scenes.js:42](../media-scenes.js#L42) agrupa cuatro palabras de modo fijo; ya posee animación y sincronización, no le faltan por completo.

[src/types/shorts.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/types/shorts.ts#L45) lista voces de inglés americano/británico en este commit; la disponibilidad de Kokoro no acredita una voz latinoamericana mejor. Mantener voz n8n actual. [src/short-creator/ShortCreator.test.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/short-creator/ShortCreator.test.ts#L145) usa mocks; no certifica naturalidad de voz ni fidelidad temporal real.

MIT raíz, commit junio **2025**. Remotion tiene [licencia propia](https://www.remotion.dev/docs/license); música y stock tienen términos independientes. Extraer algoritmo puro no requiere adoptar su renderizador ni biblioteca musical. Esfuerzo pequeño–medio, sin gasto por API para paginar palabras existentes. No se ejecutó integración.

## Matriz de diferencias y acciones

| Capacidad | Evidencia GCODE | Referencia | Diferencia relevante | Acción |
|---|---|---|---|---|
| Reintento con contexto | jobs.mjs:187; fixture con tres campos perdidos | MoneyPrinterTurbo: actualiza artefactos conservando campos | Nuestro problema es reconstrucción incompleta de la petición | GST-001; MEJORAR función existente, sin dependencia |
| Bloqueo de presupuesto | budget.mjs:6; lock vacío abandonado | LTX/waoowaoo separan recursos/operación; no ofrecen drop-in para este lock | Falta recuperación del propietario, no otra cola entera | GST-002; solución propia pequeña |
| Caché visual | render.mjs:114 vs media-scenes.js:17,38 | VideoLingo identifica todas las opciones relevantes | Familia/tema cambia píxeles sin cambiar clave | GST-010; corregir antes de ampliar plantillas |
| Coste por pieza | budget.mjs:11, local.mjs:146; 251 entradas | waoowaoo separa ledger/cotización/operación | Detalle paginado se usa como agregado total | GST-003; agregar antes de paginar |
| Tipografía/zonas de marca | marketing.mjs:17 vs media-scenes.js:15 | Pixelle parámetros; Carousel config separada | Configuración persistida no se refleja siempre | GST-005 y después GST-012 |
| Subtítulos | media-scenes.js:42 y n8n-style.js | Short Video Maker: páginas por longitud/pausa; VideoLingo: división | Grupo fijo rompe ritmo/encaje potencial; no se midió comprensión | GST-011 con muestras españolas, conservar voz/resaltado |
| Invalidación ASR | subtitulos.mjs:11–14 | VideoLingo cache_key/valid_result | Cache hit ignora cambio de modelo/algoritmo | GST-013, sin sustituir alineador |
| Almacenamiento | scene-cache.mjs:26, render.mjs:110, deploy/backup.sh | MPT cleanup; LTX freeDiskBytes | Hay retención de backups, no cuota/limpieza de segmentos equivalente | GST-014; inspección y dry-run antes de borrado |
| Distribución incierta | marketing.mjs:54, publicador:17–20 | AiToEarn verify/finalize; Postiz resolvePending | Bloqueo ya resuelto, conciliación humana poco accesible | GST-004, no cambiar conector |
| Multiformato | planning.mjs:25, local.mjs:154 | Carousel modelo separado; Pixelle plantillas | Cuatro briefs no son cuatro renders | GST-008 con lote presupuestado; una aprobación por resultado |
| Edición profesional | editor-tools.js, versions.mjs | LTX FCP7 XML, OpenCut todavía en reescritura | No hay handoff a NLE verificado en rutas actuales | GST-016 opcional; no construir NLE propio |
| Fechas, enlaces y métricas | history.mjs, marketing-ui.js:16, publicador:39 | Postiz/AiToEarn registros por canal | Ya implementado; métricas reales pendientes de prueba | MANTENER; GST-009 como validación, no reimplementación |

## Condiciones de plataforma y licencias que afectan la decisión

- [TikTok, Direct Post / Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), consulta 2026-10-01: un cliente no auditado tiene publicación privada y sus directrices excluyen herramientas limitadas a subir contenido de las cuentas del propio equipo. Por eso no se recomienda reemplazar Buffer por una aplicación Direct Post privada. El proveedor intermediario, consentimiento, declaraciones comerciales y capacidades efectivas deben verificarse; el repositorio no concede aprobación. GST-015 centraliza requisitos por canal, no elude políticas.
- La página de Meta Content Publishing no se pudo abrir con la herramienta. El resultado indexado de la [colección oficial de Meta en Postman](https://www.postman.com/meta/workspace/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00) distingue cuentas profesionales y restricciones de Stories; su página completa tampoco pudo abrirse, por lo que se trata de evidencia limitada al resultado de búsqueda. La elegibilidad/permisos vigentes de la cuenta concreta se deja pendiente, sin prometer formatos porque existan en la UI.
- MIT: conservar copyright/licencia al incorporar código sustancial. Apache-2.0: conservar licencia/avisos aplicables e indicar modificaciones. Postiz AGPL requiere evaluación de las obligaciones de una modificación/servicio por red; waoowaoo ELv2 tiene restricciones expresas. No se emite dictamen de compatibilidad jurídica para un fork que todavía no existe.
- No se recomienda copiar fuentes, música, voces clonadas, pesos o stock de estos repositorios. Sus condiciones y consentimiento deben comprobarse por recurso. No se han calculado tarifas de APIs ni presupuestos GPU nuevos; las primeras tareas no los necesitan.


### Evidencia de licencias raíz

- [yikart/AiToEarn — LICENSE](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/LICENSE).
- [Lightricks/LTX-Desktop — LICENSE.txt](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/LICENSE.txt).
- [harry0703/MoneyPrinterTurbo — LICENSE](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/LICENSE).
- [OpenCut-app/OpenCut — LICENSE](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/LICENSE).
- [ATH-MaaS/Pixelle-Video — LICENSE](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/LICENSE).
- [Huanshere/VideoLingo — LICENSE](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/LICENSE).
- [FranciscoMoretti/carousel-generator — LICENSE](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/LICENSE).
- [gitroomhq/postiz-app — LICENSE](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/LICENSE).
- [gyoridavid/short-video-maker — LICENSE](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/LICENSE).
- [waooAI/waoowaoo — LICENSE](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/LICENSE).

## Tres componentes externos que aprovecharía primero

1. **Short Video Maker — `createCaptionPages`:** algoritmo pequeño MIT adaptado a anchura tipográfica/pausas, con la voz y las marcas de tiempo actuales. No introduce Remotion. GST-011.
2. **VideoLingo — identidad/validación de caché ASR:** patrón Apache para añadir modelo, binario, algoritmo y preproceso; fixtures sin pagar voces. GST-013, y misma disciplina para GST-010.
3. **Pixelle + Carousel — manifiesto de plantilla/configuración separada:** inspiración, no motor nuevo. Parametrizar primero las familias actuales y mantener los valores visuales que gustaron al usuario. GST-012 depende de GST-005/010.

**Profundización y prueba de integración:** para los tres se siguieron contrato → función → consumidor/exportación o lectura/escritura del resultado, con límites documentados. Short tiene una prueba de creación basada en mocks, no una suite suficiente del agrupador: añadir casos Unicode, pausas, números y ancho. VideoLingo sí tiene pruebas dedicadas de identidad de caché: portar casos al alineador actual. Pixelle/Carousel carecen de una suite identificada de manifiesto/exportación en el alcance revisado: construir fixture de los nueve estilos y cuatro formatos antes de usarlo. Alternativas: escribir una función propia de paginación; invalidación manual versionada de ASR; defaults estáticos de plantilla. Se prefieren adaptaciones pequeñas porque preservan el render actual y evitan tres runtimes extra.

## Cierre de investigación y continuación exacta

Investigación de los diez candidatos y comparación del alcance descrito finalizadas. Validación externa práctica no realizada: no era necesaria para seleccionar patrones y no se autorizó ejecutar código de terceros. Todas las implementaciones propuestas quedan pendientes en `mejoras-studio.md`. Siguiente trabajo concreto: GST-001 y su regresión local; después bloqueo/caché/coste/configuración. Publicación real y llamadas pagadas siguen requiriendo una pieza/acción autorizada. No queda prometido trabajo en segundo plano.

## Apéndice de módulos inspeccionados

Registro de archivos/rangos consultados mediante lectura dirigida. El listado es evidencia de alcance, no de lectura exhaustiva del repositorio; las conclusiones usan las funciones indicadas arriba. También se consultaron árboles, paquetes, licencias y búsquedas de símbolos. Los binarios y tests externos no se ejecutaron.

### AiToEarn

- [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/platforms/instagram/instagram-publish.provider.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/platforms/instagram/instagram-publish.provider.ts) — 24–76.
- [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/consumers/publish.consumer.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/consumers/publish.consumer.ts) — 1–19.
- [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/flows/publish-flow.service.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/flows/publish-flow.service.ts) — 55–108.
- [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-queue.service.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-queue.service.ts) — 1–71.
- [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.spec.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.spec.ts) — 159–218.
- [project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/apps/aitoearn-server/src/core/channels/publish/tasks/publish-task.service.ts) — 58–190.
- [project/aitoearn-backend/libs/mongodb/src/schemas/publish-record.schema.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/libs/mongodb/src/schemas/publish-record.schema.ts) — 1–72.
- [project/aitoearn-backend/package.json](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-backend/package.json) — 1–64.
- [project/aitoearn-web/src/components/PublishDialog/hooks/useValidatedPublishTrigger.ts](https://github.com/yikart/AiToEarn/blob/3581f511293236044e56fad67958cfcea0def6b5/project/aitoearn-web/src/components/PublishDialog/hooks/useValidatedPublishTrigger.ts) — 1–41.

### Pixelle-Video

- [api/tasks/manager.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/api/tasks/manager.py) — 1–135, 105–151.
- [pixelle_video/models/storyboard.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/models/storyboard.py) — 1–143.
- [pixelle_video/pipelines/standard.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/pipelines/standard.py) — 1–145, 275–375.
- [pixelle_video/services/frame_html.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/services/frame_html.py) — 1–160, 180–280, 330–425.
- [pixelle_video/utils/template_util.py](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/pixelle_video/utils/template_util.py) — 1–110, 300–400.
- [templates/1080x1920/image_default.html](https://github.com/ATH-MaaS/Pixelle-Video/blob/848b054e4fae40dabc62ec58e960b573e83793ac/templates/1080x1920/image_default.html) — 1–60.

### postiz-app

- [apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.0.6.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.0.6.ts) — 1–175.
- [apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.1.2.ts) — 1–110, 32–96, 315–390.
- [libraries/nestjs-libraries/src/database/prisma/posts/posts.service.ts](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/libraries/nestjs-libraries/src/database/prisma/posts/posts.service.ts) — 717–778, 927–1030.
- [libraries/nestjs-libraries/src/database/prisma/schema.prisma](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/libraries/nestjs-libraries/src/database/prisma/schema.prisma) — 1–100, 456–507.
- [package.json](https://github.com/gitroomhq/postiz-app/blob/e0a08a7d9592fdc1ef1e82cb7cb781489fceade3/package.json) — 1–110.

### LTX-Desktop

- [backend/handlers/retake_handler.py](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/backend/handlers/retake_handler.py) — 1–90.
- [electron/export/timeline.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/electron/export/timeline.ts) — 1–87.
- [electron/free-disk-space.test.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/electron/free-disk-space.test.ts) — 1–54.
- [electron/free-disk-space.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/electron/free-disk-space.ts) — 1–46.
- [frontend/lib/project-storage.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/lib/project-storage.ts) — 1–52.
- [frontend/lib/timeline-import.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/lib/timeline-import.ts) — 945–1015.
- [frontend/types/project-model.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/types/project-model.ts) — 1–115.
- [frontend/views/editor/useTimelineXmlExport.ts](https://github.com/Lightricks/LTX-Desktop/blob/68cd86c15e5fd25f56229ea63c0dbcb0338f7812/frontend/views/editor/useTimelineXmlExport.ts) — 1–109.

### MoneyPrinterTurbo

- [app/controllers/manager/memory_manager.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/controllers/manager/memory_manager.py) — 1–21.
- [app/services/cache_manager.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/cache_manager.py) — 1–160.
- [app/services/task.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/task.py) — 1465–1590.
- [app/services/task_artifacts.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/app/services/task_artifacts.py) — 1–96.
- [test/services/test_cache_manager.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/test/services/test_cache_manager.py) — 1–100.
- [test/services/test_task_artifacts.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/2e1b30396e059e55939cc802c60faac2061e4d41/test/services/test_task_artifacts.py) — 1–101.

### waoowaoo

- [package.json](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/package.json) — 1–58.
- [prisma/schema.prisma](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/prisma/schema.prisma) — 696–728.
- [src/lib/billing/media-approval-policy.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/billing/media-approval-policy.ts) — 1–20.
- [src/lib/task/terminal/service.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/task/terminal/service.ts) — 1–85, 260–365, 300–357.
- [src/lib/temporal/workflows/task.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/temporal/workflows/task.ts) — 1–150.
- [src/lib/wao-mcp/approval-proof.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/src/lib/wao-mcp/approval-proof.ts) — 1–135.
- [tests/integration/task/approval-plan-change-replay.integration.test.ts](https://github.com/waooAI/waoowaoo/blob/dfec20e32298ed675050329e4a41477024148399/tests/integration/task/approval-plan-change-replay.integration.test.ts) — 1–85.

### OpenCut

- [README.md](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/README.md) — 1–78.
- [apps/api/src/index.ts](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/api/src/index.ts) — 1–15.
- [apps/desktop/Cargo.toml](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/desktop/Cargo.toml) — 1–13.
- [apps/desktop/src/panels/preview.rs](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/desktop/src/panels/preview.rs) — 1–20.
- [apps/desktop/src/panels/timeline.rs](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/desktop/src/panels/timeline.rs) — 1–20.
- [apps/web/src/routes/editor.tsx](https://github.com/OpenCut-app/OpenCut/blob/e668010778568641babef2cc40be4703ae6916d6/apps/web/src/routes/editor.tsx) — 1–12.

### carousel-generator

- [package.json](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/package.json) — 1–70.
- [src/app/actions.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/app/actions.tsx) — 1–27.
- [src/components/pages/page-base.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/components/pages/page-base.tsx) — 1–41.
- [src/components/slide-menubar.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/components/slide-menubar.tsx) — 1–85.
- [src/lib/hooks/use-component-printer.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/hooks/use-component-printer.tsx) — 1–140, 140–215.
- [src/lib/hooks/use-persist-form.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/hooks/use-persist-form.tsx) — 1–56.
- [src/lib/langchain.ts](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/langchain.ts) — 1–82.
- [src/lib/providers/document-provider.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/providers/document-provider.tsx) — 1–57.
- [src/lib/validation/brand-schema.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/validation/brand-schema.tsx) — 1–15.
- [src/lib/validation/document-schema.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/validation/document-schema.tsx) — 1–23.
- [src/lib/validation/slide-schema.tsx](https://github.com/FranciscoMoretti/carousel-generator/blob/4bc98958a038717775c1b1d57124b8a6b0095f9a/src/lib/validation/slide-schema.tsx) — 1–46.

### VideoLingo

- [core/_5_split_sub.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/_5_split_sub.py) — 1–140, 25–140.
- [core/asr_backend/audio_preprocess.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/asr_backend/audio_preprocess.py) — 1–95.
- [core/asr_backend/transcription_cache.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/asr_backend/transcription_cache.py) — 1–120, 1–121.
- [core/pipeline.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/pipeline.py) — 1–164, 30–125.
- [core/tts_backend/estimate_duration.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/core/tts_backend/estimate_duration.py) — 1–100.
- [docs/audio-timeline.md](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/docs/audio-timeline.md) — 1–71.
- [tests/test_audio_timeline.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/tests/test_audio_timeline.py) — 20–72.
- [tests/test_transcription_cache.py](https://github.com/Huanshere/VideoLingo/blob/01f843492759be9bbfd1a5cb697b799cc9de1609/tests/test_transcription_cache.py) — 24–85.

### short-video-maker

- [src/components/utils.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/components/utils.ts) — 1–164, 37–85.
- [src/components/videos/PortraitVideo.tsx](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/components/videos/PortraitVideo.tsx) — 1–130.
- [src/server/routers/rest.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/server/routers/rest.ts) — 1–130.
- [src/short-creator/ShortCreator.test.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/short-creator/ShortCreator.test.ts) — 1–90, 80–155.
- [src/short-creator/ShortCreator.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/short-creator/ShortCreator.ts) — 1–230.
- [src/short-creator/libraries/Kokoro.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/short-creator/libraries/Kokoro.ts) — 1–77.
- [src/short-creator/libraries/Whisper.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/short-creator/libraries/Whisper.ts) — 1–90.
- [src/types/shorts.ts](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/src/types/shorts.ts) — 1–70, 62–110.
- [static/music/README.md](https://github.com/gyoridavid/short-video-maker/blob/9bb9a212ced86caa7e09099c382da1a44d638760/static/music/README.md) — 1–44.

