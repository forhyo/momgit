import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../public/og.png', import.meta.url));
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({
  content: '.privacy-note{display:none!important}.hero{padding-bottom:8px!important}',
});
await page.waitForTimeout(400);
await page.screenshot({ path: out });
await browser.close();
console.log('og.png written:', out);
