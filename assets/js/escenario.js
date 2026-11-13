/* Electricidad y Antenas DLR — la placa se instala conforme bajas.

   Cómo funciona:
   - La placa es un objeto 3D de verdad: una caja con su cara de células, su
     dorso, y los cuatro cantos del marco de aluminio. Son seis capas HTML.
   - En cada fotograma se calculan los ocho vértices de la caja girada, se
     proyectan a pantalla con perspectiva, y cada cara se deforma con la
     matrix3d que lleva su rectángulo a los cuatro vértices que le tocan.
     Solo se pintan las caras que miran al espectador, y cada una se sombrea
     según cómo le da la luz.
   - Al posarse, los vértices de la cara de células se llevan a las cuatro
     esquinas exactas de una de las placas de la foto (medidas sobre la
     imagen), así que encaja al píxel en cualquier pantalla.
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
     y el alto de la imagen, en el orden de las esquinas de la cara de
     células: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda. */
  var DIANA = [
    [0.50716, 0.34619],
    [0.54720, 0.27783],
    [0.60840, 0.28271],
    [0.57031, 0.35400]
  ];
  var PERSPECTIVA = 1500;
  var GROSOR = 0.03;                 /* grosor del marco respecto al ancho */
  var LUZ = (function () {           /* de dónde viene la luz: arriba-izquierda, de frente */
    var v = [-0.42, -0.55, 0.72], n = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / n, v[1] / n, v[2] / n];
  })();

  var sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- entorno: ancho completo y contenedores que rompen sticky ---------- */


  /* La landing va en varios bloques de código en GoHighLevel (con el formulario
     nativo entre ellos), y cada uno queda dentro de una columna con ancho máximo
     y relleno. Esto los saca a todo el ancho de la ventana. Se expone para que
     el último bloque pueda llamarlo nada más cargarse. */
  function abreAncestros(env) {
    /* los contenedores con overflow oculto recortarían el bloque al sacarlo
       de su columna, y además rompen position:sticky */
    var anchoDoc = document.documentElement.clientWidth;
    var clip = window.CSS && CSS.supports && CSS.supports('overflow', 'clip');
    var nodo = env.parentElement;
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
  }

  function anchoCompleto() {
    var anchoDoc = document.documentElement.clientWidth;
    var bloques = document.querySelectorAll('.dlr-solar');
    if (!bloques.length) bloques = [escenario];
    [].forEach.call(bloques, function (env) {
      abreAncestros(env);
      if (!env.classList.contains('dlr-solar')) return;
      env.style.width = '';
      env.style.maxWidth = '';
      env.style.marginLeft = '';
      var r = env.getBoundingClientRect();
      if (r.left > 0.5 || r.width < anchoDoc - 1) {
        var margen = parseFloat(getComputedStyle(env).marginLeft) || 0;
        env.style.maxWidth = 'none';
        env.style.width = anchoDoc + 'px';
        env.style.marginLeft = (margen - r.left) + 'px';
      }
    });
  }
  window.dlrAnchoCompleto = anchoCompleto;
  var arreglaEntorno = anchoCompleto;

  /* atajos: aparecen con el primer scroll y ya no se van */
  var atajos = document.getElementById('atajos');
  function vigilaAtajos() {
    if (!atajos) return;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    atajos.classList.toggle('visible', y > 24 || escenario.getBoundingClientRect().top < -24);
  }
  document.addEventListener('scroll', vigilaAtajos, { passive: true, capture: true });

  /* huecos que tapan la cabecera fija y la barra inferior del móvil */
  function mideHuecos() {
    var arriba = 0, abajo = 0;
    var cab = document.getElementById('cabecera');
    if (cab) {
      var pc = getComputedStyle(cab).position;
      if (pc === 'sticky' || pc === 'fixed') arriba = cab.offsetHeight;
    }
    /* el logo y los atajos flotantes: si ya hay cabecera fija con su logo y sus
       botones, sobran; si no, se les reserva la franja de arriba para que los
       rótulos no los pisen */
    var logo = document.getElementById('escLogo');
    if (arriba > 0) {
      if (atajos) atajos.style.display = 'none';
      if (logo) logo.style.display = 'none';
    } else if (atajos || logo) {
      if (atajos) atajos.style.display = '';
      if (logo) logo.style.display = '';
      arriba = Math.max(atajos ? atajos.offsetHeight : 0, logo ? logo.offsetHeight : 0) + 26;
    }
    var barra = document.querySelector('.barra-movil');
    if (barra && getComputedStyle(barra).display !== 'none') abajo = barra.offsetHeight;
    escenario.style.setProperty('--esc-arriba', arriba + 'px');
    escenario.style.setProperty('--esc-abajo', abajo + 'px');
    return { arriba: arriba, abajo: abajo };
  }

  arreglaEntorno();
  var huecos = mideHuecos();
  vigilaAtajos();

  if (sinMovimiento) {
    addEventListener('resize', function () { arreglaEntorno(); mideHuecos(); });
    return;
  }

  /* ---------- la placa como caja de seis caras ---------- */

  function crea(clase, dentro) {
    var d = document.createElement('div');
    d.className = 'cara ' + clase;
    d.innerHTML = (dentro || '') + '<b class="luz"></b>';
    placa.appendChild(d);
    return d;
  }
  var foto = placa.querySelector('img');
  var sombra = document.createElement('div');
  sombra.className = 'cara cara-sombra';
  placa.appendChild(sombra);
  var elDorso = crea('cara-dorso', '<i class="dorso-caja"></i><i class="dorso-cable c1"></i><i class="dorso-cable c2"></i><i class="dorso-etq"></i>');
  var elArriba = crea('cara-canto canto-h');
  var elAbajo = crea('cara-canto canto-h');
  var elIzq = crea('cara-canto canto-v');
  var elDcha = crea('cara-canto canto-v');
  var elFrente = crea('cara-frente', '<i class="brillo"></i>');
  if (foto) elFrente.insertBefore(foto, elFrente.firstChild);
  placa.classList.add('esc-3d');

  /* vértices: 0-3 la cara de células (AI, AD, BD, BI), 4-7 el dorso, mismos x,y.
     Cada cara lista sus vértices de forma que, vista desde fuera, su rectángulo
     HTML (0,0)-(ancho,0)-(ancho,alto)-(0,alto) caiga sobre ellos en ese orden. */
  var CARAS = [
    { el: elFrente, v: [0, 1, 2, 3], n: [0, 0, 1], t: 'wh' },
    { el: elDorso, v: [5, 4, 7, 6], n: [0, 0, -1], t: 'wh' },
    { el: elDcha, v: [1, 5, 6, 2], n: [1, 0, 0], t: 'dh' },
    { el: elIzq, v: [4, 0, 3, 7], n: [-1, 0, 0], t: 'dh' },
    { el: elArriba, v: [4, 5, 1, 0], n: [0, -1, 0], t: 'wd' },
    { el: elAbajo, v: [3, 2, 6, 7], n: [0, 1, 0], t: 'wd' }
  ];

  /* ---------- utilidades ---------- */

  function entre(a, b, t) { return a + (b - a) * t; }
  function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function tramo(v, a, b) { return limita((v - a) / (b - a), 0, 1); }
  var RAD = Math.PI / 180;

  function trig(pose) {
    return { sx: Math.sin(pose.rx * RAD), cx: Math.cos(pose.rx * RAD),
             sy: Math.sin(pose.ry * RAD), cy: Math.cos(pose.ry * RAD),
             sz: Math.sin(pose.rz * RAD), cz: Math.cos(pose.rz * RAD) };
  }
  function gira(x, y, z, T) {
    var x1 = x * T.cz - y * T.sz, y1 = x * T.sz + y * T.cz;   /* giro en Z */
    var x2 = x1 * T.cy + z * T.sy, z2 = -x1 * T.sy + z * T.cy; /* giro en Y */
    return [x2, y1 * T.cx - z2 * T.sx, y1 * T.sx + z2 * T.cx]; /* giro en X */
  }

  /* los ocho vértices de la caja, proyectados a pantalla */
  function proyecta(pose, T, w, h, d, ox, oy) {
    var hw = w * pose.s / 2, hh = h * pose.s / 2, hd = d * pose.s / 2;
    var base = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    var out = [];
    for (var i = 0; i < 8; i++) {
      var b = base[i % 4];
      var g = gira(b[0], b[1], i < 4 ? hd : -hd, T);
      var k = PERSPECTIVA / (PERSPECTIVA - g[2]);
      out.push([ox + (pose.x + g[0] - ox) * k, oy + (pose.y + g[1] - oy) * k]);
    }
    return out;
  }

  function area2(q) {
    var s = 0;
    for (var i = 0; i < 4; i++) { var a = q[i], b = q[(i + 1) % 4]; s += a[0] * b[1] - b[0] * a[1]; }
    return s;
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

    /* tamaño de la caja y de cada cara */
    var w = placa.offsetWidth || 1, h = placa.offsetHeight || 1, d = Math.max(6, w * GROSOR);
    CARAS.forEach(function (c) {
      c.fw = c.t === 'dh' ? d : w;
      c.fh = c.t === 'wd' ? d : h;
      c.el.style.width = c.fw + 'px';
      c.el.style.height = c.fh + 'px';
    });
    sombra.style.width = w + 'px';
    sombra.style.height = h + 'px';

    /* la diana, en coordenadas del panel fijo */
    var cx0 = casa.offsetLeft, cy0 = casa.offsetTop, cw = casa.offsetWidth, ch = casa.offsetHeight;
    var diana = DIANA.map(function (f) { return [cx0 + f[0] * cw, cy0 + f[1] * ch]; });
    var dcx = (diana[0][0] + diana[1][0] + diana[2][0] + diana[3][0]) / 4;
    var dcy = (diana[0][1] + diana[1][1] + diana[2][1] + diana[3][1]) / 4;
    var ladoLargo = Math.hypot(diana[1][0] - diana[0][0], diana[1][1] - diana[0][1]);
    var escalaFin = ladoLargo * 1.5 / w;

    /* las poses del vuelo: la placa arranca flotando sobre la casa, que ya se ve */
    var P;
    if (!movil) {
      /* arriba, en el cielo, para que la casa y el paisaje queden a la vista */
      var s0d = 0.86;
      var y0d = Math.max(arriba + h * s0d * 0.5 + 18, cy0 + ch * 0.03);
      P = [
        { p: 0.00, x: Math.max(dcx + sw * 0.03, sw * 0.71), y: y0d, rx: -16, ry: -30, rz: 6, s: s0d },
        { p: 0.22, x: Math.max(dcx + sw * 0.03, sw * 0.71), y: y0d + util * 0.02, rx: -4, ry: 70, rz: 2, s: s0d * 0.96 }
      ];
    } else {
      /* en pantallas muy bajas el aviso de bajar no cabe: se quita y la placa gana sitio */
      var sinPista = (arriba + util - 58) - (hueroAbajo + 12) < 150;
      if (pista) pista.style.display = sinPista ? 'none' : '';
      var techo = hueroAbajo + 12, suelo = arriba + util - (sinPista ? 16 : 58);
      var s0 = limita((suelo - techo) * 0.70 / h, 0.4, 0.9);
      var y0 = (techo + suelo) / 2;
      P = [
        { p: 0.00, x: sw * 0.50, y: y0, rx: -16, ry: -28, rz: 6, s: s0 },
        { p: 0.22, x: sw * 0.52, y: y0, rx: -4, ry: 70, rz: 2, s: s0 * 0.96 }
      ];
    }
    var alza = movil ? util * 0.17 : util * 0.20;
    var k3 = { p: 0.68, x: dcx - sw * 0.01, y: dcy - alza, rx: 34, ry: 292, rz: -16, s: Math.max(escalaFin * 1.9, 0.34) };
    if (movil && textoAbajo) {
      var minimo = textoAbajo + 8 + h * k3.s * 0.5;
      if (k3.y < minimo) k3.y = Math.min(minimo, dcy - 12);
    }
    var k1 = P[1];
    P.push({ p: 0.46, x: entre(k1.x, k3.x, 0.5), y: entre(k1.y, k3.y, 0.42), rx: 14, ry: 190, rz: -5,
             s: entre(k1.s, k3.s, 0.5) });
    P.push(k3);
    /* pose de aproximación: ya orientada como el tejado, encima de la diana */
    var fin = { p: 0.86, x: dcx, y: dcy, rx: 56, ry: 360, rz: -34, s: escalaFin };
    P.push(fin);

    var ox = sw * 0.6, oy = arriba + util * 0.42;
    /* cuánto asoma el dorso por detrás de la cara al posarse */
    var pf = proyecta(fin, trig(fin), w, h, d, ox, oy), grosorFin = [];
    for (var i = 0; i < 4; i++) grosorFin.push([pf[i + 4][0] - pf[i][0], pf[i + 4][1] - pf[i][1]]);

    M = { sw: sw, sh: sh, w: w, h: h, d: d, movil: movil, diana: diana, grosorFin: grosorFin,
          P: P, ox: ox, oy: oy };
  }

  /* ---------- fotograma ---------- */

  var manual = false, pM = -1, tAnterior = 0, visible = true, pendiente = false;
  /* Tiempo de respuesta del amortiguado, en segundos. La rueda del ratón mueve
     el scroll a saltos de unos 100 px; con esto la placa los recorre de forma
     continua en vez de teletransportarse. En táctil el scroll ya es continuo y
     basta con menos. */
  var TAU = matchMedia('(hover: none)').matches ? 0.07 : 0.15;

  /* curva suave que pasa por todas las poses sin detenerse en ninguna
     (Hermite con tangentes por diferencias; sale y llega con velocidad cero) */
  function curva(P, clave, i, u) {
    var a = P[i], b = P[i + 1], h = b.p - a.p;
    var ma = i > 0 ? (b[clave] - P[i - 1][clave]) / (b.p - P[i - 1].p) : 0;
    var mb = i < P.length - 2 ? (P[i + 2][clave] - a[clave]) / (P[i + 2].p - a.p) : 0;
    var u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a[clave] + (u3 - 2 * u2 + u) * h * ma +
           (-2 * u3 + 3 * u2) * b[clave] + (u3 - u2) * h * mb;
  }

  function pinta(ahora) {
    pendiente = false;
    if (!M) mide();
    if (!ahora) ahora = performance.now();
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

    /* el progreso que se pinta persigue al del scroll */
    if (pM < 0) pM = p;
    else {
      var dt = Math.min(0.05, Math.max(0, (ahora - tAnterior) / 1000));
      pM += (p - pM) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(p - pM) < 0.0003) pM = p;
    }
    tAnterior = ahora;
    p = pM;

    /* pose del vuelo, sobre una curva continua */
    var P = M.P, i = 0;
    while (i < P.length - 2 && p > P[i + 1].p) i++;
    var a = P[i], b = P[i + 1];
    var t = tramo(p, a.p, b.p);
    var pose = { x: curva(P, 'x', i, t), y: curva(P, 'y', i, t), rx: curva(P, 'rx', i, t),
                 ry: curva(P, 'ry', i, t), rz: curva(P, 'rz', i, t),
                 s: Math.max(0.05, curva(P, 's', i, t)) };
    /* flota mientras vuela; se va calmando al acercarse al tejado */
    var peso = 1 - tramo(p, 0.45, 0.8);
    if (peso > 0) {
      var osc = Math.sin(ahora / 1300) * peso, osc2 = Math.sin(ahora / 2100) * (1 - tramo(p, 0, 0.2));
      pose.y += osc * (M.movil ? 4 : 7); pose.rz += osc * 1.2; pose.rx += osc * 1.8; pose.ry += osc2 * 6;
    }
    var T = trig(pose);
    var q = proyecta(pose, T, M.w, M.h, M.d, M.ox, M.oy);

    /* al final los vértices se llevan a las esquinas de la placa de la foto */
    if (i === P.length - 2) {
      /* se posa frenando: rápido al principio, suave al llegar */
      var e = 1 - Math.pow(1 - tramo(t, 0.2, 1), 3);
      for (var n = 0; n < 4; n++) {
        var dx = M.diana[n][0], dy = M.diana[n][1];
        q[n][0] = entre(q[n][0], dx, e);
        q[n][1] = entre(q[n][1], dy, e);
        q[n + 4][0] = entre(q[n + 4][0], dx + M.grosorFin[n][0], e);
        q[n + 4][1] = entre(q[n + 4][1], dy + M.grosorFin[n][1], e);
      }
    }

    /* cada cara: se pinta solo si mira al espectador, deformada y sombreada */
    for (var c = 0; c < CARAS.length; c++) {
      var cara = CARAS[c], v = cara.v;
      var cq = [q[v[0]], q[v[1]], q[v[2]], q[v[3]]];
      var m = area2(cq) > 3 ? matriz(cara.fw, cara.fh, cq) : null;
      if (!m) { if (cara.vis !== false) { cara.el.style.visibility = 'hidden'; cara.vis = false; } continue; }
      if (cara.vis !== true) { cara.el.style.visibility = 'visible'; cara.vis = true; }
      cara.el.style.transform = m;
      var g = gira(cara.n[0], cara.n[1], cara.n[2], T);
      var luz = Math.max(0, g[0] * LUZ[0] + g[1] * LUZ[1] + g[2] * LUZ[2]);
      cara.el.style.setProperty('--oscuro', ((1 - luz) * 0.5).toFixed(3));
    }
    /* el reflejo del cristal se desplaza con el giro */
    var giro = ((pose.ry % 360) + 360) % 360;
    elFrente.style.setProperty('--bx', (130 - (giro > 180 ? giro - 360 : giro) * 1.6).toFixed(1) + '%');

    /* sombra en el aire: la silueta de la placa, desplazada y difuminada */
    var fs = 1 - tramo(p, 0.62, 0.86), sq = [];
    for (var s = 0; s < 4; s++) sq.push([q[s][0] + 16 * fs + 2, q[s][1] + 44 * fs * pose.s + 3]);
    var ms = Math.abs(area2(sq)) > 3 ? matriz(M.w, M.h, sq) : null;
    if (ms) sombra.style.transform = ms;
    sombra.style.opacity = ms ? (0.1 + 0.2 * fs).toFixed(3) : '0';

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

  /* mientras el escenario está a la vista se pinta cada fotograma: la placa
     flota y además va alcanzando al scroll. Fuera de la vista, se para. */
  function late() {
    if (visible) pide();
    requestAnimationFrame(late);
  }

  function remide() { M = null; pide(); }

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
