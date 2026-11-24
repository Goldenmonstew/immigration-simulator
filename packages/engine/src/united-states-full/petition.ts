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
  const familyEvidence = Boolean(family?.petitioner || family?.relationship);
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

export function immediateRelative(
  request: UsFullRequest,
  category: AdjustmentCategory,
  receipt: IsoDate,
): Answer {
  if (category === undefined || category === 'ambiguous') return undefined;
  if (category !== 'family') return category === 'immediate-relative';
  const { family, admission } = request;
  if (!family?.petitioner || !family.relationship) return undefined;
  if (family.petitioner !== 'citizen') return false;
  if (family.relationship === 'spouse') return true;
  const petitionReceipt = admission?.petitionFiledOn ?? receipt;
  if (family.relationship === 'parent')
    return reportedAgeAtLeast(
      request.simulationDate,
      petitionReceipt,
      family.petitionerAge,
      v.familyAge.value.adultSponsor,
    );
  if (family.relationship !== 'unmarried-child') return false;
  const limit = v.familyAge.value.child;
  if (family.cspaAge !== undefined) return family.cspaAge < limit;
  const agedOut = beneficiaryAtLeastAge(
    request,
    petitionReceipt,
    family.beneficiaryAge,
    limit,
  );
  if (agedOut === false) return true;
  if (
    !admission?.petitionFiledOn &&
    admission?.petitionStatus === 'filed-with-i485'
  )
    return agedOut === true ? false : undefined;
  return undefined;
}

export function underlyingPetitionApproved(a?: UsAdmissionAnswers): boolean {
  return (
    a?.petitionStatus === 'approved' ||
    (a?.process === 'consular' &&
      a.visaAtFiling === 'available' &&
      a.nvcDs260 === 'submitted')
  );
}
