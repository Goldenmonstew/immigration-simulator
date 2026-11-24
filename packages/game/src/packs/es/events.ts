import type { GameEvent, Text } from '../../model';
import type { EsEffect, EsFestival } from './rules';

type EsEvent = GameEvent<EsEffect, EsFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the market street, by the sea and at home. */
export const esEvents: EsEvent[] = [
  {
    id: 'es-almuerzo',
    channel: 'morning',
    title: t('十点半的 almuerzo', 'Almuerzo at half ten'),
    text: t(
      '同事在群里发：「十点半，托内特酒吧，老位置。」瓦伦西亚人的上午，要被一个夹肉面包分成两半。',
      'A colleague posts in the group chat: “Half ten, Bar Tonet, usual table.” In València the morning is split in two by a sandwich.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'go',
        label: t('去，点一杯 cremaet', 'Go, and order a cremaet'),
        effects: [
          { type: 'money', delta: -6 },
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'tonet', delta: 15 },
        ],
        note: t(
          'cremaet 是加了朗姆酒和糖、点火烧过的咖啡。',
          'A cremaet is coffee with rum and sugar, flamed before serving.',
        ),
      },
      {
        id: 'desk',
        label: t('在工位上吃个苹果', 'Eat an apple at your desk'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'es-bilingual-sign',
    channel: 'morning',
    title: t('两种语言的路牌', 'A sign in two languages'),
    text: t(
      '电车站的指示牌写着 Eixida / Salida。你第一次注意到，两种写法说的是同一个出口。',
      'The tram stop sign says Eixida / Salida. For the first time you notice both words mean the same exit.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'note',
        label: t('拍下来，晚上查一查', 'Take a photo and look it up tonight'),
        effects: [{ type: 'stat', key: 'spanish', delta: 1 }],
      },
      {
        id: 'ask',
        label: t(
          '问旁边的老太太怎么念',
          'Ask the old lady beside you how to say it',
        ),
        effects: [
          { type: 'stat', key: 'spanish', delta: 1 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'es-heat-wave',
    channel: 'morning',
    season: 3,
    title: t('热浪', 'Heat wave'),
    text: t(
      '气象台发布高温预警。街上的百叶窗全放下了，只有欧洽塔铺门口排着队。',
      'A heat warning is out. Every shutter on the street is down; only the orxateria has a queue.',
    ),
    weight: 3,
    when: [{ weather: 'sunny' }],
    choices: [
      {
        id: 'shade',
        label: t(
          '关窗拉帘，午后睡一觉',
          'Close the shutters and nap through the afternoon',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
      {
        id: 'sea',
        label: t('傍晚去海里泡一泡', 'Soak in the sea at dusk'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'es-planta',
    channel: 'morning',
    season: 2,
    title: t('家门口的法雅', 'A falla outside your door'),
    text: t(
      '一夜之间，广场上立起了巨大的纸雕：一只戴墨镜的海鸥在骂旅游团。街道封了，公交改了线。',
      'Overnight a giant papier-mâché sculpture has gone up in the square: a seagull in sunglasses scolding a tour group. The street is closed and the bus is diverted.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'look',
        label: t(
          '绕着它看一圈，找自己的街区',
          'Walk round it looking for your street',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'amparo', delta: 10 },
        ],
      },
      {
        id: 'walk',
        label: t('提前出门，走路去上班', 'Leave early and walk to work'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'es-tram-strike',
    channel: 'morning',
    title: t('电车只开一半', 'Half the trams'),
    text: t(
      '电车工会罢工，只保留最低服务。站台上的人都在看手机里的共享单车地图。',
      'The tram union is on strike with only minimum service. Everyone on the platform is checking the bike-share map.',
    ),
    weight: 2,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'bike',
        label: t(
          '骑共享单车沿老河道公园走',
          'Take a shared bike through the old riverbed park',
        ),
        effects: [
          { type: 'money', delta: -2 },
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
      {
        id: 'wait',
        label: t(
          '等下一班，迟到二十分钟',
          'Wait for the next one and arrive twenty minutes late',
        ),
        effects: [{ type: 'stat', key: 'career', delta: -1 }],
      },
    ],
  },
  {
    id: 'es-market-orange',
    channel: 'place:shop',
    title: t('法蒂玛的橙子', 'Fatima’s oranges'),
    text: t(
      '法蒂玛把一个橙子剖成四瓣递给你：「阿尔齐拉的，今早才摘。你尝尝就知道了。」',
      'Fatima quarters an orange and hands it over. “From Alzira, picked this morning. One taste and you’ll know.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'buy',
        label: t('买一袋带回家', 'Buy a bag to take home'),
        effects: [
          { type: 'money', delta: -3 },
          { type: 'item', item: 'oranges', delta: 1 },
          { type: 'friendship', npc: 'fatima', delta: 15 },
        ],
      },
      {
        id: 'chat',
        label: t('站着聊会儿天', 'Stay and chat'),
        effects: [
          { type: 'stat', key: 'spanish', delta: 1 },
          { type: 'friendship', npc: 'fatima', delta: 10 },
        ],
      },
    ],
  },
  {
    id: 'es-balcony-drip',
    channel: 'place:home',
    title: t('楼上的花盆', 'Upstairs flowerpots'),
    text: t(
      '楼上邻居浇花，水顺着阳台滴在你晾的衣服上。她探出头：「Perdó, perdó!」',
      'The neighbour upstairs waters her geraniums and the drips land on your washing. She leans out: “Perdó, perdó!”',
    ),
    weight: 2,
    when: [{ minuteMax: 720 }],
    choices: [
      {
        id: 'laugh',
        label: t(
          '笑着说没关系，顺便学一句瓦伦西亚语',
          'Laugh it off and learn a Valencian phrase',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'spanish', delta: 1 },
        ],
      },
      {
        id: 'move',
        label: t('把衣服挪到屋里', 'Move the washing inside'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'es-renta',
    channel: 'letter',
    season: 2,
    title: t('报税季', 'Tax return season'),
    text: t(
      '税务局的短信提醒你：年度个人所得税申报开始了。草稿已经生成，只要核对一遍。',
      'A text from the tax agency: the annual income tax return is open. The draft is ready; you only need to check it.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'file',
        label: t('晚上在网上核对并确认', 'Check and confirm it online tonight'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'spanish', delta: 1 },
        ],
      },
      {
        id: 'gestor',
        label: t('请代办帮忙看一眼', 'Ask the gestor to take a look'),
        effects: [
          { type: 'money', delta: -40 },
          { type: 'friendship', npc: 'sergi', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'es-sunday-paella',
    channel: 'npc:amparo',
    speaker: 'amparo',
    title: t('周日的大锅饭', 'Sunday paella'),
    text: t(
      '安帕罗在会所门口支起一口一米宽的锅：「来！但先说好，瓦伦西亚海鲜饭里不放西班牙香肠。」',
      'Amparo sets up a metre-wide pan outside the casal. “Come and eat! But first: no chorizo in a Valencian paella.”',
    ),
    weight: 3,
    once: true,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'help',
        label: t(
          '帮她看火，学放米的时机',
          'Mind the fire and learn when the rice goes in',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'amparo', delta: 25 },
        ],
      },
      {
        id: 'eat',
        label: t(
          '只负责吃，用勺子直接从锅里舀',
          'Just eat, straight from the pan with a spoon',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'es-storm-warning',
    channel: 'morning',
    season: 4,
    title: t('橙色暴雨预警', 'Orange rain warning'),
    text: t(
      '手机响起预警提示：今天有强降雨，学校停课，建议居家。街上已经没什么人。',
      'Phones buzz with an alert: heavy rain today, schools closed, stay home if you can. The street is already empty.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'home',
        label: t(
          '在家待着，给楼下的老太太打个电话',
          'Stay in and phone the elderly neighbour downstairs',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'amparo', delta: 10 },
        ],
      },
      {
        id: 'check',
        label: t(
          '查好避开低洼路段的路线',
          'Plan a route away from low-lying streets',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 1 }],
      },
    ],
  },
  {
    id: 'es-beach-cleanup',
    channel: 'morning',
    season: 3,
    title: t('海滩清洁', 'Beach clean-up'),
    text: t(
      '救生塔下聚了二十来个人，基克在分手套和袋子：「瓶盖最多，烟头第二。」',
      'Twenty people gather under the lifeguard tower. Quique hands out gloves and bags: “Bottle caps win, cigarette ends second.”',
    ),
    weight: 2,
    once: true,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'join',
        label: t('一起捡一个小时', 'Join in for an hour'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'quique', delta: 20 },
        ],
      },
      {
        id: 'swim',
        label: t('先去游泳，回来再说', 'Swim first, maybe later'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'es-nochebuena',
    channel: 'letter',
    season: 1,
    title: t('平安夜的邀请', 'A Christmas Eve invitation'),
    text: t(
      '门缝里塞进来一张手写卡片：「平安夜九点，三楼，带上你自己就好。——楼上的邻居」',
      'A handwritten card under the door: “Christmas Eve, nine o’clock, third floor. Just bring yourself. — Your upstairs neighbours”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('带一盒杏仁糖上楼', 'Go up with a box of turrón'),
        effects: [
          { type: 'money', delta: -9 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
      {
        id: 'call',
        label: t('留在家和家里人视频', 'Stay in and video-call home'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'es-health-card',
    channel: 'letter',
    title: t('医保卡换新', 'A new health card'),
    text: t(
      '卫生中心寄来新的医保卡，附一张说明：家庭医生换成了一位新来的医生。',
      'The health centre posts a new health card with a note: you’ve been assigned a new family doctor.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'book',
        label: t('顺便约个体检', 'Book a check-up while you’re at it'),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
      {
        id: 'file',
        label: t('收进钱包', 'Put it in your wallet'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'es-language-exchange',
    channel: 'place:college',
    title: t('语言交换之夜', 'Language exchange night'),
    text: t(
      '桌上摆着各国小吃。一个学中文的大学生想跟你练「你好」的声调，你想跟他练卷舌音。',
      'Snacks from everywhere on the table. A student learning Chinese wants to practise tones with you; you want to practise rolling your r’s.',
    ),
    weight: 3,
    once: true,
    when: [{ minuteMin: 1080 }],
    choices: [
      {
        id: 'swap',
        label: t('互相纠音半小时', 'Swap corrections for half an hour'),
        effects: [
          { type: 'stat', key: 'spanish', delta: 2 },
          { type: 'friendship', npc: 'marina', delta: 15 },
        ],
      },
      {
        id: 'snack',
        label: t('先去吃小吃', 'Head for the snacks'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'es-padron-reminder',
    channel: 'letter',
    requires: ['padron-due'],
    title: t('住址登记还没改', 'Your padrón still shows the old address'),
    text: t(
      '房东寄来新合同的副本，附了一句：「记得去区政府服务处更新 padrón。」',
      'The landlord sends a copy of the new lease with a note: “Remember to update your padrón at the district office.”',
    ),
    weight: 4,
    once: true,
    choices: [
      {
        id: 'note',
        label: t('记下办公时间：早上八点半到两点', 'Note the hours: 8:30 to 2'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
        note: t(
          '入籍材料里的住址证明以住址登记为准（SRC-321 art. 5）。',
          'The address evidence for nationality relies on the padrón (SRC-321 art. 5).',
        ),
      },
    ],
  },
];

export const esSystemEvents: EsEvent[] = [
  {
    id: 'system-exam-failed',
    channel: 'morning',
    title: t('考试成绩', 'Exam result'),
    text: t(
      '这次差一点。玛丽娜老师在成绩单背面写：「听力进步很大，下次一定。」',
      'Not quite there this time. Marina writes on the back of the result: “Big progress in listening. Next time.”',
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
      '早上发烧起不来。家庭医生开了几天病假单，叮嘱多喝水。',
      'A fever keeps you in bed. The family doctor signs you off for a few days and says to drink plenty.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请假，在家喝汤', 'Take sick leave and have soup at home'),
        effects: [
          { type: 'money', delta: -20 },
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
      '超市放着家乡的歌，你在货架前站了很久。',
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
      '连续两季入不敷出。你把银行流水摊在桌上，一项一项划掉。',
      'Two quarters in the red. You spread the bank statement on the table and cross things out line by line.',
    ),
    weight: 0,
    choices: [
      {
        id: 'cut',
        label: t('少去酒吧，自己带饭', 'Fewer bar nights, packed lunches'),
        effects: [
          { type: 'money', delta: 400 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('合租一间便宜的房间', 'Move into a cheaper shared flat'),
        effects: [
          { type: 'money', delta: -200 },
          { type: 'stat', key: 'mood', delta: -4 },
          { type: 'moved' },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
