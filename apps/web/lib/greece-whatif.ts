import { greeceFull2026_11 } from '@uk-immigration/policy-data';
import { GreeceWhatIfControls } from '../app/greece/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeGreeceAnswers,
  greeceSteps,
  validateGreeceStep,
  type GreeceDraft,
} from './greece-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export const greekLevels = [
  'legacy-A',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
] as const;
export type GreekLevel = (typeof greekLevels)[number];
// A questionnaire answer that the language or exam select has no option for.
export const asAnswered = 'answered';

export interface GreeceWhatIf {
  simulationDate: string;
  noTrips: boolean;
  greekLevel?: GreekLevel | typeof asAnswered;
  examPassed?: boolean | typeof asAnswered;
  netEur?: number;
  grossAnnualEur?: number;
  grossPayEur?: number;
  sponsorPersonalNetEur?: number;
  sponsorEvidence?: boolean;
  qualifyingValueEur?: number;
  // Read-only facts about the questionnaire answers, set by initial().
  answered: {
    language: boolean;
    exam: boolean;
    // Some periods were given as years on the questionnaire date.
    yearCounts: boolean;
  };
}

export const greeceFocusControls = {
  date: 'gr-whatif-date',
  trips: 'gr-whatif-trips',
  language: 'gr-whatif-language',
  exam: 'gr-whatif-exam',
  income: 'gr-whatif-income',
  salary: 'gr-whatif-salary',
  pay: 'gr-whatif-pay',
  sponsor: 'gr-whatif-sponsor',
  investment: 'gr-whatif-investment',
};
type Focus = keyof typeof greeceFocusControls;

// Each condition points at the knob that changes an answer it reads. WK-01 has
// none: outside the year of the published salary threshold it stays unknown (PD-317).
const focusByCondition: Record<string, Focus> = {
  'LT-TIME-SINGLE-ABSENCE': 'trips',
  'LT-TIME-TOTAL-ABSENCE': 'trips',
  'LT-07': 'trips',
  'TY-05': 'trips',
  'GF-08': 'trips',
  'EF-03': 'trips',
  'EF-07': 'trips',
  'C-07-window': 'date',
  'NAT-01': 'date',
  'NAT-11': 'date',
  'TY-01': 'date',
  'GF-03': 'date',
  'EF-02': 'date',
  'FT-07': 'date',
  'LT-04': 'language',
  'TY-02': 'language',
  'LT-INTEGRATION-DOCUMENT': 'language',
  'TY-INTEGRATION-DOCUMENT': 'language',
  'NAT-05': 'exam',
  'NAT-06': 'exam',
  'LT-02': 'income',
  'TY-04': 'income',
  'WK-04': 'pay',
  'FT-02': 'sponsor',
  'GV-01': 'investment',
};

// The engine compares the annual Blue Card salary only in the year of the
// last published threshold.
export const salaryYearPublished = (date: string) =>
  Number(date.slice(0, 4)) ===
  greeceFull2026_11.values.workBlueSalary.value.lastPublishedYear;

// Answer each absence summary with zero. The engine reads a summary only with
// all its parts, so a partly answered one is answered in full. Details that
// explain an excess are cleared.
function noAbsence<T extends object>(
  record: T | undefined,
  summaries: string[][],
  details: string[] = [],
): T | undefined {
  if (!record) return record;
  const next = { ...record } as Record<string, unknown>;
  for (const keys of summaries)
    if (keys.some((key) => next[key] !== undefined))
      for (const key of keys) next[key] = 0;
  for (const key of details) delete next[key];
  return next as T;
}

function withoutAbsences(draft: GreeceDraft): GreeceDraft {
  return {
    ...draft,
    trips: [],
    tripsComplete: true,
    longTerm: noAbsence(draft.longTerm, [
      ['continuousOutsideEuMonths'],
      ['continuousOutsideGreeceYears'],
    ]),
    // An interruption of residence after the card expired is time outside Greece.
    greekFamily: noAbsence(
      draft.greekFamily,
      [
        ['longestAbsenceAfterPrYears'],
        ['longestConsecutiveAbsenceYears'],
        ['interruptionAfterExpiryYears'],
        ['maxAnnualAbsenceMonths'],
      ],
      ['extendedAbsence', 'extendedAbsenceMonths'],
    ),
    euFamily: noAbsence(draft.euFamily, [
      ['longestAbsenceAfterPrYears'],
      [
        'maxOrdinaryAnnualAbsenceMonths',
        'seriousAbsenceCount',
        'maxSeriousAbsenceMonths',
      ],
    ]),
  };
}

type FamilyTcn = NonNullable<GreeceDraft['familyTcn']>;
// Years counted up to the questionnaire date, with the start date the engine
// prefers. Residence before a sponsor's death does not move with the date.
const familyYearCounts: [keyof FamilyTcn, keyof FamilyTcn][] = [
  ['sponsorLawfulYears', 'sponsorLawfulFrom'],
  ['familyResidenceYears', 'familyResidenceFrom'],
  ['yearsSinceFirstFamilyPermit', 'firstFamilyPermitIssuedOn'],
  ['blueFamilyYearsInEU', 'blueFamilyResidenceFrom'],
];
function yearCounts(draft: GreeceDraft) {
  const family = draft.familyTcn ?? {};
  return {
    work: draft.work?.blueCardYears !== undefined,
    family: familyYearCounts.flatMap(([years, from]) =>
      family[years] !== undefined &&
      !family[from] &&
      !(
        years === 'familyResidenceYears' &&
        family.autonomousBasis === 'bereavement'
      )
        ? [years]
        : [],
    ),
  };
}

// On another date such a count is unknown, as it would be on the questionnaire.
function withoutYearCounts(draft: GreeceDraft): GreeceDraft {
  const counts = yearCounts(draft);
  const next = { ...draft };
  if (counts.work) {
    next.work = { ...draft.work };
    delete next.work.blueCardYears;
  }
  if (counts.family.length) {
    next.familyTcn = { ...draft.familyTcn };
    for (const key of counts.family) delete next.familyTcn[key];
  }
  return next;
}

export const greeceWhatIf: CountryWhatIf<GreeceDraft, GreeceWhatIf> = {
  focusControls: greeceFocusControls,
  focusForRule(id) {
    if (id in focusByCondition) return focusByCondition[id];
    if (id.endsWith('-TIME') || id.includes('-TIME-')) return 'date';
    return undefined;
  },
  initial(stored) {
    const draft = activeGreeceAnswers(stored);
    const integration = draft.integration;
    const exam = draft.nationality?.exam;
    const counts = yearCounts(draft);
    const answered = {
      language: !!integration?.basis && integration.basis !== 'language',
      exam: !!exam && exam !== 'certificate' && exam !== 'not-passed',
      yearCounts: counts.work || counts.family.length > 0,
    };
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      greekLevel: answered.language
        ? asAnswered
        : integration?.basis === 'language'
          ? integration.greekLevel
          : undefined,
      examPassed: answered.exam
        ? asAnswered
        : exam === 'certificate'
          ? true
          : exam === 'not-passed'
            ? false
            : undefined,
      netEur: draft.residenceIncome?.netEur,
      grossAnnualEur: draft.work?.grossAnnualEur,
      grossPayEur: draft.work?.grossPayEur,
      sponsorPersonalNetEur: draft.familyTcn?.sponsorPersonalNetEur,
      sponsorEvidence: draft.familyTcn?.priorYearTaxAndInsuranceEvidence,
      qualifyingValueEur: draft.goldenVisa?.qualifyingValueEur,
      answered,
    };
  },
  // Only knobs moved away from the questionnaire answers change the copy.
  apply(stored, knobs) {
    const base = greeceWhatIf.initial(stored);
    let draft: GreeceDraft = {
      ...activeGreeceAnswers(stored),
      simulationDate: knobs.simulationDate,
    };
    if (knobs.simulationDate !== base.simulationDate)
      draft = withoutYearCounts(draft);
    if (knobs.noTrips) draft = withoutAbsences(draft);
    if (knobs.greekLevel !== base.greekLevel && knobs.greekLevel !== asAnswered)
      draft.integration = knobs.greekLevel
        ? { basis: 'language', greekLevel: knobs.greekLevel }
        : undefined;
    if (knobs.examPassed !== base.examPassed && knobs.examPassed !== asAnswered)
      draft.nationality = {
        ...draft.nationality,
        exam:
          knobs.examPassed === undefined
            ? undefined
            : knobs.examPassed
              ? 'certificate'
              : 'not-passed',
        knowledgeDocumentReady: knobs.examPassed,
      };
    if (knobs.netEur !== base.netEur)
      draft.residenceIncome = {
        ...draft.residenceIncome,
        netEur: knobs.netEur,
      };
    if (knobs.grossAnnualEur !== base.grossAnnualEur)
      draft.work = { ...draft.work, grossAnnualEur: knobs.grossAnnualEur };
    if (knobs.grossPayEur !== base.grossPayEur)
      draft.work = { ...draft.work, grossPayEur: knobs.grossPayEur };
    if (knobs.sponsorPersonalNetEur !== base.sponsorPersonalNetEur)
      draft.familyTcn = {
        ...draft.familyTcn,
        sponsorPersonalNetEur: knobs.sponsorPersonalNetEur,
      };
    if (knobs.sponsorEvidence !== base.sponsorEvidence)
      draft.familyTcn = {
        ...draft.familyTcn,
        priorYearTaxAndInsuranceEvidence: knobs.sponsorEvidence,
      };
    if (knobs.qualifyingValueEur !== base.qualifyingValueEur)
      draft.goldenVisa = {
        ...draft.goldenVisa,
        qualifyingValueEur: knobs.qualifyingValueEur,
      };
    return draft;
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'gr.whatif.invalidDate';
    for (const key of [
      'netEur',
      'grossAnnualEur',
      'grossPayEur',
      'sponsorPersonalNetEur',
      'qualifyingValueEur',
    ] as const) {
      const value = knobs[key];
      if (value !== undefined && (!Number.isFinite(value) || value < 0))
        errors[key] = 'gr.whatif.invalidAmount';
    }
    // The copy is checked like the questionnaire. Only the date can make it
    // invalid, for example by falling before the date of birth.
    if (!Object.keys(errors).length)
      for (const { step } of greeceSteps(draft)) {
        const issues = validateGreeceStep({ ...draft, step });
        if (Object.keys(issues).length) {
          errors.date = issues['gr-birthDate'] ?? 'gr.whatif.invalidDate';
          break;
        }
      }
    return errors;
  },
  Controls: GreeceWhatIfControls,
};
