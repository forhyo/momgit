import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
const audio = [];
page.on('response', (r) => {
  if (r.url().includes('.mp3')) audio.push({ status: r.status(), file: r.url().split('/').pop() });
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
      profiles: [{ id: 'two', name: '두곡', avatar: 'cat', plays, stickers: [], createdAt: Date.now() }],
      activeId: 'two',
      settings: { sound: true, music: true, musicVolume: 30, round: 30, demo: false },
      plays: 0,
    }),
  );
});

const base = process.env.BASE_URL ?? 'http://localhost:5173/';
await page.goto(`${base}?demo=1`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(900);

const afterLoad = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  hubSrc: document.getElementById('bgm-hub')?.getAttribute('src'),
  gameSrc: document.getElementById('bgm-game')?.getAttribute('src'),
}));

// 첫 터치로 허브 음악을 시작한다.
await page.locator('.brand').click();
await page.waitForTimeout(900);
const hub = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  hubTime: Math.round(document.getElementById('bgm-hub')?.currentTime ?? 0),
  gamePaused: document.getElementById('bgm-game')?.paused,
}));

await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(250);
await page.locator('[data-demo]').click();
await page.waitForTimeout(1400);
const game = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  gameTime: Math.round(document.getElementById('bgm-game')?.currentTime ?? 0),
  fullscreen: document.fullscreenElement?.tagName ?? null,
}));

await page.locator('#btn-back').click();
await page.waitForTimeout(250);
await page.locator('[data-act="ok"]').click();
await page.waitForTimeout(1000);
const backToHub = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  fullscreen: document.fullscreenElement?.tagName ?? null,
}));

await page.locator('#btn-sound').click();
await page.waitForTimeout(300);
const soundOff = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
  settings: JSON.parse(localStorage.getItem('momjit.village.v1')).settings,
}));
await page.locator('#btn-sound').click();
await page.waitForTimeout(800);
const soundOn = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
}));

await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
await page.waitForTimeout(200);
const leaving = await page.evaluate(() => ({
  hubPaused: document.getElementById('bgm-hub')?.paused,
  gamePaused: document.getElementById('bgm-game')?.paused,
}));

console.log(JSON.stringify({ afterLoad, hub, game, backToHub, soundOff, soundOn, leaving, audio, bad }, null, 2));
await browser.close();
