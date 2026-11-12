#!/usr/bin/env python3
"""Genera los bloques autonomos para pegar en GoHighLevel a partir de las
paginas del repositorio, para que los textos no se dupliquen a mano.

    python3 ghl/construir.py
"""
import io, re, os, sys, base64

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ESTILO = """<style>
/* Electricidad y Antenas DLR - bloque autonomo. Todo va dentro de .dlr-doc
   para no chocar con los estilos de la plantilla de GoHighLevel. */
.dlr-doc{--tinta:#0d223b;--texto:#48566b;--suave:#7a8699;--linea:#e3e8f0;--crema:#f5f8fc;
  --azul:#016dfd;--azul-claro:#e8f1ff;--verde:#13b981;
  max-width:820px;margin:0 auto;padding:32px 20px 56px;
  font:17px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--texto);text-align:left;box-sizing:border-box}
.dlr-doc *{box-sizing:border-box}
.dlr-doc h1,.dlr-doc h2,.dlr-doc h3{color:var(--tinta);line-height:1.15;letter-spacing:-.025em;
  margin:0 0 .45em;font-weight:800}
.dlr-doc h1{font-size:clamp(1.9rem,5vw,2.6rem);font-weight:850}
.dlr-doc h2{font-size:clamp(1.2rem,2.6vw,1.5rem);margin:2.2em 0 .6em}
.dlr-doc h3{font-size:1.08rem;margin:1.8em 0 .5em;font-weight:750}
.dlr-doc p{margin:0 0 1em;font-size:1.02rem}
.dlr-doc a{color:var(--azul);text-decoration:underline;text-underline-offset:2px}
.dlr-doc ul{padding-left:1.3em;margin:0 0 1em}
.dlr-doc li{margin-bottom:.5em;font-size:1.02rem}
.dlr-doc li b,.dlr-doc p b{color:var(--tinta)}
.dlr-doc .etq{display:inline-block;font-size:.76rem;font-weight:750;letter-spacing:.1em;
  text-transform:uppercase;color:var(--azul);background:var(--azul-claro);
  padding:7px 14px;border-radius:999px;margin-bottom:18px}
.dlr-doc .fecha{color:var(--suave);font-size:.92rem;margin:-.2em 0 2em}
.dlr-doc .entrada{font-size:1.1rem;color:var(--tinta);border-left:3px solid var(--azul);
  padding:2px 0 2px 18px;margin-bottom:1.6em}
.dlr-doc .volver{margin-top:3em;padding-top:1.6em;border-top:1px solid var(--linea)}
.dlr-doc .aviso-tabla{font-size:.92rem;color:var(--suave);margin-top:.9em}
.dlr-doc .tabla-env{overflow-x:auto;border:1px solid var(--linea);border-radius:16px;margin:0 0 1.2em}
.dlr-doc table{border-collapse:collapse;width:100%;font-size:.95rem;min-width:520px}
.dlr-doc th,.dlr-doc td{text-align:left;padding:12px 15px;border-bottom:1px solid var(--linea);
  vertical-align:top}
.dlr-doc th{background:var(--crema);color:var(--tinta);font-weight:750;font-size:.85rem}
.dlr-doc tr:last-child td{border-bottom:none}
.dlr-doc .centro{text-align:center}
.dlr-doc .sello{width:76px;height:76px;margin:0 auto 26px;border-radius:50%;
  background:var(--azul-claro);color:var(--verde);display:flex;align-items:center;
  justify-content:center}
.dlr-doc .sello svg{width:38px;height:38px}
.dlr-doc .plomo{max-width:620px;margin:0 auto 34px;color:var(--suave);font-size:1.08rem}
.dlr-doc .acciones{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:0 0 10px}
.dlr-doc .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;
  padding:17px 30px;border-radius:999px;font-weight:750;font-size:1.04rem;
  border:1px solid transparent;text-decoration:none;cursor:pointer}
.dlr-doc .btn svg{width:20px;height:20px;flex:none}
.dlr-doc .btn-azul{background:var(--azul);color:#fff;box-shadow:0 14px 30px -12px rgba(1,109,253,.8)}
.dlr-doc .btn-wa{background:#25d366;color:#07321a;box-shadow:0 14px 30px -12px rgba(37,211,102,.8)}
.dlr-doc .siguiente{margin-top:56px;padding-top:40px;border-top:1px solid var(--linea)}
.dlr-doc .siguiente h2{font-size:clamp(1.3rem,3vw,1.7rem);margin:0 0 1.2em}
.dlr-doc .pasos-g{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;text-align:left}
.dlr-doc .paso-g{background:var(--crema);border:1px solid var(--linea);border-radius:16px;padding:20px}
.dlr-doc .paso-g h3{margin:0 0 .4em}
.dlr-doc .paso-g p{font-size:.95rem;margin:0}
@media (max-width:760px){.dlr-doc .pasos-g{grid-template-columns:1fr}}
@media (max-width:420px){.dlr-doc .acciones .btn{width:100%}}
</style>
"""

CABECERA = ("<!-- Electricidad y Antenas DLR - %s\n"
            "     Pegar en GoHighLevel en un elemento Custom Code / HTML.\n"
            "     Generado por ghl/construir.py a partir de %s: no editar a mano,\n"
            "     cambiar la pagina del repositorio y volver a ejecutar el script. -->\n")


def cuerpo(ruta, selector):
    t = io.open(os.path.join(RAIZ, ruta), encoding='utf-8').read()
    m = re.search(r'<section class="%s">(.*?)\n</section>' % selector, t, re.S)
    if not m:
        sys.exit('No encuentro <section class="%s"> en %s' % (selector, ruta))
    interior = m.group(1)
    # quitamos el contenedor .env del sitio, que en GHL no existe
    interior = re.sub(r'<div class="env[^"]*">', '', interior, count=1)
    # en GHL las paginas no llevan .html en la URL
    interior = interior.replace('/aviso-legal.html', '/aviso-legal')
    interior = interior.replace('/privacidad.html', '/privacidad')
    interior = interior.rstrip()
    if interior.endswith('</div>'):
        interior = interior[:-6].rstrip()
    return interior


def escribir(destino, titulo, origen, interior, clase_extra=''):
    ruta = os.path.join(RAIZ, 'ghl', destino)
    abre = '<div class="dlr-doc%s">' % ((' ' + clase_extra) if clase_extra else '')
    io.open(ruta, 'w', encoding='utf-8').write(
        (CABECERA % (titulo, origen)) + ESTILO + '\n' + abre + interior + '\n</div>\n')
    print('%-28s %6d bytes' % (destino, os.path.getsize(ruta)))


escribir('aviso-legal-ghl.html', 'Aviso legal', 'aviso-legal.html',
         cuerpo('aviso-legal.html', 'legal'))
escribir('privacidad-ghl.html', 'Politica de privacidad y cookies', 'privacidad.html',
         cuerpo('privacidad.html', 'legal'))
escribir('gracias-ghl.html', 'Pagina de gracias', 'gracias.html',
         cuerpo('gracias.html', 'gracias'), clase_extra='centro')

# --- landing de placas solares ---------------------------------------------
# Es una pagina entera. En GoHighLevel no existen ni estilo.css ni app.js, asi
# que el bloque lleva TODO dentro: estilos acotados bajo .dlr-solar, las tres
# imagenes de la animacion incrustadas y los dos scripts en linea. No depende
# de subir nada a la galeria ni de ningun servidor externo.
def acota(css, prefijo='.dlr-solar'):
    """Antepone el prefijo a cada selector, entrando en @media y @supports."""
    out = []; i = 0; n = len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            out.append(css[i:]); break
        cab = css[i:j]
        prof = 1; k = j + 1
        while k < n and prof:
            if css[k] == '{': prof += 1
            elif css[k] == '}': prof -= 1
            k += 1
        cuerpo = css[j + 1:k - 1]
        limpio = re.sub(r'/\*.*?\*/', '', cab, flags=re.S).strip()
        coment = cab[:len(cab) - len(cab.lstrip())] + ''.join(re.findall(r'/\*.*?\*/\s*', cab, flags=re.S))
        if limpio.startswith(('@media', '@supports')):
            out.append(coment + limpio + '{' + acota(cuerpo, prefijo) + '}')
        elif limpio.startswith('@'):
            out.append(coment + limpio + '{' + cuerpo + '}')
        else:
            sel = ','.join(prefijo + ' ' + s.strip() for s in limpio.split(','))
            out.append(coment + sel + '{' + cuerpo + '}')
        i = k
    return ''.join(out)

sol = io.open(os.path.join(RAIZ, 'placas-solares.html'), encoding='utf-8').read()
m = re.search(r'</header>(.*?)<footer>', sol, re.S)
mb = re.search(r'<div class="barra-movil">.*?\n</div>', sol, re.S)
if not m or not mb:
    sys.exit('No encuentro el cuerpo o la barra movil de placas-solares.html')
# pie con los enlaces legales: sin ellos la landing no cumple ni con la LSSI ni
# con los requisitos de destino de Google Ads
PIE_LEGAL = """<div class="pie-legal">
  <span>Electricidad y Antenas DLR · DLR EDSAYT S.L. · Torrevieja (Alicante)</span>
  <span><a href="/aviso-legal">Aviso legal</a> · <a href="/privacidad">Privacidad</a> · <a href="#" data-cookies>Configurar cookies</a></span>
</div>"""
cuerpo_sol = m.group(1).rstrip() + '\n\n' + PIE_LEGAL + '\n\n' + mb.group(0)
# sin app.js las clases .rev dejarian la pagina con opacity 0
cuerpo_sol = re.sub(r'\s(?:rev|tilt)(?=["\s])', '', cuerpo_sol)
cuerpo_sol = cuerpo_sol.replace('/aviso-legal.html', '/aviso-legal').replace('/privacidad.html', '/privacidad')
cuerpo_sol = re.sub(r'\s(?:srcset|sizes|fetchpriority)="[^"]*"', '', cuerpo_sol)

# versiones ligeras de las imagenes, que son las que se incrustan
LIGERAS = {'placa-1200.webp': 'placa-700.webp',
           'casa-vacia-1600.webp': 'casa-vacia-1280.webp',
           'casa-capa-instalada.webp': 'casa-capa-instalada-1280.webp',
           'caso-real-general.webp': 'caso-real-general-900.webp',
           'caso-real-tejado.webp': 'caso-real-tejado-600.webp',
           'caso-real-lateral.webp': 'caso-real-lateral-600.webp'}
PESO_IMG = [0]
def _incrusta(mm):
    nombre = os.path.basename(mm.group(1))
    datos = io.open(os.path.join(RAIZ, 'assets', 'img', LIGERAS.get(nombre, nombre)), 'rb').read()
    PESO_IMG[0] += len(datos)
    return 'src="data:image/webp;base64,' + base64.b64encode(datos).decode('ascii') + '"'
cuerpo_sol = re.sub(r'src="(assets/img/[a-z0-9-]+\.webp)"', _incrusta, cuerpo_sol)
if 'assets/' in cuerpo_sol:
    sys.exit('ERROR: quedan rutas a assets/ en el bloque de GHL: ' +
             str(re.findall(r'assets/[^"\')]+', cuerpo_sol)[:5]))
if 'class="rev' in cuerpo_sol or ' rev"' in cuerpo_sol:
    sys.exit('ERROR: quedan clases rev; en GHL la pagina saldria invisible.')

# estilos: la base escrita a mano + los bloques del sitio que la landing comparte,
# acotados automaticamente para no mantener dos copias que se desincronicen
estilo = io.open(os.path.join(RAIZ, 'assets', 'css', 'estilo.css'), encoding='utf-8').read()
ini_f = estilo.index('/* factores del presupuesto, en la landing solar */')
ini_e = estilo.index('/* ===== escenario: la placa se instala conforme se baja ===== */')
css_sol = (io.open(os.path.join(RAIZ, 'ghl', 'estilo-solar.css'), encoding='utf-8').read().strip() +
           '\n\n' + acota(estilo[ini_f:ini_e].strip()) + '\n\n' + acota(estilo[ini_e:].strip()))
js_sol = (io.open(os.path.join(RAIZ, 'assets', 'js', 'escenario.js'), encoding='utf-8').read().strip() +
          '\n\n' +
          io.open(os.path.join(RAIZ, 'assets', 'js', 'formulario-solar.js'), encoding='utf-8').read().strip())
if ('<' + '/script>') in js_sol or ('<' + '/script>') in css_sol or ('<' + '/style>') in css_sol:
    sys.exit('ERROR: el script o el CSS de la landing llevan una etiqueta de cierre.')
ruta = os.path.join(RAIZ, 'ghl', 'placas-solares-ghl.html')
io.open(ruta, 'w', encoding='utf-8').write(
    "<!-- Electricidad y Antenas DLR - landing de placas solares\n"
    "     Pegar en GoHighLevel en un elemento Custom Code / HTML. Va todo dentro:\n"
    "     estilos, imagenes y scripts. Generado por ghl/construir.py: no editar a mano. -->\n"
    "<style>\n" + css_sol + "\n</style>\n\n<div class=\"dlr-solar\">" + cuerpo_sol.rstrip() +
    "\n</div>\n\n<script>\n" + js_sol + "\n</script>\n")
print('%-28s %6d bytes  (imagenes incrustadas: %d KB)' % ('placas-solares-ghl.html', os.path.getsize(ruta), PESO_IMG[0] // 1024))

# --- banner de consentimiento: CSS extraido de estilo.css + el script ---
css = io.open(os.path.join(RAIZ, 'assets/css/estilo.css'), encoding='utf-8').read()
m = re.search(r'/\* ===== banner de cookies ===== \*/(.*?)(?=\n@media \(max-width:760px\))', css, re.S)
if not m:
    sys.exit('No encuentro el bloque CSS del banner en estilo.css')
banner_css = m.group(1).strip()
# en GHL no existen las variables del sitio ni .barra-movil: las resolvemos
banner_css = (banner_css
              .replace('var(--linea)', '#e3e8f0')
              .replace('var(--radio-g)', '26px')
              .replace('var(--radio)', '16px')
              .replace('var(--tinta)', '#0d223b')
              .replace('var(--texto)', '#48566b')
              .replace('var(--suave)', '#7a8699')
              .replace('var(--azul)', '#016dfd'))
banner_css = re.sub(r'\nbody\.ck-visible \.barra-movil\{display:none\}', '', banner_css)
banner_css += """
/* la plantilla de GHL no trae los botones del sitio: los definimos aqui */
.ck-panel .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;
  padding:13px 22px;border-radius:999px;font-weight:750;font-size:.96rem;
  border:1px solid transparent;cursor:pointer;font-family:inherit}
.ck-panel .btn-azul{background:#016dfd;color:#fff}
.ck-panel .btn-linea{background:#fff;color:#0d223b;border-color:#e3e8f0}
.ck-panel .btn-linea:hover{border-color:#016dfd;color:#016dfd}
.ck-panel h2{font-family:inherit;font-weight:800;color:#0d223b;letter-spacing:-.02em}
@media (max-width:520px){
  .ck-capa{padding:8px}
  .ck-panel{padding:18px;border-radius:16px}
  .ck-botones{flex-direction:column;align-items:stretch}
  .ck-botones .btn{width:100%}
}"""

js = io.open(os.path.join(RAIZ, 'assets/js/consentimiento.js'), encoding='utf-8').read()
js = js.replace(
    "var URL_POLITICA = '/privacidad.html#cookies';",
    "var URL_POLITICA = '/privacidad#cookies';  "
    "/* <<< AJUSTA ESTA RUTA si tu pagina de privacidad en GHL tiene otra URL */")

CIERRE = '<' + '/script>'
if CIERRE in js or CIERRE in banner_css:
    sys.exit('ERROR: el script o el CSS del banner contienen una etiqueta de cierre\n'
             'de script. Al pegarlo en linea en GoHighLevel el navegador cerraria\n'
             'el bloque ahi y el banner no funcionaria. Quitala antes de generar.')

ruta = os.path.join(RAIZ, 'ghl', 'consentimiento-ghl.html')
io.open(ruta, 'w', encoding='utf-8').write(
    "<!-- Electricidad y Antenas DLR - banner de cookies + Consent Mode v2\n"
    "     Pegar en GoHighLevel en Settings > Tracking Code > HEAD,\n"
    "     SIEMPRE ANTES de la etiqueta de Google (gtag.js o GTM).\n"
    "     Generado por ghl/construir.py a partir de assets/js/consentimiento.js\n"
    "     y del bloque de cookies de assets/css/estilo.css. -->\n"
    "<style>\n" + banner_css + "\n</style>\n\n<script>\n" + js.strip() + "\n</script>\n")
print('%-28s %6d bytes' % ('consentimiento-ghl.html', os.path.getsize(ruta)))
