import { PARAMETERS, RULE_SET_IDS } from '@uk-immigration/policy-data';
import type { RuleSetId } from '@uk-immigration/policy-data';
import { assess } from './aggregate';
import { adultIllegalEntry } from './rules/es-requirements';
import { episodeOn } from './residence';
import {
  esCurrentGroup,
  esRouteOn,
  legacyUkrsArrival,
  outsideFrameworkRequirementsText,
} from './rules/es-residence';
import { textFor } from './rule';
import { RULES } from './rules';
import { hasSettledSkilledWorkerPartner } from './rules/current-law/shared';
import type {
  RuleContext,
  RuleSet,
  RuleSetRegistry,
  SimulationRequest,
  SimulationResult,
} from './types';

export const RULE_SETS: Record<RuleSetId, RuleSet> = {
  'current-law-2026-11': {
    id: 'current-law-2026-11',
    kind: 'LAW',
    status: 'CURRENT_LAW',
    sources: [{ srcId: 'SRC-004', locator: 'Appendix Skilled Worker' }],
  },
  'earned-settlement-2026-11': {
    id: 'earned-settlement-2026-11',
    kind: 'ANNOUNCED',
    status: 'ANNOUNCED_NOT_IN_FORCE',
    sources: [{ srcId: 'SRC-001', locator: 'p46' }],
  },
};

type ShortCircuit = NonNullable<SimulationResult['shortCircuit']>;

/** The latest `asOf` of these rule sets' parameter files, skipping any without one. */
const latestAsOf = (ids: readonly RuleSetId[]) =>
  ids
    .flatMap((id) => PARAMETERS[id]?.asOf ?? [])
    .sort()
    .at(-1);

function shortCircuitOf(ctx: RuleContext): ShortCircuit | undefined {
  const { timeline, simulationDate } = ctx;
  const L = textFor(ctx);
  if (timeline.criminalRecord.length > 0) {
    return {
      reason: 'CRIMINALITY',
      message: L(
        '申报了犯罪记录。Earned Settlement 公布的一般标准是：英国境内的成年犯罪记录会导致拒绝；海外定罪须核对有关行为在英国是否也构成犯罪，法律体系有差异时保留酌情处理。未成年时的犯罪也按个案酌情处理（SRC-001 p12、PD-017）。现行规则按 Part Suitability 的具体情形判断，请咨询受监管的移民顾问。',
        'A criminal record has been declared. Under the announced general Earned Settlement standard, an adult criminal record in the UK leads to refusal. Overseas convictions depend on whether the conduct is also an offence in the UK, with discretion for differences between legal systems. Offences committed as a minor can also be considered on a discretionary basis (SRC-001 p12, PD-017). Under the current rules, the outcome depends on the circumstances under Part Suitability. Please seek advice from a regulated immigration adviser.',
      ),
    };
  }
  const group = esCurrentGroup(timeline, simulationDate);
  // On a protection route illegal entry adds 10 years (Table 2, p48) and is
  // assessed; elsewhere its consequence is inconsistent (PD-044). Legacy Safe
  // and Legal Routes are protection routes under current law: they fall
  // through to OUTSIDE_FRAMEWORK, which stops only Earned Settlement (§16.3).
  if (
    adultIllegalEntry(timeline) &&
    group !== 'PROTECTION' &&
    esRouteOn(timeline, simulationDate) !== 'LEGACY_SAFE_AND_LEGAL'
  ) {
    return {
      reason: 'IMMIGRATION_BREACH',
      message: L(
        '申报了成年后的非法入境。Earned Settlement 对非法入境的后果前后说法不一（20 年路径或额外加 10 年，PD-044），现行规则下也可能涉及拒绝理由；本工具不作结论，请咨询受监管的移民顾问。',
        'Illegal entry as an adult has been declared. Earned Settlement is inconsistent about its consequences (the 20-year pathway, or an extra 10 years; PD-044), and under the current rules it may also be a ground for refusal. This tool does not reach a conclusion: please seek advice from a regulated immigration adviser.',
      ),
    };
  }
  // Chapter 7 and Table 2 do not cover refugees' dependants (PD-067).
  if (
    group === 'PROTECTION' &&
    episodeOn(timeline, simulationDate)?.role === 'DEPENDANT'
  ) {
    return {
      reason: 'PROTECTION',
      message: L(
        '当前以 dependant 身份持保护类路线许可。Earned Settlement 的难民定居路径（SRC-001 Chapter 7、Table 2）没有说明难民的 dependant 如何定居（PD-067），本工具不作结论，请咨询受监管的移民顾问。',
        'The current permission is on a protection route as a dependant. The Earned Settlement refugee pathways (SRC-001 Chapter 7, Table 2) do not say how refugees’ dependants settle (PD-067). This tool does not reach a conclusion: please seek advice from a regulated immigration adviser.',
      ),
    };
  }
  if (group === 'OUTSIDE_FRAMEWORK') {
    return {
      reason: 'OUTSIDE_FRAMEWORK',
      // A UK Resettlement Scheme arrival before 2027-04-06 is Legacy Safe and
      // Legal; its English level is inconsistent (PD-045).
      message: legacyUkrsArrival(timeline, simulationDate)
        ? L(
            '当前路线属 Legacy Safe and Legal Routes（2027-04-06 前经 UK Resettlement Scheme 抵达），不在 Earned Settlement 框架内，继续按该群体现有的定居安排（SRC-001 p25–p26）；强化的犯罪记录要求仍适用。英语等级原文不一致：框架外群体一般须 B2（p25–p26），第 7 章又说 UK Resettlement Scheme 难民只需 A2（p37、p39），见 PD-045。',
            'The current route is a Legacy Safe and Legal Route (arrival through the UK Resettlement Scheme before 2027-04-06), outside the Earned Settlement framework, and keeps the existing settlement arrangements for that group (SRC-001 p25–p26). The strengthened criminality requirements still apply. The English level is inconsistent: groups outside the framework generally need B2 (p25–p26), while Chapter 7 says UK Resettlement Scheme refugees only need A2 (p37, p39); see PD-045.',
          )
        : L(
            '当前路线不在 Earned Settlement 框架内，继续按该群体现有的定居安排（SRC-001 p25–p26）。',
            'The current route is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group (SRC-001 p25–p26). ',
          ) +
          outsideFrameworkRequirementsText(
            esRouteOn(timeline, simulationDate),
            L,
          ),
    };
  }
  return undefined;
}

/** `registry` defaults to the production rule sets; tests pass their own (contracts §13.3). */
export function evaluate(
  request: SimulationRequest,
  registry: RuleSetRegistry = { ruleSets: RULE_SETS, rules: RULES },
): SimulationResult {
  const ids =
    request.ruleSetIds ?? (Object.keys(registry.ruleSets) as RuleSetId[]);
  const { timeline, simulationDate, principal, locale } = request;
  const ctx: RuleContext = {
    timeline,
    simulationDate,
    locale,
    // The principal is assessed as a main applicant: their own principal, if
    // any, is not followed.
    ...(principal &&
      episodeOn(timeline, simulationDate)?.role === 'DEPENDANT' && {
        principal: {
          timeline: principal,
          result: evaluate(
            {
              timeline: principal,
              simulationDate,
              ruleSetIds: ids,
              locale,
            },
            registry,
          ),
        },
      }),
  };
  // The dependant's own short circuit first, then the principal's.
  const ownRisk = shortCircuitOf(ctx);
  const fromPrincipal = ctx.principal?.result.shortCircuit;
  const assessPartnerIndependently =
    (fromPrincipal?.reason === 'CRIMINALITY' ||
      fromPrincipal?.reason === 'IMMIGRATION_BREACH') &&
    ctx.principal &&
    hasSettledSkilledWorkerPartner(
      timeline,
      ctx.principal.timeline,
      simulationDate,
    );
  const shortCircuit =
    ownRisk ??
    (fromPrincipal && {
      ...fromPrincipal,
      message: assessPartnerIndependently
        ? textFor(ctx)(
            '主申请人的筛查需要专业复核。现行 Skilled Worker 伴侣定居按伴侣本人评估（SW 38.1、39.1(b)）。',
            'The principal applicant’s screening requires regulated review. Current Skilled Worker partner settlement is assessed on the partner’s own circumstances (SW 38.1 and 39.1(b)).',
          )
        : textFor(ctx)(
            `主申请人：${fromPrincipal.message}`,
            `Principal applicant: ${fromPrincipal.message}`,
          ),
    });
  const byRuleSet: SimulationResult['byRuleSet'] = {};
  for (const id of ids) {
    const { kind } = registry.ruleSets[id];
    // Protection dependants and outside-framework routes only stop the Earned
    // Settlement (announced) columns; current law is still assessed.
    const stopped =
      shortCircuit &&
      (kind === 'ANNOUNCED' ||
        ((!assessPartnerIndependently || ownRisk) &&
          (shortCircuit.reason === 'CRIMINALITY' ||
            shortCircuit.reason === 'IMMIGRATION_BREACH')));
    const assessment = assess(kind, registry.rules[id], ctx);
    if (stopped) {
      delete assessment.pathwayYears;
      delete assessment.earliestDate;
      delete assessment.pathwayCompletionDate;
      delete assessment.publicFundsReassessmentDate;
      delete assessment.shorterPathwaysNotUsed;
      delete assessment.decidedBy;
      assessment.outcome = 'REQUIRES_REGULATED_REVIEW';
    }
    byRuleSet[id] = assessment;
  }
  return {
    // Synthetic rule sets in tests have no parameter file; with no file at
    // all, every parameter file counts (contracts §16.4).
    policyAsOf: latestAsOf(ids) ?? latestAsOf(RULE_SET_IDS)!,
    byRuleSet,
    ...(shortCircuit && { shortCircuit }),
  };
}
