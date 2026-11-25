import type { GameEvent, Text } from '../../model';
import type { NzEffect, NzFestival } from './rules';

type NzEvent = GameEvent<NzEffect, NzFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the bay: the dairy, the wharf, the weather and the seasons. */
export const nzEvents: NzEvent[] = [
  {
    id: 'nz-recycling-day',
    channel: 'morning',
    title: t('回收日', 'Recycling day'),
    text: t(
      '路边一排黄盖箱。Mere 正把一只没冲干净的酸奶盒举到阳光下。',
      'A row of yellow-lid bins along the kerb. Mere holds an unrinsed yoghurt pot up to the light.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'rinse',
        label: t('帮她把盒子冲干净', 'Help her rinse the pots'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'mere', delta: 15 },
        ],
      },
      {
        id: 'rush',
        label: t('打个招呼，赶去上班', 'Say hello and hurry to work'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'nz-four-seasons',
    channel: 'morning',
    title: t('一天过完四季', 'Four seasons in one day'),
    text: t(
      '出门时阳光灿烂，走到街角突然刮起南风，气温一下掉了十度，接着下起冰雹。',
      'Sunshine when you leave, then a southerly at the corner: the temperature drops ten degrees and hail starts to fall.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'dairy',
        label: t('躲进街角小店买杯热饮', 'Duck into the dairy for a hot drink'),
        effects: [
          { type: 'money', delta: -4 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
      {
        id: 'run',
        label: t('一路小跑回家拿外套', 'Jog home for a jacket'),
        effects: [
          { type: 'stat', key: 'health', delta: 1 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
        note: t(
          '新西兰人出门常备一件外套，天气说变就变。',
          'Kiwis keep a jacket handy: the weather turns fast.',
        ),
      },
    ],
  },
  {
    id: 'nz-dairy-ice-cream',
    channel: 'place:shop',
    title: t('一勺 hokey pokey', 'A scoop of hokey pokey'),
    text: t(
      '小店的冰柜里有蜂巢糖冰淇淋（hokey pokey）。Nikau 趴在玻璃上看了半天。',
      'The dairy freezer has hokey pokey ice cream with honeycomb toffee. Nikau has his nose against the glass.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'treat',
        label: t('请他吃一个双球甜筒', 'Treat him to a double scoop'),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'friendship', npc: 'nikau', delta: 20 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'single',
        label: t('自己来一个单球', 'Get yourself a single scoop'),
        effects: [
          { type: 'money', delta: -4 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'nz-earthquake-drill',
    channel: 'letter',
    title: t('地震演练通知', 'Earthquake drill notice'),
    text: t(
      '社区的通知写着：地震时趴下、掩护、抓牢；地震持续很久或很强，就往山坡上走，别等海啸警报。',
      'The notice says: drop, cover and hold. If a quake is long or strong, head uphill without waiting for a tsunami warning.',
    ),
    weight: 3,
    once: true,
    requires: ['quarter-board-drill'],
    choices: [
      {
        id: 'join',
        label: t(
          '参加演练，走一遍撤离路线',
          'Join the drill and walk the route',
        ),
        effects: [
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'friendship', npc: 'mere', delta: 15 },
        ],
      },
      {
        id: 'kit',
        label: t('收拾一个应急包放在门口', 'Pack a grab bag by the door'),
        effects: [
          { type: 'money', delta: -40 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'nz-beach-cleanup',
    channel: 'place:pond',
    title: t('海滩清洁日', 'Beach clean-up'),
    text: t(
      '十几个邻居戴着手套沿海滩捡垃圾。Nikau 从海草里拖出一只人字拖，得意地举过头顶。',
      'A dozen neighbours in gloves comb the beach. Nikau drags a jandal out of the seaweed and holds it up in triumph.',
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
          { type: 'friendship', npc: 'mere', delta: 20 },
          { type: 'friendship', npc: 'nikau', delta: 20 },
          { type: 'item', item: 'paua-shell', delta: 1 },
        ],
        note: t(
          '你在礁石边捡到一块闪着蓝绿光的鲍鱼壳（pāua）。',
          'By the rocks you find a pāua shell shining blue and green.',
        ),
      },
    ],
  },
  {
    id: 'nz-beach-christmas',
    channel: 'morning',
    season: 1,
    title: t('海边的圣诞节', 'Christmas at the beach'),
    text: t(
      '十二月的阳光晒得人发烫。邻居们在海边支起燃气烤炉，pōhutukawa 开满了红花。',
      'December sun beats down. The neighbours set up gas barbecues by the sea, and the pōhutukawa are covered in red flowers.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'bbq',
        label: t('带一盘沙拉加入烧烤', 'Bring a salad to the barbecue'),
        effects: [
          { type: 'money', delta: -20 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'bruce', delta: 15 },
        ],
      },
      {
        id: 'swim',
        label: t('先下海游一圈', 'Swim first'),
        effects: [
          { type: 'stat', key: 'health', delta: 3 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'nz-sunburn',
    channel: 'morning',
    season: 1,
    title: t('紫外线', 'Strong sun'),
    text: t(
      '在码头待了一个小时，胳膊就晒红了。Grace 说这里的紫外线比你想的强得多。',
      'An hour on the wharf and your arms are pink. Grace says the UV here is far stronger than you think.',
    ),
    weight: 2,
    when: [{ weather: 'sunny' }],
    choices: [
      {
        id: 'sunscreen',
        label: t(
          '买防晒霜和一顶宽檐帽',
          'Buy sunscreen and a wide-brimmed hat',
        ),
        effects: [
          { type: 'money', delta: -35 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'shade',
        label: t(
          '躲到 pōhutukawa 的树荫下',
          'Retreat to the shade of a pōhutukawa',
        ),
        effects: [{ type: 'stat', key: 'health', delta: -1 }],
      },
    ],
  },
  {
    id: 'nz-anzac-day',
    channel: 'morning',
    season: 2,
    title: t('澳新军团日的清晨', 'Anzac Day at dawn'),
    text: t(
      '四月底的清晨，纪念碑前站满了人。号声响起，没有人说话。',
      'At dawn in late April, people stand silent at the memorial. The bugle sounds.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'attend',
        label: t('去参加黎明纪念仪式', 'Attend the dawn service'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'hamish', delta: 15 },
        ],
      },
      {
        id: 'bake',
        label: t(
          '在家照着食谱烤 Anzac 饼干',
          'Bake Anzac biscuits from the recipe',
        ),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'item', item: 'anzac-biscuits', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'nz-feijoa-box',
    channel: 'morning',
    season: 2,
    title: t('费约果季', 'Feijoa season'),
    text: t(
      '邻居门口放着一箱费约果，纸板上写着“随便拿”。整条街都是它的香味。',
      'A box of feijoas sits at a neighbour’s gate with a sign: “help yourself”. The whole street smells of them.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'take',
        label: t(
          '拿一袋，切开用勺子挖着吃',
          'Take a bag and scoop them with a spoon',
        ),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
      {
        id: 'share',
        label: t('拿几个送去咖啡馆', 'Take a few to the café'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'grace', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'nz-tax-refund',
    channel: 'letter',
    season: 2,
    title: t('税务局的年度结算', 'Inland Revenue’s year-end'),
    text: t(
      '税务局（IRD）的邮件说，上一个纳税年度已经自动结算，有一笔小小的退税。',
      'An email from Inland Revenue: last tax year has been assessed automatically, with a small refund.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'save',
        label: t('存起来', 'Put it aside'),
        effects: [
          { type: 'money', delta: 186 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
        note: t(
          '虚构的退税金额。税务居民身份是永久居民签证的承诺方式之一（SRC-072 RV2.5.5），本局按在境天数评估。',
          'A fictional refund. Tax residence is one way to show commitment for a permanent resident visa (SRC-072 RV2.5.5); this game assesses days in New Zealand instead.',
        ),
      },
    ],
  },
  {
    id: 'nz-damp-house',
    channel: 'place:home',
    season: 3,
    title: t('窗上的水汽', 'Condensation'),
    text: t(
      '冬天的早上，窗户内侧全是水珠，墙角冒出一小片霉斑。',
      'On winter mornings the windows stream on the inside, and a patch of mould appears in the corner.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'dehumidifier',
        label: t('买一台除湿机', 'Buy a dehumidifier'),
        effects: [
          { type: 'money', delta: -180 },
          { type: 'stat', key: 'health', delta: 4 },
        ],
      },
      {
        id: 'air',
        label: t(
          '每天开窗通风，擦干窗台',
          'Air the house daily and wipe the sills',
        ),
        effects: [
          { type: 'stat', key: 'health', delta: 1 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'nz-rugby-night',
    channel: 'place:pub',
    title: t('橄榄球之夜', 'Rugby night'),
    text: t(
      '国家队今晚比赛，酒馆里挤满了穿黑衣服的人。开球前，全场跟着电视里的哈卡（haka）安静下来。',
      'The national team plays tonight and the tavern is packed with people in black. Before kick-off the room falls quiet for the haka on screen.',
    ),
    weight: 2,
    once: true,
    when: [{ minuteMin: 1080 }],
    choices: [
      {
        id: 'stay',
        label: t('留下来看完全场', 'Stay for the whole match'),
        effects: [
          { type: 'money', delta: -15 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'sione', delta: 20 },
        ],
      },
      {
        id: 'half',
        label: t('看完上半场就回家', 'Watch the first half, then head home'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'nz-daylight-saving',
    channel: 'morning',
    season: 4,
    title: t('夏令时开始', 'Daylight saving starts'),
    text: t(
      '时钟拨快了一小时。你睡眼惺忪，可傍晚的阳光一直亮到八点。',
      'The clocks went forward an hour. You’re bleary-eyed, but the evening light lasts past eight.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'walk',
        label: t('下班后去海边散步', 'Walk the beach after work'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'sleep',
        label: t(
          '早点睡，把那一小时补回来',
          'Turn in early to get the hour back',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'nz-whitebait',
    channel: 'place:pond',
    season: 4,
    title: t('银鱼季', 'Whitebait season'),
    text: t(
      '河口站着一排拿网的人，安静得像在钓鱼比赛。Bruce 说今晚店里有银鱼煎饼（whitebait fritter）。',
      'A row of people with nets stands silent at the river mouth. Bruce says there are whitebait fritters at the shop tonight.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'fritter',
        label: t('去店里买一个尝尝', 'Buy one to try'),
        effects: [
          { type: 'money', delta: -14 },
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'bruce', delta: 15 },
        ],
      },
      {
        id: 'watch',
        label: t('站在桥上看一会儿', 'Watch from the bridge for a while'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'nz-tui-song',
    channel: 'morning',
    season: 4,
    title: t('kōwhai 树上的 tūī', 'A tūī in the kōwhai'),
    text: t(
      '窗外的 kōwhai 开满黄花。一只 tūī 倒挂着喝花蜜，唱出一串像水滴一样的声音。',
      'The kōwhai outside is full of yellow flowers. A tūī hangs upside down sipping nectar and sings like water droplets.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'record',
        label: t('录下来发给 Nikau', 'Record it for Nikau'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'nikau', delta: 15 },
        ],
      },
      {
        id: 'listen',
        label: t('泡杯茶，静静听', 'Make tea and listen'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'nz-small-quake',
    channel: 'morning',
    title: t('夜里摇了一下', 'A shake in the night'),
    text: t(
      '半夜床晃了几秒，窗户咔咔响。早上大家在咖啡馆里讨论：“你感觉到了吗？”',
      'The bed rocked for a few seconds in the night and the windows rattled. At the café everyone asks: “Did you feel it?”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'chat',
        label: t(
          '加入讨论，顺便把应急包补齐',
          'Join in, then top up your grab bag',
        ),
        effects: [
          { type: 'money', delta: -20 },
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'grace', delta: 10 },
        ],
      },
      {
        id: 'shrug',
        label: t(
          '学当地人耸耸肩：“就一下嘛”',
          'Shrug like a local: “Just a wee one”',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 1 }],
      },
    ],
  },
  {
    id: 'nz-quiz-team',
    channel: 'npc:hamish',
    speaker: 'hamish',
    title: t('问答夜缺一个人', 'One short for quiz night'),
    text: t(
      'Hamish 说图书馆队缺一个人：“你知道你们国家的首都，我们就赢定了。”',
      'Hamish says the library team is one short. “If you know your own capital city, we’ve got it in the bag.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'join',
        label: t('答应，下周二去', 'Say yes for next Tuesday'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'hamish', delta: 25 },
        ],
      },
    ],
  },
];

export const nzSystemEvents: NzEvent[] = [
  {
    id: 'system-hospital',
    channel: 'morning',
    title: t('身体按下暂停', 'Your body hits pause'),
    text: t(
      '早上发烧到起不来。医疗中心的医生说要休息几天，给你开了病假条。',
      'A fever keeps you in bed. The GP says to rest for a few days and signs a medical certificate.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请病假，在家喝汤', 'Take sick leave and have soup at home'),
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
          { type: 'money', delta: -30 },
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
        label: t('少去酒馆，自己带午饭', 'Fewer tavern nights, packed lunches'),
        effects: [
          { type: 'money', delta: 700 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬去合租，房租便宜些', 'Move into a cheaper flatshare'),
        effects: [
          { type: 'money', delta: -300 },
          { type: 'stat', key: 'mood', delta: -4 },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
