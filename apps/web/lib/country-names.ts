import { COUNTRY_ALPHA2, PASSPORT_NATIONALITIES } from './countries';

interface Country {
  code: string;
  zh: string;
  en: string;
}

let cache: Country[] | undefined;

/** Nationality values by code, named in both site languages (playtest #3). */
export function countries(): Country[] {
  if (!cache) {
    const zh = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
    const en = new Intl.DisplayNames(['en'], { type: 'region' });
    cache = [
      ...Object.entries(COUNTRY_ALPHA2).map(([code, region]) => ({
        code,
        zh: zh.of(region) ?? code,
        en: en.of(region) ?? code,
      })),
      ...PASSPORT_NATIONALITIES,
    ];
  }
  return cache;
}

export function countryName(code: string): string | undefined {
  const country = countries().find((c) => c.code === code);
  return country && `${country.zh} · ${country.en}`;
}

/**
 * The code for a listed code or an exact country name in Chinese or English;
 * otherwise undefined, so the field keeps what is being typed.
 */
export function nationalityFromInput(text: string): string | undefined {
  const value = text.trim();
  const lower = value.toLowerCase();
  return countries().find(
    (c) =>
      c.code === value.toUpperCase() ||
      c.zh === value ||
      c.en.toLowerCase() === lower,
  )?.code;
}
