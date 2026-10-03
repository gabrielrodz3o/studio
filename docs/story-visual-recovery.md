# Historias: dirección visual y recuperación — 2026-10-03

## Incidente comprobado
La historia 13:00 del 3/oct se produjo y aprobó, pero sus dos entregas fallaron por timeout a las 17:02 y 17:04 UTC. Los recibos del publicador no contienen contenedor ni ID de publicación. El estado `missed_approval` era incorrecto: sí existía aprobación. La selección predeterminada de ImageLines no se consultaba desde la producción editorial de historias. La historia de las 18:00 también se había producido con la plantilla anterior.

## Implementación
- `ImageLines.prepareStory`: consulta la línea predeterminada; reutiliza un original de generación completada de la misma marca y versión de línea, seleccionado por contexto. Verifica SHA, conserva generación/proveedor/modelo/referencias y coste incremental cero. No envía nuevas solicitudes al proveedor, no mezcla marcas y falla explícitamente si faltan recursos.
- `story-visual.mjs`: fotografía sin deformar, logo auténtico, texto recompuesto y márgenes de interfaz para 1080×1920. Conserva consejo educativo a las 13:00 y contenido comercial a las 18:00. Se incluye en el runtime congelado de cada exportación.
- `Automation.refreshStory`: ruta de administrador con revisión estable y trabajo esperado; conserva trabajos y recibos previos. Bloquea envíos inciertos, publicados o en curso. Cancela únicamente programaciones no iniciadas; crea nueva versión en espera de revisión visual. La liberación verifica versión exacta y controles de aprobación, mantiene fechas futuras y reprograma solo las vencidas. Repetir solicitudes no duplica trabajos ni entregas.
- La conciliación informa `delivery_attention` cuando una entrega falló, sin confundirla con falta de aprobación.

## Verificación
Pruebas automatizadas de aislamiento de marca/versión, reutilización sin proveedor, hash del original, idempotencia, retención para revisión, bloqueo de recibos ambiguos y renderizado real de ambos horarios en runtime congelado.

## Resultado en producción
- Despliegue saludable `39f549b`; imagen de reversión `gcode-studio:before-20261003T181120Z`.
- 195 pruebas automatizadas aprobadas. Chrome real 1440 y 390 px: calendario y editor abren, sin excepciones JavaScript. Ambas imágenes se revisaron visualmente después del render en producción.
- Historia 13:00: nuevo trabajo `job_41093d76-8448-4403-bba3-10b8ce3f14b8`. Facebook confirmó a las **14:14:54 RD** e Instagram a las **14:15:11 RD**. Fue recuperación explícita de la publicación vencida, no un cambio de horario diario.
  - Instagram: https://www.instagram.com/stories/gcoderd/3999950571235092835
  - Facebook: https://facebook.com/stories/105477788464432/UzpfSVNDOjE1Njc0MTYxMzQ1NjYwNjk=/?view_single=1
- Historia 18:00: nuevo trabajo `job_d79c29eb-a427-4811-8f01-127e4e8d1803`. Ambas entregas programadas para **22:00 UTC / 18:00 RD**, no publicadas anticipadamente. Las programaciones del diseño anterior se cancelaron conservando los recibos.
- Nuevas entregas 13:00: Instagram `877f1ef4-78fc-47cb-8104-9e428a9df350`; Facebook `3b79797b-10e3-4102-b04c-25c6a4ac49a4`. Ambas `published` y con enlace confirmado por el proveedor.
- Nuevas entregas 18:00: Instagram `16e6cfe8-a45f-443c-ab8b-46b628bdbc09`; Facebook `675d9048-5ce1-4e4a-9c73-5fa34d1f62d4`. Ambas `scheduled` al terminar esta intervención.
- Las nuevas historias consultan la línea predeterminada para seleccionar originales de la misma marca y versión. Es reutilización de fotografía generada, no una llamada nueva a OpenAI por cada historia. Coste adicional de generación: **US$0**. El presupuesto reservado diario quedó en US$4.45 de US$5.
- Las historias desaparecen de las redes tras su vigencia normal; sus imágenes permanecen en Studio. No se modificó n8n, anuncios ni presupuestos publicitarios.

