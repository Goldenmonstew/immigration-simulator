import type { SettlementAssessment } from '@uk-immigration/engine';

// A future date does not mean only waiting: requirements still to be
// confirmed on the pathway stay listed (task 31 A6#6).
export function gapRules(assessment: SettlementAssessment) {
  return assessment.rules.filter(
    (rule) =>
      (!assessment.decidedBy || assessment.decidedBy.includes(rule.id)) &&
      (rule.status === 'FAIL' || rule.status === 'UNKNOWN'),
  );
}

/**
 * The rule naming the pathway the conclusion rests on: the Earned Settlement
 * entry (earnings, British connection, public service, transitional
 * arrangement…) or, under current law, the route's residence rule.
 */
export function basisRule(assessment: SettlementAssessment) {
  const decided = assessment.rules.filter((rule) =>
    assessment.decidedBy?.includes(rule.id),
  );
  return (
    decided.find((rule) =>
      /^ES-(EARNINGS-(3Y|5Y)|BRITISH-CONNECTION|PUBLIC-SERVICE|TRANSITIONAL-|HIGHEST-TALENT|PROTECTION-PATHWAY|DEPENDANT)/.test(
        rule.id,
      ),
    ) ??
    decided.find((rule) =>
      /^CL-.*(RESIDENCE|PARTNER-5Y|-CHILD|DEPENDANT)/.test(rule.id),
    ) ??
    decided.find((rule) => rule.id === 'ES-RESIDENCE')
  );
}

/** Requirements of shorter Earned Settlement pathways that rule them out. */
export function shorterPathwayBlocks(assessment: SettlementAssessment) {
  return assessment.rules.filter(
    (rule) =>
      rule.status === 'FAIL' &&
      !assessment.decidedBy?.includes(rule.id) &&
      (rule.id === 'ES-PUBLIC-FUNDS' || rule.id === 'ES-BREACH'),
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
