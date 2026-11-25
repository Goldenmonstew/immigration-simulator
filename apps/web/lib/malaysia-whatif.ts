import { MalaysiaWhatIfControls } from '../app/malaysia/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeMalaysiaAnswers,
  malaysiaStepList,
  validateMalaysiaStep,
  type MalaysiaDraft,
} from './malaysia-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export interface MalaysiaWhatIf {
  simulationDate: string;
  noTrips: boolean;
  prSince?: string;
  salary?: number;
  deRantauIncome?: number;
  mm2hDeposit?: number;
}

export const malaysiaFocusControls = {
  date: 'my-whatif-date',
  trips: 'my-whatif-trips',
  prSince: 'my-whatif-pr-since',
  salary: 'my-whatif-salary',
  deRantauIncome: 'my-whatif-de-rantau-income',
  mm2hDeposit: 'my-whatif-mm2h-deposit',
};

// Conditions that turn on the date: ages, years married, on a pass or
// resident, validity left and waiting periods.
const focusByCondition: Record<string, keyof typeof malaysiaFocusControls> = {
  'my.pr.marriage-duration': 'date',
  'my.pr.spouse-pass': 'date',
  'my.pr.qualifying-pass': 'date',
  'my.pr.child-age': 'date',
  'my.pr.passport': 'date',
  'my.pr.previous-refusal': 'date',
  'my.pr.rep-approval-letter': 'date',
  'my.rp.long-term-pass': 'date',
  'my.rp.child-age': 'date',
  'my.rp.passport': 'date',
  'my.cit.age': 'date',
  'my.cit.residence': 'date',
  'my.pass.age': 'date',
  'my.pass.passport': 'date',
  'my.pass.work-years': 'date',
  'my.pass.ep-validity': 'date',
  'my.pass.salary': 'salary',
  'my.pass.salary-category': 'salary',
  'my.pass.income': 'deRantauIncome',
  'my.pass.fixed-deposit': 'mm2hDeposit',
};

function initial(stored: MalaysiaDraft): MalaysiaWhatIf {
  const draft = activeMalaysiaAnswers(stored);
  return {
    simulationDate: draft.simulationDate,
    noTrips: false,
    prSince: draft.citizenship.permanentResidentSince,
    salary: draft.work.basicMonthlySalaryRm,
    deRantauIncome: draft.deRantau.annualIncomeUsd,
    mm2hDeposit: draft.mm2h.fixedDepositUsd,
  };
}

const number = (value?: number) =>
  value !== undefined && (!Number.isFinite(value) || value < 0);

export const malaysiaWhatIf: CountryWhatIf<MalaysiaDraft, MalaysiaWhatIf> = {
  focusControls: malaysiaFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial,
  // Each control replaces its answer only after it is changed, so an
  // untouched comparison keeps the questionnaire's own answers. None changes
  // the routes, the relationship or the person assessed.
  apply(stored, knobs) {
    const draft = activeMalaysiaAnswers(stored);
    const before = initial(stored);
    const next: MalaysiaDraft = {
      ...draft,
      simulationDate: knobs.simulationDate,
    };
    if (knobs.noTrips && draft.trips) next.trips = [];
    // A cleared date keeps the questionnaire's answer.
    if (knobs.prSince && knobs.prSince !== before.prSince)
      next.citizenship = {
        ...draft.citizenship,
        prHeld: knobs.prSince ? true : draft.citizenship.prHeld,
        permanentResidentSince: knobs.prSince,
      };
    if (knobs.salary !== before.salary)
      next.work = { ...draft.work, basicMonthlySalaryRm: knobs.salary };
    if (knobs.deRantauIncome !== before.deRantauIncome)
      next.deRantau = {
        ...draft.deRantau,
        annualIncomeUsd: knobs.deRantauIncome,
      };
    if (knobs.mm2hDeposit !== before.mm2hDeposit)
      next.mm2h = { ...draft.mm2h, fixedDepositUsd: knobs.mm2hDeposit };
    return activeMalaysiaAnswers(next);
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'my.error.date';
    if (knobs.prSince !== undefined && !validDate(knobs.prSince))
      errors.prSince = 'my.error.date';
    for (const key of ['salary', 'deRantauIncome', 'mm2hDeposit'] as const)
      if (number(knobs[key])) errors[key] = 'my.error.number';
    if (Object.keys(errors).length) return errors;
    for (const { step } of malaysiaStepList(draft)) {
      const issues = Object.values(validateMalaysiaStep({ ...draft, step }));
      if (issues.length) {
        errors.date = issues.includes('my.error.afterSimulation')
          ? 'my.error.afterSimulation'
          : 'my.whatif.invalid';
        break;
      }
    }
    return errors;
  },
  Controls: MalaysiaWhatIfControls,
  // As in "what is missing": fees, notes, terms after approval and review
  // factors never decide a route.
  compared: (check) => check.kind === 'requirement' || check.kind === 'time',
};
