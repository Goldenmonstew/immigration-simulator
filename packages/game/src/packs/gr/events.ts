import type { GameEvent, Text } from '../../model';
import { values, type GrEffect, type GrFestival } from './rules';

type GrEvent = GameEvent<GrEffect, GrFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the seafront, in the market and at home. */
export const grEvents: GrEvent[] = [
  {
    id: 'gr-market-orange',
    channel: 'morning',
    title: t('菜市的吆喝', 'Calls at the market'),
    text: t(
      '卖橙子的大叔唱歌似的喊着价钱，看见你就多塞了一个：「给新邻居的！」',
      'The orange seller sings out his prices and tucks an extra one in your bag: “For the new neighbour!”',
    ),
    weight: 3,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'thanks',
        label: t(
          '用希腊语道谢：「Ευχαριστώ！」',
          'Thank him in Greek: “Efcharistó!”',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
      {
        id: 'buy',
        label: t('顺手买一袋柠檬', 'Buy a bag of lemons too'),
        effects: [
          { type: 'money', delta: -2 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'gr-tram-strike',
    channel: 'morning',
    title: t('罢工日', 'Strike day'),
    text: t(
      '电车站贴着通知：今天交通罢工，电车停运到下午。站台上的人都在打电话叫车。',
      'A notice at the tram stop: transport strike, no trams until the afternoon. Everyone on the platform is phoning for a lift.',
    ),
    weight: 2,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'walk',
        label: t('沿着海边走去上班', 'Walk to work along the sea'),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
      {
        id: 'taxi',
        label: t('和邻居拼一辆出租车', 'Share a taxi with a neighbour'),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'gr-heatwave',
    channel: 'morning',
    season: 3,
    title: t('热浪', 'Heatwave'),
    text: t(
      '早上八点就三十多度了。百叶窗全拉上，屋里只剩风扇的嗡嗡声。',
      'It’s over thirty by eight in the morning. Every shutter is closed and only the fan hums.',
    ),
    weight: 3,
    choices: [
      {
        id: 'stay',
        label: t(
          '中午不出门，冰西瓜当午饭',
          'Stay in at midday; cold watermelon for lunch',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
      {
        id: 'library',
        label: t('躲进图书馆的冷气阅览室', 'Hide in the library’s cool room'),
        effects: [
          { type: 'stat', key: 'greek', delta: 1 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'gr-meltemi',
    channel: 'place:home',
    season: 3,
    title: t('北风', 'The meltemi'),
    text: t(
      '一阵北风把阳台上晾的床单吹到了楼下埃莱妮的柠檬树上。',
      'A gust of meltemi blows your sheet off the balcony and into Eleni’s lemon tree.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'fetch',
        label: t('下楼去要回来，顺便聊聊', 'Go down to fetch it and chat'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'eleni', delta: 15 },
        ],
      },
      {
        id: 'pegs',
        label: t('买一包新衣夹', 'Buy more clothes pegs'),
        effects: [{ type: 'money', delta: -2 }],
      },
    ],
  },
  {
    id: 'gr-balcony-cat',
    channel: 'place:home',
    title: t('阳台上的客人', 'A guest on the balcony'),
    text: t(
      '那只叫「市长」的橘猫蹲在你的阳台栏杆上，盯着你手里的面包。',
      'The ginger cat they call the Mayor sits on your balcony rail, staring at your bread.',
    ),
    weight: 3,
    choices: [
      {
        id: 'feed',
        label: t('掰一小块给它', 'Share a little piece'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'eleni', delta: 10 },
        ],
      },
      {
        id: 'shoo',
        label: t('关上阳台门', 'Close the balcony door'),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
  {
    id: 'gr-kiosk-ticket',
    channel: 'place:board',
    title: t('报亭', 'The kiosk'),
    text: t(
      '报亭老板一边卖烟一边看足球直播，问你要不要顺便充值交通卡。',
      'The kiosk owner sells cigarettes with one eye on the football and asks if you want to top up your travel card.',
    ),
    weight: 2,
    choices: [
      {
        id: 'top-up',
        label: t('充值十欧', 'Top up ten euros'),
        effects: [{ type: 'money', delta: -10 }],
      },
      {
        id: 'chat',
        label: t('聊两句比分', 'Talk about the score'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'gr-neighbour-pie',
    channel: 'morning',
    title: t('楼下奶奶的菠菜派', 'Spinach pie from downstairs'),
    text: t(
      '门把手上挂着一个袋子，里面是还温热的菠菜派和一张纸条：「吃，你太瘦了。」',
      'A bag hangs on the door handle: warm spinach pie and a note. “Eat. You’re too thin.”',
    ),
    weight: 2,
    choices: [
      {
        id: 'eat',
        label: t('当早饭吃掉', 'Have it for breakfast'),
        effects: [
          { type: 'stat', key: 'health', delta: 3 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
      {
        id: 'return',
        label: t(
          '洗干净盘子，装上水果还回去',
          'Return the dish with some fruit',
        ),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'gr-name-day',
    channel: 'morning',
    title: t('邻居的命名日', 'A neighbour’s name day'),
    text: t(
      '今天是同楼的乔治的命名日。在希腊，命名日比生日还热闹，门一直开着，谁都可以进去坐坐。',
      'It’s George’s name day upstairs. In Greece a name day beats a birthday: the door stays open and anyone can drop in.',
    ),
    weight: 2,
    choices: [
      {
        id: 'visit',
        label: t(
          '带一盒点心上楼说「Χρόνια πολλά」',
          'Take sweets up and say “Chronia polla”',
        ),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
      {
        id: 'message',
        label: t('发一条祝福短信', 'Send a message'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'gr-clean-monday',
    channel: 'morning',
    season: 2,
    title: t('洁净星期一', 'Clean Monday'),
    text: t(
      '大斋期第一天，全城都去山坡放风筝。餐桌上是芝麻扁面包、鱼子酱和卤蚕豆。',
      'The first day of Lent: the whole city flies kites on the hills. Lunch is lagana bread, taramosalata and beans.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'kite',
        label: t('买一只彩色纸风筝', 'Buy a paper kite'),
        effects: [
          { type: 'money', delta: -6 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
      {
        id: 'picnic',
        label: t('跟埃莱妮一家野餐', 'Picnic with Eleni’s family'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'eleni', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'gr-olive-harvest',
    channel: 'phone',
    season: 4,
    title: t('橄榄采收', 'Olive harvest'),
    text: t(
      '埃莱妮的表哥在山村有一片橄榄林：「周末来帮忙打橄榄，带一罐新油回去。」',
      'Eleni’s cousin has an olive grove in the hills. “Help with the harvest at the weekend and take home a tin of new oil.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'help',
        label: t('去，铺网、打枝、装袋', 'Go: nets, poles, sacks'),
        effects: [
          { type: 'item', item: 'olive-oil', delta: 1 },
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
      {
        id: 'decline',
        label: t('这周走不开', 'Can’t make it this week'),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
  {
    id: 'gr-first-rain',
    channel: 'morning',
    season: 4,
    title: t('第一场秋雨', 'The first autumn rain'),
    text: t(
      '下了一整夜雨，早上的海滨路全是泥土和松树的味道。菜园里的土终于松了。',
      'It rained all night. The seafront smells of earth and pine, and the garden soil is finally soft.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'walk',
        label: t('出门深吸一口气', 'Step out and breathe it in'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'gr-tax-season',
    channel: 'letter',
    season: 2,
    title: t('myAADE 的通知', 'A myAADE notice'),
    text: t(
      '税务平台发来通知：今年的个人所得税申报开放了。萨纳西斯的事务所门口已经排起了队。',
      'The tax portal says this year’s income tax returns are open. There’s already a queue at Thanasis’s door.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'book',
        label: t('先打电话约时间', 'Phone for an appointment'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        note: t(
          '入籍会按税年核对收入记录。到会计师事务所可以申报上一年度。',
          'Naturalisation checks income records year by year. File last year’s return at the accounting office.',
        ),
      },
    ],
  },
  {
    id: 'gr-quiet-hours',
    channel: 'place:home',
    title: t('午后的敲门声', 'A knock in the afternoon'),
    text: t(
      '你刚开始装书架，楼下的奶奶就上来敲门：「孩子，现在是午睡时间。」',
      'You’ve barely started on the bookshelf when the grandmother downstairs knocks. “Child, it’s siesta time.”',
    ),
    weight: 2,
    once: true,
    when: [{ minuteMin: 870 }, { minuteMax: 1050 }],
    choices: [
      {
        id: 'sorry',
        label: t('道歉，傍晚再装', 'Apologise and finish in the evening'),
        effects: [
          { type: 'stat', key: 'mood', delta: 1 },
          { type: 'stat', key: 'greek', delta: 1 },
        ],
      },
      {
        id: 'nap',
        label: t('干脆自己也睡一觉', 'Take a siesta yourself'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
    ],
  },
  {
    id: 'gr-dawn-swim',
    channel: 'morning',
    season: 3,
    title: t('清晨的海', 'The sea at dawn'),
    text: t(
      '天刚亮，海面平得像镜子。几个老人已经在游泳，招手让你也下来。',
      'At first light the sea is flat as glass. A few old swimmers are already in, waving you down.',
    ),
    weight: 3,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'swim',
        label: t('跳进去游一圈', 'Jump in for a swim'),
        effects: [
          { type: 'stat', key: 'health', delta: 4 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'watch',
        label: t('坐在岸边喝咖啡', 'Watch from the shore with a coffee'),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'gr-kep-queue',
    channel: 'place:kep',
    title: t('取号', 'Take a number'),
    text: t(
      '叫号屏停在 47，你手里是 63。黛丝皮娜在窗口后面朝你点点头：先把表格填好。',
      'The screen says 47; your ticket says 63. Despina nods from behind the counter: fill in the form while you wait.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'fill',
        label: t('一边等一边查字典填表', 'Fill it in with the dictionary'),
        effects: [
          { type: 'stat', key: 'greek', delta: 2 },
          { type: 'friendship', npc: 'despina', delta: 15 },
        ],
      },
      {
        id: 'later',
        label: t('改天早点来', 'Come back earlier another day'),
        effects: [{ type: 'stat', key: 'mood', delta: -1 }],
      },
    ],
  },
  {
    id: 'gr-fourteen-pay',
    channel: 'letter',
    season: 1,
    title: t('圣诞礼金', 'The Christmas bonus'),
    text: t(
      `工资单上多了一笔圣诞礼金。希腊的工资一年发 ${values.annualPayPeriods.value} 次，这是其中之一。`,
      `The payslip shows the Christmas bonus: Greek salaries are paid ${values.annualPayPeriods.value} times a year, and this is one of them.`,
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'save',
        label: t('存起来，留给续卡和考试', 'Save it for permits and exams'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
      {
        id: 'treat',
        label: t('请邻居们吃一顿', 'Treat the neighbours to dinner'),
        effects: [
          { type: 'money', delta: -60 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'stavros', delta: 20 },
        ],
      },
    ],
  },
];

/** Cards the engine queues for exams, illness, low mood and debt. */
export const grSystemEvents: GrEvent[] = [
  {
    id: 'system-exam-failed',
    channel: 'morning',
    title: t('考试结果', 'Exam result'),
    text: t(
      '这次考试差一点。卡捷琳娜在成绩单背面写：「听力进步很大，下次一定。」',
      'Not quite there this time. Katerina writes on the back of the result: “Big progress in listening. Next time.”',
    ),
    weight: 0,
    choices: [
      {
        id: 'again',
        label: t('报名下一期的课', 'Sign up for the next course'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。卫生中心的医生说要休息几天，开了单子让你去药房拿药。',
      'A fever keeps you in bed. The health centre says to rest a few days and sends you to the pharmacy.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t(
          '请假，在家喝柠檬鸡汤',
          'Take leave and have lemon chicken soup',
        ),
        effects: [
          { type: 'money', delta: -30 },
          { type: 'stat', key: 'health', delta: 25 },
          { type: 'stat', key: 'career', delta: -3 },
        ],
      },
    ],
  },
  {
    id: 'system-homesick',
    channel: 'morning',
    title: t('想家', 'Homesick'),
    text: t(
      '超市里放着老家的歌，你在货架前站了很久。',
      'A song from home plays in the supermarket, and you stand by the shelves for a long time.',
    ),
    weight: 0,
    choices: [
      {
        id: 'call',
        label: t('打视频电话回家', 'Video-call home'),
        effects: [{ type: 'stat', key: 'mood', delta: 25 }],
      },
      {
        id: 'cook',
        label: t('照着记忆做一道家乡菜', 'Cook a dish from home from memory'),
        effects: [
          { type: 'money', delta: -15 },
          { type: 'stat', key: 'mood', delta: 22 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'system-debt',
    channel: 'morning',
    forbids: ['quarter-housing-change'],
    title: t('账户见底', 'An empty account'),
    text: t(
      '连续两季入不敷出。你把银行账单摊在桌上，一项一项划掉。',
      'Two quarters in the red. You spread the bank statement on the table and cross things out line by line.',
    ),
    weight: 0,
    choices: [
      {
        id: 'cut',
        label: t(
          '少去小酒馆，自己带午饭',
          'Fewer taverna nights, packed lunches',
        ),
        effects: [
          { type: 'money', delta: 450 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬到更便宜的公寓', 'Move to a cheaper flat'),
        effects: [
          { type: 'money', delta: -250 },
          { type: 'stat', key: 'mood', delta: -4 },
          { type: 'moved' },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
