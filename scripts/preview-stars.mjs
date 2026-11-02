import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });
await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  const { starSvg } = await import('/src/dom.ts');
  const dlg = document.getElementById('dialog-result');
  dlg.innerHTML = `<div class="modal-card">
    <div class="result-top">
      <div class="result-star-row">${[0, 1, 2].map((i) => starSvg(i < 2)).join('')}</div>
      <h2>아주 잘했어요!</h2>
      <p>풍선 가게 · 30초 · 1명 놀이</p>
    </div>
  </div>`;
  dlg.showModal();
});
await page.waitForTimeout(500);
await page.screenshot({ path: 'shots/result-stars-preview.png' });
await browser.close();
