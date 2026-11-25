import type { CountryResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { nzBalance as b } from './balance';
import { nzCharacters, nzProfiles } from './characters';
import { nzEvents, nzSystemEvents } from './events';
import * as hooks from './hooks';
import { nzNpcs } from './npcs';
import {
  nzRules,
  type NzColumn,
  type NzEffect,
  type NzFestival,
  type NzOutcome,
  type NzTimeline,
} from './rules';
import {
  nzActions,
  nzFestivals,
  nzFurnishingNames,
  nzItems,
  nzNotices,
  nzPlaces,
  nzRecipes,
} from './town';

export const nzGameContent: GameContentPack<
  NzTimeline,
  CountryResult,
  NzEffect,
  NzColumn,
  NzOutcome,
  NzFestival
> = {
  characters: nzProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  places: nzPlaces,
  actions: nzActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: nzNpcs,
  events: nzEvents,
  systemEvents: nzSystemEvents,
  items: nzItems,
  recipes: nzRecipes,
  festivals: nzFestivals,
  notices: nzNotices,
  fishingSpot: { zhCN: '海湾码头', en: 'the harbour wharf' },
  achievements: hooks.nzAchievements,
  balance: b,
  rules: nzRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  actionFlags: hooks.actionFlags,
  beforeAction: hooks.beforeAction,
  afterAction: hooks.afterAction,
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
} = createGame(nzGameContent);
export const characters = nzProfiles;
export const { characterOf } = hooks;
export const loadCharacter = nzGameContent.loadCharacter;
export const places = nzPlaces;
export const npcs = nzNpcs;
export const items = nzItems;
export const recipes = nzRecipes;
export const festivals = nzFestivals;
export const achievements = hooks.nzAchievements;
export { nzCharacters, nzFurnishingNames, nzRules };
export {
  pathwayOf,
  timeProjection,
  travelEnd,
  type NzColumn,
  type NzEffect,
  type NzFestival,
  type NzOutcome,
  type NzState,
  type NzTimeline,
} from './rules';
