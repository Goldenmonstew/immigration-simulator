import type { CaFullResult } from '@uk-immigration/engine';
import { canadaFull2026_11 } from '@uk-immigration/policy-data';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import type { CaEffect, CaFestival, CaTimeline } from './rules';

type CaCharacter = Character<CaTimeline, CaEffect, CaFullResult, CaFestival>;
type CaEvent = GameEvent<CaEffect, CaFestival>;
type Residence = NonNullable<CaTimeline['residence']>;
type Federal = NonNullable<CaTimeline['federal']>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const v = canadaFull2026_11.values;
const days = v.citizenshipDays.value.toLocaleString('en-CA');

// Fictional individual facts below (dates, pay, documents), not policy
// thresholds. Answers left out stay unanswered, as in the questionnaire.
const clearRecord: Residence = {
  prStatus: 'valid',
  prConditionsFulfilled: true,
  prDays: { credits: [], exclusions: [] },
  humanitarianRelief: 'none',
  adultSigned: true,
  citizenshipDays: { credits: [], exclusions: [] },
  noEffectiveRemovalOrder: true,
  noEffectiveSecurityDeclaration: true,
  returnAuthorizedIfRequired: true,
  noCurrentSentenceOrProbation: true,
  noProhibitedCanadianProceedings: true,
  noEquivalentForeignProceedings: true,
  noWarCrimesProceedingsOrConviction: true,
  history: {
    convictions: [],
    misrepresentationBars: [],
    revocations: [],
    noCurrentMisrepresentation: true,
    specialProhibitionCleared: true,
    classificationsConfirmed: true,
  },
  identityAndDeclarationsReady: true,
  fingerprintAndCourtRequestsSatisfied: true,
  policeStays: [],
};

const clearAdmissibility: Federal = {
  principal: {
    safety: {
      security: 'clear',
      humanRights: 'clear',
      sanctions: 'clear',
      organisedCrime: 'clear',
    },
    criminalFinding: 'clear',
    publicHealth: 'clear',
    publicSafety: 'clear',
    excessiveDemand: 'clear',
    // Lived in India from adulthood until leaving to study; the certificate
    // is requested in the game.
    foreignStays: [
      { from: '2019-02-10', until: '2023-08-25', currentCountry: false },
    ],
    definitiveChecklistSatisfied: true,
  },
  members: [],
  adequateSupportArrangements: true,
  misrepresentation: 'clear',
  protectionAndCompliance: 'clear',
  applications: {},
};

export const citizenProfile: CharacterProfile = {
  id: 'citizen',
  name: t('周婉宁', 'Wanning Zhou'),
  intro: t(
    '婉宁来自成都，2022 年秋天到哈利法克斯读海洋科学硕士，毕业后在港湾医院检验科做技师，2025 年 6 月成为永久居民。她想在枫港住下去，等实际居住天数够了就申请入籍。人物与事件均为虚构。',
    'Wanning from Chengdu came to Halifax in autumn 2022 for a master’s in marine science, stayed on as a hospital lab technologist and became a permanent resident in June 2025. She wants to make Maple Harbour home and apply for citizenship once she has the days. All characters and events are fictional.',
  ),
  sprite: 'urban/ka-ning-partner.png',
};
export const graduateProfile: CharacterProfile = {
  id: 'graduate',
  name: t('阿迪蒂·拉奥', 'Aditi Rao'),
  intro: t(
    '阿迪蒂来自浦那，2025 年夏天从枫港社区学院的两年制护理课程毕业，持毕业生工作许可在港湾医院做护理助理，和魁北克来的室友合租。她想通过大西洋移民项目申请永久居民。人物与事件均为虚构。',
    'Aditi from Pune finished a two-year care diploma at Maple Harbour Community College in summer 2025. On a post-graduation work permit she works as a continuing care assistant at the harbour hospital and shares a flat with a roommate from Québec. She hopes to apply for PR through the Atlantic Immigration Program. All characters and events are fictional.',
  ),
  sprite: 'urban/graduate.png',
};

const citizenEvents: CaEvent[] = [
  {
    id: 'cit-shift-swap',
    channel: 'place:work',
    title: t('换个班', 'A shift swap'),
    text: t(
      '同事丹妮尔探进检验科：「周六的班能跟我换吗？我女儿的冰球决赛。」',
      'Your colleague Danielle leans into the lab. “Could you swap Saturday with me? My daughter’s hockey final.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'swap',
        label: t('换，顺便要一张决赛门票', 'Swap, and ask for a ticket'),
        effects: [
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'keep',
        label: t('周六已经约了菜园', 'Saturday is for the garden'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'cit-parents-call',
    channel: 'phone',
    title: t('成都的早上', 'Morning in Chengdu'),
    text: t(
      '妈妈在视频那头端着一碗冒菜：「今年春节回来吗？你爸把阳台的花都换了一遍。」',
      'Mum holds up a bowl of spicy hotpot on the video call. “Coming home for Spring Festival? Your dad replanted the whole balcony.”',
    ),
    weight: 2,
    choices: [
      {
        id: 'tour',
        label: t('举着手机带她看港口', 'Show her the harbour'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'later',
        label: t(
          '说等入籍办好了一起庆祝',
          'Promise a celebration after citizenship',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'civics', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'cit-discover-canada',
    channel: 'place:library',
    title: t('一本学习指南', 'A study guide'),
    text: t(
      '图书馆的借书台旁摆着一摞《发现加拿大》。夸梅正好在还书：「我当年就靠这本。第一章先看权利与责任。」',
      'A stack of Discover Canada guides sits by the library desk. Kwame is returning a book. “This got me through. Start with rights and responsibilities.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'borrow',
        label: t('借一本，今晚就开始看', 'Borrow one and start tonight'),
        effects: [
          { type: 'stat', key: 'civics', delta: 4 },
          { type: 'friendship', npc: 'kwame', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'cit-days-count',
    channel: 'place:home',
    title: t('数一数日子', 'Counting the days'),
    text: t(
      '你把护照上的出入境章一个个抄进表格。每一趟回国都让入籍的日子往后挪一点。',
      'You copy every passport stamp into a spreadsheet. Each trip home pushes citizenship a little further away.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'note',
        label: t('把进度条截图存好', 'Save a screenshot of the progress'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        note: t(
          `入籍要在签署申请前 ${v.citizenshipWindowYears.value} 年内有 ${days} 天实际居住；成为永久居民之前合法居留的日子按 ${v.citPrePrDailyCredit.value} 天计，最多 ${v.preResidenceCreditCap.value} 天（SRC-074 s.5(1)(c)(i)、s.5(1.001)）。`,
          `Citizenship needs ${days} days of physical presence in the ${v.citizenshipWindowYears.value} years before signing; each lawful day before PR counts as ${v.citPrePrDailyCredit.value} of a day, up to ${v.preResidenceCreditCap.value} days (SRC-074 s.5(1)(c)(i), s.5(1.001)).`,
        ),
      },
    ],
  },
  {
    id: 'cit-kwame-ceremony',
    channel: 'npc:kwame',
    speaker: 'kwame',
    title: t('夸梅的宣誓日', 'Kwame’s oath day'),
    text: t(
      '夸梅翻出手机里的照片：一面小枫叶旗、一张证书，还有他妈妈哭花的脸。「那天我唱国歌唱破了音。」',
      'Kwame scrolls to a photo: a little maple-leaf flag, a certificate, his mum in happy tears. “My voice cracked on the anthem.”',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }],
    choices: [
      {
        id: 'listen',
        label: t('让他再讲一遍那天', 'Ask him to tell the whole day'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'kwame', delta: 25 },
        ],
      },
    ],
  },
];

const graduateEvents: CaEvent[] = [
  {
    id: 'grad-early-shift',
    channel: 'morning',
    title: t('早班缺人', 'Short on the early shift'),
    text: t(
      '护士长发来消息：长期护理病房今天早班少一个人，能提前两小时来吗？',
      'The charge nurse texts: the long-term care unit is one short this morning. Can you come in two hours early?',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t('答应，早班有加班费', 'Say yes for the extra pay'),
        effects: [
          { type: 'money', delta: 60 },
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'no',
        label: t('婉拒，今天要睡够', 'Decline and sleep in'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'grad-chloe-poutine',
    channel: 'place:home',
    title: t('poutine 之争', 'The poutine debate'),
    text: t(
      '室友克洛伊端着外卖盒抗议：「这里的 poutine 奶酪粒不会吱吱响！明年夏天跟我回蒙特利尔吃真的。」',
      'Your roommate Chloé waves a takeaway box. “The curds here don’t squeak! Come to Montréal next summer for the real thing.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'french',
        label: t('请她教几句法语当回报', 'Trade her for a few French phrases'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'chloe', delta: 25 },
        ],
      },
      {
        id: 'defend',
        label: t('替哈利法克斯的 donair 辩护', 'Defend Halifax donair instead'),
        effects: [{ type: 'stat', key: 'mood', delta: 5 }],
      },
    ],
  },
  {
    id: 'grad-diwali-call',
    channel: 'phone',
    season: 4,
    title: t('排灯节', 'Diwali'),
    text: t(
      '视频里，浦那的阳台点满了油灯，妹妹举着一盒拉杜甜球：「给你留了一个，等你回来。」',
      'On the video call, the balcony in Pune glows with diyas. Your sister holds up a box of laddoos. “We saved you one.”',
    ),
    weight: 3,
    choices: [
      {
        id: 'lamps',
        label: t(
          '也在窗台点一排小蜡烛',
          'Light a row of tea lights on your sill',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'share',
        label: t('做甜点分给楼里的邻居', 'Make sweets for the neighbours'),
        effects: [
          { type: 'money', delta: -15 },
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'doreen', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'grad-snow-bus',
    channel: 'morning',
    title: t('雪天改约', 'Snow changes plans'),
    text: t(
      '暴雪让公交停了一半。护士长说今天的病房培训改到下周，路上注意安全。',
      'The snowstorm takes half the buses off the road. The charge nurse moves today’s training to next week. “Get here safely.”',
    ),
    weight: 3,
    when: [{ weather: 'snow' }],
    choices: [
      {
        id: 'walk',
        label: t('裹好围巾，走着去', 'Wrap up and walk in'),
        effects: [
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'health', delta: -1 },
        ],
      },
      {
        id: 'shovel',
        label: t('先帮楼下铲雪', 'Help shovel the front steps first'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'doreen', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'grad-winter-coat',
    channel: 'place:newcomer',
    title: t('过冬讲座', 'A winter-ready workshop'),
    text: t(
      '法蒂玛在安家中心办过冬讲座：三层穿法、防滑鞋钉、怎样看风寒指数。桌上堆着捐来的羽绒服。',
      'Fatima runs a winter workshop at the newcomer centre: three layers, ice cleats, reading the wind chill. Donated parkas are piled on the table.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'parka',
        label: t('挑一件合身的羽绒服', 'Pick a parka that fits'),
        effects: [
          { type: 'stat', key: 'health', delta: 4 },
          { type: 'friendship', npc: 'fatima', delta: 20 },
        ],
      },
      {
        id: 'volunteer',
        label: t('留下来帮忙分衣服', 'Stay to help sort coats'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'english', delta: 1 },
        ],
      },
    ],
  },
];

const opening = (
  id: string,
  text: Text,
  choices: CaEvent['choices'],
): CaEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('枫港的早晨', 'Morning in Maple Harbour'),
  text,
  weight: 0,
  once: true,
  choices,
});

const citizen: CaCharacter = {
  ...citizenProfile,
  startDate: '2026-03-01',
  stats: {
    money: 18_000,
    mood: 66,
    health: 72,
    english: 72,
    career: 35,
    civics: 20,
  },
  timeline: {
    goals: ['CA-RESIDENCY', 'CA-CITIZENSHIP'],
    arrived: '2022-08-25',
    document: { kind: 'pr-card', expires: '2030-07-15' },
    annualIncome: 68_000,
    citizenshipStatus: 'not-citizen',
    dateOfBirth: '1997-04-18',
    permanentResident: '2025-06-02',
    temporaryPeriods: [{ from: '2022-08-25', to: '2025-06-01' }],
    trips: [{ departed: '2025-12-18', returned: '2026-01-08' }],
    residence: {
      ...clearRecord,
      taxYears: { 2022: 'filed', 2023: 'filed', 2024: 'filed' },
      // A Canadian master's degree taught in English (SRC-263).
      language: { evidence: 'accepted-alternative' },
      test: { outcome: 'not-taken' },
    },
  },
  opening: opening(
    'citizen',
    t(
      '雾角在港口外响了两声。今天是在加拿大的第四个春天，冰箱上贴着成为永久居民那天拍的照片。',
      'The foghorn sounds twice beyond the harbour. It’s your fourth spring in Canada, and the photo from the day you became a permanent resident is still on the fridge.',
    ),
    [
      {
        id: 'wharf',
        label: t(
          '先去码头看看冰化了没有',
          'Check if the ice has left the wharf',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'guide',
        label: t('翻开入籍学习指南', 'Open the citizenship study guide'),
        effects: [{ type: 'stat', key: 'civics', delta: 3 }],
      },
    ],
  ),
  settlement: t(
    '你举起右手念完誓词，主持仪式的法官笑着说「欢迎」。走出门，港口的风把手里的小枫叶旗吹得哗哗响。',
    'You raise your right hand and finish the oath, and the judge smiles: “Welcome.” Outside, the harbour wind snaps the little maple-leaf flag in your hand.',
  ),
  events: citizenEvents,
};

const graduate: CaCharacter = {
  ...graduateProfile,
  startDate: '2026-03-01',
  stats: {
    money: 6_500,
    mood: 68,
    health: 70,
    english: 52,
    career: 22,
    civics: 0,
  },
  timeline: {
    goals: ['CA-AIP', 'CA-CITIZENSHIP'],
    arrived: '2023-08-25',
    document: { kind: 'work-permit', expires: '2028-06-30' },
    annualIncome: 44_000,
    job: {
      from: '2025-07-07',
      noc: '33102',
      teer: 3,
      dailyHours: [0, 8, 8, 8, 8, 8, 0],
      dutiesConfirmed: true,
      pay: 'paid',
      canadianEntityPays: true,
      inCanada: true,
      canadianEmployer: true,
      remoteWork: false,
      authorizedTemporaryResident: true,
      fullTimeStudent: false,
      selfEmployed: false,
    },
    citizenshipStatus: 'not-citizen',
    dateOfBirth: '2001-02-10',
    trips: [],
    residence: { prStatus: 'never' },
    atlantic: {
      destination: 'NS',
      jobProvince: 'NS',
      employerDesignated: true,
      graduate: {
        claimsExemption: true,
        awarded: '2025-06-13',
        recognizedInstitution: true,
        yearsOfStudy: 2,
        fullTimeThroughout: true,
        monthsResidentInInstitutionProvinceDuringLastTwoYears: 24,
        temporaryStatusAndAuthorizationThroughout: true,
        distanceLearningPercent: 0,
        secondLanguageStudyPercent: 0,
        returnHomeObligation: false,
      },
      education: { origin: 'Canada', level: 'twoYears' },
      workingInCanada: true,
      fundsExemptionAuthorization: true,
    },
    federal: clearAdmissibility,
  },
  opening: opening(
    'graduate',
    t(
      '克洛伊在门上贴了张便利贴：「我去实验室了，冰箱里有枫糖甜甜圈。别忘了今天去安家中心问问大西洋项目！」窗外的港口雾蒙蒙的。',
      'Chloé left a sticky note on the door: “At the lab. Maple doughnuts in the fridge. Ask the newcomer centre about the Atlantic program today!” The harbour is misty outside.',
    ),
    [
      {
        id: 'hospital',
        label: t('先去医院报到', 'Head to the hospital first'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'walk',
        label: t('沿着海滨步道走一圈', 'Walk the boardwalk first'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '永久居民申请递了出去，回执号码抄在冰箱的便利贴上。体检通知还要等 IRCC 寄来，可港口的雾、医院的早班和克洛伊的法语课，已经是你的日子了。',
    'The PR application is in, and the receipt number is on a sticky note on the fridge. The medical instructions will come from IRCC later, but the harbour fog, the early shifts and Chloé’s French lessons are already your life.',
  ),
  events: graduateEvents,
};

export const caCharacters = [citizen, graduate];
export const caProfiles = caCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
