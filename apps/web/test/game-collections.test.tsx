import './load-game-characters';
import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import {
  cook,
  eat,
  fish,
  harvest,
  items,
  newGame,
  recipes,
  type GameState,
} from '@uk-immigration/game';
import type { Locale } from '@uk-immigration/engine';
import { Inventory, LifeCollection } from '../app/game/life-overlays';
import { Ending, LifeMemories } from '../app/game/game-view';
import { endingMemories, itemIcon } from '../app/game/session';
import { LocaleContext } from '../i18n/locale';
import { t, withCount } from '../i18n';

vi.mock('react', { spy: true });
afterEach(() => vi.restoreAllMocks());

function active(seed = 42): GameState {
  const state = newGame('skilled-worker', seed);
  delete state.pendingEvent;
  state.eventQueue = [];
  state.day.deliveries = [];
  state.day.minute = 600;
  state.day.place = 'home';
  return state;
}

function render(node: React.ReactNode, locale: Locale = 'zh-CN') {
  return renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
}

test.each(['zh-CN', 'en'] as const)(
  'old saves and inventory goods leave all collection entries undiscovered in %s',
  (locale) => {
    const state = active();
    delete state.lifeRecords;
    state.inventory = { perch: 1, dumplings: 1, potato: 3 };
    const before = structuredClone(state);
    const html = render(<LifeCollection state={state} />, locale);
    expect(html).toContain('0 / 6');
    expect(html).toContain('0 / 8');
    expect(html.split(t('game.collectionUnknown', locale))).toHaveLength(15);
    expect(html).not.toContain('fish.png');
    expect(html).not.toContain('meal.png');
    expect(html).toContain(
      withCount(
        withCount(t('game.collectionHarvests', locale), 'count', 0),
        'kinds',
        0,
      ),
    );
    expect(render(<LifeMemories state={state} />, locale)).toBe('');
    expect(state).toEqual(before);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'discovered entries from an old save show only their first date in %s',
  (locale) => {
    const state = active();
    state.lifeRecords = {
      fish: [{ itemId: 'perch', year: 1, quarter: 2 }],
      dishes: [{ itemId: 'baked-potato', year: 2, quarter: 3 }],
      harvests: [],
    };
    const html = render(<LifeCollection state={state} />, locale);
    expect(html).toContain('1 / 6');
    expect(html).toContain('1 / 8');
    const details = Array.from(
      html.matchAll(/<small[^>]*>(.*?)<\/small>/g),
      ([, detail]) => detail,
    );
    expect(details).toEqual(
      locale === 'en'
        ? ['First: Year 1 · Spring', 'First: Year 2 · Summer']
        : ['首次：第 1 年 · 春季', '首次：第 2 年 · 夏季'],
    );
  },
);

test.each(recipes)(
  '$id is shown after real cooking and stays in the collection and ending after eating and restoring',
  (recipe) => {
    const state = active();
    state.year = 2;
    state.quarter = 3;
    state.day.weather = 'cloudy';
    state.inventory = { ...recipe.needs };
    const cooked = cook(state, recipe.id);
    const restored: GameState = JSON.parse(
      JSON.stringify(eat(cooked, recipe.makes)),
    );
    restored.day.weather = 'sunny';
    expect(restored.inventory[recipe.makes]).toBe(0);
    expect(endingMemories(restored).dishes.map((item) => item.id)).toEqual([
      recipe.makes,
    ]);
    for (const locale of ['zh-CN', 'en'] as const) {
      const item = items.find((entry) => entry.id === recipe.makes)!;
      const name = locale === 'en' ? item.name.en : item.name.zhCN;
      const html = render(<LifeCollection state={restored} />, locale);
      expect(html).toContain('1 / 8');
      expect(html).toContain(name);
      expect(html).toMatch(
        locale === 'en'
          ? /First: Year 2 · Summer<\/small><small[^>]*>You made it at home on a cloudy day\.<\/small>/
          : /首次：第 2 年 · 夏季<\/small><small[^>]*>那天有些阴，你在家做成了这道菜。<\/small>/,
      );
      const ending = render(
        <Ending state={{ ...restored, ending: 'left' }} onChange={() => {}} />,
        locale,
      );
      expect(ending).toContain(t('game.memoryDishes', locale));
      expect(ending).toContain(name);
    }
  },
);

test('a real catch unlocks a named fish while the other fish stay unknown', () => {
  let caught: GameState | undefined;
  for (let seed = 1; seed <= 40; seed++) {
    const state = active(seed);
    state.day.place = 'pond';
    state.day.weather = 'rain';
    const next = fish(state, true);
    if (next.lifeRecords?.fish.length) {
      caught = next;
      break;
    }
  }
  expect(caught).toBeDefined();
  const id = caught!.lifeRecords!.fish[0].itemId;
  const consumed = eat(caught!, id);
  const before = structuredClone(consumed);
  const html = render(<LifeCollection state={consumed} />);
  expect(html).toContain('1 / 6');
  expect(html).toContain(`/game/assets/meadow-town/fish/${id}.svg`);
  expect(html).toContain(items.find((item) => item.id === id)!.name.zhCN);
  expect(html).toContain('那天下着雨，你在公园池塘钓到了它。');
  expect(render(<LifeCollection state={consumed} />, 'en')).toContain(
    'You caught it at the park pond on a rainy day.',
  );
  for (const item of items.filter(
    (entry) => entry.kind === 'fish' && entry.id !== id,
  ))
    expect(html).not.toContain(item.name.zhCN);
  expect(consumed).toEqual(before);
});

test('harvest statistics count successful harvests, including repeated crops', () => {
  const state = active();
  state.day.place = 'allotment';
  state.plots = [
    { seed: 'seed-turnip', growth: 100 },
    { seed: 'seed-turnip', growth: 100 },
    { seed: 'seed-potato', growth: 100 },
  ];
  const after = harvest(harvest(harvest(state, 0), 1), 2);
  const html = render(<LifeCollection state={after} />);
  expect(html).toContain('收获 3 次，共 2 种作物');
});

test.each([
  { flags: [] },
  { flags: ['flowerbed-marked'] },
  { flags: ['flowerbed-marked', 'flowerbed-planted'] },
])(
  'unfinished flowerbed flags $flags do not create an ending memory',
  ({ flags }) => {
    const state = active();
    state.flags = flags;
    expect(endingMemories(state).flowerbed).toBe(false);
    expect(render(<LifeMemories state={state} />)).toBe('');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the completed flowerbed is remembered independently of inventory in %s',
  (locale) => {
    const state = active();
    state.flags = ['flowerbed-open'];
    state.inventory = {};
    const restored: GameState = JSON.parse(JSON.stringify(state));
    const before = structuredClone(restored);
    expect(endingMemories(restored).flowerbed).toBe(true);
    const html = render(<LifeMemories state={restored} />, locale);
    expect(html).toContain(t('game.memoryFlowerbed', locale));
    expect(html).toContain(t('game.memoryFlowerbedText', locale));
    expect(restored).toEqual(before);
  },
);

test('the collection opens directly and is also reachable from the bag tab', () => {
  const state = active();
  const html = render(
    <Inventory
      state={state}
      onChange={() => {}}
      onKitchen={() => {}}
      initialTab="collection"
    />,
  );
  expect(html).toContain('aria-selected="true">收藏');
  expect(html).toContain('0 / 6');
  expect(html).not.toContain(t('game.emptyBag', 'zh-CN'));

  let tab = 'bag';
  vi.spyOn(React, 'useState').mockImplementation(((initial: unknown) =>
    initial === 'bag'
      ? [
          tab,
          (next: string) => {
            tab = next;
          },
        ]
      : [initial, () => {}]) as typeof React.useState);
  let selectCollection: (() => void) | undefined;
  function Probe() {
    const tree = Inventory({ state, onChange: () => {}, onKitchen: () => {} });
    const visit = (node: React.ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (
          !React.isValidElement<{
            children?: React.ReactNode;
            onClick?: () => void;
          }>(child)
        )
          return;
        if (child.type === 'button' && child.props.children === '收藏')
          selectCollection = child.props.onClick;
        visit(child.props.children);
      });
    };
    visit(tree);
    return tree;
  }
  expect(render(<Probe />)).not.toContain('0 / 6');
  expect(selectCollection).toBeDefined();
  selectCollection!();
  expect(render(<Probe />)).toContain('0 / 6');
});

test('task 56 / 43 walk: junk catches have their own icons, not the indoor picture frames', () => {
  for (const id of ['old-boot', 'shopping-trolley']) {
    const icon = itemIcon(id);
    expect(icon).toBe(`/game/assets/meadow-town/junk/${id}.svg`);
    expect(existsSync(`public${icon}`)).toBe(true);
  }
});
