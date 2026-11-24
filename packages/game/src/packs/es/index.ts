import type { CountryResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { esBalance as b } from './balance';
import { esCharacters, esProfiles } from './characters';
import { esEvents, esSystemEvents } from './events';
import * as hooks from './hooks';
import { esNpcs } from './npcs';
import {
  esRules,
  type EsColumn,
  type EsEffect,
  type EsFestival,
  type EsOutcome,
  type EsTimeline,
} from './rules';
import {
  esActions,
  esFestivals,
  esItems,
  esNotices,
  esPlaces,
  esRecipes,
} from './town';

export const esGameContent: GameContentPack<
  EsTimeline,
  CountryResult,
  EsEffect,
  EsColumn,
  EsOutcome,
  EsFestival
> = {
  characters: esProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  places: esPlaces,
  actions: esActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: esNpcs,
  events: esEvents,
  systemEvents: esSystemEvents,
  items: esItems,
  recipes: esRecipes,
  festivals: esFestivals,
  notices: esNotices,
  achievements: hooks.esAchievements,
  balance: b,
  rules: esRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  beforeAction: hooks.beforeAction,
  afterAction: hooks.afterAction,
  afterActionAwards: hooks.afterActionAwards,
  quarterEffects: (played) => [
    {
      type: 'stat',
      key: 'spanish',
      delta: played % 2 ? 0 : -b.spanishDecay,
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
} = createGame(esGameContent);
export const characters = esProfiles;
export const { characterOf } = hooks;
export const loadCharacter = esGameContent.loadCharacter;
export const places = esPlaces;
export const npcs = esNpcs;
export const items = esItems;
export const recipes = esRecipes;
export const festivals = esFestivals;
export const achievements = hooks.esAchievements;
export { esCharacters, esRules };
export {
  currentPermit,
  filingAnswers,
  pathwayOf,
  type EsColumn,
  type EsEffect,
  type EsFestival,
  type EsOutcome,
  type EsState,
  type EsTimeline,
} from './rules';
