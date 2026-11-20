import * as Phaser from 'phaser';
import {
  mapSurprises,
  npcAt,
  npcs,
  places,
  type GameState,
  type PlaceId,
  type Outcome,
  type AnchorId,
  type Text,
} from '@uk-immigration/game';
import { cropIds, spritePath, visibleResidents, homeSpot } from './session';
import {
  renderSceneLabels,
  SceneText,
  showSceneFeedback,
  syncSceneLabels,
} from './scene-text';
import { setSoundEnvironment } from './sound';
import {
  animalIds,
  animalPath,
  animalRoutes,
  animalStep,
  visibleAnimals,
  type Animal,
} from './wildlife';
import { shopSignIds, signPath } from './art';
import { distance, findPath, type Cell } from './pathfinding';
import {
  createLifeScenery,
  decorateFestival,
  decorateLunch,
  syncCrops,
  syncLifeScenery,
  syncLunch,
  type LifeScenery,
  type LunchProp,
} from './scene-decor';
import {
  festivalEffects,
  paintLight,
  paintWeather,
  updateWater,
} from './scene-effects';
import {
  buildMap,
  resizeMapCamera,
  syncMapScenery,
  tileSize as size,
  type AnimalSprite,
  type Furnishing,
  type Spot,
} from './scene-map';

export type Interaction =
  | { kind: 'place'; id: PlaceId }
  | { kind: 'npc'; id: string }
  | { kind: 'plot'; id: number }
  | { kind: 'surprise'; id: AnchorId; name: Text }
  | { kind: 'home'; id: 'bed' | 'kitchen' | 'desk' | 'mailbox' | 'exit' };
export type SceneFeedback = {
  token: number;
  outcome?: Outcome;
  hearts?: Record<string, { before: number; after: number }>;
  promotion?: boolean;
};
export type SceneView = {
  state: GameState;
  locale: 'zh-CN' | 'en';
  paused: boolean;
  interior: boolean;
  feedback?: SceneFeedback;
  focusNpc?: string;
};
type Walker = {
  sprite: Phaser.GameObjects.Sprite;
  cell: Cell;
  path: Cell[];
  target?: Cell;
  at: string;
  hide: boolean;
};
export class TownScene extends Phaser.Scene {
  private view: SceneView;
  private map?: Phaser.Tilemaps.Tilemap;
  private collision?: Phaser.Tilemaps.TilemapLayer;
  private player?: Phaser.GameObjects.Sprite;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private cell: Cell = { x: 4, y: 5 };
  private target?: Cell;
  private path: Cell[] = [];
  private direction = 0;
  private spots: Spot[] = [];
  private anchors = new Map<string, Cell>();
  private residents = new Map<string, Walker>();
  private animals = new Map<Animal, AnimalSprite>();
  private cropSprites: Phaser.GameObjects.Sprite[] = [];
  private furnishings: Furnishing[] = [];
  private townTiles?: Phaser.Tilemaps.Tileset;
  private lampLights: Phaser.GameObjects.Graphics[] = [];
  private sky?: Phaser.GameObjects.Graphics;
  private rain?: Phaser.GameObjects.Graphics;
  private water?: Phaser.GameObjects.Graphics;
  private waterTiles: Cell[] = [];
  private waterPhase = -1;
  private postBadge?: SceneText;
  private destination?: PlaceId;
  private queued?: Interaction;
  private entered?: string;
  private nearby?: Interaction;
  private ready = false;
  private feedbackToken?: number;
  private focusNpc?: string;
  private windows?: Phaser.GameObjects.Graphics;
  private celebration?: Phaser.GameObjects.Graphics;
  private lunch: LunchProp[] = [];
  private lunchCells = new Set<string>();
  private lifeCells = new Set<string>();
  private lifeScenery?: LifeScenery;
  private approachedSurprise?: AnchorId;
  private transients = new Map<
    SceneText | Phaser.GameObjects.Sprite,
    {
      duration: number;
      rise: number;
      bounds?: Phaser.Geom.Rectangle;
      started: boolean;
    }
  >();
  private dayNumber: number;
  private worldObjects: (Phaser.GameObjects.GameObject | SceneText)[] = [];
  constructor(
    view: SceneView,
    private onInteract: (i: Interaction) => void,
    private onNearby: (i?: Interaction) => void,
    private onReady: () => void,
    private onStep: () => void,
    private textLayer: HTMLDivElement,
  ) {
    super('town');
    this.view = view;
    this.dayNumber = view.state.dayNumber;
    this.feedbackToken = view.feedback?.token;
  }
  preload() {
    this.load.tilemapTiledJSON('town', '/game/town.json');
    this.load.tilemapTiledJSON('home', '/game/home.json');
    this.load.image('town-tiles', '/game/assets/modern-city/tiles.png');
    this.load.image('home-tiles', '/game/assets/indoor/tiles.png');
    this.load.image('home-details', '/game/assets/indoor/home-details.svg');
    for (const id of shopSignIds) this.load.image(`sign-${id}`, signPath(id));
    for (const id of animalIds)
      this.load.spritesheet(`animal-${id}`, animalPath(id), {
        frameWidth: 16,
        frameHeight: 16,
      });
    this.load.image('item-fallback', '/game/assets/indoor/item.png');
    this.load.spritesheet('lunch-furniture', '/game/assets/indoor/tiles.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image('lunch-meal', '/game/assets/items/meal.png');
    this.load.image('lunch-biscuits', '/game/assets/items/biscuits.png');
    for (const id of [this.view.state.characterId, ...npcs.map((n) => n.id)])
      this.load.spritesheet(id, spritePath(id), {
        frameWidth: 16,
        frameHeight: 16,
      });
    for (const crop of cropIds)
      this.load.spritesheet(`crop-${crop}`, `/game/assets/crops/${crop}.png`, {
        frameWidth: 16,
        frameHeight: 16,
      });
    this.load.spritesheet(
      'heart',
      '/game/assets/ninja-adventure/hud/heart.png',
      { frameWidth: 16, frameHeight: 16 },
    );
    this.load.spritesheet('spark', '/game/assets/ninja-adventure/fx/1.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }
  create() {
    for (const id of [this.view.state.characterId, ...npcs.map((n) => n.id)])
      for (let d = 0; d < 4; d++)
        if (!this.anims.exists(`${id}-${d}`))
          this.anims.create({
            key: `${id}-${d}`,
            frames: [0, 1, 2, 1].map((r) => ({ key: id, frame: r * 4 + d })),
            frameRate: 8,
            repeat: -1,
          });
    this.keys = this.input.keyboard!.addKeys(
      'UP,DOWN,LEFT,RIGHT,W,A,S,D,E,SPACE',
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.view.paused) return;
      const point = this.cameras.main.getWorldPoint(p.x, p.y);
      const cell = {
        x: Math.floor(point.x / size),
        y: Math.floor(point.y / size),
      };
      const npc = [...this.residents].find(
        ([, n]) =>
          n.at !== 'away' &&
          n.sprite.visible &&
          n.sprite.getBounds().contains(point.x, point.y),
      );
      if (npc) {
        this.queued = { kind: 'npc', id: npc[0] };
        this.walkTo(npc[1].cell);
        return;
      }
      const spot = this.spots.find(
        (s) => s.bounds.contains(point.x, point.y) || distance(s, cell) === 0,
      );
      this.destination = undefined;
      if (spot) {
        this.queued = spot.interaction;
        this.walkTo(spot);
      } else {
        this.queued = undefined;
        this.walkTo(cell);
      }
    });
    this.scale.on('resize', this.resizeCamera, this);
    this.game.events.on('postrender', this.renderText, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resizeCamera, this);
      this.game.events.off('postrender', this.renderText, this);
      for (const object of this.worldObjects)
        if (object instanceof SceneText) object.destroy();
      for (const object of this.transients.keys())
        if (object instanceof SceneText) object.destroy();
    });
    this.ready = true;
    this.loadWorld();
    this.onReady();
  }
  private own<T extends Phaser.GameObjects.GameObject | SceneText>(
    object: T,
  ): T {
    this.worldObjects.push(object);
    return object;
  }
  private loadWorld(fromHome = false) {
    this.halt();
    this.onNearby(undefined);
    this.nearby = undefined;
    this.entered = undefined;
    this.spots = [];
    this.anchors.clear();
    this.residents.clear();
    this.animals.clear();
    this.water = undefined;
    this.waterTiles = [];
    this.waterPhase = -1;
    this.cropSprites = [];
    this.furnishings = [];
    this.townTiles = undefined;
    this.lampLights = [];
    this.windows = undefined;
    this.celebration = undefined;
    this.lunch = [];
    this.lunchCells.clear();
    this.lifeCells.clear();
    this.lifeScenery = undefined;
    this.approachedSurprise = undefined;
    this.focusNpc = undefined;
    for (const o of this.transients.keys()) {
      this.tweens.killTweensOf(o);
      o.destroy();
    }
    this.transients.clear();
    for (const o of this.worldObjects) o.destroy();
    this.worldObjects = [];
    this.map?.destroy();
    const own = this.own.bind(this);
    ({
      map: this.map,
      collision: this.collision,
      furnishings: this.furnishings,
      townTiles: this.townTiles,
      cell: this.cell,
      player: this.player,
      spots: this.spots,
      water: this.water,
      waterTiles: this.waterTiles,
      cropSprites: this.cropSprites,
      lampLights: this.lampLights,
      windows: this.windows,
    } = buildMap(
      this,
      this.view,
      fromHome,
      this.textLayer,
      own,
      this.anchors,
      this.animals,
    ));
    if (!this.view.interior) {
      this.celebration = decorateFestival(
        this,
        this.view.state.day.festival,
        own,
      );
      this.lunch = decorateLunch(this, own);
      this.lifeScenery = createLifeScenery(this, own);
    }
    this.sky = this.own(this.add.graphics().setScrollFactor(0).setDepth(1500));
    this.rain = this.own(this.add.graphics().setScrollFactor(0).setDepth(1600));
    this.postBadge = this.own(
      new SceneText(
        this.textLayer,
        this.view.interior ? 14 * 16 : 5 * 16,
        this.view.interior ? 8 * 16 : 10 * 16,
        '',
        'badge',
      ),
    );
    this.cameras.main.setBackgroundColor(
      this.view.interior ? '#2a1f18' : '#a8c580',
    );
    this.cameras.main
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
      .startFollow(this.player, true, 0.15, 0.15);
    this.resizeCamera();
    this.sync(this.view);
    if (this.destination && !this.view.interior)
      this.walkToLocation(this.destination);
  }
  private renderText() {
    const camera = this.cameras.main;
    renderSceneLabels(
      camera,
      this.input,
      this.spots,
      this.cell,
      this.nearby,
      this.anchors,
      this.lifeScenery,
    );
    for (const object of this.worldObjects)
      if (object instanceof SceneText) object.render(camera);
    for (const object of this.transients.keys())
      if (object instanceof SceneText) object.render(camera);
  }
  private resizeCamera() {
    if (!this.map) return;
    resizeMapCamera(this, this.map, this.view.interior);
    this.paintLight();
  }
  sync(view: SceneView) {
    const wasPaused = this.view.paused;
    const swap = this.view.interior !== view.interior;
    const nextDay = this.dayNumber !== view.state.dayNumber;
    this.view = view;
    this.dayNumber = view.state.dayNumber;
    if (!this.ready) return;
    if (swap || nextDay) {
      if (nextDay) this.destination = undefined;
      this.loadWorld(swap);
      return;
    }
    if (view.paused) this.halt();
    else if (wasPaused && this.destination)
      this.walkToLocation(this.destination);
    this.syncLifeScenery();
    syncSceneLabels(view, this.spots, this.postBadge);
    syncCrops(view.state, this.cropSprites);
    syncMapScenery(
      this.textures,
      view.state,
      this.furnishings,
      this.collision,
      this.townTiles,
    );
    syncLunch(view, this.lunch, this.lunchCells);
    this.syncResidents();
    const visible = visibleAnimals(view.state, view.interior);
    for (const [id, animal] of this.animals)
      animal.sprite.setVisible(visible.includes(id));
    const focus = view.focusNpc
      ? this.residents.get(view.focusNpc)?.sprite
      : undefined;
    if (!view.interior && this.focusNpc !== view.focusNpc) {
      this.focusNpc = view.focusNpc;
      this.cameras.main.startFollow(
        focus?.visible ? focus : this.player!,
        true,
        0.15,
        0.15,
      );
    }
    this.paintLight();
    if (view.feedback && view.feedback.token !== this.feedbackToken) {
      this.feedbackToken = view.feedback.token;
      showSceneFeedback(
        this,
        view.feedback,
        view.locale,
        this.textLayer,
        this.player,
        this.residents,
        this.float.bind(this),
      );
    }
  }
  private syncResidents() {
    const residents = visibleResidents(this.view.state, this.view.interior);
    const occupied = new Set<string>();
    for (const [id, n] of this.residents) {
      if (!residents.some((npc) => npc.id === id)) {
        if (
          !this.view.interior &&
          npcAt(this.view.state, id) === 'away' &&
          n.sprite.visible
        ) {
          if (n.at !== 'away') {
            n.at = 'away';
            n.hide = true;
            n.path = this.route(
              n.target ?? n.cell,
              this.anchors.get('station')!,
            );
          }
          if (n.target || n.path.length) continue;
        }
        n.sprite.destroy();
        this.residents.delete(id);
      }
    }
    residents.forEach((person, index) => {
      const at = npcAt(this.view.state, person.id);
      const target = this.view.interior
        ? homeSpot(index)
        : places.some((p) => p.id === at && p.kind === 'building')
          ? this.anchors.get(at)!
          : this.residentSpot(this.anchors.get(at)!, occupied);
      const hide =
        !this.view.interior &&
        this.view.focusNpc !== person.id &&
        places.some((p) => p.id === at && p.kind === 'building');
      const npc = this.residents.get(person.id);
      if (!npc) {
        const sprite = this.own(
          this.add
            .sprite(target.x * size + 8, target.y * size + 10, person.id)
            .setOrigin(0.5, 0.8)
            .setDepth(10 + target.y * size)
            .setVisible(!hide),
        );
        this.residents.set(person.id, {
          sprite,
          cell: { ...target },
          path: [],
          at,
          hide,
        });
      } else if (
        npc.at !== at ||
        npc.hide !== hide ||
        distance(npc.path.at(-1) ?? npc.target ?? npc.cell, target) > 0
      ) {
        npc.at = at;
        npc.hide = hide;
        npc.sprite.setVisible(true);
        npc.path = this.route(npc.target ?? npc.cell, target);
        if (!npc.path.length && !npc.target && hide)
          npc.sprite.setVisible(false);
      }
    });
  }
  private residentSpot(anchor: Cell, occupied: Set<string>): Cell {
    const queue = [anchor];
    const visited = new Set<string>();
    for (let index = 0; index < queue.length; index++) {
      const cell = queue[index];
      const key = `${cell.x}:${cell.y}`;
      if (visited.has(key) || !this.passable(cell)) continue;
      visited.add(key);
      if (!occupied.has(key)) {
        occupied.add(key);
        return cell;
      }
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ])
        queue.push({ x: cell.x + dx, y: cell.y + dy });
    }
    return anchor;
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
  private paintLight() {
    paintLight(
      this,
      this.view,
      this.sky,
      this.rain,
      this.lampLights,
      this.windows,
    );
  }
  private float(
    object: SceneText | Phaser.GameObjects.Sprite,
    duration: number,
    rise: number,
  ) {
    if (this.transients.size >= 12) {
      const oldest = this.transients.keys().next().value!;
      this.tweens.killTweensOf(oldest);
      oldest.destroy();
      this.transients.delete(oldest);
    }
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const travel = reduced ? 0 : rise;
    if (object instanceof SceneText)
      object.avoidLabels(this.cameras.main, this.spots, travel);
    const bounds =
      object instanceof SceneText
        ? new Phaser.Geom.Rectangle(
            object.x - object.element.offsetWidth / this.cameras.main.zoom / 2,
            object.y - object.element.offsetHeight / this.cameras.main.zoom,
            object.element.offsetWidth / this.cameras.main.zoom,
            object.element.offsetHeight / this.cameras.main.zoom,
          )
        : undefined;
    if (bounds) {
      // Reserve the whole upward path, including every line of the text.
      bounds.y -= travel;
      bounds.height += travel;
      object.setVisible(false);
    }
    this.transients.set(object, {
      duration,
      rise: travel,
      bounds,
      started: false,
    });
    this.startFloats();
  }
  private startFloats() {
    const earlier: Phaser.Geom.Rectangle[] = [];
    for (const [object, feedback] of this.transients) {
      const { bounds } = feedback;
      const blocked =
        bounds &&
        earlier.some((area) => Phaser.Geom.Rectangle.Overlaps(area, bounds));
      if (bounds) earlier.push(bounds);
      if (feedback.started || blocked) continue;
      feedback.started = true;
      object.setVisible(true);
      this.tweens.add({
        targets: object,
        y: object.y - feedback.rise,
        alpha: 0,
        duration: feedback.duration,
        onComplete: () => {
          object.destroy();
          this.transients.delete(object);
          this.startFloats();
        },
      });
    }
  }
  halt() {
    this.path = [];
    this.queued = undefined;
    this.player?.anims.stop();
    if (this.player && this.target) {
      this.player.setPosition(this.cell.x * size + 8, this.cell.y * size + 10);
      this.target = undefined;
    }
    if (this.keys) Object.values(this.keys).forEach((k) => k.reset());
  }
  private route(start: Cell, end: Cell) {
    return this.map
      ? findPath(start, end, (cell) => this.passable(cell), this.map.width)
      : [];
  }
  private passable(cell: Cell) {
    return (
      !!this.map &&
      cell.x >= 0 &&
      cell.y >= 0 &&
      cell.x < this.map.width &&
      cell.y < this.map.height &&
      !this.lunchCells.has(`${cell.x}:${cell.y}`) &&
      !this.lifeCells.has(`${cell.x}:${cell.y}`) &&
      !((this.collision?.getTileAt(cell.x, cell.y)?.index ?? -1) > 0)
    );
  }
  private walkTo(cell: Cell) {
    this.path = this.route(this.target ?? this.cell, cell);
    if (
      !this.path.length &&
      !this.target &&
      distance(this.cell, cell) <= 1 &&
      this.queued
    ) {
      const i = this.queued;
      this.queued = undefined;
      this.activate(i);
    }
  }
  walkToLocation(id: PlaceId) {
    this.destination = id;
    if (!this.ready) return;
    if (this.view.interior) {
      if (id === 'home') {
        this.onInteract({ kind: 'home', id: 'desk' });
        this.destination = undefined;
        return;
      }
      const exit = this.spots.find(
        (s) => s.interaction.kind === 'home' && s.interaction.id === 'exit',
      )!;
      this.queued = exit.interaction;
      this.walkTo(exit);
      return;
    }
    const spot = this.spots.find(
      (s) => s.interaction.kind === 'place' && s.interaction.id === id,
    )!;
    this.queued = spot.interaction;
    this.walkTo(spot);
  }
  walkToNpc(id: string) {
    const npc = this.residents.get(id);
    if (!npc?.sprite.visible || npc.at === 'away') return;
    this.destination = undefined;
    this.queued = { kind: 'npc', id };
    this.walkTo(npc.target ?? npc.cell);
  }
  interact() {
    if (this.view.paused) return;
    if (this.nearby) this.activate(this.nearby);
  }
  private activate(i: Interaction) {
    if (i.kind === 'surprise') {
      const clue = mapSurprises(this.view.state).find(
        (entry) => entry.phase === 'clue' && entry.anchor === i.id,
      );
      if (!clue || distance(this.anchors.get(i.id)!, this.cell) > 1) return;
      this.approachedSurprise = i.id;
    }
    if (i.kind === 'npc') {
      const npc = this.residents.get(i.id);
      if (!npc?.sprite.visible || npc.at === 'away') return;
      if (distance(npc.cell, this.cell) > 1) {
        this.queued = i;
        this.walkTo(npc.target ?? npc.cell);
        return;
      }
    }
    if (i.kind === 'place') this.destination = undefined;
    this.halt();
    this.onInteract(i);
  }
  private move(
    sprite: Phaser.GameObjects.Sprite,
    target: Cell,
    speed: number,
    delta: number,
    id: string,
  ) {
    const x = target.x * size + 8,
      y = target.y * size + 10,
      dx = x - sprite.x,
      dy = y - sprite.y,
      len = Math.hypot(dx, dy);
    const direction =
      Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
    sprite.play(`${id}-${direction}`, true);
    sprite.setDepth(10 + sprite.y);
    if (len <= (speed * delta) / 1000) {
      sprite.setPosition(x, y);
      sprite.anims.stop();
      sprite.setFrame(direction);
      return true;
    }
    sprite.x += ((dx / len) * speed * delta) / 1000;
    sprite.y += ((dy / len) * speed * delta) / 1000;
    return false;
  }
  private updateAnimals(delta: number) {
    if (!this.animals.size) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const occupied = [
      this.player!,
      ...[...this.residents.values()]
        .filter((n) => n.sprite.visible)
        .map((n) => n.sprite),
    ];
    for (const [id, animal] of this.animals) {
      const { sprite } = animal;
      if (!sprite.visible) continue;
      const target = animalRoutes[id][animal.next];
      // Water is duck habitat; land animals obey the existing map and scenery.
      const allowed =
        id === 'duck'
          ? this.map
              ?.getLayer('ground')
              ?.tilemapLayer.getTileAt(target.x, target.y)?.index === 5
          : this.passable(target);
      if (!allowed) continue;
      const goal = { x: target.x * size + 8, y: target.y * size + 10 };
      const next = animalStep(sprite, goal, delta, occupied, reduced);
      const moving = next.x !== sprite.x || next.y !== sprite.y;
      if (moving) {
        sprite.setFlipX(next.x < sprite.x);
        animal.elapsed += Math.min(delta, 50);
        sprite.setPosition(next.x, next.y);
      }
      sprite.setFrame(
        !reduced && moving ? Math.floor(animal.elapsed / 400) % 2 : 0,
      );
      sprite.setDepth(sprite.y + 9);
      if (sprite.x === goal.x && sprite.y === goal.y)
        animal.next = (animal.next + 1) % animalRoutes[id].length;
    }
  }
  update(time: number, delta: number) {
    if (!this.ready || !this.player) return;
    const pond = this.anchors.get('pond');
    setSoundEnvironment({
      weather: this.view.state.day.weather,
      minute: this.view.state.day.minute,
      interior: this.view.interior,
      nearPond:
        !!pond &&
        Math.hypot(
          this.player.x / size - pond.x,
          this.player.y / size - pond.y,
        ) <= 7,
    });
    paintWeather(this, this.view, this.rain, time);
    festivalEffects(this.celebration, this.view.state.day.minute, time);
    this.waterPhase = updateWater(
      this.water,
      this.waterTiles,
      this.waterPhase,
      time,
    );
    if (this.view.paused) return;
    this.updateAnimals(delta);
    for (const [id, n] of this.residents) {
      if (!n.target) n.target = n.path.shift();
      if (n.target && this.move(n.sprite, n.target, 40, delta, id)) {
        n.cell = n.target;
        n.target = undefined;
        if (!n.path.length && n.hide) {
          if (n.at === 'away') {
            n.sprite.destroy();
            this.residents.delete(id);
          } else n.sprite.setVisible(false);
        }
      }
    }
    const keys = this.keys!;
    if (
      Phaser.Input.Keyboard.JustDown(keys.E) ||
      Phaser.Input.Keyboard.JustDown(keys.SPACE)
    ) {
      this.interact();
      return;
    }
    if (!this.target) {
      const dx =
        keys.LEFT.isDown || keys.A.isDown
          ? -1
          : keys.RIGHT.isDown || keys.D.isDown
            ? 1
            : 0;
      const dy = dx
        ? 0
        : keys.UP.isDown || keys.W.isDown
          ? -1
          : keys.DOWN.isDown || keys.S.isDown
            ? 1
            : 0;
      if (dx || dy) {
        this.path = [];
        this.queued = undefined;
        this.destination = undefined;
        const next = { x: this.cell.x + dx, y: this.cell.y + dy };
        if (this.passable(next)) this.target = next;
        this.direction = dx < 0 ? 1 : dx > 0 ? 2 : dy < 0 ? 3 : 0;
      } else this.target = this.path.shift();
    }
    if (
      this.target &&
      this.move(
        this.player,
        this.target,
        this.destination ? 145 : 85,
        Math.min(delta, 60),
        this.view.state.characterId,
      )
    ) {
      this.cell = this.target;
      this.target = undefined;
      this.onStep();
      if (!this.path.length && this.queued) {
        const queued = this.queued;
        this.queued = undefined;
        this.activate(queued);
        return;
      }
      const door = this.spots.find(
        (s) =>
          distance(s, this.cell) === 0 &&
          ((s.interaction.kind === 'home' && s.interaction.id === 'exit') ||
            (s.interaction.kind === 'place' &&
              places.find((p) => p.id === s.interaction.id)?.kind ===
                'building')),
      );
      if (door && !this.path.length) {
        const id = JSON.stringify(door.interaction);
        if (this.entered !== id) {
          this.entered = id;
          this.activate(door.interaction);
          return;
        }
      } else this.entered = undefined;
    }
    if (!this.target && !this.path.length) {
      this.player.anims.stop();
      this.player.setFrame(this.direction);
    }
    const surprise = this.spots.find(
      (spot) =>
        spot.interaction.kind === 'surprise' && distance(spot, this.cell) <= 1,
    );
    if (surprise && this.approachedSurprise !== surprise.interaction.id) {
      this.activate(surprise.interaction);
      return;
    }
    if (!surprise) this.approachedSurprise = undefined;
    const npc = [...this.residents].find(
      ([, n]) =>
        n.at !== 'away' && n.sprite.visible && distance(n.cell, this.cell) <= 1,
    );
    const near: Interaction | undefined = npc
      ? { kind: 'npc', id: npc[0] }
      : this.spots.find((s) => distance(s, this.cell) <= 1)?.interaction;
    if (JSON.stringify(near) !== JSON.stringify(this.nearby)) {
      this.nearby = near;
      this.onNearby(near);
    }
  }
}
