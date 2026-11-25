import { createSound } from '../../game-shell/sound';
import { usAsset, usStorageKey } from './country';

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
  asset: usAsset,
  storageKey: usStorageKey,
  voices: [
    'dolores',
    'frank',
    'angela',
    'minh',
    'danny',
    'fatima',
    'jayden',
    'marcus',
  ],
});
