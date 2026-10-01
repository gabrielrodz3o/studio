# Calendario automático conectado a n8n

> Documento de la primera entrega. El horario y la paridad editorial vigentes están en [Migración editorial completa](migracion-editorial-completa-20261001.md), incluidas las historias diarias 13:00 y 18:00.

Implementación: 2026-10-01. Complementa la auditoría `automatizacion-estado-20261001.md`; no reactiva los publicadores anteriores.

## Recorrido

n8n consulta cada cinco minutos → Studio determina las piezas pendientes según fecha de Santo Domingo → genera cada guion y trabajo una sola vez → prepara piezas por destino → el usuario revisa el archivo y aprueba cada publicación concreta → Studio programa únicamente las aprobadas → el publicador n8n existente entrega y registra el recibo.

La fecha en una pieza es una **propuesta de publicación**, no una entrega programada. La programación real exige trabajo final aprobado, release vigente, campaña activa y fecha futura. Si se vence sin aprobación, requiere cambiar la fecha; no hay publicación tardía automática.

| Contenido | Producción | Destinos y horario RD |
|---|---|---|
| Video diario | 09:00 todos los días | Facebook y TikTok 19:30 |
| Instagram lunes y miércoles | Imagen a las 06:00 | Instagram, Facebook y TikTok 08:00 |
| Instagram martes | Carrusel a las 06:00 | Instagram, Facebook y TikTok 15:00 |
| Instagram jueves | Reutiliza video del día | Instagram 19:00; FB/TikTok conservan 19:30 |
| Instagram viernes | Carrusel a las 06:00 | Instagram, Facebook y TikTok 12:00 |
| Instagram sábado | Reutiliza video del día | Instagram 10:00; FB/TikTok conservan 19:30 |
| Historias lunes, miércoles y viernes | 09:00 | Instagram y Facebook 23:30; no TikTok Stories |

No produce domingos un post adicional de Instagram. No compra nuevas fotos: utiliza el sistema de composición y recursos existente. Mantiene el perfil de voz n8n y el presupuesto existente: US$5 de reserva diaria global y techo original por operación; las reservas no son precios facturados.

## Fiabilidad y revisión

- `automation.mjs`: estado durable de cada fecha/tipo, clave idempotente, serialización de ciclos, adopción de trabajos del calendario anterior, sin reenvío automático de resultados ambiguos.
- `Marketing.prepareAutomaticPieces`: un archivo reutilizado por destino; conserva caption/fechas editadas; impide reasociar entregas existentes. Reintento nuevo revoca aprobación anterior.
- `JobStore.retry(...,{cacheOnly:true})`: recuperación que solo usa voces guardadas; si falta audio se detiene, sin compra.
- UI Marketing → Operación y costes: calendario de siete días, pausa, estado de piezas, recuperación con caché y revisión de frases ASR. Para corregir una respuesta Creative fallida, guardar en su sección y reconsultar la misma solicitud.
- Pausar el calendario detiene nuevas generaciones y programaciones; no cancela entregas ya programadas ni trabajos en curso.
- Token separado con alcance `automation`, sin permiso de aprobar ni acceso directo a publicar. El productor y publicador anteriores no adquieren ese alcance.
- El actualizador comprueba también generaciones creativas activas antes de reiniciar.

## Pruebas

88 pruebas Node aprobadas antes del despliegue: incluye semana completa, concurrencia/reinicio, adopción del trabajo anterior, recuperación sin TTS, independencia de formatos ante un fallo, pausa/fechas vencidas, bloqueo sin release exacto y separación de permisos. La prueba de navegador y render se ejecuta aislada, sin proveedores de pago.

## Despliegue

Primera entrega desplegada y saludable; imagen de retorno `gcode-studio:before-20261001T144046Z`. Scripts: `deploy/automation-tick.cjs` y `deploy/install-automation-calendar.cjs`. La instalación conserva el ID `QDXjXalYBBP0Oaaf`, respalda el workflow anterior y mantiene el publicador `XnDxoyTcnbawgPgY`. Comprobación manual consulta sin generar.

## Verificación real sin publicar

- El calendario adoptó el reintento existente `job_fc7946d2-85fb-4854-ac0c-d83703c414c6`; actualizó la pieza de Instagram y creó Facebook/TikTok para el mismo video. Fechas propuestas 01-oct 19:00 y 19:30 RD. No son entregas aprobadas.
- Recuperación exclusiva de caché: `job_b3b5ae4c-a1fb-4938-b1c9-52a431d1f408`, `allow_paid_voice=false`, operación original conservada, cero reservas nuevas de voz. Terminó retenido por ASR y ahora conserva el WAV/texto/transcripción para escuchar en el sitio.
- Tres frases tienen WAV guardado; la cuarta todavía no. El usuario puede aceptar una discrepancia del transcriptor solo después de escuchar, o corregir una voz incorrecta. El botón «Autorizar voces faltantes con presupuesto restante» conserva la caché y el techo de gasto; no aprueba la pieza.
- La consulta `studio-publisher.cjs check` verificó Studio, cuenta Instagram gcoderd y canales Facebook/TikTok. Comprueba conectividad/cuentas, no una entrega real ni todas las restricciones de contenido.
- El workflow diario actualizado está activo, con consulta manual sin generación. Los publicadores antiguos siguen inactivos; el publicador aprobado existente sigue activo.
- Rotación continua: conceptos automáticos no se repiten durante 48 horas; después vuelven a competir con penalización por historial. Los conceptos reservados manualmente siguen excluidos. Las composiciones automáticas de imagen reutilizan fotos pertinentes de la biblioteca cuando existen; no llaman a otro generador de imágenes.

## Límites de cierre

No se certifica publicación efectiva sin aprobación humana y recibo real. El video de hoy sigue pendiente de revisión de una frase y de completar la cuarta voz: la mejora del calendario está implementada, pero ese contenido no se marca terminado ni publicado. No se enviaron notificaciones externas ni se activaron los flujos antiguos.

La aprobación de una pieza automática muestra «Aprobar y programar» y su fecha concreta. Se programa inmediatamente después de esa aprobación (no espera al siguiente tick), y la huella aprobada incluye la fecha. Cambiarla invalida la aprobación anterior. Si falla la programación, la respuesta/UI conserva la aprobación e informa el motivo; no afirma que se publicó.

Cierre del despliegue: imagen de retorno `gcode-studio:before-20261001T145007Z`. 18 archivos cotejados dentro del contenedor, sin diferencias. Servicio healthy y calendario privado responde 401 sin sesión. n8n: ejecución del calendario 390808 (01-oct 10:50 RD) y publicador 390810 (10:50 RD), ambas success; esto demuestra ejecución, no publicación de la pieza retenida. La consulta actual informa `needs_attention` para el video del día, con el mensaje de revisión de voz visible.
