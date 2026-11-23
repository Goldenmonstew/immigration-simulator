import './load-game-characters';
import { expect, test, vi } from 'vitest';
import {
  approachSurprise,
  currentEvent,
  doActivity,
  mapSurprises,
  newGame,
  resolve,
  type GameState,
  type MapSurprise,
  type PlaceId,
} from '@uk-immigration/game';
import {
  TownScene,
  type Interaction,
  type SceneView,
} from '../app/uk/game/scene';
import type { SceneText } from '../app/uk/game/scene-text';
import { flowerbedStage, lifePlaceLabel } from '../app/uk/game/scene-life';
import town from '../public/game/town.json';

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
    },
  },
}));

class Drawing {
  visible = true;
  x = 0;
  y = 0;
  depth = 0;
  anims = { stop: vi.fn() };
  clear = vi.fn(() => {
    this.fillRect.mockClear();
    this.fillTriangle.mockClear();
    this.lineBetween.mockClear();
    return this;
  });
  fillStyle = vi.fn(() => this);
  lineStyle = vi.fn(() => this);
  fillRect = vi.fn(() => this);
  fillTriangle = vi.fn(() => this);
  lineBetween = vi.fn(() => this);
  setDepth(depth: number) {
    this.depth = depth;
    return this;
  }
  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }
  setVisible(visible: boolean) {
    this.visible = visible;
    return this;
  }
  setFrame() {
    return this;
  }
  destroy() {
    this.visible = false;
  }
}

function setup(change: (state: GameState) => void = () => {}) {
  let state = newGame('skilled-worker', 42, 'en');
  state.day.minute = 600;
  state.day.weather = 'sunny';
  delete state.pendingEvent;
  delete state.day.festival;
  change(state);
  const view: SceneView = {
    state,
    locale: 'en',
    interior: false,
    paused: false,
  };
  const layer = {
    ownerDocument: {
      createElement: () => ({ dataset: {}, style: {}, remove() {} }),
    },
    appendChild() {},
  } as unknown as HTMLDivElement;
  const onInteract = vi.fn<(interaction: Interaction) => void>();
  const scene = new TownScene(
    view,
    onInteract,
    vi.fn(),
    vi.fn(),
    vi.fn(),
    layer,
  );
  const anchors = new Map(
    town.layers
      .filter((l) => ['places', 'anchors'].includes(l.name))
      .flatMap((l) => l.objects ?? [])
      .map((o) => [o.name, { x: o.x / 16, y: o.y / 16 }]),
  );
  const scenery = {
    flowerbed: new Drawing(),
    mayDay: new Drawing(),
    surprises: new Map<
      string,
      { drawing: Drawing; label: SceneText; clue: MapSurprise }
    >(),
  };
  const collision = town.layers.find((l) => l.name === 'collision')!.data!;
  Object.assign(scene, {
    ready: true,
    anchors,
    lifeScenery: scenery,
    map: { width: town.width, height: town.height },
    collision: {
      getTileAt: (x: number, y: number) => ({
        index: collision[y * town.width + x],
      }),
    },
    add: { graphics: () => new Drawing() },
    player: new Drawing(),
    keys: Object.fromEntries(
      ['UP', 'DOWN', 'LEFT', 'RIGHT', 'W', 'A', 'S', 'D', 'E', 'SPACE'].map(
        (key) => [key, { isDown: false, reset() {} }],
      ),
    ),
  });
  function sync(next = state) {
    state = next;
    view.state = next;
    Reflect.get(scene, 'syncLifeScenery').call(scene);
  }
  const label = (place: PlaceId) =>
    lifePlaceLabel(view.state, view.locale, place);
  const spots = () =>
    Reflect.get(scene, 'spots') as { interaction: Interaction }[];
  sync();
  return {
    scene,
    state,
    view,
    scenery,
    sync,
    label,
    spots,
    anchors,
    onInteract,
  };
}

test('flowerbed changes from empty ground through three flag-driven pictures and keeps the gate clear', () => {
  const { scene, state, view, scenery, sync, label, anchors } = setup();
  const bed = scenery.flowerbed;
  expect(bed.fillRect.mock.calls).toHaveLength(1);
  expect(label('allotment')).toBe('');
  expect(Reflect.get(scene, 'lifeCells').size).toBe(0);
  state.flags.push('flowerbed-marked');
  sync();
  const marked = JSON.stringify(bed.fillRect.mock.calls);
  expect(label('allotment')).toContain('marked out');
  expect(bed.lineBetween).toHaveBeenCalled();
  const gate = anchors.get('allotment-gate')!;
  expect(Reflect.get(scene, 'passable').call(scene, gate)).toBe(true);
  expect(
    Reflect.get(scene, 'passable').call(scene, { x: gate.x + 1, y: gate.y }),
  ).toBe(false);
  state.flags.push('flowerbed-prepared');
  sync();
  expect(JSON.stringify(bed.fillRect.mock.calls)).not.toBe(marked);
  state.flags.push('flowerbed-planted');
  sync();
  const planted = JSON.stringify(bed.fillRect.mock.calls);
  expect(planted).not.toBe(marked);
  expect(label('allotment')).toContain('planted');
  state.flags.push('flowerbed-tended', 'flowerbed-open');
  sync();
  expect(JSON.stringify(bed.fillRect.mock.calls)).not.toBe(planted);
  expect(label('allotment')).toContain('open');
  state.quarter = 1;
  sync(JSON.parse(JSON.stringify(state)) as GameState);
  expect(label('allotment')).toContain('open');
  expect(flowerbedStage(view.state.flags)).toBe(3);
});

test.each(['ribbons', 'signs'] as const)(
  'May Day shows the real %s preparation and moves it to the outdoor festival',
  (preparation) => {
    const { state, scenery, sync, label, anchors } = setup((s) => {
      s.quarter = 2;
      s.day.index = 0;
      s.day.minute = 600;
      s.day.place = 'council';
    });
    expect(label('council')).toContain('preparations');
    expect(label('council')).not.toContain('your');
    const prepared = doActivity(state, `may-prepare-${preparation}`);
    expect(prepared.mayDay?.preparation).toBe(preparation);
    sync(prepared);
    expect(label('council')).toContain(`your ${preparation}`);
    expect(scenery.mayDay.visible).toBe(true);
    if (preparation === 'signs')
      expect(scenery.mayDay.fillTriangle).toHaveBeenCalled();
    prepared.day.index = 2;
    prepared.day.festival = 'may-day';
    sync(prepared);
    expect(label('green')).toContain(`your ${preparation}`);
    expect(label('council')).toBeUndefined();
    expect(scenery.mayDay.x).toBe(anchors.get('green')!.x * 16 + 38);
    expect(scenery.mayDay.lineBetween).toHaveBeenCalledTimes(3);
    // The previous year's contribution never becomes this year's preparation.
    prepared.year++;
    sync(prepared);
    expect(label('green')).not.toContain('your');
    delete prepared.day.festival;
    prepared.quarter = 3;
    sync(prepared);
    expect(scenery.mayDay.visible).toBe(false);
    expect(label('green')).toBeUndefined();
  },
);

test.each(['rain', 'snow'] as const)(
  'May Day %s uses the town hall display and has no outdoor May Day label',
  (weather) => {
    const { scenery, label, anchors } = setup((s) => {
      s.day.festival = 'may-day';
      s.day.weather = weather;
      s.mayDay = { year: s.year, preparation: 'ribbons' };
    });
    expect(label('council')).toContain('May Day · indoors');
    expect(label('green')).toBeUndefined();
    expect(scenery.mayDay.x).toBe(anchors.get('council')!.x * 16 + 8);
    expect(scenery.mayDay.y).toBeLessThan(anchors.get('council')!.y * 16);
  },
);

const surprises = [
  {
    id: 'biscuit-cat',
    day: 2,
    anchor: 'high-street-west',
    choices: ['wait', 'call'],
  },
  { id: 'swap-box', day: 4, anchor: 'library-steps', choices: ['pot', 'sort'] },
  {
    id: 'lost-mitten',
    day: 7,
    anchor: 'park-bench',
    choices: ['desk', 'owner'],
  },
] as const;

test.each(surprises)(
  '$id appears only inside its real time window and removes its interaction on expiry',
  ({ id, day, anchor }) => {
    const { state, scenery, sync, spots } = setup((s) => {
      s.dayNumber = day;
      s.day.minute = 539;
    });
    expect(scenery.surprises.size).toBe(0);
    state.day.minute = 540;
    sync();
    const entry = scenery.surprises.get(id)!;
    expect(entry.drawing.visible).toBe(true);
    expect(entry.drawing.fillRect).toHaveBeenCalled();
    expect(entry.label.visible).toBe(true);
    expect(entry.label.element.textContent).toBeTruthy();
    expect(spots().map((s) => s.interaction)).toEqual([
      { kind: 'surprise', id: anchor, name: expect.any(Object) },
    ]);
    state.day.minute = 1079;
    sync();
    expect(entry.drawing.visible).toBe(true);
    state.day.minute = 1080;
    sync();
    expect(entry.drawing.visible).toBe(false);
    expect(entry.label.visible).toBe(false);
    expect(spots()).toHaveLength(0);
    state.dayNumber++;
    state.day.minute = 600;
    sync();
    expect(entry.drawing.visible).toBe(false);
  },
);

test.each(surprises)(
  '$id opens only on real proximity and its two result traces are non-interactive',
  ({ id, day, anchor, choices }) => {
    for (const choice of choices) {
      const { scene, state, scenery, sync, spots, anchors, onInteract } = setup(
        (s) => {
          s.dayNumber = day;
        },
      );
      const at = anchors.get(anchor)!;
      Object.assign(scene, { cell: { x: at.x + 2, y: at.y } });
      scene.update(0, 16);
      expect(onInteract).not.toHaveBeenCalled();
      Reflect.get(scene, 'activate').call(scene, spots()[0].interaction);
      expect(onInteract).not.toHaveBeenCalled();
      Object.assign(scene, { cell: { x: at.x + 1, y: at.y } });
      scene.update(16, 16);
      expect(onInteract).toHaveBeenCalledExactlyOnceWith({
        kind: 'surprise',
        id: anchor,
        name: expect.any(Object),
      });
      scene.update(32, 16);
      expect(onInteract).toHaveBeenCalledTimes(1);
      const pending = approachSurprise(state, anchor);
      expect(currentEvent(pending)?.id).toBe(`surprise-${id}`);
      sync(pending);
      expect(spots()).toHaveLength(0);
      expect(scenery.surprises.get(id)!.drawing.visible).toBe(false);
      const resolved = resolve(pending, choice);
      sync(resolved);
      const entry = scenery.surprises.get(id)!;
      expect(entry.drawing.visible).toBe(true);
      expect(entry.clue.phase).toBe('trace');
      expect(entry.label.element.textContent).toBe(
        mapSurprises(resolved).find((s) => s.id === id)!.text.en,
      );
      expect(spots()).toHaveLength(0);
      resolved.dayNumber += 30;
      sync(JSON.parse(JSON.stringify(resolved)) as GameState);
      expect(entry.drawing.visible).toBe(true);
      expect(spots()).toHaveLength(0);
      expect(approachSurprise(resolved, anchor)).toEqual(resolved);
    }
  },
);

test('expired queued interactions and paused scenes cannot open a surprise', () => {
  const { scene, state, view, sync, spots, anchors, onInteract } = setup(
    (s) => {
      s.dayNumber = 2;
    },
  );
  const interaction = spots()[0].interaction;
  Object.assign(scene, {
    cell: anchors.get('high-street-west'),
    nearby: interaction,
  });
  view.paused = true;
  scene.update(0, 16);
  scene.interact();
  expect(onInteract).not.toHaveBeenCalled();
  view.paused = false;
  state.day.minute = 1080;
  sync();
  scene.interact();
  expect(onInteract).not.toHaveBeenCalled();
});
