import { mountClient } from './game-client-harness';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import * as core from '@uk-immigration/game';
import { CharacterSelect } from '../app/game/character-select';
import styles from '../app/game/game.module.css';
import TownCanvas from '../app/game/town-canvas';
import { t } from '../i18n';

beforeEach(() => {
  const slots = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => slots.get(key) ?? null,
    setItem: (key: string, value: string) => slots.set(key, value),
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function delayCharacterLoad() {
  const loadStory = core.loadCharacter;
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const waiting = new Promise<void>((ok, fail) => {
    resolve = ok;
    reject = fail;
  });
  const load = vi
    .spyOn(core, 'loadCharacter')
    .mockImplementation(async (id) => {
      await waiting;
      return loadStory(id);
    });
  return { load, resolve, reject };
}

function saveStatus(text: string) {
  return `<p class="${styles.saveStatus}" role="status">${text}</p>`;
}

test('the save status stays mounted and the disclaimer appears only when ready', async () => {
  const h = mountClient();
  const picker = h.render();
  const { resolve } = delayCharacterLoad();
  const entering = picker
    .props(CharacterSelect)
    .onSelect('skilled-worker', 'new');
  const loadingStory = h.render().html;
  resolve();
  await entering;
  const game = h.render();

  for (const html of [h.initialHtml, loadingStory]) {
    expect(html).toContain(saveStatus(''));
    expect(html).not.toContain(t('game.saved'));
    expect(html).not.toContain(t('game.disclaimer'));
  }
  for (const html of [picker.html, game.html]) {
    expect(html).toContain(saveStatus(t('game.saved')));
    expect(html).toContain(t('game.disclaimer'));
  }
  expect(game.props(TownCanvas).state.characterId).toBe('skilled-worker');
  h.dispose();
});

test('the save status reports unavailable storage after the initial read fails', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw Error();
    },
    setItem: () => {
      throw Error();
    },
  });
  const h = mountClient();
  expect(h.initialHtml).toContain(saveStatus(''));
  expect(h.render().html).toContain(saveStatus(t('game.storageUnavailable')));
  h.dispose();
});

test('continue rejects the same foreign event IDs before and after loading their owners and preserves the saves', async () => {
  await core.loadCharacter('skilled-worker');
  const state = core.newGame('skilled-worker', 42);
  const key = 'uk-immigration-life-v3:skilled-worker';
  const saves = [
    { pendingEvent: 'heart-maeve-2' },
    { eventQueue: ['budget-bno-neighbour'] },
    {
      day: {
        ...state.day,
        deliveries: [{ eventId: 'removed-event', channel: 'letter' }],
      },
    },
  ].map((change) => JSON.stringify({ ...state, clientVersion: 1, ...change }));
  async function checkSaves() {
    for (const raw of saves) {
      localStorage.setItem(key, raw);
      const { load, resolve } = delayCharacterLoad();
      const h = mountClient();
      const picker = h.render();
      expect(picker.html).toContain(t('game.continue'));
      const entering = picker
        .props(CharacterSelect)
        .onSelect(state.characterId, 'continue');
      expect(h.render().html).toContain(t('game.loading'));
      resolve();
      await entering;
      const rejected = h.render();
      expect(rejected.html).toContain(t('game.chooseCharacter'));
      expect(rejected.html).not.toContain(t('game.continue'));
      h.flush();
      expect(localStorage.getItem(key)).toBe(raw);
      h.dispose();
      load.mockRestore();
    }
  }
  expect(() => core.characterOf('graduate')).toThrow(/not loaded/);
  expect(() => core.characterOf('hong-kong-bno')).toThrow(/not loaded/);
  await checkSaves();
  await core.loadCharacter('graduate');
  await core.loadCharacter('hong-kong-bno');
  await checkSaves();
});

test('a cold start waits for the selected story and ignores a second selection before render', async () => {
  const { load, resolve } = delayCharacterLoad();
  const h = mountClient();
  const { onSelect } = h.render().props(CharacterSelect);
  const entering = onSelect('family-partner', 'new');
  onSelect('graduate', 'new');
  expect(load.mock.calls).toEqual([['family-partner']]);
  expect(h.render().html).toContain(t('game.loading'));
  expect(() => core.characterOf('family-partner')).toThrow(/not loaded/);
  resolve();
  await entering;
  expect(h.render().props(TownCanvas).state).toMatchObject({
    characterId: 'family-partner',
    pendingEvent: 'opening-family-partner',
  });
  h.dispose();
});

test('a rejected story load reaches the route error boundary', async () => {
  const { reject } = delayCharacterLoad();
  const h = mountClient();
  const entering = h
    .render()
    .props(CharacterSelect)
    .onSelect('graduate', 'new');
  expect(h.render().html).toContain(t('game.loading'));
  const error = new Error('Story chunk failed to load');
  reject(error);
  await entering;
  expect(() => h.render()).toThrow(error);
  h.dispose();
});
