import type { Locale } from '@uk-immigration/engine';
import { spain2026_11, spainFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { spainParameterLabels } from '../i18n/countries/spain-module';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';
import { spainRules } from './spain-policy-rules';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const full = spainFull2026_11;
const values = { ...spain2026_11.values, ...full.values };
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

// Nested fields and the DELE-exempt country codes are shown by name.
function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  if (name === 'nationalityDeleExemptCountries')
    return full.values.nationalityDeleExemptCountries.value.map((code) =>
      t(`es.option.${code}` as TranslationKey, locale),
    );
  const labels = spainParameterLabels[name];
  if (!labels) return undefined;
  const value = values[name as keyof typeof values].value as Record<
    string,
    number
  >;
  return Object.fromEntries(
    Object.entries(labels).map(([key, [zh, en]]) => [
      locale === 'en' ? en : zh,
      // The label no longer ends in "year", so keep the calendar year as text.
      key === 'year' ? String(value[key]) : value[key],
    ]),
  );
}

export const spainPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: spainPathways.map(({ id, title }) => ({ id, title })),
  parameters: { [set.id]: { ...full, values } },
  rules: { [set.id]: spainRules },
  displayParameter,
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
