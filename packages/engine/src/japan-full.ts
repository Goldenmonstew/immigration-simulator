import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { assessJapanNaturalisation } from './japan-full-naturalisation';
import type { JpFullNaturalisationRequest } from './japan-full-naturalisation';
import { assessJapanPr } from './japan-full-pr';
import type { JpFullPrRequest } from './japan-full-pr';
import { assessJapanReentry } from './japan-full-reentry';
import type { JpFullReentryRequest } from './japan-full-reentry';
import { filingContext } from './japan-full-shared';
import type { JpFullContext, JpFullResult } from './japan-full-shared';

export interface JpFullRequest extends JpFullContext {
  permanentResidence?: JpFullPrRequest;
  naturalisation?: JpFullNaturalisationRequest;
  reentry?: JpFullReentryRequest[];
}

/** Evaluates selected routes for one person at the requested filing date. */
export function evaluateJapanFull(req: JpFullRequest): JpFullResult {
  const { L } = filingContext(req);
  const pr = req.permanentResidence;
  const naturalisation = req.naturalisation;
  return {
    policyAsOf: japanFull2026_11.asOf,
    columns: [
      {
        id: japanFull2026_11.ruleSetId,
        title: L('日本现行及已公布规则', 'Japan’s current and published rules'),
        pathways: [
          ...(pr?.routes.map((route) =>
            assessJapanPr(req, route, pr.evidence ?? {}),
          ) ?? []),
          ...(naturalisation?.routes.map((route) =>
            assessJapanNaturalisation(
              req,
              route,
              naturalisation.evidence ?? {},
            ),
          ) ?? []),
          ...(req.reentry?.map((route) => assessJapanReentry(req, route)) ??
            []),
        ],
      },
    ],
  };
}
