import type { AvatarId } from './brand';
import { STICKERS, AVATARS } from './brand';
import { GAME_IDS, type GameId } from './game/registry';

export type RunRecord = { best: number; plays: number; last: number };
export type Profile = {
  id: string;
  name: string;
  avatar: AvatarId;
  plays: Record<GameId, RunRecord>;
  stickers: number[];
  createdAt: number;
};
export type Settings = {
  sound: boolean;
  music: boolean;
  musicVolume: number;
  round: 30 | 60 | 90;
  demo: boolean;
};

export const DEFAULT_MUSIC_VOLUME = 30;
type State = {
  profiles: Profile[];
  activeId: string;
  settings: Settings;
  plays: number;
};

const KEY = 'momjit.village.v1';

function emptyPlays(): Record<GameId, RunRecord> {
  return Object.fromEntries(GAME_IDS.map((id) => [id, { best: 0, plays: 0, last: 0 }])) as Record<
    GameId,
    RunRecord
  >;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function normalizeVolume(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_MUSIC_VOLUME;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function defaultState(): State {
  const profile: Profile = {
    id: uid(),
    name: '콩이',
    avatar: 'cat',
    plays: emptyPlays(),
    stickers: [],
    createdAt: Date.now(),
  };
  return {
    profiles: [profile],
    activeId: profile.id,
    settings: { sound: true, music: true, musicVolume: DEFAULT_MUSIC_VOLUME, round: 60, demo: false },
    plays: 0,
  };
}

function normalize(raw: unknown): State {
  const fallback = defaultState();
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<State>;
  const profiles = Array.isArray(r.profiles) && r.profiles.length ? r.profiles : fallback.profiles;
  return {
    profiles: profiles.map((p) => ({
      id: typeof p.id === 'string' ? p.id : uid(),
      name: typeof p.name === 'string' ? p.name : '친구',
      avatar: AVATARS.some((a) => a.id === p.avatar) ? p.avatar : 'cat',
      plays: { ...emptyPlays(), ...(p.plays ?? {}) },
      stickers: Array.isArray(p.stickers) ? p.stickers.filter((n) => Number.isInteger(n)) : [],
      createdAt: p.createdAt ?? Date.now(),
    })),
    activeId: r.activeId ?? profiles[0]?.id ?? fallback.activeId,
    settings: {
      sound: r.settings?.sound ?? true,
      music: r.settings?.music ?? true,
      musicVolume: normalizeVolume(r.settings?.musicVolume),
      round: ([30, 60, 90] as const).includes(r.settings?.round as 30) ? (r.settings!.round as 30 | 60 | 90) : 60,
      demo: r.settings?.demo ?? false,
    },
    plays: r.plays ?? 0,
  };
}

let state: State = load();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultState();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 저장 공간이 없어도 놀이는 계속된다 */
  }
}

export function getState() {
  return state;
}

export function getSettings(): Settings {
  return state.settings;
}

export function getActive(): Profile {
  const found = state.profiles.find((p) => p.id === state.activeId);
  if (found) return found;
  state.activeId = state.profiles[0].id;
  return state.profiles[0];
}

export function setActive(id: string) {
  if (state.profiles.some((p) => p.id === id)) {
    state.activeId = id;
    save();
  }
}

export function canAddProfile() {
  return state.profiles.length < 4;
}

export function addProfile(name: string, avatar: AvatarId): Profile | null {
  if (!canAddProfile()) return null;
  const profile: Profile = {
    id: uid(),
    name: name.trim().slice(0, 8) || '친구',
    avatar,
    plays: emptyPlays(),
    stickers: [],
    createdAt: Date.now(),
  };
  state.profiles.push(profile);
  state.activeId = profile.id;
  save();
  return profile;
}

export function deleteProfile(id: string) {
  if (state.profiles.length <= 1) return false;
  state.profiles = state.profiles.filter((p) => p.id !== id);
  if (state.activeId === id) state.activeId = state.profiles[0].id;
  save();
  return true;
}

export function renameProfile(id: string, name: string) {
  const p = state.profiles.find((x) => x.id === id);
  if (!p) return;
  p.name = name.trim().slice(0, 8) || p.name;
  save();
}

export function totalStickers(profile: Profile) {
  return new Set(profile.stickers).size;
}

/** 다음에 받을 스티커. 다 모으면 무작위(반짝이). */
function pickSticker(profile: Profile): { index: number; isNew: boolean } {
  const owned = new Set(profile.stickers);
  const missing = STICKERS.map((_, i) => i).filter((i) => !owned.has(i));
  if (missing.length) {
    return { index: missing[Math.floor(Math.random() * missing.length)], isNew: true };
  }
  return { index: Math.floor(Math.random() * STICKERS.length), isNew: false };
}

export type RunResult = {
  best: number;
  isBest: boolean;
  sticker: { index: number; isNew: boolean };
  stickersTotal: number;
  albumJustCompleted: boolean;
};

export function recordRun(game: GameId, score: number): RunResult {
  const profile = getActive();
  const prev = profile.plays[game];
  const isBest = score > prev.best && score > 0;
  prev.best = Math.max(prev.best, score);
  prev.plays += 1;
  prev.last = Date.now();
  state.plays += 1;

  const before = totalStickers(profile);
  const sticker = pickSticker(profile);
  if (sticker.isNew) profile.stickers.push(sticker.index);
  const stickersTotal = totalStickers(profile);
  save();

  return {
    best: prev.best,
    isBest,
    sticker,
    stickersTotal,
    albumJustCompleted: before < STICKERS.length && stickersTotal >= STICKERS.length,
  };
}

/** 1명 놀이 기록 없이 스티커만 주는 경우(2명 대결) */
export function awardSticker(): RunResult {
  const profile = getActive();
  const before = totalStickers(profile);
  const sticker = pickSticker(profile);
  if (sticker.isNew) profile.stickers.push(sticker.index);
  const stickersTotal = totalStickers(profile);
  save();
  return {
    best: 0,
    isBest: false,
    sticker,
    stickersTotal,
    albumJustCompleted: before < STICKERS.length && stickersTotal >= STICKERS.length,
  };
}

export function setSound(on: boolean) {
  state.settings.sound = on;
  save();
}

export function setMusic(on: boolean) {
  state.settings.music = on;
  save();
}

export function setMusicVolume(volume: number) {
  state.settings.musicVolume = normalizeVolume(volume);
  save();
}

export function setRound(seconds: 30 | 60 | 90) {
  state.settings.round = seconds;
  save();
}

export function setDemo(on: boolean) {
  state.settings.demo = on;
  save();
}

export function resetProgress() {
  const profile = getActive();
  profile.plays = emptyPlays();
  profile.stickers = [];
  state.plays = 0;
  save();
}

/** 2인 대결 여부는 이번 방문 동안만 기억한다. */
export const session = { players: 1 as 1 | 2 };
