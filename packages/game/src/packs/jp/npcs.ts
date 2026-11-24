import type { Npc, Text } from '../../model';
import type { JpFestival } from './rules';

type JpNpc = Npc<JpFestival>;
type Stops = JpNpc['schedule'][number]['stops'];
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
): JpNpc['schedule'] => [
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
  pairs: [string, string, Partial<JpNpc['lines'][number]>?][],
): JpNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const jpNpcs: JpNpc[] = [
  {
    id: 'yoshie',
    name: t('铃木芳江', 'Yoshie Suzuki'),
    role: t(
      '町内会会长，市民农园老手',
      'Neighbourhood association head and garden regular',
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
      loved: ['miso-soup', 'castella'],
      liked: ['tea', 'turnip', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，这个我最爱。下次町内会开会，我请你坐前排。',
        'Oh, my favourite. Next association meeting, you get a front-row seat.',
      ),
      liked: t(
        '谢谢，我收下了。手套先摘，免得弄脏。',
        'Thank you, I’ll take it. Gloves off first so I don’t smudge it.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'Kind of you. Leave it on the bench; I’ll fetch it later.',
      ),
      disliked: t(
        '这个……放资源垃圾那天再说吧。',
        'Hm… let’s save that for recycling day.',
      ),
    },
    lines: lines('yoshie', [
      [
        '新搬来的？我是町内会的铃木。垃圾分类表贴在告示板上，看不懂就来问我。',
        'New here? I’m Suzuki from the neighbourhood association. The rubbish chart is on the board. Ask me if it puzzles you.',
      ],
      [
        '塑料瓶要把盖子和标签撕下来，不然收垃圾的人会贴黄条子。',
        'Bottles go out without caps and labels, or the collectors leave a yellow sticker.',
      ],
      [
        '芜菁冬天最甜。霜打过一次，味噌汤都香。',
        'Turnips are sweetest in winter. One frost and the miso soup sings.',
        { season: 1 },
      ],
      [
        '樱花一开，河边就挤满了人。占位的蓝垫子，晚上可得收回家。',
        'Once the blossom opens, the river fills up. Those blue sheets go home at night, mind.',
        { season: 2 },
      ],
      [
        '梅雨天番茄容易裂，雨停了再摘。',
        'Tomatoes split in the rainy season. Pick them after the rain stops.',
        { season: 3 },
      ],
      [
        '台风前把花盆搬进屋。去年我那盆紫苏飞到了邻居家阳台。',
        'Bring pots in before a typhoon. Last year my shiso flew onto next door’s balcony.',
        { season: 4 },
      ],
      [
        '雨天地里没活，我在喫茶店把下个月的回览板写好。',
        'No garden work in the rain. I’m drafting next month’s circular in the café.',
        { weather: ['rain'] },
      ],
      [
        '你来了以后，河岸清扫的人多了两个。另一个是你带来的吧？',
        'Since you came, two more people join the riverbank clean-up. You brought the other one, didn’t you?',
        { heartsMin: 3 },
      ],
      [
        '我年轻时也在别的城市住过。头一年总觉得自己是客人，后来就成了主人。',
        'I lived in another city when I was young. The first year I felt like a guest. Then one day I was the host.',
        { heartsMin: 6 },
      ],
      [
        '神社今天热闹。帮我看一下饮料摊，我去找零钱。',
        'The shrine’s lively today. Mind the drinks stall while I find change.',
        { festival: 'aki-matsuri' },
      ],
    ]),
  },
  {
    id: 'kenji',
    name: t('高桥健司', 'Kenji Takahashi'),
    role: t(
      '居酒屋「灯笼」店主，下午在河边钓鱼',
      'Owner of Izakaya Tōrō, fishes by the river',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'pond' },
        { from: 960, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'pond' },
        { from: 900, at: 'pub-garden' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 780, at: 'shop' },
        { from: 960, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['suzuki', 'shioyaki'],
      liked: ['corn', 'yaki-corn', 'tea'],
      disliked: ['ichigo-jam'],
    },
    reactions: {
      loved: t(
        '好鱼！今晚的特别菜单就写你的名字。',
        'Now that’s a fish! Tonight’s special goes up with your name on it.',
      ),
      liked: t(
        '谢啦。下次来，毛豆我多给一把。',
        'Thanks. Next time the edamame comes with an extra handful.',
      ),
      neutral: t(
        '收到收到，先放吧台后面。',
        'Got it, got it. Behind the counter it goes.',
      ),
      disliked: t(
        '甜的啊……我这店里只有啤酒是甜的。',
        'Something sweet… the only sweet thing here is the beer.',
      ),
    },
    lines: lines('kenji', [
      [
        '欢迎光临！第一次来？坐吧台吧，能看我切菜。',
        'Irasshai! First time? Take the counter seat; you can watch me chop.',
      ],
      [
        '鲈鱼这条河里也有，涨潮的时候从海那边游上来。',
        'Sea bass come up this river too, swimming in from the bay at high tide.',
      ],
      [
        '虾虎鱼不聪明，但很执着。跟我年轻时差不多。',
        'Gobies aren’t clever, but they’re stubborn. Like me when I was young.',
      ],
      [
        '下雨天客人少，正好把灯笼擦一擦。',
        'Rain means fewer customers. Good time to wipe the lanterns.',
        { weather: ['rain'] },
      ],
      [
        '夏天来杯冰啤酒，听着隔壁的风铃。这就够了。',
        'A cold beer in summer, the wind chime next door ringing. That’s plenty.',
        { season: 3 },
      ],
      [
        '冬天卖关东煮，萝卜炖到透明才好吃。',
        'Oden in winter. The daikon’s only right once it turns clear.',
        { season: 1 },
      ],
      [
        '你说话越来越像本地人了，连抱怨天气的语气都对了。',
        'You sound more local every week. Even your complaints about the weather have the right tone.',
        { heartsMin: 4 },
      ],
      [
        '我爸开这家店时，隔壁还是稻田。城市会变，常客会换，灯笼还挂着。',
        'When my father opened this place, next door was rice fields. Towns change, regulars change, the lanterns stay.',
        { heartsMin: 7 },
      ],
      [
        '盆踊的炒面今年我来做。酱汁的配方，别告诉别人。',
        'I’m on Bon-dance yakisoba this year. The sauce recipe stays between us.',
        { festival: 'bon-odori' },
      ],
    ]),
  },
  {
    id: 'misaki',
    name: t('小林美咲', 'Misaki Kobayashi'),
    role: t(
      '社区日语教室的志愿老师',
      'Volunteer teacher at the Japanese class',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 1050, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'college' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1050, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 900, at: 'cafe' },
        { from: 1080, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['dango', 'flowers'],
      liked: ['tea', 'castella', 'strawberry'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '哇，谢谢！明天上课就讲「团子」这个词怎么来的。',
        'Oh, thank you! Tomorrow’s lesson: where the word “dango” comes from.',
      ),
      liked: t(
        '谢谢你，我放在讲台上当今天的小奖品。',
        'Thank you. It’ll sit on the desk as today’s little prize.',
      ),
      neutral: t(
        '谢谢，用日语再说一遍「谢谢」吧？',
        'Thanks! Now, say “thank you” in Japanese once more?',
      ),
      disliked: t(
        '这个……我们先学一下它的日语名字好了。',
        'Well… let’s at least learn what it’s called in Japanese.',
      ),
    },
    lines: lines('misaki', [
      [
        '你好！我在这里教日语，周二周四晚上，周末上午也有。旁听免费哦。',
        'Hello! I teach Japanese here: Tuesday and Thursday evenings, and weekend mornings. Sitting in is free.',
      ],
      [
        '「木」两个就是「林」，三个就是「森」。汉字有时候很好说话。',
        'One tree, 木; two make a grove, 林; three a forest, 森. Kanji can be friendly.',
      ],
      [
        '敬语别怕。先把「です」「ます」用顺，剩下的慢慢来。',
        'Don’t fear keigo. Get comfortable with desu and masu; the rest comes slowly.',
      ],
      [
        '评估不是考倒你，是看你在生活里能不能自己办事。',
        'The assessment isn’t a trap. It checks whether you can handle daily life on your own.',
        { when: [{ stat: 'japanese', max: 59 }] },
      ],
      [
        '你上周在区役所自己填完了表？太好了，这就是最好的作业。',
        'You filled in the ward office form yourself last week? Wonderful. That’s the best homework.',
        { when: [{ stat: 'japanese', min: 60 }] },
      ],
      [
        '下雨天来上课的人少。我们干脆练习电话预约吧。',
        'Fewer students on rainy days. Let’s practise booking by phone instead.',
        { weather: ['rain'] },
      ],
      [
        '我以前在海外教过一年书。那时最想听到的，就是有人慢慢跟我说话。',
        'I taught abroad for a year. What I wanted most was someone speaking to me slowly.',
        { heartsMin: 4 },
      ],
      [
        '下个月想请你给新同学讲讲你刚来时怎么办手续的。你愿意吗？',
        'Next month, would you tell the new students how you handled your first paperwork?',
        { heartsMin: 7 },
      ],
      [
        '赏樱的季语是「花見」。今天就用三个季语造句吧。',
        'The season word is hanami. Today, make a sentence with three season words.',
        { festival: 'hanami' },
      ],
    ]),
  },
  {
    id: 'lan',
    name: t('阮氏兰', 'Lan Nguyen'),
    role: t(
      '商店街杂货铺店员，正在准备日语考试',
      'Shopping-street store clerk, studying for her Japanese exam',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 1050, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 900, at: 'cafe' },
        { from: 1020, at: 'park-path' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'shop' },
        { from: 1050, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 900, at: 'library' },
        { from: 1140, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['ichigo-jam', 'sakura-mochi'],
      liked: ['strawberry', 'salad', 'dango'],
      disliked: ['funa'],
    },
    reactions: {
      loved: t(
        '真的给我？我要拍照发给妈妈！',
        'For me, really? I’m sending a photo to my mum!',
      ),
      liked: t('谢谢！休息时间我就吃。', 'Thanks! I’ll have it on my break.'),
      neutral: t(
        '谢谢你～我先放收银台下面。',
        'Thank you! Under the till it goes for now.',
      ),
      disliked: t('呃……鱼的眼睛在看我。', 'Um… the fish is looking at me.'),
    },
    lines: lines('lan', [
      [
        '欢迎光临！种子在左边，团子在收银台旁边。我叫兰，从越南来的。',
        'Welcome! Seeds on the left, dango by the till. I’m Lan, from Vietnam.',
      ],
      [
        '我在背日语单词，每天二十个。今天的是「領収書」，收据。',
        'Twenty Japanese words a day. Today’s is ryōshūsho: receipt.',
      ],
      [
        '第一次续签的时候我紧张得把照片贴歪了。后来才知道，照片要提前拍好。',
        'At my first renewal I was so nervous I stuck the photo on crooked. Now I know: get the photo done early.',
      ],
      [
        '我妈妈说，下雨天适合煮河粉。我说，日本下雨天适合吃乌冬。',
        'My mum says rainy days are for pho. I tell her in Japan they’re for udon.',
        { weather: ['rain'] },
      ],
      [
        '草莓季节到了！我们店的草莓种子卖得最快。',
        'Strawberry season! Our strawberry seeds sell out first.',
        { season: 2 },
      ],
      [
        '我想考护理资格。这样以后可以在日本待更久，也能帮到别人。',
        'I want a caregiving qualification. Then I can stay longer in Japan and help people too.',
        { heartsMin: 3 },
      ],
      [
        '有时候很想家。但你在这里，河边有樱花，好像也没那么远。',
        'Sometimes I miss home. But you’re here, and there’s blossom by the river. It doesn’t feel so far.',
        { heartsMin: 6 },
      ],
      [
        '节分要朝今年的吉利方向，一口气吃完惠方卷。不能说话哦！',
        'For Setsubun you face this year’s lucky direction and eat the whole roll without a word!',
        { festival: 'setsubun' },
      ],
    ]),
  },
  {
    id: 'daisuke',
    name: t('中村大辅', 'Daisuke Nakamura'),
    role: t('区役所窗口职员', 'Ward office clerk'),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 500, at: 'ward' },
        { from: 1040, at: 'bus-stop' },
        { from: 1080, at: 'pub' },
        { from: 1230, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'pond' },
        { from: 840, at: 'cafe' },
        { from: 960, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 500, at: 'ward' },
        { from: 1040, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 960, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['taiyaki', 'haze'],
      liked: ['tea', 'koi', 'jaga-butter'],
      disliked: ['flowers'],
    },
    reactions: {
      loved: t(
        '鲷鱼烧……是红豆的？这下周一的心情有了。',
        'Taiyaki… red bean? Monday morning just improved.',
      ),
      liked: t(
        '谢谢。我会按收到日期记下来——开玩笑的。',
        'Thank you. I’ll log it by date received. Joking.',
      ),
      neutral: t(
        '谢谢，私人物品我先放抽屉。',
        'Thanks. Personal items go in the drawer.',
      ),
      disliked: t(
        '花粉……我有点过敏。心意我收下了。',
        'Pollen… I’m a little allergic. I appreciate the thought.',
      ),
    },
    lines: lines('daisuke', [
      [
        '您好，这里是区役所。住址变更、住民票、课税证明，请先抽号。',
        'Good day. Ward office: address changes, residence records, tax certificates. Please take a number first.',
      ],
      [
        '搬家了的话，记得来申报新住址，在留卡背面也会写上。',
        'If you move, come and report the new address. We write it on the back of your residence card too.',
      ],
      [
        '年金和健康保险的通知别扔。以后办手续时，这些记录很要紧。',
        'Don’t throw away the pension and health insurance letters. Those records matter for later applications.',
      ],
      [
        '周末我去河边钓虾虎鱼。在窗口太久了，看水比较放松。',
        'At weekends I fish for gobies by the river. After a week at the counter, water is restful.',
        { dayKinds: ['weekend'] },
      ],
      [
        '一二月是确定申报的季节。税务署门口排队，比我们这儿还长。',
        'January to March is tax-return season. The queue at the tax office beats ours.',
        { season: 1 },
      ],
      [
        '表格写错了不要紧，划两道线盖章就行。用修正液反而麻烦。',
        'A mistake on the form is fine: two lines and your seal. Correction fluid only makes trouble.',
        { heartsMin: 3 },
      ],
      [
        '其实我小时候也搬过好几次家。每到一个新区，第一件事就是去图书馆办卡。',
        'I moved a lot as a kid too. In every new ward, the first thing I did was get a library card.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'raj',
    name: t('拉杰·梅塔', 'Raj Mehta'),
    role: t(
      '同楼的软件架构师，两个孩子的爸爸',
      'Software architect next door and father of two',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'station-front' },
        { from: 510, at: 'away' },
        { from: 1140, at: 'home-street' },
        { from: 1230, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'park-path' },
        { from: 600, at: 'cafe' },
        { from: 780, at: 'allotment-plots' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'station' },
        { from: 510, at: 'away' },
        { from: 1170, at: 'home-street' },
        { from: 1230, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'cafe' },
        { from: 960, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['salad', 'jaga-butter'],
      liked: ['tomato', 'cucumber', 'tea'],
      disliked: ['dango'],
    },
    reactions: {
      loved: t(
        '太好了，今晚孩子们终于肯吃蔬菜了。',
        'Brilliant. Tonight the kids might actually eat vegetables.',
      ),
      liked: t(
        '谢了，邻居。下次我请你喝印度奶茶。',
        'Thanks, neighbour. Next time the chai’s on me.',
      ),
      neutral: t(
        '谢谢！我放进包里，别让小的先翻到。',
        'Thanks! Into the bag before the little one finds it.',
      ),
      disliked: t(
        '甜的……我老婆说我该少吃糖了。',
        'Sweet… my wife says I should cut down.',
      ),
    },
    lines: lines('raj', [
      [
        '嗨，住同一栋楼的拉杰。快递员总把我的包裹放错门，你也收到过吧？',
        'Hi, Raj from the same building. The courier keeps leaving my parcels at the wrong door. Got any of mine?',
      ],
      [
        '我拿到永住那年，把十年的纳税证明排成一排。比代码评审还紧张。',
        'The year I got permanent residence, I laid ten years of tax certificates in a row. Worse than a code review.',
      ],
      [
        '续签别拖到最后一周。照片、在职证明、课税证明，一样一样准备。',
        'Don’t leave renewal to the last week. Photo, employment letter, tax certificate: one at a time.',
        { when: [{ visaMonthsLeftMax: 12 }] },
      ],
      [
        '周末我在河边跑步，跑到樱花树那里就停下来拍照，所以永远跑不快。',
        'I run by the river at weekends, then stop at the cherry trees for photos, so I never get faster.',
        { dayKinds: ['weekend'] },
      ],
      [
        '台风天电车停了，公司让在家工作。孩子们比我还高兴。',
        'Typhoon day, trains stopped, work from home. The kids were happier than me.',
        { season: 4 },
      ],
      [
        '我老大在学校当了生物委员，每天给金鱼喂食。他说那是他的「工作签证」。',
        'My eldest is class biology monitor, feeding the goldfish daily. He calls it his work visa.',
        { heartsMin: 3 },
      ],
      [
        '刚来那几年，我总在想哪里才算家。后来孩子在这里学会了走路。',
        'In the early years I kept wondering where home was. Then the kids learned to walk here.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'sho',
    name: t('渡边翔', 'Sho Watanabe'),
    role: t(
      '小学五年级，河边的虾虎鱼专家',
      'Year-five pupil and riverside goby expert',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'park-pond' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'park-pond' },
        { from: 780, at: 'green-centre' },
        { from: 1020, at: 'away' },
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
      loved: ['haze', 'yaki-corn'],
      liked: ['taiyaki', 'strawberry', 'dango'],
      disliked: ['tea'],
    },
    reactions: {
      loved: t(
        '哇！我要画进自然观察日记！',
        'Whoa! This goes in my nature diary!',
      ),
      liked: t(
        '谢谢！我分一半给妹妹……可能。',
        'Thanks! I’ll give half to my sister… maybe.',
      ),
      neutral: t('谢谢。这个是干嘛用的？', 'Thanks. What’s it for?'),
      disliked: t('苦的……大人的饮料。', 'Bitter… grown-up drink.'),
    },
    lines: lines('sho', [
      [
        '你也钓鱼吗？虾虎鱼要等涨潮，现在只有小的。',
        'Do you fish too? Gobies come with the tide. Only little ones right now.',
      ],
      [
        '你日语说得有点慢，不过比我们班长清楚。',
        'Your Japanese is a bit slow, but clearer than our class president’s.',
      ],
      [
        '学校发了防灾演练的通知。我们要钻到桌子底下数到六十。',
        'School sent home a disaster drill notice. We hide under our desks and count to sixty.',
      ],
      [
        '夏天的作业是自由研究。我研究河里有几种鱼，你帮我数吧？',
        'Summer homework is a free project. I’m counting fish species in the river. Help me?',
        { season: 3 },
      ],
      [
        '下雨不能钓鱼，我在图书馆看鱼的图鉴。',
        'No fishing in the rain, so I’m reading the fish encyclopedia at the library.',
        { weather: ['rain'] },
      ],
      [
        '你的国家也有虾虎鱼吗？那边的会不会长得不一样？',
        'Are there gobies in your country? Do they look different there?',
        { heartsMin: 3 },
      ],
      [
        '盆踊我跳错了好几次，可是太鼓的大叔说我很有精神。',
        'I got the Bon dance wrong loads of times, but the taiko man said I had spirit.',
        { festival: 'bon-odori' },
      ],
    ]),
  },
  {
    id: 'yuto',
    name: t('高木悠斗', 'Yuto Takagi'),
    role: t(
      '安娜的丈夫，医院护士，轮班工作',
      'Ana’s husband, a hospital nurse on shifts',
    ),
    characters: ['spouse'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 480, at: 'away' },
        { from: 1170, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'home' },
        { from: 900, at: 'park-bench' },
        { from: 1020, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 480, at: 'away' },
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
      loved: ['miso-soup', 'shioyaki'],
      liked: ['castella', 'tomato'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '夜班回来就有这个……谢谢你，安娜。',
        'Coming off nights to this… thank you, Ana.',
      ),
      liked: t('谢啦，我们一起吃吧。', 'Thanks. Let’s share it.'),
      neutral: t('谢谢，我先放冰箱。', 'Thanks. Into the fridge for now.'),
      disliked: t('这是……从河里捞上来的吧？', 'Is that… from the river?'),
    },
    lines: lines('yuto', [
      [
        '我回来了。今天病房很忙，不过有位老奶奶说我的葡萄牙语发音很好。',
        'I’m home. Busy ward today, but an old lady said my Portuguese accent is good.',
      ],
      [
        '周日我值夜班。周六我们去河边走走吧？',
        'I’m on nights Sunday. River walk on Saturday?',
      ],
      [
        '我妈又寄米来了，还附了一张纸条：「安娜，多吃点。」',
        'Mum sent rice again, with a note: “Ana, eat more.”',
      ],
      [
        '你上周自己去区役所办好了？我都还要看说明书。',
        'You sorted the ward office alone last week? I still need the instructions.',
        { when: [{ stat: 'japanese', min: 60 }] },
      ],
      [
        '巴西现在是夏天吧。我们在这边吃西瓜，也算一起过夏天。',
        'It’s summer in Brazil now, isn’t it? Watermelon here counts as sharing it.',
        { season: 1 },
      ],
      [
        '有时候我在想，如果当初是我搬去巴西，会不会也这么手忙脚乱。',
        'Sometimes I wonder if I’d be this flustered had I moved to Brazil instead.',
        { heartsMin: 4 },
      ],
    ]),
  },
];
