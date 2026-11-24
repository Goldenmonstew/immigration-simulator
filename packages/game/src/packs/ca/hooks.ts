import type { CaFullResult } from '@uk-immigration/engine';
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
import { caBalance as b } from './balance';
import { caCharacters } from './characters';
import {
  pathwayOf,
  readyToFile,
  type CaEffect,
  type CaFestival,
  type CaState,
  type CaTimeline,
} from './rules';
import { cad, caFish, caItems, caNotices, festivalFoods } from './town';

type CaTools = GameTools<CaTimeline, CaFullResult, CaEffect, CaFestival>;
type CaActivity = Activity<CaEffect, CaFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

export const characterOf = (id: string) => {
  const character = caCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

const monday = (after: IsoDate) => firstWeekday(after, 1);
// Customary dates, not policy (see caFestivals).
function festivalDate(festival: CaFestival, year: number): IsoDate {
  if (festival === 'heritage-day')
    return monday(monday(monday(`${year}-01-31`)));
  if (festival === 'victoria-day') return monday(`${year}-05-17`);
  if (festival === 'canada-day') return `${year}-07-01`;
  return monday(monday(`${year}-09-30`));
}
const quarterFestival: Record<1 | 2 | 3 | 4, CaFestival> = {
  1: 'heritage-day',
  2: 'victoria-day',
  3: 'canada-day',
  4: 'thanksgiving',
};
export function calendar(state: CaState) {
  const festival = quarterFestival[state.quarter];
  const end = addMonths(state.date, b.monthsPerQuarter);
  for (
    let year = Number(state.date.slice(0, 4));
    year <= Number(end.slice(0, 4));
    year++
  ) {
    const date = festivalDate(festival, year);
    if (date >= state.date && date < end) return { date, festival };
  }
  return { date: addDays(end, -1), festival };
}

const festivalActions: Record<CaFestival, string> = {
  'heritage-day': 'skate',
  'victoria-day': 'kite',
  'canada-day': 'fireworks',
  thanksgiving: 'potluck',
};
const festivalResults: Record<CaFestival, Text> = {
  'heritage-day': t(
    '你扶着利奥的肩膀绕了一整圈冰场。雪槽边，热枫糖浆在雪上凝成一根金色的太妃。',
    'You make a full lap of the rink holding Leo’s shoulder. At the snow trough, hot syrup sets into a golden stick of taffy.',
  ),
  'victoria-day': t(
    '你的风筝一下子被海风拽上了天，线轴在手里呼呼地转。龙虾卷的队伍排到了码头。',
    'The sea breeze snatches your kite straight up and the reel whirs in your hand. The lobster-roll queue reaches the wharf.',
  ),
  'canada-day': t(
    '第一朵烟花在港口上空炸开，所有船一起鸣笛。有人塞给你一块纳奈莫条。',
    'The first firework bursts over the harbour and every boat sounds its horn. Someone presses a Nanaimo bar into your hand.',
  ),
  thanksgiving: t(
    '长桌上摆满了各家的菜。多琳敲敲杯子，请每个人说一件今年感恩的事。',
    'The long table is crowded with everyone’s dishes. Doreen taps her glass and asks each person for one thing they’re thankful for this year.',
  ),
};

const citizenRoute = (state: CaState) =>
  state.timeline.goals[0] === 'CA-RESIDENCY';

export function actionAvailable(
  state: CaState,
  action: CaActivity,
  { affordable }: CaTools,
): boolean | undefined {
  const atlantic = state.timeline.atlantic;
  const flags = state.flags;
  switch (action.id) {
    case 'settle':
      return affordable(state, action.effects) && readyToFile(state);
    case 'apply-citizenship':
      return (
        !flags.includes('cit-applied') &&
        affordable(state, action.effects) &&
        readyToFile(state)
      );
    case 'cit-test':
      return !flags.includes('cit-test-passed');
    case 'permanent-post':
      return !atlantic?.offer;
    case 'settlement-plan':
      return !atlantic?.settlementPlanGivenToEmployer;
    case 'endorsement-request':
      // A new request once an endorsement has lapsed unused.
      return (
        !flags.includes('endorsement-requested') &&
        (!atlantic?.endorsement || atlantic.endorsement.expires < state.date)
      );
    case 'police-request':
      return !flags.includes('police-requested');
    case 'exam':
      // Retake once a result is no longer valid for filing (SRC-270).
      return (
        (!flags.includes('language-tested') ||
          pathwayOf(state.result, 'CA-AIP')?.checks.find(
            (check) => check.id === 'CA-R58',
          )?.status === 'NOT_MET') &&
        affordable(state, action.effects)
      );
    case 'tax-return':
      return (
        state.quarter === 2 &&
        state.timeline.residence?.taxYears?.[
          Number(state.date.slice(0, 4)) - 1
        ] !== 'filed'
      );
    case 'class':
      if (state.day.kind === 'workday' && state.day.minute < 1050) return false;
      return;
    case 'civics':
    case 'civics-home':
    case 'citizenship-class':
      return citizenRoute(state) && !flags.includes('cit-test-passed');
  }
}

export function actionDetails(state: CaState, action: CaActivity): void {
  if (action.id === 'exam') {
    if (state.stats.english >= b.englishTestScore)
      action.effects = [...action.effects, { type: 'languageTest' }];
    action.note = t(
      `游戏内英语 ${state.stats.english} / ${b.englishTestScore}。通过后按聘书岗位要求的等级记为 CLB 成绩（SRC-270 aip-language）。`,
      `In-game English ${state.stats.english} / ${b.englishTestScore}. A pass records CLB levels at what the offered job needs (SRC-270 aip-language).`,
    );
  }
  if (action.id === 'cit-test') {
    action.effects = [
      {
        type: 'citizenshipTest',
        passed: state.stats.civics >= b.civicsTestScore,
      },
    ];
    action.note = t(
      `游戏内公民知识 ${state.stats.civics} / ${b.civicsTestScore}。`,
      `In-game civics ${state.stats.civics} / ${b.civicsTestScore}.`,
    );
  }
}

export function actionFlags(action: CaActivity): string[] | undefined {
  if (action.id === 'endorsement-request')
    return ['endorsement-requested', 'quarter-endorsement-requested'];
  if (action.id === 'police-request')
    return ['police-requested', 'quarter-police-requested'];
  if (action.id === 'kitchen-party') return ['kitchen-party'];
}

export function afterAction(
  state: CaState,
  next: CaState & { outcome: Outcome },
  action: CaActivity,
  log: LogEntry,
  { applyEffects, setFlags }: CaTools,
): void {
  if (action.id === 'board') {
    const posted = caNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'permanent-post')
    next.outcome.text = t(
      '人事部的琳达把聘书推过来：长期全职，护理助理。「欢迎留下来。」',
      'Linda in HR slides the letter across: permanent, full-time, continuing care assistant. “Glad you’re staying.”',
    );
  if (action.id === 'settlement-plan')
    next.outcome.text = t(
      '法蒂玛把安家计划打印出来，上面列着英语课、驾照和家庭医生的去处。你把副本交给了医院人事部。',
      'Fatima prints your settlement plan: English classes, a driver’s licence, a family doctor. A copy goes to hospital HR.',
    );
  if (action.id === 'apply-citizenship')
    next.outcome.text = t(
      '你在申请表最后一页签了名，付完费，把回执拍照发给了妈妈。',
      'You sign the last page, pay the fees and send Mum a photo of the receipt.',
    );
  if (action.id === 'cit-test' && next.flags.includes('cit-test-passed'))
    next.outcome.text = t(
      '屏幕上跳出「通过」。考官和你握了握手：「仪式见。」',
      'The screen says “Pass”. The officer shakes your hand. “See you at the ceremony.”',
    );
  const festival = next.day.festival;
  if (
    festival &&
    (action.id === 'festival' || action.id === festivalActions[festival])
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
  state: CaState,
  next: CaState & { outcome: Outcome },
  action: CaActivity,
  log: LogEntry,
): void {
  if (action.id === 'exam') {
    if (state.stats.english >= b.englishTestScore) {
      next.outcome.text = t(
        'CELPIP 成绩出来了，四项都够。成绩单收进文件夹，和毕业证放在一起。',
        'The CELPIP results are in, and all four skills are enough. The report goes into the folder beside your diploma.',
      );
    } else {
      next.eventQueue.unshift('system-exam-failed');
      next.outcome.text = t(
        `英语考试还差一点（游戏内英语 ${state.stats.english} / ${b.englishTestScore}）。`,
        `Not quite there yet (in-game English ${state.stats.english} / ${b.englishTestScore}).`,
      );
    }
    log.text = next.outcome.text;
  }
  if (action.id === 'cit-test' && state.stats.civics < b.civicsTestScore) {
    next.eventQueue.unshift('system-test-failed');
    next.outcome.text = t(
      `入籍考试差几题（游戏内公民知识 ${state.stats.civics} / ${b.civicsTestScore}）。`,
      `A few questions short (in-game civics ${state.stats.civics} / ${b.civicsTestScore}).`,
    );
    log.text = next.outcome.text;
  }
}

/** Requests made last quarter come back by post at the start of this one. */
export function afterQuarter(state: CaState): void {
  const flags = state.flags;
  const letters: [boolean, string][] = [
    [flags.includes('endorsement-requested'), 'ca-endorsement-letter'],
    [
      flags.includes('police-requested') &&
        !flags.includes('police-certificate'),
      'ca-police-letter',
    ],
    [
      flags.includes('cit-applied') && !flags.includes('cit-test-invited'),
      'ca-test-invitation',
    ],
    [
      flags.includes('cit-test-passed') &&
        !flags.includes('cit-ceremony-invited'),
      'ca-ceremony-invitation',
    ],
  ];
  for (const [due, id] of letters)
    if (due && !state.eventQueue.includes(id)) state.eventQueue.push(id);
}

export function shopStock(state: CaState, place: PlaceId) {
  const stock = (ids: string[]) =>
    caItems.filter((item) => ids.includes(item.id));
  if (place === 'green' && state.day.festival)
    return stock([festivalFoods[state.day.festival]]);
  if (place === 'cafe') return stock(['double-double', 'maple-doughnut']);
  if (place === 'market')
    return stock(['oatcakes', 'blueberries', 'maple-syrup', 'flowers']);
  if (place !== 'shop') return [];
  return caItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['maple-doughnut', 'maple-syrup', 'flowers'].includes(item.id)),
  );
}

export function catchItem(state: CaState, { random }: CaTools) {
  // Mackerel school into the harbour in summer; flounder lie on the bottom
  // in the cold months; striped bass follow the tide in spring and summer.
  const fish = caFish.map(([id]) => id as string);
  const choices =
    state.quarter === 1
      ? ['flounder', 'pollock']
      : state.quarter === 3
        ? ['mackerel', 'striped-bass', 'pollock']
        : state.day.weather === 'rain'
          ? ['pollock', 'flounder']
          : ['mackerel', 'pollock', 'flounder', 'striped-bass'];
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
  state: () => CaState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const study =
        citizenRoute(state()) &&
        !state().flags.includes('cit-test-passed') &&
        state().stats.civics < b.civicsTestScore;
      const evening = study
        ? 'civics'
        : !citizenRoute(state()) &&
            state().stats.english < b.englishTestScore &&
            state().stats.money >= b.classCost
          ? 'class'
          : state().stats.mood < b.routineMoodTarget
            ? 'relax'
            : 'bench';
      run(
        evening,
        { civics: 'library', class: 'college', relax: 'pub', bench: 'bench' }[
          evening
        ]!,
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

export function endingText(state: CaState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    settled: character.settlement,
    left: t(
      '行李箱合上，渡轮最后一次驶过港口。你选择离开加拿大，这局生活到这里收好。',
      'The suitcase closes and the ferry crosses the harbour one last time. You chose to leave Canada, ending this game.',
    ),
    overstayed: t(
      '工作许可到期了，大西洋项目的申请还没递出去，这段枫港生活在这里结束。\n下一局可以留意顶栏的剩余月数，先把聘书、安家计划和担保办齐。',
      'Your work permit ended before the Atlantic application went in, ending this game.\nNext time, watch the months left in the top bar and line up the offer, settlement plan and endorsement first.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请表还在抽屉里。这局走到了时间尽头，枫港的日记在这里合上。',
      'The application is still in the drawer. This game has reached its time limit, and the Maple Harbour diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: CaState): Text {
  return t(
    `账户最后是 ${cad(state.stats.money)}，还有账户算不清的牵挂。`,
    `The account ends at ${cad(state.stats.money)}, alongside things it cannot count.`,
  );
}

export const caAchievements: Achievement<
  CaTimeline,
  CaFullResult,
  CaFestival
>[] = [
  {
    id: 'ca-skater',
    name: t('冰上的第一圈', 'First lap on the ice'),
    description: t(
      '在传统日的海滨冰场溜过冰。',
      'Skated the waterfront rink on Heritage Day.',
    ),
    check: (state) => state.flags.includes('visited-festival:heritage-day'),
  },
  {
    id: 'ca-four-festivals',
    name: t('四季的枫港', 'Maple Harbour in four seasons'),
    description: t(
      '传统日、维多利亚日、加拿大日、感恩节都去过。',
      'Joined Heritage Day, Victoria Day, Canada Day and Thanksgiving.',
    ),
    check: (state) =>
      (
        ['heritage-day', 'victoria-day', 'canada-day', 'thanksgiving'] as const
      ).every((festival) =>
        state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'ca-kitchen-party',
    name: t('跺脚的夜晚', 'A night of stomping'),
    description: t(
      '在咸海鸥的厨房派对上跳过舞。',
      'Danced at a Salty Gull kitchen party.',
    ),
    check: (state) => state.flags.includes('kitchen-party'),
  },
  {
    id: 'ca-striped-bass',
    name: t('追潮的条纹鲈', 'Striped bass on the tide'),
    description: t(
      '在钓鱼码头钓到条纹鲈。',
      'Caught a striped bass off the wharf.',
    ),
    check: (state) =>
      !!state.lifeRecords?.fish.some(
        (record) => record.itemId === 'striped-bass',
      ),
  },
  {
    id: 'ca-wharf-friend',
    name: t('码头老友', 'Friends on the wharf'),
    description: t('和格里成为老朋友。', 'Became good friends with Gerry.'),
    check: (state) => (state.friendship.gerry ?? 0) >= 500,
  },
  {
    id: 'ca-papers',
    name: t('文件夹装满了', 'A full folder'),
    description: t(
      '通过英语考试或入籍考试。',
      'Passed the English test or the citizenship test.',
    ),
    check: (state) =>
      state.flags.includes('language-tested') ||
      state.flags.includes('cit-test-passed'),
  },
];
