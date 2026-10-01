# GCODE Studio

Centro privado de producción para GCODE y ComandPOS: videos, imágenes, carruseles e historias.
La instalación del servidor vive en `/root/gcode-studio` de `gcoderd2`.

## Abrir y trabajar

- **Servidor:** entra en https://studio.gcoderd.com o abre `Abrir-Studio-Servidor.command`.
  El acceso usa HTTPS y login; ya no necesita túnel SSH desde tu Mac.
  Usuario y contraseña inicial: `.studio-state/acceso-servidor.txt` en esta Mac (0600).
  Cambia tu contraseña desde **Cuenta**. No compartas ese archivo.
- **Local:** `Abrir-Studio.command`, o `node local.mjs`; puerto 4173.
  Su contraseña inicial está en `.studio-state/initial-access.txt`.
- **Crear desde una idea:** describe el objetivo, elige formato y habilita generación.
  Obtienes un borrador editable. No se publica por generar o aprobar una pieza.
- En el editor puedes ordenar escenas en la línea de tiempo, deshacer/rehacer,
  cambiar textos/duraciones, recortar y ajustar la voz, guardar versiones y recuperarlas.
  La previsualización reproduce voces ya guardadas y música. Para frases nuevas,
  exporta una previsualización con generación de voz habilitada.
- El centro muestra cola, progreso, archivos, cancelación, reintento y aprobación.
  Solo administradores pueden aprobar. Hay roles administrador, editor y lector.

## Estilos y sonido

Referencia elegida por Gabriel:
https://n8n.gcoderd.com/media/gr_324a70ef6e7d6b80b940938c.mp4.
Se conservan Montserrat Black, fondo azul oscuro, naranja, logo blanco,
pantallas reales y palabra activa resaltada mientras habla.

| Formato | Plantilla |
|---|---|
| Historia ilustrada, pedidos y cocina | `piloto-voz-selectiva` |
| Comercial de reportes, estilo del Reel elegido | `comercial-n8n` |
| Consejo rápido de reportes | `consejo-venta-neta` |
| Imagen / carrusel de cuatro páginas | `imagen-insumos` / `carrusel-insumos` |
| Historia social estática, 1080×1920 | `historia-insumos` |

El perfil de narración n8n usa Charon, Gemini 3.1 Flash TTS, Empathetic/Natural,
temperatura 0.4 e indicación de español dominicano natural. Los proyectos anteriores
conservan su perfil original para reutilizar voces pagadas. El casting no cambia por sí
solo la voz de exportación; el perfil está en `voz-perfil.json`.

Los audios originales se reutilizan mientras no cambie su texto. Voces nuevas pasan por
Whisper local y alineación al guion para conservar ortografía y tiempos. El render amplía
las escenas cuando hace falta para completar la frase. Música atenuada bajo la voz,
efectos sincronizados y normalización hacia −14 LUFS. Revisar pronunciación y sincronía
escuchando la exportación: una transcripción automática no garantiza perfección.

Salida de video: vertical 1080×1920, horizontal 1920×1080 y cuadrada 1080×1080, 30 fps,
H.264/AAC. Las previsualizaciones usan media resolución y 15 fps. Horizontal/cuadrado
recomponen la escena junto a un panel del producto; no es un recorte del vertical.

## Imágenes, IA y costos

El editor de imágenes adapta el motor v16 del workflow de Instagram
`h40YN1b3Yq8G1wyK`, con 72 temas, capturas reales y tres composiciones.
Las fotos deben corresponder al tema. Puedes incorporar una revisada o generar una nueva.
La generación usa Nano Banana Pro; resolución/OCR y revisión visual retienen defectos
antes de añadirla a la biblioteca. El OCR puede confundir texturas con letras; el revisor
visual recibe esos candidatos. La aprobación final de la pieza sigue siendo independiente.

La IA escribe sobre plantillas y hechos disponibles. No inventa automáticamente pantallas,
resultados de clientes ni nuevas funciones. Para otro módulo hacen falta escenas y capturas
aprobadas. Los datos de ejemplo mantienen su rótulo ilustrativo.

Reservas conservadoras por solicitud: US$0.10 guion, US$0.50 foto y revisión, US$0.25 por
nueva tarea de voz. Límite diario configurado: US$5; por video: US$2 de forma predeterminada.
Son reservas de control, no la factura del proveedor. Reutilizar audio o una petición con
la misma clave evita nuevas compras. Una respuesta incierta no se reenvía ciegamente.
Los timeouts terminales de voz permiten hasta dos reintentos, sujetos al presupuesto.
La revisión de una foto fallida puede reconsultar la misma tarea sin comprar otra foto.

## Servidor y n8n

Docker ejecuta el servicio como usuario sin privilegios, con 1 CPU, 1700 MB de RAM,
sin capacidades adicionales y sin abrir el puerto público. Chromium usa la separación
del contenedor y plantillas locales controladas. Persisten proyectos, voces, recursos,
versiones y trabajos. Los recursos de cada trabajo se copian para reproducibilidad.

API con Bearer, login con contraseña cifrada mediante scrypt, cookies HttpOnly,
control de origen y roles. El editor y los archivos requieren autenticación.
`studio.gcoderd.com` está configurado en el túnel de Cloudflare de gcoderd2.
La API de n8n usa HTTPS y Bearer; el editor utiliza su login con cookie segura.

Se creó un workflow separado: **GCODE Studio - Producir multimedia privada**,
`sn74WWUHBFoW6pqS`. No contiene nodos de publicación. Los workflows existentes se conservan.
Contrato y estado de conectividad: [integraciones/API.md](integraciones/API.md).

`deploy/backup.sh` hace una copia consistente de estado, proyectos, recursos, voces y
configuración privada, reteniendo siete archivos. Contiene secretos: respaldo 0600.
Las copias locales en el mismo servidor no sustituyen un respaldo externo.

## Desarrollo y límites

Requisitos locales: Node 22, `npm ci`, Chrome, ffmpeg/ffprobe, Python 3, Tesseract.
Whisper CLI y modelo small para voces nuevas; el contenedor ya los incluye/monta.

```sh
node --test *.test.mjs
python3 alinear_test.py
node render.mjs storyboards/comercial-n8n.json --voz --solo-cache
```

Es un editor de producción por escenas y plantillas, con API para automatizar campañas.
Todavía no ofrece edición libre de múltiples pistas de video, máscaras, keyframes
arbitrarios ni colaboración simultánea. Las métricas disponibles dependen de cada red;
no calcula retención a partir de vistas ni atribuye ventas automáticamente. Las capturas
mantienen la nitidez de su fuente; redibujar más pantallas y ampliar la biblioteca requiere
validar esas funciones del producto. No hay supervisión permanente del asistente.


## Marketing, recursos y edición ampliada

Abre **Marketing y recursos** en la barra lateral:

- **Marcas:** identidad, colores, logo de la biblioteca, audiencia, tono, hechos comprobados,
  restricciones y contacto. GCODE y ComandPOS tienen perfiles separados. Las plantillas
  del producto no se reutilizan como si pertenecieran a otra marca.
- **Campañas:** objetivo, oferta, fechas y estado. **Calendario:** piezas con brief, caption,
  red, fecha local y archivo asociado. Una campaña en borrador no publica.
- **Recursos:** fotos, clips y música de hasta 60 MB, con marca, etiquetas y permiso de uso.
  Archivos privados y copias independientes por producción. Clips: recorte de inicio y
  duración, encuadre completo/llenar y posición horizontal; audio original silenciado.
- **Revisión:** comentarios sobre un segundo del video, pendientes/resueltos y controles
  de calidad. La aprobación editorial sigue siendo explícita.
- **Resultados:** métricas reales recibidas desde Instagram y Buffer, cuando estén
  disponibles. Contactos, demos y ventas admiten entradas manuales o API; no hay todavía
  atribución automática al CRM. Las cifras ausentes se muestran como desconocidas.

En el editor, **Diseño, recursos y sonido** permite texto superpuesto arrastrable,
posición/tamaño/color, escenas de recursos propios, música, volumen bajo la voz,
portada desde el momento seleccionado y duplicación de proyectos para variantes.
Los tiempos de palabras pueden ajustarse sin cambiar la transcripción. La forma de onda
usa voz ya guardada. Las guías de zona segura son orientativas y no salen en la exportación.

Marcas también permite crear imágenes, carruseles de cuatro páginas e historias con
su propia identidad y fotos. Los diseños de ComandPOS conservan su editor especializado.

Cada video nuevo registra un informe en el manifest: geometría del texto en cuadros de
muestra, velocidad de lectura, silencios y cuadros negros. Son controles parciales:
no detectan todas las superposiciones, ni verifican cada afirmación comercial o pronunciación.
Una advertencia se muestra para revisión; no se convierte en aprobación automática.

## Publicación aprobada y resultados

Workflow independiente: **GCODE Studio - Publicación aprobada y resultados**,
`XnDxoyTcnbawgPgY`. Revisa cada cinco minutos y recoge métricas aproximadamente cada seis
horas por publicación. Reutiliza las cuentas existentes de Instagram `gcoderd`, Facebook
`G code` y TikTok `g.code.rd`. Los workflows anteriores no se reemplazaron.

Para enviar: campaña activa → exportación final aprobada → asociar archivo/caption/fecha
al calendario → **Programar entrega** (administrador). Solo entonces se copia el archivo
aprobado al CDN público de n8n. Studio y su biblioteca mantienen el acceso privado.
YouTube y cuentas de otras marcas requieren conexión; no se presentan como activas.
TikTok no admite historias en este adaptador: usar imagen, carrusel o video de feed.

La entrega tiene exclusión mutua, recibos y token de reclamación. Si el proveedor no
confirma un envío, queda incierto y no se vuelve a publicar automáticamente. Las entregas
que no comenzaron pueden cancelarse. Las programaciones vencidas por más de 24 horas
requieren reprogramación. El instalador es idempotente y no modifica otros workflows.

Rutas Bearer añadidas: GET `/api/v1/marketing`, POST `/api/v1/deliveries/claim`,
POST `/api/v1/deliveries/result`, POST `/api/v1/metrics`.
La API no puede aprobar piezas ni programarlas: esas acciones corresponden al administrador.
No hay autorización implícita para enviar mensajes a clientes ni crear campañas publicitarias.

Validación: 27 pruebas de backend, navegador en escritorio/móvil, renders locales de clip,
texto y diseño de marca. El publicador se prueba con dobles de proveedor para no crear
publicaciones de prueba en las cuentas reales; su comprobación de conexiones es de lectura.


## Fechas, plataformas e historial

Inicio, Calendario y Resultados permiten filtrar desde/hasta por creación, programación
 o publicación real, plataforma y estado. Los límites de fecha son inclusivos y usan
America/Santo_Domingo. Cada exportación conserva su fecha de creación y su historial
por plataforma, con enlace a la publicación cuando existe un recibo confirmado.

`published_at` es la fecha informada por la red; `confirmed_at` es cuando Studio recibió
la confirmación. Una programación o un envío aceptado no se muestran como publicación.
Si una fecha histórica no fue guardada, aparece «Sin registro» o «Fecha no informada»;
no se deduce de la fecha del archivo ni se reemplaza por la fecha actual. Los filtros de
publicación real excluyen las publicaciones cuya fecha se desconoce.

Código versionado en https://github.com/gabrielrodz3o/studio. El repositorio es público;
los recursos del negocio, credenciales y datos de operación permanecen en los respaldos
privados, fuera de Git. Consulta README.md antes de instalar desde una copia nueva.

## Crear sin una idea y estilos editoriales

En **Crear → Crear por mí**, elige la marca. Studio selecciona un hecho de su ficha,
evita los temas automáticos más recientes y rota seis estructuras editoriales.
Puedes elegir un estilo concreto en lugar de la selección automática.
Los nueve estilos son historia ilustrada, demostración comercial (n8n), consejo rápido,
paso a paso, pregunta y respuesta, lista útil, problema y solución, comparativa educativa
y presentación de marca. Conservan la voz Charon y los subtítulos sincronizados.

El resultado puede ser un borrador editable o una pieza producida para revisión.
El guion reserva US$0.10; producir un video requiere autorizar además hasta US$2
para voz. Estos importes son límites, no precios fijos. Una misma solicitud conserva
su guion y su trabajo al reintentarse. No publica automáticamente ni ejecuta un calendario
por su cuenta: n8n puede iniciar la misma operación mediante la API privada.
Las imágenes automáticas usan la identidad de la marca; los nuevos videos admiten
fotos y clips de la biblioteca además de la composición tipográfica animada.
