import { sfx } from '../audio/sfx';
import { C, CONFETTI, Particles, pill, roundRect, starPath } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type PoseTarget = {
  name: string;
  /** 필드 기준 두 손 위치 (왼쪽 손, 오른쪽 손) */
  points: [[number, number], [number, number]];
};

const TARGETS: PoseTarget[] = [
  { name: '만세!', points: [[0.3, 0.18], [0.7, 0.18]] },
  { name: '활짝!', points: [[0.13, 0.47], [0.87, 0.47]] },
  { name: '반짝!', points: [[0.42, 0.14], [0.58, 0.14]] },
  { name: '인사!', points: [[0.28, 0.8], [0.72, 0.8]] },
  { name: '하트!', points: [[0.38, 0.5], [0.62, 0.5]] },
];

/** 🎭 그림자 극장 — 무대 위 그림자와 같은 팔 모양을 잠깐 유지한다 */
export class ShadowGame extends BaseGame {
  particles = new Particles();
  private targets: [number, number] = [0, 0];
  private hold: [number, number] = [0, 0];
  private flash: [number, number] = [0, 0];
  private present: [number, number] = [0, 0];
  private hits: [number, number] = [0, 0];

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    this.targets = [Math.floor(Math.random() * TARGETS.length), Math.floor(Math.random() * TARGETS.length)];
  }

  private need(player: number) {
    return Math.max(0.46, 0.86 - (this.levels[player] - 1) * 0.055);
  }

  private tolerance(player: number) {
    const f = this.field(player);
    const base = Math.max(30, Math.min(f.w * 0.18, f.h * 0.15, 84));
    return base * Math.max(0.72, 1 - (this.levels[player] - 1) * 0.035);
  }

  private point(player: number, targetIndex: number, handIndex: 0 | 1) {
    const f = this.field(player);
    const [nx, ny] = TARGETS[targetIndex].points[handIndex];
    return { x: f.x + f.w * nx, y: f.y + f.h * ny };
  }

  private nextTarget(player: number) {
    let next = this.targets[player];
    while (next === this.targets[player]) next = Math.floor(Math.random() * TARGETS.length);
    this.targets[player] = next;
  }

  protected step(dt: number, hands: Hand[]) {
    for (let p = 0; p < this.players; p++) {
      this.flash[p] = Math.max(0, this.flash[p] - dt * 2.7);
      const mine = hands
        .filter((h) => h.player === p)
        .sort((a, b) => a.x - b.x);
      this.present[p] = mine.length;

      if (mine.length < 2) {
        this.hold[p] = Math.max(0, this.hold[p] - dt * 2.2);
        continue;
      }

      const targetIndex = this.targets[p];
      const p0 = this.point(p, targetIndex, 0);
      const p1 = this.point(p, targetIndex, 1);
      const tol = this.tolerance(p);
      const first = mine[0];
      const second = mine[mine.length - 1];
      const matched =
        Math.hypot(first.x - p0.x, first.y - p0.y) <= tol &&
        Math.hypot(second.x - p1.x, second.y - p1.y) <= tol;

      if (!matched) {
        this.hold[p] = Math.max(0, this.hold[p] - dt * 2.5);
        continue;
      }

      this.hold[p] += dt;
      if (this.hold[p] < this.need(p)) continue;

      this.success(p);
    }
    this.particles.update(dt);
  }

  private success(player: number) {
    const f = this.field(player);
    this.hold[player] = 0;
    this.flash[player] = 1;
    this.hits[player] += 1;
    this.scores[player] += 1;

    const center = this.point(player, this.targets[player], 0);
    const center2 = this.point(player, this.targets[player], 1);
    const mx = (center.x + center2.x) / 2;
    const my = (center.y + center2.y) / 2;
    const color = CONFETTI[(this.hits[player] + player) % CONFETTI.length];
    this.particles.burst(mx, my, color, 12, ['star', 'heart', 'dot']);
    this.particles.ring(mx, my, C.card, Math.min(f.w, f.h) * 0.045);

    if (this.hits[player] % 5 === 0) {
      this.levels[player] += 1;
      this.scores[player] += 2;
      sfx('chime');
    } else {
      sfx('sparkle');
    }
    this.nextTarget(player);
  }

  punch(_p: Punch) {
    /* 두 손 위치 판정만 쓴다 */
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      const cx = f.x + f.w / 2;
      const target = TARGETS[this.targets[p]];
      const tol = this.tolerance(p);

      ctx.save();

      // 무대 바닥
      roundRect(ctx, f.x - 4, f.y - 4, f.w + 8, f.h + 8, 30);
      ctx.fillStyle = 'rgba(52,43,92,0.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,253,246,0.28)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 스포트라이트
      ctx.save();
      ctx.globalAlpha = 0.13 + Math.sin(time * 1.7) * 0.02;
      ctx.fillStyle = C.yellow;
      ctx.beginPath();
      ctx.moveTo(cx - f.w * 0.055, f.y);
      ctx.lineTo(cx + f.w * 0.055, f.y);
      ctx.lineTo(f.x + f.w * 0.77, f.y + f.h * 0.86);
      ctx.lineTo(f.x + f.w * 0.23, f.y + f.h * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 무대 조명 바닥
      const floorY = f.y + f.h * 0.84;
      ctx.fillStyle = 'rgba(29,26,58,0.24)';
      ctx.beginPath();
      ctx.ellipse(cx, floorY + 12, f.w * 0.44, f.h * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();

      // 커튼
      ctx.fillStyle = 'rgba(255,107,87,0.9)';
      ctx.fillRect(f.x - 4, f.y - 4, f.w + 8, 14);
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? f.x - 4 : f.x + f.w + 4;
        const dir = i === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(side, f.y);
        ctx.quadraticCurveTo(side + dir * f.w * 0.06, f.y + f.h * 0.24, side - dir * f.w * 0.01, f.y + f.h * 0.78);
        ctx.lineTo(side - dir * f.w * 0.01, f.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,107,87,0.2)';
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(29,26,58,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(f.x - 4, f.y + 10);
      ctx.lineTo(f.x + f.w + 4, f.y + 10);
      ctx.stroke();

      // 그림자 인형
      this.drawPuppet(ctx, p, target, cx);

      // 목표 손 자리
      for (let i = 0; i < 2; i++) {
        const pt = this.point(p, this.targets[p], i as 0 | 1);
        const k = Math.min(1, this.hold[p] / this.need(p));
        const pulse = 1 + Math.sin(time * 4.5 + i) * 0.045;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = `rgba(255,210,63,${0.08 + k * 0.16})`;
        ctx.beginPath();
        ctx.arc(0, 0, tol * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.setLineDash([5, 8]);
        ctx.strokeStyle = k > 0 ? C.yellow : 'rgba(255,253,246,0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, tol * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (k > 0) {
          ctx.strokeStyle = C.yellow;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, 0, tol * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255,253,246,0.92)';
        starPath(ctx, 0, 0, Math.max(7, tol * 0.16), 4);
        ctx.fill();
        ctx.restore();
      }

      // 목표 이름
      pill(ctx, target.name, cx, f.y + 25, Math.max(17, Math.min(24, f.w * 0.032)), C.card, 0.94);

      // 유지 게이지
      const barW = Math.min(f.w * 0.52, 300);
      const barH = Math.max(7, Math.min(11, f.h * 0.018));
      const barX = cx - barW / 2;
      const barY = f.y + f.h * 0.925;
      const k = Math.min(1, this.hold[p] / this.need(p));
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.fillStyle = 'rgba(255,253,246,0.28)';
      ctx.fill();
      if (k > 0) {
        roundRect(ctx, barX, barY, barW * k, barH, barH / 2);
        ctx.fillStyle = C.yellow;
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(29,26,58,0.45)';
      ctx.lineWidth = 2;
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.stroke();

      if (this.present[p] < 2) {
        pill(ctx, '두 손을 보여 주세요', cx, f.y + f.h * 0.76, Math.max(15, Math.min(20, f.w * 0.027)), C.card, 0.9);
      }

      if (this.flash[p] > 0) {
        ctx.save();
        ctx.globalAlpha = this.flash[p] * 0.1;
        ctx.fillStyle = C.yellow;
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.restore();
      }

      ctx.restore();
    }

    this.particles.draw(ctx);
  }

  private drawPuppet(
    ctx: CanvasRenderingContext2D,
    player: number,
    target: PoseTarget,
    cx: number,
  ) {
    const f = this.field(player);
    const unit = Math.min(f.w, f.h);
    const headR = Math.max(18, unit * 0.067);
    const bodyTop = f.y + f.h * 0.43;
    const bodyBottom = f.y + f.h * 0.83;
    const shoulderY = bodyTop + headR * 1.28;
    const shadow = 'rgba(29,26,58,0.46)';

    ctx.save();
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(cx, bodyTop, headR, 0, Math.PI * 2);
    ctx.fill();

    roundRect(ctx, cx - unit * 0.1, shoulderY - 4, unit * 0.2, bodyBottom - shoulderY + 4, unit * 0.1);
    ctx.fillStyle = shadow;
    ctx.fill();

    ctx.strokeStyle = shadow;
    ctx.lineWidth = Math.max(11, unit * 0.033);
    ctx.lineCap = 'round';
    const left = this.point(player, this.targets[player], 0);
    const right = this.point(player, this.targets[player], 1);
    ctx.beginPath();
    ctx.moveTo(cx - unit * 0.085, shoulderY);
    ctx.lineTo(left.x, left.y);
    ctx.moveTo(cx + unit * 0.085, shoulderY);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,253,246,0.2)';
    ctx.beginPath();
    ctx.arc(cx - headR * 0.3, bodyTop - headR * 0.08, headR * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + headR * 0.3, bodyTop - headR * 0.08, headR * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 성공 직후 그림자 테두리가 살짝 반짝인다
    if (this.flash[player] > 0) {
      ctx.globalAlpha = this.flash[player];
      ctx.strokeStyle = C.yellow;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, bodyTop, headR + 8 + (1 - this.flash[player]) * 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 목표 이름과 어울리는 작은 장식
    if (target.name === '하트!') {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = C.pink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 9, bodyTop + headR * 2.4);
      ctx.bezierCurveTo(cx - 25, bodyTop + headR * 1.7, cx, bodyTop + headR * 1.3, cx, bodyTop + headR * 2.2);
      ctx.bezierCurveTo(cx, bodyTop + headR * 1.3, cx + 25, bodyTop + headR * 1.7, cx + 9, bodyTop + headR * 2.4);
      ctx.stroke();
    }

    ctx.restore();
  }
}
