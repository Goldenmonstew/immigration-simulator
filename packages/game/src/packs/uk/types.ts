import type { GameTools } from '../../content-pack';
import type { GameState, FestivalId } from '../../types';
import type { UkEffect } from './effects';

export type UkTools = GameTools<
  GameState['timeline'],
  GameState['result'],
  UkEffect,
  FestivalId
>;
