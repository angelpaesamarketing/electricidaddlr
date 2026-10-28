# Electricidad y Antenas DLR — web

Sitio estático (HTML + CSS + JS, sin dependencias ni build). Se publica subiendo la carpeta tal cual.

    index.html
    assets/css/estilo.css
    assets/js/app.js
    assets/img/*.webp     renders con alfa, en 480 y 960 px

## Prioridad de diseño
Contactar sin scroll: teléfono clicable en cabecera y héroe, WhatsApp, y barra fija
inferior en móvil con Llamar / WhatsApp.

## Animaciones
Sin librerías: parallax 3D del héroe con puntero y scroll, inclinación de tarjetas,
contadores, revelado al entrar en pantalla y trazos eléctricos SVG.
Todo se desactiva con `prefers-reduced-motion` y el parallax de puntero no corre en táctil.

## Pendiente
- Fotos reales (equipo, furgoneta, trabajos, antes/después). Ahora solo hay renders de producto.
- Email de contacto y horarios.
- Destino del formulario: hoy abre WhatsApp con el mensaje montado.
- Aviso legal y política de privacidad.
