> HISTÓRICO de la primera auditoría. Los pendientes y conteos de pruebas de este archivo no describen el estado actual. Consultar mejoras-studio.md.

# Tareas ejecutables sobre la etapa anterior de GCODE Studio

## Segunda pasada: estado actual después de la implementación

Corte: 2026-10-01. **Investigación en curso.** Esta pasada contrasta el árbol de trabajo actual (incluidos cambios todavía sin commit) con las referencias. Las secciones anteriores se conservan como historial: los defectos GST-001–016 no deben interpretarse como pendientes sin consultar su implementación y revalidación. No se modifica funcionalidad ni se ejecutan proveedores de pago.

- [x] Inventario e historial actuales localizados.
- [ ] Código propio y pruebas revalidados.
- [ ] Diez referencias revalidadas.
- [ ] Nuevas oportunidades comparadas y priorizadas.


> **Actualización de ejecución (2026-10-01):** el usuario autorizó implementar mediante «haz todo». Los estados y evidencias anteriores se conservan como diagnóstico histórico; el estado vigente por cada GST, pruebas y límites está en [implementacion-2026-10-01.md](implementacion-2026-10-01.md). Hay implementación local de GST-001–008 y GST-010–016; GST-009 continúa pendiente de una publicación expresamente aprobada. La elegibilidad real de proveedores y la importación NLE no se presentan como validadas.

Fecha: 2026-10-01. Base inspeccionada: `9817a41f6fa8ac13e4f052e97f1c6c5326a21c88`.
Se revisó primero la etapa anterior y después los diez candidatos externos. Auditoría y propuesta finalizadas en el alcance descrito; ninguna tarea nueva está implementada. Ver [benchmark y evidencias externas](benchmark-github.md).

## Alcance y comprobaciones

Se leyeron contratos, trabajos y reintentos, presupuesto, planificación, versiones, aprobación, publicación, interfaz de marketing/editor, composición y caché. Se amplió la revisión estructural a frontend, generación de imágenes, autenticación, despliegue y publicador. No es una lectura exhaustiva de cada línea ni una nueva validación del servidor.

- [x] Historial y documentación anterior consultados como contexto.
- [x] Código local de los flujos relacionados con estas tareas inspeccionado.
- [x] `npm test`: 47/47 pruebas locales pasan en esta pasada.
- [x] `python3 -B -m unittest alinear_test.py`: 6/6 pasan en esta pasada.
- [x] Tres reproducciones adicionales con datos temporales y cero llamadas a proveedores.
- [x] Estructura y flujos relevantes de los diez candidatos comparados; alcance, commits y licencias en `benchmark-github.md`.
- [x] Fixture adicional de identidad de caché visual (GST-010); no se ejecutó render.
- [ ] Integraciones externas ejecutadas: no; esta auditoría solo inspecciona código externo.
- [ ] Implementación de las tareas: no autorizada en esta etapa.
- [ ] Prueba de publicación real: pendiente de aprobación de una pieza y autorización de envío.

Solo se modifican documentos. No se instaló ninguna dependencia, modificó n8n, generó voz de pago ni publicó contenido. Las pruebas nuevas usaron carpetas temporales que se eliminaron al terminar. Que las 47 pruebas existentes pasen no descarta los casos adicionales reproducidos.

## Lo que ya tenemos y se conserva

| Capacidad | Estado comprobado en este alcance | Evidencia actual | Decisión |
|---|---|---|---|
| Validación de solicitudes y respuesta creativa | YA RESUELTO para los contratos probados | [contracts.mjs:4](../contracts.mjs#L4), `assertJob`, `assertGenerated`; `action-plan.test.mjs` | MANTENER Ajv; ampliar casos específicos al corregir, no sustituirlo. |
| Aprobación de archivo, texto, cuenta, marca y recursos | YA RESUELTO en código y pruebas; envío público no revalidado aquí | [releases.mjs:9](../releases.mjs#L9), `publicationBundle`; [marketing.mjs:33](../marketing.mjs#L33), `approveRelease`, `approvedRelease`, `validateDelivery` | MANTENER aprobación humana ligada a la versión. |
| Prevención de reenvíos inciertos | YA RESUELTO para el bloqueo; operación humana PARCIAL | [marketing.mjs:54](../marketing.mjs#L54), `claim`; [deploy/studio-publisher.cjs:15](../deploy/studio-publisher.cjs#L15), `process` | MANTENER el bloqueo; completar GST-004. |
| Edición y caché por escena | YA RESUELTO en estructura y pruebas unitarias; no se repitió el render audiovisual completo en esta pasada | [render.mjs:110](../render.mjs#L110), [scene-cache.mjs:18](../scene-cache.mjs#L18) | MANTENER; no construir otro renderizador. |
| Recorte de voz y toma alternativa | IMPLEMENTADO, inspeccionado; interfaz/audio no ejecutados ahora | [editor-tools.js:15](../editor-tools.js#L15), WaveSurfer y regiones en líneas 21–26 | MANTENER; no proponer integrarlo otra vez. |
| Nueve estilos | YA RESUELTO como nueve estructuras disponibles; no son nueve motores visuales independientes | [styles.mjs:1](../styles.mjs#L1), `styleTemplate`; tres familias existentes | MANTENER; mejorar configuración efectiva con GST-005. |
| Temas por marca, objetivo e historial | YA RESUELTO para selección y similitud lexical; no hay prueba de verificación semántica de hechos | [planning.mjs:11](../planning.mjs#L11), `proposals`; [editorial.mjs:16](../editorial.mjs#L16) | MANTENER el flujo; precisar evidencia con GST-007. |
| Versiones guardadas y recuperación | YA RESUELTO; comparación PARCIAL | [versions.mjs:9](../versions.mjs#L9), [editor.html:71](../editor.html#L71) | Mejorar el comparador existente, GST-006. |
| Cuatro derivados de campaña | PARCIAL: genera briefs relacionados, no cuatro medios terminados | [planning.mjs:25](../planning.mjs#L25), `deriveCampaign`; [local.mjs:154](../local.mjs#L154) | No describir planificación como producción multiformato completa; GST-008. |

## Orden interno inicial (antes del benchmark; conservado como historial)

Supuestos: un desarrollador, operación privada y volumen pequeño; no se dispone de mediciones nuevas de horas editoriales, carga o facturas. El esfuerzo es relativo, no un compromiso de plazo. Ninguna de estas tareas necesita sustituir el stack ni un proveedor nuevo. El orden final tras la comparación se encuentra al final del documento.

| Orden | ID | Tarea | Estado de capacidad | Decisión | Prioridad / esfuerzo | Estado de ejecución |
|---|---|---|---|---|---|---|
| 1 | GST-001 | Conservar contexto editorial al reintentar | PARCIAL; fallo reproducido | MEJORAR | P1 / pequeño | [ ] Pendiente |
| 2 | GST-002 | Recuperar el bloqueo huérfano del presupuesto | PARCIAL; fallo reproducido | MEJORAR | P1 / medio | [ ] Pendiente |
| 3 | GST-004 | Conciliar entregas inciertas desde la interfaz | PARCIAL; backend con recibo, interfaz insuficiente | MEJORAR | P1 / medio | [ ] Pendiente |
| 4 | GST-003 | Calcular costes por pieza sobre el registro completo | PARCIAL; fallo reproducido | MEJORAR | P1 / pequeño–medio | [ ] Pendiente |
| 5 | GST-005 | Hacer efectivos los ajustes visuales de marca | PARCIAL; desconexión comprobada por lectura | MEJORAR | P2 / medio | [ ] Pendiente |
| 6 | GST-006 | Comparar versiones por escena y por propiedades | PARCIAL | MEJORAR | P2 / medio | [ ] Pendiente |
| 7 | GST-007 | Separar hechos declarados de evidencia revisada | PARCIAL | MEJORAR | P2 / medio | [ ] Pendiente |
| 8 | GST-008 | Producir derivados de campaña mediante un lote revisable | PARCIAL | MEJORAR | P2 / medio–alto | [ ] Pendiente |
| Validación | GST-009 | Comprobar un envío real aprobado | NO VERIFICABLE en esta pasada | Validar, sin reconstruir publicador | Depende del usuario | [ ] Pendiente de autorización |

### GST-001 — Conservar el contexto al reintentar

**Problema y evidencia.** [jobs.mjs:187](../jobs.mjs#L187), `JobStore.retry`, reconstruye la petición con guion, campaña, concepto y opciones, pero omite `caption`, `creative_id` y `brief`. `create` los sustituye por cadena vacía o `null` en [jobs.mjs:115](../jobs.mjs#L115). Reproducción temporal: trabajo fallido con los tres campos → reintento → `caption:''`, `creative_id:null`, `brief:''`. El padre sí se conserva. No se ha comprobado que este fallo haya afectado una publicación real.

**Cambio ejecutable.** Copiar explícitamente esos campos al crear el nuevo trabajo y añadir una regresión al test de reintentos. Revisar qué enlace de pieza/campaña debe seguir apuntando al trabajo anterior: no reasignar silenciosamente una pieza aprobada al nuevo resultado.

**Módulos:** `jobs.mjs`, `jobs.test.mjs`; inspeccionar `local.mjs/createPiece` al comprobar la asociación de pieza. **Componente aprovechable:** la cola y `retry` actuales. MoneyPrinterTurbo confirma el patrón de preservar metadatos al actualizar artefactos, pero no resuelve directamente esta reconstrucción de petición; no requiere dependencia externa.

**Beneficio:** evitar reconstruir manualmente el texto y perder la referencia al guion. **Dependencias:** ninguna externa. **Riesgo:** heredar accidentalmente una aprobación; el nuevo trabajo debe quedar pendiente. **Coste operativo:** no añade proveedor ni infraestructura.

**Aceptación:** fallo/interrupción/cancelación → reintento con los tres campos idénticos y `parent_job_id` correcto; aprobación nueva `pending`; misma clave idempotente no crea un segundo reintento; prueba sin llamadas a IA.

### GST-002 — Recuperar bloqueos de presupuesto abandonados

**Problema y evidencia.** [budget.mjs:6](../budget.mjs#L6), `Budget.transact`, crea `budget.lock` vacío con `wx`, espera unas 100 × 50 ms y falla si sigue existiendo. Solo lo elimina en `finally`; una terminación abrupta puede impedir ese bloque. No registra propietario ni tiene recuperación de ese archivo. Se reprodujo con un lock temporal sin proceso propietario: `summary()` termina en «Presupuesto ocupado; revisar el bloqueo antes de reintentar».

**Cambio ejecutable.** Incorporar exclusión con identidad comprobable del propietario y recuperación segura del propietario muerto, o evaluar un bloqueo de sistema apropiado. Definir un mecanismo atómico para recuperar un lock heredado vacío; no borrarlo automáticamente solo por antigüedad.

**Módulos:** `budget.mjs`, pruebas de presupuesto/`action-plan.test.mjs`; tomar como referencia interna el manejo de propietario de `voz.mjs`, sin asumir que copiarlo resuelva todas las carreras. **Componente externo:** pendiente; no hace falta una cola nueva.

**Beneficio:** una caída deja de bloquear todo el control de gasto. **Dependencias:** comportamiento de procesos en Docker/Linux y macOS. **Esfuerzo:** medio. **Riesgo:** dos escritores podrían sobrepasar límites si recuperan simultáneamente un lock. **Coste operativo:** local, sin servicio nuevo.

**Aceptación:** matar un proceso de prueba que mantiene el lock y recuperarlo; un proceso vivo no pierde su lock; dos procesos concurrentes no reservan por encima del límite ni duplican un mismo ID; el JSON anterior sigue legible ante una interrupción de escritura.

### GST-003 — Coste completo por pieza, sin depender de una página del historial

**Problema y evidencia.** [budget.mjs:11](../budget.mjs#L11) devuelve `entries.slice(-250)`, aunque el total global sí usa todas las entradas. [local.mjs:146](../local.mjs#L146) calcula el coste de cada trabajo filtrando esa lista truncada. Con 251 reservas temporales, el primer trabajo devuelve reserva `0` en ese cálculo aunque su registro conserva `0.10`. Esto demuestra el comportamiento al crecer el historial, no que ya haya ocurrido con el volumen real.

**Cambio ejecutable.** Agregar por trabajo sobre el registro completo dentro del módulo de presupuesto; paginar únicamente el detalle. Devolver totales reservados, confirmados y estado de conciliación separados. Añadir al panel el formulario para el endpoint de conciliación que ya existe en [local.mjs:160](../local.mjs#L160), sin crear otro registro contable.

**Módulos:** `budget.mjs`, `local.mjs`, `marketing-ui.js:27`, pruebas de presupuesto. **Componente aprovechable:** `Budget.reconcile`, ya implementado en línea 10; no proponerlo como capacidad inexistente.

**Beneficio:** no confundir «fuera de la página de detalle» con «sin coste». **Dependencias:** importes reales y referencia de factura cuando se concilie; sin ellas se conserva «pendiente». **Riesgos:** doble atribución entre guion, intento y recurso de voz compartido; distinguir coste incurrido del uso de caché. **Esfuerzo:** pequeño–medio. **Coste operativo:** lectura/agrupación local; medir latencia con un historial sintético amplio.

**Aceptación:** 300 entradas, distribuidas entre varios trabajos: el primero y el último tienen totales correctos; paginar no cambia totales; importe desconocido no se presenta como cero confirmado; conciliar requiere administrador y referencia; no duplica un importe ya conciliado.

### GST-004 — Resolver una entrega incierta sin entrar al servidor

**Problema y evidencia.** [marketing.mjs:54](../marketing.mjs#L54) pasa reclamaciones vencidas a `uncertain`; `result` en líneas 55–61 puede conciliar un recibo con `claim_token`. [deploy/studio-publisher.cjs:15](../deploy/studio-publisher.cjs#L15) vuelve a consultar recibos cuando existe `post_id`, pero detiene un incierto sin ID. La interfaz cuenta los casos ([marketing-ui.js:27](../marketing-ui.js#L27)) sin ofrecer un flujo de resolución; `snapshot` oculta correctamente el token (marketing.mjs:15). Se revisaron rutas de API, acciones de calendario y publicador: no se encontró un flujo administrativo guiado para el caso sin recibo. No significa que el backend carezca de conciliación.

**Cambio ejecutable.** Añadir una vista de la entrega incierta con archivo aprobado, cuenta, hora, intentos y recibos. Permitir al administrador verificar y vincular un recibo existente mediante una operación auditada. Si no hay evidencia suficiente, mantener la entrega incierta; no reencolar automáticamente ni interpretar la ausencia de un resultado de búsqueda como prueba de que no se publicó.

**Módulos:** `marketing.mjs`, `local.mjs`, `marketing-ui.js`, `deploy/studio-publisher.cjs`, `publisher.test.mjs`, `marketing.test.mjs`.

**Componente aprovechable:** validación de cuentas, recibos y estados existente. **Dependencias:** para una comprobación real, acceso de lectura al proveedor y contrato oficial aplicable; pendiente de validación específica. **Beneficio:** resolución segura y auditable por el operador. **Esfuerzo:** medio. **Riesgo principal:** enlazar otra cuenta o reenviar un contenido ya publicado. **Coste:** primero dobles de proveedor; llamadas reales de consulta sujetas a límites, sin estimar tarifas no verificadas.

**Aceptación:** simular timeout después de aceptación; vincular una vez el recibo correcto; rechazar otra cuenta y recibo duplicado; conservar auditoría y fecha del proveedor; publicar cero veces durante la conciliación. El caso sin pruebas permanece retenido.

### GST-005 — Conectar los ajustes visuales de marca con el compositor

**Problema y evidencia.** [marketing.mjs:17](../marketing.mjs#L17) almacena `design.font`, `subtitle`, `safe_top` y `safe_bottom`; [jobs.mjs:101](../jobs.mjs#L101) transporta `brand.design`. Pero [media-scenes.js:15](../media-scenes.js#L15) fija `top` y `bottom` según altura, y líneas 6, 8 y 42 fijan Montserrat y la presentación del subtítulo. La búsqueda de consumidores y lectura de la composición no encontró aplicación de `brand.design.safe_top/safe_bottom`. La identidad existe (colores, nombre, logo); lo parcial son esos ajustes, no todo el sistema de marcas.

**Cambio ejecutable.** Definir y validar un resolvedor de configuración por marca y relación de aspecto. Consumir sus márgenes y opciones de subtítulo en vista previa y render. Mantener los valores actuales como preset predeterminado y Montserrat como fuente disponible; no abrir un cargador de fuentes arbitrarias en esta tarea. Exponer solo opciones que realmente se apliquen.

**Módulos:** `marketing.mjs`, `media-scenes.js`, `formats.js`, `studio.html`/`n8n-style.js` cuando corresponda, `render.mjs`, formulario de marca en `marketing-ui.js`.

**Componente aprovechable:** plantillas y compositor actuales. **Dependencias:** fixtures visuales por familia y formato; evidencia de márgenes de plataforma si se presentaran como específicos de una red. **Beneficio:** control de legibilidad coherente y configuración que no sea solo metadatos. **Esfuerzo:** medio. **Riesgo:** alterar el estilo original que gusta al usuario o producir demasiados márgenes en horizontal. **Coste operativo:** render local para regresiones; ninguna IA nueva.

**Aceptación:** cambiar el margen de una marca mueve el contenido en preview y exportación; otra marca permanece igual; rechazar medidas inválidas; probar las tres familias en los cuatro formatos; conservar las capturas del preset original salvo diferencias aprobadas; detectar texto que invada las áreas configuradas.

## Siguiente etapa, sin mezclarla con los cinco primeros cambios

### GST-006 — Comparación de versiones útil para corregir escenas

**Estado:** PARCIAL; MEJORAR. **Evidencia:** [editor.html:71](../editor.html#L71) compara por índice y solo título/texto seleccionado y voz. No informa todos los cambios de duración, recursos, recorte, orden o diseño; una escena eliminada al final puede no aparecer en el recorrido de la versión comparada. `Versions` ya guarda el guion completo.

**Tarea:** comparar por ID estable de escena, mostrar altas/bajas/orden y propiedades modificadas, junto con duración, medio y recorte de voz. **Módulos:** `editor.html`, `editor-tools.js`, pruebas del comparador; reutilizar `versions.mjs`. **Beneficio:** localizar qué cambió sin reconstruir versiones. **Dependencias:** los proyectos antiguos necesitan fallback explícito cuando no tienen ID. **Esfuerzo/riesgo:** medio; no inventar equivalencia de escenas antiguas. **Coste:** local. **Aceptación:** mismo texto pero recurso, orden o duración diferentes aparece como cambio; restaurar sigue creando un borrador, nunca una aprobación. Referencia externa todavía no investigada.

### GST-007 — Trazabilidad de hechos también en imagen, carrusel e historia

**Estado:** PARCIAL; MEJORAR. **Evidencia:** [creative.mjs:38](../creative.mjs#L38) distingue declaraciones sin evidencia en el texto de origen; línea 43 exige `claim_ids` solo para video. [planning.mjs:20](../planning.mjs#L20) llama «hecho verificado» también al fallback de `brand.facts`. La interfaz de marca asigna `verified` cuando se escribió una fuente; eso no es una comprobación semántica automática.

**Tarea:** separar `declared` de `reviewed`, conservar quién revisó y cuándo; evitar llamar verificado al fallback; extender referencias a los campos/páginas de los otros formatos; mostrar las referencias al revisor. **Módulos:** `marketing.mjs`, `marketing-ui.js`, `creative.mjs`, `planning.mjs`, contratos y fixtures editoriales. **Beneficio:** menos afirmaciones sin origen rastreable. **Dependencias:** revisión humana de las fuentes, no un agente que declare verdaderas sus propias frases. **Esfuerzo/riesgo:** medio; no bloquear hechos legítimos existentes sin plan de migración. **Coste:** no exige nuevas llamadas de IA. **Aceptación:** una declaración no revisada conserva ese estado; IDs inexistentes fallan antes de renderizar; cada página de un carrusel lleva referencia; la revisión distingue fuente declarada de evidencia validada. Referencia externa pendiente.

### GST-008 — Del concepto compartido a un lote de borradores multiformato

**Estado:** PARCIAL; MEJORAR. **Evidencia:** [planning.mjs:25](../planning.mjs#L25) crea cuatro briefs con `concept_id`; [local.mjs:154](../local.mjs#L154) guarda piezas, no ejecuta cuatro exportaciones. El usuario ya puede producirlas por separado.

**Tarea:** añadir «Preparar lote» sobre las piezas relacionadas, mostrar alcance y reserva prevista antes de generar, producir hijos mediante la cola existente y reintentar solo el hijo fallido. Adaptar mensaje y composición, no estirar el mismo video. **Módulos:** `planning.mjs`, `create-ui.js`, `local.mjs`, `jobs.mjs`, `budget.mjs`. **Beneficio:** menos preparación repetida por campaña. **Dependencias:** GST-001/003 y presupuesto explícito. **Esfuerzo/riesgo:** medio–alto; evitar cuatro llamadas duplicadas si se interrumpe la pantalla. **Coste:** depende del número de guiones/recursos realmente nuevos; medirlo, no prometer que reutilizar sea siempre gratis. **Aceptación:** un lote genera los cuatro borradores vinculados; no publica; una falla no repite los tres hijos terminados; costes y estados por hijo; cada resultado requiere aprobación propia. Referencia externa pendiente.

### GST-009 — Validar una entrega pública real ya aprobada

**Estado:** NO VERIFICABLE en esta pasada; pendiente de autorización específica para enviar. **Evidencia:** `implementation-plan.json` registra explícitamente cero publicaciones de prueba y primer envío real pendiente. Eso se conserva como límite, no se convierte en un fallo supuesto del publicador.

**Tarea:** con una pieza y cuenta elegidas por el usuario, revisar archivo/caption, aprobar, programar una sola entrega y contrastar recibo, enlace y fecha; repetir consultas sin repetir publicación. **Módulos:** publicador actual, aprobación y ledger, sin construir otro conector. **Dependencias:** autorización de la pieza y envío real; conexiones vigentes. **Esfuerzo/riesgo:** pequeño, acción pública irreversible que no se ejecuta durante esta auditoría. **Coste:** proveedor/red según configuración vigente, no verificado aquí. **Aceptación:** una sola publicación real del archivo/texto/cuenta aprobados y un único registro confirmado. Sin autorización queda pendiente.

## Evidencia práctica de los tres fallos reproducidos

Ejecución: 2026-10-01T11:17:04Z. Fixtures sintéticos, cero proveedores y cero cambios de producción.

| Reproducción | Preparación aislada | Resultado observado |
|---|---|---|
| GST-001 | JobStore con executor que falla; crear trabajo con caption, creative_id y brief; llamar a retry | Los tres datos no se conservan; parent_job_id sí. |
| GST-002 | Budget en carpeta temporal; archivo budget.lock sin propietario; llamar a summary | Error de presupuesto ocupado después de agotar la espera; no recuperación. |
| GST-003 | 251 reservas, una por trabajo, en budget.json temporal; summary y el mismo agregado por trabajo usado por operations | Solo devuelve 250 entradas; la primera pieza suma 0 aunque su reserva guardada es 0.10. |

Estas reproducciones verifican los límites del código, no incidentes históricos de las cuentas reales. El script temporal utilizado fue `/private/tmp/studio-internal-audit.mjs`; los resultados son `/private/tmp/studio-internal-audit-result.json`. Se han descrito aquí los fixtures para que no dependan de la conservación de `/tmp`.

## Qué no cambiar ni empezar todavía

- No rehacer Studio, cambiar el lenguaje o reemplazar n8n: no se justifican por los fallos encontrados.
- No integrar de nuevo Ajv, WaveSurfer, caché por escena o aprobación inmutable: ya existen.
- No copiar aplicaciones enteras ni añadir Remotion/BullMQ/WhisperX antes de contrastar módulos, licencias y necesidad real.
- No activar los publicadores antiguos para «probar»: la validación debe respetar la aprobación central.
- No afirmar que los nueve estilos equivalen a nueve motores ni que cuatro briefs son cuatro piezas ya producidas.

## Comparación externa aplicada a las tareas existentes

No se renumeran GST-001–009 ni se vuelven a proponer capacidades implementadas. Las referencias detalladas y licencias están en [benchmark-github.md](benchmark-github.md).

| ID | Resultado de la comparación | Decisión |
|---|---|---|
| GST-001 | MPT conserva campos en artefactos; nuestro defecto está en `retry`, no en el formato de datos | MEJORAR función existente; no integrar otra cola |
| GST-002 | Ninguna referencia proporciona un reemplazo necesario para el lock de archivo de esta instancia | MEJORAR propietario/recuperación local; no migrar a Temporal |
| GST-003 | waoowaoo separa plan/cotización y libro de costes, pero su economía de créditos no aplica | Corregir agregado propio; INSPIRARSE en separar estimación/real/pendiente |
| GST-004 | AiToEarn separa `verify/finalize`; Postiz sondea sin repetir mutaciones | INSPIRARSE en conciliación; bloqueo propio ya resuelto |
| GST-005 | Pixelle tipa parámetros y Carousel separa config/documento | Conectar ajustes existentes antes de ampliar catálogo |
| GST-006 | LTX usa assets/takes y clips con identidad estable | MEJORAR diff por escena; no cambiar snapshots |
| GST-007 | Checkpoints de revisión de VideoLingo son una referencia de proceso, no verificación factual | MEJORAR procedencia/aprobador en el modelo propio |
| GST-008 | Pixelle separa plantilla/medio y waoowaoo cotiza operaciones antes de ejecutarlas | Lote propio con presupuesto y resultados independientes; no copiar agentes |
| GST-009 | Los conectores externos tampoco prueban nuestras credenciales ni publicación real | Validación pendiente; no construir conector nuevo |

## Oportunidades nuevas surgidas del código

Estados de investigación para GST-010–016: [x] estructura/documentación, [x] código relevante, [x] comparación. [ ] integración externa práctica. Estado de implementación de todas: **[ ] pendiente**. Los fixtures que sí se ejecutaron se especifican, sin convertirlos en integraciones probadas.

### GST-010 — Completar la identidad de la caché visual

**Estado:** PARCIAL; defecto de clave reproducido, efecto sobre un MP4 no ejecutado. **Origen:** hallazgo propio al contrastar la disciplina de caché de VideoLingo. **Decisión:** MEJORAR. **Impacto:** alto en fidelidad de correcciones. **Prioridad:** P1. **Esfuerzo:** pequeño–medio.

**Evidencia:** [render.mjs:114](../render.mjs#L114) pasa escena, marca, evidencia, runtime, aspecto y contexto posicional. [media-scenes.js:17](../media-scenes.js#L17) lee `story.design_family` y línea 38 `story.editorial_topic`, que no entran en esa clave. Con una escena `media` sin familia explícita ni recurso, cambiar `paper/inventario` por `editorial/ventas` produce la misma clave para entradas visualmente diferentes. Fixture de `sceneKey`, sin Chrome, archivos reales ni proveedores. Resultado guardado temporalmente en `/private/tmp/studio-cache-audit-result.json`; para reproducir basta mantener escena/marca/source/aspect/fps/renderer/context e intercambiar los dos campos globales.

**Tarea:** centralizar las entradas visuales efectivas por escena; incluir familia y tema efectivos, no todo el historial o la campaña. Inventariar otros globales consumidos por cada renderer. Incrementar versión de esquema de caché e incluir pruebas de invalidación/reutilización. La aprobación del archivo final debe seguir intacta.

**Módulos:** `scene-cache.mjs`, `render.mjs`, `media-scenes.js`, pruebas de caché existentes. **Referencia:** VideoLingo `core/asr_backend/transcription_cache.py` como patrón de identidad completa, sin copiar su backend Python. **Dependencias:** ninguna externa; antes de GST-012. **Riesgo:** invalidar más segmentos de los necesarios o conservar otro global omitido. **Coste operativo:** una reconstrucción inicial de caché local; no necesita nueva TTS si voz no cambia.

**Aceptación:** cambiar `design_family` y `editorial_topic` cambia la clave cuando afectan píxeles; cambiar solo el nombre de campaña no; render de fixture sin voz muestra el nuevo fondo/esquema; una escena no afectada mantiene hit. El test de clave y el de píxeles son comprobaciones distintas.

### GST-011 — Páginas de subtítulos según lectura y ancho

**Estado:** PARCIAL: sincronización, voz y resaltado ya existen. La mejora de comprensión está por medir. **Decisión:** ADAPTAR algoritmo pequeño. **Origen:** Short Video Maker + división validada de VideoLingo. **Prioridad:** P2. **Esfuerzo:** medio.

**Evidencia:** [media-scenes.js:41](../media-scenes.js#L41) encuentra palabra activa; línea 42 agrupa de cuatro en cuatro y reduce tipografía. `n8n-style.js` tiene su propio pintado, por lo que no basta cambiar un solo estilo. Short Video Maker `src/components/utils.ts:createCaptionPages` agrupa por líneas/longitud/pausa; su comparación cuenta caracteres, no píxeles.

**Tarea:** introducir una función pura compartida `captionPages(words, metrics, limits)` que conserve tiempos/orden y agrupe por ancho real, pausa y puntuación; definir límites de dos líneas, duración mínima y velocidad máxima como ajustes comprobables de marca/formato. Conservar colores y palabra activa del estilo comercial. No reescribir texto ni omitir palabras para que quepan.

**Módulos:** `media-scenes.js`, `n8n-style.js`, renderer original en `studio.html`, pruebas de captions y controles de marca. **Licencia:** algoritmo candidato MIT; conservar aviso si se adapta código. No integrar Remotion ni Kokoro. **Dependencias:** GST-005/010 para geometría/caché consistentes. **Riesgos:** grupos que saltan demasiado rápido o separación de cantidades/negaciones; una heurística no garantiza comprensión. **Coste:** CPU local; cero llamadas nuevas de voz si solo cambia paginación.

**Aceptación:** fixtures de ComandPOS, nombres, RD$65,995.78, negaciones, puntuación y pausas; ninguna palabra perdida/duplicada; tiempos monótonos; sin desborde en los cuatro aspectos; resaltado conserva intervalos de alineación. Revisión humana de tres clips con voz actual antes/después, registrando correcciones y tiempo de lectura; no declarar mejora porcentual sin esa prueba.

### GST-012 — Manifiesto de plantillas y controles útiles de diseño

**Estado:** PARCIAL: nueve estilos/familias y formatos existen; falta una configuración homogénea aplicada por los renderizadores. **Decisión:** INSPIRARSE; construir contrato pequeño propio con Ajv. **Origen:** Pixelle + Carousel. **Prioridad:** P2. **Esfuerzo:** medio–alto, incremental.

**Evidencia:** [styles.mjs:1](../styles.mjs#L1) mezcla beats/layout; `media-scenes.js` y `brand-feed.mjs` contienen valores visuales fijos. Carousel separa `Config` y slides; Pixelle extrae parámetros tipados y dimensiones de plantilla.

**Tarea:** definir `template_id`, `template_version`, roles admitidos, aspectos, zonas seguras y parámetros tipados; separar marca (logo/colores/voz), estilo (jerarquía, transiciones, composición) y formato (dimensiones). Crear controles a partir del contrato, comenzando por familia comercial y una plantilla de carrusel. Migrar defaults sin alterar proyectos guardados. No ampliar de inmediato todas las páginas ni importar HTML libre.

**Módulos:** `styles.mjs`, `contracts.mjs`, `validar.mjs`, `media-scenes.js`, `brand-feed.mjs`, `editor.html`, `feed-editor.html`. **Componentes:** patrón de `frame_html.py` y esquemas de Carousel; no sus frameworks. **Dependencias:** GST-005/010; para carruseles de más páginas habría que ampliar también validación, rutas de artefactos y publicador, fuera del primer incremento. **Riesgos:** romper templates históricos o mezclar marcas; defaults deben quedar versionados. **Beneficio:** cambiar composición sin tocar código en cada pieza. **Coste:** almacenamiento de previews/CPU, sin nuevo proveedor.

**Aceptación:** dos marcas × plantillas piloto × cuatro aspectos de video; logotipo/colores/tipografía/zonas efectivos, sin texto cortado; proyecto antiguo reproduce con su versión anterior; payload incompatible falla antes de comprar voz; ninguna plantilla permite inventar una función del producto.

### GST-013 — Caché ASR sensible a modelo, preproceso y algoritmo

**Estado:** PARCIAL; omisión comprobada por lectura, no fallo de voz real reproducido. **Decisión:** INSPIRARSE/ADAPTAR casos de prueba. **Origen:** VideoLingo. **Prioridad:** P2. **Esfuerzo:** pequeño–medio.

**Evidencia:** [subtitulos.mjs:11](../subtitulos.mjs#L11) usa `alignment-v2` + bytes de audio + texto. Devuelve cache antes de leer `WHISPER_MODEL`; no identifica versión/hash efectivo de modelo, `alinear.py` ni binario. VideoLingo `cache_key` y `valid_result` incluyen opciones/versión y validación de estructura/tiempos.

**Tarea:** guardar manifiesto de alineación con esquema, audio hash, texto, identidad de modelo, versión de whisper-cli, hash del alineador y opciones de preproceso/idioma. Validar palabras/tiempos y tratar caché inválida como miss recuperable; escritura atómica. No agregar credenciales ni rutas privadas al hash público.

**Módulos:** `subtitulos.mjs`, `alinear.py`, `Dockerfile` (exponer versión fijada, sin cambiar modelo inicialmente), pruebas de alineación. **Dependencias:** ninguna API; usar el modelo ya disponible al validar integración. **Riesgo:** recalcular ASR de todas las voces al migrar; amortizar identidad del modelo para no hashear pesos en cada frase. **Coste:** CPU adicional en misses, no recompra de TTS. Apache-2.0 si se adaptan fragmentos/test cases.

**Aceptación:** mismo audio/texto/runtime → hit aunque cambie nombre de archivo; cambio de modelo/algoritmo/preproceso → miss; NaN, orden imposible o JSON roto → recuperación controlada; no regenerar la voz; casos críticos de negación/cantidad de `alinear_test.py` siguen pasando.

### GST-014 — Preflight de disco y limpieza segura de segmentos

**Estado:** FALTANTE VERIFICADO en el flujo revisado: existe caché, temporales y retención de backups, pero no se encontró cuota/preflight/limpieza selectiva de caché en `jobs` → `render` → `scene-cache` ni API de operaciones. No significa ausencia de toda limpieza del servidor. **Decisión:** ADAPTAR/INSPIRARSE. **Origen:** LTX y MoneyPrinterTurbo. **Prioridad:** P2, subir a P1 si la medición muestra disco escaso. **Esfuerzo:** medio.

**Tarea:** medir volumen real con `fs.statfs` antes de reservar trabajo costoso; estimar espacio mínimo conservador y mostrar ocupación de caché. Añadir dry-run de limpieza con lista y bytes, ignorando symlinks/archivos desconocidos, protegiendo referencias activas y artefactos aprobados. Separar caché regenerable, medios originales, exports y backups. Revalidar archivo antes de borrar, no confiar solo en antigüedad.

**Evidencia/módulos:** `scene-cache.mjs:26`, `render.mjs:110`, `local.mjs:146`, `deploy/backup.sh` (retiene backups, no segmentos). LTX `electron/free-disk-space.ts` + test; MPT `cache_manager.py` + `test_cache_manager.py` comprueban symlinks y archivo sustituido.

**Dependencias:** inventario de ocupación real pendiente; no borrar durante auditoría. **Riesgo:** eliminar material no regenerable/uso concurrente; por eso primero solo diagnóstico. **Beneficio esperado:** fallar antes de pagar si no hay espacio, recuperar disco controladamente. **Coste:** lectura de metadatos; límite a definir con medición, no cifra inventada.

**Aceptación:** disco insuficiente simulado bloquea antes de TTS; ruta inexistente asciende al volumen padre; EACCES no se disfraza de espacio cero; dry-run no escribe; al ejecutar limpieza autorizada, archivos activos/aprobados/ajenos/symlinks quedan intactos; bytes liberados se verifican.

### GST-015 — Capacidades y preflight por cuenta/plataforma

**Estado:** PARCIAL: validación técnica, cuenta y publicador ya existen. **Decisión:** INSPIRARSE. **Origen:** AiToEarn/Postiz. **Prioridad:** P2. **Esfuerzo:** medio.

**Evidencia:** `marketing-ui.js:14` ofrece YouTube junto a otros canales; `deploy/studio-publisher.cjs:18–37` implementa Instagram y Buffer Facebook/TikTok, no YouTube. Se pueden registrar plataformas sin tener conector automático. AiToEarn define `resolveMediaRules/validate`; Postiz consulta datos del creador.

**Tarea:** contrato `capabilities(account, kind)` con modos `registro_manual`, `publicacion_api`, `requiere_accion`; errores de formato/duración/permisos antes de generar o programar. Mostrar capacidad confirmada y fecha de comprobación; invalidar elegibilidad expirada. Revisar requisitos oficiales por cada conector realmente usado. No construir TikTok Direct Post privado: las directrices consultadas no lo consideran uso aceptable.

**Módulos:** `marketing.mjs`, `marketing-ui.js`, `contracts.mjs`, `deploy/studio-publisher.cjs`, `publisher-base.cjs`. **Dependencias:** comprobaciones de cuentas con credenciales en etapa posterior, docs vigentes del proveedor; no enviar contenido para comprobar elegibilidad. **Riesgos:** límites desactualizados o declarar permitida una función que solo está en UI. **Coste:** consultas read-only según proveedor; tarifa no comprobada. No copiar AGPL de Postiz sin evaluación; patrón independiente.

**Aceptación:** YouTube se identifica como registro/manual hasta integrar conector; una historia no compatible se bloquea antes de compra/render; respuesta desconocida no se convierte en permiso; cuenta y destino del release siguen siendo los aprobados; fixtures por plataforma, sin publicación.

### GST-016 — Exportación de proyecto para edición externa

**Estado:** FALTANTE VERIFICADO en las rutas/exportadores inspeccionados (salida actual MP4/JPG/manifest, sin handoff NLE). **Decisión:** POSPONER; opcional. **Origen:** LTX Desktop. **Prioridad:** P3. **Esfuerzo:** medio–alto.

**Tarea futura:** exportar paquete con clips por escena, voz/música, SRT y manifest, y opcional FCP 7 XML; conservar posiciones/duraciones/recortes y dimensiones/fps reales. Una composición SVG se exportaría como clip renderizado: no prometer textos/capas editables completos.

**Módulos:** `render.mjs`, `scene-cache.mjs`, `jobs.mjs:artifactPath`, `editor-tools.js`, nuevo exportador pequeño. **Componente:** LTX `exportFcp7Xml`, Apache-2.0, no el hook que fija resolución. **Dependencias:** decisión de editor externo real y necesidad de acabados manuales; autorización para copiar código/licencias. **Riesgos:** diferencias de XML/tiempos/transiciones, duplicación de medios y rutas privadas en export. **Coste:** almacenamiento/CPU y licencia del editor elegido, no estimada. **Criterio:** importar un paquete en el editor seleccionado y contrastar duración, orden, audio y encuadre; si no hay uso real, no construirlo.

## Inventario final y prioridades

**Supuestos:** un desarrollador, uso privado, una instancia y volumen modesto; el volumen diario exacto y presupuesto disponible no se midieron. Esfuerzo relativo: pequeño = cambio localizado; medio = varios módulos/pruebas; alto = flujo nuevo. Costes monetarios exactos pendientes de medición, no tarifas inventadas. Las primeras cinco mejoras usan el stack existente.

| ID | Capacidad actual | Hallazgo / consecuencia | Decisión | Impacto / esfuerzo | Coste operativo incremental | Prioridad / estado |
|---|---|---|---|---|---|---|
| GST-001 | PARCIAL | Retry pierde caption/brief/creative_id | MEJORAR | Alto / pequeño | Sin proveedor nuevo | P1 / [ ] |
| GST-002 | PARCIAL | Lock huérfano puede impedir presupuesto | MEJORAR | Alto / medio | Mínimo local | P1 / [ ] |
| GST-010 | PARCIAL | Contexto visual omitido de caché | MEJORAR | Alto / pequeño–medio | Recalcular segmentos afectados | P1 / [ ] |
| GST-003 | PARCIAL | Coste de pieza antigua incompleto | MEJORAR | Alto / pequeño–medio | Agregado de ledger local | P1 / [ ] |
| GST-005 | PARCIAL | Ajustes de marca no siempre aplicados | MEJORAR | Alto visual / medio | Re-render local | P2 / [ ] |
| GST-004 | PARCIAL | Entrega incierta bloqueada pero difícil de resolver | INSPIRARSE | Alto operacional / medio | Consultas de recibos | P1 tras correcciones / [ ] |
| GST-011 | PARCIAL | Paginación fija limita control de lectura | ADAPTAR | Alto visual / medio | CPU, no TTS nueva | P2 / [ ] |
| GST-013 | PARCIAL | Caché ASR ignora cambios efectivos del alineador | INSPIRARSE | Medio / pequeño–medio | ASR local en miss | P2 / [ ] |
| GST-012 | PARCIAL | Parámetros y familias poco configurables | INSPIRARSE | Alto edición / medio–alto | Previews y almacenamiento | P2 / [ ] |
| GST-006 | PARCIAL | Diff incompleto impide revisar ciertos cambios | MEJORAR | Medio / medio | Mínimo local | P2 / [ ] |
| GST-007 | PARCIAL | Declarado se presenta como verificado | MEJORAR | Alto editorial / medio | Revisión humana | P2 / [ ] |
| GST-008 | PARCIAL | Derivados se quedan en briefs | MEJORAR | Alto tiempo / medio–alto | Generación por derivado, con techo | P2 / [ ] |
| GST-014 | FALTANTE VERIFICADO | Falta política de espacio/caché en el flujo | ADAPTAR | Medio–alto / medio | Metadatos/disk IO | P2 / [ ] |
| GST-015 | PARCIAL | Selector ≠ capacidad publicadora por cuenta | INSPIRARSE | Medio–alto / medio | Consultas proveedor | P2 / [ ] |
| GST-016 | FALTANTE VERIFICADO | Sin handoff NLE; utilidad aún no medida | POSPONER | Opcional / medio–alto | Disco/editor | P3 / [ ] |
| GST-009 | NO VERIFICABLE | Primer envío del nuevo flujo sin prueba actual | VALIDAR | Alto / pequeño | Envío autorizado | Bloqueada por alcance, no por bug |

**Cinco primeras tareas elegidas:** GST-001 → GST-002 → GST-010 → GST-003 → GST-005. Son las bases de una edición fiel, recuperable y con costes legibles. GST-004 sigue siendo P1 operacional, pero el bloqueo seguro ya evita reenviar: no se desactiva mientras se construye la interfaz. Las mejoras de subtítulos/plantillas llegan sobre estas correcciones, no antes de ellas.

| Orden | Problema → cambio | Módulos / herramienta | Dependencias | Dificultad y riesgo | Aceptación verificable |
|---|---|---|---|---|---|
| 1 GST-001 | Pérdida de contexto → copiar campos explícitos | JobStore.retry + node:test existente | Ninguna | Baja; no heredar aprobación | Tres campos conservados, parent y clave idempotente correctos, revisión pending |
| 2 GST-002 | Lock abandonado → propietario verificable y recuperación atómica | Budget.transact; patrón local ya usado por proceso/voz | Casos de concurrencia | Media; nunca quitar lock activo por TTL solo | SIGKILL en fixture → siguiente proceso recupera; dos reservas no exceden techo |
| 3 GST-010 | Mismos hashes con distinto diseño → contexto efectivo en clave | scene-cache/render/media; inspiración VideoLingo | Inventario globales visuales | Baja–media; evitar invalidación masiva innecesaria | Cambio de familia/tema invalidan y cambian fixture renderizado; escena intacta reutiliza |
| 4 GST-003 | Agregado truncado → total completo separado de detalle | Budget.summary + operations; ledger propio | GST-002 | Baja–media; evitar doble imputación de caché | Más de 250 asientos, primer trabajo mantiene coste; reserva/real/conciliado separados |
| 5 GST-005 | Ajustes inefectivos → resolver visual común | marketing/jobs/media/feed; Pixelle/Carousel como patrón | GST-010, contratos compatibles | Media; preservar estilo que gusta | Marca personalizada visible en todas las familias/aspectos; proyectos antiguos mantienen defaults |

## Plan de ejecución y flujo mejorado

**Inmediato:** cinco tareas anteriores, regresiones permanentes y tests existentes. Resolver GST-004 antes de operar a mayor volumen. No pasar a generación pagada hasta disponer de coste/trazabilidad correctos.

**Siguiente etapa:** GST-011/013 para captions y alineación, GST-006/007 para revisión y procedencia, GST-012 en dos plantillas piloto, GST-014 primero en modo diagnóstico, GST-015 sin envíos. Después GST-008 genera lotes de campaña con techo de coste y cancelación por hijo. La revisión humana sigue siendo obligatoria por pieza/version.

**Evolución posterior:** GST-016 solo si hay demanda de edición externa; concurrencia distribuida únicamente si los tiempos de cola/carga reales lo justifican. No adoptar agentes para paginar, seleccionar formatos, cancelar, verificar hashes o conciliar costes: son funciones deterministas.

Flujo objetivo: seleccionar marca/campaña → Studio propone tres enfoques con fuente y similitud reciente → usuario elige/corrige → IA produce guion estructurado → usuario corrige escena/texto/recurso y ve presupuesto incremental → Studio reutiliza medios/voz y renderiza solo segmentos afectados → revisión técnica y humana → aprobación de versión+texto+cuenta → n8n reclama esa entrega y publica mediante conector habilitado → recibo/enlace/fecha vuelven a Studio → métricas disponibles se guardan con fuente/fecha. Un cambio posterior exige nueva aprobación; una respuesta incierta exige conciliación, no reenvío automático.

## Dónde sí aporta IA y cómo medirlo

**Dentro del producto:** conservar IA en propuesta/guion/foto contextual, usando claims aprobados y recursos de la marca. Mejorar GST-007 antes de añadir “tendencias”. Proponer variantes de mensaje es útil; hechos, presupuestos, timestamps, aprobaciones y estados se resuelven con reglas. No recomendar cambio de voz por un README: mantener perfil n8n y organizar un conjunto de evaluación en español con pronunciación de ComandPOS, cantidades dominicanas y frases naturales. Revisión humana escucha; ASR solo comprueba texto, no naturalidad. Nuevas tomas requieren coste/permiso explícito. Glosario pronunciable por marca es una **idea original opcional**, aún no tarea de integración: primero comprobar con muestras si el perfil actual falla.

**Para desarrollar Studio:** usar IA para localizar impacto, redactar fixtures/regresiones y explicar logs sin secretos; cada cambio se comprueba con tests deterministas y diff humano. Ningún agente necesita credenciales de redes para escribir tests de captions/cache. No añadir una plataforma multiagente ni conceder publicación al generador.

**Medición inicial y posterior:** registrar tiempo desde idea hasta aprobación, número de correcciones por escena, intentos de voz, cache hits/misses, fallos por fase, tiempo en cola, reservas/coste conciliado por pieza y porcentaje de recursos reutilizados. Tomar una muestra equivalente antes/después (mismas marcas/formatos); separar calidad técnica de aprobación editorial. No atribuir incremento de ventas ni ahorro porcentual sin datos. La infraestructura de métricas sociales ya existe; su uso real sigue pendiente de GST-009 y permisos del proveedor.

## Decisiones de no construcción

- MANTENER Node/HTML/Chromium/FFmpeg, la voz actual, Ajv, WaveSurfer, releases y caché segmentada corregida.
- POSPONER OpenCut: su main actual es una reescritura sin flujo editor→export completo en los puntos de entrada revisados.
- NO adoptar aplicaciones completas AiToEarn/Postiz/waoowaoo: duplican cuentas, colas, paneles y responsabilidades de n8n.
- NO instalar Remotion/Kokoro/WhisperX por dependencia transitiva; los algoritmos pequeños seleccionados no los necesitan.
- NO copiar medios/voz/modelos sin verificar su licencia y procedencia; raíz MIT/Apache no resuelve derechos de assets.
- NO construir un TikTok Direct Post privado para sustituir Buffer; revisar requisitos oficiales y conector habilitado.
- POSPONER GPU local, timeline multicapa completa, economía de créditos, SaaS multicliente y agentes publicadores autónomos.

## Punto exacto de continuación

La auditoría/documentación del alcance definido y comparación de los diez candidatos están finalizadas. **Estado al cerrar la auditoría: implementación pendiente entonces. Ver actualización de ejecución al principio para el estado actual.** Primer cambio recomendado: GST-001, test permanente de pérdida de `caption`, `creative_id` y `brief` en `jobs.test.mjs`, seguido de corrección localizada en `JobStore.retry`. Ejecutar esa regresión y suite existente; no hacer publicación ni llamada pagada para comprobarlo.

Quedan como validaciones futuras explícitas: render/browser de las mejoras una vez implementadas, calidad de voz escuchada por una persona, elegibilidad actual de cuentas, integración práctica de código externo y primer envío aprobado GST-009. No se presentan como trabajos terminados ni como tareas que seguirán solas en segundo plano.

## Verificación de la entrega documental

Se comprobaron rutas y líneas de referencias locales y permalinks contra los snapshots externos disponibles. Solo `docs/` aparece como cambio del árbol de trabajo; no se modificó funcionalidad. Los resultados locales de 47 pruebas Node y 6 Python se contrastaron con sus logs. El inventario tiene 16 IDs únicos; recomendaciones y validaciones pendientes están separadas de capacidades implementadas.
