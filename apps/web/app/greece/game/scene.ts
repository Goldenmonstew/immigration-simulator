import type * as Phaser from 'phaser';
import * as grGame from '@uk-immigration/game/gr';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { grArt, grAsset } from './country';
import {
  drawBalconies,
  drawChurch,
  drawFestival,
  drawHarbour,
  drawKiosk,
  drawMarket,
  drawStreetLife,
  drawTavernaLights,
  drawTerraces,
} from './scene-art';
import type { GrKinds } from './shell';
import * as sound from './sound';

const grScene: SceneCountry<GrKinds> = {
  game: grGame,
  sound,
  art: grArt,
  asset: grAsset,
  // Season palettes for grass and olive trees: green rainy winters, a lush
  // spring and a dry gold autumn. Summer keeps the tileset's green.
  landscapes: {
    1: { grass: [118, 158, 104], trees: [96, 132, 92] },
    2: { grass: [104, 176, 92], trees: [116, 160, 96] },
    4: { grass: [156, 160, 98], trees: [128, 142, 96] },
  },
  animalRoutes: {
    cat: [
      { x: 25, y: 33 },
      { x: 34, y: 33 },
    ],
  },
};

/** Limanaki: whitewashed walls, the harbour church, market and feasts. */
export class TownScene extends SharedTownScene<GrKinds> {
  private dayProps?: Phaser.GameObjects.Graphics;
  private glow?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<GrKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(grScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected preloadScenery() {
    this.load.image('town-tiles-greece', grAsset(grArt.tiles));
  }
  protected decorate(own: OwnWorldObject) {
    // Swap in the recoloured town tiles once; the shared map code reads the
    // `town-tiles` texture for every season.
    if (this.textures.exists('town-tiles-greece')) {
      this.textures.renameTexture('town-tiles', 'town-tiles-shared');
      this.textures.renameTexture('town-tiles-greece', 'town-tiles');
    }
    drawHarbour(own(this.add.graphics().setDepth(0.7)));
    drawBalconies(own(this.add.graphics().setDepth(186)));
    const street = own(this.add.graphics().setDepth(360));
    drawStreetLife(street);
    drawTerraces(street);
    drawChurch(own(this.add.graphics().setDepth(485)));
    drawKiosk(own(this.add.graphics().setDepth(536)));
    this.dayProps = own(this.add.graphics().setDepth(500));
    this.glow = own(this.add.graphics().setDepth(1555));
  }
  protected resetScenery() {
    this.dayProps = this.glow = undefined;
  }
  protected syncScenery() {
    const g = this.dayProps?.clear();
    const glow = this.glow?.clear();
    if (!g || !glow) return;
    const { day } = this.view.state;
    const lit = day.minute >= 1080;
    drawTavernaLights(lit ? glow : g, lit);
    if (day.kind === 'weekend' && day.minute < 870) drawMarket(g);
    if (day.festival) drawFestival(g, glow, day.festival, lit);
  }
}
