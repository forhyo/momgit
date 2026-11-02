/** 축제 북 배경 반주 — 아주 가벼운 8비트 루프 (파일 없음) */

import { audioNodes, unlockAudio } from './sfx';

let timer: number | null = null;
let nextTime = 0;
let step = 0;
const BPM = 96;
const STEP = 60 / BPM / 2; // 8분음표
const BASS = [110, 110, 130.81, 130.81, 98, 98, 146.83, 130.81];

function kick(t: number, gain: number) {
  const { ac, master } = audioNodes();
  if (!ac || !master) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.24);
}

function hat(t: number, gain: number) {
  const { ac, master } = audioNodes();
  if (!ac || !master) return;
  const len = Math.floor(ac.sampleRate * 0.05);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 7000;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
}

function bass(t: number, freq: number) {
  const { ac, master } = audioNodes();
  if (!ac || !master) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'triangle';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.22);
}

function schedule() {
  const { ac } = audioNodes();
  if (!ac) return;
  while (nextTime < ac.currentTime + 0.16) {
    if (step % 2 === 0) kick(nextTime, step % 8 === 0 ? 0.2 : 0.12);
    if (step % 4 === 2) hat(nextTime, 0.045);
    if (step % 2 === 1) hat(nextTime, 0.025);
    if (step % 8 === 0 || step % 8 === 6) bass(nextTime, BASS[step % 8]);
    nextTime += STEP;
    step++;
  }
}

export function startMusic() {
  unlockAudio();
  const { ac } = audioNodes();
  if (!ac) return;
  stopMusic();
  nextTime = ac.currentTime + 0.05;
  step = 0;
  timer = window.setInterval(schedule, 25);
}

export function stopMusic() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
}
