import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const nzArt = gameArt.nz;
export const nzAsset = (path: string) => gameAsset('nz', path);
export const nzStorageKey = (key: string) => gameStorageKey('nz', key);
