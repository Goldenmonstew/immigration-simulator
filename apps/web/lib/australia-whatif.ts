import {
  auFamilyParameters,
  auRegionalParameters,
  australiaFull2026_11,
  australiaSkilledParameters,
} from '@uk-immigration/policy-data';
import {
  addDays,
  addMonths,
  addYears,
  type AuFullPathId,
  type AuFullRequest,
} from '@uk-immigration/engine';
import { AustraliaWhatIfControls } from '../app/australia/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeAustraliaAnswers,
  australiaSteps,
  validateAustraliaStep,
  type AustraliaDraft,
} from './australia-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

type HealthStatus = NonNullable<
  NonNullable<AuFullRequest['publicInterest']>['health']
>;

export interface AustraliaWhatIf {
  simulationDate: string;
  noTrips: boolean;
  ieltsBand?: number;
  annualSalary?: number;
  taxNoticeCount?: number;
  citizenshipTestPassed?: boolean;
  health?: HealthStatus;
}

export const australiaFocusControls = {
  date: 'au-whatif-date',
  trips: 'au-whatif-trips',
  english: 'au-whatif-english',
  salary: 'au-whatif-salary',
  taxYears: 'au-whatif-tax-years',
  citizenshipTest: 'au-whatif-cit-test',
  health: 'au-whatif-health',
} as const;

const focusByCondition: Record<string, keyof typeof australiaFocusControls> = {
  'AU-186-TRT-time-held': 'date',
  'AU-186-TRT-time-work': 'date',
  'AU-186-TRT-time-current': 'date',
  'AU-186-TRT-age': 'date',
  'AU-186-DE-age': 'date',
  'AU-189-PT-age': 'date',
  'AU-190-age': 'date',
  'AU-191-time-held': 'date',
  'AU-189-HK-time-held': 'date',
  'AU-189-HK-time-residence': 'date',
  'AU-191-HK-time-held': 'date',
  'AU-191-HK-time-residence': 'date',
  'AU-191-HK-time-regional': 'date',
  'AU-regional-lock': 'date',
  'AU-PARTNER-time': 'date',
  'AU-RRV-option-residence': 'date',
  'AU-RRV-basis': 'date',
  'AU-CIT-time-arrival': 'date',
  'AU-CIT-time-lawful': 'date',
  'AU-CIT-time-permanent': 'date',
  'AU-CIT-pr': 'date',
  'AU-CIT-time-absences': 'trips',
  'AU-CIT-time-recent-absences': 'trips',
  'AU-186-TRT-english': 'english',
  'AU-186-DE-english': 'english',
  'AU-189-PT-english': 'english',
  'AU-190-english': 'english',
  'AU-189-HK-functional-english': 'english',
  'AU-191-HK-functional-english': 'english',
  'AU-858-functional-english': 'english',
  'AU-189-PT-points': 'english',
  'AU-189-PT-invited-score': 'english',
  'AU-190-points': 'english',
  'AU-190-invited-score': 'english',
  'AU-186-TRT-salary': 'salary',
  'AU-186-TRT-market-salary': 'salary',
  'AU-186-DE-salary': 'salary',
  'AU-186-DE-market-salary': 'salary',
  'AU-191-tax-notices': 'taxYears',
  'AU-CIT-test': 'citizenshipTest',
  'AU-PIC-HEALTH': 'health',
};

// One test serves every assessed pathway. Competent English counts at the
// 189/190 invitation or the 186 lodgement, within the skilled validity period
// before it; Functional English within its period before lodgement. Try the
// day before each reference date and keep the latest valid for most pathways.
function englishTestDate(draft: AustraliaDraft, simulationDate: string) {
  const { skilledYears, functionalMonths, newTestsFrom } =
    australiaSkilledParameters.english.value;
  // An older-format test must also fall within that period before lodgement.
  const current = (date: string) =>
    date >= newTestsFrom || date >= addYears(simulationDate, -skilledYears);
  const assessed = (...ids: AuFullPathId[]) =>
    !draft.pathway || ids.includes(draft.pathway);
  const invited = (id: 'AU-189-PT' | 'AU-190') => {
    const invitation = draft.skills?.invitations?.[id];
    return assessed(id) && typeof invitation === 'object'
      ? [invitation.issued]
      : [];
  };
  const skilled = [
    ...invited('AU-189-PT'),
    ...invited('AU-190'),
    ...(assessed('AU-186-TRT', 'AU-186-DE') ? [simulationDate] : []),
  ];
  const functionalFrom = assessed('AU-189-HK', 'AU-191-HK', 'AU-858')
    ? addMonths(
        draft.english?.functionalApplicationDate ?? simulationDate,
        -functionalMonths,
      )
    : undefined;
  const valid = (date: string) =>
    skilled.filter(
      (ref) =>
        addYears(ref, -skilledYears) <= date && date < ref && current(date),
    ).length +
    (functionalFrom && functionalFrom <= date && date <= simulationDate
      ? 1
      : 0);
  return [...skilled, simulationDate]
    .map((date) => addDays(date, -1))
    .sort()
    .reverse()
    .reduce((best, date) => (valid(date) > valid(best) ? date : best));
}

function initialSalary(draft: AustraliaDraft): number | undefined {
  const noms = draft.employer?.nominations;
  return (
    noms?.['AU-186-TRT']?.annualSalary ?? noms?.['AU-186-DE']?.annualSalary
  );
}

function initialCitizenshipTest(draft: AustraliaDraft): boolean | undefined {
  const test = draft.citizenship?.test;
  if (!test || typeof test !== 'object') return undefined;
  const rule = auFamilyParameters.citizenshipTest.value;
  return test.correct >= rule.pass && test.valuesCorrect === rule.values;
}

// The latest completed income years in which a 491 or 494 was held, as the
// engine counts them: a later substantive grant ends an earlier open-ended visa.
function regionalIncomeYears(
  draft: AustraliaDraft,
  simulationDate: string,
  count: number,
): number[] {
  const yearEnd = auRegionalParameters.incomeYearEnd.value;
  const visas = (draft.visas ?? [])
    .filter((v) => v.subclass !== 'bridging' && v.subclass !== 'bridging-trt')
    .sort((a, b) => a.from.localeCompare(b.from));
  const first = Number(visas[0]?.from.slice(0, 4));
  const years: number[] = [];
  for (
    let year = Number(simulationDate.slice(0, 4));
    years.length < count && year >= first;
    year--
  ) {
    const end = `${year}-${yearEnd}`;
    const start = addDays(addYears(end, -1), 1);
    const held = visas.some((visa, i) => {
      const next = visas[i + 1];
      return (
        (visa.subclass === '491' || visa.subclass === '494') &&
        visa.from <= end &&
        (!visa.to || visa.to >= start) &&
        (!next || (next.from > start && next.from > visa.from))
      );
    });
    if (end < simulationDate && held) years.unshift(year);
  }
  return years;
}

export const australiaWhatIf: CountryWhatIf<AustraliaDraft, AustraliaWhatIf> = {
  focusControls: australiaFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial(stored) {
    const draft = activeAustraliaAnswers(stored);
    return {
      simulationDate: draft.simulationDate,
      noTrips: draft.noTrips === true,
      ieltsBand: undefined,
      annualSalary: initialSalary(draft),
      taxNoticeCount: undefined,
      citizenshipTestPassed: initialCitizenshipTest(draft),
      health: draft.publicInterest?.health,
    };
  },
  apply(stored, knobs) {
    const draft = activeAustraliaAnswers(stored);
    const simulationDate = validDate(knobs.simulationDate)
      ? knobs.simulationDate
      : draft.simulationDate;
    const next: AustraliaDraft = {
      ...draft,
      simulationDate,
      noTrips: knobs.noTrips || undefined,
    };

    if (knobs.ieltsBand !== undefined) {
      const band = knobs.ieltsBand;
      next.english = {
        ...draft.english,
        test: {
          name: 'ielts',
          date: englishTestDate(draft, simulationDate),
          format: 'approved',
          components: [band, band, band, band],
          overall: band,
        },
      };
    }

    // An untouched knob keeps each nomination's own salary and market rate.
    if (
      knobs.annualSalary !== undefined &&
      knobs.annualSalary !== initialSalary(draft)
    ) {
      const existing = draft.employer?.nominations;
      const patchNom = (
        nom?: NonNullable<
          NonNullable<AuFullRequest['employer']>['nominations']
        >['AU-186-TRT'],
      ) =>
        nom
          ? {
              ...nom,
              annualSalary: knobs.annualSalary,
              acceptedMarketRate: knobs.annualSalary,
            }
          : undefined;
      if (existing?.['AU-186-TRT'] || existing?.['AU-186-DE']) {
        next.employer = {
          ...draft.employer,
          nominations: {
            ...(existing['AU-186-TRT']
              ? { 'AU-186-TRT': patchNom(existing['AU-186-TRT']) }
              : {}),
            ...(existing['AU-186-DE']
              ? { 'AU-186-DE': patchNom(existing['AU-186-DE']) }
              : {}),
          },
        };
      }
    }

    if (knobs.taxNoticeCount !== undefined) {
      next.regional = {
        ...draft.regional,
        assessmentYears: regionalIncomeYears(
          draft,
          simulationDate,
          knobs.taxNoticeCount,
        ),
      };
    }

    if (knobs.citizenshipTestPassed !== initialCitizenshipTest(draft)) {
      const rule = auFamilyParameters.citizenshipTest.value;
      next.citizenship = {
        ...draft.citizenship,
        test:
          knobs.citizenshipTestPassed === undefined
            ? 'awaiting'
            : knobs.citizenshipTestPassed
              ? { correct: rule.total, valuesCorrect: rule.values }
              : { correct: rule.pass - 1, valuesCorrect: rule.values - 1 },
      };
    }

    if (knobs.health !== draft.publicInterest?.health) {
      next.publicInterest = {
        ...draft.publicInterest,
        health: knobs.health,
      };
    }

    return activeAustraliaAnswers(next);
  },
  validate(afterDraft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) {
      errors.date = 'au.whatif.invalidDates';
    }
    if (
      knobs.annualSalary !== undefined &&
      (!Number.isFinite(knobs.annualSalary) || knobs.annualSalary < 0)
    ) {
      errors.salary = 'au.whatif.invalidSalary';
    }
    // The comparison is shared like a submitted questionnaire, so it must pass
    // the same checks, such as a date of birth before the simulation date.
    if (
      !Object.keys(errors).length &&
      australiaSteps(afterDraft).some(
        ({ step }) =>
          Object.keys(validateAustraliaStep({ ...afterDraft, step })).length,
      )
    )
      errors.date = 'au.whatif.invalidDates';
    return errors;
  },
  Controls: AustraliaWhatIfControls,
};

export { australiaFull2026_11 };
