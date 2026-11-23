import type { CountryResult, Locale } from '@uk-immigration/engine';
import type { CountryDraft, CountryModule } from './country-module';

type DraftModule<D extends CountryDraft> = Pick<
  CountryModule<D, never>,
  'id' | 'version' | 'createDraft'
>;
type StorageCountry = Pick<DraftModule<CountryDraft>, 'id' | 'version'>;

function storageKey(country: StorageCountry, kind: 'draft' | 'scenarios') {
  return `${country.id}-immigration-${kind}-v${country.version}`;
}

const memoryDrafts = new Map<string, CountryDraft>();
const memoryResults = new Map<
  string,
  { result: CountryResult; locale: Locale }
>();

// A single storage boundary handles unavailable storage and invalid JSON.
export function draftStorage<D extends CountryDraft>(
  country: DraftModule<D>,
  next?: D,
): {
  draft: D | undefined;
  available: boolean;
} {
  const key = storageKey(country, 'draft');
  let draft = memoryDrafts.get(key) as D | undefined;
  if (next) {
    draft = next;
    memoryDrafts.set(key, next);
    memoryResults.delete(key);
  }
  try {
    if (next) {
      localStorage.setItem(key, JSON.stringify(next));
    } else {
      const saved = localStorage.getItem(key);
      const parsed: D | undefined = saved ? JSON.parse(saved) : undefined;
      if (parsed?.version === country.version) {
        draft = parsed;
        memoryDrafts.set(key, parsed);
      }
    }
    return { draft, available: true };
  } catch {
    return { draft, available: false };
  }
}

export function rememberResult(
  country: StorageCountry,
  result: CountryResult,
  locale: Locale,
): void {
  memoryResults.set(storageKey(country, 'draft'), { result, locale });
}
export function getRememberedResult(
  country: StorageCountry,
  locale: Locale,
): CountryResult | undefined {
  const cached = memoryResults.get(storageKey(country, 'draft'));
  return cached?.locale === locale ? cached.result : undefined;
}

export interface SavedScenario<D extends CountryDraft> {
  id: string;
  name: string;
  savedAt: string;
  draft: D;
}

export function readScenarios<D extends CountryDraft>(
  country: DraftModule<D>,
): {
  scenarios: SavedScenario<D>[];
  available: boolean;
} {
  try {
    const saved = localStorage.getItem(storageKey(country, 'scenarios'));
    const scenarios = saved ? JSON.parse(saved) : [];
    if (
      !Array.isArray(scenarios) ||
      scenarios.some(
        (item) =>
          !item ||
          typeof item.id !== 'string' ||
          typeof item.name !== 'string' ||
          typeof item.savedAt !== 'string' ||
          item.draft?.version !== country.version,
      )
    )
      return { scenarios: [], available: false };
    return { scenarios, available: true };
  } catch {
    return { scenarios: [], available: false };
  }
}

function writeScenarios<D extends CountryDraft>(
  country: DraftModule<D>,
  scenarios: SavedScenario<D>[],
) {
  try {
    localStorage.setItem(
      storageKey(country, 'scenarios'),
      JSON.stringify(scenarios),
    );
    return { scenarios, available: true };
  } catch {
    return { ...readScenarios(country), available: false };
  }
}

export function saveScenario<D extends CountryDraft>(
  country: DraftModule<D>,
  name: string,
  draft: D,
) {
  const stored = readScenarios(country);
  if (!stored.available) return stored;
  return writeScenarios(country, [
    ...stored.scenarios,
    {
      id: crypto.randomUUID(),
      name,
      savedAt: new Date().toISOString(),
      draft,
    },
  ]);
}

export function deleteScenario<D extends CountryDraft>(
  country: DraftModule<D>,
  id: string,
) {
  const stored = readScenarios(country);
  if (!stored.available) return stored;
  return writeScenarios(
    country,
    stored.scenarios.filter((scenario) => scenario.id !== id),
  );
}

export function loadScenario<D extends CountryDraft>(
  country: DraftModule<D>,
  scenario: SavedScenario<D>,
): D {
  // What-if share links can contain drafts marked incomplete after an edit.
  const next = { ...scenario.draft, completed: true };
  draftStorage(country, next);
  return next;
}
