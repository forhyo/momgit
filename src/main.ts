import './style.css';
import { initHub } from './screens/hub';

initHub();

// PWA — 앱처럼 열 수 있게 (빌드 결과에서만 등록)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${base}sw.js`).catch(() => undefined);
  });
}

// 아이가 실수로 길게 눌러 메뉴가 뜨지 않게 (게임 화면에서만)
document.addEventListener('contextmenu', (e) => {
  const stage = document.getElementById('stage');
  if (stage && !stage.hidden) e.preventDefault();
});
