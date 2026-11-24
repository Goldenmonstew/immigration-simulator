import type { CountryResult } from '@uk-immigration/engine';
import { nzResidentParameters as p } from '@uk-immigration/policy-data';
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
import { nzBalance as b } from './balance';
import { nzCharacters } from './characters';
import {
  pathwayOf,
  timeProjection,
  type NzEffect,
  type NzFestival,
  type NzState,
  type NzTimeline,
} from './rules';
import { festivalFoods, nzd, nzFish, nzItems, nzNotices } from './town';

type NzTools = GameTools<NzTimeline, CountryResult, NzEffect, NzFestival>;
type NzActivity = Activity<NzEffect, NzFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

export const characterOf = (id: string) => {
  const character = nzCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

// Customary or town dates, not policy (see nzFestivals).
function festivalDate(festival: NzFestival, year: number): IsoDate {
  if (festival === 'waitangi') return `${year}-02-06`;
  if (festival === 'pasifika') return firstWeekday(`${year}-03-14`, 6);
  if (festival === 'matariki') return firstWeekday(`${year}-07-07`, 6);
  return firstWeekday(`${year}-11-07`, 6);
}
const quarterFestival: Record<1 | 2 | 3 | 4, NzFestival> = {
  1: 'waitangi',
  2: 'pasifika',
  3: 'matariki',
  4: 'ap-show',
};
export function calendar(state: NzState) {
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

const festivalActions = [
  'waitangi-picnic',
  'pasifika-dance',
  'matariki-lanterns',
  'shearing-cheer',
];
const festivalResults: Record<NzFestival, Text> = {
  waitangi: t(
    '孩子们唱完最后一首歌，全场站起来鼓掌。你的野餐毯上多了一份香肠夹面包，是邻居塞过来的。',
    'The children finish their last song and the whole domain stands to clap. A neighbour slips a sausage sizzle onto your picnic blanket.',
  ),
  pasifika: t(
    '鼓点越来越快，你跟着大家拍手、转身。Sione 的姑妈笑着往你手里塞了一袋 panikeke。',
    'The drums speed up and you clap and turn with everyone. Sione’s aunty laughs and presses a bag of panikeke into your hands.',
  ),
  matariki: t(
    '灯笼一盏盏亮起来。你在心里念了想念的人的名字，又抬头找那九颗星。',
    'One by one the lanterns glow. You say the names of people you miss under your breath, then look up for the nine stars.',
  ),
  'ap-show': t(
    '最快的剪毛手一分钟不到就剪完一只羊，羊毛整片落在地上。你喊得嗓子都哑了。',
    'The fastest shearer finishes a sheep in under a minute, the fleece falling in one piece. You cheer yourself hoarse.',
  ),
};

/** The permanent resident visa fee, from the official fee review (SRC-233). */
const prvFee = p.residentFeeReference.value.permanent;

export function actionAvailable(
  state: NzState,
  action: NzActivity,
  { affordable }: NzTools,
): boolean | undefined {
  if (action.id === 'settle')
    return (
      pathwayOf(state.result, 'prv')?.status === 'MET' &&
      affordable(state, [{ type: 'money', delta: -prvFee }])
    );
  if (action.id === 'naturalise')
    return (
      pathwayOf(state.result, 'cit')?.status === 'MET' &&
      affordable(state, action.effects)
    );
  if (action.id === 'wharf-jump' && state.quarter !== 1) return false;
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < 1050
  )
    return false;
}

export function actionDetails(state: NzState, action: NzActivity): void {
  if (action.id === 'settle') {
    action.label = t(
      `申请永久居民签证（参考费用 ${nzd(prvFee)}，SRC-233）`,
      `Apply for a permanent resident visa (reference fee ${nzd(prvFee)}, SRC-233)`,
    );
    action.note = t(
      '费用取自官方移民费用审查表的参考额，递交时以 INZ 公布的收费为准。',
      'The fee is the reference amount in the official immigration fee review. Confirm the charge with INZ when you apply.',
    );
    action.effects = [{ type: 'money', delta: -prvFee }, ...action.effects];
  }
}

const applicationFlags: Record<string, string> = {
  settle: 'applied-prv',
  naturalise: 'applied-citizenship',
};
// Before the effects run: the ending text reads which application was made.
export function beforeAction(state: NzState, action: NzActivity): void {
  const flag = applicationFlags[action.id];
  if (flag && !state.flags.includes(flag)) state.flags.push(flag);
}

export function actionFlags(action: NzActivity): string[] | undefined {
  if (action.id === 'wharf-jump') return ['jumped-wharf'];
}

/** What the Internal Affairs counter can say from the engine's projection. */
function citizenshipAdvice(state: NzState): Text {
  const pathway = pathwayOf(state.result, 'cit');
  const presence = timeProjection(state).find(
    ({ id }) => id === 'NZ-CITIZENSHIP',
  );
  const year = p.citizenshipTestReviewFrom.value.slice(0, 4);
  const test = t(
    `公民考试官方预告 ${year} 年底开始，日期和费用还没公布（PD-224）。`,
    `The citizenship test is announced for late ${year}; its date and fee are not yet published (PD-224).`,
  );
  if (pathway?.status === 'MET')
    return t(
      '柜台的工作人员说，你现在就可以递交入籍申请。',
      'The officer says you can apply for citizenship now.',
    );
  if (presence?.status === 'FUTURE' && presence.earliestDate)
    return {
      zhCN: `柜台的工作人员算了算：按你的出入境记录，在境天数最早 ${presence.earliestDate} 够数。${test.zhCN}`,
      en: `The officer runs the numbers: on your travel record, you meet the presence requirement from ${presence.earliestDate}. ${test.en}`,
    };
  return {
    zhCN: `柜台的工作人员说，在境天数已经够了，还有条件要确认。${test.zhCN}`,
    en: `The officer says your days in New Zealand are enough, but other requirements remain open. ${test.en}`,
  };
}

export function afterAction(
  state: NzState,
  next: NzState & { outcome: Outcome },
  action: NzActivity,
  log: LogEntry,
  { applyEffects, setFlags }: NzTools,
): void {
  if (action.id === 'board') {
    const posted = nzNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'citizenship-info') {
    next.outcome.text = citizenshipAdvice(next);
    log.text = next.outcome.text;
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

export function shopStock(state: NzState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return nzItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return nzItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['tea', 'pie', 'anzac-biscuits', 'lamingtons', 'flowers'].includes(
            item.id,
          )),
  );
}

export function catchItem(state: NzState, { random }: NzTools) {
  // Snapper come inshore in the warm months; flounder like the wet.
  const fish = nzFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['flounder', 'kahawai', 'trevally']
      : state.quarter === 3
        ? ['kahawai', 'trevally', 'flounder']
        : ['snapper', 'kahawai', 'trevally', 'snapper'];
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
  state: () => NzState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.mood < b.routineMoodTarget &&
        state().stats.money >= b.relaxCost
          ? 'relax'
          : 'bench';
      run(evening, evening === 'relax' ? 'pub' : 'bench', 1080);
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
      state().day.festival === 'matariki' ? b.lanternStart : b.festivalStart,
    );
}

export function endingText(state: NzState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    settled: state.flags.includes('applied-citizenship')
      ? t(
          '入籍申请递进了内政部。等到入籍仪式那天，你会在区议会的礼堂里宣誓，唱两种语言的国歌。',
          'The citizenship application is with Internal Affairs. On ceremony day you will take the oath in the council chambers and sing the anthem in two languages.',
        )
      : character.settlement,
    left: t(
      '机场巴士开出海湾，pōhutukawa 一棵棵退到身后。你选择离开新西兰，这局生活到这里收好。',
      'The airport coach pulls out of the bay and the pōhutukawa slip by. You chose to leave New Zealand, ending this game.',
    ),
    overstayed: t(
      '居民签证失效了，这段海湾生活在这里结束。',
      'Your resident visa has expired, ending this game.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请还没有递出去。这局走到了时间尽头，海湾的日记在这里合上。',
      'The application is still unsent. This game has reached its time limit, and the diary of the bay closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: NzState): Text {
  return t(
    `账户里最后是 ${nzd(state.stats.money)}，还有没写进账本的牵挂。`,
    `The account ends at ${nzd(state.stats.money)}, alongside things it cannot count.`,
  );
}

export const nzAchievements: Achievement<
  NzTimeline,
  CountryResult,
  NzFestival
>[] = [
  {
    id: 'nz-matariki',
    name: t('Matariki 的灯', 'Matariki lights'),
    description: t(
      '在 Matariki 灯笼夜走过星光小径。',
      'Walked the starlight trail on Matariki night.',
    ),
    check: (state) => state.flags.includes('visited-festival:matariki'),
  },
  {
    id: 'nz-four-festivals',
    name: t('海湾的四季', 'Seasons of the bay'),
    description: t(
      '怀唐伊日、太平洋岛民文化节、Matariki、农牧展都去过。',
      'Joined Waitangi Day, the Pasifika festival, Matariki and the A&P show.',
    ),
    check: (state) =>
      (['waitangi', 'pasifika', 'matariki', 'ap-show'] as const).every(
        (festival) => state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'nz-tereo',
    name: t('会说几句毛利语', 'A few words of te reo'),
    description: t(
      `游戏内毛利语达到 ${b.tereoAchievement}。`,
      `Reached ${b.tereoAchievement} te reo in the game.`,
    ),
    check: (state) => state.stats.tereo >= b.tereoAchievement,
  },
  {
    id: 'nz-snapper',
    name: t('码头下的真鲷', 'Snapper under the wharf'),
    description: t('在码头钓到真鲷。', 'Caught a snapper off the wharf.'),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'snapper'),
  },
  {
    id: 'nz-wharf-jump',
    name: t('码头跳水', 'Off the wharf'),
    description: t(
      '在夏天从码头跳进海里。',
      'Jumped off the wharf on a summer day.',
    ),
    check: (state) => state.flags.includes('jumped-wharf'),
  },
  {
    id: 'nz-regular',
    name: t('炸鱼薯条店的熟客', 'A chip-shop regular'),
    description: t('和 Bruce 成为老朋友。', 'Became good friends with Bruce.'),
    check: (state) => (state.friendship.bruce ?? 0) >= 500,
  },
];
