import { createSound } from '../../game-shell/sound';
import { grAsset, grStorageKey } from './country';

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
  asset: grAsset,
  storageKey: grStorageKey,
  voices: [
    'eleni',
    'stavros',
    'katerina',
    'ardit',
    'despina',
    'thanasis',
    'nefeli',
    'yannis',
  ],
});
