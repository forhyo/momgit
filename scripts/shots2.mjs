import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = 'shots';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

async function open(width, height, url) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  return page;
}

const games = ['balloon', 'ice', 'star', 'mole', 'orchard', 'drum'];
for (const id of games) {
  const page = await open(1200, 800, `http://localhost:5173/?game=${id}&start=1`);
  await page.waitForTimeout(3600);
  await page.screenshot({ path: `${OUT}/g-${id}.png` });
  await page.close();
}

// 한 판 끝까지 (30초) → 결과 모달
const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.addInitScript(() => {
  localStorage.setItem(
    'momjit.village.v1',
    JSON.stringify({
      profiles: [
        {
          id: 'test',
          name: '콩이',
          avatar: 'cat',
          plays: {},
          stickers: [2, 5],
          createdAt: Date.now(),
        },
      ],
      activeId: 'test',
      settings: { sound: false, round: 30, demo: true },
      plays: 3,
    }),
  );
});
await page.goto('http://localhost:5173/?game=drum&start=1', { waitUntil: 'networkidle' });
await page.waitForTimeout(34500);
await page.screenshot({ path: `${OUT}/result.png` });
console.log(
  'result open:',
  await page.evaluate(() => document.getElementById('dialog-result')?.open),
);
await page.close();

// 모바일 히어로 + 섹션
const mob = await open(430, 900, 'http://localhost:5173/?demo=1');
await mob.screenshot({ path: `${OUT}/m-hero.png` });
await mob.locator('#games').scrollIntoViewIfNeeded();
await mob.waitForTimeout(300);
await mob.screenshot({ path: `${OUT}/m-games.png` });
await mob.locator('#album').scrollIntoViewIfNeeded();
await mob.waitForTimeout(300);
await mob.screenshot({ path: `${OUT}/m-album.png` });
await mob.close();

console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
