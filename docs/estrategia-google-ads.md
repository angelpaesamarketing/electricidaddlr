# Estrategia de Google Ads — Electricidad y Antenas DLR

> Electricista y antenista en Torrevieja, Orihuela Costa, Vega Baja y Mar Menor.
> Objetivo del canal: generar **llamadas y WhatsApps de presupuesto** de clientes de la zona con intención alta.
> Documento de arranque + plan de optimización para los primeros 90 días.

---

## 1. Objetivo y cómo medimos el éxito

El negocio vive de trabajos locales (recarga VE, baja tensión, antenas, solar, domótica, videoporteros). El cliente no compra online: **llama o escribe por WhatsApp**. Por eso la campaña se optimiza a *conversión = contacto cualificado*, no a clics ni a tráfico.

**Conversiones que hay que medir (en orden de valor):**

| Conversión | Cómo se marca | Valor orientativo |
|---|---|---|
| Llamada desde el anuncio (call extension / call-only) | Google Ads call reporting (>60 s) | Principal |
| Llamada al número de la web | Etiqueta de llamadas desde el sitio web | Principal |
| Clic en botón WhatsApp | Evento `clic_whatsapp` vía GA4 / gtag | Principal |
| Envío del formulario | Evento `envio_formulario` | Secundario |
| Clic en "Llamar" (tel:) móvil | Evento `clic_telefono` | Secundario |

KPI de referencia a vigilar: **coste por lead (CPL)**, **% de llamadas >60 s**, y sobre todo el **coste por trabajo cerrado** (lo mide David preguntando a cada cliente "¿cómo nos encontró?").

> Objetivo realista en este sector/zona: CPL de **8–20 €** según servicio, con la recarga VE y las placas solares en la parte alta (ticket mayor, más competencia).

---

## 2. Qué hace falta ANTES de gastar un euro

Esto es lo que más rentabilidad da y casi nadie lo hace. Sin medición, la campaña es a ciegas.

1. **Google Business Profile (Perfil de Empresa)** verificado y optimizado (dirección Avda. Habaneras 71, categorías *Electricista* + *Servicio de instalación de antenas de televisión*). Alimenta tanto el SEO local como las extensiones de ubicación.
2. **Conversiones configuradas:**
   - Importar "Llamadas desde anuncios" y "Llamadas desde la web" (umbral 60 s).
   - GA4 enlazado a Google Ads + eventos `clic_whatsapp`, `clic_telefono`, `envio_formulario` marcados como conversión e importados.
3. **Consent Mode v2** (obligatorio en la UE) + banner de cookies. Sin esto Google no recibe bien los datos de conversión.
4. **Páginas de aterrizaje por servicio** (ver sección 7). Hoy todo apunta a la home; conviene al menos anclas (`/#servicios`) y, en cuanto se pueda, landings dedicadas para recarga VE y solar.
5. **Aviso legal y política de privacidad** publicados (hoy son enlaces vacíos). **Google Ads no aprueba anuncios de sitios sin política de privacidad** cuando hay formulario que recoge datos.

> ⚠️ Punto bloqueante: el formulario pide nombre y teléfono pero el enlace de *Privacidad* está vacío. Hay que publicarlo antes de lanzar o arriesgas rechazo de anuncios.

---

## 3. Estructura de cuenta

Separar por servicio permite controlar presupuesto, pujas y mensaje según el margen y la estacionalidad de cada uno.

```
Cuenta: Electricidad y Antenas DLR
│
├── Campaña 1 · Búsqueda — Electricista urgencias/general   [SIEMPRE ON]
│     ├─ Grupo: Electricista Torrevieja
│     ├─ Grupo: Electricista urgente / averías
│     └─ Grupo: Cuadro eléctrico / boletín (CIE)
│
├── Campaña 2 · Búsqueda — Puntos de recarga VE             [ALTA PRIORIDAD]
│     ├─ Grupo: Instalar punto de recarga / wallbox
│     └─ Grupo: Subvención / instalador VE
│
├── Campaña 3 · Búsqueda — Antenas                          [ESTABLE]
│     ├─ Grupo: Antenista / reparar antena TDT
│     └─ Grupo: Antena colectiva comunidad
│
├── Campaña 4 · Búsqueda — Placas solares                   [TICKET ALTO]
│     ├─ Grupo: Instalar placas solares
│     └─ Grupo: Presupuesto fotovoltaica
│
├── Campaña 5 · Búsqueda — Otros servicios                  [OPCIONAL / escalar luego]
│     ├─ Grupo: Videoportero
│     └─ Grupo: Domótica
│
└── Campaña 6 · Performance Max o GBP/Local                 [FASE 2, tras tener datos]
```

**Arranque recomendado (presupuesto limitado):** empezar solo con **Campañas 1, 2 y 3**. La 4 y 5 cuando haya histórico de conversión. La 6 en fase 2.

---

## 4. Segmentación geográfica, idioma y horario

- **Ubicaciones (radio real de trabajo):** Torrevieja, Orihuela Costa, Orihuela, La Marina, Santa Pola, Guardamar del Segura, Pilar de la Horadada, San Pedro del Pinatar, San Javier, Los Alcázares. Alicante/Elche/Murcia ciudad solo si compensa el desplazamiento.
  - Usar **radio** (p. ej. 20–25 km alrededor de Torrevieja) + añadir municipios sueltos.
  - Config clave: *"Presencia: personas que están o frecuentan tus zonas"* (NO "interés"). Evita clics de gente que solo busca información desde fuera.
- **Idiomas:** Español **e inglés** (mucho residente extranjero en Orihuela Costa/Torrevieja). Conviene un grupo o campaña en inglés más adelante ("electrician Torrevieja", "aerial installer Orihuela Costa").
- **Horario:** priorizar L–V 8:00–20:00 y S 9:00–14:00. La campaña de urgencias puede ir 24/7 con ajuste.
- **Dispositivos:** +puja en móvil (la mayoría de llamadas locales salen del móvil).

---

## 5. Palabras clave por campaña

Concordancia recomendada: arrancar con **concordancia de frase** y **exacta**; evitar amplia pura al principio (quema presupuesto). Usar amplia solo más tarde con Smart Bidding y buen histórico.

### Campaña 1 — Electricista general / urgencias
```
[electricista torrevieja]
"electricista torrevieja"
"electricista orihuela costa"
"electricista urgente torrevieja"
"electricista 24 horas torrevieja"
"electricista a domicilio"
"averia electrica torrevieja"
"boletin electrico torrevieja"        (CIE / certificado)
"instalar cuadro electrico"
"electricista barato torrevieja"
```

### Campaña 2 — Puntos de recarga VE
```
[instalar punto de recarga torrevieja]
"punto de recarga coche electrico"
"instalar wallbox"
"instalador wallbox torrevieja"
"cargador coche electrico casa"
"punto recarga garaje comunidad"
"subvencion punto de recarga"
```

### Campaña 3 — Antenas
```
[antenista torrevieja]
"antenista torrevieja"
"reparar antena tv torrevieja"
"no tengo señal tdt"
"instalar antena parabolica"
"antena colectiva comunidad"
"antenista orihuela costa"
```

### Campaña 4 — Placas solares
```
"instalar placas solares torrevieja"
"presupuesto placas solares"
"paneles solares vivienda torrevieja"
"instalador fotovoltaica costa blanca"
```

### Campaña 5 — Videoportero / domótica
```
"instalar videoportero torrevieja"
"cambiar portero automatico"
"instalador domotica torrevieja"
```

---

## 6. Negativos (imprescindibles desde el día 1)

Lista negativa compartida para toda la cuenta — evita gasto en búsquedas que no son cliente:

```
gratis                 curso            cursos
empleo                 trabajo          ofertas de empleo
sueldo                 salario          autonomo darse de alta
como ser electricista  fp               grado medio
segunda mano           wallanova        amazon
leroy merlin           precio material  comprar cable
que es                 significado      pdf
iberdrola              endesa           dar de alta luz
companía de luz        tarifa luz       bono social
averia iberdrola       corte de luz endesa
```
Y por campaña: en Recarga VE añadir `bicicleta`, `patinete`, `moto`; en Solar añadir `calculadora`, `kit` si atraen curiosos.

> Revisar el **informe de términos de búsqueda** cada 3–4 días el primer mes: de ahí salen los mejores negativos reales.

---

## 7. Páginas de aterrizaje

Regla de oro: el anuncio de *recarga VE* debe llevar a contenido de *recarga VE*, no a la home genérica. Mejora Quality Score (baja el CPC) y la conversión.

- **Corto plazo (ya):** usar anclas existentes — anuncio de antenas → `https://electricidadyantenas.com/#servicios`. No es lo ideal pero sirve para lanzar.
- **Medio plazo (recomendado):** crear landings por servicio en el repo, reutilizando el CSS/JS actual:
  - `recarga-vehiculo-electrico.html`
  - `placas-solares.html`
  - `antenas.html`
  Cada una con: titular con la keyword + zona, teléfono clicable arriba, botón WhatsApp fijo, 3 ventajas, 1 reseña, formulario y FAQ. Ya tenéis todos los componentes en `index.html`.
- **Checklist de toda landing:** teléfono visible sin scroll (ya está ✅), carga <2,5 s (la web es estática y ligera ✅), móvil primero ✅, y **un solo objetivo**: pedir presupuesto.

---

## 8. Anuncios (RSA) — ejemplos listos para pegar

Cada grupo = 1 anuncio responsive de búsqueda (RSA) con ~12 títulos y 4 descripciones. El titular debe repetir la keyword + la zona + la ventaja (presupuesto 24 h gratis).

### Electricista Torrevieja
**Títulos (máx 30 car.):**
- Electricista en Torrevieja
- Presupuesto Gratis en 24 h
- +20 Años en la Costa Blanca
- Instalador Autorizado REBT
- Electricista de Confianza
- Te Atendemos Hoy Mismo
- Averías y Cuadros Eléctricos
- Llámanos: 652 967 349
- Sin Subcontratas
- Boletín / CIE Oficial
- Orihuela Costa y Vega Baja
- Trabajo Limpio y Certificado

**Descripciones (máx 90 car.):**
- Más de 20 años instalando luz en Torrevieja. Presupuesto sin compromiso en 24 h.
- Instalador autorizado. Averías, cuadros, boletines y reformas eléctricas. Llámanos.
- Un solo equipo para instalar, mantener y certificar. Trabajo garantizado.
- ¿Problema eléctrico? Te damos solución rápida en toda la Costa Blanca.

### Puntos de recarga VE
**Títulos:** Instala tu Punto de Recarga · Wallbox para tu Coche Eléctrico · Ayuda con la Subvención · Instalador Autorizado VE · Presupuesto Gratis 24 h · Gestión de Potencia Incluida · Torrevieja y Orihuela Costa
**Descripción:** Instalamos tu wallbox con gestión de carga y te ayudamos con la subvención. Presupuesto gratis.

### Antenas
**Títulos:** Antenista en Torrevieja · ¿Sin Señal en la TDT? · Reparamos tu Antena Hoy · Antenas Colectivas Comunidad · TDT y Satélite · Presupuesto Sin Compromiso
**Descripción:** Instalación y reparación de antenas TDT y satélite. Comunidades y viviendas. Llámanos ya.

### Recursos del anuncio (extensions) — activar TODAS
- **Llamada:** 652 967 349 (lo más importante del sector).
- **Ubicación:** vincular Google Business Profile.
- **Enlaces de sitio:** Puntos de recarga / Antenas / Placas solares / Presupuesto gratis.
- **Textos destacados:** Presupuesto en 24 h · Instalador autorizado · Desde 2003 · Sin subcontratas.
- **Fragmentos estructurados** (Servicios): Recarga VE, Antenas, Domótica, Solar, Videoporteros.
- **Formulario de contacto** (lead form) opcional.

---

## 9. Pujas y presupuesto

**Fase 1 (semanas 1–4) — recoger datos:**
- Estrategia: **Maximizar clics con CPC máx. limitado** (p. ej. 1,20–1,80 €) o Maximizar conversiones si ya hay etiquetas funcionando.
- Objetivo: acumular 15–30 conversiones para que el algoritmo aprenda.

**Fase 2 (a partir de ~30 conversiones):**
- Cambiar a **Maximizar conversiones** y, cuando haya CPL estable, a **CPA objetivo** con el CPL que salga rentable.

**Reparto de presupuesto orientativo (presupuesto total 600 €/mes de ejemplo):**

| Campaña | % | €/mes aprox. |
|---|---|---|
| Electricista general/urgencias | 40 % | 240 € |
| Puntos de recarga VE | 30 % | 180 € |
| Antenas | 20 % | 120 € |
| Placas solares (si se activa) | 10 % | 60 € |

> Con menos presupuesto (p. ej. 300 €/mes), concentrar en **1 campaña** (Electricista Torrevieja), hacerla rentable, y reinvertir las ganancias en abrir las demás. Mejor dominar un servicio que repartir migajas entre cinco.

---

## 10. Calendario de optimización (90 días)

**Semana 1** — Lanzar Campañas 1–3. Revisar a diario que no hay rechazos ni gasto raro.
**Semanas 1–4** — Términos de búsqueda cada 3–4 días → añadir negativos y keywords nuevas. Pausar keywords con gasto y 0 conversiones tras ~20–30 clics.
**Semana 4** — Primer informe: CPL por campaña, % llamadas largas, qué servicio rinde mejor.
**Semanas 5–8** — Pasar a Smart Bidding. Subir presupuesto a lo que convierta. Lanzar Campaña 4 (solar) y versión en inglés para Orihuela Costa.
**Semanas 9–12** — Probar **Performance Max** / campaña Local apoyada en el GBP. Pedir reseñas a clientes (señal clave en local). A/B de landings.

---

## 11. Riesgos y notas

- **Estacionalidad:** aire acondicionado/ventiladores y averías suben en verano; antenas con los temporales; recarga VE todo el año en crecimiento. Ajustar pujas por temporada.
- **Competencia local** por "electricista torrevieja" media-alta → de ahí la importancia de extensiones, reseñas y landings para bajar CPC.
- **No depender solo de la home:** cada euro rinde más con landings por servicio.
- **Mide offline:** pregunta siempre "¿cómo nos encontró?" y apunta qué leads de Ads acaban en trabajo. Es el único dato que dice si Ads es rentable de verdad.

---

### Resumen en una línea
Tres campañas de búsqueda local (electricista, recarga VE, antenas) optimizadas a **llamada/WhatsApp**, con medición de conversiones bien montada, negativos agresivos, extensión de llamada siempre activa y landings por servicio. Empezar pequeño, medir el coste por trabajo cerrado y reinvertir en lo que funcione.
