import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const bad = [];
page.on('response', (r) => {
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});
page.on('pageerror', (e) => bad.push(`pageerror ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console ${m.text()}`);
});

await page.goto('http://localhost:4175/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const info = await page.evaluate(async () => {
  const sw = await navigator.serviceWorker.getRegistration();
  return {
    cards: document.querySelectorAll('[data-game]').length,
    swScope: sw?.scope ?? null,
    icon: await fetch('./icons/icon-192.png').then((r) => r.status),
    og: await fetch('./og.png').then((r) => r.status),
    title: document.title,
  };
});

await page.locator('[data-game="ice"]').click();
await page.waitForTimeout(300);
await page.locator('[data-demo]').click();
await page.waitForTimeout(3600);
const playing = await page.evaluate(() => ({
  stage: document.getElementById('stage')?.hidden === false,
  time: document.getElementById('time')?.textContent,
}));
await page.screenshot({ path: 'shots/prod-root.png' });

await page.locator('#btn-back').click();
await page.waitForTimeout(250);
await page.locator('[data-act="ok"]').click();
await page.waitForTimeout(300);

await page.goto('http://localhost:4175/help.html', { waitUntil: 'networkidle' });
const help = await page.locator('h1').textContent();
await page.goto('http://localhost:4175/privacy.html', { waitUntil: 'networkidle' });
const privacy = await page.locator('h1').textContent();

console.log(JSON.stringify({ info, playing, help, privacy, bad }, null, 2));
await browser.close();
