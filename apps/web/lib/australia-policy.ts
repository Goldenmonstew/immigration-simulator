import { AU_FULL_PATHWAYS } from '@uk-immigration/engine';
import { australiaFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { australiaRules } from './australia-policy-rules';
import { withPolicySources, type PolicyRuleSet } from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const full = australiaFull2026_11;
const v = full.values;

const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('au.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-200', locator: 'Volumes 1–3, Schedules 1, 2, 4, 5, 6D, 8' },
    { srcId: 'SRC-069', locator: 'ss 41, 46, 48, 82, 104' },
    { srcId: 'SRC-211', locator: 's 501' },
    { srcId: 'SRC-061', locator: 'ss 21–28' },
  ],
};

export const australiaPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: AU_FULL_PATHWAYS.map((id) => ({
    id,
    title: title(`au.pathway.${id}` as TranslationKey),
  })),
  parameters: { [set.id]: full },
  rules: { [set.id]: australiaRules },
  changelog: [
    {
      date: v.hongKongStreamsFrom.value,
      title: t('au.policy.hkChange'),
      titleEn: t('au.policy.hkChange', 'en'),
      summary: t('au.policy.hkSummary'),
      summaryEn: t('au.policy.hkSummary', 'en'),
      sources: v.hongKongStreamsFrom.sources,
    },
    {
      date: v.regionalApplicationsFrom.value,
      title: t('au.policy.regionalChange'),
      titleEn: t('au.policy.regionalChange', 'en'),
      summary: t('au.policy.regionalSummary'),
      summaryEn: t('au.policy.regionalSummary', 'en'),
      sources: v.regionalApplicationsFrom.sources,
    },
    {
      date: v.scvFrom.value,
      title: t('au.policy.scvChange'),
      titleEn: t('au.policy.scvChange', 'en'),
      summary: t('au.policy.scvSummary'),
      summaryEn: t('au.policy.scvSummary', 'en'),
      sources: v.scvFrom.sources,
    },
    {
      date: v.skilledEnglish.value.newTestsFrom,
      title: t('au.policy.englishChange'),
      titleEn: t('au.policy.englishChange', 'en'),
      summary: t('au.policy.englishSummary'),
      summaryEn: t('au.policy.englishSummary', 'en'),
      sources: v.skilledEnglish.sources,
    },
    {
      date: v.effectiveFrom.value,
      title: t('au.policy.feeChange'),
      titleEn: t('au.policy.feeChange', 'en'),
      summary: t('au.policy.feeSummary'),
      summaryEn: t('au.policy.feeSummary', 'en'),
      sources: [
        ...v.effectiveFrom.sources,
        { srcId: 'SRC-214', locator: 'Core Skills Income Threshold' },
        { srcId: 'SRC-221', locator: 'Current visa pricing' },
      ],
    },
  ],
});
