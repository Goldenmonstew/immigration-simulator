import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import type { Npc, Text } from '../../model';
import type { DeFestival } from './rules';

type DeNpc = Npc<DeFestival>;
type Stops = DeNpc['schedule'][number]['stops'];
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
/** Registering a new address (SRC-413 BMG § 17). */
const registrationWeeks = germanyFull2026_11.values.registrationWeeks.value;

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
): DeNpc['schedule'] => [
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
  pairs: [string, string, Partial<DeNpc['lines'][number]>?][],
): DeNpc['lines'] =>
  pairs.map(([zhCN, en, extra], i) => ({
    id: i === 0 ? `${npc}-intro` : `${npc}-${i}`,
    text: t(zhCN, en),
    ...extra,
  }));

export const deNpcs: DeNpc[] = [
  {
    id: 'gisela',
    name: t('吉塞拉·布兰特', 'Gisela Brandt'),
    role: t(
      '楼下的退休邻居，小菜园协会的老会员',
      'Retired neighbour downstairs and allotment colony stalwart',
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
        { from: 540, at: 'green' },
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
      loved: ['erdbeermarmelade', 'kuchen'],
      liked: ['sunflower', 'flowers', 'potato'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '哎呀，这个我最喜欢。下次协会开会，我给你留个前排的位置。',
        'Oh, my favourite. Next colony meeting, I’ll save you a seat at the front.',
      ),
      liked: t(
        '谢谢，我收下了。先把手套摘了，别弄脏。',
        'Thank you, I’ll take it. Gloves off first so I don’t smudge it.',
      ),
      neutral: t(
        '有心了。放在长椅上吧，我回头拿。',
        'Kind of you. Leave it on the bench; I’ll fetch it later.',
      ),
      disliked: t(
        '这个……等大件垃圾回收那天再说吧。',
        'Hm… let’s save that for bulky-waste day.',
      ),
    },
    lines: lines('gisela', [
      [
        '新搬来的？我是楼下的布兰特。垃圾分类表贴在后院门口，看不懂就来敲我的门。',
        'New here? I’m Brandt from downstairs. The bin chart is by the courtyard door. Knock if it puzzles you.',
      ],
      [
        '周日和午休时间要安静，别打孔，别搬家具。楼上那位到现在还没学会。',
        'Sundays and quiet hours: no drilling, no moving furniture. The man upstairs still hasn’t learned.',
      ],
      [
        '芜菁甘蓝冬天最甜，打过霜的炖一锅，整栋楼都闻得到。',
        'Swedes are sweetest in winter. One frost, one stew, and the whole building smells it.',
        { season: 1 },
      ],
      [
        '五月树立起来之前，园子里的土豆就该种下去了。',
        'Potatoes should be in the ground before the maypole goes up.',
        { season: 2 },
      ],
      [
        '向日葵比我还高的时候，就是夏天最好的时候。',
        'When the sunflowers are taller than me, summer is at its best.',
        { season: 3 },
      ],
      [
        '协会规定：菜园三分之一要种菜，不能全是草坪。我年年第一个交检查表。',
        'Colony rules: a third of each plot must grow food, not just lawn. I hand in my checklist first every year.',
      ],
      [
        '下雨天园子里没活，我在咖啡店把下个月的协会通知写好。',
        'No garden work in the rain. I’m drafting next month’s colony newsletter at the café.',
        { weather: ['rain'] },
      ],
      [
        '你来了以后，后院的垃圾桶都整齐了。我跟楼上那位说了，向你学学。',
        'Since you came, the courtyard bins are tidy. I told the man upstairs to learn from you.',
        { heartsMin: 3 },
      ],
      [
        '我年轻时从莱比锡搬来，那时候这里隔着一道墙。头一年我也觉得自己是客人。',
        'I moved here from Leipzig when I was young, back when there was a wall. The first year I felt like a guest too.',
        { heartsMin: 6 },
      ],
      [
        '圣诞集市今天开了。帮我看一下热潘趣的摊子，我去找零钱。',
        'The Christmas market’s open today. Mind the punch stall while I find change.',
        { festival: 'weihnachtsmarkt' },
      ],
    ]),
  },
  {
    id: 'uwe',
    name: t('乌韦·克吕格', 'Uwe Krüger'),
    role: t(
      '小酒馆「船闸」老板，下午在运河边钓鱼',
      'Landlord of Kneipe Zur Schleuse, fishes the canal in the afternoons',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 720, at: 'pond' },
        { from: 960, at: 'pub' },
        { from: 1440, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'pond' },
        { from: 900, at: 'pub-garden' },
        { from: 1020, at: 'pub' },
        { from: 1440, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 780, at: 'shop' },
        { from: 960, at: 'pub' },
        { from: 1440, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 1020, at: 'pub' },
        { from: 1440, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['hecht', 'barsch-kartoffeln'],
      liked: ['barsch', 'bratkartoffeln', 'brezel'],
      disliked: ['erdbeermarmelade'],
    },
    reactions: {
      loved: t(
        '好家伙！今晚黑板上的特别菜就写你的名字。',
        'Now that’s a catch! Tonight’s special goes on the board with your name.',
      ),
      liked: t(
        '谢啦。下次来，碱水面包算我的。',
        'Thanks. Next time, the Brezel’s on me.',
      ),
      neutral: t(
        '收到收到，先放吧台后面。',
        'Got it, got it. Behind the bar it goes.',
      ),
      disliked: t(
        '甜的啊……我这店里只有麦芽啤酒是甜的。',
        'Something sweet… the only sweet thing here is the malt beer.',
      ),
    },
    lines: lines('uwe', [
      [
        'N’Abend！第一次来？坐吧台，这里能看见运河上的船。',
        'N’Abend! First time? Take a bar stool; you can see the boats on the canal from here.',
      ],
      [
        '运河里有狗鱼，大的能有胳膊那么长。我钓了三十年，就见过两条。',
        'There’s pike in the canal, some as long as your arm. Thirty years fishing and I’ve seen two.',
      ],
      [
        '河鲈不聪明，但很执着。跟我年轻时差不多。',
        'Perch aren’t clever, but they’re stubborn. Like me when I was young.',
      ],
      [
        '下雨天客人少，正好把杯子都擦一遍。',
        'Rain means fewer customers. Good time to polish every glass.',
        { weather: ['rain'] },
      ],
      [
        '夏天把桌子搬到运河边，一杯啤酒能喝到天黑。天黑得可晚了。',
        'Summer, the tables go out by the canal and one beer lasts till dark. Dark comes very late.',
        { season: 3 },
      ],
      [
        '冬天我煮一锅豌豆汤，谁冷谁来喝。',
        'Winter, I make a pot of pea soup. Anyone cold can have some.',
        { season: 1 },
      ],
      [
        '你的德语越来越像柏林人了，连抱怨天气的语气都对了。',
        'Your German sounds more Berlin every week. Even your complaints about the weather have the right tone.',
        { heartsMin: 4 },
      ],
      [
        '我爸开这家店的时候，运河上还运煤。城市会变，常客会换，吧台还在这儿。',
        'When my father opened this place, coal barges still came down the canal. Cities change, regulars change, the bar stays.',
        { heartsMin: 7 },
      ],
      [
        '五月节的香肠今年我来烤。秘诀是芥末，别告诉别人。',
        'I’m on May Day sausages this year. The secret is the mustard. Keep it between us.',
        { festival: 'maifest' },
      ],
    ]),
  },
  {
    id: 'sabine',
    name: t('萨比娜·阿尔伯斯', 'Sabine Albers'),
    role: t('民众高校的德语老师', 'German teacher at the Volkshochschule'),
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
      loved: ['kuchen', 'flowers'],
      liked: ['apfelschorle', 'brezel', 'strawberry'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '哇，谢谢！明天的课就讲「Kuchen」和「Torte」有什么不一样。',
        'Oh, thank you! Tomorrow’s lesson: the difference between Kuchen and Torte.',
      ),
      liked: t(
        '谢谢你，我放在讲台上当今天的小奖品。',
        'Thank you. It’ll sit on the desk as today’s little prize.',
      ),
      neutral: t(
        '谢谢！用德语再说一遍「谢谢」吧？',
        'Thanks! Now, say “thank you” in German once more?',
      ),
      disliked: t(
        '这个……我们先学一下它的德语名字，还有它的词性。',
        'Well… let’s at least learn its German name. And its gender.',
      ),
    },
    lines: lines('sabine', [
      [
        '你好！我在这里教德语，工作日晚上，周末上午也有课。新来的可以先旁听。',
        'Hello! I teach German here: weekday evenings and weekend mornings. Newcomers can sit in first.',
      ],
      [
        'der、die、das 别背规则，跟着名词一起背。Der Löffel, die Gabel, das Messer。',
        'Don’t memorise rules for der, die, das. Learn them with the noun. Der Löffel, die Gabel, das Messer.',
      ],
      [
        '长单词别怕，拆开看：Kühl-schrank，凉的柜子，就是冰箱。',
        'Don’t fear long words. Split them: Kühl-schrank, cool cupboard, fridge.',
      ],
      [
        'B1 考试不是要考倒你，是看你能不能自己打电话预约、自己写封邮件。',
        'The B1 exam isn’t a trap. It checks whether you can book an appointment by phone and write an email on your own.',
        { when: [{ stat: 'german', max: 59 }] },
      ],
      [
        '你上次自己去市民服务局办完了？这就是最好的作业。',
        'You sorted the Bürgeramt on your own last time? That’s the best homework there is.',
        { when: [{ stat: 'german', min: 60 }] },
      ],
      [
        '下雨天来上课的人少。我们干脆练习怎么给房东写维修邮件吧。',
        'Fewer students on rainy days. Let’s practise writing a repair email to a landlord.',
        { weather: ['rain'] },
      ],
      [
        '我年轻时在里昂做了一年交换生。那时最想听到的，就是有人慢慢跟我说话。',
        'I spent a year as an exchange student in Lyon. What I wanted most was someone speaking to me slowly.',
        { heartsMin: 4 },
      ],
      [
        '下学期想请你给新同学讲讲你刚来时怎么办手续的。你愿意吗？',
        'Next term, would you tell the new students how you handled your first paperwork?',
        { heartsMin: 7 },
      ],
      [
        '今天全城都在唱歌。来，跟着唱一句德语歌，比背十个单词有用。',
        'The whole city is singing today. Come, sing one line of a German song; it beats ten flashcards.',
        { festival: 'fete-de-la-musique' },
      ],
    ]),
  },
  {
    id: 'murat',
    name: t('穆拉特·德米尔', 'Murat Demir'),
    role: t(
      '街角小店老板，生在柏林，周末教孩子踢球',
      'Späti owner, Berlin-born, coaches kids’ football at weekends',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 1200, at: 'high-street-east' },
        { from: 1320, at: 'shop' },
        { from: 1440, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'green-centre' },
        { from: 780, at: 'shop' },
        { from: 1440, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'shop' },
        { from: 1440, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'shop' },
        { from: 1440, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['currywurst', 'tomatensuppe'],
      liked: ['apfelschorle', 'cucumber', 'brezel'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '兄弟，你懂我！今天你的汽水免费。',
        'You get me! Your soda’s free today.',
      ),
      liked: t('谢啦，放收银台旁边吧。', 'Cheers. Put it by the till.'),
      neutral: t('谢谢，有心了。', 'Thanks, that’s kind.'),
      disliked: t(
        '这个……你是想让我放到街角的旧物箱里？',
        'This… you want me to put it in the swap box on the corner?',
      ),
    },
    lines: lines('murat', [
      [
        'Na？新面孔！这里什么都有：汽水、报纸、电池、种子。周日也开门。',
        'Na? New face! We have everything: soda, papers, batteries, seeds. Open on Sundays too.',
      ],
      [
        '我爸妈七十年代从开塞利来。我生在这条街上，德语比土耳其语说得好，我妈到现在还念叨。',
        'My parents came from Kayseri in the seventies. I was born on this street, and my German is better than my Turkish. Mum still complains.',
      ],
      [
        '想找二手家具？告诉我，跳蚤市场的人我都认识。',
        'After second-hand furniture? Tell me. I know everyone at the flea market.',
      ],
      [
        '下雨天大家都躲进来买零食。小店就是街区的客厅。',
        'Rainy days, everyone ducks in for snacks. The Späti is the Kiez’s living room.',
        { weather: ['rain'] },
      ],
      [
        '夏天晚上门口坐满了人，汽水一箱一箱地卖。',
        'Summer nights, the pavement out front is full and the sodas go by the crate.',
        { season: 3 },
      ],
      [
        '我带的小球队这周踢赢了。莱昂进了个乌龙球，他说那是战术。',
        'My kids’ team won this week. Leon scored an own goal; he says it was tactics.',
        { heartsMin: 3 },
      ],
      [
        '有人问我是哪里人。我说：这条街。说完他们都笑，可那是真话。',
        'People ask where I’m from. I say: this street. They laugh, but it’s true.',
        { heartsMin: 6 },
      ],
      [
        '音乐节今天，我把音箱搬到门口了。你点歌！',
        'Music day today, so the speaker’s out front. You pick the song!',
        { festival: 'fete-de-la-musique' },
      ],
    ]),
  },
  {
    id: 'jonas',
    name: t('约纳斯·贝克尔', 'Jonas Becker'),
    role: t(
      '市民服务局窗口职员，骑车上下班',
      'Bürgeramt counter clerk who cycles everywhere',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 470, at: 'ward' },
        { from: 960, at: 'bus-stop' },
        { from: 1080, at: 'pub' },
        { from: 1230, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'park-path' },
        { from: 840, at: 'cafe' },
        { from: 960, at: 'library' },
        { from: 1080, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 470, at: 'ward' },
        { from: 960, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 660, at: 'library' },
        { from: 960, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['bratkartoffeln', 'apfelschorle'],
      liked: ['brezel', 'tomato', 'kuchen'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '这个太好了！午休就靠它了。',
        'Perfect! That’s my lunch break sorted.',
      ),
      liked: t(
        '谢谢，我带回办公室跟同事分。',
        'Thanks, I’ll share it with the office.',
      ),
      neutral: t('谢谢，您太客气了。', 'Thank you, that’s very kind.'),
      disliked: t(
        '这个……按规定我只能收文件。',
        'Ah… strictly speaking, I can only accept documents.',
      ),
    },
    lines: lines('jonas', [
      [
        '下一位！啊，您好。登记、证明、驾照，市民服务局都能办，但都要预约。',
        'Next! Ah, hello. Registration, certificates, licences: we do it all, but always by appointment.',
      ],
      [
        `搬家以后 ${registrationWeeks} 周内要来登记新住址，这是规定。很多人第一次来都以为是开玩笑。`,
        `After you move, you register the new address within ${registrationWeeks} weeks. That’s the rule. First-timers often think it’s a joke.`,
      ],
      [
        '材料带原件。复印件？原件。翻译件？还有原件。',
        'Bring originals. Copies? Originals. Translations? And the originals.',
      ],
      [
        '冬天我也骑车。没有坏天气，只有穿错的衣服。',
        'I cycle in winter too. There’s no bad weather, only the wrong clothes.',
        { season: 1 },
      ],
      [
        '下雨天窗口前的队伍反而短。大家都在家刷预约。',
        'Rainy days, the queue is shorter. Everyone’s at home refreshing the booking page.',
        { weather: ['rain'] },
      ],
      [
        '其实我很喜欢这份工作。每张证明后面都是一个刚开始的新生活。',
        'Honestly, I like this job. Behind every certificate is a new life just starting.',
        { heartsMin: 3 },
      ],
      [
        '我奶奶是战后从西里西亚过来的。登记簿上她那一页，我小时候看过。',
        'My grandmother came from Silesia after the war. I saw her page in the register as a boy.',
        { heartsMin: 6 },
      ],
    ]),
  },
  {
    id: 'trang',
    name: t('阮秋庄', 'Thu Trang Nguyen'),
    role: t(
      '医院的护理学徒，正在准备德语 B2 考试',
      'Nursing trainee at the hospital, preparing for her German B2 exam',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 960, at: 'library' },
        { from: 1050, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library-steps' },
        { from: 900, at: 'cafe' },
        { from: 1020, at: 'park-path' },
        { from: 1200, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 960, at: 'library' },
        { from: 1050, at: 'college' },
        { from: 1260, at: 'away' },
      ],
      [
        { from: 0, at: 'away' },
        { from: 600, at: 'library' },
        { from: 1140, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['flowers', 'erdbeermarmelade'],
      liked: ['brezel', 'kuchen', 'tomato'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '太美了！我要放在宿舍窗台上，夜班回来就能看到。',
        'Beautiful! It’s going on my dorm windowsill, so I see it after night shifts.',
      ),
      liked: t('谢谢你！复习的时候吃。', 'Thank you! For study snacks.'),
      neutral: t('谢谢，你人真好。', 'Thanks, that’s kind of you.'),
      disliked: t(
        '呃……这个在医院叫「污染物」。',
        'Er… at the hospital we’d call that “contaminated”.',
      ),
    },
    lines: lines('trang', [
      [
        '你好！我在医院做护理学徒，第二年了。晚上来这里复习。',
        'Hi! I’m a nursing trainee at the hospital, second year. I revise here in the evenings.',
      ],
      [
        '病房里的老奶奶们说话特别快，还有方言。我现在能听懂「Moin」和「Servus」了。',
        'The old ladies on the ward talk so fast, with dialect too. I can understand “Moin” and “Servus” now.',
      ],
      [
        '学徒期间有工资，还能上职业学校。我妈妈到现在还不太相信。',
        'Trainees get paid and go to vocational school. My mum still doesn’t quite believe it.',
      ],
      [
        '下雨天我就待在图书馆，暖和，还有热水。',
        'Rainy days I stay at the library. Warm, and there’s hot water.',
        { weather: ['rain'] },
      ],
      [
        '春天我们宿舍楼下的樱桃树开花，像在河内看到的那种。',
        'In spring the cherry tree below our dorm blooms, like the ones in Hanoi.',
        { season: 2 },
      ],
      [
        '你考 B1 的时候紧张吗？我考 B2 前一晚一夜没睡。',
        'Were you nervous for B1? The night before my B2 I didn’t sleep at all.',
        { heartsMin: 3 },
      ],
      [
        '等我拿到护士证，我想把妹妹也接来读书。这条路，我想帮她铺好。',
        'Once I qualify, I want to bring my sister over to study. I want to pave the way for her.',
        { heartsMin: 6 },
      ],
      [
        '今天全城的人都在唱歌。我在宿舍阳台上听到有人拉手风琴！',
        'The whole city is singing today. I heard someone playing accordion from my balcony!',
        { festival: 'fete-de-la-musique' },
      ],
    ]),
  },
  {
    id: 'emeka',
    name: t('埃梅卡·奥卡福', 'Emeka Okafor'),
    role: t(
      '修运河桥的土木工程师，早年持蓝卡来德国',
      'Civil engineer on the canal bridge works, came years ago on a Blue Card',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 450, at: 'station-front' },
        { from: 510, at: 'park-path' },
        { from: 1020, at: 'pub-garden' },
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
      loved: ['eintopf', 'currywurst'],
      liked: ['brezel', 'potato', 'apfelschorle'],
      disliked: ['shopping-trolley'],
    },
    reactions: {
      loved: t(
        '这个味道让我想起第一个在德国过的冬天。谢谢你。',
        'This tastes like my first winter in Germany. Thank you.',
      ),
      liked: t(
        '谢谢，工地上正好饿了。',
        'Thanks. Building sites make you hungry.',
      ),
      neutral: t('谢谢，有心了。', 'Thanks, that’s thoughtful.'),
      disliked: t(
        '这个……是从运河里捞出来的吧？我上周才清过一车。',
        'This… came out of the canal, didn’t it? I cleared a whole skip of those last week.',
      ),
    },
    lines: lines('emeka', [
      [
        '早！我在修那座桥。你刚来？我当年也是拿蓝卡来的，第一个冬天差点冻成冰棍。',
        'Morning! I’m fixing that bridge. New here? I came on a Blue Card too. My first winter nearly froze me solid.',
      ],
      [
        '工资单、养老保险记录、语言证书，一份份放进同一个文件夹。拿定居许可那天，你会感谢自己。',
        'Payslips, pension record, language certificate: one folder, filed as you go. The day you get settlement, you’ll thank yourself.',
      ],
      [
        '德国人约好的时间，比桥上的螺栓还紧。迟到五分钟，要先发消息。',
        'A German appointment is tighter than a bridge bolt. Five minutes late, send a message first.',
      ],
      [
        '下雨天工地停工，我就去图书馆看工程期刊。',
        'Rain stops the site, so I read engineering journals at the library.',
        { weather: ['rain'] },
      ],
      [
        '秋天的运河最好看。七叶树的叶子落在水上，像一条金色的路。',
        'The canal is loveliest in autumn. Chestnut leaves on the water, like a golden road.',
        { season: 4 },
      ],
      [
        '去年我入了籍，两本护照都留着。宣誓那天我女儿比我还激动。',
        'Last year I naturalised and kept both passports. My daughter was more excited than me at the ceremony.',
        { heartsMin: 3 },
      ],
      [
        '有时候我想，我修的桥会比我在这里待得还久。这样想挺好的。',
        'Sometimes I think the bridges I fix will outlast my time here. I like that thought.',
        { heartsMin: 6 },
      ],
      [
        '灯笼游行今晚走我修的那座桥。我得去看看它够不够亮。',
        'The lantern walk crosses my bridge tonight. I need to check it’s bright enough.',
        { festival: 'st-martin' },
      ],
    ]),
  },
  {
    id: 'leon',
    name: t('莱昂·舒尔茨', 'Leon Schulz'),
    role: t(
      '小学四年级学生，狗鱼专家，灯笼手工高手',
      'Year 4 pupil, pike expert and lantern-making champion',
    ),
    schedule: schedule(
      [
        { from: 0, at: 'away' },
        { from: 870, at: 'park-pond' },
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
        { from: 870, at: 'library' },
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
        { from: 1020, at: 'green' },
        { from: 1260, at: 'away' },
      ],
    ),
    gifts: {
      loved: ['hecht', 'weckmann'],
      liked: ['brezel', 'strawberry', 'apfelschorle'],
      disliked: ['tomatensuppe'],
    },
    reactions: {
      loved: t(
        '哇！！我要拍照给全班看！',
        'Whoa!! I’m showing the whole class!',
      ),
      liked: t(
        '谢谢！我分一半给我妹妹。',
        'Thanks! I’ll give half to my sister.',
      ),
      neutral: t('哦，谢谢。', 'Oh, thanks.'),
      disliked: t('呃……我不喝汤。', 'Er… I don’t do soup.'),
    },
    lines: lines('leon', [
      [
        '嘘！别吵，狗鱼就在桥墩下面。我看到它的影子了！',
        'Shh! Quiet, the pike is under the bridge pier. I saw its shadow!',
      ],
      [
        '狗鱼的牙往里弯，咬住了就不松口。这是我在书上看的。',
        'A pike’s teeth curve inwards so it never lets go. I read it in a book.',
      ],
      [
        '河鲈身上有竖条纹，像穿了睡衣。',
        'Perch have stripes, like they’re wearing pyjamas.',
      ],
      [
        '下雨不能钓鱼，我在图书馆看鱼的图鉴。',
        'No fishing in the rain, so I’m reading the fish book at the library.',
        { weather: ['rain'] },
      ],
      [
        '今年的灯笼我要做成狗鱼的样子，嘴巴会动的那种。',
        'This year my lantern will be a pike. With a mouth that moves.',
        { season: 4 },
      ],
      [
        '你们国家的小孩也提灯笼吗？他们唱什么歌？',
        'Do kids in your country carry lanterns too? What songs do they sing?',
        { heartsMin: 3 },
      ],
      [
        'Ich geh mit meiner Laterne～你也一起唱嘛！',
        'Ich geh mit meiner Laterne~ Sing with me!',
        { festival: 'st-martin' },
      ],
    ]),
  },
  {
    id: 'lena',
    name: t('莉娜·霍夫曼', 'Lena Hoffmann'),
    role: t('马特奥的妻子，小学老师', 'Mateo’s wife, a primary school teacher'),
    characters: ['spouse'],
    schedule: schedule(
      [
        { from: 0, at: 'home' },
        { from: 450, at: 'away' },
        { from: 990, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'allotment-plots' },
        { from: 780, at: 'home' },
        { from: 900, at: 'park-bench' },
        { from: 1020, at: 'home' },
      ],
      [
        { from: 0, at: 'home' },
        { from: 450, at: 'away' },
        { from: 990, at: 'home' },
      ],
      [{ from: 0, at: 'home' }],
      [
        { from: 0, at: 'home' },
        { from: 600, at: 'green' },
        { from: 1260, at: 'home' },
      ],
    ),
    gifts: {
      loved: ['kartoffelsalat', 'erdbeermarmelade'],
      liked: ['kuchen', 'flowers', 'sunflower'],
      disliked: ['old-boot'],
    },
    reactions: {
      loved: t(
        '这个跟我奶奶做的一模一样……你偷偷学的？',
        'This tastes exactly like Oma’s… did you learn it in secret?',
      ),
      liked: t('谢谢，亲爱的。我们一起吃吧。', 'Thanks, love. Let’s share it.'),
      neutral: t('谢谢，我先放冰箱。', 'Thanks. Into the fridge for now.'),
      disliked: t('这是……从运河里捞的吧？', 'Is that… from the canal?'),
    },
    lines: lines('lena', [
      [
        '我回来了。今天三年级的孩子问我，哥伦比亚的冬天是什么样的。我说：没有冬天！',
        'I’m home. Year 3 asked me what winter is like in Colombia. I said: there isn’t one!',
      ],
      [
        '周六我们去菜园吧？吉塞拉说我们那块地的草又长高了。',
        'Allotment on Saturday? Gisela says our grass has grown again.',
      ],
      [
        '我妈又打电话问你德语学得怎么样了。我说：比我爸好。',
        'Mum called again to ask how your German is going. I said: better than Dad’s.',
      ],
      [
        '你上周自己给房东写的邮件，我看了，一个错都没有。',
        'I read the email you wrote the landlord last week. Not a single mistake.',
        { when: [{ stat: 'german', min: 60 }] },
      ],
      [
        '麦德林现在是什么季节？我们在这边喝热红酒，也算陪你过节。',
        'What season is it in Medellín now? We’ll drink mulled wine here; that counts as celebrating with you.',
        { season: 1 },
      ],
      [
        '有时候我在想，如果当初是我搬去麦德林，会不会也这么手忙脚乱。',
        'Sometimes I wonder if I’d be this flustered had I moved to Medellín instead.',
        { heartsMin: 4 },
      ],
    ]),
  },
];
