# Auditoría del Reel de mesas y cuentas — 1 octubre 2026

## Decisión y alcance

La pieza `job_5fc6df01-79e8-402c-b812-f639032808f3`, `mesas-cuentas-20261001-listo`, queda **retenida por solicitud del propietario**. No alcanza el nivel creativo de la referencia preferida. La revisión técnica anterior no justificaba recomendar su publicación.

Inspección: guion real del trabajo en producción, cuatro fotogramas de sus escenas, comparación visual con fotogramas de la referencia n8n y Brega, código del generador/renderizador y metadatos ffprobe. Video: 33.267 s, 1080×1920, 30 fps, pista de audio presente. No se realizó escucha humana ni evaluación perceptual de la voz; se analiza el texto de narración, no se certifica su naturalidad. Los fotogramas permiten comparar composición, no demostrar por sí solos toda la sincronización temporal.

Evidencias: [video retenido](evidencias-auditoria-20261001/video-retenido.jpg), [referencia preferida](evidencias-auditoria-20261001/referencia-n8n.png). Referencia: https://n8n.gcoderd.com/media/gr_324a70ef6e7d6b80b940938c.mp4

## Diagnóstico comprobado

| Aspecto | Pieza actual | Diferencia con la referencia / causa |
|---|---|---|
| Gancho | «Una dificultad cotidiana» | Es un rótulo de plantilla, no una pregunta específica. La referencia abre con «¿Bruta o neta?». `styles.mjs:8,14` contiene esos encabezados predeterminados; el guion final los conserva. |
| Demostración | Tres esquemas iguales de Mesa 1–4 | No hay `resource_id` ni `media_url` en ninguna escena del guion. `media-scenes.js:7,38` dibuja según `editorial_topic`, idéntico entre escenas. No muestra el producto ni una acción. |
| Composición | Fondo crema, encabezado, gran separación, cuerpo pequeño, esquema y pie | La geometría reserva espacio independientemente de la extensión real del titular (`media-scenes.js:20-21,39`). La referencia tiene contraste oscuro, captura auténtica, foco visual y cierre con logo. El problema no es usar crema: falta dirección visual. |
| Ritmo narrativo | Problema y necesidad repiten la misma idea durante las primeras dos locuciones | «Manejar mesas ... genera confusión» y «es necesario organizar ...» no añaden una acción concreta. Cuatro escenas para 33 s; recortar el preámbulo y dedicar tiempo a evidencia. No se midió retención comercial. |
| Marca/cierre | Nombre escrito pequeño; teléfono pequeño y repetido | El guion lleva colores y nombre, pero no logo asociado. `media-scenes.js:25-27` cae en nombre tipográfico y `:43` repite CTA. La referencia presenta logo y WhatsApp como foco del cierre. |
| Subtítulos | Texto blanco contorneado sobre fondo claro | En los fotogramas compite con el cuerpo y el pie. Mantener resaltado por palabra; ajustar contraste y jerarquía. La precisión temporal requiere revisión reproducida a velocidad normal. |
| Control de calidad | Resultado técnico `passed` | `render.mjs:93-102,166-168` comprueba desbordes, lectura, velocidad de narración, silencios y negro; no verifica que haya demostración, variedad, gancho específico o estética. |

La IA modifica texto dentro de una estructura predeterminada (`creative.mjs:68-71`). Los recursos se asignan por posición y módulo de la lista disponible (`:71`), no por correspondencia entre acción y prueba visual. Esto explica por qué habilitar voz e IA no garantiza una buena pieza.

## Conservar y mejorar, sin reconstruir Studio

Conservar voz, alineación de subtítulos, caché, edición por escena y controles técnicos. Ya existe `n8n-style.js`: fondo/iluminación (`background`), capturas con cámara y foco (`device`), titular animado (`headline`), subtítulos activos (`captions`) y cierre (`sceneBody`). `styles.mjs:3` reconoce el estilo comercial; `creative.mjs:38` lo vincula a `storyboards/comercial-n8n.json`. Su existencia no demuestra que cualquier tema disponga de capturas adecuadas: revisar las de mesas antes de usarlas.

## Tareas concretas propuestas (no implementadas en esta auditoría)

1. **AUD-V01 — Elegir dirección comercial para esta pieza.** Usar el render existente y recurso real de mesas, con datos de demostración autorizados. Módulos: storyboard y selección de recursos. Aceptación: cada afirmación sobre interfaz tiene una captura/clip correspondiente; sin capturas adecuadas, bloquear la demostración en lugar de sustituirla silenciosamente por un esquema.
2. **AUD-V02 — Reescribir el guion visual.** Abrir con «¿Qué cuenta corresponde a cada mesa?»; mostrar vista de mesas y después detalle de cuenta, solo si las pantallas verifican esas acciones. Cerrar con una única invitación a demo. Objetivo inicial 20–25 s, sujeto a lectura natural. Aceptación: cada escena añade información nueva; cero títulos de plantilla; no inventar controles, beneficios ni resultados.
3. **AUD-V03 — Mejorar composición y cierre.** Logo real, producto protagonista, foco progresivo en el dato, WhatsApp legible, subtítulos con contraste consistente. Reutilizar `n8n-style.js` antes de cambiar el motor genérico. Aceptación: revisión en vista móvil, sin solapes/cortes y texto/contacto legibles a velocidad normal.
4. **AUD-V04 — Separar calidad técnica de calidad creativa.** Añadir preflight determinista para títulos genéricos, ausencia de recursos en demos y secuencias visuales repetidas; reportar ambos estados por separado. Módulos: `creative.mjs`, `render.mjs`, política en `automation.mjs`. Aceptación: este guion retenido produce advertencias creativas aunque pase geometría/audio; una demo con evidencia y progresión no se bloquea por compartir identidad de marca.
5. **AUD-V05 — Revisar audio y montaje en contexto.** Escuchar la exportación, comprobar pronunciación, sincronización por palabra, pausas y balance musical. No cambiar de proveedor basándose únicamente en estos fotogramas. Aceptación: audición y reproducción completa documentadas, sin frases truncadas ni resaltado adelantado; render regenerado solo para escenas modificadas cuando su caché lo permita.

Orden: V01 y V02 antes de comprar nuevas voces; V03 antes de render final; V04 antes de volver a usar el resultado técnico como criterio de publicación; V05 antes de presentar la nueva versión.

## Estado operativo verificado

A las 15:41:49 UTC / 11:41:49 RD se marcó el trabajo `rejected`, actor `owner-request-audit`, con nota de retención. Se cancelaron las entregas pendientes de Facebook `3c5bf940-99fe-4fcb-8c9a-a561fee4d6e2`, TikTok `cae87adf-418b-4cb8-b94a-743c753a0fd0` e Instagram `92bb9f56-5f7d-43ad-a1ca-59835c5e270e`; se revocaron sus releases aprobadas. Los dos intentos anteriores figuran fallidos, sin `post_id`; las nuevas entregas no tenían recibos del publicador. No se encontró confirmación de publicación.

La política automática rechaza trabajos con revisión `rejected` (`automation.mjs:42`). El publicador n8n se pausó temporalmente durante la retención y se reactivó después para conservar el calendario de otras piezas. No se reactivó esta pieza.

Respaldo remoto: `/app/.studio-state/maintenance/audit-hold-1790869309776` dentro del volumen persistente de Studio. No se generó ni publicó un reemplazo en esta auditoría.

Incidencia adicional previa: el publicador construía una URL `/media/` que devolvía HTML en lugar del MP4. Se corrigió a `/webhook/cdn?f=...`, con verificación de MIME y hash antes de enviar; cuatro pruebas del publicador pasaron. Esa corrección de transporte no mejora el aspecto del video ni equivale a publicación exitosa.
