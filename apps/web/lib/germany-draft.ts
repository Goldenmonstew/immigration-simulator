import {
  DE_FULL_ROUTES,
  DE_PERMIT_KINDS,
  DE_UNLIMITED_KINDS,
  type DeFullRequest,
  type DeFullRoute,
  type DePermitKind,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import {
  basicFields,
  blueCardFields,
  citizenshipRouteFields,
  citizenshipSections,
  commonSections,
  feeFields,
  freeMovementFields,
  GERMANY_ROUTE_GROUPS,
  historyFields,
  permitFields,
  settlementRouteFields,
  titleReviewFields,
  tripFields,
  type GermanyField,
} from './germany-fields';
import { today, validDate } from './questionnaire';

export interface GermanyDraft
  extends CountryDraft, Omit<DeFullRequest, 'locale' | 'routes'> {
  answerFormat?: 'explicit';
  routes: DeFullRoute[];
}

export function createGermanyDraft(): GermanyDraft {
  return {
    version: 1,
    answerFormat: 'explicit',
    step: 0,
    completed: false,
    simulationDate: today(),
    routes: [],
    common: {},
    settlement: {},
    mobility: {},
    citizenship: {},
    fees: {},
  };
}

export const hasEndDate = (kind: DePermitKind) =>
  !DE_UNLIMITED_KINDS.includes(kind);

export const endDateRequired = (
  kind: DePermitKind,
): TranslationKey | undefined =>
  kind === 'job-seeking'
    ? 'de.error.jobSeekingEnd'
    : kind === 'opportunity-card' || kind === 'follow-up-card'
      ? 'de.error.opportunityCardEnd'
      : undefined;

const timelineRoutes = new Set<DeFullRoute>([
  'R00',
  'R01',
  'R02',
  'R03',
  'R04',
  'R05',
  'R05-fast',
  'R06',
  'R07',
  'R08',
  'R09',
  'R15',
]);

export function needsGermanyFirstEntry(draft: GermanyDraft): boolean {
  return draft.routes.some((route) => timelineRoutes.has(route));
}

export function hasGermanyHistoryStep(draft: GermanyDraft): boolean {
  return draft.routes.some((route) => route !== 'R18');
}

export function hasGermanyCommonStep(draft: GermanyDraft): boolean {
  return draft.routes.some((route) =>
    (GERMANY_ROUTE_GROUPS.settlement as readonly string[]).includes(route),
  );
}

export function selectedSettlementDetailRoutes(draft: GermanyDraft) {
  const keys: (keyof typeof settlementRouteFields)[] = [];
  for (const route of draft.routes) {
    const key = route === 'R05-fast' ? 'R05' : route;
    if (
      key in settlementRouteFields &&
      !keys.includes(key as keyof typeof settlementRouteFields)
    )
      keys.push(key as keyof typeof settlementRouteFields);
  }
  return keys;
}

export function hasGermanyCitizenshipStep(draft: GermanyDraft): boolean {
  return draft.routes.some((route) =>
    (GERMANY_ROUTE_GROUPS.citizenship as readonly string[]).includes(route),
  );
}

export function hasGermanyFeesStep(draft: GermanyDraft): boolean {
  return draft.routes.some((route) => route !== 'R00');
}

const stepTitles = [
  'de.form.step0',
  'de.form.step1',
  'de.form.step2',
  'de.form.step3',
  'de.form.step4',
  'de.form.step5',
] as const;

export function germanySteps(draft: GermanyDraft) {
  return stepTitles.flatMap((title, step) => {
    const enabled =
      step === 0 ||
      (step === 1
        ? hasGermanyHistoryStep(draft)
        : step === 2
          ? hasGermanyCommonStep(draft)
          : step === 3
            ? selectedSettlementDetailRoutes(draft).length > 0
            : step === 4
              ? hasGermanyCitizenshipStep(draft)
              : hasGermanyFeesStep(draft));
    return enabled ? [{ step, title }] : [];
  });
}

// Route sections also ask answers kept outside `settlement`.
const outsideSettlement = new Set([
  'trainedInGermany',
  'blueCardEmploymentMonths',
  'germanB1',
  'germanC1',
  'blueCard',
  'freedom',
]);
type DetailRoute = keyof typeof settlementRouteFields;
const settlementFields = (routes: readonly DetailRoute[]) =>
  routes
    .flatMap(
      (route) => settlementRouteFields[route] as unknown as GermanyField[],
    )
    .filter((field) => !outsideSettlement.has(field.name));
const allCommonFields = Object.values(commonSections).flat();
const allSettlementFields = settlementFields(
  Object.keys(settlementRouteFields) as DetailRoute[],
);
const citizenshipFields = (routes: readonly DeFullRoute[]) => [
  ...Object.values(citizenshipSections).flat(),
  ...(['R08', 'R16', 'R17'] as const)
    .filter((route) => routes.includes(route))
    .flatMap(
      (route) => citizenshipRouteFields[route] as unknown as GermanyField[],
    )
    .filter(
      (field) =>
        field.name !== 'marriedOn' && field.name !== 'spouseGermanSince',
    ),
];
const allCitizenshipFields = citizenshipFields(['R08', 'R16', 'R17']);

// Keep only the answers a visible question owns.
function keep<T>(record: T | undefined, fields: GermanyField[]): T {
  const values = (record ?? {}) as Record<string, unknown>;
  const kept: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.name];
    if (value === undefined || (field.when && !field.when(values))) continue;
    kept[field.name] =
      field.type === 'group' && isRecord(value)
        ? keep(value, field.fields)
        : field.type === 'list' && Array.isArray(value)
          ? value.map((row) => (isRecord(row) ? keep(row, field.fields) : row))
          : value;
  }
  return kept as T;
}

export function activeGermanyAnswers(draft: GermanyDraft): GermanyDraft {
  const visible = new Set(germanySteps(draft).map(({ step }) => step));
  const detailRoutes = selectedSettlementDetailRoutes(draft);
  const has = (route: DetailRoute) => detailRoutes.includes(route);
  const hasHistory = visible.has(1);
  const hasCommon = visible.has(2);
  const r08 = draft.routes.includes('R08');
  const mobility = draft.mobility ?? {};
  return {
    ...draft,
    firstEntry:
      hasHistory || draft.routes.includes('R11')
        ? draft.firstEntry || undefined
        : undefined,
    permits: hasHistory
      ? draft.permits?.map((permit) => keep(permit, permitFields))
      : undefined,
    trips: hasHistory
      ? draft.trips?.map((trip) => keep(trip, tripFields))
      : undefined,
    contributionMonths: hasCommon ? draft.contributionMonths : undefined,
    trainedInGermany: has('R02') ? draft.trainedInGermany : undefined,
    germanB1: has('R03') ? draft.germanB1 : undefined,
    germanC1: has('R05') ? draft.germanC1 : undefined,
    blueCardEmploymentMonths: has('R03')
      ? draft.blueCardEmploymentMonths
      : undefined,
    marriedOn: r08 ? draft.marriedOn : undefined,
    spouseGermanSince: r08 ? draft.spouseGermanSince : undefined,
    common: hasCommon ? keep(draft.common, allCommonFields) : {},
    settlement: keep(draft.settlement, settlementFields(detailRoutes)),
    mobility: {
      ...(hasHistory && mobility.titles !== undefined
        ? {
            titles: mobility.titles.map((title) =>
              keep(title, titleReviewFields),
            ),
          }
        : {}),
      ...(has('R03') && mobility.blueCard
        ? { blueCard: keep(mobility.blueCard, blueCardFields) }
        : {}),
      ...(has('R18') && mobility.freedom
        ? { freedom: keep(mobility.freedom, freeMovementFields) }
        : {}),
    },
    citizenship: visible.has(4)
      ? keep(draft.citizenship, citizenshipFields(draft.routes))
      : {},
    fees: visible.has(5) ? keep(draft.fees, feeFields) : {},
  };
}

type Errors = Record<string, TranslationKey>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const validMonth = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

// Answers of the wrong type are always rejected. Required answers, ranges,
// unfinished months and facts after the simulation date are only checked on
// submission, so an unfinished draft reopens with what was typed.
function checkFields(
  fields: GermanyField[],
  record: object,
  prefix: string,
  required: boolean,
  errors: Errors,
  simulationDate?: string,
) {
  const answers = record as Record<string, unknown>;
  for (const field of fields) {
    if (field.when && !field.when(answers)) continue;
    const id = `${prefix}-${field.name}`;
    const value = answers[field.name];
    if (
      value === undefined ||
      (value === '' &&
        (field.type === 'date' ||
          field.type === 'nullable-date' ||
          field.type === 'month' ||
          field.type === 'text'))
    ) {
      if (required && field.required) errors[id] = 'de.form.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'de.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (isRecord(row))
            checkFields(
              field.fields,
              row,
              `${id}-${i}`,
              required,
              errors,
              simulationDate,
            );
          else errors[id] = 'de.form.required';
        });
        break;
      case 'group':
        if (isRecord(value))
          checkFields(
            field.fields,
            value,
            id,
            required,
            errors,
            simulationDate,
          );
        else errors[id] = 'de.form.required';
        break;
      case 'choice':
        if (!field.options.some((option) => value === option))
          errors[id] = 'de.form.required';
        break;
      case 'choice-list':
        if (
          !Array.isArray(value) ||
          value.some((item) => !field.options.some((opt) => opt === item))
        )
          errors[id] = 'de.form.required';
        break;
      case 'number-list':
      case 'integer-list':
        if (
          !Array.isArray(value) ||
          value.some(
            (item) =>
              typeof item !== 'number' ||
              !Number.isFinite(item) ||
              (required &&
                (item < 0 ||
                  (field.type === 'integer-list' &&
                    !Number.isSafeInteger(item)))),
          )
        )
          errors[id] =
            field.type === 'integer-list'
              ? 'de.form.integerError'
              : 'de.form.numberError';
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'de.form.required';
        break;
      case 'nullable-date':
      case 'date':
        if (field.type === 'nullable-date' && value === null) break;
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'de.error.date';
        else if (
          required &&
          simulationDate &&
          value > simulationDate &&
          field.actualDate
        )
          errors[id] = 'de.error.futureFact';
        break;
      case 'month':
        if (typeof value !== 'string' || (required && !validMonth(value)))
          errors[id] = 'de.form.monthError';
        break;
      case 'text':
        if (typeof value !== 'string') errors[id] = 'de.form.required';
        break;
      case 'number':
      case 'integer':
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (required && value < 0)
        )
          errors[id] = 'de.form.numberError';
        else if (
          required &&
          field.type === 'integer' &&
          !Number.isSafeInteger(value)
        )
          errors[id] = 'de.form.integerError';
        break;
    }
  }
}

function checkStep(draft: GermanyDraft, step: number, submitting: boolean) {
  const errors: Errors = {};
  const asOf = validDate(draft.simulationDate)
    ? draft.simulationDate
    : undefined;
  const fields = (
    definitions: GermanyField[],
    values: object,
    prefix: string,
  ) => checkFields(definitions, values, prefix, submitting, errors, asOf);
  const order = (id: string, start?: string, end?: string | null) => {
    if (
      submitting &&
      start &&
      end &&
      validDate(start) &&
      validDate(end) &&
      end < start
    )
      errors[id] ??= 'de.error.order';
  };
  const monthOrder = (id: string, start?: string, end?: string) => {
    if (
      submitting &&
      start &&
      end &&
      validMonth(start) &&
      validMonth(end) &&
      end < start
    )
      errors[id] ??= 'de.error.order';
  };

  switch (step) {
    case 0:
      fields(basicFields(needsGermanyFirstEntry(draft)), draft, 'de');
      if (
        !Array.isArray(draft.routes) ||
        draft.routes.some((r) => !DE_FULL_ROUTES.includes(r))
      )
        errors['de-routes'] = 'de.form.routeError';
      else if (submitting && !draft.routes.length)
        errors['de-routes'] = 'de.form.routeError';
      break;
    case 1:
      fields(
        historyFields,
        {
          permits: draft.permits,
          trips: draft.trips,
          titles: draft.mobility?.titles,
        },
        'de',
      );
      (draft.permits ?? []).forEach((permit, i) => {
        if (!hasEndDate(permit.kind)) return;
        const capped = endDateRequired(permit.kind);
        if (submitting && capped && !permit.to)
          errors[`de-permits-${i}-to`] = capped;
        order(`de-permits-${i}-to`, permit.from, permit.to);
      });
      (draft.trips ?? []).forEach((trip, i) => {
        order(`de-trips-${i}-returned`, trip.departed, trip.returned);
      });
      (draft.mobility?.titles ?? []).forEach((title, i) => {
        order(`de-titles-${i}-validTo`, title.from, title.validTo);
        (title.trips ?? []).forEach((trip, j) => {
          order(
            `de-titles-${i}-trips-${j}-returned`,
            trip.departed,
            trip.returned,
          );
          (trip.outsideArea ?? []).forEach((area, k) => {
            order(
              `de-titles-${i}-trips-${j}-outsideArea-${k}-to`,
              area.from,
              area.to,
            );
          });
        });
      });
      break;
    case 2: {
      const merged = {
        ...draft.common,
        contributionMonths: draft.contributionMonths,
      };
      for (const section of Object.values(commonSections))
        fields(section, merged, 'de-common');
      if (draft.common?.movedOn && draft.common?.registeredOn)
        order(
          'de-common-registeredOn',
          draft.common.movedOn,
          draft.common.registeredOn,
        );
      if (
        submitting &&
        draft.common?.orientationScore !== undefined &&
        (draft.common.orientationScore < 0 ||
          draft.common.orientationScore > 33)
      )
        errors['de-common-orientationScore'] = 'de.error.score';
      break;
    }
    case 3:
      for (const key of selectedSettlementDetailRoutes(draft)) {
        const values =
          key === 'R02'
            ? {
                ...draft.settlement,
                trainedInGermany: draft.trainedInGermany,
              }
            : key === 'R03'
              ? {
                  blueCardEmploymentMonths: draft.blueCardEmploymentMonths,
                  germanB1: draft.germanB1,
                  blueCard: draft.mobility?.blueCard,
                }
              : key === 'R05'
                ? {
                    ...draft.settlement,
                    germanC1: draft.germanC1,
                  }
                : key === 'R18'
                  ? { freedom: draft.mobility?.freedom }
                  : (draft.settlement ?? {});
        fields(
          settlementRouteFields[key] as unknown as GermanyField[],
          values,
          `de-route-${key}`,
        );
        if (key === 'R03') {
          (draft.mobility?.blueCard?.employment ?? []).forEach((row, i) => {
            monthOrder(
              `de-route-R03-blueCard-employment-${i}-lastMonth`,
              row.firstMonth,
              row.lastMonth,
            );
            order(
              `de-route-R03-blueCard-employment-${i}-endedOn`,
              row.startedOn,
              row.endedOn,
            );
          });
        }
        if (key === 'R06') {
          (draft.settlement?.euMobility?.periods ?? []).forEach((row, i) => {
            order(
              `de-route-R06-euMobility-periods-${i}-until`,
              row.from,
              row.until,
            );
          });
        }
        if (key === 'R18') {
          (draft.mobility?.freedom?.periods ?? []).forEach((row, i) => {
            order(`de-route-R18-freedom-periods-${i}-to`, row.from, row.to);
          });
          (draft.mobility?.freedom?.subsequentTrips ?? []).forEach((row, i) => {
            order(
              `de-route-R18-freedom-subsequentTrips-${i}-returned`,
              row.departed,
              row.returned,
            );
          });
        }
      }
      break;
    case 4:
      for (const section of Object.values(citizenshipSections))
        fields(section, draft.citizenship ?? {}, 'de-nat');
      if (
        submitting &&
        draft.citizenship?.knowledge &&
        'correct' in draft.citizenship.knowledge &&
        (draft.citizenship.knowledge.correct < 0 ||
          draft.citizenship.knowledge.correct > 33)
      )
        errors['de-nat-knowledge-correct'] = 'de.error.score';
      for (const key of ['R08', 'R16', 'R17'] as const) {
        if (!draft.routes.includes(key)) continue;
        const values =
          key === 'R08'
            ? {
                marriedOn: draft.marriedOn,
                spouseGermanSince: draft.spouseGermanSince,
                spouse: draft.citizenship?.spouse,
              }
            : (draft.citizenship ?? {});
        fields(
          citizenshipRouteFields[key] as unknown as GermanyField[],
          values,
          `de-nat-${key}`,
        );
      }
      break;
    case 5:
      fields(feeFields, draft.fees ?? {}, 'de-fees');
      break;
  }
  return errors;
}

export function validateGermanyStep(draft: GermanyDraft) {
  return checkStep(draft, draft.step, true);
}

// Migrate legacy time-only DeForm / DeRequest drafts into full GermanyDrafts.
function migrateLegacyGermanyDraft(
  raw: Record<string, unknown>,
): GermanyDraft | undefined {
  if (
    typeof raw.simulationDate !== 'string' ||
    !validDate(raw.simulationDate) ||
    (!('settlementRoute' in raw) && !('naturalisationRoute' in raw))
  )
    return undefined;
  const settlementMap: Record<string, DeFullRoute> = {
    general: 'R01',
    skilled: 'R02',
    'blue-card': 'R03',
    'german-family': 'R04',
    refugee: raw.germanC1 === true ? 'R05-fast' : 'R05',
  };
  const natMap: Record<string, DeFullRoute> = {
    general: 'R07',
    spouse: 'R08',
  };
  const routes: DeFullRoute[] = ['R00'];
  const sRoute =
    typeof raw.settlementRoute === 'string'
      ? settlementMap[raw.settlementRoute]
      : undefined;
  if (sRoute) routes.push(sRoute);
  routes.push('R06');
  const nRoute =
    typeof raw.naturalisationRoute === 'string'
      ? natMap[raw.naturalisationRoute]
      : undefined;
  if (nRoute) routes.push(nRoute);
  const parseMonths = (v: unknown) => {
    if (typeof v === 'number' && Number.isSafeInteger(v) && v >= 0) return v;
    if (typeof v === 'string' && /^\d{1,3}$/.test(v.trim()))
      return Number(v.trim());
    return undefined;
  };
  const permits = Array.isArray(raw.permits)
    ? raw.permits.flatMap((p) => {
        if (
          !isRecord(p) ||
          typeof p.kind !== 'string' ||
          !DE_PERMIT_KINDS.includes(p.kind as DePermitKind) ||
          typeof p.from !== 'string' ||
          !validDate(p.from)
        )
          return [];
        const kind = p.kind as DePermitKind;
        const to =
          typeof p.to === 'string' && p.to && hasEndDate(kind)
            ? p.to
            : undefined;
        if (to && !validDate(to)) return [];
        return [
          {
            kind,
            from: p.from,
            ...(to ? { to } : {}),
            ...(typeof p.renewing === 'boolean' && hasEndDate(kind)
              ? { renewing: p.renewing }
              : {}),
          },
        ];
      })
    : [];
  const trips = Array.isArray(raw.trips)
    ? raw.trips.flatMap((t) => {
        if (
          !isRecord(t) ||
          typeof t.departed !== 'string' ||
          !validDate(t.departed) ||
          typeof t.returned !== 'string' ||
          !validDate(t.returned)
        )
          return [];
        return [{ departed: t.departed, returned: t.returned }];
      })
    : [];
  const contributionMonths = parseMonths(raw.contributionMonths);
  const blueCardEmploymentMonths = parseMonths(
    raw.blueCardEmploymentMonths ?? raw.blueCardMonths,
  );
  const germanB1 = typeof raw.germanB1 === 'boolean' ? raw.germanB1 : undefined;
  const germanC1 = typeof raw.germanC1 === 'boolean' ? raw.germanC1 : undefined;
  return {
    ...createGermanyDraft(),
    completed: true,
    simulationDate: raw.simulationDate,
    firstEntry:
      typeof raw.firstEntry === 'string' && validDate(raw.firstEntry)
        ? raw.firstEntry
        : undefined,
    routes,
    permits,
    trips,
    contributionMonths,
    blueCardEmploymentMonths,
    trainedInGermany:
      typeof raw.trainedInGermany === 'boolean'
        ? raw.trainedInGermany
        : undefined,
    germanB1,
    germanC1,
    marriedOn:
      typeof raw.marriedOn === 'string' && validDate(raw.marriedOn)
        ? raw.marriedOn
        : undefined,
    spouseGermanSince:
      typeof raw.spouseGermanSince === 'string' &&
      validDate(raw.spouseGermanSince)
        ? raw.spouseGermanSince
        : undefined,
    common: {
      ...(germanC1
        ? { provenGerman: 'C1' }
        : germanB1
          ? { provenGerman: 'B1' }
          : {}),
    },
  };
}

function mapAnswers(
  record: object,
  fields: GermanyField[],
  writing: boolean,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...record };
  for (const field of fields) {
    const key = field.name;
    const value = result[key];
    if (writing && field.when && !field.when(result)) continue;
    if (field.type === 'boolean' && !field.required) {
      if (writing && value === undefined) result[key] = null;
      else if (!writing && value === null) delete result[key];
    } else if (field.type === 'list' && Array.isArray(value)) {
      result[key] = value.map((row) =>
        isRecord(row) ? mapAnswers(row, field.fields, writing) : row,
      );
    } else if (
      writing &&
      (field.type === 'number-list' || field.type === 'integer-list') &&
      Array.isArray(value)
    ) {
      // Unfinished empty rows are not saved; a list of them reads as unanswered.
      const filled = value.filter((item) => !Number.isNaN(item));
      result[key] = filled.length || !value.length ? filled : undefined;
    } else if (field.type === 'group' && isRecord(value)) {
      const group = mapAnswers(value, field.fields, writing);
      // A group holding only pending answers reads back as unanswered.
      if (writing || Object.keys(group).length || !Object.keys(value).length)
        result[key] = group;
      else delete result[key];
    }
  }
  return result;
}

function mapMobility(
  mobility: GermanyDraft['mobility'],
  writing: boolean,
): Record<string, unknown> | undefined {
  if (!mobility) return mobility;
  return {
    ...mobility,
    ...(mobility.titles
      ? {
          titles: mobility.titles.map((t) =>
            mapAnswers(t, titleReviewFields, writing),
          ),
        }
      : {}),
    ...(mobility.blueCard
      ? { blueCard: mapAnswers(mobility.blueCard, blueCardFields, writing) }
      : {}),
    ...(mobility.freedom
      ? { freedom: mapAnswers(mobility.freedom, freeMovementFields, writing) }
      : {}),
  };
}

// Each answered object writes its own pending yes/no questions as null.
export function storeGermanyAnswers(draft: GermanyDraft): object {
  if (draft.answerFormat !== 'explicit') return draft;
  const write = (record: object | undefined, fields: GermanyField[]) =>
    record && Object.keys(record).length
      ? mapAnswers(record, fields, true)
      : record;
  return {
    ...draft,
    permits: draft.permits?.map((p) => mapAnswers(p, permitFields, true)),
    common: write(draft.common, allCommonFields),
    settlement: write(
      draft.settlement,
      settlementFields(selectedSettlementDetailRoutes(draft)),
    ),
    mobility: mapMobility(draft.mobility, true),
    citizenship: write(draft.citizenship, citizenshipFields(draft.routes)),
    fees: write(draft.fees, feeFields),
  };
}

export function readGermanyAnswers(draft: GermanyDraft): GermanyDraft {
  if (draft.answerFormat !== 'explicit') return draft;
  return {
    ...draft,
    permits: draft.permits?.map(
      (p) => mapAnswers(p, permitFields, false) as unknown as typeof p,
    ),
    common: draft.common
      ? (mapAnswers(
          draft.common,
          allCommonFields,
          false,
        ) as GermanyDraft['common'])
      : draft.common,
    settlement: draft.settlement
      ? (mapAnswers(
          draft.settlement,
          allSettlementFields,
          false,
        ) as GermanyDraft['settlement'])
      : draft.settlement,
    mobility: mapMobility(
      draft.mobility,
      false,
    ) as unknown as GermanyDraft['mobility'],
    citizenship: draft.citizenship
      ? (mapAnswers(
          draft.citizenship,
          allCitizenshipFields,
          false,
        ) as GermanyDraft['citizenship'])
      : draft.citizenship,
    fees: draft.fees
      ? (mapAnswers(draft.fees, feeFields, false) as GermanyDraft['fees'])
      : draft.fees,
  };
}

export function decodeGermanyDraft(
  value: unknown,
  mode: DraftReadMode = false,
): GermanyDraft | undefined {
  if (!isRecord(value)) return undefined;
  if (!('version' in value)) {
    // A migrated draft is only complete if every visible step passes.
    const migrated = migrateLegacyGermanyDraft(value);
    return migrated && restoreStoredGermanyDraft(migrated);
  }
  if (
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !Array.isArray(value.routes) ||
    value.routes.some(
      (r) =>
        typeof r !== 'string' || !DE_FULL_ROUTES.includes(r as DeFullRoute),
    )
  )
    return undefined;
  for (const key of [
    'common',
    'settlement',
    'mobility',
    'citizenship',
    'fees',
  ] as const) {
    if (value[key] !== undefined && !isRecord(value[key])) return undefined;
  }
  for (const listKey of ['permits', 'trips'] as const) {
    if (value[listKey] !== undefined && !Array.isArray(value[listKey]))
      return undefined;
  }
  const decoded = readGermanyAnswers(value as unknown as GermanyDraft);
  const steps = germanySteps(decoded);
  if (!steps.some(({ step }) => step === decoded.step)) return undefined;
  const requireComplete = mode === true || decoded.completed;
  for (const { step } of steps) {
    const issues = checkStep(decoded, step, requireComplete);
    if (Object.keys(issues).length) {
      if (
        mode === 'show-correction' &&
        !Object.keys(checkStep(decoded, step, false)).length
      )
        return { ...decoded, completed: false, step };
      return undefined;
    }
  }
  return decoded;
}

export function restoreStoredGermanyDraft(
  draft: GermanyDraft,
  forResult = false,
): GermanyDraft {
  const steps = germanySteps(draft);
  for (const { step } of steps) {
    const errors = checkStep(draft, step, draft.completed || forResult);
    if (Object.keys(errors).length) {
      return { ...draft, completed: false, step };
    }
  }
  if (!steps.some(({ step }) => step === draft.step)) {
    return { ...draft, step: steps[0].step };
  }
  return draft;
}
