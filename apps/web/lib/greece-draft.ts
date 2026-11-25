import type { GrFullPathwayId, GrFullRequest } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import {
  basicFields,
  commonSections,
  euFamilySections,
  familyTcnSections,
  goldenVisaSections,
  greekFamilySections,
  historyFields,
  nationalitySections,
  routeField,
  settlementFields,
  tripList,
  workSections,
  type GreeceField,
} from './greece-fields';
import { today, validDate } from './questionnaire';

type Nationality = NonNullable<GrFullRequest['nationality']>;
type Posting = NonNullable<Nationality['diplomaticSpouse']>;
export interface GreeceIncomeYear {
  year: number;
  taxableEur: number;
  dependants: number;
  welfareEur?: number;
}
export interface GreeceDraft
  extends
    CountryDraft,
    Omit<
      GrFullRequest,
      'locale' | 'pathways' | 'nationality' | 'blueCardMobility'
    > {
  pathways: GrFullPathwayId[];
  // The user confirms each list of time abroad is complete (rule report 88).
  tripsComplete?: boolean;
  blueCardMobility?: NonNullable<GrFullRequest['blueCardMobility']> & {
    otherMemberTripsComplete?: boolean;
  };
  // Tax years are entered as rows and keyed by year for the engine.
  nationality?: Omit<Nationality, 'incomeByTaxYear' | 'diplomaticSpouse'> & {
    incomeYears?: GreeceIncomeYear[];
    diplomaticSpouse?: Posting & { periodsComplete?: boolean };
  };
}

export const GR_PATHWAYS: GrFullPathwayId[] = [
  'GR-LONG-TERM',
  'GR-GOLDEN-VISA',
  'GR-NATIONALITY',
  'GR-TEN-YEAR',
  'GR-GREEK-FAMILY-PR',
  'GR-EU-FAMILY-PR',
  'GR-WORK',
  'GR-FAMILY-TCN',
];

export function createGreeceDraft(): GreeceDraft {
  return {
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    pathways: [],
  };
}

export const has = (draft: GreeceDraft, ...ids: GrFullPathwayId[]) =>
  ids.some((id) => draft.pathways.includes(id));
export const settlementRoute = (draft: GreeceDraft) =>
  has(draft, 'GR-LONG-TERM', 'GR-TEN-YEAR');
export const familyRoute = (draft: GreeceDraft) =>
  has(draft, 'GR-GREEK-FAMILY-PR', 'GR-EU-FAMILY-PR');

const stepTitles = [
  'gr.form.step0',
  'gr.form.step1',
  'gr.form.step2',
  'gr.form.step3',
  'gr.form.step4',
  'gr.form.step5',
  'gr.form.step6',
  'gr.form.step7',
] as const;
const stepPathways: Partial<Record<number, GrFullPathwayId[]>> = {
  3: ['GR-LONG-TERM', 'GR-TEN-YEAR'],
  4: ['GR-NATIONALITY'],
  5: ['GR-GOLDEN-VISA'],
  6: ['GR-GREEK-FAMILY-PR', 'GR-EU-FAMILY-PR'],
  7: ['GR-WORK', 'GR-FAMILY-TCN'],
};

export function greeceSteps(draft: GreeceDraft) {
  return stepTitles.flatMap((title, step) => {
    const needs = stepPathways[step];
    return !needs || has(draft, ...needs) ? [{ step, title }] : [];
  });
}

// Answers that only one route reads. Shared and dated common answers stay.
const routeAnswers: [GrFullPathwayId[], (keyof GreeceDraft)[]][] = [
  [['GR-LONG-TERM'], ['longTerm', 'grantedProtection', 'blueCardMobility']],
  [['GR-TEN-YEAR'], ['tenYear']],
  [
    ['GR-LONG-TERM', 'GR-TEN-YEAR'],
    ['integration', 'residenceIncome', 'backlogRenewals'],
  ],
  [['GR-NATIONALITY'], ['nationality', 'route']],
  [['GR-GOLDEN-VISA'], ['goldenVisa', 'overseasInvestorMandate']],
  [['GR-GREEK-FAMILY-PR'], ['greekFamily']],
  [['GR-EU-FAMILY-PR'], ['euFamily', 'euFamilyEntryEvidenceAccepted']],
  [['GR-WORK'], ['work']],
  [['GR-FAMILY-TCN'], ['familyTcn']],
];

// Answers to hidden questions, such as private cover amounts under public
// insurance, can arrive in a shared or stored draft. They are not sent on.
function visibleAnswers<T>(fields: GreeceField[], record: T): T {
  if (!isRecord(record)) return record;
  const next: Record<string, unknown> = { ...record };
  for (const field of fields) {
    const value = next[field.name];
    if (field.when && !field.when(record)) delete next[field.name];
    else if (field.type === 'group' && isRecord(value))
      next[field.name] = visibleAnswers(field.fields, value);
    else if (field.type === 'list' && Array.isArray(value))
      next[field.name] = value.map((row) => visibleAnswers(field.fields, row));
  }
  return next as T;
}

const draftFields: GreeceField[] = [
  ...basicFields,
  ...Object.values(historyFields).flat(),
  ...Object.values(commonSections(true, true)).flatMap(
    (fields) => fields ?? [],
  ),
  ...Object.values(settlementFields),
  routeField,
];
const groupSections = {
  nationality: nationalitySections,
  goldenVisa: goldenVisaSections,
  greekFamily: greekFamilySections,
  euFamily: euFamilySections,
  work: workSections,
  familyTcn: familyTcnSections,
};

// Drop answers for routes that are no longer selected, and answers to hidden
// questions, before running or sharing.
export function activeGreeceAnswers(draft: GreeceDraft): GreeceDraft {
  const next = visibleAnswers(draftFields, draft);
  for (const [key, sections] of Object.entries(groupSections) as [
    keyof typeof groupSections,
    Partial<Record<string, GreeceField[]>>,
  ][])
    if (next[key])
      next[key] = visibleAnswers(
        Object.values(sections).flatMap((fields) => fields ?? []),
        next[key],
      ) as never;
  for (const [routes, keys] of routeAnswers)
    if (!has(draft, ...routes)) for (const key of keys) delete next[key];
  if (!familyRoute(draft) && next.trips)
    next.trips = next.trips.map(({ departed, returned }) => ({
      departed,
      returned,
    }));
  return next;
}

export function greeceRequest(draft: GreeceDraft): GrFullRequest {
  const { tripsComplete, nationality, blueCardMobility, ...answers } =
    activeGreeceAnswers(draft);
  let request: GrFullRequest & Partial<CountryDraft> = { ...answers };
  delete request.version;
  delete request.step;
  delete request.completed;
  if (nationality) {
    const { incomeYears, diplomaticSpouse, ...rest } = nationality;
    let posting: Posting | undefined;
    if (diplomaticSpouse) {
      posting = { ...diplomaticSpouse };
      delete (posting as typeof diplomaticSpouse).periodsComplete;
    }
    request = {
      ...request,
      nationality: {
        ...rest,
        ...(posting && { diplomaticSpouse: posting }),
        ...(incomeYears && {
          incomeByTaxYear: Object.fromEntries(
            incomeYears.map(({ year, ...row }) => [year, row]),
          ),
        }),
      },
    };
  }
  // An unconfirmed list could hide a trip that moves a date, so it is unknown.
  if (request.trips?.length && !tripsComplete) delete request.trips;
  if (blueCardMobility) {
    const { otherMemberTripsComplete, ...mobility } = blueCardMobility;
    if (mobility.otherMemberTrips?.length && !otherMemberTripsComplete)
      delete mobility.otherMemberTrips;
    request.blueCardMobility = mobility;
  }
  return request;
}

type Errors = Record<string, TranslationKey>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkFields(
  fields: GreeceField[],
  record: unknown,
  prefix: string,
  required: boolean,
  errors: Errors,
) {
  const answers = isRecord(record) ? record : {};
  for (const field of fields) {
    if (field.when && !field.when(answers)) continue;
    const id = `${prefix}-${field.name}`;
    const value = answers[field.name];
    if (value === undefined || value === '') {
      if (required && field.required) errors[id] = 'gr.error.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) errors[id] = 'gr.error.required';
        else
          value.forEach((row, i) =>
            checkFields(field.fields, row, `${id}-${i}`, required, errors),
          );
        // Listed time abroad is used only once the list is confirmed complete.
        if (
          required &&
          field.complete &&
          Array.isArray(value) &&
          value.length &&
          answers[field.complete] !== true
        )
          errors[`${prefix}-${field.complete}`] = `gr.error.${field.complete}`;
        break;
      case 'group':
        if (!isRecord(value)) errors[id] = 'gr.error.required';
        else checkFields(field.fields, value, id, required, errors);
        break;
      case 'choice':
        if (!field.options.some((option) => option === value))
          errors[id] = 'gr.error.required';
        break;
      case 'choice-set':
        if (
          !Array.isArray(value) ||
          value.some((item) => !field.options.some((o) => o === item))
        )
          errors[id] = 'gr.error.required';
        break;
      case 'boolean':
        if (
          typeof value !== 'boolean' &&
          !field.extra?.some((option) => option === value)
        )
          errors[id] = 'gr.error.required';
        break;
      case 'date':
      case 'date-or':
        if (
          !(field.type === 'date-or' && value === field.alternative) &&
          (typeof value !== 'string' || !validDate(value))
        )
          errors[id] = 'gr.error.date';
        break;
      case 'number':
      case 'integer':
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
          errors[id] = 'gr.error.number';
        else if (field.type === 'integer' && !Number.isSafeInteger(value))
          errors[id] = 'gr.error.integer';
        break;
    }
  }
}

function order(
  errors: Errors,
  id: string,
  start: string | undefined,
  end: string | undefined,
) {
  if (start && end && validDate(start) && validDate(end) && end < start)
    errors[id] ??= 'gr.error.order';
}

function checkRows<T>(
  rows: T[] | undefined,
  each: (row: T, i: number, rows: T[]) => void,
) {
  if (Array.isArray(rows)) rows.forEach(each);
}

function checkStep(draft: GreeceDraft, step: number, submitting: boolean) {
  const errors: Errors = {};
  const fields = (definitions: GreeceField[], values: unknown, prefix = 'gr') =>
    checkFields(definitions, values, prefix, submitting, errors);
  const sections = (
    groups: Partial<Record<string, GreeceField[]>>,
    values: unknown,
    prefix: string,
  ) => {
    for (const definitions of Object.values(groups))
      fields(definitions ?? [], values, prefix);
  };
  switch (step) {
    case 0:
      fields(basicFields, draft);
      if (
        draft.birthDate &&
        validDate(draft.birthDate) &&
        validDate(draft.simulationDate) &&
        draft.birthDate > draft.simulationDate
      )
        errors['gr-birthDate'] ??= 'gr.error.birthAfterSimulation';
      if (
        !Array.isArray(draft.pathways) ||
        draft.pathways.some((id) => !GR_PATHWAYS.includes(id)) ||
        (submitting && !draft.pathways.length)
      )
        errors['gr-pathways'] = 'gr.error.pathways';
      break;
    case 1:
      fields(
        [
          historyFields.permits,
          historyFields.permitHistoryComplete,
          tripList(familyRoute(draft)),
          ...(settlementRoute(draft) ? [historyFields.backlogRenewals] : []),
          ...historyFields.renewal,
        ],
        draft,
      );
      checkRows(draft.permits, (permit, i) =>
        order(errors, `gr-permits-${i}-to`, permit.from, permit.to),
      );
      checkRows(draft.trips, (trip, i) =>
        order(errors, `gr-trips-${i}-returned`, trip.departed, trip.returned),
      );
      if (settlementRoute(draft))
        checkRows(draft.backlogRenewals, (row, i) =>
          order(
            errors,
            `gr-backlogRenewals-${i}-permitEffectiveOn`,
            row.filedOn,
            row.permitEffectiveOn,
          ),
        );
      break;
    case 2:
      sections(
        commonSections(
          has(draft, 'GR-EU-FAMILY-PR'),
          has(draft, 'GR-GOLDEN-VISA'),
        ),
        draft,
        'gr',
      );
      order(
        errors,
        'gr-passport-expiresOn',
        draft.passport?.issuedOn,
        draft.passport?.expiresOn,
      );
      checkRows(draft.changes, (change, i) =>
        order(
          errors,
          `gr-changes-${i}-reportedOn`,
          change.occurredOn,
          change.reportedOn,
        ),
      );
      break;
    case 3: {
      const s = settlementFields;
      fields(
        [
          ...(has(draft, 'GR-LONG-TERM')
            ? [s.longTerm, s.grantedProtection, s.blueCardMobility]
            : []),
          s.integration,
          s.residenceIncome,
          ...(has(draft, 'GR-TEN-YEAR') ? [s.tenYear] : []),
        ],
        draft,
      );
      const protection = draft.grantedProtection;
      order(
        errors,
        'gr-grantedProtection-grantedOn',
        protection?.claimedOn,
        protection?.grantedOn,
      );
      const mobility = draft.blueCardMobility;
      order(
        errors,
        'gr-blueCardMobility-greekBlueCardThrough',
        mobility?.greekBlueCardFrom,
        mobility?.greekBlueCardThrough,
      );
      checkRows(mobility?.priorMemberPeriods, (row, i) =>
        order(
          errors,
          `gr-blueCardMobility-priorMemberPeriods-${i}-through`,
          row.from,
          row.through,
        ),
      );
      checkRows(mobility?.otherMemberTrips, (row, i) =>
        order(
          errors,
          `gr-blueCardMobility-otherMemberTrips-${i}-returned`,
          row.departed,
          row.returned,
        ),
      );
      break;
    }
    case 4:
      fields([routeField], draft);
      sections(nationalitySections, draft.nationality, 'gr-nationality');
      checkRows(draft.nationality?.diplomaticSpouse?.periods, (row, i) =>
        order(
          errors,
          `gr-nationality-diplomaticSpouse-periods-${i}-through`,
          row.from,
          row.through,
        ),
      );
      // The engine keys income by tax year, so each year has one row.
      checkRows(draft.nationality?.incomeYears, (row, i, rows) => {
        if (rows.slice(0, i).some((earlier) => earlier.year === row.year))
          errors[`gr-nationality-incomeYears-${i}-year`] ??=
            'gr.error.duplicateYear';
      });
      break;
    case 5:
      sections(goldenVisaSections, draft.goldenVisa, 'gr-goldenVisa');
      break;
    case 6:
      if (has(draft, 'GR-GREEK-FAMILY-PR'))
        sections(greekFamilySections, draft.greekFamily, 'gr-greekFamily');
      if (has(draft, 'GR-EU-FAMILY-PR'))
        sections(euFamilySections, draft.euFamily, 'gr-euFamily');
      break;
    case 7:
      if (has(draft, 'GR-WORK')) sections(workSections, draft.work, 'gr-work');
      if (has(draft, 'GR-FAMILY-TCN'))
        sections(familyTcnSections, draft.familyTcn, 'gr-familyTcn');
      break;
  }
  return errors;
}

export function validateGreeceStep(draft: GreeceDraft) {
  return checkStep(draft, draft.step, true);
}

const groupKeys = [
  'passport',
  'character',
  'filingDocuments',
  'insurance',
  'longTerm',
  'grantedProtection',
  'blueCardMobility',
  'integration',
  'residenceIncome',
  'tenYear',
  'nationality',
  'goldenVisa',
  'greekFamily',
  'euFamily',
  'work',
  'familyTcn',
] as const;
const listKeys = ['permits', 'trips', 'backlogRenewals', 'changes'] as const;

export function decodeGreeceDraft(
  value: unknown,
  mode: DraftReadMode = false,
): GreeceDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Number.isInteger(value.step) ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !Array.isArray(value.pathways) ||
    groupKeys.some(
      (key) => value[key] !== undefined && !isRecord(value[key]),
    ) ||
    listKeys.some(
      (key) => value[key] !== undefined && !Array.isArray(value[key]),
    )
  )
    return undefined;
  const draft = value as unknown as GreeceDraft;
  const steps = greeceSteps(draft);
  if (!steps.some(({ step }) => step === draft.step)) return undefined;
  // A draft in progress is checked step by step when the user continues.
  if (mode !== true && !draft.completed) return draft;
  for (const { step } of steps) {
    if (!Object.keys(checkStep(draft, step, true)).length) continue;
    // A result link with a missing or invalid answer reopens the questionnaire there.
    return mode === 'show-correction'
      ? { ...draft, completed: false, step }
      : undefined;
  }
  return draft;
}

// Stored drafts are external data; reopen an invalid one at the first bad step.
export function restoreStoredGreeceDraft(
  draft: GreeceDraft,
  forResult = false,
): GreeceDraft {
  if (!decodeGreeceDraft({ ...draft, completed: false, step: 0 }))
    return createGreeceDraft();
  for (const { step } of greeceSteps(draft))
    if (
      Object.keys(checkStep(draft, step, draft.completed || forResult)).length
    )
      return { ...draft, completed: false, step };
  return draft;
}
