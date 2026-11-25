import { unitedStatesFullSources } from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { usBalance as b } from './balance';
import {
  addressDays,
  cite,
  fees,
  timeValues,
  values,
  type UsEffect,
  type UsFestival,
} from './rules';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });
export const usd = (value: number) =>
  `$${Math.round(value).toLocaleString('en-US')}`;

/**
 * Lakebend, a fictional lakeside neighborhood on Chicago's North Side. Place
 * IDs follow the shared game shell: `visa` handles status paperwork, `council`
 * shows the assessment, `green` hosts festivals, `pond` is for fishing and
 * `allotment` for garden plots.
 */
export const usPlaces: Place[] = [
  {
    id: 'home',
    name: t('三层砖楼公寓', 'Three-flat apartment'),
    kind: 'building',
  },
  {
    id: 'work',
    name: t('写字楼', 'Office'),
    kind: 'building',
    hours: { opens: 540, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('社区学院', 'Community college'),
    kind: 'building',
    hours: { opens: 600, closes: 1260 },
  },
  {
    id: 'library',
    name: t('图书馆分馆', 'Branch library'),
    kind: 'building',
    hours: { opens: 540, closes: 1140 },
  },
  {
    id: 'gp',
    name: t('社区诊所', 'Community clinic'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('弗兰克酒馆', 'Frank’s Tavern'),
    kind: 'building',
    hours: { opens: 960, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('湖畔小餐馆', 'Lakeside Diner'),
    kind: 'building',
    hours: { opens: 420, closes: 1080 },
  },
  {
    id: 'shop',
    name: t('街角杂货店', 'Corner store'),
    kind: 'building',
    hours: { opens: 480, closes: 1320 },
  },
  {
    id: 'council',
    name: t('法律援助中心', 'Legal aid clinic'),
    kind: 'building',
    hours: { opens: 540, closes: 1080, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'visa',
    name: t('联邦大楼', 'Federal Building'),
    kind: 'building',
    hours: { opens: 480, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('高架站', 'L station'),
    kind: 'building',
    hours: { opens: 300, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('社区菜园', 'Community garden'),
        t('湖边防波堤', 'Lakefront pier'),
        t('街区告示板', 'Block club board'),
        t('湖湾公园', 'Lakebend Park'),
        t('湖滨步道长椅', 'Lakefront Trail bench'),
      ][i],
    }),
  ),
];

const crops: [string, string, string, Quarter[]][] = [
  ['turnip', '芜菁', 'Turnip', [1, 4]],
  ['potato', '土豆', 'Potato', [2]],
  ['strawberry', '草莓', 'Strawberry', [2]],
  ['tomato', '番茄', 'Tomato', [3]],
  ['cucumber', '黄瓜', 'Cucumber', [3]],
  ['corn', '玉米', 'Sweet corn', [3, 4]],
];

export const usFish = [
  ['perch', '黄鲈', 'Yellow perch'],
  ['bluegill', '蓝鳃太阳鱼', 'Bluegill'],
  ['coho', '银鲑', 'Coho salmon'],
  ['carp', '鲤鱼', 'Common carp'],
] as const;

const meal = (
  list: readonly (readonly [string, string, string])[],
  edible: Item['edible'],
  price?: number,
): Item[] =>
  list.map(([id, zhCN, en]) => ({
    id,
    name: { zhCN, en },
    kind: 'food',
    ...(price !== undefined && { price }),
    edible,
  }));

export const usItems: Item[] = [
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
  ...usFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  {
    id: 'old-boot',
    name: t('泡过水的雪地靴', 'Waterlogged snow boot'),
    kind: 'junk',
  },
  {
    id: 'shopping-trolley',
    name: t('被湖浪推上岸的购物车', 'Shopping cart washed up by the lake'),
    kind: 'junk',
  },
  {
    id: 'coffee',
    name: t('一杯滴滤咖啡', 'Cup of drip coffee'),
    kind: 'food',
    price: b.prices.coffee,
    edible: { mood: b.food.coffeeMood },
  },
  {
    id: 'cookies',
    name: t('巧克力豆曲奇', 'Chocolate chip cookies'),
    kind: 'food',
    price: b.prices.cookies,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'apple-pie',
    name: t('整只苹果派', 'Whole apple pie'),
    kind: 'gift',
    price: b.prices.pie,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  ...meal(
    [
      [
        'hot-dog',
        '芝加哥热狗（不加番茄酱）',
        'Chicago-style hot dog (no ketchup)',
      ],
    ],
    { mood: b.food.mealMood, health: 1 },
    b.prices.hotDog,
  ),
  ...meal(
    [
      ['cocoa', '热可可', 'Hot cocoa'],
      ['elote', '墨西哥烤玉米', 'Elote'],
      ['bbq-plate', '烧烤拼盘', 'Barbecue plate'],
      ['caramel-apple', '焦糖苹果', 'Caramel apple'],
    ],
    { mood: b.food.mealMood, health: 1 },
    b.prices.festival,
  ),
  ...meal(
    [
      ['mashed-potatoes', '土豆泥', 'Mashed potatoes'],
      ['corn-chowder', '玉米浓汤', 'Corn chowder'],
      ['fish-fry', '周五炸鱼', 'Friday fish fry'],
      ['strawberry-shortcake', '草莓奶油蛋糕', 'Strawberry shortcake'],
      ['garden-salad', '菜园沙拉', 'Garden salad'],
      ['potstickers', '芜菁锅贴', 'Turnip potstickers'],
    ],
    { mood: b.food.mealMood, health: b.food.mealHealth },
  ),
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
export const usRecipes: Recipe[] = [
  recipe('mashed-potatoes', '做土豆泥', 'Make mashed potatoes', { potato: 1 }),
  recipe('corn-chowder', '煮玉米浓汤', 'Make corn chowder', {
    corn: 1,
    potato: 1,
  }),
  recipe('fish-fry', '做一盘周五炸鱼', 'Fry up a Friday fish fry', {
    perch: 1,
    potato: 1,
  }),
  recipe(
    'strawberry-shortcake',
    '做草莓奶油蛋糕',
    'Bake a strawberry shortcake',
    { strawberry: 2 },
  ),
  recipe('garden-salad', '拌一盆菜园沙拉', 'Toss a garden salad', {
    tomato: 1,
    cucumber: 1,
  }),
  recipe('potstickers', '包芜菁锅贴', 'Fold turnip potstickers', { turnip: 2 }),
];

// Customary dates, not policy: New Year's Day plunges into the lake, Cinco de
// Mayo on 5 May, Independence Day on 4 July and Halloween on 31 October.
export const usFestivals: Festival<UsFestival>[] = [
  {
    id: 'polar-plunge',
    season: 1,
    name: t('新年跳湖', 'New Year’s polar plunge'),
    text: t(
      '新年第一天，湖滩上挤满了穿泳衣和戏服的人。救生员吹哨，大家尖叫着冲进冰冷的湖水，岸边的热可可冒着白气。',
      'On New Year’s Day the beach fills with swimsuits and costumes. The lifeguard whistles, everyone shrieks into the icy lake, and the hot cocoa steams on shore.',
    ),
  },
  {
    id: 'cinco-de-mayo',
    season: 2,
    name: t('五月五日街区节', 'Cinco de Mayo street fest'),
    text: t(
      '公园上空挂满彩色剪纸旗，马里亚奇乐队一开嗓，多洛蕾斯奶奶就拉着邻居跳起来。烤玉米摊前排起了长队。',
      'Papel picado flutters over the park. When the mariachi band starts, Grandma Dolores pulls the neighbors into a dance. The elote stand has a long line.',
    ),
  },
  {
    id: 'fourth-of-july',
    season: 3,
    name: t('独立日烟火', 'Fourth of July fireworks'),
    text: t(
      '白天有街区游行和后院烧烤，小孩举着星条旗跑来跑去。天黑以后，大家带着毯子去湖边等烟火。',
      'By day there is a block parade and backyard barbecue, kids running with little flags. After dark everyone carries blankets to the lake to wait for the fireworks.',
    ),
  },
  {
    id: 'halloween',
    season: 4,
    name: t('万圣节街区派对', 'Halloween block party'),
    text: t(
      '门廊上摆满了南瓜灯，蜘蛛网挂在栏杆上。傍晚，扮成恐龙和超级英雄的孩子们挨家挨户敲门：“不给糖就捣蛋！”',
      'Jack-o’-lanterns line the porches and cobwebs drape the railings. At dusk, dinosaurs and superheroes knock door to door: “Trick or treat!”',
    ),
  },
];
export const festivalFoods: Record<UsFestival, string> = {
  'polar-plunge': 'cocoa',
  'cinco-de-mayo': 'elote',
  'fourth-of-july': 'bbq-plate',
  halloween: 'caramel-apple',
};

export const usNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'street-sweeping',
    text: t(
      '街道清扫：每月第二个周三，橙色牌子那一侧不能停车。',
      'Street sweeping: second Wednesday of the month. No parking on the side with the orange signs.',
    ),
  },
  {
    id: 'block-party',
    text: t(
      '街区俱乐部例会：周四晚上 7 点，图书馆活动室，带一道菜。',
      'Block club meeting: Thursday 7 p.m. in the library meeting room. Bring a dish.',
    ),
  },
  {
    id: 'citizenship-class',
    text: t(
      '社区学院免费入籍辅导：英语口语、公民题、模拟面谈，周二周四晚上。',
      'Free citizenship class at the community college: speaking, civics questions and mock interviews, Tuesday and Thursday evenings.',
    ),
  },
  {
    id: 'garden-workday',
    text: t(
      '社区菜园义务劳动日：周六上午，有甜甜圈。',
      'Community garden workday: Saturday morning. Donuts provided.',
    ),
  },
  {
    id: 'snow-ban',
    season: 1,
    text: t(
      '冬季停车禁令：主干道下雪两英寸以上禁止停车，铲雪车要过。',
      'Winter parking ban: no parking on main streets after two inches of snow. The plows need through.',
    ),
  },
  {
    id: 'beach-season',
    season: 3,
    text: t(
      '湖滩开放：救生员在岗时才可下水，留意浪高旗。',
      'Beaches open: swim only while lifeguards are on duty, and watch the wave flags.',
    ),
  },
];

const civics = values.civicsTest.value;
const conditionsNote = t(
  `条件绿卡到期前 ${timeValues.conditionsWindowDays.value} 天内与配偶联名递交 I-751（${cite(timeValues.conditionsWindowDays)}），按寄出那天算。寄出后条件身份自动延续到 USCIS 裁定（${cite(timeValues.conditionsWindowDays)}）；USCIS 可能要求面谈，游戏不模拟这次裁定，评估按"申请待决"记录。收件通知把绿卡有效期延长多久，policy-data 还没有参数（PD-432），卡面到期后游戏不安排出境。`,
  `File a joint I-751 with your spouse in the ${timeValues.conditionsWindowDays.value} days before the conditional card expires (${cite(timeValues.conditionsWindowDays)}), counted on the day you mail it. Conditional status then continues until USCIS decides (${cite(timeValues.conditionsWindowDays)}); USCIS may ask for an interview, and the game does not simulate the decision, so the assessment records the petition as pending. How long the receipt notice extends the card is not in policy-data yet (PD-432), so the game books no trips past the card's date.`,
);
export const renewalNote = t(
  `绿卡到期前 ${values.address.value.renewalMonths} 个月内可用 I-90 换卡，纸本费用 ${usd(fees.i90.paper)}（${cite(values.address, 1)}；${cite(values.fees)}）。按寄出那天算。游戏不模拟 USCIS 的裁定，不写新卡；收件通知把绿卡有效期延长多久，policy-data 还没有参数（PD-432），卡面到期后游戏不安排出境。绿卡到期不会让永久居民身份失效。`,
  `Renew with Form I-90 within ${values.address.value.renewalMonths} months of expiry; the paper fee is ${usd(fees.i90.paper)} (${cite(values.address, 1)}; ${cite(values.fees)}). counted on the day you mail it. The game does not simulate the USCIS decision and records no new card; how long the receipt notice extends the card is not in policy-data yet (PD-432), so the game books no trips past the card's date. An expired card does not end permanent residence.`,
);
export const interviewNote = t(
  `面谈时考英语读、写、说，以及公民知识：${civics.current.bank} 题题库里问 ${civics.current.asked} 题，答对 ${civics.current.correct} 题通过（${cite(values.civicsTest)}）。没通过的部分在首次面谈后 ${civics.retestDays.earliest}–${civics.retestDays.latest} 天补考一次；游戏把补考安排在下一季，再没通过则 N-400 被拒，要重新递交。`,
  `The interview tests reading, writing and speaking English, and civics: ${civics.current.asked} questions from a bank of ${civics.current.bank}, with ${civics.current.correct} correct to pass (${cite(values.civicsTest)}). A failed part is retested once ${civics.retestDays.earliest}–${civics.retestDays.latest} days after the first interview; the game holds the retest next quarter, and failing it again denies the N-400, which you then file again.`,
);
const n400Note = t(
  `入籍所需居住年限满足前 ${timeValues.earlyFilingDays.value} 天起可以递交（${cite(timeValues.earlyFilingDays)}）。USCIS 会在之后安排面谈，游戏里最早下一季。`,
  `You can file up to ${timeValues.earlyFilingDays.value} days before the residence period is met (${cite(timeValues.earlyFilingDays)}). USCIS schedules the interview later; in the game, from next quarter.`,
);
const travelNote = t(
  `离境超过 ${timeValues.presumptionMonths.value} 个月，会推定中断入籍所需的连续居住（${cite(timeValues.presumptionMonths)}）；离开超过 ${timeValues.seekingAdmissionDays.value} 天再回来，入境时会被当作重新申请入境（${cite(timeValues.seekingAdmissionDays)}）。绿卡须在返美时仍有效。`,
  `An absence of more than ${timeValues.presumptionMonths.value} months is presumed to break the continuous residence naturalization needs (${cite(timeValues.presumptionMonths)}); after more than ${timeValues.seekingAdmissionDays.value} days away, you are treated as seeking admission on return (${cite(timeValues.seekingAdmissionDays)}). The green card must still be valid when you return.`,
);

type UsActivity = Activity<UsEffect, UsFestival>;
/** The shared furniture as the corner store sells it and the ending names it. */
export const usFurnishingNames: Record<string, Text> = {
  'reading-chair': t('旧货店的扶手椅', 'Thrift-store armchair'),
  'warm-curtains': t('保暖窗帘', 'Thermal curtains'),
  'desk-lamp': t('台灯', 'Desk lamp'),
};

export const usActions: UsActivity[] = [
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
  ...(
    [
      ['home', '刷公民题卡片', 'Flip through civics flashcards'],
      ['library', '在“公民角”自学', 'Study at the Citizenship Corner'],
    ] as const
  ).map(([place, zhCN, en]): UsActivity => ({
    id: `study-${place}`,
    place,
    label: t(zhCN, en),
    minutes: b.minutes.study,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'english', delta: b.studyEnglish }],
  })),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到能看见湖的顶层公寓（押金 ${usd(b.housingDeposit)}、搬家 ${usd(b.housingMoveCost)}，每季加租 ${usd(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a top-floor apartment with a lake view (${usd(b.housingDeposit)} deposit, ${usd(b.housingMoveCost)} moving, +${usd(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the deposit)`,
    ),
    note: t(
      `搬家后 ${addressDays} 天内向 USCIS 申报新地址（AR-11，${cite(values.address)}），搬完当天就能在家在线提交。`,
      `Report the new address to USCIS within ${addressDays} days of moving (AR-11, ${cite(values.address)}); you can file it online at home the same day.`,
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
      '退租顶层公寓，退回押金',
      'Leave the top-floor apartment and recover the deposit',
    ),
    minutes: b.minutes.paperwork,
    when: [{ flag: 'brighter-home' }],
    effects: [{ type: 'money', delta: b.housingDeposit }, { type: 'moved' }],
  },
  {
    id: 'address-report',
    place: 'home',
    label: t(
      '在线提交 AR-11 地址变更',
      'File the AR-11 change of address online',
    ),
    note: t(
      `免费，搬家后 ${addressDays} 天内（${cite(values.address)}）。`,
      `Free, within ${addressDays} days of moving (${cite(values.address)}).`,
    ),
    minutes: b.minutes.board,
    when: [{ flag: 'address-report-due' }],
    effects: [{ type: 'addressReport' }],
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
    label: t('加班', 'Work late'),
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
    label: t('上英语与入籍辅导课', 'Join the English and citizenship class'),
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
    label: t('看家庭医生', 'See the family doctor'),
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
    label: t('深盘披萨配一杯啤酒', 'Deep-dish pizza and a beer'),
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
    label: t(
      '续杯咖啡配一块樱桃派',
      'Bottomless coffee and a slice of cherry pie',
    ),
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
  ].map(([id, zhCN, en]): UsActivity => ({
    id: `furnish-${id}`,
    place: 'shop',
    minutes: b.minutes.buy,
    label: t(
      `添置${usFurnishingNames[id].zhCN}（${zhCN}） · ${usd(b.furnishings[id].price)}，限一件`,
      `Furnish: ${usFurnishingNames[id].en} (${en}) · ${usd(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t(
      '请法律援助中心看看评估',
      'Ask the legal aid clinic for an assessment',
    ),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'extend',
    place: 'visa',
    label: t(
      '在邮局窗口寄出 I-751',
      'Mail Form I-751 at the post office counter',
    ),
    note: conditionsNote,
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'i751' }],
  },
  {
    id: 'n400',
    place: 'visa',
    label: t(
      '在邮局窗口寄出入籍申请 N-400',
      'Mail the N-400 naturalization application',
    ),
    note: n400Note,
    minutes: b.minutes.paperwork,
    oncePerDay: true,
    effects: [{ type: 'n400' }],
  },
  {
    id: 'interview',
    place: 'visa',
    label: t(
      '到 USCIS 参加入籍面谈（英语与公民考试）',
      'Attend the USCIS naturalization interview (English and civics tests)',
    ),
    note: interviewNote,
    minutes: b.minutes.exam,
    oncePerDay: true,
    effects: [{ type: 'none' }],
  },
  {
    id: 'oath',
    place: 'visa',
    label: t('参加入籍宣誓典礼', 'Take the Oath of Allegiance'),
    note: t(
      `宣誓之后才成为美国公民（${cite({ sources: unitedStatesFullSources.oath })}）。`,
      `You become a U.S. citizen once you take the oath (${cite({ sources: unitedStatesFullSources.oath })}).`,
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  ...([1, 3, 6] as const).map((months): UsActivity => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `坐蓝线去机场，回家探亲 ${months} 个月`,
      `Ride the Blue Line to the airport and visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: travelNote,
    minutes: 0,
    effects: [
      { type: 'money', delta: -b.travelCostPerMonth * months },
      { type: 'stat', key: 'mood', delta: b.travelMood },
    ],
  })),
  {
    id: 'leave',
    place: 'station',
    label: t('离开美国', 'Leave the United States'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('租一块社区菜园的地', 'Rent a community garden plot'),
    minutes: b.minutes.rent,
    effects: [{ type: 'money', delta: -b.plotAnnualRent }],
  },
  {
    id: 'board',
    place: 'board',
    label: t('看看街区告示', 'Read the block club notices'),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'bench',
    place: 'bench',
    label: t('坐着看湖上的帆船', 'Watch the sailboats on the lake'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季湖滨步道跑团（${usd(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s Lakefront Trail running club (${usd(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'play-catch',
    place: 'green',
    label: t('和孩子们玩一会儿棒球传接', 'Play catch with the kids'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    when: [{ dayKind: 'weekend' }],
    effects: [
      { type: 'stat', key: 'mood', delta: b.catchMood },
      { type: 'stat', key: 'health', delta: b.catchHealth },
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
        'polar-plunge',
        'plunge',
        '尖叫着冲进冰冷的湖水',
        'Run screaming into the icy lake',
        b.festivalStart,
      ],
      [
        'cinco-de-mayo',
        'folklorico',
        '跟着马里亚奇乐队跳舞',
        'Dance to the mariachi band',
        b.festivalStart,
      ],
      [
        'fourth-of-july',
        'fireworks',
        '铺开毯子看湖上的烟火',
        'Spread a blanket and watch the fireworks over the lake',
        b.fireworksStart,
      ],
      [
        'halloween',
        'trick-or-treat',
        '给敲门的小怪物们发糖',
        'Hand out candy to the trick-or-treaters',
        b.trickOrTreatStart,
      ],
    ] as const
  ).map(([festival, id, zhCN, en, start]): UsActivity => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ festival }, { minuteMin: start }],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
export const festivalActions = [
  'plunge',
  'folklorico',
  'fireworks',
  'trick-or-treat',
];
