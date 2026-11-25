import {
  evaluateSpainFull,
  type CountryResult,
  type EsHealthCover,
  type EsNationalityFacts,
  type EsNationalityRoute,
} from '@uk-immigration/engine';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import { SpainWhatIfControls } from '../app/spain/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeSpainAnswers,
  spainEngineInput,
  spainSteps,
  validateSpainStep,
  type SpainDraft,
} from './spain-draft';
import { cefrLevels } from './spain-fields';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export interface SpainWhatIf {
  simulationDate: string;
  noTrips: boolean;
  natRoute?: EsNationalityRoute;
  familySize?: number;
  monthlyIncome?: number;
  annualSalary?: number;
  // Yes/no answers picked on the page. null is unconfirmed; an omitted answer
  // keeps the questionnaire facts and shows their status on the comparison date.
  delePassed?: boolean | null;
  ccsePassed?: boolean | null;
  healthCover?: boolean | null;
  conductCleared?: boolean | null;
}

type SpainAnswer =
  'delePassed' | 'ccsePassed' | 'healthCover' | 'conductCleared';

export const spainFocusControls = {
  date: 'es-whatif-date',
  trips: 'es-whatif-trips',
  natRoute: 'es-whatif-nat-route',
  dele: 'es-whatif-dele',
  ccse: 'es-whatif-ccse',
  familySize: 'es-whatif-family-size',
  income: 'es-whatif-income',
  salary: 'es-whatif-salary',
  insurance: 'es-whatif-insurance',
  conduct: 'es-whatif-conduct',
} as const;

const focusByCondition: Record<string, keyof typeof spainFocusControls> = {
  'ES-N01': 'date',
  'ES-N02': 'date',
  'ES-N03': 'natRoute',
  'ES-N04': 'date',
  'ES-N05': 'date',
  'ES-N06': 'date',
  'ES-N07': 'date',
  'ES-N08': 'natRoute',
  'ES-N-ONE-YEAR': 'natRoute',
  'ES-N09': 'date',
  'ES-N10-RECORDS': 'conduct',
  'ES-N10': 'conduct',
  'ES-N11': 'dele',
  'ES-N12': 'ccse',
  'ES-N16': 'ccse',
  'ES-L-BASIS': 'date',
  'ES-L01': 'date',
  'ES-L01-PERMIT': 'date',
  'ES-L01-SINGLE': 'trips',
  'ES-L01-TOTAL': 'trips',
  'ES-L02': 'trips',
  'ES-L05': 'date',
  'ES-L07': 'date',
  'ES-L11': 'date',
  'ES-L12': 'conduct',
  'ES-L12-CERT': 'conduct',
  'ES-E-TIME': 'date',
  'ES-E01': 'date',
  'ES-E02': 'date',
  'ES-E03': 'date',
  'ES-E04': 'date',
  'ES-E05': 'income',
  'ES-E06': 'insurance',
  'ES-E07': 'date',
  'ES-E08': 'conduct',
  'ES-E08-CERT': 'conduct',
  'ES-M01': 'date',
  'ES-M02': 'income',
  'ES-M03': 'insurance',
  'ES-M04': 'salary',
  'ES-M08': 'conduct',
  'ES-F01': 'date',
  'ES-F03': 'income',
  'ES-F04': 'insurance',
  'ES-R01': 'date',
  'ES-R03': 'date',
  'ES-R04': 'date',
  'ES-R05': 'conduct',
  'ES-R07': 'insurance',
  'ES-T01': 'date',
  'ES-T02': 'trips',
  'ES-U04': 'date',
  'ES-U04-basis': 'date',
  'ES-U04-retention': 'trips',
  'ES-U06': 'date',
  'ES-U07': 'date',
  'ES-U08': 'date',
  'ES-U09': 'date',
  'ES-U11': 'date',
  'ES-U12': 'conduct',
  'ES-U13': 'date',
  'ES-TRANSITION': 'date',
};

const v = spainFull2026_11.values;

// The conditions each yes/no control sets.
const conditionsFor = {
  delePassed: ['ES-N11'],
  ccsePassed: ['ES-N12'],
  healthCover: ['ES-E06', 'ES-M03', 'ES-F04', 'ES-R07'],
  conductCleared: [
    'ES-N10',
    'ES-N10-RECORDS',
    'ES-L12',
    'ES-L12-CERT',
    'ES-E08',
    'ES-E08-CERT',
    'ES-M08',
    'ES-R05',
    'ES-U12',
  ],
};

function baselineAnswer(result: CountryResult, ids: string[]) {
  const statuses = result.columns
    .flatMap((column) => column.pathways)
    .flatMap((pathway) => pathway.checks)
    .filter((check) => ids.includes(check.id) && check.applicable !== false)
    .map((check) => check.status);
  if (!statuses.length) return undefined;
  if (statuses.every((status) => status === 'MET')) return true;
  if (statuses.every((status) => status === 'NOT_MET')) return false;
  return undefined;
}

/** The common value when every route that records it agrees. */
function agreed(values: (number | undefined)[]) {
  const known = values.filter((value) => value !== undefined);
  return known.length && known.every((value) => value === known[0])
    ? known[0]
    : undefined;
}

export const spainMobilityPurpose = (draft: SpainDraft) =>
  draft.targets.includes('M') ? draft.mobility.purpose : undefined;

/** The status of each yes/no control's conditions in the draft's own result. */
export function spainAnswers(
  draft: SpainDraft,
): Pick<SpainWhatIf, SpainAnswer> {
  const result = evaluateSpainFull({
    ...spainEngineInput(draft),
    locale: 'en',
  });
  return {
    delePassed: baselineAnswer(result, conditionsFor.delePassed),
    ccsePassed: baselineAnswer(result, conditionsFor.ccsePassed),
    healthCover: baselineAnswer(result, conditionsFor.healthCover),
    conductCleared: baselineAnswer(result, conditionsFor.conductCleared),
  };
}

function initialKnobs(stored: SpainDraft): SpainWhatIf {
  const draft = activeSpainAnswers(stored);
  const has = (target: SpainDraft['targets'][number]) =>
    draft.targets.includes(target);
  const purpose = spainMobilityPurpose(draft);
  const own = has('E') ? draft.residence.resources : undefined;
  const family = has('F') ? draft.mobility.family?.resources : undefined;
  const nonWorking =
    purpose === 'non-working' ? draft.mobility.holder?.nonWorking : undefined;
  return {
    simulationDate: draft.simulationDate,
    noTrips: false,
    natRoute: draft.route,
    familySize: agreed([
      own?.familySize,
      family?.familySize,
      nonWorking?.dependants === undefined
        ? undefined
        : nonWorking.dependants + 1,
    ]),
    monthlyIncome: agreed([
      own?.eligibleMonthlyIncome,
      family?.eligibleMonthlyIncome,
      nonWorking?.monthlyNonWorkIncome,
    ]),
    annualSalary:
      purpose === 'employment'
        ? draft.mobility.holder?.employment?.annualGrossSalary
        : undefined,
  };
}

const reliefs = [
  'spanish-eso-diploma',
  'full-dispensation',
  'judicial-exemption-confirmed',
  'pending',
];

// A "no" or unconfirmed exam answer cannot rest on a granted or pending dispensation.
function withoutRelief(
  n: EsNationalityFacts,
  answer: false | undefined,
): EsNationalityFacts {
  return n.examRelief === undefined || reliefs.includes(n.examRelief)
    ? { ...n, examRelief: answer === false ? 'none' : undefined }
    : n;
}

function withLanguage(
  n: EsNationalityFacts,
  answer?: boolean,
): EsNationalityFacts {
  const minimum = v.nationalityDeleMinimum.value as (typeof cefrLevels)[number];
  if (answer)
    return {
      ...n,
      deleEvidence: 'dele',
      deleLevel:
        n.deleLevel &&
        cefrLevels.indexOf(n.deleLevel) >= cefrLevels.indexOf(minimum)
          ? n.deleLevel
          : minimum,
    };
  // Without the certificate, only a nationality outside the exempt list remains.
  const others = n.documentedNationalities?.filter(
    (country) => !v.nationalityDeleExemptCountries.value.includes(country),
  );
  return {
    ...withoutRelief(n, answer),
    deleEvidence: answer === false ? 'none' : undefined,
    deleLevel: undefined,
    documentedNationalities:
      answer === false ? (others ?? []) : others?.length ? others : undefined,
  };
}

function withCivicTest(
  n: EsNationalityFacts,
  answer: boolean | undefined,
  date: string,
): EsNationalityFacts {
  if (answer)
    return {
      ...n,
      ccse: {
        ...n.ccse,
        verifiedPass: true,
        issued: date,
        validThrough: undefined,
      },
    };
  return {
    ...withoutRelief(n, answer),
    ccse: answer === false ? { ...n.ccse, verifiedPass: false } : undefined,
  };
}

function cover(answer: boolean | undefined, validFrom: string) {
  return answer === undefined
    ? undefined
    : answer
      ? ({
          kind: 'public',
          entitledOrAuthorized: true,
          validFrom,
          proof: true,
        } satisfies EsHealthCover)
      : ({ kind: 'none' } satisfies EsHealthCover);
}

export const spainWhatIf: CountryWhatIf<SpainDraft, SpainWhatIf> = {
  focusControls: spainFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial: initialKnobs,
  // Only the controls moved away from the questionnaire change the copy.
  apply(stored, knobs) {
    const draft = activeSpainAnswers(stored);
    const baseline = initialKnobs(stored);
    const changed = (key: keyof SpainWhatIf) => knobs[key] !== baseline[key];
    const has = (target: SpainDraft['targets'][number]) =>
      draft.targets.includes(target);
    const purpose = spainMobilityPurpose(draft);
    const date = knobs.simulationDate;
    const filed = (on?: string) => (on && on < date ? on : date);
    let {
      trips,
      route,
      nationality,
      residence,
      mobility,
      recovery,
      longTermCard,
      freeMovement,
    } = draft;
    const holder = (patch: NonNullable<typeof mobility.holder>) => {
      mobility = { ...mobility, holder: { ...mobility.holder, ...patch } };
    };
    const family = (patch: NonNullable<typeof mobility.family>) => {
      mobility = { ...mobility, family: { ...mobility.family, ...patch } };
    };

    if (knobs.noTrips) {
      trips = [];
      if (residence.tripDetails) residence = { ...residence, tripDetails: [] };
      if (longTermCard.absences)
        longTermCard = { ...longTermCard, absences: [] };
      if (longTermCard.outsideSpainPeriods)
        longTermCard = { ...longTermCard, outsideSpainPeriods: [] };
      if (has('U')) {
        const worker = freeMovement.workerResidenceEvidence;
        freeMovement = {
          ...freeMovement,
          trips: [],
          longestPostAcquisitionAbsence: undefined,
          ...(worker?.trips
            ? { workerResidenceEvidence: { ...worker, trips: [] } }
            : {}),
        };
      }
    }
    if (changed('natRoute')) route = knobs.natRoute;
    if (changed('delePassed'))
      nationality = withLanguage(nationality, knobs.delePassed ?? undefined);
    if (changed('ccsePassed'))
      nationality = withCivicTest(
        nationality,
        knobs.ccsePassed ?? undefined,
        date,
      );
    if (changed('familySize')) {
      const size = knobs.familySize;
      if (has('E'))
        residence = {
          ...residence,
          resources: { ...residence.resources, familySize: size },
        };
      if (has('F'))
        family({
          resources: { ...mobility.family?.resources, familySize: size },
        });
      if (purpose === 'non-working')
        holder({
          nonWorking: {
            ...mobility.holder?.nonWorking,
            dependants: size === undefined ? undefined : size - 1,
          },
        });
    }
    if (changed('monthlyIncome')) {
      const income = knobs.monthlyIncome;
      if (has('E'))
        residence = {
          ...residence,
          resources: { ...residence.resources, eligibleMonthlyIncome: income },
        };
      if (has('F'))
        family({
          resources: {
            ...mobility.family?.resources,
            eligibleMonthlyIncome: income,
          },
        });
      if (purpose === 'non-working')
        holder({
          nonWorking: {
            ...mobility.holder?.nonWorking,
            monthlyNonWorkIncome: income,
          },
        });
    }
    if (changed('annualSalary') && purpose === 'employment')
      holder({
        employment: {
          ...mobility.holder?.employment,
          annualGrossSalary: knobs.annualSalary,
        },
      });
    if (changed('healthCover')) {
      const answer = knobs.healthCover ?? undefined;
      if (has('E'))
        residence = { ...residence, insurance: cover(answer, date) };
      if (has('R-E'))
        recovery = { ...recovery, insurance: cover(answer, date) };
      if (purpose === 'non-working')
        holder({ healthCover: cover(answer, filed(mobility.holder?.filedOn)) });
      // ES-F04 reads cover only when the holder does not come to work.
      if (has('F') && mobility.purpose === 'non-working') {
        family({
          healthCover: cover(answer, filed(mobility.family?.filedOn)),
        });
        // Without cover, the holder's policy cannot cover the family member either.
        const held = mobility.holder?.healthCover;
        if (!answer && (held || answer === false))
          holder({ healthCover: { ...held, coversFamilyMember: answer } });
      }
    }
    if (changed('conductCleared')) {
      const answer = knobs.conductCleared ?? undefined;
      if (has('N'))
        nationality = {
          ...nationality,
          conductAndSecurityDecision: answer,
          criminalRecords: answer
            ? {
                spanishRecordOrQuery: true,
                originRecordOrLawfulAlternative: true,
                militaryProcedureIfApplicable: true,
              }
            : answer === false
              ? nationality.criminalRecords
              : undefined,
        };
      if (has('L') || has('E'))
        residence = {
          ...residence,
          securityDecision:
            answer === undefined ? undefined : answer ? 'clear' : 'threat',
          criminalCertificatesWhereRequired:
            answer === false
              ? residence.criminalCertificatesWhereRequired
              : answer,
        };
      if (has('M'))
        holder({
          securityDecision:
            answer === undefined ? undefined : answer ? 'cleared' : 'adverse',
          noRefusalAlert:
            answer === false ? mobility.holder?.noRefusalAlert : answer,
          noReturnBar: answer === false ? mobility.holder?.noReturnBar : answer,
        });
      if (has('R-N') || has('R-E'))
        recovery = {
          ...recovery,
          publicOrderAndSecurityCleared: answer,
          publicHealthCleared:
            answer === false ? recovery.publicHealthCleared : answer,
          clearRecordsInAllCountries:
            answer === false ? recovery.clearRecordsInAllCountries : answer,
        };
      if (has('U'))
        freeMovement = { ...freeMovement, noOfficialRestriction: answer };
    }
    return activeSpainAnswers({
      ...draft,
      simulationDate: date,
      trips,
      route,
      nationality,
      residence,
      mobility,
      recovery,
      longTermCard,
      freeMovement,
    });
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'es.error.date';
    if (
      knobs.familySize !== undefined &&
      (!Number.isSafeInteger(knobs.familySize) || knobs.familySize < 1)
    )
      errors.familySize = 'es.whatif.invalidFamilySize';
    if (
      knobs.monthlyIncome !== undefined &&
      (!Number.isFinite(knobs.monthlyIncome) || knobs.monthlyIncome < 0)
    )
      errors.income = 'es.whatif.invalidNumber';
    if (
      knobs.annualSalary !== undefined &&
      (!Number.isFinite(knobs.annualSalary) || knobs.annualSalary < 0)
    )
      errors.salary = 'es.whatif.invalidNumber';
    if (!Object.keys(errors).length) {
      for (const { step } of spainSteps(draft)) {
        const issues = validateSpainStep({ ...draft, step });
        if (Object.keys(issues).length) {
          errors.date = 'es.error.date';
          break;
        }
      }
    }
    return errors;
  },
  Controls: SpainWhatIfControls,
};
