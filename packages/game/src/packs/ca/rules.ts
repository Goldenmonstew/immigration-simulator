import {
  evaluateCanadaFull,
  type CaFullPathwayId,
  type CaFullRequest,
  type CaFullResult,
  type Locale,
} from '@uk-immigration/engine';
import { canadaFull2026_11 } from '@uk-immigration/policy-data';
import { addDays, addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';
import { caBalance as b } from './balance';

type Answers = Omit<CaFullRequest, 'simulationDate' | 'locale'>;
type Atlantic = NonNullable<CaFullRequest['atlantic']>;
type WorkPeriod = NonNullable<Atlantic['workHistory']>[number];

/**
 * The questionnaire answers, plus the game's own facts about the character.
 * `caRequest` drops the game fields before the engine sees the timeline.
 */
export type CaTimeline = Answers & {
  /** The first route (residency obligation or initial PR), then citizenship. */
  goals: [CaFullPathwayId, 'CA-CITIZENSHIP'];
  /** First arrival in Canada; the progress bars start here. */
  arrived: IsoDate;
  /** The document the top bar counts down: a PR card or a work permit. */
  document: { kind: 'pr-card' | 'work-permit'; expires: IsoDate };
  /** Annual pay before tax, a fictional individual fact. */
  annualIncome: number;
  /** The current job, recorded as work experience up to the day before. */
  job?: Omit<WorkPeriod, 'to'>;
  /**
   * The day the player signed for citizenship, took the oath or filed the
   * Atlantic application. Each joins the answers from that day (caRequest), so
   * the quarter's assessment, made on its first day, takes it next quarter.
   */
  filed?: { citizenship?: IsoDate; oath?: IsoDate; aip?: IsoDate };
  /** The day the story ended in town; the last assessment is made then. */
  endedOn?: IsoDate;
};
export type CaFestival =
  'heritage-day' | 'victoria-day' | 'canada-day' | 'thanksgiving';
export type CaState = GameState<CaTimeline, CaFullResult, CaFestival>;
/** Progress columns: the character's PR route, then citizenship. */
export type CaColumn = 'pr' | 'cit';
type CaPathway = CaFullResult['columns'][number]['pathways'][number];
export type CaOutcome = CaPathway['status'];

export type CaEffect =
  /** File last year's income tax return. */
  | { type: 'taxReturn' }
  /** An approved English test, at the level the Atlantic offer needs. */
  | { type: 'languageTest' }
  | { type: 'jobOffer' }
  | { type: 'settlementPlan' }
  | { type: 'endorsement' }
  | { type: 'policeCertificate' }
  /** Sign and pay for the citizenship application. */
  | { type: 'signCitizenship' }
  | { type: 'citizenshipTest'; passed: boolean }
  | { type: 'oath' }
  /** File the Atlantic PR application with its fees. */
  | { type: 'fileAip' };

const values = canadaFull2026_11.values;
const fees = values.federalFees.value;
const aip = values.atlanticWork.value;

/** Federal fees for one adult filing alone: processing, right of PR, biometrics. */
export const aipFee = fees.economicAdult + fees.right + fees.biometric;
/** Adult citizenship fees: processing plus the right of citizenship fee. */
export const citizenshipFee =
  values.citAdultProcessingFee.value + values.citRightFee.value;

const gameFields = [
  'goals',
  'arrived',
  'document',
  'annualIncome',
  'job',
  'filed',
  'endedOn',
];

/**
 * The engine request for this timeline on a date, without the locale. What
 * the player did on a later day (a CELPIP result, a signing, an oath or a
 * filing) is left out, so the game and its result page link read the same
 * answers.
 */
export function caRequest(
  timeline: CaTimeline,
  date: IsoDate,
): Omit<CaFullRequest, 'locale'> {
  const answers = Object.fromEntries(
    Object.entries(timeline).filter(([key]) => !gameFields.includes(key)),
  ) as Answers;
  const { job, filed = {} } = timeline;
  const by = (day?: IsoDate): day is IsoDate => !!day && day <= date;
  const request: Omit<CaFullRequest, 'locale'> = {
    ...answers,
    simulationDate: date,
  };
  if (answers.atlantic) {
    const { language, ...atlantic } = answers.atlantic;
    request.atlantic = {
      ...atlantic,
      ...(by(language?.resultDate) && { language }),
      ...(job && { workHistory: [{ ...job, to: addDays(date, -1) }] }),
      ...(by(filed.aip) && { applicationDate: filed.aip }),
    };
  }
  if (by(filed.citizenship))
    request.residence = {
      ...request.residence,
      signingDate: filed.citizenship,
      citizenshipFeesPaid: true,
    };
  if (by(filed.oath))
    request.residence = {
      ...request.residence,
      oath: 'taken',
      grantDate: filed.oath,
      stillEligibleAtGrant: true,
    };
  if (by(filed.aip))
    request.federal = {
      ...request.federal,
      // The game gives biometrics at the service centre with the filing.
      principal: {
        ...request.federal?.principal,
        biometrics: 'provided-for-pr',
      },
      applications: {
        'CA-AIP': {
          filedOn: filed.aip,
          signed: true,
          allFamilyDeclared: true,
          changesReported: true,
          validIdentityAndTravelDocuments: true,
          applicationEvidenceComplete: true,
          processingFeesPaid: true,
          paymentOn: filed.aip,
          biometricPayers: 1,
          amountPaidIncludingBiometrics: aipFee,
        },
      },
    };
  return request;
}

const evaluate = (timeline: CaTimeline, date: IsoDate, locale: Locale) =>
  evaluateCanadaFull({ ...caRequest(timeline, date), locale });
/** The quarter's first day, or the day a story ended in town. */
export const assessedOn = (state: { date: IsoDate; timeline: CaTimeline }) =>
  state.timeline.endedOn ?? state.date;

export const pathwayOf = (
  result: CaFullResult,
  id: CaFullPathwayId,
): CaPathway | undefined =>
  result.columns[0]?.pathways.find((pathway) => pathway.id === id);
export const columnPathway = (timeline: CaTimeline, column: CaColumn) =>
  column === 'pr' ? timeline.goals[0] : timeline.goals[1];

const filing = (timeline: CaTimeline) =>
  timeline.goals[0] === 'CA-AIP' ? 'aip' : 'citizenship';

/** The timeline as if the application were filed (or signed) today. */
export function filedToday(state: CaState): CaTimeline {
  return {
    ...state.timeline,
    filed: {
      ...state.timeline.filed,
      [filing(state.timeline)]: state.day.date,
    },
  };
}

/**
 * Steps IRCC schedules after receipt: the citizenship test (SRC-263) and,
 * for Atlantic applicants, the medical exam on instruction (SRC-266).
 */
const afterFiling: Record<string, string> = {
  'CA-CITIZENSHIP': 'CA-R11',
  'CA-AIP': 'CA-R24',
};
/**
 * The character's route if filed (or signed) today, assessed on the day, so
 * day counts and document validity are checked for that day.
 */
export function filingToday(state: CaState, locale: Locale = state.locale) {
  return pathwayOf(
    evaluate(filedToday(state), state.day.date, locale),
    filing(state.timeline) === 'aip' ? 'CA-AIP' : 'CA-CITIZENSHIP',
  );
}
/** Whether every requirement except the post-filing step is met if filed today. */
export function readyToFile(state: CaState, locale: Locale = state.locale) {
  const pathway = filingToday(state, locale);
  return !!pathway?.checks.every(
    (check) =>
      check.advisory ||
      check.status === 'MET' ||
      check.id === afterFiling[pathway.id],
  );
}

/** The level each language skill needs for the offered job (SRC-270). */
export function offerLanguageLevel(teer: number) {
  return teer <= values.eeWork.value.skilledTeerMax
    ? aip.higherLanguage
    : aip.otherLanguage;
}

/** Months to the end of the status document, rounded down. */
function visaMonthsLeft(state: CaState): number {
  const to = state.timeline.document.expires;
  if (to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

function progress(state: CaState): Progress<CaColumn, CaOutcome> {
  const start = Date.parse(state.timeline.arrived);
  const entry = (column: CaColumn) => {
    const pathway = pathwayOf(
      state.result,
      columnPathway(state.timeline, column),
    );
    if (!pathway) return { outcome: 'UNKNOWN' as const, percent: 0 };
    if (pathway.status === 'MET')
      return { outcome: 'MET' as const, percent: 100 };
    // The physical presence clock, before other requirements (SRC-074
    // s.5(1)(c), SRC-075 s.28): the bar shows time; the label the route.
    const time = pathway.checks.find(
      (check) => check.timeBaseline,
    )?.timeBaseline;
    if (time?.status === 'FUTURE' && time.earliestDate) {
      const target = Date.parse(time.earliestDate);
      const elapsed = (Date.parse(state.date) - start) / (target - start);
      return {
        outcome: 'FUTURE' as const,
        earliestDate: time.earliestDate,
        percent: Math.round(Math.max(0, Math.min(100, elapsed * 100))),
      };
    }
    if (time)
      return {
        outcome: pathway.status,
        percent: time.status === 'MET' ? 100 : 0,
      };
    // Initial PR has no clock: count the requirements already met.
    const required = pathway.checks.filter((check) => !check.advisory);
    const met = required.filter((check) => check.status === 'MET').length;
    return {
      outcome: pathway.status,
      percent:
        pathway.status === 'NOT_MET' || pathway.status === 'NOT_APPLICABLE'
          ? 0
          : Math.round((met / required.length) * 100),
    };
  };
  return { pr: entry('pr'), cit: entry('cit') };
}

export const caRules: EvaluationAdapter<
  CaTimeline,
  CaFullResult,
  CaEffect,
  CaColumn,
  CaOutcome,
  CaFestival
> = {
  evaluate: (state) =>
    evaluate(state.timeline, assessedOn(state), state.locale),
  progress,
  route: (state) => state.timeline.goals[0],
  visaMonthsLeft,
  // A trip must end before the PR card or work permit does.
  canTravel: (state, through) => through <= state.timeline.document.expires,
  recordAbsence(state, trip) {
    state.timeline.trips = [
      ...(state.timeline.trips ?? []),
      { departed: trip.from, returned: trip.to },
    ];
  },
  earnings: (state) => state.timeline.annualIncome,
  promote(state, multiplier) {
    state.timeline.annualIncome = Math.round(
      state.timeline.annualIncome * multiplier,
    );
    return true;
  },
  // A PR card's expiry does not end PR status; a work permit's does. The
  // ending's assessment must show the lapse: the work stops with the permit,
  // the funds exemption goes with it (SRC-270 aip-funds), and whether the
  // overstay is noncompliance is for an officer (SRC-261 IRPA ss.39–42).
  expired(state) {
    const { document, job, atlantic } = state.timeline;
    if (document.kind !== 'work-permit' || document.expires >= state.date)
      return false;
    if (atlantic)
      Object.assign(atlantic, {
        workingInCanada: false,
        fundsExemptionAuthorization: false,
        ...(job && { workHistory: [{ ...job, to: document.expires }] }),
      });
    delete state.timeline.job;
    (state.timeline.federal ??= {}).protectionAndCompliance = 'under-review';
    return true;
  },
  applyEffect(state, effect, { setFlags }) {
    const date = state.date;
    const residence = (state.timeline.residence ??= {});
    const atlantic = (state.timeline.atlantic ??= {});
    const principal = ((state.timeline.federal ??= {}).principal ??= {});
    switch (effect.type) {
      case 'taxReturn':
        residence.taxYears = {
          ...residence.taxYears,
          [Number(date.slice(0, 4)) - 1]: 'filed',
        };
        setFlags(state, ['quarter-tax-filed']);
        return true;
      case 'languageTest': {
        const level = offerLanguageLevel(
          atlantic.offer?.teer ?? state.timeline.job!.teer,
        );
        atlantic.language = {
          test: 'CELPIP-General',
          resultDate: state.day.date,
          levels: {
            listening: level,
            speaking: level,
            reading: level,
            writing: level,
          },
        };
        setFlags(state, ['language-tested', 'quarter-exam-passed']);
        return true;
      }
      case 'jobOffer':
        atlantic.offer = {
          noc: state.timeline.job?.noc,
          teer: state.timeline.job?.teer,
          hoursPerWeek: 40,
          permanent: true,
          continuousPaidNonseasonal: true,
          eligibleNamedEmployer: true,
          applicantAndPartnerOwnershipPercent: 0,
          ableAndLikelyToAccept: true,
          genuine: true,
        };
        setFlags(state, ['job-offer']);
        return true;
      case 'settlementPlan':
        atlantic.settlementPlanGivenToEmployer = true;
        setFlags(state, ['settlement-plan']);
        return true;
      case 'endorsement':
        atlantic.endorsement = {
          province: 'NS',
          issued: date,
          expires: addMonths(date, b.endorsementMonths),
          revoked: false,
        };
        state.flags = state.flags.filter(
          (flag) => flag !== 'endorsement-requested',
        );
        return true;
      case 'policeCertificate':
        principal.foreignStays = (principal.foreignStays ?? []).map((stay) => ({
          ...stay,
          certificateIssued: date,
        }));
        setFlags(state, ['police-certificate']);
        return true;
      case 'signCitizenship':
        state.timeline.filed = filedToday(state).filed;
        setFlags(state, ['cit-applied', 'quarter-cit-applied']);
        return true;
      case 'citizenshipTest':
        residence.test = { outcome: effect.passed ? 'passed' : 'retry' };
        if (effect.passed)
          setFlags(state, ['cit-test-passed', 'quarter-cit-test-passed']);
        return true;
      case 'oath':
        state.timeline.filed = {
          ...state.timeline.filed,
          oath: state.day.date,
        };
        return true;
      case 'fileAip':
        state.timeline.filed = filedToday(state).filed;
        return true;
    }
  },
};
