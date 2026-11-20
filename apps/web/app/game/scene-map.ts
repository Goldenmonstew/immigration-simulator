import * as Phaser from 'phaser';
import type { GameState, PlaceId } from '@uk-immigration/game';
import { shopSignIds, signPosition } from './art';
import type { Cell } from './pathfinding';
import type { Interaction, SceneView } from './scene';
import { SceneText } from './scene-text';
import { animalIds, animalRoutes, type Animal } from './wildlife';

export const tileSize = 16;

export type Spot = Cell & {
  interaction: Interaction;
  bounds: Phaser.Geom.Rectangle;
  label?: SceneText;
};

export type OwnWorldObject = <
  T extends Phaser.GameObjects.GameObject | SceneText,
>(
  object: T,
) => T;

export type Furnishing = { flag: string; layer: Phaser.Tilemaps.TilemapLayer };
export type AnimalSprite = {
  sprite: Phaser.GameObjects.Sprite;
  next: number;
  elapsed: number;
};

const landscapes = {
  1: { grass: [156, 170, 174], trees: [132, 148, 155] }, // Winter: cool grey.
  2: { grass: [91, 170, 91], trees: [147, 191, 68] }, // Spring: fresh green.
  4: { grass: [139, 146, 79], trees: [193, 126, 54] }, // Autumn: ochre foliage.
};
const furnishingFlags = [
  'furnished-reading-chair',
  'furnished-warm-curtains',
  'furnished-desk-lamp',
];

export function buildMap(
  scene: Phaser.Scene,
  { state, interior }: SceneView,
  fromHome: boolean,
  textLayer: HTMLDivElement,
  own: OwnWorldObject,
  anchors: Map<string, Cell>,
  animals: Map<Animal, AnimalSprite>,
) {
  const key = interior ? 'home' : 'town';
  const map = scene.make.tilemap({ key });
  const tileset = map.addTilesetImage(key, `${key}-tiles`)!;
  map.createLayer('ground', tileset)!;
  map.createLayer('decor', tileset)!.setDepth(1);
  const collision = map.createLayer('collision', tileset)!;
  collision.setVisible(false);
  let furnishings: Furnishing[] = [];
  if (interior) {
    const details = map.addTilesetImage('home-details', 'home-details')!;
    furnishings = furnishingFlags.map((flag) => ({
      flag,
      layer: map.createLayer(flag, [tileset, details])!.setDepth(2),
    }));
  }
  const townTiles = interior ? undefined : tileset;
  const spawn = map.getObjectLayer('spawn')!.objects[0];
  let cell = { x: spawn.x! / tileSize, y: spawn.y! / tileSize };
  if (fromHome && !interior) cell = { x: 5, y: 12 };
  const player = own(
    scene.add
      .sprite(cell.x * tileSize + 8, cell.y * tileSize + 10, state.characterId)
      .setOrigin(0.5, 0.8)
      .setDepth(100),
  );
  const spots: Spot[] = [];
  for (const obj of map.getObjectLayer('places')!.objects) {
    const cell = { x: obj.x! / tileSize, y: obj.y! / tileSize };
    const props = (name: string) =>
      obj.properties?.find(
        (p: { name: string; value: number }) => p.name === name,
      )?.value as number | undefined;
    const interaction: Interaction = interior
      ? {
          kind: 'home',
          id: obj.name as Extract<Interaction, { kind: 'home' }>['id'],
        }
      : { kind: 'place', id: obj.name as PlaceId };
    const bounds = new Phaser.Geom.Rectangle(
      props('buildingX') ?? obj.x!,
      props('buildingY') ?? obj.y!,
      props('buildingWidth') ?? 16,
      props('buildingHeight') ?? 16,
    );
    const label = own(
      new SceneText(
        textLayer,
        bounds.centerX,
        interior ? bounds.y - 2 : bounds.y + bounds.height + 2,
        '',
        interior ? 'homeLabel' : 'label',
      ),
    );
    spots.push({ ...cell, interaction, bounds, label });
    anchors.set(obj.name, cell);
    if (!interior && shopSignIds.includes(obj.name)) {
      const sign = signPosition({ x: obj.x!, y: obj.y! });
      own(
        scene.add
          .sprite(sign.x, sign.y, `sign-${obj.name}`)
          .setDisplaySize(16, 16)
          .setDepth(3),
      );
    }
    if (!interior || obj.name === 'exit') {
      own(
        scene.add
          .rectangle(
            cell.x * tileSize + 8,
            cell.y * tileSize + 13,
            9,
            2,
            0xf4d98d,
            0.8,
          )
          .setDepth(2),
      );
    }
  }
  let water: Phaser.GameObjects.Graphics | undefined;
  const waterTiles: Cell[] = [];
  const cropSprites: Phaser.GameObjects.Sprite[] = [];
  const lampLights: Phaser.GameObjects.Graphics[] = [];
  let windows: Phaser.GameObjects.Graphics | undefined;
  if (!interior) {
    water = own(scene.add.graphics().setDepth(0.5));
    map.getLayer('ground')!.tilemapLayer.forEachTile((tile) => {
      if (tile.index === 5 && (tile.x + tile.y) % 3 === 0)
        waterTiles.push({ x: tile.pixelX, y: tile.pixelY });
    });
    for (const a of map.getObjectLayer('anchors')!.objects)
      anchors.set(a.name, { x: a.x! / tileSize, y: a.y! / tileSize });
    for (const p of map.getObjectLayer('plots')!.objects) {
      const cell = { x: p.x! / tileSize, y: p.y! / tileSize };
      const sprite = own(
        scene.add
          .sprite(p.x! + 8, p.y! + 8, 'crop-potato', 0)
          .setDepth(2)
          .setVisible(false),
      );
      cropSprites[Number(p.name)] = sprite;
      spots.push({
        ...cell,
        interaction: { kind: 'plot', id: Number(p.name) },
        bounds: new Phaser.Geom.Rectangle(p.x!, p.y!, 16, 16),
      });
    }
    for (const lamp of map.getObjectLayer('lamps')!.objects) {
      const g = own(scene.add.graphics().setDepth(1550));
      for (let r = 30; r > 0; r -= 5)
        g.fillStyle(0xffd88b, 0.075).fillCircle(lamp.x! + 8, lamp.y! - 4, r);
      lampLights.push(g);
    }
    windows = own(scene.add.graphics().setDepth(1550));
    map.getLayer('decor')!.tilemapLayer.forEachTile((tile) => {
      if ([17, 20, 22].includes(tile.index)) {
        windows!
          .fillStyle(0xffd889, 0.85)
          .fillRect(tile.pixelX + 5, tile.pixelY + 5, 6, 7);
        windows!
          .fillStyle(0xffd889, 0.08)
          .fillCircle(tile.pixelX + 8, tile.pixelY + 8, 13);
      }
    });
    for (const id of animalIds) {
      const start = animalRoutes[id][0];
      const sprite = own(
        scene.add
          .sprite(
            start.x * tileSize + 8,
            start.y * tileSize + 10,
            `animal-${id}`,
          )
          .setOrigin(0.5, 0.8)
          .setDepth(start.y * tileSize + 19),
      );
      animals.set(id, { sprite, next: 1, elapsed: 0 });
    }
  }
  return {
    map,
    collision,
    furnishings,
    townTiles,
    cell,
    player,
    spots,
    water,
    waterTiles,
    cropSprites,
    lampLights,
    windows,
  };
}

export function syncMapScenery(
  textures: Phaser.Textures.TextureManager,
  state: GameState,
  furnishings: Furnishing[],
  collision: Phaser.Tilemaps.TilemapLayer | undefined,
  townTiles: Phaser.Tilemaps.Tileset | undefined,
) {
  for (const { flag, layer } of furnishings) {
    const visible = state.flags.includes(flag);
    layer.setVisible(visible);
    if (flag === 'furnished-reading-chair')
      layer.forEachTile((tile) => {
        if (tile.index > 0)
          collision!.putTileAt(visible ? 1 : -1, tile.x, tile.y);
      });
  }
  if (!townTiles) return;
  const quarter = state.quarter;
  const key = quarter === 3 ? 'town-tiles' : `town-tiles-${quarter}`;
  if (quarter !== 3 && !textures.exists(key)) {
    // Tile tint is WebGL-only. Cache a small atlas for both renderers instead.
    const source = textures
      .get('town-tiles')
      .getSourceImage() as HTMLImageElement;
    const texture = textures.createCanvas(key, source.width, source.height)!;
    const context = texture.context;
    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, source.width, source.height);
    const data = pixels.data;
    for (const gid of [1, 26, 27, 28]) {
      const palette = landscapes[quarter][gid === 1 ? 'grass' : 'trees'];
      for (let y = 0; y < tileSize; y++)
        for (let x = (gid - 1) * tileSize; x < gid * tileSize; x++) {
          const i = (y * source.width + x) * 4;
          // Preserve transparent pixels and the tree's neutral trunk/base.
          if (
            !data[i + 3] ||
            data[i + 1] <= data[i] ||
            data[i + 1] <= data[i + 2]
          )
            continue;
          const shade = data[i + 1] / (gid === 1 ? 156 : 173);
          for (let channel = 0; channel < 3; channel++)
            data[i + channel] = Math.round(palette[channel] * shade);
        }
    }
    context.putImageData(pixels, 0, 0);
    texture.refresh();
  }
  townTiles.setImage(textures.get(key));
}

export function resizeMapCamera(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  interior: boolean,
) {
  const camera = scene.cameras.main;
  const { width, height } = scene.scale;
  if (interior) {
    // Keep tile edges on whole pixels unless the room needs to shrink to fit.
    const fit = Math.min(
      3,
      width / map.widthInPixels,
      height / map.heightInPixels,
    );
    camera.setZoom(fit < 1 ? fit : Math.floor(fit));
    camera.stopFollow();
    camera.removeBounds();
    camera.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
    // On odd frames, Phaser's rounded screen origin already aligns the tiles.
    // Flooring the half-pixel world scroll as well would push the far walls out.
    camera.roundPixels =
      fit >= 1 &&
      Number.isInteger(camera.scrollX) &&
      Number.isInteger(camera.scrollY);
    if (fit < 1) {
      // Phaser rounds the viewport centre at render time. Offset its shift on
      // odd-sized frames in world units so the far wall stays inside the frame.
      camera.scrollX += (Math.round(width / 2) - width / 2) / fit;
      camera.scrollY += (Math.round(height / 2) - height / 2) / fit;
    }
  } else {
    camera.roundPixels = true;
    camera.setZoom(width < 600 ? 2 : 2.5);
  }
}
