import type { GameEvent, Text } from '../../model';
import type { PtEffect, PtFestival } from './rules';

type PtEvent = GameEvent<PtEffect, PtFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Everyday life on the hill, along the tram line and by the river. */
export const ptEvents: PtEvent[] = [
  {
    id: 'pt-recycling',
    channel: 'morning',
    title: t('回收桶前', 'At the recycling bins'),
    text: t(
      '法蒂玛奶奶举着一只酸奶杯站在三个彩色回收桶前，眯着眼看上面的小字。',
      'Dona Fátima stands before the three coloured bins holding a yoghurt pot, squinting at the small print.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'help',
        label: t('帮她看：黄桶', 'Read it for her: the yellow bin'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'friendship', npc: 'fatima', delta: 15 },
        ],
      },
      {
        id: 'rush',
        label: t('打个招呼，赶电车', 'Wave and run for the tram'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'pt-full-tram',
    channel: 'morning',
    title: t('挤满的电车', 'A packed tram'),
    text: t(
      '二十八路电车叮叮当当停下，车厢里挤满了举着相机的游客，连踏板上都站着人。',
      'The 28 tram clangs to a stop, crammed with camera-wielding tourists, people even on the step.',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'walk',
        label: t('走路下坡，顺路买个蛋挞', 'Walk downhill and grab a nata'),
        effects: [
          { type: 'money', delta: -2 },
          { type: 'stat', key: 'health', delta: 2 },
          { type: 'stat', key: 'mood', delta: 1 },
        ],
      },
      {
        id: 'squeeze',
        label: t('挤上去，抓紧扶手', 'Squeeze on and hold tight'),
        effects: [
          { type: 'stat', key: 'career', delta: 1 },
          { type: 'stat', key: 'mood', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'pt-wet-calcada',
    channel: 'morning',
    title: t('湿滑的石子路', 'Slippery calçada'),
    text: t(
      '雨把黑白石子路面浇得发亮。前面一位大叔滑了一下，抓住了你的胳膊。',
      'Rain has polished the black-and-white cobbles. A man ahead slips and grabs your arm.',
    ),
    weight: 3,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'steady',
        label: t('扶稳他，一起慢慢走', 'Steady him and walk on together'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
        note: t(
          '里斯本人行道铺的是手工拼的石子（calçada portuguesa），下雨天很滑。',
          'Lisbon pavements are hand-laid stone mosaics (calçada portuguesa), slippery in the rain.',
        ),
      },
      {
        id: 'bus',
        label: t('改坐公交', 'Take the bus instead'),
        effects: [
          { type: 'money', delta: -2 },
          { type: 'stat', key: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'pt-tax-season',
    channel: 'letter',
    season: 2,
    title: t('年度报税季', 'Tax return season'),
    text: t(
      '税务局的邮件提醒：今年的个人所得税申报开始了，系统已经帮你预填好。',
      'An email from the tax office: this year’s income tax return is open, and the system has pre-filled yours.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'check',
        label: t('逐项核对后提交', 'Check every line, then submit'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
      },
      {
        id: 'later',
        label: t('先存进待办', 'Save it to the to-do list'),
        effects: [{ type: 'stat', key: 'mood', delta: -1 }],
      },
    ],
  },
  {
    id: 'pt-social-security',
    channel: 'letter',
    title: t('社保的来信', 'A letter from social security'),
    text: t(
      '社保局寄来年度缴费明细，十二个月一行不少。',
      'Social security sends the yearly statement of contributions: all twelve months, none missing.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'file',
        label: t('收进申请材料文件夹', 'File it with the application papers'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'pt-flea-market',
    channel: 'place:green',
    title: t('周六跳蚤市场', 'Saturday flea market'),
    text: t(
      '广场上铺满了摊子：旧唱片、铁皮电车玩具、一箱拆下来的老瓷砖。',
      'Stalls cover the square: old records, tin tram toys, a crate of salvaged tiles.',
    ),
    weight: 3,
    once: true,
    requires: ['quarter-board-flea-market'],
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'tile',
        label: t('挑一块蓝色老瓷砖做杯垫', 'Pick a blue tile for a coaster'),
        effects: [
          { type: 'money', delta: -4 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
      },
      {
        id: 'browse',
        label: t('只逛不买，和摊主聊天', 'Just browse and chat'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'pt-heatwave',
    channel: 'morning',
    season: 3,
    title: t('热浪', 'Heatwave'),
    text: t(
      '天气预报说今天四十度。邻居们一早就把百叶窗全放下了。',
      'The forecast says forty degrees. The neighbours lowered every shutter at dawn.',
    ),
    weight: 3,
    once: true,
    when: [{ weather: 'sunny' }],
    choices: [
      {
        id: 'shade',
        label: t(
          '关窗喝水，午后再出门',
          'Shut the windows, drink water, go out later',
        ),
        effects: [{ type: 'stat', key: 'health', delta: 3 }],
      },
      {
        id: 'river',
        label: t('去河边吹风', 'Head for the river breeze'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'health', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'pt-winter-storm',
    channel: 'morning',
    season: 1,
    title: t('大西洋来的风雨', 'An Atlantic storm'),
    text: t(
      '夜里风把对面阳台的晾衣绳吹断了，一件蓝衬衫挂在了你家的窗台上。',
      'In the night the wind snapped the washing line opposite. A blue shirt is draped over your windowsill.',
    ),
    weight: 3,
    once: true,
    when: [{ weather: 'rain' }],
    choices: [
      {
        id: 'return',
        label: t('敲门把衬衫还回去', 'Knock and return the shirt'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'pt-river-cleanup',
    channel: 'place:pond',
    title: t('河岸清扫', 'Riverside clean-up'),
    text: t(
      '十几个街坊戴着手套沿河捡垃圾。杜阿尔特从石头缝里拖出一只旧凉鞋，高高举起。',
      'A dozen neighbours in gloves pick litter along the river. Duarte drags an old sandal from the rocks and holds it up high.',
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
          { type: 'friendship', npc: 'fatima', delta: 20 },
          { type: 'friendship', npc: 'duarte', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'pt-sardine-smoke',
    channel: 'place:green',
    season: 3,
    title: t('飘过来的炭烟', 'Smoke on the breeze'),
    text: t(
      '有人在楼门口支起小炭炉烤沙丁鱼，烟顺着坡往上飘，整条街都闻得到。',
      'Someone has set up a little grill on their doorstep for sardines. The smoke drifts up the hill and the whole street can smell it.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'taste',
        label: t('被招呼过去尝一条', 'Get waved over for a taste'),
        effects: [
          { type: 'item', item: 'sardinha', delta: 1 },
          { type: 'stat', key: 'mood', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'pt-washing-line',
    channel: 'place:home',
    title: t('窗外的晾衣绳', 'The washing line'),
    text: t(
      '楼上阿姨的一只袜子掉在了你的晾衣绳上，她从窗口探出头喊：「对不起呀！」',
      'A sock from upstairs has landed on your washing line. The lady above leans out: “Sorry, dear!”',
    ),
    weight: 2,
    choices: [
      {
        id: 'basket',
        label: t('放进她吊下来的小篮子', 'Put it in the basket she lowers'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'pt-captain-cat',
    channel: 'place:green',
    title: t('船长', 'Captain'),
    text: t(
      '广场上那只橘猫跳上长椅，在你身边趴下。杜阿尔特说：「它叫船长，它选中你了。」',
      'The ginger cat on the square jumps onto the bench and settles beside you. Duarte says: “That’s Captain. He’s chosen you.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'stroke',
        label: t('轻轻摸摸它的头', 'Stroke his head gently'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'duarte', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'pt-sueca',
    channel: 'place:green',
    title: t('缺一个牌搭子', 'One player short'),
    text: t(
      '石桌边打纸牌的老人们少了一个人，冲你招手：「会打吗？不会我们教。」',
      'The old men playing cards at the stone table are one short. “Do you play? If not, we’ll teach you.”',
    ),
    weight: 2,
    once: true,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'sit',
        label: t('坐下学一局', 'Sit down and learn a hand'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'portuguese', delta: 2 },
        ],
        note: t(
          '这种四人纸牌叫 sueca，在葡萄牙的广场和公园很常见。',
          'The four-player card game is sueca, a fixture of Portuguese squares and parks.',
        ),
      },
      {
        id: 'watch',
        label: t('站在旁边看', 'Watch from the side'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'pt-consoada',
    channel: 'npc:fatima',
    speaker: 'fatima',
    season: 1,
    title: t('平安夜的邀请', 'A Christmas Eve invitation'),
    text: t(
      '法蒂玛奶奶拦住你：「平安夜来我家吃鳕鱼吧，一个人过节可不行。」',
      'Dona Fátima stops you: “Come for bacalhau on Christmas Eve. No one spends it alone on this street.”',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('带一盒蛋糕去', 'Go, with a cake'),
        effects: [
          { type: 'money', delta: -8 },
          { type: 'stat', key: 'mood', delta: 8 },
          { type: 'friendship', npc: 'fatima', delta: 30 },
        ],
      },
    ],
  },
  {
    id: 'pt-swallow-gift',
    channel: 'npc:fatima',
    speaker: 'fatima',
    title: t('一只陶瓷燕子', 'A ceramic swallow'),
    text: t(
      '法蒂玛奶奶把一只陶瓷燕子放在你手心：「燕子每年都回到同一个屋檐下。挂在门边吧。」',
      'Dona Fátima puts a ceramic swallow in your palm. “Swallows come back to the same eaves every year. Hang it by your door.”',
    ),
    weight: 3,
    once: true,
    when: [{ npc: 'fatima', heartsMin: 2 }],
    choices: [
      {
        id: 'thanks',
        label: t('道谢，挂在门边', 'Thank her and hang it by the door'),
        effects: [
          { type: 'item', item: 'andorinha', delta: 1 },
          { type: 'stat', key: 'mood', delta: 5 },
        ],
      },
    ],
  },
  {
    id: 'pt-sunita-ciple',
    channel: 'npc:sunita',
    speaker: 'sunita',
    title: t('苏妮塔的好消息', 'Sunita’s good news'),
    text: t(
      '苏妮塔在柜台后面举着手机给你看成绩：「CIPLE 过了！下周我请大家吃饺子。」',
      'Behind the counter, Sunita holds up her phone: “I passed CIPLE! Momo for everyone next week.”',
    ),
    weight: 2,
    once: true,
    when: [{ yearMin: 2 }],
    choices: [
      {
        id: 'cheer',
        label: t('鼓掌，问她听力怎么准备的', 'Cheer and ask how she prepared'),
        effects: [
          { type: 'friendship', npc: 'sunita', delta: 20 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
      },
    ],
  },
];

export const ptSystemEvents: PtEvent[] = [
  {
    id: 'system-exam-failed',
    channel: 'morning',
    title: t('考试结果', 'Exam result'),
    text: t(
      '这次 CIPLE 差一点。伊内斯老师在成绩单背面写：「听力进步很大，下次一定。」',
      'Not quite there with CIPLE this time. Inês writes on the back of the result: “Big progress in listening. Next time.”',
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
      '早上发烧到起不来。卫生中心的医生说要休息几天，多喝汤。',
      'A fever keeps you in bed. The health centre doctor says to rest a few days and drink plenty of soup.',
    ),
    weight: 0,
    choices: [
      {
        id: 'rest',
        label: t('请假，在家喝汤', 'Take leave and have soup at home'),
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
      '超市里放着一首老家的歌，你在货架前站了很久。',
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
        label: t('少去小酒馆，自己带饭', 'Fewer tasca nights, packed lunches'),
        effects: [
          { type: 'money', delta: 500 },
          { type: 'stat', key: 'mood', delta: -6 },
        ],
      },
      {
        id: 'cheap',
        label: t('搬到更便宜的房间', 'Move to a cheaper room'),
        effects: [
          { type: 'money', delta: -200 },
          { type: 'stat', key: 'mood', delta: -4 },
        ],
        sets: ['cheap-housing', 'quarter-housing-change'],
      },
    ],
  },
];
