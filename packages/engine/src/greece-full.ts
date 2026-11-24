import {
  grSource,
  greeceFull2026_11 as policy,
} from '@uk-immigration/policy-data';
import type {
  CountryCheck,
  CountryPathway,
  CountryResult,
} from './country-result';
import { addDays, addMonths, addYears } from './dates';
import { HORIZON_YEARS } from './pilot';
import {
  blueMobilityTiming,
  type GrBlueCardMobility,
} from './greece-blue-mobility';
import { evaluateGreece } from './greece';
import type { GrPathway, GrPathwayId, GrPermit, GrRequest } from './greece';
import {
  commonChecks,
  ordinaryRenewalWindow,
  passportCheck,
  type GrCommonAnswers,
} from './greece-common';
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
  backlogCredits,
  nationalityIncomeCheck,
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
  blueCardMobility?: GrBlueCardMobility;
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

function longTermPeriods(req: GrFullRequest, permits: GrPermit[]) {
  const credits = backlogCredits(req);
  const protection = req.grantedProtection;
  const reformed =
    req.simulationDate >= policy.values.protectionCreditFrom.value;
  let excludedThrough: IsoDate | undefined;
  if (protection && protection.grantedOn <= req.simulationDate) {
    if (reformed) excludedThrough = protection.priorResidenceExcludedThrough;
    if (protection.claimedOn < protection.grantedOn) {
      const fullCredit =
        reformed ||
        protection.grantedOn >
          addMonths(
            protection.claimedOn,
            policy.values.originalProtectionFullCreditMonths.value,
          );
      // The pilot already weights a study day as half a day of residence.
      credits.push({
        kind: fullCredit ? 'regular' : 'study',
        from: protection.claimedOn,
        to: addDays(protection.grantedOn, -1),
      });
    }
  }
  if (req.blueCardMobility?.greekBlueCardFrom)
    credits.push({
      kind: 'regular',
      from: req.blueCardMobility.greekBlueCardFrom,
      to: req.blueCardMobility.greekBlueCardThrough,
    });
  if (!credits.length && !excludedThrough) return permits;
  // Resolve open original cards before inserting credits so the latter cannot shorten a card.
  const periods = permits.map((period) => {
    if (period.to) return period;
    const next = permits
      .filter((x) => x.kind === period.kind && x.from > period.from)
      .map((x) => x.from)
      .sort()[0];
    return { ...period, to: next && addDays(next, -1) };
  });
  const merged: GrPermit[] = [];
  for (const kind of ['regular', 'study', 'investor', 'temporary'] as const) {
    for (const period of [...periods, ...credits]
      .filter((x) => x.kind === kind)
      .sort((a, b) => a.from.localeCompare(b.from))) {
      const last = merged.at(-1);
      if (
        last?.kind === kind &&
        (!last.to || addDays(last.to, 1) >= period.from)
      ) {
        if (!period.to || (last.to && period.to > last.to)) last.to = period.to;
      } else merged.push({ ...period });
    }
  }
  return excludedThrough && excludedThrough <= req.simulationDate
    ? merged
        .filter((x) => !x.to || x.to > excludedThrough)
        .map((x) => ({
          ...x,
          from:
            x.from <= excludedThrough ? addDays(excludedThrough, 1) : x.from,
        }))
    : merged;
}

function filedNationalityTime(
  req: GrFullRequest,
  path: GrPathway,
  c: GrContext,
): GrPathway {
  const filed = req.nationality?.pendingApplicationFiledOn;
  if (!filed) return path;
  if (filed > req.simulationDate)
    return {
      ...path,
      status: 'UNKNOWN',
      earliestDate: undefined,
      checks: [],
      summary: c.L(
        '待决申请的递交日期须在模拟日或之前。',
        'The pending application must have been filed on or before the review date.',
      ),
    };
  const met = path.checks[0]?.met;
  const status =
    met === false ? 'NOT_MET' : met === undefined ? 'UNKNOWN' : path.status;
  return {
    ...path,
    status,
    earliestDate: status === 'MET' ? filed : undefined,
    summary: c.L(
      `以实际递交日 ${filed} 核对居留年限。`,
      `Residence is assessed on the actual filing date, ${filed}.`,
    ),
  };
}

function goldenRenewalTime(
  req: GrFullRequest,
  original: GrPathway | undefined,
  c: GrContext,
): GrPathway | undefined {
  const card = req.permits
    ?.filter((x) => x.kind === 'investor' && x.from <= req.simulationDate)
    .sort((a, b) => a.from.localeCompare(b.from))
    .at(-1);
  const expiry = req.currentCardExpiresOn ?? card?.to;
  if (!expiry) return original;
  const window = ordinaryRenewalWindow(req, expiry, c);
  if (
    original &&
    original.status !== 'NOT_APPLICABLE' &&
    original.status !== 'UNKNOWN' &&
    req.simulationDate >= policy.values.workReformEffective.value &&
    !req.currentCardExpiresOn &&
    !(req.simulationDate > window.late && req.renewalForceMajeure)
  )
    return original;
  const status =
    typeof window.met === 'string'
      ? 'FUTURE'
      : window.met === undefined
        ? 'UNKNOWN'
        : window.met
          ? 'MET'
          : 'NOT_MET';
  const checks = [
    {
      text: c.L(
        `正常续期窗口 ${window.early} 至 ${expiry}`,
        `Ordinary renewal window ${window.early} to ${expiry}`,
      ),
      met: req.simulationDate >= window.early && req.simulationDate <= expiry,
      sources: window.sources,
    },
  ];
  const late = req.simulationDate > expiry;
  return {
    id: 'GR-GOLDEN-VISA',
    title: c.L('投资者续期', 'Investor renewal'),
    status,
    earliestDate:
      status === 'MET'
        ? req.simulationDate
        : status === 'FUTURE'
          ? window.early
          : undefined,
    summary: window.text,
    checks: late
      ? [
          ...checks,
          {
            text: window.text,
            met: typeof window.met === 'boolean' ? window.met : undefined,
            sources: window.sources,
          },
        ]
      : checks,
    assumptions: [],
    notChecked: [],
  };
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
    time?.checks[0]?.sources ??
    (id === 'GR-LONG-TERM'
      ? policy.values.longTermYears.sources
      : id === 'GR-NATIONALITY'
        ? policy.values.nationalityYears.sources
        : policy.values.renewalWindowMonths.sources);
  const pending = time?.pendingDetails ?? [];
  const checks =
    time?.checks.map((item, i) =>
      c.check(
        timeIds[id][i],
        item.text,
        item.text,
        item.met === false && time.status === 'FUTURE'
          ? time.earliestDate
          : item.met,
        item.sources,
        item.text,
        item.text,
        id === 'GR-LONG-TERM'
          ? time.pendingDetails?.includes('PD-305')
            ? ['PD-305']
            : pending.filter((pd) => pd === (i === 0 ? 'PD-101' : 'PD-102'))
          : id === 'GR-NATIONALITY'
            ? ['PD-109']
            : [],
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
      : time?.status === 'FUTURE'
        ? time.earliestDate
        : time?.status === 'NOT_MET' || time?.status === 'NOT_APPLICABLE'
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
        ['PD-101', 'PD-102', 'PD-106', 'PD-109', 'PD-305'].includes(pd),
      ),
    ),
  );
  return checks;
}

function routeTiming(
  id: GrPathwayId,
  req: GrFullRequest,
  times: GrPathway[],
  c: GrContext,
) {
  let time: GrPathway | undefined;
  if (
    (req.trips !== undefined || id === 'GR-GOLDEN-VISA') &&
    (req.route !== undefined || id !== 'GR-NATIONALITY')
  )
    time = times.find((path) => path.id === id);
  if (id === 'GR-GOLDEN-VISA') time = goldenRenewalTime(req, time, c);
  if (
    id === 'GR-LONG-TERM' &&
    req.blueCardMobility &&
    req.blueCardMobility.usedLongTermMobility !== false &&
    time?.status !== 'MET'
  ) {
    const mobile = blueMobilityTiming(
      req.blueCardMobility,
      req.trips,
      req.simulationDate,
      c,
    );
    if (
      !time ||
      time.status === 'NOT_MET' ||
      mobile.status === 'MET' ||
      (mobile.status === 'FUTURE' &&
        (!time.earliestDate || mobile.earliestDate! < time.earliestDate)) ||
      (mobile.status === 'UNKNOWN' && time.status !== 'UNKNOWN')
    )
      time = mobile;
  }
  return time;
}

function laterNationalityDate(
  base: GrRequest,
  time: GrPathway,
  c: GrContext,
): GrPathway {
  if (time.status !== 'NOT_MET') return time;
  const years = policy.values.nationalityYears.value[base.route];
  const horizon = addYears(base.simulationDate, HORIZON_YEARS);
  // Beyond the pilot horizon, eligibility can first arise on a residence anniversary
  // or on receiving a qualifying title after a stretch of lawful residence.
  const candidates = base.permits.flatMap((permit) => [
    permit.from,
    addYears(permit.from, years),
  ]);
  for (const date of [...new Set(candidates)]
    .filter((d) => d > horizon)
    .sort()) {
    const future = evaluateGreece({ ...base, simulationDate: date })
      .pathways[2];
    if (future.status === 'UNKNOWN') return { ...future, checks: time.checks };
    if (!future.earliestDate) continue;
    const earliestDate = future.earliestDate;
    return {
      ...future,
      status: 'FUTURE',
      checks: time.checks,
      summary: c.L(
        `合法居留满 ${years} 年的最早递交日是 ${earliestDate}。`,
        `The earliest application date with ${years} years of legal residence is ${earliestDate}.`,
      ),
    };
  }
  return time;
}

function pilotTimes(req: GrFullRequest, required: GrPathwayId[], c: GrContext) {
  let times: GrPathway[] = [];
  if (required.length && req.permits) {
    const base = {
      ...req,
      permits: req.permits,
      trips: req.trips ?? [],
      route: req.route ?? ('general' as const),
    };
    times = evaluateGreece(base).pathways;
    const filed = req.nationality?.pendingApplicationFiledOn;
    if (filed && required.includes('GR-NATIONALITY')) {
      const nat = evaluateGreece({ ...base, simulationDate: filed })
        .pathways[2];
      times[2] = filedNationalityTime(req, nat, c);
    } else if (required.includes('GR-NATIONALITY')) {
      times[2] = laterNationalityDate(base, times[2], c);
    }
    if (required.includes('GR-LONG-TERM')) {
      const permits = longTermPeriods(req, req.permits);
      if (permits !== req.permits) {
        const lt = evaluateGreece({ ...base, permits }).pathways[0];
        if (req.grantedProtection)
          lt.checks[0].sources.push(
            ...policy.values.originalProtectionFullCreditMonths.sources,
            ...policy.values.protectionCreditFrom.sources,
          );
        if (backlogCredits(req).length)
          lt.checks[0].sources.push(...policy.values.backlogFilingFrom.sources);
        times = [lt, ...times.filter((path) => path.id !== lt.id)];
      }
    }
  }
  return times;
}

export function evaluateGreeceFull(req: GrFullRequest): CountryResult {
  const c = grContext(req.locale);
  const ids = req.pathways ?? (Object.keys(titles) as GrFullPathwayId[]);
  const required = ids
    .map((id) => timeRoute(id, req))
    .filter((id) => id !== undefined);
  const times = pilotTimes(req, required, c);
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
    if (
      req.simulationDate < policy.values.migrationCodeFrom.value &&
      !nationality &&
      id !== 'GR-EU-FAMILY-PR'
    ) {
      const version = c.check(
        'GR-LAW-DATE',
        '模拟日适用的移民法版本',
        'Migration law on the simulation date',
        undefined,
        policy.values.migrationCodeFrom.sources,
        '此模拟日早于本规则集覆盖的移民法典，须按当时有效的规定核实。',
        'This date predates the Migration Code covered here. Verify the provisions in force at that time.',
        ['PD-300'],
      );
      return {
        id,
        title: c.L(titles[id][0], titles[id][1]),
        status: 'UNKNOWN',
        checks: [scope, version],
        assumptions: [],
        pendingDetails: ['PD-300'],
      };
    }
    const rules = [
      scope,
      ...commonChecks(id, req, c),
      ...specialChecks(id, req, c),
    ];
    let time: GrPathway | undefined;
    let timing: CountryCheck[] = [];
    const needed = timeRoute(id, req);
    if (needed) {
      time = routeTiming(needed, req, times, c);
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
    const incomeIndex =
      nationality && !req.nationality?.pendingApplicationFiledOn
        ? rules.findIndex((check) => check.id === 'NAT-07')
        : -1;
    const fixedGates = rules.filter(
      (check, index) => check.id !== 'C-06' && index !== incomeIndex,
    );
    const canProject = fixedGates.every(
      (check) => check.status === 'MET' || c.waitDates.has(check),
    );
    const waits = fixedGates
      .map((check) => c.waitDates.get(check))
      .filter((date) => date !== undefined);
    let earliestDate = [
      ...waits,
      ...(time?.earliestDate ? [time.earliestDate] : []),
    ]
      .sort()
      .at(-1);
    // The period counted today may end before another requirement (e.g. a refiling ban) matures.
    let jointTime = time;
    if (
      needed &&
      time?.earliestDate &&
      earliestDate &&
      earliestDate > time.earliestDate &&
      canProject
    ) {
      const onOpening = { ...req, simulationDate: earliestDate };
      jointTime = routeTiming(
        needed,
        onOpening,
        pilotTimes(onOpening, [needed], c),
        c,
      );
      earliestDate = jointTime?.earliestDate;
    }
    let summary =
      jointTime && jointTime !== time ? jointTime.summary : undefined;
    if (
      canProject &&
      (!needed ||
        jointTime?.status === 'MET' ||
        jointTime?.status === 'FUTURE') &&
      earliestDate &&
      earliestDate > req.simulationDate
    ) {
      if (incomeIndex >= 0) {
        const income = nationalityIncomeCheck(
          { ...req, simulationDate: earliestDate },
          c,
        );
        const filing = c.L(
          `按预计递件日 ${earliestDate} 核对税年材料。`,
          `Tax years are assessed as of the projected filing date, ${earliestDate}. `,
        );
        rules[incomeIndex] = {
          ...income,
          explanation: filing + income.explanation,
        };
        if (income.status !== 'MET') summary = rules[incomeIndex].explanation;
      }
      const index = rules.findIndex((check) => check.id === 'C-01');
      if (index >= 0) {
        const document = passportCheck(id, req, c, earliestDate);
        if (document.status === 'UNKNOWN') {
          rules[index] = document;
          summary = document.explanation;
        }
      }
    }
    const gates = rules.filter((check) => check.id !== 'C-06');
    const blocked = gates.some(
      (check) => check.status === 'NOT_MET' && !c.waitDates.has(check),
    );
    const unknown = gates.some((check) => check.status === 'UNKNOWN');
    const status: CountryPathway['status'] =
      blocked ||
      jointTime?.status === 'NOT_MET' ||
      jointTime?.status === 'NOT_APPLICABLE'
        ? 'NOT_MET'
        : unknown || (needed && !jointTime) || jointTime?.status === 'UNKNOWN'
          ? 'UNKNOWN'
          : waits.length > 0 || jointTime?.status === 'FUTURE'
            ? 'FUTURE'
            : 'MET';
    const checks = [...timing, ...rules];
    return {
      id,
      title: c.L(titles[id][0], titles[id][1]),
      status,
      checks,
      earliestDate:
        status === 'FUTURE' || status === 'MET' ? earliestDate : undefined,
      assumptions: time?.assumptions ?? [],
      ...(summary ? { summary } : {}),
      pendingDetails: [
        ...new Set([
          ...(time?.pendingDetails ?? []),
          ...(jointTime?.pendingDetails ?? []),
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
