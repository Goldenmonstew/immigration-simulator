import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const auArt = gameArt.au;
export const auAsset = (path: string) => gameAsset('au', path);
export const auStorageKey = (key: string) => gameStorageKey('au', key);
