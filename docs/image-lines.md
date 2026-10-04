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

## Ejecución real y revisión

Primer despliegue `72fbacc`, 2026-10-03; saludable. Modelo ejecutado: snapshot Sunburst 2.5, tres respuestas exitosas con request_id y uso; la respuesta no repite el nombre del modelo, por lo que se conserva el identificador enviado explícitamente a la API. En cada solicitud entraron los tres originales con sus hashes y tamaños, sin redimensionar referencias.

- A: `img_1017b4a6-e621-4982-b2e9-8b667f8357d2`, beneficio «Del pedido a cocina», fuente brand.facts[1], 35.084 s, US$0.08398 estimados.
- B: `img_fb689f3b-3bea-4f8b-a1a3-df0cd8e3e20b`, uso «Cada pedido, a tu manera», fuente brand.facts[0], 33.179 s, US$0.08399 estimados.
- C: `img_dc1db7cc-47ca-4a3e-8eaa-52e19518e53b`, problema/solución «¿De qué mesa es la cuenta?», fuente brand.facts[2], 51.838 s, US$0.084075 estimados.

Total estimado US$0.252045, reserva preventiva US$2.25 (no gasto real). Exactamente tres llamadas generativas. PNG 1024×1280. Referencias incorporadas con UUID y origen; logo auténtico `feed/brand/logo.png` incorporado como recurso de ComandPOS, sin cambiar perfiles de otras marcas. Las tres piezas permanecen por revisar, sin publicación.

QA visual encontró superposición del degradado del encabezado sobre las cabezas en B/C. Originales completos: corrección local con escala proporcional y espacio protegido, conservando imagen anterior en previous_outputs y marcando su recurso superseded_by. Sin nueva llamada generativa. Nueva composición predeterminada para futuras generaciones; la primera imagen A conserva su encuadre correcto. Recuperación idempotente adicional comprobada.

Navegador real contra producción: escritorio 1440 px y móvil 390 px; línea seleccionada, tres referencias visibles, sin overflow ni excepciones JS. También abrieron Crear, Recursos y el editor de feed anterior. Suite general 183 pruebas aprobadas; prueba adicional de recomposición comprueba historial, superseded_by y cero llamadas extra. Las pruebas no implican publicación ni gasto adicional.

Verificación final de producción: despliegue `d1cd60b`, rollback `gcode-studio:before-20261003T172155Z`. Recomposición B/C realizada desde la API; tres trabajos succeeded y tres salidas vigentes en biblioteca. Cada PNG responde HTTP 200 con image/png; acceso anónimo 401; mutación con origen ajeno 403. Repetir la solicitud A con su misma clave devolvió el mismo trabajo terminado: siguen exactamente tres generaciones. Revisión visual final de las tres: textos íntegros, logo auténtico, rostros sin obstrucción tras ajuste, fotografía y jerarquía coherentes. Mejora futura opcional: integrar capturas auténticas del producto para demostrar funcionalidad además del contexto humano.

Enlaces privados de producción:
- Línea: https://studio.gcoderd.com/images.html?line=nueva-direccion-visual
- A: https://studio.gcoderd.com/images.html?job=img_1017b4a6-e621-4982-b2e9-8b667f8357d2
- B: https://studio.gcoderd.com/images.html?job=img_fb689f3b-3bea-4f8b-a1a3-df0cd8e3e20b
- C: https://studio.gcoderd.com/images.html?job=img_dc1db7cc-47ca-4a3e-8eaa-52e19518e53b
- PNG A: /api/library/12eb078c-c760-4fbb-abe6-c1ee27bab685
- PNG B: /api/library/72743f16-98ac-44de-abb5-f7a0d0b7bf84
- PNG C: /api/library/373025df-fc72-473b-8d35-a77a22fb1bd1

Limitación: la configuración admite varias marcas y líneas y se probó su aislamiento; estas tres pruebas pagadas usan únicamente ComandPOS, con hechos existentes en su perfil. No se afirma validación visual de otras marcas ni conciliación de factura. La generación anterior se verificó mediante pruebas de regresión y apertura de su editor; no se pagó una generación adicional del proveedor anterior.

## Selección predeterminada solicitada por el usuario

2026-10-03: configuración persistente `image-lines/settings.json` con `default_line_id: nueva-direccion-visual`, establecida mediante endpoint privado de administrador. La UI utiliza esta selección al abrir `/images.html` sin parámetro de línea; una selección explícita continúa teniendo prioridad. No cambia líneas guardadas, imágenes existentes ni automatizaciones de n8n. Despliegue `67ec2b3`; siete pruebas de imágenes aprobadas. API de producción confirma la selección y conserva tres trabajos.

## 4 octubre 2026: cinco direcciones y rotación controlada

`visual-directions.mjs` define cinematográfica, papel editorial, tecnología/producto, mundo de marca 3D y editorial de impacto. La rotación está activada por configuración (`POST /api/image-lines/rotation`), no por una migración destructiva de las líneas. `style_references` relaciona cada dirección con un recurso real de la biblioteca, enviado como imagen al proveedor. El modelo sigue siendo el configurado en la línea.

`ImageLines.chooseStyle` mantiene una bolsa aleatoria por marca en `rotation.json`. Cada ciclo consume los cinco estilos antes de repetir y evita repetir el último al comenzar el siguiente. Las claves de solicitud conservan la elección después de reintentos/reinicio. Los trabajos guardan estilo, ciclo, referencia, prompt y proveedor; las imágenes previas conservan su composición. La UI muestra selección automática/manual y el historial. Se puede desactivar la rotación desde la configuración.

`preparePiece` produce un fondo por pieza (reutilizado entre páginas del carrusel) y las automatizaciones esperan su finalización con `WAITING_RESOURCE`. Errores inciertos no se compran de nuevo. No se ejecuta también el generador fotográfico anterior. Reserva conservadora existente: US$0.75 por fondo, sin alterar el límite diario. Antes las historias reutilizaban fotos: la diversidad ahora puede implicar una generación adicional por historia. No cambia el flujo de publicación ni autoriza nuevos destinos.

`visual-compose.mjs` aplica tipografía y logotipo auténtico fuera del modelo, geometrías/colores según dirección y márgenes de historias. Fotografía vs. 3D depende del fondo generado, no de un filtro cosmético. Los modelos generativos no garantizan una réplica exacta de los bocetos aprobados; revisar los primeros resultados. Video conserva su motor y estilos existentes: esta mejora corresponde a imágenes, carruseles e historias estáticas.

La campaña DGII mantiene tres páginas, fuentes, límites de vigencia y grupo aplicable. Diseño v3 elimina siglas de titulares y portada, explica el término en el caption y destaca el contador calculado por fecha. Hoy 2026-10-04: 42 días hasta 2026-11-15. Aviso oficial comprobado: https://dgii.gov.do/publicacionesOficiales/avisosInformativos/Documents/2026/06-26.pdf . No se editan entregas previas ni se afirma certificación de ComandPOS.

Validación local: 207 pruebas aprobadas; incluye 44 días de DGII, 15 combinaciones de estilo/formato, persistencia y separación de marcas, idempotencia, referencias binarias, recuperación y espera del recurso DGII. La prueba del proveedor usa doble controlado; la generación real y despliegue se registran por separado.
