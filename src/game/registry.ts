import { GAME_ART, ICONS } from '../brand';
import type { MiniGame } from './types';
import { BalloonGame } from './balloon';
import { IceGame } from './ice';
import { StarGame } from './star';
import { MoleGame } from './mole';
import { OrchardGame } from './orchard';
import { DrumGame } from './drum';

export const GAME_IDS = ['balloon', 'ice', 'star', 'mole', 'orchard', 'drum'] as const;
export type GameId = (typeof GAME_IDS)[number];

export type ControlKind = 'hand' | 'punch' | 'hold' | 'move';

export type GameMeta = {
  id: GameId;
  title: string;
  tagline: string;
  desc: string;
  control: ControlKind;
  controlLabel: string;
  hint: string;
  tip: string;
  color: string;
  art: () => string;
  create: (players: 1 | 2, seconds: number, w: number, h: number) => MiniGame;
  /** 2★, 3★ 기준 (1분 기준 점수) */
  tiers: [number, number];
};

export const GAMES: GameMeta[] = [
  {
    id: 'balloon',
    title: '풍선 가게',
    tagline: '손을 대면 톡!',
    desc: '둥실둥실 올라오는 풍선을 손으로 콕. 손이 닿으면 터져요.',
    control: 'hand',
    controlLabel: '손 대기',
    hint: '풍선에 손을 대 보세요',
    tip: '손을 크게 움직이지 않아도 돼요.',
    color: '#bfe4ff',
    art: GAME_ART.balloon,
    create: (p, s, w, h) => new BalloonGame(p, s, w, h),
    tiers: [14, 25],
  },
  {
    id: 'ice',
    title: '얼음 공장',
    tagline: '빠르게 휘둘러 쾅!',
    desc: '얼음 블록을 다섯 번 두드리면 깨져요. 손을 빠르게 지나가게!',
    control: 'punch',
    controlLabel: '손 휘두르기',
    hint: '얼음을 향해 손을 휘둘러요',
    tip: '손을 멈추지 말고 빠르게 지나가게 해 보세요.',
    color: '#cdf1e4',
    art: GAME_ART.ice,
    create: (p, s, w, h) => new IceGame(p, s, w, h),
    tiers: [4, 7],
  },
  {
    id: 'star',
    title: '별 관측소',
    tagline: '잠깐 멈춰서 반짝',
    desc: '손을 별 위에 잠깐 머물게 하면 별이 손안에 모여요.',
    control: 'hold',
    controlLabel: '손 멈추기',
    hint: '손을 별 위에 잠깐 멈춰요',
    tip: '별이 사라지기 전에 손을 대 보세요.',
    color: '#2f2a66',
    art: GAME_ART.star,
    create: (p, s, w, h) => new StarGame(p, s, w, h),
    tiers: [5, 9],
  },
  {
    id: 'mole',
    title: '두더지 밭',
    tagline: '콕 찍어 잡아요',
    desc: '고개를 내미는 두더지를 손으로 콕. 금방 들어가니 재빨리!',
    control: 'hand',
    controlLabel: '손 대기',
    hint: '올라온 두더지를 콕!',
    tip: '두더지는 잠깐만 얼굴을 내밀어요.',
    color: '#d9f0a8',
    art: GAME_ART.mole,
    create: (p, s, w, h) => new MoleGame(p, s, w, h),
    tiers: [8, 15],
  },
  {
    id: 'orchard',
    title: '과일 과수원',
    tagline: '손으로 바구니를',
    desc: '손을 좌우로 움직여 떨어지는 과일을 바구니로 받아요.',
    control: 'move',
    controlLabel: '손 좌우로',
    hint: '손을 좌우로 움직여 바구니를 옮겨요',
    tip: '벌에 닿으면 잠깐 움직이지 못해요.',
    color: '#ffd9c2',
    art: GAME_ART.orchard,
    create: (p, s, w, h) => new OrchardGame(p, s, w, h),
    tiers: [10, 18],
  },
  {
    id: 'drum',
    title: '축제 북',
    tagline: '박자에 맞춰 쾅!',
    desc: '음표가 판정선에 닿을 때 손을 튕기면 점수가 올라가요.',
    control: 'punch',
    controlLabel: '박자 펀치',
    hint: '음표가 판정선에 닿을 때 손을 튕겨요',
    tip: '완벽한 타이밍은 PERFECT! 3점이에요.',
    color: '#ffd7cd',
    art: GAME_ART.drum,
    create: (p, s, w, h) => new DrumGame(p, s, w, h),
    tiers: [18, 32],
  },
];

export function gameById(id: string): GameMeta {
  return GAMES.find((g) => g.id === id) ?? GAMES[0];
}

export function starsFor(game: GameMeta, score: number, seconds: number) {
  const k = seconds / 60;
  const twoAt = game.tiers[0] * k;
  const threeAt = game.tiers[1] * k;
  if (score >= threeAt) return 3;
  if (score >= twoAt) return 2;
  return score > 0 ? 1 : 0;
}

export function controlIcon(kind: ControlKind) {
  return ICONS[kind === 'hand' ? 'hand' : kind === 'punch' ? 'punch' : kind === 'hold' ? 'hold' : 'hand'];
}
