import type { Npc, Text } from '../../model';
import type { PtFestival } from './rules';

type PtNpc = Npc<PtFestival>;
type Stops = PtNpc['schedule'][number]['stops'];
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/** Festival, wet workday, wet weekend, workday, weekend — first match wins. */
const schedule = (
  work: Stops,
  weekend: Stops,
  rain: Stops,
  wetWeekend: Stops,
  festival: Stops = [
    { from: 0, at: 'away' },
    { from: 540, at: 'green-stall' },
    { from: 1080, at: 'green' },
    { from: 1320, at: 'away' },
  ],
): PtNpc['schedule'] => [
  { festival: true, stops: festival },
  { weather: ['rain', 'snow'], dayKinds: ['workday'], stops: rain },
  {
    weather: ['rain', 'snow'],
    dayKinds: ['weekend', 'special'],
    stops: wetWeekend,
  },
  { dayKinds: ['workday'], stops: work },
  { dayKinds: ['weekend', 'special'], stops: weekend },
];
const lines = (
  npc: string,
  pairs: [string, string, Partial<PtNpc['lines'][number]>?][],
): PtNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const ptNpcs: PtNpc[] = [
  {
    id: 'fatima',
    name: t('法蒂玛·洛佩斯', 'Fátima Lopes'),
    role: t(
      '住了七十年的老街坊，社区菜园和街坊晚会的主心骨',
      'Seventy years in the bairro; the heart of the garden and the arraial',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'allotment-plots' },
        { from: 660, at: 'board' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'allotment' },
        { from: 1080, at: 'green-centre' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'board' },
        { from: 690, at: 'allotment-plots' },
        { from: 960, at: 'green-centre' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['caldo-verde', 'pao-de-lo'],
      liked: ['bica', 'turnip', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，这个我最爱。晚会那天你坐我旁边。',
        'Oh, my favourite. You sit next to me at the arraial.',
      ),
      liked: t(
        '谢谢你，孩子。手套先摘了，免得弄脏。',
        'Thank you, dear. Let me take my gloves off first.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'Kind of you. Leave it on the bench; I’ll fetch it later.',
      ),
      disliked: t(
        '这个……放回收桶那天再说吧。',
        'Hm… let’s save that for recycling day.',
      ),
    },
    lines: lines('fatima', [
      [
        '新来的？我是法蒂玛。黄桶放塑料，绿桶放玻璃，看不懂就来问我。',
        'New here? I’m Fátima. Yellow bin for plastic, green for glass. Ask me if it puzzles you.',
      ],
      [
        '这条街我住了七十年。电车还是那辆电车，开车的小伙子换了三茬。',
        'Seventy years on this street. Same tram, three generations of drivers.',
      ],
      [
        '冬天的芜菁叶最嫩，切成细丝煮汤，再放一片辣香肠。',
        'Winter turnip greens are the tenderest. Shred them fine for soup, with a slice of chouriço.',
        { season: 1 },
      ],
      [
        '四月二十五号那天，我年年在窗台插一朵康乃馨。',
        'Every 25 April I put a carnation on my windowsill.',
        { season: 2 },
      ],
      [
        '六月的彩纸拉花是我们这栋楼的女人们一张张剪出来的。',
        'The June garlands? The women in this building cut every one.',
        { season: 3 },
      ],
      [
        '十一月有几天总是放晴，我们叫它圣马丁的夏天。',
        'A few days in November always turn fine. We call it São Martinho’s summer.',
        { season: 4 },
      ],
      [
        '下雨天菜园里没活，我去甜品店坐坐，顺便听听街上的新闻。',
        'No garden work in the rain. I sit in the pastelaria and catch up on the news.',
        { weather: ['rain'] },
      ],
      [
        '你来了以后，我晒衣绳上掉的袜子总有人给我捡回来。',
        'Since you came, my fallen socks always find their way back from the line.',
        { heartsMin: 3 },
      ],
      [
        '我年轻时去过巴黎做工。头一年谁也不认识，后来那条街的面包师都叫我名字。',
        'I worked in Paris when I was young. The first year I knew no one; later the baker on my street called me by name.',
        { heartsMin: 6 },
      ],
      [
        '帮我看一下炭炉，别让沙丁鱼烤焦了，我去拿面包。',
        'Mind the grill for me, don’t let the sardines burn. I’m off for the bread.',
        { festival: 'santos' },
      ],
    ]),
  },
  {
    id: 'joaquim',
    name: t('若阿金·内维斯', 'Joaquim Neves'),
    role: t(
      '街角小酒馆老板，周末唱法朵，下午在河边钓鱼',
      'Owner of the Tasca da Esquina; sings fado and fishes the Tagus',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 690, at: 'pub' },
        { from: 900, at: 'pond' },
        { from: 1050, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'pond' },
        { from: 900, at: 'tasca-door' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 690, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['robalo', 'peixe-grelhado'],
      liked: ['corn', 'broa', 'bica'],
      disliked: ['doce-morango'],
    },
    reactions: {
      loved: t(
        '好鱼！今晚的黑板上就写你的名字。',
        'Now that’s a fish! Tonight it goes on the chalkboard with your name.',
      ),
      liked: t(
        '谢啦。下次来，橄榄我多给一碟。',
        'Thanks. Next time the olives are on me.',
      ),
      neutral: t('谢谢，放吧台上吧。', 'Thanks. Leave it on the bar.'),
      disliked: t(
        '甜的？我这儿配的是酒，不是早餐。',
        'Sweet? I serve wine here, not breakfast.',
      ),
    },
    lines: lines('joaquim', [
      [
        '欢迎来街角小酒馆。今天的套餐写在门口黑板上，别点菜单上没有的。',
        'Welcome to the Tasca da Esquina. Today’s dish is on the board by the door; don’t ask for what isn’t there.',
      ],
      [
        '唱法朵的时候要关灯，大家都别说话。这是规矩。',
        'When the fado starts, the lights go down and everyone hushes. That’s the rule.',
      ],
      [
        '涨潮的时候狼鲈会跟着进河口，你得比它们早到。',
        'Sea bass come up the estuary on the rising tide. Get there before them.',
      ],
      [
        '冬天客人少，我就把吉他拿出来，一个人唱给空椅子听。',
        'Winters are quiet. I take the guitar out and sing to the empty chairs.',
        { season: 1 },
      ],
      [
        '夏天的沙丁鱼最肥，一条要整整占满一片面包。',
        'Summer sardines are the fattest: one covers a whole slice of bread.',
        { season: 3 },
      ],
      [
        '下雨天河边没鱼，进来喝一杯吧。',
        'No fish by the river in this rain. Come in for a glass.',
        { weather: ['rain'] },
      ],
      [
        '你来了好几次了。坐吧台，那是常客的位子。',
        'You’ve been in a few times now. Sit at the bar; that’s for regulars.',
        { heartsMin: 3 },
      ],
      [
        '法朵唱的是「萨乌达德」，就是想念一个回不去的地方。你大概懂。',
        'Fado sings saudade: missing a place you can’t go back to. You probably know it.',
        { heartsMin: 6 },
      ],
      [
        '栗子要先划一刀再烤，不然会在炉子里炸开。',
        'Score the chestnuts before roasting, or they burst in the fire.',
        { festival: 'magusto' },
      ],
    ]),
  },
  {
    id: 'ines',
    name: t('伊内斯·卡瓦略', 'Inês Carvalho'),
    role: t('社区中心葡语课老师', 'Teacher of the community Portuguese class'),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'library' },
        { from: 840, at: 'college-steps' },
        { from: 960, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe-terrace' },
        { from: 720, at: 'miradouro-view' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'library' },
        { from: 960, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['pastel-de-nata', 'flowers'],
      liked: ['bica', 'strawberry', 'andorinha'],
      disliked: ['carapau'],
    },
    reactions: {
      loved: t(
        '太好了！这个我拿去课上，奖励发音最好的同学。',
        'Lovely! I’ll take it to class for whoever has the best pronunciation.',
      ),
      liked: t('谢谢！obrigada！', 'Thank you! Obrigada!'),
      neutral: t('有心了，谢谢。', 'That’s thoughtful, thank you.'),
      disliked: t(
        '呃……鱼放我包里一整天会怎样？',
        'Er… what happens to a fish in my bag all day?',
      ),
    },
    lines: lines('ines', [
      [
        '你好，我是伊内斯。我们的课不考语法表，先学怎么在甜品店点单。',
        'Hello, I’m Inês. No grammar tables first in my class: we start with ordering at the pastelaria.',
      ],
      [
        '葡语的鼻音别害怕，把嘴闭小一点，想象你在哼歌。',
        'Don’t fear the nasal vowels. Close your mouth a little and imagine humming.',
      ],
      [
        'CIPLE 的听力是日常对话：车站广播、电话留言、超市对话。',
        'The CIPLE listening is everyday stuff: station announcements, voicemails, shop talk.',
      ],
      [
        '春天我带学生去观景台上课，看着河背单词记得牢。',
        'In spring I teach on the miradouro. Words stick better with a river view.',
        { season: 2 },
      ],
      [
        '下雨天来图书馆吧，二楼有一角全是简单葡语的小说。',
        'Come to the library when it rains. There’s a corner upstairs of easy-Portuguese novels.',
        { weather: ['rain'] },
      ],
      [
        '你说「bom dia」的口音越来越像这条街的人了。',
        'Your “bom dia” sounds more like this street every week.',
        { heartsMin: 3 },
      ],
      [
        '我妈妈是从安哥拉回来的，她说学一门语言就是给自己多开一扇窗。',
        'My mother came back from Angola. She says each language is another window in your house.',
        { heartsMin: 6 },
      ],
      [
        '康乃馨日的歌你听得懂吗？我们下节课就学这首。',
        'Can you follow the Carnation Day songs? We’ll learn one next lesson.',
        { festival: 'cravos' },
      ],
    ]),
  },
  {
    id: 'sunita',
    name: t('苏妮塔·古隆', 'Sunita Gurung'),
    role: t(
      '街角杂货铺的店员，从尼泊尔来，在准备 CIPLE',
      'Mercearia shop assistant from Nepal, preparing for CIPLE',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 840, at: 'cafe-terrace' },
        { from: 900, at: 'shop' },
        { from: 1080, at: 'college' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 900, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 1080, at: 'college' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 1080, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['pastel-de-nata', 'broa'],
      liked: ['bica', 'potato', 'tomato'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哇！这个我留到午休，配一杯茶。',
        'Oh! I’m saving this for my break, with a cup of tea.',
      ),
      liked: t(
        '谢谢你，下次给你留最好的西红柿。',
        'Thanks. I’ll keep you the best tomatoes.',
      ),
      neutral: t('谢谢，我收下啦。', 'Thanks, I’ll take it.'),
      disliked: t(
        '这个……店里的垃圾桶在后门。',
        'Um… the bins are out the back.',
      ),
    },
    lines: lines('sunita', [
      [
        '你好！我叫苏妮塔。找香菜还是找姜？在第二排最下面。',
        'Hi! I’m Sunita. Looking for coriander or ginger? Bottom of the second aisle.',
      ],
      [
        '我在这家店三年了。老板说我的葡语已经比他的英语好。',
        'Three years in this shop. The owner says my Portuguese beats his English now.',
      ],
      [
        '晚上我去伊内斯老师的课。考 CIPLE 要过听力，我每天听收音机。',
        'Evenings I go to Inês’s class. CIPLE has listening, so I play the radio all day.',
      ],
      [
        '夏天店里冰水卖得最快，下午三点以后就空了。',
        'In summer the cold water sells out by three.',
        { season: 3 },
      ],
      [
        '下雨天客人都来买面包和牛奶，柜台排到门口。',
        'Rainy days everyone comes for bread and milk; the queue reaches the door.',
        { weather: ['rain'] },
      ],
      [
        '谢谢你常来。我们一起练听力吧，我念，你猜。',
        'Thanks for coming by so often. Let’s practise listening: I read, you guess.',
        { heartsMin: 3 },
      ],
      [
        '我想有一天在这条街上开一家自己的小店，卖尼泊尔饺子。',
        'One day I want my own shop on this street, selling momo.',
        { heartsMin: 6 },
      ],
      [
        '晚会这天我们店卖罗勒小盆栽，每盆插一首小诗。',
        'For the arraial we sell little basil pots, each with a short poem.',
        { festival: 'santos' },
      ],
    ]),
  },
  {
    id: 'rui',
    name: t('鲁伊·帕谢科', 'Rui Pacheco'),
    role: t('公民服务中心的窗口职员', 'Clerk at the Loja do Cidadão'),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'cafe' },
        { from: 510, at: 'ward' },
        { from: 1170, at: 'tasca-door' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'riverside' },
        { from: 780, at: 'green-centre' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'cafe' },
        { from: 510, at: 'ward' },
        { from: 1170, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 720, at: 'cafe' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['bica', 'batatas-murro'],
      liked: ['pastel-de-nata', 'corn'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '正好！窗口一开就没空吃饭了。',
        'Perfect! Once the counter opens there’s no time to eat.',
      ),
      liked: t('谢谢，谢谢。', 'Thanks, thanks.'),
      neutral: t('谢谢，我收着。', 'Thank you, I’ll keep it.'),
      disliked: t(
        '这个……不在我们中心的服务清单上。',
        'That… isn’t on our list of services.',
      ),
    },
    lines: lines('rui', [
      [
        '早！我是鲁伊，在公民服务中心。取号机在门口，别排错队。',
        'Morning! I’m Rui from the Loja do Cidadão. The ticket machine is by the door; don’t join the wrong queue.',
      ],
      [
        '无犯罪记录证明当场就能打出来，带上护照和居留卡。',
        'A criminal record certificate prints on the spot. Bring your passport and residence card.',
      ],
      [
        '社保缴费记录也能在我们这儿打，比在家折腾网站快。',
        'We can print your social security record too. Quicker than fighting the website at home.',
      ],
      [
        '一月和四月窗口最忙，大家都在办年度的事。',
        'January and April are the busiest at the counter; everyone has yearly paperwork.',
        { season: 2 },
      ],
      [
        '下雨天的号排得最长，大家都不想在外面等。',
        'Rainy days have the longest queues: no one wants to wait outside.',
        { weather: ['rain'] },
      ],
      [
        '你上次带的材料齐得很，我们窗口都夸你。',
        'Your papers last time were spotless. The whole counter noticed.',
        { heartsMin: 3 },
      ],
      [
        '其实我爷爷当年去德国打过工。表格上的每一栏，我都想象是他在填。',
        'My grandfather worked in Germany once. Every form I check, I picture him filling it in.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'mariana',
    name: t('玛丽安娜·科斯塔', 'Mariana Costa'),
    role: t(
      '燕子甜品店老板，蛋挞每天烤三炉',
      'Owner of the Pastelaria Andorinha; three batches of nata a day',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 900, at: 'cafe-terrace' },
        { from: 960, at: 'cafe' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'cafe' },
        { from: 840, at: 'miradouro-view' },
        { from: 960, at: 'cafe' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'cafe' },
        { from: 1140, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['doce-morango', 'strawberry'],
      liked: ['flowers', 'andorinha', 'corn'],
      disliked: ['carapau'],
    },
    reactions: {
      loved: t(
        '这能做一批新口味！明天来尝。',
        'That’s a new flavour for tomorrow’s batch! Come and taste.',
      ),
      liked: t(
        '谢谢，放在收银台边上正好。',
        'Thank you, it’ll look lovely by the till.',
      ),
      neutral: t('谢谢你记得我。', 'Thanks for thinking of me.'),
      disliked: t(
        '鱼……我的店里只能闻到黄油味。',
        'Fish… my shop is only allowed to smell of butter.',
      ),
    },
    lines: lines('mariana', [
      [
        '早上好！第一炉蛋挞七点半出炉，撒肉桂粉还是糖粉随你。',
        'Bom dia! The first nata batch is out at half seven. Cinnamon or icing sugar, as you like.',
      ],
      [
        '在这儿点咖啡要说 uma bica，说 espresso 大家就知道你刚来。',
        'Here you ask for uma bica. Say espresso and everyone knows you’re new.',
      ],
      [
        '一月我们卖国王蛋糕，吃到蚕豆的人明年要请客。',
        'In January we sell bolo-rei. Whoever finds the bean buys next year’s.',
        { season: 1 },
      ],
      [
        '夏天游客多，我把好位子留给街坊。',
        'Summer brings the tourists, but the good tables stay for the neighbours.',
        { season: 3 },
      ],
      [
        '下雨天甜品店最暖和，进来吧。',
        'Rainy days, the pastelaria is the warmest room on the street. Come in.',
        { weather: ['rain'] },
      ],
      [
        '你每次都坐窗边。下次我把那张桌子给你留着。',
        'You always take the window seat. I’ll keep that table for you.',
        { heartsMin: 3 },
      ],
      [
        '这家店是我外婆开的。她说，好的甜品店是一条街的客厅。',
        'My grandmother opened this place. She said a good pastelaria is the street’s living room.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'thiago',
    name: t('蒂亚戈·莫拉', 'Thiago Moura'),
    role: t(
      '从巴西来的自行车修理匠，拿到了永久居留',
      'Bike mechanic from Brazil, now a permanent resident',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'tram-stop' },
        { from: 780, at: 'cafe-terrace' },
        { from: 840, at: 'tram-stop' },
        { from: 1080, at: 'green-centre' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'riverside' },
        { from: 780, at: 'miradouro-view' },
        { from: 960, at: 'green-centre' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'station' },
        { from: 1080, at: 'pub' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 900, at: 'pub' },
        { from: 1140, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['broa', 'sardinha'],
      liked: ['bica', 'corn', 'tainha'],
      disliked: ['flowers'],
    },
    reactions: {
      loved: t(
        '好家伙！这个我吃不腻。',
        'Now you’re talking! I never tire of this.',
      ),
      liked: t('谢了，兄弟。', 'Thanks, friend.'),
      neutral: t(
        '谢谢，我挂车把上。',
        'Thanks. I’ll hang it on the handlebars.',
      ),
      disliked: t('花？我这满手机油……', 'Flowers? With my oily hands…'),
    },
    lines: lines('thiago', [
      [
        '嘿！我是蒂亚戈，修车的。坡这么陡，刹车片得常换。',
        'Hey! Thiago, bike repairs. Hills like these eat brake pads.',
      ],
      [
        '我刚来的时候送外卖，这里每条坡我都推着车爬过。',
        'When I arrived I delivered food. I’ve pushed a bike up every hill in this bairro.',
      ],
      [
        'AIMA 的预约要早点抢。材料复印两份，原件也带上。',
        'Book the AIMA appointment early. Two copies of everything, and bring the originals.',
      ],
      [
        '夏天在河边骑车，风从河口吹进来，比空调还舒服。',
        'Summer rides along the river: the estuary breeze beats air conditioning.',
        { season: 3 },
      ],
      [
        '下雨天没人修车，我去地铁站躲雨，顺便帮人搬婴儿车。',
        'No repairs in the rain. I shelter in the Metro and help people with pushchairs.',
        { weather: ['rain'] },
      ],
      [
        '你的车我给你按成本价修。别跟别人说。',
        'Your bike I fix at cost. Don’t tell anyone.',
        { heartsMin: 3 },
      ],
      [
        '拿到永居那天我在观景台坐了一下午，什么也没干，就看河。',
        'The day my permanent residence came through, I sat on the miradouro all afternoon and just watched the river.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'duarte',
    name: t('杜阿尔特·洛佩斯', 'Duarte Lopes'),
    role: t(
      '法蒂玛的孙子，十岁，河边的鲻鱼专家',
      'Fátima’s grandson, ten, the riverside mullet expert',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'riverside' },
        { from: 1140, at: 'green-centre' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'riverside' },
        { from: 780, at: 'green-centre' },
        { from: 960, at: 'allotment-plots' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'library' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'green-stall' },
        { from: 1080, at: 'green' },
        { from: 1260, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['tainha', 'castanhas'],
      liked: ['pastel-de-nata', 'strawberry', 'bolo-rei'],
      disliked: ['bica'],
    },
    reactions: {
      loved: t('哇！我要拿给奶奶看！', 'Wow! I’m showing Grandma!'),
      liked: t('谢谢！', 'Thanks!'),
      neutral: t('哦，谢谢。', 'Oh, thanks.'),
      disliked: t(
        '好苦……大人怎么喝得下去？',
        'So bitter… how do grown-ups drink this?',
      ),
    },
    lines: lines('duarte', [
      [
        '你也钓鱼吗？鲻鱼最好钓，它们什么都吃。',
        'Do you fish too? Mullet are the easiest; they eat anything.',
      ],
      [
        '我能分清每一辆电车的声音，二十八路的铃最响。',
        'I can tell every tram by its sound. The 28 has the loudest bell.',
      ],
      [
        '广场上那只橘猫叫船长，它只让我摸。',
        'The ginger cat on the square is called Captain. It only lets me stroke it.',
      ],
      [
        '圣诞假期奶奶会做炸甜面包，我能吃六个。',
        'At Christmas Grandma makes sweet fried bread. I can eat six.',
        { season: 1 },
      ],
      [
        '暑假我天天在河边，晒得像一条烤沙丁鱼。',
        'All summer I’m by the river, tanned like a grilled sardine.',
        { season: 3 },
      ],
      [
        '我教你看浮标，它一沉你就拉！',
        'I’ll teach you the float: when it dips, you pull!',
        { heartsMin: 3 },
      ],
      [
        '等我长大，要开那辆二十八路电车，带你绕城一圈。',
        'When I grow up I’ll drive the 28 tram and take you all round the city.',
        { heartsMin: 6 },
      ],
      [
        '奶奶说今年我可以帮忙烤栗子了！',
        'Grandma says I can help roast the chestnuts this year!',
        { festival: 'magusto' },
      ],
    ]),
  },
  {
    id: 'miguel',
    name: t('米格尔·索萨', 'Miguel Sousa'),
    role: t(
      '塞莱斯特的丈夫，电车司机，早晚轮班',
      'Celeste’s husband, a tram driver on early and late shifts',
    ),
    characters: ['partner'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 330, at: 'away' },
        { from: 930, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'home' },
        { from: 900, at: 'miradouro-view' },
        { from: 1020, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 330, at: 'away' },
        { from: 930, at: 'home' },
      ],
      [{ from: 0, at: 'home' }],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1260, at: 'home' },
      ],
    ),
    gifts: {
      loved: ['caldo-verde', 'peixe-grelhado'],
      liked: ['pao-de-lo', 'tomato', 'castanhas'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '收车回来就有这个……谢谢你，塞莱斯特。',
        'Off the tram to this… thank you, Celeste.',
      ),
      liked: t('谢啦，我们一起吃。', 'Thanks. Let’s share it.'),
      neutral: t('谢谢，我先放冰箱。', 'Thanks. Into the fridge for now.'),
      disliked: t('这是……从河里捞的吧？', 'Is that… from the river?'),
    },
    lines: lines('miguel', [
      [
        '今天二十八路又挤满了游客，我按了一路的铃。',
        'The 28 was packed with tourists again. I rang the bell all the way.',
      ],
      [
        '托马斯今天学会说「电车」了，虽然听起来像「叮叮」。',
        'Tomás said “tram” today, though it sounded more like “ding-ding”.',
      ],
      [
        '你的卡舒帕比我妈的炖菜还香，这话别告诉她。',
        'Your cachupa beats my mother’s stew. Don’t tell her I said so.',
      ],
      [
        '雨天开电车最怕下坡，铁轨滑得像抹了油。',
        'Downhill in the rain is the worst: the rails are like oil.',
        { weather: ['rain'] },
      ],
      [
        '等托马斯大一点，我们带他去明德卢看外婆。',
        'When Tomás is bigger, we’ll take him to Mindelo to see his grandmother.',
        { heartsMin: 3 },
      ],
      [
        '晚会上我们跳的第一支舞，你还记得是哪首吗？',
        'Do you remember the first song we danced to at the arraial?',
        { festival: 'santos' },
      ],
    ]),
  },
];
