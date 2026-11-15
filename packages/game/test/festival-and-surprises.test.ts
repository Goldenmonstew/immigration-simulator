import { describe, expect, test } from 'vitest';
import {
  activities,
  approachSurprise,
  currentEvent,
  doActivity,
  enter,
  fastForward,
  mapSurprises,
  newGame,
  readMail,
  resolve,
  sleep,
  tick,
} from '../src';
import type { GameState, PlaceId, SurpriseId } from '../src';
import { surpriseEvents } from '../src/map-surprises';
import { clear, completeQuarter, quarter } from './helpers';

const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));
const at = (state: GameState, place: PlaceId, minute = 600) =>
  enter(tick(state, Math.max(0, minute - state.day.minute)), place);
const menu = (state: GameState, place: PlaceId) =>
  activities(state, place)
    .map((action) => action.id)
    .filter((id) => id.startsWith('may-'));
function spring() {
  const state = clear(newGame('skilled-worker', 1));
  state.timeline.episodes[0].validTo = '2040-01-01';
  return clear(quarter(state));
}
const festivalDay = (state: GameState) => clear(sleep(clear(sleep(state))));

describe('12.10 May Day preparation, participation and return', () => {
  for (const preparation of ['ribbons', 'signs'] as const)
    for (const participation of ['may-ribbons', 'may-guide'] as const)
      test.each(['sunny', 'rain', 'snow'] as const)(
        `${preparation}, ${participation}, %s: three stages survive JSON and recall only this branch`,
        (weather) => {
          const before = at(spring(), 'council');
          before.stats.money = 0;
          expect(before.quarter).toBe(2);
          expect(menu(before, 'council')).toEqual([
            'may-prepare-ribbons',
            'may-prepare-signs',
          ]);
          const prepared = doActivity(before, `may-prepare-${preparation}`);
          expect(before.mayDay).toBeUndefined();
          expect(prepared.mayDay).toEqual({ year: 1, preparation });
          expect(prepared.stats.money).toBe(0);
          expect(prepared.day.minute).toBe(before.day.minute + 30);
          expect(menu(prepared, 'council')).toEqual([]);
          const day = festivalDay(restore(prepared));
          expect(day.day.festival).toBe('may-day');
          day.day.weather = weather;
          const place = weather === 'sunny' ? 'green' : 'council';
          const ready = at(day, place);
          expect(menu(ready, place)).toEqual(['may-guide', 'may-ribbons']);
          expect(menu(ready, place === 'green' ? 'council' : 'green')).toEqual(
            [],
          );
          const after = doActivity(ready, participation);
          expect(after.outcome?.text?.zhCN).toContain(
            preparation === 'ribbons' ? '你扎的彩带' : '你画的路牌',
          );
          expect(after.mayDay).toMatchObject({
            preparation,
            participation: participation === 'may-ribbons' ? 'dance' : 'guide',
            participationDay: day.dayNumber,
            indoors: weather !== 'sunny',
          });
          expect(after.flags).toContain('visited-festival:may-day');
          expect(after.timeline).toEqual(ready.timeline);
          expect(after.stats.money).toBe(0);
          if (weather !== 'sunny')
            expect(after.outcome?.text?.zhCN).toContain('市政厅');
          expect(menu(after, place)).toEqual([]);
          expect(() => doActivity(restore(after), participation)).toThrow(
            'not available',
          );
          // Isolate quarterly finances from the zero-cash participation assertion.
          after.stats.money = 10000;
          const nextSeason = at(clear(quarter(restore(after))), 'council');
          expect(nextSeason.quarter).toBe(3);
          expect(menu(nextSeason, 'council')).toContain('may-followup');
          const recalled = doActivity(nextSeason, 'may-followup');
          expect(recalled.mayDay?.followupSeen).toBe(true);
          expect(recalled.outcome?.text?.zhCN).toContain(
            preparation === 'ribbons' ? '自己扎的彩带' : '自己画的路牌',
          );
          expect(recalled.outcome?.text?.zhCN).not.toContain(
            preparation === 'ribbons' ? '自己画的路牌' : '自己扎的彩带',
          );
          expect(menu(restore(recalled), 'council')).not.toContain(
            'may-followup',
          );
        },
      );

  test('preparation is available on either preceding day, closes on the festival, and resets next year', () => {
    const weekend = clear(sleep(spring()));
    expect(weekend.day.index).toBe(1);
    const prepared = doActivity(at(weekend, 'council'), 'may-prepare-signs');
    const day = clear(sleep(prepared));
    expect(day.day.festival).toBe('may-day');
    expect(menu(at(day, 'council'), 'council')).not.toContain(
      'may-prepare-ribbons',
    );
    let next = clear(quarter(day));
    while (!(next.quarter === 2 && next.year === 2))
      next = clear(quarter(next));
    // Skipping every routine lowers mood; isolate the yearly preparation menu.
    next.stats.mood = 70;
    expect(menu(at(next, 'council'), 'council')).toContain(
      'may-prepare-ribbons',
    );
    expect(
      doActivity(at(next, 'council'), 'may-prepare-ribbons').mayDay,
    ).toEqual({ year: 2, preparation: 'ribbons' });
  });

  test.each([false, true])(
    'missing May Day (prepared: %s) does not manufacture participation or a return',
    (prepared) => {
      let before = spring();
      if (prepared)
        before = doActivity(at(before, 'council'), 'may-prepare-ribbons');
      const after = completeQuarter(before);
      expect(after.quarter).toBe(3);
      expect(after.ending).toBeUndefined();
      expect(after.mayDay?.participation).toBeUndefined();
      expect(menu(at(after, 'council'), 'council')).not.toContain(
        'may-followup',
      );
      expect(
        after.log.some(
          (entry) => entry.id === 'may-ribbons' || entry.id === 'may-guide',
        ),
      ).toBe(false);
    },
  );

  test.each(['may-ribbons', 'may-guide'])(
    '%s welcomes an unprepared player and recalls no invented contribution',
    (id) => {
      const before = at(festivalDay(spring()), 'green');
      before.day.weather = 'sunny';
      const after = doActivity(before, id);
      expect(after.mayDay?.preparation).toBeUndefined();
      expect(after.outcome?.text?.zhCN).not.toMatch(/你扎的|你画的/);
      const returnVisit = doActivity(
        at(clear(quarter(after)), 'council'),
        'may-followup',
      );
      expect(returnVisit.outcome?.text?.zhCN).toContain('收回的篮子');
    },
  );

  test.each(['sunny', 'rain'] as const)(
    'both prepared branches rotate across three years in %s weather with short bilingual text',
    (weather) => {
      for (const preparation of ['ribbons', 'signs'] as const)
        for (const id of ['may-ribbons', 'may-guide']) {
          const results = [1, 2, 3].map((year) => {
            const before = festivalDay(spring());
            before.year = year;
            before.day.weather = weather;
            before.mayDay = { year, preparation };
            const after = doActivity(
              at(before, weather === 'rain' ? 'council' : 'green'),
              id,
            );
            expect(after.outcome?.text?.zhCN.length).toBeLessThanOrEqual(60);
            expect(after.outcome?.text?.en).toContain('You');
            expect(after.outcome?.text?.zhCN).not.toMatch(
              /林遥|陈嘉宁|嘉宁|索菲娅/,
            );
            return after.outcome!.text!.zhCN;
          });
          expect(new Set(results).size).toBe(3);
        }
    },
  );
});

function encounter(id: SurpriseId, seed = 4) {
  let state = clear(newGame('skilled-worker', seed));
  state.timeline.episodes[0].validTo = '2040-01-01';
  for (let day = 0; day < 9; day++) {
    state = tick(state, 600 - state.day.minute);
    const clue = mapSurprises(state).find(
      (entry) => entry.id === id && entry.phase === 'clue',
    );
    if (clue) return { state, clue };
    state = clear(sleep(state));
  }
  throw new Error(`Missing map clue: ${id}`);
}

describe('12.10 map surprises', () => {
  const ids: SurpriseId[] = ['biscuit-cat', 'swap-box', 'lost-mitten'];
  test('each seed gets exactly three one-day clues; querying and drawing them leaves the random cursor and state intact', () => {
    const schedules = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const state = clear(newGame('skilled-worker', seed));
      const schedule = [];
      for (let day = 0; day < 12; day++) {
        state.dayNumber = day;
        state.day.minute = 600;
        const before = restore(state);
        const clues = mapSurprises(state);
        expect(mapSurprises(restore(state))).toEqual(clues);
        expect(state).toEqual(before);
        schedule.push(...clues.map((clue) => ({ id: clue.id, day })));
      }
      expect(schedule.map((entry) => entry.id)).toEqual(ids);
      for (const [index, entry] of schedule.entries()) {
        expect(entry.day).toBeGreaterThanOrEqual(index * 3);
        expect(entry.day).toBeLessThan(index * 3 + 3);
      }
      schedules.add(JSON.stringify(schedule));
    }
    expect(schedules.size).toBeGreaterThan(1);
  });

  for (const id of ids) {
    test(`${id} appears before approach, opens only at its own anchor, and expires without delivery`, () => {
      const { state, clue } = encounter(id);
      expect(clue.expiresMinute).toBe(1080);
      expect(currentEvent(state)).toBeUndefined();
      expect(currentEvent(readMail(enter(state, 'shop')))).toBeUndefined();
      expect(approachSurprise(state, 'home-street')).toBe(state);
      const beforeWindow = restore(state);
      beforeWindow.day.minute = 539;
      expect(mapSurprises(beforeWindow)).toEqual([]);
      expect(approachSurprise(beforeWindow, clue.anchor)).toBe(beforeWindow);
      const opens = tick(beforeWindow, 1);
      expect(mapSurprises(opens)).toContainEqual(clue);
      const last = tick(state, 1079 - state.day.minute);
      expect(mapSurprises(last)).toContainEqual(clue);
      const expired = tick(last, 1);
      expect(mapSurprises(expired)).toEqual([]);
      expect(approachSurprise(expired, clue.anchor)).toBe(expired);
      const nextDay = clear(sleep(expired));
      expect(
        mapSurprises(tick(nextDay, 600 - nextDay.day.minute)).some(
          (entry) => entry.id === id,
        ),
      ).toBe(false);
      expect(nextDay.firedEvents).not.toContain(`surprise-${id}`);
      expect(nextDay.surpriseRecords).toBeUndefined();
      expect(
        nextDay.day.deliveries.some(
          (entry) => entry.eventId === `surprise-${id}`,
        ),
      ).toBe(false);
      expect(
        approachSurprise(
          { ...state, trip: { from: state.date, to: '2026-01-01' } },
          clue.anchor,
        ).pendingEvent,
      ).toBeUndefined();
      expect(mapSurprises({ ...state, ending: 'left' })).toEqual([]);
    });

    const event = surpriseEvents.find(
      (entry) => entry.id === `surprise-${id}`,
    )!;
    for (const choice of event.choices)
      test(`${id}/${choice.id} has its own ending and persistent trace, and cannot be claimed twice after JSON`, () => {
        const { state, clue } = encounter(id);
        const before = restore(state);
        const pending = approachSurprise(state, clue.anchor);
        expect(state).toEqual(before);
        expect(currentEvent(pending)?.id).toBe(event.id);
        expect(
          pending.firedEvents.filter((entry) => entry === event.id),
        ).toHaveLength(1);
        expect(approachSurprise(pending, clue.anchor)).toBe(pending);
        expect(currentEvent(restore(pending))?.id).toBe(event.id);
        const after = resolve(restore(pending), choice.id);
        expect(after.timeline).toEqual(state.timeline);
        expect(after.randomState).toBe(state.randomState);
        expect(after.surpriseRecords).toEqual([
          { id, choiceId: choice.id, dayNumber: state.dayNumber },
        ]);
        expect(after.log.at(-1)?.text).toEqual(after.outcome?.text);
        expect(after.outcome?.text?.zhCN.length).toBeLessThanOrEqual(60);
        expect(after.outcome?.text?.en).toContain('You');
        expect(after.outcome?.text).not.toEqual(event.text);
        const traces = mapSurprises(after).filter((entry) => entry.id === id);
        expect(traces).toHaveLength(1);
        expect(traces[0]).toMatchObject({
          phase: 'trace',
          anchor: clue.anchor,
        });
        expect(traces[0].text.zhCN.length).toBeGreaterThan(0);
        expect(approachSurprise(restore(after), clue.anchor)).toEqual(after);
        expect(() => resolve(restore(after), choice.id)).toThrow(
          'not available',
        );
        expect(mapSurprises(clear(sleep(restore(after))))).toContainEqual(
          traces[0],
        );
        if (id === 'swap-box')
          expect(after.inventory['swap-pot'] ?? 0).toBe(
            choice.id === 'pot' ? 1 : 0,
          );
        else expect(after.stats.mood).toBe(Math.min(100, state.stats.mood + 2));
        const other = resolve(
          pending,
          event.choices.find((entry) => entry.id !== choice.id)!.id,
        );
        expect(other.outcome?.text).not.toEqual(after.outcome?.text);
        expect(mapSurprises(other)[0].text).not.toEqual(traces[0].text);
      });
  }

  test('old v3 saves need no migration, missed scenes do not return next year, and fast-forward does not collect clues', () => {
    const { state, clue } = encounter('swap-box');
    delete state.mayDay;
    delete state.surpriseRecords;
    const after = resolve(approachSurprise(restore(state), clue.anchor), 'pot');
    expect(after.version).toBe(3);
    expect(after.inventory['swap-pot']).toBe(1);
    expect(after.surpriseRecords).toHaveLength(1);
    const future = restore(state);
    future.year++;
    future.dayNumber += 12;
    expect(mapSurprises(future)).toEqual([]);
    const skipped = clear(fastForward(state));
    expect(skipped.surpriseRecords).toBeUndefined();
    expect(skipped.inventory['swap-pot']).toBeUndefined();
  });
});
