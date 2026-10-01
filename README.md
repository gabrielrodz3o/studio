# GCODE Studio

Centro privado de contenido para GCODE y ComandPOS: editor de video con narración y
subtítulos, imágenes y carruseles, marcas, campañas, biblioteca y publicación aprobada
mediante n8n.

- Aplicación: https://studio.gcoderd.com (requiere acceso).
- Guía de uso y despliegue: [LEEME.md](LEEME.md).
- Integración de producción y entrega: [API](integraciones/API.md).

## Desarrollo

Requiere Node.js 22, FFmpeg/ffprobe, Chrome o Chromium, Python y Tesseract.
La alineación de voces nuevas utiliza Whisper. Las dependencias del contenedor están
especificadas en `Dockerfile`.

```sh
npm ci
node --test *.test.mjs
node local.mjs
```

Al iniciar se genera el acceso inicial dentro de `.studio-state/`. Los proveedores se
configuran mediante variables de entorno; el archivo de ejemplo no contiene credenciales.

## Código y contenido privado

Este repositorio versiona el código, pruebas, plantillas base y documentación.
**No incluye contraseñas, claves, estado de usuarios, campañas privadas, exportaciones,
modelos, grabaciones, fotografías ni capturas del negocio.**

Los recursos necesarios para producir las plantillas existentes se mantienen en la
instalación privada y sus respaldos: `assets/`, `feed/brand/` y `feed/photos/`.
Para una instalación nueva, restaura esos recursos aprobados desde tu respaldo antes de
renderizar o ejecutar las pruebas audiovisuales. No copies credenciales al repositorio ni sustituyas el estado del servidor
con una carpeta vacía al desplegar. Las plantillas con voces originales requieren sus
archivos de audio locales; las voces generadas se conservan fuera de Git.

GitHub guarda el código; los respaldos privados guardan el contenido y la operación.
