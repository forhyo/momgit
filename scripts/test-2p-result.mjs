import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

await page.addInitScript(() => {
  localStorage.setItem(
    'momjit.village.v1',
    JSON.stringify({
      profiles: [
        {
          id: 'test',
          name: '콩이',
          avatar: 'cat',
          plays: Object.fromEntries(
            ['balloon', 'ice', 'star', 'mole', 'orchard', 'drum'].map((id) => [
              id,
              { best: 0, plays: 0, last: 0 },
            ]),
          ),
          stickers: [],
          createdAt: Date.now(),
        },
      ],
      activeId: 'test',
      settings: { sound: false, round: 30, demo: true },
      plays: 0,
    }),
  );
});

await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('[data-players="2"]').click();
await page.locator('[data-game="drum"]').click();
await page.waitForTimeout(300);
await page.locator('[data-demo]').click();
await page.waitForTimeout(2000);

// 양쪽에서 적당히 흔들어 점수를 만든다
const box = await page.locator('#canvas').boundingBox();
for (let i = 0; i < 150; i++) {
  const x = box.x + 100 + ((i * 173) % (box.width - 200));
  const y = box.y + box.height * 0.62 + ((i % 3) - 1) * 30;
  await page.mouse.move(x, y);
  await page.waitForTimeout(110);
}

await page.waitForSelector('#dialog-result[open]', { timeout: 15000 }).catch(() => undefined);
await page.waitForTimeout(500);
const result = await page.evaluate(() => {
  const d = document.getElementById('dialog-result');
  return {
    open: d?.open,
    text: d?.textContent?.replace(/\s+/g, ' ').slice(0, 320),
    stars: d?.querySelectorAll('.result-star.on').length,
  };
});
await page.screenshot({ path: 'shots/result-2p.png' });
const stored = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1'));
  const p = s.profiles.find((x) => x.id === s.activeId);
  return { stickers: p.stickers.length, drumPlays: p.plays.drum?.plays ?? null, totalPlays: s.plays };
});

console.log(JSON.stringify({ result, stored, errors }, null, 2));
await browser.close();
