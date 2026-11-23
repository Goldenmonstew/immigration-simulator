export type IsoDate = string;
export type Locale = 'zh-CN' | 'en';

export type Text = { zhCN: string; en: string };
export type LocationId = string;
export type EndingId =
  'settled' | 'left' | 'overstayed' | 'criminal' | 'timeout';
/** Calendar quarters: 1 winter, 2 spring, 3 summer, 4 autumn. */
export type Quarter = 1 | 2 | 3 | 4;
export interface CharacterProfile {
  id: string;
  name: Text;
  intro: Text;
  /** Relative to the client's game asset directory. */
  sprite: string;
}

export interface Character<
  Timeline = unknown,
  CustomEffect extends { type: string } = never,
  Result = unknown,
  FestivalKey extends string = string,
> extends CharacterProfile {
  opening: GameEvent<CustomEffect, FestivalKey>;
  settlement: Text;
  startDate: IsoDate;
  timeline: Timeline;
  stats: Record<string, number>;
  events: GameEvent<CustomEffect, FestivalKey>[];
  achievements?: Achievement<Timeline, Result, FestivalKey>[];
}
export interface GameEvent<
  CustomEffect extends { type: string } = never,
  FestivalKey extends string = string,
> {
  id: string;
  title: Text;
  text: Text;
  weight: number;
  season?: Quarter;
  once?: boolean;
  requires?: string[];
  forbids?: string[];
  when?: Condition<FestivalKey>[];
  choices: Choice<CustomEffect>[];
  channel?: Channel;
  speaker?: NpcId;
  heart?: { npc: NpcId; hearts: number };
}
export interface Choice<CustomEffect extends { type: string } = never> {
  id: string;
  label: Text;
  effects: Effect<CustomEffect>[];
  sets?: string[];
  note?: Text;
}
/** Conditions within an array are ANDed; year is the one-based game year. */
export type V2Condition =
  | { stat: string; min?: number; max?: number }
  | { yearMin?: number; yearMax?: number }
  | { route: string }
  | { flag: string }
  | { visaMonthsLeftMax: number };
export type TownEffect =
  | { type: 'stat'; key: string; delta: number }
  | { type: 'money'; delta: number }
  | { type: 'ending'; ending: EndingId }
  | { type: 'none' }
  | { type: 'item'; item: ItemId; delta: number }
  | { type: 'friendship'; npc: NpcId; delta: number };
export type Effect<CustomEffect extends { type: string } = never> =
  TownEffect | CustomEffect;
export interface Achievement<
  Timeline = unknown,
  Result = unknown,
  FestivalKey extends string = string,
> {
  id: string;
  name: Text;
  description: Text;
  check: (state: GameState<Timeline, Result, FestivalKey>) => boolean;
}
export type SettlementSource =
  | 'seasonWear'
  | 'overtimeWear'
  | 'brighterHome'
  | 'walkingClub'
  | 'furnishings';
export type LogEntry = {
  year: number;
  quarter: Quarter;
  kind: 'action' | 'event' | 'quarter' | 'ending';
  id: string;
  choiceId?: string;
  text: Text;
  statDeltas?: Partial<Record<string, number>>;
  renewalValidTo?: IsoDate;
  // Quarter entries from older saves may have neither field.
  wellbeing?: { source: SettlementSource; mood: number; health: number }[];
  clearedPlots?: number;
};
export interface LifeRecord {
  itemId: ItemId;
  year: number;
  quarter: Quarter;
  /** Saved with first catches and first dishes. Earlier records omit it. */
  memory?: { place: 'pond' | 'home'; weather: Weather };
}
export interface LifeRecords {
  /** First actual catch of each fish; buying or receiving does not count. */
  fish: LifeRecord[];
  /** First actual cooking of each output item, not recipe or inventory ids. */
  dishes: LifeRecord[];
  /** One entry per harvest action, including repeated crops. */
  harvests: LifeRecord[];
}
export interface GameState<
  Timeline = unknown,
  Result = unknown,
  FestivalKey extends string = string,
> {
  version: 3;
  characterId: string;
  /** Initial seed, unchanged throughout play. */
  seed: number;
  locale: Locale;
  /** One-based game year, 1–10; four elapsed quarters per game year. */
  year: number;
  quarter: Quarter;
  date: IsoDate;
  timeline: Timeline;
  stats: Record<string, number>;
  dayNumber: number;
  day: DayState<FestivalKey>;
  inventory: Record<ItemId, number>;
  /** Missing in earlier v3 saves; treat as empty, populated on the next record. */
  lifeRecords?: LifeRecords;
  /** Missing in earlier v3 saves; only explicit May Day actions populate it. */
  mayDay?: {
    year: number;
    preparation?: 'ribbons' | 'signs';
    participation?: 'dance' | 'guide';
    participationDay?: number;
    indoors?: boolean;
    followupSeen?: boolean;
  };
  /** Missing in earlier v3 saves; a resolved map encounter is never offered again. */
  surpriseRecords?: {
    id: SurpriseId;
    choiceId: string;
    dayNumber: number;
  }[];
  friendship: Record<NpcId, number>;
  plots: Plot[];
  heard: string[];
  outcome?: Outcome;
  /** A trip waiting for event choices; appended to absences only after return. */
  trip?: { from: IsoDate; to: IsoDate };
  flags: string[];
  firedEvents: string[];
  pendingEvent?: string;
  /**
   * The result of the action a pending event interrupted, to show once the
   * event is resolved; kept in the save so a reload still shows it.
   */
  interruptedOutcome?: { actionId: string; text: Text };
  /** Remaining scheduled events; rechecked when promoted to pendingEvent. */
  eventQueue: string[];
  /** Serializable mulberry32 cursor, so restoring JSON preserves the stream. */
  randomState: number;
  log: LogEntry[];
  result: Result;
  ending?: EndingId;
  /** Savings before the in-game settlement application fee was charged. */
  settlementApplication?: { cashSavings?: number };
  achievements: string[];
}
export type Progress<
  RuleId extends string = string,
  Outcome extends string = string,
> = Record<
  RuleId,
  {
    outcome: Outcome;
    earliestDate?: IsoDate;
    /** Elapsed residence / engine earliest-date interval, clamped to 0–100. */
    percent: number;
  }
>;

export type DayKind = 'workday' | 'weekend' | 'special';
export type Weather = 'sunny' | 'cloudy' | 'rain' | 'snow';
export type PlaceId = LocationId;
export type AnchorId =
  | 'home-street'
  | 'high-street-west'
  | 'high-street-east'
  | 'bus-stop'
  | 'postbox'
  | 'park-bench'
  | 'park-pond'
  | 'park-path'
  | 'allotment-gate'
  | 'allotment-plots'
  | 'green-centre'
  | 'green-stall'
  | 'station-front'
  | 'college-steps'
  | 'pub-garden'
  | 'library-steps';
/** 'away': out of town for work or school. */
export type NpcLocation = PlaceId | AnchorId | 'away';
export type SurpriseId = 'biscuit-cat' | 'swap-box' | 'lost-mitten';
export interface MapSurprise {
  id: SurpriseId;
  phase: 'clue' | 'trace';
  anchor: AnchorId;
  text: Text;
  /** Clues expire at this minute on the current representative day. */
  expiresMinute?: number;
}
/** 'margaret' | 'priya' | 'ade' | 'helen' | 'dave' | 'rahman' | 'lina' | 'gareth' plus household ids. */
export type NpcId = string;
/** Seeds are `seed-<crop>`; the client maps unknown ids to a fallback icon. */
export type ItemId = string;
export type Channel =
  'morning' | 'letter' | 'phone' | `npc:${NpcId}` | `place:${PlaceId}`;

export interface Place {
  id: PlaceId;
  name: Text;
  kind: 'building' | 'outdoor';
  hours?: { opens: number; closes: number; dayKinds?: DayKind[] }; // minutes since midnight
}
/** Replaces LocationAction. v2 ids stay where the action survives:
 *  rest, work, overtime, class, exam, gp, relax, assessment, extend, settle,
 *  travel-1, travel-3, travel-6, leave. */
export interface Activity<
  CustomEffect extends { type: string } = never,
  FestivalKey extends string = string,
> {
  id: string;
  place: PlaceId;
  label: Text;
  note?: Text;
  minutes: number;
  effects: Effect<CustomEffect>[];
  when?: Condition<FestivalKey>[];
  oncePerDay?: boolean;
}
export type Condition<FestivalKey extends string = string> =
  | V2Condition
  | { dayKind: DayKind }
  | { weather: Weather }
  | { festival: FestivalKey }
  | { npc: NpcId; heartsMin?: number; heartsMax?: number }
  | { item: ItemId; min?: number }
  | { minuteMin?: number; minuteMax?: number };
export interface Npc<FestivalKey extends string = string> {
  id: NpcId;
  name: Text;
  role: Text;
  characters?: string[]; // household members appear only for these characters
  /** First matching rule wins; stops are sorted by minute. */
  schedule: {
    dayKinds?: DayKind[];
    weather?: Weather[];
    festival?: boolean;
    when?: Condition<FestivalKey>[];
    stops: { from: number; at: NpcLocation }[];
  }[];
  gifts: { loved: ItemId[]; liked: ItemId[]; disliked: ItemId[] };
  reactions: Record<'loved' | 'liked' | 'neutral' | 'disliked', Text>;
  lines: {
    id: string;
    text: Text;
    heartsMin?: number;
    heartsMax?: number;
    season?: Quarter;
    weather?: Weather[];
    dayKinds?: DayKind[];
    festival?: FestivalKey;
    when?: Condition<FestivalKey>[];
    requires?: string[];
    forbids?: string[];
    once?: boolean;
  }[];
}
export interface Item {
  id: ItemId;
  name: Text;
  kind: 'seed' | 'crop' | 'fish' | 'food' | 'gift' | 'junk';
  price?: number; // shop price, game setting; nothing is sold back
  edible?: { mood?: number; health?: number };
  grows?: { crop: ItemId; days: number; seasons: Quarter[] };
}
export interface Recipe {
  id: string;
  label: Text;
  needs: Record<ItemId, number>;
  makes: ItemId;
  minutes: number;
}
export interface Festival<FestivalKey extends string = string> {
  id: FestivalKey;
  name: Text;
  season: Quarter;
  text: Text;
}
export interface Plot {
  seed?: ItemId;
  growth: number;
  wateredOn?: number;
} // wateredOn is a dayNumber
export interface DayState<FestivalKey extends string = string> {
  index: 0 | 1 | 2;
  kind: DayKind;
  date: IsoDate; // display and festival only; timeline effects still use state.date
  minute: number; // minutes since midnight: 420 at wake-up, never above 1440
  /** End time of an activity interrupted by a phone call. */
  resumeMinute?: number;
  weather: Weather;
  festival?: FestivalKey;
  place?: PlaceId;
  done: string[];
  talked: NpcId[];
  gifted: NpcId[];
  deliveries: { eventId: string; channel: Channel; minute?: number }[]; // undelivered events of this day
}
export type Outcome = {
  kind:
    | 'activity'
    | 'talk'
    | 'gift'
    | 'catch'
    | 'harvest'
    | 'cook'
    | 'buy'
    | 'eat'
    | 'sleep'
    | 'travel';
  npc?: NpcId;
  /** The location action that produced this outcome, if any. */
  actionId?: string;
  text?: Text;
  items?: Record<ItemId, number>;
  statDeltas?: Partial<Record<string, number>>;
};
