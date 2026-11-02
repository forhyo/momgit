import { sfx } from '../audio/sfx';
import { C, CONFETTI, Particles, face, roundRect } from './art';
import type { Punch } from './types';
import { BaseGame, type Hand } from './types';

export const HITS_TO_BREAK = 5;

type Rect = { x: number; y: number; w: number; h: number };
type Block = Rect & {
  player: number;
  slot: number;
  damage: number;
  wobble: number;
  seed: number;
  color: string;
};

function layoutBlocks(count: number, f: Rect): Rect[] {
  const cols = count <= 4 ? 2 : count <= 6 ? 3 : count <= 8 ? 4 : 5;
  const rows = Math.ceil(count / cols);
  const gap = 10;
  const cw = f.w / cols;
  const ch = f.h / rows;
  const bw = Math.min(cw * 0.84, ch * 0.82, 170);
  const bh = bw * 0.92;
  const out: Rect[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const inRow = Math.min(cols, count - r * cols);
    const offset = (f.w - inRow * cw) / 2;
    out.push({
      x: f.x + offset + c * cw + (cw - bw) / 2 + gap * 0,
      y: f.y + r * ch + (ch - bh) / 2,
      w: bw,
      h: bh,
    });
  }
  return out;
}

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** 🧊 얼음 공장 — 손을 빠르게 휘둘러 얼음을 깬다 */
export class IceGame extends BaseGame {
  blocks: Block[] = [];
  particles = new Particles();
  private seq = 1;
  private flakes: { x: number; y: number; r: number; sp: number; ph: number }[] = [];

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    for (let p = 0; p < players; p++) this.spawn(p);
    for (let i = 0; i < 18; i++) {
      this.flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.4 + Math.random() * 2.6,
        sp: 12 + Math.random() * 26,
        ph: Math.random() * 10,
      });
    }
  }

  private count() {
    return this.players === 2 ? 6 : 8;
  }

  private spawn(player: number) {
    const rects = layoutBlocks(this.count(), this.field(player));
    rects.forEach((r, slot) => {
      this.blocks.push({
        ...r,
        player,
        slot,
        damage: 0,
        wobble: 0,
        seed: this.seq * 1.7,
        color: CONFETTI[(this.seq + player) % CONFETTI.length],
      });
      this.seq++;
    });
  }

  /** 화면 크기가 바뀌어도 깨지지 않은 얼음은 원래 자리(슬롯)를 지킨다. */
  private layout(player: number) {
    const rects = layoutBlocks(this.count(), this.field(player));
    for (const b of this.blocks) {
      if (b.player !== player) continue;
      const r = rects[b.slot];
      if (!r) continue;
      b.x = r.x;
      b.y = r.y;
      b.w = r.w;
      b.h = r.h;
    }
  }

  protected step(dt: number, _hands: Hand[]) {
    for (const b of this.blocks) b.wobble = Math.max(0, b.wobble - dt);
    for (const f of this.flakes) {
      f.y += f.sp * dt;
      f.x += Math.sin(f.y * 0.01 + f.ph) * 8 * dt;
      if (f.y > this.h + 10) {
        f.y = -10;
        f.x = Math.random() * this.w;
      }
    }
    this.particles.update(dt);
  }

  punch(p: Punch) {
    if (this.done) return;
    const target = this.blocks.find(
      (b) =>
        b.player === p.player &&
        p.x >= b.x &&
        p.x <= b.x + b.w &&
        p.y >= b.y &&
        p.y <= b.y + b.h,
    );
    if (!target) {
      sfx('miss');
      return;
    }

    target.damage += 1;
    target.wobble = 0.26;
    sfx('punch');

    if (target.damage >= HITS_TO_BREAK) {
      this.scores[target.player] += 1;
      sfx('smash');
      this.particles.burst(
        target.x + target.w / 2,
        target.y + target.h / 2,
        target.color,
        15,
        ['star', 'dot', 'confetti'],
      );
      this.particles.ring(target.x + target.w / 2, target.y + target.h / 2, C.card, target.w * 0.3);
      this.blocks = this.blocks.filter((b) => b !== target);

      if (!this.blocks.some((b) => b.player === target.player)) {
        this.levels[target.player] += 1;
        this.scores[target.player] += 3;
        sfx('chime');
        this.spawn(target.player);
      }
    } else {
      this.particles.burst(p.x, p.y, target.color, 4, ['dot', 'star']);
      this.particles.ring(p.x, p.y, C.card, 9);
    }
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    for (let p = 0; p < this.players; p++) this.layout(p);
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    // 눈송이
    ctx.save();
    ctx.fillStyle = 'rgba(255,253,246,0.9)';
    for (const f of this.flakes) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 얼음 공장 천장 고드름 + 컨베이어 벨트 (플레이어별)
    const iceN = this.players === 2 ? 8 : 12;
    for (let p = 0; p < this.players; p++) {
      const fp = this.field(p);
      ctx.save();
      for (let i = 0; i < iceN; i++) {
        const x = fp.x + ((i + 0.5) / iceN) * fp.w;
        const len = 9 + ((i * 7) % 4) * 6;
        ctx.beginPath();
        ctx.moveTo(x - 7, fp.y - 10);
        ctx.lineTo(x + 7, fp.y - 10);
        ctx.lineTo(x, fp.y + len);
        ctx.closePath();
        ctx.fillStyle = 'rgba(142,202,255,0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(29,26,58,0.45)';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }
      ctx.restore();

      const beltY = fp.y + fp.h * 0.93;
      ctx.save();
      roundRect(ctx, fp.x - 8, beltY, fp.w + 16, 30, 15);
      ctx.fillStyle = '#cfd8e6';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3.6;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,253,246,0.65)';
      for (let x = fp.x + 2; x < fp.x + fp.w; x += 34) {
        ctx.fillRect(x, beltY + 5, 3, 20);
      }
      ctx.fillStyle = C.card;
      for (let x = fp.x + 18; x < fp.x + fp.w; x += 68) {
        ctx.beginPath();
        ctx.arc(x, beltY + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(29,26,58,0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const b of this.blocks) {
      const wob = b.wobble > 0 ? Math.sin(b.wobble * 90) * 9 * (b.wobble / 0.26) : 0;
      const cx = b.x + b.w / 2 + wob;
      const cy = b.y + b.h / 2;
      const shake = b.wobble > 0 ? Math.sin(time * 60) * 0.02 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(shake);

      roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, b.w * 0.22);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4.2;
      ctx.stroke();

      // 유리 하이라이트
      ctx.globalAlpha = 0.55;
      roundRect(ctx, -b.w * 0.36, -b.h * 0.4, b.w * 0.72, b.h * 0.28, b.w * 0.14);
      ctx.fillStyle = C.card;
      ctx.fill();
      ctx.globalAlpha = 1;

      face(ctx, 0, b.h * 0.08, b.w * 0.34, { mood: b.damage >= 3 ? 'surprised' : 'happy' });

      if (b.damage > 0) {
        ctx.strokeStyle = 'rgba(29,26,58,0.55)';
        ctx.lineWidth = Math.max(2, b.w * 0.028);
        ctx.lineCap = 'round';
        for (let i = 0; i < Math.min(b.damage, HITS_TO_BREAK - 1); i++) {
          const a = rand(b.seed + i) * Math.PI * 2;
          const len = b.w * (0.2 + rand(b.seed + i * 3) * 0.25);
          const sx = Math.cos(a) * b.w * 0.08;
          const sy = Math.sin(a) * b.h * 0.08;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
          ctx.stroke();
        }
      }

      // 남은 체력 점
      const dots = HITS_TO_BREAK - 1;
      for (let i = 0; i < dots; i++) {
        ctx.beginPath();
        ctx.arc(b.w * 0.5 - 10 - i * 8, -b.h * 0.5 + 10, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = i < dots - b.damage ? C.ink : 'rgba(29,26,58,0.18)';
        ctx.fill();
      }
      ctx.restore();
    }

    // 반짝임
    for (const b of this.blocks) {
      if (b.wobble <= 0) continue;
      ctx.save();
      ctx.globalAlpha = b.wobble / 0.26;
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w * 0.6 + (1 - b.wobble / 0.26) * 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.particles.draw(ctx);
  }
}
