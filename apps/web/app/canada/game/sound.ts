import { createSound } from '../../game-shell/sound';
import { caAsset, caStorageKey } from './country';

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
  asset: caAsset,
  storageKey: caStorageKey,
  voices: [
    'doreen',
    'gerry',
    'mike',
    'bonnie',
    'fatima',
    'kwame',
    'leo',
    'chloe',
  ],
});
