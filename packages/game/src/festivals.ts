import type { Festival, FestivalId, Quarter, Text } from './types';

export const festivals: Festival[] = [
  {
    id: 'lunar-new-year',
    season: 1,
    name: { zhCN: '春节聚会', en: 'Lunar New Year gathering' },
    text: {
      zhCN: '社区百家宴，保温盒摆满长桌。一起捏饺子，捏漏的先下锅尝。',
      en: 'Covered dishes fill the bring-and-share table. Fold dumplings together; taste the leaky ones first.',
    },
  },
  {
    id: 'may-day',
    season: 2,
    name: { zhCN: '五月节集市', en: 'May Day fair' },
    text: {
      zhCN: '彩带绕过摊位，风先跳起舞。牵一头绕着走，甜面包在摊上等着。',
      en: 'Ribbons weave between stalls. Take an end and join the dance; sweet buns wait on the stall.',
    },
  },
  {
    id: 'summer-fair',
    season: 3,
    name: { zhCN: '夏日集市', en: 'Summer fair' },
    text: {
      zhCN: '带当季收成来评比，标签写好品种与数量。黄瓜排着队，烤玉米冒着热气。',
      en: 'Bring this season’s harvest to the show, labelled with variety and quantity. Cucumbers queue beside steaming grilled corn.',
    },
  },
  {
    id: 'bonfire-night',
    season: 4,
    name: { zhCN: '篝火之夜', en: 'Bonfire Night' },
    text: {
      zhCN: '绿地上架起篝火，纸杯热气里混着太妃糖的甜味。',
      en: 'A bonfire rises on the green. Steam from paper cups mingles with the sweetness of toffee.',
    },
  },
  {
    id: 'christmas-market',
    season: 4,
    name: { zhCN: '圣诞集市', en: 'Christmas market' },
    text: {
      zhCN: '小灯泡亮了，提盏灯听合唱，捧热杯暖手。姜饼摊的包装纸正追着风跑。',
      en: 'The fairy lights are on. Carry a lantern to hear the choir, warming your hands on a cup. The gingerbread wrapping chases the wind.',
    },
  },
];

export const festivalDialogue: Record<
  string,
  { festival: FestivalId; text: Text }[]
> = {
  margaret: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '饺子捏得像芜菁。能煮熟就成，别评外形。',
        en: "Dumpling looks like a turnip. If it cooks, don't judge the shape.",
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节的彩带别缠我剪刀。我还指着它剪枝呢。',
        en: "Keep the May Day ribbons off my shears. I've pruning to do.",
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '黄瓜弯归弯。评比能看味道吗？我想提个意见。',
        en: "Crooked cucumber. Can the show judge flavour? I've a suggestion.",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '园艺杯拿来喝热茶，泥洗过了。别盯着看。',
        en: 'Tea in the gardening mug. I washed the soil off. Stop looking.',
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞树挑小的！我这腰可扛不动大树。',
        en: "A small Christmas tree! My back won't carry a big one.",
      },
    },
  ],
  priya: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '先确认饺子熟了吧？我等凉，嘴烫了接不了电话。',
        en: 'Dumplings cooked? Just checking. Let mine cool; burnt lips are no good on the phone.',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节我守彩带出口，排队总有人从中间钻。',
        en: "I'm by the ribbon exit for May Day. Someone always cuts across the queue.",
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '蔬菜评比也叫号？我今天听见号码就想站起来。',
        en: "Calling numbers at the vegetable show? Keep thinking they're calling me.",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '烟花一响我就扶杯，接待台洒茶洒出习惯了。',
        en: 'Firework goes off, I grab the cup. Too much spilled tea at reception.',
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞摊位挤得像候诊室，拼图摊在哪边？',
        en: 'Christmas stalls are packed like the waiting room. Which way to the jigsaws?',
      },
    },
  ],
  ade: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '饺子封口了。我续签材料夹还敞着，先吃这只。',
        en: "Dumpling sealed. My renewal folder's still open. Eating this one first.",
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节彩带缠住工牌了。下班忘摘，得先解绳。',
        en: "May Day ribbon's caught my work pass. Forgot to take it off. Untangle first.",
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '集市碰见同事，我们都带了午饭，买的点心往哪装。',
        en: "Met a colleague at the fair. Both brought lunch. Where do the cakes we've bought go?",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '同事替我顶完班，我赶上烟花了。热饮还烫着。',
        en: "Colleague covered the end of my shift. Made the fireworks. Drink's still hot.",
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞摊位灯亮了，我还在算续签费用，先收起计算器。',
        en: 'Christmas stalls lit up. Still adding up renewal costs. Putting the calculator away.',
      },
    },
  ],
  helen: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '这饺子像问号！你管它叫歪，还是有创意？',
        en: 'That dumpling looks like a question mark! Crooked or creative?',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节舞步怎么说？我学生用了「脚打结」。',
        en: 'How do you describe May Day dancing? My student said feet in knots.',
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '评语写「不错」？哪儿不错？我拿黄瓜当例句了。',
        en: "Just nice on the judging slip? Nice how? I've turned a cucumber into an example.",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '烟花盖过我嗓子！你刚说哪个词，再说一遍？',
        en: 'Fireworks drowned me out! What word was that? Say it again?',
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞歌我唱错两行。学生说：「老师也得练听力。」',
        en: 'Two wrong lines in that carol. Student says, Teacher needs listening practice too.',
      },
    },
  ],
  dave: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '饺子漏馅？不用重赛，判它进汤组。',
        en: 'Leaky dumpling? No rematch. Reclassify it as soup.',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节跳错步算即兴。本店很支持即兴。',
        en: 'Wrong May Day step? Improvisation. Fully endorsed here.',
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '黄瓜比我会站。你看，评比真该设主持组。',
        en: 'Cucumbers stand better than me. Show needs a host category.',
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '烟花太响，麦克风认输了。难得它有自知之明。',
        en: 'Fireworks beat the microphone. Rare moment of self-awareness.',
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞唱诗我只会副歌。声音大，知识少。',
        en: 'Only know carol choruses. Volume high, knowledge low.',
      },
    },
  ],
  rahman: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '老朋友，饺子馅我拌多了，来帮忙包？柜台都快摆满。',
        en: "Mixed too much dumpling filling, my friend. Help fold some? They're filling the whole counter.",
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节我想当回客人，摊上零钱都备好了，我先去逛。',
        en: "Want a turn as a customer this May Day. Stall's got its float ready. I'm going for a browse.",
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '老朋友，这黄瓜送评比！我差点顺手贴上店里的价签。',
        en: 'Enter that cucumber, my friend! Nearly put one of my shop price labels on it.',
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '篝火边这杯茶算店主自用，老朋友，别给我往外卖了。',
        en: "This bonfire tea's the proprietor's own, my friend. Don't sell it out from under me.",
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞摊生意好，老朋友，帮我看会儿，我去买块肉饼。',
        en: "Christmas stall's doing well, my friend. Watch it a moment while I buy a mince pie.",
      },
    },
  ],
  lina: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '新年饺子先吃，拒签那事今晚少占我脑子。',
        en: 'Dumplings first this New Year. The refusal gets less of my head tonight.',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节文件留家里，拜托，给我放半天假。',
        en: 'Documents stay home for May Day. Please, give me half a day off.',
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '集市先逛，咨询车费我另留了，没乱花。',
        en: "Fair first. Kept the advice bus fare separate. Haven't spent it.",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '烟花一炸我就看手机，烦，等回信等惯了。',
        en: 'Firework goes off, I check my phone. Ugh, waiting for replies does that.',
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞灯把人照得金黄，拜托，我那支黄又买早了。',
        en: 'Christmas lights turn everyone gold. Great. Bought that yellow paint too soon.',
      },
    },
  ],
  gareth: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '饺子送桌中间，筷子往右传。今天路线就这么短。',
        en: 'Dumplings to the middle. Chopsticks right. Short round today.',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '彩带缠车铃了。五月节得推车，过桥再骑。',
        en: 'May Day ribbon round the bell. Push the bike. Ride after the bridge.',
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '评比标签这么清！邮袋里的地址要都这样就好了。',
        en: 'Lovely clear show labels! Wish every address in my postbag looked like that.',
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '信送完了，邮袋卸下。往绿地走，到火堆边停。',
        en: 'Post delivered. Bag off. On to the green. Stop by the bonfire.',
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '贺卡地址先写，邮票右上。圣诞我见过贴反的。',
        en: 'Christmas card: address first, stamp top right. Seen them on backwards.',
      },
    },
  ],
  jamie: [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '新年咱们煎饺子！哎，我又拿锅铲练铲球了。',
        en: 'Frying our New Year dumplings! Ah, tackling them like a football again.',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节彩带我来！哎，咱家窗帘也是这么被我绕乱的。',
        en: "May Day ribbons, I'll do it! Ah, tangled our curtains exactly this way.",
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '索菲娅，这篮够咱家和全队喝汤！哎，先看完集市比赛。',
        en: 'Sofia, enough soup for us and the whole team! Ah, fair judging first.',
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '烟花开场，咱们端稳茶！哎，我又光顾抬头了。',
        en: "Fireworks, let's hold our tea steady! Ah, there I go staring upwards again.",
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '索菲娅，咱家圣诞卡买厚的！我下笔像踢任意球，哎，穿了。',
        en: 'Sofia, thick Christmas cards for us! Write like a free kick. Ah, right through it.',
      },
    },
  ],
  'ka-ning-partner': [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '从香港带来的新年盒先开。讲好先，我运过来，这回你拆。',
        en: 'Our New Year box from Hong Kong first. Agree first: I brought it, you unpack this time.',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节讲好先，你陪乐言，我先歇。下轮换你还是一起走？',
        en: "Let's agree for May Day: you stay with Lok Yin, I rest. Your break next or leave together?",
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '全家的菜我包你搬。讲好先，嘉宁，集市夸奖一人一半。',
        en: "I packed the family's fair vegetables, you carried. Agree, Ka Ning: half the praise each.",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '乐言这边我牵着。嘉宁，烟花开了，你端茶还是我放桌上？',
        en: "I'm holding Lok Yin's hand. Ka Ning, fireworks starting: hold my tea or shall I put it down?",
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞灯我想买回家。讲好先，乐言那串让他自己挑。',
        en: "I'd like Christmas lights for home. Agree first: Lok Yin picks his own string.",
      },
    },
  ],
  'ka-ning-child': [
    {
      festival: 'lunar-new-year',
      text: {
        zhCN: '新年饺子像船。咬破了还算船，还是只能算午饭？',
        en: 'New Year dumplings look like boats. Bite a hole in one: still a boat, or just lunch?',
      },
    },
    {
      festival: 'may-day',
      text: {
        zhCN: '五月节彩带绕成结，跳舞的人知道自己走错路了吗？',
        en: 'The May Day ribbons got tangled. Do the dancers know they took a wrong turn?',
      },
    },
    {
      festival: 'summer-fair',
      text: {
        zhCN: '夏日集市黄瓜为什么要打分？它又没申请上学。',
        en: "Why score cucumbers at the summer fair? They haven't applied to school.",
      },
    },
    {
      festival: 'bonfire-night',
      text: {
        zhCN: '刚才那朵烟花没名字。你说像什么，就能算名字吗？',
        en: "That firework didn't have a name. Can what you think it looks like count?",
      },
    },
    {
      festival: 'christmas-market',
      text: {
        zhCN: '圣诞集市的姜饼人站外面。围巾是不是得用糖做？',
        en: 'Gingerbread people stand outside at the Christmas market. Do their scarves need to be sugar?',
      },
    },
  ],
};

export const festivalFoods: Record<FestivalId, string> = {
  'lunar-new-year': 'dumplings',
  'may-day': 'may-bun',
  'summer-fair': 'summer-corn',
  'bonfire-night': 'bonfire-toffee',
  'christmas-market': 'gingerbread',
};
export const festivalActivities: Partial<
  Record<FestivalId, { id: string; label: Text; starts: number }>
> = {
  'lunar-new-year': {
    id: 'lunar-dumplings',
    label: { zhCN: '一起包饺子', en: 'Fold dumplings together' },
    starts: 600,
  },
  'may-day': {
    id: 'may-ribbons',
    label: { zhCN: '绕彩带跳支舞', en: 'Dance with the ribbons' },
    starts: 600,
  },
  'christmas-market': {
    id: 'christmas-lanterns',
    label: { zhCN: '提着小灯听合唱', en: 'Hear the choir with a lantern' },
    starts: 960,
  },
};
export const notices: { id: string; text: Text; season?: Quarter }[] = [
  {
    id: 'pub-quiz',
    text: {
      zhCN: '周末傍晚，戴夫在酒吧主持 pub quiz。铅笔已削好，队名自备。',
      en: 'Weekend evening: Dave hosts the pub quiz. Pencils ready; bring a team name.',
    },
  },
  {
    id: 'litter',
    text: {
      zhCN: '周末公园捡垃圾，玛格丽特带夹子。自带手套，结束后一起喝茶。',
      en: 'Weekend park litter pick. Margaret brings grabbers. Bring gloves; tea afterwards.',
    },
  },
  {
    id: 'cat',
    text: {
      zhCN: '走失的条纹猫叫饼干。若在小店附近看到，请告诉拉赫曼，别追它。',
      en: 'Missing tabby called Biscuit. Tell Rahman if spotted near the shop; don’t chase.',
    },
  },
  {
    id: 'choir',
    text: {
      zhCN: '合唱团在绿地练歌。海伦带歌词，跑调也能坐到前排。',
      en: 'Choir practice on the green. Helen brings lyrics; imperfect voices welcome in front.',
    },
  },
  {
    id: 'swap',
    text: {
      zhCN: '交换集市收旧书和干净花盆，不收钱。普里娅替空纸箱找新主人。',
      en: 'Swap clean pots and old books, no money changing hands. Priya is rehoming empty boxes.',
    },
  },
  {
    id: 'walk',
    text: {
      zhCN: '池塘慢走小队不计速度。加雷思收工后到长椅集合，狗也能同行。',
      en: 'An unhurried pond walk. Meet Gareth at the bench after his round; dogs welcome.',
    },
  },

  {
    id: 'repair',
    text: {
      zhCN: '咖啡馆收小件缝补，纽扣自带。不会穿针也能来坐坐。',
      en: 'Small sewing repairs at the café. Bring buttons; can’t thread a needle? Come and sit anyway.',
    },
  },
  {
    id: 'puzzles',
    text: {
      zhCN: '图书馆拼图交换，请先数数盒角有没有藏着最后一块。',
      en: 'Jigsaw swap at the library. Check the box corners for stray pieces.',
    },
  },
  {
    id: 'photos',
    text: {
      zhCN: '市政厅征集街景旧照片，背面请写地点，不必拍得端正。',
      en: 'Old street photographs wanted at the town hall. Add the location; crooked pictures welcome.',
    },
  },
  {
    id: 'mugs',
    text: {
      zhCN: '小店门边有共用杯架，认领自己的杯子，别替邻居挑。',
      en: 'Shared mug rack by the shop door. Claim your own mug, not your neighbour’s.',
    },
  },
  {
    id: 'winter-mending',
    text: {
      zhCN: '图书馆冬衣整理桌教叠厚毛衣，带一件总塞不进抽屉的来。',
      en: 'Winter-clothes folding at the library. Bring a jumper that never fits the drawer.',
    },
    season: 1,
  },
  {
    id: 'winter-soup',
    text: {
      zhCN: '酒吧交换热汤做法，先写锅里有什么，再写菜名。',
      en: 'Winter soup recipes at the pub. Ingredients first, names second.',
    },
    season: 1,
  },
  {
    id: 'winter-birds',
    text: {
      zhCN: '池塘冬季观鸟，可借鸟鸣卡，听不准的那声先空着。',
      en: 'Winter birdwatching at the pond. Borrow a birdsong card; leave unfamiliar calls blank.',
    },
    season: 1,
  },
  {
    id: 'winter-draught',
    text: {
      zhCN: '市政厅展示挡风条样品，可以摸，不用拆自家窗户来比。',
      en: 'Draught-strip samples at the town hall. No need to bring your window.',
    },
    season: 1,
  },
  {
    id: 'winter-stories',
    text: {
      zhCN: '绿地帐篷讲冬天的故事，长椅边可借坐垫。',
      en: 'Winter stories in the green’s tent. Borrow a cushion by the benches.',
    },
    season: 1,
  },
  {
    id: 'spring-seeds',
    text: {
      zhCN: '春季分种子在菜地小屋，空纸袋比大计划有用。',
      en: 'Spring seed sharing in the allotment shed. Bring empty paper bags.',
    },
    season: 2,
  },
  {
    id: 'spring-pots',
    text: {
      zhCN: '小店春季擦招牌，借长柄刷前先把门口的自行车推开。',
      en: 'Spring sign-cleaning at the shop. Move the bicycles before borrowing the long brush.',
    },
    season: 2,
  },
  {
    id: 'spring-path',
    text: {
      zhCN: '春季认路散步从车站门口出发，只在镇里绕一圈。',
      en: 'Spring orientation walk from the station entrance, staying in town.',
    },
    season: 2,
  },
  {
    id: 'spring-colours',
    text: {
      zhCN: '绿地画春芽，不必摘下来，纸和铅笔现场借。',
      en: 'Draw spring buds on the green. Leave them growing; borrow paper and pencils.',
    },
    season: 2,
  },
  {
    id: 'spring-books',
    text: {
      zhCN: '图书馆春季整理书架，夹在书里的明信片请先取回。',
      en: 'Spring shelf tidy at the library. Retrieve postcards left inside books.',
    },
    season: 2,
  },
  {
    id: 'summer-shade',
    text: {
      zhCN: '夏日绿地摆遮阳棚，帮忙的人请先认清哪边是入口。',
      en: 'Summer shade tent on the green. Helpers: find the entrance first.',
    },
    season: 3,
  },
  {
    id: 'summer-water',
    text: {
      zhCN: '菜地夏季轮流提水，空壶放左边，别只凭重量猜。',
      en: 'Summer allotment watering. Empty cans on the left; don’t guess by weight.',
    },
    season: 3,
  },
  {
    id: 'summer-drawing',
    text: {
      zhCN: '池塘夏季写生，画纸别搭在刚上漆的栏杆上。',
      en: 'Summer pond sketching. Keep paper off the freshly painted rail.',
    },
    season: 3,
  },
  {
    id: 'summer-recipes',
    text: {
      zhCN: '咖啡馆收夏季凉菜做法，抄一份也请留一份。',
      en: 'Summer salad recipes at the café. Take a copy and leave one.',
    },
    season: 3,
  },
  {
    id: 'summer-games',
    text: {
      zhCN: '酒吧花园玩桌游，风大时先把纸牌压住再谈战术。',
      en: 'Summer board games in the pub garden. Secure cards before discussing tactics.',
    },
    season: 3,
  },
  {
    id: 'autumn-leaves',
    text: {
      zhCN: '图书馆拓印秋叶，带落叶来就行，桌上备着蜡笔。',
      en: 'Autumn leaf rubbings at the library. Bring fallen leaves; crayons are on the table.',
    },
    season: 4,
  },
  {
    id: 'autumn-apples',
    text: {
      zhCN: '小店交换苹果做法，酸的那种也请写清名字。',
      en: 'Autumn apple recipes at the shop. Name the sharp varieties too.',
    },
    season: 4,
  },
  {
    id: 'autumn-wheels',
    text: {
      zhCN: '车站门口检查自行车反光片，车铃也可以顺手试试。',
      en: 'Autumn bicycle reflector checks outside the station. Try the bell too.',
    },
    season: 4,
  },
  {
    id: 'autumn-lantern',
    text: {
      zhCN: '市政厅做纸灯罩，借剪刀，剪完记得传给旁边的人。',
      en: 'Autumn paper-lantern shades at the town hall. Pass the scissors along.',
    },
    season: 4,
  },
  {
    id: 'autumn-coats',
    text: {
      zhCN: '公告栏旁秋衣交换，口袋里的旧票请先拿出来。',
      en: 'Autumn coat swap by the noticeboard. Empty old tickets from the pockets first.',
    },
    season: 4,
  },
];
