import { japan2026_11, japanFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import {
  prRouteFields,
  natRouteFields,
  travelRouteFields,
} from './japan-fields';
import { japanRules } from './japan-policy-rules';
import { withPolicySources, type PolicyRuleSet } from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const time = japan2026_11.values;
const full = japanFull2026_11;
const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('jp.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-110', locator: '第22条、第26条、第26条の2、第61条の2の15' },
    { srcId: 'SRC-111', locator: '第5–10条' },
    ...time.prStayYears.sources,
  ],
};

export const japanPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: [
    ...Object.keys(prRouteFields).map((name) => ({
      id: `jp.pr.${name}`,
      title: title(`jp.pr.${name}` as TranslationKey),
    })),
    ...Object.keys(natRouteFields).map((name) => ({
      id: `jp.nat.${name}`,
      title: title(`jp.nat.${name}` as TranslationKey),
    })),
    ...Object.keys(travelRouteFields).map((name) => ({
      id: `jp.reentry.${name}`,
      title: title(`jp.travel.${name}` as TranslationKey),
    })),
  ],
  parameters: { [set.id]: { ...full, values: { ...time, ...full.values } } },
  rules: { [set.id]: japanRules },
  changelog: [
    {
      date: time.naturalisationPracticeFrom.value,
      title: t('jp.policy.naturalisationChange'),
      titleEn: t('jp.policy.naturalisationChange', 'en'),
      summary: t('jp.policy.naturalisationSummary'),
      summaryEn: t('jp.policy.naturalisationSummary', 'en'),
      sources: time.naturalisationPracticeFrom.sources,
    },
    {
      date: full.values.fees.value.reform,
      title: t('jp.policy.feeChange'),
      titleEn: t('jp.policy.feeChange', 'en'),
      summary: t('jp.policy.feeSummary'),
      summaryEn: t('jp.policy.feeSummary', 'en'),
      sources: [...full.values.fees.sources],
    },
    {
      date: time.newGuidelineFrom.value,
      title: t('jp.policy.guidelineChange'),
      titleEn: t('jp.policy.guidelineChange', 'en'),
      summary: t('jp.policy.guidelineSummary'),
      summaryEn: t('jp.policy.guidelineSummary', 'en'),
      sources: time.newGuidelineFrom.sources,
    },
  ],
});
