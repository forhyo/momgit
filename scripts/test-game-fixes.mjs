import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const bad = [];
page.on('pageerror', (e) => bad.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(m.text());
});
const base = process.env.BASE_URL ?? 'http://localhost:5173/';
await page.goto(`${base}?demo=1`, { waitUntil: 'networkidle' });

const result = await page.evaluate(async () => {
  const { StarGame } = await import('/src/game/star.ts');
  const star = new StarGame(1, 60, 1200, 800);
  const initial = star.stars.map((s) => ({ zone: s.zone, x: Math.round(s.x), y: Math.round(s.y) }));
  const others = star.stars.slice(1).map((s) => ({ zone: s.zone, x: s.x, y: s.y }));
  const moves = [];
  let previous = star.stars[0].zone;
  for (let i = 0; i < 8; i++) {
    star.respawn(star.stars[0]);
    moves.push(star.stars[0].zone);
    if (star.stars[0].zone === previous) throw new Error('star respawned in same zone');
    previous = star.stars[0].zone;
  }
  const othersAfter = star.stars.slice(1).map((s) => ({ zone: s.zone, x: s.x, y: s.y }));

  const { IceGame } = await import('/src/game/ice.ts');
  const ice = new IceGame(1, 60, 1200, 800);
  const before = ice.blocks.map((b) => ({ slot: b.slot, x: b.x, y: b.y, w: b.w, h: b.h }));
  const target = ice.blocks[0];
  const targetSlot = target.slot;
  for (let i = 0; i < 5; i++) {
    ice.punch({
      x: target.x + target.w / 2,
      y: target.y + target.h / 2,
      player: 0,
      hand: 15,
      speed: 1200,
    });
  }
  const after = ice.blocks.map((b) => ({ slot: b.slot, x: b.x, y: b.y, w: b.w, h: b.h }));
  const unchanged = after.every((b) => {
    const old = before.find((o) => o.slot === b.slot);
    return old && old.x === b.x && old.y === b.y && old.w === b.w && old.h === b.h;
  });

  return {
    star: {
      initialDistinct: new Set(initial.map((s) => s.zone)).size,
      initial,
      moves,
      allMovesNew: moves.every((z, i) => z !== (i === 0 ? initial[0].zone : moves[i - 1])),
      othersStayed: others.every((o, i) => o.x === othersAfter[i].x && o.y === othersAfter[i].y),
    },
    ice: {
      before: before.length,
      after: after.length,
      targetSlot,
      unchanged,
      slotsBefore: before.map((b) => b.slot),
      slotsAfter: after.map((b) => b.slot),
    },
  };
});

console.log(JSON.stringify({ result, bad }, null, 2));
await browser.close();
