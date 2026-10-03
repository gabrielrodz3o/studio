# Migración del calendario DGII — 3 octubre 2026

Verificado en producción: workflow n8n `Ju46elvP4d8YWKoa` «GCODE - Campaña DGII facturación electrónica 6AM» estaba inactivo desde la migración del 1 octubre. Últimos slots originales publicados: 28, 29 y 30 septiembre. No existe slot original de hoy. Studio tenía únicamente campaña `d6a5dd1b-362d-4e0a-8521-f8826ddad6a8` en draft, sin piezas DGII.

Fuentes revisadas:
- https://dgii.gov.do/publicacionesOficiales/avisosInformativos/Documents/2026/06-26.pdf
- https://dgii.gov.do/noticias/Paginas/DGII-informa-emision-exclusiva-de-facturas-electronicas-para-Grandes-Locales-y-Medianos-contribuyentes-desde-noviembre.aspx

El 15 noviembre corresponde a pequeños, micros y no clasificados. La medida del 1 noviembre de grandes locales y medianos es distinta. No se copia el plazo indiscriminadamente ni las promesas originales de demo gratis, implementación en 3–10 días o compatibilidad e-CF no confirmada.

Implementación: `dgii-content.mjs` contiene 44 temas operativos distintos del 3 octubre al 15 noviembre con fecha límite y público delimitado. `dgii-render.mjs` compone tres páginas de carrusel, fotografía contextual ya existente, logo auténtico y tipografía propia. `dgii-automation.mjs` guarda configuración, trabajos y recibos en el almacenamiento privado Studio; utiliza JobStore, Versions, Marketing y sus aprobaciones/publicador existentes. No ejecuta ni reactiva el publicador antiguo. No usa credenciales fuera del mecanismo actual.

n8n sigue llamando al calendario Studio cada cinco minutos y al publicador existente. Producción 05:30, publicación 06:00, zona America/Santo_Domingo. Destinos: Instagram, Facebook, TikTok. Carrusel de tres imágenes en las tres redes. No se añade otra historia: continúan intactas las historias existentes de 13:00 y 18:00. Al terminar el catálogo el 15 noviembre se detiene la generación DGII; no se reutiliza una cuenta regresiva vencida.

Primera salida tardía solo por solicitud expresa de hoy; generación retenida para revisión visual y liberación explícita posterior. Normalmente no se recupera automáticamente una publicación vencida. Dedupe por día/clave y por campaña+concepto+red. Una entrega fallida o incierta se conserva y no se recrea. Un cambio de caption, cuenta, trabajo o fecha detiene aprobación automática. Rechazos y comentarios abiertos bloquean publicación.

La imagen de contexto procede del original ya pagado `img_1017b4a6-e621-4982-b2e9-8b667f8357d2`; no compra imágenes o voces. Composición local sin coste de proveedor adicional. Se configuró el logotipo auténtico ya guardado de ComandPOS, preservando los demás campos de la marca.

Validación: calendario 44 fechas/títulos distintos, caducidad, corrección de cuenta regresiva, concurrencia, una producción al día, tres destinos, horario, envío tardío explícito, retención de QA, reconciliación, bloqueo ante modificación y ausencia de reenvíos inciertos. Regresión de calendario original incluida. Evidencias de despliegue y enlaces de hoy se agregan tras confirmación real.
