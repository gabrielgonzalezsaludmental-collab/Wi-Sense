const { chromium } = require('playwright');
const path = require('path');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
(async () => {
  const [,, htmlPath, outPdf, mode, shortTitle = '', dateStr = ''] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const base = { path: outPdf, format: 'A4', printBackground: true };
  if (mode === 'cover') {
    await page.pdf({ ...base, margin: { top: '0', bottom: '0', left: '0', right: '0' }, displayHeaderFooter: false, pageRanges: '1' });
  } else {
    const st = 'font-family:Inter,Arial,sans-serif;font-size:7.8px;color:#5b6472;width:100%;margin:0 20mm;';
    await page.pdf({ ...base,
      margin: { top: '24mm', bottom: '20mm', left: '20mm', right: '20mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="${st}display:flex;justify-content:space-between;border-bottom:1px solid #d7dde8;padding-bottom:3px;"><span>${esc(shortTitle)}</span><span>Confidencial · Documento de trabajo</span></div>`,
      footerTemplate: `<div style="${st}display:flex;justify-content:space-between;"><span>${esc(dateStr)}</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`
    });
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
