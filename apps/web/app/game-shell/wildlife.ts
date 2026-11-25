import type { DayState, Quarter } from '@uk-immigration/game/core';

type Point = { x: number; y: number };
/** The animals drawn in meadow-town/animals; each walks its own map route. */
export type Animal = 'duck' | 'cat' | 'robin';
export type AnimalRoutes = Partial<Record<Animal, readonly Point[]>>;
export const animalFile = (id: Animal) =>
  `/assets/meadow-town/animals/${id}.svg`;
export function visibleAnimals(
  animalIds: readonly Animal[],
  state: { quarter: Quarter; day: Pick<DayState, 'minute' | 'weather'> },
  interior: boolean,
): Animal[] {
  if (interior) return [];
  const { minute, weather } = state.day;
  return animalIds.filter((id) => {
    if (id === 'duck')
      return state.quarter !== 1 && minute >= 420 && minute < 1140;
    if (weather === 'rain' || weather === 'snow') return false;
    if (id === 'cat') return minute >= 540 && minute < 1260;
    return state.quarter !== 3 && minute >= 420 && minute < 1020;
  });
}
// Animals yield to actors but never enter the town's collision or interaction lists.
export function animalStep(
  from: Point,
  target: Point,
  delta: number,
  occupied: Point[],
  reduced: boolean,
): Point {
  if (reduced) return from;
  const dx = target.x - from.x,
    dy = target.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (!distance) return from;
  const move = Math.min(distance, (9 * Math.min(delta, 50)) / 1000);
  const next = {
    x: from.x + (dx / distance) * move,
    y: from.y + (dy / distance) * move,
  };
  return occupied.some(
    (actor) => Math.hypot(actor.x - next.x, actor.y - next.y) < 20,
  )
    ? from
    : next;
}
