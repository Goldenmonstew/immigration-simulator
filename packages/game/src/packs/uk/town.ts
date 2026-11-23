import { balance as b } from '../../balance';
import { characterOf } from '../../characters';
import { festivalFoods } from '../../festivals';
import { items } from '../../items';
import { completeSurprise } from '../../map-surprises';
import type {
  EndingId,
  GameEvent,
  GameState,
  Npc,
  PlaceId,
  Text,
  FestivalId,
} from '../../types';
import { englishExam, failedExamText } from './actions';
import { episodeAt } from './rules';
import type { UkTools } from './types';

export function endingText(state: GameState, ending: EndingId): Text {
  const character = characterOf(state.characterId);
  const texts: Record<EndingId, Text> = {
    settled: character.settlement,
    left: {
      zhCN: '行李箱合上，小镇留在了车窗后面。你选择离开英国，这局生活到这里收好。',
      en: 'The suitcase closes, and the town slips behind the train window. You chose to leave the UK, ending this game.',
    },
    // After switching, the Graduate advice no longer fits (playtest P2).
    overstayed: (!state.flags.includes('graduate-switched') &&
      character.graduateRoute?.overstayed) || {
      zhCN: '许可到期前没有续签上，这段小镇生活在这里结束。\n下一局可以留意顶栏的剩余月数，去签证中心办续签。',
      en: 'Your permission expired before you renewed it, ending this game.\nNext time, watch the months remaining in the top bar and visit the visa centre to renew.',
    },
    criminal: {
      zhCN: '定罪记录让材料转交审查，故事在这里停笔。犯罪记录触发了这局游戏的结束。',
      en: 'A conviction sends the papers for review. The criminal record ends this game here.',
    },
    timeout: {
      zhCN: '抽屉里的定居材料仍没递出去。这局走到了时间尽头，小镇日记在这里合上。',
      en: 'The settlement folder is still in the drawer. This game has reached its time limit, and the town diary closes here.',
    },
  };
  return texts[ending];
}

export function eventAvailable(state: GameState, event: GameEvent): boolean {
  return !(
    state.timeline.lifeInTheUk &&
    'passed' in state.timeline.lifeInTheUk &&
    [
      'sw-kol',
      'common-book',
      'common-book-after',
      'common-kol-retake',
    ].includes(event.id)
  );
}

export function randomEvent(state: GameState, event: GameEvent): boolean {
  return !characterOf(state.characterId).graduateRoute?.recruitment.includes(
    event,
  );
}

export function eventView(state: GameState, event: GameEvent): GameEvent {
  if (event.id !== 'system-exam-failed') return event;
  const result = failedExamText(englishExam(state).target);
  return {
    ...event,
    text: {
      zhCN: `${result.zhCN}\n${event.text.zhCN}`,
      en: `${result.en}\n${event.text.en}`,
    },
  };
}

export function afterChoice(
  state: GameState,
  next: GameState,
  event: GameEvent,
  choiceId: string,
  { random, setFlags }: UkTools,
): Text | undefined {
  const previousSalary = episodeAt(state)?.salary;
  if (
    [
      'sw-salary-talk',
      'bno-salary-review',
      'bno-cafe-manager',
      'family-first-full-payslip',
    ].includes(event.id) &&
    previousSalary !== undefined &&
    (episodeAt(next)?.salary ?? previousSalary) > previousSalary
  )
    setFlags(next, ['quarter-promoted']);
  if (event.id === 'bno-new-employer') setFlags(next, ['quarter-job-changed']);
  if (event.id === 'town-lina-papers') {
    const chance =
      choiceId === 'stay' ? b.linaStaySupported : b.linaStayUnaccompanied;
    setFlags(next, [
      random(next) < chance ? 'lina-can-stay' : 'lina-will-leave',
    ]);
  }
  return completeSurprise(next, event.id, choiceId);
}

export function afterQuarter(
  state: GameState,
  previousFlags: string[],
  { setFlags }: UkTools,
): void {
  if (previousFlags.includes('quarter-community-lunch-attended'))
    setFlags(state, ['quarter-community-lunch-followup']);
}

export function routine(
  state: () => GameState,
  routine: (id: string, place: PlaceId, minute: number) => void,
): void {
  if (state().day.kind === 'workday') {
    routine('work', 'work', 540);
    if (state().pendingEvent) return;
    if (!state().day.done.includes('auto-evening')) {
      const evening =
        state().stats.english < b.englishB2 &&
        state().stats.money >= b.classCost
          ? 'class'
          : state().stats.mood < b.routineMoodTarget
            ? 'relax'
            : 'bench';
      routine(
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
    routine('rest', 'home', b.wakeMinute);
    if (state().pendingEvent) return;
    if (state().stats.health < b.routineHealthTarget)
      routine('nap', 'home', 600);
    if (state().pendingEvent) return;
    if (state().stats.mood < b.routineMoodTarget)
      routine('bench', 'bench', 660);
    if (state().pendingEvent) return;
    if (state().stats.mood < b.routineMoodTarget) routine('relax', 'pub', 720);
  } else
    routine(
      'festival',
      'green',
      state().day.festival === 'bonfire-night' ? b.bonfireStart : 600,
    );
}

export function npcAvailable(state: GameState, npc: Npc): boolean {
  return !(npc.id === 'lina' && state.flags.includes('lina-left'));
}

export function lineAvailable(
  state: GameState,
  npc: string,
  line: Npc['lines'][number],
): boolean {
  return !(
    npc === 'jamie' &&
    state.flags.includes('family-jamie-unemployed') &&
    !state.flags.includes('family-jamie-reemployed') &&
    /^jamie-daily-3[1-6]$/.test(line.id)
  );
}

export function priorityLine(
  next: GameState,
  eligible: Npc['lines'],
  { recordLife }: UkTools,
): Npc['lines'][number] | undefined {
  const lunchMemory = eligible.find(
    (line) => line.id === 'margaret-recent-community-lunch',
  );
  if (lunchMemory) {
    next.flags = next.flags.filter(
      (flag) => flag !== 'quarter-community-lunch-followup',
    );
    recordLife(next, 'community-lunch-followup', lunchMemory.text);
  }
  return lunchMemory;
}

export function shopStock(state: GameState, place: PlaceId) {
  if (place === 'green' && state.day.festival)
    return items.filter(
      (i) => i.id === festivalFoods[state.day.festival as FestivalId],
    );
  if (place !== 'shop') return [];
  return items.filter(
    (i) =>
      i.price !== undefined &&
      (i.grows
        ? i.grows.seasons.includes(state.quarter)
        : ['tea', 'biscuits', 'flowers', 'cake'].includes(i.id)),
  );
}

export function catchItem(next: GameState, { random, setFlags }: UkTools) {
  const choices =
    next.day.weather === 'rain'
      ? ['tench', 'bream', 'carp']
      : next.quarter === 1
        ? ['pike', 'perch', 'roach']
        : next.quarter === 3
          ? ['carp', 'tench', 'bream']
          : ['perch', 'roach', 'carp'];
  if (next.day.minute >= b.phoneEnd) choices.push('pike');
  const junk = random(next) < b.fishingJunkChance;
  const available = junk ? ['old-boot', 'shopping-trolley'] : choices;
  const item = available[Math.floor(random(next) * available.length)];
  if (!junk && item === 'pike') setFlags(next, ['caught-pike']);
  return { item, junk };
}

export function ledgerText(state: GameState): Text {
  return {
    zhCN: `账本最后留下 £${Math.round(state.stats.money).toLocaleString('en-GB')}，还有没写进账本的牵挂。`,
    en: `The ledger holds £${Math.round(state.stats.money).toLocaleString('en-GB')}, alongside things it cannot count.`,
  };
}
