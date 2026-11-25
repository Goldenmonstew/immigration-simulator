import type { CountryResult } from '@uk-immigration/engine';
import { germanyFull2026_11 } from '@uk-immigration/policy-data';
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
import { deBalance as b } from './balance';
import { deCharacters } from './characters';
import {
  pathwayOf,
  officePending,
  type DeEffect,
  type DeFestival,
  type DeState,
  type DeTimeline,
} from './rules';
import { deFish, deItems, deNotices, festivalFoods } from './town';

type DeTools = GameTools<DeTimeline, CountryResult, DeEffect, DeFestival>;
type DeActivity = Activity<DeEffect, DeFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const values = germanyFull2026_11.values;
const eur = (value: number) =>
  `€${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;

export const characterOf = (id: string) => {
  const character = deCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

// Customary dates, not policy (see deFestivals).
function festivalDate(festival: DeFestival, year: number): IsoDate {
  if (festival === 'weihnachtsmarkt') return firstWeekday(`${year}-11-30`, 6);
  if (festival === 'maifest') return `${year}-05-01`;
  if (festival === 'fete-de-la-musique') return `${year}-06-21`;
  return `${year}-11-11`;
}
const quarterFestival: Record<1 | 2 | 3 | 4, DeFestival> = {
  1: 'weihnachtsmarkt',
  2: 'maifest',
  3: 'fete-de-la-musique',
  4: 'st-martin',
};
export function calendar(state: DeState) {
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

const festivalResults: Record<DeFestival, Text> = {
  weihnachtsmarkt: t(
    '热潘趣捧在手里，木屋的彩灯一盏盏亮起来。吉塞拉塞给你一包刚炒好的杏仁。',
    'Warm punch in your hands, the huts light up one by one. Gisela slips you a bag of freshly roasted almonds.',
  ),
  maifest: t(
    '「Hau ruck！」十几个人一起推，五月树稳稳立住了。乌韦从烤架边递来一根香肠。',
    '“Hau ruck!” A dozen people push and the maypole stands firm. Uwe hands you a sausage from the grill.',
  ),
  'fete-de-la-musique': t(
    '你跟着街头乐队唱完一整首，连副歌的德语都没唱错。穆拉特请你吃了咖喱香肠。',
    'You sing a whole song with the street band without fumbling the German chorus. Murat buys you a currywurst.',
  ),
  'st-martin': t(
    '纸灯笼在运河上映出一串光点，孩子们唱着歌走过埃梅卡修好的桥。队尾的人塞给你一个面包小人。',
    'Paper lanterns dot the canal with light as the children sing their way over Emeka’s bridge. Someone at the back hands you a Weckmann.',
  ),
};

/**
 * The scheduled charges the engine reports for an adult without a reduction:
 * a settlement permit (SRC-410 AufenthV § 44) and naturalisation (SRC-101
 * StAG § 38 Abs. 2).
 */
const settleFee = values.settlementFees.value.general;
const naturalisationFee = values.naturalisationFees.value.standard;

/** Right answers in the Leben in Deutschland test (game setting). */
const testAnswers = (state: DeState) =>
  Math.min(
    values.citizenshipKnowledgeTest.value.total,
    Math.floor(state.stats.german / b.germanPerTestAnswer),
  );

/** What the office confirms for an application that only waits for it. */
const officeItems: Record<string, { label: Text; note: Text }> = {
  'DE-C10': {
    label: t('当地住房标准', 'the local housing standard'),
    note: t(
      '住房是否达到当地的面积与占用标准，游戏没有当地数据（PD-348）',
      'whether the flat meets the local space and occupancy standard, for which the game has no local figure (PD-348)',
    ),
  },
  'DE-C21-pay': {
    label: t('本年度蓝卡工资线', 'this year’s Blue Card pay threshold'),
    note: t(
      '本年度的蓝卡工资线，参数表还没有登记这一年（PD-350）',
      'this year’s Blue Card pay threshold, not yet in the parameter table (PD-350)',
    ),
  },
};

export function actionAvailable(
  state: DeState,
  action: DeActivity,
  { affordable }: DeTools,
): boolean | undefined {
  // Fees join the effects only in actionDetails, after this check.
  if (action.id === 'settle')
    return (
      (pathwayOf(state.result, state.timeline, 'settle')?.status === 'MET' ||
        !!officePending(state)) &&
      affordable(state, [{ type: 'money', delta: -settleFee }])
    );
  if (action.id === 'naturalise')
    return (
      pathwayOf(state.result, state.timeline, 'nat')?.status === 'MET' &&
      affordable(state, [{ type: 'money', delta: -naturalisationFee }])
    );
  if (action.id === 'exam') return !state.flags.includes('german-b1');
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < 1050
  )
    return false;
}

export function actionDetails(state: DeState, action: DeActivity): void {
  if (action.id === 'settle') {
    const amount = settleFee;
    action.label = t(
      `申请定居许可（手续费 ${eur(amount)}，SRC-410 第 44 条）`,
      `Apply for a settlement permit (fee ${eur(amount)}, SRC-410 § 44)`,
    );
    const pending = officePending(state);
    if (pending) {
      const items = pending.map((id) => officeItems[id]);
      action.label = t(
        `申请定居许可（手续费 ${eur(amount)}，SRC-410 第 44 条；${items.map((item) => item.label.zhCN).join('、')}待外管局核对）`,
        `Apply for a settlement permit (fee ${eur(amount)}, SRC-410 § 44; ${items.map((item) => item.label.en).join(' and ')} to be checked by the office)`,
      );
      action.note = t(
        `评估里只剩这些待确认，由外管局在审查时核对：${items.map((item) => item.note.zhCN).join('；')}。`,
        `Only these are pending in the assessment, and the office checks them during review: ${items.map((item) => item.note.en).join('; ')}.`,
      );
    }
    action.effects = [{ type: 'money', delta: -amount }, ...action.effects];
  }
  if (action.id === 'naturalise') {
    const amount = naturalisationFee;
    action.label = t(
      `递交入籍申请（手续费 ${eur(amount)}，SRC-101 第 38 条）`,
      `Apply for naturalisation (fee ${eur(amount)}, SRC-101 § 38)`,
    );
    action.effects = [{ type: 'money', delta: -amount }, ...action.effects];
  }
  if (action.id === 'exam') {
    if (state.stats.german >= b.germanExamScore)
      action.effects = [{ type: 'german' }];
    action.note = t(
      `游戏内德语 ${state.stats.german} / ${b.germanExamScore}。通过后记为已证明 ${values.settlementGerman.value} 德语（SRC-100 第 2 条第 11 款、第 9 条第 2 款，SRC-101 第 10 条第 4 款）。游戏未收录考试费用。`,
      `In-game German ${state.stats.german} / ${b.germanExamScore}. A pass records proven German at ${values.settlementGerman.value} (SRC-100 § 2 Abs. 11, § 9 Abs. 2; SRC-101 § 10 Abs. 4). The game does not charge an exam fee.`,
    );
  }
  if (action.id === 'orientation-test')
    action.effects = [
      ...action.effects,
      { type: 'orientationTest', correct: testAnswers(state) },
    ];
}

const applicationFlags: Record<string, string> = {
  settle: 'applied-settle',
  naturalise: 'applied-nat',
};
// Before the effects run: the ending text reads which application was made.
export function beforeAction(state: DeState, action: DeActivity): void {
  const flag = applicationFlags[action.id];
  if (flag && !state.flags.includes(flag)) state.flags.push(flag);
}

export function afterAction(
  state: DeState,
  next: DeState & { outcome: Outcome },
  action: DeActivity,
  log: LogEntry,
  { applyEffects, setFlags }: DeTools,
): void {
  if (action.id === 'board') {
    const posted = deNotices.filter((notice) =>
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
    (action.id === 'festival' ||
      ['kinderpunsch', 'maibaum', 'strassenmusik', 'laternenumzug'].includes(
        action.id,
      ))
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
  state: DeState,
  next: DeState & { outcome: Outcome },
  action: DeActivity,
  log: LogEntry,
): void {
  if (action.id === 'exam') {
    if (state.stats.german >= b.germanExamScore) {
      next.outcome.text = t(
        'B1 考试通过了。证书收进文件夹，和工资单放在一起。',
        'You passed the B1 exam. The certificate goes into the folder beside the payslips.',
      );
    } else {
      next.eventQueue.unshift('system-exam-failed');
      next.outcome.text = t(
        `B1 还差一点（游戏内德语 ${state.stats.german} / ${b.germanExamScore}）。`,
        `Not quite B1 yet (in-game German ${state.stats.german} / ${b.germanExamScore}).`,
      );
    }
    log.text = next.outcome.text;
  }
  if (action.id === 'orientation-test') {
    const test = values.citizenshipKnowledgeTest.value;
    const correct = testAnswers(state);
    next.outcome.text = t(
      `${test.total} 道题答对 ${correct} 道。定居要 ${values.orientationPass.value} 道，入籍要 ${test.required} 道；成绩记进评估，重考取最好成绩。`,
      `${correct} of ${test.total} right. Settlement needs ${values.orientationPass.value} and naturalisation ${test.required}; the result goes into the assessment, and a retake keeps the best score.`,
    );
    log.text = next.outcome.text;
  }
}

export function shopStock(state: DeState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return deItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return deItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['apfelschorle', 'brezel', 'kuchen', 'flowers'].includes(item.id)),
  );
}

export function catchItem(state: DeState, { random }: DeTools) {
  // Perch and roach bite all year; bream like the rain; pike hunt in the
  // warmer months.
  const fish = deFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['brasse', 'ploetze', 'barsch']
      : state.quarter === 1
        ? ['barsch', 'ploetze']
        : ['barsch', 'ploetze', 'brasse', 'hecht'];
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
  state: () => DeState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 480);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.german < b.germanExamScore &&
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
    if (state().stats.mood < b.routineMoodTarget)
      run('wochenmarkt', 'green', 660);
  } else
    run(
      'festival',
      'green',
      state().day.festival === 'st-martin' ? b.lanternStart : b.festivalStart,
    );
}

export function endingText(state: DeState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    settled: state.flags.includes('applied-nat')
      ? t(
          '入籍申请递进了入籍科。审查还要一段时间，可你早已把林登岸叫作家了。',
          'The naturalisation application is with the office. Review takes a while, but you already call Lindenufer home.',
        )
      : character.settlement,
    left: t(
      '行李箱合上，S 线驶过运河上的桥。你选择离开德国，这局生活到这里收好。',
      'The suitcase closes and the S-Bahn crosses the canal bridge. You chose to leave Germany, ending this game.',
    ),
    overstayed: t(
      '居留许可到期了，申请还没有递出去，这段林登岸生活在这里结束。\n下一局可以留意顶栏的剩余月数，到期前去外管局递交定居申请，或去入籍科递交入籍申请。',
      'Your residence permit ended before you applied, ending this game.\nNext time, watch the months left in the top bar and apply for settlement or naturalisation before it ends.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请材料还在抽屉里。这局走到了时间尽头，林登岸的日记在这里合上。',
      'The application is still in the drawer. This game has reached its time limit, and the Lindenufer diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: DeState): Text {
  return t(
    `账户里最后是 ${eur(Math.round(state.stats.money))}，还有没写进账单的牵挂。`,
    `The account ends at ${eur(Math.round(state.stats.money))}, alongside things it cannot count.`,
  );
}

export const deAchievements: Achievement<
  DeTimeline,
  CountryResult,
  DeFestival
>[] = [
  {
    id: 'de-lantern',
    name: t('提灯的人', 'Lantern bearer'),
    description: t(
      '跟着圣马丁灯笼游行走过一次。',
      'Walked St Martin’s lantern procession.',
    ),
    check: (state) => state.flags.includes('visited-festival:st-martin'),
  },
  {
    id: 'de-four-festivals',
    name: t('一年四节', 'A year of festivals'),
    description: t(
      '圣诞集市、五月节、街头音乐节、圣马丁都去过。',
      'Joined the Christmas market, May Day, the Fête de la Musique and St Martin’s.',
    ),
    check: (state) =>
      (
        [
          'weihnachtsmarkt',
          'maifest',
          'fete-de-la-musique',
          'st-martin',
        ] as const
      ).every((festival) =>
        state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'de-b1',
    name: t('能自己办事了', 'Getting things done in German'),
    description: t('通过游戏里的 B1 考试。', 'Passed the in-game B1 exam.'),
    check: (state) => state.flags.includes('german-b1'),
  },
  {
    id: 'de-orientation',
    name: t('在德国生活', 'Life in Germany'),
    description: t(
      '参加过一次「在德国生活」测试。',
      'Took the Leben in Deutschland test.',
    ),
    check: (state) => state.flags.includes('orientation-test'),
  },
  {
    id: 'de-pike',
    name: t('运河里的狗鱼', 'Pike of the canal'),
    description: t('在林登运河钓到狗鱼。', 'Caught a pike in the Lindenkanal.'),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'hecht'),
  },
  {
    id: 'de-stammgast',
    name: t('小酒馆的常客', 'A Kneipe regular'),
    description: t('和乌韦成为老朋友。', 'Became good friends with Uwe.'),
    check: (state) => (state.friendship.uwe ?? 0) >= 500,
  },
];
