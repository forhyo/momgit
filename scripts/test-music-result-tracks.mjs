import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
page.on('pageerror', (e) => bad.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(m.text());
});

await page.addInitScript(() => {
  const plays = Object.fromEntries(
    ['balloon', 'ice', 'star', 'mole', 'orchard', 'drum'].map((id) => [id, { best: 0, plays: 0, last: 0 }]),
  );
  localStorage.setItem(
    'momjit.village.v1',
    JSON.stringify({
      profiles: [{ id: 'result', name: '결과', avatar: 'cat', plays, stickers: [], createdAt: Date.now() }],
      activeId: 'result',
      settings: { sound: true, music: true, musicVolume: 30, round: 30, demo: false },
      plays: 0,
    }),
  );
});

const base = process.env.BASE_URL ?? 'http://localhost:5173/';
await page.goto(`${base}?demo=1`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('.brand').click();
await page.waitForTimeout(700);
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(200);
await page.locator('[data-demo]').click();
await page.waitForTimeout(2500);

const during = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  fullscreen: document.fullscreenElement?.tagName ?? null,
}));

await page.waitForSelector('#dialog-result[open]', { timeout: 38000 });
await page.waitForTimeout(500);
const result = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  fullscreen: document.fullscreenElement?.tagName ?? null,
  resultOpen: document.getElementById('dialog-result')?.open,
}));

await page.locator('[data-act="again"]').click();
await page.waitForTimeout(1400);
const again = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  fullscreen: document.fullscreenElement?.tagName ?? null,
  stageHidden: document.getElementById('stage')?.hidden,
  resultOpen: document.getElementById('dialog-result')?.open,
}));

await page.locator('#btn-back').click();
await page.waitForTimeout(250);
await page.locator('[data-act="ok"]').click();
await page.waitForTimeout(1200);
const back = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  fullscreen: document.fullscreenElement?.tagName ?? null,
}));

console.log(JSON.stringify({ during, result, again, back, bad }, null, 2));
await browser.close();
