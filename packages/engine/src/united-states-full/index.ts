import {
  unitedStates2026_11,
  unitedStatesFull2026_11,
} from '@uk-immigration/policy-data';
import type { CountryCheck, CountryResult } from '../country-result';
import type { PilotStatus } from '../pilot';
import { textFor } from '../rule';
import { evaluateUnitedStates } from '../united-states';
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
import type { UsFullPathwayId, UsFullRequest } from './types';

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
): CountryCheck[] {
  const check = checksFor(req);
  if (req.pathway === 'US-CONDITIONS') {
    if (req.conditional === 'none') return [];
    const filing = legacy?.checks[0];
    return [
      check(
        'TIME-CONDITIONS-FILING',
        '取消条件递交时间',
        'Removal of conditions filing period',
        filing?.met,
        filing?.sources ?? time.conditionsWindowDays.sources,
        'PD-094',
        filing ? [filing.text, filing.text] : undefined,
      ),
    ];
  }
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

function conditionsTiming(
  req: UsFullRequest,
  legacy: UsPathway | undefined,
): PilotStatus {
  const marriage = req.conditions?.marriage;
  const lpr = req.permanentResident;
  if (req.conditional === 'none') return 'NOT_APPLICABLE';
  if (
    req.conditional === 'marriage' &&
    marriage?.filing &&
    marriage.filing !== 'joint' &&
    lpr
  ) {
    return req.simulationDate >= lpr ? 'MET' : 'FUTURE';
  }
  if (
    req.conditional === 'marriage' &&
    legacy?.status === 'UNKNOWN' &&
    legacy.checks.length &&
    req.fees?.channel
  ) {
    if (req.fees.channel === 'paper') return 'MET';
    return marriage?.lateFilingExcuse === 'cleared'
      ? 'MET'
      : marriage?.lateFilingExcuse === 'pending'
        ? 'UNKNOWN'
        : 'NOT_MET';
  }
  if (legacy?.status === 'NOT_MET') {
    const excuse =
      req.conditional === 'investor'
        ? req.conditions?.investor?.lateFilingExcuse
        : marriage?.lateFilingExcuse;
    const determination = reviewed(excuse);
    if (determination === true) return 'MET';
    if (excuse === 'pending' || excuse === undefined) return 'UNKNOWN';
  }
  return legacy?.status ?? 'UNKNOWN';
}

export function evaluateUnitedStatesFull(
  request: UsFullRequest,
): CountryResult {
  const L = textFor(request);
  const check = checksFor(request);
  const legacy = legacyPathway(request);
  const timingChecks = timeChecks(request, legacy);
  let timing: PilotStatus = 'MET';
  let requirements: CountryCheck[];
  switch (request.pathway) {
    case 'US-NATURALIZATION':
    case 'US-SPOUSE':
      timing =
        legacy?.status === 'NOT_APPLICABLE'
          ? 'UNKNOWN'
          : (legacy?.status ?? 'UNKNOWN');
      requirements = naturalizationChecks(request);
      break;
    case 'US-CONDITIONS':
      timing = conditionsTiming(request, legacy);
      requirements =
        timing === 'NOT_APPLICABLE' ? [] : conditionChecks(request);
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
      if (
        request.conditional &&
        timing !== 'NOT_APPLICABLE' &&
        (timing !== legacy?.status ||
          request.conditions?.marriage?.filing !== 'joint')
      ) {
        requirements.push(
          check(
            'CONDITIONS-SPECIAL-TIMING',
            '单独、豁免或获准逾期递交',
            'Separate, waiver or excused late filing',
            timing === 'MET'
              ? true
              : timing === 'NOT_MET' || timing === 'FUTURE'
                ? false
                : undefined,
            request.conditional === 'investor' ? s.i829 : s.marriageWaiver,
            'PD-094',
          ),
        );
      }
      break;
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
        ...adjustmentChecks(request),
      ];
      break;
    case 'US-EMPLOYMENT':
      requirements = [
        ...employmentChecks(request),
        ...supportChecks(request),
        ...adjustmentChecks(request),
      ];
      break;
    case 'US-ADJUSTMENT':
      requirements = [...adjustmentChecks(request), ...supportChecks(request)];
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
  // Timing alternatives (e.g. an I-751 waiver or a reentry permit) can bypass
  // a failed pilot check. Information-only fees do not gate eligibility.
  const status: PilotStatus =
    timing === 'NOT_APPLICABLE'
      ? timing
      : timing === 'NOT_MET' ||
          requirements.some(
            (c) =>
              c.status === 'NOT_MET' &&
              !(
                timing === 'FUTURE' &&
                ((c.id === 'US-C01-AGE' && legacy) ||
                  c.id === 'US-CONDITIONS-SPECIAL-TIMING')
              ),
          )
        ? 'NOT_MET'
        : timing === 'UNKNOWN' ||
            requirements.some((c) => c.status === 'UNKNOWN')
          ? 'UNKNOWN'
          : timing;
  const notes = status === 'NOT_APPLICABLE' ? [] : feeChecks(request);
  const checks = [...timingChecks, ...requirements, ...notes];
  const pendingDetails = [
    ...new Set([
      ...(legacy?.pendingDetails ?? []),
      ...checks.flatMap((item) => item.pendingDetails ?? []),
    ]),
  ];
  const earliestDate =
    status === 'MET'
      ? request.simulationDate
      : status === 'FUTURE'
        ? (legacy?.earliestDate ?? request.permanentResident)
        : undefined;
  const summary = {
    MET: L(
      '所填资料满足本路径已评估条件。',
      'The information entered meets the assessed requirements for this pathway.',
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
      '按已确认的非时间条件，本路径仍需等待满期。',
      'With the confirmed non-timing requirements, this pathway still has a waiting period.',
    ),
    NOT_APPLICABLE: L(
      '该类绿卡无需取消条件。',
      'This type of green card does not require removal of conditions.',
    ),
  };
  const timingNotes =
    legacy?.status !== 'NOT_APPLICABLE' && legacy?.summary
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
            ...(earliestDate ? { earliestDate } : {}),
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
