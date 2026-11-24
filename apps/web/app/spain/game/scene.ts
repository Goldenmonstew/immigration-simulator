import type * as Phaser from 'phaser';
import * as esGame from '@uk-immigration/game/es';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { esArt, esAsset } from './country';
import {
  drawAzulejos,
  drawBalconies,
  drawBeach,
  drawBoard,
  drawBoat,
  drawBonfireGlow,
  drawBunting,
  drawFestival,
  drawFlags,
  drawFountain,
  drawLifeguardTower,
  drawOrangeTrees,
  drawPalms,
  drawPharmacyCross,
  drawTerrace,
  drawUmbrellas,
} from './scene-art';
import type { EsKinds } from './shell';
import * as sound from './sound';

/** Palm cells, blocked in the town map's collision layer. */
const palms = [
  { x: 1, y: 32 },
  { x: 13, y: 32 },
  { x: 18, y: 32 },
  { x: 35, y: 32 },
  { x: 40, y: 32 },
  { x: 55, y: 32 },
];

const esScene: SceneCountry<EsKinds> = {
  game: esGame,
  sound,
  art: esArt,
  asset: esAsset,
  // Mediterranean seasons: mild green winters, fresh spring, sun-dried
  // autumn grass. Orange trees stay evergreen; summer keeps the tile colours.
  landscapes: {
    1: { grass: [112, 150, 96], trees: [66, 124, 62] },
    2: { grass: [96, 172, 96], trees: [78, 152, 70] },
    4: { grass: [158, 158, 92], trees: [92, 132, 60] },
  },
  animalRoutes: {
    // Ducks paddle along the allotments’ irrigation channel.
    duck: [
      { x: 52, y: 28 },
      { x: 52, y: 31 },
    ],
    cat: [
      { x: 3, y: 23 },
      { x: 12, y: 23 },
    ],
  },
};

/** Vilamar: balconies, azulejos, the square, the beach and the fiestas. */
export class TownScene extends SharedTownScene<EsKinds> {
  private season?: Phaser.GameObjects.Graphics;
  private festival?: Phaser.GameObjects.Graphics;
  private overhead?: Phaser.GameObjects.Graphics;
  private beachProps?: Phaser.GameObjects.Graphics;
  private glow?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<EsKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(esScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    drawBeach(own(this.add.graphics().setDepth(0.4)));
    drawBoat(own(this.add.graphics().setDepth(0.6)));
    const walls = own(this.add.graphics().setDepth(2));
    drawBalconies(walls);
    drawAzulejos(walls);
    drawFlags(walls);
    drawBoard(own(this.add.graphics().setDepth(10 + 30 * 16)));
    drawFountain(own(this.add.graphics().setDepth(10 + 30 * 16)));
    drawPalms(own(this.add.graphics().setDepth(10 + 33 * 16)), palms);
    drawLifeguardTower(own(this.add.graphics().setDepth(10 + 35 * 16)));
    // Season, time of day and fiesta details are redrawn as the day changes.
    this.season = own(this.add.graphics().setDepth(3));
    this.beachProps = own(this.add.graphics().setDepth(10 + 36 * 16));
    this.festival = own(this.add.graphics().setDepth(10 + 31 * 16));
    this.overhead = own(this.add.graphics().setDepth(1540));
    this.glow = own(this.add.graphics().setDepth(1545));
  }
  protected resetScenery() {
    this.season = this.festival = this.overhead = undefined;
    this.beachProps = this.glow = undefined;
  }
  protected syncScenery() {
    const season = this.season?.clear();
    if (!season) return;
    const { quarter, day } = this.view.state;
    const lit = day.minute >= 1140;
    drawOrangeTrees(season, quarter);
    drawTerrace(season, lit);
    drawPharmacyCross(season, lit);
    const beach = this.beachProps!.clear();
    if (quarter === 3 && day.weather !== 'rain') drawUmbrellas(beach);
    const festival = this.festival!.clear();
    const overhead = this.overhead!.clear();
    if (day.festival) {
      drawFestival(festival, day.festival, day.minute);
      drawBunting(overhead, day.festival);
    }
  }
  protected updateScenery(time: number) {
    const g = this.glow?.clear();
    const { day } = this.view.state;
    if (!g || day.festival !== 'sant-joan' || day.minute < 1200) return;
    drawBonfireGlow(
      g,
      time,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }
}
