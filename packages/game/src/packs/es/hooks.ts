import type { CountryResult } from '@uk-immigration/engine';
import type { GameTools } from '../../content-pack';
import type {
  Achievement,
  Activity,
  EndingId,
  LogEntry,
  Outcome,
  PlaceId,
  Quarter,
  Text,
} from '../../model';
import { esBalance as b } from './balance';
import { esCharacters } from './characters';
import {
  currentResult,
  esRules,
  freeCcseRetake,
  pathwayOf,
  type EsColumn,
  type EsEffect,
  type EsFestival,
  type EsState,
  type EsTimeline,
} from './rules';
import { esFish, esItems, esNotices, festivalFoods } from './town';

type EsTools = GameTools<EsTimeline, CountryResult, EsEffect, EsFestival>;
type EsActivity = Activity<EsEffect, EsFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const eur = (value: number) => `€${Math.round(value).toLocaleString('en-GB')}`;

export const characterOf = (id: string) => {
  const character = esCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};
/** The route each character's own settlement text belongs to. */
const ownRoute: Record<string, EsColumn> = { cook: 'nat', exporter: 'lt' };

// Customary dates, not policy (see esFestivals).
const festivalDays: Record<Quarter, [EsFestival, string]> = {
  1: ['reis', '01-05'],
  2: ['falles', '03-19'],
  3: ['sant-joan', '06-23'],
  4: ['nou-octubre', '10-09'],
};
export function calendar(state: EsState) {
  const [festival, day] = festivalDays[state.quarter];
  // The winter quarter starts in December; the parade is next January.
  const year =
    Number(state.date.slice(0, 4)) + (state.date.slice(5, 7) === '12' ? 1 : 0);
  return { date: `${year}-${day}`, festival };
}

const festivalActions = [
  'cavalcada',
  'mascleta',
  'sant-joan-waves',
  'mocadora',
];
const festivalResults: Record<EsFestival, Text> = {
  reis: t(
    '巴尔塔萨从花车上撒下一把糖，你伸手接住了三颗。旁边的小孩把袋子举得比头还高。',
    'Balthazar throws a fistful of sweets from the float and you catch three. The child beside you holds a bag higher than her head.',
  ),
  falles: t(
    '鞭炮声从远到近，最后连成一片轰鸣，地面都在抖。烟散了，整个广场一起鼓掌。',
    'The bangs roll in from far away until they merge into one roar and the ground shakes. When the smoke clears, the whole square applauds.',
  ),
  'sant-joan': t(
    '你把写着愿望的纸丢进火里，然后光脚冲进海里，一道、两道……第七道浪打湿了你的衣服。',
    'You drop your wish into the fire, then run barefoot into the sea: one wave, two… the seventh soaks your clothes.',
  ),
  'nou-octubre': t(
    '你挑了杏仁糖做的小橙子和小西瓜，用一条绣花手帕包好。送出去的时候，对方笑得像个孩子。',
    'You pick marzipan oranges and watermelons and tie them up in an embroidered handkerchief. When you hand it over, they smile like a child.',
  ),
};

export function actionAvailable(
  state: EsState,
  action: EsActivity,
  { affordable }: EsTools,
): boolean | undefined {
  const { nationality: n, steps } = state.timeline;
  const affords = affordable(state, action.effects);
  // The application goes in on the day: it must still be possible then, as
  // well as on the quarter's assessment date (a card or late filing window
  // can run out in between).
  const met = (column: EsColumn) =>
    pathwayOf(state.result, column)?.status === 'MET' &&
    pathwayOf(
      esRules.evaluate({
        date: state.day.date,
        timeline: state.timeline,
        locale: state.locale,
      }),
      column,
    )?.status === 'MET';
  switch (action.id) {
    case 'naturalise':
      return affords && met('nat');
    case 'settle':
      return affords && met('lt');
    case 'cita-previa':
      return (
        !state.flags.includes('cita-booked') &&
        ['MET', 'FUTURE'].includes(
          pathwayOf(currentResult(state), 'lt')?.status ?? '',
        )
      );
    case 'ccse':
      return (
        !steps.ccse &&
        !n.ccse?.verifiedPass &&
        (affords || !!freeCcseRetake(state))
      );
    case 'dele':
      return !steps.dele && n.deleEvidence !== 'dele' && affords;
    case 'nat-papers':
      return (
        !steps.papers &&
        !n.criminalRecords?.originRecordOrLawfulAlternative &&
        affords
      );
    case 'swim':
      return state.quarter !== 1 && state.day.weather !== 'rain';
    case 'class':
      // On workdays the class runs in the evening.
      if (state.day.kind === 'workday' && state.day.minute < 1050) return false;
  }
}

const examScore = (id: string) => (id === 'dele' ? b.deleScore : b.ccseScore);

export function actionDetails(state: EsState, action: EsActivity): void {
  const retakeUntil = action.id === 'ccse' && freeCcseRetake(state);
  if (retakeUntil) {
    action.effects = action.effects.filter(({ type }) => type !== 'money');
    action.label = t(
      `参加 CCSE 公民常识考试（首考未过的免费重考，${retakeUntil} 前有效，SRC-335）`,
      `Sit the CCSE civics exam (free retake after the first sitting, until ${retakeUntil}, SRC-335)`,
    );
  }
  if (action.id === 'ccse' || action.id === 'dele') {
    if (state.stats.spanish >= examScore(action.id))
      action.effects = [...action.effects, { type: action.id }];
    else if (action.id === 'ccse')
      action.effects = [...action.effects, { type: 'ccse-failed' }];
    action.note =
      action.id === 'ccse'
        ? t(
            `游戏内西语 ${state.stats.spanish} / ${b.ccseScore}。通过后记为当天的 CCSE 合格证明（SRC-321 art. 6，SRC-322 art. 10.4），从下一季的评估起计入。`,
            `In-game Spanish ${state.stats.spanish} / ${b.ccseScore}. A pass records a CCSE certificate dated that day (SRC-321 art. 6, SRC-322 art. 10.4), counted from next quarter’s assessment.`,
          )
        : t(
            `游戏内西语 ${state.stats.spanish} / ${b.deleScore}。通过后记为 DELE A2 证书（SRC-321 art. 6.1），从下一季的评估起计入。之后年份的价格以 Instituto Cervantes 公布为准，游戏沿用该价格。`,
            `In-game Spanish ${state.stats.spanish} / ${b.deleScore}. A pass records a DELE A2 certificate (SRC-321 art. 6.1), counted from next quarter’s assessment. Later prices follow the Instituto Cervantes; the game keeps this price.`,
          );
  }
}

/**
 * The shared quarter settlement ends the balcony flat's lease when the balance
 * runs low. That is a move too, made as play resumes in the new quarter (after
 * a trip still under way, on return), so the padrón needs updating as after
 * leaving the flat by hand.
 */
export function afterQuarter(
  state: EsState,
  _previousFlags: string[],
  { setFlags }: EsTools,
): void {
  const lease = state.log.find(
    (entry) =>
      entry.id === 'brighter-home-return' &&
      entry.year === state.year &&
      entry.quarter === state.quarter,
  );
  if (lease) {
    lease.text = t(
      '带阳台的公寓短租到期，你搬回原来的住处，押金回到账户，额外房租停止。住址变了，记得更新 padrón。',
      'The lease on the flat with a balcony ends. You move back to your old place, recover the deposit and stop paying the extra rent. A new address means updating the padrón.',
    );
    setFlags(state, ['lease-ended']);
  }
  if (state.trip || !state.flags.includes('lease-ended')) return;
  state.flags = state.flags.filter((flag) => flag !== 'lease-ended');
  state.timeline.steps.moves.push({ movedOn: state.date });
  setFlags(state, ['padron-due']);
  state.result = esRules.evaluate(state);
}

/** Remember which application was filed before the ending text is written. */
export function beforeAction(state: EsState, action: EsActivity): void {
  const flag =
    action.id === 'naturalise'
      ? 'applied-nat'
      : action.id === 'settle'
        ? 'applied-lt'
        : undefined;
  if (flag && !state.flags.includes(flag)) state.flags.push(flag);
}

export function afterAction(
  state: EsState,
  next: EsState & { outcome: Outcome },
  action: EsActivity,
  log: LogEntry,
  { applyEffects, random, setFlags }: EsTools,
): void {
  if (action.id === 'board') {
    const posted = esNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'padron')
    next.outcome.text = t(
      '窗口的职员把新地址敲进系统，打印出一张还带着温度的证明。',
      'The clerk types in the new address and prints a certificate still warm from the printer.',
    );
  if (action.id === 'nat-papers')
    next.outcome.text = t(
      '证明盖上了海牙认证，宣誓翻译在每页签了名。文件夹又厚了一点。',
      'The certificates carry their apostilles and the sworn translator has signed every page. The folder is a little thicker.',
    );
  if (action.id === 'cita-previa') {
    if (random(next) < b.citaChance) {
      setFlags(next, ['cita-booked']);
      next.outcome.text = t(
        '刷新到第七次，一个空位跳了出来。你抢下它，截图存好：外国人办公室，带 EX-11 和护照。',
        'On the seventh refresh a slot appears. You grab it and save a screenshot: immigration office, bring the EX-11 and your passport.',
      );
    } else
      next.outcome.text = t(
        '「目前没有可预约的时段。」你盯着屏幕叹了口气，下次早点来试。',
        '“No appointments available at this time.” You sigh at the screen. Try again earlier next time.',
      );
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

export function afterActionAwards(
  state: EsState,
  next: EsState & { outcome: Outcome },
  action: EsActivity,
  log: LogEntry,
): void {
  if (action.id !== 'ccse' && action.id !== 'dele') return;
  const score = examScore(action.id);
  if (state.stats.spanish >= score) {
    next.outcome.text =
      action.id === 'ccse'
        ? t(
            'CCSE 通过了。合格证明收进文件夹，和住址登记证明放在一起。',
            'You passed the CCSE. The certificate goes into the folder beside the padrón certificate.',
          )
        : t(
            'DELE A2 通过了！玛丽娜老师在走廊里跟你击掌。',
            'You passed the DELE A2! Marina high-fives you in the corridor.',
          );
  } else {
    next.eventQueue.unshift('system-exam-failed');
    next.outcome.text = t(
      `这次差一点（游戏内西语 ${state.stats.spanish} / ${score}）。`,
      `Not quite there yet (in-game Spanish ${state.stats.spanish} / ${score}).`,
    );
  }
  log.text = next.outcome.text;
}

export function shopStock(state: EsState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return esItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return esItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['rice', 'oranges', 'fartons', 'turron', 'flowers'].includes(
            item.id,
          )),
  );
}

export function catchItem(state: EsState, { random }: EsTools) {
  // Bream and white seabream like the summer breakwater; mullet and eels
  // come in with rain-muddied water; sea bass are a winter catch.
  const fish = esFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['mujol', 'anguila']
      : state.quarter === 1
        ? ['llobarro', 'sard', 'mujol']
        : state.quarter === 3
          ? ['orada', 'sard', 'mujol']
          : ['llobarro', 'orada', 'mujol', 'anguila'];
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
  state: () => EsState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.spanish < b.deleScore
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
      run('beach-walk', 'beach', 660);
  } else run('festival', 'green', b.festivalStart);
}

export function endingText(state: EsState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const applied = state.flags.includes('applied-nat') ? 'nat' : 'lt';
  const texts: Record<EndingId, Text> = {
    settled:
      ownRoute[state.characterId] === applied
        ? character.settlement
        : applied === 'nat'
          ? t(
              '入籍申请递交了。审查要等上一阵子，可你已经把维拉马尔叫作家了。',
              'The nationality application is in. Review takes a while, but you already call Vilamar home.',
            )
          : t(
              '长期居留的申请收下了。窗口的职员盖章时说：「欢迎留下来。」',
              'The long-term residence application is accepted. As the clerk stamps it, she says, “Welcome to stay.”',
            ),
    left: t(
      '行李箱合上，电车开过老河道公园。你选择离开西班牙，这局生活到这里收好。',
      'The suitcase closes and the tram crosses the old riverbed park. You chose to leave Spain, ending this game.',
    ),
    overstayed: t(
      '居留卡到期了，申请还没递出去，这段维拉马尔的生活在这里结束。\n下一局留意顶栏的剩余月数，到期前把申请递上去。',
      'Your residence card expired before you applied, ending this game.\nNext time, watch the months left in the top bar and file before the card runs out.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请材料还在抽屉里。这局走到了时间尽头，维拉马尔的日记在这里合上。',
      'The application is still in the drawer. This game has reached its time limit, and the Vilamar diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: EsState): Text {
  return t(
    `账户上最后是 ${eur(state.stats.money)}，还有没写进账本的牵挂。`,
    `The account ends at ${eur(state.stats.money)}, alongside things it cannot count.`,
  );
}

export const esAchievements: Achievement<
  EsTimeline,
  CountryResult,
  EsFestival
>[] = [
  {
    id: 'es-falles',
    name: t('法雅之夜', 'A night of the Fallas'),
    description: t(
      '在法雅节那天去过橙树广场。',
      'Spent the Fallas in the Plaça dels Tarongers.',
    ),
    check: (state) => state.flags.includes('visited-festival:falles'),
  },
  {
    id: 'es-four-festivals',
    name: t('一年四节', 'A year of fiestas'),
    description: t(
      '三王游行、法雅节、圣胡安之夜、瓦伦西亚日都去过。',
      'Joined the Kings’ parade, the Fallas, Sant Joan and the Nou d’Octubre.',
    ),
    check: (state) =>
      (['reis', 'falles', 'sant-joan', 'nou-octubre'] as const).every(
        (festival) => state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'es-ccse',
    name: t('宪法读过一遍', 'Read the constitution'),
    description: t('通过游戏里的 CCSE。', 'Passed the in-game CCSE.'),
    check: (state) => state.flags.includes('ccse-passed'),
  },
  {
    id: 'es-dele',
    name: t('能用西语办事了', 'Getting things done in Spanish'),
    description: t('通过游戏里的 DELE A2。', 'Passed the in-game DELE A2.'),
    check: (state) => state.flags.includes('dele-passed'),
  },
  {
    id: 'es-cita',
    name: t('抢到 cita previa', 'Got a cita previa'),
    description: t(
      '在图书馆抢到外国人办公室的预约。',
      'Booked an immigration office appointment at the library.',
    ),
    check: (state) => state.flags.includes('cita-booked'),
  },
  {
    id: 'es-sea-bass',
    name: t('防波堤的海鲈', 'Breakwater sea bass'),
    description: t(
      '在防波堤钓到海鲈。',
      'Caught a sea bass off the breakwater.',
    ),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'llobarro'),
  },
  {
    id: 'es-arros',
    name: t('自己的一锅饭', 'A pan of your own'),
    description: t(
      '亲手做了一锅海鲜锅饭。',
      'Cooked an arròs a banda yourself.',
    ),
    check: (state) =>
      !!state.lifeRecords?.dishes.some(
        (record) => record.itemId === 'arros-a-banda',
      ),
  },
  {
    id: 'es-regular',
    name: t('吧台的老位置', 'A regular at the bar'),
    description: t('和托内特成为老朋友。', 'Became good friends with Tonet.'),
    check: (state) => (state.friendship.tonet ?? 0) >= 500,
  },
];
