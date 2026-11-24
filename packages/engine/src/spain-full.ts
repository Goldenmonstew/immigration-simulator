import { spainFull2026_11 as policy } from '@uk-immigration/policy-data';
import type { CountryResult, CountryPathway } from './country-result';
import { textFor } from './rule';
import { evaluateSpain } from './spain';
import type { EsRequest } from './spain';
import { nationalityPath } from './spain-nationality';
import type { EsNationalityFacts } from './spain-nationality';
import { residencePath, tripsWithFacts } from './spain-residence';
import type { EsResidenceFacts } from './spain-residence';
import { mobilityPath } from './spain-mobility';
import type { EsMobilityFacts } from './spain-mobility';
import { recoveryPath, longTermDocuments } from './spain-recovery';
import type { EsRecoveryFacts, EsLongTermCardFacts } from './spain-recovery';
import { freeMovementPath } from './spain-free-movement';
import type { EsFreeMovementFacts } from './spain-free-movement';
import { check } from './spain-full-common';

export const ES_FULL_TARGETS = [
  'N',
  'L',
  'E',
  'M',
  'F',
  'R-N',
  'R-E',
  'U',
] as const;
export type EsFullTarget = (typeof ES_FULL_TARGETS)[number];

export interface EsFullRequest extends EsRequest {
  targets?: EsFullTarget[];
  timeRecordsComplete?: boolean;
  nationality?: EsNationalityFacts;
  residence?: EsResidenceFacts;
  mobility?: EsMobilityFacts;
  recovery?: EsRecoveryFacts;
  longTermCard?: EsLongTermCardFacts;
  freeMovement?: EsFreeMovementFacts;
}

/** An omitted history is unanswered; an explicitly empty history is an answer. */
export type EsFullInput = Omit<EsFullRequest, 'route' | 'permits' | 'trips'> &
  Partial<Pick<EsRequest, 'route' | 'permits' | 'trips'>>;

export function evaluateSpainFull(input: EsFullInput): CountryResult {
  // The page may send the detailed EU history once for all three residence calculations.
  // An unclassified Spanish permission needs a decision before it can establish N/L time.
  const periods = input.residence?.periods?.filter(
    (p) => p.territory === 'spain',
  );
  const permits =
    input.permits ??
    periods
      ?.filter(
        (p) =>
          !['unclassified', 'asylum-wait', 'temporary-only'].includes(p.kind),
      )
      .map((p) => ({
        from: p.from,
        to: p.to,
        study: ['study', 'training', 'volunteering'].includes(p.kind),
      }));
  const tripsRecorded =
    input.trips !== undefined || input.residence?.tripDetails !== undefined;
  const req: EsFullRequest = {
    ...input,
    permits: permits ?? [],
    trips: tripsWithFacts(input),
    route: input.route ?? 'general',
    timeRecordsComplete:
      input.timeRecordsComplete !== false &&
      permits !== undefined &&
      tripsRecorded &&
      (input.permits !== undefined ||
        !periods?.some(
          (p) => p.kind === 'unclassified' || p.kind === 'temporary-only',
        )),
  };
  const targets = input.targets ?? ES_FULL_TARGETS,
    L = textFor(req);
  const pilot = targets.some((t) => t === 'N' || t === 'L' || t === 'E')
    ? evaluateSpain(req)
    : undefined;
  const paths: CountryPathway[] = [];
  for (const target of new Set(targets)) {
    let p: CountryPathway;
    switch (target) {
      case 'N':
        p = nationalityPath(req, pilot!.pathways[1], input.route !== undefined);
        break;
      case 'L':
        p = residencePath(req, pilot!.pathways[0], target);
        break;
      case 'E':
        p = residencePath(
          {
            ...req,
            timeRecordsComplete:
              input.timeRecordsComplete !== false &&
              (input.permits !== undefined || !!input.residence?.periods) &&
              tripsRecorded,
          },
          pilot!.pathways[0],
          target,
        );
        break;
      case 'M':
      case 'F':
        p = mobilityPath(req, target);
        break;
      case 'R-N':
      case 'R-E':
        p = recoveryPath(req, target);
        break;
      case 'U':
        p = freeMovementPath({
          ...req,
          timeRecordsComplete:
            input.timeRecordsComplete !== false && tripsRecorded,
        });
        break;
    }
    if (target === 'L' || target === 'E' || target === 'M') {
      const docs = longTermDocuments(req, target);
      p.checks.push(...docs);
      p.pendingDetails = [
        ...new Set([
          ...(p.pendingDetails ?? []),
          ...docs.flatMap((c) => c.pendingDetails ?? []),
        ]),
      ];
    }
    const filedOn =
      (target === 'M'
        ? req.mobility?.holder?.filedOn
        : target === 'F'
          ? req.mobility?.family?.filedOn
          : undefined) ?? req.simulationDate;
    if (
      target !== 'U' &&
      target !== 'N' &&
      filedOn < policy.values.residenceLawFrom.value
    ) {
      const version = check(
        L,
        'ES-TRANSITION',
        '历史申请须核对递交时有效的规则及过渡选择。',
        'Verify the law in force when the historical application was filed and any transitional election.',
        undefined,
        policy.values.residenceLawFrom.sources,
      );
      p = {
        id: p.id,
        title: p.title,
        checks: [version],
        decidedBy: [version.id],
        status: 'UNKNOWN',
        assumptions: [],
      };
    }
    paths.push(p);
    // If the claimed reduction is uncertain, show the independent general route.
    if (
      target === 'N' &&
      req.route !== 'general' &&
      p.checks.some((c) => c.pendingDetails?.includes('PD-280'))
    ) {
      const generalReq = { ...req, route: 'general' as const };
      const alternative = nationalityPath(
        generalReq,
        evaluateSpain(generalReq).pathways[1],
      );
      paths.push({
        ...alternative,
        id: 'ES-NATIONALITY-GENERAL',
        title: L(
          '入籍（一般居住年限）',
          'Citizenship by residence (general period)',
        ),
      });
    }
  }
  return {
    policyAsOf: policy.asOf,
    columns: [
      {
        id: policy.ruleSetId,
        title: L('西班牙现行法律', 'Spanish law in force'),
        pathways: paths,
      },
    ],
  };
}
