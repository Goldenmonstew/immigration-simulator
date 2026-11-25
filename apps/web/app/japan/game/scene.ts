import type * as Phaser from 'phaser';
import * as jpGame from '@uk-immigration/game/jp';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { jpArt, jpAsset } from './country';
import {
  drawBoard,
  drawFestival,
  drawIzakaya,
  drawNobori,
  drawNoren,
  drawPetals,
  drawShrine,
  drawStoneLanterns,
  drawTorii,
  drawVendingMachines,
} from './scene-art';
import type { JpKinds } from './shell';
import * as sound from './sound';

const jpScene: SceneCountry<JpKinds> = {
  game: jpGame,
  sound,
  art: jpArt,
  asset: jpAsset,
  // Season palettes for grass and trees: plum-grey winter, cherry-pink
  // spring, red-gold autumn maples. Summer keeps the tileset's green.
  landscapes: {
    1: { grass: [150, 160, 150], trees: [150, 130, 140] },
    2: { grass: [96, 172, 96], trees: [246, 176, 198] },
    4: { grass: [146, 150, 82], trees: [212, 96, 58] },
  },
  animalRoutes: {
    duck: [
      { x: 21, y: 36 },
      { x: 26, y: 36 },
      { x: 26, y: 37 },
      { x: 21, y: 37 },
    ],
    cat: [
      { x: 5, y: 23 },
      { x: 11, y: 23 },
    ],
  },
};

/** Minatozaka: the shrine, shopping-street details and seasonal festivals. */
export class TownScene extends SharedTownScene<JpKinds> {
  private nightProps?: Phaser.GameObjects.Graphics;
  private petals?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<JpKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(jpScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    const street = own(this.add.graphics().setDepth(470));
    drawShrine(street);
    drawStoneLanterns(street);
    drawBoard(street);
    drawNoren(street);
    drawNobori(street);
    // Lanterns, vending machines and festival lights change after dusk.
    this.nightProps = own(this.add.graphics().setDepth(560));
    drawTorii(own(this.add.graphics().setDepth(566)));
    this.petals = own(this.add.graphics().setDepth(1540));
  }
  protected resetScenery() {
    this.nightProps = this.petals = undefined;
  }
  protected syncScenery() {
    const g = this.nightProps?.clear();
    if (!g) return;
    const { day } = this.view.state;
    const lit = day.minute >= 1080;
    drawIzakaya(g, lit);
    drawVendingMachines(g, lit);
    if (day.festival) drawFestival(g, day.festival, lit);
  }
  protected updateScenery(time: number) {
    const g = this.petals?.clear();
    const { quarter, day } = this.view.state;
    if (!g || quarter !== 2 || day.weather === 'rain') return;
    drawPetals(
      g,
      time,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }
}
