import type { CountryResult } from '@uk-immigration/engine';
import { newZealand2026_11 } from '@uk-immigration/policy-data';
import { addDays, addMonths } from '../../calendar';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import type { NzEffect, NzFestival, NzTimeline } from './rules';

type NzCharacter = Character<NzTimeline, NzEffect, CountryResult, NzFestival>;
type NzEvent = GameEvent<NzEffect, NzFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/**
 * The travel conditions printed on an onshore grant: the general categories'
 * years from the first day as a resident (SRC-072 R5.66.5(a)).
 */
const travelConditionsEnd = (granted: string) =>
  addDays(
    addMonths(granted, 12 * newZealand2026_11.values.travelYears.value.general),
    -1,
  );

// Fictional individual facts below (dates, answers to the questionnaire), not
// policy thresholds. Both characters hold a resident visa granted in New
// Zealand, with no conditions, a clear record and the usual documents ready.
const resident = (
  granted: string,
  person: Pick<NzTimeline, 'dateOfBirth' | 'firstArrival'>,
): NzTimeline => ({
  ...person,
  residentVisa: { granted, category: 'general' },
  travelConditionsEnd: travelConditionsEnd(granted),
  trips: [],
  resident: {
    travel: {
      grantLocation: 'onshore',
      currentlyInNz: true,
      restrictedEntry: false,
    },
    prv: {
      role: 'principal',
      conditions: 'none',
      deportationLiability: 'none',
      furtherPoliceEvidence: 'not-requested',
      otherCommitments: [],
    },
    citizenship: {
      fullCapacity: true,
      character: 'clear',
      foreignPoliceEvidence: 'not-requested',
      understandsResponsibilities: true,
      english: 'evidenced',
      residenceIntent: 'nz-or-realm',
      identityDocumentsAndWitness: true,
      oath: 'willing',
      presenceException: 'none',
      feeCategory: 'standard',
    },
  },
  common: {
    requiredFeePaid: true,
    identityDocuments: true,
    character: 'clear',
    dependants: [],
    residenceFiling: {
      currentVisa: 'other-eligible-temporary-or-resident',
      statutoryBar: 'none',
      atImmigrationControlArea: false,
      hasOmittedRelationshipVisaDependant: false,
    },
  },
});

export const nurseProfile: CharacterProfile = {
  id: 'nurse',
  name: t('玛丽塞尔·纳瓦罗', 'Maricel Navarro'),
  intro: t(
    '玛丽塞尔来自菲律宾伊洛伊洛，2023 年来新西兰做注册护士。2025 年 8 月，她在境内拿到了绿名单直通居民签证，如今在凯雷鲁湾的医院上班，每月给家里寄钱。人物与事件均为虚构。',
    'Maricel from Iloilo in the Philippines came to New Zealand as a registered nurse in 2023. In August 2025 she was granted a Green List resident visa onshore. She works at the hospital in Kererū Bay and sends money home each month. All characters and events are fictional.',
  ),
  sprite: 'urban/priya.png',
};
export const partnerProfile: CharacterProfile = {
  id: 'partner',
  name: t('卢卡斯·勃兰特', 'Lukas Brandt'),
  intro: t(
    '卢卡斯来自德国汉堡，2023 年打工度假时认识了凯雷鲁湾的小学老师 Aroha。两人同居多年，2026 年 1 月他在境内拿到伴侣类居民签证，在船厂做木工。只评估卢卡斯本人，人物与事件均为虚构。',
    'Lukas from Hamburg met Aroha, a primary-school teacher in Kererū Bay, on a working holiday in 2023. After years living together, he was granted a partnership resident visa onshore in January 2026 and works as a joiner at the boatyard. Only Lukas is assessed; all characters and events are fictional.',
  ),
  sprite: 'urban/skilled-worker.png',
};

const travelFolder = (id: string): NzEvent => ({
  id: `${id}-travel-folder`,
  channel: 'place:home',
  title: t('签证上的旅行条件', 'The travel conditions on the visa'),
  text: t(
    '居民签证上印着旅行条件的最后一天。过了这天，人在新西兰仍是居民，可一出境签证就失效。',
    'Your resident visa shows the last day of its travel conditions. After that you remain a resident in New Zealand, but leaving would end the visa.',
  ),
  weight: 3,
  once: true,
  when: [{ visaMonthsLeftMax: 12 }],
  choices: [
    {
      id: 'plan',
      label: t(
        '把永久居民签证的日期记进日历',
        'Put the permanent resident visa date in the calendar',
      ),
      effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      sets: ['prv-planned'],
    },
    {
      id: 'later',
      label: t('把签证页拍照存进手机', 'Photograph the visa page'),
      effects: [{ type: 'stat', key: 'mood', delta: 2 }],
    },
  ],
});

const nurseEvents: NzEvent[] = [
  travelFolder('mc'),
  {
    id: 'mc-night-shifts',
    channel: 'morning',
    title: t('连着三个夜班', 'Three nights in a row'),
    text: t(
      '排班表出来了：下周连着三个夜班。护士长问你能不能再多顶一个周末。',
      'The roster is out: three night shifts in a row next week. The charge nurse asks if you can cover a weekend too.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'cover',
        label: t('答应，周末加班费高', 'Say yes for the weekend rate'),
        effects: [
          { type: 'money', delta: 420 },
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'health', delta: -3 },
        ],
      },
      {
        id: 'decline',
        label: t('婉拒，周末想睡饱', 'Decline and keep the weekend'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'mc-remittance',
    channel: 'phone',
    title: t('妈妈的视频电话', 'A video call from Mum'),
    text: t(
      '妈妈在镜头那头笑着说，弟弟考上了护理学院，学费下个月要交。',
      'On the screen Mum beams: your brother got into nursing school, and the fees are due next month.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'send',
        label: t('多寄一笔钱回家', 'Send extra money home'),
        effects: [
          { type: 'money', delta: -600 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
      {
        id: 'plan',
        label: t('约好分三个月寄', 'Agree to send it over three months'),
        effects: [
          { type: 'money', delta: -200 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'mc-potluck',
    channel: 'phone',
    title: t('菲律宾社区的聚餐', 'A Filipino potluck'),
    text: t(
      '社区群里在约周末聚餐：有人带春卷（lumpia），有人带炒米粉（pancit）。“Ate，你来吗？”',
      'The community chat is planning a weekend potluck: lumpia from one family, pancit from another. “Ate, are you coming?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'go',
        label: t('带一锅 adobo 去', 'Bring a pot of adobo'),
        effects: [
          { type: 'money', delta: -25 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
      {
        id: 'rest',
        label: t('这周太累，下次一定', 'Too tired this week, next time'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'mc-practising-certificate',
    channel: 'letter',
    title: t('年度执业证', 'Annual practising certificate'),
    text: t(
      '护理委员会提醒你更新年度执业证，顺便核对一年的继续教育学时。',
      'The nursing council reminds you to renew your annual practising certificate and log a year of professional development.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'renew',
        label: t('晚上把学时记录整理好', 'Sort the training records tonight'),
        effects: [
          { type: 'stat', key: 'career', delta: 3 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'mc-pay-review',
    channel: 'letter',
    title: t('薪资复核', 'Pay review'),
    text: t(
      '医院的薪资复核结果出来了，补发了几个月的差额。',
      'The hospital’s pay review is done, with a few months of back pay.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }, { stat: 'career', min: 40 }],
    choices: [
      {
        id: 'thanks',
        label: t('请同事们喝咖啡', 'Shout the team a round of coffee'),
        effects: [
          { type: 'money', delta: 1_150 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
        note: t('虚构的补发金额。', 'A fictional back-pay amount.'),
      },
    ],
  },
  {
    id: 'mc-annelie-tips',
    channel: 'npc:annelie',
    speaker: 'annelie',
    title: t('Annelie 的小提醒', 'Annelie’s tip'),
    text: t(
      'Annelie 把她当年的出入境记录表格给你看：“每次出境都记下来，申请时一目了然。”',
      'Annelie shows you her old travel log. “Write down every trip. It makes the application easy.”',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }],
    choices: [
      {
        id: 'copy',
        label: t('照着做一张自己的表', 'Make your own log'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'annelie', delta: 25 },
        ],
      },
    ],
  },
];

const partnerEvents: NzEvent[] = [
  travelFolder('lk'),
  {
    id: 'lk-launch-day',
    channel: 'morning',
    title: t('新船下水', 'Launch day'),
    text: t(
      '船厂今天让一艘新造的木帆船下水。Sione 拍拍你的肩：“船尾那块柚木是你刨的吧？”',
      'The boatyard launches a new wooden yacht today. Sione claps your shoulder: “You planed that teak on the transom, eh?”',
    ),
    weight: 3,
    once: true,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'cheer',
        label: t('跟大家一起在码头欢呼', 'Cheer with everyone on the wharf'),
        effects: [
          { type: 'stat', key: 'career', delta: 3 },
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'sione', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'lk-oma-call',
    channel: 'phone',
    title: t('Oma 的电话', 'A call from Oma'),
    text: t(
      '奶奶从汉堡打来电话，背景里是圣诞市场的音乐：“你们那边真的在海边过圣诞？”',
      'Oma calls from Hamburg with Christmas-market music behind her. “Do you really spend Christmas at the beach?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机带她看海湾', 'Show her the bay on camera'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'short',
        label: t(
          '聊十分钟，约好周末再打',
          'Chat ten minutes, call again at the weekend',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'lk-whanau-dinner',
    channel: 'place:home',
    title: t('全家来吃饭', 'Whānau dinner'),
    text: t(
      'Aroha 的 Nan 带着一锅 boil-up 来了，Nikau 在客厅里追着猫跑。Nan 问你：“你们德国人周日吃什么？”',
      'Aroha’s Nan arrives with a pot of boil-up while Nikau chases the cat round the lounge. Nan asks: “What do you Germans eat on Sundays?”',
    ),
    weight: 3,
    once: true,
    when: [{ minuteMin: 1080 }],
    choices: [
      {
        id: 'cake',
        label: t('端出你烤的苹果蛋糕', 'Bring out your apple cake'),
        effects: [
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'aroha', delta: 25 },
          { type: 'friendship', npc: 'nikau', delta: 15 },
        ],
      },
      {
        id: 'listen',
        label: t(
          '先听 Nan 讲她年轻时的海湾',
          'Listen to Nan’s stories of the bay first',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'tereo', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'lk-counting',
    channel: 'place:college',
    title: t('Nikau 的数数课', 'Counting with Nikau'),
    text: t(
      '夜校门口，Nikau 拦住你：“你会用毛利语数到十吗？我教你，tahi、rua、toru……”',
      'At the class door, Nikau stops you. “Can you count to ten in te reo? I’ll teach you: tahi, rua, toru…”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'learn',
        label: t('跟着他一路数到 tekau', 'Count with him all the way to tekau'),
        effects: [
          { type: 'stat', key: 'tereo', delta: 2 },
          { type: 'friendship', npc: 'nikau', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'lk-rugby-rules',
    channel: 'npc:sione',
    speaker: 'sione',
    title: t('橄榄球规则', 'The rules of rugby'),
    text: t(
      'Sione 在餐巾纸上画了一个球场：“越位、争球、达阵，三件事搞懂，周六就能上场。”',
      'Sione sketches a pitch on a napkin. “Offside, scrum, try. Get those three and you can play on Saturday.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'listen',
        label: t(
          '认真听，再问一句“为什么不能往前传”',
          'Listen, then ask why you can’t pass forward',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'sione', delta: 25 },
        ],
      },
    ],
  },
];

const opening = (
  id: string,
  text: Text,
  choices: NzEvent['choices'],
): NzEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('凯雷鲁湾的早晨', 'Morning in Kererū Bay'),
  text,
  weight: 0,
  once: true,
  choices,
});

const nurse: NzCharacter = {
  ...nurseProfile,
  startDate: '2026-03-01',
  stats: { money: 14_000, mood: 66, health: 70, tereo: 8, career: 40 },
  timeline: resident('2025-08-18', {
    dateOfBirth: '1994-07-19',
    firstArrival: '2023-04-11',
  }),
  opening: opening(
    'nurse',
    t(
      '夜班结束，海湾刚刚亮起来。码头上有人在钓鱼，咖啡馆的门口飘出烤面包的味道。又一个秋天到了。',
      'The night shift is over and the bay is just getting light. Someone is fishing off the wharf, and toast drifts from the café door. Another autumn has come.',
    ),
    [
      {
        id: 'coffee',
        label: t(
          '去咖啡馆来一杯 flat white',
          'Head to the café for a flat white',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'sleep',
        label: t('拉上窗帘，先补个觉', 'Draw the curtains and sleep first'),
        effects: [{ type: 'stat', key: 'health', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '移民局的邮件到了：永久居民签证获批。你给伊洛伊洛的妈妈打视频，身后的海湾亮晶晶的。下次回家，不用再算旅行条件了。',
    'The email from Immigration New Zealand arrives: your permanent resident visa is granted. You video-call Mum in Iloilo with the bay glittering behind you. Next time you fly home, there are no travel conditions to count.',
  ),
  events: nurseEvents,
};

const partner: NzCharacter = {
  ...partnerProfile,
  startDate: '2026-03-01',
  stats: { money: 9_500, mood: 72, health: 74, tereo: 12, career: 28 },
  timeline: resident('2026-01-20', {
    dateOfBirth: '1992-11-03',
    firstArrival: '2023-10-05',
  }),
  opening: opening(
    'partner',
    t(
      'Aroha 在冰箱上留了张纸条：“学校开会，晚饭你做。Nikau 周六有比赛！”窗外的海湾很平静，船厂的锤子声已经响起来了。',
      'Aroha left a note on the fridge: “Staff meeting, you’re on dinner. Nikau has a game on Saturday!” The bay is calm, and hammering already rings from the boatyard.',
    ),
    [
      {
        id: 'yard',
        label: t('早点去船厂', 'Get to the boatyard early'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'beach',
        label: t('沿着海滩走一圈再去', 'Walk the beach on the way'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '永久居民签证批下来了。Aroha 抱着你转了一圈，Nikau 在旁边喊：“现在你是真的凯雷鲁湾人了！”',
    'Your permanent resident visa is granted. Aroha spins you round, and Nikau shouts: “Now you’re a real Kererū Bay local!”',
  ),
  events: partnerEvents,
};

export const nzCharacters = [nurse, partner];
export const nzProfiles = nzCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
