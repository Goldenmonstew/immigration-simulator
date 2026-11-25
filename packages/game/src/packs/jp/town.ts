import { japanFull2026_11 } from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { jpBalance as b } from './balance';
import type { JpEffect, JpFestival } from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const yen = (value: number) => `¥${value.toLocaleString('en-GB')}`;
const fees = japanFull2026_11.values.fees.value;

/**
 * Minatozaka, a fictional corner of Yokohama. Place IDs follow the shared
 * game shell: `visa` handles permission, `council` shows the assessment,
 * `green` hosts festivals, `pond` is for fishing and `allotment` for plots.
 */
export const jpPlaces: Place[] = [
  { id: 'home', name: t('公寓', 'Apartment'), kind: 'building' },
  {
    id: 'work',
    name: t('办公楼', 'Office'),
    kind: 'building',
    hours: { opens: 540, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('社区日语教室', 'Community Japanese class'),
    kind: 'building',
    hours: { opens: 600, closes: 1260 },
  },
  {
    id: 'library',
    name: t('区立图书馆', 'Ward library'),
    kind: 'building',
    hours: { opens: 540, closes: 1140 },
  },
  {
    id: 'gp',
    name: t('街角诊所', 'Corner clinic'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('居酒屋「灯笼」', 'Izakaya Tōrō'),
    kind: 'building',
    hours: { opens: 1020, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('喫茶店「汐见」', 'Shiomi kissaten'),
    kind: 'building',
    hours: { opens: 480, closes: 1080 },
  },
  {
    id: 'shop',
    name: t('商店街杂货铺', 'Shopping-street store'),
    kind: 'building',
    hours: { opens: 540, closes: 1260 },
  },
  {
    id: 'council',
    name: t('行政书士事务所', 'Immigration scrivener'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'ward',
    name: t('区役所', 'Ward office'),
    kind: 'building',
    hours: { opens: 510, closes: 1035, dayKinds: ['workday'] },
  },
  {
    id: 'visa',
    name: t('入管窗口', 'Immigration office'),
    kind: 'building',
    hours: { opens: 540, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'bureau',
    name: t('法务局', 'Legal Affairs Bureau'),
    kind: 'building',
    hours: { opens: 510, closes: 1035, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('港坂站', 'Minatozaka Station'),
    kind: 'building',
    hours: { opens: 300, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('市民农园', 'Community garden'),
        t('大冈川河岸', 'Ōoka riverbank'),
        t('町内会告示板', 'Neighbourhood board'),
        t('港坂神社', 'Minatozaka Shrine'),
        t('河边长椅', 'Riverside bench'),
      ][i],
    }),
  ),
];

const crops: [string, string, string, Quarter[]][] = [
  ['turnip', '芜菁', 'Turnip', [1, 4]],
  ['potato', '土豆', 'Potato', [2]],
  ['strawberry', '草莓', 'Strawberry', [1, 2]],
  ['tomato', '番茄', 'Tomato', [3]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['corn', '玉米', 'Sweetcorn', [3]],
];

export const jpFish = [
  ['haze', '虾虎鱼（ハゼ）', 'Goby'],
  ['suzuki', '鲈鱼（スズキ）', 'Japanese sea bass'],
  ['koi', '鲤鱼', 'Carp'],
  ['funa', '鲫鱼', 'Crucian carp'],
] as const;

export const jpItems: Item[] = [
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
  ...jpFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  { id: 'old-boot', name: t('旧雨靴', 'Old rain boot'), kind: 'junk' },
  {
    id: 'shopping-trolley',
    name: t('生锈的自行车筐', 'Rusty bicycle basket'),
    kind: 'junk',
  },
  {
    id: 'tea',
    name: t('瓶装绿茶', 'Bottled green tea'),
    kind: 'food',
    price: b.prices.tea,
    edible: { mood: b.food.teaMood },
  },
  {
    id: 'dango',
    name: t('三色团子', 'Tricolour dango'),
    kind: 'food',
    price: b.prices.dango,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'castella',
    name: t('长崎蛋糕', 'Castella sponge'),
    kind: 'gift',
    price: b.prices.castella,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  {
    id: 'omamori',
    name: t('神社的护身符', 'Shrine charm'),
    kind: 'gift',
  },
  ...(
    [
      ['sakura-mochi', '樱饼', 'Sakura mochi'],
      ['yakisoba', '炒面', 'Festival yakisoba'],
      ['taiyaki', '鲷鱼烧', 'Taiyaki'],
      ['ehomaki', '惠方卷', 'Ehōmaki roll'],
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
      ['miso-soup', '芜菁味噌汤', 'Turnip miso soup'],
      ['jaga-butter', '黄油土豆', 'Jaga-butter potato'],
      ['yaki-corn', '酱烤玉米', 'Soy-grilled corn'],
      ['shioyaki', '盐烤鱼定食', 'Salt-grilled fish set'],
      ['ichigo-jam', '草莓酱', 'Strawberry jam'],
      ['salad', '番茄黄瓜沙拉', 'Tomato and cucumber salad'],
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
export const jpRecipes: Recipe[] = [
  recipe('miso-soup', '煮芜菁味噌汤', 'Make turnip miso soup', { turnip: 1 }),
  recipe('jaga-butter', '做黄油土豆', 'Make jaga-butter', { potato: 1 }),
  recipe('yaki-corn', '烤酱油玉米', 'Grill soy corn', { corn: 1 }),
  recipe('shioyaki', '做盐烤鱼定食', 'Make a salt-grilled fish set', {
    suzuki: 1,
    turnip: 1,
  }),
  recipe('ichigo-jam', '熬草莓酱', 'Make strawberry jam', { strawberry: 2 }),
  recipe('salad', '拌番茄黄瓜沙拉', 'Toss a tomato and cucumber salad', {
    tomato: 1,
    cucumber: 1,
  }),
];

// Customary dates, not policy: Setsubun on 3 February, cherry blossom in
// early April, Bon dances in mid-August and shrine festivals in October.
export const jpFestivals: Festival<JpFestival>[] = [
  {
    id: 'setsubun',
    season: 1,
    name: t('节分撒豆', 'Setsubun bean throwing'),
    text: t(
      '神社前摆着装豆子的小木升。喊一声「鬼は外、福は内」，豆子落进雪化开的石缝里。',
      'Wooden boxes of roasted beans wait at the shrine. Shout “Demons out, luck in!” as the beans bounce across the thawing stones.',
    ),
  },
  {
    id: 'hanami',
    season: 2,
    name: t('河边赏樱', 'Cherry blossom viewing'),
    text: t(
      '樱花开满河岸，蓝色野餐垫一块挨一块。有人分樱饼，有人教小孩认花瓣。',
      'Blossom lines the river and blue picnic sheets sit edge to edge. Someone shares sakura mochi; someone teaches a child to spot petals.',
    ),
  },
  {
    id: 'bon-odori',
    season: 3,
    name: t('商店街盆踊', 'Shopping-street Bon dance'),
    text: t(
      '神社前搭起木台，灯笼一圈圈亮起。太鼓响了，跟着前面的人抬手、拍手、转身。',
      'A wooden tower rises at the shrine and lanterns light in rings. The taiko starts; follow the dancer ahead: lift, clap, turn.',
    ),
  },
  {
    id: 'aki-matsuri',
    season: 4,
    name: t('神社秋祭', 'Autumn shrine festival'),
    text: t(
      '神轿绕着商店街走一圈，摊位飘着鲷鱼烧的香味。町内会的阿姨在分饮料。',
      'The portable shrine circles the shopping street and the stalls smell of taiyaki. The neighbourhood association hands out drinks.',
    ),
  },
];
export const festivalFoods: Record<JpFestival, string> = {
  setsubun: 'ehomaki',
  hanami: 'sakura-mochi',
  'bon-odori': 'yakisoba',
  'aki-matsuri': 'taiyaki',
};

export const jpNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'garbage',
    text: t(
      '垃圾分类：可燃垃圾周二、周五，资源垃圾周三，早上 8 点前放到收集点。',
      'Rubbish: burnables Tuesday and Friday, recycling Wednesday. Out by 8 a.m. at the collection point.',
    ),
  },
  {
    id: 'cleanup',
    text: t(
      '町内会河岸清扫：周末上午，自带手套，结束后有茶。',
      'Neighbourhood riverbank clean-up: weekend morning, bring gloves, tea afterwards.',
    ),
  },
  {
    id: 'drill',
    text: t(
      '防灾训练：确认最近的避难所和集合地点，楼下发放储备水。',
      'Disaster drill: check your nearest shelter and meeting point. Stored water is handed out downstairs.',
    ),
  },
  {
    id: 'japanese-cafe',
    text: t(
      '社区日语教室招志愿者，也欢迎刚来的邻居旁听。',
      'The community Japanese class welcomes volunteers, and newcomers can sit in.',
    ),
  },
  {
    id: 'hanami-picnic',
    season: 2,
    text: t(
      '赏樱占位请勿过夜，垃圾请带回家。',
      'No overnight spot-saving for blossom viewing. Please take your rubbish home.',
    ),
  },
  {
    id: 'typhoon',
    season: 4,
    text: t(
      '台风季：阳台花盆收进屋，留意区役所的避难信息。',
      'Typhoon season: bring balcony pots inside and watch for ward evacuation notices.',
    ),
  },
];

const { deemedMonths, transitionOn } =
  japanFull2026_11.values.longestPeriod.value;
const renewalNote = t(
  `游戏把这次更新当作按时递交并获准，新期间按 ${deemedMonths} 个月记录：永住指南在 ${transitionOn} 前把这一期间视为最长（SRC-114 第2の5(6) 注4）。实际批几年由入管决定，游戏无法预知；${transitionOn} 以后永住要求持有该资格的最长在留期间（SRC-440 別表第2），所以评估里这一项显示待确认，递交永住时由入管核对。本游戏未收录更新手续费与可提前递交的期间。`,
  `The game treats this as a timely renewal that is granted, recorded as ${deemedMonths} months: the permanent residence guideline treats that period as the longest until ${transitionOn} (SRC-114 2-5(6) note 4). The immigration office decides the actual period, which the game cannot predict. After ${transitionOn}, permanent residence needs the longest period of stay for your status (SRC-440, Appended Table II), so the assessment shows that requirement as pending and the office checks it when you apply. This game does not charge a renewal fee or model how early you may file.`,
);

/** The shared furniture, as Minatozaka's shop sells it. */
export const jpFurnishingNames: Record<string, Text> = {
  'reading-chair': t('和室座椅', 'Floor chair'),
  'warm-curtains': t('遮光窗帘', 'Blackout curtains'),
  'desk-lamp': t('台灯', 'Desk lamp'),
};

export const jpActions: Activity<JpEffect, JpFestival>[] = [
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
    (place): Activity<JpEffect, JpFestival> => ({
      id: `study-${place}`,
      place,
      label: t('自学日语', 'Study Japanese'),
      minutes: b.minutes.study,
      oncePerDay: true,
      effects: [{ type: 'stat', key: 'japanese', delta: b.studyJapanese }],
    }),
  ),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到朝南的公寓（押金 ${yen(b.housingDeposit)}、搬家 ${yen(b.housingMoveCost)}，每季加租 ${yen(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a south-facing flat (${yen(b.housingDeposit)} deposit, ${yen(b.housingMoveCost)} moving, +${yen(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the deposit)`,
    ),
    note: t(
      `搬家后 ${japanFull2026_11.values.immigrationDuties.value.addressDays} 天内到区役所申报新住址（SRC-110 第19条の7–9）。游戏里的日子之间会跳过一段时间，所以只在区役所当天还能受理时提供搬家，搬完当天就去申报。`,
      `Report the new address at the ward office within ${japanFull2026_11.values.immigrationDuties.value.addressDays} days of moving (SRC-110 art. 19-7 to 19-9). The game skips ahead between days, so moving is offered only while the ward office can still take the notice; report it the same day.`,
    ),
    minutes: b.minutes.paperwork,
    effects: [
      { type: 'money', delta: -b.housingDeposit - b.housingMoveCost },
      { type: 'moved' },
    ],
  },
  {
    id: 'leave-brighter-home',
    place: 'home',
    label: t(
      '退租朝南公寓，退回押金',
      'Leave the south-facing flat and recover the deposit',
    ),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'brighter-home' }],
    effects: [{ type: 'money', delta: b.housingDeposit }, { type: 'moved' }],
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
    label: t('加班（残業）', 'Work overtime'),
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
    label: t('上日语课', 'Join the Japanese class'),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'japanese', delta: b.classJapanese },
    ],
  },
  {
    id: 'exam',
    place: 'college',
    label: t('参加日语水平评估', 'Take a Japanese language assessment'),
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'none' }],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t('看病', 'See the doctor'),
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
    label: t('来杯啤酒和毛豆', 'Beer and edamame'),
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
    label: t('喝杯手冲咖啡', 'Have a pour-over coffee'),
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
  ].map(([id, zhCN, en]): Activity<JpEffect, JpFestival> => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${jpFurnishingNames[id].zhCN}（${zhCN}） · ${yen(b.furnishings[id].price)}，限一件`,
      `Buy a ${jpFurnishingNames[id].en} (${en}) · ${yen(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t('请行政书士看看评估', 'Ask the scrivener for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'address-notice',
    place: 'ward',
    label: t('申报新住址', 'Report your new address'),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'address-notice-due' }],
    effects: [{ type: 'addressNotice' }],
  },
  {
    id: 'ward-certificate',
    place: 'ward',
    label: t('开住民票和课税证明', 'Get residence and tax certificates'),
    note: t(
      '永住和帰化都要核对纳税、年金和医保记录。游戏里证明免费，只花时间。',
      'Permanent residence and naturalisation both check tax, pension and health insurance records. In this game the certificates are free and only take time.',
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'extend',
    place: 'visa',
    label: t(
      `办理在留期间更新（本情景按获批 ${deemedMonths} 个月记录）`,
      `Renew your period of stay (recorded as granted for ${deemedMonths} months in this scenario)`,
    ),
    note: renewalNote,
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    when: [{ visaMonthsLeftMax: b.renewalWindowMonths }],
    effects: [{ type: 'renewal' }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t('递交永住许可申请', 'Apply for permanent residence'),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  {
    id: 'nat-interview',
    place: 'bureau',
    label: t(
      '预约帰化咨询和日语面谈',
      'Book a naturalisation consultation and Japanese interview',
    ),
    note: t(
      '游戏把通过日语评估后的面谈记为法务局已确认（SRC-117 Q9）。',
      'After the in-game language assessment, the game records the interview as confirmed by the bureau (SRC-117 Q9).',
    ),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'japanese-confirmed' }],
    effects: [{ type: 'interview' }],
  },
  {
    id: 'naturalise',
    place: 'bureau',
    label: t(
      `递交帰化申请（手续费 ${yen(fees.naturalisation)}，SRC-445）`,
      `Apply for naturalisation (fee ${yen(fees.naturalisation)}, SRC-445)`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  ...([1, 3, 6] as const).map((months): Activity<JpEffect, JpFestival> => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回国探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: t(
      `出境时声明みなし再入国，手续费 ${yen(fees.deemed)}；须在在留期限内回来（SRC-110 第26条の2）。`,
      `Declare deemed re-entry when leaving, fee ${yen(fees.deemed)}; return before your period of stay ends (SRC-110 art. 26-2).`,
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
    label: t('离开日本', 'Leave Japan'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('租一块市民农园', 'Rent a garden plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看町内会告示', 'Read the neighbourhood notices'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐着看河', 'Sit and watch the river'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季河边健走会（${yen(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s riverside walking club (${yen(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'shrine-visit',
    place: 'green',
    label: t('投一枚硬币，拍手参拜', 'Toss a coin, clap and pray'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.shrineOffering },
      { type: 'stat', key: 'mood', delta: b.benchMood },
    ],
  },
  {
    id: 'festival',
    place: 'green',
    label: t('逛祭典摊位', 'Wander the festival stalls'),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ dayKind: 'special' }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  },
  ...(
    [
      ['setsubun', 'mamemaki', '撒豆驱鬼', 'Throw beans for luck'],
      [
        'hanami',
        'hanami-picnic',
        '铺开野餐垫赏樱',
        'Spread a picnic sheet under the blossom',
      ],
      ['bon-odori', 'bon-dance', '跟着太鼓跳盆踊', 'Join the Bon dance'],
      [
        'aki-matsuri',
        'mikoshi',
        '帮忙扶神轿',
        'Help carry the portable shrine',
      ],
    ] as const
  ).map(([festival, id, zhCN, en]): Activity<JpEffect, JpFestival> => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [
      { festival },
      {
        minuteMin: festival === 'bon-odori' ? b.bonOdoriStart : b.festivalStart,
      },
    ],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
