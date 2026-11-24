import { createSound } from '../../game-shell/sound';
import { ukAsset, ukStorageKey } from './country';

export { selectAmbience, type SoundEnvironment } from '../../game-shell/sound';
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
  asset: ukAsset,
  storageKey: ukStorageKey,
  voices: [
    'margaret',
    'priya',
    'ade',
    'helen',
    'dave',
    'rahman',
    'lina',
    'gareth',
    'jamie',
    'ka-ning-partner',
    'ka-ning-child',
    'yao-flatmate',
  ],
});
