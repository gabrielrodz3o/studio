# Migración editorial de n8n a Studio — 1 de octubre de 2026

> Cambio posterior autorizado: el calendario puede publicar sin aprobación manual. Ver `publicacion-automatica-y-sesiones-20261001.md`.

## Alcance contrastado con el servidor

Se inspeccionaron los nodos de decisiones, cuotas, limpieza, dirección visual, horarios y conexiones del workflow `h40YN1b3Yq8G1wyK`, y los motores y catálogos de `rbn4mKfY8pGoHBsN` (13:00) y `X5RXeY2ZKvUvwyq5` (18:00). Las fuentes privadas se consultaron por SSH, sin copiar credenciales. No se usa el documento anterior como prueba de paridad.

| Comportamiento anterior | Implementación actual | Decisión |
|---|---|---|
| 72 temas en tres líneas 60/25/15 | `editorial/feed-catalog.json`, `chooseFeed` en `editorial-calendar.mjs` | Migrado; selección determinista según déficit del historial |
| Educativo/demostración/venta/humor 40/30/20/10 | `editorialWeights`, `chooseFeed` | Migrado; video educativo y saludo festivo son excepciones explícitas |
| Lunes Reel, viernes carrusel, resto imagen | `calendar` en `automation.mjs` | Restaurado; el calendario inicial de Studio tenía otra distribución |
| Seis publicaciones semanales Instagram | Calendario lunes a sábado | Conservado; sin post extra los domingos |
| Reel diario Facebook/TikTok 19:30 | Slot video diario, lunes producido a las 06:00 para reutilizar en IG 08:00 | Conservado, perfil de voz n8n y subtítulos |
| Historias 13:00 y 18:00 todos los días | Dos slots independientes; producción 09:00 y 14:00 | Migrado; Instagram y Facebook, sin inventar TikTok Stories |
| 24 temas con versiones mañana/tarde | `editorial/story-catalog.json`, `chooseStory` | 48 textos, evita repetir titular en 14 días y tema entre franjas |
| Seis diseños de historia | `editorial/story-renderer.cjs`, `editorial-render.mjs` | Adaptado del renderer propio anterior; tipografía Montserrat, capturas y logo congelados por trabajo |
| Fotos contextuales y capturas reales del feed | `prepareEditorialPhoto` + `PhotoJobs` + renderer v16 existente | Reutiliza foto revisada para el tema; si falta, genera una vez con presupuesto y espera revisión automática |
| Carrusel de cuatro páginas, humor con expectativa/realidad | `editorialScript` | Conservado, contenido determinista editable y CTA final |
| Hashtags y CTA por objetivo | `editorialScript` | Cinco hashtags en feed; CTA educativo/comercial/humor/festivo separado |
| Feriados RD desde Nager | `EditorialCalendar.holidays` | Caché siete días, fuente y advertencia si falla; convierte feed en saludo sin venta, mantiene video FB/TikTok |
| Historial de publicaciones confirmadas | Importación privada a `.studio-state/editorial/legacy-history.json` | 121 registros feed + 22 historias, deduplicados por recibo; no crean aprobaciones ni entregas |
| Historial de borradores de Studio | Editorial guardada en slots | Reserva temas ya producidos y evita competir con borradores del mismo día |
| Aprendizaje descriptivo, sin inferir ventas de ceros | Cuotas fijas + métricas existentes de Studio | No se añade optimizador de ventas sin evidencia |
| Publicación inmediata desde generador | Release humano de archivo/caption/cuenta/fecha | Sustituido por la política vigente: sin aprobación no se publica |
| Telegram de los workflows viejos | Estado, errores y revisión central en Studio | No se duplica ni reactiva mensajería externa |
| Viejo Stories P2 23:30 lunes/miércoles/viernes | Sustituido por las franjas solicitadas 13:00/18:00 | No se añade una tercera historia nocturna del flujo obsoleto |

## Flujo y recuperación

`n8n QDXjXalYBBP0Oaaf` consulta Studio cada cinco minutos. Studio guarda una decisión editorial antes de producir. Feed e historias reutilizan el catálogo y no pagan otro guion. El video conserva la generación creativa, voz, subtítulos y controles existentes, con el tema editorial elegido. La foto pendiente deja el slot en `waiting_resources`; la siguiente consulta usa la misma solicitud y no compra de nuevo. Un resultado ambiguo, rechazo o error necesita revisión; no se elimina el control para completar un horario.

El trabajo de imagen congela también `editorial-render.mjs` y `editorial/story-renderer.cjs` en `image-runtime.mjs`. Sus capturas se copian al snapshot; modificar archivos del servidor no cambia una pieza ya producida. El usuario puede corregir titular, texto y CTA y renderizar otra versión. Una aprobación anterior no autoriza el archivo nuevo.

Se conservan los destinos del video del 1 de octubre ya creado para no duplicar su Instagram. El calendario restaurado se aplica a slots nuevos; la transición no elimina entregas, historial ni borradores existentes.

## Pruebas y límites verificables

- 97 pruebas Node aprobadas antes de la última comprobación de integración.
- Las 48 variantes editoriales de historias se renderizaron con los tres diseños de su franja: 144 renders reales 1080×1920, incluyendo medidas de texto y límites de archivo.
- Los 72 temas validan imagen y carrusel de cuatro páginas; cuotas y calendario semanal, feriado lunes, diferencia entre historias, espera de foto con idempotencia y aprobación exacta cubiertos por pruebas.
- API de feriados consultada en vivo: 13 registros de 2026, sin enviar información privada. Esto verifica disponibilidad y formato; no convierte Nager en fuente legal ni genera consejos fiscales.
- Integración aislada Chrome/FFmpeg: API, UI, edición y render. Se incluye producción de las dos historias por el runtime congelado, sin proveedores de pago y pendientes de aprobación.
- No se realizó una publicación real de prueba. Conectividad de cuentas y pruebas locales no garantizan entrega futura ni aprobación de los proveedores.
- El video que ya estaba detenido por revisión de voz sigue requiriendo escuchar la frase y resolverla. Migrar el calendario no aprueba voces ni publicaciones.
- Presupuesto existente: reserva diaria global US$5; una fotografía nueva reserva US$0.50 y luego se reutiliza. Son techos/reservas, no precios facturados. Historias del catálogo no llaman a IA ni TTS.

## Operación

Revisar en Marketing → Operación y costes las dos franjas, el último tick, fallos y trabajos. Aprobar la pieza final y después su publicación concreta antes del horario. Si vence, cambiar la fecha y volver a aprobar; no se envía tarde silenciosamente. Los publicadores antiguos permanecen inactivos. n8n conserva la entrega y recopilación de resultados; Studio conserva generación, revisión y aprobación.

## Comprobación en producción

Desplegado en `gcoderd2`, servicio saludable. Primer respaldo de esta migración: `gcode-studio:before-20261001T151323Z`. 16 archivos desplegados cotejados por SHA256 dentro del contenedor sin diferencias.

El ciclo real de n8n creó la historia del 01-oct a las 13:00, tema «cobros», trabajo `job_7e451dea-bfa2-4779-b79f-74499431ae3e`: render **succeeded**, revisión **pending**, destinos Instagram y Facebook a las 17:00 UTC. Cero entregas aprobadas para esa historia. La historia de las 18:00 se prepara a las 14:00 RD; su recorrido de render y edición fue comprobado en aislamiento. No se adelantó su publicación.

Consulta de cuentas del publicador: Studio, Instagram `gcoderd`, Facebook y TikTok disponibles, `publishes:false`. Acceso sin token al calendario rechazado. El historial editorial privado contiene 143 registros. El Reel anterior sigue retenido por voz; se conserva la advertencia en el calendario.

Las últimas correcciones de texto comercial y recuperación de foto incierta están cubiertas por 97 pruebas; se incluyen en el paquete final de la misma migración.
