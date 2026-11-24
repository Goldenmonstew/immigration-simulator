import type { CountryResult, Locale } from '@uk-immigration/engine';
import type { CountryDraft, CountryModule } from './country-module';

type DraftModule<D extends CountryDraft> = Pick<
  CountryModule<D, never>,
  'id' | 'version' | 'createDraft' | 'restoreStoredDraft'
>;
type StorageCountry = Pick<DraftModule<CountryDraft>, 'id' | 'version'>;

function storageKey(country: StorageCountry, kind: 'draft' | 'scenarios') {
  return `${country.id}-immigration-${kind}-v${country.version}`;
}

const memoryDrafts = new Map<string, CountryDraft>();
const memoryResults = new Map<
  string,
  { result: CountryResult; locale: Locale; draftJSON: string }
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
  let available = true;
  try {
    if (next) {
      localStorage.setItem(key, JSON.stringify(next));
      return { draft, available };
    }
    const saved = localStorage.getItem(key);
    const parsed: D | undefined = saved ? JSON.parse(saved) : undefined;
    if (parsed?.version === country.version) {
      draft = country.restoreStoredDraft?.(parsed) ?? parsed;
      memoryDrafts.set(key, draft);
      if (draft !== parsed) localStorage.setItem(key, JSON.stringify(draft));
      return { draft, available };
    }
  } catch {
    available = false;
  }
  if (!next && draft && country.restoreStoredDraft) {
    draft = country.restoreStoredDraft(draft);
    memoryDrafts.set(key, draft);
  }
  return { draft, available };
}

export function rememberResult(
  country: StorageCountry,
  draft: CountryDraft,
  result: CountryResult,
  locale: Locale,
): void {
  memoryResults.set(storageKey(country, 'draft'), {
    result,
    locale,
    draftJSON: JSON.stringify(draft),
  });
}
export function getRememberedResult(
  country: StorageCountry,
  draft: CountryDraft,
  locale: Locale,
): CountryResult | undefined {
  const cached = memoryResults.get(storageKey(country, 'draft'));
  return cached?.locale === locale && cached.draftJSON === JSON.stringify(draft)
    ? cached.result
    : undefined;
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
    const key = storageKey(country, 'scenarios');
    const saved = localStorage.getItem(key);
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
    if (country.restoreStoredDraft) {
      let changed = false;
      for (const scenario of scenarios) {
        const draft = country.restoreStoredDraft(scenario.draft, true);
        if (draft !== scenario.draft) {
          scenario.draft = draft;
          changed = true;
        }
      }
      if (changed) localStorage.setItem(key, JSON.stringify(scenarios));
    }
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
  const next = country.restoreStoredDraft?.(scenario.draft, true) ?? {
    ...scenario.draft,
    completed: true,
  };
  draftStorage(country, next);
  return next;
}
