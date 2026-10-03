# Líneas independientes de imágenes — 3 octubre 2026

## Implementación

`image-lines.mjs` añade configuración versionada y trabajos persistentes en `.studio-state/image-lines`. Reutiliza Marketing.upload, biblioteca privada, marcas, autenticación, presupuesto y Sharp/fontconfig existentes. UI `/images.html`; entrada adicional desde Crear y herramientas. Ninguna línea predeterminada; no modifica generación anterior ni automatizaciones.

OpenAI Images API `/v1/images/edits`, multipart con archivos originales en `image[]`. Modelo fijado `gpt-image-2.5-sunburst-2026-09-08`, listado por la credencial de producción. La disponibilidad de ejecución se comprobará con las tres solicitudes reales. Alternativa configurable Flare 2.5; no se sustituye silenciosamente. PNG/JPEG/WebP; tamaños controlados, incluido 1024×1280 vertical 4:5, calidad medium/high. Composición local de texto y logotipo auténtico sobre el fondo generado; sin deformación.

Documentación oficial consultada:
- https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/docs/pricing

Estimación: texto entrada $5/M, imagen entrada $8/M, imagen salida $30/M tokens. No descuento de caché en Images API. Reserva preventiva $0.75 por solicitud dentro del presupuesto de producción existente; no es factura ni límite duro del cobro del proveedor. Se guarda uso reportado y estimación separada; conciliación manual existente para factura. No se cambian presupuestos publicitarios.

## Referencias

Origen: `content/ads/oct2026/lanzamiento-02oct/imagenes-renovadas.html` del workspace de marketing. Se examinaron visualmente restaurante-feed.png, comandas-feed.png y caja-feed.png: fondos luminosos, fotografía cálida con profundidad, titulares grandes azul marino, acentos naranjas, producto/acción protagonista y CTA despejado. Se conserva esa dirección adaptándola a cada marca; no sus mensajes/logos ni una interfaz ficticia.

El HTML registra «imagegen integrado» y `image-refresh-prompts.json` conserva prompts de algunas piezas. No se encontró identificador verificable del modelo original. No se deduce de la apariencia. Referencias y logo se incorporan a los recursos privados del Studio con procedencia y hash; no se versionan binarios privados en Git.

## Fiabilidad y alcance

Solicitud explícita de pago y clave de idempotencia. Configuración, marca, contenido, hashes, prompt y modelo fijados en cada trabajo. Cola serial persistente; sin reintentos de proveedor. Solicitud interrumpida queda incierta. Fallo de composición puede recuperarse usando original guardado sin repetir generación. Despliegue bloqueado con generaciones activas. Errores de proveedor sanitizados; credencial solo en entorno servidor. No crea publicaciones, anuncios ni campañas.

Pruebas automatizadas: multipart binario, configuración separada, snapshot inmutable, logotipo de marca ajena rechazado, almacenamiento real en biblioteca temporal, idempotencia, transporte incierto, recuperación sin pago adicional, estimación de costes. Suite general: 182 pruebas aprobadas antes del despliegue. Los fixtures no son entregables.

## Despliegue y reversión

Usar `deploy/update-code.sh` con archivo git archive. Respaldo de código e imagen Docker anterior automático; directorios privados conservados. Revertir imagen Docker registrada por el despliegue para retirar la UI sin borrar trabajos, referencias ni resultados. No hay migración destructiva. Validación y resultados de producción se registran después de ejecutarse.
