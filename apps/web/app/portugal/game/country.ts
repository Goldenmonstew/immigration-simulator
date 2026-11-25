import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const ptArt = gameArt.pt;
export const ptAsset = (path: string) => gameAsset('pt', path);
export const ptStorageKey = (key: string) => gameStorageKey('pt', key);
