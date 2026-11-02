import { chromium } from 'playwright';

const url = 'http://localhost:4174/momgit/?demo=1';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
const audioResponses = [];
page.on('response', (r) => {
  if (r.url().includes('caketown')) audioResponses.push({ status: r.status(), url: r.url() });
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});
page.on('pageerror', (e) => bad.push(`pageerror ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console ${m.text()}`);
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(200);
await page.locator('[data-demo]').click();
await page.waitForTimeout(3500);
const state = await page.evaluate(() => {
  const a = document.getElementById('bgm');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    paused: a?.paused,
    currentTime: a ? Math.round(a.currentTime) : null,
    src: a?.getAttribute('src'),
    resolved: a?.currentSrc,
    stageHidden: document.getElementById('stage')?.hidden,
    time: document.getElementById('time')?.textContent,
  };
});
await page.screenshot({ path: 'shots/prod-subpath-game.png' });
console.log(JSON.stringify({ state, audioResponses, bad }, null, 2));
await browser.close();
