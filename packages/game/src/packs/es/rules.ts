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
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';
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

/** The current residence card: the last permit in the record. */
export const currentPermit = (state: { timeline: EsTimeline }) =>
  state.timeline.permits.at(-1)!;

/**
 * The questionnaire's answers on an assessment date: steps taken later in the
 * quarter count from the next one. The game files on the assessment date and
 * pays the 790-026 nationality fee with the application (SRC-323, SRC-334),
 * so the assessment and the result page read the fee as paid on that day.
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
      feePaid: true,
      feePaidOn: date,
    },
  };
}

/** The quarter's assessment date, or the day the application went in. */
export const assessmentDate = (state: {
  date: IsoDate;
  timeline: EsTimeline;
}) => state.timeline.steps.filed ?? state.date;

const evaluate: EvaluationAdapter<
  EsTimeline,
  CountryResult,
  EsEffect,
  EsColumn,
  EsOutcome,
  EsFestival
>['evaluate'] = (input) => {
  const date = assessmentDate(input);
  return evaluateSpainFull({
    ...filingAnswers(input.timeline, date),
    simulationDate: date,
    locale: input.locale,
  });
};

/** Months to the end of the current card, rounded down. */
function visaMonthsLeft(state: EsState): number {
  const to = currentPermit(state).to;
  if (!to || to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

function progress(state: EsState): Progress<EsColumn, EsOutcome> {
  const start = Date.parse(state.timeline.permits[0].from);
  const entry = (column: EsColumn) => {
    const pathway = pathwayOf(state.result, column);
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
  canTravel: (state, through) => through <= currentPermit(state).to!,
  earnings: (state) =>
    (b.salary[state.characterId] ?? 0) *
    b.promotionMultiplier **
      state.flags.filter((flag) => /^promotion-\d+$/.test(flag)).length,
  // The core records the promotion flag that `earnings` counts.
  promote: () => true,
  // A home visit is an ordinary, lawful trip outside the EU.
  recordAbsence(state, trip) {
    const dates = { departed: trip.from, returned: trip.to };
    state.timeline.trips.push(dates);
    state.timeline.residence.tripDetails = [
      ...(state.timeline.residence.tripDetails ?? []),
      { ...dates, reason: 'ordinary', irregularExit: false, outsideEu: true },
    ];
  },
  // A lapsed card ends the story, unless long-term residence can still be
  // filed in the late window the engine allows (SRC-083 art. 184.2). Once
  // that window has passed, the ending records it as closed.
  expired(state) {
    const to = currentPermit(state).to!;
    if (to >= state.date || pathwayOf(evaluate(state), 'lt')?.status === 'MET')
      return false;
    if (state.date > addMonths(to, values.longTermLateMonths.value))
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
        setFlags(state, ['ccse-passed', 'quarter-exam-passed']);
        return true;
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
