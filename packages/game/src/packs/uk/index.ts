import type { DecisionOutcome, RuleSetId } from '@uk-immigration/engine';
import { achievements, lifeAchievements } from '../../achievements';
import { balance } from '../../balance';
import { characterOf, characters, loadCharacter } from '../../characters';
import type { GameContentPack } from '../../content-pack';
import { commonEvents, systemEvents } from '../../events/common';
import { policyStories } from '../../events/policy';
import { festivals, notices } from '../../festivals';
import { items, recipes } from '../../items';
import { locationActions, places } from '../../locations';
import { surpriseEventAt, surpriseEvents } from '../../map-surprises';
import { mayDayVenue } from '../../may-day';
import { heartEvents, npcs, townHeartLetters } from '../../npcs';
import type { GameState, FestivalId } from '../../types';
import {
  actionAvailable,
  actionDetails,
  actionFlags,
  afterAction,
  afterActionAwards,
  beforeAction,
} from './actions';
import { specialDay } from './calendar';
import type { UkEffect } from './effects';
import { ukRules } from './rules';
import * as town from './town';

export const ukGameContent: GameContentPack<
  GameState['timeline'],
  GameState['result'],
  UkEffect,
  RuleSetId,
  DecisionOutcome,
  FestivalId
> = {
  characters,
  loadCharacter,
  characterOf,
  fishingPlace: 'pond',
  allotmentPlace: 'allotment',
  places,
  actions: locationActions,
  informationAction: { id: 'assessment', place: 'council' },
  npcs,
  events: commonEvents,
  systemEvents,
  datedEvents: policyStories,
  heartEvents,
  letters: townHeartLetters,
  extraEvents: surpriseEvents,
  items,
  recipes,
  festivals,
  notices,
  achievements,
  lifeAchievements,
  balance,
  rules: ukRules,
  calendar: specialDay,
  actionVenue: mayDayVenue,
  actionAvailable,
  actionDetails,
  actionFlags,
  beforeAction,
  afterAction,
  afterActionAwards,
  quarterEffects: (played) => [
    // Slow skills fade a whole point every other quarter so stats stay integers.
    {
      type: 'stat',
      key: 'english',
      delta: played % 2 ? 0 : -balance.englishDecay,
    },
  ],
  surpriseAt: surpriseEventAt,
  ...town,
};
