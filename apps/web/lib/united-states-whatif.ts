import type {
  UsAdmissionAnswers,
  UsNaturalizationAnswers,
} from '@uk-immigration/engine';
import { UnitedStatesWhatIfControls } from '../app/united-states/whatif/controls';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';
import {
  activeUnitedStatesAnswers,
  invalidUnitedStatesStep,
  validateUnitedStatesStep,
  type UsAdmissionDraft,
  type UsDraft,
} from './united-states-draft';
import type { CountryWhatIf } from './whatif';

export interface UnitedStatesWhatIf {
  simulationDate: string;
  noTrips: boolean;
  returnOn?: string;
  english?: UsNaturalizationAnswers['english'];
  civics?: UsNaturalizationAnswers['civics'];
  income?: number;
  decisionOn?: string;
  visaAtDecision?: UsAdmissionAnswers['visaAtDecision'];
}

export const unitedStatesFocusControls = {
  date: 'us-whatif-date',
  trips: 'us-whatif-trips',
  returnOn: 'us-whatif-return',
  english: 'us-whatif-english',
  civics: 'us-whatif-civics',
  income: 'us-whatif-income',
  decision: 'us-whatif-decision',
  visa: 'us-whatif-visa',
};
type Focus = keyof typeof unitedStatesFocusControls;

const focusByCheck: Record<string, Focus> = {
  'US-TIME-LPR': 'date',
  'US-TIME-LPR-APPROVAL': 'date',
  'US-TIME-MARRIAGE': 'date',
  'US-TIME-SPOUSE-CITIZENSHIP': 'date',
  'US-TIME-CONDITIONS-FILING': 'date',
  'US-TIME-PAPER-RECEIPT': 'date',
  'US-C01-AGE': 'date',
  'US-C14-DISTRICT': 'date',
  'US-C41-HUMANITARIAN-PRESENCE': 'date',
  'US-TIME-CONTINUOUS-RESIDENCE': 'trips',
  'US-TIME-PHYSICAL-PRESENCE': 'trips',
  'US-TIME-I485-PRESENCE': 'trips',
  'US-C03-ENGLISH': 'english',
  'US-C04-CIVICS': 'civics',
  'US-C25-SUPPORT-INCOME': 'income',
  'US-C33-VISA-AND-ENTRY': 'visa',
};

// The return-specific answers describe the trip with the latest return.
export function latestTrip(trips: UsDraft['trips']) {
  if (!trips?.length) return undefined;
  return trips.reduce(
    (latest, trip, index) =>
      trip.returned > trips[latest].returned ? index : latest,
    0,
  );
}

// Set answers from the controls; an unanswered control removes the answer.
function assign<T extends object>(record: T | undefined, values: Partial<T>) {
  const next: Record<string, unknown> = { ...record, ...values };
  for (const key of Object.keys(next))
    if (next[key] === undefined) delete next[key];
  return Object.keys(next).length ? (next as T) : undefined;
}

type Availability = UsAdmissionAnswers['visaAtDecision'];
const monthOf = (date: string) => date.slice(0, 7);
const decisionMonth = (draft: UsDraft) =>
  monthOf(draft.admission?.decisionOn ?? draft.simulationDate);

// The engine reads the decision month's chart, or the single answer when the
// decision falls in the assessment month.
function decisionAvailability(draft: UsDraft): Availability {
  const month = decisionMonth(draft);
  return (
    draft.admission?.visaAtDecisionByMonth?.find((row) => row.month === month)
      ?.availability ??
    (month === monthOf(draft.simulationDate)
      ? draft.admission?.visaAtDecision
      : undefined)
  );
}

function setDecisionAvailability(draft: UsDraft, value: Availability) {
  const month = decisionMonth(draft);
  const sameMonth = month === monthOf(draft.simulationDate);
  const rows = (draft.admission?.visaAtDecisionByMonth ?? []).filter(
    (row) => row.month !== month,
  );
  if (value && !sameMonth) rows.push({ month, availability: value });
  draft.admission = assign(draft.admission, {
    visaAtDecisionByMonth: rows.length ? rows : undefined,
    ...(sameMonth && { visaAtDecision: value }),
  });
}

// Answers that describe the assessment date keep describing it when the
// comparison moves the date: availability for its month moves to the month
// charts, and counts and wage records run to that date.
function keepAssessmentDate(draft: UsDraft, original: string) {
  if (draft.simulationDate === original) return;
  const admission = draft.admission;
  if (admission && monthOf(original) !== monthOf(draft.simulationDate)) {
    const pin = (
      single: 'visaAtFiling' | 'visaAtDecision',
      table: 'visaAtFilingByMonth' | 'visaAtDecisionByMonth',
    ) => {
      const availability = admission[single];
      if (!availability) return;
      const rows = admission[table] ?? [];
      const month = monthOf(original);
      if (!rows.some((row) => row.month === month))
        admission[table] = [...rows, { month, availability }];
      delete admission[single];
    };
    // Consular filing reads current availability, not a month chart.
    if (admission.process === 'adjustment')
      pin('visaAtFiling', 'visaAtFilingByMonth');
    pin('visaAtDecision', 'visaAtDecisionByMonth');
  }
  if (draft.humanitarian?.presenceDays !== undefined)
    draft.humanitarian.presenceThrough ??= original;
  if (draft.employment?.wageYears?.length)
    draft.employment.wagePeriodThrough ??= original;
}

// The return date control needs a trip to change.
export const hasReturnControl = (draft: UsDraft, noTrips: boolean) =>
  draft.pathway === 'US-TRAVEL' &&
  !noTrips &&
  latestTrip(draft.trips) !== undefined;

export const unitedStatesWhatIf: CountryWhatIf<UsDraft, UnitedStatesWhatIf> = {
  focusControls: unitedStatesFocusControls,
  focusForRule: (id, pathwayId) =>
    pathwayId === 'US-TRAVEL' &&
    (id === 'US-TIME-TRAVEL' || id === 'US-C22-RETURN-DOCUMENT')
      ? 'returnOn'
      : focusByCheck[id],
  initial(stored) {
    const draft = activeUnitedStatesAnswers(stored);
    const latest = latestTrip(draft.trips);
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      returnOn:
        latest === undefined ? undefined : draft.trips![latest].returned,
      english: draft.naturalization?.english,
      civics: draft.naturalization?.civics,
      income: draft.support?.household?.incomeUsd,
      decisionOn: draft.admission?.decisionOn,
      visaAtDecision: decisionAvailability(draft),
    };
  },
  apply(stored, knobs) {
    const draft = structuredClone(activeUnitedStatesAnswers(stored));
    const original = draft.simulationDate;
    draft.simulationDate = knobs.simulationDate;
    keepAssessmentDate(draft, original);
    const latest = latestTrip(draft.trips);
    if (knobs.noTrips) draft.trips = [];
    else if (latest !== undefined && knobs.returnOn)
      draft.trips![latest].returned = knobs.returnOn;
    draft.naturalization = assign(draft.naturalization, {
      english: knobs.english,
      civics: knobs.civics,
    });
    draft.support = assign(draft.support, {
      household: assign(draft.support?.household, { incomeUsd: knobs.income }),
    });
    draft.admission = assign<UsAdmissionDraft>(draft.admission, {
      decisionOn: knobs.decisionOn || undefined,
    });
    if (knobs.visaAtDecision !== decisionAvailability(draft))
      setDecisionAvailability(draft, knobs.visaAtDecision);
    return activeUnitedStatesAnswers(draft);
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'us.error.date';
    const returnControl = hasReturnControl(draft, knobs.noTrips);
    if (returnControl && !validDate(knobs.returnOn ?? ''))
      errors.returnOn = 'us.error.date';
    if (knobs.decisionOn && !validDate(knobs.decisionOn))
      errors.decision = 'us.error.date';
    if (
      knobs.income !== undefined &&
      (!Number.isFinite(knobs.income) || knobs.income < 0)
    )
      errors.income = 'us.error.number';
    const invalid =
      !Object.keys(errors).length && invalidUnitedStatesStep(draft);
    if (invalid) {
      // Only the return date control changes trips.
      const trip = Object.entries(
        validateUnitedStatesStep({ ...draft, step: invalid.step }),
      ).find(([id]) => id.startsWith('us-trips-'));
      if (returnControl && trip) errors.returnOn = trip[1];
      else errors.date = 'us.whatif.invalid';
    }
    return errors;
  },
  Controls: UnitedStatesWhatIfControls,
};
