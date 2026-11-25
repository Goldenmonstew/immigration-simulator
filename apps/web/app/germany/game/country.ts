import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const deArt = gameArt.de;
export const deAsset = (path: string) => gameAsset('de', path);
export const deStorageKey = (key: string) => gameStorageKey('de', key);
