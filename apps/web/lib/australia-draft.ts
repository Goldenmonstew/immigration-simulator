import {
  AU_FULL_PATHWAYS,
  type AuFullRequest,
  type AuSubclass,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import {
  citizenshipFields,
  employerCommonFields,
  englishFields,
  feeFields,
  innovationFields,
  nominationFields,
  partnerApplicationField,
  partnerFields,
  publicInterestFields,
  regionalFields,
  rrvFields,
  skillsFields,
  step0Fields,
  type AustraliaField,
} from './australia-fields';
import { today, validDate } from './questionnaire';

export interface AustraliaDraft
  extends CountryDraft, Omit<AuFullRequest, 'locale'> {
  noTrips?: boolean;
}

export function createAustraliaDraft(): AustraliaDraft {
  return {
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
  };
}

const stepTitles = [
  'au.form.step0',
  'au.form.step1',
  'au.form.step2',
  'au.form.step3',
  'au.form.step4',
  'au.form.step5',
  'au.form.step6',
] as const;

export function australiaSteps(draft: AustraliaDraft) {
  const p = draft.pathway;
  return stepTitles.flatMap((title, step) => {
    const enabled =
      step === 0 ||
      step === 1 ||
      step === 6 ||
      !p ||
      (step === 2 && (p === 'AU-186-TRT' || p === 'AU-186-DE')) ||
      (step === 3 && (p === 'AU-189-PT' || p === 'AU-190' || p === 'AU-858')) ||
      (step === 4 && (p === 'AU-191' || p === 'AU-191-HK')) ||
      (step === 5 && (p === 'AU-PARTNER' || p === 'AU-RRV'));
    return enabled ? [{ step, title }] : [];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Answers on steps hidden by the selected pathway stay in the local draft,
// but they are neither assessed nor shared.
const stepAnswers: Record<number, (keyof AustraliaDraft)[]> = {
  2: ['employer'],
  3: ['skills', 'innovation'],
  4: ['regional'],
  5: ['partnerApplication', 'partner', 'rrv'],
};

export function activeAustraliaAnswers(draft: AustraliaDraft): AustraliaDraft {
  const visible = new Set(australiaSteps(draft).map(({ step }) => step));
  const next = { ...draft };
  for (const [step, keys] of Object.entries(stepAnswers))
    if (!visible.has(Number(step))) for (const key of keys) delete next[key];
  return next;
}

type Errors = Record<string, TranslationKey>;

const allPathways = new Set<string>(AU_FULL_PATHWAYS);

function checkFields(
  fields: AustraliaField[],
  record: object,
  prefix: string,
  required: boolean,
  errors: Errors,
) {
  const answers = record as Record<string, unknown>;
  for (const field of fields) {
    const id = `${prefix}-${field.name}`;
    const value = answers[field.name];
    if (value === undefined || value === '') {
      if (required && field.required) errors[id] = 'au.form.required';
      continue;
    }
    switch (field.type) {
      case 'pathway':
        if (typeof value !== 'string' || !allPathways.has(value))
          errors[id] = 'au.form.required';
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'au.form.required';
        break;
      case 'choice':
        if (!field.options.some((opt) => opt === value))
          errors[id] = 'au.form.required';
        break;
      case 'date':
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'au.error.date';
        break;
      case 'null-date':
        if (value === null) break;
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'au.error.date';
        break;
      case 'status-date':
        if (field.literals.some((lit) => lit === value)) break;
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'au.error.date';
        break;
      case 'number':
      case 'integer':
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (required && value < 0)
        )
          errors[id] = 'au.form.numberError';
        else if (
          required &&
          field.type === 'integer' &&
          !Number.isSafeInteger(value)
        )
          errors[id] = 'au.form.integerError';
        break;
      case 'scores':
        if (
          !Array.isArray(value) ||
          value.length !== 4 ||
          value.some(
            (n) =>
              n !== null &&
              (typeof n !== 'number' ||
                !Number.isFinite(n) ||
                (required && n < 0)),
          )
        )
          errors[id] = 'au.form.numberError';
        else if (required && value.includes(null))
          errors[id] = 'au.form.scoresError';
        break;
      case 'year-list':
        // An unfinished row can be blank or partly typed.
        if (!Array.isArray(value)) errors[id] = 'au.form.required';
        else
          value.forEach((y, i) => {
            if (y === null && !required) return;
            if (
              typeof y !== 'number' ||
              !Number.isSafeInteger(y) ||
              (required && (y < 1900 || y > 2100))
            )
              errors[`${id}-${i}`] = 'au.form.yearError';
          });
        break;
      case 'group':
        if (isRecord(value))
          checkFields(field.fields, value, id, required, errors);
        else errors[id] = 'au.form.required';
        break;
      case 'union-group':
        if (field.literals.some((lit) => lit === value)) break;
        if (isRecord(value))
          checkFields(field.fields, value, id, required, errors);
        else errors[id] = 'au.form.required';
        break;
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'au.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (isRecord(row))
            checkFields(field.fields, row, `${id}-${i}`, required, errors);
          else errors[id] = 'au.form.required';
        });
        break;
    }
  }
}

export function checkAustraliaStep(
  draft: AustraliaDraft,
  step: number,
  submitting: boolean,
): Errors {
  const errors: Errors = {};
  // Date order is checked on submission; an unfinished draft can hold a
  // temporary reversal and still be restored.
  const order = (
    id: string,
    start?: unknown,
    end?: unknown,
    key: TranslationKey = 'au.error.order',
  ) => {
    if (
      submitting &&
      typeof start === 'string' &&
      typeof end === 'string' &&
      validDate(start) &&
      validDate(end) &&
      end < start
    )
      errors[id] ??= key;
  };
  switch (step) {
    case 0:
      checkFields(step0Fields, draft, 'au', submitting, errors);
      order('au-dateOfBirth', draft.dateOfBirth, draft.simulationDate);
      order(
        'au-firstArrival',
        draft.dateOfBirth,
        draft.firstArrival,
        'au.error.beforeBirth',
      );
      if (Array.isArray(draft.visas)) {
        draft.visas.forEach((visa, i) => {
          if (!isRecord(visa)) return;
          order(`au-visas-${i}-to`, visa.from, visa.to);
        });
      }
      if (Array.isArray(draft.trips)) {
        draft.trips.forEach((trip, i) => {
          if (!isRecord(trip)) return;
          order(`au-trips-${i}-returned`, trip.departed, trip.returned);
          if (
            submitting &&
            validDate(trip.departed) &&
            (!draft.firstArrival ||
              !validDate(draft.firstArrival) ||
              trip.departed < draft.firstArrival)
          ) {
            errors[`au-trips-${i}-departed`] = 'au.error.beforeArrival';
          }
        });
      }
      break;
    case 1:
      if (draft.english !== undefined) {
        if (!isRecord(draft.english)) errors['au-english'] = 'au.form.required';
        else
          checkFields(
            englishFields,
            draft.english,
            'au-english',
            submitting,
            errors,
          );
      }
      if (
        draft.secondInstalmentPaid !== undefined &&
        typeof draft.secondInstalmentPaid !== 'boolean'
      ) {
        errors['au-secondInstalmentPaid'] = 'au.form.required';
      }
      if (draft.fees !== undefined) {
        if (!isRecord(draft.fees)) errors['au-fees'] = 'au.form.required';
        else checkFields(feeFields, draft.fees, 'au-fees', submitting, errors);
      }
      break;
    case 2:
      if (draft.employer !== undefined) {
        if (!isRecord(draft.employer))
          errors['au-employer'] = 'au.form.required';
        else {
          checkFields(
            employerCommonFields,
            draft.employer,
            'au-employer',
            submitting,
            errors,
          );
          order(
            'au-employer-assessment-expires',
            draft.employer.assessment?.issued,
            draft.employer.assessment?.expires,
          );
          const noms = draft.employer.nominations;
          if (noms !== undefined) {
            if (!isRecord(noms))
              errors['au-employer-nominations'] = 'au.form.required';
            else {
              for (const stream of ['AU-186-TRT', 'AU-186-DE'] as const) {
                const nom = noms[stream];
                if (nom !== undefined) {
                  const prefix = `au-employer-nominations-${stream}`;
                  if (!isRecord(nom)) errors[prefix] = 'au.form.required';
                  else {
                    checkFields(
                      nominationFields,
                      nom,
                      prefix,
                      submitting,
                      errors,
                    );
                    order(`${prefix}-approved`, nom.lodged, nom.approved);
                  }
                }
              }
            }
          }
        }
      }
      break;
    case 3:
      if (draft.skills !== undefined) {
        if (!isRecord(draft.skills)) errors['au-skills'] = 'au.form.required';
        else {
          checkFields(
            skillsFields,
            draft.skills,
            'au-skills',
            submitting,
            errors,
          );
          order(
            'au-skills-assessment-expires',
            draft.skills.assessment?.issued,
            draft.skills.assessment?.expires,
          );
          for (const id of ['AU-189-PT', 'AU-190'] as const) {
            const invitation = draft.skills.invitations?.[id];
            if (isRecord(invitation))
              order(
                `au-skills-invitations-${id}-deadline`,
                invitation.issued,
                invitation.deadline,
              );
          }
        }
      }
      if (draft.innovation !== undefined) {
        if (!isRecord(draft.innovation))
          errors['au-innovation'] = 'au.form.required';
        else {
          checkFields(
            innovationFields,
            draft.innovation,
            'au-innovation',
            submitting,
            errors,
          );
          if (isRecord(draft.innovation.invitation)) {
            order(
              'au-innovation-invitation-deadline',
              draft.innovation.invitation.issued,
              draft.innovation.invitation.deadline,
            );
          }
        }
      }
      break;
    case 4:
      if (draft.regional !== undefined) {
        if (!isRecord(draft.regional))
          errors['au-regional'] = 'au.form.required';
        else
          checkFields(
            regionalFields,
            draft.regional,
            'au-regional',
            submitting,
            errors,
          );
      }
      break;
    case 5: {
      checkFields([partnerApplicationField], draft, 'au', submitting, errors);
      if (draft.partner !== undefined) {
        if (!isRecord(draft.partner)) errors['au-partner'] = 'au.form.required';
        else
          checkFields(
            partnerFields,
            draft.partner,
            'au-partner',
            submitting,
            errors,
          );
      }
      if (draft.rrv !== undefined) {
        if (!isRecord(draft.rrv)) errors['au-rrv'] = 'au.form.required';
        else checkFields(rrvFields, draft.rrv, 'au-rrv', submitting, errors);
      }
      break;
    }
    case 6:
      if (draft.citizenship !== undefined) {
        if (!isRecord(draft.citizenship))
          errors['au-citizenship'] = 'au.form.required';
        else
          checkFields(
            citizenshipFields,
            draft.citizenship,
            'au-citizenship',
            submitting,
            errors,
          );
      }
      if (draft.publicInterest !== undefined) {
        if (!isRecord(draft.publicInterest))
          errors['au-publicInterest'] = 'au.form.required';
        else
          checkFields(
            publicInterestFields,
            draft.publicInterest,
            'au-publicInterest',
            submitting,
            errors,
          );
      }
      break;
  }
  return errors;
}

export function validateAustraliaStep(draft: AustraliaDraft): Errors {
  return checkAustraliaStep(draft, draft.step, true);
}

// The earlier single-page form had exactly these fields and no version.
const legacyFormKeys = new Set([
  'simulationDate',
  'dateOfBirth',
  'firstArrival',
  'visas',
  'trips',
  'sponsoredFullTime',
  'partner',
  'partnerLodged',
  'partnerStream',
  'longTermRelationship',
  'hongKong',
  'regionalSince',
]);

// Migrate a legacy time-only AuForm into a versioned full AustraliaDraft.
export function migrateLegacyAuForm(
  value: Record<string, unknown>,
): AustraliaDraft | undefined {
  if (
    !Object.keys(value).every((key) => legacyFormKeys.has(key)) ||
    typeof value.simulationDate !== 'string' ||
    typeof value.partner !== 'boolean' ||
    typeof value.hongKong !== 'boolean' ||
    !Array.isArray(value.visas) ||
    !Array.isArray(value.trips)
  )
    return undefined;
  const visas = value.visas.flatMap((v) => {
    if (
      !isRecord(v) ||
      typeof v.subclass !== 'string' ||
      typeof v.from !== 'string'
    )
      return [];
    return [
      {
        subclass: v.subclass as AuSubclass,
        from: v.from,
        ...(typeof v.to === 'string' && v.to ? { to: v.to } : {}),
      },
    ];
  });
  const trips = value.trips.flatMap((t) => {
    if (
      !isRecord(t) ||
      typeof t.departed !== 'string' ||
      typeof t.returned !== 'string'
    )
      return [];
    return [{ departed: t.departed, returned: t.returned }];
  });
  const stream =
    value.partnerStream === 'offshore' ? 'offshore' : ('onshore' as const);
  const lodged =
    typeof value.partnerLodged === 'string' && validDate(value.partnerLodged)
      ? value.partnerLodged
      : undefined;
  const regionalSince =
    typeof value.regionalSince === 'string' && validDate(value.regionalSince)
      ? value.regionalSince
      : undefined;
  const draft: AustraliaDraft = {
    version: 1,
    step: 0,
    completed: validDate(value.simulationDate),
    simulationDate: value.simulationDate,
    ...(typeof value.dateOfBirth === 'string' && value.dateOfBirth
      ? { dateOfBirth: value.dateOfBirth }
      : {}),
    ...(typeof value.firstArrival === 'string' && value.firstArrival
      ? { firstArrival: value.firstArrival }
      : {}),
    visas,
    trips,
    ...(typeof value.sponsoredFullTime === 'boolean'
      ? { sponsoredFullTime: value.sponsoredFullTime }
      : {}),
    ...(value.partner
      ? lodged
        ? {
            partnerApplication: {
              lodged,
              stream,
              ...(typeof value.longTermRelationship === 'boolean'
                ? { longTermRelationship: value.longTermRelationship }
                : {}),
            },
          }
        : { partner: { stream } }
      : {}),
    ...(value.hongKong
      ? {
          hongKongPassport: true,
          hongKongPrimaryVisaTerms: true,
          ...(regionalSince
            ? { regional: { hongKongOnlySince: regionalSince } }
            : {}),
        }
      : {}),
  };
  return draft;
}

export function decodeAustraliaDraft(
  value: unknown,
  mode: DraftReadMode = false,
): AustraliaDraft | undefined {
  if (!isRecord(value)) return undefined;
  if (!('version' in value)) {
    const migrated = migrateLegacyAuForm(value);
    return migrated && decodeAustraliaDraft(migrated, mode);
  }
  if (
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= stepTitles.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    (value.noTrips !== undefined && typeof value.noTrips !== 'boolean')
  )
    return undefined;

  const draft = value as unknown as AustraliaDraft;
  const visible = australiaSteps(draft);
  if (!visible.some((s) => s.step === draft.step)) return undefined;

  for (let step = 0; step < stepTitles.length; step++) {
    if (Object.keys(checkAustraliaStep(draft, step, false)).length > 0)
      return undefined;
  }

  if (draft.completed) {
    for (const { step } of visible) {
      if (Object.keys(checkAustraliaStep(draft, step, true)).length > 0) {
        if (mode === 'show-correction') {
          return { ...draft, completed: false, step };
        }
        return undefined;
      }
    }
  }

  return draft;
}
