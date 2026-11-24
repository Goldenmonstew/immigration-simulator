import type { Npc, Text } from '../../model';
import type { AuFestival } from './rules';

type AuNpc = Npc<AuFestival>;
type Stops = AuNpc['schedule'][number]['stops'];
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
): AuNpc['schedule'] => [
  { festival: true, stops: festival },
  { weather: ['rain'], dayKinds: ['workday'], stops: rain },
  { weather: ['rain'], dayKinds: ['weekend', 'special'], stops: wetWeekend },
  { dayKinds: ['workday'], stops: work },
  { dayKinds: ['weekend', 'special'], stops: weekend },
];
const lines = (
  npc: string,
  pairs: [string, string, Partial<AuNpc['lines'][number]>?][],
): AuNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

// Seasons are southern: 1 summer, 2 autumn, 3 winter, 4 spring.
export const auNpcs: AuNpc[] = [
  {
    id: 'bev',
    name: t('贝芙·卡特赖特', 'Bev Cartwright'),
    role: t(
      '退休老师，社区菜园召集人',
      'Retired teacher who runs the community garden',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'allotment-plots' },
        { from: 660, at: 'board' },
        { from: 750, at: 'cafe' },
        { from: 870, at: 'allotment' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'allotment-plots' },
        { from: 720, at: 'board' },
        { from: 900, at: 'park-bench' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'college' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['scone-jam', 'scone'],
      liked: ['wattle', 'tomato', 'lamington'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '哎呀，这可比我的得奖作品还好。今年农业展你得替我报名。',
        'Oh, that beats my prize entry. You’re entering the show for me this year.',
      ),
      liked: t(
        '谢谢你，亲爱的。我先放进篮子里。',
        'Thank you, love. Into the basket it goes.',
      ),
      neutral: t(
        '有心了。放在工具棚门口吧。',
        'That’s kind. Leave it by the shed door.',
      ),
      disliked: t(
        '这个……我们回收站见吧。',
        'Hm… I’ll see you at the tip with that one.',
      ),
    },
    lines: lines('bev', [
      [
        '新来的？我是贝芙，菜园的事归我管。公告板上有义务劳动的时间，来了就有香肠吃。',
        'New, are you? I’m Bev, I look after the garden. The working bee times are on the board, and there’s always a sausage in it for you.',
      ],
      [
        '番茄要等墨尔本杯那天再种，老规矩。早了霜一打就完了。',
        'Tomatoes go in on Melbourne Cup day. Old rule. Any earlier and a late frost gets them.',
        { season: 4 },
      ],
      [
        '夏天浇水要赶早，太阳一上来，水还没渗下去就蒸发了。',
        'Water early in summer. Once the sun’s up it evaporates before it soaks in.',
        { season: 1 },
      ],
      [
        '秋天种芜菁正好，冬天煮汤，甜得很。',
        'Autumn’s the time for turnips. Winter soup, lovely and sweet.',
        { season: 2 },
      ],
      [
        '下雨天地里没活，我在图书馆给菜园写通讯。',
        'No garden work in the rain, so I’m writing the garden newsletter at the library.',
        { weather: ['rain'] },
      ],
      [
        '我教了三十年小学。班上每年都有刚来的孩子，第一个月不说话，第二年就是班长。',
        'Thirty years teaching primary. Every year a new kid sat silent for a month, and by the next year they were class captain.',
        { heartsMin: 3 },
      ],
      [
        '你知道我为什么喜欢菜园吗？不管你从哪儿来，土豆都按自己的时间长。',
        'You know why I love the garden? Wherever you’re from, the potatoes grow on their own time.',
        { heartsMin: 6 },
      ],
      [
        '司康饼的秘诀是黄油要冷，手要快。别告诉评委。',
        'The secret to scones is cold butter and quick hands. Don’t tell the judges.',
        { festival: 'show-day' },
      ],
    ]),
  },
  {
    id: 'gazza',
    name: t('加里·诺兰（加扎）', 'Gary “Gazza” Nolan'),
    role: t(
      '鹈鹕酒店老板，下午在码头钓鱼',
      'Publican at the Pelican, fishes off the jetty',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'jetty-end' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'jetty-end' },
        { from: 660, at: 'pub-garden' },
        { from: 900, at: 'pond' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['flathead', 'flathead-and-chips'],
      liked: ['whiting', 'meat-pie', 'bbq-corn'],
      disliked: ['scone-jam'],
    },
    reactions: {
      loved: t(
        '好家伙！今晚的特价菜就写你的名字。',
        'You beauty! Tonight’s special goes up with your name on it.',
      ),
      liked: t(
        '谢了，伙计。下次的薯条我多给一把。',
        'Cheers, mate. Extra chips on your next plate.',
      ),
      neutral: t('收到，先放吧台后面。', 'Ta. Behind the bar it goes.'),
      disliked: t(
        '甜的啊……我这儿只有啤酒是甜的。',
        'Sweet stuff… the only sweet thing in here is the beer.',
      ),
    },
    lines: lines('gazza', [
      [
        'G’day！第一次来？坐吧台吧，帕玛鸡排今天最好。',
        'G’day! First time in? Grab a stool, the parma’s good today.',
      ],
      [
        '鲬鱼喜欢沙底，你把饵放低一点，慢慢拖。',
        'Flathead sit on the sand. Keep your bait low and drag it slow.',
      ],
      [
        '涨潮前一个小时最好钓。看潮汐表，别看天气预报，天气预报在这儿没用。',
        'An hour before high tide is best. Read the tide chart, not the forecast. The forecast’s useless round here.',
      ],
      [
        '下雨天客人少，正好把酒桶换了。',
        'Rain means a quiet pub. Good day to change the kegs.',
        { weather: ['rain'] },
      ],
      [
        '夏天露台坐满了，冲浪的、开房车的，还有迷路的游客。',
        'Summer fills the deck: surfers, caravanners and the odd lost tourist.',
        { season: 1 },
      ],
      [
        '你说 “arvo” 的口音越来越对了。再练练 “no worries”。',
        'Your “arvo” is coming along. Work on your “no worries”.',
        { when: [{ stat: 'english', min: 60 }] },
      ],
      [
        '我爷爷那辈开这家店时，镇上一半人在罐头厂上班。厂子关了，酒店还开着。',
        'When my grandad ran this place, half the town worked at the cannery. The cannery shut; the pub kept going.',
        { heartsMin: 4 },
      ],
      [
        '有些人来住一个夏天，有些人一住就是一辈子。我看你像后一种。',
        'Some folks come for a summer, some stay for good. You look like the second sort to me.',
        { heartsMin: 7 },
      ],
      [
        '总决赛那天酒店不供应别的，只有肉派和啤酒。海鸥队加油！',
        'Grand final day, the menu is pies and beer, full stop. Go Gulls!',
        { festival: 'footy-final' },
      ],
    ]),
  },
  {
    id: 'leilani',
    name: t('莱拉妮·陶法', 'Leilani Taufa'),
    role: t(
      '盐角咖啡馆老板，每天早上下海游泳',
      'Owner of Saltbush Café, swims every morning',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'beach-flags' },
        { from: 450, at: 'cafe' },
        { from: 900, at: 'shop' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'beach-flags' },
        { from: 480, at: 'cafe' },
        { from: 900, at: 'green-centre' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['pavlova', 'summer-salad'],
      liked: ['strawberry', 'wattle', 'lamington'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哇！明天的特别甜点就是它，我会写上「本地朋友提供」。',
        'Oh wow! That’s tomorrow’s special, “courtesy of a local friend”.',
      ),
      liked: t(
        '谢谢你，亲爱的！放在柜台上给大家看。',
        'Thanks, darl! It’s going on the counter for everyone to see.',
      ),
      neutral: t(
        '谢谢，下一杯咖啡算我的。',
        'Thanks, your next coffee’s on me.',
      ),
      disliked: t(
        '这……是海里冲上来的吧？',
        'Is that… something the sea coughed up?',
      ),
    },
    lines: lines('leilani', [
      [
        '早！老样子？第一次来就先来杯 flat white，牛奶温度你说了算。',
        'Morning! First visit? Start with a flat white, and tell me how hot you like the milk.',
      ],
      [
        '我爸妈从汤加来，开了镇上第一家面包店。我把它改成了咖啡馆，他们到现在还在抱怨。',
        'Mum and Dad came from Tonga and opened the town’s first bakery. I turned it into a café, and they still complain.',
      ],
      [
        '咖啡馆三点关门。下午是留给大海的。',
        'We close at three. Afternoons belong to the sea.',
      ],
      [
        '一天四季，记得吗？出门带外套，口袋里放墨镜。',
        'Four seasons in one day, remember? Jacket on, sunnies in the pocket.',
        { season: 2 },
      ],
      [
        '冬天的海水很冷，可游完那一下，整个人都醒了。',
        'The sea’s freezing in winter, but after a dip you’re wide awake.',
        { season: 3 },
      ],
      [
        '下雨天大家都想喝热巧克力，我得多烧两壶奶。',
        'Rainy days everyone wants hot chocolate. Two more jugs of milk on.',
        { weather: ['rain'] },
      ],
      [
        '你知道吗？镇上的人都记得你点什么。这就是住下来了。',
        'You know what? The whole town remembers your order now. That’s what settling in looks like.',
        { heartsMin: 4 },
      ],
      [
        '澳大利亚日我做五百份早餐，你来帮忙翻香肠吧！',
        'I’m doing five hundred breakfasts on Australia Day. Come flip sausages!',
        { festival: 'australia-day' },
      ],
    ]),
  },
  {
    id: 'rosa',
    name: t('罗莎·比安基', 'Rosa Bianchi'),
    role: t(
      '注册移民代理，周末在菜园种意大利番茄',
      'Registered migration agent, grows Italian tomatoes at weekends',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 750, at: 'cafe' },
        { from: 810, at: 'council' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'allotment-plots' },
        { from: 720, at: 'council' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'council' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['tomato', 'summer-salad'],
      liked: ['flat-white', 'roast-spuds', 'wattle'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '这番茄！我妈妈要是看见，会以为是她家院子里摘的。',
        'These tomatoes! My mother would swear they came from her own backyard.',
      ),
      liked: t(
        '谢谢，我放在文件柜上，看着就开心。',
        'Thank you. It’s going on the filing cabinet to cheer me up.',
      ),
      neutral: t('谢谢，客气了。', 'Thank you, that’s kind.'),
      disliked: t(
        '我们还是聊聊你的材料吧。',
        'Shall we get back to your paperwork?',
      ),
    },
    lines: lines('rosa', [
      [
        '你好，我是罗莎。想知道自己走到哪一步了，就进来坐，我帮你对着条件一条一条看。',
        'Hello, I’m Rosa. If you want to know where you stand, come in and we’ll go through the requirements one by one.',
      ],
      [
        '我爸妈 1960 年代坐船从卡拉布里亚来。那时候没有 ImmiAccount，只有一个手提箱。',
        'My parents came by ship from Calabria in the sixties. No ImmiAccount then, just a suitcase.',
      ],
      [
        '材料最怕最后一个月才找。体检、无犯罪证明，这些可以早点办。',
        'The worst paperwork is the paperwork you start in the last month. Get the medical and police checks sorted early.',
      ],
      [
        '税单别扔。每一份评税通知我都让客户扫描存档。',
        'Don’t throw out your tax papers. I make every client scan each notice of assessment.',
        { when: [{ route: 'AU-191' }] },
      ],
      [
        '香港类别看的是你一直住在哪里。出远门前，先来跟我聊聊。',
        'The Hong Kong streams look at where you’ve been living all along. Talk to me before any long trip.',
        { when: [{ route: 'AU-191-HK' }] },
      ],
      [
        '番茄和移民一样：要找对地方，要有耐心，还要有人照看。',
        'Tomatoes are like migration: the right spot, patience, and someone keeping an eye out.',
        { season: 1 },
      ],
      [
        '每年澳大利亚日我都去看入籍仪式。四十年了，我还是会哭。',
        'I go to the citizenship ceremony every Australia Day. Forty years on, I still cry.',
        { heartsMin: 4 },
      ],
      [
        '我妈妈说，家不是你出生的地方，是有人等你吃晚饭的地方。',
        'My mother used to say home isn’t where you’re born; it’s where someone waits for you at dinner.',
        { heartsMin: 7 },
      ],
    ]),
  },
  {
    id: 'sam',
    name: t('萨姆·奥卡福医生', 'Dr Sam Okafor'),
    role: t(
      '全科医生，也是足球俱乐部的队医',
      'GP, and the footy club’s doctor',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'gp' },
        { from: 780, at: 'cafe' },
        { from: 840, at: 'gp' },
        { from: 1080, at: 'park-path' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'park-path' },
        { from: 540, at: 'green-centre' },
        { from: 720, at: 'pub-garden' },
        { from: 840, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'gp' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 840, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 780, at: 'green-centre' },
        { from: 1140, at: 'pub' },
        { from: 1320, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['winter-veg-soup', 'flathead-and-chips'],
      liked: ['potato', 'flat-white', 'meat-pie'],
      disliked: ['lamington'],
    },
    reactions: {
      loved: t(
        '这正是我会开给病人的处方。谢谢你！',
        'Exactly what I’d prescribe. Thank you!',
      ),
      liked: t('谢谢，午休有着落了。', 'Thanks, that’s lunch sorted.'),
      neutral: t('谢谢，心意收到了。', 'Thanks, much appreciated.'),
      disliked: t(
        '作为医生，我得说……糖少一点。',
        'Speaking as your doctor… a little less sugar.',
      ),
    },
    lines: lines('sam', [
      [
        '你好，我是奥卡福医生，叫我萨姆就行。哪里不舒服就来，别硬撑。',
        'Hello, I’m Dr Okafor, but Sam’s fine. Come in when something’s wrong; don’t tough it out.',
      ],
      [
        '我在拉各斯读的医学，在阿德莱德考的执照，最后被这片海留下了。',
        'I studied medicine in Lagos, got registered in Adelaide, and then this stretch of sea kept me.',
      ],
      [
        '夏天出门涂防晒，戴帽子。这里的太阳比你想的厉害。',
        'Sunscreen and a hat in summer. The sun here is stronger than you think.',
        { season: 1 },
      ],
      [
        '秋天打流感疫苗，诊所周六上午也开。',
        'Get your flu shot in autumn. We open Saturday mornings too.',
        { season: 2 },
      ],
      [
        '下雨天诊所挤满了咳嗽的人。多喝热水，少逛超市。',
        'Rainy days fill the waiting room with coughs. Hot drinks, fewer shopping trips.',
        { weather: ['rain'] },
      ],
      [
        '你最近睡得好一点了吧？脸色比上次好。',
        'Sleeping better lately? You look brighter than last time.',
        { when: [{ stat: 'health', min: 70 }] },
      ],
      [
        '刚来的时候，有个病人听到我的口音就要换医生。后来他每周都来，带着自己种的西葫芦。',
        'When I started, one patient asked for another doctor after hearing my accent. Later he came every week, with zucchini from his garden.',
        { heartsMin: 5 },
      ],
      [
        '总决赛我在边线拿着急救包。希望今天只需要用到创可贴。',
        'Grand final day I’m on the boundary with the first-aid kit. Hoping for nothing worse than plasters.',
        { festival: 'footy-final' },
      ],
    ]),
  },
  {
    id: 'kai',
    name: t('凯·沃克', 'Kai Walker'),
    role: t(
      '十岁，码头的鱼类专家，冲浪救生队小队员',
      'Ten years old, jetty fish expert and junior lifesaver',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'jetty-end' },
        { from: 1050, at: 'beach' },
        { from: 1110, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'beach-flags' },
        { from: 660, at: 'jetty-end' },
        { from: 900, at: 'pond' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'library' },
        { from: 1050, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'shop' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['lamington', 'meat-pie'],
      liked: ['whiting', 'bbq-corn', 'strawberry'],
      disliked: ['winter-veg-soup'],
    },
    reactions: {
      loved: t(
        '哇！你是全世界最好的大人！',
        'Woah! You’re the best grown-up in the world!',
      ),
      liked: t('谢啦！我能分给我妹一半。', 'Thanks! I’ll give my sister half.'),
      neutral: t('哦，谢谢。', 'Oh. Thanks.'),
      disliked: t('呃……蔬菜汤？', 'Ugh… vegetable soup?'),
    },
    lines: lines('kai', [
      [
        '你也来钓鱼？我告诉你，码头最边上那根柱子下面有鲬鱼，别告诉别人。',
        'You fishing too? Secret: there’s flathead under the last pylon. Don’t tell anyone.',
      ],
      [
        '乔治王鳕鱼喜欢海草床，你要往左边甩竿。',
        'King George whiting like the seagrass. Cast to the left.',
      ],
      [
        '我是小救生员！我会认离岸流：看起来最平静的那块水，其实最危险。',
        'I’m a nipper! I can spot a rip: the calmest-looking patch is the dangerous bit.',
        { season: 1 },
      ],
      [
        '下雨不能钓鱼，我在图书馆看鱼的图鉴。黑鲷居然能活二十年！',
        'No fishing in the rain, so I’m reading the fish book at the library. Black bream can live twenty years!',
        { weather: ['rain'] },
      ],
      [
        '喜鹊又在扑人了。我把冰淇淋盒戴在头上，上面画了眼睛。',
        'The magpies are swooping again. I wear an ice-cream tub with eyes drawn on it.',
        { season: 4 },
      ],
      [
        '你们国家有鲬鱼吗？那边的鱼会不会长得不一样？',
        'Do you have flathead where you’re from? Do the fish look different there?',
        { heartsMin: 3 },
      ],
      [
        '中场我要下场踢球！我能踢出一个漂亮的螺旋球。',
        'I’m on the field at half-time! I can kick a proper torpedo.',
        { festival: 'footy-final' },
      ],
    ]),
  },
  {
    id: 'doug',
    name: t('道格·皮尔斯', 'Doug Pearce'),
    role: t('骑红色摩托车送信的邮差', 'The postie on the red motorbike'),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'home-street' },
        { from: 600, at: 'high-street-west' },
        { from: 720, at: 'high-street-east' },
        { from: 840, at: 'post' },
        { from: 1020, at: 'pub-garden' },
        { from: 1110, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'pond' },
        { from: 780, at: 'pub-garden' },
        { from: 900, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'post' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 720, at: 'pub' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['meat-pie', 'anzac-biscuit'],
      liked: ['flat-white', 'flathead', 'roast-spuds'],
      disliked: ['pavlova'],
    },
    reactions: {
      loved: t(
        '哎哟，送了三十年信，第一次有人给我送吃的！',
        'Thirty years delivering and finally someone delivers to me!',
      ),
      liked: t('谢了，路上吃。', 'Cheers, I’ll have it on the round.'),
      neutral: t('谢谢，放车筐里吧。', 'Ta, pop it in the basket.'),
      disliked: t('这个在摩托车上可没法吃。', 'Can’t eat that on a motorbike.'),
    },
    lines: lines('doug', [
      [
        '你好！新住户？我是道格。你的信箱有点歪，我帮你扶正了。',
        'G’day! New in the street? I’m Doug. Your letterbox was crooked, so I straightened it.',
      ],
      [
        '下午我在邮局柜台。办无犯罪证明要核验身份，带上护照和住址证明。',
        'Afternoons I’m on the post office counter. For police checks we verify ID, so bring your passport and proof of address.',
      ],
      [
        '镇上每一家我都认识。谁家狗凶，谁家信箱住着蜘蛛，我都知道。',
        'I know every house in town. Which dog bites, which letterbox has a spider living in it.',
      ],
      [
        '十二月包裹多得像山，全是网购的圣诞礼物。',
        'December’s a mountain of parcels. Christmas shopping, all of it.',
        { season: 1 },
      ],
      [
        '下雨天我穿两层雨衣，信还是会湿一个角。',
        'Two raincoats on wet days, and the letters still get a soggy corner.',
        { weather: ['rain'] },
      ],
      [
        '我爷爷参加过二战。纪念日那天我戴着他的勋章。',
        'My grandad served in the Second World War. I wear his medals on Anzac Day.',
        { festival: 'anzac-day' },
      ],
      [
        '你的信越来越多是本地的了，账单、邀请、俱乐部通讯。说明你在这儿扎根了。',
        'More of your post is local now: bills, invitations, club newsletters. That’s roots, that is.',
        { heartsMin: 4 },
      ],
    ]),
  },
  {
    id: 'grace',
    name: t('格蕾丝·门萨', 'Grace Mensah'),
    role: t(
      '医院护士长，去年澳大利亚日入籍',
      'Hospital nurse unit manager, became a citizen last Australia Day',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'work' },
        { from: 1080, at: 'shop' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'cafe' },
        { from: 720, at: 'park-bench' },
        { from: 840, at: 'library-steps' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'work' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'cafe' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['wattle', 'native-seedling'],
      liked: ['flat-white', 'pavlova', 'summer-salad'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '金合欢！入籍那天我也领到一棵，现在已经开花了。',
        'Wattle! I got a seedling at my ceremony, and it’s flowering now.',
      ),
      liked: t(
        '谢谢你，交班后我慢慢享受。',
        'Thank you. I’ll enjoy it after handover.',
      ),
      neutral: t('谢谢，你太客气了。', 'Thank you, how kind.'),
      disliked: t(
        '这个……我们还是放回去吧。',
        'Hmm… let’s put that back where it came from.',
      ),
    },
    lines: lines('grace', [
      [
        '你好！我是格蕾丝，医院的护士长。有什么不懂的，排班、报销还是哪家超市便宜，都可以问我。',
        'Hello! I’m Grace, nurse unit manager at the hospital. Rosters, claims, which supermarket is cheapest: ask me anything.',
      ],
      [
        '我从阿克拉来，先在珀斯工作，后来选了这个小镇。在这里，病人会在超市跟你打招呼。',
        'I came from Accra, worked in Perth, then chose this little town. Here your patients say hello in the supermarket.',
      ],
      [
        '去年澳大利亚日我入了籍。宣誓的时候，我妈妈在视频那头一直哭。',
        'I became a citizen last Australia Day. Mum cried through the whole pledge on video.',
      ],
      [
        '材料一份一份攒，像存钱一样。别等到最后一个月。',
        'Collect your documents one at a time, like savings. Don’t leave it to the last month.',
      ],
      [
        '冬天病房最忙，流感一来，大家都要互相顶班。',
        'Winter is the busiest on the ward. When flu hits, everyone covers for everyone.',
        { season: 3 },
      ],
      [
        '你的病人上周特意来护士站谢你。我替你骄傲。',
        'Your patient came to the nurses’ station last week just to thank you. I’m proud of you.',
        { heartsMin: 4 },
      ],
      [
        '有一天你也会站在那片草坪上领证书。到时候我去给你拍照。',
        'One day you’ll be on that lawn collecting your certificate. I’ll be there taking photos.',
        { heartsMin: 7 },
      ],
      [
        '今天又有一批新公民。我每年都来，提醒自己是从哪里出发的。',
        'Another group of new citizens today. I come every year to remember where I started.',
        { festival: 'australia-day' },
      ],
    ]),
  },
];
