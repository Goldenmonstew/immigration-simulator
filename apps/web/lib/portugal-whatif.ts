import type { PtLanguageEvidence } from '@uk-immigration/engine';
import { portugalFull2026_11 } from '@uk-immigration/policy-data';
import { PortugalWhatIfControls } from '../app/portugal/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activePortugalAnswers,
  portugalStepList,
  validatePortugalStep,
  type PortugalDraft,
} from './portugal-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export interface PortugalWhatIf {
  simulationDate: string;
  noTrips: boolean;
  natLanguage?: boolean;
  natKnowledge?: boolean;
  residenceLanguage?: boolean;
  income?: number;
}

export const portugalFocusControls = {
  date: 'pt-whatif-date',
  trips: 'pt-whatif-trips',
  natLanguage: 'pt-whatif-nat-language',
  natKnowledge: 'pt-whatif-nat-knowledge',
  residenceLanguage: 'pt-whatif-residence-language',
  income: 'pt-whatif-income',
};

const focusByCondition: Record<string, keyof typeof portugalFocusControls> = {
  'PT-A01': 'date',
  'PT-A02': 'date',
  'PT-A02-CURRENT-ALTERNATIVE': 'date',
  'PT-A12': 'date',
  'PT-B01': 'date',
  'PT-C01': 'date',
  'PT-C03': 'date',
  'PT-D07-WINDOW': 'date',
  'PT-D07-STAY': 'date',
  'PT-D10': 'date',
  'PT-E01': 'date',
  'PT-F02': 'date',
  'PT-G01': 'date',
  'PT-G02': 'date',
  'PT-B01-CANCELLATION-RISK': 'trips',
  'PT-C01-SINGLE-ABSENCE': 'trips',
  'PT-C01-TOTAL-ABSENCE': 'trips',
  'PT-A03': 'natLanguage',
  'PT-A04': 'natKnowledge',
  'PT-A05': 'natKnowledge',
  'PT-B05': 'residenceLanguage',
  'PT-C07': 'residenceLanguage',
  // ARI (D02) and most renewal purposes (E02) need an authority finding on
  // means, so income alone does not change them.
  'PT-B03': 'income',
  'PT-C04': 'income',
};

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const basicLevel = portugalFull2026_11.values.basicPortuguese.value;

// The proof as both residence routes read it (B05, C07); a kind they read
// differently stays unknown and keeps the questionnaire's answer.
function languageAccepted(language?: PtLanguageEvidence) {
  switch (language?.kind) {
    case 'accepted':
    case 'ciple':
    case 'portuguese-school':
      return true;
    case 'pla':
      return language.recognized === false ||
        (language.level !== undefined &&
          levels.indexOf(language.level) < levels.indexOf(basicLevel))
        ? false
        : language.recognized && language.level !== undefined
          ? true
          : undefined;
    case 'basic-course':
      return language.recognized ? true : undefined;
    case 'none':
      return language.accommodationRequested ? undefined : false;
  }
}

function initial(stored: PortugalDraft): PortugalWhatIf {
  const draft = activePortugalAnswers(stored);
  const nat = draft.nationality;
  return {
    simulationDate: draft.simulationDate,
    noTrips: false,
    natLanguage: nat.newLanguageAccepted,
    natKnowledge:
      nat.cultureAccepted === nat.civicsAccepted
        ? nat.cultureAccepted
        : undefined,
    residenceLanguage: languageAccepted(draft.residence.language),
    income: draft.residence.means?.monthlyEligibleEur,
  };
}

export const portugalWhatIf: CountryWhatIf<PortugalDraft, PortugalWhatIf> = {
  focusControls: portugalFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial,
  // Each control replaces its answers only after it is changed, so an
  // untouched comparison keeps the questionnaire's own evidence.
  apply(stored, knobs) {
    const draft = activePortugalAnswers(stored);
    const before = initial(stored);
    const next: PortugalDraft = {
      ...draft,
      simulationDate: knobs.simulationDate,
    };
    if (knobs.noTrips) {
      if (draft.trips) next.trips = [];
      if (draft.freeMovement.absences)
        next.freeMovement = { ...draft.freeMovement, absences: [] };
    }
    if (knobs.natLanguage !== before.natLanguage)
      next.nationality = {
        ...next.nationality,
        newLanguageAccepted: knobs.natLanguage,
      };
    if (knobs.natKnowledge !== before.natKnowledge)
      next.nationality = {
        ...next.nationality,
        cultureAccepted: knobs.natKnowledge,
        civicsAccepted: knobs.natKnowledge,
      };
    if (knobs.residenceLanguage !== before.residenceLanguage)
      next.residence = {
        ...next.residence,
        language:
          knobs.residenceLanguage === undefined
            ? undefined
            : { kind: knobs.residenceLanguage ? 'accepted' : 'none' },
      };
    if (knobs.income !== before.income)
      next.residence = {
        ...next.residence,
        means: { ...next.residence.means, monthlyEligibleEur: knobs.income },
      };
    return activePortugalAnswers(next);
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'pt.error.date';
    if (
      knobs.income !== undefined &&
      (!Number.isFinite(knobs.income) || knobs.income < 0)
    )
      errors.income = 'pt.error.number';
    if (Object.keys(errors).length) return errors;
    for (const { step } of portugalStepList(draft)) {
      const issues = Object.values(validatePortugalStep({ ...draft, step }));
      if (issues.length) {
        errors.date = issues.includes('pt.error.afterSimulation')
          ? 'pt.error.afterSimulation'
          : 'pt.whatif.invalid';
        break;
      }
    }
    return errors;
  },
  Controls: PortugalWhatIfControls,
};
