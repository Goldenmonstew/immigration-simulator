import type { JpFullResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { jpBalance as b } from './balance';
import { jpCharacters, jpProfiles } from './characters';
import { jpEvents, jpSystemEvents } from './events';
import * as hooks from './hooks';
import { jpNpcs } from './npcs';
import {
  jpRules,
  type JpColumn,
  type JpEffect,
  type JpFestival,
  type JpOutcome,
  type JpTimeline,
} from './rules';
import {
  jpActions,
  jpFestivals,
  jpItems,
  jpNotices,
  jpPlaces,
  jpRecipes,
} from './town';

export const jpGameContent: GameContentPack<
  JpTimeline,
  JpFullResult,
  JpEffect,
  JpColumn,
  JpOutcome,
  JpFestival
> = {
  characters: jpProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  places: jpPlaces,
  actions: jpActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: jpNpcs,
  events: jpEvents,
  systemEvents: jpSystemEvents,
  items: jpItems,
  recipes: jpRecipes,
  festivals: jpFestivals,
  notices: jpNotices,
  achievements: hooks.jpAchievements,
  balance: b,
  rules: jpRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  actionFlags: hooks.actionFlags,
  afterAction: hooks.afterAction,
  afterActionAwards: hooks.afterActionAwards,
  quarterEffects: (played) => [
    {
      type: 'stat',
      key: 'japanese',
      delta: played % 2 ? 0 : -b.japaneseDecay,
    },
  ],
  routine: hooks.routine,
  shopStock: hooks.shopStock,
  catchItem: hooks.catchItem,
  ledgerText: hooks.ledgerText,
};

export const {
  newGame,
  activities,
  doActivity,
  enter,
  approachSurprise,
  tick,
  talk,
  gift,
  buy,
  plant,
  cropDaysToMaturity,
  water,
  harvest,
  fish,
  cook,
  eat,
  readMail,
  sleep,
  fastForward,
  mailbox,
  shop,
  townsfolk,
  npcAt,
  peopleAt,
  hearts,
  currentEvent,
  resolve,
  endQuarter,
  progress,
  isOver,
  narrative,
  visaMonthsLeft,
} = createGame(jpGameContent);
export const characters = jpProfiles;
export const { characterOf } = hooks;
export const loadCharacter = jpGameContent.loadCharacter;
export const places = jpPlaces;
export const npcs = jpNpcs;
export const items = jpItems;
export const recipes = jpRecipes;
export const festivals = jpFestivals;
export const achievements = hooks.jpAchievements;
export { jpCharacters, jpRules };
export {
  evidenceDay,
  pathwayOf,
  status,
  type JpColumn,
  type JpEffect,
  type JpFestival,
  type JpOutcome,
  type JpState,
  type JpTimeline,
} from './rules';
