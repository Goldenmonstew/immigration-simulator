import {
  evaluateSpainFull,
  type CountryResult,
  type EsFullTarget,
  type EsNationalityFacts,
  type EsNationalityRoute,
  type EsPermit,
  type EsResidenceFacts,
  type EsTrip,
} from '@uk-immigration/engine';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import { addDays, addMonths, firstWeekday } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Locale, Progress } from '../../model';
import { esBalance as b } from './balance';

const values = spainFull2026_11.values;

/** The assessed answers, as the Spanish questionnaire stores them. */
export interface EsTimeline {
  targets: EsFullTarget[];
  timeRecordsComplete: boolean;
  /** Residence permits in order; the last one is the current card. */
  permits: EsPermit[];
  trips: EsTrip[];
  route: EsNationalityRoute;
  nationality: EsNationalityFacts;
  residence: EsResidenceFacts;
  /**
   * Game only: the day each step was taken in town. The questionnaire's
   * answers take the steps done by the assessment date (see filingAnswers).
   */
  steps: {
    dele?: IsoDate;
    ccse?: IsoDate;
    /** A paid CCSE sitting failed on this day: one free retake follows. */
    ccseRetakeFrom?: IsoDate;
    papers?: IsoDate;
    moves: { movedOn: IsoDate; registeredOn?: IsoDate }[];
    /** The day the application went in, which ends the story. */
    filed?: IsoDate;
  };
}
export type EsFestival = 'reis' | 'falles' | 'sant-joan' | 'nou-octubre';
export type EsState = GameState<EsTimeline, CountryResult, EsFestival>;
/** Progress columns: national long-term residence and nationality. */
export type EsColumn = 'lt' | 'nat';
export type EsOutcome =
  CountryResult['columns'][number]['pathways'][number]['status'];

export type EsEffect =
  /** An in-game DELE A2 pass, recorded as the certificate. */
  | { type: 'dele' }
  /** An in-game CCSE pass, certified on the day of the exam. */
  | { type: 'ccse' }
  /** An in-game CCSE fail. */
  | { type: 'ccse-failed' }
  /** Foreign criminal record and birth certificate, legalised and translated. */
  | { type: 'papers' }
  /** A change of address, to register again in the padrón. */
  | { type: 'moved' }
  | { type: 'padron' }
  /** The application handed in, on the day. */
  | { type: 'filed' };

const pathwayIds: Record<EsColumn, string> = {
  lt: 'ES-LONG-TERM',
  nat: 'ES-NATIONALITY',
};
export function pathwayOf(result: CountryResult, column: EsColumn) {
  return result.columns[0]?.pathways.find(
    (pathway) => pathway.id === pathwayIds[column],
  );
}

/**
 * The last day of the free CCSE retake, if the day being played falls in it:
 * a failed or missed first sitting may be retaken within
 * `nationalityCcseRetakeMonths` without a new registration (SRC-335).
 */
export function freeCcseRetake(state: EsState): IsoDate | undefined {
  const from = state.timeline.steps.ccseRetakeFrom;
  if (!from) return undefined;
  const until = addMonths(from, values.nationalityCcseRetakeMonths.value);
  return state.day.date >= from && state.day.date <= until ? until : undefined;
}

/** The current residence card: the last permit in the record. */
export const currentPermit = (state: { timeline: EsTimeline }) =>
  state.timeline.permits.at(-1)!;

/**
 * The questionnaire's answers on an assessment date: steps taken later in the
 * quarter count from the next one. The 790-026 nationality fee is paid with
 * the application (SRC-323, SRC-334), so it reads as paid only once one went
 * in, on that day.
 */
export function filingAnswers(timeline: EsTimeline, date: IsoDate) {
  const { steps, ...answers } = timeline;
  const by = (day?: IsoDate): day is IsoDate => !!day && day <= date;
  const n = answers.nationality;
  const move = steps.moves.filter(({ movedOn }) => by(movedOn)).at(-1);
  return {
    ...answers,
    nationality: {
      ...n,
      ...(by(steps.dele) && {
        deleEvidence: 'dele' as const,
        deleLevel: 'A2' as const,
      }),
      ...(by(steps.ccse) && {
        ccse: { verifiedPass: true, issued: steps.ccse },
      }),
      ...(by(steps.papers) && {
        criminalRecords: {
          ...n.criminalRecords,
          originRecordOrLawfulAlternative: true,
        },
      }),
      documents: {
        ...n.documents,
        ...(by(steps.papers) && {
          birthRecord: true,
          foreignDocumentFormalities: true,
        }),
        // The padrón shows the latest address only once it is registered.
        ...(move && !by(move.registeredOn) && { address: false }),
      },
      ...(by(steps.filed)
        ? { feePaid: true, feePaidOn: steps.filed }
        : { feePaid: false }),
    },
  };
}

/**
 * The last day to file long-term residence after the card ends (SRC-083 art.
 * 184.2); a deadline on a Saturday or Sunday moves to the Monday (SRC-090 art.
 * 30.2). The game has no local holiday calendar.
 */
export function lateFilingDeadline(to: IsoDate): IsoDate {
  let day = addMonths(to, values.longTermLateMonths.value);
  while ([0, 6].includes(new Date(`${day}T00:00:00Z`).getUTCDay()))
    day = addDays(day, 1);
  return day;
}

/** What an assessment reads: a saved game, or a new one before its first day. */
type Assessed = {
  date: IsoDate;
  timeline: EsTimeline;
  locale: Locale;
  day?: { date: IsoDate };
};

/**
 * The date the game assesses on: the day the application went in; otherwise
 * the quarter's start, unless the card ran out before the day being played,
 * so the card does not show as still in effect.
 */
export function assessmentDate(state: Omit<Assessed, 'locale'>): IsoDate {
  if (state.timeline.steps.filed) return state.timeline.steps.filed;
  const day = state.day?.date;
  return day && day > state.date && currentPermit(state).to! < day
    ? day
    : state.date;
}

const evaluate = (input: Assessed) => {
  const date = assessmentDate(input);
  return evaluateSpainFull({
    ...filingAnswers(input.timeline, date),
    simulationDate: date,
    locale: input.locale,
  });
};

/** The assessment for the day being played. */
export const currentResult = (state: EsState): CountryResult =>
  state.timeline.steps.filed || assessmentDate(state) === state.date
    ? state.result
    : evaluate(state);

/** Months to the end of the current card from the day being played. */
function visaMonthsLeft(state: EsState): number {
  const to = currentPermit(state).to;
  const today = state.day.date;
  if (!to || to < today) return 0;
  let months = 0;
  while (addMonths(today, months + 1) <= to) months++;
  return months;
}

/**
 * The first working day of play after a trip ending on `through`. The shared
 * game resumes at the first quarter start on or after the return and plays it
 * from its workday, the first Tuesday after its first week (game.ts beginDay);
 * the immigration office and the civil registry open only on workdays.
 */
function workdayAfter(state: EsState, through: IsoDate): IsoDate {
  let quarter = state.date;
  while (quarter < through) quarter = addMonths(quarter, b.monthsPerQuarter);
  return firstWeekday(addDays(quarter, 7), 2);
}

// A home visit is an ordinary, lawful trip outside the EU.
function recordAbsence(
  state: { timeline: EsTimeline },
  trip: { from: IsoDate; to: IsoDate },
) {
  const dates = { departed: trip.from, returned: trip.to };
  state.timeline.trips.push(dates);
  state.timeline.residence.tripDetails = [
    ...(state.timeline.residence.tripDetails ?? []),
    { ...dates, reason: 'ordinary', irregularExit: false, outsideEu: true },
  ];
}

function progress(state: EsState): Progress<EsColumn, EsOutcome> {
  const start = Date.parse(state.timeline.permits[0].from);
  const result = currentResult(state);
  const entry = (column: EsColumn) => {
    const pathway = pathwayOf(result, column);
    // The engine's candidate date for the residence period alone.
    const earliestDate =
      pathway?.earliestDate ?? pathway?.pathwayCompletionDate;
    const target = earliestDate && Date.parse(earliestDate);
    const percent =
      pathway?.status === 'MET'
        ? 100
        : target && target > start
          ? ((Date.parse(state.date) - start) / (target - start)) * 100
          : 0;
    return {
      outcome: pathway?.status ?? ('UNKNOWN' as const),
      ...(earliestDate && { earliestDate }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    };
  };
  return { lt: entry('lt'), nat: entry('nat') };
}

export const esRules: EvaluationAdapter<
  EsTimeline,
  CountryResult,
  EsEffect,
  EsColumn,
  EsOutcome,
  EsFestival
> = {
  evaluate,
  progress,
  visaMonthsLeft,
  // Back with a valid card, in time for a working day on which to apply.
  canTravel: (state, through) =>
    workdayAfter(state, through) <= currentPermit(state).to!,
  earnings: (state) =>
    (b.salary[state.characterId] ?? 0) *
    b.promotionMultiplier **
      state.flags.filter((flag) => /^promotion-\d+$/.test(flag)).length,
  // The core records the promotion flag that `earnings` counts.
  promote: () => true,
  recordAbsence,
  // A lapsed card ends the story, unless long-term residence can still be
  // filed in the late window the engine allows (SRC-083 art. 184.2). Once
  // that window has passed, the ending records it as closed.
  expired(state) {
    const to = currentPermit(state).to!;
    if (to >= state.date) return false;
    // The shared game records a trip ending now only after this check.
    const checked = { ...state, timeline: structuredClone(state.timeline) };
    if (state.trip && state.trip.to <= state.date)
      recordAbsence(checked, state.trip);
    if (pathwayOf(evaluate(checked), 'lt')?.status === 'MET') return false;
    if (state.date > lateFilingDeadline(to))
      state.timeline.residence.filingWindowAccepted = false;
    return true;
  },
  // Steps carry the day they are taken, as trips do.
  applyEffect(state, effect, { setFlags }) {
    const steps = state.timeline.steps;
    const day = state.day.date;
    switch (effect.type) {
      case 'dele':
        steps.dele = day;
        setFlags(state, ['dele-passed', 'quarter-exam-passed']);
        return true;
      case 'ccse':
        steps.ccse = day;
        delete steps.ccseRetakeFrom;
        setFlags(state, ['ccse-passed', 'quarter-exam-passed']);
        return true;
      // A failed free retake needs a new registration; a failed paid one
      // leaves a free retake.
      case 'ccse-failed':
        if (freeCcseRetake(state)) delete steps.ccseRetakeFrom;
        else steps.ccseRetakeFrom = day;
        return false;
      case 'papers':
        steps.papers = day;
        setFlags(state, ['papers-ready']);
        return true;
      case 'moved':
        steps.moves.push({ movedOn: day });
        setFlags(state, ['padron-due']);
        return true;
      case 'padron':
        steps.moves.at(-1)!.registeredOn = day;
        state.flags = state.flags.filter((flag) => flag !== 'padron-due');
        return true;
      case 'filed':
        steps.filed = day;
        return true;
    }
  },
};
