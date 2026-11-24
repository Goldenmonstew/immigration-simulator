import type * as Phaser from 'phaser';
import * as nzGame from '@uk-immigration/game/nz';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { nzArt, nzAsset } from './country';
import {
  drawBeach,
  drawBlossom,
  drawBoard,
  drawCabbageTree,
  drawCafeTable,
  drawChippySign,
  drawDairySign,
  drawFestival,
  drawLetterbox,
  drawNightGlow,
  drawRugbyField,
  drawSheep,
  drawSurf,
  drawWharf,
  cabbageTrees,
} from './scene-art';
import type { NzKinds } from './shell';
import * as sound from './sound';

const nzScene: SceneCountry<NzKinds> = {
  game: nzGame,
  sound,
  art: nzArt,
  asset: nzAsset,
  // Southern seasons by quarter: sun-dried summer grass under deep green
  // pōhutukawa, golden autumn trees, fresh spring growth. Winter (quarter 3)
  // keeps the tileset's green, as the native bush stays green all year.
  landscapes: {
    1: { grass: [138, 170, 84], trees: [52, 118, 64] },
    2: { grass: [104, 156, 84], trees: [206, 150, 58] },
    4: { grass: [86, 182, 88], trees: [120, 178, 72] },
  },
  animalRoutes: {
    duck: [
      { x: 25, y: 37 },
      { x: 28, y: 37 },
      { x: 28, y: 38 },
      { x: 25, y: 38 },
    ],
    cat: [
      { x: 3, y: 23 },
      { x: 11, y: 23 },
    ],
    robin: [
      { x: 29, y: 29 },
      { x: 33, y: 29 },
    ],
  },
};

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Kererū Bay: the beach and wharf, the sheep paddock and the domain. */
export class TownScene extends SharedTownScene<NzKinds> {
  private seasonal?: Phaser.GameObjects.Graphics;
  private moving?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<NzKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(nzScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    // Over the ground tiles and water shimmer, under benches, trees and lamps.
    const ground = own(this.add.graphics().setDepth(0.6));
    drawBeach(ground);
    drawWharf(ground);
    drawRugbyField(ground);
    // Street props sort with walkers by the map row they stand on.
    const row = (y: number) => own(this.add.graphics().setDepth(10 + y * 16));
    drawLetterbox(row(11));
    drawDairySign(row(21));
    drawChippySign(row(21));
    drawCafeTable(row(22));
    drawBoard(row(32));
    for (const tree of cabbageTrees) drawCabbageTree(row(tree[1]), tree);
    // Blossom, festivals and night lights change with the day.
    this.seasonal = own(this.add.graphics().setDepth(560));
    // Surf and grazing sheep move every frame.
    this.moving = own(this.add.graphics().setDepth(2));
  }
  protected resetScenery() {
    this.seasonal = this.moving = undefined;
  }
  protected syncScenery() {
    const g = this.seasonal?.clear();
    if (!g) return;
    const { day, quarter } = this.view.state;
    const lit = day.minute >= 1080;
    drawBlossom(g, quarter);
    drawNightGlow(g, lit);
    if (day.festival) drawFestival(g, day.festival, lit);
  }
  protected updateScenery(time: number) {
    const g = this.moving?.clear();
    if (!g) return;
    const reduced = reducedMotion();
    drawSurf(g, time, reduced);
    drawSheep(g, time, this.view.state.quarter, reduced);
  }
}
