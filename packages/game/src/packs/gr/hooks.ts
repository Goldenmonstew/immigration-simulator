import type { CountryResult } from '@uk-immigration/engine';
import { addDays, addMonths } from '../../calendar';
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
import { grBalance as b } from './balance';
import { grCharacters } from './characters';
import {
  isBlueCard,
  pathwayOf,
  renewalWindow,
  src,
  timing,
  unfiledTaxYear,
  values,
  type GrEffect,
  type GrFestival,
  type GrState,
  type GrTimeline,
} from './rules';
import {
  euro,
  festivalFoods,
  grFish,
  grItems,
  grNotices,
  grPlaces,
} from './town';

type GrTools = GameTools<GrTimeline, CountryResult, GrEffect, GrFestival>;
type GrActivity = Activity<GrEffect, GrFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

export const characterOf = (id: string) => {
  const character = grCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

/** Orthodox Easter Sunday: the Julian computus, shifted to the Gregorian calendar. */
export function orthodoxEaster(year: number): IsoDate {
  const d = (19 * (year % 19) + 15) % 30;
  const e = (2 * (year % 4) + 4 * (year % 7) - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const julian = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // The calendars are 13 days apart from 1900 to 2099.
  return addDays(julian, 13);
}

// Customary dates, not policy (see grFestivals).
function festivalDate(festival: GrFestival, year: number): IsoDate {
  if (festival === 'theophany') return `${year}-01-06`;
  if (festival === 'easter') return orthodoxEaster(year);
  if (festival === 'panigyri') return `${year}-08-15`;
  return `${year}-10-28`;
}
const quarterFestival: Record<1 | 2 | 3 | 4, GrFestival> = {
  1: 'theophany',
  2: 'easter',
  3: 'panigyri',
  4: 'ochi',
};
export function calendar(state: GrState) {
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

const festivalResults: Record<GrFestival, Text> = {
  theophany: t(
    '一个渔夫的儿子举着十字架浮出水面，全码头都在欢呼。你分到的那块新年蛋糕里，没有硬币，但有一整年的好运气。',
    'A fisherman’s son surfaces with the cross and the whole quay cheers. Your slice of New Year cake has no coin, but the luck comes anyway.',
  ),
  easter: t(
    '你的红蛋撞赢了三个邻居。涅斐莉不服气，非要再来一局。',
    'Your red egg cracks three neighbours’ in a row. Nefeli demands a rematch.',
  ),
  panigyri: t(
    '左手拉着埃莱妮，右手拉着一个陌生人，你终于踩对了舞步。布祖基琴一直弹到半夜。',
    'Eleni on your left and a stranger on your right, you finally get the steps. The bouzouki plays past midnight.',
  ),
  ochi: t(
    '涅斐莉举着班旗走在最前面，经过你时偷偷眨了一下眼。',
    'Nefeli carries her class banner at the front and winks as she passes you.',
  ),
};

/**
 * The renewal fee and any late-filing fine on the day of filing. A part month
 * counts as a month (PD-150).
 */
function renewalFees(state: GrState) {
  const expiry = state.timeline.currentCardExpiresOn;
  let late = 0;
  while (addMonths(expiry, late) < state.day.date) late++;
  const fees = values.workFees.value;
  return {
    fee: fees.permit + fees.print,
    fine: late * timing.lateFinePerMonthEur.value,
    late,
  };
}
/** Μ.3 filed over a year after the Ο.3 expired (SRC-087 art. 93Α(2)–(3)). */
const lateGreekFamilyFee = (state: GrState) => {
  const gf = values.gfPeriods.value;
  const expiry = state.timeline.greekFamily!.priorCardExpiry!;
  return state.date > addMonths(expiry, gf.lateFeeAfterYears * 12)
    ? gf.lateFee
    : 0;
};
const settleFees = (state: GrState) =>
  isBlueCard(state)
    ? values.longTermCard.value.initialFee + values.longTermCard.value.cardFee
    : values.gfPeriods.value.applicationFee +
      values.cardFormalities.value.printFee +
      lateGreekFamilyFee(state);
/** The fine for reporting changes late today; a repeat costs more. */
function lateReport(state: GrState) {
  const { months, firstFine, repeatFine } = values.changeReporting.value;
  const late = ({ occurredOn, reportedOn }: GrTimeline['changes'][number]) =>
    addMonths(occurredOn, months) < (reportedOn ?? state.day.date);
  const { changes } = state.timeline;
  if (!changes.some((change) => !change.reportedOn && late(change)))
    return undefined;
  const repeat = changes.some((change) => change.reportedOn && late(change));
  return { fine: repeat ? repeatFine : firstFine, repeat };
}

const visaHours = grPlaces.find((place) => place.id === 'visa')!.hours!;
/**
 * Whether the migration office can still take an address report today after
 * an action. Play skips ahead between days, so the next working day may fall
 * outside the reporting period.
 */
const reportableToday = (state: GrState, minutes: number) =>
  visaHours.dayKinds!.includes(state.day.kind) &&
  state.day.minute + minutes + b.minutes.paperwork <= visaHours.closes;

export function actionAvailable(
  state: GrState,
  action: GrActivity,
  { affordable }: GrTools,
): boolean | undefined {
  if (action.id === 'rent-brighter-home' || action.id === 'leave-brighter-home')
    return (
      reportableToday(state, action.minutes) &&
      affordable(state, action.effects)
    );
  // Fees added in actionDetails count towards what the player can afford.
  if (action.id === 'settle')
    return (
      pathwayOf(state.result, 'pr')?.status === 'MET' &&
      state.stats.money >= settleFees(state)
    );
  if (action.id === 'naturalise')
    return (
      pathwayOf(state.result, 'nat')?.status === 'MET' &&
      affordable(state, action.effects)
    );
  if (action.id === 'exam')
    return (
      state.timeline.integration?.basis !== 'a2' &&
      affordable(state, action.effects)
    );
  if (action.id === 'pegp')
    return (
      state.timeline.nationality.exam !== 'certificate' &&
      affordable(state, action.effects)
    );
  if (action.id === 'report-change')
    return state.stats.money >= (lateReport(state)?.fine ?? 0);
  if (action.id === 'tax-return') return unfiledTaxYear(state) !== undefined;
  if (action.id === 'extend') {
    const { early, late } = renewalWindow(state.timeline.currentCardExpiresOn);
    // Any quarter that reaches the window may file early; the late period
    // ends on its own day.
    return (
      isBlueCard(state) &&
      !state.flags.includes('quarter-visa-renewed') &&
      addMonths(state.date, b.monthsPerQuarter) > early &&
      state.day.date <= late &&
      state.stats.money >= renewalFees(state).fee + renewalFees(state).fine
    );
  }
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < 1050
  )
    return false;
}

export function actionDetails(state: GrState, action: GrActivity): void {
  if (action.id === 'settle') {
    const fee = settleFees(state);
    action.label = isBlueCard(state)
      ? t(
          `递交欧盟长期居民 Μ.1 申请（申请费与制卡费共 ${euro(fee)}，${src(values.longTermCard)}）`,
          `Apply for EU long-term residence Μ.1 (application and card ${euro(fee)}, ${src(values.longTermCard)})`,
        )
      : t(
          `申请希腊公民家属永久居留卡 Μ.3（申请费 ${euro(values.gfPeriods.value.applicationFee)}、制卡 ${euro(values.cardFormalities.value.printFee)}${lateGreekFamilyFee(state) ? `、逾期 ${euro(lateGreekFamilyFee(state))}` : ''}，${src(values.gfPeriods)}）`,
          `Apply for the permanent card for a Greek citizen’s family, Μ.3 (application ${euro(values.gfPeriods.value.applicationFee)}, card ${euro(values.cardFormalities.value.printFee)}${lateGreekFamilyFee(state) ? `, late filing ${euro(lateGreekFamilyFee(state))}` : ''}, ${src(values.gfPeriods)})`,
        );
    action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
  }
  if (action.id === 'exam' || action.id === 'pegp') {
    const score = action.id === 'exam' ? b.greekA2Score : b.greekPegpScore;
    if (state.stats.greek >= score)
      action.effects = [
        ...action.effects,
        { type: action.id === 'exam' ? 'a2' : 'pegp' },
      ];
    action.note =
      action.id === 'exam'
        ? t(
            `游戏内希腊语 ${state.stats.greek} / ${score}。通过后记为已取得 A2 希腊语与历史文化证书，可用于长期居留的融入条件。`,
            `In-game Greek ${state.stats.greek} / ${score}. A pass records the A2 Greek language and history certificate for the long-term residence integration requirement.`,
          )
        : t(
            `游戏内希腊语 ${state.stats.greek} / ${score}。通过后记为已取得 Π.Ε.Γ.Π. 证书，用于入籍的考试与材料条件。`,
            `In-game Greek ${state.stats.greek} / ${score}. A pass records the Π.Ε.Γ.Π. certificate for the naturalisation exam and documents.`,
          );
  }
  if (action.id === 'extend') {
    const { fee, fine, late } = renewalFees(state);
    const expiry = state.timeline.currentCardExpiresOn;
    const years = values.workValidity.value.blueRenewalYears;
    action.label = late
      ? t(
          `逾期续期蓝卡（${expiry} 已到期；许可与制卡 ${euro(fee)}，逾期 ${late} 个月罚款 ${euro(fine)}；续期 ${years} 年）`,
          `Renew the Blue Card late (expired ${expiry}; permit and card ${euro(fee)}, ${late}-month late fine ${euro(fine)}; renewed for ${years} years)`,
        )
      : t(
          `续期欧盟蓝卡（现卡到 ${expiry}；许可与制卡 ${euro(fee)}，${src(values.workFees)}；续期 ${years} 年，${src(values.workValidity)}）`,
          `Renew the EU Blue Card (current card to ${expiry}; permit and card ${euro(fee)}, ${src(values.workFees)}; renewed for ${years} years, ${src(values.workValidity)})`,
        );
    action.effects = [{ type: 'money', delta: -fee - fine }, ...action.effects];
  }
  if (action.id === 'tax-return') {
    const year = unfiledTaxYear(state);
    action.label = t(
      `申报 ${year} 年度个人所得税（E1）`,
      `File the ${year} tax return (E1)`,
    );
  }
  const late = action.id === 'report-change' && lateReport(state);
  if (late) {
    const { fine, repeat } = late;
    action.label = t(
      `补报新住址（已超过 ${values.changeReporting.value.months} 个月，${repeat ? '再次逾期' : ''}罚款 ${euro(fine)}，${src(values.changeReporting)}）`,
      `Report your new address late (over ${values.changeReporting.value.months} months; ${repeat ? 'repeat ' : ''}fine ${euro(fine)}, ${src(values.changeReporting)})`,
    );
    action.effects = [{ type: 'money', delta: -fine }, ...action.effects];
  }
}

// Record which application is filed before its ending text is written.
export function beforeAction(state: GrState, action: GrActivity): void {
  if (action.id === 'settle' || action.id === 'naturalise')
    state.flags = [
      ...state.flags,
      action.id === 'settle' ? 'applied-pr' : 'applied-nat',
    ];
}

export function afterAction(
  state: GrState,
  next: GrState & { outcome: Outcome },
  action: GrActivity,
  log: LogEntry,
  { applyEffects, setFlags }: GrTools,
): void {
  if (action.id === 'extend')
    log.renewalValidTo = next.timeline.currentCardExpiresOn;
  if (action.id === 'board') {
    const posted = grNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'report-change')
    next.outcome.text = t(
      '窗口的职员在系统里改好住址，又把一张盖了章的回执递给你。',
      'The clerk updates your address in the system and hands you a stamped receipt.',
    );
  if (action.id === 'tax-return')
    next.outcome.text = t(
      '萨纳西斯一边接电话一边敲键盘：「好了，清缴单下个月出来。下一个！」',
      'Thanasis types with the phone on his shoulder. “Done, the assessment comes next month. Next!”',
    );
  const festival = next.day.festival;
  if (
    festival &&
    (action.id === 'festival' ||
      ['cross-dive', 'egg-tapping', 'circle-dance', 'parade'].includes(
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
  state: GrState,
  next: GrState & { outcome: Outcome },
  action: GrActivity,
  log: LogEntry,
): void {
  if (action.id !== 'exam' && action.id !== 'pegp') return;
  const score = action.id === 'exam' ? b.greekA2Score : b.greekPegpScore;
  if (state.stats.greek >= score) {
    next.outcome.text =
      action.id === 'exam'
        ? t(
            'A2 考试通过了。证书和税单、租约放进了同一个文件夹。',
            'You passed the A2 exam. The certificate goes into the folder with the tax forms and the lease.',
          )
        : t(
            'Π.Ε.Γ.Π. 通过了！卡捷琳娜老师在走廊里给了你一个大大的拥抱。',
            'You passed the Π.Ε.Γ.Π.! Katerina gives you a big hug in the corridor.',
          );
  } else {
    next.eventQueue.unshift('system-exam-failed');
    next.outcome.text = t(
      `这次还差一点（游戏内希腊语 ${state.stats.greek} / ${score}）。`,
      `Not quite there yet (in-game Greek ${state.stats.greek} / ${score}).`,
    );
  }
  log.text = next.outcome.text;
}

const shopGoods = [
  'mountain-tea',
  'koulouri',
  'baklava',
  'flowers',
  'olive-oil',
];
export function shopStock(state: GrState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return grItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  // The street market sells this season's produce.
  if (place === 'market')
    return grItems.filter(
      (item) =>
        item.kind === 'crop' &&
        grItems.some(
          (seed) =>
            seed.grows?.crop === item.id &&
            seed.grows.seasons.includes(state.quarter),
        ),
    );
  if (place !== 'shop') return [];
  return grItems.filter((item) =>
    item.grows
      ? item.grows.seasons.includes(state.quarter)
      : shopGoods.includes(item.id),
  );
}

export function catchItem(state: GrState, { random }: GrTools) {
  // Sardines and mackerel school in the warm months; bream like rough water.
  const fish = grFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['sea-bream', 'red-mullet']
      : state.quarter === 1
        ? ['red-mullet', 'sea-bream', 'mackerel']
        : ['sardine', 'mackerel', 'red-mullet', 'sea-bream'];
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
  state: () => GrState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.greek < b.greekPegpScore &&
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
    if (state().stats.health < b.routineHealthTarget) run('nap', 'home', 840);
    if (state().pendingEvent) return;
    if (state().stats.mood < b.routineMoodTarget) run('bench', 'bench', 1020);
  } else
    run(
      'festival',
      'green',
      state().day.festival === 'panigyri' ? b.panigyriStart : b.festivalStart,
    );
}

export function endingText(state: GrState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    settled: state.flags.includes('applied-nat')
      ? t(
          '入籍申请递进了国籍司。等公报印出你的名字，还要去礼堂宣誓。可你早已把利马纳基叫作家了。',
          'The naturalisation application is with the citizenship directorate. When the Gazette prints your name there will be an oath to take, but you already call Limanaki home.',
        )
      : character.settlement,
    left: t(
      '行李箱合上，电车沿着海岸开远。你选择离开希腊，这局生活到这里收好。',
      'The suitcase closes and the tram rolls away along the coast. You chose to leave Greece, ending this game.',
    ),
    overstayed: t(
      '居留卡过了逾期补交的期限还没有续上，这段利马纳基的生活在这里结束。\n下一局可以留意顶栏的剩余月数，到期前去移民局办事处续期。',
      'Your card lapsed past the late renewal period, ending this game.\nNext time, watch the months left in the top bar and renew at the migration office first.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请材料还在抽屉里。这局走到了时间尽头，利马纳基的日记在这里合上。',
      'The application is still in the drawer. This game has reached its time limit, and the Limanaki diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: GrState): Text {
  return t(
    `账户里最后是 ${euro(state.stats.money)}，还有许多没法记账的人情。`,
    `The account ends at ${euro(state.stats.money)}, alongside debts of kindness no bank records.`,
  );
}

export const grAchievements: Achievement<
  GrTimeline,
  CountryResult,
  GrFestival
>[] = [
  {
    id: 'gr-easter',
    name: t('基督复活了', 'Christ is risen'),
    description: t(
      '在广场上过了一次复活节。',
      'Spent an Easter on the square.',
    ),
    check: (state) => state.flags.includes('visited-festival:easter'),
  },
  {
    id: 'gr-four-feasts',
    name: t('一年的节日', 'A year of feasts'),
    description: t(
      '主显节、复活节、八月十五和学生游行都去过。',
      'Joined Theophany, Easter, the August feast and the Ochi Day parade.',
    ),
    check: (state) =>
      (['theophany', 'easter', 'panigyri', 'ochi'] as const).every((festival) =>
        state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'gr-a2',
    name: t('能用希腊语办事了', 'Getting by in Greek'),
    description: t('通过 A2 希腊语考试。', 'Passed the A2 Greek exam.'),
    check: (state) => state.flags.includes('a2-passed'),
  },
  {
    id: 'gr-pegp',
    name: t('Π.Ε.Γ.Π.', 'Π.Ε.Γ.Π.'),
    description: t(
      '通过入籍知识考试。',
      'Passed the naturalisation knowledge exam.',
    ),
    check: (state) => state.flags.includes('pegp-passed'),
  },
  {
    id: 'gr-renewed',
    name: t('新的居留卡', 'A new residence card'),
    description: t('续期一次欧盟蓝卡。', 'Renewed the EU Blue Card once.'),
    check: (state) => state.flags.includes('visa-renewed'),
  },
  {
    id: 'gr-bream',
    name: t('防波堤上的金头鲷', 'Bream off the breakwater'),
    description: t(
      '在防波堤钓到金头鲷。',
      'Caught a gilt-head bream off the breakwater.',
    ),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'sea-bream'),
  },
  {
    id: 'gr-regular',
    name: t('小酒馆的老熟人', 'A taverna regular'),
    description: t(
      '和斯塔夫罗斯成为老朋友。',
      'Became good friends with Stavros.',
    ),
    check: (state) => (state.friendship.stavros ?? 0) >= 500,
  },
];
