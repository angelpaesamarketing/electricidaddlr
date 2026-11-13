/* Electricidad y Antenas DLR — página de gracias de la landing solar.
   El formulario guarda en sessionStorage el mensaje de WhatsApp que ha
   montado; aquí se reutiliza para que el botón reabra WhatsApp con los
   mismos datos. Si el navegador bloqueó la ventana de WhatsApp, la landing
   llega aquí con ?wa=0 y el mensaje lo dice.

   OJO: este archivo se pega EN LINEA en GoHighLevel, así que no puede
   contener en ningún sitio la cadena de cierre de script. */
(function () {
  'use strict';
  var TELEFONO = '34652967349';
  var texto = '';
  try { texto = sessionStorage.getItem('dlr_wa_texto') || ''; } catch (e) {}
  if (!texto) texto = 'Hola, quiero saber si me compensa poner placas solares.';
  var url = 'https://wa.me/' + TELEFONO + '?text=' + encodeURIComponent(texto);

  var bloqueado = /[?&]wa=0(&|$)/.test(location.search);
  var msg = document.getElementById('gsMensaje');
  if (bloqueado && msg) {
    msg.innerHTML = 'Tu navegador no ha dejado abrir WhatsApp. <b>Pulsa el botón verde</b> y se abrirá con tus datos ya escritos; solo tendrás que darle a enviar.';
  }

  var wa = document.getElementById('gsWhatsapp');
  if (wa) wa.addEventListener('click', function () {
    var v = window.open(url, '_blank');
    if (v) { try { v.opener = null; } catch (e) {} } else { location.href = url; }
  });
  var tel = document.getElementById('gsLlamar');
  if (tel) tel.addEventListener('click', function () { location.href = 'tel:+34652967349'; });
})();
