import type { CountryResult } from '@uk-immigration/engine';
import { auCharges, australia2026_11 } from '@uk-immigration/policy-data';
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
import { auBalance as b } from './balance';
import { auCharacters } from './characters';
import {
  currentResult,
  lastIncomeYear,
  pathwayOf,
  type AuEffect,
  type AuFestival,
  type AuState,
  type AuTimeline,
} from './rules';
import { auFish, auItems, auNotices, festivalFoods } from './town';

type AuTools = GameTools<AuTimeline, CountryResult, AuEffect, AuFestival>;
type AuActivity = Activity<AuEffect, AuFestival>;
type AuEvent = GameEvent<AuEffect, AuFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const aud = (value: number) => `AUD ${value.toLocaleString('en-AU')}`;
// Trips back within these years before lodging need the case-by-case call.
const hongKongYears = australia2026_11.values.hongKongRegionalYears.value;
const festivalActions = [
  'festival',
  'beach-cricket',
  'anzac-rosemary',
  'kick-to-kick',
  'show-produce',
];

export const characterOf = (id: string) => {
  const character = auCharacters.find((item) => item.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
};

// Customary dates for the public days; the town's grand final (last Saturday
// in August) and show (third Saturday in October) are game settings.
function festivalDate(festival: AuFestival, year: number): IsoDate {
  if (festival === 'australia-day') return `${year}-01-26`;
  if (festival === 'anzac-day') return `${year}-04-25`;
  if (festival === 'footy-final')
    return addDays(firstWeekday(`${year}-08-31`, 6), -7);
  return addDays(firstWeekday(`${year}-09-30`, 6), 14);
}
const quarterFestival: Record<1 | 2 | 3 | 4, AuFestival> = {
  1: 'australia-day',
  2: 'anzac-day',
  3: 'footy-final',
  4: 'show-day',
};
export function calendar(state: AuState) {
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

const festivalResults: Record<AuFestival, Text> = {
  'australia-day': t(
    '你的球被凯一棒打进了海里，全场欢呼。仪式结束后，镇上把多出来的本土树苗分给了大家。',
    'Kai whacks your delivery into the sea and the whole lawn cheers. After the ceremony, the council hands out the spare native seedlings.',
  ),
  'anzac-day': t(
    '你把迷迭香放在花圈旁边。号声落下后，道格拍了拍你的肩，递来一块饼干。',
    'You lay the rosemary beside the wreaths. When the bugle falls quiet, Doug pats your shoulder and passes you a biscuit.',
  ),
  'footy-final': t(
    '你的球歪歪扭扭飞出去，凯冲过来接住，大喊一声「好球！」看台上笑成一片。',
    'Your kick wobbles off sideways; Kai dives for it and yells “Mark!” The stand roars with laughter.',
  ),
  'show-day': t(
    '评委在你的菜上别了一条「值得表扬」的绿丝带。贝芙比你还高兴，非要请你吃司康。',
    'The judge pins a “highly commended” ribbon on your vegetables. Bev is even happier than you and insists on buying you a scone.',
  ),
};

/** The first-instalment charge for the character's stream, as policy-data records it. */
function lodgementFee(state: AuState) {
  const tariff =
    state.timeline.pathway === 'AU-191'
      ? auCharges.regional
      : auCharges.regionalHk;
  return { fee: tariff.value.standard[0], locator: tariff.sources[0].locator };
}

/**
 * Only the Hong Kong streams' continuous usual residence is pending, a
 * case-by-case call after a trip (PD-108): the application can go in and
 * Home Affairs decides it. Fees are a budget, not a requirement.
 */
export function residencePending(state: AuState) {
  const pathway = pathwayOf(currentResult(state));
  return (
    pathway?.status === 'UNKNOWN' &&
    pathway.checks.every(
      (check) =>
        check.status === 'MET' ||
        check.id.startsWith('AU-FEES-') ||
        (check.id === 'AU-191-HK-time-residence' &&
          !!check.pendingDetails?.includes('PD-108')),
    )
  );
}

/**
 * Every call in this pack is from Wattle Bay or from the family back home,
 * and the invitations ask the player to turn up. On a trip home none fits, so
 * calls wait until the player is back (the shared game keeps them for later).
 */
export function eventAvailable(state: AuState, event: AuEvent): boolean {
  return !(state.trip && event.channel === 'phone');
}

export function actionAvailable(
  state: AuState,
  action: AuActivity,
): boolean | undefined {
  const { regional, publicInterest } = state.timeline;
  if (action.id === 'settle')
    return (
      (pathwayOf(currentResult(state))?.status === 'MET' ||
        residencePending(state)) &&
      state.stats.money >= lodgementFee(state).fee
    );
  if (action.id === 'tax-return')
    return !(regional.assessmentYears ?? []).includes(
      lastIncomeYear(state.date),
    );
  if (action.id === 'health-exam') return publicInterest.health !== 'cleared';
  if (action.id === 'police-check')
    return publicInterest.policeDocuments !== 'supplied';
  if (action.id === 'swim' && state.day.weather === 'rain') return false;
  // The conversation group meets in the evening on workdays.
  if (
    action.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < 1050
  )
    return false;
}

export function actionDetails(state: AuState, action: AuActivity): void {
  if (action.id === 'settle') {
    const { fee, locator } = lodgementFee(state);
    action.label =
      state.timeline.pathway === 'AU-191'
        ? t(
            `在 ImmiAccount 递交 191 永居申请（申请费 ${aud(fee)}，SRC-200 ${locator}）`,
            `Lodge your 191 application in ImmiAccount (charge ${aud(fee)}, SRC-200 ${locator})`,
          )
        : t(
            `在 ImmiAccount 递交 191 香港偏远地区类别申请（申请费 ${aud(fee)}，SRC-200 ${locator}）`,
            `Lodge your 191 Hong Kong (Regional) application in ImmiAccount (charge ${aud(fee)}, SRC-200 ${locator})`,
          );
    const from = auCharges.effectiveFrom.value;
    action.note = t(
      `现实中签证在 ImmiAccount 网上递交，游戏放在服务中心的自助电脑上。费用按 ${from} 生效的费率估算，实际金额以递交当天的费表为准。`,
      `In real life visas are lodged online in ImmiAccount; the game puts the kiosk at the service centre. The charge is estimated from the rates in force from ${from}; the actual amount follows the fee table on the day you lodge.`,
    );
    if (residencePending(state)) {
      action.label = t(
        `${action.label.zhCN.slice(0, -1)}；连续通常居住由内政部核对）`,
        `${action.label.en.slice(0, -1)}; Home Affairs decides continuous usual residence)`,
      );
      action.note = t(
        `评估里只剩"连续通常居住"待确认：离境后是否仍算通常居住须个案判断（PD-108），由内政部在审理时核对。${action.note.zhCN}`,
        `Only continuous usual residence is pending in the assessment: whether you stayed usually resident through a trip is a case-by-case call (PD-108) that Home Affairs makes when it decides the application. ${action.note.en}`,
      );
    }
    action.effects = [{ type: 'money', delta: -fee }, ...action.effects];
  }
  if (action.id === 'tax-return') {
    const year = lastIncomeYear(state.date);
    const span = `${year - 1}–${String(year).slice(2)}`;
    action.label = t(
      `在 myGov 报 ${span} 财年的税`,
      `Lodge your ${span} tax return on myGov`,
    );
    if (state.timeline.pathway === 'AU-191-HK')
      action.note = t(
        '财年结束后可报上一财年的税。191 香港类别不看评税通知，报税只换来退税；退税金额是游戏设定。',
        'Once a financial year ends you can lodge for it. The 191 Hong Kong (Regional) stream does not assess notices of assessment, so lodging only brings the refund, which is a game setting.',
      );
  }
  if (action.id === 'swim' && state.quarter === 3)
    action.label = t('冬天下海游一圈（冷！）', 'A winter dip (cold!)');
  if (action.id.startsWith('travel-') && state.timeline.pathway === 'AU-191-HK')
    action.note = t(
      `${action.note!.zhCN}香港类别离境后是否仍算连续通常居住须个案判断（PD-108，SRC-200 191.232）：回来后的 ${hongKongYears} 年内，评估会把这一项显示为待确认，进度条也不给日期；其他条件都满足后，仍可在政府服务中心递交，由内政部核对。`,
      `${action.note!.en} Whether the Hong Kong streams still treat you as continuously usually resident after a trip is a case-by-case call (PD-108, SRC-200 191.232): for ${hongKongYears} years after you return, the assessment shows it as unknown and the progress bar gives no date. Once everything else is met, you can still lodge at the service centre and Home Affairs decides it.`,
    );
}

export function actionFlags(action: AuActivity): string[] | undefined {
  if (action.id === 'settle') return ['applied-pr'];
}

// Before the effects run: the ending text reads what was pending at lodgement.
export function beforeAction(state: AuState, action: AuActivity): void {
  if (action.id === 'settle' && residencePending(state))
    state.flags.push('lodged-residence-pending');
}

export function afterAction(
  state: AuState,
  next: AuState & { outcome: Outcome },
  action: AuActivity,
  log: LogEntry,
  { applyEffects, setFlags }: AuTools,
): void {
  if (action.id === 'board') {
    const posted = auNotices.filter((notice) =>
      next.flags.includes(`quarter-board-${notice.id}`),
    );
    if (posted.length)
      next.outcome.text = {
        zhCN: posted.map((notice) => notice.text.zhCN).join('\n'),
        en: posted.map((notice) => notice.text.en).join('\n'),
      };
  }
  if (action.id === 'tax-return')
    next.outcome.text = t(
      `评税通知到了：${lastIncomeYear(state.date)} 年 6 月结束的财年，退税 $${b.taxRefund}。你把 PDF 存进了「191 材料」文件夹。`,
      `Your notice of assessment arrives for the income year ending June ${lastIncomeYear(state.date)}, with a $${b.taxRefund} refund. The PDF goes into your “191 papers” folder.`,
    );
  if (action.id === 'health-exam')
    next.outcome.text = t(
      '验尿、视力、抽血、胸片、医生问诊，排了一整天队。结果由诊所直接上传给内政部。',
      'Urine test, eyesight, blood test, chest X-ray and the doctor: a whole day of queues. The clinic uploads the results straight to Home Affairs.',
    );
  if (action.id === 'police-check')
    next.outcome.text = t(
      '道格核对了你的护照和水电账单。几天后，几份无犯罪证明陆续到了邮箱。',
      'Doug checks your passport and a utility bill. Over the next few days the police certificates land in your inbox.',
    );
  const festival = next.day.festival;
  if (festival && festivalActions.includes(action.id)) {
    setFlags(next, [`visited-festival:${festival}`]);
    if (action.id !== 'festival') {
      const items: Record<string, number> = { [festivalFoods[festival]]: 1 };
      if (festival === 'australia-day') items['native-seedling'] = 1;
      applyEffects(
        next,
        Object.entries(items).map(([item, delta]) => ({
          type: 'item' as const,
          item,
          delta,
        })),
      );
      next.outcome.items = items;
      next.outcome.text = festivalResults[festival];
    }
  }
}

export function shopStock(state: AuState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return auItems.filter(
      (item) => item.id === festivalFoods[state.day.festival!],
    );
  if (place !== 'shop') return [];
  return auItems.filter(
    (item) =>
      item.price !== undefined &&
      (item.grows
        ? item.grows.seasons.includes(state.quarter)
        : ['flat-white', 'lamington', 'pavlova', 'wattle'].includes(item.id)),
  );
}

export function catchItem(state: AuState, { random }: AuTools) {
  // Whiting and snapper come inshore in the warm months; bream like the rain.
  const fish = auFish.map(([id]) => id as string);
  const choices =
    state.day.weather === 'rain'
      ? ['bream', 'flathead']
      : state.quarter === 1
        ? ['whiting', 'snapper', 'flathead']
        : state.quarter === 3
          ? ['bream', 'flathead']
          : ['whiting', 'flathead', 'bream', 'snapper'];
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
  state: () => AuState,
  run: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    run('work', 'work', 480);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.english < 60 && state().stats.money >= b.classCost
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
      state().day.festival === 'anzac-day'
        ? b.anzacStart
        : state().day.festival === 'footy-final'
          ? b.footyStart
          : b.festivalStart,
    );
}

export function endingText(state: AuState, ending: EndingId): Text {
  const settlement = characterOf(state.characterId).settlement;
  const texts: Record<EndingId, Text> = {
    settled: state.flags.includes('lodged-residence-pending')
      ? t(
          `${settlement.zhCN}\n申请里"连续通常居住"一项还待内政部个案核对（PD-108），结果要等审理。`,
          `${settlement.en}\nWhether you stayed usually resident through your trip is still for Home Affairs to decide case by case (PD-108); the outcome waits on the decision.`,
        )
      : settlement,
    left: t(
      '行李箱合上，火车驶离金合欢湾，窗外的海一点点变小。你选择离开澳大利亚，这局生活到这里收好。',
      'The suitcase closes and the train pulls out of Wattle Bay, the sea shrinking in the window. You chose to leave Australia, ending this game.',
    ),
    overstayed: t(
      '签证到期了，还没有新的签证接上，这段金合欢湾的生活在这里结束。\n下一局可以留意顶栏的剩余月数，在签证到期前办好下一步。',
      'Your visa ended before another took over, ending this game.\nNext time, watch the months left in the top bar and take the next step before it runs out.',
    ),
    criminal: t(
      '一项记录让审查停了下来，故事在这里停笔。',
      'A record halts the review, and the story stops here.',
    ),
    timeout: t(
      '申请还没有递交。这局走到了时间尽头，金合欢湾的日记在这里合上。',
      'The application was never lodged. This game has reached its time limit, and the Wattle Bay diary closes here.',
    ),
  };
  return texts[ending];
}

export function ledgerText(state: AuState): Text {
  return t(
    `账户最后是 $${Math.round(state.stats.money).toLocaleString('en-AU')}，还有没写进账单的牵挂。`,
    `The account ends at $${Math.round(state.stats.money).toLocaleString('en-AU')}, alongside things it cannot count.`,
  );
}

export const auAchievements: Achievement<
  AuTimeline,
  CountryResult,
  AuFestival
>[] = [
  {
    id: 'au-four-festivals',
    name: t('一年四节', 'A year of town days'),
    description: t(
      '澳大利亚日、澳新军团日、总决赛和农业展都去过。',
      'Joined Australia Day, Anzac Day, the grand final and the show.',
    ),
    check: (state) =>
      (
        ['australia-day', 'anzac-day', 'footy-final', 'show-day'] as const
      ).every((festival) =>
        state.flags.includes(`visited-festival:${festival}`),
      ),
  },
  {
    id: 'au-tax-time',
    name: t('报税达人', 'Tax time sorted'),
    description: t(
      '在金合欢湾报过一次税。',
      'Lodged a tax return in Wattle Bay.',
    ),
    check: (state) =>
      state.flags.some((flag) => flag.startsWith('tax-lodged-')),
  },
  {
    id: 'au-papers-ready',
    name: t('材料齐了', 'Paperwork ready'),
    description: t(
      '做完移民体检，拿到无犯罪证明。',
      'Finished the visa medical and the police checks.',
    ),
    check: (state) =>
      state.flags.includes('health-cleared') &&
      state.flags.includes('police-supplied'),
  },
  {
    id: 'au-flathead',
    name: t('码头的鲬鱼', 'Flathead off the jetty'),
    description: t('在码头钓到鲬鱼。', 'Caught a flathead off the jetty.'),
    check: (state) =>
      !!state.lifeRecords?.fish.some((record) => record.itemId === 'flathead'),
  },
  {
    id: 'au-fair-dinkum',
    name: t('地道澳式口语', 'Fair dinkum'),
    description: t('澳式口语练到 80。', 'Reached 80 in Aussie English.'),
    check: (state) => state.stats.english >= 80,
  },
  {
    id: 'au-regular',
    name: t('鹈鹕酒店的常客', 'A Pelican regular'),
    description: t('和加扎成为老朋友。', 'Became good friends with Gazza.'),
    check: (state) => (state.friendship.gazza ?? 0) >= 500,
  },
];
