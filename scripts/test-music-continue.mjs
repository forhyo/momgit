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

await page.addInitScript(() => {
  const plays = Object.fromEntries(
    ['balloon', 'ice', 'star', 'mole', 'orchard', 'drum'].map((id) => [id, { best: 0, plays: 0, last: 0 }]),
  );
  localStorage.setItem(
    'momjit.village.v1',
    JSON.stringify({
      profiles: [{ id: 'music', name: '음악이', avatar: 'cat', plays, stickers: [], createdAt: Date.now() }],
      activeId: 'music',
      settings: { sound: true, music: true, musicVolume: 40, round: 30, demo: false },
      plays: 0,
    }),
  );
});

await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(200);
await page.locator('[data-demo]').click();
await page.waitForTimeout(4000);

const before = await page.evaluate(() => {
  const a = document.getElementById('bgm');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    paused: a?.paused,
    currentTime: a ? Math.round(a.currentTime) : null,
    stageHidden: document.getElementById('stage')?.hidden,
  };
});

await page.waitForSelector('#dialog-result[open]', { timeout: 38000 });
await page.waitForTimeout(500);
const afterFinish = await page.evaluate(() => {
  const a = document.getElementById('bgm');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    paused: a?.paused,
    currentTime: a ? Math.round(a.currentTime) : null,
    stageHidden: document.getElementById('stage')?.hidden,
    resultOpen: document.getElementById('dialog-result')?.open,
  };
});

await page.locator('[data-act="again"]').click();
await page.waitForTimeout(1200);
const afterAgain = await page.evaluate(() => {
  const a = document.getElementById('bgm');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    paused: a?.paused,
    stageHidden: document.getElementById('stage')?.hidden,
    resultOpen: document.getElementById('dialog-result')?.open,
    time: document.getElementById('time')?.textContent,
  };
});

await page.locator('#btn-back').click();
await page.waitForTimeout(250);
await page.locator('[data-act="ok"]').click();
await page.waitForTimeout(700);
const afterExit = await page.evaluate(() => {
  const a = document.getElementById('bgm');
  return {
    fullscreen: document.fullscreenElement?.tagName ?? null,
    paused: a?.paused,
    currentTime: a ? Math.round(a.currentTime) : null,
    stageHidden: document.getElementById('stage')?.hidden,
  };
});

console.log(JSON.stringify({ before, afterFinish, afterAgain, afterExit, bad }, null, 2));
await browser.close();
