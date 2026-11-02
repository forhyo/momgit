import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = 'shots';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

async function open(width, height, url = 'http://localhost:5173/?demo=1') {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  return page;
}

const desk = await open(1440, 1000);
await desk.screenshot({ path: `${OUT}/hub-desktop.png`, fullPage: true });

await desk.locator('[data-game="balloon"]').click();
await desk.waitForTimeout(450);
await desk.screenshot({ path: `${OUT}/modal-game.png` });

await desk.keyboard.press('Escape');
await desk.locator('#btn-settings').click();
await desk.waitForTimeout(300);
await desk.screenshot({ path: `${OUT}/modal-settings.png` });
await desk.keyboard.press('Escape');

await desk.locator('#btn-guide').click();
await desk.waitForTimeout(300);
await desk.screenshot({ path: `${OUT}/modal-guide.png` });
await desk.keyboard.press('Escape');

// 데모 놀이 시작
await desk.locator('[data-game="balloon"]').click();
await desk.locator('[data-demo]').click();
await desk.waitForTimeout(4200);
await desk.screenshot({ path: `${OUT}/game-balloon.png` });
await desk.waitForTimeout(1600);
await desk.screenshot({ path: `${OUT}/game-balloon-2.png` });
await desk.locator('#btn-back').click();
await desk.waitForTimeout(300);
await desk.locator('[data-act="ok"]').click();
await desk.waitForTimeout(500);

const mob = await open(430, 900);
await mob.screenshot({ path: `${OUT}/hub-mobile.png`, fullPage: true });
await mob.locator('[data-game="star"]').click();
await mob.waitForTimeout(400);
await mob.screenshot({ path: `${OUT}/modal-game-mobile.png` });
await mob.locator('[data-demo]').click();
await mob.waitForTimeout(4200);
await mob.screenshot({ path: `${OUT}/game-star-mobile.png` });

console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
