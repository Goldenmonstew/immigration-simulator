import type { CountryResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { auBalance as b } from './balance';
import { auCharacters, auProfiles } from './characters';
import { auEvents, auSystemEvents } from './events';
import * as hooks from './hooks';
import { auNpcs } from './npcs';
import {
  auRules,
  type AuColumn,
  type AuEffect,
  type AuFestival,
  type AuOutcome,
  type AuTimeline,
} from './rules';
import {
  auActions,
  auFestivals,
  auFurnishingNames,
  auItems,
  auNotices,
  auPlaces,
  auRecipes,
} from './town';

export const auGameContent: GameContentPack<
  AuTimeline,
  CountryResult,
  AuEffect,
  AuColumn,
  AuOutcome,
  AuFestival
> = {
  characters: auProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  fishingSpot: { zhCN: '码头', en: 'the jetty' },
  places: auPlaces,
  actions: auActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: auNpcs,
  events: auEvents,
  systemEvents: auSystemEvents,
  items: auItems,
  recipes: auRecipes,
  festivals: auFestivals,
  notices: auNotices,
  achievements: hooks.auAchievements,
  balance: b,
  rules: auRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  actionFlags: hooks.actionFlags,
  beforeAction: hooks.beforeAction,
  afterAction: hooks.afterAction,
  quarterEffects: (played) => [
    { type: 'stat', key: 'english', delta: played % 2 ? 0 : -b.englishDecay },
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
} = createGame(auGameContent);
export const characters = auProfiles;
export const { characterOf } = hooks;
export const loadCharacter = auGameContent.loadCharacter;
export const places = auPlaces;
export const npcs = auNpcs;
export const items = auItems;
export const recipes = auRecipes;
export const festivals = auFestivals;
export const achievements = hooks.auAchievements;
export { auCharacters, auFurnishingNames, auRules };
export {
  assessedOn,
  currentResult,
  currentVisa,
  lastIncomeYear,
  pathwayOf,
  timeDate,
  type AuColumn,
  type AuEffect,
  type AuFestival,
  type AuOutcome,
  type AuRoute,
  type AuState,
  type AuTimeline,
} from './rules';
