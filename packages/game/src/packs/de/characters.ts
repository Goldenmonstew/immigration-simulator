import type { CountryResult } from '@uk-immigration/engine';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import { deBalance as b } from './balance';
import type { DeEffect, DeFestival, DeTimeline } from './rules';

type DeCharacter = Character<DeTimeline, DeEffect, CountryResult, DeFestival>;
type DeEvent = GameEvent<DeEffect, DeFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

// Fictional individual facts below (dates, permits, pay, flat size), not
// policy thresholds. The engine judges them against policy-data.
const common = (): DeTimeline['common'] => ({
  identityEstablished: true,
  nationalityEstablishedOrNotRequired: true,
  passport: 'valid',
  capableOrRepresented: true,
  evidenceAndAttendance: true,
  entry: 'required-visa-and-disclosed',
  security: 'no-known-ground',
  address: 'registered',
  transition: 'ordinary',
  livelihoodConfirmed: true,
  benefits: 'none-or-permitted',
  insurance: ['statutory'],
  employmentAuthorisedOrNotRequired: true,
  permanentProfessionalPermissionOrNotRequired: true,
  provenGerman: 'A2',
  housing: {
    localMinimumM2: 35,
    usableM2: 48,
    qualityAndOccupancyConfirmed: true,
  },
});

const citizenship = (
  currentTitle: 'blue-card' | 'other-eligible',
): DeTimeline['citizenship'] => ({
  foreignNationalOrStateless: true,
  identityAndNationalityEstablished: true,
  canActWithoutGuardian: true,
  lawfulHabitualResidence: true,
  currentTitle,
  constitutionalAndLoyaltyDeclaration: true,
  historicalResponsibilityDeclaration: true,
  sustainableHouseholdSupport: true,
  withoutSgbIIorXII: true,
  germanEvidence: 'A2',
  languageException: 'none',
  knowledge: { kind: 'none' },
  criminalRecord: { kind: 'none' },
  exclusionReview: 'cleared',
});

export const bluecardProfile: CharacterProfile = {
  id: 'bluecard',
  name: t('许嘉禾', 'Jiahe Xu'),
  intro: t(
    '嘉禾来自成都，2025 年 1 月持欧盟蓝卡来到柏林，在运河边的公司写铁路信号软件，年薪 64,000 欧元。她想在林登岸长住下去。人物与事件均为虚构。',
    'Jiahe from Chengdu came to Berlin in January 2025 on an EU Blue Card. She writes railway signalling software at a canal-side firm and earns €64,000 a year, and she hopes to stay in Lindenufer. All characters and events are fictional.',
  ),
  sprite: 'urban/ka-ning-partner.png',
};
export const spouseProfile: CharacterProfile = {
  id: 'spouse',
  name: t('马特奥·罗哈斯', 'Mateo Rojas'),
  intro: t(
    '马特奥来自哥伦比亚麦德林，2023 年和德国小学老师莉娜·霍夫曼结婚，2024 年春天持德国人家属居留许可搬来林登岸，在咖啡烘焙坊打工。只评估马特奥本人，人物与事件均为虚构。',
    'Mateo from Medellín married German primary teacher Lena Hoffmann in 2023 and moved to Lindenufer in spring 2024 on a residence permit as the family of a German. He works at a coffee roastery. Only Mateo is assessed; all characters and events are fictional.',
  ),
  sprite: 'urban/jamie.png',
};

const permitReminder = (id: string): DeEvent => ({
  id: `${id}-permit-date`,
  channel: 'place:home',
  title: t('居留卡上的日期', 'The date on the residence card'),
  text: t(
    '居留卡背面的有效期越来越近。这局游戏不办理延期：到期前要么递交定居或入籍申请，要么收拾行李。',
    'The date on the back of your residence card is getting closer. This game does not extend permits: apply for settlement or naturalisation before it ends, or pack your bags.',
  ),
  weight: 3,
  once: true,
  when: [{ visaMonthsLeftMax: b.reminderMonths }],
  choices: [
    {
      id: 'plan',
      label: t('把材料清单贴在冰箱上', 'Stick the checklist on the fridge'),
      effects: [{ type: 'stat', key: 'mood', delta: 3 }],
    },
  ],
});

const bluecardEvents: DeEvent[] = [
  permitReminder('bc'),
  {
    id: 'bc-review',
    channel: 'letter',
    title: t('年度绩效面谈', 'Annual review'),
    text: t(
      '组长说，你重写的道岔联锁测试把夜间故障报警减少了一半。邮件最后一句：明年起加薪。',
      'Your team lead says your rewrite of the interlocking tests halved the night-time fault alarms. Last line of the email: a raise from next year.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }, { stat: 'career', min: 40 }],
    choices: [
      {
        id: 'thanks',
        label: t(
          '回信道谢，周末请自己吃顿火锅',
          'Reply with thanks and treat yourself to hotpot',
        ),
        effects: [
          { type: 'salary', annualEur: 68_000 },
          { type: 'money', delta: -45 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
        note: t(
          '虚构的薪资变化，会记入蓝卡评估里的年薪。',
          'A fictional pay change, recorded as your Blue Card salary in the assessment.',
        ),
      },
    ],
  },
  {
    id: 'bc-doener',
    channel: 'phone',
    title: t('午饭约不约', 'Lunch?'),
    text: t(
      '同事托比亚斯在群里问：车站旁那家土耳其烤肉，今天排队的人少，一起去？',
      'Colleague Tobias asks in the group chat: the döner place by the station has a short queue today. Coming?',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，顺便练德语', 'Go, and practise German'),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'german', delta: 1 },
        ],
      },
      {
        id: 'skip',
        label: t('在工位吃自己带的饭', 'Eat your packed lunch at your desk'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'bc-parents-call',
    channel: 'phone',
    title: t('成都来的视频', 'A video call from Chengdu'),
    text: t(
      '妈妈举着一锅红汤：「你那边买得到花椒吗？」爸爸在后面喊：「冬天多穿点！」',
      'Mum holds up a pot of red broth: “Can you get Sichuan pepper over there?” Dad shouts from behind: “Wrap up this winter!”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机带他们看运河', 'Show them the canal'),
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
    id: 'bc-tandem',
    channel: 'place:library',
    title: t('语言搭档', 'A tandem partner'),
    text: t(
      '语言咖啡角里，一位学中文的大学生问你愿不愿意做语言搭档：一小时德语，一小时中文。',
      'At the language café, a student learning Chinese asks if you’d like a tandem: an hour of German, an hour of Chinese.',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'german', max: 59 }],
    choices: [
      {
        id: 'join',
        label: t('答应，每周四见', 'Say yes: Thursdays it is'),
        effects: [
          { type: 'stat', key: 'german', delta: 3 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
      {
        id: 'later',
        label: t('先自己背单词', 'Study alone for now'),
        effects: [{ type: 'stat', key: 'german', delta: 1 }],
      },
    ],
  },
  {
    id: 'bc-emeka-list',
    channel: 'npc:emeka',
    speaker: 'emeka',
    title: t('埃梅卡的清单', 'Emeka’s checklist'),
    text: t(
      '埃梅卡把他当年的定居材料清单拍给你：「工资单、养老保险记录、B1 证书、在德国生活测试。工资单按月放好，别等最后一周。」',
      'Emeka sends you a photo of his old settlement checklist. “Payslips, pension record, B1 certificate, the Leben in Deutschland test. File the payslips month by month; don’t leave it to the last week.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'copy',
        label: t(
          '收藏起来，周末整理',
          'Save it and sort things at the weekend',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'emeka', delta: 25 },
        ],
      },
    ],
  },
  {
    id: 'bc-late-train',
    channel: 'morning',
    title: t('信号故障', 'A signal fault'),
    text: t(
      '站台广播：因信号故障，S 线晚点二十分钟。你写的正是信号软件，旁边的人看你笑了一下。',
      'The platform announcement: twenty minutes’ delay due to a signal fault. You write signalling software; the person next to you notices you smiling.',
    ),
    weight: 2,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'note',
        label: t(
          '在手机上记下故障区段',
          'Note the fault section on your phone',
        ),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'bike',
        label: t('扫一辆共享单车骑过去', 'Grab a hire bike and ride in'),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
];

const spouseEvents: DeEvent[] = [
  permitReminder('sp'),
  {
    id: 'sp-roastery-early',
    channel: 'morning',
    title: t('烘焙坊早班', 'An early roast'),
    text: t(
      '老板发消息：明早有一批哥伦比亚豆子要烘，你最懂它，能早一小时来吗？',
      'The boss texts: a batch of Colombian beans needs roasting tomorrow and you know them best. Could you come in an hour early?',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t('答应，早班多算钱', 'Say yes for the early-shift pay'),
        effects: [
          { type: 'money', delta: 45 },
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'no',
        label: t('婉拒，今天想睡饱', 'Decline and sleep in'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'sp-in-laws',
    channel: 'letter',
    title: t('岳父母来做客', 'The in-laws are coming'),
    text: t(
      '莉娜的爸妈从巴伐利亚打来电话：周日下午来喝咖啡吃蛋糕，「我们自己带李子蛋糕」。',
      'Lena’s parents call from Bavaria: they’re coming for Sunday coffee and cake. “We’ll bring our own plum cake.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'german',
        label: t('全程用德语招待', 'Host them entirely in German'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'german', delta: 2 },
        ],
      },
      {
        id: 'coffee',
        label: t('亲手烘一包咖啡送他们', 'Roast them a bag of coffee'),
        effects: [
          { type: 'money', delta: -12 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'lena', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'sp-salsa',
    channel: 'place:pub',
    title: t('周四萨尔萨之夜', 'Salsa Thursday'),
    text: t(
      '乌韦想在小酒馆办萨尔萨之夜，问你愿不愿意带大家跳第一支舞。',
      'Uwe wants to try a salsa night at the Kneipe and asks if you’ll lead the first dance.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'lead',
        label: t('答应，教大家基本步', 'Say yes and teach the basic step'),
        effects: [
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'uwe', delta: 20 },
        ],
      },
      {
        id: 'later',
        label: t('等德语再好一点再说', 'Wait until your German is stronger'),
        effects: [{ type: 'stat', key: 'german', delta: 1 }],
      },
    ],
  },
  {
    id: 'sp-marking',
    channel: 'place:home',
    title: t('改作业的夜晚', 'A night of marking'),
    text: t(
      '莉娜趴在桌上改三年级的作文，抬头问你：「Fahrrad 是阳性还是中性来着？我改得眼都花了。」',
      'Lena is bent over Year 3 essays. She looks up: “Is Fahrrad masculine or neuter? I’ve been marking so long I can’t tell.”',
    ),
    weight: 2,
    when: [{ minuteMin: 1140 }],
    choices: [
      {
        id: 'das',
        label: t(
          '「das Fahrrad！」顺手泡两杯茶',
          '“Das Fahrrad!” and make two cups of tea',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'german', delta: 1 },
          { type: 'friendship', npc: 'lena', delta: 20 },
        ],
      },
      {
        id: 'rest',
        label: t('劝她明天再改', 'Tell her to finish tomorrow'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'sp-medellin-call',
    channel: 'phone',
    title: t('麦德林来的电话', 'A call from Medellín'),
    text: t(
      '妹妹在视频里转了一圈：花节游行、满街的花架。「你什么时候带莉娜回来？」',
      'Your sister spins the camera: the flower festival parade, flower frames everywhere. “When are you bringing Lena home?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'promise',
        label: t(
          '说等定下来就回去',
          'Promise to visit once things are settled',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'walk',
        label: t('挂了电话，去运河边走走', 'Hang up and walk by the canal'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
];

const opening = (
  id: string,
  text: Text,
  choices: DeEvent['choices'],
): DeEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('林登岸的早晨', 'Morning in Lindenufer'),
  text,
  weight: 0,
  once: true,
  choices,
});

const bluecard: DeCharacter = {
  ...bluecardProfile,
  startDate: '2026-03-01',
  stats: { money: 15_000, mood: 64, health: 72, german: 36, career: 32 },
  timeline: {
    routes: ['R03', 'R07'],
    birthDate: '1994-09-18',
    firstEntry: '2025-01-15',
    permits: [{ kind: 'blue-card', from: '2025-01-15', to: '2029-01-14' }],
    trips: [],
    blueCardEmploymentMonths: 13,
    common: common(),
    settlement: {},
    mobility: {
      blueCard: {
        cardHeldAtDecision: true,
        countableAnnualGross: 64_000,
        contractMonths: 48,
        jobInGermanyMatchesQualification: true,
        requiredLicencesHeld: true,
        genuineEmployment: true,
        noExclusionUnder19f: true,
        qualification: 'academic',
        recognisedQualification: true,
      },
      titles: [
        {
          kind: 'blue-card',
          from: '2025-01-15',
          validTo: '2029-01-14',
          noOtherLossEvent: true,
          trips: [],
        },
      ],
    },
    citizenship: citizenship('blue-card'),
    fees: {},
  },
  opening: opening(
    'bluecard',
    t(
      '后院传来垃圾车倒车的嘀嘀声。今天是在德国的第二个春天的第一天，冰箱上还贴着垃圾分类表。',
      'A bin lorry beeps in the back courtyard. It’s the first day of your second spring in Germany, and the bin chart is still on the fridge.',
    ),
    [
      {
        id: 'walk',
        label: t('先沿运河走一圈', 'Start with a walk along the canal'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'study',
        label: t(
          '翻出德语课本，今年要考 B1',
          'Dig out the textbook: this is the year for B1',
        ),
        effects: [{ type: 'stat', key: 'german', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    '外管局的职员把收件回执递过来。走出大楼时运河上正好有船经过，你知道明天也会在林登岸醒来。',
    'The clerk at the Ausländerbehörde hands over the receipt. As you step outside a boat glides down the canal, and you know you’ll wake up in Lindenufer tomorrow too.',
  ),
  events: bluecardEvents,
};

const spouse: DeCharacter = {
  ...spouseProfile,
  startDate: '2026-03-01',
  stats: { money: 4_500, mood: 70, health: 70, german: 40, career: 18 },
  timeline: {
    routes: ['R04', 'R08'],
    birthDate: '1991-02-11',
    firstEntry: '2024-03-01',
    permits: [
      { kind: 'german-family', from: '2024-03-01', to: '2025-02-28' },
      { kind: 'german-family', from: '2025-03-01', to: '2028-02-29' },
    ],
    trips: [],
    marriedOn: '2023-06-17',
    common: common(),
    settlement: {
      germanFamilyBasis: 'spouse',
      germanFamilyLifeInGermany: true,
    },
    mobility: {
      titles: [
        {
          kind: 'german-family',
          from: '2025-03-01',
          validTo: '2028-02-29',
          noOtherLossEvent: true,
          trips: [],
        },
      ],
    },
    citizenship: {
      ...citizenship('other-eligible'),
      spouse: {
        status: 'continuing',
        recognisedGermanRelationship: true,
        genuineFamilyLife: true,
      },
    },
    fees: {},
  },
  opening: opening(
    'spouse',
    t(
      '莉娜在桌上留了张纸条：「早课，冰箱里有面包。周末去菜园看看吧？」窗外运河上起了薄雾。',
      'Lena left a note on the table: “Early lessons. Bread in the fridge. Allotment at the weekend?” Mist rises off the canal outside.',
    ),
    [
      {
        id: 'roastery',
        label: t('先去烘焙坊报到', 'Head to the roastery first'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'canal',
        label: t('沿运河走一圈认认路', 'Walk the canal to learn the way'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '外管局的职员把收件回执递给你。回家路上莉娜在运河长椅上挥手，你们常坐的那张长椅。',
    'The clerk hands you the receipt. On the way home Lena waves from the canal bench, the one where you always sit.',
  ),
  events: spouseEvents,
};

export const deCharacters = [bluecard, spouse];
export const deProfiles = deCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
