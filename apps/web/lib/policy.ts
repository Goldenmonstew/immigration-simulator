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
  SourceRef,
} from '@uk-immigration/policy-data';
import { t } from '../i18n';
import { sourceUrls } from './sources';

export type PolicyRuleSet = RuleSet & { title?: DisplayName };

// Country parameter tables can contain nested schedules and points tables.
export type PolicyParameterValue =
  | ParameterSet['values'][string]['value']
  | readonly PolicyParameterValue[]
  | { readonly [name: string]: PolicyParameterValue };

export interface CountryPolicy {
  ruleSets: PolicyRuleSet[];
  displayedRuleSets: PolicyRuleSet[];
  parameters: Record<
    string,
    {
      asOf: string;
      ruleSetId: string;
      values: Record<
        string,
        { value: PolicyParameterValue; sources: readonly SourceRef[] }
      >;
    }
  >;
  pathways?: { id: string; title: DisplayName }[];
  rules: Record<string, RuleMeta[]>;
  changelog: PolicyChange[];
  sourceUrls: Record<string, string>;
  // A parameter shown with labelled rows and columns instead of raw values.
  displayParameter?(
    name: string,
    locale: Locale,
  ): PolicyParameterValue | undefined;
}

export function withPolicySources(
  policy: Omit<CountryPolicy, 'sourceUrls'>,
): CountryPolicy {
  const refs = [
    ...policy.ruleSets.flatMap((set) => [
      ...set.sources,
      ...policy.rules[set.id].flatMap((rule) => rule.sources),
      ...Object.values(policy.parameters[set.id].values).flatMap(
        (parameter) => parameter.sources,
      ),
    ]),
    ...policy.changelog.flatMap((change) => change.sources),
  ];
  const used = new Set(refs.map((ref) => ref.srcId));
  return {
    ...policy,
    sourceUrls: Object.fromEntries(
      Object.entries(sourceUrls).filter(([id]) => used.has(id)),
    ),
  };
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
