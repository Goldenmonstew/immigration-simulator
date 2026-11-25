import {
  evaluateUnitedStatesFull,
  type UsFullResult,
} from '@uk-immigration/engine';
import { addDays, addMonths, firstWeekday } from '../../calendar';
import type { GameTools } from '../../content-pack';
import type {
  Achievement,
  Activity,
  EndingId,
  IsoDate,
  LogEntry,
  Outcome,
  PlaceId,
  Text,
} from '../../model';
import { usBalance as b } from './balance';
import { usCharacters } from './characters';
import {
  feeSource,
  fees,
  filingDay,
  pathwayOf,
  usRequest,
  values,
  type UsEffect,
  type UsFestival,
  type UsState,
  type UsTimeline,
} from './rules';
import {
  festivalActions,
  festivalFoods,
  interviewNote,
  renewalNote,
  usd,
  usFish,
  usItems,
  usNotices,
  usPlaces,
} from './town';

type UsTools = GameTools<UsTimeline, UsFullResult, UsEffect, UsFestival>;
type UsActivity = Activity<UsEffect, UsFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

export const characterOf = (id: string) => {
  const character = usCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

// Customary dates, not policy (see usFestivals).
const festivalDays: Record<UsFestival, string> = {
  'polar-plunge': '01-01',
  'cinco-de-mayo': '05-05',
  'fourth-of-july': '07-04',
  halloween: '10-31',
};
const quarterFestival: Record<1 | 2 | 3 | 4, UsFestival> = {
  1: 'polar-plunge',
  2: 'cinco-de-mayo',
  3: 'fourth-of-july',
  4: 'halloween',
};
export function calendar(state: UsState) {
  const festival = quarterFestival[state.quarter];
  const end = addMonths(state.date, b.monthsPerQuarter);
  for (
    let year = Number(state.date.slice(0, 4));
    year <= Number(end.slice(0, 4));
    year++
  ) {
    const date: IsoDate = `${year}-${festivalDays[festival]}`;
    if (date >= state.date && date < end) return { date, festival };
  }
  return { date: addDays(end, -1), festival };
}

const festivalResults: Record<UsFestival, Text> = {
  'polar-plunge': t(
    '湖水冷得你叫出了声，三秒后你已经跑回岸上。有人递来毛巾和一杯热可可，所有人都在笑。',
    'The water is so cold you yell, and three seconds later you are back on shore. Someone hands you a towel and a hot cocoa; everyone is laughing.',
  ),
  'cinco-de-mayo': t(
    '多洛蕾斯奶奶拉着你的手转了三圈，小号吹得震天响。烤玉米上的辣椒粉蹭了你一脸。',
    'Grandma Dolores spins you three times while the trumpets blare. Chili powder from the elote ends up all over your face.',
  ),
  'fourth-of-july': t(
    '第一朵烟火在湖面上炸开，整片草坪都“哇”了一声。杰登趴在毯子上数颜色，数到一半就睡着了。',
    'The first firework bursts over the lake and the whole lawn goes “ooh.” Jayden counts colors on the blanket and falls asleep halfway.',
  ),
  halloween: t(
    '一只小恐龙、两个宇航员和一个乔治·华盛顿排着队来敲门。你的糖碗一个小时就见底了。',
    'A little dinosaur, two astronauts and one George Washington line up at the door. Your candy bowl is empty within the hour.',
  ),
};

/** The conditional card still needs its I-751 (once filed, it is pending). */
const conditional = (state: UsState) =>
  state.timeline.conditional !== 'none' && !state.timeline.filed.i751;

/** Whether an I-751 mailed on a date is within its window, as the engine judges. */
const i751OpenOn = (state: UsState, date: IsoDate) =>
  evaluateUnitedStatesFull(
    usRequest(state.timeline, 'US-CONDITIONS', filingDay(date), state.locale),
  ).columns[0].pathways[0].status === 'MET';
const i751OpenToday = (state: UsState) => i751OpenOn(state, state.day.date);

const visaHours = usPlaces.find((place) => place.id === 'visa')!.hours!;
/** A quarter's workday, as the shared day plan sets it (game.ts beginDay). */
export const workdayOf = (quarterStart: IsoDate) =>
  firstWeekday(addDays(quarterStart, 7), 2);

/**
 * Whether a trip home would keep a conditional resident away on every day the
 * I-751 can still go in. The Federal Building opens on the quarter's workday,
 * and a trip lasts until the first quarter that starts on or after the return
 * (game.ts continueTrip), so the skipped days are today's workday, if the
 * counter is still open, and the workdays of the quarters in between.
 */
export function tripSkipsI751(state: UsState, months: number): boolean {
  if (!conditional(state)) return false;
  const back = addMonths(state.day.date, months);
  const skipped: IsoDate[] = [];
  if (
    state.day.kind === 'workday' &&
    state.day.minute + b.minutes.paperwork <= visaHours.closes
  )
    skipped.push(state.day.date);
  for (
    let start = addMonths(state.date, b.monthsPerQuarter);
    start < back;
    start = addMonths(start, b.monthsPerQuarter)
  )
    skipped.push(workdayOf(start));
  return skipped.some((date) => i751OpenOn(state, date));
}

/**
 * Approval waits only on the I-751, which USCIS has not decided: the game does
 * not simulate that decision, so the oath opens with a note, as Japan's
 * permanent residence opens when only the longest period is pending.
 */
function onlyI751Pending(state: UsState) {
  const pathway = pathwayOf(state.result, 'cit');
  const filed = state.timeline.filed.i751;
  return (
    !!filed &&
    filed <= filingDay(state.date) &&
    pathway?.approvalStatus === 'UNKNOWN' &&
    pathway.checks.every(
      (check) =>
        check.applicable === false ||
        check.informational ||
        check.status === 'MET' ||
        check.id === 'US-C02-LAWFUL-LPR',
    )
  );
}

const extendFee = (state: UsState) =>
  conditional(state) ? fees.i751.paper : fees.i90.paper;

/**
 * Whether the online AR-11 still fits into today after an action. Play skips
 * ahead between days, so the next playable day may fall outside the reporting
 * period.
 */
const reportableToday = (state: UsState, minutes: number) =>
  state.day.minute + minutes + b.minutes.board <= b.midnight;

export function actionAvailable(
  state: UsState,
  action: UsActivity,
  { affordable }: UsTools,
): boolean | undefined {
  const flags = state.flags;
  if (action.id.startsWith('travel-'))
    return (
      !tripSkipsI751(state, Number(action.id.slice('travel-'.length))) &&
      affordable(state, action.effects)
    );
  if (action.id === 'rent-brighter-home' || action.id === 'leave-brighter-home')
    return (
      reportableToday(state, action.minutes) &&
      affordable(state, action.effects)
    );
  if (action.id === 'extend')
    return (
      !flags.includes('quarter-visa-renewed') &&
      (state.timeline.conditional !== 'none'
        ? conditional(state) && i751OpenToday(state)
        : !state.timeline.filed.i90 &&
          state.day.date >=
            addMonths(
              state.timeline.travel.cardExpiresOn,
              -values.address.value.renewalMonths,
            )) &&
      state.stats.money >= extendFee(state)
    );
  if (action.id === 'n400')
    return (
      pathwayOf(state.result, 'cit')?.status === 'MET' &&
      !flags.includes('n400-filed') &&
      state.stats.money >= fees.n400.paper
    );
  if (action.id === 'interview')
    return (
      flags.includes('n400-filed') &&
      !flags.includes('interview-passed') &&
      !flags.includes('quarter-n400-filed') &&
      !flags.includes('quarter-interview')
    );
  if (action.id === 'oath')
    return (
      flags.includes('interview-passed') &&
      (pathwayOf(state.result, 'cit')?.approvalStatus === 'MET' ||
        onlyI751Pending(state))
    );
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < b.classFromMinute
  )
    return false;
}

export function actionDetails(state: UsState, action: UsActivity): void {
  if (action.id === 'extend') {
    const fee = extendFee(state);
    if (conditional(state)) {
      action.label = t(
        `在邮局窗口寄出 I-751（纸本费用 ${usd(fee)}，${feeSource}）`,
        `Mail Form I-751 at the post office counter (paper fee ${usd(fee)}, ${feeSource})`,
      );
      action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
    } else {
      action.label = t(
        `在邮局窗口寄出 I-90 换发绿卡（纸本费用 ${usd(fee)}，${feeSource}）`,
        `Mail Form I-90 to renew your green card (paper fee ${usd(fee)}, ${feeSource})`,
      );
      action.note = renewalNote;
      action.effects = [{ type: 'money', delta: -fee }, { type: 'i90' }];
    }
  }
  if (action.id === 'n400') {
    const fee = fees.n400.paper;
    action.label = t(
      `在邮局窗口寄出入籍申请 N-400（纸本费用 ${usd(fee)}，${feeSource}）`,
      `Mail the N-400 naturalization application (paper fee ${usd(fee)}, ${feeSource})`,
    );
    action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
  }
  if (action.id.startsWith('travel-') && conditional(state))
    action.note = t(
      `${action.note?.zhCN ?? ''}I-751 寄出之前，会错过所有还能寄 I-751 的工作日的行程不提供。`,
      `${action.note?.en ?? ''} Until the I-751 is mailed, trips that would miss every workday it can still go in are not offered.`,
    );
  if (action.id === 'oath' && onlyI751Pending(state)) {
    action.label = t(
      '参加入籍宣誓典礼（I-751 待 USCIS 裁定）',
      'Take the Oath of Allegiance (I-751 awaiting USCIS)',
    );
    action.note = t(
      '入籍核准只差一项：USCIS 尚未裁定取消条件的 I-751，评估显示待确认（PD-274）。游戏不模拟这次裁定，宣誓照常举行；现实中除适用例外外，USCIS 须先处理 I-751 才核准 N-400。',
      'Only one approval item is open: USCIS has not decided the I-751 to remove conditions, so the assessment shows it as undetermined (PD-274). The game does not simulate that decision and holds the oath anyway; in reality USCIS must resolve the conditions before approving the N-400 unless an exception applies.',
    );
  }
  if (action.id === 'interview') {
    if (state.stats.english >= b.interviewScore)
      action.effects = [{ type: 'interview' }];
    action.note = t(
      `游戏内英语·公民 ${state.stats.english} / ${b.interviewScore}。${interviewNote.zhCN}`,
      `In-game English and civics ${state.stats.english} / ${b.interviewScore}. ${interviewNote.en}`,
    );
  }
}

export function actionFlags(action: UsActivity): string[] | undefined {
  if (action.id === 'interview') return ['quarter-interview'];
}

export function afterAction(
  state: UsState,
  next: UsState & { outcome: Outcome },
  action: UsActivity,
  log: LogEntry,
  { applyEffects, setFlags }: UsTools,
): void {
  if (action.id === 'extend') {
    next.outcome.text = conditional(state)
      ? t(
          '邮局窗口的职员在信封上盖了邮戳，又把挂号回执递给你。接下来等 USCIS 的收件通知，再等他们的裁定。',
          'The clerk postmarks the envelope and hands you the tracking receipt. Next comes the USCIS receipt notice, and later their decision.',
        )
      : t(
          '换卡申请寄出了。收件通知会寄到家里，新卡什么时候来要等 USCIS 裁定。',
          'The renewal is in the mail. A receipt notice will come to your home; the new card waits on USCIS.',
        );
  }
  if (action.id === 'n400')
    next.outcome.text = t(
      '厚厚的信封滑进投递口。收件通知会寄到家里，面谈通知要再等一阵。',
      'The thick envelope slides into the slot. The receipt notice will come to your home; the interview notice takes a while longer.',
    );
  if (action.id === 'address-report')
    next.outcome.text = t(
      '在线提交完，屏幕上跳出一个确认号。你把截图存进了“绿卡”相册。',
      'Submitted online, the screen shows a confirmation number. You save the screenshot in your “green card” album.',
    );
  if (action.id === 'board') {
    const posted = usNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  const festival = next.day.festival;
  if (
    festival &&
    (action.id === 'festival' || festivalActions.includes(action.id))
  ) {
    setFlags(next, [`visited-festival:${festival}`]);
    if (action.id !== 'festival') {
      const food = festivalFoods[festival];
      applyEffects(next, [{ type: 'item', item: food, delta: 1 }]);
      next.outcome.items = { [food]: 1 };
      next.outcome.text = festivalResults[festival];
    }
  }
}

export function afterActionAwards(
  state: UsState,
  next: UsState & { outcome: Outcome },
  action: UsActivity,
  log: LogEntry,
): void {
  if (action.id !== 'interview') return;
  if (state.stats.english >= b.interviewScore)
    next.outcome.text = t(
      '考官合上文件夹，笑着说：“恭喜，你通过了英语和公民考试。”',
      'The officer closes the folder and smiles. “Congratulations, you passed English and civics.”',
    );
  else if (state.flags.includes('interview-retest')) {
    // A second failure denies the application (SRC-292, 12 USCIS-PM E.2(F)).
    next.flags = next.flags.filter(
      (flag) => flag !== 'n400-filed' && flag !== 'interview-retest',
    );
    delete next.timeline.filed.n400;
    next.outcome.text = t(
      `补考还是没过，这次的 N-400 被拒了。准备好以后可以重新递交（游戏内英语·公民 ${state.stats.english} / ${b.interviewScore}）。`,
      `The retest didn’t go your way, and this N-400 is denied. You can file again when you’re ready (in-game English and civics ${state.stats.english} / ${b.interviewScore}).`,
    );
  } else {
    next.flags.push('interview-retest');
    next.eventQueue.unshift('system-interview-failed');
    next.outcome.text = t(
      `这次面谈还差一点，补考安排在下一季（游戏内英语·公民 ${state.stats.english} / ${b.interviewScore}）。`,
      `Not quite this time; the retest is next quarter (in-game English and civics ${state.stats.english} / ${b.interviewScore}).`,
    );
  }
  log.text = next.outcome.text;
}

/**
 * The shared quarter end returns a short let the money cannot carry without a
 * move effect. The move back is queued for the first morning at home, so it
 * carries that day and the AR-11 can go in on it.
 */
export function afterQuarter(state: UsState): void {
  const ended = state.log.some(
    (entry) =>
      entry.id === 'brighter-home-return' &&
      entry.year === state.year &&
      entry.quarter === state.quarter,
  );
  if (ended) state.flags.push('lease-move-due');
  if (!state.flags.includes('lease-move-due') || state.trip) return;
  state.flags = state.flags.filter((flag) => flag !== 'lease-move-due');
  state.eventQueue.push('system-lease-ended');
}

export function shopStock(state: UsState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return usItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return usItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['coffee', 'cookies', 'hot-dog', 'apple-pie', 'flowers'].includes(
            item.id,
          )),
  );
}

export function catchItem(state: UsState, { random }: UsTools) {
  // Perch bite in the cool months, coho run in autumn, carp like the rain.
  const fish = usFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['carp', 'bluegill', 'perch']
      : state.quarter === 4
        ? ['perch', 'coho', 'carp']
        : state.quarter === 3
          ? ['bluegill', 'perch', 'carp']
          : ['perch', 'bluegill', 'carp'];
  const junk = random(state) < b.fishingJunkChance;
  const available = junk
    ? ['old-boot', 'shopping-trolley']
    : choices.filter((id) => fish.includes(id));
  return {
    item: available[Math.floor(random(state) * available.length)],
    junk,
  };
}

export function routine(
  state: () => UsState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.english < b.interviewScore &&
        state().stats.money >= b.classCost
          ? 'class'
          : state().stats.mood < b.routineMoodTarget
            ? 'relax'
            : 'bench';
      run(
        evening,
        evening === 'class' ? 'college' : evening === 'relax' ? 'pub' : 'bench',
        1080,
      );
      if (
        state().day.done.includes(evening) ||
        state().day.done.includes(`auto-${evening}`)
      )
        state().day.done.push('auto-evening');
    }
  } else if (state().day.kind === 'weekend') {
    run('rest', 'home', b.wakeMinute);
    if (state().pendingEvent) return;
    if (state().stats.health < b.routineHealthTarget) run('nap', 'home', 600);
    if (state().pendingEvent) return;
    if (state().stats.mood < b.routineMoodTarget) run('bench', 'bench', 660);
  } else run('festival', 'green', b.festivalStart);
}

export function endingText(state: UsState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    // The oath is the only way to settle in this town.
    settled: character.settlement,
    left: t(
      '行李箱合上，蓝线列车开往机场。你选择离开美国，这局生活到这里收好。',
      'The suitcase zips shut and the Blue Line heads for the airport. You chose to leave the United States, ending this game.',
    ),
    overstayed: t(
      '条件绿卡两周年之前没有递交 I-751，条件永久居民身份就此终止，这段湖湾生活在这里结束。\n下一局可以留意顶栏的剩余月数，窗口一开就去联邦大楼寄出 I-751。',
      'No I-751 was filed before the conditional card’s second anniversary, so conditional residence ended, and so does this game.\nNext time, watch the months left in the top bar and mail the I-751 from the Federal Building as soon as the window opens.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    // Flags are set when the N-400 or interview happens, before the quarter
    // ends with this ending.
    timeout: state.flags.includes('interview-passed')
      ? t(
          '面谈已经通过，宣誓典礼还没等到，这局就走到了时间尽头。湖湾的日记在这里合上。',
          'The interview is passed, but the oath ceremony has not come yet when this game reaches its time limit. The Lakebend diary closes here.',
        )
      : state.flags.includes('n400-filed')
        ? t(
            'N-400 已经寄出，入籍还在路上，这局就走到了时间尽头。湖湾的日记在这里合上。',
            'The N-400 is in the mail and citizenship is still on its way when this game reaches its time limit. The Lakebend diary closes here.',
          )
        : t(
            '入籍申请还躺在抽屉里。这局走到了时间尽头，湖湾的日记在这里合上。',
            'The naturalization papers are still in the drawer. This game has reached its time limit, and the Lakebend diary closes here.',
          ),
  };
  return texts[ending];
}

export function ledgerText(state: UsState): Text {
  return t(
    `银行账户最后是 ${usd(state.stats.money)}，还有没写进账本的牵挂。`,
    `The bank account ends at ${usd(state.stats.money)}, alongside things it cannot count.`,
  );
}

export const usAchievements: Achievement<
  UsTimeline,
  UsFullResult,
  UsFestival
>[] = [
  {
    id: 'us-plunge',
    name: t('跳进湖里', 'Into the lake'),
    description: t(
      '新年第一天跳过一次湖。',
      'Took the New Year’s polar plunge.',
    ),
    check: (state) => state.flags.includes('visited-festival:polar-plunge'),
  },
  {
    id: 'us-four-festivals',
    name: t('一整年的热闹', 'A year of block parties'),
    description: t(
      '新年跳湖、五月五日、独立日、万圣节都去过。',
      'Joined the polar plunge, Cinco de Mayo, the Fourth of July and Halloween.',
    ),
    check: (state) =>
      (
        [
          'polar-plunge',
          'cinco-de-mayo',
          'fourth-of-july',
          'halloween',
        ] as const
      ).every((festival) =>
        state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'us-interview',
    name: t('考过了', 'Passed the interview'),
    description: t(
      '通过入籍面谈的英语与公民考试。',
      'Passed the English and civics tests at the naturalization interview.',
    ),
    check: (state) => state.flags.includes('interview-passed'),
  },
  {
    id: 'us-new-card',
    name: t('信封寄出了', 'In the mail'),
    description: t(
      '寄出取消条件的 I-751，或换卡的 I-90。',
      'Mailed the I-751 to remove conditions, or the I-90 to renew the card.',
    ),
    check: (state) =>
      state.flags.includes('i751-filed') || state.flags.includes('i90-filed'),
  },
  {
    id: 'us-perch',
    name: t('防波堤的黄鲈', 'Perch off the pier'),
    description: t('在防波堤钓到黄鲈。', 'Caught a yellow perch off the pier.'),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'perch'),
  },
  {
    id: 'us-regular',
    name: t('酒馆的常客', 'A tavern regular'),
    description: t('和弗兰克成为老朋友。', 'Became good friends with Frank.'),
    check: (state) => (state.friendship.frank ?? 0) >= 500,
  },
];
