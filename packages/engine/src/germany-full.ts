import { germanyFull2026_11 as policy } from '@uk-immigration/policy-data';
import type {
  CountryCheck,
  CountryPathway,
  CountryResult,
} from './country-result';
import {
  DE_UNLIMITED_KINDS,
  evaluateGermanyTimeline,
  type DeRequest,
  type DePermit,
  type DePathway,
  type DePermitKind,
} from './germany';
import {
  citizenshipChecks,
  citizenshipTimeOverride,
  citizenshipAdvisoryIds,
  type DeCitizenshipAnswers,
} from './germany-citizenship';
import {
  settlementChecks,
  mobilityTime,
  type DeSettlementAnswers,
} from './germany-settlement';
import {
  blueCardTimeInputs,
  mobilityChecks,
  naturalisationTitleLosses,
  retainedTitle,
  type DeMobilityAnswers,
  type DocumentReviews,
  type TitleReview,
} from './germany-mobility';
import { commonChecks, type DeCommonAnswers } from './germany-full-common';
import { feeChecks, type DeFeeAnswers } from './germany-fees';
import { all, any, check, src } from './germany-full-shared';
import { textFor } from './rule';
import type { IsoDate } from './types';

const routes = {
  R00: ['许可存续与出境', 'Residence title retention and absences'],
  R01: ['一般定居许可', 'General settlement permit'],
  R02: ['技术人员定居', 'Skilled worker settlement'],
  R03: ['欧盟蓝卡定居', 'EU Blue Card settlement'],
  R04: ['德国公民家属定居', 'Settlement for family of a German citizen'],
  R05: ['难民定居（普通档）', 'Refugee settlement (ordinary tier)'],
  'R05-fast': ['难民定居（加速档）', 'Refugee settlement (accelerated tier)'],
  R06: ['欧盟长期居留', 'EU long-term resident status'],
  R07: ['一般入籍', 'Ordinary naturalisation'],
  R08: [
    '德国公民配偶或登记伴侣入籍',
    'Naturalisation of a German citizen’s spouse or registered partner',
  ],
  R09: [
    '辅助保护及其他人道定居',
    'Humanitarian settlement including subsidiary protection',
  ],
  R10: ['企业经营者定居', 'Entrepreneur settlement'],
  R11: ['在德长大的家庭居留子女', 'Settlement for a child raised in Germany'],
  R12: ['技术人员定居许可持有人的配偶', 'Spouse of a settled skilled worker'],
  R13: ['高资质学术人才定居', 'Settlement for highly qualified academics'],
  R14: ['德国公务员定居', 'Civil servant settlement'],
  R15: [
    '共同生活结束后的配偶定居',
    'Settlement after the marital community ends',
  ],
  R16: ['家属随同入籍', 'Naturalisation with a family member'],
  R17: ['裁量入籍', 'Discretionary naturalisation'],
  R18: ['自由流动永久居住权', 'Permanent residence under free movement law'],
} as const;
export type DeFullRoute = keyof typeof routes;
export const DE_FULL_ROUTES = Object.keys(routes) as DeFullRoute[];

type FullPermit = DePermit & Omit<TitleReview, 'kind'>;

export interface DeFullRequest extends Partial<
  Omit<DeRequest, 'settlementRoute' | 'naturalisationRoute'>
> {
  simulationDate: IsoDate;
  permits?: FullPermit[];
  birthDate?: IsoDate;
  /** By default assess every route. Empty histories are explicit answers. */
  routes?: readonly DeFullRoute[];
  common?: DeCommonAnswers;
  settlement?: DeSettlementAnswers;
  mobility?: DeMobilityAnswers;
  citizenship?: DeCitizenshipAnswers;
  fees?: DeFeeAnswers;
}

const p = policy.values;
const pilotSettlement = {
  R00: 'general',
  R01: 'general',
  R02: 'skilled',
  R03: 'blue-card',
  R04: 'german-family',
  R05: 'refugee',
  'R05-fast': 'refugee',
  R06: 'general',
  R07: 'general',
  R08: 'general',
  R15: 'general',
} as const;
type PilotRoute = keyof typeof pilotSettlement;
const timing = {
  R00: ['DE-C63-time', '§ 51 Abs. 1, 9–10', 'PD-124 PD-353'],
  R01: ['DE-C13', '§ 9 Abs. 2 Nr. 1, Abs. 4', 'PD-120 PD-122'],
  R02: ['DE-C15-time', '§ 18c Abs. 1 Satz 1 Nr. 1, Satz 2', 'PD-122 PD-346'],
  R03: ['DE-C19-time', '§ 18c Abs. 2', 'PD-123 PD-350'],
  R04: ['DE-C22-time', '§ 28 Abs. 2', 'PD-120 PD-352'],
  R05: ['DE-C25-time', '§ 26 Abs. 3 Sätze 1–2', 'PD-126 PD-351'],
  'R05-fast': ['DE-C26-time', '§ 26 Abs. 3 Sätze 3–4', 'PD-126 PD-351'],
  R06: ['DE-C28', '§§ 9a Abs. 2 Nr. 1, 9b', 'PD-125 PD-353'],
  R07: ['DE-C55', '§§ 10 Abs. 1, 12b', 'PD-127 PD-128 PD-129'],
  R08: ['DE-C56-time', '§§ 9, 12b', 'PD-128 PD-359'],
  R15: ['DE-C42-time', '§§ 9 Abs. 2 Satz 1 Nr. 1, 31 Abs. 3', 'PD-120 PD-352'],
} as const;

function currentPermit(req: DeFullRequest) {
  return req.permits
    ?.filter((p) => p.from <= req.simulationDate)
    .sort((a, b) => b.from.localeCompare(a.from))[0];
}

// Reuse the same evaluation when several full routes request the same pilot timeline.
function pilotReader(req: DeFullRequest) {
  const cache = new Map<string, ReturnType<typeof evaluateGermanyTimeline>>();
  const titleLosses = naturalisationTitleLosses(req);
  return (
    route: PilotRoute,
    trained = req.trainedInGermany,
    credited = req.contributionMonths,
  ): DePathway | undefined => {
    if (!req.firstEntry || !req.permits || !req.trips) return undefined;
    const settlementRoute = pilotSettlement[route];
    const naturalisationRoute = route === 'R08' ? 'spouse' : 'general';
    const fast = route === 'R05-fast';
    const key = [
      settlementRoute,
      naturalisationRoute,
      fast,
      trained,
      credited,
    ].join('/');
    let result = cache.get(key);
    if (!result) {
      const protection = req.settlement?.protectionTitle;
      const resettled =
        settlementRoute === 'refugee' &&
        (protection === 'section23-4' || protection === 'legacy-resettlement');
      const current = currentPermit(req);
      const permits =
        settlementRoute === 'refugee'
          ? req.permits.map((permit) =>
              permit.kind === 'resettlement' &&
              (permit.protectedResettlement ??
                (resettled && permit === current))
                ? { ...permit, kind: 'protection' as const }
                : permit,
            )
          : req.permits;
      const blue = route === 'R03' ? blueCardTimeInputs(req) : undefined;
      result = evaluateGermanyTimeline(
        {
          ...req,
          firstEntry: req.firstEntry,
          permits,
          trips: req.trips,
          settlementRoute,
          naturalisationRoute,
          trainedInGermany: trained,
          germanC1: fast,
          contributionMonths: credited,
          ...(blue && {
            germanB1: blue.germanB1,
            blueCardEmploymentMonths: blue.blueCardEmploymentMonths,
          }),
        },
        {
          employmentWindows: blue?.employmentWindows,
          countedResidenceSince: req.citizenship?.countedResidenceSince,
          naturalisationTitleLosses:
            naturalisationRoute === 'general' ? titleLosses : undefined,
        },
      );
      cache.set(key, result);
    }
    const id =
      route === 'R00'
        ? 'DE-TRAVEL'
        : route === 'R06'
          ? 'DE-EU-LONG-TERM'
          : route === 'R07' || route === 'R08'
            ? 'DE-NATURALISATION'
            : 'DE-SETTLEMENT';
    return result.pathways.find((pathway) => pathway.id === id);
  };
}

function timeCheck(
  route: PilotRoute,
  req: DeFullRequest,
  read: ReturnType<typeof pilotReader>,
  checks: CountryCheck[],
  unresolvedDocument: boolean,
) {
  // The pilot can project pension accrual. Use the applicable credits or waiver
  // before taking that date, otherwise a satisfied pension test delays residence.
  const pensionId =
    route === 'R01' ? 'DE-C05' : route === 'R02' ? 'DE-C17' : undefined;
  const pensionMet =
    pensionId && checks.some((c) => c.id === pensionId && c.status === 'MET');
  let credited = req.contributionMonths;
  if (route === 'R01' && credited !== undefined)
    credited += req.common?.creditedCareMonths ?? 0;
  if (route === 'R15' || pensionMet)
    credited =
      route === 'R02'
        ? p.skilledContributionMonths.value
        : p.generalContributionMonths.value;
  const old = read(route, req.trainedInGermany, credited);
  let first = old?.checks[0]?.met;
  let changed = false;
  if (route === 'R02') {
    if (
      req.simulationDate < p.skilledCurrentFrom.value ||
      (req.trainedInGermany === undefined &&
        first !== true &&
        read(route, true)?.checks[0]?.met !== false)
    ) {
      first = undefined;
      changed = true;
    }
  }
  const retention = checks.find((c) => c.id === 'DE-C63-current');
  const resolvedBlueCard =
    route === 'R03' && checks.find((c) => c.id === 'DE-C19');
  // A detailed, current card decision resolves the pilot's holding check.
  // Employment is still examined month by month in C19-months.
  if (
    resolvedBlueCard &&
    (req.mobility?.titles ||
      !old ||
      req.mobility?.blueCard?.cardHeldAtDecision !== undefined)
  ) {
    const confirmedCard =
      resolvedBlueCard.status === 'UNKNOWN'
        ? undefined
        : resolvedBlueCard.status === 'MET';
    changed = first !== confirmedCard;
    first = confirmedCard;
  }
  // A title which survived under § 51 does not automatically supply residence days.
  // Preserve the absence history until its credit under the route is established.
  const conflict =
    route !== 'R03' &&
    retention?.status === 'MET' &&
    first !== true &&
    req.mobility?.titles?.some((title) =>
      title.trips?.some((t) => t.departed <= req.simulationDate),
    ) &&
    read('R00')?.checks.some((c) => c.met !== true);
  if (conflict) {
    first = undefined;
    changed = true;
  }
  let override = citizenshipTimeOverride(route, req, first);
  if (override === 'pilot' && route === 'R06' && req.settlement?.euMobility)
    override = any(first, mobilityTime(req));
  if (override !== 'pilot') {
    first = override;
    changed = true;
  } else if (route === 'R08' && old) first = all(first, old.checks[1]?.met);
  if (route === 'R00') {
    first =
      old?.status === 'NOT_APPLICABLE'
        ? true
        : old && all(...old.checks.map((c) => c.met));
  }
  if (old?.status === 'NOT_APPLICABLE' && route !== 'R00' && !changed)
    first = false;
  const needsDocument =
    unresolvedDocument && (route === 'R00' || retention?.status === 'UNKNOWN');
  if (needsDocument) {
    first = undefined;
    changed = true;
  }
  const [id, law, pd] = timing[route];
  const natural = route === 'R07' || route === 'R08';
  const refs = old?.checks.flatMap((c) => c.sources) ?? [];
  refs.push(src(natural ? 101 : 100, law));
  if (route === 'R06') refs.push(...p.euMobility.sources);
  if (route === 'R07') refs.push(...p.turboAbolishedFrom.sources);
  if (route === 'R05' || route === 'R05-fast')
    refs.push(src(100, '§ 26 Abs. 3 Satz 6; § 104 Abs. 5'));
  const L = textFor(req);
  const description = needsDocument
    ? L(
        '当前许可对应的文书及其存续事实仍需核实。',
        'The current permit must be linked to a document with confirmed retention facts.',
      )
    : conflict && override === 'pilot'
      ? L(
          '原计时按出境期限扣除了许可期间。当前文书仍有效，还须确认这次出境在本路径可计入的天数。',
          'The baseline period excluded time after an absence deadline. The title was retained, but credit for that absence under this route needs confirmation.',
        )
      : changed
        ? L(
            '按本路径的特殊期间、缩短档或版本核定。',
            'Assessed using the special period, shortened tier or version for this route.',
          )
        : (old?.checks[0]?.text ??
          old?.summary ??
          L(
            '请填写首次入境日、完整许可记录及出境记录。',
            'Enter first arrival and complete permit and absence histories.',
          ));
  const rule = check(
    req.locale,
    id,
    '居留、许可或出境时间',
    'Residence, permit or absence period',
    first,
    refs,
    pd,
  );
  rule.explanation =
    route === 'R00' && old && !needsDocument
      ? [old.summary, ...old.checks.map((c) => c.text)].join(' ')
      : description;
  if (route === 'R08' && !changed && old?.checks[1])
    rule.explanation += ' ' + old.checks[1].text;
  if (first === undefined)
    rule.pendingDetails = [
      ...new Set([
        ...(rule.pendingDetails ?? []),
        ...(old?.pendingDetails ?? []),
        ...(conflict || needsDocument ? ['PD-353'] : []),
      ]),
    ];
  return { rule, old, changed };
}

function currentTitleCheck(
  req: DeFullRequest,
  route: DeFullRoute,
  reviews: DocumentReviews,
): CountryCheck | undefined {
  if (['R00', 'R13', 'R18'].includes(route)) return;
  // Free-movement and Swiss rights may satisfy nationality law independently of a German title.
  if (
    ['R07', 'R08', 'R16', 'R17'].includes(route) &&
    ['permanent-right', 'swiss-agreement'].includes(
      req.citizenship?.currentTitle ?? '',
    )
  )
    return;
  let kind: DePermitKind | undefined = currentPermit(req)?.kind;
  if (route === 'R03') kind = 'blue-card';
  if (route === 'R04') kind = 'german-family';
  return check(
    req.locale,
    'DE-C63-current',
    '本路径所依赖的许可仍有效',
    'The title relied on for this route remains effective',
    route === 'R03' && req.mobility?.titles === undefined
      ? req.mobility?.blueCard?.cardHeldAtDecision
      : retainedTitle(req, kind, reviews),
    [src(100, '§§ 51 Abs. 1–4, 7, 9–10, 81 Abs. 4')],
    'PD-124 PD-353',
  );
}

const procedure = new Set([
  'DE-C01-procedure',
  'DE-C06-authority',
  'DE-C11-deadline',
  'DE-C11',
  'DE-C16-initial',
  'DE-C34-initial',
  ...citizenshipAdvisoryIds,
]);
// Procedural notes that do not decide a pathway's status.
export const DE_PROCEDURE_CHECKS: ReadonlySet<string> = procedure;

// SRC-100 §§ 51, 81(4). Retention evidence belongs to one physical document.
// Earlier and subsequent permits keep their own periods, even for the same kind.
function mergeDocumentFacts(permit: FullPermit, title: TitleReview) {
  const {
    to,
    renewing,
    validTo: permitValidity,
    continuingUnder81: permitContinuation,
    trips: permitTrips,
    ...permitFields
  } = permit;
  const {
    validTo,
    continuingUnder81,
    trips: titleTrips,
    ...titleFields
  } = title;
  const [expiry] = [to, permitValidity, validTo]
    .filter((d): d is IsoDate => !!d)
    .sort();
  const validity =
    expiry ?? (permitValidity === null || validTo === null ? null : undefined);
  let conflict = false;
  function agree<T>(a: T | undefined, b: T | undefined) {
    if (a === undefined) return b;
    if (b === undefined || a === b) return a;
    conflict = true;
    return undefined;
  }
  function mergeFields<T extends object>(a: T, b: T): T {
    const fields = { ...a };
    for (const key in b) {
      const fact = agree(a[key], b[key]);
      if (fact === undefined) delete fields[key];
      else fields[key] = fact;
    }
    return fields;
  }
  function mergePeriods<T>(
    a: T[] | undefined,
    b: T[] | undefined,
    start: (period: T) => IsoDate,
    merge: (a: T, b: T) => T,
  ) {
    if (!a || !b) return a ?? b;
    const byStart = new Map(a.map((t) => [start(t), t]));
    for (const t of b) {
      const key = start(t);
      const previous = byStart.get(key);
      byStart.set(key, previous === undefined ? t : merge(previous, t));
    }
    return [...byStart.values()].sort((l, r) =>
      start(l).localeCompare(start(r)),
    );
  }
  const trips = mergePeriods(
    permitTrips,
    titleTrips,
    (t) => t.departed,
    (left, right) => {
      const { outsideArea: a, ...first } = left;
      const { outsideArea: b, ...second } = right;
      return {
        ...mergeFields(first, second),
        outsideArea: mergePeriods(a, b, (t) => t.from, mergeFields),
      };
    },
  );
  const continuation = agree(
    agree(renewing, permitContinuation),
    continuingUnder81,
  );
  const fields = {
    ...mergeFields<Partial<TitleReview>>(permitFields, titleFields),
    trips,
  };
  return {
    title: {
      ...fields,
      kind: permit.kind,
      validTo: validity,
      continuingUnder81: continuation,
    },
    permit: {
      ...fields,
      kind: permit.kind,
      from: permit.from,
      to: expiry,
      validTo: validity,
      continuingUnder81: continuation,
      renewing: continuation,
    },
    conflict,
  };
}

function matchDocuments(req: DeFullRequest): {
  req: DeFullRequest;
  reviews: DocumentReviews;
} {
  const permits = req.permits;
  const current = currentPermit(req);
  if (!permits) return { req, reviews: {} };
  const detailed: TitleReview[] | undefined =
    req.mobility?.titles ??
    (current &&
    (current.noOtherLossEvent !== undefined || current.trips !== undefined)
      ? [{ kind: current.kind, from: current.from }]
      : undefined);
  const titles = detailed ?? [];
  const issued = permits.filter((p) => p.from <= req.simulationDate);
  const matches = titles.map((title) => {
    if (title.from)
      return permits.filter(
        (p) => p.kind === title.kind && p.from === title.from,
      );
    const sameKind = issued.filter((p) => p.kind === title.kind);
    const unclaimed = sameKind.filter(
      (p) => !titles.some((t) => t.kind === p.kind && t.from === p.from),
    );
    if (unclaimed.length <= 1) return unclaimed;
    // The timeline supersedes an open-ended older row. An explicit term or
    // continuation can still identify it as an independently held document.
    const present = unclaimed.filter((p) => {
      if (p.from === current?.from) return true;
      const { permit, conflict } = mergeDocumentFacts(p, { kind: p.kind });
      return (
        conflict ||
        (permit.noOtherLossEvent !== false &&
          (DE_UNLIMITED_KINDS.includes(permit.kind) ||
            permit.renewing ||
            permit.validTo === null ||
            (!!permit.to && permit.to >= req.simulationDate)))
      );
    });
    return present.length ? present : unclaimed;
  });
  const timeline = new Map<FullPermit, FullPermit>();
  const unresolved = new Set<TitleReview>();
  // A dated review of another card of the same kind cannot prove retention
  // of the timeline's current permit.
  let currentReview: TitleReview | undefined =
    current && titles.some((t) => t.kind === current.kind)
      ? { kind: current.kind }
      : undefined;
  const reviewed = titles.map((title, i) => {
    const candidates = matches[i];
    if (!candidates.length) return title;
    const [permit] = candidates;
    if (
      candidates.length !== 1 ||
      matches.some((rows, j) => i !== j && rows.includes(permit))
    ) {
      unresolved.add(title);
      return title;
    }
    const merged = mergeDocumentFacts(permit, title);
    timeline.set(permit, merged.permit);
    if (merged.conflict) unresolved.add(merged.title);
    if (permit === current) currentReview = merged.title;
    return merged.title;
  });
  return {
    req: {
      ...req,
      permits: permits.map(
        (p) =>
          timeline.get(p) ??
          (p.validTo !== undefined || p.continuingUnder81 !== undefined
            ? mergeDocumentFacts(p, { kind: p.kind }).permit
            : p),
      ),
      ...(detailed && { mobility: { ...req.mobility, titles: reviewed } }),
    },
    reviews: {
      current: currentReview,
      unresolved: unresolved.size ? unresolved : undefined,
    },
  };
}

export function evaluateGermanyFull(input: DeFullRequest): CountryResult {
  const { req, reviews } = matchDocuments(input);
  const L = textFor(req);
  const read = pilotReader(req);
  const pathways = [...new Set(req.routes ?? DE_FULL_ROUTES)].map(
    (route): CountryPathway => {
      const national = ['R07', 'R08', 'R16', 'R17'].includes(route);
      const checks = national
        ? citizenshipChecks(route, req)
        : route === 'R00' || route === 'R18'
          ? []
          : commonChecks(route, req);
      checks.push(
        ...settlementChecks(route, req),
        ...mobilityChecks(route, req, reviews),
      );
      const title = currentTitleCheck(req, route, reviews);
      if (title) checks.push(title);
      const time =
        route in pilotSettlement
          ? timeCheck(
              route as PilotRoute,
              req,
              read,
              checks,
              !!reviews.unresolved,
            )
          : undefined;
      if (time) checks.unshift(time.rule);
      // § 51 treats concurrent titles separately. When detailed records exist, an old
      // generic absence limit is only an explanation of the baseline calculation.
      const detailedTravel =
        route === 'R00' && req.mobility?.titles !== undefined;
      const eligible = detailedTravel
        ? retainedTitle(req, undefined, reviews)
        : all(
            ...checks
              .filter((c) => !procedure.has(c.id))
              .map((c) =>
                c.status === 'UNKNOWN' ? undefined : c.status === 'MET',
              ),
          );
      let status: CountryPathway['status'] =
        eligible === undefined ? 'UNKNOWN' : eligible ? 'MET' : 'NOT_MET';
      if (
        time?.old?.status === 'NOT_APPLICABLE' &&
        !time.changed &&
        route !== 'R00'
      )
        status = 'NOT_APPLICABLE';
      const timeOnly = new Set([time?.rule.id]);
      if (route === 'R03') timeOnly.add('DE-C19-months');
      if (route === 'R01') timeOnly.add('DE-C05');
      if (route === 'R02') timeOnly.add('DE-C17');
      const date = checks.some(
        (c) => timeOnly.has(c.id) && c.status === 'UNKNOWN',
      )
        ? undefined
        : time?.old?.earliestDate;
      const uncertainDeparture =
        time?.old?.status === 'UNKNOWN' &&
        time.old.pendingDetails?.includes('PD-353');
      if (
        ((time?.old?.status === 'FUTURE' && date) || uncertainDeparture) &&
        !time?.changed &&
        status === 'NOT_MET' &&
        checks.every(
          (c) =>
            procedure.has(c.id) ||
            c.status === 'MET' ||
            (timeOnly.has(c.id) && c.status === 'NOT_MET'),
        )
      )
        status = uncertainDeparture ? 'UNKNOWN' : 'FUTURE';
      checks.push(...feeChecks(route, req));
      const pendingDetails = [
        ...new Set([
          ...checks.flatMap((c) => c.pendingDetails ?? []),
          ...(uncertainDeparture ? ['PD-353'] : []),
        ]),
      ];
      const assumptions: string[] = [];
      if (status === 'FUTURE')
        assumptions.push(...(time?.old?.assumptions ?? []));
      if (
        status === 'FUTURE' &&
        route === 'R03' &&
        req.mobility?.blueCard?.employment
      )
        assumptions.push(
          L(
            '按月填报时，预测以相应工资月结束后确认同期缴费为前提，且决定日仍须受雇并达到届时适用的工资线。',
            'The forecast assumes contributions are confirmed after each payroll month closes and the job still meets the applicable pay threshold on the decision date.',
          ),
        );
      return {
        id: 'DE-' + route,
        title: L(routes[route][0], routes[route][1]),
        status,
        checks,
        assumptions,
        pendingDetails,
        ...(status === 'MET'
          ? { earliestDate: req.simulationDate }
          : status === 'FUTURE'
            ? { earliestDate: date }
            : {}),
        ...(date && date > req.simulationDate && !time?.changed
          ? {
              summary: L(
                `按现有记录测算的时间条件日期为 ${date}，其他条件按模拟日评估。`,
                `The projected date for the time conditions is ${date}. Other conditions are assessed on the simulation date.`,
              ),
            }
          : {}),
      };
    },
  );
  return {
    policyAsOf: policy.asOf,
    columns: [
      {
        id: policy.ruleSetId,
        title: L('德国现行法律', 'Current German law'),
        pathways,
      },
    ],
  };
}
