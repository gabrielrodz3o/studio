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

**Pendiente externo:** no existe aún credencial publicitaria configurada; no se recibió ID de cuenta Ads y no se pudo acceder al panel de Meta mediante Brave. Por eso no se afirma que Meta/TikTok reales permitan leer insights, crear objetos o activar. Se crearon cero campañas reales y no se realizó gasto. Hace falta completar acceso de lectura y comparar una importación con Ads Manager antes de habilitar la fase de escritura.
