import { cameraMessage, openCamera, type Camera } from '../motion/camera';
import { createPoseEngine, type PoseEngine, type Pose } from '../motion/pose';
import {
  BodyScale,
  PunchTracker,
  assignPlayers,
  collectHands,
  coverRect,
  shoulderSpan,
  type Cover,
  type HandSample,
  type PunchEvent,
} from '../motion/track';
import { drawScene, type Flash } from '../game/scene';
import { sfx } from '../audio/sfx';
import { startMusic, stopMusic } from '../audio/music';
import { ICONS } from '../brand';
import { $, confirmDialog } from '../dom';
import type { GameMeta } from '../game/registry';

export type RoundResult = {
  game: GameMeta;
  players: 1 | 2;
  scores: [number, number];
  levels: [number, number];
  demo: boolean;
  seconds: number;
};

type Opts = {
  game: GameMeta;
  players: 1 | 2;
  demo: boolean;
  seconds: number;
  onFinish: (r: RoundResult) => void;
  onExit: () => void;
};

let camera: Camera | null = null;
let engine: PoseEngine | null = null;
let raf = 0;
let sessionId = 0;
let countdownTimer = 0;
let hintTimer = 0;
let wake: { release: () => Promise<void> } | null = null;

const stage = () => $('#stage');
const canvas = () => $<HTMLCanvasElement>('#canvas');
const video = () => $<HTMLVideoElement>('#cam');

function hideOverlay() {
  $('#stage-overlay').hidden = true;
}

function showOverlay(
  icon: string,
  title: string,
  text: string,
  actions: { label: string; kind?: 'primary' | 'ghost'; onClick: () => void }[],
  loading = false,
) {
  const overlay = $('#stage-overlay');
  overlay.hidden = false;
  $('#stage-card-icon').innerHTML = icon;
  $('#stage-card-title').textContent = title;
  $('#stage-card-text').innerHTML = text;
  const dots = overlay.querySelector('.dots') as HTMLElement | null;
  if (dots) dots.style.display = loading ? '' : 'none';
  const box = $('#stage-card-actions');
  box.innerHTML = '';
  for (const a of actions) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn ${a.kind === 'ghost' ? 'btn-ghost' : 'btn-primary'}`;
    b.textContent = a.label;
    b.addEventListener('click', a.onClick);
    box.append(b);
  }
}

function setHint(text: string) {
  const hint = $('#stage-hint');
  hint.textContent = text;
  hint.classList.remove('fade', 'hide');
  window.clearTimeout(hintTimer);
  hintTimer = window.setTimeout(() => hint.classList.add('fade'), 7000);
}

function updateScores(game: { players: 1 | 2; scores: [number, number]; levels: [number, number] }) {
  const box = $('#scores');
  if (game.players === 2) {
    box.innerHTML = `
      <div class="score-chip p1 two"><span class="who">P1</span><strong>${game.scores[0]}</strong><span class="lv">Lv.${game.levels[0]}</span></div>
      <div class="score-chip p2"><span class="who">P2</span><strong>${game.scores[1]}</strong><span class="lv">Lv.${game.levels[1]}</span></div>`;
  } else {
    box.innerHTML = `<div class="score-chip"><span class="who">점수</span><strong>${game.scores[0]}</strong><span class="lv">Lv.${game.levels[0]}</span></div>`;
  }
}

function stopMedia() {
  camera?.stop();
  camera = null;
  if (engine) {
    engine.close();
    engine = null;
  }
  video().srcObject = null;
}

export function stopRound() {
  sessionId++;
  window.clearInterval(countdownTimer);
  window.clearTimeout(hintTimer);
  cancelAnimationFrame(raf);
  stopMusic();
  stopMedia();
  void wake?.release().catch(() => undefined);
  wake = null;
  stage().hidden = true;
  document.body.classList.remove('playing');
  hideOverlay();
}

async function requestWakeLock() {
  try {
    const nav = navigator as unknown as {
      wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    if (nav.wakeLock) wake = await nav.wakeLock.request('screen');
  } catch {
    /* 지원하지 않는 브라우저는 그냥 넘어간다 */
  }
}

export function playRound(opts: Opts) {
  stopRound();
  const token = ++sessionId;
  const st = stage();
  st.hidden = false;
  document.body.classList.add('playing');
  void requestWakeLock();

  const game = opts.game.create(opts.players, opts.seconds, window.innerWidth, window.innerHeight);
  $('#hud-title').textContent = `${opts.game.title}`;
  $('#time').textContent = String(opts.seconds);
  $('#timer').classList.remove('urgent');
  setHint(opts.game.hint);
  updateScores(game);

  const status = $('#status-chip');
  status.textContent = opts.demo ? '카메라 없이 놀이 중' : '카메라를 찾는 중…';

  let paused = true;
  let finished = false;
  let poses: Pose[] = [];
  let playerOfPose: number[] = [];
  let hands: HandSample[] = [];
  let spans: (number | null)[] = [null, null];
  const tracker = new PunchTracker();
  const scales = [new BodyScale(), new BodyScale()];
  const flashes: Flash[] = [];
  const pointer = { x: 0, y: 0, px: 0, py: 0, t: 0, lastHit: 0, seen: false };
  let lastVideoTime = -1;
  let lastTick = -1;
  let hudAt = 0;

  const t0 = performance.now();
  let last = t0;

  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    stopMusic();
    sfx('finish');
    camera?.stop();
    camera = null;
    void wake?.release().catch(() => undefined);
    wake = null;
    st.hidden = true;
    document.body.classList.remove('playing');
    hideOverlay();
    opts.onFinish({
      game: opts.game,
      players: opts.players,
      scores: [...game.scores] as [number, number],
      levels: [...game.levels] as [number, number],
      demo: opts.demo,
      seconds: opts.seconds,
    });
  };

  const loop = (now: number) => {
    if (token !== sessionId || finished) return;
    raf = requestAnimationFrame(loop);

    const cvs = canvas();
    const w = Math.round(st.clientWidth);
    const h = Math.round(st.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) {
      cvs.width = Math.round(w * dpr);
      cvs.height = Math.round(h * dpr);
      game.resize(w, h);
    }
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const hidden = document.visibilityState === 'hidden';
    const rawDt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const dt = hidden || paused ? 0 : rawDt;
    const time = (now - t0) / 1000;

    // 포즈 추론
    if (!opts.demo) {
      const v = video();
      if (engine && v.readyState >= 2 && v.currentTime !== lastVideoTime) {
        lastVideoTime = v.currentTime;
        try {
          poses = engine.detect(v, now);
        } catch {
          poses = [];
        }
        const cover = coverRect(v.videoWidth, v.videoHeight, w, h);
        playerOfPose = assignPlayers(poses, cover, opts.players, w);
        hands = collectHands(poses, playerOfPose, cover);
        for (let p = 0; p < opts.players; p++) {
          const pose = poses[p];
          scales[p].update(pose ? shoulderSpan(pose, cover) : null, h);
        }
        spans = scales.slice(0, opts.players).map((s) => s.current);
      }
    }

    let punches: PunchEvent[] = [];

    if (opts.demo) {
      if (pointer.seen) {
        const player = opts.players === 2 && pointer.x > w / 2 ? 1 : 0;
        hands = [{ hand: 15, x: pointer.x, y: pointer.y, player }];
        if (pointer.t > 0) {
          const gap = (now - pointer.t) / 1000;
          if (gap > 0 && gap < 0.26) {
            const v = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py) / gap;
            if (v > h * 0.9 && now - pointer.lastHit > 230) {
              pointer.lastHit = now;
              punches.push({ hand: 15, x: pointer.x, y: pointer.y, player, speed: v });
            }
          }
        }
      } else {
        hands = [];
      }
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.t = now;
    } else {
      punches = tracker.step(dt, hands, spans);
    }

    if (dt > 0) {
      for (const punch of punches) {
        game.punch(punch);
        flashes.push({ x: punch.x, y: punch.y, player: punch.player, life: 0.3, max: 0.3 });
      }
      game.update(dt, hands);
      for (const f of flashes) f.life -= dt;
      for (let i = flashes.length - 1; i >= 0; i--) if (flashes[i].life <= 0) flashes.splice(i, 1);

      const sec = Math.ceil(game.timeLeft);
      if (sec > 0 && sec <= 3 && sec !== lastTick) {
        lastTick = sec;
        sfx('tick');
      }
    }

    const cover: Cover = opts.demo
      ? coverRect(w, h, w, h)
      : coverRect(video().videoWidth || 16, video().videoHeight || 9, w, h);

    drawScene({
      ctx,
      video: opts.demo ? null : video(),
      cover,
      w,
      h,
      game,
      poses: opts.demo ? [] : poses,
      playerOfPose,
      hands,
      time,
      theme: opts.game.color,
      flashes,
    });

    if (now - hudAt > 100) {
      hudAt = now;
      $('#time').textContent = String(Math.ceil(game.timeLeft));
      $('#timer').classList.toggle('urgent', game.timeLeft <= 10);
      updateScores(game);
      if (!opts.demo) {
        status.textContent = hands.length
          ? opts.players === 2
            ? '두 사람 모두 보여요'
            : '몸이 보여요'
          : '손을 화면에 보여 주세요';
      } else {
        status.textContent = '카메라 없이 놀이 중';
      }
    }

    if (game.done) finish();
  };

  const beginCountdown = () => {
    const cd = $('#countdown');
    const num = $('#countdown-num');
    const steps = ['3', '2', '1', '시작!'];
    let i = 0;
    cd.hidden = false;
    num.textContent = steps[0];
    num.style.animation = 'none';
    void num.offsetWidth;
    num.style.animation = '';
    window.clearInterval(countdownTimer);
    countdownTimer = window.setInterval(() => {
      if (token !== sessionId) {
        window.clearInterval(countdownTimer);
        return;
      }
      i++;
      if (i >= steps.length) {
        window.clearInterval(countdownTimer);
        cd.hidden = true;
        paused = false;
        last = performance.now();
        if (opts.game.id === 'drum') startMusic();
        return;
      }
      num.textContent = steps[i];
      num.style.animation = 'none';
      void num.offsetWidth;
      num.style.animation = '';
      if (i < 3) sfx('tap');
    }, 760);
  };

  raf = requestAnimationFrame(loop);

  const exit = () => {
    stopRound();
    opts.onExit();
  };

  if (opts.demo) {
    hideOverlay();
    window.setTimeout(() => {
      if (token === sessionId) beginCountdown();
    }, 220);
  } else {
    showOverlay(
      ICONS.camera,
      '카메라를 켜고 있어요',
      '처음 한 번만 <b>허용</b>을 눌러 주세요.<br>영상은 이 기기 안에서만 써요.',
      [],
      true,
    );

    (async () => {
      try {
        if (!camera) camera = await openCamera(video());
        if (!engine) engine = await createPoseEngine(2);
        if (token !== sessionId) return;
        hideOverlay();
        beginCountdown();
      } catch (e) {
        if (token !== sessionId) return;
        const message = cameraMessage(e);
        showOverlay(ICONS.camera, '카메라가 켜지지 않았어요', message, [
          { label: '다시 해 보기', onClick: () => playRound(opts) },
          {
            label: '카메라 없이 해 보기',
            kind: 'ghost',
            onClick: () => playRound({ ...opts, demo: true }),
          },
          { label: '마을로 돌아가기', kind: 'ghost', onClick: () => exit() },
        ]);
      }
    })();
  }

  $('#btn-back').onclick = async () => {
    const wasPaused = paused;
    paused = true;
    const ok = await confirmDialog({
      title: '그만 놀까요?',
      text: '지금 나가면 이번 판 점수는 사라져요.',
      ok: '그만 놀기',
      cancel: '계속 놀기',
    });
    if (token !== sessionId) return;
    if (ok) exit();
    else paused = wasPaused;
  };

  const cvs = canvas();
  const setPointer = (e: PointerEvent) => {
    if (!opts.demo) return;
    const rect = cvs.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.seen = true;
  };
  cvs.onpointermove = setPointer;
  cvs.onpointerdown = (e) => {
    if (!opts.demo) return;
    setPointer(e);
    const player = opts.players === 2 && pointer.x > st.clientWidth / 2 ? 1 : 0;
    game.punch({ hand: 15, x: pointer.x, y: pointer.y, player, speed: 999 });
    flashes.push({ x: pointer.x, y: pointer.y, player, life: 0.3, max: 0.3 });
  };
  cvs.onpointerleave = () => {
    if (opts.demo) pointer.seen = false;
  };
}

export function isPlaying() {
  return !stage().hidden;
}
