import { canadaFull2026_11 } from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { caBalance as b } from './balance';
import {
  aipFee,
  citizenshipFee,
  type CaEffect,
  type CaFestival,
} from './rules';

type CaActivity = Activity<CaEffect, CaFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
export const cad = (value: number) =>
  `CA$${Math.round(value).toLocaleString('en-CA')}`;
const v = canadaFull2026_11.values;
const police = v.federalPolice.value;
const citizen = { route: 'CA-RESIDENCY' };
const atlantic = { route: 'CA-AIP' };

/**
 * Maple Harbour, a fictional neighbourhood on Halifax harbour. Place IDs
 * follow the shared game shell: `visa` is the IRCC office, `council` shows
 * the assessment, `green` hosts festivals, `pond` is the fishing wharf and
 * `allotment` the community garden.
 */
export const caPlaces: Place[] = [
  { id: 'home', name: t('彩色排屋公寓', 'Row-house flat'), kind: 'building' },
  {
    id: 'work',
    name: t('港湾医院', 'Harbour Hospital'),
    kind: 'building',
    hours: { opens: 540, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('枫港社区学院', 'Maple Harbour Community College'),
    kind: 'building',
    hours: { opens: 600, closes: 1260 },
  },
  {
    id: 'library',
    name: t('公共图书馆', 'Public library'),
    kind: 'building',
    hours: { opens: 540, closes: 1140 },
  },
  {
    id: 'gp',
    name: t('家庭诊所', 'Family clinic'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('咸海鸥酒馆', 'The Salty Gull'),
    kind: 'building',
    hours: { opens: 1020, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('晨潮咖啡', 'Morning Tide Café'),
    kind: 'building',
    hours: { opens: 420, closes: 1080 },
  },
  {
    id: 'shop',
    name: t('海港杂货铺', 'Harbour general store'),
    kind: 'building',
    hours: { opens: 480, closes: 1320 },
  },
  {
    id: 'council',
    name: t('移民顾问事务所', 'Immigration consultant'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'newcomer',
    name: t('安家服务中心', 'Newcomer centre'),
    kind: 'building',
    hours: { opens: 510, closes: 1020, dayKinds: ['workday'] },
  },
  {
    id: 'visa',
    name: t('IRCC 办公室', 'IRCC office'),
    kind: 'building',
    hours: { opens: 540, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('渡轮码头', 'Ferry terminal'),
    kind: 'building',
    hours: { opens: 360, closes: 1440 },
  },
  {
    id: 'market',
    name: t('海港农夫市集', 'Seaport farmers’ market'),
    kind: 'outdoor',
    hours: { opens: 480, closes: 780, dayKinds: ['weekend', 'special'] },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('社区菜园', 'Community garden'),
        t('钓鱼码头', 'Fishing wharf'),
        t('社区告示板', 'Community board'),
        t('海滨广场', 'Waterfront green'),
        t('海滨长椅', 'Boardwalk chairs'),
      ][i],
    }),
  ),
];

// Nova Scotia gardens rest under snow in winter.
const crops: [string, string, string, Quarter[]][] = [
  ['potato', '土豆', 'Potato', [2]],
  ['turnip', '芜菁', 'Turnip', [2, 4]],
  ['strawberry', '草莓', 'Strawberry', [2, 3]],
  ['tomato', '番茄', 'Tomato', [3]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['corn', '甜玉米', 'Sweetcorn', [3]],
];

export const caFish = [
  ['mackerel', '鲭鱼', 'Atlantic mackerel'],
  ['pollock', '青鳕', 'Pollock'],
  ['flounder', '比目鱼', 'Flounder'],
  ['striped-bass', '条纹鲈', 'Striped bass'],
] as const;

export const caItems: Item[] = [
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
  ...caFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  { id: 'old-boot', name: t('旧橡胶靴', 'Old rubber boot'), kind: 'junk' },
  {
    id: 'shopping-trolley',
    name: t('生锈的龙虾笼', 'Rusty lobster trap'),
    kind: 'junk',
  },
  {
    id: 'double-double',
    name: t('双糖双奶咖啡', 'Double-double coffee'),
    kind: 'food',
    price: b.prices.coffee,
    edible: { mood: b.food.drinkMood },
  },
  {
    id: 'maple-doughnut',
    name: t('枫糖甜甜圈', 'Maple doughnut'),
    kind: 'food',
    price: b.prices.doughnut,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'oatcakes',
    name: t('燕麦饼', 'Oatcakes'),
    kind: 'food',
    price: b.prices.oatcakes,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'blueberries',
    name: t('野生蓝莓', 'Wild blueberries'),
    kind: 'food',
    price: b.prices.blueberries,
    edible: { mood: b.food.cropMood, health: b.food.cropHealth },
  },
  {
    id: 'maple-syrup',
    name: t('一罐枫糖浆', 'A tin of maple syrup'),
    kind: 'gift',
    price: b.prices.mapleSyrup,
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  ...(
    [
      ['maple-taffy', '雪上枫糖太妃', 'Maple taffy on snow'],
      ['lobster-roll', '龙虾卷', 'Lobster roll'],
      ['nanaimo-bar', '纳奈莫条', 'Nanaimo bar'],
      ['pumpkin-pie', '南瓜派', 'Pumpkin pie'],
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
      ['poutine', '自制 poutine', 'Home-made poutine'],
      ['fish-cakes', '鱼饼', 'Fish cakes'],
      ['chowder', '海鲜玉米浓汤', 'Seafood corn chowder'],
      ['corn-boil', '水煮甜玉米', 'Corn boil'],
      ['strawberry-jam', '草莓酱', 'Strawberry jam'],
      ['garden-salad', '番茄黄瓜沙拉', 'Garden salad'],
      ['turnip-mash', '黄油芜菁泥', 'Buttered turnip mash'],
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
export const caRecipes: Recipe[] = [
  recipe('poutine', '做一盘 poutine', 'Make poutine', { potato: 2 }),
  recipe('fish-cakes', '煎鱼饼', 'Fry fish cakes', { pollock: 1, potato: 1 }),
  recipe('chowder', '煮海鲜玉米浓汤', 'Simmer a corn chowder', {
    flounder: 1,
    corn: 1,
  }),
  recipe('corn-boil', '煮一锅甜玉米', 'Hold a corn boil', { corn: 1 }),
  recipe('strawberry-jam', '熬草莓酱', 'Make strawberry jam', {
    strawberry: 2,
  }),
  recipe('garden-salad', '拌番茄黄瓜沙拉', 'Toss a garden salad', {
    tomato: 1,
    cucumber: 1,
  }),
  recipe('turnip-mash', '做黄油芜菁泥', 'Mash turnip with butter', {
    turnip: 1,
  }),
];

// Customary dates, not policy: Nova Scotia's Heritage Day on the third
// Monday of February, Victoria Day on the Monday before 25 May, Canada Day
// on 1 July and Thanksgiving on the second Monday of October.
export const caFestivals: Festival<CaFestival>[] = [
  {
    id: 'heritage-day',
    season: 1,
    name: t('传统日冰上会', 'Heritage Day on ice'),
    text: t(
      '海滨广场浇成了一片冰场。有人拉小提琴，有人在雪槽里浇枫糖浆，用木棍一卷就是一根太妃。',
      'The waterfront green is flooded into a rink. A fiddler plays while hot maple syrup is poured on a trough of snow and rolled onto sticks.',
    ),
  },
  {
    id: 'victoria-day',
    season: 2,
    name: t('维多利亚日风筝会', 'Victoria Day kite fair'),
    text: t(
      '长周末的第一天，广场上飘满风筝。龙虾季的最后几周，摊位上的龙虾卷排起了队。',
      'On the long weekend the green fills with kites. Late in lobster season, the lobster-roll stall has a queue.',
    ),
  },
  {
    id: 'canada-day',
    season: 3,
    name: t('加拿大日', 'Canada Day'),
    text: t(
      '红白彩旗挂满了码头。孩子们脸上画着枫叶，入夜后港口上空会放烟花。',
      'Red and white bunting lines the wharf. Children have maple leaves painted on their cheeks, and fireworks light the harbour after dark.',
    ),
  },
  {
    id: 'thanksgiving',
    season: 4,
    name: t('感恩节百家宴', 'Thanksgiving potluck'),
    text: t(
      '广场上摆了一张长桌，南瓜和干草垛围成一圈。每家带一道菜，多琳在分南瓜派。',
      'A long table runs across the green, ringed by pumpkins and hay bales. Everyone brings a dish; Doreen is cutting pumpkin pie.',
    ),
  },
];
export const festivalFoods: Record<CaFestival, string> = {
  'heritage-day': 'maple-taffy',
  'victoria-day': 'lobster-roll',
  'canada-day': 'nanaimo-bar',
  thanksgiving: 'pumpkin-pie',
};

export const caNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'sorting',
    text: t(
      '垃圾分类：绿桶装厨余，蓝袋装可回收，其余用透明袋，收集日早上放到路边。',
      'Sorting: food scraps in the green cart, recyclables in blue bags, the rest in clear bags. Out at the curb on collection morning.',
    ),
  },
  {
    id: 'circle',
    text: t(
      '安家服务中心英语角：工作日中午，带上咖啡和问题，新邻居都欢迎。',
      'Newcomer centre conversation circle: weekday lunchtimes. Bring a coffee and your questions; new neighbours welcome.',
    ),
  },
  {
    id: 'library',
    text: t(
      '图书馆可以借雪鞋、尤克里里和钓竿，凭借书证免费。',
      'The library lends snowshoes, ukuleles and fishing rods, free with a library card.',
    ),
  },
  {
    id: 'kitchen-party',
    text: t(
      '咸海鸥周末晚上有厨房派对：小提琴、吉他，欢迎跟着跺脚。',
      'Kitchen party at the Salty Gull on weekend nights: fiddle, guitar and plenty of foot-stomping.',
    ),
  },
  {
    id: 'skating',
    season: 1,
    text: t(
      '海滨冰场开放：冰鞋可在码头小屋租借，天黑后亮灯。',
      'The waterfront rink is open: skates for hire at the wharf hut, lights on after dark.',
    ),
  },
  {
    id: 'cleanup',
    season: 2,
    text: t(
      '春季海岸清洁日：周末上午在钓鱼码头集合，结束后有热巧克力。',
      'Spring shoreline clean-up: meet at the fishing wharf on the weekend morning. Hot chocolate after.',
    ),
  },
  {
    id: 'canada-day',
    season: 3,
    text: t(
      '加拿大日：上午广场活动，晚上港口烟花。请把狗狗留在家里。',
      'Canada Day: activities on the green by day, fireworks over the harbour at night. Please leave dogs at home.',
    ),
  },
  {
    id: 'storm',
    season: 4,
    text: t(
      '秋季风暴季：备好手电和电池，阳台上的花盆收进屋。',
      'Autumn storm season: keep a flashlight and batteries handy, and bring balcony pots inside.',
    ),
  },
];

const travelNote = t(
  `出境的日子不算入籍的实际居住天数（SRC-074 s.5(1)(c)(i)）；工作许可或 PR 卡要在回来那天仍然有效。行程会持续到回来之后的第一个季度开头：持工作许可时，赶不上许可到期前最后一个可以递交大西洋项目申请的工作日的行程不提供；整个春季在外会错过当年的免费报税诊所。`,
  `Days abroad do not count as physical presence for citizenship (SRC-074 s.5(1)(c)(i)). Your work permit or PR card must still be valid on the day you return. A trip lasts until the first quarter that starts after you are back: on a work permit, trips that would miss the last workday to file the Atlantic application before the permit ends are not offered, and a spring spent away misses that year’s free tax clinic.`,
);

/** The shared furniture, as the Maple Harbour shop sells it. */
export const caFurnishingNames: Record<string, Text> = {
  'reading-chair': t('马斯科卡木椅', 'Muskoka chair'),
  'warm-curtains': t('保暖窗帘', 'Thermal curtains'),
  'desk-lamp': t('台灯', 'Desk lamp'),
};

export const caActions: CaActivity[] = [
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
  ...(['home', 'library'] as const).map((place): CaActivity => ({
    id: `study-${place}`,
    place,
    label: t('练英语听力', 'Practise English listening'),
    minutes: b.minutes.study,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'english', delta: b.studyEnglish }],
  })),
  ...(['home', 'library'] as const).map((place): CaActivity => ({
    id: place === 'home' ? 'civics-home' : 'civics',
    place,
    label: t('读《发现加拿大》', 'Read Discover Canada'),
    note: t(
      `入籍考试共 ${v.citTestFormat.value.questions} 题，答对 ${v.citTestFormat.value.correct} 题通过（SRC-263）。`,
      `The citizenship test has ${v.citTestFormat.value.questions} questions; ${v.citTestFormat.value.correct} correct answers pass (SRC-263).`,
    ),
    minutes: b.minutes.study,
    oncePerDay: true,
    when: [citizen],
    effects: [{ type: 'stat', key: 'civics', delta: b.civicsStudy }],
  })),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到看得见港口的公寓（押金 ${cad(b.housingDeposit)}、搬家 ${cad(b.housingMoveCost)}，每季加租 ${cad(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a harbour-view flat (${cad(b.housingDeposit)} deposit, ${cad(b.housingMoveCost)} moving, +${cad(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the deposit)`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'money', delta: -b.housingDeposit - b.housingMoveCost }],
  },
  {
    id: 'leave-brighter-home',
    place: 'home',
    label: t(
      '退租港景公寓，退回押金',
      'Leave the harbour-view flat and recover the deposit',
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
    label: t('加一个晚班', 'Pick up an evening shift'),
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
    id: 'permanent-post',
    place: 'work',
    label: t(
      '问人事部能否转成长期全职',
      'Ask HR about a permanent full-time post',
    ),
    note: t(
      `医院是大西洋项目的指定雇主。游戏里事业达到 ${b.offerCareer} 后，人事部会给出长期全职聘书（SRC-270 aip-job）。`,
      `The hospital is a designated Atlantic employer. Once your in-game career reaches ${b.offerCareer}, HR offers a permanent full-time post (SRC-270 aip-job).`,
    ),
    minutes: b.minutes.paperwork,
    when: [atlantic, { stat: 'career', min: b.offerCareer }],
    effects: [{ type: 'jobOffer' }],
  },
  {
    id: 'endorsement-request',
    place: 'work',
    label: t(
      '请人事部向省里申请担保（endorsement）',
      'Ask HR to apply for the provincial endorsement',
    ),
    note: t(
      '聘书和安家计划都交给雇主后，由雇主向新斯科舍省申请。担保信会在下一季寄到（SRC-270 aip-settlement）。',
      'With the offer and settlement plan in hand, the employer applies to Nova Scotia. The endorsement arrives by post next quarter (SRC-270 aip-settlement).',
    ),
    minutes: b.minutes.paperwork,
    when: [atlantic, { flag: 'job-offer' }, { flag: 'settlement-plan' }],
    effects: [{ type: 'none' }],
  },
  {
    id: 'class',
    place: 'college',
    label: t('上英语晚课', 'Join the evening English class'),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'english', delta: b.classEnglish },
    ],
  },
  {
    id: 'exam',
    place: 'college',
    label: t('参加 CELPIP 英语考试', 'Sit the CELPIP English test'),
    minutes: b.minutes.exam,
    oncePerDay: true,
    when: [atlantic],
    effects: [{ type: 'money', delta: -b.testCost }],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t('看家庭医生', 'See the family doctor'),
    minutes: b.minutes.gp,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'health', delta: b.gpHealth }],
  },
  {
    id: 'relax',
    place: 'pub',
    label: t('来份 donair 和本地啤酒', 'A donair and a local pint'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.relaxCost },
      { type: 'stat', key: 'mood', delta: b.relaxMood },
    ],
  },
  {
    id: 'kitchen-party',
    place: 'pub',
    label: t(
      '跟着小提琴跺脚（厨房派对）',
      'Stomp along to the fiddle (kitchen party)',
    ),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ dayKind: 'weekend' }, { minuteMin: 1140 }],
    effects: [
      { type: 'money', delta: -b.relaxCost / 2 },
      { type: 'stat', key: 'mood', delta: b.festivalMood + 2 },
    ],
  },
  {
    id: 'coffee',
    place: 'cafe',
    label: t(
      '一杯双糖双奶和一个枫糖甜甜圈',
      'A double-double and a maple doughnut',
    ),
    minutes: b.minutes.coffee,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.coffeeCost - b.prices.doughnut },
      { type: 'stat', key: 'mood', delta: b.coffeeMood },
    ],
  },
  ...[
    ['reading-chair', '每季心情、健康各加一点', '+1 mood and health/quarter'],
    ['warm-curtains', '每季心情加一点', '+1 mood/quarter'],
    ['desk-lamp', '每季健康加一点', '+1 health/quarter'],
  ].map(([id, zhCN, en]): CaActivity => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${caFurnishingNames[id].zhCN}（${zhCN}） · ${cad(b.furnishings[id].price)}，限一件`,
      `Buy a ${caFurnishingNames[id].en} (${en}) · ${cad(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t('请移民顾问看看评估', 'Ask the consultant for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'settlement-plan',
    place: 'newcomer',
    label: t(
      '和顾问做安家计划，交给雇主',
      'Make a settlement plan and give it to your employer',
    ),
    note: t(
      '大西洋项目要求把安家服务机构出具的安家计划交给指定雇主（SRC-261 IRPR §87.3(2)(b)）。',
      'The Atlantic program needs a settlement plan from a settlement service provider, given to the designated employer (SRC-261 IRPR §87.3(2)(b)).',
    ),
    minutes: b.minutes.paperwork,
    when: [atlantic, { flag: 'job-offer' }],
    effects: [{ type: 'settlementPlan' }],
  },
  {
    id: 'conversation-circle',
    place: 'newcomer',
    label: t('去英语角聊天', 'Join the conversation circle'),
    minutes: b.minutes.class,
    oncePerDay: true,
    when: [{ minuteMin: 690 }, { minuteMax: 780 }],
    effects: [
      { type: 'stat', key: 'english', delta: b.studyEnglish + 1 },
      { type: 'stat', key: 'mood', delta: b.circleMood },
    ],
  },
  {
    id: 'citizenship-class',
    place: 'newcomer',
    label: t('上入籍考试辅导课', 'Join the citizenship test prep class'),
    minutes: b.minutes.class,
    oncePerDay: true,
    when: [citizen],
    effects: [{ type: 'stat', key: 'civics', delta: b.civicsClass }],
  },
  {
    id: 'tax-return',
    place: 'library',
    label: t(
      '在免费报税诊所报去年的税',
      'File last year’s taxes at the free tax clinic',
    ),
    note: t(
      `入籍要求签署前 ${v.citizenshipWindowYears.value} 年涉及的税年里至少 ${v.citTaxYears.value} 年按规定报税（SRC-074 s.5(1)(c)(iii)）。游戏只在春季开放报税。`,
      `Citizenship needs returns filed as required for at least ${v.citTaxYears.value} tax years in the ${v.citizenshipWindowYears.value} years before signing (SRC-074 s.5(1)(c)(iii)). The game opens the clinic in spring.`,
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'taxReturn' }],
  },
  {
    id: 'police-request',
    place: 'library',
    label: t(
      '在线申请印度无犯罪证明',
      'Request an Indian police certificate online',
    ),
    note: t(
      `年满 ${police.minAge} 岁后在一个国家连续住满 ${police.stayMonths} 个月，申请永久居民时要附该国的无犯罪证明（SRC-266）。证明会在下一季寄到。`,
      `From age ${police.minAge}, a stay of ${police.stayMonths} months or more in one country needs its police certificate for PR (SRC-266). It arrives by post next quarter.`,
    ),
    minutes: b.minutes.paperwork,
    when: [atlantic],
    effects: [{ type: 'none' }],
  },
  {
    id: 'apply-citizenship',
    place: 'visa',
    label: t(
      `签署并递交入籍申请（费用 ${cad(citizenshipFee)}，SRC-264）`,
      `Sign and submit your citizenship application (fees ${cad(citizenshipFee)}, SRC-264)`,
    ),
    note: t(
      'IRCC 收到申请后会寄来入籍考试通知，通过后再安排宣誓仪式。',
      'After receipt, IRCC sends a citizenship test invitation, then schedules the oath ceremony once you pass.',
    ),
    minutes: b.minutes.paperwork,
    when: [citizen],
    effects: [
      { type: 'money', delta: -citizenshipFee },
      { type: 'signCitizenship' },
    ],
  },
  {
    id: 'cit-test',
    place: 'visa',
    label: t('参加入籍考试', 'Take the citizenship test'),
    minutes: b.minutes.exam,
    oncePerDay: true,
    when: [{ flag: 'cit-test-invited' }],
    effects: [{ type: 'citizenshipTest', passed: false }],
  },
  {
    id: 'oath',
    place: 'visa',
    label: t(
      '参加入籍宣誓仪式，成为加拿大公民',
      'Take the oath and become a Canadian citizen',
    ),
    minutes: b.minutes.festival,
    when: [{ flag: 'cit-ceremony-invited' }],
    effects: [{ type: 'oath' }, { type: 'ending', ending: 'settled' }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t(
      `递交大西洋项目永久居民申请（联邦费用 ${cad(aipFee)}，SRC-264）`,
      `Submit your Atlantic PR application (federal fees ${cad(aipFee)}, SRC-264)`,
    ),
    note: t(
      '费用含处理费、永久居留权费和生物识别费。递交后 IRCC 会另寄体检通知（SRC-266）。',
      'Fees cover processing, the right of PR and biometrics. IRCC sends medical exam instructions after receipt (SRC-266).',
    ),
    minutes: b.minutes.paperwork,
    when: [atlantic],
    effects: [
      { type: 'money', delta: -aipFee },
      { type: 'fileAip' },
      { type: 'ending', ending: 'settled' },
    ],
  },
  ...([1, 3, 6] as const).map((months): CaActivity => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回家探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: travelNote,
    minutes: 0,
    effects: [
      { type: 'money', delta: -b.travelCostPerMonth * months },
      { type: 'stat', key: 'mood', delta: b.travelMood },
    ],
  })),
  {
    id: 'ferry',
    place: 'station',
    label: t('坐渡轮去达特茅斯转一圈', 'Ride the ferry to Dartmouth and back'),
    minutes: b.minutes.festival,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.coffeeCost },
      { type: 'stat', key: 'mood', delta: b.benchMood + 1 },
    ],
  },
  {
    id: 'leave',
    place: 'station',
    label: t('离开加拿大', 'Leave Canada'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'busker',
    place: 'market',
    label: t('听街头艺人拉小提琴', 'Listen to a busker’s fiddle'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.buskerTip },
      { type: 'stat', key: 'mood', delta: b.benchMood },
    ],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('租一块社区菜地', 'Rent a garden plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看社区告示', 'Read the community notices'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐在木椅上看船进港', 'Sit and watch the boats come in'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季海滨健走会（${cad(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s boardwalk walking club (${cad(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
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
        'heritage-day',
        'skate',
        '在海滨冰场溜冰',
        'Skate on the waterfront rink',
      ],
      ['victoria-day', 'kite', '在广场上放风筝', 'Fly a kite on the green'],
      [
        'canada-day',
        'fireworks',
        '在码头看港口烟花',
        'Watch the harbour fireworks',
      ],
      [
        'thanksgiving',
        'potluck',
        '带一道菜去百家宴',
        'Bring a dish to the potluck',
      ],
    ] as const
  ).map(([festival, id, zhCN, en]): CaActivity => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [
      { festival },
      {
        minuteMin:
          festival === 'canada-day' ? b.fireworksStart : b.festivalStart,
      },
    ],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
