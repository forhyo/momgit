import type { Pose } from '../motion/pose';
import { toScreen, type Cover } from '../motion/track';
import { C, PLAYER_MAIN, drawGlove, starPath } from './art';
import type { Hand, MiniGame } from './types';

const BONES: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
];

export function drawVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  cover: Cover,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  try {
    ctx.drawImage(video, cover.dx, cover.dy, cover.dw, cover.dh);
  } catch {
    /* 첫 프레임 전 */
  }
  ctx.restore();

  // 종이 위에 붙인 듯한 따뜻한 톤
  ctx.fillStyle = 'rgba(247,241,223,0.34)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(29,26,58,0.05)';
  ctx.fillRect(0, 0, w, h);
}

export function drawDemoBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  theme: string,
) {
  const hex = theme.replace('#', '');
  const r0 = parseInt(hex.slice(0, 2), 16) || 0;
  const g0 = parseInt(hex.slice(2, 4), 16) || 0;
  const b0 = parseInt(hex.slice(4, 6), 16) || 0;
  const dark = (r0 * 0.299 + g0 * 0.587 + b0 * 0.114) / 255 < 0.42;

  if (dark) {
    // 밤하늘: 테마 색을 그대로 깔고 은은한 빛무리만 더한다
    ctx.fillStyle = theme;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(
      w * 0.78,
      h * 0.2,
      0,
      w * 0.78,
      h * 0.2,
      Math.max(w, h) * 0.72,
    );
    glow.addColorStop(0, 'rgba(201,182,255,0.34)');
    glow.addColorStop(0.48, 'rgba(201,182,255,0.08)');
    glow.addColorStop(1, 'rgba(47,42,102,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const horizon = ctx.createLinearGradient(0, h * 0.66, 0, h);
    horizon.addColorStop(0, 'rgba(255,210,63,0)');
    horizon.addColorStop(1, 'rgba(255,210,63,0.14)');
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, '#fffdf6');
    g.addColorStop(0.6, theme);
    g.addColorStop(1, '#ffe9bd');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.save();
  ctx.globalAlpha = dark ? 0.07 : 0.28;
  ctx.fillStyle = C.card;
  const r = Math.min(w, h) * 0.5;
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = dark ? 0.1 : 0.16;
  ctx.strokeStyle = C.ink;
  ctx.setLineDash([2, 14]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w * 0.2, h * 0.85, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 종이 별가루
  for (let i = 0; i < 12; i++) {
    const x = (i * 137.3) % w;
    const y = (i * 89.7) % h;
    const tw = 0.2 + 0.3 * Math.abs(Math.sin(time * 1.4 + i));
    ctx.save();
    ctx.globalAlpha = tw;
    ctx.fillStyle = i % 3 === 0 ? C.coral : i % 3 === 1 ? C.blue : C.yellow;
    starPath(ctx, x, y, 4.5 + (i % 3) * 1.5, 4);
    ctx.fill();
    ctx.restore();
  }
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  poses: Pose[],
  playerOfPose: number[],
  cover: Cover,
) {
  poses.forEach((pose, i) => {
    const color = PLAYER_MAIN[(playerOfPose[i] ?? 0) % 2];
    ctx.save();
    ctx.lineCap = 'round';
    for (const [a, b] of BONES) {
      const la = pose[a];
      const lb = pose[b];
      if (!la || !lb) continue;
      if ((la.visibility ?? 1) < 0.45 || (lb.visibility ?? 1) < 0.45) continue;
      const pa = toScreen(la.x, la.y, cover);
      const pb = toScreen(lb.x, lb.y, cover);
      ctx.strokeStyle = 'rgba(255,253,246,0.75)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
    ctx.restore();
  });
}

export type Flash = { x: number; y: number; player: number; life: number; max: number };

export function drawHands(
  ctx: CanvasRenderingContext2D,
  hands: Hand[],
  w: number,
  h: number,
  time: number,
  flashes: Flash[],
) {
  const scale = Math.max(0.72, Math.min(1.5, Math.min(w, h) / 640));
  for (const hand of hands) {
    drawGlove(ctx, hand.x, hand.y, scale, PLAYER_MAIN[hand.player % 2], time, 0);
  }
  for (const f of flashes) {
    if (f.life <= 0) continue;
    const k = f.life / f.max;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = PLAYER_MAIN[f.player % 2];
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(f.x, f.y, (1 - k) * 46 + 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, players: number) {
  // HUD 가독성을 위한 위쪽 그라데이션
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.2);
  top.addColorStop(0, 'rgba(29,26,58,0.4)');
  top.addColorStop(1, 'rgba(29,26,58,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h * 0.2);

  // 비네트
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.74);
  v.addColorStop(0, 'rgba(29,26,58,0)');
  v.addColorStop(1, 'rgba(29,26,58,0.33)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  if (players === 2) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,253,246,0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 14]);
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.1);
    ctx.lineTo(w / 2, h * 0.92);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawScene(args: {
  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement | null;
  cover: Cover;
  w: number;
  h: number;
  game: MiniGame;
  poses: Pose[];
  playerOfPose: number[];
  hands: Hand[];
  time: number;
  theme: string;
  flashes: Flash[];
}) {
  const { ctx, video, cover, w, h, game, poses, playerOfPose, hands, time, theme, flashes } = args;
  ctx.clearRect(0, 0, w, h);

  if (video && video.readyState >= 2) {
    drawVideo(ctx, video, cover, w, h);
  } else {
    drawDemoBackdrop(ctx, w, h, time, theme);
  }

  // 2P 진영 살짝 구분
  if (game.players === 2) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = C.coral;
    ctx.fillRect(0, 0, w / 2, h);
    ctx.fillStyle = C.blue;
    ctx.fillRect(w / 2, 0, w / 2, h);
    ctx.restore();
  }

  game.render(ctx, w, h, time);

  if (video && poses.length) drawSkeleton(ctx, poses, playerOfPose, cover);
  drawHands(ctx, hands, w, h, time, flashes);
  drawFrame(ctx, w, h, game.players);
}
