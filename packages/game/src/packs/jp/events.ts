import type { GameEvent, Text } from '../../model';
import { addressDays, type JpEffect, type JpFestival } from './rules';

type JpEvent = GameEvent<JpEffect, JpFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life in the shopping streets, by the river and at home. */
export const jpEvents: JpEvent[] = [
  {
    id: 'jp-rubbish-day',
    channel: 'morning',
    title: t('垃圾收集日', 'Rubbish day'),
    text: t(
      '收集点前，铃木奶奶正把一只没撕标签的塑料瓶举到阳光下。',
      'At the collection point, Mrs Suzuki holds up a bottle with its label still on.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'sort',
        label: t('蹲下来一起撕标签', 'Crouch down and help peel labels'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'yoshie', delta: 15 },
        ],
      },
      {
        id: 'rush',
        label: t('鞠个躬，赶电车', 'Bow and run for the train'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'jp-rain-delay',
    channel: 'morning',
    title: t('雨天换乘', 'Rainy transfer'),
    text: t(
      '广播说前方车站信号故障，电车晚点二十分钟。站台上一排透明雨伞滴着水。',
      'The announcement says a signal fault up the line: twenty minutes’ delay. A row of clear umbrellas drips on the platform.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }, { dayKind: 'workday' }],
    choices: [
      {
        id: 'slip',
        label: t('领一张延误证明，慢慢走', 'Take a delay slip and stroll in'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'japanese', delta: 1 },
        ],
        note: t(
          '日本车站会给晚点的乘客发「遅延証明書」。',
          'Japanese stations hand delayed passengers a delay certificate.',
        ),
      },
      {
        id: 'bus',
        label: t('改坐公交，挤一挤', 'Squeeze onto a bus instead'),
        effects: [
          { type: 'money', delta: -230 },
          { type: 'stat', key: 'health', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'jp-ic-card',
    channel: 'place:station',
    title: t('交通卡余额不足', 'Low on the transit card'),
    text: t(
      '闸机「哔哔」两声把你拦下，屏幕上显示余额 ¥120。',
      'The gate beeps twice and stops you. The screen shows ¥120 left.',
    ),
    weight: 2,
    choices: [
      {
        id: 'charge',
        label: t('充值 ¥3,000', 'Top up ¥3,000'),
        effects: [{ type: 'money', delta: -3_000 }],
      },
      {
        id: 'walk',
        label: t('今天走路', 'Walk today'),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'jp-konbini-print',
    channel: 'place:shop',
    title: t('打印一份材料', 'Printing a form'),
    text: t(
      '兰教你用店里的多功能机打印网上下载的表格：「选 A4，黑白，十日元一张。」',
      'Lan shows you how to print a downloaded form on the store’s machine. “A4, black and white, ten yen a page.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'print',
        label: t('打印三张，留一张备用', 'Print three, keep one spare'),
        effects: [
          { type: 'money', delta: -30 },
          { type: 'friendship', npc: 'lan', delta: 15 },
          { type: 'stat', key: 'japanese', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'jp-redelivery',
    channel: 'letter',
    title: t('不在通知单', 'A missed-delivery slip'),
    text: t(
      '信箱里有一张快递的不在联络票，上面有二维码和一串电话号码。',
      'There’s a missed-delivery slip in the mailbox, with a QR code and a phone number.',
    ),
    weight: 2,
    choices: [
      {
        id: 'online',
        label: t('扫码预约今晚再配送', 'Scan it and book delivery tonight'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
      {
        id: 'phone',
        label: t(
          '打电话，用日语说清楚时间',
          'Phone and give the time in Japanese',
        ),
        effects: [{ type: 'stat', key: 'japanese', delta: 2 }],
      },
    ],
  },
  {
    id: 'jp-disaster-drill',
    channel: 'letter',
    title: t('防灾训练通知', 'Disaster drill notice'),
    text: t(
      '町内会的通知写着最近的避难所是小学体育馆，还附了一张储备水领取券。',
      'The association’s notice says the nearest shelter is the primary-school gym, with a voucher for stored water.',
    ),
    weight: 3,
    once: true,
    requires: ['quarter-board-drill'],
    choices: [
      {
        id: 'join',
        label: t(
          '参加训练，认认避难路线',
          'Join the drill and learn the route',
        ),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'friendship', npc: 'yoshie', delta: 15 },
          { type: 'item', item: 'tea', delta: 2 },
        ],
      },
      {
        id: 'map',
        label: t(
          '把避难所地图贴在门后',
          'Stick the shelter map behind the door',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'jp-river-cleanup',
    channel: 'place:pond',
    title: t('河岸清扫', 'Riverbank clean-up'),
    text: t(
      '十几个邻居戴着手套沿河捡垃圾。翔从草丛里拖出一只雨靴，得意地举过头顶。',
      'A dozen neighbours in gloves pick litter along the river. Sho drags a rain boot from the grass and holds it up in triumph.',
    ),
    weight: 3,
    once: true,
    requires: ['quarter-board-cleanup'],
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'help',
        label: t('一起捡到最后', 'Help until the end'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'yoshie', delta: 20 },
          { type: 'friendship', npc: 'sho', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'jp-hatsumode',
    channel: 'morning',
    season: 1,
    title: t('新年参拜', 'First shrine visit'),
    text: t(
      '神社前排着长队。投一枚硬币，拍两下手，许个今年的愿。',
      'A long queue at the shrine. Drop a coin, clap twice and make this year’s wish.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'charm',
        label: t('求一个学业护身符', 'Buy a charm for studies'),
        effects: [
          { type: 'money', delta: -800 },
          { type: 'item', item: 'omamori', delta: 1 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
      {
        id: 'fortune',
        label: t(
          '抽一支签，系在树枝上',
          'Draw a fortune and tie it to a branch',
        ),
        effects: [
          { type: 'money', delta: -200 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'jp-year-end-clean',
    channel: 'place:home',
    season: 1,
    title: t('年末大扫除', 'Year-end clean'),
    text: t(
      '楼里的邻居都在擦窗户。按习惯，年底要把家里打扫干净再迎新年。',
      'Everyone in the building is cleaning windows. By custom, the home is cleaned before the new year.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'clean',
        label: t('擦窗、拖地、清冰箱', 'Windows, floors, fridge'),
        effects: [
          { type: 'stat', key: 'health', delta: 3 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'jp-hay-fever',
    channel: 'morning',
    season: 2,
    title: t('花粉季', 'Pollen season'),
    text: t(
      '早上一出门就打了三个喷嚏。电车里一半的人戴着口罩。',
      'Three sneezes the moment you step outside. Half the train is wearing masks.',
    ),
    weight: 2,
    choices: [
      {
        id: 'mask',
        label: t('去便利店买口罩和眼药水', 'Buy masks and eye drops'),
        effects: [
          { type: 'money', delta: -1_200 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'endure',
        label: t('忍一忍', 'Grin and bear it'),
        effects: [{ type: 'stat', key: 'health', delta: -2 }],
      },
    ],
  },
  {
    id: 'jp-rainy-season',
    channel: 'morning',
    season: 3,
    title: t('梅雨', 'Rainy season'),
    text: t(
      '阳台上的衣服三天没干。邻居推荐了投币烘干机。',
      'The washing on the balcony hasn’t dried in three days. A neighbour recommends the coin dryers.',
    ),
    weight: 2,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'dryer',
        label: t('去投币洗衣店', 'Go to the laundrette'),
        effects: [
          { type: 'money', delta: -600 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'wait',
        label: t('开除湿机，等天晴', 'Run the dehumidifier and wait'),
        effects: [{ type: 'stat', key: 'mood', delta: -1 }],
      },
    ],
  },
  {
    id: 'jp-typhoon',
    channel: 'morning',
    season: 4,
    title: t('台风接近', 'Typhoon approaching'),
    text: t(
      '新闻说台风今晚登陆。商店街的卷帘门早早拉下了一半。',
      'The news says a typhoon lands tonight. The shopping street’s shutters are already half down.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'home',
        label: t(
          '把阳台的东西收进屋，在家等',
          'Bring the balcony in and stay home',
        ),
        effects: [
          { type: 'stat', key: 'health', delta: 3 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
      {
        id: 'check',
        label: t('去敲敲铃木奶奶的门', 'Knock on Mrs Suzuki’s door'),
        effects: [
          { type: 'friendship', npc: 'yoshie', delta: 25 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'jp-tax-return',
    channel: 'letter',
    season: 1,
    title: t('确定申告的季节', 'Tax-return season'),
    text: t(
      '公司寄来源泉征收票。去年的医疗费收据也该整理了。',
      'Your employer’s withholding slip has arrived. Last year’s medical receipts need sorting too.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'file',
        label: t('整理收据，网上申报', 'Sort the receipts and file online'),
        effects: [
          { type: 'money', delta: 8_000 },
          { type: 'stat', key: 'mood', delta: -1 },
          { type: 'stat', key: 'japanese', delta: 1 },
        ],
        note: t(
          '虚构的退税金额。按时纳税的记录会在永住与帰化审查中核对。',
          'A fictional refund. Timely tax records are checked for permanent residence and naturalisation.',
        ),
      },
      {
        id: 'keep',
        label: t('把源泉征收票收进文件夹', 'File the slip away'),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'jp-pension-letter',
    channel: 'letter',
    title: t('年金定期便', 'Pension statement'),
    text: t(
      '年金机构寄来了缴费记录。一格一格的月份，看起来像小学的出勤表。',
      'The pension service sends your contribution record. The month-by-month grid looks like a school attendance sheet.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'check',
        label: t('对照工资单核一遍', 'Check it against your payslips'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        note: t(
          '公共年金和医保的缴纳情况会在永住与帰化审查中核对。',
          'Public pension and health insurance payments are checked for permanent residence and naturalisation.',
        ),
      },
    ],
  },
  {
    id: 'jp-address-reminder',
    channel: 'morning',
    title: t('新家的钥匙', 'Keys to the new place'),
    text: t(
      `纸箱还没拆完。搬家后 ${addressDays} 天内要到区役所申报新住址，在留卡背面也会写上。`,
      `The boxes aren’t unpacked yet. Report the new address at the ward office within ${addressDays} days of moving; it goes on the back of your residence card too.`,
    ),
    weight: 4,
    requires: ['address-notice-due'],
    choices: [
      {
        id: 'note',
        label: t(
          '把区役所的营业时间记进手机',
          'Save the ward office hours in your phone',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'jp-raj-souvenir',
    channel: 'npc:raj',
    speaker: 'raj',
    title: t('拉杰的伴手礼', 'Raj’s souvenir'),
    text: t(
      '拉杰从老家回来，塞给你一盒点心：「日本的习惯，出远门要带伴手礼。我已经学会了。」',
      'Back from India, Raj presses a box of sweets on you. “Japanese custom: bring souvenirs from a trip. I’ve learned.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'thanks',
        label: t('道谢，回送一盒团子', 'Thank him and return a box of dango'),
        effects: [
          { type: 'friendship', npc: 'raj', delta: 20 },
          { type: 'item', item: 'castella', delta: 1 },
        ],
      },
    ],
  },
];

export const jpSystemEvents: JpEvent[] = [
  {
    id: 'system-exam-failed',
    channel: 'morning',
    title: t('评估结果', 'Assessment result'),
    text: t(
      '这次日语评估差一点。美咲老师在成绩单背面写：「听力进步很大，下次一定。」',
      'Not quite there in this language assessment. Misaki writes on the back of the result: “Big progress in listening. Next time.”',
    ),
    weight: 0,
    choices: [
      {
        id: 'again',
        label: t('报名下个月的课', 'Sign up for next month’s classes'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。诊所的医生说要休息几天，账单比想象中少。',
      'A fever keeps you in bed. The clinic says to rest a few days; the bill is smaller than you feared.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请假，在家喝粥', 'Take leave and eat rice porridge at home'),
        effects: [
          { type: 'money', delta: -4_500 },
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
          { type: 'money', delta: -2_000 },
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
      'Two quarters in the red. You spread the card statement on the table and cross things out line by line.',
    ),
    weight: 0,
    choices: [
      {
        id: 'cut',
        label: t(
          '少去居酒屋，自己带便当',
          'Fewer izakaya nights, packed lunches',
        ),
        effects: [
          { type: 'money', delta: 60_000 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬到更便宜的公寓', 'Move to a cheaper flat'),
        effects: [
          { type: 'money', delta: -30_000 },
          { type: 'stat', key: 'mood', delta: -4 },
          { type: 'moved' },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
