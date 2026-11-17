# Bloques para GoHighLevel

La web publicada (electricidadyantenas.com) vive en GoHighLevel: cada página es un
elemento Custom Code con todo dentro (CSS, JS e imágenes en base64).

    ghl/src/    fuente editable; las imágenes van como {{IMG:ruta}} (relativa a assets/img/)
    ghl/dist/   bloques listos para pegar (generados, no editar)
    ghl/montar.py

    python3 ghl/montar.py

`src/` se recuperó de la web publicada el 17-11-2026, no del generador original
(`ghl/construir.py`, que no está en este repo). Si aparece ese original, hay que
llevar a él los cambios de SEO hechos aquí.

## Qué pegar y dónde

| Página GHL        | Elemento                               | Archivo                         |
|-------------------|----------------------------------------|---------------------------------|
| `/home`           | Custom Code único                      | `dist/home.html`                |
| `/placas-solares` | Custom Code de arriba (sobre el form)  | `dist/placas-solares-1.html`    |
| `/placas-solares` | Custom Code de abajo (bajo el form)    | `dist/placas-solares-2.html`    |

## Ajustes SEO de cada página en GHL (no van en el bloque)

Hoy las dos páginas se publican sin `<title>` ni meta descripción.

**/home**
- Título: `Electricistas y antenistas en Torrevieja | Electricidad y Antenas DLR`
- Descripción: `Electricistas y antenistas en Torrevieja y Orihuela Costa desde 2003. Instalaciones eléctricas, antenas TDT y satélite, puntos de recarga y placas solares. Presupuesto gratis en 24 h.`
- Idioma: español (ahora sale `lang="en"`).

**/placas-solares**
- Título: `Placas solares en Torrevieja y Orihuela Costa | Electricidad y Antenas DLR`
- Descripción: `Instalación de placas solares en Torrevieja, Orihuela Costa y la Vega Baja. Instalador autorizado desde 2003: estudio real, legalización incluida y sin subcontratas. Te decimos si te compensa.`

**Sitio**
- Favicon propio (ahora sale el de GHL).
- Generar el sitemap XML (ahora `/sitemap.xml` está vacío) y enviarlo en Search Console.
- En `home.html` siguen los IDs de ejemplo `G-XXXXXXXXXX` / `AW-XXXXXXXXXX`: sin los reales no se mide nada.
