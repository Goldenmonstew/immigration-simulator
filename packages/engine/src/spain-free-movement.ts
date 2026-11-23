import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addDays, addMonths, addYears, daysBetween, fullYears } from './dates';
import { Days, monthSpan } from './pilot';
import { textFor } from './rule';
import {
  all,
  any,
  byFilingDeadline,
  check,
  pathway,
} from './spain-full-common';
import type { Evidence } from './spain-full-common';
import type { EsFullRequest } from './spain-full';
import type { EsTrip } from './spain';
import type { IsoDate } from './types';

const v = spainFull2026_11.values;
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
type EarlyBasis =
  | 'retirement'
  | 'incapacity'
  | 'cross-border'
  | 'worker-family'
  | 'death-at-work';
export interface EsFreeMovementFacts {
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
  history?: FreeMovementPeriod[];
  trips?: (EsTrip & {
    reason?:
      | 'ordinary'
      | 'military'
      | 'important'
      | 'cooperation-or-eu-study'
      | 'unconfirmed';
  })[];
  noExecutedExpulsion?: boolean;
  /** The authority's finding on disputed continuity, if available. */
  continuityAccepted?: boolean;
  retainedEvent?: 'sponsor-death' | 'child-in-education' | 'divorce';
  eventDate?: IsoDate;
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

function tripsMet(
  req: EsFullRequest,
  f: EsFreeMovementFacts,
  start: IsoDate,
  end: IsoDate,
): Evidence {
  if (f.continuityAccepted !== undefined) return f.continuityAccepted;
  const trips =
    f.trips ?? (req.timeRecordsComplete === false ? undefined : req.trips);
  if (!trips) return undefined;
  const limit = v.freeMovementResidence.value;
  const days = new Days(start, end),
    absent = Array<boolean>(days.count).fill(false);
  const importantTrip = trips
    .filter(
      (t) =>
        'reason' in t &&
        t.reason === 'important' &&
        t.returned > start &&
        t.departed < end &&
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
  for (const t of trips) {
    if (t.returned <= start || t.departed >= end) continue;
    const reason = 'reason' in t ? (t.reason ?? 'unconfirmed') : 'unconfirmed';
    if (reason === 'military') continue;
    if (t === importantTrip) continue;
    ordinaryTrips++;
    if (t.returned > addMonths(t.departed, limit.annualAwayMonths))
      singleWithinLimit = false;
    if (reason === 'cooperation-or-eu-study' || reason === 'unconfirmed')
      uncertain = true;
    if (
      t.departed >= start &&
      t.returned <= end &&
      t.returned > addMonths(t.departed, limit.annualAwayMonths) &&
      reason !== 'cooperation-or-eu-study' &&
      reason !== 'unconfirmed'
    )
      return false;
    days.mark(absent, addDays(t.departed, 1), addDays(t.returned, -1));
  }
  const sums = days.sums((i) => absent[i]);
  const [min, max] = monthSpan(limit.annualAwayMonths);
  if ((ordinaryTrips === 1 && singleWithinLimit) || sums[days.count] <= min)
    return true;
  // A definite excess within a residence year, or a borderline rolling window.
  const boundaryDays = new Set<IsoDate>([start, addDays(end, 1)]);
  let borderline = false;
  for (let i = 0; i < days.count; i++) {
    const from = days.date(i);
    if (from.slice(5) === '01-01' || from.slice(5) === start.slice(5))
      boundaryDays.add(from);
    if (days.total(sums, from, addDays(addYears(from, 1), -1)) > min)
      borderline = true;
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
  return borderline ? undefined : true;
}

export function freeMovementPath(req: EsFullRequest): CountryPathway {
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
  const already = f.acquiredOn !== undefined && f.acquiredOn <= d;
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
          `扩展亲属核在原籍受扶养、共同生活（${familyRules.householdMonths} 个月）或必要照料。稳定伴侣可凭共同生活 ${familyRules.partnerYears} 年或共同子女及稳定共居，取决于个案认定。`,
          `Verify dependence, a shared household (${familyRules.householdMonths} months) or necessary personal care. Durable partners may evidence ${familyRules.partnerYears} year together or a common child and stable cohabitation. Individual recognition is required.`,
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
        ? fullYears(f.birthDate, d) < familyRules.dependentAge
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
  if (family && retained && !already) {
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
      const duration =
        f.relationshipFrom && f.priorFamilyResidenceFrom && f.eventDate
          ? addYears(f.relationshipFrom, r.relationshipYears) <= f.eventDate &&
            addYears(f.priorFamilyResidenceFrom, r.inSpainYears) <= f.eventDate
          : undefined;
      criteria = all(
        f.eventReported,
        any(duration, f.custodyOrAccessInSpain, f.exceptionalHardshipProved),
      );
    }
    checks.push(
      check(
        L,
        'ES-U06',
        '主体死亡、子女持续就学或离婚后，核独立保留依据、关系和居住期间、报告及监护、探望或困难证据。',
        'Verify personal retention after death, continuing education or divorce, including residence and relationship periods, reporting, custody, access or hardship.',
        f.retainedStatusAccepted ??
          all(f.eventDate ? f.eventDate <= d : undefined, criteria),
        [
          ...source('9, 9 bis'),
          { srcId: 'SRC-330', locator: 'arts. 12–13, 18' },
        ],
        ['PD-299'],
      ),
    );
  }

  const limits = v.freeMovementResidence.value;
  const end = f.acquiredOn && f.acquiredOn < d ? f.acquiredOn : d;
  const start = addYears(end, -limits.years);
  const ordinaryTime = all(
    f.residenceFrom ? f.residenceFrom <= start : undefined,
    family && !retained
      ? f.jointResidenceFrom
        ? f.jointResidenceFrom <= start
        : undefined
      : true,
    f.noExecutedExpulsion,
    tripsMet(req, f, start, end),
  );
  const historical = historyMet(f.history, start, addDays(end, -1));
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
    '核对合资格期间的工作、自雇、保留工作者身份、家属资格，或足够财力与全面医保；学生需有效注册、资源声明及全面医保。',
    'Cover the qualifying period with work, self-employment, retained worker or family status, or sufficient means and comprehensive insurance. Students need enrolment, a means declaration and insurance.',
    historical,
    [
      ...source('7.1–4, 7.6–7'),
      { srcId: 'SRC-329', locator: 'art. 3.2' },
      { srcId: 'SRC-337', locator: 'RDL 3/2026 art. 2.5' },
    ],
    ['PD-298'],
  );

  const early = f.earlyBasis ? earlyCheck(req, f) : undefined;
  if (early || already) {
    info.push(timeCheck, historyCheck);
    if (early) info.push(early);
    const acquired = any(
      already,
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
  if (already) {
    const away = f.longestPostAcquisitionAbsence;
    checks.push(
      rule(
        'U04-retention',
        `取得后离开西班牙连续超过 ${limits.lossYears} 年可丧失永久权。`,
        `After acquisition, more than ${limits.lossYears} consecutive years outside Spain can end permanent residence.`,
        away &&
          (away.returned < d ? away.returned : d) >
            addYears(away.departed, limits.lossYears)
          ? false
          : f.postAcquisitionTravelComplete === true
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
  return pathway(
    'ES-U',
    L('自由流动制度下的永久居留', 'Permanent residence under free movement'),
    checks,
    info,
  );
}

function earlyCheck(req: EsFullRequest, f: EsFreeMovementFacts): CountryCheck {
  const L = textFor(req),
    d = req.simulationDate,
    end = f.workStopped,
    t = v.earlyPermanent.value;
  const eventOccurred = end ? end <= d : undefined;
  const lived = (years: number, strict: boolean) =>
    end && f.residenceFrom
      ? strict
        ? addYears(f.residenceFrom, years) < end
        : addYears(f.residenceFrom, years) <= end
      : undefined;
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
      const work =
        end && f.employmentFrom
          ? addMonths(f.employmentFrom, t.retirementWorkMonths) <= end
          : undefined;
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
          ...source('10.2.a, 10.4'),
          ...v.retirementTable.sources,
          { srcId: 'SRC-330', locator: 'art. 17.1.a, 17.2' },
        ],
        ['PD-299'],
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
          ...source('10.2.b, 10.4'),
          { srcId: 'SRC-330', locator: 'art. 17.1.b, 17.2' },
        ],
        ['PD-299'],
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
          end && f.employmentFrom
            ? addYears(f.employmentFrom, t.crossBorderYears) <= end
            : undefined,
          f.workingInAnotherMemberState,
          f.retainedSpanishHome,
          f.returnsAtLeastWeekly,
        ),
        source('10.2.c, 10.4'),
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
      const before =
        death && f.workerResidenceFrom
          ? addYears(f.workerResidenceFrom, t.deathYears) <= death
          : undefined;
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
        [...source('10.5'), { srcId: 'SRC-330', locator: 'art. 17.4' }],
      );
    }
  }
}
