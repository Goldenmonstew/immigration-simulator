import type { GameEvent, Text } from '../../model';
import type { CaEffect, CaFestival } from './rules';

type CaEvent = GameEvent<CaEffect, CaFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the harbour, on the wharf and at home. */
export const caEvents: CaEvent[] = [
  {
    id: 'ca-collection-day',
    channel: 'morning',
    title: t('收垃圾的早上', 'Collection morning'),
    text: t(
      '路边一排绿桶和蓝袋。多琳正举着一只没洗的酸奶杯，对着阳光摇头。',
      'Green carts and blue bags line the curb. Doreen holds up an unrinsed yoghurt pot and shakes her head.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'sort',
        label: t('蹲下来一起重新分', 'Crouch down and help re-sort'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'doreen', delta: 15 },
        ],
      },
      {
        id: 'rush',
        label: t('说声 sorry，赶公交', 'Say sorry and run for the bus'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'ca-fog-ferry',
    channel: 'morning',
    title: t('雾里的渡轮', 'Ferry in the fog'),
    text: t(
      '大雾把港口整个吞了，雾角一声接一声。渡轮慢慢开，船长在广播里说会晚十分钟。',
      'Fog swallows the harbour and the foghorn calls again and again. The ferry creeps along; the captain says ten minutes late.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'deck',
        label: t('站在甲板上听雾角', 'Stand on deck and listen'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
      {
        id: 'inside',
        label: t('坐进船舱补一会儿觉', 'Doze in the cabin'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'ca-snow-day',
    channel: 'morning',
    title: t('大雪封门', 'Snowed in'),
    text: t(
      '一夜暴雪，门口的雪堆到膝盖。隔壁的铲雪声从六点就开始了。',
      'Overnight snow drifts to your knees. The neighbours’ shovels have been scraping since six.',
    ),
    weight: 3,
    when: [{ weather: 'snow' }],
    choices: [
      {
        id: 'shovel',
        label: t(
          '一起把整排台阶铲干净',
          'Clear the whole row of steps together',
        ),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'doreen', delta: 10 },
        ],
      },
      {
        id: 'cocoa',
        label: t('煮一锅热巧克力分给大家', 'Make hot chocolate for everyone'),
        effects: [
          { type: 'money', delta: -6 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'ca-coffee-run',
    channel: 'place:work',
    title: t('咖啡跑腿', 'The coffee run'),
    text: t(
      '轮到你去买咖啡了。纸条上写着：两杯双糖双奶、一杯不加糖、一盒甜甜圈。',
      'It’s your turn for the coffee run. The note says: two double-doubles, one black, a box of doughnuts.',
    ),
    weight: 2,
    choices: [
      {
        id: 'treat',
        label: t('这次我请', 'This round’s on me'),
        effects: [
          { type: 'money', delta: -18 },
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
      {
        id: 'split',
        label: t('记账，大家平摊', 'Keep a tab and split it'),
        effects: [{ type: 'stat', key: 'english', delta: 1 }],
      },
    ],
  },
  {
    id: 'ca-kitchen-invite',
    channel: 'npc:mike',
    speaker: 'mike',
    title: t('厨房派对', 'A kitchen party'),
    text: t(
      '迈克靠在门框上：「今晚有个小提琴手从布雷顿角来。你来，我教你跺第一步。」',
      'Mike leans in the doorway. “A fiddler’s down from Cape Breton tonight. Come, and I’ll teach you the first stomp.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，跳到鞋底发烫', 'Go and dance till your soles are hot'),
        effects: [
          { type: 'money', delta: -14 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'mike', delta: 20 },
        ],
      },
      {
        id: 'next',
        label: t('下次一定', 'Next time, promise'),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
  {
    id: 'ca-potluck-invite',
    channel: 'letter',
    title: t('一张手写邀请', 'A handwritten invitation'),
    text: t(
      '信箱里有一张卡片：「排屋邻里聚餐，每家带一道菜。——多琳」',
      'A card in the mailbox: “Row-house supper, bring a dish to share. — Doreen”',
    ),
    weight: 2,
    choices: [
      {
        id: 'dish',
        label: t('带一道家乡菜', 'Bring a dish from home'),
        effects: [
          { type: 'money', delta: -20 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'doreen', delta: 15 },
        ],
      },
      {
        id: 'dessert',
        label: t('买一盒甜甜圈应急', 'Grab a box of doughnuts'),
        effects: [
          { type: 'money', delta: -10 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'ca-hockey',
    channel: 'npc:leo',
    speaker: 'leo',
    title: t('冰球赛', 'Hockey night'),
    text: t(
      '利奥举着球棍跑过来：「周六我们打决赛！你来给我加油，就教你钓鲭鱼的秘诀。」',
      'Leo runs up waving his stick. “We’re in the final on Saturday! Come cheer and I’ll tell you my mackerel secret.”',
    ),
    weight: 3,
    season: 1,
    once: true,
    choices: [
      {
        id: 'cheer',
        label: t('去冰场喊到嗓子哑', 'Cheer yourself hoarse at the rink'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'leo', delta: 25 },
        ],
      },
    ],
  },
  {
    id: 'ca-lobster-traps',
    channel: 'place:pond',
    title: t('码头上的龙虾笼', 'Traps on the wharf'),
    text: t(
      '格里在修一只龙虾笼：「开季那天，所有船天不亮就出港，像赛马一样。」',
      'Gerry is mending a lobster trap. “On opening day every boat leaves before dawn, like a horse race.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'help',
        label: t('帮他把网眼补好', 'Help him patch the mesh'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'gerry', delta: 20 },
        ],
      },
      {
        id: 'ask',
        label: t('问他最大的一只有多大', 'Ask about the biggest lobster ever'),
        effects: [{ type: 'stat', key: 'english', delta: 1 }],
      },
    ],
  },
  {
    id: 'ca-power-out',
    channel: 'morning',
    season: 4,
    title: t('风暴后停电', 'Power out after the storm'),
    text: t(
      '夜里的风暴吹倒了一棵枫树，整条街停电。邻居在门口支起了野营炉。',
      'The overnight storm brought down a maple and the whole street lost power. A neighbour has a camp stove going on the step.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'share',
        label: t(
          '把冰箱里的东西拿出来一起煮',
          'Cook the fridge contents together',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'doreen', delta: 15 },
        ],
      },
      {
        id: 'cafe',
        label: t('去晨潮咖啡蹭电充手机', 'Charge your phone at the café'),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'friendship', npc: 'bonnie', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'ca-u-pick',
    channel: 'letter',
    season: 3,
    title: t('自摘草莓', 'U-pick strawberries'),
    text: t(
      '邦妮在明信片上写：「周末去河谷的农场自摘草莓，车上还有一个空位。」',
      'Bonnie’s postcard: “U-pick strawberries at a valley farm this weekend. One seat left in the car.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，摘满一篮', 'Go and fill a basket'),
        effects: [
          { type: 'money', delta: -12 },
          { type: 'item', item: 'strawberry', delta: 3 },
          { type: 'friendship', npc: 'bonnie', delta: 20 },
        ],
      },
      {
        id: 'rest',
        label: t('这周想在家歇着', 'Stay home this week'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'ca-sorry',
    channel: 'morning',
    title: t('两句对不起', 'Two sorries'),
    text: t(
      '人行道上你和一位老先生撞了个满怀。还没开口，他先说了 sorry，你也说了 sorry，两个人都笑了。',
      'You bump into an old gentleman on the sidewalk. Before you can speak he says sorry, you say sorry, and you both laugh.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'laugh',
        label: t('聊两句天气', 'Chat about the weather'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'english', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'ca-library-lend',
    channel: 'place:library',
    title: t('什么都能借', 'Borrow anything'),
    text: t(
      '图书馆的柜台后面挂着雪鞋、尤克里里和钓竿，都能凭借书证借。',
      'Behind the library desk hang snowshoes, ukuleles and fishing rods, all free with a card.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'ukulele',
        label: t('借一把尤克里里', 'Borrow a ukulele'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'snowshoes',
        label: t('借雪鞋去公园走走', 'Borrow snowshoes for the park'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
    ],
  },
  {
    id: 'ca-cleanup',
    channel: 'place:pond',
    season: 2,
    title: t('海岸清洁日', 'Shoreline clean-up'),
    text: t(
      '码头上发手套和垃圾袋。利奥捡到一只旧浮标，坚持说那是海盗的。',
      'Gloves and bags are handed out on the wharf. Leo finds an old buoy and insists it belonged to pirates.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'join',
        label: t('戴上手套一起捡', 'Glove up and join in'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'leo', delta: 15 },
          { type: 'friendship', npc: 'gerry', delta: 10 },
        ],
      },
    ],
  },
  {
    id: 'ca-poppy',
    channel: 'morning',
    season: 4,
    title: t('一朵小红花', 'A small red poppy'),
    text: t(
      '十一月初，大家胸口都别上了红色的罂粟花。门口的退伍老兵举着募捐盒。',
      'In early November everyone wears a red poppy. A veteran by the door holds a donation box.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'wear',
        label: t('投一枚硬币，别上一朵', 'Drop in a coin and pin one on'),
        effects: [
          { type: 'money', delta: -2 },
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'civics', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'ca-whale',
    channel: 'place:bench',
    season: 3,
    title: t('港口外的喷水', 'A spout beyond the harbour'),
    text: t(
      '有人指着港口外大喊。远处的海面上，一道水柱升起又落下。',
      'Someone points and shouts. Far out beyond the harbour, a plume of spray rises and falls.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'watch',
        label: t('一直看到它游远', 'Watch until it’s gone'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
    ],
  },
  {
    id: 'ca-dartmouth-market',
    channel: 'morning',
    title: t('对岸的周六', 'Saturday across the water'),
    text: t(
      '朋友们约你坐渡轮去达特茅斯：那边有家面包店的肉桂卷很有名。',
      'Friends suggest the ferry to Dartmouth: there’s a bakery over there famous for cinnamon buns.',
    ),
    weight: 2,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'go',
        label: t(
          '去，坐在船尾看海鸥',
          'Go, and watch the gulls from the stern',
        ),
        effects: [
          { type: 'money', delta: -12 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
      },
      {
        id: 'stay',
        label: t('留在家里补觉', 'Stay home and catch up on sleep'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
    ],
  },
];

/** Letters the game sends after a request, and the shared system cards. */
export const caSystemEvents: CaEvent[] = [
  {
    id: 'ca-endorsement-letter',
    channel: 'letter',
    title: t('省里的来信', 'A letter from the province'),
    text: t(
      '信封上印着新斯科舍省的徽章。人事部转来的信里写着：你的大西洋项目担保（endorsement）已经批下来了。',
      'The envelope carries the Nova Scotia crest. HR forwards it: your Atlantic Immigration Program endorsement has been issued.',
    ),
    weight: 0,
    requires: ['endorsement-requested'],
    // Posted to arrive on the quarter's workday, when offices are open.
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'file',
        label: t(
          '把担保信放进申请文件夹',
          'File it with the application papers',
        ),
        effects: [
          { type: 'endorsement' },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
    ],
  },
  {
    id: 'ca-police-letter',
    channel: 'letter',
    title: t('一封国际快递', 'An international courier'),
    text: t(
      '印度寄来的无犯罪证明到了，盖着蓝色的印章。',
      'The Indian police certificate has arrived, with its blue stamp.',
    ),
    weight: 0,
    requires: ['police-requested'],
    // Posted to arrive on the quarter's workday, when offices are open.
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'file',
        label: t('扫描存好', 'Scan and save it'),
        effects: [
          { type: 'policeCertificate' },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'ca-test-invitation',
    channel: 'letter',
    title: t('入籍考试通知', 'Citizenship test invitation'),
    text: t(
      'IRCC 的邮件说，你的入籍申请已经受理，请到 IRCC 办公室参加入籍考试。',
      'IRCC writes: your citizenship application is in process. Please take the citizenship test at the IRCC office.',
    ),
    weight: 0,
    requires: ['cit-applied'],
    // Posted to arrive on the quarter's workday, when offices are open.
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'study',
        label: t(
          '把《发现加拿大》放进包里',
          'Pack Discover Canada in your bag',
        ),
        effects: [{ type: 'stat', key: 'civics', delta: 2 }],
        sets: ['cit-test-invited'],
      },
    ],
  },
  {
    id: 'ca-ceremony-invitation',
    channel: 'letter',
    title: t('宣誓仪式通知', 'Oath ceremony invitation'),
    text: t(
      'IRCC 的信写着仪式的日期和地点，最后一行：「请带上你的永久居民卡。」',
      'IRCC’s letter gives the ceremony date and place. The last line reads: “Please bring your PR card.”',
    ),
    weight: 0,
    requires: ['cit-test-passed'],
    // Posted to arrive on the quarter's workday, when offices are open.
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'tell',
        label: t('打电话告诉妈妈', 'Call Mum with the news'),
        effects: [{ type: 'stat', key: 'mood', delta: 8 }],
        sets: ['cit-ceremony-invited'],
      },
    ],
  },
  {
    id: 'system-exam-failed',
    channel: 'morning',
    title: t('考试成绩', 'Test result'),
    text: t(
      '这次英语考试差一点。克洛伊在成绩单背面画了个笑脸：「听力进步很大，下次一定。」',
      'Not quite there on this English test. Chloé draws a smiley on the back of the results: “Big progress in listening. Next time.”',
    ),
    weight: 0,
    choices: [
      {
        id: 'again',
        label: t('报名下个月的晚课', 'Sign up for next month’s evening class'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'system-test-failed',
    channel: 'morning',
    title: t('入籍考试', 'Citizenship test'),
    text: t(
      '这次入籍考试没过。考官说可以再考一次，建议先把历史和政府那几章再看一遍。',
      'You didn’t pass this citizenship test. The officer says you can try again and suggests rereading the history and government chapters.',
    ),
    weight: 0,
    choices: [
      {
        id: 'again',
        label: t('去安家中心上辅导课', 'Sign up for the prep class'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。家庭医生说要休息几天，多喝水。',
      'A fever keeps you in bed. The family doctor says to rest a few days and drink plenty of water.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请病假，在家喝鸡汤', 'Take sick leave and have chicken soup'),
        effects: [
          { type: 'money', delta: -40 },
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
      '超市放着老家的歌，你在货架前站了很久。',
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
        label: t('少去酒馆，自己带午饭', 'Fewer pub nights, packed lunches'),
        effects: [
          { type: 'money', delta: 600 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬到更便宜的合租房', 'Move to a cheaper shared flat'),
        effects: [
          { type: 'money', delta: -300 },
          { type: 'stat', key: 'mood', delta: -4 },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
