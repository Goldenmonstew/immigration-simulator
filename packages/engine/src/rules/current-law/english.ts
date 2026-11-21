import {
  currentLaw2026_11 as cl,
  settlementEnglishNationalities,
} from '@uk-immigration/policy-data';
import { addYears, fullYears } from '../../dates';
import { continuousRun, episodeOn } from '../../residence';
import { defineRule, textFor } from '../../rule';
import { meetsCefr } from '../es-requirements';
import type {
  ImmigrationEpisode,
  IsoDate,
  PersonTimeline,
  RuleContext,
  RuleResult,
} from '../../types';
import {
  RULE_SET,
  globalTalentDependant,
  onFamilyChild,
  onFamilyPartnerFiveYear,
  onFamilyPartnerTenYear,
  onGlobalTalent,
  onInnovatorFounder,
  onPrivateLife,
  onProtection,
  onSkilledWorker,
  onSkilledWorkerChild,
  onSkilledWorkerPartner,
  onUkAncestry,
} from './shared';
import { onFiveYearFamilyChild } from './family';

/** Exempt from the settlement English requirement by age on `date` (EL 1.1). */
export function ageExempt(timeline: PersonTimeline, date: IsoDate): boolean {
  const age = fullYears(timeline.dateOfBirth, date);
  return (
    age < cl.values.settlementMinorAge.value ||
    age >= cl.values.settlementExemptionAge.value
  );
}

type SettlementLanguageRoute = 'LONG_RESIDENCE' | 'UK_ANCESTRY';
type Verdict = Omit<RuleResult, 'sources'>;

function nationalityMeetsEnglish(timeline: PersonTimeline): boolean {
  return settlementEnglishNationalities.includes(timeline.nationality);
}

/** EL 1.1(d), KOL 1.1(d), or for Appendix KoLL cases, KoLL 3.2/4.14. */
function fifteenYearException(
  ctx: RuleContext,
  applicationDate: IsoDate,
  override?: SettlementLanguageRoute,
): Verdict | undefined {
  if (override) return undefined;
  const { timeline, simulationDate } = ctx;
  const L = textFor(ctx);
  const fiveYearPartner = onFamilyPartnerFiveYear(timeline, simulationDate);
  const fiveYearChild = onFiveYearFamilyChild(ctx);
  const koll = fiveYearPartner || fiveYearChild;
  const current = episodeOn(timeline, simulationDate);
  const elApplicant =
    onFamilyPartnerTenYear(timeline, simulationDate) ||
    onFamilyChild(timeline, simulationDate) ||
    onSkilledWorkerPartner(timeline, simulationDate) ||
    onSkilledWorkerChild(timeline, simulationDate) ||
    globalTalentDependant(timeline, simulationDate) !== undefined ||
    (current?.route === 'HONG_KONG_BNO' &&
      current.role === 'DEPENDANT' &&
      (current.dependantOf === 'PARTNER' || current.dependantOf === 'PARENT'));
  if (
    koll
      ? nationalityMeetsEnglish(timeline)
      : !elApplicant ||
        applicationDate <=
          addYears(timeline.dateOfBirth, cl.values.settlementMinorAge.value)
  )
    return undefined;

  const counts = (e: ImmigrationEpisode) =>
    !koll ||
    (e.route === 'FAMILY_PARTNER_OR_PARENT' &&
      (fiveYearPartner
        ? e.role === 'MAIN' &&
          (e.familyPermission === 'PARTNER_FIVE_YEAR' ||
            e.familyPermission === 'PARTNER_TEN_YEAR')
        : e.role === 'DEPENDANT' && e.dependantOf === 'PARENT'));
  if (!current || !counts(current)) return undefined;
  const first = continuousRun(timeline, simulationDate, counts).episodes[0];
  const years = cl.values.settlementEnglishExceptionYears.value;
  if (applicationDate < addYears(first.validFrom, years)) return undefined;

  const { applicationsFrom, cefrLevel } =
    cl.values.familyPartnerSettlementEnglish.value;
  const level =
    applicationDate >= applicationsFrom
      ? cefrLevel
      : cl.values.familyPartnerSettlementEnglishBefore.value;
  const evidence = timeline.englishFifteenYearException;
  const basis = koll ? 'KoLL 3.2, 4.14' : 'EL 1.1(d), KOL 1.1(d)';
  if (
    evidence?.applicationDate === applicationDate &&
    evidence.teacherAssessedAgainst === level
  ) {
    return {
      status: 'PASS',
      explanation: L(
        `按已确认的合格居留、语言资格和教师证明，适用 ${years} 年例外（${basis}）。`,
        `The confirmed qualifying residence, language qualification and teacher evidence support the ${years}-year exception (${basis}).`,
      ),
    };
  }
  return {
    status: 'UNKNOWN',
    explanation: L(
      `可能适用 ${years} 年例外。请确认合格在英居留、A2 口语及听力资格，并按申请日核对合格教师出具的 ${level} 评估及指导学时证明（${basis}）。`,
      `The ${years}-year exception may apply. Confirm qualifying residence in the UK, the A2 speaking and listening qualification and evidence from a qualified teacher covering guided learning and the ${level} standard on the date of application (${basis}).`,
    ),
  };
}

export const clEnglish = defineRule(
  {
    id: 'CL-ENGLISH',
    ruleSetId: RULE_SET,
    title: '定居英语要求',
    titleEn: 'Settlement English requirement',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 22A.1' },
      { srcId: 'SRC-004', locator: 'SW 44.1' },
      { srcId: 'SRC-007', locator: 'p24, APP SW5' },
      { srcId: 'SRC-007', locator: 'pp24–25, APP SW8' },
      { srcId: 'SRC-005', locator: 'LR 13.1' },
      { srcId: 'SRC-020', locator: 'HK 60.1' },
      { srcId: 'SRC-021', locator: 'GT 13.1' },
      { srcId: 'SRC-021', locator: 'GT 32.1' },
      { srcId: 'SRC-022', locator: 'SETF 5.1' },
      { srcId: 'SRC-022', locator: 'SETF 15.1' },
      { srcId: 'SRC-024', locator: 'E-ILRP.1.6' },
      { srcId: 'SRC-025', locator: 'KoLL 2.2' },
      { srcId: 'SRC-025', locator: 'KoLL 3.1' },
      { srcId: 'SRC-029', locator: 'para 298(vii)' },
      { srcId: 'SRC-026', locator: 'UKA 15.1' },
      { srcId: 'SRC-028', locator: 'PL 16.1' },
      { srcId: 'SRC-007', locator: 'EM 5.60' },
      { srcId: 'SRC-014', locator: 'EL 1.1, EL 4.1' },
      { srcId: 'SRC-025', locator: 'KoLL 3.2, 4.8–4.10, 4.14' },
    ],
    pendingDetails: ['PD-072'],
  },
  settlementEnglish,
);

export function settlementEnglish(
  ctx: RuleContext,
  applicationDate = ctx.simulationDate,
  override?: SettlementLanguageRoute,
): Verdict {
  const { timeline, simulationDate } = ctx;
  const L = textFor(ctx);
  if (ageExempt(timeline, applicationDate)) {
    return {
      status: 'PASS',
      explanation: L(
        `申请日未满 ${cl.values.settlementMinorAge.value} 岁或已满 ${cl.values.settlementExemptionAge.value} 岁，豁免英语要求。`,
        `Under ${cl.values.settlementMinorAge.value} or aged ${cl.values.settlementExemptionAge.value} or over on the date of application: exempt from the English requirement.`,
      ),
    };
  }
  // Every Hong Kong BN(O) applicant (HK 60.1); GT dependants (GT 32.1) and
  // the child of a 10-year partner (SETF 15.1) have their own paragraphs.
  const hk = episodeOn(timeline, simulationDate)?.route === 'HONG_KONG_BNO';
  const gt = onGlobalTalent(timeline, simulationDate);
  const gtDependant =
    globalTalentDependant(timeline, simulationDate) !== undefined;
  const familyChild = onFamilyChild(timeline, simulationDate);
  const familyTen = onFamilyPartnerTenYear(timeline, simulationDate);
  const familyFive = onFamilyPartnerFiveYear(timeline, simulationDate);
  const family = familyTen || familyFive;
  const protection = onProtection(timeline, simulationDate);
  const ancestry = onUkAncestry(timeline, simulationDate);
  const innovator = onInnovatorFounder(timeline, simulationDate);
  const privateLife = onPrivateLife(timeline, simulationDate);
  const sw = onSkilledWorker(timeline, simulationDate);
  // SW 44.1 covers a dependent partner and a dependent child.
  const partner =
    onSkilledWorkerPartner(timeline, simulationDate) ||
    onSkilledWorkerChild(timeline, simulationDate);
  const b2 =
    override === 'LONG_RESIDENCE'
      ? cl.values.longResidenceSettlementEnglish.value
      : override === 'UK_ANCESTRY'
        ? cl.values.ukAncestrySettlementEnglish.value
        : gt || gtDependant
          ? cl.values.globalTalentSettlementEnglish.value
          : ancestry
            ? cl.values.ukAncestrySettlementEnglish.value
            : privateLife
              ? cl.values.privateLifeSettlementEnglish.value
              : family || familyChild
                ? cl.values.familyPartnerSettlementEnglish.value
                : sw
                  ? cl.values.skilledWorkerSettlementEnglish.value
                  : partner
                    ? cl.values.skilledWorkerDependantSettlementEnglish.value
                    : cl.values.longResidenceSettlementEnglish.value;
  const fromB2 = applicationDate >= b2.applicationsFrom;
  const required = override
    ? fromB2
      ? b2.cefrLevel
      : override === 'UK_ANCESTRY'
        ? cl.values.ukAncestrySettlementEnglishBefore.value
        : cl.values.longResidenceSettlementEnglishBefore.value
    : hk
      ? cl.values.hongKongBnoSettlementEnglish.value
      : fromB2
        ? b2.cefrLevel
        : sw
          ? undefined
          : gt || gtDependant
            ? cl.values.globalTalentSettlementEnglishBefore.value
            : ancestry
              ? cl.values.ukAncestrySettlementEnglishBefore.value
              : privateLife
                ? cl.values.privateLifeSettlementEnglishBefore.value
                : family || familyChild
                  ? cl.values.familyPartnerSettlementEnglishBefore.value
                  : partner
                    ? cl.values.skilledWorkerDependantSettlementEnglishBefore
                        .value
                    : cl.values.longResidenceSettlementEnglishBefore.value;
  // Which paragraph sets the level, for the new routes' explanations.
  const basis = override
    ? ` (${override === 'UK_ANCESTRY' ? 'UKA 15.1' : 'LR 13.1'}(${fromB2 ? 'b' : 'a'}))`
    : hk
      ? L(
          '（Appendix Hong Kong BN(O) HK 60.1；HC 1691 的 B2 未覆盖该 Appendix，EM 5.60）',
          ' (Appendix Hong Kong BN(O) HK 60.1; the B2 introduced by HC 1691 does not cover this Appendix, EM 5.60)',
        )
      : gtDependant
        ? L(
            `（Appendix Global Talent GT 32.1(${fromB2 ? 'b' : 'a'})，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
            ` (Appendix Global Talent GT 32.1(${fromB2 ? 'b' : 'a'}), applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
          )
        : familyChild
          ? onFiveYearFamilyChild(ctx)
            ? L(
                `（Immigration Rules Part 8 第 298(vii) 段、Appendix KoLL 2.2，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                ` (paragraph 298(vii) of Part 8 of the Immigration Rules, Appendix KoLL 2.2; applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
              )
            : L(
                `（Appendix Settlement Family Life SETF 15.1(${fromB2 ? 'b' : 'a'})，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                ` (Appendix Settlement Family Life SETF 15.1(${fromB2 ? 'b' : 'a'}), applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
              )
          : gt
            ? L(
                `（Appendix Global Talent GT 13.1(${fromB2 ? 'b' : 'a'})，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                ` (Appendix Global Talent GT 13.1(${fromB2 ? 'b' : 'a'}), applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
              )
            : privateLife
              ? L(
                  `（Appendix Private Life PL 16.1(${fromB2 ? 'b' : 'a'})，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                  ` (Appendix Private Life PL 16.1(${fromB2 ? 'b' : 'a'}), applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
                )
              : ancestry
                ? L(
                    `（Appendix UK Ancestry UKA 15.1(${fromB2 ? 'b' : 'a'})，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                    ` (Appendix UK Ancestry UKA 15.1(${fromB2 ? 'b' : 'a'}), applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
                  )
                : familyTen
                  ? L(
                      `（Appendix Settlement Family Life SETF 5.1(${fromB2 ? 'b' : 'a'})，${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                      ` (Appendix Settlement Family Life SETF 5.1(${fromB2 ? 'b' : 'a'}), applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
                    )
                  : familyFive
                    ? L(
                        `（Appendix KoLL 2.2，经 E-ILRP.1.6；${b2.applicationsFrom} ${fromB2 ? '起' : '前'}的申请）`,
                        ` (Appendix KoLL 2.2, through E-ILRP.1.6; applications ${fromB2 ? 'from' : 'before'} ${b2.applicationsFrom})`,
                      )
                    : protection
                      ? L(
                          '（Appendix Settlement Protection 未对定居设英语要求，此等级只适用于 Long Residence 10 年路径，PD-072）',
                          ' (Appendix Settlement Protection sets no English requirement for settlement; this level applies only to the 10-year Long Residence pathway, PD-072)',
                        )
                      : innovator
                        ? L(
                            '（Appendix Innovator Founder 未对主申请人定居设英语要求，INNF 15.1–21.6；此等级只适用于 Long Residence 10 年路径）',
                            ' (Appendix Innovator Founder sets no English requirement for a main applicant’s settlement, INNF 15.1–21.6; this level applies only to the 10-year Long Residence pathway)',
                          )
                        : '';
  if (!required) {
    return {
      status: 'PASS',
      explanation: L(
        `申请日早于 ${b2.applicationsFrom}，Appendix Skilled Worker 未对定居另设英语要求（SW 22A.1 的 ${b2.cefrLevel} 只适用于此后的申请）。`,
        `The application date is before ${b2.applicationsFrom}, and Appendix Skilled Worker sets no separate English requirement for settlement (the ${b2.cefrLevel} in SW 22A.1 applies only to later applications).`,
      ),
    };
  }
  const english = timeline.english;
  if (nationalityMeetsEnglish(timeline)) {
    const koll =
      !override && (familyFive || (familyChild && onFiveYearFamilyChild(ctx)));
    const source = koll ? 'KoLL 2.2(a)(i), 4.8–4.10' : 'EL 4.1';
    return {
      status: 'PASS',
      explanation: L(
        `申报的国籍 ${timeline.nationality} 可满足英语要求（${source}）。`,
        `The declared nationality ${timeline.nationality} satisfies the English requirement (${source}).`,
      ),
      assumptions: [
        L(
          '假设可提交有效的护照、旅行证件或规则接受的其他国籍证明。',
          'Assumes a valid passport, travel document or other proof of nationality accepted under the rules can be provided.',
        ),
      ],
    };
  }
  const exception = fifteenYearException(ctx, applicationDate, override);
  if (!english) {
    if (exception) return exception;
    return {
      status: 'UNKNOWN',
      explanation: L(
        `未填写英语水平；定居要求 CEFR ${required}${basis}。`,
        `English level not provided; settlement requires CEFR ${required}${basis}.`,
      ),
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
  return meetsCefr(english.cefrLevel, required)
    ? {
        status: 'PASS',
        explanation: L(
          `英语 ${english.cefrLevel}，达到定居要求的 ${required}${basis}。`,
          `English at ${english.cefrLevel}, which meets the ${required} required for settlement${basis}.`,
        ),
      }
    : (exception ?? {
        status: 'FAIL',
        explanation: L(
          `英语 ${english.cefrLevel}，低于定居要求的 ${required}${basis || (required === b2.cefrLevel ? `（${b2.applicationsFrom} 起的申请）` : '')}。`,
          `English at ${english.cefrLevel}, below the ${required} required for settlement${basis || (required === b2.cefrLevel ? ` (applications from ${b2.applicationsFrom})` : '')}.`,
        ),
      });
}

export const clKol = defineRule(
  {
    id: 'CL-KOL',
    ruleSetId: RULE_SET,
    title: '通过 Life in the UK 考试',
    titleEn: 'Pass the Life in the UK test',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 23.1' },
      { srcId: 'SRC-004', locator: 'SW 45.1' },
      { srcId: 'SRC-005', locator: 'LR 14.1' },
      { srcId: 'SRC-020', locator: 'HK 61.1' },
      { srcId: 'SRC-021', locator: 'GT 14.1' },
      { srcId: 'SRC-021', locator: 'GT 33.1' },
      { srcId: 'SRC-022', locator: 'SETF 6.1' },
      { srcId: 'SRC-022', locator: 'SETF 16.1' },
      { srcId: 'SRC-025', locator: 'KoLL 2.3' },
      { srcId: 'SRC-025', locator: 'KoLL 3.1' },
      { srcId: 'SRC-029', locator: 'para 298(vii)' },
      { srcId: 'SRC-026', locator: 'UKA 16.1' },
      { srcId: 'SRC-027', locator: 'INNF 20.1' },
      { srcId: 'SRC-028', locator: 'PL 17.1' },
      { srcId: 'SRC-015', locator: 'KOL 1.1' },
      { srcId: 'SRC-014', locator: 'EL 1.1(d)' },
      { srcId: 'SRC-025', locator: 'KoLL 3.2, 4.14' },
      { srcId: 'SRC-015', locator: 'KOL 2.1' },
    ],
    pendingDetails: ['PD-072'],
  },
  settlementKol,
);

export function settlementKol(
  ctx: RuleContext,
  applicationDate = ctx.simulationDate,
  override?: SettlementLanguageRoute,
): Verdict {
  const { timeline, simulationDate } = ctx;
  const L = textFor(ctx);
  if (ageExempt(timeline, applicationDate)) {
    return {
      status: 'PASS',
      explanation: L(
        `申请日未满 ${cl.values.settlementMinorAge.value} 岁或已满 ${cl.values.settlementExemptionAge.value} 岁，豁免 Life in the UK 考试。`,
        `Under ${cl.values.settlementMinorAge.value} or aged ${cl.values.settlementExemptionAge.value} or over on the date of application: exempt from the Life in the UK test.`,
      ),
    };
  }
  const basis = override
    ? ` (${override === 'UK_ANCESTRY' ? 'UKA 16.1' : 'LR 14.1'})`
    : episodeOn(timeline, simulationDate)?.route === 'HONG_KONG_BNO'
      ? L('（HK 61.1）', ' (HK 61.1)')
      : globalTalentDependant(timeline, simulationDate)
        ? L('（GT 33.1）', ' (GT 33.1)')
        : onFamilyChild(timeline, simulationDate)
          ? onFiveYearFamilyChild(ctx)
            ? L(
                '（Immigration Rules Part 8 第 298(vii) 段、Appendix KoLL 2.3）',
                ' (paragraph 298(vii) of Part 8 of the Immigration Rules, Appendix KoLL 2.3)',
              )
            : L('（SETF 16.1）', ' (SETF 16.1)')
          : onGlobalTalent(timeline, simulationDate)
            ? L('（GT 14.1）', ' (GT 14.1)')
            : onUkAncestry(timeline, simulationDate)
              ? L('（UKA 16.1）', ' (UKA 16.1)')
              : onInnovatorFounder(timeline, simulationDate)
                ? L('（INNF 20.1）', ' (INNF 20.1)')
                : onPrivateLife(timeline, simulationDate)
                  ? L('（PL 17.1）', ' (PL 17.1)')
                  : onFamilyPartnerTenYear(timeline, simulationDate)
                    ? L('（SETF 6.1）', ' (SETF 6.1)')
                    : onFamilyPartnerFiveYear(timeline, simulationDate)
                      ? L(
                          '（Appendix KoLL 2.3，经 E-ILRP.1.6）',
                          ' (Appendix KoLL 2.3, through E-ILRP.1.6)',
                        )
                      : onProtection(timeline, simulationDate)
                        ? L(
                            '（Appendix Settlement Protection 未设 Life in the UK 要求，此项只适用于 Long Residence 10 年路径，PD-072）',
                            ' (Appendix Settlement Protection sets no Life in the UK requirement; this applies only to the 10-year Long Residence pathway, PD-072)',
                          )
                        : '';
  const kol = timeline.lifeInTheUk;
  if (!kol) {
    const exception = fifteenYearException(ctx, applicationDate, override);
    if (exception) return exception;
    return {
      status: 'UNKNOWN',
      explanation: L(
        `未填写是否已通过 Life in the UK 考试${basis}。`,
        `You haven’t indicated whether you passed the Life in the UK test${basis}.`,
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
          `已通过 Life in the UK 考试${basis}。`,
          `Passed the Life in the UK test${basis}.`,
        ),
      };
}
