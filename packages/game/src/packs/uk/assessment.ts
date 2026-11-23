import { RULE_SETS } from '@uk-immigration/engine';
import { RULE_SET_IDS } from '@uk-immigration/policy-data';
import type { GameState, Locale } from '../../types';
import { ukRules } from './rules';

const ruleSets = RULE_SET_IDS.map((id) => RULE_SETS[id]);
const currentLaw = ruleSets.find(
  (ruleSet) => ruleSet.kind === 'LAW' && ruleSet.status === 'CURRENT_LAW',
)!;
const comparison =
  ruleSets
    .filter((ruleSet) => ruleSet.status === 'IN_FORCE_FUTURE_VERSION')
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))[0] ??
  [...ruleSets].reverse().find((ruleSet) => ruleSet.kind === 'ANNOUNCED')!;

export const ukGameRuleColumns = [
  { ...currentLaw, label: 'game.currentLaw' },
  { ...comparison, label: 'game.reform' },
] as const;

export function ukEndingAssessment(state: GameState, locale: Locale) {
  const application = state.settlementApplication;
  return application && application.cashSavings !== state.timeline.cashSavings
    ? ukRules.evaluate({
        date: state.date,
        timeline: { ...state.timeline, cashSavings: application.cashSavings },
        locale,
      })
    : state.result;
}

export function ukGameDraft(state: GameState) {
  return {
    timeline: state.timeline,
    simulationDate: state.date,
    completed: true,
    screening: {
      criminality: state.timeline.criminalRecord.length ? 'yes' : 'no',
      breach: state.timeline.immigrationBreaches.length ? 'yes' : 'no',
      debt: state.timeline.governmentDebt?.outstanding ? 'yes' : 'no',
    },
  } as const;
}
