import {
  evaluateGreeceFull,
  type GrFullRequest,
  type RuleMeta,
} from '@uk-immigration/engine';
import { greeceFull2026_11, type SourceRef } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { GR_PATHWAYS } from './greece-draft';
import { withPolicySources, type PolicyRuleSet } from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const full = greeceFull2026_11;
const v = full.values;
const day = full.asOf;

// Each route and stage is probed without a permit history, which reaches every
// eligibility check quickly. The catalogue then uses the engine's own titles and sources.
const probes: GrFullRequest[] = [
  { simulationDate: day },
  { simulationDate: '2024-01-01', pathways: ['GR-WORK'] },
  ...(['initial', 'renewal', 'reacquisition'] as const).map((stage) => ({
    simulationDate: day,
    pathways: ['GR-LONG-TERM' as const],
    longTerm: { stage },
    integration: { basis: 'a2' as const },
  })),
  ...(['initial', 'renewal'] as const).flatMap((stage) =>
    (['residence', 'birth-school', 'unaccompanied-minor'] as const).map(
      (basis) => ({
        simulationDate: day,
        pathways: ['GR-TEN-YEAR' as const],
        tenYear: { stage, basis },
        integration: { basis: 'a2' as const },
      }),
    ),
  ),
  ...(['application', 'oath'] as const).map((stage) => ({
    simulationDate: day,
    pathways: ['GR-NATIONALITY' as const],
    route: 'general' as const,
    nationality: { stage, bornAndContinuouslyResident: true },
  })),
  ...(['initial', 'renewal'] as const).map((stage) => ({
    simulationDate: day,
    pathways: ['GR-GOLDEN-VISA' as const],
    goldenVisa: { stage, family: [{ kind: 'spouse' as const }] },
  })),
  ...(['initial', 'renewal', 'permanent', 'retained', 'maintain'] as const).map(
    (stage) => ({
      simulationDate: day,
      pathways: ['GR-GREEK-FAMILY-PR' as const],
      greekFamily: { stage, retention: {} },
    }),
  ),
  ...(
    [
      'initial',
      'renewal',
      'permanent',
      'permanent-renewal',
      'retained',
      'maintain',
    ] as const
  ).map((stage) => ({
    simulationDate: day,
    pathways: ['GR-EU-FAMILY-PR' as const],
    euFamily: {
      stage,
      retention: {},
      early: { basis: 'retirement' as const },
      schooling: {},
      primaryCare: {},
      partnerRenewal: {},
    },
  })),
  ...(['E1', 'E4'] as const).flatMap((permit) =>
    (['initial', 'renewal'] as const).map((stage) => ({
      simulationDate: day,
      pathways: ['GR-WORK' as const],
      entry: 'outside' as const,
      work: {
        permit,
        stage,
        admission: 'ordinary' as const,
        blueRenewalInterruption: 'unemployment' as const,
      },
    })),
  ),
  ...(['initial', 'renewal', 'autonomous'] as const).map((stage) => ({
    simulationDate: day,
    pathways: ['GR-FAMILY-TCN' as const],
    familyTcn: { stage, sponsor: 'ordinary' as const },
  })),
];

// The time checks are only produced with a permit history, and their titles carry dates.
const timeChecks: [string, TranslationKey, readonly SourceRef[]][] = [
  ['LT-TIME-RESIDENCE', 'gr.policy.rule.ltResidence', v.longTermYears.sources],
  [
    'LT-TIME-SINGLE-ABSENCE',
    'gr.policy.rule.ltSingleAbsence',
    v.singleAbsenceMonths.sources,
  ],
  [
    'LT-TIME-TOTAL-ABSENCE',
    'gr.policy.rule.ltTotalAbsence',
    v.totalAbsenceMonths.sources,
  ],
  [
    'NAT-TIME-RESIDENCE',
    'gr.policy.rule.natResidence',
    v.nationalityYears.sources,
  ],
  [
    'GV-TIME-RENEWAL',
    'gr.policy.rule.gvRenewal',
    [...v.goldenVisaYears.sources, ...v.renewalWindowMonths.sources],
  ],
  [
    'GV-TIME-LATE',
    'gr.policy.rule.gvLate',
    [...v.lateRenewalMonths.sources, ...v.lateFinePerMonthEur.sources],
  ],
];

// Pending details the engine attaches only in specific branches (docs/pending-details.md).
const pendingDetails: Record<string, string[]> = {
  'C-01': ['PD-300'],
  'C-02': ['PD-319'],
  'C-03': ['PD-301'],
  'C-04': ['PD-302'],
  'GR-LAW-DATE': ['PD-300'],
  'GR-LONG-TERM-TIME': ['PD-101', 'PD-102', 'PD-305'],
  'GR-NATIONALITY-TIME': ['PD-106', 'PD-109'],
  'LT-TIME-RESIDENCE': ['PD-101', 'PD-305'],
  'LT-TIME-SINGLE-ABSENCE': ['PD-102', 'PD-305'],
  'LT-TIME-TOTAL-ABSENCE': ['PD-102', 'PD-305'],
  'LT-01': ['PD-101'],
  'LT-02': ['PD-304'],
  'LT-05': ['PD-301'],
  'LT-07': ['PD-301'],
  'TY-01': ['PD-312'],
  'TY-02': ['PD-305'],
  'TY-04': ['PD-102', 'PD-304'],
  'TY-05': ['PD-312'],
  'TY-06': ['PD-313'],
  'NAT-TIME-RESIDENCE': ['PD-106', 'PD-109'],
  'NAT-BIRTH-EXEMPTION': ['PD-106'],
  'NAT-02': ['PD-105'],
  'NAT-03': ['PD-301'],
  'NAT-04': ['PD-301'],
  'NAT-05': ['PD-309'],
  'NAT-07': ['PD-310', 'PD-311'],
  'NAT-08': ['PD-106'],
  'GV-01': ['PD-306'],
  'GV-02': ['PD-306'],
  'GV-03': ['PD-307'],
  'GV-04': ['PD-308'],
  'GV-10': ['PD-308'],
  'GF-03': ['PD-314'],
  'GF-05': ['PD-301'],
  'GF-08': ['PD-314'],
  'EF-02': ['PD-315'],
  'EF-03': ['PD-315'],
  'EF-04': ['PD-316'],
  'EF-05': ['PD-301'],
  'EF-07': ['PD-316'],
  'EF-08': ['PD-302'],
  'WK-01': ['PD-317'],
  'WK-05': ['PD-317'],
  'WK-07': ['PD-303'],
  'WK-09': ['PD-319'],
  'FT-01': ['PD-319'],
  'FT-02': ['PD-304'],
  'FT-03': ['PD-318'],
};

function greeceRules(): RuleMeta[] {
  const rules = new Map<
    string,
    { zh: Set<string>; en: Set<string>; sources: Map<string, SourceRef> }
  >();
  const add = (
    id: string,
    zh: string,
    en: string,
    sources: readonly SourceRef[],
  ) => {
    const rule = rules.get(id) ?? {
      zh: new Set(),
      en: new Set(),
      sources: new Map(),
    };
    rule.zh.add(zh);
    rule.en.add(en);
    for (const source of sources)
      rule.sources.set(`${source.srcId} ${source.locator}`, source);
    rules.set(id, rule);
  };
  for (const request of probes) {
    const [zh, en] = (['zh-CN', 'en'] as const).map(
      (locale) =>
        evaluateGreeceFull({ ...request, locale }).columns[0].pathways,
    );
    zh.forEach((pathway, i) =>
      pathway.checks.forEach((check, j) => {
        const english = en[i].checks[j];
        add(check.id, check.title, english.title, check.sources);
      }),
    );
  }
  for (const [id, key, sources] of timeChecks)
    add(id, t(key), t(key, 'en'), sources);
  return [...rules]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, rule]) => ({
      id,
      title: [...rule.zh].join(' / '),
      titleEn: [...rule.en].join(' / '),
      sources: [...rule.sources.values()],
      pendingDetails: pendingDetails[id] ?? [],
      ruleSetId: full.ruleSetId,
    }));
}

const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('gr.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-086', locator: 'ν. 5038/2023' },
    { srcId: 'SRC-087', locator: 'ν. 5100/2024, ν. 5275/2026, ν. 5307/2026' },
    { srcId: 'SRC-089', locator: 'Κώδικας Ελληνικής Ιθαγένειας' },
    { srcId: 'SRC-350', locator: 'Π.Δ. 106/2007' },
  ],
};

const change = (date: string, key: string, sources: readonly SourceRef[]) => ({
  date,
  title: t(`gr.policy.${key}Change` as TranslationKey),
  titleEn: t(`gr.policy.${key}Change` as TranslationKey, 'en'),
  summary: t(`gr.policy.${key}Summary` as TranslationKey),
  summaryEn: t(`gr.policy.${key}Summary` as TranslationKey, 'en'),
  sources: [...sources],
});

export const greecePolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: GR_PATHWAYS.map((id) => ({
    id,
    title: title(`gr.pathway.${id}`),
  })),
  parameters: { [set.id]: full },
  rules: { [set.id]: greeceRules() },
  changelog: [
    change(
      v.migrationCodeFrom.value,
      'migrationCode',
      v.migrationCodeFrom.sources,
    ),
    change(
      v.gvReformEffective.value,
      'goldenVisa',
      v.gvReformEffective.sources,
    ),
    change(
      v.naturalisationReformFrom.value,
      'naturalisation',
      v.naturalisationReformFrom.sources,
    ),
    change(
      v.workReformEffective.value,
      'reform2026',
      v.workReformEffective.sources,
    ),
    change(
      v.protectionCreditFrom.value,
      'protection',
      v.protectionCreditFrom.sources,
    ),
    change(
      v.economicCircularFrom.value,
      'economic',
      v.economicCircularFrom.sources,
    ),
  ],
});
