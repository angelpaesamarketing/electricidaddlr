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

## Páginas
    index.html                        home
    recarga-vehiculo-electrico.html   landing Google Ads — puntos de recarga
    antenas.html                      landing Google Ads — antenas
    placas-solares.html               landing Google Ads — placas solares
    aviso-legal.html                  aviso legal (rellenar datos [ ])
    privacidad.html                   política de privacidad (rellenar datos [ ])
    docs/estrategia-google-ads.md     plan de campañas de Google Ads

Las landings reutilizan `estilo.css` y `app.js`; cada formulario lleva
`data-servicio` para etiquetar el mensaje de WhatsApp.

## Pendiente
- Rellenar en el aviso legal y la privacidad los campos entre corchetes `[ ]`
  (razón social, NIF, email de contacto, nº de inscripción como instalador).
- Fotos reales (equipo, furgoneta, trabajos, antes/después). Ahora solo hay renders de producto.
- Email de contacto y horarios.
- Destino del formulario: hoy abre WhatsApp con el mensaje montado.
- Medición de conversiones para Google Ads (llamada, clic WhatsApp, formulario)
  y banner de consentimiento (Consent Mode v2) — ver `docs/estrategia-google-ads.md`.
