import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const base = process.env.BASE_URL ?? 'http://localhost:5173/';
await page.goto(`${base}?demo=1`, { waitUntil: 'networkidle' });
await page.locator('.brand').click();
await page.waitForTimeout(800);
const before = await page.evaluate(() => document.getElementById('bgm-hub')?.paused);

const hidden = await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
  return document.getElementById('bgm-hub')?.paused;
});
await page.waitForTimeout(200);
const hiddenAfter = await page.evaluate(() => document.getElementById('bgm-hub')?.paused);

const visible = await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  document.dispatchEvent(new Event('visibilitychange'));
  return document.getElementById('bgm-hub')?.paused;
});
await page.waitForTimeout(700);
const visibleAfter = await page.evaluate(() => ({
  paused: document.getElementById('bgm-hub')?.paused,
  time: Math.round(document.getElementById('bgm-hub')?.currentTime ?? 0),
}));

console.log(JSON.stringify({ before, hidden, hiddenAfter, visible, visibleAfter }, null, 2));
await browser.close();
