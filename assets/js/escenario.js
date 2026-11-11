/* Electricidad y Antenas DLR — la placa se instala conforme bajas.

   Cómo funciona:
   - Una sola imagen frontal del panel. Un panel es un plano, así que su
     posición en cada fotograma se describe con las cuatro esquinas que ocupa
     en pantalla, y de ahí sale la matrix3d que lo deforma. No hace falta una
     secuencia de fotogramas.
   - En vuelo, las esquinas salen de proyectar el panel girado en 3D.
   - Al posarse, las esquinas se llevan hasta las cuatro esquinas exactas de
     una de las placas de la foto (medidas sobre la imagen), así que encaja al
     píxel en cualquier tamaño de pantalla y el fundido final no se nota.
   - El panel fijo se ancla con position:sticky. Si un contenedor lo rompe
     (GoHighLevel envuelve los bloques en capas con overflow oculto), se
     arregla el contenedor o, si no se puede, se ancla a mano.

   OJO: este archivo se pega EN LINEA en GoHighLevel, así que no puede
   contener en ningún sitio la cadena de cierre de script. */
(function () {
  'use strict';

  var escenario = document.getElementById('escenario');
  if (!escenario) return;
  var fijo = escenario.querySelector('.esc-fijo');
  var placa = document.getElementById('escPlaca');
  var casa = document.getElementById('escCasa');
  var capa = casa && casa.querySelector('.casa-capa');
  var pista = escenario.querySelector('.esc-pista');
  var bloques = [].slice.call(escenario.querySelectorAll('.esc-bloque'));
  if (!fijo || !placa || !casa || !bloques.length) return;

  /* Esquinas de la quinta placa del tejado en la foto, en fracción del ancho
     y el alto de la imagen. El orden es el de las esquinas del panel en
     vuelo: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda.
     El lado largo del panel queda sobre el lado largo de la placa de la foto. */
  var DIANA = [
    [0.50716, 0.34619],
    [0.54720, 0.27783],
    [0.60840, 0.28271],
    [0.57031, 0.35400]
  ];
  var PERSPECTIVA = 1500;

  var sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- entorno: ancho completo y contenedores que rompen sticky ---------- */

  var envoltura = escenario.closest ? escenario.closest('.dlr-solar') : null;

  function arreglaEntorno() {
    var anchoDoc = document.documentElement.clientWidth;
    var clip = window.CSS && CSS.supports && CSS.supports('overflow', 'clip');
    var nodo = (envoltura || escenario).parentElement;
    while (nodo && nodo !== document.body && nodo !== document.documentElement) {
      var cs = getComputedStyle(nodo);
      var corta = /(hidden|auto|scroll)/.test(cs.overflowX + ' ' + cs.overflowY);
      if (corta) {
        var desplaza = /(auto|scroll)/.test(cs.overflowY) && nodo.scrollHeight > nodo.clientHeight + 4;
        if (desplaza) break; /* es el contenedor que de verdad hace scroll: no se toca */
        var estrecho = nodo.clientWidth < anchoDoc - 2;
        nodo.style.setProperty('overflow', (estrecho || !clip) ? 'visible' : 'clip', 'important');
      }
      nodo = nodo.parentElement;
    }
    if (envoltura) {
      envoltura.style.width = '';
      envoltura.style.maxWidth = '';
      envoltura.style.marginLeft = '';
      var r = envoltura.getBoundingClientRect();
      if (r.left > 0.5 || r.width < anchoDoc - 1) {
        var margen = parseFloat(getComputedStyle(envoltura).marginLeft) || 0;
        envoltura.style.maxWidth = 'none';
        envoltura.style.width = anchoDoc + 'px';
        envoltura.style.marginLeft = (margen - r.left) + 'px';
      }
    }
  }

  /* huecos que tapan la cabecera fija y la barra inferior del móvil */
  function mideHuecos() {
    var arriba = 0, abajo = 0;
    var cab = document.getElementById('cabecera');
    if (cab) {
      var pc = getComputedStyle(cab).position;
      if (pc === 'sticky' || pc === 'fixed') arriba = cab.offsetHeight;
    }
    var barra = document.querySelector('.barra-movil');
    if (barra && getComputedStyle(barra).display !== 'none') abajo = barra.offsetHeight;
    escenario.style.setProperty('--esc-arriba', arriba + 'px');
    escenario.style.setProperty('--esc-abajo', abajo + 'px');
    return { arriba: arriba, abajo: abajo };
  }

  arreglaEntorno();
  var huecos = mideHuecos();

  if (sinMovimiento) {
    addEventListener('resize', function () { arreglaEntorno(); mideHuecos(); });
    return;
  }

  /* ---------- utilidades ---------- */

  function entre(a, b, t) { return a + (b - a) * t; }
  function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function suave(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function tramo(v, a, b) { return limita((v - a) / (b - a), 0, 1); }
  var RAD = Math.PI / 180;

  /* esquinas en pantalla de un panel w×h con una pose dada */
  function proyecta(pose, w, h, ox, oy) {
    var ry = pose.ry;
    /* de canto exacto el panel no tiene área y la matriz degenera */
    var c = Math.cos(ry * RAD);
    if (Math.abs(c) < 0.03) ry += 2;
    var sx = Math.sin(pose.rx * RAD), cx = Math.cos(pose.rx * RAD);
    var sy = Math.sin(ry * RAD), cy = Math.cos(ry * RAD);
    var sz = Math.sin(pose.rz * RAD), cz = Math.cos(pose.rz * RAD);
    var hw = w * pose.s / 2, hh = h * pose.s / 2;
    var base = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    var out = [];
    for (var i = 0; i < 4; i++) {
      var x = base[i][0], y = base[i][1];
      var x1 = x * cz - y * sz, y1 = x * sz + y * cz;      /* giro en Z */
      var x2 = x1 * cy, z2 = -x1 * sy;                     /* giro en Y */
      var y3 = y1 * cx - z2 * sx, z3 = y1 * sx + z2 * cx;  /* giro en X */
      var X = pose.x + x2, Y = pose.y + y3;
      var k = PERSPECTIVA / (PERSPECTIVA - z3);
      out.push([ox + (X - ox) * k, oy + (Y - oy) * k]);
    }
    return out;
  }

  /* matrix3d que lleva la caja w×h (origen 0,0) a las cuatro esquinas q */
  function matriz(w, h, q) {
    var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1];
    var x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, sx = x0 - x1 + x2 - x3;
    var dy1 = y1 - y2, dy2 = y3 - y2, sy = y0 - y1 + y2 - y3;
    var det = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(det) < 1e-7) return null;
    var g = (sx * dy2 - dx2 * sy) / det;
    var hh = (dx1 * sy - sx * dy1) / det;
    var a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3;
    var d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    return 'matrix3d(' +
      (a / w) + ',' + (d / w) + ',0,' + (g / w) + ',' +
      (b / h) + ',' + (e / h) + ',0,' + (hh / h) + ',' +
      '0,0,1,0,' +
      x0 + ',' + y0 + ',0,1)';
  }

  /* ---------- medidas que solo cambian al redimensionar ---------- */

  var M = null;

  function mide() {
    arreglaEntorno();
    huecos = mideHuecos();
    var sw = fijo.clientWidth, sh = fijo.clientHeight;
    var movil = sw <= 900;
    var arriba = huecos.arriba, util = sh - huecos.arriba - huecos.abajo;

    /* cada rótulo se encoge lo justo si no cabe en la pantalla */
    var hueroAbajo = arriba + util, textoAbajo = 0;
    bloques.forEach(function (b, i) {
      b.style.setProperty('--k', '1');
      var alto = b.offsetHeight || 1;
      var libre;
      if (!movil) libre = util - 24;
      else if (i === 0) libre = util - 16 - Math.max(150, util * 0.26); /* deja sitio a la placa */
      else libre = util * 0.47;                                          /* por encima de la casa */
      var k = limita(libre / alto, 0.6, 1);
      b.style.setProperty('--k', k.toFixed(4));
      if (i === 0) hueroAbajo = arriba + (movil ? 16 + alto * k : util);
      else if (movil) textoAbajo = Math.max(textoAbajo, arriba + 16 + alto * k);
    });

    var w = placa.offsetWidth || 1, h = placa.offsetHeight || 1;

    /* la diana, en coordenadas del panel fijo */
    var cx0 = casa.offsetLeft, cy0 = casa.offsetTop, cw = casa.offsetWidth, ch = casa.offsetHeight;
    var diana = DIANA.map(function (f) { return [cx0 + f[0] * cw, cy0 + f[1] * ch]; });
    var dcx = (diana[0][0] + diana[1][0] + diana[2][0] + diana[3][0]) / 4;
    var dcy = (diana[0][1] + diana[1][1] + diana[2][1] + diana[3][1]) / 4;
    var ladoLargo = Math.hypot(diana[1][0] - diana[0][0], diana[1][1] - diana[0][1]);
    var escalaFin = ladoLargo * 1.5 / w;

    /* las poses del vuelo */
    var P;
    if (!movil) {
      P = [
        { p: 0.00, x: sw * 0.725, y: arriba + util * 0.40, rx: -14, ry: -26, rz: 5, s: 1 },
        { p: 0.22, x: sw * 0.735, y: arriba + util * 0.42, rx: -6, ry: 70, rz: 2, s: 0.95 }
      ];
    } else {
      /* en pantallas muy bajas el aviso de bajar no cabe: se quita y la placa gana sitio */
      var sinPista = (arriba + util - 58) - (hueroAbajo + 12) < 150;
      if (pista) pista.style.display = sinPista ? 'none' : '';
      var techo = hueroAbajo + 12, suelo = arriba + util - (sinPista ? 16 : 58);
      var s0 = limita((suelo - techo) * 0.74 / h, 0.4, 1);
      var y0 = (techo + suelo) / 2;
      P = [
        { p: 0.00, x: sw * 0.50, y: y0, rx: -14, ry: -24, rz: 5, s: s0 },
        { p: 0.22, x: sw * 0.52, y: y0, rx: -6, ry: 70, rz: 2, s: s0 * 0.96 }
      ];
    }
    var alza = movil ? util * 0.17 : util * 0.20;
    var k3 = { p: 0.68, x: dcx - sw * 0.01, y: dcy - alza, rx: 34, ry: 292, rz: -16, s: Math.max(escalaFin * 1.9, 0.34) };
    if (movil && textoAbajo) {
      var minimo = textoAbajo + 8 + h * k3.s * 0.5;
      if (k3.y < minimo) k3.y = Math.min(minimo, dcy - 12);
    }
    var k1 = P[1];
    P.push({ p: 0.46, x: entre(k1.x, k3.x, 0.5), y: entre(k1.y, k3.y, 0.42), rx: 12, ry: 190, rz: -5,
             s: entre(k1.s, k3.s, 0.5) });
    P.push(k3);
    /* pose de aproximación: ya orientada como el tejado, encima de la diana */
    P.push({ p: 0.86, x: dcx, y: dcy, rx: 56, ry: 360, rz: -34, s: escalaFin });

    M = { sw: sw, sh: sh, w: w, h: h, movil: movil, diana: diana, P: P,
          ox: sw * 0.6, oy: arriba + util * 0.42 };
  }

  /* ---------- fotograma ---------- */

  var manual = false, ultimoP = -1, ultimaMatriz = '', visible = true, pendiente = false;

  function pinta() {
    pendiente = false;
    if (!M) mide();
    var caja = escenario.getBoundingClientRect();
    var recorrido = escenario.offsetHeight - fijo.offsetHeight;
    var avance = limita(-caja.top, 0, recorrido);
    var p = recorrido > 0 ? avance / recorrido : 0;

    /* ¿sigue funcionando el anclaje? Si el panel fijo se ha ido con el scroll
       es que algún contenedor rompe sticky: se ancla a mano desde ahora. */
    if (!manual && avance > 8 && avance < recorrido - 8) {
      var tf = fijo.getBoundingClientRect().top;
      if (tf < -6) { manual = true; escenario.classList.add('esc-manual'); }
    }
    if (manual) fijo.style.transform = 'translate3d(0,' + avance.toFixed(1) + 'px,0)';

    var flota = p < 0.2;
    if (!flota && Math.abs(p - ultimoP) < 0.0002) return;
    ultimoP = p;

    /* la casa entra desde abajo y se queda */
    var entra = suave(tramo(p, 0.26, 0.48));
    casa.style.opacity = entra.toFixed(3);
    casa.style.transform = 'translate3d(0,' + ((1 - entra) * 46).toFixed(1) + 'px,0)';

    /* pose del vuelo */
    var P = M.P, i = 0;
    while (i < P.length - 2 && p > P[i + 1].p) i++;
    var a = P[i], b = P[i + 1];
    var t = suave(tramo(p, a.p, b.p));
    var pose = { x: entre(a.x, b.x, t), y: entre(a.y, b.y, t), rx: entre(a.rx, b.rx, t),
                 ry: entre(a.ry, b.ry, t), rz: entre(a.rz, b.rz, t), s: entre(a.s, b.s, t) };
    if (flota) {
      var osc = Math.sin(Date.now() / 1300) * (1 - p / 0.2);
      pose.y += osc * (M.movil ? 4 : 8); pose.rz += osc * 1.3; pose.rx += osc * 1.6;
    }
    var q = proyecta(pose, M.w, M.h, M.ox, M.oy);

    /* al final las esquinas se llevan a las de la placa de la foto */
    if (i === P.length - 2) {
      var e = suave(tramo(t, 0.3, 1));
      for (var n = 0; n < 4; n++) {
        q[n][0] = entre(q[n][0], M.diana[n][0], e);
        q[n][1] = entre(q[n][1], M.diana[n][1], e);
      }
    }
    var m = matriz(M.w, M.h, q);
    if (m && m !== ultimaMatriz) { placa.style.transform = m; ultimaMatriz = m; }

    placa.style.setProperty('--sombra', entre(1, 0.1, tramo(p, 0.66, 0.86)).toFixed(3));
    if (capa) capa.style.opacity = tramo(p, 0.875, 0.94).toFixed(3);
    placa.style.opacity = (1 - tramo(p, 0.915, 0.965)).toFixed(3);

    for (var j = 0; j < bloques.length; j++) {
      var bl = bloques[j];
      var activo = p >= +bl.getAttribute('data-ini') && p <= +bl.getAttribute('data-fin');
      if (activo !== bl.classList.contains('activo')) bl.classList.toggle('activo', activo);
    }
    if (pista) pista.style.opacity = p > 0.05 ? '0' : '1';
  }

  function pide() { if (!pendiente) { pendiente = true; requestAnimationFrame(pinta); } }

  /* mientras la placa flota hay que repintar aunque nadie haga scroll */
  function late() {
    if (visible && ultimoP < 0.2) pide();
    requestAnimationFrame(late);
  }

  function remide() { M = null; ultimoP = -1; pide(); }

  document.addEventListener('scroll', pide, { passive: true, capture: true });
  addEventListener('resize', remide, { passive: true });
  addEventListener('orientationchange', remide, { passive: true });
  addEventListener('load', remide);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remide);
  [].forEach.call(escenario.querySelectorAll('img'), function (im) {
    if (!im.complete) im.addEventListener('load', remide, { once: true });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) pide(); })
      .observe(escenario);
  }

  mide();
  pinta();
  requestAnimationFrame(late);
})();
