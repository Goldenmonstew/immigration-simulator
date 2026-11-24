import {
  adaptUkResult,
  RULES,
  RULE_SETS,
  type Locale,
  type SimulationResult,
} from '@uk-immigration/engine';
import {
  PARAMETERS,
  policyChangelog,
  ROUTE_GROUPS,
} from '@uk-immigration/policy-data';
import { ukWhatIf } from '../app/uk/whatif/controls';
import type { TranslationKey } from '../i18n';
import type { CountryModule } from './country-module';
import { ruleSetTitle } from './policy';
import {
  createDraft,
  currentEpisode,
  needsPrincipal,
  runPrincipalSimulation,
  runSimulation,
  validateStep,
  type Draft,
} from './questionnaire';
import { ukSourceUrls } from './sources';
import { decodeUkDraft } from './uk-draft';
import { allRuleSets, displayedRuleSets } from './uk-policy';
import type { WhatIf } from './uk-whatif';

export function ukResult(result: SimulationResult, locale: Locale) {
  const adapted = adaptUkResult(result, locale, RULE_SETS);
  if (adapted.shortCircuit && !adapted.columns.length) return adapted;
  // Keep both selected headings visible even when a preview lacks an assessment.
  adapted.columns = displayedRuleSets.map((set) => {
    const column = adapted.columns.find((item) => item.id === set.id);
    return (
      column ?? { id: set.id, title: ruleSetTitle(set, locale), pathways: [] }
    );
  });
  return adapted;
}

export const ukModule: CountryModule<Draft, WhatIf> = {
  id: 'uk',
  version: 1,
  createDraft: () => createDraft(),
  validateStep,
  decodeDraft: decodeUkDraft,
  run: (draft, locale) => ukResult(runSimulation(draft, locale), locale),
  principal(draft, locale) {
    const result =
      needsPrincipal(draft) && runPrincipalSimulation(draft, locale);
    return result ? ukResult(result, locale) : undefined;
  },
  resultNotes(draft) {
    const episode = draft && currentEpisode(draft);
    const notices: TranslationKey[] = ['policy.hypothesis'];
    if (
      episode &&
      ROUTE_GROUPS[episode.route].some((group) => group === 'PROTECTION')
    )
      notices.push('result.protectionNotice');
    return { notices, dependant: episode?.role === 'DEPENDANT' };
  },
  advice: {
    text: 'result.adviceText',
    sourceId: 'SRC-016',
    linkLabel: 'result.adviceLink',
  },
  whatif: ukWhatIf,
  policy: {
    ruleSets: allRuleSets,
    displayedRuleSets,
    parameters: PARAMETERS,
    rules: Object.fromEntries(
      allRuleSets.map((set) => [
        set.id,
        RULES[set.id].map((rule) => rule.meta),
      ]),
    ),
    changelog: policyChangelog,
    sourceUrls: ukSourceUrls,
  },
};
