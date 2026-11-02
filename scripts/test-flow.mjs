import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

await page.goto('http://localhost:5173/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// 프로필 추가
await page.locator('#btn-add-profile').click();
await page.waitForTimeout(200);
await page.locator('#profile-name').fill('별이');
await page.locator('[data-avatar="fox"]').click();
await page.locator('[data-save]').click();
await page.waitForTimeout(400);
const afterAdd = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1'));
  return { count: s.profiles.length, active: s.profiles.find((p) => p.id === s.activeId)?.name, cards: document.querySelectorAll('.profile-card').length };
});

// 설정: 30초 + 소리 끄기
await page.locator('#btn-settings').click();
await page.waitForTimeout(200);
await page.locator('[data-sec="30"]').click();
await page.locator('#sw-sound').click();
await page.waitForTimeout(200);
await page.locator('#dialog-settings [data-close]').click();
const afterSettings = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1'));
  return { round: s.settings.round, sound: s.settings.sound };
});

// 리로드 후 유지
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const afterReload = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1'));
  return { count: s.profiles.length, round: s.settings.round, name: document.querySelector('.profile-card[aria-pressed="true"] strong')?.textContent };
});

// 30초 데모 한 판 + 마우스로 풍선 터뜨리기
await page.locator('[data-game="balloon"]').click();
await page.waitForTimeout(300);
await page.locator('[data-demo]').click();
await page.waitForTimeout(3200);
const box = await page.locator('#canvas').boundingBox();
for (let i = 0; i < 260; i++) {
  const x = box.x + 60 + ((i * 97) % (box.width - 120));
  const y = box.y + 140 + ((i * 131) % (box.height - 260));
  await page.mouse.move(x, y);
  await page.waitForTimeout(90);
}
await page.waitForSelector('#dialog-result[open]', { timeout: 15000 }).catch(() => undefined);
await page.waitForTimeout(400);
const result = await page.evaluate(() => {
  const d = document.getElementById('dialog-result');
  return {
    open: d?.open,
    text: d?.textContent?.replace(/\s+/g, ' ').slice(0, 260),
    stars: d?.querySelectorAll('.result-star.on').length,
  };
});
await page.screenshot({ path: 'shots/result-scored.png' });

// 결과 닫고 기록 확인
if (result.open) {
  await page.locator('[data-act="other"]').click();
  await page.waitForTimeout(300);
}
const stored = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('momjit.village.v1'));
  const p = s.profiles.find((x) => x.id === s.activeId);
  return { plays: p.plays.balloon.plays, best: p.plays.balloon.best, stickers: p.stickers.length, totalPlays: s.plays };
});

console.log(JSON.stringify({ afterAdd, afterSettings, afterReload, result, stored, errors }, null, 2));
await browser.close();
