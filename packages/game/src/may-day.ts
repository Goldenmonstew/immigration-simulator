import { balance as b } from './balance';
import type { Activity, GameState, Text } from './types';

export const mayDayActivities: Activity[] = [
  {
    id: 'may-prepare-ribbons',
    place: 'council',
    minutes: 30,
    label: {
      zhCN: '为五月节扎彩带（免费）',
      en: 'Tie ribbons for May Day (free)',
    },
    effects: [{ type: 'none' }],
  },
  {
    id: 'may-prepare-signs',
    place: 'council',
    minutes: 30,
    label: {
      zhCN: '为五月节画路牌（免费）',
      en: 'Paint direction signs for May Day (free)',
    },
    effects: [{ type: 'none' }],
  },
  {
    id: 'may-guide',
    place: 'green',
    minutes: b.minutes.festival,
    label: {
      zhCN: '沿路牌接引来逛五月节的人',
      en: 'Guide May Day visitors along the signs',
    },
    when: [{ festival: 'may-day' }, { minuteMin: 600 }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  },
  {
    id: 'may-followup',
    place: 'council',
    minutes: 15,
    label: {
      zhCN: '看看五月节收回来的物件',
      en: 'Check the things brought back from May Day',
    },
    effects: [{ type: 'none' }],
  },
];

export function mayDayVenue(state: GameState, action: Activity): Activity {
  if (
    state.day.festival === 'may-day' &&
    ['rain', 'snow'].includes(state.day.weather) &&
    ['may-ribbons', 'may-guide'].includes(action.id)
  )
    return {
      ...action,
      place: 'council',
      label:
        action.id === 'may-ribbons'
          ? {
              zhCN: '在市政厅绕彩带',
              en: 'Dance with ribbons in the town hall',
            }
          : {
              zhCN: '在市政厅按路牌接引来客',
              en: 'Guide visitors inside the town hall',
            },
    };
  return action;
}

export function mayDayAvailable(state: GameState, id: string): boolean {
  if (id.startsWith('may-prepare-'))
    return (
      state.quarter === 2 &&
      state.day.index < 2 &&
      !(state.mayDay?.year === state.year && state.mayDay.preparation)
    );
  if (id === 'may-followup')
    return (
      state.mayDay?.participationDay !== undefined &&
      state.dayNumber > state.mayDay.participationDay &&
      !state.mayDay.followupSeen
    );
  return !(state.mayDay?.year === state.year && state.mayDay.participation);
}

const guideResults: Text[] = [
  {
    zhCN: '你领来客绕过花摊，对方还回头确认了一次箭头。',
    en: 'You lead visitors round the flower stall. One looks back to check the arrow again.',
  },
  {
    zhCN: '你替推车让开路，把被篮子挡住的箭头露出来。',
    en: 'You make room for a pushchair and uncover the arrow behind a basket.',
  },
  {
    zhCN: '你扶正歪牌，来客循着箭头找到了甜面包。',
    en: 'You straighten a leaning sign. Visitors follow its arrow to the buns.',
  },
];
const indoorResults: Text[] = [
  {
    zhCN: '你在市政厅绕过彩带结，桌边的人腾出了转身的空位。',
    en: 'You circle a ribbon knot in the town hall; people by the table make room to turn.',
  },
  {
    zhCN: '你在市政厅接住彩带尾，鞋底在地垫边停了一拍。',
    en: 'You catch a ribbon end in the town hall, pausing at the edge of the doormat.',
  },
  {
    zhCN: '你在市政厅理开彩带，邻座把椅子挪开，给你让路。',
    en: 'You untangle ribbons in the town hall. A neighbour moves a chair out of your way.',
  },
];

/** Called only after an available, explicitly selected May Day action. */
export function completeMayDay(
  state: GameState,
  id: string,
  dance: Text,
): Text {
  if (id === 'may-followup') {
    state.mayDay!.followupSeen = true;
    if (state.mayDay!.preparation === 'ribbons')
      return {
        zhCN: '你在市政厅认出自己扎的彩带。便条写着：「剪刀收回了，带子留着。玛格丽特。」你把松结重新扎好。',
        en: 'You recognise the ribbons you tied at the town hall. A note reads, “Shears returned. Keeping the ribbons. Margaret.” You retie a loose knot.',
      };
    if (state.mayDay!.preparation === 'signs')
      return {
        zhCN: '你在市政厅认出自己画的路牌。加雷思留了字：「门口右拐，到储物柜停。」你循着箭头把牌放回去。',
        en: 'You recognise your painted sign at the town hall. Gareth’s note says, “Right at the door. Stop at the cupboard.” You follow its arrow to put the sign away.',
      };
    return {
      zhCN: '你在市政厅看到五月节收回的篮子，里面还夹着空纸袋。你把袋子展平，垫回篮底。',
      en: 'You find the returned May Day baskets at the town hall. You flatten an empty paper bag and line a basket with it.',
    };
  }
  if (state.mayDay?.year !== state.year) state.mayDay = { year: state.year };
  const memory = state.mayDay!;
  if (id.startsWith('may-prepare-')) {
    memory.preparation = id === 'may-prepare-ribbons' ? 'ribbons' : 'signs';
    return memory.preparation === 'ribbons'
      ? {
          zhCN: '你在市政厅扎好彩带。玛格丽特的便条压在剪刀下：「带结扎紧，别扎住剪刀！」你把成捆的带子留下。',
          en: 'You tie ribbons in the town hall. Margaret’s note sits beneath the shears: “Tie the knots tight. Leave my shears free!” You leave the bundle ready.',
        }
      : {
          zhCN: '你在市政厅画好路牌。加雷思留的草图写着：「从入口走，到花摊左拐。」你把箭头描粗，搁在架上晾干。',
          en: 'You paint signs in the town hall. Gareth’s sketch says, “From the entrance, left at the flowers.” You thicken the arrows and leave the signs to dry.',
        };
  }
  memory.participation = id === 'may-ribbons' ? 'dance' : 'guide';
  memory.participationDay = state.dayNumber;
  memory.indoors = ['rain', 'snow'].includes(state.day.weather);
  const prefix: Text =
    memory.preparation === 'ribbons'
      ? {
          zhCN: '你扎的彩带已经挂好。',
          en: 'The ribbons you tied are hanging. ',
        }
      : memory.preparation === 'signs'
        ? {
            zhCN: '你画的路牌立在入口。',
            en: 'Your painted signs stand at the entrance. ',
          }
        : { zhCN: '', en: '' };
  const rotation = (state.year - 1) % 3;
  const result =
    id === 'may-ribbons'
      ? memory.indoors
        ? indoorResults[rotation]
        : dance
      : memory.indoors
        ? {
            zhCN: `你在市政厅接引来客。${guideResults[rotation].zhCN}`,
            en: `You guide visitors in the town hall. ${guideResults[rotation].en}`,
          }
        : guideResults[rotation];
  return { zhCN: prefix.zhCN + result.zhCN, en: prefix.en + result.en };
}
