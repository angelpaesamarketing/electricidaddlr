#!/usr/bin/env python3
"""Genera el CSV de las campañas solares para importar en Google Ads Editor.

    python3 google-ads/construir_campanas.py

Comprueba los límites de Google (titulares 30, descripciones 90, rutas 15)
antes de escribir, y aborta si alguno se pasa.
"""
import csv, io, os, sys

URL = 'https://electricidadyantenas.com/placas-solares'
IDIOMAS = 'es;en'

CAMPANAS = [
    {'nombre': 'Solar | Local ES', 'presupuesto': '18.00', 'grupo': 'Placas solares Torrevieja',
     'rutas': ('placas-solares', 'torrevieja'),
     'claves': [('placas solares torrevieja', 'Exact')] + [(k, 'Phrase') for k in [
        'placas solares torrevieja', 'placas solares en torrevieja', 'placas solares orihuela costa',
        'placas solares orihuela', 'placas solares guardamar', 'placas solares rojales',
        'placas solares los montesinos', 'placas solares pilar de la horadada',
        'placas solares san pedro del pinatar', 'instalador placas solares torrevieja',
        'instaladores placas solares orihuela costa', 'empresa placas solares torrevieja',
        'instalar placas solares torrevieja', 'poner placas solares en casa torrevieja',
        'placas solares chalet torrevieja', 'autoconsumo torrevieja', 'fotovoltaica torrevieja',
        'energia solar torrevieja', 'paneles solares torrevieja']],
     'titulares': ['Placas Solares en Torrevieja', 'Instalador Local Autorizado', 'Quien Instala es Quien Viene',
        'Sin Call Center', 'Legalización Incluida', 'Electricistas Desde 2003', 'Te Decimos si Te Compensa',
        'Presupuesto Cerrado', 'Sin Subcontratas', 'Orihuela Costa y Vega Baja', 'Estudio de Tu Factura Real',
        'Tramitamos las Ayudas', 'Instalación en 1 o 2 Días', 'Autoconsumo Llave en Mano', 'Llama al 652 967 349'],
     'fija_titular_1': True,
     'descripciones': [
        'Instalador autorizado de Torrevieja desde 2003. Estudio, instalación y legalización.',
        'Sin call center y sin subcontratas: el que sube a tu tejado te coge el teléfono.',
        'Miramos tu consumo real y te decimos si te compensa. Si no sale, te lo decimos.',
        'Presupuesto cerrado por escrito, con las ayudas de tu municipio ya calculadas.']},
    {'nombre': 'Solar | Comunidades', 'presupuesto': '5.00', 'grupo': 'Autoconsumo colectivo',
     'rutas': ('comunidades', 'autoconsumo'),
     'claves': [(k, 'Phrase') for k in [
        'autoconsumo colectivo', 'autoconsumo colectivo comunidad de propietarios',
        'placas solares comunidad de vecinos', 'placas solares para comunidad de propietarios',
        'placas solares comunidad torrevieja', 'autoconsumo compartido vecinos',
        'placas solares urbanizacion', 'placas solares zonas comunes', 'placas solares para edificio',
        'ahorro luz comunidad de propietarios']],
     'titulares': ['Autoconsumo para Comunidades', 'Placas Solares Comunidad', 'Baja el Recibo Común',
        'Autoconsumo Colectivo', 'Memoria para la Junta', 'Hablamos con tu Administrador',
        'Orihuela Costa y Torrevieja', 'Llama al 652 967 349', 'Instalador Autorizado', 'Desde 2003'],
     'fija_titular_1': False,
     'descripciones': [
        'Preparamos la memoria y el reparto para que la junta lo vote con números.',
        'Zonas comunes, ascensor, bombeo y garaje. Instalador autorizado desde 2003.',
        'Nos sentamos con el administrador de fincas. Sin compromiso para la comunidad.']},
    {'nombre': 'Solar | Postventa', 'presupuesto': '4.00', 'grupo': 'Reparación y legalización',
     'rutas': ('reparacion', 'placas-solares'),
     'claves': [(k, 'Phrase') for k in [
        'reparacion placas solares', 'reparar placas solares', 'mis placas solares no producen',
        'placas solares no producen nada', 'inversor solar no funciona', 'averia inversor solar',
        'error inversor solar', 'mantenimiento placas solares', 'limpieza placas solares',
        'revision instalacion fotovoltaica', 'legalizar placas solares ya instaladas',
        'legalizar instalacion solar', 'ampliar instalacion placas solares',
        'añadir bateria a placas solares', 'cambiar inversor solar']],
     'titulares': ['¿Tus Placas No Producen?', 'Reparación de Placas Solares', 'Revisión de Tu Instalación',
        '¿Te Dejó Tirado el Instalador?', 'Cambio de Inversor', 'Legalizamos lo ya Instalado',
        'Electricista Autorizado', 'Llama al 652 967 349', 'Torrevieja y Vega Baja', 'Desde 2003'],
     'fija_titular_1': False,
     'descripciones': [
        'Revisamos tu instalación, localizamos el fallo y te decimos qué cuesta arreglarlo.',
        '¿La empresa que te la puso ya no existe? Nosotros seguimos aquí, en Torrevieja.',
        '¿Instalación sin legalizar? Tramitamos el registro y la compensación de excedentes.']},
]

NEGATIVAS = '''kit|kit solar|camper|autocaravana|caravana|furgoneta|barco|nautica|12v|24v|portatil|plegable|
placa solar pequeña|riego|bomba de agua solar|caseta|cargador solar|power station|comprar|precio kit|
cuanto cuesta|cuanto cuestan|precio placas solares|amazon|aliexpress|temu|leroy merlin|bricodepot|ikea|
segunda mano|wallapop|milanuncios|curso|cursos|fp|grado medio|formacion|certificado instalador|empleo|
trabajo|ofertas de empleo|sueldo|autonomo|como instalar|como funciona|como se instalan|que es|tipos de|
esquema|calculo|simulador|calculadora|pdf|tutorial|youtube|opiniones|estafa|timo|denuncia|problemas|
quitar|desinstalar|retirar|subvencion|subvenciones|ayudas|bono|gratis|alquiler placas solares|
renting solar|sin inversion|financiacion|huerto solar|parque solar|planta fotovoltaica|agrovoltaica|
nave industrial|placas solares termicas|agua caliente solar|termo solar|aerotermia|bateria virtual|
tarifa solar|comercializadora|repsol|endesa|iberdrola|naturgy|holaluz|sotysolar|otovo|svea solar|
powen|plenitude|madrid|barcelona|valencia'''
NEGATIVAS = [n.strip() for n in NEGATIVAS.replace('\n', '').split('|') if n.strip()]
# en Postventa "problemas", "quitar" o "retirar" pueden ser clientes; ahí no se excluyen
NO_EN_POSTVENTA = {'problemas', 'quitar', 'retirar', 'desinstalar'}

# ---------- comprobaciones de longitud ----------
errores = []
for c in CAMPANAS:
    for t in c['titulares']:
        if len(t) > 30: errores.append('%s · titular de %d: %s' % (c['nombre'], len(t), t))
    for d in c['descripciones']:
        if len(d) > 90: errores.append('%s · descripción de %d: %s' % (c['nombre'], len(d), d))
    for r in c['rutas']:
        if len(r) > 15: errores.append('%s · ruta de %d: %s' % (c['nombre'], len(r), r))
    if not 3 <= len(c['titulares']) <= 15: errores.append(c['nombre'] + ' · nº de titulares')
    if not 2 <= len(c['descripciones']) <= 4: errores.append(c['nombre'] + ' · nº de descripciones')
if errores:
    sys.exit('ERRORES:\n' + '\n'.join(errores))

# ---------- CSV para Google Ads Editor ----------
COLS = (['Campaign', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Bid Strategy Type',
         'Languages', 'Campaign Status', 'Ad Group', 'Ad Group Status', 'Keyword', 'Criterion Type',
         'Status', 'Ad type', 'Final URL', 'Path 1', 'Path 2'] +
        ['Headline %d' % i for i in range(1, 16)] + ['Headline 1 position'] +
        ['Description %d' % i for i in range(1, 5)])
filas = []
def fila(**k): filas.append({c: k.get(c, '') for c in COLS})
for c in CAMPANAS:
    fila(**{'Campaign': c['nombre'], 'Campaign Type': 'Search', 'Networks': 'Google search',
            'Budget': c['presupuesto'], 'Budget type': 'Daily', 'Bid Strategy Type': 'Maximize clicks',
            'Languages': IDIOMAS, 'Campaign Status': 'Paused'})
    fila(**{'Campaign': c['nombre'], 'Ad Group': c['grupo'], 'Ad Group Status': 'Enabled'})
    for k, tipo in c['claves']:
        fila(**{'Campaign': c['nombre'], 'Ad Group': c['grupo'], 'Keyword': k, 'Criterion Type': tipo,
                'Status': 'Enabled'})
    anuncio = {'Campaign': c['nombre'], 'Ad Group': c['grupo'], 'Ad type': 'Responsive search ad',
               'Status': 'Enabled', 'Final URL': URL, 'Path 1': c['rutas'][0], 'Path 2': c['rutas'][1]}
    for i, t in enumerate(c['titulares'], 1): anuncio['Headline %d' % i] = t
    for i, d in enumerate(c['descripciones'], 1): anuncio['Description %d' % i] = d
    if c['fija_titular_1']: anuncio['Headline 1 position'] = '1'
    fila(**anuncio)
    for n in NEGATIVAS:
        if c['nombre'].endswith('Postventa') and n in NO_EN_POSTVENTA: continue
        fila(**{'Campaign': c['nombre'], 'Keyword': n, 'Criterion Type': 'Negative Broad'})

dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'campanas-solar-editor.csv')
with io.open(dst, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(filas)

n_claves = sum(len(c['claves']) for c in CAMPANAS)
print('escrito %s' % dst)
print('campañas: %d · grupos: %d · palabras clave: %d · anuncios: %d · negativas por campaña: %d (Postventa %d)'
      % (len(CAMPANAS), len(CAMPANAS), n_claves, len(CAMPANAS), len(NEGATIVAS),
         len([n for n in NEGATIVAS if n not in NO_EN_POSTVENTA])))
print('presupuesto total: %.2f €/día' % sum(float(c['presupuesto']) for c in CAMPANAS))
