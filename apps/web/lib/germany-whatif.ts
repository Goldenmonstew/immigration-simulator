import type { CefrLevel } from '@uk-immigration/engine';
import { GermanyWhatIfControls } from '../app/germany/whatif/controls';
import type { TranslationKey } from '../i18n';
import { activeGermanyAnswers, type GermanyDraft } from './germany-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export type GermanyWhatIfLevel = CefrLevel | 'none';

export interface GermanyWhatIf {
  simulationDate: string;
  noTrips: boolean;
  provenGerman?: GermanyWhatIfLevel;
  orientationScore?: number;
  contributionMonths?: number;
  blueCardMonths?: number;
  annualGrossSalary?: number;
  livelihoodConfirmed?: boolean;
}

export const germanyFocusControls = {
  date: 'de-whatif-date',
  trips: 'de-whatif-trips',
  german: 'de-whatif-german',
  knowledge: 'de-whatif-knowledge',
  contributions: 'de-whatif-contributions',
  blueCardMonths: 'de-whatif-blue-card-months',
  salary: 'de-whatif-salary',
  livelihood: 'de-whatif-livelihood',
};

const focusByCondition: Record<string, keyof typeof germanyFocusControls> = {
  'DE-C13': 'date',
  'DE-C15-time': 'date',
  'DE-C19-time': 'date',
  'DE-C22-time': 'date',
  'DE-C25-time': 'date',
  'DE-C26-time': 'date',
  'DE-C28': 'date',
  'DE-C32-time': 'date',
  'DE-C34-time': 'date',
  'DE-C36-time': 'date',
  'DE-C38-time': 'date',
  'DE-C41-time': 'date',
  'DE-C42-time': 'date',
  'DE-C44': 'date',
  'DE-C46-application': 'date',
  'DE-C55': 'date',
  'DE-C56-time': 'date',
  'DE-C11-deadline': 'date',
  'DE-C63-time': 'trips',
  'DE-C63': 'trips',
  'DE-C63-current': 'trips',
  'DE-C64-settlement': 'trips',
  'DE-C64-eu-long-term': 'trips',
  'DE-C45': 'trips',
  'DE-C08': 'german',
  'DE-C20': 'german',
  'DE-C36-language': 'german',
  'DE-C50': 'german',
  'DE-C09': 'knowledge',
  'DE-C51': 'knowledge',
  'DE-C61-guidance': 'knowledge',
  'DE-C05': 'contributions',
  'DE-C17': 'contributions',
  'DE-C30-pension': 'contributions',
  'DE-C19-months': 'blueCardMonths',
  'DE-C21-pay': 'salary',
  'DE-C16-initial': 'salary',
  'DE-C03': 'livelihood',
  'DE-C25': 'livelihood',
  'DE-C26': 'livelihood',
  'DE-C29-income': 'livelihood',
  'DE-C36-livelihood': 'livelihood',
  'DE-C42-maintenance': 'livelihood',
  'DE-C49': 'livelihood',
  'DE-C60': 'livelihood',
};

const cefrOrder: GermanyWhatIfLevel[] = [
  'none',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
];
const atLeastLevel = (
  level: GermanyWhatIfLevel | undefined,
  target: CefrLevel,
) =>
  level === undefined
    ? undefined
    : cefrOrder.indexOf(level) >= cefrOrder.indexOf(target);

export const germanyWhatIf: CountryWhatIf<GermanyDraft, GermanyWhatIf> = {
  focusControls: germanyFocusControls,
  focusForRule(id) {
    if (id.startsWith('DE-C63-') || id.startsWith('DE-C64-')) return 'trips';
    return focusByCondition[id];
  },
  initial(stored) {
    const draft = activeGermanyAnswers(stored);
    const common = draft.common ?? {};
    const nat = draft.citizenship ?? {};
    const blue = draft.mobility?.blueCard;
    const natLevel =
      nat.germanEvidence &&
      nat.germanEvidence !== 'accepted-equivalent' &&
      nat.germanEvidence !== 'pending'
        ? nat.germanEvidence
        : undefined;
    const blueLevel = blue?.language === 'below-A1' ? 'none' : blue?.language;
    const provenGerman =
      common.provenGerman ??
      blueLevel ??
      natLevel ??
      (draft.germanC1 ? 'C1' : draft.germanB1 ? 'B1' : undefined);
    const natScore =
      nat.knowledge && 'correct' in nat.knowledge
        ? nat.knowledge.correct
        : undefined;
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      provenGerman,
      orientationScore: common.orientationScore ?? natScore,
      contributionMonths: draft.contributionMonths,
      blueCardMonths: draft.blueCardEmploymentMonths,
      annualGrossSalary:
        blue?.countableAnnualGross ??
        draft.settlement?.initialSkilledPermit?.annualGrossSalary,
      livelihoodConfirmed:
        common.livelihoodConfirmed ?? nat.sustainableHouseholdSupport,
    };
  },
  apply(stored, knobs) {
    const draft = activeGermanyAnswers(stored);
    const base = germanyWhatIf.initial(draft);
    const common = { ...draft.common };
    const settlement = { ...draft.settlement };
    const mobility = { ...draft.mobility };
    const citizenship = { ...draft.citizenship };

    if (knobs.provenGerman !== base.provenGerman) {
      common.provenGerman = knobs.provenGerman;
      citizenship.germanEvidence = knobs.provenGerman;
      if (mobility.blueCard || draft.routes.includes('R03')) {
        mobility.blueCard = {
          ...mobility.blueCard,
          language:
            knobs.provenGerman === 'none' ? 'below-A1' : knobs.provenGerman,
          fastTrack: atLeastLevel(knobs.provenGerman, 'B1'),
        };
      }
      if (draft.routes.includes('R11')) {
        settlement.childLanguageB1 = atLeastLevel(knobs.provenGerman, 'B1');
      }
    }

    if (knobs.orientationScore !== base.orientationScore) {
      common.orientationScore = knobs.orientationScore;
      citizenship.knowledge =
        knobs.orientationScore === undefined
          ? undefined
          : { kind: 'naturalisation-test', correct: knobs.orientationScore };
    }

    if (knobs.livelihoodConfirmed !== base.livelihoodConfirmed) {
      common.livelihoodConfirmed = knobs.livelihoodConfirmed;
      if (knobs.livelihoodConfirmed !== undefined) {
        common.benefits = knobs.livelihoodConfirmed
          ? 'none-or-permitted'
          : 'disqualifying-entitlement';
      }
      settlement.euRegularIncome = knobs.livelihoodConfirmed;
      settlement.childSecureLivelihood = knobs.livelihoodConfirmed;
      if (draft.routes.includes('R05') || draft.routes.includes('R05-fast')) {
        const decision =
          knobs.livelihoodConfirmed === undefined
            ? undefined
            : knobs.livelihoodConfirmed
              ? 'accepted'
              : 'refused';
        settlement.refugeeIncome = {
          ...settlement.refugeeIncome,
          ordinaryDecision: decision,
          acceleratedDecision: decision,
        };
      }
      if (draft.routes.includes('R15')) {
        settlement.formerSpouseMaintenance =
          knobs.livelihoodConfirmed === undefined
            ? undefined
            : knobs.livelihoodConfirmed
              ? 'own-funds-enforceable-and-sufficient'
              : 'insufficient';
      }
      citizenship.sustainableHouseholdSupport = knobs.livelihoodConfirmed;
      citizenship.withoutSgbIIorXII = knobs.livelihoodConfirmed;
      if (citizenship.discretionary || draft.routes.includes('R17')) {
        citizenship.discretionary = {
          ...citizenship.discretionary,
          sustainableSupportIncludingInsurance: knobs.livelihoodConfirmed,
        };
      }
    }

    if (knobs.annualGrossSalary !== base.annualGrossSalary) {
      if (mobility.blueCard || draft.routes.includes('R03')) {
        mobility.blueCard = {
          ...mobility.blueCard,
          countableAnnualGross: knobs.annualGrossSalary,
        };
      }
      if (settlement.initialSkilledPermit) {
        settlement.initialSkilledPermit = {
          ...settlement.initialSkilledPermit,
          annualGrossSalary: knobs.annualGrossSalary,
        };
      }
    }

    const blueCardMonthsChanged = knobs.blueCardMonths !== base.blueCardMonths;
    if (blueCardMonthsChanged && mobility.blueCard?.employment) {
      const rest = { ...mobility.blueCard };
      delete rest.employment;
      mobility.blueCard = rest;
    }

    if (knobs.noTrips) {
      if (mobility.titles) {
        mobility.titles = mobility.titles.map((t) => ({ ...t, trips: [] }));
      }
      if (mobility.freedom) {
        mobility.freedom = {
          ...mobility.freedom,
          annualOrdinaryAbsenceMonths: [],
          importantAbsences: [],
          subsequentTrips: [],
        };
      }
    }

    return activeGermanyAnswers({
      ...draft,
      simulationDate: knobs.simulationDate,
      trips: knobs.noTrips ? [] : draft.trips,
      permits: knobs.noTrips
        ? draft.permits?.map((p) => {
            const copy = { ...p };
            delete copy.trips;
            return copy;
          })
        : draft.permits,
      contributionMonths: knobs.contributionMonths,
      blueCardEmploymentMonths: knobs.blueCardMonths,
      germanB1:
        knobs.provenGerman !== base.provenGerman
          ? atLeastLevel(knobs.provenGerman, 'B1')
          : draft.germanB1,
      germanC1:
        knobs.provenGerman !== base.provenGerman
          ? atLeastLevel(knobs.provenGerman, 'C1')
          : draft.germanC1,
      common,
      settlement,
      mobility,
      citizenship,
    });
  },
  validate(_draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'de.whatif.invalidDate';
    if (
      knobs.orientationScore !== undefined &&
      (!Number.isSafeInteger(knobs.orientationScore) ||
        knobs.orientationScore < 0 ||
        knobs.orientationScore > 33)
    )
      errors.knowledge = 'de.whatif.invalidScore';
    if (
      knobs.contributionMonths !== undefined &&
      (!Number.isSafeInteger(knobs.contributionMonths) ||
        knobs.contributionMonths < 0)
    )
      errors.contributions = 'de.whatif.invalidMonths';
    if (
      knobs.blueCardMonths !== undefined &&
      (!Number.isSafeInteger(knobs.blueCardMonths) || knobs.blueCardMonths < 0)
    )
      errors.blueCardMonths = 'de.whatif.invalidMonths';
    if (
      knobs.annualGrossSalary !== undefined &&
      (!Number.isFinite(knobs.annualGrossSalary) || knobs.annualGrossSalary < 0)
    )
      errors.salary = 'de.whatif.invalidSalary';
    return errors;
  },
  Controls: GermanyWhatIfControls,
};
