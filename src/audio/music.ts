/** 배경 음악 — 허브(놀이 고르기)와 게임에서 서로 다른 MP3 를 쓴다.
 *  Web Audio GainNode 로 볼륨을 조절하고, 화면을 벗어나면 즉시 멈춘다. */

import { audioNodes, unlockAudio } from './sfx';
import { getSettings } from '../store';

type Track = 'hub' | 'game';
const TRACKS: readonly Track[] = ['hub', 'game'];
const IDS: Record<Track, string> = { hub: 'bgm-hub', game: 'bgm-game' };

const els: Partial<Record<Track, HTMLAudioElement>> = {};
const gains: Partial<Record<Track, GainNode>> = {};
const pauseTimers: Partial<Record<Track, number>> = {};
let desired: Track = 'hub';
let want = false;
let retryArmed = false;
let hiddenPause = false;

function audioEl(track: Track) {
  const cached = els[track];
  if (cached) return cached;
  const el = document.getElementById(IDS[track]) as HTMLAudioElement | null;
  if (!el) return null;
  el.loop = true;
  try {
    el.volume = 1;
  } catch {
    /* iOS 는 volume 읽기 전용일 수 있다 — GainNode 로 조절한다 */
  }
  els[track] = el;
  return el;
}

function level() {
  return getSettings().music ? Math.min(1, Math.max(0, getSettings().musicVolume / 100)) : 0;
}

function applyGain(track: Track, value: number, immediate = false) {
  const g = gains[track];
  if (!g) {
    const el = audioEl(track);
    if (el) {
      try {
        el.volume = value;
      } catch {
        /* noop */
      }
    }
    return;
  }
  const { ac } = audioNodes();
  if (!ac) return;
  const t = ac.currentTime;
  g.gain.cancelScheduledValues(t);
  if (immediate) g.gain.setValueAtTime(value, t);
  else g.gain.setTargetAtTime(value, t, 0.12);
}

function connectGain(track: Track) {
  if (gains[track]) return;
  const el = audioEl(track);
  if (!el) return;
  const { ac } = audioNodes();
  if (!ac) return;
  try {
    const source = ac.createMediaElementSource(el);
    const g = ac.createGain();
    g.gain.value = 0;
    source.connect(g);
    g.connect(ac.destination);
    gains[track] = g;
    try {
      el.volume = 1;
    } catch {
      /* noop */
    }
  } catch {
    // 이미 연결됐거나 Web Audio 를 막은 브라우저 — el.volume 으로 대체
  }
}

function clearPauseTimer(track: Track) {
  const timer = pauseTimers[track];
  if (timer !== undefined) {
    window.clearTimeout(timer);
    pauseTimers[track] = undefined;
  }
}

function fadeOut(track: Track) {
  if (desired === track && want && getSettings().music) return;
  const el = audioEl(track);
  if (!el || el.paused) return;
  applyGain(track, 0);
  clearPauseTimer(track);
  pauseTimers[track] = window.setTimeout(() => {
    pauseTimers[track] = undefined;
    if (desired === track && want && getSettings().music) return;
    el.pause();
  }, 420);
}

function play(track: Track, reset = false) {
  const el = audioEl(track);
  if (!el) return;
  clearPauseTimer(track);
  const { ac } = audioNodes();
  if (ac && ac.state === 'suspended') void ac.resume();
  connectGain(track);
  if (reset && el.paused && el.currentTime > 0.05) {
    try {
      el.currentTime = 0;
    } catch {
      /* noop */
    }
  }
  applyGain(track, level());
  if (el.paused) {
    el.play().catch((err: unknown) => {
      if ((err as DOMException)?.name === 'NotAllowedError') armRetry();
    });
  }
}

function pauseAll(keepWant = false) {
  if (!keepWant) want = false;
  for (const track of TRACKS) {
    clearPauseTimer(track);
    applyGain(track, 0, true);
    audioEl(track)?.pause();
  }
}

function armRetry() {
  if (retryArmed) return;
  retryArmed = true;
  const retry = () => {
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('keydown', retry);
    retryArmed = false;
    if (want && getSettings().music) play(desired);
  };
  window.addEventListener('pointerdown', retry, { once: true });
  window.addEventListener('keydown', retry, { once: true });
}

function pauseForHidden() {
  hiddenPause = want && getSettings().music;
  for (const track of TRACKS) {
    clearPauseTimer(track);
    applyGain(track, 0, true);
    audioEl(track)?.pause();
  }
}

function resumeAfterHidden() {
  if (!hiddenPause) return;
  hiddenPause = false;
  if (!want || !getSettings().music) return;
  play(desired);
}

// 웹페이지를 떠나거나 탭/앱이 가려지면 배경 음악을 멈춘다.
// visibility 는 잠시 가려진 경우라 돌아오면 이어서 재생하고,
// pagehide/unload 는 페이지를 떠나는 것이므로 완전히 멈춘다.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') pauseForHidden();
  else resumeAfterHidden();
});
window.addEventListener('pagehide', () => pauseAll(false));
window.addEventListener('beforeunload', () => pauseAll(false));

export function startMusic(track: Track = 'hub') {
  if (!getSettings().music) {
    pauseAll(false);
    return;
  }
  want = true;
  hiddenPause = false;
  unlockAudio();
  const switching = desired !== track;
  desired = track;
  const { ac } = audioNodes();
  if (ac && ac.state === 'suspended') void ac.resume();
  for (const t of TRACKS) {
    if (t === track) play(track, switching && track === 'game');
    else fadeOut(t);
  }
}

export function stopMusic() {
  pauseAll(false);
}

/** 설정에서 볼륨을 바꾼 뒤 호출한다. (store 값은 이미 저장된 상태) */
export function syncMusicVolume() {
  for (const track of TRACKS) {
    const on = getSettings().music && want && track === desired;
    applyGain(track, on ? level() : 0);
  }
}
