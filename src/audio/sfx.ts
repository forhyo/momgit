/** Web Audio 로 만드는 효과음 — 음원 파일 0개 */

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let noiseBuf: AudioBuffer | null = null;

export function unlockAudio() {
  if (!ac) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ac = new Ctor();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.1;
    master = ac.createGain();
    master.gain.value = 0.55;
    master.connect(comp);
    comp.connect(ac.destination);
    noiseBuf = makeNoise(ac);
  }
  if (ac.state === 'suspended') void ac.resume();
}

export function setMuted(on: boolean) {
  muted = on;
}

/** 배경 반주 모듈이 같은 출력을 쓰도록 노드를 빌려준다. */
export function audioNodes() {
  return { ac, master };
}

export function isMuted() {
  return muted;
}

function makeNoise(ctx: AudioContext) {
  const len = Math.floor(ctx.sampleRate * 0.6);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; slide?: number; delay?: number } = {},
) {
  if (!ac || !master) return;
  const t0 = ac.currentTime + (opts.delay ?? 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, opts.slide), t0 + dur);
  const peak = opts.gain ?? 0.18;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(
  dur: number,
  opts: { gain?: number; filter?: number; type?: BiquadFilterType; delay?: number; slide?: number } = {},
) {
  if (!ac || !master || !noiseBuf) return;
  const t0 = ac.currentTime + (opts.delay ?? 0);
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = opts.type ?? 'bandpass';
  f.frequency.setValueAtTime(opts.filter ?? 1400, t0);
  if (opts.slide) f.frequency.exponentialRampToValueAtTime(opts.slide, t0 + dur);
  f.Q.value = 0.9;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.2, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0, Math.random() * 0.2, dur + 0.02);
}

const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

export type SfxName =
  | 'tap'
  | 'pop'
  | 'punch'
  | 'smash'
  | 'sparkle'
  | 'chime'
  | 'catch'
  | 'buzz'
  | 'miss'
  | 'tick'
  | 'finish'
  | 'stamp'
  | 'perfect'
  | 'drum';

export function sfx(name: SfxName, index = 0) {
  if (muted) return;
  unlockAudio();
  if (!ac) return;

  switch (name) {
    case 'tap':
      tone(660, 0.07, { type: 'triangle', gain: 0.09 });
      break;
    case 'pop':
      tone(880, 0.09, { type: 'sine', gain: 0.2, slide: 220 });
      noise(0.06, { gain: 0.1, filter: 2200 });
      break;
    case 'punch':
      tone(150, 0.12, { type: 'sine', gain: 0.26, slide: 60 });
      noise(0.09, { gain: 0.2, filter: 900, slide: 300 });
      break;
    case 'smash':
      noise(0.3, { gain: 0.24, filter: 2600, slide: 900 });
      tone(1200, 0.16, { type: 'triangle', gain: 0.08, slide: 3000 });
      [0, 0.06, 0.12].forEach((d, i) => tone(880 + i * 220, 0.12, { type: 'square', gain: 0.04, delay: d }));
      break;
    case 'sparkle':
      [0, 0.07, 0.14].forEach((d, i) => tone(NOTES[2 + i], 0.22, { type: 'sine', gain: 0.11, delay: d }));
      break;
    case 'chime':
      [659.25, 830.6, 987.77, 1318.5].forEach((f, i) =>
        tone(f, 0.34, { type: 'triangle', gain: 0.1, delay: i * 0.06 }),
      );
      break;
    case 'catch':
      tone(392, 0.09, { type: 'square', gain: 0.07 });
      tone(587.33, 0.12, { type: 'sine', gain: 0.14, delay: 0.05 });
      break;
    case 'buzz':
      tone(140, 0.22, { type: 'sawtooth', gain: 0.11, slide: 90 });
      break;
    case 'miss':
      tone(220, 0.16, { type: 'triangle', gain: 0.08, slide: 130 });
      break;
    case 'tick':
      tone(1046.5, 0.07, { type: 'square', gain: 0.06 });
      break;
    case 'finish':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(f, 0.4, { type: 'triangle', gain: 0.12, delay: i * 0.09 }),
      );
      noise(0.25, { gain: 0.06, filter: 3000 });
      break;
    case 'stamp':
      noise(0.14, { gain: 0.24, filter: 500 });
      tone(180, 0.16, { type: 'sine', gain: 0.2, slide: 80 });
      tone(880, 0.2, { type: 'triangle', gain: 0.08, delay: 0.08 });
      break;
    case 'perfect':
      tone(1046.5, 0.12, { type: 'square', gain: 0.05 });
      tone(1318.5, 0.16, { type: 'sine', gain: 0.09, delay: 0.04 });
      break;
    case 'drum': {
      const base = [196, 246.94, 293.66];
      tone(base[index % 3] * 0.5, 0.14, { type: 'sine', gain: 0.26, slide: base[index % 3] * 0.28 });
      noise(0.08, { gain: 0.14, filter: 1800 });
      break;
    }
  }
}
