import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { episodeOn, currentResidence, settledBy } from '../../residence';
import { defineRule, textFor } from '../../rule';
import type { ImmigrationEpisode, IsoDate, RuleContext } from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  globalTalentDependant,
  onGlobalTalent,
} from './shared';
import {
  countsForSkilledWorker,
  principalApplicationDate,
} from './skilled-worker';
import {
  DependantPathway,
  childFiling,
  jointApplication,
  noJointApplication,
  needsPrincipal,
  notYetSettledAssumption,
  principalNotReady,
} from './dependants';

/** GT 11.1–11.2: the qualifying period and the paragraph that sets it. */
function globalTalentPeriod(
  e: ImmigrationEpisode,
): { years: number; basis: string } | undefined {
  const short = cl.values.globalTalentQualifyingYearsShort.value;
  const long = cl.values.globalTalentQualifyingYearsLong.value;
  switch (e.globalTalentEndorsement) {
    case 'RESEARCH_BODY':
      return { years: short, basis: 'GT 11.1(a)' };
    case 'PRIZE':
      return { years: short, basis: 'GT 11.1(c)' };
    case 'ARTS_COUNCIL_ENGLAND':
    case 'TECH_NATION':
      return e.globalTalentCriteria === 'EXCEPTIONAL_TALENT'
        ? { years: short, basis: 'GT 11.1(b)' }
        : e.globalTalentCriteria === 'EXCEPTIONAL_PROMISE'
          ? { years: long, basis: 'GT 11.2' }
          : undefined;
    default:
      return undefined;
  }
}

/**
 * The Global Talent qualifying period, while a main applicant on that route:
 * years from the endorsement (undefined if not provided), and the start of the
 * continuous GT 11.3 period (the same routes as SW 21.2) ending on the
 * simulation date (GT 12.1, CR 3.1).
 */
export function globalTalentQualifying(
  { timeline, simulationDate }: RuleContext,
  notBefore?: IsoDate,
) {
  if (!onGlobalTalent(timeline, simulationDate)) return undefined;
  const current = episodeOn(timeline, simulationDate)!;
  const initial = timeline.episodes
    .filter(
      (e) =>
        e.route === 'GLOBAL_TALENT' &&
        e.role === 'MAIN' &&
        e.validFrom <= simulationDate,
    )
    .sort((a, b) => a.validFrom.localeCompare(b.validFrom))[0];
  // GT 11.1(c) looks at the initial grant. A later episode can also
  // report the initial basis if the earlier episode has no declaration.
  const basis =
    initial?.globalTalentEndorsement &&
    (initial.globalTalentEndorsement === 'PRIZE' ||
      current.globalTalentEndorsement === 'PRIZE')
      ? initial
      : current;
  const period = globalTalentPeriod(basis);
  return {
    period,
    endorsement: basis.globalTalentEndorsement,
    residence:
      period &&
      currentResidence(
        timeline,
        simulationDate,
        countsForSkilledWorker,
        period.years,
        {
          appliesOn: (e) => e.route === 'GLOBAL_TALENT' && e.role === 'MAIN',
          notBefore,
        },
      ),
  };
}

export const clGtResidence = defineRule(
  {
    id: 'CL-GT-RESIDENCE',
    ruleSetId: RULE_SET,
    title: 'Global Talent 连续 3 年或 5 年',
    titleEn: `Global Talent: ${cl.values.globalTalentQualifyingYearsShort.value} or ${cl.values.globalTalentQualifyingYearsLong.value} continuous years`,
    sources: [
      { srcId: 'SRC-021', locator: 'GT 11.1' },
      { srcId: 'SRC-021', locator: 'GT 11.2' },
      { srcId: 'SRC-021', locator: 'GT 11.3' },
      { srcId: 'SRC-021', locator: 'GT 12.1' },
      ...crResidenceSources,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const q = globalTalentQualifying(ctx);
    if (!q) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Global Talent 主申请人许可。',
          'Current permission is not as a Global Talent main applicant.',
        ),
      };
    }
    const assumptions = [
      L(
        '连续期合并 GT 11.3 列出的 Global Talent、Innovator Founder、Skilled Worker、T2 Minister of Religion、International Sportsperson、Scale-up 主申请人许可；Tier 1 与 Representative of an Overseas Business 本工具无法填写，不计入。',
        'The continuous period combines main applicant permission on the routes listed in GT 11.3: Global Talent, Innovator Founder, Skilled Worker, T2 Minister of Religion, International Sportsperson and Scale-up. Tier 1 and Representative of an Overseas Business cannot be entered in this tool and are not counted.',
      ),
      L(
        '按背书未被撤回（GT 10.1）、上一段许可期间在背书或奖项领域有收入（GT 10.2）处理，本工具未核对。',
        'The endorsement is taken as not withdrawn (GT 10.1) and the applicant as having earned money in the field of their endorsement or prize during their last permission (GT 10.2); this tool does not check these.',
      ),
      ...(ctx.timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    const { residence, period, endorsement: body } = q;
    if (!period) {
      return {
        status: 'UNKNOWN',
        explanation:
          body === 'ARTS_COUNCIL_ENGLAND' || body === 'TECH_NATION'
            ? L(
                `未填写 ${body === 'TECH_NATION' ? 'Tech Nation' : 'Arts Council England'} 的背书是 exceptional talent 还是 exceptional promise：前者 ${cl.values.globalTalentQualifyingYearsShort.value} 年（GT 11.1(b)），后者 ${cl.values.globalTalentQualifyingYearsLong.value} 年（GT 11.2）。`,
                `Not provided whether the ${body === 'TECH_NATION' ? 'Tech Nation' : 'Arts Council England'} endorsement was under the exceptional talent or the exceptional promise criteria: ${cl.values.globalTalentQualifyingYearsShort.value} years for the former (GT 11.1(b)), ${cl.values.globalTalentQualifyingYearsLong.value} for the latter (GT 11.2).`,
              )
            : L(
                `未填写首次 Global Talent 许可依据的背书或奖项。GT 11.1–11.2 按背书方规定 ${cl.values.globalTalentQualifyingYearsShort.value} 年或 ${cl.values.globalTalentQualifyingYearsLong.value} 年：Royal Society、British Academy、Royal Academy of Engineering、UKRI、Arts Council England、Tech Nation，或 Appendix Global Talent: Prestigious Prizes 所列奖项。`,
                `Not provided which endorsement or prize the initial Global Talent permission relied on. GT 11.1–11.2 set ${cl.values.globalTalentQualifyingYearsShort.value} or ${cl.values.globalTalentQualifyingYearsLong.value} years by who endorsed it: the Royal Society, British Academy, Royal Academy of Engineering, UKRI, Arts Council England, Tech Nation, or a prize in Appendix Global Talent: Prestigious Prizes.`,
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
            `按 ${basis} 合格期 ${years} 年；自 ${start} 起连续持可计入的许可（GT 11.3），${residenceCompleted(residence!, ctx.simulationDate, years, L)}。`,
            `${years}-year qualifying period under ${basis}; continuous qualifying permission (GT 11.3) since ${start}: ${residenceCompleted(residence!, ctx.simulationDate, years, L)}.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `按 ${basis} 合格期 ${years} 年；自 ${start} 起连续持可计入的许可（GT 11.3），${residencePending(residence!, years, L)}。`,
            `${years}-year qualifying period under ${basis}; continuous qualifying permission (GT 11.3) since ${start}: ${residencePending(residence!, years, L)}.`,
          ),
          assumptions,
        };
  },
);

/** GT 27.1, GT 29A.1, GT 30.1: a dependent partner or child. */
export function globalTalentDependantPathway(
  ctx: RuleContext,
): DependantPathway | undefined {
  const { timeline, simulationDate, principal } = ctx;
  const kind = globalTalentDependant(timeline, simulationDate);
  if (!kind) return undefined;
  const L = textFor(ctx);
  const partnerYears = cl.values.globalTalentPartnerQualifyingYears.value;
  const settled = principal && settledBy(principal.timeline, simulationDate);
  const assumptions = [
    kind === 'PARTNER'
      ? L(
          '只计连续的 Global Talent dependant 许可，假设整段都是同一主申请人的 dependent partner；Appendix Relationship with Partner（GT 27.4）未核对。',
          'Only continuous Global Talent dependant permission is counted, assuming all of it was as the same principal applicant’s dependent partner; Appendix Relationship with Partner (GT 27.4) is not checked.',
        )
      : L(
          '子女的关系要求（GT 27.3，CHI 4.1–4.3，含另一位父母须同时获批、已定居或为英国公民）、年龄与不独立生活（CHI 1.1–1.2、CHI 1A.1）、照护安排（CHI 2.1）按满足处理（GT 29A.1）；在英国出生的子女（GT 27.2(b)）未建模。',
          'The child’s relationship requirement (GT 27.3, CHI 4.1–4.3, including that the other parent is granted settlement at the same time, is settled or is a British citizen), age and not leading an independent life (CHI 1.1–1.2, CHI 1A.1) and care arrangements (CHI 2.1) are assumed to be met (GT 29A.1); children born in the UK (GT 27.2(b)) are not modelled.',
        ),
    ...(settled ? [] : [notYetSettledAssumption(L)]),
    ...(timeline.absences.length > 0 && kind === 'PARTNER'
      ? [absenceAssumption(L)]
      : []),
  ];
  if (!principal) {
    return { years: partnerYears, result: needsPrincipal(L, assumptions) };
  }
  const partnerFrom = (notBefore?: IsoDate) =>
    currentResidence(
      timeline,
      simulationDate,
      (e) => e.route === 'GLOBAL_TALENT' && e.role === 'DEPENDANT',
      partnerYears,
      {
        appliesOn: (e) =>
          e.route === 'GLOBAL_TALENT' &&
          e.role === 'DEPENDANT' &&
          e.dependantOf === 'PARTNER',
        notBefore,
      },
    );
  const own = kind === 'PARTNER' ? partnerFrom() : undefined;
  assumptions.push(...residenceAssumptions(timeline, simulationDate, own, L));
  const who = kind === 'PARTNER' ? 'partner' : 'child';
  if (settled) {
    const then = episodeOn(timeline, settled.date);
    const met =
      settled.route === 'GLOBAL_TALENT' &&
      then?.route === 'GLOBAL_TALENT' &&
      then.role === 'DEPENDANT' &&
      then.dependantOf === kind;
    if (!met) {
      return {
        years: partnerYears,
        result: {
          status: 'FAIL',
          explanation: L(
            `主申请人 ${settled.date} 定居时须持 Global Talent 许可、且本人当时持其 dependent ${who} 许可（GT 27.1(b)）；不满足。`,
            `When the principal applicant settled on ${settled.date}, they must have held Global Talent permission and this person their dependent ${who} permission (GT 27.1(b)); this is not met.`,
          ),
          assumptions,
        },
      };
    }
    if (kind === 'PARTNER') {
      if (!own?.applicationDate) {
        return {
          years: partnerYears,
          result: {
            status: 'FAIL',
            explanation: residencePending(own!, partnerYears, L),
            assumptions,
          },
        };
      }
      return {
        years: partnerYears,
        start: own?.start,
        applicationDate: own?.applicationDate,
        result: {
          status: 'PASS',
          explanation: L(
            `主申请人已于 ${settled.date} 以 Global Talent 定居，当时本人持其 dependent partner 许可（GT 27.1(b)）；本人须连续满 ${partnerYears} 年（GT 30.1），${own!.applicationDate} 起可申请。`,
            `The principal applicant settled as a Global Talent on ${settled.date}, when this person held their dependent partner permission (GT 27.1(b)); they need ${partnerYears} continuous years of their own (GT 30.1), so they can apply from ${own!.applicationDate}.`,
          ),
          assumptions,
        },
      };
    }
    return {
      years: 0,
      applicationDate: simulationDate,
      result: {
        status: 'PASS',
        explanation: L(
          `主申请人已于 ${settled.date} 以 Global Talent 定居，当时本人持其 dependent child 许可（GT 27.1(b)(i)），可申请定居；子女本人没有居留年限要求。`,
          `The principal applicant settled as a Global Talent on ${settled.date}, when this person held their dependent child permission (GT 27.1(b)(i)), so they can apply for settlement; the child has no residence requirement of their own.`,
        ),
        assumptions,
      },
    };
  }
  const q = globalTalentQualifying({
    timeline: principal.timeline,
    simulationDate,
  });
  const period = q?.period;
  const due = principalApplicationDate(ctx, 'CL-GT-RESIDENCE');
  if (!q || !period || !due) {
    return {
      years: period?.years ?? partnerYears,
      result: principalNotReady(
        ctx,
        q !== undefined,
        'Global Talent',
        assumptions,
      ),
    };
  }
  const joint = jointApplication(
    due,
    (notBefore) =>
      kind === 'PARTNER'
        ? partnerFrom(notBefore)
        : childFiling(timeline, notBefore, 'GLOBAL_TALENT'),
    (notBefore) =>
      globalTalentQualifying(
        { timeline: principal.timeline, simulationDate },
        notBefore,
      )?.residence,
  );
  if (!joint?.applicationDate) {
    return {
      years: kind === 'PARTNER' ? partnerYears : period.years,
      result: noJointApplication(L, assumptions),
    };
  }
  const { applicationDate } = joint;
  if (kind === 'PARENT') {
    return {
      years: period.years,
      start: q.residence?.start,
      applicationDate,
      result: {
        status: 'PASS',
        explanation: L(
          `随主申请人定居：主申请人可于 ${applicationDate} 申请（${period.basis}），届时可一同申请（GT 27.1(a)）；子女本人没有居留年限要求。`,
          `Settling with the principal applicant, who can apply on ${applicationDate} (${period.basis}), when they can apply together (GT 27.1(a)); the child has no residence requirement of their own.`,
        ),
        assumptions,
      },
    };
  }
  return {
    years: partnerYears,
    start: joint.start,
    applicationDate,
    result: {
      status: 'PASS',
      explanation: L(
        `与主申请人同时获批（GT 27.1(a)）：主申请人与本人最早可于 ${applicationDate} 一同申请，本人的 dependent partner 许可须连续满 ${partnerYears} 年（GT 30.1）。`,
        `Settling at the same time as the principal applicant (GT 27.1(a)): the earliest joint application date is ${applicationDate}, when this person also meets the ${partnerYears}-year requirement for dependent partners (GT 30.1).`,
      ),
      assumptions,
    },
  };
}

export const clGtDependant = defineRule(
  {
    id: 'CL-GT-DEPENDANT',
    ruleSetId: RULE_SET,
    title: 'Global Talent dependent partner / child 随主申请人定居',
    titleEn:
      'Global Talent dependent partner or child settling with the principal applicant',
    sources: [
      { srcId: 'SRC-021', locator: 'GT 27.1' },
      { srcId: 'SRC-021', locator: 'GT 27.2' },
      { srcId: 'SRC-021', locator: 'GT 27.3' },
      { srcId: 'SRC-021', locator: 'GT 27.4' },
      { srcId: 'SRC-021', locator: 'GT 29A.1' },
      { srcId: 'SRC-021', locator: 'GT 30.1' },
      { srcId: 'SRC-021', locator: 'GT 31.1' },
      { srcId: 'SRC-018', locator: 'CHI 1.1' },
      { srcId: 'SRC-018', locator: 'CHI 1A.1' },
      { srcId: 'SRC-018', locator: 'CHI 2.1' },
      ...crResidenceSources,
    ],
    pendingDetails: [],
  },
  (ctx) =>
    globalTalentDependantPathway(ctx)?.result ?? {
      status: 'FAIL',
      explanation: textFor(ctx)(
        '当前不是 Global Talent 的 dependent partner 或 dependent child 许可。',
        'Current permission is not as a Global Talent dependent partner or dependent child.',
      ),
    },
);
