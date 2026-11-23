import type {
  CountryResult,
  Locale,
  RuleMeta,
  RuleSet,
} from '@uk-immigration/engine';
import type {
  DisplayName,
  ParameterSet,
  PolicyChange,
} from '@uk-immigration/policy-data';
import { t } from '../i18n';

export type PolicyRuleSet = RuleSet & { title?: DisplayName };

export interface CountryPolicy {
  ruleSets: PolicyRuleSet[];
  displayedRuleSets: PolicyRuleSet[];
  parameters: Record<string, ParameterSet>;
  rules: Record<string, RuleMeta[]>;
  changelog: PolicyChange[];
  sourceUrls: Record<string, string>;
}

export function ruleSetTitle(set: PolicyRuleSet, locale: Locale) {
  return set.title?.[locale] ?? t(`policy.${set.kind}`, locale);
}

export function displayedColumns(
  country: { policy: CountryPolicy },
  result: CountryResult,
) {
  return result.columns.map((column) => ({
    ...column,
    ruleSet: country.policy.displayedRuleSets.find(
      (set) => set.id === column.id,
    ),
  }));
}

// Existing UK questionnaire, about and game consumers.
export { allRuleSets, displayedRuleSets, policyAsOf } from './uk-policy';
