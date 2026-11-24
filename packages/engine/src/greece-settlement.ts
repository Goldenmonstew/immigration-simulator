import {
  grSource,
  greece2026_11,
  greeceFull2026_11,
} from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addDays, addMonths, addYears } from './dates';
import type { GrPermit } from './greece';
import type { GrFullRequest } from './greece-full';
import { wageFloor } from './greece-work-family';
import { ageOn, all, any, insuranceMet, type GrContext } from './greece-rules';
import { Days, monthSpan } from './pilot';
import type { IsoDate } from './types';

interface IntegrationEvidence {
  basis:
    | 'school'
    | 'second-chance-school'
    | 'greek-degree'
    | 'greek-language-degree-abroad'
    | 'language'
    | 'pegp'
    | 'family-pr'
    | 'expatriate-card'
    | 'a2'
    | 'history'
    | 'residence'
    | 'none';
  greekLevel?: 'legacy-A' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  a2Certificate?: boolean;
  a2Total?: number;
  a2SectionsAtPassMark?: number;
  historyPoints?: number;
  continuousFrom?: IsoDate;
  includesStudyOrDisputedGap?: boolean;
  /** Documented twelve years of lawful residence under former article 145(2)(γ). */
  legacyTwelveLawfulYears?: boolean;
}

interface ResidenceIncome {
  /** Previous tax year's net family contributions and ordinary unemployment benefit, excluding social assistance. */
  netEur?: number;
  dependants?: number;
  regularAndDocumented?: boolean;
}

interface CurrentIncomeYear {
  /** Eligible taxable income including a spouse, or the supporting taxpayer's income for a dependent applicant. */
  taxableEur: number;
  dependants: number;
  welfareEur?: number;
}

type Conviction = {
  /** Include final domestic and foreign judgments, even where execution was suspended. */
  final: boolean;
  offence: 'listed' | 'other-intentional' | 'other' | 'classification-pending';
  offenceDate: IsoDate;
  sentenceMonths: number;
};

export interface GrSettlementAnswers {
  /** Renewals granted under article 52(1); permitEffectiveOn is the date printed on the issued card. */
  backlogRenewals?: {
    filedOn: IsoDate;
    permitEffectiveOn: IsoDate;
    category:
      | 'employment'
      | 'services-or-project'
      | 'family'
      | 'autonomous-family'
      | 'other';
    typeAReceipt: boolean;
    pendingAtCommencement: boolean;
  }[];
  integration?: IntegrationEvidence;
  residenceIncome?: ResidenceIncome;
  longTerm?: {
    stage?: 'initial' | 'renewal';
    category?:
      | 'ordinary'
      | 'protected'
      | 'investor'
      | 'study'
      | 'temporary'
      | 'asylum-pending'
      | 'diplomatic';
    passportHistory?: 'complete' | 'official-substitute' | 'missing';
    convertingTenYearCard?: boolean;
    /** Months outside the EU and years outside Greece since acquiring long-term status. */
    continuousOutsideEuMonths?: number;
    continuousOutsideGreeceYears?: number;
    formerBlueCardEndorsement?: boolean;
    /** Other member-state status or a loss ground apart from the separately assessed public-order finding. */
    otherMemberStateLongTermOrRevocationGround?: boolean;
  };
  tenYear?: {
    stage?: 'initial' | 'renewal';
    basis?: 'residence' | 'birth-school';
    residesInGreece?: boolean;
    bornInGreece?: boolean;
    greekGrades?: number;
    ageAtSchoolCompletion?: number;
    disputedPermitGap?: boolean;
    /** Former article 161(1)(a) required ten years of lawful residence and economic/social integration. */
    legacyTenLawfulYears?: boolean;
    legacyEconomicAndSocialIntegration?: boolean;
    cardExpiresOn?: IsoDate;
    hasPriorCard?: boolean;
  };
  nationality?: {
    stage?: 'application' | 'oath';
    bornAndContinuouslyResident?: boolean;
    permit?:
      'listed' | 'investor' | 'other-definitive' | 'temporary' | 'receipt';
    shortRouteBasis?:
      | 'eu'
      | 'greek-spouse-with-child'
      | 'parent-of-greek-child-born-in-greece'
      | 'stateless'
      | 'none';
    convictions?: Conviction[];
    removalOrStatusProceedings?: boolean;
    exam?:
      'certificate' | 'written' | 'oral' | 'school-exemption' | 'not-passed';
    /** The sitting date when different from the filing date used in the simulation. */
    examOn?: IsoDate;
    languagePoints?: number;
    knowledgePoints?: number;
    oralPassed?: boolean;
    disabilityPercent?: number;
    certifiedLearningDisability?: boolean;
    /** Judicial guardianship specifically barring the applicant from sitting the exam. */
    barredFromExam?: boolean;
    greekSchoolGrades?: number;
    greekSecondaryGrades?: number;
    greekTaughtUniversityDegree?: boolean;
    incomeByTaxYear?: Record<number, CurrentIncomeYear>;
    /** Timely accurate returns, social insurance and payment or lawful servicing of debts. */
    taxAndSocialInsuranceCurrent?: boolean;
    /** Evidence over the period under assessment, including the family economic unit where applicable. */
    economicActivity?:
      | 'stable-declared-work'
      | 'recurring-seasonal'
      | 'other-continuing-lawful-activity'
      | 'dependent-supported-by-household'
      | 'occasional-only'
      | 'undeclared-only'
      | 'none';
    /** Substantiated means lawful resources evidenced against actual living costs, including explained savings or family support. */
    livingResources?:
      | 'substantiated'
      | 'evidence-pending'
      | 'unexplained-spending'
      | 'benefits-only-without-special-reason';
    /** Formal eligibility is fixed on filing. The economic assessment uses the law on review. */
    pendingApplicationFiledOn?: IsoDate;
    integrationAssessment?: 'accepted' | 'adverse' | 'evidence-only';
    civilStatusProof?:
      | 'legalised-translation'
      | 'domestic-birth-record'
      | 'recognised-protection-substitute'
      | 'missing';
    hasAmka?: boolean;
    hasTaxAssessments?: boolean;
    feeClass?: 'ordinary' | 'reduced';
    lastRejection?: IsoDate | 'none';
    preReformObjectionException?: boolean;
    publicationDate?: IsoDate;
    oathDate?: IsoDate | 'not-taken';
  };
}

const v = greeceFull2026_11.values;
const pilot = greece2026_11.values;
const migration = (article: string) =>
  grSource('F16', 'Migration Code art. ' + article);
const citizenship = (article: string) => grSource('F34', 'ΚΕΙ art. ' + article);
const tenYearLaw = [
  migration('161(1)–(3), original text, pp. 4200–4201'),
  grSource('F36', 'art. 38, Migration Code art. 161(1), (3)–(7)'),
];
const integrationLaw = [
  grSource('F36', 'art. 37, Migration Code art. 160(1)'),
  migration('145(2)'),
  grSource('F14', 'art. 12'),
  grSource('F46', 'Prerequisites and cost'),
];

const examinationOrders = [
  {
    from: v.examCurrentRulesFrom.value,
    file: 'F56',
    marking: 'art. 8(1) (written), (2) (oral), pp. 23393–23394',
    format: 'arts. 2, 6',
  },
  {
    from: v.examWrittenRulesFrom.value,
    file: 'F30',
    marking: 'art. 7(1) (written), (2) (oral), p. 9379',
    format: 'arts. 2, 5',
  },
  {
    from: v.examInterimRulesFrom.value,
    file: 'F55',
    marking: 'art. 7, written and oral marking',
    format: 'arts. 2, 5',
  },
  {
    from: v.examPreviousRulesFrom.value,
    file: 'F19',
    marking: 'art. 7, written and oral marking',
    format: 'arts. 2, 5',
  },
] as const;

function integrationMet(r: GrFullRequest): boolean | IsoDate | undefined {
  const e = r.integration;
  if (!e) return undefined;
  const p = v.settlementIntegration.value;
  switch (e.basis) {
    case 'language':
      return e.greekLevel === undefined
        ? undefined
        : e.greekLevel !== 'legacy-A' &&
            e.greekLevel >= v.settlementGreekLevel.value;
    case 'a2': {
      if (e.a2Certificate === true) return true;
      const age = ageOn(r.birthDate, r.simulationDate);
      return all(
        age === undefined ? undefined : age >= p.a2ExamAge,
        e.a2Total === undefined ? undefined : e.a2Total >= p.total,
        e.a2SectionsAtPassMark === undefined
          ? undefined
          : e.a2SectionsAtPassMark >= p.sections,
      );
    }
    case 'history':
      return all(
        e.greekLevel === undefined
          ? undefined
          : e.greekLevel === 'legacy-A' ||
              e.greekLevel === v.historyExamGreekLevel.value,
        e.historyPoints === undefined
          ? undefined
          : e.historyPoints >= p.history,
      );
    case 'residence': {
      const legacyTotal =
        r.simulationDate < v.workReformEffective.value
          ? e.legacyTwelveLawfulYears
          : undefined;
      if (legacyTotal || !e.continuousFrom) return legacyTotal;
      if (e.includesStudyOrDisputedGap !== false) return undefined;
      const date = addYears(e.continuousFrom, p.consecutiveYears);
      return date <= r.simulationDate || date;
    }
    case 'second-chance-school':
    case 'greek-degree':
      return r.simulationDate >= v.workReformEffective.value;
    case 'none':
      return false;
    default:
      return true;
  }
}

function integrationCheck(r: GrFullRequest, c: GrContext, id: string) {
  const p = v.settlementIntegration.value;
  const met = integrationMet(r);
  const legacy = r.simulationDate < v.workReformEffective.value;
  return c.check(
    id,
    '希腊语及历史文化融入',
    'Greek language, history and culture',
    met,
    integrationLaw,
    `可提交认可学历、身份或语言证书；全科 Α2 须满 ${p.total} 分且至少 ${p.sections} 项达 ${p.sectionPercent}%（€${p.fullFee}），持语证仅考历史须满 ${p.history} 分（€${p.historyFee}）。${legacy ? '原第 145(2)(γ) 条接受合法居留' : '连续合法居留'} ${p.consecutiveYears} 年也可举证，学习期与续卡断档须核实。`,
    `Provide recognised education, status or language evidence. The full A2 exam requires ${p.total} points and ${p.sections} sections at ${p.sectionPercent}% (€${p.fullFee}). With a language certificate, history requires ${p.history} points (€${p.historyFee}). The ${p.consecutiveYears}-year option requires ${legacy ? 'documented lawful residence under former article 145(2)(γ)' : 'an uninterrupted lawful record'}. Study and disputed renewal gaps need review.`,
    met === undefined && r.integration?.includesStudyOrDisputedGap
      ? ['PD-305']
      : undefined,
  );
}

function incomeMet(r: GrFullRequest): boolean | undefined {
  const e = r.residenceIncome;
  if (e?.regularAndDocumented === false || e?.netEur === 0) return false;
  if (e?.netEur === undefined || e.dependants === undefined) return undefined;
  if (r.simulationDate < v.incomeMethodEffective.value) return undefined;
  const monthly = wageFloor(r.simulationDate);
  if (monthly === undefined) return undefined;
  const base = monthly * v.annualPayPeriods.value;
  // Compare integer percentage units to avoid rounding an inclusive euro boundary up by a cent.
  const factor = e.dependants > 0 ? v.longTermFamilySupplementPercent.value : 0;
  return all(
    e.regularAndDocumented,
    e.netEur * 100 >= base * (100 + factor) ? true : undefined,
  );
}

const incomeSources = [
  migration('144(1)(a), original text, p. 4194'),
  grSource('F38', 'art. 179, art. 144(1)(a)'),
  grSource('F26', 'art. 3'),
  grSource('F22', 'ministerial decision 25058/2024, operative point α'),
  ...v.minimumMonthlyGrossEur.sources,
  ...v.previousMonthlyGrossEur.sources,
];

function orderMet(r: GrFullRequest) {
  return r.publicOrder === 'clear'
    ? true
    : r.publicOrder === 'adverse'
      ? false
      : undefined;
}

function longTermChecks(r: GrFullRequest, c: GrContext): CountryCheck[] {
  const e = r.longTerm ?? {};
  const p = v.longTermCard.value;
  const renewal = e.stage === 'renewal';
  const checks: CountryCheck[] = [];
  if (!renewal) {
    const eligible =
      e.category === 'investor' || e.category === undefined
        ? undefined
        : ['ordinary', 'protected'].includes(e.category);
    const income = incomeMet(r);
    const supplement = v.longTermFamilySupplementPercent.value;
    checks.push(
      c.check(
        'LT-01',
        '递交时的居留类别',
        'Residence category on filing',
        eligible,
        [migration('143(2)'), grSource('F38', 'art. 179, art. 144(2), (2A)')],
        '确认递交当天持有适格许可；国际保护须已获批，申请等待期依获批决定计入。',
        'Confirm a qualifying category on filing. The asylum interval counts when protection has been granted.',
        e.category === 'investor' ? ['PD-101'] : undefined,
      ),
      c.check(
        'LT-02',
        '上一税年稳定净收入',
        'Regular net resources in the preceding tax year',
        income,
        incomeSources,
        `按家庭净收入、普通失业金、完税及缴保凭证核算。有受养人合计只加 ${supplement}%。净额达到对应毛工资上界足以通过；临界值缺统一扣缴额和跨年口径。`,
        `Include family contributions and ordinary unemployment benefits supported by tax and insurance records. Add ${supplement}% once for all dependants. The gross wage is a sufficient upper bound; the official net conversion and treatment of annual increases are unresolved.`,
        income === undefined &&
          r.residenceIncome?.netEur !== undefined &&
          r.residenceIncome.dependants !== undefined
          ? ['PD-304']
          : undefined,
      ),
      c.check(
        'LT-03',
        '本人及受养家属完整医保',
        'Comprehensive health insurance for the household',
        all(
          insuranceMet(r.insurance, 'either'),
          any(
            r.residenceIncome?.dependants === undefined
              ? undefined
              : r.residenceIncome.dependants === 0,
            r.insurance?.coversFamily,
          ),
        ),
        [
          grSource('F38', 'art. 179, art. 144(1)(b)'),
          grSource('F21', 'art. 57(1)(γ)'),
          grSource('F06', 'art. 1'),
        ],
        '核对申请人保单以及全部受养家属的实际承保。',
        'Confirm cover for the applicant and every dependent family member.',
      ),
      integrationCheck(r, c, 'LT-04'),
      c.check(
        'LT-05',
        '公共秩序与公共安全',
        'Public order and security',
        orderMet(r),
        [migration('147(3)')],
        '主管机关结合行为严重程度、居留年限和在希联系判断现实风险。',
        'The authority weighs seriousness, residence duration and ties to Greece.',
        r.publicOrder === 'review' ? ['PD-301'] : undefined,
      ),
    );
  }
  const fee = renewal || e.convertingTenYearCard ? p.exemptFee : p.initialFee;
  checks.push(
    c.check(
      'LT-06',
      '申请材料与费用',
      'Application evidence and fees',
      e.passportHistory === undefined ||
        (!renewal && e.passportHistory === 'missing')
        ? undefined
        : e.passportHistory !== 'missing',
      [
        migration('171(1)(στ), 171(2)(a)–(b)'),
        grSource('F21', renewal ? 'arts. 1, 57(2)(a)' : 'arts. 1, 57(1)(a)'),
      ],
      renewal
        ? `换卡须提交过去 ${pilot.longTermYears.value} 年所有旅行证件的全部内页，或已获机关认可的替代记录。免申请费，印卡 €${p.cardFee}。`
        : `核对过去 ${pilot.longTermYears.value} 年的全部护照内页或获机关接受的替代记录。首次申请 €${p.initialFee}，由 Μ.2 转入 €${p.exemptFee}，印卡 €${p.cardFee}。`,
      renewal
        ? `For renewal, provide all pages of the travel documents covering the last ${pilot.longTermYears.value} years or an accepted official substitute. The application fee is €${fee} plus €${p.cardFee} for printing.`
        : `Verify every passport page for the last ${pilot.longTermYears.value} years or an accepted official substitute. Initial applications cost €${p.initialFee}, conversion from M.2 €${p.exemptFee}, plus €${p.cardFee} for printing.`,
    ),
  );
  const eu = e.continuousOutsideEuMonths;
  let retained: boolean | undefined;
  if (eu !== undefined) {
    if (eu < p.lossEuMonths) retained = true;
    else if (
      eu > v.formerBlueCardEuAbsenceMonths.value ||
      e.formerBlueCardEndorsement === false
    )
      retained = false;
    else retained = e.formerBlueCardEndorsement;
  }
  checks.push(
    c.check(
      'LT-07',
      '长期居民身份维持',
      'Retention of long-term status',
      renewal
        ? all(
            retained,
            orderMet(r),
            e.continuousOutsideGreeceYears === undefined
              ? undefined
              : e.continuousOutsideGreeceYears <= p.lossGreeceYears,
            e.otherMemberStateLongTermOrRevocationGround === undefined
              ? undefined
              : !e.otherMemberStateLongTermOrRevocationGround,
          )
        : true,
      [
        migration('43(4), 145(5), 146, 148(1)'),
        grSource('F36', 'art. 36, art. 148(1)'),
      ],
      `审批通常 ${p.decisionMonths} 个月，可延 ${p.extensionMonths} 个月。卡期 ${p.validYears} 年；获批后连续离欧满 ${p.lossEuMonths} 月或离希超 ${p.lossGreeceYears} 年影响身份。前蓝卡特别注记可连续离欧 ${v.formerBlueCardEuAbsenceMonths.value} 月。换卡时核查公共秩序威胁、是否已取得其他成员国长期身份，以及其他法定丧失事由。`,
      `Decision period ${p.decisionMonths} months with a possible ${p.extensionMonths}-month extension. The card lasts ${p.validYears} years. After grant, ${p.lossEuMonths} consecutive months outside the EU or more than ${p.lossGreeceYears} years outside Greece affects retention. The former Blue Card endorsement permits ${v.formerBlueCardEuAbsenceMonths.value} months outside the EU. At renewal check the public-order finding, long-term status acquired in another member state and other statutory grounds for loss.`,
      renewal && r.publicOrder === 'review' ? ['PD-301'] : undefined,
    ),
    c.check(
      'LT-08',
      '住址与就业权利',
      'Address and employment rights',
      true,
      [grSource('F21', 'art. 57'), migration('19, 152')],
      '按共同规则申报住址；本路径未另设住房面积门槛。获批后可受雇或自营。',
      'Report the address under the common rules. There is no separate floor-area threshold. Long-term residents may take employment or be self-employed.',
    ),
  );
  return checks;
}

export function backlogCredits(r: GrFullRequest): GrPermit[] {
  const effective = v.workReformEffective.value;
  if (r.simulationDate < effective) return [];
  return (r.backlogRenewals ?? [])
    .filter(
      (b) =>
        b.category !== 'other' &&
        b.typeAReceipt &&
        b.pendingAtCommencement &&
        b.filedOn >= v.backlogFilingFrom.value &&
        b.filedOn <= effective &&
        b.permitEffectiveOn >= effective &&
        b.permitEffectiveOn <= r.simulationDate,
    )
    .map((b) => ({
      kind: 'regular',
      from: b.filedOn,
      to: b.permitEffectiveOn,
    }));
}

export function tenYearResidence(
  r: GrFullRequest,
): boolean | IsoDate | undefined {
  const legacy = r.simulationDate < v.workReformEffective.value;
  if (legacy && r.tenYear?.legacyTenLawfulYears) return true;
  if (!r.permits) return legacy ? r.tenYear?.legacyTenLawfulYears : undefined;
  const byDate = [...r.permits].sort((a, b) => a.from.localeCompare(b.from));
  const periods = byDate.map((p, i) => {
    const next = byDate
      .slice(i + 1)
      .find((n) => n.kind === p.kind && n.from > p.from);
    return { ...p, to: p.to ?? (next && addDays(next.from, -1)) };
  });
  const eligible = [...periods, ...backlogCredits(r)]
    .filter((p) => p.kind !== 'temporary')
    .sort((a, b) => a.from.localeCompare(b.from));
  function qualifyingDate(includeStudy: boolean) {
    const runs: { from: IsoDate; to?: IsoDate }[] = [];
    for (const period of eligible) {
      if (period.kind === 'study' && !includeStudy) continue;
      const run = runs.at(-1);
      if (!run || (run.to && addDays(run.to, 1) < period.from))
        runs.push({ from: period.from, to: period.to });
      else if (run.to && (!period.to || run.to < period.to)) run.to = period.to;
    }
    for (const [i, run] of runs.entries()) {
      if (run.to && run.to < r.simulationDate) continue;
      const date = addYears(run.from, v.tenYearCard.value.years);
      // Credited time before a break can satisfy the original article 161(1)(a).
      // Request the established total if the continuous stretch is insufficient.
      if (legacy && i > 0 && date > r.simulationDate) return null;
      if (!run.to || date <= run.to) return date;
    }
  }
  const sure = qualifyingDate(false);
  if (sure && sure <= r.simulationDate) return true;
  if (
    sure === null ||
    r.tenYear?.disputedPermitGap ||
    qualifyingDate(true) !== sure
  )
    return undefined;
  return sure ?? false;
}

function conversionAbsences(r: GrFullRequest) {
  const expiry = r.tenYear?.cardExpiresOn ?? r.currentCardExpiresOn;
  if (!expiry || !r.trips) return undefined;
  const start = addYears(expiry, -pilot.longTermYears.value);
  const end = addDays(expiry, -1);
  const days = new Days(start, end);
  const away = new Array<boolean>(days.count).fill(false);
  for (const trip of r.trips) {
    const first = trip.departed < start ? start : addDays(trip.departed, 1);
    const last = trip.returned >= expiry ? end : addDays(trip.returned, -1);
    if (first > last) continue;
    if (last >= addDays(addMonths(first, pilot.singleAbsenceMonths.value), -1))
      return false;
    days.mark(away, first, last);
  }
  const total = away.filter(Boolean).length;
  const [min, max] = monthSpan(pilot.totalAbsenceMonths.value);
  return total > max ? false : total <= min ? true : undefined;
}

function tenYearChecks(r: GrFullRequest, c: GrContext): CountryCheck[] {
  const e = r.tenYear ?? {};
  const p = v.tenYearCard.value;
  const renewal = e.stage === 'renewal';
  const youth = e.basis === 'birth-school';
  const ordinary = e.basis === 'residence';
  const legacy = r.simulationDate < v.workReformEffective.value;
  const checks: CountryCheck[] = [];
  if (!renewal) {
    const schooling = all(
      e.greekGrades === undefined ? undefined : e.greekGrades >= p.grades,
      e.ageAtSchoolCompletion === undefined
        ? undefined
        : e.ageAtSchoolCompletion < p.beforeAge,
    );
    const activePermit = r.permits?.some(
      (permit) =>
        permit.from <= r.simulationDate &&
        (!permit.to || permit.to >= r.simulationDate),
    );
    const residence =
      e.residesInGreece ??
      (r.entry === 'permit' && activePermit ? true : undefined);
    const eligible = youth
      ? any(e.bornInGreece, schooling)
      : ordinary
        ? tenYearResidence(r)
        : undefined;
    checks.push(
      c.check(
        'TY-01',
        '确定性居留、出生或学籍',
        'Definitive permits, birth or schooling',
        typeof eligible === 'string'
          ? residence && eligible
          : all(residence, eligible),
        [...tenYearLaw, grSource('F36', 'art. 52(1), pp. 483–484')],
        `申请人须居住在希腊。普通通道须${legacy ? '' : '连续'}持确定性居留许可满 ${p.years} 年。${legacy ? '' : '第 52(1) 条涵盖的积压续期，从申请日计至新卡生效日。'}出生或学籍通道须在希出生，或在 ${p.beforeAge} 岁前完成希腊学校 ${p.grades} 个年级。`,
        `The applicant must reside in Greece. The ordinary route requires ${p.years}${legacy ? '' : ' continuous'} years on definitive permits. ${legacy ? '' : 'Qualifying article 52(1) renewal time counts from filing through the effective date of the new permit. '}The alternative requires birth in Greece or ${p.grades} grades of Greek school before age ${p.beforeAge}.`,
        ordinary && eligible === undefined && r.permits !== undefined
          ? ['PD-312']
          : undefined,
      ),
    );
    if (!youth)
      checks.push(
        legacy
          ? c.check(
              'TY-02',
              '经济与社会融入',
              'Economic and social integration',
              e.legacyEconomicAndSocialIntegration,
              [migration('161(1)(a), original text'), citizenship('5Α(1)(δ)')],
            )
          : integrationCheck(r, c, 'TY-02'),
      );
    checks.push(
      c.check(
        'TY-03',
        '完整医疗及住院保险',
        'Full medical and hospital insurance',
        insuranceMet(r.insurance, 'either'),
        [...tenYearLaw, grSource('F06', 'art. 1')],
      ),
    );
  }
  const conversion = renewal && (ordinary || (legacy && youth));
  const absent = conversion ? conversionAbsences(r) : undefined;
  const income = legacy ? true : conversion ? incomeMet(r) : undefined;
  const pending: string[] = [];
  const expiry = e.cardExpiresOn ?? r.currentCardExpiresOn;
  if (conversion && absent === undefined && r.trips && expiry)
    pending.push('PD-102');
  if (
    conversion &&
    income === undefined &&
    r.residenceIncome?.netEur !== undefined
  )
    pending.push('PD-304');
  const renewalMet = all(
    e.hasPriorCard,
    e.basis === undefined
      ? undefined
      : conversion
        ? all(absent, income)
        : orderMet(r),
  );
  checks.push(
    c.check(
      'TY-04',
      '到期转换或续期',
      'Conversion or renewal at expiry',
      renewal && conversion && renewalMet && expiry && expiry > r.simulationDate
        ? expiry
        : renewal
          ? renewalMet
          : true,
      [...tenYearLaw, ...incomeSources],
      legacy
        ? `依原第 161(3) 条，到期时凭旧卡核查最后 ${pilot.longTermYears.value} 年离境后转 Μ.1。`
        : `普通 Μ.2 到期时查最后 ${pilot.longTermYears.value} 年离境和 Μ.1 收入，达标后凭旧卡转 Μ.1；否则可申请其他类别。出生或学籍类每 ${p.years} 年续卡，查连续离境与公共秩序。`,
      legacy
        ? `Former article 161(3) allows conversion at expiry on the previous card and qualifying absences over the final ${pilot.longTermYears.value} years.`
        : `Ordinary M.2 holders may convert at expiry with their previous card, qualifying absences over the final ${pilot.longTermYears.value} years and M.1 income. Others may seek a different category. Birth/school cards renew every ${p.years} years subject to absence and public-order rules.`,
      pending,
    ),
  );
  const noTwoYearAbsence = r.trips?.every((t) => {
    const end = t.returned < r.simulationDate ? t.returned : r.simulationDate;
    return end < addYears(t.departed, p.absenceYears);
  });
  checks.push(
    c.check(
      'TY-05',
      '连续离希时长',
      'Consecutive absence from Greece',
      noTwoYearAbsence,
      tenYearLaw,
      `递交或维持时不得连续离希满 ${p.absenceYears} 年。`,
      `No continuous absence of ${p.absenceYears} years by the assessment date.`,
    ),
  );
  checks.push(
    c.check(
      'TY-06',
      '申请费与工作权',
      'Application fee and labour-market access',
      true,
      [
        migration('171(1)(ζ), 171(2)(a)'),
        ...tenYearLaw,
        grSource('F21', 'art. 1'),
      ],
      `首次普通类 €${p.ordinaryFee}、出生或学籍类 €${p.youthFee}，另收印卡 €${v.longTermCard.value.cardFee}；转 Μ.1 免申请费。Μ.2 可进入整个劳动力市场。续期按卡别核对（PD-313）。`,
      `Initial ordinary grant €${p.ordinaryFee}, birth/school grant €${p.youthFee}, printing €${v.longTermCard.value.cardFee}; conversion to M.1 is exempt. M.2 grants full labour-market access. Verify the card category for renewal (PD-313).`,
    ),
  );
  return checks;
}

function convictionClear(r: GrFullRequest, filing: IsoDate) {
  const records = r.nationality?.convictions;
  if (!records) return undefined;
  const p = v.naturalisationScreen.value;
  const cutoff = addYears(filing, -p.criminalLookbackYears);
  let firstClear = filing;
  let classificationPending = false;
  for (const k of records) {
    if (!k.final || k.sentenceMonths < p.listedSentenceMonths) continue;
    if (k.offence === 'listed') return false;
    if (k.offence === 'classification-pending') classificationPending = true;
    if (
      k.offence === 'other-intentional' &&
      k.offenceDate >= cutoff &&
      k.offenceDate <= filing &&
      k.sentenceMonths >= p.intentionalSentenceMonths
    ) {
      if (r.nationality?.pendingApplicationFiledOn) return false;
      let clears = addDays(addYears(k.offenceDate, p.criminalLookbackYears), 1);
      if (addYears(clears, -p.criminalLookbackYears) <= k.offenceDate)
        clears = addDays(clears, 1);
      if (clears > firstClear) firstClear = clears;
    }
  }
  if (classificationPending) return undefined;
  return firstClear === filing || firstClear;
}

function economicIntegration(r: GrFullRequest) {
  const e = r.nationality;
  if (
    !r.route ||
    !e?.incomeByTaxYear ||
    e.taxAndSocialInsuranceCurrent !== true
  )
    return e?.taxAndSocialInsuranceCurrent === false ? false : undefined;
  const p = v.naturalisationIncome.value;
  const filing = e.pendingApplicationFiledOn ?? r.simulationDate;
  const end = Number(filing.split('-')[0]);
  const required = v.naturalisationIncomeYears.value[r.route];
  const window = pilot.nationalityYears.value[r.route];
  const records = Array.from({ length: window }, (_, i) => ({
    year: end - i - 1,
    record: e.incomeByTaxYear?.[end - i - 1],
  }));
  if (r.simulationDate >= v.economicCircularFrom.value) {
    // Circular 52779 applies on review of both pending and new applications. Income is evidence, never an independent cutoff.
    const activity = e.economicActivity;
    if (
      e.livingResources === 'benefits-only-without-special-reason' ||
      activity === 'undeclared-only'
    )
      return false;
    if (activity === 'none' || activity === 'occasional-only') return false;
    // A dependent's household income can establish resources. It does not establish the applicant's economic ties by itself.
    if (
      !activity ||
      activity === 'dependent-supported-by-household' ||
      e.livingResources !== 'substantiated'
    )
      return undefined;
    return records.filter(({ record }) => record !== undefined).length >=
      required
      ? true
      : undefined;
  }
  let qualifying = 0;
  let unresolved = 0;
  const disability = e.disabilityPercent;
  const disabilityCutoff = v.naturalisationExam.value.disabilityPercent;
  for (const { year, record } of records) {
    if (!record) {
      unresolved++;
      continue;
    }
    if (disability !== undefined && disability >= disabilityCutoff) {
      if (record.taxableEur + (record.welfareEur ?? 0) >= p.disability)
        qualifying++;
    } else if (year < p.firstYear || year > p.lastYear) {
      unresolved++;
    } else {
      const base =
        year >= p.reducedFrom && year < p.restoredFrom ? p.reduced : p.standard;
      if (
        record.taxableEur * 100 >=
        base * (100 + record.dependants * p.dependantPercent)
      )
        qualifying++;
      else if (disability === undefined) unresolved++;
    }
  }
  return qualifying >= required
    ? true
    : qualifying + unresolved < required
      ? false
      : undefined;
}

export function nationalityIncomeCheck(r: GrFullRequest, c: GrContext) {
  const e = r.nationality ?? {};
  const exam = v.naturalisationExam.value;
  const financial = economicIntegration(r);
  const holistic = r.simulationDate >= v.economicCircularFrom.value;
  const years = r.route && v.naturalisationIncomeYears.value[r.route];
  const income = v.naturalisationIncome.value;
  return c.check(
    'NAT-07',
    '各税年经济融入与税保合规',
    'Economic integration by tax year and compliance',
    financial,
    [
      citizenship('5Α(1)(δ)'),
      grSource('F12', 'art. 1.A'),
      grSource('F13', 'amendments 1–4'),
      grSource('F35', 'pp3–4'),
      grSource('F54', 'pp2–6, assessment before and after circular 52779'),
    ],
    holistic
      ? `新申请和待决案须核验${years ? years + ' 个' : '相应'}税年材料、在希持续合法工作或其他经济活动、合法生活资源及税保合规。可举证重复季节工、家庭供养、已申报储蓄及自住房；年度金额不足仍可综合满足，反复出现无解释的支出差额须个案审查。`
      : `按当时指引核验${years ? years + ' 个' : '相应'}税年的应税收入及税保记录。已刊普通表止于 ${income.lastYear} 年；指南对认证残障 ≥${exam.disabilityPercent}% 允许福利并采用 €${income.disability}，临界比例见 PD-311。`,
    holistic
      ? `New and pending files require evidence for ${years ?? 'the applicable'} tax years, sustained lawful work or other economic activity in Greece, substantiated resources and tax/insurance compliance. Recurrent seasonal work, family support, documented savings and an owner-occupied home can count. A shortfall alone does not prevent a positive finding; repeated unexplained spending discrepancies need review.`
      : `Under the earlier guidance, check taxable income and compliance for ${years ?? 'the applicable'} tax years. The ordinary table ends in ${income.lastYear}. Ministry guidance counts welfare and uses €${income.disability} at certified disability ≥${exam.disabilityPercent}% (PD-311 at the boundary).`,
    financial === undefined &&
      e.incomeByTaxYear &&
      (!holistic ||
        e.livingResources === 'unexplained-spending' ||
        e.economicActivity === 'dependent-supported-by-household')
      ? [
          'PD-310',
          ...(e.disabilityPercent === exam.disabilityPercent ? ['PD-311'] : []),
        ]
      : undefined,
  );
}

function nationalityChecks(r: GrFullRequest, c: GrContext): CountryCheck[] {
  const e = r.nationality ?? {};
  const p = v.naturalisationScreen.value;
  const exam = v.naturalisationExam.value;
  const filing = e.pendingApplicationFiledOn ?? r.simulationDate;
  const adultOn = r.birthDate && addYears(r.birthDate, p.adultAge);
  const oathStage = e.stage === 'oath';
  const deadline =
    e.publicationDate && addYears(e.publicationDate, p.oathYears);
  let oath: boolean | undefined;
  if (deadline && e.publicationDate && e.oathDate !== undefined) {
    oath =
      e.oathDate !== 'not-taken' &&
      e.oathDate >= e.publicationDate &&
      e.oathDate <= deadline &&
      e.oathDate <= r.simulationDate;
  }
  const oathCheck = c.check(
    'NAT-12',
    '公报决定与宣誓',
    'Publication and oath',
    oathStage ? oath : true,
    [citizenship('9(1), (5), 1Β, 10'), grSource('F33', 'arts. 95, 97')],
    `公报刊载决定后 ${p.oathYears} 年内宣誓方取得国籍。${deadline ? '期限为 ' + deadline + '。' : ''}境外希腊裔可另依第 10 条循领事程序。符合希腊学籍及居留条件者可核对第 1Β 条声明途径及其申报期限。`,
    `Citizenship is acquired on taking the oath within ${p.oathYears} year of publication.${deadline ? ' Deadline ' + deadline + '.' : ''} Ethnic Greeks abroad can use the separate consular procedure under article 10. Applicants with qualifying schooling and residence can check the article 1Β declaration procedure and its filing deadline.`,
  );
  if (oathStage) return [oathCheck];

  const definitive =
    e.permit === undefined || r.route === undefined
      ? undefined
      : e.permit === 'listed' ||
        e.permit === 'investor' ||
        (r.route === 'twelve-year' && e.permit === 'other-definitive');
  const shortCategory =
    r.route !== 'three-year'
      ? true
      : e.shortRouteBasis === undefined
        ? undefined
        : e.shortRouteBasis !== 'none';
  const clear = convictionClear(r, filing);
  const school = any(
    e.greekSchoolGrades === undefined
      ? undefined
      : e.greekSchoolGrades >= exam.schoolGrades,
    e.greekSecondaryGrades === undefined
      ? undefined
      : e.greekSecondaryGrades >= exam.secondaryGrades,
    e.greekTaughtUniversityDegree,
  );
  const examOn = e.examOn ?? filing;
  const currentExamOptions = examOn >= v.naturalisationReformFrom.value;
  const order = examinationOrders.find((rule) => rule.from <= examOn);
  const examYearAge =
    r.birthDate &&
    Number(examOn.split('-')[0]) - Number(r.birthDate.split('-')[0]);
  const oral = any(
    typeof examYearAge === 'number' ? examYearAge > exam.oralAge : undefined,
    e.disabilityPercent === undefined
      ? undefined
      : currentExamOptions
        ? e.disabilityPercent >= exam.disabilityPercent
        : e.disabilityPercent > exam.disabilityPercent,
    e.certifiedLearningDisability,
  );
  let knowledge: boolean | undefined;
  let uncertainWrittenScore = false;
  const languageMinimum = (exam.languageMax * exam.languagePercent) / 100;
  switch (e.exam) {
    case 'certificate':
      knowledge = true;
      break;
    case 'school-exemption':
      knowledge = school;
      break;
    case 'oral':
      knowledge = all(
        oral,
        e.oralPassed,
        e.barredFromExam === undefined ? undefined : !e.barredFromExam,
      );
      break;
    case 'written': {
      if (!order) {
        uncertainWrittenScore = true;
        knowledge = e.barredFromExam === true ? false : undefined;
        break;
      }
      const language = e.languagePoints;
      const knowledgePoints = e.knowledgePoints;
      uncertainWrittenScore =
        language !== undefined &&
        language >= languageMinimum &&
        language < exam.language;
      knowledge = all(
        language === undefined || uncertainWrittenScore
          ? undefined
          : language >= languageMinimum,
        knowledgePoints === undefined
          ? undefined
          : knowledgePoints >= exam.knowledge,
        language === undefined || knowledgePoints === undefined
          ? undefined
          : language + knowledgePoints >= exam.total,
        e.barredFromExam === undefined ? undefined : !e.barredFromExam,
      );
      break;
    }
    case 'not-passed':
      knowledge = false;
      break;
  }
  if ((e.exam === 'written' || e.exam === 'oral') && examOn > filing)
    knowledge = false;
  const rejected = e.lastRejection;
  const reapplyOn =
    rejected && rejected !== 'none'
      ? addYears(rejected, p.rejectionYears)
      : undefined;
  const cooling =
    rejected === 'none' ||
    (filing >= v.naturalisationReformFrom.value &&
      e.preReformObjectionException)
      ? true
      : reapplyOn &&
        (reapplyOn <= filing || (!e.pendingApplicationFiledOn && reapplyOn));
  const fees = v.naturalisationFees.value;
  const reduced =
    e.feeClass === 'reduced' ||
    (r.route === 'three-year' &&
      (e.shortRouteBasis === 'eu' || e.shortRouteBasis === 'stateless'));
  const filingFee = reduced
    ? fees.reduced
    : e.feeClass === 'ordinary' && rejected
      ? rejected === 'none'
        ? fees.initial
        : fees.repeat
      : undefined;
  return [
    c.check(
      'NAT-01',
      '递交时已成年',
      'Adult on filing',
      adultOn &&
        (adultOn <= filing || (!e.pendingApplicationFiledOn && adultOn)),
      [citizenship('5(1)(a)')],
      `递交当日须年满 ${p.adultAge} 岁。`,
      `You must be at least ${p.adultAge} on filing.`,
    ),
    c.check(
      'NAT-02',
      '递交证件与所选通道',
      'Current title and route category',
      all(definitive, shortCategory),
      [citizenship('5(1)(δ)–(ε), 5(3)'), grSource('F35', 'pp1–2')],
      '核对法定清单内的有效卡、三年类别依据，或十二年通道的其他确定性居留卡。指南接纳投资者卡（PD-105）。',
      'Verify the listed title and any three-year qualification, or a valid definitive permit on the twelve-year route. Ministry guidance accepts investor cards (PD-105).',
    ),
    c.check(
      'NAT-03',
      '终审刑事判决（含缓刑）',
      'Final convictions, including suspended sentences',
      clear,
      [citizenship('5(1)(β)'), grSource('F35', 'p1 incl. footnote 1')],
      `近 ${p.criminalLookbackYears} 年内实施的故意罪，终审刑期满 ${p.intentionalSentenceMonths} 个月构成障碍；清单罪满 ${p.listedSentenceMonths} 个月不论年代。境外罪名未映射须核实。`,
      `A final sentence of ${p.intentionalSentenceMonths} months for an intentional offence committed within ${p.criminalLookbackYears} years bars filing; a listed offence carries a lifetime bar from ${p.listedSentenceMonths} months. Unmapped foreign offences require review.`,
      clear === undefined && e.convictions ? ['PD-301'] : undefined,
    ),
    c.check(
      'NAT-04',
      '驱逐、居留争议及安全审查',
      'Removal, outstanding status proceedings and security',
      all(
        e.removalOrStatusProceedings === undefined
          ? undefined
          : !e.removalOrStatusProceedings,
        orderMet(r),
      ),
      [citizenship('5(1)(γ), 5Β')],
      '核对有无驱逐或居留身份待决事项，以及公共秩序或国家安全审查结论。',
      'Check removal or unresolved residence proceedings and the security or public-order finding.',
      r.publicOrder === 'review' ? ['PD-301'] : undefined,
    ),
    c.check(
      'NAT-05',
      'Π.Ε.Γ.Π. 证书或法定免试',
      'PEGP certificate or educational exemption',
      knowledge,
      [
        citizenship('7(1)–(4)'),
        ...(order ? [grSource(order.file, order.marking)] : []),
      ],
      order
        ? `笔试语言满分 ${exam.languageMax}，法典要求至少 ${exam.languagePercent}%。语言达到 ${languageMinimum} 分但不足口试明列的 ${exam.language} 分时，须核实笔试折算（PD-309）。知识至少 ${exam.knowledge} 分，合计至少 ${exam.total} 分。特殊口试须通过，认可学历可免试。`
        : '需核对考试当期的评分规定或已取得的合格证书。',
      order
        ? `The written language paper has ${exam.languageMax} points. The code requires ${exam.languagePercent}%. A score from ${languageMinimum} up to but excluding the explicit oral threshold of ${exam.language} needs confirmation (PD-309). Knowledge requires ${exam.knowledge} and the total ${exam.total}. The oral route requires a pass. Qualifying education exempts the exam.`
        : 'Verify the marking rules in force on the examination date or provide a pass certificate.',
      uncertainWrittenScore ? ['PD-309'] : undefined,
    ),
    c.check(
      'NAT-06',
      '考试方式与学历免试',
      'Exam format and education exemption',
      e.exam === 'oral'
        ? oral
        : e.exam === 'written' && !currentExamOptions
          ? oral === undefined
            ? undefined
            : !oral
          : e.exam === 'school-exemption'
            ? school
            : e.exam === undefined
              ? undefined
              : true,
      [
        citizenship('7(3)–(4)'),
        grSource('F33', 'art. 96'),
        ...(order ? [grSource(order.file, order.format)] : []),
      ],
      `以出生年计算超过 ${exam.oralAge} 岁、认证残障 ${currentExamOptions ? '≥' : '>'}${exam.disabilityPercent}% 或有学习障碍证明适用口试；完成 ${exam.schoolGrades} 个年级或 ${exam.secondaryGrades} 个中学年级、或取得希腊高校希腊语学位可免试。`,
      `The oral procedure applies above age ${exam.oralAge} by calendar year, with certified disability ${currentExamOptions ? 'of at least' : 'above'} ${exam.disabilityPercent}% or a certified learning disability. ${exam.schoolGrades} Greek school grades, ${exam.secondaryGrades} secondary grades or a Greek-taught Greek university degree can exempt the exam.`,
    ),
    nationalityIncomeCheck(r, c),
    c.check(
      'NAT-08',
      '社会融入及生活中心',
      'Social integration and centre of life',
      e.integrationAssessment === 'accepted'
        ? true
        : e.integrationAssessment === 'adverse'
          ? false
          : undefined,
      [
        citizenship('5Α(1)(δ)'),
        grSource('F12', 'art. 2'),
        grSource('F35', 'p4'),
      ],
      '家庭关系、就学、职业培训、公益活动及在希稳定生活由机关综合判断；仅有证据清单无法推定通过。',
      'Family ties, schooling, training, volunteering and durable ties to Greece are assessed together. Evidence alone does not establish the authority’s decision.',
      e.integrationAssessment === 'evidence-only' && r.trips?.length
        ? ['PD-106']
        : undefined,
    ),
    c.check(
      'NAT-09',
      '出生证明、ΑΜΚΑ 与税单',
      'Birth evidence, AMKA and tax assessments',
      all(
        e.civilStatusProof === undefined
          ? undefined
          : e.civilStatusProof !== 'missing',
        e.hasAmka,
        e.hasTaxAssessments,
      ),
      [citizenship('6(1)(δ)–(στ)')],
      '提交认证翻译出生证、希腊出生登记或法定保护身份替代证明，并备好 ΑΜΚΑ 与对应年度税单。',
      'Provide a legalised, translated birth certificate, Greek birth record or statutory protection substitute, plus AMKA and the relevant tax assessments.',
    ),
    c.check(
      'NAT-10',
      '入籍及考试费用',
      'Naturalisation and examination fees',
      true,
      [citizenship('6(1)(ζ), 7(1)')],
      `${filingFee === undefined ? `首次 €${fees.initial}，重申 €${fees.repeat}，优惠类 €${fees.reduced}` : '本次申请 €' + filingFee}。每次参加 Π.Ε.Γ.Π. 考试 €${exam.fee}；学历免试无考试费。`,
      `${filingFee === undefined ? `Initial €${fees.initial}, repeat €${fees.repeat}, reduced €${fees.reduced}` : 'Application fee €' + filingFee}. Each PEGP sitting costs €${exam.fee}; no exam fee for educational exemptions.`,
    ),
    c.check(
      'NAT-11',
      '前次驳回后的等待期',
      'Waiting period following rejection',
      cooling,
      [citizenship('8(3)'), grSource('F33', 'art. 98')],
      `核对是否首次申请；重申通常须距驳回满 ${p.rejectionYears} 年，旧制入籍委员会异议的特别过渡情形除外。`,
      `Confirm whether this is a first application. Refiling normally requires ${p.rejectionYears} year since rejection, subject to the transitional pre-reform objections exception.`,
    ),
    oathCheck,
  ];
}

export function settlementChecks(
  id: 'GR-LONG-TERM' | 'GR-TEN-YEAR' | 'GR-NATIONALITY',
  req: GrFullRequest,
  c: GrContext,
): CountryCheck[] {
  if (id === 'GR-LONG-TERM') return longTermChecks(req, c);
  if (id === 'GR-TEN-YEAR') return tenYearChecks(req, c);
  return nationalityChecks(req, c);
}
