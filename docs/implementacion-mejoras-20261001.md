# Implementación de oportunidades GST-017–026

Fecha: 2026-10-01. Alcance autorizado: mejorar el Studio existente a partir de la auditoría. No se copiaron implementaciones de terceros, no se añadieron dependencias y no se cambiaron modelos de voz. Se mantuvieron los cambios anteriores del árbol de trabajo.

Estado de entrega: implementado, probado y desplegado en el Studio privado. Este registro sustituye el estado «Pendiente» de la auditoría para estos diez identificadores, sin alterar la evidencia histórica.

| ID | Implementación | Evidencia / comprobación | Estado |
|---|---|---|---|
| GST-017 | Identidad económica compartida entre intentos; techo original conservado, visible en API y Operación | `Budget.bindOperation/reserve/summary`, `JobStore.create/retry`, tests de reservas concurrentes y linaje legado. Guion se vincula antes de poner el render en cola | Implementado y probado |
| GST-018 | Evidencia persistente de discrepancias ASR, escucha de la frase y aceptación humana ligada al hash exacto; preview de voz individual | `subtitulos.mjs`, `voice-reviews.mjs`, `alinear.py`, `preview.mjs`, UI de Operación; pipeline real FFmpeg/Python con transcriptor sintético | Implementado y probado sin proveedor |
| GST-019 | Respuesta Creative guardada antes de validación; corrección local con control de versión y reutilización sin otra compra | `Creative.create/issues/correct`, `/api/creative/correct`, UI; respuesta inválida corregida genera una sola llamada mock; resultado incierto no se reenvía | Implementado y probado con proveedor simulado |
| GST-020 | Reintento actualiza la pieza de campaña, conserva historial y revoca releases; bloquea entregas activas o inciertas | `Marketing.retryJob`, rutas local/v1, pruebas de contexto/idempotencia/entregas | Implementado y probado |
| GST-021 | Carruseles 2–8 páginas: añadir, duplicar, ordenar, quitar; ID y evidencia por página; foto por página en composición de marca | `carousel-ui.js`, ambos editores, `brand-feed.mjs`, `feed.mjs`, `feed/renderer.cjs`, artefactos API y conector | Navegador: 6 páginas, IDs distintos, evidencia preservada, descarga image-6 |
| GST-022 | Fuentes del render de imágenes y fuentes tipográficas congeladas por trabajo; manifiesto de hashes y worker aislado | `image-runtime.mjs`, `JobStore.create/execute`, manifiesto; render de integración real | Implementado y probado |
| GST-023 | Escuchar y seleccionar tomas TTS ya guardadas sin nueva compra | `voiceKey/voiceTakes`, `/api/voice/takes`, `editor-tools.js`; invalida tiempos manuales al cambiar toma | Implementado; caché probada, valoración auditiva humana por pieza |
| GST-024 | Ángulos editoriales explícitos por hecho: uso, pregunta, distinción; excluye conceptos ya planificados | `planning.mjs`, prueba de tres ángulos y exclusión; fuentes revisadas de la marca | Implementado y probado; no usa tendencias externas |
| GST-025 | Matriz representativa nueve estilos × cuatro formatos; dimensiones y advertencias geométricas | `scripts/verify-style-matrix.mjs`, `render.mjs`; 36/36 renderizados sin advertencias | PARCIAL respecto a regresión audiovisual completa; verificación geométrica realizada; no certifica estética o voz de toda pieza |
| GST-026 | Estado agregado de lote según hijos, progreso/listos/fallos/aprobados; reparación de carrera al reanudar | `batchProgress`, `Batches.launch/resume`, UI Operación y pruebas | Implementado y probado |

## Qué se aprovecha de las referencias

Inspiración, no copia: VideoLingo aporta la pausa editable de transcripción; MoneyPrinterTurbo la conservación de artefactos de fallo; LTX la elección de tomas; Carousel Generator el documento de páginas ordenables; waoowaoo la separación de operación presupuestada e intentos. Versiones, enlaces a código y licencias examinadas están en `benchmark-github.md`.

AiToEarn/Postiz siguen como referencias de organización/publicación, sin sustituir n8n ni copiar código AGPL. Pixelle y Short Video Maker respaldan patrones de composición y subtítulos ya incorporados. OpenCut se pospone por el alcance real de la rama auditada. No hay obligación de incorporar diez aplicaciones para aprovechar la investigación.

## Límites que conservan revisión humana

- La aceptación ASR requiere escuchar y confirmar el audio exacto; no convierte una voz incorrecta en correcta. Una frase distinta exige otra revisión y la pieza mantiene su aprobación independiente.
- Un resultado Creative incierto sin respuesta persistida no se vuelve a comprar automáticamente. Una respuesta guardada puede corregirse sin proveedor; si faltan contexto/plantilla/recursos, el sistema debe detenerse.
- Las imágenes congelan fuentes y registran lockfile/Node; usan bibliotecas instaladas compartidas y rechazan cambio de lockfile. No se promete reproducibilidad binaria entre versiones de sistema.
- La matriz captura cuadros representativos; no sustituye ver el video completo con sonido. Handoff XML no se probó importando en Premiere/Resolve.
- No hubo casting nuevo, producción pagada ni envío a redes en estas pruebas. Permisos efectivos de las cuentas y resultados comerciales requieren validación real aparte.
- Generación creativa inicia carruseles de cuatro páginas por defecto; el editor permite adaptar 2–8. Las composiciones anteriores conservan su foto general; las composiciones de marca permiten foto independiente por página.

## Verificación local final

- `npm test`: 77/77; incluye reintento real de JobStore sobre presupuesto acumulado, recuperación Creative sin clave ni plantilla original, selección de tomas con WAV sintéticos y carrusel anterior de seis páginas con cierre en la última.
- `npm run test:alignment`: 6/6. `npm run test:editorial`: 20/20 fixtures offline.
- `scripts/verify-implementation.mjs`: API, navegador y render pasan. Copia aislada sin claves de proveedores; edición de ambos carruseles, seis páginas con referencias preservadas, caché de escenas y cambio de familia, worker de imagen congelado, TAR/XML generado.
- `scripts/verify-style-matrix.mjs`: 36 combinaciones, sin advertencias. Inspección visual de hoja de contacto de nueve primeros cuadros verticales: sin recortes evidentes. Seis estilos comparten la familia media; no se afirma que sean nueve motores gráficos distintos. Son plantillas de ejemplo, no contenido final aprobado.
- `git diff --check`, sintaxis de scripts de despliegue y conector: sin errores.
- No se ejecutó código de los repositorios de referencia. Pruebas propias y datos sintéticos únicamente.

Artefactos locales: `/private/tmp/studio-final-improvements`, `/private/tmp/studio-style-matrix-current`, `/private/tmp/gst-final-tests.log`. Resumen durable junto a este documento en `verificacion-mejoras-20261001.json`.

## Despliegue y seguridad de acceso

Aplicado en `gcoderd2` mediante `deploy/update-code.sh`. Respaldo inicial: `gcode-studio:before-20261001T141035Z`; 84 archivos del paquete cotejados por SHA-256, sin diferencias. Se conservan datos, recursos, credenciales, voces, proyectos y publicaciones. Se detectó que `/app/feed` es un volumen: el actualizador ahora respalda y actualiza únicamente `feed/renderer.cjs`, conservando fotos y plantillas, y revisa la cola también después de construir la imagen.

Conector existente en `gcoderd1`: cambio exclusivo de `image-[1-4]` a `image-[1-8]`, con huella previa comprobada, respaldo `studio-publisher.before-pages-20261001.cjs` y `node --check` dentro de n8n. No se ejecutó `tick`, no se alteró el workflow y no se publicaron piezas como prueba. Hash del conector: `c83696b5b51d5ef464b38c6e01d661297c7a101e90a57df04d1eb19e4f061bc1`.

Comprobación Linux dentro del contenedor: render sintético de seis páginas usando runtime congelado y bloqueo de segunda reserva 1.20 sobre techo 2.00, ambos pasan. API v1 autenticada: 200. Login HTTPS: 200; presupuesto/lotes/revisiones de voz/Creative sin sesión: 401. Estado Docker: healthy. Las primeras consultas al editor por localhost devolvieron 403 por la protección Host; se corrigió la prueba para usar HTTPS, sin relajar esa protección. Ninguna credencial se imprimió.

Cierre adicional probado: `Marketing.retryJob` consulta la identidad de reintento por método interno de JobStore, sin depender de un campo privado ausente en la respuesta pública. El catálogo muestra la cantidad real de páginas. Prueba de reintento con JobStore real y regresión de navegador añadidas.

## Pendientes explícitos fuera de las pruebas automáticas

No se certifican con fixtures la pronunciación de cada voz real, la aprobación humana de piezas retenidas, la publicación efectiva en cuentas externas ni la importación del XML en un editor profesional. Requieren escucha/aprobación o una operación real. Las herramientas para revisar y recuperar están implementadas; no se aprobaron ni reintentaron piezas pagadas de producción para simular esa validación.

Despliegue final del código saludable; imagen de retorno inmediata: `gcode-studio:before-20261001T141649Z`. El registro de cierre se sincroniza en `app/docs` después del despliegue, sin reconstruir la imagen por cambios exclusivamente documentales.
