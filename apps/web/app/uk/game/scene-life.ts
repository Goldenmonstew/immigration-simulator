import type { GameState, PlaceId } from '@uk-immigration/game';

// Pure helpers deciding what life scenery the town map shows.

export function lunchVisible(state: GameState, interior: boolean) {
  return (
    !interior &&
    state.quarter === 3 &&
    state.flags.includes('quarter-board-community-lunch') &&
    state.day.kind === 'weekend' &&
    state.day.minute >= 420 &&
    state.day.minute < 960
  );
}

export function flowerbedStage(flags: string[]) {
  return flags.includes('flowerbed-open')
    ? 3
    : flags.includes('flowerbed-planted')
      ? 2
      : flags.includes('flowerbed-marked')
        ? 1
        : 0;
}

export function mayDayScene(state: GameState) {
  if (state.day.festival === 'may-day')
    return {
      phase: 'festival' as const,
      venue: ['rain', 'snow'].includes(state.day.weather) ? 'council' : 'green',
    };
  if (state.quarter === 2 && state.day.index < 2)
    return { phase: 'preparation' as const, venue: 'council' };
  return undefined;
}

export function lifePlaceLabel(
  state: GameState,
  locale: 'zh-CN' | 'en',
  place: PlaceId,
) {
  const en = locale === 'en';
  if (place === 'allotment')
    return (
      en
        ? [
            '',
            'Community flowerbed · marked out',
            'Community flowerbed · planted',
            'Community flowerbed · open',
          ]
        : ['', '公共花坛 · 已标界', '公共花坛 · 已栽种', '公共花坛 · 已挂牌']
    )[flowerbedStage(state.flags)];
  const may = mayDayScene(state);
  if (may?.venue !== place) return undefined;
  const preparation =
    state.mayDay?.year === state.year ? state.mayDay.preparation : undefined;
  const contribution =
    preparation === 'ribbons'
      ? en
        ? ' · your ribbons'
        : ' · 你扎的彩带'
      : preparation === 'signs'
        ? en
          ? ' · your signs'
          : ' · 你画的路牌'
        : '';
  return (
    (may.phase === 'preparation'
      ? en
        ? 'May Day preparations · indoors'
        : '五月节准备 · 室内'
      : place === 'council'
        ? en
          ? 'May Day · indoors'
          : '五月节 · 室内'
        : en
          ? 'May Day'
          : '五月节') + contribution
  );
}
