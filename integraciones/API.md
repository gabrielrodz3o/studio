# Studio API v1 e integración n8n

Servidor: `gcoderd2`, `/root/gcode-studio`. Acceso: https://studio.gcoderd.com.

## Acceso y conectividad

El subdominio usa el túnel de Cloudflare `staging` de gcoderd2
(`df32ba12-dd24-4a6a-9206-da0fda7cf080`) hacia `http://127.0.0.1:4173`.
No se abrió un puerto público en el servidor. Las cuatro rutas anteriores se conservaron.

La API requiere `Authorization: Bearer <clave>` y rechaza solicitudes de navegador con
Origin. El editor utiliza login, roles y cookie Secure/HttpOnly independientes. La clave
está en `data/state/api-token`, permisos 0600; n8n la guarda como credencial.
Nunca incluirla en guiones, captions, URLs ni exports del workflow.

Base de n8n: `https://studio.gcoderd.com`. La comunicación ya no depende de la conexión
privada 10.108.0.5 → 10.108.0.3 ni de la Mac. El workflow está activo, sin publicación social. Las pruebas HTTPS terminaron en
`Descargar borrador`: ejecución 389126 (imagen nueva) y 389128 (video reutilizado).

Workflow creado: [GCODE Studio - Producir multimedia privada](https://n8n.gcoderd.com/workflow/sn74WWUHBFoW6pqS).
El productor no publica en redes. Desde el 1-oct-2026, `h40YN1b3Yq8G1wyK` está pausado y se conserva como respaldo. La configuración instalada y credenciales
asociadas se registran en `/home/node/.n8n/gcode-studio-integration/` dentro de n8n.

## Contrato

| Método y ruta | Función |
|---|---|
| GET `/api/v1/health` | Salud y trabajos activos |
| GET `/api/v1/catalog` | Marcas, módulos y plantillas |
| POST `/api/v1/ideas` | Idea → borrador estructurado, con Idempotency-Key |
| POST `/api/v1/photos` | Solicitar fotografía, con Idempotency-Key |
| GET `/api/v1/photos/{id}` | Consultar fotografía y revisión |
| POST `/api/v1/photos/{id}/retry` | Reconsultar tarea fallida existente, máximo dos veces |
| POST `/api/v1/jobs` | Encolar producción, con Idempotency-Key |
| GET `/api/v1/jobs` | Lista de trabajos |
| GET `/api/v1/jobs/{id}` | Estado, progreso, revisión y archivos |
| GET `/api/v1/jobs/{id}/log` | Diagnóstico del montaje |
| POST `/api/v1/jobs/{id}/cancel` | Cancelar pendiente/en ejecución |
| POST `/api/v1/jobs/{id}/retry` | Reintento explícito con nueva clave |
| GET `/api/v1/jobs/{id}/delivery` | Entrega solo si está aprobado; de otro modo 409 |
| GET `/api/v1/jobs/{id}/artifacts/video` | MP4 privado, admite Range |
| GET `/api/v1/jobs/{id}/artifacts/image-1` … `image-4` | JPG por página |
| GET `/api/v1/jobs/{id}/artifacts/manifest` | Guion final, tiempos o controles |

```json
{
  "brand_id": "comandpos",
  "kind": "video",
  "template_id": "comercial-n8n",
  "voice": true,
  "subtitles": true,
  "allow_paid_voice": false,
  "max_budget_usd": 2,
  "aspect": "vertical",
  "preview": false
}
```

Tipos: `video`, `imagen`, `carrusel`, `historia_social`. Para piezas estáticas omitir
opciones de voz. Indicar `template_id` o `script` validado, exactamente uno.
`brief` solo registra contexto; no escribe un guion. Para ello usar `/ideas` con:
`{idea,kind,style,allow_paid:true}`; style es `historia`, `comercial` o `consejo`.
Imágenes requieren `topic_id` pertinente y fotografía aprobada para el tema.
Fotos: `{topic_id,allow_paid:true}`; consultar hasta `ready`, `failed` o `rejected`.

Primer POST de trabajo: 202 y `{reused:false,job:{...}}`. Misma clave/cuerpo: 200 y mismo
trabajo, incluso si cambió la plantilla. Misma clave con otro cuerpo: 409. Usar una clave
estable por pieza/campaña. No inventar una clave nueva para cada reintento de red.

Estados: queued, running, succeeded, failed, interrupted, cancelled. Al reiniciar se
recupera la cola; los trabajos que estaban ejecutándose quedan interrupted. Un reintento
es explícito y conserva el guion, opciones y caché de voz. Cada resultado se guarda aparte.
Límites: 20 pendientes, 12 escenas, 120 segundos de guion, 1800 caracteres de locución.
El render puede ampliar la duración para terminar la voz. Plazo máximo: 30 minutos.

Los archivos de borrador se pueden descargar autenticándose para revisión interna.
**Descargar no significa aprobar.** Para publicar, consultar `delivery` y exigir
`review.status === "approved"`. Solo un administrador desde el editor aprueba o rechaza.
La API de automatización no puede aprobarse a sí misma. `published:false` es deliberado.

## Cómo llamar el workflow

Subworkflow: «Execute Workflow» hacia `sn74WWUHBFoW6pqS`, pasando:

```json
{
  "idempotency_key": "campana-2026-10-01-imagen-1",
  "request": {
    "brand_id": "comandpos",
    "kind": "imagen",
    "template_id": "imagen-insumos"
  }
}
```

También POST a `/webhook/gcode-studio-producir-v1` en n8n con cabecera privada
`X-GCODE-Studio-Key`. Su valor está en `gcode-studio-integration/webhook-token`; no imprimirlo.
Responde 202 con el ID, consulta cada diez segundos y entrega borradores en binario `media`,
un ítem por página. Incluye `requires_approval`. No hay nodos de publicación.

Antes de conectarlo al flujo publicador, verificar la ejecución final,
consultar `delivery` y subir el archivo aprobado al medio/CDN que requiera cada red.
Las URLs privadas del Studio no sirven directamente como URLs públicas para Meta.

## Operación

Estado: `.studio-state/jobs/{id}` con guion, copia de recursos, log y artifacts.
Versiones y auditoría quedan en `.studio-state`. Fotos, voces y registros de tareas externas
son persistentes. El límite diario es una reserva conservadora, no facturación exacta.
No eliminar taskIds o candados para forzar compras repetidas.

Los JSON de ejemplo `n8n-solicitar-video.json` y `n8n-solicitar-imagenes.json` son plantillas
antiguas sin credenciales; la instalación actual se crea con `deploy/n8n-install.cjs`.
No volver a instalar si existe `installed.json`.


## Entregas y métricas del centro de marketing

El workflow productor anterior sigue entregando borradores. El nuevo publicador es
`XnDxoyTcnbawgPgY`; solo recoge entregas programadas por el administrador.

- `GET /api/v1/marketing`: marcas, campañas, piezas, recursos, entregas y métricas.
  No devuelve los tokens de reclamación.
- `POST /api/v1/deliveries/claim`: `{channel:"instagram"}` (también facebook/tiktok).
  Devuelve una entrega única con `claim_token` y `job`, `null` si no hay pendiente,
  o una entrega `blocked` si perdió su aprobación. No vuelve a reclamar un envío incierto.
- `POST /api/v1/deliveries/result`: `{id,claim_token,status,post_id,url,published_at,error}`.
  Estados: `published`, `failed`, `uncertain`. Publicado exige ID y URL HTTPS.
- `POST /api/v1/metrics`: `{delivery_id,at,source,views,reach,likes,comments,shares,
  saves,clicks,leads,demos,sales}`. Enviar solo métricas conocidas; no rellenar con cero
  los valores ausentes. Fecha ISO opcional. Misma entrega/fecha sustituye esa medición.

Las cuentas se comprueban antes de activar el workflow. Publicar de verdad requiere una
pieza final aprobada y programada; las pruebas de instalación no publican contenido.

Referencia del contrato de Instagram: colección oficial de Meta,
https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api.
El adaptador reutiliza la versión y cuenta del workflow activo existente. El esquema
`Post.metrics {type value unit}` de Buffer se comprobó por introspección autenticada.


`published_at` debe ser la fecha ISO informada por el proveedor. Si no está disponible,
omitirla; Studio guarda `confirmed_at` separadamente. Repetir el mismo recibo conserva
ambas fechas; permite completar una fecha de publicación que antes faltaba. Los trabajos
incluyen `publications` con estados, plataformas y enlaces, y `published` solo es verdadero
si existe una publicación confirmada. Estos campos no incluyen tokens de reclamación.


### Idea automática y producción en una llamada

`POST /api/v1/ideas`, con autenticación Bearer y `Idempotency-Key` estable:

```json
{"brand_id":"gcode","kind":"video","auto":true,"style":"auto","allow_paid":true,"produce":true,"allow_paid_voice":true,"aspect":"vertical"}
```

No requiere `idea`. La selección usa los hechos de la marca y el historial automático.
Estilos nuevos: `tutorial`, `pregunta`, `lista`, `solucion`, `comparativa`, `marca`;
se conservan `historia`, `comercial`, `consejo`. `style: "auto"` requiere `auto: true`.
`produce: false` devuelve solo el borrador. Con producción devuelve además `job`,
que se consulta mediante las rutas existentes hasta completarse. La voz tiene un
límite de US$2 y el guion reserva US$0.10. La publicación sigue requiriendo revisión
y programación. Reintenta una respuesta perdida con la misma clave y el mismo cuerpo.


## Contratos y aprobaciones — 1-oct-2026

La generación usa Ajv y rechaza campos desconocidos. Para `/api/v1/jobs` se requiere exactamente
uno de `template_id` o `script`. Video admite `aspect`: `vertical`, `horizontal`, `square`,
`portrait`; `preview:true` produce un borrador que no puede programarse. Se conservan
`campaign_id`, `concept_id`, `creative_id`, `parent_job_id` y `caption` cuando corresponden.

La credencial de productor tiene `read,produce,import`; la del publicador tiene
`read,publish,metrics,import`. Se almacenan hashes en `api-clients.json`. Ninguna permite
aprobar archivos, aprobar publicaciones o programar. Eso exige sesión humana de administrador.

La aprobación del trabajo verifica el archivo. Una aprobación adicional de publicación congela
el hash del archivo, caption final (incluida declaración de voz IA), cuenta de destino, marca,
portada y procedencia de recursos. Instagram/Facebook Stories no reciben caption separado en
este adaptador; debe estar compuesto dentro de la imagen. Cambios posteriores invalidan el release.

- `GET /api/v1/deliveries/{id}/verify`: devuelve release y trabajo solo mientras coinciden con
  la aprobación. El publicador lo consulta antes de cargar medios y justo antes del envío.
- `POST /api/v1/publications/import`: registra historia, no publica. Campos: `source` (`legacy`
  o `manual`), `brand_id`, `channel`, `post_id`, `url`, `published_at`, `caption`. Dedupe por canal/ID.
  `source:legacy,verification:unavailable` permite guardar un registro sin URL con estado
  `legacy_unverified`; una importación posterior con URL confirmada lo concilia.

Rutas de interfaz autenticada: `/api/proposals?brand=…&campaign=…`,
`POST /api/marketing/derivatives`, `GET /api/release-preview?piece_id=…`,
`POST /api/marketing/releases`, `GET /api/operations`, `POST /api/budget/reconcile`.
Consulta `local.mjs` para el contrato exacto de cada cuerpo; no son endpoints Bearer de n8n.

El workflow productor decide entre `/api/v1/ideas` (idea o `auto:true`) y `/api/v1/jobs`.
Para ideas fuerza `produce:true`, preserva la clave de idempotencia y no reintenta a ciegas
una llamada de pago. El borrador diario usa una clave por fecha y marca. Un timeout se investiga
consultando el trabajo existente antes de repetir solicitudes.
