import {
  unitedStates2026_11,
  unitedStatesFull2026_11,
} from '@uk-immigration/policy-data';
import { addDays } from '../dates';
import { afterYears } from '../pilot';
import type { PilotStatus } from '../pilot';
import { textFor } from '../rule';
import type { IsoDate } from '../types';
import { evaluateUnitedStates, nextUsBusinessDay } from '../united-states';
import type { UsPathway } from '../united-states';
import {
  admissionChecks,
  adjustmentChecks,
  humanitarianChecks,
} from './admission';
import { checksFor, reviewed, s } from './check';
import { feeChecks } from './fees';
import { familyChecks, employmentChecks, supportChecks } from './immigration';
import { conditionChecks, travelChecks } from './maintenance';
import { militaryChecks, naturalizationChecks } from './naturalization';
import type {
  UsFullCheck,
  UsFullPathway,
  UsFullPathwayId,
  UsFullRequest,
  UsFullResult,
} from './types';

export type * from './types';

const titles: Record<UsFullPathwayId, [string, string]> = {
  'US-NATURALIZATION': ['一般入籍', 'General naturalization'],
  'US-SPOUSE': [
    '美国公民配偶入籍',
    'Naturalization as a U.S. citizen’s spouse',
  ],
  'US-CONDITIONS': ['取消条件绿卡条件', 'Removal of conditions on residence'],
  'US-TRAVEL': [
    '永久居民身份维持与返美',
    'Retention of permanent residence and return travel',
  ],
  'US-FAMILY': ['亲属移民绿卡', 'Family-based immigration'],
  'US-EMPLOYMENT': [
    '职业、投资与 Gold Card 移民',
    'Employment, investor and Gold Card immigration',
  ],
  'US-ADJUSTMENT': [
    '调整身份或领馆移民签证',
    'Adjustment of status or consular immigrant visa',
  ],
  'US-HUMANITARIAN': [
    '难民与受庇护者转永居',
    'Refugee and asylee adjustment of status',
  ],
  'US-MILITARY': ['军人入籍', 'Military naturalization'],
};

const time = unitedStates2026_11.values;
const naturalizationTime = [
  [
    'TIME-LPR',
    '永久居民年限',
    'Minimum permanent residence',
    time.naturalizationYears.sources,
    'PD-092',
  ],
  [
    'TIME-CONTINUOUS-RESIDENCE',
    '递交前连续居住',
    'Continuous residence before filing',
    time.presumptionDays.sources,
    'PD-093',
  ],
  [
    'TIME-PHYSICAL-PRESENCE',
    '递交前实际在美天数',
    'Physical presence before filing',
    time.physicalPresenceDays.sources,
    'PD-092',
  ],
  [
    'C01-AGE',
    '入籍最低年龄',
    'Minimum age for naturalization',
    s.age,
    'PD-274',
  ],
  [
    'C14-DISTRICT',
    '州或 USCIS 辖区居住',
    'Residence in the state or USCIS district',
    s.district,
    'PD-096',
  ],
  [
    'TIME-MARRIAGE',
    '婚姻年限',
    'Length of marriage',
    time.spouseYears.sources,
    'PD-274',
  ],
  [
    'TIME-SPOUSE-CITIZENSHIP',
    '配偶美国公民身份年限',
    'Years of spouse’s U.S. citizenship',
    time.spouseYears.sources,
    'PD-274',
  ],
] as const;

function legacyPathway(req: UsFullRequest) {
  if (
    req.pathway !== 'US-NATURALIZATION' &&
    req.pathway !== 'US-SPOUSE' &&
    req.pathway !== 'US-CONDITIONS' &&
    req.pathway !== 'US-TRAVEL'
  )
    return undefined;
  const { permanentResident, dateOfBirth, conditional, trips } = req;
  if (!permanentResident) return undefined;
  const naturalization =
    req.pathway === 'US-NATURALIZATION' || req.pathway === 'US-SPOUSE';
  if (naturalization && (!dateOfBirth || !trips)) return undefined;
  if (
    (req.pathway === 'US-TRAVEL' && !trips) ||
    (req.pathway === 'US-CONDITIONS' && !conditional)
  )
    return undefined;
  // The pilot takes a common request. Select only the calculation that uses the supplied inputs.
  return evaluateUnitedStates({
    ...req,
    permanentResident,
    dateOfBirth: dateOfBirth ?? req.simulationDate,
    conditional: conditional ?? 'none',
    trips: trips ?? [],
  }).pathways.find((path) => path.id === req.pathway);
}

function timeChecks(
  req: UsFullRequest,
  legacy: UsPathway | undefined,
): UsFullCheck[] {
  const check = checksFor(req);
  if (req.pathway === 'US-TRAVEL') {
    const trip = legacy?.checks[0];
    return [
      check(
        'TIME-TRAVEL',
        '绿卡作为返美证件的离境时限',
        'Absence limit for relying on the green card alone',
        trip?.met,
        trip?.sources ?? s.return,
        'PD-095',
        trip ? [trip.text, trip.text] : undefined,
      ),
    ];
  }
  const spouse = req.pathway === 'US-SPOUSE';
  if (req.pathway !== 'US-NATURALIZATION' && !spouse) return [];
  return naturalizationTime.flatMap(([id, zh, en, sources, pd], index) => {
    // Age is calculated in the full assessment, including the military exception.
    if (id === 'C01-AGE' || (!spouse && index >= 5)) return [];
    const prior = legacy?.checks[index];
    const missingCitizenshipDate =
      id === 'TIME-SPOUSE-CITIZENSHIP'
        ? req.naturalization?.spouse?.spouseCitizenRequiredPeriod
        : undefined;
    const routeSources =
      spouse && id === 'TIME-LPR'
        ? time.spouseYears.sources
        : spouse && id === 'TIME-PHYSICAL-PRESENCE'
          ? time.spousePresenceDays.sources
          : sources;
    return [
      check(
        id,
        zh,
        en,
        prior?.met ?? missingCitizenshipDate,
        prior?.sources ?? routeSources,
        pd,
        prior ? [prior.text, prior.text] : undefined,
      ),
    ];
  });
}

type FilingTiming = Pick<UsFullPathway, 'status' | 'earliestDate'>;
type ConditionsTiming = FilingTiming & { special?: boolean };

function conditionsTiming(
  req: UsFullRequest,
  legacy: UsPathway | undefined,
): ConditionsTiming {
  const marriage = req.conditions?.marriage;
  const lpr = req.permanentResident;
  if (req.conditional === 'none') return { status: 'NOT_APPLICABLE' };
  if (!lpr || !req.conditional || !legacy?.checks.length)
    return { status: 'UNKNOWN' };

  const investor = req.conditional === 'investor';
  const single =
    !investor &&
    ((marriage?.filing && marriage.filing !== 'joint') ||
      req.separatePetition ||
      (req.principalConditional &&
        lpr >
          addDays(req.principalConditional, time.childConcurrentDays.value)));
  const anniversary = afterYears(
    req.principalConditional ?? lpr,
    time.conditionalYears.value,
  );
  const opens = single
    ? lpr
    : addDays(anniversary, -time.conditionsWindowDays.value);
  const closes = addDays(anniversary, -1);
  const excuse = reviewed(
    investor
      ? req.conditions?.investor?.lateFilingExcuse
      : marriage?.lateFilingExcuse,
  );
  const candidate = req.simulationDate < opens ? opens : req.simulationDate;
  const onChannel = (paper: boolean): ConditionsTiming => {
    const receipt = paper ? nextUsBusinessDay(candidate) : candidate;
    const deadline = paper ? nextUsBusinessDay(closes) : closes;
    const late = !single && receipt > deadline;
    if (late && excuse !== true)
      return {
        status: excuse === false ? 'NOT_MET' : 'UNKNOWN',
        special: true,
      };
    return {
      status: receipt === req.simulationDate ? 'MET' : 'FUTURE',
      earliestDate: receipt,
      special: !!single || late,
    };
  };
  if (investor || req.fees?.channel === 'paper') return onChannel(true);
  const online = onChannel(false);
  if (req.fees?.channel === 'online') return online;
  const paper = onChannel(true);
  return paper.status === online.status &&
    paper.earliestDate === online.earliestDate
    ? online
    : { status: 'UNKNOWN', special: online.special || paper.special };
}

function defaultsToPaper(request: UsFullRequest): boolean {
  if (request.fees?.channel) return false;
  if (request.pathway === 'US-HUMANITARIAN') return true;
  if (
    request.pathway === 'US-NATURALIZATION' ||
    request.pathway === 'US-SPOUSE'
  ) {
    return (
      request.fees?.relief === 'waiver' || request.fees?.relief === 'reduced'
    );
  }
  return (
    request.admission?.process === 'adjustment' &&
    (request.pathway === 'US-FAMILY' ||
      request.pathway === 'US-EMPLOYMENT' ||
      request.pathway === 'US-ADJUSTMENT') &&
    (request.fees?.onlineCategoryAvailable === 'barred' ||
      request.admission.adjustmentBasis === 'sij' ||
      (request.pathway === 'US-EMPLOYMENT' &&
        request.employment?.category === 'eb5'))
  );
}

export function evaluateUnitedStatesFull(request: UsFullRequest): UsFullResult {
  const L = textFor(request);
  const check = checksFor(request);
  const legacy = legacyPathway(request);
  const timingChecks = timeChecks(request, legacy);
  const date = request.simulationDate;
  const paperDefault = defaultsToPaper(request);
  const paper =
    (request.fees?.channel === 'paper' || paperDefault) &&
    request.pathway !== 'US-TRAVEL' &&
    request.pathway !== 'US-CONDITIONS' &&
    !(
      request.pathway === 'US-ADJUSTMENT' &&
      request.admission?.process === 'consular'
    );
  const receiptOn = (candidate: IsoDate) =>
    paper ? nextUsBusinessDay(candidate) : candidate;
  let eligibility: FilingTiming = { status: 'MET' };
  let requirements: UsFullCheck[];
  switch (request.pathway) {
    case 'US-NATURALIZATION':
    case 'US-SPOUSE': {
      eligibility = {
        status:
          legacy?.status === 'NOT_APPLICABLE'
            ? 'UNKNOWN'
            : (legacy?.status ?? 'UNKNOWN'),
        earliestDate: legacy?.earliestDate,
      };
      requirements = naturalizationChecks(request);
      if (request.permanentResident) {
        const years =
          request.pathway === 'US-SPOUSE'
            ? time.spouseYears
            : time.naturalizationYears;
        const anniversary = afterYears(request.permanentResident, years.value);
        requirements.push({
          ...check(
            'TIME-LPR-APPROVAL',
            '入籍核准所需完整居住年限',
            'Full residence period required for naturalization approval',
            date >= anniversary,
            [...years.sources, ...time.earlyFilingDays.sources],
            undefined,
            [
              `完整法定居住年限的周年日为 ${anniversary}。`,
              `The full statutory residence period reaches its anniversary on ${anniversary}.`,
            ],
            'NOT_APPLICABLE',
          ),
          ...(date < anniversary
            ? { approvalRequirementDate: anniversary }
            : {}),
        });
      }
      break;
    }
    case 'US-CONDITIONS': {
      const conditionFiling = conditionsTiming(request, legacy);
      eligibility = conditionFiling;
      requirements =
        eligibility.status === 'NOT_APPLICABLE' ? [] : conditionChecks(request);
      const filingAnswer =
        eligibility.status === 'UNKNOWN'
          ? undefined
          : eligibility.status === 'MET';
      const filingDetail: [string, string] | undefined =
        eligibility.earliestDate
          ? [
              `按所选渠道，最早收件日为 ${eligibility.earliestDate}。`,
              `Earliest receipt through the selected channel: ${eligibility.earliestDate}.`,
            ]
          : undefined;
      if (eligibility.status !== 'NOT_APPLICABLE') {
        timingChecks.push(
          check(
            'TIME-CONDITIONS-FILING',
            '取消条件递交时间',
            'Removal of conditions filing period',
            filingAnswer,
            legacy?.checks[0]?.sources ?? [
              ...time.conditionsWindowDays.sources,
              ...s.paperReceipt,
            ],
            ['PD-094', 'PD-274'],
            filingDetail,
          ),
        );
      }
      if (request.conditional === undefined) {
        requirements = [
          check(
            'CONDITIONS-TYPE',
            '条件绿卡类型',
            'Type of conditional residence',
            undefined,
            [...s.marriage, ...s.i829],
            'PD-274',
          ),
        ];
      }
      if (conditionFiling.special) {
        timingChecks.push(
          check(
            'CONDITIONS-SPECIAL-TIMING',
            '单独、豁免或获准逾期递交',
            'Separate, waiver or excused late filing',
            filingAnswer,
            request.conditional === 'investor' ? s.i829 : s.marriageWaiver,
            ['PD-094', 'PD-274'],
            filingDetail,
          ),
        );
      }
      break;
    }
    case 'US-TRAVEL': {
      const travel = travelChecks(request);
      requirements = [
        ...travel.checks,
        ...(travel.seekingAdmission === true
          ? admissionChecks(
              {
                ...request,
                simulationDate: travel.returnedOn ?? request.simulationDate,
              },
              request.travel?.admission ?? {},
              'return',
            )
          : []),
      ];
      break;
    }
    case 'US-FAMILY':
      requirements = [
        ...familyChecks(request),
        ...supportChecks(request),
        ...adjustmentChecks(request, receiptOn(date)),
      ];
      break;
    case 'US-EMPLOYMENT':
      requirements = [
        ...employmentChecks(request),
        ...supportChecks(request),
        ...adjustmentChecks(request, receiptOn(date)),
      ];
      break;
    case 'US-ADJUSTMENT':
      requirements = [
        ...adjustmentChecks(request, receiptOn(date)),
        ...supportChecks(request),
      ];
      break;
    case 'US-HUMANITARIAN':
      requirements = humanitarianChecks(request);
      break;
    case 'US-MILITARY':
      requirements = [
        ...militaryChecks(request),
        ...naturalizationChecks(request),
      ];
      break;
  }
  const { status: timing } = eligibility;
  const candidate = eligibility.earliestDate ?? date;
  const receipt = receiptOn(candidate);
  if (receipt !== candidate) {
    timingChecks.push(
      check(
        'TIME-PAPER-RECEIPT',
        'USCIS 纸质收件日',
        'USCIS paper receipt date',
        false,
        paperDefault ? [...s.paperReceipt, ...s.onlineFiling] : s.paperReceipt,
        undefined,
        [
          `纸质件最早可在 ${receipt} 收件。`,
          `The earliest paper receipt date is ${receipt}.`,
        ],
      ),
    );
  }
  const approvalDate = requirements.reduce(
    (earliest, item) =>
      item.approvalRequirementDate && item.approvalRequirementDate > earliest
        ? item.approvalRequirementDate
        : earliest,
    receipt,
  );
  const combine = (filing: boolean): PilotStatus => {
    if (timing === 'NOT_APPLICABLE') return timing;
    const statuses = requirements.flatMap((item) =>
      item.informational ||
      (!filing && item.approvalRequirementDate) ||
      (timing === 'FUTURE' && legacy && item.id === 'US-C01-AGE')
        ? []
        : [filing ? (item.filingStatus ?? item.status) : item.status],
    );
    if (timing === 'NOT_MET' || statuses.includes('NOT_MET')) return 'NOT_MET';
    if (timing === 'UNKNOWN' || statuses.includes('UNKNOWN')) return 'UNKNOWN';
    return (filing ? receipt : approvalDate) > date ? 'FUTURE' : 'MET';
  };
  const status = combine(true);
  const approvalStatus =
    request.pathway === 'US-TRAVEL' ? undefined : combine(false);
  const notes = status === 'NOT_APPLICABLE' ? [] : feeChecks(request);
  const checks = [...timingChecks, ...requirements, ...notes];
  const pendingDetails = [
    ...new Set([
      ...(legacy?.pendingDetails ?? []),
      ...checks.flatMap((item) => item.pendingDetails ?? []),
    ]),
  ];
  const earliestDate =
    status === 'MET' || status === 'FUTURE' ? receipt : undefined;
  const approvalEarliestDate =
    approvalStatus === 'MET' || approvalStatus === 'FUTURE'
      ? approvalDate
      : undefined;
  const summary = {
    MET: L(
      request.pathway === 'US-TRAVEL'
        ? '所填资料满足已评估的返美条件。'
        : '所填资料满足已评估的递交条件。',
      request.pathway === 'US-TRAVEL'
        ? 'The information entered meets the assessed requirements for return.'
        : 'The information entered meets the assessed filing requirements.',
    ),
    NOT_MET: L(
      '至少一项适用条件未满足。',
      'At least one applicable requirement is unmet.',
    ),
    UNKNOWN: L(
      '补齐缺失资料或取得个案结论后，再确认本路径条件。',
      'Complete the missing information or obtain the individual findings before confirming this pathway.',
    ),
    FUTURE: L(
      '已评估的递交条件须等到最早递交日。',
      'The assessed filing requirements can be met on the earliest filing date shown.',
    ),
    NOT_APPLICABLE: L(
      '该类绿卡无需取消条件。',
      'This type of green card does not require removal of conditions.',
    ),
  };
  const timingNotes =
    request.pathway !== 'US-CONDITIONS' &&
    legacy?.status !== 'NOT_APPLICABLE' &&
    legacy?.summary
      ? [
          L(
            `仅时间评估：${legacy.summary}`,
            `Timing assessment: ${legacy.summary}`,
          ),
        ]
      : [];
  return {
    policyAsOf: unitedStatesFull2026_11.asOf,
    columns: [
      {
        id: 'us.current-law-2026-11',
        title: L('美国现行规则', 'Current U.S. rules'),
        pathways: [
          {
            id: request.pathway,
            title: L(...titles[request.pathway]),
            status,
            ...(approvalStatus ? { approvalStatus } : {}),
            ...(earliestDate ? { earliestDate } : {}),
            ...(approvalEarliestDate ? { approvalEarliestDate } : {}),
            summary: summary[status],
            checks,
            assumptions: [...(legacy?.assumptions ?? []), ...timingNotes],
            pendingDetails,
          },
        ],
      },
    ],
  };
}
