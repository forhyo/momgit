import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
page.on('pageerror', (e) => bad.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(m.text());
});
await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('[data-players="2"]').click();
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(300);
await page.locator('[data-demo]').click();
await page.waitForTimeout(4200);
await page.screenshot({ path: 'shots/2p-balloon.png' });
console.log(JSON.stringify({ bad }, null, 2));
await browser.close();
