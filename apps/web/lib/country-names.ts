import { COUNTRY_ALPHA2 } from './countries';

interface Country {
  code: string;
  zh: string;
  en: string;
}

let cache: Country[] | undefined;

/** Countries by alpha-3 code, named in both site languages (playtest #3). */
export function countries(): Country[] {
  if (!cache) {
    const zh = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
    const en = new Intl.DisplayNames(['en'], { type: 'region' });
    cache = Object.entries(COUNTRY_ALPHA2).map(([code, region]) => ({
      code,
      zh: zh.of(region) ?? code,
      en: en.of(region) ?? code,
    }));
  }
  return cache;
}

export function countryName(code: string): string | undefined {
  const country = countries().find((c) => c.code === code);
  return country && `${country.zh} · ${country.en}`;
}

/** A three-letter code, or a country name in Chinese or English. */
export function nationalityFromInput(text: string): string {
  const value = text.trim();
  if (/^[a-z]{3}$/i.test(value)) return value.toUpperCase();
  const lower = value.toLowerCase();
  return (
    countries().find((c) => c.zh === value || c.en.toLowerCase() === lower)
      ?.code ?? value
  );
}
