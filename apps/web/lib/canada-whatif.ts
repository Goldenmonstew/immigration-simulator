import { CanadaWhatIfControls } from '../app/canada/whatif/controls';
import type { TranslationKey } from '../i18n';
import type { CanadaDraft } from './canada-draft';
import { maxLevel } from './canada-fields';
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
  'CA-R34': 'eeLanguage',
  'CA-R41': 'eeLanguage',
  'CA-R44': 'eeLanguage',
  'CA-R38': 'eeFunds',
  'CA-R59': 'aipFunds',
  'CA-R62': 'qcFunds',
  'CA-R64': 'qcFrench',
  'CA-R76': 'income',
};

// Each number control follows the question it changes, so every accepted
// comparison can be shared and reopened.
const level = { integer: true, max: maxLevel };
export const canadaNumberKnobs = {
  citizenshipLevel: level,
  eeLanguage: level,
  crs: { integer: true },
  eeFunds: {},
  aipFunds: {},
  qcFunds: {},
  qcFrench: level,
  income: {},
} satisfies Record<string, { integer?: boolean; max?: number }>;

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

// Set the moved answers. A cleared control removes the answer it controls.
function put<T extends object>(record: T | undefined, patch: Partial<T>): T {
  const next = { ...record, ...patch };
  for (const key in patch) if (patch[key] === undefined) delete next[key];
  return next as T;
}

// Only controls moved away from the questionnaire answers change the draft.
function apply(draft: CanadaDraft, knobs: CanadaWhatIf): CanadaDraft {
  const before = initial(draft);
  const changed = (key: keyof CanadaWhatIf) => knobs[key] !== before[key];
  const answers = structuredClone(draft.answers);
  // Without a travel record, one more trip is not the whole history.
  if (answers.trips && knobs.tripFrom && knobs.tripTo)
    answers.trips = [
      ...answers.trips,
      { departed: knobs.tripFrom, returned: knobs.tripTo },
    ];
  if (changed('citizenshipLevel'))
    (answers.residence ??= {}).language = put(answers.residence.language, {
      ...(knobs.citizenshipLevel !== undefined && {
        evidence: 'accepted-levels',
      }),
      speaking: knobs.citizenshipLevel,
      listening: knobs.citizenshipLevel,
    });
  // The result replaces the recorded score, which would otherwise pass.
  if (changed('citizenshipTest'))
    (answers.residence ??= {}).test = put(answers.residence.test, {
      outcome: knobs.citizenshipTest,
      correct: undefined,
    });
  if (changed('eeLanguage'))
    (answers.express ??= {}).primary = put(answers.express.primary, {
      levels:
        knobs.eeLanguage === undefined
          ? undefined
          : allSkills(knobs.eeLanguage),
    });
  if (changed('crs') && answers.express?.round)
    answers.express.round = put(answers.express.round, {
      confirmedCrs: knobs.crs,
    });
  if (changed('eeFunds'))
    (answers.express ??= {}).funds = put(answers.express.funds, {
      availableAtApplication: knobs.eeFunds,
    });
  if (changed('aipFunds'))
    (answers.atlantic ??= {}).funds = put(answers.atlantic.funds, {
      availableAtApplication: knobs.aipFunds,
    });
  if (changed('qcFunds'))
    answers.quebec = put(answers.quebec, { availableFunds: knobs.qcFunds });
  if (changed('qcFrench'))
    (answers.quebec ??= {}).french =
      knobs.qcFrench === undefined
        ? put(
            answers.quebec.french,
            Object.fromEntries(skills.map((skill) => [skill, undefined])),
          )
        : {
            evidence: 'approved-test',
            ...answers.quebec.french,
            ...allSkills(knobs.qcFrench),
          };
  if (changed('income'))
    (answers.family ??= {}).federalIncome = put(answers.family.federalIncome, {
      eligibleNoaIncome: knobs.income,
    });
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
  for (const [key, limits] of Object.entries(canadaNumberKnobs)) {
    const value = knobs[key as keyof typeof canadaNumberKnobs];
    if (value === undefined) continue;
    if (!(Number.isFinite(value) && value >= 0))
      errors[key] = 'ca.whatif.invalidNumber';
    else if ('integer' in limits && !Number.isInteger(value))
      errors[key] = 'ca.error.integer';
    else if ('max' in limits && value > limits.max)
      errors[key] = 'ca.error.range';
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
