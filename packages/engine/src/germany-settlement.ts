import {
  germany2026_11,
  germanyFull2026_11,
} from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addDays, addMonths, addYears, daysBetween, fullYears } from './dates';
import type { DeFullRequest } from './germany-full';
import { all, any, check, src } from './germany-full-shared';
import { afterYears, monthSpan } from './pilot';
import type { IsoDate } from './types';

type Decision = 'accepted' | 'refused' | 'pending';
type FamilyBasis = 'spouse' | 'child' | 'parent' | 'other-recognised' | 'none';
type ProtectionTitle =
  | 'section25-asylum'
  | 'section25-refugee'
  | 'section23-4'
  | 'legacy-resettlement'
  | 'other';
type ChildEducation =
  'school' | 'vocational' | 'university' | 'unconfirmed' | 'none';

/** Contiguous periods, from inclusive to exclusive, ending on the application day.
 * Overseas education/employment/protection classifications refer to § 9b(2). */
interface MobilityPeriod {
  kind:
    | 'german-blue'
    | 'other-eu-blue'
    | 'higher-employment'
    | 'research'
    | 'study'
    | 'protection'
    | 'outside-eu'
    | 'ineligible'
    | 'unconfirmed';
  from: IsoDate;
  until: IsoDate;
}

interface ChildSentence {
  kind: 'youth' | 'prison' | 'fine';
  judgmentDate: IsoDate;
  intentional?: boolean;
  /** Months of imprisonment or daily fine units for a final judgment. */
  amount: number;
}

export interface DeSettlementAnswers {
  /** Historical or prospective first § 18a/b application; informational only. */
  initialSkilledPermit?: {
    appliedOn: IsoDate;
    jobAndQualificationRecognised?: boolean;
    occupationalLicenceAndBA?: boolean;
    genuineOfferConfirmed?: boolean;
    annualGrossSalary?: number;
    adequatePension?: boolean;
    publicInterestException?: Decision;
  };
  /** First § 21 business application; separate from settlement under § 21(4). */
  initialBusinessPermit?: {
    appliedOn: IsoDate;
    economicOrRegionalNeed?: boolean;
    positiveEconomicImpact?: boolean;
    financingSecured?: boolean;
    alternativeLegalBasis?: Decision;
    adequatePension?: boolean;
  };
  skilledQualification?: boolean;
  currentSkilledPost?:
    | 'qualified'
    | 'research'
    | 'blue-card'
    | 'proposed'
    | 'ended'
    | 'ineligible'
    | 'unconfirmed';
  /** Decision on equivalent provision, or on a specific disability exemption claimed. */
  skilledAlternativePension?: Decision;
  germanFamilyBasis?: FamilyBasis;
  germanFamilyLifeInGermany?: boolean;
  germanChildBirthDate?: IsoDate;
  familyChildUnmarried?: boolean;
  parentCareRecognised?: boolean;
  /** An accepted continuing § 28 family basis after the child's majority. */
  continuedFamilyBasis?: Decision;
  germanFamilyIncomeException?:
    'approved' | 'parent-own-income' | 'pending' | 'none';
  parentOwnIncomeSufficient?: boolean;
  householdShortfallOnlyGermanMembers?: boolean;
  protectionTitle?: ProtectionTitle;
  resettlementWithdrawalGrounds?: boolean;
  bamfNotice?:
    | 'confirmed-none'
    | 'only-applicant-unaware'
    | 'deprivation'
    | 'revocation'
    | 'withdrawal';
  refugeeIncome?: {
    /** Official conclusion for the selected ordinary or accelerated test. */
    ordinaryDecision?: Decision;
    acceleratedDecision?: Decision;
    berlin?: boolean;
    totalMonthlyIncome?: number;
    monthlySgbIIXII?: number;
    sustainable?: boolean;
    /** Applies only to the ordinary band. */
    medicalExemption?: Decision;
    /** Statutory earlier pension age under § 235(2) sentence 3. */
    unraisedRetirementAge?: boolean;
  };
  euExcludedStatus?:
    | 'none'
    | 'excluded-humanitarian'
    | 'pending-protection'
    | 'temporary'
    | 'diplomatic'
    | 'unconfirmed';
  euMobility?: {
    /** An eligible Blue Card holder or qualifying § 30/32 family member. */
    personalScope?: boolean;
    immediatelyPriorOtherStateBlueCard?: boolean;
    germanBlueSince?: IsoDate;
    periods?: MobilityPeriod[];
  };
  euRegularIncome?: boolean;
  euTaxDutiesFulfilled?: boolean;
  /** Where income comes from work, the worker or cohabiting spouse holds the necessary licences. */
  euWorkLicences?: 'satisfied' | 'not-required' | 'missing' | 'under-review';
  euRetirementProvision?:
    | 'adequate-own'
    | 'adequate-cohabiting-spouse'
    | 'medical-exemption'
    | 'inadequate'
    | 'under-review';
  /** Covers the applicant and the relevant household indefinitely or with automatic renewal. */
  euCareCover?:
    'statutory' | 'equivalent-accepted' | 'inadequate' | 'under-review';
  humanitarianCurrentTitle?: boolean;
  /** Start after crediting any contiguous pre-grant asylum procedure and resolving absences. */
  humanitarianCreditedSince?: IsoDate;
  humanitarianDecision?: Decision;
  businessPermit?:
    'entrepreneur' | 'freelance' | 'mixed-or-ancillary' | 'other';
  /** Start of uninterrupted actual operation under the qualifying business title. */
  continuousBusinessSince?: IsoDate;
  businessSustainability?: Decision;
  businessGrant?: Decision;
  childPermitBasis?: 'family' | 'humanitarian' | 'other';
  childHumanitarianReferral?: Decision;
  /** Beginning of the qualifying period at the relevant birthday (or decision for adults). */
  childPermitSince?: IsoDate;
  childForeignSchoolDays?: number;
  childSchoolCredit?: 'ordinary' | 'recognised-full' | 'under-review';
  childLanguageB1?: boolean;
  childSecureLivelihood?: boolean;
  childEducation?: ChildEducation;
  childLanguageMedicalWaiver?: Decision;
  childLivelihoodMedicalWaiver?: Decision;
  childPersonalExpulsionInterest?: boolean;
  childJudgments?: ChildSentence[];
  childYouthSentenceDeferred?: boolean;
  childDependsOnSgbIIXIIorVIII?: boolean;
  /** Discretionary grant despite a known § 35(3) ground. */
  childExceptionDecision?: Decision;
  spouseHoldsSkilledSettlement?: boolean;
  spousalCommunityContinues?: boolean;
  qualifyingSpousePermitSince?: IsoDate;
  regularWeeklyHours?: number;
  irregularHoursAssessment?: Decision;
  highlyQualifiedAcademic?: boolean;
  exceptionalAcademicPost?: Decision;
  stateConsent?: 'given' | 'not-required' | 'refused' | 'pending';
  integrationProspects?: Decision;
  civilAppointment?: 'beamter' | 'employee' | 'unconfirmed';
  /** Continuous § 19c(4) residence in the formal service relationship. */
  civilServicePermitSince?: IsoDate;
  formerFamilyLifeEnded?: IsoDate;
  formerSpousePermanentTitle?:
    'settlement' | 'eu-long-term' | 'other' | 'unconfirmed';
  formerSpouseMaintenance?:
    | 'own-funds-enforceable-and-sufficient'
    | 'insufficient'
    | 'third-party'
    | 'under-review';
}

const old = germany2026_11.values;
const v = germanyFull2026_11.values;
const decided = (d?: Decision) =>
  d === undefined || d === 'pending' ? undefined : d === 'accepted';
const atLeastYears = (
  since: IsoDate | undefined,
  asOf: IsoDate,
  years: number,
) => (since === undefined ? undefined : asOf >= afterYears(since, years));
const atLeast = (value: number | undefined, min: number) =>
  value === undefined ? undefined : value >= min;
const qualifying = <T extends string>(
  value: T | undefined,
  pending: T,
  accepted: readonly T[],
) =>
  value === undefined || value === pending
    ? undefined
    : accepted.includes(value);

function currentPermit(req: DeFullRequest) {
  const permit = req.permits
    ?.filter((p) => p.from <= req.simulationDate)
    .sort((a, b) => b.from.localeCompare(a.from))[0];
  if (permit?.to && permit.to < req.simulationDate && !permit.renewing)
    return undefined;
  return permit;
}

function familyBasis(req: DeFullRequest) {
  const a = req.settlement ?? {};
  const basis = a.germanFamilyBasis;
  if (!basis || basis === 'none') return basis === 'none' ? false : undefined;
  if (basis !== 'parent' && basis !== 'child') return true;
  const birth = basis === 'parent' ? a.germanChildBirthDate : req.birthDate;
  const minor =
    birth === undefined
      ? undefined
      : fullYears(birth, req.simulationDate) <
        v.childSettlement.value.adulthood;
  const ordinary = all(
    minor,
    a.familyChildUnmarried,
    basis === 'parent' ? a.parentCareRecognised : true,
  );
  return any(
    ordinary,
    a.continuedFamilyBasis ? decided(a.continuedFamilyBasis) : false,
  );
}

export function germanFamilyLivelihoodException(req: DeFullRequest) {
  const a = req.settlement ?? {};
  switch (a.germanFamilyIncomeException) {
    case 'approved':
      return true;
    case 'pending':
      return undefined;
    case 'parent-own-income':
      return all(
        a.germanFamilyBasis === undefined
          ? undefined
          : a.germanFamilyBasis === 'parent',
        familyBasis(req),
        a.parentOwnIncomeSufficient,
        a.householdShortfallOnlyGermanMembers,
      );
    default:
      return false;
  }
}

function retirementReached(req: DeFullRequest) {
  if (!req.birthDate) return undefined;
  const cohort = Number(req.birthDate.split('-')[0]);
  const bands = v.retirementAge.value;
  if (cohort >= bands.firstStandardCohort)
    return atLeastYears(req.birthDate, req.simulationDate, bands.standardYears);
  const base = afterYears(req.birthDate, bands.earlierYears);
  const adjustment: Record<string, number> = v.retirementAdditionalMonths.value;
  const extra =
    cohort < bands.firstRaisedCohort ||
    req.settlement?.refugeeIncome?.unraisedRetirementAge
      ? 0
      : adjustment[cohort];
  return req.simulationDate >= addMonths(base, extra);
}

export function refugeeMedicalWaiver(req: DeFullRequest) {
  const decision = req.settlement?.refugeeIncome?.medicalExemption;
  if (decision) return decided(decision);
  const waiver = req.common?.livelihoodMedicalWaiver;
  return waiver === 'pending' ? undefined : waiver === 'granted';
}

function refugeeShare(req: DeFullRequest, fast: boolean) {
  const income = req.settlement?.refugeeIncome;
  const decision = fast
    ? income?.acceleratedDecision
    : income?.ordinaryDecision;
  const { totalMonthlyIncome: total, monthlySgbIIXII: publicFunds } =
    income ?? {};
  const thresholds = v.refugeeBerlinBenefitShare.value;
  const berlinTest =
    income?.berlin &&
    req.simulationDate >= germanyFull2026_11.asOf &&
    total !== undefined &&
    publicFunds !== undefined &&
    total > 0
      ? all(
          income.sustainable,
          publicFunds / total <
            (fast ? thresholds.accelerated : thresholds.ordinary),
        )
      : undefined;
  const incomeTest = decision ? decided(decision) : berlinTest;
  if (fast) return incomeTest;
  return any(
    incomeTest,
    retirementReached(req),
    refugeeMedicalWaiver(req),
  );
}

/** Alternative to the domestic clock, rather than a second time requirement. */
export function mobilityTime(req: DeFullRequest): boolean | undefined {
  const mobility = req.settlement?.euMobility;
  if (!mobility) return false;
  const p = v.euMobility.value;
  const qualifyingTransfer = all(
    mobility.personalScope,
    mobility.immediatelyPriorOtherStateBlueCard,
    atLeastYears(
      mobility.germanBlueSince,
      req.simulationDate,
      p.germanBlueYears,
    ),
  );
  if (qualifyingTransfer === false || !mobility.periods)
    return qualifyingTransfer === false ? false : undefined;
  // Work backwards so an early interruption cannot cancel a later qualifying run.
  const need = daysBetween(
    addYears(req.simulationDate, -old.euLongTermYears.value),
    req.simulationDate,
  );
  const [, maxAbsence] = monthSpan(p.maxTotalMonthsOutsideEu);
  const strictLimit = p.maxTotalMonthsOutsideEu * old.daysPerMonth.value;
  let until = req.simulationDate;
  let credit = 0;
  let abroad = 0;
  let outsideUntil: IsoDate | undefined;
  for (const period of [...mobility.periods].sort((a, b) =>
    b.from.localeCompare(a.from),
  )) {
    if (period.from >= req.simulationDate) continue;
    const end =
      period.until > req.simulationDate ? req.simulationDate : period.until;
    if (end !== until || period.from >= end) return undefined;
    const days = daysBetween(period.from, end);
    if (period.kind === 'unconfirmed') return undefined;
    if (
      mobility.germanBlueSince &&
      end > mobility.germanBlueSince &&
      period.kind !== 'german-blue' &&
      period.kind !== 'outside-eu'
    )
      return undefined;
    if (
      mobility.germanBlueSince &&
      end === mobility.germanBlueSince &&
      period.kind !== 'other-eu-blue'
    )
      return undefined;
    if (period.kind === 'ineligible') return false;
    if (period.kind === 'outside-eu') {
      outsideUntil ??= end;
      abroad += days;
      if (
        outsideUntil >
          addMonths(period.from, p.maxConsecutiveMonthsOutsideEu) ||
        abroad > maxAbsence
      )
        return false;
    } else {
      outsideUntil = undefined;
      credit += days * (period.kind === 'study' ? p.studyCredit : 1);
    }
    if (credit >= need)
      return abroad > strictLimit ? undefined : qualifyingTransfer;
    until = period.from;
  }
  return false;
}

function humanitarianTime(req: DeFullRequest) {
  const a = req.settlement ?? {};
  if (a.humanitarianCreditedSince)
    return atLeastYears(
      a.humanitarianCreditedSince,
      req.simulationDate,
      old.generalYears.value,
    );
  if (!req.permits || !req.firstEntry || !req.trips) return undefined;
  const permits = req.permits
    .filter((p) => p.from <= req.simulationDate)
    .sort((a, b) => b.from.localeCompare(a.from));
  let start = req.simulationDate;
  for (const p of permits) {
    if (p.to && !p.renewing && addDays(p.to, 1) < start) break;
    if (p.kind === 'asylum') {
      start = p.from;
      break;
    }
    if (!humanitarianKinds.includes(p.kind)) break;
    start = p.from;
  }
  // Ordinary short visits abroad leave the holding period intact. A long
  // absence or a disputed § 81 extension needs a verified credited period.
  if (
    req.trips.some(
      (trip) =>
        trip.departed <= req.simulationDate &&
        trip.returned >= start &&
        (trip.returned < req.simulationDate
          ? trip.returned
          : req.simulationDate) >
          addMonths(trip.departed, old.lapseMonths.value),
    )
  )
    return undefined;
  if (
    permits.some(
      (permit) =>
        permit.renewing &&
        permit.to &&
        permit.to >= start &&
        permit.to < req.simulationDate,
    )
  )
    return undefined;
  return atLeastYears(
    start > req.firstEntry ? start : req.firstEntry,
    req.simulationDate,
    old.generalYears.value,
  );
}
const humanitarianKinds = [
  'subsidiary',
  'resettlement',
  'integration',
  'humanitarian',
  'temporary-humanitarian',
];

function skilledPension(req: DeFullRequest) {
  if (req.simulationDate < v.skilledCurrentFrom.value) return undefined;
  const short = old.skilledTrainedContributionMonths.value;
  const usual = old.skilledContributionMonths.value;
  const standard = any(
    atLeast(req.contributionMonths, usual),
    all(req.trainedInGermany, atLeast(req.contributionMonths, short)),
  );
  const alternative = req.settlement?.skilledAlternativePension;
  return any(standard, alternative ? decided(alternative) : false);
}

function childSentenceBars(req: DeFullRequest) {
  const a = req.settlement ?? {};
  const limits = v.childSettlement.value;
  const barred = a.childJudgments?.map((s) => {
    if (
      s.judgmentDate > req.simulationDate ||
      afterYears(s.judgmentDate, limits.offenceWindowYears) <=
        req.simulationDate
    )
      return false;
    const threshold = {
      fine: limits.fineUnits,
      youth: limits.youthMonths,
      prison: limits.prisonMonths,
    }[s.kind];
    return all(s.intentional, s.amount >= threshold);
  });
  return any(
    a.childYouthSentenceDeferred,
    barred ? any(false, ...barred) : undefined,
    a.childPersonalExpulsionInterest,
  );
}

function childPermissionTime(req: DeFullRequest) {
  const a = req.settlement ?? {};
  if (!req.birthDate || !a.childPermitSince) return undefined;
  const p = v.childSettlement.value;
  const age = fullYears(req.birthDate, req.simulationDate);
  if (age < p.birthday) return false;
  const at =
    age < p.adulthood
      ? afterYears(req.birthDate, p.birthday)
      : req.simulationDate;
  // SRC-418 requires the first qualifying permit before the 18th birthday.
  if (fullYears(req.birthDate, a.childPermitSince) >= p.adulthood) return false;
  const since =
    req.firstEntry && req.firstEntry > a.childPermitSince
      ? req.firstEntry
      : a.childPermitSince;
  const anniversary = afterYears(since, p.years);
  if (at < anniversary) return false;
  if (
    a.childSchoolCredit === 'recognised-full' ||
    a.childForeignSchoolDays === 0
  )
    return true;
  if (
    a.childSchoolCredit === 'under-review' ||
    a.childForeignSchoolDays === undefined
  )
    return undefined;
  return at >= addDays(anniversary, a.childForeignSchoolDays);
}

// A case-dependent answer should tell the applicant which evidence can resolve it.
const evidenceForReview: Record<string, readonly [string, string]> = {
  C17: [
    '需核实德国合格毕业经历、本人养老记录或等值／医疗豁免决定。',
    'Confirm the qualifying German graduation, personal contribution record or ruling on equivalent provision or a medical exception.',
  ],
  C22: [
    '请核实申请人与德国公民的关系、实际家庭生活，以及适用时的年龄和监护证明。',
    'Confirm the relationship and actual family life with the German citizen, and where applicable the child’s age and care arrangements.',
  ],
  'C24-notice': [
    '需要 BAMF 对相应通知的机关记录。申请人未收到信件不能确定机关间的状态；历史版本也须核对。',
    'The relevant BAMF inter-agency record is needed. An applicant’s lack of correspondence leaves this open, as does an unverified historical version.',
  ],
  C25: [
    '需确认当地普通档生计口径、稳定收入和福利，或核实法定退休年龄／医疗豁免。',
    'Confirm the local ordinary-band assessment, sustainable income and benefits, or the statutory pension-age or medical exemption.',
  ],
  C26: [
    '需确认当地加速档认定。柏林有自己的福利占比要求，其他地区应填写当地机关结论。',
    'Confirm the local accelerated-band assessment. Berlin publishes a benefit-share test. Elsewhere use the relevant authority’s assessment.',
  ],
  'C30-pension': [
    '需核实本人或同住配偶的未来养老保障、等值供养或医疗例外。缴费低于可要求的上限仍可获认可。',
    'Confirm projected own or spousal retirement provision, accepted equivalents or a medical exemption. A shorter contribution record can still be accepted.',
  ],
  'C32-time': [
    '请提供连续许可、先前庇护程序和出境记录，或主管机关核定折算后的起算日。',
    'Supply continuous permit, preceding asylum and absence records, or the start date after credited periods have been determined.',
  ],
  'C32-discretion': [
    '授予人道定居取决于主管机关的个案决定。',
    'The authority must decide whether to grant humanitarian settlement in this case.',
  ],
  'C34-title': [
    '需核对许可法条及企业、自由职业或兼营的认定。',
    'Check the permit provision and the classification of entrepreneurial, freelance or ancillary activity.',
  ],
  'C35-business': [
    '需以经营账目等证明确认现有业务的持续前景。',
    'Accounts and other evidence must establish the sustainable prospects of the current business.',
  ],
  'C35-discretion': [
    '企业经营定居仍需主管机关行使授予裁量。',
    'Entrepreneurial settlement still requires the authority to exercise its discretion.',
  ],
  'C36-time': [
    '需核实出生日期、首次及连续持证时间，以及在相关生日或决定日前国外上学的天数或认可折算。',
    'Confirm birth date, first and continuous qualifying permits and any schooling abroad or accepted credit up to the relevant birthday or decision date.',
  ],
  'C37-conduct': [
    '请核实故意犯罪裁判、刑量、日期和个人行为驱逐利益。仅在裁量下可能获批的情形需等待决定。',
    'Confirm the intentional offence, final sentence, date and personal-conduct grounds. Where only a discretionary grant is available its outcome remains open.',
  ],
  'C37-aid': [
    '请核实福利类别、教育目标和医学例外。大学教育与青年援助并存或需要裁量时，须按个案确认。',
    'Confirm the benefit, educational qualification and any medical exception. University study alongside youth assistance or a discretionary grant requires individual assessment.',
  ],
  'C38-work': [
    '请核实本人的每周实际工时，不规则工时或自雇需有可认可的证明。',
    'Confirm the applicant’s actual weekly hours, including accepted evidence for variable hours or self-employment.',
  ],
  'C39-post': [
    '请核实学术资格、科研专长或突出任职的证明及个案认定。联邦法没有统一的多年经验数字。',
    'Confirm academic qualifications, specialist knowledge or a prominent post and the assessment of the special case. Federal law gives no fixed number of years of experience.',
  ],
  'C41-appointment': [
    '请提供 Ernennungsurkunde，确认正式公务员任用及德国公法雇主。',
    'Check the Ernennungsurkunde confirming formal appointment by the German public-law employer.',
  ],
  'C42-maintenance': [
    '需核实扶养请求可执行、款项来自原配偶及可持续供养金额。',
    'Confirm enforceability, payment from the former spouse’s own funds, and sustainable amounts.',
  ],
};

export function settlementChecks(
  route: string,
  req: DeFullRequest,
): CountryCheck[] {
  const a = req.settlement ?? {};
  const checks: CountryCheck[] = [];
  const item = (
    id: string,
    zh: string,
    en: string,
    met: boolean | undefined,
    law: string,
    pd: string,
    ...extra: ReturnType<typeof src>[]
  ) => {
    checks.push(
      check(
        req.locale ?? 'zh-CN',
        'DE-' + id,
        zh,
        en,
        met,
        [src(100, law), ...extra],
        pd,
        met === undefined ? evidenceForReview[id] : undefined,
      ),
    );
  };
  switch (route) {
    case 'R02': {
      item(
        'C15',
        '符合 Fachkraft 法定资格，具备认可的职业或学术资格',
        'Recognised professional or academic qualification as a skilled worker',
        a.skilledQualification,
        '§§ 18 Abs. 3, 18c Abs. 1 Satz 1 Nr. 1, Satz 2',
        'PD-346',
        src(107, 'Nr. 18c.1.2, p.117'),
      );
      item(
        'C16',
        '目前实际从事许可涵盖的合格工作或科研',
        'Currently employed in a qualifying job or research position',
        qualifying(a.currentSkilledPost, 'unconfirmed', [
          'qualified',
          'research',
          'blue-card',
        ]),
        '§ 18c Abs. 1 Satz 1 Nr. 2; §§ 18a, 18b, 18d, 18g',
        'PD-346',
        src(430, 'Voraussetzungen: Arbeitsplatz'),
      );
      item(
        'C17',
        `本人养老缴费（通常 ${old.skilledContributionMonths.value} 个月，德国毕业档 ${old.skilledTrainedContributionMonths.value} 个月）或认可替代`,
        `Own pension contributions (${old.skilledContributionMonths.value} months, or ${old.skilledTrainedContributionMonths.value} for qualifying German graduates) or an accepted alternative`,
        skilledPension(req),
        '§ 18c Abs. 1 Satz 1 Nr. 3, Satz 2',
        'PD-344',
        src(439, 'BGBl. 2023 I Nr. 217 Art. 2 Nr. 12, Art. 12 Abs. 1'),
      );
      const first = a.initialSkilledPermit;
      if (first) {
        const limits = v.initialSkilledSalary.value;
        const age =
          req.birthDate === undefined
            ? undefined
            : fullYears(req.birthDate, first.appliedOn);
        const inYear = Number(first.appliedOn.split('-')[0]) === limits.year;
        const financial = any(
          age === undefined ? undefined : age < limits.age,
          inYear
            ? atLeast(first.annualGrossSalary, limits.annualGross)
            : undefined,
          first.adequatePension,
          first.publicInterestException
            ? decided(first.publicInterestException)
            : false,
        );
        item(
          'C16-initial',
          '首次申请 §§ 18a/b 时的岗位、认可、执业许可、就业同意与年龄工资档',
          'Job, recognition, licences, employment approval, age and salary for a first §§ 18a/b permit',
          all(
            first.jobAndQualificationRecognised,
            first.occupationalLicenceAndBA,
            first.genuineOfferConfirmed,
            financial,
          ),
          '§ 18 Abs. 2 Satz 1 Nr. 1–5, Sätze 2–3',
          'PD-346',
          src(425, 'BAnz AT 18.12.2025 B2 p.1'),
        );
      }
      break;
    }
    case 'R04':
      item(
        'C22',
        '与德国公民在德国继续实际家庭生活，并符合对应的亲属身份',
        'Continuing family life in Germany with the German citizen in a qualifying family relationship',
        all(familyBasis(req), a.germanFamilyLifeInGermany),
        '§ 28 Abs. 1–3',
        'PD-352',
        src(108, 'Nr. 28.2.3, p.165'),
        src(427, 'Voraussetzungen'),
      );
      break;
    case 'R05':
    case 'R05-fast': {
      const fast = route === 'R05-fast';
      const permit = currentPermit(req);
      const held = permit?.kind;
      const title =
        a.protectionTitle ??
        (held === 'resettlement' && permit?.protectedResettlement !== undefined
          ? permit.protectedResettlement
            ? 'section23-4'
            : 'other'
          : held === 'protection'
            ? 'section25-refugee'
            : held && held !== 'resettlement'
              ? 'other'
              : undefined);
      const needsWithdrawalCheck =
        title === 'section23-4' || title === 'legacy-resettlement';
      const protection = all(
        title === undefined ? undefined : title !== 'other',
        needsWithdrawalCheck
          ? a.resettlementWithdrawalGrounds === undefined
            ? undefined
            : !a.resettlementWithdrawalGrounds
          : true,
      );
      item(
        'C24-title',
        '目前持法定保护或重新安置许可，并符合相应撤回限制',
        'Current qualifying protection or resettlement permit and applicable withdrawal condition',
        protection,
        '§§ 26 Abs. 3 Sätze 1, 3, 6, 104 Abs. 5',
        'PD-351',
      );
      const notice = a.bamfNotice;
      const deprivationBarsGrant =
        !fast && req.simulationDate >= v.protectionNoticeFrom.value;
      const clear =
        notice === undefined ||
        notice === 'only-applicant-unaware' ||
        req.simulationDate < v.protectionPriorNoticeFrom.value
          ? undefined
          : notice === 'confirmed-none' ||
            (notice === 'deprivation' && !deprivationBarsGrant);
      item(
        'C24-notice',
        '已核实 BAMF 未发出适用档次所列的机关间通知',
        'BAMF confirmed no inter-agency notification barring this band',
        clear,
        '§ 26 Abs. 3 Satz 1 Nr. 2, Satz 3 Nr. 2',
        'PD-351',
        ...v.protectionPriorNoticeFrom.sources,
        ...v.protectionNoticeFrom.sources,
      );
      item(
        fast ? 'C26' : 'C25',
        fast
          ? '达到难民加速档的较高生计要求'
          : '达到难民普通档的生计要求或适用法定豁免',
        fast
          ? 'Livelihood is secured to the higher accelerated-band standard'
          : 'Livelihood is predominantly secured or a statutory exemption applies',
        refugeeShare(req, fast),
        '§ 26 Abs. 3 Satz 1 Nr. 3, Satz 2, Satz 3 Nr. 4, Satz 4',
        'PD-351',
        src(
          428,
          'Voraussetzungen: Gesicherter Lebensunterhalt durch eigenes Einkommen',
        ),
        src(423, 'SGB VI §§ 35 Satz 2, 235 Abs. 2'),
      );
      break;
    }
    case 'R06':
      item(
        'C27',
        '现持身份符合长期居留法对临时居留、外交和保护身份的规定',
        'No exclusion for a temporary, diplomatic, protection or other excluded residence status',
        qualifying(a.euExcludedStatus, 'unconfirmed', ['none']),
        '§ 9a Abs. 3 Nr. 1–5',
        'PD-353',
        src(437, 'Art. 3–4'),
      );
      item(
        'C29-income',
        '本人和法定扶养家属有可持续的固定、规律收入',
        'Fixed and regular income for the applicant and legal dependants',
        a.euRegularIncome,
        '§§ 9a Abs. 2 Satz 1 Nr. 2, 9c Satz 1',
        'PD-341',
        src(108, 'Nr. 9a.2.1.2'),
      );
      item(
        'C29-tax',
        '已履行适用税务义务',
        'Applicable tax obligations fulfilled',
        a.euTaxDutiesFulfilled,
        '§ 9c Satz 1 Nr. 1',
        'PD-341',
        src(108, 'Nr. 9c.1.1'),
      );
      item(
        'C29-work',
        '以工作获得收入时，本人或同住配偶具备所需就业及执业许可',
        'Required work and professional licences where regular income is earned through work, including the cohabiting spouse alternative',
        qualifying(a.euWorkLicences, 'under-review', [
          'satisfied',
          'not-required',
        ]),
        '§ 9c Satz 1 Nr. 4, Satz 2',
        'PD-346',
        src(108, 'Nr. 9c.1.4'),
      );
      item(
        'C30-pension',
        '本人或同住配偶的预期养老足够，或因疾病、残障不能满足',
        'Adequate retirement provision of the applicant or cohabiting spouse, or the medical exception',
        a.euRetirementProvision
          ? qualifying(a.euRetirementProvision, 'under-review', [
              'adequate-own',
              'adequate-cohabiting-spouse',
              'medical-exemption',
            ])
          : atLeast(
              req.contributionMonths,
              old.generalContributionMonths.value,
            ) ||
              (req.common?.spouseInHousehold &&
                atLeast(
                  req.common.spouseContributionMonths,
                  old.generalContributionMonths.value,
                )) ||
              undefined,
        '§ 9c Satz 1 Nr. 2, Satz 3',
        'PD-344',
        src(429, 'Altersversorgung'),
      );
      item(
        'C30-care',
        '本人及适用家属的医疗和护理风险均有法定或认可的长期保险保障',
        'Statutory or accepted lasting cover for illness and long-term care for the applicant and relevant family',
        qualifying(a.euCareCover, 'under-review', [
          'statutory',
          'equivalent-accepted',
        ]),
        '§ 9c Satz 1 Nr. 3',
        'PD-343',
        src(429, 'Krankenversicherung'),
      );
      break;
    case 'R09': {
      const held = currentPermit(req);
      item(
        'C32-title',
        '目前持第 5 节许可，可按 § 26 Abs. 4 办理',
        'Current Section 5 residence permit within § 26(4)',
        a.humanitarianCurrentTitle ??
          (held ? humanitarianKinds.includes(held.kind) : undefined),
        '§ 26 Abs. 4 Satz 1',
        'PD-354',
        src(416, 'Voraussetzungen'),
      );
      item(
        'C32-time',
        '持证年限达到要求，计入符合条件的先前庇护程序',
        'Required permit period including the qualifying preceding asylum procedure',
        humanitarianTime(req),
        '§§ 26 Abs. 4 Sätze 1, 3, 9 Abs. 2 Satz 1 Nr. 1',
        'PD-126',
      );
      item(
        'C32-discretion',
        '人道定居的主管机关裁量决定',
        'Discretionary decision on humanitarian settlement',
        decided(a.humanitarianDecision),
        '§ 26 Abs. 4 Satz 1',
        'PD-354',
        src(416, 'Voraussetzungen'),
      );
      break;
    }
    case 'R10': {
      item(
        'C34-title',
        '目前持 § 21 企业经营许可',
        'Current § 21 entrepreneurial permit',
        qualifying(a.businessPermit, 'mixed-or-ancillary', ['entrepreneur']),
        '§ 21 Abs. 4–6',
        'PD-354',
        src(417, 'Voraussetzungen'),
      );
      item(
        'C34-time',
        '在合格许可下连续实际经营达到法定年限',
        'Required period of continuous actual business operation under the qualifying permit',
        atLeastYears(
          a.continuousBusinessSince,
          req.simulationDate,
          v.businessYears.value,
        ),
        '§ 21 Abs. 4 Satz 2',
        'PD-354',
      );
      item(
        'C35-business',
        '现有经营的成功和期间足以证明业务能够持续发展',
        'Success and duration of the existing business support sustainable future development',
        decided(a.businessSustainability),
        '§ 21 Abs. 4 Satz 2',
        'PD-354',
        src(417, 'Erforderliche Unterlagen'),
      );
      item(
        'C35-discretion',
        '企业经营定居的主管机关裁量决定',
        'Discretionary decision on entrepreneurial settlement',
        decided(a.businessGrant),
        '§ 21 Abs. 4 Satz 2',
        'PD-354',
      );
      const first = a.initialBusinessPermit;
      if (first) {
        const ageCovered =
          req.birthDate === undefined
            ? undefined
            : first.appliedOn <=
              afterYears(req.birthDate, v.initialEntrepreneurPensionAge.value);
        const basis = any(
          all(
            first.economicOrRegionalNeed,
            first.positiveEconomicImpact,
            first.financingSecured,
          ),
          first.alternativeLegalBasis
            ? decided(first.alternativeLegalBasis)
            : false,
        );
        item(
          'C34-initial',
          '首次企业许可的经济依据、融资及适用的养老要求',
          'Economic basis, financing and applicable old-age provision for a first business permit',
          all(basis, any(ageCovered, first.adequatePension)),
          '§ 21 Abs. 1–3',
          'PD-354',
        );
      }
      break;
    }
    case 'R11': {
      const age =
        req.birthDate === undefined
          ? undefined
          : fullYears(req.birthDate, req.simulationDate);
      const p = v.childSettlement.value;
      const minor = age === undefined ? undefined : age < p.adulthood;
      const beforeMajority =
        req.birthDate && req.firstEntry
          ? fullYears(req.birthDate, req.firstEntry) < p.adulthood
          : undefined;
      const basis =
        a.childPermitBasis === 'humanitarian'
          ? all(beforeMajority, decided(a.childHumanitarianReferral))
          : a.childPermitBasis === undefined
            ? undefined
            : a.childPermitBasis === 'family';
      item(
        'C36-title',
        '家庭居留许可，或未成年入境并经机关准用子女条款的人道许可',
        'Family residence permit, or a humanitarian referral for a child who entered before majority',
        basis,
        '§§ 35 Abs. 1, 26 Abs. 3 Satz 5, Abs. 4 Satz 4',
        'PD-355',
        src(418, 'Voraussetzungen'),
      );
      item(
        'C36-time',
        '在法律规定的生日或成年决定日达到可计持证年限',
        'Credited permit period on the statutory birthday or the decision date for an adult',
        childPermissionTime(req),
        '§ 35 Abs. 1 Sätze 1–2, Abs. 2',
        'PD-355',
        src(418, 'Voraussetzungen'),
      );
      const edu = qualifying(a.childEducation, 'unconfirmed', [
        'school',
        'vocational',
        'university',
      ]);
      const medical = a.childLivelihoodMedicalWaiver
        ? decided(a.childLivelihoodMedicalWaiver)
        : false;
      item(
        'C36-language',
        '成年分支达到 B1 或适用因疾病、残障导致的豁免',
        'B1 German on the adult branch or the applicable medical or disability exemption',
        any(
          minor,
          a.childLanguageB1 ??
            (req.common?.provenGerman === undefined
              ? undefined
              : req.common.provenGerman !== 'none' &&
                req.common.provenGerman >= v.settlementGerman.value),
          a.childLanguageMedicalWaiver
            ? decided(a.childLanguageMedicalWaiver)
            : false,
        ),
        '§§ 35 Abs. 1 Satz 2 Nr. 2, Abs. 4, 2 Abs. 11',
        'PD-347',
      );
      item(
        'C36-livelihood',
        '成年分支生计稳妥、接受认可学历教育或适用疾病豁免',
        'Secure livelihood, recognised education or applicable medical exemption for an adult',
        any(
          minor,
          a.childSecureLivelihood ?? req.common?.livelihoodConfirmed,
          edu,
          medical,
        ),
        '§ 35 Abs. 1 Satz 2 Nr. 3, Abs. 4',
        'PD-355',
      );
      // A statutory bar ends the entitlement. A grant is still possible at discretion.
      const bars = childSentenceBars(req);
      const authority = decided(a.childExceptionDecision);
      item(
        'C37-conduct',
        '无个人行为驱逐利益或条文所列裁判，或已获个案授予',
        'No personal-conduct expulsion interest or listed conviction, or a discretionary grant',
        any(bars === undefined ? undefined : !bars, authority),
        '§ 35 Abs. 3 Satz 1 Nr. 1–2, Sätze 2–3',
        'PD-345',
      );
      const depends = a.childDependsOnSgbIIXIIorVIII;
      const exemptEducation =
        a.childEducation === 'university'
          ? undefined
          : qualifying(a.childEducation, 'unconfirmed', [
              'school',
              'vocational',
            ]);
      item(
        'C37-aid',
        '无指定福利依赖，或符合学校、职业教育、疾病或已认可的个案例外',
        'No reliance on specified benefits, or an applicable education, medical or discretionary exception',
        any(
          depends === undefined ? undefined : !depends,
          exemptEducation,
          medical,
          authority,
        ),
        '§ 35 Abs. 3 Satz 1 Nr. 3, Satz 2, Abs. 4',
        'PD-355',
      );
      break;
    }
    case 'R12':
      item(
        'C38-family',
        '与持 § 18c 定居许可的配偶继续夫妻共同生活',
        'Continuing marital community with a spouse holding § 18c settlement',
        all(a.spouseHoldsSkilledSettlement, a.spousalCommunityContinues),
        '§ 9 Abs. 3a Satz 1 Nr. 1',
        'PD-352',
      );
      item(
        'C38-time',
        '申请人本人已持居留许可达到规定期间',
        'Required period holding a residence permit in the applicant’s own right',
        atLeastYears(
          a.qualifyingSpousePermitSince,
          req.simulationDate,
          v.skilledSpouse.value.permitYears,
        ),
        '§ 9 Abs. 3a Satz 1 Nr. 2',
        'PD-355',
      );
      item(
        'C38-work',
        `本人实际每周工作至少 ${v.skilledSpouse.value.weeklyHours} 小时`,
        `Applicant actually works at least ${v.skilledSpouse.value.weeklyHours} hours per week`,
        a.irregularHoursAssessment
          ? decided(a.irregularHoursAssessment)
          : atLeast(a.regularWeeklyHours, v.skilledSpouse.value.weeklyHours),
        '§ 9 Abs. 3a Satz 1 Nr. 3',
        'PD-355',
        src(107, 'Nr. 9.3a'),
      );
      break;
    case 'R13':
      item(
        'C39-post',
        '具备认可的学术资质，且主管机关认可高资质特殊个案',
        'Academic qualification and an accepted exceptional highly qualified case',
        all(a.highlyQualifiedAcademic, decided(a.exceptionalAcademicPost)),
        '§§ 18 Abs. 3 Nr. 2, 18c Abs. 3 Sätze 1, 3',
        'PD-356',
        src(107, 'Nr. 18c.3'),
        src(430, 'Voraussetzungen'),
      );
      item(
        'C39-consent',
        '已获州要求的同意或该州无需此项同意',
        'Required state consent given or not required in the state concerned',
        qualifying(a.stateConsent, 'pending', ['given', 'not-required']),
        '§ 18c Abs. 3 Satz 2',
        'PD-356',
      );
      item(
        'C40',
        '对融入在德生活的前景已有主管机关认定',
        'Assessment of prospects for integration into life in Germany',
        decided(a.integrationProspects),
        '§ 18c Abs. 3 Satz 1',
        'PD-356',
      );
      break;
    case 'R14':
      item(
        'C41-appointment',
        '正式任命为德国公法雇主的公务员',
        'Formal appointment as a civil servant of a German public-law employer',
        qualifying(a.civilAppointment, 'unconfirmed', ['beamter']),
        '§ 19c Abs. 4 Satz 1',
        'PD-356',
      );
      item(
        'C41-time',
        '正式公务员任用及相应许可达到规定期间',
        'Required period of formal service under the corresponding permit',
        atLeastYears(
          a.civilServicePermitSince,
          req.simulationDate,
          v.civilServiceYears.value,
        ),
        '§ 19c Abs. 4 Satz 3',
        'PD-356',
      );
      break;
    case 'R15':
      item(
        'C42-family',
        '夫妻共同生活已经结束，原配偶目前持有指定永久许可',
        'Marital community has ended and the former spouse holds a qualifying permanent title',
        all(
          a.formerFamilyLifeEnded === undefined
            ? undefined
            : a.formerFamilyLifeEnded <= req.simulationDate,
          qualifying(a.formerSpousePermanentTitle, 'unconfirmed', [
            'settlement',
            'eu-long-term',
          ]),
        ),
        '§§ 28 Abs. 3, 31 Abs. 3',
        'PD-352',
        src(108, 'Nr. 31.3.1–4'),
      );
      item(
        'C42-maintenance',
        '原配偶以自有资金支付可执行的扶养款，结合本人收入可保障生计',
        'Enforceable maintenance from the former spouse’s own funds secures livelihood together with available own income',
        qualifying(a.formerSpouseMaintenance, 'under-review', [
          'own-funds-enforceable-and-sufficient',
        ]),
        '§ 31 Abs. 3',
        'PD-355',
        src(108, 'Nr. 31.3.1–4'),
      );
      break;
  }
  return checks;
}
