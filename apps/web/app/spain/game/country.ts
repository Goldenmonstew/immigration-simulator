import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const esArt = gameArt.es;
export const esAsset = (path: string) => gameAsset('es', path);
export const esStorageKey = (key: string) => gameStorageKey('es', key);
