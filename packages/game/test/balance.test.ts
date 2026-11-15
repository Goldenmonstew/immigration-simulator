import { notices } from '../src/festivals';
import { describe, expect, test } from 'vitest';
import {
  activities,
  buy,
  characters,
  cook,
  currentEvent,
  doActivity,
  eat,
  enter,
  fastForward,
  fish,
  gift,
  harvest,
  isOver,
  newGame,
  npcAt,
  peopleAt,
  npcs,
  plant,
  recipes,
  resolve,
  shop,
  sleep,
  talk,
  tick,
  visaMonthsLeft,
  water,
  townsfolk,
} from '../src';
import type { GameEvent, GameState, PlaceId, StatKey } from '../src';
import { balance as b } from '../src/balance';
import { heartEvents } from '../src/npcs';
import { commonEvents } from '../src/events/common';
import { characterLifeEvents, lifeEvents } from '../src/events/life';
import { lifeChains } from '../src/events/life-chains';
import { policyStories } from '../src/events/policy';
import { beforeTimeEconomy } from './time-and-economy-baseline';

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length
    ? (sorted[Math.floor((sorted.length - 1) / 2)] +
        sorted[Math.floor(sorted.length / 2)]) /
        2
    : null;
};
function play(
  character: string,
  seed: number,
  strategy: 'fast-forward' | 'active' | 'casual',
) {
  const active = strategy !== 'fast-forward';
  let state = newGame(character, seed);
  let cursor = seed | 0;
  const pick = (n: number) => {
    cursor = (Math.imul(cursor, 1664525) + 1013904223) | 0;
    return (cursor >>> 0) % n;
  };
  let fifth: GameState['stats'] | undefined;
  const quarterSamples: GameState['stats'][] = [];
  let recorded = 0;
  let listenedLines = 0;
  let chineseCharacters = 0;
  const readEvents = new Map<string, GameEvent>();
  const readNotices = new Set<string>();
  const peakFriendship: Record<string, number> = {};
  const playedDays = new Set<number>();
  const record = () => {
    for (const [npc, points] of Object.entries(state.friendship))
      peakFriendship[npc] = Math.max(peakFriendship[npc] ?? 0, points);
    const quarters = state.log.filter((e) => e.kind === 'quarter').length;
    if (quarters > recorded) {
      quarterSamples.push({ ...state.stats });
      recorded = quarters;
      if (quarters === 20) fifth = { ...state.stats };
    }
  };
  const drain = () => {
    for (let i = 0; currentEvent(state); i++) {
      if (i > 40) throw new Error('Unexpected event loop');
      const event = currentEvent(state)!;
      readEvents.set(event.id, event);
      const choices = event.choices.filter(
        (c) =>
          !c.effects.some((e) => e.type === 'criminal' || e.type === 'ending'),
      );
      const news =
        event.id.startsWith('news-') ||
        event.id === 'sw-settlement-window-letter';
      state = resolve(state, choices[news ? 0 : pick(choices.length)].id);
      record();
    }
    record();
  };
  const visit = (place: PlaceId, minute = 480) => {
    if (state.day.minute < minute) {
      state = tick(state, minute - state.day.minute);
      drain();
    }
    state = enter(state, place);
    drain();
  };
  const activity = (id: string, place: PlaceId, minute = 480) => {
    visit(place, minute);
    if (activities(state, place).some((a) => a.id === id)) {
      state = doActivity(state, id);
      if (id === 'board')
        for (const notice of notices)
          if (state.flags.includes(`quarter-board-${notice.id}`))
            readNotices.add(notice.id);
      record();
      drain();
      if (
        strategy === 'active' &&
        id === 'bench' &&
        state.stats.money >=
          b.lifestyleReserve[state.characterId] + b.housingRent + b.clubFee &&
        activities(state, 'bench').some((a) => a.id === 'walking-club')
      ) {
        state = doActivity(state, 'walking-club');
        drain();
      }
    }
  };
  for (let iteration = 0; !isOver(state); iteration++) {
    if (iteration > 2000) throw new Error('Unexpected play loop');
    drain();
    if (visaMonthsLeft(state) <= b.renewalWindowMonths)
      activity('extend', 'visa');
    if (isOver(state)) break;
    if (!active) {
      state = fastForward(state);
      record();
      continue;
    }
    const day = state.dayNumber;
    if (strategy === 'casual') {
      const stops = [
        ['home', ['home-street']],
        ['shop', ['high-street-west', 'high-street-east']],
        ['cafe', []],
        ['work', []],
        ['gp', []],
        ['library', ['library-steps']],
        ['allotment', ['allotment-gate', 'allotment-plots']],
        ['pond', ['park-pond']],
        ['bench', ['park-bench', 'park-path']],
        ['green', ['green-centre', 'green-stall']],
        ['station', ['station-front', 'bus-stop']],
        ['college', ['college-steps']],
        ['pub', ['pub-garden']],
        ['board', ['postbox']],
      ] as const;
      const visits = 4 + pick(3);
      const route = [...stops];
      // Walk a random route without targeting any person's friendship level.
      for (
        let step = 0;
        step < visits && state.dayNumber === day && !isOver(state);
        step++
      ) {
        const index = pick(route.length);
        const [place, anchors] = route.splice(index, 1)[0];
        visit(place, 540 + step * 120);
        if (state.dayNumber !== day || isOver(state)) break;
        if (
          place === 'shop' &&
          pick(3) === 0 &&
          state.stats.money > 100 &&
          shop(state, 'shop').some((item) => item.id === 'tea')
        ) {
          state = buy(state, 'tea', 1);
          drain();
        }
        const encountered = townsfolk(state).filter(
          (person) =>
            peopleAt(state, place).includes(person.id) ||
            (anchors as readonly string[]).includes(npcAt(state, person.id)),
        );
        for (const person of encountered) {
          if (state.dayNumber !== day || isOver(state)) break;
          if (state.day.minute + b.minutes.talk > b.midnight) break;
          if (
            !peopleAt(state, place).includes(person.id) &&
            !(anchors as readonly string[]).includes(npcAt(state, person.id))
          )
            continue;
          if (state.day.talked.includes(person.id)) continue;
          state = talk(state, person.id);
          if (state.outcome?.kind === 'talk' && state.outcome.text) {
            listenedLines++;
            chineseCharacters +=
              state.outcome.text.zhCN.match(/\p{Script=Han}/gu)?.length ?? 0;
          }
          drain();
          if (
            state.dayNumber === day &&
            !isOver(state) &&
            state.inventory.tea > 0 &&
            pick(6) === 0 &&
            state.day.minute + b.minutes.gift <= b.midnight &&
            npcAt(state, person.id) !== 'away' &&
            !state.day.gifted.includes(person.id)
          ) {
            state = gift(state, person.id, 'tea');
            drain();
          }
        }
      }
      if (state.dayNumber === day && !isOver(state)) state = sleep(state);
      record();
      continue;
    }
    if (playedDays.has(day)) {
      state = sleep(state);
      record();
      continue;
    }
    playedDays.add(day);
    if (state.day.kind === 'workday') {
      visit('gp', 540);
      activity('work', 'work', 540);
    }
    const count = 3 + pick(2);
    for (
      let step = state.day.kind === 'workday' ? 1 : 0;
      step < count && state.dayNumber === day && !isOver(state);
      step++
    ) {
      const choices = [
        ['rest', 'home'],
        ['nap', 'home'],
        ['class', 'college'],
        ['study-home', 'home'],
        ['study-library', 'library'],
        ['gp', 'gp'],
        ['relax', 'pub'],
        ['coffee', 'cafe'],
        ['bench', 'bench'],
        ['board', 'board'],
        ['assessment', 'council'],
        ['visit', 'station'],
        ['visit', 'green'],
      ] as const;
      if (pick(4) === 0) {
        visit('pond');
        state = fish(state, pick(4) !== 0);
        drain();
      } else {
        const [id, place] = choices[pick(choices.length)];
        activity(id, place, place === 'pub' ? 720 : 540);
      }
    }
    if (state.dayNumber !== day || isOver(state)) {
      record();
      continue;
    }
    if (state.day.minute > 1200) {
      state = sleep(state);
      record();
      continue;
    }
    // A small everyday loop exercises gifts, crops and recipes alongside the
    // three/four main activities, rather than silently making legal decisions.
    const present = () =>
      townsfolk(state).filter((person) => npcAt(state, person.id) !== 'away');
    const offset = pick(present().length);
    for (
      let chat = 0;
      chat < 5 && state.dayNumber === day && !isOver(state);
      chat++
    ) {
      const people = present();
      const person = people[(offset + chat) % people.length];
      state = talk(state, person.id);
      if (state.outcome?.kind === 'talk' && state.outcome.text) {
        listenedLines++;
        chineseCharacters +=
          state.outcome.text.zhCN.match(/\p{Script=Han}/gu)?.length ?? 0;
      }
      drain();
    }
    const people = present();
    const npc = people[offset % people.length];
    if (state.dayNumber !== day || isOver(state)) {
      record();
      continue;
    }
    visit('shop');
    if (
      state.stats.money > 100 &&
      shop(state, 'shop').some((i) => i.id === 'tea')
    ) {
      state = buy(state, 'tea', 1);
      drain();
      if (
        townsfolk(state).some((person) => person.id === npc.id) &&
        npcAt(state, npc.id) !== 'away' &&
        !state.day.gifted.includes(npc.id) &&
        state.inventory.tea > 0
      ) {
        state = gift(state, npc.id, 'tea');
        drain();
      }
      const seeds = shop(state, 'shop').filter((i) => i.kind === 'seed');
      if (seeds.length) {
        state = buy(state, seeds[pick(seeds.length)].id, 1);
        drain();
      }
    }
    for (const action of activities(state, 'shop').filter((action) =>
      action.id.startsWith('furnish-'),
    )) {
      const price = b.furnishings[action.id.slice(8)].price;
      if (
        state.stats.money >=
          b.lifestyleReserve[state.characterId] + b.housingRent + price &&
        state.day.minute + b.minutes.buy <= 1200
      ) {
        state = doActivity(state, action.id);
        drain();
      }
    }
    if (state.dayNumber !== day || isOver(state)) {
      record();
      continue;
    }
    visit('allotment');
    if (!state.plots.length) activity('rent-plot', 'allotment');
    for (
      let index = 0;
      index < state.plots.length && state.dayNumber === day && !isOver(state);
      index++
    ) {
      const plot = state.plots[index];
      if (plot.seed && plot.growth >= b.cropDays) {
        state = harvest(state, index);
        drain();
      } else if (plot.seed && plot.wateredOn !== state.dayNumber) {
        state = water(state, index);
        drain();
      } else if (!plot.seed) {
        const seed = shop(
          { ...state, day: { ...state.day, minute: 600 } },
          'shop',
        ).find((item) => item.grows && state.inventory[item.id] > 0);
        if (seed) {
          state = plant(state, index, seed.id);
          drain();
        }
      }
    }
    if (state.dayNumber !== day || isOver(state)) {
      record();
      continue;
    }
    visit('home');
    if (activities(state, 'home').some((a) => a.id === 'rent-brighter-home')) {
      state = doActivity(state, 'rent-brighter-home');
      drain();
    }
    const recipe = recipes.find((r) =>
      Object.entries(r.needs).every(
        ([item, qty]) => state.inventory[item] >= qty,
      ),
    );
    if (recipe && state.day.minute + recipe.minutes <= b.midnight) {
      state = cook(state, recipe.id);
      drain();
    }
    if (
      recipe &&
      state.inventory[recipe.makes] &&
      state.day.minute + b.minutes.eat <= b.midnight &&
      state.dayNumber === day &&
      !isOver(state)
    ) {
      state = eat(state, recipe.makes);
      drain();
    }
    if (state.dayNumber === day && !isOver(state)) state = sleep(state);
    record();
    expect(state.day.minute).toBeLessThanOrEqual(1440);
    expect(state.timeline.absences.every((a) => a.to <= state.date)).toBe(true);
  }
  record();
  const lines = npcs
    .flatMap((npc) => npc.lines)
    .filter((line) => state.heard.includes(line.id));
  const seenText = new Set<string>();
  const countText = (parts: string[]) =>
    parts.reduce((sum, text) => {
      if (seenText.has(text)) return sum;
      seenText.add(text);
      return sum + (text.match(/\p{Script=Han}/gu)?.length ?? 0);
    }, 0);
  const eventText = (events: GameEvent[]) =>
    countText(
      events.flatMap((event) => [
        event.title.zhCN,
        ...event.text.zhCN.split('\n'),
      ]),
    );
  const content = {
    dialogue: countText(lines.map((line) => line.text.zhCN)),
    events: eventText([...readEvents.values()].filter((event) => !event.heart)),
    hearts: eventText([...readEvents.values()].filter((event) => event.heart)),
    notices: countText(
      notices
        .filter((notice) => readNotices.has(notice.id))
        .map((notice) => notice.text.zhCN),
    ),
  };
  return {
    state,
    content,
    totalContent: Object.values(content).reduce((sum, count) => sum + count, 0),
    eventCards: [...readEvents.values()].filter((event) => !event.heart).length,
    noticeCount: readNotices.size,
    fifth,
    quarterSamples,
    debtEvents: state.log.filter(
      (e) => e.kind === 'event' && e.id === 'system-debt',
    ).length,
    negativeQuarters: quarterSamples.filter((s) => s.money < 0).length,
    heard: listenedLines,
    uniqueLines: lines.length,
    words: chineseCharacters,
    uniqueWords: lines.reduce(
      (sum, line) =>
        sum + (line.text.zhCN.match(/\p{Script=Han}/gu)?.length ?? 0),
      0,
    ),
    heartScenes: Object.fromEntries(
      [2, 4, 6, 8, 10].map((threshold) => [
        threshold,
        heartEvents.filter(
          (event) =>
            event.heart!.hearts === threshold &&
            state.firedEvents.includes(event.id),
        ).length,
      ]),
    ),
    peakFriendship,
  };
}

describe('v3 seeded strategies', () => {
  for (const character of characters) {
    for (const strategy of ['fast-forward', 'active', 'casual'] as const) {
      test(`${character.id}: 20 seeds, ${strategy}`, () => {
        const started = performance.now();
        const active = strategy === 'active';
        const summary = [];
        {
          const runs = Array.from({ length: 20 }, (_, index) =>
            play(character.id, index + 1, strategy),
          );
          console.log(
            'RUNS_V11_2',
            JSON.stringify({
              character: character.id,
              strategy,
              runs: runs.map((run) => ({
                eventCards: run.eventCards,
                lifeChainCards: run.state.log.filter((entry) =>
                  lifeChains[character.id].some(
                    (event) => event.id === entry.id,
                  ),
                ).length,
                debtEvents: run.debtEvents,
                negativeQuarters: run.negativeQuarters,
                ending: run.state.ending,
                quarters: run.quarterSamples.length,
                fifth: run.fifth,
                tenth: run.quarterSamples[39],
              })),
            }),
          );
          const fifth = runs.flatMap((run) => (run.fifth ? [run.fifth] : []));
          const tenth = runs
            .filter(
              (run) =>
                run.state.log.filter((e) => e.kind === 'quarter').length === 40,
            )
            .map((run) => run.state.stats);
          const medians = (stats: GameState['stats'][]) =>
            Object.fromEntries(
              (
                ['money', 'mood', 'health', 'english', 'career'] as StatKey[]
              ).map((key) => [key, median(stats.map((s) => s[key]))]),
            );

          if (strategy === 'fast-forward') {
            const withChains = character.events;
            let beforeChains;
            try {
              character.events = withChains.filter(
                (event) => !lifeChains[character.id].includes(event),
              );
              beforeChains = Array.from({ length: 20 }, (_, index) =>
                play(character.id, index + 1, strategy),
              );
            } finally {
              character.events = withChains;
            }
            const actualAnnualRate = (samples: typeof runs) =>
              samples.reduce(
                (sum, run) =>
                  sum +
                  (run.state.log.filter(
                    (entry) =>
                      entry.kind === 'event' &&
                      !heartEvents.some((event) => event.id === entry.id),
                  ).length *
                    b.quartersPerYear) /
                    run.quarterSamples.length,
                0,
              ) / samples.length;
            expect(actualAnnualRate(runs)).toBeGreaterThanOrEqual(
              actualAnnualRate(beforeChains),
            );
            console.log(
              'LIFE_CHAIN_EVENT_RATE',
              JSON.stringify({
                character: character.id,
                before: actualAnnualRate(beforeChains),
                after: actualAnnualRate(runs),
                seeds: runs.length,
                chainCards: runs.reduce(
                  (sum, run) =>
                    sum +
                    run.state.log.filter((entry) =>
                      lifeChains[character.id].some(
                        (event) => event.id === entry.id,
                      ),
                    ).length,
                  0,
                ),
              }),
            );
            // Paired 12.4 comparison: same seeds and routine, removing only the
            // added cards for the baseline. The unchanged scheduler and public
            // API run both campaigns; no prerequisites are injected.
            const savedCommon = [...commonEvents];
            const savedCharacter = character.events;
            const savedPolicy = [...policyStories];
            let baseline;
            try {
              commonEvents.splice(
                0,
                commonEvents.length,
                ...commonEvents.filter((event) => !lifeEvents.includes(event)),
              );
              character.events = character.events.filter(
                (event) => !characterLifeEvents[character.id].includes(event),
              );
              policyStories.splice(
                0,
                policyStories.length,
                ...policyStories.filter(
                  (story) =>
                    story.event.id !== 'news-budget-2026' &&
                    !story.event.id.startsWith('budget-'),
                ),
              );
              baseline = Array.from({ length: 20 }, (_, index) =>
                play(character.id, index + 1, strategy),
              );
            } finally {
              commonEvents.splice(0, commonEvents.length, ...savedCommon);
              character.events = savedCharacter;
              policyStories.splice(0, policyStories.length, ...savedPolicy);
            }
            const annualRate = (samples: typeof runs) =>
              samples.reduce(
                (sum, run) =>
                  sum +
                  (run.eventCards * b.quartersPerYear) /
                    run.quarterSamples.length,
                0,
              ) / samples.length;
            expect(annualRate(runs)).toBeGreaterThanOrEqual(
              annualRate(baseline),
            );
            console.log(
              'POLICY_LIFE_EVENT_RATE',
              JSON.stringify({
                character: character.id,
                before: annualRate(baseline),
                after: annualRate(runs),
                seeds: runs.length,
              }),
            );
            expect(
              runs.reduce(
                (sum, run) =>
                  sum +
                  (run.eventCards * b.quartersPerYear) /
                    run.quarterSamples.length,
                0,
              ) / runs.length,
            ).toBeGreaterThanOrEqual(6);
            expect(fifth).toHaveLength(20);
            expect(median(fifth.map((s) => s.money))).toBeGreaterThanOrEqual(
              18000,
            );
            expect(median(fifth.map((s) => s.money))).toBeLessThanOrEqual(
              40000,
            );
            for (const key of [
              'mood',
              'health',
              'english',
              'career',
            ] as const) {
              expect(
                median(fifth.map((s) => s[key])),
                `year 5 ${key}`,
              ).toBeGreaterThanOrEqual(50);
              expect(
                median(fifth.map((s) => s[key])),
                `year 5 ${key}`,
              ).toBeLessThanOrEqual(85);
              expect(
                median(tenth.map((s) => s[key])),
                `year 10 ${key}`,
              ).toBeGreaterThanOrEqual(35);
            }
            // Each attribute stays away from either boundary in at least three
            // quarters out of four across the seeded histories.
            const interior = (
              ['mood', 'health', 'english', 'career'] as const
            ).filter(
              (key) =>
                runs
                  .flatMap((r) => r.quarterSamples)
                  .filter((s) => s[key] > 0 && s[key] < 100).length /
                  runs.flatMap((r) => r.quarterSamples).length >
                0.75,
            );
            expect(interior).toHaveLength(4);
          }
          const sceneCounts = runs.map((run) =>
            Object.values(run.heartScenes).reduce(
              (sum, count) => sum + count,
              0,
            ),
          );
          if (strategy === 'casual')
            expect(
              sceneCounts.reduce((sum, count) => sum + count, 0) / runs.length,
            ).toBeGreaterThanOrEqual(32);
          if (active) {
            const baseline = beforeTimeEconomy[character.id];
            expect(
              runs.reduce((sum, run) => sum + run.debtEvents, 0),
            ).toBeLessThanOrEqual(baseline.debtEvents);
            expect(
              runs.reduce((sum, run) => sum + run.negativeQuarters, 0),
            ).toBeLessThanOrEqual(baseline.negativeQuarters);
            expect(
              runs.filter((run) => run.state.ending === 'overstayed').length,
            ).toBeLessThanOrEqual(baseline.overstayed);
            for (const stats of [fifth, tenth])
              for (const key of ['mood', 'health'] as const) {
                expect(median(stats.map((s) => s[key]))).toBeGreaterThanOrEqual(
                  55,
                );
                expect(median(stats.map((s) => s[key]))).toBeLessThanOrEqual(
                  85,
                );
              }
            // A percentage reduction is meaningful only for a positive baseline.
            // The other two measured medians were already negative; report them
            // alongside survivor counts rather than treating a larger debt as success.
            const beforeMoney = median(baseline.tenthMoney)!;
            if (beforeMoney > 0)
              expect(median(tenth.map((s) => s.money))).toBeLessThanOrEqual(
                beforeMoney * 0.6,
              );
            for (const [index, run] of runs.entries())
              expect(
                run.eventCards,
                `seed ${index + 1} event-card growth`,
              ).toBeLessThanOrEqual(Math.max(...baseline.eventCards) * 1.5);
            const lowest = runs.reduce((a, c) =>
              a.totalContent < c.totalContent ? a : c,
            );
            console.log(
              'CONTENT_RANGE_V11',
              JSON.stringify({
                character: character.id,
                minSeed: runs.indexOf(lowest) + 1,
                minTotal: lowest.totalContent,
                minContent: lowest.content,
                maxTotal: Math.max(...runs.map((run) => run.totalContent)),
                minUniqueRatio: Math.min(
                  ...runs.map((run) => run.uniqueLines / run.heard),
                ),
                maxHeartScenes: Math.max(...sceneCounts),
                meanHeartScenes:
                  sceneCounts.reduce((sum, count) => sum + count, 0) /
                  runs.length,
              }),
            );
            expect(Math.max(...sceneCounts)).toBeLessThanOrEqual(55);
            for (const [index, run] of runs.entries()) {
              expect(
                run.totalContent,
                `${character.id} seed ${index + 1}`,
              ).toBeGreaterThanOrEqual(15000);
              expect(run.uniqueLines / run.heard).toBeGreaterThanOrEqual(0.8);
            }
            const content = Object.fromEntries(
              (['dialogue', 'events', 'hearts', 'notices'] as const).map(
                (category) => [
                  category,
                  runs.reduce((sum, run) => sum + run.content[category], 0) /
                    runs.length,
                ],
              ),
            );
            const total =
              runs.reduce((sum, run) => sum + run.totalContent, 0) /
              runs.length;
            const uniqueLines =
              runs.reduce((sum, run) => sum + run.uniqueLines, 0) / runs.length;
            const heard =
              runs.reduce((sum, run) => sum + run.heard, 0) / runs.length;
            const uniqueRatio = uniqueLines / heard;
            const meanUniqueRatio =
              runs.reduce((sum, run) => sum + run.uniqueLines / run.heard, 0) /
              runs.length;
            console.log(
              'CONTENT_V3',
              JSON.stringify({
                character: character.id,
                seeds: '1-20',
                content,
                total,
                uniqueLines,
                heard,
                uniqueRatio,
                meanUniqueRatio,
                eventCards:
                  runs.reduce((sum, run) => sum + run.eventCards, 0) /
                  runs.length,
                noticeCount:
                  runs.reduce((sum, run) => sum + run.noticeCount, 0) /
                  runs.length,
              }),
            );
            expect(uniqueLines).toBeGreaterThanOrEqual(450);
            expect(total).toBeGreaterThanOrEqual(15000);
            expect(uniqueRatio).toBeGreaterThanOrEqual(0.8);
            expect(meanUniqueRatio).toBeGreaterThanOrEqual(0.8);
          }
          expect(runs.every((run) => run.state.ending !== undefined)).toBe(
            true,
          );
          expect(runs.every((run) => run.state.day.minute <= 1440)).toBe(true);
          summary.push({
            character: character.id,
            strategy,
            elapsedMs: Math.round(performance.now() - started),
            seeds: '1-20',
            fifthN: fifth.length,
            fifth: medians(fifth),
            tenthN: tenth.length,
            tenth: medians(tenth),
            meanLines: runs.reduce((sum, r) => sum + r.heard, 0) / runs.length,
            meanUniqueLines:
              runs.reduce((sum, r) => sum + r.uniqueLines, 0) / runs.length,
            meanChineseCharacters:
              runs.reduce((sum, r) => sum + r.words, 0) / runs.length,
            meanUniqueChineseCharacters:
              runs.reduce((sum, r) => sum + r.uniqueWords, 0) / runs.length,
            meanHeartScenes: Object.fromEntries(
              [2, 4, 6, 8, 10].map((threshold) => [
                threshold,
                runs.reduce((sum, r) => sum + r.heartScenes[threshold], 0) /
                  runs.length,
              ]),
            ),
            tenHeartReach: Object.fromEntries(
              npcs
                .filter(
                  (npc) =>
                    !npc.characters || npc.characters.includes(character.id),
                )
                .map((npc) => [
                  npc.id,
                  runs.filter(
                    (run) => (run.peakFriendship[npc.id] ?? 0) >= 1000,
                  ).length / runs.length,
                ]),
            ),
          });
        }
        console.log('BALANCE_V3', JSON.stringify(summary));
      }, 135_000); // Each 20-seed strategy: local target 45s; CI takes about 3x as long.
    }
  }
  test('full games reproduce across seeds and JSON restoration retains the one random stream', () => {
    for (const seed of [1, 17, 42]) {
      const first = play('skilled-worker', seed, 'fast-forward');
      expect(play('skilled-worker', seed, 'fast-forward')).toEqual(first);
      expect(first.state).toEqual(JSON.parse(JSON.stringify(first.state)));
    }
  });
});
