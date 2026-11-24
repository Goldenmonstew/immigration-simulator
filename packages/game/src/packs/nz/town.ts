import { nzResidentParameters } from '@uk-immigration/policy-data';
import type {
  Activity,
  Festival,
  Item,
  Place,
  Quarter,
  Recipe,
  Text,
} from '../../model';
import { nzBalance as b } from './balance';
import type { NzEffect, NzFestival } from './rules';

type NzActivity = Activity<NzEffect, NzFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
export const nzd = (value: number) =>
  `NZ$${Math.round(value).toLocaleString('en-GB')}`;
const fees = nzResidentParameters;

/**
 * Kererū Bay, a fictional North Island harbour town. Place IDs follow the
 * shared game shell: `visa` handles residence, `council` shows the
 * assessment, `green` hosts festivals, `pond` is for fishing and `allotment`
 * for plots.
 */
export const nzPlaces: Place[] = [
  { id: 'home', name: t('木板屋', 'Weatherboard flat'), kind: 'building' },
  {
    id: 'work',
    name: t('工作单位', 'Work'),
    kind: 'building',
    hours: { opens: 450, closes: 1200, dayKinds: ['workday'] },
  },
  {
    id: 'college',
    name: t('社区中心', 'Community centre'),
    kind: 'building',
    hours: { opens: 600, closes: 1260 },
  },
  {
    id: 'library',
    name: t('海湾图书馆', 'Bay library'),
    kind: 'building',
    hours: { opens: 540, closes: 1140 },
  },
  {
    id: 'gp',
    name: t('医疗中心', 'Medical centre'),
    kind: 'building',
    hours: { opens: 510, closes: 1050, dayKinds: ['workday'] },
  },
  {
    id: 'pub',
    name: t('码头酒馆', 'The Wharf Tavern'),
    kind: 'building',
    hours: { opens: 690, closes: 1410 },
  },
  {
    id: 'cafe',
    name: t('潮汐咖啡馆', 'Tide Café'),
    kind: 'building',
    hours: { opens: 420, closes: 930 },
  },
  {
    id: 'shop',
    name: t('街角小店', 'Corner dairy'),
    kind: 'building',
    hours: { opens: 420, closes: 1290 },
  },
  {
    id: 'chippy',
    name: t('炸鱼薯条店', 'Fish and chip shop'),
    kind: 'building',
    hours: { opens: 690, closes: 1260 },
  },
  {
    id: 'council',
    name: t('社区咨询处', 'Community advice centre'),
    kind: 'building',
    hours: { opens: 540, closes: 1020, dayKinds: ['workday', 'weekend'] },
  },
  {
    id: 'visa',
    name: t('移民局服务点', 'Immigration NZ office'),
    kind: 'building',
    hours: { opens: 540, closes: 960, dayKinds: ['workday'] },
  },
  {
    id: 'dia',
    name: t('内政部服务中心', 'Internal Affairs office'),
    kind: 'building',
    hours: { opens: 540, closes: 1020, dayKinds: ['workday'] },
  },
  {
    id: 'station',
    name: t('长途巴士站', 'Coach terminal'),
    kind: 'building',
    hours: { opens: 300, closes: 1440 },
  },
  ...(['allotment', 'pond', 'board', 'green', 'bench'] as const).map(
    (id, i): Place => ({
      id,
      kind: 'outdoor',
      name: [
        t('社区菜园', 'Community garden'),
        t('海湾码头', 'Harbour wharf'),
        t('社区告示板', 'Community noticeboard'),
        t('海湾公园', 'Bay domain'),
        t('海边长椅', 'Seaside bench'),
      ][i],
    }),
  ),
];

// Southern seasons by quarter: 1 summer, 2 autumn, 3 winter, 4 spring.
const crops: [string, string, string, Quarter[]][] = [
  ['turnip', '芜菁', 'Turnip', [2, 3]],
  ['potato', '土豆', 'Potato', [3, 4]],
  ['strawberry', '草莓', 'Strawberry', [4, 1]],
  ['tomato', '番茄', 'Tomato', [1]],
  ['cucumber', '黄瓜', 'Cucumber', [4, 1]],
  ['corn', '甜玉米', 'Sweetcorn', [1, 2]],
];

export const nzFish = [
  ['snapper', '真鲷（tāmure）', 'Snapper'],
  ['kahawai', '澳洲鲑（kahawai）', 'Kahawai'],
  ['trevally', '白鲹（trevally）', 'Trevally'],
  ['flounder', '比目鱼（pātiki）', 'Flounder'],
] as const;

export const nzItems: Item[] = [
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
  ...nzFish.map(([id, zhCN, en]): Item => ({
    id,
    name: { zhCN, en },
    kind: 'fish',
    edible: { health: b.food.fishHealth },
  })),
  {
    id: 'old-boot',
    name: t('一只旧雨靴（gumboot）', 'Old gumboot'),
    kind: 'junk',
  },
  {
    id: 'shopping-trolley',
    name: t('生锈的购物车', 'Rusty shopping trolley'),
    kind: 'junk',
  },
  {
    id: 'tea',
    name: t('一盒红茶', 'Box of tea'),
    kind: 'food',
    price: b.prices.tea,
    edible: { mood: b.food.teaMood },
  },
  {
    id: 'pie',
    name: t('肉末芝士派', 'Mince and cheese pie'),
    kind: 'food',
    price: b.prices.pie,
    edible: { mood: b.food.cropMood, health: b.food.cropHealth },
  },
  {
    id: 'anzac-biscuits',
    name: t('澳新军团饼干（Anzac）', 'Anzac biscuits'),
    kind: 'food',
    price: b.prices.biscuits,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'lamingtons',
    name: t('椰丝巧克力方蛋糕（lamington）', 'Lamingtons'),
    kind: 'gift',
    price: b.prices.lamingtons,
    edible: { mood: b.food.sweetMood },
  },
  {
    id: 'flowers',
    name: t('一小束花', 'A small bouquet'),
    kind: 'gift',
    price: b.prices.flowers,
  },
  { id: 'paua-shell', name: t('鲍鱼壳（pāua）', 'Pāua shell'), kind: 'gift' },
  ...(
    [
      ['sausage-sizzle', '香肠夹面包', 'Sausage sizzle'],
      ['panikeke', '汤加炸面团（panikeke）', 'Panikeke'],
      ['hangi', '地灶餐盒（hāngī）', 'Hāngī box'],
      ['candyfloss', '棉花糖', 'Candyfloss'],
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
      ['fish-and-chips', '自家炸鱼薯条', 'Home-made fish and chips'],
      ['corn-fritters', '玉米煎饼', 'Corn fritters'],
      ['roast-veg', '烤土豆拼盘', 'Roast potatoes'],
      ['vege-soup', '冬日芜菁汤', 'Winter turnip soup'],
      ['pavlova', '草莓奶油蛋白饼（pavlova）', 'Strawberry pavlova'],
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
export const nzRecipes: Recipe[] = [
  recipe('fish-and-chips', '炸一份鱼和薯条', 'Fry fish and chips', {
    snapper: 1,
    potato: 1,
  }),
  recipe('corn-fritters', '煎玉米饼', 'Make corn fritters', { corn: 1 }),
  recipe('roast-veg', '烤一盘土豆', 'Roast the potatoes', { potato: 1 }),
  recipe('vege-soup', '煮芜菁汤', 'Make turnip soup', { turnip: 1 }),
  recipe('pavlova', '做草莓 pavlova', 'Make a strawberry pavlova', {
    strawberry: 2,
  }),
  recipe('salad', '拌番茄黄瓜沙拉', 'Toss a tomato and cucumber salad', {
    tomato: 1,
    cucumber: 1,
  }),
];

// Dates by custom or the town's own calendar, not policy (see hooks.calendar):
// Waitangi Day on 6 February, the town's Pasifika festival on the third
// Saturday of March, its Matariki lantern night on the second Saturday of
// July and its A&P show on the second Saturday of November.
export const nzFestivals: Festival<NzFestival>[] = [
  {
    id: 'waitangi',
    season: 1,
    name: t('怀唐伊日家庭日', 'Waitangi Day family day'),
    text: t(
      '公园草地上铺满野餐毯。学校的孩子们在台上表演 kapa haka，冲浪救生队的志愿者在烤香肠，海风把歌声吹到码头。',
      'Picnic blankets cover the domain. Schoolchildren perform kapa haka on the stage, the surf club volunteers run the sausage sizzle, and the sea breeze carries the songs to the wharf.',
    ),
  },
  {
    id: 'pasifika',
    season: 2,
    name: t('太平洋岛民文化节', 'Pasifika festival'),
    text: t(
      '木鼓声从公园一直传到码头。Sione 的姑妈们在卖刚炸好的 panikeke，摊位上挂着树皮布（tapa）和花环。',
      'Log drums carry from the domain to the wharf. Sione’s aunties sell panikeke straight from the pan, and the stalls hang tapa cloth and flower garlands.',
    ),
  },
  {
    id: 'matariki',
    season: 3,
    name: t('Matariki 灯笼夜', 'Matariki lantern night'),
    text: t(
      '冬夜的公园挂满灯笼。大家念出这一年离开的人的名字，为新的一年许愿；地灶（hāngī）的热气从土坑里冒出来。',
      'Lanterns fill the domain on a winter night. People speak the names of those lost this year and make wishes for the new one, while steam rises from the hāngī pit.',
    ),
  },
  {
    id: 'ap-show',
    season: 4,
    name: t('海湾农牧展（A&P Show）', 'Kererū Bay A&P Show'),
    text: t(
      '剪羊毛比赛、小马跳障碍、评比最大的南瓜。棉花糖的甜味飘满公园，羊圈边挤满了看热闹的孩子。',
      'Shearing races, pony jumping and a prize for the biggest pumpkin. Candyfloss scents the domain and children crowd the sheep pens.',
    ),
  },
];
export const festivalFoods: Record<NzFestival, string> = {
  waitangi: 'sausage-sizzle',
  pasifika: 'panikeke',
  matariki: 'hangi',
  'ap-show': 'candyfloss',
};

export const nzNotices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'recycling',
    text: t(
      '回收箱隔周二收：玻璃瓶放蓝桶，塑料和纸放黄盖箱，早上 7 点前推到路边。',
      'Recycling goes out every other Tuesday: glass in the blue crate, plastics and paper in the yellow-lid bin, at the kerb by 7 a.m.',
    ),
  },
  {
    id: 'cleanup',
    text: t(
      '海滩清洁日：周末上午在码头集合，手套和袋子由社区中心提供。',
      'Beach clean-up: meet at the wharf on the weekend morning. The community centre brings gloves and bags.',
    ),
  },
  {
    id: 'drill',
    text: t(
      '地震演练：趴下、掩护、抓牢。看看海啸撤离路线，往山坡上走。',
      'Earthquake drill: drop, cover and hold. Check the tsunami route uphill.',
    ),
  },
  {
    id: 'tereo-class',
    text: t(
      '社区中心毛利语夜校，初学者欢迎，学费随意捐（koha）。',
      'Te reo Māori night class at the community centre. Beginners welcome; koha (a donation) as you can.',
    ),
  },
  {
    id: 'quiz',
    text: t(
      '码头酒馆周二问答夜，四人一队，奖品是一盘生蚝。',
      'Tuesday quiz night at the Wharf Tavern, teams of four, oysters for the winners.',
    ),
  },
  {
    id: 'fire-ban',
    season: 1,
    text: t(
      '夏季全面禁火：海滩不能生篝火，烧烤请用燃气炉。',
      'Summer fire ban: no beach fires. Use gas barbecues only.',
    ),
  },
  {
    id: 'matariki-workshop',
    season: 3,
    text: t(
      'Matariki 灯笼和风筝工作坊：周末在社区中心，材料免费。',
      'Matariki lantern and kite workshop at the community centre this weekend. Materials provided.',
    ),
  },
];

const tripNote = t(
  '出境期间旅行条件须一直有效：旅行条件到期时人在境外，居民签证就会失效（SRC-072 RV1.5）。',
  'Your travel conditions must stay valid for the whole trip: a resident visa expires if you are overseas when they end (SRC-072 RV1.5).',
);

export const nzActions: NzActivity[] = [
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
  ...(['home', 'library'] as const).map((place): NzActivity => ({
    id: `study-${place}`,
    place,
    label:
      place === 'home'
        ? t('听毛利语播客，背几个词', 'Learn te reo words with a podcast')
        : t('借毛利语绘本自学', 'Study te reo with picture books'),
    minutes: b.minutes.study,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'tereo', delta: b.studyTereo }],
  })),
  {
    id: 'rent-brighter-home',
    place: 'home',
    label: t(
      `搬到朝北、有双层玻璃的木屋（押金 ${nzd(b.housingDeposit)}、搬家 ${nzd(b.housingMoveCost)}，每季加租 ${nzd(b.housingRent)}；心情、健康持续改善；余额低时退租返押金）`,
      `Move to a north-facing, double-glazed house (${nzd(b.housingDeposit)} bond, ${nzd(b.housingMoveCost)} moving, +${nzd(b.housingRent)}/quarter; ongoing mood and health; a low balance ends the lease and returns the bond)`,
    ),
    note: t(
      '在南半球，朝北的房间阳光最好。',
      'In the southern hemisphere, north-facing rooms get the sun.',
    ),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'money', delta: -b.housingDeposit - b.housingMoveCost }],
  },
  {
    id: 'leave-brighter-home',
    place: 'home',
    label: t(
      '退租朝北的木屋，拿回押金',
      'Leave the north-facing house and recover the bond',
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
    label: t('多顶一个班', 'Pick up an extra shift'),
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
      `上毛利语夜校（koha ${nzd(b.classCost)}）`,
      `Join the te reo Māori night class (koha ${nzd(b.classCost)})`,
    ),
    minutes: b.minutes.class,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.classCost },
      { type: 'stat', key: 'tereo', delta: b.classTereo },
    ],
  },
  {
    id: 'gp',
    place: 'gp',
    label: t('看家庭医生', 'See the GP'),
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
    label: t(
      '一杯本地淡色艾尔和一篮薯角',
      'A local pale ale and a basket of wedges',
    ),
    minutes: b.minutes.relax,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.relaxCost },
      { type: 'stat', key: 'mood', delta: b.relaxMood },
    ],
  },
  {
    id: 'quiz-night',
    place: 'pub',
    label: t('参加周二问答夜', 'Join the Tuesday quiz night'),
    minutes: b.minutes.relax,
    oncePerDay: true,
    when: [{ dayKind: 'workday' }, { minuteMin: 1140 }],
    effects: [
      { type: 'money', delta: -b.quizCost },
      { type: 'stat', key: 'mood', delta: b.quizMood },
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
  {
    id: 'takeaway',
    place: 'chippy',
    label: t(
      '买一包炸鱼薯条，坐在海堤上吃',
      'Get fish and chips and eat them on the sea wall',
    ),
    minutes: b.minutes.relax,
    oncePerDay: true,
    effects: [
      { type: 'money', delta: -b.chipsCost },
      { type: 'stat', key: 'mood', delta: b.chipsMood },
    ],
  },
  ...[
    [
      'reading-chair',
      '二手单人沙发（每季心情、健康各加一点）',
      'second-hand armchair (+1 mood and health/quarter)',
    ],
    [
      'warm-curtains',
      '保暖窗帘（每季心情加一点）',
      'set of thermal curtains (+1 mood/quarter)',
    ],
    ['desk-lamp', '台灯（每季健康加一点）', 'desk lamp (+1 health/quarter)'],
  ].map(([id, zhCN, en]): NzActivity => ({
    id: `furnish-${id}`,
    place: 'board',
    minutes: b.minutes.buy,
    label: t(
      `按告示板上的转让启事买下${zhCN} · ${nzd(b.furnishings[id].price)}，限一件`,
      `Buy a ${en} from a noticeboard ad · ${nzd(b.furnishings[id].price)}, one per home`,
    ),
    effects: [{ type: 'money', delta: -b.furnishings[id].price }],
  })),
  {
    id: 'assessment',
    place: 'council',
    label: t(
      '请志愿者帮忙看看评估',
      'Ask a volunteer to go through the assessment',
    ),
    minutes: 0,
    effects: [{ type: 'none' }],
  },
  {
    id: 'settle',
    place: 'visa',
    label: t('申请永久居民签证', 'Apply for a permanent resident visa'),
    minutes: b.minutes.paperwork,
    effects: [{ type: 'ending', ending: 'settled' }],
  },
  {
    id: 'citizenship-info',
    place: 'dia',
    label: t(
      '问问入籍的条件和公民考试的消息',
      'Ask about citizenship and the planned test',
    ),
    minutes: b.minutes.board,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.boardMood }],
  },
  {
    id: 'naturalise',
    place: 'dia',
    label: t(
      `递交入籍申请（申请费 ${nzd(fees.grantFee.value.adult)}，SRC-234）`,
      `Apply for citizenship (fee ${nzd(fees.grantFee.value.adult)}, SRC-234)`,
    ),
    minutes: b.minutes.paperwork,
    effects: [
      { type: 'money', delta: -fees.grantFee.value.adult },
      { type: 'ending', ending: 'settled' },
    ],
  },
  ...([1, 3, 6] as const).map((months): NzActivity => ({
    id: `travel-${months}`,
    place: 'station',
    label: t(
      `坐机场巴士回家探亲 ${months} 个月`,
      `Take the airport coach to visit home for ${months} month${months === 1 ? '' : 's'}`,
    ),
    note: tripNote,
    minutes: 0,
    effects: [
      { type: 'money', delta: -b.travelCostPerMonth * months },
      { type: 'stat', key: 'mood', delta: b.travelMood },
    ],
  })),
  {
    id: 'leave',
    place: 'station',
    label: t('离开新西兰', 'Leave New Zealand'),
    minutes: 0,
    effects: [{ type: 'ending', ending: 'left' }],
  },
  {
    id: 'rent-plot',
    place: 'allotment',
    label: t('在社区菜园租一块地', 'Rent a community garden plot'),
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
    label: t('坐着看潮水', 'Sit and watch the tide'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    effects: [{ type: 'stat', key: 'mood', delta: b.benchMood }],
  },
  {
    id: 'walking-club',
    place: 'bench',
    label: t(
      `报名本季海岸步道徒步小组（${nzd(b.clubFee)}；本季心情、健康加成）`,
      `Join this quarter’s coastal walking group (${nzd(b.clubFee)}; mood and health this quarter)`,
    ),
    minutes: b.minutes.bench,
    effects: [{ type: 'money', delta: -b.clubFee }],
  },
  {
    id: 'wharf-jump',
    place: 'pond',
    label: t('从码头跳进海里', 'Jump off the wharf'),
    note: t('只在夏天的晴天开放。', 'Summer sunny days only.'),
    minutes: b.minutes.bench,
    oncePerDay: true,
    when: [{ weather: 'sunny' }],
    effects: [
      { type: 'stat', key: 'mood', delta: b.jumpMood },
      { type: 'stat', key: 'health', delta: b.jumpHealth },
    ],
  },
  {
    id: 'touch-rugby',
    place: 'green',
    label: t(
      '和邻居打一场触式橄榄球',
      'Play a game of touch rugby with the neighbours',
    ),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [{ dayKind: 'weekend' }],
    effects: [
      { type: 'stat', key: 'mood', delta: b.touchMood },
      { type: 'stat', key: 'health', delta: b.touchHealth },
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
        'waitangi',
        'waitangi-picnic',
        '铺开野餐毯，看 kapa haka 表演',
        'Spread a picnic blanket and watch the kapa haka',
      ],
      [
        'pasifika',
        'pasifika-dance',
        '跟着木鼓学几步舞',
        'Learn a few dance steps to the log drums',
      ],
      [
        'matariki',
        'matariki-lanterns',
        '提着灯笼走星光小径',
        'Walk the starlight trail with a lantern',
      ],
      [
        'ap-show',
        'shearing-cheer',
        '给剪羊毛比赛的选手加油',
        'Cheer on the shearing race',
      ],
    ] as const
  ).map(([festival, id, zhCN, en]): NzActivity => ({
    id,
    place: 'green',
    label: t(zhCN, en),
    minutes: b.minutes.festival,
    oncePerDay: true,
    when: [
      { festival },
      {
        minuteMin: festival === 'matariki' ? b.lanternStart : b.festivalStart,
      },
    ],
    effects: [{ type: 'stat', key: 'mood', delta: b.festivalMood }],
  })),
];
