import type { Npc, Text } from '../../model';
import type { UsFestival } from './rules';

type UsNpc = Npc<UsFestival>;
type Stops = UsNpc['schedule'][number]['stops'];
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
    { from: 1350, at: 'away' },
  ],
): UsNpc['schedule'] => [
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
  pairs: [string, string, Partial<UsNpc['lines'][number]>?][],
): UsNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const usNpcs: UsNpc[] = [
  {
    id: 'dolores',
    name: t('多洛蕾斯·鲁伊斯', 'Dolores Ruiz'),
    role: t(
      '街区俱乐部会长，社区菜园老手',
      'Block club president and garden regular',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'allotment-plots' },
        { from: 660, at: 'board' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'allotment' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'board' },
        { from: 690, at: 'allotment-plots' },
        { from: 960, at: 'park-bench' },
        { from: 1080, at: 'away' },
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
      loved: ['corn-chowder', 'strawberry-shortcake'],
      liked: ['tomato', 'flowers', 'coffee', 'elote'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '¡Ay, qué rico! 下次街区聚餐，你坐我旁边。',
        '¡Ay, qué rico! Next block party, you sit by me.',
      ),
      liked: t(
        '谢谢你，cariño。我先把手套摘了。',
        'Thank you, cariño. Let me take my gloves off first.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'Kind of you. Leave it on the bench; I’ll get it later.',
      ),
      disliked: t(
        '这个……留着下次清理湖滩的时候再说吧。',
        'Hm… let’s save that for the next beach cleanup.',
      ),
    },
    lines: lines('dolores', [
      [
        '新搬来的？我是街区俱乐部的多洛蕾斯。回收日和扫街日都贴在告示板上，看不懂就来问我。',
        'New here? I’m Dolores from the block club. Recycling and street-sweeping days are on the board. Ask me if they puzzle you.',
      ],
      [
        '扫街那天别把车停在橙色牌子那边，罚单可不便宜。',
        'Don’t park on the orange-sign side on sweeping day. Those tickets aren’t cheap.',
      ],
      [
        '下雪天谁家门口铲干净了，就能在车位上放把椅子占着。这是芝加哥的老规矩，别动别人的椅子。',
        'Shovel out a parking spot after a snow and you can save it with a chair. Old Chicago rule — never move someone’s chair.',
        { season: 1 },
      ],
      [
        '番茄苗要等五月中旬再下地，湖风一冷就全蔫了。',
        'Tomatoes go in after mid-May. One cold lake wind and they wilt.',
        { season: 2 },
      ],
      [
        '七月的玉米最甜。烤的时候抹一点蛋黄酱和辣椒粉，跟我妈妈做的一样。',
        'July corn is the sweetest. Mayo and chili powder on the grill, like my mother made it.',
        { season: 3 },
      ],
      [
        '万圣节前我会把门廊摆满南瓜。去年有个小恐龙吃了三块糖还不肯走。',
        'Before Halloween I fill the porch with pumpkins. Last year a little dinosaur took three candies and still wouldn’t leave.',
        { season: 4 },
      ],
      [
        '下雨天菜园没活，我在小餐馆把下个月的会议记录写好。',
        'No garden work in the rain. I’m writing next month’s meeting notes at the diner.',
        { weather: ['rain'] },
      ],
      [
        '五月五日那天来公园，我教你跳舞。脚步不对没关系，笑就对了。',
        'Come to the park on Cinco de Mayo and I’ll teach you to dance. Wrong steps are fine — just smile.',
        { festival: 'cinco-de-mayo' },
      ],
      [
        '我五十年前从瓜达拉哈拉来的时候，一句英语都不会。现在我是会长了，你说好不好笑？',
        'When I came from Guadalajara fifty years ago I didn’t speak a word of English. Now I’m the president. Funny, no?',
        { heartsMin: 3 },
      ],
      [
        '你来了以后，菜园义务劳动的人多了两个。另一个是你拉来的吧？',
        'Since you came, two more people show up for garden workdays. You brought the other one, didn’t you?',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'frank',
    name: t('弗兰克·科瓦尔斯基', 'Frank Kowalski'),
    role: t(
      '酒馆老板，清早在防波堤钓黄鲈',
      'Tavern owner who fishes the pier at dawn',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'park-pond' },
        { from: 600, at: 'away' },
        { from: 930, at: 'pub-garden' },
        { from: 960, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'park-pond' },
        { from: 720, at: 'shop' },
        { from: 780, at: 'away' },
        { from: 960, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 900, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 840, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['fish-fry', 'perch'],
      liked: ['potato', 'hot-dog', 'apple-pie'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '周五炸鱼！你这是要抢我的生意啊。下一杯我请。',
        'A Friday fish fry! You’re stealing my business. Next round’s on me.',
      ),
      liked: t('不错不错，放吧台上。', 'Not bad at all. Leave it on the bar.'),
      neutral: t('谢了，朋友。', 'Thanks, pal.'),
      disliked: t(
        '湖里捞上来的？我替你扔回垃圾站。',
        'Fished that out of the lake? I’ll take it to the dump for you.',
      ),
    },
    lines: lines('frank', [
      [
        '我是弗兰克，这家酒馆是我爷爷从克拉科夫来以后开的。深盘披萨要等四十分钟，值得。',
        'Frank. My grandpa opened this place after he came over from Kraków. Deep dish takes forty minutes. Worth it.',
      ],
      [
        '热狗不加番茄酱。芥末、洋葱、酸黄瓜、番茄片、辣椒、芹菜盐。记住了没有？',
        'No ketchup on a hot dog. Mustard, onion, relish, tomato, sport peppers, celery salt. Got it?',
      ],
      [
        '黄鲈喜欢清早，太阳一高就沉下去了。',
        'Perch like the early morning. Once the sun is up they go deep.',
      ],
      [
        '湖面结冰的时候，有人在冰上凿洞钓鱼。我年纪大了，在吧台后面看看就好。',
        'When the lake freezes, folks cut holes and fish on the ice. I’m too old; I watch from behind the bar.',
        { season: 1 },
      ],
      [
        '圣帕特里克节那天河水会染成绿的，我店里的啤酒也是。',
        'On St. Patrick’s Day they dye the river green. My beer too.',
        { season: 2 },
      ],
      [
        '夏天的湖风一吹，坐在后院喝一杯，什么烦心事都没了。',
        'A summer lake breeze, a drink on the back patio — troubles gone.',
        { season: 3 },
      ],
      [
        '下雨天鱼不咬钩，我就在店里修那台老点唱机。',
        'Fish don’t bite in the rain. I fix the old jukebox instead.',
        { weather: ['rain'] },
      ],
      [
        '独立日的烟火从防波堤看最清楚。早点去占位置。',
        'The Fourth of July fireworks look best from the pier. Get there early.',
        { festival: 'fourth-of-july' },
      ],
      [
        '我爷爷入籍那天在这儿请全街喝了一轮。照片还挂在吧台后面，你看见没有？',
        'The day my grandpa naturalized, he bought the whole street a round. The photo’s still behind the bar — see it?',
        { heartsMin: 3 },
      ],
    ]),
  },
  {
    id: 'angela',
    name: t('安吉拉·布鲁克斯', 'Angela Brooks'),
    role: t(
      '退休老师，在社区学院教入籍辅导课',
      'Retired teacher who runs the citizenship class',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'college-steps' },
        { from: 960, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'park-path' },
        { from: 720, at: 'cafe' },
        { from: 840, at: 'library' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 960, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 960, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['apple-pie', 'garden-salad'],
      liked: ['flowers', 'coffee', 'cookies'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，我教了三十年书，还是最喜欢学生送的吃的。',
        'Thirty years of teaching, and I still love it most when students bring food.',
      ),
      liked: t('谢谢你，亲爱的。', 'Thank you, honey.'),
      neutral: t('你真贴心。', 'That’s sweet of you.'),
      disliked: t('这个……我们换个话题吧。', 'Well… let’s change the subject.'),
    },
    lines: lines('angela', [
      [
        '我是布鲁克斯老师。周二周四晚上的入籍辅导课，来就行，不收学费。',
        'I’m Ms Brooks. Citizenship class is Tuesday and Thursday nights. Just show up — no tuition.',
      ],
      [
        '面谈时考官会让你读一句、写一句英语。别紧张，慢慢说。',
        'At the interview, the officer will have you read a sentence and write one. Don’t rush. Speak slowly.',
      ],
      [
        '公民题不是背出来的，是聊出来的。来，美国有几个州？',
        'Civics isn’t memorized, it’s talked through. So — how many states are there?',
      ],
      [
        '下雪天也别逃课，教室里有热可可。',
        'Don’t skip class for snow. There’s hot cocoa in the classroom.',
        { season: 1 },
      ],
      [
        '七月四号是我们的生日。你知道《独立宣言》是哪一年签的吗？',
        'The Fourth of July is the country’s birthday. Know what year the Declaration was signed?',
        { season: 3 },
      ],
      [
        '下雨天我在图书馆备课，你可以来旁听。',
        'On rainy days I plan lessons at the library. Come sit in.',
        { weather: ['rain'] },
      ],
      [
        '你的口语进步了。上周那个句子，你一次就读对了。',
        'Your speaking has come along. That sentence last week, you read it right the first time.',
        { when: [{ stat: 'english', min: 60 }] },
      ],
      [
        '我奶奶从密西西比坐火车来芝加哥的时候，带着一只箱子和一本圣经。每个人都是从某个地方来的。',
        'My grandmother came up from Mississippi on the train with one suitcase and a Bible. Everybody comes from somewhere.',
        { heartsMin: 3 },
      ],
    ]),
  },
  {
    id: 'minh',
    name: t('阮明', 'Minh Nguyen'),
    role: t(
      '街角杂货店店员，也在准备入籍考试',
      'Corner store clerk, also studying for citizenship',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 960, at: 'library-steps' },
        { from: 1020, at: 'college' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 840, at: 'library' },
        { from: 1020, at: 'green-centre' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 1020, at: 'library' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 900, at: 'library' },
        { from: 1080, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['potstickers', 'coffee'],
      liked: ['cookies', 'cucumber', 'bluegill'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '哇，这比我们店里卖的好吃一百倍。',
        'Whoa, this beats anything we sell here by a mile.',
      ),
      liked: t(
        '谢啦！考试那天我请你喝咖啡。',
        'Thanks! Coffee’s on me on test day.',
      ),
      neutral: t('嘿，谢谢。', 'Hey, thanks.'),
      disliked: t(
        '呃……这个我们店不回收。',
        'Uh… we don’t take returns on that.',
      ),
    },
    lines: lines('minh', [
      [
        '嘿，我是阿明。店里的彩票机坏了，别问我。咖啡在后面，自己倒。',
        'Hey, I’m Minh. The lottery machine’s broken, don’t ask. Coffee’s in the back, help yourself.',
      ],
      [
        '我爸妈是从西贡来的。我十二岁拿的绿卡，现在终于要考入籍了。',
        'My parents came from Saigon. I got my green card at twelve, and now I’m finally doing citizenship.',
      ],
      [
        '你知道最高法院有几位大法官吗？我老是记成十一。',
        'How many justices on the Supreme Court? I keep saying eleven.',
      ],
      [
        '暴风雪那天店里只卖三样东西：牛奶、面包和铲雪盐。',
        'Blizzard days we sell three things: milk, bread and rock salt.',
        { season: 1 },
      ],
      [
        '天一热，冰柜里的冰棍一下午就卖光。',
        'When it gets hot, the freezer’s out of popsicles by afternoon.',
        { season: 3 },
      ],
      [
        '下雨天没人买东西，我就在柜台后面背题。',
        'Nobody shops in the rain, so I study behind the counter.',
        { weather: ['rain'] },
      ],
      [
        '万圣节我打算扮成乔治·华盛顿，顺便复习一下美国历史。',
        'For Halloween I’m going as George Washington. Studying American history while I’m at it.',
        { season: 4 },
      ],
      [
        '谢谢你陪我练题。等我们都考过了，去防波堤吃热狗庆祝。',
        'Thanks for quizzing me. When we both pass, hot dogs at the pier to celebrate.',
        { heartsMin: 3 },
      ],
    ]),
  },
  {
    id: 'danny',
    name: t('丹尼·奥康纳', 'Danny O’Connor'),
    role: t('社区法律援助中心的助理', 'Paralegal at the legal aid clinic'),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 510, at: 'station-front' },
        { from: 540, at: 'council' },
        { from: 1080, at: 'pub' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'council' },
        { from: 780, at: 'green-centre' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'council' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['hot-dog', 'caramel-apple'],
      liked: ['coffee', 'mashed-potatoes', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t('你怎么知道我午饭还没吃？', 'How did you know I skipped lunch?'),
      liked: t(
        '谢谢，这周终于有件好事。',
        'Thanks — finally some good news this week.',
      ),
      neutral: t('谢啦，我放抽屉里。', 'Thanks, I’ll keep it in my drawer.'),
      disliked: t('这个……不算证据吧？', 'This… isn’t evidence, is it?'),
    },
    lines: lines('danny', [
      [
        '我是丹尼，在法律援助中心帮忙。我们不收费，但我不是律师，复杂的事得找律师看。',
        'I’m Danny, I help out at the legal aid clinic. We’re free, but I’m not a lawyer — complicated cases need one.',
      ],
      [
        '复印件比原件多带一份，USCIS 的信封上写清楚收件地址。',
        'Bring one more copy than you think, and get the USCIS mailing address exactly right.',
      ],
      [
        '出入境日期记在一个本子里。递 N-400 的时候要一条条填。',
        'Keep your trip dates in one notebook. The N-400 asks for every one.',
      ],
      [
        '圣帕特里克节我家全家都穿绿的。我奶奶说，爱尔兰人在芝加哥比在都柏林还热闹。',
        'On St. Patrick’s Day my whole family wears green. Grandma says the Irish in Chicago are louder than in Dublin.',
        { season: 2 },
      ],
      [
        '下雨天来咨询的人特别多。大概是在家里越想越担心吧。',
        'Rainy days bring the most visitors. People worry more stuck at home, I guess.',
        { weather: ['rain'] },
      ],
      [
        '十一月报税季还远，但收据现在就该收好。',
        'Tax season is months away, but keep the receipts now.',
        { season: 4 },
      ],
      [
        '每次有人宣誓入籍，他们都会给我发照片。我抽屉里存了一整本。',
        'Whenever someone takes the oath, they send me a photo. I have a whole album in my drawer.',
        { heartsMin: 3 },
      ],
    ]),
  },
  {
    id: 'fatima',
    name: t('法蒂玛·哈达德', 'Fatima Haddad'),
    role: t(
      '图书馆分馆的馆员，管“公民角”',
      'Branch librarian who runs the Citizenship Corner',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 510, at: 'library-steps' },
        { from: 540, at: 'library' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 840, at: 'park-bench' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'library' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 960, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['strawberry-shortcake', 'cookies'],
      liked: ['flowers', 'coffee', 'garden-salad'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '在图书馆不能吃东西……不过我们可以去台阶上吃。',
        'No food in the library… but we can eat it on the steps.',
      ),
      liked: t('谢谢你，太贴心了。', 'Thank you, that’s lovely.'),
      neutral: t('谢谢，我收下了。', 'Thanks, I’ll keep it.'),
      disliked: t(
        '这个……我帮你找个回收箱吧。',
        'Let me… find you a recycling bin.',
      ),
    },
    lines: lines('fatima', [
      [
        '欢迎来公民角。这里有题卡、录音和模拟面谈的视频，借书证免费办。',
        'Welcome to the Citizenship Corner. Flashcards, audio, mock interview videos — and the library card is free.',
      ],
      [
        '我十五年前从贝鲁特来，也在这个角落背过题。',
        'I came from Beirut fifteen years ago and studied in this same corner.',
      ],
      [
        '冬天图书馆是全街最暖和的地方。',
        'In winter the library is the warmest place on the street.',
        { season: 1 },
      ],
      [
        '热浪的时候我们是降温中心，晚上开到很晚。',
        'During heat waves we’re a cooling center and stay open late.',
        { season: 3 },
      ],
      [
        '下雨天座位不够，你可以坐我的工作台旁边。',
        'On rainy days we run out of seats. Sit by my desk.',
        { weather: ['rain'] },
      ],
      [
        '你借的《美国简史》到期了，我帮你续了一次。',
        'Your copy of the short American history was due. I renewed it once for you.',
        { heartsMin: 2 },
      ],
      [
        '宣誓那天记得带上绿卡，要交回去的。很多人那天才舍不得。',
        'Bring your green card to the oath — you hand it in. Many people find that part hard.',
        { heartsMin: 4 },
      ],
    ]),
  },
  {
    id: 'jayden',
    name: t('杰登·沃克', 'Jayden Walker'),
    role: t(
      '十岁，棒球迷，湖边的鸟他都认识',
      'Age ten, baseball fan, knows every lake bird',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'park-pond' },
        { from: 1050, at: 'green-centre' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'green-centre' },
        { from: 720, at: 'park-pond' },
        { from: 900, at: 'park-path' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['caramel-apple', 'perch'],
      liked: ['cookies', 'hot-dog', 'corn'],
      disliked: ['garden-salad'],
    },
    reactions: {
      loved: t('哇！真的给我吗？', 'Whoa! For real?'),
      liked: t('谢谢！', 'Thanks!'),
      neutral: t('嗯……谢谢。', 'Um… thanks.'),
      disliked: t('呃，沙拉……', 'Ugh, salad…'),
    },
    lines: lines('jayden', [
      [
        '你知道吗？那只是环嘴鸥，不是普通海鸥。湖边的鸟我都认识。',
        'Did you know? That’s a ring-billed gull, not just any seagull. I know every bird by the lake.',
      ],
      [
        '鱼饵用小虫子，黄鲈最爱。蓝鳃鱼什么都吃。',
        'Use worms for bait. Perch love them. Bluegill eat anything.',
      ],
      [
        '下雪了！湖边结了冰，看起来像月球。',
        'It snowed! The lakeshore froze and looks like the moon.',
        { season: 1 },
      ],
      [
        '棒球赛季开始了！我今年要当投手。',
        'Baseball season’s back! I’m pitching this year.',
        { season: 2 },
      ],
      [
        '暑假我天天来防波堤，昨天钓到一条这么——大的！',
        'Every day of summer break I’m at the pier. Yesterday I caught one THIS big!',
        { season: 3 },
      ],
      [
        '万圣节我要扮成恐龙。不对，宇航员恐龙。',
        'For Halloween I’m going as a dinosaur. No — an astronaut dinosaur.',
        { season: 4 },
      ],
      [
        '下雨不能钓鱼，我去图书馆看鸟类图鉴。',
        'No fishing in the rain. I’m reading the bird book at the library.',
        { weather: ['rain'] },
      ],
      [
        '你要入籍？我知道！第一任总统是乔治·华盛顿！考我考我！',
        'You’re doing citizenship? I know one! The first president was George Washington! Quiz me!',
        { heartsMin: 2 },
      ],
    ]),
  },
  {
    id: 'marcus',
    name: t('马库斯·里德', 'Marcus Reed'),
    role: t(
      '晓雯的丈夫，高架列车司机',
      'Xiaowen’s husband, an L train operator',
    ),
    characters: ['spouse'],
    schedule: [
      {
        festival: true,
        stops: [
          { from: 0, at: 'home' },
          { from: 600, at: 'green' },
          { from: 1320, at: 'home' },
        ],
      },
      {
        dayKinds: ['workday'],
        stops: [
          { from: 0, at: 'home' },
          { from: 360, at: 'away' },
          { from: 1080, at: 'station-front' },
          { from: 1110, at: 'home' },
        ],
      },
      {
        dayKinds: ['weekend', 'special'],
        stops: [
          { from: 0, at: 'home' },
          { from: 600, at: 'park-pond' },
          { from: 780, at: 'cafe' },
          { from: 900, at: 'home' },
        ],
      },
    ],
    gifts: {
      loved: ['potstickers', 'fish-fry'],
      liked: ['coffee', 'apple-pie', 'hot-dog'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '锅贴！我能吃二十个。好吧，十五个。',
        'Potstickers! I could eat twenty. Okay, fifteen.',
      ),
      liked: t('你最好了。', 'You’re the best.'),
      neutral: t('谢谢，宝贝。', 'Thanks, babe.'),
      disliked: t('这是……从湖里捞的？', 'Is this… from the lake?'),
    },
    lines: lines('marcus', [
      [
        '今天红线晚点十分钟，不是我的错，是信号灯的错。',
        'The Red Line ran ten minutes late today. Not my fault — the signals.',
      ],
      [
        '周末去防波堤吧，我教你钓黄鲈，我爸当年就是这么教我的。',
        'Pier this weekend? I’ll teach you perch fishing, the way my dad taught me.',
      ],
      [
        '下雪天我开车得特别慢。你出门记得穿那双防滑靴。',
        'In the snow I drive extra slow. Wear the boots with the grip.',
        { season: 1 },
      ],
      [
        '独立日那天我们去湖边，我带毯子，你带锅贴。',
        'Fourth of July at the lake — I bring the blanket, you bring the potstickers.',
        { season: 3 },
      ],
      [
        '我妈说感恩节要你做那道辣子鸡，全家都在念叨。',
        'Mom says you have to make the spicy chicken for Thanksgiving. The whole family keeps asking.',
        { season: 4 },
      ],
      [
        '晓雯，我知道你想家。等绿卡的事办完，我们一起回成都。',
        'Xiaowen, I know you miss home. Once the green card’s sorted, we’ll go to Chengdu together.',
        { heartsMin: 3 },
      ],
    ]),
  },
];
