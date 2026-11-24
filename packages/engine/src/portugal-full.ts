import { portugalFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryResult } from './country-result';
import { evaluatePortugal } from './portugal';
import { fullContext, time } from './portugal-full-common';
import { freeMovementResidence } from './portugal-full-free-movement';
import { investmentResidence } from './portugal-full-investment';
import {
  naturalisation,
  partnerNationality,
} from './portugal-full-nationality';
import {
  longTermResidence,
  ordinaryRenewal,
  permanentResidence,
} from './portugal-full-residence';
import type { PtFullRequest } from './portugal-full-types';

/** Evaluate the selected procedure in each Portuguese pathway as of the simulation date. */
export function evaluatePortugalFull(request: PtFullRequest): CountryResult {
  const ctx = fullContext(request);
  // For a historical simulation, evaluate the earlier law on its own filing
  // date. The legacy time-only entry point only switches on a pending filing.
  const pending =
    request.pendingApplication ??
    (request.simulationDate >= time.oldTextFrom.value &&
    request.simulationDate < time.lawInForce.value
      ? request.simulationDate
      : undefined);
  const [nationality, permanent, longTerm, investment] = evaluatePortugal({
    ...request,
    pendingApplication: pending,
  }).pathways;
  const term = request.longTerm;
  const longTermTime = term?.acceptedWorkPostings?.length
    ? evaluatePortugal({
        ...request,
        trips: request.trips.filter(
          (trip) =>
            !term.acceptedWorkPostings?.some(
              (accepted) =>
                trip.departed === accepted.departed &&
                trip.returned === accepted.returned,
            ),
        ),
      }).pathways[2]
    : longTerm;
  const permanentPath = permanentResidence(ctx, permanent);
  return {
    policyAsOf: portugalFull2026_11.asOf,
    columns: [
      {
        id: 'pt.current-law',
        title: ctx.L('葡萄牙适用法律', 'Applicable Portuguese law'),
        pathways: [
          naturalisation(ctx, nationality),
          permanentPath,
          longTermResidence(ctx, longTermTime),
          investmentResidence(ctx, investment, permanentPath),
          ordinaryRenewal(ctx),
          freeMovementResidence(ctx),
          partnerNationality(ctx),
        ],
      },
    ],
  };
}
