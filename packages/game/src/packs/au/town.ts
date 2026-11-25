import {
  auPublicCriteria,
  auRegionalParameters,
} from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { auBalance as b } from './balance';
import type { AuEffect, AuFestival } from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const aud = (value: number) => `$${value.toLocaleString('en-AU')}`;
const police = auPublicCriteria.policeGuidance.value;

/**
 * Wattle Bay, a fictional seaside town in regional Victoria. Place IDs follow
 * the shared game shell: `visa` handles visa lodgements, `council` shows the
 * assessment, `green` hosts festivals, `pond` is for fishing and `allotment`
 * for plots.
 */
export const auPlaces: Place[] = [
  { id: 'home', name: t('木板屋', 'Weatherboard house'), kind: 'building' },
  {
    id: 'work',
    name: t('金合欢湾医院', 'Wattle Bay Hospital'),
    kind: 'building',
    hours: { opens: 480, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('邻里之家', 'Neighbourhood House'),
    kind: 'building',
    hours: { opens: 540, closes: 1260 },
  },
  {
    id: 'library',
    name: t('镇图书馆', 'Town library'),
    kind: 'building',
    hours: { opens: 540, closes: 1140 },
  },
  {
    id: 'gp',
    name: t('海湾全科诊所', 'Bayside GP clinic'),
    kind: 'building',
    hours: { opens: 480, closes: 1080, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('鹈鹕酒店', 'The Pelican Hotel'),
    kind: 'building',
    hours: { opens: 660, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('盐角咖啡馆', 'Saltbush Café'),
    kind: 'building',
    // Country cafés close mid-afternoon.
    hours: { opens: 420, closes: 900 },
  },
  {
    id: 'shop',
    name: t('街角牛奶吧', 'Corner milk bar'),
    kind: 'building',
    hours: { opens: 450, closes: 1260 },
  },
  {
    id: 'council',
    name: t('移民代理', 'Migration agent'),
    kind: 'building',
    hours: { opens: 540, closes: 1020, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'visa',
    name: t('政府服务中心', 'Government service centre'),
    kind: 'building',
    hours: { opens: 510, closes: 1020, dayKinds: ['workday'] },
  },
  {
    id: 'post',
    name: t('邮局', 'Post office'),
    kind: 'building',
    hours: { opens: 540, closes: 1020, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('金合欢湾站', 'Wattle Bay Station'),
    kind: 'building',
    hours: { opens: 300, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench', 'beach'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('社区菜园', 'Community garden'),
        t('码头', 'The jetty'),
        t('社区公告板', 'Community noticeboard'),
        t('海滨草坪', 'The foreshore'),
        t('瞭望长椅', 'Lookout bench'),
        t('巡逻海滩', 'Patrolled beach'),
      ][i],
    }),
  ),
];

// Planting seasons follow a southern calendar: quarter 1 is summer.
const crops: [string, string, string, Quarter[]][] = [
  ['tomato', '番茄', 'Tomato', [4, 1]],
  ['cucumber', '黄瓜', 'Cucumber', [1]],
  ['corn', '玉米', 'Sweetcorn', [1]],
  ['strawberry', '草莓', 'Strawberry', [4, 1]],
  ['potato', '土豆', 'Potato', [2, 3, 4]],
  ['turnip', '芜菁', 'Turnip', [2, 3]],
];

export const auFish = [
  ['whiting', '乔治王鳕鱼', 'King George whiting'],
  ['flathead', '鲬鱼', 'Flathead'],
  ['snapper', '真鲷', 'Snapper'],
  ['bream', '黑鲷', 'Black bream'],
] as const;

export const auItems: Item[] = [
  ...crops.flatMap(([id, zhCN, en, seasons]): Item[] => [
    {
      id,
      name: { zhCN, en },
      kind: 'crop',
      edible: { mood: b.food.cropMood, health: b.food.cropHealth },
    },
    {
      id: `seed-${id}`,
      name: { zhCN: `${zhCN}种子`, en: `${en} seeds` },
      kind: 'seed',
      price: b.prices.seed,
      grows: { crop: id, days: b.cropDays, seasons },
    },
  ]),
  ...auFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  { id: 'old-boot', name: t('一只旧胶靴', 'An old gumboot'), kind: 'junk' },
  {
    id: 'shopping-trolley',
    name: t('一辆超市手推车', 'A shopping trolley'),
    kind: 'junk',
  },
  {
    id: 'flat-white',
    name: t('外带 flat white', 'Takeaway flat white'),
    kind: 'food',
    price: b.prices.flatWhite,
    edible: { mood: b.food.coffeeMood },
  },
  {
    id: 'lamington',
    name: t('拉明顿蛋糕', 'Lamington'),
    kind: 'food',
    price: b.prices.lamington,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'pavlova',
    name: t('帕夫洛娃蛋白饼', 'Pavlova'),
    kind: 'gift',
    price: b.prices.pavlova,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'wattle',
    name: t('一束金合欢', 'A bunch of wattle'),
    kind: 'gift',
    price: b.prices.wattle,
  },
  {
    id: 'native-seedling',
    name: t('本土植物树苗', 'Native seedling'),
    kind: 'gift',
  },
  ...(
    [
      ['sausage-sizzle', '香肠面包', 'Sausage sizzle'],
      ['anzac-biscuit', '澳新军团饼干', 'Anzac biscuit'],
      ['meat-pie', '肉派', 'Meat pie'],
      ['scone', '果酱奶油司康', 'Jam and cream scone'],
    ] as const
  ).map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'food',
    price: b.prices.festival,
    edible: { mood: b.food.mealMood, health: 1 },
  })),
  ...(
    [
      ['flathead-and-chips', '鲬鱼薯条', 'Flathead and chips'],
      ['roast-spuds', '烤土豆', 'Roast spuds'],
      ['bbq-corn', '烧烤玉米', 'Barbecued corn'],
      ['winter-veg-soup', '冬日蔬菜汤', 'Winter vegetable soup'],
      ['scone-jam', '司康用草莓酱', 'Strawberry jam for scones'],
      ['summer-salad', '番茄黄瓜沙拉', 'Tomato and cucumber salad'],
    ] as const
  ).map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'food',
    edible: { mood: b.food.mealMood, health: b.food.mealHealth },
  })),
];

const recipe = (
  id: string,
  zhCN: string,
  en: string,
  needs: Record<string, number>,
): Recipe => ({
  id,
  label: { zhCN, en },
  needs,
  makes: id,
  minutes: b.recipeMinutes,
});
export const auRecipes: Recipe[] = [
  recipe('flathead-and-chips', '炸鲬鱼配薯条', 'Fry flathead and chips', {
    flathead: 1,
    potato: 1,
  }),
  recipe('roast-spuds', '烤一盘土豆', 'Roast a tray of spuds', { potato: 1 }),
  recipe('bbq-corn', '在烤架上烤玉米', 'Barbecue the corn', { corn: 1 }),
  recipe('winter-veg-soup', '煮一锅冬日蔬菜汤', 'Make winter vegetable soup', {
    turnip: 1,
  }),
  recipe('scone-jam', '熬司康用的草莓酱', 'Make strawberry jam for scones', {
    strawberry: 2,
  }),
  recipe('summer-salad', '拌番茄黄瓜沙拉', 'Toss a tomato and cucumber salad', {
    tomato: 1,
    cucumber: 1,
  }),
];

// Customary dates and town settings, not policy: Australia Day on 26
// January, Anzac Day on 25 April; the town's footy grand final and
// agricultural show are fictional fixtures (see hooks.festivalDate).
export const auFestivals: Festival<AuFestival>[] = [
  {
    id: 'australia-day',
    season: 1,
    name: t('澳大利亚日海滨早餐', 'Australia Day on the foreshore'),
    text: t(
      '草坪上搭起凉棚。一位原住民长老致欢迎辞后，镇长为新公民颁发证书，每人领到一棵本土树苗。接着是香肠面包和沙滩板球。',
      'Gazebos go up on the lawn. After an Aboriginal elder’s Welcome to Country, the mayor presents certificates to new citizens, each with a native seedling. Then come the sausage sizzle and beach cricket.',
    ),
  },
  {
    id: 'anzac-day',
    season: 2,
    name: t('澳新军团日纪念', 'Anzac Day service'),
    text: t(
      '清晨，镇上的人聚在海边纪念碑前。号声响起，大家静默一分钟。之后会馆里有热茶和澳新军团饼干。',
      'Early morning, the town gathers at the memorial by the sea. The bugle sounds and everyone keeps a minute’s silence. Afterwards there is tea and Anzac biscuits in the hall.',
    ),
  },
  {
    id: 'footy-final',
    season: 3,
    name: t('海鸥队总决赛', 'Gulls grand final'),
    text: t(
      '镇足球俱乐部海鸥队打进了联赛总决赛。看台上全是黑白围巾，肉派的热气混着冬天的海风。',
      'The Wattle Bay Gulls have made the league grand final. The stand is a sea of black-and-white scarves, and meat-pie steam drifts into the winter wind.',
    ),
  },
  {
    id: 'show-day',
    season: 4,
    name: t('金合欢湾农业展', 'Wattle Bay Show'),
    text: t(
      '春天的农业展：南瓜评比、伐木比赛、牧羊犬表演。司康饼摊前排着长队，摩天轮一直转到天黑。',
      'The spring show: giant pumpkins, wood-chopping, sheepdog trials. The scone stall has a long queue, and the Ferris wheel turns until dark.',
    ),
  },
];
export const festivalFoods: Record<AuFestival, string> = {
  'australia-day': 'sausage-sizzle',
  'anzac-day': 'anzac-biscuit',
  'footy-final': 'meat-pie',
  'show-day': 'scone',
};

export const auNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'bins',
    text: t(
      '周四晚上把垃圾桶推到路边：红盖每周收，黄盖回收和绿盖花园垃圾隔周轮换。',
      'Bins out Thursday night: red lids every week, yellow recycling and green garden bins on alternate weeks.',
    ),
  },
  {
    id: 'working-bee',
    text: t(
      '社区菜园周六上午义务劳动，自带手套，结束后有烤香肠。',
      'Community garden working bee on Saturday morning. Bring gloves; sausages afterwards.',
    ),
  },
  {
    id: 'conversation',
    text: t(
      '邻里之家每周有英语聊天小组，金币捐款随意，新来的邻居都欢迎。',
      'The Neighbourhood House runs a weekly English conversation group. Gold-coin donation; newcomers welcome.',
    ),
  },
  {
    id: 'swim-flags',
    season: 1,
    text: t(
      '夏天请在红黄旗之间游泳，救生员周末巡逻。',
      'Swim between the red and yellow flags this summer. Lifesavers patrol at weekends.',
    ),
  },
  {
    id: 'fire-danger',
    season: 1,
    text: t(
      '火险季：留意每天的火险等级，全面禁火日不能在户外生火。',
      'Fire season: check the daily fire danger rating. No outdoor fires on total fire ban days.',
    ),
  },
  {
    id: 'magpies',
    season: 4,
    text: t(
      '喜鹊筑巢季：公园小路有喜鹊护巢，骑车请戴好头盔、绕道而行。',
      'Magpie season: nesting birds swoop on the park path. Cyclists, wear helmets and take the long way.',
    ),
  },
  {
    id: 'show-entries',
    season: 4,
    text: t(
      '农业展报名开始：蔬菜、果酱、司康饼组欢迎参加。',
      'Show entries now open: vegetables, jams and scones welcome.',
    ),
  },
];

/** The shared furniture, as the milk bar sells it. */
export const auFurnishingNames: Record<string, Text> = {
  'reading-chair': t('藤编扶手椅', 'Cane armchair'),
  'warm-curtains': t('遮光窗帘', 'Block-out curtains'),
  'desk-lamp': t('台灯', 'Desk lamp'),
};

export const auActions: Activity<AuEffect, AuFestival>[] = [
  {
    id: 'rest',
    place: 'home',
    label: t('休息', 'Rest'),
    minutes: b.minutes.rest,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.restMood },
      { type: 'stat', key: 'health', delta: b.restHealth },
    ],
  },
  {
    id: 'nap',
    place: 'home',
    label: t('午睡', 'Take a nap'),
    minutes: b.minutes.nap,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.napMood },
      { type: 'stat', key: 'health', delta: b.napHealth },
    ],
  },
  ...(['home', 'library'] as const).map(
    (place): Activity<AuEffect, AuFestival> => ({
      id: `study-${place}`,
      place,
      label: t('看本地剧练口语', 'Watch local shows for the slang'),
      minutes: b.minutes.study,
      oncePerDay: true,
      effects: [{ type: 'stat', key: 'english', delta: b.studyEnglish }],
    }),
  ),
  {
    id: 'tax-return',
    place: 'home',
    label: t('在 myGov 报税', 'Lodge your tax return on myGov'),
    note: t(
      `财年结束后可报上一财年的税，评税通知记入问卷。191 需要 ${auRegionalParameters.relevantAssessments.value} 个持合资格偏远地区签证期间已结束财年的评税通知（SRC-200 191.111、191.222）。退税金额是游戏设定。`,
      `Once a financial year ends you can lodge for it; the notice of assessment goes into your answers. The 191 needs notices for ${auRegionalParameters.relevantAssessments.value} completed income years while holding a qualifying regional visa (SRC-200 191.111, 191.222). The refund is a game setting.`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'money', delta: b.taxRefund }, { type: 'taxReturn' }],
  },
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到看得见海的木板屋（押金 ${aud(b.housingDeposit)}、搬家 ${aud(b.housingMoveCost)}，每季加租 ${aud(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a weatherboard with a sea view (${aud(b.housingDeposit)} bond, ${aud(b.housingMoveCost)} moving, +${aud(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the bond)`,
    ),
    note: t(
      `491 持有人搬家后须在 ${auRegionalParameters.changeNoticeDays.value} 天内通知内政部（SRC-200 Sch 8 condition 8578）。游戏把在线通知算进搬家手续里，新住处仍在金合欢湾。`,
      `491 holders must tell Home Affairs about a new address within ${auRegionalParameters.changeNoticeDays.value} days (SRC-200 Sch 8 condition 8578). The game includes that online notice in the move, and the new place is still in Wattle Bay.`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'money', delta: -b.housingDeposit - b.housingMoveCost }],
  },
  {
    id: 'leave-brighter-home',
    place: 'home',
    label: t(
      '退租海景木板屋，拿回押金',
      'Leave the sea-view weatherboard and recover the bond',
    ),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'brighter-home' }],
    effects: [{ type: 'money', delta: b.housingDeposit }],
  },
  {
    id: 'work',
    place: 'work',
    label: t('上班', 'Go to work'),
    minutes: b.minutes.work,
    oncePerDay: true,
    when: [{ dayKind: 'workday' }],
    effects: [
      { type: 'money', delta: b.workMoney },
      { type: 'stat', key: 'career', delta: b.workCareer },
    ],
  },
  {
    id: 'overtime',
    place: 'work',
    label: t('加一个班', 'Pick up an extra shift'),
    minutes: b.minutes.overtime,
    oncePerDay: true,
    when: [{ dayKind: 'workday' }, { minuteMin: 1020 }],
    effects: [
      { type: 'money', delta: b.overtimeMoney },
      { type: 'stat', key: 'career', delta: b.overtimeCareer },
      { type: 'stat', key: 'mood', delta: b.overtimeMood },
      { type: 'stat', key: 'health', delta: b.overtimeHealth },
    ],
  },
  {
    id: 'class',
    place: 'college',
    label: t(
      '去英语聊天小组（金币捐款）',
      'Join the English conversation group (gold-coin donation)',
    ),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'english', delta: b.classEnglish },
    ],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t('看全科医生', 'See the GP'),
    minutes: b.minutes.gp,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.gpCost },
      { type: 'stat', key: 'health', delta: b.gpHealth },
    ],
  },
  {
    id: 'relax',
    place: 'pub',
    label: t('来一份帕玛鸡排和一杯啤酒', 'A chicken parma and a pot'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.relaxCost },
      { type: 'stat', key: 'mood', delta: b.relaxMood },
    ],
  },
  {
    id: 'coffee',
    place: 'cafe',
    label: t('来一杯 flat white', 'Have a flat white'),
    minutes: b.minutes.coffee,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.coffeeCost },
      { type: 'stat', key: 'mood', delta: b.coffeeMood },
    ],
  },
  ...[
    ['reading-chair', '每季心情、健康各加一点', '+1 mood and health/quarter'],
    ['warm-curtains', '每季心情加一点', '+1 mood/quarter'],
    ['desk-lamp', '每季健康加一点', '+1 health/quarter'],
  ].map(([id, zhCN, en]): Activity<AuEffect, AuFestival> => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${auFurnishingNames[id].zhCN}（${zhCN}） · ${aud(b.furnishings[id].price)}，限一件`,
      `Buy a ${auFurnishingNames[id].en} (${en}) · ${aud(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t('请移民代理看看评估', 'Ask the migration agent for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'police-check',
    place: 'post',
    label: t(
      '在邮局核验身份，申请无犯罪证明',
      'Verify your identity and apply for police certificates',
    ),
    note: t(
      `超过 ${police.overAge} 岁、过去 ${police.years} 年在某个国家累计住满 ${police.months} 个月的人，通常要提供当地的无犯罪证明（SRC-220）。游戏里证明不收费，只花时间。`,
      `Police certificates are usually requested for people over ${police.overAge} who spent ${police.months} months or more in a country in the past ${police.years} years (SRC-220). In this game the certificates are free and only take time.`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'police' }],
  },
  {
    id: 'health-exam',
    place: 'station',
    label: t(
      '坐火车去墨尔本做移民体检',
      'Take the train to Melbourne for the visa medical',
    ),
    note: t(
      '游戏把体检结果记为满足健康要求（SRC-200 Sch 4、SRC-218、SRC-219）。体检费用不计。',
      'The game records the result as meeting the health requirement (SRC-200 Sch 4, SRC-218, SRC-219). The examination fee is not counted.',
    ),
    minutes: b.minutes.paperwork * 5,
    when: [{ dayKind: 'workday' }],
    effects: [{ type: 'health' }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t(
      '在 ImmiAccount 递交 191 永居申请',
      'Lodge your 191 application in ImmiAccount',
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  ...([1, 3, 6] as const).map((months): Activity<AuEffect, AuFestival> => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回家探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: t(
      '回来后要赶得上签证到期前的一个工作日（政府服务中心只在工作日开门），赶不上的行程不提供。',
      'You must be back in time for a workday before your current visa ends (the service centre opens only on workdays); trips that would miss it are not offered.',
    ),
    minutes: 0,
    effects: [
      { type: 'money', delta: -b.travelCostPerMonth * months },
      { type: 'stat', key: 'mood', delta: b.travelMood },
    ],
  })),
  {
    id: 'leave',
    place: 'station',
    label: t('离开澳大利亚', 'Leave Australia'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('租一块社区菜园', 'Rent a community garden plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看社区公告板', 'Read the community noticeboard'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐着看海湾', 'Sit and watch the bay'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季海滨晨跑团（${aud(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s foreshore running club (${aud(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'swim',
    place: 'beach',
    label: t('在红黄旗之间游个泳', 'Swim between the flags'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.benchMood },
      { type: 'stat', key: 'health', delta: b.swimHealth },
    ],
  },
  {
    id: 'free-bbq',
    place: 'green',
    label: t(
      '用草坪上的公共烧烤台烤香肠',
      'Cook sausages on the free public barbecue',
    ),
    minutes: b.minutes.relax,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.prices.festival },
      { type: 'stat', key: 'mood', delta: b.relaxMood },
    ],
  },
  {
    id: 'festival',
    place: 'green',
    label: t('逛节日摊位', 'Wander the festival stalls'),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ dayKind: 'special' }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  },
  ...(
    [
      [
        'australia-day',
        'beach-cricket',
        '在草坪上打一局沙滩板球',
        'Play a round of beach cricket',
        b.festivalStart,
      ],
      [
        'anzac-day',
        'anzac-rosemary',
        '在纪念碑前放一枝迷迭香',
        'Lay a sprig of rosemary at the memorial',
        b.anzacStart,
      ],
      [
        'footy-final',
        'kick-to-kick',
        '中场休息时下场踢球',
        'Join the half-time kick-to-kick',
        b.footyStart,
      ],
      [
        'show-day',
        'show-produce',
        '把菜园里最好的菜送去评比',
        'Enter your best vegetable in the produce judging',
        b.festivalStart,
      ],
    ] as const
  ).map(([festival, id, zhCN, en, start]): Activity<AuEffect, AuFestival> => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ festival }, { minuteMin: start }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
