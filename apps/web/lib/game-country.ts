import { jpGameArt } from '@uk-immigration/game/jp/presentation';
import { nzGameArt } from '@uk-immigration/game/nz/presentation';
import { ukGameArt } from '@uk-immigration/game/uk/presentation';
import { asset } from './asset';
import type { siteCountries } from './site-countries';

type CountryId = (typeof siteCountries)[number]['id'];

export const gameArt = {
  uk: ukGameArt,
  jp: jpGameArt,
  nz: nzGameArt,
} satisfies Partial<Record<CountryId, { root: string }>>;

export type GameCountryId = keyof typeof gameArt;

export const gameAsset = (country: GameCountryId, path: string) =>
  asset(`${gameArt[country].root}${path}`);

export const gameStorageKey = (country: CountryId, key: string) =>
  `${country}-immigration-life-${key}`;
