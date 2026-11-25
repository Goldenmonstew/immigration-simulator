import { ukShell } from './shell';

export type { GameSave } from '../../game-shell/session';
export { gameDraft, itemIcon, visaStatus } from './shell';
export const {
  visibleResidents,
  homeSpot,
  isPlaceOpen,
  withGameLocale,
  statKeys,
  spritePath,
  cropIds,
  endingMemories,
  needsVisaReminder,
  visaExpiresThisSeason,
  hasKnownEvents,
  previewGameSave,
  gameStorage,
} = ukShell;
