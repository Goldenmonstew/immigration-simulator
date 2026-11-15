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

// SRC-043 "Who needs an ETA" and its linked nationality checker. The
// passport belongs to the visitor, not the player. All are checking requirements,
// including any existing permission; no choice promises an application outcome.
// SRC-041 physical p1 questions 2–3 and p4 questions 8–10 inspire the household
// pressures below, not exemptions. Annual incomes are fictional scenario facts,
// not legal thresholds; income effects preserve contract salary and relationships.
export const characterLifeEvents: Record<string, GameEvent[]> = {
  'skilled-worker': [
    {
      id: 'sw-visit-plans',
      when: [{ yearMin: 3 }],
      title: { zhCN: '妈妈发来的护照页', en: 'Mum sends a passport page' },
      text: {
        zhCN: '妈妈想来住几天，发来中国护照页。你陪她核对访客签证要求和材料，客床上的纸箱暂时还没动。',
        en: 'Mum wants to visit and sends her Chinese passport page. You help check visitor visa requirements and documents. The boxes are still on the guest bed.',
      },
      weight: 1,
      once: true,
      channel: 'phone',
      choices: [
        {
          id: 'check',
          label: {
            zhCN: '你按她的国籍与来访目的查官方指引',
            en: 'Check official guidance for her nationality and purpose',
          },
          effects: [{ type: 'none' }],
          sets: ['life-visit-planned'],
        },
        {
          id: 'call',
          label: {
            zhCN: '你约好通话，一起核对现有证件',
            en: 'Arrange a call to check her existing documents together',
          },
          effects: [{ type: 'none' }],
          sets: ['life-visit-planned'],
        },
      ],
    },
  ],
  'hong-kong-bno': [
    {
      id: 'bno-visit-plans',
      when: [{ yearMin: 4 }],
      title: { zhCN: '表姐的行前清单', en: 'Your cousin’s travel list' },
      text: {
        zhCN: '表姐拿着香港特区护照想来探亲。你陪她按国籍核对 ETA 要求与已有许可，再看看家里哪里能放行李。',
        en: 'Your cousin plans a visit with her Hong Kong SAR passport. You help check ETA requirements and any existing permission, then look for suitcase space at home.',
      },
      weight: 1,
      once: true,
      channel: 'phone',
      choices: [
        {
          id: 'check',
          label: {
            zhCN: '你们按她的护照与来访目的查要求',
            en: 'Check requirements for her passport and purpose together',
          },
          effects: [{ type: 'none' }],
          sets: ['life-visit-planned'],
        },
        {
          id: 'list',
          label: {
            zhCN: '你把未核对的证件问题单列出来',
            en: 'List the document questions still to check',
          },
          effects: [{ type: 'none' }],
          sets: ['life-visit-planned'],
        },
      ],
    },
    {
      id: 'bno-sick-pay-folder',
      when: [{ yearMin: 4 }],
      title: { zhCN: '病假工资的信封', en: 'The sick-pay envelope' },
      text: {
        zhCN: '你病后少接了班，病假工资单夹在药袋旁。伴侣带孩子吃饭，你终于有空核对这一税年的收入记录。',
        en: 'After illness you take fewer shifts; the sick-pay slip lies beside the medicine bag. Your partner takes the child to eat while you check this tax year’s earnings.',
      },
      weight: 1,
      once: true,
      channel: 'letter',
      choices: [
        {
          id: 'file',
          label: {
            zhCN: '你把病假工资与其他工资一起核对',
            en: 'Check the sick pay alongside your other earnings',
          },
          effects: [
            { type: 'income', taxYear: 'current', earnings: 26000 },
            { type: 'stat', key: 'health', delta: 4 },
          ],
          note: {
            zhCN: '记录本情节税年收入 £26,000；不新增 public funds 记录，不替伴侣或孩子评估。',
            en: 'Records fictional tax-year earnings of £26,000; adds no public funds episode and does not assess your partner or child.',
          },
        },
        {
          id: 'ask',
          label: {
            zhCN: '你请工资部门核对后再归档',
            en: 'Ask payroll to check before filing it',
          },
          effects: [
            { type: 'income', taxYear: 'current', earnings: 26000 },
            { type: 'stat', key: 'health', delta: 4 },
          ],
          note: {
            zhCN: '记录本情节税年收入 £26,000；不新增 public funds 记录，不替伴侣或孩子评估。',
            en: 'Records fictional tax-year earnings of £26,000; adds no public funds episode and does not assess your partner or child.',
          },
        },
      ],
    },
  ],
  'family-partner': [
    {
      id: 'family-visit-plans',
      when: [{ yearMin: 4 }],
      title: { zhCN: '妹妹圈出的假期', en: 'The holiday your sister circles' },
      text: {
        zhCN: '妹妹拿巴西护照准备来访，给你发了假期表。你们先按国籍核对 ETA 要求和已有许可，机票还没订。',
        en: 'Your sister plans to visit with her Brazilian passport and sends her holiday rota. You check ETA requirements and any existing permission together; flights are not booked yet.',
      },
      weight: 1,
      once: true,
      channel: 'phone',
      choices: [
        {
          id: 'check',
          label: {
            zhCN: '你陪她按护照与来访目的查官方要求',
            en: 'Help check official requirements for her passport and purpose',
          },
          effects: [{ type: 'none' }],
          sets: ['life-visit-planned'],
        },
        {
          id: 'call',
          label: {
            zhCN: '你约她下班后通话核对证件',
            en: 'Arrange a call after her shift to check documents',
          },
          effects: [{ type: 'none' }],
          sets: ['life-visit-planned'],
        },
      ],
    },
    {
      id: 'family-crossed-shifts',
      when: [{ yearMin: 4 }],
      title: { zhCN: '错开的晚饭', en: 'Dinner on different shifts' },
      text: {
        zhCN: '杰米的新班表与你撞了车，冰箱上贴了两张晚饭时间。你们摊开工资单，商量换班还是暂时少接一些班。',
        en: 'Jamie’s new rota clashes with yours; two dinner times hang on the fridge. You spread out the payslips and discuss swapping shifts or temporarily taking fewer.',
      },
      weight: 1,
      once: true,
      channel: 'npc:jamie',
      forbids: [
        'family-job-worry',
        'family-jamie-unemployed',
        'family-pip-applied',
      ],
      choices: [
        {
          id: 'swap',
          label: {
            zhCN: '你们找同事换班，把晚饭挪到一起',
            en: 'Arrange shift swaps and eat dinner together',
          },
          effects: [{ type: 'stat', key: 'mood', delta: 4 }],
        },
        {
          id: 'reduce',
          label: {
            zhCN: '你们同意杰米少接班，重记他的收入',
            en: 'Agree that Jamie takes fewer shifts and update his earnings',
          },
          effects: [
            { type: 'income', taxYear: 'current', partnerEarnings: 18000 },
            { type: 'stat', key: 'health', delta: 4 },
          ],
          note: {
            zhCN: '记录本情节伴侣税年收入 £18,000；保留英国公民伴侣关系，不改变许可或承诺豁免。',
            en: 'Records fictional partner tax-year earnings of £18,000. Keeps the British-citizen partnership; changes no permission and promises no exemption.',
          },
        },
      ],
    },
  ],
};
