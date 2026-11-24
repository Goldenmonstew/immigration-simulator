import type { NzEnglishEvidence } from '@uk-immigration/engine';
import { NzWhatIfControls } from '../app/new-zealand/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  nzSteps,
  validateNzStep,
  type NzDraft,
  type NzGoal,
} from './new-zealand-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export interface NzWhatIf {
  date: string;
  noTrips: boolean;
  lastReturn?: string;
  englishScore?: number;
  citizenshipEnglish?: string;
  hourlyPay?: number;
  partnerMonths?: number;
  invested?: number;
}

export const nzFocusControls = {
  date: 'nz-whatif-date',
  trips: 'nz-whatif-trips',
  lastReturn: 'nz-whatif-last-return',
  english: 'nz-whatif-english',
  citizenshipEnglish: 'nz-whatif-citizenship-english',
  pay: 'nz-whatif-pay',
  partner: 'nz-whatif-partner',
  invested: 'nz-whatif-invested',
};

const focusByCondition: Record<string, keyof typeof nzFocusControls> = {
  'NZ-P1-1-TRAVEL': 'date',
  'NZ-P2-1': 'date',
  'NZ-P2-3': 'date',
  'NZ-P2-JOINT-DATE': 'date',
  'NZ-P3-1-STATUS': 'date',
  'NZ-P4-1-AGE': 'date',
  'NZ-P5-1-AGE': 'date',
  'NZ-P6-AGE': 'date',
  'NZ-C1-EVIDENCE': 'date',
  'NZ-C2-POLICE': 'date',
  'NZ-P2-2': 'trips',
  'NZ-P3-1-PRESENCE': 'trips',
  'NZ-C3': 'english',
  'NZ-P3-5': 'citizenshipEnglish',
  // Conditions that compare the job's hourly pay with a wage threshold.
  'NZ-P4-3': 'pay',
  'NZ-P4-4': 'pay',
  'NZ-P4-5': 'pay',
  'NZ-P5-2': 'pay',
  'NZ-P5-3-JOB': 'pay',
  'NZ-P6-1': 'pay',
  'NZ-P6-2': 'pay',
  'NZ-P7-1': 'partner',
  'NZ-P9-1': 'invested',
};

export const has = (draft: NzDraft, ...goals: NzGoal[]) =>
  goals.some((goal) => draft.goals.includes(goal));

// The trip with the latest departure is the one a return-date control changes.
export function lastTripIndex(draft: NzDraft) {
  const trips = draft.answers.trips ?? [];
  return trips.reduce(
    (latest, trip, index) =>
      latest < 0 || trip.departed >= trips[latest].departed ? index : latest,
    -1,
  );
}

// OET is assessed on its four grades, so a score control cannot change it.
function scoredTest(draft: NzDraft) {
  const english = draft.answers.common?.english;
  return english?.method === 'test' && english.test !== 'oet'
    ? english
    : undefined;
}

function initial(draft: NzDraft): NzWhatIf {
  const { answers } = draft;
  return {
    date: draft.simulationDate,
    noTrips: false,
    lastReturn: answers.trips?.[lastTripIndex(draft)]?.returned,
    englishScore: scoredTest(draft)?.score,
    citizenshipEnglish: answers.resident?.citizenship?.english,
    hourlyPay: answers.skilled?.job?.hourlyPay,
    partnerMonths: answers.family?.partner?.monthsTogetherAfterBothAdult,
    invested: answers.family?.investment?.active?.totalInvested,
  };
}

export const nzWhatIf: CountryWhatIf<NzDraft, NzWhatIf> = {
  focusControls: nzFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial,
  apply(draft, knobs) {
    const answers = structuredClone(draft.answers);
    const start = initial(draft);
    const last = lastTripIndex(draft);
    if (knobs.noTrips) answers.trips = [];
    else if (last >= 0 && knobs.lastReturn)
      answers.trips![last].returned = knobs.lastReturn;
    if (knobs.englishScore !== start.englishScore) {
      // Without a scored test, assume an in-person IELTS on the simulation date.
      const test: NzEnglishEvidence = scoredTest(draft) ?? {
        method: 'test',
        test: 'ielts',
        inPerson: true,
        date: knobs.date,
      };
      answers.common = {
        ...answers.common,
        english: { ...test, score: knobs.englishScore },
      };
    }
    if (knobs.citizenshipEnglish !== start.citizenshipEnglish)
      answers.resident = {
        ...answers.resident,
        citizenship: {
          ...answers.resident?.citizenship,
          english: knobs.citizenshipEnglish as 'evidenced',
        },
      };
    if (knobs.hourlyPay !== start.hourlyPay)
      answers.skilled = {
        ...answers.skilled,
        job: { ...answers.skilled?.job, hourlyPay: knobs.hourlyPay },
      };
    if (knobs.partnerMonths !== start.partnerMonths)
      answers.family = {
        ...answers.family,
        partner: {
          ...answers.family?.partner,
          monthsTogetherAfterBothAdult: knobs.partnerMonths,
        },
      };
    if (knobs.invested !== start.invested)
      answers.family = {
        ...answers.family,
        investment: {
          ...answers.family?.investment,
          active: {
            ...answers.family?.investment?.active,
            totalInvested: knobs.invested,
          },
        },
      };
    return { ...draft, simulationDate: knobs.date, answers };
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.date)) errors.date = 'nz.error.date';
    const trip = draft.answers.trips?.[lastTripIndex(draft)];
    if (!knobs.noTrips && trip) {
      if (!knobs.lastReturn || !validDate(knobs.lastReturn))
        errors.lastReturn = 'nz.error.date';
      else if (knobs.lastReturn < trip.departed)
        errors.lastReturn = 'nz.error.order';
    }
    for (const [key, value] of [
      ['english', knobs.englishScore],
      ['pay', knobs.hourlyPay],
      ['partner', knobs.partnerMonths],
      ['invested', knobs.invested],
    ] as const)
      if (value !== undefined && !(value >= 0))
        errors[key] = 'nz.form.numberError';
    if (!Object.keys(errors).length)
      for (const { step } of nzSteps(draft))
        if (Object.keys(validateNzStep({ ...draft, step })).length) {
          errors.date = 'nz.whatif.invalid';
          break;
        }
    return errors;
  },
  Controls: NzWhatIfControls,
};
