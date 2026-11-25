import type { UsFullResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { usBalance as b } from './balance';
import { usCharacters, usProfiles } from './characters';
import { usDailyEvents, usSystemEvents } from './events';
import * as hooks from './hooks';
import { usNpcs } from './npcs';
import {
  usRules,
  type UsColumn,
  type UsEffect,
  type UsFestival,
  type UsOutcome,
  type UsTimeline,
} from './rules';
import {
  usActions,
  usFestivals,
  usFurnishingNames,
  usItems,
  usNotices,
  usPlaces,
  usRecipes,
} from './town';

export const usGameContent: GameContentPack<
  UsTimeline,
  UsFullResult,
  UsEffect,
  UsColumn,
  UsOutcome,
  UsFestival
> = {
  characters: usProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  fishingSpot: { zhCN: '湖边防波堤', en: 'the lakefront pier' },
  places: usPlaces,
  actions: usActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: usNpcs,
  events: usDailyEvents,
  systemEvents: usSystemEvents,
  items: usItems,
  recipes: usRecipes,
  festivals: usFestivals,
  notices: usNotices,
  achievements: hooks.usAchievements,
  balance: b,
  rules: usRules,
  endingText: hooks.endingText,
  calendar: hooks.calendar,
  actionAvailable: hooks.actionAvailable,
  actionDetails: hooks.actionDetails,
  actionFlags: hooks.actionFlags,
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
} = createGame(usGameContent);
export const characters = usProfiles;
export const { characterOf, tripSkipsI751, workdayOf } = hooks;
export const loadCharacter = usGameContent.loadCharacter;
export const places = usPlaces;
export const npcs = usNpcs;
export const items = usItems;
export const recipes = usRecipes;
export const festivals = usFestivals;
export const achievements = hooks.usAchievements;
export { usCharacters, usFurnishingNames, usRules };
export {
  citizenshipPathway,
  filingDay,
  greenCardPathway,
  pathwayOf,
  stageOutcome,
  usRequest,
  type UsColumn,
  type UsEffect,
  type UsFestival,
  type UsOutcome,
  type UsState,
  type UsTimeline,
} from './rules';
