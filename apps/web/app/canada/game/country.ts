import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const caArt = gameArt.ca;
export const caAsset = (path: string) => gameAsset('ca', path);
export const caStorageKey = (key: string) => gameStorageKey('ca', key);
