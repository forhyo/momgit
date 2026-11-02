import { sfx } from '../audio/sfx';
import { C, CONFETTI, Particles, face } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type Balloon = {
  player: number;
  baseX: number;
  x: number;
  y: number;
  r: number;
  vy: number;
  phase: number;
  sway: number;
  color: string;
  kind: number;
};

/** 🎈 풍선 가게 — 손을 대면 톡 터진다 */
export class BalloonGame extends BaseGame {
  balloons: Balloon[] = [];
  particles = new Particles();
  private seq = 1;
  private pops: [number, number] = [0, 0];

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    for (let p = 0; p < players; p++) {
      const n = players === 2 ? 3 : 4;
      for (let i = 0; i < n; i++) this.balloons.push(this.spawn(p, i / n));
    }
  }

  private spawn(player: number, stagger = 0): Balloon {
    const f = this.field(player);
    const unit = Math.min(f.w, f.h);
    const kind = this.seq % 3;
    const sizeVar = kind === 0 ? 1 : kind === 1 ? 1.12 : 0.88;
    const r = Math.max(24, unit * (this.players === 2 ? 0.135 : 0.1) * sizeVar);
    const margin = r * 1.5;
    const spread = (this.seq * 0.61803398875) % 1;
    const baseX = f.x + margin + spread * Math.max(1, f.w - margin * 2);
    const color = CONFETTI[(this.seq + player * 2) % CONFETTI.length];
    this.seq++;
    return {
      player,
      baseX,
      x: baseX,
      y: f.y + f.h - stagger * f.h * 0.95,
      r,
      vy: f.h * (0.24 + this.levels[player] * 0.018) * (this.players === 2 ? 0.92 : 1),
      phase: Math.random() * Math.PI * 2,
      sway: r * 0.85,
      color,
      kind,
    };
  }

  protected step(dt: number, hands: Hand[]) {
    const f = this.field(0);
    for (const b of this.balloons) {
      b.phase += dt * 1.7;
      b.y -= b.vy * dt;
      b.x = b.baseX + Math.sin(b.phase) * b.sway;

      if (b.y + b.r * 1.3 < f.y - 30) {
        Object.assign(b, this.spawn(b.player));
        continue;
      }

      for (const hand of hands) {
        if (hand.player !== b.player) continue;
        if (Math.hypot(hand.x - b.x, hand.y - b.y) < b.r * 1.02) {
          this.scores[b.player] += 1;
          this.pops[b.player] += 1;
          sfx('pop');
          this.particles.burst(b.x, b.y, b.color, 13, ['heart', 'star', 'dot']);
          this.particles.ring(b.x, b.y, C.card, b.r * 0.5);
          if (this.pops[b.player] % 8 === 0) {
            this.levels[b.player] += 1;
            this.scores[b.player] += 2;
            sfx('chime');
          }
          Object.assign(b, this.spawn(b.player));
          break;
        }
      }
    }
    this.particles.update(dt);
  }

  punch(_p: Punch) {
    /* 손을 대는 판정만 쓴다 */
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      for (const b of this.balloons) {
        if (b.player !== p) continue;
        b.baseX = Math.min(f.x + f.w - b.r * 1.5, Math.max(f.x + b.r * 1.5, b.baseX));
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    // 가게 차양 (플레이어별)
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      ctx.save();
      const awningY = f.y - 24;
      const awningPath = () => {
        ctx.beginPath();
        ctx.moveTo(f.x - 6, awningY - 22);
        ctx.lineTo(f.x + f.w + 6, awningY - 22);
        ctx.lineTo(f.x + f.w + 6, awningY);
        for (let x = f.x + f.w + 6; x > f.x - 6; x -= 34) {
          ctx.quadraticCurveTo(x - 17, awningY + 16, x - 34, awningY);
        }
        ctx.closePath();
      };
      awningPath();
      ctx.fillStyle = C.coral;
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = C.card;
      for (let x = f.x - 10; x < f.x + f.w + 20; x += 68) {
        ctx.fillRect(x + 34, awningY - 24, 32, 64);
      }
      ctx.restore();
      awningPath();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    for (const b of this.balloons) {
      const ry = b.r * 1.14;
      ctx.save();

      // 실
      ctx.strokeStyle = 'rgba(29,26,58,0.45)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + ry);
      ctx.quadraticCurveTo(b.x + 11, b.y + ry + b.r * 0.75, b.x - 5, b.y + ry + b.r * 1.35);
      ctx.stroke();

      // 몸통
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4.5;
      ctx.stroke();

      // 하이라이트
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = C.card;
      ctx.beginPath();
      ctx.ellipse(b.x - b.r * 0.36, b.y - ry * 0.4, b.r * 0.2, ry * 0.13, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      face(ctx, b.x, b.y + ry * 0.04, b.r * 0.74);

      // 매듭
      ctx.beginPath();
      ctx.moveTo(b.x - b.r * 0.13, b.y + ry);
      ctx.lineTo(b.x + b.r * 0.13, b.y + ry);
      ctx.lineTo(b.x, b.y + ry + b.r * 0.18);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // 반짝임
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(time * 2.4 + b.phase));
      ctx.globalAlpha = tw;
      ctx.fillStyle = C.card;
      ctx.beginPath();
      ctx.arc(b.x + b.r * 0.62, b.y - ry * 0.72, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 가게 카운터 — 풍선이 뒤에서 올라오는 느낌 (플레이어별)
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      const counterH = Math.min(58, f.h * 0.1);
      const counterY = f.y + f.h - 4;
      ctx.save();
      ctx.fillStyle = '#f0bf74';
      ctx.fillRect(f.x - 10, counterY, f.w + 20, counterH);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(f.x - 10, counterY);
      ctx.lineTo(f.x + f.w + 10, counterY);
      ctx.stroke();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = C.ink;
      for (let x = f.x - 10; x < f.x + f.w + 10; x += 44) {
        ctx.fillRect(x, counterY + 4, 3, counterH);
      }
      ctx.restore();
    }

    this.particles.draw(ctx);
  }
}
