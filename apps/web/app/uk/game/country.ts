import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const ukArt = gameArt.uk;
export const ukAsset = (path: string) => gameAsset('uk', path);
export const ukStorageKey = (key: string) => gameStorageKey('uk', key);
