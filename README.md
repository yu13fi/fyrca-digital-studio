# FYRCA — Digital Studio

Sitio estático de una página para presentar los servicios de FYRCA y facilitar el contacto.

## Archivos

```text
fyrca_web/
├── index.html              # Contenido y estructura
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos y diseño responsive
│   └── js/
│       └── main.js         # Menú, año del pie y formulario
├── preview-server.js       # Servidor local para ver el sitio en la red
└── README.md
```

## Abrir en una computadora

Abrí `index.html` directamente en el navegador. El sitio no requiere dependencias ni compilación.

## Ver desde un celular

La computadora y el celular deben estar conectados a la misma red Wi-Fi. Con Node.js instalado, abrí PowerShell en esta carpeta y ejecutá:

```powershell
node preview-server.js
```

Abrí en el celular la URL que aparezca junto a **Vista en otro dispositivo**. Dejá la ventana de PowerShell abierta mientras lo revisás; detené el servidor con `Ctrl+C`.

## Editar

- Contenido y secciones: `index.html`.
- Colores, estilos y adaptación a pantallas: `assets/css/styles.css`.
- Interacciones y datos de contacto: `assets/js/main.js`, en el objeto `CONTACT`.

Conservá las rutas relativas y la estructura de carpetas al mover o publicar el sitio.

## Formulario de contacto

El formulario solicita nombre, correo, confirmación del correo y mensaje. La persona puede elegir cómo continuar:

- **WhatsApp:** prepara el mensaje para el número configurado en `CONTACT`. La persona debe revisarlo y tocar **Enviar**.
- **Correo:** abre la aplicación de correo del dispositivo con un email preparado para `correo`. La persona debe revisarlo y enviarlo.

El sitio no envía ni almacena consultas. La persona debe revisar y enviar el mensaje desde WhatsApp o su aplicación de correo.

