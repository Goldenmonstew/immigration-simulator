import { earnedSettlement2026_11 as es } from '@uk-immigration/policy-data';
import type { RouteGroup } from '@uk-immigration/policy-data';
import { addYears, fullYears } from '../dates';
import { episodeOn, restartAfterAbsences, settledBy } from '../residence';
import { defineRule, textFor } from '../rule';
import type { Lang } from '../rule';
import type { IsoDate, RuleContext, SettlementAssessment } from '../types';
import { esPublicFunds, gbp } from './es-contribution';
import {
  childDependantAssumption,
  esBreach,
  isAdultOn,
} from './es-requirements';
import { esQualifyingResidence } from './es-residence';

// A dependant settles through the principal (SRC-001 Chapter 5, p28–p31).

const RULE_SET = 'earned-settlement-2026-11';

/** The pending details behind an assessment's UNKNOWN rules. */
function pendingOf(assessment: SettlementAssessment): string[] {
  return [
    ...new Set(
      assessment.rules.flatMap((r) =>
        r.status === 'UNKNOWN' ? (r.pendingDetails ?? []) : [],
      ),
    ),
  ];
}

interface DependantSettlement {
  /** The principal's pathway. */
  years: number;
  /** The dependant can apply `years` after this. */
  start: IsoDate;
  /** Principal's qualifying residence start + `years` (PD-060). */
  familyEligible: IsoDate;
  /** The partner's own qualifying residence started after the principal's. */
  joinedLater: boolean;
  routeGroup?: RouteGroup;
  /** Set when the principal is only potentially eligible. */
  pendingDetails: string[];
  /** The principal's date is only a conditional completion (A6#7). */
  conditional: boolean;
  publicFundsReassessmentDate?: IsoDate;
}

/**
 * The pathway the principal's Earned Settlement result gives the dependant:
 * none unless the principal has a pathway (eligible, potentially eligible or
 * projected). A partner who joined later needs the same period of their own
 * (p29); a child settles with the principal whenever they joined (PD-058).
 */
export function esDependantSettlement(
  ctx: RuleContext,
): DependantSettlement | undefined {
  const { timeline, simulationDate, principal } = ctx;
  const episode = episodeOn(timeline, simulationDate);
  if (
    episode?.role !== 'DEPENDANT' ||
    !episode.dependantOf ||
    !principal ||
    settledBy(principal.timeline, simulationDate)
  ) {
    return undefined;
  }
  const assessment = principal.result.byRuleSet[RULE_SET];
  if (!assessment?.pathwayYears) return undefined;
  const principalStart = esQualifyingResidence({
    timeline: principal.timeline,
    simulationDate,
  })?.start;
  if (!principalStart) return undefined;
  const years = assessment.pathwayYears;
  const residence = esQualifyingResidence(ctx);
  // SRC-001 p31, Individual B: the period must be held as a partner dependant.
  let partnerFrom: IsoDate | undefined;
  for (const permission of residence?.run.episodes ?? []) {
    partnerFrom =
      permission.role === 'DEPENDANT' && permission.dependantOf === 'PARTNER'
        ? (partnerFrom ?? permission.validFrom)
        : undefined;
  }
  const own =
    episode.dependantOf === 'PARTNER' && partnerFrom
      ? restartAfterAbsences(partnerFrom, simulationDate, timeline.absences)
      : residence?.start;
  const joinedLater = own !== undefined && own > principalStart;
  return {
    years,
    start:
      joinedLater && episode.dependantOf === 'PARTNER' ? own : principalStart,
    familyEligible: addYears(principalStart, years),
    joinedLater,
    ...(assessment.routeGroup && { routeGroup: assessment.routeGroup }),
    pendingDetails:
      assessment.outcome === 'POTENTIALLY_ELIGIBLE'
        ? pendingOf(assessment)
        : [],
    conditional: assessment.pathwayCompletionDate !== undefined,
    ...(assessment.publicFundsReassessmentDate && {
      publicFundsReassessmentDate: assessment.publicFundsReassessmentDate,
    }),
  };
}

const principalAssumption = (L: Lang) =>
  L(
    'dependant 的路径年限与日期按主申请人在同一申请日的 Earned Settlement 评估结果推出；主申请人自己的规则明细见其本人的结果。',
    'The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.',
  );

export const esDependantPathway = defineRule(
  {
    id: 'ES-DEPENDANT-PATHWAY',
    ruleSetId: RULE_SET,
    title: '随主申请人定居（dependant）',
    titleEn: 'Settle with the principal applicant (dependant)',
    sources: [
      { srcId: 'SRC-001', locator: 'p29' },
      { srcId: 'SRC-001', locator: 'p30' },
      { srcId: 'SRC-001', locator: 'p31' },
    ],
    pendingDetails: [
      'PD-056',
      'PD-057',
      'PD-058',
      'PD-059',
      'PD-060',
      'PD-061',
      'PD-062',
      'PD-063',
    ],
  },
  (ctx) => {
    const { timeline, simulationDate, principal } = ctx;
    const L = textFor(ctx);
    const episode = episodeOn(timeline, simulationDate);
    if (episode?.role !== 'DEPENDANT') {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是以 dependant 身份持证，不走随主申请人定居的路径。',
          'The current permission is not as a dependant, so the pathway of settling with the principal applicant does not apply.',
        ),
      };
    }
    if (!principal) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '当前以 dependant 身份在英，dependant 随主申请人定居；填写主申请人信息后可判断。',
          'Currently in the UK as a dependant, and a dependant settles with the principal applicant; this can be assessed once the principal applicant’s details are provided.',
        ),
      };
    }
    if (!episode.dependantOf) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写是作为主申请人的伴侣还是子女随行。',
          'Not provided whether this is as the principal applicant’s partner or child.',
        ),
      };
    }
    const settled = settledBy(principal.timeline, simulationDate);
    if (settled) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `主申请人已于 ${settled.date} 定居。Earned Settlement 只讲了 dependant 与主申请人同时定居、或后到伴侣补足同样的合格期（p29–p31），没有说主申请人已定居后其 dependant 如何定居。`,
          `The principal applicant settled on ${settled.date}. Earned Settlement only covers dependants settling at the same time as the principal applicant, or a partner who joined later completing the same qualifying period (p29–p31); it does not say how a dependant settles after the principal applicant has settled.`,
        ),
        pendingDetails: ['PD-063'],
      };
    }
    const settlement = esDependantSettlement(ctx);
    if (!settlement) {
      const outcome = principal.result.byRuleSet[RULE_SET]?.outcome;
      return outcome === 'LIKELY_NOT_ELIGIBLE'
        ? {
            status: 'FAIL',
            explanation: L(
              '主申请人目前不满足 Earned Settlement 的强制要求，dependant 不能随其定居；主申请人补足后再评估。',
              'The principal applicant does not currently meet the Earned Settlement requirements, so the dependant cannot settle with them; reassess once the principal applicant meets them.',
            ),
          }
        : {
            status: 'UNKNOWN',
            explanation:
              outcome === 'REQUIRES_REGULATED_REVIEW'
                ? L(
                    '主申请人的情况需由受监管顾问判断，dependant 能否随其定居也无法判断。',
                    'The principal applicant’s circumstances need a regulated adviser’s assessment, so whether the dependant can settle with them cannot be determined either.',
                  )
                : L(
                    '主申请人的信息不足以确定其定居路径，dependant 随之无法判断。',
                    'The principal applicant’s details are not enough to determine their settlement pathway, so the dependant cannot be assessed either.',
                  ),
          };
    }
    const { years, start, familyEligible, joinedLater, pendingDetails } =
      settlement;
    const assumptions = [principalAssumption(L)];
    let explanation: string;
    if (episode.dependantOf === 'PARTNER') {
      assumptions.push(
        L(
          `伴侣的收入要求按最低收入（个人 ${gbp(es.values.earningsThresholdMinimum.value)} 或家庭合计 ${gbp(es.values.householdEarningsThreshold.value)}）判断，不按主申请人的加速门槛（PD-056）。`,
          `The partner’s earnings requirement is the minimum earnings (${gbp(es.values.earningsThresholdMinimum.value)} individually or ${gbp(es.values.householdEarningsThreshold.value)} combined household earnings), not the principal applicant’s accelerated threshold (PD-056).`,
        ),
      );
      if (joinedLater) {
        explanation = L(
          `主申请人走 ${years} 年路径，${familyEligible} 满期。伴侣的连续 partner dependant 合格期自 ${start} 起算，${addYears(start, years)} 满同样年限。`,
          `The principal applicant is on the ${years}-year pathway, completed on ${familyEligible}. The partner’s continuous qualifying period as a partner dependant starts on ${start} and reaches the same length on ${addYears(start, years)}.`,
        );
        assumptions.push(
          L(
            `后到伴侣的合格期取主申请人所在路径的年限（${years} 年），申报的连续 partner dependant 许可按同一主申请人处理（PD-057）。`,
            `A partner who joined later needs the length of the principal applicant’s pathway (${years} years). Their consecutive partner-dependant permissions are treated as linked to the same principal (PD-057).`,
          ),
        );
      } else {
        explanation = L(
          `主申请人的 ${years} 年路径于 ${familyEligible} 满期，届时伴侣的合格期也已达到同样年限。双方各自满足相关要求即可一同定居。`,
          `When the principal applicant’s ${years}-year pathway is completed on ${familyEligible}, the partner will also have completed the same qualifying period. They can settle together if they each meet the relevant requirements.`,
        );
      }
    } else {
      const age = fullYears(timeline.dateOfBirth, familyEligible);
      assumptions.push(
        L(
          `"家庭符合定居资格时"的年龄按主申请人首次满期之日（${familyEligible}）计算，不按实际申请日（PD-060）。`,
          `Age “when the family becomes eligible for settlement” is taken on the date the principal applicant first completes their pathway (${familyEligible}), not the actual application date (PD-060).`,
        ),
        L(
          '只按一位主申请人评估，假设另一位家长同时定居或就是主申请人的随行伴侣（PD-061）。',
          'Assessed against one principal applicant only, assuming the other parent settles at the same time or is the principal applicant’s accompanying partner (PD-061).',
        ),
      );
      if (joinedLater) {
        assumptions.push(
          L(
            '子女晚于主申请人加入，仍按主申请人的定居时点随家庭定居，不另计自己的合格期（PD-058）。',
            'A child who joined after the principal applicant still settles with the family when the principal applicant does, without a qualifying period of their own (PD-058).',
          ),
        );
      }
      if (age >= es.values.independentAge.value) {
        return {
          status: 'FAIL',
          explanation: L(
            `家庭 ${familyEligible} 符合定居资格时已满 ${age} 岁（${es.values.independentAge.value} 岁及以上），不能作为 dependant 随家庭定居；须独立满足某条定居路径的全部强制与资格要求，或转入自己的移民路线。`,
            `Aged ${age} when the family becomes eligible for settlement on ${familyEligible} (${es.values.independentAge.value} or over), so cannot settle with the family as a dependant; they must independently meet every mandatory and qualifying requirement of a settlement pathway, or switch to an immigration route of their own.`,
          ),
          assumptions,
        };
      }
      if (isAdultOn(timeline, simulationDate)) {
        explanation = L(
          `${es.values.adultAge.value} 至 ${es.values.independentAge.value - 1} 岁保留 child-dependant 身份，随家庭定居（主申请人 ${years} 年路径，${familyEligible} 满期）；须满足成人强制要求（犯罪记录、政府债务、B2 英语、Life in the UK），不需个人收入。`,
          `Aged ${es.values.adultAge.value} to ${es.values.independentAge.value - 1} and retaining child-dependant status, so settles with the family (principal applicant’s ${years}-year pathway, completed on ${familyEligible}); the adult mandatory requirements apply (criminality, government debt, B2 English, Life in the UK), but not individual earnings.`,
        );
        assumptions.push(childDependantAssumption(L));
      } else {
        explanation = L(
          `未满 ${es.values.adultAge.value} 岁的子女随父母定居（主申请人 ${years} 年路径，${familyEligible} 满期）；豁免收入、政府债务、英语与 Life in the UK，只须满足 suitability 与犯罪记录要求。`,
          `A child under ${es.values.adultAge.value} settles with their parents (principal applicant’s ${years}-year pathway, completed on ${familyEligible}); exempt from earnings, government debt, English and Life in the UK, with only the suitability and criminality requirements to meet.`,
        );
      }
    }
    if (isAdultOn(timeline, simulationDate)) {
      const funds = esPublicFunds.evaluate(ctx);
      const fundsPending = (funds.pendingDetails ?? []).filter(
        (id) => id === 'PD-013' || id === 'PD-014',
      );
      if (funds.status === 'FAIL' || esBreach.evaluate(ctx).status === 'FAIL') {
        const fallback = es.values.pathwayYears20.value;
        return {
          status: 'UNKNOWN',
          explanation: L(
            `${explanation}本人用过 public funds 或成年后有 qualifying breach。原文未说明这是否让 dependant 本人另走 ${fallback} 年路径。`,
            `${explanation} They have used public funds or have a qualifying breach as an adult. The response does not say whether this puts the dependant on a ${fallback}-year pathway of their own.`,
          ),
          pendingDetails: [
            ...new Set(['PD-062', ...fundsPending, ...pendingDetails]),
          ],
          assumptions,
        };
      }
      if (fundsPending.length > 0) {
        return {
          status: 'UNKNOWN',
          explanation: `${explanation} ${funds.explanation}`,
          sources: [...esDependantPathway.meta.sources, ...funds.sources],
          pendingDetails: [...new Set([...fundsPending, ...pendingDetails])],
          assumptions,
        };
      }
    }
    if (pendingDetails.length > 0) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `${explanation}主申请人目前只是可能符合资格，取决于政府未定的细节。`,
          `${explanation} The principal applicant is currently only potentially eligible, depending on details the government has not yet set.`,
        ),
        pendingDetails,
        assumptions,
      };
    }
    return { status: 'PASS', explanation, assumptions };
  },
);
