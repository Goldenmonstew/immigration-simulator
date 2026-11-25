import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { deBalance as b } from './balance';
import type { DeEffect, DeFestival } from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const eur = (value: number) =>
  `€${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
const values = germanyFull2026_11.values;
const lidFee = values.externalOrientationFee.value;
const test = values.citizenshipKnowledgeTest.value;

/**
 * Lindenufer, a fictional canal-side Kiez in Berlin. Place IDs follow the
 * shared game shell: `visa` handles residence, `council` shows the
 * assessment, `green` hosts festivals, `pond` is for fishing and `allotment`
 * for plots.
 */
export const dePlaces: Place[] = [
  { id: 'home', name: t('老公寓', 'Altbau flat'), kind: 'building' },
  {
    id: 'work',
    name: t('运河庭院', 'Kanalhöfe'),
    kind: 'building',
    hours: { opens: 480, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('民众高校（VHS）', 'Volkshochschule'),
    kind: 'building',
    hours: { opens: 540, closes: 1260, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'library',
    name: t('街区图书馆', 'Kiez library'),
    kind: 'building',
    hours: { opens: 600, closes: 1140, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'gp',
    name: t('家庭医生诊所', 'Family doctor'),
    kind: 'building',
    hours: { opens: 480, closes: 1080, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('小酒馆「船闸」', 'Kneipe Zur Schleuse'),
    kind: 'building',
    hours: { opens: 960, closes: 1440 },
  },
  {
    id: 'cafe',
    name: t('早安面包咖啡店', 'Bäckerei Morgenrot'),
    kind: 'building',
    hours: { opens: 390, closes: 1080 },
  },
  {
    id: 'shop',
    name: t('街角小店（Späti）', 'Späti corner shop'),
    kind: 'building',
    hours: { opens: 600, closes: 1440 },
  },
  {
    id: 'council',
    name: t('移民咨询处', 'Migration advice centre'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday'] },
  },
  {
    id: 'ward',
    name: t('市民服务局', 'Bürgeramt'),
    kind: 'building',
    hours: { opens: 480, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'visa',
    name: t('外国人管理局', 'Ausländerbehörde'),
    kind: 'building',
    hours: { opens: 480, closes: 900, dayKinds: ['workday'] },
  },
  {
    id: 'bureau',
    name: t('入籍科', 'Naturalisation office'),
    kind: 'building',
    hours: { opens: 480, closes: 900, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('林登岸站', 'S Lindenufer'),
    kind: 'building',
    hours: { opens: 270, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('小菜园协会', 'Allotment colony'),
        t('林登运河岸', 'Lindenkanal bank'),
        t('广告柱', 'Advertising column'),
        t('集市广场', 'Market square'),
        t('运河长椅', 'Canal bench'),
      ][i],
    }),
  ),
];

const crops: [string, string, string, Quarter[]][] = [
  ['potato', '土豆', 'Potato', [2, 4]],
  ['strawberry', '草莓', 'Strawberry', [2]],
  ['tomato', '番茄', 'Tomato', [3]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['sunflower', '向日葵', 'Sunflower', [3]],
  ['turnip', '芜菁甘蓝', 'Swede', [1, 4]],
];

export const deFish = [
  ['barsch', '河鲈（Barsch）', 'Perch'],
  ['hecht', '白斑狗鱼（Hecht）', 'Pike'],
  ['ploetze', '拟鲤（Plötze）', 'Roach'],
  ['brasse', '欧鳊（Brasse）', 'Bream'],
] as const;

export const deItems: Item[] = [
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
  ...deFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  { id: 'old-boot', name: t('旧胶靴', 'Old rubber boot'), kind: 'junk' },
  {
    id: 'shopping-trolley',
    name: t('沉在运河里的购物车', 'Sunken shopping trolley'),
    kind: 'junk',
  },
  {
    id: 'apfelschorle',
    name: t('苹果汽水（Apfelschorle）', 'Apfelschorle'),
    kind: 'food',
    price: b.prices.drink,
    edible: { mood: b.food.drinkMood },
  },
  {
    id: 'brezel',
    name: t('碱水面包（Brezel）', 'Brezel'),
    kind: 'food',
    price: b.prices.brezel,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'kuchen',
    name: t('奶酥蛋糕（Streuselkuchen）', 'Streuselkuchen'),
    kind: 'gift',
    price: b.prices.kuchen,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  ...(
    [
      ['gebrannte-mandeln', '糖炒杏仁', 'Roasted almonds'],
      ['bratwurst', '烤香肠', 'Bratwurst'],
      ['currywurst', '咖喱香肠', 'Currywurst'],
      ['weckmann', '圣马丁面包小人', 'Weckmann'],
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
      ['kartoffelsalat', '土豆沙拉', 'Kartoffelsalat'],
      ['bratkartoffeln', '煎土豆', 'Bratkartoffeln'],
      ['eintopf', '芜菁甘蓝炖菜', 'Swede stew'],
      ['barsch-kartoffeln', '煎河鲈配土豆', 'Pan-fried perch with potatoes'],
      ['erdbeermarmelade', '草莓果酱', 'Strawberry jam'],
      ['tomatensuppe', '番茄汤', 'Tomato soup'],
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
export const deRecipes: Recipe[] = [
  recipe('kartoffelsalat', '拌土豆沙拉', 'Make Kartoffelsalat', {
    potato: 1,
    cucumber: 1,
  }),
  recipe('bratkartoffeln', '煎一盘土豆', 'Fry Bratkartoffeln', { potato: 1 }),
  recipe('eintopf', '炖芜菁甘蓝', 'Simmer a swede stew', { turnip: 1 }),
  recipe('barsch-kartoffeln', '煎河鲈配土豆', 'Pan-fry perch with potatoes', {
    barsch: 1,
    potato: 1,
  }),
  recipe('erdbeermarmelade', '熬草莓果酱', 'Make strawberry jam', {
    strawberry: 2,
  }),
  recipe('tomatensuppe', '煮番茄汤', 'Cook tomato soup', { tomato: 2 }),
];

// Customary dates, not policy: Christmas markets open for Advent, May Day
// with its maypole, the Fête de la Musique on 21 June and St Martin's
// lantern walk on 11 November.
export const deFestivals: Festival<DeFestival>[] = [
  {
    id: 'weihnachtsmarkt',
    season: 1,
    name: t('圣诞集市', 'Christmas market'),
    text: t(
      '广场上搭起木屋，屋檐挂着彩灯。烤杏仁的甜味混着冷空气，旋转木马叮叮当当地转。',
      'Wooden huts fill the square, fairy lights along their eaves. Roasted almonds sweeten the cold air and the little carousel jingles round.',
    ),
  },
  {
    id: 'maifest',
    season: 2,
    name: t('五月节', 'May Day fair'),
    text: t(
      '集市广场立起五月树，彩带在风里飘。铜管乐队开始演奏，烤架上的香肠滋滋作响。',
      'A maypole rises over the market square, ribbons flying. The brass band strikes up and sausages sizzle on the grill.',
    ),
  },
  {
    id: 'fete-de-la-musique',
    season: 3,
    name: t('街头音乐节', 'Fête de la Musique'),
    text: t(
      '一年里白天最长的那天，街角、阳台、运河边都有人在弹唱。谁都可以加入。',
      'On the longest day of the year, people play on street corners, balconies and the canal bank. Anyone can join in.',
    ),
  },
  {
    id: 'st-martin',
    season: 4,
    name: t('圣马丁灯笼游行', 'St Martin’s lantern walk'),
    text: t(
      '天一黑，孩子们提着自己做的纸灯笼排成队，沿着运河唱歌。队尾有人分面包小人。',
      'At dusk, children line up with paper lanterns they made themselves and sing along the canal. Someone at the back hands out Weckmann buns.',
    ),
  },
];
export const festivalFoods: Record<DeFestival, string> = {
  weihnachtsmarkt: 'gebrannte-mandeln',
  maifest: 'bratwurst',
  'fete-de-la-musique': 'currywurst',
  'st-martin': 'weckmann',
};

export const deNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'bins',
    text: t(
      '垃圾分类：黄桶放包装，蓝桶放纸，棕桶放厨余。玻璃瓶按颜色投进街角的回收箱，周日别扔。',
      'Bins: yellow for packaging, blue for paper, brown for food waste. Glass goes in the street bottle banks by colour, never on Sundays.',
    ),
  },
  {
    id: 'flohmarkt',
    text: t(
      '周日运河边跳蚤市场：旧唱片、自行车零件、奶奶的茶具。',
      'Sunday flea market on the canal: old records, bike parts, someone’s grandmother’s tea set.',
    ),
  },
  {
    id: 'sprachcafe',
    text: t(
      '图书馆每周四晚上有语言咖啡角，德语初学者欢迎来聊天。',
      'The library’s language café meets Thursday evenings. German beginners welcome.',
    ),
  },
  {
    id: 'hausversammlung',
    text: t(
      '本楼住户会议：讨论自行车停放和后院的晾衣绳。',
      'House meeting: bike parking and the washing line in the back courtyard.',
    ),
  },
  {
    id: 'spargel',
    season: 2,
    text: t(
      '白芦笋季开始了，周六集市有农户直接从田里运来。',
      'White asparagus season has begun. Farmers bring it fresh to Saturday’s market.',
    ),
  },
  {
    id: 'laternen',
    season: 4,
    text: t(
      '圣马丁前一周，民众高校有亲子做灯笼的手工课。',
      'The week before St Martin’s, the VHS runs a lantern-making class for families.',
    ),
  },
];

/** The shared furniture, as Lindenufer’s corner shop finds it second-hand. */
export const deFurnishingNames: Record<string, Text> = {
  'reading-chair': t('二手扶手椅', 'Second-hand armchair'),
  'warm-curtains': t('保暖窗帘', 'Thermal curtains'),
  'desk-lamp': t('黄铜台灯', 'Brass desk lamp'),
};

export const deActions: Activity<DeEffect, DeFestival>[] = [
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
    (place): Activity<DeEffect, DeFestival> => ({
      id: `study-${place}`,
      place,
      label: t('自学德语', 'Study German'),
      minutes: b.minutes.study,
      oncePerDay: true,
      effects: [{ type: 'stat', key: 'german', delta: b.studyGerman }],
    }),
  ),
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
    label: t('加班（Überstunden）', 'Work overtime'),
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
    label: t('上德语课', 'Join a German class'),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'german', delta: b.classGerman },
    ],
  },
  {
    id: 'exam',
    place: 'college',
    label: t('参加德语 B1 考试', 'Sit a German B1 exam'),
    minutes: b.minutes.exam,
    oncePerDay: true,
    when: [{ dayKind: 'weekend' }],
    effects: [{ type: 'none' }],
  },
  {
    id: 'orientation-test',
    place: 'college',
    label: t(
      `参加「在德国生活」测试（${eur(lidFee)}）`,
      `Take the Leben in Deutschland test (${eur(lidFee)})`,
    ),
    note: t(
      `${test.total} 道题。定居要答对 ${values.orientationPass.value} 题（SRC-432、SRC-412 IntV 第 17 条），入籍要答对 ${test.required} 题（SRC-411、SRC-412 第 17 条第 5 款）；外部考生费用见 SRC-432。游戏按德语水平折算答对题数，重考取最好成绩。`,
      `${test.total} questions. Settlement needs ${values.orientationPass.value} right (SRC-432, SRC-412 IntV § 17) and naturalisation ${test.required} (SRC-411, SRC-412 § 17(5)); the fee for external candidates is in SRC-432. The game counts right answers from your German, and a retake keeps your best score.`,
    ),
    minutes: b.minutes.exam,
    oncePerDay: true,
    when: [{ dayKind: 'weekend' }],
    effects: [{ type: 'money', delta: -lidFee }],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t(
      '看家庭医生（出示医保卡）',
      'See the doctor with your health card',
    ),
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
    label: t('下班来杯啤酒配碱水面包', 'An after-work beer and a Brezel'),
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
    label: t('喝咖啡、吃块蛋糕', 'Kaffee und Kuchen'),
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
  ].map(([id, zhCN, en]): Activity<DeEffect, DeFestival> => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `托小店老板淘一件${deFurnishingNames[id].zhCN}（${zhCN}） · ${eur(b.furnishings[id].price)}，限一件`,
      `Get a ${deFurnishingNames[id].en} through the shop (${en}) · ${eur(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t('请顾问看看评估', 'Ask an adviser for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'ward-certificate',
    place: 'ward',
    label: t(
      '开一张居住登记证明（Meldebescheinigung）',
      'Get a registration certificate (Meldebescheinigung)',
    ),
    note: t(
      '定居和入籍都要核对登记住址。游戏里证明免费，只花时间。',
      'Settlement and naturalisation both check your registered address. In this game the certificate is free and only takes time.',
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t('申请定居许可', 'Apply for a settlement permit'),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  {
    id: 'naturalise',
    place: 'bureau',
    label: t('递交入籍申请', 'Apply for naturalisation'),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  ...([1, 3, 6] as const).map((months): Activity<DeEffect, DeFestival> => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回家探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: t(
      `须在居留许可到期前回来；离开不超过 ${values.lapseMonths.value} 个月，许可不会因出境失效（SRC-100 第 51 条第 1 款第 7 项）。游戏把探亲当作无薪假，在外的月份不计工作和缴费。`,
      `Come back before your permit ends; an absence of up to ${values.lapseMonths.value} months does not end the permit (SRC-100 § 51 Abs. 1 Nr. 7). The game treats the visit as unpaid leave: months abroad do not count as work with contributions.`,
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
    label: t('离开德国', 'Leave Germany'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('在小菜园协会租一块地', 'Rent an allotment bed'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看广告柱上的海报', 'Read the posters on the column'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐着看运河上的船', 'Watch the boats on the canal'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季运河跑步团（${eur(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s canal running club (${eur(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'wochenmarkt',
    place: 'green',
    label: t('逛周末集市，闻闻面包和花', 'Browse the weekend market stalls'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    when: [{ dayKind: 'weekend' }],
    effects: [{ type: 'stat', key: 'mood', delta: b.marketMood }],
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
        'weihnachtsmarkt',
        'kinderpunsch',
        '捧一杯热潘趣，看木屋点灯',
        'Hold a warm punch as the huts light up',
      ],
      ['maifest', 'maibaum', '帮忙把五月树立起来', 'Help raise the maypole'],
      [
        'fete-de-la-musique',
        'strassenmusik',
        '跟街头乐队一起唱',
        'Sing along with a street band',
      ],
      [
        'st-martin',
        'laternenumzug',
        '提着纸灯笼跟游行走一圈',
        'Walk the lantern procession',
      ],
    ] as const
  ).map(([festival, id, zhCN, en]): Activity<DeEffect, DeFestival> => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [
      { festival },
      {
        minuteMin: festival === 'st-martin' ? b.lanternStart : b.festivalStart,
      },
    ],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
