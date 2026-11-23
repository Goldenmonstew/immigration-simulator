import { createGame } from './game';
import { ukGameContent } from './packs/uk';

export { createGame, ukGameContent };
export {
  ukGameDraft,
  ukGameRuleColumns,
  ukEndingAssessment,
} from './packs/uk/assessment';
export type { EvaluationAdapter, GameContentPack } from './content-pack';
export type * from './types';
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
} = createGame(ukGameContent);
export { characters, characterOf, loadCharacter } from './characters';
export { places } from './locations';
export { graduateNextStep } from './graduate-route';
export { npcs } from './npcs';
export { items, recipes } from './items';
export { festivals } from './festivals';
export { mapSurprises } from './map-surprises';
export { achievements } from './achievements';
