import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { currentResidence, episodeOn } from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, textFor } from '../../rule';
import type { ImmigrationEpisode, RuleContext } from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  applicationPresence,
  lastPermissionBefore,
} from './shared';

const isAncestry = (e: ImmigrationEpisode) =>
  e.route === 'UK_ANCESTRY' && e.role === 'MAIN';

/**
 * UKA 13.1–14.1: assess only main applicant permission. After a route
 * switch, CR 1.1(d) also permits using the last UK Ancestry expiry.
 */
export function ukAncestryResidence({
  timeline,
  simulationDate,
}: RuleContext): CurrentResidence | undefined {
  const current = episodeOn(timeline, simulationDate);
  if (!current) return undefined;
  const onAncestry = isAncestry(current);
  const lastAncestry = onAncestry
    ? undefined
    : lastPermissionBefore(
        timeline.episodes.filter(isAncestry),
        simulationDate,
      );
  if (
    !onAncestry &&
    (!lastAncestry || lastAncestry.validTo >= simulationDate)
  ) {
    return undefined;
  }
  return currentResidence(
    timeline,
    simulationDate,
    isAncestry,
    cl.values.ukAncestryQualifyingYears.value,
    { ancestryExpiry: lastAncestry?.validTo },
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
      { srcId: 'SRC-008', locator: 'CR 1.1(d)' },
      ...crResidenceSources,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const presence = applicationPresence(ctx.timeline, ctx.simulationDate, L);
    if (presence) {
      return {
        ...presence,
        sources: [{ srcId: 'SRC-026', locator: 'UKA 10.2(d)' }],
      };
    }
    const years = cl.values.ukAncestryQualifyingYears.value;
    const residence = ukAncestryResidence(ctx);
    if (!residence) {
      return {
        status: 'FAIL',
        explanation: L(
          '未找到当前 UK Ancestry 主申请人许可或在最近一次该许可到期前完成的合格期（UKA 13.1，CR 1.1(d)）。',
          'No current UK Ancestry main applicant permission or qualifying period completed by the last expiry of that permission was found (UKA 13.1, CR 1.1(d)).',
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
    assumptions.push(
      ...residenceAssumptions(ctx.timeline, ctx.simulationDate, residence, L),
    );
    const { start, referenceDate } = residence;
    if (referenceDate < ctx.simulationDate) {
      return {
        status: 'PASS',
        explanation: L(
          `已转其他路线。按 CR 1.1(d) 从最近一次 UK Ancestry 主申请人许可到期日 ${referenceDate} 倒算，自 ${start} 起的合格期已满 ${years} 年（UKA 13.1–14.1）。`,
          `After switching routes, the last UK Ancestry main applicant permission expired on ${referenceDate}. Counting back from that date under CR 1.1(d), the qualifying period from ${start} reached ${years} years (UKA 13.1–14.1).`,
        ),
        assumptions,
      };
    }
    return residence.applicationDate === ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续持 UK Ancestry 主申请人许可，${residenceCompleted(residence, ctx.simulationDate, years, L)}（UKA 13.1）。`,
            `Continuous UK Ancestry permission as the main applicant since ${start}: ${residenceCompleted(residence, ctx.simulationDate, years, L)} (UKA 13.1).`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续持 UK Ancestry 主申请人许可，${residencePending(residence, years, L)}（UKA 13.1）。`,
            `Continuous UK Ancestry permission as the main applicant since ${start}: ${residencePending(residence, years, L)} (UKA 13.1).`,
          ),
          assumptions,
        };
  },
);
