import { addDays, addMonths, firstWeekday } from './calendar';
import { defaultBalance } from './default-balance';
import type { GameContentPack, GameTools } from './content-pack';
import type {
  Condition as PackCondition,
  Effect as PackEffect,
  EndingId,
  GameEvent as PackEvent,
  GameState as PackState,
  Activity as PackActivity,
  AnchorId,
  DayState as PackDay,
  ItemId,
  LifeRecord,
  LifeRecords,
  Npc as PackNpc,
  NpcLocation,
  PlaceId,
  Channel,
  SettlementSource,
  Weather,
  Progress,
  IsoDate,
  Locale,
  Text,
  TownEffect,
  Outcome,
} from './model';

export function createGame<
  Timeline,
  Result,
  E extends { type: string },
  RuleId extends string,
  Decision extends string,
  F extends string,
>(pack: GameContentPack<Timeline, Result, E, RuleId, Decision, F>) {
  type GameState = PackState<Timeline, Result, F>;
  type DayState = PackDay<F>;
  type Condition = PackCondition<F>;
  type Npc = PackNpc<F>;
  type GameEvent = PackEvent<E, F>;
  type Activity = PackActivity<E, F>;
  type Effect = PackEffect<E>;
  const {
    characterOf,
    places,
    actions: locationActions,
    npcs = [],
    events: commonEvents = [],
    systemEvents = [],
    datedEvents: policyStories = [],
    heartEvents = [],
    letters: townHeartLetters = [],
    extraEvents: surpriseEvents = [],
    items = [],
    recipes = [],
    festivals = [],
    notices = [],
    achievements = [],
    lifeAchievements = [],
    home = 'home',
    fishingPlace = 'pond',
    fishingSpot = { zhCN: '池塘', en: 'the pond' },
    allotmentPlace = 'allotment',
  } = pack;
  const b = { ...defaultBalance, ...pack.balance };
  const tools: GameTools<Timeline, Result, E, F> = {
    affordable,
    applyEffects,
    setFlags,
    available,
    makePending,
    recordLife,
    random,
  };

  function quarterAt(date: IsoDate): GameState['quarter'] {
    const end = addMonths(date, b.monthsPerQuarter);
    const midpoint = new Date((Date.parse(date) + Date.parse(end)) / 2);
    return Math.ceil((midpoint.getUTCMonth() + 1) / 3) as GameState['quarter'];
  }
  function pool(state: GameState) {
    const character = characterOf(state.characterId);
    const residentIds = new Set(
      npcs
        .filter(
          (npc) => !npc.characters || npc.characters.includes(character.id),
        )
        .map((npc) => npc.id),
    );
    return [
      ...commonEvents,
      ...character.events,
      ...systemEvents,
      ...policyStories
        .filter((story) => !story.character || story.character === character.id)
        .map((story) => story.event),
      character.opening,
      ...heartEvents.filter((event) => residentIds.has(event.heart!.npc)),
      ...townHeartLetters,
      ...surpriseEvents,
    ];
  }
  function visaMonthsLeft(state: GameState): number {
    return pack.rules.visaMonthsLeft?.(state) ?? 0;
  }
  function matches(state: GameState, conditions: Condition[] = []): boolean {
    return conditions.every((c) => {
      if ('stat' in c)
        return (
          (c.min === undefined || state.stats[c.stat] >= c.min) &&
          (c.max === undefined || state.stats[c.stat] <= c.max)
        );
      if ('route' in c) return pack.rules.route?.(state) === c.route;
      if ('flag' in c) return state.flags.includes(c.flag);
      if ('visaMonthsLeftMax' in c)
        return visaMonthsLeft(state) <= c.visaMonthsLeftMax;
      if ('dayKind' in c) return state.day.kind === c.dayKind;
      if ('weather' in c) return state.day.weather === c.weather;
      if ('festival' in c) return state.day.festival === c.festival;
      if ('npc' in c)
        return (
          (c.heartsMin === undefined || hearts(state, c.npc) >= c.heartsMin) &&
          (c.heartsMax === undefined || hearts(state, c.npc) <= c.heartsMax)
        );
      if ('item' in c) return (state.inventory[c.item] ?? 0) >= (c.min ?? 1);
      if ('minuteMin' in c || 'minuteMax' in c)
        return (
          (c.minuteMin === undefined || state.day.minute >= c.minuteMin) &&
          (c.minuteMax === undefined || state.day.minute <= c.minuteMax)
        );
      const year = c as { yearMin?: number; yearMax?: number };
      return (
        (year.yearMin === undefined || state.year >= year.yearMin) &&
        (year.yearMax === undefined || state.year <= year.yearMax)
      );
    });
  }
  function dayCondition(c: Condition) {
    return 'dayKind' in c || 'weather' in c || 'festival' in c;
  }
  function timeCondition(c: Condition) {
    return 'minuteMin' in c || 'minuteMax' in c;
  }
  function timeWindow(event: GameEvent, start: number, end: number) {
    for (const c of event.when ?? []) {
      if ('minuteMin' in c) start = Math.max(start, c.minuteMin ?? start);
      if ('minuteMax' in c) end = Math.min(end, c.minuteMax ?? end);
    }
    return { start, end };
  }
  function available(state: GameState, event: GameEvent, drawing = false) {
    const story = policyStories.find((story) => story.event.id === event.id);
    return (
      (!story ||
        ((!story.character || story.character === state.characterId) &&
          story.published <= state.date &&
          state.date < story.until &&
          state.day.date < story.until)) &&
      pack.eventAvailable?.(state, event) !== false &&
      (!event.season || event.season === state.quarter) &&
      (!event.once || !state.firedEvents.includes(event.id)) &&
      (event.requires ?? []).every((f) => state.flags.includes(f)) &&
      !(event.forbids ?? []).some((f) => state.flags.includes(f)) &&
      matches(
        state,
        event.when?.filter(
          (c) => !drawing || (!dayCondition(c) && !timeCondition(c)),
        ),
      )
    );
  }
  function random(state: GameState) {
    state.randomState = (state.randomState + 0x6d2b79f5) | 0;
    let value = Math.imul(
      state.randomState ^ (state.randomState >>> 15),
      state.randomState | 1,
    );
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  function draw(state: GameState, count: number) {
    // Post this quarter’s notices before checking board-linked card prerequisites.
    const options = notices.filter(
      (notice) => !notice.season || notice.season === state.quarter,
    );
    const noticeCount = options.length
      ? b.boardCountMin +
        Math.floor(random(state) * (b.boardCountMax - b.boardCountMin + 1))
      : 0;
    for (let i = 0; i < noticeCount && options.length; i++) {
      const [notice] = options.splice(
        Math.floor(random(state) * options.length),
        1,
      );
      setFlags(state, [`quarter-board-${notice.id}`]);
    }
    for (const { event } of policyStories)
      if (available(state, event) && !state.eventQueue.includes(event.id))
        state.eventQueue.push(event.id);
    const character = characterOf(state.characterId);
    const events = pool(state);
    for (let i = 0; i < count; i++) {
      const candidates = [
        ...commonEvents,
        ...character.events,
        ...townHeartLetters,
      ].filter(
        (e) =>
          pack.randomEvent?.(state, e) !== false &&
          available(state, e, true) &&
          ![state.pendingEvent, ...state.eventQueue].some((id) =>
            events
              .find((scheduled) => scheduled.id === id)
              ?.forbids?.some(
                (flag) =>
                  flag.startsWith('quarter-') && e.forbids?.includes(flag),
              ),
          ) &&
          !state.eventQueue.includes(e.id) &&
          e.id !== state.pendingEvent,
      );
      if (!candidates.length) break;
      let cursor =
        random(state) * candidates.reduce((sum, e) => sum + e.weight, 0);
      const event =
        candidates.find((e) => (cursor -= e.weight) < 0) ??
        candidates[candidates.length - 1];
      state.eventQueue.push(event.id);
    }
  }
  function makePending(state: GameState, id: string) {
    const event = pool(state).find((e) => e.id === id);
    if (!event || !available(state, event)) return false;
    state.pendingEvent = id;
    state.firedEvents.push(id);
    return true;
  }
  function deliver(state: GameState, channel: Channel | 'leftovers') {
    if (state.pendingEvent || isOver(state)) return;
    for (const delivery of [...state.day.deliveries]) {
      if (
        state.trip &&
        delivery.channel !== 'phone' &&
        !delivery.eventId.startsWith('system-')
      )
        continue;
      if (channel !== 'leftovers' && delivery.channel !== channel) continue;
      if (
        channel === 'phone' &&
        (delivery.minute ?? b.phoneStart) > state.day.minute
      )
        continue;
      const event = pool(state).find((e) => e.id === delivery.eventId);
      if (!event) continue;
      if (delivery.channel.startsWith('place:')) {
        const place = delivery.channel.slice(6) as PlaceId;
        if (channel === 'leftovers' && place !== state.day.place) continue;
        if (!isOpen(state, place)) continue;
      }
      if (channel === 'leftovers' && delivery.channel === 'phone')
        state.day.minute = Math.max(
          state.day.minute,
          delivery.minute ?? b.phoneStart,
        );
      // Letters are written for wake-up, even when read later in the day.
      const check =
        delivery.channel === 'letter'
          ? { ...state, day: { ...state.day, minute: b.wakeMinute } }
          : state;
      if (!available(check, event)) continue;
      state.day.deliveries = state.day.deliveries.filter(
        (d) => d.eventId !== delivery.eventId,
      );
      state.pendingEvent = delivery.eventId;
      state.firedEvents.push(delivery.eventId);
      return;
    }
  }
  function nextEvent(state: GameState) {
    if (state.pendingEvent || isOver(state)) return;
    // eventQueue holds future-day cards and immediate system pressure.
    for (const id of [...state.eventQueue].filter((id) =>
      id.startsWith('system-'),
    )) {
      state.eventQueue.splice(state.eventQueue.indexOf(id), 1);
      if (makePending(state, id)) return;
    }
    deliver(state, 'morning');
    deliver(state, 'phone');
    if (
      state.day.place &&
      (state.day.place !== home || state.day.done.includes('returned-home'))
    )
      deliver(state, `place:${state.day.place}`);
  }
  function pressure(state: GameState) {
    const queue = (id: string) => {
      if (state.pendingEvent !== id && !state.eventQueue.includes(id))
        state.eventQueue.unshift(id);
    };
    if (state.stats.money >= 0)
      state.flags = state.flags.filter((f) => f !== 'debt-crisis');
    if (state.stats.health === 0) queue('system-hospital');
    if (state.stats.mood === 0) queue('system-homesick');
  }
  function finish(state: GameState, ending: EndingId) {
    if (state.ending) return;
    state.ending = ending;
    state.day.deliveries = [];
    delete state.trip;
    delete state.pendingEvent;
    state.eventQueue = [];
    state.log.push({
      year: state.year,
      quarter: state.quarter,
      kind: 'ending',
      id: ending,
      text: pack.endingText(state, ending),
    });
  }
  function recalculate(state: GameState) {
    state.result = pack.rules.evaluate(state);
    const ending = pack.rules.endingForResult?.(state.result);
    if (ending) finish(state, ending);
  }
  function award(state: GameState, lifeOnly = false) {
    const candidates = lifeOnly
      ? lifeAchievements
      : [
          ...achievements,
          ...(characterOf(state.characterId).achievements ?? []),
        ];
    for (const a of candidates) {
      if (!state.achievements.includes(a.id) && a.check(state))
        state.achievements.push(a.id);
    }
  }
  function setFlags(state: GameState, flags: string[] = []) {
    state.flags = [...new Set([...state.flags, ...flags])];
  }
  function recordLife(state: GameState, id: string, text: Text) {
    state.log.push({
      year: state.year,
      quarter: state.quarter,
      kind: 'action',
      id,
      text,
    });
  }
  function recordItem(
    state: GameState,
    kind: keyof LifeRecords,
    itemId: ItemId,
    memory?: LifeRecord['memory'],
  ) {
    const records = (state.lifeRecords ??= {
      fish: [],
      dishes: [],
      harvests: [],
    });
    if (kind === 'harvests' || !records[kind].some((r) => r.itemId === itemId))
      records[kind].push({
        itemId,
        year: state.year,
        quarter: state.quarter,
        ...(memory && { memory }),
      });
  }
  function applyEffects(state: GameState, effects: Effect[]): boolean {
    let changedTimeline = false;
    for (const effect of effects) {
      const e = effect as TownEffect;
      switch (e.type) {
        case 'stat':
          state.stats[e.key] += e.delta;
          break;
        case 'money':
          state.stats.money += e.delta;
          break;
        case 'ending':
          finish(state, e.ending);
          break;
        case 'none':
          break;
        case 'item':
          state.inventory[e.item] = Math.max(
            0,
            (state.inventory[e.item] ?? 0) + e.delta,
          );
          break;
        case 'friendship': {
          const before = hearts(state, e.npc);
          state.friendship[e.npc] = Math.max(
            0,
            Math.min(b.friendshipMax, (state.friendship[e.npc] ?? 0) + e.delta),
          );
          if (hearts(state, e.npc) > before)
            setFlags(state, [`quarter-friendship-${e.npc}`]);
          break;
        }
        default:
          if (pack.rules.applyEffect?.(state, effect as E, tools))
            changedTimeline = true;
      }
    }
    for (const key of Object.keys(state.stats))
      if (key !== 'money')
        state.stats[key] = Math.max(0, Math.min(100, state.stats[key]));
    return (pack.rules.afterEffects?.(state) ?? false) || changedTimeline;
  }
  function deltas(before: GameState, after: GameState) {
    return Object.fromEntries(
      Object.keys(before.stats)
        .filter((key) => before.stats[key] !== after.stats[key])
        .map((key) => [key, after.stats[key] - before.stats[key]]),
    );
  }
  function newGame(
    characterId: string,
    seed: number,
    locale: Locale = 'zh-CN',
  ): GameState {
    const character = characterOf(characterId);
    const timeline = structuredClone(character.timeline);
    const state: GameState = {
      version: 3,
      characterId,
      seed,
      locale,
      year: 1,
      quarter: quarterAt(character.startDate),
      date: character.startDate,
      timeline,
      stats: { ...character.stats },
      dayNumber: 0,
      day: {
        index: 0,
        kind: 'workday',
        date: character.startDate,
        minute: b.wakeMinute,
        weather: 'cloudy',
        place: home,
        done: [],
        talked: [],
        gifted: [],
        deliveries: [],
      },
      inventory: {},
      lifeRecords: { fish: [], dishes: [], harvests: [] },
      friendship: {},
      plots: [],
      heard: [],
      flags: [],
      firedEvents: [],
      eventQueue: [],
      randomState: seed | 0,
      log: [],
      result: pack.rules.evaluate({
        date: character.startDate,
        timeline,
        locale,
      }),
      achievements: [],
    };
    draw(state, random(state) < 0.5 ? 1 : 2);
    beginDay(state, 0);
    return state;
  }
  function activities(state: GameState, place: PlaceId): Activity[] {
    if (isOver(state) || !isOpen(state, place)) return [];
    return locationActions
      .map((a) => pack.actionVenue?.(state, a) ?? a)
      .filter((a) => a.place === place)
      .filter((a) => {
        if (a.id === pack.informationAction?.id) return true;
        if (
          a.id.startsWith('furnish-') &&
          state.flags.includes(`furnished-${a.id.slice(8)}`)
        )
          return false;
        if (
          a.id === 'rent-brighter-home' &&
          (state.flags.includes('brighter-home') ||
            state.stats.money <
              (b.lifestyleReserve[state.characterId] ?? 0) +
                b.housingDeposit +
                b.housingMoveCost)
        )
          return false;
        if (
          a.id === 'walking-club' &&
          state.flags.includes('quarter-walking-club')
        )
          return false;
        if (
          state.pendingEvent ||
          state.trip ||
          state.day.minute + a.minutes > closingTime(state, place)
        )
          return false;
        if (a.oncePerDay && state.day.done.includes(a.id)) return false;
        if (!matches(state, a.when)) return false;
        if (a.id === 'rent-plot' && state.plots.length) return false;
        if (a.id.startsWith('travel-')) {
          const to = addMonths(state.day.date, Number(a.id.slice(7)));
          if (pack.rules.canTravel?.(state, to) === false) return false;
        }
        const available = pack.actionAvailable?.(state, a, tools);
        if (available !== undefined) return available;
        return affordable(state, a.effects);
      })
      .map((a) => {
        const action = structuredClone(a);
        pack.actionDetails?.(state, action);
        return action;
      });
  }
  function affordable(state: GameState, effects: Effect[]) {
    const cost = -(effects as TownEffect[]).reduce(
      (sum, e) => sum + (e.type === 'money' ? e.delta : 0),
      0,
    );
    return cost <= 0 || state.stats.money >= cost;
  }
  function doActivity(state: GameState, actionId: string): GameState {
    if (
      actionId === pack.informationAction?.id &&
      activities(state, pack.informationAction.place).some(
        (a) => a.id === actionId,
      )
    )
      return state;
    const action =
      state.day.place &&
      activities(state, state.day.place).find((a) => a.id === actionId);
    if (!action) throw new Error(`Activity is not available: ${actionId}`);
    if (action.id === pack.informationAction?.id) return state;
    const next = structuredClone(state);
    pack.beforeAction?.(next, action);
    const changed = applyEffects(next, action.effects);
    next.day.done.push(action.id);
    if (action.id === 'rent-brighter-home')
      setFlags(next, ['brighter-home', 'quarter-housing-change']);
    if (action.id === 'leave-brighter-home') {
      next.flags = next.flags.filter((flag) => flag !== 'brighter-home');
      setFlags(next, ['quarter-housing-change']);
    }
    if (action.id === 'walking-club') setFlags(next, ['quarter-walking-club']);
    if (action.id.startsWith('furnish-'))
      setFlags(next, [`furnished-${action.id.slice(8)}`]);
    const flags = pack.actionFlags?.(action);
    if (flags) setFlags(next, flags);
    if (action.id === 'overtime') setFlags(next, ['worked-overtime']);
    if (action.id === 'rent-plot') {
      next.plots = Array.from({ length: b.plots }, () => ({ growth: 0 }));
    }
    if (action.id === 'festival')
      applyEffects(
        next,
        townsfolk(next).map((npc) => ({
          type: 'friendship',
          npc: npc.id,
          delta: b.festivalFriendship,
        })),
      );
    if (changed) recalculate(next);
    const endingLog = next.log.filter((entry) => entry.kind === 'ending');
    next.log = next.log.filter((entry) => entry.kind !== 'ending');
    const actionLog: GameState['log'][number] = {
      year: state.year,
      quarter: state.quarter,
      kind: 'action',
      id: action.id,
      text: action.label,
      statDeltas: deltas(state, next),
    };
    next.log.push(actionLog);
    next.log.push(...endingLog);
    next.outcome = {
      kind: action.id.startsWith('travel-') ? 'travel' : 'activity',
      actionId: action.id,
      text: action.label,
      statDeltas: deltas(state, next),
    };
    pack.afterAction?.(
      state,
      next as GameState & { outcome: Outcome },
      action,
      actionLog,
      tools,
    );
    next.outcome.statDeltas = deltas(state, next);
    award(next, true);
    if (isOver(next)) {
      award(next);
      return next;
    }
    pack.afterActionAwards?.(
      state,
      next as GameState & { outcome: Outcome },
      action,
      actionLog,
      tools,
    );
    if (action.id.startsWith('travel-')) {
      next.trip = {
        from: state.day.date,
        to: addMonths(state.day.date, Number(action.id.slice(7))),
      };
      return continueTrip(next);
    }
    const text = next.outcome?.text;
    const after = advanceClock(next, action.minutes);
    // A phone call that rings during (or at the end of) this action, on the
    // same day, holds back its result until the call is resolved (50 /
    // review56-4, review56-5). Letters, exam results and the next morning do not.
    const call =
      !state.pendingEvent &&
      after.pendingEvent !== undefined &&
      after.day.date === state.day.date &&
      state.day.deliveries.some(
        (d) => d.channel === 'phone' && d.eventId === after.pendingEvent,
      );
    if (call && text) after.interruptedOutcome = { actionId: action.id, text };
    return after;
  }
  function currentEvent(state: GameState): GameEvent | undefined {
    const event = isOver(state)
      ? undefined
      : pool(state).find((e) => e.id === state.pendingEvent);
    return event && (pack.eventView?.(state, event) ?? event);
  }
  function resolve(state: GameState, choiceId: string): GameState {
    const event = currentEvent(state);
    const choice = event?.choices.find((c) => c.id === choiceId);
    if (!event || !choice)
      throw new Error(`Choice is not available: ${choiceId}`);
    const next = structuredClone(state);
    delete next.pendingEvent;
    delete next.interruptedOutcome;
    const changed = applyEffects(next, choice.effects);
    setFlags(next, choice.sets);
    if (
      next.flags.includes('brighter-home') &&
      choice.sets?.includes('cheap-housing')
    ) {
      next.flags = next.flags.filter((flag) => flag !== 'brighter-home');
      applyEffects(next, [{ type: 'money', delta: b.housingDeposit }]);
    }
    const surpriseResult = pack.afterChoice?.(
      state,
      next,
      event,
      choiceId,
      tools,
    );
    const endingLog = next.log.filter((e) => e.kind === 'ending');
    next.log = next.log.filter((e) => e.kind !== 'ending');
    const eventLog: GameState['log'][number] = {
      year: state.year,
      quarter: state.quarter,
      kind: 'event',
      id: event.id,
      choiceId,
      text: {
        zhCN: `${event.title.zhCN}：${choice.label.zhCN}`,
        en: `${event.title.en}: ${choice.label.en}`,
      },
      statDeltas: deltas(state, next),
    };
    next.log.push(eventLog);
    next.log.push(...endingLog);
    if (surpriseResult) {
      next.outcome = {
        kind: 'activity',
        text: surpriseResult,
        statDeltas: deltas(state, next),
      };
      eventLog.text = surpriseResult;
    }
    if (changed) recalculate(next);
    award(next, true);
    if (!isOver(next)) {
      pressure(next);
      nextEvent(next);
    } else award(next);
    if (next.trip) return continueTrip(next);
    if (!next.pendingEvent && next.day.resumeMinute !== undefined) {
      const target = next.day.resumeMinute;
      delete next.day.resumeMinute;
      return advanceClock(next, target - next.day.minute);
    }
    return !next.pendingEvent && next.day.minute === b.midnight
      ? sleep(next)
      : next;
  }
  function endQuarter(state: GameState): GameState {
    if (isOver(state)) return state;
    if (state.pendingEvent)
      throw new Error('Resolve the pending event before ending the quarter');
    if (
      state.day.index !== 2 ||
      state.day.deliveries.length ||
      state.eventQueue.some(
        (id) =>
          !id.startsWith('system-') &&
          !(state.trip && state.flags.includes(`travel-deferred:${id}`)),
      )
    )
      throw new Error(
        'Finish the three days and their deliveries before ending the quarter',
      );
    const next = structuredClone(state);
    const wellbeing: NonNullable<GameState['log'][number]['wellbeing']> = [];
    function settleWellbeing(
      source: SettlementSource,
      mood: number,
      health: number,
    ) {
      const { mood: previousMood, health: previousHealth } = next.stats;
      applyEffects(next, [
        { type: 'stat', key: 'mood', delta: mood },
        { type: 'stat', key: 'health', delta: health },
      ]);
      const moodChange = next.stats.mood - previousMood;
      const healthChange = next.stats.health - previousHealth;
      if (moodChange || healthChange)
        wellbeing.push({ source, mood: moodChange, health: healthChange });
    }
    const workedOvertime = state.log.some(
      (e) =>
        e.year === state.year &&
        e.quarter === state.quarter &&
        e.kind === 'action' &&
        e.id === 'overtime',
    );
    const householdSalary = pack.rules.earnings?.(next) ?? 0;
    const played = state.log.filter((e) => e.kind === 'quarter').length;
    applyEffects(next, [
      {
        type: 'money',
        delta:
          householdSalary / b.quartersPerYear -
          b.livingCosts +
          (b.householdCostContribution[state.characterId] ?? 0) +
          (state.flags.includes('cheap-housing') ? b.cheapHousingSaving : 0) -
          (state.year - 1) * b.livingCostAnnualIncrease -
          state.flags.filter(
            (f) =>
              f.startsWith('rent-rise-') &&
              !f.endsWith('-ended') &&
              !state.flags.includes(`${f}-ended`),
          ).length *
            b.rentRisePerQuarter,
      },
      ...(pack.quarterEffects?.(played) ?? []),
      { type: 'stat', key: 'career', delta: played % 2 ? 0 : -b.careerDecay },
    ]);
    settleWellbeing(
      'seasonWear',
      -b.moodDecay -
        Math.round(
          Math.max(0, state.stats.mood - b.moodWearThreshold) * b.moodWearRate,
        ),
      -b.healthDecay -
        Math.round(
          Math.max(0, state.stats.health - b.healthWearThreshold) *
            b.healthWearRate,
        ),
    );
    if (workedOvertime)
      settleWellbeing('overtimeWear', 0, -b.overtimeHealthDecay);
    // A rolling short let returns its deposit if the next rent would eat into
    // the household reserve. It never silently finances an upgrade with debt.
    if (
      next.flags.includes('brighter-home') &&
      next.stats.money <
        (b.lifestyleReserve[state.characterId] ?? 0) + b.housingRent
    ) {
      next.flags = next.flags.filter((flag) => flag !== 'brighter-home');
      applyEffects(next, [{ type: 'money', delta: b.housingDeposit }]);
      recordLife(next, 'brighter-home-return', {
        zhCN: '明亮住处的短租到期，你退回原住处，押金回到账户，额外房租停止。',
        en: 'The brighter home’s short let ends. You return to the original place, recover the deposit and stop paying the extra rent.',
      });
    }
    const brighter = next.flags.includes('brighter-home');
    const furniture = Object.entries(b.furnishings).filter(([id]) =>
      next.flags.includes(`furnished-${id}`),
    );
    if (brighter) {
      applyEffects(next, [{ type: 'money', delta: -b.housingRent }]);
      settleWellbeing('brighterHome', b.housingMood, b.housingHealth);
    }
    if (next.flags.includes('quarter-walking-club'))
      settleWellbeing('walkingClub', b.clubMood, b.clubHealth);
    if (furniture.length)
      settleWellbeing(
        'furnishings',
        furniture.reduce((sum, [, item]) => sum + item.mood, 0),
        furniture.reduce((sum, [, item]) => sum + item.health, 0),
      );
    let promoted = false;
    for (const threshold of b.promotionThresholds) {
      const flag = `promotion-${threshold}`;
      if (
        next.stats.career >= threshold &&
        !next.flags.includes(flag) &&
        pack.rules.promote?.(next, b.promotionMultiplier)
      ) {
        setFlags(next, [flag, 'promoted']);
        promoted = true;
      }
    }
    const rental = state.log.findIndex(
      (entry) => entry.kind === 'action' && entry.id === 'rent-plot',
    );
    const rentalQuarter = state.log
      .slice(0, rental)
      .filter((entry) => entry.kind === 'quarter').length;
    if (rental >= 0 && (played + 1 - rentalQuarter) % b.quartersPerYear === 0)
      applyEffects(next, [{ type: 'money', delta: -b.plotAnnualRent }]);
    next.log.push({
      year: state.year,
      quarter: state.quarter,
      kind: 'quarter',
      id: 'quarter',
      text: {
        zhCN: '工资到账，账单付清，窗外又换了一季。',
        en: 'Pay arrives, bills go out, and another season passes outside.',
      },
      statDeltas: deltas(state, next),
      wellbeing,
      clearedPlots: next.plots.filter((plot) => plot.seed).length,
    });
    for (const npc of townsfolk(next))
      if (!state.flags.includes(`quarter-talked-${npc.id}`))
        applyEffects(next, [
          { type: 'friendship', npc: npc.id, delta: -b.unseenDecay },
        ]);
    next.plots = next.plots.map(() => ({ growth: 0 }));
    next.date = addMonths(state.date, b.monthsPerQuarter);
    const expired = pack.rules.expired?.(next, state.date);
    const returned = recordReturn(next);
    recalculate(next);
    if (expired) finish(next, 'overstayed');
    const completedQuarters = next.log.filter(
      (e) => e.kind === 'quarter',
    ).length;
    if (completedQuarters % b.quartersPerYear === 0) award(next);
    if (!isOver(next) && completedQuarters === b.years * b.quartersPerYear)
      finish(next, 'timeout');
    if (!isOver(next)) {
      const previousFlags = next.flags;
      next.flags = next.flags.filter((f) => !f.startsWith('quarter-'));
      pack.afterQuarter?.(next, previousFlags, tools);
      if (returned) setFlags(next, ['quarter-returned']);
      if (promoted) setFlags(next, ['quarter-promoted']);
      next.quarter = quarterAt(next.date);
      next.year =
        state.year + (completedQuarters % b.quartersPerYear === 0 ? 1 : 0);

      if (next.stats.money < 0) {
        if (next.flags.includes('negative-last-quarter')) {
          setFlags(next, ['debt-crisis']);
          next.eventQueue.push('system-debt');
        }
        setFlags(next, ['negative-last-quarter']);
      } else
        next.flags = next.flags.filter(
          (f) => f !== 'negative-last-quarter' && f !== 'debt-crisis',
        );
      draw(next, random(next) < 0.5 ? 1 : 2);
      pressure(next);
      beginDay(next, 0);
    } else award(next);
    return next;
  }
  function progress(state: GameState): Progress<RuleId, Decision> {
    return pack.rules.progress(state);
  }
  function isOver(state: GameState) {
    return state.ending !== undefined;
  }
  function narrative(state: GameState): Text[] {
    const sentences: Text[] = [
      {
        zhCN: `你在 ${characterOf(state.characterId).startDate} 开始记录小镇生活。`,
        en: `You began keeping a town diary on ${characterOf(state.characterId).startDate}.`,
      },
    ];
    const friends = npcs
      .filter((npc) => !npc.characters && (state.friendship[npc.id] ?? 0) > 0)
      .sort(
        (a, c) =>
          (state.friendship[c.id] ?? 0) - (state.friendship[a.id] ?? 0) ||
          a.id.localeCompare(c.id),
      )
      .slice(0, 3);
    if (friends.length)
      sentences.push({
        zhCN: `想起小镇时，总会先想起${friends.map((n) => n.name.zhCN).join('、')}，还有他们留着的座位。`,
        en: `Thoughts of town bring ${friends.map((n) => n.name.en).join(', ')} to mind, and the seats they kept for you.`,
      });
    const harvests = state.log.filter(
      (e) => e.kind === 'action' && e.id === 'harvest',
    ).length;
    const casts = state.log.filter(
      (e) => e.kind === 'action' && e.id === 'fishing',
    ).length;
    const catches = state.log.filter(
      (e) => e.kind === 'action' && e.id === 'catch-fish',
    ).length;
    const pursuits: Text[] = [];
    if (harvests)
      pursuits.push({
        zhCN: `菜地收成 ${harvests} 次`,
        en: `${harvests} harvest${harvests === 1 ? '' : 's'} from the allotment`,
      });
    if (casts)
      pursuits.push({
        zhCN: `${fishingSpot.zhCN}抛竿 ${casts} 次`,
        en: `${casts} cast${casts === 1 ? '' : 's'} at ${fishingSpot.en}`,
      });
    if (catches)
      pursuits.push({
        zhCN: `钓到鱼 ${catches} 次`,
        en: `${catches} successful fish catch${catches === 1 ? '' : 'es'}`,
      });
    if (pursuits.length)
      sentences.push({
        zhCN: `${pursuits.map((p) => p.zhCN).join('，')}。`,
        en: `The diary records ${pursuits.map((p) => p.en).join(', ')}.`,
      });
    const visited = festivals.filter((f) =>
      state.flags.includes(`visited-festival:${f.id}`),
    );
    if (visited.length)
      sentences.push({
        zhCN: `去过${visited.map((f) => f.name.zhCN).join('、')}，灯下的面孔渐渐都熟悉了。`,
        en: `You joined ${visited.map((f) => f.name.en).join(', ')}; the faces beneath the lights grew familiar.`,
      });
    const groups: [string[], Text][] = [
      [
        ['work', 'overtime'],
        {
          zhCN: '键盘和工资单，渐渐成了生活的节拍。',
          en: 'Keyboards and payslips slowly set the rhythm of life.',
        },
      ],
      [
        ['class', 'exam'],
        {
          zhCN: '课本翻了又翻，开口说话也越来越自在。',
          en: 'The textbooks grew worn, and conversation grew easier.',
        },
      ],
      [
        ['rest', 'gp', 'relax'],
        {
          zhCN: '也有一些日子，休息比赶路更要紧。',
          en: 'On some days, rest mattered more than rushing ahead.',
        },
      ],
      [
        ['extend', 'settle'],
        {
          zhCN: '文件夹越装越厚，下一段生活逐渐有了形状。',
          en: 'The paperwork folder thickened as the next chapter took shape.',
        },
      ],
      [
        ['travel-1', 'travel-3', 'travel-6'],
        {
          zhCN: '行李箱来回滚过，想念在两边都有地址。',
          en: 'The suitcase rolled both ways; there were people to miss at either end.',
        },
      ],
    ];
    for (const [ids, text] of groups) {
      const entry = state.log.find(
        (e) => e.kind === 'action' && ids.includes(e.id),
      );
      if (entry) sentences.push(text);
    }
    // Distinct event memories retain the actual choice, rather than a score summary.
    for (const e of state.log
      .filter((e) => e.kind === 'event')
      .filter((e, i, all) => all.findIndex((x) => x.id === e.id) === i)
      .slice(0, 3)) {
      sentences.push({
        zhCN: `记得那次${e.text.zhCN}。`,
        en: `One memory remains: ${e.text.en}.`,
      });
    }
    const quarters = state.log.filter((e) => e.kind === 'quarter').length;
    sentences.push({
      zhCN: `日记写过 ${quarters} 个季度，雨伞换了位置，生活没有停。`,
      en: `The diary spans ${quarters} quarter${quarters === 1 ? '' : 's'}; umbrellas moved, and life kept going.`,
    });
    const ledger = pack.ledgerText?.(state);
    if (ledger) sentences.push(ledger);
    const fillers: Text[] = [
      {
        zhCN: '有些周末，最远只走到街角的超市。',
        en: 'Some weekends reached no further than the corner supermarket.',
      },
      {
        zhCN: '天气预报没总说准，日子倒是一天天过了。',
        en: 'The forecast was not always right, but the days passed anyway.',
      },
      {
        zhCN: '熟悉的街道，也曾是地图上陌生的一格。',
        en: 'These familiar streets were once unknown squares on a map.',
      },
      {
        zhCN: '茶凉过很多次，故事还留着余温。',
        en: 'Many cups of tea went cold; the story kept some warmth.',
      },
    ];
    const ending = state.log.find((e) => e.kind === 'ending')?.text;
    while (sentences.length < (ending ? 7 : 8))
      sentences.push(fillers[(sentences.length - 1) % fillers.length]);
    return [
      ...sentences.slice(0, ending ? 11 : 12),
      ...(ending ? [ending] : []),
    ];
  }

  function closingTime(state: GameState, place: PlaceId) {
    return Math.min(
      b.midnight,
      places.find((p) => p.id === place)?.hours?.closes ?? b.midnight,
    );
  }
  function isOpen(state: GameState, place: PlaceId) {
    const hours = places.find((p) => p.id === place)?.hours;
    return (
      !hours ||
      ((!hours.dayKinds || hours.dayKinds.includes(state.day.kind)) &&
        state.day.minute >= hours.opens &&
        state.day.minute < hours.closes)
    );
  }
  function beginDay(state: GameState, index: DayState['index']) {
    const weights = b.weatherWeights[state.quarter];
    let cursor = random(state) * weights.reduce((sum, n) => sum + n, 0);
    const weather = (['sunny', 'cloudy', 'rain', 'snow'] as Weather[])[
      weights.findIndex((n) => (cursor -= n) < 0)
    ];
    const workday = firstWeekday(addDays(state.date, 7), 2);
    const weekend = firstWeekday(workday, 6);
    const quarterEnd = addMonths(state.date, b.monthsPerQuarter);
    const fallbackDate = addDays(quarterEnd, -1);
    const scheduled = pack.calendar?.(state);
    let specialDate = scheduled?.date ?? fallbackDate;
    // Keep the festival's weekday when it falls before the playable weekend.
    while (specialDate >= state.date && specialDate <= weekend)
      specialDate = addDays(specialDate, 7);
    const special =
      specialDate > weekend && specialDate < quarterEnd
        ? { date: specialDate, festival: scheduled?.festival }
        : { date: fallbackDate, festival: undefined };
    state.day = {
      index,
      kind: (['workday', 'weekend', 'special'] as const)[index],
      date: [workday, weekend, special.date][index],
      minute: b.wakeMinute,
      weather,
      ...(index === 2 && special.festival && { festival: special.festival }),
      place: home,
      done: [],
      talked: [],
      gifted: [],
      deliveries: [],
    };
    // Day kinds and festivals are known for the remaining days. Weather is rolled
    // daily, so weather-bound cards take the first matching day.
    for (const id of [...state.eventQueue]) {
      if (id.startsWith('system-')) continue;
      const event = pool(state).find((e) => e.id === id)!;
      const channel = event.channel ?? 'morning';
      if (policyStories.some((story) => story.event === event) && !state.trip) {
        state.eventQueue.splice(state.eventQueue.indexOf(id), 1);
        state.day.deliveries.push({ eventId: id, channel });
        continue;
      }
      if (state.trip && channel === 'morning') {
        // A town-set morning card does not happen while the player is abroad;
        // it goes back to the pool and may be drawn in a later quarter.
        state.eventQueue.splice(state.eventQueue.indexOf(id), 1);
        continue;
      }
      if (state.trip && channel !== 'phone') {
        setFlags(state, [`travel-deferred:${id}`]);
        continue;
      }
      const hours = channel.startsWith('place:')
        ? places.find((p) => p.id === channel.slice(6))?.hours
        : undefined;
      const window = timeWindow(
        event,
        channel === 'phone' ? b.phoneStart : (hours?.opens ?? b.wakeMinute),
        channel === 'phone'
          ? b.phoneEnd
          : hours
            ? hours.closes - 1
            : b.midnight,
      );
      const morning = channel === 'morning' || channel === 'letter';
      const remaining = ([0, 1, 2] as const).filter((i) => {
        const kind = (['workday', 'weekend', 'special'] as const)[i];
        return (
          i >= index &&
          (!hours?.dayKinds || hours.dayKinds.includes(kind)) &&
          matches(
            {
              ...state,
              day: {
                ...state.day,
                kind,
                festival: i === 2 ? special.festival : undefined,
              },
            },
            event.when?.filter((c) => dayCondition(c) && !('weather' in c)),
          )
        );
      });
      const possible =
        window.start <= window.end &&
        (!morning ||
          (window.start <= b.wakeMinute && b.wakeMinute <= window.end));
      if (!possible || !remaining.length) {
        state.eventQueue.splice(state.eventQueue.indexOf(id), 1);
        state.flags = state.flags.filter((f) => f !== `travel-deferred:${id}`);
        continue;
      }
      const today =
        remaining.includes(index) &&
        matches(state, event.when?.filter(dayCondition));
      if (!today) {
        if (index === 2)
          state.eventQueue.splice(state.eventQueue.indexOf(id), 1);
        continue;
      }
      const deferred = state.flags.includes(`travel-deferred:${id}`);
      if (
        !deferred &&
        !event.when?.some((c) => 'weather' in c) &&
        remaining.length > 1 &&
        random(state) >= 1 / remaining.length
      )
        continue;
      state.eventQueue.splice(state.eventQueue.indexOf(id), 1);
      state.flags = state.flags.filter((f) => f !== `travel-deferred:${id}`);
      state.day.deliveries.push({
        eventId: id,
        channel,
        ...(channel === 'phone' && {
          minute:
            window.start +
            Math.floor(random(state) * (window.end - window.start + 1)),
        }),
      });
    }
    if (state.dayNumber === 0) {
      const opening = characterOf(state.characterId).opening;
      state.day.deliveries.unshift({ eventId: opening.id, channel: 'morning' });
    }
    nextEvent(state);
  }
  function ready(state: GameState, place?: PlaceId, minutes = 0) {
    if (state.pendingEvent || state.trip || isOver(state))
      throw new Error('Finish the pending event or journey first');
    if (
      state.day.minute + minutes >
      (place ? closingTime(state, place) : b.midnight)
    )
      throw new Error('There is not enough time today');
    if (place && (state.day.place !== place || !isOpen(state, place)))
      throw new Error(`Go to the open ${place} first`);
  }
  function advanceClock(state: GameState, minutes: number): GameState {
    const target = Math.min(
      b.midnight,
      state.day.minute + Math.max(0, Math.floor(minutes)),
    );
    const phone = state.day.deliveries
      .filter(
        (d) => d.channel === 'phone' && (d.minute ?? b.phoneStart) <= target,
      )
      .filter((d) => {
        const event = pool(state).find((e) => e.id === d.eventId);
        return (
          event &&
          available(
            {
              ...state,
              day: {
                ...state.day,
                minute: Math.max(state.day.minute, d.minute ?? b.phoneStart),
              },
            },
            event,
          )
        );
      })
      .sort(
        (a, c) => (a.minute ?? b.phoneStart) - (c.minute ?? b.phoneStart),
      )[0];
    state.day.minute =
      !state.pendingEvent && phone
        ? Math.max(state.day.minute, phone.minute ?? b.phoneStart)
        : target;
    if (state.day.minute < target) state.day.resumeMinute = target;
    pressure(state);
    nextEvent(state);
    if (state.day.minute === b.midnight) {
      if (!state.day.done.includes('midnight')) {
        applyEffects(state, [
          { type: 'stat', key: 'mood', delta: b.midnightMood },
        ]);
        state.day.done.push('midnight');
      }
      state.day.place = home;
      return state.pendingEvent ? state : sleep(state);
    }
    return state;
  }
  function tick(state: GameState, minutes: number): GameState {
    if (state.pendingEvent || isOver(state) || state.trip) return state;
    return advanceClock(structuredClone(state), minutes);
  }
  function enter(state: GameState, place: PlaceId): GameState {
    if (state.pendingEvent || state.trip || isOver(state)) return state;
    const next = structuredClone(state);
    next.day.place = place;
    if (place === home && state.day.place !== home)
      next.day.done.push('returned-home');
    if (place !== home || next.day.done.includes('returned-home'))
      deliver(next, `place:${place}`);
    return next;
  }
  /** The client calls this only after walking within interaction range of an anchor. */
  function approachSurprise(state: GameState, anchor: AnchorId): GameState {
    const event = pack.surpriseAt?.(state, anchor);
    if (!event) return state;
    const next = structuredClone(state);
    makePending(next, event.id);
    return next;
  }
  function mailbox(state: GameState): string[] {
    if (state.trip) return [];
    return state.day.deliveries
      .filter((d) => d.channel === 'letter')
      .map((d) => d.eventId);
  }
  function readMail(state: GameState): GameState {
    if (state.pendingEvent || state.trip || isOver(state)) return state;
    const next = structuredClone(state);
    deliver(next, 'letter');
    return next;
  }
  function grow(state: GameState) {
    for (const plot of state.plots)
      if (plot.seed)
        plot.growth +=
          b.growthPerDay +
          (plot.wateredOn === state.dayNumber || state.day.weather === 'rain'
            ? b.wateredGrowth
            : 0);
    state.dayNumber++;
  }
  function sleepDay(state: GameState): GameState {
    if (state.pendingEvent || isOver(state)) return state;
    const next = structuredClone(state);
    deliver(next, 'leftovers');
    if (next.pendingEvent) return next;
    if (next.trip) {
      for (const delivery of next.day.deliveries) {
        if (!next.eventQueue.includes(delivery.eventId))
          next.eventQueue.push(delivery.eventId);
        setFlags(next, [`travel-deferred:${delivery.eventId}`]);
      }
    }
    // Missed windows return to the pool without being marked as fired.
    next.day.deliveries = [];
    applyEffects(next, [
      {
        type: 'stat',
        key: 'health',
        delta: next.day.minute < b.earlyBed ? b.earlySleepHealth : 0,
      },
      {
        type: 'stat',
        key: 'mood',
        delta: next.day.minute >= b.lateBed ? b.lateSleepMood : 0,
      },
    ]);
    grow(next);
    next.outcome = {
      kind: 'sleep',
      text: {
        zhCN: '窗外安静下来，明天的茶杯已经摆好。',
        en: 'Outside falls quiet. Tomorrow’s cup is ready.',
      },
      statDeltas: deltas(state, next),
    };
    if (state.day.index === 2) return endQuarter(next);
    beginDay(next, (state.day.index + 1) as DayState['index']);
    return next;
  }
  function sleep(state: GameState): GameState {
    const next = sleepDay(state);
    return next.trip ? continueTrip(next) : next;
  }
  function recordReturn(state: GameState) {
    if (!state.trip || state.date < state.trip.to) return false;
    const trip = state.trip;
    delete state.trip;
    pack.rules.recordAbsence?.(state, trip);
    setFlags(state, ['quarter-returned']);
    state.outcome = {
      kind: 'travel',
      text: {
        zhCN: '行李箱又滚回了门口，旅途写进了日记。',
        en: 'The suitcase rolls home, and the journey goes into the diary.',
      },
    };
    return true;
  }
  function continueTrip(state: GameState): GameState {
    let next = state;
    while (next.trip && !isOver(next)) {
      if (next.date >= next.trip.to) {
        recordReturn(next);
        recalculate(next);
        return next;
      }
      if (next.pendingEvent) return next;
      next = sleepDay(next);
    }
    return next;
  }
  function fastForward(state: GameState): GameState {
    if (state.pendingEvent || isOver(state)) return state;
    if (state.trip) return continueTrip(structuredClone(state));
    const date = state.date;
    let next = structuredClone(state);
    const routine = (id: string, place: PlaceId, minute: number) => {
      if (next.day.done.includes(id) || next.day.done.includes(`auto-${id}`))
        return;
      if (next.day.minute < minute) next = tick(next, minute - next.day.minute);
      if (next.pendingEvent || isOver(next) || next.date !== date) return;
      next = enter(next, place);
      if (next.pendingEvent) return;
      if (activities(next, place).some((a) => a.id === id))
        next = doActivity(next, id);
      else next.day.done.push(`auto-${id}`);
    };
    while (next.date === date && !isOver(next) && !next.pendingEvent) {
      pack.routine?.(() => next, routine);
      if (next.pendingEvent || isOver(next) || next.date !== date) break;
      if (next.day.minute < 1260) next = tick(next, 1260 - next.day.minute);
      if (next.pendingEvent || next.date !== date) break;
      // Finish the quarter’s ordinary routines before opening any extra post.
      // If the drawn scenes needed a visit we missed, read a home or letter scene.
      const read = next.log.filter(
        (entry) =>
          entry.kind === 'event' &&
          entry.year === next.year &&
          entry.quarter === next.quarter &&
          !pool(next).find((event) => event.id === entry.id)?.heart,
      ).length;
      if (next.day.index === 2 && read < b.routineEventCards) {
        const letters = [
          ...commonEvents,
          ...characterOf(next.characterId).events,
        ].filter(
          (event) =>
            event.once &&
            event.choices.every((choice) =>
              (choice.effects as TownEffect[]).every(
                (effect) =>
                  effect.type === 'stat' ||
                  effect.type === 'none' ||
                  (effect.type === 'money' &&
                    Math.abs(effect.delta) <= b.routineEventMoneyLimit),
              ),
            ) &&
            available(next, event) &&
            (!event.channel || ['morning', 'letter'].includes(event.channel)) &&
            !next.eventQueue.includes(event.id) &&
            !next.day.deliveries.some(
              (delivery) => delivery.eventId === event.id,
            ),
        );
        if (letters.length) {
          const letter = letters[Math.floor(random(next) * letters.length)];
          next.day.deliveries.push({
            eventId: letter.id,
            channel: letter.channel ?? 'morning',
          });
          deliver(next, 'leftovers');
          if (next.pendingEvent) break;
        }
      }
      if (next.pendingEvent || next.date !== date) break;
      next = sleep(next);
    }
    return next;
  }
  function townsfolk(state: GameState): Npc[] {
    // A character module can add its own household members to the roster.
    const character = characterOf(state.characterId);
    return npcs.filter(
      (npc) =>
        (!npc.characters || npc.characters.includes(character.id)) &&
        pack.npcAvailable?.(state, npc) !== false,
    );
  }
  function npcOf(state: GameState, id: string) {
    const npc = townsfolk(state).find((npc) => npc.id === id);
    if (!npc) throw new Error(`Unknown townsperson: ${id}`);
    return npc;
  }
  function npcAt(state: GameState, npc: string): NpcLocation {
    const person = npcOf(state, npc);
    const rule = person.schedule.find(
      (r) =>
        (!r.dayKinds || r.dayKinds.includes(state.day.kind)) &&
        (!r.weather || r.weather.includes(state.day.weather)) &&
        (r.festival === undefined || r.festival === !!state.day.festival) &&
        matches(state, r.when),
    )!;
    return [...rule.stops].reverse().find((s) => s.from <= state.day.minute)!
      .at;
  }
  function peopleAt(state: GameState, place: PlaceId): string[] {
    return townsfolk(state)
      .filter((npc) => npcAt(state, npc.id) === place)
      .map((npc) => npc.id);
  }
  function hearts(state: GameState, npc: string): number {
    return Math.floor((state.friendship[npc] ?? 0) / 100);
  }
  function talk(state: GameState, npc: string): GameState {
    ready(state, undefined, b.minutes.talk);
    const person = npcOf(state, npc);
    const next = structuredClone(state);
    if (!next.day.talked.includes(npc)) {
      applyEffects(next, [
        { type: 'friendship', npc, delta: b.talkFriendship },
        { type: 'stat', key: 'mood', delta: b.talkMood },
      ]);
      next.day.talked.push(npc);
      setFlags(next, [`quarter-talked-${npc}`]);
      setFlags(next, [`talked-${npc}`]);
    }
    const eligible = person.lines.filter(
      (line) =>
        pack.lineAvailable?.(next, npc, line) !== false &&
        (line.heartsMin === undefined || hearts(next, npc) >= line.heartsMin) &&
        (line.heartsMax === undefined || hearts(next, npc) <= line.heartsMax) &&
        (!line.season || line.season === next.quarter) &&
        (!line.weather || line.weather.includes(next.day.weather)) &&
        (!line.dayKinds || line.dayKinds.includes(next.day.kind)) &&
        (!line.festival || line.festival === next.day.festival) &&
        (line.requires ?? []).every((f) => next.flags.includes(f)) &&
        !(line.forbids ?? []).some((f) => next.flags.includes(f)) &&
        (!line.once || !next.heard.includes(line.id)) &&
        matches(next, line.when),
    );
    const introduction = !state.flags.includes(`talked-${npc}`)
      ? eligible.find((line) => line.id === `${npc}-intro`)
      : undefined;
    const ordinary = eligible.filter((line) => line.id !== `${npc}-intro`);
    const fresh = ordinary.filter((line) => !next.heard.includes(line.id));
    const festivalLines = fresh.filter(
      (line) =>
        line.festival === next.day.festival && line.festival !== undefined,
    );
    const recentLines = fresh.filter((line) =>
      line.id.startsWith(`${npc}-recent-`),
    );
    const options = festivalLines.length
      ? festivalLines
      : recentLines.length
        ? recentLines
        : fresh.length
          ? fresh
          : ordinary;
    const line =
      pack.priorityLine?.(next, eligible, tools) ??
      introduction ??
      options[Math.floor(random(next) * options.length)];
    if (line && !next.heard.includes(line.id)) next.heard.push(line.id);
    next.outcome = {
      kind: 'talk',
      npc,
      text: line?.text,
      statDeltas: deltas(state, next),
    };
    deliver(next, `npc:${npc}`);
    if (
      !next.pendingEvent &&
      !next.day.festival &&
      !next.day.done.includes('heart-scene')
    ) {
      const heart = heartEvents.find(
        (event) =>
          event.heart!.npc === npc &&
          hearts(next, npc) >= event.heart!.hearts &&
          (event.heart!.hearts === 2 ||
            next.firedEvents.includes(
              `heart-${npc}-${event.heart!.hearts - 2}`,
            )) &&
          available(next, event),
      );
      if (heart && makePending(next, heart.id))
        next.day.done.push('heart-scene');
    }
    award(next, true);
    return advanceClock(next, b.minutes.talk);
  }
  function gift(state: GameState, npc: string, item: ItemId): GameState {
    ready(state, undefined, b.minutes.gift);
    const person = npcOf(state, npc);
    if (state.day.gifted.includes(npc) || !(state.inventory[item] > 0))
      throw new Error('Gift is not available');
    const next = structuredClone(state);
    const liking = person.gifts.loved.includes(item)
      ? 'loved'
      : person.gifts.liked.includes(item)
        ? 'liked'
        : person.gifts.disliked.includes(item)
          ? 'disliked'
          : 'neutral';
    applyEffects(next, [
      { type: 'item', item, delta: -1 },
      { type: 'friendship', npc, delta: b.gifts[liking] },
    ]);
    next.day.gifted.push(npc);
    if (liking === 'loved') recordLife(next, 'loved-gift', person.name);
    next.outcome = {
      kind: 'gift',
      npc,
      text: person.reactions[liking],
      items: { [item]: -1 },
    };
    award(next, true);
    return advanceClock(next, b.minutes.gift);
  }
  function shop(state: GameState, place: PlaceId) {
    if (
      state.pendingEvent ||
      state.trip ||
      isOver(state) ||
      !isOpen(state, place) ||
      state.day.minute + b.minutes.buy > closingTime(state, place)
    )
      return [];
    return pack.shopStock?.(state, place) ?? [];
  }
  function buy(state: GameState, item: ItemId, qty: number): GameState {
    ready(state, state.day.place, b.minutes.buy);
    const goods =
      state.day.place &&
      shop(state, state.day.place).find((i) => i.id === item);
    if (
      !goods ||
      !Number.isInteger(qty) ||
      qty <= 0 ||
      state.stats.money < goods.price! * qty
    )
      throw new Error('Purchase is not available');
    const next = structuredClone(state);
    if (
      applyEffects(next, [
        { type: 'money', delta: -goods.price! * qty },
        { type: 'item', item, delta: qty },
      ])
    )
      recalculate(next);
    next.outcome = {
      kind: 'buy',
      text: goods.name,
      items: { [item]: qty },
      statDeltas: deltas(state, next),
    };
    return advanceClock(next, b.minutes.buy);
  }
  /** Minimum playable days to maturity with watering or rain each night. */
  function cropDaysToMaturity(growthNeeded: number): number {
    return Math.max(
      0,
      Math.ceil(growthNeeded / (b.growthPerDay + b.wateredGrowth)),
    );
  }

  function plant(state: GameState, plot: number, seed: ItemId): GameState {
    ready(state, allotmentPlace, b.minutes.plant);
    const grows = items.find((i) => i.id === seed)?.grows;
    if (
      !state.plots[plot] ||
      state.plots[plot].seed ||
      !grows?.seasons.includes(state.quarter) ||
      !(state.inventory[seed] > 0)
    )
      throw new Error('Planting is not available');
    const next = structuredClone(state);
    next.plots[plot] = { seed, growth: 0 };
    applyEffects(next, [{ type: 'item', item: seed, delta: -1 }]);
    next.outcome = {
      kind: 'activity',
      text: {
        zhCN: '种子埋好，土轻轻拍平了。',
        en: 'Seeds tucked in, soil patted down.',
      },
      items: { [seed]: -1 },
    };
    return advanceClock(next, b.minutes.plant);
  }
  function water(state: GameState, plot: number): GameState {
    ready(state, allotmentPlace, b.minutes.water);
    if (
      !state.plots[plot]?.seed ||
      state.plots[plot].wateredOn === state.dayNumber
    )
      throw new Error('Watering is not available');
    const next = structuredClone(state);
    next.plots[plot].wateredOn = state.dayNumber;
    next.outcome = {
      kind: 'activity',
      text: {
        zhCN: '水落进土里，小屋的水壶轻了一点。',
        en: 'Water sinks into the soil; the can feels lighter.',
      },
    };
    return advanceClock(next, b.minutes.water);
  }
  function harvest(state: GameState, plot: number): GameState {
    ready(state, allotmentPlace, b.minutes.harvest);
    const planted = state.plots[plot];
    const grows = items.find((i) => i.id === planted?.seed)?.grows;
    if (!grows || planted.growth < grows.days)
      throw new Error('Harvest is not ready');
    const next = structuredClone(state);
    const qty =
      b.harvestMin +
      Math.floor(random(next) * (b.harvestMax - b.harvestMin + 1));
    applyEffects(next, [{ type: 'item', item: grows.crop, delta: qty }]);
    const prefix = `quarter-harvest:${grows.crop}:`;
    const previous = next.flags.find((f) => f.startsWith(prefix));
    const total = (previous ? Number(previous.split(':')[2]) : 0) + qty;
    next.flags = next.flags.filter((f) => !f.startsWith(prefix));
    setFlags(next, [`${prefix}${total}`]);
    next.plots[plot] = { growth: 0 };
    next.outcome = { kind: 'harvest', items: { [grows.crop]: qty } };
    recordItem(next, 'harvests', grows.crop);
    recordLife(next, 'harvest', items.find((i) => i.id === grows.crop)!.name);
    award(next, true);
    return advanceClock(next, b.minutes.harvest);
  }
  function fish(state: GameState, caught: boolean): GameState {
    ready(state, fishingPlace, b.minutes.fish);
    const next = structuredClone(state);
    recordLife(
      next,
      'fishing',
      fishingPlace === 'pond' || pack.fishingSpot
        ? { zhCN: `在${fishingSpot.zhCN}抛竿`, en: `Cast at ${fishingSpot.en}` }
        : { zhCN: '抛竿钓鱼', en: 'Cast a fishing line' },
    );
    if (!caught) {
      next.outcome = {
        kind: 'catch',
        text: {
          zhCN: '浮标晃了晃，鱼先回家了。',
          en: 'The float wobbles. The fish heads home first.',
        },
      };
    } else {
      const catchResult = pack.catchItem?.(next, tools);
      if (!catchResult) throw new Error('Fishing is not available');
      const { item, junk } = catchResult;
      applyEffects(next, [{ type: 'item', item, delta: 1 }]);
      if (!junk) {
        recordItem(next, 'fish', item, {
          place: fishingPlace,
          weather: next.day.weather,
        });
        recordLife(next, 'catch-fish', items.find((i) => i.id === item)!.name);
      }
      next.outcome = {
        kind: 'catch',
        text: items.find((i) => i.id === item)!.name,
        items: { [item]: 1 },
      };
    }
    award(next, true);
    return advanceClock(next, b.minutes.fish);
  }
  function cook(state: GameState, recipe: string): GameState {
    ready(state, home);
    const dish = recipes.find((r) => r.id === recipe);
    if (
      !dish ||
      Object.entries(dish.needs).some(
        ([item, qty]) => (state.inventory[item] ?? 0) < qty,
      )
    )
      throw new Error('Ingredients are missing');
    ready(state, home, dish.minutes);
    const next = structuredClone(state);
    const changes: Record<string, number> = Object.fromEntries([
      ...Object.entries(dish.needs).map(([item, qty]) => [item, -qty]),
      [dish.makes, 1],
    ]);
    applyEffects(
      next,
      Object.entries(changes).map(([item, delta]) => ({
        type: 'item',
        item,
        delta,
      })),
    );
    next.outcome = { kind: 'cook', text: dish.label, items: changes };
    recordItem(next, 'dishes', dish.makes, {
      place: home,
      weather: next.day.weather,
    });
    return advanceClock(next, dish.minutes);
  }
  function eat(state: GameState, item: ItemId): GameState {
    ready(state, undefined, b.minutes.eat);
    const food = items.find((i) => i.id === item);
    if (!food?.edible || !(state.inventory[item] > 0))
      throw new Error('Food is not available');
    const next = structuredClone(state);
    applyEffects(next, [
      { type: 'item', item, delta: -1 },
      ...Object.entries(food.edible).map(([key, delta]): Effect => ({
        type: 'stat',
        key,
        delta,
      })),
    ]);
    next.outcome = {
      kind: 'eat',
      text: food.name,
      items: { [item]: -1 },
      statDeltas: deltas(state, next),
    };
    return advanceClock(next, b.minutes.eat);
  }

  return {
    newGame,
    activities,
    doActivity,
    enter,
    approachSurprise,
    tick,
    talk,
    gift,
    buy,
    plant,
    cropDaysToMaturity,
    water,
    harvest,
    fish,
    cook,
    eat,
    readMail,
    sleep,
    fastForward,
    mailbox,
    shop,
    townsfolk,
    npcAt,
    peopleAt,
    hearts,
    currentEvent,
    resolve,
    endQuarter,
    progress,
    isOver,
    narrative,
    visaMonthsLeft,
  };
}
