import type { GameEvent, Text } from '../../model';
import type { AuEffect, AuFestival } from './rules';

type AuEvent = GameEvent<AuEffect, AuFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the foreshore, the main street and at home. Seasons are southern. */
export const auEvents: AuEvent[] = [
  {
    id: 'au-bin-night',
    channel: 'morning',
    title: t('哪个桶？', 'Which bin?'),
    text: t(
      '早上出门，整条街的黄盖桶都在路边，只有你家推出来的是绿盖。',
      'You step out to find every yellow lid in the street at the kerb, and yours is the green one.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'swap',
        label: t(
          '赶紧换桶，跟邻居相视一笑',
          'Swap bins and share a grin with next door',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'english', delta: 1 },
        ],
      },
      {
        id: 'rush',
        label: t('来不及了，下周再说', 'No time; next week'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'au-magpie',
    channel: 'morning',
    season: 4,
    title: t('喜鹊护巢季', 'Swooping season'),
    text: t(
      '公园小路上，一只喜鹊从背后掠过你的头顶，咔嗒一声又飞回树上。',
      'On the park path a magpie swoops past your head from behind, clacks its beak and returns to the tree.',
    ),
    weight: 4,
    choices: [
      {
        id: 'detour',
        label: t('绕道走海边', 'Take the long way by the sea'),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'career', delta: -1 },
        ],
      },
      {
        id: 'helmet',
        label: t(
          '学凯，在帽子上画一双眼睛',
          'Do as Kai does: draw eyes on the back of your hat',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'kai', delta: 10 },
        ],
      },
    ],
  },
  {
    id: 'au-huntsman',
    channel: 'place:home',
    title: t('墙上的大蜘蛛', 'A spider on the wall'),
    text: t(
      '客厅墙上趴着一只手掌大的长脚蜘蛛。邻居说它无毒，还会吃蟑螂。',
      'A huntsman the size of your hand is on the lounge wall. Next door says it’s harmless and eats cockroaches.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'release',
        label: t(
          '用玻璃杯和硬纸板请它出门',
          'Escort it out with a glass and some cardboard',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
      {
        id: 'roommate',
        label: t('给它起个名字，让它留下', 'Name it and let it stay'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'english', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'au-sausage-sizzle',
    channel: 'morning',
    title: t('五金店门口的烤香肠', 'Sausage sizzle at the hardware store'),
    text: t(
      '周末五金店门口支起烤炉，足球俱乐部在募捐：香肠夹面包，洋葱放在下面还是上面，全镇吵了三十年。',
      'The footy club is fundraising with a barbecue outside the hardware store. Snag in bread, and onions above or below: the town has argued for thirty years.',
    ),
    weight: 3,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'buy',
        label: t('买一份，洋葱放下面', 'Buy one, onions underneath'),
        effects: [
          { type: 'money', delta: -4 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
      {
        id: 'volunteer',
        label: t('帮忙翻一小时香肠', 'Flip sausages for an hour'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'sam', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'au-fire-ban',
    channel: 'morning',
    season: 1,
    title: t('全面禁火日', 'Total fire ban'),
    text: t(
      '热风从北边吹来，手机提醒今天火险等级很高。贝芙在群里问大家有没有准备好应急计划。',
      'A hot northerly blows in and your phone warns of high fire danger. Bev asks the group chat whether everyone has a plan ready.',
    ),
    weight: 3,
    when: [{ weather: 'sunny' }],
    choices: [
      {
        id: 'plan',
        label: t('跟邻居一起把计划写好', 'Write a plan with the neighbours'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'bev', delta: 15 },
        ],
      },
      {
        id: 'indoors',
        label: t('关好门窗，待在家里', 'Close up the house and stay in'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'au-christmas',
    channel: 'phone',
    season: 1,
    title: t('海边的圣诞', 'Christmas by the beach'),
    text: t(
      '莱拉妮打来电话：圣诞节大家带吃的去海滩，虾和帕夫洛娃都有，你来吗？',
      'Leilani calls: everyone’s bringing food to the beach on Christmas Day, prawns and pavlova included. Coming?',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('带一盘沙拉去', 'Bring a salad'),
        effects: [
          { type: 'money', delta: -20 },
          { type: 'stat', key: 'mood', delta: 7 },
          { type: 'friendship', npc: 'leilani', delta: 20 },
        ],
      },
      {
        id: 'call',
        label: t('跟家里视频过节', 'Spend it on a video call home'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'au-four-seasons',
    channel: 'morning',
    title: t('一天四季', 'Four seasons in one day'),
    text: t(
      '出门时阳光灿烂，走到半路下起冰雹，到了门口又出太阳了。',
      'Bright sunshine when you leave, hail halfway, and sun again by the time you arrive.',
    ),
    weight: 3,
    when: [{ weather: 'cloudy' }],
    choices: [
      {
        id: 'jacket',
        label: t(
          '以后包里常备一件外套',
          'Keep a jacket in your bag from now on',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
      {
        id: 'laugh',
        label: t('笑着跟同事吐槽天气', 'Laugh about it with colleagues'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'english', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'au-slang',
    channel: 'place:pub',
    title: t('听不懂的那句话', 'Lost in translation'),
    text: t(
      '加扎说：「今天下午去加油站买点香肠，回来烧烤。」——可他说的是 “arvo”“servo”“snags”。',
      'Gazza says, “Grab some snags from the servo this arvo and we’ll throw them on the barbie.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'ask',
        label: t('笑着让他再说一遍', 'Laugh and ask him to say it again'),
        effects: [
          { type: 'stat', key: 'english', delta: 3 },
          { type: 'friendship', npc: 'gazza', delta: 15 },
        ],
      },
      {
        id: 'nod',
        label: t('点头说 “no worries”', 'Nod and say “no worries”'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'au-rental-inspection',
    channel: 'letter',
    title: t('例行查房', 'Routine inspection'),
    text: t(
      '中介来信：下周例行查房，请保持屋内整洁。',
      'A letter from the agent: routine inspection next week, please keep the place tidy.',
    ),
    weight: 2,
    choices: [
      {
        id: 'clean',
        label: t('周末大扫除', 'Spring-clean at the weekend'),
        effects: [
          { type: 'stat', key: 'mood', delta: -1 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'ask-fix',
        label: t(
          '顺便报修漏水的水龙头',
          'Report the dripping tap while they’re at it',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'au-cockatoo',
    channel: 'place:home',
    title: t('凤头鹦鹉来访', 'A cockatoo visits'),
    text: t(
      '一只黄冠白鹦鹉站在阳台栏杆上，正用嘴一点点掀开垃圾桶盖。',
      'A sulphur-crested cockatoo on the balcony rail is levering the bin lid open with its beak.',
    ),
    weight: 2,
    choices: [
      {
        id: 'shoo',
        label: t(
          '拍手赶走，压上一块砖',
          'Clap it away and put a brick on the lid',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
      {
        id: 'watch',
        label: t('拍下视频发给家人', 'Film it and send it home'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'au-kangaroo',
    channel: 'morning',
    title: t('黄昏的袋鼠', 'Kangaroos at dusk'),
    text: t(
      '昨晚下班的路上，一群袋鼠站在高尔夫球场边吃草，路灯下一动不动地看着你。',
      'Walking home last night, you passed a mob of kangaroos grazing by the golf course, frozen and watching you under the streetlight.',
    ),
    weight: 2,
    choices: [
      {
        id: 'slow',
        label: t('以后天黑走路慢一点', 'Take it slower after dark from now on'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'au-flu-shot',
    channel: 'place:work',
    season: 2,
    title: t('流感疫苗', 'Flu shots'),
    text: t(
      '医院走廊贴出通知：员工流感疫苗今天在休息室接种。',
      'A notice in the hospital corridor: staff flu shots in the tearoom today.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'jab',
        label: t('排队打一针', 'Join the queue'),
        effects: [{ type: 'stat', key: 'health', delta: 4 }],
      },
    ],
  },
  {
    id: 'au-winter-storm',
    channel: 'morning',
    season: 3,
    title: t('冬季暴风', 'A winter storm'),
    text: t(
      '半夜狂风把整条街吹停了电。早上醒来，海边的步道上全是海草。',
      'Overnight gales knocked out the street’s power. By morning the foreshore path is covered in seaweed.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'help',
        label: t('跟贝芙一起清理步道', 'Help Bev clear the path'),
        effects: [
          { type: 'stat', key: 'health', delta: -1 },
          { type: 'friendship', npc: 'bev', delta: 20 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'candles',
        label: t('点蜡烛，煮一壶热茶', 'Light candles and brew a pot of tea'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'au-surf-patrol',
    channel: 'place:beach',
    season: 1,
    title: t('救生队招人', 'Lifesavers wanted'),
    text: t(
      '救生队的旗子下，队长问你愿不愿意周末来帮忙看守，不用下水，帮着递对讲机就行。',
      'Under the patrol flags, the captain asks if you’d help on weekend patrol. No swimming needed, just pass the radios.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'join',
        label: t(
          '报名，领一件红黄队服',
          'Sign up and collect the red-and-yellow shirt',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'friendship', npc: 'kai', delta: 20 },
        ],
      },
      {
        id: 'later',
        label: t('先看看排班再说', 'Check your roster first'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'au-cup-sweep',
    channel: 'place:work',
    season: 4,
    title: t('墨尔本杯那天', 'Melbourne Cup day'),
    text: t(
      '下午三点，医院休息室挤满了人，大家戴着自己做的头饰看比赛直播。护士长宣布：最佳头饰奖是一盒巧克力。',
      'At three o’clock the hospital tearoom is packed, everyone in homemade fascinators to watch the race. Grace announces the prize for best fascinator: a box of chocolates.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'hat',
        label: t(
          '用手术帽和纱布做一顶',
          'Make one from a theatre cap and gauze',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'career', delta: 1 },
        ],
      },
      {
        id: 'watch',
        label: t('站在后面看热闹', 'Watch from the back'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'au-doug-parcel',
    channel: 'npc:doug',
    speaker: 'doug',
    title: t('道格的包裹', 'Doug’s parcel'),
    text: t(
      '道格把一个皱巴巴的包裹递给你：「海关贴了单子，里面是吃的吧？申报过了就没事。」',
      'Doug hands you a crumpled parcel. “Customs stickered it. Food inside? You’re fine if it was declared.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'share',
        label: t(
          '拆开，分他一包家乡零食',
          'Open it and share a snack from home',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'doug', delta: 25 },
        ],
      },
    ],
  },
];

export const auSystemEvents: AuEvent[] = [
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。奥卡福医生说要休息几天，同事们帮你顶了班。',
      'A fever keeps you in bed. Dr Okafor says rest for a few days; your colleagues cover your shifts.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请病假，在家喝汤', 'Take sick leave and drink soup at home'),
        effects: [
          { type: 'money', delta: -90 },
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
      '超市里放着家乡的歌，你在货架前站了很久。',
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
          { type: 'money', delta: -25 },
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
        label: t('少去酒店，自己带午饭', 'Fewer pub nights, packed lunches'),
        effects: [
          { type: 'money', delta: 600 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬到更便宜的合租房', 'Move to a cheaper share house'),
        effects: [
          { type: 'money', delta: -300 },
          { type: 'stat', key: 'mood', delta: -4 },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
