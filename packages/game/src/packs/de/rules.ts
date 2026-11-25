import {
  DE_PROCEDURE_CHECKS,
  evaluateGermanyFull,
  type CountryPathway,
  type CountryResult,
  type DeFullRequest,
  type DeFullRoute,
} from '@uk-immigration/engine';
import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import { addMonths, dayMs } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';
import { deBalance as b } from './balance';

type Full = Omit<DeFullRequest, 'simulationDate' | 'locale'>;
type Mobility = NonNullable<Full['mobility']>;
type TitleReview = NonNullable<Mobility['titles']>[number];
type Permit = NonNullable<Full['permits']>[number];

/** The assessed answers, as the Germany questionnaire stores them. */
export type DeTimeline = Full & {
  routes: DeFullRoute[];
  firstEntry: IsoDate;
  permits: Permit[];
  trips: NonNullable<Full['trips']>;
  common: NonNullable<Full['common']>;
  settlement: NonNullable<Full['settlement']>;
  mobility: Mobility & { titles: TitleReview[] };
  citizenship: NonNullable<Full['citizenship']>;
  fees: NonNullable<Full['fees']>;
};
export type DeFestival =
  'weihnachtsmarkt' | 'maifest' | 'fete-de-la-musique' | 'st-martin';
export type DeState = GameState<DeTimeline, CountryResult, DeFestival>;
/** Progress columns: the character's settlement and naturalisation routes. */
export type DeColumn = 'settle' | 'nat';
export type DeOutcome = CountryPathway['status'];

export type DeEffect =
  /** The B1 certificate from the in-game exam. */
  | { type: 'german' }
  /** The Leben in Deutschland test with this many correct answers. */
  | { type: 'orientationTest'; correct: number }
  /** A quarter of Blue Card employment with contributions, less months abroad. */
  | { type: 'payroll' }
  | { type: 'salary'; annualEur: number };

const values = germanyFull2026_11.values;
const naturalisationRoutes: readonly DeFullRoute[] = [
  'R07',
  'R08',
  'R16',
  'R17',
];

export function pathwayOf(
  result: CountryResult,
  timeline: DeTimeline,
  column: DeColumn,
) {
  const route = timeline.routes.find(
    (id) => naturalisationRoutes.includes(id) === (column === 'nat'),
  );
  return result.columns[0]?.pathways.find(({ id }) => id === `DE-${route}`);
}

/** The permit held on a date: the latest one issued by then. */
export const currentPermit = (state: {
  timeline: DeTimeline;
  date: IsoDate;
}): Permit =>
  state.timeline.permits
    .filter((permit) => permit.from <= state.date)
    .sort((a, c) => c.from.localeCompare(a.from))[0];

/** The document review for the current permit (SRC-100 § 51). */
export const currentTitle = (state: {
  timeline: DeTimeline;
  date: IsoDate;
}): TitleReview =>
  state.timeline.mobility.titles.find(
    (title) => title.from === currentPermit(state).from,
  )!;

/** Months to the end of the current permit, rounded down. */
function visaMonthsLeft(state: DeState): number {
  const to = currentPermit(state).to;
  if (!to || to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

/**
 * The engine's projected date for the time conditions. It is the earliest
 * date of a pathway that only waits for time, and otherwise appears in the
 * pathway summary (`按现有记录测算的时间条件日期为 …`).
 */
export const timeDate = (pathway?: CountryPathway) =>
  pathway?.earliestDate ?? pathway?.summary?.match(/\d{4}-\d{2}-\d{2}/)?.[0];

function progress(state: DeState): Progress<DeColumn, DeOutcome> {
  const start = Date.parse(state.timeline.firstEntry);
  const entry = (column: DeColumn) => {
    const pathway = pathwayOf(state.result, state.timeline, column);
    const date = timeDate(pathway);
    const target = date && Date.parse(date);
    const percent =
      pathway?.status === 'MET' ||
      (column === 'settle' && payYearPending(state))
        ? 100
        : target && target > start
          ? ((Date.parse(state.date) - start) / (target - start)) * 100
          : 0;
    return {
      outcome: pathway?.status ?? 'UNKNOWN',
      ...(date && { earliestDate: date }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    };
  };
  return { settle: entry('settle'), nat: entry('nat') };
}

/** Whole months spent abroad between two dates, counting a trip under way. */
function monthsAbroad(state: DeState, from: IsoDate, to: IsoDate) {
  const trips = [
    ...state.timeline.trips.map((trip) => [trip.departed, trip.returned]),
    ...(state.trip ? [[state.trip.from, state.trip.to]] : []),
  ];
  const days = trips.reduce((sum, [departed, returned]) => {
    const start = departed > from ? departed : from;
    const end = returned < to ? returned : to;
    return sum + Math.max(0, (Date.parse(end) - Date.parse(start)) / dayMs);
  }, 0);
  return Math.round(days / values.daysPerMonth.value);
}

/**
 * Pathways whose only open requirement is the Blue Card pay check for a year
 * whose salary threshold is not yet in the parameter table (PD-350). The
 * authority checks the pay when the application is made.
 */
export function payYearPending(state: DeState) {
  const pathway = pathwayOf(state.result, state.timeline, 'settle');
  const year = state.date.slice(0, 4);
  return (
    pathway?.id === 'DE-R03' &&
    pathway.status === 'UNKNOWN' &&
    !(year in values.blueCardStandardPay.value) &&
    pathway.checks.every(
      (check) =>
        check.status === 'MET' ||
        DE_PROCEDURE_CHECKS.has(check.id) ||
        /^DE-C(6[5-9]|7[01])(-|$)/.test(check.id) ||
        check.id === 'DE-C21-pay',
    )
  );
}

export const deRules: EvaluationAdapter<
  DeTimeline,
  CountryResult,
  DeEffect,
  DeColumn,
  DeOutcome,
  DeFestival
> = {
  evaluate: ({ date, timeline, locale }) =>
    evaluateGermanyFull({ ...timeline, simulationDate: date, locale }),
  progress,
  route: (state) => state.timeline.routes[0],
  visaMonthsLeft,
  canTravel: (state, through) => {
    const to = currentPermit(state).to;
    return !!to && through <= to;
  },
  // A home visit is an ordinary, temporary absence: no other ground for the
  // permit to lapse, and back within the ordinary period (SRC-100 § 51 Abs. 1 Nr. 6–7).
  recordAbsence(state, trip) {
    state.timeline.trips.push({ departed: trip.from, returned: trip.to });
    currentTitle(state).trips!.push({
      departed: trip.from,
      returned: trip.to,
      nonTemporary: false,
      exception: 'none',
    });
  },
  earnings(state) {
    const card = state.timeline.mobility.blueCard;
    if (card?.countableAnnualGross) return card.countableAnnualGross;
    const raises = state.flags.filter((flag) =>
      /^promotion-\d+$/.test(flag),
    ).length;
    return (b.salary[state.characterId] ?? 0) * b.promotionMultiplier ** raises;
  },
  promote(state, multiplier) {
    const card = state.timeline.mobility.blueCard;
    if (card?.countableAnnualGross)
      card.countableAnnualGross = Math.round(
        card.countableAnnualGross * multiplier,
      );
    return true;
  },
  // The game makes no extension application; a lapse ends this story. The
  // ending's assessment shows it: no current card, title or lawful residence.
  expired(state) {
    const to = currentPermit(state).to;
    if (!to || to >= state.date) return false;
    const card = state.timeline.mobility.blueCard;
    if (card) card.cardHeldAtDecision = false;
    currentTitle(state).continuingUnder81 = false;
    state.timeline.citizenship.lawfulHabitualResidence = false;
    return true;
  },
  applyEffect(state, effect, { setFlags }) {
    const { common, citizenship } = state.timeline;
    switch (effect.type) {
      case 'german':
        common.provenGerman = 'B1';
        citizenship.germanEvidence = 'B1';
        setFlags(state, ['german-b1', 'quarter-exam-passed']);
        return true;
      case 'orientationTest': {
        const best = Math.max(effect.correct, common.orientationScore ?? 0);
        common.orientationScore = best;
        citizenship.knowledge = { kind: 'lid', correct: best };
        setFlags(state, ['orientation-test']);
        return true;
      }
      case 'payroll': {
        const card = state.timeline.mobility.blueCard;
        if (!card) return false;
        const end = addMonths(state.date, b.monthsPerQuarter);
        const away = monthsAbroad(state, state.date, end);
        state.timeline.blueCardEmploymentMonths =
          (state.timeline.blueCardEmploymentMonths ?? 0) +
          Math.max(0, b.monthsPerQuarter - away);
        return true;
      }
      case 'salary': {
        const card = state.timeline.mobility.blueCard;
        if (card) card.countableAnnualGross = effect.annualEur;
        return true;
      }
    }
  },
};
