import type { Pose } from './pose';

export const LM = {
  nose: 0,
  lShoulder: 11,
  rShoulder: 12,
  lElbow: 13,
  rElbow: 14,
  lWrist: 15,
  rWrist: 16,
} as const;

export type Cover = { dx: number; dy: number; dw: number; dh: number };

export function coverRect(vw: number, vh: number, cw: number, ch: number): Cover {
  if (!vw || !vh) return { dx: 0, dy: 0, dw: cw, dh: ch };
  const scale = Math.max(cw / vw, ch / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  return { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw, dh };
}

/** 거울 모드: x 를 반전해서 화면 좌표로 */
export function toScreen(x: number, y: number, c: Cover) {
  return { x: c.dx + (1 - x) * c.dw, y: c.dy + y * c.dh };
}

export type HandSample = { hand: number; x: number; y: number; player: number };
export type PunchEvent = { hand: number; x: number; y: number; player: number; speed: number };

/** 어깨 폭(px) — 몸 크기 기준값 */
export function shoulderSpan(pose: Pose, cover: Cover): number | null {
  const a = pose[LM.lShoulder];
  const b = pose[LM.rShoulder];
  if (!a || !b) return null;
  if ((a.visibility ?? 1) < 0.5 || (b.visibility ?? 1) < 0.5) return null;
  return Math.hypot((a.x - b.x) * cover.dw, (a.y - b.y) * cover.dh);
}

/** 몸 크기에 맞춰 펀치 임계값을 잡는다 */
export class BodyScale {
  private value: number | null = null;
  constructor(
    private readonly alpha = 0.3,
    private readonly minRatio = 0.06,
    private readonly maxRatio = 0.5,
  ) {}

  update(raw: number | null, viewHeight: number): number | null {
    if (raw !== null) {
      this.value = this.value === null ? raw : this.value + (raw - this.value) * this.alpha;
    }
    if (this.value === null) return null;
    this.value = Math.min(this.maxRatio * viewHeight, Math.max(this.minRatio * viewHeight, this.value));
    return this.value;
  }

  get current() {
    return this.value;
  }
}

/**
 * 손목 속도 기반 펀치 판정.
 * 임계값 = 어깨 폭 × 0.62 (화면 px/s) → 멀리 서도 가까이 서도 비슷하게.
 */
export class PunchTracker {
  private t = 0;
  private prev = new Map<string, { x: number; y: number; t: number }>();
  private last = new Map<string, number>();

  constructor(
    readonly speed = 0.62,
    readonly minGapS = 0.28,
    readonly staleS = 0.3,
  ) {}

  step(dt: number, hands: HandSample[], spans: (number | null)[]): PunchEvent[] {
    this.t += dt;
    const out: PunchEvent[] = [];
    const seen = new Set<string>();

    for (const h of hands) {
      const key = `${h.player}:${h.hand}`;
      seen.add(key);
      const span = spans[h.player];
      if (!span) continue;
      const threshold = span * this.speed;
      const p = this.prev.get(key);
      if (!p) {
        this.prev.set(key, { x: h.x, y: h.y, t: this.t });
        continue;
      }
      const gap = this.t - p.t;
      let v = 0;
      if (gap > 0 && gap <= this.staleS) v = Math.hypot(h.x - p.x, h.y - p.y) / gap;
      this.prev.set(key, { x: h.x, y: h.y, t: this.t });

      if (v < threshold) continue;
      const lastHit = this.last.get(key) ?? -Infinity;
      if (this.t - lastHit < this.minGapS) continue;
      this.last.set(key, this.t);
      out.push({ hand: h.hand, x: h.x, y: h.y, player: h.player, speed: v });
    }

    for (const key of [...this.prev.keys()]) if (!seen.has(key)) this.prev.delete(key);
    return out;
  }
}

export function collectHands(poses: Pose[], playerOfPose: number[], cover: Cover): HandSample[] {
  const hands: HandSample[] = [];
  poses.forEach((pose, i) => {
    const player = playerOfPose[i] ?? 0;
    for (const idx of [LM.lWrist, LM.rWrist]) {
      const lm = pose[idx];
      if (!lm || (lm.visibility ?? 1) < 0.4) continue;
      const p = toScreen(lm.x, lm.y, cover);
      hands.push({ hand: idx, x: p.x, y: p.y, player });
    }
  });
  return hands;
}

export function assignPlayers(poses: Pose[], cover: Cover, players: number, width: number): number[] {
  if (players < 2) return poses.map(() => 0);
  return poses.map((pose) => {
    const a = pose[LM.lShoulder];
    const b = pose[LM.rShoulder];
    const cx = a && b ? toScreen((a.x + b.x) / 2, (a.y + b.y) / 2, cover).x : width / 2;
    return cx < width / 2 ? 0 : 1;
  });
}

/** 손목 바깥쪽(엘보→손목 방향)으로 살짝 밀어 글러브가 손끝에 오게 한다 */
export function nudgeWrist(pose: Pose, idx: number, cover: Cover, amount = 0.6) {
  const wrist = pose[idx];
  const elbow = pose[idx === LM.lWrist ? LM.lElbow : LM.rElbow];
  if (!wrist) return null;
  const p = toScreen(wrist.x, wrist.y, cover);
  if (!elbow) return p;
  const e = toScreen(elbow.x, elbow.y, cover);
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * amount * 26, y: p.y + (dy / len) * amount * 26 };
}
