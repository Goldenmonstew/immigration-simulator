import type { GameEvent, Text } from '../../model';
import type { DeEffect, DeFestival } from './rules';

type DeEvent = GameEvent<DeEffect, DeFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life in the Kiez: the courtyard, the canal, the S-Bahn. */
export const deEvents: DeEvent[] = [
  {
    id: 'de-bin-day',
    channel: 'morning',
    title: t('后院的垃圾桶', 'The courtyard bins'),
    text: t(
      '后院里，吉塞拉正把一个披萨盒从黄桶里拎出来：「纸盒子进蓝桶，亲爱的。」',
      'In the courtyard, Gisela lifts a pizza box out of the yellow bin. “Cardboard goes in the blue one, dear.”',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'sort',
        label: t('帮她把纸箱压平', 'Help her flatten the boxes'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'gisela', delta: 15 },
        ],
      },
      {
        id: 'rush',
        label: t(
          '道声早安，赶 S 线',
          'Say good morning and run for the S-Bahn',
        ),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'de-pfand',
    channel: 'place:shop',
    title: t('一袋押金瓶', 'A bag of deposit bottles'),
    text: t(
      '阳台上攒了一大袋空瓶。穆拉特指指门口：「回收机在超市，这些押金够你喝两瓶汽水。」',
      'A whole bag of empties has piled up on the balcony. Murat points at the door: “The return machine’s at the supermarket. That deposit buys you two sodas.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'return',
        label: t(
          '拎去机器里一个个塞进去',
          'Feed them into the machine one by one',
        ),
        effects: [
          { type: 'money', delta: 4 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
      {
        id: 'leave',
        label: t(
          '放在垃圾桶旁边，留给需要的人',
          'Leave them beside the bin for whoever needs them',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        note: t(
          '在德国，把押金瓶放在垃圾桶旁是常见的分享方式。',
          'In Germany, leaving deposit bottles next to a bin is a common way to share them.',
        ),
      },
    ],
  },
  {
    id: 'de-sbahn-delay',
    channel: 'morning',
    title: t('S 线又停了', 'The S-Bahn stops again'),
    text: t(
      '雨打在站台顶棚上。显示屏写着「Zugausfall」，下一班二十分钟后。',
      'Rain drums on the platform roof. The board says “Zugausfall”; the next train is in twenty minutes.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }, { dayKind: 'workday' }],
    choices: [
      {
        id: 'wait',
        label: t(
          '站着读完一篇德语新闻',
          'Read a German news article while you wait',
        ),
        effects: [
          { type: 'stat', key: 'german', delta: 1 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
      {
        id: 'bus',
        label: t('改坐公交，挤一挤', 'Squeeze onto a bus instead'),
        effects: [{ type: 'stat', key: 'health', delta: -1 }],
      },
    ],
  },
  {
    id: 'de-parcel',
    channel: 'morning',
    title: t('包裹在邻居家', 'The parcel is next door'),
    text: t(
      '门上贴着快递员的黄纸条：「包裹已交给三楼左侧邻居」。三楼左侧是谁来着？',
      'A yellow slip on the door: “Parcel left with neighbour, 3rd floor left.” Who lives on the third floor, left?',
    ),
    weight: 2,
    choices: [
      {
        id: 'knock',
        label: t('上楼敲门，顺便认识一下', 'Knock and say hello'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
      {
        id: 'later',
        label: t('晚上再去拿', 'Pick it up this evening'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'de-heating',
    channel: 'morning',
    season: 1,
    title: t('暖气不热', 'The radiator is cold'),
    text: t(
      '早上醒来，暖气片冰凉。房东的邮件回得很快：修理工周三上午到，请在家等。',
      'You wake to a cold radiator. The landlord replies quickly: the repairman comes Wednesday morning, please be in.',
    ),
    weight: 3,
    choices: [
      {
        id: 'wait',
        label: t('请半天假在家等', 'Take half a day off to wait'),
        effects: [
          { type: 'stat', key: 'career', delta: -1 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'neighbour',
        label: t('把钥匙交给吉塞拉帮忙开门', 'Leave the key with Gisela'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'gisela', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'de-lueften',
    channel: 'place:home',
    season: 1,
    title: t('开窗通风', 'Airing the flat'),
    text: t(
      '窗角有一点霉斑。楼下的吉塞拉说：每天开大窗五分钟，比一直开一条缝管用。',
      'A spot of mould in the window corner. Gisela from downstairs says: open the windows wide for five minutes a day, better than leaving one ajar.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'air',
        label: t('定个闹钟，每天通风', 'Set a daily alarm to air the flat'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
    ],
  },
  {
    id: 'de-silvester',
    channel: 'morning',
    season: 1,
    title: t('新年夜的烟花', 'New Year’s Eve fireworks'),
    text: t(
      '午夜一过，整个街区都在放烟花，运河上的天空一片通红。第二天一早，人行道上全是纸屑。',
      'After midnight the whole Kiez sets off fireworks and the sky over the canal glows red. Next morning the pavements are covered in paper.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'sweep',
        label: t('拿扫帚帮楼前扫干净', 'Sweep the front of the building'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'gisela', delta: 10 },
        ],
      },
      {
        id: 'sleep',
        label: t('睡到中午', 'Sleep until noon'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
    ],
  },
  {
    id: 'de-spargel',
    channel: 'place:green',
    season: 2,
    title: t('白芦笋季', 'Asparagus season'),
    text: t(
      '集市上一整个摊位都是白芦笋，摊主说今年的特别甜。旁边的人已经在讨论配什么酱。',
      'A whole market stall of white asparagus. The farmer says this year’s is especially sweet; the people next to you are already debating sauces.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'buy',
        label: t(
          '买一把，回家配土豆和黄油',
          'Buy a bundle for potatoes and butter',
        ),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'look',
        label: t(
          '学一句「Spargelzeit」就走',
          'Learn the word “Spargelzeit” and move on',
        ),
        effects: [{ type: 'stat', key: 'german', delta: 1 }],
      },
    ],
  },
  {
    id: 'de-freibad',
    channel: 'phone',
    season: 3,
    title: t('三十四度', 'Thirty-four degrees'),
    text: t(
      '秋庄发来消息：「露天泳池今天排长队，可是水很凉！一起去吗？」',
      'Trang texts: “Long queue at the open-air pool today, but the water is cold! Coming?”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'swim',
        label: t('去，带上西瓜', 'Go, and bring a watermelon'),
        effects: [
          { type: 'money', delta: -5 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'trang', delta: 15 },
        ],
      },
      {
        id: 'shade',
        label: t(
          '在运河边的树荫下躲一下午',
          'Spend the afternoon in the canal shade',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'de-thunderstorm',
    channel: 'morning',
    season: 3,
    title: t('夏夜雷雨', 'Summer thunderstorm'),
    text: t(
      '半夜一场雷雨，后院的晾衣绳上还挂着你的床单。',
      'A thunderstorm in the night, and your sheets are still on the courtyard washing line.',
    ),
    weight: 2,
    choices: [
      {
        id: 'rewash',
        label: t('重新洗一遍', 'Wash them again'),
        effects: [{ type: 'stat', key: 'mood', delta: -1 }],
      },
      {
        id: 'laugh',
        label: t('拍张照发给家里人', 'Send a photo home'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'de-leaves',
    channel: 'morning',
    season: 4,
    title: t('落叶和栗子', 'Leaves and chestnuts'),
    text: t(
      '楼前的七叶树掉了一地栗子。莱昂蹲在人行道上，口袋已经装满了。',
      'The horse chestnut outside has dropped its conkers. Leon is crouched on the pavement, pockets already full.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'help',
        label: t(
          '帮他捡，教他用栗子做小人',
          'Help collect and make conker figures',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'leon', delta: 20 },
        ],
      },
      {
        id: 'walk',
        label: t('踩着落叶去上班', 'Crunch through the leaves to work'),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
  {
    id: 'de-clock-change',
    channel: 'morning',
    season: 4,
    title: t('多出来的一小时', 'An extra hour'),
    text: t(
      '夏令时结束了。手机自己改了时间，厨房的钟还停在昨天。',
      'Summer time has ended. Your phone changed by itself; the kitchen clock is still on yesterday.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'sleep',
        label: t('多睡一小时', 'Sleep the extra hour'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
      {
        id: 'study',
        label: t('用这一小时背单词', 'Use it to learn vocabulary'),
        effects: [{ type: 'stat', key: 'german', delta: 1 }],
      },
    ],
  },
  {
    id: 'de-termin',
    channel: 'place:ward',
    title: t('抢预约', 'Booking an appointment'),
    text: t(
      '市民服务局的网上预约要早上八点整刷新。约纳斯在窗口后小声说：「取消的号常在周一早上放出来。」',
      'The Bürgeramt’s online bookings refresh at 8 sharp. Jonas whispers from behind the counter: “Cancellations often come up on Monday mornings.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'thanks',
        label: t('记下这个窍门，道谢', 'Note the tip and thank him'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'jonas', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'de-tax-return',
    channel: 'letter',
    season: 2,
    title: t('报税季', 'Tax return season'),
    text: t(
      '同事说上一年的报税交上去，常常能退回一点钱。表格上的德语长得像一整句话。',
      'A colleague says filing last year’s tax return often brings a little money back. The German words on the form are as long as sentences.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'file',
        label: t('花一个晚上在网上填完', 'Spend an evening filing online'),
        effects: [
          { type: 'money', delta: 180 },
          { type: 'stat', key: 'mood', delta: -2 },
          { type: 'stat', key: 'german', delta: 1 },
        ],
        note: t('虚构的退税金额。', 'A fictional refund amount.'),
      },
      {
        id: 'skip',
        label: t('先放着', 'Leave it for now'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'de-flohmarkt',
    channel: 'place:bench',
    title: t('运河跳蚤市场', 'The canal flea market'),
    text: t(
      '运河边摆满了地摊。一个摊位上有一台旧咖啡磨，摊主说「十欧，送你一张唱片」。',
      'Stalls line the canal. One has an old coffee grinder; the seller says “Ten euros, and I’ll throw in a record.”',
    ),
    weight: 2,
    once: true,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'buy',
        label: t('买下，回家磨一杯', 'Buy it and grind a cup at home'),
        effects: [
          { type: 'money', delta: -10 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
      },
      {
        id: 'browse',
        label: t('只看看，跟摊主聊两句', 'Just browse and chat'),
        effects: [
          { type: 'stat', key: 'german', delta: 1 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'de-emeka-bridge',
    channel: 'npc:emeka',
    speaker: 'emeka',
    title: t('桥上的工地', 'The bridge works'),
    text: t(
      '埃梅卡戴着安全帽从桥下钻出来：「下个月这座桥就修好了。我刚来那年，它还在掉漆。」',
      'Emeka climbs out from under the bridge in his hard hat. “Next month this bridge is done. The year I arrived, it was still peeling.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'listen',
        label: t(
          '听他讲刚来德国那几年',
          'Listen to his first years in Germany',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'emeka', delta: 20 },
        ],
      },
    ],
  },
];

export const deSystemEvents: DeEvent[] = [
  {
    id: 'system-exam-failed',
    channel: 'morning',
    title: t('考试结果', 'Exam result'),
    text: t(
      '这次 B1 考试差一点。萨比娜老师在成绩单背面写：「口语进步很大，下次一定。」',
      'Not quite there in this B1 exam. Sabine writes on the back of the result: “Big progress in speaking. Next time.”',
    ),
    weight: 0,
    choices: [
      {
        id: 'again',
        label: t('报名下一期课程', 'Sign up for the next course'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。家庭医生开了几天病假条，医保卡一刷，几乎没花钱。',
      'A fever keeps you in bed. The family doctor writes a few days’ sick note, and the health card covers almost everything.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请病假，在家喝汤', 'Take sick leave and drink soup at home'),
        effects: [
          { type: 'money', delta: -15 },
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
      '亚洲超市里放着老家的歌，你在货架前站了很久。',
      'A song from home plays in the Asian supermarket, and you stand by the shelves for a long time.',
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
      '连续两季入不敷出。你把银行流水摊在桌上，一项一项划掉。',
      'Two quarters in the red. You spread the bank statement on the table and cross things out line by line.',
    ),
    weight: 0,
    choices: [
      {
        id: 'cut',
        label: t(
          '少去小酒馆，自己带午饭',
          'Fewer Kneipe nights, packed lunches',
        ),
        effects: [
          { type: 'money', delta: 500 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('把一间屋转租出去', 'Sublet the spare room'),
        effects: [
          { type: 'money', delta: 300 },
          { type: 'stat', key: 'mood', delta: -4 },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
