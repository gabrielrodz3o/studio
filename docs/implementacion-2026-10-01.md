# Implementación del benchmark — 1 de octubre de 2026

Autorización: «haz todo», posterior a la auditoría. Base local y remota comparada: `9817a41`. No se ha copiado código de las aplicaciones de referencia ni instalado dependencias nuevas. Los componentes pequeños son implementaciones propias de los patrones registrados en el benchmark. Se conserva Node/Chrome/FFmpeg, la voz n8n, la publicación por n8n y la aprobación humana.

## Estado de capacidad tras la implementación

- **YA RESUELTO en el alcance implementado:** GST-001, 002, 003, 004, 005, 006, 007, 008, 010, 011, 012, 013, 014. Las validaciones de algoritmos, rutas e interfaz están separadas de la valoración humana de cada pieza.
- **PARCIAL:** GST-015 (transporte comprobado, permisos actuales por cuenta pendientes) y GST-016 (paquete real y XML comprobados, importación en un NLE pendiente).
- **NO VERIFICABLE sin una pieza/destino aprobados:** GST-009. No es una publicación realizada ni un fallo demostrado.

## Cambios y estado comprobado

| ID | Entrega | Evidencia de implementación | Validación y límite |
|---|---|---|---|
| GST-001 | Reintentos conservan caption, brief, creative_id y grupo presupuestario; aprobación nueva pendiente | `jobs.mjs:retry`, `jobs.test.mjs` | Regresión automática; no hereda aprobación |
| GST-002 | Bloqueo del presupuesto liberado por el kernel al morir su propietario | `file-lock.mjs`, `budget.mjs:transact` | SIGKILL del proceso Node y 12 reservas concurrentes; solo 10 caben en el techo |
| GST-003 | Agregado completo, detalle paginado y formulario de conciliación | `budget.mjs:summary`, `local.mjs`, `operations-ui.js`, `marketing-ui.js` | Fixture de 251 entradas: no desaparece el coste del primer trabajo; reservado ≠ coste confirmado |
| GST-004 | Conciliación humana de entrega incierta, con plataforma, recibo, enlace y actor | `marketing.mjs:reconcileDelivery`, `marketing-ui.js` | URL ajena rechazada; repetición idempotente; nunca vuelve a poner en cola la entrega |
| GST-005 | Diseño versionado: márgenes, familia, subtítulos y fuente validada | `design.mjs`, `visual-runtime.js`, `media-scenes.js`, `brand-feed.mjs` | Fuente instalada admitida: Montserrat. Se rechazan fuentes ausentes; no hay selector ficticio de fuentes descargables. Proyectos sin v2 conservan márgenes anteriores |
| GST-006 | Comparación de todos los campos, altas/bajas y orden de escenas | `version-diff.mjs`, `editor.html` | Tests de duración, recurso, orden y escena eliminada. Proyectos antiguos sin IDs usan posición como fallback explícito |
| GST-007 | Afirmaciones declaradas/revisadas con autor y fuente; referencias en imágenes y slides | `marketing.mjs:saveBrand`, `evidence.mjs`, `creative.mjs`, `planning.mjs`, `feed.mjs` | Modificar fuente o texto revoca revisión. Un guion editable no puede atribuirse una revisión humana: se contrasta contra la marca guardada. Referencia declarada muestra advertencia en aprobación; la IA no verifica por sí sola una fuente |
| GST-008 | Lotes de cuatro derivados con techo conjunto US$2.40, hijos, cancelación y recuperación | `batches.mjs`, `budget.mjs:group`, rutas `/api/batches/*`, `operations-ui.js` | Productor simulado con fallo intermedio: no repite hijos completados; recupera lotes en cola tras reinicio y reintenta solo un render fallido, enlazando el nuevo trabajo a su pieza; conserva claves; misma selección no vuelve a cobrarse al cambiar clave de navegador. No se generó un lote pagado durante las pruebas |
| GST-009 | Publicación real de una pieza aprobada | Flujo anterior conservado | **Pendiente:** elegir versión y destino; no se ha enviado ninguna publicación de prueba |
| GST-010 | Clave de caché incluye familia, tema editorial y plantilla efectivos; manifiesto de segmentos | `scene-cache.mjs:visualContext`, `render.mjs` | Test de claves y prueba integral de renders: reutilización de escenas intactas, invalidación al cambiar familia |
| GST-011 | Paginación compartida por ancho, pausas y puntuación; palabra activa; límites de lectura | `captions.mjs`, `visual-runtime.js`, `n8n-style.js`, `render.mjs` | Conserva palabras/acentos/tiempos; mantiene tamaño comercial heredado. Si el audio no deja tiempo suficiente, advierte páginas rápidas/breves; no altera lo que dice la voz. Falta evaluación comparativa humana de comprensión |
| GST-012 | Catálogo de tres plantillas versionadas y controles en video/diseño de marca | `design.mjs:templateCatalog`, `editor-tools.js`, `marketing-ui.js` | Tipos/formatos/familias incompatibles se rechazan; comercial conserva su familia. En v2, cuadrado/horizontal/4:5 usan composición nativa con captura recortada y subtítulos a tamaño de lectura; el vertical conserva su composición. Carrusel continúa con cuatro páginas; no se añadió HTML arbitrario |
| GST-013 | Caché de alineación ligada al hash de audio/modelo/binario/algoritmo y preproceso | `subtitulos.mjs` | Alineación real local con la primera voz comercial: hit de caché y recuperación tras corromper deliberadamente el JSON en temporal. Tests de identidad y tiempos. Recupera JSON corrupto y temporales separados; no necesita regenerar TTS |
| GST-014 | Preflight de espacio y limpieza con diagnóstico, token y protección de aprobados | `storage.mjs`, `jobs.mjs`, `creative.mjs`, `operations-ui.js` | Poco espacio aborta antes de reservar/generar; no sigue symlinks; rechaza diagnóstico obsoleto. Solo borra caché antigua, no originales ni entregables. No se limpió caché real |
| GST-015 | Comprobación de transporte antes de crear/programar; distingue manual/API | `capabilities.mjs`, `create-ui.js`, `marketing.mjs:schedule` | Interfaz probada; cuentas no configuradas e historias TikTok rechazadas para programación. **Permisos vigentes en proveedor siguen sin verificarse**; una cuenta configurada no prueba elegibilidad |
| GST-016 | Exportación experimental para continuar en editor externo | `handoff.mjs`, `/api/handoff`, `operations-ui.js` | Archivo TAR real con escenas, mezcla, música, voces disponibles, SRT, manifiesto y XML FCP 7. XML parseado; **importación en Premiere/Resolve no probada**. Texto/animaciones permanecen incrustados |

## Uso

- **Marketing → Marcas:** editar composición y límites de lectura; revisar fuentes con la casilla explícita. Cambiar una afirmación obliga a revisarla de nuevo.
- **Editor de video → Diseño, recursos y sonido:** plantilla por pieza, tamaño del subtítulo; el diseño comercial conserva su estilo. Guardar crea una nueva versión, no modifica un entregable aprobado.
- **Crear → Destino previsto:** muestra disponibilidad del conector antes de gastar; producir no programa una publicación.
- **Crear → campaña → Proponer temas → Planificar cuatro formatos:** crea briefs sin gasto. **Marketing → Operación y costes** permite autorizar y producir el lote. Cada salida sigue pendiente de revisión.
- **Operación y costes:** detalle de reservas, factura confirmada, recibos inciertos, diagnóstico de caché, lotes y exportación experimental.
- Un lote con generación incierta se detiene. Reanudar reutiliza sus claves, pero no inventa la respuesta de un proveedor ni fuerza un nuevo cobro; un error incierto puede requerir conciliación antes de continuar.

## Verificación reproducible

```sh
npm test
npm run test:alignment
npm run test:editorial
STUDIO_VERIFY_OUTPUT=/tmp/studio-verification node scripts/verify-implementation.mjs
```

El último comando copia código a un directorio temporal, usa estado aislado y ninguna clave de proveedores. Necesita Chrome y FFmpeg locales. Levanta una instancia de prueba solo en loopback; comprueba API, interfaz en Chrome, trabajo con fuentes congeladas, render, reutilización/invalidez de caché y exportación. No instala dependencias, publica ni modifica la instancia real. Su informe y capturas quedan en el directorio indicado.

Verificación de esta entrega: 64 pruebas Node, 6 Python de alineación, 20 casos editoriales offline. Pruebas de navegador/API/render/exportación independientes. La prueba real de caché comprobó dos hits al repetir las escenas y dos renders al cambiar su familia. Se corrigió una carrera de inicialización de los controles detectada por Chrome. Capturas revisadas del comercial con las cuatro voces ya disponibles; formatos horizontal, cuadrado y 4:5 además de render vertical. No se hizo un nuevo casting ni se atribuyen mejoras comerciales o porcentajes de ahorro.

## Límites operativos

- Un solo proceso de Studio gestiona los lotes/cola. El bloqueo del presupuesto sí coordina procesos locales mediante `fcntl.flock`; no es un bloqueo distribuido entre servidores.
- Los importes del lote son **techos internos de reserva**, no tarifas verificadas de los proveedores. El coste real necesita factura/recibo y conciliación.
- La aprobación sigue ligada a una versión y artefacto concreto. Nada de esta entrega autoriza publicar versiones nuevas automáticamente.
- El exportador NLE permite terminar una pieza renderizada en otra herramienta; no entrega capas HTML editables. Mantiene carácter experimental hasta probar importación en el editor de destino.
- La validación técnica no sustituye escuchar y aprobar una pieza ni comprobar permisos actuales de las cuentas.

## Despliegue

Actualización aplicada mediante `deploy/update-code.sh` en `gcoderd2`, con respaldo del código y de la imagen anterior. Primera imagen de retorno: `gcode-studio:before-20261001T125644Z`. Se comprobaron cola vacía y hashes de archivos modificados contra la base inicial antes de actualizar. HTTPS público: `/login` responde 200 y `/api/batches` sin sesión responde 401. La prueba de render Linux y bloqueo de presupuesto usa exclusivamente temporales, y la lectura autenticada de API no modifica datos. Paquete final aplicado y saludable: respaldo `gcode-studio:before-20261001T132447Z`. Incluye recuperación individual de lotes y composición comercial nativa fuera del formato vertical. El actualizador detuvo correctamente un intento de cierre al detectar que acababa de comenzar una producción; no se interrumpió ese trabajo. No se modificaron workflows de n8n, credenciales ni historial de publicaciones.

## Incidencia del proveedor observada durante el cierre

El video automático `job_4611c0b3-398c-45d2-9cbd-88570ed71283` se detuvo esperando la tercera voz de kie.ai; las dos primeras estaban en caché. La consulta del proveedor confirmó fallo de esa tarea. Se intentó recuperar en `job_fc7946d2-85fb-4854-ac0c-d83703c414c6`, conservando el guion y reservando como máximo US$1.14 adicional frente a US$0.85 ya reservado: no se amplió el techo original de US$2. En el segundo intento la tercera voz **sí llegó**. La lectura del error completo confirmó que `alinear.py:verify_meaning` la retuvo por no poder confirmar la pronunciación del nombre de marca. La indicación anterior de otro timeout se corrigió tras consultar ese error; el estado `voice` por sí solo no permite distinguir proveedor y alineación. No se realizaron más reintentos ni se cambió la voz por otra sin revisión. Tareas y audios conservados, aprobación pendiente, cero publicaciones realizadas por esta intervención.

La revisión auditiva de esta frase **está pendiente**; un rechazo del ASR no demuestra por sí solo una pronunciación incorrecta. No equivale a una prueba exitosa del video diario ni se oculta detrás de las pruebas de código. No se desactivó la comprobación de nombres, negaciones ni cantidades para forzar una exportación. No se debe recrear el guion ni pedir otra voz sin revisar antes el audio ya recibido. La verificación integral del editor usó recursos locales y productores simulados para las llamadas pagadas.
