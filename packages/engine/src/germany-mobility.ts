import {
  germany2026_11,
  germanyFull2026_11,
} from '@uk-immigration/policy-data';
import type { CefrLevel } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addDays, addMonths, addYears } from './dates';
import type { DePermitKind } from './germany';
import type { DeFullRequest } from './germany-full';
import { all, any, check, src } from './germany-full-shared';
import { afterYears } from './pilot';
import type { IsoDate } from './types';

type Answer = boolean | undefined;
const v = germanyFull2026_11.values;
const pilot = germany2026_11.values;
const languageOrder = ['below-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const atLeast = (n: number | undefined, limit: number): Answer =>
  n === undefined ? undefined : n >= limit;
const negate = (a: Answer): Answer => (a === undefined ? undefined : !a);

interface EmploymentPeriod {
  /** Calendar months actually credited through the decision date (YYYY-MM, inclusive). */
  firstMonth: string;
  lastMonth: string;
  countableAnnualGross?: number;
  payBand?: 'standard' | 'reduced';
  /** Recognised § 18g job for this band, including prior visa/other title where accepted. */
  qualifyingWork?: boolean;
  pensionForSameMonths?: boolean;
  /** Authority accepted a historical pay shortfall or the old-law pay test. */
  historicalPayAccepted?: boolean;
  /** Pay components, short-time work or parental leave await a historical determination. */
  historicalPayReviewPending?: boolean;
}

interface BlueCard {
  fastTrack?: boolean;
  language?: CefrLevel | 'below-A1';
  languageWaiverAcceptedForTier?: boolean;
  languageWaiverPendingForTier?: boolean;
  /** Authority's treatment of months before an interruption in the history. */
  creditBeforeInterruption?: boolean;
  cardHeldAtDecision?: boolean;
  /** Complete history; overlapping months are counted once. */
  employment?: EmploymentPeriod[];
  countableAnnualGross?: number;
  contractMonths?: number;
  jobInGermanyMatchesQualification?: boolean;
  requiredLicencesHeld?: boolean;
  genuineEmployment?: boolean;
  /** No ground in § 19f(1) or (2), including posted workers and pending protection. */
  noExclusionUnder19f?: boolean;
  qualification?: 'academic' | 'equivalent-tertiary' | 'none';
  recognisedQualification?: boolean;
  tertiaryProgrammeYears?: number;
  tertiaryLevel?: number;
  isco?: string;
  degreeOn?: IsoDate;
  applicationOn?: IsoDate;
  /** A renewal of a reduced-band card first issued to a recent graduate. */
  firstGraduateCardOn?: IsoDate;
  renewal?: boolean;
  employmentAgencyApproved?: boolean;
  /** Years in an eligible IT occupation within the statutory lookback, at degree level. */
  relevantItYearsInLookback?: number;
  itExperienceNeededForJob?: boolean;
  employmentStartedOn?: IsoDate;
  latestRelevantChangeOn?: IsoDate;
  changeReported?: boolean;
  jobChangeDecision?: 'clear' | 'suspended' | 'rejected';
}

interface FreedomPeriod {
  from: IsoDate;
  to?: IsoDate;
  basis?:
    | 'work'
    | 'self-employment'
    | 'services'
    | 'seeking-work'
    | 'inactive'
    | 'family'
    | 'retained'
    | 'none';
  /** While looking for work beyond the initial period. */
  seekingWithGenuineProspects?: boolean;
  /** The actual date of starting the job search, if earlier than this period. */
  searchSince?: IsoDate;
  resourcesAndInsurance?: boolean;
  /** Includes the sponsor's lawful status and living together where required. */
  familyRightConfirmed?: boolean;
  retainedPersonalRightConfirmed?: boolean;
}

interface EarlyFreedom {
  basis:
    | 'none'
    | 'retirement'
    | 'disability'
    | 'frontier'
    | 'bereaved'
    | 'family-of-worker';
  /** At cessation of work / death; applies to the relevant worker before that event. */
  qualifyingWorker?: boolean;
  continuousResidenceYearsAtEvent?: number;
  finalMonthsWorked?: number;
  ageAtRetirement?: number;
  retiredUnderEarlyScheme?: boolean;
  ceasedBecauseFullyIncapacitated?: boolean;
  occupationalInjuryWithGermanPension?: boolean;
  /** German spouse/partner or the applicable historical loss of German nationality. */
  spouseNationalityException?: boolean;
  continuousGermanWorkYears?: number;
  worksInOtherMemberState?: boolean;
  retainsGermanHome?: boolean;
  returnsWeekly?: boolean;
  familyWasResidentWithWorker?: boolean;
  occupationalDeath?: boolean;
  survivingPartnerNationalityException?: boolean;
  workerAcquiredEarlyRight?: boolean;
}

interface FreeMovement {
  /** Applicant is an EU/EEA citizen, eligible family/close person, or a retained-right holder. */
  withinPersonalScope?: boolean;
  permanentRightPreviouslyAcquired?: boolean;
  /** Complete period history, including periods retained following job/family changes. */
  periods?: FreedomPeriod[];
  /** § 4a(6) for the claimed period. Totals are per residence year. */
  annualOrdinaryAbsenceMonths?: number[];
  importantAbsences?: { months: number; reasonAccepted?: boolean }[];
  early?: EarlyFreedom;
  /** Since the most recent acquisition, including any still-open absence. */
  subsequentTrips?: {
    departed: IsoDate;
    returned?: IsoDate;
    nonTemporary?: boolean;
  }[];
  lossDecision?: 'clear' | 'pending' | 'lost';
}

type TitleKind = DePermitKind | 'blue-card-family' | 'ict' | 'visa';
interface TitleTrip {
  departed: IsoDate;
  returned?: IsoDate;
  nonTemporary?: boolean;
  /** null means the ordinary deadline applies. */
  approvedReturnBy?: IsoDate | null;
  /** Report the applicable exception or explicitly select none. */
  exception?:
    | 'none'
    | 'eu-mobility'
    | 'military'
    | 'forced-marriage'
    | 'refugee-document';
  militaryDischargedOn?: IsoDate;
  coercionEndedOn?: IsoDate;
  qualifiesUnder37?: boolean;
  /** All uninterrupted periods outside the territory granting long-term resident status. */
  outsideArea?: { from: IsoDate; to?: IsoDate }[];
}

interface TitleReview {
  /** One record per present document, including independent concurrent permanent titles. */
  kind: TitleKind;
  /** No applicable termination event other than absence or expiry; for § 9a only § 51(9). */
  noOtherLossEvent?: boolean;
  /** null means the validity term is known to cover the simulation date. */
  validTo?: IsoDate | null;
  /** An in-time application is still effective on the simulation date. */
  continuingUnder81?: boolean;
  trips?: TitleTrip[];
  /** Applicant's lawful years, or their cohabiting spouse's qualifying 15-year history. */
  lawfulYears?: number;
  spouseHasQualifyingLongResidence?: boolean;
  ageOnDeparture?: number;
  germanSpouseLivingTogether?: boolean;
  livelihoodSecured?: boolean;
  noListedExpulsionInterest?: boolean;
  priorBlueCardOrQualifyingFamilyTitle?: boolean;
  multipleEntryVisa?: boolean;
  visaDurationDays?: number;
}

export interface DeMobilityAnswers {
  blueCard?: BlueCard;
  freedom?: FreeMovement;
  titles?: TitleReview[];
}

function salaryMeets(
  year: string,
  gross: number | undefined,
  band: 'standard' | 'reduced',
): Answer {
  const pay: Record<string, number> =
    band === 'standard'
      ? v.blueCardStandardPay.value
      : v.blueCardReducedPay.value;
  return pay[year] === undefined ? undefined : atLeast(gross, pay[year]);
}

function employmentMonths(req: DeFullRequest) {
  const history = req.mobility?.blueCard?.employment;
  if (!history) {
    return {
      confirmed: req.blueCardEmploymentMonths,
      possible: req.blueCardEmploymentMonths,
    };
  }
  const months = new Map<string, Answer>();
  const simulationMonth = req.simulationDate.slice(0, 7);
  for (const period of history) {
    for (
      let month = period.firstMonth;
      month <= period.lastMonth && month <= simulationMonth;
    ) {
      const pay = period.payBand
        ? salaryMeets(
            month.slice(0, 4),
            period.countableAnnualGross,
            period.payBand,
          )
        : undefined;
      const paidEnough =
        period.historicalPayAccepted === true
          ? true
          : period.historicalPayReviewPending
            ? undefined
            : pay;
      const credited = all(
        period.qualifyingWork,
        period.pensionForSameMonths,
        paidEnough,
      );
      months.set(
        month,
        months.has(month) ? any(months.get(month), credited) : credited,
      );
      month = addMonths(month + '-01', 1).slice(0, 7);
    }
  }
  const ordered = [...months.keys()].sort();
  let latestStart = 0;
  for (let i = 1; i < ordered.length; i++) {
    const next = addMonths(ordered[i - 1] + '-01', 1).slice(0, 7);
    if (ordered[i] !== next) latestStart = i;
  }
  const beforeGap = req.mobility?.blueCard?.creditBeforeInterruption;
  const confirmed = (
    beforeGap === true ? ordered : ordered.slice(latestStart)
  ).filter((m) => months.get(m) === true).length;
  const possible = (
    beforeGap === false ? ordered.slice(latestStart) : ordered
  ).filter((m) => months.get(m) !== false).length;
  return { confirmed, possible };
}

function blueLanguage(req: DeFullRequest): string | undefined {
  const explicit = req.mobility?.blueCard?.language ?? req.common?.provenGerman;
  if (explicit) return explicit === 'none' ? 'below-A1' : explicit;
  return req.common?.integrationCoursePassed || req.germanB1
    ? v.blueCardLanguage.value[1]
    : undefined;
}

function blueTier(req: DeFullRequest): Answer {
  const selected = req.mobility?.blueCard?.fastTrack;
  if (selected !== undefined) return selected;
  const level = blueLanguage(req);
  return level
    ? languageOrder.indexOf(level) >=
        languageOrder.indexOf(v.blueCardLanguage.value[1])
    : req.germanB1;
}

export function blueCardTimeInputs(req: DeFullRequest) {
  const months = employmentMonths(req);
  return {
    germanB1: blueTier(req),
    blueCardEmploymentMonths:
      months.confirmed === months.possible ? months.confirmed : undefined,
  };
}

function blueCardChecks(req: DeFullRequest): CountryCheck[] {
  const b = req.mobility?.blueCard ?? {};
  const p = v.blueCardJob.value;
  const fast = blueTier(req);
  const threshold = fast ? pilot.blueCardB1Months : pilot.blueCardMonths;
  const level = v.blueCardLanguage.value[fast ? 1 : 0];
  const evidence = blueLanguage(req);
  const language = evidence
    ? languageOrder.indexOf(evidence) >= languageOrder.indexOf(level)
    : undefined;
  const months = employmentMonths(req);
  // When the language tier is unknown, 21–26 months could already suffice.
  const possibleThreshold =
    fast === undefined ? pilot.blueCardB1Months.value : threshold.value;
  const requiredMonths =
    fast === undefined
      ? `${possibleThreshold}–${threshold.value}`
      : String(threshold.value);
  const enoughMonths =
    atLeast(months.confirmed, threshold.value) === true
      ? true
      : atLeast(months.possible, possibleThreshold) === false
        ? false
        : undefined;
  const year = req.simulationDate.slice(0, 4);
  const shortage =
    b.isco === undefined
      ? undefined
      : v.blueCardShortageGroups.value.some((code) => b.isco!.startsWith(code));
  const it =
    b.isco === undefined
      ? undefined
      : v.blueCardItGroups.value.some((code) => b.isco!.startsWith(code));
  const recentGraduate =
    b.degreeOn && b.applicationOn
      ? b.applicationOn >= b.degreeOn &&
        b.applicationOn <= afterYears(b.degreeOn, p.recentDegreeYears)
      : undefined;
  const graduateRenewal = all(
    b.renewal,
    b.applicationOn && b.firstGraduateCardOn
      ? b.applicationOn >= b.firstGraduateCardOn &&
          b.applicationOn < addMonths(b.firstGraduateCardOn, p.renewalMonths)
      : undefined,
  );
  const academic = all(
    b.recognisedQualification,
    b.qualification === undefined
      ? undefined
      : b.qualification === 'academic'
        ? true
        : b.qualification === 'equivalent-tertiary'
          ? all(
              atLeast(b.tertiaryProgrammeYears, p.tertiaryYears),
              atLeast(b.tertiaryLevel, p.tertiaryLevel),
            )
          : false,
  );
  const itExperience = all(
    it,
    atLeast(b.relevantItYearsInLookback, p.experienceYears),
    b.itExperienceNeededForJob,
  );
  const standard = all(
    academic,
    salaryMeets(year, b.countableAnnualGross, 'standard'),
  );
  const reduced = all(
    b.employmentAgencyApproved,
    salaryMeets(year, b.countableAnnualGross, 'reduced'),
    any(
      itExperience,
      all(academic, any(shortage, recentGraduate, graduateRenewal)),
    ),
  );
  const activePermit = req.permits
    ?.filter((p) => p.from <= req.simulationDate)
    .sort((a, b) => b.from.localeCompare(a.from))[0];
  const recordedCard =
    activePermit?.kind === 'blue-card'
      ? !activePermit.to || activePermit.to >= req.simulationDate
        ? true
        : activePermit.renewing
          ? undefined
          : false
      : req.permits
        ? false
        : undefined;
  const card = req.mobility?.titles
    ? retainedTitle(req, 'blue-card')
    : (b.cardHeldAtDecision ??
      recordedCard ??
      (req.citizenship?.currentTitle === 'blue-card' ? true : undefined));
  const currentJob = all(
    b.jobInGermanyMatchesQualification,
    b.genuineEmployment,
    b.requiredLicencesHeld,
    b.noExclusionUnder19f,
    atLeast(b.contractMonths, p.minimumContractMonths),
    b.jobChangeDecision === 'clear'
      ? true
      : b.jobChangeDecision === 'rejected'
        ? false
        : undefined,
  );
  const inReportingPeriod =
    b.latestRelevantChangeOn &&
    b.employmentStartedOn &&
    b.latestRelevantChangeOn >= b.employmentStartedOn &&
    b.latestRelevantChangeOn <= req.simulationDate &&
    b.latestRelevantChangeOn <
      addMonths(b.employmentStartedOn, p.jobChangeMonths);
  const changeNote: [string, string] = inReportingPeriod
    ? [
        `首次就业的前 ${p.jobChangeMonths} 个月内发生变更，通报状态：${b.changeReported === true ? '已报' : b.changeReported === false ? '未报' : '未知'}。须另核岗位及机关决定。`,
        `The change falls within the first ${p.jobChangeMonths} months. Notification: ${b.changeReported === true ? 'reported' : b.changeReported === false ? 'not reported' : 'unknown'}. Check the job and the authority’s decision separately.`,
      ]
    : [
        `核实工作、职业许可与当前状态。首 ${p.jobChangeMonths} 个月换岗可被暂停 ${p.suspensionDays} 天。`,
        `Check the job, licence and current decision. During the first ${p.jobChangeMonths} months a job change can be suspended for ${p.suspensionDays} days.`,
      ];
  const c = req.locale;
  return [
    check(
      c,
      'DE-C19',
      '决定日仍持有效蓝卡',
      'A current EU Blue Card at decision',
      card,
      [src(100, '§ 18c Abs. 2 Satz 1'), src(107, 'Nr. 18c.2.1.1, p117')],
      'PD-353',
    ),
    check(
      c,
      'DE-C19-months',
      '合格就业与同期养老缴费月数',
      'Qualifying employment months with matching pension contributions',
      enoughMonths,
      [
        ...threshold.sources,
        ...pilot.blueCardB1Months.sources,
        src(431, 'Voraussetzungen – Beschäftigung'),
        src(107, 'Nr. 18c.2.1.2–3, pp117–118'),
        ...v.blueCardReducedPay.sources,
      ],
      'PD-123 / PD-350',
      [
        `与德语档对应的期限为 ${requiredMonths} 月，已确认 ${months.confirmed ?? '未知'} 月，计入待核月份后至多 ${months.possible ?? '未知'} 月。`,
        `The language-dependent period is ${requiredMonths} months. Confirmed: ${months.confirmed ?? 'unknown'}. Including unresolved months: ${months.possible ?? 'unknown'}.`,
      ],
    ),
    check(
      c,
      'DE-C20',
      '蓝卡定居档对应的德语证明',
      'German evidence for the selected Blue Card tier',
      any(
        language,
        b.languageWaiverAcceptedForTier === true,
        b.languageWaiverPendingForTier ? undefined : false,
      ),
      v.blueCardLanguage.sources,
      'PD-347',
      [
        `核实 ${level} 或本档获准的豁免。`,
        `Evidence of ${level} or an accepted waiver for this tier is required.`,
      ],
    ),
    check(
      c,
      'DE-C21-job',
      '当前岗位、合同期限、职业许可与签发排除',
      'Current job, contract term, professional licence and exclusions',
      currentJob,
      [
        src(100, '§§ 18 Abs. 2, 18g Abs. 1–4, 19f Abs. 1–2, 82 Abs. 1'),
        src(107, 'Nr. 18c.2.1.1–2, pp117–118'),
      ],
      'PD-346',
      changeNote,
    ),
    check(
      c,
      'DE-C21-pay',
      '按决定年份核定工资、资格与低档批准',
      'Pay, qualifications and lower-band approval in the decision year',
      any(standard, reduced),
      [
        ...v.blueCardStandardPay.sources,
        ...v.blueCardReducedPay.sources,
        ...v.blueCardJob.sources,
      ],
      'PD-350',
    ),
  ];
}

function earlyFreedom(e: EarlyFreedom | undefined): Answer {
  if (!e) return undefined;
  const p = v.freeMovementPeriods.value;
  switch (e.basis) {
    case 'none':
      return false;
    case 'retirement':
      return all(
        e.qualifyingWorker,
        any(
          atLeast(e.ageAtRetirement, p.retirementAge),
          e.retiredUnderEarlyScheme,
        ),
        any(
          e.spouseNationalityException,
          all(
            atLeast(
              e.continuousResidenceYearsAtEvent,
              p.retirementResidenceYears,
            ),
            atLeast(e.finalMonthsWorked, p.retirementWorkMonths),
          ),
        ),
      );
    case 'disability':
      return all(
        e.qualifyingWorker,
        e.ceasedBecauseFullyIncapacitated,
        any(
          e.spouseNationalityException,
          e.occupationalInjuryWithGermanPension,
          atLeast(
            e.continuousResidenceYearsAtEvent,
            p.disabilityResidenceYears,
          ),
        ),
      );
    case 'frontier':
      return all(
        e.qualifyingWorker,
        atLeast(e.continuousGermanWorkYears, p.frontierWorkYears),
        e.worksInOtherMemberState,
        e.retainsGermanHome,
        e.returnsWeekly,
      );
    case 'bereaved':
      return all(
        e.qualifyingWorker,
        e.familyWasResidentWithWorker,
        any(
          e.occupationalDeath,
          e.survivingPartnerNationalityException,
          atLeast(
            e.continuousResidenceYearsAtEvent,
            p.bereavementResidenceYears,
          ),
        ),
      );
    case 'family-of-worker':
      return all(e.familyWasResidentWithWorker, e.workerAcquiredEarlyRight);
  }
}

function freeResidence(f: FreeMovement, sim: IsoDate): Answer {
  if (!f.periods) return undefined;
  const p = v.freeMovementPeriods.value;
  const spans: { from: IsoDate; to: IsoDate; lawful: Answer }[] = [];
  for (const period of f.periods) {
    if (period.from > sim) continue;
    const end = period.to && period.to < sim ? period.to : sim;
    let lawful: Answer;
    switch (period.basis) {
      case 'work':
      case 'self-employment':
      case 'services':
        lawful = true;
        break;
      case 'inactive':
        lawful = period.resourcesAndInsurance;
        break;
      case 'retained':
        lawful = period.retainedPersonalRightConfirmed;
        break;
      case 'family':
        lawful = period.familyRightConfirmed;
        break;
      case 'none':
        lawful = false;
        break;
      case 'seeking-work': {
        const last = addDays(
          addMonths(period.searchSince ?? period.from, p.jobseekingMonths),
          -1,
        );
        if (period.from <= last)
          spans.push({
            from: period.from,
            to: end < last ? end : last,
            lawful: true,
          });
        if (end > last)
          spans.push({
            from: period.from > last ? period.from : addDays(last, 1),
            to: end,
            lawful: period.seekingWithGenuineProspects,
          });
        continue;
      }
    }
    spans.push({ from: period.from, to: end, lawful });
  }
  spans.sort((a, b) => a.from.localeCompare(b.from));
  function hasTerm(includeUnresolved: boolean) {
    let start: IsoDate | undefined, end: IsoDate | undefined;
    for (const s of spans) {
      if (s.lawful === false || (!includeUnresolved && s.lawful !== true))
        continue;
      if (!start || !end || s.from > addDays(end, 1)) start = s.from;
      end = end && end > s.to ? end : s.to;
      if (end >= afterYears(start, p.residenceYears)) return true;
    }
    return false;
  }
  const time = hasTerm(false) ? true : hasTerm(true) ? undefined : false;
  const ordinary = f.annualOrdinaryAbsenceMonths?.every(
    (m) => m <= p.ordinaryAbsenceMonths,
  );
  // Only a single absence needing the important-reason exception may be claimed.
  const absences = f.importantAbsences;
  const special = !absences
    ? undefined
    : absences.length > 1
      ? false
      : all(
          ...absences.map((a) =>
            all(a.months <= p.importantAbsenceMonths, a.reasonAccepted),
          ),
        );
  return all(time, ordinary, special);
}

function freedomChecks(req: DeFullRequest): CountryCheck[] {
  const f = req.mobility?.freedom ?? {};
  const p = v.freeMovementPeriods.value;
  const residence = freeResidence(f, req.simulationDate);
  const early = earlyFreedom(f.early);
  const acquired = any(
    f.permanentRightPreviouslyAcquired === true,
    residence,
    early,
  );
  const subsequent = f.subsequentTrips
    ?.filter((t) => t.departed <= req.simulationDate)
    .map((t) => {
      const until =
        t.returned && t.returned < req.simulationDate
          ? t.returned
          : req.simulationDate;
      return until <= afterYears(t.departed, p.lossYears)
        ? true
        : negate(t.nonTemporary);
    });
  const retained = all(
    subsequent && all(...subsequent),
    f.lossDecision === 'lost'
      ? false
      : f.lossDecision === 'clear'
        ? true
        : undefined,
  );
  const c = req.locale;
  const details = f.permanentRightPreviouslyAcquired
    ? ([
        '已取得永久权，无需继续就业。',
        'A previously acquired permanent right does not require ongoing employment.',
      ] as const)
    : residence === true
      ? ([
          '连续合法自由流动居住达到通常期限。',
          'The ordinary continuous lawful residence period is met.',
        ] as const)
      : early === true
        ? ([
            '适用提前取得永久权的法定情形。',
            'The selected statutory ground for early acquisition is met.',
          ] as const)
        : ([
            '核对合法居留区间、每年离境，以及退休、失能、跨境就业或家属取得的事实。',
            'Check lawful periods, yearly absences and any retirement, incapacity, cross-border work or family ground.',
          ] as const);
  return [
    check(
      c,
      'DE-C43',
      '自由流动法适用身份',
      'Personal scope of EU/EEA free movement',
      any(f.permanentRightPreviouslyAcquired === true, f.withinPersonalScope),
      [src(422, '§§ 1–4, 4a Abs. 1, 5, § 12')],
      'PD-357',
    ),
    check(
      c,
      'DE-C44',
      '通常居留期限或提前取得永久权',
      'Ordinary residence period or early acquisition',
      acquired,
      [src(422, '§§ 2–4, § 4a Abs. 1–6')],
      'PD-357',
      details,
    ),
    check(
      c,
      'DE-C45',
      '取得后仍保有永久居住权',
      'Retention of the permanent right after acquisition',
      retained,
      [src(422, '§ 4a Abs. 7, § 5 Abs. 5–6, § 6 Abs. 1–5')],
      'PD-345 / PD-357',
      [
        `核实取得后的离境和失权决定。EU 公民可申请证明，非 EU 家属的永久卡须在申请后 ${p.cardIssueMonths} 个月内签发。`,
        `Check absences after acquisition and any loss decision. EU citizens can request a certificate. A non-EU family member's permanent card is issued within ${p.cardIssueMonths} months of application.`,
      ],
    ),
  ];
}

function titleTripRetained(
  t: TitleReview,
  trip: TitleTrip,
  sim: IsoDate,
): Answer {
  if (trip.departed > sim) return true;
  const returned = trip.returned && trip.returned < sim ? trip.returned : sim;
  const p = v.permanentTitleAbsence.value;
  const longResidence = any(
    atLeast(t.lawfulYears, p.longResidenceYears),
    t.spouseHasQualifyingLongResidence,
  );
  const permanent = t.kind === 'settlement' || t.kind === 'eu-long-term';
  const permanentExempt = permanent
    ? all(
        t.noListedExpulsionInterest,
        any(
          t.germanSpouseLivingTogether,
          all(longResidence, t.livelihoodSecured),
        ),
      )
    : false;
  const special = trip.exception;
  const forced =
    special === 'forced-marriage'
      ? all(
          trip.qualifiesUnder37,
          trip.coercionEndedOn
            ? returned <= addMonths(trip.coercionEndedOn, p.returnMonths)
            : undefined,
          returned <= afterYears(trip.departed, p.coercionMaximumYears),
        )
      : false;
  const military =
    special === 'military'
      ? trip.militaryDischargedOn
        ? returned <= addMonths(trip.militaryDischargedOn, p.returnMonths)
        : undefined
      : false;
  const extension =
    trip.approvedReturnBy === null
      ? false
      : trip.approvedReturnBy
        ? returned <= trip.approvedReturnBy
        : undefined;
  if (t.kind === 'eu-long-term') {
    const outsideGermany =
      returned <= addYears(trip.departed, pilot.euLapseYears.value);
    // Within the ordinary outside-area limit even an unspecified destination cannot end the title.
    const areaLimit = (months: number) => {
      if (returned <= addMonths(trip.departed, months)) return true;
      return trip.outsideArea
        ?.filter((a) => a.from <= returned)
        .every(
          (a) =>
            (a.to && a.to < returned ? a.to : returned) <=
            addMonths(a.from, months),
        );
    };
    const area = any(
      areaLimit(pilot.euLapseMonths.value),
      all(
        t.priorBlueCardOrQualifyingFamilyTitle,
        areaLimit(pilot.euLapseBlueCardMonths.value),
      ),
    );
    return any(
      all(outsideGermany, area),
      permanentExempt,
      forced,
      military,
      extension,
      special === undefined ? undefined : false,
    );
  }
  const visa =
    t.kind === 'visa'
      ? any(
          t.multipleEntryVisa,
          t.visaDurationDays === undefined
            ? undefined
            : t.visaDurationDays > p.longVisaDays,
        )
      : false;
  const mobile =
    special === 'eu-mobility' && ['study', 'research', 'ict'].includes(t.kind);
  // § 51(7) turns on recognised refugee/asylum status and a German travel
  // document, including where the person now holds a settlement permit.
  const refugee = special === 'refugee-document';
  const extendedMonths =
    t.kind === 'blue-card' || t.kind === 'blue-card-family'
      ? true
      : t.kind === 'settlement'
        ? all(longResidence, atLeast(t.ageOnDeparture, p.olderResidentAge))
        : false;
  const timely = any(
    returned <= addMonths(trip.departed, pilot.lapseMonths.value),
    all(
      extendedMonths,
      returned <= addMonths(trip.departed, pilot.blueCardLapseMonths.value),
    ),
    military,
    extension,
  );
  return any(
    visa,
    mobile,
    refugee,
    permanentExempt,
    forced,
    all(negate(trip.nonTemporary), timely),
    special === undefined ? undefined : false,
  );
}

function individualTitle(t: TitleReview, sim: IsoDate): Answer {
  const permanent = t.kind === 'settlement' || t.kind === 'eu-long-term';
  const unexpired =
    permanent || t.validTo === null
      ? true
      : any(
          t.validTo === undefined ? undefined : sim <= t.validTo,
          t.continuingUnder81,
        );
  const trips = t.trips?.map((trip) => titleTripRetained(t, trip, sim));
  return all(t.noOtherLossEvent, unexpired, trips && all(...trips));
}

export function retainedTitle(req: DeFullRequest, kind?: TitleKind): Answer {
  const titles = req.mobility?.titles;
  if (!titles) return undefined;
  return any(
    ...titles
      .filter((t) => !kind || t.kind === kind)
      .map((t) => individualTitle(t, req.simulationDate)),
  );
}

function titleChecks(req: DeFullRequest): CountryCheck[] {
  const titles = req.mobility?.titles;
  if (!titles?.length) {
    return [
      check(
        req.locale,
        'DE-C63',
        '许可和出境失效依据',
        'Title and grounds for loss during absence',
        titles ? false : undefined,
        [src(100, '§ 51 Abs. 1–4, 7, 9–10; § 81 Abs. 4')],
        'PD-353',
      ),
    ];
  }
  return titles.map((t) => {
    const permanent = t.kind === 'settlement' || t.kind === 'eu-long-term';
    const id = (permanent ? 'DE-C64-' : 'DE-C63-') + t.kind;
    const loc =
      t.kind === 'eu-long-term'
        ? '§ 51 Abs. 9 Sätze 1–2, Abs. 2–4'
        : permanent
          ? '§ 51 Abs. 1–4, 10'
          : '§ 51 Abs. 1, 1a, 3–4, 7, 10; § 81 Abs. 4';
    return check(
      req.locale,
      id,
      `该许可是否存续（${t.kind}）`,
      `Retention of the ${t.kind} title`,
      individualTitle(t, req.simulationDate),
      [src(100, loc), src(108, 'Nr. 51.1.6.6–7, pp236–237')],
      'PD-124 / PD-353',
      [
        '按这份文书的独立失效原因、出境性质、法定或获准返回期限和例外判断。',
        'Assessed against this document’s termination events, purpose of absence, return deadline and exceptions.',
      ],
    );
  });
}

export function mobilityChecks(
  route: string,
  req: DeFullRequest,
): CountryCheck[] {
  switch (route) {
    case 'R03':
      return blueCardChecks(req);
    case 'R18':
      return freedomChecks(req);
    case 'R00':
      return titleChecks(req);
    default:
      return [];
  }
}
