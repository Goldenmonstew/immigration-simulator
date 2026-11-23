import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import type {
  CountryColumn,
  CountryPathway,
  CountryResult,
} from '../country-result';
import { textFor } from '../rule';
import { atlanticChecks } from './atlantic';
import { expressChecks } from './express';
import { familyChecks } from './family';
import { federalChecks } from './federal';
import { pnpChecks } from './pnp';
import { quebecChecks } from './quebec';
import { residenceChecks } from './residence';
import type { CaFullRequest, Context, Item } from './shared';

export type { CaFullRequest } from './shared';
export type { Item as CaFullCheck } from './shared';

const routes = {
  'CA-RESIDENCY': ['永久居民居住义务', 'PR residency obligation'],
  'CA-CITIZENSHIP': ['普通入籍（s.5(1)）', 'Citizenship grant under s.5(1)'],
  'CA-CIT-MINOR-52': [
    '未成年人入籍（s.5(2)）',
    'Minor citizenship grant under s.5(2)',
  ],
  'CA-EE-FSW': ['联邦技术工人', 'Federal Skilled Worker Program'],
  'CA-EE-CEC': ['加拿大经验类', 'Canadian Experience Class'],
  'CA-EE-FST': ['联邦技工', 'Federal Skilled Trades Program'],
  'CA-PNP': ['省提名', 'Provincial Nominee Program'],
  'CA-QC-PSTQ': [
    '魁北克技术移民甄选',
    'Québec Skilled Worker Selection Program',
  ],
  'CA-AIP': ['大西洋移民项目', 'Atlantic Immigration Program'],
  'CA-FAMILY': [
    '配偶、伴侣及受抚养子女担保',
    'Spouse, partner and dependent child sponsorship',
  ],
} as const;
export type CaFullPathwayId = keyof typeof routes;

interface CaFullPathway extends CountryPathway {
  id: CaFullPathwayId;
  checks: Item[];
}

export interface CaFullResult extends CountryResult {
  columns: (Omit<CountryColumn, 'pathways'> & { pathways: CaFullPathway[] })[];
}

function assess(ctx: Context, id: CaFullPathwayId): Item[] {
  switch (id) {
    case 'CA-RESIDENCY':
    case 'CA-CITIZENSHIP':
    case 'CA-CIT-MINOR-52':
      return residenceChecks(ctx, id);
    case 'CA-EE-FSW':
    case 'CA-EE-CEC':
    case 'CA-EE-FST':
      return [...federalChecks(ctx, id), ...expressChecks(ctx, id)];
    case 'CA-PNP':
      return [
        ...federalChecks(ctx, id),
        ...(ctx.req.pnp?.mode === 'enhanced' ? expressChecks(ctx, id) : []),
        ...pnpChecks(ctx),
      ];
    case 'CA-QC-PSTQ':
      return [...federalChecks(ctx, id), ...quebecChecks(ctx)];
    case 'CA-AIP':
      return [...federalChecks(ctx, id), ...atlanticChecks(ctx)];
    case 'CA-FAMILY':
      return [...federalChecks(ctx, id), ...familyChecks(ctx)];
  }
}

export function evaluateCanadaFull(req: CaFullRequest): CaFullResult {
  const L = textFor(req);
  if (
    req.citizenshipStatus === 'citizen' ||
    req.citizenshipStatus === 'possible-by-descent'
  ) {
    return {
      policyAsOf: ca.asOf,
      columns: [],
      shortCircuit: {
        reason: 'CANADIAN_CITIZENSHIP_STATUS',
        message: L(
          '已拥有或可能按血统拥有加拿大公民身份。先依 Citizenship Act s.3 核实公民身份证明（SRC-260）。',
          'Canadian citizenship is held or may have been acquired by descent. Verify proof of citizenship under Citizenship Act s.3 (SRC-260).',
        ),
      },
    };
  }
  const ctx: Context = {
    req,
    L,
    check(id, title, ok, explanation, sources, pending, advisory) {
      return {
        id,
        title,
        status: ok === undefined ? 'UNKNOWN' : ok ? 'MET' : 'NOT_MET',
        explanation,
        sources,
        ...(ok === undefined && pending?.length
          ? { pendingDetails: pending }
          : {}),
        ...(advisory ? { advisory } : {}),
      };
    },
  };
  const pathways = (Object.keys(routes) as CaFullPathwayId[]).map(
    (id): CaFullPathway => {
      const checks = assess(ctx, id);
      const substantive = checks.filter((c) => !c.advisory);
      let status: CaFullPathway['status'] = 'MET';
      if (substantive.some((c) => c.status === 'NOT_MET')) status = 'NOT_MET';
      else if (substantive.some((c) => c.status === 'UNKNOWN'))
        status = 'UNKNOWN';
      const initialPr = ![
        'CA-RESIDENCY',
        'CA-CITIZENSHIP',
        'CA-CIT-MINOR-52',
      ].includes(id);
      let summary: string | undefined;
      if (
        initialPr &&
        req.residence?.prStatus === 'valid' &&
        req.permanentResident &&
        req.permanentResident <= req.simulationDate
      ) {
        status = 'NOT_APPLICABLE';
        summary = L(
          '已取得并持有 PR。可查看居住义务或适用的入籍路径。',
          'You already hold PR. See the residency obligation or an applicable citizenship grant.',
        );
      } else if (
        id === 'CA-RESIDENCY' &&
        (req.residence?.prStatus === 'never' ||
          (req.permanentResident && req.permanentResident > req.simulationDate))
      ) {
        status = 'NOT_APPLICABLE';
        summary = L(
          '模拟日尚未取得 PR，居住义务从成为永久居民之日起适用。',
          'The residency obligation starts when you become a permanent resident.',
        );
      }
      const title = routes[id];
      const pending = [
        ...new Set(
          checks.flatMap((c) => [
            ...(c.pendingDetails ?? []),
            ...(c.timeBaseline?.pendingDetails ?? []),
          ]),
        ),
      ];
      return {
        id,
        title: L(title[0], title[1]),
        status,
        ...(summary ? { summary } : {}),
        checks,
        assumptions: [...new Set(checks.flatMap((c) => c.assumptions ?? []))],
        ...(pending.length ? { pendingDetails: pending } : {}),
      };
    },
  );
  return {
    policyAsOf: ca.asOf,
    columns: [
      {
        id: ca.ruleSetId,
        title: L('加拿大现行法律', 'Current Canadian law'),
        pathways,
      },
    ],
  };
}
