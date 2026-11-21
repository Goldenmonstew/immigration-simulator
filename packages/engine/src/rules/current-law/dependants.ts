import { textFor } from '../../rule';
import { nextPermissionFiling } from '../../residence';
import type { CurrentResidence } from '../../residence';
import type { Lang } from '../../rule';
import type {
  IsoDate,
  PersonTimeline,
  RuleContext,
  RuleResult,
} from '../../types';
import type { Route } from '@uk-immigration/policy-data';
import { RULE_SET } from './shared';

// Dependants of Hong Kong BN(O), Global Talent and Appendix FM partners
// (contracts §15). Each pathway gives the rule's result and, when it passes,
// the start and years of the candidate.

export interface DependantPathway {
  years: number;
  start?: IsoDate;
  applicationDate?: IsoDate;
  result: Omit<RuleResult, 'sources'>;
}

export const needsPrincipal = (L: Lang, assumptions: string[]) => ({
  status: 'UNKNOWN' as const,
  explanation: L(
    '填写主申请人信息后可判断。',
    'This can be assessed once the principal applicant’s details are provided.',
  ),
  assumptions,
});

export const notYetSettledAssumption = (L: Lang) =>
  L(
    '主申请人尚未定居时，只判断与主申请人同时获批；若其已定居，须在主申请人信息里填写定居日期与路线。',
    'While the principal applicant has not settled, only being granted at the same time as them is assessed; if they have already settled, enter their settlement date and route in the principal applicant’s details.',
  );

/** Why a dependant cannot settle with P now, as in withoutPrincipalPathway. */
export function principalNotReady(
  ctx: RuleContext,
  onRoute: boolean,
  route: string,
  assumptions: string[],
): Omit<RuleResult, 'sources'> {
  const L = textFor(ctx);
  if (!onRoute) {
    return {
      status: 'UNKNOWN',
      explanation: L(
        `主申请人当前不在 ${route} 路线上；若其已定居，请填写主申请人的定居日期与路线。`,
        `The principal applicant is not currently on the ${route} route; if they have already settled, enter their settlement date and route.`,
      ),
      assumptions,
    };
  }
  const result = ctx.principal!.result.byRuleSet[RULE_SET];
  return result?.outcome === 'LIKELY_NOT_ELIGIBLE'
    ? {
        status: 'FAIL',
        explanation: L(
          `主申请人目前不能按 ${route} 路线定居，本人不能随其定居。`,
          `The principal applicant cannot currently settle on the ${route} route, so this person cannot settle with them.`,
        ),
        assumptions,
      }
    : {
        status: 'UNKNOWN',
        // With decidedBy, P's result rests on another pathway (§16.2).
        explanation: result?.decidedBy
          ? L(
              `主申请人的现行法律结论不是按 ${route} 路线得出的（例如按 Long Residence），本人随其按 ${route} 路线定居的时间无法判断。`,
              `The principal applicant’s current-rules result is not on the ${route} route (for example, it is under Long Residence), so when this person could settle with them on the ${route} route cannot be determined.`,
            )
          : L(
              `主申请人的信息不足以判断其能否按 ${route} 路线定居。`,
              `The principal applicant’s details are not enough to determine whether they can settle on the ${route} route.`,
            ),
        assumptions,
      };
}

/** CR 3.2 windows can change with the filing date. Recheck both on one day. */
export function jointApplication<
  T extends { applicationDate?: IsoDate },
  P extends CurrentResidence,
>(
  date: IsoDate,
  ownFrom: (date: IsoDate) => T | undefined,
  principalFrom: (date: IsoDate) => P | undefined,
) {
  for (;;) {
    const own = ownFrom(date);
    if (!own?.applicationDate) return undefined;
    const principal = principalFrom(own.applicationDate);
    if (!principal?.applicationDate) return undefined;
    if (principal.applicationDate === own.applicationDate)
      return { ...own, principal };
    date = principal.applicationDate;
  }
}

/** HK 62.1(b), SW 41A–43, GT 29A–31, SETF 12–14: no qualifying period of the child's own. */
export function childFiling(
  timeline: PersonTimeline,
  from: IsoDate,
  route: Route,
) {
  return nextPermissionFiling(
    timeline,
    from,
    (e) =>
      e.route === route && e.role === 'DEPENDANT' && e.dependantOf === 'PARENT',
  );
}

export const noJointApplication = (L: Lang, assumptions: string[]) => ({
  status: 'FAIL' as const,
  explanation: L(
    '按已申报的许可和行程，无法给出双方都满足条件的同一天申请日。',
    'The recorded permissions and travel do not support a date when both applicants can apply together.',
  ),
  assumptions,
});
