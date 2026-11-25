import { createSound } from '../../game-shell/sound';
import { nzAsset, nzStorageKey } from './country';

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
  asset: nzAsset,
  storageKey: nzStorageKey,
  voices: [
    'mere',
    'bruce',
    'sione',
    'grace',
    'annelie',
    'nikau',
    'hamish',
    'aroha',
  ],
});
