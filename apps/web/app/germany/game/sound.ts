import { createSound } from '../../game-shell/sound';
import { deAsset, deStorageKey } from './country';

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
  asset: deAsset,
  storageKey: deStorageKey,
  voices: [
    'gisela',
    'uwe',
    'sabine',
    'murat',
    'jonas',
    'trang',
    'emeka',
    'leon',
    'lena',
  ],
});
