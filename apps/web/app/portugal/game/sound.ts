import { createSound } from '../../game-shell/sound';
import { ptAsset, ptStorageKey } from './country';

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
  asset: ptAsset,
  storageKey: ptStorageKey,
  voices: [
    'fatima',
    'joaquim',
    'ines',
    'sunita',
    'rui',
    'mariana',
    'thiago',
    'duarte',
    'miguel',
  ],
});
