import {
  evaluateGreeceFull,
  type CountryResult,
  type GrFullPathwayId,
  type GrFullRequest,
  type PilotStatus,
} from '@uk-immigration/engine';
import {
  greece2026_11,
  greeceFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { addMonths } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress } from '../../model';
import { grBalance as b } from './balance';

type Nationality = NonNullable<GrFullRequest['nationality']>;

/** The assessed answers, as the Greek questionnaire sends them to the engine. */
export type GrTimeline = Omit<
  GrFullRequest,
  | 'simulationDate'
  | 'locale'
  | 'pathways'
  | 'permits'
  | 'trips'
  | 'changes'
  | 'passport'
  | 'residenceIncome'
  | 'nationality'
  | 'currentCardExpiresOn'
> & {
  /** The permanent route first, then naturalisation. */
  pathways: [GrFullPathwayId, 'GR-NATIONALITY'];
  permits: NonNullable<GrFullRequest['permits']>;
  trips: NonNullable<GrFullRequest['trips']>;
  changes: NonNullable<GrFullRequest['changes']>;
  passport: NonNullable<GrFullRequest['passport']>;
  /** Net household income of the last tax year; the game pays it quarterly. */
  residenceIncome: NonNullable<GrFullRequest['residenceIncome']>;
  nationality: Nationality & {
    incomeByTaxYear: NonNullable<Nationality['incomeByTaxYear']>;
  };
  currentCardExpiresOn: IsoDate;
};
export type GrFestival = 'theophany' | 'easter' | 'panigyri' | 'ochi';
export type GrState = GameState<GrTimeline, CountryResult, GrFestival>;
/** Progress columns: the character's permanent route and naturalisation. */
export type GrColumn = 'pr' | 'nat';
export type GrOutcome = PilotStatus;

export type GrEffect =
  /** Renew the Blue Card for the period the law sets for a renewal. */
  | { type: 'renewal' }
  /** The Greek A2 language and history certificate (Μ.1 integration). */
  | { type: 'a2' }
  /** The Π.Ε.Γ.Π. naturalisation certificate. */
  | { type: 'pegp' }
  /** Declare last year's income with the accountant. */
  | { type: 'taxReturn' }
  /** A change of address, to report to the migration office. */
  | { type: 'moved' }
  | { type: 'reportChange' };

export const values = greeceFull2026_11.values;
export const timing = greece2026_11.values;
/** SRC numbers of a parameter's sources, for in-game notes. */
export const src = ({ sources }: { sources: SourceRef[] }) =>
  [...new Set(sources.map((source) => source.srcId))].join(', ');

export function pathwayOf(result: CountryResult, column: GrColumn) {
  return result.columns[0]?.pathways.find((pathway) =>
    column === 'nat'
      ? pathway.id === 'GR-NATIONALITY'
      : pathway.id !== 'GR-NATIONALITY',
  );
}
export const isBlueCard = (state: { timeline: GrTimeline }) =>
  state.timeline.pathways[0] === 'GR-LONG-TERM';

/**
 * The ordinary renewal window: from two months before expiry, or late for
 * three months after it with a fine per month (SRC-087 art. 11(1)).
 */
export function renewalWindow(expiry: IsoDate) {
  return {
    early: addMonths(expiry, -timing.renewalWindowMonths.value),
    late: addMonths(expiry, timing.lateRenewalMonths.value),
  };
}

/** Months to the end of the current card, rounded down. */
function visaMonthsLeft(state: GrState): number {
  const to = state.timeline.currentCardExpiresOn;
  if (to < state.date) return 0;
  let months = 0;
  while (addMonths(state.date, months + 1) <= to) months++;
  return months;
}

/** Years of residence each route counts, from policy-data. */
function residence(state: GrState, column: GrColumn) {
  const { timeline } = state;
  if (column === 'nat')
    return {
      from: timeline.permits[0].from,
      years: timing.nationalityYears.value[timeline.route ?? 'general'],
    };
  return isBlueCard(state)
    ? { from: timeline.permits[0].from, years: timing.longTermYears.value }
    : {
        from: timeline.greekFamily!.residenceFrom!,
        years: values.gfPeriods.value.residenceYears,
      };
}

function progress(state: GrState): Progress<GrColumn, GrOutcome> {
  const entry = (column: GrColumn) => {
    const pathway = pathwayOf(state.result, column);
    const { from, years } = residence(state, column);
    const start = Date.parse(from);
    const target = Date.parse(
      pathway?.earliestDate ?? addMonths(from, years * 12),
    );
    const percent =
      pathway?.status === 'MET'
        ? 100
        : ((Date.parse(state.date) - start) / (target - start)) * 100;
    return {
      outcome: (pathway?.status ?? 'UNKNOWN') as GrOutcome,
      ...(pathway?.status === 'FUTURE' && {
        earliestDate: pathway.earliestDate,
      }),
      percent: Math.round(Math.max(0, Math.min(100, percent))),
    };
  };
  return { pr: entry('pr'), nat: entry('nat') };
}

/**
 * The timeline as it stood on the assessment date. Address changes and their
 * reports carry the day they happen, which is after the quarter's first day,
 * so they join the assessment in the next quarter, as trips do on return.
 */
export function timelineOn(timeline: GrTimeline, date: IsoDate): GrTimeline {
  return {
    ...timeline,
    changes: timeline.changes
      .filter((change) => change.occurredOn <= date)
      .map(({ reportedOn, ...change }) =>
        reportedOn && reportedOn <= date ? { ...change, reportedOn } : change,
      ),
  };
}

export const grRules: EvaluationAdapter<
  GrTimeline,
  CountryResult,
  GrEffect,
  GrColumn,
  GrOutcome,
  GrFestival
> = {
  evaluate: ({ date, timeline, locale }) =>
    evaluateGreeceFull({
      ...timelineOn(timeline, date),
      simulationDate: date,
      locale,
    }),
  progress,
  route: (state) => state.timeline.pathways[0],
  visaMonthsLeft,
  // The card must still be valid on the way back.
  canTravel: (state, through) => through <= state.timeline.currentCardExpiresOn,
  recordAbsence(state, trip) {
    state.timeline.trips.push({
      departed: trip.from,
      returned: trip.to,
      ...(!isBlueCard(state) && { familyAbsenceReason: 'ordinary' as const }),
    });
  },
  earnings: (state) =>
    state.timeline.residenceIncome.netEur! +
    (b.householdIncome[state.characterId] ?? 0),
  promote(state, multiplier) {
    const income = state.timeline.residenceIncome;
    income.netEur = Math.round(income.netEur! * multiplier);
    return true;
  },
  // Past the late renewal period, the card has lapsed and this story ends.
  expired: (state) =>
    renewalWindow(state.timeline.currentCardExpiresOn).late < state.date,
  applyEffect(state, effect, { setFlags }) {
    const { timeline } = state;
    switch (effect.type) {
      case 'renewal': {
        const years = values.workValidity.value.blueRenewalYears;
        timeline.currentCardExpiresOn = addMonths(
          timeline.currentCardExpiresOn,
          years * 12,
        );
        timeline.passport.expectedDeparture = timeline.currentCardExpiresOn;
        setFlags(state, ['visa-renewed', 'quarter-visa-renewed']);
        return true;
      }
      case 'a2':
        timeline.integration = { basis: 'a2', a2Certificate: true };
        setFlags(state, ['a2-passed', 'quarter-exam-passed']);
        return true;
      case 'pegp':
        timeline.nationality.exam = 'certificate';
        timeline.nationality.knowledgeDocumentReady = true;
        setFlags(state, ['pegp-passed', 'quarter-exam-passed']);
        return true;
      case 'taxReturn': {
        const year = Number(state.date.slice(0, 4)) - 1;
        timeline.nationality.incomeByTaxYear[year] = {
          taxableEur: grossSalary(state),
          dependants: 0,
        };
        setFlags(state, [`tax-filed-${year}`]);
        return true;
      }
      // Changes and reports carry the day they happen, as trips do.
      case 'moved':
        timeline.changes.push({
          kind: 'ordinary',
          occurredOn: state.day.date,
        });
        setFlags(state, ['change-report-due']);
        return true;
      case 'reportChange':
        timeline.changes = timeline.changes.map((change) =>
          change.reportedOn
            ? change
            : { ...change, reportedOn: state.day.date },
        );
        state.flags = state.flags.filter(
          (flag) => flag !== 'change-report-due',
        );
        return true;
    }
  },
};

/** Gross pay this year: the starting salary raised at each promotion. */
export function grossSalary(state: GrState) {
  const promotions = state.flags.filter((flag) =>
    /^promotion-\d+$/.test(flag),
  ).length;
  return Math.round(
    b.grossSalary[state.characterId] * b.promotionMultiplier ** promotions,
  );
}
/** The tax year still to declare, if the accountant has not filed it yet. */
export const unfiledTaxYear = (state: GrState) => {
  const year = Number(state.date.slice(0, 4)) - 1;
  return state.timeline.nationality.incomeByTaxYear[year] ? undefined : year;
};
