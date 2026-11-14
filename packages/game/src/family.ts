import { balance as b } from './balance';
import type { GameEvent, Npc, Text } from './types';
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const dialogue: Record<string, [string, string][]> = {
  jamie: [
    [
      '索菲娅，咱们的茶！哎，光顾找你，茶包都没放！',
      'Sofia, our tea! Ah, busy looking for you. Forgot the teabags!',
    ],
    [
      '索菲娅，咱家收音机快修好啦！哎，球赛又快踢完了。',
      "Sofia, our radio's nearly fixed! Ah, match nearly over again.",
    ],
    [
      '咱们的面包还能救！哎，先刮掉我烤黑的边。',
      'We can rescue our bread! Ah, scrape off the edges I burnt first.',
    ],
    [
      '咱们看球穿这双！等等，我把拖鞋补反了。',
      "These for watching the match! Wait, I've mended the slippers backwards.",
    ],
    [
      '索菲娅，咱家汤盖找到了！盐也……哎，刚加过吧？',
      "Sofia, found our soup lid! And the salt... ah, added that already, didn't I?",
    ],
    [
      '球袜又少一只！咱家沙发底下快能凑队了。',
      'Another missing football sock! Nearly a whole team under our sofa.',
    ],
    [
      '咱们开饭！哎，我把饭端到球赛前头了。',
      "Our dinner's up! Ah, managed to serve it before kick-off.",
    ],
    [
      '咱们先托住茶！我垫的桌脚又越垫越歪。',
      'Hold our tea steady! My table wedge has made it even wonkier.',
    ],
    [
      '索菲娅，咱们合照真好！哎，我只顾看你，眼又闭了。',
      'Sofia, love our photo! Ah, looking at you. Shut my eyes again.',
    ],
    [
      '索菲娅，咱们湿外套先挂家里！哎，干衣架也湿了。',
      "Sofia, let's hang our wet coats at home! Ah, drying rack's wet too.",
    ],
    [
      '春天咱们种球根！哎，我又差点把头尾种反。',
      'Spring bulbs for us! Ah, nearly put them upside down again.',
    ],
    [
      '夏天咱们搬饭到院子！索菲娅，哎，我把椅子锁屋里了。',
      "Our dinner in the garden this summer! Sofia, ah, I've locked the chairs inside.",
    ],
    [
      '秋叶全进咱家了！我的球靴又带进一摊泥。',
      'Autumn leaves all through our hall! My football boots brought mud too.',
    ],
    [
      '索菲娅，咱们裹家里的大毯子！哎，冬天还漏脚。',
      'Sofia, our big blanket round us! Ah, feet still out in winter.',
    ],
    [
      '咱家衣杆修好了！哎，我说早了，先接住。',
      "Our coat rail's fixed! Ah, spoke too soon. Catch it.",
    ],
    [
      '出太阳啦，咱们搬出去吃！我拿茶，哎，空壶。',
      "Sun's out, let's eat outside! I've got the tea. Ah, empty pot.",
    ],
    [
      '索菲娅，咱家门口雪滑！我这守门的脚也扑空了。',
      "Sofia, slippery snow at our door! These goalkeeper's feet missed too.",
    ],
    [
      '索菲娅，咱家周末炖菜听球！哎，这回先调对台。',
      'Sofia, stew and football at home this weekend! Ah, tune the radio properly first.',
    ],
    [
      '咱们明天的事贴好了！哎，把旧球票盖住了。',
      "Our reminder for tomorrow's up! Ah, covered the old match ticket.",
    ],
    [
      '你接着讲！咱家这壶比我还吵，我先关掉。',
      "Keep going! Our kettle's louder than me. Switching it off.",
    ],
    [
      '索菲娅，你在咱家讲那笑话！哈哈，我反应比守门慢！',
      'Sofia, that joke you told at home! Ha, slower reaction than my goalkeeping!',
    ],
    [
      '哎，咱们再合照！我刚才又举锅铲挡脸了。',
      'Ah, another photo of us! Hid my face with the spatula again.',
    ],
    [
      '咱家书架我修！哎，钻进去了，怎么出来啊。',
      "I'll fix our bookshelf! Ah, got inside. How do I get out?",
    ],
    [
      '咱家垫子翻面！哎，两面都有茶，我真行。',
      'Flip our cushion! Ah, tea both sides. Nice work, me.',
    ],
    [
      '索菲娅，咱们坐家里喝茶！球队那球，哎，越想越气。',
      'Sofia, tea at home with me! That goal. Ah, angrier the more I think about it.',
    ],
    [
      '办公室杯子搬回家啦！咱们晚饭用，哎，还得洗。',
      "Office mug's home! Let's use it at dinner. Ah, needs washing first.",
    ],
    [
      '索菲娅，咨询表咱们一起看！哎，我把茶压上头了。',
      "Sofia, let's look at the advice form together! Ah, put the tea on top of it.",
    ],
    [
      '咱们宝宝的小袜子！哎，我手太大，差点撑开。',
      "Our baby's tiny socks! Ah, hands too big. Nearly stretched them.",
    ],
    [
      '索菲娅，全职班表出了！咱家晚饭我接手，球赛往后挪。',
      "Sofia, full-time rota's out! I'll take our dinners. Football can move.",
    ],
    [
      '索菲娅，咱家楼梯慢点爬！我这脚比球场散场还磨蹭。',
      'Sofia, slowly up our stairs! My feet are slower than leaving the pitch.',
    ],
  ],
  'ka-ning-partner': [
    [
      '乐言的饭盒另放，你那份我留家里。现在热，还是带走？',
      "Lok Yin's lunchbox goes separately; yours is at home. Heat it now or take it?",
    ],
    [
      '嘉宁，我撑伞，你提家里的菜。走车站，还是穿小巷？',
      "Ka Ning, I'll hold the umbrella; you take our groceries. Station or lane?",
    ],
    [
      '嘉宁，今晚家务先停，我想看电影。旧片还是新片？',
      'Ka Ning, chores can wait tonight. I want a film. Old favourite or new one?',
    ],
    [
      '从香港搬来那箱相片归我理。你先收家里的书，还是衣服？',
      "I'll sort the photos we moved from Hong Kong. Our books or clothes for you first?",
    ],
    [
      '讲好先，嘉宁择菜我煮饭。乐言那份，我少放葱。',
      "Let's agree first: Ka Ning does veg, I cook. Fewer spring onions for Lok Yin.",
    ],
    [
      '我想煮青菜，你那份拌饭还是另放？乐言的我会留。',
      "I'm cooking greens. Yours with rice or on the side? I'll save Lok Yin's.",
    ],
    [
      '讲好先，我要改简历。嘉宁，乐言接早还是接晚？',
      "Let's agree first: time for my CV. Ka Ning, early or late pickup for Lok Yin?",
    ],
    [
      '讲好先，我给香港表姐回电话。你的现在打，还是全家吃完饭？',
      'Agree first: my cousin in Hong Kong first. Your call now or after the family eats?',
    ],
    [
      '乐言外套缝好了。嘉宁，讲好先，你洗碗还是擦灶？',
      "Lok Yin's coat is mended. Ka Ning, agree first: dishes or hob for you?",
    ],
    [
      '乐言种的葱先留窗边，我要擦桌。你收盆，还是扫地？',
      "Lok Yin's onions stay by the window. I'll wipe the table. Pots or floor for you?",
    ],
    [
      '春天我要半层鞋柜放相纸。讲好先，全家的泥鞋另外排。',
      "Half a shelf for photo paper this spring. Agree first: the family's muddy shoes elsewhere.",
    ],
    [
      '家里厚被我收，夏天换薄的。你拆咱们这套，还是拿新的？',
      "I'll store our thick duvet for summer. Strip our cover or fetch a clean one?",
    ],
    [
      '乐言捡的秋叶归他收。讲好先，嘉宁，你也理自己的。',
      'Lok Yin puts his autumn leaves away. Agree first: Ka Ning, sort yours too.',
    ],
    [
      '冬天全家出门我带热水。乐言的手套你装，还是我装？',
      "Hot water's my job on winter family outings. Lok Yin's gloves: will you pack them or shall I?",
    ],
    [
      '接乐言又淋湿肩膀。嘉宁，明天你撑伞还是背书包？',
      'Wet shoulder from collecting Lok Yin again. Ka Ning, umbrella or schoolbag for you tomorrow?',
    ],
    [
      '全家的衣服还没晒完。你挂乐言的，还是先挂自己的？',
      "Family washing's not all out yet. Hang Lok Yin's first or yours?",
    ],
    [
      '乐言看雪看够了，我要开暖气。讲好先，家里的窗关上。',
      "Lok Yin's had his snow-watching. I want the heating. Agree first: close our window.",
    ],
    [
      '嘉宁，家里门缝还漏风。周末你先量，还是陪我买材料？',
      "Ka Ning, our door's still draughty. Measure first this weekend or buy materials with me?",
    ],
    [
      '讲好先，今晚按我的口味。你和乐言先尝汤，还是配饭？',
      'Agree first: my tastes tonight. You and Lok Yin try soup first or with rice?',
    ],
    [
      '茶泡好了，我想多坐一会儿。你的糖现在加还是等凉？',
      "Tea's ready. I'd like to sit a while. Sugar now or when it cools?",
    ],
    [
      '从香港搬来后，这条路倒熟了。嘉宁，走河边还是过桥？',
      'Know this road since we moved from Hong Kong. Ka Ning, riverside or across the bridge?',
    ],
    [
      '乐言这张我想留。嘉宁，你挑全家福，还是挑自己的？',
      'I want this photo of Lok Yin kept. Ka Ning, pick a family one or one of yourself?',
    ],
    [
      '家里厨房我收了。讲好先，乐言睡后节目我挑，你坐哪？',
      "Our kitchen's done. Agree first: my programme once Lok Yin's asleep. Where will you sit?",
    ],
    [
      '你皱眉我也猜不准。我想听具体那件，现在说还是饭后？',
      "I can't read that frown. I'd like the actual story. Now or after dinner?",
    ],
    [
      '周末免接乐言，我想睡午觉。嘉宁，你带钥匙还是等我醒？',
      'No Lok Yin school run this weekend; I want a nap. Ka Ning, take a key or wait till I wake?',
    ],
    [
      '讲好先，录用的事我自己讲。表姐等着听，合约还得问清。',
      "Let's agree first: I'll tell my own job news. Cousin's waiting; contract needs clarifying.",
    ],
    [
      '找工作等得累。嘉宁，陪我在家坐坐，还是一起出门？',
      "Job-hunting's worn me out. Ka Ning, sit with me at home or go out together?",
    ],
    [
      '明早上班各做早餐。嘉宁，周末全家吃粥还是面？',
      'Separate breakfasts for work tomorrow. Ka Ning, family porridge or noodles this weekend?',
    ],
    [
      '香港搬来的箱子我留床底。你那只留家里，还是送人？',
      'Keeping my Hong Kong suitcase under the bed. Yours stays here or goes to someone else?',
    ],
    [
      '家里信箱我要留全名。嘉宁，你的贴右边还是下面？',
      'My full name on our letterbox. Ka Ning, your label beside it or below?',
    ],
  ],
  'ka-ning-child': [
    [
      '这本书从另一头看，最后那个人还知道前面发生过什么吗？',
      'If I read this book backwards, does the person at the end know what happened before?',
    ],
    [
      '午饭全是黄色算配色，还是算没蔬菜？',
      'If lunch is all yellow, is that a colour scheme or no vegetables?',
    ],
    [
      '鞋又紧了。是脚长大不用预约吗？',
      'My shoes are tight again. Do feet grow without making an appointment?',
    ],
    [
      '画上这只猫先保密！我还没给它发名字牌。',
      "This cat in my drawing is secret! Haven't issued its name badge yet.",
    ],
    [
      '窗台的葱没上过学，怎么也知道往光那边长？',
      "The onions haven't been to school. How do they know which way the light is?",
    ],
    [
      '这叶子五个尖！跟我五根手指一样，算数能借它一只手吗？',
      'Five points on this leaf! Like my five fingers. Can I borrow its hand for sums?',
    ],
    [
      '封面好看，里面不好看，算不算书骗人？',
      "If the cover's good and the story isn't, has the book lied?",
    ],
    [
      '名字写在毛衣里面。毛衣不识字，为什么不是写外面？',
      "My name's inside the jumper. It can't read. Why isn't it on the outside?",
    ],
    [
      '学校通知要家长签。你签错地方，我能给你圈出来吗？',
      'A parent has to sign the school letter. Can I circle it if you sign the wrong bit?',
    ],
    [
      '晚饭我先画下来！吃过打星，没吃过画问号，算我的菜单。',
      "I'll draw dinner first! Stars for tried, question marks for untried. My menu.",
    ],
    [
      '春天草地的花不在花坛里。谁负责点名？',
      'Spring flowers grow outside the flowerbed. Who takes their register?',
    ],
    [
      '夏天影子这么长，我的身高能不能算上它？',
      "My shadow's so long in summer. Can it count towards my height?",
    ],
    [
      '秋叶夹在书里会变平。作业夹进去也会简单点吗？',
      'Autumn leaves flatten in books. Would my homework get easier if I pressed it too?',
    ],
    [
      '冬天说话会冒白气。小声说，白气也会小一点吗？',
      'Your breath shows in winter. If you whisper, is the cloud smaller?',
    ],
    [
      '雨滴在玻璃上赛跑。窗台算终点，还是算掉下去了？',
      'Raindrops race down the glass. Is the sill the finish, or have they fallen off?',
    ],
    [
      '太阳照到地毯了。把书放那里，是不是算户外阅读？',
      "Sun's on the carpet. If I read there, does it count as reading outdoors?",
    ],
    [
      '雪上的脚印能看出谁走过。能看出谁走错路吗？',
      'Footprints in snow show who went past. Do they show who went the wrong way?',
    ],
    [
      '周末走公园远路！近路我闯过关了，这次换地图。',
      'Long way through the park this weekend! Cleared the short route. New map this time.',
    ],
    [
      '这个词有两种念法。它自己听得出区别吗？',
      'This word has two pronunciations. Can it hear the difference itself?',
    ],
    [
      '我念到句号你才举手！这是我定的朗读规则。',
      "Hand up only when I reach the full stop! That's my reading rule.",
    ],
    [
      '画送你！先答那条歪线是什么，猜中才给好看分。',
      'Drawing for you! Guess what the crooked line is. Then you get pretty-picture points.',
    ],
    [
      '最大那块给你！我检查过，正的，歪掉那块我自己吃。',
      "Biggest piece for you! Checked it, straight one. I'll eat the wonky bit.",
    ],
    [
      '学校有件事，我要从头讲！你猜错人也得扣分。',
      'School story! From the beginning. Points off if you guess the wrong person.',
    ],
    [
      '书签夹这页，下回我讲！你负责问为什么，老师今天换我。',
      "Bookmark here, I tell it next time! You ask why. I'm the teacher today.",
    ],
    [
      '门框那条线是我的身高。搬家以后，线跟谁走？',
      "That mark's my height. If we move, who gets the line?",
    ],
    [
      '给外婆发照片能发声音吗？有些事只看脸看不出来。',
      "Can we send Grandma sounds with the photos? You can't tell everything from a face.",
    ],
    [
      '秋天排练我演树。树不用说台词，那它怎么提意见？',
      "I'm a tree in the autumn play. No lines. How does it give an opinion?",
    ],
    [
      '夏天运动会掉了豆袋还能跑。那为什么还要记停顿？',
      'You can keep running after dropping the beanbag at summer sports day. Why do they still count the stop?',
    ],
    [
      '学校合照我看旁边，那边有人快打喷嚏！照片拍到声音吗？',
      'I looked sideways in the school photo. Someone was sneezing! Can photos catch sounds?',
    ],
    [
      '今晚故事换我讲。鸭子的台词用哪种语言都像鸭子。',
      "I'll tell the story tonight. Duck dialogue sounds like duck in either language.",
    ],
  ],
};
const householdReactions: Record<string, Npc['reactions']> = {
  jamie: {
    loved: {
      zhCN: '哎，正中球门！今晚我做饭，你点，真的你点。',
      en: "Get in, right in the goal! I'll cook tonight. You choose, really.",
    },
    liked: {
      zhCN: '好东西！等等，我手全是油，先擦一擦。',
      en: 'Lovely! Hang on, hands covered in grease. Quick wipe first.',
    },
    neutral: {
      zhCN: '哎，谢谢！放桌上，我先挪开那堆收音机零件。',
      en: "Ah, cheers! Table there. I'll move those radio bits first.",
    },
    disliked: {
      zhCN: '哎，这个真用不上！旧收音机已经快堆不下啦。',
      en: "Ah, can't use this one! Barely room for my old radios already.",
    },
  },
  'ka-ning-partner': {
    loved: {
      zhCN: '这个我真喜欢！讲好先，礼物收下，家务另谈。',
      en: 'I love this! Agree first: gift accepted, chores discussed separately.',
    },
    liked: {
      zhCN: '选得合我意！下次换我挑，你可得接招。',
      en: 'Good choice! My turn to pick next. Be ready.',
    },
    neutral: {
      zhCN: '谢谢！有个条件，先替我挪挪柜子里的相册。',
      en: 'Thanks! One condition, help shift the albums in the cupboard first.',
    },
    disliked: {
      zhCN: '这个不合意，咱们换个选法，下回先问我，成交？',
      en: 'Not my taste. New deal: ask me next time. Agreed?',
    },
  },
  'ka-ning-child': {
    loved: {
      zhCN: '就是我想要的！猜中加一分，你怎么猜的？',
      en: 'Just what I wanted! Point for guessing right. How did you do it?',
    },
    liked: {
      zhCN: '喜欢！说谢谢跟拆礼物可以一起比赛吗？',
      en: 'I like it! Can thank-you and unwrapping race each other?',
    },
    neutral: {
      zhCN: '我的了？那现在轮到我定玩法，对吧？',
      en: 'Mine now? My turn to make the rules, right?',
    },
    disliked: {
      zhCN: '这件我不喜欢。说实话这一关，会扣我的分吗？',
      en: "Don't like this one. Honesty level, do I lose points?",
    },
  },
};
const members: [string, string, string, string, string[]][] = [
  ['jamie', '杰米', 'Jamie', 'family-partner', ['tea', 'baked-potato']],
  [
    'ka-ning-partner',
    '许文舒',
    'Man Shu Hui',
    'hong-kong-bno',
    ['flowers', 'salad'],
  ],
  [
    'ka-ning-child',
    '陈乐言',
    'Lok Yin Chan',
    'hong-kong-bno',
    ['cake', 'strawberry-jam'],
  ],
];
export const familyNpcs: Npc[] = members.map(
  ([id, zhCN, en, character, loved]) => ({
    id,
    name: t(zhCN, en),
    role: t(
      id === 'jamie'
        ? '索菲娅的伴侣'
        : id.endsWith('child')
          ? '嘉宁的孩子'
          : '嘉宁的伴侣',
      id === 'jamie'
        ? 'Sofia’s partner'
        : id.endsWith('child')
          ? 'Ka Ning’s child'
          : 'Ka Ning’s partner',
    ),
    characters: [character],
    schedule: [
      {
        festival: true,
        stops: [
          { from: 0, at: 'home' },
          { from: 540, at: 'green-stall' },
          { from: 1080, at: 'green' },
          { from: 1320, at: 'home' },
        ],
      },
      {
        weather: ['rain', 'snow'],
        dayKinds: ['weekend'],
        stops: [{ from: 0, at: 'home' }],
      },
      // Schedule times are game settings, not working-time or school rules.
      ...(id === 'jamie'
        ? [
            {
              dayKinds: ['workday' as const],
              when: [{ flag: 'family-pip-applied' }],
              stops: [
                { from: 0, at: 'home' as const },
                { from: 720, at: 'park-path' as const },
                { from: 780, at: 'home' as const },
              ],
            },
          ]
        : []),
      ...(id.endsWith('child')
        ? []
        : [
            {
              dayKinds: ['workday' as const],
              when: [
                {
                  flag:
                    id === 'jamie'
                      ? 'family-jamie-reemployed'
                      : 'bno-partner-restarted',
                },
              ],
              stops: [
                { from: 0, at: 'home' as const },
                { from: 540, at: 'away' as const },
                { from: 1020, at: 'home' as const },
              ],
            },
            {
              dayKinds: ['workday' as const],
              when: [
                {
                  flag:
                    id === 'jamie'
                      ? 'family-jamie-unemployed'
                      : 'bno-partner-between-jobs',
                },
              ],
              stops: [
                { from: 0, at: 'home' as const },
                { from: 660, at: 'shop' as const },
                { from: 780, at: 'park-path' as const },
                { from: 900, at: 'home' as const },
              ],
            },
          ]),
      {
        dayKinds: ['workday'],
        stops: [
          { from: 0, at: 'home' },
          { from: 540, at: 'away' },
          { from: id.endsWith('child') ? 930 : 1020, at: 'home' },
        ],
      },
      {
        dayKinds: ['weekend', 'special'],
        stops: [
          { from: 0, at: 'home' },
          { from: 660, at: 'park-path' },
          { from: 780, at: 'home' },
        ],
      },
    ],
    gifts: {
      loved,
      liked: ['tea', 'biscuits', 'tulip'].filter(
        (item) => !loved.includes(item),
      ),
      disliked: ['old-boot', 'shopping-trolley', 'pike'],
    },
    reactions: householdReactions[id],
    lines: dialogue[id].map(([zhCN, en], i) => ({
      id: `${id}-daily-${i + 1}`,
      text: t(zhCN, en),
    })),
  }),
);
for (const npc of familyNpcs) {
  for (const [i, season] of [
    [10, 2],
    [11, 3],
    [12, 4],
    [13, 1],
  ] as const)
    npc.lines[i].season = season;
  npc.lines[14].weather = ['rain'];
  npc.lines[15].weather = ['sunny'];
  npc.lines[16].weather = ['snow'];
  npc.lines[17].dayKinds = ['weekend'];
  for (let i = 19; i < 24; i++)
    npc.lines[i].heartsMin = i < 21 ? 2 : i < 23 ? 4 : 6;
}
familyNpcs[0].lines[25].requires = ['family-jamie-unemployed'];
familyNpcs[0].lines[26].requires = ['family-pip-advice'];
familyNpcs[0].lines[27].requires = ['family-baby-arrived'];
familyNpcs[0].lines[28].requires = ['family-full-time'];
familyNpcs[0].lines[29].requires = ['family-pip-advice'];
familyNpcs[1].lines[25].requires = ['bno-partner-working'];
familyNpcs[1].lines[26].requires = ['bno-partner-between-jobs'];
familyNpcs[1].lines[27].requires = ['bno-partner-working'];
familyNpcs[0].lines[4].when = [{ minuteMin: 1020 }];
familyNpcs[0].lines[9].weather = ['rain'];
familyNpcs[0].lines[9].when = [{ minuteMin: 1020 }];
familyNpcs[0].lines[25].forbids = ['family-jamie-reemployed'];
familyNpcs[1].lines[0].when = [{ minuteMax: 720 }];
familyNpcs[1].lines[24].dayKinds = ['weekend', 'special'];
for (const i of [25, 27])
  familyNpcs[1].lines[i].forbids = ['bno-partner-between-jobs'];
familyNpcs[1].lines[25].once = true;
familyNpcs[1].lines[26].forbids = ['bno-partner-restarted'];
familyNpcs[2].lines[26].season = 4;
familyNpcs[2].lines[27].season = 3;

const additionalLines: Record<string, Npc['lines']> = {
  jamie: [
    {
      id: 'jamie-daily-31',
      text: {
        zhCN: '收工喽，咱们先开饭！哎，饭盒还扣着呢。',
        en: "Work done, let's eat! Ah, lunch box still fastened.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['family-jamie-unemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-32',
      text: {
        zhCN: '下班喽，咱们煮面！哎，锅里怎么全是冷水。',
        en: "Home from work, noodles for us! Ah, why's the water still cold?",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['family-jamie-unemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-33',
      text: {
        zhCN: '索菲娅，咱们今晚烤土豆！哎，回家才发现一颗没买。',
        en: "Sofia, jacket potatoes for us tonight! Ah, got home and hadn't bought any.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['family-jamie-unemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-34',
      text: {
        zhCN: '工牌还挂着就切洋葱！哎，咱们这厨师真赶。',
        en: "Chopping onions with my work pass on! Ah, our chef's in a rush.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['family-jamie-unemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-35',
      text: {
        zhCN: '索菲娅，咱家厨房开场！哎，才下班就把洋葱炒糊了。',
        en: "Sofia, our kitchen's kicking off! Ah, home from work and burnt the onions already.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['family-jamie-unemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-36',
      text: {
        zhCN: '下班腿都软了！咱们坐会儿，我连球赛都想躺着听。',
        en: "Work's done my legs in! Let's sit. I could listen to football lying down.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['family-jamie-unemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-37',
      text: {
        zhCN: '索菲娅，咱家电脑给你！哎，我找工作又点成球赛了。',
        en: "Sofia, our computer's yours! Ah, job-hunting turned into football again.",
      },
      requires: ['family-jamie-unemployed'],
      forbids: ['family-jamie-reemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-38',
      text: {
        zhCN: '索菲娅，买咱家菜碰见旧同事！工作没着落，球赛都忘聊。',
        en: 'Sofia, old colleague while buying our groceries! No job yet; forgot the football too.',
      },
      requires: ['family-jamie-unemployed'],
      forbids: ['family-jamie-reemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-39',
      text: {
        zhCN: '新工作一肚子事！咱们先吃，哎，别让我嘴占满。',
        en: "So much about the new job! Dinner first. Ah, don't let me hog the talk.",
      },
      requires: ['family-jamie-reemployed'],
      forbids: ['family-pip-applied'],
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'jamie-daily-40',
      text: {
        zhCN: '索菲娅，重新上班真累！咱家这锅换你，我先投降。',
        en: "Sofia, back at work and knackered! Our pan's yours. I surrender.",
      },
      requires: ['family-jamie-reemployed'],
      forbids: ['family-pip-applied'],
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'jamie-daily-41',
      text: {
        zhCN: '春天开窗喽！咱家合页还在叫，哎，球赛都听不清。',
        en: "Spring windows open! Our hinge is squealing. Ah, can't hear the match.",
      },
      season: 2,
    },
    {
      id: 'jamie-daily-42',
      text: {
        zhCN: '秋天南瓜真大！哎，咱家案板快被我挤走了。',
        en: 'Huge autumn pumpkin! Ah, nearly pushed our chopping board off.',
      },
      season: 4,
    },
    {
      id: 'jamie-daily-43',
      text: {
        zhCN: '后门雪封了，咱们走前门！哎，铲子也锁后头了。',
        en: "Snow at the back door. Let's use the front! Ah, shovel's locked out back too.",
      },
      weather: ['snow'],
    },
    {
      id: 'jamie-daily-44',
      text: {
        zhCN: '咱家周末炖菜得慢火！索菲娅，上回球赛加时，我烧成炭啦。',
        en: 'Low heat for our weekend stew! Sofia, last extra time I burnt it to charcoal.',
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'jamie-daily-45',
      text: {
        zhCN: '停工后下午的药总忘！咱家水杯边摆好了，这回记着。',
        en: 'Keep forgetting afternoon medicine since stopping work! Set it beside our water glass. Remember this time.',
      },
      requires: ['family-pip-applied'],
      when: [
        {
          minuteMin: 720,
          minuteMax: 1080,
        },
      ],
    },
    {
      id: 'jamie-daily-46',
      text: {
        zhCN: '听完咨询，咱家重锅放低啦！哎，我的腰先投降。',
        en: "Advice heard, our heavy pan's lower now! Ah, my back gave in first.",
      },
      requires: ['family-pip-advice'],
    },
    {
      id: 'jamie-daily-47',
      text: {
        zhCN: '索菲娅，咱家火关了，坐下说！哎，又只顾讲我的锅。',
        en: "Sofia, our stove's off. Sit and talk! Ah, nearly talked only about my pan again.",
      },
      heartsMin: 2,
    },
    {
      id: 'jamie-daily-48',
      text: {
        zhCN: '咱们爱吃的都记下啦！哎，我又写在球赛时刻旁。',
        en: 'Noted what we like to eat! Ah, beside the football times again.',
      },
      heartsMin: 2,
    },
    {
      id: 'jamie-daily-49',
      text: {
        zhCN: '索菲娅，咱们床头灯还亮着！哎，我听旧球赛又听醒了。',
        en: "Sofia, our bedside light's still on! Ah, old match recording's woken me right up.",
      },
      heartsMin: 6,
      when: [
        {
          minuteMin: 1140,
        },
      ],
    },
    {
      id: 'jamie-daily-50',
      text: {
        zhCN: '尝咱们这盘！哎，我放盐时又忘了尝，先认错。',
        en: 'Try our dinner! Ah, forgot to taste while salting it. My fault first.',
      },
      heartsMin: 6,
    },
  ],
  'ka-ning-partner': [
    {
      id: 'ka-ning-partner-daily-31',
      text: {
        zhCN: '下班先给表姐打电话。讲好先，嘉宁，家里晚饭先热还是等我？',
        en: "Cousin's call after work first. Agree, Ka Ning: heat our dinner now or wait for me?",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['bno-partner-between-jobs'],
    },
    {
      id: 'ka-ning-partner-daily-32',
      text: {
        zhCN: '今天我想安静吃饭，收据先留着。你坐下还是先洗手？',
        en: "I'd like a quiet dinner. Receipts can wait. Sit down or wash your hands first?",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['bno-partner-between-jobs'],
    },
    {
      id: 'ka-ning-partner-daily-33',
      text: {
        zhCN: '家里胡萝卜我补了。嘉宁，下次你记纸上还是手机？',
        en: 'Got our carrots. Ka Ning, your turn next time: paper list or phone?',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['bno-partner-between-jobs'],
    },
    {
      id: 'ka-ning-partner-daily-34',
      text: {
        zhCN: '讲好先，今晚我看摄影书。乐言的家课你先陪，我来收饭桌。',
        en: "Agree first: my photography book tonight. You help Lok Yin with homework; I'll clear our table.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['bno-partner-between-jobs'],
    },
    {
      id: 'ka-ning-partner-daily-35',
      text: {
        zhCN: '全家跑一天了，我先换鞋。嘉宁，点心你蒸还是我买？',
        en: 'Long day out for the family. Shoes off first. Ka Ning, steam dim sum or shall I buy it?',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['bno-partner-between-jobs'],
    },
    {
      id: 'ka-ning-partner-daily-36',
      text: {
        zhCN: '周末留一晚拍夜景。嘉宁，你同行，还是在家陪乐言？',
        en: 'One evening for night photography this weekend. Ka Ning, join me or stay home with Lok Yin?',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
      forbids: ['bno-partner-between-jobs'],
    },
    {
      id: 'ka-ning-partner-daily-37',
      text: {
        zhCN: '工作还在找，散步我想换个话题。聊电影，还是街角新店？',
        en: 'Still job-hunting. Different walk conversation, please. Film or the new corner shop?',
      },
      requires: ['bno-partner-between-jobs'],
      forbids: ['bno-partner-restarted'],
    },
    {
      id: 'ka-ning-partner-daily-38',
      text: {
        zhCN: '又没回音，我想把做过的事重写一遍。你帮读开头还是结尾？',
        en: "No reply again. I'll rewrite what I've done. Read the opening or the ending for me?",
      },
      requires: ['bno-partner-between-jobs'],
      forbids: ['bno-partner-restarted'],
    },
    {
      id: 'ka-ning-partner-daily-39',
      text: {
        zhCN: '重新上班也按乐言接送表走。讲好先，嘉宁，改我的格先问。',
        en: "Back at work, still Lok Yin's school rota. Agree, Ka Ning: ask before changing my slot.",
      },
      requires: ['bno-partner-restarted'],
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'ka-ning-partner-daily-40',
      text: {
        zhCN: '重新上班，家里晚饭得换手。嘉宁，你负责买还是煮？',
        en: 'Back at work, our dinners need another pair of hands. Ka Ning, shop or cook?',
      },
      requires: ['bno-partner-restarted'],
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'ka-ning-partner-daily-41',
      text: {
        zhCN: '春天外套找到了。讲好先，省的钱我想买夜景杂志。',
        en: "Found the spring coat. Let's agree first: I'd like that saving for a night-photo magazine.",
      },
      season: 2,
    },
    {
      id: 'ka-ning-partner-daily-42',
      text: {
        zhCN: '冬天全家的饭盒试旧保温袋。乐言带饭，你带汤还是饭？',
        en: "Old insulated bag for the family's winter lunches. Rice for Lok Yin; soup or rice for you?",
      },
      season: 1,
    },
    {
      id: 'ka-ning-partner-daily-43',
      text: {
        zhCN: '雨进家里窗边了。讲好先，我关饭锅，嘉宁收衣服。',
        en: "Rain's coming through our window. Agree first: I turn off the cooker, Ka Ning gets the washing.",
      },
      weather: ['rain'],
    },
    {
      id: 'ka-ning-partner-daily-44',
      text: {
        zhCN: '周末只补两件衣服，先补乐言的。讲好先，嘉宁的下回补。',
        en: "Mending two things this weekend, Lok Yin's first. Agree first: Ka Ning's next time.",
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'ka-ning-partner-daily-45',
      text: {
        zhCN: '讲好先，简历那只猫还留着。我想重拍，表姐又问照片了。',
        en: "Let's agree first: keeping that cat on my CV. Want a new photo; cousin's asking again.",
      },
      requires: ['bno-partner-cv-seen'],
    },
    {
      id: 'ka-ning-partner-daily-46',
      text: {
        zhCN: '香港带来的地图我重折。嘉宁，家里桌上杯子还是书先挪？',
        en: 'Refolding the map from Hong Kong. Ka Ning, cups or books off our table first?',
      },
    },
    {
      id: 'ka-ning-partner-daily-47',
      text: {
        zhCN: '家里窗帘我量。嘉宁，选深色还是浅色？我想卧室用蓝。',
        en: "I'll measure our curtains. Ka Ning, dark or pale? I'd like blue for our bedroom.",
      },
      heartsMin: 2,
    },
    {
      id: 'ka-ning-partner-daily-48',
      text: {
        zhCN: '乐言衣扣得重新缝。你先拆这头，还是从扣子那头开始？',
        en: "Lok Yin's button needs resewing. Unpick this end or start at the button end?",
      },
      heartsMin: 2,
    },
    {
      id: 'ka-ning-partner-daily-49',
      text: {
        zhCN: '全家相册得有我入镜。嘉宁，你拿相机，还是我架起来？',
        en: 'I need to be in our family album. Ka Ning, hold the camera or shall I set it up?',
      },
      heartsMin: 6,
      requires: ['family-album-started'],
      forbids: ['family-album-page'],
    },
    {
      id: 'ka-ning-partner-daily-50',
      text: {
        zhCN: '乐言的饭盒扣好了，我看摄影书。嘉宁，现在吃还是等我？',
        en: "Lok Yin's lunchbox is closed. My photography book now. Ka Ning, eat now or wait for me?",
      },
      heartsMin: 6,
    },
  ],
  'ka-ning-child': [
    {
      id: 'ka-ning-child-daily-31',
      text: {
        zhCN: '放学啦！我有三件事，一件好笑，两件要你猜。',
        en: "School's out! Three things to tell. One funny, two you have to guess.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-32',
      text: {
        zhCN: '水壶带回了，老师那句忘在教室了。能单独拿回来吗？',
        en: "Brought my bottle, left the teacher's words in class. Can I go back just for them?",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-33',
      text: {
        zhCN: '放学发现橡皮在袖口。它是不是也想提早回家？',
        en: 'Found an eraser up my sleeve after school. Did it want to go home early too?',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-34',
      text: {
        zhCN: '功课这题卡关了！你给提示，答案我自己找。',
        en: "Stuck on this homework level! Give me a hint, I'll find the answer.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-35',
      text: {
        zhCN: '下课大家一起拉书包。拉链响得像第二个下课铃。',
        en: 'Everyone zipped their bags at once after class. Like a second school bell.',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-36',
      text: {
        zhCN: '放学带了块石头。名字叫纪念品，不叫书包垃圾。',
        en: "Brought a stone home from school. It's a souvenir, not rubbish in my bag.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-37',
      text: {
        zhCN: '学校的事三件，第三件先锁住。钥匙我还没找好。',
        en: "Three school things. Third one's locked. Haven't found its key yet.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-38',
      text: {
        zhCN: '功课写完！先宣布：完成分和正确分，得分开算。',
        en: 'Homework finished! Announcement: finishing points and right-answer points count separately.',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 930,
        },
      ],
    },
    {
      id: 'ka-ning-child-daily-39',
      text: {
        zhCN: '春天蚂蚁搬东西。它们的老师会说别拖拖拉拉吗？',
        en: 'Ants carry things in spring. Does their teacher tell them to hurry up?',
      },
      season: 2,
    },
    {
      id: 'ka-ning-child-daily-40',
      text: {
        zhCN: '夏天凉鞋露着脚趾。为什么不算鞋子没穿好？',
        en: "Summer sandals leave your toes out. Why doesn't that count as putting your shoes on wrong?",
      },
      season: 3,
    },
    {
      id: 'ka-ning-child-daily-41',
      text: {
        zhCN: '秋天果壳装口袋里很响。上课前得先让它们安静。',
        en: "Autumn seed cases rattle in my pocket. I'll need to quieten them before class.",
      },
      season: 4,
    },
    {
      id: 'ka-ning-child-daily-42',
      text: {
        zhCN: '冬天手套连着绳。要是意见不同，谁去左边谁去右边？',
        en: 'Winter gloves come on a string. If they disagree, which one goes left?',
      },
      season: 1,
    },
    {
      id: 'ka-ning-child-daily-43',
      text: {
        zhCN: '下雨窗上全是雾。写错字擦掉，老师看不到吧？',
        en: "Rain's fogged the window. If I rub out a wrong word, the teacher won't see?",
      },
      weather: ['rain'],
    },
    {
      id: 'ka-ning-child-daily-44',
      text: {
        zhCN: '雪人要用胡萝卜。我想吃一口，鼻子短点它介意吗？',
        en: 'The snowman needs a carrot. If I eat some, will it mind a shorter nose?',
      },
      weather: ['snow'],
    },
    {
      id: 'ka-ning-child-daily-45',
      text: {
        zhCN: '周末不用闹钟。肚子会叫，但它报的都是吃饭时间。',
        en: 'No alarm at weekends. My stomach rings, but only for meals.',
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'ka-ning-child-daily-46',
      text: {
        zhCN: '这个长词我来闯！你等句号，抢着说就算你犯规。',
        en: "I'll tackle that long word! Wait for the full stop. Jump in and it's a foul.",
      },
      heartsMin: 2,
    },
    {
      id: 'ka-ning-child-daily-47',
      text: {
        zhCN: '外婆说身高线收到了！下次我给她画箭头，指我长高那边。',
        en: "Grandma got my height line! Next time I'll draw an arrow where I grew.",
      },
      heartsMin: 2,
      requires: ['heart-child-photo'],
    },
    {
      id: 'ka-ning-child-daily-48',
      text: {
        zhCN: '蜡笔排好队！短的也准参加，能画出字就没淘汰。',
        en: "Crayons lined up! Short ones qualify too. If they can draw a word, they're still in.",
      },
      heartsMin: 6,
    },
    {
      id: 'ka-ning-child-daily-49',
      text: {
        zhCN: '哈哈，你念错了！这次我举手，轮到你等我说完。',
        en: 'Ha, you read it wrong! Hand up this time. Your turn to let me finish.',
      },
      heartsMin: 6,
    },
    {
      id: 'ka-ning-child-daily-50',
      text: {
        zhCN: '我要讲件小事。先约好，讲到句号你才能去忙！',
        en: 'Little story to tell. Agree first, you can go when I reach the full stop!',
      },
      heartsMin: 6,
    },
  ],
};
for (const npc of familyNpcs) npc.lines.push(...additionalLines[npc.id]);

// Existing supper and bedtime lines need the same clock gates as the new ones.
familyNpcs[1].lines[2].when = [{ minuteMin: 1020 }];
familyNpcs[1].lines[18].when = [{ minuteMin: 1020 }];
familyNpcs[1].lines[25].when = [{ minuteMin: 1020 }];
familyNpcs[2].lines[29].when = [{ minuteMin: 1080 }];

familyNpcs.push({
  id: 'yao-flatmate',
  name: t('周沅', 'Yuan Zhou'),
  role: t('林遥的室友，装裱员', 'Yao’s flatmate, a picture framer'),
  characters: ['skilled-worker'],
  schedule: [
    {
      festival: true,
      stops: [
        { from: 0, at: 'home' },
        { from: 540, at: 'green-stall' },
        { from: 1080, at: 'green' },
        { from: 1320, at: 'home' },
      ],
    },
    {
      weather: ['rain', 'snow'],
      dayKinds: ['weekend'],
      stops: [{ from: 0, at: 'home' }],
    },
    {
      dayKinds: ['workday'],
      stops: [
        { from: 0, at: 'home' },
        { from: 540, at: 'away' },
        { from: 1020, at: 'home' },
      ],
    },
    {
      dayKinds: ['weekend', 'special'],
      stops: [
        { from: 0, at: 'home' },
        { from: 660, at: 'park-path' },
        { from: 780, at: 'home' },
      ],
    },
  ],
  gifts: {
    loved: ['corn-soup', 'sunflower'],
    liked: ['tea', 'biscuits', 'tomato'],
    disliked: ['old-boot', 'shopping-trolley', 'pike'],
  },
  reactions: {
    loved: t(
      '正合我意。收下；工具挪开，桌面留给它。',
      'Exactly right. Accepted; tools aside, clear space on the table.',
    ),
    liked: t(
      '喜欢。放右边空板上；那块干净，没沾装裱胶。',
      'Like it. Empty board on right; clean there, no mounting glue.',
    ),
    neutral: t(
      '收到。先量占地；我自己排位置。',
      "Received. Measure footprint first; I'll position it.",
    ),
    disliked: t(
      '这份我用不上。先搁门边；公共架子已经排满。',
      "Can't use this one. Leave it by the door; shared shelf already fully arranged.",
    ),
  },
  lines: [
    {
      id: 'yao-flatmate-intro',
      text: t(
        '周沅，做装裱的。合租先分清使用范围，纸屑我扫。',
        'Yuan, a picture framer. We will agree on shared space first, and I will clear my paper scraps.',
      ),
      once: true,
      when: [{ yearMax: 1 }],
    },
    {
      id: 'yao-flatmate-daily-1',
      text: {
        zhCN: '冰箱左格先给你放，等盒子摆进去再量要不要调层板。',
        en: "Use the left fridge shelf first; once the boxes fit, we'll measure for a shelf adjustment.",
      },
      heartsMax: 1,
      when: [{ yearMax: 1 }],
    },
    {
      id: 'yao-flatmate-daily-2',
      text: {
        zhCN: '门后那把折尺折回三节再收，关节松了量出来会差两毫米。',
        en: 'Fold the rule back three sections before storing it; a loose joint loses two millimetres.',
      },
    },
    {
      id: 'yao-flatmate-daily-3',
      text: {
        zhCN: '盐糖都贴了黑字白签，光按盖子的颜色分还是容易拿错。',
        en: 'Salt and sugar have black-on-white labels; lid colour alone makes mistakes too easy.',
      },
    },
    {
      id: 'yao-flatmate-daily-4',
      text: {
        zhCN: '汤多出来一碗，你用这口锅热就行，我把旁边的台面腾开。',
        en: 'An extra bowl of soup; warm it in this pot while I clear the worktop beside it.',
      },
    },
    {
      id: 'yao-flatmate-daily-5',
      text: {
        zhCN: '冰箱铰链松一毫米，等维修前轻推门，让它自己落到扣里。',
        en: "The hinge is a millimetre loose; until it's fixed, push gently and let the catch settle.",
      },
    },
    {
      id: 'yao-flatmate-daily-6',
      text: {
        zhCN: '租约放灰袋才不会混进蓝袋画纸里，找的时候先认袋口。',
        en: 'Keep the tenancy in the grey bag, away from blue-bag art paper; check the opening first.',
      },
    },
    {
      id: 'yao-flatmate-daily-7',
      text: {
        zhCN: '房检日期确认了我才写上门背，到访时段还有一格得留白。',
        en: 'The inspection date goes behind the door once confirmed; leave the time slot blank for now.',
      },
    },
    {
      id: 'yao-flatmate-daily-8',
      text: {
        zhCN: '画框我能修，水龙头得让水工来，手边这些垫片规格不合。',
        en: 'I can mend the frame; the tap needs a plumber, as these washers are the wrong size.',
      },
    },
    {
      id: 'yao-flatmate-daily-9',
      text: {
        zhCN: '裁纸剩的四角已经对齐，你要做标签就从上面一叠拿。',
        en: 'The cut corners are squared up; take the top stack if you need labels.',
      },
    },
    {
      id: 'yao-flatmate-daily-10',
      text: {
        zhCN: '汤盛八分满比较好端，碗沿这一圈得留给手指借力。',
        en: 'Soup carries better four-fifths full; leave that rim for your fingers.',
      },
    },
    {
      id: 'yao-flatmate-daily-11',
      text: {
        zhCN: '春天开窗三指宽散胶味，画纸先压在板下避开直风。',
        en: 'A three-finger spring window gap clears glue fumes; weight the paper out of the draught.',
      },
      season: 2,
    },
    {
      id: 'yao-flatmate-daily-12',
      text: {
        zhCN: '夏天胶带黏得快，正稿先压住，废纸试贴过再往上粘。',
        en: 'Summer tape grabs fast; hold the final sheet down and test on scrap before attaching it.',
      },
      season: 3,
    },
    {
      id: 'yao-flatmate-daily-13',
      text: {
        zhCN: '秋叶沾的水会给画纸留印，鞋先擦干净，纸另放高处。',
        en: 'Wet autumn leaves can mark art paper; dry the shoes first and store paper higher up.',
      },
      season: 4,
    },
    {
      id: 'yao-flatmate-daily-14',
      text: {
        zhCN: '冬天手暖透再裁这条边，冷着下刀偏了线，就得整条重来。',
        en: 'Warm your hands fully before a winter cut; a cold-hand slip costs the whole edge.',
      },
      season: 1,
    },
    {
      id: 'yao-flatmate-daily-15',
      text: {
        zhCN: '门垫给雨浸透了，晾起来以前从右边过，水别滴进木柜缝。',
        en: "The mat is soaked; pass on the right until it's hung, keeping drips out of the cabinet joints.",
      },
      weather: ['rain'],
    },
    {
      id: 'yao-flatmate-daily-16',
      text: {
        zhCN: '晴天斜着看玻璃比较清楚，右上角这道擦痕正面看不出。',
        en: 'Sunlight shows the glass at an angle; that upper-right scratch disappears straight on.',
      },
      weather: ['sunny'],
    },
    {
      id: 'yao-flatmate-daily-17',
      text: {
        zhCN: '雪鞋先放托盘里，水流进板缝，干了以后边缘也会翘。',
        en: 'Snowy shoes in the tray first; water in the joints can lift the boards even after drying.',
      },
      weather: ['snow'],
    },
    {
      id: 'yao-flatmate-daily-18',
      text: {
        zhCN: '周末我想画弯一点的线，这周直边裁够了，尺就收进抽屉。',
        en: 'I want curved lines at the weekend; enough straight cuts this week, so the rule goes away.',
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'yao-flatmate-daily-19',
      text: {
        zhCN: '下班带回两颗图钉，我先装进铁盒，散在地上容易扎脚。',
        en: "Two drawing pins home from work; I'll box them first so nobody steps on them.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-20',
      text: {
        zhCN: '收工这碗面凭手抓就行，我今天已经不想再对着刻度了。',
        en: "A handful of noodles after work is enough; I've looked at enough scales today.",
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-21',
      text: {
        zhCN: '下班先烧水，裁纸机响了一天，我得等耳朵里这声慢慢散。',
        en: 'Water on after work; a day at the cutter leaves a ringing I need to let settle.',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-22',
      text: {
        zhCN: '大画刚裱完肩膀僵，箱子先靠墙，明天腾出手再一起搬。',
        en: 'My shoulders are stiff from the large frame; box against the wall, move it together tomorrow.',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-23',
      text: {
        zhCN: '工服挂右边高一点的架子，左侧压低了，重量得重新分。',
        en: 'Hang the workwear on the higher right side; the left sags, so redistribute the weight.',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-24',
      text: {
        zhCN: '下班这袋边角料先按纸厚分开，薄片留着还能试胶。',
        en: 'Sort this bag of offcuts by thickness after work; the thin pieces still test glue.',
      },
      dayKinds: ['workday'],
      when: [
        {
          minuteMin: 1020,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-25',
      text: {
        zhCN: '早上烤面包跟烧水错开用，延长线额定功率吃不下两样。',
        en: "Stagger the morning toaster and kettle; the extension's rating won't carry both.",
      },
      when: [
        {
          minuteMax: 660,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-26',
      text: {
        zhCN: '夜里切菜这声会穿墙，明天砧板垫上折布，再试振动小了没。',
        en: 'Night chopping carries through the wall; a folded cloth under the board tomorrow, then test it.',
      },
      when: [
        {
          minuteMin: 1380,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-27',
      text: {
        zhCN: '你的口味我用铅笔记在食谱边上，要改就擦掉这一行重写。',
        en: 'Your tastes are pencilled beside the recipe; rub out this line and rewrite it if they change.',
      },
      heartsMin: 2,
    },
    {
      id: 'yao-flatmate-daily-28',
      text: {
        zhCN: '广播这段前面广告我剪掉了，剩下两分钟正好够面煮开。',
        en: "I've cut the advert from this radio clip; two minutes left, enough to bring the noodles up.",
      },
      heartsMin: 4,
    },
    {
      id: 'yao-flatmate-daily-29',
      text: {
        zhCN: '听见你钥匙响我就多拿只碗，你惯用的那只照旧放右边。',
        en: 'Your keys make me fetch a second bowl; your usual one still goes on the right.',
      },
      heartsMin: 6,
    },
    {
      id: 'yao-flatmate-daily-30',
      text: {
        zhCN: '今天装裱做得嘴都累了，你坐旁边，让我先把这碗汤喝完。',
        en: "Framing's worn my mouth out too today; sit beside me while I finish this soup.",
      },
      heartsMin: 8,
    },
    {
      id: 'yao-flatmate-daily-31',
      text: {
        zhCN: '伴侣来访的日期记在右侧，留白还能添回程，别贴满这一格。',
        en: "Your partner's visit is on the right; leave room for the return date in that square.",
      },
      requires: ['partner-arrived'],
      forbids: ['partner-separated'],
    },
    {
      id: 'yao-flatmate-daily-32',
      text: {
        zhCN: '你伴侣的箱子我量过，轮子朝侧面放才进得了床底。',
        en: "I measured your partner's case; wheels sideways is how it fits beneath the bed.",
      },
      requires: ['partner-arrived'],
      forbids: ['partner-separated'],
    },
    {
      id: 'yao-flatmate-daily-33',
      text: {
        zhCN: '锅铲能共用，裁纸刀各收各的，每人磨的刀口角度不同。',
        en: 'We can share spatulas, but keep separate cutters; our blade angles differ.',
      },
      heartsMin: 6,
    },
    {
      id: 'yao-flatmate-daily-34',
      text: {
        zhCN: '冰箱纸角这次换薄胶，压足时间再松手，就不会翘回来。',
        en: 'Thin tape for the fridge corner this time; hold it long enough and it stays flat.',
      },
      requires: ['flatmate-shelf'],
    },
    {
      id: 'yao-flatmate-daily-35',
      text: {
        zhCN: '房检清单后面附旧磨损照片，核对时从同一个角度看。',
        en: 'Old wear photos behind the inspection list; compare from the same angle.',
      },
      requires: ['flatmate-checklist'],
    },
    {
      id: 'yao-flatmate-daily-36',
      text: {
        zhCN: '留言写清位置、尺寸和谁处理，只有问号我量不出要改哪儿。',
        en: "Write location, size and who'll handle it; a question mark gives me nothing to measure.",
      },
      requires: ['flatmate-board'],
    },
    {
      id: 'yao-flatmate-daily-37',
      text: {
        zhCN: '敲门我会应，鞋柜往里挪五厘米，门才开得到原来那条线。',
        en: "I'll answer a knock; moving the shoe rack in five centimetres lets the door reach its line.",
      },
      heartsMin: 4,
    },
    {
      id: 'yao-flatmate-daily-38',
      text: {
        zhCN: '合租刚开始先照标签分垃圾，色盖只辅助，字得朝外贴。',
        en: 'For our first shared-house weeks, sort by the labels; colour helps, but face the words out.',
      },
      heartsMax: 3,
      when: [{ yearMax: 1 }],
    },
    {
      id: 'yao-flatmate-daily-39',
      text: {
        zhCN: '维修邮件抄送我，到访时段跟装裱排期得留出能转场的空。',
        en: 'Copy me on repair emails; leave enough time between the visit and my framing schedule.',
      },
    },
    {
      id: 'yao-flatmate-daily-40',
      text: {
        zhCN: '厨房围裙挂左钩，带胶那条留工间，换着用了得先洗。',
        en: 'Kitchen apron on the left hook, glue apron at work; wash them if they cross over.',
      },
    },
    {
      id: 'yao-flatmate-daily-41',
      text: {
        zhCN: '玻璃罐按口径分，大号装垫片，小号放扣子，标签贴平再收。',
        en: 'Sort jars by mouth size: washers large, buttons small, labels flat before storage.',
      },
    },
    {
      id: 'yao-flatmate-daily-42',
      text: {
        zhCN: '草稿上的墙斜两度是照实画的，我拿水平尺核过真墙。',
        en: "The sketched wall's two-degree tilt is deliberate; I checked the real one with a level.",
      },
    },
    {
      id: 'yao-flatmate-daily-43',
      text: {
        zhCN: '纸箱先搬我房里，过道得留够转身宽度，门口还要开伞。',
        en: 'Boxes into my room first; the passage needs turning room and space for an umbrella.',
      },
    },
    {
      id: 'yao-flatmate-daily-44',
      text: {
        zhCN: '罐子深度不够，长汤勺横过来放才不会顶翻旁边那把。',
        en: "The jar's too shallow; lay the long ladle across so it won't topple the next one.",
      },
    },
    {
      id: 'yao-flatmate-daily-45',
      text: {
        zhCN: '周末我想绕公园去小店，旧告示那行字距得拍近些才看清。',
        en: "I'd go through the park to the shop this weekend; a close photo will show the old sign's spacing.",
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'yao-flatmate-daily-46',
      text: {
        zhCN: '阴天窗边没有直射，两张白纸并排比底色，偏黄会明显些。',
        en: 'No direct light by the cloudy window; side-by-side white sheets show the yellow cast better.',
      },
      weather: ['cloudy'],
    },
    {
      id: 'yao-flatmate-daily-47',
      text: {
        zhCN: '夜里把音箱离墙一掌宽，低音沿墙传，隔壁只听得到那阵响。',
        en: "A palm's gap from the wall at night; bass travels through it and neighbours hear just that rumble.",
      },
      when: [
        {
          minuteMin: 1140,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-48',
      text: {
        zhCN: '裂口碗我留着装纸夹，早餐拿右边整口的，沿边都查过了。',
        en: 'The chipped bowl holds clips now; use the intact breakfast bowl on the right, rim checked.',
      },
      when: [
        {
          minuteMax: 660,
        },
      ],
    },
    {
      id: 'yao-flatmate-daily-49',
      text: {
        zhCN: '面再煮三分钟就好，我把油烟机关了，你接着讲今天那件事。',
        en: "Three more minutes for the noodles; I'll stop the extractor so you can finish today's story.",
      },
      heartsMin: 4,
    },
    {
      id: 'yao-flatmate-daily-50',
      text: {
        zhCN: '门后小图偏角三度先保留，出口已经标清，要改得两边对照。',
        en: "Leave the door map's three-degree angle for now; exits are marked, changes need both sides checked.",
      },
      requires: ['flatmate-map'],
    },
    {
      id: 'yao-flatmate-daily-51',
      text: {
        zhCN: '新年饺子我想先拍俯视图，等大家吃完，再按照片慢慢起稿。',
        en: "I'd photograph the New Year dumplings from above, then draw from it after everyone eats.",
      },
      festival: 'lunar-new-year',
    },
    {
      id: 'yao-flatmate-daily-52',
      text: {
        zhCN: '五月彩带一拉就有误差，量长度得用尺，松手了再核一次。',
        en: 'May ribbons stretch into error; use a rule, release the ribbon and measure again.',
      },
      festival: 'may-day',
    },
    {
      id: 'yao-flatmate-daily-53',
      text: {
        zhCN: '夏日集市标签字距倒匀，奖状那一行偏紧，我想替它松开点。',
        en: "Summer-fair labels are spaced evenly; the certificate line is tight and I'd open it out.",
      },
      festival: 'summer-fair',
    },
    {
      id: 'yao-flatmate-daily-54',
      text: {
        zhCN: '烟花轨迹先定一条线，追着光来回改，画上只会叠成一团。',
        en: 'Choose one firework trail first; chasing the light in revisions just makes a tangle.',
      },
      festival: 'bonfire-night',
    },
    {
      id: 'yao-flatmate-daily-55',
      text: {
        zhCN: '圣诞集市木牌右边低半指，垫片得加在底脚，光扶是扶不平的。',
        en: "The Christmas sign drops half a finger to the right; shim the foot, holding won't level it.",
      },
      festival: 'christmas-market',
    },
  ],
});

const moments: {
  npc: string;
  hearts: number;
  title: Text;
  text: Text;
  labels: Text[];
  requires?: string[];
  when?: GameEvent['when'];
  sets?: string[];
}[] = [
  {
    npc: 'jamie',
    hearts: 2,
    title: {
      zhCN: '修不好的汤',
      en: 'Soup is not a repair job',
    },
    text: {
      zhCN: '杰米说自己能把松动的柜门修好，炖汤却总拿不准。你问汤少了什么，他认真列出厨房现有的东西。\n「我不是问库存。」你说。他愣一下，尝了尝自己的那碗：「索菲娅，咱家这锅怕你不爱吃！」\n他习惯用做饭表示欢迎，却常常只问够不够，不问你究竟想吃什么，好像饿不着就算照顾好了。\n你说家里可以有不一样的口味。他点头，把那句「我都可以」收回，承认自己也有不想吃的菜。\n他翻出沾油的食谱，边上写着「别凭感觉」。你问谁写的，他指自己：「写的时候，我可有把握了！」\n汤没变得完美。杰米尝了一口，终于没问「够不够」：「咱家菜单一块写！索菲娅，写你爱吃的。」',
      en: 'Jamie says he can fix a loose cupboard door but never quite gets soup right. Asked what it lacks, he lists the kitchen supplies.\n“I wasn’t asking for stock.” He pauses and tastes his bowl. “Sofia, scared you won’t like our soup!”\nCooking is his way to welcome you. He usually asks whether there is enough, rather than what you want, as though not going hungry settles care.\nYou say a home can hold different tastes. He nods, withdraws “Anything’s fine” and admits there are dishes he would rather not eat too.\nHe finds the grease-spotted recipe. “Don’t go by feel” is written in the margin. You ask who wrote it. He points to himself. “Oh, I was certain when I wrote it!”\nThe soup stays imperfect. Jamie tastes it and finally asks something other than “Enough?” “Let’s write our menu together! Sofia, what do you love?”',
    },
    labels: [
      {
        zhCN: '直说你喜欢的味道',
        en: 'Say which flavours you like',
      },
      {
        zhCN: '问他真正喜欢吃什么',
        en: 'Ask what he actually likes eating',
      },
    ],
  },
  {
    npc: 'jamie',
    hearts: 4,
    title: {
      zhCN: '熟悉也会走错',
      en: 'Familiar ground can trip you',
    },
    text: {
      zhCN: '杰米说自己小时候在这里迷过路，明明认得街名，却为了不被笑，硬说是在带别人抄近路。\n你问后来谁找到他的。他说自己绕回来，家里没有人知道。他把这事当笑话讲了很多年。\n「现在听着不太好笑。」你说。他点头：「索菲娅，球都敢射偏，带咱们出门倒怕人笑！」\n你刚到时，他也常抢着解释，仿佛熟悉小镇的人不该犹豫，却很少问你要不要另找一种走法。\n他翻出手机拍过的一块路牌，说小时候总认错。你照着念，他也跟着念，念到一半才发现手机拿反了。\n他想了想：「咱们这回你带队，索菲娅！」说完又笑，「哎，我这腿又差点抢跑。」',
      en: 'Jamie once got lost here as a child. He knew the street names but claimed to be taking a shortcut so nobody would laugh.\nYou ask who found him. He got back by circling round, and nobody at home knew. He has told it as a joke for years.\n“Doesn’t sound very funny now.” He nods. “Sofia, I can miss a shot, but dread looking daft taking us out!”\nWhen you first arrived he rushed to explain, as if a local should never hesitate. He rarely asked whether you wanted to find another way.\nHe finds a phone photograph of a sign he used to mistake as a child. You read it; he joins in, then realises he is holding the phone upside down.\nHe considers it. “You lead us this time, Sofia!” Then a smile. “Ah, my legs nearly ran ahead again.”',
    },
    labels: [
      {
        zhCN: '问他如今还有什么没把握',
        en: 'Ask what still makes him unsure',
      },
      {
        zhCN: '讲一件你想自己摸索的事',
        en: 'Name something you want to find out yourself',
      },
    ],
  },
  {
    npc: 'jamie',
    hearts: 6,
    title: { zhCN: '不靠修东西回答', en: 'An answer without a toolkit' },
    text: {
      zhCN: '杰米翻着工具盒，过一会儿才承认，没有东西坏。他说手里忙一点，难说的话就能迟一点开口。\n你问是什么话。他把盒子关上：「索菲娅，咱们这家过得不开心，我怕当初吹过头！」\n你说不开心的日子不全是他的责任。他却习惯先找能修的东西，连你的沉默也被他当成故障。\n「我不是门铰链。」你说。他笑了一下，随后认真点头，第一次没有接着列出解决的办法。\n一颗螺丝从盒盖滚下来，他下意识接住，又摊开手掌：「这颗倒能修！哎，先放下。」你笑了，难说的话还没走。\n工具盒安静放着。杰米看了它一眼，没有再伸手：「索菲娅，咱们先说话！哎，家里这工具先收住。」',
      en: 'Jamie searches his toolbox, then admits nothing is broken. Busy hands let him postpone a difficult sentence a little longer.\nYou ask which sentence. He closes the box. “Sofia, if we’re unhappy at home, I’m scared I made it sound too easy!”\nYou say unhappy days are not all his responsibility. He instinctively looks for something to fix, even treating your silence like a fault.\n“I’m not a door hinge.” He laughs, then nods properly. For once he does not follow it with a list of solutions.\nA screw rolls off the lid. He catches it automatically, then opens his hand. “This one I can fix! Ah, put it down first.” You laugh. The difficult subject has not gone anywhere.\nThe toolbox stays quiet. Jamie glances at it without reaching. “Sofia, let’s talk first! Ah, our tools can stay put.”',
    },
    labels: [
      {
        zhCN: '说清哪件事你只想被听见',
        en: 'Name something you only want him to hear',
      },
      {
        zhCN: '请他把自己的害怕讲完',
        en: 'Ask him to finish saying what frightens him',
      },
    ],
  },
  {
    npc: 'jamie',
    hearts: 8,
    title: {
      zhCN: '椅子不是借口',
      en: 'The chair is not an excuse',
    },
    text: {
      zhCN: '杰米把摇晃的椅子修好，仍不肯坐下。你问还差什么，他又检查一遍已经拧紧的螺丝。\n「你总说等我忙完。」你说，「可总有下一样要修。」他停住手，承认自己也听见这句话了。\n他怕一坐下来，就得谈没有工具能解决的事；你也累了，不想总等到自己爆发，才换来一次认真相处。\n你可以坚持现在坐下谈，不再往后拖；也可以说今天已经没有力气，约定另一天，接受他暂时以为你在退开。\n椅面留着一个旧杯圈。杰米说擦不掉，你说这回没人叫他擦，他的手才从抹布旁收回来。\n椅脚不晃了，谈话却没有自动站稳。杰米扣上工具盒：「索菲娅，咱们的事我记下！家里再多活也得赴约。」',
      en: 'Jamie finishes fixing the wobbling chair but will not sit. Asked what remains, he checks the tightened screws again.\n“You always say once I’m finished. There’s always another job.” His hands stop. He admits hearing himself say it too.\nHe fears questions no tool can solve. You are tired of waiting until you explode before getting serious time together.\nYou can insist on talking now without postponement, or admit you have no strength today and agree another day, accepting that he may feel you pulling away.\nAn old cup ring marks the seat. Jamie says it will not come off. You say nobody asked him to clean it this time. His hand leaves the cloth alone.\nThe chair is steady; the conversation is not. Jamie shuts the toolbox. “Sofia, I’ll note our time! However much needs doing at home, I’m turning up.”',
    },
    labels: [
      {
        zhCN: '坚持现在坐下，不再拖延谈话',
        en: 'Insist on sitting now without postponing',
      },
      {
        zhCN: '承认今天无力，另约时间并承担误会',
        en: 'Admit you cannot today, arrange time and accept the misunderstanding',
      },
    ],
    sets: ['family-chairs-mended'],
  },
  {
    npc: 'jamie',
    hearts: 10,
    title: { zhCN: '给椅子取名字', en: 'Names for the chairs' },
    text: {
      zhCN: '修好的椅子被杰米起名叫「先坐下」，另一把叫「听完再说」。你问这名字会不会太长。\n「咱家名字，比我借口短啦！」他说。你笑，他也笑，却没有再添一句把认真藏起来的玩笑。\n他仍爱修东西，也仍会猜错你的心情。现在猜不准时，能先问一句，而不是立刻去拧螺丝。\n你们决定不固定谁坐哪把椅子，谁想说话就先坐。一个人坐下，另一个也不必马上变成问题解决者。\n他把名字写在纸牌上，试着系到椅背，结打大了，自己坐下先硌了一下。「哎哟，名字把我硌了！」他说。\n杰米拍一下「先坐下」的椅背：「索菲娅，咱家椅子换名就换！哎，又硌了。」他自己先坐，不再检查椅脚。',
      en: 'Jamie names the repaired chair “Sit down first” and the other “Hear it out”. You ask whether the names are too long.\n“Our chairs’ names are shorter than my excuses!” You both laugh, and he adds no further joke to hide the serious part.\nHe still likes fixing things and still misreads your mood. When unsure now, he can ask before reaching for a screwdriver.\nYou decide neither chair belongs to one person. Whoever wants to talk sits first; the other need not immediately become a problem-solver.\nHe writes the names on paper tags and tries tying them to the chair backs. The oversized knot pokes him when he sits. “Ow, the name’s poking me!” he says.\nJamie pats “Sit down first”. “Sofia, change our chairs’ names whenever! Ah, poked myself again.” He sits without inspecting the legs again.',
    },
    labels: [
      { zhCN: '先坐下，让他听你说', en: 'Sit first and let him listen' },
      {
        zhCN: '给两把椅子改个更短的名字',
        en: 'Suggest shorter names for both chairs',
      },
    ],
    requires: ['family-chairs-mended'],
    sets: ['family-named-chairs'],
  },
  {
    npc: 'ka-ning-partner',
    hearts: 2,
    title: {
      zhCN: '简历不是全家福',
      en: 'A CV is not a family portrait',
    },
    text: {
      zhCN: '文舒把看过的简历翻到背面，孩子画的猫挤在工作经历后面。她说那天写到一半就去接孩子了。\n你笑说猫也算参与项目。她摇头：「嘉宁，讲好先，我的工作经历别全算管家。」\n她说那时找工作，不只想添一笔收入，也想有人问她会做什么。这份心思到现在没有变。\n你说自己没想到那句玩笑会绕回家务。她指着简历：「我想先谈工作。家务留饭后，还是明早接着谈？」\n她指指猫旁的一行小字，是当年面试想说的话。孩子把句号画成猫粮，她到现在仍认得自己当时要说什么。\n文舒把简历正面朝上：「讲好先，乐言接送还得分。嘉宁，先谈工作还是接送？」',
      en: 'Man Shu turns the reviewed CV over. The child’s cat crowds behind her work history. She stopped writing that day to do the school run.\nYou joke that the cat counts as project work. She shakes her head. “Ka Ning, let’s agree first: my work experience isn’t all housekeeping.”\nShe says job-hunting then meant more than another household income. She wanted to be asked what she could do. That wish has not changed.\nYou had not realised your joke led back to chores. She points to the CV. “I want work first. Chores after dinner, or tomorrow morning?”\nShe points to a small line beside the cat: something she meant to say at an interview then. The child turned its full stop into cat food. Even now, she still knows what she meant to say then.\nMan Shu turns the CV face up. “Agree first: Lok Yin’s school runs still need splitting. Ka Ning, work or pickups first?”',
    },
    labels: [
      {
        zhCN: '先听她说想做什么工作',
        en: 'Hear what work she wants to do first',
      },
      {
        zhCN: '先重新分清接送和做饭',
        en: 'Start by reallocating school runs and cooking',
      },
    ],
    requires: ['bno-partner-cv-seen'],
  },
  {
    npc: 'ka-ning-partner',
    hearts: 4,
    title: {
      zhCN: '相册也要署名',
      en: 'Who made the album',
    },
    text: {
      zhCN: '文舒开始整理相册，几张照片旁都写了她的说明。你说看着像她写的家庭年报，她没有跟着笑。\n「嘉宁，讲好先，全家相册不能只漏我名字。」她说完，又把语气放缓。\n她不是不想记这些事，只是不想连全家应该记住什么，都自动落到自己头上，还被算成爱好。\n你问怎样一起做。她让你选一张自己记得的照片，先说发生了什么，不翻她写好的说明。\n一张照片拍进了她半截手指。你以为会淘汰，她却留下：「我总算入镜了。讲好先，半根手指也算我。」\n她选一张照片推到中间：「我这页写好了。嘉宁，你先讲乐言这张，还是贴自己的？」',
      en: 'Man Shu begins an album, adding captions to several photographs. You call it her family annual report. She does not laugh.\n“Ka Ning, agree first: mine can’t be the only name missing from our family album.” She finishes, then softens her voice.\nShe wants the memories, but does not want deciding what the whole family remembers to fall to her automatically and then be called her hobby.\nYou ask how to do it together. She asks you to choose a photograph and describe what happened without checking her caption.\nOne photograph includes half her finger. You expect it to be rejected. She keeps it. “Finally in it. Let’s agree first: half a finger still counts as me.”\nShe places a photograph between you. “My page is written. Ka Ning, Lok Yin’s photo story first, or stick yours down?”',
    },
    labels: [
      {
        zhCN: '各自写同一张照片的记忆',
        en: 'Each caption the same photograph from memory',
      },
      {
        zhCN: '把照片背后谁做了什么写进去',
        en: 'Name the work behind the photograph',
      },
    ],
    sets: ['family-album-started'],
  },
  {
    npc: 'ka-ning-partner',
    hearts: 6,
    title: {
      zhCN: '清单以外的我',
      en: 'Me beyond the list',
    },
    text: {
      zhCN: '夜里过了八点，文舒把计算器关掉，先说这次不核账。你习惯性问明天还要做什么，她叹了口气。\n「嘉宁，家事记住，人漏啦？」她问。你说她可以歇会儿，她摇头：「讲好先，我要聊天。休息我自己会安排。」\n她讲起从前爱看的电影，才说了开头，就发现自己又在解释为什么没有时间继续看。\n你请她不用交代理由。文舒想了一会儿，重新从那个荒唐的情节讲起，越说越觉得好笑。\n她学着片中人郑重宣布一件蠢事，声音太像平时核账，自己先笑弯了腰，连结尾都说不下去。\n她把那个荒唐情节重新讲了一遍，自己笑得最早：「香港那时就爱这部。嘉宁，你接着听，还是讲自己的？」',
      en: 'After eight at night Man Shu switches off the calculator and says this is not an accounts check. You automatically ask what needs doing tomorrow. She sighs.\n“Ka Ning, remembered the chores, missed the person?” You say she can rest. She shakes her head. “Let’s be clear, I want a chat. I can arrange my own rest.”\nShe begins describing a film she used to love, then catches herself explaining why she has had no time to continue watching.\nYou say no justification is needed. She thinks, starts again with the ridiculous plot and begins laughing as she tells it.\nShe solemnly announces something foolish in the character’s voice. It sounds so much like her accounts checks that she doubles up laughing before reaching the end.\nShe starts the ridiculous plot again and laughs first. “Loved this back in Hong Kong. Ka Ning, listen on or tell your own scene?”',
    },
    labels: [
      {
        zhCN: '陪她把那段电影聊完',
        en: 'Hear the film plot right through',
      },
      {
        zhCN: '说一件只为自己想做的事',
        en: 'Share something you want just for yourself',
      },
    ],
    when: [
      {
        minuteMin: 1200,
      },
    ],
  },
  {
    npc: 'ka-ning-partner',
    hearts: 8,
    title: {
      zhCN: '这页不归我补',
      en: 'This page is not mine to finish',
    },
    text: {
      zhCN: '相册摊着一页新照片，你说等文舒有空再整理。她把胶角放下：「嘉宁，讲好先，全家相册等我，就是又派我？」\n你说不是故意的。她点头：「知道。讲好先，从香港搬来就我理，这回分工。」\n她想固定分工，你却不愿每件家庭小事都像排班。两个人说的是同一本相册，担心的并不是同一件事。\n这页你可以自己贴完，答应以后主动轮流；也可以一起贴完，却坦承不愿立刻答应轮班，继续谈怎样才公平。\n胶角粘到她袖口，她揭下来放在桌上，没有像往常那样顺手把所有散片一起收好。\n这页最终要贴好，但不能贴完就算解决。文舒说：「我还想谈清楚。现在说下次，还是晚饭后接着？」',
      en: 'The album lies open at a new page. You suggest Man Shu arrange it when free. She puts down the photo corners. “Ka Ning, agree first: waiting for me means our family album’s mine again?”\nYou say you did not intend that. She nods. “I know. Agree first: I’ve done it since we moved from Hong Kong. Share it this time.”\nShe wants fixed responsibilities. You do not want every family task turned into a rota. One album, two different fears.\nYou can finish this page yourself and commit to unprompted turns, or finish it together but refuse to promise a rota yet, keeping fairness open for discussion.\nA photo corner sticks to her sleeve. She peels it off onto the table without automatically tidying every loose piece as usual.\nThe page must eventually be mounted, but finishing it is no settlement. “I want this settled properly. Plan the next time now, or talk after dinner?”',
    },
    labels: [
      {
        zhCN: '承担这页，以后主动轮流整理',
        en: 'Take this page and commit to unprompted turns',
      },
      {
        zhCN: '一起贴完这页，但不勉强承诺轮班',
        en: 'Finish this page together without promising a rota yet',
      },
    ],
    requires: ['family-album-started'],
    sets: ['family-album-page'],
  },
  {
    npc: 'ka-ning-partner',
    hearts: 10,
    title: { zhCN: '不是她一个人记', en: 'Not hers to remember alone' },
    text: {
      zhCN: '文舒拿出相册，这次先问你记下了哪件事。你讲完，她才翻到自己的记录，两页竟然没有撞题。\n「嘉宁，这月总算收了你的相册功课。」她说。你问这算不算夸奖，她答：「算。讲好先，剩下的继续谈。」\n分工还会争，谁更辛苦也未必说得齐；这次你记得自己开始，文舒没有把这一步算成一切解决。\n你们决定以后每次整理都各选一件事，谁选谁写，文舒不再替所有人的记忆收尾，空缺就等本人。\n她的照片背面还留着买菜单，最后一项写「别忘了自己」。你问买了什么，她说先买了新笔。\n文舒把笔放在你自己的那页旁：「讲好先，全家相册各写各的。嘉宁，我那页得由我讲。」',
      en: 'Man Shu brings out the album and first asks what you recorded. After your story she opens her page. You have chosen entirely different things.\n“Ka Ning, finally got your album homework this month.” You ask whether that is praise. “It is. Let’s agree first: we still discuss the rest.”\nResponsibilities still cause arguments, and you may disagree over who is more tired. You remembered to begin this time; Man Shu does not call that a complete solution.\nYou agree each will choose and write one memory when arranging the album. She will no longer finish everyone’s contribution; missing pieces wait for their owners.\nA shopping list remains on the back of her photograph. Last item: “Don’t forget yourself.” You ask what she bought. She says a new pen came first.\nMan Shu places a pen by your page. “Agree first: each writes their part of our family album. Ka Ning, my page is mine to tell.”',
    },
    labels: [
      {
        zhCN: '记一件属于她自己的进展',
        en: 'Record progress that belongs to her',
      },
      {
        zhCN: '记一件你自己没做好的事',
        en: 'Record something you could have done better',
      },
    ],
    requires: ['family-album-page'],
    sets: ['family-yearly-album'],
  },
  {
    npc: 'ka-ning-child',
    hearts: 2,
    title: {
      zhCN: '鸭子会不会翻译',
      en: 'Can ducks translate',
    },
    text: {
      zhCN: '乐言打开一本鸭子故事，先问鸭子在不同地方叫得一不一样。你说不知道，孩子立刻很满意。\n「那你不能先教我。」乐言指着图，「这关靠猜！谁笑，谁念下一页。」\n你照自己的叫法学了一声，孩子认真纠正，又停下来，问这是不是跟学校里听到的口音一样。\n你说一个人可以听见不止一种声音。乐言想了想，让两只鸭子各叫各的，没有替它们选队。\n乐言用书角遮住嘴，说这样才考得出鸭子的水平。你刚叫一声，孩子连书都笑得拿不稳了。\n乐言让两只鸭子各叫各的，自己先笑出了声：「好，扣我一分！下一页你也得配音，鸭子有嘴就要出声。」',
      en: 'Lok Yin opens a duck story and asks whether ducks sound different in different places. Your “I don’t know” is immediately satisfying.\n“Then you can’t teach me first. Guessing level! Laugh, and you read the next page.” A finger taps the picture.\nYou try your duck noise. Lok Yin corrects it, then pauses and asks whether this is like the accents heard at school.\nYou say a person can hear more than one kind of voice. After a thought, each duck gets its own noise. Neither has to choose a side.\nLok Yin hides a mouth behind the book’s corner: a proper duck test needs hidden faces. Your first noise makes the child laugh too hard to hold it steady.\nLok Yin lets each duck keep its noise and laughs first. “Fine, one point off me! Your voices next page too. Ducks with mouths have to make noises.”',
    },
    labels: [
      {
        zhCN: '让乐言先给两只鸭子配音',
        en: 'Let Lok Yin voice both ducks first',
      },
      {
        zhCN: '配一个完全不像鸭子的声音',
        en: 'Make a noise nothing like a duck',
      },
    ],
  },
  {
    npc: 'ka-ning-child',
    hearts: 4,
    title: {
      zhCN: '画里谁先开口',
      en: 'Who speaks in the picture',
    },
    text: {
      zhCN: '乐言画了一扇门，门里门外各有一个说话框。你问里面写什么，孩子先把纸盖住。\n「学校一队，家里一队！先保密，我还没定谁先开口。」\n你问为什么不能一起说。乐言皱眉，说那样听起来很吵，而且有些笑话换个说法就不好笑了。\n你没有挑哪种更好，孩子才把画翻回来，让门开着，自己在两个框之间添了一条弯弯的线。\n乐言给门上添了一个猫洞，说听不懂的词可以先从下面溜进去。你问那猫又该怎么办，孩子却说猫根本不用解释。\n乐言在两个说话框之间添了一条弯线：「这条是排队线！说太快就退后，我还没叫到你的号。」',
      en: 'Lok Yin draws a door with a speech bubble on either side. Asked what they say, the child covers the page first.\n“School team, home team! Secret first. Haven’t picked who starts.”\nYou ask whether both can speak. Lok Yin frowns: that would be noisy, and some jokes stop being funny when said another way.\nYou choose neither as better. The picture turns back, the door stays open, and a wavy line appears between the bubbles.\nLok Yin adds a cat flap for words that are not understood to slip through underneath. You ask what the cat is supposed to do, then. But the child says cats never have to explain.\nLok Yin adds a wavy line between the bubbles. “This is the queue line! Too fast, go back. Haven’t called your number yet.”',
    },
    labels: [
      {
        zhCN: '按乐言排的顺序读出来',
        en: 'Read in the order Lok Yin chooses',
      },
      {
        zhCN: '请乐言教你一个学校里的说法',
        en: 'Ask Lok Yin to teach you a school expression',
      },
    ],
    sets: ['family-shared-drawing'],
  },
  {
    npc: 'ka-ning-child',
    hearts: 6,
    title: {
      zhCN: '门框不能请假',
      en: 'The doorframe cannot come',
    },
    text: {
      zhCN: '乐言比着门框上记身高的线，问要是以后搬家，是不是就要重新从最下面长起。\n你说人不会变矮，孩子摆手：「我知道。我问别人怎么知道我不是一下子长这么高的。」\n旧线旁边有一处乱笔，乐言说那是自己偷偷踮脚的证据，不能擦，擦掉就少了一段故事。\n你问要不要记在别处。孩子认真考虑：「门框不能请假跟我们走。照片倒不用买车票。」\n孩子拿书压住翘起的头发，又觉得太像顶着屋顶。你刚伸手，乐言立刻站得很直：「暂停！头发翘，量算作弊。」\n乐言看了一眼你的手机，又指指旧线：「先记这段！头发那次扣身高分，但准讲故事。」',
      en: 'Lok Yin studies the height marks on the doorframe. Would moving mean growing from the bottom all over again?\nYou say a person does not shrink. The child waves that away. “I know. How will people know I didn’t grow this tall in one go?”\nA scribble beside an old mark is evidence of secretly standing on tiptoe. It must stay: rubbing it out would remove part of the story.\nYou ask about recording the marks elsewhere. “The doorframe can’t take leave and come. Photos don’t need train tickets.”\nThe child flattens the sticking-up hair with a book, then says it feels like wearing a roof. As you reach over, Lok Yin immediately stands very straight. “Pause! Hair’s up. Measuring is cheating.”\nLok Yin glances at your phone, then points to an old mark. “Record this bit! Hair loses height points, but the story qualifies.”',
    },
    labels: [
      {
        zhCN: '先拍下旧线，也拍进乱笔',
        en: 'Photograph the marks, scribble included',
      },
      {
        zhCN: '请乐言给每条线讲一句话',
        en: 'Ask for a sentence about every mark',
      },
    ],
  },
  {
    npc: 'ka-ning-child',
    hearts: 8,
    title: {
      zhCN: '这张我来选',
      en: 'I choose this photograph',
    },
    text: {
      zhCN: '乐言挑一张寄给外婆的照片，你说另一张脸更清楚。孩子把选中的照片翻扣在桌上。\n「你总选乖小孩那张！这张我讲笑话，歪嘴能加好笑分。」乐言说。\n你确实希望外婆看清孩子，乐言却想让她知道自己会说什么，而不是只看一张摆好的笑脸。\n你可以尊重孩子的选择，让乐言自己写说明；也可以坚持这次由你挑清楚的照片，承认孩子会失望。\n照片旁有一张写坏的信纸，「外婆」两个字特别大。乐言认真地说要写大一点，是怕信封里的话挤得她看不见。\n乐言没再把照片翻过来：「等等，寄的是我吧？」你得回答这句话，不能只用一句为你好把分歧封上。',
      en: 'Lok Yin chooses a photograph for Grandma. You prefer another with a clearer face. The chosen picture goes face down.\n“You always pick the good-child one! I’m telling a joke here. Crooked mouth gets funny points.”\nYou really want Grandma to see clearly. Lok Yin wants her to know what the child says, not only see an arranged smile.\nYou can respect the choice and let Lok Yin write a caption, or insist on choosing the clearer photograph yourself this time, acknowledging the disappointment.\nA spoiled letter draft lies beside the photographs, with “Grandma” especially large. Lok Yin solemnly says the writing must be larger to stop the other words in the envelope crowding her out.\nThe picture stays face down. “Wait, that’s me being sent, right?” You must answer that, without sealing the disagreement with “It’s for your own good.”',
    },
    labels: [
      {
        zhCN: '尊重乐言选择，让孩子自己说明',
        en: 'Respect the choice and let Lok Yin explain',
      },
      {
        zhCN: '坚持挑脸更清楚的，承认孩子会失望',
        en: 'Choose the clearer face yourself and acknowledge the disappointment',
      },
    ],
    sets: ['heart-child-photo'],
  },
  {
    npc: 'ka-ning-child',
    hearts: 10,
    title: { zhCN: '不用从头长高', en: 'No need to grow again' },
    text: {
      zhCN: '乐言把门框上的线抄到一卷长纸上，还抄了那次踮脚的歪记号。你问为什么连作弊也带走。\n「不然以后我说自己从来不踮脚，谁知道我在吹牛？」孩子说完，把自己的名字写在纸边。\n照片寄出去以后，乐言发现外婆也量了自己，只是没有变高。纸上便添了一条不同的线。\n照片那次的意见未必一样，乐言仍决定量身高先问本人，再让那个人选一句话，不只记数字和日期。\n纸卷差点自己滚走，乐言拿鸭子故事压住：「鸭子也报名！我长高了，这书怎么还在原来那关？」\n乐言把长纸慢慢卷起，又停住：「还有谁报名？大人也能写！只量我，这个游戏人数不够。」',
      en: 'Lok Yin copies the doorframe marks onto a long paper roll, including the crooked evidence of tiptoeing. You ask why the cheating comes too.\n“Otherwise I could say I never did it. Who’d know I was boasting?” A name goes along the paper’s edge.\nAfter receiving the photograph, Grandma measured herself as well, though she had not grown. A different sort of line joins the roll.\nYou may still differ over the photograph. Lok Yin decides height recording starts with permission and each person’s own sentence, not only numbers and dates.\nThe roll nearly escapes. Lok Yin pins it with the duck story. “Ducks enter too! I got taller. Why’s this book still on the old level?”\nLok Yin rolls the paper slowly, then stops. “Who else is entering? Grown-ups can write too! Only measuring me, this game needs more players.”',
    },
    labels: [
      {
        zhCN: '在长纸上写一句自己的话',
        en: 'Write your own sentence on the roll',
      },
      {
        zhCN: '让乐言选今天要记的话',
        en: 'Let Lok Yin choose today’s sentence',
      },
    ],
    requires: ['heart-child-photo'],
    sets: ['family-height-roll'],
  },
  {
    npc: 'yao-flatmate',
    hearts: 2,
    title: {
      zhCN: '架子不画中线',
      en: 'No line down the shelf',
    },
    text: {
      zhCN: '周沅量完共用架子的宽，撕掉原先画中线的纸。你问不用分清楚吗，她说先说清用途。\n「私物单放才找得到，共用的用完照原位置放回。」她把句子停在这里，没有补一句随便就好。\n你笑她像在装裱一份合租合同。她点头：「架子量好宽度才分范围，摆进去还得各试一遍。」说完才露出一点笑。\n她不想每次找东西都猜谁在让谁，也不想因为住在一起，就把所有东西自动算成大家的。\n架子上一个旧碗卡住纸签，周沅量过才说：「签宽合格。碗偏了三度。」她把尺横放，没替你移碗。\n周沅把量尺收好：「直接报。共用什么，私物什么，分别标。」她没有先写你的名字，等你自己定边界。',
      en: 'Yuan measures the shared shelf, then removes the paper marking its middle. You ask whether it needs dividing. She wants its purpose clear first.\n“Private things stay separate so we find them, shared tools return to their place.” She stops there, without adding that anything will do.\nYou joke she is framing a flatshare agreement. She nods. “Measure the shelf before dividing it, then each test what fits.” Only then does she smile a little.\nShe does not want finding things to involve guessing who is accommodating whom, or living together to make every possession automatically communal.\nAn old bowl traps a label on the shelf. Yuan measures before saying, “Label width correct. Bowl three degrees off.” She rests the ruler across it without moving your bowl.\nYuan puts away the ruler. “State it. Shared items, private items. Label separately.” She leaves your name unwritten while you decide your edges.',
    },
    labels: [
      {
        zhCN: '一起定清哪些东西共用',
        en: 'Agree which things are shared',
      },
      {
        zhCN: '先说自己不想借出的东西',
        en: 'Name something you would rather not lend',
      },
    ],
    sets: ['flatmate-shelf'],
  },
  {
    npc: 'yao-flatmate',
    hearts: 4,
    title: {
      zhCN: '清单上的主语',
      en: 'The subject of the checklist',
    },
    text: {
      zhCN: '周沅把屋里待修的地方写进清单，每项前面都加了「谁来问」。你说记毛病就够了吧。\n「漏水先拍照再找房东，每一步都得填谁负责。」她说以前住过的地方，问房东的事默认都归她。\n大家夸她说得清楚，后来连她自己的事也挤到后面。她不想在新一份清单里再次变成隐形主语。\n你问要不要轮着来。她说可以，但别把「你比较会说」又写成轮到自己时的例外。\n便签卷起一角，她压了两回，干脆把那角折好：「翘两毫米。折角，暂不固定上墙。」\n她在「谁来问」下面停笔：「这项你认领。名字自己填；我停笔。」清单列着问题，不再把一个人列成全部办法。',
      en: 'Yuan adds “Who asks?” before every repair on the checklist. You suggest recording the faults alone would be enough.\n“Photograph the leak before calling the landlord, with a person for each step.” In a previous home, questions to the landlord defaulted to her.\nPeople praised her clarity until even her own concerns moved to the back. She does not want to become the new checklist’s invisible subject.\nYou suggest taking turns. That works, she says, provided “You’re better at explaining” does not become an exception on your turn.\nA corner curls up. After pressing it twice, she folds it neatly instead. “Two millimetres raised. Fold corner; no permanent wall fixing yet.”\nHer pen stops beneath “Who asks?” “Choose your item. Fill your own name; my pen stops here.” The list holds problems, without one person becoming every solution.',
    },
    labels: [
      {
        zhCN: '先认领一项，由你自己去问',
        en: 'Take one item and ask about it yourself',
      },
      {
        zhCN: '一起给每一项分清负责人',
        en: 'Assign responsibility for every item together',
      },
    ],
    requires: ['flatmate-shelf'],
    sets: ['flatmate-checklist'],
  },
  {
    npc: 'yao-flatmate',
    hearts: 6,
    title: {
      zhCN: '汤不用讲道理',
      en: 'Soup needs no argument',
    },
    text: {
      zhCN: '晚些时候，周沅喝着汤，说今天不想讲工作。你刚准备转个轻松话题，她又叫住你。\n「话停这里，汤我想慢慢喝完。」她说。你问会不会太冷清，她摇头：「生气会直说，今天只是做累了。」\n她以前总怕一起住的人误会，明明累了，还得说几句证明彼此没事，最后连休息也像在交代。\n你说这回不用证明。周沅喝了一口，才告诉你，自己其实担心不继续聊天，会显得不够欢迎你。\n她尝汤时发现一片姜，以为是土豆，又放回碗边：「姜片。我切的；厚度跟土豆重了。」\n汤的热气慢慢散开，周沅没有找下一个话题。「确认收到就行。」她说，「今天就喝汤，我还要添半碗。」',
      en: "Later in the day Yuan drinks soup and says she does not want work talk. You start changing to something lighter. She stops you.\n“Leave the talk here. I'd like to finish my soup slowly.” You ask whether that feels cold. She shakes her head. “I'll say if I am angry. Today I am just tired.”\nShe used to fear misunderstandings with housemates. Exhausted, she still spoke to prove nothing was wrong, until even resting became an explanation.\nYou say she need not prove it now. After a sip she admits worrying that not continuing the conversation might make you feel unwelcome.\nShe mistakes a slice of ginger for potato while tasting the soup, then puts it at the bowl’s edge. “Ginger. My cutting; same thickness as the potato.”\nThe steam thins. Yuan finds no next topic. “Acknowledge receipt,” she says. “Just soup today. Another half bowl for me.”",
    },
    labels: [
      {
        zhCN: '一起安静喝汤，不填话题',
        en: 'Drink quietly without supplying a topic',
      },
      {
        zhCN: '约一句表示需要独处的短话',
        en: 'Agree on a short phrase for time alone',
      },
    ],
    requires: ['flatmate-checklist'],
    when: [
      {
        minuteMin: 1020,
      },
    ],
    sets: ['flatmate-quiet-soup'],
  },
  {
    npc: 'yao-flatmate',
    hearts: 8,
    title: {
      zhCN: '告示板不是派工单',
      en: 'The board is not a work order',
    },
    text: {
      zhCN: '周沅在旧装裱背板上做了告示板，你发现上面写着一串提醒，自己的名字却只出现在最后。\n你说像接到派工单。她先说只是怕漏事，随后停住：「我排的时候漏了确认，这一步得由我擦掉重写。」\n她知道边框得清楚，却还是把合住的人装进自己的尺寸。你也累着，不想再开一场合租会议。\n你可以现在重谈，写下先同意再安排的规矩；也可以要求今天先各自冷静，接受暂时没有新办法。\n背板角上还贴着旧价签，她刮到一半，看着露出的数字：「旧框价签。刮掉；这回报零工时。」\n周沅擦掉没问过你的安排：「暂停。铅笔留这；从头核。」板上没有谁赢的记号，也没有假装已经重新量准。',
      en: 'Yuan makes a noticeboard from old mounting board. A chain of reminders ends with your name only at the bottom.\nYou call it a work order. She begins explaining fear of omissions, then stops. “I left confirmation out when planning it, so I must erase and rewrite that step.”\nShe knows clear edges matter, yet has fitted a housemate to her dimensions. You are tired too and do not want another flat meeting immediately.\nYou can renegotiate now and require agreement before arrangements, or ask for space today, accepting that no new method is ready yet.\nAn old price label remains on the board’s corner. Halfway through scraping it off, she looks at the exposed figures. “Old frame label. Scrape off; zero labour hours billed this time.”\nYuan erases plans made without your agreement. “Paused. Pencil here; check from start.” No victory mark appears, nor a pretence that everything fits again.',
    },
    labels: [
      {
        zhCN: '现在重谈，先同意再安排',
        en: 'Renegotiate now: agreement before arrangements',
      },
      {
        zhCN: '今天先各自冷静，承诺以后再谈',
        en: 'Take space today and agree to return to it',
      },
    ],
    requires: ['flatmate-quiet-soup'],
    sets: ['flatmate-board'],
  },
  {
    npc: 'yao-flatmate',
    hearts: 10,
    title: { zhCN: '地图画上停顿', en: 'Pauses on the map' },
    text: {
      zhCN: '周沅把屋内小地图画在告示板背面，厨房旁画汤碗，门口画鞋，房门前却只画了一个停顿号。\n「门前三步停了再敲，空够转身。」她说。你问要不要标她常去的路，她摇头：「只标使用范围。去向不登记。」\n你们对告示板未必全谈妥了。周沅说人的需要还会变，地图只能提醒问话，不能证明一切已经合适。\n周沅决定铅笔就挂在板边，谁觉得哪条路不舒服，随时指出来，不必等攒够一场争执才重画。\n她给鞋架画得太窄，鞋尖挤出线外。你指出来，周沅重画：「鞋架重画。实际宽度，多出五厘米。」\n周沅把铅笔挂好，没给地图封框：「改动直接标。铅笔软芯，橡皮在右；按新尺寸重画。」',
      en: 'Yuan draws a little map of the flat on the board’s reverse. A soup bowl by the kitchen, shoes at the entrance, a pause before each bedroom door.\n“Stop three steps before the door, then knock, leaving room to turn.” You ask about marking her usual routes. She shakes her head. “Usage areas only. Movements not logged.”\nThe noticeboard may not be fully agreed yet. Yuan says needs change: a map can remind you to ask, not prove everything already fits.\nYuan will keep a pencil on the board. Either can point out an uncomfortable route without saving enough grievances for an argument before redrawing.\nShe draws the shoe rack too narrow, toes protruding past the line. When you point it out, Yuan redraws it. “Redraw rack. Actual width, five centimetres more.”\nYuan hangs up the pencil, leaving the map unframed. “Mark changes directly. Soft pencil, eraser right; redraw to the new measurements.”',
    },
    labels: [
      { zhCN: '添一处你自己需要的停顿', en: 'Add a pause you need' },
      {
        zhCN: '请她先改一处现在不合适的',
        en: 'Ask her to change something that no longer fits',
      },
    ],
    requires: ['flatmate-board'],
    sets: ['flatmate-map'],
  },
];
export const familyHeartEvents: GameEvent[] = moments.map(
  ({ npc, hearts, title, text, labels, requires, when, sets }) => ({
    id: `heart-${npc}-${hearts}`,
    title,
    text,
    weight: 1,
    once: true,
    channel: `npc:${npc}`,
    speaker: npc,
    heart: { npc, hearts },
    ...(requires && { requires }),
    ...(when && { when }),
    choices: [
      {
        id: 'stay',
        label: labels[0],
        effects: [
          { type: 'stat', key: 'mood', delta: b.heartMood },
          { type: 'friendship', npc, delta: b.talkFriendship },
        ],
        ...(sets && { sets }),
      },
      {
        id: 'help',
        label: labels[1],
        effects: [
          { type: 'stat', key: 'health', delta: b.heartHelp },
          { type: 'friendship', npc, delta: b.talkFriendship },
        ],
        ...(sets && { sets }),
      },
    ],
  }),
);
