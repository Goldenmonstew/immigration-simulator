import {
  portugal2026_11,
  portugalFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { PT_TARGETS, ptPathwayByTarget } from './portugal-fields';
import { portugalRules } from './portugal-policy-rules';
import { withPolicySources, type PolicyRuleSet } from './policy';

const title = (key: TranslationKey) => ({ 'zh-CN': t(key), en: t(key, 'en') });
const change = (
  key: 'nationality' | 'ari' | 'blueCard' | 'fee',
  parameter: { sources: readonly SourceRef[] },
  date: string,
) => ({
  date,
  title: t(`pt.policy.${key}Change`),
  titleEn: t(`pt.policy.${key}Change`, 'en'),
  summary: t(`pt.policy.${key}Summary`),
  summaryEn: t(`pt.policy.${key}Summary`, 'en'),
  sources: [...parameter.sources],
});

const time = portugal2026_11.values;
const full = portugalFull2026_11.values;
const set: PolicyRuleSet = {
  id: 'pt.current-law',
  title: title('pt.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-120', locator: 'Lei 37/81 arts. 3, 6, 9–10, 15' },
    {
      srcId: 'SRC-123',
      locator: 'Lei 23/2007 arts. 75–91, 98–103, 121-I, 125–131',
    },
    { srcId: 'SRC-478', locator: 'Lei 37/2006 arts. 2–3, 6–17, 21–24, 29' },
  ],
};

export const portugalPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: PT_TARGETS.map((target) => ({
    id: ptPathwayByTarget[target],
    title: title(`pt.target.${target}`),
  })),
  parameters: {
    [set.id]: {
      asOf: portugalFull2026_11.asOf,
      ruleSetId: set.id,
      values: { ...time, ...full },
    },
  },
  rules: { [set.id]: portugalRules },
  changelog: [
    change('nationality', time.lawInForce, time.lawInForce.value),
    change('fee', full.aimaFeeDates, full.aimaFeeDates.value.from),
    change('blueCard', full.blueCard, full.blueCard.value.from),
    change('ari', full.ariInvestmentReform, full.ariInvestmentReform.value),
  ],
});
