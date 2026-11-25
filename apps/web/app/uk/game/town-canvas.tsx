'use client';

import { createTownCanvas } from '../../game-shell/town-canvas';
import { TownScene } from './scene';
import type { UkKinds } from './shell';

export type TownCanvasProps =
  import('../../game-shell/town-canvas').TownCanvasProps<UkKinds>;
export default createTownCanvas(TownScene);
