import type { ReactNode } from 'react';
import type {
  Achievement,
  Character,
  CharacterProfile,
  Festival,
  GameState,
  Item,
  MapSurprise,
  Npc,
  Place,
  Recipe,
  Text,
  createGame,
} from '@uk-immigration/game/core';
import type { Locale } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import type { GameCountryId } from '../../lib/game-country';
import type { SoundEnvironment, SoundKind } from './sound';

/** The type parameters of one country's content pack. */
export interface GameKinds {
  timeline: unknown;
  result: unknown;
  effect: { type: string };
  rule: string;
  decision: string;
  festival: string;
}

export type State<K extends GameKinds> = GameState<
  K['timeline'],
  K['result'],
  K['festival']
>;

/**
 * The engine bound to a content pack, plus the pack's lists. Countries pass a
 * module namespace; the shell always calls through it, so test spies apply.
 */
export type GameModule<K extends GameKinds> = ReturnType<
  typeof createGame<
    K['timeline'],
    K['result'],
    K['effect'],
    K['rule'],
    K['decision'],
    K['festival']
  >
> & {
  characters: readonly CharacterProfile[];
  loadCharacter(id: string): Promise<unknown>;
  characterOf(
    id: string,
  ): Character<K['timeline'], K['effect'], K['result'], K['festival']>;
  places: readonly Place[];
  npcs: readonly Npc<K['festival']>[];
  items: readonly Item[];
  recipes: readonly Recipe[];
  festivals: readonly Festival<K['festival']>[];
  achievements: readonly Achievement<
    K['timeline'],
    K['result'],
    K['festival']
  >[];
  mapSurprises?(state: State<K>): MapSurprise[];
};

export interface SoundModule {
  playSound(kind: SoundKind, npc?: string): void;
  hideSound(value: boolean): void;
  readMuted(): boolean;
  setMuted(value: boolean): void;
  setSoundSeason(quarter: number, festival: boolean): void;
  stopSound(): void;
  unlockSound(): void;
  setSoundEnvironment(value: SoundEnvironment): void;
}

/** Asset paths relative to the country's art root. */
export interface GameArt {
  root: string;
  /** Folder with the banner, portraits and signs. */
  town: string;
  townMap: string;
  homeMap: string;
  defaultResident: string;
  /** People with their own portrait and walking sprite files. */
  residents: string[];
  /** Characters drawn with another resident's files. */
  cast?: Record<string, string>;
  shopSigns: string[];
  crops: string[];
}

export interface VisaStatus {
  months: number;
  renewed: boolean;
  validTo?: string;
}

type Translate = (key: TranslationKey) => string;

/** Everything country specific that the shared game client needs. */
export interface GameCountry<K extends GameKinds> {
  id: GameCountryId;
  game: GameModule<K>;
  /** The pack's evaluation, used again when the language changes. */
  evaluate(input: {
    date: string;
    timeline: K['timeline'];
    locale: Locale;
  }): K['result'];
  sound: SoundModule;
  art: GameArt;
  asset(path: string): string;
  storageKey(key: string): string;
  money(value: number): string;
  moneySymbol: string;
  /** Upper end of the money meter in the status bar. */
  moneyMeter: number;
  stats: readonly string[];
  /** Progress bars, in display order. */
  ruleColumns: readonly { id: K['rule']; label: TranslationKey }[];
  outcomeLabel(outcome: K['decision'], t: Translate): string;
  /** Requirements still unknown for one column, if the column lists them. */
  missingRules(state: State<K>, id: K['rule']): string[] | undefined;
  visaStatus(state: State<K>): VisaStatus;
  /** Completed trips abroad recorded in the timeline. */
  absences(state: State<K>): readonly { from: string; to: string }[];
  itemIcon(id: string): string;
  diaryText: { harvest: Text; catch: Text };
  /** The ending link to the country's result page with this timeline. */
  resultHref(state: State<K>): string;
  /** Assessment shown in the information place, such as the town hall. */
  assessment(state: State<K>, idPrefix: string): ReactNode;
  endingAssessment(state: State<K>, t: Translate, locale: Locale): ReactNode;
  progressDetail(state: State<K>, id: K['rule'], t: Translate): ReactNode;
  /** A status line for a place, such as a route's next step. */
  placeNote?(state: State<K>, place: string): Text | undefined;
  /** A different label and confirmation for an ending action. */
  endingActionText?(
    state: State<K>,
    actionId: string,
  ): { label: TranslationKey; confirm: TranslationKey } | undefined;
  /** Festival actions whose result waits for an interrupting call. */
  festivalCallResult?: { festival: K['festival']; actions: string[] };
  loadTownCanvas(): Promise<{
    default: React.ComponentType<import('./town-canvas').TownCanvasProps<K>>;
  }>;
}
