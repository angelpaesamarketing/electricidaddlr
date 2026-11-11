/* Electricidad y Antenas DLR — la placa se instala conforme bajas.
   Una sola imagen frontal del panel: como un panel es un plano, girarlo con
   transformaciones 3D del navegador es geométricamente correcto y no hace
   falta una secuencia de fotogramas.
   OJO: este archivo se pega EN LINEA en GoHighLevel, así que no puede
   contener en ningún sitio la cadena de cierre de script. */
(function () {
  'use strict';

  /* --- puntos de ajuste ------------------------------------------------- */
  /* dónde aterriza, en fracción del ancho y el alto de la foto de la casa */
  var DIANA_X = 0.515;
  var DIANA_Y = 0.325;
  /* ancho final de la placa respecto al ancho de la foto de la casa */
  var ANCHO_FINAL = 0.105;
  /* inclinación con la que se posa, para que case con el tejado de la foto */
  var POSADA = { rx: 57, ry: -18, rz: -9 };

  /* fases: p, desplazamiento en % del alto de pantalla, giros y escala */
  var FASES = [
    { p: 0.00, x: 10, y: -16, rx: -14, ry: -26, rz: 5, s: 1.00 },
    { p: 0.22, x: 12, y: -8, rx: -6, ry: 70, rz: 2, s: 0.96 },
    { p: 0.46, x: 6, y: 4, rx: 10, ry: 190, rz: -3, s: 0.80 },
    { p: 0.68, x: 0, y: 14, rx: 30, ry: 290, rz: -6, s: 0.58 },
    { p: 0.86, x: 0, y: 0, rx: POSADA.rx, ry: 342, rz: POSADA.rz, s: 0, aterriza: true },
    { p: 1.00, x: 0, y: 0, rx: POSADA.rx, ry: 342, rz: POSADA.rz, s: 0, aterriza: true }
  ];

  var escenario = document.getElementById('escenario');
  if (!escenario) return;
  var fijo = escenario.querySelector('.esc-fijo');
  var placa = document.getElementById('escPlaca');
  var casa = document.getElementById('escCasa');
  var casaFinal = casa && casa.querySelector('.casa-final');
  var pista = document.getElementById('escPista');
  var bloques = [].slice.call(escenario.querySelectorAll('.esc-bloque'));
  if (!placa || !casa || !bloques.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bloques.forEach(function (b) { b.classList.add('activo'); });
    return;
  }

  var pendiente = false, ultimo = -1;

  function entre(a, b, t) { return a + (b - a) * t; }
  function suave(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function pinta() {
    pendiente = false;
    var caja = escenario.getBoundingClientRect();
    var recorrido = escenario.offsetHeight - fijo.offsetHeight;
    var p = limita(-caja.top / (recorrido || 1), 0, 1);
    if (Math.abs(p - ultimo) < 0.0005) return;
    ultimo = p;

    /* fase actual */
    var i = 0;
    while (i < FASES.length - 2 && p > FASES[i + 1].p) i++;
    var a = FASES[i], b = FASES[i + 1];
    var t = suave(limita((p - a.p) / ((b.p - a.p) || 1), 0, 1));

    var rx = entre(a.rx, b.rx, t), ry = entre(a.ry, b.ry, t), rz = entre(a.rz, b.rz, t);

    /* la casa aparece y se queda quieta */
    var aparece = limita((p - 0.30) / 0.22, 0, 1);
    casa.style.opacity = aparece;
    casa.style.transform = 'translateY(' + ((1 - aparece) * 7).toFixed(2) + 'vh)';

    /* posición y tamaño: en vuelo por pantalla, al final sobre el tejado */
    var rc = casa.getBoundingClientRect();
    var rf = fijo.getBoundingClientRect();
    var anchoPlaca = placa.offsetWidth || 1;
    var destinoX = rc.left + rc.width * DIANA_X - (rf.left + rf.width / 2);
    var destinoY = rc.top + rc.height * DIANA_Y - (rf.top + rf.height / 2);
    var escalaFin = (rc.width * ANCHO_FINAL) / anchoPlaca;

    var x, y, s;
    if (b.aterriza) {
      var vueloX = rf.width * (a.x / 100), vueloY = rf.height * (a.y / 100);
      x = entre(vueloX, destinoX, t);
      y = entre(vueloY, destinoY, t);
      s = entre(a.s, escalaFin, t);
    } else {
      x = rf.width * (entre(a.x, b.x, t) / 100);
      y = rf.height * (entre(a.y, b.y, t) / 100);
      s = entre(a.s, b.s, t);
    }

    /* vaivén suave mientras flota en el primer tramo */
    if (p < 0.20) {
      var osc = Math.sin(Date.now() / 1400) * (1 - p / 0.20);
      y += osc * 7;
      rz += osc * 1.2;
    }

    placa.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) ' +
      'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) ' +
      'rotateZ(' + rz.toFixed(2) + 'deg) scale(' + s.toFixed(4) + ')';
    placa.style.opacity = limita((0.945 - p) / 0.055, 0, 1);

    /* el fundido a la casa ya instalada */
    if (casaFinal) casaFinal.style.opacity = limita((p - 0.845) / 0.075, 0, 1);

    /* rótulos */
    bloques.forEach(function (bl) {
      var d = +bl.dataset.ini, h = +bl.dataset.fin;
      bl.classList.toggle('activo', p >= d && p <= h);
    });

    if (pista) pista.style.opacity = p > 0.06 ? 0 : 1;
  }

  function pide() { if (!pendiente) { pendiente = true; requestAnimationFrame(pinta); } }

  addEventListener('scroll', pide, { passive: true });
  addEventListener('resize', function () { ultimo = -1; pide(); }, { passive: true });
  /* el vaivén del principio necesita repintar aunque no haya scroll */
  (function late() { if (ultimo < 0.20) { ultimo = -1; pinta(); } requestAnimationFrame(late); })();
  pinta();
})();
