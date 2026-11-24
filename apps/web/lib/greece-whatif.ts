import { GreeceWhatIfControls } from '../app/greece/whatif/controls';
import type { TranslationKey } from '../i18n';
import { activeGreeceAnswers, type GreeceDraft } from './greece-draft';
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

export interface GreeceWhatIf {
  simulationDate: string;
  noTrips: boolean;
  greekLevel?: GreekLevel;
  examPassed?: boolean;
  netEur?: number;
  grossAnnualEur?: number;
  sponsorPersonalNetEur?: number;
  qualifyingValueEur?: number;
}

export const greeceFocusControls = {
  date: 'gr-whatif-date',
  trips: 'gr-whatif-trips',
  language: 'gr-whatif-language',
  exam: 'gr-whatif-exam',
  income: 'gr-whatif-income',
  salary: 'gr-whatif-salary',
  sponsorIncome: 'gr-whatif-sponsor-income',
  investment: 'gr-whatif-investment',
};
type Focus = keyof typeof greeceFocusControls;

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
  'WK-01': 'salary',
  'WK-04': 'salary',
  'FT-02': 'sponsorIncome',
  'GV-01': 'investment',
};

// "No trips" also clears the absence summaries that were answered.
function withoutAbsences(draft: GreeceDraft): GreeceDraft {
  const zero = <T extends object>(record: T | undefined, keys: (keyof T)[]) => {
    if (!record) return record;
    const next = { ...record };
    for (const key of keys)
      if (next[key] !== undefined) next[key] = 0 as T[keyof T];
    return next;
  };
  const greekFamily = zero(draft.greekFamily, [
    'longestAbsenceAfterPrYears',
    'longestConsecutiveAbsenceYears',
    'maxAnnualAbsenceMonths',
  ]);
  if (greekFamily) delete greekFamily.extendedAbsence;
  const euFamily = zero(draft.euFamily, [
    'longestAbsenceAfterPrYears',
    'maxOrdinaryAnnualAbsenceMonths',
    'seriousAbsenceCount',
  ]);
  if (euFamily) delete euFamily.maxSeriousAbsenceMonths;
  return {
    ...draft,
    trips: [],
    tripsComplete: true,
    longTerm: zero(draft.longTerm, [
      'continuousOutsideEuMonths',
      'continuousOutsideGreeceYears',
    ]),
    greekFamily,
    euFamily,
  };
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
    const exam = draft.nationality?.exam;
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      greekLevel:
        draft.integration?.basis === 'language'
          ? draft.integration.greekLevel
          : undefined,
      examPassed:
        exam === 'certificate'
          ? true
          : exam === 'not-passed'
            ? false
            : undefined,
      netEur: draft.residenceIncome?.netEur,
      grossAnnualEur: draft.work?.grossAnnualEur,
      sponsorPersonalNetEur: draft.familyTcn?.sponsorPersonalNetEur,
      qualifyingValueEur: draft.goldenVisa?.qualifyingValueEur,
    };
  },
  // Only knobs moved away from the questionnaire answers change the copy.
  apply(stored, knobs) {
    const base = greeceWhatIf.initial(stored);
    let draft: GreeceDraft = {
      ...activeGreeceAnswers(stored),
      simulationDate: knobs.simulationDate,
    };
    if (knobs.noTrips) draft = withoutAbsences(draft);
    if (knobs.greekLevel !== base.greekLevel)
      draft.integration = knobs.greekLevel
        ? { basis: 'language', greekLevel: knobs.greekLevel }
        : undefined;
    if (knobs.examPassed !== base.examPassed)
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
    if (knobs.sponsorPersonalNetEur !== base.sponsorPersonalNetEur)
      draft.familyTcn = {
        ...draft.familyTcn,
        sponsorPersonalNetEur: knobs.sponsorPersonalNetEur,
      };
    if (knobs.qualifyingValueEur !== base.qualifyingValueEur)
      draft.goldenVisa = {
        ...draft.goldenVisa,
        qualifyingValueEur: knobs.qualifyingValueEur,
      };
    return draft;
  },
  validate(_draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'gr.whatif.invalidDate';
    for (const key of [
      'netEur',
      'grossAnnualEur',
      'sponsorPersonalNetEur',
      'qualifyingValueEur',
    ] as const) {
      const value = knobs[key];
      if (value !== undefined && (!Number.isFinite(value) || value < 0))
        errors[key] = 'gr.whatif.invalidAmount';
    }
    return errors;
  },
  Controls: GreeceWhatIfControls,
};
