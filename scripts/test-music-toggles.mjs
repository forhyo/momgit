import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
page.on('pageerror', (e) => bad.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(m.text());
});

await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' }).catch(async () => {
  await page.goto('http://localhost:4174/momgit/?demo=1', { waitUntil: 'networkidle' });
});
await page.evaluate(() => document.fonts.ready);
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(200);
await page.locator('[data-demo]').click();
await page.waitForTimeout(2000);
await page.locator('#btn-back').click();
await page.waitForTimeout(250);
await page.locator('[data-act="ok"]').click();
await page.waitForTimeout(700);

const hubPlaying = await page.evaluate(() => ({
  paused: document.getElementById('bgm-hub')?.paused,
  fullscreen: document.fullscreenElement?.tagName ?? null,
  soundPressed: document.getElementById('btn-sound')?.getAttribute('aria-pressed'),
}));

await page.locator('#btn-sound').click();
await page.waitForTimeout(400);
const allOff = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1')).settings;
  return {
    paused: document.getElementById('bgm-hub')?.paused,
    sound: s.sound,
    music: s.music,
    pressed: document.getElementById('btn-sound')?.getAttribute('aria-pressed'),
  };
});

await page.locator('#btn-sound').click();
await page.waitForTimeout(700);
const allOn = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1')).settings;
  return {
    paused: document.getElementById('bgm-hub')?.paused,
    sound: s.sound,
    music: s.music,
    pressed: document.getElementById('btn-sound')?.getAttribute('aria-pressed'),
    currentTime: Math.round(document.getElementById('bgm-hub')?.currentTime ?? 0),
  };
});

console.log(JSON.stringify({ hubPlaying, allOff, allOn, bad }, null, 2));
await browser.close();
