import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { addYears, fullYears, fullYearsEn } from '../../dates';
import { continuousRun, restartAfterAbsences } from '../../residence';
import { defineRule, textFor } from '../../rule';
import type { IsoDate, RuleContext } from '../../types';
import { CR_3_1, RULE_SET, absenceAssumption, onUkAncestry } from './shared';

/**
 * Start of the continuous UK Ancestry main applicant permission (UKA 13.1)
 * ending on the simulation date, while on that route (UKA 14.1, CR 3.1).
 */
export function ukAncestryStart({
  timeline,
  simulationDate,
}: RuleContext): IsoDate | undefined {
  if (!onUkAncestry(timeline, simulationDate)) return undefined;
  const { episodes } = continuousRun(
    timeline,
    simulationDate,
    (e) => e.route === 'UK_ANCESTRY' && e.role === 'MAIN',
  );
  return restartAfterAbsences(
    episodes[0].validFrom,
    simulationDate,
    timeline.absences,
    CR_3_1,
  );
}

export const clAncestryResidence5Y = defineRule(
  {
    id: 'CL-ANCESTRY-RESIDENCE-5Y',
    ruleSetId: RULE_SET,
    title: 'UK Ancestry 连续 5 年',
    titleEn: `${cl.values.ukAncestryQualifyingYears.value} continuous years on the UK Ancestry route`,
    sources: [
      { srcId: 'SRC-026', locator: 'UKA 10.3' },
      { srcId: 'SRC-026', locator: 'UKA 12.1' },
      { srcId: 'SRC-026', locator: 'UKA 13.1' },
      { srcId: 'SRC-026', locator: 'UKA 14.1' },
      { srcId: 'SRC-008', locator: 'CR 3.1' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const years = cl.values.ukAncestryQualifyingYears.value;
    const start = ukAncestryStart(ctx);
    if (!start) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 UK Ancestry 主申请人许可。',
          'Current permission is not as a UK Ancestry main applicant.',
        ),
      };
    }
    const assumptions = [
      L(
        '按你在申请日仍是 Commonwealth citizen（UKA 10.3），且仍满足 UKA 4.1–6.1（祖父母之一生于 UK 或 Islands、能自给自足且不依赖 public funds、能工作并打算在英国工作，UKA 12.1）处理。',
        'Assumes you are still a Commonwealth citizen on the date of application (UKA 10.3) and still meet UKA 4.1–6.1 (a grandparent born in the UK or Islands, adequate maintenance and accommodation without recourse to public funds, and able and intending to work in the UK, UKA 12.1).',
      ),
      ...(ctx.timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    const due = addYears(start, years);
    return due <= ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续持 UK Ancestry 主申请人许可，已满 ${years} 年（UKA 13.1）。`,
            `Continuous UK Ancestry permission as the main applicant since ${start}: ${years} years completed (UKA 13.1).`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续持 UK Ancestry 主申请人许可，截至 ${ctx.simulationDate} 满 ${fullYears(start, ctx.simulationDate)} 年；${due} 满 ${years} 年（UKA 13.1）。`,
            `Continuous UK Ancestry permission as the main applicant since ${start}: ${fullYearsEn(start, ctx.simulationDate)} by ${ctx.simulationDate}; ${years} years are completed on ${due} (UKA 13.1).`,
          ),
          assumptions,
        };
  },
);
