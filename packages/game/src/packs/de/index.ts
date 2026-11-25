import type { CountryResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { deBalance as b } from './balance';
import { deCharacters, deProfiles } from './characters';
import { deEvents, deSystemEvents } from './events';
import * as hooks from './hooks';
import { deNpcs } from './npcs';
import {
  deRules,
  type DeColumn,
  type DeEffect,
  type DeFestival,
  type DeOutcome,
  type DeTimeline,
} from './rules';
import {
  deActions,
  deFestivals,
  deFurnishingNames,
  deItems,
  deNotices,
  dePlaces,
  deRecipes,
} from './town';

export const deGameContent: GameContentPack<
  DeTimeline,
  CountryResult,
  DeEffect,
  DeColumn,
  DeOutcome,
  DeFestival
> = {
  characters: deProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  fishingSpot: { zhCN: '林登运河', en: 'the Lindenkanal' },
  places: dePlaces,
  actions: deActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: deNpcs,
  events: deEvents,
  systemEvents: deSystemEvents,
  items: deItems,
  recipes: deRecipes,
  festivals: deFestivals,
  notices: deNotices,
  achievements: hooks.deAchievements,
  balance: b,
  rules: deRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  beforeAction: hooks.beforeAction,
  afterAction: hooks.afterAction,
  afterActionAwards: hooks.afterActionAwards,
  quarterEffects: (played) => [
    { type: 'stat', key: 'german', delta: played % 2 ? 0 : -b.germanDecay },
    { type: 'payroll' },
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
} = createGame(deGameContent);
export const characters = deProfiles;
export const { characterOf } = hooks;
export const loadCharacter = deGameContent.loadCharacter;
export const places = dePlaces;
export const npcs = deNpcs;
export const items = deItems;
export const recipes = deRecipes;
export const festivals = deFestivals;
export const achievements = hooks.deAchievements;
export { deCharacters, deFurnishingNames, deRules };
export {
  cardValidTo,
  currentPermit,
  extensionPending,
  pathwayOf,
  timelineOn,
  officePending,
  timeDate,
  type DeColumn,
  type DeEffect,
  type DeFestival,
  type DeOutcome,
  type DeState,
  type DeTimeline,
} from './rules';
