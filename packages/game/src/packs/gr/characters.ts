import type { CountryResult, GrFullRequest } from '@uk-immigration/engine';
import { addDays, addMonths } from '../../calendar';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import {
  values,
  type GrEffect,
  type GrFestival,
  type GrTimeline,
} from './rules';

type GrCharacter = Character<GrTimeline, GrEffect, CountryResult, GrFestival>;
type GrEvent = GameEvent<GrEffect, GrFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
/** The last day of a card granted on `from` for `years` years. */
const cardEnd = (from: string, years: number) =>
  addDays(addMonths(from, years * 12), -1);

// Fictional individual facts below (dates, income, documents), not policy
// thresholds. Card periods come from policy-data.
const goodStanding = {
  citizenship: 'third-country',
  entry: 'permit',
  publicOrder: 'clear',
  publicHealth: 'cleared',
  biometrics: 'provided',
  insurance: { kind: 'public', coversFamily: true },
  filingDocuments: { formReady: true, feeReceiptReady: true },
  permitHistoryComplete: true,
  route: 'general',
  trips: [],
  changes: [],
} satisfies Partial<GrFullRequest>;

const naturalisation = (
  incomeByTaxYear: GrTimeline['nationality']['incomeByTaxYear'],
): GrTimeline['nationality'] => ({
  stage: 'application',
  permit: 'listed',
  shortRouteBasis: 'none',
  convictions: [],
  removalOrStatusProceedings: false,
  exam: 'not-passed',
  incomeByTaxYear,
  taxAndSocialInsuranceCurrent: true,
  economicActivity: 'stable-declared-work',
  livingResources: 'substantiated',
  integrationAssessment: 'accepted',
  civilStatusProof: 'legalised-translation',
  hasAmka: true,
  hasTaxAssessments: true,
  feeClass: 'ordinary',
  lastRejection: 'none',
});

export const blueCardProfile: CharacterProfile = {
  id: 'bluecard',
  name: t('卡里姆·哈达德', 'Karim Haddad'),
  intro: t(
    '卡里姆来自黎巴嫩，2024 年秋天拿欧盟蓝卡来到雅典海边，在港口的船舶管理公司写航行软件，年薪 5.6 万欧元。蓝卡是改革前签发的，今年秋天就要续期。人物与事件均为虚构。',
    'Karim from Lebanon came to the Athens coast in autumn 2024 on an EU Blue Card. He writes navigation software for a ship-management firm at the harbour and earns €56,000 a year. His card predates the reform and needs renewing this autumn. All characters and events are fictional.',
  ),
  sprite: 'urban/rahman.png',
};
export const spouseProfile: CharacterProfile = {
  id: 'spouse',
  name: t('林晓雯', 'Xiaowen Lin'),
  intro: t(
    '晓雯来自福建，和希腊轮机工程师扬尼斯在雅典登记结婚，2023 年春天搬来利马纳基，拿希腊公民家属居留卡 Ο.3，在港口的船代公司做中英希三语翻译。只评估晓雯本人，人物与事件均为虚构。',
    'Xiaowen from Fujian married Yannis, a Greek ferry engineer, in Athens and moved to Limanaki in spring 2023 on the Ο.3 card for a Greek citizen’s family. She translates Chinese, English and Greek for a shipping agency at the port. Only Xiaowen is assessed; all characters and events are fictional.',
  ),
  sprite: 'urban/ka-ning-partner.png',
};

const renewalFolder: GrEvent = {
  id: 'kar-renewal-folder',
  channel: 'place:home',
  title: t('蓝卡上的日期', 'The date on the Blue Card'),
  text: t(
    '蓝卡背面的到期日越来越近。你把护照、合同、社保记录和两张照片放进同一个文件夹。',
    'The expiry on the back of your Blue Card is getting closer. Passport, contract, insurance record and two photos go into one folder.',
  ),
  weight: 3,
  once: true,
  when: [{ visaMonthsLeftMax: 3 }],
  choices: [
    {
      id: 'plan',
      label: t('这周就去移民局办事处', 'Go to the migration office this week'),
      effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      sets: ['renewal-planned'],
    },
    {
      id: 'later',
      label: t('先把提醒贴在冰箱上', 'Stick a reminder on the fridge'),
      effects: [{ type: 'stat', key: 'mood', delta: 4 }],
    },
  ],
};

const blueCardEvents: GrEvent[] = [
  renewalFolder,
  {
    id: 'kar-ship-alarm',
    channel: 'morning',
    title: t('凌晨的告警', 'A dawn alarm'),
    text: t(
      '一条货轮的航线系统在克里特岛外报错。船长的语音留言里夹着海风声。',
      'A cargo ship’s routing system throws an error off Crete. The captain’s voice message comes with the sound of wind.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'fix',
        label: t(
          '早饭顾不上，先远程修好',
          'Skip breakfast and fix it remotely',
        ),
        effects: [
          { type: 'stat', key: 'career', delta: 3 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'handover',
        label: t(
          '交给值班同事，自己按时到岗',
          'Hand it to the on-call colleague',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'kar-island-weekend',
    channel: 'phone',
    title: t('去埃伊纳岛吗？', 'Off to Aegina?'),
    text: t(
      '同事索菲亚打来电话：周六早上一班渡轮去埃伊纳岛，吃开心果、游泳，晚上回来。',
      'Colleague Sofia calls: an early Saturday ferry to Aegina for pistachios and a swim, back by evening.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，顺便练希腊语', 'Go, and practise Greek'),
        effects: [
          { type: 'money', delta: -60 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
      {
        id: 'skip',
        label: t('这周想在家歇着', 'Stay home this weekend'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'kar-beirut-call',
    channel: 'phone',
    title: t('贝鲁特来的视频', 'A video call from Beirut'),
    text: t(
      '妈妈在镜头那头举起一盘塔布勒沙拉：「希腊的柠檬有我们的酸吗？」',
      'On the screen, Mum holds up a plate of tabbouleh. “Are Greek lemons as sharp as ours?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机带她看海', 'Show her the sea'),
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
    id: 'kar-language-swap',
    channel: 'place:college',
    title: t('语伴', 'A language partner'),
    text: t(
      '课后，一个准备去贝鲁特读书的希腊学生想和你交换语言：一小时阿拉伯语，换一小时希腊语。',
      'After class, a Greek student heading to Beirut to study offers a swap: an hour of Arabic for an hour of Greek.',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'greek', max: 44 }],
    choices: [
      {
        id: 'swap',
        label: t('约好每周四', 'Agree on Thursdays'),
        effects: [
          { type: 'stat', key: 'greek', delta: 3 },
          { type: 'friendship', npc: 'katerina', delta: 15 },
        ],
      },
      {
        id: 'solo',
        label: t('先自己背单词', 'Study alone for now'),
        effects: [{ type: 'stat', key: 'greek', delta: 1 }],
      },
    ],
  },
  {
    id: 'kar-ardit-folder',
    channel: 'npc:ardit',
    speaker: 'ardit',
    title: t('阿尔迪特的文件夹', 'Ardit’s folder'),
    text: t(
      '阿尔迪特从收银台下面抽出一个蓝色文件夹：「每年的税单都留着，一张不能少。我入籍那年就差点栽在这上面。」',
      'Ardit pulls a blue folder from under the till. “Keep every year’s tax assessment. Every single one. It nearly sank my citizenship.”',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }],
    choices: [
      {
        id: 'copy',
        label: t('回家就整理税单', 'Sort your tax papers tonight'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'ardit', delta: 25 },
        ],
      },
    ],
  },
];

const spouseEvents: GrEvent[] = [
  {
    id: 'sp-rotation-home',
    channel: 'place:home',
    title: t('跑船回来的人', 'Back from the ferries'),
    text: t(
      '扬尼斯跑完两周的海岛航线回来，背包里塞着一块纳克索斯的奶酪，晒黑了一圈。',
      'Yannis is back from two weeks on the island run, a wedge of Naxos cheese in his bag and a fresh tan.',
    ),
    weight: 2,
    when: [{ minuteMin: 1140 }],
    choices: [
      {
        id: 'cook',
        label: t('给他煮一碗番茄鸡蛋面', 'Make him tomato and egg noodles'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'yannis', delta: 25 },
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
    id: 'sp-mother-in-law',
    channel: 'letter',
    title: t('婆婆的罐子', 'A jar from your mother-in-law'),
    text: t(
      '包裹里是一罐自家熬的无花果蜜饯，纸条上写着：「下次来，我教你做。」',
      'The parcel holds a jar of homemade fig spoon sweet and a note: “Next time you visit, I’ll teach you.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'call',
        label: t('用希腊语打电话道谢', 'Call to say thanks, in Greek'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
      {
        id: 'card',
        label: t('寄一张明信片回去', 'Send a postcard back'),
        effects: [
          { type: 'money', delta: -2 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'sp-client-visit',
    channel: 'morning',
    title: t('大客户来访', 'A big client visit'),
    text: t(
      '一家中国船东的代表团今天到港，经理问你能不能全天跟着翻译。',
      'A delegation from a Chinese shipowner arrives today. Your manager asks you to interpret all day.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t(
          '答应，晚上加班整理纪要',
          'Say yes and write up the minutes tonight',
        ),
        effects: [
          { type: 'money', delta: 80 },
          { type: 'stat', key: 'career', delta: 3 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'share',
        label: t(
          '只跟上午的会，下午交给同事',
          'Take the morning, hand over the afternoon',
        ),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'sp-spring-festival',
    channel: 'phone',
    season: 1,
    title: t('除夕的视频', 'New Year’s Eve call'),
    text: t(
      '福建那边正在包饺子，奶奶凑到镜头前：「希腊也过年吗？」',
      'At home in Fujian they are folding dumplings. Grandma leans into the camera: “Do they celebrate New Year in Greece?”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'show',
        label: t('举着手机给她看海和渔船', 'Show her the sea and the boats'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'cook',
        label: t(
          '挂了电话，和扬尼斯包饺子',
          'Hang up and fold dumplings with Yannis',
        ),
        effects: [
          { type: 'money', delta: -10 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'yannis', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'sp-name-day',
    channel: 'morning',
    season: 1,
    title: t('扬尼斯的命名日', 'Yannis’s name day'),
    text: t(
      '1 月 7 日，圣约翰日。门铃从早上就没停过：亲戚、邻居、扬尼斯的船员朋友，谁都没打招呼就来了。',
      'January 7th, Saint John’s day. The doorbell rings from morning on: relatives, neighbours, Yannis’s crewmates, all unannounced.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'sweets',
        label: t('赶紧下楼买一盒果仁蜜饼', 'Run down for a box of baklava'),
        effects: [
          { type: 'money', delta: -15 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
      {
        id: 'tea',
        label: t('泡一大壶山茶招待', 'Brew a big pot of mountain tea'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'sp-chinese-lessons',
    channel: 'place:cafe',
    title: t('想学中文的孙子', 'A grandson who wants Chinese'),
    text: t(
      '咖啡馆老板的孙子要去上海交换，老板问你愿不愿意周末教他几句中文。',
      'The kafeneio owner’s grandson is off to Shanghai on exchange. Would you teach him some Chinese at weekends?',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'teach',
        label: t(
          '答应，顺便请他纠正你的希腊语',
          'Say yes, and ask him to correct your Greek',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'greek', delta: 2 },
        ],
      },
      {
        id: 'later',
        label: t('等忙完这一季再说', 'After this busy season'),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
];

const opening = (
  id: string,
  text: Text,
  choices: GrEvent['choices'],
): GrEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('利马纳基的早晨', 'Morning in Limanaki'),
  text,
  weight: 0,
  once: true,
  choices,
});

const blueCardStart = '2024-09-15';
const blueCardExpiry = cardEnd(
  blueCardStart,
  values.workValidity.value.blueBeforeReformYears,
);
const blueCard: GrCharacter = {
  ...blueCardProfile,
  startDate: '2026-03-01',
  stats: { money: 14_000, mood: 64, health: 72, greek: 22, career: 32 },
  timeline: {
    ...goodStanding,
    birthDate: '1993-04-18',
    // A fictional passport for the whole game, which has no passport renewal:
    // issued on the first day, so every assessment falls within the issue
    // years, and valid past a renewal in 2035 plus the remaining months.
    passport: {
      kind: 'recognised',
      issuedOn: '2026-03-01',
      expiresOn: '2039-02-28',
      blankPages: 6,
      expectedDeparture: blueCardExpiry,
    },
    permits: [
      {
        kind: 'regular',
        from: blueCardStart,
        issuedOn: blueCardStart,
        purpose: 'other',
      },
    ],
    currentCardExpiresOn: blueCardExpiry,
    pathways: ['GR-LONG-TERM', 'GR-NATIONALITY'],
    longTerm: {
      stage: 'initial',
      category: 'ordinary',
      passportHistory: 'complete',
    },
    integration: { basis: 'none' },
    residenceIncome: {
      netEur: 38_000,
      dependants: 0,
      regularAndDocumented: true,
    },
    nationality: naturalisation({
      2024: { taxableEur: 18_700, dependants: 0 },
      2025: { taxableEur: 56_000, dependants: 0 },
    }),
  },
  opening: opening(
    'bluecard',
    t(
      '楼下报亭的老板在摆报纸，海风把阳台上的毛巾吹得啪啪响。这是你在希腊的第二个春天，蓝卡今年秋天到期。',
      'Downstairs the kiosk owner stacks the papers and the sea wind snaps the towel on the balcony. It’s your second spring in Greece, and the Blue Card expires this autumn.',
    ),
    [
      {
        id: 'walk',
        label: t('先去海边走一圈', 'Walk down to the sea first'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'study',
        label: t(
          '翻出希腊语课本，今年要考 A2',
          'Dig out the Greek textbook: this is the year for A2',
        ),
        effects: [{ type: 'stat', key: 'greek', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    '长期居留的回执纸递到你手里，蓝色的，还带着打印机的温度。窗外，斯塔夫罗斯的小渔船正在进港。',
    'The receipt for long-term residence is handed over, blue and still warm from the printer. Outside, Stavros’s boat is coming into harbour.',
  ),
  events: blueCardEvents,
};

const spouseCardStart = '2023-06-20';
const spouseCardExpiry = cardEnd(
  spouseCardStart,
  values.gfPeriods.value.residenceYears,
);
const spouse: GrCharacter = {
  ...spouseProfile,
  startDate: '2026-03-01',
  stats: { money: 9_000, mood: 70, health: 70, greek: 34, career: 18 },
  timeline: {
    ...goodStanding,
    birthDate: '1994-10-03',
    // A fictional passport valid past the end of the game, which has no
    // passport renewal.
    passport: {
      kind: 'recognised',
      issuedOn: '2022-05-01',
      expiresOn: '2036-04-30',
      blankPages: 8,
    },
    permits: [
      {
        kind: 'regular',
        from: spouseCardStart,
        issuedOn: spouseCardStart,
        purpose: 'other',
      },
    ],
    currentCardExpiresOn: spouseCardExpiry,
    pathways: ['GR-GREEK-FAMILY-PR', 'GR-NATIONALITY'],
    greekFamily: {
      stage: 'permanent',
      relationship: 'spouse',
      registeredInGreece: true,
      genuineRelationship: true,
      // Living together in Greece since arriving on the family visa.
      residenceFrom: '2023-05-02',
      qualifyingResidenceDocumented: true,
      priorCardExpiry: spouseCardExpiry,
    },
    residenceIncome: {
      netEur: 15_000,
      dependants: 0,
      regularAndDocumented: true,
    },
    nationality: naturalisation({
      2023: { taxableEur: 10_000, dependants: 0 },
      2024: { taxableEur: 19_000, dependants: 0 },
      2025: { taxableEur: 19_000, dependants: 0 },
    }),
  },
  opening: opening(
    'spouse',
    t(
      '扬尼斯留了张纸条：「两周后回来。冰箱里有菠菜派。周六记得去菜市买橙子。」窗外的海亮晶晶的。',
      'Yannis left a note: “Back in two weeks. Spinach pie in the fridge. Saturday market for oranges.” The sea glitters outside.',
    ),
    [
      {
        id: 'office',
        label: t('早点去港口办公室', 'Head to the harbour office early'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'sea',
        label: t('沿着海滨路走一圈', 'Walk the seafront first'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '窗口的职员把回执递给你。回家的路上，扬尼斯在码头挥手，身后是你们常坐的那张长椅。',
    'The clerk hands you the receipt. On the way home Yannis waves from the quay, by the bench where you always sit.',
  ),
  events: spouseEvents,
};

export const grCharacters = [blueCard, spouse];
export const grProfiles = grCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
