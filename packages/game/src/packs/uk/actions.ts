import { addDays, firstWeekday } from '../../calendar';
import { balance as b } from '../../balance';
import { characterOf } from '../../characters';
import {
  completeFlowerbed,
  flowerbedAvailable,
} from '../../community-flowerbed';
import { festivalActivities, festivalFoods, notices } from '../../festivals';
import {
  graduateApplication,
  graduateEpisode,
  graduateSalaryPreview,
} from '../../graduate-route';
import { items } from '../../items';
import { extensionCost, extensionFor } from '../../locations';
import { completeMayDay, mayDayAvailable } from '../../may-day';
import type {
  Activity,
  GameState,
  Locale,
  LogEntry,
  Outcome,
  Text,
  FestivalId,
} from '../../types';
import { celebrationResults, festivalResults, noticeDate } from './calendar';
import { episodeAt } from './rules';
import type { UkTools } from './types';

type ActionState = GameState & { outcome: Outcome };

export function englishExam(state: GameState): {
  level: 'B1' | 'B2' | undefined;
  target: 'B1' | 'B2';
  required: number;
} {
  const score = state.stats.english;
  const level =
    score >= b.englishB2 ? 'B2' : score >= b.englishB1 ? 'B1' : undefined;
  const evidence = state.timeline.english;
  const target =
    level === 'B2' ||
    (evidence && 'cefrLevel' in evidence && evidence.cefrLevel === 'B1')
      ? 'B2'
      : 'B1';
  return {
    level,
    target,
    required: target === 'B2' ? b.englishB2 : b.englishB1,
  };
}

export function failedExamText(target: 'B1' | 'B2'): Text {
  return {
    zhCN: `英语考试没通过，分数还没到 ${target}。`,
    en: `You didn't pass the ${target} English test this time.`,
  };
}

function cropName(crop: string, quantity: number) {
  const name = items.find((i) => i.id === crop)!.name.en.toLowerCase();
  if (quantity === 1 || crop === 'corn') return name;
  return crop === 'tomato' || crop === 'potato' ? `${name}es` : `${name}s`;
}
function showQuantity(state: GameState, crop: string) {
  const record = state.flags.find((f) =>
    f.startsWith(`quarter-harvest:${crop}:`),
  );
  return Math.min(
    state.inventory[crop] ?? 0,
    record ? Number(record.split(':')[2]) : 0,
    b.showMaxQuantity,
  );
}

export function actionAvailable(
  state: GameState,
  a: Activity,
  { affordable, available }: UkTools,
): boolean | undefined {
  if (a.id.startsWith('may-') && !mayDayAvailable(state, a.id)) return false;
  if (a.id.startsWith('flowerbed-') && !flowerbedAvailable(state, a.id))
    return false;
  if (a.id.startsWith('community-lunch-')) {
    if (
      state.flags.includes(
        `community-lunch-attended:${state.day.date.slice(0, 4)}`,
      )
    )
      return false;
    if (
      a.id !== 'community-lunch-attend' &&
      (state.flags.includes('quarter-community-lunch-tables') ||
        state.flags.includes('quarter-community-lunch-food') ||
        state.day.minute + a.minutes > 720)
    )
      return false;
  }
  if (
    a.id === 'life-in-the-uk' &&
    state.timeline.lifeInTheUk &&
    'passed' in state.timeline.lifeInTheUk
  )
    return false;
  if (
    a.id.startsWith('summer-show-') &&
    (state.day.done.includes('summer-show') ||
      showQuantity(state, a.id.slice(12)) === 0)
  )
    return false;
  if (a.id === 'graduate-job-search')
    return (
      state.characterId === 'graduate' &&
      episodeAt(state)?.route === 'GRADUATE' &&
      characterOf(state.characterId).graduateRoute!.recruitment.some((event) =>
        available(state, event),
      )
    );
  if (a.id === 'graduate-check-offer' || a.id === 'graduate-switch') {
    if (
      state.characterId !== 'graduate' ||
      episodeAt(state)?.route !== 'GRADUATE' ||
      !state.flags.includes('graduate-cos-ready')
    )
      return false;
    return (
      a.id === 'graduate-check-offer' ||
      (state.stats.money >= extensionCost &&
        graduateApplication(state).status === 'PASS')
    );
  }
  if (
    a.id === 'festival' &&
    state.day.festival === 'bonfire-night' &&
    state.day.minute < b.bonfireStart
  )
    return false;
  if (
    a.id === 'class' &&
    state.day.kind === 'workday' &&
    state.day.minute < b.eveningClass
  )
    return false;
  if (a.id === 'extend') {
    const current = episodeAt(state);
    return (
      current?.role === 'MAIN' &&
      !!extensionFor(current.route) &&
      (current.route !== 'SKILLED_WORKER' || !current.immigrationSalaryList) &&
      (current.route !== 'FAMILY_PARTNER_OR_PARENT' ||
        current.familyPermission === 'PARTNER_FIVE_YEAR') &&
      !state.timeline.episodes.some((e) => e.validFrom > state.date) &&
      state.stats.money >= extensionFor(current.route)!.cost
    );
  }
  if (a.id === 'settle')
    return (
      Object.values(state.result.byRuleSet).some(
        (r) => r?.outcome === 'LIKELY_ELIGIBLE',
      ) && affordable(state, a.effects)
    );
}

export function actionDetails(state: GameState, action: Activity): void {
  if (action.id === 'graduate-switch') {
    const {
      validFrom: _from,
      validTo: _to,
      ...episode
    } = graduateEpisode(state);
    void _from;
    void _to;
    action.effects = [
      { type: 'money', delta: -extensionCost },
      { type: 'newEpisode', episode, durationMonths: b.extensionMonths },
    ];
  }
  if (action.id.startsWith('summer-show-')) {
    const crop = action.id.slice(12);
    const name = items.find((i) => i.id === crop)!.name;
    action.label = {
      zhCN: `带${showQuantity(state, crop)}份${name.zhCN}参加评比`,
      en: `Show ${showQuantity(state, crop)} ${cropName(crop, showQuantity(state, crop))}`,
    };
  }
  if (action.id === 'exam') {
    const { level, target, required } = englishExam(state);
    action.note = {
      zhCN: `本次目标 ${target}。备考进度 ${state.stats.english} / ${required}（游戏内英语属性）。`,
      en: `This test aims for ${target}. Readiness ${state.stats.english} / ${required} (your in-game English stat).`,
    };
    if (level) action.effects = [{ type: 'english', cefrLevel: level }];
  }
  if (action.id === 'extend') {
    const current = episodeAt(state)!;
    const terms = extensionFor(current.route)!;
    const { validFrom: _from, validTo: _to, ...episode } = current;
    void _from;
    void _to;
    action.effects = [
      { type: 'money', delta: -terms.cost },
      {
        type: 'newEpisode',
        episode,
        durationMonths: terms.months,
        start: 'afterCurrent',
      },
    ];
  }
  if (action.id === 'festival' && state.day.festival === 'bonfire-night')
    action.label = {
      zhCN: '捧着热茶看烟花',
      en: 'Watch fireworks with a warm cup',
    };
}

export function actionFlags(action: Activity): string[] | undefined {
  if (action.id === 'extend') return ['visa-renewed', 'quarter-visa-renewed'];
  if (action.id === 'graduate-switch') return ['graduate-switched'];
}

export function beforeAction(state: GameState, action: Activity): void {
  // Show the assessment used to submit (SRC-024 E-ILRP.1.3(1A)).
  // The in-game fee (SRC-031 §9) still reduces the household's cash.
  if (action.id === 'settle')
    state.settlementApplication = { cashSavings: state.timeline.cashSavings };
}

export function afterAction(
  state: GameState,
  next: ActionState,
  action: Activity,
  actionLog: LogEntry,
  { applyEffects, available, makePending, setFlags }: UkTools,
): void {
  if (action.id === 'extend')
    actionLog.renewalValidTo = next.timeline.episodes.at(-1)!.validTo;
  if (action.id === 'graduate-check-offer') {
    const note = characterOf(state.characterId).graduateRoute!.salaryCheckNote;
    const checks = (locale: Locale) =>
      graduateSalaryPreview({ ...state, locale });
    next.outcome.text = {
      zhCN: `${checks('zh-CN')}\n${note.zhCN}`,
      en: `${checks('en')}\n${note.en}`,
    };
    actionLog.text = next.outcome.text;
  }
  if (action.id === 'graduate-switch') {
    next.outcome.text = characterOf(state.characterId).graduateRoute!.switched;
    actionLog.text = next.outcome.text;
  }
  if (action.id === 'graduate-job-search') {
    const event = characterOf(
      state.characterId,
    ).graduateRoute!.recruitment.find((event) => available(next, event))!;
    makePending(next, event.id);
  }
  if (action.id.startsWith('flowerbed-')) {
    next.outcome.text = completeFlowerbed(next, action.id);
    actionLog.text = next.outcome.text;
  }
  if (action.id === 'life-in-the-uk')
    next.outcome.text = {
      zhCN: 'Life in the UK 考试通过了，证明收进文件夹。',
      en: 'You pass the Life in the UK test and file the evidence away.',
    };
  if (action.id === 'board') {
    const posted = notices.filter((n) =>
      next.flags.includes(`quarter-board-${n.id}`),
    );
    const quizDate = firstWeekday(firstWeekday(addDays(state.date, 7), 2), 6);
    next.outcome.text = {
      zhCN: posted
        .map(
          (n) =>
            n.text.zhCN +
            (n.id === 'pub-quiz'
              ? `（${noticeDate(quizDate, 'zh-CN')} 18:00）`
              : n.id === 'community-lunch'
                ? `（${noticeDate(quizDate, 'zh-CN')} 12:00–16:00，最晚15:00入席；当日上午到绿地借桌椅，或带烤土豆、饼干。）`
                : ''),
        )
        .join('\n'),
      en: posted
        .map(
          (n) =>
            n.text.en +
            (n.id === 'pub-quiz'
              ? ` (${noticeDate(quizDate, 'en')}, 18:00)`
              : n.id === 'community-lunch'
                ? ` (${noticeDate(quizDate, 'en')}, 12:00–16:00, last arrival 15:00; that morning, borrow tables on the green or bring a baked potato or biscuits.)`
                : ''),
        )
        .join('\n'),
    };
  }
  if (action.id === 'festival' && next.day.festival)
    next.outcome.text =
      festivalResults[next.day.festival as FestivalId][(next.year - 1) % 3];
  const celebration = Object.entries(festivalActivities).find(
    ([, a]) => a.id === action.id,
  );
  if (celebration) {
    const festival = celebration[0] as FestivalId;
    const food = festivalFoods[festival];
    applyEffects(next, [{ type: 'item', item: food, delta: 1 }]);
    next.outcome.items = { [food]: 1 };
    next.outcome.text = (celebrationResults[festival] ??
      festivalResults[festival])[(next.year - 1) % 3];
  }
  if (action.id.startsWith('summer-show-')) {
    const crop = action.id.slice(12);
    const quantity = showQuantity(state, crop);
    const score = b.showVariety[crop] + quantity;
    const rank =
      score >= b.showRibbonScore
        ? 'ribbon'
        : score >= b.showCommendedScore
          ? 'commended'
          : 'first';
    applyEffects(next, [
      { type: 'stat', key: 'mood', delta: b.showMood[rank] },
      { type: 'friendship', npc: 'margaret', delta: b.showFriendship },
    ]);
    setFlags(next, [`show-result-${rank}`]);
    next.day.done.push('summer-show');
    const result =
      rank === 'ribbon'
        ? { zhCN: '拿到一枚蓝丝带', en: 'win a blue ribbon' }
        : rank === 'commended'
          ? { zhCN: '得到评委的特别夸奖', en: 'receive a special commendation' }
          : {
              zhCN: '留下第一次参展的标签',
              en: 'take home a first-entry label',
            };
    next.outcome.text = {
      zhCN: `${action.label.zhCN}，${result.zhCN}。玛格丽特帮你把收成装回篮子。`,
      en: `You show ${quantity} ${cropName(crop, quantity)} and ${result.en}. Margaret helps return the harvest to your basket.`,
    };
  }
  if (action.id === 'community-lunch-tables') {
    setFlags(next, ['quarter-community-lunch-tables']);
    next.outcome.text = {
      zhCN: '你和玛格丽特搬来折叠桌。她拍了拍桌脚：「得了，歪的那张我坐！」',
      en: 'You carry folding tables with Margaret. She pats a table leg. “Right, I’ll take the wonky one!”',
    };
  }
  if (
    ['community-lunch-baked-potato', 'community-lunch-biscuits'].includes(
      action.id,
    )
  ) {
    setFlags(next, ['quarter-community-lunch-food']);
    const food = action.id.slice('community-lunch-'.length);
    next.outcome.items = { [food]: -1 };
    next.outcome.text =
      action.id === 'community-lunch-baked-potato'
        ? {
            zhCN: '你把烤土豆放上长桌。玛格丽特留好盖子：「瞧这，午饭还没开就香了。」',
            en: 'You set the baked potato on the table. Margaret keeps the lid handy. “Smells good already! Lunch hasn’t even started.”',
          }
        : {
            zhCN: '你把饼干放上长桌。玛格丽特压住包装角：「得了，别让风先吃！」',
            en: 'You put the biscuits on the table. Margaret weighs down the wrapper. “Don’t let the wind eat them first!”',
          };
  }
  if (action.id === 'community-lunch-attend') {
    setFlags(next, [
      `community-lunch-attended:${state.day.date.slice(0, 4)}`,
      'quarter-community-lunch-attended',
      'talked-margaret',
    ]);
    next.outcome.text = state.flags.includes('quarter-community-lunch-tables')
      ? {
          zhCN: '你坐到借来的桌旁。玛格丽特敲敲桌脚：「瞧这，盘子都不晃了！」',
          en: 'You sit at the borrowed table. Margaret taps a leg. “Look, even the plates stay steady!”',
        }
      : state.flags.includes('quarter-community-lunch-food')
        ? {
            zhCN: '你带来的食物摆上长桌。玛格丽特腾出盘子：「得了，给你自己也留点！」',
            en: 'Your food joins the shared table. Margaret makes room for a plate. “Save some for yourself too!”',
          }
        : {
            zhCN: '你空手坐下，玛格丽特往旁边挪了挪：「得了，先坐！这儿还有盘子。」',
            en: 'You arrive empty-handed. Margaret shifts along. “Sit down! There’s a spare plate here.”',
          };
    if (!state.flags.includes('community-lunch-photo-received')) {
      setFlags(next, ['community-lunch-photo-received']);
      applyEffects(next, [
        { type: 'item', item: 'community-lunch-photo', delta: 1 },
      ]);
      next.outcome.items = { 'community-lunch-photo': 1 };
      next.outcome.text.zhCN += '\n你收好聚餐合照。';
      next.outcome.text.en += '\nYou tuck away a photograph of the lunch.';
    }
  }
  if (action.id.startsWith('community-lunch-'))
    actionLog.text = next.outcome.text!;
  if (action.id.startsWith('may-')) {
    next.outcome.text = completeMayDay(next, action.id, next.outcome.text!);
    actionLog.text = next.outcome.text;
    if (action.id === 'may-guide') setFlags(next, ['visited-festival:may-day']);
  }
  if (
    next.day.festival &&
    (action.id === 'festival' ||
      celebration ||
      action.id.startsWith('summer-show-'))
  )
    setFlags(next, [`visited-festival:${next.day.festival}`]);
}

export function afterActionAwards(
  state: GameState,
  next: ActionState,
  action: Activity,
  actionLog: LogEntry,
  { setFlags }: UkTools,
): void {
  if (action.id === 'exam') {
    const { level, target } = englishExam(state);
    if (level === target) {
      setFlags(next, ['quarter-exam-passed']);
      next.outcome.text = {
        zhCN: `英语考试通过了，成绩是 ${level}。`,
        en: `You passed the English test at ${level}.`,
      };
    } else {
      next.eventQueue.unshift('system-exam-failed');
      next.outcome.text = failedExamText(target);
    }
    actionLog.text = next.outcome.text;
  }
}
