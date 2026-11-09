# Medición de conversiones — cómo activarla

La web ya trae el código de seguimiento montado. Solo falta **pegar tus IDs**
de Google Ads (y, opcional, de GA4) en un sitio. Mientras estén con las `X`,
la web funciona igual pero no envía datos.

## 1. Qué ya está hecho en el código
- El **Google tag** (`gtag.js`) está en el `<head>` de todas las páginas.
- `assets/js/tracking.js` dispara una conversión cuando alguien:
  - pulsa un botón de **teléfono** (`tel:`),
  - pulsa un botón de **WhatsApp** (`wa.me`),
  - envía el **formulario**.

## 2. Qué tienes que hacer en Google Ads
En Google Ads: **Objetivos → Conversiones → + Nueva acción de conversión →
Sitio web**. Crea estas 3 (o las que quieras medir):

| Nombre de la conversión | Categoría |
|---|---|
| WhatsApp | Contacto / Enviar mensaje |
| Clic en teléfono (web) | Contacto / Llamada telefónica |
| Formulario enviado | Enviar formulario de contacto |

Para cada una, Google te dará:
- un **ID de conversión** → `AW-XXXXXXXXXX` (es el mismo para todas), y
- una **etiqueta de conversión** → algo como `aBcD1efG2hIjKlM` (distinta en cada una).

> La conversión **"Clientes potenciales por teléfono"** que Google creó sola
> (llamadas desde el anuncio) funciona aparte y no necesita nada de esto.

## 3. Dónde pegarlo
Abre `assets/js/tracking.js` y rellena:

```js
window.DLR_ADS = {
  ads_id: 'AW-1234567890',
  conv: {
    llamada:   'AW-1234567890/aBcD1efG2hIjKlM',
    whatsapp:  'AW-1234567890/zZyY9xwV8uTsRqP',
    formulario:'AW-1234567890/mNbVcXzA1sdFgHj'
  }
};
```

Y en el `<head>` de cada página (o solo ajústalo una vez si usas plantilla),
cambia los dos `config`:

```html
gtag("config","G-XXXXXXXXXX");   /* ← tu ID de GA4, opcional */
gtag("config","AW-1234567890");  /* ← tu ID de Google Ads */
```

> El `G-XXXXXXXXXX` es de **Google Analytics 4**. Si aún no usas GA4, puedes
> borrar esa línea `config` de GA4; no afecta a Google Ads.

## 4. Comprobar que funciona
1. Sube la web con los IDs puestos.
2. En Google Ads, la conversión tarda unas horas en pasar de "Sin datos
   recientes" a "Registrando conversiones".
3. Prueba tú mismo: entra en la web desde el móvil, pulsa WhatsApp, y revisa
   en unas horas que cuenta (o usa la extensión *Google Tag Assistant*).

## 5. Aviso RGPD
Si activas GA4 o Ads, necesitas **banner de cookies + Consent Mode v2**. La
página `privacidad.html` ya menciona las cookies; falta el banner. Cuando
quieras lo añadimos (es un bloque pequeño de código).
