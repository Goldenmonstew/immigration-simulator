import type { Npc, Text } from '../../model';
import { nzBalance as b } from './balance';
import type { NzFestival } from './rules';

type NzNpc = Npc<NzFestival>;
type Stops = NzNpc['schedule'][number]['stops'];
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
): NzNpc['schedule'] => [
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
  pairs: [string, string, Partial<NzNpc['lines'][number]>?][],
): NzNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));
const speaksTeReo = { when: [{ stat: 'tereo', min: b.tereoGreeting }] };

export const nzNpcs: NzNpc[] = [
  {
    id: 'mere',
    name: t('梅蕾·蒂佩内', 'Mere Tipene'),
    role: t(
      '退休教师，社区中心毛利语夜校的老师，菜园常客',
      'Retired teacher who runs the te reo night class and tends the community garden',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'garden-plots' },
        { from: 690, at: 'library' },
        { from: 840, at: 'cafe-tables' },
        { from: 1020, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'garden-plots' },
        { from: 720, at: 'board' },
        { from: 900, at: 'domain-centre' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 840, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['vege-soup', 'hangi'],
      liked: ['tea', 'turnip', 'flowers', 'lamingtons'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，你这孩子。下次夜校，你坐我旁边。',
        'Oh, you dear. Next class, you sit beside me.',
      ),
      liked: t(
        'Kia ora，谢谢。我先把手套摘了。',
        'Kia ora, thank you. Let me get my gloves off first.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'That’s kind. Leave it on the bench and I’ll fetch it later.',
      ),
      disliked: t(
        '这个嘛……留着下次海滩清洁日再说。',
        'Hmm… let’s save that for the next beach clean-up.',
      ),
    },
    lines: lines('mere', [
      [
        'Kia ora！我是 Mere。菜园的钥匙挂在告示板旁边，夜校每周都开，带上笔记本就行。',
        'Kia ora! I’m Mere. The garden key hangs by the noticeboard, and the night class runs every week. Just bring a notebook.',
      ],
      [
        '早上见面说 “Mōrena”，就是早上好。说错了也没关系，大家会笑着纠正你。',
        'In the morning, say “Mōrena”: good morning. Get it wrong and someone will kindly put you right.',
      ],
      [
        '夏天番茄长得疯，记得早晚各浇一次水。海风大，要搭架子。',
        'Tomatoes go wild in summer. Water morning and evening, and stake them against the sea wind.',
        { season: 1 },
      ],
      [
        '秋天了，邻居门口那箱费约果写着“随便拿”，你别客气。',
        'It’s autumn. That box of feijoas at the gate says “help yourself”, so do.',
        { season: 2 },
      ],
      [
        '冬天地里没多少活，正好在夜校多学几个词。Matariki 快到了。',
        'Not much to do in the garden in winter. A good time for more words. Matariki is coming.',
        { season: 3 },
      ],
      [
        '看见那棵开黄花的树了吗？那是 kōwhai，tūī 最爱来喝花蜜。',
        'See the tree with yellow flowers? That’s kōwhai. The tūī love its nectar.',
        { season: 4 },
      ],
      [
        '下雨天，我在图书馆把下周的课备好。今天学数数：tahi、rua、toru。',
        'On wet days I plan next week’s class in the library. Today we count: tahi, rua, toru.',
        { weather: ['rain'] },
      ],
      [
        'Ka pai！你的发音进步了。我年轻时也是这样，一个词一个词捡回来的。',
        'Ka pai! Your pronunciation has come on. When I was young I picked the language back up word by word too.',
        speaksTeReo,
      ],
      [
        '你来了以后，菜园的人多了。这里不只是种菜的地方，也是大家聊天的地方。',
        'Since you came, more people come to the garden. It’s not just for growing; it’s for talking too.',
        { heartsMin: 3 },
      ],
      [
        '我外婆说，人要知道自己从哪里来。你也有你的来处，在这里也会有新的。',
        'My grandmother said you should know where you come from. You have yours, and you’ll find a new one here too.',
        { heartsMin: 6 },
      ],
      [
        'Matariki 是新年。抬头看：Pōhutukawa 那颗星，记着离开的人；Hiwa-i-te-rangi，是许愿的星。',
        'Matariki is the new year. Look up: the star Pōhutukawa holds those we’ve lost, and Hiwa-i-te-rangi is the one for wishes.',
        { festival: 'matariki' },
      ],
    ]),
  },
  {
    id: 'bruce',
    name: t('布鲁斯·霍利斯', 'Bruce Hollis'),
    role: t(
      '炸鱼薯条店老板，天天清早在码头钓鱼',
      'Owner of the fish and chip shop, on the wharf at dawn every day',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'wharf-end' },
        { from: 600, at: 'chippy' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'wharf-end' },
        { from: 720, at: 'tavern-deck' },
        { from: 840, at: 'chippy' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'chippy' },
        { from: 1290, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'pub' },
        { from: 840, at: 'chippy' },
        { from: 1290, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['snapper', 'fish-and-chips'],
      liked: ['kahawai', 'pie', 'corn-fritters'],
      disliked: ['pavlova'],
    },
    reactions: {
      loved: t(
        '好家伙！这条今晚进我的油锅，招牌上写你的名字。',
        'Beauty! This one goes in my fryer tonight, with your name on the board.',
      ),
      liked: t(
        '谢了，伙计。下次来，薯条给你多抓一把。',
        'Cheers, mate. Next time there’s an extra scoop of chips for you.',
      ),
      neutral: t('收到，先放柜台后面。', 'Ta. I’ll pop it behind the counter.'),
      disliked: t(
        '甜的我不行……给 Grace 吧，她会高兴。',
        'Not one for sweets, me… give it to Grace, she’ll love it.',
      ),
    },
    lines: lines('bruce', [
      [
        '新来的？我是 Bruce。炸鱼要新鲜、裹粉要薄，这是我爸教的。钓鱼的事，问我就对了。',
        'New in town? I’m Bruce. Fresh fish, thin batter: my dad taught me that. Ask me anything about fishing.',
      ],
      [
        '涨潮的时候，真鲷会游到码头底下。饵用鱿鱼就行。',
        'On the incoming tide the snapper come in under the wharf. Squid for bait does the job.',
      ],
      [
        '钓上来的真鲷要是不够尺寸，就放回去。给明年留着。',
        'If a snapper’s undersized, back it goes. Leave some for next year.',
      ],
      [
        '夏天的晚上，全镇的人都来排队。我这油锅比圣诞树还热闹。',
        'Summer evenings the whole town queues out the door. My fryer’s busier than a Christmas tree.',
        { season: 1 },
      ],
      [
        '冬天风大，码头上就剩我和几只海鸥。',
        'Winter wind, and it’s just me and the gulls on the wharf.',
        { season: 3 },
      ],
      [
        '下雨天不钓鱼，我在店里削土豆。一天削一麻袋。',
        'No fishing in the rain. I peel spuds in the shop instead: a sack a day.',
        { weather: ['rain'] },
      ],
      [
        '我爷爷那代人在这儿开渔船。现在船少了，可每个周五晚上，大家还是来买炸鱼。',
        'My grandad’s lot ran fishing boats here. Fewer boats now, but every Friday night folk still come for fish and chips.',
        { heartsMin: 3 },
      ],
      [
        '你知道吗？你是第一个在码头上帮我解开钓线、还不嫌我啰嗦的人。',
        'You know, you’re the first who’s untangled my line on the wharf and put up with my yarns.',
        { heartsMin: 6 },
      ],
      [
        '农牧展上我负责炸鱼摊。去年排队排到了羊圈那边。',
        'I run the fish stall at the A&P show. Last year the queue reached the sheep pens.',
        { festival: 'ap-show' },
      ],
    ]),
  },
  {
    id: 'sione',
    name: t('西奥内·陶法', 'Sione Taufa'),
    role: t(
      '汤加裔船厂工头，周六带少儿触式橄榄球',
      'Tongan Kiwi boatyard foreman who coaches junior touch rugby on Saturdays',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'work' },
        { from: 1020, at: 'rugby-field' },
        { from: 1140, at: 'pub' },
        { from: 1320, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'rugby-field' },
        { from: 780, at: 'domain-centre' },
        { from: 900, at: 'cafe-tables' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'work' },
        { from: 990, at: 'pub' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 720, at: 'library' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['panikeke', 'fish-and-chips'],
      liked: ['corn-fritters', 'pie', 'kahawai'],
      disliked: ['tea'],
    },
    reactions: {
      loved: t(
        'Mālō！这个味道，跟我妈做的一样。',
        'Mālō! Tastes just like my mum’s.',
      ),
      liked: t(
        '谢啦，兄弟。训练完正好饿了。',
        'Thanks, bro. Just what I need after training.',
      ),
      neutral: t(
        '谢谢，我带回家给孩子们。',
        'Thanks. I’ll take it home for the kids.',
      ),
      disliked: t(
        '茶？我们家只在葬礼上喝茶……开玩笑的，谢谢。',
        'Tea? We only drink that at funerals… joking. Thanks.',
      ),
    },
    lines: lines('sione', [
      [
        'Mālō e lelei！我是 Sione，船厂的工头。周六早上来公园，跟孩子们一起打触式橄榄球。',
        'Mālō e lelei! I’m Sione, foreman at the boatyard. Come to the domain on Saturday morning and play touch with the kids.',
      ],
      [
        '触式橄榄球不用扑人，摸到就算。规则简单，跑起来就会了。',
        'Touch rugby has no tackling: a touch counts. Simple rules. You’ll get it once you start running.',
      ],
      [
        '我爸妈从汤加来的时候，只带了一个箱子和一本圣经。现在我家每个周日都坐满了人。',
        'When my parents came from Tonga they had one suitcase and a Bible. Now our Sunday table is always full.',
      ],
      [
        '夏天船厂最忙，大家都想在圣诞前把船弄下水。',
        'Summer’s the busiest at the yard. Everyone wants their boat in the water before Christmas.',
        { season: 1 },
      ],
      [
        '下雨就在车间里刷清漆。木头吸了漆，颜色像蜂蜜。',
        'In the rain we varnish in the shed. The wood drinks it up and goes the colour of honey.',
        { weather: ['rain'] },
      ],
      [
        '你知道 “fakaʻapaʻapa” 吗？就是尊重。我教孩子们打球，先教这个。',
        'Know “fakaʻapaʻapa”? Respect. When I coach the kids, that comes first.',
        { heartsMin: 3 },
      ],
      [
        '有时候我想，我爸妈当年是不是也像你这样，一边想家一边学着把这里当家。',
        'Sometimes I wonder if my parents were like you once: homesick, and still learning to call this home.',
        { heartsMin: 6 },
      ],
      [
        '今天的 panikeke 是我姑妈炸的。排队的人多，可她给你留了一份。',
        'My aunty made today’s panikeke. Long queue, but she saved you some.',
        { festival: 'pasifika' },
      ],
    ]),
  },
  {
    id: 'grace',
    name: t('刘恩慈', 'Grace Liu'),
    role: t(
      '潮汐咖啡馆老板兼咖啡师，在湾区长大的华裔第二代',
      'Owner and barista of Tide Café, a second-generation Chinese Kiwi raised in the bay',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 960, at: 'beach-path' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 930, at: 'bench' },
        { from: 1020, at: 'beach-path' },
        { from: 1110, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 960, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['pavlova', 'strawberry'],
      liked: ['flowers', 'lamingtons', 'tomato'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '天哪，pavlova！我得拍张照放进店里的橱窗。',
        'Oh wow, a pavlova! I’m putting a photo of this in the café window.',
      ),
      liked: t('好可爱，谢谢你。', 'That’s lovely, thank you.'),
      neutral: t(
        '谢谢，我先放在柜台上。',
        'Thanks. I’ll keep it on the counter.',
      ),
      disliked: t(
        '呃……这个还是还给大海吧。',
        'Um… maybe give that back to the sea.',
      ),
    },
    lines: lines('grace', [
      [
        '欢迎来潮汐！flat white 是我们的招牌：奶泡薄，咖啡香。下午三点半打烊，别来晚了。',
        'Welcome to Tide! The flat white is our pride: thin milk, strong coffee. We close at half three, so don’t be late.',
      ],
      [
        '我爸妈以前开街角那家小店。我小时候在柜台后面写作业，看全镇的人来买牛奶。',
        'My parents used to run the corner dairy. I did my homework behind the counter, watching the whole town buy milk.',
      ],
      [
        '澳大利亚人说 flat white 是他们发明的。我们不跟他们吵，只是做得更好。',
        'Australians say they invented the flat white. We don’t argue. We just make it better.',
      ],
      [
        '夏天的早上，冲浪的人湿着头发来买咖啡，地上全是沙子。',
        'Summer mornings, the surfers come in dripping for coffee and the floor fills with sand.',
        { season: 1 },
      ],
      [
        '冬天我店里卖得最好的是热巧克力，加一颗棉花糖。',
        'In winter my best seller is hot chocolate with a marshmallow.',
        { season: 3 },
      ],
      [
        '下雨天大家都躲进来，咖啡馆像个客厅。',
        'When it rains everyone piles in, and the café turns into a living room.',
        { weather: ['rain'] },
      ],
      [
        '小时候有人问我“你从哪里来”，我说就是这里。现在我会多说一句：我奶奶从广州来。',
        'When I was little and people asked where I was from, I said here. Now I add: my nana came from Guangzhou.',
        { heartsMin: 3 },
      ],
      [
        '你是第一个记得我每周一休息、还给我带早餐的客人。',
        'You’re the first customer who remembered I’m off on Mondays and brought me breakfast.',
        { heartsMin: 6 },
      ],
      [
        '今晚我在公园摆热饮摊。灯笼一亮，整个海湾都好安静。',
        'I’ve got a hot drinks stall at the domain tonight. When the lanterns come on, the whole bay goes quiet.',
        { festival: 'matariki' },
      ],
    ]),
  },
  {
    id: 'annelie',
    name: t('安内莉·范维克', 'Annelie van Wyk'),
    role: t(
      '十二年前从南非搬来，如今是公民，在社区咨询处做志愿者',
      'Moved from South Africa twelve years ago, now a citizen, volunteers at the advice centre',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 780, at: 'cafe-tables' },
        { from: 840, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'beach-path' },
        { from: 780, at: 'council' },
        { from: 960, at: 'tavern-deck' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 900, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'cafe' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['roast-veg', 'lamingtons'],
      liked: ['tea', 'anzac-biscuits', 'flowers'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        'Lekker！这让我想起开普敦周日的烤肉。',
        'Lekker! That takes me back to Sunday braais in Cape Town.',
      ),
      liked: t('谢谢你，太贴心了。', 'Thank you, that’s so thoughtful.'),
      neutral: t('谢谢，我收下了。', 'Thanks, I’ll take that.'),
      disliked: t(
        '购物车……我们咨询处可不收这个。',
        'A trolley… the advice centre doesn’t take donations like that.',
      ),
    },
    lines: lines('annelie', [
      [
        '你好，我是 Annelie。咨询处的志愿者会陪你把评估一项项看完，不懂的地方直接问。',
        'Hello, I’m Annelie. Volunteers here will go through the assessment with you, item by item. Just ask.',
      ],
      [
        '我拿到永久居民签证那天，第一件事就是订回开普敦的机票，终于不用算旅行条件了。',
        'The day my permanent resident visa came through, I booked a flight to Cape Town. No more counting travel conditions.',
      ],
      [
        '入籍看的是在新西兰的天数。我出门前都会在日历上数一遍。',
        'Citizenship counts your days in New Zealand. I count them on the calendar before every trip.',
      ],
      [
        '入籍仪式在区议会的礼堂。我唱国歌的时候，毛利语那段一个字都没错。',
        'The citizenship ceremony was in the council chambers. I sang the anthem, and didn’t miss a word of the Māori verse.',
      ],
      [
        '秋天的周末，我在酒馆露台上烤肉。南非人管这叫 braai。',
        'On autumn weekends I braai on the tavern deck. That’s a barbecue, South African style.',
        { season: 2 },
      ],
      [
        '下雨天咨询处人最多。大家进来躲雨，顺便问问租房合同。',
        'Rainy days are the busiest here. People come in out of the wet and ask about tenancy agreements.',
        { weather: ['rain'] },
      ],
      [
        '刚来的第一年，我每天都想回去。第三年，我开始给新来的人当志愿者。',
        'My first year here, I wanted to go back every day. By the third, I was volunteering for the newcomers.',
        { heartsMin: 3 },
      ],
      [
        '你让我想起刚来的自己。慢慢来，这个海湾会接住你的。',
        'You remind me of myself when I arrived. Take your time. This bay will catch you.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'nikau',
    name: t('尼考·沃克', 'Nikau Walker'),
    role: t(
      '十岁，爱看鸟也爱钓鱼，Aroha 的外甥',
      'Ten years old, loves birds and fishing; Aroha’s nephew',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 900, at: 'wharf-end' },
        { from: 1020, at: 'garden-gate' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'rugby-field' },
        { from: 720, at: 'wharf-end' },
        { from: 900, at: 'domain-centre' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'library' },
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
      loved: ['kahawai', 'candyfloss'],
      liked: ['anzac-biscuits', 'strawberry', 'corn-fritters'],
      disliked: ['tea'],
    },
    reactions: {
      loved: t(
        '哇！我要拍下来给全班看！',
        'Whoa! I’m showing the whole class!',
      ),
      liked: t(
        '谢谢！我分一半给我妹……可能。',
        'Thanks! I’ll give half to my sister… maybe.',
      ),
      neutral: t('谢谢。这个是干嘛用的？', 'Thanks. What’s it for?'),
      disliked: t('苦的……大人的饮料。', 'Bitter… a grown-up drink.'),
    },
    lines: lines('nikau', [
      [
        '嘘——树上那只是 tūī。听，它会发出两种声音，一种像铃铛，一种像咳嗽。',
        'Shh — that’s a tūī in the tree. Listen: it makes two sounds at once, one like a bell and one like a cough.',
      ],
      [
        '跟着你飞的那只小鸟叫 pīwakawaka。它不是喜欢你，是在吃你踩起来的小虫。',
        'The little bird following you is a pīwakawaka. It doesn’t love you; it’s eating the bugs you kick up.',
      ],
      [
        '我用面包钓到过一条 kahawai，它跳得比我还高。',
        'I caught a kahawai on bread once. It jumped higher than me.',
      ],
      [
        '夏天我们从码头往下跳。水好冷，可是冲上来的时候大家都在尖叫。',
        'In summer we jump off the wharf. The water’s freezing, but everyone screams when they come up.',
        { season: 1 },
      ],
      [
        '秋天的时候，kererū 吃了熟透的果子会醉，有时候直接从树上掉下来。真的！',
        'In autumn the kererū eat overripe fruit and get drunk. Sometimes they fall right out of the tree. Really!',
        { season: 2 },
      ],
      [
        '下雨不能钓鱼，我在图书馆看鸟类图鉴。',
        'No fishing in the rain, so I’m reading the bird book at the library.',
        { weather: ['rain'] },
      ],
      [
        '你的国家有 tūī 吗？没有？那你们那边的鸟会唱什么歌？',
        'Do you have tūī where you’re from? No? Then what songs do your birds sing?',
        { heartsMin: 3 },
      ],
      [
        '我在灯笼上画了一只 kererū。Mere 阿姨说它会帮我把愿望带上天。',
        'I drew a kererū on my lantern. Whaea Mere says it’ll carry my wish up to the sky.',
        { festival: 'matariki' },
      ],
    ]),
  },
  {
    id: 'hamish',
    name: t('哈米什·里德', 'Hamish Reid'),
    role: t(
      '图书馆馆员，在南岛牧场长大，周二问答夜的主持人',
      'Librarian raised on a South Island sheep farm, quizmaster on Tuesday nights',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'library' },
        { from: 1020, at: 'pub' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'domain-centre' },
        { from: 780, at: 'library' },
        { from: 1020, at: 'tavern-deck' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'library' },
        { from: 1080, at: 'pub' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 960, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['roast-veg', 'pie'],
      liked: ['tea', 'anzac-biscuits', 'potato'],
      disliked: ['candyfloss'],
    },
    reactions: {
      loved: t(
        '烤土豆！跟我妈在牧场上做的一个味道。',
        'Roast spuds! Just like Mum made on the farm.',
      ),
      liked: t('谢谢，我留着配茶。', 'Thanks, I’ll have that with a cuppa.'),
      neutral: t(
        '谢谢，放在还书箱旁边吧。',
        'Thanks. Pop it by the returns box.',
      ),
      disliked: t(
        '棉花糖……粘在书上可就麻烦了。',
        'Candyfloss… sticky fingers and library books don’t mix.',
      ),
    },
    lines: lines('hamish', [
      [
        '欢迎来图书馆。借书证免费，毛利语绘本在儿童区右边，大人也可以借。',
        'Welcome to the library. Membership is free. The te reo picture books are right of the children’s corner, and adults can borrow them too.',
      ],
      [
        '我在南岛的牧场长大。剪毛季的时候，全家凌晨四点就起床。',
        'I grew up on a South Island sheep farm. In shearing season the whole family was up at four.',
      ],
      [
        '周二晚上来酒馆参加问答夜吧。今天的冷知识：新西兰的羊比人多。',
        'Come to quiz night at the tavern on Tuesday. Today’s trivia: New Zealand has more sheep than people.',
      ],
      [
        '春天是产羔季，山坡上全是小羊，叫声一整夜不停。',
        'Spring is lambing season. The hills fill with lambs and they bleat all night.',
        { season: 4 },
      ],
      [
        '冬天图书馆最暖和，来看书的人比夏天多一倍。',
        'In winter the library’s the warmest room in town, and twice as busy as in summer.',
        { season: 3 },
      ],
      [
        '下雨天我给小朋友讲故事。今天讲的是 Māui 钓起北岛的故事。',
        'On wet days I do story time. Today it’s Māui fishing up the North Island.',
        { weather: ['rain'] },
      ],
      [
        '你借的书总是按时还，我在系统里给你记了一颗小星星。',
        'You always bring your books back on time. I’ve given you a little star in the system.',
        { heartsMin: 3 },
      ],
      [
        '其实我也是从别的地方搬来的，只不过是从南岛。在这个小镇，谁都曾经是新来的人。',
        'I moved here from somewhere else too, only from the South Island. In this town, everyone was new once.',
        { heartsMin: 6 },
      ],
      [
        '今年剪羊毛比赛我当计时员。最快的选手一分钟不到就剪完一只。',
        'I’m timekeeper for the shearing race this year. The fastest shearers do a sheep in under a minute.',
        { festival: 'ap-show' },
      ],
    ]),
  },
  {
    id: 'aroha',
    name: t('阿萝哈·沃克', 'Aroha Walker'),
    role: t(
      'Lukas 的伴侣，小学老师，在湾区长大',
      'Lukas’s partner, a primary-school teacher who grew up in the bay',
    ),
    characters: ['partner'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 480, at: 'away' },
        { from: 990, at: 'garden-plots' },
        { from: 1080, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 540, at: 'rugby-field' },
        { from: 720, at: 'home' },
        { from: 900, at: 'beach-path' },
        { from: 1020, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 480, at: 'away' },
        { from: 1020, at: 'home' },
      ],
      [{ from: 0, at: 'home' }],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1260, at: 'home' },
      ],
    ),
    gifts: {
      loved: ['pavlova', 'vege-soup'],
      liked: ['flowers', 'strawberry', 'fish-and-chips'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '你做的？我要拿去给 Nan 炫耀一下。',
        'You made this? I’m showing it off to Nan.',
      ),
      liked: t(
        '谢谢你，亲爱的。我们一起吃吧。',
        'Thanks, love. Let’s share it.',
      ),
      neutral: t('谢谢，我先放冰箱。', 'Thanks. Into the fridge for now.'),
      disliked: t(
        '这是……从海里捞上来的吧？',
        'Is that… something from the sea?',
      ),
    },
    lines: lines('aroha', [
      [
        '我回来了！今天班上的孩子学会了用毛利语唱星期歌，吵了一整天。',
        'I’m home! My class learned the days of the week in te reo today and sang them all day long.',
      ],
      [
        '周六上午我们去看 Nikau 打球吧？他说要让你看他达阵。',
        'Shall we watch Nikau’s game on Saturday morning? He wants you to see him score.',
      ],
      [
        'Nan 说周日要来吃饭，她会带 boil-up 来。你负责做甜点。',
        'Nan’s coming for Sunday dinner with a boil-up. You’re on pudding.',
      ],
      [
        '德国现在是冬天吧？我们这儿在海边吃圣诞午餐，你妈妈一定不信。',
        'It’s winter in Germany now, isn’t it? We’re having Christmas lunch at the beach. Your mum won’t believe it.',
        { season: 1 },
      ],
      [
        '你的毛利语比去年好多了。下次去 Nan 的 marae，你可以自己做自我介绍。',
        'Your te reo is so much better than last year. Next time we visit Nan’s marae, you can do your own introduction.',
        speaksTeReo,
      ],
      [
        '有时候我在想，如果是我搬去汉堡，会不会也这样一边想家一边学语言。',
        'Sometimes I wonder: if I’d moved to Hamburg, would I be homesick and learning the language like you?',
        { heartsMin: 4 },
      ],
    ]),
  },
];
