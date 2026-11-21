import {
  breachTypeNames,
  earnedSettlement2026_11 as es,
} from '@uk-immigration/policy-data';
import { fullYears } from '../dates';
import { episodeOn } from '../residence';
import { defineRule, nameIn, textFor } from '../rule';
import {
  esProtectionRouteOn,
  esRouteOn,
  legacyUkrsArrival,
  outsideFrameworkRequirementDetails,
  outsideFrameworkRequirementsText,
  ukrsRefugeeOn,
} from './es-residence';
import type { Lang } from '../rule';
import type { CefrLevel } from '@uk-immigration/policy-data';
import type { IsoDate, PersonTimeline } from '../types';

// Mandatory requirements that apply to every Earned Settlement pathway
// (SRC-001 p8–p9, p46 "All mandatory requirements apply to all settlement
// pathways").

const RULE_SET = 'earned-settlement-2026-11';

// SRC-001 p41 and SRC-037, 39721 Answer ¶2 (PD-004).
export const historicalEventsAssumption = (
  L: Lang,
  event: 'breach' | 'publicFunds',
) =>
  event === 'breach'
    ? L(
        '按决定日规则整体回看，假设实施前的违规也按新规则计入；违规是否追溯仍待确认（SRC-001 p41、SRC-037 答复第 2 段、PD-004）。',
        'The scenario applies the rules as at the decision date and assumes breaches before implementation are counted under the new rules. Retroactive treatment remains unsettled (SRC-001 p41, SRC-037 answer paragraph 2, PD-004).',
      )
    : L(
        '按决定日规则整体回看，假设实施前领取的 public funds 也纳入回看期；是否追溯仍待确认（SRC-001 p41、SRC-037 答复第 2 段、PD-004）。',
        'The scenario applies the rules as at the decision date and assumes public funds received before implementation count in the lookback. Retroactive treatment remains unsettled (SRC-001 p41, SRC-037 answer paragraph 2, PD-004).',
      );

export function isAdultOn(timeline: PersonTimeline, date: IsoDate): boolean {
  return fullYears(timeline.dateOfBirth, date) >= es.values.adultAge.value;
}

/** Under 18 or 65 and over: exempt from earnings, English and Life in the UK. */
export function ageExemptOn(timeline: PersonTimeline, date: IsoDate): boolean {
  const age = fullYears(timeline.dateOfBirth, date);
  return age < es.values.adultAge.value || age >= es.values.exemptionAge.value;
}

export const childDependantAssumption = (L: Lang) =>
  L(
    '当前以父母的 dependant 身份持证，即视为"保留 child-dependant 身份"（retain child-dependant status）；原文未说明认定标准（PD-059）。',
    'Current permission as a parent’s dependant is treated as retaining child-dependant status; the response does not say how this is determined (PD-059).',
  );

/** Current permission is as the principal's child (SRC-001 p29–p30). */
export function childDependantOn(
  timeline: PersonTimeline,
  date: IsoDate,
): boolean {
  const episode = episodeOn(timeline, date);
  return episode?.role === 'DEPENDANT' && episode.dependantOf === 'PARENT';
}

const CEFR_ORDER: readonly string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function meetsCefr(level: CefrLevel, required: string): boolean {
  return CEFR_ORDER.indexOf(level) >= CEFR_ORDER.indexOf(required);
}

export const esHighestTalent = defineRule(
  {
    id: 'ES-HIGHEST-TALENT',
    ruleSetId: RULE_SET,
    title: 'Highest Talent Group 资格',
    titleEn: 'Highest Talent Group eligibility',
    sources: [
      { srcId: 'SRC-001', locator: 'p23 note 10; p46 Table 1 note 16' },
    ],
    pendingDetails: ['PD-011'],
  },
  (ctx) => ({
    status: 'UNKNOWN',
    explanation: textFor(ctx)(
      'Table 1 将 Highest Talent Group 列为三年路径的独立入口。资格标准仍待 MAC 报告审查，持 high talent permission 本身不足以确认资格。',
      'Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility.',
    ),
    pendingDetails: ['PD-011'],
  }),
);

export const esCriminality = defineRule(
  {
    id: 'ES-CRIMINALITY',
    ruleSetId: RULE_SET,
    title: '无犯罪记录',
    titleEn: 'No criminal record',
    sources: [{ srcId: 'SRC-001', locator: 'p12' }],
    pendingDetails: ['PD-017', 'PD-027', 'PD-028'],
  },
  (ctx) => {
    const { timeline, simulationDate } = ctx;
    const L = textFor(ctx);
    const route = esRouteOn(timeline, simulationDate);
    const detail = outsideFrameworkRequirementDetails(route);
    if (detail) {
      return {
        status: 'UNKNOWN',
        explanation: outsideFrameworkRequirementsText(route, L),
        sources: [
          { srcId: 'SRC-001', locator: 'p12, No criminality requirement' },
          {
            srcId: 'SRC-001',
            locator: 'p25–p26, Which routes are outside the framework',
          },
          ...(detail === 'PD-051'
            ? [{ srcId: 'SRC-001', locator: 'p34, Bereaved partners' }]
            : []),
        ],
        pendingDetails: [detail === 'PD-051' ? 'PD-027' : detail],
      };
    }
    const events = timeline.criminalRecord;
    if (events.length === 0) {
      return {
        status: 'PASS',
        explanation: L('未申报犯罪记录。', 'No criminal record declared.'),
      };
    }
    if (events.some((e) => isAdultOn(timeline, e.date))) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '申报了成年后的犯罪记录。记录发生的司法辖区及海外定罪对应的行为在英国是否构成犯罪尚不明确，需由受监管顾问判断。',
          'An adult criminal record was declared. The jurisdiction and whether the conduct behind any overseas conviction is an offence in the UK are unknown and need a regulated adviser’s assessment.',
        ),
        pendingDetails: ['PD-017'],
      };
    }
    return {
      status: 'UNKNOWN',
      explanation: L(
        `申报的犯罪记录都发生在 ${es.values.adultAge.value} 岁以前。原文对未成年时的犯罪保留酌情拒绝的空间，需由受监管顾问判断。`,
        `Every declared criminal record is from before age ${es.values.adultAge.value}. The response leaves room for discretionary refusal for offences committed as a minor; this needs a regulated adviser’s assessment.`,
      ),
      pendingDetails: ['PD-017'],
    };
  },
);

export const esDebt = defineRule(
  {
    id: 'ES-DEBT',
    ruleSetId: RULE_SET,
    title: '无未清偿的政府债务',
    titleEn: 'No outstanding government debt',
    sources: [
      { srcId: 'SRC-001', locator: 'p12' },
      { srcId: 'SRC-001', locator: 'p29' },
    ],
    pendingDetails: ['PD-018'],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    if (
      childDependantOn(timeline, simulationDate) &&
      !isAdultOn(timeline, simulationDate)
    ) {
      return {
        status: 'PASS',
        explanation: L(
          `申请日未满 ${es.values.adultAge.value} 岁的 child dependant 豁免政府债务要求。`,
          `A child dependant under ${es.values.adultAge.value} on the date of application is exempt from the government debt requirement.`,
        ),
        sources: [{ srcId: 'SRC-001', locator: 'p29' }],
      };
    }
    if (!timeline.governmentDebt) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写是否有欠政府的债务（NHS 债务、税款与 National Insurance 欠款、欠 Home Office 的诉讼费用等）。',
          'Government debt not provided (NHS debt, unpaid tax and National Insurance, litigation costs owed to the Home Office and similar).',
        ),
      };
    }
    if (timeline.governmentDebt.outstanding) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '申报有未清偿的政府债务。申报未区分债务类别或还款计划。列明的未清偿债务会影响定居，其他债务及非 asylum support 债务按计划偿还时的处理仍待确认。须偿还的 asylum support 有单独的还款规定。',
          'Outstanding government debt was declared. The declaration does not distinguish debt types or repayment plans. Listed unpaid debts affect settlement, and treatment of other debts or repayment plans for debt other than asylum support remains unsettled. Repayable asylum support has separate repayment rules.',
        ),
        sources: [
          {
            srcId: 'SRC-001',
            locator: 'p12 and note 4, No government debt requirement',
          },
          { srcId: 'SRC-001', locator: 'p8 note 1; p39, No debt' },
        ],
        pendingDetails: ['PD-018'],
      };
    }
    return {
      status: 'PASS',
      explanation: L(
        '申报无未清偿的政府债务。',
        'No outstanding government debt declared.',
      ),
      assumptions: [
        L(
          '"无政府债务"按用户申报判断；正在按还款计划偿还的非 asylum support 债务是否满足要求，原文未说明（PD-018）。',
          '“No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).',
        ),
      ],
    };
  },
);

export const esEnglishB2 = defineRule(
  {
    id: 'ES-ENGLISH-B2',
    ruleSetId: RULE_SET,
    title: `定居英语要求（${es.values.settlementEnglishLevel.value}；UKRS 难民 ${es.values.ukrsEnglishLevel.value}）`,
    titleEn: `English for settlement (${es.values.settlementEnglishLevel.value}; ${es.values.ukrsEnglishLevel.value} for UK Resettlement Scheme refugees)`,
    sources: [{ srcId: 'SRC-001', locator: 'p21' }],
    pendingDetails: ['PD-019', 'PD-027', 'PD-028', 'PD-045', 'PD-051'],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    const ukrs = ukrsRefugeeOn(timeline, simulationDate);
    const required = ukrs
      ? es.values.ukrsEnglishLevel.value
      : es.values.settlementEnglishLevel.value;
    // UK Resettlement Scheme refugees need A2 (p21 note 7, p37, p39, p47).
    const ukrsSources = ukrs
      ? {
          sources: [
            { srcId: 'SRC-001', locator: 'p21' },
            { srcId: 'SRC-001', locator: 'p37' },
            { srcId: 'SRC-001', locator: 'p39' },
            { srcId: 'SRC-001', locator: 'p47' },
          ],
        }
      : {};
    const ukrsNote = ukrs
      ? L(
          `经 UK Resettlement Scheme 入境的难民只需 ${required}（p37、p39）。`,
          ` Refugees admitted through the UK Resettlement Scheme need ${required} only (p37, p39).`,
        )
      : '';
    if (ageExemptOn(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          `申请日未满 ${es.values.adultAge.value} 岁或已满 ${es.values.exemptionAge.value} 岁，豁免英语要求。`,
          `Under ${es.values.adultAge.value} or aged ${es.values.exemptionAge.value} or over on the date of application: exempt from the English requirement.`,
        ),
      };
    }
    const arrival = legacyUkrsArrival(timeline, simulationDate);
    if (arrival) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `${arrival} 经 UK Resettlement Scheme 抵达，属 Legacy Safe and Legal Routes。框架外群体一般须达 ${es.values.settlementEnglishLevel.value}，第 7 章又说 UK Resettlement Scheme 难民只需 ${es.values.ukrsEnglishLevel.value}，原文不一致。`,
          `Arrived through the UK Resettlement Scheme on ${arrival}, so on the Legacy Safe and Legal Routes. Groups outside the framework generally need ${es.values.settlementEnglishLevel.value}, while Chapter 7 says UK Resettlement Scheme refugees need ${es.values.ukrsEnglishLevel.value} only; the response is inconsistent.`,
        ),
        sources: [
          { srcId: 'SRC-001', locator: 'p25' },
          { srcId: 'SRC-001', locator: 'p26' },
          { srcId: 'SRC-001', locator: 'p37' },
          { srcId: 'SRC-001', locator: 'p39' },
        ],
        pendingDetails: ['PD-045'],
      };
    }
    const route = esRouteOn(timeline, simulationDate);
    const detail = outsideFrameworkRequirementDetails(route);
    const english = timeline.english;
    const schemeMissing =
      route === 'SAFE_AND_LEGAL' &&
      !episodeOn(timeline, simulationDate)?.resettlementScheme;
    if (detail && !(english && 'exempt' in english)) {
      return {
        status: 'UNKNOWN',
        explanation: outsideFrameworkRequirementsText(route, L),
        sources: [
          {
            srcId: 'SRC-001',
            locator: 'p25–p26, Which routes are outside the framework',
          },
          ...(detail === 'PD-051'
            ? [{ srcId: 'SRC-001', locator: 'p34, Bereaved partners' }]
            : []),
        ],
        pendingDetails: [detail],
      };
    }
    if (!english) {
      return {
        status: 'UNKNOWN',
        explanation: schemeMissing
          ? L(
              '请补充英语水平和安置计划。经 UK Resettlement Scheme 入境适用较低的英语等级。',
              'Provide the English level and resettlement scheme. The UK Resettlement Scheme uses a lower English standard.',
            )
          : L(
              `未填写英语水平。Earned Settlement 要求 CEFR ${required}（现有豁免保留）。${ukrsNote}`,
              `English level not provided. Earned Settlement requires CEFR ${required} (existing exemptions are retained).${ukrsNote}`,
            ),
        ...(schemeMissing
          ? {
              sources: [{ srcId: 'SRC-001', locator: 'p39, English language' }],
            }
          : ukrsSources),
      };
    }
    if ('exempt' in english) {
      return {
        status: 'PASS',
        explanation: L(
          '申报因身心状况豁免英语要求。',
          'Exempt from the English requirement because of a physical or mental condition, as declared.',
        ),
        assumptions: [
          L(
            '身心状况豁免按用户申报，未核实认定标准。',
            'The physical or mental condition exemption is taken as declared; the criteria are not checked.',
          ),
        ],
      };
    }
    if (
      schemeMissing &&
      meetsCefr(english.cefrLevel, es.values.ukrsEnglishLevel.value) &&
      !meetsCefr(english.cefrLevel, required)
    ) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `英语 ${english.cefrLevel} 达到英国安置计划（UKRS）的 ${es.values.ukrsEnglishLevel.value} 要求，其他指定 Safe and Legal 路线要求 ${required}。请补充安置计划。`,
          `English at ${english.cefrLevel} meets the ${es.values.ukrsEnglishLevel.value} standard for the UK Resettlement Scheme. Other designated Safe and Legal routes require ${required}. Provide the resettlement scheme to assess this requirement.`,
        ),
        sources: [{ srcId: 'SRC-001', locator: 'p39, English language' }],
      };
    }
    return meetsCefr(english.cefrLevel, required)
      ? {
          status: 'PASS',
          explanation: L(
            `英语 ${english.cefrLevel}，达到 ${required}。${ukrsNote}`,
            `English at ${english.cefrLevel}, which meets ${required}.${ukrsNote}`,
          ),
          ...ukrsSources,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `英语 ${english.cefrLevel}，低于 Earned Settlement 要求的 ${required}。这是强制要求，不能用收入或其他贡献抵消。${ukrsNote}`,
            `English at ${english.cefrLevel}, below the ${required} required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions.${ukrsNote}`,
          ),
          ...ukrsSources,
        };
  },
);

export const esKol = defineRule(
  {
    id: 'ES-KOL',
    ruleSetId: RULE_SET,
    title: '通过 Life in the UK 考试',
    titleEn: 'Pass the Life in the UK test',
    sources: [{ srcId: 'SRC-001', locator: 'p21' }],
    pendingDetails: ['PD-020', 'PD-021'],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    if (ageExemptOn(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          `申请日未满 ${es.values.adultAge.value} 岁或已满 ${es.values.exemptionAge.value} 岁，豁免 Life in the UK 考试。`,
          `Under ${es.values.adultAge.value} or aged ${es.values.exemptionAge.value} or over on the date of application: exempt from the Life in the UK test.`,
        ),
      };
    }
    if (ukrsRefugeeOn(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '经 UK Resettlement Scheme 入境的难民在出现适合 A2 水平的考试版本前，暂免 Life in the UK 考试（p21 注 8、p39）。',
          'Refugees admitted through the UK Resettlement Scheme are exempt from the Life in the UK test until a version suitable for A2 English is available (p21 note 8, p39).',
        ),
        sources: [
          { srcId: 'SRC-001', locator: 'p21' },
          { srcId: 'SRC-001', locator: 'p39' },
        ],
        assumptions: [
          L(
            'A2 版 Life in the UK 考试推出后，这一豁免可能改变；推出时间未公布（PD-021）。',
            'This exemption may change once an A2 version of the Life in the UK test is available; no date has been given (PD-021).',
          ),
        ],
      };
    }
    const kol = timeline.lifeInTheUk;
    if (!kol) {
      if (
        esRouteOn(timeline, simulationDate) === 'SAFE_AND_LEGAL' &&
        !episodeOn(timeline, simulationDate)?.resettlementScheme
      ) {
        return {
          status: 'UNKNOWN',
          explanation: L(
            '请补充安置计划或是否已通过 Life in the UK 考试。经 UK Resettlement Scheme 入境的难民在适用的考试版本推出前暂免考试。',
            'Provide the resettlement scheme or whether the Life in the UK test has been passed. Refugees admitted through the UK Resettlement Scheme are exempt until a suitable version is available.',
          ),
          sources: [
            { srcId: 'SRC-001', locator: 'p21 note 8; p39, English language' },
          ],
        };
      }
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写是否已通过 Life in the UK 考试。',
          'You haven’t indicated whether you passed the Life in the UK test.',
        ),
      };
    }
    return 'exempt' in kol
      ? {
          status: 'PASS',
          explanation: L(
            '申报因身心状况豁免 Life in the UK 考试。',
            'Exempt from the Life in the UK test because of a physical or mental condition, as declared.',
          ),
          assumptions: [
            L(
              '身心状况豁免按用户申报，未核实认定标准。',
              'The physical or mental condition exemption is taken as declared; the criteria are not checked.',
            ),
          ],
        }
      : {
          status: 'PASS',
          explanation: L(
            '已通过 Life in the UK 考试。',
            'Passed the Life in the UK test.',
          ),
        };
  },
);

/** Adult illegal entry, which short-circuits (PD-044). */
export function adultIllegalEntry(timeline: PersonTimeline): boolean {
  return timeline.immigrationBreaches.some(
    (b) => b.type === 'ILLEGAL_ENTRY' && isAdultOn(timeline, b.date),
  );
}

export const esBreach = defineRule(
  {
    id: 'ES-BREACH',
    ruleSetId: RULE_SET,
    title: '成年后无 qualifying immigration breach',
    titleEn: 'No qualifying immigration breach as an adult',
    sources: [{ srcId: 'SRC-001', locator: 'p13' }],
    pendingDetails: ['PD-004', 'PD-015', 'PD-016', 'PD-044', 'PD-065'],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    // On a protection route illegal entry adds 10 years instead
    // (ES-PROTECTION-PATHWAY, Table 2 p48), so it is not a breach here.
    const protection = esProtectionRouteOn(timeline, simulationDate);
    const adult = timeline.immigrationBreaches.filter(
      (b) =>
        isAdultOn(timeline, b.date) &&
        !(protection && b.type === 'ILLEGAL_ENTRY'),
    );
    const minorNote = timeline.immigrationBreaches.some(
      (b) => !isAdultOn(timeline, b.date),
    )
      ? L(
          `未满 ${es.values.adultAge.value} 岁时的违规不计入（p13）。`,
          ` Breaches before age ${es.values.adultAge.value} do not count (p13).`,
        )
      : '';
    const illegalNote =
      protection && adultIllegalEntry(timeline)
        ? L(
            '成年后非法入境在保护类路线上按 Table 2 额外加 10 年，见"难民定居路径与年限"，不在此计入。',
            ' On a protection route illegal entry as an adult adds 10 years under Table 2 (see the refugee settlement pathway) and is not counted here.',
          )
        : '';
    if (adultIllegalEntry(timeline) && !protection) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `成年后非法入境。第 1 章暗示进入 20 年路径，第 7 章又说无论走哪条路线都额外加 10 年，原文不一致，需由受监管顾问判断。${minorNote}`,
          `Illegal entry as an adult. Chapter 1 implies the 20-year pathway, while Chapter 7 says an extra 10 years is added whatever the route; the response is inconsistent, and this needs a regulated adviser’s assessment.${minorNote}`,
        ),
        pendingDetails: ['PD-044'],
      };
    }
    if (adult.length > 0) {
      const types = [...new Set(adult.map((b) => b.type))].map((t) =>
        nameIn(L, breachTypeNames[t]),
      );
      return {
        status: 'FAIL',
        explanation: L(
          `成年后有 qualifying immigration breach（${types.join('、')}）。按计入实施前违规的假设，不论收入多高都进入 20 年路径。${minorNote}${illegalNote}`,
          `Qualifying immigration breach as an adult (${types.join(', ')}). Assuming pre-implementation breaches count, the 20-year pathway applies however high the earnings.${minorNote}${illegalNote}`,
        ),
        assumptions: [
          historicalEventsAssumption(L, 'breach'),
          L(
            '20 年按在 qualifying route 上的连续居留计算，违规不设时效（PD-016）。',
            'The 20 years count continuous residence on a qualifying route; breaches do not expire (PD-016).',
          ),
          ...(protection
            ? [
                L(
                  'Table 2 只规定非法入境的后果；其他 qualifying breach 按第 1 章与 Table 1"所有路径适用"进入 20 年路径（叠加非法入境的 10 年），自当前保护类路线的合格期起点起算（PD-065）。',
                  'Table 2 only sets out the consequence of illegal entry; other qualifying breaches lead to the 20-year pathway under Chapter 1 and Table 1 (“apply to all”), plus 10 years for any illegal entry, counted from the start of the qualifying period on the current protection route (PD-065).',
                ),
              ]
            : []),
        ],
      };
    }
    return {
      status: 'PASS',
      explanation: L(
        `成年后无 qualifying immigration breach。${minorNote}${illegalNote}`,
        `No qualifying immigration breach as an adult.${minorNote}${illegalNote}`,
      ),
    };
  },
);
