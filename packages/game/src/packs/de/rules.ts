import {
  DE_PROCEDURE_CHECKS,
  evaluateGermanyFull,
  type CountryPathway,
  type CountryResult,
  type DeFullRequest,
  type DeFullRoute,
} from '@uk-immigration/engine';
import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import { addDays, addMonths, dayMs } from '../../calendar';
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
  /** A Blue Card extension applied for before the card ends (SRC-100 § 81 Abs. 4). */
  | { type: 'extension' }
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

/** The document review for the permit held on a date (SRC-100 § 51). */
export const currentTitle = (
  state: { timeline: DeTimeline; date: IsoDate },
  date = state.date,
): TitleReview => {
  const permit = currentPermit({ ...state, date });
  return state.timeline.mobility.titles.find(
    (title) => title.from === permit.from,
  )!;
};

/** The last day covered by the current permit and any permit that follows on. */
export function permitEnd(state: { timeline: DeTimeline; date: IsoDate }) {
  let end = currentPermit(state).to;
  for (const permit of [...state.timeline.permits].sort((a, c) =>
    a.from.localeCompare(c.from),
  ))
    if (end && permit.to && permit.from === addDays(end, 1)) end = permit.to;
  return end;
}

const term = values.skilledTitleTerm.value;
/**
 * The next Blue Card, as an extension follows the rules for issue (SRC-100
 * § 8 Abs. 1): four years, or the employment's remaining term plus six months
 * if shorter (§ 18 Abs. 4). None once the contract ends before it would start.
 */
export function blueCardExtension(state: DeState) {
  const card = state.timeline.mobility.blueCard;
  const current = currentPermit(state);
  if (
    current.kind !== 'blue-card' ||
    !current.to ||
    !card?.employmentStartedOn ||
    !card.contractMonths
  )
    return;
  const from = addDays(current.to, 1);
  const contractEnd = addDays(
    addMonths(card.employmentStartedOn, card.contractMonths),
    -1,
  );
  if (contractEnd < from) return;
  const full = addDays(addMonths(from, term.years * 12), -1);
  const shorter = addMonths(contractEnd, term.extraMonths);
  return { from, to: shorter < full ? shorter : full };
}

/** Months to the end of the current permit and any that follows, rounded down. */
function visaMonthsLeft(state: DeState): number {
  const to = permitEnd(state);
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
      (column === 'settle' && !!officePending(state))
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
 * The settlement checks the authority confirms when the application is made,
 * if they are all that is open: the local housing standard, for which the
 * game has no local figure (PD-348), and the Blue Card pay check for a year
 * whose salary threshold is not yet in the parameter table (PD-350).
 */
export function officePending(state: DeState): string[] | undefined {
  const pathway = pathwayOf(state.result, state.timeline, 'settle');
  if (pathway?.status !== 'UNKNOWN') return;
  const office = ['DE-C10'];
  if (!(state.date.slice(0, 4) in values.blueCardStandardPay.value))
    office.push('DE-C21-pay');
  const open = pathway.checks.filter(
    (check) =>
      check.status !== 'MET' &&
      !DE_PROCEDURE_CHECKS.has(check.id) &&
      !/^DE-C(6[5-9]|7[01])(-|$)/.test(check.id),
  );
  if (!open.length || open.some((check) => !office.includes(check.id))) return;
  return open.map((check) => check.id);
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
    const to = permitEnd(state);
    return !!to && through <= to;
  },
  // A home visit is an ordinary, temporary absence: no other ground for the
  // permit to lapse, and back within the ordinary period (SRC-100 § 51 Abs. 1 Nr. 6–7).
  recordAbsence(state, trip) {
    state.timeline.trips.push({ departed: trip.from, returned: trip.to });
    currentTitle(state, trip.from).trips!.push({
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
      case 'extension': {
        const next = blueCardExtension(state)!;
        state.timeline.permits.push({ kind: 'blue-card', ...next });
        state.timeline.mobility.titles.push({
          kind: 'blue-card',
          from: next.from,
          validTo: next.to,
          noOtherLossEvent: true,
          trips: [],
        });
        setFlags(state, ['visa-renewed', 'quarter-visa-renewed']);
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
