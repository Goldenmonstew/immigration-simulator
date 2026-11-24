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
      visaAtDecision: draft.admission?.visaAtDecision,
    };
  },
  apply(stored, knobs) {
    const draft = structuredClone(activeUnitedStatesAnswers(stored));
    draft.simulationDate = knobs.simulationDate;
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
    draft.admission = assign(draft.admission, {
      decisionOn: knobs.decisionOn || undefined,
      visaAtDecision: knobs.visaAtDecision,
    });
    return activeUnitedStatesAnswers(draft);
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'us.error.date';
    if (knobs.returnOn && !validDate(knobs.returnOn))
      errors.returnOn = 'us.error.date';
    if (knobs.decisionOn && !validDate(knobs.decisionOn))
      errors.decision = 'us.error.date';
    if (
      knobs.income !== undefined &&
      (!Number.isFinite(knobs.income) || knobs.income < 0)
    )
      errors.income = 'us.error.number';
    if (!Object.keys(errors).length && invalidUnitedStatesStep(draft))
      errors.date = 'us.whatif.invalid';
    return errors;
  },
  Controls: UnitedStatesWhatIfControls,
};
