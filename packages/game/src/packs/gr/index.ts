import type { CountryResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { grBalance as b } from './balance';
import { grCharacters, grProfiles } from './characters';
import { grEvents, grSystemEvents } from './events';
import * as hooks from './hooks';
import { grNpcs } from './npcs';
import {
  grRules,
  type GrColumn,
  type GrEffect,
  type GrFestival,
  type GrOutcome,
  type GrTimeline,
} from './rules';
import {
  grActions,
  grFestivals,
  grItems,
  grNotices,
  grPlaces,
  grRecipes,
} from './town';

export const grGameContent: GameContentPack<
  GrTimeline,
  CountryResult,
  GrEffect,
  GrColumn,
  GrOutcome,
  GrFestival
> = {
  characters: grProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  places: grPlaces,
  actions: grActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: grNpcs,
  events: grEvents,
  systemEvents: grSystemEvents,
  items: grItems,
  recipes: grRecipes,
  festivals: grFestivals,
  notices: grNotices,
  achievements: hooks.grAchievements,
  balance: b,
  rules: grRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  beforeAction: hooks.beforeAction,
  afterAction: hooks.afterAction,
  afterActionAwards: hooks.afterActionAwards,
  quarterEffects: (played) => [
    { type: 'stat', key: 'greek', delta: played % 2 ? 0 : -b.greekDecay },
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
} = createGame(grGameContent);
export const characters = grProfiles;
export const { characterOf, orthodoxEaster } = hooks;
export const loadCharacter = grGameContent.loadCharacter;
export const places = grPlaces;
export const npcs = grNpcs;
export const items = grItems;
export const recipes = grRecipes;
export const festivals = grFestivals;
export const achievements = hooks.grAchievements;
export { grCharacters, grRules };
export {
  grossSalary,
  isBlueCard,
  pathwayOf,
  renewalWindow,
  unfiledTaxYear,
  type GrColumn,
  type GrEffect,
  type GrFestival,
  type GrOutcome,
  type GrState,
  type GrTimeline,
} from './rules';
