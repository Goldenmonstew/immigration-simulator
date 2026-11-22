import type { GameState } from '@uk-immigration/game';
import { asset } from '../../lib/asset';

type Point = { x: number; y: number };
export const animalRoutes = {
  duck: [
    { x: 23, y: 32 },
    { x: 25, y: 32 },
    { x: 25, y: 33 },
    { x: 23, y: 33 },
  ],
  cat: [
    { x: 12, y: 24 },
    { x: 15, y: 24 },
  ],
  robin: [
    { x: 46, y: 34 },
    { x: 48, y: 34 },
    { x: 48, y: 35 },
    { x: 46, y: 35 },
  ],
} as const;
export type Animal = keyof typeof animalRoutes;
export const animalIds = Object.keys(animalRoutes) as Animal[];
export const animalPath = (id: Animal) =>
  asset(`/game/assets/meadow-town/animals/${id}.svg`);
export function visibleAnimals(state: GameState, interior: boolean): Animal[] {
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
