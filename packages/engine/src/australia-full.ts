import {
  australiaFull2026_11 as policy,
  auRegionalParameters as regional,
} from '@uk-immigration/policy-data';
import { evaluateAustralia, type AuRequest, type AuVisa } from './australia';
import { additionalEnglishCheck } from './australia-fees';
import { checker } from './australia-check';
import {
  auNotes,
  commonChecks,
  type AuCommonAnswers,
} from './australia-common';
import {
  citizenshipTimeRequest,
  familyChecks,
  partnerTimeRequest,
  type AuFamilyAnswers,
} from './australia-family';
import {
  functionalEnglishCheck,
  skilledChecks,
  type AuSkilledAnswers,
} from './australia-skilled';
import type {
  CountryCheck,
  CountryPathway,
  CountryResult,
} from './country-result';
import { addDays, addYears, fullYears } from './dates';
import { afterYears, type PilotPathway } from './pilot';
import { textFor } from './rule';
import type { IsoDate } from './types';

const titles = {
  'AU-186-TRT': [
    '雇主担保永久居留（186 临时居留过渡）',
    'Employer Nomination Scheme (186 Temporary Residence Transition)',
  ],
  'AU-186-DE': [
    '雇主担保永久居留（186 直接申请）',
    'Employer Nomination Scheme (186 Direct Entry)',
  ],
  'AU-189-PT': [
    '独立技术移民（189 打分类）',
    'Skilled Independent (189 Points-tested)',
  ],
  'AU-190': ['州或领地提名技术移民（190）', 'Skilled Nominated (190)'],
  'AU-191': [
    '偏远地区永久居留（191 临时签证转永居）',
    'Permanent Residence (191 Regional Provisional Visas)',
  ],
  'AU-189-HK': [
    '独立技术移民（189 香港类别）',
    'Skilled Independent (189 Hong Kong)',
  ],
  'AU-191-HK': [
    '偏远地区永久居留（191 香港类别）',
    'Permanent Residence (191 Hong Kong Regional)',
  ],
  'AU-PARTNER': [
    '配偶移民（820 → 801 或 309 → 100）',
    'Partner (820 to 801 or 309 to 100)',
  ],
  'AU-858': ['国家创新签证（858）', 'National Innovation (858)'],
  'AU-RRV': ['居民返程签证（155 或 157）', 'Resident Return (155 or 157)'],
  'AU-CITIZENSHIP': [
    '授予澳大利亚公民身份',
    'Australian citizenship by conferral',
  ],
} as const;
export type AuFullPathId = keyof typeof titles;
export const AU_FULL_PATHWAYS = Object.keys(titles) as AuFullPathId[];

type Compliance = 'complied' | 'minor-breach' | 'not-complied';
type Location = 'onshore' | 'offshore' | 'clearance';
export interface AuFullRequest
  extends
    Omit<Partial<AuRequest>, 'partnerApplication'>,
    AuSkilledAnswers,
    AuCommonAnswers,
    AuFamilyAnswers {
  simulationDate: IsoDate;
  partnerApplication?: {
    lodged: IsoDate;
    stream: 'onshore' | 'offshore';
    longTermRelationship?: boolean;
  };
  /** Omit to compare every pathway. The simulation date is the proposed application date unless a prior combined lodgement is supplied. */
  pathway?: AuFullPathId;
  locationAtApplication?: Location;
  locationAtDecision?: Location;
  /** Onshore visa status at lodgement for streams requiring a substantive visa or bridging A, B or C. */
  permissibleOnshoreVisa?: boolean;
  regionalLockException?: 'instrument-confirmed' | 'claimed' | 'none';
  hongKongPassport?: boolean;
  /** Primary grant with the travel/stay entitlement in Sch 1 item 1137(4M) / 1139(3A). */
  hongKongPrimaryVisaTerms?: boolean;
  visaCompliance?: Compliance;
  regional?: {
    /** End years of distinct Australian income years with an ATO notice and all applicable amendments. */
    assessmentYears?: number[];
    disputedAssessment?: boolean;
    /** First day of living, working and studying only in designated areas for 191 HK. Null confirms an unmet period. */
    hongKongOnlySince?: IsoDate | null;
    hongKongRegionalException?: 'confirmed' | 'claimed' | 'none';
    regionalCondition?:
      'complied' | 'outside-region' | 'class-confirmed' | 'class-claimed';
    changeNotice?: Compliance;
    evidenceAndInterview?: Compliance;
  };
}

function lastSubstantive(visas: AuVisa[], date: IsoDate): AuVisa | undefined {
  return visas
    .filter(
      (v) =>
        v.from <= date &&
        v.subclass !== 'bridging' &&
        v.subclass !== 'bridging-trt',
    )
    .sort((a, b) => a.from.localeCompare(b.from))
    .at(-1);
}

const isRegional = (visa?: AuVisa): visa is AuVisa =>
  visa?.subclass === '491' || visa?.subclass === '494';
const isHk = (id: AuFullPathId) => id === 'AU-189-HK' || id === 'AU-191-HK';

function lockCheck(id: AuFullPathId, r: AuFullRequest): CountryCheck[] {
  const locators: Partial<Record<AuFullPathId, string>> = {
    'AU-186-DE': '186.232A',
    'AU-189-PT': '189.224A',
    'AU-190': '190.215A',
    'AU-858': '858.213',
    'AU-PARTNER': 'Sch 1 item 1214C(3)(h)',
  };
  const locator = locators[id];
  if (!locator) return [];
  const partner = id === 'AU-PARTNER';
  const stream = r.partnerApplication?.stream ?? r.partner?.stream;
  if (partner && stream === 'offshore') return [];
  const date =
    partner && r.partnerApplication
      ? r.partnerApplication.lodged
      : r.simulationDate;
  const visa = r.visas && lastSubstantive(r.visas, date);
  // An expired last substantive visa counts only for the period it was actually held.
  const end = visa?.to && visa.to < date ? addDays(visa.to, 1) : date;
  let met =
    r.visas === undefined
      ? undefined
      : !isRegional(visa) ||
        afterYears(visa.from, regional.lockYears.value) <= end;
  if (met === false) {
    if (partner && !stream) met = undefined;
    if (!partner && r.regionalLockException !== 'none') {
      met =
        r.regionalLockException === 'instrument-confirmed' ? true : undefined;
    }
  }
  return [
    checker(r.locale)(
      'AU-regional-lock',
      met,
      '前置偏远地区签证锁定期',
      'Earlier regional visa restriction',
      '按递交日核对当前或最后一份实质签证及实际持有年限。境内配偶须持满年限；技术类例外须有相应文书依据。',
      'Check the actual time on the current or last substantive visa at lodgement. The onshore partner route requires the full period. A skilled-stream exception must be specified by instrument.',
      'SRC-200',
      locator,
    ),
  ];
}

const applicationItems: Partial<Record<AuFullPathId, string>> = {
  'AU-186-TRT': '1114B(3)',
  'AU-186-DE': '1114B(3)',
  'AU-189-PT': '1137(4A)',
  'AU-190': '1138(3)',
  'AU-191': '1139(3)',
  'AU-189-HK': '1137(4L)',
  'AU-191-HK': '1139(3)',
  'AU-858': '1113(3)',
};
function locationChecks(id: AuFullPathId, r: AuFullRequest): CountryCheck[] {
  const check = checker(r.locale);
  const item = applicationItems[id];
  const cls =
    id === 'AU-PARTNER'
      ? '100.411, 309.412, 801.411, 820.411'
      : id.split('-')[1] + '.411';
  if (!item && id !== 'AU-PARTNER') return [];
  const result: CountryCheck[] = [];
  if (item) {
    const requiresVisa = !isHk(id) && id !== 'AU-191';
    const loc = r.locationAtApplication;
    const valid =
      loc === undefined
        ? undefined
        : loc === 'clearance'
          ? false
          : loc === 'onshore' && requiresVisa
            ? r.permissibleOnshoreVisa
            : true;
    result.push(
      check(
        'AU-lodgement-location',
        valid,
        '递交地点及境内签证身份',
        'Place and status at lodgement',
        requiresVisa
          ? '递交时须在移民查验区外；在澳洲境内者须持实质签证或 A、B、C 类过桥签证。'
          : '允许在境内或境外递交，须在移民查验区外。',
        requiresVisa
          ? 'Lodge outside immigration clearance. In Australia, hold a substantive visa or a bridging visa A, B or C.'
          : 'Lodge in or outside Australia, outside immigration clearance.',
        'SRC-200',
        'Sch 1 item ' + item,
      ),
    );
  }
  result.push(
    check(
      'AU-grant-location',
      r.locationAtDecision === undefined
        ? undefined
        : r.locationAtDecision !== 'clearance',
      '批签地点',
      'Place of grant',
      '核对批签时是否身处移民查验区外。',
      'Confirm that the applicant will be outside immigration clearance at grant.',
      'SRC-200',
      cls,
    ),
  );
  return result;
}

// A date counts only once, in a completed income year overlapping a regional
// visa. A later substantive grant ends an open-ended earlier visa (s 82).
function noticeCount(r: AuFullRequest) {
  const years = r.regional?.assessmentYears;
  if (!years || !r.visas) return undefined;
  const visas = r.visas
    .filter((v) => v.subclass !== 'bridging' && v.subclass !== 'bridging-trt')
    .sort((a, b) => a.from.localeCompare(b.from));
  return [...new Set(years)].filter((year) => {
    const end = year + '-' + regional.incomeYearEnd.value;
    const start = addDays(addYears(end, -1), 1);
    return (
      end < r.simulationDate &&
      visas.some((visa, i) => {
        const next = visas[i + 1];
        return (
          isRegional(visa) &&
          visa.from <= end &&
          (!visa.to || visa.to >= start) &&
          (!next || (next.from > start && next.from > visa.from))
        );
      })
    );
  }).length;
}

function regionalChecks(id: AuFullPathId, r: AuFullRequest): CountryCheck[] {
  if (id !== 'AU-191' && !isHk(id)) return [];
  const check = checker(r.locale);
  const regular = id === 'AU-191';
  const compliance = (a?: Compliance) =>
    a === 'complied' ? true : a === 'not-complied' ? false : undefined;
  const prior =
    r.publicInterest?.temporaryInsurance === 'lapsed' &&
    r.visaCompliance !== 'not-complied'
      ? 'minor-breach'
      : r.visaCompliance;
  const results = [
    check(
      'AU-prior-visa-compliance',
      compliance(prior),
      '前置签证及后续过桥签证履约',
      'Compliance with prior and subsequent bridging visas',
      '核对其余所附条件，包括适用的工作限制及医保。轻微违反须由审理机关判断是否仍属实质遵守。',
      'Check remaining visa conditions, including applicable employment and insurance conditions. A minor breach requires assessment of substantial compliance.',
      'SRC-200',
      regular ? '191.221(1)' : id === 'AU-189-HK' ? '189.241' : '191.231(1)',
      prior === 'minor-breach' ? 'PD-204' : undefined,
    ),
  ];
  const from = regular
    ? regional.regionalApplicationsFrom
    : policy.values.hongKongStreamsFrom;
  results.push(
    check(
      'AU-stream-open',
      r.simulationDate >= from.value,
      '通道开放日期',
      'Stream opening date',
      '本通道接受递交的起始日为 ' + from.value + '。',
      'Applications open on ' + from.value + '.',
      'SRC-200',
      regular
        ? 'Sch 1 item 1139(3)(ba)'
        : 'Sch 1 items 1137(4L)(b), 1139(3)(bb)(i)',
    ),
  );
  if (!regular) {
    const hkItem =
      id === 'AU-189-HK' ? '1137(4L)(e), (4M)' : '1139(3)(ca), (3A)';
    results.push(
      check(
        'AU-HK-passport',
        r.hongKongPassport ?? (r.hongKong ? true : undefined),
        '香港特区或 BN(O) 护照',
        'HKSAR or BN(O) passport',
        '确认递交时持有合资格护照。',
        'Confirm an eligible passport at lodgement.',
        'SRC-200',
        'Sch 1 item ' + hkItem,
      ),
    );
    results.push(
      check(
        'AU-HK-primary-visa',
        r.hongKongPrimaryVisaTerms ?? (r.hongKong ? true : undefined),
        '前置主签证及停留权限',
        'Primary visa grant and travel entitlement',
        '核对签证批文中的主申请人身份、获批日期和允许停留期间。',
        'Check primary grant, grant date and permitted stay against the visa grant notice.',
        'SRC-200',
        'Sch 1 item ' + hkItem,
      ),
    );
    results.push(functionalEnglishCheck(id, r));
    return results;
  }
  const a = r.regional ?? {};
  const location = a.regionalCondition;
  results.push(
    check(
      'AU-191-regional-activity',
      location === 'complied' || location === 'class-confirmed'
        ? true
        : location === 'outside-region'
          ? false
          : undefined,
      '在指定地区居住、工作及学习',
      'Residence, work and study in a designated area',
      '按前置签证适用的邮编及期间检查 8579；例外须属于文书指定类别。',
      'Check the postcodes and periods applicable to the prior visa under condition 8579. An exemption requires a specified class.',
      'SRC-200',
      '191.221(2)–(3); Sch 8 condition 8579',
      location === 'class-claimed' ? 'PD-204' : undefined,
    ),
  );
  results.at(-1)!.sources.push({ srcId: 'SRC-202', locator: 'Schedules 1–2' });
  const noticeDays = regional.changeNoticeDays.value;
  const responseDays = regional.evidenceRequestDays.value;
  results.push(
    check(
      'AU-191-change-notice',
      compliance(a.changeNotice),
      '变更通知',
      'Change notifications',
      `核对是否在 ${noticeDays} 天内通知适用的地址、联系方式、护照与工作地点变更，或确认没有变更。`,
      `Check applicable address, contact, passport and workplace changes were notified within ${noticeDays} days, or confirm no changes.`,
      'SRC-200',
      '191.221(1); Sch 8 condition 8578',
      a.changeNotice === 'minor-breach' ? 'PD-204' : undefined,
    ),
  );
  results.push(
    check(
      'AU-191-evidence',
      compliance(a.evidenceAndInterview),
      '核查文件及面谈',
      'Evidence requests and interviews',
      `收到要求时须在 ${responseDays} 天内提交指定证据，并按通知出席面谈；可以确认从未收到要求。`,
      `If requested, provide the specified evidence within ${responseDays} days and attend the interview as directed. Confirm if there was no request.`,
      'SRC-200',
      '191.221(1); Sch 8 conditions 8580–8581',
      a.evidenceAndInterview === 'minor-breach' ? 'PD-204' : undefined,
    ),
  );
  const count = noticeCount(r);
  const n = regional.relevantAssessments.value;
  results.push(
    check(
      'AU-191-tax-notices',
      count === undefined || a.disputedAssessment ? undefined : count >= n,
      'ATO 评税通知',
      'ATO notices of assessment',
      `已结束、曾持偏远地区签证并备齐评税及修订通知的财年：${count ?? '待填'}，需要 ${n} 个。现行没有最低应税收入额。`,
      `Completed income years with a regional visa and all original/amended assessments: ${count ?? 'unknown'}. Required: ${n}. There is currently no minimum taxable income.`,
      'SRC-200',
      '191.111, 191.222',
      a.disputedAssessment ? 'PD-212' : undefined,
    ),
  );
  results.at(-1)!.sources.push({
    srcId: 'SRC-063',
    locator: 'Satisfy the income requirement',
  });
  return results;
}

type TimeField = readonly [
  key: string,
  zh: string,
  en: string,
  locator: string,
];
const timeFields: Partial<Record<AuFullPathId, readonly TimeField[]>> = {
  'AU-191': [
    [
      'held',
      '偏远地区签证及持有年限',
      'Regional visa and holding period',
      'Sch 1 item 1139(3)(c)',
    ],
  ],
  'AU-186-TRT': [
    ['held', '累计持签时间', 'Qualifying visa periods', '186.226'],
    [
      'work',
      '累计担保全职工作时间',
      'Full-time sponsored employment',
      '186.227',
    ],
    ['current', '递交时的前置签证', 'Qualifying visa at lodgement', '186.226'],
  ],
  'AU-189-HK': [
    [
      'held',
      '前置签证及持有年限',
      'Visa and holding period',
      'Sch 1 item 1137(4L)(e)',
    ],
    ['residence', '连续通常居住', 'Continuous usual residence', '189.242'],
  ],
  'AU-191-HK': [
    [
      'held',
      '前置签证及持有年限',
      'Visa and holding period',
      'Sch 1 item 1139(3)(ca)',
    ],
    ['residence', '连续通常居住', 'Continuous usual residence', '191.232'],
    [
      'regional',
      '只在指定地区居住、工作及学习',
      'Living, working and studying only in designated areas',
      '191.231(2)',
    ],
  ],
};

function timeChecks(
  id: AuFullPathId,
  r: AuFullRequest,
  pilot?: PilotPathway,
): CountryCheck[] {
  const check = checker(r.locale);
  return (timeFields[id] ?? []).map(([key, zh, en, locator], i) => {
    const old = pilot?.checks[i];
    const hasEvidence =
      r.visas !== undefined &&
      (key !== 'work' || Boolean(r.firstArrival && r.trips)) &&
      (key !== 'residence' || Boolean(r.firstArrival && r.trips)) &&
      (key !== 'regional' ||
        Boolean(
          r.hongKong?.regionalSince ||
          r.regional?.hongKongOnlySince !== undefined,
        ));
    const noVisa =
      pilot?.status === 'NOT_APPLICABLE' &&
      (key === 'held' || key === 'current');
    let met = hasEvidence
      ? (old?.met ?? (noVisa ? false : undefined))
      : undefined;
    if (
      key === 'regional' &&
      r.regional?.hongKongRegionalException === 'confirmed'
    )
      met = true;
    if (
      key === 'regional' &&
      met !== true &&
      r.regional?.hongKongRegionalException === 'claimed'
    )
      met = undefined;
    const pd =
      key === 'residence' && hasEvidence && old && met === undefined
        ? 'PD-108'
        : key === 'work' && r.sponsoredFullTime === false
          ? 'PD-207'
          : key === 'regional' &&
              r.regional?.hongKongRegionalException === 'claimed'
            ? 'PD-204'
            : undefined;
    const detail = hasEvidence
      ? (old?.text ?? (noVisa ? pilot?.summary : undefined))
      : undefined;
    const regionalException =
      key === 'regional' && r.regional?.hongKongRegionalException;
    const rule = check(
      id + '-time-' + key,
      met,
      zh,
      en,
      regionalException === 'confirmed'
        ? '已确认属于 191.231(3) 的指定例外类别。'
        : (detail ?? '请补充相应签证、居住或工作记录，以核对这项时间条件。'),
      regionalException === 'confirmed'
        ? 'Confirmed member of the class specified under 191.231(3).'
        : (detail ??
            'Supply the relevant visa, residence or work history to check this time requirement.'),
      'SRC-200',
      locator,
      pd,
    );
    if (old) rule.sources.push(...old.sources);
    return rule;
  });
}

function familyPath(id: AuFullPathId) {
  return id === 'AU-RRV' || id === 'AU-PARTNER' || id === 'AU-CITIZENSHIP';
}

function eligibilityCheck(check: CountryCheck) {
  // RRV alternatives have their own disjunction. Charges and the citizenship
  // ceremony describe costs or a later stage, not grounds to refuse an application.
  return (
    !check.id.startsWith('AU-RRV-option-') &&
    !check.id.startsWith('AU-FEES-') &&
    check.id !== 'AU-CIT-pledge'
  );
}

export function evaluateAustraliaFull(r: AuFullRequest): CountryResult {
  return assess(r, true);
}

function assess(r: AuFullRequest, project: boolean): CountryResult {
  const L = textFor(r);
  const ids = r.pathway ? [r.pathway] : AU_FULL_PATHWAYS;
  let pilots: PilotPathway[] = [];
  let citizenshipPilot: PilotPathway | undefined;
  if (ids.some((id) => timeFields[id] || familyPath(id))) {
    // The legacy evaluator requires a complete timeline. Its date of birth is
    // irrelevant to the holding and work counts. Consumers below mask missing
    // evidence before reporting a check or a projected date.
    // The pilot stops projecting TRT dates at the ordinary age limit. With a
    // claimed exemption, isolate that cutoff from the actual age check in skilledChecks.
    const separateTrtAge =
      ids.includes('AU-186-TRT') &&
      r.employer?.exemption !== undefined &&
      r.employer.exemption !== 'none';
    const base = partnerTimeRequest(r, {
      ...r,
      dateOfBirth: separateTrtAge
        ? r.simulationDate
        : (r.dateOfBirth ?? r.simulationDate),
      trips: r.trips ?? [],
      visas: r.visas ?? [],
      hongKong: {
        regionalSince:
          r.regional?.hongKongOnlySince === null
            ? undefined
            : (r.regional?.hongKongOnlySince ?? r.hongKong?.regionalSince),
      },
    });
    pilots = evaluateAustralia(base).pathways;
    if (ids.includes('AU-CITIZENSHIP')) {
      const citizenBase =
        separateTrtAge && r.dateOfBirth
          ? { ...base, dateOfBirth: r.dateOfBirth }
          : base;
      const scv = citizenshipTimeRequest(r, citizenBase);
      citizenshipPilot = (
        scv === base ? pilots : evaluateAustralia(scv).pathways
      ).find((p) => p.id === 'AU-CITIZENSHIP');
    }
  }
  const pathways = ids.map((id): CountryPathway => {
    const pilot =
      id === 'AU-CITIZENSHIP'
        ? citizenshipPilot
        : pilots.find((p) => p.id === id);
    const trusted =
      id === 'AU-CITIZENSHIP' || id === 'AU-RRV'
        ? r.firstArrival &&
          r.visas &&
          r.trips &&
          (id !== 'AU-CITIZENSHIP' || r.dateOfBirth)
          ? pilot
          : undefined
        : pilot;
    const checks = [
      ...timeChecks(id, r, pilot),
      ...locationChecks(id, r),
      ...lockCheck(id, r),
      ...regionalChecks(id, r),
      ...skilledChecks(id, r),
      ...familyChecks(id, r, trusted),
      ...additionalEnglishCheck(id, r),
      ...commonChecks(id, r),
    ];
    const decisive = checks.filter(eligibilityCheck);
    const failed = decisive.filter((c) => c.status === 'NOT_MET');
    const unknown = decisive.some((c) => c.status === 'UNKNOWN');
    const timeOnly =
      failed.length > 0 &&
      failed.every(
        (c) =>
          c.id.startsWith(id + '-time-') ||
          c.id.startsWith('AU-CIT-time-') ||
          c.id === 'AU-PARTNER-time',
      );
    const due = trusted?.earliestDate;
    const future =
      timeOnly && due && due > r.simulationDate && trusted.status === 'FUTURE';
    let status: CountryPathway['status'] = failed.length
      ? 'NOT_MET'
      : unknown
        ? 'UNKNOWN'
        : 'MET';
    if (project && future) {
      // A current nomination or test may expire before the projected residence date.
      // Recheck that one date; it is an eligibility date only if all requirements pass.
      const then = unknown
        ? 'UNKNOWN'
        : assess({ ...r, pathway: id, simulationDate: due }, false).columns[0]
            .pathways[0].status;
      status = then === 'MET' ? 'FUTURE' : then;
    }
    const generalResidence =
      id === 'AU-CITIZENSHIP' &&
      r.dateOfBirth !== undefined &&
      fullYears(r.dateOfBirth, r.simulationDate) >=
        policy.values.citizenshipMinAge.value &&
      r.citizenship?.otherResidenceBasis !== 'confirmed';
    const showPilotNotes =
      trusted &&
      trusted.checks.length > 0 &&
      (id !== 'AU-CITIZENSHIP' || generalResidence);
    const pendingDetails = [
      ...new Set([
        ...checks.flatMap((c) => c.pendingDetails ?? []),
        ...(trusted &&
        trusted.checks.length &&
        (id === 'AU-186-TRT' || generalResidence)
          ? (trusted.pendingDetails ?? [])
          : []),
      ]),
    ];
    const assumptions = auNotes(id, r);
    if (
      id === 'AU-RRV' &&
      due &&
      due > r.simulationDate &&
      trusted?.status === 'FUTURE'
    )
      assumptions.push(
        L(
          `155 居住天数途径预计于 ${due} 满期；实质联系、家庭或 157 路径另行判断。`,
          `The 155 presence requirement is projected for ${due}. Ties, family and 157 grounds are assessed separately.`,
        ),
      );
    if (showPilotNotes && !isHk(id)) assumptions.push(...trusted.assumptions);
    if (due && due > r.simulationDate && timeOnly)
      assumptions.push(
        L(
          `按现有记录，时间条件的预计满期日为 ${due}。其余条件须另行满足。`,
          `The projected time milestone is ${due} on the supplied history. The remaining conditions must also be met.`,
        ),
      );
    if (generalResidence && trusted?.pendingDetails?.includes('PD-084'))
      assumptions.push(trusted.summary);
    return {
      id,
      title: L(titles[id][0], titles[id][1]),
      status,
      checks,
      assumptions,
      ...(status === 'MET'
        ? { earliestDate: r.simulationDate }
        : status === 'FUTURE'
          ? { earliestDate: due }
          : {}),
      ...(pendingDetails.length ? { pendingDetails } : {}),
    };
  });
  return {
    policyAsOf: policy.asOf,
    columns: [
      {
        id: policy.ruleSetId,
        title: L('现行澳大利亚法律', 'Current Australian law'),
        pathways,
      },
    ],
  };
}
