import { malaysiaFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryResult } from './country-result';
import {
  assessChildRegistration,
  assessNaturalisation,
  assessWifeRegistration,
} from './malaysia-full-citizenship';
import {
  assessDeRantau,
  assessEmploymentPass,
  assessMm2h,
  assessPvip,
  assessRpt,
  assessSpouseLtsvp,
} from './malaysia-full-passes';
import {
  assessPrChild,
  assessPrRep,
  assessPrSpouse,
  assessPrWas,
  assessResidencePass,
} from './malaysia-full-pr';
import {
  context,
  type MyContext,
  type MyFullRequest,
  type MyPathway,
  type MyPathwayId,
} from './malaysia-full-shared';

export type {
  MyFamilyTie,
  MyFullRequest,
  MyMm2hCategory,
  MyPassKind,
  MyPassPeriod,
  MyPathway,
  MyPathwayId,
  MyTrip,
} from './malaysia-full-shared';

const assessors: Record<MyPathwayId, (ctx: MyContext) => MyPathway> = {
  'my.pr.wife': (ctx) => assessPrSpouse(ctx, 'wife'),
  'my.pr.husband': (ctx) => assessPrSpouse(ctx, 'husband'),
  'my.pr.child': assessPrChild,
  'my.pr.was': assessPrWas,
  'my.pr.rep-family': assessPrRep,
  'my.rp.family': assessResidencePass,
  'my.cit.naturalisation': assessNaturalisation,
  'my.cit.wife-registration': assessWifeRegistration,
  'my.cit.child-registration': assessChildRegistration,
  'my.pass.spouse-ltsvp': assessSpouseLtsvp,
  'my.pass.mm2h': assessMm2h,
  'my.pass.rpt': assessRpt,
  'my.pass.pvip': assessPvip,
  'my.pass.de-rantau': assessDeRantau,
  'my.pass.employment': assessEmploymentPass,
};

/** Every pathway in display order. */
export const MY_FULL_PATHWAYS = Object.keys(assessors) as MyPathwayId[];

/**
 * Malaysia under the current, unamended Constitution and the 2025 Permit
 * Masuk guideline: one column with each selected pathway's conditions.
 */
export function evaluateMalaysiaFull(req: MyFullRequest): CountryResult {
  const ctx = context(req);
  const ids = req.pathways ?? MY_FULL_PATHWAYS;
  return {
    policyAsOf: malaysiaFull2026_11.asOf,
    columns: [
      {
        id: malaysiaFull2026_11.ruleSetId,
        title: ctx.L('马来西亚现行规则', 'Current Malaysian rules'),
        pathways: MY_FULL_PATHWAYS.filter((id) => ids.includes(id)).map((id) =>
          assessors[id](ctx),
        ),
      },
    ],
  };
}
