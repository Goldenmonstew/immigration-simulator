import type * as Phaser from 'phaser';
import * as auGame from '@uk-immigration/game/au';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { auArt, auAsset } from './country';
import {
  drawBarbecue,
  drawBathingBoxes,
  drawBeach,
  drawClothesline,
  drawCottage,
  drawFestival,
  drawGulls,
  drawJetty,
  drawMemorial,
  drawNoticeboard,
  drawPelican,
  drawPub,
  drawPubLights,
  drawRotunda,
  drawShowLights,
  drawSigns,
  drawSurfPatrol,
} from './scene-art';
import type { AuKinds } from './shell';
import * as sound from './sound';

const auScene: SceneCountry<AuKinds> = {
  game: auGame,
  sound,
  art: auArt,
  asset: auAsset,
  // Southern seasons for grass and trees: summer-dry gold, autumn street
  // trees, wattle-gold spring. Winter keeps the tileset's rain-fed green.
  landscapes: {
    1: { grass: [188, 176, 102], trees: [118, 146, 98] },
    2: { grass: [118, 158, 90], trees: [196, 128, 66] },
    4: { grass: [100, 178, 92], trees: [214, 184, 62] },
  },
  animalRoutes: {
    duck: [
      { x: 20, y: 35 },
      { x: 23, y: 35 },
      { x: 23, y: 36 },
      { x: 20, y: 36 },
    ],
    cat: [
      { x: 2, y: 23 },
      { x: 12, y: 23 },
    ],
  },
};

/** Wattle Bay: the beach, jetty, foreshore lawn and town days. */
export class TownScene extends SharedTownScene<AuKinds> {
  private nightProps?: Phaser.GameObjects.Graphics;
  private glow?: Phaser.GameObjects.Graphics;
  private washing?: Phaser.GameObjects.Graphics;
  private gulls?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<AuKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(auScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    // Flat ground details sit just above the tiles; props sort by their row.
    const ground = own(this.add.graphics().setDepth(0.7));
    drawBeach(ground);
    drawJetty(ground);
    const row = (y: number) => own(this.add.graphics().setDepth(y * 16 + 20));
    drawPelican(row(38));
    drawBathingBoxes(row(32));
    drawSurfPatrol(row(32));
    drawCottage(row(10));
    drawPub(row(21));
    drawSigns(row(21));
    drawRotunda(row(27));
    drawMemorial(row(27));
    drawNoticeboard(row(26));
    drawBarbecue(row(29));
    this.washing = row(3);
    // Town-day decorations and lights change through the day.
    this.nightProps = own(this.add.graphics().setDepth(560));
    this.glow = own(this.add.graphics().setDepth(1550));
    this.gulls = own(this.add.graphics().setDepth(1400));
  }
  protected resetScenery() {
    this.nightProps = this.glow = this.washing = this.gulls = undefined;
  }
  protected syncScenery() {
    const g = this.nightProps?.clear();
    const lights = this.glow?.clear();
    if (!g || !lights) return;
    const { day } = this.view.state;
    const lit = day.minute >= 1080;
    drawClothesline(this.washing!.clear(), day.weather === 'sunny');
    if (lit) drawPubLights(lights);
    if (day.festival) {
      drawFestival(g, day.festival, lit);
      if (lit && day.festival === 'show-day') drawShowLights(lights);
    }
  }
  protected updateScenery(time: number) {
    const g = this.gulls?.clear();
    const { day } = this.view.state;
    if (!g || day.minute >= 1140 || day.weather === 'rain') return;
    drawGulls(
      g,
      time,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }
}
