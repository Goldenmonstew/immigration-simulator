import { gameArt, gameAsset, gameStorageKey } from '../../../lib/game-country';

export const jpArt = gameArt.jp;
export const jpAsset = (path: string) => gameAsset('jp', path);
export const jpStorageKey = (key: string) => gameStorageKey('jp', key);
