import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
page.on('response', (r) => {
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});
page.on('pageerror', (e) => bad.push(`pageerror ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console ${m.text()}`);
});

await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// 설정 화면
await page.locator('#btn-settings').click();
await page.waitForTimeout(300);
const settingsUI = await page.evaluate(() => ({
  music: document.querySelector('#sw-music')?.getAttribute('aria-checked'),
  volume: document.querySelector('#vol-music')?.value,
  sliderOut: document.querySelector('#vol-out')?.textContent,
}));
await page.screenshot({ path: 'shots/settings-music.png' });
await page.locator('#dialog-settings [data-close]').click();
await page.waitForTimeout(300);

// 30초로 바꾸고 풍선 데모 시작
await page.locator('#btn-settings').click();
await page.waitForTimeout(200);
await page.locator('[data-sec="30"]').click();
await page.locator('#vol-music').fill('40');
await page.locator('#vol-music').dispatchEvent('input');
await page.waitForTimeout(200);
await page.locator('#dialog-settings [data-close]').click();
await page.waitForTimeout(200);

await page.locator('[data-players="1"]').click();
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(200);
await page.locator('[data-demo]').click();
await page.waitForTimeout(4500);

const playing = await page.evaluate(() => {
  const a = document.getElementById('bgm-game');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    paused: a?.paused,
    currentTime: a ? Math.round(a.currentTime) : null,
    volume: a?.volume,
    stageHidden: document.getElementById('stage')?.hidden,
    time: document.getElementById('time')?.textContent,
    stored: JSON.parse(localStorage.getItem('momjit.village.v1')).settings,
  };
});
await page.screenshot({ path: 'shots/music-playing.png' });

console.log(JSON.stringify({ settingsUI, playing, bad }, null, 2));
await browser.close();
