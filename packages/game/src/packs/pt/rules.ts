import {
  evaluatePortugal,
  evaluatePortugalFull,
  type CountryPathway,
  type CountryResult,
  type PtFullRequest,
} from '@uk-immigration/engine';
import {
  portugal2026_11,
  portugalFull2026_11,
} from '@uk-immigration/policy-data';
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';

const pathwayIds = {
  naturalisation: 'PT-NATURALISATION',
  permanent: 'PT-PERMANENT',
  partner: 'PT-PARTNER-NATIONALITY',
} as const;
/** The questionnaire's routes a character is assessed on, in its own names. */
export type PtGameTarget = keyof typeof pathwayIds;

/** Papers obtained in town, each dated the day it was obtained. */
export interface PtSteps {
  ciple?: IsoDate;
  record?: IsoDate;
  papers?: IsoDate;
}
/** The assessed answers, as the Portuguese questionnaire stores them. */
export type PtTimeline = Omit<PtFullRequest, 'simulationDate' | 'locale'> & {
  targets: PtGameTarget[];
  steps: PtSteps;
};
export type PtFestival = 'reis' | 'cravos' | 'santos' | 'magusto';
export type PtState = GameState<PtTimeline, CountryResult, PtFestival>;
/** Progress columns: permanent residence and the character's nationality route. */
export type PtColumn = 'pr' | 'nat';
export type PtOutcome = CountryPathway['status'];

export type PtEffect =
  /** An in-game CIPLE pass, recorded as the certificate on that day. */
  | { type: 'ciple' }
  /** The Portuguese criminal record certificate, obtained that day. */
  | { type: 'record' }
  /** Birth, marriage and criminal record papers for the declaration. */
  | { type: 'declarationPapers' }
  /** The AIMA fee, paid with the application. */
  | { type: 'feePaid' }
  | { type: 'salary'; monthlyEur: number };

const fees = portugalFull2026_11.values;

/** The pathway behind a progress column. */
export function pathwayOf(
  state: { timeline: PtTimeline; result: CountryResult },
  column: PtColumn,
) {
  const target: PtGameTarget =
    column === 'pr'
      ? 'permanent'
      : state.timeline.targets.includes('partner')
        ? 'partner'
        : 'naturalisation';
  return state.result.columns[0]?.pathways.find(
    (pathway) => pathway.id === pathwayIds[target],
  );
}

/**
 * The questionnaire answers as they stood on the assessment date. Papers carry
 * the day they were obtained, after the quarter's first day, so they join the
 * assessment in the next quarter, as trips do on return.
 */
export function answersOn(
  timeline: PtTimeline,
  date: IsoDate,
): Omit<PtTimeline, 'steps'> {
  const { steps, ...answers } = timeline;
  const by = (day?: IsoDate) => !!day && day <= date;
  const ciple = { kind: 'ciple' } as const;
  return {
    ...answers,
    ...(answers.nationality && {
      nationality:
        by(steps.ciple) && answers.nationality.language
          ? { ...answers.nationality, language: ciple }
          : answers.nationality,
    }),
    ...(answers.residence && {
      residence: {
        ...answers.residence,
        ...(by(steps.ciple) && { language: ciple }),
        ...(by(steps.record) && { criminalRecordAvailable: true }),
      },
    }),
    ...(answers.partner && {
      partner: by(steps.papers)
        ? { ...answers.partner, documentsReady: true }
        : answers.partner,
    }),
  };
}

/** The current residence card: the last permit in the record. */
export const currentCard = (state: { timeline: PtTimeline }) =>
  state.timeline.permits.at(-1)!;

/**
 * The AIMA fees for a first permanent card (analysis and card, standard
 * column), when the archived fee table covers the assessment date (SRC-476,
 * SRC-477); otherwise the amount is not known (PD-398).
 */
export function permanentFee(date: IsoDate): number | undefined {
  const { from, until } = fees.aimaFeeDates.value;
  if (date < from || date >= until) return undefined;
  const { analysis, permanent } = fees.aimaOrdinaryFees.value;
  return analysis[0] + permanent[0];
}
/** The nationality procedure fee for an adult (SRC-488). */
export const declarationFee = fees.adultNationalityFee.value.eur;
/** The CIPLE exam price (SRC-482). */
export const cipleFee = fees.cipleFee.value;

/**
 * Permanent residence can go in when every assessed condition is met, or when
 * only AIMA's case-by-case means assessment (PD-385) is open and the fee is
 * paid with the application.
 */
export function permanentFileable(state: PtState) {
  const pathway = pathwayOf(state, 'pr');
  return (
    pathway?.status === 'MET' ||
    (pathway?.status === 'UNKNOWN' &&
      pathway.checks.every(
        (check) =>
          check.status === 'MET' ||
          check.id === 'PT-B07-FEE' ||
          (check.id === 'PT-B03' && check.status === 'UNKNOWN'),
      ))
  );
}

/** Months to the end of the current card, rounded down. */
function visaMonthsLeft(state: PtState): number {
  const to = currentCard(state).to;
  if (!to || to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

function progress(state: PtState): Progress<PtColumn, PtOutcome> {
  const start = Date.parse(state.timeline.permits[0].from);
  // The full engine dates a pathway only once its other conditions are met;
  // the time-only assessment dates the residence periods on their own.
  const time = evaluatePortugal({
    ...state.timeline,
    simulationDate: state.date,
  }).pathways;
  const entry = (column: PtColumn) => {
    const pathway = pathwayOf(state, column);
    const timing = time.find((item) => item.id === pathway?.id);
    const waiting = pathway?.status === 'FUTURE' || timing?.status === 'FUTURE';
    const earliestDate =
      pathway?.earliestDate ??
      (timing?.status === 'FUTURE' ? timing.earliestDate : undefined);
    const target = earliestDate && Date.parse(earliestDate);
    const percent =
      pathway?.status === 'MET'
        ? 100
        : target && target > start
          ? ((Date.parse(state.date) - start) / (target - start)) * 100
          : 0;
    return {
      outcome: waiting ? ('FUTURE' as const) : (pathway?.status ?? 'UNKNOWN'),
      ...(earliestDate && { earliestDate }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    };
  };
  return { pr: entry('pr'), nat: entry('nat') };
}

export const ptRules: EvaluationAdapter<
  PtTimeline,
  CountryResult,
  PtEffect,
  PtColumn,
  PtOutcome,
  PtFestival
> = {
  evaluate({ date, timeline, locale }) {
    const { targets, ...answers } = answersOn(timeline, date);
    const result = evaluatePortugalFull({
      ...answers,
      simulationDate: date,
      locale,
    });
    const ids: string[] = targets.map((target) => pathwayIds[target]);
    return {
      ...result,
      columns: result.columns.map((column) => ({
        ...column,
        pathways: column.pathways.filter((pathway) => ids.includes(pathway.id)),
      })),
    };
  },
  progress,
  route: (state) => state.timeline.route,
  visaMonthsLeft,
  canTravel: (state, through) =>
    !!currentCard(state).to && through <= currentCard(state).to!,
  recordAbsence(state, trip) {
    state.timeline.trips.push({ departed: trip.from, returned: trip.to });
  },
  earnings: (state) =>
    (state.timeline.residence?.means?.monthlyEligibleEur ?? 0) * 12,
  promote(state, multiplier) {
    const means = state.timeline.residence?.means;
    if (means?.monthlyEligibleEur === undefined) return false;
    means.monthlyEligibleEur = Math.round(
      means.monthlyEligibleEur * multiplier,
    );
    return true;
  },
  // The right of residence runs on for some months after a card expires
  // (SRC-126); once that has passed too, this story ends. The engine then
  // finds no permit for the permanent residence period.
  expired(state) {
    const to = currentCard(state).to;
    return (
      !!to &&
      state.date >
        addMonths(to, portugal2026_11.values.residenceRightMonths.value)
    );
  },
  // Papers carry the day they are obtained (see answersOn).
  applyEffect(state, effect, { setFlags }) {
    const { residence, steps } = state.timeline;
    switch (effect.type) {
      case 'ciple':
        steps.ciple = state.day.date;
        setFlags(state, ['ciple-passed', 'quarter-exam-passed']);
        return true;
      case 'record':
        steps.record = state.day.date;
        setFlags(state, ['record-ready']);
        return true;
      case 'declarationPapers':
        steps.papers = state.day.date;
        setFlags(state, ['declaration-papers']);
        return true;
      case 'feePaid':
        residence!.fees = { ...residence!.fees, paid: true };
        return true;
      case 'salary':
        residence!.means = {
          ...residence!.means,
          monthlyEligibleEur: effect.monthlyEur,
        };
        return true;
    }
  },
};
