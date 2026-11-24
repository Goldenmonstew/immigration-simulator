import {
  auFamilyParameters,
  auRegionalParameters,
  australiaFull2026_11,
} from '@uk-immigration/policy-data';
import type { AuFullRequest } from '@uk-immigration/engine';
import { AustraliaWhatIfControls } from '../app/australia/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeAustraliaAnswers,
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

function dayBefore(isoDate: string): string {
  const ms = Date.parse(`${isoDate}T00:00:00Z`);
  if (!Number.isFinite(ms)) return isoDate;
  return new Date(ms - 86_400_000).toISOString().slice(0, 10);
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

function qualifyingYearsForCount(
  draft: AustraliaDraft,
  simulationDate: string,
  count: number,
): number[] {
  const endMonthDay = auRegionalParameters.incomeYearEnd.value;
  const endYear = Number(simulationDate.slice(0, 4));
  const lastCompletedYear =
    `${endYear}-${endMonthDay}` < simulationDate ? endYear : endYear - 1;
  const years: number[] = [];
  for (let i = count - 1; i >= 0; i--) {
    years.push(lastCompletedYear - i);
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
      const inv189 = draft.skills?.invitations?.['AU-189-PT'];
      const inv190 = draft.skills?.invitations?.['AU-190'];
      const dates = [
        simulationDate,
        typeof inv189 === 'object' ? inv189.issued : undefined,
        typeof inv190 === 'object' ? inv190.issued : undefined,
      ].filter((d): d is string => !!d && validDate(d));
      const earliest = dates.sort()[0] ?? simulationDate;
      const band = knobs.ieltsBand;
      next.english = {
        ...draft.english,
        test: {
          name: 'ielts',
          date: dayBefore(earliest),
          format: 'approved',
          components: [band, band, band, band],
          overall: band,
        },
      };
    }

    if (knobs.annualSalary !== undefined) {
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
        assessmentYears: qualifyingYearsForCount(
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
  validate(_afterDraft, knobs) {
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
    return errors;
  },
  Controls: AustraliaWhatIfControls,
};

export { australiaFull2026_11 };
