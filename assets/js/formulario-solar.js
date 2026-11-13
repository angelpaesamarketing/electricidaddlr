/* Electricidad y Antenas DLR — formulario de la landing solar.
   Los presupuestos entran por WhatsApp: al enviar, se abre la conversación
   con los datos del formulario ya escritos, se deja un evento en dataLayer
   para medirlo como conversión desde Tag Manager y la pestaña pasa a la
   página de gracias, que recuerda que hay que darle a enviar.

   OJO: este archivo se pega EN LINEA en GoHighLevel, así que no puede
   contener en ningún sitio la cadena de cierre de script. */
(function () {
  'use strict';
  var form = document.getElementById('formulario-solar');
  if (!form) return;
  var TELEFONO = '34652967349';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.checkValidity && !form.checkValidity()) {
      if (form.reportValidity) form.reportValidity();
      return;
    }
    function v(n) { var c = form.elements[n]; return c ? String(c.value || '').trim() : ''; }
    var texto =
      'Hola, soy ' + v('nombre') + '. Quiero saber si me compensa poner placas solares.\n' +
      '· Vivienda: ' + v('vivienda') + '\n' +
      '· Factura de luz: ' + v('factura') + ' al mes\n' +
      '· Población: ' + v('poblacion') + '\n' +
      '· Teléfono: ' + v('telefono');
    var url = 'https://wa.me/' + TELEFONO + '?text=' + encodeURIComponent(texto);

    /* el mensaje se guarda para que la página de gracias pueda reabrir WhatsApp */
    try { sessionStorage.setItem('dlr_wa_texto', texto); } catch (err) {}

    /* WhatsApp se abre ya, dentro del clic, para que el navegador no lo bloquee */
    var ventana = window.open(url, '_blank');
    if (ventana) { try { ventana.opener = null; } catch (err) {} }

    /* y esta pestaña pasa a la página de gracias, pero solo después de que
       Tag Manager haya enviado la conversión: si se navega antes, la
       petición se corta y la conversión se pierde */
    var GRACIAS = /\.html$/.test(location.pathname) ? '/gracias-placas-solares.html' : '/gracias-placas-solares';
    var hecho = false;
    function aGracias() {
      if (hecho) return;
      hecho = true;
      location.href = GRACIAS + (ventana ? '' : '?wa=0');
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'dlr_solicitud_estudio', vivienda: v('vivienda'), factura: v('factura'),
                            eventCallback: aGracias, eventTimeout: 1500 });
    setTimeout(aGracias, 1800);
  });
})();
