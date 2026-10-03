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

Pendiente en este registro: despliegue, revisión visual real, liberación y recibos definitivos. No se considera publicada una imagen por haber sido generada.
