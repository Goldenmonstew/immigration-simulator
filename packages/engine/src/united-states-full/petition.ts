import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import { v } from './check';
import type { Answer } from './check';
import type {
  UsAdmissionAnswers,
  UsEmploymentAnswers,
  UsFullRequest,
} from './types';

type AdjustmentBasis = NonNullable<UsAdmissionAnswers['adjustmentBasis']>;
export type AdjustmentCategory =
  AdjustmentBasis | 'family' | 'ambiguous' | undefined;

export function adjustmentCategory(request: UsFullRequest): AdjustmentCategory {
  const { admission, family, employment, pathway } = request;
  if (pathway === 'US-FAMILY') return 'family';
  if (pathway === 'US-EMPLOYMENT') return 'employment';
  if (pathway !== 'US-ADJUSTMENT') return undefined;

  const basis = admission?.adjustmentBasis;
  const familyEvidence = Boolean(
    family?.petitioner ||
    family?.petitionerAtFiling ||
    family?.petitionerNaturalizedOn ||
    family?.relationship,
  );
  if (basis)
    return isFamilyCategory(basis) && familyEvidence ? 'family' : basis;
  const employmentEvidence = Boolean(
    employment?.category || employment?.i140FiledOn,
  );
  if (familyEvidence && employmentEvidence) return 'ambiguous';
  if (familyEvidence) return 'family';
  if (employmentEvidence) return 'employment';
  return undefined;
}

export function isFamilyCategory(category: AdjustmentCategory): boolean {
  return (
    category === 'family' ||
    category === 'immediate-relative' ||
    category === 'family-preference'
  );
}

export function isI140Category(
  category: UsEmploymentAnswers['category'],
): boolean {
  return (
    category === 'eb1a' ||
    category === 'eb2-niw' ||
    category === 'eb2-perm' ||
    category === 'eb3'
  );
}

export function beneficiaryAtLeastAge(
  request: UsFullRequest,
  on: IsoDate,
  reportedAge: number | undefined,
  age: number,
): Answer {
  const { dateOfBirth, simulationDate } = request;
  if (reportedAge !== undefined && on === simulationDate)
    return reportedAge >= age;
  if (dateOfBirth) return on >= afterYears(dateOfBirth, age);
  return reportedAgeAtLeast(simulationDate, on, reportedAge, age);
}

export function reportedAgeAtLeast(
  simulationDate: IsoDate,
  on: IsoDate,
  reportedAge: number | undefined,
  age: number,
): Answer {
  if (reportedAge === undefined) return undefined;
  const yearsToAge = age - Math.floor(reportedAge);
  if (on >= afterYears(simulationDate, yearsToAge)) return true;
  if (on <= afterYears(simulationDate, yearsToAge - 1)) return false;
  return undefined;
}

export function currentFamilyPetitioner(request: UsFullRequest) {
  const family = request.family;
  const naturalized = family?.petitionerNaturalizedOn;
  if (naturalized && naturalized <= request.simulationDate) return 'citizen';
  return (
    family?.petitioner ??
    (family?.petitionerAtFiling === 'citizen' ? 'citizen' : undefined)
  );
}

export function immediateRelative(
  request: UsFullRequest,
  category: AdjustmentCategory,
  receipt: IsoDate,
): Answer {
  if (category === undefined || category === 'ambiguous') return undefined;
  if (category !== 'family') return category === 'immediate-relative';
  const { family, admission } = request;
  if (!family?.relationship) return undefined;
  const petitioner = currentFamilyPetitioner(request);
  if (petitioner === 'lpr') return false;
  if (family.relationship === 'spouse')
    return petitioner === 'citizen' || undefined;
  const petitionReceipt =
    admission?.petitionFiledOn ??
    (admission?.petitionStatus === 'filed-with-i485' ? receipt : undefined);
  if (family.relationship === 'parent')
    return petitioner === 'citizen'
      ? reportedAgeAtLeast(
          request.simulationDate,
          petitionReceipt ?? receipt,
          family.petitionerAge,
          v.familyAge.value.adultSponsor,
        )
      : undefined;
  if (family.relationship !== 'unmarried-child') return false;
  const limit = v.familyAge.value.child;
  const ageAtLeast = (on: IsoDate) =>
    beneficiaryAtLeastAge(
      request,
      on,
      request.dateOfBirth && petitionReceipt
        ? undefined
        : family.beneficiaryAge,
      limit,
    );
  const naturalized = family.petitionerNaturalizedOn;
  const atFiling =
    family.petitionerAtFiling ??
    (naturalized && petitionReceipt
      ? naturalized <= petitionReceipt
        ? 'citizen'
        : 'lpr'
      : admission?.petitionFiledOn
        ? undefined
        : family.petitioner);
  const adultAtFiling = petitionReceipt
    ? ageAtLeast(petitionReceipt)
    : undefined;
  if (atFiling === 'lpr') {
    // An adult at the original receipt was not initially classified as F2A.
    if (adultAtFiling === true) return false;
    if (naturalized) {
      if (
        naturalized > request.simulationDate ||
        (petitionReceipt && naturalized < petitionReceipt)
      )
        return undefined;
      const adult = ageAtLeast(naturalized);
      if (adult === false) return true;
      // Use an established case-specific conversion CSPA age where applicable.
      if (family.cspaAge === 'pending') return undefined;
      if (typeof family.cspaAge === 'number') return family.cspaAge < limit;
      return adult === true ? false : undefined;
    }
    return petitioner === 'citizen' &&
      ageAtLeast(request.simulationDate) === false
      ? true
      : undefined;
  }
  if (atFiling === undefined && petitioner === 'citizen') {
    if (adultAtFiling === true) return false;
    if (ageAtLeast(request.simulationDate) === false) return true;
  }
  if (atFiling !== 'citizen') return undefined;
  if (adultAtFiling !== undefined) return !adultAtFiling;
  // Without a receipt date, a child still under the limit cannot have aged out at filing.
  if (ageAtLeast(request.simulationDate) === false) return true;
  return typeof family.cspaAge === 'number'
    ? family.cspaAge < limit
    : undefined;
}

export function underlyingPetitionApproved(a?: UsAdmissionAnswers): boolean {
  return (
    a?.petitionStatus === 'approved' ||
    (a?.process === 'consular' &&
      a.visaAtFiling === 'available' &&
      a.nvcDs260 === 'submitted')
  );
}
