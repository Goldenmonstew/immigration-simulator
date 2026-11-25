import {
  evaluateAustralia,
  evaluateAustraliaFull,
  type AuFullRequest,
  type AuTrip,
  type AuVisa,
  type CountryPathway,
  type CountryResult,
} from '@uk-immigration/engine';
import { auRegionalParameters } from '@uk-immigration/policy-data';
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Locale, Progress } from '../../model';
import { auBalance as b } from './balance';

/** The permanent residence route each character is assessed on. */
export type AuRoute = 'AU-191' | 'AU-191-HK';
/** The assessed answers, as the Australian questionnaire stores them. */
export type AuTimeline = Omit<
  AuFullRequest,
  | 'simulationDate'
  | 'locale'
  | 'pathway'
  | 'visas'
  | 'trips'
  | 'regional'
  | 'publicInterest'
> & {
  pathway: AuRoute;
  /** The current temporary visa is the last entry. */
  visas: AuVisa[];
  trips: AuTrip[];
  regional: NonNullable<AuFullRequest['regional']>;
  publicInterest: NonNullable<AuFullRequest['publicInterest']>;
};
export type AuFestival =
  'australia-day' | 'anzac-day' | 'footy-final' | 'show-day';
export type AuState = GameState<AuTimeline, CountryResult, AuFestival>;
/** One progress column: the character's permanent residence route. */
export type AuColumn = 'pr';
export type AuOutcome = CountryPathway['status'];

export type AuEffect =
  /** Lodge last income year's tax return; its notice of assessment arrives. */
  | { type: 'taxReturn' }
  /** The visa medical examination, cleared. */
  | { type: 'health' }
  /** Police certificates supplied. */
  | { type: 'police' };

export const pathwayOf = (result: CountryResult) =>
  result.columns[0]?.pathways[0];
export const currentVisa = (state: { timeline: AuTimeline }) =>
  state.timeline.visas.at(-1)!;

/**
 * The income year that ended most recently before `date`, named by the year
 * it ends in (SRC-200 191.111 "income year").
 */
export function lastIncomeYear(date: IsoDate): number {
  const year = Number(date.slice(0, 4));
  return `${year}-${auRegionalParameters.incomeYearEnd.value}` < date
    ? year
    : year - 1;
}

/** What an assessment reads: a saved game, or a new one before its first day. */
type Assessed = {
  date: IsoDate;
  timeline: AuTimeline;
  locale: Locale;
  day?: { date: IsoDate };
};

/**
 * The date the game assesses on. Like the shared game, the quarter's start,
 * unless the current visa has ended before the day being played: then the
 * lapse counts from that day, so a festival after the visa's end date does
 * not show the visa or the route as still in effect.
 */
export function assessedOn(state: Omit<Assessed, 'locale'>): IsoDate {
  const day = state.day?.date;
  return day && day > state.date && currentVisa(state).to! < day
    ? day
    : state.date;
}

const evaluate = (state: Assessed) =>
  evaluateAustraliaFull({
    ...state.timeline,
    simulationDate: assessedOn(state),
    locale: state.locale,
  });

/** The assessment for the day being played. */
export const currentResult = (state: AuState): CountryResult =>
  assessedOn(state) === state.date ? state.result : evaluate(state);

/** The time requirement alone, from the time engine the full engine reuses. */
export function timeDate(state: AuState): IsoDate | undefined {
  const { timeline } = state;
  return evaluateAustralia({
    simulationDate: assessedOn(state),
    dateOfBirth: timeline.dateOfBirth!,
    firstArrival: timeline.firstArrival,
    visas: timeline.visas,
    trips: timeline.trips,
    ...(timeline.pathway === 'AU-191-HK' && {
      hongKong: {
        regionalSince: timeline.regional.hongKongOnlySince ?? undefined,
      },
    }),
  }).pathways.find((pathway) => pathway.id === timeline.pathway)?.earliestDate;
}

/** Months from the day being played to the end of the current visa, rounded down. */
function visaMonthsLeft(state: AuState): number {
  const to = currentVisa(state).to;
  const today = state.day.date;
  if (!to || to < today) return 0;
  let months = 0;
  while (addMonths(today, months + 1) <= to) months++;
  return months;
}

function progress(state: AuState): Progress<AuColumn, AuOutcome> {
  const pathway = pathwayOf(currentResult(state));
  const start = Date.parse(currentVisa(state).from);
  const earliestDate = pathway?.earliestDate ?? timeDate(state);
  const target = earliestDate && Date.parse(earliestDate);
  const percent =
    pathway?.status === 'MET'
      ? 100
      : target && target > start
        ? ((Date.parse(assessedOn(state)) - start) / (target - start)) * 100
        : 0;
  return {
    pr: {
      outcome: pathway?.status ?? 'UNKNOWN',
      ...(earliestDate && { earliestDate }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    },
  };
}

export const auRules: EvaluationAdapter<
  AuTimeline,
  CountryResult,
  AuEffect,
  AuColumn,
  AuOutcome,
  AuFestival
> = {
  evaluate,
  progress,
  route: (state) => state.timeline.pathway,
  visaMonthsLeft,
  // The trip must end while the current visa is still in effect.
  canTravel: (state, through) => through <= currentVisa(state).to!,
  recordAbsence(state, trip) {
    state.timeline.trips.push({ departed: trip.from, returned: trip.to });
  },
  // Salaries are game settings; each promotion multiplies the base once.
  earnings: (state) =>
    b.salary[state.characterId] *
    b.promotionMultiplier **
      state.flags.filter((flag) => /^promotion-\d+$/.test(flag)).length,
  promote: () => true,
  expired: (state) => currentVisa(state).to! < state.date,
  applyEffect(state, effect, { setFlags }) {
    const { regional, publicInterest } = state.timeline;
    switch (effect.type) {
      case 'taxReturn': {
        const year = lastIncomeYear(state.date);
        regional.assessmentYears = [
          ...new Set([...(regional.assessmentYears ?? []), year]),
        ];
        setFlags(state, [`tax-lodged-${year}`]);
        return true;
      }
      case 'health':
        publicInterest.health = 'cleared';
        setFlags(state, ['health-cleared']);
        return true;
      case 'police':
        publicInterest.policeDocuments = 'supplied';
        setFlags(state, ['police-supplied']);
        return true;
    }
  },
};
