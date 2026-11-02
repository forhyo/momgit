import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const logs = [];
page.on('response', (r) => {
  if (r.status() >= 400) logs.push(`${r.status()} ${r.url()}`);
});
page.on('pageerror', (e) => logs.push(`pageerror ${e.message}`));
page.on('console', (m) => logs.push(`console.${m.type()} ${m.text()}`));

await page.goto('http://localhost:4173/momjit/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const info = await page.evaluate(() => ({
  ready: document.readyState,
  cards: document.querySelectorAll('[data-game]').length,
  gameGrid: document.getElementById('game-grid')?.innerHTML.length,
  bodyClass: document.body.className,
  stage: document.getElementById('stage')?.hidden,
  scripts: [...document.scripts].map((s) => s.src),
}));
await page.screenshot({ path: 'shots/prod-debug.png' });
console.log(JSON.stringify({ info, logs }, null, 2));
await browser.close();
