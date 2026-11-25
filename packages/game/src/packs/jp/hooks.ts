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
import { jpBalance as b } from './balance';
import { jpCharacters } from './characters';
import {
  pathwayOf,
  status,
  type JpEffect,
  type JpFestival,
  type JpState,
  type JpTimeline,
} from './rules';
import type { JpFullResult } from '@uk-immigration/engine';
import { festivalFoods, jpFish, jpItems, jpNotices } from './town';

type JpTools = GameTools<JpTimeline, JpFullResult, JpEffect, JpFestival>;
type JpActivity = Activity<JpEffect, JpFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const yen = (value: number) => `¥${Math.round(value).toLocaleString('en-GB')}`;

export const characterOf = (id: string) => {
  const character = jpCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

// Customary dates, not policy (see jpFestivals).
function festivalDate(festival: JpFestival, year: number): IsoDate {
  if (festival === 'setsubun') return `${year}-02-03`;
  if (festival === 'hanami') return firstWeekday(`${year}-03-31`, 6);
  if (festival === 'bon-odori') return firstWeekday(`${year}-08-08`, 6);
  return firstWeekday(firstWeekday(`${year}-09-30`, 6), 6);
}
const quarterFestival: Record<1 | 2 | 3 | 4, JpFestival> = {
  1: 'setsubun',
  2: 'hanami',
  3: 'bon-odori',
  4: 'aki-matsuri',
};
export function calendar(state: JpState) {
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

const festivalResults: Record<JpFestival, Text> = {
  setsubun: t(
    '你朝门外撒了一把豆，翔在旁边喊得比谁都大声。回家路上，纸袋里还剩几颗。',
    'You toss a handful of beans towards the gate; Sho shouts louder than anyone. A few beans rattle in the bag on the way home.',
  ),
  hanami: t(
    '蓝色野餐垫上摆满了便当。一阵风吹过，花瓣落进了你的茶杯。',
    'Lunch boxes crowd the blue picnic sheet. A gust drops petals into your tea.',
  ),
  'bon-odori': t(
    '你跟着前面的人转了三圈，终于踩对了太鼓的节拍。木台上的灯笼一晃一晃。',
    'Three rounds behind the dancer ahead and you finally hit the taiko beat. The lanterns on the tower sway.',
  ),
  'aki-matsuri': t(
    '神轿压在肩上比想象中重。「嘿哟！」一声，整条商店街都跟着喊起来。',
    'The portable shrine is heavier than it looks. One “Wasshoi!” and the whole street shouts along.',
  ),
};

/** The approval fee as the engine assesses it for this filing date. */
const prFee = (state: JpState) =>
  pathwayOf(state.result, 'pr')?.checks.find(
    (check) => check.id === 'jp.pr.approval-fee',
  )?.fee?.amount ?? 0;

export function actionAvailable(
  state: JpState,
  action: JpActivity,
  { affordable }: JpTools,
): boolean | undefined {
  // The fee joins the effects only in actionDetails, after this check.
  if (action.id === 'settle')
    return (
      pathwayOf(state.result, 'pr')?.status === 'MET' &&
      affordable(state, [{ type: 'money', delta: -prFee(state) }])
    );
  if (action.id === 'naturalise')
    return pathwayOf(state.result, 'nat')?.status === 'MET';
  if (action.id === 'nat-interview')
    return !state.timeline.naturalisation.evidence
      ?.requiredInterviewAndAssessmentComplete;
  if (action.id === 'exam')
    return !state.timeline.permanentResidence.evidence.japaneseB1Confirmed;
  if (action.id === 'extend')
    return !state.flags.includes('quarter-visa-renewed');
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < 1050
  )
    return false;
}

export function actionDetails(state: JpState, action: JpActivity): void {
  if (action.id === 'settle') {
    const fee = prFee(state);
    action.label = t(
      `递交永住许可申请（获准时手续费 ${yen(fee)}，SRC-443）`,
      `Apply for permanent residence (fee on approval ${yen(fee)}, SRC-443)`,
    );
    action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
  }
  if (action.id === 'exam') {
    if (state.stats.japanese >= b.japaneseExamScore)
      action.effects = [{ type: 'japanese' }];
    action.note = t(
      `游戏内日语 ${state.stats.japanese} / ${b.japaneseExamScore}。通过后记为已确认 B1 程度（SRC-114 第2の5(8)），帰化的会话读写也记为能独立完成。`,
      `In-game Japanese ${state.stats.japanese} / ${b.japaneseExamScore}. A pass records confirmed B1 evidence (SRC-114 2-5(8)) and independent speaking, reading and writing for naturalisation.`,
    );
  }
  if (action.id === 'extend') {
    const current = status(state);
    action.label = t(
      `办理在留期间更新（现期限 ${current.expiresOn}，本情景预设获批）`,
      `Renew your period of stay (currently to ${current.expiresOn}; assumed granted in this scenario)`,
    );
  }
}

const applicationFlags: Record<string, string> = {
  settle: 'applied-pr',
  naturalise: 'applied-nat',
};
// Before the effects run: the ending text reads which application was made.
export function beforeAction(state: JpState, action: JpActivity): void {
  const flag = applicationFlags[action.id];
  if (flag && !state.flags.includes(flag)) state.flags.push(flag);
}

export function afterAction(
  state: JpState,
  next: JpState & { outcome: Outcome },
  action: JpActivity,
  log: LogEntry,
  { applyEffects, setFlags }: JpTools,
): void {
  if (action.id === 'extend') log.renewalValidTo = status(next).expiresOn;
  if (action.id === 'board') {
    const posted = jpNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'address-notice')
    next.outcome.text = t(
      '窗口的中村先生在在留卡背面印上新住址，又把住民票递给你。',
      'Mr Nakamura prints the new address on the back of your residence card and hands over the residence record.',
    );
  const festival = next.day.festival;
  if (
    festival &&
    (action.id === 'festival' ||
      ['mamemaki', 'hanami-picnic', 'bon-dance', 'mikoshi'].includes(action.id))
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
  state: JpState,
  next: JpState & { outcome: Outcome },
  action: JpActivity,
  log: LogEntry,
): void {
  if (action.id !== 'exam') return;
  if (state.stats.japanese >= b.japaneseExamScore) {
    next.outcome.text = t(
      '日语评估通过了。成绩单收进文件夹，和课税证明放在一起。',
      'You passed the Japanese assessment. The certificate goes into the folder beside the tax certificates.',
    );
  } else {
    next.eventQueue.unshift('system-exam-failed');
    next.outcome.text = t(
      `日语评估还差一点（游戏内日语 ${state.stats.japanese} / ${b.japaneseExamScore}）。`,
      `Not quite there yet (in-game Japanese ${state.stats.japanese} / ${b.japaneseExamScore}).`,
    );
  }
  log.text = next.outcome.text;
}

export function shopStock(state: JpState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return jpItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return jpItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['tea', 'dango', 'castella', 'flowers'].includes(item.id)),
  );
}

export function catchItem(state: JpState, { random }: JpTools) {
  // Sea bass follow the tide upriver in the warm months; carp like the rain.
  const fish = jpFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['koi', 'funa', 'haze']
      : state.quarter === 1
        ? ['funa', 'koi', 'haze']
        : ['haze', 'suzuki', 'koi', 'funa'];
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
  state: () => JpState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.japanese < b.japaneseExamScore &&
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
  } else
    run(
      'festival',
      'green',
      state().day.festival === 'bon-odori' ? b.bonOdoriStart : b.festivalStart,
    );
}

export function endingText(state: JpState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    settled: state.flags.includes('applied-nat')
      ? t(
          '帰化申请的材料递进了法务局。审查还要一段时间，可你已经把港坂叫作家了。',
          'The naturalisation papers are with the Legal Affairs Bureau. Review takes a while, but you already call Minatozaka home.',
        )
      : character.settlement,
    left: t(
      '行李箱合上，电车开过大冈川的桥。你选择离开日本，这局生活到这里收好。',
      'The suitcase closes and the train crosses the Ōoka bridge. You chose to leave Japan, ending this game.',
    ),
    overstayed: t(
      '在留期限过了还没有更新，这段港坂生活在这里结束。\n下一局可以留意顶栏的剩余月数，到期前去入管窗口办理更新。',
      'Your period of stay ended before you renewed it, ending this game.\nNext time, watch the months left in the top bar and renew at the immigration office first.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请材料还在抽屉里。这局走到了时间尽头，港坂的日记在这里合上。',
      'The application is still in the drawer. This game has reached its time limit, and the Minatozaka diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: JpState): Text {
  return t(
    `存折上最后是 ${yen(state.stats.money)}，还有没写进存折的牵挂。`,
    `The bankbook ends at ${yen(state.stats.money)}, alongside things it cannot count.`,
  );
}

export const jpAchievements: Achievement<
  JpTimeline,
  JpFullResult,
  JpFestival
>[] = [
  {
    id: 'jp-blossom',
    name: t('花见', 'Hanami'),
    description: t(
      '在河边的樱花下坐过一次。',
      'Sat under the riverside blossom.',
    ),
    check: (state) => state.flags.includes('visited-festival:hanami'),
  },
  {
    id: 'jp-four-festivals',
    name: t('四季祭典', 'Festivals of four seasons'),
    description: t(
      '节分、赏樱、盆踊、秋祭都去过。',
      'Joined Setsubun, hanami, the Bon dance and the autumn festival.',
    ),
    check: (state) =>
      (['setsubun', 'hanami', 'bon-odori', 'aki-matsuri'] as const).every(
        (festival) => state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'jp-japanese',
    name: t('能自己办事了', 'Getting things done in Japanese'),
    description: t(
      '通过游戏里的日语评估。',
      'Passed the in-game Japanese assessment.',
    ),
    check: (state) => state.flags.includes('japanese-confirmed'),
  },
  {
    id: 'jp-renewed',
    name: t('新的在留卡', 'A new residence card'),
    description: t(
      '办好一次在留期间更新。',
      'Renewed your period of stay once.',
    ),
    check: (state) => state.flags.includes('visa-renewed'),
  },
  {
    id: 'jp-sea-bass',
    name: t('河口来的鲈鱼', 'Sea bass from the bay'),
    description: t(
      '在大冈川钓到鲈鱼。',
      'Caught a sea bass in the Ōoka River.',
    ),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'suzuki'),
  },
  {
    id: 'jp-regular',
    name: t('居酒屋的常客', 'An izakaya regular'),
    description: t('和健司成为老朋友。', 'Became good friends with Kenji.'),
    check: (state) => (state.friendship.kenji ?? 0) >= 500,
  },
];
