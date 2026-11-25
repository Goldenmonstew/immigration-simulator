import type { GameEvent, Text } from '../../model';
import {
  addressDays,
  cite,
  values,
  type UsEffect,
  type UsFestival,
} from './rules';

type UsEvent = GameEvent<UsEffect, UsFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the block, on the L and by the lake. */
export const usEvents: UsEvent[] = [
  {
    id: 'us-street-sweeping',
    channel: 'morning',
    title: t('扫街日', 'Street sweeping day'),
    text: t(
      '一辆扫街车慢慢开过来，橙色牌子下面还停着一辆车。多洛蕾斯奶奶站在门廊上直摇头。',
      'A street sweeper crawls up the block, and a car is still parked under the orange sign. Grandma Dolores shakes her head from her porch.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'knock',
        label: t('帮忙去敲车主的门', 'Help knock on the owner’s door'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'dolores', delta: 15 },
        ],
      },
      {
        id: 'rush',
        label: t('挥挥手，赶高架车', 'Wave and run for the train'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'us-l-delay',
    channel: 'morning',
    title: t('高架车晚点', 'The L is running late'),
    text: t(
      '站台广播说前方有信号故障，红线晚点十五分钟。雨从铁轨的缝隙里滴下来。',
      'The platform announcement blames a signal problem: the Red Line is fifteen minutes late. Rain drips through the gaps in the tracks.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }, { dayKind: 'workday' }],
    choices: [
      {
        id: 'wait',
        label: t(
          '戴上耳机听一集公民题播客',
          'Put on a civics podcast and wait',
        ),
        effects: [
          { type: 'stat', key: 'english', delta: 1 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
      {
        id: 'bus',
        label: t('改坐公交，挤一挤', 'Squeeze onto a bus instead'),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'stat', key: 'health', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'us-transit-card',
    channel: 'place:station',
    title: t('交通卡余额不足', 'Low on the transit card'),
    text: t(
      '闸机“哔”一声把你拦下，屏幕上显示余额 $0.75。',
      'The turnstile beeps and stops you. The screen says $0.75 left.',
    ),
    weight: 2,
    choices: [
      {
        id: 'charge',
        label: t('充值 $20', 'Top up $20'),
        effects: [
          { type: 'money', delta: -20 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
      {
        id: 'walk',
        label: t('天气不错，走过去', 'Nice day; walk instead'),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'us-dibs',
    channel: 'morning',
    season: 1,
    title: t('车位上的椅子', 'A chair in the parking spot'),
    text: t(
      '夜里下了一场大湖效应雪。早上，门口刚铲干净的车位上摆了一把旧折叠椅。',
      'Lake-effect snow came overnight. By morning, a freshly shoveled parking spot out front has an old folding chair in it.',
    ),
    weight: 3,
    choices: [
      {
        id: 'shovel',
        label: t(
          '帮邻居一起铲完人行道',
          'Help the neighbors finish shoveling the sidewalk',
        ),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'dolores', delta: 10 },
        ],
      },
      {
        id: 'photo',
        label: t('拍张照片发给家里人', 'Snap a photo for family back home'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        note: t(
          '芝加哥人铲完雪会用椅子“占”车位，叫 dibs。',
          'Chicagoans save a shoveled-out spot with a chair. They call it “dibs.”',
        ),
      },
    ],
  },
  {
    id: 'us-green-river',
    channel: 'morning',
    season: 2,
    title: t('河水变绿了', 'The river turns green'),
    text: t(
      '今天是圣帕特里克节前的周末，市中心的河被染成了亮绿色。丹尼发来一张自拍，从帽子到袜子全是绿的。',
      'It is the weekend before St. Patrick’s Day, and the river downtown has been dyed bright green. Danny sends a selfie, green from hat to socks.',
    ),
    weight: 3,
    once: true,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'go',
        label: t('坐红线去桥上看', 'Ride the Red Line down to the bridge'),
        effects: [
          { type: 'money', delta: -5 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'danny', delta: 10 },
        ],
      },
      {
        id: 'skip',
        label: t(
          '人太多，回他一个绿色爱心',
          'Too crowded; send back a green heart',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'us-tax-day',
    channel: 'letter',
    season: 2,
    title: t('报税季', 'Tax season'),
    text: t(
      '雇主寄来的 W-2 和银行的 1099 摊了一桌。这个春天要把联邦和州税表报好。',
      'The W-2 from work and the bank’s 1099 cover the table. Federal and state returns are due this spring.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'file',
        label: t(
          '周末在线报完，存好回执',
          'File online at the weekend and keep the confirmation',
        ),
        effects: [
          { type: 'money', delta: -40 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
        note: t(
          '入籍申请会问你的报税记录。',
          'The naturalization application asks about your tax filings.',
        ),
      },
      {
        id: 'clinic',
        label: t(
          '去图书馆的免费报税站',
          'Use the free tax help at the library',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'fatima', delta: 10 },
        ],
      },
    ],
  },
  {
    id: 'us-siren-test',
    channel: 'morning',
    title: t('防空警报测试', 'Siren test'),
    text: t(
      '上午十点，街角的警报器响了起来。阿明从杂货店探出头：“别慌，每个月测试一次。”',
      'At 10 a.m. the siren on the corner wails. Minh leans out of the store: “Relax, they test it once a month.”',
    ),
    weight: 2,
    once: true,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'learn',
        label: t('问问龙卷风来了要躲哪里', 'Ask where to shelter in a tornado'),
        effects: [
          { type: 'stat', key: 'mood', delta: 1 },
          { type: 'friendship', npc: 'minh', delta: 10 },
        ],
      },
      {
        id: 'coffee',
        label: t('顺手买杯咖啡', 'Grab a coffee while you’re there'),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'us-farmers-market',
    channel: 'morning',
    season: 3,
    title: t('农夫市集', 'Farmers market'),
    text: t(
      '周六的停车场变成了农夫市集：密歇根的蓝莓、威斯康星的奶酪，还有一个人在拉手风琴。',
      'Saturday turns the parking lot into a farmers market: Michigan blueberries, Wisconsin cheese and someone playing an accordion.',
    ),
    weight: 3,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'berries',
        label: t(
          '买一盒蓝莓边走边吃',
          'Buy a box of blueberries to eat on the way',
        ),
        effects: [
          { type: 'money', delta: -6 },
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'browse',
        label: t('只是逛逛，听听音乐', 'Just browse and listen to the music'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'us-heat-wave',
    channel: 'morning',
    season: 3,
    title: t('热浪', 'Heat wave'),
    text: t(
      '气温冲到 97°F，公寓里的旧窗式空调呼呼作响。图书馆贴出告示：今天是降温中心。',
      'It hits 97°F and the old window unit wheezes. The library posts a sign: cooling center today.',
    ),
    weight: 2,
    when: [{ weather: 'sunny' }],
    choices: [
      {
        id: 'library',
        label: t(
          '带上题卡去图书馆蹭冷气',
          'Take your flashcards to the cool library',
        ),
        effects: [
          { type: 'stat', key: 'english', delta: 1 },
          { type: 'stat', key: 'health', delta: 1 },
        ],
      },
      {
        id: 'beach',
        label: t('去湖滩泡一下脚', 'Dip your feet in the lake'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'us-thunderstorm',
    channel: 'morning',
    season: 3,
    title: t('雷阵雨', 'Thunderstorm'),
    text: t(
      '半夜一声炸雷，整条街停电了。早上冰箱里的冰淇淋化成了一碗甜汤。',
      'A thunderclap at midnight knocked out the whole block’s power. By morning the ice cream is sweet soup.',
    ),
    weight: 2,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'share',
        label: t(
          '把快化的东西分给邻居',
          'Share the melting food with the neighbors',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'dolores', delta: 10 },
        ],
      },
      {
        id: 'diner',
        label: t('去小餐馆吃早餐', 'Get breakfast at the diner'),
        effects: [
          { type: 'money', delta: -12 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'us-ballgame',
    channel: 'phone',
    season: 3,
    title: t('棒球赛的票', 'Tickets to the ballgame'),
    text: t(
      '杰登的妈妈打来电话：小联盟决赛，杰登先发投手，多出一张票。',
      'Jayden’s mom calls: it’s the Little League final, Jayden is the starting pitcher, and there’s a spare ticket.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，带上一袋花生', 'Go, and bring a bag of peanuts'),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'jayden', delta: 25 },
        ],
      },
      {
        id: 'cheer',
        label: t('去不了，发一段加油视频', 'Can’t go; send a cheering video'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'jayden', delta: 10 },
        ],
      },
    ],
  },
  {
    id: 'us-voter-form',
    channel: 'morning',
    title: t('驾照窗口的问题', 'A question at the license counter'),
    text: t(
      '换驾照时，屏幕上跳出一个选项：“要顺便登记选民吗？”',
      'While renewing your driver’s license, the screen asks: “Would you like to register to vote?”',
    ),
    weight: 2,
    once: true,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'no',
        label: t(
          '选“否”，你还不是公民',
          'Choose “No” — you’re not a citizen yet',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        note: t(
          '只有美国公民可以登记投票。入籍以后再来登记。',
          'Only U.S. citizens can register to vote. Register after you naturalize.',
        ),
      },
      {
        id: 'ask',
        label: t('先问问窗口的工作人员', 'Ask the clerk first'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
        note: t(
          '工作人员说：只有美国公民可以登记投票。',
          'The clerk says: only U.S. citizens can register to vote.',
        ),
      },
    ],
  },
  {
    id: 'us-thanksgiving',
    channel: 'phone',
    season: 4,
    title: t('感恩节邀请', 'A Thanksgiving invitation'),
    text: t(
      '多洛蕾斯奶奶打来电话：“感恩节来我家吃火鸡，带一道你家乡的菜。”',
      'Grandma Dolores calls: “Come for turkey on Thanksgiving. Bring a dish from home.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'dish',
        label: t('答应，做一盘家乡菜', 'Say yes and cook something from home'),
        effects: [
          { type: 'money', delta: -25 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'dolores', delta: 25 },
        ],
      },
      {
        id: 'pie',
        label: t('答应，顺路买个南瓜派', 'Say yes and pick up a pumpkin pie'),
        effects: [
          { type: 'money', delta: -15 },
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'dolores', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'us-fall-back',
    channel: 'morning',
    season: 4,
    title: t('夏令时结束', 'Clocks fall back'),
    text: t(
      '手机自动跳回了一小时，你却按旧时间醒了。窗外天还黑着，湖面上一片雾。',
      'Your phone set itself back an hour, but you woke on the old time. It’s still dark, with fog on the lake.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'walk',
        label: t(
          '出门看湖上的日出',
          'Go out to watch the sunrise over the lake',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'health', delta: 1 },
        ],
      },
      {
        id: 'sleep',
        label: t('翻个身，多睡一小时', 'Roll over for the extra hour'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
    ],
  },
  {
    id: 'us-pier-ketchup',
    channel: 'place:pond',
    title: t('热狗摊的规矩', 'The hot dog stand rule'),
    text: t(
      '防波堤的热狗摊前，一个游客要番茄酱。摊主和弗兰克同时摇头。',
      'At the pier’s hot dog stand a tourist asks for ketchup. The vendor and Frank shake their heads in unison.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'local',
        label: t(
          '点一份“全套”，入乡随俗',
          'Order one “dragged through the garden” like a local',
        ),
        effects: [
          { type: 'money', delta: -6 },
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'frank', delta: 15 },
        ],
      },
      {
        id: 'laugh',
        label: t('只是笑着看热闹', 'Just enjoy the show'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'us-address-reminder',
    channel: 'morning',
    requires: ['address-report-due'],
    title: t('新地址', 'A new address'),
    text: t(
      '电费、网费都改好了地址。手机备忘录里还有最后一项：AR-11。',
      'The power and internet bills have your new address. One item is left in your phone notes: AR-11.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'note',
        label: t(
          '今晚回家就在线填',
          'File it online when you get home tonight',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
        note: t(
          `搬家后 ${addressDays} 天内向 USCIS 申报新地址，在线填写，不收费（${cite(values.address)}）。`,
          `Report a new address to USCIS within ${addressDays} days of moving, online and free (${cite(values.address)}).`,
        ),
      },
    ],
  },
  {
    id: 'system-interview-failed',
    channel: 'morning',
    title: t('面谈结果', 'Interview result'),
    text: t(
      '考官把一张通知递给你：这次还差一点，补考的日期会另行通知。安吉拉老师在短信里说：“下次一定。”',
      'The officer hands you a notice: not quite this time, and a retest date will follow. Ms Brooks texts: “Next time for sure.”',
    ),
    weight: 0,
    choices: [
      {
        id: 'again',
        label: t('回去继续上辅导课', 'Back to class'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    // Queued by afterQuarter when the shared quarter end returned the short
    // let, so the move back has a day to report from.
    id: 'system-lease-ended',
    channel: 'morning',
    title: t('短租到期', 'The short let ends'),
    text: t(
      '账户撑不起顶层公寓的房租，押金退回来了。今天你把箱子搬回原来的三层砖楼，新地址又要报给 USCIS。',
      'The account cannot carry the top-floor rent, so the deposit comes back. Today you carry the boxes back to the old three-flat, and USCIS needs the address again.',
    ),
    weight: 0,
    choices: [
      {
        id: 'move-back',
        label: t('搬回去', 'Move back'),
        effects: [{ type: 'moved' }],
      },
    ],
  },
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。社区诊所的医生说要休息几天，保险付了大半。',
      'A fever keeps you in bed. The clinic says to rest a few days; insurance covers most of it.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请病假，在家喝鸡汤', 'Take sick leave and have chicken soup'),
        effects: [
          { type: 'money', delta: -60 },
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
          { type: 'money', delta: -20 },
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
      '连续两季入不敷出。你把信用卡账单摊在桌上，一项一项划掉。',
      'Two quarters in the red. You spread the credit card statement on the table and cross things out line by line.',
    ),
    weight: 0,
    choices: [
      {
        id: 'cut',
        label: t('少去酒馆，自己带午饭', 'Fewer tavern nights, packed lunches'),
        effects: [
          { type: 'money', delta: 600 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬到便宜一点的公寓', 'Move to a cheaper apartment'),
        effects: [
          { type: 'money', delta: -300 },
          { type: 'stat', key: 'mood', delta: -4 },
          { type: 'moved' },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];

export const usSystemEvents = usEvents.filter(({ id }) =>
  id.startsWith('system-'),
);
export const usDailyEvents = usEvents.filter(
  ({ id }) => !id.startsWith('system-'),
);
