import {
  evaluateUnitedStatesFull,
  nextUsBusinessDay,
  type UsFullPathway,
  type UsFullPathwayId,
  type UsFullRequest,
  type UsFullResult,
  type UsRequest,
} from '@uk-immigration/engine';
import {
  unitedStates2026_11,
  unitedStatesFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Locale, Progress } from '../../model';

/**
 * The assessed answers, as the US questionnaire stores them. The engine
 * assesses one pathway per request, so one timeline holds the answers for the
 * character's green card and citizenship pathways.
 */
export type UsTimeline = Omit<
  UsFullRequest,
  | 'pathway'
  | 'simulationDate'
  | 'locale'
  | 'trips'
  | 'naturalization'
  | 'travel'
> &
  Required<
    Pick<UsRequest, 'dateOfBirth' | 'permanentResident' | 'conditional'>
  > & {
    trips: NonNullable<UsFullRequest['trips']>;
    naturalization: NonNullable<UsFullRequest['naturalization']>;
    travel: NonNullable<UsFullRequest['travel']> & { cardExpiresOn: IsoDate };
    /** Game only: fictional household earnings a year, in US dollars. */
    annualIncomeUsd: number;
    /**
     * Game only: each change of address and its AR-11 report, on the day they
     * happen. The questionnaire's travel answers take the latest move by the
     * assessment date (see usRequest).
     */
    moves: { movedOn: IsoDate; reportedOn?: IsoDate }[];
    /**
     * Game only: the day each petition was mailed and the interview held.
     * The questionnaire's answers take those by the assessment date
     * (usRequest).
     */
    filed: {
      i751?: IsoDate;
      i90?: IsoDate;
      n400?: IsoDate;
      interview?: IsoDate;
    };
  };
export type UsFestival =
  'polar-plunge' | 'cinco-de-mayo' | 'fourth-of-july' | 'halloween';
export type UsState = GameState<UsTimeline, UsFullResult, UsFestival>;
/** Progress columns: the character's green card and citizenship pathways. */
export type UsColumn = 'gc' | 'cit';
export type UsOutcome = UsFullPathway['status'];

export type UsEffect =
  /** Mailing a joint I-751, which USCIS decides later (not in the game). */
  | { type: 'i751' }
  /** Mailing Form I-90 to renew the card, which USCIS decides later. */
  | { type: 'i90' }
  /** Mailing the N-400, with the postmark as its filing date. */
  | { type: 'n400' }
  /** Passing the English and civics tests at the N-400 interview. */
  | { type: 'interview' }
  /** A change of address, to report to USCIS. */
  | { type: 'moved' }
  | { type: 'addressReport' }
  | { type: 'salary'; annualUsd: number };

const base = unitedStates2026_11.values;
export const values = unitedStatesFull2026_11.values;

/** One source of a parameter (the first by default), for in-game notes. */
export const cite = (
  { sources }: { sources: readonly SourceRef[] },
  index = 0,
) => `${sources[index].srcId}, ${sources[index].locator}`;
/** Fees from Form G-1055 as policy-data records them (SRC-316). */
export const fees = values.fees.value;
export const feeSource = values.fees.sources[0].srcId;

/**
 * Conditional residents file I-751. Once it is in by the assessment date, the
 * green card column follows keeping the card, as for everyone else.
 */
export const greenCardPathway = (
  timeline: UsTimeline,
  date: IsoDate,
): UsFullPathwayId =>
  timeline.conditional !== 'none' &&
  !(timeline.filed.i751 && timeline.filed.i751 <= date)
    ? 'US-CONDITIONS'
    : 'US-TRAVEL';
export const citizenshipPathway = (timeline: UsTimeline): UsFullPathwayId =>
  timeline.marriage ? 'US-SPOUSE' : 'US-NATURALIZATION';

/**
 * The questionnaire's answers for one of the character's pathways, as they
 * stood on the assessment date. A move or report made later in the quarter
 * carries its own day, so it joins the assessment next quarter, as trips do
 * on return. The game's assessment and the ending link both read this.
 */
export function usRequest(
  timeline: UsTimeline,
  pathway: UsFullPathwayId,
  simulationDate: IsoDate,
  locale: Locale,
): UsFullRequest {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { annualIncomeUsd, moves, filed, ...answers } = timeline;
  const by = (date?: IsoDate): date is IsoDate =>
    !!date && date <= simulationDate;
  const move = moves.filter(({ movedOn }) => by(movedOn)).at(-1);
  return {
    ...answers,
    ...(by(filed.n400) && {
      fees: { ...answers.fees, filingOn: filed.n400 },
    }),
    naturalization: {
      ...answers.naturalization,
      // A filed I-751 is pending with status maintained (the questionnaire's
      // "No"); before it is filed the answer stays open.
      ...(by(filed.i751) && { conditionalStatusResolved: false }),
      ...(by(filed.interview) && {
        english: 'passed',
        civics: 'passed',
        interviewOn: filed.interview,
      }),
    },
    travel: {
      ...answers.travel,
      ...(by(filed.i90) && {
        replacementFiledOn: filed.i90,
        replacementReason: 'renewal',
      }),
      movedOn: move?.movedOn ?? 'no-move',
      ...(move && {
        addressReportedOn: by(move.reportedOn)
          ? move.reportedOn
          : 'not-reported',
      }),
    },
    pathway,
    simulationDate,
    locale,
  };
}

/**
 * The game assesses each quarter on its first USCIS business day: paper
 * filings are received on business days (SRC-081 1 USCIS-PM B.6(E)).
 */
export const filingDay = (date: IsoDate) => nextUsBusinessDay(date);

export function pathwayOf(result: UsFullResult, column: UsColumn) {
  return result.columns[0]?.pathways[column === 'gc' ? 0 : 1];
}

/** Months to the end of the green card's validity, rounded down. */
export function visaMonthsLeft(state: UsState): number {
  const to = state.timeline.travel.cardExpiresOn;
  if (to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

// As on the result page (apps/web/lib/united-states-module.ts): an approval
// stage that does not apply, is unmet or is open outranks filing; otherwise
// filing gives the outcome.
const stageRank = (status?: UsOutcome) =>
  status === 'NOT_APPLICABLE'
    ? 3
    : status === 'NOT_MET'
      ? 2
      : status === 'UNKNOWN'
        ? 1
        : 0;
export const stageOutcome = (filing: UsOutcome, approval?: UsOutcome) =>
  approval && stageRank(approval) > stageRank(filing) ? approval : filing;

/** Outcomes as the result page shows them; the bar fills toward filing. */
function progress(state: UsState): Progress<UsColumn, UsOutcome> {
  const start = Date.parse(state.timeline.permanentResident);
  const entry = (column: UsColumn) => {
    const pathway = pathwayOf(state.result, column);
    const filing = pathway?.status ?? 'UNKNOWN';
    const target =
      filing === 'FUTURE' && pathway?.earliestDate
        ? Date.parse(pathway.earliestDate)
        : undefined;
    const percent =
      filing === 'MET'
        ? 100
        : target && target > start
          ? ((Date.parse(state.date) - start) / (target - start)) * 100
          : 0;
    return {
      outcome: stageOutcome(filing, pathway?.approvalStatus),
      ...(target && { earliestDate: pathway!.earliestDate }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    };
  };
  return { gc: entry('gc'), cit: entry('cit') };
}

export const usRules: EvaluationAdapter<
  UsTimeline,
  UsFullResult,
  UsEffect,
  UsColumn,
  UsOutcome,
  UsFestival
> = {
  evaluate({ date, timeline, locale }) {
    const [card, citizenship] = [
      greenCardPathway(timeline, filingDay(date)),
      citizenshipPathway(timeline),
    ].map((pathway) =>
      evaluateUnitedStatesFull(
        usRequest(timeline, pathway, filingDay(date), locale),
      ),
    );
    return {
      ...card,
      columns: [
        {
          ...card.columns[0],
          pathways: [
            ...card.columns[0].pathways,
            ...citizenship.columns[0].pathways,
          ],
        },
      ],
    };
  },
  progress,
  route: (state) => state.timeline.conditional,
  visaMonthsLeft,
  // A green card is the return document while it is valid (SRC-080 8 CFR 211.1).
  // A pending petition's receipt notice extends it for a period policy-data
  // does not have (PD-432), so trips stop at the card's printed date.
  canTravel: (state, through) => through <= state.timeline.travel.cardExpiresOn,
  recordAbsence(state, trip) {
    state.timeline.trips.push({ departed: trip.from, returned: trip.to });
  },
  earnings: (state) => state.timeline.annualIncomeUsd,
  promote(state, multiplier) {
    state.timeline.annualIncomeUsd = Math.round(
      state.timeline.annualIncomeUsd * multiplier,
    );
    return true;
  },
  // Conditional residence ends at the second anniversary without a timely
  // I-751 (SRC-079 8 U.S.C. 1186a(c)(2)); a filed one keeps the status until
  // USCIS decides (SRC-080 8 CFR 216.4(a)(1)). The ending's assessment must
  // show the lapse: no excused late petition and no permanent residence to
  // naturalize from.
  expired(state) {
    const { conditions, naturalization, travel, filed } = state.timeline;
    if (
      state.timeline.conditional === 'none' ||
      filed.i751 ||
      travel.cardExpiresOn >= state.date
    )
      return false;
    if (conditions?.marriage) conditions.marriage.lateFilingExcuse = 'barred';
    naturalization.lawfulAdmission = 'barred';
    return true;
  },
  applyEffect(state, effect, { setFlags }) {
    switch (effect.type) {
      // The postmark carries its own day; no decision and no new card follow.
      case 'i751':
        state.timeline.filed.i751 = state.day.date;
        setFlags(state, ['i751-filed', 'quarter-visa-renewed']);
        return true;
      case 'i90':
        state.timeline.filed.i90 = state.day.date;
        setFlags(state, ['i90-filed', 'quarter-visa-renewed']);
        return true;
      // The postmark and the interview carry their own day, as moves do.
      case 'n400':
        state.timeline.filed.n400 = state.day.date;
        setFlags(state, ['n400-filed', 'quarter-n400-filed']);
        return true;
      case 'interview':
        state.timeline.filed.interview = state.day.date;
        setFlags(state, ['interview-passed']);
        return true;
      // Moves and reports carry the day they happen, as trips do.
      case 'moved':
        state.timeline.moves.push({ movedOn: state.day.date });
        setFlags(state, ['address-report-due']);
        return true;
      case 'addressReport': {
        const move = state.timeline.moves.at(-1);
        if (move && !move.reportedOn) move.reportedOn = state.day.date;
        state.flags = state.flags.filter(
          (flag) => flag !== 'address-report-due',
        );
        return true;
      }
      case 'salary':
        state.timeline.annualIncomeUsd = effect.annualUsd;
        return false;
    }
  },
};

/** Days to report a new address to USCIS (SRC-299 8 U.S.C. 1305(a)). */
export const addressDays = values.address.value.days;
export { base as timeValues };
