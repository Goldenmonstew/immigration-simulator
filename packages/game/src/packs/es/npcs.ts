import type { Npc, Text } from '../../model';
import type { EsFestival } from './rules';

type EsNpc = Npc<EsFestival>;
type Stops = EsNpc['schedule'][number]['stops'];
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

/**
 * Sant Joan's night, other festivals, wet workday, wet weekend, workday,
 * weekend — first match wins. On Sant Joan the town walks down to the beach.
 */
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
  santJoan: Stops = [
    { from: 0, at: 'away' },
    { from: 540, at: 'green-stall' },
    { from: 1200, at: 'beach' },
    { from: 1380, at: 'away' },
  ],
): EsNpc['schedule'] => [
  { festival: true, when: [{ festival: 'sant-joan' }], stops: santJoan },
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
  pairs: [string, string, Partial<EsNpc['lines'][number]>?][],
): EsNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const esNpcs: EsNpc[] = [
  {
    id: 'amparo',
    name: t('安帕罗·比达尔', 'Amparo Vidal'),
    role: t(
      '街坊协会会长，菜园老手，法雅协会的老会员',
      'Residents’ association head, allotment veteran and falla stalwart',
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
        { from: 540, at: 'shop' },
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
      loved: ['arros-a-banda', 'turron'],
      liked: ['oranges', 'tomato', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，这个我最爱。周五会所吃饭，你坐我旁边。',
        'Oh, my favourite. Friday dinner at the casal, you sit next to me.',
      ),
      liked: t(
        '谢谢，孩子。手套先摘，免得弄脏。',
        'Thank you, love. Gloves off first so I don’t smudge it.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'Kind of you. Leave it on the bench; I’ll fetch it later.',
      ),
      disliked: t(
        '这个……我拿去黄色垃圾桶那边吧。',
        'Hm… I’ll take that to the yellow bin.',
      ),
    },
    lines: lines('amparo', [
      [
        '新来的？我是街坊协会的安帕罗。垃圾分类贴在告示板上，看不懂就来问我。',
        'New here? I’m Amparo from the residents’ association. The recycling chart is on the board. Ask me if it puzzles you.',
      ],
      [
        '在瓦伦西亚，有人跟你说「bon dia」，你就回「bon dia」。剩下的慢慢来。',
        'In València, if someone says “bon dia”, you say “bon dia” back. The rest comes slowly.',
      ],
      [
        '冬天菜园种蚕豆和洋蓟。这里的冬天，太阳还是暖的。',
        'In winter we grow broad beans and artichokes. Even our winter sun is warm.',
        { season: 1 },
      ],
      [
        '法雅节那几天别想睡懒觉，早上八点就有人放鞭炮。我们管那叫 despertà。',
        'Forget lie-ins during the Fallas: firecrackers at eight in the morning. We call it the despertà.',
        { season: 2 },
      ],
      [
        '七月下午别去菜园，太晒了。番茄要早上摘，傍晚浇水。',
        'Stay off the allotment on July afternoons. Pick tomatoes in the morning, water at dusk.',
        { season: 3 },
      ],
      [
        '秋天的雨来得急。下大雨就待在家里，别去河道那边。',
        'Autumn rain comes fast. When it pours, stay home and keep away from the riverbed.',
        { season: 4 },
      ],
      [
        '下雨天菜园没活，我在欧洽塔铺把下个月的会所菜单写好。',
        'No allotment work in the rain. I’m writing next month’s casal menu at the orxateria.',
        { weather: ['rain'] },
      ],
      [
        '你来了以后，周五的会所晚饭多了一副碗筷。大家都记得你带来的那道菜。',
        'Since you came, there’s one more plate at Friday dinner. Everyone remembers the dish you brought.',
        { heartsMin: 3 },
      ],
      [
        '我年轻时在市场卖了四十年菜。刚开始，连斤两都要问邻居。谁不是从问开始的呢？',
        'I sold vegetables at the market for forty years. At first I had to ask the neighbours how to weigh things. Who doesn’t start by asking?',
        { heartsMin: 6 },
      ],
      [
        '今年的法雅雕塑是我们会所做的。好看吧？今晚就烧，烧完明年再来。',
        'Our casal built this year’s falla. Beautiful, isn’t it? It burns tonight, and next year we start again.',
        { festival: 'falles' },
      ],
    ]),
  },
  {
    id: 'tonet',
    name: t('托内特·约皮斯', 'Tonet Llopis'),
    role: t(
      '托内特酒吧老板，下午在防波堤钓鱼',
      'Owner of Bar Tonet, fishes off the breakwater',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'pub' },
        { from: 960, at: 'pond' },
        { from: 1140, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'pub-garden' },
        { from: 900, at: 'pond' },
        { from: 1080, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['llobarro', 'all-i-pebre'],
      liked: ['tortilla-de-patatas', 'oranges', 'sard'],
      disliked: ['maduixes-amb-nata'],
    },
    reactions: {
      loved: t(
        '好鱼！今晚的小黑板上写你的名字。',
        'Now that’s a fish! Tonight’s blackboard special goes up with your name on it.',
      ),
      liked: t(
        '谢啦。下次的 almuerzo，花生我多给一把。',
        'Thanks. Next almuerzo comes with an extra handful of peanuts.',
      ),
      neutral: t(
        '收到收到，先放吧台后面。',
        'Got it, got it. Behind the bar for now.',
      ),
      disliked: t(
        '奶油？我这儿只有大蒜和橄榄油，朋友。',
        'Cream? This bar runs on garlic and olive oil, friend.',
      ),
    },
    lines: lines('tonet', [
      [
        '早上好！上午十点半来吃 almuerzo，那才是一天真正的开始。',
        'Morning! Come by for almuerzo at half ten. That’s when the day really starts.',
      ],
      [
        '防波堤那头，涨潮前最好钓。鱼饵我借你。',
        'The far end of the breakwater is best before high tide. I’ll lend you bait.',
      ],
      [
        '冬天的海鲈最肥。可惜冬天的风也最大。',
        'Winter sea bass are the fattest. Shame the wind is too.',
        { season: 1 },
      ],
      [
        '法雅节一周，我这儿凌晨三点还在卖油炸面圈。',
        'Fallas week, I’m still frying bunyols at three in the morning.',
        { season: 2 },
      ],
      [
        '夏天露台坐满游客。本地人？本地人晚上十点才出门吃饭。',
        'Summer fills the terrace with tourists. Locals? Locals don’t go out to eat before ten.',
        { season: 3 },
      ],
      [
        '下雨天没人钓鱼，大家都挤在吧台看球。',
        'Nobody fishes in the rain. Everyone squeezes in at the bar to watch the football.',
        { weather: ['rain'] },
      ],
      [
        '你钓的鱼越来越像样了。哪天一起去阿尔武费拉，我带你看渔民收网。',
        'Your catches are getting respectable. One day we’ll go to the Albufera and watch the fishermen haul in.',
        { heartsMin: 3 },
      ],
      [
        '我爸开这家店的时候，门口还是一片菜地。街区一直在变，吧台没变。',
        'When my father opened this place, there were vegetable plots outside. The neighbourhood keeps changing; the bar hasn’t.',
        { heartsMin: 6 },
      ],
      [
        '圣胡安之夜别忘了跳七道浪，许愿要许三个。',
        'On Sant Joan, don’t forget the seven waves. And make three wishes.',
        { festival: 'sant-joan' },
      ],
    ]),
  },
  {
    id: 'herminia',
    name: t('埃尔米尼娅·索莱尔', 'Hermínia Soler'),
    role: t(
      '欧洽塔铺第三代老板娘，街区的消息中心',
      'Third-generation orxateria owner and the street’s news desk',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe' },
        { from: 840, at: 'green-centre' },
        { from: 960, at: 'cafe' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe' },
        { from: 1290, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['maduixes-amb-nata', 'flowers'],
      liked: ['strawberry', 'turron', 'oranges'],
      disliked: ['mujol'],
    },
    reactions: {
      loved: t(
        '哎哟，你怎么知道我喜欢这个？下一杯欧洽塔算我的。',
        'Oh, how did you know? Your next horchata is on me.',
      ),
      liked: t('谢谢，亲爱的。', 'Thank you, dear.'),
      neutral: t(
        '有心了，我放在柜台后面。',
        'How thoughtful. I’ll keep it behind the counter.',
      ),
      disliked: t(
        '鱼？在欧洽塔铺里？快拿走，别让客人看见。',
        'A fish? In an orxateria? Take it away before the customers see.',
      ),
    },
    lines: lines('herminia', [
      [
        '欢迎！欧洽塔是油莎豆做的，不是杏仁。配法尔通，蘸着吃。',
        'Welcome! Horchata is made from tiger nuts, not almonds. Have it with fartons: dip them in.',
      ],
      [
        '我奶奶那时候，油莎豆是从阿尔沃拉亚的田里推着车运来的。',
        'In my grandmother’s day, the tiger nuts came by cart from the fields in Alboraia.',
      ],
      [
        '冬天卖热巧克力和油条，欧洽塔要等天热。',
        'In winter it’s hot chocolate and churros. Horchata waits for the heat.',
        { season: 1 },
      ],
      [
        '一到夏天，排队的人能排到市场门口。',
        'In summer the queue reaches the market door.',
        { season: 3 },
      ],
      [
        '听说了吗？法蒂玛的侄女考上大学了，整条街都在说。',
        'Did you hear? Fatima’s niece got into university. The whole street is talking about it.',
      ],
      [
        '下雨天客人少，正好让我把杯子都擦一遍。',
        'Rainy days are quiet. A good time to polish every glass.',
        { weather: ['rain'] },
      ],
      [
        '你说话越来越像本地人了，连手势都像。',
        'You sound more like a local every week. Even your hands do.',
        { heartsMin: 3 },
      ],
      [
        '这家店我想留给愿意早起泡豆子的人。不一定是家里人。',
        'I want to leave this shop to whoever will get up early to soak the nuts. Not necessarily family.',
        { heartsMin: 6 },
      ],
      [
        '十月九号，按老规矩，用手帕包杏仁糖送人。你想好送谁了吗？',
        'On the ninth of October, by tradition, you wrap marzipan in a handkerchief for someone. Decided who?',
        { festival: 'nou-octubre' },
      ],
    ]),
  },
  {
    id: 'sergi',
    name: t('塞尔吉·费雷尔', 'Sergi Ferrer'),
    role: t(
      '费雷尔代办所的代办（gestor），预约高手',
      'Gestor at Gestoria Ferrer and an appointment-booking ace',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 840, at: 'pub' },
        { from: 960, at: 'council' },
        { from: 1140, at: 'library-steps' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 840, at: 'away' },
        { from: 1020, at: 'green-centre' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['turron', 'gazpacho'],
      liked: ['oranges', 'fartons'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '这个我收下了。你的文件夹，我亲自再核一遍。',
        'I accept. I’ll check your folder again myself.',
      ),
      liked: t('谢谢，正好饿了。', 'Thanks, I was getting hungry.'),
      neutral: t('放这儿吧，谢谢。', 'Leave it here, thanks.'),
      disliked: t(
        '这个……没有办事指南的东西我不收。',
        'That… I don’t accept anything without a procedure sheet.',
      ),
    },
    lines: lines('sergi', [
      [
        '坐，坐。表格、复印件、照片，一样一样来。西班牙的手续，耐心比材料还重要。',
        'Sit, sit. Forms, copies, photos, one at a time. In Spanish paperwork, patience matters more than documents.',
      ],
      [
        '外国人办公室只看预约。没有 cita previa，门口的保安连门都不让你进。',
        'The immigration office runs on appointments. Without a cita previa, the guard won’t let you past the door.',
      ],
      [
        '入籍现在都在网上递，缴费单是 790-026。缴了就不退，先把材料备齐。',
        'Nationality applications go in online now, paid with form 790-026. The fee isn’t refunded, so get your papers ready first.',
      ],
      [
        '八月？八月整个西班牙都在海边。文件也在海边。',
        'August? In August all of Spain is at the beach. So is the paperwork.',
        { season: 3 },
      ],
      [
        '下雨天也照常营业。手续可不看天气。',
        'Open in the rain as usual. Paperwork doesn’t care about the weather.',
        { weather: ['rain'] },
      ],
      [
        '说实话，我最喜欢的时刻是客户拿到回执的那一下。表情都一样。',
        'Honestly, my favourite moment is when a client gets the receipt. Everyone makes the same face.',
        { heartsMin: 3 },
      ],
      [
        '我爷爷当年去德国打工，也排过这种队。所以我做这行。',
        'My grandfather went to work in Germany and queued like this too. That’s why I do this job.',
        { heartsMin: 6 },
      ],
      [
        '今天休息！法雅节谁还办手续？',
        'Day off! Who does paperwork during the Fallas?',
        { festival: 'falles' },
      ],
    ]),
  },
  {
    id: 'fatima',
    name: t('法蒂玛·贝纳利', 'Fatima Benali'),
    role: t(
      '市场水果摊摊主，从摩洛哥来，已入籍多年',
      'Fruit stall owner at the market, from Morocco, Spanish for years now',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 900, at: 'high-street-west' },
        { from: 960, at: 'away' },
        { from: 1140, at: 'green-centre' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 900, at: 'away' },
        { from: 1080, at: 'park-path' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'shop' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['massapa', 'maduixes-amb-nata'],
      liked: ['tomato', 'strawberry', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '你怎么知道我爱吃甜的？来，这袋橙子拿着。',
        'How did you know I love sweets? Here, take this bag of oranges.',
      ),
      liked: t('谢谢！你真贴心。', 'Thank you! That’s sweet of you.'),
      neutral: t('谢谢，我收下了。', 'Thanks, I’ll take it.'),
      disliked: t(
        '这个，你还是拿回海边吧。',
        'That one can go back to the beach.',
      ),
    },
    lines: lines('fatima', [
      [
        '尝尝这个橙子，今早从阿尔齐拉运来的。第一次来市场？以后我给你留好的。',
        'Try this orange, it came from Alzira this morning. First time at the market? I’ll save you the good ones.',
      ],
      [
        '我入籍那年，考 CCSE 前一晚还在背宪法条文。题目没那么难，别紧张。',
        'The year I got my nationality, I was memorising the constitution the night before the CCSE. It’s not that hard; don’t panic.',
      ],
      [
        '一月的橙子最甜。来，挑这箱。',
        'January oranges are the sweetest. Here, pick from this crate.',
        { season: 1 },
      ],
      [
        '草莓季到了，从韦尔瓦和本地都有。本地的小，但香。',
        'Strawberry season. Some from Huelva, some local. The local ones are small but fragrant.',
        { season: 2 },
      ],
      [
        '市场两点半就关门，下午大家都要午休。',
        'The market shuts at half two. Everyone needs a siesta.',
      ],
      [
        '下雨天来买菜的都是老顾客，聊得比卖得多。',
        'On rainy days only regulars come in. More chatting than selling.',
        { weather: ['rain'] },
      ],
      [
        '你让我想起刚来的自己。那时候我连「下一位」都听不懂。',
        'You remind me of me when I arrived. I couldn’t even understand “next, please”.',
        { heartsMin: 3 },
      ],
      [
        '我妈妈还住在得土安。她说我现在说阿拉伯语都带瓦伦西亚口音。',
        'My mother still lives in Tetouan. She says my Arabic has a Valencian accent now.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'marina',
    name: t('玛丽娜·普伊赫', 'Marina Puig'),
    role: t(
      '成人学校老师，教西语、瓦伦西亚语和 CCSE 备考',
      'Adult school teacher of Spanish, Valencian and CCSE prep',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'college' },
        { from: 840, at: 'library' },
        { from: 960, at: 'college-steps' },
        { from: 1020, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'cafe' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['gazpacho', 'flowers'],
      liked: ['oranges', 'turron', 'strawberry'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '太好了！下节课我们就用这个练「食物」的词汇。',
        'Wonderful! Next class we’ll use this to practise food vocabulary.',
      ),
      liked: t('谢谢！Moltes gràcies！', 'Thank you! Moltes gràcies!'),
      neutral: t('谢谢，我放在讲台上。', 'Thanks, I’ll put it on my desk.'),
      disliked: t(
        '嗯……这可以当作「海滩垃圾」的生词卡。',
        'Hm… this could be a vocabulary card for “beach litter”.',
      ),
    },
    lines: lines('marina', [
      [
        '欢迎来上课！我们周一周三练西语，周四是语言交换。别怕说错。',
        'Welcome! Spanish on Mondays and Wednesdays, language exchange on Thursdays. Don’t be afraid of mistakes.',
      ],
      [
        'CCSE 有题库，宪法、政府、地理、文化都有。每天十题，比临时抱佛脚管用。',
        'The CCSE has a question bank: constitution, government, geography, culture. Ten a day beats cramming.',
      ],
      [
        '路牌上一行西语一行瓦伦西亚语。两种都认得，路就不会走错。',
        'Street signs carry Spanish and Valencian. Read both and you won’t get lost.',
      ],
      [
        '春天教室窗外的橙树开花，学生都说上课像在喝花茶。',
        'In spring the orange trees bloom outside the classroom. The students say lessons smell like blossom tea.',
        { season: 2 },
      ],
      [
        '你的虚拟式用对了！我差点从椅子上跳起来。',
        'You used the subjunctive correctly! I nearly jumped out of my chair.',
        { when: [{ stat: 'spanish', min: 58 }] },
      ],
      [
        '下雨天来上课的人反而更多，大概是不想一个人待着。',
        'More students come when it rains. Maybe nobody wants to be alone.',
        { weather: ['rain'] },
      ],
      [
        '我班上有个学生考过 DELE 那天，请全班吃了一大锅饭。你也会有那一天的。',
        'One student treated the whole class to a giant paella the day she passed the DELE. Your day will come.',
        { heartsMin: 3 },
      ],
      [
        '我是在巴塞罗那长大的，刚来瓦伦西亚时也被人笑口音。语言就是这样，越说越是你的。',
        'I grew up in Barcelona and people laughed at my accent here too. Language is like that: the more you speak it, the more it’s yours.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'quique',
    name: t('基克·纳瓦罗', 'Quique Navarro'),
    role: t(
      '海滩救生员，冬天教桨板，每天早上沿海跑步',
      'Beach lifeguard who teaches paddleboard in winter and runs the seafront every morning',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'park-path' },
        { from: 540, at: 'beach' },
        { from: 1200, at: 'pub-garden' },
        { from: 1320, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'park-path' },
        { from: 600, at: 'beach' },
        { from: 1140, at: 'pub-garden' },
        { from: 1320, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 840, at: 'pub' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 900, at: 'pub' },
        { from: 1200, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['oranges', 'tortilla-de-patatas'],
      liked: ['gazpacho', 'corn', 'cucumber'],
      disliked: ['turron'],
    },
    reactions: {
      loved: t(
        '太棒了！跑完步就需要这个。',
        'Brilliant! Exactly what I need after a run.',
      ),
      liked: t('谢啦，兄弟！', 'Cheers!'),
      neutral: t(
        '谢谢，我放救生塔上。',
        'Thanks, I’ll keep it up on the tower.',
      ),
      disliked: t(
        '杏仁糖？我在控糖……留着圣诞节吧。',
        'Turrón? I’m off sugar… save it for Christmas.',
      ),
    },
    lines: lines('quique', [
      [
        '嘿！早上七点沿海跑一圈，看日出从海里出来。明天一起？',
        'Hey! Seven a.m. run along the sea to watch the sun come out of the water. Tomorrow?',
      ],
      [
        '红旗不能下水，黄旗小心，绿旗随便游。记住了吗？',
        'Red flag, no swimming. Yellow, careful. Green, go for it. Got it?',
      ],
      [
        '冬天的海很安静，适合桨板。水冷，但阳光不冷。',
        'The winter sea is calm, perfect for paddleboarding. The water’s cold but the sun isn’t.',
        { season: 1 },
      ],
      [
        '八月的中午别晒太久，地中海的太阳不开玩笑。',
        'Don’t bake at noon in August. The Mediterranean sun doesn’t joke.',
        { season: 3 },
      ],
      [
        '下雨天海滩关了，我只好在图书馆看急救手册。',
        'The beach shuts when it rains, so I read first-aid manuals at the library.',
        { weather: ['rain'] },
      ],
      [
        '你跑步的配速进步了！下次瓦伦西亚马拉松报个名？',
        'Your pace has improved! Sign up for the València marathon next time?',
        { heartsMin: 3 },
      ],
      [
        '我妈总说我该找个「正经工作」。可每次把人从浪里拉回来，我就觉得这就是正经工作。',
        'My mum says I should get a “proper job”. Every time I pull someone out of the waves, I think this is one.',
        { heartsMin: 6 },
      ],
      [
        '今晚海滩上都是篝火，我值班到天亮。跳浪别跳太远！',
        'Bonfires all along the beach tonight, and I’m on duty till dawn. Don’t jump the waves too far out!',
        { festival: 'sant-joan' },
      ],
    ]),
  },
  {
    id: 'lele',
    name: t('周乐乐', 'Lele Zhou'),
    role: t(
      '雨桐的女儿，八岁，瓦伦西亚语说得比妈妈好',
      'Yutong’s eight-year-old daughter, whose Valencian beats her mum’s',
    ),
    characters: ['exporter'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 510, at: 'away' },
        { from: 1020, at: 'green-centre' },
        { from: 1140, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green-centre' },
        { from: 780, at: 'home' },
        { from: 1020, at: 'beach' },
        { from: 1140, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 510, at: 'away' },
        { from: 1020, at: 'home' },
      ],
      [{ from: 0, at: 'home' }],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1260, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1200, at: 'beach' },
        { from: 1320, at: 'home' },
      ],
    ),
    gifts: {
      loved: ['maduixes-amb-nata', 'roscon'],
      liked: ['fartons', 'strawberry', 'oranges'],
      disliked: ['all-i-pebre'],
    },
    reactions: {
      loved: t(
        '哇！妈妈最好了！我要分给小黑猫一点……不行，猫不能吃。',
        'Wow! Best mum ever! I’ll share some with the black cat… no, cats can’t eat this.',
      ),
      liked: t('谢谢妈妈！', 'Thanks, Mum!'),
      neutral: t('嗯，谢谢。', 'Mm, thanks.'),
      disliked: t(
        '鳗鱼？它看着我！我不吃！',
        'Eel? It’s looking at me! I’m not eating it!',
      ),
    },
    lines: lines('lele', [
      [
        '妈妈，今天老师教我们唱法雅节的歌，我唱给你听！',
        'Mum, the teacher taught us a Fallas song today. Listen!',
      ],
      [
        '我同桌叫保拉，她说我的名字很好听，因为听起来像「alegre」。',
        'My desk-mate Paula says my name is pretty because it sounds like “alegre”.',
      ],
      [
        '周末能去海滩吗？我想堆一个比法雅还高的沙堡。',
        'Can we go to the beach at the weekend? I want to build a sandcastle taller than a falla.',
      ],
      [
        '三王会给我带礼物吗？我写信了，用西语和中文各写了一遍。',
        'Will the Three Kings bring me a present? I wrote my letter in Spanish and Chinese.',
        { season: 1 },
      ],
      [
        '外婆说青田的杨梅熟了。这里有杨梅吗？',
        'Grandma says the bayberries are ripe in Qingtian. Do they have bayberries here?',
        { season: 3 },
      ],
      [
        '妈妈，你的瓦伦西亚语进步了！上次你说对了「bona nit」。',
        'Mum, your Valencian is getting better! You said “bona nit” right last time.',
        { when: [{ stat: 'spanish', min: 60 }] },
      ],
      [
        '我长大想当救生员，像基克那样坐在高高的椅子上。',
        'When I grow up I want to be a lifeguard and sit in a high chair like Quique.',
        { heartsMin: 4 },
      ],
    ]),
  },
];
