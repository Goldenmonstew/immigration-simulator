import type { PersonTimeline, SimulationResult } from '@uk-immigration/engine';
import type { UkEffect } from './packs/uk/effects';
import type * as Model from './model';

export type * from './model';

export type StatKey = 'money' | 'mood' | 'health' | 'english' | 'career';
export type FestivalId =
  | 'lunar-new-year'
  | 'may-day'
  | 'summer-fair'
  | 'bonfire-night'
  | 'christmas-market';

export type GameState<
  Timeline = PersonTimeline,
  Result = SimulationResult,
  F extends string = FestivalId,
> = Model.GameState<Timeline, Result, F>;
export type DayState<F extends string = FestivalId> = Model.DayState<F>;
export type Festival<F extends string = FestivalId> = Model.Festival<F>;
export type Condition<F extends string = FestivalId> = Model.Condition<F>;
export type Npc<F extends string = FestivalId> = Model.Npc<F>;
export type Effect<E extends { type: string } = UkEffect> = Model.Effect<E>;
export type Choice<E extends { type: string } = UkEffect> = Model.Choice<E>;
export type GameEvent<
  E extends { type: string } = UkEffect,
  F extends string = FestivalId,
> = Model.GameEvent<E, F>;
export type Activity<
  E extends { type: string } = UkEffect,
  F extends string = FestivalId,
> = Model.Activity<E, F>;
export type Achievement<
  Timeline = PersonTimeline,
  Result = SimulationResult,
  F extends string = FestivalId,
> = Model.Achievement<Timeline, Result, F>;
export type Character<
  Timeline = PersonTimeline,
  E extends { type: string } = UkEffect,
  Result = SimulationResult,
  F extends string = FestivalId,
> = Model.Character<Timeline, E, Result, F> & {
  graduateRoute?: {
    recruitment: GameEvent<E, F>[];
    salaryCheckNote: Model.Text;
    switched: Model.Text;
    overstayed: Model.Text;
  };
};
