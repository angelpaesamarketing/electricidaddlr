// Genera los PNG de cada creativo: node campanas/placas-solares/render.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'fuente', 'creativos.html'));
  await p.waitForLoadState('networkidle');
  for (const id of await p.$$eval('.lienzo', els => els.map(e => e.id))) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, `solar-${id}.png`) });
    console.log('ok', id);
  }
  await b.close();
})();
