import {
  AU_FULL_PATHWAYS,
  AU_PERMANENT_SUBCLASSES,
  AU_TEMPORARY_SUBCLASSES,
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
    trips: [],
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
      (step === 3 &&
        (p === 'AU-189-PT' || p === 'AU-190' || p === 'AU-858')) ||
      (step === 4 &&
        (p === 'AU-191' || p === 'AU-189-HK' || p === 'AU-191-HK')) ||
      (step === 5 && (p === 'AU-PARTNER' || p === 'AU-RRV'));
    return enabled ? [{ step, title }] : [];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Convert form-friendly fields into the exact engine request shape.
export function activeAustraliaAnswers(draft: AustraliaDraft): AustraliaDraft {
  const next: AustraliaDraft = { ...draft };

  if (next.english) {
    const eng = { ...next.english } as Record<string, unknown>;
    if (isRecord(eng.test)) {
      const test = { ...eng.test };
      const parts = [
        test.listening,
        test.reading,
        test.writing,
        test.speaking,
      ];
      if (parts.every((n) => typeof n === 'number' && Number.isFinite(n))) {
        test.components = parts as [number, number, number, number];
      } else if (
        Array.isArray(test.components) &&
        test.components.length === 4 &&
        test.components.every((n) => typeof n === 'number')
      ) {
        const [l, r, w, s] = test.components as number[];
        test.listening ??= l;
        test.reading ??= r;
        test.writing ??= w;
        test.speaking ??= s;
      } else {
        delete test.components;
      }
      eng.test = typeof test.name === 'string' ? test : undefined;
    }
    next.english = eng as AustraliaDraft['english'];
  }

  if (next.employer) {
    const emp = { ...next.employer };
    if (emp.assessment && !emp.assessment.kind) delete emp.assessment;
    next.employer = emp;
  }

  if (next.skills) {
    const sk = { ...next.skills } as Record<string, unknown>;
    const inv189 =
      sk.invitation189 ??
      (isRecord(sk.invitations) ? sk.invitations['AU-189-PT'] : undefined);
    const inv190 =
      sk.invitation190 ??
      (isRecord(sk.invitations) ? sk.invitations['AU-190'] : undefined);
    const cleanInv = (val: unknown) => {
      if (val === 'awaiting') return 'awaiting' as const;
      if (isRecord(val) && typeof val.issued === 'string' && validDate(val.issued))
        return val as { issued: string; deadline?: string; score?: number };
      return undefined;
    };
    const c189 = cleanInv(inv189);
    const c190 = cleanInv(inv190);
    if (c189 !== undefined || c190 !== undefined) {
      sk.invitations = {
        ...(c189 !== undefined ? { 'AU-189-PT': c189 } : {}),
        ...(c190 !== undefined ? { 'AU-190': c190 } : {}),
      };
    } else {
      delete sk.invitations;
    }

    const occ189 =
      typeof sk.occupationInInvitation189 === 'boolean'
        ? sk.occupationInInvitation189
        : isRecord(sk.occupationInInvitation)
          ? sk.occupationInInvitation['AU-189-PT']
          : undefined;
    const occ190 =
      typeof sk.occupationInInvitation190 === 'boolean'
        ? sk.occupationInInvitation190
        : isRecord(sk.occupationInInvitation)
          ? sk.occupationInInvitation['AU-190']
          : undefined;
    if (typeof occ189 === 'boolean' || typeof occ190 === 'boolean') {
      sk.occupationInInvitation = {
        ...(typeof occ189 === 'boolean' ? { 'AU-189-PT': occ189 } : {}),
        ...(typeof occ190 === 'boolean' ? { 'AU-190': occ190 } : {}),
      };
    } else {
      delete sk.occupationInInvitation;
    }

    if (isRecord(sk.assessment) && !sk.assessment.kind) delete sk.assessment;
    if (isRecord(sk.points)) {
      const pts = { ...sk.points };
      if (
        isRecord(pts.australianStudy) &&
        typeof pts.australianStudy.qualifying !== 'boolean'
      ) {
        delete pts.australianStudy;
      }
      sk.points = pts;
    }
    next.skills = sk as AustraliaDraft['skills'];
  }

  if (next.innovation) {
    const inn = { ...next.innovation } as Record<string, unknown>;
    if (
      isRecord(inn.invitation) &&
      (typeof inn.invitation.issued !== 'string' ||
        !validDate(inn.invitation.issued))
    ) {
      delete inn.invitation;
    }
    next.innovation = inn as AustraliaDraft['innovation'];
  }

  const pApp = next.partnerApplication;
  const pObj = (next.partner ? { ...next.partner } : {}) as Record<
    string,
    unknown
  >;
  const lodged =
    (typeof pObj.partnerLodged === 'string' && pObj.partnerLodged) ||
    pApp?.lodged;
  const stream =
    (pObj.stream as 'onshore' | 'offshore' | undefined) ?? pApp?.stream;
  const longTerm =
    typeof pObj.longTermRelationship === 'boolean'
      ? pObj.longTermRelationship
      : pApp?.longTermRelationship;
  if (stream) pObj.stream = stream;
  if (lodged && validDate(lodged) && (stream === 'onshore' || stream === 'offshore')) {
    next.partnerApplication = {
      lodged,
      stream,
      ...(typeof longTerm === 'boolean'
        ? { longTermRelationship: longTerm }
        : {}),
    };
  } else {
    delete next.partnerApplication;
  }
  if (
    isRecord(pObj.temporaryGrant) &&
    pObj.temporaryGrant.basis !== 'ordinary' &&
    pObj.temporaryGrant.basis !== 'ministerial'
  ) {
    delete pObj.temporaryGrant;
  }
  if (Object.keys(pObj).length > 0) {
    next.partner = pObj as AustraliaDraft['partner'];
  }

  if (next.citizenship) {
    const cit = { ...next.citizenship } as Record<string, unknown>;
    if (
      isRecord(cit.scv) &&
      (typeof cit.scv.firstGrant !== 'string' || !validDate(cit.scv.firstGrant))
    ) {
      delete cit.scv;
    }
    if (
      isRecord(cit.test) &&
      (typeof cit.test.correct !== 'number' ||
        typeof cit.test.valuesCorrect !== 'number')
    ) {
      delete cit.test;
    }
    if (
      isRecord(cit.lastPrisonSentence) &&
      (typeof cit.lastPrisonSentence.months !== 'number' ||
        typeof cit.lastPrisonSentence.firstFreeDay !== 'string' ||
        !validDate(cit.lastPrisonSentence.firstFreeDay))
    ) {
      delete cit.lastPrisonSentence;
    }
    next.citizenship = cit as AustraliaDraft['citizenship'];
  }

  if (next.publicInterest) {
    const pic = { ...next.publicInterest } as Record<string, unknown>;
    if (isRecord(pic.integrity)) {
      const info = pic.integrity;
      const hasAllRequired =
        typeof info.identityEstablished === 'boolean' &&
        typeof info.accurateDocuments === 'boolean' &&
        (info.lastIdentityRefusal === null ||
          (typeof info.lastIdentityRefusal === 'string' &&
            validDate(info.lastIdentityRefusal))) &&
        (info.lastDocumentRefusal === null ||
          (typeof info.lastDocumentRefusal === 'string' &&
            validDate(info.lastDocumentRefusal)));
      const definiteFailure =
        info.identityEstablished === false ||
        (info.accurateDocuments === false &&
          info.documentWaiver !== 'granted' &&
          info.documentWaiver !== 'pending');
      if (!hasAllRequired && !definiteFailure) {
        delete pic.integrity;
      } else if (!hasAllRequired && definiteFailure) {
        pic.integrity = {
          identityEstablished: info.identityEstablished !== false,
          accurateDocuments: info.accurateDocuments !== false,
          lastIdentityRefusal:
            typeof info.lastIdentityRefusal === 'string'
              ? info.lastIdentityRefusal
              : null,
          lastDocumentRefusal:
            typeof info.lastDocumentRefusal === 'string'
              ? info.lastDocumentRefusal
              : null,
          ...(info.documentWaiver
            ? { documentWaiver: info.documentWaiver }
            : {}),
        };
      }
    }
    if (
      isRecord(pic.sponsoredStudy) &&
      typeof pic.sponsoredStudy.applies !== 'boolean'
    ) {
      delete pic.sponsoredStudy;
    }
    next.publicInterest = pic as AustraliaDraft['publicInterest'];
  }

  return next;
}

type Errors = Record<string, TranslationKey>;

const allSubclasses = new Set<string>([
  ...AU_TEMPORARY_SUBCLASSES,
  ...AU_PERMANENT_SUBCLASSES,
]);
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
        if (
          field.literals.some((lit) => lit === value)
        )
          break;
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
      case 'year-list':
        if (
          !Array.isArray(value) ||
          value.some(
            (y) =>
              typeof y !== 'number' ||
              !Number.isSafeInteger(y) ||
              y < 1900 ||
              y > 2100,
          )
        )
          errors[id] = 'au.form.yearError';
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

function order(
  errors: Errors,
  id: string,
  start?: unknown,
  end?: unknown,
  key: TranslationKey = 'au.error.order',
) {
  if (
    typeof start === 'string' &&
    typeof end === 'string' &&
    validDate(start) &&
    validDate(end) &&
    end < start
  ) {
    errors[id] ??= key;
  }
}

export function checkAustraliaStep(
  draft: AustraliaDraft,
  step: number,
  submitting: boolean,
): Errors {
  const errors: Errors = {};
  switch (step) {
    case 0:
      checkFields(step0Fields, draft, 'au', submitting, errors);
      order(
        errors,
        'au-dateOfBirth',
        draft.dateOfBirth,
        draft.simulationDate,
      );
      order(
        errors,
        'au-firstArrival',
        draft.dateOfBirth,
        draft.firstArrival,
        'au.error.beforeBirth',
      );
      if (Array.isArray(draft.visas)) {
        draft.visas.forEach((visa, i) => {
          if (! isRecord(visa)) return;
          if (!allSubclasses.has(visa.subclass))
            errors[`au-visas-${i}-subclass`] = 'au.form.required';
          order(errors, `au-visas-${i}-to`, visa.from, visa.to);
        });
      }
      if (Array.isArray(draft.trips)) {
        draft.trips.forEach((trip, i) => {
          if (!isRecord(trip)) return;
          order(errors, `au-trips-${i}-returned`, trip.departed, trip.returned);
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
        else {
          const eng = { ...draft.english } as Record<string, unknown>;
          if (isRecord(eng.test) && Array.isArray(eng.test.components)) {
            if (
              eng.test.components.length !== 4 ||
              eng.test.components.some(
                (n) => typeof n !== 'number' || !Number.isFinite(n) || n < 0,
              )
            )
              errors['au-english-test-listening'] = 'au.form.numberError';
          }
          checkFields(englishFields, eng, 'au-english', submitting, errors);
        }
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
            errors,
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
                    order(
                      errors,
                      `${prefix}-approved`,
                      nom.lodged,
                      nom.approved,
                    );
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
          const sk = {
            ...draft.skills,
            ...(draft.skills.invitations?.['AU-189-PT'] !== undefined
              ? { invitation189: draft.skills.invitations['AU-189-PT'] }
              : {}),
            ...(draft.skills.invitations?.['AU-190'] !== undefined
              ? { invitation190: draft.skills.invitations['AU-190'] }
              : {}),
            ...(draft.skills.occupationInInvitation?.['AU-189-PT'] !== undefined
              ? {
                  occupationInInvitation189:
                    draft.skills.occupationInInvitation['AU-189-PT'],
                }
              : {}),
            ...(draft.skills.occupationInInvitation?.['AU-190'] !== undefined
              ? {
                  occupationInInvitation190:
                    draft.skills.occupationInInvitation['AU-190'],
                }
              : {}),
          };
          checkFields(skillsFields, sk, 'au-skills', submitting, errors);
          order(
            errors,
            'au-skills-assessment-expires',
            draft.skills.assessment?.issued,
            draft.skills.assessment?.expires,
          );
          if (isRecord(sk.invitation189)) {
            order(
              errors,
              'au-skills-invitation189-deadline',
              sk.invitation189.issued,
              sk.invitation189.deadline,
            );
          }
          if (isRecord(sk.invitation190)) {
            order(
              errors,
              'au-skills-invitation190-deadline',
              sk.invitation190.issued,
              sk.invitation190.deadline,
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
              errors,
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
      if (
        draft.partnerApplication !== undefined &&
        !isRecord(draft.partnerApplication)
      ) {
        errors['au-partner-partnerLodged'] = 'au.error.date';
      }
      if (
        draft.partner !== undefined ||
        draft.partnerApplication !== undefined
      ) {
        if (draft.partner !== undefined && !isRecord(draft.partner)) {
          errors['au-partner'] = 'au.form.required';
        } else {
          const combined = {
            ...draft.partner,
            ...(draft.partnerApplication?.lodged !== undefined
              ? { partnerLodged: draft.partnerApplication.lodged }
              : {}),
            ...(draft.partnerApplication?.stream !== undefined
              ? { stream: draft.partnerApplication.stream }
              : {}),
            ...(draft.partnerApplication?.longTermRelationship !== undefined
              ? {
                  longTermRelationship:
                    draft.partnerApplication.longTermRelationship,
                }
              : {}),
          };
          checkFields(
            partnerFields,
            combined,
            'au-partner',
            submitting,
            errors,
          );
        }
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

// Migrate a legacy time-only AuForm into a versioned full AustraliaDraft.
export function migrateLegacyAuForm(
  value: Record<string, unknown>,
): AustraliaDraft | undefined {
  if (
    typeof value.simulationDate !== 'string' ||
    typeof value.partner !== 'boolean' ||
    typeof value.hongKong !== 'boolean' ||
    !Array.isArray(value.visas) ||
    !Array.isArray(value.trips)
  )
    return undefined;
  const visas = value.visas.flatMap((v) => {
    if (!isRecord(v) || typeof v.subclass !== 'string' || typeof v.from !== 'string')
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
      ? {
          partner: {
            stream,
            ...(lodged ? { partnerLodged: lodged } : {}),
            ...(typeof value.longTermRelationship === 'boolean'
              ? { longTermRelationship: value.longTermRelationship }
              : {}),
          },
          ...(lodged
            ? {
                partnerApplication: {
                  lodged,
                  stream,
                  ...(typeof value.longTermRelationship === 'boolean'
                    ? { longTermRelationship: value.longTermRelationship }
                    : {}),
                },
              }
            : {}),
        }
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
  if (!('version' in value) && typeof value.partner === 'boolean') {
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
