import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addDays, addMonths, addYears, daysBetween, fullYears } from './dates';
import { afterYears, Days, monthSpan } from './pilot';
import { textFor } from './rule';
import {
  all,
  any,
  byFilingDeadline,
  check,
  pathway,
  projectFilingDates,
} from './spain-full-common';
import type { Evidence } from './spain-full-common';
import type { EsFullRequest } from './spain-full';
import type { EsTrip } from './spain';
import type { IsoDate } from './types';

const v = spainFull2026_11.values;
const annualAwayDays = monthSpan(
  v.freeMovementResidence.value.annualAwayMonths,
);
const source = (article: string) => [
  { srcId: 'SRC-327', locator: 'RD 240/2007 art. ' + article },
];
type WorkerBasis =
  | 'employment'
  | 'self-employment'
  | 'resources'
  | 'student'
  | 'temporary-incapacity'
  | 'unemployed'
  | 'training'
  | 'qualifying-family'
  | 'other';
interface FreeMovementPeriod {
  from: IsoDate;
  to?: IsoDate;
  basis: WorkerBasis;
  documented?: boolean;
  allRiskInsurance?: boolean;
  sufficientMeansAccepted?: boolean;
  /** Individual household. Threshold used only as sufficient evidence. */
  singleHousehold?: boolean;
  annualMeans?: number;
  recognizedCourse?: boolean;
  resourceDeclaration?: boolean;
  employmentStarted?: IsoDate;
  involuntaryAndRegistered?: boolean;
  fixedTermUnderOneYear?: boolean;
  continuedWorkerStatusRecognized?: boolean;
  trainingRelatedOrInvoluntaryUnemployment?: boolean;
}
interface FreeMovementTrip extends EsTrip {
  reason?:
    | 'ordinary'
    | 'military'
    | 'important'
    | 'cooperation-or-eu-study'
    | 'unconfirmed';
}
interface ResidenceEvidence {
  history?: FreeMovementPeriod[];
  trips?: FreeMovementTrip[];
  noExecutedExpulsion?: boolean;
  /** The authority's finding on disputed continuity, if available. */
  continuityAccepted?: boolean;
}
type EarlyBasis =
  | 'retirement'
  | 'incapacity'
  | 'cross-border'
  | 'worker-family'
  | 'death-at-work';
export interface EsFreeMovementFacts extends ResidenceEvidence {
  person?: 'eu-eea-swiss' | 'third-country-family' | 'other';
  sponsor?: 'eu-eea-swiss' | 'spanish' | 'other';
  spanishFreeMovementConfirmed?: boolean;
  transitionalEuRegimeConfirmed?: boolean;
  accompanyingOrJoining?: boolean;
  relationship?:
    | 'spouse'
    | 'registered-partner'
    | 'descendant'
    | 'ascendant'
    | 'extended-relative'
    | 'durable-partner'
    | 'other';
  relationshipDocumented?: boolean;
  studentSponsor?: boolean;
  dependent?: boolean;
  incapacitated?: boolean;
  birthDate?: IsoDate;
  previouslyCohabitedFrom?: IsoDate;
  previouslyCohabitedUntil?: IsoDate;
  personalCareNecessary?: boolean;
  commonChildAndStableCohabitation?: boolean;
  extendedFamilyRecognized?: boolean;
  residenceFrom?: IsoDate;
  jointResidenceFrom?: IsoDate;
  retainedEvent?: 'sponsor-death' | 'child-in-education' | 'divorce';
  /** Effective date of the death, divorce or other change in family status. */
  eventDate?: IsoDate;
  divorceProceedingsStartedOn?: IsoDate;
  eventReported?: boolean;
  priorFamilyResidenceFrom?: IsoDate;
  continuingChildEducationAndCustody?: boolean;
  relationshipFrom?: IsoDate;
  custodyOrAccessInSpain?: boolean;
  exceptionalHardshipProved?: boolean;
  retainedStatusAccepted?: boolean;
  earlyBasis?: EarlyBasis;
  workStopped?: IsoDate;
  employmentFrom?: IsoDate;
  qualifiedWorker?: boolean;
  workerResidenceFrom?: IsoDate;
  /** U11 concerns the deceased worker's residence, independently of the applicant's. */
  workerResidenceEvidence?: ResidenceEvidence;
  pensionContributionsQualified?: boolean;
  pensionEligibilityDecided?: boolean;
  contributionMonths?: number;
  earlyEmployeeRetirement?: boolean;
  spanishSpouseExemption?: boolean;
  permanentIncapacity?: boolean;
  occupationalSpanishBenefit?: boolean;
  workingInAnotherMemberState?: boolean;
  retainedSpanishHome?: boolean;
  returnsAtLeastWeekly?: boolean;
  coResidentWithWorker?: boolean;
  workerAcquiredEarly?: boolean;
  diedDuringWorkBeforePermanent?: boolean;
  occupationalDeath?: boolean;
  spouseLostSpanishNationalityThroughMarriage?: boolean;
  noOfficialRestriction?: boolean;
  /** Permanent status already established, including by other lawful evidence. */
  acquiredOn?: IsoDate;
  longestPostAcquisitionAbsence?: EsTrip;
  postAcquisitionTravelComplete?: boolean;
  document?: {
    officeHolidays?: IsoDate[];
    validIdOrRenewal?: boolean;
    entitlementDocuments?: boolean;
    ex19?: boolean;
    photos?: number;
    feePaid?: number;
    priorCardExpiry?: IsoDate;
    applied?: IsoDate;
  };
}

function periodMet(p: FreeMovementPeriod, end: IsoDate): Evidence {
  let basis: Evidence;
  switch (p.basis) {
    case 'employment':
    case 'self-employment':
    case 'qualifying-family':
    case 'temporary-incapacity':
      basis = true;
      break;
    case 'student':
      basis = all(
        p.recognizedCourse,
        p.resourceDeclaration,
        p.allRiskInsurance,
      );
      break;
    case 'resources': {
      // A current annual reference cannot be carried over other calendar years.
      const year = String(v.ipremYear.value);
      const above =
        p.singleHousehold === true &&
        p.from.startsWith(year) &&
        end.startsWith(year) &&
        p.annualMeans !== undefined &&
        p.annualMeans > v.imvAnnualIndividual.value;
      basis = all(
        p.allRiskInsurance,
        p.sufficientMeansAccepted ?? (above ? true : undefined),
      );
      break;
    }
    case 'training':
      basis = p.trainingRelatedOrInvoluntaryUnemployment;
      break;
    case 'unemployed': {
      const w = v.retainedWorker.value;
      const lengthy = p.employmentStarted
        ? addYears(p.employmentStarted, w.longEmploymentYears) < p.from
        : undefined;
      const short = p.employmentStarted
        ? p.from <= addMonths(p.employmentStarted, w.shortEmploymentMonths)
        : undefined;
      basis = all(
        p.involuntaryAndRegistered,
        any(
          lengthy,
          all(
            any(short, p.fixedTermUnderOneYear),
            end < addMonths(p.from, w.retainedMonths),
          ),
          p.continuedWorkerStatusRecognized,
        ),
      );
      break;
    }
    case 'other':
      basis = false;
  }
  return all(basis, p.documented);
}

// Check continuous coverage with whole, evidenced periods. Overlaps count once.
function historyMet(
  periods: FreeMovementPeriod[] | undefined,
  start: IsoDate,
  end: IsoDate,
): Evidence {
  if (!periods) return undefined;
  const covers = (allowUnknown: boolean) => {
    let next = start;
    for (const p of [...periods].sort((a, b) => a.from.localeCompare(b.from))) {
      const last = p.to && p.to < end ? p.to : end;
      if (last < next || p.from > next) continue;
      const met = periodMet(p, last);
      if (met === true || (met === undefined && allowUnknown))
        next = addDays(last, 1);
      if (next > end) return true;
    }
    return false;
  };
  return covers(false) ? true : covers(true) ? undefined : false;
}

function recordedTrips(req: EsFullRequest, f: EsFreeMovementFacts) {
  return f.trips ?? (req.timeRecordsComplete === false ? undefined : req.trips);
}

function tripsMet(
  trips: ResidenceEvidence['trips'],
  start: IsoDate,
  end: IsoDate,
  residenceFrom?: IsoDate,
  eventDate = end,
): Evidence {
  if (!trips) return undefined;
  if (!trips.length) return true;
  const limit = v.freeMovementResidence.value;
  const firstYear = residenceFrom ? fullYears(residenceFrom, start) : 0;
  const days = new Days(
      residenceFrom ? afterYears(residenceFrom, firstYear) : start,
      end,
    ),
    absent = Array<boolean>(days.count).fill(false);
  const confirmed = residenceFrom
    ? Array<boolean>(days.count).fill(false)
    : undefined;
  const importantTrip = trips
    .filter(
      (t) =>
        'reason' in t &&
        t.reason === 'important' &&
        t.returned > (residenceFrom ?? start) &&
        t.departed < eventDate &&
        t.returned <= addMonths(t.departed, limit.importantMonths),
    )
    .sort(
      (a, b) =>
        daysBetween(b.departed, b.returned) -
        daysBetween(a.departed, a.returned),
    )[0];
  let ordinaryTrips = 0,
    singleWithinLimit = true;
  let uncertain = false;
  let possibleBreak = false;
  for (const t of trips) {
    if (t.returned <= days.start || t.departed >= end) continue;
    const reason = 'reason' in t ? (t.reason ?? 'unconfirmed') : 'unconfirmed';
    if (reason === 'military') continue;
    if (t === importantTrip) continue;
    ordinaryTrips++;
    if (t.returned > addMonths(t.departed, limit.annualAwayMonths))
      singleWithinLimit = false;
    const unconfirmed = reason !== 'ordinary' && reason !== 'important';
    if (unconfirmed) uncertain = true;
    if (residenceFrom && t.returned > start) {
      const from = t.departed < residenceFrom ? residenceFrom : t.departed;
      const until = t.returned < end ? t.returned : end;
      const nextYear = afterYears(
        residenceFrom,
        fullYears(residenceFrom, from) + 1,
      );
      // Split a single absence at the residence anniversary before comparing
      // calendar months. A full intervening residence year also exceeds the limit.
      const firstEnd = until < nextYear ? until : nextYear;
      if (
        firstEnd > addMonths(from, limit.annualAwayMonths) ||
        until > addMonths(nextYear, limit.annualAwayMonths)
      ) {
        if (!unconfirmed) return false;
        possibleBreak = true;
      }
    } else if (
      !residenceFrom &&
      !unconfirmed &&
      t.returned <= end &&
      t.returned > addMonths(t.departed, limit.annualAwayMonths)
    )
      return false;
    days.mark(absent, addDays(t.departed, 1), addDays(t.returned, -1));
    if (confirmed && !unconfirmed)
      days.mark(confirmed, addDays(t.departed, 1), addDays(t.returned, -1));
  }
  const sums = days.sums((i) => absent[i]);
  const [min, max] = annualAwayDays;
  if ((ordinaryTrips === 1 && singleWithinLimit) || sums[days.count] <= min)
    return possibleBreak ? undefined : true;
  if (residenceFrom && confirmed) {
    // For early acquisition, count absences in the actual residence years. An excess
    // before the required period alone does not disqualify the later years.
    let met: Evidence = possibleBreak ? undefined : true;
    const known = uncertain ? days.sums((i) => confirmed[i]) : sums;
    for (let year = firstYear; ; year++) {
      const from = afterYears(residenceFrom, year);
      if (from > end) break;
      const to = addDays(afterYears(residenceFrom, year + 1), -1);
      const requiredFrom = from < start ? start : from;
      if (!days.total(sums, requiredFrom, to)) continue;
      if (days.total(known, requiredFrom, to) > max) return false;
      if (days.total(sums, from, to) > min) met = undefined;
    }
    return met;
  }
  // A definite excess within a residence year, or a borderline rolling window.
  const boundaryDays = new Set<IsoDate>([start, addDays(end, 1)]);
  for (let year = 1; year <= limit.years; year++) {
    const anniversary = addYears(start, year);
    const jan = anniversary.slice(0, 4) + '-01-01';
    if (jan <= end) boundaryDays.add(jan);
    if (anniversary <= end && anniversary.slice(5) === start.slice(5))
      boundaryDays.add(anniversary);
  }
  // An excess inside both the calendar year and the residence year is
  // conclusive under either reading. Keep conflicting year boundaries open.
  const boundaries = [...boundaryDays].sort();
  if (
    !uncertain &&
    boundaries
      .slice(1)
      .some((to, i) => days.total(sums, boundaries[i], addDays(to, -1)) > max)
  )
    return false;
  for (let i = 0; i < days.count; i++) {
    // Consult the leap-day boundary only when the extra day changes the result.
    if (sums[Math.min(days.count, i + 365)] - sums[i] > min) return undefined;
    if (sums[Math.min(days.count, i + 366)] - sums[i] > min) {
      const from = days.date(i);
      if (days.total(sums, from, addDays(addYears(from, 1), -1)) > min)
        return undefined;
    }
  }
  return true;
}

function ordinaryWindow(
  req: EsFullRequest,
  f: EsFreeMovementFacts,
  end: IsoDate,
  since?: IsoDate,
  firstPossible = false,
) {
  const { years, annualAwayMonths, importantMonths } =
    v.freeMovementResidence.value;
  const joint = f.person === 'third-country-family' && !f.retainedEvent;
  // A known cessation ends that employment record, even when its end was omitted.
  // Subsequent, independently recorded bases can still establish ordinary residence.
  const stop =
    (f.earlyBasis === 'retirement' || f.earlyBasis === 'incapacity') &&
    f.workStopped;
  const history = stop
    ? f.history?.map((p) =>
        (p.basis === 'employment' || p.basis === 'self-employment') &&
        p.from <= stop &&
        (!p.to || p.to > stop)
          ? { ...p, to: stop }
          : p,
      )
    : f.history;
  const at = (start: IsoDate, completion: IsoDate) => ({
    end: completion,
    ordinaryTime: all(
      f.residenceFrom ? f.residenceFrom <= start : undefined,
      joint
        ? f.jointResidenceFrom
          ? f.jointResidenceFrom <= start
          : undefined
        : true,
      !since || since <= start,
      f.noExecutedExpulsion,
      f.continuityAccepted ??
        tripsMet(recordedTrips(req, f), start, completion),
    ),
    historical: historyMet(history, start, addDays(completion, -1)),
  });
  const lastStart = addYears(end, -years);
  const current = at(lastStart, end);
  if (!f.history?.length) return current;
  // Coverage can improve after a gap only when a qualifying period starts.
  const lower = [
    since,
    f.residenceFrom,
    joint ? f.jointResidenceFrom : undefined,
  ]
    .filter((s): s is IsoDate => s !== undefined)
    .sort()
    .at(-1);
  const starts = [
    ...new Set(
      f.history.map((p) => (lower && p.from < lower ? lower : p.from)),
    ),
  ]
    .filter((s) => s <= lastStart)
    .sort();
  const trips = f.trips ?? req.trips;
  const interruptions = f.trips?.filter(
    (t) =>
      (t.reason === 'ordinary' &&
        t.returned > addMonths(t.departed, annualAwayMonths)) ||
      (t.reason === 'important' &&
        t.returned > addMonths(t.departed, importantMonths)),
  );
  let possible: typeof current | undefined;
  for (const [i, first] of starts.entries()) {
    const next = starts[i + 1] ?? addDays(lastStart, 1);
    for (let start = first; start < next; start = addDays(start, 1)) {
      const completion = afterYears(start, years);
      const interruption =
        f.continuityAccepted === undefined &&
        interruptions?.find(
          (t) => start < t.returned && t.returned <= completion,
        );
      if (interruption) {
        start = addDays(interruption.returned, -1);
        continue;
      }
      const w = at(start, completion);
      const qualifies = all(w.ordinaryTime, w.historical);
      if (qualifies || (firstPossible && qualifies === undefined)) return w;
      if (qualifies === undefined) possible ??= w;
      // Only the placement of travel within a rolling window can improve
      // continuity between these starts. Missing or failed history cannot.
      if (
        !trips.length ||
        f.continuityAccepted !== undefined ||
        w.ordinaryTime === true ||
        w.historical === false ||
        f.noExecutedExpulsion !== true
      )
        break;
    }
  }
  return all(current.ordinaryTime, current.historical) === false && possible
    ? possible
    : current;
}

function freeMovementAt(req: EsFullRequest) {
  const f = req.freeMovement ?? {},
    d = req.simulationDate,
    L = textFor(req);
  const rule = (
    id: string,
    zh: string,
    en: string,
    met: Evidence,
    article: string,
    pd?: string[],
  ) => check(L, 'ES-' + id, zh, en, met, source(article), pd);
  const family = f.person === 'third-country-family';
  const regime =
    f.person === 'eu-eea-swiss'
      ? true
      : f.person === 'other'
        ? false
        : f.person === undefined
          ? undefined
          : f.sponsor === 'eu-eea-swiss'
            ? true
            : f.sponsor === 'spanish'
              ? any(
                  f.spanishFreeMovementConfirmed,
                  f.transitionalEuRegimeConfirmed,
                )
              : f.sponsor === undefined
                ? undefined
                : false;
  const checks = [
    check(
      L,
      'ES-U01',
      '持欧盟、欧洲经济区或瑞士国籍，或属自由流动家庭。西班牙籍家属需核跨境经历或过渡决定。',
      'EU, EEA or Swiss citizenship, or family covered by free movement. For a Spanish sponsor verify movement or a transitional decision.',
      regime,
      [
        ...source('1–3, DA 3'),
        {
          srcId: 'SRC-328',
          locator: 'Hoja 63, ámbito; SEM 2/2025 instrucciones 1, 10',
        },
      ],
      ['PD-297'],
    ),
  ];
  const info: CountryCheck[] = [];
  const already = f.acquiredOn && f.acquiredOn <= d ? f.acquiredOn : undefined;
  const early = f.earlyBasis ? earlyCheck(req, f) : undefined;
  let earlyAcquiredOn: IsoDate | undefined;
  if (early?.status === 'MET') {
    if (f.earlyBasis === 'retirement' || f.earlyBasis === 'incapacity')
      earlyAcquiredOn = f.workStopped;
    if (f.earlyBasis === 'death-at-work') earlyAcquiredOn = f.eventDate;
  }
  let ordinary = ordinaryWindow(req, f, already ?? d);
  const firstAcquisition = (ordinaryDate?: IsoDate, earlyDate?: IsoDate) =>
    ordinaryDate && (!earlyDate || ordinaryDate < earlyDate)
      ? ordinaryDate
      : earlyDate;
  let acquiredOn =
    already ??
    firstAcquisition(
      all(ordinary.ordinaryTime, ordinary.historical)
        ? ordinary.end
        : undefined,
      earlyAcquiredOn,
    );
  const limits = v.freeMovementResidence.value;
  const travel = f.trips ?? req.trips;
  const absences = f.longestPostAcquisitionAbsence
    ? [...travel, f.longestPostAcquisitionAbsence]
    : travel;
  // For a cross-border worker, the last day of Spanish employment is only a
  // lower bound on when qualifying work in the other Member State began.
  const earliestPossibleAcquisition =
    acquiredOn ?? (f.earlyBasis === 'cross-border' ? f.workStopped : undefined);
  const longAbsences = absences.filter((t) => {
    const from =
      earliestPossibleAcquisition && t.departed < earliestPossibleAcquisition
        ? earliestPossibleAcquisition
        : t.departed;
    const until = t.returned < d ? t.returned : d;
    return until > addYears(from, limits.lossYears);
  });
  const lostOnTrip = longAbsences
    .filter(
      (t) =>
        acquiredOn ||
        (early?.status === 'MET' && t === f.longestPostAcquisitionAbsence),
    )
    .sort((a, b) => b.returned.localeCompare(a.returned))[0];
  let lost = !!lostOnTrip;
  if (lostOnTrip && lostOnTrip.returned <= d) {
    const afterReturn = ordinaryWindow(req, f, d, lostOnTrip.returned);
    const ordinaryReacquired = all(
      afterReturn.ordinaryTime,
      afterReturn.historical,
    );
    if (ordinaryReacquired) ordinary = afterReturn;
    const reacquiredOn = firstAcquisition(
      ordinaryReacquired ? afterReturn.end : undefined,
      earlyAcquiredOn && earlyAcquiredOn >= lostOnTrip.returned
        ? earlyAcquiredOn
        : undefined,
    );
    if (reacquiredOn) {
      acquiredOn = reacquiredOn;
      lost = false;
    }
  }
  const qualifyingDate = acquiredOn ?? d;
  if (family && !already && !f.retainedEvent) {
    const familyRules = v.euFamily.value;
    if (
      f.relationship === 'extended-relative' ||
      f.relationship === 'durable-partner'
    ) {
      const duration =
        f.previouslyCohabitedFrom &&
        f.previouslyCohabitedUntil &&
        f.previouslyCohabitedUntil <= d
          ? f.previouslyCohabitedUntil >=
            addMonths(
              f.previouslyCohabitedFrom,
              f.relationship === 'durable-partner'
                ? familyRules.partnerYears * 12
                : familyRules.householdMonths,
            )
          : undefined;
      const evidence =
        f.relationship === 'durable-partner'
          ? any(duration, f.commonChildAndStableCohabitation)
          : any(f.dependent, duration, f.personalCareNecessary);
      checks.push(
        rule(
          'U03',
          `扩展亲属须证明在原居住国受扶养或共同生活（${familyRules.householdMonths} 个月），或因健康或残障需要亲属照料。稳定伴侣可凭共同生活 ${familyRules.partnerYears} 年或共同子女及稳定共居，取决于个案认定。`,
          `Extended relatives must show dependence or a shared household (${familyRules.householdMonths} months) in the country of previous residence, or a need for personal care due to serious health grounds or disability. Durable partners may evidence ${familyRules.partnerYears} year together or a common child and stable cohabitation. Individual recognition is required.`,
          all(
            f.accompanyingOrJoining,
            f.relationshipDocumented,
            f.extendedFamilyRecognized === true
              ? true
              : all(evidence, f.extendedFamilyRecognized),
          ),
          '2 bis.1–4',
        ),
      );
    } else {
      const under = f.birthDate
        ? fullYears(f.birthDate, qualifyingDate) < familyRules.dependentAge
        : undefined;
      let relative: Evidence;
      switch (f.relationship) {
        case 'spouse':
        case 'registered-partner':
          relative = true;
          break;
        case 'descendant':
          relative = any(
            f.dependent,
            all(
              f.studentSponsor === undefined ? undefined : !f.studentSponsor,
              any(under, f.incapacitated),
            ),
          );
          break;
        case 'ascendant':
          relative = all(
            f.dependent,
            f.studentSponsor === undefined ? undefined : !f.studentSponsor,
          );
          break;
        case 'other':
          relative = false;
          break;
      }
      checks.push(
        rule(
          'U02',
          `核实陪同或团聚时有效的配偶或登记伴侣关系、未满 ${familyRules.dependentAge} 岁或受扶养／无行为能力的后代，或受扶养尊亲。学生家庭适用较窄范围。`,
          `Verify the qualifying family relationship when accompanying or joining: spouse, registered partner, descendant under ${familyRules.dependentAge} or dependent/incapacitated, or dependent ascendant. Student sponsors have a narrower family circle.`,
          all(f.accompanyingOrJoining, f.relationshipDocumented, relative),
          '2, 7.4',
        ),
      );
    }
  }
  const retained = f.retainedEvent !== undefined;
  const priorJointResidence =
    f.priorFamilyResidenceFrom ?? f.jointResidenceFrom;
  const permanentBeforeEvent =
    acquiredOn &&
    f.eventDate &&
    acquiredOn <= f.eventDate &&
    priorJointResidence &&
    priorJointResidence <= addYears(acquiredOn, -limits.years);
  if (family && retained && !already && !permanentBeforeEvent) {
    const r = v.euRetention.value;
    const lived =
      f.priorFamilyResidenceFrom && f.eventDate
        ? f.priorFamilyResidenceFrom <= f.eventDate
        : undefined;
    let criteria: Evidence;
    if (f.retainedEvent === 'sponsor-death') {
      const year =
        f.priorFamilyResidenceFrom && f.eventDate
          ? addYears(f.priorFamilyResidenceFrom, r.beforeDeathYears) <=
            f.eventDate
          : undefined;
      criteria = all(lived, f.eventReported, year === false ? undefined : year);
    } else if (f.retainedEvent === 'child-in-education')
      criteria = f.continuingChildEducationAndCustody;
    else {
      const started =
        f.divorceProceedingsStartedOn &&
        f.eventDate &&
        f.divorceProceedingsStartedOn <= f.eventDate
          ? f.divorceProceedingsStartedOn
          : undefined;
      const duration = all(
        started && f.relationshipFrom
          ? addYears(f.relationshipFrom, r.relationshipYears) <= started
          : undefined,
        started && priorJointResidence
          ? addYears(priorJointResidence, r.inSpainYears) <= started
          : undefined,
      );
      criteria = all(
        f.eventReported,
        any(duration, f.custodyOrAccessInSpain, f.exceptionalHardshipProved),
      );
    }
    checks.push(
      check(
        L,
        'ES-U06',
        '主体死亡、子女持续就学或离婚后，核独立保留依据、报告及监护、探望或困难证据。离婚的婚期及在西居住年限算至诉讼启动日。',
        'Verify personal retention after death, continuing education or divorce, including reporting, custody, access or hardship. Count the marriage and Spanish residence periods up to the start of divorce proceedings.',
        f.retainedStatusAccepted ??
          all(f.eventDate ? f.eventDate <= d : undefined, criteria),
        [
          ...source('9.2–4 (including 9.4.a), 9 bis'),
          { srcId: 'SRC-330', locator: 'arts. 12–13, 18' },
        ],
        ['PD-299'],
      ),
    );
  }

  const { ordinaryTime, historical } = ordinary;
  const timeCheck = check(
    L,
    'ES-U04',
    `普通途径须在西合法连续居住 ${limits.years} 年；核每年 ${limits.annualAwayMonths} 个月的离境、兵役或一次最长 ${limits.importantMonths} 个月的重要事由，以及已执行驱逐。`,
    `Ordinary acquisition requires ${limits.years} years of continuous lawful residence: check ${limits.annualAwayMonths} months of absence per year, military service, a single important absence up to ${limits.importantMonths} months and executed expulsions.`,
    ordinaryTime,
    [
      ...source('10.1, 10.6–7, 14.3, 15.3'),
      { srcId: 'SRC-330', locator: 'arts. 16, 21' },
    ],
    ['PD-298'],
  );
  const historyCheck = check(
    L,
    'ES-U05',
    '取得永久权前，核对合资格期间的工作、自雇、保留工作者身份、家属资格，或足够财力与全面医保。学生需有效注册、资源声明及全面医保。取得后可凭历史期间证明该项。',
    'For the period before acquisition, verify work, self-employment, retained worker or family status, or sufficient means and comprehensive insurance. Students need enrolment, a means declaration and insurance. A completed qualifying period establishes this condition after acquisition.',
    historical,
    [
      ...source('7.1–4, 7.6–7, 10.1'),
      { srcId: 'SRC-329', locator: 'art. 3.2' },
      { srcId: 'SRC-337', locator: 'RDL 3/2026 art. 2.5' },
    ],
    ['PD-298'],
  );

  if (early || already) {
    info.push(timeCheck, historyCheck);
    if (early) info.push(early);
    const acquired = any(
      !!already,
      all(ordinaryTime, historical),
      early
        ? early.status === 'UNKNOWN'
          ? undefined
          : early.status === 'MET'
        : false,
    );
    checks.push(
      rule(
        'U04-basis',
        '通过普通年限、所选提前途径或此前已取得永久权的证明，确认取得依据。',
        'Establish acquisition through ordinary residence, the selected early basis or evidence of an existing permanent right.',
        acquired,
        '10.1–5',
      ),
    );
  } else checks.push(timeCheck, historyCheck);
  if (acquiredOn || early?.status === 'MET') {
    checks.push(
      rule(
        'U04-retention',
        `取得后离开西班牙连续超过 ${limits.lossYears} 年可丧失永久权。`,
        `After acquisition, more than ${limits.lossYears} consecutive years outside Spain can end permanent residence.`,
        lost
          ? false
          : acquiredOn === d ||
              ((acquiredOn || longAbsences.length === 0) &&
                (f.postAcquisitionTravelComplete ??
                  (f.trips !== undefined || req.timeRecordsComplete === true)))
            ? true
            : undefined,
        '10.7',
        ['PD-298'],
      ),
    );
  }
  checks.push(
    rule(
      'U12',
      `机关依实际、当前及足够严重的威胁判断。入境后 ${v.euHealthReviewMonths.value} 个月内仅在有严重依据时可要求公共健康检查。`,
      `Confirm the authority's assessment of a genuine, present, sufficiently serious threat. Only serious indications justify a public health examination in the first ${v.euHealthReviewMonths.value} months.`,
      f.noOfficialRestriction,
      '15.1, 15.5, 15.9',
    ),
  );
  const doc = f.document,
    card = v.euDocument.value;
  const window =
    doc?.priorCardExpiry && doc.applied
      ? all(
          doc.applied <= d,
          doc.applied >= addMonths(doc.priorCardExpiry, -card.earlyMonths),
          byFilingDeadline(
            doc.applied,
            addMonths(doc.priorCardExpiry, card.lateMonths),
            doc.officeHolidays,
          ),
        )
      : undefined;
  const familyDocs = all(
    doc?.ex19,
    doc?.photos === undefined ? undefined : doc.photos === card.photos,
    window,
  );
  info.push(
    check(
      L,
      'ES-U13',
      `永久证明或 EX-19 家属卡，证件费 €${v.euCardFeeEur.value}。家属卡需 ${card.photos} 张照片，到期前 ${card.earlyMonths} 至期后 ${card.lateMonths} 个月申请；受理后 ${card.issueMonths} 个月发卡，每 ${card.cardYears} 年续卡。`,
      `Permanent certificate or EX-19 family card, €${v.euCardFeeEur.value}. Family cards require ${card.photos} photographs; apply from ${card.earlyMonths} month before to ${card.lateMonths} months after expiry. Issuance within ${card.issueMonths} months; renewal every ${card.cardYears} years.`,
      all(
        doc?.validIdOrRenewal,
        doc?.entitlementDocuments,
        (doc?.applied ?? d) < v.feeScheduleFrom.value ||
          doc?.feePaid === undefined
          ? undefined
          : doc.feePaid === v.euCardFeeEur.value,
        family ? familyDocs : f.person === 'eu-eea-swiss' ? true : undefined,
      ),
      [
        ...source('10–12, 14'),
        ...v.euCardFeeEur.sources,
        ...v.euDocument.sources,
        { srcId: 'SRC-090', locator: 'art. 30.4–6' },
      ],
      ['PD-298'],
    ),
  );
  const result = pathway(
    'ES-U',
    L('自由流动制度下的永久居留', 'Permanent residence under free movement'),
    checks,
    info,
  );
  if (result.status === 'MET') {
    result.earliestDate = d;
    if (acquiredOn) result.pathwayCompletionDate = acquiredOn;
  }
  return {
    result,
    acquiredOn,
    restartFrom: lost ? lostOnTrip?.returned : undefined,
  };
}

// Absences recorded for the same applicant also apply to early acquisition.
// Keep the U reason when both questionnaires describe the same journey.
function withRecordedTravel(req: EsFullRequest): EsFullRequest {
  const f = req.freeMovement;
  if (
    !f?.earlyBasis ||
    (!req.trips.length && !req.residence?.tripDetails?.length)
  )
    return req;
  const records = new Map<string, FreeMovementTrip>();
  const add = (t: FreeMovementTrip) => {
    const key = t.departed + '/' + t.returned;
    records.set(key, { ...t, reason: t.reason ?? records.get(key)?.reason });
  };
  for (const t of req.trips) add(t);
  for (const t of req.residence?.tripDetails ?? [])
    add({
      departed: t.departed,
      returned: t.returned,
      reason: t.reason === 'ordinary' ? 'ordinary' : undefined,
    });
  for (const t of f.trips ?? []) add(t);
  const trips = [...records.values()];
  return { ...req, trips, freeMovement: f.trips ? { ...f, trips } : f };
}

export function freeMovementPath(input: EsFullRequest): CountryPathway {
  const req = withRecordedTravel(input);
  const { result, acquiredOn, restartFrom } = freeMovementAt(req);
  const f = req.freeMovement;
  if (result.status === 'MET' || !f) return result;

  const day = req.simulationDate;
  const candidates: IsoDate[] = [];
  if (f.history?.length && f.residenceFrom && f.noExecutedExpulsion) {
    // After the last recorded start or return, one whole residence period
    // is sufficient to test every remaining window of ongoing lawful residence.
    const lastStart = [
      day,
      f.residenceFrom,
      f.jointResidenceFrom ?? day,
      restartFrom ?? day,
      ...f.history.map((p) => p.from),
      ...(f.trips ?? req.trips).map((t) => t.returned),
    ]
      .sort()
      .at(-1)!;
    const window = ordinaryWindow(
      req,
      f,
      afterYears(lastStart, v.freeMovementResidence.value.years),
      restartFrom,
      true,
    );
    if (window.end > day && all(window.ordinaryTime, window.historical))
      candidates.push(window.end);
  }
  // Retirement, incapacity and death have an individual dated event.
  // No comparable acquisition date is established by a worker-family finding
  // or the last day of Spanish employment before cross-border work.
  const event =
    f.earlyBasis === 'death-at-work'
      ? f.eventDate
      : f.earlyBasis === 'retirement' || f.earlyBasis === 'incapacity'
        ? f.workStopped
        : undefined;
  const eventStatus =
    event && event > day
      ? earlyCheck({ ...req, simulationDate: event }, f).status
      : undefined;
  if (event && eventStatus === 'MET') candidates.push(event);
  const retentionEvent =
    f.retainedEvent && f.eventDate && f.eventDate > day
      ? f.eventDate
      : undefined;
  const acquisition =
    candidates.sort()[0] ?? (retentionEvent ? acquiredOn : undefined);
  const timed = acquisition
    ? { ...result, pathwayCompletionDate: acquisition }
    : result;
  return projectFilingDates(
    timed,
    day,
    [
      ...candidates,
      retentionEvent,
      eventStatus === 'UNKNOWN' ? event : undefined,
    ],
    (date) => freeMovementAt({ ...req, simulationDate: date }).result,
    req.locale,
  );
}

// Walk backwards from the event. Adjacent or overlapping lawful bases form
// one period; an uncovered day prevents earlier records extending that period.
function coveredStarts(
  history: FreeMovementPeriod[],
  end: IsoDate,
  qualifies = periodMet,
): Set<IsoDate> {
  const starts = new Set([end]);
  for (const p of [...history].sort((a, b) => b.from.localeCompare(a.from))) {
    for (const start of [...starts]) {
      const last = addDays(start, -1);
      if (p.from > last || (p.to && p.to < last)) continue;
      const met = qualifies(p, last);
      if (met === true) starts.delete(start);
      if (met !== false) starts.add(p.from);
    }
  }
  return starts;
}

function durationMet(
  starts: Set<IsoDate>,
  longEnough: (from: IsoDate) => boolean,
): Evidence {
  const outcomes = [...starts].map(longEnough);
  if (outcomes.every(Boolean)) return true;
  return outcomes.some(Boolean) ? undefined : false;
}

function earlyResidence(
  evidence: ResidenceEvidence,
  residenceFrom: IsoDate | undefined,
  end: IsoDate | undefined,
  years: number,
  strict: boolean,
): Evidence {
  const { history, trips, continuityAccepted, noExecutedExpulsion } = evidence;
  if (!end || (!history && !residenceFrom))
    return all(undefined, noExecutedExpulsion, continuityAccepted);
  const longEnough = (from: IsoDate) => {
    const anniversary = addYears(from, years);
    return strict ? anniversary < end : anniversary <= end;
  };
  if (residenceFrom && !longEnough(residenceFrom)) return false;
  const historyStarts = history
    ? coveredStarts(history, end)
    : [residenceFrom!];
  let starts = new Set(
    [...historyStarts].map((s) =>
      residenceFrom && s < residenceFrom ? residenceFrom : s,
    ),
  );
  if (trips && continuityAccepted === undefined) {
    for (const t of [...trips].sort((a, b) =>
      a.returned.localeCompare(b.returned),
    )) {
      if (t.departed >= end || t.reason === 'military') continue;
      const until = t.returned < end ? t.returned : end;
      const next = new Set(starts);
      for (const start of starts) {
        if (start >= until || !longEnough(start)) continue;
        const from = t.departed > start ? t.departed : start;
        const year = afterYears(start, fullYears(start, from));
        const met = tripsMet(trips, year, until, start, end);
        // A disputed interruption can change the anniversary used for later trips.
        if (met !== true) next.add(until);
        if (met === false) next.delete(start);
      }
      starts = next;
    }
  }
  return all(
    durationMet(starts, longEnough),
    history ? true : undefined,
    noExecutedExpulsion,
    continuityAccepted ?? (trips ? true : undefined),
  );
}

// RD 240/2007 art. 10.4 counts documented involuntary unemployment and
// suspensions due to illness or accident as employment.
function employmentPeriod(p: FreeMovementPeriod): Evidence {
  switch (p.basis) {
    case 'employment':
    case 'self-employment':
    case 'temporary-incapacity':
      return p.documented;
    case 'unemployed':
    case 'training':
      return all(p.documented, p.involuntaryAndRegistered);
    default:
      return false;
  }
}

function earlyCheck(req: EsFullRequest, f: EsFreeMovementFacts): CountryCheck {
  const L = textFor(req),
    d = req.simulationDate,
    end = f.workStopped,
    t = v.earlyPermanent.value;
  const eventOccurred = end ? end <= d : undefined;
  const lived = (years: number, strict: boolean) => {
    // The dated worker declaration can evidence residence in summary-only inputs.
    // Where a detailed history is supplied it determines coverage instead.
    const history =
      !f.history?.length &&
      f.residenceFrom &&
      f.employmentFrom &&
      f.qualifiedWorker
        ? [
            {
              from: f.employmentFrom,
              basis: 'employment' as const,
              documented: true,
            },
          ]
        : f.history;
    const residence = earlyResidence(
      { ...f, history, trips: f.trips ?? req.trips },
      f.residenceFrom,
      end,
      years,
      strict,
    );
    // Incomplete travel can establish a break, but cannot establish continuity.
    return all(
      residence,
      f.continuityAccepted ?? (recordedTrips(req, f) ? true : undefined),
    );
  };
  const workedFor = (anniversary: (from: IsoDate) => IsoDate) => {
    if (!end) return undefined;
    const longEnough = (from: IsoDate) => anniversary(from) <= end;
    if (f.employmentFrom && !longEnough(f.employmentFrom)) return false;
    if (!f.history?.length) return f.employmentFrom ? true : undefined;
    return durationMet(
      coveredStarts(f.history, end, employmentPeriod),
      longEnough,
    );
  };
  switch (f.earlyBasis) {
    case 'retirement': {
      const table = v.retirementTable.value;
      const months =
        f.contributionMonths === undefined
          ? undefined
          : f.contributionMonths >= table.contributionMonths
            ? table.ageMonths
            : table.otherAgeMonths;
      const reached =
        end &&
        end.startsWith(String(table.year)) &&
        f.birthDate &&
        months !== undefined
          ? addMonths(f.birthDate, months) <= end
          : undefined;
      const retirement = any(
        f.earlyEmployeeRetirement,
        f.pensionEligibilityDecided ??
          all(reached, f.pensionContributionsQualified),
      );
      const work = workedFor((from) => addMonths(from, t.retirementWorkMonths));
      const duration = any(
        f.spanishSpouseExemption,
        lived(t.retirementResidenceYears, true),
      );
      return check(
        L,
        'ES-U07',
        `退休时已达到领养老金资格或受雇者提前退休；在西从业满 ${t.retirementWorkMonths} 个月且连续居住超过 ${t.retirementResidenceYears} 年。退休年龄按相应年度和缴费期核。西籍配偶的工作期豁免可能需个案解释。`,
        `At cessation, qualify for a pension at retirement age or take early employee retirement, with ${t.retirementWorkMonths} months of work and more than ${t.retirementResidenceYears} years' residence. Verify pension age for the year and contribution record. A Spanish spouse's exemption from the work period can need an individual ruling.`,
        all(
          eventOccurred,
          f.qualifiedWorker,
          retirement,
          duration,
          work === false && f.spanishSpouseExemption !== false
            ? undefined
            : work,
        ),
        [
          ...source('7, 10.2.a, 10.4, 10.6, 14.3, 15.3'),
          ...v.retirementTable.sources,
          { srcId: 'SRC-330', locator: 'arts. 16.3, 17.1.a, 17.2, 21' },
        ],
        ['PD-298', 'PD-299'],
      );
    }
    case 'incapacity':
      return check(
        L,
        'ES-U08',
        `永久失能导致停工且在西连续居住超过 ${t.incapacityYears} 年，或有西班牙承担的工伤待遇或西籍配偶豁免。`,
        `Work ceased because of permanent incapacity after more than ${t.incapacityYears} years' continuous residence, or an occupational benefit paid by Spain or a Spanish-spouse exemption applies.`,
        all(
          eventOccurred,
          f.qualifiedWorker,
          f.permanentIncapacity,
          any(
            f.occupationalSpanishBenefit,
            f.spanishSpouseExemption,
            lived(t.incapacityYears, true),
          ),
        ),
        [
          ...source('7, 10.2.b, 10.4, 10.6, 14.3, 15.3'),
          { srcId: 'SRC-330', locator: 'arts. 16.3, 17.1.b, 17.2, 21' },
        ],
        ['PD-298', 'PD-299'],
      );
    case 'cross-border':
      return check(
        L,
        'ES-U09',
        `转至另一成员国工作前在西连续工作和居住满 ${t.crossBorderYears} 年，保留西班牙居所且至少每周返回。`,
        `Before taking work in another Member State, complete ${t.crossBorderYears} consecutive years of work and residence in Spain, keep a Spanish home and return at least weekly.`,
        all(
          eventOccurred,
          f.qualifiedWorker,
          lived(t.crossBorderYears, false),
          workedFor((from) => addYears(from, t.crossBorderYears)),
          f.workingInAnotherMemberState,
          f.retainedSpanishHome,
          f.returnsAtLeastWeekly,
        ),
        [
          ...source('7, 10.2.c, 10.4, 10.6, 14.3, 15.3'),
          { srcId: 'SRC-330', locator: 'arts. 16.3, 17.1.c, 21' },
        ],
        ['PD-298'],
      );
    case 'worker-family':
      return check(
        L,
        'ES-U10',
        '作为家属与已依退休、失能或跨境工作取得永久权的工人在西共同居住。',
        'Live in Spain as family with a worker who has already acquired early permanent residence.',
        all(f.coResidentWithWorker, f.workerAcquiredEarly),
        source('10.3'),
      );
    default: {
      const death = f.eventDate;
      const before = earlyResidence(
        f.workerResidenceEvidence ?? {},
        f.workerResidenceFrom,
        death,
        t.deathYears,
        false,
      );
      return check(
        L,
        'ES-U11',
        `与取得永久权前在职死亡的工人同住；工人死亡前已在西连续居住满 ${t.deathYears} 年、死于工伤或配偶因该婚姻失去西籍，任一即可。`,
        `Live with a worker who died in active service before acquiring permanent residence. Establish any of ${t.deathYears} years of the worker's prior residence, occupational death or the spouse's loss of Spanish nationality through marriage.`,
        all(
          death ? death <= d : undefined,
          f.diedDuringWorkBeforePermanent,
          f.coResidentWithWorker,
          any(
            before,
            f.occupationalDeath,
            f.spouseLostSpanishNationalityThroughMarriage,
          ),
        ),
        [
          ...source('7, 10.5–6, 14.3, 15.3'),
          { srcId: 'SRC-330', locator: 'arts. 16.3, 17.4, 21' },
        ],
        ['PD-298'],
      );
    }
  }
}
