# Mejoras editoriales — implementación del 1 octubre 2026

Alcance: CONT-01 a CONT-08 de `auditoria-contenido-editorial-20261001.md`. Se conserva la arquitectura, el calendario autorizado y los trabajos existentes. Las piezas pendientes del propietario no se vinculan al calendario ni se aprueban.

## Cambios

- CONT-01: nueva construcción de video comercial desde evidencia local inspeccionada de cocina, mesas, cuentas y reportes (`editorial-video.mjs`). Tres escenas: pregunta, detalle visible, cierre. Capturas con hash, recortes verificados, copia persistente y snapshot por trabajo. El calendario de video selecciona temas con evidencia disponible; las otras líneas siguen en feed/historias. No se reutiliza la captura de reportes para hablar de cocina. Mermas y receta eligen sus tarjetas específicas.
- CONT-02: revisados consejos repetidos del catálogo, conservando 72 IDs históricos. Ahora hay 72 arrays distintos de consejos frente a 39; esto no demuestra 72 conceptos semánticamente independientes. La selección cuenta la huella de la enseñanza aunque cambie el título y penaliza familias temáticas recientes.
- CONT-03: historias coordinadas con el tema guardado de video/feed cuando hay contenido relacionado disponible. Cada horario mantiene su copia y diseño; el límite de repetición de títulos prima sobre la coordinación. Si la variante relacionada ya se usó, se selecciona otra.
- CONT-04: contrato normalizado de autorización automática. Videos sin informe, con `status:review`, fallo heredado, advertencias o bloqueo editorial no se autorizan. Se muestran problemas editoriales en revisión. La revisión automática de contenido detecta títulos de plantilla, explicaciones idénticas y demos genéricas sin recursos; no constituye una evaluación estética humana.
- CONT-05: `product_demo` sustituye a la categoría engañosa `social_proof`. Los IDs previos se mantienen y el historial anterior se normaliza al seleccionar cuotas. No se fabricaron testimonios.
- CONT-06: evidencia visual explícita y restricciones del guion frente a lo que muestra la pantalla. Detector limitado de afirmaciones normativas: exige correspondencia textual con evidencia oficial revisada de la marca; los metadatos editables del guion no conceden revisión. No es un verificador general de verdad ni una certificación fiscal. Los temas de funciones no inspeccionadas no se usan como demostraciones automáticas de video.
- CONT-07: historial incluye trabajos directos de API/editor, sus guiones, tema, recurso, huella, estado y fecha RD. No crea aprobaciones ni entregas. Las ideas y sus renders se deduplican por creative_id; rechazos conservan su estado.
- CONT-08: CTA por intención preservado también en el cierre comercial, antes fijo. Hashtags del feed más pertinentes; límites editoriales de hashtags por canal solo en piezas automáticas nuevas (`caption_policy:channel-v1`). No son límites oficiales de las plataformas. Se conserva el texto principal. No se modifica el texto final de entregas existentes.

## Verificación

- Suite completa: 113 pruebas aprobadas antes del ajuste final de encuadre de mesas; nueva ejecución de las pruebas de plantillas tras ese ajuste.
- Prueba del generador con proveedor simulado: editorial cocina → esquema comercial con su captura → narraciones distintas → reintento idempotente sin segunda llamada. No requiere pagos.
- Pruebas de autorización: `quality.status=review` con advertencia impide publicar y conserva pendiente; al resolverla permite el flujo. Rechazos, cancelaciones y cambios manuales siguen protegidos.
- Pruebas de historial de trabajo API y coordinación de historias por tema.
- Fotografías de prueba reales del renderer para cocina, mesas y cuentas; inspección visual de los detalles. Se corrigió el recorte de mesas para mostrar dos tarjetas completas. Son pruebas sin voz, no una validación auditiva de nuevos guiones ni un Reel publicado.
- Los subtítulos y proveedores de voz existentes se conservan. No se compraron locuciones para esta implementación.

## Límites operativos

La generación futura aún depende del proveedor de voz y de que las capturas sigan representando el producto. Si falla calidad, la pieza se retiene para corregirla; no se fuerza publicación para cumplir una cuota. Las pantallas administrativas adicionales y nuevas afirmaciones requieren evidencia inspeccionada antes de ampliar el registro de videos. No se midieron conversiones ni retención de audiencia.

Despliegue: se registra el resultado real después de comprobar el servicio; este documento por sí solo no acredita instalación en producción.

## Despliegue comprobado

- Código desplegado: `a08c439`, también enviado a `origin/main`.
- Actualización saludable en `gcoderd2` con imagen de reversión `gcode-studio:before-20261001T163146Z`.
- Suite completa final: **113/113**; prueba de aceptación posterior al ajuste de mesas: **26/26**.
- En el contenedor real se construyeron y validaron las cuatro plantillas; las cuatro copias persistentes coincidieron con el SHA-256 del recurso seleccionado.
- `https://studio.gcoderd.com/login`: HTTP 200. Acceso anónimo al video privado: HTTP 401.
- Calendario habilitado, `publication_mode=automatic`. Simulación con historial real para el 2–4 de octubre sin crear trabajos, releases ni entregas. Las historias se coordinan cuando hay una variante relacionada no usada; si se agotó en la ventana de repetición, conservan la alternativa del catálogo.
- Video nuevo de mermas `job_dba0d887-ca86-4fcc-a903-372e7f3cf514`: pendiente, cero entregas activas. Versión de reportes `job_84cbfdbe-1691-4d8b-9264-e718f51313ef`: pendiente, cero entregas activas. Video rechazado de mesas: continúa rechazado, cero entregas activas.
- No se envió contenido para probar estos cambios. La primera generación editorial pagada con el nuevo código no se ejecutó durante esta validación; el flujo de IA fue probado con proveedor simulado y las plantillas con el render real. Los guiones futuros seguirán pasando los controles y podrán requerir corrección si el proveedor devuelve contenido inadecuado.
