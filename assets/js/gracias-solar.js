/* Electricidad y Antenas DLR — página de gracias de la landing solar.
   Los dos botones son botones y no enlaces: los activadores de clic de Tag
   Manager escuchan enlaces, así que no cuentan una segunda conversión de
   quien ya ha enviado el formulario.

   OJO: este archivo se pega EN LINEA en GoHighLevel, así que no puede
   contener en ningún sitio la cadena de cierre de script. */
(function () {
  'use strict';
  var url = 'https://wa.me/34652967349?text=' +
    encodeURIComponent('Hola, acabo de pedir el estudio de placas solares en la web.');
  var wa = document.getElementById('gsWhatsapp');
  if (wa) wa.addEventListener('click', function () {
    var v = window.open(url, '_blank');
    if (v) { try { v.opener = null; } catch (e) {} } else { location.href = url; }
  });
  var tel = document.getElementById('gsLlamar');
  if (tel) tel.addEventListener('click', function () { location.href = 'tel:+34652967349'; });
})();
