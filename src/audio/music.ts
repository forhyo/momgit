/** 배경 음악 — 사용자가 준 MP3 를 복사해 public/audio 에 둔다.
 *  Web Audio GainNode 로 볼륨을 조절해서 아이폰에서도 게임 효과음과 균형을 맞춘다. */

import { audioNodes, unlockAudio } from './sfx';
import { getSettings } from '../store';

let el: HTMLAudioElement | null = null;
let gain: GainNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let want = false;
let retryArmed = false;

function audioEl() {
  if (el) return el;
  el = document.getElementById('bgm') as HTMLAudioElement | null;
  if (el) {
    el.loop = true;
    try {
      el.volume = 1;
    } catch {
      /* iOS 는 volume 읽기 전용일 수 있다 — GainNode 로 조절한다 */
    }
  }
  return el;
}

function level() {
  return getSettings().music ? Math.min(1, Math.max(0, getSettings().musicVolume / 100)) : 0;
}

function applyGain(value: number, immediate = false) {
  if (!gain) {
    if (el) el.volume = value;
    return;
  }
  const { ac } = audioNodes();
  if (!ac) return;
  const t = ac.currentTime;
  gain.gain.cancelScheduledValues(t);
  if (immediate) {
    gain.gain.setValueAtTime(value, t);
  } else {
    gain.gain.setTargetAtTime(value, t, 0.08);
  }
}

function connectGain() {
  if (gain || !el) return;
  const { ac } = audioNodes();
  if (!ac) return;
  try {
    source = ac.createMediaElementSource(el);
    gain = ac.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(ac.destination);
    try {
      el.volume = 1;
    } catch {
      /* noop */
    }
  } catch {
    // 이미 연결됐거나 Web Audio 를 막은 브라우저 — el.volume 으로 대체
    source = null;
    gain = null;
  }
}

function armRetry() {
  if (retryArmed) return;
  retryArmed = true;
  const retry = () => {
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('keydown', retry);
    retryArmed = false;
    if (want) startMusic();
  };
  window.addEventListener('pointerdown', retry, { once: true });
  window.addEventListener('keydown', retry, { once: true });
}

export function startMusic() {
  if (!getSettings().music) {
    want = false;
    return;
  }
  want = true;
  unlockAudio();
  const a = audioEl();
  if (!a) return;
  const { ac } = audioNodes();
  if (ac && ac.state === 'suspended') void ac.resume();
  connectGain();
  applyGain(level());
  if (a.paused) {
    a.play().catch((err: unknown) => {
      if ((err as DOMException)?.name === 'NotAllowedError') armRetry();
    });
  }
}

export function stopMusic() {
  want = false;
  audioEl()?.pause();
  applyGain(0, true);
}

/** 설정에서 볼륨을 바꾼 뒤 호출한다. (store 값은 이미 저장된 상태) */
export function syncMusicVolume() {
  applyGain(level());
}
