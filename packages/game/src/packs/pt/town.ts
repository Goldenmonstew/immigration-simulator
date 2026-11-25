import {
  portugal2026_11,
  portugalFull2026_11,
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
import { ptBalance as b } from './balance';
import {
  cipleFee,
  declarationFee,
  type PtEffect,
  type PtFestival,
} from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const eur = (value: number) =>
  `€${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
const time = portugal2026_11.values;
const basicPortuguese = portugalFull2026_11.values.basicPortuguese.value;

/**
 * Andorinhas, a fictional bairro on a Lisbon hillside above the Tagus. Place
 * IDs follow the shared game shell: `visa` is the AIMA office, `council` shows
 * the assessment, `green` hosts festivals, `pond` is for fishing and
 * `allotment` for plots.
 */
export const ptPlaces: Place[] = [
  { id: 'home', name: t('公寓', 'Apartment'), kind: 'building' },
  {
    id: 'work',
    name: t('瓷砖厂工坊', 'The Tile Works'),
    kind: 'building',
    hours: { opens: 480, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('葡语课教室', 'Portuguese class'),
    kind: 'building',
    hours: { opens: 600, closes: 1260 },
  },
  {
    id: 'library',
    name: t('街区图书馆', 'Bairro library'),
    kind: 'building',
    hours: { opens: 540, closes: 1140 },
  },
  {
    id: 'gp',
    name: t('卫生中心', 'Health centre'),
    kind: 'building',
    hours: { opens: 480, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('街角小酒馆', 'Tasca da Esquina'),
    kind: 'building',
    hours: { opens: 720, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('燕子甜品店', 'Pastelaria Andorinha'),
    kind: 'building',
    hours: { opens: 450, closes: 1140 },
  },
  {
    id: 'shop',
    name: t('街角杂货铺', 'Corner mercearia'),
    kind: 'building',
    hours: { opens: 480, closes: 1260 },
  },
  {
    id: 'council',
    name: t('移民支援中心', 'Migrant support centre'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'ward',
    name: t('公民服务中心', 'Loja do Cidadão'),
    kind: 'building',
    hours: { opens: 510, closes: 1170, dayKinds: ['workday'] },
  },
  {
    id: 'visa',
    name: t('AIMA 窗口', 'AIMA office'),
    kind: 'building',
    hours: { opens: 540, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'bureau',
    name: t('民事登记处', 'Civil registry'),
    kind: 'building',
    hours: { opens: 540, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('燕子地铁站', 'Andorinhas Metro'),
    kind: 'building',
    hours: { opens: 390, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('社区菜园', 'Community garden'),
        t('特茹河岸', 'Tagus riverside'),
        t('堂区告示板', 'Parish notice board'),
        t('燕子广场', 'Largo das Andorinhas'),
        t('观景台', 'Miradouro'),
      ][i],
    }),
  ),
];

const crops: [string, string, string, Quarter[]][] = [
  ['turnip', '芜菁', 'Turnip', [1, 4]],
  ['potato', '土豆', 'Potato', [1, 2]],
  ['strawberry', '草莓', 'Strawberry', [2]],
  ['tomato', '番茄', 'Tomato', [3]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['corn', '玉米', 'Maize', [3, 4]],
];

export const ptFish = [
  ['tainha', '鲻鱼（tainha）', 'Grey mullet'],
  ['robalo', '狼鲈（robalo）', 'European sea bass'],
  ['dourada', '金头鲷（dourada）', 'Gilthead bream'],
  ['carapau', '竹荚鱼（carapau）', 'Horse mackerel'],
] as const;

export const ptItems: Item[] = [
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
  ...ptFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  {
    id: 'old-boot',
    name: t('一只旧帆布鞋', 'An old canvas shoe'),
    kind: 'junk',
  },
  {
    id: 'shopping-trolley',
    name: t('生锈的购物车', 'A rusty shopping trolley'),
    kind: 'junk',
  },
  {
    id: 'bica',
    name: t('一杯 bica 浓缩咖啡', 'A bica espresso'),
    kind: 'food',
    price: b.prices.bica,
    edible: { mood: b.food.teaMood },
  },
  {
    id: 'pastel-de-nata',
    name: t('葡式蛋挞', 'Pastel de nata'),
    kind: 'food',
    price: b.prices.nata,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'pao-de-lo',
    name: t('海绵蛋糕（pão de ló）', 'Pão de ló sponge'),
    kind: 'gift',
    price: b.prices.paoDeLo,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  {
    id: 'andorinha',
    name: t('陶瓷燕子', 'Ceramic swallow'),
    kind: 'gift',
  },
  {
    id: 'cravo',
    name: t('一朵红康乃馨', 'A red carnation'),
    kind: 'gift',
    price: b.prices.festival,
  },
  ...(
    [
      ['bolo-rei', '国王蛋糕（bolo-rei）', 'Bolo-rei'],
      ['sardinha', '面包夹烤沙丁鱼', 'Grilled sardine on bread'],
      ['castanhas', '烤栗子', 'Roast chestnuts'],
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
      ['caldo-verde', '菜叶土豆汤（caldo verde）', 'Caldo verde'],
      ['batatas-murro', '拳头土豆', 'Batatas a murro'],
      ['broa', '玉米面包（broa）', 'Broa corn bread'],
      ['peixe-grelhado', '烤鱼配土豆', 'Grilled fish and potatoes'],
      ['doce-morango', '草莓酱', 'Strawberry jam'],
      ['salada', '番茄黄瓜沙拉', 'Tomato and cucumber salad'],
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
export const ptRecipes: Recipe[] = [
  recipe('caldo-verde', '煮一锅菜叶土豆汤', 'Make caldo verde', {
    turnip: 1,
    potato: 1,
  }),
  recipe('batatas-murro', '烤拳头土豆', 'Roast batatas a murro', {
    potato: 1,
  }),
  recipe('broa', '烤玉米面包', 'Bake broa', { corn: 2 }),
  recipe('peixe-grelhado', '炭烤狼鲈配土豆', 'Grill sea bass with potatoes', {
    robalo: 1,
    potato: 1,
  }),
  recipe('doce-morango', '熬草莓酱', 'Make strawberry jam', { strawberry: 2 }),
  recipe('salada', '拌番茄黄瓜沙拉', 'Toss a tomato and cucumber salad', {
    tomato: 1,
    cucumber: 1,
  }),
];

// Customary dates, not policy: Dia de Reis on 6 January, Freedom Day on
// 25 April, the June arraiais of the Santos Populares and São Martinho on
// 11 November.
export const ptFestivals: Festival<PtFestival>[] = [
  {
    id: 'reis',
    season: 1,
    name: t('三王节与新年颂歌', 'Dia de Reis and the Janeiras'),
    text: t(
      '广场上摆着切开的国王蛋糕，街坊拿着手鼓和三角铁挨家唱新年颂歌（Janeiras），唱完主人会递出一把栗子或一杯热饮。',
      'Slices of bolo-rei wait on the square while neighbours with tambourines and triangles sing the Janeiras door to door. Each house answers with chestnuts or a warm drink.',
    ),
  },
  {
    id: 'cravos',
    season: 2,
    name: t('四月二十五日 · 康乃馨', '25 April · Carnations'),
    text: t(
      '自由日这天，花贩在广场分红康乃馨，人人别一朵在衣襟上。乐队吹起铜管，孩子们把花插进路灯杆上的小瓶子。',
      'On Freedom Day the flower sellers hand out red carnations and everyone pins one on. The brass band strikes up and children tuck flowers into jars on the lamp posts.',
    ),
  },
  {
    id: 'santos',
    season: 3,
    name: t('圣人节街坊晚会', 'Santos Populares arraial'),
    text: t(
      '六月的晚上，彩纸拉花挂满窄街，炭炉上烤着沙丁鱼，窗台上摆着一盆盆罗勒（manjerico）。手风琴一响，整条街都在跳。',
      'June nights: paper garlands across the lanes, sardines on the charcoal, pots of manjerico basil on the windowsills. When the accordion starts, the whole street dances.',
    ),
  },
  {
    id: 'magusto',
    season: 4,
    name: t('圣马丁烤栗子节', 'São Martinho magusto'),
    text: t(
      '十一月的广场上架起烤栗子的炭炉，烟呼呼往上冒。大人们说这几天的好天气叫「圣马丁的夏天」。',
      'Chestnut roasters smoke on the November square. The grown-ups call these few mild days “São Martinho’s summer”.',
    ),
  },
];
export const festivalFoods: Record<PtFestival, string> = {
  reis: 'bolo-rei',
  cravos: 'cravo',
  santos: 'sardinha',
  magusto: 'castanhas',
};

export const ptNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'ecoponto',
    text: t(
      '回收分类：黄桶塑料与金属，蓝桶纸，绿桶玻璃。大件垃圾请先给堂区打电话预约。',
      'Recycling: yellow for plastic and metal, blue for paper, green for glass. Call the parish before leaving out bulky items.',
    ),
  },
  {
    id: 'cleanup',
    text: t(
      '河岸清扫：周末上午在特茹河岸集合，自带手套，结束后甜品店请喝咖啡。',
      'Riverside clean-up: weekend morning on the Tagus bank, bring gloves. The pastelaria buys the coffees afterwards.',
    ),
  },
  {
    id: 'flea-market',
    text: t(
      '周六跳蚤市场：旧唱片、瓷砖碎片、铁皮玩具，广场摆摊免费。',
      'Saturday flea market: old records, tile fragments and tin toys. Stalls on the square are free.',
    ),
  },
  {
    id: 'pla',
    text: t(
      '社区中心葡语课开新班：会话、听力，也帮忙准备 CIPLE 考试。',
      'New Portuguese classes at the community centre: conversation and listening, with help for the CIPLE exam.',
    ),
  },
  {
    id: 'arraial',
    season: 3,
    text: t(
      '招募圣人节晚会志愿者：挂彩纸拉花、看炭炉、收空杯子。',
      'Volunteers wanted for the Santos arraial: hanging garlands, minding the grills, collecting cups.',
    ),
  },
  {
    id: 'storm',
    season: 1,
    text: t(
      '冬季风雨提醒：阳台花盆收进屋，晾衣绳上别挂太多。',
      'Winter storm reminder: bring balcony pots in and keep the washing line light.',
    ),
  },
];

/** The shared furniture, as the mercearia sells it. */
export const ptFurnishingNames: Record<string, Text> = {
  'reading-chair': t('藤编扶手椅', 'Wicker armchair'),
  'warm-curtains': t('亚麻窗帘', 'Linen curtains'),
  'desk-lamp': t('陶瓷台灯', 'Ceramic lamp'),
};

const {
  residenceRightMonths,
  temporaryAbsenceMonths,
  temporaryAbsenceTotalMonths,
} = time;
const cardNote = t(
  `游戏不办理临时居留续期：参数表没有续期后新卡的有效期。居留卡到期后还有 ${residenceRightMonths.value} 个月居留权（SRC-126），这段时间过去后这一局结束。`,
  `The game does not renew temporary residence: the parameter tables have no validity for a renewed card. The right of residence runs ${residenceRightMonths.value} months after a card expires (SRC-126); when that has passed, this game ends.`,
);

export const ptActions: Activity<PtEffect, PtFestival>[] = [
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
    (place): Activity<PtEffect, PtFestival> => ({
      id: `study-${place}`,
      place,
      label: t('自学葡语', 'Study Portuguese'),
      minutes: b.minutes.study,
      oncePerDay: true,
      effects: [{ type: 'stat', key: 'portuguese', delta: b.studyPortuguese }],
    }),
  ),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到带阳台的老公寓（押金 ${eur(b.housingDeposit)}、搬家 ${eur(b.housingMoveCost)}，每季加租 ${eur(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to an old flat with a balcony (${eur(b.housingDeposit)} deposit, ${eur(b.housingMoveCost)} moving, +${eur(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the deposit)`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'money', delta: -b.housingDeposit - b.housingMoveCost }],
  },
  {
    id: 'leave-brighter-home',
    place: 'home',
    label: t(
      '退租带阳台的公寓，退回押金',
      'Leave the balcony flat and recover the deposit',
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
    label: t('加班赶工', 'Work late'),
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
    label: t('上葡语会话课', 'Join the Portuguese class'),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'portuguese', delta: b.classPortuguese },
    ],
  },
  {
    id: 'exam',
    place: 'college',
    label: t(
      `参加 CIPLE 考试（报名费 ${eur(cipleFee)}，SRC-482）`,
      `Sit the CIPLE exam (fee ${eur(cipleFee)}, SRC-482)`,
    ),
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'money', delta: -cipleFee }],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t('看家庭医生', 'See the family doctor'),
    note: t(
      '游戏里看病不收费，只花时间。',
      'In this game the visit is free and only takes time.',
    ),
    minutes: b.minutes.gp,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'health', delta: b.gpHealth }],
  },
  {
    id: 'relax',
    place: 'pub',
    label: t('一杯绿酒配小吃', 'Vinho verde and petiscos'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.relaxCost },
      { type: 'stat', key: 'mood', delta: b.relaxMood },
    ],
  },
  {
    id: 'fado',
    place: 'pub',
    label: t('关灯听一场法朵', 'Lights down for fado'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    when: [{ minuteMin: b.fadoStart }],
    effects: [
      { type: 'money', delta: -b.fadoCost },
      { type: 'stat', key: 'mood', delta: b.fadoMood },
    ],
  },
  {
    id: 'coffee',
    place: 'cafe',
    label: t('一杯 bica 配一个蛋挞', 'A bica and a pastel de nata'),
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
  ].map(([id, zhCN, en]): Activity<PtEffect, PtFestival> => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${ptFurnishingNames[id].zhCN}（${zhCN}） · ${eur(b.furnishings[id].price)}，限一件`,
      `Buy a ${ptFurnishingNames[id].en} (${en}) · ${eur(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t('请支援中心看看评估', 'Ask the support centre for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'criminal-record',
    place: 'ward',
    label: t(
      '申请葡萄牙无犯罪记录证明',
      'Request a Portuguese criminal record certificate',
    ),
    note: t(
      '永久居留要附上无犯罪记录证明（SRC-471 DR 84/2007 art. 64）。游戏里证明免费，只花时间。',
      'Permanent residence needs a criminal record certificate (SRC-471, DR 84/2007 art. 64). In this game the certificate is free and only takes time.',
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'record' }],
  },
  {
    id: 'ss-statement',
    place: 'ward',
    label: t('打印社保缴费记录', 'Print your social security record'),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t('递交永久居留申请', 'Apply for permanent residence'),
    note: cardNote,
    minutes: b.minutes.paperwork,
    effects: [{ type: 'feePaid' }, { type: 'ending', ending: 'settled' }],
  },
  {
    id: 'declaration-papers',
    place: 'bureau',
    label: t(
      '预约并整理国籍声明材料',
      'Book an appointment and sort the declaration papers',
    ),
    note: t(
      '声明要附出生证明、婚姻登记和无犯罪记录证明（SRC-483）。游戏里只花时间。',
      'The declaration needs birth, marriage and criminal record papers (SRC-483). In this game it only takes time.',
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'declarationPapers' }],
  },
  {
    id: 'declare',
    place: 'bureau',
    label: t(
      `递交婚姻取得国籍声明（手续费 ${eur(declarationFee)}，SRC-488）`,
      `Make the nationality declaration by marriage (fee ${eur(declarationFee)}, SRC-488)`,
    ),
    minutes: b.minutes.paperwork,
    effects: [
      { type: 'money', delta: -declarationFee },
      { type: 'ending', ending: 'settled' },
    ],
  },
  ...([1, 3, 6] as const).map((months): Activity<PtEffect, PtFestival> => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回乡探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: t(
      `须在居留卡到期前回来。每张临时许可期内连续出境 ${temporaryAbsenceMonths.value} 个月、或累计 ${temporaryAbsenceTotalMonths.value} 个月，许可可能被注销（SRC-123 art. 85）。`,
      `Come back before your card expires. An absence of ${temporaryAbsenceMonths.value} months in a row, or ${temporaryAbsenceTotalMonths.value} months in all, during a temporary permit may lead to its cancellation (SRC-123 art. 85).`,
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
    label: t('离开葡萄牙', 'Leave Portugal'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('在社区菜园认领一块地', 'Rent a community garden plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看堂区告示', 'Read the parish notices'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐在观景台看河', 'Sit at the miradouro and watch the river'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季河边慢跑团（${eur(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s riverside running club (${eur(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'sueca',
    place: 'green',
    label: t('看街坊老人打纸牌', 'Watch the old men’s card game'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    when: [{ minuteMin: 840 }],
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
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
        'reis',
        'janeiras',
        '跟着街坊挨家唱颂歌',
        'Sing the Janeiras door to door',
      ],
      [
        'cravos',
        'carnation',
        '别上康乃馨，跟着乐队走',
        'Pin on a carnation and follow the band',
      ],
      [
        'santos',
        'arraial',
        '在彩纸拉花下吃烤沙丁鱼、跳舞',
        'Eat sardines and dance under the garlands',
      ],
      ['magusto', 'magusto', '围着炭炉剥栗子', 'Peel chestnuts by the roaster'],
    ] as const
  ).map(([festival, id, zhCN, en]): Activity<PtEffect, PtFestival> => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [
      { festival },
      { minuteMin: festival === 'santos' ? b.arraialStart : b.festivalStart },
    ],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];

export { basicPortuguese, cardNote };
