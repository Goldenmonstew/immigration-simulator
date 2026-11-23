import { addDays, addMonths, addYears, daysBetween } from './dates';
import {
  ageAtLeast,
  all,
  any,
  assemblePathway,
  check,
  continuity,
  filingContext,
  fromPilot,
  full,
  guideline,
  inapplicable,
  old,
  paidOnTime,
  pilotFor,
  ref,
  threshold,
} from './japan-full-shared';
import type {
  JpFiling,
  JpFullCheck,
  JpFullContext,
  JpFullPathway,
  JpPayment,
  JpText,
} from './japan-full-shared';
import { hspAssessment, jSkipAssessment } from './japan-full-talent';
import type { JpHspSnapshot, JpJSkipSnapshot } from './japan-full-talent';
import type { JpPrRequest } from './japan';
import { afterYears } from './pilot';
import type { IsoDate } from './types';

type FamilyStatus = 'japanese' | 'permanent' | 'special-permanent' | 'other';
type StatusKind =
  | keyof typeof full.longestPeriod.value.maximumMonths
  | 'hsp2'
  | 'permanent'
  | 'special-permanent'
  | 'diplomat'
  | 'temporary-visitor'
  | 'none'
  | 'other';
type Recognition = 'refugee' | 'complementary-protection' | 'pending' | 'none';

export interface JpPrStatusEvidence {
  kind: StatusKind;
  /** Confirmed still valid, including any applicable pending-renewal period. */
  valid?: boolean;
  grantedPeriodMonths?: number | 'indefinite';
  expiresOn?: IsoDate;
  timelyRenewalPending?: boolean;
  heldThreeYearPeriodOnTransitionDay?: boolean;
  transitionPermitExpiresOn?: IsoDate;
  firstApplicationAfterTransition?: boolean;
  decisionOn?: IsoDate;
  /** Confirmation for a permit with an individually determined maximum. */
  authorityConfirmedLongest?: boolean;
  fitsCurrentCriteria?: boolean;
  businessManager?: {
    subjectToRevisedCriteria?: boolean;
    officeInJapan?: boolean;
    eligibleEmployees?: number;
    assetsYen?: number;
    confirmedB2?: boolean;
    relevantGraduateDegree?: boolean;
    managementExperienceYears?: number;
    planProfessionallyConfirmed?: boolean;
  };
}

export interface JpPrFamilyEvidence {
  relativeStatus?: FamilyStatus;
  relation?:
    | 'spouse'
    | 'biological-child'
    | 'special-adoption'
    | 'other-adoption'
    | 'other';
  /** Genuine marriage still in force, including the evidence for time apart. */
  genuineMarriage?: boolean;
  /** For other relationships, a finding under Article 22(2) itself. */
  confirmedStatutoryFamily?: boolean;
}

interface JpPrSchoolChild {
  bornOn?: IsoDate;
  attendance?: 'primary-or-junior-high' | 'not-attending' | 'alternative';
  authorityAccepted?: boolean;
}

interface JpPrIncomeMember {
  relationship: 'shared-home-and-budget' | 'nonresident-dependant' | 'excluded';
  incomeTreatment?:
    'eligible' | 'nonqualifying-activity' | 'parents-not-supporting-applicant';
  annualIncomeYen?: number;
}

export interface JpPrCommonEvidence {
  japaneseCitizen?: boolean;
  inJapan?: boolean;
  status?: JpPrStatusEvidence;
  family?: JpPrFamilyEvidence;
  protectionRecognition?: Recognition;
  internationalProtectionConfirmed?: boolean;
  goodConductConfirmed?: boolean;
  criminalHistory?:
    | 'none'
    | 'custody'
    | 'fine'
    | 'juvenile-order'
    | 'arrest-only'
    | 'traffic-penalty'
    | 'other';
  nationalInterestConfirmed?: boolean;
  japanMainHomeIntended?: boolean;
  contributionEvidence?: boolean;
  statusActivitiesCompliant?: boolean;
  residenceCardDutiesCompliant?: boolean;
  affiliationNotices?: { eventOn: IsoDate; notifiedOn?: IsoDate }[];
  tax?: JpPayment;
  pension?: JpPayment;
  publicHealthInsurance?: JpPayment;
  addressNotices?: {
    eventOn: IsoDate;
    notifiedOn?: IsoDate;
  }[];
  actualAddressAndRegister?: boolean;
  livelihoodConfirmed?: boolean;
  applicantAnnualIncomeYen?: number;
  household?: JpPrIncomeMember[];
  householdIncomeConfirmed?: boolean;
  pendingOnIncomeReviewDate?: boolean;
  expectedAnnualPensionYen?: number;
  spouseExpectedAnnualPensionYen?: number;
  pensionSupplementAssetsYen?: number;
  pensionComparisonConfirmed?: boolean;
  publicAssistance?: 'received' | 'none' | 'statutory-insurance' | 'other';
  publicBurdenConfirmedAcceptable?: boolean;
  humanitarianCircumstances?: boolean;
  publicHealthCleared?: boolean;
  otherLandingGroundsCleared?: boolean;
  guarantor?:
    | 'japanese-resident'
    | 'permanent-resident'
    | 'special-permanent-resident'
    | 'other-resident'
    | 'none';
  guarantorDocumentsReady?: boolean;
  guarantorAcceptedOrWaived?: boolean;
  qualifyingHspApplicantOrFamily?: boolean;
  otherLanguageExemptionConfirmed?: boolean;
  qualifyingSchoolYears?: number;
  raisingParentB1Confirmed?: boolean;
  japaneseB1Confirmed?: boolean;
  integrationKnowledgeConfirmed?: boolean;
  /** Include an applicant of compulsory-school age and any children they raise. */
  schoolChildren?: JpPrSchoolChild[];
  filer?: JpFiling;
  documentsReady?: boolean;
  photoReady?: boolean;
  photoRequiredByAuthority?: boolean;
  specialPermission?: {
    kind: 'none' | 'stay' | 'landing-refusal' | 'other';
    grantedOn?: IsoDate;
  };
  feeReduction?: 'approved' | 'denied' | 'requested' | 'not-requested';
  integratedCard?: {
    requested: boolean;
    immigrationChargeApplies?: boolean;
    jLisChargeApplies?: boolean;
    electronicCertificate?: boolean;
  };
}

export type JpFullPrRoute =
  | Extract<JpPrRequest, { route: 'general' | 'spouse' | 'child' }>
  | {
      route: 'child-birth';
      bornOn: IsoDate;
      bornInJapan?: boolean;
      withoutLanding?: boolean;
      acquisitionAccepted?: boolean;
      birthRegisteredOn?: IsoDate;
      plansToStayPastPermitlessPeriod?: boolean;
      heldAnotherStatus?: boolean;
    }
  | { route: 'teijusha' | 'refugee'; statusStart: IsoDate }
  | {
      route: 'hsp70' | 'hsp80';
      statusStart: IsoDate;
      mode?: 'recognised' | 'retrospective';
      recognisedOn?: IsoDate;
      recognisedPoints?: number;
      maintained?: boolean;
      current?: JpHspSnapshot;
      historical?: JpHspSnapshot;
    }
  | {
      route: 'j-skip';
      mode?: 'recognised' | 'retrospective';
      recognisedOn?: IsoDate;
      remainedRecognised?: boolean;
      current?: JpJSkipSnapshot;
      historical?: JpJSkipSnapshot;
    }
  | {
      route: 'international-protection';
      statusStart: IsoDate | 'none';
      newStatusStart?: IsoDate | 'none';
      excluded?: Extract<JpPrRequest, { route: 'general' }>['excluded'];
    }
  | {
      route: 'regional-regeneration';
      planRecognised?: boolean;
      institutionInArea?: boolean;
      designatedInstitutionAndContract?: boolean;
      activityNotice?: number;
      activityQualified?: boolean;
      comparableJapanesePay?: boolean;
      qualifyingTechnologyEducation?: boolean;
      designatedItQualification?: boolean;
      technologyExperienceYears?: number;
      recognisedContribution?: boolean;
    }
  | {
      route: 'structural-zone';
      recognisedZone?: boolean;
      designatedBusiness?: boolean;
      recognisedContribution?: boolean;
    }
  | {
      route: 'japan-contribution';
      recognisedContribution?: boolean;
      category?:
        | 'government-award'
        | 'public-service'
        | 'international-award'
        | 'diplomatic'
        | 'international-organisation'
        | 'prime-director'
        | 'national-award'
        | 'cultural-award'
        | 'world-sport'
        | 'old-company-management'
        | 'old-investment'
        | 'old-professional-contribution'
        | 'old-cultural-leadership'
        | 'old-education'
        | 'old-research'
        | 'old-international-sport'
        | 'old-public-interest'
        | 'old-management'
        | 'old-growing-sector'
        | 'other';
      roleYears?: number;
      investmentYen?: number;
      designatedCategoryEvidence?: boolean;
      oldSocialLifeClear?: boolean;
    };

export interface JpFullPrRequest {
  routes: JpFullPrRoute[];
  evidence?: JpPrCommonEvidence;
}

const titles: Record<JpFullPrRoute['route'], [string, string]> = {
  general: ['一般永住', 'General permanent residence'],
  spouse: ['永住 · 配偶者', 'Permanent residence · spouse'],
  child: ['永住 · 実子等', 'Permanent residence · child'],
  'child-birth': [
    '永住 · 在日出生取得',
    'Permanent residence · acquisition after birth in Japan',
  ],
  teijusha: ['永住 · 定住者', 'Permanent residence · long-term resident'],
  refugee: [
    '永住 · 难民或补完的保护',
    'Permanent residence · refugee or complementary protection',
  ],
  hsp70: [
    '永住 · 高度人材 70 点',
    'Permanent residence · highly skilled 70 points',
  ],
  hsp80: [
    '永住 · 高度人材 80 点',
    'Permanent residence · highly skilled 80 points',
  ],
  'j-skip': ['永住 · 特別高度人材', 'Permanent residence · J-Skip'],
  'international-protection': [
    '永住 · 国际机构保护',
    'Permanent residence · international protection recommendation',
  ],
  'regional-regeneration': [
    '永住 · 地域再生計画',
    'Permanent residence · regional regeneration plan',
  ],
  'structural-zone': [
    '永住 · 構造改革特別区域',
    'Permanent residence · structural reform special zone',
  ],
  'japan-contribution': [
    '永住 · 対日貢献',
    'Permanent residence · contribution to Japan',
  ],
};

function familyEligibility(f?: JpPrFamilyEvidence) {
  const eligibleStatus =
    f?.relativeStatus === undefined ? undefined : f.relativeStatus !== 'other';
  const spouse = all(
    eligibleStatus,
    f?.relation === undefined ? undefined : f.relation === 'spouse',
    f?.genuineMarriage,
  );
  const child = all(
    eligibleStatus,
    f?.relation === 'biological-child' ||
      (f?.relation === 'special-adoption' && f.relativeStatus === 'japanese')
      ? true
      : f?.relation === 'other' || f?.relation === 'spouse'
        ? false
        : f?.confirmedStatutoryFamily,
  );
  return { spouse, child, confirmed: any(spouse, child) };
}

function longestPeriod(status: JpPrStatusEvidence | undefined, date: IsoDate) {
  if (!status) return undefined;
  if (status.authorityConfirmedLongest !== undefined)
    return status.authorityConfirmedLongest;
  const p = full.longestPeriod.value;
  const period = status.grantedPeriodMonths;
  if (period === undefined) return undefined;
  if (
    status.kind === 'hsp2' ||
    status.kind === 'permanent' ||
    status.kind === 'special-permanent'
  )
    return period === 'indefinite';
  if (period === p.deemedMonths) {
    if (date <= p.transitionOn) return true;
    if (
      status.kind in p.maximumMonths &&
      p.maximumMonths[status.kind as keyof typeof p.maximumMonths] === period
    )
      return true;
    return all(
      status.heldThreeYearPeriodOnTransitionDay,
      status.firstApplicationAfterTransition,
      status.decisionOn && status.transitionPermitExpiresOn
        ? status.decisionOn >= date &&
            status.decisionOn <= status.transitionPermitExpiresOn
        : undefined,
    );
  }
  if (!(status.kind in p.maximumMonths)) return undefined;
  return (
    period === p.maximumMonths[status.kind as keyof typeof p.maximumMonths]
  );
}

function onTimeNotices(
  date: IsoDate,
  maxDays: number,
  events?: { eventOn: IsoDate; notifiedOn?: IsoDate }[],
) {
  return (
    events &&
    all(
      ...events
        .filter((event) => event.eventOn <= date)
        .map((event) => {
          const elapsed = daysBetween(event.eventOn, date);
          if (!event.notifiedOn || event.notifiedOn > date)
            return elapsed > maxDays ? false : undefined;
          const days = daysBetween(event.eventOn, event.notifiedOn);
          return days >= 0 && days <= maxDays;
        }),
    )
  );
}

function inSchoolAge(date: IsoDate, born?: IsoDate) {
  if (!born) return undefined;
  const p = full.schoolAge.value;
  // The statutory age is reached at the end of the day before the birthday.
  const schoolYearBoundary = (age: number, boundary: string) => {
    const anniversary = afterYears(born, age);
    const attainedOn = addDays(anniversary, -1);
    const inAttainmentYear = `${attainedOn.slice(0, 4)}-${boundary}`;
    return attainedOn < inAttainmentYear
      ? inAttainmentYear
      : addYears(inAttainmentYear, 1);
  };
  const exitAttainment = addDays(afterYears(born, p.exitAge), -1);
  const endThisYear = `${exitAttainment.slice(0, 4)}-${p.schoolYearEnd}`;
  const end =
    exitAttainment <= endThisYear ? endThisYear : addYears(endThisYear, 1);
  return (
    date >= schoolYearBoundary(p.entryAge, p.schoolYearStart) && date <= end
  );
}

function incomeReviewActive(date: IsoDate, pending?: boolean) {
  const p = full.incomeReview.value;
  return date < p.filingsFrom ? false : date >= p.pendingOn ? true : pending;
}

function incomeEvidence(e: JpPrCommonEvidence, L: JpText): string {
  const members = e.household;
  if (!members || e.applicantAnnualIncomeYen === undefined)
    return L(
      '需确认同住共财、受扶养亲属及可计入的收入。',
      'Confirm shared residence and finances, dependants and includable income.',
    );
  const included = members.filter(
    (m) => m.relationship === 'shared-home-and-budget',
  );
  const householdSize =
    1 +
    included.length +
    members.filter((m) => m.relationship === 'nonresident-dependant').length;
  const countable = included.filter((m) => m.incomeTreatment === 'eligible');
  const incomplete = included.some(
    (m) =>
      !m.incomeTreatment ||
      (m.incomeTreatment === 'eligible' && m.annualIncomeYen === undefined),
  );
  const amount = countable.reduce(
    (sum, m) => sum + (m.annualIncomeYen ?? 0),
    e.applicantAnnualIncomeYen,
  );
  const adjustment =
    householdSize >= full.incomeReview.value.householdSizeForAdjustment;
  return L(
    `计入人数 ${householdSize}，已填写的可计入年收入 JPY ${amount}${incomplete ? '（部分成员收入未确认）' : ''}。${adjustment ? '适用生活费增量。' : ''}`,
    `Counted household size ${householdSize}; reported includable annual income JPY ${amount}${incomplete ? ' (some income unconfirmed)' : ''}.${adjustment ? ' A living-cost adjustment applies.' : ''}`,
  );
}

export function assessJapanPr(
  req: JpFullContext,
  route: JpFullPrRoute,
  e: JpPrCommonEvidence,
): JpFullPathway {
  const { date, L } = filingContext(req);
  const newer = date >= old.newGuidelineFrom.value;
  const birth = route.route === 'child-birth';
  const history = continuity(req, date);
  const inJapan = history.abroad ? false : e.inJapan;
  const family = familyEligibility(e.family);
  const recognised =
    e.protectionRecognition === undefined
      ? undefined
      : e.protectionRecognition === 'refugee' ||
        e.protectionRecognition === 'complementary-protection';
  const relief = any(
    family.confirmed,
    recognised,
    e.internationalProtectionConfirmed,
  );
  const status = e.status;
  const ineligibleStatus = status?.kind === 'none' ? true : undefined;
  const validStatus =
    (status?.kind === 'temporary-visitor' && status.fitsCurrentCriteria !== true
      ? undefined
      : status?.valid) ??
    (ineligibleStatus
      ? false
      : status?.kind === 'temporary-visitor'
        ? undefined
        : status?.expiresOn && date > status.expiresOn
          ? status.timelyRenewalPending === false ||
            date > addMonths(status.expiresOn, old.renewalPendingMonths.value)
            ? false
            : undefined
          : status?.expiresOn
            ? true
            : undefined);
  const prDoesNotApply =
    e.japaneseCitizen === true ||
    status?.kind === 'permanent' ||
    status?.kind === 'special-permanent' ||
    (birth &&
      route.plansToStayPastPermitlessPeriod === false &&
      date <= addDays(route.bornOn, old.birthStayWithoutStatusDays.value) &&
      route.heldAnotherStatus !== true &&
      req.trips.some((t) => t.departed >= route.bornOn) === false);
  const v = full;
  const art22 = ref(newer ? 'SRC-441' : 'SRC-110', '第22条第2項');
  const prProcedure = ref('SRC-119', '申請期間・申請提出者・必要書類');
  const oldGuideline = ref('SRC-113', '1(1)–(3)');
  const focus = (n: string, oldRef = oldGuideline) => [
    newer ? guideline(n) : oldRef,
  ];
  const values: JpFullCheck[] = [];
  const p = (
    key: string,
    zh: string,
    en: string,
    met: boolean | undefined,
    sources: Parameters<typeof check>[3],
    detailZh: string,
    detailEn: string,
    pending: string[] = [],
    kind?: JpFullCheck['kind'],
  ) => {
    const c = check(
      `jp.pr.${key}`,
      L(zh, en),
      met,
      sources,
      L(detailZh, detailEn),
      pending,
      kind,
    );
    values.push(c);
    return c;
  };
  const skip = (condition: JpFullCheck, zh: string, en: string) => {
    values[values.indexOf(condition)] = inapplicable(condition, L(zh, en));
  };
  const factor = (
    key: string,
    zh: string,
    en: string,
    met: boolean | undefined,
    sources: Parameters<typeof check>[3],
    detailZh: string,
    detailEn: string,
    ...pending: string[]
  ) => p(key, zh, en, met, sources, detailZh, detailEn, pending, 'factor');

  const timeProxy = ((): JpPrRequest => {
    switch (route.route) {
      case 'international-protection':
        return { ...route, route: 'general' };
      case 'j-skip':
        return {
          route: 'hsp80',
          statusStart:
            route.mode === 'recognised'
              ? (route.recognisedOn ?? date)
              : req.stayStart,
        };
      case 'regional-regeneration':
      case 'structural-zone':
        return { route: 'hsp70', statusStart: req.stayStart };
      case 'japan-contribution':
        return { route: 'teijusha', statusStart: req.stayStart };
      default:
        return route;
    }
  })();
  const pilot = pilotFor(req, { pr: timeProxy });
  const special =
    route.route !== 'general' &&
    route.route !== 'international-protection' &&
    !birth;
  const originalTime =
    route.route === timeProxy.route ||
    route.route === 'international-protection';
  const needCount =
    timeProxy.route === 'general' || timeProxy.route === 'spouse' ? 2 : 1;
  const timeIds = birth
    ? ['birth-filing-window']
    : timeProxy.route === 'general'
      ? ['continuous-stay', 'qualifying-status-stay']
      : timeProxy.route === 'spouse'
        ? ['married-life', 'continuous-stay']
        : ['continuous-stay'];
  const timeChecks = pilot.checks
    .slice(0, needCount)
    .map((c, i) =>
      fromPilot(
        `jp.pr.${timeIds[i]}`,
        L('时间条件', 'Time requirement'),
        c,
        pilot.pendingDetails,
      ),
    );
  if (!originalTime) {
    const sources =
      route.route === 'j-skip' ? v.jSkip.sources : v.exceptionalPr.sources;
    const years =
      route.route === 'j-skip'
        ? v.jSkip.value.stayYears
        : route.route === 'japan-contribution'
          ? v.exceptionalPr.value.contributionYears
          : route.route === 'structural-zone'
            ? v.exceptionalPr.value.zoneYears
            : v.exceptionalPr.value.regenerationYears;
    const unknownRecognition =
      route.route === 'j-skip' &&
      route.mode === 'recognised' &&
      !route.recognisedOn;
    timeChecks[0] = check(
      'jp.pr.continuous-stay',
      L('连续在留', 'Continuous stay'),
      unknownRecognition ? undefined : pilot.checks[0].met,
      sources,
      L(
        `该特例要求在日本在留满 ${years} 年。`,
        `This exception requires ${years} years of residence in Japan.`,
      ),
      ['PD-130', 'PD-136', route.route === 'j-skip' ? 'PD-375' : 'PD-374'],
    );
  }
  if (!birth) {
    // The pilot shows the absence checks before the optional check for a day spent abroad.
    const isNewTime =
      (req.trips.find((t) => t.departed < date && date < t.returned)
        ?.returned ?? date) >= old.newGuidelineFrom.value;
    const ids = isNewTime
      ? ['single-absence', 'total-absence']
      : ['old-guideline-absences'];
    ids.forEach((id, i) =>
      timeChecks.push(
        fromPilot(
          `jp.pr.${id}`,
          L('出境记录', 'Absences'),
          pilot.checks[needCount + i],
          pilot.pendingDetails,
        ),
      ),
    );
    timeChecks.push(
      history.abroad
        ? fromPilot(
            'jp.pr.filing-in-japan',
            L('在日本递交', 'Filing in Japan'),
            pilot.checks.at(-1)!,
            ['PD-130'],
          )
        : check(
            'jp.pr.filing-in-japan',
            L('在日本递交', 'Filing in Japan'),
            inJapan,
            [ref('SRC-110', '第22条第1項'), ref('SRC-119', '申請提出者')],
            L(
              '确认递交日在日本。境外代理递交的个案须核对。',
              'Confirm presence in Japan on the filing date. Check any filing by a representative while abroad.',
            ),
            ['PD-130'],
          ),
    );
  }
  const projectedPilot = originalTime
    ? pilot
    : {
        ...pilot,
        ...(route.route === 'j-skip' &&
        route.mode === 'recognised' &&
        !route.recognisedOn
          ? {
              status: 'UNKNOWN' as const,
              earliestDate: undefined,
              summary: L(
                '缺少 J-Skip 认定日期。',
                'The J-Skip recognition date is missing.',
              ),
            }
          : {}),
      };
  if (pilot.status === 'NOT_APPLICABLE') {
    timeChecks[0] = inapplicable(timeChecks[0], pilot.summary);
  }
  values.push(...timeChecks);

  const lawful = p(
    'lawful-filing-status',
    '在日身份及申请',
    'Status and filing in Japan',
    all(inJapan, birth ? true : validStatus),
    [prProcedure, ref('SRC-110', '第20条第6項、第22条、第22条の2')],
    '须核对在日本、原在留资格效力及必要的单独续期。短期滞在或居留效力不清须由官署确认。',
    'Confirm presence in Japan, valid status and any separate renewal. Temporary visitor or unclear status requires confirmation.',
    ['PD-130', 'PD-136'],
  );
  if (birth)
    skip(
      lawful,
      '出生后资格取得的身份和递交时点见专门检查。',
      'See the acquisition and filing-window checks for a newborn.',
    );

  const max = p(
    'longest-period',
    '现持最长在留期间',
    'Longest grant for current status',
    longestPeriod(status, date),
    v.longestPeriod.sources,
    `核对原授予期间及三年过渡。过渡需 ${v.longestPeriod.value.transitionOn} 持三年许可、之后首次递交，并在原许可有效期内处分。`,
    `Check the original grant. The transition requires a three-year grant on ${v.longestPeriod.value.transitionOn}, the first subsequent filing and a decision before that grant expires.`,
    ['PD-369'],
  );
  if (birth)
    skip(
      max,
      '出生取得途径不要求现有在留卡。',
      'Acquisition after birth does not require an existing residence card.',
    );

  const conduct = p(
    'good-conduct',
    '法定品格',
    'Statutory good conduct',
    e.goodConductConfirmed,
    [art22, ...focus('第2の3 (p3–4)')],
    '品格须主管机关综合认定，国内外记录与改正情况可作证。',
    'The authority assesses good conduct using domestic and overseas records and evidence of remediation.',
    ['PD-365'],
  );
  if (family.confirmed === true)
    skip(
      conduct,
      '符合第22条第2項配偶或子女豁免。',
      'The spouse or child exemption in Article 22(2) applies.',
    );

  const crime =
    e.criminalHistory === 'none'
      ? true
      : e.criminalHistory === 'custody' ||
          e.criminalHistory === 'fine' ||
          e.criminalHistory === 'juvenile-order'
        ? false
        : undefined;
  factor(
    'criminal-record',
    '刑事及少年处分',
    'Criminal and juvenile record',
    crime,
    focus('第2の5(4) (p6)'),
    '拘禁刑、罚金刑或适用的少年处分属于负面事实，逮捕、交通处分与境外等效性须核对。',
    'Custody, a criminal fine or a relevant juvenile order may count against the application. Arrests, traffic penalties and foreign equivalence need review.',
    'PD-365',
  );

  p(
    'national-interest',
    '日本国利益及生活本拠',
    'Japan’s national interest and main home',
    e.nationalInterestConfirmed,
    [art22, ...focus('第1の1、第2の5(1)(11) (p2, p5–6, p9)')],
    `由主管机关综合认定。${e.japanMainHomeIntended === true ? '已填写以日本为主要生活地。' : e.japanMainHomeIntended === false ? '已填写主要生活地不在日本。' : ''}${e.contributionEvidence ? '已填写贡献材料。' : ''}`,
    `The authority makes a discretionary assessment.${e.japanMainHomeIntended === true ? ' Japan is reported as the intended main home.' : e.japanMainHomeIntended === false ? ' The intended main home is reported to be outside Japan.' : ''}${e.contributionEvidence ? ' Contribution evidence was reported.' : ''}`,
    ['PD-360'],
  );

  const duties = v.immigrationDuties.value;
  factor(
    'immigration-duties',
    '入管义务及活动合规',
    'Immigration duties and permitted activities',
    all(
      e.statusActivitiesCompliant,
      e.residenceCardDutiesCompliant,
      onTimeNotices(date, duties.affiliationDays, e.affiliationNotices),
    ),
    [...v.immigrationDuties.sources, ...focus('第2の5(2) (p6)')],
    `核对获准活动及资格外许可、在留卡义务和事件申报；适用申报须在 ${duties.affiliationDays} 日内，未满 ${duties.cardCarryingAge} 岁免携带义务。`,
    `Check permitted activity, card duties and required notices. Relevant notices are due within ${duties.affiliationDays} days; card carrying is exempt under age ${duties.cardCarryingAge}.`,
    'PD-366',
  );

  const windows = v.evidenceYears.value;
  const window =
    route.route === 'j-skip'
      ? route.mode === 'retrospective'
        ? windows.jSkipRetrospective
        : undefined
      : birth || route.route === 'child'
        ? windows.child
        : route.route === 'spouse' ||
            route.route === 'hsp70' ||
            route.route === 'hsp80'
          ? windows[route.route]
          : windows.regular;
  const evidenceText = (years?: number): [string, string] =>
    years === undefined
      ? ['材料期间按适用手续核对。', 'Check the applicable evidence checklist.']
      : [
          `常用证明期间为最近 ${years} 年。`,
          `The usual evidence window is the latest ${years} years.`,
        ];
  const payment = (
    key: string,
    zh: string,
    en: string,
    answer: JpPayment | undefined,
    years?: number,
  ) => {
    const [a, b] = evidenceText(years);
    return factor(
      key,
      zh,
      en,
      paidOnTime(answer),
      [
        ...focus('第2の5(3) (p6)', ref('SRC-113', '1(3)イ')),
        ...v.evidenceYears.sources,
      ],
      `${a} 核对适用义务、有效免除和原期限内缴付。迟缴后补缴仍可能有影响。`,
      `${b} Check applicable duties, lawful exemptions and payment by the original due date. Late payment can still count against the application.`,
      'PD-366',
    );
  };
  payment('tax', '国税与地方税', 'National and local tax', e.tax, window?.tax);
  payment(
    'pension-payments',
    '公的年金与缴付',
    'Public pension and timely payment',
    e.pension,
    window?.insurance,
  );
  payment(
    'public-health-insurance',
    '公的医疗保险与缴付',
    'Public health insurance and timely payment',
    e.publicHealthInsurance,
    window?.insurance,
  );

  factor(
    'address-registration',
    '实际住所及住址登记',
    'Actual address and registration',
    all(
      e.actualAddressAndRegister,
      onTimeNotices(date, duties.addressDays, e.addressNotices),
    ),
    v.immigrationDuties.sources,
    `核对住民票与适用入住、迁居或身份取得后 ${duties.addressDays} 日内的申报。出生取得可用规定住民票办理。`,
    `Check the resident record and any notice due within ${duties.addressDays} days of establishing or changing the address or acquiring status. Acquisition after birth can use a prescribed resident record.`,
    'PD-366',
  );

  const livelihood = p(
    'independent-livelihood',
    '独立生计',
    'Independent livelihood',
    e.livelihoodConfirmed,
    [art22, ref('SRC-110', '第61条の2の14'), ...focus('第2の4(1) (p4)')],
    '核对同一生计家庭当前和未来可用于生计的资产、技能及收入，结合主管机关结论。',
    'The authority evaluates assets, skills and the shared household’s current and future means of support.',
    ['PD-361'],
  );

  const incomeOn = incomeReviewActive(date, e.pendingOnIncomeReviewDate);
  const income = factor(
    'household-income',
    '新版世带收入水平',
    'Revised household income standard',
    incomeOn === true ? e.householdIncomeConfirmed : undefined,
    v.incomeReview.sources,
    `${incomeEvidence(e, L)} 官方基准金额、持续期间及口径待确认。${incomeOn === undefined ? ' 另须确认改定日是否仍在审。' : ''}`,
    `${incomeEvidence(e, (_zh, en) => en)} The comparison amount, sustained period and calculation details require confirmation.${incomeOn === undefined ? ' Confirm that the application was pending on the revision date.' : ''}`,
    'PD-361',
  );
  const pension = factor(
    'projected-pension',
    '预计年金及金融资产补足',
    'Projected pension and supplementary assets',
    newer ? e.pensionComparisonConfirmed : undefined,
    v.pensionComparisonYears.sources,
    `对照参保 ${v.pensionComparisonYears.value} 年的参考水准。本人、配偶预计年金及可证明长期资产金额（JPY）分别为 ${e.expectedAnnualPensionYen ?? '待填'} / ${e.spouseExpectedAnnualPensionYen ?? '待填'} / ${e.pensionSupplementAssetsYen ?? '待填'}，官方比较函数有待确认。`,
    `The reference assumes ${v.pensionComparisonYears.value} years of pension coverage. Applicant pension, spouse pension and sustained assets in JPY: ${e.expectedAnnualPensionYen ?? 'unreported'} / ${e.spouseExpectedAnnualPensionYen ?? 'unreported'} / ${e.pensionSupplementAssetsYen ?? 'unreported'}. The comparison method requires confirmation.`,
    'PD-362',
  );
  if (relief === true) {
    for (const c of [livelihood, income, pension])
      skip(
        c,
        '符合独立生计豁免或法定放宽群组。',
        'A statutory livelihood exemption or relaxation applies.',
      );
  } else {
    if (incomeOn === false)
      skip(
        income,
        '该递交案件尚不适用新版收入因素。',
        'The revised income factor does not apply to this filing.',
      );
    if (!newer)
      skip(
        pension,
        '该递交日期尚不适用新版年金预测。',
        'The projected pension factor does not apply on this filing date.',
      );
  }

  const burden = factor(
    'public-burden',
    '公共负担及人道因素',
    'Public burden and humanitarian circumstances',
    incomeOn === true ? e.publicBurdenConfirmedAcceptable : undefined,
    v.incomeReview.sources,
    `${e.publicAssistance === 'received' ? '已填写领取生活保護。' : ''}${e.humanitarianCircumstances === true ? '已填写有人道情由。' : ''} 家庭稳定、特殊情由与公共负担风险仍需个案判断。`,
    `${e.publicAssistance === 'received' ? 'Livelihood protection is reported. ' : ''}${e.humanitarianCircumstances === true ? 'Humanitarian circumstances were reported. ' : ''}Risk, family stability and special circumstances require case-specific review.`,
    'PD-363',
  );
  if (incomeOn === false)
    skip(
      burden,
      '该递交案件尚不适用明确列出的新版公共负担因素。',
      'The expressly listed revised public-burden factor does not apply to this filing.',
    );

  factor(
    'public-health',
    '公衆衛生与健康',
    'Public health grounds',
    e.publicHealthCleared,
    [ref('SRC-110', '第5条第1項第1–3号'), ...focus('第2の5(1)(5) (p6–7)')],
    '须核对适用的官方卫生认定与排除理由。',
    'Confirm any relevant public-health determination or restriction.',
    'PD-367',
  );
  const security = factor(
    'landing-and-security',
    '上陸拒否与治安安全',
    'Landing and security grounds',
    e.otherLandingGroundsCleared,
    [ref('SRC-110', '第5条第1項第4–14号及插号'), guideline('第2の5(5) (p6–7)')],
    `按主管机关所确认的药物、刑事、退去或安全类别与期限核对。第5条第1項第4号列 ${v.severeSentenceYears.value} 年以上拘禁或相当刑，并有政治犯罪例外。`,
    `Use the officially applicable drug, criminal, removal or security ground and its specific dates. Article 5(1)(iv) includes imprisonment or an equivalent sentence of at least ${v.severeSentenceYears.value} year, with an exception for political offences.`,
    'PD-365',
    'PD-367',
  );
  if (!newer)
    skip(
      security,
      '新版单列上陸拒否因素尚未适用，旧版仍审品格、刑事和公衆衛生。',
      'The separately listed revised landing factor is not yet in force; prior conduct, criminal and public-health checks still apply.',
    );

  const b = status?.businessManager;
  const bPolicy = v.businessManager.value;
  const managerCriteria =
    b && b.subjectToRevisedCriteria === true && date >= bPolicy.from
      ? all(
          b.officeInJapan,
          threshold(b.eligibleEmployees, bPolicy.employees),
          threshold(b.assetsYen, bPolicy.businessAssetsYen),
          b.confirmedB2,
          any(
            b.relevantGraduateDegree,
            threshold(b.managementExperienceYears, bPolicy.experienceYears),
          ),
          b.planProfessionallyConfirmed,
        )
      : undefined;
  const criteria = factor(
    'status-criteria',
    '现有资格实体条件及雇主',
    'Current status criteria and employer',
    status?.fitsCurrentCriteria ??
      (status?.kind === 'businessManager' ? managerCriteria : undefined),
    [
      ...focus('第2の5(5) 注3 (p7)'),
      ...v.businessManager.sources,
      ref('SRC-458', '特定活動告示'),
    ],
    `核对现有资格的工作、合同及报酬。经管新版条件包括日本事业所、至少 ${bPolicy.employees} 名合格全职员工、JPY ${bPolicy.businessAssetsYen} 事业财产、${bPolicy.language} 相当与相关学位或 ${bPolicy.experienceYears} 年经验，并核对计划要求和过渡。`,
    `Check the current status’s work, contract and remuneration. Revised Business Manager criteria include a Japanese office, at least ${bPolicy.employees} qualifying full-time employee, JPY ${bPolicy.businessAssetsYen} in business assets, ${bPolicy.language}-equivalent language and a relevant degree or ${bPolicy.experienceYears} years’ experience, plus the applicable plan and transition rules.`,
    'PD-368',
  );
  if (birth)
    skip(
      criteria,
      '出生取得没有既有资格的活动审查。',
      'There is no existing status to review on acquisition after birth.',
    );

  const typicalGuarantor =
    e.guarantor === 'japanese-resident' ||
    e.guarantor === 'permanent-resident' ||
    e.guarantor === 'special-permanent-resident';
  p(
    'guarantor',
    '在日身元保証人',
    'Guarantor residing in Japan',
    e.guarantorAcceptedOrWaived ??
      (typicalGuarantor
        ? e.guarantorDocumentsReady
        : e.guarantor === 'none'
          ? false
          : undefined),
    [
      ref('SRC-440', '第22条第1項第3号・但書、第24条第4項'),
      ref('SRC-116', '出入国審査・在留審査 Q&A Q53'),
      prProcedure,
    ],
    '核对在日保证人、保证书、身份与官署是否同意其他保证人或省略材料。',
    'Confirm a guarantor in Japan, the letter and identity, or official acceptance of an alternative or waiver.',
    ['PD-370'],
  );

  const language = factor(
    'japanese-language',
    '新版日语能力',
    'Revised Japanese language factor',
    newer ? e.japaneseB1Confirmed : undefined,
    v.prLanguage.sources,
    `本人 ${v.prLanguage.value.level} 相当以上，须主管机关认可。自报日语级别和高度人材加分按不同规则核对。`,
    `The authority must recognise ability equivalent to ${v.prLanguage.value.level} or higher. Self-reported language and HSP points are assessed separately.`,
    'PD-364',
  );
  if (!newer)
    skip(
      language,
      '该递交日期尚不适用新版日语因素。',
      'The revised language factor does not apply on this filing date.',
    );
  else if (
    e.qualifyingHspApplicantOrFamily === true ||
    e.otherLanguageExemptionConfirmed === true ||
    threshold(e.qualifyingSchoolYears, v.prLanguage.value.educationYears) ||
    (birth &&
      route.bornInJapan === true &&
      family.child === true &&
      e.family?.relativeStatus === 'permanent' &&
      e.raisingParentB1Confirmed === true)
  )
    skip(
      language,
      '已有新版所列的不考量本人日语水平的事实。',
      'A published circumstance for omitting the applicant’s own language factor applies.',
    );
  const rules = factor(
    'life-rules',
    '制度与生活规则理解',
    'Understanding institutions and everyday rules',
    newer ? e.integrationKnowledgeConfirmed : undefined,
    [guideline('第2の5(9) (p8)'), ref('SRC-456', '生活・就労ガイドブック')],
    '以指定方式的个案结果为准。适用证明、考试与评分方式待公告。',
    'Use the outcome of the designated assessment. The prescribed evidence, test and scoring method require publication.',
    'PD-364',
  );
  if (!newer)
    skip(
      rules,
      '该递交日期尚不适用新版制度理解因素。',
      'The revised understanding factor does not apply on this filing date.',
    );

  const schoolMet =
    e.schoolChildren &&
    all(
      ...e.schoolChildren.map((child) => {
        const applicable = inSchoolAge(date, child.bornOn);
        return applicable === false
          ? true
          : applicable === undefined
            ? undefined
            : (child.authorityAccepted ??
              (child.attendance === 'primary-or-junior-high'
                ? true
                : child.attendance === 'not-attending'
                  ? false
                  : undefined));
      }),
    );
  const schooling = factor(
    'school-attendance',
    '学龄本人或子女就学',
    'School attendance for applicant or children',
    newer ? schoolMet : undefined,
    [guideline('第2の5(10) (p8–9)'), ...v.schoolAge.sources],
    '按法定学年核对本人及所养育子女的小学、初中在籍与通学记录。其他就学安排须官署确认。',
    'Use the statutory school year for the applicant and children they raise. Confirm enrolment and attendance or obtain an official determination for alternatives.',
    'PD-371',
  );
  if (
    !newer ||
    (e.schoolChildren &&
      e.schoolChildren.every(
        (child) => inSchoolAge(date, child.bornOn) === false,
      ))
  )
    skip(
      schooling,
      !newer ? '该递交日期尚不适用新版就学因素。' : '没有适用法定学龄的成员。',
      !newer
        ? 'The revised school factor does not apply on this filing date.'
        : 'No person in compulsory-school age was reported.',
    );

  const filing = v.prFiling.value;
  const born = birth ? route.bornOn : req.dateOfBirth;
  const photoNeeded =
    e.photoRequiredByAuthority === true
      ? true
      : ageAtLeast(
          born,
          date,
          date < filing.photoChangeOn ? filing.photoAgeBefore : filing.photoAge,
        );
  const filer =
    e.filer === 'self' ||
    e.filer === 'legal-representative' ||
    e.filer === 'approved-intermediary'
      ? true
      : e.filer === 'other'
        ? false
        : undefined;
  p(
    'filing-documents',
    '窗口递交人与材料',
    'Counter filer and documents',
    all(
      filer,
      e.documentsReady,
      e.photoReady === true || photoNeeded === false
        ? true
        : e.photoReady === false && photoNeeded === true
          ? false
          : undefined,
    ),
    [prProcedure, ...v.prFiling.sources],
    `核对本人、法定代理人或获准取次、证件和证明。自 ${filing.photoChangeOn} 起一般免未满 ${filing.photoAge} 岁者照片。年满 ${filing.selfFilingAge} 岁通常本人递交，未满 ${filing.collectionAge} 岁等依取次规则。`,
    `Confirm personal filing, a legal representative or authorised intermediary and the documents. From ${filing.photoChangeOn}, children under ${filing.photoAge} usually need no photo. Filing and intermediary rules differ for minors under ${filing.collectionAge} and adults aged ${filing.selfFilingAge} and over.`,
    ['PD-370'],
  );

  const fees = v.fees.value;
  const basicFee = birth
    ? fees.acquisition
    : date >= fees.reform
      ? fees.pr
      : date >= fees.firstChange
        ? fees.prBeforeReform
        : date >= fees.historicalFrom
          ? fees.prHistorical
          : undefined;
  const canReduce = !birth && date >= fees.reform && relief !== false;
  const approved =
    canReduce && relief === true && e.feeReduction === 'approved';
  const reductionPending =
    canReduce &&
    !approved &&
    e.feeReduction !== 'denied' &&
    e.feeReduction !== 'not-requested';
  const fee = approved ? fees.prReduced : basicFee;
  const feeCheck = p(
    'approval-fee',
    '永住许可费',
    'Permanent residence fee',
    fee === undefined ? undefined : true,
    v.fees.sources,
    fee === undefined
      ? '此收件日期的费率需查历史政令。'
      : birth
        ? `取得手续为 JPY ${fee}。`
        : `收件日费率 JPY ${fee}，于许可时缴纳。现行法定上限 JPY ${fees.prCeiling}。`,
    fee === undefined
      ? 'Check the historical fee order for this filing date.'
      : birth
        ? `Acquisition costs JPY ${fee}.`
        : `The filing-date rate is JPY ${fee}, payable on approval. The current statutory ceiling is JPY ${fees.prCeiling}.`,
    ['PD-372'],
    'information',
  );
  if (fee !== undefined)
    feeCheck.fee = {
      currency: 'JPY',
      amount: fee,
      ...(reductionPending ? { possibleReducedAmount: fees.prReduced } : {}),
    };
  const reduction = p(
    'fee-reduction',
    '人道减额',
    'Humanitarian fee reduction',
    approved ? true : e.feeReduction === 'denied' ? false : undefined,
    v.fees.sources,
    `适用群组、困难及人道情由须由主管机关确认，减额为 JPY ${fees.prReduced}。`,
    `The authority confirms the eligible group, hardship and humanitarian grounds. The reduced fee is JPY ${fees.prReduced}.`,
    ['PD-372'],
    'information',
  );
  if (!canReduce || e.feeReduction === 'not-requested')
    skip(
      reduction,
      '未选减额或该费率不适用。',
      'A reduction was not requested or is unavailable on this fee schedule.',
    );

  const card = e.integratedCard;
  const cardAmount =
    card?.immigrationChargeApplies === undefined ||
    card.jLisChargeApplies === undefined ||
    (card.jLisChargeApplies && card.electronicCertificate === undefined)
      ? undefined
      : (card.immigrationChargeApplies ? fees.card : 0) +
        (card.jLisChargeApplies
          ? card.electronicCertificate
            ? fees.cardCertificate
            : fees.cardFunction
          : 0);
  const cardCheck = p(
    'integrated-card-fee',
    '可选一体在留卡收费',
    'Optional integrated residence card fee',
    card?.requested && cardAmount !== undefined ? true : undefined,
    [
      ref('SRC-443', '第3条の3、第25条第5項'),
      ref('SRC-457', '手数料'),
      ref('SRC-119', '手数料注4'),
    ],
    `如适用，入管费 JPY ${fees.card}，另有 J-LIS 功能费 JPY ${fees.cardFunction} 或含电子证书 JPY ${fees.cardCertificate}。`,
    `When chargeable, the immigration fee is JPY ${fees.card} and J-LIS charges JPY ${fees.cardFunction} or JPY ${fees.cardCertificate} with a certificate.`,
    ['PD-372'],
    'information',
  );
  if (card?.requested === false || date < filing.photoChangeOn)
    skip(
      cardCheck,
      '此案件不合办一体卡。',
      'An integrated card is not issued with this filing.',
    );
  else if (card?.requested && cardAmount !== undefined)
    cardCheck.fee = { currency: 'JPY', amount: cardAmount };

  switch (route.route) {
    case 'general':
      break;
    case 'spouse':
    case 'child':
      p(
        'qualifying-family',
        '符合路径的亲属身份',
        'Qualifying family relationship',
        route.route === 'spouse' ? family.spouse : family.child,
        [
          art22,
          ...focus('第3の1 (p9)', ref('SRC-113', '2(1)')),
          ref('SRC-450', '配偶者・実子等'),
        ],
        '按递交时配偶或父母身份及实际婚姻、亲生或适用收养关系核对。',
        'Check the spouse or parent’s status at filing and the genuine marriage, parentage or applicable adoption.',
        ['PD-135', 'PD-373'],
      );
      break;
    case 'child-birth': {
      p(
        'birth-acquisition',
        '在日出生与资格取得',
        'Birth in Japan and acquisition of status',
        route.acquisitionAccepted ??
          all(
            route.bornInJapan,
            route.withoutLanding,
            e.japaneseCitizen === undefined ? undefined : !e.japaneseCitizen,
            route.heldAnotherStatus === undefined
              ? undefined
              : !route.heldAnotherStatus,
            family.child,
          ),
        [
          ref('SRC-110', '第22条の2・第22条の3'),
          ref('SRC-111', '第2条'),
          ref('SRC-451', '在留資格取得・新生児'),
        ],
        '核对出生时国籍、未办理上陆、父母身份的生效日期与其他在留身份。',
        'Confirm nationality at birth, no landing procedure, the parent’s status from its effective date and any other status.',
        ['PD-373', 'PD-160'],
      );
      factor(
        'birth-registration',
        '出生届',
        'Birth registration',
        onTimeNotices(date, filing.birthRegistrationDays, [
          { eventOn: route.bornOn, notifiedOn: route.birthRegisteredOn },
        ]),
        [ref('SRC-447', '第49条')],
        `在日本出生的申报期限为 ${filing.birthRegistrationDays} 日。`,
        `A birth in Japan must be reported within ${filing.birthRegistrationDays} days.`,
        'PD-373',
      );
      break;
    }
    case 'teijusha':
      p(
        'long-term-resident',
        '定住者身份',
        'Long-term resident status',
        status && status.kind === 'teijusha',
        old.teijushaYears.sources,
        '核对持续所持身份为定住者。',
        'Confirm continuous status as a long-term resident (定住者).',
        ['PD-374'],
      );
      break;
    case 'refugee':
      p(
        'recognised-protection',
        '难民或补完的保护认定',
        'Recognised refugee or complementary protection',
        recognised,
        [
          ref('SRC-110', '第61条の2・第61条の2の14'),
          ...old.refugeeYears.sources,
        ],
        '核对正式认定及生效日期。',
        'Confirm formal recognition and its effective date.',
        ['PD-374'],
      );
      break;
    case 'international-protection':
      p(
        'international-protection',
        '国际机构推荐与获准上陆',
        'International protection recommendation and landing approval',
        e.internationalProtectionConfirmed,
        [art22, ref('SRC-440', '第22条第4項')],
        '凭上陆记录核对指定暂留国、机构推荐及主申请人或亲属类别。此身份适用一般在留年限。',
        'Confirm the prescribed temporary country, recommendation and primary or family category in the landing record. The general time requirements apply.',
        ['PD-374'],
      );
      break;
    case 'hsp70':
    case 'hsp80': {
      const thresholdPoints = v.hsp.value.routePoints[route.route];
      const years = old.highlySkilledYears.value[route.route];
      const past = afterYears(date, -years);
      const now = hspAssessment(route.current, date, thresholdPoints);
      const previous = hspAssessment(route.historical, past, thresholdPoints);
      p(
        'hsp-current-points',
        '递交日高度人材积分',
        'Highly skilled points at filing',
        now.met,
        [...v.hsp.sources, ...old.highlySkilledYears.sources],
        `须达到 ${thresholdPoints} 点。已核对积分 ${now.points ?? '待填'}，另核对活动、接受机构和合格年报酬。`,
        `At least ${thresholdPoints} points are needed. Points checked: ${now.points ?? 'unreported'}. Confirm activity, host institution and eligible annual remuneration.`,
        ['PD-375'],
      );
      const held =
        route.mode === 'recognised'
          ? all(
              threshold(route.recognisedPoints, thresholdPoints),
              route.recognisedOn ? route.recognisedOn <= past : undefined,
            )
          : route.mode === 'retrospective'
            ? previous.met
            : undefined;
      p(
        'hsp-history',
        '历史积分及连续保持',
        'Historical points and continuous maintenance',
        all(held, route.maintained),
        [
          ...v.hsp.sources,
          ref('SRC-450', '永住申請4、高度人材ポイント別の案内'),
          ...old.highlySkilledYears.sources,
        ],
        `核对以至少 ${thresholdPoints} 点获认定，或在 ${past} 可回溯证明该分值，并确认期间持续维持。`,
        `Verify recognition with at least ${thresholdPoints} points or retrospective proof on ${past}, and maintenance throughout the period.`,
        ['PD-375'],
      );
      if (
        now.met === true &&
        held === true &&
        route.maintained === true &&
        newer
      )
        skip(
          language,
          '已满足高度人材积分特例的日语例外。',
          'The language exception for the qualifying highly skilled route applies.',
        );
      break;
    }
    case 'j-skip': {
      const now = jSkipAssessment(route.current, date);
      const past = afterYears(date, -v.jSkip.value.stayYears);
      const earlier =
        route.mode === 'recognised'
          ? all(
              route.recognisedOn
                ? route.recognisedOn >= v.jSkip.value.from &&
                    route.recognisedOn <= past
                : undefined,
              route.remainedRecognised,
            )
          : route.mode === 'retrospective'
            ? jSkipAssessment(route.historical, past)
            : undefined;
      const t = v.jSkip.value;
      p(
        'j-skip-current',
        '递交日特別高度人材基准',
        'J-Skip criteria at filing',
        now,
        v.jSkip.sources,
        `学术或技术为相关研究生级学位或 ${t.specialistExperience} 年经验，合格年报酬至少 JPY ${t.specialistSalary}。管理为 ${t.managerExperience} 年经验及 JPY ${t.managerSalary}。`,
        `Research or technical activity needs a relevant graduate degree or ${t.specialistExperience} years’ experience and at least JPY ${t.specialistSalary} eligible annual remuneration. Management requires ${t.managerExperience} years and JPY ${t.managerSalary}.`,
        ['PD-375'],
      );
      p(
        'j-skip-history',
        'J-Skip 认定或历史基准',
        'J-Skip recognition or retrospective criteria',
        earlier,
        v.jSkip.sources,
        `核对在 ${past} 前已认定并持续持有，或在该基准日已达到标准。`,
        `Confirm recognition by ${past} that was maintained, or that the criteria were met on that reference date.`,
        ['PD-375'],
      );
      if (now === true && earlier === true && newer)
        skip(
          language,
          '已确认适用特別高度人材日语例外。',
          'The J-Skip language exception applies.',
        );
      break;
    }
    case 'regional-regeneration': {
      const x = v.exceptionalPr.value;
      const activity =
        route.activityNotice === x.technologyActivity
          ? all(
              route.activityQualified,
              route.comparableJapanesePay,
              any(
                route.qualifyingTechnologyEducation,
                route.designatedItQualification,
                threshold(
                  route.technologyExperienceYears,
                  x.technologyExperience,
                ),
              ),
            )
          : route.activityNotice === x.researchActivity
            ? route.activityQualified
            : route.activityNotice === undefined
              ? undefined
              : false;
      p(
        'regional-regeneration',
        '地域再生計画及指定活动',
        'Regional regeneration plan and designated activity',
        all(
          route.planRecognised,
          route.institutionInArea,
          route.designatedInstitutionAndContract,
          activity,
          route.recognisedContribution,
        ),
        v.exceptionalPr.sources,
        `核对获认定计划、区域内受指定机构和合同、告示第 ${x.researchActivity} 或 ${x.technologyActivity} 号活动与获认定贡献。`,
        `Confirm a recognised plan, a designated contracting institution in its area, activity under notice ${x.researchActivity} or ${x.technologyActivity}, and recognised contribution.`,
        ['PD-374'],
      );
      break;
    }
    case 'structural-zone':
      p(
        'structural-zone',
        '特区特定事业及贡献',
        'Special-zone business and contribution',
        all(
          newer,
          route.recognisedZone,
          route.designatedBusiness,
          route.recognisedContribution,
        ),
        v.exceptionalPr.sources,
        '完整新版开始后核对获认定特区、特定事业及贡献文件。',
        'From the full revision, verify the recognised zone, designated business and contribution evidence.',
        ['PD-374'],
      );
      break;
    case 'japan-contribution': {
      const x = v.exceptionalPr.value;
      const oldOnly = route.category?.startsWith('old-');
      const period =
        route.category === 'public-service'
          ? threshold(
              route.roleYears,
              newer ? x.publicServiceYears : x.earlierPublicServiceYears,
            )
          : route.category === 'prime-director'
            ? threshold(
                route.roleYears,
                newer ? x.primeDirectorYears : x.earlierThreeYearContribution,
              )
            : route.category === 'old-investment'
              ? all(
                  threshold(route.roleYears, x.earlierThreeYearContribution),
                  threshold(route.investmentYen, x.earlierInvestmentYen),
                )
              : route.category === 'old-management' ||
                  route.category === 'old-growing-sector'
                ? threshold(route.roleYears, x.earlierManagementYears)
                : route.category === 'old-company-management' ||
                    route.category === 'old-cultural-leadership' ||
                    route.category === 'old-education' ||
                    route.category === 'old-international-sport'
                  ? threshold(route.roleYears, x.earlierThreeYearContribution)
                  : route.category === 'other' || route.category === undefined
                    ? undefined
                    : true;
      const approximately =
        route.category === 'public-service' ||
        (!newer &&
          (route.category === 'prime-director' ||
            route.category === 'old-company-management' ||
            route.category === 'old-investment' ||
            route.category === 'old-management' ||
            route.category === 'old-growing-sector' ||
            route.category === 'old-cultural-leadership' ||
            route.category === 'old-education' ||
            route.category === 'old-international-sport'));
      const established = all(
        oldOnly ? !newer : true,
        period,
        route.designatedCategoryEvidence,
      );
      const knownMismatch =
        route.designatedCategoryEvidence === false ||
        (oldOnly && newer) ||
        (!approximately && period === false) ||
        (route.category === 'old-investment' &&
          threshold(route.investmentYen, x.earlierInvestmentYen) === false);
      p(
        'recognised-contribution',
        '获认定的対日貢献',
        'Recognised contribution to Japan',
        route.recognisedContribution === false
          ? false
          : all(
              newer ? true : route.oldSocialLifeClear,
              route.recognisedContribution === true
                ? true
                : knownMismatch
                  ? false
                  : undefined,
            ),
        v.exceptionalPr.sources,
        `按递交日的指南核对奖项或任职和贡献证据。${established === true ? '已提供相应类别和期限证据。' : ''} 由主管机关确认。`,
        `Use the filing-date guideline to check the award or role and contribution evidence.${established === true ? ' The stated evidence matches the category and time benchmark.' : ''} Obtain an official determination.`,
        ['PD-374'],
      );
      break;
    }
  }
  const specialPermission = e.specialPermission;
  const barred =
    specialPermission?.kind === 'stay' ||
    specialPermission?.kind === 'landing-refusal';
  const restriction = p(
    'special-permission',
    '特别许可与新版捷径',
    'Special permission and revised exceptions',
    specialPermission && !barred,
    [ref('SRC-110', '第12・50条'), guideline('第3 注5 (p10)')],
    '指定的在留或上陆特别许可排除新版时间捷径，须改核一般路径。',
    'The specified special permission excludes the revised time exception. Assess the general route instead.',
    ['PD-367', 'PD-369'],
  );
  if (!newer || birth)
    skip(
      restriction,
      '此案件不适用新版第3的排除。',
      'The revised exclusion under section 3 does not apply to this filing.',
    );
  else if (!special) {
    const i = values.indexOf(restriction);
    const grant = specialPermission?.grantedOn;
    const years = old.prStayYears.value;
    values[i] = check(
      restriction.id,
      restriction.title,
      barred
        ? grant
          ? date >=
            afterYears(grant > history.stay ? grant : history.stay, years)
          : undefined
        : specialPermission
          ? true
          : undefined,
      restriction.sources,
      L(
        `获指定特别许可后须按一般路径连续在留满 ${years} 年。`,
        `The general route requires ${years} years of continuous stay after the specified special permission.`,
      ),
      ['PD-367', 'PD-369'],
    );
  }

  return assemblePathway(
    `jp.pr.${route.route}`,
    L(...titles[route.route]),
    date,
    values,
    L,
    projectedPilot,
    prDoesNotApply,
  );
}
