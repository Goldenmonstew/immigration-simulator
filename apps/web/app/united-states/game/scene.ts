import type * as Phaser from 'phaser';
import * as usGame from '@uk-immigration/game/us';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { usArt, usAsset } from './country';
import {
  drawBandstand,
  drawBoard,
  drawElevated,
  drawFederalPlaza,
  drawFestival,
  drawFireworks,
  drawHotDogCart,
  drawLighthouse,
  drawMailbox,
  drawShore,
  drawTrain,
} from './scene-art';
import type { UsKinds } from './shell';
import * as sound from './sound';

const usScene: SceneCountry<UsKinds> = {
  game: usGame,
  sound,
  art: usArt,
  asset: usAsset,
  // Season palettes for grass and trees: snow and bare branches in winter,
  // crabapple blossom in spring, orange maples in autumn. Summer keeps the
  // tileset's green.
  landscapes: {
    1: { grass: [214, 222, 228], trees: [150, 128, 108] },
    2: { grass: [112, 180, 98], trees: [242, 206, 218] },
    4: { grass: [152, 152, 84], trees: [226, 124, 48] },
  },
  animalRoutes: {
    duck: [
      { x: 20, y: 36 },
      { x: 26, y: 36 },
      { x: 26, y: 37 },
      { x: 20, y: 37 },
    ],
    cat: [
      { x: 5, y: 24 },
      { x: 11, y: 24 },
    ],
    robin: [
      { x: 20, y: 28 },
      { x: 23, y: 28 },
    ],
  },
};

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lakebend: the L, the lakeshore and pier, and the park's festivals. */
export class TownScene extends SharedTownScene<UsKinds> {
  private nightProps?: Phaser.GameObjects.Graphics;
  private moving?: Phaser.GameObjects.Graphics;
  private fireworks?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<UsKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(usScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    drawShore(own(this.add.graphics().setDepth(0.6)));
    const street = own(this.add.graphics().setDepth(470));
    drawBandstand(street);
    drawBoard(street);
    drawMailbox(street);
    drawHotDogCart(street);
    drawFederalPlaza(street);
    // The L passes over people crossing underneath.
    drawElevated(own(this.add.graphics().setDepth(900)));
    // The lighthouse and festival lights, and the moving train.
    this.nightProps = own(this.add.graphics().setDepth(560));
    this.moving = own(this.add.graphics().setDepth(901));
    // Fireworks shine above the night sky.
    this.fireworks = own(this.add.graphics().setDepth(1540));
  }
  protected resetScenery() {
    this.nightProps = this.moving = this.fireworks = undefined;
  }
  protected syncScenery() {
    const g = this.nightProps?.clear();
    if (!g) return;
    const { day } = this.view.state;
    const lit = day.minute >= 1080;
    drawLighthouse(g, lit);
    if (day.festival) drawFestival(g, day.festival, lit);
  }
  protected updateScenery(time: number) {
    const g = this.moving?.clear();
    if (!g) return;
    const { day } = this.view.state;
    const reduced = reducedMotion();
    // A train every half minute; with reduced motion it waits at the station.
    const y = reduced ? 140 : ((time / 18) % 1440) - 180;
    drawTrain(g, y, day.minute >= 1080);
    const sky = this.fireworks?.clear();
    if (sky && day.festival === 'fourth-of-july' && day.minute >= 1230)
      drawFireworks(sky, time, reduced);
  }
}
