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
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(200);
await page.locator('[data-demo]').click();
await page.waitForTimeout(1200);
const layout = await page.evaluate(() => {
  const hud = document.querySelector('.hud');
  const right = document.querySelector('.hud-right');
  const full = document.getElementById('btn-full');
  const status = document.getElementById('status-chip');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    fullHidden: full?.hidden,
    hudWidth: hud?.scrollWidth,
    hudClient: hud?.clientWidth,
    rightRect: right?.getBoundingClientRect().toJSON(),
    fullRect: full?.getBoundingClientRect().toJSON(),
    statusRect: status?.getBoundingClientRect().toJSON(),
  };
});
await page.screenshot({ path: 'shots/music-mobile-game.png' });
console.log(JSON.stringify({ layout, bad }, null, 2));
await browser.close();
