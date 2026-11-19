import { evaluate } from '@uk-immigration/engine';
import type { ImmigrationEpisode } from '@uk-immigration/engine';
import { currentLaw2026_11, goingRates } from '@uk-immigration/policy-data';
import { balance as b } from './balance';
import type { GameState } from './types';

const policy = currentLaw2026_11.values;
// SRC-034 GR 8.1: this fictional MSc graduate applied before 2027-01-01.
export const graduateApplicationDate = '2026-09-01';
// SRC-004 SW 4.2 Option A and SW 8.1. SRC-017 Table 1, SOC 2136.
// This scenario uses the full standard rate, with no new-entrant discount.
export const generalSalary = policy.skilledWorkerGeneralSalaryThreshold.value;
const graduateOccupation = goingRates.rows.find(
  (row) => row.table === '1' && row.socCode === '2136',
)!;
export const occupationalSalary = graduateOccupation.goingRate!;
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
    socCode: graduateOccupation.socCode,
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

export function graduateSalaryPreview(state: GameState): string {
  // Use the same checks as the switch action, but cite the permission rules.
  const checks = graduateSalaryChecks(state);
  const salaryCheck = checks.find((rule) => rule.id === 'CL-SW-SALARY')!;
  const goingRateCheck = checks.find((rule) => rule.id === 'CL-SW-GOING-RATE')!;
  const formatSalary = (value: number) => `£${value.toLocaleString('en-GB')}`;
  const salary = formatSalary(graduateEpisode(state).salary!);
  const general = formatSalary(generalSalary);
  const occupational = formatSalary(occupationalSalary);
  const occupation = `SOC ${graduateOccupation.socCode} (${graduateOccupation.title})`;
  const chinese = state.locale === 'zh-CN';
  const status = (passed: boolean) =>
    chinese ? (passed ? '达到' : '低于') : passed ? 'meets' : 'is below';
  const generalStatus = status(salaryCheck.status === 'PASS');
  const occupationalStatus = status(goingRateCheck.status === 'PASS');
  return [
    chinese
      ? `报价年薪 ${salary} ${generalStatus}通用年薪门槛 ${general}（SRC-004 SW 4.2 Option A）。`
      : `The annual offer of ${salary} ${generalStatus} the general salary threshold of ${general} (SRC-004, SW 4.2 Option A).`,
    chinese
      ? `这份报价${occupationalStatus} ${occupation} 的 going rate ${occupational}（SRC-017 Table 1 及表前工时说明）。`
      : `The offer ${occupationalStatus} the going rate of ${occupational} for ${occupation} (SRC-017, Table 1 and its note on working hours).`,
    ...(goingRateCheck.assumptions ?? []),
  ].join('\n');
}
