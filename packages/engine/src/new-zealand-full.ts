import { newZealandFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryResult } from './country-result';
import type { NzRequest } from './new-zealand';
import {
  createNzContext,
  not,
  type NzCommonAnswers,
} from './new-zealand-checks';
import { familyPathways, type NzFamilyAnswers } from './new-zealand-family';
import {
  residentPathways,
  type NzResidentAnswers,
} from './new-zealand-resident';
import { skilledPathways, type NzSkilledAnswers } from './new-zealand-skilled';

export interface NzFullRequest extends Partial<NzRequest> {
  simulationDate: string;
  common?: NzCommonAnswers;
  resident?: NzResidentAnswers;
  skilled?: NzSkilledAnswers;
  family?: NzFamilyAnswers;
}

export function evaluateNewZealandFull(request: NzFullRequest): CountryResult {
  const filing = request.common?.residenceFiling;
  const green = request.skilled?.green;
  const sectorVisa = request.skilled?.sector?.currentVisa;
  const business = request.family?.investment?.business;
  const religious = request.family?.religious;
  const legacyLocations = new Set(
    [
      green?.filingFromOverseas,
      not(religious?.inNz),
      not(request.resident?.travel?.currentlyInNz),
    ].filter((location) => location !== undefined),
  );
  const conflictingVisas =
    green?.currentVisa !== undefined &&
    sectorVisa !== undefined &&
    green.currentVisa !== sectorVisa;
  const legacyVisa = conflictingVisas
    ? 'other'
    : (green?.currentVisa ??
      sectorVisa ??
      (business?.holdsBusinessInvestorWorkVisa
        ? 'business-investor-work'
        : religious?.holdsQualifyingWorkVisa
          ? 'religious-work'
          : undefined));
  const ctx = createNzContext(request, {
    ...request.common,
    residenceFiling: {
      ...filing,
      currentVisa: filing?.currentVisa ?? legacyVisa,
      filingFromOverseas:
        filing?.filingFromOverseas ??
        (legacyLocations.size === 1 ? [...legacyLocations][0] : undefined),
      statutoryBar:
        request.resident?.prv?.deportationLiability === 'liable'
          ? 'liable-for-deportation'
          : filing?.statutoryBar,
    },
  });
  return {
    policyAsOf: ctx.policyAsOf,
    columns: [
      {
        id: newZealandFull2026_11.ruleSetId,
        title: ctx.L('新西兰现行规则', 'Current New Zealand rules'),
        pathways: [
          ...residentPathways(ctx, request.resident ?? {}),
          ...skilledPathways(ctx, request.skilled ?? {}),
          ...familyPathways(ctx, request.family ?? {}),
        ],
      },
    ],
  };
}
