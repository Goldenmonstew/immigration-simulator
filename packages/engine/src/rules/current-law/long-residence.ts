import {
  currentLaw2026_11 as cl,
  routeNames,
} from '@uk-immigration/policy-data';
import { addYears, fullYears, fullYearsEn } from '../../dates';
import { continuousRun, restartAfterAbsences } from '../../residence';
import { defineRule, nameIn, textFor } from '../../rule';
import type { Route } from '@uk-immigration/policy-data';
import type { IsoDate, RuleContext } from '../../types';
import { CR_3_1, RULE_SET } from './shared';

// LR 11.1(a): permission on any route counts except these. Short-term Student
// (English language) is not a separate route here.
const LR_EXCLUDED: Route[] = ['VISIT', 'SEASONAL_WORKER', 'UKRAINE_SCHEME'];

/** Start of the continuous lawful residence for Long Residence. */
export function longResidenceStart({
  timeline,
  simulationDate,
}: RuleContext): IsoDate | undefined {
  const { episodes } = continuousRun(
    timeline,
    simulationDate,
    (e) => !LR_EXCLUDED.includes(e.route),
  );
  return episodes.length > 0
    ? restartAfterAbsences(
        episodes[0].validFrom,
        simulationDate,
        timeline.absences,
        {
          ...CR_3_1,
          legacy: {
            before: cl.values.longResidenceLegacyAbsenceBefore.value,
            maxSingleDays:
              cl.values.longResidenceLegacyMaxSingleAbsenceDays.value,
            maxTotalDays:
              cl.values.longResidenceLegacyMaxTotalAbsenceDays.value,
          },
        },
      )
    : undefined;
}

export function longResidenceMet(ctx: RuleContext): boolean {
  const start = longResidenceStart(ctx);
  return (
    start !== undefined &&
    addYears(start, cl.values.longResidenceQualifyingYears.value) <=
      ctx.simulationDate
  );
}

export const clLrResidence10Y = defineRule(
  {
    id: 'CL-LR-RESIDENCE-10Y',
    ruleSetId: RULE_SET,
    title: 'Long Residence 连续合法居留 10 年',
    titleEn: `Long Residence: ${cl.values.longResidenceQualifyingYears.value} years of continuous lawful residence`,
    sources: [
      { srcId: 'SRC-005', locator: 'LR 11.1' },
      { srcId: 'SRC-005', locator: 'LR 11.2' },
      { srcId: 'SRC-008', locator: 'CR 3.1' },
      { srcId: 'SRC-008', locator: 'CR 3.3' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const years = cl.values.longResidenceQualifyingYears.value;
    const start = longResidenceStart(ctx);
    const rn = (r: Route) => nameIn(L, routeNames[r]);
    const assumptions = [
      L(
        `连续合法居留计入${rn('STUDENT')}、${rn('GRADUATE')}等临时路线，不计${LR_EXCLUDED.map(rn).join('、')}（LR 11.1(a)）；LR 11.2 不计入的期间（immigration bail 等）与 LR 11.3 的 12 个月要求未建模。`,
        `Continuous lawful residence includes temporary routes such as ${rn('STUDENT')} and ${rn('GRADUATE')}, but not ${LR_EXCLUDED.map(rn).join(', ')} (LR 11.1(a)); periods that do not count under LR 11.2 (immigration bail and similar) and the 12-month requirement in LR 11.3 are not modelled.`,
      ),
      ...(ctx.timeline.absences.length > 0
        ? [
            L(
              `${cl.values.longResidenceLegacyAbsenceBefore.value} 前开始的缺席按 CR 3.3（单次不超过 ${cl.values.longResidenceLegacyMaxSingleAbsenceDays.value} 天、累计不超过 ${cl.values.longResidenceLegacyMaxTotalAbsenceDays.value} 天），之后的按 CR 3.1；出境与入境当日都计入缺席。`,
              `Absences starting before ${cl.values.longResidenceLegacyAbsenceBefore.value} follow CR 3.3 (no single absence over ${cl.values.longResidenceLegacyMaxSingleAbsenceDays.value} days and no more than ${cl.values.longResidenceLegacyMaxTotalAbsenceDays.value} days in total), and later ones follow CR 3.1; the days of departure and return both count as absence.`,
            ),
          ]
        : []),
    ];
    if (!start) {
      return {
        status: 'FAIL',
        explanation: L(
          `${ctx.simulationDate} 当日没有计入 Long Residence 的许可。`,
          `No permission counting towards Long Residence on ${ctx.simulationDate}.`,
        ),
        assumptions,
      };
    }
    const due = addYears(start, years);
    return due <= ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续合法居留，已满 ${years} 年。`,
            `Continuous lawful residence since ${start}: ${years} years completed.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续合法居留，截至 ${ctx.simulationDate} 满 ${fullYears(start, ctx.simulationDate)} 年；${due} 满 ${years} 年。`,
            `Continuous lawful residence since ${start}: ${fullYearsEn(start, ctx.simulationDate)} by ${ctx.simulationDate}; ${years} years are completed on ${due}.`,
          ),
          assumptions,
        };
  },
);
