import { chromium } from 'playwright';

const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});

// 1) 카메라 허용 + 가짜 장치
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 800 },
  permissions: ['camera'],
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await page.goto('http://localhost:5173/?game=balloon', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.locator('[data-start]').click();
await page.waitForTimeout(12000);
const camState = await page.evaluate(() => ({
  overlayHidden: document.getElementById('stage-overlay')?.hidden,
  overlayTitle: document.getElementById('stage-card-title')?.textContent,
  status: document.getElementById('status-chip')?.textContent,
  countdownHidden: document.getElementById('countdown')?.hidden,
  videoReady: (document.getElementById('cam'))?.readyState,
  videoW: (document.getElementById('cam'))?.videoWidth,
  time: document.getElementById('time')?.textContent,
}));
await page.screenshot({ path: 'shots/camera-live.png' });
await page.locator('#btn-back').click();
await page.waitForTimeout(300);
const confirmOpen = await page.evaluate(() => document.getElementById('dialog-confirm')?.open);
if (confirmOpen) {
  await page.locator('[data-act="ok"]').click();
  await page.waitForTimeout(400);
}
const backHome = await page.evaluate(() => ({
  stageHidden: document.getElementById('stage')?.hidden,
  videoSrc: Boolean(document.getElementById('cam')?.srcObject),
}));
await ctx.close();

// 2) 권한 거부 → 대체 안내
const ctx2 = await browser.newContext({ viewport: { width: 1200, height: 800 } });
await ctx2.clearPermissions();
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:5173/?game=ice', { waitUntil: 'networkidle' });
await p2.waitForTimeout(300);
await p2.locator('[data-start]').click();
await p2.waitForTimeout(2500);
const denied = await p2.evaluate(() => ({
  overlayHidden: document.getElementById('stage-overlay')?.hidden,
  title: document.getElementById('stage-card-title')?.textContent,
  actions: [...document.querySelectorAll('#stage-card-actions button')].map((b) => b.textContent),
}));
await p2.screenshot({ path: 'shots/camera-denied.png' });
await ctx2.close();

console.log(JSON.stringify({ camState, backHome, denied, errors }, null, 2));
await browser.close();
