import { sfx } from '../audio/sfx';
import { C, CONFETTI, Particles, face, starPath } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type Star = {
  player: number;
  slot: number;
  x: number;
  y: number;
  r: number;
  life: number;
  max: number;
  hold: number;
  color: string;
  phase: number;
};

/** ⭐ 별 관측소 — 손을 별 위에 잠깐 머물게 하면 모인다 */
export class StarGame extends BaseGame {
  stars: Star[] = [];
  particles = new Particles();
  private got: [number, number] = [0, 0];
  private seq = 0;

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    for (let p = 0; p < players; p++) {
      const n = players === 2 ? 3 : 4;
      for (let i = 0; i < n; i++) this.stars.push(this.make(p, i));
    }
  }

  private make(player: number, slot: number): Star {
    const f = this.field(player);
    const sizeVar = [1, 0.82, 1.12, 0.9][this.seq++ % 4];
    const r = Math.max(24, Math.min(f.w, f.h) * (this.players === 2 ? 0.105 : 0.085) * sizeVar);
    const cw = f.w / 2;
    const ch = f.h / 2;
    const c = slot % 2;
    const row = Math.floor(slot / 2) % 2;
    return {
      player,
      slot,
      x: f.x + cw * (c + 0.5) + (Math.random() - 0.5) * cw * 0.24,
      y: f.y + ch * (row + 0.5) + (Math.random() - 0.5) * ch * 0.24,
      r,
      life: 5,
      max: 5,
      hold: 0,
      color: CONFETTI[Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2,
    };
  }

  private respawn(s: Star) {
    const fresh = this.make(s.player, s.slot);
    s.x = fresh.x;
    s.y = fresh.y;
    s.r = fresh.r;
    s.life = fresh.max;
    s.max = fresh.max;
    s.hold = 0;
    s.color = fresh.color;
    s.phase = fresh.phase;
  }

  protected step(dt: number, hands: Hand[]) {
    for (const s of this.stars) {
      s.life -= dt;
      s.phase += dt * 2;
      if (s.life <= 0) {
        this.respawn(s);
        continue;
      }
      const touching = hands.some(
        (hn) => hn.player === s.player && Math.hypot(hn.x - s.x, hn.y - s.y) < s.r * 1.16,
      );
      if (touching) {
        const before = s.hold;
        s.hold += dt;
        if (before < 0.35 && s.hold >= 0.35) {
          this.scores[s.player] += 1;
          this.got[s.player] += 1;
          sfx('sparkle');
          this.particles.burst(s.x, s.y, s.color, 11, ['star', 'heart', 'dot']);
          this.particles.ring(s.x, s.y, C.card, s.r * 0.6);
          if (this.got[s.player] % 6 === 0) {
            this.levels[s.player] += 1;
            this.scores[s.player] += 2;
            sfx('chime');
          }
          this.respawn(s);
        }
      } else {
        s.hold = Math.max(0, s.hold - dt * 2.4);
      }
    }
    this.particles.update(dt);
  }

  punch(_p: Punch) {
    /* 손을 머무는 판정만 쓴다 */
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    for (const s of this.stars) {
      const fresh = this.make(s.player, s.slot);
      s.x = fresh.x;
      s.y = fresh.y;
      s.r = fresh.r;
    }
  }

  render(ctx: CanvasRenderingContext2D, _w: number, _h: number, time: number) {
    const f = this.field(0);

    // 밤하늘 달
    ctx.save();
    ctx.globalAlpha = 0.92;
    const mx = f.x + f.w - Math.min(80, f.w * 0.1);
    const my = f.y + Math.min(60, f.h * 0.08);
    ctx.fillStyle = C.yellow;
    ctx.beginPath();
    ctx.arc(mx, my, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = C.peach;
    for (const [ox, oy, cr] of [
      [-8, -7, 5],
      [9, 5, 4],
      [-3, 11, 3],
    ] as const) {
      ctx.beginPath();
      ctx.arc(mx + ox, my + oy, cr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 별자리 점선
    ctx.save();
    ctx.strokeStyle = 'rgba(255,253,246,0.24)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 9]);
    const starList = this.stars.slice(0, 5);
    for (let i = 1; i < starList.length; i++) {
      ctx.beginPath();
      ctx.moveTo(starList[i - 1].x, starList[i - 1].y);
      ctx.lineTo(starList[i].x, starList[i].y);
      ctx.stroke();
    }
    ctx.restore();

    // 반짝이는 배경 점
    for (let i = 0; i < 14; i++) {
      const x = f.x + ((i * 97.3) % f.w);
      const y = f.y + ((i * 61.7) % f.h);
      const tw = 0.25 + 0.35 * Math.abs(Math.sin(time * 1.6 + i));
      ctx.globalAlpha = tw;
      ctx.fillStyle = C.card;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const s of this.stars) {
      const bob = Math.sin(time * 2 + s.phase) * s.r * 0.1;
      const y = s.y + bob;
      const fade = Math.min(1, s.life / 0.7);

      ctx.save();
      ctx.globalAlpha = fade;

      ctx.beginPath();
      ctx.arc(s.x, y, s.r * 1.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,253,246,0.11)';
      ctx.fill();

      starPath(ctx, s.x, y, s.r);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();
      starPath(ctx, s.x, y, s.r);
      ctx.clip();
      face(ctx, s.x, y + s.r * 0.08, s.r * 0.56);
      ctx.restore();

      // 모으는 링
      if (s.hold > 0) {
        ctx.beginPath();
        ctx.arc(s.x, y, s.r * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, s.hold / 0.35));
        ctx.strokeStyle = C.card;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      const tw = 0.4 + 0.6 * Math.abs(Math.sin(time * 3 + s.phase));
      ctx.globalAlpha = fade * tw;
      ctx.fillStyle = C.card;
      starPath(ctx, s.x + s.r * 0.9, y - s.r * 0.75, s.r * 0.17, 4);
      ctx.fill();
      ctx.restore();
    }
    this.particles.draw(ctx);
  }
}
