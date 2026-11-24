import type { IrelandCitizenship } from '@uk-immigration/engine';
import { IrelandWhatIfControls } from '../app/ireland/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeIrelandAnswers,
  irelandSteps,
  validateIrelandStep,
  type IrelandDraft,
} from './ireland-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export interface IrelandWhatIf {
  simulationDate: string;
  noTrips: boolean;
  employmentStart?: string;
  irpExpiresOn?: string;
  vetting?: NonNullable<IrelandCitizenship['vetting']>;
  /** Gross income for the latest tax year; blank keeps the questionnaire figures. */
  income?: number;
}

export const irelandFocusControls = {
  date: 'ie-whatif-date',
  trips: 'ie-whatif-trips',
  employment: 'ie-whatif-employment',
  irp: 'ie-whatif-irp',
  vetting: 'ie-whatif-vetting',
  income: 'ie-whatif-income',
};

const focusByCondition: Record<string, keyof typeof irelandFocusControls> = {
  'IE-NAT-CONTINUOUS': 'date',
  'IE-NAT-PRIOR': 'date',
  'IE-SPOUSE-MARRIAGE': 'date',
  'IE-WCATT-TIME': 'date',
  'IE-FAMILY-LEGACY-TIME': 'date',
  'IE-B12': 'date',
  'IE-C01': 'date',
  'IE-D03': 'date',
  'IE-E02': 'date',
  'IE-NAT-ABSENCES': 'trips',
  'IE-STAMP4-WORK-TIME': 'employment',
  'IE-IRP-RENEWAL-WINDOW': 'irp',
  'IE-A03': 'vetting',
  'IE-B17': 'income',
};

// Set one answer in an optional group without creating an empty group.
function withAnswer<T extends object>(
  record: T | undefined,
  key: keyof T,
  value: unknown,
): T | undefined {
  if (record?.[key] === value) return record;
  const next = { ...record, [key]: value } as T;
  if (value === undefined) delete next[key];
  return next;
}

export const irelandWhatIf: CountryWhatIf<IrelandDraft, IrelandWhatIf> = {
  focusControls: irelandFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial(stored) {
    const draft = activeIrelandAnswers(stored);
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      employmentStart: draft.employmentStart,
      irpExpiresOn: draft.registration?.irpExpiresOn,
      vetting: draft.citizenship?.vetting,
      income: draft.family?.application?.grossTaxYears?.at(-1),
    };
  },
  apply(stored, knobs) {
    const draft = activeIrelandAnswers(stored);
    const next: IrelandDraft = {
      ...draft,
      simulationDate: knobs.simulationDate,
      trips: knobs.noTrips && draft.trips ? [] : draft.trips,
      registration: withAnswer(
        draft.registration,
        'irpExpiresOn',
        knobs.irpExpiresOn || undefined,
      ),
    };
    if (draft.employmentStart !== knobs.employmentStart)
      next.employmentStart = knobs.employmentStart || undefined;
    if (draft.citizenship?.vetting !== knobs.vetting)
      next.citizenship = withAnswer(
        draft.citizenship,
        'vetting',
        knobs.vetting,
      );
    const application = draft.family?.application;
    const years = application?.grossTaxYears;
    if (knobs.income !== undefined && knobs.income !== years?.at(-1))
      next.family = {
        ...draft.family,
        application: {
          ...application,
          grossTaxYears: [...(years ?? []).slice(0, -1), knobs.income],
        },
      };
    return activeIrelandAnswers(next);
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'ie.error.date';
    if (knobs.employmentStart && !validDate(knobs.employmentStart))
      errors.employment = 'ie.error.date';
    if (knobs.irpExpiresOn && !validDate(knobs.irpExpiresOn))
      errors.irp = 'ie.error.date';
    if (
      knobs.income !== undefined &&
      (!Number.isFinite(knobs.income) || knobs.income < 0)
    )
      errors.income = 'ie.error.number';
    if (Object.keys(errors).length) return errors;
    for (const { step } of irelandSteps(draft)) {
      if (Object.keys(validateIrelandStep({ ...draft, step })).length) {
        errors.date = 'ie.whatif.invalid';
        break;
      }
    }
    return errors;
  },
  Controls: IrelandWhatIfControls,
};
