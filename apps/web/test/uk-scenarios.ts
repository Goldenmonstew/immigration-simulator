import type { CountryResult, Locale } from '@uk-immigration/engine';
import type { Draft } from '../lib/questionnaire';
import * as share from '../lib/share';
import * as storage from '../lib/storage';
import { runSimulation as simulateUk } from '../lib/questionnaire';
import { ukModule, ukResult } from '../lib/uk-module';

export const encodeDraft = (draft: Draft) => share.encodeDraft(ukModule, draft);
export const decodeDraft = (encoded: string) =>
  share.decodeDraft(ukModule, encoded);
export const draftStorage = (next?: Draft) =>
  storage.draftStorage(ukModule, next);
export const readScenarios = () => storage.readScenarios(ukModule);
export const saveScenario = (name: string, draft: Draft) =>
  storage.saveScenario(ukModule, name, draft);
export const deleteScenario = (id: string) =>
  storage.deleteScenario(ukModule, id);
export const loadScenario = (scenario: storage.SavedScenario<Draft>) =>
  storage.loadScenario(ukModule, scenario);
export const rememberResult = (
  draft: Draft,
  result: CountryResult,
  locale: Locale,
) => storage.rememberResult(ukModule, draft, result, locale);
export const getRememberedResult = (draft: Draft, locale: Locale) =>
  storage.getRememberedResult(ukModule, draft, locale);

export {
  createDraft,
  runPrincipalSimulation,
  shortCircuitKeys,
} from '../lib/questionnaire';

// The existing locale fixtures inspect UK fields and pass the same object to the result cache.
export function runSimulation(draft: Draft, locale: Locale = 'zh-CN') {
  const original = simulateUk(draft, locale);
  return { ...original, columns: ukResult(original, locale).columns };
}
