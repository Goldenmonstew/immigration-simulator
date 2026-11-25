import { createSound } from '../../game-shell/sound';
import { jpAsset, jpStorageKey } from './country';

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
  asset: jpAsset,
  storageKey: jpStorageKey,
  voices: ['yoshie', 'kenji', 'misaki', 'lan', 'daisuke', 'raj', 'sho', 'yuto'],
});
