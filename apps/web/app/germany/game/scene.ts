import type * as Phaser from 'phaser';
import * as deGame from '@uk-immigration/game/de';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { deArt, deAsset } from './country';
import {
  drawAllotment,
  drawBeerGarden,
  drawCanal,
  drawColumn,
  drawFestival,
  drawFountain,
  drawHouseboat,
  drawShopfronts,
  drawStation,
  drawStreet,
  drawTram,
  drawWeekendMarket,
} from './scene-art';
import type { DeKinds } from './shell';
import * as sound from './sound';

const deScene: SceneCountry<DeKinds> = {
  game: deGame,
  sound,
  art: deArt,
  asset: deAsset,
  // Season palettes for grass and lindens: grey winter with bare trees,
  // fresh spring green, golden autumn. Summer keeps the tileset's green.
  landscapes: {
    1: { grass: [140, 150, 140], trees: [128, 112, 98] },
    2: { grass: [110, 182, 100], trees: [156, 206, 112] },
    4: { grass: [150, 150, 88], trees: [228, 170, 62] },
  },
  animalRoutes: {
    duck: [
      { x: 20, y: 26 },
      { x: 32, y: 26 },
      { x: 32, y: 27 },
      { x: 20, y: 27 },
    ],
    cat: [
      { x: 3, y: 23 },
      { x: 11, y: 23 },
    ],
    robin: [
      { x: 44, y: 33 },
      { x: 52, y: 33 },
    ],
  },
};

/** Lindenufer: the canal, tram, market square and seasonal festivals. */
export class TownScene extends SharedTownScene<DeKinds> {
  private nightProps?: Phaser.GameObjects.Graphics;
  private garden?: Phaser.GameObjects.Graphics;
  private festival?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<DeKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(deScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    // Rails, embankments and the fountain lie flat under everyone's feet.
    const ground = own(this.add.graphics().setDepth(1.5));
    drawTram(ground);
    drawCanal(ground);
    drawFountain(ground);
    drawStreet(own(this.add.graphics().setDepth(195)));
    drawColumn(own(this.add.graphics().setDepth(501)));
    drawStation(own(this.add.graphics().setDepth(600)));
    // Lights in the boat, shops, beer garden and festivals change after dusk.
    this.nightProps = own(this.add.graphics().setDepth(385));
    this.garden = own(this.add.graphics().setDepth(580));
    this.festival = own(this.add.graphics().setDepth(545));
  }
  protected resetScenery() {
    this.nightProps = this.garden = this.festival = undefined;
  }
  protected syncScenery() {
    const g = this.nightProps?.clear();
    if (!g) return;
    const { day, quarter } = this.view.state;
    const lit = day.minute >= 1080;
    drawHouseboat(g, lit);
    drawShopfronts(g, lit);
    drawBeerGarden(g, lit);
    drawAllotment(this.garden!.clear(), quarter === 3);
    const festival = this.festival!.clear();
    if (day.festival) drawFestival(festival, day.festival, lit);
    else if (day.kind === 'weekend' && !lit) drawWeekendMarket(festival);
  }
}
