import {
  familyFiveYearStart,
  familyIncomeThreshold,
  type PersonTimeline,
} from '@uk-immigration/engine';
import {
  type CefrLevel,
  earnedSettlement2026_11,
} from '@uk-immigration/policy-data';
import {
  type Draft,
  draftReducer,
  validDate,
  visibleIncomeYears,
} from './questionnaire';
import type { WhatIfTarget } from './whatif';

export const focusControls = {
  english: 'whatif-english',
  income: 'whatif-earnings',
  date: 'whatif-date',
  life: 'whatif-life',
  publicFunds: 'whatif-public-funds',
} as const;
type WhatIfFocus = keyof typeof focusControls;
export function focusForRule(id: string): WhatIfFocus | undefined {
  if (id === 'ES-ENGLISH-B2' || id === 'CL-ENGLISH') return 'english';
  if (
    id.startsWith('ES-EARNINGS-') ||
    id === 'ES-PROTECTION-CONTRIBUTION' ||
    id === 'CL-FAMILY-FINANCIAL'
  )
    return 'income';
  if (id === 'ES-PUBLIC-FUNDS') return 'publicFunds';
  if (
    id === 'ES-RESIDENCE' ||
    /^CL-.+-RESIDENCE.*$/.test(id) ||
    id === 'ES-PROTECTION-PATHWAY'
  )
    return 'date';
  if (id === 'ES-KOL' || id === 'CL-KOL') return 'life';
  return undefined;
}

export interface WhatIf {
  simulationDate: string;
  incomeEnabled: boolean;
  incomeYears: number;
  earnings: number | undefined;
  english: PersonTimeline['english'];
  lifeInTheUk: PersonTimeline['lifeInTheUk'];
  noPublicFunds: boolean;
  noAbsences: boolean;
  /** One extra trip abroad to try out (playtest #1). */
  trip?: { from: string; to: string };
}

/** Both dates filled in, departure first: only then does the trip count. */
export function validTrip(trip: { from: string; to: string }): boolean {
  return validDate(trip.from) && validDate(trip.to) && trip.from <= trip.to;
}

/** Whole days away: travel days do not count (SRC-057, A1#17). */
export function tripDays(trip: { from: string; to: string }): number {
  const days =
    (Date.parse(`${trip.to}T00:00:00Z`) -
      Date.parse(`${trip.from}T00:00:00Z`)) /
    86_400_000;
  return Math.max(0, Math.round(days) - 1);
}

export function initialWhatIf(draft: Draft, target?: WhatIfTarget): WhatIf {
  const initial: WhatIf = {
    simulationDate: draft.simulationDate,
    incomeEnabled: false,
    incomeYears: 7,
    earnings:
      visibleIncomeYears(draft)[0]?.earnings ??
      earnedSettlement2026_11.values.earningsThresholdMinimum.value,
    english: draft.timeline.english,
    lifeInTheUk: draft.timeline.lifeInTheUk,
    noPublicFunds: false,
    noAbsences: false,
  };
  if (
    target?.focus === 'english' &&
    (!initial.english || 'cefrLevel' in initial.english)
  ) {
    const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const current = initial.english?.cefrLevel;
    initial.english = {
      cefrLevel: current
        ? levels[Math.min(levels.indexOf(current) + 1, levels.length - 1)]
        : (earnedSettlement2026_11.values.settlementEnglishLevel
            .value as CefrLevel),
    };
  }
  if (target?.focus === 'income') {
    initial.incomeEnabled = true;
    const values = earnedSettlement2026_11.values;
    if (target.ruleId === 'CL-FAMILY-FINANCIAL') {
      // Reuse the engine's transitional/child calculation, without duplicating policy.
      const context = {
        timeline: draft.timeline,
        simulationDate: draft.simulationDate,
      };
      if (familyFiveYearStart(context))
        initial.earnings = familyIncomeThreshold(context).threshold;
    } else {
      initial.earnings =
        target.ruleId === 'ES-EARNINGS-3Y'
          ? values.earningsThreshold3Year.value
          : target.ruleId === 'ES-EARNINGS-5Y'
            ? values.earningsThreshold5Year.value
            : values.earningsThresholdMinimum.value;
    }
  }
  if (target?.focus === 'date' && target.assessment?.earliestDate) {
    initial.simulationDate = target.assessment.earliestDate;
  }
  return initial;
}

export function applyWhatIf(draft: Draft, whatIf: WhatIf): Draft {
  const dated =
    draft.simulationDate === whatIf.simulationDate
      ? draft
      : draftReducer(draft, { type: 'date', date: whatIf.simulationDate });
  const years = visibleIncomeYears(dated)
    .slice(0, whatIf.incomeYears)
    .map((row) => row.taxYear);
  return {
    ...dated,
    timeline: {
      ...dated.timeline,
      incomeYears: whatIf.incomeEnabled
        ? dated.timeline.incomeYears.map((row) =>
            years.includes(row.taxYear)
              ? { ...row, earnings: whatIf.earnings }
              : row,
          )
        : dated.timeline.incomeYears,
      english: whatIf.english,
      lifeInTheUk: whatIf.lifeInTheUk,
      benefits: whatIf.noPublicFunds ? [] : dated.timeline.benefits,
      absences: [
        ...(whatIf.noAbsences ? [] : dated.timeline.absences),
        ...(whatIf.trip && validTrip(whatIf.trip) ? [whatIf.trip] : []),
      ],
    },
  };
}
