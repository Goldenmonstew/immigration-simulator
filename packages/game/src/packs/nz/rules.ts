import {
  evaluateNewZealand,
  evaluateNewZealandFull,
  type CountryPathway,
  type CountryResult,
  type NzFullRequest,
  type NzRequest,
} from '@uk-immigration/engine';
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';
import { nzBalance as b } from './balance';

/** The assessed answers, as the New Zealand questionnaire stores them. */
export type NzTimeline = Omit<NzFullRequest, 'simulationDate' | 'locale'> &
  Pick<NzRequest, 'dateOfBirth' | 'firstArrival' | 'residentVisa' | 'trips'> & {
    /** The last travel day printed on the resident visa. */
    travelConditionsEnd: IsoDate;
  };
export type NzFestival = 'waitangi' | 'pasifika' | 'matariki' | 'ap-show';
export type NzState = GameState<NzTimeline, CountryResult, NzFestival>;
/** Progress columns: the permanent resident visa and citizenship by grant. */
export type NzColumn = 'prv' | 'cit';
export type NzOutcome = CountryPathway['status'];
/** The game has no effects of its own; the core's town effects suffice. */
export type NzEffect = never;

/** The pathways the game follows, as the questionnaire's goals select them. */
export const nzPathways: Record<NzColumn, string> = {
  prv: 'NZ-PRV',
  cit: 'NZ-CITIZENSHIP',
};

export const pathwayOf = (result: CountryResult, column: NzColumn) =>
  result.columns[0]?.pathways.find(({ id }) => id === nzPathways[column]);

export const travelEnd = (state: { timeline: NzTimeline }) =>
  state.timeline.travelConditionsEnd;

/** Months from the day being played to the end of the travel conditions. */
function visaMonthsLeft(state: NzState): number {
  const to = travelEnd(state);
  const today = state.day.date;
  if (to < today) return 0;
  let months = 0;
  while (addMonths(today, months + 1) <= to) months++;
  return months;
}

/**
 * Presence alone, from the engine's time core: the full assessment gives no
 * date while other conditions are open (citizenship waits on PD-224).
 */
export const timeProjection = (state: Pick<NzState, 'timeline' | 'date'>) =>
  evaluateNewZealand({ ...state.timeline, simulationDate: state.date })
    .pathways;

function progress(state: NzState): Progress<NzColumn, NzOutcome> {
  const time = timeProjection(state);
  const start = Date.parse(state.timeline.residentVisa.granted);
  const entry = (column: NzColumn) => {
    const pathway = pathwayOf(state.result, column);
    if (!pathway) return { outcome: 'UNKNOWN' as const, percent: 0 };
    // The label is the pathway's outcome, as the result page shows it; the
    // bar fills with the presence projection.
    const outcome = pathway.status;
    const label = {
      outcome,
      ...(outcome === 'FUTURE' &&
        pathway.earliestDate && { earliestDate: pathway.earliestDate }),
    };
    if (outcome === 'MET') return { ...label, percent: 100 };
    const presence = time.find(({ id }) => id === pathway.id);
    if (presence?.status === 'FUTURE' && presence.earliestDate) {
      const target = Date.parse(presence.earliestDate);
      const elapsed = (Date.parse(state.date) - start) / (target - start);
      return {
        ...label,
        percent: Math.round(Math.max(0, Math.min(100, elapsed * 100))),
      };
    }
    return { ...label, percent: presence?.status === 'MET' ? 100 : 0 };
  };
  return { prv: entry('prv'), cit: entry('cit') };
}

const promotions = (state: NzState) =>
  state.flags.filter((flag) => /^promotion-\d+$/.test(flag)).length;

export const nzRules: EvaluationAdapter<
  NzTimeline,
  CountryResult,
  NzEffect,
  NzColumn,
  NzOutcome,
  NzFestival
> = {
  // The engine assesses all ten pathways; keep the two the game follows.
  evaluate({ date, timeline, locale }) {
    const result = evaluateNewZealandFull({
      ...timeline,
      simulationDate: date,
      locale,
    });
    for (const column of result.columns)
      column.pathways = column.pathways.filter(({ id }) =>
        Object.values(nzPathways).includes(id),
      );
    return result;
  },
  progress,
  route: (state) => state.timeline.residentVisa.category,
  visaMonthsLeft,
  // RV1.5: the resident visa expires if its holder is overseas when the
  // travel conditions end, so every trip must be back by then.
  canTravel: (state, through) => through <= travelEnd(state),
  recordAbsence(state, trip) {
    state.timeline.trips.push({ departed: trip.from, returned: trip.to });
  },
  // Whole dollars each quarter.
  earnings: (state) =>
    Math.round(
      ((b.salaries[state.characterId] ?? 0) *
        b.promotionMultiplier ** promotions(state)) /
        b.quartersPerYear,
    ) * b.quartersPerYear,
  // The core records the promotion flag that `earnings` counts.
  promote: () => true,
};
