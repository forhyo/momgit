import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const bad = [];
page.on('response', (r) => {
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
});
page.on('pageerror', (e) => bad.push(`pageerror ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') bad.push(`console ${m.text()}`);
});

await page.goto('http://localhost:4174/momjit/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const info = await page.evaluate(async () => {
  const manifest = document.querySelector('link[rel="manifest"]');
  const icon = await fetch(new URL('icons/icon-192.png', location.href)).then((r) => r.status);
  const og = await fetch(new URL('og.png', location.href)).then((r) => r.status);
  const sw = await navigator.serviceWorker.getRegistration();
  return {
    title: document.title,
    manifestHref: manifest?.getAttribute('href'),
    iconStatus: icon,
    ogStatus: og,
    swScope: sw?.scope ?? null,
    swActive: sw?.active?.state ?? null,
    helpLink: document.querySelector('.top-link')?.getAttribute('href'),
    cards: document.querySelectorAll('[data-game]').length,
  };
});

await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(300);
await page.locator('[data-demo]').click();
await page.waitForTimeout(3600);
await page.screenshot({ path: 'shots/prod-subpath.png' });
await page.locator('#btn-back').click();
await page.waitForTimeout(300);
await page.locator('[data-act="ok"]').click();
await page.waitForTimeout(400);

await page.goto('http://localhost:4174/momjit/help.html', { waitUntil: 'networkidle' });
const helpTitle = await page.title();
await page.goto('http://localhost:4174/momjit/privacy.html', { waitUntil: 'networkidle' });
const privacyTitle = await page.title();

console.log(JSON.stringify({ info, helpTitle, privacyTitle, bad }, null, 2));
await browser.close();
