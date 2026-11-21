import {
  currentLaw2026_11 as cl,
  routeNames,
} from '@uk-immigration/policy-data';
import { addMonths } from '../../dates';
import { continuousRun, currentResidence, episodeOn } from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, nameIn, textFor } from '../../rule';
import type { Route } from '@uk-immigration/policy-data';
import type { IsoDate, RuleContext } from '../../types';
import {
  applicationPresence,
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
} from './shared';

// LR 11.1(a): permission on any route counts except these. Short-term Student
// (English language) is not a separate route here.
const LR_EXCLUDED: Route[] = ['VISIT', 'SEASONAL_WORKER', 'UKRAINE_SCHEME'];

/**
 * LR 11.3–11.4: from 12 months on the current route, unless the current
 * permission was granted (approximated by its start) before 2024-04-11.
 */
export function currentRouteFrom({
  timeline,
  simulationDate,
}: RuleContext): { route: Route; since: IsoDate; from: IsoDate } | undefined {
  const current = episodeOn(timeline, simulationDate);
  if (
    !current ||
    current.validFrom < cl.values.longResidenceCurrentRouteGrantedFrom.value
  )
    return undefined;
  const since = continuousRun(
    timeline,
    simulationDate,
    (e) => e.route === current.route,
  ).episodes[0].validFrom;
  return {
    route: current.route,
    since,
    from: addMonths(since, cl.values.longResidenceCurrentRouteMonths.value),
  };
}

/** Start of the continuous lawful residence for Long Residence. */
export function longResidence(
  ctx: RuleContext,
  checkLocation = true,
): CurrentResidence | undefined {
  // notBefore defaults to the simulation date; only a later date replaces it.
  const routeFrom = currentRouteFrom(ctx)?.from;
  return currentResidence(
    ctx.timeline,
    ctx.simulationDate,
    (e) => !LR_EXCLUDED.includes(e.route),
    cl.values.longResidenceQualifyingYears.value,
    {
      longResidence: true,
      checkLocation,
      ...(routeFrom &&
        routeFrom > ctx.simulationDate && { notBefore: routeFrom }),
    },
  );
}

export function longResidenceMet(ctx: RuleContext): boolean {
  const residence = longResidence(ctx, false);
  return residence?.applicationDate === ctx.simulationDate;
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
      ...crResidenceSources,
      { srcId: 'SRC-008', locator: 'CR 3.3' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const presence = applicationPresence(ctx.timeline, ctx.simulationDate, L);
    if (presence)
      return {
        ...presence,
        sources: [{ srcId: 'SRC-005', locator: 'LR 9.3' }],
      };
    const years = cl.values.longResidenceQualifyingYears.value;
    const residence = longResidence(ctx);
    const currentRoute = currentRouteFrom(ctx);
    const rn = (r: Route) => nameIn(L, routeNames[r]);
    const assumptions = [
      L(
        `连续合法居留计入${rn('STUDENT')}、${rn('GRADUATE')}等临时路线，不计${LR_EXCLUDED.map(rn).join('、')}（LR 11.1(a)）；符合 CR 4.2 的已识别空档予以扣除。LR 11.2(a) 的 immigration bail 等未建模。`,
        `Continuous lawful residence includes temporary routes such as ${rn('STUDENT')} and ${rn('GRADUATE')}, but not ${LR_EXCLUDED.map(rn).join(', ')} (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) are outside the model.`,
      ),
      ...(currentRoute && currentRoute.from > ctx.simulationDate
        ? [
            L(
              `当前许可自 ${cl.values.longResidenceCurrentRouteGrantedFrom.value} 起获批（以许可起始日近似获批日），须在当前路线（${rn(currentRoute.route)}，自 ${currentRoute.since} 起）满 ${cl.values.longResidenceCurrentRouteMonths.value} 个月，即 ${currentRoute.from} 起才可申请（LR 11.3–11.4）。`,
              `The current permission was granted on or after ${cl.values.longResidenceCurrentRouteGrantedFrom.value} (its start is used as the grant date), so ${cl.values.longResidenceCurrentRouteMonths.value} months on the current route (${rn(currentRoute.route)}, since ${currentRoute.since}) are needed: applications from ${currentRoute.from} (LR 11.3–11.4).`,
            ),
          ]
        : []),
      ...(ctx.timeline.absences.length > 0
        ? [
            L(
              `${cl.values.longResidenceLegacyAbsenceBefore.value} 前开始的缺席整趟按 CR 3.3 的 ${cl.values.longResidenceLegacyMaxSingleAbsenceDays.value} 天单次上限；只有分界前且落在所选合格期内的天数计入 ${cl.values.longResidenceLegacyMaxTotalAbsenceDays.value} 天累计上限。自分界日起开始的行程按 CR 3.1；只计出境与返英之间的整天。`,
              `Absences starting before ${cl.values.longResidenceLegacyAbsenceBefore.value} are subject to the CR 3.3 limit of ${cl.values.longResidenceLegacyMaxSingleAbsenceDays.value} days per trip. Only days before the cut-off and within the selected qualifying period count towards the ${cl.values.longResidenceLegacyMaxTotalAbsenceDays.value}-day total. Trips beginning on or after the cut-off follow CR 3.1; only whole days abroad between departure and return count.`,
            ),
          ]
        : []),
    ];
    if (!residence) {
      return {
        status: 'FAIL',
        explanation: L(
          `${ctx.simulationDate} 当日没有计入 Long Residence 的许可。`,
          `No permission counting towards Long Residence on ${ctx.simulationDate}.`,
        ),
        assumptions,
      };
    }
    assumptions.push(
      ...residenceAssumptions(ctx.timeline, ctx.simulationDate, residence, L),
    );
    const { start } = residence;
    return residence.applicationDate === ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续合法居留，${residenceCompleted(residence, ctx.simulationDate, years, L)}。`,
            `Continuous lawful residence since ${start}: ${residenceCompleted(residence, ctx.simulationDate, years, L)}.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续合法居留，${residencePending(residence, years, L)}。`,
            `Continuous lawful residence since ${start}: ${residencePending(residence, years, L)}.`,
          ),
          assumptions,
        };
  },
);
