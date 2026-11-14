import { balance as b } from './balance';
import type { GameEvent, Npc, Text } from './types';
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
const dialogue: Record<string, [string, string][]> = {
  jamie: [
    [
      '哎，茶给你！等等，把手转过来，烫！',
      'Tea for you! Hang on, turn the handle round. Hot!',
    ],
    [
      '我跟你说，这破收音机一修好，球赛就清楚了！',
      "I'm telling you, once this radio works, we'll hear the match properly!",
    ],
    [
      '这面包还能救！切丁烤脆，先让我找一下烤盘。',
      'We can rescue this bread! Toast some cubes. Let me find the baking tray first.',
    ],
    [
      '哎，穿拖鞋试试！左脚那只，我补得有点像球靴。',
      'Try your slippers! The left one I mended feels a bit like a football boot.',
    ],
    [
      '汤盖找到了！盐也……等等，我刚加过了吧？',
      'Found the soup lid! Now the salt... hang on, did I already add it?',
    ],
    [
      '我踢五人足球都凑得齐人，怎么袜子总差一只？',
      "I can get a whole five-a-side team together. Why can't I find two socks?",
    ],
    [
      '饭来喽！账单先夹好，我这手像摸过一桶油。',
      "Dinner's up! Bills away first. My hands are absolutely covered in grease.",
    ],
    [
      '茶先端着！我垫个桌脚，哎，球赛小册借我一下。',
      "Hold the tea! I'll wedge the leg. Pass me that match programme.",
    ],
    [
      '看，合照里那条围巾！针脚跟我踢的球一样歪。',
      'Look, the scarf from our photo! Stitches as crooked as my shots.',
    ],
    [
      '淋成这样！脱外套，我去盛饭。哎，拿锅垫先。',
      "You're soaked! Coat off, I'll dish up. Ah, oven glove first.",
    ],
    [
      '春天种球根啦！这回我认准头尾，上回种反了！',
      "Spring bulbs! I'll check which end is up. Put them in upside down last time!",
    ],
    [
      '夏天这光直晃眼，我找块布——球衣？尺寸不够！',
      "This summer light's blinding. I'll find some cloth... football shirt? Too small!",
    ],
    [
      '秋叶全冲进玄关了！门底那刷子得换，守门失职。',
      'Autumn leaves charging into the hall! New door brush. Terrible goalkeeping.',
    ],
    [
      '冬天咱俩抢这毯子，比我队里抢任意球还认真。',
      'We fight harder over this winter blanket than my team does over free kicks.',
    ],
    [
      '雨衣挂我修的杆！哎，先轻点，我刚才说早了。',
      'Wet coat on the rail I fixed! Ah, gently. Spoke too soon there.',
    ],
    [
      '出太阳啦！咱们搬椅子出去吃，我拿盘子你拿茶？',
      "Sun's out! Let's eat outside. I get the plates, you get the tea?",
    ],
    [
      '下雪了！我先试门槛滑不滑——哎哟，确实滑。',
      "Snow! I'll test the step... whoa, yes, definitely slippery.",
    ],
    [
      '周末炖锅菜，再听场球？我保证先调对电台！',
      "Stew and a match this weekend? I promise I'll tune the radio properly first!",
    ],
    [
      '明天的事我贴提醒了，在球赛日历右边，你瞧瞧？',
      "Put tomorrow's reminder up. Right of the football calendar. Can you see it?",
    ],
    [
      '你刚才讲到哪了？哎，我把壶关掉，老跟你抢声。',
      "Where were you? Ah, I'll switch the kettle off. Keeps talking over you.",
    ],
    [
      '哈哈，懂了！上次你那笑话，我反应比守门还慢！',
      'Ha, got it! That joke of yours. Slower than my goalkeeping!',
    ],
    [
      '这合照晃得！那天我还举着锅铲，一脸要罚点球。',
      "What a blurry photo! Me waving a spatula like I'm taking a penalty.",
    ],
    [
      '书架先少塞点呀，我得钻进去修那块破背板！',
      "Leave some space on the shelf, will you? I've got to get in and fix that wretched back!",
    ],
    [
      '垫子翻过来就——哎，两面都有茶。确实是我。',
      'Turn the cushion over and... ah. Tea both sides. Yes, that was me.',
    ],
    [
      '来陪我喝杯茶！我想吐槽球队，真的太离谱了。',
      'Come have tea! I need to complain about my team. Absolute shambles.',
    ],
    [
      '办公室杯子搬回来了，放球赛杯旁边，怎么看都碍眼。',
      'Brought my office mug back. Beside the football mug, it just looks wrong.',
    ],
    [
      '咨询表我看得头大！先让我喝口热茶，再接着填完。',
      "This advice form's doing my head in! Some hot tea first, then I'll finish filling it in.",
    ],
    [
      '宝宝那只小袜子我留着呢，比我的球靴补丁还小！',
      "I've kept the baby's tiny sock. Smaller than the patch on my football boot!",
    ],
    [
      '全职班表出来了！家务得重分，我那场球也得挪。',
      "Full-time rota's out! We'll need to split chores again. Move my football too.",
    ],
    [
      '楼梯我得慢点爬，今天这腿比踢完一场球还沉！',
      'Slow up these stairs today. These legs are heavier than after a whole match!',
    ],
  ],
  'ka-ning-partner': [
    [
      '嘉宁，讲好先，饭盒看名字拿！乐言那盒吃完会喊饿。',
      "Ka Ning, let's get this straight: names on lunchboxes! Lok Yin's won't fill you up.",
    ],
    [
      '这伞挤两个人够，包你提。我可没答应兼做行李架。',
      'Two fit under this umbrella. You carry the bags. Never agreed to be the luggage rack too.',
    ],
    [
      '今晚我收起简历了，有个条件：吃饭聊电影，成交？',
      "CV's away tonight. One condition: films over dinner. Deal?",
    ],
    [
      '相片盒里的旧车票归我留，讲好先，清理得问过我。',
      'I keep those tickets in the photo box. Clear this up first: ask before clearing them out.',
    ],
    [
      '电饭锅响，我跑去开门！你笑够了就告诉我是哪一个。',
      "Rice cooker pinged, I answered the door! Once you've finished laughing, tell me which noise it was.",
    ],
    [
      '乐言说黄色的菜都算一类。你负责说服，我负责煮青菜。',
      "Lok Yin says yellow food is one group. You do the persuading, I'll cook the greens.",
    ],
    [
      '接送表漏一格就算我的？这个算法，我要跟你重新谈。',
      'Blank on pickup rota means me? We need to renegotiate that particular calculation.',
    ],
    [
      '给家里打电话，讲好先，今天我先说，表姐等我回话呢。',
      "Call home: let's agree I speak first today. My cousin's waiting for my answer.",
    ],
    [
      '外套缝好啦！成交条件：今晚你洗碗，工钱先付。',
      'Coat mended! Deal is, you wash up tonight. Payment upfront.',
    ],
    [
      '乐言管葱，你管漏出来的泥。我负责笑，这回分好了。',
      'Lok Yin gets the onions, you get the spilled soil. I get to laugh. Sorted this time.',
    ],
    [
      '春天鞋柜我肯收，有个条件：你的泥鞋你自己刷。',
      "I'll sort the spring shoe cupboard. Condition: you scrub your own muddy shoes.",
    ],
    [
      '夏天厚被收起来啦！先量旧箱，省下的钱我想买相纸。',
      "Summer duvets away! Measure old boxes first. I'd like photo paper with the money saved.",
    ],
    [
      '秋叶夹书可以，归还前你取。罚款这笔我可没答应出。',
      "Press autumn leaves in books, fine. You remove them before returning. Fines aren't on me.",
    ],
    [
      '冬天出门，手套自己查。我带热水，交换条件公平吧？',
      'Winter outing, check your own gloves. I bring hot water. Fair exchange?',
    ],
    [
      '下雨又只湿我肩膀！下次我挑伞，你负责背那把大的。',
      'Rain, and only my shoulders wet again! I choose the next umbrella, you carry the big one.',
    ],
    [
      '太阳出来，我晒大衣；袜子你晒。讲好先，这叫分工。',
      "Sun's out. I hang coats, you hang socks. Let's be clear, that's sharing the job.",
    ],
    [
      '雪看够就关窗啦。暖气费涨了，我要追究谁开窗。',
      "Finished looking at snow? Shut the window. If heating goes up, I'm investigating who opened it.",
    ],
    [
      '周末找漏风处，你趴门边，我找材料。做完一起吃点心？',
      'Weekend draught hunt. You by the door, I find materials. Dim sum after?',
    ],
    [
      '今晚我试新菜，讲好先，尝一口再说表姐那版更好吃。',
      "Trying a new dish. Agree to taste it before telling me my cousin's version is better.",
    ],
    [
      '你的茶泡好了！轮到你记我放几块糖，来，考一考。',
      "Your tea's ready! Your turn to remember my sugar. Go on, let's test you.",
    ],
    [
      '这条路熟啦！我想聊表姐那段恋爱，你要听哪一版？',
      "Know this road now! Want my cousin's romance story? Which version do you want?",
    ],
    [
      '相册这张我喜欢，你要换，就拿一张两个人都点头的。',
      'I like this album photo. Want to swap it? Find one we both agree on.',
    ],
    [
      '厨房收好，轮到我挑节目。遥控器给我，这回说定了。',
      'Kitchen done, my turn to choose a programme. Remote here. Agreed this time.',
    ],
    [
      '你皱眉，到底是哪件？先讲清楚，我才知道该吵还是笑。',
      'That frown, which thing is it? Tell me first so I know whether to argue or laugh.',
    ],
    [
      '今天省了接送，我要睡个午觉。有个条件：闹钟你管。',
      "No school run today, I'm having a nap. One condition: you handle the alarm.",
    ],
    [
      '录用信我留着！讲好先，下次见表姐，由我讲这份工作。',
      'Keeping my offer letter! Next call with my cousin, I get to tell her about this job.',
    ],
    [
      '招聘页关了。今天等得烦，我想给表姐打电话，聊点八卦。',
      'Job page closed. Fed up waiting today. Calling my cousin for some gossip.',
    ],
    [
      '明早要上班。早餐各做各的，周末换我煮粥，成交？',
      'Work early tomorrow. Own breakfasts, I make congee at the weekend. Deal?',
    ],
    [
      '来时的箱子还在。你说扔，我说留；先拍照给表姐评理。',
      'Still got our arrival suitcase. You say bin it, I say keep it. Photo to my cousin for a verdict.',
    ],
    [
      '信箱上的名字补齐了。我的要全名，讲好先，别再省字。',
      "Names on the letterbox fixed. My full name. Let's agree, no abbreviating it again.",
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
        zhCN: '收工！鞋带又踩住了，我这脚下比带球时还笨！',
        en: "Finished! Standing on my laces again. Feet even clumsier than when I'm dribbling!",
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
        zhCN: '下班喽！先修收音机，再做饭——你想吃什么来着？',
        en: 'Home from work! Radio, then dinner... what did you fancy again?',
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
        zhCN: '下班馋了一路烤土豆，到家一看，一颗也没买！',
        en: "Dreamed of jacket potatoes all the way home. Got here, found I'd bought absolutely none!",
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
        zhCN: '工牌还挂着呢！等等，切洋葱得先把这绳塞进去。',
        en: 'Still wearing my work badge! Hang on, tuck the strap in before the onions.',
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
        zhCN: '工作收场，厨房开场！怎么有糊味？这开场可糟了。',
        en: "Work finished, kitchen kickoff! What's that burning smell? Terrible opening.",
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
        zhCN: '工作还没着落。我翻招聘页，怎么又切成菜谱了？',
        en: 'Still no job. Looking at listings. How did I end up on recipes again?',
      },
      requires: ['family-jamie-unemployed'],
      forbids: ['family-jamie-reemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-38',
      text: {
        zhCN: '找工作真磨人，买菜碰上旧同事，我差点躲罐头后面。',
        en: "Job-hunting's wearing me out. Saw an old colleague shopping. Nearly hid behind the tins.",
      },
      requires: ['family-jamie-unemployed'],
      forbids: ['family-jamie-reemployed', 'family-pip-applied'],
    },
    {
      id: 'jamie-daily-39',
      text: {
        zhCN: '新工作的杯子带回来了！先吃饭，我有一肚子事要讲。',
        en: "Brought my new work mug home! Dinner first. I've got so much to tell you.",
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
        zhCN: '重新上班也累啊！今天这锅你接，我申请换人！',
        en: "Being back at work's tiring! Take over the pan? I'm asking for a substitution!",
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
        zhCN: '春天开窗喽！等等，这合页叫得比球场边的我还响。',
        en: 'Spring, windows open! Hang on, that hinge is louder than me on the touchline.',
      },
      season: 2,
    },
    {
      id: 'jamie-daily-42',
      text: {
        zhCN: '这秋天的南瓜，哎哟，得用我最大的案板才压得住！',
        en: 'Look at this autumn pumpkin! Blimey, needs my biggest chopping board.',
      },
      season: 4,
    },
    {
      id: 'jamie-daily-43',
      text: {
        zhCN: '后门被雪封了！咱们走前门，等等，我拿铲子。',
        en: "Snow's blocked the back! Front door it is. Hang on, shovel first.",
      },
      weather: ['snow'],
    },
    {
      id: 'jamie-daily-44',
      text: {
        zhCN: '周末炖菜得慢火，上回球赛加时，我把它烧成一锅炭！',
        en: 'Low heat for weekend stew. Last extra time, I burnt it to a pan of charcoal!',
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'jamie-daily-45',
      text: {
        zhCN: '停工后老忘下午的药。我摆水杯边了，这回总该看见！',
        en: "Keep forgetting afternoon tablets since stopping work. By the water now. Surely I'll see them this time!",
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
        zhCN: '听完咨询我把重锅放低了，搬一次腰就抗议，真服了。',
        en: 'After that advice I moved the heavy pans down. My back complains every lift. Honestly.',
      },
      requires: ['family-pip-advice'],
    },
    {
      id: 'jamie-daily-47',
      text: {
        zhCN: '盐试过了，火关了，哎，这下你说！我听着呢。',
        en: "Salt checked, hob off. Right, tell me! I'm listening.",
      },
      heartsMin: 2,
    },
    {
      id: 'jamie-daily-48',
      text: {
        zhCN: '你爱吃那道我写下了，夹在球赛小册里，得好好找！',
        en: "Wrote down your favourite inside the match programme. I'll have to look properly!",
      },
      heartsMin: 2,
    },
    {
      id: 'jamie-daily-49',
      text: {
        zhCN: '这么晚还亮灯！你也醒着？我在听旧球赛录音呢。',
        en: "Light's still on this late! You awake too? I'm listening to an old match recording.",
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
        zhCN: '哎，尝口这盘！诚实点，我承受得住，球队天天练我。',
        en: 'Try this! Be honest. I can take it. My team gives me plenty of practice.',
      },
      heartsMin: 6,
    },
  ],
  'ka-ning-partner': [
    {
      id: 'ka-ning-partner-daily-31',
      text: {
        zhCN: '回家啦，先洗手。收据晚点核，我想先给表姐回个电话。',
        en: 'Home! Hands washed first. Receipts later, I want to ring my cousin back.',
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
        zhCN: '到家这顿饭，你讲个笑话换我收表格，条件够好了吧？',
        en: "Home dinner: give me a joke and I'll put the spreadsheets away. Generous terms, right?",
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
        zhCN: '路上补了胡萝卜。下次换你记，讲好先，别全靠我想起。',
        en: "Bought carrots on the way. Your turn to remember next time. Let's agree that now.",
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
        zhCN: '今天的事做完，手机静音。临时加活，可以，先跟我谈。',
        en: "Today's jobs done, phone silent. Extra job? Fine, negotiate with me first.",
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
        zhCN: '跑一天啦，我先换鞋！谁喊我再出门，谁得陪我吃点心。',
        en: 'Out all day, shoes off! Whoever sends me out again owes me a dim sum trip.',
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
        zhCN: '回家先讲件私事。我想学拍夜景，接下来你有空教我吗？',
        en: 'Home, personal news first. I want to learn night photography. Time to show me?',
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
        zhCN: '还在找工作。讲好先，散步聊八卦，招聘页回家再看。',
        en: "Still job-hunting. Let's agree: gossip on our walk, listings when we're home.",
      },
      requires: ['bno-partner-between-jobs'],
      forbids: ['bno-partner-restarted'],
    },
    {
      id: 'ka-ning-partner-daily-38',
      text: {
        zhCN: '又没找到工作，烦啊！我写做过的事，你帮我挑一句顺的？',
        en: "Still no job. Frustrating! I'll write what I've done. Help me pick a sentence that flows?",
      },
      requires: ['bno-partner-between-jobs'],
      forbids: ['bno-partner-restarted'],
    },
    {
      id: 'ka-ning-partner-daily-39',
      text: {
        zhCN: '我重新上班了，接送要照说好的来。谁临时改，谁找替手。',
        en: "I'm back at work. School runs as agreed. Whoever changes a slot finds the cover.",
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
        zhCN: '重新上班，家务重谈！有个条件：别把我晚饭时间也算空档。',
        en: "Back at work, chores renegotiated! Condition: my dinner time isn't a spare slot.",
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
        zhCN: '春天外套找到了！省下这笔，我想买本摄影杂志。',
        en: "Found my spring coat! That money saved, I'd like a photography magazine.",
      },
      season: 2,
    },
    {
      id: 'ka-ning-partner-daily-42',
      text: {
        zhCN: '冬天饭盒凉太快。你试旧保温袋，我煮热点，咱们两边试。',
        en: "Lunch cools fast in winter. You test the old insulated bag, I'll pack it hotter. Both try.",
      },
      season: 1,
    },
    {
      id: 'ka-ning-partner-daily-43',
      text: {
        zhCN: '雨声盖过饭锅了！计时器谁听见谁关，讲好先，别叫远的。',
        en: 'Rain drowned out the rice cooker! Whoever hears the timer switches it off. Agree now.',
      },
      weather: ['rain'],
    },
    {
      id: 'ka-ning-partner-daily-44',
      text: {
        zhCN: '周末补衣服，按洞排。谁插队，谁给我煮茶，成交？',
        en: 'Weekend mending, biggest holes first. Queue-jumping costs a cup of tea. Deal?',
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'ka-ning-partner-daily-45',
      text: {
        zhCN: '简历那只猫还在呢。表姐说拿去面试，我说她替我答题？',
        en: "Cat's still on my CV. Cousin says take it to interviews. Will she answer for it, then?",
      },
      requires: ['bno-partner-cv-seen'],
    },
    {
      id: 'ka-ning-partner-daily-46',
      text: {
        zhCN: '旧地图折反，拆开重折就好！你拿这头，我拉那头。',
        en: 'Old map folded backwards. Open it, fold again! You take this end, I pull that one.',
      },
    },
    {
      id: 'ka-ning-partner-daily-47',
      text: {
        zhCN: '布我来量，你选色。有个条件：别选完又说随便我。',
        en: "I'll measure fabric, you pick colour. One condition: don't choose then say it's up to me.",
      },
      heartsMin: 2,
    },
    {
      id: 'ka-ning-partner-daily-48',
      text: {
        zhCN: '这根线一起拆，别又夸我手快就全递给我，讲好先！',
        en: 'Unpick this together. No praising my quick hands then handing over the lot. Agree first!',
      },
      heartsMin: 2,
    },
    {
      id: 'ka-ning-partner-daily-49',
      text: {
        zhCN: '相册留一页给我！下次我拍完你们，换你给我拍一张。',
        en: "Save me an album page! Next time I've photographed you all, your turn to photograph me.",
      },
      heartsMin: 6,
      requires: ['family-album-started'],
      forbids: ['family-album-page'],
    },
    {
      id: 'ka-ning-partner-daily-50',
      text: {
        zhCN: '饭盒扣好了。接下来我想翻摄影书，晚点你喊我吃饭？',
        en: 'Lunchbox shut. I want my photography book next. You call me for dinner later?',
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
        '周沅，装裱员。合租先划使用范围；纸屑我扫。',
        'Yuan. Picture framer. Shared areas first; I clear my paper scraps.',
      ),
      once: true,
      when: [{ yearMax: 1 }],
    },
    {
      id: 'yao-flatmate-daily-1',
      text: {
        zhCN: '首轮分配：冰箱左格给你；尺寸不够，再调层板。',
        en: 'First allocation: left fridge shelf yours. Too small, adjust the shelf.',
      },
      heartsMax: 1,
      when: [{ yearMax: 1 }],
    },
    {
      id: 'yao-flatmate-daily-2',
      text: {
        zhCN: '门后折尺归我。三节折回；关节松了会差两毫米。',
        en: 'Folding rule by the door is mine. Fold three sections back. Loose joint loses two millimetres.',
      },
    },
    {
      id: 'yao-flatmate-daily-3',
      text: {
        zhCN: '盐、糖已贴字。黑字白底；按盖色分，容易拿错。',
        en: 'Salt and sugar labelled. Black on white; lid colours are too easy to mix up.',
      },
    },
    {
      id: 'yao-flatmate-daily-4',
      text: {
        zhCN: '汤多一碗。用同一口锅；台面占用面积不变。',
        en: 'One extra bowl of soup. Same pan; same amount of worktop.',
      },
    },
    {
      id: 'yao-flatmate-daily-5',
      text: {
        zhCN: '冰箱铰链松一毫米。轻推，等维修。',
        en: 'Fridge hinge loose by a millimetre. Push gently. Repair pending.',
      },
    },
    {
      id: 'yao-flatmate-daily-6',
      text: {
        zhCN: '租约：灰袋。装裱纸：蓝袋。两种纸，分开存。',
        en: 'Lease: grey folder. Mounting paper: blue. Two kinds of paper, stored apart.',
      },
    },
    {
      id: 'yao-flatmate-daily-7',
      text: {
        zhCN: '房东检查日期在门后。时段待定；我只记确认过的。',
        en: 'Landlord inspection date behind the door. Time pending; I record confirmed times.',
      },
    },
    {
      id: 'yao-flatmate-daily-8',
      text: {
        zhCN: '画框能修；水龙头交水工。螺纹规格对不上。',
        en: 'Frames, I can repair. Tap, plumber. Wrong thread specification.',
      },
    },
    {
      id: 'yao-flatmate-daily-9',
      text: {
        zhCN: '装裱纸角裁好了。四边齐；拿几片去做标签。',
        en: 'Mounting offcuts cut. Four straight edges. Take some for labels.',
      },
    },
    {
      id: 'yao-flatmate-daily-10',
      text: {
        zhCN: '汤按碗分。八分满；装到沿口，端起来会洒。',
        en: 'Soup by the bowl. Four-fifths full; to the rim and it spills when carried.',
      },
    },
    {
      id: 'yao-flatmate-daily-11',
      text: {
        zhCN: '春天开窗三指宽。散胶味；纸面避开直风。',
        en: 'Spring window: three fingers wide. Glue fumes out; keep paper out of the draught.',
      },
      season: 2,
    },
    {
      id: 'yao-flatmate-daily-12',
      text: {
        zhCN: '夏天胶带黏度高。废纸试贴；正稿先压在板下。',
        en: 'Summer tape is tacky. Test on scrap; keep the original under the board.',
      },
      season: 3,
    },
    {
      id: 'yao-flatmate-daily-13',
      text: {
        zhCN: '秋叶有水印风险。鞋底清干净；画纸另放。',
        en: 'Autumn leaves risk water stains. Clean the soles; keep drawing paper apart.',
      },
      season: 4,
    },
    {
      id: 'yao-flatmate-daily-14',
      text: {
        zhCN: '冬天手热透再裁。冷手偏线，重裁要损一条边。',
        en: 'Warm hands before winter cutting. Cold hands drift; recutting loses an edge.',
      },
      season: 1,
    },
    {
      id: 'yao-flatmate-daily-15',
      text: {
        zhCN: '雨浸透门垫。晾起；右侧通行，离木柜远点。',
        en: 'Rain-soaked mat. Hung up; use the right side, away from the wooden cupboard.',
      },
      weather: ['rain'],
    },
    {
      id: 'yao-flatmate-daily-16',
      text: {
        zhCN: '晴天检查玻璃。斜看三十度；擦痕在右上角。',
        en: 'Check glass in sun. Thirty-degree angle; streaks at top right.',
      },
      weather: ['sunny'],
    },
    {
      id: 'yao-flatmate-daily-17',
      text: {
        zhCN: '雪鞋进托盘。水流到板缝，会把地板边缘泡翘。',
        en: 'Snowy shoes in the tray. Water in the joins curls the floorboard edges.',
      },
      weather: ['snow'],
    },
    {
      id: 'yao-flatmate-daily-18',
      text: {
        zhCN: '周末画曲线。直线本周裁够了；尺收进抽屉。',
        en: 'Curves this weekend. Cut enough straight lines this week; ruler in the drawer.',
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'yao-flatmate-daily-19',
      text: {
        zhCN: '下班带回图钉两颗。进铁盒；散在地上会扎脚。',
        en: 'Two drawing pins home from work. Metal tin; loose ones go through feet.',
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
        zhCN: '收工。面条凭手抓；装裱尺寸今天已经量够了。',
        en: 'Finished work. Noodles by the handful; enough frame measuring today.',
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
        zhCN: '下班先烧水。裁纸机响了一天；我耳朵还在嗡。',
        en: 'Kettle first after work. Paper cutter all day; my ears are still humming.',
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
        zhCN: '大画裱完。肩膀僵；箱子先靠墙，搬运等明天。',
        en: 'Large picture mounted. Stiff shoulders; boxes by the wall, moving tomorrow.',
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
        zhCN: '工服挂右边。架子左低右高；重量往高处配。',
        en: 'Work coat on the right. Rack lower left, higher right; weight to the high side.',
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
        zhCN: '下班带回边角料一袋。先按纸厚分；薄片还能试胶。',
        en: 'Bag of offcuts from work. Sort by thickness first; thin ones for glue tests.',
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
        zhCN: '早上分插座：我烤面包，你烧水。延长线额定不够。',
        en: "Morning sockets: my toaster, your kettle. Extension isn't rated for both.",
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
        zhCN: '夜间切菜暂停。砧板振动穿墙；明天垫块布再切。',
        en: 'Night chopping paused. Board vibrates through the wall; cloth underneath tomorrow.',
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
        zhCN: '你的口味记在食谱边了。铅笔字；改口味，能擦。',
        en: 'Your taste noted beside the recipe. Pencil; erasable if it changes.',
      },
      heartsMin: 2,
    },
    {
      id: 'yao-flatmate-daily-28',
      text: {
        zhCN: '广播笑话已录。剪掉前面广告；两分钟，听这段。',
        en: 'Radio joke recorded. Ads cut from the start; two minutes, listen here.',
      },
      heartsMin: 4,
    },
    {
      id: 'yao-flatmate-daily-29',
      text: {
        zhCN: '听见钥匙就多拿碗。两只并排；你惯用的在右。',
        en: 'Keys at the door, another bowl out. Side by side; yours on the right.',
      },
      heartsMin: 6,
    },
    {
      id: 'yao-flatmate-daily-30',
      text: {
        zhCN: '今天只想看你坐旁边。装裱做了一天，嘴也想收工。',
        en: 'Just want you beside me today. Framing all day; my mouth wants to clock off too.',
      },
      heartsMin: 8,
    },
    {
      id: 'yao-flatmate-daily-31',
      text: {
        zhCN: '伴侣来访日期已记。日历右边；留白够加回程。',
        en: "Partner's visit dates noted. Right margin; room left for the return.",
      },
      requires: ['partner-arrived'],
      forbids: ['partner-separated'],
    },
    {
      id: 'yao-flatmate-daily-32',
      text: {
        zhCN: '你伴侣那只箱子我量过。能进床底；轮子得侧着。',
        en: "Measured your partner's case. Fits under the bed; wheels sideways.",
      },
      requires: ['partner-arrived'],
      forbids: ['partner-separated'],
    },
    {
      id: 'yao-flatmate-daily-33',
      text: {
        zhCN: '锅铲共用。裁纸刀分开；刀口角度各人磨得不同。',
        en: 'Shared spatulas. Separate paper knives; we sharpen different edge angles.',
      },
      heartsMin: 6,
    },
    {
      id: 'yao-flatmate-daily-34',
      text: {
        zhCN: '冰箱纸角重粘了。换薄胶；这回压足了时间。',
        en: 'Fridge labels reglued. Thinner adhesive; held down long enough this time.',
      },
      requires: ['flatmate-shelf'],
    },
    {
      id: 'yao-flatmate-daily-35',
      text: {
        zhCN: '房检清单夹好。旧磨损附照片；按原图核对。',
        en: 'Inspection checklist clipped. Old damage photographed; compare with originals.',
      },
      requires: ['flatmate-checklist'],
    },
    {
      id: 'yao-flatmate-daily-36',
      text: {
        zhCN: '留言写位置、尺寸、谁处理。一个问号，我量不出。',
        en: "Notes need location, size, who's doing it. Can't measure a question mark.",
      },
      requires: ['flatmate-board'],
    },
    {
      id: 'yao-flatmate-daily-37',
      text: {
        zhCN: '敲门我应。鞋柜挡路就挪五厘米；门得开到底。',
        en: "I'll answer the knock. Move shoe rack five centimetres if it blocks; door needs full travel.",
      },
      heartsMin: 4,
    },
    {
      id: 'yao-flatmate-daily-38',
      text: {
        zhCN: '合租初期按标签分垃圾。字贴正面；色盖只作辅助。',
        en: 'New flatshare: sort rubbish by labels. Text facing front; lid colour as backup.',
      },
      heartsMax: 3,
      when: [{ yearMax: 1 }],
    },
    {
      id: 'yao-flatmate-daily-39',
      text: {
        zhCN: '维修邮件抄送我。到访时段要确认；我有装裱排期。',
        en: 'Copy me on repairs. Confirm visit times; I have framing booked.',
      },
    },
    {
      id: 'yao-flatmate-daily-40',
      text: {
        zhCN: '厨房围裙挂左钩。带胶那条留工间；交叉用了要洗。',
        en: 'Kitchen apron, left hook. Glue-stained one stays in workshop; wash if mixed up.',
      },
    },
    {
      id: 'yao-flatmate-daily-41',
      text: {
        zhCN: '玻璃罐按口径分。小号放扣子，大号装垫片；贴字。',
        en: 'Jars by mouth width. Small for buttons, large for washers; label them.',
      },
    },
    {
      id: 'yao-flatmate-daily-42',
      text: {
        zhCN: '草稿墙线斜两度。真墙也斜；我用水平尺验过。',
        en: 'Wall in sketch two degrees off. Real wall too; spirit-level checked.',
      },
    },
    {
      id: 'yao-flatmate-daily-43',
      text: {
        zhCN: '纸箱进我房。过道留转身宽度；门口还要开伞。',
        en: 'Paper box in my room. Turning room in passage; umbrella opens by the door.',
      },
    },
    {
      id: 'yao-flatmate-daily-44',
      text: {
        zhCN: '长汤勺横放。罐深不足；竖着会顶翻旁边那把。',
        en: 'Long ladle sideways. Jar too shallow; upright knocks the next one over.',
      },
    },
    {
      id: 'yao-flatmate-daily-45',
      text: {
        zhCN: '周末绕公园去小店。旧告示的字距，我想拍张近照。',
        en: "Shop via park this weekend. Want a close-up of the old notice's letter spacing.",
      },
      dayKinds: ['weekend'],
    },
    {
      id: 'yao-flatmate-daily-46',
      text: {
        zhCN: '阴天校色。窗边无直射；两张白纸并排比底色。',
        en: 'Overcast for colour matching. No direct light; two whites side by side for undertone.',
      },
      weather: ['cloudy'],
    },
    {
      id: 'yao-flatmate-daily-47',
      text: {
        zhCN: '夜间音箱离墙一掌。低音走墙体；隔壁听不清歌词。',
        en: 'Speaker a hand from wall at night. Bass travels through it; neighbours miss the words.',
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
        zhCN: '裂口碗改装纸夹。早餐用右边整口的；沿口我查过。',
        en: 'Chipped bowl for clips now. Whole-rimmed one on right for breakfast; edge checked.',
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
        zhCN: '面煮三分钟。你讲今天的事；我先关抽油烟机。',
        en: 'Noodles, three minutes. Tell me about today; extractor off first.',
      },
      heartsMin: 4,
    },
    {
      id: 'yao-flatmate-daily-50',
      text: {
        zhCN: '门后小图保留。偏角三度，暂不重描；出口已标清。',
        en: 'Little door map retained. Three-degree tilt, no retracing yet; exits labelled.',
      },
      requires: ['flatmate-map'],
    },
    {
      id: 'yao-flatmate-daily-51',
      text: {
        zhCN: '新年饺子想画。先拍俯视图；吃完按照片起稿。',
        en: 'Want to draw New Year dumplings. Photo from above first; sketch from it after eating.',
      },
      festival: 'lunar-new-year',
    },
    {
      id: 'yao-flatmate-daily-52',
      text: {
        zhCN: '五月彩带有弹性。量长度用尺；拉伸误差太大。',
        en: 'May ribbons stretch. Use a rule for length; too much stretch error.',
      },
      festival: 'may-day',
    },
    {
      id: 'yao-flatmate-daily-53',
      text: {
        zhCN: '夏日集市标签字距匀。奖状那行偏紧；我职业病。',
        en: 'Summer fair labels evenly spaced. Prize certificate tighter; occupational habit.',
      },
      festival: 'summer-fair',
    },
    {
      id: 'yao-flatmate-daily-54',
      text: {
        zhCN: '烟花只描轨迹。定一条线；追着光改，会叠成团。',
        en: 'Fireworks: trace one path. Fix a line; chasing the light makes a tangle.',
      },
      festival: 'bonfire-night',
    },
    {
      id: 'yao-flatmate-daily-55',
      text: {
        zhCN: '圣诞集市木牌右低。差半指宽；加垫片就能调平。',
        en: 'Christmas-market sign lower right. Half a finger; a washer would level it.',
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
      zhCN: '杰米说自己能把松动的柜门修好，炖汤却总拿不准。你问汤少了什么，他认真列出厨房现有的东西。\n「我不是问库存。」你说。他愣一下，尝了尝自己的那碗：「哎，我说岔了，是怕你不爱吃。」\n他习惯用做饭表示欢迎，却常常只问够不够，不问你究竟想吃什么，好像饿不着就算照顾好了。\n你说家里可以有不一样的口味。他点头，把那句「我都可以」收回，承认自己也有不想吃的菜。\n他翻出沾油的食谱，边上写着「别凭感觉」。你问谁写的，他指自己：「写的时候，我可有把握了！」\n汤没变得完美。杰米尝了一口，终于没问「够不够」：「说喜欢什么吧！你先，哎，还是我先？」',
      en: 'Jamie says he can fix a loose cupboard door but never quite gets soup right. Asked what it lacks, he lists the kitchen supplies.\n“I wasn’t asking for stock.” He pauses and tastes his bowl. “Ah, wrong thing. I’m scared you won’t like it.”\nCooking is his way to welcome you. He usually asks whether there is enough, rather than what you want, as though not going hungry settles care.\nYou say a home can hold different tastes. He nods, withdraws “Anything’s fine” and admits there are dishes he would rather not eat too.\nHe finds the grease-spotted recipe. “Don’t go by feel” is written in the margin. You ask who wrote it. He points to himself. “Oh, I was certain when I wrote it!”\nThe soup stays imperfect. Jamie tastes it and finally asks something other than “Enough?” “What do we like, then! You first. Ah, shall I?”',
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
      zhCN: '杰米说自己小时候在这里迷过路，明明认得街名，却为了不被笑，硬说是在带别人抄近路。\n你问后来谁找到他的。他说自己绕回来，家里没有人知道。他把这事当笑话讲了很多年。\n「现在听着不太好笑。」你说。他点头：「哎，住这儿久了，连迷路都怕人笑话！」\n你刚到时，他也常抢着解释，仿佛熟悉小镇的人不该犹豫，却很少问你要不要另找一种走法。\n他翻出手机拍过的一块路牌，说小时候总认错。你照着念，他也跟着念，念到一半才发现手机拿反了。\n他想了想：「你想自己找路，就你带队！」说完又笑，「哎，我这腿又差点抢跑。」',
      en: 'Jamie once got lost here as a child. He knew the street names but claimed to be taking a shortcut so nobody would laugh.\nYou ask who found him. He got back by circling round, and nobody at home knew. He has told it as a joke for years.\n“Doesn’t sound very funny now.” He nods. “Ah, lived here so long I’m scared people will laugh if I get lost!”\nWhen you first arrived he rushed to explain, as if a local should never hesitate. He rarely asked whether you wanted to find another way.\nHe finds a phone photograph of a sign he used to mistake as a child. You read it; he joins in, then realises he is holding the phone upside down.\nHe considers it. “If you want your own route, you lead the team!” Then a smile. “Ah, my legs nearly ran ahead again.”',
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
      zhCN: '杰米翻着工具盒，过一会儿才承认，没有东西坏。他说手里忙一点，难说的话就能迟一点开口。\n你问是什么话。他把盒子关上：「哎，我怕你在这儿不开心，觉得我当初吹得太轻松！」\n你说不开心的日子不全是他的责任。他却习惯先找能修的东西，连你的沉默也被他当成故障。\n「我不是门铰链。」你说。他笑了一下，随后认真点头，第一次没有接着列出解决的办法。\n一颗螺丝从盒盖滚下来，他下意识接住，又摊开手掌：「这颗倒能修！哎，先放下。」你笑了，难说的话还没走。\n工具盒安静放着。杰米看了它一眼，没有再伸手：「你说，我先听！哎，又想拿工具了，收手。」',
      en: 'Jamie searches his toolbox, then admits nothing is broken. Busy hands let him postpone a difficult sentence a little longer.\nYou ask which sentence. He closes the box. “Ah, I’m scared you’re unhappy here and think I made it all sound too easy!”\nYou say unhappy days are not all his responsibility. He instinctively looks for something to fix, even treating your silence like a fault.\n“I’m not a door hinge.” He laughs, then nods properly. For once he does not follow it with a list of solutions.\nA screw rolls off the lid. He catches it automatically, then opens his hand. “This one I can fix! Ah, put it down first.” You laugh. The difficult subject has not gone anywhere.\nThe toolbox stays quiet. Jamie glances at it without reaching. “Go on, I’m listening! Ah, reaching for the tools again. Hand back.”',
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
      zhCN: '杰米把摇晃的椅子修好，仍不肯坐下。你问还差什么，他又检查一遍已经拧紧的螺丝。\n「你总说等我忙完。」你说，「可总有下一样要修。」他停住手，承认自己也听见这句话了。\n他怕一坐下来，就得谈没有工具能解决的事；你也累了，不想总等到自己爆发，才换来一次认真相处。\n你可以坚持现在坐下谈，不再往后拖；也可以说今天已经没有力气，约定另一天，接受他暂时以为你在退开。\n椅面留着一个旧杯圈。杰米说擦不掉，你说这回没人叫他擦，他的手才从抹布旁收回来。\n椅脚不晃了，谈话却没有自动站稳。杰米扣上工具盒：「哎，哪天都行！我记下，修东西再多也得赴约。」',
      en: 'Jamie finishes fixing the wobbling chair but will not sit. Asked what remains, he checks the tightened screws again.\n“You always say once I’m finished. There’s always another job.” His hands stop. He admits hearing himself say it too.\nHe fears questions no tool can solve. You are tired of waiting until you explode before getting serious time together.\nYou can insist on talking now without postponement, or admit you have no strength today and agree another day, accepting that he may feel you pulling away.\nAn old cup ring marks the seat. Jamie says it will not come off. You say nobody asked him to clean it this time. His hand leaves the cloth alone.\nThe chair is steady; the conversation is not. Jamie shuts the toolbox. “Ah, any day! I’ll write it down. Even with repairs to do, I’m showing up.”',
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
      zhCN: '修好的椅子被杰米起名叫「先坐下」，另一把叫「听完再说」。你问这名字会不会太长。\n「比我找借口短多啦！」他说。你笑，他也笑，却没有再添一句把认真藏起来的玩笑。\n他仍爱修东西，也仍会猜错你的心情。现在猜不准时，能先问一句，而不是立刻去拧螺丝。\n你们决定不固定谁坐哪把椅子，谁想说话就先坐。一个人坐下，另一个也不必马上变成问题解决者。\n他把名字写在纸牌上，试着系到椅背，结打大了，自己坐下先硌了一下。「哎哟，名字把我硌了！」他说。\n杰米拍一下「先坐下」的椅背：「你要换名字就换！哎，挂上也能摘。」他自己先坐，不再检查椅脚。',
      en: 'Jamie names the repaired chair “Sit down first” and the other “Hear it out”. You ask whether the names are too long.\n“A lot shorter than my excuses!” You both laugh, and he adds no further joke to hide the serious part.\nHe still likes fixing things and still misreads your mood. When unsure now, he can ask before reaching for a screwdriver.\nYou decide neither chair belongs to one person. Whoever wants to talk sits first; the other need not immediately become a problem-solver.\nHe writes the names on paper tags and tries tying them to the chair backs. The oversized knot pokes him when he sits. “Ow, the name’s poking me!” he says.\nJamie pats “Sit down first”. “Change the name if you want! Ah, can always take the tag off.” He sits without inspecting the legs again.',
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
      zhCN: '文舒把看过的简历翻到背面，孩子画的猫挤在工作经历后面。她说那天写到一半就去接孩子了。\n你笑说猫也算参与项目。她摇头：「讲好先，我的工作经历，别全算成管家。」\n她说那时找工作，不只想添一笔收入，也想有人问她会做什么。这份心思到现在没有变。\n你说自己没想到那句玩笑会绕回家务。她指着简历：「先谈我想做什么，再谈家务，成交？」\n她指指猫旁的一行小字，是当年面试想说的话。孩子把句号画成猫粮，她到现在仍认得自己当时要说什么。\n文舒把简历正面朝上：「先谈哪边都可以。有个条件：另一边还要谈，别顺手替我答应。」',
      en: 'Man Shu turns the reviewed CV over. The child’s cat crowds behind her work history. She stopped writing that day to do the school run.\nYou joke that the cat counts as project work. She shakes her head. “Let’s get this straight. My work experience isn’t all housekeeping.”\nShe says job-hunting then meant more than another household income. She wanted to be asked what she could do. That wish has not changed.\nYou had not realised your joke led back to chores. She points to the CV. “First the work I want, then splitting chores. Deal?”\nShe points to a small line beside the cat: something she meant to say at an interview then. The child turned its full stop into cat food. Even now, she still knows what she meant to say then.\nMan Shu turns the CV face up. “Either can come first. One condition: we discuss the other too. No agreeing on my behalf.”',
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
      zhCN: '文舒开始整理相册，几张照片旁都写了她的说明。你说看着像她写的家庭年报，她没有跟着笑。\n「我拍我贴，大家看完夸一家人，这笔功劳怎么算？」她说完，又把语气放缓。\n她不是不想记这些事，只是不想连全家应该记住什么，都自动落到自己头上，还被算成爱好。\n你问怎样一起做。她让你选一张自己记得的照片，先说发生了什么，不翻她写好的说明。\n一张照片拍进了她半截手指。你以为会淘汰，她却留下：「我总算入镜！半根手指，也算我的。」\n她选一张照片推到中间：「讲好先，这回你说。谁做了什么？说完再看我写的。」',
      en: 'Man Shu begins an album, adding captions to several photographs. You call it her family annual report. She does not laugh.\n“I take them, arrange them, everyone praises the family. How’s that credit split?” She finishes, then softens her voice.\nShe wants the memories, but does not want deciding what the whole family remembers to fall to her automatically and then be called her hobby.\nYou ask how to do it together. She asks you to choose a photograph and describe what happened without checking her caption.\nOne photograph includes half her finger. You expect it to be rejected. She keeps it. “I’m finally in it! Half a finger still counts as me.”\nShe places a photograph between you. “Agree first: your version this time. Who did what? Then you can read mine.”',
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
      zhCN: '夜里过了八点，文舒把计算器关掉，先说这次不核账。你习惯性问明天还要做什么，她叹了口气。\n「安排记住，人漏啦？」她问。你说她可以歇会儿，她摇头：「讲好先，我要聊天。休息我自己会安排。」\n她讲起从前爱看的电影，才说了开头，就发现自己又在解释为什么没有时间继续看。\n你请她不用交代理由。文舒想了一会儿，重新从那个荒唐的情节讲起，越说越觉得好笑。\n她学着片中人郑重宣布一件蠢事，声音太像平时核账，自己先笑弯了腰，连结尾都说不下去。\n她把那个荒唐情节重新讲了一遍，自己笑得最早：「这段归闲聊，讲好先，别又顺口谈到明天买菜！」',
      en: 'After eight at night Man Shu switches off the calculator and says this is not an accounts check. You automatically ask what needs doing tomorrow. She sighs.\n“Remembered the jobs, missed the person?” You say she can rest. She shakes her head. “Let’s be clear, I want a chat. I can arrange my own rest.”\nShe begins describing a film she used to love, then catches herself explaining why she has had no time to continue watching.\nYou say no justification is needed. She thinks, starts again with the ridiculous plot and begins laughing as she tells it.\nShe solemnly announces something foolish in the character’s voice. It sounds so much like her accounts checks that she doubles up laughing before reaching the end.\nShe starts the ridiculous plot again and laughs first. “This counts as chatting. Agree now, don’t wander back to tomorrow’s shopping!”',
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
      zhCN: '相册摊着一页新照片，你说等文舒有空再整理。她把胶角放下：「讲好先，你说有空，就是又派给我啦？」\n你说不是故意的。她点头：「知道。可每次照旧，最后还不是我做？」\n她想固定分工，你却不愿每件家庭小事都像排班。两个人说的是同一本相册，担心的并不是同一件事。\n这页你可以自己贴完，答应以后主动轮流；也可以一起贴完，却坦承不愿立刻答应轮班，继续谈怎样才公平。\n胶角粘到她袖口，她揭下来放在桌上，没有像往常那样顺手把所有散片一起收好。\n这页最终要贴好，但不能贴完就算解决。文舒说：「有个条件：咱们继续谈，别拖到最后又算我的。」',
      en: 'The album lies open at a new page. You suggest Man Shu arrange it when free. She puts down the photo corners. “Let’s get this straight, ‘when free’ means me again?”\nYou say you did not intend that. She nods. “I know. But every time we carry on, who ends up doing it?”\nShe wants fixed responsibilities. You do not want every family task turned into a rota. One album, two different fears.\nYou can finish this page yourself and commit to unprompted turns, or finish it together but refuse to promise a rota yet, keeping fairness open for discussion.\nA photo corner sticks to her sleeve. She peels it off onto the table without automatically tidying every loose piece as usual.\nThe page must eventually be mounted, but finishing it is no settlement. “One condition: we keep talking. No dragging it out until it’s mine again.”',
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
      zhCN: '文舒拿出相册，这次先问你记下了哪件事。你讲完，她才翻到自己的记录，两页竟然没有撞题。\n「今个月我总算收了一份你的功课！」她说。你问这算不算夸奖，她答：「算！剩下的继续谈。」\n分工还会争，谁更辛苦也未必说得齐；这次你记得自己开始，文舒没有把这一步算成一切解决。\n你们决定以后每次整理都各选一件事，谁选谁写，文舒不再替所有人的记忆收尾，空缺就等本人。\n她的照片背面还留着买菜单，最后一项写「别忘了自己」。你问买了什么，她说先买了新笔。\n文舒把笔放在你自己的那页旁：「讲好先，做好的、做砸的，各写自己的。我的那页，我自己讲。」',
      en: 'Man Shu brings out the album and first asks what you recorded. After your story she opens her page. You have chosen entirely different things.\n“At last I’ve got your contribution for this month!” You ask whether that is praise. “It is! The rest we keep discussing.”\nResponsibilities still cause arguments, and you may disagree over who is more tired. You remembered to begin this time; Man Shu does not call that a complete solution.\nYou agree each will choose and write one memory when arranging the album. She will no longer finish everyone’s contribution; missing pieces wait for their owners.\nA shopping list remains on the back of her photograph. Last item: “Don’t forget yourself.” You ask what she bought. She says a new pen came first.\nMan Shu places a pen by your page. “Agree first: good or gone wrong, each writes their own. My page, my story to tell.”',
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
      zhCN: '周沅量完共用架子的宽，撕掉原先画中线的纸。你问不用分清楚吗，她说先说清用途。\n「私物单放。共用工具，用完归原位。」她把句子停在这里，没有补一句随便就好。\n你笑她像在装裱一份合租合同。她点头：「架宽量过了。现在分使用范围。」说完才露出一点笑。\n她不想每次找东西都猜谁在让谁，也不想因为住在一起，就把所有东西自动算成大家的。\n架子上一个旧碗卡住纸签，周沅量过才说：「签宽合格。碗偏了三度。」她把尺横放，没替你移碗。\n周沅把量尺收好：「直接报。共用什么，私物什么，分别标。」她没有先写你的名字，等你自己定边界。',
      en: 'Yuan measures the shared shelf, then removes the paper marking its middle. You ask whether it needs dividing. She wants its purpose clear first.\n“Private items separate. Shared tools back in position after use.” She stops there, without adding that anything will do.\nYou joke she is framing a flatshare agreement. She nods. “Shelf width measured. Usage areas next.” Only then does she smile a little.\nShe does not want finding things to involve guessing who is accommodating whom, or living together to make every possession automatically communal.\nAn old bowl traps a label on the shelf. Yuan measures before saying, “Label width correct. Bowl three degrees off.” She rests the ruler across it without moving your bowl.\nYuan puts away the ruler. “State it. Shared items, private items. Label separately.” She leaves your name unwritten while you decide your edges.',
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
      zhCN: '周沅把屋里待修的地方写进清单，每项前面都加了「谁来问」。你说记毛病就够了吧。\n「缺工序。漏水，拍照，找房东；谁负责？」她说以前住过的地方，问房东的事默认都归她。\n大家夸她说得清楚，后来连她自己的事也挤到后面。她不想在新一份清单里再次变成隐形主语。\n你问要不要轮着来。她说可以，但别把「你比较会说」又写成轮到自己时的例外。\n便签卷起一角，她压了两回，干脆把那角折好：「翘两毫米。折角，暂不固定上墙。」\n她在「谁来问」下面停笔：「这项你认领。名字自己填；我停笔。」清单列着问题，不再把一个人列成全部办法。',
      en: 'Yuan adds “Who asks?” before every repair on the checklist. You suggest recording the faults alone would be enough.\n“Missing steps. Leak, photograph, contact landlord. Whose job?” In a previous home, questions to the landlord defaulted to her.\nPeople praised her clarity until even her own concerns moved to the back. She does not want to become the new checklist’s invisible subject.\nYou suggest taking turns. That works, she says, provided “You’re better at explaining” does not become an exception on your turn.\nA corner curls up. After pressing it twice, she folds it neatly instead. “Two millimetres raised. Fold corner; no permanent wall fixing yet.”\nHer pen stops beneath “Who asks?” “Choose your item. Fill your own name; my pen stops here.” The list holds problems, without one person becoming every solution.',
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
      zhCN: '晚些时候，周沅喝着汤，说今天不想讲工作。你刚准备转个轻松话题，她又叫住你。\n「话题暂停。只喝汤。」她说。你问会不会太冷清，她摇头：「生气我会报。现在是收工。」\n她以前总怕一起住的人误会，明明累了，还得说几句证明彼此没事，最后连休息也像在交代。\n你说这回不用证明。周沅喝了一口，才告诉你，自己其实担心不继续聊天，会显得不够欢迎你。\n她尝汤时发现一片姜，以为是土豆，又放回碗边：「姜片。我切的；厚度跟土豆重了。」\n汤的热气慢慢散开，周沅没有找下一个话题。「确认收到就行。」她说，「今天就喝汤，我还要添半碗。」',
      en: 'Later in the day Yuan drinks soup and says she does not want work talk. You start changing to something lighter. She stops you.\n“Topics paused. Just soup.” You ask whether that feels cold. She shakes her head. “I’ll state it if angry. Clocked off now.”\nShe used to fear misunderstandings with housemates. Exhausted, she still spoke to prove nothing was wrong, until even resting became an explanation.\nYou say she need not prove it now. After a sip she admits worrying that not continuing the conversation might make you feel unwelcome.\nShe mistakes a slice of ginger for potato while tasting the soup, then puts it at the bowl’s edge. “Ginger. My cutting; same thickness as the potato.”\nThe steam thins. Yuan finds no next topic. “Acknowledge receipt,” she says. “Just soup today. Another half bowl for me.”',
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
      zhCN: '周沅在旧装裱背板上做了告示板，你发现上面写着一串提醒，自己的名字却只出现在最后。\n你说像接到派工单。她先说只是怕漏事，随后停住：「漏了确认工序。是我排的。」\n她知道边框要留得清楚，却还是把合住的人装进自己的尺寸。你也正累着，不想立刻再开一场合租会议。\n你可以现在重谈，写下先同意再安排的规矩；也可以要求今天先各自冷静，接受暂时没有新办法。\n背板角上还贴着旧价签，她刮到一半，看着露出的数字：「旧框价签。刮掉；这回报零工时。」\n周沅擦掉没问过你的安排：「暂停。铅笔留这；从头核。」板上没有谁赢的记号，也没有假装已经重新量准。',
      en: 'Yuan makes a noticeboard from old mounting board. A chain of reminders ends with your name only at the bottom.\nYou call it a work order. She begins explaining fear of omissions, then stops. “Confirmation step missed. My scheduling.”\nShe knows clear edges matter, yet has fitted a housemate to her dimensions. You are tired too and do not want another flat meeting immediately.\nYou can renegotiate now and require agreement before arrangements, or ask for space today, accepting that no new method is ready yet.\nAn old price label remains on the board’s corner. Halfway through scraping it off, she looks at the exposed figures. “Old frame label. Scrape off; zero labour hours billed this time.”\nYuan erases plans made without your agreement. “Paused. Pencil here; check from start.” No victory mark appears, nor a pretence that everything fits again.',
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
      zhCN: '周沅把屋里的小地图画在告示板背面，厨房旁画汤碗，门口画鞋，房门前却只画了一个停顿号。\n「门前三步，停。先敲门。」她说。你问要不要标她常去的路，她摇头：「只标使用范围。去向不登记。」\n你们对告示板未必全谈妥了。周沅说人的需要还会变，地图只能提醒问话，不能证明一切已经合适。\n周沅决定铅笔就挂在板边，谁觉得哪条路不舒服，随时指出来，不必等攒够一场争执才重画。\n她给鞋架画得太窄，鞋尖挤出线外。你指出来，周沅重画：「鞋架重画。实际宽度，多出五厘米。」\n周沅把铅笔挂好，没给地图封框：「改动直接标。铅笔软芯，橡皮在右；按新尺寸重画。」',
      en: 'Yuan draws a little map of the flat on the board’s reverse. A soup bowl by the kitchen, shoes at the entrance, a pause before each bedroom door.\n“Three steps before door, stop. Knock first.” You ask about marking her usual routes. She shakes her head. “Usage areas only. Movements not logged.”\nThe noticeboard may not be fully agreed yet. Yuan says needs change: a map can remind you to ask, not prove everything already fits.\nYuan will keep a pencil on the board. Either can point out an uncomfortable route without saving enough grievances for an argument before redrawing.\nShe draws the shoe rack too narrow, toes protruding past the line. When you point it out, Yuan redraws it. “Redraw rack. Actual width, five centimetres more.”\nYuan hangs up the pencil, leaving the map unframed. “Mark changes directly. Soft pencil, eraser right; redraw to the new measurements.”',
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
