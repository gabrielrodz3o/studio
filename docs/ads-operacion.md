# Publicidad en GCODE Studio

## Alcance instalado

La sección **Publicidad y resultados** conserva el sistema orgánico existente. Meta: consultas de cuentas/campañas/conjuntos/anuncios e insights, borradores para tráfico web con una imagen o video, revisión editorial/derechos, autorización de presupuesto total, creación por fases pausadas y activación humana explícita. TikTok Ads: cuenta, inventario y reportes de lectura. No se implementan creación TikTok, Spark Ads, categorías especiales, carruseles de anuncios, formularios de leads, conversiones/píxeles ni optimización automática de inversión.

La fase inicial usa presupuesto **total**, no diario indefinido. Se introduce un entero de unidades menores de la cuenta y su moneda, sin conversiones con float. La UI muestra ese entero explícitamente: quien autoriza debe confirmar las unidades que Meta aplica a su cuenta. Los importes reportados son decimales exactos y no se agregan entre monedas, cuentas o atribuciones distintas.

## Configuración de acceso

1. Usar la aplicación existente `25485026691133696`. Confirmar en Meta su modo, caso de uso Marketing API, nivel/estado de `ads_read` y cuenta asignada `act_…`. El Business ID del enlace es `4194067017548903`, todavía no validado como propietario de la cuenta. No crear otra app.
2. Configurar una credencial con acceso de lectura en el mecanismo privado del servidor: variable `STUDIO_META_ADS_TOKEN`, o `.studio-state/ads/credentials.json` con clave `STUDIO_META_ADS_TOKEN` y valor secreto. Archivo 0600, propietario del proceso de Studio; nunca en Git ni en una captura/log. La UI solo recibe el nombre de la referencia, nunca el secreto.
3. Registrar cuenta, marca y usuarios autorizados en Publicidad. El ID y plataforma de una conexión no se pueden cambiar: otra cuenta requiere otro registro. Sin asignación, editor/lector no la ve; administrador conserva acceso administrativo.
4. Verificar conexión. La respuesta acredita lectura de metadatos de la cuenta, **no** que todos los permisos de escritura estén aprobados. Comprobación caduca a las 24 horas. No guardar scopes inventados ni inferir app de origen del token.
5. Opcional: marcar sincronización de lectura con n8n. Su cliente posee solo `ads.read` y `ads.sync` y únicamente ve conexiones con consentimiento `auto_sync`; no puede aprobar, autorizar, crear ni activar.

El archivo de credenciales no existe por defecto; no se generaron tokens Meta/TikTok. Para TikTok usar otra referencia privada de Business API autorizada para advertiser_id. La conexión Buffer/Content Posting no es una credencial Ads.

## Uso y autorización

Seleccionar cuenta verificada → pieza con exportación final aprobada → configurar anuncio y fechas con zona horaria → guardar borrador → revisar texto, destino, creativo y derechos publicitarios → autorizar importe total/moneda → crear en pausa → comprobar estado remoto → activar escribiendo la confirmación exacta de importe/moneda.

La aprobación editorial Ads es independiente de la publicación orgánica automática. El snapshot vincula pieza/job/hash/recursos/marca/cuenta y configuración. Cambiar la pieza o la conexión bloquea la autorización antigua. Editar un borrador conserva historial y elimina ambas aprobaciones. Con una operación remota existente se requiere otro borrador. Duplicar un guardado idéntico devuelve el borrador existente.

`STUDIO_ADS_ENABLE_WRITES=0` es el estado predeterminado de despliegue. Mantenerlo hasta completar pruebas reales de lectura, comprobar permisos/activos publicitarios y autorizar la fase de escritura. Habilitar esta variable es una intervención de despliegue; no concede por sí misma autorización de gasto. El flag controla llamadas remotas tanto de creación como de activación/pausa. **Si hubiera campañas activas, no deshabilitarlo como sustituto de pausar en Meta**: no detiene inversión existente y bloquearía la pausa desde Studio.

Los handlers API de escritura están implementados y probados con proveedores simulados, sin campañas reales durante la implementación. El primer ensayo remoto debe crear solamente objetos pausados con una configuración aprobada y verificar respuestas. La activación exige acción posterior explícita del dueño.

## Recuperación

El estado se escribe con fsync del archivo y del directorio antes de continuar. Cada fase (`media`, `cover` cuando hay video, `campaign`, `adset`, `creative`, `ad`) guarda intención antes de enviar y su ID al confirmar. Solo un proceso Studio puede escribir este estado; se utiliza el bloqueo de servicio existente y serialización del módulo. No ejecutar otra instancia sobre el mismo directorio.

Al reiniciar con una fase en curso, queda `uncertain`. No se repite. Para campaign/adset/creative/ad puede ingresarse un ID existente: Studio verifica cuenta, jerarquía y configuración antes de conservarlo. Si la carga de un recurso perdió su respuesta no se permite repetir automáticamente; requiere revisión del proveedor. Un error confirmado previo a crear otro objeto puede reanudarse conservando los IDs ya obtenidos.

Antes de activar se releen campaña, conjunto, creatividad y anuncio. La verificación de segmentación es conservadora: campos remotos adicionales no modelados bloquean activación para revisión, incluso si Meta los añadió por defecto. No se omite ese bloqueo para lograr una activación aparente. Una activación parcial se marca incierta y permite solicitar pausa de la campaña. Si falla la confirmación, comprobar Ads Manager; no afirmar que la inversión se detuvo.

Se conserva auditoría de actores, hashes, presupuesto, fases y IDs. No se guardan cuerpos/URLs de error del proveedor ni tokens en eventos. El SDK oficial usa transporte propio con Authorization header, debug y crash reporter desactivados, host fijo, timeout, paginación acotada y reintentos solo de GET. No se siguen enlaces de paginación arbitrarios.

## Resultados y n8n

`deploy/ads-sync.cjs` consulta Studio con su clave exclusiva, verifica una cuenta y recupera siete días completos según la zona horaria de la cuenta. El workflow corre cada hora; cada cuenta tiene un intervalo mínimo de seis horas entre intentos. Sin cuentas habilitadas termina `idle`, sin llamar a Meta/TikTok. No altera los workflows orgánicos.

Rutas integración:

- GET `/api/v1/ads`: snapshot filtrado por cuentas permitidas; scope `ads.read`.
- POST `/api/v1/ads/verify` y `/sync`: scope `ads.sync`, solo lecturas al proveedor; sincronización escribe snapshots locales.
- `/drafts`, `/approve`, `/authorize`, `/execute`, `/reconcile`, `/activate`, `/pause`: scopes independientes; no concedidos al sincronizador.

Las claves legadas no heredan acceso Ads. Integraciones con permisos explícitos pueden tener `ad_connections` como lista de IDs. El cliente de calendario Ads utiliza `automated_ads_sync: true` **solo con** los scopes `ads.read` y `ads.sync`, limitado por el consentimiento de cada conexión. La UI usa sesión, rol y comprobación de Origin existente.

Métricas: dimensiones de cuenta/anuncio/día/moneda/zona/atribución/versión API, revisión de importes tardíos y estado de cobertura. Meta conserva `attribution_spec` del conjunto cuando aparece en el inventario; si no está disponible permanece null, sin inferir ventana. TikTok conserva la atribución por defecto del proveedor, sin inventar días. Los días abiertos son provisionales. No se calculan ventas, ROAS ni causalidad sin fuentes adicionales; los anuncios no vinculados a Studio siguen visibles como no vinculados. La vista filtra cuenta/fechas y muestra hasta 500 observaciones recientes, conservando las demás en estado.

## Dependencias, migración y recuperación de despliegue

Se instaló `facebook-nodejs-business-sdk` **24.0.1**, versión publicada en npm durante la implementación. El código 26.0.2 de la rama inspeccionada en el benchmark no estaba publicado: no confundir referencia de investigación con dependencia ejecutada. Se utiliza Graph **v24.0** en este adaptador. Fijar versión y comprobar antes de futuras actualizaciones.

SDK aislado en `ads/package.json` / `ads/package-lock.json`; Docker instala mediante `npm ci --prefix ads --omit=dev --ignore-scripts`. Los manifiestos del renderizador se conservaron idénticos, para no invalidar snapshots audiovisuales por añadir publicidad. No se copió código de los repositorios externos: se usan SDK oficial y patrones implementados con código propio. Conservar los avisos de licencia de la dependencia Meta.

No hay migración destructiva. Estado nuevo en `.studio-state/ads/`; los registros de marketing, usuarios, sesiones y trabajos existentes permanecen. Antes del despliegue, `deploy/update-code.sh` comprueba cola vacía, respalda código y conserva la imagen anterior. Para volver atrás, etiquetar la imagen anterior y recrear el contenedor; conservar estado Ads para una recuperación posterior. No regresar de versión mientras una operación Ads está en curso. El sincronizador no publica y se puede desactivar independientemente.

Pruebas: `node --test *.test.mjs`; `python3 -B -m unittest alinear_test.py`; `npm audit --prefix ads --omit=dev`. Los fixtures no prueban permisos reales ni cumplimiento de políticas de un anuncio concreto. Validación de interfaz con servidor aislado y navegador sin sesión personal; nunca usar datos ficticios para mostrar producción como validada.

## Verificación y despliegue realizados

- Pruebas completas de Node: 151 aprobadas (124 existentes + 27 Ads); suite Ads repetida tras el ajuste de fsync, 27 aprobadas. Python/alineación: 6 aprobadas.
- `npm audit --prefix ads --omit=dev`: cero vulnerabilidades conocidas reportadas en la consulta de instalación.
- `node evaluations/ads-ui-smoke.mjs`: servidor real aislado, comprobación CSRF, estado inicial sin escritura, navegación de pestañas, escritorio 1440 px y móvil 390 px, sin errores JavaScript ni desbordamiento horizontal. Chrome se ejecutó con perfil temporal, sin sesión personal.
- En producción: GET Ads con clave lectora devolvió 200; intento de activar con esa clave recibió 401 antes del handler; página sin sesión devolvió 302 hacia login. Cero cuentas configuradas, escritura deshabilitada.
- n8n: workflow `HeVqpgMYx4sKHuxE` **GCODE Studio - Ads lectura y resultados**, activo, tres nodos. Ejecutor invocado directamente en n8n: `idle`, cero cuentas, `writes:false`. Esto valida el ejecutor y su conexión; no se afirma haber esperado al primer disparo horario.
- Los workflows orgánicos `XnDxoyTcnbawgPgY`, `QDXjXalYBBP0Oaaf`, `sn74WWUHBFoW6pqS` continúan activos; no se modificaron sus nodos ni credenciales.
- Primer despliegue saludable con respaldo `gcode-studio:before-20261002T014653Z`. Ajuste final distribuido en `studio-ads-20261002-final.tar.gz`; el script conserva además su imagen anterior. Los manifiestos raíz de render no cambiaron.

**Estado de despliegue anterior a la inspección de Brave:** no había credencial publicitaria configurada ni cuenta registrada. La inspección siguiente confirma los activos, pero no sustituye la validación API. Se crearon cero campañas reales y no se realizó gasto.


## Verificación en Brave — 1 octubre 2026, 22:49 AST

Inspección de la sesión existente, misma pestaña; sin extraer cookies, contraseñas ni tokens y sin modificar configuración remota.

- App `GCODERD n8n`, `25485026691133696`: Marketing API, Instagram, WhatsApp y Webhooks agregados. El interruptor de modo está marcado junto a «Activo»; no se cambió.
- Panel de permisos: `ads_read`, `ads_management` y `business_management` muestran **acceso estándar**, actividad de llamadas y «No se solicitó revisar la app». Marketing API Access Tier muestra **Limited access**. Esto acredita la configuración visible de la app, no los permisos de una credencial concreta.
- El enlace del negocio `4194067017548903` abre el portfolio **G code**. Cuentas publicitarias muestra `680943103845369`, propiedad de G code. Gabriel Rodriguez y GCODE SOFTWARE figuran con acceso total.
- Usuario de sistema existente **gcoderd-api**, ID `61591640285410`, Admin: tres activos asignados. Página G code y app GCODERD n8n con acceso total; Instagram gcoderd muestra «Todavía no hay nada asignado». **La cuenta publicitaria no figura en su lista de activos.** El usuario separado Conversions API System User tiene app de conversiones y píxel, no cuenta publicitaria en la lista inspeccionada.
- Pendiente: autorizar/asignar a gcoderd-api lectura de la cuenta publicitaria; comprobar o provisionar una credencial ads_read en el almacén privado; registrar la conexión y verificar metadatos e insights reales. No pulsado Generar token, no permisos cambiados y no campañas creadas.

Evidencia visual/DOM consultada (no captura de secretos):
- https://developers.facebook.com/apps/25485026691133696/app-review/permissions/
- https://business.facebook.com/settings/ad-accounts?business_id=4194067017548903
- https://business.facebook.com/settings/system-users?business_id=4194067017548903


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


### Cloudflare Email Routing — 2026-10-01T23:11-04:00

Revisión de la pestaña Cloudflare existente, solo lectura: gcoderd.com tiene Email Routing activado. Reglas play@gcoderd.com e info@gcoderd.com activas, ambas reenvían a un destino Gmail (dirección personal omitida). Catch-all desactivado. Panel de últimos siete días muestra cinco recibidos, dos entregados/reenviados y tres no autenticados; no se inspeccionaron mensajes ni se realizó un envío de prueba. El reenvío existente no cambia automáticamente el correo asociado a Gabriel Rodriguez en Meta, donde continúa Gmail. No se modificó DNS, correo, identidad ni permisos durante esta consulta.


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
