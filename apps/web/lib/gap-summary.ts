import type { CountryPathway } from '@uk-immigration/engine';

// A future date does not mean only waiting: requirements still to be
// confirmed on the pathway stay listed (task 31 A6#6).
export function gapRules(assessment: CountryPathway) {
  return assessment.checks.filter(
    (rule) =>
      (!assessment.decidedBy || assessment.decidedBy.includes(rule.id)) &&
      (!rule.kind || rule.kind === 'requirement' || rule.kind === 'time') &&
      (rule.status === 'NOT_MET' || rule.status === 'UNKNOWN'),
  );
}

/**
 * The rule naming the pathway the conclusion rests on: the Earned Settlement
 * entry (earnings, British connection, public service, transitional
 * arrangement…), the minimum earnings of the longer pathways or, under
 * current law, the route's residence rule.
 */
export function basisRule(assessment: CountryPathway) {
  const decided = assessment.checks.filter((rule) =>
    assessment.decidedBy?.includes(rule.id),
  );
  return (
    decided.find((rule) =>
      /^ES-(EARNINGS-(3Y|5Y)|BRITISH-CONNECTION|PUBLIC-SERVICE|TRANSITIONAL-|HIGHEST-TALENT|PROTECTION-PATHWAY|DEPENDANT)/.test(
        rule.id,
      ),
    ) ??
    decided.find((rule) => rule.id === 'ES-EARNINGS-10Y') ??
    decided.find((rule) =>
      /^CL-.*(RESIDENCE|PARTNER-5Y|-CHILD|DEPENDANT)/.test(rule.id),
    ) ??
    decided.find((rule) => rule.id === 'ES-RESIDENCE')
  );
}

/** Each shorter candidate pathway and why it was not used (engine). */
export function shorterPathwaysNotUsed(assessment: CountryPathway) {
  return (assessment.shorterPathwaysNotUsed ?? []).map(
    ({ ruleIds, ...pathway }) => ({
      ...pathway,
      rules: assessment.checks.filter((rule) => ruleIds.includes(rule.id)),
    }),
  );
}

export function firstSentence(text: string, locale: string): string {
  const sentences = new Intl.Segmenter(locale, {
    granularity: 'sentence',
  }).segment(text);
  return sentences[Symbol.iterator]().next().value?.segment.trim() ?? '';
}

// Calendar months, rounded up so a future date never reads as no wait.
export function remainingTime(simulationDate: string, earliestDate: string) {
  if (earliestDate <= simulationDate) return { years: 0, months: 0 };
  const [fromYear, fromMonth, fromDay] = simulationDate.split('-').map(Number);
  const [toYear, toMonth, toDay] = earliestDate.split('-').map(Number);
  const lastDay = new Date(Date.UTC(toYear, toMonth, 0)).getUTCDate();
  const months =
    (toYear - fromYear) * 12 +
    toMonth -
    fromMonth +
    (toDay > Math.min(fromDay, lastDay) ? 1 : 0);
  return { years: Math.floor(months / 12), months: months % 12 };
}
