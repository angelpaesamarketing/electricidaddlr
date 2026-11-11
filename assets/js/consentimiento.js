/* ===== Electricidad y Antenas DLR — banner de consentimiento + Consent Mode v2 =====
   IMPORTANTE: este archivo debe cargarse SIEMPRE ANTES de la etiqueta de Google
   (gtag.js o Google Tag Manager). Si se carga después, las etiquetas se disparan
   sin consentimiento y la implementación deja de ser válida.
   Uso: cargarlo con una etiqueta <script src="assets/js/consentimiento.js">
   en el <head>. OJO: este archivo tambien se pega EN LINEA dentro de una
   etiqueta <script> en GoHighLevel, asi que no puede contener en ningun
   sitio la cadena de cierre de script, ni siquiera en un comentario:
   el navegador cerraria el bloque ahi y romperia el banner.
   Reabrir el panel:  window.dlrConsent.abrir()  o cualquier enlace con [data-cookies]
*/
(function () {
  'use strict';

  var CLAVE = 'dlr_consent';
  var VERSION = 1;
  var CADUCA_DIAS = 365;
  var URL_POLITICA = '/privacidad.html#cookies';

  /* ---------- 1. Consent Mode: todo denegado antes de cualquier etiqueta ---------- */

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function senales(p) {
    return {
      ad_storage: p.publicidad ? 'granted' : 'denied',
      ad_user_data: p.publicidad ? 'granted' : 'denied',
      ad_personalization: p.publicidad ? 'granted' : 'denied',
      analytics_storage: p.analitica ? 'granted' : 'denied',
      personalization_storage: p.publicidad ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    };
  }

  function leer() {
    try {
      var bruto = localStorage.getItem(CLAVE);
      if (!bruto) return null;
      var d = JSON.parse(bruto);
      if (!d || d.v !== VERSION || !d.fecha) return null;
      var dias = (Date.now() - d.fecha) / 86400000;
      if (dias > CADUCA_DIAS) return null;
      return { analitica: !!d.analitica, publicidad: !!d.publicidad };
    } catch (e) { return null; }
  }

  function guardar(p) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        v: VERSION, fecha: Date.now(),
        analitica: !!p.analitica, publicidad: !!p.publicidad
      }));
    } catch (e) { /* navegación privada: la decisión vale solo para esta visita */ }
  }

  var guardado = leer();

  gtag('consent', 'default', senales({ analitica: false, publicidad: false }));
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  if (guardado) {
    gtag('consent', 'update', senales(guardado));
    if (guardado.publicidad) gtag('set', 'ads_data_redaction', false);
  }

  function aplicar(p, cerrar) {
    guardar(p);
    gtag('consent', 'update', senales(p));
    gtag('set', 'ads_data_redaction', !p.publicidad);
    gtag('event', 'consentimiento_cookies', {
      analitica: p.analitica ? 'si' : 'no',
      publicidad: p.publicidad ? 'si' : 'no'
    });
    if (cerrar) ocultar();
  }

  /* ---------- 2. Interfaz ---------- */

  var caja = null;

  var HTML =
    '<div class="ck-panel" role="dialog" aria-modal="false" aria-labelledby="ck-tit" aria-describedby="ck-txt">' +
      '<div class="ck-texto">' +
        '<h2 id="ck-tit">Cookies</h2>' +
        '<p id="ck-txt">Usamos cookies propias necesarias para que la web funcione y, si nos das permiso, ' +
        'cookies de Google para saber qué anuncios y qué páginas nos traen solicitudes de presupuesto. ' +
        'Puedes aceptarlas, rechazarlas o elegir por categorías. ' +
        '<a href="' + URL_POLITICA + '">Más información</a>.</p>' +
      '</div>' +
      '<div class="ck-opciones" hidden>' +
        '<label class="ck-fila ck-fija">' +
          '<input type="checkbox" checked disabled>' +
          '<span><b>Técnicas</b>Imprescindibles para cargar las páginas, el formulario y la seguridad del sitio. No se pueden desactivar.</span>' +
        '</label>' +
        '<label class="ck-fila">' +
          '<input type="checkbox" id="ck-analitica">' +
          '<span><b>Analítica</b>Google Analytics. Nos dice cuántas visitas hay y qué páginas se leen, de forma agregada.</span>' +
        '</label>' +
        '<label class="ck-fila">' +
          '<input type="checkbox" id="ck-publicidad">' +
          '<span><b>Publicidad</b>Google Ads. Permite saber qué anuncio ha generado una solicitud y no repetirte anuncios innecesarios.</span>' +
        '</label>' +
      '</div>' +
      '<div class="ck-botones">' +
        '<button type="button" class="btn btn-azul" data-ck="todas">Aceptar todas</button>' +
        '<button type="button" class="btn btn-linea" data-ck="ninguna">Rechazar todas</button>' +
        '<button type="button" class="ck-enlace" data-ck="configurar">Configurar</button>' +
        '<button type="button" class="btn btn-linea" data-ck="guardar" hidden>Guardar mi elección</button>' +
      '</div>' +
    '</div>';

  function construir() {
    if (caja) return caja;
    caja = document.createElement('div');
    caja.className = 'ck-capa';
    caja.innerHTML = HTML;
    document.body.appendChild(caja);

    caja.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var accion = b.getAttribute('data-ck');

      if (accion === 'todas') { marcar(true, true); aplicar({ analitica: true, publicidad: true }, true); }
      if (accion === 'ninguna') { marcar(false, false); aplicar({ analitica: false, publicidad: false }, true); }
      if (accion === 'configurar') {
        caja.querySelector('.ck-opciones').hidden = false;
        b.hidden = true;
        caja.querySelector('[data-ck="guardar"]').hidden = false;
        caja.querySelector('#ck-analitica').focus();
      }
      if (accion === 'guardar') {
        aplicar({
          analitica: caja.querySelector('#ck-analitica').checked,
          publicidad: caja.querySelector('#ck-publicidad').checked
        }, true);
      }
    });

    return caja;
  }

  function marcar(a, p) {
    if (!caja) return;
    caja.querySelector('#ck-analitica').checked = a;
    caja.querySelector('#ck-publicidad').checked = p;
  }

  function mostrar(abrirOpciones) {
    construir();
    var previo = leer();
    marcar(previo ? previo.analitica : false, previo ? previo.publicidad : false);
    var opc = caja.querySelector('.ck-opciones');
    var cfg = caja.querySelector('[data-ck="configurar"]');
    var grd = caja.querySelector('[data-ck="guardar"]');
    opc.hidden = !abrirOpciones;
    cfg.hidden = !!abrirOpciones;
    grd.hidden = !abrirOpciones;
    document.body.classList.add('ck-visible');
    caja.classList.add('ck-abierta');
  }

  function ocultar() {
    if (!caja) return;
    caja.classList.remove('ck-abierta');
    document.body.classList.remove('ck-visible');
  }

  function arrancar() {
    document.addEventListener('click', function (e) {
      var enlace = e.target.closest('[data-cookies]');
      if (!enlace) return;
      e.preventDefault();
      mostrar(true);
    });
    if (!guardado) mostrar(false);
  }

  window.dlrConsent = {
    abrir: function () { mostrar(true); },
    estado: leer
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
