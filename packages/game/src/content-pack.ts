import type {
  Achievement,
  Activity,
  AnchorId,
  Character,
  CharacterProfile,
  EndingId,
  Festival,
  GameEvent,
  GameState,
  IsoDate,
  Item,
  ItemId,
  Locale,
  LogEntry,
  Npc,
  Outcome,
  Place,
  PlaceId,
  Progress,
  Quarter,
  Recipe,
  Text,
  Effect,
} from './model';
import type { defaultBalance } from './default-balance';

type CustomEffect = { type: string };

export interface GameTools<
  Timeline,
  Result,
  E extends CustomEffect,
  F extends string,
> {
  affordable(
    state: GameState<Timeline, Result, F>,
    effects: Effect<E>[],
  ): boolean;
  applyEffects(
    state: GameState<Timeline, Result, F>,
    effects: Effect<E>[],
  ): boolean;
  setFlags(state: GameState<Timeline, Result, F>, flags?: string[]): void;
  available(
    state: GameState<Timeline, Result, F>,
    event: GameEvent<E, F>,
  ): boolean;
  makePending(state: GameState<Timeline, Result, F>, id: string): boolean;
  recordLife(
    state: GameState<Timeline, Result, F>,
    id: string,
    text: Text,
  ): void;
  random(state: GameState<Timeline, Result, F>): number;
}

export interface EvaluationAdapter<
  Timeline,
  Result,
  E extends CustomEffect,
  RuleId extends string,
  Decision extends string,
  F extends string,
> {
  evaluate(input: {
    date: IsoDate;
    timeline: Timeline;
    locale: Locale;
  }): Result;
  progress(state: GameState<Timeline, Result, F>): Progress<RuleId, Decision>;
  endingForResult?(result: Result): EndingId | undefined;
  route?(state: GameState<Timeline, Result, F>): string | undefined;
  visaMonthsLeft?(state: GameState<Timeline, Result, F>): number;
  canTravel?(state: GameState<Timeline, Result, F>, through: IsoDate): boolean;
  recordAbsence?(
    state: GameState<Timeline, Result, F>,
    trip: { from: IsoDate; to: IsoDate },
  ): void;
  /** Update any country-specific income records and return annual household earnings. */
  earnings?(state: GameState<Timeline, Result, F>): number;
  /** Return whether a promotion was recorded. */
  promote?(state: GameState<Timeline, Result, F>, multiplier: number): boolean;
  /** Record any lapse in permission between the old and new quarter. */
  expired?(
    state: GameState<Timeline, Result, F>,
    previousDate: IsoDate,
  ): boolean;
  /** Handle pack effects using names distinct from TownEffect. Return true to refresh evaluation. */
  applyEffect?(
    state: GameState<Timeline, Result, F>,
    effect: E,
    tools: GameTools<Timeline, Result, E, F>,
  ): boolean;
  afterEffects?(state: GameState<Timeline, Result, F>): boolean;
}

type Notice = { id: string; text: Text; season?: Quarter };

export interface GameContentPack<
  Timeline,
  Result,
  E extends CustomEffect = never,
  RuleId extends string = string,
  Decision extends string = string,
  F extends string = string,
> {
  characters: readonly CharacterProfile[];
  loadCharacter(id: string): Promise<Character<Timeline, E, Result, F>>;
  characterOf(id: string): Character<Timeline, E, Result, F>;
  home?: PlaceId;
  places: readonly Place[];
  actions: readonly Activity<E, F>[];
  informationAction?: { id: string; place: PlaceId };
  npcs?: readonly Npc<F>[];
  events?: readonly GameEvent<E, F>[];
  systemEvents?: readonly GameEvent<E, F>[];
  datedEvents?: readonly {
    event: GameEvent<E, F>;
    character?: string;
    published: IsoDate;
    until: IsoDate;
  }[];
  heartEvents?: readonly GameEvent<E, F>[];
  letters?: readonly GameEvent<E, F>[];
  extraEvents?: readonly GameEvent<E, F>[];
  items?: readonly Item[];
  recipes?: readonly Recipe[];
  festivals?: readonly Festival<F>[];
  notices?: readonly Notice[];
  achievements?: readonly Achievement<Timeline, Result, F>[];
  lifeAchievements?: readonly Achievement<Timeline, Result, F>[];
  balance?: Partial<typeof defaultBalance>;
  rules: EvaluationAdapter<Timeline, Result, E, RuleId, Decision, F>;
  endingText(state: GameState<Timeline, Result, F>, ending: EndingId): Text;
  calendar?(state: GameState<Timeline, Result, F>): {
    date: IsoDate;
    festival?: F;
  };
  eventAvailable?(
    state: GameState<Timeline, Result, F>,
    event: GameEvent<E, F>,
  ): boolean;
  randomEvent?(
    state: GameState<Timeline, Result, F>,
    event: GameEvent<E, F>,
  ): boolean;
  eventView?(
    state: GameState<Timeline, Result, F>,
    event: GameEvent<E, F>,
  ): GameEvent<E, F>;
  afterChoice?(
    before: GameState<Timeline, Result, F>,
    state: GameState<Timeline, Result, F>,
    event: GameEvent<E, F>,
    choiceId: string,
    tools: GameTools<Timeline, Result, E, F>,
  ): Text | undefined;
  actionVenue?(
    state: GameState<Timeline, Result, F>,
    action: Activity<E, F>,
  ): Activity<E, F>;
  actionAvailable?(
    state: GameState<Timeline, Result, F>,
    action: Activity<E, F>,
    tools: GameTools<Timeline, Result, E, F>,
  ): boolean | undefined;
  actionDetails?(
    state: GameState<Timeline, Result, F>,
    action: Activity<E, F>,
  ): void;
  actionFlags?(action: Activity<E, F>): string[] | undefined;
  beforeAction?(
    state: GameState<Timeline, Result, F>,
    action: Activity<E, F>,
  ): void;
  afterAction?(
    before: GameState<Timeline, Result, F>,
    state: GameState<Timeline, Result, F> & { outcome: Outcome },
    action: Activity<E, F>,
    log: LogEntry,
    tools: GameTools<Timeline, Result, E, F>,
  ): void;
  afterActionAwards?(
    before: GameState<Timeline, Result, F>,
    state: GameState<Timeline, Result, F> & { outcome: Outcome },
    action: Activity<E, F>,
    log: LogEntry,
    tools: GameTools<Timeline, Result, E, F>,
  ): void;
  afterQuarter?(
    state: GameState<Timeline, Result, F>,
    previousFlags: string[],
    tools: GameTools<Timeline, Result, E, F>,
  ): void;
  quarterEffects?(played: number): Effect<E>[];
  routine?(
    state: () => GameState<Timeline, Result, F>,
    run: (id: string, place: PlaceId, minute: number) => void,
  ): void;
  surpriseAt?(
    state: GameState<Timeline, Result, F>,
    anchor: AnchorId,
  ): GameEvent<E, F> | undefined;
  npcAvailable?(state: GameState<Timeline, Result, F>, npc: Npc<F>): boolean;
  lineAvailable?(
    state: GameState<Timeline, Result, F>,
    npc: string,
    line: Npc<F>['lines'][number],
  ): boolean;
  priorityLine?(
    state: GameState<Timeline, Result, F>,
    lines: Npc<F>['lines'],
    tools: GameTools<Timeline, Result, E, F>,
  ): Npc<F>['lines'][number] | undefined;
  shopStock?(state: GameState<Timeline, Result, F>, place: PlaceId): Item[];
  catchItem?(
    state: GameState<Timeline, Result, F>,
    tools: GameTools<Timeline, Result, E, F>,
  ): { item: ItemId; junk: boolean };
  ledgerText?(state: GameState<Timeline, Result, F>): Text;
}
