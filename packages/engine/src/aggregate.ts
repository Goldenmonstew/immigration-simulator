import {
  currentLaw2026_11 as cl,
  earnedSettlement2026_11 as es,
  publicFundsBenefits,
} from '@uk-immigration/policy-data';
import type { Route, RouteGroup } from '@uk-immigration/policy-data';
import { addDays, addYears } from './dates';
import {
  continuousRun,
  episodeOn,
  nextKnownApplicationDate,
  timelineAtFiling,
} from './residence';
import { runRule, textFor } from './rule';
import type { Lang } from './rule';
import { settlementEnglish, settlementKol } from './rules/current-law/english';
import {
  esHighestTalent,
  historicalEventsAssumption,
} from './rules/es-requirements';
import {
  familyChildPathway,
  familyFiveYearStart,
  familyTenYearResidence,
  globalTalentDependantPathway,
  globalTalentQualifying,
  hongKongBnoDependant,
  hongKongBnoDependantPathway,
  hongKongBnoResidence,
  innovatorFounderResidence,
  longResidence,
  privateLifeQualifying,
  protectionStart,
  onFamilyPartner,
  onHongKongBno,
  onProtection,
  onSkilledWorker,
  onSkilledWorkerChild,
  onSkilledWorkerPartner,
  skilledWorkerChildFiling,
  skilledWorkerPartnerResidence,
  ukAncestryResidence,
} from './rules/current-law';
import { applicationPresence } from './rules/current-law/shared';
import { familyFiveYearFiling } from './rules/current-law/family';
import { adultChildResidence } from './rules/current-law/hong-kong-bno';
import {
  pendingOnJointDay,
  skilledWorkerFiling,
} from './rules/current-law/skilled-worker';
import { currentLawApplicationPresence } from './rules/current-law/scope';
import { esDependantSettlement } from './rules/es-dependant';
import {
  illegalEntryExtraYears,
  protectionBaseYears,
} from './rules/es-protection';
import {
  esProtectionRouteOn,
  esQualifyingResidence,
  esRouteOn,
  groupsOf,
} from './rules/es-residence';
import type {
  IsoDate,
  Rule,
  RuleContext,
  RuleId,
  RuleOutcome,
  RuleSet,
  SettlementAssessment,
} from './types';

// Turns rule outcomes into a pathway, an outcome and an earliest date. Not a
// rule itself: the rules say what holds, this says what it adds up to.

/** One way to settle: every rule must pass and `years` of residence from `start`. */
interface Candidate {
  years: number;
  start?: IsoDate;
  /** Earned Settlement: earlier start if pending residence policy allows it. */
  possibleStart?: IsoDate;
  /** When set, the residence calculation has already resolved CR 1.1. */
  applicationDate?: IsoDate;
  rules: RuleOutcome[];
  /**
   * The display-only residence rule that gives `start` (contracts §12.4,
   * §16.1): part of `decidedBy`, not of the candidate's status.
   */
  residence?: RuleId;
}

type Decision = Pick<
  SettlementAssessment,
  'outcome' | 'pathwayYears' | 'earliestDate' | 'decidedBy'
> & {
  /** Start of the residence the earliest date was projected from. */
  projectedFrom?: IsoDate;
  projectedCandidate?: Candidate;
};

function statusOf(c: Candidate): RuleOutcome['status'] {
  if (c.rules.some((r) => r.status === 'FAIL')) return 'FAIL';
  if (c.rules.some((r) => r.status === 'UNKNOWN')) return 'UNKNOWN';
  return 'PASS';
}

const dueOf = (c: Candidate) =>
  'applicationDate' in c
    ? c.applicationDate
    : c.start && addYears(c.start, c.years);

/** The rule ids `c` rests on; toAssessment puts them in `rules` order. */
const basisOf = (c: Candidate): RuleId[] => [
  ...c.rules.map((r) => r.id),
  ...(c.residence ? [c.residence] : []),
];

/**
 * - Some candidate passes with enough residence → LIKELY_ELIGIBLE (shortest).
 * - Otherwise some candidate with enough residence (or unknown residence) is
 *   only UNKNOWN → POTENTIALLY_ELIGIBLE (with that pathway) if every unknown
 *   is a pending detail, else INSUFFICIENT_INFORMATION (no pathway).
 * - Otherwise LIKELY_NOT_ELIGIBLE, with the earliest date of the candidates
 *   that have not failed, assuming circumstances stay the same.
 * Whenever a pathway is given, `decidedBy` names its candidate (§16.1).
 */
function decide(
  candidates: Candidate[],
  simulationDate: IsoDate,
  canProject = (candidate: Candidate) => statusOf(candidate) !== 'FAIL',
): Decision {
  const met = (c: Candidate) => {
    const due = dueOf(c);
    return due !== undefined && due <= simulationDate;
  };
  const byYears = (a: Candidate, b: Candidate) => a.years - b.years;

  const now = candidates
    .filter((c) => statusOf(c) === 'PASS' && met(c))
    .sort(byYears)[0];
  if (now) {
    return {
      outcome: 'LIKELY_ELIGIBLE',
      pathwayYears: now.years,
      earliestDate: simulationDate,
      decidedBy: basisOf(now),
    };
  }

  const maybe = candidates
    .filter(
      (c) =>
        statusOf(c) === 'UNKNOWN' &&
        (met(c) ||
          !dueOf(c) ||
          (c.possibleStart &&
            addYears(c.possibleStart, c.years) <= simulationDate)),
    )
    .sort(byYears);
  if (maybe.length > 0) {
    const unknown = maybe.flatMap((c) =>
      c.rules.filter((r) => r.status === 'UNKNOWN'),
    );
    // A pathway is only shown when the user has given everything they can.
    return unknown.every((r) => r.pendingDetails?.length)
      ? {
          outcome: 'POTENTIALLY_ELIGIBLE',
          pathwayYears: maybe[0].years,
          decidedBy: basisOf(maybe[0]),
        }
      : { outcome: 'INSUFFICIENT_INFORMATION' };
  }

  const next = candidates
    .filter((c) => dueOf(c) && canProject(c))
    .sort((a, b) => {
      const [da, db] = [dueOf(a)!, dueOf(b)!];
      return da === db ? a.years - b.years : da < db ? -1 : 1;
    })[0];
  return next
    ? {
        outcome: 'LIKELY_NOT_ELIGIBLE',
        pathwayYears: next.years,
        earliestDate: dueOf(next),
        decidedBy: basisOf(next),
        projectedFrom: next.start,
        projectedCandidate: next,
      }
    : { outcome: 'LIKELY_NOT_ELIGIBLE' };
}

function projection(projectedFrom: IsoDate | undefined, L: Lang): string[] {
  return projectedFrom
    ? [
        L(
          `最早可申请日期按"自 ${projectedFrom} 起持续居留、收入等状况不变、其余要求届时仍满足"推算，不是对未来的保证。`,
          `The earliest application date is projected on the basis that residence continues from ${projectedFrom}, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.`,
        ),
      ]
    : [];
}

function toAssessment(
  { projectedFrom, decidedBy, outcome, pathwayYears, earliestDate }: Decision,
  rules: RuleOutcome[],
  assumptions: string[],
  L: Lang,
): SettlementAssessment {
  return {
    outcome,
    ...(pathwayYears !== undefined && { pathwayYears }),
    ...(earliestDate !== undefined && { earliestDate }),
    ...(decidedBy && {
      decidedBy: rules.map((r) => r.id).filter((id) => decidedBy.includes(id)),
    }),
    rules,
    assumptions: [
      ...new Set([
        ...assumptions,
        ...rules.flatMap((r) => r.assumptions ?? []),
        ...projection(projectedFrom, L),
      ]),
    ],
  };
}

const esBaseAssumption = (L: Lang) =>
  L(
    'Earned Settlement 已公布、尚未生效，按"假设在申请日适用"评估；规则依据为政府回应文件（SRC-001），不是已生效的 Immigration Rules（PD-001）。首批规则修改预计 2026 年 12 月起提交、2027 年 1 月生效，2027–2028 年继续修改（SRC-002 col 593；SRC-003 cols 1423–1424），具体生效日以届时的 Statement of Changes 为准（PD-003）。',
    'Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).',
  );

// Table 1 (p46), plus asylum support repayment, a minimum requirement for
// every applicant (p8 note 1).
const ES_MANDATORY = [
  'ES-CRIMINALITY',
  'ES-DEBT',
  'ES-ENGLISH-B2',
  'ES-KOL',
  'ES-ROUTE-GROUP',
  'ES-RESIDENCE',
  'ES-ASYLUM-SUPPORT',
];

// A dependant's one pathway: the mandatory requirements (with the exemptions
// inside the rules, p29–p30), the minimum income and the principal's pathway.
// ES-PUBLIC-FUNDS and ES-BREACH feed ES-DEPENDANT-PATHWAY (PD-062).
const ES_DEPENDANT_PATHWAY = [
  ...ES_MANDATORY,
  'ES-EARNINGS-10Y',
  'ES-DEPENDANT-PATHWAY',
];
const ES_DEPENDANT_RULES = [
  ...ES_DEPENDANT_PATHWAY,
  'ES-PUBLIC-FUNDS',
  'ES-BREACH',
];

// Rules only for protection routes (contracts §11).
const ES_PROTECTION_ONLY = [
  'ES-PROTECTION-PATHWAY',
  'ES-PROTECTION-CONTRIBUTION',
];

/**
 * Table 2 lists asylum support repayment for Protection Work and Study and
 * Core Protection only, not for Safe and Legal (PD-068).
 */
const protectionMandatory = (route: Route) =>
  route === 'SAFE_AND_LEGAL'
    ? ES_MANDATORY.filter((id) => id !== 'ES-ASYLUM-SUPPORT')
    : ES_MANDATORY;

/**
 * What a protection route runs: no earnings, British connection, public
 * service or transitional rules (Table 2).
 */
function protectionRuleIds(route: Route): string[] {
  return [
    ...protectionMandatory(route),
    'ES-BREACH',
    'ES-PUBLIC-FUNDS',
    'ES-PROTECTION-PATHWAY',
    ...(route === 'PROTECTION_WORK_AND_STUDY'
      ? ['ES-PROTECTION-CONTRIBUTION']
      : []),
  ];
}

/**
 * Table 2 (p47–p48): one pathway per protection route, plus the 20 years
 * left after public funds or a breach (p13, p39). Illegal entry adds 10
 * years to each (p38, p48).
 */
function protectionCandidates(
  route: Route,
  pick: (...ids: string[]) => RuleOutcome[],
  ctx: RuleContext,
): Candidate[] {
  const mandatory = [
    ...pick(...protectionMandatory(route)),
    ...pick('ES-PROTECTION-PATHWAY'),
  ];
  const extra = illegalEntryExtraYears(ctx);
  const base = protectionBaseYears(route) + extra;
  const fallback = es.values.pathwayYears20.value + extra;
  const candidates: Candidate[] =
    route === 'SAFE_AND_LEGAL'
      ? [
          { years: base, rules: [...mandatory, ...pick('ES-BREACH')] },
          { years: fallback, rules: mandatory },
        ]
      : route === 'PROTECTION_WORK_AND_STUDY'
        ? [
            {
              years: base,
              rules: [
                ...mandatory,
                ...pick(
                  'ES-BREACH',
                  'ES-PUBLIC-FUNDS',
                  'ES-PROTECTION-CONTRIBUTION',
                ),
              ],
            },
            ...(pick('ES-BREACH', 'ES-PUBLIC-FUNDS').some(
              (rule) => rule.status === 'FAIL',
            )
              ? [{ years: fallback, rules: mandatory }]
              : []),
          ]
        : [{ years: base, rules: mandatory }];
  const { start, possibleStart } = esQualifyingResidence(ctx) ?? {};
  return candidates.map((c) => ({ ...c, start, possibleStart }));
}

/** `rules` with `id` failed for want of time, until `earliestDate`. */
function showProjected(
  rules: RuleOutcome[],
  id: string,
  decision: Decision,
  note: string,
): RuleOutcome[] {
  return decision.projectedFrom
    ? rules.map((r) =>
        r.id === id
          ? { ...r, status: 'FAIL' as const, explanation: r.explanation + note }
          : r,
      )
    : rules;
}

function assessDependant(
  ctx: RuleContext,
  rules: RuleOutcome[],
): SettlementAssessment {
  const L = textFor(ctx);
  const assumptions = [esBaseAssumption(L)];
  const current = episodeOn(ctx.timeline, ctx.simulationDate);
  if (!ctx.principal || !current?.dependantOf) {
    return toAssessment(
      { outcome: 'INSUFFICIENT_INFORMATION' },
      rules,
      assumptions,
      L,
    );
  }
  const pathway = rules.filter((r) => ES_DEPENDANT_PATHWAY.includes(r.id));
  const settlement = esDependantSettlement(ctx);
  if (!settlement) {
    const unknown = pathway.filter((r) => r.status === 'UNKNOWN');
    return toAssessment(
      {
        outcome: pathway.some((r) => r.status === 'FAIL')
          ? 'LIKELY_NOT_ELIGIBLE'
          : unknown.every((r) => r.pendingDetails?.length)
            ? 'POTENTIALLY_ELIGIBLE'
            : 'INSUFFICIENT_INFORMATION',
      },
      rules,
      assumptions,
      L,
    );
  }
  const decision = decide(
    [{ years: settlement.years, start: settlement.start, rules: pathway }],
    ctx.simulationDate,
  );
  const shown = showProjected(
    rules,
    'ES-DEPENDANT-PATHWAY',
    decision,
    L(
      `截至 ${ctx.simulationDate} 尚未满期。`,
      ` Not yet completed by ${ctx.simulationDate}.`,
    ),
  );
  const routeGroupPassed =
    rules.find((r) => r.id === 'ES-ROUTE-GROUP')?.status === 'PASS';
  // The dependant's pathway follows the principal's (SRC-001 p18, p29–p31):
  // a conditional principal date makes the dependant's date conditional too.
  const conditional =
    settlement.conditional && decision.earliestDate
      ? decision.earliestDate
      : undefined;
  const { earliestDate, projectedFrom, ...rest } = decision;
  if (conditional) {
    assumptions.push(
      L(
        `主申请人的路径日期只是条件满期日，随行申请的 ${decision.pathwayYears} 年路径同样按条件于 ${conditional} 满期。`,
        `The principal applicant's pathway date is only a conditional completion, so the dependant's ${decision.pathwayYears}-year pathway also completes conditionally on ${conditional}.`,
      ),
    );
  }
  if (settlement.publicFundsReassessmentDate) {
    assumptions.push(
      L(
        `主申请人若不再领取所计入的 public funds，自 ${settlement.publicFundsReassessmentDate} 起可按较短路径重新评估，随行申请随之重评。`,
        `If the principal applicant receives no further counted public funds, shorter pathways can be reassessed from ${settlement.publicFundsReassessmentDate}, and the dependant with them.`,
      ),
    );
  }
  return {
    ...toAssessment(
      conditional ? rest : { ...rest, earliestDate, projectedFrom },
      shown,
      assumptions,
      L,
    ),
    ...(conditional && { pathwayCompletionDate: conditional }),
    ...(settlement.publicFundsReassessmentDate && {
      publicFundsReassessmentDate: settlement.publicFundsReassessmentDate,
    }),
    ...(routeGroupPassed &&
      settlement.routeGroup && { routeGroup: settlement.routeGroup }),
  };
}

function assessEarnedSettlement(
  ctx: RuleContext,
  ruleList: Rule[],
): SettlementAssessment {
  const current = episodeOn(ctx.timeline, ctx.simulationDate);
  // A dependant settles with the principal (p29–p31).
  if (current?.role === 'DEPENDANT') {
    return assessDependant(
      ctx,
      ruleList
        .filter((rule) => ES_DEPENDANT_RULES.includes(rule.meta.id))
        .map((rule) => runRule(rule, ctx)),
    );
  }
  const protection = esProtectionRouteOn(ctx.timeline, ctx.simulationDate);
  const route = esRouteOn(ctx.timeline, ctx.simulationDate);
  const groups = route ? groupsOf(route) : [];
  const rules = ruleList
    .filter((rule) =>
      protection
        ? protectionRuleIds(protection).includes(rule.meta.id)
        : rule.meta.id !== 'ES-DEPENDANT-PATHWAY' &&
          !ES_PROTECTION_ONLY.includes(rule.meta.id),
    )
    .map((rule) => runRule(rule, ctx));
  // The eligibility criteria are pending (PD-011), so expose the independent
  // talent route without using it to select a candidate or project a date.
  if (groups.includes('HIGH_TALENT')) rules.push(runRule(esHighestTalent, ctx));
  const pick = (...ids: string[]) =>
    ids.map((id) => rules.find((r) => r.id === id)!);
  if (protection) {
    const L = textFor(ctx);
    return finishEarnedSettlement(
      ctx,
      rules,
      protectionCandidates(protection, pick, ctx),
      [
        esBaseAssumption(L),
        L(
          '难民定居路径的多项细则（路线推出时间、已有时间如何计入、public funds 与偿还安排、Article 31）将在实施前公布；本结果仅帮助理解已公布的政策，具体情况请咨询受监管的移民顾问。',
          'Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.',
        ),
      ],
      'PROTECTION',
    );
  }
  const mandatory = pick(...ES_MANDATORY);
  const standard = [...mandatory, ...pick('ES-BREACH', 'ES-PUBLIC-FUNDS')];
  const v = es.values;
  const fiveYearRoutes = [
    'ES-EARNINGS-5Y',
    'ES-BRITISH-CONNECTION',
    'ES-PUBLIC-SERVICE',
    'ES-TRANSITIONAL-CARE-WORKER',
    'ES-TRANSITIONAL-HEALTH-EDUCATION',
  ];
  const { start, possibleStart } = esQualifyingResidence(ctx) ?? {};
  // Family and Private Life only qualifies for the 10 and 20-year pathways (p23).
  const shortPathways = !groups.includes('FAMILY_AND_PRIVATE_LIFE');
  const candidates: Candidate[] = [
    ...(shortPathways
      ? [
          {
            years: v.pathwayYears3.value,
            rules: [...standard, ...pick('ES-EARNINGS-3Y')],
          },
          ...fiveYearRoutes.map((id) => ({
            years: v.pathwayYears5.value,
            rules: [...standard, ...pick(id)],
          })),
        ]
      : []),
    {
      years: v.pathwayYears10.value,
      rules: [...standard, ...pick('ES-EARNINGS-10Y')],
    },
    // Public funds or a breach leave only the 20-year pathway (p13, p18, p46).
    {
      years: v.pathwayYears20.value,
      rules: [...mandatory, ...pick('ES-EARNINGS-10Y')],
    },
  ].map((c) => ({ ...c, start, possibleStart }));

  const L = textFor(ctx);
  const assumptions = [esBaseAssumption(L)];
  if (
    pick(
      'ES-TRANSITIONAL-CARE-WORKER',
      'ES-TRANSITIONAL-HEALTH-EDUCATION',
    ).some((r) => r.status === 'PASS')
  ) {
    assumptions.push(
      L(
        '原文未规定同时符合过渡安排与标准路径时如何取舍；本结果取满足条件的最短路径，申请人可能可以选择更有利的安排，需咨询受监管顾问。',
        'The response does not say how to choose when someone qualifies for both a transitional arrangement and a standard pathway; this result takes the shortest pathway whose conditions are met. The applicant may be able to choose a more favourable arrangement and should seek regulated advice.',
      ),
    );
  }
  // Pre April 2024 cohort (p44): no change to the pathway, only a note.
  const skilledWorkerFrom = continuousRun(
    ctx.timeline,
    ctx.simulationDate,
    (e) => e.route === 'SKILLED_WORKER' && e.role === 'MAIN',
  ).episodes[0]?.validFrom;
  if (
    skilledWorkerFrom &&
    skilledWorkerFrom < v.preApril2024CohortBefore.value
  ) {
    assumptions.push(
      L(
        `自 ${skilledWorkerFrom} 起连续持 Skilled Worker 许可，早于 ${v.preApril2024CohortBefore.value}，属"2024 年 4 月前群体"：可按现有薪资条件续签至 2035 年（p44，具体日期未定，PD-040）；本工具按标准路径计算定居年限。`,
        `Continuous Skilled Worker permission since ${skilledWorkerFrom}, before ${v.preApril2024CohortBefore.value}, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.`,
      ),
    );
  }
  return finishEarnedSettlement(ctx, rules, candidates, assumptions, groups[0]);
}

function finishEarnedSettlement(
  ctx: RuleContext,
  rules: RuleOutcome[],
  candidates: Candidate[],
  assumptions: string[],
  routeGroup: RouteGroup | undefined,
): SettlementAssessment {
  const L = textFor(ctx);
  const decision = decide(candidates, ctx.simulationDate);
  const residenceUnknown =
    rules.find((r) => r.id === 'ES-RESIDENCE')?.status === 'UNKNOWN';
  const selected = candidates.find(
    (c) =>
      decision.decidedBy?.every((id) => basisOf(c).includes(id)) &&
      c.years === decision.pathwayYears,
  );
  const due = selected && dueOf(selected);
  const completion = due && due > ctx.simulationDate ? due : undefined;
  const fundsFail = rules.some(
    (r) => r.id === 'ES-PUBLIC-FUNDS' && r.status === 'FAIL',
  );
  if (fundsFail) assumptions.push(historicalEventsAssumption(L, 'publicFunds'));
  const reassessment = fundsFail ? publicFundsReassessment(ctx) : undefined;
  const shorterPathMayReopen =
    reassessment &&
    candidates.some(
      (c) =>
        c.years < (decision.pathwayYears ?? Infinity) &&
        c.rules.some((r) => r.id === 'ES-PUBLIC-FUNDS') &&
        c.rules.every((r) => r.id === 'ES-PUBLIC-FUNDS' || r.status !== 'FAIL'),
    );
  const conditionalCompletion =
    completion &&
    (residenceUnknown || (shorterPathMayReopen && reassessment < completion))
      ? completion
      : undefined;
  const { earliestDate, projectedFrom, ...rest } = decision;
  if (conditionalCompletion) {
    assumptions.push(
      L(
        `按自 ${selected!.start} 起持续居留及其余要求届时满足的假设，所选 ${decision.pathwayYears} 年路径于 ${conditionalCompletion} 满期。`,
        `On the assumption that residence continues from ${selected!.start} and the remaining requirements are met then, the selected ${decision.pathwayYears}-year pathway completes on ${conditionalCompletion}.`,
      ),
    );
  }
  if (reassessment) {
    assumptions.push(
      L(
        `若不再领取所计入的 public funds，自 ${reassessment} 起可按较短路径重新评估。`,
        `If no further counted public funds are received, shorter pathways can be reassessed from ${reassessment}.`,
      ),
    );
  }
  // Not enough residence yet for the pathway the date was projected from:
  // ES-RESIDENCE shows that as the failing rule.
  const shown = residenceUnknown
    ? rules
    : showProjected(
        rules,
        'ES-RESIDENCE',
        decision,
        L(
          `${decision.pathwayYears} 年路径的居留还不够，${decision.earliestDate} 满 ${decision.pathwayYears} 年。`,
          ` Not enough residence yet for the ${decision.pathwayYears}-year pathway; ${decision.pathwayYears} years are completed on ${decision.earliestDate}.`,
        ),
      );
  return {
    ...toAssessment(
      conditionalCompletion ? rest : { ...rest, earliestDate, projectedFrom },
      shown,
      assumptions,
      L,
    ),
    ...(conditionalCompletion && {
      pathwayCompletionDate: conditionalCompletion,
    }),
    ...(reassessment && { publicFundsReassessmentDate: reassessment }),
    ...(rules.find((r) => r.id === 'ES-ROUTE-GROUP')?.status === 'PASS' && {
      routeGroup,
    }),
  };
}

// SRC-001 p18 and p39. The lookback includes the anniversary of the last use.
function publicFundsReassessment({ timeline, simulationDate }: RuleContext) {
  const years = es.values.publicFundsLookbackYears.value;
  const from = addYears(simulationDate, -years);
  const used = timeline.benefits.filter(
    (b) =>
      b.from <= simulationDate &&
      (b.to ?? simulationDate) >= from &&
      publicFundsBenefits.publicFunds.some(
        (entry) => entry.benefitType === b.benefitType,
      ),
  );
  if (used.some((b) => !b.to)) return undefined;
  const lastUse = used
    .map((b) => b.to!)
    .sort()
    .at(-1);
  return lastUse && addDays(addYears(lastUse, years), 1);
}

const clBaseAssumption = (L: Lang) =>
  L(
    '现行规则只建模 Skilled Worker 主申请人及其 dependent partner / child（Appendix Skilled Worker、Appendix Children）、Hong Kong BN(O) 主申请人及其 dependant（Appendix Hong Kong British National (Overseas)）、Global Talent 主申请人及其 dependent partner / child（Appendix Global Talent）、Appendix FM 伴侣（10 年路线按 Appendix Settlement Family Life，5 年路线按 Appendix FM）及其子女（10 年路线按 Appendix Settlement Family Life，5 年路线按 Immigration Rules Part 8 第 298 段）、持 refugee status 或 humanitarian protection 的主申请人（Appendix Settlement Protection）、UK Ancestry 主申请人（Appendix UK Ancestry）、Innovator Founder 主申请人（Appendix Innovator Founder）、Private Life 主申请人（Appendix Private Life）与 Long Residence（Appendix Long Residence）；Part Suitability、STP 2.1 的 suitability、担保方仍获批准（SW 24.1–24.2）等其他要求未建模。',
    'The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.',
  );

function assessCurrentLaw(
  ctx: RuleContext,
  ruleList: Rule[],
): SettlementAssessment {
  const L = textFor(ctx);
  const [scopeRule, ...others] = ruleList;
  const scope = runRule(scopeRule, ctx);
  if (scope.status !== 'PASS') {
    return toAssessment(
      {
        outcome:
          scope.status === 'FAIL'
            ? 'LIKELY_NOT_ELIGIBLE'
            : 'INSUFFICIENT_INFORMATION',
      },
      [scope],
      [clBaseAssumption(L)],
      L,
    );
  }
  const location = currentLawApplicationPresence(ctx);
  const sw = onSkilledWorker(ctx.timeline, ctx.simulationDate);
  const hk = onHongKongBno(ctx.timeline, ctx.simulationDate);
  const gt = globalTalentQualifying(ctx);
  const family = onFamilyPartner(ctx.timeline, ctx.simulationDate);
  const familyTen = familyTenYearResidence(ctx);
  const familyFive = familyFiveYearStart(ctx);
  const familyFiling = familyFive ? familyFiveYearFiling(ctx) : undefined;
  const protection = onProtection(ctx.timeline, ctx.simulationDate);
  const ancestry = ukAncestryResidence(ctx);
  const innovator = innovatorFounderResidence(ctx);
  const swFiling = skilledWorkerFiling(ctx);
  const lrResidence = longResidence(ctx);
  const swPartnerResidence = skilledWorkerPartnerResidence(ctx);
  const swChildDate = skilledWorkerChildFiling(ctx)?.applicationDate;
  const presence = applicationPresence(ctx.timeline, ctx.simulationDate, L);
  const privateLife = privateLifeQualifying(ctx);
  // Dependants (contracts §15).
  const hkKind = hongKongBnoDependant(ctx.timeline, ctx.simulationDate);
  const hkDependant = hongKongBnoDependantPathway(ctx);
  const afterMajority =
    hkKind === 'CHILD' && hkDependant?.result.status !== 'PASS'
      ? adultChildResidence(ctx)
      : undefined;
  const hkOwn = afterMajority ?? hongKongBnoResidence(ctx);
  const gtDependant = globalTalentDependantPathway(ctx);
  const familyChild = familyChildPathway(ctx);
  // In scope as a partner or child only with the principal (CL-SCOPE).
  const partner =
    ctx.principal !== undefined &&
    onSkilledWorkerPartner(ctx.timeline, ctx.simulationDate);
  const child =
    ctx.principal !== undefined &&
    onSkilledWorkerChild(ctx.timeline, ctx.simulationDate);
  const runs = (id: string) =>
    id === 'CL-SW-PARTNER-5Y'
      ? partner
      : id === 'CL-SW-CHILD'
        ? child
        : id.startsWith('CL-SW-')
          ? sw
          : id === 'CL-HKBNO-RESIDENCE-5Y'
            ? hkOwn !== undefined
            : id === 'CL-HKBNO-DEPENDANT'
              ? hkDependant !== undefined
              : id === 'CL-GT-DEPENDANT'
                ? gtDependant !== undefined
                : id === 'CL-FAMILY-CHILD'
                  ? familyChild !== undefined
                  : id.startsWith('CL-GT-')
                    ? gt !== undefined
                    : id === 'CL-FAMILY-RESIDENCE'
                      ? family
                      : id === 'CL-FAMILY-RELATIONSHIP'
                        ? familyTen !== undefined || familyFive !== undefined
                        : id === 'CL-FAMILY-FINANCIAL'
                          ? familyFive !== undefined
                          : id.startsWith('CL-PROTECTION-')
                            ? protection
                            : id.startsWith('CL-ANCESTRY-')
                              ? ancestry
                              : id.startsWith('CL-INNOVATOR-')
                                ? innovator
                                : id === 'CL-PRIVATE-LIFE-RESIDENCE'
                                  ? privateLife !== undefined
                                  : true;
  const rules = [
    { ...scope, ...location },
    ...others
      .filter((rule) => runs(rule.meta.id))
      .map((rule) => runRule(rule, ctx)),
  ];
  const pick = (...ids: string[]) =>
    ids.map((id) => rules.find((r) => r.id === id)!);
  const rulesAtFiling = (ids: RuleId[], date: IsoDate) => {
    const filing = {
      ...ctx,
      simulationDate: date,
      timeline: timelineAtFiling(ctx.timeline, date),
    };
    return ids.map((id) =>
      runRule(
        ruleList.find((r) => r.meta.id === id)!,
        filing,
      ),
    );
  };
  // CL-ENGLISH applies the current route's level (none for Skilled Worker
  // before 2027-03-26, B1 for Hong Kong BN(O)); the Long Residence candidate
  // is checked against its own level (LR 13.1).
  const [english, kol] = pick('CL-ENGLISH', 'CL-KOL');
  const lrLanguage = [
    {
      ...english,
      ...settlementEnglish(ctx, ctx.simulationDate, 'LONG_RESIDENCE'),
    },
    { ...kol, ...settlementKol(ctx, ctx.simulationDate, 'LONG_RESIDENCE') },
  ];
  const adultChecks = afterMajority?.applicationDate
    ? rulesAtFiling(['CL-ENGLISH', 'CL-KOL'], afterMajority.applicationDate)
    : undefined;
  // Under CR 1.1(d), residence and English use different dates (UKA 15.1–16.1).
  const historicAncestry =
    ancestry !== undefined && ancestry.referenceDate < ctx.simulationDate;
  const ancestryLanguage = historicAncestry
    ? [
        {
          ...english,
          ...settlementEnglish(ctx, ctx.simulationDate, 'UK_ANCESTRY'),
        },
        { ...kol, ...settlementKol(ctx, ctx.simulationDate, 'UK_ANCESTRY') },
      ]
    : [english, kol];
  const protectionStartDate = protection ? protectionStart(ctx) : undefined;
  const protectionDue =
    protectionStartDate &&
    addYears(protectionStartDate, cl.values.protectionQualifyingYears.value);
  const candidates: Candidate[] = [
    ...(sw
      ? [
          {
            years: cl.values.skilledWorkerQualifyingYears.value,
            start: swFiling?.start,
            applicationDate: swFiling?.applicationDate,
            // Salary checks come from the filing date; English and Life in
            // the UK are rechecked for the projected date below (A6#6).
            rules: [
              ...(swFiling?.requirements?.filter(
                (r) => r.id === 'CL-SW-SALARY' || r.id === 'CL-SW-GOING-RATE',
              ) ?? pick('CL-SW-SALARY', 'CL-SW-GOING-RATE')),
              ...pick('CL-ENGLISH', 'CL-KOL'),
            ],
            residence: 'CL-SW-RESIDENCE-5Y',
          },
        ]
      : []),
    // A main applicant, partner or adult child on their own 5 years (HK 62.1).
    ...(hk || hkKind === 'OWN' || afterMajority?.applicationDate
      ? [
          {
            years: cl.values.hongKongBnoQualifyingYears.value,
            start: hkOwn?.start,
            applicationDate: adultChecks?.some((r) => r.status !== 'PASS')
              ? undefined
              : hkOwn?.applicationDate,
            rules: adultChecks ?? pick('CL-ENGLISH', 'CL-KOL'),
            residence: 'CL-HKBNO-RESIDENCE-5Y',
          },
        ]
      : []),
    ...(
      [
        ['CL-HKBNO-DEPENDANT', hkDependant],
        ['CL-GT-DEPENDANT', gtDependant],
        ['CL-FAMILY-CHILD', familyChild],
      ] as const
    ).flatMap(([id, pathway]) =>
      pathway
        ? [
            {
              years: pathway.years,
              start: pathway.start,
              ...(pathway.applicationDate && {
                applicationDate: pathway.applicationDate,
              }),
              rules: pick(id, 'CL-ENGLISH', 'CL-KOL'),
              // An adult dependant relative also needs their own 5 years.
              ...(hkKind === 'RELATIVE' &&
                id === 'CL-HKBNO-DEPENDANT' && {
                  residence: 'CL-HKBNO-RESIDENCE-5Y',
                }),
            },
          ]
        : [],
    ),
    ...(gt
      ? [
          {
            // Without the endorsement neither the years nor the start are
            // known, and the UNKNOWN CL-GT-RESIDENCE keeps the outcome
            // insufficient (contracts §12.4). With it, the years come from
            // the start like the other residence rules.
            years:
              gt.period?.years ??
              cl.values.globalTalentQualifyingYearsShort.value,
            start: gt.residence?.start,
            applicationDate: gt.residence?.applicationDate,
            rules: gt.period
              ? pick('CL-ENGLISH', 'CL-KOL')
              : pick('CL-GT-RESIDENCE', 'CL-ENGLISH', 'CL-KOL'),
            residence: 'CL-GT-RESIDENCE',
          },
        ]
      : []),
    // The 5-year or 10-year family partner route; otherwise (not provided)
    // the UNKNOWN CL-FAMILY-RESIDENCE, like CL-GT-RESIDENCE.
    ...(familyFive
      ? [
          {
            years: cl.values.familyPartnerQualifyingYearsFive.value,
            start: familyFiling?.start,
            applicationDate: familyFiling?.applicationDate,
            rules: pick(
              'CL-FAMILY-RELATIONSHIP',
              'CL-FAMILY-FINANCIAL',
              'CL-ENGLISH',
              'CL-KOL',
            ),
            residence: 'CL-FAMILY-RESIDENCE',
          },
        ]
      : []),
    ...(familyTen
      ? [
          {
            years: cl.values.familyPartnerQualifyingYearsTen.value,
            start: familyTen.start,
            applicationDate: familyTen.applicationDate,
            rules: pick('CL-FAMILY-RELATIONSHIP', 'CL-ENGLISH', 'CL-KOL'),
            residence: 'CL-FAMILY-RESIDENCE',
          },
        ]
      : family && !familyFive
        ? [
            {
              years: cl.values.familyPartnerQualifyingYearsTen.value,
              rules: pick('CL-FAMILY-RESIDENCE', 'CL-ENGLISH', 'CL-KOL'),
            },
          ]
        : []),
    // Appendix Settlement Protection sets no English or Life in the UK
    // requirement (PD-072).
    ...(protection
      ? [
          {
            years: cl.values.protectionQualifyingYears.value,
            start: protectionStartDate,
            // STP 1.2(c): the filing day must be in the UK, so a declared
            // trip can move the projected date to the return.
            ...(protectionDue && {
              applicationDate: nextKnownApplicationDate(
                ctx.timeline,
                protectionDue > ctx.simulationDate
                  ? protectionDue
                  : ctx.simulationDate,
              ),
            }),
            rules: pick('CL-PROTECTION-STATUS'),
            residence: 'CL-PROTECTION-RESIDENCE-5Y',
          },
        ]
      : []),
    ...(ancestry
      ? [
          {
            years: cl.values.ukAncestryQualifyingYears.value,
            start: ancestry.start,
            applicationDate: ancestry.applicationDate,
            rules: [
              ...ancestryLanguage,
              ...(presence?.status === 'UNKNOWN'
                ? pick('CL-ANCESTRY-RESIDENCE-5Y')
                : []),
            ],
            residence: 'CL-ANCESTRY-RESIDENCE-5Y',
          },
        ]
      : []),
    // No English requirement for a main applicant's settlement (INNF 15–21).
    ...(innovator
      ? [
          {
            years: cl.values.innovatorFounderQualifyingYears.value,
            start: innovator.start,
            applicationDate: innovator.applicationDate,
            rules: pick('CL-INNOVATOR-ENDORSEMENT', 'CL-KOL'),
            residence: 'CL-INNOVATOR-RESIDENCE-3Y',
          },
        ]
      : []),
    // Like Global Talent: without the basis of the permission the UNKNOWN
    // CL-PRIVATE-LIFE-RESIDENCE keeps the outcome insufficient.
    ...(privateLife
      ? [
          {
            years:
              privateLife.period?.years ??
              cl.values.privateLifeQualifyingYearsTen.value,
            start: privateLife.residence?.start,
            applicationDate: privateLife.residence?.applicationDate,
            rules: privateLife.period
              ? pick('CL-ENGLISH', 'CL-KOL')
              : pick('CL-PRIVATE-LIFE-RESIDENCE', 'CL-ENGLISH', 'CL-KOL'),
            residence: 'CL-PRIVATE-LIFE-RESIDENCE',
          },
        ]
      : []),
    ...(partner
      ? [
          {
            years: cl.values.skilledWorkerQualifyingYears.value,
            // Keep the joint date while the principal only has evidence
            // to confirm on that day.
            ...((pick('CL-SW-PARTNER-5Y')[0].status === 'PASS' ||
              pendingOnJointDay(swPartnerResidence).length > 0) && {
              start: swPartnerResidence?.start,
              applicationDate: swPartnerResidence?.applicationDate,
            }),
            rules: pick('CL-SW-PARTNER-5Y', 'CL-ENGLISH', 'CL-KOL'),
          },
        ]
      : []),
    ...(child
      ? [
          {
            years: cl.values.skilledWorkerQualifyingYears.value,
            start:
              swChildDate &&
              addYears(
                swChildDate,
                -cl.values.skilledWorkerQualifyingYears.value,
              ),
            applicationDate: swChildDate,
            rules: pick('CL-SW-CHILD', 'CL-ENGLISH', 'CL-KOL'),
          },
        ]
      : []),
    {
      years: cl.values.longResidenceQualifyingYears.value,
      start: lrResidence?.start,
      applicationDate: lrResidence?.applicationDate,
      rules: [
        ...lrLanguage,
        ...(presence?.status === 'UNKNOWN' ? pick('CL-LR-RESIDENCE-10Y') : []),
      ],
      residence: 'CL-LR-RESIDENCE-10Y',
    },
  ];
  const languageAt = (
    rule: RuleOutcome,
    candidate: Candidate,
    date: IsoDate,
  ) => {
    const override =
      candidate.residence === 'CL-LR-RESIDENCE-10Y'
        ? 'LONG_RESIDENCE'
        : candidate.residence === 'CL-ANCESTRY-RESIDENCE-5Y' && historicAncestry
          ? 'UK_ANCESTRY'
          : undefined;
    if (rule.id === 'CL-ENGLISH') {
      return { ...rule, ...settlementEnglish(ctx, date, override) };
    }
    if (rule.id === 'CL-KOL') {
      return { ...rule, ...settlementKol(ctx, date, override) };
    }
    return rule;
  };
  // An issue with today's filing still allows a forecast on a known future day.
  const filingCandidates = location
    ? candidates.flatMap((candidate) => {
        const date = dueOf(candidate);
        if (!date || date <= ctx.simulationDate) return [];
        let checked = candidate;
        if (!ctx.principal && candidate.residence !== 'CL-SW-RESIDENCE-5Y') {
          // Residence has already checked presence on the filing date. Verify the
          // other rules on its effective grant, preserving today's displayed results.
          const ids = candidate.rules
            .map((r) => r.id)
            .filter((id) => id !== candidate.residence);
          const atFiling = rulesAtFiling(ids, date);
          checked = {
            ...candidate,
            rules:
              candidate.residence === 'CL-LR-RESIDENCE-10Y' ||
              candidate.residence === 'CL-ANCESTRY-RESIDENCE-5Y'
                ? atFiling.map((rule) => languageAt(rule, candidate, date))
                : atFiling,
          };
        } else if (ctx.principal && location.status === 'UNKNOWN') {
          // The joint date was found with the principal. Recheck the
          // dependant's own English and Life in the UK on that date.
          checked = {
            ...candidate,
            rules: candidate.rules.map((rule) =>
              languageAt(rule, candidate, date),
            ),
          };
        }
        return location.status === 'UNKNOWN' && statusOf(checked) !== 'PASS'
          ? []
          : [checked];
      })
    : candidates;
  const decision = decide(filingCandidates, ctx.simulationDate, (candidate) => {
    const date = dueOf(candidate)!;
    return (
      date > ctx.simulationDate &&
      candidate.rules.every(
        (rule) =>
          rule.status !== 'FAIL' ||
          languageAt(rule, candidate, date).status !== 'FAIL',
      )
    );
  });
  // Today's location can be unknown even when a later filing is supported.
  // Keep that date and its route for simultaneous dependant applications.
  if (location?.status === 'UNKNOWN')
    decision.outcome = 'INSUFFICIENT_INFORMATION';
  const shown =
    (partner || child) &&
    decision.pathwayYears === cl.values.skilledWorkerQualifyingYears.value
      ? showProjected(
          rules,
          partner ? 'CL-SW-PARTNER-5Y' : 'CL-SW-CHILD',
          decision,
          L(
            `截至 ${ctx.simulationDate} 尚未满期。`,
            ` Not yet completed by ${ctx.simulationDate}.`,
          ),
        )
      : rules;
  const assumptions = [
    clBaseAssumption(L),
    L(
      `适用 Appendix Continuous Residence 的路线可在合格居留期满前最多 ${cl.values.continuousResidenceReferenceDays.value} 天递交（CR 1.1(b)）。估算使用已申报的许可。申请日超出最后一段已录入许可时，假设合格许可连续续接，亦假设递交时满足其余条件。问卷没有决定日供计算。`,
      `For routes under Appendix Continuous Residence, you can apply up to ${cl.values.continuousResidenceReferenceDays.value} days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.`,
    ),
  ];
  for (const rule of adultChecks ?? []) {
    if (rule.status !== 'PASS')
      assumptions.push(
        L(
          `按成年后的候选日 ${afterMajority!.applicationDate} 核对：${rule.explanation}`,
          `On the prospective adult filing date of ${afterMajority!.applicationDate}: ${rule.explanation}`,
        ),
      );
  }
  if (lrLanguage[0].status !== english.status) {
    assumptions.push(
      L(
        `Long Residence 10 年路径按 LR 13.1 单独判断：${lrLanguage[0].explanation}`,
        `The 10-year Long Residence pathway is checked separately under LR 13.1. ${lrLanguage[0].explanation}`,
      ),
    );
  }
  // A completed historic UK Ancestry period held back by its own English or
  // Life in the UK requirement (UKA 15.1–16.1).
  if (
    historicAncestry &&
    ancestry?.applicationDate &&
    !decision.decidedBy?.includes('CL-ANCESTRY-RESIDENCE-5Y')
  ) {
    // Checked on the filing date, which can follow a return to the UK.
    const filingDate = ancestry.applicationDate;
    const atFiling = [
      { ...english, ...settlementEnglish(ctx, filingDate, 'UK_ANCESTRY') },
      { ...kol, ...settlementKol(ctx, filingDate, 'UK_ANCESTRY') },
    ];
    for (const rule of atFiling.filter((r) => r.status !== 'PASS'))
      assumptions.push(
        L(
          `按此前的 UK Ancestry 许可定居时：${rule.explanation}`,
          `For settlement on the previous UK Ancestry permission: ${rule.explanation}`,
        ),
      );
  }
  let selectedRules = shown;
  const projected = decision.projectedCandidate;
  const date = decision.earliestDate;
  if (projected && date) {
    const projectedRules = projected.rules.map((rule) =>
      languageAt(rule, projected, date),
    );
    for (const rule of projectedRules.filter((r) => r.status !== 'PASS')) {
      assumptions.push(
        L(
          `预计申请日 ${date} 仍待满足或确认：${rule.explanation}`,
          `Still to be met or confirmed for the projected application on ${date}. ${rule.explanation}`,
        ),
      );
    }
    selectedRules = shown.map((rule) => {
      if (rule.id !== 'CL-ENGLISH' && rule.id !== 'CL-KOL') return rule;
      const projectedRule = projectedRules.find((r) => r.id === rule.id);
      if (!projectedRule) return rule;
      return {
        ...projectedRule,
        explanation: L(
          `按预计申请日 ${date} 判断：${projectedRule.explanation}`,
          `Assessed for the projected application on ${date}. ${projectedRule.explanation}`,
        ),
      };
    });
  } else if (decision.decidedBy?.includes('CL-ANCESTRY-RESIDENCE-5Y')) {
    selectedRules = shown.map(
      (rule) => ancestryLanguage.find((r) => r.id === rule.id) ?? rule,
    );
  } else if (decision.decidedBy?.includes('CL-LR-RESIDENCE-10Y')) {
    selectedRules = shown.map(
      (rule) => lrLanguage.find((r) => r.id === rule.id) ?? rule,
    );
  }
  const displayed = location
    ? selectedRules.map((rule) => {
        const affected =
          rule.id !== 'CL-LR-RESIDENCE-10Y' &&
          (candidates.some((c) => c.residence === rule.id) ||
            [
              'CL-SW-PARTNER-5Y',
              'CL-SW-CHILD',
              'CL-HKBNO-DEPENDANT',
              'CL-GT-DEPENDANT',
              'CL-FAMILY-CHILD',
            ].includes(rule.id));
        if (!affected) return rule;
        return {
          ...rule,
          ...location,
          sources: [...rule.sources, ...location.sources],
          pendingDetails: undefined,
        };
      })
    : selectedRules;
  return toAssessment(decision, displayed, assumptions, L);
}

/** Assesses `rules` the way rule sets of this `kind` are aggregated (contracts §13.2). */
export function assess(
  kind: RuleSet['kind'],
  rules: Rule[],
  ctx: RuleContext,
): SettlementAssessment {
  return kind === 'ANNOUNCED'
    ? assessEarnedSettlement(ctx, rules)
    : assessCurrentLaw(ctx, rules);
}
