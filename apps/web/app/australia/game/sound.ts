import { createSound } from '../../game-shell/sound';
import { auAsset, auStorageKey } from './country';

export const {
  playSound,
  unlockSound,
  setMuted,
  readMuted,
  setSoundSeason,
  hideSound,
  stopSound,
  setSoundEnvironment,
} = createSound({
  asset: auAsset,
  storageKey: auStorageKey,
  voices: ['bev', 'gazza', 'leilani', 'rosa', 'sam', 'kai', 'doug', 'grace'],
});
