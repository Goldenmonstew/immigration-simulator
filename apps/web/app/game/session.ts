import { evaluate, type Locale } from '@uk-immigration/engine';
import {
  characters,
  currentEvent,
  items,
  recipes,
  isOver,
  npcAt,
  townsfolk,
  visaMonthsLeft,
  type GameState,
  type Place,
  type StatKey,
} from '@uk-immigration/game';
import { createDraft, type Draft } from '../../lib/questionnaire';
import type { DayMemory } from './diary';

export function visibleResidents(state: GameState, interior: boolean) {
  return townsfolk(state)
    .filter((npc) => npcAt(state, npc.id) !== 'away')
    .filter((npc) => (npcAt(state, npc.id) === 'home') === interior)
    .slice(0, 12);
}

export const homeSpot = (index: number) =>
  [
    { x: 5, y: 4 },
    { x: 11, y: 4 },
    { x: 5, y: 8 },
  ][index % 3];

export function isPlaceOpen(state: GameState, place: Place): boolean {
  return (
    !place.hours ||
    (state.day.minute >= place.hours.opens &&
      state.day.minute < place.hours.closes &&
      (!place.hours.dayKinds || place.hours.dayKinds.includes(state.day.kind)))
  );
}

export function withGameLocale(state: GameState, locale: Locale): GameState {
  if (state.locale === locale) return state;
  return {
    ...state,
    locale,
    result: evaluate({
      simulationDate: state.date,
      timeline: state.timeline,
      locale,
    }),
  };
}

export const statKeys: StatKey[] = [
  'money',
  'mood',
  'health',
  'english',
  'career',
];
const residentIds = [
  'skilled-worker',
  'hong-kong-bno',
  'family-partner',
  'graduate',
  'margaret',
  'priya',
  'ade',
  'helen',
  'dave',
  'rahman',
  'lina',
  'gareth',
  'jamie',
  'ka-ning-partner',
  'ka-ning-child',
  'yao-flatmate',
  'maeve',
];
export const spritePath = (id: string) =>
  `/game/assets/urban/${residentIds.includes(id) ? id : 'skilled-worker'}.png`;
export const cropIds = [
  'potato',
  'strawberry',
  'tomato',
  'cucumber',
  'turnip',
  'corn',
  'sunflower',
  'tulip',
];
export const itemIcon = (id: string) => {
  if (id === 'community-lunch-photo')
    return '/game/assets/items/community-lunch-photo.svg';
  const crop = id.replace(/^seed-/, '');
  if (cropIds.includes(crop)) return `/game/assets/crops/${crop}.png`;
  if (['tea', 'biscuits', 'flowers', 'cake'].includes(id))
    return `/game/assets/items/${id}.png`;
  const item = items.find((item) => item.id === id);
  if (item?.kind === 'fish') return `/game/assets/meadow-town/fish/${id}.svg`;
  if (recipes.some((recipe) => recipe.makes === id))
    return `/game/assets/meadow-town/dishes/${id}.svg`;
  if (item?.kind === 'food') return '/game/assets/items/meal.png';
  return '/game/assets/indoor/item.png';
};

export function endingMemories(state: GameState) {
  const friends = townsfolk(state)
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
  ].filter((item) => state.flags.includes(`furnished-${item.id}`));
  // Harvest logs retain the crop's bilingual name, but no item ID.
  const crops = items.filter(
    (item) =>
      item.kind === 'crop' &&
      (state.plots.some(
        (plot) =>
          items.find((seed) => seed.id === plot.seed)?.grows?.crop === item.id,
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
      items.find((item) => item.id === record.itemId)!,
    ),
    flowerbed: state.flags.includes('flowerbed-open'),
    photo: state.flags.includes('community-lunch-photo-received'),
  };
}
export const visaMonths = (state: GameState) =>
  Math.floor(visaMonthsLeft(state));

export function visaStatus(state: GameState) {
  const active = state.timeline.episodes
    .filter(
      (episode) =>
        episode.validFrom <= state.date && episode.validTo >= state.date,
    )
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0];
  if (!active) return { months: 0, renewed: false, validTo: undefined };
  let validTo = active.validTo;
  for (const episode of [...state.timeline.episodes].sort((a, b) =>
    a.validFrom.localeCompare(b.validFrom),
  )) {
    if (
      Date.parse(episode.validFrom) <= Date.parse(validTo) + 86_400_000 &&
      episode.validTo > validTo
    )
      validTo = episode.validTo;
  }
  return {
    validTo,
    renewed: validTo > active.validTo,
    months: visaMonthsLeft({
      ...state,
      timeline: { ...state.timeline, episodes: [{ ...active, validTo }] },
    }),
  };
}

export function needsVisaReminder(state: GameState): boolean {
  const visa = visaStatus(state);
  return !isOver(state) && !visa.renewed && visa.months <= 6;
}

export function visaExpiresThisSeason(state: GameState): boolean {
  const visa = visaStatus(state);
  const [year, month, day] = state.date.split('-').map(Number);
  const nextSeason = new Date(Date.UTC(year, month + 2, 1));
  const lastDay = new Date(Date.UTC(year, month + 3, 0)).getUTCDate();
  nextSeason.setUTCDate(Math.min(day, lastDay));
  return (
    !isOver(state) &&
    !visa.renewed &&
    (!visa.validTo || visa.validTo < nextSeason.toISOString().slice(0, 10))
  );
}

export interface GameSave {
  state: GameState | undefined;
  available: boolean;
  diary?: DayMemory[];
  quarterStart?: GameState['stats'];
}

const saveKey = (characterId: string) =>
  `uk-immigration-life-v3:${characterId}`;

// Event IDs can only be checked after the player selects the character.
export function hasKnownEvents(state: GameState): boolean {
  return (
    state.day.deliveries.every(({ eventId }) =>
      currentEvent({ ...state, pendingEvent: eventId }),
    ) &&
    state.eventQueue.every((id) =>
      currentEvent({ ...state, pendingEvent: id }),
    ) &&
    (state.pendingEvent === undefined || !!currentEvent(state))
  );
}

export function previewGameSave(characterId: string): GameSave {
  try {
    const saved = localStorage.getItem(saveKey(characterId));
    if (!saved) return { state: undefined, available: true };
    const {
      clientVersion,
      diary: savedDiary,
      quarterStart: savedStart,
      ...state
    }: GameState & {
      clientVersion?: number;
      diary?: DayMemory[];
      quarterStart?: GameState['stats'];
    } = JSON.parse(saved);
    // The earlier mock also used version 3; its saves are not real core saves.
    if (clientVersion !== 1) return { state: undefined, available: true };
    if (
      !state ||
      state.version !== 3 ||
      state.characterId !== characterId ||
      !characters.some((item) => item.id === characterId) ||
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
      !statKeys.every((key) => Number.isFinite(state.stats?.[key])) ||
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
          Array.isArray(list) && list.every((item) => typeof item === 'string'),
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
    state.result = evaluate({
      simulationDate: state.date,
      timeline: state.timeline,
      locale: state.locale,
    });
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
      state,
      available: true,
      diary: validDiary ? savedDiary : [],
      quarterStart:
        savedStart && statKeys.every((key) => Number.isFinite(savedStart[key]))
          ? savedStart
          : state.stats,
    };
  } catch {
    return { state: undefined, available: false };
  }
}

// Storage is the external input boundary. Failed saves never interrupt play.
export function gameStorage(
  characterId: string,
  next?: GameState,
  diary: DayMemory[] = [],
  quarterStart?: GameState['stats'],
): GameSave {
  if (!next) {
    const saved = previewGameSave(characterId);
    return saved.state && !hasKnownEvents(saved.state)
      ? { state: undefined, available: false }
      : saved;
  }
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

export function gameDraft(state: GameState): Draft {
  return {
    ...createDraft(),
    timeline: state.timeline,
    simulationDate: state.date,
    completed: true,
    screening: {
      criminality: state.timeline.criminalRecord.length ? 'yes' : 'no',
      breach: state.timeline.immigrationBreaches.length ? 'yes' : 'no',
      debt: state.timeline.governmentDebt?.outstanding ? 'yes' : 'no',
    },
  };
}
