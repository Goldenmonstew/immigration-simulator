import {
  annexCOccupations,
  earnedSettlement2026_11 as es,
  publicFundsBenefits,
} from '@uk-immigration/policy-data';
import type {
  Benefit,
  BestYears,
  SourceRef,
} from '@uk-immigration/policy-data';
import { addDays, addYears, taxYearOf, taxYearsBefore } from '../dates';
import { continuousRun, episodeOn } from '../residence';
import { defineRule, textFor } from '../rule';
import type { Lang } from '../rule';
import type {
  BenefitEpisode,
  ImmigrationEpisode,
  IsoDate,
  RuleContext,
} from '../types';
import {
  ageExemptOn,
  childDependantAssumption,
  childDependantOn,
} from './es-requirements';
import {
  esProtectionRouteOn,
  esQualifyingResidence,
  esRouteOn,
  groupsOf,
} from './es-residence';

// Contribution: earnings, British connection, public funds and public service
// (SRC-001 Chapter 2, p14–p19; Table 1 p46).

const RULE_SET = 'earned-settlement-2026-11';

export function gbp(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`;
}

const earningsAssumption = (L: Lang) =>
  L(
    '收入按英国 tax year 的税前收入汇总，各年统一按现行门槛比较。以申请日前的完整 tax year 为基准，若回看边界上的收入归属能改变结论，则保留待定（PD-005 / PD-006 / PD-007）。',
    'Gross earnings are recorded by UK tax year and compared with the current thresholds. The estimate uses completed tax years before applying and leaves the result open if earnings at the lookback boundary can change it (PD-005 / PD-006 / PD-007).',
  );

/** Best years (SRC-001 p16–p17): compare completed tax years and check the window edges. */
function bestYears(
  { timeline, simulationDate, locale, principal }: RuleContext,
  threshold: number,
  { required, window }: BestYears,
  household: boolean,
) {
  const years = taxYearsBefore(simulationDate, window);
  const current = episodeOn(timeline, simulationDate);
  // PD-056 models a partner dependant assessed with their recorded principal.
  const modelledCouple =
    principal &&
    current?.role === 'DEPENDANT' &&
    current.dependantOf === 'PARTNER';
  const householdThreshold = es.values.householdEarningsThreshold.value;
  const yearStatus = (taxYear: string) => {
    const income = timeline.incomeYears.find((i) => i.taxYear === taxYear);
    const own = income?.earnings;
    if (own !== undefined && own >= threshold) return 'OWN';
    if (
      household &&
      (own ?? 0) + (income?.partnerEarnings ?? 0) >= householdThreshold
    ) {
      return modelledCouple ? 'HOUSEHOLD' : 'PD-010';
    }
    return own === undefined ? 'MISSING' : 'BELOW';
  };
  const results = years.map(yearStatus);
  const passes = (result: ReturnType<typeof yearStatus>) =>
    result === 'OWN' || result === 'HOUSEHOLD';
  const met = results.filter(passes).length;
  const withPartner = results.filter((result) => result === 'HOUSEHOLD').length;
  const unconfirmed = results.filter((result) => result === 'PD-010').length;
  const missing = results.filter((result) => result === 'MISSING').length;
  const currentTaxYear = taxYearOf(simulationDate);
  const aligned = taxYearOf(addDays(simulationDate, -1)) !== currentTaxYear;
  const currentResult = yearStatus(currentTaxYear);
  const currentCouldCount =
    !aligned && (passes(currentResult) || currentResult === 'PD-010');
  const recorded = met + unconfirmed;
  const possible = recorded + missing;
  const oldestCouldCount =
    !aligned && (passes(results[0]) || results[0] === 'PD-010');
  const boundaryMatters =
    (oldestCouldCount &&
      ((met === required && passes(results[0])) || recorded === required)) ||
    (recorded === required - 1 && currentCouldCount);
  const canMeet = possible + Number(currentCouldCount) >= required;
  const inputMissing =
    canMeet && recorded + Number(currentCouldCount) < required;
  const householdMatters =
    met < required &&
    canMeet &&
    (unconfirmed > 0 || (currentCouldCount && currentResult === 'PD-010'));
  const pendingDetails = [
    ...(boundaryMatters ? ['PD-006'] : []),
    ...(householdMatters ? ['PD-010'] : []),
  ];
  const status =
    met >= required && !boundaryMatters
      ? 'PASS'
      : inputMissing || pendingDetails.length
        ? 'UNKNOWN'
        : 'FAIL';
  const L = textFor({ locale });
  const explanation =
    L(
      `${years[0]} 至 ${years[years.length - 1]} 这 ${window} 个 tax year 中，有 ${met} 年收入达到 ${gbp(threshold)}`,
      `Earnings reached ${gbp(threshold)} in ${met} of the ${window} tax years ${years[0]} to ${years[years.length - 1]}`,
    ) +
    (household && withPartner > 0
      ? L(
          `（其中 ${withPartner} 年靠与伴侣合计达到 ${gbp(householdThreshold)}）`,
          ` (${withPartner} of them through combined household earnings of ${gbp(householdThreshold)})`,
        )
      : '') +
    L(`，需要 ${required} 年`, `; ${required} needed`) +
    (missing > 0
      ? L(
          `；${missing} 年未填写收入`,
          `; earnings not provided for ${missing} year(s)`,
        )
      : '') +
    L('。', '.') +
    (boundaryMatters
      ? L(
          '回看期跨越 tax year 边界。边界税年的收入归属可改变达标年数，年度汇总无法确定归属（PD-006）。',
          ' The lookback crosses tax-year boundaries. Earnings at the edges can change the number of qualifying years, and annual totals cannot establish when they were earned (PD-006).',
        )
      : '') +
    (householdMatters
      ? L(
          `若可合计伴侣收入，部分年份可达 ${gbp(householdThreshold)}。合计须符合 eligible couple 条件，关系真实且持续，并且只有一方依赖另一方的收入（PD-010）。`,
          ` Combined earnings could reach ${gbp(householdThreshold)} in some years. Combining earnings requires an eligible couple in a genuine and subsisting relationship, with only one partner relying on the other’s earnings (PD-010).`,
        )
      : '');
  return {
    status,
    explanation,
    withPartner,
    ...(!inputMissing && pendingDetails.length > 0 && { pendingDetails }),
  } as const;
}

function earningsRule(
  id: string,
  title: string,
  titleEn: string,
  threshold: number,
  years: BestYears,
  sources: SourceRef[],
  pendingDetails: string[],
) {
  return defineRule(
    { id, ruleSetId: RULE_SET, title, titleEn, sources, pendingDetails },
    (ctx) => {
      const { status, explanation, pendingDetails } = bestYears(
        ctx,
        threshold,
        years,
        false,
      );
      return {
        status,
        explanation,
        ...(pendingDetails && { pendingDetails }),
        assumptions: [earningsAssumption(textFor(ctx))],
      };
    },
  );
}

const EARNINGS_SOURCES: SourceRef[] = [
  { srcId: 'SRC-001', locator: 'p15' },
  { srcId: 'SRC-001', locator: 'p16, How earnings will be assessed' },
  { srcId: 'SRC-001', locator: 'p46' },
];

export const esEarnings3Y = earningsRule(
  'ES-EARNINGS-3Y',
  `3 年路径收入：${es.values.bestYears3Year.value.window} 年中 ${es.values.bestYears3Year.value.required} 年达到 ${gbp(es.values.earningsThreshold3Year.value)}`,
  `${es.values.pathwayYears3.value}-year pathway earnings: ${gbp(es.values.earningsThreshold3Year.value)} in ${es.values.bestYears3Year.value.required} of ${es.values.bestYears3Year.value.window} years`,
  es.values.earningsThreshold3Year.value,
  es.values.bestYears3Year.value,
  EARNINGS_SOURCES,
  ['PD-005', 'PD-006', 'PD-007', 'PD-008', 'PD-011'],
);

export const esEarnings5Y = earningsRule(
  'ES-EARNINGS-5Y',
  `5 年路径收入：${es.values.bestYears5Year.value.window} 年中 ${es.values.bestYears5Year.value.required} 年达到 ${gbp(es.values.earningsThreshold5Year.value)}`,
  `${es.values.pathwayYears5.value}-year pathway earnings: ${gbp(es.values.earningsThreshold5Year.value)} in ${es.values.bestYears5Year.value.required} of ${es.values.bestYears5Year.value.window} years`,
  es.values.earningsThreshold5Year.value,
  es.values.bestYears5Year.value,
  EARNINGS_SOURCES,
  ['PD-005', 'PD-006', 'PD-007', 'PD-008'],
);

export const esEarnings10Y = defineRule(
  {
    id: 'ES-EARNINGS-10Y',
    ruleSetId: RULE_SET,
    title: `最低收入：${es.values.bestYears10Year.value.window} 年中 ${es.values.bestYears10Year.value.required} 年达到 ${gbp(es.values.earningsThresholdMinimum.value)}（或家庭合计 ${gbp(es.values.householdEarningsThreshold.value)}）`,
    titleEn: `Minimum earnings: ${gbp(es.values.earningsThresholdMinimum.value)} in ${es.values.bestYears10Year.value.required} of ${es.values.bestYears10Year.value.window} years (or ${gbp(es.values.householdEarningsThreshold.value)} combined household earnings)`,
    sources: [
      ...EARNINGS_SOURCES,
      { srcId: 'SRC-001', locator: 'p17' },
      { srcId: 'SRC-001', locator: 'p29' },
    ],
    pendingDetails: [
      'PD-005',
      'PD-006',
      'PD-007',
      'PD-008',
      'PD-009',
      'PD-010',
      'PD-041',
      'PD-042',
      'PD-059',
    ],
  },
  (ctx) => {
    const { timeline, simulationDate } = ctx;
    const L = textFor(ctx);
    if (ageExemptOn(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          `申请日未满 ${es.values.adultAge.value} 岁或已满 ${es.values.exemptionAge.value} 岁，豁免最低收入要求。`,
          `Under ${es.values.adultAge.value} or aged ${es.values.exemptionAge.value} or over on the date of application: exempt from the minimum earnings requirement.`,
        ),
      };
    }
    // Adult children over the age limit cannot settle as dependants at all
    // (ES-DEPENDANT-PATHWAY, p30).
    if (childDependantOn(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '保留 child-dependant 身份的成年子女随家庭定居，不需满足个人收入要求。',
          'An adult child retaining child-dependant status settles with the family and does not need to meet the individual earnings requirement.',
        ),
        sources: [{ srcId: 'SRC-001', locator: 'p29' }],
        assumptions: [childDependantAssumption(L)],
      };
    }
    if (timeline.earningsExemptHealth) {
      return {
        status: 'PASS',
        explanation: L(
          '申报因身心状况无法满足最低收入要求，适用豁免。',
          'A physical or mental condition that prevents meeting the minimum earnings requirement has been declared, so the exemption applies.',
        ),
        assumptions: [
          L(
            '身心状况豁免按用户申报，未核实认定标准（PD-009）。',
            'The physical or mental condition exemption is taken as declared; the criteria are not checked (PD-009).',
          ),
        ],
      };
    }
    const { withPartner, ...result } = bestYears(
      ctx,
      es.values.earningsThresholdMinimum.value,
      es.values.bestYears10Year.value,
      true,
    );
    const assumptions = [
      earningsAssumption(L),
      L(
        '最低收入按 p16 与 Table 1 的"申请前 7 年中 5 年"计算；p15 另有"至少 3 年"的说法（PD-041）。',
        'Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).',
      ),
    ];
    if (withPartner > 0) {
      assumptions.push(
        L(
          '已录入主申请人的伴侣 dependant 按本人申报的同一税年合计收入评估。假设关系真实且持续，主申请人无须依赖伴侣收入（p17；PD-010、PD-056）。',
          'For a partner dependant assessed with their principal, combined earnings are taken as declared for the same tax year. This assumes a genuine and subsisting relationship and that the principal does not need to rely on the dependant’s earnings (p17; PD-010, PD-056).',
        ),
      );
    }
    return { ...result, assumptions };
  },
);

export const esBritishConnection = defineRule(
  {
    id: 'ES-BRITISH-CONNECTION',
    ruleSetId: RULE_SET,
    title: 'British connection（5 年路径）',
    titleEn: `British connection (${es.values.pathwayYears5.value}-year pathway)`,
    sources: [
      { srcId: 'SRC-001', locator: 'p18, British Connection' },
      { srcId: 'SRC-001', locator: 'p50, Annex A' },
      { srcId: 'SRC-024', locator: 'E-LTRP.1.2(a)–(b), E-LTRPT.2.2(c)' },
    ],
    pendingDetails: [],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    const current = episodeOn(timeline, simulationDate);
    if (current?.route === 'UK_ANCESTRY') {
      return {
        status: 'PASS',
        explanation: L(
          '持 UK Ancestry 签证，属 recognised British connection，可走 5 年路径。',
          'Holds a UK Ancestry visa, a recognised British connection: the 5-year pathway is available.',
        ),
      };
    }
    if (current?.route === 'FAMILY_PARTNER_OR_PARENT') {
      const sponsors = timeline.relationships.filter(({ type }) => {
        if (current.role === 'DEPENDANT')
          return current.dependantOf === 'PARENT' && type === 'PARENT';
        if (current.familyPermission === 'PARENT') return type === 'CHILD';
        if (current.familyPermission) return type === 'PARTNER';
        // Older timelines may predate familyPermission.
        return type === 'PARTNER' || type === 'CHILD';
      });
      const british = sponsors.some(
        (r) => r.otherPartyStatus === 'BRITISH_CITIZEN',
      );
      if (
        sponsors.length === 0 ||
        (british &&
          sponsors.some((r) => r.otherPartyStatus !== 'BRITISH_CITIZEN'))
      ) {
        return {
          status: 'UNKNOWN',
          explanation: L(
            '已填资料无法确认当前家庭许可所依据的家庭成员是否为 British citizen。',
            'The information provided does not establish whether the family member on whom the current family permission is based is a British citizen.',
          ),
        };
      }
      if (british) {
        return {
          status: 'PASS',
          explanation: L(
            '家庭许可所依据的家庭成员为 British citizen，属 recognised British connection，可走 5 年路径。',
            'The family member on whom the family permission is based is a British citizen, a recognised British connection for the five-year pathway.',
          ),
          ...(!current.familyPermission &&
            current.role === 'MAIN' && {
              assumptions: [
                L(
                  '未申报家庭许可类别，按已录入的伴侣或子女关系推定许可依据。',
                  'The family permission category was not provided, so its basis is inferred from the recorded partner or child relationship.',
                ),
              ],
            }),
        };
      }
    }
    return {
      status: 'FAIL',
      explanation: L(
        '不属于 British citizen 家属路线或 UK Ancestry，不走这条 5 年路径。',
        'Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply.',
      ),
    };
  },
);

function namesOf(types: string[], L: Lang): string {
  return [...new Set(types)]
    .map(
      (t) =>
        [
          ...publicFundsBenefits.publicFunds,
          ...publicFundsBenefits.notPublicFunds,
        ].find((b) => b.benefitType === t)?.name ?? t,
    )
    .join(L('、', ', '));
}

const isIn = (list: Benefit[]) => (t: string) =>
  list.some((b) => b.benefitType === t);
const isPublicFund = isIn(publicFundsBenefits.publicFunds);
const isIgnoredBenefit = isIn(publicFundsBenefits.notPublicFunds);

export const esPublicFunds = defineRule(
  {
    id: 'ES-PUBLIC-FUNDS',
    ruleSetId: RULE_SET,
    title: `申请前 ${es.values.publicFundsLookbackYears.value} 年未使用 public funds`,
    titleEn: `No public funds in the ${es.values.publicFundsLookbackYears.value} years before applying`,
    sources: [
      { srcId: 'SRC-001', locator: 'p18, Public Funds' },
      { srcId: 'SRC-001', locator: 'p19, Individual D' },
      { srcId: 'SRC-006', locator: '#benefits-open-to-new-claims' },
      {
        srcId: 'SRC-006',
        locator: '#contributory-benefits-and-statutory-payments',
      },
    ],
    pendingDetails: ['PD-013', 'PD-014', 'PD-031', 'PD-047', 'PD-066'],
  },
  ({ timeline, simulationDate, locale, principal }) => {
    const L = textFor({ locale });
    const years = es.values.publicFundsLookbackYears.value;
    const protection = esProtectionRouteOn(timeline, simulationDate);
    if (protection === 'SAFE_AND_LEGAL') {
      return {
        status: 'PASS',
        explanation: L(
          `经 designated Safe and Legal Routes 入境的难民豁免"定居前 ${years} 年未使用 public funds"的要求（p37、p47）。`,
          `Refugees admitted through designated Safe and Legal Routes are exempt from the requirement not to have used public funds in the ${years} years before settlement (p37, p47).`,
        ),
        sources: [
          { srcId: 'SRC-001', locator: 'p37' },
          { srcId: 'SRC-001', locator: 'p47' },
        ],
      };
    }
    if (protection === 'CORE_PROTECTION') {
      return {
        status: 'PASS',
        explanation: L(
          `Core Protection 的 ${es.values.protectionPathwayYearsCore.value} 年路径豁免申请前 ${years} 年未使用 public funds 的要求（p39）。`,
          `The ${es.values.protectionPathwayYearsCore.value}-year Core Protection pathway is exempt from the requirement to have avoided public funds for the ${years} years before applying (p39).`,
        ),
        sources: [
          { srcId: 'SRC-001', locator: 'p39' },
          { srcId: 'SRC-001', locator: 'p47' },
        ],
      };
    }
    const pws = protection === 'PROTECTION_WORK_AND_STUDY';
    const startOfWindow = (date: IsoDate) => addYears(date, -years);
    const from = startOfWindow(simulationDate);
    const overlapsWindow = (b: BenefitEpisode) =>
      b.from <= simulationDate && (b.to ?? simulationDate) >= from;
    const inWindow = timeline.benefits.filter(overlapsWindow);
    const used = inWindow.filter((b) => isPublicFund(b.benefitType));
    const unlisted = inWindow.filter(
      (b) => !isPublicFund(b.benefitType) && !isIgnoredBenefit(b.benefitType),
    );
    const ignored = inWindow.filter((b) => isIgnoredBenefit(b.benefitType));
    const assumptions =
      inWindow.length > 0
        ? [
            ...(pws
              ? [
                  L(
                    '难民哪些福利可不计入、对最弱势者的保障措施，将在实施前公布；目前先按现行 public funds 定义判断（PD-031）。',
                    'Which benefits may be disregarded for refugees, and the safeguards for the most vulnerable, are to be set out before implementation; the current public funds definition is used for now (PD-031).',
                  ),
                ]
              : []),
            L(
              'specified public funds 先按现行 public funds 定义（SRC-006）判断；政府将另定纳入范围与弱势群体的保障或豁免（PD-013）。',
              'Specified public funds are judged by the current public funds definition (SRC-006) for now; the government will set the scope, and protections or exemptions for vulnerable groups, separately (PD-013).',
            ),
          ]
        : [];
    const ignoredNote =
      ignored.length > 0
        ? L(
            `${namesOf(
              ignored.map((b) => b.benefitType),
              L,
            )} 属缴费型福利或法定支付，不算 public funds。`,
            ` Contributory benefits or statutory payments, not public funds: ${namesOf(
              ignored.map((b) => b.benefitType),
              L,
            )}.`,
          )
        : '';
    if (used.length > 0) {
      const names = namesOf(
        used.map((b) => b.benefitType),
        L,
      );
      if (timeline.earningsExemptHealth) {
        return {
          status: 'UNKNOWN',
          explanation: L(
            `回看期内领过 ${names}。已申报影响最低收入的身心状况，是否适用 public funds 的弱势群体豁免尚待公布（PD-013）。`,
            `Received ${names} in the lookback period. A health condition affecting minimum earnings has been declared, and the public funds exemption criteria for vulnerable groups are still to be published (PD-013).`,
          ),
          sources: [
            { srcId: 'SRC-001', locator: 'p18, Public Funds' },
            { srcId: 'SRC-041', locator: 'p4, questions 8–9' },
          ],
          pendingDetails: pws ? ['PD-013', 'PD-031'] : ['PD-013'],
          assumptions,
        };
      }
      const ongoing = used.some((b) => !b.to);
      const lastUse = used
        .map((b) => b.to ?? simulationDate)
        .sort()
        .at(-1)!;
      let clears = addDays(addYears(lastUse, years), 1);
      // The backward calculation can clamp a leap day to 28 February.
      while (startOfWindow(clears) <= lastUse) clears = addDays(clears, 1);
      const fallback = es.values.pathwayYears20.value;
      return {
        status: 'FAIL',
        explanation:
          L(
            `${from} 以来领取过 ${names}，属 public funds。${pws ? `Protection Work and Study 的 ${es.values.protectionPathwayYearsWorkAndStudy.value} 年路径要求申请前 ${years} 年未使用 public funds，否则只能走 ${fallback} 年路径（p39）。` : `短于 ${fallback} 年的路径要求申请前 ${years} 年未使用 specified public funds。`}`,
            `Public funds received since ${from}: ${names}. ${pws ? `The ${es.values.protectionPathwayYearsWorkAndStudy.value}-year Protection Work and Study pathway requires no use of public funds in the ${years} years before applying; otherwise only the ${fallback}-year pathway is available (p39).` : `Pathways shorter than ${fallback} years require no use of specified public funds in the ${years} years before applying.`}`,
          ) +
          (ongoing
            ? ''
            : L(
                `若此后不再使用，自 ${clears} 起回看期内不再有 public funds，可按较短路径重新评估。`,
                ` If they are not used again, the lookback contains no public funds from ${clears}, and the shorter pathways can be reassessed.`,
              )) +
          ignoredNote,
        ...(pws && {
          sources: [
            { srcId: 'SRC-001', locator: 'p39' },
            { srcId: 'SRC-006', locator: '#benefits-open-to-new-claims' },
          ],
        }),
        assumptions: [
          ...assumptions,
          ...(pws
            ? [
                L(
                  '20 年按 p25 / p38 的"转入新路线重新起算"，自 Protection Work and Study 的合格期起点起算，不含此前的 Core Protection 时间（PD-066）。',
                  'Following the rule that the count restarts on moving to a new route (p25, p38), the 20 years count from the start of the qualifying period on Protection Work and Study, without earlier Core Protection time (PD-066).',
                ),
              ]
            : []),
        ],
      };
    }
    if (unlisted.length > 0) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `${namesOf(
            unlisted.map((b) => b.benefitType),
            L,
          )} 不在现行 public funds 指引的两张清单中，无法判断是否算 public funds。${ignoredNote}`,
          `Not on either list in the current public funds guidance: ${namesOf(
            unlisted.map((b) => b.benefitType),
            L,
          )}. Whether it counts as public funds cannot be determined.${ignoredNote}`,
        ),
        pendingDetails: ['PD-013'],
        assumptions,
      };
    }
    const principalUsed = principal?.timeline.benefits.some(
      (b) => overlapsWindow(b) && isPublicFund(b.benefitType),
    );
    if (principalUsed) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '本人未领取 public funds，但已录入的主申请人在回看期内领过。原文未说明家庭成员领取是否影响本人的定居（PD-014）。',
          'The recorded principal received public funds in the lookback period. The response does not say whether benefits received by a family member affect this applicant’s settlement (PD-014).',
        ),
        pendingDetails: ['PD-014'],
      };
    }
    const qualifyingRun = continuousRun(
      timeline,
      simulationDate,
      (e) =>
        groupsOf(esRouteOn(timeline, e.validFrom) ?? e.route).some(
          (group) => group !== 'NOT_COUNTING' && group !== 'OUTSIDE_FRAMEWORK',
        ),
      () => false,
    );
    if (
      !qualifyingRun.episodes.length ||
      qualifyingRun.episodes[0].validFrom > from
    ) {
      return {
        status: 'UNKNOWN',
        explanation:
          L(
            `申报记录没有覆盖自 ${from} 起的整个回看期。正文按申请日前 ${years} 年检查福利，案例 D 则要求连续在 qualifying route 上，具体口径尚待明确（PD-047）。`,
            `The recorded qualifying permissions do not cover the entire lookback from ${from}. The main text checks the ${years} years before applying, while Individual D calls for continuous time on a qualifying route. The precise requirement is still open (PD-047).`,
          ) + ignoredNote,
        pendingDetails: ['PD-047'],
        assumptions,
      };
    }
    return {
      status: 'PASS',
      explanation: L(
        `申请前 ${years} 年内未领取 public funds。${ignoredNote}`,
        `No public funds received in the ${years} years before applying.${ignoredNote}`,
      ),
      assumptions,
    };
  },
);

const inAnnexC = (e: ImmigrationEpisode) =>
  annexCOccupations.occupations.some((o) => o.socCode === e.socCode);

export const esPublicService = defineRule(
  {
    id: 'ES-PUBLIC-SERVICE',
    ruleSetId: RULE_SET,
    title: '公共服务职业满 5 年（5 年路径）',
    titleEn: `${es.values.pathwayYears5.value} years in public service occupations (${es.values.pathwayYears5.value}-year pathway)`,
    sources: [
      { srcId: 'SRC-001', locator: 'p16' },
      { srcId: 'SRC-001', locator: 'p46 fn 17' },
      ...annexCOccupations.sources,
    ],
    pendingDetails: ['PD-012'],
  },
  (ctx) => {
    const { timeline, simulationDate } = ctx;
    const L = textFor(ctx);
    const current = episodeOn(timeline, simulationDate);
    const years = es.values.pathwayYears5.value;
    if (!current || !inAnnexC(current)) {
      const completedService =
        current &&
        timeline.episodes.some((episode) => {
          if (!inAnnexC(episode) || episode.validFrom >= current.validFrom)
            return false;
          const beforeSwitch = addDays(current.validFrom, -1);
          const end =
            episode.validTo < beforeSwitch ? episode.validTo : beforeSwitch;
          const since = continuousRun(timeline, end, inAnnexC).episodes[0]
            ?.validFrom;
          return (
            since !== undefined && addYears(since, years) <= addDays(end, 1)
          );
        });
      if (completedService) {
        return {
          status: 'UNKNOWN',
          explanation: L(
            `曾连续从事 Annex C 公共服务职业满 ${years} 年，现已转出。原文未说明离开合格岗位后能否使用这条路径（PD-012）。`,
            `Completed ${years} continuous years in Annex C public service before leaving. The response does not say whether this pathway is available after leaving an eligible job (PD-012).`,
          ),
          pendingDetails: ['PD-012'],
        };
      }
      return {
        status: 'FAIL',
        explanation: L(
          '当前工作不在 Annex C 公共服务职业表中，不走这条 5 年路径。',
          'The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply.',
        ),
      };
    }
    const title = annexCOccupations.occupations.find(
      (o) => o.socCode === current.socCode,
    )?.title;
    const since = continuousRun(timeline, simulationDate, inAnnexC).episodes[0]
      .validFrom;
    if (addYears(since, years) <= simulationDate) {
      return {
        status: 'PASS',
        explanation: L(
          `自 ${since} 起连续从事 Annex C 公共服务职业（${title}），已满 ${years} 年。`,
          `In an Annex C public service occupation (${title}) continuously since ${since}: ${years} years completed.`,
        ),
      };
    }
    const residence = esQualifyingResidence(ctx);
    if (residence && since <= residence.start) {
      return {
        status: 'PASS',
        explanation: L(
          `整个合格期（自 ${residence.start} 起）都在 Annex C 公共服务职业（${title}），可走 5 年路径。`,
          `The whole qualifying period (since ${residence.start}) has been in an Annex C public service occupation (${title}): the 5-year pathway is available.`,
        ),
      };
    }
    return {
      status: 'UNKNOWN',
      explanation: L(
        `合格期中途才转入 Annex C 公共服务职业（${title}，自 ${since} 起），原文未说明换入合格职业前的年份如何计算。`,
        `Switched into an Annex C public service occupation (${title}, since ${since}) partway through the qualifying period; the response does not say how the years before the switch count.`,
      ),
      pendingDetails: ['PD-012'],
    };
  },
);
