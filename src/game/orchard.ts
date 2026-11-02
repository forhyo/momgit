import { sfx } from '../audio/sfx';
import { C, Particles, cloudPath, face, roundRect } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type Fall = {
  player: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  kind: 'apple' | 'pear' | 'plum' | 'bee';
  color: string;
  rot: number;
  vr: number;
  sway: number;
  phase: number;
  seed: number;
};

/** 🧺 과일 과수원 — 손을 좌우로 움직여 바구니로 받는다 */
export class OrchardGame extends BaseGame {
  falls: Fall[] = [];
  particles = new Particles();
  private baskets: number[] = [];
  private stun: [number, number] = [0, 0];
  private timer: [number, number] = [0.45, 0.45];
  private caught: [number, number] = [0, 0];
  private sway: [number, number] = [0, 0];

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    for (let p = 0; p < players; p++) {
      const f = this.field(p);
      this.baskets.push(f.x + f.w / 2);
      this.sway.push(0);
    }
  }

  private basketW(player: number) {
    const f = this.field(player);
    return Math.max(94, Math.min(f.w * 0.38, 200));
  }

  private basketY(player: number) {
    const f = this.field(player);
    return f.y + f.h - this.basketW(player) * 0.38 - 10;
  }

  private spawn(player: number) {
    const f = this.field(player);
    const r = Math.max(19, Math.min(f.w, f.h) * 0.05);
    const roll = Math.random();
    const kind: Fall['kind'] = roll < 0.16 ? 'bee' : roll < 0.5 ? 'apple' : roll < 0.8 ? 'pear' : 'plum';
    const color =
      kind === 'bee'
        ? C.yellow
        : kind === 'apple'
          ? C.coral
          : kind === 'pear'
            ? C.yellow
            : C.lilac;
    this.falls.push({
      player,
      x: f.x + r * 2 + Math.random() * Math.max(1, f.w - r * 4),
      y: f.y - r * 2,
      vy: f.h * (0.34 + Math.random() * 0.15) + (this.levels[player] - 1) * f.h * 0.014,
      r,
      kind,
      color,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 2,
      sway: r * (0.4 + Math.random() * 0.5),
      phase: Math.random() * Math.PI * 2,
      seed: Math.random() * 99,
    });
  }

  protected step(dt: number, hands: Hand[]) {
    for (let p = 0; p < this.players; p++) {
      const hand = hands.find((hn) => hn.player === p);
      const f = this.field(p);
      const half = this.basketW(p) / 2;
      this.sway[p] *= 1 - dt * 8;
      if (hand) {
        const target = Math.max(f.x + half, Math.min(f.x + f.w - half, hand.x));
        const before = this.baskets[p];
        this.baskets[p] += (target - this.baskets[p]) * Math.min(1, dt * 13);
        this.sway[p] += (this.baskets[p] - before) * 0.6;
      }

      this.stun[p] = Math.max(0, this.stun[p] - dt);
      this.timer[p] -= dt;
      if (this.timer[p] <= 0) {
        this.spawn(p);
        this.timer[p] = Math.max(0.36, 0.9 - this.levels[p] * 0.05) * (0.75 + Math.random() * 0.5);
      }
    }

    for (const it of this.falls) {
      it.phase += dt * 2.2;
      it.rot += it.vr * dt;
      it.y += it.vy * dt;
      it.x += Math.sin(it.phase) * it.sway * dt;

      const bw = this.basketW(it.player);
      const bx = this.baskets[it.player];
      const by = this.basketY(it.player);
      const bh = bw * 0.38;
      const inBasket =
        it.y + it.r * 0.6 >= by &&
        it.y - it.r * 0.5 <= by + bh &&
        Math.abs(it.x - bx) <= bw * 0.5 + it.r * 0.3;

      if (inBasket && this.stun[it.player] <= 0) {
        if (it.kind === 'bee') {
          this.stun[it.player] = 0.6;
          sfx('buzz');
          this.particles.burst(it.x, it.y, C.yellow, 9, ['dot']);
          this.particles.ring(it.x, it.y, C.coral, 16);
        } else {
          this.scores[it.player] += 1;
          this.caught[it.player] += 1;
          sfx('catch');
          this.particles.burst(it.x, it.y, it.color, 8, ['heart', 'star', 'dot']);
          this.particles.ring(it.x, it.y, C.card, 13);
          if (this.caught[it.player] % 8 === 0) {
            this.levels[it.player] += 1;
            this.scores[it.player] += 2;
            sfx('chime');
          }
        }
        it.y = Infinity;
        continue;
      }

      const f = this.field(it.player);
      if (it.y - it.r > f.y + f.h + 6) it.y = Infinity;
    }

    this.falls = this.falls.filter((it) => it.y !== Infinity);
    this.particles.update(dt);
  }

  punch(_p: Punch) {
    /* 손 위치만 쓴다 */
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      this.baskets[p] = Math.max(f.x + 80, Math.min(f.x + f.w - 80, this.baskets[p]));
    }
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);

      // 과수원 마당
      ctx.save();
      roundRect(ctx, f.x, f.y, f.w, f.h, 30);
      ctx.fillStyle = 'rgba(255,205,170,0.46)';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 마당 안쪽 언덕과 풀
      ctx.save();
      roundRect(ctx, f.x, f.y, f.w, f.h, 30);
      ctx.clip();

      const hy = f.y + f.h * 0.62;
      ctx.beginPath();
      ctx.moveTo(f.x - 10, hy + 30);
      ctx.bezierCurveTo(f.x + f.w * 0.25, hy - 30, f.x + f.w * 0.62, hy + 20, f.x + f.w + 10, hy - 10);
      ctx.lineTo(f.x + f.w + 10, f.y + f.h + 10);
      ctx.lineTo(f.x - 10, f.y + f.h + 10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(46,211,160,0.2)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(f.x - 10, f.y + f.h * 0.84);
      ctx.quadraticCurveTo(f.x + f.w * 0.5, f.y + f.h * 0.78, f.x + f.w + 10, f.y + f.h * 0.84);
      ctx.lineTo(f.x + f.w + 10, f.y + f.h + 10);
      ctx.lineTo(f.x - 10, f.y + f.h + 10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(184,233,134,0.4)';
      ctx.fill();

      // 구름
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = C.card;
      ctx.strokeStyle = 'rgba(29,26,58,0.16)';
      ctx.lineWidth = 2.4;
      cloudPath(ctx, f.x + f.w * 0.08, f.y + f.h * 0.1, Math.min(130, f.w * 0.14));
      ctx.fill();
      ctx.stroke();
      cloudPath(ctx, f.x + f.w * 0.58, f.y + f.h * 0.2, Math.min(96, f.w * 0.1));
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 울타리
      const fenceY = f.y + f.h * 0.58;
      ctx.strokeStyle = 'rgba(29,26,58,0.26)';
      ctx.lineWidth = 4;
      for (let x = f.x + 44; x < f.x + f.w - 20; x += 74) {
        ctx.beginPath();
        ctx.moveTo(x, fenceY + 28);
        ctx.lineTo(x, fenceY - 18);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(f.x + 10, fenceY - 10);
      ctx.lineTo(f.x + f.w - 10, fenceY - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(f.x + 10, fenceY + 10);
      ctx.lineTo(f.x + f.w - 10, fenceY + 10);
      ctx.stroke();

      // 풀숲
      ctx.strokeStyle = 'rgba(15,138,98,0.5)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let x = f.x + 22; x < f.x + f.w; x += 41) {
        const base = f.y + f.h * 0.9 + ((x * 7) % 3) * 5;
        ctx.beginPath();
        ctx.moveTo(x, base);
        ctx.quadraticCurveTo(x - 7, base - 8, x - 11, base - 17);
        ctx.moveTo(x, base);
        ctx.quadraticCurveTo(x + 2, base - 10, x + 3, base - 20);
        ctx.moveTo(x, base);
        ctx.quadraticCurveTo(x + 8, base - 7, x + 12, base - 15);
        ctx.stroke();
      }
      ctx.restore();

      // 나무
      const tx = f.x + f.w - Math.min(f.w * 0.09, 68);
      const ty = f.y + f.h * 0.14;
      const tr = Math.min(f.w * 0.14, 88);
      const trunk = () => {
        ctx.beginPath();
        ctx.moveTo(tx, f.y + f.h * 0.86);
        ctx.quadraticCurveTo(tx + 10, f.y + f.h * 0.52, tx, ty + tr * 0.36);
      };
      ctx.save();
      trunk();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.stroke();
      trunk();
      ctx.strokeStyle = '#c98a5b';
      ctx.lineWidth = 9;
      ctx.stroke();

      const blobs: [number, number, number][] = [
        [tx - tr * 0.72, ty + tr * 0.32, tr * 0.66],
        [tx + tr * 0.56, ty + tr * 0.3, tr * 0.7],
        [tx, ty - tr * 0.08, tr],
        [tx - tr * 0.12, ty + tr * 0.56, tr * 0.74],
      ];
      for (const [bx, by, br] of blobs) {
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = C.mint;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 4.5;
        ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const a = -0.4 + i * 0.5;
        const fx = tx + Math.cos(a) * tr * 0.8;
        const fy = ty + Math.sin(a) * tr * 0.7 + tr * 0.1;
        ctx.beginPath();
        ctx.arc(fx, fy, tr * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = [C.coral, C.yellow, C.lilac][i % 3];
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.6;
        ctx.stroke();
      }
      ctx.restore();

      // 바구니
      const bw = this.basketW(p);
      const bh = bw * 0.38;
      const bx = this.baskets[p] + this.sway[p];
      const by = this.basketY(p);
      const tilt = this.stun[p] > 0 ? Math.sin(time * 34) * 0.09 : Math.sin(time * 2 + p) * 0.015;

      ctx.save();
      ctx.translate(bx, by + bh / 2);
      ctx.rotate(tilt);

      // 손잡이
      ctx.beginPath();
      ctx.arc(0, -bh * 0.5, bw * 0.3, Math.PI, 0);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-bw / 2, -bh / 2);
      ctx.lineTo(bw / 2, -bh / 2);
      ctx.lineTo(bw * 0.4, bh / 2);
      ctx.lineTo(-bw * 0.4, bh / 2);
      ctx.closePath();
      ctx.fillStyle = '#e8c79a';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4.2;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(150,110,80,0.55)';
      ctx.lineWidth = 2.4;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * bw * 0.18, -bh / 2 + 3);
        ctx.lineTo(i * bw * 0.14, bh / 2 - 3);
        ctx.stroke();
      }
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-bw * 0.44 + i * 3, -bh * 0.1 + i * bh * 0.29);
        ctx.lineTo(bw * 0.44 - i * 3, -bh * 0.1 + i * bh * 0.29);
        ctx.stroke();
      }
      face(ctx, 0, bh * 0.06, bw * 0.11);
      ctx.restore();
    }

    for (const it of this.falls) {
      ctx.save();
      ctx.translate(it.x, it.y);

      if (it.kind === 'bee') {
        ctx.rotate(Math.sin(time * 16 + it.seed) * 0.16);
        ctx.fillStyle = 'rgba(255,253,246,0.8)';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(s * it.r * 0.75, -it.r * 0.6, it.r * 0.52, it.r * 0.3, s * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = C.ink;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.ellipse(0, 0, it.r, it.r * 0.92, 0, 0, Math.PI * 2);
        ctx.fillStyle = it.color;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3.4;
        ctx.stroke();
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, it.r, it.r * 0.92, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = C.ink;
        for (const off of [-0.3, 0.2, 0.62]) {
          ctx.fillRect(-it.r, it.r * off, it.r * 2, it.r * 0.16);
        }
        ctx.restore();
        face(ctx, 0, -it.r * 0.05, it.r * 0.6, { mood: 'surprised', blush: false });
      } else {
        ctx.rotate(it.rot * 0.22 + Math.sin(time * 2 + it.seed) * 0.05);
        if (it.kind === 'pear') {
          ctx.beginPath();
          ctx.moveTo(0, it.r * 1.05);
          ctx.bezierCurveTo(-it.r * 1.1, it.r * 0.7, -it.r * 0.78, -it.r * 0.55, 0, -it.r * 0.7);
          ctx.bezierCurveTo(it.r * 0.78, -it.r * 0.55, it.r * 1.1, it.r * 0.7, 0, it.r * 1.05);
          ctx.closePath();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, it.r, 0, Math.PI * 2);
        }
        ctx.fillStyle = it.color;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(it.r * 0.16, -it.r * 1.02, it.r * 0.33, it.r * 0.15, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = C.mint;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();

        face(ctx, 0, it.r * 0.08, it.r * 0.62);
      }
      ctx.restore();
    }

    this.particles.draw(ctx);
  }
}
