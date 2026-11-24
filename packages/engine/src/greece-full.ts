import {
  grPolicyEffectiveDates,
  grSource,
  greeceFull2026_11 as policy,
} from '@uk-immigration/policy-data';
import type {
  CountryCheck,
  CountryPathway,
  CountryResult,
} from './country-result';
import { addDays, addMonths, addYears } from './dates';
import { HORIZON_YEARS } from './pilot';
import {
  blueMobilityTiming,
  type GrBlueCardMobility,
} from './greece-blue-mobility';
import { greeceFilingPeriods } from './greece';
import { recordedCardExpiry } from './greece-permit-history';
import type {
  GrPathway,
  GrPathwayId,
  GrPermit,
  GrRequest,
  GrTrip,
} from './greece';
import {
  commonChecks,
  ordinaryRenewalWindow,
  type GrCommonAnswers,
} from './greece-common';
import {
  propertyFamilyChecks,
  type GrPropertyFamilyAnswers,
} from './greece-property-family';
import {
  absencePeriods,
  grContext,
  type GrContext,
  type GrEntry,
  type GrInsurance,
} from './greece-rules';
import {
  backlogCredits,
  settlementChecks,
  type GrSettlementAnswers,
} from './greece-settlement';
import {
  workFamilyChecks,
  type GrWorkFamilyAnswers,
} from './greece-work-family';
import type { IsoDate } from './types';

const titles = {
  'GR-LONG-TERM': ['欧盟长期居民 Μ.1', 'EU long-term resident Μ.1'],
  'GR-GOLDEN-VISA': ['黄金签证 Β.5', 'Golden visa Β.5'],
  'GR-NATIONALITY': ['归化入籍', 'Naturalisation'],
  'GR-TEN-YEAR': ['十年居留许可 Μ.2', 'Ten-year residence Μ.2'],
  'GR-GREEK-FAMILY-PR': [
    '希腊公民家属 Ο.3 / Μ.3',
    'Family of a Greek citizen Ο.3 / Μ.3',
  ],
  'GR-EU-FAMILY-PR': ['欧盟公民家属 Ν', 'Family of an EU citizen Ν'],
  'GR-WORK': ['受雇工作 Ε.1 / Ε.4', 'Employment Ε.1 / Ε.4'],
  'GR-FAMILY-TCN': [
    '第三国公民家庭团聚 Ο.1 / Ο.2',
    'Third-country family reunification Ο.1 / Ο.2',
  ],
} as const;

export type GrFullPathwayId = keyof typeof titles;
export interface GrFullRequest
  extends
    Partial<GrRequest>,
    GrCommonAnswers,
    GrSettlementAnswers,
    GrPropertyFamilyAnswers,
    GrWorkFamilyAnswers {
  simulationDate: IsoDate;
  trips?: (GrTrip & {
    /** Classification of this absence under the Greek or EU family continuity rules. */
    familyAbsenceReason?: 'ordinary' | 'compulsory-service' | 'serious-reason';
  })[];
  /** The time model uses validity dates. The full model can also use the grant on the card. */
  permits?: (GrPermit & {
    issuedOn?: IsoDate;
    purpose?: 'family-reunification' | 'other';
  })[];
  /** All Greek permits granted to the applicant have been entered in the history. */
  permitHistoryComplete?: boolean;
  birthDate?: IsoDate;
  citizenship?: 'third-country' | 'stateless' | 'eu' | 'eea-swiss' | 'greek';
  /** National visa for the purpose selected; short stay means it is still lawful. */
  entry?: GrEntry;
  insurance?: GrInsurance;
  /** Omit to return all eight routes. An absent answer differs from an empty history. */
  pathways?: GrFullPathwayId[];
  blueCardMobility?: GrBlueCardMobility;
  /** For M.1 only. The permit periods after grant belong in the ordinary permit history. */
  grantedProtection?: {
    claimedOn: IsoDate;
    grantedOn: IsoDate;
    /** Last day excluded under article 144(2A), or confirmation that no exclusion applies. */
    priorResidenceExcludedThrough?: IsoDate | 'none';
  };
}

const timeIds = {
  'GR-LONG-TERM': [
    'LT-TIME-RESIDENCE',
    'LT-TIME-SINGLE-ABSENCE',
    'LT-TIME-TOTAL-ABSENCE',
  ],
  'GR-NATIONALITY': ['NAT-TIME-RESIDENCE'],
  'GR-GOLDEN-VISA': ['GV-TIME-RENEWAL', 'GV-TIME-LATE'],
} as const;

function bornResidentExemption(req: GrFullRequest) {
  return (
    req.route === 'general' &&
    req.nationality?.bornAndContinuouslyResident === true
  );
}

function birthResidenceNeedsReview(req: GrFullRequest) {
  const filing =
    req.nationality?.pendingApplicationFiledOn ?? req.simulationDate;
  return !!(
    absencePeriods(req.trips ?? [], req.birthDate, filing).length ||
    req.nationality?.diplomaticSpouse?.periods.some(
      (period) =>
        period.from < filing &&
        (!req.birthDate || period.through >= req.birthDate),
    )
  );
}

function timeRoute(
  id: GrFullPathwayId,
  req: GrFullRequest,
): GrPathwayId | undefined {
  switch (id) {
    case 'GR-LONG-TERM':
      return req.longTerm?.stage === 'initial' ? id : undefined;
    case 'GR-NATIONALITY':
      return req.nationality?.stage === 'application' &&
        (!bornResidentExemption(req) || birthResidenceNeedsReview(req))
        ? id
        : undefined;
    case 'GR-GOLDEN-VISA':
      return req.goldenVisa?.stage === 'renewal' ? id : undefined;
    default:
      return undefined;
  }
}

function longTermPeriods(
  req: GrFullRequest,
  permits: GrPermit[],
  excludedThrough?: IsoDate,
) {
  const credits = backlogCredits(req);
  const protection = req.grantedProtection;
  const reformed =
    req.simulationDate >= policy.values.protectionCreditFrom.value;
  if (protection && protection.grantedOn <= req.simulationDate) {
    if (protection.claimedOn < protection.grantedOn) {
      const fullCredit =
        reformed ||
        protection.grantedOn >
          addMonths(
            protection.claimedOn,
            policy.values.originalProtectionFullCreditMonths.value,
          );
      // The pilot already weights a study day as half a day of residence.
      credits.push({
        kind: fullCredit ? 'regular' : 'study',
        from: protection.claimedOn,
        to: addDays(protection.grantedOn, -1),
      });
    }
  }
  if (req.blueCardMobility?.greekBlueCardFrom)
    credits.push({
      kind: 'regular',
      from: req.blueCardMobility.greekBlueCardFrom,
      to: req.blueCardMobility.greekBlueCardThrough,
    });
  if (!credits.length && !excludedThrough) return permits;
  // Resolve open original cards before inserting credits so the latter cannot shorten a card.
  const periods = permits.map((period) => {
    if (period.to) return period;
    const next = permits
      .filter((x) => x.kind === period.kind && x.from > period.from)
      .map((x) => x.from)
      .sort()[0];
    return { ...period, to: next && addDays(next, -1) };
  });
  const merged: GrPermit[] = [];
  for (const kind of ['regular', 'study', 'investor', 'temporary'] as const) {
    for (const period of [...periods, ...credits]
      .filter((x) => x.kind === kind)
      .sort((a, b) => a.from.localeCompare(b.from))) {
      const last = merged.at(-1);
      if (
        last?.kind === kind &&
        (!last.to || addDays(last.to, 1) >= period.from)
      ) {
        if (!period.to || (last.to && period.to > last.to)) last.to = period.to;
      } else merged.push({ ...period });
    }
  }
  return excludedThrough && excludedThrough <= req.simulationDate
    ? merged
        .filter((x) => !x.to || x.to > excludedThrough)
        .map((x) => ({
          ...x,
          from:
            x.from <= excludedThrough ? addDays(excludedThrough, 1) : x.from,
        }))
    : merged;
}

function filedNationalityTime(
  req: GrFullRequest,
  path: GrPathway,
  c: GrContext,
): GrPathway {
  const filed = req.nationality?.pendingApplicationFiledOn;
  if (!filed) return path;
  if (filed > req.simulationDate)
    return {
      ...path,
      status: 'UNKNOWN',
      earliestDate: undefined,
      checks: [],
      summary: c.L(
        '待决申请的递交日期须在模拟日或之前。',
        'The pending application must have been filed on or before the review date.',
      ),
    };
  const met = path.checks[0]?.met;
  const status =
    met === false ? 'NOT_MET' : met === undefined ? 'UNKNOWN' : path.status;
  return {
    ...path,
    status,
    earliestDate: status === 'MET' ? filed : undefined,
    summary: c.L(
      `以实际递交日 ${filed} 核对居留年限。`,
      `Residence is assessed on the actual filing date, ${filed}.`,
    ),
  };
}

function goldenRenewalTime(
  req: GrFullRequest,
  original: GrPathway | undefined,
  c: GrContext,
): GrPathway | undefined {
  const expiry =
    req.currentCardExpiresOn ?? recordedCardExpiry(req, 'investor');
  if (!expiry) return undefined;
  const window = ordinaryRenewalWindow(req, expiry, c);
  if (
    original &&
    original.status !== 'NOT_APPLICABLE' &&
    original.status !== 'UNKNOWN' &&
    req.simulationDate >= policy.values.workReformEffective.value &&
    !req.currentCardExpiresOn &&
    !req.permits?.some(
      (p) =>
        p.kind === 'investor' && p.issuedOn && p.issuedOn > req.simulationDate,
    ) &&
    !(req.simulationDate > window.late && req.renewalForceMajeure)
  )
    return original;
  const status =
    typeof window.met === 'string'
      ? 'FUTURE'
      : window.met === undefined
        ? 'UNKNOWN'
        : window.met
          ? 'MET'
          : 'NOT_MET';
  const checks = [
    {
      text: c.L(
        `正常续期窗口 ${window.early} 至 ${expiry}`,
        `Ordinary renewal window ${window.early} to ${expiry}`,
      ),
      met: req.simulationDate >= window.early && req.simulationDate <= expiry,
      sources: window.sources,
    },
  ];
  const late = req.simulationDate > expiry;
  return {
    id: 'GR-GOLDEN-VISA',
    title: c.L('投资者续期', 'Investor renewal'),
    status,
    earliestDate:
      status === 'MET'
        ? req.simulationDate
        : status === 'FUTURE'
          ? window.early
          : undefined,
    summary: window.text,
    checks: late
      ? [
          ...checks,
          {
            text: window.text,
            met: typeof window.met === 'boolean' ? window.met : undefined,
            sources: window.sources,
          },
        ]
      : checks,
    assumptions: [],
    notChecked: [],
  };
}

function specialChecks(
  id: GrFullPathwayId,
  req: GrFullRequest,
  ctx: GrContext,
) {
  switch (id) {
    case 'GR-LONG-TERM':
    case 'GR-TEN-YEAR':
    case 'GR-NATIONALITY':
      return settlementChecks(id, req, ctx);
    case 'GR-GOLDEN-VISA':
    case 'GR-GREEK-FAMILY-PR':
    case 'GR-EU-FAMILY-PR':
      return propertyFamilyChecks(id, req, ctx);
    default:
      return workFamilyChecks(id, req, ctx);
  }
}

function timeChecks(
  id: GrPathwayId,
  time: GrPathway | undefined,
  c: GrContext,
): CountryCheck[] {
  const source =
    time?.checks[0]?.sources ??
    (id === 'GR-LONG-TERM'
      ? policy.values.longTermYears.sources
      : id === 'GR-NATIONALITY'
        ? policy.values.nationalityYears.sources
        : policy.values.renewalWindowMonths.sources);
  const pending = time?.pendingDetails ?? [];
  const checks =
    time?.checks.map((item, i) =>
      c.check(
        timeIds[id][i],
        item.text,
        item.text,
        item.met === false && time.status === 'FUTURE'
          ? time.earliestDate
          : item.met,
        item.sources,
        item.text,
        item.text,
        id === 'GR-LONG-TERM'
          ? time.pendingDetails?.includes('PD-305')
            ? ['PD-305']
            : pending.filter((pd) => pd === (i === 0 ? 'PD-101' : 'PD-102'))
          : id === 'GR-NATIONALITY'
            ? pending.filter((pd) => pd === 'PD-109' || pd === 'PD-106')
            : [],
      ),
    ) ?? [];
  const explanation =
    time?.summary ??
    c.L(
      '请填写本路径的许可历史、出入境记录及适用类别。',
      'Provide the permit history, trips and category needed for this route.',
    );
  const met =
    time?.status === 'MET'
      ? true
      : time?.status === 'FUTURE'
        ? time.earliestDate
        : time?.status === 'NOT_MET' || time?.status === 'NOT_APPLICABLE'
          ? false
          : undefined;
  checks.push(
    c.check(
      id + '-TIME',
      '递交日的时间条件',
      'Timing on the application date',
      met,
      source,
      explanation,
      explanation,
      pending.filter((pd) =>
        ['PD-101', 'PD-102', 'PD-106', 'PD-109', 'PD-305'].includes(pd),
      ),
    ),
  );
  return checks;
}

function routeTiming(
  id: GrPathwayId,
  req: GrFullRequest,
  times: GrPathway[],
  c: GrContext,
) {
  let time: GrPathway | undefined;
  if (
    (req.trips !== undefined || id === 'GR-GOLDEN-VISA') &&
    (req.route !== undefined || id !== 'GR-NATIONALITY')
  )
    time = times.find((path) => path.id === id);
  if (id === 'GR-GOLDEN-VISA') time = goldenRenewalTime(req, time, c);
  if (
    id === 'GR-LONG-TERM' &&
    req.blueCardMobility &&
    req.blueCardMobility.usedLongTermMobility !== false &&
    time?.status !== 'MET'
  ) {
    const mobile = blueMobilityTiming(
      req.blueCardMobility,
      req.trips,
      req.simulationDate,
      c,
    );
    if (
      !time ||
      time.status === 'NOT_MET' ||
      mobile.status === 'MET' ||
      (mobile.status === 'FUTURE' &&
        (!time.earliestDate || mobile.earliestDate! < time.earliestDate)) ||
      (mobile.status === 'UNKNOWN' && time.status !== 'UNKNOWN')
    )
      time = mobile;
  }
  return time;
}

function laterNationalityDate(
  base: GrRequest,
  time: GrPathway,
  c: GrContext,
  evaluateOn = (date: IsoDate) =>
    greeceFilingPeriods({ ...base, simulationDate: date }).pathways[2],
  serviceMilestones: IsoDate[] = [],
): GrPathway {
  if (time.status !== 'NOT_MET') return time;
  const years = policy.values.nationalityYears.value[base.route];
  const horizon = addYears(base.simulationDate, HORIZON_YEARS);
  // Beyond the pilot horizon, eligibility can first arise on a residence anniversary
  // or on receiving a qualifying title after a stretch of lawful residence.
  const candidates = [
    ...serviceMilestones,
    ...base.permits.flatMap((permit) => [
      permit.from,
      addYears(permit.from, years),
    ]),
  ];
  for (const date of [...new Set(candidates)]
    .filter((d) => d > horizon)
    .sort()) {
    const future = evaluateOn(date);
    if (future.status === 'UNKNOWN') return { ...future, checks: time.checks };
    if (!future.earliestDate) continue;
    const earliestDate = future.earliestDate;
    return {
      ...future,
      status: 'FUTURE',
      checks: time.checks,
      summary: c.L(
        `合法居留满 ${years} 年的最早递交日是 ${earliestDate}。`,
        `The earliest application date with ${years} years of legal residence is ${earliestDate}.`,
      ),
    };
  }
  return time;
}

function nationalityWithPosting(
  req: GrRequest,
  posting: NonNullable<
    NonNullable<GrFullRequest['nationality']>['diplomaticSpouse']
  >,
  c: GrContext,
) {
  // The posting itself records an absence even when entered only under this procedure.
  const trips = [...req.trips];
  for (const period of posting.periods) {
    const departed = addDays(period.from, -1);
    const returned = addDays(period.through, 1);
    if (
      !trips.some(
        (trip) => trip.departed <= departed && trip.returned >= returned,
      )
    )
      trips.push({ departed, returned });
  }
  const base = { ...req, trips };
  const ordinary = greeceFilingPeriods(base).pathways[2];
  const completed = posting.yearInGreeceCompletedOn;
  if (
    req.route === 'twelve-year' ||
    posting.qualifyingServiceDocumented === false ||
    completed === 'not-completed'
  )
    return ordinary;
  const withPosting = greeceFilingPeriods(base, {
    periods: posting.periods,
    usableFrom: completed ?? req.simulationDate,
  }).pathways[2];
  const sources = [
    ...withPosting.checks[0].sources,
    grSource('F34', 'Citizenship Code art. 5(1)(δ), p. 8'),
    grSource('F35', 'special cases, p. 2'),
  ];
  const year =
    policy.values.naturalisationScreen.value.diplomaticSpouseDomesticYears;
  const explanation = c.L(
    `申请人须曾在希腊居住满 ${year} 年，才可将随希腊配偶因外交或领事公务居住在境外的有据期间计入所选通道的居留期。递件日另查有效许可。`,
    `Documented periods accompanying a Greek spouse on diplomatic or consular service count towards the selected residence period after completing ${year} year in Greece. A qualifying permit must be held on filing.`,
  );
  if (!completed || posting.qualifyingServiceDocumented === undefined) {
    if (
      ordinary.status === withPosting.status &&
      ordinary.earliestDate === withPosting.earliestDate
    )
      return ordinary;
    return {
      ...ordinary,
      status: 'UNKNOWN' as const,
      earliestDate: undefined,
      pendingDetails: [],
      summary: explanation,
      checks: [{ text: explanation, sources, met: undefined }],
    };
  }
  return {
    ...withPosting,
    summary:
      withPosting.status === 'MET'
        ? explanation
        : withPosting.status === 'FUTURE'
          ? c.L(
              `${explanation} 最早符合时间条件的日期为 ${withPosting.earliestDate}。`,
              `${explanation} The earliest date meeting the time requirements is ${withPosting.earliestDate}.`,
            )
          : explanation + ' ' + withPosting.summary,
    checks: [{ ...withPosting.checks[0], text: explanation, sources }],
  };
}

function pilotTimes(req: GrFullRequest, required: GrPathwayId[], c: GrContext) {
  let times: GrPathway[] = [];
  if (required.length && req.permits) {
    const base = {
      ...req,
      permits: req.permits,
      trips: req.trips ?? [],
      route: req.route ?? ('general' as const),
    };
    times = greeceFilingPeriods(base).pathways;
    const filed = req.nationality?.pendingApplicationFiledOn;
    if (required.includes('GR-NATIONALITY')) {
      const posting = req.nationality?.diplomaticSpouse;
      const evaluateOn = (date: IsoDate) =>
        posting?.periods.length
          ? nationalityWithPosting(
              { ...base, simulationDate: date },
              posting,
              c,
            )
          : greeceFilingPeriods({ ...base, simulationDate: date }).pathways[2];
      const milestones = (posting?.periods ?? []).map((p) =>
        addYears(p.from, policy.values.nationalityYears.value[base.route]),
      );
      if (
        posting?.yearInGreeceCompletedOn &&
        posting.yearInGreeceCompletedOn !== 'not-completed'
      )
        milestones.push(posting.yearInGreeceCompletedOn);
      times[2] = filed
        ? filedNationalityTime(req, evaluateOn(filed), c)
        : laterNationalityDate(
            base,
            posting?.periods.length ? evaluateOn(req.simulationDate) : times[2],
            c,
            evaluateOn,
            milestones,
          );
    }
    if (required.includes('GR-LONG-TERM')) {
      const protection = req.grantedProtection;
      const protectedAtFiling = protection
        ? protection.grantedOn <= req.simulationDate
        : req.longTerm?.category === 'protected';
      const exclusionApplies =
        protectedAtFiling &&
        req.simulationDate >= policy.values.protectionCreditFrom.value;
      const answer = protection?.priorResidenceExcludedThrough;
      const permits = longTermPeriods(
        req,
        req.permits,
        exclusionApplies && answer !== 'none' ? answer : undefined,
      );
      if (permits !== req.permits) {
        const lt = greeceFilingPeriods({ ...base, permits }).pathways[0];
        if (req.grantedProtection)
          lt.checks[0].sources.push(
            ...policy.values.originalProtectionFullCreditMonths.sources,
            ...policy.values.protectionCreditFrom.sources,
          );
        if (backlogCredits(req).length)
          lt.checks[0].sources.push(...policy.values.backlogFilingFrom.sources);
        times = [lt, ...times.filter((path) => path.id !== lt.id)];
      }
      // Compare both readings only when a reported trip could engage article
      // 144(2A). An empty trip history already rules out that event.
      if (exclusionApplies && answer === undefined) {
        const abroad = absencePeriods(
          req.trips ?? [],
          protection?.grantedOn,
          addDays(req.simulationDate, 1),
        ).at(-1);
        if (abroad) {
          const lastTrip = addDays(abroad.until, -1);
          const possible = greeceFilingPeriods({
            ...base,
            permits: longTermPeriods(req, req.permits, lastTrip),
          }).pathways[0];
          const ordinary = times[0];
          if (
            possible.status !== ordinary.status ||
            possible.earliestDate !== ordinary.earliestDate
          ) {
            const explanation = c.L(
              '请确认是否曾被认定无权在另一成员国停居留，以及依法排除的在希居留期间。',
              'Confirm whether unauthorised stay in another Member State was established and which earlier period in Greece was excluded.',
            );
            times[0] = {
              ...ordinary,
              status: 'UNKNOWN',
              earliestDate: undefined,
              summary: explanation,
              checks: [
                {
                  text: explanation,
                  sources: policy.values.protectionCreditFrom.sources,
                },
              ],
            };
          }
        }
      }
    }
  }
  return times;
}

function evaluateFilingOnDate(
  id: GrFullPathwayId,
  req: GrFullRequest,
  scope: CountryCheck,
  times?: GrPathway[],
) {
  const c = grContext(req.locale);
  const rules = [
    scope,
    ...commonChecks(id, req, c),
    ...specialChecks(id, req, c),
  ];
  let time: GrPathway | undefined;
  let timing: CountryCheck[] = [];
  const needed = timeRoute(id, req);
  if (needed)
    time = routeTiming(needed, req, times ?? pilotTimes(req, [needed], c), c);
  if (
    id === 'GR-NATIONALITY' &&
    req.nationality?.stage === 'application' &&
    bornResidentExemption(req) &&
    time?.status !== 'MET'
  ) {
    // The ordinary seven-year route can independently qualify; a disputed
    // exemption alone cannot establish either eligibility or an earliest date.
    time = undefined;
    rules.push(
      c.check(
        'NAT-BIRTH-EXEMPTION',
        '在希出生并持续居住',
        'Born and continuously resident in Greece',
        needed ? undefined : true,
        [grSource('F34', 'ΚΕΙ art. 5(1)(δ)'), grSource('F35', 'p2')],
        needed
          ? '出生至递件日之间有境外居住记录，须核实是否仍符合持续在希居住的豁免。'
          : '已声明在希腊出生并持续居住，适用一般居住年限豁免。',
        needed
          ? 'Verify whether the recorded absences since birth preserve continuous residence for the exemption.'
          : 'Continuous residence in Greece since birth exempts the applicant from the general residence period.',
        needed ? ['PD-106'] : undefined,
      ),
    );
  } else if (needed) timing = timeChecks(needed, time, c);
  // A reporting fine (C-06) does not bar filing. Use the combined timing result
  // because ordinary and late renewal windows are alternatives.
  const gates = [
    ...rules.filter((check) => check.id !== 'C-06'),
    ...timing.filter((check) => check.id === id + '-TIME'),
  ];
  const status: CountryCheck['status'] = gates.some(
    (check) => check.status === 'NOT_MET',
  )
    ? 'NOT_MET'
    : gates.some((check) => check.status === 'UNKNOWN')
      ? 'UNKNOWN'
      : 'MET';
  return {
    checks: [...timing, ...rules],
    status,
    time,
    candidate: [...c.filingDates.values()].sort().at(-1),
    filingDates: c.filingDates,
    calendarChanges: c.calendarChanges,
  };
}

function filingUnderApplicableLaw(
  id: GrFullPathwayId,
  req: GrFullRequest,
  scope: CountryCheck,
  times: GrPathway[],
) {
  let filing = evaluateFilingOnDate(id, req, scope, times);
  let on = req.simulationDate;
  let horizon = filing.candidate;
  const waitsFromReview = new Map<string, IsoDate>();
  const milestones = [...grPolicyEffectiveDates];
  if (id === 'GR-LONG-TERM' || id === 'GR-TEN-YEAR') {
    // A recorded grant can bring a newly creditable period into the calculation.
    for (const period of req.backlogRenewals ?? [])
      milestones.push(period.permitEffectiveOn);
    if (id === 'GR-LONG-TERM' && req.grantedProtection)
      milestones.push(req.grantedProtection.grantedOn);
  }
  while (filing.status !== 'MET' && horizon && on < horizon) {
    // Try an earlier opening without discarding later changes if it is still blocked.
    on = [
      ...milestones,
      ...filing.calendarChanges,
      filing.candidate ?? horizon,
      horizon,
    ]
      .filter((date) => date > on)
      .sort()[0];
    for (const [checkId, due] of filing.filingDates)
      waitsFromReview.set(checkId, due < on ? due : on);
    filing = evaluateFilingOnDate(id, { ...req, simulationDate: on }, scope);
    if (filing.candidate && filing.candidate > horizon)
      horizon = filing.candidate;
  }
  return { filing, on, waitsFromReview };
}

function renewalCardRequest(req: GrFullRequest) {
  const familyExpiry =
    req.familyTcn?.stage === 'renewal'
      ? recordedCardExpiry(req, 'family-reunification')
      : undefined;
  const renewals = [
    ['GR-WORK', req.work?.stage, undefined],
    ['GR-LONG-TERM', req.longTerm?.stage, undefined],
    ['GR-FAMILY-TCN', req.familyTcn?.stage, familyExpiry],
    [
      'GR-GOLDEN-VISA',
      req.goldenVisa?.stage,
      req.goldenVisa?.stage === 'renewal'
        ? recordedCardExpiry(req, 'investor')
        : undefined,
    ],
    ['GR-TEN-YEAR', req.tenYear?.stage, req.tenYear?.cardExpiresOn],
    [
      'GR-GREEK-FAMILY-PR',
      req.greekFamily?.stage,
      req.greekFamily?.priorCardExpiry,
    ],
    ['GR-EU-FAMILY-PR', req.euFamily?.stage, req.euFamily?.priorCardExpiry],
  ] as const;
  const active = renewals.filter(
    ([, stage]) => stage === 'renewal' || stage === 'permanent-renewal',
  );
  const missing = active.filter(([, , expiry]) => !expiry);
  return (id: GrFullPathwayId): GrFullRequest => {
    // Assign the unlabelled date once, after accounting for all declared renewals.
    let currentCardExpiresOn =
      active.length <= 1 || (missing.length === 1 && missing[0][0] === id)
        ? req.currentCardExpiresOn
        : undefined;
    if (id === 'GR-FAMILY-TCN') currentCardExpiresOn ??= familyExpiry;
    if (
      id === 'GR-EU-FAMILY-PR' &&
      (req.euFamily?.stage === 'renewal' ||
        req.euFamily?.stage === 'permanent-renewal') &&
      req.euFamily.priorCardIssued !== false &&
      !req.euFamily.priorCardExpiry &&
      currentCardExpiresOn
    )
      return {
        ...req,
        euFamily: { ...req.euFamily, priorCardExpiry: currentCardExpiresOn },
      };
    return currentCardExpiresOn === req.currentCardExpiresOn
      ? req
      : { ...req, currentCardExpiresOn };
  };
}

export function evaluateGreeceFull(req: GrFullRequest): CountryResult {
  const requestFor = renewalCardRequest(req);
  const c = grContext(req.locale);
  const ids = req.pathways ?? (Object.keys(titles) as GrFullPathwayId[]);
  const required = ids
    .map((id) => timeRoute(id, req))
    .filter((id) => id !== undefined);
  const times = pilotTimes(req, required, c);
  const pathways: CountryPathway[] = ids.map((id) => {
    const nationality = id === 'GR-NATIONALITY';
    const inScope =
      req.citizenship === undefined
        ? undefined
        : nationality
          ? req.citizenship !== 'greek'
          : req.citizenship === 'third-country' ||
            req.citizenship === 'stateless';
    const scope = c.check(
      'GR-APPLICANT',
      '申请人国籍类别',
      'Applicant citizenship category',
      inScope,
      nationality
        ? [grSource('F34', 'ΚΕΙ art. 5(1)')]
        : [grSource('F16', 'arts. 3–4'), grSource('F02', 'arts. 13(2), 17')],
      nationality
        ? '此处核对尚未取得希腊国籍者的归化。'
        : '本路径受理第三国公民或符合条件的无国籍申请人。',
      nationality
        ? 'Naturalisation applies to people who do not already hold Greek citizenship.'
        : 'This permit route covers third-country nationals and eligible stateless applicants.',
    );
    if (inScope === false)
      return {
        id,
        title: c.L(titles[id][0], titles[id][1]),
        status: 'NOT_APPLICABLE',
        checks: [scope],
        assumptions: [],
      };
    if (
      req.simulationDate < policy.values.migrationCodeFrom.value &&
      !nationality &&
      id !== 'GR-EU-FAMILY-PR'
    ) {
      const version = c.check(
        'GR-LAW-DATE',
        '模拟日适用的移民法版本',
        'Migration law on the simulation date',
        undefined,
        policy.values.migrationCodeFrom.sources,
        '此模拟日早于本规则集覆盖的移民法典，须按当时有效的规定核实。',
        'This date predates the Migration Code covered here. Verify the provisions in force at that time.',
        ['PD-300'],
      );
      return {
        id,
        title: c.L(titles[id][0], titles[id][1]),
        status: 'UNKNOWN',
        checks: [scope, version],
        assumptions: [],
        pendingDetails: ['PD-300'],
      };
    }
    const { filing, on, waitsFromReview } = filingUnderApplicableLaw(
      id,
      requestFor(id),
      scope,
      times,
    );
    const { checks, time } = filing;
    const projected = on > req.simulationDate;
    const status =
      filing.status === 'MET' && projected ? 'FUTURE' : filing.status;
    let summary: string | undefined;
    if (projected) {
      summary = c.L(
        `已按候选递件日 ${on} 核对时间与申请资格。`,
        `Timing and eligibility were assessed on the candidate filing date, ${on}.`,
      );
      for (const check of checks) {
        if (check.status !== 'MET') {
          check.explanation = summary + ' ' + check.explanation;
          continue;
        }
        const date = waitsFromReview.get(check.id);
        if (!date) continue;
        check.status = 'NOT_MET';
        if (check.id === id + '-TIME')
          check.explanation = c.L(
            `按递件时适用的规定，时间条件于 ${date} 满足。`,
            `The timing requirement is met on ${date} under the law in force on filing.`,
          );
        else if (!check.explanation.includes(date))
          check.explanation += c.L(
            ` 最早日期为 ${date}。`,
            ` Earliest date: ${date}.`,
          );
      }
    }
    return {
      id,
      title: c.L(titles[id][0], titles[id][1]),
      status,
      checks,
      earliestDate:
        status === 'FUTURE'
          ? on
          : status === 'MET'
            ? time?.earliestDate
            : undefined,
      assumptions: time?.assumptions ?? [],
      ...(summary ? { summary } : {}),
      pendingDetails: [
        ...new Set([
          ...(time?.pendingDetails ?? []),
          ...checks.flatMap((check) => check.pendingDetails ?? []),
        ]),
      ],
    };
  });
  return {
    policyAsOf: policy.asOf,
    columns: [
      {
        id: policy.ruleSetId,
        title: c.L('希腊现行法律', 'Current Greek law'),
        pathways,
      },
    ],
  };
}
