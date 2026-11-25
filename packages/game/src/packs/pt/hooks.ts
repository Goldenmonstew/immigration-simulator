import type { CountryResult } from '@uk-immigration/engine';
import { addDays, addMonths, firstWeekday } from '../../calendar';
import type { GameTools } from '../../content-pack';
import type {
  Achievement,
  Activity,
  EndingId,
  GameEvent,
  IsoDate,
  LogEntry,
  Outcome,
  PlaceId,
  Text,
} from '../../model';
import { ptBalance as b } from './balance';
import { ptCharacters } from './characters';
import {
  currentCard,
  pathwayOf,
  permanentFee,
  permanentFileable,
  renewalFee,
  renewalPending,
  renewalWindow,
  type PtEffect,
  type PtFestival,
  type PtState,
  type PtTimeline,
} from './rules';
import {
  basicPortuguese,
  eur,
  festivalFoods,
  ptFish,
  ptItems,
  ptNotices,
} from './town';

type PtTools = GameTools<PtTimeline, CountryResult, PtEffect, PtFestival>;
type PtActivity = Activity<PtEffect, PtFestival>;
type PtEvent = GameEvent<PtEffect, PtFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

export const characterOf = (id: string) => {
  const character = ptCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

// Customary dates, not policy (see ptFestivals). The June arraial is held on
// the Saturday after 19 June.
function festivalDate(festival: PtFestival, year: number): IsoDate {
  if (festival === 'reis') return `${year}-01-06`;
  if (festival === 'cravos') return `${year}-04-25`;
  if (festival === 'santos') return firstWeekday(`${year}-06-19`, 6);
  return `${year}-11-11`;
}
const quarterFestival: Record<1 | 2 | 3 | 4, PtFestival> = {
  1: 'reis',
  2: 'cravos',
  3: 'santos',
  4: 'magusto',
};
export function calendar(state: PtState) {
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

const festivalResults: Record<PtFestival, Text> = {
  reis: t(
    '你跟在手鼓后面唱完了第三家，嗓子有点哑。法蒂玛奶奶塞给你一大块国王蛋糕。',
    'Three doors in behind the tambourine, your voice is going. Dona Fátima presses a thick slice of bolo-rei on you.',
  ),
  cravos: t(
    '花贩把一朵红康乃馨别在你的衣襟上。乐队走过广场，杜阿尔特举着花在前面跑。',
    'A flower seller pins a red carnation on you. The band crosses the square with Duarte running ahead, flower held high.',
  ),
  santos: t(
    '沙丁鱼的油滴在面包上，手风琴拉到第五首，你终于跟上了街坊的舞步。',
    'Sardine oil soaks into the bread. By the fifth accordion tune you finally keep step with the neighbours.',
  ),
  magusto: t(
    '栗子烫得在两只手之间来回倒。若阿金大叔说，剥得满手黑才算过了圣马丁。',
    'The chestnuts are too hot to hold for long. Sr. Joaquim says it isn’t São Martinho until your hands are black.',
  ),
};

/** Whether this game has the routes behind an action. */
const assessedFor = (state: PtState, target: PtTimeline['targets'][number]) =>
  state.timeline.targets.includes(target);

export function actionAvailable(
  state: PtState,
  action: PtActivity,
  { affordable }: PtTools,
): boolean | undefined {
  const { steps } = state.timeline;
  const today = state.day.date;
  // Fees join the effects only in actionDetails, after this check. An
  // application goes in today, so the card (or a pending renewal's receipt,
  // SRC-123 art. 78(7)) must still run today.
  if (action.id === 'settle')
    return (
      permanentFileable(state) &&
      (today <= currentCard(state).to! || renewalPending(state)) &&
      affordable(state, [{ type: 'money', delta: -(permanentFee(today) ?? 0) }])
    );
  if (action.id === 'extend') {
    const { opens, closes } = renewalWindow(state);
    return (
      !renewalPending(state) &&
      today >= opens &&
      today <= closes &&
      affordable(state, [{ type: 'money', delta: -(renewalFee(today) ?? 0) }])
    );
  }
  if (action.id === 'criminal-record') return !steps.record;
  if (action.id === 'declaration-papers')
    return assessedFor(state, 'partner') && !steps.papers;
  // The papers count once the assessment includes them (see answersOn).
  if (action.id === 'declare')
    return (
      assessedFor(state, 'partner') &&
      !!steps.papers &&
      steps.papers <= state.date &&
      pathwayOf(state, 'nat')?.status === 'MET' &&
      affordable(state, action.effects)
    );
  if (action.id === 'exam')
    return !steps.ciple && affordable(state, action.effects);
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < 1050
  )
    return false;
}

const noFeeTable = t(
  '办理当天没有已归档的 AIMA 费表，PD-398，游戏不收费',
  'no archived AIMA fee table for today, PD-398; the game charges nothing',
);
export function actionDetails(state: PtState, action: PtActivity): void {
  const today = state.day.date;
  if (action.id === 'extend') {
    const fee = renewalFee(today);
    action.label =
      fee === undefined
        ? t(
            `申请临时居留续期（${noFeeTable.zhCN}）`,
            `Apply to renew your temporary residence (${noFeeTable.en})`,
          )
        : t(
            `申请临时居留续期（审理费与续卡 ${eur(fee)}，SRC-476）`,
            `Apply to renew your temporary residence (analysis and renewed card ${eur(fee)}, SRC-476)`,
          );
    if (fee !== undefined)
      action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
  }
  if (action.id === 'settle') {
    const fee = permanentFee(today);
    action.label =
      fee === undefined
        ? t(
            `递交永久居留申请（${noFeeTable.zhCN}）`,
            `Apply for permanent residence (${noFeeTable.en})`,
          )
        : t(
            `递交永久居留申请（审理费与首张永久卡 ${eur(fee)}，SRC-476）`,
            `Apply for permanent residence (analysis and first permanent card ${eur(fee)}, SRC-476)`,
          );
    const checks = Object.fromEntries(
      (pathwayOf(state, 'pr')?.checks ?? []).map(({ id, status }) => [
        id,
        status,
      ]),
    );
    const notes: Text[] = [];
    if (checks['PT-B03'] === 'UNKNOWN')
      notes.push(
        t(
          '「稳定生计」待确认：月净收入够不够由 AIMA 按个案核对（PD-385），游戏不预设结论。',
          'Stable means is pending: AIMA checks the net income case by case (PD-385), and the game does not assume the answer.',
        ),
      );
    if (checks['PT-B01'] === 'UNKNOWN')
      notes.push(
        t(
          '临时居留的持有期限待确认：续期仍待 AIMA 决定，卡到期后的时间能否算作持有许可由 AIMA 核对（PD-145、PD-433）。',
          'The temporary residence holding period is pending: the renewal still awaits AIMA, and AIMA checks whether the time after the card ended counts as holding a permit (PD-145, PD-433).',
        ),
      );
    if (checks['PT-B01-CANCELLATION-RISK'] !== 'MET')
      notes.push(
        t(
          '评估提示出境时间可能让许可被注销（SRC-123 art. 85）。这一项不影响路径状态，结果页也只作提示；是否注销由 AIMA 决定。',
          'The assessment notes that your time abroad may lead to the permit being cancelled (SRC-123 art. 85). It does not change the pathway status and the result page shows it as a note; AIMA decides on any cancellation.',
        ),
      );
    if (notes.length)
      action.note = {
        zhCN: notes.map((note) => note.zhCN).join(''),
        en: notes.map((note) => note.en).join(' '),
      };
    if (fee !== undefined)
      action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
  }
  if (action.id === 'exam') {
    if (state.stats.portuguese >= b.portugueseExamScore)
      action.effects = [...action.effects, { type: 'ciple' }];
    action.note = t(
      `游戏内葡语 ${state.stats.portuguese} / ${b.portugueseExamScore}。通过后记为当天取得的 CIPLE 证书，即永久居留要求的基础葡语（${basicPortuguese}，SRC-480），下一季的评估起计入。`,
      `In-game Portuguese ${state.stats.portuguese} / ${b.portugueseExamScore}. A pass records the CIPLE certificate on the day, the basic Portuguese (${basicPortuguese}) permanent residence asks for (SRC-480); it joins the assessment from next quarter.`,
    );
  }
}

const applicationFlags: Record<string, string> = {
  settle: 'applied-pr',
  declare: 'applied-nat',
};
// Before the effects run: the ending text reads which application was made.
export function beforeAction(state: PtState, action: PtActivity): void {
  const flag = applicationFlags[action.id];
  if (flag && !state.flags.includes(flag)) state.flags.push(flag);
}

const festivalActions = ['janeiras', 'carnation', 'arraial', 'magusto'];
export function afterAction(
  state: PtState,
  next: PtState & { outcome: Outcome },
  action: PtActivity,
  log: LogEntry,
  { applyEffects, setFlags }: PtTools,
): void {
  if (action.id === 'board') {
    const posted = ptNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'criminal-record')
    next.outcome.text = t(
      '鲁伊在窗口后面敲了几下键盘，打印机吐出一张盖着电子章的证明。',
      'Rui taps at his keyboard behind the counter and the printer slides out a certificate with an electronic seal.',
    );
  if (action.id === 'declaration-papers')
    next.outcome.text = t(
      '职员核对了出生证明、婚姻登记和无犯罪记录证明，在预约单上写下日期。',
      'The clerk checks the birth certificate, marriage record and criminal record certificate, and writes a date on the appointment slip.',
    );
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
  state: PtState,
  next: PtState & { outcome: Outcome },
  action: PtActivity,
  log: LogEntry,
): void {
  if (action.id !== 'exam') return;
  if (state.stats.portuguese >= b.portugueseExamScore) {
    next.outcome.text = t(
      'CIPLE 通过了。证书收进文件夹，和社保缴费记录放在一起。',
      'You passed CIPLE. The certificate goes into the folder beside the social security record.',
    );
  } else {
    next.eventQueue.unshift('system-exam-failed');
    next.outcome.text = t(
      `CIPLE 还差一点（游戏内葡语 ${state.stats.portuguese} / ${b.portugueseExamScore}）。`,
      `Not quite there yet (in-game Portuguese ${state.stats.portuguese} / ${b.portugueseExamScore}).`,
    );
  }
  log.text = next.outcome.text;
}

export function shopStock(state: PtState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return ptItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return ptItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['bica', 'pastel-de-nata', 'pao-de-lo', 'flowers'].includes(item.id)),
  );
}

export function catchItem(state: PtState, { random }: PtTools) {
  // Mullet are always about; sea bass like the cooler months, bream the warm.
  const fish = ptFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['tainha', 'carapau']
      : state.quarter === 1
        ? ['tainha', 'robalo', 'carapau']
        : ['tainha', 'dourada', 'robalo', 'carapau'];
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
  state: () => PtState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.portuguese < b.portugueseExamScore &&
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
      state().day.festival === 'santos' ? b.arraialStart : b.festivalStart,
    );
}

/**
 * Thiago's tip waits until the temporary residence period is met, as the
 * engine assesses it for the day being played.
 */
export function eventAvailable(state: PtState, event: PtEvent) {
  if (event.id !== 'zx-five-years') return true;
  return (
    pathwayOf(state, 'pr')?.checks.find(({ id }) => id === 'PT-B01')?.status ===
    'MET'
  );
}

export function endingText(state: PtState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const partner = state.timeline.targets.includes('partner');
  const declared = state.flags.includes('applied-nat');
  const texts: Record<EndingId, Text> = {
    // Each character's own text is for their own route's application.
    settled:
      partner === declared
        ? character.settlement
        : declared
          ? t(
              '国籍声明递进了登记处。审理还要一段时间，可你早已把燕子街区叫作家了。',
              'The nationality declaration is with the registry. It will take a while, but you already call Andorinhas home.',
            )
          : t(
              'AIMA 的窗口收下了永久居留申请，回执上盖了章。审理还要一段时间。',
              'The AIMA window takes your permanent residence application and stamps the receipt. Review takes a while.',
            ),
    left: t(
      '行李箱合上，地铁开往机场。你选择离开葡萄牙，这局生活到这里收好。',
      'The suitcase closes and the Metro heads for the airport. You chose to leave Portugal, ending this game.',
    ),
    overstayed: partner
      ? t(
          '居留卡到期，之后的居留权也过了期限，这段燕子街区的生活在这里结束。\n婚姻取得国籍不看居留：条件满足后，声明本来可以在居留期限内去登记处递交。下一局可以留意顶栏的剩余月数，及时续期或递交。',
          'Your card expired and the residence right after it has run out too, ending this game.\nNationality by marriage does not depend on residence: once it was met, the declaration could have gone to the registry while you were still resident. Next time, watch the months left in the top bar and renew or file in time.',
        )
      : t(
          '居留卡到期，之后的居留权也过了期限，这段燕子街区的生活在这里结束。\n下一局可以留意顶栏的剩余月数，在续期窗口里申请续期，或在到期前递交申请。',
          'Your card expired and the residence right after it has run out too, ending this game.\nNext time, watch the months left in the top bar: renew in the renewal window or file before the card ends.',
        ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请材料还在抽屉里。这局走到了时间尽头，燕子街区的日记在这里合上。',
      'The application is still in the drawer. This game has reached its time limit, and the Andorinhas diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: PtState): Text {
  return t(
    `账户最后是 ${eur(Math.round(state.stats.money))}，还有记不进账本的牵挂。`,
    `The account ends at ${eur(Math.round(state.stats.money))}, alongside things it cannot count.`,
  );
}

export const ptAchievements: Achievement<
  PtTimeline,
  CountryResult,
  PtFestival
>[] = [
  {
    id: 'pt-arraial',
    name: t('六月的晚上', 'A June night'),
    description: t(
      '在圣人节晚会吃过烤沙丁鱼。',
      'Ate sardines at the Santos arraial.',
    ),
    check: (state) => state.flags.includes('visited-festival:santos'),
  },
  {
    id: 'pt-four-festivals',
    name: t('四季的节日', 'Festivals of four seasons'),
    description: t(
      '三王节、康乃馨日、圣人节、圣马丁节都去过。',
      'Joined Dia de Reis, Carnation Day, the Santos and São Martinho.',
    ),
    check: (state) =>
      (['reis', 'cravos', 'santos', 'magusto'] as const).every((festival) =>
        state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'pt-ciple',
    name: t('能用葡语办事了', 'Getting things done in Portuguese'),
    description: t(
      '通过游戏里的 CIPLE 考试。',
      'Passed the in-game CIPLE exam.',
    ),
    check: (state) => state.flags.includes('ciple-passed'),
  },
  {
    id: 'pt-fado',
    name: t('灯灭以后', 'When the lights go down'),
    description: t(
      '在街角小酒馆听过一场法朵。',
      'Heard fado at the Tasca da Esquina.',
    ),
    check: (state) =>
      state.log.some((entry) => entry.kind === 'action' && entry.id === 'fado'),
  },
  {
    id: 'pt-sea-bass',
    name: t('河口来的狼鲈', 'Sea bass from the estuary'),
    description: t('在特茹河岸钓到狼鲈。', 'Caught a sea bass on the Tagus.'),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'robalo'),
  },
  {
    id: 'pt-regular',
    name: t('小酒馆的常客', 'A tasca regular'),
    description: t('和若阿金成为老朋友。', 'Became good friends with Joaquim.'),
    check: (state) => (state.friendship.joaquim ?? 0) >= 500,
  },
];
