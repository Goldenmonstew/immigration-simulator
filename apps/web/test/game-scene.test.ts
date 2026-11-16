import { afterEach, expect, test, vi } from 'vitest';
import { createRequire } from 'node:module';
import type * as Phaser from 'phaser';
import {
  doActivity,
  newGame,
  npcAt,
  tick,
  type GameState,
} from '@uk-immigration/game';
import { TownScene, type SceneView } from '../app/game/scene';
import { gameStorage, homeSpot } from '../app/game/session';
import townMap from '../public/game/town.json';
import homeMap from '../public/game/home.json';
import { SceneText, textPosition } from '../app/game/scene-text';
import { shopSignIds, signPath } from '../app/game/art';

const TransformMatrix = createRequire(import.meta.url)(
  'phaser/src/gameobjects/components/TransformMatrix.js',
) as typeof Phaser.GameObjects.Components.TransformMatrix;

function textLayer() {
  const children: HTMLSpanElement[] = [];
  return {
    children,
    clientWidth: 864,
    clientHeight: 624,
    ownerDocument: {
      createElement: () => {
        const element = {
          style: {},
          dataset: {},
          offsetWidth: 100,
          offsetHeight: 40,
          remove: () =>
            children.splice(
              children.indexOf(element as unknown as HTMLSpanElement),
              1,
            ),
        };
        return element;
      },
    },
    appendChild: (element: HTMLSpanElement) => children.push(element),
    replaceChildren: () => children.splice(0),
  } as unknown as HTMLDivElement;
}

// Exercise the real routing/update logic without a browser or Phaser renderer.
vi.mock('phaser', () => ({
  Scene: class {},
  Input: { Keyboard: { JustDown: () => false } },
  Geom: {
    Rectangle: class {
      constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
      ) {}
      get centerX() {
        return this.x + this.width / 2;
      }
      contains(x: number, y: number) {
        return (
          x >= this.x &&
          x <= this.x + this.width &&
          y >= this.y &&
          y <= this.y + this.height
        );
      }
      static Overlaps(
        a: { x: number; y: number; width: number; height: number },
        b: { x: number; y: number; width: number; height: number },
      ) {
        return (
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        );
      }
    },
  },
}));

afterEach(() => vi.unstubAllGlobals());

class Sprite {
  visible = true;
  anims = { stop: vi.fn() };
  destroy = vi.fn(() => {
    this.visible = false;
  });
  constructor(
    public x: number,
    public y: number,
    public texture?: string,
  ) {}
  setOrigin() {
    return this;
  }
  setDepth() {
    return this;
  }
  setFrame() {
    return this;
  }
  setDisplaySize() {
    return this;
  }
  setTexture = vi.fn(() => this);
  play() {
    return this;
  }
  setVisible(value: boolean) {
    this.visible = value;
    return this;
  }
  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }
}
type Cell = { x: number; y: number };
type Walker = {
  sprite: Sprite;
  cell: Cell;
  path: Cell[];
  target?: Cell;
  at: string;
};

function setup(interior = false) {
  const state = newGame('family-partner', 42, 'en');
  state.day.kind = 'workday';
  state.day.weather = 'sunny';
  state.day.minute = interior ? 480 : 780;
  delete state.day.festival;
  if (!interior) state.flags.push('family-jamie-unemployed');
  const view: SceneView = { state, locale: 'en', paused: false, interior };
  const onInteract = vi.fn();
  const scene = new TownScene(
    view,
    onInteract,
    vi.fn(),
    vi.fn(),
    vi.fn(),
    textLayer(),
  );
  const anchors = new Map(
    townMap.layers
      .filter((layer) => ['places', 'anchors'].includes(layer.name))
      .flatMap((layer) => layer.objects ?? [])
      .map(
        (object) =>
          [object.name, { x: object.x / 16, y: object.y / 16 }] as const,
      ),
  );
  const collision = townMap.layers.find(
    (layer) => layer.name === 'collision',
  )!.data!;
  Object.assign(scene, {
    ready: true,
    map: { width: townMap.width, height: townMap.height },
    collision: {
      getTileAt: (x: number, y: number) => ({
        index: collision[y * townMap.width + x],
      }),
    },
    anchors,
    add: { sprite: (x: number, y: number) => new Sprite(x, y) },
    player: new Sprite(8, 10),
    keys: Object.fromEntries(
      ['LEFT', 'RIGHT', 'UP', 'DOWN', 'W', 'A', 'S', 'D'].map((key) => [
        key,
        { isDown: false },
      ]),
    ),
  });
  scene.sync(view);
  const residents = Reflect.get(scene, 'residents') as Map<string, Walker>;
  const jamie = residents.get('jamie')!;
  const depart = () => {
    state.flags = [];
    state.day.minute = 800;
    expect(npcAt(state, 'jamie')).toBe('away');
    scene.sync(view);
  };
  return { scene, view, residents, jamie, anchors, onInteract, depart };
}

test('a street resident walks to the actual station door, cannot be approached, and disappears on arrival', () => {
  const { scene, view, residents, jamie, anchors, onInteract, depart } =
    setup();
  expect(jamie.sprite.visible).toBe(true);
  depart();
  expect(jamie.path.at(-1)).toEqual(anchors.get('station'));
  expect(jamie.sprite.destroy).not.toHaveBeenCalled();
  scene.walkToNpc('jamie');
  expect(Reflect.get(scene, 'queued')).toBeUndefined();
  Object.assign(scene, { nearby: { kind: 'npc', id: 'jamie' } });
  scene.interact();
  expect(onInteract).not.toHaveBeenCalled();
  const steps = jamie.path.length;
  for (let step = 0; step < steps; step++) {
    scene.sync(view);
    scene.update(step * 400, 400);
    if (step < steps - 1) expect(jamie.sprite.destroy).not.toHaveBeenCalled();
  }
  expect(jamie.cell).toEqual(anchors.get('station'));
  expect(jamie.sprite.destroy).toHaveBeenCalledOnce();
  expect(residents.has('jamie')).toBe(false);
  scene.sync(view);
  expect(residents.has('jamie')).toBe(false);
});

test('a resident already walking finishes the current step before heading for the station', () => {
  const { scene, view, jamie, anchors, depart } = setup();
  view.state.day.minute = 660;
  scene.sync(view);
  scene.update(0, 100);
  const step = jamie.target;
  expect(step).toBeDefined();
  depart();
  expect(jamie.target).toEqual(step);
  expect(jamie.path.at(-1)).toEqual(anchors.get('station'));
  scene.update(400, 400);
  expect(jamie.cell).toEqual(step);
  expect(jamie.sprite.destroy).not.toHaveBeenCalled();
});

test('a household resident disappears immediately when becoming away', () => {
  const { residents, jamie, depart } = setup(true);
  expect(jamie.sprite.visible).toBe(true);
  depart();
  expect(jamie.sprite.destroy).toHaveBeenCalledOnce();
  expect(residents.has('jamie')).toBe(false);
});

test('festival residents occupy distinct walkable cells around their shared outdoor anchor', () => {
  const { scene, view, residents, anchors } = setup();
  view.state.day.festival = 'lunar-new-year';
  view.state.day.kind = 'special';
  view.state.day.minute = 600;
  scene.sync(view);
  for (let frame = 0; frame < 300; frame++) scene.update(frame * 400, 400);
  const festival = [...residents].filter(
    ([id]) => npcAt(view.state, id) === 'green-stall',
  );
  expect(festival).toHaveLength(9);
  const cells = festival.map(([, npc]) => npc.cell);
  expect(new Set(cells.map((c) => `${c.x}:${c.y}`)).size).toBe(9);
  const collision = townMap.layers.find((l) => l.name === 'collision')!.data!;
  for (const cell of cells) {
    expect(collision[cell.y * townMap.width + cell.x]).toBe(0);
    const anchor = anchors.get('green-stall')!;
    expect(
      Math.abs(cell.x - anchor.x) + Math.abs(cell.y - anchor.y),
    ).toBeLessThanOrEqual(2);
  }
  scene.sync(view);
  for (const [, npc] of festival) expect(npc.path).toEqual([]);
});

function routing() {
  const result = setup();
  const spots = townMap.layers
    .find((l) => l.name === 'places')!
    .objects!.map((o) => ({
      x: o.x / 16,
      y: o.y / 16,
      interaction: { kind: 'place', id: o.name },
    }));
  Object.assign(result.scene, {
    spots,
    keys: Object.fromEntries(
      ['LEFT', 'RIGHT', 'UP', 'DOWN', 'W', 'A', 'S', 'D'].map((key) => [
        key,
        { isDown: false, reset: vi.fn() },
      ]),
    ),
  });
  const stand = (id: string) => {
    const spot = spots.find((s) => s.interaction.id === id)!;
    Object.assign(result.scene, {
      cell: { x: spot.x, y: spot.y },
      player: new Sprite(spot.x * 16 + 8, spot.y * 16 + 10),
    });
  };
  return { ...result, stand };
}

test('walking from the board to the shop passes the café without entering', () => {
  const { scene, onInteract, anchors, stand } = routing();
  stand('board');
  scene.walkToLocation('shop');
  const path = Reflect.get(scene, 'path') as Cell[];
  expect(path).toContainEqual(anchors.get('cafe'));
  for (let frame = 0; frame < 1000 && !onInteract.mock.calls.length; frame++)
    scene.update(frame * 60, 60);
  expect(onInteract).toHaveBeenCalledExactlyOnceWith({
    kind: 'place',
    id: 'shop',
  });
});

test('choosing the same destination while standing at its door immediately opens it again', () => {
  const { scene, onInteract, stand } = routing();
  stand('shop');
  scene.walkToLocation('shop');
  expect(onInteract).toHaveBeenCalledExactlyOnceWith({
    kind: 'place',
    id: 'shop',
  });
  scene.walkToLocation('shop');
  expect(onInteract).toHaveBeenCalledTimes(2);
});

// Load the actual Tiled layers through the scene; only the drawing API is mocked.
class TileLayer {
  visible = false;
  tiles: {
    index: number;
    x: number;
    y: number;
    pixelX: number;
    pixelY: number;
    tint: number;
  }[];
  constructor(
    data: number[],
    private width: number,
  ) {
    this.tiles = data.map((index, i) => ({
      index,
      x: i % width,
      y: Math.floor(i / width),
      pixelX: (i % width) * 16,
      pixelY: Math.floor(i / width) * 16,
      tint: 0xffffff,
    }));
  }
  setDepth() {
    return this;
  }
  setVisible(visible: boolean) {
    this.visible = visible;
    return this;
  }
  forEachTile(callback: (tile: TileLayer['tiles'][number]) => void) {
    this.tiles.forEach(callback);
  }
  getTileAt(x: number, y: number) {
    return this.tiles[y * this.width + x];
  }
  putTileAt(index: number, x: number, y: number) {
    this.getTileAt(x, y).index = index;
  }
}

class Drawing extends Sprite {
  clear = vi.fn(() => this);
  fillStyle = vi.fn(() => this);
  fillRect = vi.fn<
    (x: number, y: number, width: number, height: number) => Drawing
  >(() => this);
  fillCircle = vi.fn<(x: number, y: number, radius: number) => Drawing>(
    () => this,
  );
  fillTriangle = vi.fn(() => this);
  fillRoundedRect = vi.fn(() => this);
  lineStyle = vi.fn(() => this);
  lineBetween = vi.fn(() => this);
  setScrollFactor() {
    return this;
  }
  setText = vi.fn(() => this);
}

function loadScene(
  interior: boolean,
  state = newGame('family-partner', 42, 'en'),
) {
  const view: SceneView = { state, locale: 'en', paused: false, interior };
  const overlay = textLayer();
  const scene = new TownScene(
    view,
    vi.fn(),
    vi.fn(),
    vi.fn(),
    vi.fn(),
    overlay,
  );
  const layers = new Map<string, TileLayer>();
  const tilesets = new Map<string, { setImage: ReturnType<typeof vi.fn> }>();
  const source = {
    width: 640,
    height: 16,
    data: new Uint8ClampedArray(640 * 16 * 4),
  };
  for (let i = 0; i < source.data.length; i += 4) {
    const gid = Math.floor(((i / 4) % 640) / 16) + 1;
    source.data.set(
      gid === 1
        ? [64, 156, 98, 255]
        : [26, 27, 28].includes(gid)
          ? [123, 173, 44, 255]
          : [185, 139, 94, 255],
      i,
    );
  }
  source.data.set([255, 0, 255, 0], (25 * 16 + 15) * 4);
  source.data.set([140, 153, 154, 255], (27 * 16 + 15) * 4);
  const makeTexture = (data = new Uint8ClampedArray(source.data.length)) => ({
    data,
    getSourceImage: () => source,
    refresh: vi.fn(),
    context: {
      drawImage: (image: typeof source) => data.set(image.data),
      getImageData: () => ({ data: data.slice() }),
      putImageData: (image: { data: Uint8ClampedArray }) =>
        data.set(image.data),
    },
  });
  const textures = new Map([['town-tiles', makeTexture(source.data)]]);
  const createCanvas = vi.fn((key: string, width: number, height: number) => {
    expect([width, height]).toEqual([640, 16]);
    const texture = makeTexture();
    textures.set(key, texture);
    return texture;
  });
  const camera = {
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    matrix: new TransformMatrix(),
    setBackgroundColor: vi.fn(),
    getWorldPoint: (x: number, y: number) => ({ x, y }),
    setBounds() {
      return this;
    },
    startFollow() {
      return this;
    },
    setZoom(zoom: number) {
      this.zoom = zoom;
      return this;
    },
    stopFollow() {},
    removeBounds() {},
    centerOn() {},
  };
  Object.assign(scene, {
    ready: true,
    textures: {
      exists: (key: string) => textures.has(key),
      get: (key: string) => textures.get(key),
      createCanvas,
    },
    make: {
      tilemap: ({ key }: { key: string }) => {
        const source = key === 'home' ? homeMap : townMap;
        layers.clear();
        return {
          width: source.width,
          height: source.height,
          widthInPixels: source.width * 16,
          heightInPixels: source.height * 16,
          addTilesetImage: (name: string) => {
            expect(source.tilesets.some((t) => t.name === name)).toBe(true);
            const tileset = { setImage: vi.fn() };
            tilesets.set(name, tileset);
            return tileset;
          },
          createLayer: (name: string) => {
            const layer = new TileLayer(
              source.layers.find((l) => l.name === name)!.data!,
              source.width,
            );
            layers.set(name, layer);
            return layer;
          },
          getLayer: (name: string) => ({ tilemapLayer: layers.get(name) }),
          getObjectLayer: (name: string) =>
            source.layers.find((l) => l.name === name),
          destroy() {},
        };
      },
    },
    add: {
      sprite: (x: number, y: number, texture: string) =>
        new Sprite(x, y, texture),
      text: (x: number, y: number) => new Drawing(x, y),
      graphics: () => new Drawing(0, 0),
      rectangle: (x: number, y: number) => new Drawing(x, y),
    },
    cameras: { main: camera },
    input: { activePointer: { x: 0, y: 0 }, manager: { isOver: false } },
    scale: { width: 864, height: 624 },
    tweens: { killTweensOf: vi.fn() },
  });
  Reflect.get(scene, 'loadWorld').call(scene);
  return {
    scene,
    view,
    layers,
    tilesets,
    textures,
    createCanvas,
    camera,
    overlay,
  };
}

test('Nora and Maeve preload their own 16px walking frames and use them at home', () => {
  const state = newGame('graduate', 42, 'en');
  state.day.minute = 480;
  delete state.day.festival;
  const { scene } = loadScene(true, state);
  const load = {
    image: vi.fn(),
    tilemapTiledJSON: vi.fn(),
    spritesheet: vi.fn(),
  };
  Object.assign(scene, { load });
  scene.preload();
  for (const id of ['graduate', 'maeve'])
    expect(load.spritesheet).toHaveBeenCalledWith(
      id,
      `/game/assets/urban/${id}.png`,
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
  expect((Reflect.get(scene, 'player') as Sprite).texture).toBe('graduate');
  const residents = Reflect.get(scene, 'residents') as Map<string, Walker>;
  expect(residents.get('maeve')!.sprite.texture).toBe('maeve');
  expect(residents.get('maeve')!.sprite.visible).toBe(true);
});

test('all nine facade signs preload, leave doors and paths clear, and reset on entering and leaving home', () => {
  const { scene, view } = loadScene(false);
  const load = {
    image: vi.fn(),
    tilemapTiledJSON: vi.fn(),
    spritesheet: vi.fn(),
  };
  Object.assign(scene, { load });
  scene.preload();
  const signs = () =>
    (Reflect.get(scene, 'worldObjects') as Sprite[]).filter((object) =>
      object.texture?.startsWith('sign-'),
    );
  expect(signs()).toHaveLength(9);
  const objects = townMap.layers.find(
    (layer) => layer.name === 'places',
  )!.objects!;
  const collision = townMap.layers.find(
    (layer) => layer.name === 'collision',
  )!.data!;
  const originalPaths = new Map<string, Cell[]>();
  for (const id of shopSignIds) {
    expect(load.image).toHaveBeenCalledWith(`sign-${id}`, signPath(id));
    const sign = signs().find((object) => object.texture === `sign-${id}`)!;
    const door = objects.find((object) => object.name === id)!;
    const bounds = Object.fromEntries(
      door.properties!.map((p) => [p.name, p.value]),
    );
    expect(sign.x - 12).toBeGreaterThanOrEqual(bounds.buildingX);
    expect(sign.x + 12).toBeLessThanOrEqual(
      bounds.buildingX + bounds.buildingWidth,
    );
    expect(sign.y - 12).toBeGreaterThanOrEqual(bounds.buildingY);
    // The visible door occupies the last facade tile above the path anchor.
    expect(sign.y + 12).toBeLessThanOrEqual(door.y - 16);
    for (
      let y = Math.floor((sign.y - 12) / 16);
      y <= Math.floor((sign.y + 11) / 16);
      y++
    )
      for (
        let x = Math.floor((sign.x - 12) / 16);
        x <= Math.floor((sign.x + 11) / 16);
        x++
      )
        expect(collision[y * townMap.width + x]).toBeGreaterThan(0);
  }
  const findPath = (destination: Cell) =>
    Reflect.get(scene, 'findPath').call(
      scene,
      { x: 5, y: 12 },
      destination,
    ) as Cell[];
  const anchors = Reflect.get(scene, 'anchors') as Map<string, Cell>;
  for (const [id, destination] of anchors) {
    const path = findPath(destination);
    expect(path.at(-1), id).toEqual(destination);
    originalPaths.set(id, path);
  }
  const before = signs();
  scene.sync({ ...view, interior: true });
  expect(signs()).toHaveLength(0);
  expect(before.every((object) => object.destroy.mock.calls.length === 1)).toBe(
    true,
  );
  scene.sync(view);
  expect(signs()).toHaveLength(9);
  for (const [id, destination] of Reflect.get(scene, 'anchors') as Map<
    string,
    Cell
  >)
    expect(findPath(destination)).toEqual(originalPaths.get(id));
});

test.each([2, 2.5, 3])(
  'DOM text follows the rendered camera at zoom %s, including scroll and resize',
  (zoom) => {
    const matrix = new TransformMatrix();
    const camera = {
      matrix,
      zoom,
      scrollX: 80,
      scrollY: 40,
      getWorldPoint(x: number, y: number) {
        const point = this.matrix.applyInverse(x, y);
        return { x: point.x + this.scrollX, y: point.y + this.scrollY };
      },
    };
    matrix.applyITRS(400, 240, 0, zoom, zoom).translate(-400, -240);
    expect(textPosition(camera, 480, 280)).toEqual({
      x: expect.closeTo(400, 8),
      y: expect.closeTo(240, 8),
    });
    expect(textPosition(camera, 496, 288)).toEqual({
      x: expect.closeTo(400 + 16 * zoom, 8),
      y: expect.closeTo(240 + 8 * zoom, 8),
    });
    camera.scrollX += 16;
    expect(textPosition(camera, 496, 288)).toEqual({
      x: expect.closeTo(400, 8),
      y: expect.closeTo(240 + 8 * zoom, 8),
    });
    // A resized, centred room uses the new viewport's transform, not worldView rounding.
    matrix.applyITRS(180, 160, 0, zoom, zoom).translate(-180, -160);
    expect(textPosition(camera, 276, 200)).toEqual({
      x: expect.closeTo(180, 8),
      y: expect.closeTo(160, 8),
    });
  },
);

test.each([2, 3])(
  'DOM text stays screen-sized at DPR %s and carries tween visibility/opacity',
  (devicePixelRatio) => {
    vi.stubGlobal('window', { devicePixelRatio });
    const layer = textLayer();
    const text = new SceneText(layer, 40, 20, '公告栏', 'label');
    const camera = {
      matrix: new TransformMatrix(3, 0, 0, 3, 0, 0),
      zoom: 3,
      scrollX: 0,
      scrollY: 0,
      getWorldPoint(x: number, y: number) {
        const point = this.matrix.applyInverse(x, y);
        return { x: point.x + this.scrollX, y: point.y + this.scrollY };
      },
    };
    text.render(camera);
    expect(layer.children).toHaveLength(1);
    expect(text.element.textContent).toBe('公告栏');
    expect(text.element.style.transform).toBe(
      'translate3d(120px, 60px, 0) translate(-50%, 0)',
    );
    text.y -= 4;
    text.alpha = 0.5;
    text.setVisible(false).render(camera);
    expect(text.element.style.transform).toContain('120px, 48px');
    expect(text.element.style.opacity).toBe('0.5');
    expect(text.element.style.visibility).toBe('hidden');
    text.destroy();
    expect(layer.children).toHaveLength(0);
  },
);

test('place labels remain visible at a distance, highlight near the player or on hover, and clear on entering home', () => {
  const { scene, view, camera, overlay } = loadScene(false);
  const spots = Reflect.get(scene, 'spots') as {
    x: number;
    y: number;
    interaction: { kind: string; id: string };
    bounds: { x: number; y: number; height: number };
    label?: SceneText;
  }[];
  const home = spots.find((s) => s.interaction.id === 'home')!;
  const shop = spots.find((s) => s.interaction.id === 'shop')!;
  for (const spot of spots.filter((s) => s.label))
    expect(spot.label!.y).toBeGreaterThan(spot.bounds.y + spot.bounds.height);
  Object.assign(scene, {
    cell: { x: home.x, y: home.y },
    nearby: home.interaction,
  });
  const render = () => Reflect.get(scene, 'renderText').call(scene);
  render();
  expect(home.label!.visible).toBe(true);
  expect(home.label!.element.dataset.nearby).toBe('true');
  expect(home.label!.element.dataset.highlighted).toBe('true');
  expect(shop.label!.visible).toBe(true);
  expect(shop.label!.element.dataset.highlighted).toBe('false');
  Object.assign(scene.input, {
    activePointer: { x: shop.bounds.x, y: shop.bounds.y },
    manager: { isOver: true },
  });
  render();
  expect(shop.label!.visible).toBe(true);
  expect(shop.label!.element.dataset.highlighted).toBe('true');
  expect(shop.label!.element.dataset.nearby).toBe('false');
  expect(home.label!.element.dataset.nearby).toBe('true');
  Object.assign(scene.input.manager, { isOver: false });
  render();
  expect(shop.label!.visible).toBe(true);
  expect(shop.label!.element.dataset.highlighted).toBe('false');
  const oldElements = Array.from(overlay.children);
  scene.sync({ ...view, interior: true });
  render();
  expect(
    oldElements.every((e) => !Array.from(overlay.children).includes(e)),
  ).toBe(true);
  expect(
    (Reflect.get(scene, 'spots') as typeof spots).every(
      (s) => s.label!.visible,
    ),
  ).toBe(true);
  const exit = (Reflect.get(scene, 'spots') as typeof spots).find(
    (s) => s.interaction.id === 'exit',
  )!;
  expect(exit.label!.y).toBeLessThan(exit.bounds.y);
  expect(exit.label!.element.style.transform).toContain(
    'translate(-50%, -100%)',
  );
  expect(camera.setBackgroundColor).toHaveBeenLastCalledWith('#2a1f18');
  scene.sync(view);
  expect(camera.setBackgroundColor).toHaveBeenLastCalledWith('#a8c580');
});

test('feedback text, hearts and expressions use the DOM layer and overlapping floats wait their turn', () => {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  const { scene, view, overlay } = loadScene(true);
  const tweens: { targets: SceneText; onComplete: () => void }[] = [];
  Object.assign(scene.tweens, {
    add: (tween: (typeof tweens)[number]) => tweens.push(tween),
  });
  scene.sync({
    ...view,
    feedback: {
      token: 1,
      hearts: { unknown: { before: 0, after: 1 } },
      outcome: {
        kind: 'talk',
        npc: 'unknown',
        statDeltas: { mood: 2 },
        items: { potato: 1 },
      },
    },
  });
  const floats = Reflect.get(scene, 'transients') as Map<
    SceneText,
    { started: boolean }
  >;
  const [feedback, bubble] = [...floats.keys()];
  expect(feedback.element.textContent).toContain('♥ 0 → 1');
  expect(feedback.element.textContent).toContain('+2');
  expect(feedback.element.textContent).toContain('+1');
  expect(bubble.element.textContent).toBe('♪');
  expect(tweens).toHaveLength(1);
  expect(floats.get(bubble)!.started).toBe(false);
  tweens[0].onComplete();
  expect(Array.from(overlay.children)).not.toContain(feedback.element);
  expect(tweens).toHaveLength(2);
  expect(floats.get(bubble)!.started).toBe(true);
  tweens[1].onComplete();
  expect(floats.size).toBe(0);
});

const furniture = [
  'furnished-reading-chair',
  'furnished-warm-curtains',
  'furnished-desk-lamp',
];

test.each(furniture)(
  'home displays only the purchased %s layer and removes it when its flag clears',
  (flag) => {
    const { scene, view, layers } = loadScene(true);
    for (const name of furniture) expect(layers.get(name)!.visible).toBe(false);
    expect(layers.get('collision')!.getTileAt(3, 8).index).toBeLessThanOrEqual(
      0,
    );
    view.state.flags.push(flag);
    scene.sync(view);
    for (const name of furniture)
      expect(layers.get(name)!.visible).toBe(name === flag);
    expect(layers.get('collision')!.getTileAt(3, 8).index > 0).toBe(
      flag === furniture[0],
    );
    view.state.flags = view.state.flags.filter((f) => f !== flag);
    scene.sync(view);
    expect(layers.get(flag)!.visible).toBe(false);
    expect(layers.get('collision')!.getTileAt(3, 8).index).toBeLessThanOrEqual(
      0,
    );
  },
);

test('saved furnishings and brighter rent survive a fresh scene and re-entry; ending rent clears the light', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = newGame('family-partner', 42, 'en');
  state.flags.push(...furniture, 'brighter-home');
  gameStorage(state.characterId, state);
  const saved = gameStorage(state.characterId).state!;
  expect(saved).toEqual(state);
  const { scene, view, layers } = loadScene(true, saved);
  const light = () => Reflect.get(scene, 'sky') as Drawing;
  for (const name of furniture) expect(layers.get(name)!.visible).toBe(true);
  expect(light().fillStyle).toHaveBeenLastCalledWith(0xffd88b, 0.035);
  scene.sync({ ...view, interior: false });
  scene.sync(view);
  for (const name of furniture) expect(layers.get(name)!.visible).toBe(true);
  expect(light().fillStyle).toHaveBeenLastCalledWith(0xffd88b, 0.035);
  light().clear.mockClear();
  light().fillRect.mockClear();
  light().fillCircle.mockClear();
  saved.flags = saved.flags.filter((flag) => flag !== 'brighter-home');
  scene.sync(view);
  expect(light().clear).toHaveBeenCalledOnce();
  expect(light().fillRect).not.toHaveBeenCalled();
  expect(light().fillCircle).not.toHaveBeenCalled();
  gameStorage(saved.characterId, saved);
  const reloaded = loadScene(true, gameStorage(saved.characterId).state!);
  expect(
    (Reflect.get(reloaded.scene, 'sky') as Drawing).fillRect,
  ).not.toHaveBeenCalled();
  for (const name of furniture)
    expect(reloaded.layers.get(name)!.visible).toBe(true);
});

test('four quarters recolour only grass and trees, including a new day and a return from home', () => {
  const { scene, view, tilesets, textures, createCanvas } = loadScene(false);
  const seasons: [GameState['quarter'], number[], number[]][] = [
    [1, [156, 170, 174], [132, 148, 155]],
    [2, [91, 170, 91], [147, 191, 68]],
    [3, [64, 156, 98], [123, 173, 44]],
    [4, [139, 146, 79], [193, 126, 54]],
  ];
  const original = textures.get('town-tiles')!.data.slice();
  const check = (
    quarter: GameState['quarter'],
    grass: number[],
    trees: number[],
  ) => {
    const key = quarter === 3 ? 'town-tiles' : `town-tiles-${quarter}`;
    const texture = textures.get(key)!;
    expect(tilesets.get('town')!.setImage).toHaveBeenLastCalledWith(texture);
    expect([...texture.data.slice(0, 4)]).toEqual([...grass, 255]);
    for (const gid of [26, 27, 28])
      expect([
        ...texture.data.slice((gid - 1) * 64, (gid - 1) * 64 + 4),
      ]).toEqual([...trees, 255]);
    expect([
      ...texture.data.slice((25 * 16 + 15) * 4, (25 * 16 + 16) * 4),
    ]).toEqual([255, 0, 255, 0]);
    expect([
      ...texture.data.slice((27 * 16 + 15) * 4, (27 * 16 + 16) * 4),
    ]).toEqual([140, 153, 154, 255]);
    for (let y = 0; y < 16; y++)
      for (let gid = 1; gid <= 40; gid++) {
        if ([1, 26, 27, 28].includes(gid)) continue;
        const start = (y * 640 + (gid - 1) * 16) * 4;
        expect(texture.data.slice(start, start + 64)).toEqual(
          original.slice(start, start + 64),
        );
      }
  };
  for (const [quarter, grass, trees] of seasons) {
    view.state.quarter = quarter;
    scene.sync(view);
    check(quarter, grass, trees);
  }
  view.state.quarter = 1;
  view.state.dayNumber++;
  scene.sync(view);
  check(...seasons[0]);
  scene.sync({ ...view, interior: true });
  expect(Reflect.get(scene, 'townTiles')).toBeUndefined();
  scene.sync(view);
  check(...seasons[0]);
  expect(createCanvas).toHaveBeenCalledTimes(3);
  expect(textures.get('town-tiles')!.data).toEqual(original);
  for (const quarter of [1, 2, 4])
    expect(
      textures.get(`town-tiles-${quarter}`)!.refresh,
    ).toHaveBeenCalledOnce();
});

test('furnished home keeps every interaction and household position reachable', () => {
  const { scene, view, layers } = loadScene(true);
  view.state.flags.push(...furniture);
  scene.sync(view);
  const start = { x: 4, y: 5 };
  const destinations = homeMap.layers
    .find((l) => l.name === 'places')!
    .objects!.map((o) => ({ x: o.x / 16, y: o.y / 16 }))
    .concat([0, 1, 2].map(homeSpot));
  for (const destination of destinations) {
    expect(
      layers.get('collision')!.getTileAt(destination.x, destination.y).index,
    ).toBeLessThanOrEqual(0);
    const path = Reflect.get(scene, 'findPath').call(
      scene,
      start,
      destination,
    ) as Cell[];
    expect(path.at(-1)).toEqual(destination);
    expect(path).not.toContainEqual({ x: 3, y: 8 });
  }
});

test('green benches and flower beds stay clear of stalls and NPC gathering cells without cutting routes', () => {
  const { scene, view, layers } = loadScene(false);
  const props = [
    { x: 35, y: 35, gid: 31 },
    { x: 36, y: 35, gid: 32 },
    { x: 31, y: 34, gid: 33 },
    { x: 37, y: 34, gid: 33 },
  ];
  for (const prop of props) {
    expect(layers.get('decor')!.getTileAt(prop.x, prop.y).index).toBe(prop.gid);
    expect(layers.get('collision')!.getTileAt(prop.x, prop.y).index).toBe(1);
    expect(prop.y * 16).toBeGreaterThan(519);
    expect(Math.abs(prop.x - 34) + Math.abs(prop.y - 31)).toBeGreaterThan(2);
  }
  view.state.day.festival = 'summer-fair';
  view.state.day.kind = 'special';
  view.state.day.minute = 600;
  view.state.dayNumber++;
  scene.sync(view);
  for (const destination of (
    Reflect.get(scene, 'anchors') as Map<string, Cell>
  ).values()) {
    const path = Reflect.get(scene, 'findPath').call(
      scene,
      { x: 5, y: 12 },
      destination,
    ) as Cell[];
    expect(path.at(-1)).toEqual(destination);
    for (const { x, y } of props) expect(path).not.toContainEqual({ x, y });
  }
  for (const npc of (
    Reflect.get(scene, 'residents') as Map<string, Walker>
  ).values())
    for (const { x, y } of props) expect(npc.cell).not.toEqual({ x, y });
});

function lunchState() {
  const state = newGame('skilled-worker', 42, 'en');
  state.quarter = 3;
  state.day = {
    ...state.day,
    index: 1,
    kind: 'weekend',
    date: '2025-07-05',
    minute: 480,
    weather: 'sunny',
    place: 'green',
    deliveries: [],
  };
  delete state.day.festival;
  delete state.pendingEvent;
  state.eventQueue = [];
  state.flags.push('quarter-board-community-lunch');
  return state;
}
const lunchObjects = (scene: TownScene) =>
  Reflect.get(scene, 'lunch') as {
    object: Sprite;
    requires?: 'tables' | 'food';
    cell?: Cell;
  }[];

test('lunch objects follow the notice, summer weekend and 07:00–16:00 window, including after attendance', () => {
  const { scene, view } = loadScene(false, lunchState());
  const check = (shown: boolean) => {
    const objects = lunchObjects(scene);
    expect(objects.length).toBeGreaterThan(0);
    expect(
      objects.filter((p) => !p.requires).every((p) => p.object.visible),
    ).toBe(shown);
    if (!shown) expect(objects.every((p) => !p.object.visible)).toBe(true);
  };
  check(true);
  for (const minute of [420, 719, 720, 959]) {
    view.state.day.minute = minute;
    scene.sync(view);
    check(true);
  }
  for (const minute of [419, 960, 1260]) {
    view.state.day.minute = minute;
    scene.sync(view);
    check(false);
  }
  view.state.day.minute = 780;
  for (const kind of ['workday', 'special'] as const) {
    view.state.day.kind = kind;
    scene.sync(view);
    check(false);
  }
  view.state.day.kind = 'weekend';
  view.state.quarter = 4;
  scene.sync(view);
  check(false);
  view.state.quarter = 3;
  view.state.flags = [];
  scene.sync(view);
  check(false);
  view.state.flags.push(
    'quarter-board-community-lunch',
    'quarter-community-lunch-attended',
    'community-lunch-attended:2025',
  );
  scene.sync(view);
  check(true);
  const before = lunchObjects(scene);
  scene.sync({ ...view, interior: true });
  expect(before.every((p) => p.object.destroy.mock.calls.length === 1)).toBe(
    true,
  );
  expect(lunchObjects(scene)).toEqual([]);
  scene.sync(view);
  check(true);
  view.state.dayNumber++;
  view.state.day.kind = 'special';
  scene.sync(view);
  check(false);
});

test.each(['tables', 'biscuits', 'baked-potato'])(
  'real %s preparation updates the scene immediately and persists through reload',
  (preparation) => {
    const state = lunchState();
    state.inventory[preparation] = 1;
    const { scene, view } = loadScene(false, state);
    expect(
      lunchObjects(scene)
        .filter((p) => p.requires)
        .every((p) => !p.object.visible),
    ).toBe(true);
    const after = doActivity(state, `community-lunch-${preparation}`);
    scene.sync({ ...view, state: after });
    const check = (target: TownScene) => {
      for (const part of lunchObjects(target).filter((p) => p.requires)) {
        expect(part.object.visible).toBe(
          part.requires === (preparation === 'tables' ? 'tables' : 'food'),
        );
        if (part.requires === 'food' && part.object.visible)
          expect(part.object.setTexture).toHaveBeenLastCalledWith(
            preparation === 'biscuits' ? 'lunch-biscuits' : 'lunch-meal',
          );
      }
    };
    check(scene);
    const restored = loadScene(false, JSON.parse(JSON.stringify(after)));
    check(restored.scene);
    const joined = doActivity(
      tick(after, 720 - after.day.minute),
      'community-lunch-attend',
    );
    scene.sync({ ...view, state: joined });
    check(scene);
    expect(joined.inventory['community-lunch-photo']).toBe(1);
    expect(joined.log.at(-1)?.text.en).toContain('photograph');
  },
);

test('lunch leaves festival stalls, routes, the green entrance and actual residents intact', () => {
  const state = doActivity(lunchState(), 'community-lunch-tables');
  state.day.minute = 780;
  // Coexistence probe: normal gameplay puts the summer fair on the next day.
  state.day.festival = 'summer-fair';
  const { scene, view } = loadScene(false, state);
  const stalls = (Reflect.get(scene, 'worldObjects') as Drawing[]).find(
    (object) =>
      object.fillRect?.mock.calls.some(
        (args) => args[0] === 487 && args[1] === 493,
      ),
  )!;
  expect(stalls).toBeDefined();
  const props = lunchObjects(scene).filter((p) => p.cell);
  for (const { cell } of props) {
    expect(cell!.y * 16).toBeGreaterThan(519);
    expect(cell).not.toEqual({ x: 33, y: 33 });
  }
  for (const destination of (
    Reflect.get(scene, 'anchors') as Map<string, Cell>
  ).values()) {
    const path = Reflect.get(scene, 'findPath').call(
      scene,
      { x: 5, y: 12 },
      destination,
    ) as Cell[];
    expect(path.at(-1)).toEqual(destination);
    for (const { cell } of props) expect(path).not.toContainEqual(cell);
  }
  const residents = Reflect.get(scene, 'residents') as Map<string, Walker>;
  expect(npcAt(state, 'margaret')).toBe('green');
  expect(residents.get('margaret')!.sprite.visible).toBe(true);
  for (const [id, npc] of residents) {
    expect(npc.at).toBe(npcAt(state, id));
    for (const { cell } of props) expect(npc.cell).not.toEqual(cell);
  }
  view.state.day.minute = 960;
  scene.sync(view);
  expect(stalls.visible).toBe(true);
  expect(stalls.destroy).not.toHaveBeenCalled();
  for (const { cell } of props)
    expect(Reflect.get(scene, 'passable').call(scene, cell)).toBe(true);
});

test('brighter home is warmer by day, restrained after dusk and never changes outdoor night lighting', () => {
  const { scene, view } = loadScene(true);
  view.state.flags.push('brighter-home');
  for (const [minute, alpha] of [
    [720, 0.035],
    [1080, 0.02],
    [1260, 0.02],
  ]) {
    view.state.day.minute = minute;
    scene.sync(view);
    expect(
      (Reflect.get(scene, 'sky') as Drawing).fillStyle,
    ).toHaveBeenLastCalledWith(0xffd88b, alpha);
  }
  view.state.day.weather = 'sunny';
  scene.sync({ ...view, interior: false });
  expect(
    (Reflect.get(scene, 'sky') as Drawing).fillStyle,
  ).toHaveBeenLastCalledWith(0x162750, 0.48);
});

test.each(['label', 'homeLabel'] as const)(
  'edge %s labels fit inside the layer and fully offscreen labels stay hidden',
  (kind) => {
    const layer = textLayer();
    Object.assign(layer, { clientWidth: 320, clientHeight: 250 });
    const camera = {
      zoom: 1,
      getWorldPoint: (x: number, y: number) => ({ x, y }),
    };
    const label = new SceneText(layer, 0, 0, 'Long label', kind);
    for (const [x, y] of [
      [0, 1],
      [319, 249],
      [160, 125],
    ]) {
      Object.assign(label, { x, y });
      label.render(camera);
      expect(label.element.style.visibility).toBe('visible');
      const match = label.element.style.transform.match(
        /translate3d\(([-\d.]+)px, ([-\d.]+)px/,
      )!;
      const left = Number(match[1]) - label.element.offsetWidth / 2;
      const top =
        Number(match[2]) -
        (kind === 'homeLabel' ? label.element.offsetHeight : 0);
      expect(left).toBeGreaterThanOrEqual(6);
      expect(left + label.element.offsetWidth).toBeLessThanOrEqual(314);
      expect(top).toBeGreaterThanOrEqual(6);
      expect(top + label.element.offsetHeight).toBeLessThanOrEqual(244);
    }
    // Font-size/content changes are measured again; resizing is picked up next frame.
    Object.assign(label.element, { offsetWidth: 180, offsetHeight: 60 });
    Object.assign(layer, { clientWidth: 240, clientHeight: 180 });
    Object.assign(label, { x: 239, y: 179 });
    label.render(camera);
    expect(label.element.style.transform).toContain('144px');
    label.x = 1000;
    label.render(camera);
    expect(label.element.style.visibility).toBe('hidden');
    label.x = 120;
    label.render(camera);
    expect(label.element.style.visibility).toBe('visible');
  },
);

test.each([
  [355, 256],
  [854, 360],
  [355, 310],
])(
  'indoor camera at %s × %s uses fitting half-step zoom with pixel rounding',
  (width, height) => {
    const { scene, camera } = loadScene(true);
    Object.assign(scene.scale, { width, height });
    Reflect.get(scene, 'resizeCamera').call(scene);
    expect(Number.isInteger(camera.zoom * 2)).toBe(true);
    expect(camera.zoom * homeMap.width * 16).toBeLessThanOrEqual(width);
    expect(camera.zoom * homeMap.height * 16).toBeLessThanOrEqual(height);
    expect(Reflect.get(camera, 'roundPixels')).toBe(true);
  },
);

test('bright rent lights the window and a purchased lamp locally, clearing both when rent ends', () => {
  const { scene, view } = loadScene(true);
  const light = Reflect.get(scene, 'sky') as Drawing;
  expect(light.fillCircle).not.toHaveBeenCalled();
  view.state.flags.push('brighter-home');
  scene.sync(view);
  expect(light.fillRect).not.toHaveBeenCalled();
  expect(light.fillCircle.mock.calls.map(([x, y]) => [x, y])).toEqual(
    Array(3).fill([40, 48]),
  );
  light.fillCircle.mockClear();
  view.state.flags.push('furnished-desk-lamp');
  scene.sync(view);
  expect(light.fillCircle.mock.calls.map(([x, y]) => [x, y])).toEqual([
    ...Array(3).fill([40, 48]),
    ...Array(3).fill([136, 64]),
  ]);
  light.fillCircle.mockClear();
  view.state.flags = view.state.flags.filter((f) => f !== 'brighter-home');
  scene.sync(view);
  expect(light.fillCircle).not.toHaveBeenCalled();
  expect(light.clear).toHaveBeenCalled();
});
