/** 캔버스 아트 — 굵은 잉크 선 + 플랫 컬러 + 종이 질감 */

export const C = {
  ink: '#1d1a3a',
  inkSoft: '#3a3560',
  paper: '#f7f1df',
  card: '#fffdf6',
  white: '#ffffff',
  yellow: '#ffd23f',
  yellowDeep: '#d9a116',
  blue: '#2f5bff',
  coral: '#ff6b57',
  coralDark: '#d8432d',
  mint: '#2ed3a0',
  mintDeep: '#0f8a62',
  sky: '#8ecaff',
  pink: '#ffb3c7',
  lilac: '#c9b6ff',
  peach: '#ffc9a3',
  lime: '#b8e986',
  dirt: '#c98a5b',
  dirtDeep: '#8a6146',
};

export const PLAYER_MAIN = [C.coral, C.blue];
export const PLAYER_SOFT = ['#ffd9d2', '#d9e2ff'];
export const CONFETTI = [C.yellow, C.coral, C.mint, C.blue, C.pink, C.lilac];

export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

export const starPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points = 5) => {
  const inner = r * 0.46;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

export const heartPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.78);
  ctx.bezierCurveTo(cx - r * 1.5, cy - r * 0.3, cx - r * 0.58, cy - r * 1.36, cx, cy - r * 0.34);
  ctx.bezierCurveTo(cx + r * 0.58, cy - r * 1.36, cx + r * 1.5, cy - r * 0.3, cx, cy + r * 0.78);
  ctx.closePath();
};

export const cloudPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number) => {
  const h = w * 0.4;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.9);
  ctx.bezierCurveTo(x - w * 0.02, y + h * 0.1, x + w * 0.14, y - h * 0.06, x + w * 0.26, y + h * 0.2);
  ctx.bezierCurveTo(x + w * 0.34, y - h * 0.35, x + w * 0.6, y - h * 0.3, x + w * 0.64, y + h * 0.08);
  ctx.bezierCurveTo(x + w * 0.82, y - h * 0.05, x + w, y + h * 0.16, x + w, y + h * 0.52);
  ctx.bezierCurveTo(x + w, y + h * 1.1, x, y + h * 1.1, x, y + h * 0.9);
  ctx.closePath();
};

/** 귀여운 얼굴 (잉크 점 눈 + 입 + 볼) */
export function face(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  opts?: { mood?: 'happy' | 'surprised' | 'sleepy'; blush?: boolean; ink?: string },
) {
  const mood = opts?.mood ?? 'happy';
  const ink = opts?.ink ?? C.ink;
  const eyeR = Math.max(1.8, r * 0.085);

  if (opts?.blush !== false) {
    ctx.fillStyle = 'rgba(255, 107, 87, 0.4)';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + s * r * 0.52, cy + r * 0.18, r * 0.16, r * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = ink;
  if (mood === 'sleepy') {
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * r * 0.32 - eyeR, cy - r * 0.06);
      ctx.quadraticCurveTo(cx + s * r * 0.32, cy + r * 0.06, cx + s * r * 0.32 + eyeR, cy - r * 0.06);
      ctx.stroke();
    }
  } else {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + s * r * 0.32, cy - r * 0.06, eyeR, eyeR * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + s * r * 0.32 + eyeR * 0.3, cy - r * 0.12, eyeR * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1.8, r * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'surprised') {
    ctx.ellipse(cx, cy + r * 0.3, r * 0.08, r * 0.1, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.moveTo(cx - r * 0.17, cy + r * 0.19);
    ctx.quadraticCurveTo(cx, cy + r * 0.36, cx + r * 0.17, cy + r * 0.19);
    ctx.stroke();
  }
}

/** 손 커서 — 브랜드 글러브 */
export function drawGlove(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
  time: number,
  flash = 0,
) {
  const pulse = 1 + Math.sin(time * 7) * 0.035 + flash * 0.16;
  const s = scale * pulse;

  ctx.save();
  ctx.translate(x, y);

  // 접촉 반짝임
  if (flash > 0) {
    ctx.globalAlpha = flash * 0.9;
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + (1 - flash) * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.scale(s, s);

  // 그림자
  ctx.fillStyle = 'rgba(29,26,58,0.18)';
  ctx.beginPath();
  ctx.ellipse(2, 10, 28, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // 손목 커프스
  roundRect(ctx, -14, 20, 28, 17, 7);
  ctx.fillStyle = C.card;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3.6;
  ctx.stroke();

  // 엄지
  ctx.save();
  ctx.rotate(-0.35);
  ctx.beginPath();
  ctx.ellipse(-20, -1, 9, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3.6;
  ctx.stroke();
  ctx.restore();

  // 주먹
  ctx.beginPath();
  ctx.ellipse(2, -2, 22, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();

  // 하이라이트
  ctx.strokeStyle = 'rgba(255,255,255,0.62)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, -13);
  ctx.quadraticCurveTo(0, -20, 11, -13);
  ctx.stroke();

  // 키스팅
  ctx.strokeStyle = 'rgba(29,26,58,0.24)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(2, 12);
  ctx.lineTo(2, 20);
  ctx.stroke();

  ctx.restore();
}

/** 화면 위 작은 라벨 */
export function pill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fill = C.card,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `400 ${size}px Jua, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + size * 1.5;
  const h = size * 1.85;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = Math.max(2, size * 0.11);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.fillText(text, x, y + size * 0.04);
  ctx.restore();
}

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  rot: number;
  vr: number;
  shape: 'heart' | 'star' | 'dot' | 'ring' | 'confetti';
  grow?: number;
};

export class Particles {
  list: Particle[] = [];

  burst(
    x: number,
    y: number,
    color: string,
    count = 8,
    shapes: Particle['shape'][] = ['heart', 'star', 'dot'],
  ) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 90 + Math.random() * 260;
      const life = 0.45 + Math.random() * 0.55;
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 90,
        life,
        max: life,
        color,
        size: 5 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 9,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
  }

  ring(x: number, y: number, color: string, size = 16) {
    this.list.push({
      x, y, vx: 0, vy: 0, life: 0.34, max: 0.34, color, size, rot: 0, vr: 0, shape: 'ring', grow: 70,
    });
  }

  update(dt: number) {
    for (const p of this.list) {
      p.life -= dt;
      if (p.shape === 'ring') {
        p.size += (p.grow ?? 40) * dt;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 560 * dt;
        p.vx *= 1 - dt * 0.9;
        p.rot += p.vr * dt;
      }
    }
    this.list = this.list.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.list) {
      const k = Math.max(0, p.life / p.max);
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'heart') {
        ctx.fillStyle = p.color;
        heartPath(ctx, 0, 0, p.size);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.fillStyle = p.color;
        starPath(ctx, 0, 0, p.size);
        ctx.fill();
      } else if (p.shape === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.35, -p.size * 0.7, p.size * 0.7, p.size * 1.4);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.44, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

/** 뒤쪽에 깔리는 종이 질감 점선/별 장식 */
export function drawPaperDoodles(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 0.12) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.setLineDash([2, 12]);
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
