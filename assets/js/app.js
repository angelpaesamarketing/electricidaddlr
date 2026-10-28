/* Electricidad y Antenas DLR — interacciones. Sin librerías. */
(() => {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactil = matchMedia('(hover: none)').matches;

  /* año del pie */
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* cabecera al hacer scroll */
  const cabecera = document.getElementById('cabecera');
  const marcaScroll = () => cabecera.classList.toggle('pegada', scrollY > 8);
  marcaScroll();
  addEventListener('scroll', marcaScroll, { passive: true });

  /* revelado al entrar en pantalla */
  const ojo = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      ojo.unobserve(e.target);
      if (e.target.classList.contains('cifras')) cuentaAtras(e.target);
    });
  }, { rootMargin: '0px 0px -12%' });
  document.querySelectorAll('.rev').forEach((n, i) => {
    n.style.transitionDelay = (i % 4) * 70 + 'ms';
    ojo.observe(n);
  });

  /* contadores */
  function cuentaAtras(caja) {
    caja.querySelectorAll('[data-cuenta]').forEach((n) => {
      const fin = +n.dataset.cuenta, suf = n.dataset.sufijo || '';
      if (quieto) { n.textContent = fin + suf; return; }
      const t0 = performance.now(), dur = 1400;
      const paso = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const suave = 1 - Math.pow(1 - p, 3);
        n.textContent = Math.round(fin * suave) + suf;
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  }

  if (quieto) return;

  /* escena del héroe: profundidad con puntero + scroll */
  const escena = document.getElementById('escena');
  if (escena) {
    const piezas = [...escena.querySelectorAll('.pieza')];
    let px = 0, py = 0, sy = 0, pendiente = false;

    const pinta = () => {
      pendiente = false;
      piezas.forEach((pieza) => {
        const d = +pieza.dataset.prof;
        const x = px * d, y = py * d + sy * (d / 26);
        const rx = -py * 11, ry = px * 13;
        pieza.style.transform =
          `translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };
    const pide = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pinta); } };

    if (!tactil) {
      addEventListener('pointermove', (e) => {
        px = (e.clientX / innerWidth - .5) * 2;
        py = (e.clientY / innerHeight - .5) * 2;
        pide();
      }, { passive: true });
    }
    addEventListener('scroll', () => {
      const y = escena.getBoundingClientRect().top;
      sy = Math.max(-40, Math.min(40, -y * .055));
      pide();
    }, { passive: true });
    pinta();
  }

  /* tarjetas con inclinación 3D */
  if (!tactil) {
    document.querySelectorAll('.tilt').forEach((t) => {
      t.addEventListener('pointermove', (e) => {
        const c = t.getBoundingClientRect();
        const x = (e.clientX - c.left) / c.width - .5;
        const y = (e.clientY - c.top) / c.height - .5;
        t.style.transform =
          `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 7}deg) translateY(-4px)`;
      });
      t.addEventListener('pointerleave', () => { t.style.transform = ''; });
    });
  }

  /* formulario: de momento abre WhatsApp con el mensaje montado */
  const form = document.getElementById('formulario');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const texto = `Hola, soy ${d.get('nombre') || ''} (${d.get('telefono') || ''}). ${d.get('mensaje') || 'Quiero un presupuesto.'}`;
      open('https://wa.me/34652967349?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }
})();
