import { DE_FULL_ROUTES } from '@uk-immigration/engine';
import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { germanyRules } from './germany-policy-rules';
import { withPolicySources, type PolicyRuleSet } from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const full = germanyFull2026_11;
const v = full.values;
const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('de.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    {
      srcId: 'SRC-100',
      locator: 'AufenthG §§ 9, 9a–9c, 18c, 21, 26, 28, 31, 35, 51',
    },
    { srcId: 'SRC-101', locator: 'StAG §§ 8–12b, 16, 38, 40a' },
    { srcId: 'SRC-422', locator: 'FreizügG/EU §§ 2–6' },
  ],
};

export const germanyPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: DE_FULL_ROUTES.map((route) => ({
    id: `DE-${route}`,
    title: title(`de.route.${route}` as TranslationKey),
  })),
  parameters: { [set.id]: full },
  rules: { [set.id]: germanyRules },
  changelog: [
    {
      date: v.skilledCurrentFrom.value,
      title: t('de.policy.skilledChange'),
      titleEn: t('de.policy.skilledChange', 'en'),
      summary: t('de.policy.skilledSummary'),
      summaryEn: t('de.policy.skilledSummary', 'en'),
      sources: v.skilledCurrentFrom.sources,
    },
    {
      date: v.fiveYearsFrom.value,
      title: t('de.policy.starmodgChange'),
      titleEn: t('de.policy.starmodgChange', 'en'),
      summary: t('de.policy.starmodgSummary'),
      summaryEn: t('de.policy.starmodgSummary', 'en'),
      sources: v.fiveYearsFrom.sources,
    },
    {
      date: v.turboAbolishedFrom.value,
      title: t('de.policy.turboChange'),
      titleEn: t('de.policy.turboChange', 'en'),
      summary: t('de.policy.turboSummary'),
      summaryEn: t('de.policy.turboSummary', 'en'),
      sources: v.turboAbolishedFrom.sources,
    },
    {
      date: v.cardFeesFrom.value,
      title: t('de.policy.cardFeeChange'),
      titleEn: t('de.policy.cardFeeChange', 'en'),
      summary: t('de.policy.cardFeeSummary'),
      summaryEn: t('de.policy.cardFeeSummary', 'en'),
      sources: v.cardFeesFrom.sources,
    },
    {
      date: v.protectionNoticeFrom.value,
      title: t('de.policy.protectionNoticeChange'),
      titleEn: t('de.policy.protectionNoticeChange', 'en'),
      summary: t('de.policy.protectionNoticeSummary'),
      summaryEn: t('de.policy.protectionNoticeSummary', 'en'),
      sources: v.protectionNoticeFrom.sources,
    },
  ],
});
