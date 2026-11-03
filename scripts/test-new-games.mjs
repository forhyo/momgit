import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173/';
const OUT = 'shots/new';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const bad = [];
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on('pageerror', (e) => bad.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console: ${m.text()}`);
});
await page.goto(`${BASE}?demo=1`, { waitUntil: 'networkidle' });

const logic = await page.evaluate(async () => {
  const { ShadowGame } = await import('/src/game/shadow.ts');
  const shadow = new ShadowGame(1, 60, 1200, 800);
  const target = shadow.targets[0];
  const hands = [
    { hand: 15, player: 0, ...shadow.point(0, target, 0) },
    { hand: 16, player: 0, ...shadow.point(0, target, 1) },
  ];
  for (let i = 0; i < 24; i++) shadow.update(0.05, hands);
  const shadowResult = {
    score: shadow.scores[0],
    level: shadow.levels[0],
    targetChanged: shadow.targets[0] !== target,
    hold: shadow.hold[0],
  };

  const { BrushGame } = await import('/src/game/brush.ts');
  const brush = new BrushGame(1, 60, 1200, 800);
  const points = brush.screenPoints(0);
  let maxProgress = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    brush.update(0.03, [{ hand: 15, player: 0, x: p.x, y: p.y }]);
    maxProgress = Math.max(maxProgress, brush.progress[0]);
  }
  // 완성 직후의 보상/딜레이를 조금 더 진행한다.
  for (let i = 0; i < 12; i++) {
    brush.update(0.05, [{ hand: 15, player: 0, x: points.at(-1).x, y: points.at(-1).y }]);
  }
  const brushResult = {
    score: brush.scores[0],
    level: brush.levels[0],
    completed: brush.completed[0],
    maxProgress,
    picture: brush.picture[0],
  };

  const two = new BrushGame(2, 60, 1200, 800);
  const paths = [two.screenPoints(0), two.screenPoints(1)];
  const count = Math.max(paths[0].length, paths[1].length);
  for (let i = 0; i < count; i++) {
    const a = paths[0][Math.min(i, paths[0].length - 1)];
    const b = paths[1][Math.min(i, paths[1].length - 1)];
    two.update(0.03, [
      { hand: 15, player: 0, x: a.x, y: a.y },
      { hand: 15, player: 1, x: b.x, y: b.y },
    ]);
  }

  return {
    shadow: shadowResult,
    brush: brushResult,
    twoPlayer: { scores: two.scores, progress: two.progress, completed: two.completed },
  };
});

// 그림자 극장 데모 화면
const shadowShot = await browser.newPage({ viewport: { width: 1200, height: 800 } });
shadowShot.on('pageerror', (e) => bad.push(`shadow pageerror: ${e.message}`));
await shadowShot.goto(`${BASE}?game=shadow&start=1`, { waitUntil: 'networkidle' });
await shadowShot.waitForTimeout(4300);
const shadowTargets = [
  { x: 382, y: 243 },
  { x: 196, y: 396 },
  { x: 513, y: 222 },
  { x: 360, y: 570 },
  { x: 469, y: 412 },
];
for (const p of shadowTargets) {
  await shadowShot.mouse.move(p.x, p.y);
  await shadowShot.waitForTimeout(1100);
}
const shadowScore = await shadowShot.locator('#scores strong').first().textContent();
await shadowShot.mouse.move(382, 243);
await shadowShot.waitForTimeout(350);
await shadowShot.screenshot({ path: `${OUT}/shadow-demo.png` });
await shadowShot.close();

// 무지개 붓 데모 화면 (무지개 경로를 따라가 본다)
const brushShot = await browser.newPage({ viewport: { width: 1200, height: 800 } });
brushShot.on('pageerror', (e) => bad.push(`brush pageerror: ${e.message}`));
await brushShot.goto(`${BASE}?game=brush&start=1`, { waitUntil: 'networkidle' });
await brushShot.waitForTimeout(4300);
const field = { x: 54, y: 148, w: 1092, h: 528 };
const at = (t) => ({
  x: field.x + field.w * (0.1 + t * 0.8),
  y: field.y + field.h * (0.76 - Math.sin(Math.PI * t) * 0.44),
});
const start = at(0);
await brushShot.mouse.move(start.x, start.y);
await brushShot.waitForTimeout(150);
for (let i = 1; i <= 30; i++) {
  const p = at(i / 30);
  await brushShot.mouse.move(p.x, p.y);
  await brushShot.waitForTimeout(55);
}
await brushShot.screenshot({ path: `${OUT}/brush-demo.png` });
await brushShot.close();

// 허브 카드 8개
const hub = await browser.newPage({ viewport: { width: 1200, height: 900 } });
hub.on('pageerror', (e) => bad.push(`hub pageerror: ${e.message}`));
await hub.goto(`${BASE}?demo=1`, { waitUntil: 'networkidle' });
await hub.evaluate(() => document.fonts.ready);
await hub.locator('#games').scrollIntoViewIfNeeded();
await hub.waitForTimeout(500);
await hub.screenshot({ path: `${OUT}/hub-games.png` });
const cards = await hub.locator('[data-game]').count();
await hub.locator('[data-game="shadow"]').scrollIntoViewIfNeeded();
await hub.waitForTimeout(250);
await hub.locator('[data-game="shadow"]').screenshot({ path: `${OUT}/card-shadow.png` });
await hub.locator('[data-game="brush"]').screenshot({ path: `${OUT}/card-brush.png` });
await hub.close();

// 모바일 화면
const mobile = await browser.newPage({ viewport: { width: 430, height: 900 } });
mobile.on('pageerror', (e) => bad.push(`mobile pageerror: ${e.message}`));
await mobile.goto(`${BASE}?game=shadow&start=1`, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(4300);
await mobile.mouse.move(150, 270);
await mobile.waitForTimeout(300);
await mobile.screenshot({ path: `${OUT}/shadow-mobile.png` });
await mobile.close();

const mobileBrush = await browser.newPage({ viewport: { width: 430, height: 900 } });
mobileBrush.on('pageerror', (e) => bad.push(`mobile brush pageerror: ${e.message}`));
await mobileBrush.goto(`${BASE}?game=brush&start=1`, { waitUntil: 'networkidle' });
await mobileBrush.waitForTimeout(4300);
await mobileBrush.mouse.move(120, 600);
await mobileBrush.waitForTimeout(300);
await mobileBrush.screenshot({ path: `${OUT}/brush-mobile.png` });
await mobileBrush.close();

// 2P 그림자 극장 (왼쪽 플레이어만 데모 조작)
const twoP = await browser.newPage({ viewport: { width: 1200, height: 800 } });
twoP.on('pageerror', (e) => bad.push(`2p pageerror: ${e.message}`));
await twoP.goto(`${BASE}?demo=1`, { waitUntil: 'networkidle' });
await twoP.locator('[data-players="2"]').first().click();
await twoP.locator('[data-game="shadow"]').click();
await twoP.locator('[data-demo]').click();
await twoP.waitForTimeout(4300);
await twoP.mouse.move(256, 222);
await twoP.waitForTimeout(900);
await twoP.screenshot({ path: `${OUT}/shadow-2p.png` });
const twoPScore = await twoP.locator('#scores strong').allTextContents();
await twoP.close();

// 2P 무지개 붓 (서로 다른 그림이 좌우에 놓인다)
const twoPBrush = await browser.newPage({ viewport: { width: 1200, height: 800 } });
twoPBrush.on('pageerror', (e) => bad.push(`2p brush pageerror: ${e.message}`));
await twoPBrush.goto(`${BASE}?demo=1`, { waitUntil: 'networkidle' });
await twoPBrush.locator('[data-players="2"]').first().click();
await twoPBrush.locator('[data-game="brush"]').click();
await twoPBrush.locator('[data-demo]').click();
await twoPBrush.waitForTimeout(4300);
await twoPBrush.mouse.move(100, 550);
await twoPBrush.waitForTimeout(300);
await twoPBrush.screenshot({ path: `${OUT}/brush-2p.png` });
await twoPBrush.close();

// 놀이 소개 모달 (새 조작 아이콘 확인)
for (const id of ['shadow', 'brush']) {
  const modal = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  modal.on('pageerror', (e) => bad.push(`${id} modal pageerror: ${e.message}`));
  await modal.goto(`${BASE}?game=${id}`, { waitUntil: 'networkidle' });
  await modal.waitForTimeout(700);
  await modal.screenshot({ path: `${OUT}/modal-${id}.png` });
  await modal.close();
}

console.log(JSON.stringify({ logic, cards, shadowScore, twoPScore, bad }, null, 2));
await browser.close();
