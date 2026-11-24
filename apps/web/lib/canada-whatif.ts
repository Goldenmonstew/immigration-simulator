import { CanadaWhatIfControls } from '../app/canada/whatif/controls';
import type { TranslationKey } from '../i18n';
import type { CanadaDraft } from './canada-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

type TestOutcome = NonNullable<
  NonNullable<
    NonNullable<CanadaDraft['answers']['residence']>['test']
  >['outcome']
>;
export interface CanadaWhatIf {
  simulationDate: string;
  tripFrom: string;
  tripTo: string;
  citizenshipLevel?: number;
  citizenshipTest?: TestOutcome;
  eeLanguage?: number;
  crs?: number;
  eeFunds?: number;
  aipFunds?: number;
  qcFunds?: number;
  qcFrench?: number;
  income?: number;
}

export const canadaFocusControls = {
  date: 'ca-whatif-date',
  trip: 'ca-whatif-trip-from',
  citizenshipLevel: 'ca-whatif-citizenship-level',
  citizenshipTest: 'ca-whatif-citizenship-test',
  eeLanguage: 'ca-whatif-ee-language',
  crs: 'ca-whatif-crs',
  eeFunds: 'ca-whatif-ee-funds',
  aipFunds: 'ca-whatif-aip-funds',
  qcFunds: 'ca-whatif-qc-funds',
  qcFrench: 'ca-whatif-qc-french',
  income: 'ca-whatif-income',
};

const focusByCondition: Record<string, keyof typeof canadaFocusControls> = {
  'CA-R03': 'date',
  'CA-R08': 'date',
  'CA-R10': 'citizenshipLevel',
  'CA-R11': 'citizenshipTest',
  'CA-R30': 'crs',
  'CA-R31': 'eeLanguage',
  'CA-R34': 'eeLanguage',
  'CA-R41': 'eeLanguage',
  'CA-R44': 'eeLanguage',
  'CA-R38': 'eeFunds',
  'CA-R59': 'aipFunds',
  'CA-R62': 'qcFunds',
  'CA-R64': 'qcFrench',
  'CA-R76': 'income',
};

const skills = ['listening', 'speaking', 'reading', 'writing'] as const;
// One level for several skills: the lowest decides the outcome.
function lowest(levels: Partial<Record<(typeof skills)[number], number>> = {}) {
  const values = skills.map((skill) => levels[skill]);
  return values.every((value) => value !== undefined)
    ? Math.min(...(values as number[]))
    : undefined;
}
const allSkills = (level: number) =>
  Object.fromEntries(skills.map((skill) => [skill, level]));

function initial(draft: CanadaDraft): CanadaWhatIf {
  const { residence, express, atlantic, quebec, family } = draft.answers;
  const language = residence?.language;
  return {
    simulationDate: draft.simulationDate,
    tripFrom: '',
    tripTo: '',
    citizenshipLevel:
      language?.speaking !== undefined && language.listening !== undefined
        ? Math.min(language.speaking, language.listening)
        : undefined,
    citizenshipTest: residence?.test?.outcome,
    eeLanguage: lowest(express?.primary?.levels),
    crs: express?.round?.confirmedCrs,
    eeFunds: express?.funds?.availableAtApplication,
    aipFunds: atlantic?.funds?.availableAtApplication,
    qcFunds: quebec?.availableFunds,
    qcFrench: lowest(quebec?.french),
    income: family?.federalIncome?.eligibleNoaIncome,
  };
}

// Only controls moved away from the questionnaire answers change the draft.
function apply(draft: CanadaDraft, knobs: CanadaWhatIf): CanadaDraft {
  const before = initial(draft);
  const changed = (key: keyof CanadaWhatIf) =>
    knobs[key] !== undefined && knobs[key] !== before[key];
  const answers = structuredClone(draft.answers);
  if (knobs.tripFrom && knobs.tripTo)
    answers.trips = [
      ...(answers.trips ?? []),
      { departed: knobs.tripFrom, returned: knobs.tripTo },
    ];
  if (changed('citizenshipLevel') || changed('citizenshipTest')) {
    const residence = (answers.residence ??= {});
    if (changed('citizenshipLevel'))
      residence.language = {
        ...residence.language,
        evidence: 'accepted-levels',
        speaking: knobs.citizenshipLevel,
        listening: knobs.citizenshipLevel,
      };
    if (changed('citizenshipTest'))
      residence.test = { ...residence.test, outcome: knobs.citizenshipTest };
  }
  if (changed('eeLanguage'))
    (answers.express ??= {}).primary = {
      ...answers.express?.primary,
      levels: allSkills(knobs.eeLanguage!),
    };
  if (changed('crs') && answers.express?.round)
    answers.express.round.confirmedCrs = knobs.crs;
  if (changed('eeFunds'))
    (answers.express ??= {}).funds = {
      ...answers.express?.funds,
      availableAtApplication: knobs.eeFunds,
    };
  if (changed('aipFunds'))
    (answers.atlantic ??= {}).funds = {
      ...answers.atlantic?.funds,
      availableAtApplication: knobs.aipFunds,
    };
  if (changed('qcFunds'))
    (answers.quebec ??= {}).availableFunds = knobs.qcFunds;
  if (changed('qcFrench'))
    (answers.quebec ??= {}).french = {
      evidence: 'approved-test',
      ...answers.quebec?.french,
      ...allSkills(knobs.qcFrench!),
    };
  if (changed('income'))
    (answers.family ??= {}).federalIncome = {
      ...answers.family?.federalIncome,
      eligibleNoaIncome: knobs.income,
    };
  return { ...draft, simulationDate: knobs.simulationDate, answers };
}

function validate(_: CanadaDraft, knobs: CanadaWhatIf) {
  const errors: Record<string, TranslationKey> = {};
  if (!validDate(knobs.simulationDate)) errors.date = 'ca.error.date';
  if (
    (knobs.tripFrom || knobs.tripTo) &&
    !(
      validDate(knobs.tripFrom) &&
      validDate(knobs.tripTo) &&
      knobs.tripFrom <= knobs.tripTo
    )
  )
    errors.trip = 'ca.whatif.invalidDates';
  for (const key of [
    'citizenshipLevel',
    'eeLanguage',
    'crs',
    'eeFunds',
    'aipFunds',
    'qcFunds',
    'qcFrench',
    'income',
  ] as const) {
    const value = knobs[key];
    if (value !== undefined && !(Number.isFinite(value) && value >= 0))
      errors[key] = 'ca.whatif.invalidNumber';
  }
  return errors;
}

export const canadaWhatIf: CountryWhatIf<CanadaDraft, CanadaWhatIf> = {
  focusControls: canadaFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial,
  apply,
  validate,
  Controls: CanadaWhatIfControls,
};
