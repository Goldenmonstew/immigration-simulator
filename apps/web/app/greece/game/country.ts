import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const grArt = gameArt.gr;
export const grAsset = (path: string) => gameAsset('gr', path);
export const grStorageKey = (key: string) => gameStorageKey('gr', key);
