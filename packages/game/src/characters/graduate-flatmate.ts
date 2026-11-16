import { balance as b } from '../balance';
import type { GameEvent, Npc, Text } from '../types';
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
// Maeve names everyday sounds and imitates them. She repairs radios, keeps
// repairable cast-offs, and dislikes being mistaken for a free repair service.
const daily: [string, string][] = [
  ['咔哒。门锁今天肯说话了。', 'Click. The door lock is talking today.'],
  [
    '水壶那声呜——我总跟着唱低了。',
    'That kettle’s woo: I always sing it too low.',
  ],
  ['这把椅子吱一声，比我先打招呼。', 'This chair squeaks hello before I can.'],
  ['烤面包弹起来，我每回都吓一下。', 'The toast pops. Gets me every time.'],
  [
    '楼上拖鞋啪嗒，我还以为下雨。',
    'Slippers pattering upstairs. Thought it was rain.',
  ],
  [
    '收音机沙沙响，台长可能是一袋米。',
    'Radio hissing. Perhaps a bag of rice runs the station.',
  ],
  [
    '勺子别敲杯沿，叮得我牙酸。',
    'No spoon on the rim. That ping makes my teeth ache.',
  ],
  ['你这包拉链，吱啦，挺有气势。', 'That bag zip: zrrrp. Quite an entrance.'],
  ['冰箱嗡嗡，我给它留个独唱。', 'The fridge hums. Let it have a solo.'],
  ['雨靴咕唧响，里面肯定不只脚。', 'Squishy boots. More than feet in there.'],
  ['我买了软底拖鞋，猫步练成了。', 'Soft slippers bought. Cat-footed at last.'],
  [
    '旧电扇转起来像小船，我没敢开大。',
    'The old fan sounds like a boat. Kept it on low.',
  ],
  [
    '这饼干咔嚓，好像踩断一根树枝。',
    'That biscuit cracks like a twig underfoot.',
  ],
  [
    '锅盖又唱了，晚饭抢到播音权。',
    'Pan lid singing again. Dinner has the airwaves.',
  ],
  [
    '钥匙别丢洗衣机，上回叮了一整桶。',
    'Keep keys out of the washer. A whole load of jingling last time.',
  ],
  ['我修好了音量，忘了买晚饭。', 'Fixed the volume. Forgot dinner.'],
  [
    '螺丝滚桌底了，响得倒挺清楚。',
    'Screw rolled under the desk. Heard it clearly enough.',
  ],
  [
    '拆坏的旋钮我留着，手感还好。',
    'Kept the broken knob. Still feels good to turn.',
  ],
  [
    '二手店那台响得好听，可我没地方放。',
    'Lovely sound from that second-hand set. No room for it.',
  ],
  [
    '修东西的布别擦汤，花纹会更复杂。',
    'No soup on the repair cloth. Pattern is complicated enough.',
  ],
  [
    '我也会修坏，刚把开关装反了。',
    'I break repairs too. Just fitted the switch backwards.',
  ],
  ['这个旋钮得轻拧，我手心还疼。', 'Gently with this knob. Palm still hurts.'],
  [
    '收音机送回去了，桌面忽然好空。',
    'Radio returned. Desk feels suddenly empty.',
  ],
  [
    '今天只想听人讲话，机器明天再响。',
    'People’s voices today. Machines can wait.',
  ],
  [
    '你简历翻页那声，比键盘轻多了。',
    'Your CV pages turn much softer than the keyboard.',
  ],
  [
    '我来听演示，错误提示别静音。',
    'I’ll listen to the demo. Leave the error sound on.',
  ],
  [
    '面试练完了？轮到我练怎么拒绝加活。',
    'Interview practice done? My turn to practise refusing extra work.',
  ],
  [
    '耳机线又缠住勺子，音乐配餐失败。',
    'Headphone cable caught the spoon. Musical dinner failed.',
  ],
  ['小店那只门铃听着像打了个喷嚏。', 'The shop bell sounds as if it sneezed.'],
  [
    '烤盘凉下来的啪声，我小时候怕过。',
    'Cooling trays go crack. That scared me as a child.',
  ],
  ['我把电视关了，想听完你这句。', 'TV off. Wanted to hear the rest of that.'],
  [
    '不用提高声音，我没戴耳机。',
    'No need to raise your voice. Headphones are off.',
  ],
  [
    '这回我真没听见，再叫我一次吧。',
    'Actually missed that one. Call me again?',
  ],
  [
    '隔壁练笛子进步了，我少皱一次眉。',
    'Next door’s flute improved. One less frown from me.',
  ],
  [
    '刚才笑出气声，茶差点进鼻子。',
    'Laughed through my breath. Nearly got tea up my nose.',
  ],
  [
    '你的杯子放这儿，叮，就认得了。',
    'Your mug here: ping. I recognise it now.',
  ],
  [
    '我想换条路走，听听那边有没有鸟。',
    'Fancy a different walk. Hear if there are birds there.',
  ],
  [
    '笨钟慢了，我倒喜欢它滴答的速度。',
    'Silly clock is slow. I like the speed of its ticking.',
  ],
  [
    '砧板底下垫块布，咚声就不吓人。',
    'Cloth beneath the board. Makes the thud less startling.',
  ],
  [
    '我把断线焊好了，指尖还闻得到松香。',
    'Wire soldered. Still smell the rosin on my fingers.',
  ],
  [
    '想听老歌，结果调到交通预报。',
    'Wanted an old song. Found the traffic report.',
  ],
  [
    '扳手敲暖气真响，别拿它叫我起床。',
    'Spanner on radiator is loud. No waking me with it.',
  ],
  [
    '我今天接了太多电话，晚饭想少说点。',
    'Too many calls today. Fewer words over dinner, please.',
  ],
  [
    '坏耳机我拆开看了，里面比抽屉还乱。',
    'Opened the broken headphones. Messier than the drawer.',
  ],
  [
    '这只旧喇叭归我，别当花盆送人。',
    'That old speaker is mine. Not a flowerpot to give away.',
  ],
  [
    '你把窗开着吧，我想听街上的脚步。',
    'Leave the window open. I want the street footsteps.',
  ],
  [
    '电池滚来滚去，我拿袜子先挡住。',
    'Batteries rolling about. Sock makes a temporary dam.',
  ],
  [
    '拿错了，是胡椒罐，怪不得不响。',
    'Wrong one. Pepper pot. No wonder it wouldn’t play.',
  ],
  [
    '我也想被请吃饭，别只请我修电器。',
    'Dinner invitations too, please. Not only repair requests.',
  ],
  [
    '收音机终于唱了，我反而想先吃。',
    'Radio finally sings. Now I want food first.',
  ],
  ['你刚才哼的调子，我想起来了。', 'Remembered that tune you were humming.'],
  [
    '塑料袋沙啦啦，我的雨衣也跟着起哄。',
    'Bag rustling away. My raincoat joins in.',
  ],
  [
    '门垫换了，钥匙掉上去都没听见。',
    'New doormat. Didn’t even hear the keys fall.',
  ],
  [
    '台灯开关轻了，我手指总按过头。',
    'Lamp switch is lighter. Finger keeps going too far.',
  ],
  [
    '谁把糖藏进茶罐？摇起来像沙锤。',
    'Who put sugar in the tea tin? Shakes like a maraca.',
  ],
  [
    '我把歌名写下了，省得只会哼前半句。',
    'Wrote the song title down. Can only hum its opening.',
  ],
  [
    '你从站台带回的风声，录到了吗？',
    'Did you record that wind at the platform?',
  ],
  [
    '今天有点想家，听了旧厨房的录音。',
    'Missing home a little. Played the old kitchen recording.',
  ],
  ['螺丝盒装满了，偏偏没我要的那颗。', 'Full screw box. Not the one I need.'],
  [
    '这回先喝茶，再判断它到底坏没坏。',
    'Tea first. Then decide whether it is broken.',
  ],
];
const seasonal: Npc['lines'] = [
  {
    id: 'maeve-spring',
    season: 2,
    text: t(
      '春天窗外啾啾，我闹钟输了。',
      'Spring chirping outside. Beats my alarm.',
    ),
  },
  {
    id: 'maeve-summer',
    season: 3,
    text: t(
      '夏天开窗，隔壁的歌也搬进来了。',
      'Summer windows open. Next door’s song moves in.',
    ),
  },
  {
    id: 'maeve-autumn',
    season: 4,
    text: t(
      '秋叶沙沙，我总以为有人拖箱子。',
      'Autumn leaves rustling. Keep hearing a suitcase.',
    ),
  },
  {
    id: 'maeve-winter',
    season: 1,
    text: t(
      '冬天暖气嘀一下，我也跟着醒。',
      'Winter radiator ticks. Wakes me too.',
    ),
  },
  {
    id: 'maeve-rain',
    weather: ['rain'],
    text: t(
      '雨点打铁皮，厨房加了个鼓手。',
      'Rain on the tin. Kitchen has a drummer.',
    ),
  },
  {
    id: 'maeve-snow',
    weather: ['snow'],
    text: t(
      '雪把脚步裹住了，出门反倒想跺脚。',
      'Snow wraps the footsteps. Makes me want to stamp.',
    ),
  },
  {
    id: 'maeve-job',
    requires: ['graduate-switched'],
    text: t(
      '听见工牌碰钥匙了，新声音！',
      'Heard your badge hit the keys. New sound!',
    ),
  },
  {
    id: 'maeve-trust',
    heartsMin: 10,
    requires: ['maeve-tuning-mark'],
    text: t(
      '小箭头还在，开机就能找到咱们的音量。',
      'Arrow still there. Our volume, first turn.',
    ),
  },
  {
    id: 'maeve-trust-dinner',
    heartsMin: 10,
    requires: ['maeve-tuning-mark'],
    text: t(
      '调好啦。先吃饭，咱们不抢广播的开头。',
      'Tuned. Dinner first. We can miss the opening.',
    ),
  },
  ...(
    [
      [
        'lunar-new-year',
        '饺子下锅扑通，广播先小声一点。',
        'Dumplings plop. Radio down a little.',
      ],
      [
        'may-day',
        '彩带呼啦，我想录下这阵风。',
        'Ribbons flutter. Want to record that wind.',
      ],
      [
        'summer-fair',
        '夏日摊位叮当响，我的零钱袋也跟着响。',
        'Summer stalls jingle. So does my coin purse.',
      ],
      [
        'bonfire-night',
        '烟花砰过了，我耳边还嗡着。',
        'Fireworks finished. Ears still humming.',
      ],
      [
        'christmas-market',
        '圣诞铃铛响，我又跟丢了歌调。',
        'Christmas bells. Lost the tune again.',
      ],
    ] as const
  ).map(([festival, zh, en]) => ({
    id: `maeve-festival-${festival}`,
    festival,
    text: t(zh, en),
  })),
];
export const graduateFlatmate: Npc = {
  id: 'maeve',
  name: t('梅芙·凯利', 'Maeve Kelly'),
  role: t('诺拉的室友，收音机维修员', 'Nora’s flatmate, a radio repairer'),
  characters: ['graduate'],
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
        { from: 660, at: 'library' },
        { from: 780, at: 'home' },
      ],
    },
  ],
  gifts: {
    loved: ['tea', 'biscuits'],
    liked: ['flowers', 'cake'],
    disliked: ['old-boot', 'shopping-trolley', 'pike'],
  },
  reactions: {
    loved: t(
      '哗，拆开的声音就好听。谢谢！',
      'Ah, even unwrapping sounds good. Thanks!',
    ),
    liked: t(
      '给我的？我把收音机挪开，留个位置。',
      'For me? Moving the radio to make a space.',
    ),
    neutral: t(
      '收到了，先搁在螺丝盒旁边。',
      'Got it. Beside the screw box for now.',
    ),
    disliked: t(
      '咚。听这声就知道，我得找地方放了。',
      'Thud. That sound means I need somewhere to put it.',
    ),
  },
  lines: [
    ...daily.map(([zh, en], i) => ({
      id: `maeve-daily-${i + 1}`,
      text: t(zh, en),
    })),
    ...seasonal,
  ],
};
const scenes: [string, Text, Text, Text, Text][] = [
  [
    'dial',
    t('旋钮先别拧', 'Leave the dial'),
    t(
      '梅芙抱着旧收音机进厨房，你腾开桌面，她却把它放到自己膝上。机壳擦过围裙，沙沙响。\n「不是要你帮修。」她说。你刚伸出的手停在杯子旁，她按下开关，让你先听那阵杂音。\n你猜像煎洋葱，她笑得歪过身，说自己听成了海边。这机器来自她以前住的屋子，搬来后一直没响。\n她愿意讲旧屋的事，也想保留拆机器的那部分。你们找来两个杯子，留出她双肘能活动的地方。\n「听到就行，旋钮先归我。」她把工具摊开，给你的茶留了一块没有螺丝的桌角。',
      'Maeve brings an old radio into the kitchen. You clear the table, but she rests it on her knees. The case rustles against her apron.\n“Not asking you to repair it.” Your hand stops beside your cup. She switches it on and lets you hear the hiss.\nYou hear frying onions. She laughs, hearing the seaside instead. It came from her old home and has been silent since the move.\nShe will talk about that home while keeping the repair to herself. Two mugs leave room for her elbows.\n“Listening is enough. Dial stays mine for now.” She spreads her tools, leaving your tea a screw-free corner.',
    ),
    t('说说你听见的声音', 'Describe what you hear'),
    t('把茶挪开，让她拆机', 'Move the tea and let her work'),
  ],
  [
    'voice',
    t('录音里的停顿', 'A pause in the recording'),
    t(
      '你练面试时，梅芙在旁边调收音机。录音一放，你先听见自己的吸气，急着伸手去关。\n她没碰你的电脑。「这口气也归你，留不留自己定。」她把耳机放到中间，等你说听哪一段。\n你担心说话不够像一个已经毕业的人。梅芙讲起自己第一次接维修电话，把机器型号听成了街名。\n你们笑完，她说那通电话后来还是回了。她不想替你练成另一个人的声音，只想知道哪句没听懂。\n你重新播放，留住开头的停顿。收音机的旋钮转到安静处，她把自己没听明白的那句重复给你。',
      'As you practise for interviews, Maeve tunes the radio. On playback you hear yourself breathe in and reach to stop it.\nShe leaves your computer alone. “That breath is yours. Keep it or not.” She puts the headphones between you, waiting for your choice of passage.\nYou worry about sounding like a graduate. Maeve recalls mistaking a radio model for a street on her first repair call.\nAfter laughing, she says she did return that call. She wants to hear which sentence was unclear, not train you into someone else’s voice.\nYou play it again, keeping the opening pause. She turns the radio down and repeats the sentence she missed.',
    ),
    t('留着停顿，重新讲一遍', 'Keep the pause and try again'),
    t('请她重复没听懂的那句', 'Ask her to repeat the unclear sentence'),
  ],
  [
    'parts',
    t('零件不包晚饭', 'Parts exclude dinner'),
    t(
      '梅芙回家时提着坏掉的音箱，袋底还有别人塞来的电线。你问今晚是不是又要开工，她没答。\n她把袋子放在门口，塑料扣啪地弹开。「每个人都说顺手看看，我也每次都说好。」\n你原想夸她会修，听见这句才把话放慢。她说想收下别人的谢意，却不想晚饭总在别人家的机器后面。\n你们把桌上的零件挪回袋子，饭菜端到中间。她用空碗压住一张待修便条，没把它当成今晚的菜单。\n梅芙终于坐下，问你想不想听一首歌。「只听，修理要另外约。」她先给自己盛了满满一碗。',
      'Maeve comes home with a broken speaker and wires others have added. Asked about work tonight, she says nothing.\nShe sets the bag by the door. Its clasp snaps. “Everyone says just a quick look. I always agree.”\nYou slow the praise you were about to offer. She likes being thanked, but not eating after everyone else’s machines are finished.\nTogether you return the parts to the bag and put food in the centre. An empty bowl covers a repair note. It is not tonight’s menu.\nMaeve sits at last and offers a song. “Listening only. Repairs need another appointment.” She serves herself a full bowl first.',
    ),
    t('把便条挪开，陪她吃饭', 'Move the note and eat together'),
    t('约好借工具也先开口问', 'Agree to ask before borrowing tools'),
  ],
  [
    'argument',
    t('关小一点', 'Turn it down'),
    t(
      '你在房里练习讲解，梅芙把收音机开大了。你敲门时，她也指着墙，说整晚都听得见你的键盘。\n你们都觉得自己已经放轻，谁也没先让步。锅里的汤还热着，屋里却只剩机器的沙沙声。\n梅芙关掉收音机，没有把关机当成认错。「我也想用客厅，不想只有戴耳机才算客气。」\n你说出需要安静的那段时间，也承认临时练习没打招呼。她拿起笔，在空白节目单上圈出能一起听歌的空档。\n你们还没把每个时段谈妥。她把笔留在桌上：「明天不合适就改，别只在吵起来时才叫我。」',
      'While you practise a presentation, Maeve turns the radio up. At your knock she points at the wall: she hears your keyboard all evening.\nBoth of you thought you were being quiet. Neither gives way. Soup stays warm while only the radio hisses.\nShe switches it off without treating that as surrender. “I want the sitting room too. Headphones shouldn’t be the only polite choice.”\nYou name the quiet time you need and admit the unannounced practice. She circles a shared music slot on an empty programme sheet.\nNot every slot is agreed. She leaves the pen. “Change it tomorrow if it doesn’t work. Don’t wait for an argument to call me.”',
    ),
    t('写下自己需要安静的时间', 'Write down the quiet time you need'),
    t('先约今晚，余下明天再谈', 'Agree tonight’s plan and return tomorrow'),
  ],
  [
    'mark',
    t('留下小箭头', 'Leave a little arrow'),
    t(
      '梅芙把修好的收音机放回厨房。音量旋钮没有刻度，她贴上一条窄纸，让你试着找到吃饭时舒服的声音。\n你拧过头，歌声盖住锅盖，她伸手去关，又停住，改为轻轻敲了两下桌子。\n你把音量退回来，听清她在笑。纸上添了一个小箭头，旁边还留着余地，没人给它涂成不会动的红线。\n她说以前搬家总先找插座，现在还会找你把杯子放在哪里。你把自己的杯子挪到箭头旁，试着倒满水。\n梅芙把笔挂在机背。「咱们的音量，随时能改。」以后开饭，你们总先听一下彼此，再去碰那个旋钮。',
      'Maeve returns the repaired radio to the kitchen. With no scale on the volume dial, she adds a paper strip and asks you to find dinner volume.\nYou turn too far. Music covers the pan lid. She reaches to switch it off, then taps the table twice instead.\nYou turn back and hear her laugh. A little arrow appears, with space beside it. Nobody makes it an immovable red line.\nShe used to find the sockets first on moving day. Now she also looks for where you set your mug. You move it beside the arrow and fill it.\nMaeve hangs the pen behind the set. “Our volume. We can change it.” At dinner you listen to each other before touching the dial.',
    ),
    t('试着让水声与歌都听得清', 'Find room for both water and song'),
    t('添上自己的小记号', 'Add your own small mark'),
  ],
];
export const graduateHeartEvents: GameEvent[] = scenes.map(
  ([flag, title, text, first, second], i) => ({
    id: `heart-maeve-${(i + 1) * 2}`,
    title,
    text,
    weight: 1,
    once: true,
    channel: 'npc:maeve',
    speaker: 'maeve',
    heart: { npc: 'maeve', hearts: (i + 1) * 2 },
    ...(i > 0 ? { requires: [`maeve-${scenes[i - 1][0]}`] } : {}),
    choices: [first, second].map((label, j) => ({
      id: j === 0 ? 'stay' : 'help',
      label,
      effects: [
        {
          type: 'stat' as const,
          key: j === 0 ? ('mood' as const) : ('health' as const),
          delta: b.heartMood,
        },
        { type: 'friendship' as const, npc: 'maeve', delta: b.talkFriendship },
      ],
      sets: [`maeve-${flag}`, ...(i === 4 ? ['maeve-tuning-mark'] : [])],
    })),
  }),
);

export const graduateRecent: [string, string][] = [
  [
    '续签收好了？咔哒，文件夹合上的声真脆。',
    'Renewal filed? Click. Nice crisp folder sound.',
  ],
  [
    '加薪那封信！我开罐饼干，听这咔嚓声。',
    'Pay-rise letter! Opening biscuits. Hear that crack.',
  ],
  [
    '换工作了，试试新工牌敲在钥匙上的声音。',
    'New job. Hear the new badge against the keys.',
  ],
  [
    '英语考过啦，先把听力录音关掉吃饭。',
    'English passed. Listening practice off; dinner on.',
  ],
  [
    'Life in the UK 过了？合书声我听见了。',
    'Life in the UK passed? Heard that book close.',
  ],
  [
    '回来啦，箱轮还跟以前一样咕噜响。',
    'Back! Same old rumbling suitcase wheels.',
  ],
  [
    '钱紧就听家里这台，二手店今天不逛。',
    'Money tight: listen here. Skip the second-hand shop.',
  ],
  [
    '心情闷？今天我把电台调小，留你说话。',
    'Low mood? Radio down today. Room for your voice.',
  ],
  [
    '熟了才敢说，你哼的歌我一直认错。',
    'Know you well enough to admit I misheard your tune.',
  ],
];
export const graduateHeartReplies: Record<string, [Text, Text]> = {
  'heart-maeve-2': [
    t(
      '你听成洋葱，我现在也听见油锅了。',
      'You heard onions. Now I hear the frying too.',
    ),
    t(
      '茶挪走那块桌面，还够我放个小喇叭。',
      'Room for a little speaker where you moved the tea.',
    ),
  ],
  'heart-maeve-4': [
    t(
      '你留的那口气还在，听着像真的在场。',
      'You kept that breath. Sounds like being there.',
    ),
    t(
      '你让我重说的那句，这回我听明白了。',
      'That sentence you had me repeat: clear now.',
    ),
  ],
  'heart-maeve-6': [
    t(
      '便条放远了，我终于吃到刚出锅的菜。',
      'Note put away. Finally ate dinner hot.',
    ),
    t(
      '借工具先问那回，我的手也能歇一歇。',
      'Asking before tools: gives my hands a rest too.',
    ),
  ],
  'heart-maeve-8': [
    t(
      '你写的安静时间我看见了，耳机先充电。',
      'Saw your quiet times. Charging headphones first.',
    ),
    t(
      '咱们只约了那晚，余下的还得接着谈。',
      'We agreed that evening only. Rest still to discuss.',
    ),
  ],
  'heart-maeve-10': [
    t(
      '水声没被歌盖住，这个音量正好吃饭。',
      'Song leaves room for water. Good dinner volume.',
    ),
    t(
      '你的小记号旁还有空，我也能添一笔。',
      'Space beside your mark. Room for mine too.',
    ),
  ],
};
