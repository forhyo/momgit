/** 게임 공통 타입 + 라운드 규칙 */

export type Hand = { x: number; y: number; player: number; hand: number };
export type Punch = { x: number; y: number; player: number; hand: number; speed: number };

export interface MiniGame {
  readonly players: 1 | 2;
  readonly scores: [number, number];
  readonly levels: [number, number];
  readonly timeLeft: number;
  readonly done: boolean;
  readonly handCount: 1 | 2;
  update(dt: number, hands: Hand[]): void;
  punch(p: Punch): void;
  render(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void;
  resize(w: number, h: number): void;
}

/** 플레이어별 놀이 영역. 2인은 화면을 좌우로 나눈다. */
export function fieldOf(player: number, players: number, w: number, h: number) {
  const halves = players === 2 ? 2 : 1;
  const halfW = w / halves;
  return {
    x: player * halfW + halfW * 0.045,
    y: h * 0.185,
    w: halfW * 0.91,
    h: h * 0.66,
  };
}

export abstract class BaseGame implements MiniGame {
  scores: [number, number] = [0, 0];
  levels: [number, number] = [1, 1];
  timeLeft: number;
  done = false;
  readonly handCount: 1 | 2 = 1;

  constructor(
    readonly players: 1 | 2,
    readonly seconds: number,
    public w: number,
    public h: number,
  ) {
    this.timeLeft = seconds;
  }

  update(dt: number, hands: Hand[]) {
    if (this.done) return;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (this.timeLeft === 0) {
      this.done = true;
    }
    this.step(dt, hands);
  }

  protected abstract step(dt: number, hands: Hand[]): void;
  abstract punch(p: Punch): void;
  abstract render(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void;
  abstract resize(w: number, h: number): void;

  protected field(player: number) {
    return fieldOf(player, this.players, this.w, this.h);
  }
}
