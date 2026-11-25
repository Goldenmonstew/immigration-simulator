import { ukShell } from './shell';

// Barrel kept so existing imports of './game-view' keep working.
export * from '../../game-shell/game-ui';
export type { StateChange } from '../../game-shell/quarter-summary';
export const {
  CharacterSelect,
  ControlHint,
  InteractButton,
  StatusBar,
  ProgressBars,
  ProgressDetail,
  EffectHints,
  LocationMenu,
  EventNotes,
  VisaReminder,
  EventCard,
  QuarterSummary,
  LifeMemories,
  Ending,
} = ukShell;
