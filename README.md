# FYRCA — Digital Studio

Sitio web estático de una sola página para presentar los servicios de FYRCA y facilitar el contacto.

## Estructura

```text
fyrca_web/
├── index.html              # Contenido y estructura de la página
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos, componentes y diseño responsive
│   └── js/
│       └── main.js         # Menú móvil, año del pie y formulario
├── preview-server.js       # Servidor local para revisar el sitio en la red
└── README.md
```

## Abrir el sitio

No requiere instalación, dependencias ni compilación.

1. Abrí `index.html` directamente en un navegador, o
2. publicá la carpeta `fyrca_web` en un hosting para sitios estáticos.

Los archivos CSS y JavaScript se cargan mediante rutas relativas; conservá la estructura de carpetas al mover o publicar el sitio.

### Revisarlo desde un celular

1. Con Node.js instalado, abrí PowerShell en esta carpeta.
2. Ejecutá `node preview-server.js`.
3. Conectá el celular a la misma red Wi-Fi y abrí en el navegador la dirección que el servidor muestra como **Vista en otro dispositivo**.
4. Dejá PowerShell abierto mientras lo revisás. Para detener el servidor, presioná `Ctrl+C`.

## Editar el sitio

- Modificá textos y secciones en `index.html`.
- Cambiá colores, tipografías, espaciados y comportamiento responsive en `assets/css/styles.css`.
- Actualizá las interacciones y los datos de contacto en `assets/js/main.js`, dentro de `CONTACT`.

## Cómo funciona el contacto

El formulario valida nombre, formato del correo y mensaje. También pide repetir el correo y comprueba que ambos campos coincidan antes de permitir continuar. Después permite elegir un canal:

- **WhatsApp:** abre una conversación con el mensaje preparado para el número configurado. La persona debe revisarlo y tocar **Enviar**.
- **Correo:** abre la aplicación de correo configurada en el dispositivo con el destinatario, asunto y mensaje preparados para `fyrcatech@gmail.com`. La persona debe revisar y enviar el email.

El sitio no envía ni almacena consultas por sí mismo. Estos canales dependen de que el dispositivo tenga WhatsApp o una aplicación de correo disponible. Para recibir mensajes directamente desde la página sin abrir otra aplicación, hace falta conectar un servicio de formularios o un backend.

La validación de formato y la repetición ayudan a detectar errores, pero no confirman que la dirección exista ni que pertenezca a quien la ingresó. Para confirmar eso se necesita enviar un email de verificación mediante un servicio o backend.

## Antes de publicar

- Confirmá que el email y el número de WhatsApp en `assets/js/main.js` sean correctos.
- Revisá el sitio en celular y computadora, y probá ambos canales de contacto.
- Verificá la disponibilidad legal y de dominio del nombre FYRCA.
