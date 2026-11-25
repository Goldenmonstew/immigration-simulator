import { japanFull2026_11 } from '@uk-immigration/policy-data';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import type {
  JpFullResult,
  JpNaturalisationEvidence,
  JpPrCommonEvidence,
} from '@uk-immigration/engine';
import { jpBalance as b } from './balance';
import type { JpEffect, JpFestival, JpTimeline } from './rules';

type JpCharacter = Character<JpTimeline, JpEffect, JpFullResult, JpFestival>;
type JpEvent = GameEvent<JpEffect, JpFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const values = japanFull2026_11.values;

// Fictional individual facts below (dates, income, the home country's age of
// majority as the questionnaire records it), not policy thresholds.
const goodStanding: JpPrCommonEvidence = {
  inJapan: true,
  goodConductConfirmed: true,
  criminalHistory: 'none',
  nationalInterestConfirmed: true,
  japanMainHomeIntended: true,
  statusActivitiesCompliant: true,
  residenceCardDutiesCompliant: true,
  affiliationNotices: [],
  addressNotices: [],
  tax: 'on-time',
  pension: 'on-time',
  publicHealthInsurance: 'on-time',
  actualAddressAndRegister: true,
  livelihoodConfirmed: true,
  householdIncomeConfirmed: true,
  pensionComparisonConfirmed: true,
  publicAssistance: 'none',
  publicBurdenConfirmedAcceptable: true,
  publicHealthCleared: true,
  otherLandingGroundsCleared: true,
  guarantor: 'japanese-resident',
  guarantorDocumentsReady: true,
  guarantorAcceptedOrWaived: true,
  integrationKnowledgeConfirmed: true,
  schoolChildren: [],
  filer: 'self',
  documentsReady: true,
  photoReady: true,
  specialPermission: { kind: 'none' },
  feeReduction: 'not-requested',
  integratedCard: { requested: false },
};

const naturalisationEvidence = (since: string): JpNaturalisationEvidence => ({
  japaneseCitizen: false,
  inJapan: true,
  lawfulDomicile: true,
  domicileFrom: since,
  residenceFrom: since,
  capacityUnderHomeLaw: true,
  goodConductConfirmed: true,
  criminalOrTrafficHistory: 'none',
  livelihoodConfirmed: true,
  nationality: 'all-nationalities-lost-on-naturalisation',
  constitutionalConditionConfirmed: true,
  integratedIntoJapanConfirmed: true,
  japaneseLanguage: {
    speaking: 'needs-help',
    reading: 'needs-help',
    writing: 'needs-help',
  },
  tax: 'on-time',
  pension: 'on-time',
  publicHealthInsurance: 'on-time',
  residenceEvidenceReady: true,
  healthInsuranceEvidenceReady: true,
  motivationReady: true,
  oathReady: true,
  plansToLiveInJapan: true,
  filer: 'self',
  filedAtJurisdictionalBureau: true,
  writtenDocumentsAndTranslationsReady: true,
});

export const engineerProfile: CharacterProfile = {
  id: 'engineer',
  name: t('陈思远', 'Siyuan Chen'),
  intro: t(
    '思远来自中国，2024 年春天持「技术·人文知识·国际业务」在留资格来到横滨，在物流软件公司做工程师，年收入 520 万日元。他想在这里长住。人物与事件均为虚构。',
    'Siyuan from China came to Yokohama in spring 2024 on the Engineer/Specialist in Humanities/International Services status. He writes logistics software and earns ¥5.2 million a year, and he hopes to stay. All characters and events are fictional.',
  ),
  sprite: 'urban/hong-kong-bno.png',
};
export const spouseProfile: CharacterProfile = {
  id: 'spouse',
  name: t('安娜·佩雷拉', 'Ana Pereira'),
  intro: t(
    '安娜来自巴西，2024 年和护士高木悠斗结婚，2025 年秋天持「日本人的配偶者等」在留资格搬来港坂，在面包店打工。只评估安娜本人，人物与事件均为虚构。',
    'Ana from Brazil married nurse Yuto Takagi in 2024 and moved to Minatozaka in autumn 2025 as the Spouse or Child of Japanese National. She works shifts at a bakery. Only Ana is assessed; all characters and events are fictional.',
  ),
  sprite: 'urban/family-partner.png',
};

const renewalFolder = (id: string): JpEvent[] => [
  {
    id: `${id}-renewal-folder`,
    channel: 'place:home',
    title: t('在留卡上的日期', 'The date on the residence card'),
    text: t(
      '在留卡背面的期限越来越近。你把护照、照片和在职证明放进同一个文件夹。',
      'The expiry on your residence card is getting closer. Passport, photo and employment letter go into one folder.',
    ),
    weight: 3,
    once: true,
    when: [{ visaMonthsLeftMax: b.renewalWindowMonths }],
    choices: [
      {
        id: 'plan',
        label: t('这周就去入管窗口', 'Go to the immigration office this week'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        sets: ['renewal-planned'],
      },
      {
        id: 'later',
        label: t('先把提醒贴在冰箱上', 'Stick a reminder on the fridge'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
];

const engineerEvents: JpEvent[] = [
  ...renewalFolder('eng'),
  {
    id: 'eng-salary-review',
    channel: 'letter',
    title: t('年度评估', 'Annual review'),
    text: t(
      '部长说，你重写的配送路线模块让仓库少加了不少班。邮件最后附了一句：明年起薪资调整。',
      'Your manager says the rewritten routing module cut the warehouse’s overtime. The email ends: pay adjusts from next year.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }, { stat: 'career', min: 40 }],
    choices: [
      {
        id: 'thanks',
        label: t(
          '回信道谢，周末请自己吃顿烤肉',
          'Reply with thanks and treat yourself to yakiniku',
        ),
        effects: [
          { type: 'salary', annualYen: 5_600_000 },
          { type: 'money', delta: -6_000 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
        note: t(
          '虚构的薪资变化，会记入永住评估里的年收入。',
          'A fictional pay change, recorded as annual income in the permanent residence assessment.',
        ),
      },
    ],
  },
  {
    id: 'eng-team-ramen',
    channel: 'phone',
    title: t('拉面邀请', 'A ramen invitation'),
    text: t(
      '同事佐野打来电话：车站旁新开的拉面店，排队的人比加班的人还多，一起去？',
      'Colleague Sano calls: the new ramen shop by the station has a longer queue than the overtime list. Coming?',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，顺便练日语', 'Go, and practise Japanese'),
        effects: [
          { type: 'money', delta: -1_200 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'japanese', delta: 1 },
        ],
      },
      {
        id: 'skip',
        label: t('今天想早点回家', 'Head home early today'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'eng-parents-call',
    channel: 'phone',
    title: t('视频电话', 'A video call'),
    text: t(
      '妈妈在镜头那头举起一盘饺子：「你那边能买到韭菜吗？」',
      'On the screen, Mum holds up a plate of dumplings: “Can you get garlic chives over there?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机带她看商店街', 'Show her the shopping street'),
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
    id: 'eng-study-group',
    channel: 'place:college',
    title: t('学习小组', 'A study group'),
    text: t(
      '课后，兰和两个同学约你周末一起练听力。美咲老师在白板上写下「一緒に」。',
      'After class, Lan and two classmates ask you to practise listening at the weekend. Misaki writes “together” on the board.',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'japanese', max: 59 }],
    choices: [
      {
        id: 'join',
        label: t('加入小组', 'Join the group'),
        effects: [
          { type: 'stat', key: 'japanese', delta: 3 },
          { type: 'friendship', npc: 'lan', delta: 20 },
        ],
      },
      {
        id: 'solo',
        label: t('先自己背单词', 'Study alone for now'),
        effects: [{ type: 'stat', key: 'japanese', delta: 1 }],
      },
    ],
  },
  {
    id: 'eng-pr-folder',
    channel: 'npc:raj',
    speaker: 'raj',
    title: t('拉杰的文件夹', 'Raj’s folder'),
    text: t(
      '拉杰把他当年的永住材料清单递给你：「纳税、年金、医保，年份一栏一栏对。别等最后一个月。」',
      'Raj hands you his old permanent residence checklist. “Tax, pension, insurance, year by year. Don’t wait for the last month.”',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 3 }],
    choices: [
      {
        id: 'copy',
        label: t(
          '拍下清单，周末整理',
          'Photograph the list and sort it at the weekend',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'raj', delta: 25 },
        ],
      },
    ],
  },
];

const spouseEvents: JpEvent[] = [
  ...renewalFolder('sp'),
  {
    id: 'sp-bakery-early',
    channel: 'morning',
    title: t('面包店早班', 'Early shift at the bakery'),
    text: t(
      '店长发消息：明早的咖喱面包要多烤两盘，能提前一小时来吗？',
      'The manager texts: two extra trays of curry bread tomorrow. Can you come in an hour early?',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t('答应，早班加钱', 'Say yes for the early-shift pay'),
        effects: [
          { type: 'money', delta: 6_000 },
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
    id: 'sp-rice-parcel',
    channel: 'letter',
    title: t('婆婆寄来的米', 'Rice from your mother-in-law'),
    text: t(
      '箱子里有新米、一袋梅干，还有一张字迹工整的纸条：「安娜，多吃点。」',
      'Inside: new rice, a bag of umeboshi and a neatly written note. “Ana, eat more.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'call',
        label: t('打电话道谢，用日语', 'Call to say thanks, in Japanese'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'japanese', delta: 1 },
        ],
      },
      {
        id: 'card',
        label: t('写张明信片寄回去', 'Write a postcard back'),
        effects: [
          { type: 'money', delta: -100 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'sp-portuguese-corner',
    channel: 'place:cafe',
    title: t('葡语角', 'Portuguese corner'),
    text: t(
      '喫茶店的老板想办一个葡萄牙语角，问你愿不愿意每月来带一次。',
      'The café owner wants to start a Portuguese conversation hour. Would you lead it once a month?',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'lead',
        label: t(
          '答应，顺便教大家做芝士面包',
          'Say yes, and teach pão de queijo too',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'stat', key: 'career', delta: 2 },
        ],
      },
      {
        id: 'later',
        label: t('等日语再好一点再说', 'Wait until your Japanese is stronger'),
        effects: [{ type: 'stat', key: 'japanese', delta: 1 }],
      },
    ],
  },
  {
    id: 'sp-night-shift',
    channel: 'place:home',
    title: t('夜班回来的人', 'Back from nights'),
    text: t(
      '悠斗夜班回来，眼睛都快睁不开了，还记得给你带了便利店的布丁。',
      'Yuto comes home from nights, barely awake, still holding a convenience-store pudding for you.',
    ),
    weight: 2,
    when: [{ minuteMin: 1140 }],
    choices: [
      {
        id: 'cook',
        label: t('给他煮碗味噌汤', 'Make him miso soup'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'yuto', delta: 25 },
        ],
      },
      {
        id: 'rest',
        label: t('让他先睡，明早再聊', 'Let him sleep; talk tomorrow'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'sp-brazil-call',
    channel: 'phone',
    title: t('圣保罗来的电话', 'A call from São Paulo'),
    text: t(
      '姐姐在视频里转了一圈：生日派对、气球、巧克力球。「下次你回来，我们再办一次。」',
      'Your sister spins the camera: birthday party, balloons, brigadeiros. “Next time you’re home, we’ll do it again.”',
    ),
    weight: 2,
    choices: [
      {
        id: 'sing',
        label: t(
          '隔着屏幕一起唱生日歌',
          'Sing happy birthday through the screen',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'quiet',
        label: t('挂了电话，去河边走走', 'Hang up and walk by the river'),
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
  choices: JpEvent['choices'],
): JpEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('港坂的早晨', 'Morning in Minatozaka'),
  text,
  weight: 0,
  once: true,
  choices,
});

const engineer: JpCharacter = {
  ...engineerProfile,
  startDate: '2026-03-01',
  stats: { money: 1_800_000, mood: 64, health: 72, japanese: 38, career: 30 },
  timeline: {
    stayStart: '2024-04-01',
    dateOfBirth: '1995-08-12',
    trips: [],
    permanentResidence: {
      // Engineer is a work status under both guidelines (SRC-113 1(3)ア, SRC-114 注2).
      routes: [
        {
          route: 'general',
          statusStart: '2024-04-01',
          newStatusStart: '2024-04-01',
        },
      ],
      evidence: {
        ...goodStanding,
        status: {
          kind: 'engineer',
          valid: true,
          grantedPeriodMonths: values.longestPeriod.value.deemedMonths,
          expiresOn: '2027-03-31',
          fitsCurrentCriteria: true,
        },
        applicantAnnualIncomeYen: 5_200_000,
        household: [],
      },
    },
    naturalisation: {
      routes: [{ route: 'general', homeMajorityAge: 18 }],
      evidence: naturalisationEvidence('2024-04-01'),
    },
    reentry: [],
  },
  opening: opening(
    'engineer',
    t(
      '窗外是商店街卷帘门拉起的声音。今天是来日本第三个春天的第一天，冰箱上还贴着垃圾分类表。',
      'Outside, the shopping street’s shutters rattle up. It’s the first day of your third spring in Japan, and the rubbish chart is still on the fridge.',
    ),
    [
      {
        id: 'walk',
        label: t(
          '先去河边看看樱花开了没有',
          'Check if the river’s cherry trees have opened',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'class',
        label: t(
          '翻出日语课本，今年要过评估',
          'Dig out the textbook: this is the year for the assessment',
        ),
        effects: [{ type: 'stat', key: 'japanese', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    '材料一页页递进窗口，收件章落下。港坂的灯笼还亮着，你知道明天也会在这里醒来。',
    'Page by page the papers go through the window, and the receipt stamp comes down. Minatozaka’s lanterns are still lit; tomorrow you’ll wake up here too.',
  ),
  events: engineerEvents,
};

const spouse: JpCharacter = {
  ...spouseProfile,
  startDate: '2026-03-01',
  stats: { money: 1_200_000, mood: 70, health: 70, japanese: 30, career: 15 },
  timeline: {
    stayStart: '2025-10-01',
    dateOfBirth: '1996-03-02',
    trips: [],
    permanentResidence: {
      routes: [{ route: 'spouse', marriedLifeFrom: '2024-06-15' }],
      evidence: {
        ...goodStanding,
        status: {
          kind: 'japaneseFamily',
          valid: true,
          grantedPeriodMonths: values.longestPeriod.value.deemedMonths,
          expiresOn: '2028-09-30',
          fitsCurrentCriteria: true,
        },
        family: {
          relativeStatus: 'japanese',
          relation: 'spouse',
          genuineMarriage: true,
        },
        applicantAnnualIncomeYen: 1_800_000,
        household: [
          {
            relationship: 'shared-home-and-budget',
            incomeTreatment: 'eligible',
            annualIncomeYen: 4_600_000,
          },
        ],
      },
    },
    naturalisation: {
      routes: [
        { route: 'spouse', marriedOn: '2024-06-15', stillJapaneseSpouse: true },
      ],
      evidence: naturalisationEvidence('2025-10-01'),
    },
    reentry: [],
  },
  opening: opening(
    'spouse',
    t(
      '悠斗留了张纸条：「夜班，冰箱里有饭团。今天区役所人少，记得去。」窗外的河面亮晶晶的。',
      'Yuto left a note: “Night shift. Onigiri in the fridge. The ward office is quiet today, remember to go.” The river glitters outside.',
    ),
    [
      {
        id: 'bakery',
        label: t('先去面包店报到', 'Head to the bakery first'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'river',
        label: t('沿河走一圈认认路', 'Walk the river to learn the way'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '窗口的职员把收件单递给你。回家的路上，悠斗在河边挥手，樱花树下有你们常坐的那张长椅。',
    'The clerk hands you the receipt. On the way home Yuto waves from the river, by the bench under the cherry trees where you always sit.',
  ),
  events: spouseEvents,
};

export const jpCharacters = [engineer, spouse];
export const jpProfiles = jpCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
