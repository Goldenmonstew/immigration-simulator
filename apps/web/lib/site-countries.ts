import type { TranslationKey } from '../i18n';

export const siteCountries = [
  { id: 'uk', slug: '', nameKey: 'uk.name' },
  { id: 'au', slug: 'australia', nameKey: 'au.name' },
  { id: 'nz', slug: 'new-zealand', nameKey: 'nz.name' },
  { id: 'ca', slug: 'canada', nameKey: 'ca.name' },
  { id: 'us', slug: 'united-states', nameKey: 'us.name' },
  { id: 'es', slug: 'spain', nameKey: 'es.name' },
  { id: 'gr', slug: 'greece', nameKey: 'gr.name' },
  { id: 'ie', slug: 'ireland', nameKey: 'ie.name' },
  { id: 'pt', slug: 'portugal', nameKey: 'pt.name' },
  { id: 'jp', slug: 'japan', nameKey: 'jp.name' },
  { id: 'de', slug: 'germany', nameKey: 'de.name' },
] as const satisfies readonly {
  id: string;
  slug: string;
  nameKey: TranslationKey;
}[];

export const nonUkCountries = siteCountries.filter(
  (country) => country.id !== 'uk',
);

type SiteCountry = (typeof siteCountries)[number];

export function countryPath(
  id: SiteCountry['id'] | Exclude<SiteCountry['slug'], ''>,
  sub = '',
) {
  const { slug } = siteCountries.find(
    (country) => country.id === id || country.slug === id,
  )!;
  return '/' + [slug, sub.replace(/^\/+/, '')].filter(Boolean).join('/');
}
