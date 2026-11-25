import type * as Phaser from 'phaser';
import * as caGame from '@uk-immigration/game/ca';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { caArt, caAsset } from './country';
import {
  drawBeam,
  drawBoard,
  drawFerry,
  drawFestival,
  drawFireworks,
  drawFlagpole,
  drawHospitalSign,
  drawLighthouse,
  drawLobsterBoat,
  drawLobsterTraps,
  drawMuskokaChairs,
  drawPlanks,
  drawRoofSnow,
  drawRowHouses,
  drawWelcomeBunting,
} from './scene-art';
import type { CaKinds } from './shell';
import * as sound from './sound';

const caScene: SceneCountry<CaKinds> = {
  game: caGame,
  sound,
  art: caArt,
  asset: caAsset,
  // Season palettes for grass and trees: snow and dark spruce in winter,
  // fresh green in spring, red maples in autumn. Summer keeps the tileset.
  landscapes: {
    1: { grass: [226, 232, 236], trees: [92, 122, 104] },
    2: { grass: [98, 176, 92], trees: [126, 186, 82] },
    4: { grass: [152, 150, 84], trees: [214, 78, 46] },
  },
  animalRoutes: {
    duck: [
      { x: 32, y: 37 },
      { x: 38, y: 37 },
      { x: 38, y: 38 },
      { x: 32, y: 38 },
    ],
    cat: [
      { x: 4, y: 13 },
      { x: 11, y: 13 },
    ],
  },
};

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Maple Harbour: row houses, the wharf, the lighthouse and the holidays. */
export class TownScene extends SharedTownScene<CaKinds> {
  private nightProps?: Phaser.GameObjects.Graphics;
  private snow?: Phaser.GameObjects.Graphics;
  private harbour?: Phaser.GameObjects.Graphics;
  private lighthouse?: Phaser.GameObjects.Graphics;
  private overlay?: Phaser.GameObjects.Graphics;
  constructor(
    view: SceneView<CaKinds>,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(caScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected decorate(own: OwnWorldObject) {
    drawPlanks(own(this.add.graphics().setDepth(0.6)));
    const fronts = own(this.add.graphics().setDepth(2.5));
    drawRowHouses(fronts);
    drawHospitalSign(fronts);
    drawWelcomeBunting(fronts);
    drawLobsterBoat(own(this.add.graphics().setDepth(3)));
    drawFlagpole(own(this.add.graphics().setDepth(176)), 806, 176, 72);
    drawFlagpole(own(this.add.graphics().setDepth(496)), 566, 496, 452);
    drawBoard(own(this.add.graphics().setDepth(528)));
    drawMuskokaChairs(own(this.add.graphics().setDepth(556)));
    drawLobsterTraps(own(this.add.graphics().setDepth(592)));
    this.snow = own(this.add.graphics().setDepth(2.6));
    this.harbour = own(this.add.graphics().setDepth(3));
    // Festival set pieces, the lighthouse and its lantern change after dusk.
    this.nightProps = own(this.add.graphics().setDepth(470));
    this.lighthouse = own(this.add.graphics().setDepth(614));
    this.overlay = own(this.add.graphics().setDepth(1540));
  }
  protected resetScenery() {
    this.nightProps = this.snow = this.harbour = undefined;
    this.lighthouse = this.overlay = undefined;
  }
  protected syncScenery() {
    const { day, quarter } = this.view.state;
    const g = this.nightProps?.clear();
    const snow = this.snow?.clear();
    const lighthouse = this.lighthouse?.clear();
    if (!g || !snow || !lighthouse) return;
    const lit = day.minute >= 1080;
    if (day.festival) drawFestival(g, day.festival, lit);
    drawLighthouse(lighthouse, lit);
    if (quarter === 1)
      drawRoofSnow(
        snow,
        this.spots
          .filter(
            (spot) =>
              spot.interaction.kind === 'place' && spot.bounds.width > 16,
          )
          .map((spot) => spot.bounds),
      );
  }
  protected updateScenery(time: number) {
    const harbour = this.harbour?.clear();
    const sky = this.overlay?.clear();
    if (!harbour || !sky) return;
    const reduced = reducedMotion();
    drawFerry(harbour, time, reduced);
    const { day } = this.view.state;
    if (day.minute >= 1140) drawBeam(sky, time, reduced);
    if (day.festival === 'canada-day' && day.minute >= 1260)
      drawFireworks(sky, time, reduced);
  }
}
