import { deGameArt } from '@uk-immigration/game/de/presentation';
import { jpGameArt } from '@uk-immigration/game/jp/presentation';
import { ukGameArt } from '@uk-immigration/game/uk/presentation';
import { asset } from './asset';
import type { siteCountries } from './site-countries';

type CountryId = (typeof siteCountries)[number]['id'];

export const gameArt = {
  uk: ukGameArt,
  jp: jpGameArt,
  de: deGameArt,
} satisfies Partial<Record<CountryId, { root: string }>>;

export type GameCountryId = keyof typeof gameArt;

export const gameAsset = (country: GameCountryId, path: string) =>
  asset(`${gameArt[country].root}${path}`);

export const gameStorageKey = (country: CountryId, key: string) =>
  `${country}-immigration-life-${key}`;
