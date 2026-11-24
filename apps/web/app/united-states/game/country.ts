import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const usArt = gameArt.us;
export const usAsset = (path: string) => gameAsset('us', path);
export const usStorageKey = (key: string) => gameStorageKey('us', key);
