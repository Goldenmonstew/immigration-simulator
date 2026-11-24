import {
  resolveJapanDeemedTripStatuses,
  type JpFullReentryRequest,
} from '@uk-immigration/engine';
import { JapanWhatIfControls } from '../app/japan/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  japanSteps,
  validateJapanStep,
  withJapanFilingDate,
  type JapanDraft,
} from './japan-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

type ReentryRoute = JpFullReentryRequest['route'];
export interface JapanWhatIf {
  applicationDate: string;
  noTrips: boolean;
  prJapaneseB1?: boolean;
  prIncome?: number;
  prHousehold?: boolean;
  natJapanese?: boolean;
  natLivelihood?: boolean;
  interview?: boolean;
  returns: Partial<Record<ReentryRoute, string>>;
}

export const japanFocusControls = {
  date: 'jp-whatif-date',
  trips: 'jp-whatif-trips',
  prJapanese: 'jp-whatif-pr-japanese',
  income: 'jp-whatif-income',
  household: 'jp-whatif-household',
  natJapanese: 'jp-whatif-nat-japanese',
  livelihood: 'jp-whatif-livelihood',
  interview: 'jp-whatif-interview',
  ordinary: 'jp-whatif-ordinary',
  deemed: 'jp-whatif-deemed',
  'refugee-travel-document': 'jp-whatif-refugee-travel-document',
};

const focusByCondition: Record<string, keyof typeof japanFocusControls> = {
  'jp.pr.continuous-stay': 'date',
  'jp.pr.qualifying-status-stay': 'date',
  'jp.pr.married-life': 'date',
  'jp.pr.birth-filing-window': 'date',
  'jp.pr.old-guideline-absences': 'trips',
  'jp.pr.single-absence': 'trips',
  'jp.pr.total-absence': 'trips',
  'jp.pr.household-income': 'household',
  'jp.pr.japanese-language': 'prJapanese',
  'jp.nat.domicile-years': 'date',
  'jp.nat.residence-practice': 'date',
  'jp.nat.spouse-article-7': 'date',
  'jp.nat.japanese-language': 'natJapanese',
  'jp.nat.interview-and-assessment': 'interview',
  'jp.nat.livelihood': 'livelihood',
  'jp.reentry.ordinary-eligibility': 'date',
  'jp.reentry.deemed-validity': 'deemed',
};

const returnFocusByPath: Record<string, ReentryRoute> = {
  'jp.reentry.ordinary': 'ordinary',
  'jp.reentry.deemed': 'deemed',
  'jp.reentry.refugee-travel-document': 'refugee-travel-document',
};

export const japanWhatIf: CountryWhatIf<JapanDraft, JapanWhatIf> = {
  focusControls: japanFocusControls,
  focusForRule: (id, pathwayId) =>
    id === 'jp.reentry.return-continuity'
      ? returnFocusByPath[pathwayId]
      : focusByCondition[id],
  initial(draft) {
    const pr = draft.permanentResidence.evidence;
    const nat = draft.naturalisation.evidence;
    return {
      applicationDate: draft.applicationDate ?? draft.simulationDate,
      noTrips: false,
      prJapaneseB1: pr.japaneseB1Confirmed,
      prIncome: pr.applicantAnnualIncomeYen,
      prHousehold: pr.householdIncomeConfirmed,
      natJapanese: nat.japaneseLanguage?.authorityConfirmed,
      natLivelihood: nat.livelihoodConfirmed,
      interview: nat.requiredInterviewAndAssessmentComplete,
      returns: Object.fromEntries(
        draft.reentry.map((item) => [item.route, item.returnOn]),
      ),
    };
  },
  apply(draft, knobs) {
    const compared = withJapanFilingDate(
      draft,
      !draft.applicationDate && knobs.applicationDate === draft.simulationDate
        ? undefined
        : knobs.applicationDate,
    );
    const pr = compared.permanentResidence;
    const nat = compared.naturalisation;
    // Match the baseline itinerary before a control separates the two records.
    const travel =
      knobs.noTrips ||
      compared.reentry.some(
        (item) => knobs.returns[item.route] !== item.returnOn,
      )
        ? resolveJapanDeemedTripStatuses(compared.trips, compared.reentry)
        : compared;
    return {
      ...compared,
      trips: knobs.noTrips ? [] : travel.trips,
      permanentResidence: {
        ...pr,
        evidence: {
          ...pr.evidence,
          japaneseB1Confirmed: knobs.prJapaneseB1,
          applicantAnnualIncomeYen: knobs.prIncome,
          householdIncomeConfirmed: knobs.prHousehold,
        },
      },
      naturalisation: {
        ...nat,
        evidence: {
          ...nat.evidence,
          japaneseLanguage:
            nat.evidence.japaneseLanguage?.authorityConfirmed ===
            knobs.natJapanese
              ? nat.evidence.japaneseLanguage
              : {
                  ...nat.evidence.japaneseLanguage,
                  authorityConfirmed: knobs.natJapanese,
                },
          livelihoodConfirmed: knobs.natLivelihood,
          requiredInterviewAndAssessmentComplete: knobs.interview,
        },
      },
      reentry: travel.reentry.map((item) => ({
        ...item,
        returnOn: knobs.returns[item.route] || undefined,
      })),
    };
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.applicationDate)) errors.date = 'jp.error.date';
    if (
      knobs.prIncome !== undefined &&
      (!Number.isSafeInteger(knobs.prIncome) || knobs.prIncome < 0)
    )
      errors.income = 'jp.whatif.invalidIncome';
    for (const item of draft.reentry) {
      if (
        item.returnOn &&
        (!validDate(item.returnOn) ||
          (item.departureOn && item.returnOn < item.departureOn))
      )
        errors[item.route] = 'jp.whatif.invalidDates';
    }
    if (!Object.keys(errors).length) {
      for (const { step } of japanSteps(draft)) {
        if (Object.keys(validateJapanStep({ ...draft, step })).length) {
          errors.date = 'jp.whatif.invalidDates';
          break;
        }
      }
    }
    return errors;
  },
  Controls: JapanWhatIfControls,
};
