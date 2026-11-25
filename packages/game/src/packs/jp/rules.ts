import {
  evaluateJapanFull,
  nextCounterFilingDay,
  type JpFullNaturalisationRoute,
  type JpFullPathway,
  type JpFullPrRoute,
  type JpFullRequest,
  type JpFullResult,
  type JpNaturalisationEvidence,
  type JpPrCommonEvidence,
} from '@uk-immigration/engine';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';

/** The assessed answers, as the Japanese questionnaire stores them. */
export type JpTimeline = Omit<
  JpFullRequest,
  'locale' | 'simulationDate' | 'permanentResidence' | 'naturalisation'
> & {
  stayStart: IsoDate;
  permanentResidence: { routes: JpFullPrRoute[]; evidence: JpPrCommonEvidence };
  naturalisation: {
    routes: JpFullNaturalisationRoute[];
    evidence: JpNaturalisationEvidence;
  };
};
export type JpFestival = 'setsubun' | 'hanami' | 'bon-odori' | 'aki-matsuri';
export type JpState = GameState<JpTimeline, JpFullResult, JpFestival>;
/** Progress columns: the character's permanent residence and naturalisation routes. */
export type JpColumn = 'pr' | 'nat';
export type JpOutcome = JpFullPathway['status'] | 'FUTURE';

export type JpEffect =
  /** Record a renewal for the period the guideline treats as longest for now. */
  | { type: 'renewal' }
  /** The in-game language assessment, recorded as confirmed evidence. */
  | { type: 'japanese' }
  /** The Legal Affairs Bureau's language check and interview. */
  | { type: 'interview' }
  /** A change of address, to report at the ward office. */
  | { type: 'moved' }
  | { type: 'addressNotice' }
  | { type: 'salary'; annualYen: number };

const values = japanFull2026_11.values;

export const status = (state: {
  timeline: JpTimeline;
}): NonNullable<JpPrCommonEvidence['status']> =>
  state.timeline.permanentResidence.evidence.status!;

export function pathwayOf(result: JpFullResult, column: JpColumn) {
  return result.columns[0]?.pathways.find((pathway) =>
    pathway.id.startsWith(column === 'pr' ? 'jp.pr.' : 'jp.nat.'),
  );
}

/**
 * The game's evidence describes the next counter day, as the questionnaire
 * records filing-day answers (SRC-112, SRC-119「受付時間」).
 */
export const evidenceDay = (date: IsoDate) => nextCounterFilingDay(date).date;

/** Months to the end of the current period of stay, rounded down. */
function visaMonthsLeft(state: JpState): number {
  const to = status(state).expiresOn;
  if (!to || to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

function progress(state: JpState): Progress<JpColumn, JpOutcome> {
  const start = Date.parse(state.timeline.stayStart);
  const entry = (column: JpColumn) => {
    const pathway = pathwayOf(state.result, column);
    const earliestDate = pathway?.timeEarliestDate ?? pathway?.earliestDate;
    const target = earliestDate && Date.parse(earliestDate);
    const percent =
      pathway?.status === 'MET'
        ? 100
        : target && target > start
          ? ((Date.parse(state.date) - start) / (target - start)) * 100
          : 0;
    return {
      outcome:
        pathway?.timeStatus === 'FUTURE'
          ? ('FUTURE' as const)
          : (pathway?.status ?? 'UNKNOWN'),
      ...(earliestDate && { earliestDate }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    };
  };
  return { pr: entry('pr'), nat: entry('nat') };
}

/**
 * The timeline as it stood on the assessment date. Address changes and notices
 * carry the day they happen, which is after the quarter's first day, so they
 * join the assessment in the next quarter, as trips do on return.
 */
export function timelineOn(timeline: JpTimeline, date: IsoDate): JpTimeline {
  const evidence = timeline.permanentResidence.evidence;
  if (!evidence.addressNotices) return timeline;
  return {
    ...timeline,
    permanentResidence: {
      ...timeline.permanentResidence,
      evidence: {
        ...evidence,
        addressNotices: evidence.addressNotices
          .filter((notice) => notice.eventOn <= date)
          .map((notice) =>
            notice.notifiedOn && notice.notifiedOn > date
              ? { eventOn: notice.eventOn }
              : notice,
          ),
      },
    },
  };
}

export const jpRules: EvaluationAdapter<
  JpTimeline,
  JpFullResult,
  JpEffect,
  JpColumn,
  JpOutcome,
  JpFestival
> = {
  evaluate: ({ date, timeline, locale }) =>
    evaluateJapanFull({
      ...timelineOn(timeline, date),
      simulationDate: date,
      residenceEvidenceOn: evidenceDay(date),
      locale,
    }),
  progress,
  route: (state) => status(state).kind,
  visaMonthsLeft,
  // Short trips use the deemed re-entry permission (SRC-110 art. 26-2),
  // which ends with the period of stay.
  canTravel: (state, through) =>
    !!status(state).expiresOn && through <= status(state).expiresOn!,
  recordAbsence(state, trip) {
    state.timeline.trips.push({
      departed: trip.from,
      returned: trip.to,
      departure: 'deemed',
    });
  },
  earnings(state) {
    const evidence = state.timeline.permanentResidence.evidence;
    return (
      (evidence.applicantAnnualIncomeYen ?? 0) +
      (evidence.household ?? []).reduce(
        (sum, member) =>
          sum +
          (member.relationship === 'shared-home-and-budget'
            ? (member.annualIncomeYen ?? 0)
            : 0),
        0,
      )
    );
  },
  promote(state, multiplier) {
    const evidence = state.timeline.permanentResidence.evidence;
    if (evidence.applicantAnnualIncomeYen === undefined) return false;
    evidence.applicantAnnualIncomeYen = Math.round(
      evidence.applicantAnnualIncomeYen * multiplier,
    );
    return true;
  },
  // The game files renewals before expiry; a lapse ends this story.
  expired: (state) =>
    !!status(state).expiresOn && status(state).expiresOn! < state.date,
  applyEffect(state, effect, { setFlags }) {
    const pr = state.timeline.permanentResidence.evidence;
    const nat = state.timeline.naturalisation.evidence;
    switch (effect.type) {
      case 'renewal': {
        // The office decides the new period; the game records the period the
        // guideline treats as longest until the transition (SRC-114 第2の5(6)
        // 注4) and leaves the longest-period check to the engine.
        const current = status(state);
        const months = values.longestPeriod.value.deemedMonths;
        current.grantedPeriodMonths = months;
        current.expiresOn = addMonths(current.expiresOn!, months);
        setFlags(state, ['visa-renewed', 'quarter-visa-renewed']);
        return true;
      }
      case 'japanese':
        pr.japaneseB1Confirmed = true;
        nat.japaneseLanguage = {
          ...nat.japaneseLanguage,
          speaking: 'independent',
          reading: 'independent',
          writing: 'independent',
        };
        setFlags(state, ['japanese-confirmed', 'quarter-exam-passed']);
        return true;
      case 'interview':
        nat.japaneseLanguage = {
          ...nat.japaneseLanguage,
          authorityConfirmed: true,
        };
        nat.requiredInterviewAndAssessmentComplete = true;
        setFlags(state, ['nat-interviewed']);
        return true;
      // Notices carry the day they happen, as trips do.
      case 'moved':
        pr.addressNotices = [
          ...(pr.addressNotices ?? []),
          { eventOn: state.day.date },
        ];
        setFlags(state, ['address-notice-due']);
        return true;
      case 'addressNotice':
        pr.addressNotices = (pr.addressNotices ?? []).map((notice) =>
          notice.notifiedOn
            ? notice
            : { ...notice, notifiedOn: state.day.date },
        );
        state.flags = state.flags.filter(
          (flag) => flag !== 'address-notice-due',
        );
        return true;
      case 'salary':
        pr.applicantAnnualIncomeYen = effect.annualYen;
        return true;
    }
  },
};

/** Days to report a new address (SRC-110 art. 19-7 to 19-9). */
export const addressDays = values.immigrationDuties.value.addressDays;
