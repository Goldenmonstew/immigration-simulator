import type { CountryResult, Locale } from '@uk-immigration/engine';
import type { CountryDraft, CountryModule } from './country-module';
import { decodeDraft } from './share';
import {
  draftStorage,
  getRememberedResult,
  rememberResult,
  resultDeviceDay,
} from './storage';

export interface ResultPageState<D> {
  draft?: D;
  result?: CountryResult;
  correction?: string;
  shared?: boolean;
}

export function readPageResult<D extends CountryDraft, K>(
  country: CountryModule<D, K>,
  locale: Locale,
  source: D | string | null = null,
  mode: 'result' | 'preview' | 'refresh' = 'result',
): ResultPageState<D> {
  const shared = typeof source === 'string';
  function assess(draft?: D): ResultPageState<D> {
    if (!draft) return {};
    if (!draft.completed) {
      if (country.incompleteResultMessage) {
        return {
          draft: shared ? undefined : draft,
          correction: country.incompleteResultMessage(draft, locale),
        };
      }
      // UK comparison edits clear the completion flag. The comparison and
      // its saved card can preview them; imported links still require validation.
      if (shared) {
        if (!country.decodeDraft({ ...draft, completed: true })) return {};
      } else if (mode !== 'preview' || country.id !== 'uk') return {};
    }
    const deviceDay = resultDeviceDay(country);
    const cached =
      !shared && getRememberedResult(country, draft, locale, deviceDay);
    const result = cached || country.run(draft, locale);
    // A shared tab becoming visible must not import its draft over later edits.
    const importing = shared && mode !== 'refresh';
    if (importing) draftStorage(country, draft);
    if (!cached && (importing || source === null))
      rememberResult(country, draft, result, locale, deviceDay);
    return { draft, result, shared };
  }

  if (source === null) return assess(draftStorage(country).draft);
  if (!shared) return assess(country.restoreStoredDraft?.(source) ?? source);
  try {
    return assess(decodeDraft(country, source, 'show-correction'));
  } catch {
    // A malformed external scenario must not replace the saved draft.
    return {};
  }
}
