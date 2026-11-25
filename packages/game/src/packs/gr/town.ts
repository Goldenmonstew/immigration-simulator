import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { grBalance as b } from './balance';
import { src, timing, values, type GrEffect, type GrFestival } from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
export const euro = (value: number) =>
  `€${Math.round(value).toLocaleString('en-GB')}`;
type GrActivity = Activity<GrEffect, GrFestival>;

/**
 * Limanaki, a fictional harbour neighbourhood on the Attic coast. Place IDs
 * follow the shared game shell: `visa` handles permits, `council` shows the
 * assessment, `green` hosts festivals, `pond` is for fishing and `allotment`
 * for plots.
 */
export const grPlaces: Place[] = [
  { id: 'home', name: t('海景公寓楼', 'Apartment block'), kind: 'building' },
  {
    id: 'work',
    name: t('港口航运大楼', 'Harbour shipping office'),
    kind: 'building',
    hours: { opens: 540, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('社区希腊语班', 'Greek class'),
    kind: 'building',
    hours: { opens: 600, closes: 1290 },
  },
  {
    id: 'library',
    name: t('市立图书馆', 'Municipal library'),
    kind: 'building',
    hours: { opens: 510, closes: 1170 },
  },
  {
    id: 'gp',
    name: t('社区卫生中心', 'Health centre'),
    kind: 'building',
    hours: { opens: 480, closes: 1260, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('海浪小酒馆', 'Taverna To Kyma'),
    kind: 'building',
    hours: { opens: 720, closes: 1440 },
  },
  {
    id: 'cafe',
    name: t('梧桐咖啡馆', 'Kafeneio O Platanos'),
    kind: 'building',
    hours: { opens: 420, closes: 1320 },
  },
  {
    id: 'shop',
    name: t('阿尔迪特超市', 'Ardit’s mini market'),
    kind: 'building',
    hours: { opens: 480, closes: 1260 },
  },
  {
    id: 'council',
    name: t('会计师事务所', 'Accountant’s office'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'kep',
    name: t('KEP 服务中心', 'KEP service centre'),
    kind: 'building',
    hours: { opens: 480, closes: 900, dayKinds: ['workday'] },
  },
  {
    id: 'visa',
    name: t('移民局办事处', 'Migration office'),
    kind: 'building',
    hours: { opens: 480, closes: 870, dayKinds: ['workday'] },
  },
  {
    id: 'bureau',
    name: t('国籍司', 'Citizenship directorate'),
    kind: 'building',
    hours: { opens: 480, closes: 870, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('海滨电车站', 'Coastal tram stop'),
    kind: 'building',
    hours: { opens: 300, closes: 1440 },
  },
  {
    id: 'market',
    name: t('周六露天菜市', 'Saturday street market'),
    kind: 'outdoor',
    hours: { opens: 420, closes: 870, dayKinds: ['weekend'] },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('市立菜园', 'Municipal gardens'),
        t('港口防波堤', 'Harbour breakwater'),
        t('报亭告示板', 'Kiosk noticeboard'),
        t('圣尼古拉广场', 'Agios Nikolaos square'),
        t('海滨长椅', 'Seafront bench'),
      ][i],
    }),
  ),
];

const crops: [string, string, string, Quarter[]][] = [
  ['tomato', '番茄', 'Tomato', [3]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['potato', '土豆', 'Potato', [1, 2]],
  ['strawberry', '草莓', 'Strawberry', [2]],
  ['corn', '玉米', 'Sweetcorn', [3, 4]],
  ['turnip', '芜菁', 'Turnip', [1, 4]],
];

export const grFish = [
  ['sardine', '沙丁鱼', 'Sardine'],
  ['red-mullet', '红鲻鱼', 'Red mullet'],
  ['sea-bream', '金头鲷', 'Gilt-head bream'],
  ['mackerel', '鲭鱼', 'Mackerel'],
] as const;

export const grItems: Item[] = [
  ...crops.flatMap(([id, zhCN, en, seasons]): Item[] => [
    {
      id,
      name: { zhCN, en },
      kind: 'crop',
      // Street-market price; the market sells what is in season.
      price: b.prices.produce,
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
  ...grFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  { id: 'old-boot', name: t('一只旧胶靴', 'An old rubber boot'), kind: 'junk' },
  {
    id: 'shopping-trolley',
    name: t('生锈的购物车', 'A rusty shopping trolley'),
    kind: 'junk',
  },
  {
    id: 'mountain-tea',
    name: t('一包山茶（τσάι του βουνού）', 'Greek mountain tea'),
    kind: 'food',
    price: b.prices.tea,
    edible: { mood: b.food.teaMood },
  },
  {
    id: 'koulouri',
    name: t('芝麻面包圈', 'Koulouri sesame ring'),
    kind: 'food',
    price: b.prices.koulouri,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'baklava',
    name: t('一盒果仁蜜饼', 'A box of baklava'),
    kind: 'gift',
    price: b.prices.baklava,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  {
    id: 'olive-oil',
    name: t('一罐初榨橄榄油', 'A tin of olive oil'),
    kind: 'gift',
    price: b.prices.oil,
  },
  ...(
    [
      ['vasilopita', '新年蛋糕（藏着硬币）', 'Vasilopita slice'],
      ['tsoureki', '复活节甜面包', 'Tsoureki'],
      ['souvlaki', '烤肉串', 'Souvlaki'],
      ['loukoumades', '蜂蜜小炸球', 'Loukoumades'],
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
      ['horiatiki', '希腊农夫沙拉', 'Horiatiki salad'],
      ['gemista', '番茄酿饭', 'Gemista'],
      ['lemon-potatoes', '柠檬烤土豆', 'Lemon potatoes'],
      ['grilled-sardines', '炭烤沙丁鱼', 'Grilled sardines'],
      ['kakavia', '渔夫鱼汤', 'Kakavia fish soup'],
      ['spoon-sweet', '草莓蜜饯', 'Strawberry spoon sweet'],
      ['grilled-corn', '炭烤玉米', 'Charcoal corn'],
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
export const grRecipes: Recipe[] = [
  recipe('horiatiki', '拌希腊农夫沙拉', 'Make a horiatiki salad', {
    tomato: 1,
    cucumber: 1,
  }),
  recipe('gemista', '做番茄酿饭', 'Bake gemista', { tomato: 2 }),
  recipe('lemon-potatoes', '烤柠檬土豆', 'Roast lemon potatoes', {
    potato: 1,
  }),
  recipe('grilled-sardines', '炭烤沙丁鱼', 'Grill sardines', { sardine: 1 }),
  recipe('kakavia', '煮渔夫鱼汤', 'Cook kakavia fish soup', {
    'sea-bream': 1,
    potato: 1,
  }),
  recipe('spoon-sweet', '熬草莓蜜饯', 'Make a strawberry spoon sweet', {
    strawberry: 2,
  }),
  recipe('grilled-corn', '炭烤玉米', 'Grill corn on charcoal', { corn: 1 }),
];

// Customary dates, not policy: Theophany on 6 January, Orthodox Easter
// (Julian computus), the Dormition feast on 15 August and Ochi Day on
// 28 October.
export const grFestivals: Festival<GrFestival>[] = [
  {
    id: 'theophany',
    season: 1,
    name: t('主显节祝圣海水', 'Theophany: blessing the waters'),
    text: t(
      '神父在码头把十字架抛进冬天的海里，几个年轻人扑通跳下去抢。岸上的人在分新年蛋糕。',
      'The priest throws a cross into the winter sea and a few young swimmers dive after it. On the quay, slices of New Year cake go round.',
    ),
  },
  {
    id: 'easter',
    season: 2,
    name: t('东正教复活节', 'Orthodox Easter'),
    text: t(
      '广场上架起烤全羊的炭火，桌上摆满红壳彩蛋和复活节甜面包。见面第一句是「基督复活了！」',
      'Charcoal pits roast lamb on the square, tables fill with red eggs and tsoureki, and every greeting is “Christ is risen!”',
    ),
  },
  {
    id: 'panigyri',
    season: 3,
    name: t('八月十五圣母节庙会', 'Feast of the Dormition'),
    text: t(
      '城里一半人去了海岛，留下的人把长桌摆满广场。布祖基琴一响，所有人手拉手围成圈。',
      'Half of Athens has left for the islands; those who stayed fill the square with long tables. When the bouzouki starts, everyone links hands in a circle.',
    ),
  },
  {
    id: 'ochi',
    season: 4,
    name: t('十月二十八日学生游行', 'Ochi Day school parade'),
    text: t(
      '阳台挂满蓝白国旗，学生们穿着校服从海滨路走过。路边的小摊在卖蜂蜜小炸球。',
      'Blue-and-white flags hang from every balcony and schoolchildren march along the seafront. A stall sells loukoumades.',
    ),
  },
];
export const festivalFoods: Record<GrFestival, string> = {
  theophany: 'vasilopita',
  easter: 'tsoureki',
  panigyri: 'souvlaki',
  ochi: 'loukoumades',
};

export const grNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'laiki',
    text: t(
      '每周六上午海滨路封街摆露天菜市，收摊前常有半价。',
      'Every Saturday morning the seafront road closes for the street market. Prices drop just before the stalls pack up.',
    ),
  },
  {
    id: 'cats',
    text: t(
      '流浪猫喂食点：请用干净的碗，别把鱼骨倒在路边。',
      'Cat feeding point: clean bowls only, and no fish bones on the pavement.',
    ),
  },
  {
    id: 'quiet',
    text: t(
      '午后是安静时间，请勿装修敲打。楼下的奶奶在睡午觉。',
      'Afternoons are quiet time. No drilling, please: the grandmother downstairs is napping.',
    ),
  },
  {
    id: 'greek-class',
    text: t(
      '社区中心希腊语班晚上开课，刚搬来的邻居欢迎旁听。',
      'The community centre’s Greek class meets in the evening. New neighbours are welcome to sit in.',
    ),
  },
  {
    id: 'kites',
    season: 2,
    text: t(
      '洁净星期一一起去山坡放风筝，自带芝麻扁面包。',
      'Clean Monday kite flying on the hill. Bring your own lagana bread.',
    ),
  },
  {
    id: 'heat',
    season: 3,
    text: t(
      '热浪提醒：中午少出门，市立图书馆开放冷气阅览室。',
      'Heatwave notice: stay in at midday. The library’s cool reading room is open.',
    ),
  },
  {
    id: 'olives',
    season: 4,
    text: t(
      '橄榄采收季：周末去山村帮忙，可以换一罐新油。',
      'Olive harvest: help in the hill villages at the weekend and take home a tin of new oil.',
    ),
  },
];

const fees = {
  a2: values.settlementIntegration.value.fullFee,
  pegp: values.naturalisationExam.value.fee,
  naturalisation: values.naturalisationFees.value.initial,
};
/** The shared furniture, as Ardit's mini market sells it. */
export const grFurnishingNames: Record<string, Text> = {
  'reading-chair': t('阳台藤椅', 'Balcony wicker chair'),
  'warm-curtains': t('木百叶窗', 'Wooden shutters'),
  'desk-lamp': t('台灯', 'Desk lamp'),
};

const reporting = values.changeReporting.value;
const moveNote = t(
  `搬家后 ${reporting.months} 个月内向移民局申报新住址，逾期申报罚款 ${euro(reporting.firstFine)}，再次逾期 ${euro(reporting.repeatFine)}（${src(values.changeReporting)}）。游戏里的日子之间会跳过一段时间，所以只在移民局当天还能受理时提供搬家和退租，搬完当天就去申报。`,
  `Report the new address to the migration office within ${reporting.months} months of moving; a late report costs ${euro(reporting.firstFine)}, or ${euro(reporting.repeatFine)} when it happens again (${src(values.changeReporting)}). The game skips ahead between days, so moving in or out is offered only while the migration office can still take the report; report it the same day.`,
);

export const grActions: GrActivity[] = [
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
    label: t('睡个午觉', 'Take a siesta'),
    minutes: b.minutes.nap,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.napMood },
      { type: 'stat', key: 'health', delta: b.napHealth },
    ],
  },
  ...(['home', 'library'] as const).map((place): GrActivity => ({
    id: `study-${place}`,
    place,
    label: t('自学希腊语', 'Study Greek'),
    minutes: b.minutes.study,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'greek', delta: b.studyGreek }],
  })),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到带阳台的海景公寓（押金 ${euro(b.housingDeposit)}、搬家 ${euro(b.housingMoveCost)}，每季加租 ${euro(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a flat with a sea-view balcony (${euro(b.housingDeposit)} deposit, ${euro(b.housingMoveCost)} moving, +${euro(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the deposit)`,
    ),
    note: moveNote,
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
      '退租海景公寓，退回押金',
      'Leave the sea-view flat and recover the deposit',
    ),
    note: moveNote,
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
    label: t('加班', 'Work overtime'),
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
    label: t('上希腊语课', 'Join the Greek class'),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'greek', delta: b.classGreek },
    ],
  },
  {
    id: 'exam',
    place: 'college',
    label: t(
      `参加 A2 希腊语与历史文化考试（报名费 ${euro(fees.a2)}，${src(values.settlementIntegration)}）`,
      `Sit the A2 Greek language and history exam (fee ${euro(fees.a2)}, ${src(values.settlementIntegration)})`,
    ),
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'money', delta: -fees.a2 }],
  },
  {
    id: 'pegp',
    place: 'college',
    label: t(
      `参加 Π.Ε.Γ.Π. 入籍知识考试（报名费 ${euro(fees.pegp)}，${src(values.naturalisationExam)}）`,
      `Sit the Π.Ε.Γ.Π. naturalisation exam (fee ${euro(fees.pegp)}, ${src(values.naturalisationExam)})`,
    ),
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'money', delta: -fees.pegp }],
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
    label: t('来一盘炸小鱼配茴香酒', 'Fried whitebait and a glass of ouzo'),
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
    label: t('来一杯冰咖啡（freddo espresso）', 'Have a freddo espresso'),
    minutes: b.minutes.coffee,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.coffeeCost },
      { type: 'stat', key: 'mood', delta: b.coffeeMood },
    ],
  },
  {
    id: 'tavli',
    place: 'cafe',
    label: t(
      '和老人们下一盘双陆棋（tavli）',
      'Play a game of tavli with the regulars',
    ),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.tavliMood },
      { type: 'stat', key: 'greek', delta: 1 },
    ],
  },
  ...[
    ['reading-chair', '每季心情、健康各加一点', '+1 mood and health/quarter'],
    ['warm-curtains', '每季心情加一点', '+1 mood/quarter'],
    ['desk-lamp', '每季健康加一点', '+1 health/quarter'],
  ].map(([id, zhCN, en]): GrActivity => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${grFurnishingNames[id].zhCN}（${zhCN}） · ${euro(b.furnishings[id].price)}，限一件`,
      `Buy ${grFurnishingNames[id].en} (${en}) · ${euro(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'laiki-stroll',
    place: 'market',
    label: t(
      '在摊位间听小贩吆喝，尝一颗橄榄',
      'Wander the stalls, listen to the sellers and taste an olive',
    ),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.boardMood },
      { type: 'stat', key: 'greek', delta: 1 },
    ],
  },
  {
    id: 'assessment',
    place: 'council',
    label: t('请会计师看看评估', 'Ask the accountant for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'tax-return',
    place: 'council',
    label: t(
      '申报上一年度个人所得税（E1）',
      'File last year’s tax return (E1)',
    ),
    note: t(
      '入籍要核对递交前各税年的应税收入与税保记录。游戏里报税免费，只花时间；漏报的年度会让入籍评估待确认。',
      'Naturalisation checks taxable income and tax and insurance records for the tax years before filing. Filing is free in this game; a missing year leaves the naturalisation assessment open.',
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'taxReturn' }],
  },
  {
    id: 'kep-certify',
    place: 'kep',
    label: t(
      '认证文件签名（γνήσιο υπογραφής）',
      'Certify a signature (gnisio ypografis)',
    ),
    note: t(
      '续卡和入籍的材料常要认证签名。游戏里免费，只花时间。',
      'Renewal and naturalisation papers often need a certified signature. It is free in this game and only takes time.',
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'extend',
    place: 'visa',
    label: t('续期欧盟蓝卡', 'Renew the EU Blue Card'),
    note: t(
      `到期前 ${timing.renewalWindowMonths.value} 个月起可递交；到期后 ${timing.lateRenewalMonths.value} 个月内可逾期补交，每逾期一个月罚款 ${euro(timing.lateFinePerMonthEur.value)}（${src(timing.renewalWindowMonths)}）。游戏按季度计时：这一季碰到递交窗口就能提前递交；逾期月数与逾期补交的截止按办理当天计算，不足一个月按一个月计（PD-150）。本情景预设获批。`,
      `File from ${timing.renewalWindowMonths.value} months before expiry, or late for up to ${timing.lateRenewalMonths.value} months with a ${euro(timing.lateFinePerMonthEur.value)} fine per late month (${src(timing.renewalWindowMonths)}). The game counts in quarters, so you can file early in any quarter that reaches the window. Late months and the end of the late period count from the day you file, and a part month counts as a month (PD-150). The renewal is assumed granted.`,
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'renewal' }],
  },
  {
    id: 'report-change',
    place: 'visa',
    label: t('申报新住址', 'Report your new address'),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'change-report-due' }],
    effects: [{ type: 'reportChange' }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t('递交永久居留申请', 'Apply for permanent residence'),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  {
    id: 'naturalise',
    place: 'bureau',
    label: t(
      `递交入籍申请（申请费 ${euro(fees.naturalisation)}，${src(values.naturalisationFees)}）`,
      `Apply for naturalisation (fee ${euro(fees.naturalisation)}, ${src(values.naturalisationFees)})`,
    ),
    minutes: b.minutes.paperwork,
    effects: [
      { type: 'money', delta: -fees.naturalisation },
      { type: 'ending', ending: 'settled' },
    ],
  },
  ...([1, 3, 6] as const).map((months): GrActivity => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回国探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: t(
      '回程那天居留卡必须仍然有效。游戏按季度计时，回国后要到回程所在那一季的工作日才能再去移民局；蓝卡若在那天之前已过逾期补交截止，就没有一天能续卡，所以不提供这趟行程。出入境记录会计入长期居留和入籍的连续居住评估。',
      'Your residence card must still be valid on the day you return. The game counts in quarters, so after a trip the migration office is next open on the working day of the quarter you return in. If a Blue Card’s late renewal period ends before that day, no day would be left to renew it, so the trip is not offered. Trips count in the continuous residence checks for long-term residence and naturalisation.',
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
    label: t('离开希腊', 'Leave Greece'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('租一块市立菜园', 'Rent a municipal garden plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看报亭的告示', 'Read the kiosk notices'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐着看海', 'Sit and watch the sea'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季海滨步道健走会（${euro(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s seafront walking club (${euro(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'candle',
    place: 'green',
    label: t(
      '进教堂点一支蜡烛',
      'Light a candle in the church of Agios Nikolaos',
    ),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.candleCost },
      { type: 'stat', key: 'mood', delta: b.benchMood },
    ],
  },
  {
    id: 'festival',
    place: 'green',
    label: t('逛广场上的节日摊位', 'Wander the festival stalls'),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ dayKind: 'special' }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  },
  ...(
    [
      [
        'theophany',
        'cross-dive',
        '在码头为跳海抢十字架的人鼓掌',
        'Cheer the swimmers diving for the cross',
      ],
      [
        'easter',
        'egg-tapping',
        '和邻居碰红蛋：「基督复活了！」',
        'Crack red eggs with the neighbours: “Christ is risen!”',
      ],
      [
        'panigyri',
        'circle-dance',
        '跟着布祖基琴跳圆圈舞',
        'Join the circle dance to the bouzouki',
      ],
      [
        'ochi',
        'parade',
        '在海滨路为学生游行鼓掌',
        'Cheer the school parade on the seafront',
      ],
    ] as const
  ).map(([festival, id, zhCN, en]): GrActivity => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [
      { festival },
      {
        minuteMin: festival === 'panigyri' ? b.panigyriStart : b.festivalStart,
      },
    ],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
