import {
  evaluateCanadaFull,
  type CaFullRequest,
  type RuleMeta,
} from '@uk-immigration/engine';
import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { canadaGoals } from './canada-fields';
import { withPolicySources, type PolicyRuleSet } from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const v = ca.values;
const set: PolicyRuleSet = {
  id: ca.ruleSetId,
  title: title('ca.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-075', locator: 'IRPA s.28' },
    { srcId: 'SRC-074', locator: 'Citizenship Act s.5' },
    { srcId: 'SRC-260', locator: 'Citizenship Act; Citizenship Regulations' },
    { srcId: 'SRC-261', locator: 'IRPA; IRPR' },
  ],
};

// Each branch of the engine reports the conditions it assesses. Together
// these branches reach every condition, with its sources and pending details.
const branches: Omit<CaFullRequest, 'simulationDate' | 'locale'>[] = [
  {},
  { permanentResident: ca.asOf, trips: [], temporaryPeriods: [] },
  {
    residence: {
      caf: { route: 'pr-member' },
      language: { waiver: 'pending' },
      test: { waiver: 'pending' },
      oathWaiver: 'pending',
    },
  },
  ...(['high', 'lower', 'physician'] as const).map((category) => ({
    pnp: {
      mode: 'enhanced' as const,
      stream: 'ontario-workforce' as const,
      ontario: { category },
    },
  })),
  ...(['high', 'intermediate', 'regulated', 'talent'] as const).map(
    (stream) => ({ quebec: { stream } }),
  ),
  { family: { quebec: true } },
];

function conditions() {
  const rules = new Map<string, RuleMeta>();
  for (const branch of branches) {
    const request = { ...branch, simulationDate: ca.asOf };
    const zh = evaluateCanadaFull(request).columns[0].pathways;
    const en = evaluateCanadaFull({ ...request, locale: 'en' }).columns[0]
      .pathways;
    zh.forEach((pathway, index) =>
      pathway.checks.forEach((check, row) => {
        const rule = rules.get(check.id) ?? {
          id: check.id,
          ruleSetId: ca.ruleSetId,
          title: check.title,
          titleEn: en[index].checks[row].title,
          sources: [],
          pendingDetails: [],
        };
        for (const source of check.sources)
          if (
            !rule.sources.some(
              (known) =>
                known.srcId === source.srcId &&
                known.locator === source.locator,
            )
          )
            rule.sources.push(source);
        for (const pending of check.pendingDetails ?? [])
          if (!rule.pendingDetails.includes(pending))
            rule.pendingDetails.push(pending);
        rules.set(check.id, rule);
      }),
    );
  }
  return [...rules.values()].sort(
    (a, b) => Number(a.id.slice(4)) - Number(b.id.slice(4)),
  );
}

export const canadaPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: canadaGoals.map((id) => ({
    id,
    title: title(`ca.goal.${id}`),
  })),
  parameters: { [set.id]: ca },
  rules: { [set.id]: conditions() },
  changelog: [
    {
      date: v.citRightFeeFrom.value,
      title: t('ca.policy.rightFeeChange'),
      titleEn: t('ca.policy.rightFeeChange', 'en'),
      summary: t('ca.policy.rightFeeSummary').replace(
        '{fee}',
        String(v.citRightFee.value),
      ),
      summaryEn: t('ca.policy.rightFeeSummary', 'en').replace(
        '{fee}',
        String(v.citRightFee.value),
      ),
      sources: [...v.citRightFeeFrom.sources, ...v.citRightFee.sources],
    },
    {
      date: v.federalFees.value.from,
      title: t('ca.policy.feeChange'),
      titleEn: t('ca.policy.feeChange', 'en'),
      summary: t('ca.policy.feeSummary').replace(
        '{date}',
        v.federalFees.value.nextAdjustment,
      ),
      summaryEn: t('ca.policy.feeSummary', 'en').replace(
        '{date}',
        v.federalFees.value.nextAdjustment,
      ),
      sources: [...v.federalFees.sources],
    },
    {
      date: v.eeCategorySelection.value.currentListFrom,
      title: t('ca.policy.categoryChange'),
      titleEn: t('ca.policy.categoryChange', 'en'),
      summary: t('ca.policy.categorySummary'),
      summaryEn: t('ca.policy.categorySummary', 'en'),
      sources: [...v.eeCategorySelection.sources],
    },
  ],
});
