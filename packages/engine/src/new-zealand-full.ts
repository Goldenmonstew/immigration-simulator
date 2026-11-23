import { newZealandFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryResult } from './country-result';
import { evaluateNewZealand, type NzRequest } from './new-zealand';
import { createNzContext, type NzCommonAnswers } from './new-zealand-checks';
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
  const ctx = createNzContext(request, request.common ?? {});
  const pilot = ctx.history && evaluateNewZealand(ctx.history);
  return {
    policyAsOf: ctx.policyAsOf,
    columns: [
      {
        id: newZealandFull2026_11.ruleSetId,
        title: ctx.L('新西兰现行规则', 'Current New Zealand rules'),
        pathways: [
          ...residentPathways(ctx, request.resident ?? {}, pilot),
          ...skilledPathways(ctx, request.skilled ?? {}),
          ...familyPathways(ctx, request.family ?? {}),
        ],
      },
    ],
  };
}
