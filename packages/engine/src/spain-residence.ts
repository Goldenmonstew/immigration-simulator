import { spain2026_11, spainFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { afterYears, HORIZON_YEARS, monthSpan } from './pilot';
import { textFor } from './rule';
import type { EsPathway, EsTrip } from './spain';
import type { EsFullRequest } from './spain-full';
import {
  all,
  any,
  applicationFee,
  byFilingDeadline,
  check,
  firstFutureDate,
  ofCompulsorySchoolAge,
  pathway,
  projectFilingDates,
} from './spain-full-common';
import type { EsApplicationFee } from './spain-full-common';
import type { IsoDate, Locale } from './types';

type Answer = boolean | undefined;
type Context = { simulationDate: IsoDate; locale?: Locale };
const v = spainFull2026_11.values;
const pilotValues = spain2026_11.values;
const ref = (srcId: string, locator: string): SourceRef => ({ srcId, locator });
const rd = (locator: string) => ref('SRC-083', locator);

export interface EsFamilyResources {
  /** Applicant included. */
  familySize?: number;
  /** Documented EUR/month after applying art. 67.1.a–e to eligible household members. */
  eligibleMonthlyIncome?: number;
  /** Alternative to a confirmed aggregate: amounts are monthly EUR, including extra pay pro rata. */
  income?: {
    kind:
      | 'gross-pay'
      | 'net-business'
      | 'taxable-capital-gain'
      | 'gross-pension'
      | 'maintenance-for-person-joining'
      | 'study-or-housing-aid'
      | 'other-maintenance'
      | 'social-assistance';
    amount?: number;
    /** Confirmed applicant, partner or eligible co-resident first-degree relative. */
    eligibleHouseholdMember?: boolean;
  }[];
  stable?: boolean;
  /** Official acceptance of the applicant's resources at the reduced threshold. */
  reduction?: 'granted' | 'pending' | 'none';
  additionalAssetsUnderReview?: boolean;
  /** Documented average balance, kept separate from monthly income. */
  sixMonthAverageAssets?: number;
  /** Individual authority finding, including the single-person and asset cases. */
  sufficiencyDecision?: 'accepted' | 'refused';
}

export function familyResourcesCheck(
  req: Context,
  facts: EsFamilyResources | undefined,
  id: 'ES-E05' | 'ES-F03',
): CountryCheck {
  const f = facts ?? {};
  const factors = v.familyResourceFactors.value;
  const published = req.simulationDate.startsWith(
    String(v.ipremYear.value) + '-',
  );
  const threshold =
    f.familySize !== undefined && f.familySize >= factors.baseSize
      ? v.ipremMonthly.value *
        (factors.base + (f.familySize - factors.baseSize) * factors.additional)
      : undefined;
  const eligible = f.income?.filter(
    (item) =>
      ![
        'study-or-housing-aid',
        'other-maintenance',
        'social-assistance',
      ].includes(item.kind) && item.eligibleHouseholdMember !== false,
  );
  const monthly =
    f.eligibleMonthlyIncome ??
    eligible?.reduce(
      (sum, item) =>
        sum + (item.eligibleHouseholdMember ? (item.amount ?? 0) : 0),
      0,
    );
  const uncertainIncome =
    f.eligibleMonthlyIncome === undefined &&
    eligible?.some(
      (item) => !item.eligibleHouseholdMember || item.amount === undefined,
    );
  const ordinary =
    published && threshold !== undefined && monthly !== undefined
      ? monthly >= threshold
      : undefined;
  const amount =
    f.sufficiencyDecision !== undefined
      ? f.sufficiencyDecision === 'accepted'
      : f.reduction === 'granted' || ordinary === true
        ? true
        : f.reduction === 'pending' ||
            f.additionalAssetsUnderReview ||
            (f.sixMonthAverageAssets ?? 0) > 0 ||
            uncertainIncome ||
            !published
          ? undefined
          : ordinary;
  const comparison =
    threshold === undefined
      ? ''
      : ` (${v.ipremYear.value}: ${threshold} EUR/月)`;
  const enComparison =
    threshold === undefined
      ? ''
      : ` (${v.ipremYear.value}: EUR ${threshold}/month)`;
  const text = check(
    textFor(req),
    id,
    '固定、经常且可核实的家庭资源' +
      comparison +
      `；工资和养老金取全额，经营取净额，资本收益取计税额，排除教育／住房补助、社会救助及不合资格的扶养费。财产另看最近 ${v.resourceAssetMonths.value} 个月平均，单人、减额、资产折算及未公布年度须个别核实。`,
    'Stable, regular and documented household resources' +
      enComparison +
      `. Count gross pay and pensions, net business income and taxable capital gains. Exclude housing and study aid, social assistance and ineligible maintenance. Review assets separately at their ${v.resourceAssetMonths.value}-month average. Single applicants, reductions, asset conversion and unpublished years need individual confirmation.`,
    all(f.stable, amount),
    [
      rd(
        id === 'ES-E05'
          ? 'arts. 176.b, 67.1 (pp55–56, 129)'
          : 'arts. 180.3.d, 67.1 (pp55–56, 132)',
      ),
      ref(
        id === 'ES-E05' ? 'SRC-324' : 'SRC-345',
        id === 'ES-E05'
          ? 'Hoja 50, requisitos: recursos'
          : 'Hoja 52, medios económicos',
      ),
      ...v.ipremMonthly.sources,
      ...v.imvAnnualIndividual.sources,
    ],
    ['PD-290'],
  );
  if (f.reduction === 'pending') {
    const { base, additional } = v.imvReductionFactors.value;
    text.explanation += textFor(req)(
      ` 未成年减额参照为年度 IMV 的 ${Math.round(base * 100)}%（每多一名未成年再加 ${additional * 100} 个百分点），适用基数须由机关确认。`,
      ` The minor-child reduction refers to ${Math.round(base * 100)}% of annual IMV plus ${additional * 100} percentage points for each additional minor. The applicable base needs confirmation.`,
    );
  }
  return text;
}

export interface EsHealthCover {
  kind?: 'public' | 'private' | 'none' | 'other';
  entitledOrAuthorized?: boolean;
  equivalentCoverage?: boolean;
  validFrom?: IsoDate;
  /** Omitted for ongoing coverage (start date and proof required). */
  validTo?: IsoDate;
  proof?: boolean;
}

export function insuranceEvidence(
  filedOn: IsoDate,
  facts: EsHealthCover | undefined,
): Answer {
  const f = facts ?? {};
  const valid =
    f.validFrom === undefined
      ? undefined
      : f.validFrom <= filedOn && (!f.validTo || f.validTo >= filedOn);
  const type =
    f.kind === 'public' || f.kind === 'private'
      ? true
      : f.kind === 'none'
        ? false
        : undefined;
  return all(
    type,
    f.entitledOrAuthorized,
    f.kind === 'public' ? true : f.equivalentCoverage,
    valid,
    f.proof,
  );
}

export function insuranceCheck(
  req: Context,
  facts: EsHealthCover | undefined,
  id: 'ES-E06' | 'ES-M03' | 'ES-R07',
): CountryCheck {
  const locators = {
    'ES-E06': 'arts. 176.c, 177.3.e',
    'ES-M03': 'arts. 179.3.d.1, 61.2.b',
    'ES-R07': 'art. 187.3.b',
  };
  return check(
    textFor(req),
    id,
    '递交时有效且有凭证的公共医保或获准在西承保、涵盖相应医疗风险的私保。非标准保单须核保期和风险范围。',
    'Document public entitlement or authorised private health cover valid at filing and covering the relevant risks in Spain. Nonstandard policies require review of dates and benefits.',
    insuranceEvidence(req.simulationDate, facts),
    [
      rd(locators[id]),
      ...(id === 'ES-E06'
        ? [ref('SRC-324', 'Hoja 50, requisitos: seguro de enfermedad')]
        : []),
    ],
    ['PD-291'],
  );
}

type NationalGround =
  | 'retirement'
  | 'disability'
  | 'spanish-birth'
  | 'former-spaniard'
  | 'public-care'
  | 'protection'
  | 'contribution';
export interface EsEuPeriod {
  from: IsoDate;
  to?: IsoDate;
  territory: 'spain' | 'other-eu';
  kind:
    | 'residence'
    | 'study'
    | 'volunteering'
    | 'training'
    | 'blue-card'
    | 'highly-qualified'
    | 'research'
    | 'protection'
    | 'asylum-wait'
    | 'temporary-only'
    | 'unclassified';
  /** For asylum-wait, this exact application led to protection in Spain. */
  protectionGranted?: boolean;
  protectionDecisionDate?: IsoDate;
}
export interface EsResidenceTrip extends EsTrip {
  reason?: 'ordinary' | 'work' | 'force-majeure' | 'cooperation';
  /** A competent authority accepted force majeure, or NGO employment, official recognition and eligible project are documented. */
  exceptionDocumented?: boolean;
  irregularExit?: boolean;
  outsideEu?: boolean;
}
export interface EsResidenceFacts {
  thirdCountryRegime?: boolean;
  entryRestrictionsClear?: boolean;
  noReturnCommitmentClear?: boolean;
  inSpain?: boolean;
  residentInSpain?: boolean;
  /** Empty = only the ordinary basis is claimed; omitted = alternative bases unanswered. */
  nationalAlternatives?: NationalGround[];
  spanishContributoryRetirement?: boolean;
  disabilityBenefit?:
    'spanish-contributory-absolute-or-severe' | 'analogous-spanish' | 'other';
  analogousLifelongNonCapitalisable?: boolean;
  analogousSufficiencyAccepted?: boolean;
  birthDate?: IsoDate;
  bornInSpainDocumented?: boolean;
  birthRouteContinuityAccepted?: boolean;
  atMajorityAccepted?: boolean;
  lostSpanishNationalityOfOriginDocumented?: boolean;
  spanishPublicGuardianship?: { from: IsoDate; to?: IsoDate };
  validRecognizedProtectionInEu?: boolean;
  contributionDecision?: 'granted' | 'refused' | 'proposed';
  competentOfficeAndApplication?: boolean;
  validIdentityDocument?: boolean;
  criminalCertificatesWhereRequired?: boolean;
  /** The authority assessed Spanish/foreign records, police reports and any health concern. */
  securityDecision?: 'clear' | 'threat' | 'pending';
  schooling?: {
    children: Array<{
      birthDate?: IsoDate;
      standardSpanishSchooling?: boolean;
      /** First local teaching day for this child's primary entry cohort. */
      primarySchoolStartsOn?: IsoDate;
      enrolledWithProof?: boolean;
    }>;
    noticeDate?: IsoDate;
    /** Verified official deadline when holidays affect the calculation. */
    cureDeadline?: IsoDate;
  };
  permitExpiry?: IsoDate;
  /** Official determination of filing window, including deadline extensions/non-working days. */
  filingWindowAccepted?: boolean;
  /** Complete official filing calendar, excluding weekends already handled by the engine. */
  officeHolidays?: IsoDate[];
  /** Complete typed record for E, including Spanish permits. Otherwise legacy permits are used. */
  periods?: EsEuPeriod[];
  /** Matched to Spanish trips by both travel dates. Additional trips may describe travel in the EU history. */
  tripDetails?: EsResidenceTrip[];
  blueMobility?: {
    exercisedLawfully?: boolean;
    firstCardFrom?: IsoDate;
    moveDate?: IsoDate;
    movedPreviously?: boolean;
    priorPeriodsDocumented?: boolean;
  };
  resources?: EsFamilyResources;
  insurance?: EsHealthCover;
  fee?: EsApplicationFee;
}

const lSources: Record<NationalGround, [string, string, string, string]> = {
  retirement: [
    'ES-L03',
    '西班牙居民领取西班牙社保缴费型退休金',
    'Spanish resident receiving a Spanish contributory retirement pension',
    'arts. 183.3.a, 184.4',
  ],
  disability: [
    'ES-L04',
    '西班牙缴费型绝对永久或重大失能待遇，或在西取得且获认定足以维生的终身不可资本化同类给付',
    'Spanish contributory absolute permanent or severe disability pension, or an accepted sufficient, lifelong, non-capitalisable Spanish equivalent',
    'arts. 183.3.b, 184.4',
  ],
  'spanish-birth': [
    'ES-L05',
    '在西出生的居民达到成年，申请前合法连续居留达到规定年限',
    'Spanish-born resident reaching majority after the required continuous period immediately before filing',
    'arts. 183.3.c, 184.3.d',
  ],
  'former-spaniard': [
    'ES-L06',
    '有证明的原籍西班牙国籍及其丧失',
    'Documented Spanish nationality of origin subsequently lost',
    'arts. 183.3.d, 184.3.d',
  ],
  'public-care': [
    'ES-L07',
    '成年时为西班牙居民，申请前一直受西班牙公共机构监护达到规定年限',
    'Resident reaching majority after the required continuous guardianship by a Spanish public entity before filing',
    'arts. 183.3.e, 184.3.d',
  ],
  protection: [
    'ES-L08',
    '人在西班牙，持西班牙或另一成员国仍有效的无国籍、难民或辅助保护认定',
    'Present in Spain with valid stateless, refugee or subsidiary protection status recognised in Spain or another EU member state',
    'arts. 183.3.f, 184.3.d',
  ],
  contribution: [
    'ES-L09',
    '公共机关提议、移民总局依职权启动并获部长决定认可显著贡献',
    'Outstanding contribution recognised by ministerial decision following a competent public authority proposal and ex officio initiation',
    'arts. 183.3.g, 184.1',
  ],
};

type Period = { from: IsoDate; to?: IsoDate };
function covers(periods: Period[], from: IsoDate, end: IsoDate): boolean {
  let cursor = from;
  for (const p of [...periods].sort((a, b) => a.from.localeCompare(b.from))) {
    if (p.from > cursor) break;
    if (!p.to || p.to >= end) return true;
    if (p.to >= cursor) cursor = addDays(p.to, 1);
  }
  return false;
}

function nationalGround(req: EsFullRequest, kind: NationalGround): Answer {
  const f = req.residence ?? {};
  const day = req.simulationDate;
  const birthday =
    f.birthDate && addYears(f.birthDate, v.residenceMajorityAge.value);
  const atMajority = birthday
    ? day < birthday
      ? false
      : day === birthday
        ? true
        : f.atMajorityAccepted
    : undefined;
  switch (kind) {
    case 'retirement':
      return all(f.residentInSpain, f.spanishContributoryRetirement);
    case 'disability':
      return all(
        f.residentInSpain,
        f.disabilityBenefit === 'analogous-spanish'
          ? all(
              f.analogousLifelongNonCapitalisable,
              f.analogousSufficiencyAccepted,
            )
          : f.disabilityBenefit === undefined
            ? undefined
            : f.disabilityBenefit === 'spanish-contributory-absolute-or-severe',
      );
    case 'spanish-birth':
      return all(
        f.residentInSpain,
        f.bornInSpainDocumented,
        atMajority,
        tripsWithFacts(req).some(
          (t) =>
            addDays(t.returned, -1) >=
              addYears(day, -v.spanishBornResidenceYears.value) &&
            addDays(t.departed, 1) < day,
        )
          ? f.birthRouteContinuityAccepted
          : true,
        req.timeRecordsComplete === false
          ? undefined
          : covers(
              req.permits.filter((p) => !p.study),
              addYears(day, -v.spanishBornResidenceYears.value),
              addDays(day, -1),
            ),
      );
    case 'former-spaniard':
      return f.lostSpanishNationalityOfOriginDocumented;
    case 'public-care':
      return all(
        f.residentInSpain,
        atMajority,
        f.spanishPublicGuardianship &&
          covers(
            [f.spanishPublicGuardianship],
            addYears(day, -v.publicCareYears.value),
            addDays(day, -1),
          ),
      );
    case 'protection':
      return all(f.inSpain, f.validRecognizedProtectionInEu);
    case 'contribution':
      return f.contributionDecision === 'granted'
        ? true
        : f.contributionDecision === 'refused'
          ? false
          : undefined;
  }
}

function nextWorkingDay(date: IsoDate, holidays?: IsoDate[]) {
  let day = date;
  while (
    [0, 6].includes(new Date(day + 'T00:00:00Z').getUTCDay()) ||
    holidays?.includes(day)
  )
    day = addDays(day, 1);
  return day;
}

function schooling(req: EsFullRequest): Answer {
  const s = req.residence?.schooling;
  if (!s) return undefined;
  const day = req.simulationDate;
  return all(
    ...s.children.map((child) => {
      if (!child.birthDate || child.standardSpanishSchooling !== true)
        return undefined;
      const schoolAge = ofCompulsorySchoolAge(child, day);
      if (schoolAge === false || child.enrolledWithProof) return true;
      if (schoolAge === undefined) return undefined;
      const deadline =
        s.cureDeadline ??
        (s.noticeDate &&
          nextWorkingDay(addMonths(s.noticeDate, v.schoolRemedyMonths.value)));
      return child.enrolledWithProof === false && deadline && day > deadline
        ? false
        : undefined;
    }),
  );
}

function tripsWithFacts(req: EsFullRequest): EsResidenceTrip[] {
  const details = req.residence?.tripDetails ?? [];
  const trips = req.trips.map(
    (t) =>
      details.find(
        (d) => d.departed === t.departed && d.returned === t.returned,
      ) ?? t,
  );
  return [
    ...trips,
    ...details.filter(
      (d) =>
        !trips.some(
          (t) => t.departed === d.departed && t.returned === d.returned,
        ),
    ),
  ];
}

function countAbsent(trips: EsResidenceTrip[], from: IsoDate, until: IsoDate) {
  let countedUntil = addDays(from, -1),
    days = 0;
  for (const t of [...trips].sort((a, b) =>
    a.departed.localeCompare(b.departed),
  )) {
    const start = [from, addDays(t.departed, 1), addDays(countedUntil, 1)]
      .sort()
      .at(-1)!;
    const end =
      until < t.returned ? addDays(until, -1) : addDays(t.returned, -1);
    if (start <= end) {
      days += daysBetween(start, end) + 1;
      countedUntil = end;
    }
  }
  return days;
}

const ordinaryAbsenceDays = monthSpan(v.euAbsenceMonths.value.total);
const workAbsenceDays = monthSpan(v.workAbsenceMonths.value);
const blueAbsenceDays = monthSpan(v.blueAbsenceMonths.value.total);

function absenceVerdict(
  trips: EsResidenceTrip[],
  from: IsoDate,
  until: IsoDate,
  blue: boolean,
  national: boolean,
): Answer {
  const relevant = trips.filter(
    (t) => addDays(t.departed, 1) < until && addDays(t.returned, -1) >= from,
  );
  function assess(optimistic: boolean) {
    const counted = relevant.filter((t) => {
      if (
        blue &&
        (t.outsideEu === false || (t.outsideEu === undefined && optimistic))
      )
        return false;
      if (
        national &&
        (t.reason === 'force-majeure' || t.reason === 'cooperation')
      )
        return !(
          t.exceptionDocumented === true ||
          (optimistic && t.exceptionDocumented === undefined)
        );
      return true;
    });
    const limits = blue ? v.blueAbsenceMonths.value : v.euAbsenceMonths.value;
    if (
      counted.some(
        (t) =>
          (!blue &&
            (t.irregularExit === true ||
              (!optimistic && t.irregularExit === undefined))) ||
          t.returned > addMonths(t.departed, limits.single),
      )
    )
      return false;
    const [min, max] = blue
      ? blueAbsenceDays
      : counted.every((t) => t.reason === 'work') ||
          (optimistic && counted.some((t) => !t.reason || t.reason === 'work'))
        ? workAbsenceDays
        : ordinaryAbsenceDays;
    return countAbsent(counted, from, until) <= (optimistic ? max : min);
  }
  return assess(false) ? true : assess(true) ? undefined : false;
}

function lastExpiry(periods: Period[], day: IsoDate) {
  return periods
    .filter((p) => p.from <= day && p.to && p.to < day)
    .map((p) => p.to!)
    .sort()
    .at(-1);
}

function permitWindow(
  req: EsFullRequest,
  periods: Period[],
  priorRequired: Answer,
): Answer {
  const f = req.residence ?? {};
  if (priorRequired === false || f.filingWindowAccepted === true) return true;
  if (f.filingWindowAccepted === false)
    return priorRequired === undefined ? undefined : false;
  if (req.timeRecordsComplete === false) return undefined;
  const day = req.simulationDate;
  if (periods.some((p) => p.from <= day && (!p.to || p.to >= day))) return true;
  const expiry = f.permitExpiry ?? lastExpiry(periods, day);
  if (!expiry) return undefined;
  const inWindow = all(
    day >= addMonths(expiry, -v.earlyFilingMonths.value),
    byFilingDeadline(
      day,
      addMonths(expiry, pilotValues.longTermLateMonths.value),
      f.officeHolidays,
    ),
  );
  return any(inWindow, priorRequired === undefined ? undefined : false);
}

const isPartial = (p: EsEuPeriod) =>
  ['study', 'training', 'volunteering'].includes(p.kind);
function periodWeight(
  p: EsEuPeriod,
  blue: boolean,
  optimistic: boolean,
  asOf: IsoDate,
): number {
  if (p.territory !== 'spain' && !blue) return 0;
  if (p.kind === 'unclassified') return optimistic ? 1 : 0;
  if (p.kind === 'temporary-only') return 0;
  if (p.kind === 'asylum-wait')
    return p.territory === 'spain' &&
      ((p.protectionGranted === true &&
        p.to &&
        p.to <= asOf &&
        (!p.protectionDecisionDate || p.protectionDecisionDate <= asOf)) ||
        (optimistic && p.protectionGranted !== false))
      ? 1
      : 0;
  if (blue && ['residence', 'volunteering'].includes(p.kind)) return 0;
  return isPartial(p) ? v.euStudyCredit.value : 1;
}

/** Walk backwards over the union of permissions. A gap breaks the chain; overlap takes the highest lawful credit once. */
function creditedStart(
  periods: EsEuPeriod[],
  end: IsoDate,
  blue: boolean,
  optimistic: boolean,
  allowPartial: boolean,
) {
  const target = addYears(end, -v.euResidenceYears.value);
  let remaining = daysBetween(target, end);
  const weighted = periods
    .map((p) => ({
      ...p,
      weight:
        isPartial(p) && !allowPartial
          ? 0
          : periodWeight(p, blue, optimistic, end),
    }))
    .filter((p) => p.from < end && p.weight > 0);
  const cuts = [
    ...new Set([
      end,
      ...weighted.flatMap((p) => [
        p.from,
        ...(p.to && p.to < end ? [addDays(p.to, 1)] : []),
      ]),
    ]),
  ]
    .sort()
    .reverse();
  for (let i = 1; i < cuts.length; i++) {
    const from = cuts[i],
      to = cuts[i - 1];
    const weight = Math.max(
      0,
      ...weighted
        .filter((p) => p.from <= from && (!p.to || p.to >= from))
        .map((p) => p.weight),
    );
    if (weight === 0)
      return optimistic && remaining < 1
        ? { from: to, rounded: true }
        : undefined;
    const credit = daysBetween(from, to) * weight;
    if (credit >= remaining)
      return {
        from: addDays(to, -Math.ceil(remaining / weight)),
        rounded: false,
      };
    remaining -= credit;
  }
  // Only the treatment of a final fractional day could complete the period.
  if (optimistic && remaining > 0 && remaining < 1 && cuts.length > 1)
    return { from: cuts.at(-1)!, rounded: true };
  return undefined;
}

function euTime(
  req: EsFullRequest,
  periods: EsEuPeriod[],
  blue: boolean,
): { met: Answer; windows?: [IsoDate, IsoDate] } {
  if (req.timeRecordsComplete === false) return { met: undefined };
  const day = req.simulationDate;
  const f = req.residence ?? {};
  const residentPermits = periods.filter(
    (p) =>
      p.territory === 'spain' &&
      !isPartial(p) &&
      !['temporary-only', 'unclassified', 'asylum-wait'].includes(p.kind),
  );
  const current = residentPermits.some(
    (p) => p.from <= day && (!p.to || p.to >= day),
  );
  let end = day;
  const expiry =
    !blue && !current ? lastExpiry(residentPermits, day) : undefined;
  const window = expiry ? permitWindow(req, residentPermits, true) : true;
  if (expiry && window !== false) end = addDays(expiry, 1);
  const trips = tripsWithFacts(req);
  let windows: [IsoDate, IsoDate] | undefined;
  function assess(optimistic: boolean): Answer {
    // The half-credit option for Spanish study requires current Spanish residence at filing.
    const allowPartial = blue || (f.residentInSpain ?? current);
    const credited = creditedStart(
      periods,
      end,
      blue,
      optimistic,
      allowPartial,
    );
    if (!credited || (credited.rounded && !optimistic)) return false;
    const window = addYears(end, -v.euResidenceYears.value);
    const baseAbsence = absenceVerdict(trips, window, end, blue, false);
    if (credited.from < window) windows = [window, credited.from];
    const extended =
      credited.from < window
        ? absenceVerdict(trips, credited.from, end, blue, false)
        : baseAbsence;
    return optimistic ? any(baseAbsence, extended) : all(baseAbsence, extended);
  }
  let time: Answer =
    assess(false) === true ? true : assess(true) === false ? false : undefined;
  if (blue) {
    const start = addYears(day, -v.blueSpainYears.value);
    const lawful = f.blueMobility?.exercisedLawfully;
    const mobility = f.blueMobility;
    let priorTerm: Answer = true;
    if (mobility?.firstCardFrom && mobility.moveDate) {
      const thresholds = v.blueMobilityMonths.value;
      const first =
        mobility.moveDate >=
        addMonths(mobility.firstCardFrom, thresholds.first);
      const next =
        mobility.moveDate >=
        addMonths(mobility.firstCardFrom, thresholds.subsequent);
      priorTerm = first || (next ? mobility.movedPreviously : false);
    }
    const recent = periods.filter(
      (p) => p.territory === 'spain' && p.kind === 'blue-card',
    );
    const physicallyContinuous = trips.some(
      (t) => addDays(t.returned, -1) >= start && addDays(t.departed, 1) < day,
    )
      ? undefined
      : true;
    time = all(
      time,
      lawful,
      priorTerm,
      mobility?.priorPeriodsDocumented,
      covers(recent, start, addDays(day, -1)),
      physicallyContinuous,
    );
  }
  return { met: all(time, window), windows };
}

export function residencePath(
  req: EsFullRequest,
  pilot: EsPathway,
  kind: 'L' | 'E',
  project = true,
): CountryPathway {
  const f = req.residence ?? {},
    L = textFor(req),
    day = req.simulationDate;
  const requirements: CountryCheck[] = [],
    details: CountryCheck[] = [];
  const isL = kind === 'L';
  const periods: EsEuPeriod[] =
    f.periods ??
    req.permits.map((p) => ({
      ...p,
      territory: 'spain',
      kind: p.study ? 'study' : 'residence',
    }));
  const recordCertain = req.timeRecordsComplete !== false;
  const recordsRisk = ['PD-097', 'PD-099', 'PD-285'];
  let durationDate: IsoDate | undefined;
  const filingDates: (IsoDate | undefined)[] = [];
  let priorRequired: Answer = true;
  if (isL) {
    const years = pilotValues.longTermYears.value;
    const permits = req.permits.filter((p) => !p.study);
    const trips = tripsWithFacts(req),
      from = addYears(day, -years);
    const exc = trips.filter(
      (t) => t.reason === 'force-majeure' || t.reason === 'cooperation',
    );
    function periodOn(date: IsoDate): Answer {
      if (!recordCertain) return undefined;
      if (covers(permits, addYears(date, -years), addDays(date, -1)))
        return true;
      const expiry = lastExpiry(permits, date);
      if (!expiry || covers(permits, date, date)) return false;
      return all(
        covers(permits, addYears(addDays(expiry, 1), -years), expiry),
        permitWindow({ ...req, simulationDate: date }, permits, true),
      );
    }
    const period = periodOn(day);
    const ordinary = recordCertain
      ? all(period, absenceVerdict(trips, from, day, false, false))
      : undefined;
    const extended = recordCertain
      ? all(period, absenceVerdict(trips, from, day, false, true))
      : undefined;
    if (extended === true) durationDate = day;
    if (project && recordCertain && extended !== true && permits.length) {
      // A disqualifying trip interrupts residence until return. Shorter trips
      // can leave the rolling total one day at a time before a new anniversary.
      const lastBreak = trips
        .filter((t) => absenceVerdict([t], from, day, false, true) === false)
        .map((t) => t.returned)
        .sort()
        .at(-1);
      const start = permits.map((p) => p.from).sort()[0];
      const anniversary = afterYears(
        lastBreak && lastBreak > start ? lastBreak : start,
        years,
      );
      const after = anniversary > day ? addDays(anniversary, -1) : day;
      const horizon = addYears(day, HORIZON_YEARS);
      const lastPermitDay = permits
        .map((p) => p.to ?? horizon)
        .sort()
        .at(-1)!;
      const lastFiling = nextWorkingDay(
        addMonths(lastPermitDay, pilotValues.longTermLateMonths.value),
        f.officeHolidays,
      );
      const through = lastFiling < horizon ? lastFiling : horizon;
      durationDate = firstFutureDate(
        after,
        through,
        (date) =>
          periodOn(date) === true &&
          absenceVerdict(trips, addYears(date, -years), date, false, true) ===
            true,
      );
    }
    const ordinarySources = [
      rd('arts. 182, 183.1–2, 184.2 (pp133–135)'),
      ref('SRC-320', 'arts. 30 bis, 32.2, 33'),
    ];
    const base = check(
      L,
      'ES-L01',
      `递交前连续合法居留 ${years} 年，学习停留不计入。普通与工作出境分别核对，工作出境合计至多 ${v.workAbsenceMonths.value} 个月。`,
      `Continuous legal residence for ${years} years, excluding study stays. Check ordinary and work absences separately; documented work absences may total up to ${v.workAbsenceMonths.value} months.`,
      ordinary,
      ordinarySources,
      recordsRisk,
    );
    details.push(base);
    for (const [i, c] of pilot.checks.entries()) {
      // The pilot contains the ordinary date and count independently of claimed exceptions.
      details.push(
        check(
          L,
          ['ES-L01-PERMIT', 'ES-L01-SINGLE', 'ES-L01-TOTAL'][i],
          c.text,
          c.text,
          i === 0 ? period : recordCertain ? c.met : undefined,
          i === 0 ? ordinarySources : [...c.sources],
          i === 0 ? ['PD-099', 'PD-285'] : ['PD-097'],
        ),
      );
    }
    if (exc.length)
      details.push(
        check(
          L,
          'ES-L02',
          '不可抗力经主管机关个案认定，或有证明的合资格公益组织雇佣和境外合作项目，可保留连续性',
          'Continuity with individually accepted force majeure or documented qualifying employment and overseas cooperation project',
          all(extended, ...exc.map((t) => t.exceptionDocumented)),
          [rd('art. 183.2 (p134)')],
          ['PD-285'],
        ),
      );
    const selected =
      f.nationalAlternatives ?? (Object.keys(lSources) as NationalGround[]);
    const school = schooling(req);
    const timed = [extended],
      untimed: Answer[] = [],
      noPriorPermit: Answer[] = [];
    for (const ground of new Set(selected)) {
      const value = nationalGround(req, ground);
      if (
        project &&
        f.birthDate &&
        (ground === 'spanish-birth' || ground === 'public-care')
      ) {
        const majority = addYears(f.birthDate, v.residenceMajorityAge.value);
        const starts =
          ground === 'spanish-birth'
            ? [...permits.map((p) => p.from), ...trips.map((t) => t.returned)]
            : f.spanishPublicGuardianship
              ? [f.spanishPublicGuardianship.from]
              : [];
        const term =
          ground === 'spanish-birth'
            ? v.spanishBornResidenceYears.value
            : v.publicCareYears.value;
        for (const date of [
          majority,
          ...starts.map((start) => afterYears(start, term)),
        ])
          if (
            date > day &&
            nationalGround({ ...req, simulationDate: date }, ground) === true
          )
            filingDates.push(date);
      }
      const [id, zh, en, locator] = lSources[ground];
      const sources = [rd(locator)];
      if (['public-care', 'spanish-birth'].includes(ground))
        sources.push(...v.residenceMajorityAge.sources);
      if (ground === 'protection')
        sources.push(ref('SRC-320', 'art. 32.3 bis'));
      details.push(
        check(
          L,
          id,
          zh,
          en,
          value,
          sources,
          ground === 'disability'
            ? ['PD-286']
            : ['public-care', 'spanish-birth'].includes(ground)
              ? ['PD-287']
              : [],
        ),
      );
      // Schooling evidence attaches only to a basis relying on prior residence.
      (ground === 'spanish-birth' ? timed : untimed).push(value);
      if (['former-spaniard', 'protection', 'contribution'].includes(ground))
        noPriorPermit.push(value);
    }
    requirements.push(
      check(
        L,
        'ES-L-BASIS',
        '满足普通连续居留或已主张的直接取得事由之一',
        'Qualifies through ordinary continuous residence or one of the claimed direct grounds',
        any(...timed, ...untimed),
        [...ordinarySources, rd('art. 183.3')],
      ),
    );
    const alternative = any(...noPriorPermit);
    priorRequired = alternative === undefined ? undefined : !alternative;
    const futureOrdinary = durationDate !== undefined && durationDate > day;
    const subjectToSchool = all(futureOrdinary ? true : any(...timed), school);
    // When no basis relying on prior residence was proved, do not duplicate the failure here.
    const schoolResult =
      any(...untimed) === true
        ? true
        : school === true
          ? true
          : !futureOrdinary && any(...timed) === false
            ? undefined
            : any(subjectToSchool, ...untimed);
    requirements.push(
      check(
        L,
        'ES-L13',
        `依此前居留期申请时，受扶养的义务教育年龄子女（通常 ${v.schoolAgeFrom.value}–${v.schoolAgeUntil.value} 岁）须有入学证明。小学按满入学年龄的自然年分届，开学月核当地首个授课日。通知后补件期 ${v.schoolRemedyMonths.value} 个月。`,
        `For a claim relying on past residence, document enrolment for dependent children of compulsory school age (normally ${v.schoolAgeFrom.value} to ${v.schoolAgeUntil.value}). Primary entry follows the birth-year cohort and the local first teaching day. The notice allows ${v.schoolRemedyMonths.value} month to remedy a deficiency.`,
        schoolResult,
        [
          rd('art. 184.3.c, 184.4 (p135)'),
          ...v.schoolAgeFrom.sources,
          ...v.primarySchoolStartMonth.sources,
          ref('SRC-090', 'art. 30.4–5'),
        ],
        ['PD-288'],
      ),
    );
  } else {
    const ordinary = euTime(req, periods, false);
    const blue = euTime(req, periods, true);
    const timeMet = any(ordinary.met, blue.met);
    const insuredFrom = f.insurance?.validFrom;
    if (timeMet === true) durationDate = day;
    if (
      project &&
      recordCertain &&
      (timeMet !== true || (insuredFrom && insuredFrom > day))
    ) {
      const horizon = addYears(day, HORIZON_YEARS);
      // Credit can still mature on the day following a permit's last covered day.
      const last = periods
        .filter(
          (p) =>
            p.territory === 'spain' &&
            periodWeight(p, false, false, horizon) > 0 &&
            (!isPartial(p) || f.residentInSpain === true),
        )
        .map((p) => (p.to && p.to < horizon ? addDays(p.to, 1) : horizon))
        .sort()
        .at(-1);
      if (last) {
        const qualifies = (date: IsoDate) => {
          const filing = { ...req, simulationDate: date };
          return (
            euTime(filing, periods, false).met === true ||
            (f.blueMobility?.exercisedLawfully === true &&
              f.blueMobility.priorPeriodsDocumented === true &&
              euTime(filing, periods, true).met === true)
          );
        };
        if (timeMet !== true)
          durationDate = firstFutureDate(day, last, qualifies);
        // Coverage may begin during an interruption after the first time candidate.
        if (
          insuredFrom &&
          insuredFrom > day &&
          (!durationDate || insuredFrom > durationDate)
        ) {
          const insuredTo = f.insurance?.validTo;
          const through = insuredTo && insuredTo < last ? insuredTo : last;
          filingDates.push(
            firstFutureDate(addDays(insuredFrom, -1), through, qualifies),
          );
        }
      }
    }
    const windowNote = (windows?: [IsoDate, IsoDate]) =>
      windows
        ? L(
            ` 出境窗口按日历年从 ${windows[0]} 起，按折算后的合格期间从 ${windows[1]} 起；两种口径改变结论时待确认。`,
            ` The ordinary absence window starts on ${windows[0]}; the credited-period window starts on ${windows[1]}. A result depending on the choice needs confirmation.`,
          )
        : '';
    details.push(
      check(
        L,
        'ES-E01',
        `在西班牙连续合法居留满 ${v.euResidenceYears.value} 年，含符合条件的折算期并核对出境原因、期限及许可性质。`,
        `Complete ${v.euResidenceYears.value} continuous lawful years in Spain including eligible credits. Check permit classification and the duration and purpose of absences.`,
        ordinary.met,
        [
          rd('art. 176.a (p128)'),
          ref('SRC-324', 'Hoja 50, requisitos'),
          ref('SRC-331', 'Directiva 2003/109/CE arts. 3–4'),
        ],
        [...recordsRisk, 'PD-289'],
      ),
    );
    if (ordinary.windows)
      details[details.length - 1].explanation += windowNote(ordinary.windows);
    if (periods.some(isPartial)) {
      const current = periods.some(
        (p) =>
          p.territory === 'spain' &&
          periodWeight(p, false, false, day) === 1 &&
          p.kind !== 'asylum-wait' &&
          p.from <= day &&
          (!p.to || p.to >= day),
      );
      details.push(
        check(
          L,
          'ES-E02',
          `西班牙学习、学生流动、志愿或培训停留按 ${v.euStudyCredit.value * 100}% 计，递交时须处于西班牙居留身份。`,
          `Eligible Spanish study, pupil mobility, volunteering or training stays count at ${v.euStudyCredit.value * 100}% if resident in Spain at filing.`,
          recordCertain ? (f.residentInSpain ?? current) : undefined,
          [
            rd('art. 176.a (p128)'),
            ref('SRC-324', 'Hoja 50, requisitos: estudios'),
          ],
          ['PD-285'],
        ),
      );
    }
    if (
      f.blueMobility ||
      periods.some((p) => p.territory === 'other-eu' || p.kind === 'blue-card')
    ) {
      details.push(
        check(
          L,
          'ES-E03',
          `依法行使蓝卡流动权，在欧盟累计符合资格的 ${v.euResidenceYears.value} 年且最近 ${v.blueSpainYears.value} 年连续持西班牙蓝卡；单次离欧至多 ${v.blueAbsenceMonths.value.single} 个月，累计 ${v.blueAbsenceMonths.value.total} 个月。`,
          `Document lawful Blue Card mobility, ${v.euResidenceYears.value} qualifying years in the EU and the last ${v.blueSpainYears.value} continuous years on a Spanish Blue Card. EU absences may last ${v.blueAbsenceMonths.value.single} months each and ${v.blueAbsenceMonths.value.total} in total.`,
          blue.met,
          [
            rd('art. 176.a.1–2 (pp128–129)'),
            ...v.blueMobilityMonths.sources,
            ...v.blueSpainYears.sources,
          ],
          ['PD-285', 'PD-289'],
        ),
      );
    }
    if (blue.windows && details.at(-1)?.id === 'ES-E03')
      details[details.length - 1].explanation += windowNote(blue.windows);
    if (periods.some((p) => p.kind === 'asylum-wait')) {
      const waits = periods.filter((p) => p.kind === 'asylum-wait');
      details.push(
        check(
          L,
          'ES-E04',
          '西班牙已获准保护的同一申请从提出到获居住工作许可的期间全计。须有可核的起止文书。',
          'Credit the full Spanish protection application period leading to the residence and work authorisation. Verify both dates and the linked grant.',
          all(
            ...waits.map((p) =>
              all(
                p.territory === 'spain',
                p.protectionDecisionDate && p.protectionDecisionDate > day
                  ? undefined
                  : p.protectionGranted,
                p.to && p.to <= day ? true : undefined,
              ),
            ),
          ),
          [
            rd('art. 176.a, final paragraph (p129)'),
            ref('SRC-324', 'Hoja 50, protección internacional'),
          ],
          ['PD-289'],
        ),
      );
    }
    requirements.push(
      check(
        L,
        'ES-E-TIME',
        '达到西班牙常规或欧盟蓝卡累计居留年限',
        'Qualifies by Spanish residence or EU Blue Card accumulation',
        timeMet,
        [rd('art. 176.a')],
        [...recordsRisk, 'PD-289'],
      ),
    );
    requirements.push(
      familyResourcesCheck(req, f.resources, 'ES-E05'),
      insuranceCheck(req, f.insurance, 'ES-E06'),
    );
  }
  requirements.push(
    check(
      L,
      isL ? 'ES-L10' : 'ES-E01-SCOPE',
      '适用第三国国民制度，协定拒绝入境记录及适用的禁返承诺已核清',
      'Third-country regime applies and relevant refusal-of-entry and return restrictions are clear',
      all(
        f.thirdCountryRegime,
        f.entryRestrictionsClear,
        isL ? f.noReturnCommitmentClear : true,
      ),
      [
        ref('SRC-320', 'arts. 1.3, 32'),
        ref(
          isL ? 'SRC-085' : 'SRC-324',
          isL ? 'Hoja 49, requisitos' : 'Hoja 50, requisitos',
        ),
      ],
    ),
  );
  const filing = isL ? 'ES-L11' : 'ES-E07',
    security = isL ? 'ES-L12' : 'ES-E08';
  const filingPeriods = isL
    ? req.permits.filter((p) => !p.study)
    : periods.filter(
        (p) =>
          p.territory === 'spain' &&
          !isPartial(p) &&
          periodWeight(p, false, false, day) > 0 &&
          p.kind !== 'asylum-wait',
      );
  const wf = permitWindow(req, filingPeriods, priorRequired);
  requirements.push(
    check(
      L,
      filing,
      '有效证件、正确的主管省份或领馆和申请方式；适用原许可时须在合法递交期内。',
      'Valid identity document, application and competent province or consulate. Observe the filing window when prior permission is required.',
      all(
        f.validIdentityDocument,
        isL &&
          f.contributionDecision === 'granted' &&
          f.nationalAlternatives?.includes('contribution') !== false
          ? true
          : f.competentOfficeAndApplication,
        wf,
      ),
      [
        rd(isL ? 'art. 184.1–3.a' : 'art. 177.1–3.a'),
        ref('SRC-090', 'art. 30.4–6'),
        ...pilotValues.longTermLateMonths.sources,
      ],
      ['PD-285'],
    ),
  );
  requirements.push(
    check(
      L,
      security,
      '机关已按个案审查刑事和警方记录，并确认没有构成拒绝的治安、安全或公共健康问题。',
      'The authority assessed the criminal and police record and cleared any relevant public-order, security or public-health issue.',
      f.securityDecision === 'clear'
        ? true
        : f.securityDecision === 'threat'
          ? false
          : undefined,
      [
        rd(isL ? 'art. 184.4–5' : 'art. 177.4–5'),
        ref(
          isL ? 'SRC-085' : 'SRC-324',
          isL ? 'Hoja 49, salud pública' : 'Hoja 50, salud pública',
        ),
      ],
      ['PD-283'],
    ),
  );
  requirements.push(
    check(
      L,
      security + '-CERT',
      `如适用，已备原籍或申请前 ${v.criminalRecordYears.value} 年居住国的刑事记录证明。`,
      `Where required, provide criminal certificates from the country of origin or the countries of residence in the last ${v.criminalRecordYears.value} years.`,
      f.criminalCertificatesWhereRequired,
      [rd(isL ? 'art. 184.3.e' : 'art. 177.3.f')],
      ['PD-283'],
    ),
  );
  details.push(applicationFee(L, isL ? 'ES-L14' : 'ES-E09', f.fee, day));
  const result = pathway(
    isL ? 'ES-LONG-TERM' : 'ES-LONG-TERM-EU',
    isL ? pilot.title : L('欧盟长期居留', 'EU long-term residence'),
    requirements,
    details,
    isL && recordCertain ? pilot.assumptions : [],
  );
  if (durationDate) {
    // A candidate date for the ordinary duration alone cannot establish all legal conditions.
    result.pathwayCompletionDate = durationDate;
    result.summary = isL
      ? L(
          `普通居留时间条件的候选日期为 ${durationDate}。`,
          `Candidate date for the ordinary residence period alone: ${durationDate}.`,
        )
      : L(
          `欧盟长居居留年限的候选日期为 ${durationDate}。`,
          `Candidate date for the EU long-term residence period: ${durationDate}.`,
        );
  }
  if (result.status === 'MET') result.earliestDate = day;
  if (!project) return result;
  filingDates.push(durationDate);
  if (!isL) filingDates.push(f.insurance?.validFrom);
  return projectFilingDates(
    result,
    day,
    filingDates,
    (simulationDate) =>
      residencePath({ ...req, simulationDate }, pilot, kind, false),
    req.locale,
  );
}
