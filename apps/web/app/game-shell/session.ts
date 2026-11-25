import type { Locale } from '@uk-immigration/engine';
import type { DayKind, Place } from '@uk-immigration/game/core';
import type { DayMemory } from './diary';
import type { GameCountry, GameKinds, GameModule, State } from './types';

export function visibleResidents<K extends GameKinds>(
  game: GameModule<K>,
  state: State<K>,
  interior: boolean,
) {
  return game
    .townsfolk(state)
    .filter((npc) => game.npcAt(state, npc.id) !== 'away')
    .filter((npc) => (game.npcAt(state, npc.id) === 'home') === interior)
    .slice(0, 12);
}

export const homeSpot = (index: number) =>
  [
    { x: 5, y: 4 },
    { x: 11, y: 4 },
    { x: 5, y: 8 },
  ][index % 3];

export function isPlaceOpen(
  state: { day: { minute: number; kind: DayKind } },
  place: Place,
): boolean {
  return (
    !place.hours ||
    (state.day.minute >= place.hours.opens &&
      state.day.minute < place.hours.closes &&
      (!place.hours.dayKinds || place.hours.dayKinds.includes(state.day.kind)))
  );
}

export interface GameSave<S> {
  state: S | undefined;
  available: boolean;
  diary?: DayMemory[];
  quarterStart?: Record<string, number>;
}

export function createSession<K extends GameKinds>(c: GameCountry<K>) {
  type S = State<K>;
  const { game } = c;
  const saveKey = (characterId: string) => c.storageKey(`v3:${characterId}`);

  function withGameLocale(state: S, locale: Locale): S {
    if (state.locale === locale) return state;
    return {
      ...state,
      locale,
      result: c.evaluate({ ...state, locale }),
    };
  }

  function endingMemories(state: S) {
    const friends = game
      .townsfolk(state)
      .filter(
        (npc) =>
          state.flags.includes(`talked-${npc.id}`) &&
          (state.friendship[npc.id] ?? 0) > 0,
      )
      .sort((a, b) => state.friendship[b.id] - state.friendship[a.id])
      .slice(0, 2);
    const furnishings = [
      {
        id: 'reading-chair',
        name: { zhCN: '阅读椅', en: 'Reading chair' },
        atlas: 'tiles.png',
        frame: 8,
        frames: 15,
      },
      {
        id: 'warm-curtains',
        name: { zhCN: '厚窗帘', en: 'Warm curtains' },
        atlas: 'home-details.svg',
        frame: 0,
        frames: 3,
      },
      {
        id: 'desk-lamp',
        name: { zhCN: '台灯', en: 'Desk lamp' },
        atlas: 'home-details.svg',
        frame: 2,
        frames: 3,
      },
    ]
      .filter((item) => state.flags.includes(`furnished-${item.id}`))
      .map((item) => ({
        ...item,
        name: c.furnishingNames?.[item.id] ?? item.name,
      }));
    // Harvest logs retain the crop's bilingual name, but no item ID.
    const crops = game.items.filter(
      (item) =>
        item.kind === 'crop' &&
        (state.plots.some(
          (plot) =>
            game.items.find((seed) => seed.id === plot.seed)?.grows?.crop ===
            item.id,
        ) ||
          state.log.some(
            (entry) =>
              entry.kind === 'action' &&
              entry.id === 'harvest' &&
              entry.text.en === item.name.en &&
              entry.text.zhCN === item.name.zhCN,
          )),
    );
    return {
      friends,
      furnishings,
      crops,
      dishes: (state.lifeRecords?.dishes ?? []).map((record) =>
        game.items.find((item) => item.id === record.itemId)!,
      ),
      flowerbed: state.flags.includes('flowerbed-open'),
      photo: state.flags.includes('community-lunch-photo-received'),
    };
  }

  function needsVisaReminder(state: S): boolean {
    const visa = c.visaStatus(state);
    return (
      !game.isOver(state) && !visa.renewed && !visa.pending && visa.months <= 6
    );
  }

  function visaExpiresThisSeason(state: S): boolean {
    const visa = c.visaStatus(state);
    const [year, month, day] = state.date.split('-').map(Number);
    const nextSeason = new Date(Date.UTC(year, month + 2, 1));
    const lastDay = new Date(Date.UTC(year, month + 3, 0)).getUTCDate();
    nextSeason.setUTCDate(Math.min(day, lastDay));
    // validTo already runs through adjoining renewals, so a renewal that also
    // ends this season still warns (review40-1 risk).
    return (
      !game.isOver(state) &&
      !visa.pending &&
      (!visa.validTo || visa.validTo < nextSeason.toISOString().slice(0, 10))
    );
  }

  // Event IDs can only be checked after the player selects the character.
  function hasKnownEvents(state: S): boolean {
    return (
      state.day.deliveries.every(({ eventId }) =>
        game.currentEvent({ ...state, pendingEvent: eventId }),
      ) &&
      state.eventQueue.every((id) =>
        game.currentEvent({ ...state, pendingEvent: id }),
      ) &&
      (state.pendingEvent === undefined || !!game.currentEvent(state))
    );
  }

  function previewGameSave(characterId: string): GameSave<S> {
    try {
      const saved = localStorage.getItem(saveKey(characterId));
      if (!saved) return { state: undefined, available: true };
      const {
        clientVersion,
        diary: savedDiary,
        quarterStart: savedStart,
        ...state
      }: S & {
        clientVersion?: number;
        diary?: DayMemory[];
        quarterStart?: S['stats'];
      } = JSON.parse(saved);
      // The earlier mock also used version 3; its saves are not real core saves.
      if (clientVersion !== 1) return { state: undefined, available: true };
      if (
        !state ||
        state.version !== 3 ||
        state.characterId !== characterId ||
        !game.characters.some((item) => item.id === characterId) ||
        !Number.isInteger(state.seed) ||
        !Number.isInteger(state.randomState) ||
        !Number.isInteger(state.year) ||
        state.year < 1 ||
        ![1, 2, 3, 4].includes(state.quarter) ||
        !Number.isInteger(state.dayNumber) ||
        state.dayNumber < 0 ||
        !state.day ||
        ![0, 1, 2].includes(state.day.index) ||
        !Number.isInteger(state.day.minute) ||
        state.day.minute < 420 ||
        state.day.minute > 1440 ||
        !['workday', 'weekend', 'special'].includes(state.day.kind) ||
        !['sunny', 'cloudy', 'rain', 'snow'].includes(state.day.weather) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(state.day.date) ||
        !state.inventory ||
        !state.friendship ||
        !Object.values(state.inventory).every(
          (n) => Number.isInteger(n) && n >= 0,
        ) ||
        !Object.values(state.friendship).every(
          (n) => Number.isFinite(n) && n >= 0 && n <= 1000,
        ) ||
        !Array.isArray(state.plots) ||
        !state.plots.every(
          (p) => p && Number.isFinite(p.growth) && p.growth >= 0,
        ) ||
        !Array.isArray(state.day.deliveries) ||
        !state.day.deliveries.every(
          (d) =>
            d && typeof d.channel === 'string' && typeof d.eventId === 'string',
        ) ||
        !['zh-CN', 'en'].includes(state.locale) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(state.date) ||
        !c.stats.every((key) => Number.isFinite(state.stats?.[key])) ||
        ![
          state.flags,
          state.firedEvents,
          state.achievements,
          state.eventQueue,
          state.heard,
          state.day.done,
          state.day.talked,
          state.day.gifted,
        ].every(
          (list) =>
            Array.isArray(list) &&
            list.every((item) => typeof item === 'string'),
        ) ||
        !Array.isArray(state.log) ||
        !state.log.every(
          (entry) =>
            entry &&
            typeof entry.text?.zhCN === 'string' &&
            typeof entry.text?.en === 'string',
        ) ||
        (state.pendingEvent !== undefined &&
          typeof state.pendingEvent !== 'string')
      )
        return { state: undefined, available: false };
      state.result = c.evaluate(state);
      const validDiary =
        Array.isArray(savedDiary) &&
        savedDiary.every(
          (m) =>
            m &&
            Number.isInteger(m.year) &&
            [1, 2, 3, 4].includes(m.quarter) &&
            [0, 1, 2].includes(m.day) &&
            typeof m.key === 'string' &&
            Number.isInteger(m.count) &&
            m.count > 0 &&
            typeof m.text?.zhCN === 'string' &&
            typeof m.text?.en === 'string' &&
            Object.values(m.statDeltas ?? {}).every(Number.isFinite),
        );
      return {
        state: state as S,
        available: true,
        diary: validDiary ? savedDiary : [],
        quarterStart:
          savedStart && c.stats.every((key) => Number.isFinite(savedStart[key]))
            ? savedStart
            : state.stats,
      };
    } catch {
      return { state: undefined, available: false };
    }
  }

  // Storage is the external input boundary. Failed saves never interrupt play.
  function gameStorage(
    characterId: string,
    next: S,
    diary: DayMemory[] = [],
    quarterStart?: S['stats'],
  ): GameSave<S> {
    try {
      localStorage.setItem(
        saveKey(characterId),
        JSON.stringify({ ...next, clientVersion: 1, diary, quarterStart }),
      );
      return { state: next, available: true };
    } catch {
      return { state: next, available: false };
    }
  }

  return {
    visibleResidents: (state: S, interior: boolean) =>
      visibleResidents(game, state, interior),
    homeSpot,
    isPlaceOpen,
    withGameLocale,
    statKeys: c.stats,
    endingMemories,
    visaStatus: c.visaStatus,
    needsVisaReminder,
    visaExpiresThisSeason,
    hasKnownEvents,
    previewGameSave,
    gameStorage,
  };
}
