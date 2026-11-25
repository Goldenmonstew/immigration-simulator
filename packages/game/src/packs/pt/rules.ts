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
import { addDays, addMonths, firstWeekday } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Locale, Progress } from '../../model';

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
  /** A renewal application, filed in its window and not decided in the game. */
  renewal?: IsoDate;
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
  /** A temporary residence renewal application, filed that day. */
  | { type: 'renewal' }
  | { type: 'salary'; monthlyEur: number };

const fees = portugalFull2026_11.values;
const time = portugal2026_11.values;

/** What an assessment reads: a game state, or a new game before its first day. */
type Assessed = {
  date: IsoDate;
  timeline: PtTimeline;
  locale: Locale;
  result: CountryResult;
  day?: { date: IsoDate };
};

/**
 * The date the game assesses on: the quarter's start, unless the card has
 * ended before the day being played. Then that day counts, so a festival
 * after the card's end does not show the card or the routes as still in
 * effect.
 */
export function assessedOn(state: Omit<Assessed, 'locale' | 'result'>) {
  const day = state.day?.date;
  return day && day > state.date && currentCard(state).to! < day
    ? day
    : state.date;
}

/** The assessment for the day being played. */
export const currentResult = (state: Assessed): CountryResult =>
  assessedOn(state) === state.date
    ? state.result
    : ptRules.evaluate({
        date: assessedOn(state),
        timeline: state.timeline,
        locale: state.locale,
      });

/** The pathway behind a progress column, as assessed for the day being played. */
export function pathwayOf(state: Assessed, column: PtColumn) {
  const target: PtGameTarget =
    column === 'pr'
      ? 'permanent'
      : state.timeline.targets.includes('partner')
        ? 'partner'
        : 'naturalisation';
  return currentResult(state).columns[0]?.pathways.find(
    (pathway) => pathway.id === pathwayIds[target],
  );
}

/** A renewal application has gone in and waits for AIMA's decision. */
export const renewalPending = (state: { timeline: PtTimeline }) =>
  !!state.timeline.steps.renewal;

/**
 * The renewal window for the current card: from 90 to 30 days before it ends
 * (SRC-123 art. 78(1); DR 84/2007 art. 63(16), PD-149).
 */
export function renewalWindow(state: { timeline: PtTimeline }) {
  const to = currentCard(state).to!;
  return {
    opens: addDays(to, -time.renewalWindowDays.value),
    closes: addDays(to, -time.renewalDeadlineDays.value),
  };
}

/**
 * The first workday on or after a date. Play comes back at the first quarter
 * start on or after it, from that quarter's workday, the first Tuesday after
 * its first week (game.ts beginDay); AIMA opens only on workdays.
 */
export function workdayAfter(state: { date: IsoDate }, date: IsoDate) {
  let quarter = state.date;
  while (firstWeekday(addDays(quarter, 7), 2) < date)
    quarter = addMonths(quarter, 3);
  return firstWeekday(addDays(quarter, 7), 2);
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
 * The AIMA fees for an application on a date, standard column: analysis plus
 * the card, when the archived fee table covers that date (SRC-476, SRC-477);
 * otherwise the amount is not known (PD-398).
 */
function aimaFee(date: IsoDate, card: 'permanent' | 'renew') {
  const { from, until } = fees.aimaFeeDates.value;
  if (date < from || date >= until) return undefined;
  const table = fees.aimaOrdinaryFees.value;
  return Math.round((table.analysis[0] + table[card][0]) * 100) / 100;
}
/** A first permanent card (analysis and card). */
export const permanentFee = (date: IsoDate) => aimaFee(date, 'permanent');
/** A temporary residence renewal (analysis and renewed card). */
export const renewalFee = (date: IsoDate) => aimaFee(date, 'renew');
/** The nationality procedure fee for an adult (SRC-488). */
export const declarationFee = fees.adultNationalityFee.value.eur;
/** The CIPLE exam price (SRC-482). */
export const cipleFee = fees.cipleFee.value;

/**
 * The result page's budget and information items: the fee and the absence
 * risk note do not decide the pathway's status, so they are not gaps.
 */
const notes = new Set(['PT-B07-FEE', 'PT-B01-CANCELLATION-RISK']);
/**
 * Permanent residence can go in when every assessed condition is met, or when
 * only AIMA's own checks are open: the case-by-case means assessment (PD-385)
 * and, while a renewal is pending, the holding period after the card ends
 * (PD-145, PD-433).
 */
export function permanentFileable(state: PtState) {
  const pathway = pathwayOf(state, 'pr');
  const open = (id: string) =>
    id === 'PT-B03' || (id === 'PT-B01' && renewalPending(state));
  return (
    pathway?.status === 'MET' ||
    (pathway?.status === 'UNKNOWN' &&
      pathway.checks.every(
        (check) =>
          notes.has(check.id) ||
          check.status === 'MET' ||
          (check.status === 'UNKNOWN' && open(check.id)),
      ))
  );
}

/** Months from the day being played to the end of the card, rounded down. */
function visaMonthsLeft(state: PtState): number {
  const to = currentCard(state).to;
  const today = state.day.date;
  if (!to || to < today) return 0;
  let months = 0;
  while (addMonths(today, months + 1) <= to) months++;
  return months;
}

function progress(state: PtState): Progress<PtColumn, PtOutcome> {
  const start = Date.parse(state.timeline.permits[0].from);
  const date = assessedOn(state);
  // The full engine dates a pathway only once its other conditions are met;
  // the time-only assessment dates the residence periods on their own, and
  // gives the assessment date once they are met.
  const timeOnly = evaluatePortugal({
    ...state.timeline,
    simulationDate: date,
  }).pathways;
  const entry = (column: PtColumn) => {
    const pathway = pathwayOf(state, column);
    const timing = timeOnly.find((item) => item.id === pathway?.id);
    const waiting = pathway?.status === 'FUTURE' || timing?.status === 'FUTURE';
    const earliestDate =
      pathway?.earliestDate ??
      (timing?.status === 'FUTURE' || timing?.status === 'MET'
        ? timing.earliestDate
        : undefined);
    const target = earliestDate && Date.parse(earliestDate);
    const percent =
      pathway?.status === 'MET'
        ? 100
        : target && target > start
          ? ((Date.parse(date) - start) / (target - start)) * 100
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
  // Back for a workday while the card still runs, and, until a renewal has
  // gone in, for a workday in its window if one is still ahead: a trip may
  // not make the player miss a filing that can only be made in Portugal.
  canTravel(state, through) {
    const back = workdayAfter(state, through);
    if (back > currentCard(state).to!) return false;
    if (renewalPending(state)) return true;
    const { opens, closes } = renewalWindow(state);
    const inWindow = (from: IsoDate) =>
      workdayAfter(state, from < opens ? opens : from) <= closes;
    return !inWindow(state.day.date) || inWindow(back);
  },
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
  // The right of residence runs on for some months after a card expires for
  // those who have not applied to renew (SRC-126); once that has passed too,
  // this story ends, and the engine finds no permit for the permanent
  // residence period. A pending renewal keeps it going: its receipt has the
  // card's effects (SRC-123 art. 78(7)), and the game does not decide it.
  expired(state) {
    const to = currentCard(state).to;
    return (
      !!to &&
      !renewalPending(state) &&
      state.date > addMonths(to, time.residenceRightMonths.value)
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
      // Only the filing: no decision and no new expiry date.
      case 'renewal':
        steps.renewal = state.day.date;
        setFlags(state, ['renewal-filed', 'quarter-visa-renewed']);
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
