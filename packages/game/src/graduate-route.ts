import { skilledWorkerApplication } from '@uk-immigration/engine';
import type { ImmigrationEpisode } from '@uk-immigration/engine';
import { currentLaw2026_11, goingRates } from '@uk-immigration/policy-data';
import { balance as b } from './balance';
import type { GameState } from './types';

const policy = currentLaw2026_11.values;
// SRC-034 GR 8.1: this fictional MSc graduate applied before 2027-01-01.
export const graduateApplicationDate = '2026-09-01';
// SRC-004 SW 4.2 Option A and SW 8.1. SRC-017 Table 1, SOC 2136. The offer
// is also checked against the new-entrant Option E (SW 12.1–12.3, task 35).
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
    // The CoS is issued for this offer; SOC 2136 is not on the Immigration
    // Salary List (SRC-019).
    sponsorshipCertificateDate: state.date,
    immigrationSalaryList: false,
    salary: state.flags.includes('graduate-negotiated')
      ? graduateSalaries.agreed
      : graduateSalaries.low,
  };
}
/** The engine's Skilled Worker application check (SW 4.2 Options A and E). */
export function graduateApplication(state: GameState) {
  const episode = graduateEpisode(state);
  // SW 18.1: permission runs to 14 days after the CoS end date, so this
  // scenario's CoS ends that many days before the grant.
  const cosEnd = new Date(`${episode.validTo}T00:00:00Z`);
  cosEnd.setUTCDate(
    cosEnd.getUTCDate() - policy.skilledWorkerGrantDaysAfterCos.value,
  );
  return skilledWorkerApplication({
    timeline: {
      ...state.timeline,
      episodes: state.timeline.episodes.filter(
        (e) => e.validFrom <= state.date,
      ),
    },
    applicationDate: state.date,
    // The scenario decides the in-country switch on the day it is made.
    decisionDate: state.date,
    cos: {
      start: state.date,
      end: cosEnd.toISOString().slice(0, 10),
      salary: episode.salary,
      // Fictional full-time contract at the going rate's standard week.
      weeklyHours: policy.goingRateWeeklyHours.value,
      socCode: episode.socCode,
    },
    locale: state.locale,
  });
}

export function graduateSalaryPreview(state: GameState): string {
  const { optionA, optionE } = graduateApplication(state);
  const chinese = state.locale === 'zh-CN';
  const verdict = (status: string) =>
    chinese
      ? status === 'PASS'
        ? '符合'
        : status === 'FAIL'
          ? '不符合'
          : '待确认'
      : status === 'PASS'
        ? 'met'
        : status === 'FAIL'
          ? 'not met'
          : 'to be confirmed';
  return [
    chinese
      ? `标准档（SRC-004 SW 4.2 Option A；SRC-017 Table 1）：${verdict(optionA.status)}。${optionA.explanation}`
      : `Standard option (SRC-004 SW 4.2 Option A; SRC-017 Table 1): ${verdict(optionA.status)}. ${optionA.explanation}`,
    chinese
      ? `新入职者档（SRC-004 SW 4.2 Option E、SW 12.1–12.3）：${verdict(optionE.status)}。${optionE.explanation}`
      : `New-entrant option (SRC-004 SW 4.2 Option E, SW 12.1–12.3): ${verdict(optionE.status)}. ${optionE.explanation}`,
  ]
    .map((line) => line.trim())
    .join('\n');
}
