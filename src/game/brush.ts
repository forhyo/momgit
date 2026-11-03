import { sfx } from '../audio/sfx';
import { C, CONFETTI, Particles, face, heartPath, pill, roundRect, starPath } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type Point = [number, number];
type PictureKind = 'rainbow' | 'heart' | 'wave' | 'star' | 'flower' | 'cloud' | 'fish' | 'butterfly';

type Picture = {
  kind: PictureKind;
  name: string;
  points: Point[];
  palette: string[];
};

const sample = (n: number, fn: (t: number) => Point): Point[] =>
  Array.from({ length: n + 1 }, (_, i) => fn(i / n));

/** 꼭짓점 사이를 같은 간격으로 나누어 손끝이 따라가기 좋은 선을 만든다. */
const polyline = (vertices: Point[], n: number, closed = true): Point[] => {
  const list = closed ? [...vertices, vertices[0]] : vertices;
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < list.length; i++) {
    const length = Math.hypot(list[i][0] - list[i - 1][0], list[i][1] - list[i - 1][1]);
    lengths.push(length);
    total += length;
  }

  return Array.from({ length: n + 1 }, (_, index) => {
    if (index === n) return [...list[list.length - 1]] as Point;
    let distance = (index / n) * total;
    let segment = 0;
    while (segment < lengths.length - 1 && distance > lengths[segment]) {
      distance -= lengths[segment];
      segment++;
    }
    const k = lengths[segment] ? distance / lengths[segment] : 0;
    return [
      list[segment][0] + (list[segment + 1][0] - list[segment][0]) * k,
      list[segment][1] + (list[segment + 1][1] - list[segment][1]) * k,
    ];
  });
};

/** 둥글둥글한 구름·물고기·나비 윤곽용 Catmull-Rom 샘플링. */
const smooth = (controls: Point[], n: number): Point[] => {
  const len = controls.length;
  const at = (index: number) => controls[(index + len) % len];
  return Array.from({ length: n + 1 }, (_, index) => {
    const t = (index / n) * len;
    const segment = Math.floor(t) % len;
    const u = t - Math.floor(t);
    const p0 = at(segment - 1);
    const p1 = at(segment);
    const p2 = at(segment + 1);
    const p3 = at(segment + 2);
    const u2 = u * u;
    const u3 = u2 * u;
    return [
      0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * u +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
      0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * u +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3),
    ];
  });
};

const RAINBOW: Picture = {
  kind: 'rainbow',
  name: '무지개',
  palette: [C.coral, C.yellow, C.mint, C.blue, C.lilac],
  points: sample(76, (t) => [0.1 + t * 0.8, 0.76 - Math.sin(Math.PI * t) * 0.44]),
};

const HEART: Picture = {
  kind: 'heart',
  name: '하트',
  palette: [C.pink, C.coral, C.yellow, C.lilac],
  points: sample(96, (t) => {
    const a = t * Math.PI * 2;
    const x = 16 * Math.sin(a) ** 3;
    const y =
      13 * Math.cos(a) -
      5 * Math.cos(2 * a) -
      2 * Math.cos(3 * a) -
      Math.cos(4 * a);
    return [0.5 + x * 0.025, 0.49 - y * 0.021];
  }),
};

const WAVE: Picture = {
  kind: 'wave',
  name: '물결',
  palette: [C.sky, C.blue, C.mint, C.lilac],
  points: sample(90, (t) => [
    0.08 + t * 0.84,
    0.58 + Math.sin(t * Math.PI * 4) * 0.15 - t * 0.06,
  ]),
};

const STAR: Picture = {
  kind: 'star',
  name: '별',
  palette: [C.yellow, C.coral, C.mint, C.blue, C.lilac],
  points: polyline(
    Array.from({ length: 10 }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.PI / 5) * i;
      const radius = i % 2 === 0 ? 0.36 : 0.17;
      return [0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius];
    }),
    112,
  ),
};

const FLOWER: Picture = {
  kind: 'flower',
  name: '꽃',
  palette: [C.pink, C.coral, C.yellow, C.lilac, C.mint],
  points: sample(112, (t) => {
    const angle = -Math.PI / 2 + t * Math.PI * 2;
    // 가운데 얼굴이 가려지지 않도록 다섯 송이 꽃잎의 안쪽을 넉넉하게 둔다.
    const radius = 0.255 + 0.078 * Math.cos(5 * angle);
    return [0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius];
  }),
};

const CLOUD: Picture = {
  kind: 'cloud',
  name: '구름',
  palette: [C.sky, C.blue, C.lilac, C.mint],
  points: smooth(
    [
      [0.2, 0.68],
      [0.14, 0.56],
      [0.23, 0.43],
      [0.36, 0.36],
      [0.44, 0.28],
      [0.55, 0.33],
      [0.63, 0.24],
      [0.73, 0.33],
      [0.83, 0.42],
      [0.88, 0.56],
      [0.8, 0.68],
      [0.62, 0.7],
      [0.42, 0.7],
    ],
    112,
  ),
};

const FISH: Picture = {
  kind: 'fish',
  name: '물고기',
  palette: [C.sky, C.blue, C.mint, C.lilac],
  points: smooth(
    [
      [0.84, 0.5],
      [0.76, 0.37],
      [0.6, 0.32],
      [0.45, 0.35],
      [0.32, 0.4],
      [0.22, 0.3],
      [0.13, 0.22],
      [0.18, 0.5],
      [0.13, 0.78],
      [0.22, 0.7],
      [0.32, 0.6],
      [0.45, 0.65],
      [0.6, 0.68],
      [0.76, 0.63],
    ],
    112,
  ),
};

const BUTTERFLY: Picture = {
  kind: 'butterfly',
  name: '나비',
  palette: [C.lilac, C.pink, C.yellow, C.mint],
  points: smooth(
    [
      [0.5, 0.27],
      [0.35, 0.13],
      [0.15, 0.18],
      [0.2, 0.38],
      [0.09, 0.53],
      [0.26, 0.63],
      [0.38, 0.58],
      [0.5, 0.72],
      [0.62, 0.58],
      [0.74, 0.63],
      [0.91, 0.53],
      [0.8, 0.38],
      [0.85, 0.18],
      [0.65, 0.13],
    ],
    112,
  ),
};

const PICTURES = [RAINBOW, HEART, WAVE, STAR, FLOWER, CLOUD, FISH, BUTTERFLY];

/** 🖌️ 무지개 붓 — 손끝으로 점선을 따라가며 그림을 완성한다 */
export class BrushGame extends BaseGame {
  particles = new Particles();
  private picture: [number, number] = [0, 0];
  private progress: [number, number] = [0, 0];
  private delay: [number, number] = [0, 0];
  private present: [number, number] = [0, 0];
  private completed: [number, number] = [0, 0];

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    this.picture = [0, 1 % PICTURES.length];
  }

  private radius(player: number) {
    const f = this.field(player);
    return Math.max(25, Math.min(f.w * 0.105, f.h * 0.115, 62));
  }

  private screenPoints(player: number) {
    const f = this.field(player);
    const tpl = PICTURES[this.picture[player]];
    return tpl.points.map(([nx, ny]) => ({
      x: f.x + f.w * nx,
      y: f.y + f.h * ny,
    }));
  }

  private tip(player: number) {
    const pts = this.screenPoints(player);
    const t = Math.max(0, Math.min(1, this.progress[player]));
    const at = t * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(at));
    const k = at - i;
    return {
      x: pts[i].x + (pts[i + 1].x - pts[i].x) * k,
      y: pts[i].y + (pts[i + 1].y - pts[i].y) * k,
    };
  }

  private nextPicture(player: number) {
    let next = this.picture[player];
    while (next === this.picture[player]) next = Math.floor(Math.random() * PICTURES.length);
    this.picture[player] = next;
  }

  protected step(dt: number, hands: Hand[]) {
    for (let p = 0; p < this.players; p++) {
      this.present[p] = hands.filter((h) => h.player === p).length;

      if (this.delay[p] > 0) {
        this.delay[p] -= dt;
        if (this.delay[p] <= 0) {
          this.delay[p] = 0;
          this.progress[p] = 0;
          this.nextPicture(p);
        }
        continue;
      }

      if (this.present[p] === 0) continue;

      const mine = hands.filter((h) => h.player === p);
      const pts = this.screenPoints(p);
      const n = pts.length;
      const current = Math.min(n - 1, Math.floor(this.progress[p] * (n - 1)));
      const from = Math.max(0, current - 2);
      const to = Math.min(n - 1, current + Math.ceil((n - 1) * 0.2));
      const reach = this.radius(p);
      let best = -1;
      let bestDist = Infinity;

      for (const hand of mine) {
        for (let i = from; i <= to; i++) {
          const d = Math.hypot(hand.x - pts[i].x, hand.y - pts[i].y);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
      }

      if (best < 0 || bestDist > reach) continue;

      const next = best / (n - 1);
      if (next <= this.progress[p]) continue;

      const before = this.progress[p];
      this.progress[p] = next;
      this.paintGain(p, before, next);

      if (this.progress[p] >= 0.992) this.finishPicture(p);
    }

    this.particles.update(dt);
  }

  private paintGain(player: number, before: number, next: number) {
    const oldSection = Math.floor(before * 10);
    const newSection = Math.min(10, Math.floor(next * 10));
    if (newSection <= oldSection) return;

    this.scores[player] += newSection - oldSection;
    if (newSection % 3 === 0) sfx('sparkle');
  }

  private finishPicture(player: number) {
    const f = this.field(player);
    this.progress[player] = 1;
    this.scores[player] += 3;
    this.completed[player] += 1;
    this.levels[player] = this.completed[player] + 1;
    this.delay[player] = 0.85;
    sfx('chime');

    const tip = this.tip(player);
    this.particles.burst(tip.x, tip.y, CONFETTI[player], 14, ['star', 'heart', 'dot']);
    this.particles.burst(
      f.x + f.w / 2,
      f.y + f.h / 2,
      CONFETTI[(player + 2) % CONFETTI.length],
      10,
      ['confetti', 'star'],
    );
    this.particles.ring(tip.x, tip.y, C.card, Math.min(f.w, f.h) * 0.05);
  }

  punch(_p: Punch) {
    /* 손끝 위치만 쓴다 */
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      const cx = f.x + f.w / 2;
      const tpl = PICTURES[this.picture[p]];
      const pts = this.screenPoints(p);
      const brush = this.radius(p);
      const tip = this.tip(p);
      const done = this.delay[p] > 0;

      ctx.save();

      // 종이 캔버스
      roundRect(ctx, f.x - 4, f.y - 4, f.w + 8, f.h + 8, 30);
      ctx.fillStyle = 'rgba(255,253,246,0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,253,246,0.36)';
      ctx.lineWidth = 3;
      ctx.stroke();

      this.drawPictureBackdrop(ctx, p, tpl, cx, time);

      // 아직 칠하지 않은 점선 길 — 밝은 종이 위에서도 잘 보이게
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([3, 13]);
      ctx.lineWidth = Math.max(10, brush * 0.62);
      ctx.strokeStyle = 'rgba(255,253,246,0.7)';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();

      ctx.setLineDash([2, Math.max(9, brush * 0.5)]);
      ctx.lineWidth = Math.max(5, brush * 0.2);
      ctx.strokeStyle = 'rgba(29,26,58,0.42)';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      ctx.restore();

      // 지금까지 칠한 길
      const upto = Math.min(pts.length - 1, Math.floor(this.progress[p] * (pts.length - 1)));
      if (upto > 0) {
        // 잉크 그림자
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(29,26,58,0.18)';
        ctx.lineWidth = brush + 9;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y + 5);
        for (let i = 1; i <= upto; i++) ctx.lineTo(pts[i].x, pts[i].y + 5);
        ctx.stroke();
        ctx.restore();

        // 알록달록 붓터치
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brush;
        for (let i = 0; i < upto; i++) {
          const color = tpl.palette[Math.floor((i / (pts.length - 1)) * tpl.palette.length) % tpl.palette.length];
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
          ctx.stroke();
        }
        ctx.restore();

        // 붓끝의 반짝임
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        starPath(ctx, tip.x, tip.y, Math.max(7, brush * 0.27), 4);
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 시작 지점
      if (this.progress[p] < 0.015 && !done) {
        const s = pts[0];
        const pulse = 1 + Math.sin(time * 4.6) * 0.12;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(pulse, pulse);
        ctx.strokeStyle = C.yellow;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, brush * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,210,63,0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, brush * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 어느 쪽으로 따라갈지 작은 화살표로 알려 준다.
        const nextPt = pts[Math.min(5, pts.length - 1)];
        const angle = Math.atan2(nextPt.y - s.y, nextPt.x - s.x);
        const arrowDist = brush * 1.6;
        ctx.save();
        ctx.translate(s.x + Math.cos(angle) * arrowDist, s.y + Math.sin(angle) * arrowDist);
        ctx.rotate(angle);
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-7, -7);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-7, 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        pill(
          ctx,
          '시작',
          s.x,
          s.y - brush * 1.35,
          Math.max(13, Math.min(17, f.w * 0.024)),
          C.yellow,
          0.96,
        );
      }

      // 완성했을 때
      if (done) {
        const k = 1 - this.delay[p] / 0.85;
        ctx.save();
        ctx.globalAlpha = 0.22 + Math.sin(time * 7) * 0.06;
        ctx.fillStyle = C.yellow;
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.restore();
        pill(
          ctx,
          `${tpl.name} 완성!`,
          cx,
          f.y + f.h * 0.2,
          Math.max(20, Math.min(30, f.w * 0.045)),
          C.card,
          0.96,
        );
        // 완성 반짝이
        ctx.save();
        ctx.globalAlpha = 0.85 * (1 - k);
        for (let i = 0; i < 5; i++) {
          const a = time * 1.7 + i * 1.26;
          const r = Math.min(f.w, f.h) * (0.16 + 0.03 * i);
          ctx.fillStyle = CONFETTI[i % CONFETTI.length];
          starPath(ctx, cx + Math.cos(a) * r, f.y + f.h * 0.45 + Math.sin(a) * r * 0.7, 8, 4);
          ctx.fill();
        }
        ctx.restore();
      }

      // 그림 이름
      pill(
        ctx,
        `${tpl.name} 그리기`,
        cx,
        f.y + 26,
        Math.max(16, Math.min(22, f.w * 0.03)),
        C.card,
        0.92,
      );

      // 진행 막대
      const barW = Math.min(f.w * 0.62, 330);
      const barH = Math.max(7, Math.min(11, f.h * 0.018));
      const barX = cx - barW / 2;
      const barY = f.y + f.h * 0.925;
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.fillStyle = 'rgba(255,253,246,0.3)';
      ctx.fill();
      if (this.progress[p] > 0) {
        roundRect(ctx, barX, barY, barW * this.progress[p], barH, barH / 2);
        ctx.fillStyle = tpl.palette[1] ?? C.yellow;
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(29,26,58,0.45)';
      ctx.lineWidth = 2;
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.stroke();

      if (this.present[p] === 0 && !done) {
        pill(
          ctx,
          '손끝을 보여 주세요',
          cx,
          f.y + f.h * 0.76,
          Math.max(15, Math.min(20, f.w * 0.027)),
          C.card,
          0.9,
        );
      }

      ctx.restore();
    }

    this.particles.draw(ctx);
  }

  private drawPictureBackdrop(
    ctx: CanvasRenderingContext2D,
    player: number,
    tpl: Picture,
    cx: number,
    time: number,
  ) {
    const f = this.field(player);
    const unit = Math.min(f.w, f.h);
    const trace = (points: Point[]) => {
      ctx.beginPath();
      points.forEach(([nx, ny], i) => {
        const x = f.x + f.w * nx;
        const y = f.y + f.h * ny;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    };

    ctx.save();
    switch (tpl.kind) {
      case 'rainbow': {
        const baseY = f.y + f.h * 0.76;
        for (let i = 0; i < 5; i++) {
          const scale = 0.74 + i * 0.085;
          ctx.strokeStyle = tpl.palette[i % tpl.palette.length];
          ctx.globalAlpha = 0.13;
          ctx.lineWidth = Math.max(9, unit * 0.032);
          ctx.beginPath();
          tpl.points.forEach(([nx, ny], j) => {
            const x = cx + (f.x + f.w * nx - cx) * scale;
            const y = baseY + (f.y + f.h * ny - baseY) * scale;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
        break;
      }
      case 'heart': {
        ctx.globalAlpha = 0.18;
        heartPath(ctx, cx, f.y + f.h * 0.48, unit * 0.29);
        ctx.fillStyle = C.pink;
        ctx.fill();
        ctx.strokeStyle = C.coral;
        ctx.lineWidth = 3;
        ctx.stroke();
        break;
      }
      case 'star': {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = C.yellow;
        trace(tpl.points);
        ctx.fill();
        ctx.globalAlpha = 0.38;
        ctx.strokeStyle = C.yellowDeep;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 0.82;
        face(ctx, cx, f.y + f.h * 0.5, unit * 0.095);
        break;
      }
      case 'flower': {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = C.pink;
        trace(tpl.points);
        ctx.fill();
        ctx.globalAlpha = 0.48;
        ctx.strokeStyle = C.coral;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = C.yellow;
        ctx.beginPath();
        ctx.arc(cx, f.y + f.h * 0.5, unit * 0.105, 0, Math.PI * 2);
        ctx.fill();
        face(ctx, cx, f.y + f.h * 0.5, unit * 0.082);
        break;
      }
      case 'cloud': {
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = C.sky;
        trace(tpl.points);
        ctx.fill();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 0.85;
        face(ctx, cx, f.y + f.h * 0.5, unit * 0.075);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = C.sky;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(
            f.x + f.w * (0.28 + i * 0.22),
            f.y + f.h * (0.78 + (i % 2) * 0.04),
            unit * 0.012,
            unit * 0.026,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        break;
      }
      case 'fish': {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = C.sky;
        trace(tpl.points);
        ctx.fill();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 0.85;
        face(ctx, f.x + f.w * 0.58, f.y + f.h * 0.48, unit * 0.062);
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(
            f.x + f.w * (0.83 + i * 0.045),
            f.y + f.h * (0.28 - i * 0.04),
            unit * (0.012 + i * 0.004),
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        break;
      }
      case 'butterfly': {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = C.lilac;
        trace(tpl.points);
        ctx.fill();
        ctx.globalAlpha = 0.58;
        ctx.strokeStyle = C.lilac;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = C.ink;
        ctx.beginPath();
        ctx.ellipse(cx, f.y + f.h * 0.47, unit * 0.023, unit * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = Math.max(2, unit * 0.007);
        ctx.lineCap = 'round';
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx, f.y + f.h * 0.31);
          ctx.quadraticCurveTo(
            cx + side * unit * 0.06,
            f.y + f.h * 0.2,
            cx + side * unit * 0.11,
            f.y + f.h * 0.18,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = C.yellow;
        for (const [x, y] of [
          [0.28, 0.34],
          [0.72, 0.34],
          [0.23, 0.54],
          [0.77, 0.54],
        ] as const) {
          ctx.beginPath();
          ctx.arc(f.x + f.w * x, f.y + f.h * y, unit * 0.026, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'wave':
      default: {
        ctx.globalAlpha = 0.17;
        ctx.strokeStyle = C.sky;
        ctx.lineWidth = Math.max(5, unit * 0.018);
        for (let i = 0; i < 3; i++) {
          const y = f.y + f.h * (0.34 + i * 0.12);
          ctx.beginPath();
          for (let x = 0; x <= 20; x++) {
            const px = f.x + (f.w * x) / 20;
            const py = y + Math.sin(x * 0.8 + time * 0.8 + i) * unit * 0.018;
            if (x === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        break;
      }
    }

    // 종이 위 작은 장식
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 3; i++) {
      const x = f.x + f.w * (0.15 + i * 0.31);
      const y = f.y + f.h * (0.12 + ((i * 7) % 3) * 0.04);
      ctx.fillStyle = CONFETTI[(i + player) % CONFETTI.length];
      starPath(ctx, x, y, Math.max(4, unit * 0.018), 4);
      ctx.fill();
    }
    ctx.restore();
  }
}
