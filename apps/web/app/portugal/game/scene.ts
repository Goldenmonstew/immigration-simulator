import type * as Phaser from 'phaser';
import * as ptGame from '@uk-immigration/game/pt';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { ptArt, ptAsset } from './country';
import {
  drawBoard,
  drawCalcada,
  drawCardTable,
  drawFacades,
  drawFestival,
  drawFountain,
  drawLaundry,
  drawMiradouro,
  drawRiver,
  drawSigns,
  drawTascaLantern,
  drawTram,
  drawTramStreet,
  drawTramWire,
} from './scene-art';
import type { PtKinds } from './shell';
import * as sound from './sound';

const ptScene: SceneCountry<PtKinds> = {
  game: ptGame,
  sound,
  art: ptArt,
  asset: ptAsset,
  // Season palettes for grass and trees: green rainy winters, lilac
  // jacarandas in late spring, gold autumn. Summer keeps the tileset's green.
  landscapes: {
    1: { grass: [96, 156, 96], trees: [70, 122, 82] },
    2: { grass: [110, 176, 100], trees: [170, 130, 214] },
    4: { grass: [150, 150, 86], trees: [202, 150, 72] },
  },
  animalRoutes: {
    cat: [
      { x: 27, y: 31 },
      { x: 33, y: 33 },
      { x: 34, y: 28 },
    ],
    duck: [
      { x: 6, y: 37 },
      { x: 14, y: 37 },
      { x: 14, y: 38 },
      { x: 6, y: 38 },
    ],
  },
};

const tramSpan = 56 * 16 + 60;

/** Andorinhas: azulejo walls, the yellow tram, the largo and the Tagus. */
export class TownScene extends SharedTownScene<PtKinds> {
  private nightProps?: Phaser.GameObjects.Graphics;
  private tram?: Phaser.GameObjects.Graphics;
  private moving?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<PtKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(ptScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    const pavement = own(this.add.graphics().setDepth(0.6));
    drawTramStreet(pavement);
    drawCalcada(pavement);
    const walls = own(this.add.graphics().setDepth(2));
    drawFacades(walls);
    drawSigns(walls);
    const street = own(this.add.graphics().setDepth(470));
    drawBoard(street);
    drawCardTable(street);
    drawMiradouro(street);
    this.nightProps = own(this.add.graphics().setDepth(560));
    this.tram = own(this.add.graphics().setDepth(14 * 16 + 19));
    this.moving = own(this.add.graphics().setDepth(496));
    const overhead = own(this.add.graphics().setDepth(1530));
    drawTramWire(overhead);
    drawLaundry(overhead);
  }
  protected resetScenery() {
    this.nightProps = this.tram = this.moving = undefined;
  }
  protected syncScenery() {
    const g = this.nightProps?.clear();
    if (!g) return;
    const { day } = this.view.state;
    const lit = day.minute >= 1080;
    drawTascaLantern(g, lit);
    if (day.festival) drawFestival(g, day.festival, lit);
  }
  protected updateScenery(time: number) {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const lit = this.view.state.day.minute >= 1080;
    const tram = this.tram?.clear();
    // The tram runs while the town is awake and waits at the stop otherwise.
    if (tram)
      drawTram(tram, reduced ? 12 * 16 : ((time / 45) % tramSpan) - 50, lit);
    const moving = this.moving?.clear();
    if (moving) {
      drawFountain(moving, time, reduced);
      drawRiver(moving, time, reduced);
    }
  }
}
