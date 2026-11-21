import { harness, mountClient, renderView } from './game-client-harness';
import { loadedCharacters } from './load-game-characters';
import * as React from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { evaluate, type Locale } from '@uk-immigration/engine';
import { currentLaw2026_11 } from '@uk-immigration/policy-data';
import * as core from '@uk-immigration/game';
import type { GameState } from '@uk-immigration/game';
import TownCanvas from '../app/game/town-canvas';
import {
  CharacterSelect,
  ControlHint,
  InteractButton,
  Ending,
  LifeMemories,
  EventCard,
  LocationMenu,
  Modal,
  ProgressBars,
  QuarterSummary,
  StatusBar,
  VisaReminder,
} from '../app/game/game-view';
import {
  Dialogue,
  Fishing,
  Inventory,
  ItemIcon,
  Kitchen,
  Mailbox,
  MorningCard,
  PlotMenu,
  Shop,
  TravelCard,
  OutcomeText,
} from '../app/game/life-overlays';
import {
  gameStorage,
  previewGameSave,
  gameDraft,
  itemIcon,
  spritePath,
  withGameLocale,
  visibleResidents,
  homeSpot,
  endingMemories,
  visaExpiresThisSeason,
} from '../app/game/session';
import {
  recordMemories,
  groupedMemories,
  type DayMemory,
} from '../app/game/diary';
import { t, withCount } from '../i18n';
import townMap from '../public/game/town.json';
import homeMap from '../public/game/home.json';
import { decodeDraft, encodeDraft } from '../lib/share';
import { portraitPath, townBanner } from '../app/game/art';
import Home from '../app/home-content';
import { AssessmentColumns } from '../components/result-view';
function expectCelebrationIcon(html: string) {
  const icon = html.match(
    /class="[^"]*catchCard[^"]*"[^>]*>(<span[^>]*>)/,
  )?.[1];
  expect(icon).toBeDefined();
  expect(icon).toContain('background-position:center');
  expect(icon).toContain('background-size:contain');
  expect(icon).not.toContain('32px');
}
const storage = new Map<string, string>();
const cjk = /[\u3400-\u9fff]/;
const fixtures: core.GameEvent[] = ['morning', 'letter', 'phone'].map((id) => ({
  id,
  title: { zhCN: '测试消息', en: 'Test message' },
  text: { zhCN: '今天的小事。', en: 'A moment today.' },
  weight: 0,
  once: true,
  channel: id as core.Channel,
  choices: [
    {
      id: 'yes',
      label: { zhCN: '好，记下了', en: 'All right' },
      effects:
        id === 'letter'
          ? [{ type: 'item', item: 'seed-potato', delta: 1 }]
          : [{ type: 'none' }],
    },
  ],
}));
// Test-only deliveries; all transitions still run through the real core.
const initial = (locale: Locale = 'zh-CN', id = core.characters[0].id) => {
  const state = core.newGame(id, 42, locale);
  state.eventQueue = [];
  state.pendingEvent = 'morning';
  state.day.deliveries = [
    { eventId: 'letter', channel: 'letter' },
    { eventId: 'phone', channel: 'phone', minute: 1080 },
  ];
  state.inventory = { tea: 2, biscuits: 1, 'seed-potato': 2, flowers: 1 };
  state.friendship.margaret = 86;
  return state;
};
const active = (locale: Locale = 'zh-CN') =>
  core.resolve(initial(locale), 'yes');
const at = (
  minute: number,
  place: core.PlaceId = 'home',
  locale: Locale = 'zh-CN',
) => {
  const s = active(locale);
  s.day.minute = minute;
  s.day.place = place;
  return s;
};
beforeEach(() => {
  storage.clear();
  for (const character of loadedCharacters) character.events.push(...fixtures);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, v: string) => storage.set(key, v),
  });
});
afterEach(() => {
  for (const character of loadedCharacters)
    character.events = character.events.filter(
      (event) => !fixtures.includes(event),
    );
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
test.each(['zh-CN', 'en'] as const)(
  'clock, weather, morning and all character choices in %s',
  (locale) => {
    const state = initial(locale),
      onContinue = vi.fn(),
      onChange = vi.fn();
    const hud = renderView(() => StatusBar({ state }), locale);
    expect(hud.html).toContain('07:00');
    expect(hud.html).toContain(state.day.date);
    expect(hud.html).toContain(t(`game.${state.day.weather}`, locale));
    expect(hud.html).not.toContain('action points');
    const morning = renderView(
      () => MorningCard({ state, onContinue }),
      locale,
    );
    expect(morning.html).toContain(
      withCount(t('game.mailCount', locale), 'count', 1),
    );
    morning.click(t('game.beginDay', locale));
    expect(onContinue).toHaveBeenCalledOnce();
    const select = renderView(
      () =>
        CharacterSelect({
          saves: { [state.characterId]: { state, available: true } },
          onSelect: onChange,
        }),
      locale,
    );
    for (const c of core.characters)
      expect(select.html).toContain(portraitPath(c.id));
    select.click(t('game.continue', locale));
    expect(onChange).toHaveBeenCalledWith(state.characterId, 'continue');
    if (locale === 'en')
      for (const v of [hud, morning, select]) expect(v.html).not.toMatch(cjk);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'hours, workday restrictions, office shift and indoor people in %s',
  (locale) => {
    let state = at(420, 'work', locale);
    const onChange = vi.fn();
    const closed = renderView(
      () => LocationMenu({ state, location: 'work', onChange }),
      locale,
    );
    expect(closed.html).toContain('09:00–20:00');
    expect(core.places.find((p) => p.id === 'work')!.hours!.opens).toBe(540);
    expect(closed.html).toContain(t('game.closed', locale));
    expect(closed.buttons).toHaveLength(0);
    state = at(540, 'work', locale);
    const onTalk = vi.fn();
    const menu = renderView(
      () => LocationMenu({ state, location: 'work', onChange, onTalk }),
      locale,
    );
    menu.click(locale === 'en' ? 'Work a shift' : '上班');
    const next = onChange.mock.lastCall![0];
    expect(next.day.minute).toBe(1020);
    expect(next.stats.money).toBeGreaterThan(state.stats.money);
    expect(next.stats.career).toBeGreaterThan(state.stats.career);
    menu.click(locale === 'en' ? 'Ade' : '阿德');
    expect(onTalk).toHaveBeenCalledWith('ade');
    state.day.kind = 'weekend';
    expect(core.activities(state, 'work')).toEqual([]);
    expect(core.activities(state, 'gp')).toEqual([]);
    state.day.minute = 480;
    expect(core.activities(state, 'council').length).toBeGreaterThan(0);
    const visa = renderView(
      () => LocationMenu({ state, location: 'visa', onChange }),
      locale,
    );
    expect(visa.html).not.toContain(t('game.closed', locale));
    if (locale === 'en') expect(menu.html).not.toMatch(cjk);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'dialogue, gift inventory and a speaker heart event in %s',
  (locale) => {
    let state = core.talk(active(locale), 'margaret');
    const onChange = (next: GameState) => {
      state = next;
    };
    const h = harness(
      () => Dialogue({ state, npc: 'margaret', onChange, onClose: () => {} }),
      locale,
    );
    let view = h.render();
    expect(view.html).toContain(
      core.npcs[0].name[locale === 'en' ? 'en' : 'zhCN'],
    );
    expect(core.hearts(state, 'margaret')).toBe(1);
    view.click(t('game.gift', locale));
    view = h.render();
    const before = state.inventory.tea;
    const giftButton = view.buttons.find((b) => b.label.includes('× 2'))!;
    giftButton.click();
    expect(state.day.gifted).toContain('margaret');
    expect(Object.values(state.inventory).reduce((a, b) => a + b, 0)).toBe(5);
    expect(state.friendship.margaret).toBeGreaterThan(100);
    expect(state.inventory.tea).toBeLessThanOrEqual(before);
    view = h.render();
    expect(
      view.buttons.find((b) => b.label === t('game.giftDone', locale))
        ?.disabled,
    ).toBe(true);
    state = {
      ...state,
      day: { ...state.day, talked: [] },
      friendship: { margaret: 190 },
    };
    state = core.talk(state, 'margaret');
    expect(core.currentEvent(state)?.speaker).toBe('margaret');
    view = h.render();
    const heartEvent = core.currentEvent(state)!;
    const paragraphs =
      heartEvent.text[locale === 'en' ? 'en' : 'zhCN'].split('\n');
    for (let index = 0; index < paragraphs.length; index++) {
      view.click(t('game.reveal', locale));
      view = h.render();
      if (index < paragraphs.length - 1) {
        view.click(t('game.continuePlaying', locale));
        view = h.render();
      }
    }
    view.click(heartEvent.choices[0].label[locale === 'en' ? 'en' : 'zhCN']);
    expect(state.pendingEvent).toBeUndefined();
    expect(state.firedEvents).toContain(heartEvent.id);
    if (locale === 'en') expect(view.html).not.toMatch(cjk);
    h.dispose();
  },
);

test.each(['zh-CN', 'en'] as const)(
  'heart scenes type and reveal one paragraph at a time before offering choices in %s',
  (locale) => {
    vi.useFakeTimers();
    let state = active(locale);
    state.friendship.margaret = 190;
    state = core.talk(state, 'margaret');
    const event = core.currentEvent(state)!;
    const key = locale === 'en' ? 'en' : 'zhCN';
    const paragraphs = event.text[key].split('\n');
    expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    const onChange = vi.fn((next: GameState) => {
      state = next;
    });
    const h = harness(
      () => Dialogue({ state, npc: 'margaret', onChange, onClose: vi.fn() }),
      locale,
    );
    const hasChoices = (view: ReturnType<typeof h.render>) =>
      view.buttons.some((b) => b.label.startsWith(event.choices[0].label[key]));
    for (let index = 0; index < paragraphs.length; index++) {
      h.render();
      h.flush();
      let view = h.render();
      expect(view.html).toContain('lineMeasure');
      expect(view.html).toContain('revealHint');
      expect(view.html).toContain(
        `aria-label="${paragraphs[index].replaceAll('"', '&quot;').replaceAll("'", '&#x27;')}"`,
      );
      expect(view.html).toContain('<span aria-hidden="true">▍</span>');
      expect(hasChoices(view)).toBe(false);
      expect(
        view.buttons.some((b) => b.label === t('game.continuePlaying', locale)),
      ).toBe(false);
      if (index < paragraphs.length - 1)
        expect(view.html).not.toContain(paragraphs[index + 1]);

      vi.advanceTimersByTime(28);
      view = h.render();
      expect(view.html).toContain(`>${paragraphs[index][0]}<span`);
      expect(hasChoices(view)).toBe(false);
      if (index === 1) {
        vi.advanceTimersByTime(28 * (paragraphs[index].length - 1));
      } else view.click(t('game.reveal', locale));
      view = h.render();
      expect(
        view.buttons.some((b) => b.label === t('game.reveal', locale)),
      ).toBe(false);
      expect(
        view.buttons.find((b) => b.accessibleLabel === t('game.reveal', locale))
          ?.disabled,
      ).toBe(true);
      expect(view.html).toContain('revealHint');
      expect(hasChoices(view)).toBe(index === paragraphs.length - 1);
      expect(onChange).not.toHaveBeenCalled();
      if (index < paragraphs.length - 1) {
        expect(view.html).not.toContain(paragraphs[index + 1]);
        view.click(t('game.continuePlaying', locale));
      }
    }
    h.render().click(event.choices[0].label[key]);
    expect(onChange).toHaveBeenCalledOnce();
    expect(state.pendingEvent).toBeUndefined();
    expect(state.firedEvents).toContain(event.id);
    h.dispose();
  },
);

test('single-paragraph phone dialogue keeps its choices while the text is typing', () => {
  const state = active();
  state.pendingEvent = 'phone';
  const onChange = vi.fn();
  const view = renderView(() =>
    Dialogue({ state, npc: 'margaret', onChange, onClose: vi.fn() }),
  );
  expect(view.html).toContain('<span aria-hidden="true">▍</span>');
  expect(view.buttons.some((b) => b.label === t('game.continuePlaying'))).toBe(
    false,
  );
  view.click('好，记下了');
  expect(onChange.mock.calls[0][0].pendingEvent).toBeUndefined();
});

test.each(['zh-CN', 'en'] as const)(
  'speakerless event text uses separate paragraphs in %s',
  (locale) => {
    const event = fixtures[1];
    const original = event.text;
    event.text = {
      zhCN: '第一段。\n第二段。\n第三段。',
      en: 'First paragraph.\nSecond paragraph.\nThird paragraph.',
    };
    try {
      const state = active(locale);
      state.pendingEvent = event.id;
      const view = renderView(
        () => EventCard({ state, onChange: vi.fn() }),
        locale,
      );
      const paragraphs =
        event.text[locale === 'en' ? 'en' : 'zhCN'].split('\n');
      for (const paragraph of paragraphs)
        expect(view.html).toContain(`>${paragraph}</p>`);
      expect(view.html.match(/<p /g)).toHaveLength(3);
      view.click(event.choices[0].label[locale === 'en' ? 'en' : 'zhCN']);
    } finally {
      event.text = original;
    }
  },
);

test('shop quantity deducts actual money and adds seeds, then plot planting/watering/harvest', () => {
  let state = at(600, 'shop');
  state.quarter = 2;
  state.day.deliveries = [];
  const onChange = (s: GameState) => {
    state = s;
  };
  const h = harness(() => Shop({ state, place: 'shop', onChange }));
  let v = h.render();
  v.input('3.5');
  v = h.render();
  const before = state.stats.money;
  v.click('买');
  expect(state.stats.money).toBe(
    before - 3 * core.items.find((i) => i.id === 'seed-potato')!.price!,
  );
  expect(state.inventory['seed-potato']).toBe(5);
  h.dispose();
  vi.restoreAllMocks();
  state = core.doActivity(core.enter(state, 'allotment'), 'rent-plot');
  expect(state.plots).toHaveLength(6);
  const plot = () => renderView(() => PlotMenu({ state, plot: 0, onChange }));
  plot().click('土豆种子');
  expect(state.inventory['seed-potato']).toBe(4);
  expect(state.plots[0].seed).toBe('seed-potato');
  plot().click('浇水');
  expect(state.plots[0].wateredOn).toBe(state.dayNumber);
  state.day.deliveries = [];
  state = core.sleep(state);
  expect(state.plots[0].growth).toBe(2);
  state = core.enter(state, 'allotment');
  plot().click('浇水');
  state = core.sleep(state);
  expect(state.plots[0].growth).toBe(4);
  state = core.enter(state, 'allotment');
  plot().click('收获');
  expect(state.plots[0].seed).toBeUndefined();
  expect(state.inventory.potato).toBeGreaterThanOrEqual(1);
});

test.each([true, false])(
  'fishing reaction window records success=%s',
  (success) => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    let state = at(600, 'pond');
    const original = structuredClone(state);
    const before = { ...state.inventory };
    const change = vi.fn((s: GameState) => {
      state = s;
    });
    const h = harness(() => Fishing({ state, onChange: change }));
    h.render();
    h.flush();
    h.render().click('抛竿');
    h.render();
    expect(h.render().html).toContain('挥竿');
    vi.advanceTimersByTime(450);
    expect(h.render().html).toContain('看着浮标');
    vi.advanceTimersByTime(1000);
    expect(h.render().html).toContain('咬钩了');
    if (success) {
      vi.advanceTimersByTime(400);
      h.render().click('收竿');
    } else vi.advanceTimersByTime(601);
    expect(h.render().html).toContain('收紧鱼线');
    expect(change).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(change).toHaveBeenCalledTimes(success ? 1 : 0);
    if (success) {
      expect(state.outcome?.kind).toBe('catch');
      expect(state.day.minute).toBe(630);
      expect(h.render().html).toContain('首次收录');
      expect(h.render().html).toContain('meadow-town/fish/');
      expectCelebrationIcon(h.render().html);
    } else {
      expect(state).toEqual(original);
      expect(h.render().html).toContain('鱼游走了');
    }
    expect(
      Object.values(state.inventory).reduce((a, b) => a + b, 0) -
        Object.values(before).reduce((a, b) => a + b, 0),
    ).toBe(success ? 1 : 0);
    vi.advanceTimersByTime(1000);
    expect(change).toHaveBeenCalledTimes(success ? 1 : 0);
    h.dispose();
  },
);

test('mailbox read removes a letter, resolves an event and adds its enclosed item', () => {
  let state = active();
  const change = (s: GameState) => {
    state = s;
  };
  expect(core.mailbox(state)).toHaveLength(1);
  renderView(() => Mailbox({ state, onChange: change })).click('读下一封信');
  expect(core.mailbox(state)).toHaveLength(0);
  expect(core.currentEvent(state)?.id).toBe('letter');
  const before = state.inventory['seed-potato'];
  renderView(() => EventCard({ state, onChange: change })).click('好，记下了');
  expect(state.pendingEvent).toBeUndefined();
  expect(state.inventory['seed-potato']).toBe(before + 1);
});

test('kitchen consumes recipe ingredients and eating changes health', () => {
  let state = active();
  state.inventory.potato = 2;
  state.day.place = 'home';
  const change = (s: GameState) => {
    state = s;
  };
  const h = harness(() => Kitchen({ state, onChange: change }));
  h.render().click('烤土豆');
  expect(state.inventory.potato).toBe(2);
  h.render().click('跳过操作');
  expect(state.inventory.potato).toBe(1);
  expect(state.inventory['baked-potato']).toBe(1);
  const health = state.stats.health;
  state = core.eat(state, 'baked-potato');
  expect(state.inventory['baked-potato']).toBe(0);
  expect(state.stats.health).toBeGreaterThan(health);
});

test.each(['zh-CN', 'en'] as const)(
  'sleep, pending events, three days and seasonal summary in %s',
  (locale) => {
    let state = active(locale);
    const before = state;
    state = core.sleep(state);
    expect(state.dayNumber).toBe(0);
    expect(state.pendingEvent).toBeDefined();
    while (state.pendingEvent) {
      state = core.resolve(state, 'yes');
      state = core.sleep(state);
    }
    expect(state.dayNumber).toBe(1);
    expect(state.day.minute).toBe(420);
    state = core.sleep(state);
    expect(state.day.index).toBe(2);
    expect(state.dayNumber).toBe(2);
    state = core.sleep(state);
    expect(state.quarter).not.toBe(before.quarter);
    expect(state.day.index).toBe(0);
    expect(state.dayNumber).toBe(3);
    expect(state.log.filter((e) => e.kind === 'quarter')).toHaveLength(1);
    const onContinue = vi.fn();
    const v = renderView(
      () =>
        QuarterSummary({ before, after: state, onContinue, onVisit: vi.fn() }),
      locale,
    );
    expect(v.html).toContain(t('game.daysReview', locale));
    v.click(t('game.nextQuarter', locale));
    expect(onContinue).toHaveBeenCalledOnce();
    if (locale === 'en') expect(v.html).not.toMatch(cjk);
  },
);

test('fast-forward stops at every event and only finishes the current season', () => {
  let state = initial();
  const q = state.quarter;
  expect(core.fastForward(state)).toBe(state);
  const seen = [];
  for (let n = 0; n < 10 && state.quarter === q; n++) {
    if (state.pendingEvent) {
      seen.push(state.pendingEvent);
      state = core.resolve(state, 'yes');
    }
    state = core.fastForward(state);
  }
  expect(seen).toContain('morning');
  expect(seen).toContain('phone');
  expect(state.log.filter((e) => e.id === 'relax')).toHaveLength(1);
  expect(state.log.some((e) => e.id === 'work')).toBe(true);
  expect(seen).toContain('letter');
  expect(state.dayNumber).toBe(3);
  expect(state.log.filter((l) => l.kind === 'quarter')).toHaveLength(1);
  expect(state.day.minute).toBe(420);
});

test('v3 saves restore inventories and random cursor; v2 and invalid saves are never read', async () => {
  const state = active();
  storage.set(
    `uk-immigration-life-v2:${state.characterId}`,
    JSON.stringify(state),
  );
  expect(previewGameSave(state.characterId).state).toBeUndefined();
  const h = await client(state);
  expect(h.render().props(TownCanvas).state).toEqual(state);
  h.dispose();
  for (const change of [
    { version: 2 },
    { day: undefined },
    { inventory: { tea: -1 } },
    { plots: [null] },
    { day: { ...state.day, minute: 2000 } },
  ]) {
    storage.set(
      `uk-immigration-life-v3:${state.characterId}`,
      JSON.stringify({ ...state, clientVersion: 1, ...change }),
    );
    expect(previewGameSave(state.characterId).available).toBe(false);
  }
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw Error();
    },
    setItem: () => {
      throw Error();
    },
  });
  expect(gameStorage(state.characterId, state)).toEqual({
    state,
    available: false,
  });
  expect(core.tick(state, 10).day.minute).toBe(430);
});

test('language replacement preserves timeline, random state, inventory and simulator export', () => {
  const state = active();
  const next = withGameLocale(state, 'en');
  expect(next).toEqual({
    ...state,
    locale: 'en',
    result: evaluate({
      timeline: state.timeline,
      simulationDate: state.date,
      locale: 'en',
    }),
  });
  expect(next.inventory).toBe(state.inventory);
  expect(next.randomState).toBe(state.randomState);
  expect(decodeDraft(encodeDraft(gameDraft(next)))!.timeline).toEqual(
    state.timeline,
  );
});

test('all new overlays are English-only, with an unknown-item fallback', () => {
  const state = at(720, 'shop', 'en');
  state.plots = [{ growth: 0 }];
  state.inventory['future-item'] = 1;
  expect(itemIcon('future-item')).toBe('/game/assets/indoor/item.png');
  const views = [
    () => Inventory({ state, onChange: vi.fn(), onKitchen: vi.fn() }),
    () => Shop({ state, place: 'shop', onChange: vi.fn() }),
    () => PlotMenu({ state, plot: 0, onChange: vi.fn() }),
    () => Kitchen({ state, onChange: vi.fn() }),
    () => Mailbox({ state, onChange: vi.fn() }),
    () => Fishing({ state, onChange: vi.fn() }),
    () => ItemIcon({ id: 'future-item' }),
    () => Ending({ state: { ...state, ending: 'left' }, onChange: vi.fn() }),
    () => ProgressBars({ state, onOpen: vi.fn() }),
  ];
  for (const make of views)
    expect(renderView(make, 'en').html).not.toMatch(cjk);
});

async function client(
  start: GameState,
  locale: Locale = 'zh-CN',
  action: 'new' | 'continue' = 'continue',
) {
  gameStorage(start.characterId, start);
  const h = mountClient(locale);
  const selection = h.render().props(CharacterSelect);
  const entering = selection.onSelect(start.characterId, action);
  expect(h.render().html).toContain(t('game.loading', locale));
  await entering;
  h.render().props(TownCanvas).onReady();
  h.render();
  h.flush();
  return h;
}
test('controller clock ticks only outdoors; menus, events, hidden page and morning pause it', async () => {
  vi.useFakeTimers();
  const start = at(480);
  const h = await client(start);
  const v = h.render();
  const get = () => h.render().props(TownCanvas).state;
  vi.advanceTimersByTime(2000);
  expect(get().day.minute).toBe(480);
  v.props(TownCanvas).onInteract({ kind: 'home', id: 'exit' });
  h.render();
  h.flush();
  vi.advanceTimersByTime(2000);
  expect(get().day.minute).toBe(490);
  h.render();
  h.flush();
  h.render().click('背包');
  h.render();
  h.flush();
  vi.advanceTimersByTime(4000);
  expect(get().day.minute).toBe(490);
  h.render().props(Modal).onClose!();
  h.render();
  h.flush();
  h.documentStub.hidden = true;
  const handler = h.documentStub.addEventListener.mock.calls.find(
    (c) => c[0] === 'visibilitychange',
  )![1] as () => void;
  handler();
  h.render();
  h.flush();
  vi.advanceTimersByTime(4000);
  expect(get().day.minute).toBe(490);
  h.documentStub.hidden = false;
  handler();
  h.render();
  h.flush();
  vi.advanceTimersByTime(2000);
  expect(get().day.minute).toBe(500);
  h.dispose();
});

test('controller sleeping resumes after delivery then shows exactly one new morning', async () => {
  vi.useFakeTimers();
  const h = await client(at(600));
  h.render().click('今天到此为止');
  h.render().click('确认');
  h.render();
  h.flush();
  vi.advanceTimersByTime(280);
  h.render();
  h.flush();
  for (let i = 0; i < 5; i++) {
    h.render();
    h.flush();
    const state = h.render().props(TownCanvas).state;
    if (state.pendingEvent) {
      const v = h.render();
      if (core.currentEvent(state)?.speaker)
        v.props(Dialogue).onChange(core.resolve(state, 'yes'));
      else v.props(EventCard).onChange(core.resolve(state, 'yes'));
    } else break;
  }
  h.render();
  h.flush();
  const v = h.render();
  expect(v.props(TownCanvas).state.dayNumber).toBe(1);
  expect(v.props(MorningCard).state.day.minute).toBe(420);
  expect(v.props(TownCanvas).paused).toBe(true);
  h.dispose();
});

test.each(['new', 'continue'] as const)(
  '%s loads only the chosen character and waits for scene and morning before exposing the initial event',
  async (action) => {
    vi.useFakeTimers();
    const load = vi.spyOn(core, 'loadCharacter');
    const h = await client(initial(), 'zh-CN', action);
    expect(load.mock.calls).toEqual([['skilled-worker']]);
    let v = h.render();
    expect(v.props(MorningCard).state.dayNumber).toBe(0);
    v.props(MorningCard).onContinue();
    v = h.render();
    expect(v.props(EventCard).state.pendingEvent).toBe(
      action === 'new' ? 'opening-skilled-worker' : 'morning',
    );
    h.dispose();
  },
);

test('display workday is a weekday without moving the policy anchor date', () => {
  for (const character of loadedCharacters) {
    const state = initial('en', character.id);
    expect(state.date).toBe(character.startDate);
    expect([1, 2, 3, 4, 5]).toContain(new Date(state.day.date).getUTCDay());
  }
});

test('midnight returns home and sleeps automatically after remaining events', async () => {
  vi.useFakeTimers();
  const state = at(1430, 'bench');
  state.day.deliveries = [];
  const h = await client(state);
  vi.advanceTimersByTime(2000);
  for (let i = 0; i < 4; i++) {
    h.render();
    h.flush();
  }
  const view = h.render();
  expect(view.props(TownCanvas).state.dayNumber).toBe(1);
  expect(view.props(TownCanvas).interior).toBe(true);
  expect(view.props(MorningCard).state.day.minute).toBe(420);
  h.dispose();
});

test('final season leads to the ending without another morning event', () => {
  const state = active('en');
  state.year = 10;
  state.quarter = 4;
  state.log = Array.from({ length: 39 }, (_, i) => ({
    year: Math.floor(i / 4) + 1,
    quarter: ((i % 4) + 1) as core.Quarter,
    kind: 'quarter',
    id: 'quarter',
    text: { zhCN: '季末', en: 'Quarter' },
  }));
  state.day.index = 2;
  state.day.deliveries = [];
  const after = core.sleep(state);
  expect(core.isOver(after)).toBe(true);
  expect(after.pendingEvent).toBeUndefined();
  expect(after.day.deliveries).toEqual([]);
  const ending = renderView(
    () => Ending({ state: after, onChange: vi.fn() }),
    'en',
  );
  expect(ending.html).toContain('href="/result#s=');
  expect(ending.html).not.toMatch(cjk);
});

test('hours render from places, and core filters activities that cannot finish before closing', () => {
  const place = core.places.find((p) => p.id === 'work')!;
  const original = place.hours;
  try {
    place.hours = { opens: 600, closes: 1200, dayKinds: ['workday'] };
    const state = at(590, 'work');
    const menu = renderView(() =>
      LocationMenu({ state, location: 'work', onChange: vi.fn() }),
    );
    expect(menu.html).toContain('10:00–20:00');
    expect(menu.html).toContain(t('game.closed'));
    state.day.minute = 900;
    expect(core.activities(state, 'work').some((a) => a.id === 'work')).toBe(
      false,
    );
    expect(
      renderView(() =>
        LocationMenu({ state, location: 'work', onChange: vi.fn() }),
      ).buttons.some((b) => b.label.startsWith('上班')),
    ).toBe(false);
  } finally {
    place.hours = original;
  }
});

test.each(core.characters)(
  '$id household members leave both maps while away and return home afterwards',
  (character) => {
    const state = core.newGame(character.id, 42, 'en');
    state.day.kind = 'workday';
    state.day.weather = 'sunny';
    delete state.day.festival;
    state.day.minute = 480;
    const family = core
      .townsfolk(state)
      .filter((npc) => npc.characters?.includes(character.id));
    expect(family.length).toBeGreaterThan(0);
    for (const npc of family)
      expect(visibleResidents(state, true)).toContain(npc);
    state.day.minute = 660;
    for (const npc of family) {
      expect(core.npcAt(state, npc.id)).toBe('away');
      expect(visibleResidents(state, true)).not.toContain(npc);
      expect(visibleResidents(state, false)).not.toContain(npc);
      expect(core.townsfolk(state)).toContain(npc);
    }
    state.day.minute = 1080;
    for (const npc of family)
      expect(visibleResidents(state, true)).toContain(npc);
  },
);

test('flatmate uses a distinct existing 64 by 48 PNG sprite sheet', () => {
  const path = spritePath('yao-flatmate');
  expect(path).toBe('/game/assets/urban/yao-flatmate.png');
  const sprite = readFileSync(new URL(`../public${path}`, import.meta.url));
  expect(sprite.subarray(0, 8)).toEqual(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  expect([sprite.readUInt32BE(16), sprite.readUInt32BE(20)]).toEqual([64, 48]);
  const player = readFileSync(
    new URL(`../public${spritePath('skilled-worker')}`, import.meta.url),
  );
  expect(sprite.equals(player)).toBe(false);
});

test('home residents use fixed accessible positions and never appear in the town while home', () => {
  // Jamie is real household data since 9.3; mornings are spent at home.
  const state = core.newGame('family-partner', 42, 'en');
  delete state.pendingEvent;
  state.eventQueue = [];
  state.day.deliveries = [];
  expect(visibleResidents(state, true).map((n) => n.id)).toEqual(['jamie']);
  expect(visibleResidents(state, false).some((n) => n.id === 'jamie')).toBe(
    false,
  );
  // Yao's flatmate is at home before leaving for work.
  expect(visibleResidents(active(), true).map((n) => n.id)).toEqual([
    'yao-flatmate',
  ]);
  // Away at work: drawn neither at home nor in the town.
  const working = active();
  working.day.weather = 'sunny';
  working.day.minute = 660;
  expect(core.npcAt(working, 'yao-flatmate')).toBe('away');
  expect(visibleResidents(working, true)).toEqual([]);
  expect(
    visibleResidents(working, false).some((n) => n.id === 'yao-flatmate'),
  ).toBe(false);
  expect(core.peopleAt(state, 'home')).toContain('jamie');
  const chatted = core.talk(state, 'jamie');
  expect(chatted.day.talked).toContain('jamie');
  expect(
    renderView(
      () =>
        Dialogue({
          state: chatted,
          npc: 'jamie',
          onChange: vi.fn(),
          onClose: vi.fn(),
        }),
      'en',
    ).html,
  ).toContain('Jamie');
  const collision = homeMap.layers.find((l) => l.name === 'collision')!;
  for (let index = 0; index < 3; index++) {
    const spot = homeSpot(index);
    expect(collision.data![spot.y * homeMap.width + spot.x]).toBe(0);
  }
});

test('controller clears gift feedback before a shop, mailbox, or reopened menu', async () => {
  const h = await client(at(600));
  h.render().props(TownCanvas).onInteract({ kind: 'npc', id: 'margaret' });
  const dialogue = h.render().props(Dialogue);
  const next = core.gift(dialogue.state, 'margaret', 'tea');
  dialogue.onChange(next);
  expect(h.render().props(Dialogue).feedbackText).toEqual(next.outcome?.text);
  h.render().props(Modal).onClose!();
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'shop' });
  expect(h.render().props(OutcomeText).text).toBeUndefined();
  expect(
    h
      .render()
      .buttons.filter((b) => ['家', '公司', '街角小店'].includes(b.label))
      .every((b) => b.disabled),
  ).toBe(true);
  const shop = h.render().props(Shop);
  shop.onChange(core.buy(shop.state, 'tea', 1));
  expect(h.render().props(OutcomeText).text).toEqual(
    core.items.find((i) => i.id === 'tea')!.name,
  );
  h.render().props(Modal).onClose!();
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'shop' });
  expect(h.render().props(OutcomeText).text).toBeUndefined();
  h.dispose();
});

test('reading the board keeps the menu open with this season\u2019s notices', async () => {
  const h = await client(at(600, 'board'));
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'board' });
  const menu = h.render().props(LocationMenu);
  const next = core.doActivity(menu.state, 'board');
  menu.onChange(next);
  expect(next.outcome?.text?.zhCN).toBeTruthy();
  expect(h.render().props(OutcomeText).text).toEqual(next.outcome?.text);
  h.dispose();
});

test('outcome text renders each notice on a separate line in both locales', () => {
  const outcome: core.Outcome = {
    kind: 'activity',
    text: {
      zhCN: '本季公告\n周末捡垃圾\n夏日菜地评比',
      en: 'Season notices\nWeekend litter pick\nSummer allotment show',
    },
  };
  for (const locale of ['zh-CN', 'en'] as const) {
    const { html } = renderView(
      () => OutcomeText({ text: outcome.text }),
      locale,
    );
    const lines = outcome.text![locale === 'en' ? 'en' : 'zhCN'].split('\n');
    expect(html).toContain(lines.join('<br/>'));
    expect(html.match(/<br\/>/g)).toHaveLength(2);
    expect(html).toContain('role="status"');
  }
});

test('heart dialogue focuses the NPC and shows the actual heart change', async () => {
  const start = at(600);
  start.friendship.margaret = 190;
  const h = await client(start);
  h.render().props(TownCanvas).onInteract({ kind: 'npc', id: 'margaret' });
  const view = h.render();
  expect(view.props(TownCanvas).focusNpc).toBe('margaret');
  expect(view.props(Dialogue).heartChange).toEqual({ before: 1, after: 2 });
  expect(view.html).toContain('♥ 1 → 2');
  h.dispose();
});

test('one-month journey pauses abroad, restores there, and records only a completed absence on return', async () => {
  const start = at(600, 'station');
  const h = await client(start);
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'station' });
  const menu = h.render().props(LocationMenu);
  menu.onChange(core.doActivity(menu.state, 'travel-1'));
  let view = h.render();
  expect(view.props(TravelCard).state.trip).toBeDefined();
  expect(view.props(TravelCard).state.timeline.absences).toEqual(
    start.timeline.absences,
  );
  expect(view.html).not.toContain('role="application"');
  const abroad = view.props(TravelCard).state;
  gameStorage(abroad.characterId, abroad);
  expect(previewGameSave(abroad.characterId).state!.trip).toEqual(abroad.trip);
  for (let i = 0; i < 15; i++) {
    view = h.render();
    const card = view.props(TravelCard);
    if (card.returned) break;
    const state = card.state;
    if (state.pendingEvent) {
      const event = core.currentEvent(state)!;
      const next = core.resolve(state, event.choices[0].id);
      if (event.speaker || event.heart) view.props(Dialogue).onChange(next);
      else view.props(EventCard).onChange(next);
    } else card.onContinue();
  }
  view = h.render();
  const returned = view.props(TravelCard);
  expect(returned.returned).toBeDefined();
  expect(returned.state.trip).toBeUndefined();
  expect(returned.state.timeline.absences).toHaveLength(
    start.timeline.absences.length + 1,
  );
  expect(
    returned.state.timeline.absences.every((a) => a.to <= returned.state.date),
  ).toBe(true);
  expect(
    view.props(QuarterSummary).after.log.some((e) => e.kind === 'quarter'),
  ).toBe(true);
  returned.onContinue();
  expect(h.render().props(TownCanvas).interior).toBe(true);
  h.dispose();
});

test('real fast-forward diary groups all three days and merges repeat conversations', () => {
  let state = active('en');
  state.day.deliveries = [];
  let diary: DayMemory[] = [];
  for (let i = 0; i < 2; i++) {
    const next = core.talk(state, 'margaret');
    diary = recordMemories(diary, state, next, 'action');
    state = next;
  }
  const before = state;
  const after = core.fastForward(state);
  diary = recordMemories(diary, state, after, 'fast');
  const groups = groupedMemories(diary, before.year, before.quarter);
  expect(groups[0].find((m) => m.key.startsWith('talk:'))!.count).toBe(2);
  expect(groups[0].some((m) => m.key === 'action:work:')).toBe(true);
  expect(groups[1].some((m) => m.key === 'action:rest:')).toBe(true);
  expect(groups[1].some((m) => m.key === 'action:relax:')).toBe(true);
  expect(groups[2].some((m) => m.key === 'action:festival:')).toBe(true);
  const view = renderView(
    () =>
      QuarterSummary({
        before,
        after,
        diary,
        onContinue: vi.fn(),
        onVisit: vi.fn(),
      }),
    'en',
  );
  for (let i = 1; i <= 3; i++)
    expect(view.html).toContain(
      t('game.day', 'en').replace('{day}', String(i)),
    );
  expect(view.html).toContain('× 2');
  expect(view.html).not.toMatch(cjk);
  gameStorage(after.characterId, after, diary);
  expect(previewGameSave(after.characterId).diary).toEqual(diary);
});

test('unassigned real event queue restores, but mock-era v3 saves are ignored', async () => {
  const state = core.newGame(core.characters[0].id, 4, 'en');
  delete state.pendingEvent;
  state.eventQueue = ['letter'];
  const h = await client(state, 'en');
  expect(h.render().props(TownCanvas).state.eventQueue).toEqual(['letter']);
  h.dispose();
  storage.set(
    `uk-immigration-life-v3:${state.characterId}`,
    JSON.stringify(state),
  );
  expect(previewGameSave(state.characterId).state).toBeUndefined();
});

test('Tiled layers retain finite offsets, opacity and visibility after map regeneration', () => {
  for (const map of [townMap, homeMap])
    for (const layer of map.layers) {
      expect(Number.isFinite(layer.x)).toBe(true);
      expect(Number.isFinite(layer.y)).toBe(true);
      expect(layer.opacity).toBeGreaterThanOrEqual(0);
      expect(layer.opacity).toBeLessThanOrEqual(1);
      expect(typeof layer.visible).toBe('boolean');
    }
});

test.each(core.festivals)(
  'festival $id reads its title, text and activities from real data',
  (festival) => {
    const state = at(1080, 'green', 'en');
    state.day.festival = festival.id;
    state.day.kind = 'special';
    state.day.index = 2;
    state.day.deliveries = [];
    const changed = vi.fn();
    const menu = renderView(
      () => LocationMenu({ state, location: 'green', onChange: changed }),
      'en',
    );
    expect(menu.html).toContain(festival.name.en);
    expect(menu.html).not.toMatch(cjk);
    const activity = core.activities(state, 'green')[0];
    menu.click(activity.label.en);
    expect(changed.mock.lastCall![0].day.done).toContain(activity.id);
  },
);

test('rejected late fishing never claims a catch or changes the state', () => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  const state = at(1435, 'pond');
  const onChange = vi.fn();
  const h = harness(() => Fishing({ state, onChange }));
  h.render().click(t('game.cast'));
  h.render();
  vi.advanceTimersByTime(1450);
  h.render().click(t('game.reel'));
  vi.advanceTimersByTime(500);
  expect(onChange).not.toHaveBeenCalled();
  expect(h.render().html).toContain(t('game.actionUnavailable'));
  expect(h.render().html).not.toContain(t('game.fishWin'));
  h.dispose();
});

test('controller resolves a phone interruption without replaying or dropping the remaining work time', async () => {
  const start = at(540, 'work');
  start.day.deliveries = [{ eventId: 'phone', channel: 'phone', minute: 720 }];
  const h = await client(start);
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'work' });
  const menu = h.render().props(LocationMenu);
  menu.onChange(core.doActivity(menu.state, 'work'));
  let state = h.render().props(TownCanvas).state;
  expect(state.day.minute).toBe(720);
  expect(state.day.resumeMinute).toBe(1020);
  h.render().props(EventCard).onChange(core.resolve(state, 'yes'));
  state = h.render().props(TownCanvas).state;
  expect(state.day.minute).toBe(1020);
  expect(state.day.resumeMinute).toBeUndefined();
  expect(state.log.filter((l) => l.id === 'work')).toHaveLength(1);
  h.dispose();
});

for (const locale of ['zh-CN', 'en'] as const) {
  test.each([
    {
      action: 'festival',
      label: locale === 'en' ? 'Join the festival' : '逛节日摊位',
      feedback: locale === 'en' ? 'You browse the stalls' : '你沿摊位走了一圈',
    },
    {
      action: 'lunar-dumplings',
      label: locale === 'en' ? 'Fold dumplings together' : '一起包饺子',
      feedback:
        locale === 'en' ? 'You fold your first dumpling' : '你捏好第一个饺子',
    },
  ])(
    `$action shows its result after the New Year phone call in ${locale}`,
    async ({ label, feedback }) => {
      let start = core.newGame('skilled-worker', 176, locale);
      while (start.pendingEvent || start.day.index < 2) {
        start = start.pendingEvent
          ? core.resolve(start, core.currentEvent(start)!.choices[0].id)
          : core.sleep(start);
      }
      expect(start.day.festival).toBe('lunar-new-year');
      start = core.tick(start, 18 * 60 + 14 - start.day.minute);
      const h = await client(start, locale);
      h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'green' });
      const menu = h.render().props(LocationMenu);
      renderView(() => LocationMenu(menu), locale).click(label);
      const call = h.render().props(EventCard);
      expect(call.state.pendingEvent).toBe('sw-parents-call');
      expect(call.state.day.minute).toBe(18 * 60 + 44);
      renderView(() => EventCard(call), locale).click(
        locale === 'en' ? 'Arrange a weekly call' : '约定每周通话',
      );
      const result = h.render();
      expect(result.html).toContain(feedback);
      result.click(t('game.continuePlaying', locale));
      expect(h.render().html).not.toContain(feedback);
      expect(h.render().props(TownCanvas).paused).toBe(false);
      h.dispose();
      // task 56 / 50 review risk: reloading while the call is open still
      // shows the activity's result after hanging up.
      const reloaded = await client(call.state, locale);
      const reloadedCall = reloaded.render().props(EventCard);
      renderView(() => EventCard(reloadedCall), locale).click(
        locale === 'en' ? 'Arrange a weekly call' : '约定每周通话',
      );
      expect(reloaded.render().html).toContain(feedback);
      reloaded.dispose();
      // review56-1 risk: if something else (eating) produced the last
      // outcome, no stale activity result is shown after the call.
      const ate = await client(
        {
          ...call.state,
          outcome: {
            kind: 'eat',
            text: { zhCN: '百家宴饺子', en: 'Potluck dumplings' },
          },
        },
        locale,
      );
      const ateCall = ate.render().props(EventCard);
      renderView(() => EventCard(ateCall), locale).click(
        locale === 'en' ? 'Arrange a weekly call' : '约定每周通话',
      );
      expect(ate.render().html).not.toContain(t('game.eventResult', locale));
      ate.dispose();
    },
  );
}

test.each([
  { locale: 'zh-CN', score: 68, interrupted: false },
  { locale: 'en', score: 68, interrupted: false },
  { locale: 'zh-CN', score: 73, interrupted: false },
  { locale: 'en', score: 73, interrupted: true },
] as const)(
  'language school shows exam preparation and immediate result in $locale at $score (interrupted: $interrupted)',
  async ({ locale, score, interrupted }) => {
    const start = at(600, 'college', locale);
    start.stats.english = score;
    start.day.deliveries = interrupted
      ? [{ eventId: 'phone', channel: 'phone', minute: 660 }]
      : [];
    const h = await client(start, locale);
    h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'college' });
    const before = h.render();
    expect(before.html).toContain('aria-describedby="action-note-exam"');
    expect(before.html).toContain(
      locale === 'en'
        ? `B2. Readiness ${score} / 70`
        : `目标 B2。备考进度 ${score} / 70`,
    );
    const menu = before.props(LocationMenu);
    menu.onChange(core.doActivity(menu.state, 'exam'));
    const after = h.render();
    if (score < 70) {
      expect(after.props(EventCard).state.pendingEvent).toBe(
        'system-exam-failed',
      );
      expect(after.html).toContain(
        locale === 'en'
          ? 'pass the B2 English test this time'
          : '英语考试没通过，分数还没到 B2。',
      );
    } else {
      expect(after.html).toContain(
        locale === 'en'
          ? 'You passed the English test at B2.'
          : '英语考试通过了，成绩是 B2。',
      );
      expect(after.props(TownCanvas).state.timeline.english).toEqual({
        cefrLevel: 'B2',
      });
      if (interrupted) {
        after.click(t('game.continuePlaying', locale));
        expect(h.render().props(EventCard).state.pendingEvent).toBe('phone');
      }
    }
    h.dispose();
  },
);

test('season opening stats survive reload and include daily life changes in the summary', () => {
  const start = at(600);
  const opening = { ...start.stats };
  const afterMeal = core.eat(start, 'tea');
  gameStorage(afterMeal.characterId, afterMeal, [], opening);
  expect(previewGameSave(afterMeal.characterId).quarterStart).toEqual(opening);
  const settled = {
    ...afterMeal,
    stats: { ...afterMeal.stats, mood: afterMeal.stats.mood + 3 },
  };
  const summary = renderView(() =>
    QuarterSummary({
      before: afterMeal,
      after: settled,
      startStats: opening,
      onContinue: vi.fn(),
      onVisit: vi.fn(),
    }),
  );
  const changes = summary.html;
  expect(changes).toContain(`+${settled.stats.mood - opening.mood}`);
});

test('sleeping through a promotion generates feedback and still shows the final quarter summary', async () => {
  vi.useFakeTimers();
  const start = at(1200);
  start.day.index = 2;
  start.day.deliveries = [];
  start.stats.career = 60;
  const h = await client(start);
  h.render().click(t('game.endDay'));
  h.render().click(t('game.confirm'));
  h.render();
  h.flush();
  vi.advanceTimersByTime(280);
  h.render();
  h.flush();
  const view = h.render();
  expect(view.props(TownCanvas).feedback?.promotion).toBe(true);
  expect(view.props(QuarterSummary).startStats).toEqual(start.stats);
  h.dispose();
});

test.each(core.characters)(
  'real $id can complete a day using real work, pub, shop, mail and sleep transitions',
  (character) => {
    let state = core.newGame(character.id, 42, 'en');
    const resolvePending = () => {
      for (let i = 0; i < 10 && state.pendingEvent; i++)
        state = core.resolve(state, core.currentEvent(state)!.choices[0].id);
    };
    resolvePending();
    state = core.tick(state, 540 - state.day.minute);
    resolvePending();
    state = core.enter(state, 'work');
    resolvePending();
    state = core.doActivity(state, 'work');
    resolvePending();
    expect(state.day.done).toContain('work');
    state = core.enter(state, 'shop');
    resolvePending();
    state = core.buy(state, 'tea', 1);
    expect(state.inventory.tea).toBeGreaterThan(0);
    state = core.tick(state, Math.max(0, 1080 - state.day.minute));
    resolvePending();
    state = core.enter(state, 'pub');
    resolvePending();
    const menu = renderView(
      () =>
        LocationMenu({
          state,
          location: 'pub',
          onChange: (next) => {
            state = next;
          },
        }),
      'en',
    );
    menu.click(
      core.activities(state, 'pub').find((a) => a.id === 'relax')!.label.en,
    );
    expect(state.day.done).toContain('relax');
    resolvePending();
    state = core.enter(state, 'home');
    resolvePending();
    if (core.mailbox(state).length) {
      state = core.readMail(state);
      resolvePending();
    }
    const day = state.dayNumber;
    for (let i = 0; i < 10 && state.dayNumber === day; i++) {
      state = core.sleep(state);
      resolvePending();
    }
    expect(state.dayNumber).toBe(day + 1);
    expect(state.day.place).toBe('home');
    expect(
      renderView(() => MorningCard({ state, onContinue: vi.fn() }), 'en').html,
    ).not.toMatch(cjk);
  },
);

// Phase 10.5 A: expiry, adjoining renewals and compact assessments.
test.each(['zh-CN', 'en'] as const)(
  'season morning and fast-forward warn about unrenewed permission in %s',
  async (locale) => {
    const state = at(420, 'home', locale);
    state.timeline.episodes = [
      {
        ...state.timeline.episodes[0],
        validFrom: '2024-01-01',
        validTo: '2024-07-15',
      },
    ];
    state.date = '2024-01-15';
    const visit = vi.fn();
    let view = renderView(
      () => MorningCard({ state, onContinue: vi.fn(), onVisit: visit }),
      locale,
    );
    expect(view.html).toContain(t('game.visaReminderTitle', locale));
    view.props(VisaReminder).onVisit!();
    expect(visit).toHaveBeenCalledOnce();
    state.date = '2023-12-15';
    state.timeline.episodes[0].validFrom = '2023-01-01';
    expect(
      renderView(() => MorningCard({ state, onContinue: vi.fn() }), locale)
        .html,
    ).not.toContain(t('game.visaReminderTitle', locale));
    state.date = '2024-04-15';
    state.timeline.episodes[0].validTo = '2024-07-14';
    state.day.minute = 600;
    const h = await client(state, locale);
    h.render().click(t('game.fastForward', locale));
    // The warning names the expiry date and offers the visa centre.
    const warning = t('game.fastVisaWarning', locale).replace(
      '{date}',
      '2024-07-14',
    );
    expect(h.render().html).toContain(warning);
    // review40-1 #4: the button walks to the visa centre without passing time.
    h.render().click(t('game.visaVisit', locale));
    const after = h.render();
    expect(after.html).not.toContain(warning);
    expect(after.props(TownCanvas).destination?.location).toBe('visa');
    expect(after.props(TownCanvas).state).toMatchObject({
      date: '2024-04-15',
      day: { minute: 600 },
    });
    h.dispose();
    vi.restoreAllMocks();
    state.timeline.episodes.push({
      ...state.timeline.episodes[0],
      validFrom: '2024-07-15',
      validTo: '2027-07-14',
    });
    state.day.minute = 420;
    view = renderView(
      () => MorningCard({ state, onContinue: vi.fn() }),
      locale,
    );
    expect(view.html).not.toContain(t('game.visaReminderTitle', locale));
    state.day.minute = 600;
    const renewed = await client(state, locale);
    renewed.render().click(t('game.fastForward', locale));
    const confirm = renewed.render().html;
    expect(confirm).toContain(t('game.confirm', locale));
    expect(confirm).not.toContain(
      t('game.fastVisaWarning', locale).split('{date}')[1],
    );
    expect(confirm).not.toContain(t('game.visaVisit', locale));
    renewed.dispose();
  },
);

test('visa HUD follows all adjoining permissions, but not a renewal after a gap', () => {
  const state = at(600);
  state.date = '2024-04-15';
  state.timeline.episodes = [
    {
      ...state.timeline.episodes[0],
      validFrom: '2024-01-01',
      validTo: '2024-07-14',
    },
  ];
  const hud = () => renderView(() => StatusBar({ state })).html;
  expect(hud()).toContain('签证剩余 2 个月');
  expect(hud()).toContain('visaFlash');
  state.timeline.episodes.push({
    ...state.timeline.episodes[0],
    validFrom: '2024-07-15',
    validTo: '2025-07-14',
  });
  state.timeline.episodes.push({
    ...state.timeline.episodes[0],
    validFrom: '2025-07-15',
    validTo: '2027-07-14',
  });
  expect(hud()).toContain('签证剩余 38 个月');
  expect(hud()).not.toContain('visaFlash');
  state.timeline.episodes[1].validFrom = '2024-07-16';
  expect(hud()).toContain('签证剩余 2 个月');
  expect(hud()).toContain('visaFlash');
  state.day.index = 1;
  expect(
    renderView(() => MorningCard({ state, onContinue: vi.fn() })).html,
  ).not.toContain(t('game.visaReminderTitle'));
});

test.each(['zh-CN', 'en'] as const)(
  'compact assessments omit unknown percentages and name the missing rules in %s',
  (locale) => {
    const state = active(locale);
    for (const result of Object.values(state.result.byRuleSet)) {
      delete result.earliestDate;
      result.outcome = 'INSUFFICIENT_INFORMATION';
      result.rules = [
        {
          ...result.rules[0],
          status: 'UNKNOWN',
          title:
            locale === 'en'
              ? 'Pass the Life in the UK test'
              : '通过 Life in the UK 考试',
        },
      ];
    }
    const view = renderView(
      () => ProgressBars({ state, onOpen: vi.fn() }),
      locale,
    );
    expect(view.html).not.toContain('0%');
    expect(view.html).not.toContain('role="progressbar"');
    expect(view.html.match(/<strong>—<\/strong>/g)).toHaveLength(2);
    expect(view.html).toContain(
      locale === 'en'
        ? 'Still needed: Pass the Life in the UK test'
        : '还差：通过 Life in the UK 考试',
    );
  },
);

// Phase 10.5 B: place menus, schedules and conversation return.
test.each(['zh-CN', 'en'] as const)(
  'festival green menu lists and talks to the people at the stalls in %s',
  (locale) => {
    const state = at(600, 'green', locale);
    state.day.festival = 'lunar-new-year';
    state.day.kind = 'special';
    const onTalk = vi.fn();
    const menu = renderView(
      () =>
        LocationMenu({ state, location: 'green', onChange: vi.fn(), onTalk }),
      locale,
    );
    const people = core
      .townsfolk(state)
      .filter((npc) => core.npcAt(state, npc.id) === 'green-stall');
    expect(people).toHaveLength(9);
    for (const npc of people) {
      menu.click(npc.name[locale === 'en' ? 'en' : 'zhCN']);
      expect(onTalk).toHaveBeenLastCalledWith(npc.id);
    }
  },
);

test.each(['home', 'work'] as const)(
  'chatting from the %s menu returns there, including a heart event',
  async (place) => {
    const state = at(place === 'home' ? 480 : 600, place);
    state.day.deliveries = [];
    const npc = place === 'home' ? 'yao-flatmate' : 'ade';
    const h = await client(state);
    h.render()
      .props(TownCanvas)
      .onInteract(
        place === 'home'
          ? { kind: 'home', id: 'desk' }
          : { kind: 'place', id: place },
      );
    h.render().props(LocationMenu).onTalk!(npc);
    if (place === 'home') {
      expect(h.render().props(TownCanvas).approachNpc?.id).toBe(npc);
      h.render().props(TownCanvas).onInteract({ kind: 'npc', id: npc });
    }
    h.render().props(Dialogue).onClose();
    expect(h.render().props(LocationMenu).location).toBe(place);
    h.render().props(Modal).onClose!();
    h.render().props(TownCanvas).onInteract({ kind: 'npc', id: 'margaret' });
    h.render().props(Dialogue).onClose();
    expect(h.render().html).not.toContain('<dialog');
    h.dispose();
  },
);

test('conversation returns to its menu after resolving a heart scene', async () => {
  const state = at(600, 'cafe');
  state.day.deliveries = [];
  state.friendship.margaret = 190;
  const h = await client(state);
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'cafe' });
  h.render().props(LocationMenu).onTalk!('margaret');
  const dialogue = h.render().props(Dialogue);
  expect(core.currentEvent(dialogue.state)?.heart).toBeDefined();
  dialogue.onChange(
    core.resolve(
      dialogue.state,
      core.currentEvent(dialogue.state)!.choices[0].id,
    ),
  );
  h.render().props(Dialogue).onClose();
  expect(h.render().props(LocationMenu).location).toBe('cafe');
  h.dispose();
});

test.each(['zh-CN', 'en'] as const)(
  'menus explain closing-time, no-action and no-paperwork cases in %s',
  (locale) => {
    const state = at(900, 'work', locale);
    const menu = (location: core.PlaceId) =>
      renderView(
        () => LocationMenu({ state, location, onChange: vi.fn() }),
        locale,
      ).html;
    expect(menu('work')).toContain(
      t('game.tooLate', locale).replace('{time}', '20:00'),
    );
    state.day.done = ['work'];
    expect(menu('work')).toContain(t('game.noActions', locale));
    expect(menu('visa')).toContain(t('game.noVisaActions', locale));
    state.day.minute = 1200;
    expect(menu('work')).toContain(t('game.closed', locale));
    expect(menu('work')).not.toContain(
      t('game.tooLate', locale).replace('{time}', '20:00'),
    );
  },
);

test('closed destination buttons stay clickable and still open the hours menu', async () => {
  const h = await client(at(430));
  const view = h.render();
  const button = view.buttons.find((b) => b.label === '公司')!;
  expect(button.disabled).toBe(false);
  expect(view.html).toContain('closedPlace');
  expect(view.html).toContain('aria-label="公司 · 关门"');
  expect(view.html).toMatch(
    /closedMarker[^>]*aria-hidden="true"><svg[^>]*stroke="currentColor"/,
  );
  expect(view.html).not.toContain('🔒');
  button.click();
  expect(h.render().props(TownCanvas).destination?.location).toBe('work');
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'work' });
  expect(h.render().html).toContain('09:00–20:00');
  expect(h.render().html).toContain(t('game.closed'));
  h.dispose();
});

test.each(['zh-CN', 'en'] as const)(
  'home, chat and shop dialogs close without claiming to leave the current scene in %s',
  (locale) => {
    const state = at(600, 'home', locale);
    const onClose = vi.fn();
    const onChange = vi.fn();
    const contexts = [
      {
        title: locale === 'en' ? 'Home' : '家',
        children: (
          <LocationMenu state={state} location="home" onChange={onChange} />
        ),
      },
      {
        title: t('game.talk', locale),
        children: (
          <Dialogue
            state={state}
            npc="yao-flatmate"
            onChange={onChange}
            onClose={onClose}
          />
        ),
      },
      {
        title: locale === 'en' ? 'Corner shop' : '街角小店',
        children: (
          <LocationMenu state={state} location="shop" onChange={onChange} />
        ),
      },
    ];
    for (const context of contexts) {
      const view = renderView(() => Modal({ ...context, onClose }), locale);
      const close = locale === 'en' ? '✕ Close' : '✕ 关闭';
      expect(view.buttons.map((button) => button.label)).toContain(close);
      expect(view.html).not.toContain(
        locale === 'en' ? 'Back to town' : '回到小镇',
      );
      view.click(close);
    }
    expect(onClose).toHaveBeenCalledTimes(contexts.length);
  },
);

test('opening a dialog focuses its labelled container and closing restores the trigger', () => {
  const previous = { focus: vi.fn() };
  const dialog = { showModal: vi.fn(), focus: vi.fn(), close: vi.fn() };
  vi.stubGlobal('document', { activeElement: previous });
  vi.spyOn(React, 'useRef').mockReturnValue({ current: dialog });
  let effect: React.EffectCallback | undefined;
  vi.spyOn(React, 'useEffect').mockImplementation((callback) => {
    effect = callback;
  });
  const view = renderView(() =>
    Modal({ title: '家', children: <button>休息</button> }),
  );
  expect(view.html).toContain('tabindex="-1"');
  expect(view.html).toContain('aria-labelledby="game-dialog-heading"');
  const cleanup = effect!();
  expect(dialog.showModal).toHaveBeenCalledOnce();
  expect(dialog.focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
  expect(dialog.showModal.mock.invocationCallOrder[0]).toBeLessThan(
    dialog.focus.mock.invocationCallOrder[0],
  );
  if (typeof cleanup === 'function') cleanup();
  expect(dialog.close).toHaveBeenCalledOnce();
  expect(previous.focus).toHaveBeenCalledExactlyOnceWith({
    preventScroll: true,
  });
});

// Phase 10.5 C: small presentation fixes and deliberate ending actions.
test('a non-festival green has no empty shop or quantity input, while festival goods appear', async () => {
  const state = at(600, 'green');
  const h = await client(state);
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'green' });
  expect(h.render().html).not.toContain(t('game.quantity'));
  h.dispose();
  vi.restoreAllMocks();
  state.day.festival = 'lunar-new-year';
  const festival = await client(state);
  festival
    .render()
    .props(TownCanvas)
    .onInteract({ kind: 'place', id: 'green' });
  expect(festival.render().html).toContain(t('game.quantity'));
  expect(festival.render().html).not.toContain(t('game.noActions'));
  festival.dispose();
});

test.each(['zh-CN', 'en'] as const)(
  'crop growth uses each seed’s days and kitchen durations are localized in %s',
  (locale) => {
    const state = at(600, 'home', locale);
    for (const seed of core.items.filter((item) => item.grows)) {
      state.plots = [{ seed: seed.id, growth: 1 }];
      const html = renderView(
        () => PlotMenu({ state, plot: 0, onChange: vi.fn() }),
        locale,
      ).html;
      expect(html).toContain(
        t('game.growth', locale)
          .replace('{count}', '1')
          .replace('{days}', String(seed.grows!.days)),
      );
    }
    const kitchen = renderView(
      () => Kitchen({ state, onChange: vi.fn() }),
      locale,
    ).html;
    expect(kitchen).not.toMatch(/\d+ min<\/small>/);
    for (const recipe of core.recipes)
      expect(kitchen).toContain(
        t('game.minutes', locale).replace('{count}', String(recipe.minutes)),
      );
  },
);

test.each(['leave', 'settle'])(
  'ending action %s waits for confirmation and cancellation has no effect',
  (id) => {
    const location = id === 'leave' ? 'station' : 'visa';
    const state = at(600, location);
    state.day.deliveries = [];
    state.stats.money = 100000;
    for (const result of Object.values(state.result.byRuleSet))
      result.outcome = 'LIKELY_ELIGIBLE';
    const onChange = vi.fn();
    const action = core.activities(state, location).find((a) => a.id === id)!;
    const h = harness(() => LocationMenu({ state, location, onChange }));
    h.render().click(action.label.zhCN);
    expect(onChange).not.toHaveBeenCalled();
    expect(state.ending).toBeUndefined();
    expect(h.render().html).toContain(t('game.endingConfirm'));
    h.render().click(t('game.cancel'));
    expect(onChange).not.toHaveBeenCalled();
    expect(h.render().html).not.toContain(t('game.endingConfirm'));
    h.render().click(action.label.zhCN);
    h.render().click(t('game.confirm'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].ending).toBe(
      id === 'leave' ? 'left' : 'settled',
    );
    h.dispose();
  },
);

test.each(['zh-CN', 'en'] as const)(
  'A7#1 low-paid Skilled Worker can record an assumed renewal with the fee shown in %s',
  (locale) => {
    const state = at(600, 'visa', locale);
    state.date = state.day.date = '2026-11-19';
    state.day.deliveries = [];
    state.timeline.episodes[0].salary = 24000;
    state.stats.money = 4048;
    const onChange = vi.fn();
    const view = renderView(
      () => LocationMenu({ state, location: 'visa', onChange }),
      locale,
    );
    expect(view.html).toContain(
      locale === 'en'
        ? 'Pay the fee shown to record your new permission in the game.'
        : '支付所示费用，在游戏里登记新许可。',
    );
    expect(view.html).toContain('aria-describedby="action-note-extend"');
    expect(view.html).toContain('−£4,048');
    view.click(
      locale === 'en'
        ? 'Extend permission (assumed granted in this scenario)'
        : '续签（本情景预设获批）',
    );
    const after: GameState = onChange.mock.lastCall![0];
    expect(after.stats.money).toBe(state.stats.money - 4048);
    expect(after.timeline.episodes[1]).toMatchObject({
      route: 'SKILLED_WORKER',
      validFrom: '2027-01-15',
      salary: 24000,
    });
  },
);

function familyAtSettlement(locale: Locale) {
  const state = core.newGame('family-partner', 42, locale);
  delete state.pendingEvent;
  state.eventQueue = [];
  state.date = state.day.date = '2029-06-15';
  state.day.minute = 600;
  state.day.place = 'visa';
  state.day.deliveries = [];
  state.timeline.episodes[0].validTo = '2032-06-14';
  state.timeline.english = { cefrLevel: 'B2' };
  state.timeline.lifeInTheUk = { passed: true };
  return state;
}

test.each(['zh-CN', 'en'] as const)(
  'A7#3 when only the reform column passes, the button and confirmation name the assumption in %s',
  (locale) => {
    const state = familyAtSettlement(locale);
    state.timeline.incomeYears = [
      '2024-25',
      '2025-26',
      '2026-27',
      '2027-28',
      '2028-29',
    ].map((taxYear) => ({ taxYear, earnings: 14000, partnerEarnings: 0 }));
    state.result = evaluate({
      timeline: state.timeline,
      simulationDate: state.date,
      locale,
    });
    expect(state.result.byRuleSet['current-law-2026-11']?.outcome).not.toBe(
      'LIKELY_ELIGIBLE',
    );
    expect(state.result.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
      'LIKELY_ELIGIBLE',
    );
    const onChange = vi.fn();
    const h = harness(
      () => LocationMenu({ state, location: 'visa', onChange }),
      locale,
    );
    h.render().click(
      locale === 'en'
        ? 'Simulate submission under the reform assumptions'
        : '按改革假设模拟递交',
    );
    expect(h.render().html).toContain(
      t('game.reformSettlementConfirm', locale),
    );
    expect(onChange).not.toHaveBeenCalled();
    h.render().click(t('game.confirm', locale));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ending: 'settled' }),
    );
    h.dispose();
  },
);

test('A7#4 the restored ending in both languages shows the financial pass used at submission', () => {
  const before = familyAtSettlement('zh-CN');
  const law = 'current-law-2026-11';
  const financial = (result: GameState['result']) =>
    result.byRuleSet[law]?.rules.find((r) => r.id === 'CL-FAMILY-FINANCIAL');
  before.stats.money = before.timeline.cashSavings = 25000;
  before.timeline.incomeYears = [
    { taxYear: '2028-29', earnings: 20000, partnerEarnings: 0 },
  ];
  before.timeline.relationships = [
    { type: 'PARTNER', otherPartyStatus: 'SETTLED' },
  ];
  before.result = evaluate({
    timeline: before.timeline,
    simulationDate: before.date,
    locale: before.locale,
  });
  expect(before.result.byRuleSet[law]?.outcome).toBe('LIKELY_ELIGIBLE');
  expect(financial(before.result)?.status).toBe('PASS');
  const after = core.doActivity(before, 'settle');
  const fee = currentLaw2026_11.values.settlementApplicationFee.value;
  expect(after.ending).toBe('settled');
  expect(after.stats.money).toBe(25000 - fee);
  expect(after.timeline.cashSavings).toBe(25000 - fee);
  expect(financial(after.result)?.status).toBe('FAIL');
  gameStorage(after.characterId, after);
  const restored = previewGameSave(after.characterId).state!;
  expect(restored.timeline.cashSavings).toBe(25000 - fee);
  for (const locale of ['zh-CN', 'en'] as const) {
    const state = withGameLocale(restored, locale);
    const view = renderView(() => Ending({ state, onChange: vi.fn() }), locale);
    const displayed = view.props(AssessmentColumns).result;
    expect(view.html).toContain(
      t('game.settlementAssessmentAtSubmission', locale),
    );
    expect(displayed.byRuleSet[law]?.outcome).toBe('LIKELY_ELIGIBLE');
    expect(financial(displayed)).toEqual(
      financial(
        evaluate({
          timeline: before.timeline,
          simulationDate: before.date,
          locale,
        }),
      ),
    );
  }
  delete restored.settlementApplication;
  expect(
    renderView(() => Ending({ state: restored, onChange: vi.fn() })).props(
      AssessmentColumns,
    ).result,
  ).toBe(restored.result);
});

test.each(['zh-CN', 'en'] as const)(
  'event notes are outside choice buttons and deduplicated in ordinary and speaker cards in %s',
  (locale) => {
    const fixture = fixtures[1];
    const choices = fixture.choices;
    const note = { zhCN: '会记入日记。', en: 'Recorded in the diary.' };
    fixture.choices = [
      { ...choices[0], note },
      { ...choices[0], id: 'another', note },
    ];
    try {
      const state = at(600, 'home', locale);
      state.pendingEvent = fixture.id;
      for (const make of [
        () => EventCard({ state, onChange: vi.fn() }),
        () =>
          Dialogue({
            state,
            npc: 'margaret',
            onChange: vi.fn(),
            onClose: vi.fn(),
          }),
      ]) {
        const view = renderView(make, locale);
        const text = note[locale === 'en' ? 'en' : 'zhCN'];
        expect(view.html.split(text)).toHaveLength(2);
        for (const button of view.html.matchAll(
          /<button\b[^>]*>([\s\S]*?)<\/button>/g,
        ))
          expect(button[1]).not.toContain(text);
        expect(view.html).toContain('hints');
      }
    } finally {
      fixture.choices = choices;
    }
  },
);

test('fast-forward shows the interrupting event and summary directly, with a visa reminder instead of a stale morning', async () => {
  vi.useFakeTimers();
  const state = at(600);
  state.day.deliveries = [];
  state.eventQueue = ['phone'];
  state.timeline.episodes = [
    {
      ...state.timeline.episodes[0],
      validFrom: '2024-01-01',
      validTo: '2024-07-14',
    },
  ];
  state.date = '2024-01-15';
  fixtures[2].when = [{ dayKind: 'weekend' }];
  try {
    const h = await client(state);
    h.render().click(t('game.fastForward'));
    h.render().click(t('game.confirm'));
    h.render();
    h.flush();
    vi.advanceTimersByTime(280);
    h.render();
    h.flush();
    let view = h.render();
    const stopped = view.props(TownCanvas).state;
    expect(stopped.day.index).toBe(1);
    expect(stopped.day.minute).toBeGreaterThan(420);
    expect(view.html).not.toContain(`>${t('game.morning')}</h2>`);
    view.props(EventCard).onChange(core.resolve(stopped, 'yes'));
    h.render();
    h.flush();
    view = h.render();
    expect(view.props(QuarterSummary).after.day.index).toBe(0);
    expect(view.html).toContain(t('game.visaReminderTitle'));
    expect(view.html).not.toContain(`>${t('game.morning')}</h2>`);
    view.props(QuarterSummary).onContinue();
    expect(h.render().html).not.toContain(`>${t('game.morning')}</h2>`);
    h.dispose();
  } finally {
    delete fixtures[2].when;
  }
});

// Phase 10.5 D: feedback and input hints.
test.each(['zh-CN', 'en'] as const)(
  'dialogue and town list show partial hearts and a full-heart state in %s',
  (locale) => {
    const state = at(600, 'home', locale);
    state.friendship.margaret = 186;
    const nextHeart = t('game.nextHeart', locale).replace('{count}', '86');
    expect(
      renderView(
        () =>
          Dialogue({
            state,
            npc: 'margaret',
            onChange: vi.fn(),
            onClose: vi.fn(),
          }),
        locale,
      ).html,
    ).toContain(nextHeart);
    const h = harness(
      () => Inventory({ state, onChange: vi.fn(), onKitchen: vi.fn() }),
      locale,
    );
    h.render().click(t('game.friends', locale));
    expect(h.render().html).toContain(nextHeart);
    state.friendship.margaret = 1000;
    expect(h.render().html).toContain(t('game.fullHearts', locale));
    expect(
      renderView(
        () =>
          Dialogue({
            state,
            npc: 'margaret',
            onChange: vi.fn(),
            onClose: vi.fn(),
          }),
        locale,
      ).html,
    ).toContain(t('game.fullHearts', locale));
    h.dispose();
  },
);

test('tea, biscuits, flowers, cake, all fish and cooked meals use distinct real assets', () => {
  const ids = [
    'tea',
    'biscuits',
    'flowers',
    'cake',
    ...core.items.filter((i) => i.kind === 'fish').map((i) => i.id),
    ...core.recipes.map((r) => r.makes),
  ];
  expect(new Set(ids.map(itemIcon)).size).toBe(ids.length);
  for (const id of ids) {
    expect(itemIcon(id)).not.toContain('/indoor/item.png');
    const png = readFileSync(
      new URL(`../public${itemIcon(id)}`, import.meta.url),
    );
    if (itemIcon(id).endsWith('.svg')) {
      // A 32×24 canvas; the x origin may shift to centre the art.
      expect(png.toString()).toMatch(/viewBox="-?\d+ 0 32 24"/);
      expect(png.toString()).toContain('shape-rendering="crispEdges"');
      expect(png.toString()).not.toMatch(/<image|<script|href=/);
    } else
      expect(png.subarray(0, 8)).toEqual(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );
  }
  for (const item of core.items.filter((i) =>
    ['fish', 'food'].includes(i.kind),
  ))
    expect(itemIcon(item.id)).not.toContain('/indoor/item.png');
});

test.each(['zh-CN', 'en'] as const)(
  'coarse-pointer controls use touch wording and update when input changes in %s',
  (locale) => {
    const media = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const matchMedia = vi.fn(() => media);
    vi.stubGlobal('window', { matchMedia });
    const h = harness(() => ControlHint(), locale);
    h.render();
    h.flush();
    expect(matchMedia).toHaveBeenCalledWith('(pointer: coarse)');
    expect(h.render().html).toContain(t('game.touchControls', locale));
    expect(h.render().html).not.toContain('WASD');
    media.matches = false;
    media.addEventListener.mock.calls[0][1]();
    expect(h.render().html).toContain(t('game.controls', locale));
    h.dispose();
    expect(media.removeEventListener).toHaveBeenCalledWith(
      'change',
      media.addEventListener.mock.calls[0][1],
    );
  },
);

// Phase 12.5: memories use evidence from this save, never possession alone.
function memoryGame(locale: Locale = 'zh-CN') {
  const state = core.newGame('skilled-worker', 42, locale);
  delete state.pendingEvent;
  state.eventQueue = [];
  state.quarter = 3;
  state.day = {
    ...state.day,
    date: '2025-07-05',
    index: 1,
    kind: 'weekend',
    minute: 480,
    place: 'green',
    deliveries: [],
  };
  delete state.day.festival;
  return state;
}

test.each(['zh-CN', 'en'] as const)(
  'empty experiences produce no memory slots in %s, even with goods in the bag',
  (locale) => {
    const state = memoryGame(locale);
    expect(renderView(() => LifeMemories({ state }), locale).html).toBe('');
    state.inventory = {
      'seed-tomato': 2,
      tomato: 3,
      dumplings: 1,
      'community-lunch-photo': 1,
    };
    state.friendship = { ade: 32 };
    state.flags = [
      'quarter-board-community-lunch',
      'quarter-community-lunch-food',
    ];
    expect(renderView(() => LifeMemories({ state }), locale).html).toBe('');
    const ending = renderView(
      () => Ending({ state: { ...state, ending: 'left' }, onChange: vi.fn() }),
      locale,
    ).html;
    expect(ending).not.toContain('life-memories-heading');
    expect(ending).toContain('ending-');
    for (const line of core.narrative({ ...state, ending: 'left' }))
      expect(ending).toContain(
        (locale === 'en' ? line.en : line.zhCN).split('\n')[0],
      );
  },
);

test('friends are the two highest positive friendships actually met in this character’s run', () => {
  const state = memoryGame();
  state.flags.push(
    'talked-margaret',
    'talked-ade',
    'talked-helen',
    'talked-dave',
    'talked-jamie',
  );
  state.friendship = {
    margaret: 210,
    ade: 500,
    helen: 320,
    dave: 0,
    priya: 900,
    jamie: 1000,
  };
  const before = structuredClone(state);
  expect(endingMemories(state).friends.map((npc) => npc.id)).toEqual([
    'ade',
    'helen',
  ]);
  const html = renderView(() => LifeMemories({ state })).html;
  expect(html).toContain(portraitPath('ade', 'happy'));
  expect(html).toContain(portraitPath('helen', 'happy'));
  expect(html).not.toContain(portraitPath('priya', 'happy'));
  expect(html).not.toContain(portraitPath('jamie', 'happy'));
  expect(state).toEqual(before);
});

test.each(['zh-CN', 'en'] as const)(
  'selection, home entry and each household list render the new art in %s',
  (locale) => {
    const select = renderView(
      () => CharacterSelect({ saves: {}, onSelect: vi.fn() }),
      locale,
    ).html;
    expect(select).toContain(townBanner);
    const home = renderView(() => <Home />, locale).html;
    expect(home).toContain(townBanner);
    expect(home).toContain('href="/game"');
    expect(home).toContain(t('game.entry', locale));
    for (const character of core.characters) {
      expect(select).toContain(portraitPath(character.id));
      const state = core.newGame(character.id, 42, locale);
      const h = harness(
        () => Inventory({ state, onChange: vi.fn(), onKitchen: vi.fn() }),
        locale,
      );
      h.render().click(t('game.friends', locale));
      const list = h.render().html;
      for (const person of core.townsfolk(state))
        expect(list).toContain(portraitPath(person.id));
      expect(list).not.toContain('/game/assets/urban/');
      h.dispose();
    }
  },
);

test.each(['zh-CN', 'en'] as const)(
  'dialogue changes neutral → happy after a real gift, then follows the displayed reply in %s',
  (locale) => {
    let state = core.talk(active(locale), 'margaret');
    const person = core.npcs.find((person) => person.id === 'margaret')!;
    const h = harness(
      () =>
        Dialogue({
          state,
          npc: person.id,
          onChange: vi.fn(),
          onClose: vi.fn(),
        }),
      locale,
    );
    expect(h.render().html).toContain(portraitPath(person.id));
    state = core.gift(state, person.id, 'tea');
    expect(h.render().html).toContain(portraitPath(person.id, 'happy'));
    const worried = renderView(
      () =>
        Dialogue({
          state,
          npc: person.id,
          feedbackText: person.reactions.disliked,
          onChange: vi.fn(),
          onClose: vi.fn(),
        }),
      locale,
    ).html;
    expect(worried).toContain(portraitPath(person.id, 'worried'));
    state.pendingEvent = 'heart-margaret-2';
    expect(h.render().html).toContain(portraitPath(person.id));
    state.pendingEvent = 'heart-margaret-10';
    expect(h.render().html).toContain(portraitPath(person.id, 'happy'));
    h.dispose();
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Nora and Maeve retain their own art across selection, household, dialogue and memories in %s',
  (locale) => {
    const root = '/game/assets/meadow-town/portraits/';
    const select = renderView(
      () => CharacterSelect({ saves: {}, onSelect: vi.fn() }),
      locale,
    ).html;
    expect(select).toContain(`${root}graduate-neutral.png`);
    const state = core.newGame('graduate', 42, locale);
    delete state.pendingEvent;
    state.eventQueue = [];
    state.day.place = 'home';
    state.day.minute = 480;
    delete state.day.festival;
    const person = core.npcs.find((npc) => npc.id === 'maeve')!;
    const list = harness(
      () => Inventory({ state, onChange: vi.fn(), onKitchen: vi.fn() }),
      locale,
    );
    list.render().click(t('game.friends', locale));
    expect(list.render().html).toContain(`${root}maeve-neutral.png`);
    list.dispose();

    let conversation = core.talk(state, 'maeve');
    const dialogue = harness(
      () =>
        Dialogue({
          state: conversation,
          npc: 'maeve',
          onChange: vi.fn(),
          onClose: vi.fn(),
        }),
      locale,
    );
    expect(dialogue.render().html).toContain(`${root}maeve-neutral.png`);
    conversation.inventory.tea = 1;
    conversation = core.gift(conversation, 'maeve', 'tea');
    expect(dialogue.render().html).toContain(`${root}maeve-happy.png`);
    const worried = renderView(
      () =>
        Dialogue({
          state: conversation,
          npc: 'maeve',
          feedbackText: person.reactions.disliked,
          onChange: vi.fn(),
          onClose: vi.fn(),
        }),
      locale,
    ).html;
    expect(worried).toContain(`${root}maeve-worried.png`);
    expect(worried).not.toContain(`${root}skilled-worker-`);
    dialogue.dispose();

    conversation.friendship.maeve = 500;
    expect(endingMemories(conversation).friends.map((npc) => npc.id)).toContain(
      'maeve',
    );
    const memories = renderView(
      () => LifeMemories({ state: conversation }),
      locale,
    ).html;
    expect(memories).toContain(`${root}maeve-happy.png`);
    expect(memories).not.toContain(`${root}skilled-worker-`);
  },
);

test.each(['reading-chair', 'warm-curtains', 'desk-lamp'])(
  'purchasing %s adds only the furniture actually acquired to ending memories',
  (id) => {
    const state = memoryGame();
    state.day.place = 'shop';
    state.stats.money = 5000;
    expect(endingMemories(state).furnishings).toEqual([]);
    const after = core.doActivity(state, `furnish-${id}`);
    expect(endingMemories(after).furnishings.map((item) => item.id)).toEqual([
      id,
    ]);
    const html = renderView(() => LifeMemories({ state: after })).html;
    expect(html.match(/<article/g)).toHaveLength(1);
    expect(html).toContain(t('game.memoryHome'));
    expect(html).not.toContain(t('game.memoryGarden'));
  },
);

test('planting and harvesting keep the crop memory after the plot and bag are empty', () => {
  const state = memoryGame();
  state.day.place = 'allotment';
  state.plots = [{ growth: 0 }];
  state.inventory = { 'seed-tomato': 1, 'seed-corn': 1, potato: 3 };
  expect(endingMemories(state).crops).toEqual([]);
  const planted = core.plant(state, 0, 'seed-tomato');
  expect(endingMemories(planted).crops.map((item) => item.id)).toEqual([
    'tomato',
  ]);
  planted.plots[0].growth = core.items.find(
    (item) => item.id === 'seed-tomato',
  )!.grows!.days;
  const harvested = core.harvest(planted, 0);
  harvested.inventory = {};
  expect(harvested.plots[0].seed).toBeUndefined();
  expect(endingMemories(harvested).crops.map((item) => item.id)).toEqual([
    'tomato',
  ]);
  const html = renderView(() => LifeMemories({ state: harvested })).html;
  expect(html.match(/<article/g)).toHaveLength(1);
  expect(html).toContain('/crops/tomato.png');
  expect(html).not.toContain('/crops/potato.png');
});

test.each(['zh-CN', 'en'] as const)(
  'lunch attendance gives the dedicated bag icon, diary entry and a lasting ending memory in %s',
  (locale) => {
    const state = memoryGame(locale);
    state.flags.push('quarter-board-community-lunch');
    const prepared = core.doActivity(state, 'community-lunch-tables');
    expect(endingMemories(prepared).photo).toBe(false);
    const noon = core.tick(prepared, 720 - prepared.day.minute);
    const joined = core.doActivity(noon, 'community-lunch-attend');
    const diary = recordMemories([], noon, joined, 'action');
    expect(diary).toHaveLength(1);
    expect(diary[0].key).toBe('action:community-lunch-attend:');
    expect(diary[0].text.en).toContain('photograph');
    expect(diary[0].text.zhCN).toContain('合照');
    const bag = renderView(
      () => Inventory({ state: joined, onChange: vi.fn(), onKitchen: vi.fn() }),
      locale,
    ).html;
    expect(bag).toContain('/items/community-lunch-photo.svg');
    expect(bag).toContain(
      locale === 'en' ? 'Neighbourhood lunch photograph' : '邻里聚餐合照',
    );
    expect(
      readFileSync(
        new URL(
          '../public/game/assets/items/community-lunch-photo.svg',
          import.meta.url,
        ),
        'utf8',
      ),
    ).toContain('<svg');
    const gifted = core.gift(joined, 'margaret', 'community-lunch-photo');
    expect(gifted.inventory['community-lunch-photo']).toBe(0);
    gameStorage(gifted.characterId, gifted, diary);
    const restored = previewGameSave(gifted.characterId);
    expect(restored.diary).toEqual(diary);
    expect(endingMemories(restored.state!).photo).toBe(true);
    expect(
      renderView(() => LifeMemories({ state: restored.state! }), locale).html,
    ).toContain('/items/community-lunch-photo.svg');
    const journal = renderView(
      () =>
        QuarterSummary({
          before: noon,
          after: joined,
          diary: restored.diary,
          onContinue: vi.fn(),
          onVisit: vi.fn(),
        }),
      locale,
    ).html;
    expect(journal).toContain(locale === 'en' ? 'photograph' : '合照');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'a populated ending renders four evidence-backed slots and keeps both assessments in %s',
  (locale) => {
    let state = memoryGame(locale);
    state.flags.push('quarter-board-community-lunch');
    state = core.doActivity(state, 'community-lunch-tables');
    state = core.tick(state, 720 - state.day.minute);
    state = core.doActivity(state, 'community-lunch-attend');
    state = core.enter(state, 'shop');
    state.stats.money = 5000;
    state = core.doActivity(state, 'furnish-reading-chair');
    state = core.enter(state, 'allotment');
    state.plots = [{ growth: 0 }];
    state.inventory['seed-tomato'] = 1;
    state = core.plant(state, 0, 'seed-tomato');
    state.ending = 'left';
    const memories = renderView(() => LifeMemories({ state }), locale).html;
    expect(memories.match(/<article/g)).toHaveLength(4);
    if (locale === 'en') expect(memories).not.toMatch(cjk);
    const ending = renderView(
      () => Ending({ state, onChange: vi.fn() }),
      locale,
    ).html;
    expect(ending).toContain(memories);
    for (const id of ['current-law', 'earned-settlement'])
      expect(ending).toContain(`ending-${id}`);
    expect(ending).toContain(t('game.replay', locale));
  },
);

test('the destination dock pauses the scene, closes without travel, and sends the chosen destination to the canvas', async () => {
  vi.useFakeTimers();
  const h = await client(at(480));
  h.render().props(TownCanvas).onInteract({ kind: 'home', id: 'exit' });
  h.render();
  h.flush();
  const before = h.render().props(TownCanvas).state;
  expect(h.render().html).toContain('aria-expanded="false"');
  h.render().click(t('game.places'));
  let view = h.render();
  h.flush();
  expect(view.props(Modal).sheet).toBe(true);
  expect(view.html).toContain('id="game-destinations"');
  expect(view.html).toContain('aria-expanded="true"');
  expect(view.props(TownCanvas).paused).toBe(true);
  vi.advanceTimersByTime(4000);
  expect(h.render().props(TownCanvas).state).toEqual(before);
  view.props(Modal).onClose!();
  view = h.render();
  h.flush();
  expect(view.props(TownCanvas).paused).toBe(false);
  expect(view.props(TownCanvas).destination).toBeUndefined();
  view.click(t('game.places'));
  view = h.render();
  h.flush();
  const sheet = renderView(() => view.props(Modal).children);
  expect(sheet.buttons).toHaveLength(core.places.length);
  expect(sheet.buttons.every((b) => !b.disabled)).toBe(true);
  sheet.click('公司');
  view = h.render();
  h.flush();
  expect(view.html).not.toContain('id="game-destinations"');
  expect(view.props(TownCanvas).paused).toBe(false);
  expect(view.props(TownCanvas).destination?.location).toBe('work');
  expect(view.props(TownCanvas).state).toEqual(before);
  view.props(TownCanvas).onInteract({ kind: 'place', id: 'work' });
  expect(h.render().props(LocationMenu).location).toBe('work');
  h.dispose();
});

test.each(['zh-CN', 'en'] as const)(
  'interaction button tracks touch, keyboard and target changes in %s',
  (locale) => {
    const media = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('window', { matchMedia: vi.fn(() => media) });
    let interaction: React.ComponentProps<
      typeof InteractButton
    >['interaction'] = { kind: 'home', id: 'bed' };
    const onInteract = vi.fn();
    const h = harness(
      () => InteractButton({ interaction, onInteract }),
      locale,
    );
    h.render();
    h.flush();
    const check = (name: string, exit = false) => {
      const expected = exit
        ? name
        : t('game.interact', locale).replace('{name}', name);
      const view = h.render();
      expect(view.buttons[0].label).toBe(
        `${media.matches ? '' : '[E] '}${expected}`,
      );
      expect(view.html).not.toContain('Space');
      expect(view.html).not.toContain('空格');
      view.buttons[0].click();
    };
    check(t('game.bed', locale));
    interaction = { kind: 'home', id: 'desk' };
    check(t('game.desk', locale));
    media.matches = false;
    media.addEventListener.mock.calls[0][1]();
    check(t('game.desk', locale));
    interaction = { kind: 'home', id: 'exit' };
    check(t('game.exitHome', locale), true);
    interaction = { kind: 'npc', id: 'margaret' };
    const person = core.npcs.find((p) => p.id === 'margaret')!;
    check(locale === 'en' ? person.name.en : person.name.zhCN);
    interaction = { kind: 'place', id: 'shop' };
    const place = core.places.find((p) => p.id === 'shop')!;
    check(locale === 'en' ? place.name.en : place.name.zhCN);
    interaction = { kind: 'plot', id: 0 };
    media.matches = true;
    media.addEventListener.mock.calls[0][1]();
    check(t('game.plot', locale).replace('{count}', '1'));
    expect(onInteract).toHaveBeenCalledTimes(7);
    h.dispose();
    expect(media.removeEventListener).toHaveBeenCalledWith(
      'change',
      media.addEventListener.mock.calls[0][1],
    );
  },
);

test.each(['zh-CN', 'en'] as const)(
  'ending keeps primary actions before achievements, with unearned entries collapsed and counted in %s',
  (locale) => {
    const state = { ...active(locale), ending: 'left' as const };
    const all = [
      ...core.achievements,
      ...(core.characterOf(state.characterId).achievements ?? []),
    ];
    for (const earned of [[], [all[0].id], all.map((a) => a.id)]) {
      state.achievements = earned;
      const change = vi.fn();
      const view = renderView(
        () => Ending({ state, onChange: change }),
        locale,
      );
      const achievementHeading = view.html.indexOf(
        t('game.achievements', locale),
      );
      for (const action of [
        'game.openTimeline',
        'game.replay',
        'game.changeCharacter',
      ] as const)
        expect(view.html.indexOf(t(action, locale))).toBeLessThan(
          achievementHeading,
        );
      const disclosure = view.html.match(
        /<details([^>]*)><summary>([^<]*)<\/summary>([\s\S]*?)<\/details>/,
      )!;
      expect(disclosure[1]).not.toContain('open');
      expect(disclosure[2]).toBe(
        `${t('game.unearned', locale)} (${all.length - earned.length})`,
      );
      for (const item of all) {
        const name = locale === 'en' ? item.name.en : item.name.zhCN;
        expect(disclosure[3].includes(name)).toBe(!earned.includes(item.id));
      }
      view.click(t('game.replay', locale));
      expect(change.mock.calls.at(-1)![0].characterId).toBe(state.characterId);
      expect(change.mock.calls.at(-1)![0].ending).toBeUndefined();
      view.click(t('game.changeCharacter', locale));
      expect(change).toHaveBeenLastCalledWith(undefined);
    }
  },
);

test('location selection follows the entered place while closed locations remain accessible', async () => {
  const h = await client(at(430));
  expect(h.render().html).toMatch(
    /<button[^>]*aria-current="location"[^>]*>家<\/button>/,
  );
  h.render().props(TownCanvas).onInteract({ kind: 'place', id: 'shop' });
  expect(h.render().html).toMatch(
    /<button[^>]*aria-current="location"[^>]*>街角小店/,
  );
  expect(h.render().html.match(/aria-current="location"/g)).toHaveLength(1);
  h.dispose();
});

test.each([
  {
    minute: 420,
    kind: 'workday',
    open: ['home', 'station', 'allotment', 'pond', 'board', 'green', 'bench'],
  },
  {
    minute: 540,
    kind: 'workday',
    open: [
      'home',
      'work',
      'college',
      'library',
      'gp',
      'cafe',
      'shop',
      'council',
      'visa',
      'station',
      'allotment',
      'pond',
      'board',
      'green',
      'bench',
    ],
  },
  {
    minute: 540,
    kind: 'weekend',
    open: [
      'home',
      'college',
      'library',
      'cafe',
      'shop',
      'council',
      'visa',
      'station',
      'allotment',
      'pond',
      'board',
      'green',
      'bench',
    ],
  },
])(
  'destinations put open places first at $minute on $kind without changing group order',
  async ({ minute, kind, open }) => {
    const start = at(minute);
    start.day.kind = kind as GameState['day']['kind'];
    const original = core.places.map((p) => p.id);
    const h = await client(start);
    const destinations = h
      .render()
      .html.match(/<nav[^>]*aria-label="走到哪里？"[^>]*>(.*?)<\/nav>/)?.[1];
    expect(destinations).toBeDefined();
    const names = [...destinations!.matchAll(/<button[^>]*>([^<]+)/g)].map(
      (match) => match[1],
    );
    const expected = [...open, ...original.filter((id) => !open.includes(id))];
    expect(names).toEqual(
      expected.map((id) => core.places.find((p) => p.id === id)!.name.zhCN),
    );
    expect(destinations).toMatch(/aria-current="location"[^>]*>家<\/button>/);
    expect(core.places.map((p) => p.id)).toEqual(original);
    h.dispose();
  },
);

// Phase 12.7: event endings use the same persisted diary as the season review.
test.each(['zh-CN', 'en'] as const)(
  'a real map surprise shows its result once, pauses the clock and persists the ending in %s',
  async (locale) => {
    vi.useFakeTimers();
    const start = at(600, 'home', locale);
    start.day.deliveries = [];
    start.dayNumber = (Math.imul(start.seed ^ 1, 2654435761) >>> 0) % 3;
    start.day.index = start.dayNumber as GameState['day']['index'];
    const clue = core.mapSurprises(start).find((s) => s.phase === 'clue')!;
    const h = await client(start, locale);
    h.render().props(TownCanvas).onInteract({ kind: 'home', id: 'exit' });
    h.render().props(TownCanvas).onInteract({
      kind: 'surprise',
      id: clue.anchor,
      name: clue.text,
    });
    const card = h.render().props(EventCard);
    expect(card.state.pendingEvent).toBe('surprise-biscuit-cat');
    const resolved = core.resolve(card.state, 'wait');
    card.onChange(resolved);
    h.render();
    h.flush();
    const view = h.render();
    expect(view.props(Modal).title).toBe(t('game.eventResult', locale));
    expect(view.props(OutcomeText).text).toEqual(resolved.outcome!.text);
    expect(view.html).toContain(
      resolved.outcome!.text![locale === 'en' ? 'en' : 'zhCN'],
    );
    expect(view.props(TownCanvas).paused).toBe(true);
    vi.advanceTimersByTime(4000);
    expect(h.render().props(TownCanvas).state.day.minute).toBe(
      resolved.day.minute,
    );
    const saved = previewGameSave(start.characterId);
    expect(
      saved.diary!.filter((m) => m.text.en === resolved.outcome!.text!.en),
    ).toHaveLength(1);
    view.click(t('game.continuePlaying', locale));
    expect(h.render().html).not.toContain(t('game.eventResult', locale));
    expect(h.render().props(TownCanvas).paused).toBe(false);
    h.dispose();
  },
);

test('an event without its own result never replays a previous activity outcome', async () => {
  const start = at(600);
  start.day.deliveries = [];
  start.pendingEvent = 'phone';
  start.outcome = {
    kind: 'activity',
    text: { zhCN: '旧结果', en: 'Old result' },
  };
  const h = await client(start);
  h.render().props(EventCard).onChange(core.resolve(start, 'yes'));
  expect(h.render().html).not.toContain('旧结果');
  expect(h.render().html).not.toContain(t('game.eventResult'));
  h.dispose();
});

test('fast-forward queues a new event result in the saved season review without an extra stop', async () => {
  vi.useFakeTimers();
  const start = at(600);
  start.day.deliveries = [];
  start.eventQueue = ['phone'];
  fixtures[2].when = [{ dayKind: 'weekend' }];
  const text = {
    zhCN: '收好纸条，明天见。',
    en: 'You tuck away the note. See you tomorrow.',
  };
  try {
    const h = await client(start);
    h.render().click(t('game.fastForward'));
    h.render().click(t('game.confirm'));
    h.render();
    h.flush();
    vi.advanceTimersByTime(280);
    h.render();
    h.flush();
    const card = h.render().props(EventCard);
    const next = core.resolve(card.state, 'yes');
    // A presentation fixture: current surprise cards deliberately never enter fast-forward.
    next.outcome = { kind: 'activity', text };
    card.onChange(next);
    expect(h.render().html).not.toContain(t('game.eventResult'));
    h.render();
    h.flush();
    const view = h.render();
    expect(
      view.props(QuarterSummary).diary!.filter((m) => m.text.en === text.en),
    ).toHaveLength(1);
    expect(view.html).toContain(text.zhCN);
    expect(view.html).not.toContain(t('game.eventResult'));
    h.flush();
    expect(
      previewGameSave(start.characterId).diary!.some(
        (m) => m.text.en === text.en,
      ),
    ).toBe(true);
    view.props(QuarterSummary).onContinue();
    expect(h.render().html).not.toContain(text.zhCN);
    h.dispose();
  } finally {
    delete fixtures[2].when;
  }
});

test('the collection toolbar entry opens the read-only collection tab', async () => {
  const h = await client(at(600));
  h.render().click(t('game.collection'));
  expect(h.render().props(Inventory).initialTab).toBe('collection');
  expect(h.render().html).toContain(t('game.collectionFish'));
  h.dispose();
});

test.each(['zh-CN', 'en'] as const)(
  'the surprise interaction bar names the clue in %s',
  (locale) => {
    const name = { zhCN: '台阶旁的交换箱', en: 'Swap box by the steps' };
    const view = renderView(
      () =>
        InteractButton({
          interaction: { kind: 'surprise', id: 'library-steps', name },
          onInteract: vi.fn(),
        }),
      locale,
    );
    expect(view.html).toContain(name[locale === 'en' ? 'en' : 'zhCN']);
  },
);

test.each(core.recipes)(
  '$id kitchen steps and skipping produce exactly the same core result',
  (recipe) => {
    const initial = at(600, 'home');
    initial.inventory = { ...recipe.needs };
    const expected = core.cook(initial, recipe.id);
    for (const skipAt of [-1, 0, 1]) {
      let state = structuredClone(initial);
      const onChange = vi.fn((next: GameState) => {
        state = next;
      });
      const h = harness(() => Kitchen({ state, onChange }));
      h.render().click(recipe.label.zhCN);
      const steps = Object.keys(recipe.needs).length + 2;
      expect(steps).toBeGreaterThanOrEqual(3);
      expect(steps).toBeLessThanOrEqual(4);
      for (let step = 0; step < steps; step++) {
        const view = h.render();
        expect(state).toEqual(initial);
        expect(view.html).toContain(`第 ${step + 1} / ${steps} 步`);
        expect(view.html).toMatch(
          /class="[^"]*buttons[^"]*"><button class="[^"]*button[^"]*"/,
        );
        for (const key of ['game.kitchenSkip', 'game.kitchenRecipes'] as const)
          expect(view.html).toMatch(
            new RegExp(
              `<button class="[^"]*secondary[^"]*">${t(key)}</button>`,
            ),
          );
        const button = view.buttons.find(
          (b) =>
            b.label !== t('game.kitchenSkip') &&
            b.label !== t('game.kitchenRecipes'),
        )!;
        const click =
          skipAt === step
            ? view.buttons.find((b) => b.label === t('game.kitchenSkip'))!.click
            : button.click;
        click();
        if (skipAt === step || step === steps - 1) {
          click();
          break;
        }
      }
      expect(onChange).toHaveBeenCalledOnce();
      expect(state).toEqual(expected);
      expect(h.render().html).toContain(`/dishes/${recipe.makes}.svg`);
      expect(h.render().html).toContain(t('game.kitchenComment'));
      expectCelebrationIcon(h.render().html);
      h.render().click(t('game.kitchenRecipes'));
      expect(
        h.render().buttons.find((b) => b.label.startsWith(recipe.label.zhCN))!
          .disabled,
      ).toBe(true);
      h.dispose();
    }
  },
);

test('kitchen cancel and rejected settlement do not consume ingredients or show a finished dish', () => {
  const state = at(600, 'home');
  state.inventory.potato = 2;
  const onChange = vi.fn();
  const h = harness(() => Kitchen({ state, onChange }));
  h.render().click('烤土豆');
  h.render().click(t('game.kitchenRecipes'));
  expect(onChange).not.toHaveBeenCalled();
  h.render().click('烤土豆');
  state.day.minute = 1439;
  h.render().click(t('game.kitchenSkip'));
  expect(h.render().html).toContain(t('game.actionUnavailable'));
  expect(h.render().html).not.toContain(t('game.kitchenComment'));
  expect(state.inventory.potato).toBe(2);
  expect(onChange).not.toHaveBeenCalled();
});

test.each(['keyboard', 'button'] as const)(
  'easy fishing accepts a late bite with %s and records a repeat catch correctly',
  (control) => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const listeners = new Map<
      string,
      (e: {
        key: string;
        repeat?: boolean;
        target?: { tagName: string };
        preventDefault: () => void;
      }) => void
    >();
    vi.stubGlobal('window', {
      addEventListener: (
        name: string,
        fn: typeof listeners extends Map<string, infer F> ? F : never,
      ) => listeners.set(name, fn),
      removeEventListener: (name: string) => listeners.delete(name),
    });
    let state = at(600, 'pond');
    const caughtId = Object.keys(core.fish(state, true).outcome!.items!)[0];
    state.lifeRecords = {
      fish: [{ itemId: caughtId, year: 1, quarter: 1 }],
      dishes: [],
      harvests: [],
    };
    const onChange = vi.fn((next: GameState) => {
      state = next;
    });
    const h = harness(() => Fishing({ state, onChange }));
    h.render();
    h.flush();
    expect(h.render().html).toMatch(
      /class="[^"]*secondary[^"]*" aria-pressed="false"/,
    );
    h.render().click(t('game.fishEasy'));
    expect(h.render().html).toMatch(
      /class="[^"]*secondary[^"]*" aria-pressed="true"><svg/,
    );
    const key = (value: string, repeat = false, tagName?: string) =>
      listeners.get('keydown')!({
        key: value,
        repeat,
        target: tagName ? { tagName } : undefined,
        preventDefault: vi.fn(),
      });
    key(' ', false, 'BUTTON');
    expect(h.render().html).not.toContain(t('game.castingFish'));
    if (control === 'keyboard') key('e');
    else h.render().click(t('game.cast'));
    key('e', true);
    expect(
      h.render().buttons.find((b) => b.label === t('game.fishEasy'))!.disabled,
    ).toBe(true);
    vi.advanceTimersByTime(1450);
    expect(h.render().html).toContain(t('game.bite'));
    vi.advanceTimersByTime(1500);
    if (control === 'keyboard') key(' ');
    else h.render().click(t('game.reel'));
    key('E');
    vi.advanceTimersByTime(500);
    expect(onChange).toHaveBeenCalledOnce();
    expect(h.render().html).toContain(t('game.fishCollected'));
    expect(h.render().html).not.toContain(t('game.fishFirst'));
    h.dispose();
    expect(listeners.size).toBe(0);
  },
);

test.each(['early', 'timeout', 'unmount'] as const)(
  'fishing %s leaves the entire game unchanged',
  (caseName) => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const state = at(600, 'pond');
    const original = structuredClone(state);
    const onChange = vi.fn();
    const h = harness(() => Fishing({ state, onChange }));
    h.render();
    h.flush();
    if (caseName === 'timeout') h.render().click(t('game.fishEasy'));
    h.render().click(t('game.cast'));
    vi.advanceTimersByTime(caseName === 'early' ? 450 : 1450);
    if (caseName !== 'timeout') h.render().click(t('game.reel'));
    if (caseName === 'unmount') h.dispose();
    vi.advanceTimersByTime(3000);
    expect(state).toEqual(original);
    expect(onChange).not.toHaveBeenCalled();
    if (caseName !== 'unmount')
      expect(h.render().html).toContain(t('game.fishMiss'));
    h.dispose();
  },
);

test('task 56 / 43 walk: the kitchen says where ingredients come from, and fishing remembers easy mode', () => {
  const state = at(600, 'home');
  state.inventory = {};
  const kitchen = () => renderView(() => Kitchen({ state, onChange: vi.fn() }));
  expect(kitchen().html).toContain(t('game.kitchenNoIngredients'));
  // review56-1: one ingredient short of every recipe still says so.
  state.inventory = { perch: 1, turnip: 1 };
  expect(kitchen().html).toContain(t('game.kitchenNoIngredients'));
  state.inventory.potato = 1;
  expect(kitchen().html).not.toContain(t('game.kitchenNoIngredients'));

  const pond = at(600, 'pond');
  const first = harness(() => Fishing({ state: pond, onChange: vi.fn() }));
  expect(first.render().html).toContain(t('game.fishHint'));
  first.render().click(t('game.fishEasy'));
  expect(first.render().html).toContain(t('game.fishEasyHint'));
  expect(storage.get('uk-immigration-life-fishing-easy')).toBe('true');
  first.dispose();
  // Reopened: still in easy mode.
  expect(
    renderView(() => Fishing({ state: pond, onChange: vi.fn() })).html,
  ).toContain(t('game.fishEasyHint'));
});

test('task 56 / review40-1 risk: fast-forward warns when the adjoining renewal also ends this season, and without permission', async () => {
  const state = at(600, 'home', 'en');
  state.date = '2024-04-15';
  const base = state.timeline.episodes[0];
  state.timeline.episodes = [
    { ...base, validFrom: '2024-01-01', validTo: '2024-05-14' },
    { ...base, validFrom: '2024-05-15', validTo: '2024-06-30' },
  ];
  expect(visaExpiresThisSeason(state)).toBe(true);
  state.timeline.episodes[1].validTo = '2027-06-30';
  expect(visaExpiresThisSeason(state)).toBe(false);
  // A restored save with no current permission names no empty date.
  state.timeline.episodes = [];
  const h = await client(state, 'en');
  h.render().click(t('game.fastForward', 'en'));
  expect(h.render().html).toContain(t('game.fastVisaWarningNone', 'en'));
  h.dispose();
});

test.each(['zh-CN', 'en'] as const)(
  'task 56 / review34-2 risk: a place says when some actions no longer fit before closing in %s',
  (locale) => {
    const state = core.newGame('graduate', 17, locale);
    delete state.pendingEvent;
    state.eventQueue = [];
    state.flags.push(
      'graduate-applied',
      'graduate-interviewed',
      'graduate-sponsor-confirmed',
      'graduate-offer-reviewed',
      'graduate-cos-ready',
    );
    state.day.place = 'visa';
    const ids = (minute: number) =>
      core
        .activities({ ...state, day: { ...state.day, minute } }, 'visa')
        .map((a) => a.id);
    expect(ids(600)).toEqual(
      expect.arrayContaining(['graduate-check-offer', 'graduate-switch']),
    );
    expect(ids(1141)).toEqual(['graduate-check-offer']);
    state.day.minute = 1141;
    const html = renderView(
      () => LocationMenu({ state, location: 'visa', onChange: vi.fn() }),
      locale,
    ).html;
    expect(html).toContain(
      t('game.tooLateSome', locale).replace('{time}', '20:00'),
    );
  },
);
