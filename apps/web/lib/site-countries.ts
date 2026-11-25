import type { TranslationKey } from '../i18n';

export const siteCountries = [
  { id: 'uk', slug: 'uk', nameKey: 'uk.name', hasGame: true },
  { id: 'au', slug: 'australia', nameKey: 'au.name', hasGame: false },
  { id: 'nz', slug: 'new-zealand', nameKey: 'nz.name', hasGame: false },
  { id: 'ca', slug: 'canada', nameKey: 'ca.name', hasGame: false },
  { id: 'us', slug: 'united-states', nameKey: 'us.name', hasGame: false },
  { id: 'es', slug: 'spain', nameKey: 'es.name', hasGame: false },
  { id: 'gr', slug: 'greece', nameKey: 'gr.name', hasGame: false },
  { id: 'ie', slug: 'ireland', nameKey: 'ie.name', hasGame: false },
  { id: 'pt', slug: 'portugal', nameKey: 'pt.name', hasGame: false },
  { id: 'jp', slug: 'japan', nameKey: 'jp.name', hasGame: false },
  { id: 'de', slug: 'germany', nameKey: 'de.name', hasGame: false },
] as const satisfies readonly {
  id: string;
  slug: string;
  nameKey: TranslationKey;
  hasGame: boolean;
}[];

export const nonUkCountries = siteCountries.filter(
  (country) => country.id !== 'uk',
);

type SiteCountry = (typeof siteCountries)[number];
export type CountryId = SiteCountry['id'];

export function countryPath(
  id: SiteCountry['id'] | SiteCountry['slug'],
  sub = '',
) {
  const { slug } = siteCountries.find(
    (country) => country.id === id || country.slug === id,
  )!;
  return '/' + [slug, sub.replace(/^\/+/, '')].filter(Boolean).join('/');
}

const calculatorPages = ['', 'simulate', 'result', 'whatif', 'policy'];
const pagesByCountry: Partial<Record<CountryId, string[]>> = {
  uk: [...calculatorPages, 'about', 'game'],
  es: calculatorPages,
  au: calculatorPages,
  jp: calculatorPages,
};

export const sitePagePaths = [
  '/',
  ...siteCountries.flatMap(({ id }) =>
    (pagesByCountry[id] ?? ['']).map((sub) => countryPath(id, sub)),
  ),
];
