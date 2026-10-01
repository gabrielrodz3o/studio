# Automatización de producción y publicación — estado previo a la mejora

Implementación posterior: [calendario automático](calendario-automatico.md). Este documento conserva el diagnóstico anterior al cambio.

Corte: 2026-10-01, aproximadamente 10:28 America/Santo_Domingo. Inspección de solo lectura de workflows y ejecuciones mediante API n8n desde gcoderd1; estados de Studio desde gcoderd2. No se activaron flujos, compraron recursos ni publicaron piezas.

| Flujo | Estado vivo | Evidencia |
|---|---|---|
| Instagram original `h40YN1b3Yq8G1wyK` | Inactivo | API workflow, actualizado 01-oct 04:00 UTC; conserva compositor gcode-feed y subworkflow de Reels anterior |
| Reel diario TikTok/Facebook `zfV2MXux2ozQfflh` | Inactivo | Conserva daily-run.cjs del motor anterior; último ciclo 01-oct 03:55 UTC |
| Distribución antigua `SKiw4KmhMpJhm0XM` | Inactivo | API workflow; última ejecución 01-oct 04:25 UTC |
| Borrador diario `QDXjXalYBBP0Oaaf` | Activo, 09:00 Santo Domingo | Solicita auto=true, kind=video, style=auto, voice autorizada, vertical, campaña diaria; llama a sn74WWUHBFoW6pqS |
| Producción Studio `sn74WWUHBFoW6pqS` | Activo | Solicita pieza y consulta hasta terminal; ejecución 390545 creó job_4611c0b3-398c-45d2-9cbd-88570ed71283 |
| Publicación aprobada `XnDxoyTcnbawgPgY` | Activo, cada cinco minutos | Ejecución 390761 success a las 10:25; llama a studio-publisher.cjs tick |

## Dónde se interrumpe el recorrido

1. El ciclo diario 390544 sí consumió Studio el 01-oct a las 09:00. Creó el guion y trabajo de video. Falló a las 09:09 esperando una tarea de voz.
2. Reintento posterior job_fc7946d2-85fb-4854-ac0c-d83703c414c6 recibió la voz, pero terminó failed a las 09:20 por verificación del nombre de marca en ASR. No es prueba de pronunciación incorrecta. Falta escuchar y resolver la frase; la actualización de código posterior no reanudó automáticamente ese trabajo antiguo.
3. La pieza de campaña todavía apunta al intento original. El nuevo comportamiento de retry conserva asociaciones para próximos reintentos, pero no migró retrospectivamente esta relación.
4. El generador diario pide exclusivamente video. No configura producción recurrente de imagen/carrusel/historia ni crea automáticamente versiones de publicación Facebook/TikTok: la pieza creada está en canal instagram y sin scheduled_at.
5. La campaña diaria está draft. No hay releases aprobados ni entregas scheduled/claimed pendientes. Hay 174 registros published y 28 legacy_unverified de historial; no se interpretan como publicaciones nuevas de esta ejecución.
6. El tick devuelve también IDs ya publicados al recorrer su estado local. Success/exitCode=0 prueba que se ejecutó, no que haya publicado contenido nuevo.

## Responsabilidades y trabajo siguiente

Studio conserva generación, edición, revisión, versión aprobada y programación. n8n debe pedir las piezas y despachar exclusivamente entregas aprobadas. El conector actual recorre Instagram, Facebook y TikTok; no necesita otro publicador.

Para recuperar el objetivo anterior: resolver el video retenido con audio ya recibido; reconciliar el job de la pieza; definir e implementar calendario de imagen/carrusel/historia además del video; preparar destinos Facebook/TikTok y horario deseado (19:30 no está en el brief diario nuevo), manteniendo aprobación humana explícita y campaña activa antes de programar; comprobar una entrega real autorizada y su recibo. No reactivar en paralelo los antiguos flujos sin resolver duplicación y revisión.

Referencias propias: `local.mjs:createPiece` asigna instagram al crear pieza de campaña; `marketing.mjs:schedule/claim` exige campaña activa, fecha, exportación final y release aprobados; `deploy/studio-publisher.cjs:tick` procesa y reclama entregas por canal, sin generar contenido ni aprobarlo.
