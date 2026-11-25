import { createSound } from '../../game-shell/sound';
import { esAsset, esStorageKey } from './country';

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
  asset: esAsset,
  storageKey: esStorageKey,
  voices: [
    'amparo',
    'tonet',
    'herminia',
    'sergi',
    'fatima',
    'marina',
    'quique',
    'lele',
  ],
});
