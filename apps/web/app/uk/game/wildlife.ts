import type { GameState } from '@uk-immigration/game';
import {
  animalFile,
  visibleAnimals as visibleIn,
  type Animal,
} from '../../game-shell/wildlife';
import { ukAsset } from './country';

export { animalStep, type Animal } from '../../game-shell/wildlife';
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
export const animalIds = Object.keys(animalRoutes) as Animal[];
export const animalPath = (id: Animal) => ukAsset(animalFile(id));
export const visibleAnimals = (state: GameState, interior: boolean) =>
  visibleIn(animalIds, state, interior);
