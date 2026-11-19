import {
  currentLaw2026_11 as cl,
  routeNames,
} from '@uk-immigration/policy-data';
import { episodeOn, currentResidence } from '../../residence';
import { defineRule, nameIn, textFor } from '../../rule';
import type { ImmigrationEpisode, RuleContext } from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  onPrivateLife,
} from './shared';
import { countsForFamilyTenYear } from './family';

/** PL 14.1 / PL 14.2(a): the qualifying period and the paragraph that sets it. */
function privateLifePeriod(
  e: ImmigrationEpisode,
): { years: number; basis: string } | undefined {
  switch (e.privateLifeRoute) {
    case 'CHILD':
    case 'YOUNG_ADULT':
      return {
        years: cl.values.privateLifeQualifyingYearsFive.value,
        basis: 'PL 14.1',
      };
    case 'ADULT':
      return {
        years: cl.values.privateLifeQualifyingYearsTen.value,
        basis: 'PL 14.2(a)',
      };
    default:
      return undefined;
  }
}

/**
 * The Private Life qualifying period, while a main applicant on that route:
 * years from the basis of the permission (undefined if not provided), and the
 * start of the continuous PL 14.3 period (the same list as SETF 3.1) ending on
 * the simulation date (PL 15.1, CR 3.1). `before` is the adjoining earlier
 * permission that does not count, if any (PL 14.4, PD-069).
 */
export function privateLifeQualifying({
  timeline,
  simulationDate,
}: RuleContext) {
  if (!onPrivateLife(timeline, simulationDate)) return undefined;
  const period = privateLifePeriod(episodeOn(timeline, simulationDate)!);
  return {
    period,
    residence:
      period &&
      currentResidence(
        timeline,
        simulationDate,
        countsForFamilyTenYear,
        period.years,
      ),
  };
}

export const clPrivateLifeResidence = defineRule(
  {
    id: 'CL-PRIVATE-LIFE-RESIDENCE',
    ruleSetId: RULE_SET,
    title: 'Private Life 连续 5 年或 10 年',
    titleEn: `Private Life: ${cl.values.privateLifeQualifyingYearsFive.value} or ${cl.values.privateLifeQualifyingYearsTen.value} continuous years`,
    sources: [
      { srcId: 'SRC-028', locator: 'PL 14.1' },
      { srcId: 'SRC-028', locator: 'PL 14.2' },
      { srcId: 'SRC-028', locator: 'PL 14.3' },
      { srcId: 'SRC-028', locator: 'PL 14.4' },
      { srcId: 'SRC-028', locator: 'PL 15.1' },
      ...crResidenceSources,
    ],
    pendingDetails: ['PD-069'],
  },
  (ctx) => {
    const L = textFor(ctx);
    const q = privateLifeQualifying(ctx);
    if (!q) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Appendix Private Life 主申请人许可。',
          'Current permission is not as an Appendix Private Life main applicant.',
        ),
      };
    }
    const { residence, period } = q;
    const before = residence?.before;
    const assumptions = [
      L(
        '连续期合并 PL 14.3 列出的 Appendix FM 伴侣、父母及其子女许可与 Private Life 许可；PL 14.3(e) 基于 Article 8 的 Leave Outside the Rules 无法与其他 Leave Outside the Rules 区分，不计入。PL 13（英国出生、连续居住 7 年的儿童可直接定居）、PL 14.1A / PL 14.2(b) / PL 14.2A（2022-06-20 前 Appendix FM 或 Leave Outside the Rules 许可的过渡安排）与 PL 12.3–12.5（suitability 事由要求走 10 年）未建模。',
        'The continuous period combines the permissions listed in PL 14.3: Appendix FM partner, parent and child permission, and Private Life permission. Leave Outside the Rules on Article 8 grounds (PL 14.3(e)) cannot be told apart from other such leave and is not counted. PL 13 (immediate settlement for a child born in the UK after 7 years of continuous residence), PL 14.1A / PL 14.2(b) / PL 14.2A (transitional cases with Appendix FM or Leave Outside the Rules permission before 2022-06-20) and PL 12.3–12.5 (suitability grounds that require 10 years) are not modelled.',
      ),
      ...(before
        ? [
            L(
              `PL 14.4 也计入其他可定居路线的许可（须未非法入境、且已持 Private Life 许可满 1 年）；本工具只计 PL 14.3 所列许可，紧接其前的${nameIn(L, routeNames[before.route])}许可未计入，若该路线可定居，实际日期可能更早（PD-069）。`,
              `PL 14.4 also counts permission on other routes that lead to settlement (if the applicant did not enter illegally and has held Private Life permission for at least a year); this tool counts only the permissions in PL 14.3, so the ${nameIn(L, routeNames[before.route])} permission just before them is not counted, and the actual date may be earlier if that route can lead to settlement (PD-069).`,
            ),
          ]
        : []),
      ...(ctx.timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    if (!period) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `未填写 Private Life 许可的依据：作为儿童（PL 3.1）或满足 half-life test 的 young adult（PL 4.1）获批的，合格期 ${cl.values.privateLifeQualifyingYearsFive.value} 年（PL 14.1）；其余 ${cl.values.privateLifeQualifyingYearsTen.value} 年（PL 14.2(a)）。`,
          `Not provided what the Private Life permission was granted on: ${cl.values.privateLifeQualifyingYearsFive.value} years for permission as a child (PL 3.1) or as a young adult who met the half-life test (PL 4.1) (PL 14.1); ${cl.values.privateLifeQualifyingYearsTen.value} years otherwise (PL 14.2(a)).`,
        ),
        assumptions,
      };
    }
    const { years, basis } = period;
    const { start } = residence!;
    assumptions.push(
      ...residenceAssumptions(ctx.timeline, ctx.simulationDate, residence, L),
    );
    return residence!.applicationDate === ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `按 ${basis} 合格期 ${years} 年；自 ${start} 起连续持可计入的许可（PL 14.3），${residenceCompleted(residence!, ctx.simulationDate, years, L)}。`,
            `${years}-year qualifying period under ${basis}; continuous qualifying permission (PL 14.3) since ${start}: ${residenceCompleted(residence!, ctx.simulationDate, years, L)}.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `按 ${basis} 合格期 ${years} 年；自 ${start} 起连续持可计入的许可（PL 14.3），${residencePending(residence!, years, L)}。`,
            `${years}-year qualifying period under ${basis}; continuous qualifying permission (PL 14.3) since ${start}: ${residencePending(residence!, years, L)}.`,
          ),
          assumptions,
        };
  },
);
