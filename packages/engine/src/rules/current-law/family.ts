import {
  currentLaw2026_11 as cl,
  routeNames,
} from '@uk-immigration/policy-data';
import {
  addDays,
  addYears,
  fullYears,
  fullYearsEn,
  taxYearsBefore,
} from '../../dates';
import {
  continuousRun,
  episodeOn,
  currentResidence,
  settledBy,
} from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, nameIn, textFor } from '../../rule';
import type { Lang } from '../../rule';
import { gbp } from '../es-contribution';
import type { Route } from '@uk-immigration/policy-data';
import type {
  ImmigrationEpisode,
  IsoDate,
  PersonTimeline,
  RuleContext,
  RuleResult,
} from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  minorOn,
  onFamilyChild,
  onFamilyPartner,
  onFamilyPartnerFiveYear,
  onFamilyPartnerTenYear,
} from './shared';
import { principalApplicationDate } from './skilled-worker';
import {
  DependantPathway,
  jointApplication,
  noJointApplication,
  needsPrincipal,
  notYetSettledAssumption,
  principalNotReady,
} from './dependants';

// SETF 3.1(a)–(d): Appendix FM partner, parent or child permission and the
// private life route, in any combination. Leave Outside the Rules on Article 8
// grounds (SETF 3.1(e)) cannot be told apart from other such leave.
export const countsForFamilyTenYear = (e: ImmigrationEpisode) =>
  e.route === 'FAMILY_PARTNER_OR_PARENT' ||
  e.route === 'FAMILY_AND_PRIVATE_LIFE';

/** CR 3.6: exclude historic days only after a qualifying further grant. */
function familyTenYearCountedTrips(timeline: PersonTimeline, date: IsoDate) {
  const cutoff = cl.values.familyLifeHistoricAbsencesBefore.value;
  return timeline.absences.flatMap((trip) => {
    const laterGrant =
      trip.from &&
      trip.to &&
      trip.from < cutoff &&
      timeline.episodes.some(
        (e) =>
          e.route === 'FAMILY_PARTNER_OR_PARENT' &&
          e.role === 'MAIN' &&
          e.familyPermission !== undefined &&
          trip.from < e.validFrom &&
          trip.to <= e.validFrom &&
          e.validFrom <= date,
      );
    return !laterGrant
      ? [trip]
      : trip.to <= cutoff
        ? []
        : [{ ...trip, from: addDays(cutoff, -1) }];
  });
}

/**
 * Start of the continuous SETF 3.1 period ending on the simulation date, while
 * an Appendix FM partner on the 10-year route; `before` is the adjoining
 * earlier permission that does not count, if any (SETF 3.2, PD-069).
 */
export function familyTenYearResidence(
  { timeline, simulationDate }: RuleContext,
  notBefore?: IsoDate,
): CurrentResidence | undefined {
  if (!onFamilyPartnerTenYear(timeline, simulationDate)) return undefined;
  return currentResidence(
    timeline,
    simulationDate,
    countsForFamilyTenYear,
    cl.values.familyPartnerQualifyingYearsTen.value,
    {
      appliesOn: (e) =>
        e.route === 'FAMILY_PARTNER_OR_PARENT' &&
        e.role === 'MAIN' &&
        e.familyPermission === 'PARTNER_TEN_YEAR',
      notBefore,
      countedTrips: familyTenYearCountedTrips(timeline, simulationDate),
    },
  );
}

/**
 * Start of the continuous Appendix FM partner permission (E-ILRP.1.3(1))
 * ending on the simulation date, while on the 5-year route. Appendix FM does
 * not refer to Appendix Continuous Residence, so absences do not restart it
 * (PD-070).
 */
export function familyFiveYearStart({
  timeline,
  simulationDate,
}: RuleContext): IsoDate | undefined {
  if (!onFamilyPartnerFiveYear(timeline, simulationDate)) return undefined;
  return continuousRun(
    timeline,
    simulationDate,
    (e) => e.route === 'FAMILY_PARTNER_OR_PARENT' && e.role === 'MAIN',
  ).episodes[0].validFrom;
}

export const clFamilyResidence = defineRule(
  {
    id: 'CL-FAMILY-RESIDENCE',
    ruleSetId: RULE_SET,
    title: '家庭伴侣路线的连续居留',
    titleEn: 'Continuous residence on the family partner route',
    sources: [
      { srcId: 'SRC-022', locator: 'SETF 3.1' },
      { srcId: 'SRC-022', locator: 'SETF 3.2' },
      { srcId: 'SRC-022', locator: 'SETF 4.1' },
      { srcId: 'SRC-024', locator: 'E-ILRP.1.3' },
      { srcId: 'SRC-024', locator: 'E-ILRP.1.4' },
      ...crResidenceSources,
      { srcId: 'SRC-008', locator: 'CR 3.6' },
    ],
    pendingDetails: ['PD-069', 'PD-070'],
  },
  (ctx) => {
    const L = textFor(ctx);
    const { timeline, simulationDate } = ctx;
    if (!onFamilyPartner(timeline, simulationDate)) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Appendix FM 的伴侣许可。',
          'Current permission is not as a partner under Appendix FM.',
        ),
      };
    }
    const fiveYearStart = familyFiveYearStart(ctx);
    if (fiveYearStart) {
      const years = cl.values.familyPartnerQualifyingYearsFive.value;
      const due = addYears(fiveYearStart, years);
      const assumptions = [
        L(
          'E-ILRP.1.3 只计 5 年路线的伴侣许可（D-ECP.1.1 / D-LTRP.1.1），不计 fiancé(e) 期间；各段按同属 5 年路线、同一伴侣（E-ILRP.1.4）计算。',
          'E-ILRP.1.3 counts only partner permission on the 5-year route (D-ECP.1.1 / D-LTRP.1.1), not time as a fiancé(e); each period is taken to be on the 5-year route with the same partner (E-ILRP.1.4).',
        ),
        ...(timeline.absences.length > 0
          ? [
              L(
                'Appendix FM 未引用 Appendix Continuous Residence，也没有规定多长的缺席会中断 E-ILRP.1.3 的连续居住；本工具不因缺席重新起算（PD-070）。',
                'Appendix FM does not refer to Appendix Continuous Residence and does not say what absence breaks the continuous residence in E-ILRP.1.3; this tool does not restart the period for absences (PD-070).',
              ),
            ]
          : []),
      ];
      return due <= simulationDate
        ? {
            status: 'PASS',
            explanation: L(
              `5 年伴侣路线：自 ${fiveYearStart} 起连续持伴侣许可，已满 ${years} 年（E-ILRP.1.3）。`,
              `5-year partner route: continuous partner permission since ${fiveYearStart}: ${years} years completed (E-ILRP.1.3).`,
            ),
            assumptions,
          }
        : {
            status: 'FAIL',
            explanation: L(
              `5 年伴侣路线：自 ${fiveYearStart} 起连续持伴侣许可，截至 ${simulationDate} 满 ${fullYears(fiveYearStart, simulationDate)} 年；${due} 满 ${years} 年（E-ILRP.1.3）。`,
              `5-year partner route: continuous partner permission since ${fiveYearStart}: ${fullYearsEn(fiveYearStart, simulationDate)} by ${simulationDate}; ${years} years are completed on ${due} (E-ILRP.1.3).`,
            ),
            assumptions,
          };
    }
    const run = familyTenYearResidence(ctx);
    if (!run) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写伴侣许可是 5 年路线还是 10 年路线：5 年路线按 Appendix FM，10 年路线按 Appendix Settlement Family Life（SETF 3.1）。',
          'Not provided whether the partner permission is on the 5-year or the 10-year route: the 5-year route follows Appendix FM, the 10-year route Appendix Settlement Family Life (SETF 3.1).',
        ),
      };
    }
    const years = cl.values.familyPartnerQualifyingYearsTen.value;
    const { start, before } = run;
    const rn = (r: Route) => nameIn(L, routeNames[r]);
    const assumptions = [
      L(
        `连续期合并 SETF 3.1 列出的${rn('FAMILY_PARTNER_OR_PARENT')}、${rn('FAMILY_AND_PRIVATE_LIFE')}两类许可；各段按与当前许可同属 10 年路线计算。`,
        `The continuous period combines the ${rn('FAMILY_PARTNER_OR_PARENT')} and ${rn('FAMILY_AND_PRIVATE_LIFE')} permissions listed in SETF 3.1; each period is taken to be on the 10-year route like the current permission.`,
      ),
      ...(before?.route === 'LEAVE_OUTSIDE_THE_RULES'
        ? [
            L(
              `紧接其前的${rn(before.route)}若是基于 Article 8 的伴侣、父母、子女或私人生活许可，也可计入（SETF 3.1(e)），本工具无法区分，未计入。`,
              `The ${rn(before.route)} just before it also counts if it was granted on Article 8 grounds as a partner, parent or child or for private life (SETF 3.1(e)); this tool cannot tell and does not count it.`,
            ),
          ]
        : before
          ? [
              L(
                `SETF 3.2 在满足条件时（未非法入境、以伴侣身份持 Appendix FM 许可至少 1 年）也计入其他可定居路线的时间；本工具未计入紧接其前的${rn(before.route)}许可，实际日期可能更早（PD-069）。`,
                `SETF 3.2 also counts time on other routes that can lead to settlement if conditions are met (no illegal entry, and at least one year as a partner under Appendix FM); this tool does not count the ${rn(before.route)} permission just before it, so the actual date may be earlier (PD-069).`,
              ),
            ]
          : []),
      ...(timeline.absences.length > 0
        ? [
            absenceAssumption(L),
            L(
              '若行程后有明确的 Appendix FM 伴侣或父母许可，按 CR 3.6 排除分界日前的缺席整天。现有许可类型无法确认旧 paragraph 276ADE / 276BE(2) 的获批依据。',
              'Whole days abroad before the cut-off are disregarded under CR 3.6 where the recorded trip was followed by an identified Appendix FM partner or parent grant. The recorded permission types do not identify grants under former paragraphs 276ADE or 276BE(2).',
            ),
          ]
        : []),
    ];
    assumptions.push(...residenceAssumptions(timeline, simulationDate, run, L));
    return run.applicationDate === simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `10 年伴侣路线：自 ${start} 起连续持可计入的许可（SETF 3.1），${residenceCompleted(run, simulationDate, years, L)}。`,
            `10-year partner route: continuous qualifying permission (SETF 3.1) since ${start}: ${residenceCompleted(run, simulationDate, years, L)}.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `10 年伴侣路线：自 ${start} 起连续持可计入的许可（SETF 3.1），${residencePending(run, years, L)}。`,
            `10-year partner route: continuous qualifying permission (SETF 3.1) since ${start}: ${residencePending(run, years, L)}.`,
          ),
          assumptions,
        };
  },
);

/** E-LTRP.1.2(a)–(b), applied at settlement by E-ILRP.1.3(1A). */
function fiveYearRelationship(
  ctx: RuleContext,
  L: Lang,
): Omit<RuleResult, 'sources'> {
  const partner = ctx.timeline.relationships.find((r) => r.type === 'PARTNER');
  if (!partner) {
    return {
      status: 'UNKNOWN',
      explanation: L(
        '未填写伴侣信息；5 年路线定居时伴侣须为在英国的 British citizen 或已在英国定居（E-LTRP.1.2(a)–(b)，E-ILRP.1.3(1A)）。',
        'Partner details not provided; on the 5-year route the partner must be a British citizen in the UK or settled in the UK at settlement (E-LTRP.1.2(a)–(b), E-ILRP.1.3(1A)).',
      ),
    };
  }
  if (partner.otherPartyStatus === 'OTHER') {
    return {
      status: 'UNKNOWN',
      explanation: L(
        '伴侣既不是 British citizen 也未定居；5 年路线定居时不能依据 E-LTRP.1.2(c)–(f)（protection status 等，E-ILRP.1.3(1A)），本工具无法判断伴侣的实际身份。',
        'The partner is neither a British citizen nor settled; on the 5-year route settlement cannot rely on E-LTRP.1.2(c)–(f) (protection status and others, E-ILRP.1.3(1A)), and this tool cannot tell the partner’s actual status.',
      ),
    };
  }
  return {
    status: 'PASS',
    explanation: L(
      `伴侣${partner.otherPartyStatus === 'BRITISH_CITIZEN' ? '为 British citizen（E-LTRP.1.2(a)）' : '已在英国定居（E-LTRP.1.2(b)）'}。`,
      `The partner is ${partner.otherPartyStatus === 'BRITISH_CITIZEN' ? 'a British citizen (E-LTRP.1.2(a))' : 'settled in the UK (E-LTRP.1.2(b))'}.`,
    ),
    assumptions: [
      L(
        '假设申请日你的伴侣也在英国（Appendix FM R-ILRP.1.1(a)）。',
        'This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).',
      ),
      L(
        '按关系真实且持续、双方打算永久共同生活（E-LTRP.1.7–E-LTRP.1.10）处理，本工具未核对。',
        'The relationship is taken as genuine and subsisting, with both intending to live together permanently (E-LTRP.1.7–E-LTRP.1.10); this tool does not check these.',
      ),
    ],
  };
}

export const clFamilyRelationship = defineRule(
  {
    id: 'CL-FAMILY-RELATIONSHIP',
    ruleSetId: RULE_SET,
    title: '伴侣为 British citizen 或已定居',
    titleEn: 'Partner is a British citizen or settled',
    sources: [
      { srcId: 'SRC-022', locator: 'SETF 7.1' },
      { srcId: 'SRC-022', locator: 'SETF 7.2' },
      { srcId: 'SRC-022', locator: 'SETF 7.3' },
      { srcId: 'SRC-024', locator: 'R-ILRP.1.1(a)' },
      { srcId: 'SRC-024', locator: 'E-ILRP.1.3(1A)' },
      { srcId: 'SRC-024', locator: 'E-LTRP.1.2' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    if (onFamilyPartnerFiveYear(ctx.timeline, ctx.simulationDate)) {
      return fiveYearRelationship(ctx, L);
    }
    const partner = ctx.timeline.relationships.find(
      (r) => r.type === 'PARTNER',
    );
    if (!partner) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写伴侣信息；SETF 7.1 要求伴侣为在英国的 British citizen、已定居，或与申请人同时申请定居。',
          'Partner details not provided; SETF 7.1 requires the partner to be a British citizen living in the UK, settled in the UK, or applying for settlement at the same time.',
        ),
      };
    }
    if (partner.otherPartyStatus === 'OTHER') {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '伴侣既不是 British citizen 也未定居；只有伴侣与申请人同时申请定居时才满足 SETF 7.1(c)，本工具无法判断。',
          'The partner is neither a British citizen nor settled; SETF 7.1(c) is met only if the partner is applying for settlement at the same time, which this tool cannot tell.',
        ),
      };
    }
    return {
      status: 'PASS',
      explanation: L(
        `伴侣${partner.otherPartyStatus === 'BRITISH_CITIZEN' ? '为 British citizen（SETF 7.1(a)）' : '已在英国定居（SETF 7.1(b)）'}。`,
        `The partner is ${partner.otherPartyStatus === 'BRITISH_CITIZEN' ? 'a British citizen (SETF 7.1(a))' : 'settled in the UK (SETF 7.1(b))'}.`,
      ),
      assumptions: [
        L(
          '按关系真实且持续（SETF 7.2、Appendix Relationship with Partner）、已以与当前伴侣的关系持许可至少 1 年（SETF 7.3）处理，本工具未核对。',
          'The relationship is taken as genuine and subsisting (SETF 7.2, Appendix Relationship with Partner), with permission based on it held for at least one year (SETF 7.3); this tool does not check these.',
        ),
      ],
    };
  },
);

/** E-LTRP.3.1(a) or, transitionally, E-LTRP.3.7(a) capped by E-LTRP.3.8. */
export function familyIncomeThreshold(ctx: RuleContext): {
  threshold: number;
  transitional: boolean;
  children: number;
} {
  const start = familyFiveYearStart(ctx)!;
  const v = cl.values;
  const transitional = start < v.familyPartnerTransitionalBefore.value;
  // E-LTRP.3.7: a "child" is not a British citizen or settled.
  const children = ctx.timeline.relationships.filter(
    (r) => r.type === 'CHILD' && r.otherPartyStatus === 'OTHER',
  ).length;
  const threshold = transitional
    ? Math.min(
        v.familyPartnerTransitionalIncome.value +
          (children > 0 ? v.familyPartnerTransitionalFirstChild.value : 0) +
          Math.max(children - 1, 0) *
            v.familyPartnerTransitionalAdditionalChild.value,
        v.familyPartnerMinimumIncome.value,
      )
    : v.familyPartnerMinimumIncome.value;
  return { threshold, transitional, children };
}

export const clFamilyFinancial = defineRule(
  {
    id: 'CL-FAMILY-FINANCIAL',
    ruleSetId: RULE_SET,
    title: '5 年伴侣路线的财务要求',
    titleEn: 'Financial requirement on the 5-year partner route',
    sources: [
      { srcId: 'SRC-024', locator: 'E-ILRP.1.3(1A)' },
      { srcId: 'SRC-024', locator: 'E-LTRP.3.1' },
      { srcId: 'SRC-024', locator: 'E-LTRP.3.2' },
      { srcId: 'SRC-024', locator: 'E-LTRP.3.3' },
      { srcId: 'SRC-024', locator: 'E-LTRP.3.5' },
      { srcId: 'SRC-024', locator: 'E-LTRP.3.7' },
      { srcId: 'SRC-024', locator: 'E-LTRP.3.8' },
    ],
    pendingDetails: ['PD-075'],
  },
  (ctx) => {
    const L = textFor(ctx);
    if (!onFamilyPartnerFiveYear(ctx.timeline, ctx.simulationDate)) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 5 年路线的伴侣许可。',
          'Current permission is not as a partner on the 5-year route.',
        ),
      };
    }
    const v = cl.values;
    const { threshold, transitional, children } = familyIncomeThreshold(ctx);
    const before = v.familyPartnerTransitionalBefore.value;
    const base = v.familyPartnerSavingsBase.value;
    const basis = transitional
      ? L(
          `过渡门槛（E-LTRP.3.5、E-LTRP.3.7(a)，${children} 名子女，最高 ${gbp(v.familyPartnerMinimumIncome.value)}）`,
          `the transitional requirement (E-LTRP.3.5, E-LTRP.3.7(a); ${children} ${children === 1 ? 'child' : 'children'}, capped at ${gbp(v.familyPartnerMinimumIncome.value)})`,
        )
      : L(
          '一般门槛（E-LTRP.3.1(a)）',
          'the general requirement (E-LTRP.3.1(a))',
        );
    // E-LTRP.3.1 / 3.7: income (a), savings (b) or the partner's benefit (c).
    const savingsBasis = transitional ? 'E-LTRP.3.7(b)' : 'E-LTRP.3.1(b)';
    const benefitBasis = transitional ? 'E-LTRP.3.7(c)' : 'E-LTRP.3.1(c)';
    const assumptions = [
      L(
        `是否适用过渡门槛按连续伴侣许可的起点是否早于 ${before} 判断（E-LTRP.3.5 看的是首次申请日；获批在此后而申请在此前的，也适用过渡门槛）；子女按"关系"里身份为其他的子女计。`,
        `Whether the transitional requirement applies is judged by whether the continuous partner permission started before ${before} (E-LTRP.3.5 looks at the date of the first application, so an application made before that date and granted after it also qualifies); children are those listed under relationships with another status.`,
      ),
      L(
        '储蓄按申报的合计现金储蓄计；Appendix FM-SE 的持有期与证据规则、E-LTRP.3.2 的收入与储蓄来源种类未核对；伴侣领取的福利按申报；住宿要求（E-LTRP.3.4、E-LTRP.3.9）与 EX.1 未建模。',
        'Savings are the combined cash savings as declared; the holding period and evidence rules in Appendix FM-SE and the kinds of income and savings sources in E-LTRP.3.2 are not checked; any benefit the partner receives is taken as declared; the accommodation requirement (E-LTRP.3.4, E-LTRP.3.9) and EX.1 are not modelled.',
      ),
      // A transitional amount above £29,000 is capped (E-LTRP.3.8).
      ...(transitional && threshold === v.familyPartnerMinimumIncome.value
        ? [
            L(
              `过渡门槛按 E-LTRP.3.8 封顶为 ${gbp(threshold)}，储蓄补足的缺口也按封顶后的门槛计算。`,
              `The transitional requirement is capped at ${gbp(threshold)} under E-LTRP.3.8, and the shortfall that savings make up is counted against the capped amount.`,
            ),
          ]
        : []),
    ];
    const [taxYear] = taxYearsBefore(ctx.simulationDate, 1);
    const income = ctx.timeline.incomeYears.find((i) => i.taxYear === taxYear);
    const total =
      income &&
      (income.earnings !== undefined || income.partnerEarnings !== undefined)
        ? (income.earnings ?? 0) + (income.partnerEarnings ?? 0)
        : undefined;
    if (total !== undefined && total >= threshold) {
      return {
        status: 'PASS',
        explanation: L(
          `${taxYear} 纳税年度本人与伴侣收入合计 ${gbp(total)}，达到${basis}的 ${gbp(threshold)}。`,
          `Combined earnings of the applicant and partner in the ${taxYear} tax year are ${gbp(total)}, which meets the ${gbp(threshold)} of ${basis}.`,
        ),
        assumptions,
      };
    }
    // Savings make up the shortfall; without income, the whole threshold.
    const gap = threshold - (total ?? 0);
    const needed = base + gap;
    const savings = ctx.timeline.cashSavings;
    const short =
      total === undefined
        ? L(
            `未填写 ${taxYear} 纳税年度本人与伴侣的收入`,
            `Earnings of the applicant and partner for the ${taxYear} tax year are not provided`,
          )
        : L(
            `${taxYear} 纳税年度本人与伴侣收入合计 ${gbp(total)}，低于${basis}的 ${gbp(threshold)}，缺口 ${gbp(gap)}`,
            `Combined earnings of the applicant and partner in the ${taxYear} tax year are ${gbp(total)}, below the ${gbp(threshold)} of ${basis}: a shortfall of ${gbp(gap)}`,
          );
    if (savings !== undefined && savings >= needed) {
      return {
        status: 'PASS',
        explanation: L(
          `${short}；现金储蓄 ${gbp(savings)}，达到 ${gbp(base)} 加${total === undefined ? '整个门槛' : '缺口'}共 ${gbp(needed)}（${savingsBasis}；定居申请按 E-ILRP.1.3(1A) 不乘 2.5）。`,
          `${short}; cash savings of ${gbp(savings)} meet ${gbp(base)} plus the ${total === undefined ? 'whole requirement' : 'shortfall'}, ${gbp(needed)} in all (${savingsBasis}; for settlement, E-ILRP.1.3(1A) disregards “2.5 times”).`,
        ),
        assumptions,
      };
    }
    if (ctx.timeline.partnerSpecifiedBenefit) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `${short}；伴侣领取 E-LTRP.3.3(a) 所列福利（按申报），可改为证明伴侣能在不依赖 public funds 的情况下充分供养与安置其本人、申请人与 dependants（${benefitBasis}、E-LTRP.3.3(b)）。这一要求没有数字门槛，计算口径本工具未登记（PD-075）。`,
          `${short}; the partner receives a benefit listed in E-LTRP.3.3(a), as declared, so the applicant can instead show that the partner can maintain and accommodate themselves, the applicant and any dependants adequately without recourse to public funds (${benefitBasis}, E-LTRP.3.3(b)). This requirement has no set figure, and how it is calculated is not registered in this tool (PD-075).`,
        ),
        pendingDetails: ['PD-075'],
        assumptions,
      };
    }
    if (total === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `未填写 ${taxYear} 纳税年度本人与伴侣的收入；按${basis}须合计至少 ${gbp(threshold)}，也可用储蓄补足：至少 ${gbp(base)} 加收入缺口（${savingsBasis}）。`,
          `Earnings of the applicant and partner for the ${taxYear} tax year not provided; ${basis} requires at least ${gbp(threshold)} combined, or savings can make up the difference: at least ${gbp(base)} plus the shortfall (${savingsBasis}).`,
        ),
        assumptions,
      };
    }
    if (savings === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `${short}；现金储蓄至少 ${gbp(needed)}（${gbp(base)} 加缺口，${savingsBasis}；E-ILRP.1.3(1A)）即可满足，未填写储蓄。`,
          `${short}; cash savings of at least ${gbp(needed)} (${gbp(base)} plus the shortfall, ${savingsBasis}; E-ILRP.1.3(1A)) would meet it, and no savings have been provided.`,
        ),
        assumptions,
      };
    }
    return {
      status: 'FAIL',
      explanation: L(
        `${short}；现金储蓄 ${gbp(savings)}，不足 ${gbp(base)} 加缺口共 ${gbp(needed)}，还差 ${gbp(needed - savings)}（${savingsBasis}；E-ILRP.1.3(1A)）。若伴侣领取 E-LTRP.3.3(a) 所列福利，可改按 E-LTRP.3.3 判断。`,
        `${short}; cash savings of ${gbp(savings)} are below ${gbp(base)} plus the shortfall, ${gbp(needed)} in all, by ${gbp(needed - savings)} (${savingsBasis}; E-ILRP.1.3(1A)). If the partner receives a benefit listed in E-LTRP.3.3(a), E-LTRP.3.3 can apply instead.`,
      ),
      assumptions,
    };
  },
);

/**
 * The Appendix FM permission the principal settles from: their current one,
 * or the last one before settling on that route.
 */
function principalFamilyPermission(
  ctx: RuleContext,
): ImmigrationEpisode['familyPermission'] | 'NOT_ON_ROUTE' {
  const p = ctx.principal!.timeline;
  const settled = settledBy(p, ctx.simulationDate);
  if (!settled) {
    const current = episodeOn(p, ctx.simulationDate);
    return current?.route === 'FAMILY_PARTNER_OR_PARENT' &&
      current.role === 'MAIN'
      ? current.familyPermission
      : 'NOT_ON_ROUTE';
  }
  if (settled.route !== 'FAMILY_PARTNER_OR_PARENT') return 'NOT_ON_ROUTE';
  return p.episodes
    .filter(
      (e) =>
        e.route === 'FAMILY_PARTNER_OR_PARENT' &&
        e.role === 'MAIN' &&
        e.validFrom <= settled.date,
    )
    .sort((a, b) => (a.validFrom < b.validFrom ? -1 : 1))
    .at(-1)?.familyPermission;
}

/**
 * The child of a 5-year route partner, who settles under Part 8 para 298
 * (last sentence of D-LTRC.1.1, contracts §16.5). Needs the principal.
 */
export function onFiveYearFamilyChild(ctx: RuleContext): boolean {
  return (
    ctx.principal !== undefined &&
    onFamilyChild(ctx.timeline, ctx.simulationDate) &&
    principalFamilyPermission(ctx) === 'PARTNER_FIVE_YEAR'
  );
}

const lastFamilyPermissionAssumption = (L: Lang) =>
  L(
    '主申请人已定居：按其定居日前最后一个 Appendix FM 主申请人片段的许可类型判断是 5 年还是 10 年路线。',
    'The principal applicant has settled: whether they were on the 5-year or the 10-year route is taken from their last Appendix FM main applicant permission before settling.',
  );

/**
 * Part 8 para 298: the child of a 5-year route partner settles once the
 * parent is settled (298(i)(a)–(d)) or with them, when they are granted
 * settlement on whichever pathway (298(i)(d)); no qualifying period of their
 * own (contracts §16.5).
 */
function fiveYearChildPathway(
  ctx: RuleContext,
  settled: PersonTimeline['settled'],
): DependantPathway {
  const { timeline, simulationDate } = ctx;
  const L = textFor(ctx);
  const adultAge = cl.values.settlementMinorAge.value;
  const minor = minorOn(timeline, simulationDate);
  const age = minor
    ? L(
        `申请日未满 ${adultAge} 岁（298(ii)(a)）`,
        `Under ${adultAge} on the date of application (para 298(ii)(a))`,
      )
    : L(
        `申请日已满 ${adultAge} 岁，当前的 Appendix FM 子女许可按以定居为目的获批处理（298(ii)(b)）`,
        `Aged ${adultAge} or over on the date of application, with the current Appendix FM child permission taken as granted with a view to settlement (para 298(ii)(b))`,
      );
  const assumptions = [
    settled
      ? L(
          '298(i)：主申请人已定居，按 (a)–(d) 之一满足处理（另一位父母已定居或为英国公民、已去世、由主申请人独自抚养或子女与其同住，或另一位父母未持也不在获批英国限期许可）；(e) 近亲情形未建模。',
          'Para 298(i): the principal applicant has settled, and one of (a)–(d) is assumed to be met (the other parent is settled or a British citizen, or has died; the principal applicant has sole responsibility or the child lives with them; or the other parent does not have, and is not being granted, limited leave in the UK); (e), a close relative, is not modelled.',
        )
      : L(
          '298(i)：主申请人尚未定居，只有 (d)（与主申请人同时获批定居）适用；假设另一位父母未持、也不在获批英国限期许可，例如是主申请人的英国公民或已定居伴侣；(e) 近亲情形未建模。',
          'Para 298(i): the principal applicant has not settled, so only (d), being granted settlement at the same time as them, applies; the other parent is assumed not to have, and not to be granted, limited leave in the UK, for example as the principal applicant’s British citizen or settled partner; (e), a close relative, is not modelled.',
        ),
    ...(minor
      ? [
          L(
            `按申请日年龄判断：若到预计日期已满 ${adultAge} 岁，届时须按 298(vii) 满足英语与 Life in the UK。`,
            `Age is taken on the date of application: if the child is ${adultAge} or over by the projected date, the English and Life in the UK requirements in para 298(vii) apply then.`,
          ),
        ]
      : [
          L(
            '298(ii)(b)：当前的 Appendix FM 子女许可视为以定居为目的获批。仅因英语或 Life in the UK 不满足 298(vii) 时，可按 298A 获限期许可，但仍不符合定居。',
            'Para 298(ii)(b): the current Appendix FM child permission is taken as granted with a view to settlement. If only the English or Life in the UK requirement in para 298(vii) is not met, limited leave may be granted under para 298A, but settlement is not.',
          ),
        ]),
    L(
      '未独立生活、未婚、未另组家庭（298(iii)），由父母提供足够的住宿与生活费、不依赖 public funds（298(iv)–(v)），按满足处理。',
      'Not leading an independent life, being unmarried and not having formed an independent family unit (para 298(iii)), and adequate accommodation and maintenance from the parent without recourse to public funds (para 298(iv)–(v)), are assumed to be met.',
    ),
    settled ? lastFamilyPermissionAssumption(L) : notYetSettledAssumption(L),
  ];
  const years = cl.values.familyPartnerQualifyingYearsFive.value;
  if (settled) {
    return {
      years,
      start: addYears(simulationDate, -years),
      result: {
        status: 'PASS',
        explanation: L(
          `${age}；主申请人已于 ${settled.date} 定居（298(i)），可申请定居；子女本人没有合格期。`,
          `${age}; the principal applicant settled on ${settled.date} (para 298(i)), so they can apply for settlement; the child has no qualifying period of their own.`,
        ),
        assumptions,
      },
    };
  }
  const p = ctx.principal!.result.byRuleSet[RULE_SET];
  if (p?.earliestDate && p.pathwayYears) {
    return {
      years: p.pathwayYears,
      start: addYears(p.earliestDate, -p.pathwayYears),
      applicationDate: p.earliestDate,
      result: {
        status: 'PASS',
        explanation: L(
          `${age}；随主申请人定居：主申请人 ${p.earliestDate} 可获批定居，届时同时申请（298(i)(d)）；子女本人没有合格期。`,
          `${age}; settling with the principal applicant, who can be granted settlement on ${p.earliestDate}, when they apply together (para 298(i)(d)); the child has no qualifying period of their own.`,
        ),
        assumptions,
      },
    };
  }
  return {
    years,
    result:
      p?.outcome === 'LIKELY_NOT_ELIGIBLE'
        ? {
            status: 'FAIL',
            explanation: L(
              '主申请人目前不能定居，本人不能按 298(i) 随其定居。',
              'The principal applicant cannot currently settle, so this person cannot settle with them under para 298(i).',
            ),
            assumptions,
          }
        : {
            status: 'UNKNOWN',
            explanation: L(
              '主申请人的信息不足以判断其何时定居。',
              'The principal applicant’s details are not enough to determine when they can settle.',
            ),
            assumptions,
          },
  };
}

/**
 * SETF 10.3, SETF 12.1, SETF 13.1: the child of a 10-year route partner; the
 * child of a 5-year route partner settles under Part 8 para 298.
 */
export function familyChildPathway(
  ctx: RuleContext,
): DependantPathway | undefined {
  const { timeline, simulationDate, principal } = ctx;
  if (!onFamilyChild(timeline, simulationDate)) return undefined;
  const L = textFor(ctx);
  const years = cl.values.familyPartnerQualifyingYearsTen.value;
  const settled = principal && settledBy(principal.timeline, simulationDate);
  const assumptions = [
    L(
      '另一位父母须同时获批定居、已定居或为英国公民，除非主申请人是唯一在世的父母或负唯一抚养责任等（SETF 12.2）；16 岁以上不独立生活（SETF 13.2）、照护安排（SETF 14.1）按满足处理；在英国出生的子女（SETF 10.3）与 SETF 11.3–11.6 的 10 年例外未建模。',
      'The other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant is the sole surviving parent, has sole responsibility or similar (SETF 12.2); not leading an independent life at 16 or over (SETF 13.2) and the care arrangements (SETF 14.1) are assumed to be met; children born in the UK (SETF 10.3) and the 10-year exceptions in SETF 11.3–11.6 are not modelled.',
    ),
    ...(settled ? [] : [notYetSettledAssumption(L)]),
  ];
  if (!principal) return { years, result: needsPrincipal(L, assumptions) };
  const permission = principalFamilyPermission(ctx);
  if (permission === 'PARTNER_FIVE_YEAR') {
    return fiveYearChildPathway(ctx, settled);
  }
  if (settled && permission !== 'NOT_ON_ROUTE') {
    assumptions.push(lastFamilyPermissionAssumption(L));
  }
  if (permission === 'NOT_ON_ROUTE') {
    return settled
      ? {
          years,
          result: {
            status: 'FAIL',
            explanation: L(
              `主申请人 ${settled.date} 定居时持有的不是 Appendix FM 伴侣许可，不能按 SETF 12.1(b) 随其定居。`,
              `The principal applicant did not hold Appendix FM partner permission when they settled on ${settled.date}, so settlement with them under SETF 12.1(b) is not possible.`,
            ),
            assumptions,
          },
        }
      : {
          years,
          result: principalNotReady(
            ctx,
            false,
            L('Appendix FM 伴侣', 'Appendix FM partner'),
            assumptions,
          ),
        };
  }
  if (permission !== 'PARTNER_TEN_YEAR') {
    return {
      years,
      result: {
        status: 'UNKNOWN',
        explanation: L(
          '主申请人是 Appendix FM 的 parent 许可（未建模），或未填写伴侣许可是 5 年还是 10 年路线。',
          'The principal applicant holds Appendix FM permission as a parent (not modelled), or whether their partner permission is on the 5-year or the 10-year route is not provided.',
        ),
        assumptions,
      },
    };
  }
  const age = minorOn(timeline, simulationDate)
    ? L(
        `申请日未满 ${cl.values.settlementMinorAge.value} 岁（SETF 13.1）`,
        `Under ${cl.values.settlementMinorAge.value} on the date of application (SETF 13.1)`,
      )
    : L(
        `申请日已满 ${cl.values.settlementMinorAge.value} 岁，但最近一次为 dependent child 许可（SETF 13.1）`,
        `Aged ${cl.values.settlementMinorAge.value} or over on the date of application, but last granted permission as a dependent child (SETF 13.1)`,
      );
  if (settled) {
    return {
      years,
      start: addYears(simulationDate, -years),
      result: {
        status: 'PASS',
        explanation: L(
          `${age}；主申请人已于 ${settled.date} 以 10 年路线伴侣身份定居（SETF 12.1(b)），可申请定居；子女本人没有居留年限要求。`,
          `${age}; the principal applicant settled as a partner on the 10-year route on ${settled.date} (SETF 12.1(b)), so they can apply for settlement; the child has no residence requirement of their own.`,
        ),
        assumptions,
      },
    };
  }
  const due = principalApplicationDate(ctx, 'CL-FAMILY-RESIDENCE');
  if (!due) {
    return {
      years,
      result: principalNotReady(
        ctx,
        true,
        L('Appendix FM 伴侣 10 年', '10-year Appendix FM partner'),
        assumptions,
      ),
    };
  }
  const joint = jointApplication(
    due,
    (notBefore) =>
      currentResidence(
        timeline,
        simulationDate,
        (e) =>
          e.route === 'FAMILY_PARTNER_OR_PARENT' &&
          e.role === 'DEPENDANT' &&
          e.dependantOf === 'PARENT',
        0,
        { notBefore },
      ),
    (notBefore) =>
      familyTenYearResidence(
        { timeline: principal.timeline, simulationDate },
        notBefore,
      )?.applicationDate,
  );
  if (!joint?.applicationDate) {
    return { years, result: noJointApplication(L, assumptions) };
  }
  const { applicationDate } = joint;
  return {
    years,
    start: addYears(applicationDate, -years),
    applicationDate,
    result: {
      status: 'PASS',
      explanation: L(
        `${age}；随主申请人定居：主申请人可于 ${applicationDate} 申请，届时可一同申请（SETF 12.1(a)）；子女本人没有居留年限要求。`,
        `${age}; settling with the principal applicant, who can apply on ${applicationDate}, when they can apply together (SETF 12.1(a)); the child has no residence requirement of their own.`,
      ),
      assumptions,
    },
  };
}

export const clFamilyChild = defineRule(
  {
    id: 'CL-FAMILY-CHILD',
    ruleSetId: RULE_SET,
    title: 'Appendix FM 伴侣的子女随主申请人定居',
    titleEn:
      'Child of an Appendix FM partner settling with the principal applicant',
    sources: [
      { srcId: 'SRC-022', locator: 'SETF 10.3' },
      { srcId: 'SRC-022', locator: 'SETF 12.1' },
      { srcId: 'SRC-022', locator: 'SETF 12.2' },
      { srcId: 'SRC-022', locator: 'SETF 13.1' },
      { srcId: 'SRC-022', locator: 'SETF 13.2' },
      { srcId: 'SRC-022', locator: 'SETF 14.1' },
      { srcId: 'SRC-024', locator: 'D-LTRC.1.1' },
      { srcId: 'SRC-029', locator: 'para 298(i)' },
      { srcId: 'SRC-029', locator: 'para 298(ii)' },
      { srcId: 'SRC-029', locator: 'para 298(iii)' },
      { srcId: 'SRC-029', locator: 'para 298(iv)' },
      { srcId: 'SRC-029', locator: 'para 298(v)' },
      { srcId: 'SRC-029', locator: 'para 298(vii)' },
      { srcId: 'SRC-029', locator: 'para 298A' },
    ],
    pendingDetails: [],
  },
  (ctx) =>
    familyChildPathway(ctx)?.result ?? {
      status: 'FAIL',
      explanation: textFor(ctx)(
        '当前不是 Appendix FM 伴侣或父母的 dependent child 许可。',
        'Current permission is not as the dependent child of an Appendix FM partner or parent.',
      ),
    },
);
