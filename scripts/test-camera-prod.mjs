import { chromium } from 'playwright';

const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 800 },
  permissions: ['camera'],
});
const page = await ctx.newPage();
const bad = [];
page.on('response', (r) => {
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});
page.on('pageerror', (e) => bad.push(`pageerror ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console ${m.text()}`);
});

await page.goto(`${process.env.TEST_URL ?? 'http://localhost:4175/'}?game=ice`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(500);
await page.locator('[data-start]').click();
await page.waitForTimeout(14000);
const state = await page.evaluate(() => ({
  overlayHidden: document.getElementById('stage-overlay')?.hidden,
  title: document.getElementById('stage-card-title')?.textContent,
  status: document.getElementById('status-chip')?.textContent,
  time: document.getElementById('time')?.textContent,
  videoReady: document.getElementById('cam')?.readyState,
}));
await page.screenshot({ path: 'shots/prod-camera.png' });
console.log(JSON.stringify({ state, bad }, null, 2));
await browser.close();
