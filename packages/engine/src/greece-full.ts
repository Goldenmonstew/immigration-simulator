import {
  grSource,
  greeceFull2026_11 as policy,
} from '@uk-immigration/policy-data';
import type {
  CountryCheck,
  CountryPathway,
  CountryResult,
} from './country-result';
import { addDays } from './dates';
import { evaluateGreece } from './greece';
import type { GrPathway, GrPathwayId, GrPermit, GrRequest } from './greece';
import { commonChecks, type GrCommonAnswers } from './greece-common';
import {
  propertyFamilyChecks,
  type GrPropertyFamilyAnswers,
} from './greece-property-family';
import {
  grContext,
  type GrContext,
  type GrEntry,
  type GrInsurance,
} from './greece-rules';
import {
  settlementChecks,
  type GrSettlementAnswers,
} from './greece-settlement';
import {
  workFamilyChecks,
  type GrWorkFamilyAnswers,
} from './greece-work-family';
import type { IsoDate } from './types';

const titles = {
  'GR-LONG-TERM': ['欧盟长期居民 Μ.1', 'EU long-term resident Μ.1'],
  'GR-GOLDEN-VISA': ['黄金签证 Β.5', 'Golden visa Β.5'],
  'GR-NATIONALITY': ['归化入籍', 'Naturalisation'],
  'GR-TEN-YEAR': ['十年居留许可 Μ.2', 'Ten-year residence Μ.2'],
  'GR-GREEK-FAMILY-PR': [
    '希腊公民家属 Ο.3 / Μ.3',
    'Family of a Greek citizen Ο.3 / Μ.3',
  ],
  'GR-EU-FAMILY-PR': ['欧盟公民家属 Ν', 'Family of an EU citizen Ν'],
  'GR-WORK': ['受雇工作 Ε.1 / Ε.4', 'Employment Ε.1 / Ε.4'],
  'GR-FAMILY-TCN': [
    '第三国公民家庭团聚 Ο.1 / Ο.2',
    'Third-country family reunification Ο.1 / Ο.2',
  ],
} as const;

export type GrFullPathwayId = keyof typeof titles;
export interface GrFullRequest
  extends
    Partial<GrRequest>,
    GrCommonAnswers,
    GrSettlementAnswers,
    GrPropertyFamilyAnswers,
    GrWorkFamilyAnswers {
  simulationDate: IsoDate;
  birthDate?: IsoDate;
  citizenship?: 'third-country' | 'stateless' | 'eu' | 'eea-swiss' | 'greek';
  /** National visa for the purpose selected; short stay means it is still lawful. */
  entry?: GrEntry;
  insurance?: GrInsurance;
  /** Omit to return all eight routes. An absent answer differs from an empty history. */
  pathways?: GrFullPathwayId[];
  /** For M.1 only. The permit periods after grant belong in the ordinary permit history. */
  grantedProtection?: {
    claimedOn: IsoDate;
    grantedOn: IsoDate;
    priorResidenceExcludedThrough?: IsoDate;
  };
}

const timeIds = {
  'GR-LONG-TERM': [
    'LT-TIME-RESIDENCE',
    'LT-TIME-SINGLE-ABSENCE',
    'LT-TIME-TOTAL-ABSENCE',
  ],
  'GR-NATIONALITY': ['NAT-TIME-RESIDENCE'],
  'GR-GOLDEN-VISA': ['GV-TIME-RENEWAL', 'GV-TIME-LATE'],
} as const;

function timeRoute(
  id: GrFullPathwayId,
  req: GrFullRequest,
): GrPathwayId | undefined {
  switch (id) {
    case 'GR-LONG-TERM':
      return req.longTerm?.stage !== 'renewal' ? id : undefined;
    case 'GR-NATIONALITY':
      return req.nationality?.stage !== 'oath' &&
        !(
          req.route === 'general' &&
          req.nationality?.bornAndContinuouslyResident
        )
        ? id
        : undefined;
    case 'GR-GOLDEN-VISA':
      return req.goldenVisa?.stage === 'renewal' ||
        (!req.goldenVisa?.stage &&
          req.permits?.some(
            (x) => x.kind === 'investor' && x.from <= req.simulationDate,
          ) === true)
        ? id
        : undefined;
    default:
      return undefined;
  }
}

function protectionPeriods(req: GrFullRequest, permits: GrPermit[]) {
  const protection = req.grantedProtection;
  if (
    !protection ||
    req.simulationDate < policy.values.protectionCreditFrom.value ||
    protection.grantedOn > req.simulationDate
  )
    return permits;
  const regular = permits
    .filter((x) => x.kind === 'regular')
    .sort((a, b) => a.from.localeCompare(b.from));
  const credited = regular.map((x, i) => ({
    ...x,
    to: x.to ?? (regular[i + 1] && addDays(regular[i + 1].from, -1)),
  }));
  if (protection.claimedOn < protection.grantedOn) {
    credited.push({
      kind: 'regular',
      from: protection.claimedOn,
      to: addDays(protection.grantedOn, -1),
    });
  }
  const merged: GrPermit[] = [];
  for (const period of credited.sort((a, b) => a.from.localeCompare(b.from))) {
    const last = merged.at(-1);
    if (!last || (last.to && addDays(last.to, 1) < period.from))
      merged.push({ ...period });
    else if (!period.to || (last.to && period.to > last.to))
      last.to = period.to;
  }
  const periods = [...permits.filter((x) => x.kind !== 'regular'), ...merged];
  const excludedThrough = protection.priorResidenceExcludedThrough;
  return excludedThrough && excludedThrough <= req.simulationDate
    ? periods
        .filter((period) => !period.to || period.to > excludedThrough)
        .map((period) => ({
          ...period,
          from:
            period.from <= excludedThrough
              ? addDays(excludedThrough, 1)
              : period.from,
        }))
    : periods;
}

function specialChecks(
  id: GrFullPathwayId,
  req: GrFullRequest,
  ctx: GrContext,
) {
  switch (id) {
    case 'GR-LONG-TERM':
    case 'GR-TEN-YEAR':
    case 'GR-NATIONALITY':
      return settlementChecks(id, req, ctx);
    case 'GR-GOLDEN-VISA':
    case 'GR-GREEK-FAMILY-PR':
    case 'GR-EU-FAMILY-PR':
      return propertyFamilyChecks(id, req, ctx);
    default:
      return workFamilyChecks(id, req, ctx);
  }
}

function timeChecks(
  id: GrPathwayId,
  time: GrPathway | undefined,
  c: GrContext,
): CountryCheck[] {
  const source =
    id === 'GR-LONG-TERM'
      ? policy.values.longTermYears.sources
      : id === 'GR-NATIONALITY'
        ? policy.values.nationalityYears.sources
        : policy.values.renewalWindowMonths.sources;
  const pending = time?.pendingDetails ?? [];
  const checks =
    time?.checks.map((item, i) =>
      c.check(
        timeIds[id][i],
        item.text,
        item.text,
        item.met,
        item.sources,
        item.text,
        item.text,
        id === 'GR-LONG-TERM' ? [i === 0 ? 'PD-101' : 'PD-102'] : ['PD-109'],
      ),
    ) ?? [];
  const explanation =
    time?.summary ??
    c.L(
      '请填写本路径的许可历史、出入境记录及适用类别。',
      'Provide the permit history, trips and category needed for this route.',
    );
  const met =
    time?.status === 'MET'
      ? true
      : time?.status === 'NOT_MET' ||
          time?.status === 'FUTURE' ||
          time?.status === 'NOT_APPLICABLE'
        ? false
        : undefined;
  checks.push(
    c.check(
      id + '-TIME',
      '递交日的时间条件',
      'Timing on the application date',
      met,
      source,
      explanation,
      explanation,
      pending.filter((pd) =>
        ['PD-101', 'PD-102', 'PD-106', 'PD-109'].includes(pd),
      ),
    ),
  );
  return checks;
}

export function evaluateGreeceFull(req: GrFullRequest): CountryResult {
  const c = grContext(req.locale);
  const ids = req.pathways ?? (Object.keys(titles) as GrFullPathwayId[]);
  const required = ids
    .map((id) => timeRoute(id, req))
    .filter((id) => id !== undefined);
  let times: GrPathway[] = [];
  if (required.length && req.permits) {
    const base = {
      ...req,
      permits: req.permits,
      trips: req.trips ?? [],
      route: req.route ?? ('general' as const),
    };
    times = evaluateGreece(base).pathways;
    if (required.includes('GR-LONG-TERM')) {
      const permits = protectionPeriods(req, req.permits);
      if (permits !== req.permits) {
        const lt = evaluateGreece({ ...base, permits }).pathways[0];
        times = [lt, ...times.filter((path) => path.id !== lt.id)];
      }
    }
  }
  const pathways: CountryPathway[] = ids.map((id) => {
    const nationality = id === 'GR-NATIONALITY';
    const inScope =
      req.citizenship === undefined
        ? undefined
        : nationality
          ? req.citizenship !== 'greek'
          : req.citizenship === 'third-country' ||
            req.citizenship === 'stateless';
    const scope = c.check(
      'GR-APPLICANT',
      '申请人国籍类别',
      'Applicant citizenship category',
      inScope,
      nationality
        ? [grSource('F34', 'ΚΕΙ art. 5(1)')]
        : [grSource('F16', 'arts. 3–4'), grSource('F02', 'arts. 13(2), 17')],
      nationality
        ? '此处核对尚未取得希腊国籍者的归化。'
        : '本路径受理第三国公民或符合条件的无国籍申请人。',
      nationality
        ? 'Naturalisation applies to people who do not already hold Greek citizenship.'
        : 'This permit route covers third-country nationals and eligible stateless applicants.',
    );
    if (inScope === false)
      return {
        id,
        title: c.L(titles[id][0], titles[id][1]),
        status: 'NOT_APPLICABLE',
        checks: [scope],
        assumptions: [],
      };
    const rules = [
      scope,
      ...commonChecks(id, req, c),
      ...specialChecks(id, req, c),
    ];
    let time: GrPathway | undefined;
    let timing: CountryCheck[] = [];
    const needed = timeRoute(id, req);
    if (needed) {
      if (
        (req.trips !== undefined || id === 'GR-GOLDEN-VISA') &&
        (req.route !== undefined || id !== 'GR-NATIONALITY')
      )
        time = times.find((path) => path.id === id);
      timing = timeChecks(needed, time, c);
    } else if (id === 'GR-NATIONALITY' && req.nationality?.stage !== 'oath') {
      rules.push(
        c.check(
          'NAT-BIRTH-EXEMPTION',
          '在希出生并持续居住',
          'Born and continuously resident in Greece',
          true,
          [grSource('F34', 'ΚΕΙ art. 5(1)(δ)'), grSource('F35', 'p2')],
          '已声明在希腊出生并持续居住，适用一般居住年限豁免。',
          'Continuous residence in Greece since birth exempts the applicant from the general residence period.',
        ),
      );
    }
    // Address changes carry their own fine. The old time assessment already combines alternative
    // renewal windows and distinguishes a future date from an unresolved interpretation.
    const gates = rules.filter((check) => check.id !== 'C-06');
    const status =
      gates.some((check) => check.status === 'NOT_MET') ||
      time?.status === 'NOT_MET' ||
      time?.status === 'NOT_APPLICABLE'
        ? 'NOT_MET'
        : gates.some((check) => check.status === 'UNKNOWN') ||
            (needed && !time) ||
            time?.status === 'UNKNOWN'
          ? 'UNKNOWN'
          : time?.status === 'FUTURE'
            ? 'FUTURE'
            : 'MET';
    const checks = [...timing, ...rules];
    return {
      id,
      title: c.L(titles[id][0], titles[id][1]),
      status,
      checks,
      earliestDate:
        status === 'FUTURE' || status === 'MET'
          ? time?.earliestDate
          : undefined,
      assumptions: time?.assumptions ?? [],
      pendingDetails: [
        ...new Set([
          ...(time?.pendingDetails ?? []),
          ...checks.flatMap((check) => check.pendingDetails ?? []),
        ]),
      ],
    };
  });
  return {
    policyAsOf: policy.asOf,
    columns: [
      {
        id: policy.ruleSetId,
        title: c.L('希腊现行法律', 'Current Greek law'),
        pathways,
      },
    ],
  };
}
