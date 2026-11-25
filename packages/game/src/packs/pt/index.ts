import type { CountryResult } from '@uk-immigration/engine';
import { createGame } from '../../game';
import type { GameContentPack } from '../../content-pack';
import { ptBalance as b } from './balance';
import { ptCharacters, ptProfiles } from './characters';
import { ptEvents, ptSystemEvents } from './events';
import * as hooks from './hooks';
import { ptNpcs } from './npcs';
import {
  ptRules,
  type PtColumn,
  type PtEffect,
  type PtFestival,
  type PtOutcome,
  type PtTimeline,
} from './rules';
import {
  cardNote,
  ptActions,
  ptFestivals,
  ptFurnishingNames,
  ptItems,
  ptNotices,
  ptPlaces,
  ptRecipes,
} from './town';

export const ptGameContent: GameContentPack<
  PtTimeline,
  CountryResult,
  PtEffect,
  PtColumn,
  PtOutcome,
  PtFestival
> = {
  characters: ptProfiles,
  loadCharacter: async (id) => hooks.characterOf(id),
  characterOf: hooks.characterOf,
  fishingSpot: { zhCN: '特茹河岸', en: 'the Tagus riverside' },
  places: ptPlaces,
  actions: ptActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs: ptNpcs,
  events: ptEvents,
  systemEvents: ptSystemEvents,
  items: ptItems,
  recipes: ptRecipes,
  festivals: ptFestivals,
  notices: ptNotices,
  achievements: hooks.ptAchievements,
  balance: b,
  rules: ptRules,
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
      key: 'portuguese',
      delta: played % 2 ? 0 : -b.portugueseDecay,
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
} = createGame(ptGameContent);
export const characters = ptProfiles;
export const { characterOf } = hooks;
export const loadCharacter = ptGameContent.loadCharacter;
export const places = ptPlaces;
export const npcs = ptNpcs;
export const items = ptItems;
export const recipes = ptRecipes;
export const festivals = ptFestivals;
export const achievements = hooks.ptAchievements;
export { cardNote, ptCharacters, ptFurnishingNames, ptRules };
export {
  answersOn,
  currentCard,
  pathwayOf,
  permanentFee,
  permanentFileable,
  type PtColumn,
  type PtEffect,
  type PtFestival,
  type PtGameTarget,
  type PtOutcome,
  type PtState,
  type PtSteps,
  type PtTimeline,
} from './rules';
