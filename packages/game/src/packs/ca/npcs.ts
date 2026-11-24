import type { Npc, Text } from '../../model';
import type { CaFestival } from './rules';

type CaNpc = Npc<CaFestival>;
type Stops = CaNpc['schedule'][number]['stops'];
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
): CaNpc['schedule'] => [
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
  pairs: [string, string, Partial<CaNpc['lines'][number]>?][],
): CaNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const caNpcs: CaNpc[] = [
  {
    id: 'doreen',
    name: t('多琳·麦克艾萨克', 'Doreen MacIsaac'),
    role: t(
      '退休老师，社区菜园和百家宴的召集人',
      'Retired teacher who runs the community garden and the potlucks',
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
        { from: 480, at: 'market' },
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
      loved: ['turnip-mash', 'oatcakes'],
      liked: ['double-double', 'potato', 'flowers'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，跟我奶奶在布雷顿角做的一个味儿。下次百家宴你坐我旁边。',
        'Oh my, that tastes like my nan’s in Cape Breton. You’re sitting by me at the next potluck.',
      ),
      liked: t(
        '谢谢你，亲爱的。我先摘了手套再拿。',
        'Thank you, dear. Let me get these gloves off first.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'That’s kind. Leave it on the bench and I’ll fetch it.',
      ),
      disliked: t(
        '这个嘛……还是留给回收日吧。',
        'Well now… let’s save that for collection day.',
      ),
    },
    lines: lines('doreen', [
      [
        '新来的？我是多琳。菜园的钥匙在我这儿，告示板上贴着分类表，看不懂就来问我。',
        'New, are you? I’m Doreen. I keep the garden key, and the sorting chart is on the board. Ask me if it puzzles you.',
      ],
      [
        '绿桶装厨余，蓝袋装瓶罐。透明袋里要是看见披萨盒，收垃圾的人会贴张贴纸。',
        'Green cart for scraps, blue bag for bottles. Put a pizza box in the clear bag and the collectors leave you a sticker.',
      ],
      [
        '冬天菜园睡觉，我们就去冰场。等雪化了，五月长周末才是种土豆的日子。',
        'The garden sleeps in winter, so we skate. Potatoes go in on the May long weekend, once the snow’s gone.',
        { season: 1 },
      ],
      [
        '春天的雾一来，番茄苗就得盖布。这里的天气啊，一天能换四季。',
        'When the spring fog rolls in, cover the tomato seedlings. Four seasons in one day here.',
        { season: 2 },
      ],
      [
        '八月的玉米最甜。我们开个玉米会，黄油抹多点。',
        'August corn is the sweetest. We’ll have a corn boil, heavy on the butter.',
        { season: 3 },
      ],
      [
        '风暴来之前把花盆收进屋。去年我那盆天竺葵飞到了码头。',
        'Bring your pots in before a storm. Last year my geranium ended up on the wharf.',
        { season: 4 },
      ],
      [
        '下雨天地里没活，我在咖啡馆把百家宴的报名表写好了。',
        'No garden work in the rain. I’ve done the potluck sign-up sheet at the café.',
        { weather: ['rain'] },
      ],
      [
        '你来了以后，周末来菜园帮忙的人多了两个。另一个是你拉来的吧？',
        'Since you came, two more turn up to help on weekends. You brought the other one, didn’t you?',
        { heartsMin: 3 },
      ],
      [
        '我年轻时去多伦多教了十年书。第一年总觉得自己是客人，后来就成了请客的人。',
        'I taught in Toronto for ten years when I was young. The first year I felt like a guest. Then one day I was the one hosting.',
        { heartsMin: 6 },
      ],
      [
        '感恩节的南瓜派我烤了六个。帮我看着点，别让利奥先偷吃。',
        'I baked six pumpkin pies for Thanksgiving. Keep an eye out so Leo doesn’t get there first.',
        { festival: 'thanksgiving' },
      ],
    ]),
  },
  {
    id: 'gerry',
    name: t('格里·布德罗', 'Gerry Boudreau'),
    role: t(
      '退休的阿卡迪亚龙虾渔民，天天在码头钓鱼',
      'Retired Acadian lobster fisherman, always on the wharf',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'pond' },
        { from: 720, at: 'cafe' },
        { from: 840, at: 'park-pond' },
        { from: 1020, at: 'pub' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'pond' },
        { from: 660, at: 'market' },
        { from: 780, at: 'park-pond' },
        { from: 1020, at: 'pub' },
        { from: 1320, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 780, at: 'pub' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 960, at: 'pub' },
        { from: 1320, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['fish-cakes', 'striped-bass'],
      liked: ['double-double', 'maple-doughnut', 'corn'],
      disliked: ['strawberry-jam'],
    },
    reactions: {
      loved: t(
        '好家伙！这条够我吹一个冬天的。',
        'Well now! That’ll keep me bragging all winter.',
      ),
      liked: t(
        '谢啦。明天早上鱼饵我分你一半。',
        'Thanks. I’ll split my bait with you tomorrow morning.',
      ),
      neutral: t('收下了，放冰桶里。', 'I’ll take it. Into the cooler.'),
      disliked: t(
        '果酱？我这双手只配鱼腥味。',
        'Jam? These hands only know fish.',
      ),
    },
    lines: lines('gerry', [
      [
        '你好啊。四十年龙虾船，退休了还是离不开码头。鱼竿可以借你一根。',
        'Bonjour. Forty years on a lobster boat and I still can’t leave the wharf. You can borrow a rod.',
      ],
      [
        '涨潮前一小时下竿，鲭鱼一群一群地来。',
        'Cast an hour before high tide and the mackerel come in schools.',
      ],
      [
        '冬天码头结冰，我就在酒馆里讲当年的风暴。',
        'When the wharf ices up in winter, I tell storm stories at the pub.',
        { season: 1 },
      ],
      [
        '五月底龙虾季结束，港口里的笼子就收上岸了。',
        'Lobster season closes at the end of May and the traps come ashore.',
        { season: 2 },
      ],
      [
        '夏天条纹鲈会追着潮水进港。钓到了记得拍照。',
        'In summer the striped bass chase the tide into the harbour. Take a photo if you land one.',
        { season: 3 },
      ],
      [
        '我们阿卡迪亚人八月十五挂星星旗，敲锅打盆满街走。下次带你去。',
        'We Acadians fly the star flag on the fifteenth of August and bang pots down the street. I’ll take you next time.',
        { season: 3, heartsMin: 2 },
      ],
      [
        '雨天鱼不咬钩，我就在店里补渔网。',
        'Fish won’t bite in the rain, so I mend nets at the store.',
        { weather: ['rain'] },
      ],
      [
        '我爷爷说，海不认识护照，只认识肯早起的人。',
        'My grandfather said the sea doesn’t know passports. It only knows who gets up early.',
        { heartsMin: 4 },
      ],
      [
        '烟花一放，船上的喇叭全都跟着响。你听！',
        'When the fireworks start, every boat in the harbour sounds its horn. Listen!',
        { festival: 'canada-day' },
      ],
    ]),
  },
  {
    id: 'mike',
    name: t('迈克·杜塞特', 'Mike Doucette'),
    role: t(
      '咸海鸥酒馆老板，周末办厨房派对',
      'Owner of the Salty Gull, host of the weekend kitchen parties',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'park-pond' },
        { from: 900, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'market' },
        { from: 780, at: 'pub-garden' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 780, at: 'shop' },
        { from: 900, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1410, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['chowder', 'mackerel'],
      liked: ['corn-boil', 'poutine', 'blueberries'],
      disliked: ['garden-salad'],
    },
    reactions: {
      loved: t(
        '这个浓汤！今晚的黑板菜单写你的名字。',
        'Now that’s a chowder! Your name goes on tonight’s chalkboard.',
      ),
      liked: t(
        '谢了。下回 donair 的酱给你多挤一圈。',
        'Thanks. Extra sweet sauce on your next donair.',
      ),
      neutral: t('收到，先放吧台后面。', 'Got it. Behind the bar for now.'),
      disliked: t(
        '沙拉？我们这儿的绿色只有啤酒瓶。',
        'Salad? The only green in here is the beer bottles.',
      ),
    },
    lines: lines('mike', [
      [
        '欢迎来到咸海鸥。donair 是哈利法克斯的官方美食，信不信由你。',
        'Welcome to the Salty Gull. Donair is Halifax’s official food, believe it or not.',
      ],
      [
        '甜酱要放在旁边，不然整个人都会被糊住。',
        'Sauce on the side, or you’ll wear it home.',
      ],
      [
        '周末晚上有厨房派对。不会跳舞？跺脚就行。',
        'Kitchen party on weekend nights. Can’t dance? Stomp.',
      ],
      [
        '冬天门口的雪我天天铲，铲完再给自己倒一杯。',
        'I shovel the front step every winter morning, then pour myself one.',
        { season: 1 },
      ],
      [
        '春天第一批龙虾上岸，我做的龙虾卷要排队。',
        'When the first lobster comes ashore in spring, my rolls have a queue.',
        { season: 2 },
      ],
      [
        '雨天人都往酒馆跑，今天的炸鱼薯条快卖完了。',
        'Rain sends everyone to the pub. Fish and chips are nearly gone.',
        { weather: ['rain'] },
      ],
      [
        '我老爸从布雷顿角来，会拉小提琴，我只学会了倒啤酒。',
        'My dad came from Cape Breton and played fiddle. I only learned to pour.',
        { heartsMin: 3 },
      ],
      [
        '感恩节我把整只火鸡搬到广场上。你带什么菜？',
        'I’m hauling a whole turkey to the green for Thanksgiving. What are you bringing?',
        { festival: 'thanksgiving' },
      ],
    ]),
  },
  {
    id: 'bonnie',
    name: t('邦妮·夏松', 'Bonnie Chiasson'),
    role: t(
      '晨潮咖啡的老板，周末在市集摆果酱摊',
      'Owner of Morning Tide Café, sells jam at the market on weekends',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 1080, at: 'park-path' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'market' },
        { from: 780, at: 'cafe' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 420, at: 'cafe' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 480, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['strawberry-jam', 'maple-syrup'],
      liked: ['flowers', 'strawberry', 'blueberries'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '这罐我要摆在柜台上，告诉大家是你做的。',
        'This jar goes on the counter, and I’m telling everyone you made it.',
      ),
      liked: t(
        '好香！明天的松饼就用它。',
        'Smells lovely! Tomorrow’s muffins will use it.',
      ),
      neutral: t('谢谢，亲爱的。', 'Thanks, hon.'),
      disliked: t(
        '龙虾笼……放在门外吧，别吓着客人。',
        'A lobster trap… leave it outside, it’ll scare the customers.',
      ),
    },
    lines: lines('bonnie', [
      [
        '早！双糖双奶？在这儿，咖啡比天气预报准。',
        'Morning! Double-double? Around here the coffee’s more reliable than the forecast.',
      ],
      [
        '我妈是阿卡迪亚人，我爸是苏格兰人，所以我做的燕麦饼里放了一点枫糖。',
        'Mum’s Acadian and Dad’s Scottish, so my oatcakes get a little maple.',
      ],
      [
        '下雪天我六点就开门，铲雪车司机都来买咖啡。',
        'On snow days I open at six. The plough drivers all stop for coffee.',
        { season: 1 },
      ],
      [
        '七月的草莓最好。市集上第一篮总是被多琳抢走。',
        'July strawberries are the best. Doreen always gets the first basket at the market.',
        { season: 3 },
      ],
      [
        '秋天的蓝莓从安纳波利斯谷运来，我做成了松饼。',
        'Autumn blueberries come in from the Annapolis Valley. I bake them into muffins.',
        { season: 4 },
      ],
      [
        '外面雨大？坐窗边吧，看雾从港口那边爬上来。',
        'Pouring out there? Take the window seat and watch the fog climb up from the harbour.',
        { weather: ['rain'] },
      ],
      [
        '你每天来都点一样的，我已经在杯子上写好你的名字了。',
        'You order the same thing every day, so your name’s already on the cup.',
        { heartsMin: 4 },
      ],
    ]),
  },
  {
    id: 'fatima',
    name: t('法蒂玛·海达里', 'Fatima Haidari'),
    role: t(
      '安家服务中心的顾问，十几年前从喀布尔来',
      'Counsellor at the newcomer centre, who came from Kabul years ago',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 510, at: 'newcomer' },
        { from: 720, at: 'cafe' },
        { from: 780, at: 'newcomer' },
        { from: 1020, at: 'library-steps' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'allotment-plots' },
        { from: 780, at: 'market' },
        { from: 900, at: 'park-path' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 510, at: 'newcomer' },
        { from: 1020, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 840, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['garden-salad', 'flowers'],
      liked: ['double-double', 'tomato', 'oatcakes'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '你记得我喜欢这个？我要拍给我女儿看。',
        'You remembered I love this? I’m sending a photo to my daughter.',
      ),
      liked: t(
        '谢谢。办公室里又多了一点颜色。',
        'Thank you. A little more colour for the office.',
      ),
      neutral: t('谢谢你想着我。', 'Thank you for thinking of me.'),
      disliked: t(
        '这个……我们还是送去回收站吧。',
        'Hmm… let’s take this to the recycling depot.',
      ),
    },
    lines: lines('fatima', [
      [
        '欢迎！我是法蒂玛。报税、找家庭医生、过冬穿什么，都可以来问。',
        'Welcome! I’m Fatima. Taxes, finding a family doctor, what to wear in winter — ask me anything.',
      ],
      [
        '刚来那年我把羽绒服穿反了，在公交站被一位老太太笑着扣好了扣子。',
        'My first winter I wore my parka inside out. An old lady at the bus stop laughed and did up my buttons.',
      ],
      [
        '中午的英语角不考试，只聊天。带上你的问题。',
        'The lunchtime conversation circle has no tests, only talk. Bring your questions.',
      ],
      [
        '风寒指数比温度更重要。今天出门戴好帽子。',
        'Watch the wind chill, not the temperature. Wear a hat today.',
        { season: 1 },
      ],
      [
        '春天是报税季。图书馆有义工帮忙报税，别错过。',
        'Spring is tax season. Volunteers at the library help you file; don’t miss them.',
        { season: 2 },
      ],
      [
        '下雨天中心人最多，大家都进来喝茶。',
        'Rainy days fill the centre. Everyone comes in for tea.',
        { weather: ['rain'] },
      ],
      [
        '我入籍那天，带着全家去吃了龙虾。我女儿说那是她吃过最贵的晚餐。',
        'On my citizenship day I took the whole family for lobster. My daughter said it was the most expensive dinner of her life.',
        { heartsMin: 4 },
      ],
      [
        '有时候我会想喀布尔的杏树。可这里的海，我也爱上了。',
        'Sometimes I miss the apricot trees in Kabul. But I have fallen for this sea too.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'kwame',
    name: t('夸梅·门萨', 'Kwame Mensah'),
    role: t(
      '造船厂焊工，周末在广场教孩子踢球',
      'Shipyard welder who coaches kids’ soccer on the green at weekends',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1140, at: 'park-path' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'green-centre' },
        { from: 720, at: 'market' },
        { from: 840, at: 'park-pond' },
        { from: 1020, at: 'pub' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1050, at: 'pub' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'cafe' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['corn-boil', 'poutine'],
      liked: ['double-double', 'maple-doughnut', 'pollock'],
      disliked: ['turnip-mash'],
    },
    reactions: {
      loved: t(
        '哈！这个比造船厂食堂好吃一百倍。',
        'Ha! A hundred times better than the shipyard canteen.',
      ),
      liked: t('谢了，朋友。', 'Thanks, my friend.'),
      neutral: t('谢谢，我收下了。', 'Thanks, I’ll take it.'),
      disliked: t(
        '芜菁泥？我小时候就怕这个。',
        'Turnip mash? I’ve feared this since I was a boy.',
      ),
    },
    lines: lines('kwame', [
      [
        '你好！我是夸梅，在造船厂焊船。周末在广场教小孩踢球，来当守门员吗？',
        'Hey! I’m Kwame. I weld ships at the yard and coach the kids on the green at weekends. Fancy going in goal?',
      ],
      [
        '我从阿克拉来，读书、工作、拿 PR，二〇一九年入的籍。路很长，可每一步都算数。',
        'I came from Accra — study, work, PR, then citizenship in 2019. Long road, but every step counts.',
      ],
      [
        '入籍考试别光背日期，要懂为什么。我女儿考我比 IRCC 还难。',
        'For the citizenship test, don’t just memorise dates; understand why. My daughter quizzes me harder than IRCC.',
      ],
      [
        '冬天的焊枪是最好的暖手宝。',
        'In winter a welding torch is the best hand-warmer.',
        { season: 1 },
      ],
      [
        '夏天收工后我在码头看日落，船都镀了一层金。',
        'Summer evenings I watch the sunset from the wharf. The ships turn gold.',
        { season: 3 },
      ],
      [
        '下雨就踢不成球了，我去图书馆给孩子们借漫画。',
        'No soccer in the rain, so I borrow comics for the kids at the library.',
        { weather: ['rain'] },
      ],
      [
        '刚来的时候，有个老渔民教我系缆绳。现在轮到我教别人了。',
        'When I first came, an old fisherman taught me to tie a cleat hitch. Now it’s my turn to teach.',
        { heartsMin: 3 },
      ],
      [
        '加拿大日那天我把加纳国旗和枫叶旗一起挂在阳台上。两个都是家。',
        'On Canada Day I hang the Ghana flag beside the maple leaf. Both are home.',
        { festival: 'canada-day' },
      ],
    ]),
  },
  {
    id: 'leo',
    name: t('利奥·特朗布莱', 'Leo Tremblay'),
    role: t(
      '小学生，鲭鱼专家，冰球队的右边锋',
      'Schoolboy, mackerel expert and right winger on the hockey team',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 900, at: 'pond' },
        { from: 1050, at: 'green-centre' },
        { from: 1140, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 540, at: 'pond' },
        { from: 720, at: 'green-centre' },
        { from: 900, at: 'shop' },
        { from: 960, at: 'pond' },
        { from: 1110, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 930, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 780, at: 'shop' },
        { from: 900, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['maple-taffy', 'nanaimo-bar'],
      liked: ['maple-doughnut', 'strawberry', 'mackerel'],
      disliked: ['turnip-mash'],
    },
    reactions: {
      loved: t(
        '哇！你是全枫港最好的大人！',
        'Whoa! You’re the best grown-up in Maple Harbour!',
      ),
      liked: t(
        '谢谢！我分一半给我妹妹。',
        'Thanks! I’ll give half to my sister.',
      ),
      neutral: t('谢谢……这个能吃吗？', 'Thanks… can you eat it?'),
      disliked: t(
        '呃，芜菁。我妈也逼我吃。',
        'Ugh, turnip. Mom makes me eat it too.',
      ),
    },
    lines: lines('leo', [
      [
        '你也钓鱼吗？鲭鱼喜欢亮晶晶的钩子，我有三个！',
        'Do you fish too? Mackerel love shiny hooks. I’ve got three!',
      ],
      [
        '昨天我钓到一条这——么长的比目鱼。两只眼睛长在同一边哦。',
        'Yesterday I caught a flounder thiiis long. Both its eyes are on one side!',
      ],
      [
        '冰场开了！我教你倒滑，摔倒了不许哭。',
        'The rink’s open! I’ll teach you to skate backwards. No crying if you fall.',
        { season: 1 },
      ],
      [
        '下雨不能钓鱼，我在图书馆看鱼类图鉴。',
        'No fishing in the rain, so I’m reading the fish book at the library.',
        { weather: ['rain'] },
      ],
      [
        '你的国家也有鲭鱼吗？那边的会不会会说别的语言？',
        'Are there mackerel in your country? Do they speak a different language?',
        { heartsMin: 3 },
      ],
      [
        '烟花的时候我要坐在我爸肩膀上！',
        'I’m sitting on my dad’s shoulders for the fireworks!',
        { festival: 'canada-day' },
      ],
      [
        '枫糖太妃要趁热卷，等凉了就硬了。快！',
        'Roll the taffy while it’s warm, or it goes hard. Quick!',
        { festival: 'heritage-day' },
      ],
    ]),
  },
  {
    id: 'chloe',
    name: t('克洛伊·加尼翁', 'Chloé Gagnon'),
    role: t(
      '阿迪蒂的室友，从魁北克来读海洋生物学',
      'Aditi’s roommate, a marine biology student from Québec',
    ),
    characters: ['graduate'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 480, at: 'away' },
        { from: 1020, at: 'cafe' },
        { from: 1140, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'market' },
        { from: 720, at: 'home' },
        { from: 840, at: 'park-bench' },
        { from: 1020, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 480, at: 'away' },
        { from: 1080, at: 'home' },
      ],
      [{ from: 0, at: 'home' }],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1320, at: 'home' },
      ],
    ),
    gifts: {
      loved: ['poutine', 'maple-taffy'],
      liked: ['double-double', 'blueberries', 'flounder'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        'Oh là là！这个快赶上我外婆做的了。',
        'Oh là là! This is almost as good as my grandmother’s.',
      ),
      liked: t('Merci！我们一起吃吧。', 'Merci! Let’s share it.'),
      neutral: t('谢啦，我先放冰箱。', 'Thanks, into the fridge for now.'),
      disliked: t('这是……从港口捞上来的吧？', 'Is that… from the harbour?'),
    },
    lines: lines('chloe', [
      [
        'Salut ! 今天实验室的海星终于吃东西了。我得庆祝一下。',
        'Salut! The starfish in the lab finally ate today. Time to celebrate.',
      ],
      [
        '教你一句：「Bonne journée」，就是祝你今天愉快。',
        'Here’s one: “Bonne journée” — have a good day.',
      ],
      [
        '我在蒙特利尔长大，那边冬天更冷。这里的雪是湿的，适合打雪仗。',
        'I grew up in Montréal; it’s colder there. The snow here is wet — perfect for snowball fights.',
        { season: 1 },
      ],
      [
        '周六去市集吧？我想买那家的燕麦饼。',
        'Market on Saturday? I want those oatcakes.',
      ],
      [
        '你下班的时候，我帮你把英语考试的题再过一遍？',
        'When you’re back from work, shall I run through the English test questions with you?',
        { when: [{ stat: 'english', max: 59 }] },
      ],
      [
        '有时候我也觉得自己是外地人。在加拿大，大家都是从哪儿来的。',
        'Sometimes I feel like an outsider too. In Canada, everyone’s from somewhere.',
        { heartsMin: 4 },
      ],
    ]),
  },
];
