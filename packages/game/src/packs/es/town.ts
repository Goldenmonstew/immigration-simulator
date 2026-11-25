import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { esBalance as b } from './balance';
import type { EsEffect, EsFestival } from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const eur = (value: number) =>
  `€${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
const values = spainFull2026_11.values;
type EsActivity = Activity<EsEffect, EsFestival>;

/**
 * Vilamar, a fictional seaside neighbourhood of València. Place IDs follow
 * the shared game shell: `visa` handles residence, `council` shows the
 * assessment, `green` hosts festivals, `pond` is for fishing and `allotment`
 * for plots. Public offices keep Spanish morning hours.
 */
export const esPlaces: Place[] = [
  { id: 'home', name: t('公寓', 'Flat'), kind: 'building' },
  {
    id: 'work',
    name: t('港区', 'La Marina harbour'),
    kind: 'building',
    hours: { opens: 540, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('成人学校', 'Adult school'),
    kind: 'building',
    hours: { opens: 600, closes: 1260 },
  },
  {
    id: 'library',
    name: t('街区图书馆', 'Neighbourhood library'),
    kind: 'building',
    hours: { opens: 540, closes: 1230 },
  },
  {
    id: 'gp',
    name: t('卫生中心', 'Health centre'),
    kind: 'building',
    hours: { opens: 480, closes: 1260, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('托内特酒吧', 'Bar Tonet'),
    kind: 'building',
    hours: { opens: 450, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('欧洽塔铺', 'Orxateria Hermínia'),
    kind: 'building',
    hours: { opens: 600, closes: 1290 },
  },
  {
    id: 'shop',
    name: t('维拉马尔市场', 'Vilamar market'),
    kind: 'building',
    hours: { opens: 480, closes: 900, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'council',
    name: t('费雷尔代办所', 'Gestoria Ferrer'),
    kind: 'building',
    hours: { opens: 540, closes: 1140, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'ward',
    name: t('区政府服务处', 'District council office'),
    kind: 'building',
    hours: { opens: 510, closes: 840, dayKinds: ['workday'] },
  },
  {
    id: 'visa',
    name: t('外国人办公室', 'Immigration office'),
    kind: 'building',
    hours: { opens: 540, closes: 840, dayKinds: ['workday'] },
  },
  {
    id: 'bureau',
    name: t('民事登记处', 'Civil registry'),
    kind: 'building',
    hours: { opens: 540, closes: 840, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('维拉马尔电车站', 'Vilamar tram stop'),
    kind: 'building',
    hours: { opens: 330, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench', 'beach'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('街区菜园', 'Neighbourhood allotments'),
        t('防波堤', 'Breakwater'),
        t('街坊协会告示板', 'Residents’ notice board'),
        t('橙树广场', 'Plaça dels Tarongers'),
        t('海滨长椅', 'Seafront bench'),
        t('维拉马尔海滩', 'Vilamar beach'),
      ][i],
    }),
  ),
];

const crops: [string, string, string, Quarter[]][] = [
  ['tomato', '番茄', 'Tomato', [2, 3]],
  ['potato', '土豆', 'Potato', [1, 2, 4]],
  ['strawberry', '草莓', 'Strawberry', [1, 2]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['corn', '玉米', 'Sweetcorn', [3]],
];

export const esFish = [
  ['llobarro', '海鲈（llobarro）', 'Sea bass'],
  ['orada', '金头鲷（orada）', 'Gilt-head bream'],
  ['mujol', '鲻鱼（mújol）', 'Grey mullet'],
  ['sard', '白鲷（sard）', 'White seabream'],
  ['anguila', '鳗鱼（anguila）', 'Eel'],
] as const;

export const esItems: Item[] = [
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
  ...esFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  { id: 'old-boot', name: t('一只人字拖', 'A lost flip-flop'), kind: 'junk' },
  {
    id: 'shopping-trolley',
    name: t('漂来的沙滩桶', 'A drifting beach bucket'),
    kind: 'junk',
  },
  {
    id: 'rice',
    name: t('阿尔武费拉大米', 'Albufera rice'),
    kind: 'food',
    price: b.prices.rice,
  },
  {
    id: 'oranges',
    name: t('一袋橙子', 'A bag of oranges'),
    kind: 'food',
    price: b.prices.oranges,
    edible: { mood: b.food.snackMood, health: 1 },
  },
  {
    id: 'fartons',
    name: t('法尔通甜面包', 'Fartons'),
    kind: 'food',
    price: b.prices.fartons,
    edible: { mood: b.food.snackMood },
  },
  {
    id: 'turron',
    name: t('杏仁糖块（turrón）', 'Turrón'),
    kind: 'gift',
    price: b.prices.turron,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束康乃馨', 'A few carnations'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  ...(
    [
      ['roscon', '国王蛋糕', 'Roscón de Reyes'],
      ['bunyols', '南瓜炸面圈', 'Pumpkin bunyols'],
      ['coca-sant-joan', '圣胡安甜饼', 'Coca de Sant Joan'],
      ['massapa', '杏仁糖水果', 'Marzipan fruits'],
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
      ['all-i-pebre', '蒜椒炖鳗鱼', 'All i pebre'],
      ['tortilla-de-patatas', '土豆鸡蛋饼', 'Tortilla de patatas'],
      ['gazpacho', '番茄冷汤', 'Gazpacho'],
      ['arros-a-banda', '海鲜锅饭', 'Arròs a banda'],
      ['maduixes-amb-nata', '草莓配奶油', 'Strawberries and cream'],
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
export const esRecipes: Recipe[] = [
  recipe('all-i-pebre', '炖一锅蒜椒鳗鱼', 'Stew all i pebre', {
    anguila: 1,
    potato: 1,
  }),
  recipe('tortilla-de-patatas', '煎土豆鸡蛋饼', 'Make a tortilla de patatas', {
    potato: 2,
  }),
  recipe('gazpacho', '打一碗番茄冷汤', 'Blend a gazpacho', {
    tomato: 2,
    cucumber: 1,
  }),
  recipe('arros-a-banda', '做一锅海鲜锅饭', 'Cook an arròs a banda', {
    rice: 1,
    orada: 1,
  }),
  recipe('maduixes-amb-nata', '草莓淋上奶油', 'Top strawberries with cream', {
    strawberry: 2,
  }),
];

// Customary dates, not policy: the Three Kings parade on 5 January, the
// Fallas cremà on 19 March, Sant Joan’s night on 23 June and the Valencian
// Community’s day on 9 October.
export const esFestivals: Festival<EsFestival>[] = [
  {
    id: 'reis',
    season: 1,
    name: t('三王游行', 'Three Kings parade'),
    text: t(
      '傍晚，三王的花车从大街开到广场，骆驼是纸扎的，糖果是真的。孩子们举着袋子跟着跑。',
      'At dusk the Three Kings’ floats roll down the main street to the square. The camels are papier-mâché; the sweets are real. Children run alongside with open bags.',
    ),
  },
  {
    id: 'falles',
    season: 2,
    name: t('法雅节', 'Les Falles'),
    text: t(
      '广场中央立着街区的法雅雕塑，比两层楼还高。下午两点的 mascletà 震得窗玻璃嗡嗡响，今晚它就要烧掉。',
      'The neighbourhood falla towers over the square, taller than two storeys. The two o’clock mascletà rattles the windows, and tonight it all goes up in flames.',
    ),
  },
  {
    id: 'sant-joan',
    season: 3,
    name: t('圣胡安之夜', 'Nit de Sant Joan'),
    text: t(
      '天黑以后，海滩上一堆堆小篝火亮起来。有人把愿望写在纸上丢进火里，有人等着午夜去跳浪。',
      'After dark, small bonfires light up along the beach. Some throw wishes written on paper into the flames; others wait for midnight to jump the waves.',
    ),
  },
  {
    id: 'nou-octubre',
    season: 4,
    name: t('瓦伦西亚日', 'Nou d’Octubre'),
    text: t(
      '广场挂满红黄条纹的旗子。点心铺在卖杏仁糖做的小水果，按老习惯，用手帕包好送给心上的人。',
      'Red-and-yellow flags hang across the square. The pastry shop sells little marzipan fruits; by custom you wrap them in a handkerchief for someone you love.',
    ),
  },
];
export const festivalFoods: Record<EsFestival, string> = {
  reis: 'roscon',
  falles: 'bunyols',
  'sant-joan': 'coca-sant-joan',
  'nou-octubre': 'massapa',
};

export const esNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'recycling',
    text: t(
      '垃圾分类：黄色桶装塑料和罐头，蓝色桶装纸板，绿色桶装玻璃。晚上八点以后再放。',
      'Recycling: yellow bins for plastic and cans, blue for cardboard, green for glass. Put rubbish out after 8 p.m.',
    ),
  },
  {
    id: 'casal',
    text: t(
      '法雅协会会所招新：每周五晚上一起吃饭，欢迎新邻居。',
      'The falla association welcomes new members: dinner together every Friday night.',
    ),
  },
  {
    id: 'padron',
    text: t(
      '搬家了？请到区政府服务处更新住址登记（padrón）。',
      'Moved house? Update your registration (padrón) at the district council office.',
    ),
  },
  {
    id: 'language-exchange',
    text: t(
      '成人学校周四晚上有语言交换：西语、瓦伦西亚语、英语，带一种小吃来。',
      'Language exchange at the adult school on Thursday evenings: Spanish, Valencian, English. Bring a snack.',
    ),
  },
  {
    id: 'beach-cleanup',
    season: 3,
    text: t(
      '周日早上海滩清洁，九点在救生员塔集合，自带帽子。',
      'Beach clean-up on Sunday morning, meet at the lifeguard tower at nine. Bring a hat.',
    ),
  },
  {
    id: 'storm',
    season: 4,
    text: t(
      '秋季暴雨提醒：预警时别去河道和地下车库，留意市政通知。',
      'Autumn storm reminder: during warnings keep away from riverbeds and underground car parks, and follow council alerts.',
    ),
  },
];

/** The shared furniture, as the Vilamar market sells it. */
export const esFurnishingNames: Record<string, Text> = {
  'reading-chair': t('藤编摇椅', 'Wicker rocking chair'),
  'warm-curtains': t('木百叶遮阳帘', 'Wooden shutter blinds'),
  'desk-lamp': t('台灯', 'Desk lamp'),
};

export const esActions: EsActivity[] = [
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
    label: t('睡个午觉（siesta）', 'Have a siesta'),
    minutes: b.minutes.nap,
    oncePerDay: true,
    effects: [
      { type: 'stat', key: 'mood', delta: b.napMood },
      { type: 'stat', key: 'health', delta: b.napHealth },
    ],
  },
  ...(['home', 'library'] as const).map((place): EsActivity => ({
    id: `study-${place}`,
    place,
    label: t('自学西语', 'Study Spanish'),
    minutes: b.minutes.study,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'spanish', delta: b.studySpanish }],
  })),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到带阳台的公寓（押金 ${eur(b.housingDeposit)}、搬家 ${eur(b.housingMoveCost)}，每季加租 ${eur(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a flat with a balcony (${eur(b.housingDeposit)} deposit, ${eur(b.housingMoveCost)} moving, +${eur(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the deposit)`,
    ),
    note: t(
      '搬家后要到区政府服务处更新住址登记（padrón）；入籍材料里的住址证明以它为准（SRC-321 art. 5）。',
      'After moving, update your padrón at the district council office; the address evidence for nationality relies on it (SRC-321 art. 5).',
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
      '退租带阳台的公寓，退回押金',
      'Leave the flat with a balcony and recover the deposit',
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
    label: t(
      '上西语课（成人学校，免费）',
      'Join the Spanish class (adult school, free)',
    ),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'spanish', delta: b.classSpanish }],
  },
  {
    id: 'ccse',
    place: 'college',
    label: t(
      `参加 CCSE 公民常识考试（报名费 ${eur(values.nationalityCcseFee.value)}，SRC-335）`,
      `Sit the CCSE civics exam (fee ${eur(values.nationalityCcseFee.value)}, SRC-335)`,
    ),
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'money', delta: -values.nationalityCcseFee.value }],
  },
  {
    id: 'dele',
    place: 'college',
    label: t(
      `参加 DELE A2 西语考试（${values.nationalityExamPriceYear.value} 年西班牙考点价 ${eur(values.nationalityDeleSpainFee.value)}，SRC-336）`,
      `Sit the DELE A2 Spanish exam (${values.nationalityExamPriceYear.value} price in Spain ${eur(values.nationalityDeleSpainFee.value)}, SRC-336)`,
    ),
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'money', delta: -values.nationalityDeleSpainFee.value }],
  },
  {
    id: 'cita-previa',
    place: 'library',
    label: t(
      '用图书馆的电脑抢外国人办公室的 cita previa',
      'Try for an immigration office cita previa on the library computers',
    ),
    note: t(
      '递交长期居留要先在网上预约窗口时间。号源少，可能要试好几次（游戏设定）。',
      'Filing for long-term residence needs an online appointment first. Slots are scarce, so it may take several tries (game setting).',
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'none' }],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t(
      '看家庭医生，顺路去药房',
      'See the family doctor and stop at the pharmacy',
    ),
    minutes: b.minutes.gp,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.gpCost },
      { type: 'stat', key: 'health', delta: b.gpHealth },
    ],
  },
  {
    id: 'almuerzo',
    place: 'pub',
    label: t(
      '来一份 almuerzo：夹肉面包、花生和咖啡',
      'Have an almuerzo: a sandwich, peanuts and coffee',
    ),
    minutes: b.minutes.relax,
    oncePerDay: true,
    when: [{ minuteMin: 570, minuteMax: 720 }],
    effects: [
      { type: 'money', delta: -b.almuerzoCost },
      { type: 'stat', key: 'mood', delta: b.almuerzoMood },
    ],
  },
  {
    id: 'relax',
    place: 'pub',
    label: t('来杯啤酒，点几样 tapas', 'A beer and a few tapas'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    when: [{ minuteMin: 1080 }],
    effects: [
      { type: 'money', delta: -b.relaxCost },
      { type: 'stat', key: 'mood', delta: b.relaxMood },
    ],
  },
  {
    id: 'coffee',
    place: 'cafe',
    label: t('一杯冰欧洽塔配法尔通', 'An iced horchata with fartons'),
    minutes: b.minutes.coffee,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.orxataCost },
      { type: 'stat', key: 'mood', delta: b.orxataMood },
    ],
  },
  ...[
    ['reading-chair', '每季心情、健康各加一点', '+1 mood and health/quarter'],
    ['warm-curtains', '每季心情加一点', '+1 mood/quarter'],
    ['desk-lamp', '每季健康加一点', '+1 health/quarter'],
  ].map(([id, zhCN, en]): EsActivity => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${esFurnishingNames[id].zhCN}（${zhCN}） · ${eur(b.furnishings[id].price)}，限一件`,
      `Buy a ${esFurnishingNames[id].en} (${en}) · ${eur(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t('请代办看看评估', 'Ask the gestor for an assessment'),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'padron',
    place: 'ward',
    label: t('更新住址登记（padrón）', 'Update your padrón registration'),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'padron-due' }],
    effects: [{ type: 'padron' }],
  },
  {
    id: 'padron-certificate',
    place: 'ward',
    label: t('开一份住址登记证明', 'Get a padrón certificate'),
    note: t(
      '游戏里证明免费，只花时间。',
      'In this game the certificate is free and only takes time.',
    ),
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t(
      `递交长期居留申请（EX-11；受理后缴费 ${eur(values.applicationFeeEur.value)}，SRC-325）`,
      `Apply for long-term residence (EX-11; fee after admission ${eur(values.applicationFeeEur.value)}, SRC-325)`,
    ),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'cita-booked' }],
    effects: [
      { type: 'money', delta: -values.applicationFeeEur.value },
      { type: 'filed' },
      { type: 'ending', ending: 'settled' },
    ],
  },
  {
    id: 'nat-papers',
    place: 'bureau',
    label: t(
      `办好原籍国的无犯罪证明和出生证明：海牙认证与宣誓翻译（代办与翻译费 ${eur(b.papersCost)}，游戏设定）`,
      `Get the home-country police and birth certificates apostilled and sworn-translated (agent and translation ${eur(b.papersCost)}, game setting)`,
    ),
    note: t(
      '入籍须提交原籍国刑事记录和出生证明，外国公共文书按条约认证并翻译（SRC-321 art. 5，SRC-322 anexo）。办好的材料从下一季的评估起计入。',
      'Nationality needs the home-country criminal record and birth certificate, with foreign public documents legalised and translated (SRC-321 art. 5, SRC-322 annex). The papers count from next quarter’s assessment.',
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'money', delta: -b.papersCost }, { type: 'papers' }],
  },
  {
    id: 'naturalise',
    place: 'bureau',
    label: t(
      `缴 790-026 并递交入籍申请（${eur(values.nationalityApplicationFee.value)}，SRC-323）`,
      `Pay the 790-026 and apply for nationality (${eur(values.nationalityApplicationFee.value)}, SRC-323)`,
    ),
    minutes: b.minutes.paperwork,
    effects: [
      { type: 'money', delta: -values.nationalityApplicationFee.value },
      { type: 'filed' },
      { type: 'ending', ending: 'settled' },
    ],
  },
  ...([1, 3, 6] as const).map((months): EsActivity => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `回国探亲 ${months} 个月`,
      `Visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: t(
      `须在居留卡到期前回来。长期居留的连续性看每次和累计的离境（SRC-083 art. 183.2）；入籍时，有离境记录的连续居留须由主管机关个案认定，游戏里会显示待确认（PD-100）。`,
      `Return before your residence card expires. Long-term residence counts each absence and the total (SRC-083 art. 183.2); for nationality, any absence leaves continuity to the authority, shown as unconfirmed in the game (PD-100).`,
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
    label: t('离开西班牙', 'Leave Spain'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('租一块街区菜园', 'Rent an allotment plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看街坊协会的告示', 'Read the residents’ notices'),
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
      `报名本季海滨晨跑小组（${eur(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s seafront running club (${eur(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'beach-walk',
    place: 'beach',
    label: t('光脚在沙滩上走一走', 'Walk barefoot along the sand'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.beachMood }],
  },
  {
    id: 'swim',
    place: 'beach',
    label: t('下海游一圈', 'Go for a swim'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    when: [{ minuteMin: 600, minuteMax: 1200 }],
    effects: [
      { type: 'stat', key: 'mood', delta: b.beachMood },
      { type: 'stat', key: 'health', delta: b.swimHealth },
    ],
  },
  {
    id: 'petanca',
    place: 'green',
    label: t(
      '和老人们打一局滚球（petanca）',
      'Play a round of petanca with the regulars',
    ),
    minutes: b.minutes.bench,
    oncePerDay: true,
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
        'cavalcada',
        'green',
        b.cavalcadaStart,
        '在路边接三王撒的糖果',
        'Catch sweets from the Kings’ parade',
      ],
      [
        'falles',
        'mascleta',
        'green',
        b.mascletaStart,
        '下午两点看 mascletà',
        'Feel the two o’clock mascletà',
      ],
      [
        'sant-joan',
        'sant-joan-waves',
        'beach',
        b.santJoanStart,
        '在篝火边许愿，跳过七道浪',
        'Make a wish by the bonfire and jump seven waves',
      ],
      [
        'nou-octubre',
        'mocadora',
        'green',
        b.festivalStart,
        '用手帕包一份杏仁糖水果',
        'Wrap marzipan fruits in a handkerchief',
      ],
    ] as const
  ).map(([festival, id, place, minuteMin, zhCN, en]): EsActivity => ({
    id,
    place,
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ festival }, { minuteMin }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
