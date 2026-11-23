import * as Phaser from 'phaser';
import {
  items,
  mapSurprises,
  type AnchorId,
  type GameState,
  type MapSurprise,
  type SurpriseId,
  type Text,
} from '@uk-immigration/game';
import type { Cell } from './pathfinding';
import type { SceneView } from './scene';
import {
  drawFestivalStalls,
  drawFlowerbed,
  drawLunchTable,
  drawMayDay,
  drawSurprise,
} from './scene-art';
import { flowerbedStage, lunchVisible, mayDayScene } from './scene-life';
import { tileSize, type OwnWorldObject, type Spot } from './scene-map';
import { SceneText } from './scene-text';
import { cropIds } from './session';

export type LunchProp = {
  object: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics;
  requires?: 'tables' | 'food';
  cell?: Cell;
};

export type LifeScenery = {
  flowerbed: Phaser.GameObjects.Graphics;
  mayDay: Phaser.GameObjects.Graphics;
  surprises: Map<
    SurpriseId,
    {
      drawing: Phaser.GameObjects.Graphics;
      label: SceneText;
      clue: MapSurprise;
    }
  >;
};

const surpriseNames: Record<SurpriseId, Text> = {
  'biscuit-cat': { zhCN: '窗台下的条纹猫', en: 'A striped cat below the sill' },
  'swap-box': { zhCN: '台阶旁的交换箱', en: 'A swap box by the steps' },
  'lost-mitten': { zhCN: '长椅上的手套', en: 'A mitten on the bench' },
};

export function decorateFestival(
  scene: Phaser.Scene,
  festival: GameState['day']['festival'],
  own: OwnWorldObject,
) {
  if (!festival) return;
  const g = own(scene.add.graphics().setDepth(530));
  drawFestivalStalls(g, festival);
  if (festival === 'bonfire-night')
    return own(scene.add.graphics().setDepth(1560));
}

export function decorateLunch(scene: Phaser.Scene, own: OwnWorldObject) {
  const lunch: LunchProp[] = [];
  // South of the festival stalls, clear of the green's entrance and benches.
  const furniture = (
    x: number,
    y: number,
    frame: number,
    requires?: 'tables',
  ) => {
    const object = own(
      scene.add
        .sprite(x * tileSize + 8, y * tileSize + 8, 'lunch-furniture', frame)
        .setDepth(y * tileSize + tileSize),
    );
    lunch.push({ object, cell: { x, y }, requires });
  };
  for (const x of [32, 33, 34]) furniture(x, 34, 7);
  for (const x of [32, 34]) {
    furniture(x, 35, 8);
    furniture(x, 33, 8, 'tables');
  }
  const table = own(scene.add.graphics().setDepth(561));
  drawLunchTable(table);
  lunch.push({ object: table });
  const food = own(
    scene.add
      .sprite(536, 548, 'lunch-meal')
      .setDisplaySize(12, 12)
      .setDepth(562),
  );
  lunch.push({ object: food, requires: 'food' });
  return lunch;
}

export function createLifeScenery(
  scene: Phaser.Scene,
  own: OwnWorldObject,
): LifeScenery {
  return {
    flowerbed: own(scene.add.graphics().setDepth(575)),
    mayDay: own(scene.add.graphics().setDepth(540)),
    surprises: new Map(),
  };
}

export function syncLunch(
  { state, interior }: SceneView,
  lunch: LunchProp[],
  lunchCells: Set<string>,
) {
  const visible = lunchVisible(state, interior);
  lunchCells.clear();
  for (const { object, requires, cell } of lunch) {
    const shown =
      visible &&
      (!requires ||
        state.flags.includes(`quarter-community-lunch-${requires}`));
    object.setVisible(shown);
    if (shown && cell) lunchCells.add(`${cell.x}:${cell.y}`);
    if (shown && requires === 'food') {
      const biscuits = state.log.some(
        (entry) =>
          entry.kind === 'action' &&
          entry.year === state.year &&
          entry.quarter === state.quarter &&
          entry.id === 'community-lunch-biscuits',
      );
      (object as Phaser.GameObjects.Sprite).setTexture(
        biscuits ? 'lunch-biscuits' : 'lunch-meal',
      );
    }
  }
}

export function syncLifeScenery(
  scene: Phaser.Scene,
  { state, locale }: SceneView,
  scenery: LifeScenery,
  anchors: Map<string, Cell>,
  lifeCells: Set<string>,
  spots: Spot[],
  textLayer: HTMLDivElement,
  own: OwnWorldObject,
  approachedSurprise: AnchorId | undefined,
) {
  const en = locale === 'en';
  const stage = flowerbedStage(state.flags);
  const g = scenery.flowerbed.clear();
  lifeCells.clear();
  // A two-tile bed inside the allotment fence, beside the gate and below the plots.
  const gate = anchors.get('allotment-gate')!;
  const x = (gate.x + 1) * tileSize,
    y = gate.y * tileSize;
  if (stage)
    for (const dx of [0, 1]) lifeCells.add(`${gate.x + 1 + dx}:${gate.y}`);
  drawFlowerbed(g, x, y, stage, state.flags);
  const may = mayDayScene(state);
  const m = scenery.mayDay.clear().setVisible(!!may);
  if (may) {
    const anchor = anchors.get(may.venue)!;
    const indoors = may.venue === 'council';
    // The town hall has a window display on the town map, not a separate interior map.
    m.setPosition(
      anchor.x * tileSize + (indoors ? 8 : 38),
      anchor.y * tileSize + (indoors ? -12 : 9),
    );
    m.setDepth(indoors ? anchor.y * tileSize : anchor.y * tileSize + 16);
    const preparation =
      state.mayDay?.year === state.year ? state.mayDay.preparation : undefined;
    drawMayDay(m, may.phase, preparation);
  }
  const visible = mapSurprises(state);
  const currentSpots = spots.filter(
    (spot) => spot.interaction.kind !== 'surprise',
  );
  for (const [id, entry] of scenery.surprises) {
    if (visible.some((clue) => clue.id === id)) continue;
    entry.drawing.setVisible(false);
    entry.label.setVisible(false);
  }
  for (const clue of visible) {
    const cell = anchors.get(clue.anchor)!;
    let entry = scenery.surprises.get(clue.id);
    if (!entry) {
      entry = {
        drawing: own(scene.add.graphics().setDepth(cell.y * tileSize + 12)),
        label: own(
          new SceneText(
            textLayer,
            cell.x * tileSize + 8,
            cell.y * tileSize + 19,
            '',
            'label',
          ),
        ),
        clue,
      };
      scenery.surprises.set(clue.id, entry);
    }
    entry.clue = clue;
    entry.label
      .setVisible(true)
      .setText(
        clue.phase === 'clue'
          ? surpriseNames[clue.id][en ? 'en' : 'zhCN']
          : clue.text[en ? 'en' : 'zhCN'],
      );
    entry.label.element.title = clue.text[en ? 'en' : 'zhCN'];
    drawSurprise(
      entry.drawing
        .clear()
        .setVisible(true)
        .setPosition(cell.x * tileSize, cell.y * tileSize),
      clue,
      state.surpriseRecords?.find((record) => record.id === clue.id)?.choiceId,
    );
    if (clue.phase === 'clue')
      currentSpots.unshift({
        ...cell,
        interaction: {
          kind: 'surprise',
          id: clue.anchor,
          name: surpriseNames[clue.id],
        },
        bounds: new Phaser.Geom.Rectangle(
          cell.x * tileSize,
          cell.y * tileSize - 4,
          tileSize,
          tileSize + 4,
        ),
        label: entry.label,
      });
  }
  return {
    spots: currentSpots,
    approachedSurprise: visible.some(
      (clue) => clue.phase === 'clue' && clue.anchor === approachedSurprise,
    )
      ? approachedSurprise
      : undefined,
  };
}

export function syncCrops(
  state: GameState,
  cropSprites: Phaser.GameObjects.Sprite[],
) {
  cropSprites.forEach((sprite, i) => {
    const p = state.plots[i],
      crop = items.find((it) => it.id === p?.seed)?.grows?.crop;
    sprite.setVisible(!!crop);
    if (crop) {
      const grows = items.find((it) => it.id === p.seed)!.grows!;
      sprite.setTexture(
        cropIds.includes(crop) ? `crop-${crop}` : 'item-fallback',
        cropIds.includes(crop)
          ? Math.min(4, Math.floor((p.growth / grows.days) * 4))
          : 0,
      );
    }
  });
}
