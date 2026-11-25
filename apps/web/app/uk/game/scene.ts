import type * as Phaser from 'phaser';
import * as ukGame from '@uk-immigration/game';
import type { PlaceId } from '@uk-immigration/game';
import { t } from '../../../i18n';
import { distance, type Cell } from '../../game-shell/pathfinding';
import {
  TownScene as SharedTownScene,
  type Interaction,
  type SceneCountry,
  type SceneView as SharedSceneView,
} from '../../game-shell/scene';
import type { OwnWorldObject } from '../../game-shell/scene-map';
import { drawBonfire } from './scene-art';
import {
  createLifeScenery,
  decorateFestival,
  decorateLunch,
  syncLifeScenery,
  syncLunch,
  type LifeScenery,
  type LunchProp,
} from './scene-decor';
import { lifePlaceLabel, lunchVisible } from './scene-life';
import { ukArt, ukAsset } from './country';
import type { UkKinds } from './shell';
import * as sound from './sound';
import { animalRoutes } from './wildlife';

export type { Interaction, SceneFeedback } from '../../game-shell/scene';
export type SceneView = SharedSceneView<UkKinds>;

const ukScene: SceneCountry<UkKinds> = {
  game: ukGame,
  sound,
  art: ukArt,
  asset: ukAsset,
  landscapes: {
    1: { grass: [156, 170, 174], trees: [132, 148, 155] }, // Winter: cool grey.
    2: { grass: [91, 170, 91], trees: [147, 191, 68] }, // Spring: fresh green.
    4: { grass: [139, 146, 79], trees: [193, 126, 54] }, // Autumn: ochre foliage.
  },
  animalRoutes,
};

/** Meadow town with the lunch, flowerbed, May Day, surprises and bonfire. */
export class TownScene extends SharedTownScene<UkKinds> {
  private celebration?: Phaser.GameObjects.Graphics;
  private lunch: LunchProp[] = [];
  private lunchCells = new Set<string>();
  private lifeCells = new Set<string>();
  private lifeScenery?: LifeScenery;
  constructor(
    view: SceneView,
    onInteract: (i: Interaction) => void,
    onNearby: (i?: Interaction) => void,
    onReady: () => void,
    onStep: () => void,
    textLayer: HTMLDivElement,
  ) {
    super(ukScene, view, onInteract, onNearby, onReady, onStep, textLayer);
  }
  protected preloadScenery() {
    this.load.spritesheet(
      'lunch-furniture',
      ukAsset('/assets/indoor/tiles.png'),
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.image('lunch-meal', ukAsset('/assets/items/meal.png'));
    this.load.image('lunch-biscuits', ukAsset('/assets/items/biscuits.png'));
  }
  protected decorate(own: OwnWorldObject) {
    this.celebration = decorateFestival(
      this,
      this.view.state.day.festival,
      own,
    );
    this.lunch = decorateLunch(this, own);
    this.lifeScenery = createLifeScenery(this, own);
  }
  protected resetScenery() {
    this.celebration = undefined;
    this.lunch = [];
    this.lunchCells.clear();
    this.lifeCells.clear();
    this.lifeScenery = undefined;
  }
  protected syncScenery() {
    this.syncLifeScenery();
  }
  private syncLifeScenery() {
    if (!this.lifeScenery) return;
    ({ spots: this.spots, approachedSurprise: this.approachedSurprise } =
      syncLifeScenery(
        this,
        this.view,
        this.lifeScenery,
        this.anchors,
        this.lifeCells,
        this.spots,
        this.textLayer,
        this.own.bind(this),
        this.approachedSurprise,
      ));
  }
  protected syncProps() {
    syncLunch(this.view, this.lunch, this.lunchCells);
  }
  protected placeLabel(place: PlaceId, name: string) {
    const { state, locale, interior } = this.view;
    const contribution = state.flags.includes('quarter-community-lunch-tables')
      ? 'game.lunchTables'
      : state.flags.includes('quarter-community-lunch-food')
        ? 'game.lunchFood'
        : undefined;
    const lifeLabel = lifePlaceLabel(state, locale, place);
    return place === 'green' && lunchVisible(state, interior)
      ? `${t('game.lunchScene', locale)}${contribution ? `\n${t(contribution, locale)}` : ''}`
      : lifeLabel
        ? `${name}\n${lifeLabel}`
        : name;
  }
  protected blocked(cell: Cell) {
    return (
      this.lunchCells.has(`${cell.x}:${cell.y}`) ||
      this.lifeCells.has(`${cell.x}:${cell.y}`)
    );
  }
  protected updateScenery(time: number) {
    const g = this.celebration;
    if (!g) return;
    g.clear();
    if (this.view.state.day.minute < 1080) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    drawBonfire(g, time, reduced);
  }
  protected renderScenery() {
    for (const {
      drawing,
      label,
      clue,
    } of this.lifeScenery?.surprises.values() ?? [])
      if (clue.phase === 'trace')
        label.setVisible(
          drawing.visible &&
            distance(this.anchors.get(clue.anchor)!, this.cell) <= 5,
        );
  }
}
