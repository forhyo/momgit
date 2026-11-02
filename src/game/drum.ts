import { sfx } from '../audio/sfx';
import { C, Particles, face, roundRect } from './art';
import { BaseGame, type Hand } from './types';
import type { Punch } from './types';

type Note = {
  player: number;
  lane: number;
  y: number;
  vy: number;
  color: string;
  seed: number;
};

type Pop = { x: number; y: number; text: string; color: string; life: number };

const LANES = 3;
const LANE_COLORS = [C.coral, C.yellow, C.mint];

/** 🥁 축제 북 — 떨어지는 음표가 북에 닿을 때 손을 튕긴다 */
export class DrumGame extends BaseGame {
  notes: Note[] = [];
  particles = new Particles();
  pops: Pop[] = [];
  private spawnIn: [number, number] = [0.9, 0.9];
  private flash: number[][] = [];
  private hits: [number, number] = [0, 0];
  private combo: [number, number] = [0, 0];
  private seed = 1;

  constructor(players: 1 | 2, seconds: number, w: number, h: number) {
    super(players, seconds, w, h);
    this.flash = Array.from({ length: players }, () => [0, 0, 0]);
  }

  private drumY(player: number) {
    return this.field(player).y + this.field(player).h * 0.82;
  }

  private hitY(player: number) {
    return this.field(player).y + this.field(player).h * 0.7;
  }

  private laneX(player: number, lane: number) {
    const f = this.field(player);
    return f.x + f.w * ((lane + 0.5) / LANES);
  }

  private spawn(player: number) {
    const f = this.field(player);
    const lane = Math.floor(Math.random() * LANES);
    const travel = Math.max(1.1, 1.9 - this.levels[player] * 0.08);
    const startY = f.y - 26;
    const dist = this.hitY(player) - startY;
    this.notes.push({
      player,
      lane,
      y: startY,
      vy: dist / travel,
      color: LANE_COLORS[lane],
      seed: this.seed++ * 0.7,
    });
  }

  protected step(dt: number, _hands: Hand[]) {
    for (let p = 0; p < this.players; p++) {
      this.spawnIn[p] -= dt;
      if (this.spawnIn[p] <= 0) {
        this.spawn(p);
        this.spawnIn[p] = Math.max(0.42, 0.95 - this.levels[p] * 0.05) * (0.8 + Math.random() * 0.5);
      }
      for (let l = 0; l < LANES; l++) this.flash[p][l] = Math.max(0, this.flash[p][l] - dt * 3.4);
    }

    for (const n of this.notes) {
      n.y += n.vy * dt;
      const f = this.field(n.player);
      if (n.y > this.hitY(n.player) + f.h * 0.18) {
        n.y = Infinity;
        if (this.combo[n.player] > 2) sfx('miss');
        this.combo[n.player] = 0;
      }
    }
    this.notes = this.notes.filter((n) => n.y !== Infinity);

    for (const p of this.pops) p.life -= dt;
    this.pops = this.pops.filter((p) => p.life > 0);
    this.particles.update(dt);
  }

  punch(p: Punch) {
    if (this.done) return;
    const f = this.field(p.player);
    if (p.x < f.x || p.x > f.x + f.w) return;

    const lane = Math.min(LANES - 1, Math.max(0, Math.floor(((p.x - f.x) / f.w) * LANES)));
    const line = this.hitY(p.player);
    const perfect = f.h * 0.052;
    const good = f.h * 0.12;

    let best: Note | null = null;
    let bestD = Infinity;
    for (const n of this.notes) {
      if (n.player !== p.player || n.lane !== lane) continue;
      const d = Math.abs(n.y - line);
      if (d < bestD) {
        best = n;
        bestD = d;
      }
    }
    if (!best) {
      this.flash[p.player][lane] = 0.5;
      return;
    }

    let text = '';
    let score = 0;
    if (bestD <= perfect) {
      text = 'PERFECT!';
      score = 3;
    } else if (bestD <= good) {
      text = 'GOOD';
      score = 1;
    } else {
      return;
    }

    this.notes = this.notes.filter((n) => n !== best);
    this.scores[p.player] += score;
    this.combo[p.player] += 1;
    this.hits[p.player] += 1;
    this.flash[p.player][lane] = 1;
    sfx('drum', lane);
    if (text === 'PERFECT!') sfx('perfect');

    const x = this.laneX(p.player, lane);
    this.particles.burst(x, line, best.color, text === 'PERFECT!' ? 12 : 7, ['star', 'heart', 'dot']);
    this.particles.ring(x, line, text === 'PERFECT!' ? C.card : C.card, 16);
    this.pops.push({
      x,
      y: line - 38,
      text: this.combo[p.player] >= 3 ? `${text} ×${this.combo[p.player]}` : text,
      color: text === 'PERFECT!' ? '#d9a116' : C.inkSoft,
      life: 0.72,
    });

    if (this.hits[p.player] % 12 === 0) {
      this.levels[p.player] += 1;
      this.scores[p.player] += 3;
      sfx('chime');
    }
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  render(ctx: CanvasRenderingContext2D, w: number, _h: number, time: number) {
    // 축제 깃발
    const f0 = this.field(0);
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(f0.x - 10, f0.y - 46);
    ctx.quadraticCurveTo(w * 0.5, f0.y - 20, f0.x + f0.w + 10, f0.y - 46);
    ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const k = i / 13;
      const x = f0.x - 10 + (f0.w + 20) * k;
      const y = f0.y - 44 + Math.sin(k * Math.PI) * 20;
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.lineTo(x, y + 22);
      ctx.closePath();
      ctx.fillStyle = [C.coral, C.yellow, C.mint, C.sky][i % 4];
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // 등불
      if (i % 4 === 2) {
        const ly = y + 24;
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(x, ly);
        ctx.strokeStyle = 'rgba(29,26,58,0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, ly + 9, 10, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = C.yellow;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 4, ly - 1);
        ctx.lineTo(x + 4, ly - 1);
        ctx.stroke();
      }
    }
    ctx.restore();

    for (let p = 0; p < this.players; p++) {
      const f = this.field(p);
      const lineY = this.hitY(p);
      const drumY = this.drumY(p);

      // 축제 무대
      ctx.save();
      roundRect(ctx, f.x - 8, f.y + f.h * 0.74, f.w + 16, f.h * 0.32, 30);
      ctx.fillStyle = 'rgba(255,253,246,0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(29,26,58,0.2)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 스포트라이트
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = C.yellow;
      const laneW0 = f.w / LANES;
      for (let l = 0; l < LANES; l++) {
        const x = this.laneX(p, l);
        ctx.beginPath();
        ctx.moveTo(x - laneW0 * 0.1, f.y);
        ctx.lineTo(x + laneW0 * 0.1, f.y);
        ctx.lineTo(x + laneW0 * 0.38, lineY);
        ctx.lineTo(x - laneW0 * 0.38, lineY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 레인
      ctx.save();
      ctx.setLineDash([7, 12]);
      ctx.strokeStyle = 'rgba(255,253,246,0.55)';
      ctx.lineWidth = 2.6;
      for (let l = 1; l < LANES; l++) {
        const x = f.x + (f.w / LANES) * l;
        ctx.beginPath();
        ctx.moveTo(x, f.y - 10);
        ctx.lineTo(x, lineY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 판정 패드
      const band = f.h * 0.028;
      for (let l = 0; l < LANES; l++) {
        const x = this.laneX(p, l);
        const padW = (f.w / LANES) * 0.66;
        roundRect(ctx, x - padW / 2, lineY - band, padW, band * 2, band);
        ctx.fillStyle = LANE_COLORS[l];
        ctx.globalAlpha = 0.24;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(29,26,58,0.32)';
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - padW * 0.18, lineY);
        ctx.lineTo(x + padW * 0.18, lineY);
        ctx.strokeStyle = 'rgba(255,253,246,0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();

      // 음표
      const ns = Math.max(19, Math.min(31, (f.w / LANES) * 0.26));
      for (const n of this.notes) {
        if (n.player !== p) continue;
        const x = this.laneX(p, n.lane);
        const near = Math.abs(n.y - lineY) < f.h * 0.06;
        ctx.save();
        ctx.translate(x, n.y);
        ctx.rotate(Math.sin(time * 3 + n.seed) * 0.08);

        if (near) {
          ctx.beginPath();
          ctx.arc(0, 0, ns * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.26;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(0, 0, ns * 1.45, 0, Math.PI * 2);
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, ns * 0.95, ns * 0.78, -0.22, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3.6;
        ctx.stroke();

        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ns * 0.78, -ns * 0.2);
        ctx.lineTo(ns * 0.78, -ns * 1.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ns * 0.78, -ns * 1.75);
        ctx.quadraticCurveTo(ns * 1.7, -ns * 1.5, ns * 1.5, -ns * 0.75);
        ctx.stroke();

        face(ctx, 0, ns * 0.05, ns * 0.5);
        ctx.restore();
      }

      // 북
      const laneW = f.w / LANES;
      const drumW = laneW * 0.76;
      const drumH = Math.max(42, Math.min(88, f.h * 0.12));
      for (let l = 0; l < LANES; l++) {
        const x = this.laneX(p, l);
        const fl = this.flash[p][l];
        const scale = 1 + fl * 0.08 + Math.sin(time * 3 + l) * 0.008;

        ctx.save();
        ctx.translate(x, drumY);
        ctx.scale(scale, scale);

        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * drumW * 0.32, drumH * 0.25);
          ctx.lineTo(s * drumW * 0.42, drumH * 0.78);
          ctx.stroke();
        }

        roundRect(ctx, -drumW / 2, -drumH / 2, drumW, drumH, drumH * 0.3);
        ctx.fillStyle = LANE_COLORS[l];
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, -drumH * 0.34, drumW * 0.47, drumH * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = C.card;
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 3.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, -drumH * 0.34, drumW * 0.3, drumH * 0.11, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(29,26,58,0.28)';
        ctx.lineWidth = 2;
        ctx.stroke();

        face(ctx, 0, drumH * 0.1, drumW * 0.22);

        if (fl > 0) {
          ctx.globalAlpha = fl;
          ctx.strokeStyle = C.card;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, -drumH * 0.34, drumW * 0.55 + (1 - fl) * 24, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      // 콤보
      if (this.combo[p] >= 3) {
        pillCombo(ctx, `×${this.combo[p]}`, f.x + f.w / 2, f.y + 10, Math.max(18, Math.min(28, w * 0.02)));
      }
    }

    for (const pop of this.pops) {
      const k = pop.life / 0.72;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.7);
      ctx.font = `400 ${Math.max(18, Math.min(30, w * 0.022))}px Jua, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = C.card;
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.strokeText(pop.text, pop.x, pop.y - (1 - k) * 26);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y - (1 - k) * 26);
      ctx.restore();
    }

    this.particles.draw(ctx);
  }
}

function pillCombo(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.font = `400 ${size}px Jua, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + size * 1.2;
  roundRect(ctx, x - w / 2, y - size * 0.9, w, size * 1.8, size);
  ctx.fillStyle = C.yellow;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}
