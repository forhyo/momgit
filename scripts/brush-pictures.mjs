import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173/';
const OUT = 'shots/new';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const bad = [];
page.on('pageerror', (e) => bad.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console: ${m.text()}`);
});
await page.goto(`${BASE}?demo=1`, { waitUntil: 'networkidle' });

const data = await page.evaluate(async () => {
  const { BrushGame } = await import('/src/game/brush.ts');
  const names = ['rainbow', 'heart', 'wave', 'star', 'flower', 'cloud', 'fish', 'butterfly'];
  const shots = [];
  const runs = [];

  for (let i = 0; i < names.length; i++) {
    const game = new BrushGame(1, 60, 1200, 800);
    game.picture[0] = i;
    game.progress[0] = 0.45;
    game.present[0] = 1;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    game.render(ctx, 1200, 800, 1.3);
    const points = game.screenPoints(0);
    shots.push({ i, name: names[i], url: canvas.toDataURL('image/png') });

    const run = new BrushGame(1, 60, 1200, 800);
    run.picture[0] = i;
    const path = run.screenPoints(0);
    for (const p of path) run.update(0.03, [{ hand: 15, player: 0, x: p.x, y: p.y }]);
    for (let k = 0; k < 15; k++) {
      const p = path[path.length - 1];
      run.update(0.03, [{ hand: 15, player: 0, x: p.x, y: p.y }]);
    }
    runs.push({
      name: names[i],
      points: points.length,
      minX: Math.min(...points.map((p) => p.x)),
      maxX: Math.max(...points.map((p) => p.x)),
      minY: Math.min(...points.map((p) => p.y)),
      maxY: Math.max(...points.map((p) => p.y)),
      score: run.scores[0],
      completed: run.completed[0],
      progress: run.progress[0],
    });
  }
  return { shots, runs };
});

for (const shot of data.shots) {
  const base64 = shot.url.split(',')[1];
  await writeFile(`${OUT}/pic-${shot.i}-${shot.name}.png`, Buffer.from(base64, 'base64'));
}

console.log(JSON.stringify({ runs: data.runs, bad }, null, 2));
await browser.close();
