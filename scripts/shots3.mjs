import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

for (const id of ['ice', 'star', 'orchard', 'drum', 'balloon']) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`${id}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${id}: ${m.text()}`);
  });
  await page.goto(`http://localhost:5173/?game=${id}&start=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(id === 'orchard' || id === 'drum' ? 7200 : 3800);
  await page.screenshot({ path: `shots/r-${id}.png` });
  await page.close();
}

console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
