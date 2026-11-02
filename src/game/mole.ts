import { sfx } from '../audio/sfx';
import { C, Particles, face, roundRect } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type Mound = {
  player: number;
  x: number;
  y: number;
  r: number;
  up: number;
  target: 0 | 1;
  timer: number;
};

/** 🐹 두더지 밭 — 올라온 두더지를 콕 찍는다 */
export class MoleGame extends BaseGame {
  mounds: Mound[] = [];
  particles = new Particles();
  private hits: [number, number] = [0, 0];
  private seq = 0;

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    for (let p = 0; p < players; p++) this.build(p);
  }

  private build(player: number) {
    const f = this.field(player);
    const cols = 3;
    const rows = 2;
    const cw = f.w / cols;
    const ch = f.h / rows;
    const r = Math.max(28, Math.min(cw * 0.3, ch * 0.24, 54));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.mounds.push({
          player,
          x: f.x + cw * (col + 0.5),
          y: f.y + f.h * 0.24 + ch * row,
          r,
          up: 0,
          target: 0,
          timer: 0.35 + Math.random() * 2.4,
        });
        this.seq++;
      }
    }
  }

  private levelSpeed(player: number) {
    return 1 + (this.levels[player] - 1) * 0.12;
  }

  protected step(dt: number, hands: Hand[]) {
    for (const m of this.mounds) {
      m.timer -= dt;
      if (m.target === 1) {
        m.up = Math.min(1, m.up + dt * 7);
        if (m.timer <= 0) {
          m.target = 0;
          m.timer = Math.max(0.25, (0.65 + Math.random() * 1.5) / this.levelSpeed(m.player));
        }
      } else {
        m.up = Math.max(0, m.up - dt * 6);
        if (m.timer <= 0 && m.up === 0) {
          m.target = 1;
          m.timer = Math.max(0.55, (0.95 + Math.random() * 0.45) / this.levelSpeed(m.player));
        }
      }

      if (m.up > 0.55) {
        const cx = m.x;
        const cy = m.y - m.r * 1.1;
        for (const hn of hands) {
          if (hn.player !== m.player) continue;
          if (Math.hypot(hn.x - cx, hn.y - cy) < m.r * 1.25) {
            this.hit(m);
            break;
          }
        }
      }
    }
    this.particles.update(dt);
  }

  private hit(m: Mound) {
    m.target = 0;
    m.up = 0;
    m.timer = Math.max(0.5, (0.8 + Math.random() * 1.6) / this.levelSpeed(m.player));
    this.scores[m.player] += 1;
    this.hits[m.player] += 1;
    sfx('pop');
    this.particles.burst(m.x, m.y - m.r, '#ffd23f', 10, ['star', 'dot', 'heart']);
    this.particles.ring(m.x, m.y - m.r, C.card, m.r * 0.7);
    if (this.hits[m.player] % 8 === 0) {
      this.levels[m.player] += 1;
      this.scores[m.player] += 2;
      sfx('chime');
    }
  }

  punch(_p: Punch) {
    /* 접촉 판정 */
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      const cols = 3;
      const rows = 2;
      const cw = f.w / cols;
      const ch = f.h / rows;
      const r = Math.max(28, Math.min(cw * 0.3, ch * 0.24, 54));
      let i = 0;
      for (const m of this.mounds) {
        if (m.player !== p) continue;
        const row = Math.floor(i / cols);
        const col = i % cols;
        m.x = f.x + cw * (col + 0.5);
        m.y = f.y + f.h * 0.24 + ch * row;
        m.r = r;
        i++;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      // 밭
      ctx.save();
      roundRect(ctx, f.x, f.y + f.h * 0.16, f.w, f.h * 0.86, 26);
      ctx.fillStyle = 'rgba(184,233,134,0.8)';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 풀숲
      ctx.fillStyle = '#7fd0a8';
      for (let x = f.x + 16; x < f.x + f.w - 10; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, f.y + f.h * 0.2);
        ctx.lineTo(x + 6, f.y + f.h * 0.16 - 9);
        ctx.lineTo(x + 12, f.y + f.h * 0.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    for (const m of this.mounds) {
      const { x, y, r } = m;
      // 두더지 (구멍 뒤)
      if (m.up > 0.01) {
        const cy = y - r * 1.1 * m.up;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - r * 1.4, y - r * 3, r * 2.8, r * 2.9);
        ctx.clip();
        // 몸
        ctx.beginPath();
        ctx.ellipse(x, cy + r * 0.7, r * 0.72, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fillStyle = C.dirtDeep;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 4;
        ctx.stroke();
        // 얼굴
        ctx.beginPath();
        ctx.ellipse(x, cy, r * 0.78, r * 0.72, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#a9755a';
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 4;
        ctx.stroke();
        // 귀
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(x + s * r * 0.76, cy - r * 0.3, r * 0.2, r * 0.17, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#a9755a';
          ctx.fill();
          ctx.strokeStyle = C.ink;
          ctx.lineWidth = 3.4;
          ctx.stroke();
        }
        // 반다나
        ctx.beginPath();
        ctx.moveTo(x - r * 0.62, cy + r * 0.5);
        ctx.lineTo(x + r * 0.62, cy + r * 0.5);
        ctx.lineTo(x + r * 0.25, cy + r * 0.78);
        ctx.lineTo(x, cy + r * 0.56);
        ctx.lineTo(x - r * 0.25, cy + r * 0.78);
        ctx.closePath();
        ctx.fillStyle = C.coral;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3;
        ctx.stroke();

        face(ctx, x, cy - r * 0.04, r * 0.5, { mood: m.up > 0.9 ? 'surprised' : 'happy' });
        ctx.beginPath();
        ctx.ellipse(x, cy + r * 0.22, r * 0.13, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = C.coral;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();
      }

      // 흙 더미
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.32, r * 1.05, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = C.dirt;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 구멍
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.12, r * 0.66, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5e4230';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      ctx.stroke();

      // 작은 꽃
      if (this.seq % 2 === 0) {
        const fx = x + r * 1.35;
        const fy = y + r * 0.45;
        ctx.fillStyle = C.card;
        for (let i = 0; i < 5; i++) {
          const a = (Math.PI * 2 * i) / 5;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * 4.6, fy + Math.sin(a) * 4.6, 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = C.yellow;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 콕! 표시
    for (const m of this.mounds) {
      if (m.up > 0.98 && m.target === 1) {
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.sin(time * 8) * 0.3;
        ctx.strokeStyle = C.card;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(m.x, m.y - m.r * 1.1, m.r * 1.5, 0, Math.PI * 2);
        ctx.setLineDash([3, 11]);
        ctx.stroke();
        ctx.restore();
      }
    }

    this.particles.draw(ctx);
  }
}
