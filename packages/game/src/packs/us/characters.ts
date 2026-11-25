import type {
  UsCrime,
  UsFullResult,
  UsNaturalizationAnswers,
  UsTravelAnswers,
} from '@uk-immigration/engine';
import { addMonths } from '../../calendar';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import {
  cite,
  timeValues,
  values,
  type UsEffect,
  type UsFestival,
  type UsTimeline,
} from './rules';

type UsCharacter = Character<UsTimeline, UsEffect, UsFullResult, UsFestival>;
type UsEvent = GameEvent<UsEffect, UsFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

// Fictional individual facts below (dates, income, a clean record), not
// policy thresholds. Test results stay open until the in-game interview.
const noCrime: UsCrime = {
  unclassifiedRecord: false,
  cimtCount: 0,
  convictionCount: 0,
  combinedSentenceMonths: 0,
  confinementDays: 0,
  controlledSubstance: 'none',
  duiCount: 0,
};
const goodStanding: UsNaturalizationAnswers = {
  lawfulAdmission: 'cleared',
  removalProcess: 'none',
  residenceThroughOath: true,
  english: 'preparing',
  civics: 'preparing',
  disability: { requested: false },
  goodMoralCharacter: 'cleared',
  murderConviction: false,
  aggravatedFelonyConvictedOn: 'none',
  persecutionBar: false,
  statutoryPeriodCrime: noCrime,
  otherGmcBar: 'cleared',
  falseOralTestimony: false,
  benefitsAndSupport: 'clear',
  constitutionalAttachment: true,
  party: { membership: 'none' },
  selectiveService: 'not-required',
  warDesertionOrAlienageExemption: 'cleared',
  oath: 'willing',
  titlesRenounced: true,
  truthfulApplication: true,
};
const keptCard = (
  cardExpiresOn: string,
): UsTravelAnswers & {
  cardExpiresOn: string;
} => ({
  registration: 'registered',
  carryingEvidence: true,
  cardExpiresOn,
  otherReplacementGround: false,
  replacementFiledOn: 'not-filed',
  admissionTriggers: 'none',
  deportability: 'cleared',
  returnDocument: 'green-card',
  documentValidAtReturn: true,
  abandonment: 'cleared',
  // Returning after a long trip is a new admission (C36–C40).
  admission: {
    classAHealth: 'cleared',
    vaccines: 'cleared',
    medicalEvidence: 'cleared',
    publicChargeExempt: false,
    publicCharge: 'cleared',
    benefits: 'none',
    crime: noCrime,
    criminalOtherGround: 'cleared',
    drugTraffickingBar: false,
    securityGround: 'clear',
    party: { membership: 'none' },
    immigrationFraud: false,
    falseCitizenship: false,
    unlawfulDeparture: 'none',
    unlawfulReentryBar: false,
    otherInadmissibility: 'cleared',
  },
});

export const engineerProfile: CharacterProfile = {
  id: 'engineer',
  name: t('朴俊浩', 'Junho Park'),
  intro: t(
    '俊浩来自韩国釜山，2017 年来芝加哥读研，后来持 H-1B 在物流软件公司做工程师。2023 年 6 月，公司担保的职业移民绿卡获批。他住在湖湾一栋三层砖楼里，盼着有一天能入籍。人物与事件均为虚构。',
    'Junho from Busan, South Korea, came to Chicago for grad school in 2017 and stayed on an H-1B as a logistics software engineer. His employer-sponsored green card came through in June 2023. He lives in a Lakebend three-flat and hopes to naturalize one day. All characters and events are fictional.',
  ),
  sprite: 'urban/skilled-worker.png',
};
export const spouseProfile: CharacterProfile = {
  id: 'spouse',
  name: t('周晓雯', 'Xiaowen Zhou'),
  intro: t(
    `晓雯来自成都，2024 年和芝加哥高架列车司机马库斯·里德结婚，2025 年 9 月持移民签证入境，拿到 ${timeValues.conditionalYears.value} 年期的条件绿卡，在街角的饺子馆打工。只评估晓雯本人，人物与事件均为虚构。`,
    `Xiaowen from Chengdu married Chicago L train operator Marcus Reed in 2024. She arrived on an immigrant visa in September 2025 with a ${timeValues.conditionalYears.value}-year conditional green card and works at the dumpling shop on the corner. Only Xiaowen is assessed; all characters and events are fictional.`,
  ),
  sprite: 'urban/yao-flatmate.png',
};

const opening = (
  id: string,
  text: Text,
  choices: UsEvent['choices'],
): UsEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('湖湾的早晨', 'Morning in Lakebend'),
  text,
  weight: 0,
  once: true,
  choices,
});

const engineerEvents: UsEvent[] = [
  {
    id: 'eng-salary-review',
    channel: 'letter',
    title: t('年度评估', 'Annual review'),
    text: t(
      '经理说，你重写的路线规划让仓库的卡车少跑了不少空车。邮件最后一句：明年起加薪。',
      'Your manager says your rewritten route planner cut the warehouse’s empty truck runs. The email ends: a raise from next year.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }, { stat: 'career', min: 40 }],
    choices: [
      {
        id: 'thanks',
        label: t(
          '回信道谢，周末去韩国城吃烤肉',
          'Reply with thanks and celebrate with Korean barbecue',
        ),
        effects: [
          { type: 'salary', annualUsd: 116_000 },
          { type: 'money', delta: -60 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
        note: t(
          '虚构的薪资变化，只影响游戏里的收入。',
          'A fictional pay change that only affects in-game income.',
        ),
      },
    ],
  },
  {
    id: 'eng-seoul-offer',
    channel: 'letter',
    title: t('首尔的外派机会', 'An assignment in Seoul'),
    text: t(
      '公司要在首尔开新办公室，问你愿不愿意过去带七个月的项目。',
      'The company is opening a Seoul office and asks if you would lead the launch there for seven months.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 1 }],
    choices: [
      {
        id: 'remote',
        label: t(
          '婉拒，提出远程带团队',
          'Decline and offer to lead it remotely',
        ),
        effects: [
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
        note: t(
          `离境超过 ${timeValues.presumptionMonths.value} 个月会推定中断入籍所需的连续居住（${cite(timeValues.presumptionMonths)}）。`,
          `An absence of more than ${timeValues.presumptionMonths.value} months is presumed to break the continuous residence naturalization needs (${cite(timeValues.presumptionMonths)}).`,
        ),
      },
      {
        id: 'short',
        label: t(
          '问问能不能缩短成几次短差',
          'Ask to split it into short trips',
        ),
        effects: [{ type: 'stat', key: 'career', delta: 3 }],
      },
    ],
  },
  {
    id: 'eng-mom-call',
    channel: 'phone',
    title: t('釜山来的视频电话', 'A video call from Busan'),
    text: t(
      '妈妈举着一碗刚做好的海带汤：“生日也不回来，那边有没有人给你煮汤？”',
      'Mum holds up a fresh bowl of seaweed soup: “No birthday visit again — is anyone making you soup over there?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机带她看湖', 'Show her the lake on camera'),
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
    id: 'eng-civics-buddy',
    channel: 'place:library',
    title: t('互相出题', 'Quiz each other'),
    text: t(
      '阿明抱着一摞公民题卡片坐到你对面：“你问我，我问你。谁答错谁请咖啡。”',
      'Minh sits down across from you with a stack of civics cards. “You ask, I ask. Wrong answer buys the coffee.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'play',
        label: t('来，从三权分立问起', 'Deal — start with the three branches'),
        effects: [
          { type: 'stat', key: 'english', delta: 3 },
          { type: 'friendship', npc: 'minh', delta: 20 },
        ],
      },
      {
        id: 'later',
        label: t('今天先自己看', 'Study alone today'),
        effects: [{ type: 'stat', key: 'english', delta: 1 }],
      },
    ],
  },
  {
    id: 'eng-team-lunch',
    channel: 'phone',
    title: t('午饭邀请', 'A lunch invitation'),
    text: t(
      '同事普丽娅打来电话：楼下新开了一家意大利牛肉三明治店，排队排到了拐角。去不去？',
      'Coworker Priya calls: a new Italian beef place opened downstairs and the line wraps the corner. Coming?',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t(
          '去，要“湿的”加辣椒',
          'Go, and order it dipped with hot giardiniera',
        ),
        effects: [
          { type: 'money', delta: -14 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
      },
      {
        id: 'skip',
        label: t('今天带了饭', 'You packed lunch today'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'eng-n400-folder',
    channel: 'npc:fatima',
    speaker: 'fatima',
    title: t('法蒂玛的清单', 'Fatima’s checklist'),
    text: t(
      `法蒂玛把一张打印好的 N-400 准备清单推过来：“出入境日期、住址、工作经历，${timeValues.naturalizationYears.value} 年一项项对。别等最后一个月。”`,
      `Fatima slides over a printed N-400 checklist. “Trips, addresses, jobs — ${timeValues.naturalizationYears.value} years, line by line. Don’t leave it to the last month.”`,
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }],
    choices: [
      {
        id: 'copy',
        label: t(
          '拍下清单，周末整理',
          'Photograph it and sort it out at the weekend',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'fatima', delta: 25 },
        ],
      },
    ],
  },
];

const spouseEvents: UsEvent[] = [
  {
    id: 'sp-card-deadline',
    channel: 'place:home',
    title: t('条件绿卡上的日期', 'The date on the conditional card'),
    text: t(
      '冰箱上的日历圈着条件绿卡到期的那一天。马库斯把联名租约、银行账单和婚礼照片放进同一个文件夹。',
      'The fridge calendar circles the day the conditional card expires. Marcus drops the joint lease, bank statements and wedding photos into one folder.',
    ),
    weight: 3,
    once: true,
    when: [{ visaMonthsLeftMax: 6 }],
    choices: [
      {
        id: 'plan',
        label: t(
          '窗口一开就去联邦大楼寄',
          'Mail it from the Federal Building as soon as the window opens',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        sets: ['i751-planned'],
        note: t(
          `I-751 在条件绿卡到期前 ${timeValues.conditionsWindowDays.value} 天内递交（${cite(timeValues.conditionsWindowDays)}）。`,
          `File the I-751 in the ${timeValues.conditionsWindowDays.value} days before the conditional card expires (${cite(timeValues.conditionsWindowDays)}).`,
        ),
      },
      {
        id: 'later',
        label: t('把提醒贴在冰箱上', 'Stick a reminder on the fridge'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'sp-dumpling-shift',
    channel: 'morning',
    title: t('饺子馆早班', 'Early shift at the dumpling shop'),
    text: t(
      '老板娘发消息：明天有个公司订了两百个锅贴，能早来一小时吗？',
      'The owner texts: an office ordered two hundred potstickers for tomorrow. Can you come in an hour early?',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t('答应，早班加钱', 'Say yes for the early-shift pay'),
        effects: [
          { type: 'money', delta: 60 },
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
    id: 'sp-marriage-folder',
    channel: 'place:home',
    title: t('一起生活的证据', 'Proof of a life together'),
    text: t(
      '马库斯把两年的水电账单、联名报税单和你们在湖边的合影摊了一桌：“要不要按月份排好？”',
      'Marcus spreads two years of utility bills, joint tax returns and photos by the lake across the table. “Sort them by month?”',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 1 }],
    choices: [
      {
        id: 'sort',
        label: t(
          '按月份排，顺便挑几张好看的照片',
          'Sort by month and pick the nicest photos',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'marcus', delta: 25 },
        ],
      },
      {
        id: 'tomorrow',
        label: t('明天再弄，先看电影', 'Tomorrow; movie night first'),
        effects: [{ type: 'stat', key: 'mood', delta: 5 }],
      },
    ],
  },
  {
    id: 'sp-lunar-new-year',
    channel: 'phone',
    season: 1,
    title: t('成都来的拜年电话', 'New Year greetings from Chengdu'),
    text: t(
      '妈妈在视频里端着一盘香肠腊肉：“你们那边过年吗？马库斯会包饺子不？”',
      'Mum holds a plate of cured sausage up to the camera. “Do you celebrate over there? Can Marcus fold dumplings?”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'teach',
        label: t(
          '当场教马库斯包饺子',
          'Teach Marcus to fold dumplings on camera',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'marcus', delta: 15 },
        ],
      },
      {
        id: 'chinatown',
        label: t(
          '约好周末去唐人街看舞狮',
          'Plan to watch the lion dance in Chinatown',
        ),
        effects: [
          { type: 'money', delta: -30 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
      },
    ],
  },
  {
    id: 'sp-night-shift',
    channel: 'place:home',
    title: t('末班车回来的人', 'Back from the last train'),
    text: t(
      '马库斯开完末班红线回来，眼睛都快睁不开了，还记得给你带了一个波兰甜甜圈。',
      'Marcus is home from the last Red Line run, barely awake, still holding a Polish doughnut for you.',
    ),
    weight: 2,
    when: [{ minuteMin: 1140 }],
    choices: [
      {
        id: 'soup',
        label: t('给他热一碗汤', 'Warm him a bowl of soup'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'marcus', delta: 25 },
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
    id: 'sp-conversation-club',
    channel: 'place:college',
    title: t('英语角', 'Conversation club'),
    text: t(
      '下课后，安吉拉老师叫住你：“周四晚上有英语角，都是刚来的邻居。你来讲讲成都的火锅吧。”',
      'After class, Ms Brooks stops you. “Thursday nights we have a conversation club, all new neighbors. Come tell us about Chengdu hot pot.”',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'english', max: 59 }],
    choices: [
      {
        id: 'join',
        label: t('去，顺便带一罐辣椒油', 'Go, and bring a jar of chili oil'),
        effects: [
          { type: 'stat', key: 'english', delta: 3 },
          { type: 'friendship', npc: 'angela', delta: 20 },
        ],
      },
      {
        id: 'later',
        label: t('等口语再好一点', 'Wait until your speaking is better'),
        effects: [{ type: 'stat', key: 'english', delta: 1 }],
      },
    ],
  },
];

const permanentResident = {
  engineer: '2023-06-15',
  spouse: '2025-09-15',
};

const engineer: UsCharacter = {
  ...engineerProfile,
  startDate: '2026-03-01',
  stats: { money: 14_000, mood: 64, health: 72, english: 52, career: 34 },
  timeline: {
    dateOfBirth: '1993-04-18',
    permanentResident: permanentResident.engineer,
    conditional: 'none',
    stateResidenceFrom: '2017-08-20',
    trips: [{ departed: '2024-12-20', returned: '2025-01-08' }],
    naturalization: { ...goodStanding },
    travel: keptCard(
      addMonths(
        permanentResident.engineer,
        values.address.value.cardYears * 12,
      ),
    ),
    fees: { channel: 'paper', relief: 'none' },
    annualIncomeUsd: 108_000,
    moves: [],
    filed: {},
  },
  opening: opening(
    'engineer',
    t(
      '高架列车从窗外轰隆隆开过，咖啡杯在桌上轻轻震了一下。这是你在湖湾的第三个春天，冰箱上还贴着垃圾回收日的表。',
      'An L train rumbles past the window and your coffee cup trembles on the table. It is your third spring in Lakebend, and the recycling schedule is still on the fridge.',
    ),
    [
      {
        id: 'walk',
        label: t(
          '先去湖边看看冰化了没有',
          'Walk to the lake to see if the ice has gone',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'cards',
        label: t(
          '翻出公民题卡片，今年要准备入籍',
          'Dig out the civics cards: time to prepare for citizenship',
        ),
        effects: [{ type: 'stat', key: 'english', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    '你举起右手，跟着法官一句一句念完效忠誓词，小星条旗在手里沙沙响。走出联邦大楼时，高架列车正从头顶驶过，你给釜山的妈妈发了一张自拍。',
    'You raise your right hand and repeat the oath line by line, a little flag rustling in your hand. Outside the Federal Building an L train rolls overhead, and you send Mum in Busan a selfie.',
  ),
  events: engineerEvents,
};

const spouse: UsCharacter = {
  ...spouseProfile,
  startDate: '2026-03-01',
  stats: { money: 6_500, mood: 70, health: 70, english: 30, career: 16 },
  timeline: {
    dateOfBirth: '1995-09-02',
    permanentResident: permanentResident.spouse,
    conditional: 'marriage',
    stateResidenceFrom: permanentResident.spouse,
    marriage: { married: '2024-05-18', spouseCitizenSince: '1991-11-03' },
    trips: [],
    // No I-751 is pending until it is mailed (see usRequest).
    naturalization: {
      ...goodStanding,
      spouse: {
        validMarriage: true,
        livedTogetherRequiredPeriod: 'cleared',
        spouseCitizenRequiredPeriod: true,
        marriageAndCitizenshipThroughOath: true,
      },
    },
    conditions: {
      marriage: {
        marriedOn: '2024-05-18',
        bonaFide: 'cleared',
        improperConsideration: false,
        filing: 'joint',
        spouseJoins: true,
        finalRemovalOrder: false,
        interviewRequirement: 'cleared',
      },
    },
    // The conditional card ends at the second anniversary (SRC-079 8 U.S.C. 1186a(d)(2)(A)).
    travel: keptCard(
      addMonths(
        permanentResident.spouse,
        timeValues.conditionalYears.value * 12,
      ),
    ),
    fees: { channel: 'paper', relief: 'none' },
    annualIncomeUsd: 106_000,
    moves: [],
    filed: {},
  },
  opening: opening(
    'spouse',
    t(
      '马库斯留了张纸条：“早班红线。冰箱里有剩的深盘披萨。I-751 的文件夹在书架上，我们一起准备。”窗外的湖面亮晶晶的。',
      'Marcus left a note: “Early Red Line shift. Leftover deep dish in the fridge. The I-751 folder is on the shelf — we’ll do it together.” The lake glitters outside.',
    ),
    [
      {
        id: 'shop',
        label: t('先去饺子馆报到', 'Head to the dumpling shop first'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'lake',
        label: t(
          '沿着湖滨步道走一圈认认路',
          'Walk the Lakefront Trail to learn the way',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '宣誓结束，马库斯在大厅里举着一束花，哭得比你还厉害。回家的红线上，你把入籍证书抱在怀里，窗外是一闪一闪的密歇根湖。',
    'After the oath, Marcus is waiting in the lobby with flowers, crying harder than you. On the Red Line home you hug the certificate while Lake Michigan flickers past the window.',
  ),
  events: spouseEvents,
};

export const usCharacters = [engineer, spouse];
export const usProfiles = usCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
