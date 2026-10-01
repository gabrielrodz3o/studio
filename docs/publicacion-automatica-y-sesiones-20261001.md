# Publicación sin aprobación manual y continuidad de sesión

Cambio solicitado expresamente por el propietario el 1 de octubre de 2026. Sustituye la exigencia anterior de aprobación humana **para el calendario automático**: feed de marketing, Reel diario Facebook/TikTok e historias diarias 13:00/18:00. El contenido creado fuera del calendario mantiene su revisión normal.

## Política

`automation.mjs` conserva por defecto el modo manual. La configuración autorizada cambia a `publication_mode: automatic` con actor, fecha y versión. Un trabajo terminado, final y perteneciente a la campaña/marca/slot configurados recibe revisión y release de `automation-policy-v1`, que indican expresamente que no son revisión humana. El release conserva archivo, caption, cuenta y fecha exactos. n8n utiliza el publicador existente; no hay un segundo publicador.

No se publica un trabajo fallido, una vista previa, un rechazo explícito, una pieza con comentarios sin resolver, recursos vencidos, archivo sin huella válida o contenido editado fuera del plan. No se reenvían entregas canceladas, fallidas o inciertas automáticamente. Fechas vencidas requieren resolver el problema; no se cambian horarios silenciosamente. Las advertencias declarativas quedan registradas en el release; la política no convierte afirmaciones no verificadas en hechos verificados.

La UI permite volver a modo manual. Cambiar de modo o pausar no cancela entregas ya programadas: se cancelan en Calendario. Presupuestos y controles de producción continúan vigentes.

## Sesiones y proyectos

Causa comprobada de las desconexiones: `Access.sessions` solo existía en memoria; cada reinicio borraba todas las sesiones, y su duración fija era ocho horas.

- Sesiones persistidas atómicamente en `.studio-state/sessions.json`, permisos 0600, con hash del identificador; nunca se guarda la cookie en claro.
- 30 días de inactividad, renovación por actividad como máximo una vez por hora y límite absoluto de 90 días. Cookie HttpOnly/Secure en HTTPS y SameSite=Lax; las escrituras siguen verificando origen.
- Logout y cambio de contraseña revocan las sesiones también después de reiniciar. La identidad del usuario se contrasta con la versión de sus credenciales.
- Un acceso que exige login vuelve al proyecto solicitado usando una ruta relativa permitida.
- El editor de video conserva un borrador por usuario/proyecto en `sessionStorage`. Permite recuperar o descartar después de recargar en la misma pestaña; nunca sobrescribe la versión del servidor sin Guardar/Renderizar. Se retira el borrador después de guardar correctamente. No sustituye una copia del servidor ni sobrevive necesariamente al cierre de la pestaña.
- En este primer cambio puede ser necesario iniciar sesión una vez: las sesiones antiguas ya existentes solo estaban en memoria. Las nuevas sobreviven a despliegues.

## Verificación

101 pruebas Node: persistencia/reinicio, renovación, expiración, revocación, permisos, modo manual por defecto, autorización automática, idempotencia, rechazo, comentarios, cambios y cancelación. Integración Chrome/FFmpeg: APIs, edición/render de historias y recuperación del borrador de video tras navegar de nuevo al editor. No se hicieron publicaciones de prueba ni se compraron recursos para validar estos cambios.

El Reel que estaba detenido por comprobación de voz sigue siendo un error de producción; habilitar publicación automática no lo convierte en un archivo terminado. Se informa por separado en Operación y costes.

## Resultado en producción

Desplegado y saludable; respaldo `gcode-studio:before-20261001T152409Z`. Modo automático activado a las 15:24:45 UTC del 01-oct. La historia de las 13:00 recibió dos releases de `automation-policy-v1` y entregas programadas para Instagram/Facebook a las 17:00 UTC. El archivo ya tenía una revisión manual anterior; la aprobación de publicación y programación nuevas fueron automáticas. No se publicó fuera del horario. El ciclo programado de n8n del 15:25 verificó modo automático activo, sin error general.
