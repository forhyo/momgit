import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

// 2인 대결
const p2 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
p2.on('pageerror', (e) => errors.push(`p2: ${e.message}`));
await p2.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await p2.evaluate(() => document.fonts.ready);
await p2.locator('[data-players="2"]').click();
await p2.locator('[data-game="ice"]').click();
await p2.waitForTimeout(300);
await p2.locator('[data-demo]').click();
await p2.waitForTimeout(4200);
await p2.screenshot({ path: 'shots/2p-ice.png' });
await p2.close();

// 도움말 / 개인정보
for (const page of ['help', 'privacy']) {
  const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  p.on('pageerror', (e) => errors.push(`${page}: ${e.message}`));
  await p.goto(`http://localhost:5173/${page}.html`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `shots/page-${page}.png`, fullPage: true });
  await p.close();
}

// OG 후보
const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await og.evaluate(() => document.fonts.ready);
await og.waitForTimeout(500);
await og.screenshot({ path: 'shots/og-candidate.png' });
await og.close();

console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
