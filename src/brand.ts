/**
 * 몸짓 마을 — 브랜드 SVG 아트
 * 모든 그림은 손으로 그린 도형만 사용한다 (외부 이미지 0장).
 * 굵은 잉크 선 + 플랫 컬러 + 종이 질감이 기본 규칙.
 */

export const INK = '#1d1a3a';

const S = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;

/** 손으로 그린 듯한 별 */
export function starPath(cx: number, cy: number, r: number, inner = 0.46) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
}

function glove(x: number, y: number, rot = 0, scale = 1, color = '#ff6b57') {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">
    <path d="M-6 -26 L-6 26" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
    <path d="M-6 -26 L-6 26" stroke="#fffdf6" stroke-width="18" stroke-linecap="round"/>
    <path d="M-22 20 Q-46 26 -44 44 Q-42 60 -20 56 Q-4 52 -4 38 Z" fill="${color}" ${S} stroke-width="5"/>
    <ellipse cx="6" cy="-4" rx="34" ry="32" fill="${color}" ${S} stroke-width="5"/>
    <path d="M-8 -20 Q4 -30 20 -20" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".62" fill="none"/>
    <path d="M2 22 L2 36" stroke="${INK}" stroke-width="4" opacity=".25"/>
    <rect x="-16" y="24" width="42" height="15" rx="7" fill="#fffdf6" ${S} stroke-width="4.5"/>
  </g>`;
}

/** 마스코트 '콩이' — 노란 고양이 + 산호색 글러브 */
export function mascotSvg(): string {
  return `<svg viewBox="0 0 500 520" role="img" aria-label="글러브를 낀 노란 고양이 콩이">
    <ellipse cx="248" cy="486" rx="144" ry="20" fill="${INK}" opacity=".14"/>
    <g>
      <!-- 꼬리 -->
      <path d="M400 404 Q462 400 456 350 Q452 318 424 318" fill="none" ${S} stroke-width="30"/>
      <path d="M400 404 Q462 400 456 350 Q452 318 424 318" fill="none" stroke="#ffd23f" stroke-width="18" stroke-linecap="round"/>
      <!-- 발 -->
      <ellipse cx="206" cy="458" rx="46" ry="26" fill="#fffdf6" ${S} stroke-width="6"/>
      <ellipse cx="300" cy="458" rx="46" ry="26" fill="#fffdf6" ${S} stroke-width="6"/>
      <!-- 몸 -->
      <path d="M158 312 Q158 428 250 432 Q342 428 342 312 Z" fill="#fffdf6" ${S} stroke-width="7"/>
      <!-- 배 별 -->
      <path d="${starPath(250, 372, 34)}" fill="#ffd23f" ${S} stroke-width="5.5"/>
      <!-- 목도리 -->
      <path d="M160 300 Q250 328 340 300 L342 330 Q250 358 158 330 Z" fill="#2f5bff" ${S} stroke-width="6"/>
      <path d="M318 336 L352 420 L320 430 L296 352 Z" fill="#2f5bff" ${S} stroke-width="6"/>
      <path d="M326 356 L340 400" stroke="#fffdf6" stroke-width="5" stroke-linecap="round" opacity=".5"/>
      <!-- 왼팔 (아래) -->
      <path d="M166 330 Q120 350 112 396" fill="none" ${S} stroke-width="34"/>
      <path d="M166 330 Q120 350 112 396" fill="none" stroke="#fffdf6" stroke-width="22" stroke-linecap="round"/>
      <!-- 오른팔 (위로) -->
      <path d="M336 326 Q390 300 418 252" fill="none" ${S} stroke-width="34"/>
      <path d="M336 326 Q390 300 418 252" fill="none" stroke="#fffdf6" stroke-width="22" stroke-linecap="round"/>
      <!-- 귀 -->
      <path d="M164 118 Q154 46 196 62 Q222 72 232 100 Z" fill="#ffd23f" ${S} stroke-width="7"/>
      <path d="M176 106 Q172 76 192 82 Q204 88 210 102 Z" fill="#ffb3c7" ${S} stroke-width="4"/>
      <path d="M336 118 Q346 46 304 62 Q278 72 268 100 Z" fill="#ffd23f" ${S} stroke-width="7"/>
      <path d="M324 106 Q328 76 308 82 Q296 88 290 102 Z" fill="#ffb3c7" ${S} stroke-width="4"/>
      <!-- 얼굴 -->
      <circle cx="250" cy="192" r="118" fill="#ffd23f" ${S} stroke-width="7"/>
      <!-- 볼 -->
      <ellipse cx="172" cy="218" rx="25" ry="15" fill="#ff6b57" opacity=".42"/>
      <ellipse cx="328" cy="218" rx="25" ry="15" fill="#ff6b57" opacity=".42"/>
      <!-- 눈 -->
      <ellipse cx="206" cy="188" rx="12" ry="15" fill="${INK}"/>
      <ellipse cx="294" cy="188" rx="12" ry="15" fill="${INK}"/>
      <circle cx="210" cy="182" r="4.6" fill="#fff"/>
      <circle cx="298" cy="182" r="4.6" fill="#fff"/>
      <!-- 입 -->
      <path d="M232 222 Q250 241 268 222" fill="none" ${S} stroke-width="6"/>
      <path d="M250 210 L250 220" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
      <!-- 수염 -->
      <path d="M134 196 L106 190 M136 212 L110 216 M366 196 L394 190 M364 212 L390 216" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    </g>
    ${glove(426, 228, 18, 1.02)}
    ${glove(108, 418, 10, 0.86)}
    <!-- 펀치 임팩트 -->
    <g transform="translate(466 188)">
      <path d="M0 -20 L6 -7 L20 -12 L10 0 L20 12 L6 7 L0 20 L-6 7 L-20 12 L-10 0 L-20 -12 L-6 -7 Z" fill="#fffdf6" ${S} stroke-width="5"/>
    </g>
    <path d="M58 330 L34 318 M66 352 L40 350 M384 130 L402 108" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  </svg>`;
}

/* ==========================================================================
   Game card art
   ========================================================================== */

const artBase = (bg: string) =>
  `<svg viewBox="0 0 320 200" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <rect width="320" height="200" fill="${bg}"/>`;

function cloud(x: number, y: number, s = 1, fill = '#fffdf6') {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" ${S} stroke-width="4">
    <path d="M0 18 Q-4 2 12 0 Q20 -14 36 -6 Q48 -16 58 0 Q74 0 72 18 Z"/>
  </g>`;
}

function balloonArt() {
  const face = (x: number, y: number, r: number) => `
    <circle cx="${x - r * 0.34}" cy="${y}" r="${r * 0.09}" fill="${INK}"/>
    <circle cx="${x + r * 0.34}" cy="${y}" r="${r * 0.09}" fill="${INK}"/>
    <path d="M${x - r * 0.2} ${y + r * 0.2} Q${x} ${y + r * 0.36} ${x + r * 0.2} ${y + r * 0.2}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
  const balloon = (x: number, y: number, r: number, color: string, rot: number) => `
    <g transform="rotate(${rot} ${x} ${y})">
      <path d="M${x} ${y + r * 1.12} Q${x + 8} ${y + r * 1.6} ${x - 4} ${y + r * 2.1}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.14}" fill="${color}" ${S} stroke-width="4.5"/>
      <ellipse cx="${x - r * 0.34}" cy="${y - r * 0.4}" rx="${r * 0.2}" ry="${r * 0.12}" fill="#fff" opacity=".7" transform="rotate(-35 ${x - r * 0.34} ${y - r * 0.4})"/>
      ${face(x, y + r * 0.02, r)}
      <path d="M${x - r * 0.14} ${y + r * 1.12} L${x + r * 0.14} ${y + r * 1.12} L${x} ${y + r * 1.3} Z" fill="${color}" ${S} stroke-width="3.5"/>
    </g>`;
  return `${artBase('#bfe4ff')}
    <circle cx="278" cy="38" r="24" fill="#ffd23f" ${S} stroke-width="4"/>
    ${cloud(18, 22, 0.9)}
    ${cloud(226, 92, 0.62, '#fffdf6')}
    <path d="M0 168 Q60 140 128 162 Q204 186 320 150 L320 200 L0 200 Z" fill="#a8e6cf" ${S} stroke-width="4"/>
    ${balloon(118, 74, 33, '#ff6b57', -4)}
    ${balloon(186, 58, 27, '#ffd23f', 5)}
    ${balloon(246, 96, 22, '#2ed3a0', -3)}
    ${glove(48, 152, -26, 0.68)}
    <path d="M74 132 Q96 112 112 108" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
    <g transform="translate(236 36)"><path d="M0 -13 L4 -4 L13 -8 L6 0 L13 8 L4 4 L0 13 L-4 4 L-13 8 L-6 0 L-13 -8 L-4 -4 Z" fill="#fffdf6" ${S} stroke-width="3.5"/></g>
    <circle cx="92" cy="54" r="4" fill="#2f5bff"/><circle cx="292" cy="120" r="5" fill="#ff6b57"/><circle cx="160" cy="166" r="4" fill="#ffd23f"/>
  </svg>`;
}

function iceArt() {
  const cube = (x: number, y: number, s: number, color: string, crack = false) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-34" y="-34" width="68" height="68" rx="16" fill="${color}" ${S} stroke-width="4.5"/>
      <path d="M-24 -34 L-24 -20 Q-24 -10 -10 -10 L10 -10" fill="none" stroke="#fff" stroke-width="5" opacity=".65" stroke-linecap="round"/>
      <circle cx="-10" cy="2" r="3.4" fill="${INK}"/><circle cx="12" cy="2" r="3.4" fill="${INK}"/>
      <path d="M-6 14 Q1 20 8 14" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      ${crack ? `<path d="M6 -22 L-2 -10 L6 -2 L-4 10 M-2 -10 L-16 -16" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".65"/>` : ''}
    </g>`;
  return `${artBase('#cdf1e4')}
    <circle cx="52" cy="42" r="20" fill="#fffdf6" ${S} stroke-width="4" opacity=".8"/>
    <g fill="#fffdf6"><circle cx="272" cy="28" r="3"/><circle cx="300" cy="56" r="4"/><circle cx="248" cy="66" r="2.5"/><circle cx="30" cy="88" r="3"/></g>
    <path d="M0 170 Q80 152 160 168 Q240 184 320 162 L320 200 L0 200 Z" fill="#9fe0ff" ${S} stroke-width="4"/>
    <path d="M28 128 L28 60 Q28 30 58 30 Q88 30 88 60 L88 128" fill="#fffdf6" ${S} stroke-width="4.5"/>
    <path d="M40 128 L40 64 Q40 44 58 44 Q76 44 76 64 L76 128" fill="#bfe4ff" stroke="${INK}" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
    ${cube(150, 132, 1, '#8ecaff')}
    ${cube(222, 120, 0.86, '#c9b6ff', true)}
    ${cube(186, 74, 0.72, '#ffd23f')}
    <g transform="translate(286 140)">
      <ellipse cx="0" cy="0" rx="26" ry="30" fill="#fffdf6" ${S} stroke-width="4.5"/>
      <ellipse cx="0" cy="10" rx="26" ry="20" fill="#8ecaff" ${S} stroke-width="4"/>
      <circle cx="-9" cy="-8" r="3.2" fill="${INK}"/><circle cx="9" cy="-8" r="3.2" fill="${INK}"/>
      <path d="M-5 2 Q0 7 5 2" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M-24 16 L-34 26 M24 16 L34 26" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </g>
    ${glove(62, 156, 28, 0.66)}
    <path d="M88 138 Q112 122 128 120" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
    <g transform="translate(210 32)"><path d="M0 -14 L4 -4 L14 -9 L7 0 L14 9 L4 4 L0 14 L-4 4 L-14 9 L-7 0 L-14 -9 L-4 -4 Z" fill="#fffdf6" ${S} stroke-width="3.5"/></g>
  </svg>`;
}

function starArt() {
  return `${artBase('#2f2a66')}
    <g fill="#fffdf6">
      <circle cx="36" cy="46" r="2.5"/><circle cx="84" cy="24" r="2"/><circle cx="140" cy="48" r="3"/>
      <circle cx="210" cy="22" r="2.2"/><circle cx="282" cy="40" r="2.6"/><circle cx="300" cy="96" r="2"/>
      <circle cx="56" cy="110" r="2"/><circle cx="246" cy="120" r="2.4"/>
    </g>
    <path d="M276 34 Q262 58 276 78 Q290 58 276 34 Z" fill="#ffd23f" ${S} stroke-width="4"/>
    <circle cx="256" cy="66" r="9" fill="#ffd23f" ${S} stroke-width="3.4"/>
    <path d="M0 176 Q90 150 180 172 Q260 190 320 166 L320 200 L0 200 Z" fill="#413c86" ${S} stroke-width="4"/>
    <!-- 망원경 -->
    <g transform="translate(72 150)">
      <path d="M-22 34 L6 0 M26 34 L6 0" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M-18 6 L44 -30" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
      <path d="M-18 6 L44 -30" stroke="#2ed3a0" stroke-width="16" stroke-linecap="round"/>
      <circle cx="48" cy="-32" r="15" fill="#fffdf6" ${S} stroke-width="4"/>
      <circle cx="48" cy="-32" r="7" fill="#8ecaff" ${S} stroke-width="3"/>
    </g>
    <!-- 별 -->
    ${[
      [164, 92, 30, '#ffd23f'],
      [230, 60, 20, '#ff6b57'],
      [196, 146, 15, '#8ecaff'],
    ]
      .map(([x, y, r, c]) => `<g transform="translate(${x} ${y})">
        <path d="${starPath(0, 0, r as number)}" fill="${c}" ${S} stroke-width="4"/>
        <circle cx="${-(r as number) * 0.3}" cy="0" r="${(r as number) * 0.075}" fill="${INK}"/>
        <circle cx="${(r as number) * 0.3}" cy="0" r="${(r as number) * 0.075}" fill="${INK}"/>
        <path d="M${-(r as number) * 0.18} ${(r as number) * 0.16} Q0 ${(r as number) * 0.3} ${(r as number) * 0.18} ${(r as number) * 0.16}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      </g>`)
      .join('')}
    ${glove(270, 146, 24, 0.7)}
    <path d="M240 132 Q222 118 210 108" fill="none" stroke="#fffdf6" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" opacity=".7"/>
    <path d="M292 88 Q302 78 312 88 Q302 98 292 88 Z" fill="#ffd23f" ${S} stroke-width="3"/>
  </svg>`;
}

function moleArt() {
  return `${artBase('#d9f0a8')}
    <circle cx="264" cy="42" r="22" fill="#ffd23f" ${S} stroke-width="4"/>
    ${cloud(16, 20, 0.72)}
    <path d="M0 132 Q80 108 160 128 Q240 148 320 122 L320 200 L0 200 Z" fill="#a8e6cf" ${S} stroke-width="4"/>
    <path d="M0 168 Q80 150 170 164 Q250 176 320 158 L320 200 L0 200 Z" fill="#7fd0a8" ${S} stroke-width="4"/>
    <!-- 두더지 -->
    <g transform="translate(196 128)">
      <path d="M-56 26 Q-56 -30 0 -30 Q56 -30 56 26 Z" fill="#c98a5b" ${S} stroke-width="4.5"/>
      <ellipse cx="0" cy="-16" rx="34" ry="30" fill="#8a6146" ${S} stroke-width="4.5"/>
      <ellipse cx="-34" cy="-20" rx="11" ry="9" fill="#8a6146" ${S} stroke-width="3.5"/>
      <ellipse cx="34" cy="-20" rx="11" ry="9" fill="#8a6146" ${S} stroke-width="3.5"/>
      <circle cx="-11" cy="-24" r="3.6" fill="#fffdf6"/><circle cx="11" cy="-24" r="3.6" fill="#fffdf6"/>
      <circle cx="-10" cy="-24" r="2" fill="${INK}"/><circle cx="12" cy="-24" r="2" fill="${INK}"/>
      <ellipse cx="0" cy="-10" rx="7" ry="5.5" fill="#ff6b57" ${S} stroke-width="3"/>
      <path d="M-18 8 Q0 18 18 8" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M-30 -8 Q-22 -14 -14 -8" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="-40" cy="-28" r="3" fill="#fffdf6"/><circle cx="40" cy="-28" r="3" fill="#fffdf6"/>
    </g>
    <g transform="translate(74 160)">
      <ellipse cx="0" cy="10" rx="46" ry="16" fill="#8a6146" ${S} stroke-width="4"/>
      <ellipse cx="0" cy="4" rx="30" ry="12" fill="#c98a5b" ${S} stroke-width="3.5"/>
    </g>
    <g transform="translate(282 166)">
      <ellipse cx="0" cy="8" rx="32" ry="12" fill="#8a6146" ${S} stroke-width="4"/>
    </g>
    <path d="M238 104 Q252 92 264 96" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    ${glove(262, 100, -18, 0.6)}
    <g transform="translate(118 44)"><path d="M0 -12 L4 -4 L12 -8 L6 0 L12 8 L4 4 L0 12 L-4 4 L-12 8 L-6 0 L-12 -8 L-4 -4 Z" fill="#fffdf6" ${S} stroke-width="3"/></g>
    <circle cx="42" cy="86" r="4" fill="#fffdf6"/><circle cx="300" cy="78" r="3" fill="#ff6b57"/>
  </svg>`;
}

function orchardArt() {
  return `${artBase('#ffd9c2')}
    <circle cx="42" cy="36" r="20" fill="#ffd23f" ${S} stroke-width="4"/>
    <path d="M0 152 Q70 132 150 150 Q230 168 320 142 L320 200 L0 200 Z" fill="#a8e6cf" ${S} stroke-width="4"/>
    <!-- 나무 -->
    <path d="M250 154 L250 96" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
    <path d="M250 132 L224 108 M250 124 L274 104" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="252" cy="74" r="50" fill="#2ed3a0" ${S} stroke-width="4.5"/>
    <circle cx="216" cy="84" r="28" fill="#2ed3a0" ${S} stroke-width="4"/>
    <circle cx="290" cy="88" r="26" fill="#2ed3a0" ${S} stroke-width="4"/>
    <circle cx="230" cy="58" r="8" fill="#ff6b57" ${S} stroke-width="3.4"/>
    <circle cx="272" cy="72" r="8" fill="#ffd23f" ${S} stroke-width="3.4"/>
    <circle cx="248" cy="96" r="7" fill="#ff6b57" ${S} stroke-width="3.4"/>
    <!-- 바구니 -->
    <g transform="translate(140 152)">
      <path d="M-52 0 L52 0 L38 34 L-38 34 Z" fill="#e8c79a" ${S} stroke-width="4.5"/>
      <path d="M-44 12 L44 12 M-38 24 L38 24" stroke="#b98a58" stroke-width="3.4"/>
      <path d="M-34 0 Q0 -22 34 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="-12" cy="-12" r="11" fill="#ff6b57" ${S} stroke-width="3.4"/>
      <circle cx="12" cy="-8" r="10" fill="#ffd23f" ${S} stroke-width="3.4"/>
    </g>
    <path d="M192 44 Q198 66 186 84" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    <circle cx="184" cy="92" r="10" fill="#c9b6ff" ${S} stroke-width="3.4"/>
    <path d="M184 82 Q186 76 192 74" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    ${glove(84, 118, 18, 0.68)}
    <path d="M108 128 Q124 142 140 146" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    <g transform="translate(232 24)"><path d="M0 -12 L4 -4 L12 -8 L6 0 L12 8 L4 4 L0 12 L-4 4 L-12 8 L-6 0 L-12 -8 L-4 -4 Z" fill="#fffdf6" ${S} stroke-width="3"/></g>
    <circle cx="60" cy="70" r="4" fill="#fffdf6"/><circle cx="304" cy="122" r="4" fill="#ffd23f"/>
  </svg>`;
}

function drumArt() {
  const drum = (x: number, y: number, s: number, color: string) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-30 18 L-38 40 M30 18 L38 40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <rect x="-40" y="-8" width="80" height="30" rx="12" fill="${color}" ${S} stroke-width="4.5"/>
      <ellipse cx="0" cy="-8" rx="40" ry="14" fill="#fffdf6" ${S} stroke-width="4"/>
      <ellipse cx="0" cy="-8" rx="24" ry="7" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".35"/>
      <circle cx="-12" cy="8" r="3" fill="${INK}"/><circle cx="12" cy="8" r="3" fill="${INK}"/>
      <path d="M-6 15 Q0 20 6 15" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
    </g>`;
  return `${artBase('#ffd7cd')}
    <path d="M-10 8 Q40 34 90 6 Q140 34 190 6 Q240 34 290 6 Q330 26 340 4" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <g>
      <path d="M30 6 L24 24 L50 18 Z" fill="#ffd23f" ${S} stroke-width="3.2"/>
      <path d="M120 4 L114 22 L140 16 Z" fill="#2ed3a0" ${S} stroke-width="3.2"/>
      <path d="M250 4 L244 22 L270 16 Z" fill="#8ecaff" ${S} stroke-width="3.2"/>
    </g>
    <path d="M0 168 Q80 150 160 164 Q240 178 320 158 L320 200 L0 200 Z" fill="#ffb3c7" ${S} stroke-width="4"/>
    ${drum(112, 128, 1.05, '#ff6b57')}
    ${drum(206, 138, 0.9, '#ffd23f')}
    ${drum(282, 124, 0.72, '#2ed3a0')}
    ${glove(140, 86, -24, 0.62)}
    <g fill="${INK}">
      <path d="M62 84 L62 104 M62 84 Q74 84 74 94 Q74 104 62 104" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M244 52 L244 74 M244 52 Q258 52 258 63 Q258 74 244 74" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <circle cx="260" cy="34" r="5" fill="#ffd23f" ${S} stroke-width="3"/>
    <path d="M84 46 Q92 36 100 44 Q92 54 84 46 Z" fill="#fffdf6" ${S} stroke-width="3"/>
    <path d="M140 40 L160 30 M146 54 L166 50" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".45"/>
  </svg>`;
}

function shadowArt() {
  return `${artBase('#342b5c')}
    <path d="M0 0 H320 V26 Q300 38 280 26 Q260 38 240 26 Q220 38 200 26 Q180 38 160 26 Q140 38 120 26 Q100 38 80 26 Q60 38 40 26 Q20 38 0 26 Z" fill="#ff6b57" ${S} stroke-width="4"/>
    <path d="M160 20 L48 180 H272 Z" fill="#ffd23f" opacity=".16"/>
    <ellipse cx="160" cy="180" rx="112" ry="18" fill="#1d1a3a" opacity=".3"/>
    <path d="M0 176 Q80 160 160 174 Q240 188 320 168 V200 H0 Z" fill="#241d45" ${S} stroke-width="4"/>
    <g fill="#0f0c26" opacity=".88">
      <circle cx="160" cy="94" r="25"/>
      <path d="M139 120 Q160 112 181 120 L188 178 Q160 188 132 178 Z"/>
      <path d="M139 130 L92 66" fill="none" stroke="#0f0c26" stroke-width="15" stroke-linecap="round"/>
      <path d="M181 130 L228 66" fill="none" stroke="#0f0c26" stroke-width="15" stroke-linecap="round"/>
      <circle cx="92" cy="66" r="10"/>
      <circle cx="228" cy="66" r="10"/>
    </g>
    <circle cx="92" cy="66" r="24" fill="none" stroke="#ffd23f" stroke-width="4" stroke-dasharray="6 7"/>
    <circle cx="228" cy="66" r="24" fill="none" stroke="#ffd23f" stroke-width="4" stroke-dasharray="6 7"/>
    ${glove(92, 66, -18, 0.55, '#ffd23f')}
    ${glove(228, 66, 18, 0.55, '#ffd23f')}
    <path d="${starPath(280, 42, 14)}" fill="#fffdf6" ${S} stroke-width="3"/>
    <path d="M42 48 L36 36 L30 48 L18 54 L30 60 L36 72 L42 60 L54 54 Z" fill="#c9b6ff" ${S} stroke-width="3"/>
  </svg>`;
}

function brushArt() {
  const dot = (x: number, y: number, c: string) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}" ${S} stroke-width="2"/>`;
  return `${artBase('#e2f6ff')}
    <path d="M20 152 Q60 38 160 38 Q260 38 300 152" fill="none" stroke="#ff6b57" stroke-width="27" stroke-linecap="round" opacity=".9"/>
    <path d="M38 160 Q78 66 160 66 Q242 66 282 160" fill="none" stroke="#ffd23f" stroke-width="21" stroke-linecap="round" opacity=".95"/>
    <path d="M55 166 Q90 92 160 92 Q230 92 265 166" fill="none" stroke="#2ed3a0" stroke-width="15" stroke-linecap="round"/>
    <path d="M74 170 Q102 118 160 118 Q218 118 246 170" fill="none" stroke="#2f5bff" stroke-width="10" stroke-linecap="round"/>
    <path d="M82 148 Q120 104 160 104 Q200 104 238 148" fill="none" stroke="#fffdf6" stroke-width="5" stroke-dasharray="3 11" stroke-linecap="round"/>
    ${dot(60, 82, '#ffb3c7')}${dot(252, 68, '#c9b6ff')}${dot(284, 118, '#ffd23f')}${dot(32, 118, '#2ed3a0')}
    ${glove(248, 142, -22, 0.72, '#ff6b57')}
    <path d="M214 108 Q198 82 208 60 Q220 36 246 40" fill="none" stroke="${INK}" stroke-width="3.4" stroke-dasharray="2 8" stroke-linecap="round"/>
    <path d="${starPath(252, 36, 12)}" fill="#ffd23f" ${S} stroke-width="3"/>
    <path d="M38 178 Q60 170 80 178 M142 184 Q160 176 182 184 M242 178 Q264 170 286 178" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".35"/>
  </svg>`;
}

export const GAME_ART = {
  balloon: balloonArt,
  ice: iceArt,
  star: starArt,
  mole: moleArt,
  orchard: orchardArt,
  drum: drumArt,
  shadow: shadowArt,
  brush: brushArt,
} as const;

/* ==========================================================================
   Avatars
   ========================================================================== */

export type AvatarId = 'cat' | 'bear' | 'rabbit' | 'fox';

export const AVATARS: { id: AvatarId; name: string; bg: string; art: string }[] = [
  {
    id: 'cat',
    name: '노랑 고양이',
    bg: '#ffd23f',
    art: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill="#ffd23f"/>
      <path d="M22 42 Q18 18 34 26 L42 34 Z M78 42 Q82 18 66 26 L58 34 Z" fill="#ffd23f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="50" cy="58" r="28" fill="#ffd23f" stroke="${INK}" stroke-width="4"/>
      <circle cx="40" cy="55" r="3" fill="${INK}"/><circle cx="60" cy="55" r="3" fill="${INK}"/>
      <path d="M44 66 Q50 71 56 66" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="32" cy="64" rx="6" ry="4" fill="#ff6b57" opacity=".5"/><ellipse cx="68" cy="64" rx="6" ry="4" fill="#ff6b57" opacity=".5"/>
      <path d="M50 78 L50 88" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'bear',
    name: '갈색 곰',
    bg: '#ffc9a3',
    art: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill="#ffc9a3"/>
      <circle cx="28" cy="34" r="12" fill="#c98a5b" stroke="${INK}" stroke-width="4"/>
      <circle cx="72" cy="34" r="12" fill="#c98a5b" stroke="${INK}" stroke-width="4"/>
      <circle cx="50" cy="58" r="29" fill="#c98a5b" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="50" cy="66" rx="14" ry="11" fill="#f2d6b8" stroke="${INK}" stroke-width="3"/>
      <circle cx="40" cy="54" r="3" fill="${INK}"/><circle cx="60" cy="54" r="3" fill="${INK}"/>
      <ellipse cx="50" cy="63" rx="4" ry="3" fill="${INK}"/>
      <path d="M44 71 Q50 75 56 71" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'rabbit',
    name: '분홍 토끼',
    bg: '#ffb3c7',
    art: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill="#ffb3c7"/>
      <ellipse cx="37" cy="26" rx="9" ry="20" fill="#fffdf6" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="63" cy="26" rx="9" ry="20" fill="#fffdf6" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="37" cy="26" rx="4" ry="13" fill="#ffb3c7"/><ellipse cx="63" cy="26" rx="4" ry="13" fill="#ffb3c7"/>
      <circle cx="50" cy="62" r="26" fill="#fffdf6" stroke="${INK}" stroke-width="4"/>
      <circle cx="40" cy="59" r="3" fill="${INK}"/><circle cx="60" cy="59" r="3" fill="${INK}"/>
      <path d="M44 70 Q50 75 56 70" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
      <ellipse cx="33" cy="68" rx="5" ry="3.5" fill="#ff6b57" opacity=".5"/><ellipse cx="67" cy="68" rx="5" ry="3.5" fill="#ff6b57" opacity=".5"/>
    </svg>`,
  },
  {
    id: 'fox',
    name: '주황 여우',
    bg: '#c9b6ff',
    art: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill="#c9b6ff"/>
      <path d="M20 40 L16 16 L38 28 Z M80 40 L84 16 L62 28 Z" fill="#ff8a5c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 30 Q78 30 78 58 Q78 84 50 86 Q22 84 22 58 Q22 30 50 30 Z" fill="#ff8a5c" stroke="${INK}" stroke-width="4"/>
      <path d="M28 62 Q50 52 72 62 Q70 84 50 86 Q30 84 28 62 Z" fill="#fffdf6"/>
      <circle cx="39" cy="56" r="3" fill="${INK}"/><circle cx="61" cy="56" r="3" fill="${INK}"/>
      <ellipse cx="50" cy="74" rx="4" ry="3" fill="${INK}"/>
      <path d="M44 80 Q50 84 56 80" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
  },
];

export function avatarSvg(id: AvatarId): string {
  return (AVATARS.find((a) => a.id === id) ?? AVATARS[0]).art;
}

/* ==========================================================================
   Stickers — 12 collectibles
   ========================================================================== */

type StickerDef = { name: string; icon: string; color: string };

const stickerIcons: StickerDef[] = [
  {
    name: '반짝별',
    color: '#ffd23f',
    icon: `<path d="${starPath(0, 2, 30)}" fill="#ffd23f" ${S} stroke-width="4"/>`,
  },
  {
    name: '하트',
    color: '#ff6b57',
    icon: `<path d="M0 26 C-40 4 -32 -22 -14 -22 C-5 -22 0 -14 0 -10 C0 -14 5 -22 14 -22 C32 -22 40 4 0 26 Z" fill="#ff6b57" ${S} stroke-width="4"/>`,
  },
  {
    name: '꽃',
    color: '#ffb3c7',
    icon: `<g fill="#ffb3c7" ${S} stroke-width="4">
      <circle cx="0" cy="-18" r="12"/><circle cx="17" cy="-6" r="12"/><circle cx="11" cy="15" r="12"/>
      <circle cx="-11" cy="15" r="12"/><circle cx="-17" cy="-6" r="12"/>
    </g><circle cx="0" cy="0" r="9" fill="#ffd23f" ${S} stroke-width="3.4"/>`,
  },
  {
    name: '무지개',
    color: '#8ecaff',
    icon: `<g fill="none" stroke-linecap="round">
      <path d="M-30 18 Q-30 -20 0 -20 Q30 -20 30 18" stroke="${INK}" stroke-width="14"/>
      <path d="M-30 18 Q-30 -20 0 -20 Q30 -20 30 18" stroke="#ff6b57" stroke-width="8"/>
      <path d="M-22 20 Q-22 -12 0 -12 Q22 -12 22 20" stroke="${INK}" stroke-width="14"/>
      <path d="M-22 20 Q-22 -12 0 -12 Q22 -12 22 20" stroke="#ffd23f" stroke-width="8"/>
      <path d="M-14 22 Q-14 -4 0 -4 Q14 -4 14 22" stroke="${INK}" stroke-width="14"/>
      <path d="M-14 22 Q-14 -4 0 -4 Q14 -4 14 22" stroke="#2ed3a0" stroke-width="8"/>
    </g>`,
  },
  {
    name: '구름',
    color: '#bfe4ff',
    icon: `<path d="M-30 14 Q-36 -8 -16 -10 Q-12 -30 8 -24 Q24 -32 32 -12 Q40 8 18 14 Z" fill="#e8f4ff" ${S} stroke-width="4"/>`,
  },
  {
    name: '물고기',
    color: '#8ecaff',
    icon: `<path d="M-28 0 Q-10 -20 14 -8 Q24 -4 32 -16 L30 16 Q22 4 14 8 Q-10 20 -28 0 Z" fill="#8ecaff" ${S} stroke-width="4"/><circle cx="-12" cy="-3" r="3" fill="${INK}"/><path d="M-2 4 Q4 8 10 4" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    name: '버섯',
    color: '#ff6b57',
    icon: `<path d="M-28 -2 Q-28 -26 0 -26 Q28 -26 28 -2 Z" fill="#ff6b57" ${S} stroke-width="4"/><path d="M-10 -2 L-10 22 Q0 28 10 22 L10 -2 Z" fill="#fffdf6" ${S} stroke-width="4"/><circle cx="-10" cy="-12" r="4.5" fill="#fffdf6"/><circle cx="10" cy="-16" r="3.5" fill="#fffdf6"/><circle cx="16" cy="-6" r="3" fill="#fffdf6"/>`,
  },
  {
    name: '달',
    color: '#ffd23f',
    icon: `<path d="M8 -28 Q-24 -18 -24 4 Q-24 28 4 28 Q-10 14 -10 0 Q-10 -16 8 -28 Z" fill="#ffd23f" ${S} stroke-width="4"/><circle cx="18" cy="-10" r="3" fill="#fffdf6"/><path d="M20 8 L24 2 L28 8 L24 14 Z" fill="#fffdf6"/>`,
  },
  {
    name: '체리',
    color: '#ff6b57',
    icon: `<path d="M-8 24 Q-24 -2 -18 -22 M14 24 Q26 4 24 -18" fill="none" stroke="#2e7d4f" stroke-width="4" stroke-linecap="round"/><circle cx="-14" cy="16" r="13" fill="#ff6b57" ${S} stroke-width="4"/><circle cx="16" cy="18" r="12" fill="#ff6b57" ${S} stroke-width="4"/><path d="M-4 -20 Q6 -30 18 -24" fill="none" stroke="#2e7d4f" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    name: '왕관',
    color: '#ffd23f',
    icon: `<path d="M-28 16 L-28 -14 L-12 2 L0 -22 L12 2 L28 -14 L28 16 Z" fill="#ffd23f" ${S} stroke-width="4"/><circle cx="0" cy="8" r="4" fill="#ff6b57"/><circle cx="-16" cy="8" r="3" fill="#2f5bff"/><circle cx="16" cy="8" r="3" fill="#2ed3a0"/>`,
  },
  {
    name: '나뭇잎',
    color: '#2ed3a0',
    icon: `<path d="M-26 20 Q-30 -18 22 -26 Q30 18 -26 20 Z" fill="#2ed3a0" ${S} stroke-width="4"/><path d="M-20 16 Q0 0 18 -20" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    name: '해',
    color: '#ffd23f',
    icon: `<circle cx="0" cy="0" r="17" fill="#ffd23f" ${S} stroke-width="4"/><g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M0 -27 L0 -34"/><path d="M0 27 L0 34"/><path d="M27 0 L34 0"/><path d="M-27 0 L-34 0"/><path d="M19 -19 L24 -24"/><path d="M-19 19 L-24 24"/><path d="M19 19 L24 24"/><path d="M-19 -19 L-24 -24"/></g>`,
  },
];

export const STICKERS = stickerIcons;

export function stickerSvg(index: number): string {
  const s = STICKERS[index % STICKERS.length];
  return `<svg viewBox="-50 -50 100 100" role="img" aria-label="${s.name} 스티커">
    <circle cx="0" cy="0" r="43" fill="#fffdf6" ${S} stroke-width="4.5"/>
    <circle cx="0" cy="0" r="36" fill="${s.color}" opacity=".16"/>
    <g>${s.icon}</g>
    <path d="M-33 -28 L-27 -24 M30 -31 L26 -25 M33 26 L27 22" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".35"/>
  </svg>`;
}

/* ==========================================================================
   Guide / misc illustrations
   ========================================================================== */

export function stepArt(kind: 'camera' | 'space' | 'play'): string {
  const base = `<svg viewBox="0 0 220 130" role="img" aria-hidden="true">`;
  if (kind === 'camera') {
    return `${base}
      <ellipse cx="110" cy="116" rx="64" ry="9" fill="${INK}" opacity=".12"/>
      <rect x="40" y="30" width="140" height="76" rx="18" fill="#fffdf6" ${S} stroke-width="5"/>
      <rect x="84" y="18" width="52" height="22" rx="9" fill="#ffd23f" ${S} stroke-width="5"/>
      <circle cx="110" cy="68" r="26" fill="#ff6b57" ${S} stroke-width="5"/>
      <circle cx="110" cy="68" r="13" fill="#fffdf6" ${S} stroke-width="4"/>
      <circle cx="110" cy="68" r="6" fill="#2f5bff"/>
      <circle cx="152" cy="44" r="5" fill="#2ed3a0" ${S} stroke-width="3"/>
      <path d="M166 106 Q184 90 180 72" fill="none" ${S} stroke-width="4" stroke-dasharray="3 7"/>
      <g transform="translate(176 56)">
        <circle r="17" fill="#2ed3a0" ${S} stroke-width="4"/>
        <path d="M-7 0 L-1 7 L9 -7" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>`;
  }
  if (kind === 'space') {
    return `${base}
      <ellipse cx="110" cy="116" rx="64" ry="9" fill="${INK}" opacity=".12"/>
      <path d="M28 96 L28 44 M192 96 L192 44 M20 44 L200 44" fill="none" ${S} stroke-width="4" stroke-dasharray="7 9"/>
      <path d="M28 96 L28 44 L192 44 L192 96" fill="none" stroke="#2f5bff" stroke-width="4" stroke-dasharray="7 9"/>
      <g transform="translate(110 66)">
        <circle cx="0" cy="-26" r="15" fill="#ffd23f" ${S} stroke-width="4.5"/>
        <path d="M-28 10 Q-28 -12 0 -12 Q28 -12 28 10 L28 26 L-28 26 Z" fill="#fffdf6" ${S} stroke-width="4.5"/>
        <path d="M-30 4 L-52 30 M30 4 L52 30" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
        <path d="M-30 4 L-52 30 M30 4 L52 30" stroke="#fffdf6" stroke-width="7" stroke-linecap="round"/>
        <circle cx="-8" cy="-27" r="2.6" fill="${INK}"/><circle cx="8" cy="-27" r="2.6" fill="${INK}"/>
        <path d="M-5 -20 Q0 -16 5 -20" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      </g>
      <path d="M60 30 L64 20 M64 30 L54 26" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M170 28 L174 18 M174 28 L164 24" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }
  return `${base}
    <ellipse cx="110" cy="116" rx="64" ry="9" fill="${INK}" opacity=".12"/>
    <path d="M22 112 Q22 74 60 74 Q98 74 98 112 Z" fill="#e7d9b8" ${S} stroke-width="4" opacity=".6"/>
    ${glove(96, 58, -18, 0.85)}
    <path d="M60 80 Q72 58 88 52" fill="none" stroke="${INK}" stroke-width="3.5" stroke-dasharray="3 7" stroke-linecap="round"/>
    <g transform="translate(160 44)">
      <path d="${starPath(0, 0, 26)}" fill="#ffd23f" ${S} stroke-width="4.5"/>
      <circle cx="-8" cy="-1" r="2.4" fill="${INK}"/><circle cx="8" cy="-1" r="2.4" fill="${INK}"/>
      <path d="M-5 7 Q0 11 5 7" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    <path d="M140 84 L134 76 M150 88 L150 78 M160 84 L168 74" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".5"/>
    <circle cx="180" cy="92" r="7" fill="#2ed3a0" ${S} stroke-width="3"/>
    <circle cx="52" cy="36" r="5" fill="#c9b6ff" ${S} stroke-width="3"/>
  </svg>`;
}

export const ICONS = {
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 4.5v15l12-7.5z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  hand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11V5.5a1.8 1.8 0 0 1 3.6 0V11M11.6 10V4.2a1.8 1.8 0 0 1 3.6 0V11M15.2 11V6.4a1.8 1.8 0 0 1 3.6 0v7.2c0 3.4-2.4 6.4-5.8 6.4-2.6 0-4.3-1.2-5.7-3.4L4.4 12a1.9 1.9 0 0 1 3-2.3L8.6 11"/></svg>`,
  punch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13V7.2a1.7 1.7 0 0 1 3.4 0V12M9.4 11V5.4a1.7 1.7 0 0 1 3.4 0V11M12.8 11V6.2a1.7 1.7 0 0 1 3.4 0V12"/><path d="M16.2 10.5h1.2a2 2 0 0 1 2 2v3.2A5.8 5.8 0 0 1 13.6 21h-.8a5.6 5.6 0 0 1-4.4-2.2L5 14.5"/><path d="M3 10.5l3 .5"/></svg>`,
  hold: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`,
  pose: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V13l-2-2a2 2 0 0 1 2.8-2.8L9 10V7a1.8 1.8 0 0 1 3.6 0v3-5a1.8 1.8 0 0 1 3.6 0v5-3a1.8 1.8 0 0 1 3.6 0v8.4A5.6 5.6 0 0 1 14.2 21z"/><path d="M3 3l2 2M21 3l-2 2"/></svg>`,
  trace: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c4-1 3-8 7.5-8S14 18 19 16"/><circle cx="5" cy="18" r="2.2"/><path d="M16 4l3 3M17.5 3.5l3 3"/><circle cx="19" cy="16" r="1.6" fill="currentColor" stroke="none"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5a2 2 0 0 1 2-2h2l1.5-2h7l1.5 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.6"/></svg>`,
  sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.6L13 5v14l-5.4-4.5H4z"/><path d="M16.5 9.2a4 4 0 0 1 0 5.6M19.2 6.6a8 8 0 0 1 0 10.8"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  rotate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
};

/** 앱 아이콘 (SVG 파일로도 저장) */
export function appIconSvg(size = 512): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
    <rect width="512" height="512" rx="112" fill="#ffd23f"/>
    <rect x="26" y="26" width="460" height="460" rx="92" fill="none" stroke="#1d1a3a" stroke-width="18" opacity=".9"/>
    <path d="M152 236 Q146 168 196 184 L214 202 Z" fill="#ffd23f" stroke="#1d1a3a" stroke-width="18" stroke-linejoin="round"/>
    <path d="M360 236 Q366 168 316 184 L298 202 Z" fill="#ffd23f" stroke="#1d1a3a" stroke-width="18" stroke-linejoin="round"/>
    <circle cx="256" cy="292" r="124" fill="#ffd23f" stroke="#1d1a3a" stroke-width="18"/>
    <ellipse cx="214" cy="286" rx="14" ry="18" fill="#1d1a3a"/>
    <ellipse cx="298" cy="286" rx="14" ry="18" fill="#1d1a3a"/>
    <circle cx="219" cy="280" r="5" fill="#fff"/>
    <circle cx="303" cy="280" r="5" fill="#fff"/>
    <path d="M232 330 Q256 354 280 330" fill="none" stroke="#1d1a3a" stroke-width="14" stroke-linecap="round"/>
    <ellipse cx="182" cy="316" rx="22" ry="13" fill="#ff6b57" opacity=".45"/>
    <ellipse cx="330" cy="316" rx="22" ry="13" fill="#ff6b57" opacity=".45"/>
    <g transform="translate(392 372) rotate(16)">
      <ellipse cx="0" cy="0" rx="50" ry="46" fill="#ff6b57" stroke="#1d1a3a" stroke-width="16"/>
      <path d="M-24 36 L-24 60" stroke="#1d1a3a" stroke-width="34" stroke-linecap="round"/>
      <path d="M-24 36 L-24 60" stroke="#fffdf6" stroke-width="20" stroke-linecap="round"/>
      <path d="M-20 -20 Q-2 -34 22 -20" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".65"/>
    </g>
    <path d="M108 148 L116 124 L124 148 L148 156 L124 164 L116 188 L108 164 L84 156 Z" fill="#fffdf6" stroke="#1d1a3a" stroke-width="10" stroke-linejoin="round"/>
  </svg>`;
}
