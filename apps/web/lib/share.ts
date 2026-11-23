import type { CountryDraft, CountryModule } from './country-module';

type ShareModule<D extends CountryDraft> = Pick<
  CountryModule<D, never>,
  'id' | 'version' | 'decodeDraft'
>;

export function encodeDraft<D extends CountryDraft>(
  country: ShareModule<D>,
  draft: D,
): string {
  const envelope = { country: country.id, v: country.version, draft };
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
      return country.decodeDraft(value.draft);
    }
    // Before country envelopes, only UK questionnaires produced share links.
    return country.id === 'uk' ? country.decodeDraft(value) : undefined;
  } catch {
    return undefined;
  }
}
