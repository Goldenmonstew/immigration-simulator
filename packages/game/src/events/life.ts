import type { GameEvent } from '../types';

// SRC-042 "Travel with your eVisa", opening checklist: current passport,
// correct status and matching carrier details. Updating an account is not an
// immigration decision. Game-year gates and all household details are fiction.
export const lifeEvents: GameEvent[] = [
  {
    id: 'life-new-passport',
    title: { zhCN: '新护照的硬封皮', en: 'The stiff cover of a new passport' },
    text: {
      zhCN: '你收到换发的新护照，正打算探亲。旧本封皮软了，新本还合不拢，UKVI 账户里的证件也得跟着核对。',
      en: 'Your replacement passport arrives as you plan a family trip. The old cover is soft; the new one will barely close. You need to check the document in your UKVI account too.',
    },
    weight: 1,
    once: true,
    channel: 'letter',
    when: [{ yearMin: 4 }],
    choices: [
      {
        id: 'desk',
        label: {
          zhCN: '你把新旧护照放到电脑旁',
          en: 'Put both passports beside the computer',
        },
        effects: [{ type: 'none' }],
        sets: ['life-passport-ready'],
      },
      {
        id: 'list',
        label: {
          zhCN: '你在出行清单上添一项账户核对',
          en: 'Add an account check to your travel list',
        },
        effects: [{ type: 'none' }],
        sets: ['life-passport-ready'],
      },
    ],
  },
  {
    id: 'life-ukvi-update',
    title: { zhCN: '屏幕上的旧号码', en: 'The old number on screen' },
    text: {
      zhCN: '你用新护照核对 UKVI 账户，屏幕上还是旧号码。茶凉了，你把证件与个人资料逐项更新。',
      en: 'You check your UKVI account against the new passport: the old number is still there. Your tea cools as you update the document and personal details.',
    },
    weight: 3,
    once: true,
    channel: 'place:home',
    requires: ['life-passport-ready'],
    choices: [
      {
        id: 'check',
        label: {
          zhCN: '你重新登录，核对更新后的资料',
          en: 'Sign back in to check the updated details',
        },
        effects: [{ type: 'none' }],
        sets: ['life-ukvi-updated'],
      },
      {
        id: 'compare',
        label: {
          zhCN: '你对照新护照，逐字检查账户资料',
          en: 'Compare every account detail with the new passport',
        },
        effects: [{ type: 'none' }],
        sets: ['life-ukvi-updated'],
      },
    ],
  },
  {
    id: 'life-evisa-travel-check',
    title: { zhCN: '行李箱旁的清单', en: 'A checklist beside the suitcase' },
    text: {
      zhCN: '出行前，你把新护照、eVisa 状态与承运人资料放在一起核对。账户资料改好了，许可的有效期还得单独看清。',
      en: 'Before travelling, you compare your new passport, eVisa status and carrier details. Your account details are updated; you still need to check your permission’s expiry separately.',
    },
    weight: 3,
    once: true,
    channel: 'place:home',
    requires: ['life-ukvi-updated'],
    choices: [
      {
        id: 'match',
        label: {
          zhCN: '你逐项核对姓名、证件与状态',
          en: 'Check the name, document and status against each other',
        },
        effects: [{ type: 'none' }],
      },
      {
        id: 'read',
        label: {
          zhCN: '你再读一遍出行指引',
          en: 'Read the travel guidance once more',
        },
        effects: [{ type: 'none' }],
      },
    ],
  },
  // SRC-043 "Who needs an ETA": requirements depend on nationality and
  // purpose; existing UK permission may remove the need for an ETA. These
  // domestic scenes never charge for, grant or assess a visitor's permission.
  {
    id: 'life-guest-room',
    title: { zhCN: '客床上的纸箱', en: 'Boxes on the guest bed' },
    text: {
      zhCN: '亲人还在核对来访手续，你先腾客床。纸箱挪开后，你发现床单和冬衣被装进了同一袋。',
      en: 'While your relative checks the travel requirements, you clear the guest bed. Moving the boxes reveals that you packed the sheets with the winter clothes.',
    },
    weight: 3,
    once: true,
    channel: 'place:home',
    requires: ['life-visit-planned'],
    choices: [
      {
        id: 'wash',
        label: {
          zhCN: '你洗好旧床单，铺出客床',
          en: 'Wash the old sheets and make up the bed',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        sets: ['life-guest-room-ready'],
      },
      {
        id: 'borrow',
        label: {
          zhCN: '你借来一套干净被褥',
          en: 'Borrow a clean set of bedding',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        sets: ['life-guest-room-ready'],
      },
    ],
  },
  {
    id: 'life-guest-station',
    title: { zhCN: '站台上的招手', en: 'A wave on the platform' },
    text: {
      zhCN: '亲人发来已经抵英的消息，你按约去接站。客床早铺好了，列车门一开，你先认出了那只旧行李箱。',
      en: 'Your relative messages after arriving in the UK. You meet them at the station as agreed, with the guest bed ready. When the train doors open, you recognise the old suitcase first.',
    },
    weight: 3,
    once: true,
    channel: 'place:station',
    requires: ['life-guest-room-ready'],
    choices: [
      {
        id: 'carry',
        label: {
          zhCN: '你接过箱子，一起慢慢走回家',
          en: 'Take the suitcase and walk home together',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        sets: ['life-guest-arrived'],
      },
      {
        id: 'tea',
        label: {
          zhCN: '你先陪亲人在站边坐下喝茶',
          en: 'Sit down for tea beside the station together first',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        sets: ['life-guest-arrived'],
      },
    ],
  },
  {
    id: 'life-guest-cooking',
    title: { zhCN: '厨房里的两把勺', en: 'Two spoons in the kitchen' },
    text: {
      zhCN: '接站时带回的箱子靠在门边，你和亲人一起做饭。锅只有一口，关于先放什么，你们倒有两套办法。',
      en: 'The suitcase from the station rests by the door as you cook together. There is one pan and two firmly held ideas about what goes in first.',
    },
    weight: 3,
    once: true,
    channel: 'place:home',
    requires: ['life-guest-arrived'],
    choices: [
      {
        id: 'learn',
        label: {
          zhCN: '你负责切菜，请亲人掌勺',
          en: 'Chop the vegetables and let your relative stir',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
        sets: ['life-guest-cooked'],
      },
      {
        id: 'share',
        label: { zhCN: '你们各煮一道拿手菜', en: 'Each cook a favourite dish' },
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
        sets: ['life-guest-cooked'],
      },
    ],
  },
  {
    id: 'life-guest-farewell',
    title: { zhCN: '多出来的碗', en: 'The extra bowl' },
    text: {
      zhCN: '送别时，你往亲人的箱子里塞了做饭的合照。回家盛汤，你又拿出多余的碗，才想起站台上的挥手。',
      en: 'At goodbye, you tuck a cooking photo into your relative’s suitcase. Back home you set out an extra soup bowl, then remember the wave on the platform.',
    },
    weight: 3,
    once: true,
    channel: 'place:home',
    requires: ['life-guest-cooked'],
    choices: [
      {
        id: 'message',
        label: {
          zhCN: '你把多盛的汤拍给亲人看',
          en: 'Send your relative a photo of the extra soup',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
      {
        id: 'recipe',
        label: {
          zhCN: '你把一起做的菜记进食谱',
          en: 'Write the shared dishes in your recipe book',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
];
