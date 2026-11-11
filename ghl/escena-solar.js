/* Escena 3D del héroe de la landing solar, para GoHighLevel.
   Versión autónoma de la que hace app.js en el sitio del repositorio.
   Se limita a #dlr-escena para no tocar nada más de la página.
   OJO: este archivo se pega EN LINEA dentro de una etiqueta script, así que
   no puede contener en ningún sitio la cadena de cierre de script. */
(function () {
  'use strict';
  var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto) return;

  function arranca() {
    var escena = document.getElementById('dlr-escena');
    if (!escena) return;
    var piezas = Array.prototype.slice.call(escena.querySelectorAll('.pieza'));
    if (!piezas.length) return;

    var tactil = matchMedia('(hover: none)').matches;
    var px = 0, py = 0, sy = 0, pendiente = false;

    function pinta() {
      pendiente = false;
      piezas.forEach(function (pieza) {
        var d = +pieza.getAttribute('data-prof') || 20;
        var x = px * d, y = py * d + sy * (d / 26);
        var rx = -py * 11, ry = px * 13;
        pieza.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotateX(' +
          rx + 'deg) rotateY(' + ry + 'deg)';
      });
    }
    function pide() {
      if (!pendiente) { pendiente = true; requestAnimationFrame(pinta); }
    }

    if (!tactil) {
      addEventListener('pointermove', function (e) {
        px = (e.clientX / innerWidth - 0.5) * 2;
        py = (e.clientY / innerHeight - 0.5) * 2;
        pide();
      }, { passive: true });
    }
    addEventListener('scroll', function () {
      var y = escena.getBoundingClientRect().top;
      sy = Math.max(-40, Math.min(40, -y * 0.055));
      pide();
    }, { passive: true });
    pinta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arranca);
  } else {
    arranca();
  }
})();
