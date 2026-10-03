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

## Validación en producción

Despliegue inicial `c2b8795`; el primer render detectó que faltaban los módulos nuevos dentro de image-source. Se corrigió el manifiesto de runtime en `af8299d` y se añadió una prueba que realmente ejecuta el render congelado y comprueba las tres imágenes. Suite final: 188/188 pruebas aprobadas. Fallo original conservado en `job_429459e0-6af3-4eae-8ae3-5ff6a0b02a1e`; recuperación sin compras en `job_ecdfdf3f-338e-4520-90af-88c9d759330d`, succeeded, control creativo passed. Se revisaron visualmente las tres páginas reales antes de liberar.

Campaña original reutilizada y activada; configuración 05:30/06:00, tres redes, vigencia hasta 15 noviembre. n8n confirma activos el calendario `QDXjXalYBBP0Oaaf` y el publicador `XnDxoyTcnbawgPgY`; el publicador DGII antiguo continúa inactivo. No se compraron imágenes ni voces; no se cambió el límite diario ni publicidad pagada.

UI real: Operación y costes muestra «Campaña DGII · diaria» en 1440 y 390 px; el proyecto abre en feed-editor.html?project=dgii-2026-10-03 sin errores JS. Sus piezas y recibos están vinculados a la campaña dentro de Marketing. La sección detallada del calendario automático está en #operations, no en #calendar.

Hoy se crearon exactamente tres entregas:
- Instagram: 51ee553d-b582-4c16-a5a7-98f45ab5c878
- Facebook: 8cf3a822-c7a3-4806-bfa4-d51f451253c9
- TikTok: dc3a04ce-e3db-437b-b128-f42fa9e6b84d

Las entregas tienen aprobación vinculada al archivo, caption, cuenta y fecha; se liberaron por la solicitud explícita del propietario. No se republicaron los días 1 y 2 octubre ni se reactivaron historias DGII paralelas.

Confirmación final 2026-10-03 17:55 UTC: slot DGII `published`, exactamente tres recibos confirmados y conciliados dentro de Studio:
- Instagram: https://www.instagram.com/p/DeCozVHFmKb/ (17:52:31 UTC)
- Facebook: https://facebook.com/1901371183485176_1400797728932425 (17:51:44 UTC)
- TikTok: https://tiktok.com/@g.code.rd/video/7692500762429197588 (17:53:30 UTC; Buffer status sent, schedulingType automatic).

La espera de TikTok se resolvió consultando el mismo recibo; no se volvió a crear el post. Próxima producción DGII: 4 octubre 05:30 RD, publicación 06:00 RD. El video diario independiente conserva 04:00/07:00. Tres redes publicadas no implica ausencia de incidencias ajenas: la historia general de las 13:00 de hoy ya estaba missed_approval y no se intervino en este encargo DGII.

## Mejora de mensaje y composición — 3/oct/2026

La portada publicada destacaba la cuenta regresiva y un consejo operativo, pero omitía el tema fiscal. Se revisó visualmente el archivo publicado y se corrigió el generador para los próximos días:

1. Portada: «FACTURACIÓN ELECTRÓNICA», cuenta regresiva con fecha y alcance explícito para pequeños, micros y no clasificados; fotografía original y representación ilustrativa de un e-CF.
2. Preparación fiscal: situación/RNC/Oficina Virtual/NCF, certificado digital, solución de emisión y autorización con pruebas/certificación DGII. Se presentan como puntos clave, no como una lista exhaustiva.
3. Acción operativa diaria y demo de funciones verificadas de ComandPOS. No se atribuye al producto una certificación fiscal no comprobada.

Fuentes oficiales consultadas el 3/oct/2026:
- https://dgii.gov.do/publicacionesOficiales/avisosInformativos/Documents/2026/06-26.pdf
- https://dgii.gov.do/servicios/Documents/Facturacion/TRA-Facturacion-Emisor-Electronico.pdf
- https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Paginas/TipoyEstructurae-CF.aspx

El pie y el texto de publicación conservan las fuentes. Se mide el ancho real de texto para evitar desbordamientos. Prueba de render para los 44 días de campaña: títulos, plazos y puntos caben, con el tema explícito antes de la cuenta regresiva. Los recursos existentes se reutilizan sin solicitudes nuevas a proveedores.

La nueva composición no cambia las imágenes ya publicadas en redes. La corrección de hoy se guardará como una pieza distinta en Studio, sin borrar ni republicar automáticamente el carrusel anterior. El historial de publicación y su versión original se conservan.
