import { everydayDialogue, townDialogue } from './town-dialogue';
import { balance as b } from './balance';
import { festivalDialogue } from './festivals';
import { familyNpcs, familyHeartEvents } from './family';
import type { GameEvent, Npc, Text } from './types';

const text = (zhCN: string, en: string): Text => ({ zhCN, en });
const lines = (npc: string, pairs: [string, string][]): Npc['lines'] =>
  pairs.map(([zhCN, en], i) => ({
    id: `${npc}-${i + 1}`,
    text: text(zhCN, en),
  }));
const giftReplies: Record<string, [Text, Text]> = {
  margaret: [
    text(
      '我领了！等等，泥手套还没摘，差点又糟蹋东西。',
      'I’ll take it! Wait, muddy gloves still on. Nearly made a mess again.',
    ),
    text(
      '放干地儿！我那袋土漏着呢，离远点。',
      'Dry spot! That compost bag’s leaking. Keep it clear.',
    ),
  ],
  ade: [
    text(
      '礼物收到。状态更新：高兴。请记录原话。',
      'Gift received. Status update: pleased. Please record that verbatim.',
    ),
    text(
      '收到，谢谢。物品已入库，心情待上报。',
      'Received, thanks. Item logged. Mood report pending.',
    ),
  ],
  helen: [
    text(
      '你怎么想到送这个？我想听选它的那段故事。',
      'What made you choose this? I’d love the story behind it.',
    ),
    text(
      '谢谢！用哪个词说这心意好？我又开始找词了。',
      'Thank you! What’s the word for this kindness? There I go hunting words again.',
    ),
  ],
  priya: [
    text(
      '先确认，真给我的？谢谢，我放拼图桌旁。',
      'Quick check: for me? Thanks. Goes beside the jigsaw table.',
    ),
    text(
      '收到，谢谢。接待台先放，我腾只手。',
      'Received, thank you. Reception desk for a moment while I free a hand.',
    ),
  ],
  dave: [
    text(
      '会挑！这礼物归老板，抢答铃现在才响，晚啦！',
      'Good choice! Gift goes to the landlord. Buzzer just rang. Too late!',
    ),
    text(
      '谢谢，意外加赛的礼物环节，我很支持。',
      'Thanks. Surprise gift round. Strongly in favour.',
    ),
  ],
  rahman: [
    text(
      '谢谢惦记，老朋友，这份归我，价签我收起来。',
      'Kind of you, my friend. This one is mine. Putting the price labels away.',
    ),
    text(
      '老朋友，礼物我收下，这回倒是我欠你回礼了。',
      'My friend, gladly accepted. Now I owe you a gift in return.',
    ),
  ],
  lina: [
    text(
      '这个好！拜托，先替我拿着，画稿袋快塞炸了。',
      'Lovely! Please hold it a second. Sketch bag is ready to burst.',
    ),
    text(
      '收到了！喂，等我把这堆画稿压平，给它腾位置。',
      'Got it! Hey, let me flatten these sketches and make some space.',
    ),
  ],
  gareth: [
    text(
      '谢谢，先装邮袋侧边。到家第一个拿出来。',
      'Thanks. Side of the postbag first. First thing out at home.',
    ),
    text(
      '收好了。左转那条路回家，我正好带过去。',
      'Safely away. Left turn for home. I can take it that way.',
    ),
  ],
};
const reactions = (
  id: string,
  loved: Text,
  disliked: Text,
): Npc['reactions'] => ({
  loved,
  liked: giftReplies[id][0],
  neutral: giftReplies[id][1],
  disliked,
});
const schedule = (
  work: Npc['schedule'][number]['stops'],
  weekend: Npc['schedule'][number]['stops'],
  rain: Npc['schedule'][number]['stops'],
): Npc['schedule'] => [
  {
    festival: true,
    stops: [
      { from: 0, at: 'home-street' },
      { from: 540, at: 'green-stall' },
      { from: 1080, at: 'green' },
      { from: 1320, at: 'home-street' },
    ],
  },
  { weather: ['rain', 'snow'], dayKinds: ['workday'], stops: rain },
  {
    weather: ['rain', 'snow'],
    dayKinds: ['weekend', 'special'],
    stops: [
      { from: 0, at: 'home-street' },
      { from: 600, at: 'cafe' },
      { from: 840, at: 'library' },
      { from: 1080, at: 'home-street' },
    ],
  },
  { dayKinds: ['workday'], stops: work },
  { dayKinds: ['weekend', 'special'], stops: weekend },
];
const margaretLines = lines('margaret', [
  [
    '早。桶推回来了。风这么大，倒不肯替我扫地。',
    "Morning. Bins are in. All that wind, and it won't sweep for me.",
  ],
  [
    '旧外套留着，我想把这圈袖口补厚点，剪刀递来。',
    "Keep the old coat. I'd thicken this cuff. Scissors here.",
  ],
  [
    '又塞来一本花卉目录。看图免费，往后可不免费。',
    "Another plant catalogue. Looking is free. The rest isn't.",
  ],
  [
    '茶刚好。先喝，种子袋上的说明看着就口渴。',
    "Tea's ready. Have some. Those seed instructions make me thirsty.",
  ],
  [
    '绕过那块砖。踩下去，袜子就得重洗。',
    "Go round that slab. Step on it and you'll be washing your socks.",
  ],
  [
    '知更鸟又跟着铲子了，站远点，让它把这条虫叼走。',
    'Robin following the spade again. Stand back, let it take that worm.',
  ],
  [
    '钥匙在围裙里。找它比翻完这块地还费劲。',
    "Key's in my apron. Finding it takes longer than digging the plot.",
  ],
  [
    '篱笆又歪了。修不修？我先看看会不会倒。',
    "Fence is leaning again. Fix it? Let's see if it falls first.",
  ],
  [
    '歪萝卜也切进锅里，尝一块，今天我想炖软些。',
    'Crooked carrots in the pot too. Taste one. Softer stew today.',
  ],
  [
    '土豆才出芽，晚霜还没走。春天真会拖事。',
    "Potatoes are up; frost hasn't gone. Spring does drag things out.",
  ],
  [
    '郁金香冒头了。我种的哪种？花开了才知道。',
    "Tulips are up. Which ones did I plant? We'll see when they flower.",
  ],
  [
    '草莓网这里松了，帮我提住，我把底下那圈压好。',
    "Strawberry net loose here. Hold it up; I'll secure the bottom.",
  ],
  [
    '红了也等一等！我这番茄还酸得倒牙。',
    "Red doesn't mean ready! My tomatoes still make your teeth curl.",
  ],
  [
    '向日葵挡住小屋门了。高是高，种错地方了。',
    'Sunflowers are blocking the shed. Tall, yes. Wrong place, though.',
  ],
  [
    '叶子扫了又落。拿去堆肥，总算没白折腾。',
    "Sweep the leaves; down come more. At least there's compost.",
  ],
  [
    '芜菁炖到软，秋天的晚饭就算有着落了。',
    "Cook the turnips soft. That's autumn dinner sorted.",
  ],
  [
    '这霜！草地硬得铲不动。冬天总算劝我歇了。',
    "Look at that frost. Can't get a spade in. Winter's made me rest.",
  ],
  [
    '冬天小屋里潮。手套摊开，团着更晾不干。',
    "Shed's damp in winter. Spread your gloves out; don't bundle them.",
  ],
  [
    '雨细也算雨。看我袖子，全湿了。',
    'Fine rain is still rain. Look at my sleeves. Soaked.',
  ],
  [
    '又下雨。省了浇水，可没省下我的牢骚。',
    "Rain again. Saved the watering. Didn't save you my complaining.",
  ],
  [
    '太阳出来了。坐干地方，别往土里一屁股下去。',
    "Sun's out. Find a dry seat, not a patch of soil.",
  ],
  [
    '这么厚的云，怕是还要变天。茶先泡上。',
    "Cloud's thick. More weather coming, I'd say. Put the tea on.",
  ],
  [
    '雪把路遮住了，先扶这边篱笆，我去取扫帚。',
    "Snow over the path. Hold this fence; I'll get the broom.",
  ],
  [
    '你认出这件破雨衣了。倒比认花苗快。',
    'You know this old raincoat now. Quicker than spotting seedlings.',
  ],
  [
    '椅子罩着呢。掀开坐，别跟我一起淋雨。',
    "Chair's covered. Lift it and sit. No need for both of us to get wet.",
  ],
  ['茶杯自己拿，泥手套给我摘了！', 'Help yourself to a cup. Muddy gloves off!'],
  [
    '小屋门往上抬再锁。这破毛病，我也没修成。',
    'Lift the shed door to lock it. Never did manage to fix that.',
  ],
  [
    '瞧窗边那盆，叶尖又黄了。我得换袋土。',
    'Look at the yellow tips on that plant. I need different compost.',
  ],
  [
    '找我就敲门，重一点！小屋里刮风听不清。',
    "Knock hard if you want me! Can't hear over the wind in the shed.",
  ],
  [
    '尝尝我这酱，酸就直说！我已经加过糖了。',
    "Taste my jam. Say if it's sour! I've already added sugar.",
  ],
  [
    '又理续签文件？桌上的种子我挪开，你来摊。',
    "Renewal papers again? I'll move the seeds. Spread them out here.",
  ],
  [
    '等续签信真磨人。得了，先骂几句，我听着！',
    "That renewal wait drags. Go on, have a good grumble. I'm listening!",
  ],
  [
    '升职了？好！带块蛋糕来，我可只种得出菜。',
    'Promoted? Good! Bring cake. I can only grow vegetables.',
  ],
  [
    '英语过了？来念我种子袋，我就认得那张图。',
    'Passed English? Read my seed packet. I only recognise the picture.',
  ],
  [
    '周末面包车一停，大家都忘了要减买东西。',
    "Weekend bread van stops, and everyone forgets they're cutting back.",
  ],
  [
    '工作日菜地清静，正好拔草。瞧这根，气死我。',
    'Quiet on the plot on weekdays. Time to weed. Look at this brute!',
  ],
  [
    '烟花一响，茶洒了一点。得，还替草地浇了。',
    'Firework made me spill my tea. There. Watered the grass too.',
  ],
  [
    '太妃糖少咬一口。这假牙可比糖贵多了。',
    'Small bite of toffee. These teeth cost a lot more than sweets.',
  ],
  [
    '火光照着泥靴。看着干净，明天还得刷。',
    'Muddy boots look clean in firelight. Still need scrubbing tomorrow.',
  ],
  [
    '看烟花我站后边。不是怕，前边烟味太大。',
    "I'll watch from the back. Not scared. Too much smoke at the front.",
  ],
]);
for (const i of [9, 10, 11]) margaretLines[i].season = 2;
for (const i of [12, 13]) margaretLines[i].season = 3;
for (const i of [14, 15]) margaretLines[i].season = 4;
for (const i of [16, 17]) margaretLines[i].season = 1;
for (const i of [18, 19]) margaretLines[i].weather = ['rain'];
margaretLines[20].weather = ['sunny'];
margaretLines[21].weather = ['cloudy'];
margaretLines[22].weather = ['snow'];
for (let i = 23; i < 30; i++)
  margaretLines[i].heartsMin = i < 25 ? 2 : i < 28 ? 4 : 6;
for (const i of [30, 31])
  margaretLines[i].when = [{ visaMonthsLeftMax: b.renewalWindowMonths }];
margaretLines[32].when = [{ flag: 'quarter-promoted' }];
margaretLines[32].once = true;
margaretLines[33].when = [{ flag: 'quarter-exam-passed' }];
margaretLines[33].once = true;
margaretLines[34].dayKinds = ['weekend'];
margaretLines[35].dayKinds = ['workday'];
for (let i = 36; i < 40; i++) margaretLines[i].festival = 'bonfire-night';

const adeLines = lines('ade', [
  [
    '早，公司的电脑开了（密码忘了），我去取备用本。',
    "Morning. Work computer's on (forgot the password). I'll fetch my spare book.",
  ],
  [
    '同事说会很短（上回也这么说），我先带上饭盒。',
    'Colleague says a short meeting (said that last time too). Taking my lunchbox.',
  ],
  [
    '同事热完午饭了（该我了），我先把盒盖拿开。',
    "Colleague's finished heating lunch (my turn now). Lid off first.",
  ],
  [
    '我解耳机线，你拿工牌（别拽，我耳朵还在里面）。',
    "I'll free the headphones. Hold the pass (gently, my ear is in there).",
  ],
  [
    '公司的牛奶我去补（上回忘了），收据留着报销。',
    "I'll replace the office milk (forgot last time). Keep the receipt for expenses.",
  ],
  [
    '上班的车赶上了（跑过来的），让我喘完这口。',
    'Caught the bus to work (ran for it). Let me catch my breath.',
  ],
  [
    '报销得找经手人（名字我忘了），我从第一封查起。',
    "Need whoever handled the expenses (forgot the name). I'll trace the first email.",
  ],
  [
    '公司的暖气修了（只修这边），我把椅子挪过来。',
    "Office heating's fixed (only this side). Moving my chair over.",
  ],
  [
    '同事又带香蕉分（我也带了），午饭先吃哪根呢。',
    'Colleague brought bananas to share (so did I). Which one for lunch?',
  ],
  [
    '午休坐窗边（同事留的位），我把饭盒拿来。',
    "Window seat at lunch (colleague saved it). I'll get my lunchbox.",
  ],
  [
    '春天的上班路花粉多（又忘吃药），鼻子先报到了。',
    'Pollen on the spring commute (forgot my tablets again). Nose clocked in first.',
  ],
  [
    '春天想早到公司（试早一班车），先坚持一星期。',
    'Want to reach work earlier this spring (try an earlier bus). Give it a week.',
  ],
  [
    '同事的夏季休假表贴好了（贴歪了），我再移一点。',
    "Colleagues' summer leave chart is up (crooked). I'll shift it a little.",
  ],
  [
    '夏天试走路上班（先走半程），剩下还得坐车。',
    'Trying to walk to work this summer (halfway first). Still need the bus for the rest.',
  ],
  [
    '秋叶又跟我进公司了（鞋底带的），扫帚借一下。',
    'Autumn leaves followed me into work (on my soles). Borrowing the broom.',
  ],
  [
    '下班要带反光衣（天黑得早了），我再检查下包。',
    "Need my reflective jacket after work (dark early now). I'll check my bag.",
  ],
  [
    '冬季通勤的手套放这儿（给自己说的），明早看。',
    'Winter commuting gloves go here (telling myself). Look here tomorrow.',
  ],
  [
    '冬天上班走灯下（有冰那段绕开），我得早出门。',
    'Lit path to work in winter (round the icy bit). Need to leave earlier.',
  ],
  [
    '通勤淋透了（只剩半边干），我先擦工牌和领口。',
    'Soaked on the commute (half still dry). Work pass and collar first.',
  ],
  [
    '裤脚湿到公司了（椅背已擦），先晾着再坐。',
    'Wet cuffs made it all the way to work (chair wiped). Dry them before sitting.',
  ],
  [
    '休息日想走走（续签清单先合上），去河边晒晒。',
    'Walk on my day off (renewal checklist shut first). Some sun by the river.',
  ],
  [
    '上班带了厚外套（云厚也闷），我先松开工牌绳。',
    'Thick coat for work (cloudy but stuffy). Loosening my work lanyard first.',
  ],
  [
    '雪天通勤改走大路（看过路面了），我提早出门。',
    'Main road for the snowy commute (checked the surface). Leaving early.',
  ],
  [
    '午休排队我去（同事先占位了），饭盒得拿回来。',
    "I'll queue at lunch (colleague saved a seat). Need my lunchbox back.",
  ],
  [
    '扫描仪的线在抽屉里（哪格还得找），续签材料先放旁边。',
    'Scanner cable is in a drawer (which one, still checking). Renewal papers to one side for now.',
  ],
  [
    '同事取消了会（我差点没看见），这会儿能歇了。',
    'Colleague cancelled the meeting (nearly missed that). Can take a break now.',
  ],
  [
    '我想跟经理重谈工作量（先练一遍），你听听？',
    'I want to renegotiate the workload (one rehearsal first). Listen?',
  ],
  [
    '午休先吃三明治（报表放远点），今天想准点下班。',
    'Sandwich at lunch first (work reports away). Want to finish on time today.',
  ],
  [
    '到点走时叫我（加班那句撤回），包我已经装好了。',
    "Call me at finishing time (withdraw the overtime bit). Bag's packed.",
  ],
  [
    '同事那份工作我漏算了（得重排），邮件现在发。',
    "Left my colleague's work out of the estimate (needs replanning). Emailing now.",
  ],
  [
    '你又准备续签了？我清单也摊着（照片那页还空）。',
    "Renewal prep again? My checklist's open too (photo page still blank).",
  ],
  [
    '续签的收件箱想关一会儿（会再开），先吃午饭。',
    'Want the renewal inbox shut a while (will reopen it). Lunch first.',
  ],
  [
    '升职了，祝贺。我还得问雇主拿材料（先写邮件）。',
    'Congratulations on the promotion. Still need papers from my employer (email first).',
  ],
  [
    '英语过了？我下班请你吃咖喱（先查自己班表）。',
    'Passed English? Curry on me after work (check my rota first).',
  ],
  [
    '周末工作群我关了（周一再开），先把窗打开。',
    'Muted work chat for the weekend (back Monday). Open the window first.',
  ],
  [
    '工作日剩下半天（先做一项），做完我去倒水。',
    'Half a workday left (one task first). Water after that.',
  ],
  [
    '下班赶来看烟花（工牌还挂着），我先把它收好。',
    'Came straight from work for the fireworks (pass still on). Putting it away.',
  ],
  [
    '太妃糖留给同事（我先吃了半块），袋口再折好。',
    'Toffee for my colleague (ate half a piece first). Fold the bag shut again.',
  ],
  [
    '往火边转一点（通勤时冻的），后背总算暖了。',
    "Turning towards the fire (cold from the commute). Back's warming up at last.",
  ],
  [
    '同事在烟那边（我认错外套了），先喝口热的。',
    'Colleague over in the smoke (wrong coat, my mistake). Hot drink first.',
  ],
]);
for (const [season, indices] of [
  [2, [10, 11]],
  [3, [12, 13]],
  [4, [14, 15]],
  [1, [16, 17]],
] as const)
  for (const i of indices) adeLines[i].season = season;
for (const i of [18, 19]) adeLines[i].weather = ['rain'];
adeLines[20].weather = ['sunny'];
adeLines[21].weather = ['cloudy'];
adeLines[22].weather = ['snow'];
for (let i = 23; i < 30; i++)
  adeLines[i].heartsMin = i < 25 ? 2 : i < 28 ? 4 : 6;
for (const i of [30, 31])
  adeLines[i].when = [{ visaMonthsLeftMax: b.renewalWindowMonths }];
adeLines[32].when = [{ flag: 'quarter-promoted' }];
adeLines[32].once = true;
adeLines[33].when = [{ flag: 'quarter-exam-passed' }];
adeLines[33].once = true;
adeLines[34].dayKinds = ['weekend'];
adeLines[35].dayKinds = ['workday'];
for (let i = 36; i < 40; i++) adeLines[i].festival = 'bonfire-night';

const helenLines = lines('helen', [
  [
    '早！开场白选哪句？学生刚教我一句新问候。',
    'Morning! Which opening line? A student just taught me a new greeting.',
  ],
  [
    '白板笔干了。谁有一句话，能替我描述这灾难？',
    "Marker's dry. Anyone have a sentence for this disaster?",
  ],
  [
    '我两副眼镜都丢了。「两副」该算优势吗？',
    'Lost both pairs of glasses. Should two pairs count as an advantage?',
  ],
  [
    '录音里的巴士准时。写教材的人坐过车吗？',
    'Bus in the recording is punctual. Has its writer used one?',
  ],
  [
    '钟慢了，肚子说下课。你赞成哪个版本？',
    "Clock's slow; stomach says class is over. Which version gets your vote?",
  ],
  [
    '杯印像重点圈。你看，老师也会误导人。',
    'Cup ring looks like emphasis. Teachers mislead people too.',
  ],
  [
    '大字书借走了。你读过那本的对白吗？',
    "Large-print book's out on loan. Have you read the dialogue in it?",
  ],
  [
    '购物单当教材？学生问我「一把」究竟多大。',
    'Shopping list as a lesson? A student asked how big a handful is.',
  ],
  [
    '雨里还有学生来！椅子先摆着，例句一会儿读。',
    'Students still coming through the rain! Leave the chairs. Sentences can wait.',
  ],
  [
    '我的口音哪里来的？问得具体些，能讲一下午。',
    "Where's my accent from? Ask more precisely; I could talk all afternoon.",
  ],
  [
    '春天落花进了粉笔盒。你会叫它客人，还是杂物？',
    'Spring petals in the chalk box. Guests or clutter?',
  ],
  [
    '鸟叫盖过录音了。听见几种？这次我也没答案。',
    "Birds louder than the recording. How many kinds? I don't know either.",
  ],
  [
    '夏天电扇吹走讲义。我们先捡事实，再捡例句。',
    'Summer fan scattered the handouts. Facts first, examples next.',
  ],
  [
    '夏天这么亮，你怎么跟自己说「下班了」？',
    "So bright in summer. How do you tell yourself work's finished?",
  ],
  [
    '秋季开课，满走廊湿外套。比名单更早报到。',
    'Autumn term: wet coats everywhere. Arrived before the register.',
  ],
  [
    '秋叶夹错页了。你说这算「书签迷路」吗？',
    'Autumn leaf in the wrong page. Would you call that a lost bookmark?',
  ],
  [
    '冬天我写字像密码。你读成哪个词了？',
    "My handwriting's a code in winter. What word did you read there?",
  ],
  [
    '暖气边坐满了。冬天的听力练习，先争位置。',
    'Radiator seats full. Winter listening starts with finding a place.',
  ],
  [
    '雨声盖过录音了。刚才那句，你听成了什么？',
    'Rain drowned out the recording. What did you hear in that sentence?',
  ],
  [
    '湿伞放门后！学生把「滑倒」演给我看过了。',
    'Wet umbrellas behind the door! A student has already demonstrated slippery.',
  ],
  [
    '太阳一照，玻璃上全是手印。「擦过」算完成时吗？',
    'Sun shows every fingerprint. Does wiped count as a completed action?',
  ],
  [
    '云遮住光了。叫灰暗，还是柔和？看你画什么。',
    "Cloud softened the light. Gloomy or gentle? Depends what you're drawing.",
  ],
  [
    '雪天鞋底带进水。故事先等等，地要擦干。',
    'Snow on soles, water on floor. Stories later. Dry it first.',
  ],
  [
    '上次那本读到哪句？我在一个破折号那儿卡住了。',
    'Which sentence did you reach? I got stuck at a dash.',
  ],
  [
    '这桌子终于稳了。你还记得我上课洒茶那回吗？',
    "Table's finally steady. Remember when I spilt tea during class?",
  ],
  [
    '你茶还加糖吗？上次我把学生的习惯记反了。',
    "Still taking sugar? Got a student's preference backwards last time.",
  ],
  [
    '你刚才说得顺。我差点又拿出批作业的笔。',
    'You spoke easily then. Nearly got my marking pen out again.',
  ],
  [
    '这本书有我的旧笔记。读错的地方也没擦掉。',
    'My old notes are in this book. Kept the wrong readings too.',
  ],
  [
    '今天你挑题，我练听力。你说太快也算真实材料。',
    "You choose the topic. I'll practise listening. Fast speech counts as authentic material.",
  ],
  [
    '街上叫海伦。「老师」我一听就想找作业。',
    'Helen in the street. Hear teacher and I start hunting for homework.',
  ],
  [
    '续签文件看累了？挑个最拗口的词，我也念念。',
    "Tired of renewal papers? Pick the most awkward word. I'll try saying it.",
  ],
  [
    '等续签信时，「耐心」这个词听起来多讨厌？',
    'How irritating does the word patience sound while waiting for a renewal letter?',
  ],
  [
    '升职了？用一句话讲新岗位，我来猜日常干什么。',
    "Promoted? Describe the job in one sentence. I'll guess what you do all day.",
  ],
  [
    '英语过了！你最想大声说哪句？我把红笔收好。',
    "Passed English! What would you like to shout? Red pen's put away.",
  ],
  [
    '周末课饼干多。这个比较句，晚课那班别听见。',
    "More biscuits in weekend class. Don't let the evening class hear.",
  ],
  [
    '下班来晚课累吧？先喝水，今天谁想挑例句？',
    'Tired coming to class after work? Water first. Who wants to choose the examples?',
  ],
  [
    '烟花这声轰，你会写成哪个拟声词？',
    'What word would you use for that firework bang?',
  ],
  [
    '太妃糖粘牙。现在示范发音，会误人子弟。',
    'Toffee on my teeth. My pronunciation would mislead everyone now.',
  ],
  [
    '烟花散了，该用哪个词？学生上回写「开花倒放」。',
    'What word for a fading firework? A student wrote flowers in reverse.',
  ],
  [
    '围巾这一头归你。分句我会，分围巾没练过。',
    "This end's yours. I teach clauses, not sharing scarves.",
  ],
]);
for (const [season, indices] of [
  [2, [10, 11]],
  [3, [12, 13]],
  [4, [14, 15]],
  [1, [16, 17]],
] as const)
  for (const i of indices) helenLines[i].season = season;
for (const i of [18, 19]) helenLines[i].weather = ['rain'];
helenLines[20].weather = ['sunny'];
helenLines[21].weather = ['cloudy'];
helenLines[22].weather = ['snow'];
for (let i = 23; i < 30; i++)
  helenLines[i].heartsMin = i < 25 ? 2 : i < 28 ? 4 : 6;
for (const i of [30, 31])
  helenLines[i].when = [{ visaMonthsLeftMax: b.renewalWindowMonths }];
helenLines[32].when = [{ flag: 'quarter-promoted' }];
helenLines[32].once = true;
helenLines[33].when = [{ flag: 'quarter-exam-passed' }];
helenLines[33].once = true;
helenLines[34].dayKinds = ['weekend'];
helenLines[35].dayKinds = ['workday'];
for (let i = 36; i < 40; i++) helenLines[i].festival = 'bonfire-night';

export const npcs: Npc[] = [
  {
    id: 'margaret',
    name: text('玛格丽特', 'Margaret'),
    role: text('退休邻居，菜地老手', 'Retired neighbour and allotment regular'),
    schedule: [
      {
        dayKinds: ['weekend'],
        when: [
          { flag: 'quarter-board-community-lunch' },
          { minuteMin: 420, minuteMax: 959 },
        ],
        stops: [{ from: 0, at: 'green' }],
      },
      ...schedule(
        [
          { from: 0, at: 'home-street' },
          { from: 540, at: 'allotment-plots' },
          { from: 720, at: 'cafe' },
          { from: 900, at: 'allotment' },
          { from: 1080, at: 'home-street' },
        ],
        [
          { from: 0, at: 'home-street' },
          { from: 540, at: 'shop' },
          { from: 660, at: 'allotment' },
          { from: 960, at: 'park-bench' },
          { from: 1080, at: 'home-street' },
        ],
        [
          { from: 0, at: 'home-street' },
          { from: 600, at: 'cafe' },
          { from: 840, at: 'library' },
          { from: 1020, at: 'home-street' },
        ],
      ),
    ],
    gifts: {
      loved: ['strawberry-jam', 'tulip'],
      liked: ['tea', 'flowers', 'potato'],
      disliked: ['old-boot', 'shopping-trolley', 'pike'],
    },
    reactions: reactions(
      'margaret',
      text(
        '好！这比园艺目录那堆花架子强，泥手先擦擦。',
        'Good! Better than that fancy rubbish in the gardening catalogue. Let me wipe my hands.',
      ),
      text(
        '得了，这个我用不来！下回给我留个旧盆就成。',
        'Honestly, I can’t use this! Next time an old flowerpot will do.',
      ),
    ),
    lines: margaretLines,
  },
  {
    id: 'ade',
    name: text('阿德', 'Ade'),
    role: text(
      '在镇上工作，也在准备续签',
      'Works in town, also preparing a renewal',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'bus-stop' },
        { from: 540, at: 'work' },
        { from: 1020, at: 'cafe' },
        { from: 1140, at: 'pub' },
        { from: 1320, at: 'home-street' },
      ],
      [
        { from: 0, at: 'home-street' },
        { from: 600, at: 'pond' },
        { from: 840, at: 'cafe' },
        { from: 1080, at: 'pub-garden' },
        { from: 1260, at: 'home-street' },
      ],
      [
        { from: 0, at: 'home-street' },
        { from: 540, at: 'work' },
        { from: 1020, at: 'pub' },
        { from: 1260, at: 'home-street' },
      ],
    ),
    gifts: {
      loved: ['cake', 'fish-and-potatoes'],
      liked: ['tea', 'biscuits', 'corn'],
      disliked: ['old-boot', 'shopping-trolley', 'turnip'],
    },
    reactions: reactions(
      'ade',
      text(
        '需求命中。采购评价：比我自己选的准。',
        'Requirement met. Procurement review: better choice than mine.',
      ),
      text(
        '用途待确认。下次采购建议：换一项。',
        'Purpose unconfirmed. Next procurement recommendation: something else.',
      ),
    ),
    lines: adeLines,
  },
  {
    id: 'helen',
    name: text('海伦', 'Helen'),
    role: text('语言学校 ESOL 老师', 'ESOL teacher at the college'),
    schedule: schedule(
      [
        { from: 0, at: 'home-street' },
        { from: 540, at: 'library' },
        { from: 780, at: 'college' },
        { from: 1260, at: 'college-steps' },
        { from: 1320, at: 'home-street' },
      ],
      [
        { from: 0, at: 'home-street' },
        { from: 600, at: 'college' },
        { from: 840, at: 'library-steps' },
        { from: 1020, at: 'park-path' },
        { from: 1140, at: 'home-street' },
      ],
      [
        { from: 0, at: 'home-street' },
        { from: 540, at: 'library' },
        { from: 780, at: 'college' },
        { from: 1260, at: 'home-street' },
      ],
    ),
    gifts: {
      loved: ['tea', 'flowers'],
      liked: ['biscuits', 'strawberry-jam', 'salad'],
      disliked: ['old-boot', 'shopping-trolley', 'pike'],
    },
    reactions: reactions(
      'helen',
      text(
        '这礼物选得真好！我学生说的「正中下怀」，是这意思？',
        'What a lovely choice! Just what I wanted. That’s the phrase my student used, isn’t it?',
      ),
      text(
        '这个我用着不合适。「不合适」说得够清楚吗？',
        'This doesn’t suit me. Is doesn’t suit me clear enough?',
      ),
    ),
    lines: helenLines,
  },
];

const supporting: [
  string,
  string,
  string,
  string,
  Npc['schedule'][number]['stops'][number]['at'],
  [string, string][],
][] = [
  [
    'priya',
    '普里娅',
    'Priya',
    'GP 诊所前台',
    'gp',
    [
      [
        '预约先核姓名。上回封皮换新，重名照旧。',
        'Name first, please. New appointment book, same duplicated names.',
      ],
      [
        '预约电话刚停，我先喝口水，嗓子快干了。',
        "Appointment calls have stopped. Water first. Throat's parched.",
      ],
      [
        '请先坐右边候诊，左边那把已报修。',
        "Please take the right waiting-room chair. Left one's reported for repair.",
      ],
      [
        '周末我拼海景。边块找齐了，海全是蓝的。',
        'Seascape jigsaw this weekend. Found the edges. The sea is all blue.',
      ],
      [
        '请走干的那边，伞套在接待台旁。',
        'Dry side of the floor, please. Umbrella sleeves by reception.',
      ],
    ],
  ],
  [
    'dave',
    '戴夫',
    'Dave',
    '酒吧老板，pub quiz 主持',
    'pub',
    [
      [
        '今晚题目我锁抽屉了，钥匙还在找。',
        'Quiz questions locked away. Now to find the key.',
      ],
      [
        '杯垫别堆塔。倒一回，全场就都记住你了。',
        "Don't stack the mats. Collapse once, achieve lasting fame.",
      ],
      [
        '不喝酒？好，难题少一项。杯子照样要大的？',
        'No alcohol? One less question. Big glass still?',
      ],
      [
        '笔系了绳还少。答题抢手，文具更抢手。',
        'Pens tied down, still missing. Answers popular; stationery more so.',
      ],
      [
        '雨太大？欢迎来挑战本店室内天气：干的。',
        'Heavy rain? Try our indoor weather. Dry.',
      ],
    ],
  ],
  [
    'rahman',
    '拉赫曼',
    'Rahman',
    '街角小店老板，早已入籍',
    'shop',
    [
      [
        '老朋友，换零钱吗？我把硬币摊柜台上，咱们数清。',
        "Need change, my friend? I'll spread the coins on the counter and we'll count them.",
      ],
      [
        '最后那份报纸淋湿了，我给你减价，边上也破了点。',
        "That last paper got wet. I'll reduce it for you. The edge is torn too.",
      ],
      [
        '来，茶在这排，种子在旁边，拿错了我可泡不了。',
        "Here, tea along this shelf, seeds next to it. Pick the wrong packet and I can't brew it.",
      ],
      [
        '老朋友，这门铃从开店响到现在，进货时都舍不得换。',
        "That bell's been here since I opened, my friend. Can't bring myself to order a new one.",
      ],
      [
        '蛋糕进货又多了，算我贪吃，刚才已经替库存吃掉一块。',
        "Ordered too much cake again. Blame my appetite. I've already eaten one from the stock.",
      ],
    ],
  ],
  [
    'lina',
    '莉娜',
    'Lina',
    '正在为拒签找办法的朋友',
    'cafe',
    [
      [
        '喂，拒签那封信先合上，咖啡都凉了。',
        "Hey, shut that refusal letter for a bit. The coffee's gone cold.",
      ],
      [
        '拒签理由又绕着写，拜托，说清缺哪项！',
        "Another roundabout refusal reason. Please, just say what's missing!",
      ],
      [
        '等律师回电，围巾都织长一截了。',
        "Waiting for the solicitor to ring. The scarf's grown another stretch.",
      ],
      [
        '陪我去问咨询？喂，问题我自己来讲。',
        "Come to the advice session? Hey, I'll ask my own questions.",
      ],
      [
        '今天只聊蛋糕！干成这样，还敢收我咖啡的钱。',
        'Cake talk only today! This dry, and they still charge me for coffee.',
      ],
    ],
  ],
  [
    'gareth',
    '加雷思',
    'Gareth',
    '邮差',
    'postbox',
    [
      [
        '到家，关门，再认棕信封收件人。先核门牌。',
        "Home, door shut, check the brown envelope's name. House number first.",
      ],
      [
        '门牌被挡了。雨不雨，都得找准这一户。',
        "Number's hidden. Rain or not, must find the right door.",
      ],
      [
        '那只狗认得鞋。左脚先闻，顺序一直这样。',
        'Dog knows my shoes. Left first. Same order.',
      ],
      [
        '往下压，邮袋才扣得住。里头全是传单。',
        'Press down to close the postbag. All leaflets in there.',
      ],
      [
        '走这边，到长椅停。我的送信路线平时绕过去。',
        'This way. Stop at the bench. My postal round usually goes past.',
      ],
    ],
  ],
];
const roles: Record<string, string> = {
  priya: 'GP receptionist',
  dave: 'Publican and quiz host',
  rahman: 'Long-established shopkeeper and British citizen',
  lina: 'Friend finding a way through a visa refusal',
  gareth: 'Postal worker',
};
for (const [id, zhCN, en, role, at, pairs] of supporting)
  npcs.push({
    id,
    name: text(zhCN, en),
    role: text(role, roles[id]),
    schedule: schedule(
      [
        { from: 0, at: 'home-street' },
        { from: 540, at },
        { from: 1080, at: 'high-street-east' },
        { from: 1260, at: 'home-street' },
      ],
      [
        { from: 0, at: 'home-street' },
        { from: 600, at: id === 'priya' ? 'park-path' : at },
        { from: 1080, at: 'bench' },
      ],
      [
        { from: 0, at: 'home-street' },
        {
          from: 540,
          at: id === 'priya' ? 'cafe' : id === 'gareth' ? 'shop' : at,
        },
        { from: 1080, at: 'cafe' },
      ],
    ),
    gifts: {
      loved: [],
      liked: ['tea', 'biscuits'],
      disliked: ['old-boot', 'shopping-trolley'],
    },
    reactions: reactions(
      id,
      text('太好了，正想着这个呢。', 'Lovely, I was just thinking of that.'),
      text('这个……我先找个地方搁着。', 'Well… I’ll find somewhere to put it.'),
    ),
    lines: lines(id, pairs),
  });

const extraDailyLines: Record<string, [string, string][]> = {
  priya: [
    [
      '找到了，订书机压在预约单底下。',
      'Found it. Stapler was under the appointment slips.',
    ],
    [
      '接待台换塑料花，省下浇水的工夫核预约。',
      'Plastic flowers at reception now. More time to check appointments than water plants.',
    ],
    [
      '新门垫卷边，接待台又多一张报修单。',
      'New mat curls up. Another repair form at reception.',
    ],
    [
      '交班先核预约本，饭盒里的叉子又忘带了。',
      'Appointment book checked for handover. Forgot my lunch fork again.',
    ],
    [
      '候诊杂志先挑日期。配色好看也会过期。',
      'Dates first on waiting-room magazines. Nice colours can still be out of date.',
    ],
    [
      '请再报姓名，笔漏墨，写成一团了。',
      'Name again, please. Pen leaked. Got a blob here.',
    ],
    [
      '我这边先收预约本，午饭梨快被压扁了。',
      "Moving the appointment book first. My lunch pear's getting flattened.",
    ],
    [
      '候诊椅贴垫了，挪椅声总算歇下。',
      'Pads on the waiting-room chairs. Finally, less scraping.',
    ],
    [
      '接待电话先报诊所名，打哈欠得赶在铃前。',
      'Clinic name first on reception calls. Fit the yawn in before it rings.',
    ],
    [
      '候诊区的画挂高了，得写进前台交班本。',
      "Waiting-room picture's too high. Goes in the reception handover book.",
    ],
    [
      '春风把接待传单吹混了，过期的顺手撤掉。',
      'Spring wind mixed up the reception leaflets. Took the old ones out too.',
    ],
    [
      '夏天请先核预约时段，我的午饭又晒热了。',
      'Please check the appointment time this summer. My lunch has warmed up again.',
    ],
    [
      '门上那片秋叶像新通知，害我去核日期。',
      'Autumn leaf on the door looked like a notice. Went to check the date.',
    ],
    [
      '冬天戴手套难翻预约本，我这边先摘一下。',
      'Gloves make the appointment book awkward in winter. Let me take them off.',
    ],
    [
      '雨天请先擦鞋，前台的防滑牌刚摆好。',
      "Please wipe your shoes in this rain. Reception's wet-floor sign is out.",
    ],
    [
      '前台帘子放下来，太阳照得姓名都看不清。',
      "Reception blind down. Sun's making the names impossible to read.",
    ],
    [
      '雪水带进候诊区了，请先靠扶手走。',
      'Melted snow in the waiting area. Please keep by the handrail.',
    ],
    [
      '周末沿池塘走，我专门找拼图盒上的那只鸟。',
      'Weekend walk round the pond. Looking for the bird on my jigsaw box.',
    ],
    [
      '交班后耳机印还在，水壶响我都想报姓名。',
      'Headset mark lasts after handover. Kettle whistles; I nearly ask its name.',
    ],
    [
      '先确认，还是热水？接待员也会记错杯子。',
      'Just checking: hot water again? Receptionists can mix up mugs too.',
    ],
    [
      '先坐这边喝茶，下班聊拼图，预约本合了。',
      'Sit here for tea. Off duty, jigsaw talk. Appointment book closed.',
    ],
    [
      '跟你聊得顺，我差点说「下一位」。职业病！',
      'Easy talking to you. Nearly said “Next, please.” Occupational hazard!',
    ],
    [
      '门铰链修好了，接待台终于收回报修牌。',
      'Door hinge fixed. Reception can put the repair sign away.',
    ],
    [
      '纸巾请拿，我核预约也常弄一手墨。',
      'Help yourself to tissues. I get ink all over checking appointments too.',
    ],
    ['今天不赶时间，绕池塘走走？', 'No hurry today. A walk round the pond?'],
    [
      '我带针线，交班时常把袖口勾在抽屉上。',
      'I carry sewing things. Always catch my cuff on the drawer at handover.',
    ],
    [
      '等回信累吧？坐这边，我也刚摘掉接线耳机。',
      'Waiting for a reply is tiring. Sit here. Just got my headset off too.',
    ],
    [
      '续签表看到哪页？我核预约单也总漏翻背面。',
      'Which page of the renewal form? I keep missing the backs of appointment slips.',
    ],
    [
      '预约本收得齐，自己的购物单倒洗掉了。',
      'Appointment book spotless. Put my own shopping list through the wash.',
    ],
    [
      '前台叫号才开口，麻雀又抢在我前面响。',
      'Started calling from reception. Sparrow got in ahead of me again.',
    ],
    [
      '交班先核待回电话，休息铃总算轮到我。',
      'Checking calls to return at handover. Finally my turn for the break bell.',
    ],
    [
      '接待台抽屉勾了围巾，交班又多一项报修。',
      'Reception drawer snagged my scarf. Another repair for the handover.',
    ],
    [
      '杯口缺了，得跟候诊室那批一起换。',
      'Chipped rim. Needs replacing with that batch from the waiting room.',
    ],
    [
      '听脚步就认出你了，比核姓名还快。',
      'Knew your footsteps. Quicker than checking the name.',
    ],
    [
      '下班还在想预约排队，我得揉揉耳机印。',
      'Off duty, still thinking about the appointment queue. Rubbing that headset mark.',
    ],
  ],
  dave: [
    [
      '黑板擦丢了。菜单那团不是新菜，是擦不掉。',
      "Lost the eraser. That cloud isn't a new dish.",
    ],
    [
      '猜汤料也抢答？各位，答错芹菜照样得吃！',
      "Guessing the soup ingredients now? Sorry, folks, a wrong answer won't remove the celery!",
    ],
    [
      '杯垫全垫桌脚了！给我一张菜单，杯子先放这儿。',
      'Coasters under all the legs! Menu here, cup on that for now.',
    ],
    [
      '门铃声音怪？它也想当主持，可惜只会一句。',
      'Odd doorbell? Wants to host. Only knows one line.',
    ],
    [
      '队名念过了。猫睡了，可能是我念得太温柔。',
      'Practised team names. Cat asleep. Must be my soothing delivery.',
    ],
    [
      '那把椅子稳，坐吧！我去把摇晃那把搬到后面。',
      'That chair is steady, sit! Wobbly one goes out the back.',
    ],
    [
      '厨房钟慢，薯条不管。计时交给鼻子，危险。',
      "Kitchen clock's slow. Chips don't care. Timing by nose is risky.",
    ],
    [
      '笔芯新换的。题不会，也不能怪笔了。',
      "Fresh ink. Wrong answer? Can't blame the pen now.",
    ],
    [
      '有人拿答题纸当购物单。好歹有几题答得上。',
      'Someone took the answer sheet home as a shopping list.',
    ],
    [
      '灯罩一擦，本店突然显得有前途了。',
      'Clean shades. Pub suddenly looks promising.',
    ],
    [
      '春天这门还是得开，打喷嚏的进来先拿纸巾吧！',
      'Spring door stays open. Sneezing arrivals, tissues first!',
    ],
    [
      '夏天冰化得快，我再拿一碗来，先把杯子挪开！',
      'Summer ice melts fast. Another bowl coming. Shift the glasses!',
    ],
    [
      '落叶进店不买饮料。我还不能把它列黑名单。',
      "Autumn leaves buy nothing. Can't even bar them.",
    ],
    [
      '冬天衣帽架满了。再挂一件，它就有意见了。',
      "Winter coat stand's full. One more and it'll resign.",
    ],
    [
      '雨替我们打鼓。没点歌权，还不用付小费。',
      "Rain's drumming. No requests, no tip required.",
    ],
    [
      '太阳一出，全员转移花园。室内椅子遭到冷落。',
      'Sun out, everyone in the garden. Chairs indoors feel rejected.',
    ],
    [
      '下雪卖热汤。粉笔写完菜单，我也想点一碗。',
      'Snow means hot soup. Wrote the board; now I want some.',
    ],
    [
      '周末报纸只看体育？好，别的版替我垫桌子。',
      'Only sport at weekends? Other pages can level my tables.',
    ],
    [
      '麦克风只对笑话咳嗽。它的审美，很不礼貌。',
      'Mic coughs at my jokes. Rude taste.',
    ],
    [
      '哟，又来了！老样子？等我猜，猜错这轮你主持。',
      'Back again! The usual? Let me guess. Get it wrong and you can host this round.',
    ],
    [
      '来，试一道题！听不懂就喊停，出题人就在这儿。',
      "Try this question! Shout if it makes no sense. The culprit's right here.",
    ],
    [
      '队名我记得，拼法不敢说。我的学历到发音为止。',
      'Remember your team name, not the spelling. Education stopped at sound.',
    ],
    [
      '好写的笔归你。别宣扬，我还有公平形象要装。',
      'Good pen for you. Quietly. I have fairness to pretend.',
    ],
    [
      '你已经笑了？算了，包袱给你，别让它摔着。',
      'Laughing already? Catch the punchline for me, then.',
    ],
    [
      '各位，老板申请坐客席。谁敢叫我擦桌子？',
      "The landlord requests a seat in the audience, folks. Who's going to ask him to wipe it?",
    ],
    [
      '歌单又放老唱片。不是怀旧，是新列表点错了。',
      'Old record again. Not nostalgia. Wrong playlist button.',
    ],
    [
      '题册先合上。茶洒上去，题就真成谜了。',
      'Close the quiz book. Spilt tea makes genuine riddles.',
    ],
    [
      '等续签信啊？茶先倒满，你讲到哪儿我都接着听。',
      "Waiting on renewal? Full cup first. I'll listen wherever your story starts.",
    ],
    [
      '擦杯子擦湿袖口。水多没用，经验也没用。',
      "Polished glasses, soaked sleeves. More water didn't help. Experience either.",
    ],
    [
      '球杆修了。打歪的，我这儿暂不保修。',
      "Cue fixed. Crooked aim isn't under warranty.",
    ],
    [
      '换大碟子了。饼干还嫌挤，要求挺高。',
      'Bigger saucers. Biscuits still cramped. Demanding lot.',
    ],
    [
      '有人夸窗户亮。那是镜子，先别告诉他。',
      "Someone praised the window. It's a mirror. Don't tell them yet.",
    ],
    [
      '少一把椅子。等等，我坐的这把算了吗？',
      "One chair short. Wait. Counted the one I'm sitting on?",
    ],
    [
      '哎哟，给自己泡的茶又端给客人了！老板这记性！',
      'Oh, brilliant. Given my own tea to a customer again! Some landlord I am.',
    ],
    [
      '没人点歌？我就唱了。这算预警，听清楚啊。',
      "No requests? I'll sing. That's a warning, everyone.",
    ],
  ],
  rahman: [
    [
      '来，借过一下，我那支写价签的笔又滚柜台底了。',
      "Excuse me a moment. My pricing pen's rolled under the counter again.",
    ],
    [
      '要高处的茶罐？我搬凳子，老朋友，替我看一下柜台。',
      "The tea up there? I'll fetch a stool. Watch the counter a moment, my friend.",
    ],
    [
      '谁把姜饼摆肥皂旁边了？闻一闻，亏了两样货。',
      'Who shelved ginger biscuits beside the soap? Smell that. Two lines of stock spoiled.',
    ],
    [
      '在家听门铃也想喊欢迎光临，家里人都笑我开分店。',
      "Hear a bell at home and I call out welcome. My family says I've opened a branch.",
    ],
    [
      '这批纸箱倒结实，老朋友，搬东西的话我留给你。',
      "Good sturdy boxes this delivery, my friend. I'll save them if you're moving anything.",
    ],
    [
      '这算盘跟我开过店，珠子卡住那格，我闭眼都找得到。',
      'Had this abacus since opening. I can find the sticky bead with my eyes shut.',
    ],
    [
      '收音机没电，我进了一箱电池，偏偏全卖完了。',
      "Radio's flat. Ordered a whole box of batteries and sold every last one.",
    ],
    [
      '面包放高些，老朋友，上回狗进店我还没来得及报价。',
      'Put that bread higher, my friend. Last dog got to it before I could quote a price.',
    ],
    [
      '店钥匙磨得这么亮，是我天天开门关门磨的。',
      "Shop key's polished bright. That's me opening and locking up every day.",
    ],
    [
      '来，借过，货车把箱子卸门口了，我得挪去后仓。',
      "Coming through. Delivery driver's left boxes in the doorway. Back room they go.",
    ],
    [
      '春天种子卖得好，我给自己留那包，却找不到花盆了。',
      "Seeds sell well in spring. Saved a packet for myself; now I can't find a pot.",
    ],
    [
      '夏天这批番茄熟过头了，今天我按软果的价卖。',
      "Summer tomatoes are overripe. I'm charging the soft-fruit price today.",
    ],
    [
      '秋天进店先来口热茶，老朋友，我刚换了新的茶叶。',
      'Have some hot tea coming in this autumn, my friend. Just opened a fresh packet.',
    ],
    [
      '冬天店玻璃起雾，擦完招牌还得擦我的眼镜。',
      'Shop window fogs up in winter. Wipe the sign, then my glasses.',
    ],
    [
      '下雨这门垫能拧出水，老朋友，货袋先搁高一点。',
      'You could wring out the doormat in this rain, my friend. Keep your shopping bag up.',
    ],
    [
      '太阳晒到糖罐了，我得挪货架，已经粘了两块。',
      "Sun's reached the sweet jar. Need to move that shelf. Two sweets stuck already.",
    ],
    [
      '台阶积雪，我拿铲子来，老朋友，先在柜台边等一下。',
      "Snow on the step. I'll get the shovel. Wait by the counter, my friend.",
    ],
    [
      '周末报纸卖得早，那叠我特意留着，老客订好的。',
      'Once the weekend papers sell out, the street feels awake.',
    ],
    [
      '刚来认街名，我把每块招牌画账本上，店名还抄错过。',
      'When I first came I drew shop signs in the ledger to learn the streets. Even copied one name wrong.',
    ],
    [
      '你常买的茶又到货了，还是那一层，价签也换好了。',
      "Your usual tea's back in stock. Same shelf. New price label's up too.",
    ],
    [
      '老朋友，零钱都替你抓好了，今天换买大袋的？',
      'Got your change ready, my friend. Going for the big bag today?',
    ],
    [
      '老朋友，店里这桩旧事，我还只跟你讲过。',
      "My friend, you're the only one I've told that old shop story to.",
    ],
    [
      '你上次说到一半我就去找零了，老朋友，接着说？',
      'Went to fetch change halfway through your story last time, my friend. Go on?',
    ],
    [
      '开店那照片里的我，围裙系歪了，正赶着接货。',
      "That's me in the opening photo, apron crooked, rushing to take a delivery.",
    ],
    [
      '入籍照片里领带歪了，我还拿去复印，弄得哪张都歪。',
      "Tie's crooked in my citizenship photo. Had copies made, so it's crooked in every one.",
    ],
    [
      '入籍以后第二天照旧开店，送货的先问我面包订几箱。',
      "Opened as usual the day after citizenship. Driver's first question was how many bread crates.",
    ],
    [
      '头回在这儿过冬，我买的帽子太大，找零都得仰头看。',
      'First winter here, bought a hat too big. Had to tilt my head back to count change.',
    ],
    [
      '等续签信这阵，老朋友，来店里坐，我也等过那些信。',
      "While you wait for the renewal letter, sit in the shop, my friend. I've waited for those letters too.",
    ],
    [
      '纸袋就放柜台下，老朋友，你常买的那袋米正好装。',
      'Bags under the counter, my friend. Just right for your usual bag of rice.',
    ],
    [
      '旧店牌还存后仓，油漆掉进米袋过，后来我包上了。',
      "Old shop sign's in the back. Paint flaked into a rice sack once. Wrapped it up after that.",
    ],
    [
      '老朋友，我想早点关店去看花，营业牌得改一改。',
      'Thinking of closing early to see the flowers, my friend. Need to change the hours sign.',
    ],
    [
      '那猫进店直奔最贵的鱼罐头，老朋友，它眼光比我贵。',
      'That cat goes straight for our priciest fish tin, my friend. Dearer tastes than mine.',
    ],
    [
      '店灯一亮老客就探头，问的头一句倒是我吃饭没有。',
      "Switch on the shop light and regulars pop in. First thing they ask is whether I've eaten.",
    ],
    [
      '来，找你的零钱，我数出声，老朋友，你跟着再点点。',
      "Here's your change, my friend. I'll count aloud. Check it along with me.",
    ],
    [
      '老朋友，带你的杯子来，柜台后我给自己留了好茶。',
      'Bring your mug, my friend. Saved some good tea for myself behind the counter.',
    ],
  ],
  lina: [
    [
      '补材料的包太沉，肩膀先提出抗议了。',
      "This bag of extra documents is heavy. My shoulder's objecting first.",
    ],
    [
      '咨询的咖啡凉了，问题才问到一半。',
      'Coffee went cold at the advice session. Only halfway through my questions.',
    ],
    [
      '围巾歪就歪了，我可懒得拆这一大截！',
      "Crooked scarf stays crooked. I'm not unravelling all that!",
    ],
    [
      '拒签后那张清单，我终于敢打开了。',
      'Finally managed to open that checklist from after the refusal.',
    ],
    [
      '邮箱刷过了，拜托，让我先吃完蛋糕。',
      'Checked the inbox. Please, let me finish my cake first.',
    ],
    [
      '律师要的附件找到了，我却忘了充电。',
      'Found the attachment the solicitor asked for. Forgot to charge the phone.',
    ],
    [
      '面煮多了，够我边查咨询边吃两顿。',
      'Too much pasta. Two meals while I look up advice services.',
    ],
    [
      '图书馆太静，问拒签的电话我出去打。',
      "Library's too quiet. I'll take this call about the refusal outside.",
    ],
    [
      '说好画池塘，画成咖啡杯了——行，我去续杯。',
      'Meant to draw the pond. Drew a coffee cup. Right, another coffee.',
    ],
    [
      '为问材料跑得脚疼，新鞋真会挑日子。',
      'Feet hurt from chasing documents. Great timing for new shoes.',
    ],
    [
      '春天花开了，咨询邮件还卡在草稿里。',
      "Spring flowers are out. My advice email's still stuck in drafts.",
    ],
    [
      '夏天候车去咨询，热得我问题都忘了。',
      'Summer bus stop, off for advice. So hot I forgot my questions.',
    ],
    [
      '秋叶响得像拆信，喂，我心跳都快了。',
      'Leaves rustle like a letter opening. Hey, my heart actually jumped.',
    ],
    [
      '冬天问材料得摘手套，手机偏不认我。',
      "Gloves off to ask about documents. Phone won't recognise me in winter.",
    ],
    [
      '冒雨跑咨询，拜托，伞偏在这时坏。',
      'Off for advice in the rain. Oh, come on, now the umbrella breaks.',
    ],
    [
      '晴天我也想晒太阳，拒签那事先搁会儿。',
      "I'd like some sun too. That refusal business can wait a bit.",
    ],
    [
      '雪这么厚，先问咨询有没有取消。',
      "Snow's deep. I'll check whether the advice session's cancelled.",
    ],
    [
      '周末把拒签邮件关了，喂，我也得歇。',
      'Closing the refusal emails for the weekend. Hey, I need a break too.',
    ],
    [
      '拒签那行字记得比密码牢，烦死了。',
      'Remember that refusal sentence better than my password. So annoying.',
    ],
    [
      '你记得我少糖，比那封模板回信贴心。',
      'You remembered less sugar. More personal than that template reply.',
    ],
    [
      '拒签后的那半段还听吗？今天讲得动。',
      'Still want the rest of what happened after the refusal? I can tell it today.',
    ],
    [
      '跟你走路我就收手机，老刷邮箱连电都白费。',
      'Phone away walking with you. Refreshing email just wastes the battery.',
    ],
    [
      '拜托，毛线归毛线，别又问我去留。',
      "Please, knitting is knitting. Don't turn it into another question about staying.",
    ],
    [
      '我想讲拒签后有多怕，励志那套收起。',
      'I want to say how scared I was after the refusal. Save the inspirational bit.',
    ],
    [
      '鸭子也来抢面包，喂，排我咨询后面！',
      'Duck wants my bread too. Hey, wait till after my advice session!',
    ],
    [
      '上诉能不能走，我得问律师，别替我定。',
      "I need to ask a solicitor whether an appeal is possible. Don't decide for me.",
    ],
    [
      '你忙续签？我当时光补材料就跑断腿。',
      'Renewal keeping you busy? Chasing extra documents wore me out back then.',
    ],
    [
      '律师电话一响，勺子就掉了，真烦。',
      'Solicitor rings, spoon drops. Brilliant. Just brilliant.',
    ],
    [
      'Plan B 的地名我念错了，先查再说。',
      'Mispronounced the place in Plan B. Better look it up first.',
    ],
    [
      '问慈善机构的邮件发了，喂，终于。',
      'Sent that email to the advice charity. Hey, finally.',
    ],
    [
      '下午我要乱画，咨询问题明天再理。',
      "I'm doodling this afternoon. Advice questions can wait till tomorrow.",
    ],
    [
      '咖啡馆快认得我补材料的包了，烦。',
      "The café's about to recognise my document bag. How depressing.",
    ],
    [
      '烧焦面包也得吃，咨询车费还没算呢。',
      "Burnt toast will do. Haven't counted the bus fare for advice yet.",
    ],
    [
      '材料备份找到了，喂，原来存错名字。',
      "Found the document backup. Hey, I'd saved it under the wrong name.",
    ],
    [
      '再坐会儿，我想把咨询那段讲完。',
      'Stay a bit. I want to finish telling you about the advice session.',
    ],
  ],
  gareth: [
    [
      '先送这一袋传单。轻了，后半条街好走些。',
      "Leaflets first. Lighter for the street's second half.",
    ],
    [
      '门牌擦亮了。拐角那户，远远就认得。',
      'Clean number. Recognise that corner house from a distance.',
    ],
    [
      '狗叼着球。我往左，它还跟左。得请主人来。',
      'Dog has a ball. Follows me left. Need the owner.',
    ],
    [
      '邮筒上有鸟。转到右侧，开锁取信。',
      'Bird on the postbox. Round to the right. Unlock and collect.',
    ],
    [
      '橡皮筋留袖口。先拆这一捆，下一捆再说。',
      'Bands on my sleeve. This bundle first, next bundle later.',
    ],
    [
      '新鞋咯吱响。走到小巷口，猫先撤了。',
      "New shoes squeak. Reach the lane mouth; cat's already gone.",
    ],
    [
      '邮箱刷蓝了。路还是那条，得重新认标记。',
      'Blue-painted letterbox. Same route, new landmark.',
    ],
    [
      '帽檐积雨。进门先往外甩，别甩人脚边。',
      'Rain in the brim. Shake it outside, away from feet.',
    ],
    [
      '投递结束，先松鞋带。右脚后跟又磨了。',
      "Round finished. Laces loose first. Right heel's rubbed again.",
    ],
    [
      '明信片画太阳。我只认地址，图是抬眼看见的。',
      'Sun on a postcard. Only reading the address; picture was there.',
    ],
    [
      '春天篱笆长出来。原来的通道，要侧身过。',
      'Spring hedge growing out. Sideways through the old gap.',
    ],
    [
      '夏天水放包侧边。和信分开，洒过就记得了。',
      'Summer water beside the bag. Separate from letters. Learned by spilling.',
    ],
    [
      '秋叶落进信箱。叶子取出来，信再放进去。',
      'Autumn leaves in letterbox. Leaves out, letters in.',
    ],
    [
      '冬天门环冰手。先戴手套，别嫌慢。',
      "Winter knocker's cold. Gloves first. Takes what it takes.",
    ],
    [
      '雨湿了地址。先核对门牌，别凭熟路猜。',
      "Rain on address. Check the number. Don't guess by habit.",
    ],
    [
      '晴天这段好走！过桥往右，袜子还是干的。',
      'Good going in sunshine! Right after the bridge. Socks still dry.',
    ],
    [
      '雪里看脚印没用。那是旧路，还得看冰。',
      "Snow tracks are yesterday's route. Still watch for ice.",
    ],
    [
      '周末不背邮包，肩膀还会自己往上提。',
      'No weekend postbag. My shoulder still lifts itself.',
    ],
    [
      '棕信封先认收件人。地址对了，内容得你自己看。',
      'Name first on that brown envelope. Address right; contents are for you.',
    ],
    [
      '你门铃短一拍。听见那声，我就知道走对门。',
      "Your bell's a beat short. Know the right door by it.",
    ],
    [
      '你上回听我讲小巷的事。这回带你走到那拐角？',
      'You heard my story about the lane. Shall I walk you to that corner?',
    ],
    [
      '收工往你那儿绕。台阶下碰头，先约好了。',
      'Detour to yours after the round. Meet below the steps. Arrangement made.',
    ],
    [
      '修鞋铺：过邮局，右拐。我正要送这双过去。',
      'Shoe repair: past the post office, right. Taking this pair over myself.',
    ],
    [
      '一路喊邮差。到街尾有人叫「加雷思」，我就停了。',
      'Postman all along the road. Someone called Gareth at the end. I stopped.',
    ],
    [
      '邮袋扣子换了。先压再拧，旧手势得改改。',
      'New postbag clasp. Press, then turn. Need to change the old hand movement.',
    ],
    [
      '茶杯靠里，信封放干处。门牌核过了，再拆。',
      'Cup farther in. Envelope somewhere dry. Number checked. Now open it.',
    ],
    [
      '续签材料夹好。去车站先右转，修路那段绕开。',
      'Renewal papers clipped. Right turn for the station. Avoid the roadworks.',
    ],
    [
      '等续签信，听见信箱响就下楼？我也跑过那楼梯。',
      "Waiting for renewal post? Downstairs at every flap? I've run those stairs too.",
    ],
    [
      '这地址字写得清。过桥，第二个路口，我送得到。',
      'Clear address. Bridge, second turning. I can deliver that.',
    ],
    [
      '铃修响了。到弯道才按，别一路催人。',
      'Bell loud again. Ring at the bend, not all the way.',
    ],
    [
      '冬天手套先晾干。湿的套上，走出门更冷。',
      'Dry winter gloves first. Wet ones get colder outside.',
    ],
    [
      '街角门夹袖子。侧身，邮袋往后，再推。',
      'Corner gate catches sleeves. Sideways, postbag back, then push.',
    ],
    [
      '近路我认得。得先看看门开没开，不能白绕。',
      'Know the shortcut. Check the gate first, save a wasted loop.',
    ],
    [
      '空明信片是我的。试笔画了个拐角，还没写街名。',
      "Blank postcard's mine. Tested the pen drawing a corner. No street name yet.",
    ],
    [
      '下回换条路回去。今天沿熟路，脚有点累。',
      'Another route next time. Familiar way today. Tired feet.',
    ],
  ],
};
for (const npc of npcs.filter(
  (n) => !['margaret', 'ade', 'helen'].includes(n.id),
)) {
  npc.lines.push(
    ...extraDailyLines[npc.id].map(([zhCN, en], i) => ({
      id: `${npc.id}-daily-${i + 1}`,
      text: text(zhCN, en),
    })),
  );
  for (const [i, season] of [
    [10, 2],
    [11, 3],
    [12, 4],
    [13, 1],
  ] as const)
    npc.lines[i + 5].season = season;
  npc.lines[19].weather = ['rain'];
  npc.lines[20].weather = ['sunny'];
  npc.lines[21].weather = ['snow'];
  npc.lines[22].dayKinds = ['weekend'];
  for (let i = 24; i < 29; i++)
    npc.lines[i].heartsMin = i < 26 ? 2 : i < 28 ? 4 : 6;
  npc.lines[31].when = [{ visaMonthsLeftMax: b.renewalWindowMonths }];
}

const favourites: Record<string, [string[], string[], string, string]> = {
  priya: [
    ['tea', 'salad'],
    ['flowers', 'biscuits'],
    '这个真喜欢！收到，我把它放拼图桌上。',
    'Love this! Received. Going on my jigsaw table.',
  ],
  dave: [
    ['cake', 'fish-and-potatoes'],
    ['biscuits', 'baked-potato'],
    '答对了，正中喜好！奖品是我闭嘴三秒。',
    'Correct! Favourite. Prize: three seconds of silence from me.',
  ],
  rahman: [
    ['tea', 'strawberry-jam'],
    ['flowers', 'corn'],
    '老朋友，挑到店主心坎里了！我收柜台后自己用。',
    'My friend, just what the proprietor wanted! Keeping it behind the counter for myself.',
  ],
  lina: [
    ['flowers', 'strawberry'],
    ['tea', 'biscuits'],
    '喂，你真挑中我爱的了！颜料手先擦擦，我来拿。',
    'Hey, you picked a favourite! Let me wipe these painty hands and take it.',
  ],
  gareth: [
    ['tea', 'baked-potato'],
    ['biscuits', 'cake'],
    '给我的？收左袋，和信分开。过桥带回家。',
    'For me? Left pocket, separate from the letters. Home over the bridge.',
  ],
};
for (const npc of npcs.filter((n) => favourites[n.id])) {
  const [loved, liked, zhCN, en] = favourites[npc.id];
  npc.gifts.loved = loved;
  npc.gifts.liked = liked;
  npc.reactions.loved = text(zhCN, en);
  npc.reactions.disliked = text(
    npc.id === 'gareth'
      ? '谢谢，这个用不了。买它得绕远吧？下回省那段路。'
      : npc.id === 'dave'
        ? '心意满分，配对失败。下次别让它晋级了。'
        : npc.id === 'priya'
          ? '先确认，下回能换一种吗？这份我用不上。'
          : npc.id === 'rahman'
            ? '老朋友，这个店主真用不上，拿去换件你喜欢的吧。'
            : '谢谢啦，可这真没挑中。喂，下次我跟你逛！',
    npc.id === 'gareth'
      ? 'Thanks, can’t use this. Bit of a detour to buy it? Save that stretch next time.'
      : npc.id === 'dave'
        ? 'Full marks for thought. Wrong match. No rematch for this one.'
        : npc.id === 'priya'
          ? "Quick check: could we try something different next time? I won't use this."
          : npc.id === 'rahman'
            ? 'My friend, the proprietor really has no use for this. Exchange it for something you like.'
            : 'Thanks, but this really misses for me. Hey, next time I will browse with you!',
  );
}
// The receptionist stays at the surgery on wet workdays; Dave serves until closing.
npcs.find((n) => n.id === 'priya')!.schedule[1].stops = [
  { from: 0, at: 'home-street' },
  { from: 540, at: 'gp' },
  { from: 1020, at: 'cafe' },
  { from: 1080, at: 'home-street' },
];
const dave = npcs.find((n) => n.id === 'dave')!;
for (const rule of dave.schedule.filter((r) => r.festival !== true))
  rule.stops = [
    { from: 0, at: 'home-street' },
    { from: 660, at: 'pub-garden' },
    { from: 720, at: 'pub' },
    { from: 1380, at: 'home-street' },
  ];

npcs.push(...familyNpcs);

const scenes: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
][] = [
  [
    'margaret',
    '杂草不认牌子',
    'Weeds cannot read',
    '玛格丽特摊开种植本，番茄那页夹着一张杂草照片。她说自己查了半天，最后查到的是晚饭。\n「你到底种什么？」你问。她把本子合上：「能吃的！这棵倒好，连蜗牛都嫌。」\n你说想跟着她的表安排自己的菜地，她皱起眉头，指出上面连她自己漏掉的日子也记着。\n「得了，照抄连这两次烂苗也抄上！」她拿铅笔圈住两次重种的记录，没有把它们擦掉。\n她又翻开那两次重种的记录：「秘诀？得了！先讲我怎么把番茄种成这副德性。」',
    'Margaret opens her growing notebook. A weed photograph marks the tomato page. She spent ages identifying it, then got distracted by dinner.\n“What do you actually grow?” you ask. “Food! That one there? Even the slugs turned it down.” She shuts the book.\nYou suggest following her plan for your own plot. She frowns: the notebook includes days she forgot about the plants altogether.\n“Go on, copy the two trays of rotten seedlings too!” She circles two sowings that needed doing again, leaving both entries visible.\nShe opens the failed sowings again. “Secrets? Oh, come off it! Start with how I made this mess of the tomatoes.”',
    '先问那两次为什么失败',
    'Ask what went wrong twice',
    '先选自己想吃的菜',
    'Choose what you want to eat first',
  ],
  [
    'margaret',
    '退休后的星期一',
    'Mondays after retirement',
    '玛格丽特翻到一张旧值班表，纸边被订书钉咬出细孔。她说以前连喝茶也得看钟。\n「退休那天很高兴？」你问。「头一天高兴。后来每个星期一都不知道往哪儿站。」\n她起初把菜地排得像班表，连发芽也估好了日子。没长出来的那一栏，差点让她撕掉。\n「我把水仙也排了班，笑话不笑话！」她说完笑了一下，又承认自己至今不喜欢被人问整天都在忙什么。\n她把值班表折回原样，手指在星期一那格停了一下：「得了，我退休了！星期一我就想坐着骂这鬼天气。」',
    'Margaret finds an old duty rota, its edge bitten by staple holes. Even a cup of tea used to depend on the clock.\n“Were you happy to retire?” “First day. Then I never knew where to put myself on a Monday.”\nShe first scheduled the plot like a working week, down to germination dates. One empty column nearly made her tear the page out.\n“Put the daffodils on a rota! Can you believe it?” She laughs, then admits she still dislikes being asked what keeps her busy all day.\nShe folds the rota back up, a finger lingering on Monday. “I’m retired! On Monday I want to sit and curse this blasted weather.”',
    '问以前的工作有什么舍不得',
    'Ask what she misses about work',
    '陪她看看没有安排的日子',
    'Sit with the unplanned days',
  ],
  [
    'margaret',
    '不是他的豆架',
    'Not his bean frame',
    '种植本里有一张褪色照片，玛格丽特和一个男人站在豆架旁。男人的脸被叶子遮了一半。\n她说那是已故的伴侣，架子搭得好看，摘豆却总要搬凳子。她当年为这事没少骂他。\n「都叫我别动，说留个念想！」她把照片翻过来，「我想他，也想摘得到自己的豆子。」\n你问她打算怎么办。她说已经想好要拆，只是每次别人叹气，她就得解释自己并没忘。\n她把照片放在膝上：「锤子先放下！听我讲完，想他归想他，架子当年就搭错了。」',
    'The notebook holds a faded photograph of Margaret beside a man and a bean frame. Leaves hide half his face.\nHe was her late partner. The frame looked grand, but picking beans required a stool. She used to give him an earful about it.\n“Everyone says leave it alone, keep it for the memories! I miss him. I’d also like to reach my beans.” She turns the photograph over.\nYou ask what she intends to do. She has decided to dismantle it; every sympathetic sigh makes her explain she has not forgotten him.\nShe rests the photograph on her knee. “Hammer down first! Hear me out. I miss him. That frame was still built wrong.”',
    '听她讲自己的新架子',
    'Hear her plan for her own frame',
    '请她接着骂旧架子',
    'Let her finish complaining about the old one',
  ],
  [
    'margaret',
    '谁替谁决定',
    'Who gets to decide',
    '玛格丽特听说有人替她申请了一块更小的菜地，连「省得她累」都写进了说明。\n你说出发点大概是好意。她把种植本拍在膝上：「好家伙，我这张嘴还在呢！怎么轮不到我说？」\n她承认膝盖痛过，也不打算种满每一垄。你担心她累坏，却也听得出，她最气的是没被问过。\n你可以支持她保留原地，让她自己决定怎么种；也可以坦承你赞成缩小，哪怕她暂时不肯接受。\n「得了，赞成再点头！」她说，「我这膝盖我自己管！」她等着你的实话，没有把本子收起来。',
    'Margaret learns someone requested a smaller plot for her, even explaining that it would save her getting tired.\nYou suggest they meant well. She slaps her notebook against her knee. “Good grief, I still have a mouth! When do I get a say?”\nShe admits her knee has hurt and will not plant every row. You worry about exhaustion, but hear that not being asked is what angers her most.\nYou can support keeping the original plot and letting her choose how to use it, or admit you favour less ground, even if she will not accept that yet.\n“Oh, nod if you mean it! I’ll see to my own knee!” She waits for your honest answer, leaving the notebook open.',
    '支持她保留菜地，自己决定怎么种',
    'Support keeping the plot and letting her decide',
    '坦承你赞成缩小，接受她不高兴',
    'Admit you favour a smaller plot and accept her displeasure',
  ],
  [
    'ade',
    '茶歇也有议程',
    'A tea-break agenda',
    '工作日的茶歇，阿德打开一个写着「休息」的表格，里面还有开始时间和结束时间。\n你问这算不算又在工作。他看了看屏幕：「同事叫我来茶歇（我又开了报表），先关掉。」\n他承认自己总怕漏掉事，连同事随口说的午饭，也会先记下再决定吃不吃。\n「茶不用提交报告吧？」你问。他把电脑扣上，杯子还没喝：「茶先喝（经理那项先别提），我还没拿杯子。」\n阿德把空白表格留在屏幕里，没有填今天的茶歇。「要是有人问产出，」他说，「报表没填，饼干倒吃了。」',
    'On a workday tea break, Ade opens a spreadsheet called “Breaks”. It has start and finish times.\nYou ask whether that counts as more work. “Colleague called me for tea (opened my work report again). Closing it.” He studies the screen.\nHe admits he worries about missing things. Even a passing lunch suggestion gets written down before he decides whether to eat.\n“No report due for the tea?” you ask. He closes the laptop. “Tea first (leave the manager out of it). I have not picked up the cup.” The cup is untouched.\nAde leaves today’s break unfilled on the sheet. “If anyone asks about output,” he says, “no work reports filled. Did eat the biscuits.”',
    '聊一件今天不打算解决的事',
    'Discuss a problem you will leave unsolved',
    '安静喝茶，不列下一步',
    'Drink quietly, without next steps',
  ],
  [
    'ade',
    '自动回复之外',
    'Beyond the automatic reply',
    '阿德在茶歇里点开收件箱，又立刻关掉。他说只是看一封工作邮件，随即自己摇了头。\n「那句撤回（是续签邮件）。」他说，「自动回复都背下来了。我还是想看看它有没有换个措辞。」\n你说他平时很少提。他把杯柄转了一圈：「怕续签讲多了（还没准信），茶歇就只剩它。」\n你问要不要讲准备到哪里。他说可以，也可以聊工作；这次想由自己决定哪件先说。\n他关掉提醒：「续签还在等回信（又看过了），先把同事带的饼干吃完。」',
    'Ade opens his inbox on the tea break, then closes it. He claims it was a work email, before shaking his head.\n“Withdraw that (it was the renewal email). I know the automatic reply by heart. Still checking whether they’ve changed a word.”\nYou say he rarely mentions it. He turns the cup handle. “Fear talking too much about renewal (still no firm news) leaves no room at tea break.”\nYou ask whether he wants to explain where he is with preparation. He could, or talk work. This time he wants to choose which comes first.\nHe silences notifications. “Still waiting on renewal news (checked again). Colleague’s biscuits first.”',
    '让他讲自己想讲的准备过程',
    'Hear the preparation he wants to discuss',
    '换个工作话题，等他再提',
    'Talk work and let him raise it later',
  ],
  [
    'ade',
    '可靠的人也会忘',
    'Reliable people forget too',
    '茶歇时，阿德翻出一份旧检查表，页角写着「让别人确认」。那行字被他反复描黑了。\n他说刚来这里工作时，漏接过一通家里的电话。后来每件事都写下来，却还是记不住该给谁回电。\n「经理夸我可靠，家里的电话倒漏了。」他说。你问他那些表格到底是在帮谁记住。\n他看了一会儿：「一半帮工作（大概），另一半怕自己散架。」笑完又有点不好意思。\n他把检查表转过来，让那行黑字朝着自己：「工作先交同事一项（只交一项），我得腾点空给家里回电。」',
    'At tea break Ade finds an old checklist. “Ask someone to check” has been inked over repeatedly in one corner.\nWhen he first worked here, he missed a call from home. He started writing everything down, yet still forgot whom to call back.\n“Manager called me reliable. Still missed the call from home.” You ask whom all those spreadsheets are helping to remember.\nHe considers it. “Half for work (roughly), half from fear I might fall apart.” He laughs, then looks a little embarrassed.\nHe turns the blackened instruction towards himself. “One task to a colleague (just one). Need some room to call home.”',
    '一起删掉不必要的检查项',
    'Cut unnecessary checks together',
    '问哪些事可以交给同事',
    'Ask what he could trust colleagues with',
  ],
  [
    'ade',
    '别替我说没事',
    'Do not say I am fine',
    '茶歇时，阿德发现自己交出的工作表有一处错误。他重新算了两遍，脸色比杯子里的茶还淡。\n「同事等着用表（我已核两遍），再拖就迟了。」他说。你问是还没确认，还是想等没人看见时补好。他没回答。\n错误能修，但已经有人照表安排工作。现在公开，阿德得承认失手；先查完再说，别人可能多白忙一阵。\n他终于说：「怕同事觉得我靠不住（先说实话），才一直拖着。」这一次他自己也笑不出来。\n你可以支持立即告知受影响的人，也可以陪他先核清范围再报告。你不替他发信，也不答应替他遮过去。',
    'At tea break Ade finds an error in a worksheet he submitted. After checking twice, he looks paler than his tea.\n“Colleague needs this sheet (checked twice already). Can’t leave it much longer.” You ask whether it is unconfirmed or he hopes to fix it unseen. He does not answer.\nThe error is repairable, but others are already arranging work from it. Speaking now means admitting failure; investigating first may waste more of their effort.\nFinally he says, “Afraid my colleagues won’t trust me (truth first). That’s why I keep delaying.” This time he cannot make himself laugh.\nYou can support notifying the affected people immediately, or help establish the scope before reporting. You will neither send it for him nor promise to conceal it.',
    '支持现在告知，先承认出错',
    'Support telling people now and admitting the mistake',
    '先核清影响再报告，承担延误',
    'Check the scope before reporting and accept the delay',
  ],
  [
    'helen',
    '不改的那个词',
    'The word left uncorrected',
    '海伦读到你随手写的一句话，在一个词下面停住笔。你以为她要改，她却把纸转回来。\n「你说这个词时，想到什么？」她问。你讲起一个很具体的画面，她听完才笑。\n「这个词留着，行吗？」她说，「我刚才只想到词典，你讲的画面我想再听一遍。」\n你问她上课也这么松吗。她摇头，说该教的会教，但现在不是测验，你也没有交作业。\n她把笔盖扣上：「换你问？比如，海伦，刚才那支笔究竟想改哪个词？」',
    'Helen pauses over a word in a sentence you wrote. You expect a correction. Instead, she turns the page back towards you.\n“What were you picturing when you used that word?” You describe something specific. She listens, then smiles.\n“Shall we keep that word for now? I only had the dictionary in mind. Could I hear your picture again?”\nYou ask whether her classes are this relaxed. She shakes her head: she teaches what needs teaching. This is not a test, and you submitted no homework.\nShe caps the pen. “Your question now? Try: Helen, which word was that pen going to change?”',
    '换个词，把那个画面讲下去',
    'Try another word and continue the picture',
    '问她为什么没有改掉它',
    'Ask why she left the word alone',
  ],
  [
    'helen',
    '老师也会找词',
    'Teachers look for words too',
    '海伦的旧书里夹着一张手写便条，只有面包、车站、谢谢几个词，每个词旁边都画了箭头。\n她说曾在外地生活，明明备好了一整页话，走到柜台前却只记得自己在紧张。\n「后来有人替我说完，大家都觉得很方便。」她停住，「我却连问『还能让我再试一次吗』都卡住了。」\n你问那个人是好心吧。她点头，说好心和难受可以同时存在，不必挑一个当结论。\n她把便条夹回书里：「你有这样一句吗？讲到一半，词都到了嘴边，却被人接走了？」',
    'A handwritten note slips from Helen’s old book: bread, station, thank you, each with an arrow beside it.\nShe once lived elsewhere. She prepared a whole page of speech, then reached a counter and remembered only how nervous she was.\n“Someone finished for me. Everyone thought that was convenient.” She pauses. “I couldn’t even ask, could I have another try?”\nYou ask whether they meant well. She nods. Kindness and discomfort can both be true; neither has to cancel the other.\nShe returns the note to the book. “Have you had a sentence like that? Words ready on your tongue, then someone took them?”',
    '听她讲那次没说完的经历',
    'Hear the story she did not finish',
    '讲自己被接走的一句话',
    'Share a sentence someone took over',
  ],
  [
    'helen',
    '红笔收起来',
    'Putting away the red pen',
    '海伦拿出一张以前批过的作业，红字几乎比原文多。她说那位学生后来不再交自己的故事。\n「他连写三篇『今天天晴』。」她说。你问是不是进步了，她摇头：「他怕满纸红字吧。」\n她当时夸过那篇天气作文，后来才发现，自己不知道那个学生原本想讲的家是什么样。\n「你说，他还记得我改的时态，还是记得那满纸红字？」她把红笔收进包里，第一次没有马上解释教学方法。\n海伦把旧作业翻扣着，没有再指给你看哪处改得对。「我又在等你夸我反省得好，是吗？」她说。',
    'Helen shows you an old marked assignment. Red ink almost outnumbers the original words. Its writer stopped submitting personal stories afterwards.\n“Today it is sunny. His next three essays all began like that.” You ask whether that was progress. She shakes her head. “Perhaps he was afraid of all that red ink.”\nShe praised that weather essay at the time. Later she realised she had never learned what the home in his first story actually looked like.\n“Do you think he remembers my tense corrections, or all that red ink?” She puts away her red pen without immediately explaining her teaching method.\nHelen turns the assignment face down, without showing which corrections were right. “Am I waiting for you to praise how well I’ve reflected again,” she says.',
    '问她后来怎样教得不同',
    'Ask what she changed in her teaching',
    '直说温柔纠正也可能伤人',
    'Say gentle correction can still hurt',
  ],
  [
    'helen',
    '不是你的练习题',
    'Not your practice exercise',
    '午后的谈话里，海伦下意识改了你的说法。你停下来，她又补一句只是想帮你说得自然。\n「可我刚才说的是自己，不是练习题。」你说。她握着笔，没有立刻用另一个比喻解释。\n她承认自己一紧张就躲回老师的身份；你也承认，有时害怕被误解，确实想知道怎样说得更准。\n这次你可以坚持先完整讲完，不接受纠正；也可以请她一起改刚才那句，但要求以后先问你是否需要。\n海伦放下笔：「我刚才叫它『帮忙』，你会用哪个词？先由你定。」她等你决定，没有把沉默当成允许开始讲解。',
    'During an afternoon conversation Helen corrects your wording automatically. When you stop, she says she wanted it to sound natural.\n“I was talking about myself. It wasn’t an exercise.” She holds her pen without reaching for another explanatory metaphor.\nShe admits hiding in the teacher role when nervous. You admit that fear of misunderstanding sometimes makes you want more precise words too.\nYou can insist on finishing without correction, or ask her to revise this sentence together, with the agreement that she asks permission in future.\nHelen puts the pen down. “I called it help. What word would you use? Your choice first.” She waits, refusing to treat silence as permission to teach.',
    '坚持先讲完，这次不改措辞',
    'Insist on finishing without changing the wording',
    '这次一起改，以后必须先问',
    'Revise together this time; require asking in future',
  ],
  [
    'priya',
    '不接的电话',
    'The unanswered call',
    '普里娅的手机响了一声，她看见来电名字，把声音关掉。你问是不是诊所又出了什么事。\n「朋友问停车。前台先核哪条街，再说车位。」她说。你以为她马上会回，她却问刚才的话还接着讲吗。\n你笑说她总能把次序排清楚。她摇头：「前台得核预约顺序。现在请你先讲完整，我听着。」\n手机又亮了，她没有解释谁在打，也没向你讲任何病人的事。屏幕暗下去，谈话还在。\n「请先坐这边。接待台那句又顺口了，你接着讲。」她问。手机屏幕暗下去了，普里娅仍看着你，等你自己开口。',
    "Priya's phone rings. She sees the caller's name and silences it. You ask whether something has happened at the clinic.\n“Friend asking about parking. Reception checks which street before the spaces.” You expect her to reply. Instead, she asks if you want to finish your story.\nYou joke that she always gets the order right. She shakes her head. “Reception has to check appointment order. Here, please finish what you were saying.”\nThe phone lights again. She gives no details about the caller or any patients. The screen goes dark while your conversation continues.\n“Please sit here first. Reception habit again. Carry on.” With the screen dark, Priya still looks at you, waiting for you to speak.",
    '把刚才没讲完的话讲完',
    'Finish what you were saying',
    '一起安静，不填满这次停顿',
    'Be quiet without filling the pause',
  ],
  [
    'priya',
    '下班以后',
    'After the shift',
    '晚些时候，普里娅把工牌留在包里，问你要不要坐一会儿。你说她今天看着很累。\n「预约时段解释好多遍，嗓子快冒烟了。」她说。你刚问是谁没听懂，她便摇头：「隐私留诊所。」\n她以前总想把每次交谈都处理妥当，回家还会想，是不是语气换一下就能让那天轻松一点。\n「我要讲的是我自己。交班了，脑里还在核姓名。」她说。你等了一会儿，她才补上：「累在这儿。」\n她往后靠了一点：「先核一下，我今天说够预约了。想聊自己的拼图，你听我找那块蓝天。」',
    "Later, Priya leaves her badge in her bag and asks if you want to sit. You say she looks tired.\n“Explained appointment slots so many times. Throat’s smoking.” You ask who failed to understand. “Privacy stays at the clinic.”\nShe used to want every conversation handled perfectly. At home she wondered whether a different tone would have made the day easier.\n“I'm talking about me. Handover done, still checking names in my head.” After a pause, she adds, “That's the tiring part.”\nShe leans back. “Quick check: enough appointments for today. My jigsaw now. Hear me hunt for that bit of sky.”",
    '听她讲自己的感受，不问人名',
    'Hear her feelings without asking for names',
    '问她想聊的非工作小事',
    'Ask about something away from work',
  ],
  [
    'priya',
    '随叫随到的人',
    'Always available',
    '普里娅说，镇上有人在她买菜时递来一张写满问题的纸。开头是「反正你最清楚」。\n「你替他看了？」你问。「请先联系前台核预约，我这样答的。」她答得很快，随后却低头拨了拨包上的拉链。\n她刚到这里时很愿意被人需要；有人叫得出名字，比独自回家好。后来名字像变成了服务铃。\n「前台耳机摘了，脑里还在核预约姓名。」她说。你没有替对方找理由，她抬起头，肩膀松开了一点。\n「『现在请走预约。』我要练熟这句。」她说。你没有替对方找理由，普里娅抬起头：「买菜归买菜。」',
    'Priya says someone handed her a page of questions while she was shopping. It began, “You know all about this anyway.”\n“Did you look?” you ask. “Please contact reception to check an appointment. That was my reply.” Quick answer; then she fiddles with the zip on her bag.\nWhen she arrived, being needed felt good. A familiar name beat going home alone. Gradually, her name had become a service bell.\n“Reception headset off. Still checking appointment names in my head.” You offer no excuse for the other person. She looks up, her shoulders easing.\n“‘Please book an appointment.’ Practising that till it sticks.” You offer no excuse for them. Priya looks up. “Shopping is for shopping.”',
    '听她练一句自己想说的拒绝',
    'Hear the refusal she wants to use',
    '说明你来见她，不办事',
    'Say you came to see her, with no errands',
  ],
  [
    'priya',
    '先问过我',
    'Ask me first',
    '普里娅发现你向别人提过，她或许能帮忙看一封信。你说自己只想让那个人少跑一趟。\n「请先核本人意愿，前台也先问再安排。」她说。你解释只是随口一提，她仍看着你：「对方已当预约记下了。」\n你确实没有恶意，也觉得她的话有点重；她却说，自己每次都得替这种好意善后，已经累了。\n你可以承认越过界线，自己收回推荐；也可以坦白你仍觉得反应过重，接受这次谈话可能就此冷下来。\n普里娅没有替你找台阶：「你可以不同意。我的答复是拒接，请走预约。」两个人都听见了对方的不舒服。',
    "Priya discovers you told someone she might look at a letter. You say you only wanted to save that person a trip.\n“Please check with the person first. Reception asks before arranging things too.” You explain it was a passing remark. She looks at you. “They've booked it in their head.”\nYou meant no harm and find her words harsh. She says she is exhausted from cleaning up after this kind of kindness.\nYou can admit crossing a boundary and withdraw the recommendation, or say you find her reaction excessive and accept that the conversation may go cold.\nPriya offers no easy exit. “You can disagree. My answer is a refusal. Please book properly.” Both of you hear the other's discomfort.",
    '承认越界，自己收回推荐',
    'Acknowledge the boundary and withdraw the recommendation',
    '坦白觉得反应过重，承担冷场',
    'Say you find the response excessive and accept the chill',
  ],
  [
    'dave',
    '老板也答错',
    'The landlord gets it wrong',
    '午后的戴夫念出一道问答题，自己先报了答案。你指出题目问的是作者，他答的却是酒名。\n「跨领域得分不行吗？」他问。你说这样人人都能赢，他拍了下手：「生意听着不错。」\n笑过以后，他把题划掉，说有些客人不是来抢答的，却总被他顺手拉进比赛。\n你问不比赛能干什么。他把题册翻到背面，那里记着一串客人推荐的歌，拼写各不相同。\n「先声明，这回不计分。」他说。你还没开口，他自己补上：「老板例外也取消。真是艰难的一天。」',
    'In the afternoon Dave reads a quiz question and supplies the answer himself. You point out it asked for an author; he named a drink.\n“No marks for crossing disciplines?” You say everyone could win that way. He claps. “Promising business model.”\nAfter the laugh, he crosses out the question. Some customers have not come to compete, yet he keeps pulling them into the game.\nYou ask what happens without a contest. He turns to the back of the book, where song requests appear in several different spellings.\n“No points this time.” Before you speak, he adds, “Landlord’s exemption cancelled too. Difficult day for management.”',
    '出一道老板也不会的题',
    'Set a question even the landlord cannot answer',
    '先不抢答，听他说点别的',
    'Skip the quiz and hear something else',
  ],
  [
    'dave',
    '笑声的账单',
    'The cost of a laugh',
    '戴夫在营业本上画了两道线，一道是进账，一道是他觉得必须让每个人高兴的次数。\n「哪道更长？」你问。「第二道没有收据，报不了销。」他说完，下意识等你笑。\n他接手酒吧时怕冷场，谁不笑就再讲一个。后来客人记得他的包袱，他却记不清自己喜不喜欢。\n你问这样不累吗。他说累，但安静下来就会想到空杯子、关门的店，以及还没付的账单。\n戴夫敲敲第二栏：「客人笑了，老板我连哪句真想笑都记不清。」他没再等掌声，把那句实话原样放着。',
    'Dave draws two columns in the takings book: money in, and the times he feels obliged to make everyone happy.\n“Which is longer?” “Second one comes without receipts. Can’t claim it back.” He automatically waits for your laugh.\nWhen he took over, silence frightened him. No laugh meant another joke. Customers remembered his punchlines; he stopped knowing whether he liked them.\nYou ask whether it is exhausting. It is, but quiet makes him think about empty glasses, closed businesses and unpaid bills.\nDave taps the second column. “Guests laughed. The landlord here can’t even remember which bits he found funny.” He waits for no applause, leaving the plain sentence as it is.',
    '问他自己爱听哪种笑话',
    'Ask what actually makes him laugh',
    '让他讲一件不带包袱的事',
    'Ask for something without a punchline',
  ],
  [
    'dave',
    '唱片里的空白',
    'The quiet on the record',
    '夜里过了十点，戴夫把一张老唱片放好，先说「这次老板自己点歌」，请你听完再评价。\n歌声沙哑，前奏还长。他说以前有人陪他听，后来去了别的地方，店里的歌单却再没改过。\n「唱片替我加班，够忠心吧？」他笑。你没接，他也没补第二个笑话，只把音量放低。\n你问他想念的是人还是那时候的自己。他看着转动的唱片：「哎，给老板开个后门，两个答案都收吧。」\n唱片转到安静的一段。戴夫张嘴像要报下一首，随后又闭上；这回没有客人催，他也不用替安静解围。',
    'After ten at night Dave puts on an old record. “Landlord’s own request this time.” Could you hear it out before judging?\nThe voice is rough and the introduction long. Someone used to listen with him, then moved elsewhere. The pub playlist never changed.\n“Record’s doing overtime for me. Loyal staff.” He laughs. You do not pick it up. He adds no second joke, just lowers the volume.\nYou ask whether he misses the person or himself back then. He watches the record turn. “Give the landlord a break, eh? Let him enter both answers.”\nThe record reaches a quiet stretch. Dave opens his mouth as if announcing the next track, then closes it. No customer is rushing him. Silence needs no rescue.',
    '问问那个陪他听歌的人',
    'Ask about the person who listened with him',
    '把唱片听完，不追问过去',
    'Hear the record out without questioning him',
  ],
  [
    'dave',
    '这个梗不接',
    'Not taking that joke',
    '戴夫说，有位常客要他把某个人等信的焦虑编进问答题，理由是「大家都熟，开得起」。\n他拒绝了，对方说他忽然没趣。那桌后来少点了饮料，他看见账单时还是心疼。\n「拿那事逗笑，老板我做不来。少卖几杯，账单可照样来！」他说。这回没把自己说成轻松赢了一场的人。\n你可以支持他当众讲明不拿谁的处境取笑，承担流失客人的风险；也可以建议别公开争执，先保住生意。\n戴夫看着你：「那题老板删定了。你说顾生意，我懂，可听见还是扎得慌。」',
    'Dave says a regular wanted a quiz question about someone’s anxiety waiting for a letter. “We all know each other. They can take it.”\nHe refused and was called humourless. That table ordered fewer drinks. The smaller bill still hurt.\n“Landlord can’t make a joke of that. Sell fewer drinks, though, and the bills still turn up!” He does not call this an easy victory.\nYou can support a public boundary against mocking anyone’s circumstances, risking lost customers, or advise avoiding an open dispute to protect the business.\nDave looks at you. “That question’s deleted. Landlord’s decision. I get protecting the trade, but hearing it still stings.”',
    '支持公开说清边界，接受客人离开',
    'Support a public boundary despite losing customers',
    '建议不公开争执，先保住生意',
    'Advise avoiding a public dispute to protect the pub',
  ],
  [
    'rahman',
    '不进账本的事',
    'Off the books',
    '拉赫曼在柜台里翻账本，一张饼干配方掉了出来。你说原来店里连点心也归库存管理。\n「老朋友，这批我自己烤坏了，放柜台后吃，哪能贴价签卖出去。」他说。\n你问他有没有真正不算账的时候。他用铅笔点点配方，说每样材料都能记，合不合口味却得试。\n他把账本合上，认真争论饼干究竟该脆还是该软，语气比谈进货还郑重，直到自己先笑了。\n「老朋友，脆的还是软的，你选？我站脆的。这盘烤得太脆，倒是全归店主自己了。」',
    'Rahman opens his ledger behind the counter and a biscuit recipe slips out. You suggest even snacks have stock control here.\n“Burnt this batch myself, my friend. Eating it behind the counter. Hardly going to stick a price on it.”\nYou ask whether he ever stops counting. He taps the recipe: ingredients can be measured; whether it tastes good needs trying.\nHe closes the ledger and argues for crisp rather than soft biscuits, more solemnly than he discusses deliveries, until he laughs at himself.\n“Crisp or soft, my friend? I favour crisp. Baked this tray a bit too crisp. All for the proprietor now.”',
    '支持脆饼，争论烤到什么程度',
    'Defend crisp biscuits and debate the bake',
    '坚持软饼，问他肯不肯尝试',
    'Defend soft biscuits and ask him to try',
  ],
  [
    'rahman',
    '没有走的那一年',
    'The year he did not leave',
    '拉赫曼从柜台下找出一张旧店面广告，照片里的招牌还没换。他说那年原打算把店转出去。\n「后来为什么没走？」你问。他说那时早已入籍，原以为办完许多事，就会知道该住哪里。\n广告登出去以后，他却开始认真看每天经过的人，不是看他们买什么，是看自己会不会想念。\n「老朋友，看着老客，我就又把那张广告收了。」他说，又承认也不是每个留下来的日子都开心，有时照样后悔。\n他把广告压在账本底下：「老朋友，舍不得和后悔，我都记得。你想听哪边？开了这么多年店，可有得讲。」',
    'Rahman finds an old shop-sale advert beneath the counter. The sign in its photograph predates the current one. He intended to sell that year.\n“Why didn’t you leave?” He had been a citizen for some time. He thought finishing enough official business would tell him where to live.\nOnce the advert appeared, he began watching the people passing, not what they bought, but whether he would miss them.\n“Saw the regulars, my friend, and put the advert away again.” He admits staying has not made every day happy. Sometimes he still regrets it.\nHe rests the advert beneath the ledger. “Things I’d miss and things I regret, my friend. Remember both. Which shall I tell you? Years of shop stories to choose from.”',
    '问最舍不得哪件日常小事',
    'Ask which everyday detail he would miss',
    '听听他也会后悔的日子',
    'Hear about the days he regrets staying',
  ],
  [
    'rahman',
    '门铃不算邀请',
    'A bell is not an invitation',
    '店门铃响过以后，拉赫曼说自己在家听见同样的声音也会抬头，像漏掉一个客人就算亏损。\n他刚开店时不敢关门，觉得今天少做一点，明天别人就会忘记有这家店，有他这个人。\n「老朋友，那阵我连家里吃饭都算着赶回来开门。」他说。你问什么时候发现的，他指指一张没用过的戏票。\n那次他原想去听演出，临走又接着营业。演出结束了，店也没有多卖什么，他却仍不敢怪自己。\n拉赫曼看着那张废戏票：「老朋友，后来还有演出。那回我守着柜台等客人，连歌都没听上。」',
    'After the shop bell rings, Rahman says he looks up at the same sound at home, as if missing a customer were always a loss.\nWhen he first opened, he feared shutting the door. Do less today and perhaps tomorrow people would forget the shop, and the person in it.\n“Even eating at home, my friend, I was counting the minutes till I could reopen.” You ask when he noticed. He points at an unused concert ticket.\nHe meant to attend, then kept trading instead. The concert ended, the shop sold little extra, and he still could not let himself be angry.\nRahman studies the unused ticket. “Other concerts later, my friend. That night I stayed behind this counter waiting for customers. Missed every song.”',
    '问他现在还想去听什么',
    'Ask what he would like to hear now',
    '承认那张没用的票也是损失',
    'Acknowledge the unused ticket as a loss',
  ],
  [
    'rahman',
    '关门不是结账',
    'Closing is not settling up',
    '拉赫曼准备歇一次店，有位熟客说大家都靠他方便，开店的人怎么能说不在就不在。\n你问能不能只缩短营业。他看着你：「老朋友，预订我都交代了，连票也买了，还要我留柜台后？」\n他怕顾客不再回来，也知道自己早把可能的抱怨提前进货，堆得比货架还满，挤掉了想做的事。\n你可以支持照原计划关门；也可以坦承仍赞成先缩短营业，少损失些收入，接受他觉得你也在劝他别走。\n「老朋友，交代完预订我就关门，票买好了。」他没要你保证生意不受影响，也没把主意收回。',
    'Rahman plans to close for a break. A regular says people depend on his convenience: how can a shopkeeper simply be absent?\nYou ask about shorter hours instead. “Orders sorted, ticket bought, my friend. Still want me behind the counter?” He looks at you.\nHe fears customers will not return. He also stocks possible complaints in advance, higher than the shelves, crowding out what he wants to do.\nYou can support the closure as planned, or admit you still favour shorter hours to limit lost income, accepting that this may sound like another plea to stay.\n“I’ll sort the orders and shut up shop, my friend. Ticket’s bought.” He asks for no guarantee about business and does not withdraw his own plan.',
    '支持按原计划歇店，不附保证',
    'Support the planned closure without promising no losses',
    '建议先缩短营业，接受他不赞成',
    'Suggest shorter hours and accept his disagreement',
  ],
  [
    'lina',
    '画歪的门',
    'The crooked door',
    '莉娜把一张速写转给你看，门是歪的，门边那个人却站得像尺子。她说画反了重点。\n你问门是不是真的歪。她笑：「喂，门很正！等咨询时画的，光看人，墙跑了。」\n你想夸画得像，她却问你先看见什么。你说了一个细节，她立刻把自己的解释收住。\n「拜托，又像读拒签信，替别人猜意思。」她说。纸上的人没有名字，也不需要由她猜出在等什么。\n莉娜把自己的解释咽回去：「你先讲看见什么。拒签以后我最烦别人替我编故事。」',
    'Lina turns a sketch towards you. The door leans; the person beside it stands like a ruler. She says she emphasised the wrong thing.\nYou ask if the real door leans. She laughs. “Hey, door’s fine! Drew it waiting for advice. Watched the person; wall ran off.”\nYou start to praise the likeness, but she asks what you noticed first. You name a detail. She promptly stops explaining her own view.\n“Please, reading a refusal letter again, guessing what someone means.” The person on paper has no name. She need not guess what they are waiting for.\nLina swallows her explanation. “Tell me what you see first. Since the refusal, I hate people inventing my story.”',
    '讲门让你想起的地方',
    'Describe the place the door reminds you of',
    '只谈纸上的颜色和线条',
    'Discuss just the colours and lines',
  ],
  [
    'lina',
    '没画成的城市',
    'The city she did not draw',
    '莉娜翻出一张写了很多地名的纸，只有小镇的名字旁边画着一团擦不干净的灰。\n她说刚来时把这里当作中转，连风景都只画在散纸上，怕买一本厚本子像答应永远留下。\n「后来呢？」你问。她点点灰色那团：「喂，拒签后连 Plan B 都改了！认识的人可装不进箱。」\n她没有把中转说成错误，也不愿别人替她把故乡画成失去的地方。两边都有她没讲完的事。\n她沿着灰色那团比了个圈，没有落笔：「拜托，咨询表能填去向，可填不下我为什么难走。」',
    "Lina unfolds a sheet of place names. Only the town's name has a grey patch beside it that refuses to erase.\nShe first treated this as a stopover, drawing scenery on loose sheets. Buying a thick book felt like promising to stay forever.\n“What happened?” You ask. She taps the grey. “Hey, even Plan B changed after the refusal! People I know won’t fit in that box.”\nShe does not call the stopover a mistake or let others draw home as something lost. There are unfinished stories on both sides.\nShe traces a circle round the grey without marking it. “Please, an advice form has room for my destination, not why leaving is hard.”",
    '问她最初来这里的理由',
    'Ask why she first came here',
    '听现在难以收拾行李的原因',
    'Hear why packing is difficult now',
  ],
  [
    'lina',
    '不能画成答案',
    'No drawing is an answer',
    '莉娜把一封折过的信夹在速写本里，只让你看见边缘。她说那次拒签以后，很久不想碰画笔。\n你问画画不是她放松的办法吗。她说是，可人人叫她「画下来就好了」，好像难受也该交作品。\n「烦死了，画完能退我找律师的车费吗？」她说。你点头，她才继续讲那阵子自己连喜欢的颜色都嫌吵。\n她现在又在画，不是为了证明恢复得不错。你可以听她说那段停笔的日子，也可以聊眼前一条线。\n她把信收回去，速写本仍摊着：「拒签那阵停了多久，今天画不画，都归我挑。这条线就认作线。」',
    "Lina keeps a folded letter inside her sketchbook, showing only its edge. After that refusal, she says, she left her brushes untouched for a long time.\nYou ask whether drawing used to relax her. Yes, but everyone said, “Draw it and you'll feel better,” as if distress required finished work.\n“Infuriating. Will drawing it refund my bus fare to the solicitor?” You nod. She goes on: even her favourite colours felt loud then.\nShe is drawing again, not to prove recovery. You can hear about the time she stopped, or talk about a line in front of you.\nShe puts the letter away, leaving the sketchbook open. “How long I stopped after the refusal, whether I draw today: my choice. That line is a line.”",
    '听她讲不想画的那段日子',
    'Hear about the time she could not draw',
    '只谈眼前一条线，不解释心情',
    'Discuss one line without interpreting her feelings',
  ],
  [
    'lina',
    '别替我装框',
    'Do not frame it for me',
    '莉娜听见有人把她的画介绍成「一个等待留下的人」。你本来想说，对方大概只是想帮忙宣传。\n「喂，补材料是我的事，画的又不是等！」她说，「去留我自己问律师，画里的人又没递申请。」\n她知道去留仍有不确定，也怕拒绝介绍就失去一次展出的机会。但把自己交成一个标题，她不愿意。\n你可以支持她要求改介绍，也可以建议先撤下这次展出，等她自己写好。两边都有她在乎的东西。\n「拒签那封信也不能替我的画起名。」她说。你刚要回答，她又补一句：「拜托，励志标题给我删掉！」',
    'Lina hears her work introduced as “A person waiting to stay”. You were about to say the speaker probably wanted to help publicise it.\n“Hey, the extra documents are my business. I’m not painting waiting! I’ll ask the solicitor about my options. The people in the painting haven’t applied.”\nHer future remains uncertain. Refusing the introduction may cost an exhibition, which frightens her. But she refuses to become a title.\nYou can support demanding a new introduction and keeping the show, or suggest withdrawing until she writes her own. Both cost something she values.\n“That refusal letter doesn’t get to title my paintings either.” Before you answer she adds, “Please, delete that inspirational title!”',
    '支持她要求改介绍，保留展出',
    'Support changing the introduction and keeping the show',
    '支持先撤展，让她自己重写',
    'Support withdrawing until she writes it herself',
  ],
  [
    'gareth',
    '路从脚下认',
    'Learning the round',
    '加雷思说起小镇的路，先左转，再经过低墙，最后才报街名。你问为什么地址总被排在后面。\n「先左转，过矮墙。到了拐角，我才想起查街名。」他说。你照他的话比画，结果把两条巷子叠成了一条。\n他没有笑你，重新从转角讲起，还提醒那块松砖不是路标，修好以后可不能跟着它走。\n你问能不能靠门牌认。他说当然，但住户的名字不是闲聊的地图，信件里的事更不能拿来指路。\n「这回你领，路口等你报方向。」他说完停住，没有按习惯先迈步；路线说得熟，轮到听别人说时还得重新学。',
    'Gareth gives directions left first, low wall next, street name last. You ask why the address always comes afterwards.\n“Left first, past the low wall. Reach the corner, then I check the street name.” You trace his route and somehow fold two lanes into one.\nHe does not laugh, just starts again at the corner. The loose paving slab is not a proper landmark: it might get repaired.\nYou ask about house numbers. Those are fine, he says. Residents’ names are no conversational map, and letters are never directions.\n“Your lead. I’ll wait at the crossing for your directions.” He stops instead of taking his usual first step. Giving familiar directions is one thing; hearing someone else’s takes practice.',
    '跟他认路，只记公共路标',
    'Learn the route using public landmarks',
    '讲自己的路线，让他听听',
    'Describe your own usual route',
  ],
  [
    'gareth',
    '走完以后',
    'After the round',
    '晚些时候，加雷思把空邮包扣好，告诉你今天把一条走熟的路绕了两遍，纯粹是不想马上回去。\n你问家里有什么事。他摇头：「没事。走完整条投递路线，回到自家门口，就只剩钥匙响。」\n他以前以为熟路走久了，人也就自然在这里扎根；后来发现被人认得，并不等于有人知道你寂寞。\n「这句又绕回去了，像我多走那圈。」他皱眉。你说听懂了，他才不再急着把它缩成一句准确的方向。\n「还是绕。到自家门口呢？」他皱眉。你说听懂了，加雷思才不再往回改句子，邮包扣子也终于不必再检查一次。',
    'Later in the evening, Gareth fastens his empty postbag. He walked a familiar road twice today because he did not want to go home yet.\nYou ask whether something is wrong at home. He shakes his head. “Nothing. Finish the round, reach my own door, just the sound of my key.”\nHe thought knowing a round would root him here. Being recognised, he learned, does not mean someone knows you are lonely.\n“Round again with that sentence. Like that extra lap.” He frowns. You say you understand, and he stops trying to reduce it to precise directions.\n“Still roundabout. At my own front door, then what?” He frowns. When you say you understand, Gareth stops revising the sentence. The postbag buckle finally needs no further check.',
    '陪他走一段不送信的路',
    'Walk a stretch with no deliveries',
    '坐下，只听他自己的事',
    'Sit and hear about him alone',
  ],
  [
    'gareth',
    '新路线没有我',
    'A round without me',
    '加雷思拿出一张改过的路线图，几条熟悉的街被划给别的轮次。他说不是坏安排，腿能少走一点。\n「那你为什么不高兴？」你问。「少走三段巷子。」他答完又停住，「那三段也少了等我按门铃的人。」\n他想过退休，第一反应却不是休息，而是以后经过那些门，要拿什么理由停下来打招呼。\n你说可以只是经过。他看着地图，像在检查一条没标明长度的路：「经过，敲门，邮袋放家？没这么走过。」\n他把新路线图折好，没折回旧痕里：「少走那三段，我想自己绕回来。先约好，再敲门。」',
    'Gareth shows you a revised round map. Familiar streets have moved to another run. It is not a bad arrangement: less walking for his legs.\n“Why aren’t you happy?” “Three fewer lanes.” He stops. “Fewer people waiting for my ring in those lanes.”\nHe has thought about retirement. His first thought was not rest, but what excuse he would have to stop at those doors and say hello.\nYou suggest simply passing by. He studies the map like a road with no distance marked. “Pass, knock, postbag at home? Haven’t tried that route.”\nHe folds the revised map without following its old creases. “Those three missing lanes, I’d like to circle back myself. Arrange it first, then knock.”',
    '问工作以外最想走哪条路',
    'Ask which route he wants beyond work',
    '听他讲怕失去的日常',
    'Hear which daily ritual he fears losing',
  ],
  [
    'gareth',
    '这条路谁知道',
    'Who knows this route',
    '加雷思说，有人想请他列出镇上独居住户的地址，好安排关怀。他只给了公开活动的联系方式。\n「邀请贴邮局旁，门牌留我手上。」他说。你担心最需要陪伴的人反而不会看公告，两个人一时没接上话。\n他知道这种担心不是假的，也不愿把熟门熟路变成替别人决定哪扇门应该被敲，哪种安静需要打断。\n你可以支持只发公开邀请；也可以主张他先以自己名义询问熟人是否愿意参加，不交出名单，却要多迈一步。\n加雷思没有马上答应。他说自己也可能需要有人陪，但愿不愿让人知道，仍想由自己先开口。',
    'Gareth says someone requested addresses of residents living alone for a care scheme. He supplied public activity contacts instead.\n“Invitation by the post office. House numbers stay with me.” You worry that those needing company most may not see a notice. For a moment you talk past each other.\nHe knows that concern is real. He does not want knowing the round to mean deciding whose door should be knocked or whose quiet interrupted.\nYou can support public invitations only, or argue he should personally ask acquaintances whether they want to join, sharing no list but taking another step.\nGareth does not immediately agree. He may need company too, he says, but still wants to choose when he tells someone.',
    '支持只公开邀请，不替住户决定',
    'Support public invitations without deciding for residents',
    '建议他以自己名义问熟人，仍不交名单',
    'Urge him to ask acquaintances personally, without sharing a list',
  ],
];
const tenHeartScenes: typeof scenes = [
  [
    'margaret',
    '失败也记一笔',
    'Failures go in too',
    '玛格丽特的新种植本没有工整日历，封面写着「吃到了什么」，背面写着「别再干这事」。\n她翻开给你看，先记豆架搭得够不够着。你们对菜地大小还可能有分歧，旧照片照样夹着。\n「得了，我明年还可能改主意！」她说。「明年又搭高呢？」你问。她瞪你一眼：「那就再拆，木头又没上锁！」\n她决定每次看见你，都问一件种成或种坏的事，答案不必听着体面，也不替对方找借口。\n她把本子合起来：「谁先讲？烂苗也算！我那盆番茄还够骂到下回呢。」',
    'Margaret’s new notebook has no neat calendar. The front says “Things I ate”; the back says “Don’t do this again”.\nShe shows you the entry on reaching the beans. You may still disagree about the plot’s size. The old photograph stays tucked inside.\n“Oh, I might change my mind again next year!” “Build it higher next year?” you ask. She glares. “Then down it comes again. Nobody locked the timber!”\nShe proposes asking about one success or failure whenever you meet. No respectable-sounding answers required, and no excuses supplied for each other.\nShe shuts the notebook. “Who goes first? Rotten seedlings count! That tomato tray will keep me grumbling till next time.”',
    '先讲自己最近的失手',
    'Tell her your latest mistake first',
    '让她先讲种坏的东西',
    'Ask her to start with a failed crop',
  ],
  [
    'ade',
    '不提交的茶歇',
    'A break with nothing due',
    '阿德的茶歇提醒换了名字，叫「暂不处理」。他给你看完便扣上手机，连倒计时也没设。\n「有消息？」你问。他摇头：「续签信还没回（又查过了），同事那封倒回了。」\n你问他会不会又把休息做成新任务。他想了想：「可能会（差点又设闹钟），上班的铃声听够了。」\n你们约定碰面先问要不要谈工作，对方说不要，就不再补一句「顺便问个事」。\n阿德把手机推远一点：「续签清单搁着，茶歇聊什么？」他看着你，认真等一句可以不是「都行」的回答。',
    'Ade has renamed his tea-break reminder “Not dealing with it now”. He shows you, turns the phone face down and sets no timer.\n“Any news?” you ask. He shakes his head. “No renewal reply (checked again). Colleague’s email arrived, though.”\nYou ask whether he is turning rest into another task. “Might do (nearly set an alarm again). Heard enough bells at work.”\nYou agree to ask whether the other wants to discuss work first. A no will not be followed by “Just one quick thing”.\nAde moves the phone farther away. “Renewal checklist aside. What shall we chat about at tea break?” He waits properly for an answer that need not be “Anything’s fine”.',
    '先说这次不谈工作',
    'Say you do not want work talk today',
    '让他先问，不替你猜答案',
    'Let him ask rather than guess your answer',
  ],
  [
    'helen',
    '先问一句',
    'One question first',
    '海伦给自己做了一张小书签，上面没有名言，只写着「你想让我听，还是一起想办法」。\n她说书签也不是万能的，尤其当她急着证明自己有用时，还是会忘。你说那就提醒她。\n「你会怎么提醒？可别又像交作业！」她笑。你问这句话要不要修改，她摆摆手：「这句保留原稿，行吗？」\n你们约定以后碰面都可以问一次，不用先把心事整理成漂亮的段落，也允许半途换答案。\n海伦把书签夹好，忽然说：「今天换我找开头。你能等我把这一句想好吗？」她望着你，没有用老师的笑盖过去。',
    'Helen has made herself a bookmark. No quotation, just “Would you like me to listen, or think it through with you?”\nShe says it is no cure-all. She still forgets when eager to prove she is useful. You offer to remind her.\n“How will you remind me? Please don’t make it homework!” She laughs. You ask whether that sentence needs correcting. She waves it off. “Can I keep my original wording on that one?”\nYou agree either can ask when you meet. Feelings need no polished paragraphs, and the answer can change halfway through.\nHelen marks her place. “My turn to find an opening today. Will you wait while I work out this sentence?” She looks at you without covering it with a teacher’s smile.',
    '今天先听我说，不找办法',
    'Ask her just to listen today',
    '请她讲自己的事，你来听',
    'Invite her to speak while you listen',
  ],
  [
    'priya',
    '可以回答不要',
    'No is an answer',
    '普里娅见到你，先问：「先确认，今天聊吗？」你把同样的问题问回去，她想了想，说想歇着。\n你们坐了一会儿，先前的分歧未必全讲通了，但这次她说不要，你没有立刻追问或替她找原因。\n「以前静下来，我就想叫下一位。」她说。你问现在呢。她看看你：「认得你了，省掉核姓名那步。」\n你们约定以后见面仍先问一句；要是有人说不要，就可以一起安静，也可以各自去做自己的事。\n她后来开口说：「这回请先坐着，前台该交班了。想走，跟我说声。」两个人都省下了赔一场更好谈话的力气。',
    "Priya greets you. “Quick check: talking today?” You ask her the same. She considers it and says she'd like a rest.\nYou sit a while. Your old disagreement may remain unresolved, but when she declines, you neither press her nor supply a reason.\n“Used to want to call the next person when things went quiet.” What about now? “Know your name. Can skip that check.”\nYou agree to keep asking first when you meet. If either declines, you can sit quietly together or each do your own thing.\nShe eventually says, “Please sit a while this time. Reception should hand over. Tell me if you want to go.” Neither has to spend energy making up a better conversation.",
    '留下来，安静也算相处',
    'Stay and let quiet count as company',
    '先告辞，不追问什么时候聊',
    'Say goodbye without asking when she will talk',
  ],
  [
    'dave',
    '老板暂停营业腔',
    'The host takes a break',
    '戴夫翻开新题册，第一页竟然没有题，只有一句「老板也可以不知道」。你说这像作弊声明。\n「各位，这是老板的免责条款！」他接得很快，笑完却没有再把声音放到能盖过全场的程度。\n他仍担心收入，也未必赞同你处理客人的办法，只是不再把每次沉默都当成必须抢救的事故。\n你们约好以后见面可以说一句「先别主持」，说过以后，戴夫就按一个普通人的音量接着聊。\n戴夫看看题册，又看看你：「要用新暗号，现在就能试。老板也有休息权，虽然还没写进饮料单。」',
    'Dave opens his new quiz book. Its first page has no question, only “The landlord is allowed not to know”. You call it a cheating notice.\n“Folks, a disclaimer for the landlord!” The reply comes quickly, but afterwards he does not raise his voice to fill the whole room.\nHe still worries about takings and may disagree with your approach to customers. He no longer treats every silence as an emergency he must rescue.\nYou agree that either can say “No hosting for a minute”. Dave will then carry on at an ordinary person’s volume.\nDave looks from the quiz book to you. “Try the new phrase whenever you like. The landlord gets a break too. Hasn’t reached the drinks menu yet.”',
    '说一次「先别主持」',
    'Try “No hosting for a minute”',
    '请老板回答一道没把握的题',
    'Ask the landlord a question he is unsure about',
  ],
  [
    'rahman',
    '自己的那一栏',
    'A column of his own',
    '拉赫曼的账本多了一栏，标题叫「店主不在」。下面不是营业损失，而是他真正出门做过的事。\n你说听着仍像记账。他笑：「老朋友，拿惯账本了。这回写演出，价钱都写漏，倒把座位记住了。」\n旧店面广告还在，没被当成留下的誓言。他说以后也可能搬走，只是不再等一本证件替他想清楚。\n你们约定见面时，他可以先讲一件店外的事，你也可以回报一件不用证明有价值的小事。\n拉赫曼合上账本：「老朋友，谁先讲店外的事？演出那乐手把琴弓掉了。」他没摸计算器，等你想一件。',
    'Rahman’s ledger has a new column: “Proprietor absent”. It records what he actually did outside, rather than lost sales.\nYou say it still sounds like bookkeeping. He smiles. “Used to a ledger, my friend. Wrote down the concert, forgot the price, remembered the seat.”\nThe sale advert remains, without becoming a vow to stay. He may move someday. He no longer expects a document to decide that for him.\nYou agree he can begin meetings with something beyond the shop. You can bring something small that needs no proof of value in return.\nRahman closes the ledger. “Who starts with life outside, my friend? Musician at my concert dropped his bow.” He leaves the calculator alone and waits while you think.',
    '让他先讲店外的生活',
    'Ask him to start with life outside the shop',
    '先讲自己的无用小事',
    'Start with your own small, useless pleasure',
  ],
  [
    'lina',
    '画外也在生活',
    'Life outside the drawing',
    '留下来的莉娜给你看新画，第一张没有小镇标志，也没有信封，只画了一只看着很凶的梨。\n「它拒绝被吃？」你问。「它就是梨！」她笑起来，「喂，拒签那段就别替梨配了，你付旁白钱啊？」\n她仍会为以后担心，但不再把每一张画都做成感谢留下的证明，也不要求自己永远喜欢这里。\n你们约定以后偶尔互相画一样眼前的东西，不问进度，不评好坏；想停一次，也不用解释。\n她把梨的画转正：「下次半只梨也成。拜托，Plan B 别套梨身上，我这只就酸。」',
    'Having stayed, Lina shows you a new painting. No town symbol or envelope. Just a rather fierce-looking pear.\n“Refusing to be eaten?” you ask. “It’s a pear!” She laughs. “Hey, spare the pear my refusal story. Are you paying for that commentary?”\nShe still worries about the future. Each picture no longer has to prove gratitude for staying, nor must she always like the town.\nYou agree to draw something in front of you for each other occasionally. No progress checks or marks; skipping once needs no explanation.\nShe straightens the pear picture. “Half a pear next time will do. Please, leave Plan B off the pear. Mine’s just sour.”',
    '画自己的桌子，按约定回一幅',
    'Draw your table in reply',
    '请她画一样普通得不用解释的东西',
    'Ask for something ordinary that needs no explanation',
  ],
  [
    'gareth',
    '不用投递的路',
    'A walk without deliveries',
    '加雷思给你指一条路，起点不是邮筒，终点也不是哪户门前。他说这是自己想走的一段。\n你问为什么选这里。「过桥就见树。邮袋放家，回头走河边。」他说完，又想了想：「这段能并排走。」\n他仍会担心退休以后的日子，但不再要求每次停步都有工作理由，也开始主动约人一起走。\n你们约定见面时先问想往哪儿，答案可以临时改；要是只想坐着，加雷思也不拿步数算输赢。\n他把路线图收好，抬头等你：「到路口了。左还是右，你定？」旁边没有催着投递的信，脚步不必先替谁作答。',
    'Gareth points out a route with neither a postbox at the start nor a resident’s door at the end. It is simply a stretch he wants to walk.\nYou ask why this one. “Trees past the bridge. Postbag at home. Back along the river.” He thinks. “Room to walk side by side here.”\nHe still worries about life after retirement. He no longer needs a work reason for every stop and has begun inviting people out himself.\nYou agree to ask which direction you feel like taking. Answers may change. Sitting is fine; Gareth will not judge by the step count.\nHe puts away the map and looks up. “At the crossing. Left or right? You choose?” No letters hurry him. His feet need not answer on anyone’s behalf.',
    '这回让他带路，走他想走的',
    'Let him lead along the route he wants',
    '提出自己的方向，一起改路线',
    'Suggest your direction and change the route together',
  ],
];
export const heartEvents: GameEvent[] = scenes.map(
  ([npc, title, titleEn, zhCN, en, first, firstEn, second, secondEn], i) => {
    const level = [2, 4, 6, 8][i % 4];
    const friend =
      npc === 'margaret'
        ? 'friend-garden'
        : npc === 'ade'
          ? 'friend-neighbour'
          : npc === 'helen'
            ? 'friend-library'
            : `friend-${npc}`;
    return {
      id: `heart-${npc}-${level}`,
      title: text(title, titleEn),
      text: text(zhCN, en),
      weight: 1,
      once: true,
      channel: `npc:${npc}`,
      speaker: npc,
      heart: { npc, hearts: level },
      choices: [
        {
          id: 'stay',
          label: text(first, firstEn),
          sets: level === 2 ? [friend] : [],
          effects: [
            {
              type: 'stat',
              key: ['margaret', 'priya', 'gareth'].includes(npc)
                ? 'health'
                : npc === 'ade'
                  ? 'career'
                  : 'english',
              delta: b.heartHelp,
            },
            { type: 'friendship', npc, delta: b.talkFriendship },
          ],
        },
        {
          id: 'help',
          label: text(second, secondEn),
          sets: level === 2 ? [friend] : [],
          effects: [
            { type: 'stat', key: 'mood', delta: b.heartMood },
            { type: 'friendship', npc, delta: b.talkFriendship },
          ],
        },
      ],
    };
  },
);

for (const [
  npc,
  title,
  titleEn,
  zhCN,
  en,
  first,
  firstEn,
  second,
  secondEn,
] of tenHeartScenes) {
  const friend =
    npc === 'margaret'
      ? 'friend-garden'
      : npc === 'ade'
        ? 'friend-neighbour'
        : npc === 'helen'
          ? 'friend-library'
          : `friend-${npc}`;
  heartEvents.push({
    id: `heart-${npc}-10`,
    title: text(title, titleEn),
    text: text(zhCN, en),
    weight: 1,
    once: true,
    channel: `npc:${npc}`,
    speaker: npc,
    heart: { npc, hearts: 10 },
    requires:
      npc === 'lina'
        ? [friend, 'lina-heart-8-shared', 'lina-stayed']
        : [friend],
    choices: [
      {
        id: 'stay',
        label: text(first, firstEn),
        effects: [
          { type: 'stat', key: 'mood', delta: b.heartMood },
          { type: 'friendship', npc, delta: b.talkFriendship },
        ],
        sets: [`heart-${npc}-10-shared`],
      },
      {
        id: 'help',
        label: text(second, secondEn),
        effects: [
          { type: 'stat', key: 'health', delta: b.heartHelp },
          { type: 'friendship', npc, delta: b.talkFriendship },
        ],
        sets: [`heart-${npc}-10-shared`],
      },
    ],
  });
}
for (const choice of heartEvents.find((event) => event.id === 'heart-lina-8')!
  .choices)
  choice.sets!.push('lina-heart-8-shared');

export const townHeartLetters: GameEvent[] = [
  {
    id: 'letter-lina-10',
    title: text('寄来的半幅画', 'A drawing from elsewhere'),
    text: text(
      '莉娜寄来街景，折起的半面画着新桌子。「另一半你画！喂，画歪照寄，邮票可贵了。」她在背面认真写了自己的介绍。',
      'Lina sends a street sketch, her new table on one folded half. “Your half next! Hey, crooked ones still get posted. Stamps cost money.” Her own introduction is written on the back.',
    ),
    weight: 1,
    once: true,
    channel: 'letter',
    speaker: 'lina',
    requires: ['lina-left', 'lina-heart-8-shared'],
    choices: [
      {
        id: 'draw',
        label: text(
          '画上自己的桌子寄回去',
          'Draw your own table and send it back',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: b.heartMood }],
        sets: ['lina-yearly-drawing'],
      },
      {
        id: 'write',
        label: text(
          '写信告诉她下一幅画什么',
          'Write about what you will draw next',
        ),
        effects: [{ type: 'stat', key: 'health', delta: b.heartHelp }],
        sets: ['lina-yearly-drawing'],
      },
    ],
  },
];

heartEvents.push(...familyHeartEvents);

const lina = npcs.find((n) => n.id === 'lina')!;
lina.lines[1].forbids = ['lina-stayed'];
lina.lines.push({
  id: 'lina-stayed',
  requires: ['lina-stayed'],
  text: text(
    '留下了，喂，拒签后那只旧包终于能歇。',
    'Staying. Hey, that old bag from the refusal days can finally rest.',
  ),
});

for (const npc of npcs)
  npc.lines.push(
    ...(festivalDialogue[npc.id] ?? []).map(({ festival, text }) => ({
      id: `${npc.id}-festival-${festival}`,
      festival,
      text,
    })),
  );

margaretLines.push({
  id: 'margaret-recent-community-lunch',
  requires: ['quarter-community-lunch-followup'],
  text: {
    zhCN: '得了，上季聚餐那张合照！我闭着眼还攥着叉子。',
    en: 'That lunch photo from last season! Eyes shut, still clutching my fork.',
  },
});

// Scene-specific dialogue conditions are applied by stable id.
const dialogueConditions: Record<string, Partial<Npc['lines'][number]>> = {
  'priya-4': { dayKinds: ['weekend'] },
  'ade-21': { dayKinds: ['weekend', 'special'] },
  'margaret-1': { when: [{ minuteMax: 720 }] },
  'ade-1': { dayKinds: ['workday'], when: [{ minuteMax: 720 }] },
  'helen-1': { when: [{ minuteMax: 720 }] },
  'ade-10': {
    dayKinds: ['workday'],
    weather: ['sunny'],
    when: [{ minuteMin: 720, minuteMax: 840 }],
  },
  'ade-24': { when: [{ minuteMin: 720, minuteMax: 840 }] },
  'helen-36': { when: [{ minuteMin: b.eveningClass }] },
  'priya-daily-25': { heartsMin: 2, dayKinds: ['weekend'] },
  'priya-daily-34': { heartsMin: 4 },
  'rahman-daily-35': { heartsMin: 4 },
  'lina-4': { heartsMin: 2 },
  'lina-daily-35': { heartsMin: 4 },
  'gareth-daily-21': { requires: ['friend-gareth'] },
  'rahman-daily-22': { requires: ['friend-rahman'] },
  'gareth-daily-31': { season: 1 },
  'priya-daily-28': { when: [{ visaMonthsLeftMax: b.renewalWindowMonths }] },
  'dave-daily-28': { when: [{ visaMonthsLeftMax: b.renewalWindowMonths }] },
  'gareth-daily-28': { when: [{ visaMonthsLeftMax: b.renewalWindowMonths }] },
  'rahman-daily-27': { when: undefined },
  'rahman-daily-28': { when: [{ visaMonthsLeftMax: b.renewalWindowMonths }] },
};
for (const id of [
  'ade-2',
  'ade-3',
  'ade-5',
  'ade-7',
  'ade-8',
  'priya-1',
  'priya-2',
  'priya-3',
  'priya-5',
  'priya-daily-1',
  'priya-daily-2',
  'priya-daily-3',
  'priya-daily-5',
  'priya-daily-6',
  'priya-daily-8',
  'priya-daily-16',
])
  dialogueConditions[id] = { ...dialogueConditions[id], dayKinds: ['workday'] };
for (const id of [
  'priya-5',
  'rahman-2',
  'dave-5',
  'helen-9',
  'margaret-25',
  'gareth-daily-8',
])
  dialogueConditions[id] = { ...dialogueConditions[id], weather: ['rain'] };
for (const npc of npcs) {
  for (const line of npc.lines) {
    Object.assign(line, dialogueConditions[line.id]);
    if (line.festival === 'bonfire-night')
      line.when = [...(line.when ?? []), { minuteMin: b.bonfireStart }];
    if (line.id === 'helen-festival-christmas-market')
      line.when = [{ minuteMin: 960 }];
  }
}
const heartConditions: Record<string, GameEvent['when']> = {
  'heart-ade-2': [{ dayKind: 'workday' }, { minuteMin: 540, minuteMax: 1019 }],
  'heart-ade-4': [{ dayKind: 'workday' }, { minuteMin: 540, minuteMax: 1019 }],
  'heart-ade-6': [{ dayKind: 'workday' }, { minuteMin: 540, minuteMax: 1019 }],
  'heart-ade-8': [{ dayKind: 'workday' }, { minuteMin: 540, minuteMax: 1019 }],
  'heart-ade-10': [{ dayKind: 'workday' }, { minuteMin: 540, minuteMax: 1019 }],
  'heart-priya-4': [{ minuteMin: 1020 }],
  'heart-dave-2': [{ minuteMin: 720 }],
  'heart-dave-6': [{ minuteMin: 1320 }],
  'heart-rahman-2': [{ minuteMin: 600 }, { minuteMax: 1079 }],
  'heart-rahman-4': [{ minuteMin: 600 }, { minuteMax: 1079 }],
  'heart-rahman-6': [{ minuteMin: 600 }, { minuteMax: 1079 }],
  'heart-rahman-8': [{ minuteMin: 600 }, { minuteMax: 1079 }],
  'heart-rahman-10': [{ minuteMin: 600 }, { minuteMax: 1079 }],
  'heart-gareth-4': [{ minuteMin: 1080 }],
  'heart-helen-8': [{ minuteMin: 720, minuteMax: 1080 }],
};
for (const event of heartEvents)
  if (heartConditions[event.id]) event.when = heartConditions[event.id];

const lineCopy: Record<string, Text> = {
  'dave-1': text(
    '题目锁好了，钥匙没找到。公平竞赛，连我也偷看不了。',
    "Questions locked away. Key lost. Fair play; even I can't peek.",
  ),
  'dave-daily-9': text(
    '有人拿答题纸当购物单。好歹有几题答得上。',
    'Someone used a quiz sheet for shopping. At least they answered a few.',
  ),
  'rahman-daily-18': text(
    '周末报纸卖得早，那叠我特意留着，老客订好的。',
    "Papers go early at weekends. Saved that stack specially. Regulars' orders.",
  ),
  'gareth-daily-18': text(
    '周末散步也拐邮筒那边。走过头才想起休班。',
    "Even weekend walks turn by the postbox. Pass it before remembering I'm off.",
  ),
  'priya-daily-25': text(
    '周末绕池塘？我想找那只绿头鸭的拼图。',
    'Pond this weekend? Looking for a jigsaw with that green-headed duck.',
  ),
};
for (const npc of npcs)
  for (const line of npc.lines)
    if (lineCopy[line.id]) line.text = lineCopy[line.id];
heartEvents.find((e) => e.id === 'heart-helen-4')!.title.en =
  'Teachers look for words too';
heartEvents.find((e) => e.id === 'heart-helen-8')!.title.en =
  'Not your practice exercise';

for (const npc of npcs)
  npc.lines.push(
    ...(townDialogue[npc.id] ?? []),
    ...(everydayDialogue[npc.id] ?? []),
  );
for (const event of heartEvents) {
  const flag = `heart-${event.heart!.npc}-${event.heart!.hearts}-shared`;
  if (
    townDialogue[event.heart!.npc]?.some((line) =>
      line.requires?.includes(flag),
    )
  )
    for (const choice of event.choices) choice.sets!.push(flag);
}

const introductions: Record<string, Text> = {
  margaret: text(
    '我是玛格丽特，退休了，常在菜地。别碰那袋土，破了。',
    "Margaret. Retired. Usually at the allotment. Mind that compost bag; it's split.",
  ),
  ade: text(
    '我是阿德，在镇上上班。待办：认识你。这项完成了。',
    "Ade. I work in town. Task: meet you. That one's done.",
  ),
  helen: text(
    '我是海伦，教英语。你想怎么称呼？我先记准。',
    "I'm Helen. I teach English. What do you like to be called?",
  ),
  priya: text(
    '我是普里娅，诊所接待。姓名请报慢些，我记。',
    "Priya, clinic reception. Name slowly, please. I'll note it.",
  ),
  dave: text(
    '我是戴夫，开酒吧的。先认识人，抢答铃待会儿再按。',
    'Dave. I run the pub. Meet people first. Buzzer later.',
  ),
  rahman: text(
    '我是拉赫曼，街角开店。来，老朋友，看看想喝哪种茶？',
    'Rahman, shop on the corner. Come in, my friend. What sort of tea takes your fancy?',
  ),
  lina: text(
    '我是莉娜。拒签后的办法还在找，先陪我喝咖啡。',
    "I'm Lina. Still finding a way through a visa refusal. Coffee with me first.",
  ),
  gareth: text(
    '我是加雷思，送信的。先认名字，门牌以后再认。',
    'Gareth. I deliver the post. Name first. House number later.',
  ),
};
for (const npc of npcs.filter((person) => !person.characters))
  npc.lines.push({
    id: `${npc.id}-intro`,
    text: introductions[npc.id],
    once: true,
  });

// Recent circumstances use the current season; permanent memories stay separate.
const recentCopy: Record<string, [string, string][]> = {
  margaret: [
    [
      '刚办完续签？得了，茶我泡！种子袋替你挪开。',
      "Renewal done? Right, I'll make tea! Move my seed packets for you.",
    ],
    [
      '加薪了？好啊！带块蛋糕，我这儿只有芜菁。',
      "Pay rise? Lovely! Bring cake. All I've got is turnips.",
    ],
    [
      '换工作了？先认新同事，我这块地自己锄得动！',
      'New job? Get to know the people. I can hoe my own plot!',
    ],
    [
      '英语过了！来念这袋花名，我眼镜又落小屋了。',
      'Passed English! Read this flower name. Left my glasses in the shed again.',
    ],
    [
      'Life in the UK 过了？题册合上，坐下吃口热的。',
      'Passed Life in the UK? Book closed. Sit and eat something hot.',
    ],
    [
      '刚回来？瞧，苗蹿高了！你行李还没它长得快。',
      'Back already? Look how those seedlings shot up! Faster than you can unpack.',
    ],
    [
      '钱紧？我有旧盆！洗得腰都酸了，你正好拿走。',
      'Short of money? Got old pots! Washed them till my back ached. Take some.',
    ],
    [
      '今天难受？坐我这园艺凳，先让我骂完这鬼风！',
      'Rough day? Take my gardening stool. Let me finish cursing this wind!',
    ],
    [
      '最近敢嫌我酱酸了？好！总算有人说实话。',
      'You dare call my jam sour now? Good! Someone finally tells the truth.',
    ],
  ],
  ade: [
    [
      '续签办完了？我想庆祝（先合上材料夹），去吃咖喱吧。',
      "Renewed? I'd celebrate (close the folder first). Curry?",
    ],
    [
      '加薪确认了？祝贺（午饭还带着），先给你腾个位。',
      "Pay rise confirmed? Congratulations (still brought lunch). I'll make room.",
    ],
    [
      '新工作要记密码（我忘过），你想先试哪条通勤路？',
      'New job means a password (forgot mine once). Which commute to try first?',
    ],
    [
      '英语过了！我想请客（咖喱那家），你把时间定一下。',
      'English passed! My treat (the curry place). Pick a time.',
    ],
    [
      'Life in the UK 过了？清单少一项（先别添新的）。',
      'Passed Life in the UK? One task gone (leave it gone for now).',
    ],
    [
      '回来了，先休息（我差点问工作），路上累不累？',
      'Back! Rest first (nearly asked about work). Tiring journey?',
    ],
    [
      '钱紧就合着带午饭（我多煮），你留个盒子给我。',
      "Money tight? Joint lunches (I'll cook extra). Leave me a box.",
    ],
    [
      '今天很差啊？我的报表先合上（这回真的），你说吧。',
      'Rough day? Report closed (really, this time). Tell me.',
    ],
    [
      '现在敢当面讲了（报销那张），我其实早就烦透了。',
      "Can say it to you now (that expenses form). I'm fed up with it.",
    ],
  ],
  helen: [
    [
      '刚续签完？哪张表最绕口？我想拿来练长句。',
      "Renewal done? Which form had the knottiest sentence? I'd like it for practice.",
    ],
    [
      '升职了！你怎么解释新职位？借我一句当例句？',
      'Promoted! How do you explain the new role? May I borrow that as an example?',
    ],
    [
      '新岗位哪个词最怪？我学生连「欢迎加入」都抄错过。',
      'Oddest word in the new job? A student once even copied welcome aboard wrong.',
    ],
    [
      '英语过了！你最满意哪句？我把它写进下堂课？',
      'Passed English! Proudest of which sentence? May I use it next lesson?',
    ],
    [
      'Life in the UK 过了？哪题措辞最绕？给我看看。',
      'Passed Life in the UK? Which question was worst worded? Show me.',
    ],
    [
      '刚回来，哪种声音最想念？我回来先听不惯门铃。',
      'Back again. Which sound did you miss? My doorbell sounded odd when I returned.',
    ],
    [
      '钱紧时怎么拒绝邀约？「改天」我上回说得太含糊。',
      "How do you turn down invitations when money's tight? My maybe another day was too vague.",
    ],
    [
      '今天难受，哪句话惹的？或者我给你念段侦探小说？',
      'Rough day. Was something said? Or shall I read you a bit of detective fiction?',
    ],
    [
      '现在敢考倒我了？来，出个词，我先合上词典。',
      'Ready to stump me now? Give me a word. Dictionary closed first.',
    ],
  ],
  priya: [
    [
      '续签办完了？先确认，水要温的凉的？嗓子讲干了吧。',
      'Renewal done? Quick check: warm water or cold? Throat dry from all that talking?',
    ],
    [
      '加薪啦？我庆祝就买拼图，你想买哪样？',
      "Pay rise? I'd celebrate with a jigsaw. What would you pick?",
    ],
    [
      '新工作开始了？先确认，同事姓名记住几个？',
      "New job started? Quick check: how many colleagues' names so far?",
    ],
    [
      '英语考过啦！我要用接电话的正式语气说：恭喜！',
      'English passed! Let me use my proper telephone voice: congratulations!',
    ],
    [
      'Life in the UK 过了？拼图桌借你放杯庆功茶。',
      'Passed Life in the UK? Space on my jigsaw table for your celebratory tea.',
    ],
    [
      '回来了？先确认，行李齐了？我收包也常漏耳机。',
      'Back? Quick check: all bags here? I keep leaving my headset behind.',
    ],
    [
      '钱紧？我带茶包，拼图桌旁的椅子随便坐。',
      "Money tight? I've got teabags. Help yourself to a chair by the jigsaw.",
    ],
    [
      '今天很难受？先坐这边，我把耳机收了，听你讲。',
      "Rough day? Sit here. I'll put the headset away and hear you out.",
    ],
    [
      '最近一看见你就想聊拼图，预约用语都省了。',
      'See you lately and start talking jigsaws. Skip the appointment language.',
    ],
  ],
  dave: [
    [
      '续签忙完啦！各位，这位刚从文件山下山，喝什么？',
      "Renewal done! Folks, this one's climbed down Paperwork Mountain. What'll you have?",
    ],
    [
      '加薪啦？老板本想提价——开玩笑，笑话照旧免费！',
      'A pay rise? The landlord was about to put prices up—kidding! Jokes are still free.',
    ],
    [
      '换工作啦？下班还顺路来吗？那张椅子我给你留！',
      "New job! Still on your route home? I'll keep that chair!",
    ],
    [
      '英语过了！各位加一道听力：老板这笑话冷不冷？',
      "Passed English! Bonus listening round, folks: how terrible was the landlord's joke?",
    ],
    [
      'Life in the UK 过啦？来，挑战本店饼干盲猜！',
      'Passed Life in the UK? Right, time for our mystery biscuit challenge!',
    ],
    [
      '回来啦！各位，远行队员归队，外地笑话带了吗？',
      "You're back! Folks, our travelling teammate returns. Brought any jokes from away?",
    ],
    [
      '钱紧？来杯水！老板欠你上回的冷笑话，还没还清。',
      'Money tight? Water it is! The landlord still owes you for that last terrible joke.',
    ],
    [
      '今天糟透啦？坐吧，我把音乐关掉，先喝一口热的！',
      'Rotten day? Sit, music off. Something hot first!',
    ],
    [
      '你现在连汤咸了都直说，老板这次真得少放一勺！',
      'You tell me when the soup is salty now. Boss has to use one spoon less!',
    ],
  ],
  rahman: [
    [
      '续签忙完了，老朋友，我给你留了块刚到的薄饼。',
      'Renewal done, my friend. Saved you a flatbread from the fresh delivery.',
    ],
    [
      '加薪了？老朋友，尝尝新进的茶，先让我沾点喜气。',
      'A rise, my friend? Try the new tea. Let the shop share some of that good news.',
    ],
    [
      '换工作了？通勤还经过小店吗，老朋友，面包给你留？',
      'New job? Still passing the shop, my friend? Shall I save your bread?',
    ],
    [
      '英语过了，老朋友！来，念念我这念不顺的新茶名。',
      "Passed English, my friend! Help me pronounce this new tea name I've been stumbling over.",
    ],
    [
      'Life in the UK 过了？老朋友，我那本旧题书还压货单呢。',
      "Passed Life in the UK, my friend? My old quiz book's still weighing down delivery sheets.",
    ],
    [
      '刚回来，老朋友！旅途的茶好喝吗？给小店推荐一款。',
      'Back again, my friend! Good tea on your travels? Recommend one for the shop.',
    ],
    [
      '钱紧的话，老朋友，米有散装，我给你称今天够吃的。',
      "If money's tight, my friend, I've got loose rice. I'll weigh enough for today.",
    ],
    [
      '今天难受？老朋友，坐柜台后，我给你倒杯自己留的茶。',
      'Rough day, my friend? Sit behind the counter. Have some of the tea I keep for myself.',
    ],
    [
      '老朋友，最近敢跟你聊卖店的旧打算了，货单先放放。',
      'My friend, lately I can tell you about that old plan to sell up. Delivery sheets can wait.',
    ],
  ],
  lina: [
    [
      '续签忙完啦？喂，文件夹先合上，我要画你喝咖啡。',
      'Renewal done? Hey, shut the folder. Want to sketch you having coffee.',
    ],
    [
      '加薪了！庆功别买我这块干蛋糕，换家店！',
      'Pay rise! celebrate somewhere else. Not with this dry cake!',
    ],
    [
      '换工作啦？旧工位那张画记得拿，别白送他们。',
      "New job? take that drawing off your old desk. Don't leave them a freebie.",
    ],
    [
      '英语过了！喂，替我跟咖啡师说蛋糕太干，练口语！',
      "English passed! Hey, tell the barista this cake's dry. Speaking practice!",
    ],
    [
      'Life in the UK 过了？题册翻面，借我画猫！',
      'Passed Life in the UK? Turn the practice sheet over. Cat sketch for me!',
    ],
    [
      '回来了？先讲路上有什么怪招牌，我要画！',
      'Back? tell me the odd shop signs first. I want to draw them!',
    ],
    [
      '钱紧就点一杯，喂，我纸还够，空杯也能画。',
      "Money tight, one coffee then. Hey, paper's plentiful. Can draw an empty cup.",
    ],
    [
      '今天心情很烂？来，陪我骂这盒又涨价的颜料！',
      'Rotten mood? Come swear at this paint box with me. Price went up again!',
    ],
    [
      '敢给你看未完稿了，咖啡别往边上搁啊。',
      'Showing you unfinished work now. coffee away from the edge!',
    ],
  ],
  gareth: [
    [
      '续签办完，材料夹好。回家过桥左拐，我走这边。',
      'Renewal done. Papers clipped. Left across the bridge for home. My way too.',
    ],
    [
      '加薪了？带你绕面包店庆祝，过邮局右拐。',
      'Pay rise? Celebratory bakery detour. Right past the post office.',
    ],
    [
      '新通勤先认一遍。过桥左转？我送信走到那路口。',
      'Learn the new commute. Left after the bridge? My round reaches that crossing.',
    ],
    [
      '英语过了！替我念这新街名，我总和隔壁巷混。',
      'Passed English! Read this new street name. I keep confusing it with the next lane.',
    ],
    [
      'Life in the UK 过了？庆祝走河边，邮袋先放下。',
      'Passed Life in the UK? Celebration along the river. Put the postbag down first.',
    ],
    [
      '回来了？从车站直走，门牌还在，花盆倒挪了。',
      "Back? Straight from the station. House number's there. Flowerpot's moved, though.",
    ],
    [
      '钱紧，走河边这圈。经过邮局，避开商店街。',
      'Money tight. River circuit. Past the post office, away from the shopping street.',
    ],
    [
      '心情差？到桥头停，右侧有长椅，我先卸邮袋。',
      "Rough mood? Stop at the bridge. Bench on the right. I'll unload the postbag.",
    ],
    [
      '今天专程找你，邮袋放家了。往桥那边走？',
      'Came specially today. Postbag at home. Shall we head for the bridge?',
    ],
  ],
  jamie: [
    [
      '续签办完喽！我炖锅肉，你可得把文件从汤边挪远点！',
      "Renewal done! I'll make a stew. You'll have to move those papers away from the soup!",
    ],
    [
      '升职加薪啦！我开火庆祝，你点菜，这回真的听你的！',
      "Promotion and a raise! I'll cook to celebrate. You choose. Really your call this time!",
    ],
    [
      '换新工作啦！通勤我陪你试，可别信我那条所谓近路。',
      "New job! I'll try the commute with you. Don't trust my supposed shortcut, though.",
    ],
    [
      '英语过啦，好球！今晚试我那破收音机的球赛解说？',
      'Passed English! Get in! Fancy tackling the commentary on my battered radio tonight?',
    ],
    [
      'Life in the UK 过啦！我烤土豆，哎，土豆这次买了！',
      'Passed Life in the UK! Jacket potatoes. Ah, yes, I bought them this time!',
    ],
    [
      '回来啦！我给你留了饭，哎，箱子先放，我把汤端来。',
      "You're back! Saved you dinner. Ah, put the case down, I'll get the soup.",
    ],
    [
      '钱有点紧啊？冰箱我来翻，瞧，这土豆能救一顿！',
      "Money tight? I'll raid the fridge. Look, these potatoes will get us a meal!",
    ],
    [
      '哎，你脸色真差。我关球赛，来，今天到底怎么了？',
      "You look rough. Football off. Come on, what's happened today?",
    ],
    [
      '咱们现在能直说啦！比如那道菜，我是真的吃腻了。',
      "We can say things straight now! Like that dish. Honestly, I've had enough of it.",
    ],
  ],
  'ka-ning-partner': [
    [
      '续签办完，今晚我想吃点心。庆祝谁订位，来，谈一下。',
      "Renewal done, I want dim sum tonight. Who books our celebration? Let's discuss.",
    ],
    [
      '升职加薪要庆祝！新工作量也要谈，家里的活可没自动减少。',
      "Celebrate that promotion and raise! Discuss the workload too. Housework hasn't shrunk by itself.",
    ],
    [
      '换工作了，接送得重谈。讲好先，你的新时间也得算我那边。',
      'New job, school runs need talking through. Agree first: your new hours have to fit mine too.',
    ],
    [
      '英语过了，去吃点心！有个条件：今天由你打电话订位。',
      'Passed English, dim sum! One condition: you ring and book today.',
    ],
    [
      'Life in the UK 过啦！庆祝你挑，收拾轮到你，成交？',
      'Passed Life in the UK! You choose the celebration, your turn to clear up. Deal?',
    ],
    [
      '回来啦！先讲最好玩那件，行李我陪你拆，边拆边讲。',
      "You're back! Best story first. I'll help unpack, tell it while we do.",
    ],
    [
      '钱紧就重谈预算。我的摄影杂志别自动删，先问过我。',
      "Money tight, let's discuss the budget. Ask before my photography magazine gets cut.",
    ],
    [
      '今天心情差，家务咱们少做点。我有个条件：饭得好好吃。',
      "Rough mood today, let's do fewer chores. One condition: a proper dinner.",
    ],
    [
      '最近你也肯出主意啦！讲好先，提出的那项你带头做。',
      "You're suggesting things now! Let's agree, you start the job you suggest.",
    ],
  ],
  'ka-ning-child': [
    [
      '续签办完了？那今晚文件关门，轮到我的故事开门吧？',
      'Renewal finished? Papers closed tonight, my stories get to open now?',
    ],
    [
      '升职算升级吧？换椅子还是换关卡？加薪我会算！',
      "Promotion's levelling up, right? New chair or new level? I can count the pay rise!",
    ],
    [
      '你换工作了。旧同事还算同事吗，还是直接算朋友？',
      "You've changed jobs. Are the old colleagues still colleagues, or do they become friends?",
    ],
    [
      '英语过了！我要出朗读关，你也得念到句号才算赢。',
      "Passed English! I'll set a reading level. You have to reach the full stop to win too.",
    ],
    [
      'Life in the UK 过了？那我问小镇的问题，算不算加试？',
      'Passed Life in the UK? Do my town questions count as an extra test?',
    ],
    [
      '回来啦！先声明，我第一句没问礼物，这回能加一分吗？',
      "You're back! Declaration: didn't ask for presents first. A point this time?",
    ],
    [
      '钱紧，那玩免费寻宝！我定规则，找到怪石头算一分。',
      'Money tight, free treasure hunt! My rules. One point for finding a funny stone.',
    ],
    [
      '今天你不开心，那我讲学校那只飞虫！笑不笑都算听过了。',
      "You're sad today. I'll tell you about the bug at school! Counts as heard, laugh or no laugh.",
    ],
    [
      '现在我敢说暂停了！跟玩游戏一样，举手就先停一轮。',
      'I can say pause now! Like a game. Hand up, one round paused.',
    ],
  ],
  'yao-flatmate': [
    [
      '续签办完就把文件装硬袋，蓝袋还留给画纸，免得混起来。',
      'File the renewed papers in the stiff bag, keeping blue for art paper so they stay separate.',
    ],
    [
      '升职庆祝这顿我想慢慢吃，报销单先压平，便签容易掉胶。',
      "I'd take our time over the promotion meal; flatten the expenses sheet first as notes peel away.",
    ],
    [
      '新工作出门时间定了再改纸条，插座错开十分钟就够用。',
      'Once your new leaving time is set, change the note; ten minutes apart will share the socket.',
    ],
    [
      '英语过了先量证书，硬袋四角留出余量，装进去才不会折。',
      "Measure the passed English certificate first, leaving corner clearance so it won't fold.",
    ],
    [
      'Life in the UK 过了就把证明平放，离水壶远一点。',
      'Lay the passed Life in the UK evidence flat, away from the kettle.',
    ],
    [
      '回来的箱子先竖放靠墙，过道宽度照旧，小锅里还留着汤。',
      'Returned suitcase upright by the wall, keeping the passage clear; soup is in the small pot.',
    ],
    [
      '钱紧就先量旧框内径，修得动才动手，外框那笔报价另算。',
      "Money tight? Measure the old frame's inside before repairing it; the outer-frame quote is separate.",
    ],
    [
      '今天难受先坐稳，右边椅脚我调平了，裁纸机也停下来了。',
      "Sit steadily if today hurts; the right chair's level now and the cutter's stopped.",
    ],
    [
      '熟了就把框歪的尺寸直说，差几毫米报几毫米，我来重裁。',
      "Now we're familiar, tell me exactly how far the frame is out; I'll recut those millimetres.",
    ],
  ],
};
const recentFlags = [
  'quarter-visa-renewed',
  'quarter-promoted',
  'quarter-job-changed',
  'quarter-exam-passed',
  'quarter-life-passed',
  'quarter-returned',
];
for (const npc of npcs)
  for (const [i, pair] of recentCopy[npc.id].entries())
    npc.lines.push({
      id: `${npc.id}-recent-${i + 1}`,
      text: text(...pair),
      ...(i < 6
        ? { requires: [recentFlags[i]] }
        : i === 6
          ? { when: [{ stat: 'money', max: b.livingCosts }] }
          : i === 7
            ? { when: [{ stat: 'mood', max: 30 }] }
            : { requires: [`quarter-friendship-${npc.id}`] }),
    });

// Each choice has its own spoken memory, alongside the existing shared flags.
const heartReplies: Record<string, [Text, Text]> = {
  'heart-margaret-2': [
    {
      zhCN: '问我种坏的？得了，先讲那盘全烂的番茄！',
      en: 'What went wrong? Right, start with that whole tray of rotten tomatoes!',
    },
    {
      zhCN: '你挑爱吃的菜了？好！香菜我就少种一行。',
      en: 'Picked your favourites? Good! One less row of coriander, then.',
    },
  ],
  'heart-margaret-4': [
    {
      zhCN: '舍不得的？以前上班有人等我开门，如今就蜗牛。',
      en: "What do I miss? People waiting for me to open up. Now it's slugs.",
    },
    {
      zhCN: '我照你说的空了几天。得了，又跑去买种子了！',
      en: 'Tried leaving days empty, like you said. Ended up buying more seeds!',
    },
  ],
  'heart-margaret-6': [
    {
      zhCN: '豆架照我的搭了！照片挂回去，凳子可扔了。',
      en: 'Built the frame my way! Photo goes back up. Stool can go.',
    },
    {
      zhCN: '旧豆架那毛病，讲完还气！他把凳子也做得晃。',
      en: 'Still cross about that old frame! Even the stool he built wobbled.',
    },
  ],
  'heart-margaret-8': [
    {
      zhCN: '地保住了！少种几垄是我自己改主意，记住喽。',
      en: "Kept the plot! I'm planting fewer rows because I chose to, mind.",
    },
    {
      zhCN: '你还想叫我缩菜地？得了，先尝这盘豆！',
      en: 'Still want me to shrink the plot? Here, taste these beans first!',
    },
  ],
  'heart-margaret-10': [
    {
      zhCN: '按说好的来：你这回种死了什么？我先忍着笑。',
      en: "As agreed: what did you kill off this time? I'll try to keep a straight face.",
    },
    {
      zhCN: '这回我先！鼻涕虫把苗吃光了，气得我扔铲子。',
      en: 'Me first! Slugs ate every seedling. Threw my trowel in a temper.',
    },
  ],
  'heart-ade-2': [
    {
      zhCN: '那件小事仍未解决。进度栏我写了「茶歇中」。',
      en: 'That small problem remains unresolved. Progress field says on tea break.',
    },
    {
      zhCN: '茶歇议程清空。杯子状态：又续了一口。',
      en: 'Tea-break agenda cleared. Cup status: another sip taken.',
    },
  ],
  'heart-ade-4': [
    {
      zhCN: '准备进度讲过了。你的记录员表现：合格。',
      en: 'Preparation progress reported. Your performance taking notes: satisfactory.',
    },
    {
      zhCN: '今天切回工作议题。那封续签信暂存文件夹。',
      en: 'Back to the work agenda today. Renewal letter parked in its folder.',
    },
  ],
  'heart-ade-6': [
    {
      zhCN: '检查表缩短了。本人状态：还行，暂未散架。',
      en: 'Checklist shortened. Personal status: all right. Still in one piece.',
    },
    {
      zhCN: '工作移交完成。对方直接接了，交接会议取消。',
      en: 'Task transferred. They just accepted it. Handover meeting cancelled.',
    },
  ],
  'heart-ade-8': [
    {
      zhCN: '错表已认。补救项目：挨个通知，邮件写了又删。',
      en: 'Worksheet error admitted. Recovery task: notify everyone. Keep rewriting the email.',
    },
    {
      zhCN: '核清后才报告。影响栏补一项：同事白忙了会儿。',
      en: 'Reported after checking. Impact field updated: colleagues wasted some time.',
    },
  ],
  'heart-ade-10': [
    {
      zhCN: '说好不聊工作（我把报表关了），午饭想吃什么？',
      en: 'No work talk, as agreed (spreadsheet closed). What shall we have for lunch?',
    },
    {
      zhCN: '今天想聊工作吗（报销单先收好），还是聊点别的？',
      en: 'Want to talk work today (expenses put away first), or something else?',
    },
  ],
  'heart-helen-2': [
    {
      zhCN: '你换的那个词，我记到教案里了。原来还能这样用？',
      en: 'Put your replacement word in my lesson notes. Never knew it could work like that.',
    },
    {
      zhCN: '那次停笔你记得吗？我差点把你的词改成课本那个。',
      en: 'Remember when I stopped my pen? Nearly swapped your word for the textbook one.',
    },
  ],
  'heart-helen-4': [
    {
      zhCN: '那张旧便条我还留着。「车站」旁的箭头画反了。',
      en: 'Still have that old note. The arrow beside station points the wrong way.',
    },
    {
      zhCN: '你讲那句时，我差点抢答。你当时想用哪个词？',
      en: 'Nearly jumped in with an answer then. Which word had you wanted?',
    },
  ],
  'heart-helen-6': [
    {
      zhCN: '先问「故事讲完了吗」，我把这句写在红笔盒上了。',
      en: 'Have you finished your story? Wrote that on the red-pen box.',
    },
    {
      zhCN: '你说温柔也会打断，我回去重看那篇天气作文了。',
      en: 'You said gentle interruptions still interrupt. Reread that weather essay afterwards.',
    },
  ],
  'heart-helen-8': [
    {
      zhCN: '那回句子留原样了。你说的「自己」，我现在记得。',
      en: 'Left that sentence as it was. I remember your word myself now.',
    },
    {
      zhCN: '那回一起改过，下回我得先问：「现在要老师吗？」',
      en: "Revised it together then. Next time I'll ask: would you like the teacher now?",
    },
  ],
  'heart-helen-10': [
    {
      zhCN: '今天只听，你选哪句开头？我把书签翻到这面。',
      en: 'Just listening today. Which sentence comes first? Turning the bookmark to this side.',
    },
    {
      zhCN: '今天换我找词。要是我又讲成上课，你打断我？',
      en: 'My turn to find the words. Will you stop me if this turns into a lesson?',
    },
  ],
  'heart-priya-2': [
    {
      zhCN: '上次轮到你讲完，这回也照办，我暂缓叫号。',
      en: 'You got to finish last time. Same this time. Holding off calling the next name.',
    },
    {
      zhCN: '那回一起静坐，我脑里拼上块蓝天，差点喊下一位。',
      en: 'Sat quietly together. Fitted some sky in my head. Nearly called “Next!”',
    },
  ],
  'heart-priya-4': [
    {
      zhCN: '你那回只听我讲感受，回家终于少复盘一通电话。',
      en: 'You heard my feelings that time. One fewer call to replay when I got home.',
    },
    {
      zhCN: '上次改聊电影了，今天接着？诊所话题留交班讲。',
      en: 'We switched to films last time. Carry on? Clinic talk can wait for handover.',
    },
  ],
  'heart-priya-6': [
    {
      zhCN: '「现在不处理，请走预约。」那句我练熟，终于用上了。',
      en: "“I'm off duty. Please book an appointment.” Practised that line. Finally used it.",
    },
    {
      zhCN: '你那回专程来看我，我还习惯性找笔核姓名呢。',
      en: 'You came just to see me. Still reached for a pen to check your name.',
    },
  ],
  'heart-priya-8': [
    {
      zhCN: '推荐你已收回，谢了。接待台以外又能认得我了。',
      en: 'You withdrew the recommendation. Thanks. People might see me away from reception again.',
    },
    {
      zhCN: '上次仍有分歧，我把「请走预约」那句留给对方。',
      en: 'We still disagreed. Kept “Please book an appointment” for the person concerned.',
    },
  ],
  'heart-priya-10': [
    {
      zhCN: '按约定先问一声，今天静坐？我脑里还拼着蓝天。',
      en: 'Our usual check first. Quiet today? Still fitting sky in my head.',
    },
    {
      zhCN: '上次你先走，我拼上最后那片天。下次先问再约。',
      en: 'You left me to it. Fitted the last bit of sky. Check before we make the next plan.',
    },
  ],
  'heart-dave-2': [
    {
      zhCN: '你那道题我还没答出来。老板特权：允许拖延。',
      en: 'Still haven’t solved your question. Landlord’s privilege: postponement.',
    },
    {
      zhCN: '今天先不开场。你已经见过没麦克风的我了。',
      en: 'No opening announcement today. You’ve met me without the microphone.',
    },
  ],
  'heart-dave-4': [
    {
      zhCN: '我喜欢的笑话？老板答错还能继续开店那种。',
      en: 'My favourite joke? The landlord gets it wrong and still keeps the pub.',
    },
    {
      zhCN: '老板今天这桩麻烦，确实编不成笑话。你还听吗？',
      en: "Today's landlord trouble really won't make a joke. Still want to hear it?",
    },
  ],
  'heart-dave-6': [
    {
      zhCN: '那个人的事讲完，再放唱片，我总算能听进副歌了。',
      en: 'After telling you about them, I put the record on and finally heard the chorus again.',
    },
    {
      zhCN: '再听一面？来，客串本店唱片师，翻面归你！',
      en: 'Other side? Come on, guest DJ. You get to turn it over!',
    },
  ],
  'heart-dave-8': [
    {
      zhCN: '当众把规矩讲了，少卖几杯也心疼。老板认这笔。',
      en: 'Said it in front of everyone. Fewer drinks still hurts. The landlord owns that bill.',
    },
    {
      zhCN: '你劝顾生意，老板听着难受，那题我还是删了。',
      en: 'You said protect the trade. Hard for the landlord to hear. Still deleted that question.',
    },
  ],
  'heart-dave-10': [
    {
      zhCN: '暗号收到，主持下班！哎，戴夫本人想吃块饼干。',
      en: 'Code received. Host off duty! Dave himself would like a biscuit.',
    },
    {
      zhCN: '这题老板真不会。来，给诚实答案按一次抢答铃！',
      en: 'Landlord honestly has no idea. Come on, ring the buzzer for an honest answer!',
    },
  ],
  'heart-rahman-2': [
    {
      zhCN: '老朋友，你也站脆饼这边，我给自己那盘又多烤了会儿。',
      en: "You're on the crisp side too, my friend. Gave my own tray a little longer.",
    },
    {
      zhCN: '软饼我试烤了，老朋友，正摆后面晾着，来尝？',
      en: 'Tried baking them soft, my friend. Cooling out the back. Want a taste?',
    },
  ],
  'heart-rahman-4': [
    {
      zhCN: '老朋友，你问舍不得谁，卖店广告一拿出来，我就想起老客。',
      en: "You asked who I'd miss, my friend. Take out the sale advert and I picture the regulars.",
    },
    {
      zhCN: '你问后悔过没，老朋友，开店这么久，我真有几回想卖。',
      en: 'Asked if I regretted it, my friend. After all these years, yes, a few times I really wanted to sell.',
    },
  ],
  'heart-rahman-6': [
    {
      zhCN: '老朋友，我又挑了场演出，票压在自己那张货单下面。',
      en: "Picked another concert, my friend. Ticket's under my delivery sheet.",
    },
    {
      zhCN: '那张废票还在，老朋友，一翻账本就掉出来，我收了又收。',
      en: "Old unused ticket's still there, my friend. Falls out of the ledger. Keep putting it back.",
    },
  ],
  'heart-rahman-8': [
    {
      zhCN: '按原计划关店歇过了，老朋友，回来我还真想念门铃声。',
      en: "Closed for the break as planned, my friend. Coming back, I found I'd missed that bell.",
    },
    {
      zhCN: '你劝短开点，我还是关店歇了，老朋友，收入我心里有数。',
      en: 'You suggested shorter hours. I closed for the break anyway, my friend. I know what it cost.',
    },
  ],
  'heart-rahman-10': [
    {
      zhCN: '来，老朋友，我先讲店外的事，演出那排座椅可真硬。',
      en: "Here, my friend, I'll start with outside the shop. Those concert seats were hard!",
    },
    {
      zhCN: '老朋友，轮到你讲店外的了，我把货单塞抽屉，省得走神。',
      en: "Your turn for life outside, my friend. Delivery sheets in the drawer so I don't get distracted.",
    },
  ],
  'heart-lina-2': [
    {
      zhCN: '你讲过的那扇门，我留在纸外了。喂，我只画这边！',
      en: 'Left the door you told me about off the page. Hey, drawing this side only!',
    },
    {
      zhCN: '上次只聊颜色真痛快，灰就是灰，省掉解释！',
      en: 'Just colours last time. What a relief! grey is grey. Explanation saved!',
    },
  ],
  'heart-lina-4': [
    {
      zhCN: '最初来这儿干什么，我还记得。地图箭头还在呢！',
      en: "I remember why I came here. arrow's still on the map!",
    },
    {
      zhCN: '你听过我为什么难收行李，喂，光画稿就塞满两箱！',
      en: "You heard why packing's hard. Hey, sketches fill two boxes alone!",
    },
  ],
  'heart-lina-6': [
    {
      zhCN: '你听我讲过停笔那阵，那盒蓝还剩大半呢。',
      en: 'You heard about when I stopped drawing. Maddening. Most of that blue was still left.',
    },
    {
      zhCN: '这条线就这么歪！上回只聊它怎么画，我舒服多了。',
      en: 'Line stays that crooked! Talking just about drawing it last time felt much better.',
    },
  ],
  'heart-lina-8': [
    {
      zhCN: '展出留了，介绍改了。喂，再偷加励志标题我就拆！',
      en: "Show stays, introduction rewritten. Add a sneaky inspirational title and I'll tear it down!",
    },
    {
      zhCN: '撤展少个机会，我知道。顶那标题我更来气！',
      en: 'One less opportunity with the show withdrawn. I know! That title made me angrier.',
    },
  ],
  'heart-lina-10': [
    {
      zhCN: '你画的桌子我认得！下幅画咖啡渍也行，省布景。',
      en: 'Know your table now! coffee stain next is fine. Saves arranging a subject.',
    },
    {
      zhCN: '今天画普通东西！标题写「梨」，拜托，够用了吧。',
      en: "Ordinary stuff today! Title: “Pear.” Please, that's plenty.",
    },
  ],
  'heart-gareth-2': [
    {
      zhCN: '路认得了？左转，过矮墙。松砖那块快修了。',
      en: "Know the route? Left, past the low wall. Loose paving's being fixed soon.",
    },
    {
      zhCN: '你讲的路我走过了。过桥右拐，街名我又核一次。',
      en: 'Walked your route. Right after the bridge. Checked the street name again.',
    },
  ],
  'heart-gareth-4': [
    {
      zhCN: '邮袋放家了。今天往哪走？先在台阶下碰头。',
      en: 'Postbag at home. Which way today? Meet below the steps first.',
    },
    {
      zhCN: '上回只讲我自己，讲到拐角还没完。你都听到了。',
      en: 'Only talked about myself last time. Still going at the corner. You heard it all.',
    },
  ],
  'heart-gareth-6': [
    {
      zhCN: '工作外那条路走了。过桥到树下，原来有张长椅。',
      en: "Tried that route outside work. Across the bridge, under the tree. There's a bench.",
    },
    {
      zhCN: '怕没人等这事，说出口了。回家还是过邮筒右拐。',
      en: 'Said it: afraid nobody will wait for me. Still right past the postbox for home.',
    },
  ],
  'heart-gareth-8': [
    {
      zhCN: '公开邀请贴了。过邮局就能看见，名单还是空的。',
      en: 'Public invitation up. Visible past the post office. List still empty.',
    },
    {
      zhCN: '你说先问熟人，我记着。邮袋里这张名单留我手上。',
      en: 'You said ask people I know first. Remembered. This list stays in my postbag.',
    },
  ],
  'heart-gareth-10': [
    {
      zhCN: '今天我领？过桥往树走，到那边停，邮袋在家。',
      en: "I'm leading? Over the bridge to the trees. Stop there. Postbag's home.",
    },
    {
      zhCN: '今天你定方向。到路口我先停，你说哪边再走。',
      en: "You choose today. I'll stop at the crossing. Move when you say which way.",
    },
  ],
  'heart-jamie-2': [
    {
      zhCN: '今天调味先问你，哎，问口味！又差点只问够不够。',
      en: "I'll ask about seasoning first. Ah, taste! Nearly asked only whether there's enough again.",
    },
    {
      zhCN: '你问我真爱吃什么，我愣了！辣香肠，先算一道好了。',
      en: "You asked what I actually like. Stumped me! Spicy sausage. Let's count that as one.",
    },
  ],
  'heart-jamie-4': [
    {
      zhCN: '还有拿不准的！五人足球排人，我老怕把谁给落下。',
      en: "There's more I'm unsure of! Even picking five-a-side, I worry I'll leave someone out.",
    },
    {
      zhCN: '你自己试这条路！哎，我收住脚，差点又抢先带路。',
      en: 'Try your own route! Ah, feet stay put. Nearly marched in front again.',
    },
  ],
  'heart-jamie-6': [
    {
      zhCN: '哎，你说，我把工具盒扣上！手伸过去你就拍我。',
      en: 'Go on. Toolbox shut! Give my hand a tap if I reach for it.',
    },
    {
      zhCN: '我也怕啊，哎，修收音机修得再响，也得把这话说出来。',
      en: "I'm scared too. Ah, even fixing the radio at full blast won't get those words said.",
    },
  ],
  'heart-jamie-8': [
    {
      zhCN: '那天真坐下来谈了，比修完椅子难多了，你说是不是！',
      en: "We actually sat and talked that day. Much harder than fixing the chair, wasn't it!",
    },
    {
      zhCN: '另约那天我记着呢！你累了就改，咱们说好接着谈。',
      en: "I remember the day we agreed! Change it if you're tired. We've agreed to keep talking.",
    },
  ],
  'heart-jamie-10': [
    {
      zhCN: '哎，坐这把！我也坐，螺丝刀已经进盒了，你检查。',
      en: "This chair! I'll sit too. Screwdriver's in the box. You can check.",
    },
    {
      zhCN: '椅子按你改的叫！咱们自己家，取名还得问裁判啊？',
      en: "Your new name for the chair it is! Our house. Who's refereeing the names anyway?",
    },
  ],
  'heart-ka-ning-partner-2': [
    {
      zhCN: '你记得我想做的工作啦！下次见表姐，我自己讲，你补充。',
      en: 'You remember the work I want! Next cousin call, I tell her, you add to it.',
    },
    {
      zhCN: '分工说定后，求职终于能专心。接送临时换，记得先来谈。',
      en: 'Jobs agreed, I can focus on applications. If a school run changes, discuss it first.',
    },
  ],
  'heart-ka-ning-partner-4': [
    {
      zhCN: '那张照片，你那版我留着。表姐听了笑，说还想听第三版。',
      en: 'Kept your version of that photo. My cousin laughed and wants a third version too.',
    },
    {
      zhCN: '相册记了谁做的。下回按这个分，想改，我们提前谈。',
      en: 'Album says who did what. Same split next time; discuss changes beforehand.',
    },
  ],
  'heart-ka-ning-partner-6': [
    {
      zhCN: '电影那段还没讲完！明天的菜明天说，讲好先，这段归我。',
      en: "Film story's unfinished! Tomorrow's groceries tomorrow. Agree this stretch is mine.",
    },
    {
      zhCN: '你那点私心还记着吧？我记摄影课，你那件也拿出来谈。',
      en: "Remember that wish just for you? I've got photography lessons. Put yours on the table too.",
    },
  ],
  'heart-ka-ning-partner-8': [
    {
      zhCN: '轮到你那页，真自己动手了！我说好要夸，这回兑现。',
      en: "Your album page, and you started it yourself! Promised I'd praise that. Here it is.",
    },
    {
      zhCN: '分工还在谈，但相册没全塞给我。这个变化，我认账。',
      en: "Still talking responsibilities, but the album didn't all land on me. I'll give you that.",
    },
  ],
  'heart-ka-ning-partner-10': [
    {
      zhCN: '那页是我的进展！讲好先，给表姐看时别改成全家事迹。',
      en: "That's my progress on that page! Agree now: keep it mine when showing my cousin.",
    },
    {
      zhCN: '没做好的也写，你先写一件，我跟一件，成交？',
      en: 'Write what went wrong too. One from you, one from me. Deal?',
    },
  ],
  'heart-ka-ning-child-2': [
    {
      zhCN: '今天两只鸭子还各叫各的。你不许偷偷合并。',
      en: 'The ducks still get separate noises today. No secretly merging them.',
    },
    {
      zhCN: '你那只不像鸭子，但可以演。书里也没说不行。',
      en: 'Yours didn’t sound like a duck. Still gets a part. The book didn’t forbid it.',
    },
  ],
  'heart-ka-ning-child-4': [
    {
      zhCN: '门里门外今天交换先说！我画的门，开门顺序我来定。',
      en: 'Inside and outside swap who speaks first today! My drawn door, my opening order.',
    },
    {
      zhCN: '学校那个说法还会吗？忘了就举手，我再教一遍！',
      en: "Remember the school version? Hand up if you've forgotten. I'll teach it again!",
    },
  ],
  'heart-ka-ning-child-6': [
    {
      zhCN: '乱笔也拍进去了吧？那是踮脚记录，不是垃圾。',
      en: 'The scribble’s in the photo, right? Tiptoe evidence. Not rubbish.',
    },
    {
      zhCN: '最高那条有故事！先听，我踮脚那次得算犯规分。',
      en: 'Top line has a story! Listen first. Tiptoeing gets penalty points.',
    },
  ],
  'heart-ka-ning-child-8': [
    {
      zhCN: '歪嘴那张寄到了。外婆说她也想听那个笑话。',
      en: 'The crooked-mouth photo arrived. Grandma wants to hear the joke too.',
    },
    {
      zhCN: '你挑了清楚那张。我还留着歪嘴的，不是废片。',
      en: 'You chose the clear one. I kept the crooked-mouth one. It isn’t a reject.',
    },
  ],
  'heart-ka-ning-child-10': [
    {
      zhCN: '你的话也卷进去了！大人没长高，也准报名这个游戏。',
      en: 'Your words are in the roll too! Grown-ups can enter this game without growing taller.',
    },
    {
      zhCN: '今天记哪件我定好了！先保密，你猜中也暂时没奖。',
      en: "Picked today's record! Secret first. Even guessing right gets no prize yet.",
    },
  ],
  'heart-yao-flatmate-2': [
    {
      zhCN: '共用范围定了，架子中线擦掉，分区标签还在。',
      en: 'Shared area settled. Shelf centre line erased, section labels remain.',
    },
    {
      zhCN: '你那件私物单独标了，借用前问，合租协议照写。',
      en: 'Your private item separately marked. Ask before borrowing, stays in flat agreement.',
    },
  ],
  'heart-yao-flatmate-4': [
    {
      zhCN: '你认领那项已问过，清单加了人名，返工少一轮。',
      en: 'You asked about your item. Name added to list, one fewer round of rework.',
    },
    {
      zhCN: '负责人填齐，那句「你会说」划掉，责任按项分。',
      en: "All owners filled in. “You're good at explaining” crossed out, duties item by item.",
    },
  ],
  'heart-yao-flatmate-6': [
    {
      zhCN: '安静喝汤那回记住了，等关机后，两碗放齐就行。',
      en: 'Remembered that quiet soup. Switch off, just two bowls side by side.',
    },
    {
      zhCN: '按约定，独处会直说，时间报清，脸色没有刻度。',
      en: "As agreed, I'll say when I want time alone. Clear times, faces have no scale.",
    },
  ],
  'heart-yao-flatmate-8': [
    {
      zhCN: '上板先征求同意，字写齐也先问，已擦掉重写。',
      en: 'Ask agreement before pinning. Straight handwriting still needs asking, erased and redone.',
    },
    {
      zhCN: '那次谈到一半暂停，铅笔留板边，继续时从这行起。',
      en: 'That discussion paused halfway. Pencil beside board, resume from this line.',
    },
  ],
  'heart-yao-flatmate-10': [
    {
      zhCN: '你加的停顿已描上，地图铅笔画，两个人都能改。',
      en: 'Your added pause marked. Pencil map, both can alter it.',
    },
    {
      zhCN: '地图新改一笔，门口宽度重新量，鞋架已挪开。',
      en: 'Another map revision. Entrance width remeasured, shoe rack moved.',
    },
  ],
};
for (const event of heartEvents) {
  const npc = npcs.find((person) => person.id === event.heart!.npc)!;
  for (const [i, choice] of event.choices.entries()) {
    const flag = `${event.id}-${choice.id}`;
    choice.sets = [...(choice.sets ?? []), flag];
    npc.lines.push({
      id: `${flag}-reply`,
      text: heartReplies[event.id][i],
      requires: [flag],
      once: true,
    });
  }
}
