import type { Activity, GameState, Text } from './types';

// L23: a fictional shared growing project, using the existing plots and seeds.
export const flowerbedActivities: Activity[] = (
  [
    {
      id: 'flowerbed-mark',
      place: 'allotment',
      minutes: 30,
      label: {
        zhCN: '按玛格丽特的便条标出公共花坛（免费）',
        en: 'Mark the public flowerbed from Margaret’s note (free)',
      },
      effects: [{ type: 'none' }],
    },
    {
      id: 'flowerbed-work',
      place: 'allotment',
      minutes: 45,
      label: {
        zhCN: '为花坛松土，使用拉赫曼留下的公用苗（免费）',
        en: 'Loosen flowerbed soil for Rahman’s shared seedlings (free)',
      },
      effects: [{ type: 'none' }],
    },
    ...(['sunflower', 'tulip'] as const).map((flower): Activity => ({
      id: `flowerbed-donate-${flower}`,
      place: 'allotment',
      minutes: 15,
      label:
        flower === 'sunflower'
          ? {
              zhCN: '捐出一格自己育的向日葵苗',
              en: 'Donate a plot of your own sunflower seedlings',
            }
          : {
              zhCN: '捐出一格自己育的郁金香苗',
              en: 'Donate a plot of your own tulip seedlings',
            },
      effects: [{ type: 'none' }],
    })),
    {
      id: 'flowerbed-plant',
      place: 'allotment',
      minutes: 30,
      label: {
        zhCN: '把备好的苗栽进公共花坛（免费）',
        en: 'Plant the prepared seedlings in the public flowerbed (free)',
      },
      effects: [{ type: 'none' }],
    },
    {
      id: 'flowerbed-tend',
      place: 'allotment',
      minutes: 30,
      label: {
        zhCN: '按值班便条给花坛浇水、扶苗（免费）',
        en: 'Water and support the flowerbed following the rota note (free)',
      },
      effects: [{ type: 'none' }],
    },
    {
      id: 'flowerbed-open',
      place: 'allotment',
      minutes: 15,
      label: {
        zhCN: '挂好玛格丽特和拉赫曼写的花坛牌（免费）',
        en: 'Hang the flowerbed sign from Margaret and Rahman (free)',
      },
      effects: [{ type: 'none' }],
    },
  ] satisfies Activity[]
).map((action) => ({ ...action, when: [{ minuteMin: 420, minuteMax: 1080 }] }));

function seedlingPlot(state: GameState, flower: string) {
  return state.plots.findIndex(
    (plot) => plot.seed === `seed-${flower}` && plot.growth > 0,
  );
}
function laterQuarter(state: GameState, actionId: string) {
  const action = state.log.find(
    (entry) => entry.kind === 'action' && entry.id === actionId,
  );
  return (
    !!action &&
    (state.year > action.year ||
      (state.year === action.year && state.quarter > action.quarter))
  );
}
export function flowerbedAvailable(state: GameState, id: string): boolean {
  const has = (flag: string) => state.flags.includes(`flowerbed-${flag}`);
  if (id === 'flowerbed-mark') return !has('marked');
  if (id === 'flowerbed-work' || id.startsWith('flowerbed-donate-'))
    return (
      has('marked') &&
      !has('prepared') &&
      laterQuarter(state, 'flowerbed-mark') &&
      (id === 'flowerbed-work' ||
        seedlingPlot(state, id.slice('flowerbed-donate-'.length)) >= 0)
    );
  if (id === 'flowerbed-plant') return has('prepared') && !has('planted');
  if (id === 'flowerbed-tend')
    return (
      has('planted') && !has('tended') && laterQuarter(state, 'flowerbed-plant')
    );
  return has('tended') && !has('open');
}

/** Applies only an explicitly chosen flowerbed activity; calendar ticks do nothing. */
export function completeFlowerbed(state: GameState, id: string): Text {
  if (id === 'flowerbed-mark') {
    state.flags.push('flowerbed-marked');
    return {
      zhCN: '你照便条拉好绳线。玛格丽特写着：「别占菜地入口！下季再来松土，苗有人备。」花坛边界留下了。',
      en: 'You stretch string along the note’s outline. Margaret has written, “Leave the allotment entrance clear! Come back next season for the soil; seedlings are covered.” The boundary stays marked.',
    };
  }
  if (id === 'flowerbed-work' || id.startsWith('flowerbed-donate-')) {
    state.flags.push('flowerbed-prepared');
    if (id === 'flowerbed-work') {
      state.flags.push('flowerbed-contribution-work');
      return {
        zhCN: '你弯腰把土松开。拉赫曼在公用苗盘上写着：「老朋友，这盘留给大家。」你把苗移到绳线旁，等着栽下。',
        en: 'You bend to loosen the soil. Rahman’s shared tray says, “Old friend, these are for everyone.” You move the seedlings beside the string, ready to plant.',
      };
    }
    const flower = id.slice('flowerbed-donate-'.length);
    state.plots[seedlingPlot(state, flower)] = { growth: 0 };
    state.flags.push(`flowerbed-contribution-${flower}`);
    return flower === 'sunflower'
      ? {
          zhCN: '你把自己育的向日葵苗连土移出，原来那格空了。拉赫曼留下的苗盘正好接住，苗先放在绳线旁。',
          en: 'You lift your sunflower seedlings with their soil, leaving your plot empty. Rahman’s spare tray holds them beside the string until planting.',
        }
      : {
          zhCN: '你把自己育的郁金香苗连土移出，原来那格空了。拉赫曼留下的苗盘正好接住，苗先放在绳线旁。',
          en: 'You lift your tulip seedlings with their soil, leaving your plot empty. Rahman’s spare tray holds them beside the string until planting.',
        };
  }
  if (id === 'flowerbed-plant') {
    state.flags.push('flowerbed-planted');
    return {
      zhCN: '你把备好的苗栽下，压实根边的土。玛格丽特在便条背面添了浇水安排：「下季再来扶苗，先让根站稳。」',
      en: 'You plant the prepared seedlings and firm the soil. Margaret adds a watering rota on the note’s back: “Come back next season to support them. Let the roots settle first.”',
    };
  }
  if (id === 'flowerbed-tend') {
    state.flags.push('flowerbed-tended');
    return {
      zhCN: '你照值班便条浇水，把歪苗扶正。拉赫曼送来的小牌背面还沾着商店价签的胶，等你找个稳当位置挂。',
      en: 'You follow the rota, water the bed and support a leaning plant. Rahman’s little sign still has shop-label glue on the back; you look for a firm place to hang it.',
    };
  }
  state.flags.push('flowerbed-open');
  const contribution: Text = state.flags.includes('flowerbed-contribution-work')
    ? {
        zhCN: '你松过的土边立起小牌，公用苗已经站稳。',
        en: 'The sign stands by the soil you loosened; the shared seedlings are established.',
      }
    : state.flags.includes('flowerbed-contribution-sunflower')
      ? {
          zhCN: '你育的向日葵旁立起小牌，原来那盘苗已经站稳。',
          en: 'The sign stands beside the sunflowers you raised; your seedlings are established.',
        }
      : {
          zhCN: '你育的郁金香旁立起小牌，原来那盘苗已经站稳。',
          en: 'The sign stands beside the tulips you raised; your seedlings are established.',
        };
  return {
    zhCN: `${contribution.zhCN}玛格丽特写了值班名，拉赫曼补了「欢迎坐坐」。你把绳头收进小屋。`,
    en: `${contribution.en} Margaret has added the rota names and Rahman “Come and sit”. You put the spare string in the shed.`,
  };
}
