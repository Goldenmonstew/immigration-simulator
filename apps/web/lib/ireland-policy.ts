import {
  IRELAND_CONDITION_IDS,
  IRELAND_FULL_PATHWAY_TITLES,
  irelandCondition,
  type RuleMeta,
  type RuleSetId,
} from '@uk-immigration/engine';
import {
  ireland2026_11,
  irelandFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import {
  withPolicySources,
  type CountryPolicy,
  type PolicyRuleSet,
} from './policy';

const ruleSetId: RuleSetId = 'ie.current-law-2026-11';
const time = ireland2026_11.values;
const full = irelandFull2026_11;

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const set: PolicyRuleSet = {
  id: ruleSetId,
  title: title('ie.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-091', locator: 'ss14–18, 15A–16A' },
    { srcId: 'SRC-383', locator: 'Immigration Act 2004 ss4–5, 9, 19' },
    { srcId: 'SRC-390', locator: 'S.I. 548/2015' },
    { srcId: 'SRC-392', locator: 'S.I. 728/2020' },
  ],
};

// Pending details each condition can show in results (task 89 report,
// docs/pending-details.md and the engine's checks; a test keeps them in step).
const pendingByDetail: Record<string, string[]> = {
  'PD-110': ['A04'],
  'PD-111': ['A04'],
  'PD-112': ['A04'],
  'PD-113': ['A04'],
  'PD-114': ['A04'],
  'PD-117': ['B27'],
  'PD-118': ['B12'],
  'PD-320': ['A01'],
  'PD-321': [
    'A04',
    'B01',
    'B24',
    'B28',
    'C04',
    'IRP-CHECKLIST',
    'IRP-RENEWAL-WINDOW',
  ],
  'PD-322': ['A07', 'A08'],
  'PD-323': ['A04', 'A10', 'A20', 'B02'],
  'PD-324': ['A03', 'A06', 'A16'],
  'PD-325': ['A04', 'A19', 'A21'],
  'PD-326': ['B03', 'B04', 'B06'],
  'PD-327': ['B05'],
  'PD-328': ['B07', 'B08', 'B09'],
  'PD-329': [
    'B11',
    'B12',
    'B13',
    'B14',
    'B17',
    'B18',
    'B21',
    'FAMILY-INDEPENDENCE',
    'FAMILY-RENEWAL',
  ],
  'PD-330': [
    'B14',
    'B15',
    'B16',
    'B17',
    'B20',
    'B21',
    'B22',
    'B23',
    'FAMILY-FIRST-REGISTRATION',
  ],
  'PD-331': ['B16', 'B17', 'B18', 'B22'],
  'PD-332': ['B19'],
  'PD-333': ['B26', 'B28', 'C05'],
  'PD-334': ['B27', 'B28', 'C08'],
  'PD-335': ['C01', 'C02', 'C04', 'C07', 'C08', 'C09'],
  'PD-336': ['D01', 'D02', 'D04', 'D05'],
  'PD-337': ['D02', 'D03', 'D08', 'E02'],
  'PD-338': ['D04', 'D05', 'D06', 'D08', 'E01', 'E02', 'E03'],
  'PD-339': ['A09', 'A10', 'B02', 'B10', 'FAMILY-ENTRY-FEE', 'D08', 'E03'],
};
const pending = (id: string) =>
  Object.entries(pendingByDetail)
    .filter(([, ids]) => ids.includes(id))
    .map(([detail]) => detail);

// Time checks come from the residence clocks shared with the earlier pilot.
const timeRules: [string, TranslationKey, readonly SourceRef[], string[]][] = [
  [
    'NAT-CONTINUOUS',
    'ie.policy.rule.natContinuous',
    [
      ...time.continuousYears.sources,
      { srcId: 'SRC-091', locator: 's16A(1) (p26)' },
      { srcId: 'SRC-093', locator: 's295(b) (s16A(1)(d))' },
      {
        srcId: 'SRC-095',
        locator:
          'Guide: Time That Does Not Count; Permissions that do not count',
      },
    ],
    ['PD-114', 'PD-115', 'PD-321', 'PD-323'],
  ],
  [
    'NAT-ABSENCES',
    'ie.policy.rule.natAbsences',
    [...time.absenceDays.sources, ...time.exceptionalDays.sources],
    ['PD-111', 'PD-115'],
  ],
  [
    'NAT-PRIOR',
    'ie.policy.rule.natPrior',
    [...time.priorWindowYears.sources, ...time.priorResidenceDays.sources],
    ['PD-112', 'PD-113', 'PD-114', 'PD-115', 'PD-323'],
  ],
  [
    'SPOUSE-MARRIAGE',
    'ie.policy.rule.spouseMarriage',
    time.marriageYears.sources,
    ['PD-115'],
  ],
  [
    'STAMP4-WORK-TIME',
    'ie.policy.rule.stamp4WorkTime',
    [
      ...time.stamp4Months.sources,
      {
        srcId: 'SRC-094',
        locator: 's18(h) (p10); Schedule Part 1 "month" (p14)',
      },
      ...time.gepRuleFrom.sources,
      ...time.ictRuleFrom.sources,
    ],
    ['PD-116', 'PD-326'],
  ],
  [
    'FAMILY-LEGACY-TIME',
    'ie.policy.rule.familyLegacyTime',
    time.spouse1gYears.sources,
    ['PD-118', 'PD-329'],
  ],
  [
    'WCATT-TIME',
    'ie.policy.rule.wcattTime',
    [
      ...time.wcattMonths.sources,
      ...time.wcattAbsenceMonths.sources,
      {
        srcId: 'SRC-097',
        locator: 'Application form p1',
        url: 'https://www.irishimmigration.ie/wp-content/uploads/2026/02/Without-Conditions-as-to-Time-Stamp-5-editable-23-02-2026.pdf',
      },
    ],
    ['PD-114', 'PD-118', 'PD-321'],
  ],
];

/** Short titles for the time checks, whose engine title is a full sentence. */
export const irelandTimeRuleTitles: Record<string, TranslationKey> =
  Object.fromEntries(timeRules.map(([id, key]) => [`IE-${id}`, key]));

export const irelandRules: RuleMeta[] = [
  ...timeRules.map(([id, key, sources, pendingDetails]) => ({
    id: `IE-${id}`,
    ruleSetId,
    title: t(key),
    titleEn: t(key, 'en'),
    sources: [...sources],
    pendingDetails,
  })),
  ...IRELAND_CONDITION_IDS.map((id) => {
    const condition = irelandCondition(id);
    return {
      id: condition.id,
      ruleSetId,
      title: condition.zh,
      titleEn: condition.en,
      sources: condition.sources,
      pendingDetails: pending(id),
    };
  }),
];

// Nested parameter groups are listed by their dotted path.
const parameters: CountryPolicy['parameters'][string]['values'] = { ...time };
for (const [name, entry] of Object.entries(full)) {
  if (typeof entry !== 'object') continue;
  if ('value' in entry && 'sources' in entry) parameters[name] = entry;
  else
    for (const [child, value] of Object.entries(entry))
      parameters[`${name}.${child}`] = value;
}

function change(
  date: string,
  key: 'family2026' | 'family2025' | 'registrationFee' | 'minor',
  sources: readonly SourceRef[],
) {
  return {
    date,
    title: t(`ie.policy.change.${key}`),
    titleEn: t(`ie.policy.change.${key}`, 'en'),
    summary: t(`ie.policy.change.${key}Summary`),
    summaryEn: t(`ie.policy.change.${key}Summary`, 'en'),
    sources: [...sources],
  };
}

export const irelandPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: Object.entries(IRELAND_FULL_PATHWAY_TITLES).map(
    ([id, [zh, en]]) => ({ id, title: { 'zh-CN': zh, en } }),
  ),
  parameters: {
    [ruleSetId]: {
      asOf: full.asOf,
      ruleSetId,
      values: parameters,
    },
  },
  rules: { [ruleSetId]: irelandRules },
  changelog: [
    change(full.family.versions.value.currentFrom, 'family2026', [
      ...full.family.versions.sources,
      ...full.family.income.sources,
    ]),
    change(full.family.versions.value.revisedFrom, 'family2025', [
      ...full.family.versions.sources,
      ...full.family.income.sources,
    ]),
    change(
      full.registration.value.feeFrom,
      'registrationFee',
      full.registration.sources,
    ),
    change(
      full.naturalisation.minor.value.from,
      'minor',
      full.naturalisation.minor.sources,
    ),
  ],
});
