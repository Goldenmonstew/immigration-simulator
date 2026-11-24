import type {
  CountryDraft,
  CountryModule,
  DraftReadMode,
} from './country-module';

type ShareModule<D extends CountryDraft> = Pick<
  CountryModule<D, never>,
  'id' | 'version' | 'decodeDraft' | 'activeAnswers'
>;

export function encodeDraft<D extends CountryDraft>(
  country: ShareModule<D>,
  draft: D,
): string {
  const envelope = {
    country: country.id,
    v: country.version,
    draft: country.activeAnswers?.(draft) ?? draft,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(envelope));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    '',
  );
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export function decodeDraft<D extends CountryDraft>(
  country: ShareModule<D>,
  encoded: string,
  mode: DraftReadMode = false,
): D | undefined {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(encoded)) return undefined;
    const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    const value = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    ) as Record<string, unknown> | null;
    if (!value || typeof value !== 'object') return undefined;
    if ('country' in value || 'v' in value) {
      if (value.country !== country.id || value.v !== country.version)
        return undefined;
      const draft = country.decodeDraft(value.draft, mode);
      return draft && (country.activeAnswers?.(draft) ?? draft);
    }
    // Before country envelopes, only UK questionnaires produced share links.
    return country.id === 'uk' ? country.decodeDraft(value) : undefined;
  } catch {
    return undefined;
  }
}

// Result actions carry the assessed answers in the fragment, including when
// opened in a new tab. Only a shared result links back to its share URL.
export function linkedResultDraft<D extends CountryDraft>(
  country: ShareModule<D>,
  hash: string,
) {
  if (country.id !== 'jp') return undefined;
  const params = new URLSearchParams(hash.slice(1));
  const shared = params.get('s');
  const encoded = shared ?? params.get('draft');
  if (encoded === null) return undefined;
  return {
    draft: decodeDraft(country, encoded),
    resultHash: shared === null ? '' : hash,
  };
}

// Keep any inactive local questionnaire answers out of the link itself.
let pendingEdit: { hash: string; draft: CountryDraft } | undefined;

export function rememberResultEdit(hash: string, draft: CountryDraft) {
  pendingEdit = { hash, draft };
}

export function takeResultEdit(hash: string) {
  const edit = pendingEdit;
  pendingEdit = undefined;
  return edit?.hash === hash ? edit.draft : undefined;
}
