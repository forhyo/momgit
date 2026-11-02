import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on('console', (m) => console.log('console', m.type(), m.text()));
page.on('pageerror', (e) => console.log('pageerror', e.message));

await page.addInitScript(() => {
  const dlg = HTMLDialogElement.prototype;
  const show = dlg.showModal;
  const close = dlg.close;
  dlg.showModal = function (...args) {
    console.log('SHOWMODAL', this.id, new Error().stack?.split('\n').slice(1, 4).join(' | '));
    return show.apply(this, args);
  };
  dlg.close = function (...args) {
    console.log('CLOSE', this.id, new Error().stack?.split('\n').slice(1, 4).join(' | '));
    return close.apply(this, args);
  };
});

await page.goto('http://localhost:5173/?game=balloon&start=1', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

console.log(
  'back info',
  await page.evaluate(() => {
    const b = document.getElementById('btn-back');
    const r = b.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      topEl: el?.id || el?.className || el?.tagName,
      hasOnClick: typeof b.onclick,
      dlgOpenCount: document.querySelectorAll('dialog[open]').length,
    };
  }),
);

await page.locator('#btn-back').click();
await page.waitForTimeout(600);
console.log(
  'after click',
  await page.evaluate(() => {
    const d = document.getElementById('dialog-confirm');
    return {
      open: d?.open,
      html: d?.innerHTML.slice(0, 80),
      act: document.querySelectorAll('[data-act="ok"]').length,
      active: document.activeElement?.id || document.activeElement?.tagName,
    };
  }),
);
await page.screenshot({ path: 'shots/confirm-debug.png' });
await browser.close();
