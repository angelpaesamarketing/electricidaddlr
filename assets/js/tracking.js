/* Electricidad y Antenas DLR — medición de conversiones para Google Ads / GA4.
   NO necesita librerías. Depende de gtag() cargado en el <head> de cada página.

   ⚙️  CONFIGURA AQUÍ TUS IDENTIFICADORES (te los da Google Ads al crear cada
       conversión). Mientras estén con las X, el tracking no envía nada y la web
       sigue funcionando igual. */
window.DLR_ADS = {
  // ID de conversión de Google Ads, formato "AW-XXXXXXXXXX"
  ads_id: 'AW-XXXXXXXXXX',
  // Etiqueta de cada acción de conversión, formato "AW-XXXXXXXXXX/aBcDeFgHiJ"
  conv: {
    llamada:  'AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXXX',   // clic en teléfono
    whatsapp: 'AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXXX',   // clic en WhatsApp
    formulario:'AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXXX'   // envío de formulario
  }
};

(() => {
  const C = window.DLR_ADS;
  const listo = typeof window.gtag === 'function';
  const configurado = (et) => et && et.indexOf('X') === -1; // ¿ya pusiste el ID real?

  // Dispara una conversión de Google Ads + un evento GA4 (si están configurados).
  function conversion(tipo, ga4) {
    try {
      if (!listo) return;
      const et = C.conv[tipo];
      if (configurado(et)) gtag('event', 'conversion', { send_to: et });
      gtag('event', ga4 || tipo, { tipo_contacto: tipo }); // evento GA4 siempre
    } catch (e) { /* nunca romper la web por el tracking */ }
  }

  // Teléfono: cualquier enlace tel:
  document.querySelectorAll('a[href^="tel:"]').forEach((a) =>
    a.addEventListener('click', () => conversion('llamada', 'clic_telefono')));

  // WhatsApp: cualquier enlace a wa.me
  document.querySelectorAll('a[href*="wa.me"]').forEach((a) =>
    a.addEventListener('click', () => conversion('whatsapp', 'clic_whatsapp')));

  // Formulario: al enviar (en captura, antes de que app.js abra WhatsApp)
  const form = document.getElementById('formulario');
  if (form) form.addEventListener('submit', () =>
    conversion('formulario', 'envio_formulario'), true);
})();
