import type { Npc, Text } from '../../model';
import { values, type GrFestival } from './rules';

type GrNpc = Npc<GrFestival>;
type Stops = GrNpc['schedule'][number]['stops'];
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
): GrNpc['schedule'] => [
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
  pairs: [string, string, Partial<GrNpc['lines'][number]>?][],
): GrNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const grNpcs: GrNpc[] = [
  {
    id: 'eleni',
    name: t('埃莱妮·弗拉胡', 'Eleni Vlachou'),
    role: t(
      '退休小学老师，菜园老手，喂整条街的猫',
      'Retired teacher, garden veteran, feeds every cat on the street',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'allotment-plots' },
        { from: 660, at: 'board' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'away' },
        { from: 1080, at: 'park-path' },
        { from: 1230, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'market' },
        { from: 660, at: 'allotment-plots' },
        { from: 900, at: 'away' },
        { from: 1080, at: 'green-centre' },
        { from: 1230, at: 'away' },
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
      loved: ['spoon-sweet', 'baklava'],
      liked: ['mountain-tea', 'tomato', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，你这孩子！下周日来我家吃饭，不许推辞。',
        'Oh, you dear! Sunday lunch at mine next week, and no excuses.',
      ),
      liked: t(
        '谢谢你，亲爱的。猫们也替我谢谢你。',
        'Thank you, my dear. The cats thank you too.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'Kind of you. Leave it on the bench; I’ll fetch it later.',
      ),
      disliked: t(
        '这个……我们还是送去回收站吧。',
        'Hm… let’s take that to the recycling bins.',
      ),
    },
    lines: lines('eleni', [
      [
        '新搬来的？我是埃莱妮，住三楼。告示板上的事都问我，猫的事更要问我。',
        'New here? I’m Eleni, third floor. Ask me anything on the noticeboard, and especially anything about the cats.',
      ],
      [
        '那只橘猫叫「市长」，因为它每天都巡视整条海滨路。',
        'The ginger one is called “the Mayor”: he inspects the whole seafront every day.',
      ],
      [
        '冬天菜园种芜菁和土豆。雨水够，不用天天浇。',
        'In winter the gardens grow turnips and potatoes. The rain does the watering.',
        { season: 1 },
      ],
      [
        '复活节前一周，整栋楼都在烤甜面包，楼梯间香得像面包房。',
        'The week before Easter the whole building bakes tsoureki. The stairwell smells like a bakery.',
        { season: 2 },
      ],
      [
        '八月一到，雅典人都跑去海岛了。留下来的人，广场就是我们的。',
        'In August Athens empties onto the islands. Those of us who stay get the square to ourselves.',
        { season: 3 },
      ],
      [
        '第一场秋雨下来，空气里全是泥土和松树的味道。',
        'When the first autumn rain comes, the air smells of earth and pine.',
        { season: 4 },
      ],
      [
        '雨天菜园没活，我就在咖啡馆里改孙子的作文。',
        'No garden work in the rain, so I mark my grandson’s essays at the kafeneio.',
        { weather: ['rain'] },
      ],
      [
        '你的希腊语有进步了。我教了三十年书，听得出来。',
        'Your Greek is improving. Thirty years of teaching, I can hear it.',
        { heartsMin: 3 },
      ],
      [
        '我年轻时在德国待过两年。头一年总觉得自己是客人，后来才知道，家是慢慢住出来的。',
        'I spent two years in Germany when I was young. The first year I felt like a guest. Home is something you live your way into.',
        { heartsMin: 6 },
      ],
      [
        '跳圆圈舞别看脚，看旁边人的肩膀。',
        'In the circle dance, don’t watch your feet. Watch your neighbour’s shoulders.',
        { festival: 'panigyri' },
      ],
    ]),
  },
  {
    id: 'stavros',
    name: t('斯塔夫罗斯·卡洛耶拉基斯', 'Stavros Kalogerakis'),
    role: t(
      '海浪小酒馆老板，天不亮就出海打鱼',
      'Owner of Taverna To Kyma, out fishing before dawn',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 360, at: 'park-pond' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'pub' },
        { from: 900, at: 'away' },
        { from: 1080, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 360, at: 'park-pond' },
        { from: 540, at: 'market' },
        { from: 720, at: 'pub-garden' },
        { from: 900, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 720, at: 'pub' },
        { from: 900, at: 'away' },
        { from: 1080, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['sea-bream', 'kakavia'],
      liked: ['sardine', 'grilled-sardines', 'olive-oil'],
      disliked: ['spoon-sweet'],
    },
    reactions: {
      loved: t(
        '好鱼！今晚的黑板上就写你的名字。',
        'Now that’s a fish! Tonight’s blackboard gets your name on it.',
      ),
      liked: t('谢啦。下次来，茴香酒我请。', 'Thanks. The next ouzo is on me.'),
      neutral: t('收到收到，先放吧台后面。', 'Got it. Behind the bar for now.'),
      disliked: t(
        '甜的？给涅斐莉吧，我只吃咸的。',
        'Something sweet? Give it to Nefeli. I’m a salt man.',
      ),
    },
    lines: lines('stavros', [
      [
        '你是新邻居？我是斯塔夫罗斯。早上出海，晚上开店，中间睡觉。这就是全部的秘密。',
        'New neighbour? I’m Stavros. Sea in the morning, taverna at night, sleep in between. That’s the whole secret.',
      ],
      [
        '防波堤尽头水深，早上能钓到金头鲷。别跟别人说是我讲的。',
        'The water is deep at the end of the breakwater. Bream bite in the morning. You didn’t hear it from me.',
      ],
      [
        '冬天的海脾气大，可是鱼最肥。',
        'The winter sea has a temper, but that’s when the fish are fattest.',
        { season: 1 },
      ],
      [
        '夏天北风（meltemi）一刮，渔船就得歇两天。正好，我补补网。',
        'When the meltemi blows in summer, the boats rest a couple of days. Good time to mend nets.',
        { season: 3 },
      ],
      [
        '下雨天来喝碗鱼汤。雨天的鱼汤比晴天的香，这是科学。',
        'Come for fish soup on a rainy day. Rain makes it taste better. That’s science.',
        { weather: ['rain'] },
      ],
      [
        '你知道吗？我爷爷是从士麦那坐船逃过来的。这条街上，谁家往上数三代不是外来的？',
        'My grandfather came over by boat from Smyrna. On this street, whose family wasn’t new here three generations ago?',
        { heartsMin: 4 },
      ],
      [
        '复活节的羊我从凌晨四点开始烤。你来帮忙翻，我分你最好的一块。',
        'I start the Easter lamb at four in the morning. Help me turn the spit and you get the best piece.',
        { festival: 'easter' },
      ],
      [
        '游行完了来店里，孩子们的柠檬水免费。',
        'After the parade, come by. Lemonade is free for the kids.',
        { festival: 'ochi' },
      ],
    ]),
  },
  {
    id: 'katerina',
    name: t('卡捷琳娜·季穆', 'Katerina Dimou'),
    role: t(
      '社区中心希腊语班的老师',
      'Teacher of the community centre’s Greek class',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library-steps' },
        { from: 780, at: 'away' },
        { from: 1050, at: 'college' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe' },
        { from: 720, at: 'market' },
        { from: 900, at: 'away' },
        { from: 1080, at: 'park-path' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1050, at: 'college' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['koulouri', 'horiatiki'],
      liked: ['flowers', 'mountain-tea', 'strawberry'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '太好了！明天上课我就用它造句。',
        'Wonderful! Tomorrow’s class will make sentences about this.',
      ),
      liked: t(
        '谢谢！这个词你会说吗？',
        'Thank you! Can you say the word for it?',
      ),
      neutral: t('谢谢你想着我。', 'Thank you for thinking of me.'),
      disliked: t(
        '嗯……这个词我们下节课再学。',
        'Hm… we’ll learn that word another day.',
      ),
    },
    lines: lines('katerina', [
      [
        '你好！我是卡捷琳娜。班上有阿尔巴尼亚人、菲律宾人、乌克兰人，大家的希腊语口音能凑一张世界地图。',
        'Hello! I’m Katerina. My class has Albanians, Filipinos, Ukrainians: our accents make a world map.',
      ],
      [
        '重音记号别漏！一个重音不同，「为什么」就变成「因为」。',
        'Mind the accent marks! Move one and “why” becomes “because”.',
      ],
      [
        'A2 考试不难，听力放慢一点就好。考场里手机要交给门口的老师。',
        'The A2 exam isn’t hard. Take the listening slowly, and hand your phone in at the door.',
        { when: [{ stat: 'greek', max: 44 }] },
      ],
      [
        'Π.Ε.Γ.Π. 要考历史、地理和文化。你知道 1821 年发生了什么吗？',
        'The Π.Ε.Γ.Π. covers history, geography and culture. Do you know what happened in 1821?',
        { when: [{ stat: 'greek', min: 45 }] },
      ],
      [
        '洁净星期一我们全班去山坡放风筝，你也来！',
        'On Clean Monday the whole class flies kites on the hill. Come along!',
        { season: 2 },
      ],
      [
        '下雨天就在家听希腊老歌，歌词是最好的课本。',
        'On rainy days, listen to old Greek songs. Lyrics are the best textbook.',
        { weather: ['rain'] },
      ],
      [
        '你上周在会计师那里全程说希腊语？阿尔迪特都告诉我了！',
        'You spoke Greek the whole time at the accountant’s last week? Ardit told me!',
        { heartsMin: 4 },
      ],
      [
        '我的学生里，有人后来成了希腊人，有人去了别的国家。每个人都带走了一点希腊语。',
        'Some of my students became Greek, some moved on. Every one of them took a little Greek along.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'ardit',
    name: t('阿尔迪特·乔尼', 'Ardit Gjoni'),
    role: t(
      '小超市老板，从阿尔巴尼亚来，去年入了希腊籍',
      'Mini-market owner from Albania, naturalised last year',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 900, at: 'away' },
        { from: 1050, at: 'shop' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 840, at: 'away' },
        { from: 1080, at: 'cafe' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['grilled-corn', 'gemista'],
      liked: ['corn', 'mountain-tea', 'baklava'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '跟我妈做的一个味道！你从哪学的？',
        'Tastes like my mother’s! Where did you learn that?',
      ),
      liked: t(
        '谢了，兄弟。下次买东西给你抹零。',
        'Thanks, friend. I’ll round your bill down next time.',
      ),
      neutral: t('谢谢，放收银台边上吧。', 'Thanks. Leave it by the till.'),
      disliked: t(
        '这个……我这儿不收旧货。',
        'That… I don’t take second-hand goods.',
      ),
    },
    lines: lines('ardit', [
      [
        '我是阿尔迪特。九十年代翻山过来的，那时候连「你好」都不会说。现在？我是希腊人了，还是阿尔巴尼亚人。两个都是。',
        'I’m Ardit. I came over the mountains in the nineties without even “hello”. Now? I’m Greek, and Albanian. Both.',
      ],
      [
        '种子在门口左边那排，按季节摆的。番茄要等夏天。',
        'Seeds are on the left by the door, sorted by season. Tomatoes wait for summer.',
      ],
      [
        'Π.Ε.Γ.Π. 我考了两次。第二次之前，我把题库贴在冷库门上背。',
        'I sat the Π.Ε.Γ.Π. twice. Before the second, I stuck the question bank on the fridge door.',
      ],
      [
        '每年报税别拖，会计师那边春天排长队。',
        'Don’t leave your tax return late. The accountant has queues every spring.',
        { season: 2 },
      ],
      [
        '热浪的时候，冰水卖得比面包还快。',
        'In a heatwave, cold water sells faster than bread.',
        { season: 3 },
      ],
      [
        '下雨天没人出门，我就在店里背希腊诗。听，「Ιθάκη」……',
        'Nobody goes out in the rain, so I learn Greek poems in the shop. Listen: “Ithaca”…',
        { weather: ['rain'] },
      ],
      [
        '宣誓那天，我老婆哭得比我还厉害。你以后也会有那一天的。',
        'On the day I took the oath, my wife cried more than me. You’ll have your day too.',
        { heartsMin: 5 },
      ],
    ]),
  },
  {
    id: 'despina',
    name: t('黛丝皮娜·安德烈乌', 'Despina Andreou'),
    role: t(
      'KEP 市民服务中心的窗口职员',
      'Counter clerk at the KEP citizens’ service centre',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 470, at: 'kep' },
        { from: 900, at: 'cafe' },
        { from: 960, at: 'away' },
        { from: 1140, at: 'pub' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'market' },
        { from: 660, at: 'park-bench' },
        { from: 840, at: 'away' },
        { from: 1110, at: 'green-centre' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 470, at: 'kep' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['loukoumades', 'spoon-sweet'],
      liked: ['flowers', 'koulouri', 'strawberry'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '你怎么知道我爱吃这个？今天的排队号我都记得你了。',
        'How did you know? You’re my favourite number in the queue today.',
      ),
      liked: t('谢谢！午休正好吃。', 'Thank you! Perfect for my break.'),
      neutral: t('谢谢，我收下了。', 'Thanks, I’ll take it.'),
      disliked: t(
        '呃……这个应该交给市政回收。',
        'Er… that’s for municipal recycling.',
      ),
    },
    lines: lines('despina', [
      [
        '你好，我是黛丝皮娜。先取号，再等叫号，材料复印两份——KEP 的三条真理。',
        'Hi, I’m Despina. Take a number, wait to be called, copy everything twice: the three truths of the KEP.',
      ],
      [
        '很多事现在 gov.gr 上就能办，可认证签名有时还得来窗口。',
        'Lots can be done on gov.gr now, but some signatures still need the counter.',
      ],
      [
        '周六一早去菜市，番茄最好的那摊十点就卖完了。',
        'Go to the market early on Saturday. The best tomato stall sells out by ten.',
        { dayKinds: ['weekend'] },
      ],
      [
        '八月一半同事都休假了。门上贴着「休假中」的纸，不是我们偷懒。',
        'Half my colleagues are on leave in August. The “closed for holidays” sign isn’t laziness, promise.',
        { season: 3 },
      ],
      [
        '下雨天窗口人少，来办事正好。',
        'Rainy days mean short queues. Good time to come in.',
        { weather: ['rain'] },
      ],
      [
        '你的材料总是整整齐齐的，我们窗口都在夸你。',
        'Your papers are always so tidy. The whole counter talks about you.',
        { heartsMin: 4 },
      ],
    ]),
  },
  {
    id: 'thanasis',
    name: t('萨纳西斯·兰布鲁', 'Thanasis Lambrou'),
    role: t(
      '街角的会计师，半条街的税都归他报',
      'The neighbourhood accountant, filing half the street’s taxes',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 900, at: 'cafe' },
        { from: 1020, at: 'council' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'away' },
        { from: 1140, at: 'pub' },
        { from: 1320, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'council' },
        { from: 780, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['olive-oil', 'grilled-sardines'],
      liked: ['koulouri', 'baklava', 'sardine'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '这个我得记一笔——「客户的心意」，不用报税。',
        'I’ll book this as “client goodwill”. Tax-free.',
      ),
      liked: t(
        '谢谢！等我接完这个电话。',
        'Thanks! Just let me finish this call.',
      ),
      neutral: t('好，好，放桌上吧。', 'Fine, fine, on the desk.'),
      disliked: t('这个可没法抵扣。', 'That’s not deductible.'),
    },
    lines: lines('thanasis', [
      [
        '萨纳西斯，会计师。税号、社保、清缴单，在希腊活着就离不开我。坐，我先接个电话。',
        'Thanasis, accountant. Tax number, insurance, assessments: you can’t live in Greece without me. Sit, let me take this call.',
      ],
      [
        '每年都要报税，哪怕收入不变。入籍的时候，他们会一年一年翻你的清缴单。',
        'File every year, even if nothing changed. For citizenship they leaf through your assessments year by year.',
      ],
      [
        '春天是报税季，我的电话从早响到晚。',
        'Spring is tax season. My phone rings from dawn to dusk.',
        { season: 2 },
      ],
      [
        '八月？八月我在纳克索斯岛。有事九月再说。',
        'August? In August I’m on Naxos. It’ll keep till September.',
        { season: 3 },
      ],
      [
        `你知道希腊人为什么一年领 ${values.annualPayPeriods.value} 次工资吗？圣诞、复活节、夏天，各多发一点。`,
        `Know why Greek salaries are paid ${values.annualPayPeriods.value} times a year? Extra at Christmas, Easter and summer.`,
        { heartsMin: 3 },
      ],
      [
        '你的账做得清清楚楚。说真的，我有几个希腊客户都比不上你。',
        'Your records are spotless. Honestly, better than some of my Greek clients.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'nefeli',
    name: t('涅斐莉', 'Nefeli'),
    role: t(
      '斯塔夫罗斯的孙女，十岁，章鱼和海玻璃专家',
      'Stavros’s ten-year-old granddaughter, expert in octopus and sea glass',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 870, at: 'park-pond' },
        { from: 1020, at: 'green-centre' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'park-pond' },
        { from: 780, at: 'green-centre' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 900, at: 'library' },
        { from: 1080, at: 'away' },
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
      loved: ['loukoumades', 'koulouri'],
      liked: ['strawberry', 'corn', 'sardine'],
      disliked: ['mountain-tea'],
    },
    reactions: {
      loved: t(
        '哇！我能分一半给爷爷吗？算了，不分了。',
        'Wow! Should I share half with Grandpa? Nah.',
      ),
      liked: t(
        '谢谢！我放进我的宝箱里。',
        'Thanks! It goes in my treasure box.',
      ),
      neutral: t('嗯……谢谢。', 'Um… thanks.'),
      disliked: t('这是给奶奶喝的吧？', 'Isn’t that for grannies?'),
    },
    lines: lines('nefeli', [
      [
        '你好！我叫涅斐莉，意思是「云」。你知道章鱼有三颗心脏吗？',
        'Hi! I’m Nefeli, it means “cloud”. Did you know an octopus has three hearts?',
      ],
      [
        '绿色的海玻璃最常见，蓝色的最难找。我有两块蓝的！',
        'Green sea glass is the commonest, blue is the rarest. I have two blue ones!',
      ],
      [
        '爷爷说防波堤尽头别站太靠边，浪会突然打上来。',
        'Grandpa says don’t stand at the very end of the breakwater. Waves jump up.',
      ],
      [
        '下雨不能去海边，我在图书馆看鱼类图鉴。',
        'No sea in the rain, so I read the fish book at the library.',
        { weather: ['rain'] },
      ],
      [
        '你的国家也有海吗？那边的鱼会不会说别的语言？',
        'Is there sea in your country? Do the fish speak a different language there?',
        { heartsMin: 3 },
      ],
      [
        '游行的时候我要举班旗！我练了一个月踢正步。',
        'I’m carrying the class banner in the parade! I practised marching for a month.',
        { festival: 'ochi' },
      ],
      [
        '我的红蛋是全班最硬的，从来没输过！',
        'My red egg is the toughest in the class. It has never lost!',
        { festival: 'easter' },
      ],
    ]),
  },
  {
    id: 'yannis',
    name: t('扬尼斯·马尔库', 'Yannis Markou'),
    role: t(
      '晓雯的丈夫，跑海岛航线的渡轮轮机工程师',
      'Xiaowen’s husband, an engineer on the island ferries',
    ),
    characters: ['spouse'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 420, at: 'away' },
        { from: 1170, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 540, at: 'market' },
        { from: 720, at: 'home' },
        { from: 1080, at: 'park-path' },
        { from: 1200, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 420, at: 'away' },
        { from: 1170, at: 'home' },
      ],
      [{ from: 0, at: 'home' }],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1260, at: 'home' },
      ],
    ),
    gifts: {
      loved: ['kakavia', 'lemon-potatoes'],
      liked: ['baklava', 'tomato'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '跑船回来就有这个……谢谢你，晓雯。',
        'Home from the ferries to this… thank you, Xiaowen.',
      ),
      liked: t('谢啦，我们一起吃吧。', 'Thanks. Let’s share it.'),
      neutral: t('谢谢，我先放冰箱。', 'Thanks. Into the fridge for now.'),
      disliked: t('这是……从海里捞上来的吧？', 'Is that… from the sea?'),
    },
    lines: lines('yannis', [
      [
        '我回来了。这趟船从比雷埃夫斯到圣托里尼，机舱里热得像烤箱。',
        'I’m home. Piraeus to Santorini this run. The engine room was an oven.',
      ],
      [
        '周六去菜市吧？我想买一箱橙子榨汁。',
        'Market on Saturday? I want a crate of oranges for juice.',
      ],
      [
        '我妈又问你什么时候去学做蜜饯。她是真喜欢你。',
        'Mum asked again when you’ll learn the spoon sweets. She really likes you.',
      ],
      [
        '你上周自己去移民局办好了？我都还得看说明书。',
        'You sorted the migration office alone last week? I’d still need the instructions.',
        { when: [{ stat: 'greek', min: 45 }] },
      ],
      [
        '中国现在也过年吧？我们在这边包饺子，也算一起过。',
        'It’s New Year in China now, isn’t it? Dumplings here count as celebrating together.',
        { season: 1 },
      ],
      [
        '有时候我在想，要是当初是我搬去福建，会不会也这么手忙脚乱。',
        'Sometimes I wonder if I’d be this flustered had I moved to Fujian instead.',
        { heartsMin: 4 },
      ],
    ]),
  },
];
