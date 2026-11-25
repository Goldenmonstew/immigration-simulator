import type { CaFullResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { caBalance as b } from './balance';
import { caCharacters, caProfiles } from './characters';
import { caEvents, caSystemEvents } from './events';
import * as hooks from './hooks';
import { caNpcs } from './npcs';
import {
  caRules,
  type CaColumn,
  type CaEffect,
  type CaFestival,
  type CaOutcome,
  type CaTimeline,
} from './rules';
import {
  caActions,
  caFestivals,
  caItems,
  caNotices,
  caPlaces,
  caRecipes,
} from './town';

export const caGameContent: GameContentPack<
  CaTimeline,
  CaFullResult,
  CaEffect,
  CaColumn,
  CaOutcome,
  CaFestival
> = {
  characters: caProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  places: caPlaces,
  actions: caActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: caNpcs,
  events: caEvents,
  systemEvents: caSystemEvents,
  items: caItems,
  recipes: caRecipes,
  festivals: caFestivals,
  notices: caNotices,
  achievements: hooks.caAchievements,
  balance: b,
  rules: caRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  actionFlags: hooks.actionFlags,
  beforeAction: hooks.beforeAction,
  afterAction: hooks.afterAction,
  afterActionAwards: hooks.afterActionAwards,
  afterQuarter: hooks.afterQuarter,
  quarterEffects: (played) => [
    {
      type: 'stat',
      key: 'english',
      delta: played % 2 ? 0 : -b.englishDecay,
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
} = createGame(caGameContent);
export const characters = caProfiles;
export const { characterOf } = hooks;
export const loadCharacter = caGameContent.loadCharacter;
export const places = caPlaces;
export const npcs = caNpcs;
export const items = caItems;
export const recipes = caRecipes;
export const festivals = caFestivals;
export const achievements = hooks.caAchievements;
export const { nextStep } = hooks;
export { caCharacters, caRules };
export {
  aipFee,
  assessedOn,
  caRequest,
  citizenshipFee,
  columnPathway,
  filedToday,
  filingToday,
  pathwayOf,
  readyToFile,
  type CaColumn,
  type CaEffect,
  type CaFestival,
  type CaOutcome,
  type CaState,
  type CaTimeline,
} from './rules';
