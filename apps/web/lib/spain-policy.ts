import { spain2026_11, spainFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { withPolicySources, type PolicyRuleSet } from './policy';
import { spainRules } from './spain-policy-rules';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const time = spain2026_11.values;
const full = spainFull2026_11;
const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('es.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-083', locator: 'arts. 176–203' },
    { srcId: 'SRC-084', locator: 'arts. 15, 20–24' },
    { srcId: 'SRC-320', locator: 'arts. 30 bis, 32–33, 41, 45–47' },
    { srcId: 'SRC-327', locator: 'arts. 1–3, 7–15' },
  ],
};

export const spainPathways = [
  { id: 'ES-NATIONALITY', target: 'N', title: title('es.target.N') },
  { id: 'ES-LONG-TERM', target: 'L', title: title('es.target.L') },
  { id: 'ES-LONG-TERM-EU', target: 'E', title: title('es.target.E') },
  { id: 'ES-M', target: 'M', title: title('es.target.M') },
  { id: 'ES-F', target: 'F', title: title('es.target.F') },
  { id: 'ES-R-N', target: 'R-N', title: title('es.target.R-N') },
  { id: 'ES-R-E', target: 'R-E', title: title('es.target.R-E') },
  { id: 'ES-U', target: 'U', title: title('es.target.U') },
] as const;

export const spainPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: spainPathways.map(({ id, title }) => ({ id, title })),
  parameters: { [set.id]: { ...full, values: { ...time, ...full.values } } },
  rules: { [set.id]: spainRules },
  changelog: [
    {
      date: full.values.nationalityFrenchTreatyFrom.value,
      title: t('es.policy.frenchChange'),
      titleEn: t('es.policy.frenchChange', 'en'),
      summary: t('es.policy.frenchSummary'),
      summaryEn: t('es.policy.frenchSummary', 'en'),
      sources: full.values.nationalityFrenchTreatyFrom.sources,
    },
    {
      date: full.values.residenceLawFrom.value,
      title: t('es.policy.regulationChange'),
      titleEn: t('es.policy.regulationChange', 'en'),
      summary: t('es.policy.regulationSummary'),
      summaryEn: t('es.policy.regulationSummary', 'en'),
      sources: full.values.residenceLawFrom.sources,
    },
    {
      date: full.values.feeScheduleFrom.value,
      title: t('es.policy.feeChange'),
      titleEn: t('es.policy.feeChange', 'en'),
      summary: t('es.policy.feeSummary'),
      summaryEn: t('es.policy.feeSummary', 'en'),
      sources: full.values.feeScheduleFrom.sources,
    },
  ],
});
