# Recuperación de publicaciones sustituidas — 2026-10-01

Causa: cycle() omitía el feed si un slot de video incluía Instagram, independientemente del rechazo del trabajo o la cancelación de su entrega. No quedaba registro del post omitido.

Corrección:
- Registrar siempre el slot de feed y resolver el sustituto con evidencia de trabajos y entregas.
- Rechazo, fallo definitivo o cancelación permiten generar la pieza prevista antes de su fecha, usando la misma clave idempotente y las reglas de calidad/aprobación existentes.
- Publicación confirmada, envío en curso o incierto, programación existente o entrega bloqueada impiden generar duplicados. Las situaciones no resueltas aparecen explícitamente en el calendario.
- Después del horario: registrar fecha vencida y aviso. No comprar ni publicar tarde automáticamente.
- Cuando se ha preparado el feed original, no autorizar automáticamente un Reel que vuelva a recuperarse como sustituto de Instagram.
- Resumen attention del día en API/UI y calendar_ok en salida del comprobador n8n. El éxito de ejecución de n8n no implica cobertura editorial; calendar_ok distingue ambos resultados.

Pruebas: recuperación única, autorización automática, no reactivación de rechazados, bloqueo del sustituto recuperado, horario vencido sin gasto, entregas publicadas/en curso/inciertas/programadas/bloqueadas y sustituto pendiente que falla después. No se alteran los horarios ni se borran publicaciones.

La recuperación automática conserva los destinos originales del feed (Instagram, Facebook y TikTok). Los videos manuales ya publicados son piezas diferentes y no se reasignan al calendario silenciosamente.

Verificación final: 124/124 pruebas locales; 22/22 pruebas de calendario contra el código del contenedor desplegado. Reconciliación real con generate=false: 2026-10-01:feed aparece missed, historias publicadas conservadas, sin nuevo trabajo ni entrega. Comprobador n8n devuelve calendar_ok=false y ambas incidencias del día. Imagen de recuperación: gcode-studio:before-20261002T004857Z. Publicaciones tardías no realizadas.
