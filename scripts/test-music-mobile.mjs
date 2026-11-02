import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const bad = [];
page.on('pageerror', (e) => bad.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(m.text());
});
await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('#btn-settings').click();
await page.waitForTimeout(300);
const overflow = await page.evaluate(() => {
  const dlg = document.getElementById('dialog-settings');
  const card = dlg?.querySelector('.modal-card');
  return {
    viewport: innerWidth,
    doc: document.documentElement.scrollWidth,
    card: card?.scrollWidth,
    cardClient: card?.clientWidth,
  };
});
await page.screenshot({ path: 'shots/settings-music-mobile.png' });
console.log(JSON.stringify({ overflow, bad }, null, 2));
await browser.close();
