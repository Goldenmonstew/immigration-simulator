import {
  australia2026_11,
  auRegionalParameters,
} from '@uk-immigration/policy-data';
import type { CountryResult } from '@uk-immigration/engine';
import { addDays, addMonths } from '../../calendar';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import type { AuEffect, AuFestival, AuTimeline } from './rules';

type AuCharacter = Character<AuTimeline, AuEffect, CountryResult, AuFestival>;
type AuEvent = GameEvent<AuEffect, AuFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const hongKongYears = australia2026_11.values.hongKongRegionalYears.value;

// Fictional individual facts below (dates, grant notices, passports, study),
// not policy thresholds. Both start with the medical and police checks still
// to do, so the town's clinic trip and post office matter.
const publicInterest: AuTimeline['publicInterest'] = {
  officialPassport: true,
  character: 'clear-history',
  health: 'no-known-condition',
  policeDocuments: 'outstanding',
  securityAndForeignPolicy: 'cleared',
  criticalTechnology: 'cleared',
  commonwealthDebt: 'none',
  valuesSigned: true,
  integrity: {
    identityEstablished: true,
    accurateDocuments: true,
    lastIdentityRefusal: null,
    lastDocumentRefusal: null,
  },
  returnBan5001: false,
  removedOn: null,
  sponsoredStudy: { applies: false },
  settlementWithoutUndueDifficulty: true,
  childInterestsSatisfied: true,
};
const onshore = {
  locationAtApplication: 'onshore',
  locationAtDecision: 'onshore',
  noFurtherStay: 'clear',
  visaCompliance: 'complied',
  fees: {
    additionalAdults: 0,
    additionalMinors: 0,
    pacificRegionalPassport: false,
  },
} as const;

export const nurseProfile: CharacterProfile = {
  id: 'nurse',
  name: t('玛丽塞尔·迪松', 'Maricel Dizon'),
  intro: t(
    '玛丽塞尔来自菲律宾宿务，2024 年 11 月持 491 偏远地区技术临时签证来到维多利亚州海边的金合欢湾，在镇医院当注册护士。她想走 191 拿永居。人物与事件均为虚构。',
    'Maricel from Cebu in the Philippines came to Wattle Bay, a seaside town in regional Victoria, in November 2024 on a Skilled Work Regional (Provisional) 491 visa. She is a registered nurse at the town hospital and hopes to reach permanent residence through the 191. All characters and events are fictional.',
  ),
  sprite: 'urban/priya.png',
};
export const graduateProfile: CharacterProfile = {
  id: 'graduate',
  name: t('刘嘉欣', 'Kayan Lau'),
  intro: t(
    '嘉欣来自香港，2022 年到金合欢湾的大学分校读生物医学，毕业后以主申请人身份拿到 485 毕业生签证，在镇医院的化验室工作。她打算走 191 香港偏远地区类别。人物与事件均为虚构。',
    'Kayan from Hong Kong came to the university campus at Wattle Bay in 2022 to study biomedical science. After graduating she was granted a 485 Temporary Graduate visa as the primary applicant and now works in the town hospital’s lab. She is aiming for the 191 Hong Kong (Regional) stream. All characters and events are fictional.',
  ),
  sprite: 'urban/hong-kong-bno.png',
};

const nurseEvents: AuEvent[] = [
  {
    id: 'nurse-night-shift',
    channel: 'morning',
    title: t('换个夜班？', 'Swap to nights?'),
    text: t(
      '护士长格蕾丝发消息：周末夜班缺人，夜班有加给，问你能不能顶一下。',
      'Grace, the nurse unit manager, texts: the weekend night shift is short. Nights pay a loading. Can you cover?',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'cover',
        label: t('顶上，顺便攒点钱', 'Cover it and save the extra'),
        effects: [
          { type: 'money', delta: 420 },
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'health', delta: -3 },
          { type: 'friendship', npc: 'grace', delta: 15 },
        ],
      },
      {
        id: 'rest',
        label: t('这周想睡个整觉', 'Sleep a full night this week'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'nurse-tax-time',
    channel: 'letter',
    title: t('报税季到了', 'Tax time'),
    text: t(
      '手机上 myGov 的提醒亮了：上一财年已经结束，可以报税了。评税通知一到，就是 191 要攒的那几份之一。',
      'A myGov reminder lights up: last financial year has ended and your return is ready to lodge. Each notice of assessment is one of the set the 191 asks for.',
    ),
    weight: 4,
    season: 4,
    choices: [
      {
        id: 'weekend',
        label: t('周末在家里报掉', 'Lodge it at home this weekend'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        note: t(
          `191 需要 ${auRegionalParameters.relevantAssessments.value} 个持合资格偏远地区签证期间已结束财年的评税通知（SRC-200 191.111、191.222）。在家里的书桌上可以报税。`,
          `The 191 needs notices of assessment for ${auRegionalParameters.relevantAssessments.value} completed income years while holding a qualifying regional visa (SRC-200 191.111, 191.222). Lodge from the desk at home.`,
        ),
      },
    ],
  },
  {
    id: 'nurse-family-call',
    channel: 'phone',
    title: t('宿务来的视频电话', 'A video call from Cebu'),
    text: t(
      '妈妈举着手机绕院子转了一圈：芒果熟了，表妹下个月结婚。「你那边冷不冷？」',
      'Mum carries the phone round the yard: the mangoes are ripe and your cousin marries next month. “Is it cold there?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'send',
        label: t('给婚礼寄点钱', 'Send some money for the wedding'),
        effects: [
          { type: 'money', delta: -300 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
      {
        id: 'chat',
        label: t(
          '聊一个小时，看大家抢话筒',
          'Talk for an hour as everyone grabs the phone',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'nurse-thank-you',
    channel: 'place:work',
    title: t('一张谢卡', 'A thank-you card'),
    text: t(
      '出院的老先生留下一张卡片，还有一罐自家做的柠檬酱：「谢谢你半夜陪我聊板球。」',
      'A patient going home leaves a card and a jar of homemade lemon butter. “Thanks for talking cricket with me at 3 a.m.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'keep',
        label: t('把卡片贴在储物柜里', 'Stick the card inside your locker'),
        effects: [
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'stat', key: 'career', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'nurse-city-offer',
    channel: 'letter',
    title: t('墨尔本来的招聘邮件', 'A job email from Melbourne'),
    text: t(
      '一家墨尔本市区医院的招聘顾问写信：薪水更高，下个月就能入职。',
      'A recruiter for a Melbourne city hospital writes: better pay, and you could start next month.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 1 }, { stat: 'career', min: 40 }],
    choices: [
      {
        id: 'stay',
        label: t('婉拒，金合欢湾挺好', 'Decline: Wattle Bay suits you'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'grace', delta: 20 },
        ],
        note: t(
          '491 持有人须在指定偏远地区居住、工作及学习（SRC-200 Sch 8 condition 8579）。这家医院不在指定地区，游戏里不能接受。',
          '491 holders must live, work and study in a designated regional area (SRC-200 Sch 8 condition 8579). This hospital is outside one, so the game does not offer it.',
        ),
      },
    ],
  },
  {
    id: 'nurse-sunday-lunch',
    channel: 'phone',
    title: t('周日聚餐', 'Sunday lunch'),
    text: t(
      '邻镇的菲律宾同乡会打来电话：周日烤全猪，带点什么来都行。',
      'The Filipino community in the next town calls: lechon on Sunday, bring anything you like.',
    ),
    weight: 2,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'go',
        label: t('烤一盘拉明顿蛋糕带去', 'Bake a tray of lamingtons to bring'),
        effects: [
          { type: 'money', delta: -15 },
          { type: 'stat', key: 'mood', delta: 7 },
        ],
      },
      {
        id: 'later',
        label: t('这次先不去，下次一定', 'Not this time; next one for sure'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
];

const graduateEvents: AuEvent[] = [
  {
    id: 'grad-late-samples',
    channel: 'place:work',
    title: t('晚到的样本', 'Late samples'),
    text: t(
      '最后一班救护车送来一箱样本。主管问你能不能多留一个小时把它们跑完。',
      'The last ambulance brings in a box of samples. Your supervisor asks if you can stay an hour to run them.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'stay',
        label: t('留下来，戴上耳机', 'Stay, earphones in'),
        effects: [
          { type: 'money', delta: 60 },
          { type: 'stat', key: 'career', delta: 3 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
      },
      {
        id: 'hand-over',
        label: t('交给夜班同事', 'Hand them to the night shift'),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
  {
    id: 'grad-home-call',
    channel: 'phone',
    title: t('香港来的电话', 'A call from Hong Kong'),
    text: t(
      '妈妈在那头扇着扇子：「这边三十四度。你那边冬天，有没有穿够衣服？」',
      'Mum fans herself on the screen. “Thirty-four degrees here. It’s winter there, are you dressed warmly?”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机给她看海湾', 'Show her the bay'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'recipe',
        label: t('问她要老火汤的做法', 'Ask for her slow-cooked soup recipe'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'grad-city-friends',
    channel: 'letter',
    title: t('同学的邀请', 'An invitation from uni friends'),
    text: t(
      '同届的朋友都搬去了墨尔本，合租的房子空出一间：「过来吧，周末去看球！」',
      'Your uni friends have all moved to Melbourne and a room in their share house is free. “Come over, we’ll go to the footy!”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'visit',
        label: t(
          '周末坐火车去玩，晚上回来',
          'Visit for a weekend, then come home',
        ),
        effects: [
          { type: 'money', delta: -80 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
        note: t(
          `191 香港偏远地区类别要求申请前连续 ${hongKongYears} 年只在指定地区居住、工作及学习（SRC-200 191.231(2)）。短途探访不是搬家。`,
          `The 191 Hong Kong (Regional) stream needs ${hongKongYears} years of living, working and studying only in designated regional areas before applying (SRC-200 191.231(2)). A weekend visit is not a move.`,
        ),
      },
      {
        id: 'stay',
        label: t('请他们夏天来海边玩', 'Invite them to the beach in summer'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'grad-milk-tea',
    channel: 'place:cafe',
    title: t('丝袜奶茶', 'Hong Kong milk tea'),
    text: t(
      '莱拉妮看你盯着菜单，笑着问：「你们那边的奶茶到底怎么做？教教我，我放上菜单。」',
      'Leilani catches you studying the menu. “How do you make your milk tea back home? Teach me and it goes on the board.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'teach',
        label: t(
          '借她的锅，撞茶七次',
          'Borrow a pot and pull the tea seven times',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'leilani', delta: 30 },
        ],
      },
    ],
  },
  {
    id: 'grad-wedding-invite',
    channel: 'letter',
    title: t('婚礼请柬', 'A wedding invitation'),
    text: t(
      '中学好友寄来请柬，婚礼在香港，下个月。',
      'Your best friend from secondary school sends an invitation: the wedding is in Hong Kong next month.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'video',
        label: t('录一段祝福视频寄过去', 'Record a video toast and send it'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        note: t(
          '香港类别离开澳洲后是否仍算通常居住，须由内政部个案判断（PD-108）；游戏里出境后这项会显示为待确认。',
          'Whether the Hong Kong streams still treat you as usually resident after leaving Australia is a case-by-case call (PD-108). In the game this check shows as unknown after a trip.',
        ),
      },
      {
        id: 'gift',
        label: t('网购一份礼物寄回去', 'Order a gift to be delivered'),
        effects: [
          { type: 'money', delta: -120 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'grad-course',
    channel: 'npc:sam',
    speaker: 'sam',
    title: t('采血短训班', 'A blood-collection course'),
    text: t(
      '奥卡福医生说诊所下个月办采血短训班：「学会了，周末来诊所帮忙也行。」',
      'Dr Okafor mentions a short blood-collection course at the clinic next month. “Once you’re trained, you could help out on Saturdays.”',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'career', min: 30 }],
    choices: [
      {
        id: 'enrol',
        label: t('报名', 'Sign up'),
        effects: [
          { type: 'money', delta: -150 },
          { type: 'stat', key: 'career', delta: 6 },
          { type: 'friendship', npc: 'sam', delta: 20 },
        ],
      },
      {
        id: 'later',
        label: t('等忙完这一阵', 'After this busy patch'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
];

const opening = (
  id: string,
  text: Text,
  choices: AuEvent['choices'],
): AuEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('金合欢湾的早晨', 'Morning in Wattle Bay'),
  text,
  weight: 0,
  once: true,
  choices,
});

const nurse: AuCharacter = {
  ...nurseProfile,
  startDate: '2026-03-01',
  stats: { money: 15_000, mood: 66, health: 72, english: 40, career: 34 },
  timeline: {
    pathway: 'AU-191',
    dateOfBirth: '1992-05-20',
    firstArrival: '2024-11-04',
    visas: [{ subclass: '491', from: '2024-11-04', to: '2029-11-03' }],
    trips: [],
    ...onshore,
    regional: {
      assessmentYears: [2025],
      regionalCondition: 'complied',
      changeNotice: 'complied',
      evidenceAndInterview: 'complied',
    },
    publicInterest,
  },
  opening: opening(
    'nurse',
    t(
      '海鸥在屋顶上吵。今天是在金合欢湾的第二个秋天的第一天，冰箱上贴着这周的排班表，还有一张写着「报税、体检、无犯罪证明」的便利贴。',
      'Gulls squabble on the roof. It’s the first day of your second autumn in Wattle Bay. The fridge holds this week’s roster and a sticky note: “tax, medical, police check”.',
    ),
    [
      {
        id: 'beach',
        label: t('上班前去海边走一圈', 'Walk the beach before work'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'plan',
        label: t('把便利贴抄进日历', 'Copy the sticky note into your calendar'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    'ImmiAccount 的页面跳出「已递交」。你关上电脑，窗外的海湾一片金色，明天的排班表上还是你的名字。',
    'ImmiAccount shows “Submitted”. You close the laptop. The bay outside has turned gold, and tomorrow’s roster still has your name on it.',
  ),
  events: nurseEvents,
};

const graduateVisaFrom = '2024-07-15';
const graduate: AuCharacter = {
  ...graduateProfile,
  startDate: '2026-03-01',
  stats: { money: 9_000, mood: 70, health: 74, english: 52, career: 24 },
  timeline: {
    pathway: 'AU-191-HK',
    dateOfBirth: '1999-10-02',
    firstArrival: '2022-02-14',
    visas: [
      { subclass: 'other-temporary', from: '2022-02-14', to: '2024-07-14' },
      {
        subclass: '485',
        from: graduateVisaFrom,
        // Hong Kong stream terms: the stay ends on this anniversary (SRC-062
        // Sch 1 item 1139(3A)(c)(ii)).
        to: addDays(
          addMonths(
            graduateVisaFrom,
            12 * australia2026_11.values.hongKongVisaYears.value,
          ),
          -1,
        ),
      },
    ],
    trips: [],
    ...onshore,
    hongKongPassport: true,
    hongKongPrimaryVisaTerms: true,
    english: {
      passport: 'other',
      education: {
        australianTertiaryYearsInEnglish: 2,
        completedAwardYearsInEnglish: 2,
      },
    },
    regional: {
      assessmentYears: [2023, 2024, 2025],
      hongKongOnlySince: '2022-02-14',
    },
    publicInterest,
  },
  opening: opening(
    'graduate',
    t(
      '合租屋的厨房飘着吐司味。毕业快两年了，窗台上那张学生证还没扔。今天休息，海风正好。',
      'The share-house kitchen smells of toast. It’s nearly two years since graduation, and your old student card still sits on the windowsill. Day off, and a perfect sea breeze.',
    ),
    [
      {
        id: 'jetty',
        label: t('去码头看看有没有人在钓鱼', 'See who’s fishing off the jetty'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'cafe',
        label: t('去咖啡馆来一杯 flat white', 'Grab a flat white at the café'),
        effects: [
          { type: 'money', delta: -5 },
          { type: 'stat', key: 'english', delta: 1 },
        ],
      },
    ],
  ),
  settlement: t(
    '递交键按下去的那一刻，你想起第一次坐火车来金合欢湾时，车窗外那一片金色的花。',
    'As you press submit, you remember your first train ride into Wattle Bay, and the gold blossom rushing past the window.',
  ),
  events: graduateEvents,
};

export const auCharacters = [nurse, graduate];
export const auProfiles = auCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
