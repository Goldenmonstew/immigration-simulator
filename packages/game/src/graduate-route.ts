import { evaluate } from '@uk-immigration/engine';
import type { ImmigrationEpisode } from '@uk-immigration/engine';
import { currentLaw2026_11, goingRates } from '@uk-immigration/policy-data';
import { balance as b } from './balance';
import type { GameState } from './types';

const policy = currentLaw2026_11.values;
// SRC-034 GR 8.1: this fictional MSc graduate applied before 2027-01-01.
export const graduateApplicationDate = '2026-09-01';
// SRC-004 SW 4.2 Option A / SW 24.3 row A; SRC-017 Table 1, SOC 2136.
// This scenario uses the full standard rate, with no new-entrant discount.
export const generalSalary = policy.skilledWorkerGeneralSalaryThreshold.value;
export const occupationalSalary = goingRates.rows.find(
  (row) => row.table === '1' && row.socCode === '2136',
)!.goingRate!;
export const graduateSalaries = {
  low: generalSalary - 1000,
  // Fictional negotiated offer, not a policy threshold.
  agreed: Math.max(generalSalary, occupationalSalary) + 2500,
};
export function graduateEpisode(state: GameState): ImmigrationEpisode {
  const end = new Date(`${state.date}T00:00:00Z`);
  // Fictional sponsored contract length, like existing Skilled Worker renewals.
  end.setUTCMonth(end.getUTCMonth() + b.extensionMonths);
  end.setUTCDate(end.getUTCDate() - 1);
  return {
    route: 'SKILLED_WORKER',
    role: 'MAIN',
    validFrom: state.date,
    validTo: end.toISOString().slice(0, 10),
    socCode: '2136',
    salary: state.flags.includes('graduate-negotiated')
      ? graduateSalaries.agreed
      : graduateSalaries.low,
  };
}
/** Preview the engine's standard salary checks; never infer a grant from settlement eligibility. */
export function graduateSalaryChecks(state: GameState) {
  const timeline = structuredClone(state.timeline);
  const yesterday = new Date(`${state.date}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  timeline.episodes = timeline.episodes.filter(
    (episode) => episode.validFrom < state.date,
  );
  for (const episode of timeline.episodes)
    if (episode.validTo >= state.date)
      episode.validTo = yesterday.toISOString().slice(0, 10);
  timeline.episodes.push(graduateEpisode(state));
  return evaluate({
    simulationDate: state.date,
    timeline,
    locale: state.locale,
  }).byRuleSet['current-law-2026-11']!.rules.filter((rule) =>
    ['CL-SW-SALARY', 'CL-SW-GOING-RATE'].includes(rule.id),
  );
}
