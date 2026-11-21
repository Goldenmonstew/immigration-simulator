import type { Npc } from './types';

const copy: Record<string, [string, string][]> = {
  margaret: [
    [
      '林遥，眼睛离开屏幕看看。虫都翻到叶背去了。',
      'Yao, look away from the screen. The bugs are under the leaves.',
    ],
    [
      '林遥，纸盒给我！装种子，省一笔。',
      'Those boxes, Yao! For seeds. Saves a few pennies.',
    ],
    [
      '林遥，我也有养死的苗。忙不过来就别多种。',
      "I lose seedlings too, Yao. I don't plant more than I can manage.",
    ],
    [
      '嘉宁，孩子要挖就挖。那块土本来就没种好。',
      "Let your child dig, Ka Ning. That patch wasn't growing much anyway.",
    ],
    [
      '你家孩子眼睛尖。豆荚藏得低，我腰可弯不下。',
      "Sharp eyes, your child. Those pods are low; my back won't bend.",
    ],
    [
      '嘉宁，放下壶喝茶！又没叫你锄地。',
      "Put the flask down and drink, Ka Ning! You're not digging.",
    ],
    [
      '索菲娅，芜菁叶挑嫩的。老的，我也嚼不动。',
      "Tender turnip tops, Sofia. I can't chew the old ones either.",
    ],
    [
      '你和杰米带杯子来。壶盖配不配，茶都能倒。',
      'Bring cups, you and Jamie. Mismatched lid still pours tea.',
    ],
    [
      '索菲娅，空盆多得很。要苗就说，别客气半天。',
      'Plenty of pots, Sofia. Say if you want seedlings. No fuss.',
    ],
    [
      '蓝丝带拿到了，菜还得洗。比赛不管这一步。',
      "Got your ribbon. Still have to wash the vegetables. Show won't do that.",
    ],
    [
      '续签你熬过了？得了，来讲，我边剥豆边听。',
      "So you've been through renewal? Tell me. I'll shell beans while I listen.",
    ],
    [
      '豆架搭高了。我够不到，豆子可不会往下送。',
      "Bean poles too high. Can't reach; beans won't deliver themselves.",
    ],
    [
      '水管又打结。别拽，越拽越费我的腰。',
      "Hose is tangled again. Don't pull. My back pays for that.",
    ],
    [
      '我字写得乱，海伦认错花名。错不全在她。',
      "Helen misread my plant label. My handwriting's half the trouble.",
    ],
    [
      '支架我往里挪。挡了邮差的路，报纸也晚来。',
      "I'll move the supports in. Block the postman and my paper's late too.",
    ],
    [
      '普里娅买盆先量。我买了再腾地方，难怪乱。',
      'Priya measures before buying pots. I make room after. Explains the mess.',
    ],
    [
      '又想起讲给你那段旧事了。锄头也扔一边了。',
      'Thinking about that old story I told you again. Put the hoe aside, too.',
    ],
    [
      '得了，花盆听腻我的唠叨了。今天你来听！',
      'Flowerpots are sick of my grumbling. Your turn to listen!',
    ],
    [
      '破盆不扔。垫在好盆外面，还能挡一下磕碰。',
      'Keep the cracked pot. Put it round a sound one for protection.',
    ],
    [
      '蛋盒给我装种子，名字写在盖上，这回留大点字。',
      'Egg box for seeds. Names on the lid, larger letters this time.',
    ],
    [
      '小屋挂绳别叠着。找个壶，要解半天结。',
      "Don't pile the shed strings up. Takes ages to get a can free.",
    ],
    [
      '问我种地秘诀？先少买点，我自己也没做到。',
      "My gardening secret? Buy less. Haven't managed that myself.",
    ],
    [
      '新铲子硌手，我还是用这把掉漆的。',
      "New trowel rubs. I'll use this one with the paint flaking off.",
    ],
    [
      '豆子铺这张报纸上吧，晚饭留一把给我，其余你分。',
      'Beans on this newspaper. A handful for my dinner; share the rest.',
    ],
    [
      '壶盖拴住了。响就响吧，总好过掉到土里。',
      'Tied the lid on. Let it rattle. Better than dropping in the soil.',
    ],
  ],
  ade: [
    [
      '林遥，公司电脑重启好了（原因没找着），同事等着用。',
      "Yao, work computer's running again (cause still unknown). Colleague needs it.",
    ],
    [
      '林遥，雇主给的材料找到了（在旧邮件里），我再核日期。',
      "Yao, found the employer's papers (in an old email). Checking the dates again.",
    ],
    [
      '林遥，同事叫我吃午饭（又忘看钟），代码先放着。',
      'Yao, colleague called me for lunch (lost track again). Code can wait.',
    ],
    [
      '嘉宁，你接送赶得上吗？我换班的邮件还没回。',
      'Ka Ning, can you make the school run? Still waiting on my shift-swap email.',
    ],
    [
      '嘉宁，我下班还得理续签清单（漏了自己的名字）。',
      'Ka Ning, renewal checklist after work (left my own name off it).',
    ],
    [
      '学校周末义卖？我得查班次（差点又直接答应）。',
      'School sale this weekend? Need to check my shifts (nearly said yes again).',
    ],
    [
      '索菲娅，我把续签日期抄到班表了（抄反了一栏）。',
      'Sofia, put my renewal dates on my rota (wrong column).',
    ],
    [
      '你和杰米忙得过来吗？我续签材料又装错文件夹。',
      'You and Jamie managing all right? Put my renewal papers in the wrong folder again.',
    ],
    [
      '索菲娅，续签费用我重算了（车费漏了），这回记上。',
      'Sofia, redid my renewal budget (left out fares). Added them this time.',
    ],
    [
      '续签复印件少了一页（我少选的），得再跑一趟。',
      'One page missing from my renewal copies (my selection). Another trip needed.',
    ],
    [
      '你经历过续签了。我也还在核对（先说到这里）。',
      "You've been through renewal. I'm still checking (that's as far as I can say).",
    ],
    [
      '烤饼分给同事了（留了你的），黄油在你手边。',
      "Shared the scones with colleagues (saved yours). Butter's beside you.",
    ],
    [
      '公司的抽屉卡住了（我塞的尺），得清出点空。',
      "Office drawer's stuck (my ruler in there). Need to clear some space.",
    ],
    [
      '戴夫那本我想借（先问本人），拿来查一段旧题。',
      "I'd borrow Dave's book (ask him first) to check an old question.",
    ],
    [
      '续签的钱又数错了（按错键），我先核自己的账。',
      'Miscounted my renewal savings (wrong key). Checking my own sums first.',
    ],
    [
      '莉娜画完了？我想看（得先擦手），墨还没干。',
      "Lina finished? I'd like a look (wash hands first). Ink's still wet.",
    ],
    [
      '上回说完还在等雇主回信（只问材料），我又看了邮箱。',
      "Still waiting for my employer's reply (only asked about papers). Checked the inbox again.",
    ],
    [
      '说说你的今天吧（我的班上完了），续签清单先合上。',
      "Tell me about your day (my shift's done). Renewal checklist closed for now.",
    ],
    [
      '同事找的笔在我耳朵上（我自己放的），先还回去。',
      "Colleague's missing pen is behind my ear (put it there myself). Giving it back.",
    ],
    [
      '同事做的回形针小人留着（我收桌子），放工牌旁。',
      "Keeping my colleague's paper-clip figure (clearing my desk). Beside the work pass.",
    ],
    [
      '通勤耳机又缠了（昨晚乱收的），先解开再装盒。',
      'Commuting headphones tangled (put away badly last night). Untangle before boxing them.',
    ],
    [
      '那盆是塑料的（我浇过水），托盘得先擦干。',
      'Plastic plant (I watered it). Dry the tray first.',
    ],
    [
      '公司的快捷键贴错了（旧版软件），喝完茶去换。',
      'Wrong office shortcut label (old software). Changing it after tea.',
    ],
    [
      '续签本第一页写错了（把班次抄来了），翻页重写。',
      'Wrong first page in my renewal notebook (copied my shifts). Starting on the next page.',
    ],
    [
      '计时器响了（烤饼那一炉），我去关，你接着讲。',
      "Timer rang (batch of scones). I'll turn it off. Carry on.",
    ],
  ],
  helen: [
    [
      '林遥，报错信息能写得亲切吗？我想听个例子。',
      'Yao, can an error message sound kind? Give me an example.',
    ],
    [
      '林遥，书里夹车票？这书签还想去哪里？',
      'Ticket in your book, Yao? Where does this bookmark want to go?',
    ],
    [
      '林遥，换个不工作的词。龙怎么样？它不打卡。',
      "A word away from work, Yao. Dragon? It doesn't clock in.",
    ],
    [
      '嘉宁，孩子讲学校时，你最想问哪一句？',
      "Ka Ning, what's your first question when your child talks about school?",
    ],
    [
      '孩子报名字，你会怎么拆音节？我怕又记错。',
      "How would you break your child's name into syllables? I want to get it right.",
    ],
    [
      '嘉宁，家长群哪种缩写最难猜？我也常猜错。',
      'Ka Ning, which school-chat abbreviation baffles you? I get them wrong too.',
    ],
    [
      '索菲娅，你家乡那句问候，直译会少什么？',
      'Sofia, what gets lost translating that greeting from home?',
    ],
    [
      '你和杰米各自的词，哪一个最容易听岔？',
      'Which of your words is easiest for Jamie to mishear?',
    ],
    [
      '索菲娅，别人替你接话时，你会怎么叫停？',
      'Sofia, how do you stop someone finishing your sentence?',
    ],
    [
      '学生纠正我读音了。我问能再示范一次吗？',
      'A student corrected my pronunciation. I asked for another demonstration.',
    ],
    [
      '书脊字太小。我教人仔细看，也得先找眼镜。',
      'Tiny spine lettering. Teaching close reading still needs glasses.',
    ],
    [
      '钓到梭子鱼了？你用哪一个词形容它的脸？',
      'Caught a pike? Which word describes its face?',
    ],
    [
      '新词挤满纸了。这个是名词，还是我画的圈？',
      'Words crowding the page. Is this a noun or my circle round it?',
    ],
    [
      '玛格丽特这花名，你认成什么？我念成了菜。',
      "What's that plant name Margaret wrote? I read it as a vegetable.",
    ],
    [
      '戴夫的题，我总先问：「你问的是哪个意思？」',
      "With Dave's questions, I always ask which meaning he wants.",
    ],
    [
      '普里娅说「下一位」，我还在讲第一位的例句。',
      "Priya says next, please. I'm still explaining the first example.",
    ],
    [
      '旧事讲给你后，我又想起那张只写三个词的便条。',
      'After telling you that story, remembered my note with just three words.',
    ],
    [
      '跟你聊天像换了课堂座位，这回我坐学生那边。',
      "Talking to you feels like swapping classroom seats. I'm the student this time.",
    ],
    [
      '我批作业写问号。学生问：是我问，还是你问？',
      'I marked a question mark. Student asked: my question or yours?',
    ],
    [
      '书名忘了，你记得哪句？我记得一段吵架。',
      'Forgot the title. Which line do you remember? I remember an argument.',
    ],
    [
      '我跳过那页了。你也读不懂那个长句吗？',
      'Skipped that page. Did that long sentence defeat you too?',
    ],
    [
      '故事在哪儿停？这里，还是等角色说完这句？',
      'Where does the story pause? Here, or after the character finishes?',
    ],
    [
      '便签贴错书了。这次误读，全怪书签。',
      "Note in the wrong book. This misreading is the bookmark's fault.",
    ],
    [
      '听见「标准答案」，我总问是哪一版题目。',
      'Hear model answer and I always ask which edition of the question.',
    ],
    [
      '用词典压纸，学生问：「老师，这算查资料吗？」',
      'Used a dictionary as a weight. Student asked if that counts as research.',
    ],
  ],
  priya: [
    [
      '林遥，先核你下班了吧？前台电脑我明天再问。',
      "Yao, checking you're off duty. Reception computer questions can wait till tomorrow.",
    ],
    [
      '林遥，伞挂这边，跟接待台一样留条过道。',
      'Umbrella here, Yao. Clear passage, like at reception.',
    ],
    [
      '林遥，接待电话转好了，下班我这边关铃。',
      'Yao, reception calls transferred. Off duty, turning my ringer off.',
    ],
    [
      '嘉宁，孩子的名字请本人报，前台也得核准。',
      'Ka Ning, let your child give their name. Reception needs it right too.',
    ],
    [
      '名字请本人报，我这边照原音记。',
      "Name from the person themselves, please. I'll write down what I hear.",
    ],
    [
      '嘉宁，先给自己找把椅子，接待台那种硬的都成。',
      'Ka Ning, find yourself a chair too. Even one of those hard reception ones.',
    ],
    [
      '索菲娅，请你来讲，接待台也先听本人。',
      'Sofia, you tell me. At reception I ask the person themselves too.',
    ],
    [
      '你和杰米各说各的，我的接听习惯是一人一遍。',
      'You and Jamie each get a turn. Phone habit: hear each person separately.',
    ],
    [
      '索菲娅，听漏哪句？我按接电话的速度重说。',
      "Which bit did you miss, Sofia? I'll repeat it at my phone-answering pace.",
    ],
    [
      '蓝丝带拿到了？先坐这边，前台语气没收住。',
      "Got the ribbon? Sit here first. Haven't switched my reception voice off.",
    ],
    [
      '候诊室人名保密。换一题，拼图你找边吗？',
      'Waiting-room names are confidential. New subject: start a jigsaw with the edges?',
    ],
    ['我这边去补把椅子，请稍等。', "I'll get another chair. Bear with me."],
    [
      '锅炉上门约好了？记下时段，我排预约也怕漏。',
      'Boiler visit booked? Write the slot down. I worry about missing appointments too.',
    ],
    [
      '戴夫讲笑话像前台转接，总得核一遍转哪边。',
      "Dave's jokes are like reception transfers. Always checking where they're going.",
    ],
    [
      '接待台的花换塑料了，午休能多拼几块。',
      'Plastic flowers at reception. A few more jigsaw pieces in my lunch break.',
    ],
    [
      '海伦听人讲完才追问，接待台该请她来示范。',
      'Helen hears the whole answer before asking again. Reception could use that demonstration.',
    ],
    [
      '讲过自己的事，我回家少复盘几通电话了。',
      'After telling you my side, I replay fewer calls when I get home.',
    ],
    [
      '上回说到接待耳机，先核一下，你听到哪了？',
      'We were talking reception headsets. Quick check: where did I get to?',
    ],
    [
      '请先核这张预约表，错的交前台碎掉。',
      'Please check this appointment form first. Reception will shred the wrong one.',
    ],
    [
      '我的杯子认缺口，接待台那批也好区分。',
      'I know my mug by the chip. Helps with that batch at reception too.',
    ],
    [
      '预约电话挂完又说谢谢，这句下班还收不住。',
      "Another thanks after an appointment call. Can't stop saying it off duty.",
    ],
    [
      '接待台的队伍交接了，我这边先坐一下。',
      "Handed over the reception queue. I'm sitting down for a bit.",
    ],
    [
      '针线放前台备件盒了，袖口总被抽屉勾。',
      "Sewing kit in reception's spares box. Drawer keeps snagging my cuff.",
    ],
    [
      '休息时段写进预约本了，这回真轮到我。',
      'My break is in the appointment book. Finally my turn.',
    ],
    [
      '我先核完预约顺序，下班才轮到拼图边块。',
      'Appointment order first. Jigsaw edges get their turn after work.',
    ],
  ],
  dave: [
    [
      '林遥，你这电脑声音小点好，我还得听厨房喊菜！',
      'Yao, turn that computer down a touch. Need to hear the kitchen!',
    ],
    [
      '林遥，小票先拿稳！汤来了，腾开这半张桌。',
      'Yao, keep that receipt! Soup coming. Half the table clear, please.',
    ],
    [
      '林遥，我把灯调亮点，你看屏幕还是看菜单？',
      'Yao, lights up a little. Screen or menu for you?',
    ],
    [
      '嘉宁，孩子吃什么？我去厨房问还有没有小碟。',
      "Ka Ning, what's your child having? I'll ask about small plates.",
    ],
    [
      '嘉宁，接送群的事坐下讲，我这壶刚续过水。',
      'Ka Ning, sit and tell me about the school-run group. Fresh water in the pot.',
    ],
    [
      '嘉宁，一家人坐靠窗这桌吧，椅子我来添。',
      "Ka Ning, window table for the family. I'll fetch chairs.",
    ],
    [
      '索菲娅，家乡笑话讲来听。笑慢了，算我网慢。',
      'Sofia, tell a hometown joke. Late laugh is my connection.',
    ],
    [
      '你和杰米要分着点？我多拿个碟，汤别分洒了！',
      'Sharing with Jamie? Extra plate. Keep the soup in its bowl!',
    ],
    [
      '索菲娅，讲错一个词不扣分。扣分归我说了算。',
      'One wrong word loses no points, Sofia. Points are my department.',
    ],
    [
      '黑板写错字了。特邀校对员，工资是一声谢谢。',
      'Blackboard typo. Guest proofreader, paid in thanks.',
    ],
    [
      '你这名字我怕念错，先教老板一遍，来，慢些。',
      'Might get your name wrong. Teach the boss once, slowly.',
    ],
    [
      '钓到梭子鱼啦？手张这么大，我得腾张桌听！',
      'Caught a pike? Hands that far apart? Need table space for this story!',
    ],
    [
      '客人嫌吵，我把音乐关了。来，先让我说完。',
      'Too loud for a customer, so music off. Let me finish, then.',
    ],
    [
      '阿德借我那支笔还在这儿，我每回找都先喊他。',
      "Ade's pen's still here. I call him first whenever I need it.",
    ],
    [
      '海伦上回来借书，我还夹着菜单，差点一起借走。',
      'Helen borrowed a book. Nearly lent my menu with it.',
    ],
    [
      '拉赫曼这回来得早，我能跟他一起坐着吃口热的。',
      "Rahman's early. I can sit and eat something hot with him.",
    ],
    [
      '听过老板掉链子，你还来？本店荣幸，真的。',
      "You've heard the landlord fall apart and you still come back? We're honoured. Really.",
    ],
    [
      '哎，把主持帽摘了跟你聊。谁笑我秃谁洗杯子！',
      "Right, hosting hat off for our chat. Laugh at my bald patch and you're washing glasses!",
    ],
    [
      '新粉笔太长。写字有底气，字迹还是没底。',
      'Long new chalk. Confident hand, uncertain handwriting.',
    ],
    [
      '这杯圈擦不掉！各位，本店新设冠军纪念环。',
      "That ring won't come off! Folks, behold our new champions' memorial circle.",
    ],
    [
      '有人点没听过的歌。我点头，转身查。专业。',
      'Unknown song request. Nod, turn, search. Professional.',
    ],
    [
      '酒吧笑话不包好笑。包我讲完，已经很厚道。',
      "Pub jokes aren't guaranteed funny. Finishing them is generosity enough.",
    ],
    [
      '答案放信封。别捏，捏不出知识来。',
      "Answers in envelopes. Squeezing won't produce knowledge.",
    ],
    [
      '汤勺掉进锅。我宣布，这是加深参与。',
      'Ladle fell in. Deeper participation, officially.',
    ],
    [
      '客人说随便放歌。完了，最难的点单来了。',
      'Anything on the playlist? Hardest request of all.',
    ],
  ],
  rahman: [
    [
      '林遥，你改软件，我改货架，老客找不到茶还得喊我。',
      'Yao, you change software, I change shelves. Regulars still call me to find their tea.',
    ],
    [
      '林遥，标签的字看不清？拿过来，我把进货单也找来。',
      "Can't read that label, Yao? Bring it here. I'll find the supplier's sheet too.",
    ],
    [
      '林遥，办公室忙成那样，来我店里还盯手机吃面包？',
      "Office that busy, Yao? Even eating bread in my shop you're looking at your phone?",
    ],
    [
      '嘉宁，零钱让孩子数，上回他替我查出了漏找的钱。',
      'Let your child count the change, Ka Ning. Found the bit I missed last time.',
    ],
    [
      '孩子换口味了？嘉宁，那箱饼干我替你问问谁要。',
      "Child's tastes changed, Ka Ning? I'll ask around for someone who wants that biscuit box.",
    ],
    [
      '嘉宁，全家都买齐了，你自己那包茶呢？我给拿。',
      "Got everything for the family, Ka Ning? Where's your tea? I'll fetch it.",
    ],
    [
      '索菲娅，家乡那香料带个包装来，我问问供货商。',
      "Bring a packet of that spice from home, Sofia. I'll ask my supplier.",
    ],
    [
      '你和杰米吃的辣度不同，来，这有分装的小包。',
      "You and Jamie like different heat levels. Here, I've got little separate packets.",
    ],
    [
      '索菲娅，那味道我还没找到，有一回进错整箱货。',
      "Still haven't found that flavour, Sofia. Once ordered a whole wrong case trying.",
    ],
    [
      '货架摆满？老朋友，顶上那排我愁了好久，卖不动。',
      "Full shelves? My friend, that top row's been worrying me for ages. Won't sell.",
    ],
    [
      '老朋友，我把单价写收据上，那一项刚才按错了。',
      "I'll write the unit price on your receipt, my friend. Keyed that one wrong just now.",
    ],
    [
      '米买小袋的？我自己也买，后仓满了，家里可放不下。',
      'Small bag of rice? I buy those too. Full warehouse, but no room at home.',
    ],
    [
      '年轻时进货，我把门后都堆满，关店差点出不去。',
      "When I was young I stacked stock behind the door. Nearly couldn't get out at closing.",
    ],
    [
      '海伦教我看清那行配料，老朋友，我看成了另一样。',
      "Helen helped me read those ingredients, my friend. I'd mistaken one for something else.",
    ],
    [
      '戴夫那笑话我听过，还笑，老朋友，算照顾老生意。',
      "Heard Dave's joke before. Still laughed, my friend. Supporting a repeat seller.",
    ],
    [
      '加雷思记得我的送货口，老朋友，新货来常按错门铃。',
      'Gareth knows my delivery entrance, my friend. New drivers keep ringing the wrong bell.',
    ],
    [
      '老朋友，那年想卖店的事，你还记得？广告我留着。',
      'Remember that year I wanted to sell, my friend? Still got the advert.',
    ],
    [
      '老朋友，跟你聊过后，我把想去的演出贴柜台后了。',
      'After our chat, my friend, pinned the concert I want to see behind the counter.',
    ],
    [
      '零钱我分两盒，老朋友，一盒给客人，一盒补收银机。',
      'Keep change in two boxes, my friend. One for customers, one to top up the till.',
    ],
    [
      '老朋友，这个缺货，我得问供货商，换牌子你愿意吗？',
      'Out of stock, my friend. Need to ask the supplier. Would another brand suit?',
    ],
    [
      '来问路？老朋友，把袋子搁柜台，图我有一张。',
      "Directions? Set your bag on the counter, my friend. I've got a map.",
    ],
    [
      '我也买错过米，开店的人煮出一锅稀粥，家里都笑。',
      'Bought the wrong rice myself once. Shopkeeper makes a pot of sludge. Family laughed.',
    ],
    [
      '来，纸绳多剪一点，你这袋货重，我得再绕一圈。',
      "I'll cut a bit more string. That's a heavy bag of shopping. Needs another loop.",
    ],
    [
      '老朋友，上回你替我看店，今天的茶我请，算回礼。',
      "You watched the shop last time, my friend. Tea's on me today. Returning the favour.",
    ],
    [
      '这旧秤还准，老朋友，我拿同一袋米两边比过。',
      'Old scales are accurate, my friend. Checked the same bag of rice on both.',
    ],
  ],
  lina: [
    [
      '林遥，拒签那阵我也盯屏幕，眼都花了。',
      'Yao, I stared at screens after my refusal too. Eyes went blurry.',
    ],
    [
      '林遥，我问到一家咨询机构，先查接待时间。',
      'Yao, found an advice charity. Checking their opening hours first.',
    ],
    [
      '林遥，替我看看补材料的附件怎么传不上去。',
      "Yao, can you see why my extra documents won't upload?",
    ],
    [
      '嘉宁，补材料那回我漏吃午饭，你吃了吗？',
      'Ka Ning, I missed lunch chasing documents that time. Have you eaten?',
    ],
    [
      '嘉宁，你自己的路线呢？别又拿全家的糊弄我。',
      "Your own route, Ka Ning? Don’t hand me the whole family's again.",
    ],
    [
      '嘉宁，咨询我要自己讲，喂，你陪着就行。',
      "Ka Ning, I'll speak at the advice session. Hey, just come along.",
    ],
    [
      '索菲娅，拒签那阵你陪我走过，今天换我。',
      'Sofia, you walked with me after my refusal. My turn today.',
    ],
    [
      '你说给杰米听的那扇家门，我要画！里面什么色？',
      'That door back home you told Jamie about. I want to draw it! Colour inside?',
    ],
    [
      '索菲娅，Plan B 我改过，别又替我收行李。',
      "Sofia, I've changed Plan B. Don't start packing for me again.",
    ],
    [
      '蓝丝带拿好了，别塞我补材料的包，会皱。',
      'Keep that ribbon safe. My document bag will crumple it.',
    ],
    [
      '拒签理由我圈了，拜托，别再从头念一遍。',
      "Marked the refusal reasons. Please don't read the whole thing to me again.",
    ],
    [
      '律师那串问题问完，咖啡都续两回了。',
      'Got through my solicitor questions. Two coffee refills later.',
    ],
    [
      '补材料的扫描件歪了，喂，字还认得吧？',
      'Scanned documents came out crooked. Hey, still readable, right?',
    ],
    [
      '海伦帮我读拒签那句，我先把火压下去。',
      'Helen helped read that refusal sentence. Had to calm down first.',
    ],
    [
      '玛格丽特问咨询怎么样，我先跟她骂车费。',
      'Margaret asked how the advice went. Started by grumbling about the fare.',
    ],
    [
      '附件名全改了，烦，怎么还说找不到。',
      'Renamed every attachment. Ugh, why does it still say missing?',
    ],
    [
      '那段旧事你听过，我直接接着骂，听着啊。',
      'You know the old story. Picking up my rant where I left it. Listen.',
    ],
    [
      '那次拒签后停笔的事，你听过，我接着讲。',
      "You heard how I stopped drawing after the refusal. I'll carry on from there.",
    ],
    [
      '咨询问题列了满屏，手机却先睡着了。',
      'A whole screen of advice questions. Phone fell asleep before I did.',
    ],
    [
      '复印材料又花钱，拜托，这项真漏算了。',
      'More money copying documents. Come on, I really missed that cost.',
    ],
    [
      '补材料那包缝了两层，肩带还是先投降。',
      'Sewed that document bag twice. Strap still gave up first.',
    ],
    [
      'Plan B 先查住处，喂，行李我自己来。',
      "Checking somewhere to live for Plan B. Hey, I'll do my own packing.",
    ],
    [
      '拒签后那笔开销我记漏了，咖啡倒一杯没漏。',
      'Missed an expense after the refusal. Counted every coffee, though.',
    ],
    [
      '咨询回信我自己拆，拜托，别先猜结果。',
      "I'll open the advice reply myself. Please don't guess what it says.",
    ],
    [
      '截止日写在手机上，闹钟比我还暴躁。',
      "Deadline's in my phone. Alarm's got a worse temper than me.",
    ],
  ],
  gareth: [
    [
      '林遥，耳机先收。过桥往左，栏杆缝容易漏。',
      'Earphones away, Yao. Left after the bridge. Easy to drop them through the railings.',
    ],
    [
      '林遥，往路边停，鞋带系好。这口我天天送信。',
      'Yao, stop at the edge. Tie that lace. I deliver through here daily.',
    ],
    [
      '林遥，下班走熟路。过邮筒右拐，省认一个路口。',
      'Yao, familiar route home. Right past the postbox. One less crossing to work out.',
    ],
    [
      '嘉宁，孩子开门，我退台阶下。邮袋先放脚边。',
      "Ka Ning, child's opening the door. I'll step below the stairs. Postbag by my feet.",
    ],
    [
      '嘉宁，信箱名字写左上。门牌右边，远处就能认。',
      'Ka Ning, name top left on the letterbox. Number on the right. Clear from a distance.',
    ],
    [
      '孩子的信夹左侧。先拿出来，传单在右侧。',
      "Child's post clipped left. Take that out first. Leaflets on the right.",
    ],
    [
      '索菲娅，寄卡先写地址。邮票右上，花画另一面。',
      'Sofia, address first. Stamp top right. Flowers on the other side.',
    ],
    [
      '你和杰米寄照片，硬纸夹两面。邮袋里容易弯。',
      'Posting photos, you and Jamie? Card on both sides. Bend easily in the postbag.',
    ],
    [
      '索菲娅，旧地址容易写顺手。投前再看一遍。',
      'Old address comes easily, Sofia. Check again before posting.',
    ],
    [
      '橡皮筋弹手了。先松这捆信，沿长边滑下来。',
      'Band snapped my hand. Loosen the bundle. Slide it along the long edge.',
    ],
    [
      '广告看饿了。回家改路线，面包店那头绕一下。',
      'Leaflets made me hungry. Revised route home. Round by the bakery.',
    ],
    [
      '池边鸭子追邮袋。往外绕，过栏杆就甩开了。',
      "Ducks chasing the postbag. Round the outside. Past the railings and we're clear.",
    ],
    [
      '锅炉约人了？纸条贴门牌下，走近正好能看见。',
      'Boiler visit booked? Note below the house number. Visible on the approach.',
    ],
    [
      '海伦书包有反光条。过路口，后面容易看见。',
      "Helen's bag has reflectors. Easier to see at crossings.",
    ],
    [
      '戴夫字压得重。送便签得夹硬纸，两面都垫。',
      'Dave presses hard writing. His notes need card, both sides.',
    ],
    [
      '阿德地址印得齐。邮票歪一点，不影响送到。',
      'Ade prints neat addresses. Crooked stamp still delivers.',
    ],
    [
      '讲给你那段路，我又走了。过矮墙，原地停了会儿。',
      'Walked that route I told you about again. Past the low wall. Stood there a while.',
    ],
    [
      '跟你说着说着，又报方向了。到拐角停，接着讲。',
      'There I go giving directions again. Stop at the corner. Carry on talking there.',
    ],
    [
      '钥匙换圈，旧的左袋，备用右袋。邮局那把单放。',
      'Keys on new rings. Old left, spare right. Post office key separate.',
    ],
    [
      '车铃修响了。螺丝拧紧，出门试，拐角再按。',
      'Bike bell repaired. Tighten screw, test outside, ring again at the corner.',
    ],
    [
      '窗帘广告夹在邮袋底。我家小窗，半张纸就遮完。',
      'Curtain leaflet at the bottom of the bag. My little window barely needs half a sheet.',
    ],
    [
      '近路小门低。帽檐压下，邮袋侧过，再进。',
      'Low gate on the shortcut. Brim down, postbag sideways, then through.',
    ],
    [
      '手帕磨薄了。邮袋扣子又勾一洞，得放别的袋。',
      'Handkerchief worn thin. Another hole from the postbag clasp. Needs a different pocket.',
    ],
    [
      '车篮垫布边收好。不然挂住信角，要重理。',
      'Tuck basket cloth in. Catches letter corners otherwise.',
    ],
    [
      '邮袋落地，背直起。长椅这头坐，右边那块松。',
      'Postbag down, back straight. This end of the bench. Loose board on the right.',
    ],
  ],
};

const routes = [
  'SKILLED_WORKER',
  'HONG_KONG_BNO',
  'FAMILY_PARTNER_OR_PARENT',
] as const;
const recent: Record<string, Record<number, string>> = {
  margaret: { 9: 'show-result-ribbon', 10: 'visa-renewed' },
  ade: { 10: 'visa-renewed' },
  helen: { 11: 'caught-pike' },
  priya: { 9: 'show-result-ribbon', 12: 'boiler-planned' },
  dave: { 11: 'caught-pike' },
  rahman: {},
  lina: { 9: 'show-result-ribbon' },
  gareth: { 12: 'boiler-planned' },
};
const callbacks: Record<string, number[]> = {
  margaret: [4, 6],
  ade: [4, 6],
  helen: [4, 6],
  priya: [2, 6],
  dave: [2, 6],
  rahman: [2, 6],
  lina: [4, 6],
  gareth: [2, 6],
};
export const townDialogue: Record<string, Npc['lines']> = Object.fromEntries(
  Object.entries(copy).map(([npc, pairs]) => [
    npc,
    pairs.map(([zhCN, en], i) => ({
      id: `${npc}-town-${i + 1}`,
      text: { zhCN, en },
      ...(i < 9 && {
        heartsMin: 1,
        when: [{ route: routes[Math.floor(i / 3)] }],
      }),
      ...(recent[npc][i] && { requires: [recent[npc][i]] }),
      ...(npc === 'ade' && i === 15 && { forbids: ['lina-left'] }),
      ...(i >= 16 &&
        i < 18 && {
          requires: [`heart-${npc}-${callbacks[npc][i - 16]}-shared`],
        }),
    })),
  ]),
);

const everydayCopy: Record<string, [string, string][]> = {
  margaret: [
    [
      '豆子种开点！手伸不进，摘一顿晚饭得蹲半天。瞧我这老腰，收完一垄就直不起来。',
      "Space those beans out! Half a day crouching for one dinner. Look at my back. One row and I can't straighten up.",
    ],
    [
      '土我会闻。听着怪？堆肥坏了味道更怪，买回来再嫌弃，钱可不会自己回到口袋。',
      "I smell the soil. Odd? Bad compost smells odder. Disliking it at home won't put the money back.",
    ],
    [
      '篱笆那个缺口留着。刺猬能过，我少修一处，邻居问起来，两边都有个交代。',
      'Keep that gap in the fence. Hedgehog gets through, one less repair for me. An explanation for the neighbours too.',
    ],
    [
      '我把花全种门边了。倒垃圾就能看，走远了又会手痒去拔草，垃圾桶还得跟着我逛。',
      "Planted the flowers by the door. See them taking the bin out. Any farther and I'd start weeding, bin trailing behind me.",
    ],
    [
      '这丑豆子我留着炖汤。看什么看！弯就弯，我费劲搭了架子，还能为了它弯再扔了？',
      "Those ugly beans are for soup. What? They're bent! I built that whole frame. I'm not throwing them out over a bend.",
    ],
    [
      '种子袋拍得真齐整！我种出来东倒西歪。下回寄张照片给厂家，看他们认不认自家种子。',
      "Lovely straight plants on the packet! Mine lean everywhere. I'll send the growers a photo. See if they recognise their seeds.",
    ],
    [
      '薄荷最好种盆里。我在地里吃过亏，想喝杯茶容易，想叫它只长一点，可就难了。',
      'Mint in a pot. Learned that in the ground. Easy to make tea; harder to make it grow just a little.',
    ],
    [
      '果酱瓶拿来插花挺好。就是找盖子的时候别又算它一个，我没少为这事翻抽屉。',
      "Jam jars make good vases. Just don't count them when hunting lids. I've searched enough drawers that way.",
    ],
    [
      '夸我菜地整齐？你一定从隔壁那头过来的。站到这里看，豆架后面还有一大摊呢。',
      "My plot tidy? You came from next door's end. Stand here. Plenty of mess behind the bean poles.",
    ],
    [
      '换盆先松根，手轻些！我上回拉断一截，心疼得骂了半天，现在还在小屋里养着那棵。',
      'Loosen the roots when you repot. Gently! Snapped a bit last time. Swore for ages. Still nursing that plant in the shed.',
    ],
    [
      '这地我就种一半。得留条路搬壶！上回脚滑，屁股坐在生菜上，我自己都舍不得吃了。',
      "I'm planting half the plot. Need a path for the watering can! Slipped last time and sat on the lettuce. Put me right off it.",
    ],
    [
      '那排空着？我拔草拔错了！得了，笑吧。拔完还夸自己眼神好，转头种子袋找不着了。',
      "That empty row? Weeded the wrong things! Go on, laugh. Praised my own eyesight, then couldn't find the seed packet.",
    ],
    [
      '路上铺点草，鞋底少带些泥。光靠进门跺脚，我厨房这块地，都快比菜地肥了。',
      "Straw on the path means less mud indoors. Stamping my boots hasn't stopped the kitchen growing richer than the plot.",
    ],
    [
      '听隔壁这挖土声，准是又碰石头了！我这边也一堆，挑出来摞在篱笆下，快能盖小屋。',
      "Hear that digging next door? More stones! I've got a pile under the fence too. Nearly enough to build another shed.",
    ],
    [
      '这土压得太实了，水全往外流！我那次蹲半天还纳闷，后来整盆倒出来，重拌了一遍。',
      'Packed that soil too hard. Water runs straight off! Wondered about it for ages. Tipped the whole pot out and mixed it again.',
    ],
    [
      '堆肥里谁塞了整根树枝？好家伙，我抽半天，连上面的菜叶都拖出来了，鼻子都要熏掉。',
      'Who put a whole branch in the compost? Good grief. Pulled half the peelings out with it. The smell nearly took my nose off.',
    ],
    [
      '手套硬成这德性！先揉几下，上回我硬套，指头把尖戳破了。新补那块，瞧见没？',
      'Gloves are stiff as boards! Work them first. Forced mine on last time and poked a hole. See that new patch on the finger?',
    ],
    [
      '番茄甜不甜，你来尝。我自己种的，舌头早偏心了，夸一句我都想多浇两壶水。',
      "You judge the tomatoes. My tongue's biased. One compliment and I'll be tempted to give them two extra cans.",
    ],
    [
      '豆花这么小，我倒爱看。种子袋上放大得像碟子，害我头一回等半天，差点拿去退货。',
      'Tiny bean flowers. I do like them. Packet makes them look saucer-sized. First time I waited ages. Nearly took them back.',
    ],
    [
      '得了，别拿泥手擦头发！瞧我额头这一道，刚才就这么抹的，洗手那盆水又得重换了。',
      'Keep muddy hands out of your hair! Look at this streak on my forehead. Did it myself. Now I need another basin of water.',
    ],
    [
      '歪萝卜切块炖，归我！上回有人嫌它长得怪，我端整盘给他看，结果他吃得比谁都快。',
      'Crooked carrots are mine for the pot! Someone called them ugly. Showed him a whole dish. He ate faster than anyone.',
    ],
    [
      '膝盖又响了。唉，蹲着拔草最要命！我找了个矮凳，垫子缝厚点，坐一垄往前挪一垄。',
      "Knee's clicking again. Ugh, crouching to weed! Found a little stool. Sewed a thicker cushion. Move it along after each row.",
    ],
    [
      '盆底碎石我洗过了，还能用。买新袋又得扛，巴士停那么远，上回搬回来茶都凉透了。',
      'Washed the stones from the pots. Still usable. New bag means carrying it from that distant bus stop. Tea went cold last time.',
    ],
    [
      '给我打活结！你这绳子勒死了，我得翻剪刀。昨天找剪刀找到天黑，它就躺种植本底下。',
      "A bow knot, please! You've pulled this tight. Now where are the scissors? Looked till dark yesterday. Under the growing book.",
    ],
  ],
  ade: [
    [
      '续签待办写了两页，完成的只有半行。材料夹已经塞不下了，我先把买菜那张拿出来。',
      "Two pages of renewal tasks, half a line done. Folder's full already. Taking the shopping list out first.",
    ],
    [
      '同事提早结束会议，我捏着饼干发愣。原本以为还得加班，现在得查哪班车回去。',
      'Colleague finished the meeting early. Stood holding a biscuit. Expected overtime; now checking the bus home.',
    ],
    [
      '工作餐还冻着（只化了表面），公司的微波炉得再排一次。这回我会把中间拨开。',
      'Work lunch still frozen (only the surface thawed). Back in the office microwave queue. Splitting the middle this time.',
    ],
    [
      '公司的培训视频卡了，讲师还对着人笑。同事问我学到哪了，我只记得他那件衬衫。',
      "Work training video froze with the presenter smiling. Colleague asked how far I'd got. Only remember his shirt.",
    ],
    [
      '同事把杯子摆成团队合照。我的把手没出镜，申请重拍遭拒，理由是糖包已经拆开了。',
      "Colleagues posed their mugs for a team photo. My handle's missing. Reshoot request denied: sugar packets had already been opened.",
    ],
    [
      '通勤路线少坐一站，多经过面包店。净收益暂时为正，还没把多买面包算进去。',
      'One less bus stop, one more bakery. Net gain positive so far. Extra bread purchases not yet included.',
    ],
    [
      '上班视频会只拍领口（我试过了），衬衫肚子那片还皱着。等会儿站起来就露馅。',
      'Work calls only show my collar (tested it). Shirt still creased round my stomach. Standing up will give me away.',
    ],
    [
      '明天带给同事的午饭被我试掉半盒（只是试味），得再煮一点。先把饭盒扣上。',
      "Tasted half tomorrow's lunch for my colleague (just checking seasoning). Need another batch. Lid on first.",
    ],
    [
      '自行车备用通勤方案恢复。维修副产物：满手链条油，肥皂消耗超预算，毛巾建议报废。',
      'Backup cycle commute restored. Repair by-product: chain oil everywhere. Soap over budget. Recommend writing off the towel.',
    ],
    [
      '赶上班跑到路口，还是得等红灯。同事从后头慢慢走来，手里的茶一滴也没洒。',
      'Ran to the crossing on my way to work. Still red. Colleague strolled up behind me without spilling any tea.',
    ],
    [
      '同事换了安静键盘，我听不见他下班了。等我抬头，公司那排灯只剩我这盏。',
      "Colleague's quiet new keyboard hides when he leaves. Looked up to find only my light still on in that row.",
    ],
    [
      '午休剥橙子还想一次剥完，同事已经吃完了（我才剥一半）。橙皮先别扔，我较上劲了。',
      "Trying for one whole orange peel at lunch. Colleague's finished (I'm halfway through). Keep the peel. I'm committed now.",
    ],
    [
      '同事约午休跑步，我答应了（忘了带鞋）。跑鞋在家，饭盒在手，今天先吃饭。',
      "Agreed to a colleague's lunchtime run (forgot my trainers). Shoes at home, lunch in hand. Eating first today.",
    ],
    [
      '续签清单和买菜单贴反了，超市袋里没找到那页材料。牛奶倒买了，回家得重理。',
      'Swapped my renewal and shopping lists. No documents in the supermarket bag. Got the milk; sorting again at home.',
    ],
    [
      '雇主回了材料邮件（附件还没打开），我先把接收日期记下。又把月份抄成了班次。',
      'Employer replied about the papers (attachment still unopened). Recording the date first. Copied my shift for the month again.',
    ],
    [
      '同事笑完我才听懂，我也想笑（嘴里还有饭）。等咽下去，他们已经讲起下一件了。',
      "Got my colleague's joke after everyone laughed. Want to laugh too (mouth full). Swallowed; they've moved on.",
    ],
    [
      '通勤路上的面包店认得我了。店员问照旧，我还在想续签费，差点把银行卡收回去。',
      'Bakery on my commute knows me now. Asked for my usual; I was thinking about renewal fees and nearly put my card away.',
    ],
    [
      '新鞋底太滑（刚试出来），通勤先走慢一点。同事问我怎么突然肯早出门了。',
      "New soles are slippery (just discovered). Slower commute today. Colleague asked why I'm suddenly willing to leave early.",
    ],
    [
      '等续签回信时练口琴，邻居敲墙了。我停下来（正好也喘口气），邮箱里还是旧信。',
      'Practising harmonica while waiting for renewal news. Neighbour knocked. Stopped (needed a breath anyway). Same old inbox.',
    ],
    [
      '公司电梯叮了，我跟着同事走出去（错了一层）。工牌还在手里，又得按一次上行。',
      'Work lift dinged. Followed my colleague out (wrong floor). Pass still in hand. Up button again.',
    ],
    [
      '烤饼带到公司裂开了，我往里涂果酱。同事吃了两块，才提醒我衬衫也沾上了。',
      'Scones cracked on the way to work. Filled them with jam. Colleague ate two before pointing out the jam on my shirt.',
    ],
    [
      '同事谈跑步，我只把背坐直了。工作椅又往下滑一格，得起来找那根调节杆。',
      'Colleagues discussed running. I just sat straighter. Work chair sank another notch. Up to find the lever.',
    ],
    [
      '下班洗碗还哼公司的等候音乐，唱到一半才认出来。想换一首，脑子里只剩这段。',
      'Humming the office hold music while washing up after work. Recognised it halfway through. Tried another tune; only know this bit.',
    ],
    [
      '续签日期记了两处（都在同一本里），本子却找不到了。我先翻通勤包，饼干也碎在里面。',
      "Renewal dates recorded twice (both in one notebook). Can't find the book. Checking my work bag; biscuits crumbled in there too.",
    ],
  ],
  helen: [
    [
      '你说「学不会」，究竟哪个词？我上回被一个介词难住，查了词典还找学生要例句。',
      "You say you can't learn it. Which word? A preposition stumped me last time. Dictionary first, then I asked a student for examples.",
    ],
    [
      '学生答错了，我问他怎么想的。他把题目也读给我听，我才发现是我少印了半句话。',
      "Asked a student how he got his wrong answer. He read the question out. I'd left half a sentence off the sheet.",
    ],
    [
      '今天讲解快了吗？刚才学生一路点头，我问讲到哪了，他指的还是我开头那个例句。',
      "Was I too fast today? Student kept nodding. Asked where we'd reached. He pointed to my very first example.",
    ],
    [
      '「请再说一遍」怎么练才顺口？学生说让我先试，我就连说三遍，结果自己也笑场了。',
      'How do we practise could you say that again? Student made me go first. Said it three times and started laughing myself.',
    ],
    [
      '教案塞满一页，我删哪段？学生说想讲他的猫，我竟找了半天，才挤出能接话的地方。',
      'A whole page of lesson notes. What do I cut? Student wanted to talk about his cat. Took me ages to find where he could get in.',
    ],
    [
      '买书我先翻对白。「你好」「你好吗」连写三页？我怀疑这两个人根本没想好要聊什么。',
      'I turn to dialogue before buying a book. Three pages of hello, how are you? I suspect neither character knows what to talk about.',
    ],
    [
      '借书单上给自己加本侦探小说，破案前先猜谁干的。你会偷看末页吗？我总得忍一忍。',
      'Added a detective novel to my borrowing list. Guess before the reveal. Do you peek at the last page? I always have to resist.',
    ],
    [
      '你看我这词改了几遍？原来是「走」，换成「溜」，又改回去，旁边倒画满了一圈小花。',
      'See how often I changed this word? Walk, then slip away, then back again. Drew little flowers all round it meanwhile.',
    ],
    [
      '学生问了个我答不出的词，我说「不知道」。他当场拿出手机，我们查到了两种相反用法。',
      "Student asked a word I couldn't explain. Said I didn't know. Out came his phone. We found two opposite uses.",
    ],
    [
      '讲义错字圈完，才发现印的是旧版。我问学生谁还留着新版，全班举手，就我得去复印。',
      'Marked every typo, then found it was the old handout. Asked who had the new one. Everyone. Only I needed a copy.',
    ],
    [
      '哪句话让你笑？「全部」太狡猾了，挑一句！我上回问学生，他只指我写错的那个字。',
      'Which line made you laugh? All of it is a sneaky answer. Pick one! Last student I asked pointed at my spelling mistake.',
    ],
    [
      '这书你读完了吗？我到半本停了，角色还在等火车，等到我借书到期，他们也没上去。',
      "Finished that book? I stopped halfway. Characters waiting for a train. My loan expired and they still hadn't boarded.",
    ],
    [
      '我是不是解释复杂了？刚才拿火车讲时态，学生最后问我的却是：「去市中心换哪班？」',
      "Am I making this complicated? Used trains to explain tenses. Student's final question: which one changes for the town centre?",
    ],
    [
      '学生把我「心像石头」的比喻改成「土豆」。我问为什么，他说石头洗起来没有土豆烦。',
      'Student changed my heart like a stone to a potato. Asked why. Potatoes are more annoying to wash, he said.',
    ],
    [
      '你家乡有哪个词最难翻？我爱收这些。上回一个学生给我讲到茶凉了，还说只讲了开头。',
      'Which word from home is hardest to translate? I collect those. Last student talked till the tea went cold. Only the beginning, he said.',
    ],
    [
      '同一句说两遍，是想换哪个词？我问学生，他说：「老师，你把我要用的词先说走了。」',
      'Saying it twice: which word are you changing? Asked a student. You used the word I wanted before I could, he said.',
    ],
    [
      '书页折角，你觉得算弄坏吗？我一个学生用车票夹了十处，说自己同时在读十个地方。',
      "Does folding a page count as damage? A student marks ten places with tickets. Says he's reading ten places at once.",
    ],
    [
      '今天这问题问得准吗？我写「你怎么看」，学生回「坐着看」，我只好加了整整一行。',
      'Is this question precise? Wrote how do you see it. Sitting down, a student replied. Had to add a whole line.',
    ],
    [
      '这句话我改口了。新例句和旧例句撞了车，学生比我先看见，还给两句各画了个车轮。',
      'Changed my wording. New example collided with the old one. Student spotted it first and drew wheels under both.',
    ],
    [
      '课堂突然安静，我问在想什么。原来学生们在读我背后的错字，我还以为题目太难了。',
      "Class went quiet. Asked what they were thinking. Reading a typo behind me. I'd thought my question was difficult.",
    ],
    [
      '词典翻得最旧是哪页？我在「尽管」那页贴了三张签，学生每问一回，我得翻一回。',
      'Which dictionary page is most worn? Three tabs on although. Every time a student asks, back I go.',
    ],
    [
      '讲笑话得先解释哪个词？我刚解释完，学生说现在轮到他讲了，把我的结尾也讲走了。',
      'Which word do I explain before the joke? Finished explaining and the student took his turn. Used my ending too.',
    ],
    [
      '借的书我把批注另写纸上。你看这页，纸比原文厚，学生笑我等于自己又写了一本。',
      "Notes for a borrowed book go on paper. Look here: thicker than the text. Student says I've practically written another book.",
    ],
    [
      '报名字前说「不好意思」，你也这样吗？我曾经说惯了，学生竟以为那是我名字一部分。',
      'Do you say sorry before your name too? I did it so often, a student thought it was part of mine.',
    ],
  ],
  priya: [
    [
      '今天你来定说什么，我接了一天电话，脑子还在报姓名；给我一口茶的工夫就好。',
      "You choose the subject. I've answered calls all day and my brain's still asking names. Give me a mouthful of tea.",
    ],
    [
      '请坐这边，水在你右手。我自己也常忙得忘喝，摘掉接线耳机才发现嗓子冒烟了。',
      "Seat here, water on your right. I forget too. Headset comes off and I discover my throat's gone dry.",
    ],
    [
      '这事得问本人。我在接待台最怕同名，连着核三遍，最后发现约的是另一位同姓的。',
      'Ask them directly. Same names are my reception nightmare. Checked three times, then found it was another person entirely.',
    ],
    [
      '接待台的预约电话一响，我就把饭盖上。今天这口豌豆热了两回，叉子还没碰到。',
      "Appointment phone rings at reception; lid goes on lunch. Heated these peas twice today. Fork hasn't touched them.",
    ],
    [
      '核预约先对姓名，拼海景先找边块。偏偏海全是蓝的，下班也得盯着一排找不同。',
      'Names first for appointments, edges first for a seascape jigsaw. All blue, though. Spotting differences even off duty.',
    ],
    [
      '接待台钥匙、家门钥匙各挂一边。换小包后总掏错，开自家门也像正在等人交班。',
      'Reception keys on one side, home keys on the other. Smaller bag; keep grabbing the wrong set at my own door.',
    ],
    [
      '散步我爱停在池塘边找鸟。拼图里它们全站得端正，真的一只只钻进芦苇，害我白找。',
      'I stop by the pond to find birds. They pose so neatly in jigsaws. Real ones duck into reeds. Wasted search.',
    ],
    [
      '前台缺表我会登记，拼图少块也一样。那片蓝天的编号找了半天，原来盒子拿反了。',
      "Log missing forms at reception, missing jigsaw pieces too. Hunted that sky piece's number. Had the box upside down.",
    ],
    [
      '我讲错姓名会自己重报，耳机那头已经等得够久；你在旁边帮喊，两边声音就撞上了。',
      "I'll repeat a name if I get it wrong. They've waited long enough on the phone. Call it out beside me and we overlap.",
    ],
    [
      '叫我名字就行，突然拍肩会把接线耳机扯掉。上回线缠上围巾，我差点连电话带走。',
      "Say my name. Tap my shoulder and I'll pull the headset off. Caught the cable in my scarf and nearly took the phone.",
    ],
    [
      '核预约时，我总再问一遍本人。家属一口气说完，电话那头真正要约的人还没开口呢。',
      'I check appointments with the person themselves. Family can say a whole lot before the person booking has spoken.',
    ],
    [
      '请先核预约时间，别只说「下午」。我自己的茶凉到什么时段倒记不得，耳机都摘了。',
      "Please check the appointment time, not just “afternoon”. Can't recall when my own tea went cold. Headset's already off.",
    ],
    [
      '围巾选素色，接线耳机缠进去好找。花纹那条像拼图，解到午休，我饭都快凉透了。',
      'Plain scarves show the headset cable. Patterned one was a jigsaw. Took till lunch to untangle. Food nearly cold.',
    ],
    [
      '你先讲完，我接电话也这么等；急着插话常把门牌听成日期，还得从姓名重新核起。',
      'Finish your thought. I do that on calls too. Interrupt and I hear a door number as a date, then start checking again.',
    ],
    [
      '交班前我灌一杯水，常被铃截走半杯。现在我直接把杯盖拧开摆旁边，看着就记起。',
      'I drink water before handover. Calls keep stealing half the glass. Now I leave the lid off beside me as a reminder.',
    ],
    [
      '接待台连着核重名，下班再看海景全是蓝。今天聚会我想改天，眼睛实在分不清了。',
      "Same-name checks at reception, then an all-blue jigsaw at home. Can we move today's get-together? My eyes can't tell things apart.",
    ],
    [
      '接待午休刚开始，预约电话就响。我把面条盖上，回来全粘成一团，这顿得用叉子拧。',
      'Reception lunch break starts, appointment phone rings. Covered my noodles; came back to a lump. Have to twist this lunch apart.',
    ],
    [
      '前台补预约本，我先核型号；买拼图杂志也先翻缺块服务。书店老板都认得那一页了。',
      'Check the format before ordering reception appointment books. Check missing-piece service in jigsaw magazines. Bookseller knows the page now.',
    ],
    [
      '家门钥匙现在挂拼图块钥匙圈，摸得到凸边。接待台那串用圆环，闭着眼也能分开。',
      'My home key has a jigsaw-piece fob. Feel the tabs. Reception keys have a round ring. Can tell them apart by touch.',
    ],
    [
      '预约电话里我先复述时段，走路也会念。上回念到最后，发现已经走过该拐的路口。',
      "Repeat the slot back on appointment calls. Keep saying it walking home. Last time I finished and found I'd missed my turning.",
    ],
    [
      '前台的预约顺序我记得牢，自己的拼图倒忘了哪块。下班脑里还在叫下一位，真得停停。',
      "Know reception's appointment order by heart. Forgot my jigsaw piece, though. Still calling the next person in my head after work. Need a break.",
    ],
    [
      '前台耳机坏了，请先查备件盒。我上回只换海绵垫，左右装反，交班时耳朵都压红了。',
      'Reception headset broken? Check the spares box first. Swapped cushions last time, wrong sides. Red ears by handover.',
    ],
    [
      '我自己去拼图店转转，待会儿找你。你猜老板这回摆什么？又是海景，我就找他理论。',
      "Off to browse the jigsaw shop. See you later. Guess what's in the window? Another seascape and we'll have words.",
    ],
    [
      '答应帮忙之前请先报内容，接待台这句话我练熟了。家里也用，尤其遇见搬整盒拼图。',
      "Tell me what's involved before I agree. Reception phrase I've practised. Use it at home too, especially for moving jigsaw boxes.",
    ],
  ],
  dave: [
    [
      '你说随便？那我先随便问一句，真的随便？这道题答错了，端出来可没有重赛机会。',
      "Anything? Random question: really anything? Wrong answer and what's served gets no rematch.",
    ],
    [
      '这笑话老？它可没收你怀旧税啊。要是每讲一回都得换新的，我早把店卖了买词典。',
      "Old joke? No nostalgia tax. If every telling needed a new one, I'd sell the pub and buy a dictionary.",
    ],
    [
      '我记人名不记欠账，反过来就要关店了。来，别紧张，聊天这笔暂时还不收钱。',
      "Remember names, write debts down. Reverse that and we'd close. Relax. Conversation isn't charged yet.",
    ],
    [
      '热水？有！各位，这位题目太容易，老板总算答对一回。大杯还是小杯，追加题？',
      'Hot water? Absolutely! Folks, at last, a question the landlord can answer. Big mug or little one? Bonus round?',
    ],
    [
      '答错也能坐到散场。这是酒吧，不是淘汰赛，要不然我自己早就站在门外主持了。',
      "Wrong answers can stay. Pub, not elimination. Otherwise I'd be hosting from outside the door.",
    ],
    [
      '杯子大，人就以为茶多。我得认真倒，不能每回都靠容器的表演能力撑着这家店。',
      "Big mugs look like more tea. Must pour properly. This pub can't live on the crockery's performance.",
    ],
    [
      '嘴角动了，我看见了！这一场冷笑话差点全军覆没，多谢你替本店抢救最后一名选手。',
      'Saw that corner of your mouth move! Nearly lost every joke in the round. Thanks for saving our last contestant.',
    ],
    [
      '我怎么歇？擦桌子时走神呗！客人喊老板，我答请抢答，手里抹布还在同一块木头上转。',
      'How do I rest? Daydream wiping tables! Someone calls for the landlord, I call for answers, and the cloth keeps circling one spot.',
    ],
    [
      '赢了要谦虚，我自己做不到，你们加油。主持的失败经验，也算本店附赠的资料。',
      "Winners should be modest. I can't. You try. Host's failures count as complimentary reference material.",
    ],
    [
      '菜单字这么整齐，看出来不是我写的吧？本店确实有员工，比老板更配拥有粉笔。',
      'Neat menu. Clearly not mine. We do employ people more deserving of chalk than the boss.',
    ],
    [
      '来，吐槽环节！各位只限一件，上一位从杯子漏水讲到修屋顶，我的薯条听完都凉了。',
      'Time for complaints! One each, folks. Last guest went from a leaky glass to roof repairs. My chips went cold listening.',
    ],
    [
      '有人坐吧台问我怎么开口，我把抢答铃收了。后来他开口了，问我薯条还能不能加一份。',
      'Someone at the bar asked how to start talking, so I put the buzzer away. When he finally spoke, he wanted more chips.',
    ],
    [
      '哎，我答不上来就扯着嗓子，自己听着像开奖！你下回敲敲吧台，提醒老板还没给答案。',
      "When I'm stumped I start booming like a raffle announcer! Tap the bar next time. Remind the landlord he owes you an answer.",
    ],
    [
      '点杯茶坐一会儿？欢迎！今天的茶是新拆的，老板亲自尝过，烫了舌头，可信度相当高。',
      'Tea and a seat? Welcome! Fresh packet today. The landlord tasted it personally and burnt his tongue. Thoroughly verified.',
    ],
    [
      '刚才那杯子敲得比我还响，建议下回让它主持。它只会叮一声，居然比我的开场词受欢迎！',
      'That glass is louder than me. It can host next time! One little ding and it gets a warmer welcome than my opening speech.',
    ],
    [
      '黑板擦干净再写，不然特价总来串场。客人问我到底卖什么，我也得转头再看一遍。',
      "Clean the board first or old specials return. Customers ask what's for sale; I have to look myself.",
    ],
    [
      '主持的秘诀？听清人家喊什么！上回客人说杯子漏了，我接一句恭喜，把水端得满地都是。',
      'Secret to hosting? Hear what people actually shout! Someone said their glass was leaking. I said congratulations. Water everywhere.',
    ],
    [
      '我自己讲自己笑，后排还问老板是不是听过答案。听过啊，各位，题和答案都是我写的！',
      "I laugh at my own jokes, and the back row asks if the landlord's heard the answer. Folks, I wrote the question AND the answer!",
    ],
    [
      '开放题危险啊！上回问哪种饼干最好，客人争到打烊，还怪我牛奶放少。好，裁判先喝茶！',
      'Open questions are dangerous! Asked for the best biscuit. They argued till closing, then blamed the milk. Right, tea for the referee!',
    ],
    [
      '音乐盖住说话了？各位稍等，我转小一点！这旋钮越转越大，哎哟，刚才转的是灯光。',
      "Music drowning you out? One moment, folks, I'll turn it down! Getting louder? Oh, wonderful. That's the lighting knob.",
    ],
    [
      '我端盘子稳，信心比盘子还稳。这两样偶尔不一致，所以你别站我转身的那条线上。',
      "Steady tray, steadier confidence. Occasionally they differ. Don't stand where I turn.",
    ],
    [
      '只看比赛？坐前排！我刚把观众拉去组队，人家掏出来的是购物单，说题目都在超市呢。',
      'Just watching? Front row for you! Recruited a spectator earlier. They produced a shopping list and said their quiz was at the supermarket.',
    ],
    [
      '笑话失败，我会记下来，免得忘了再犯。当然，记下来也可能只是让我更容易找到它。',
      'I note failed jokes to avoid repeats. Of course, noting them may just make them easier to find.',
    ],
    [
      '休息时还搭话？老板这毛病！上回对着茶壶说欢迎下次再来，回过神发现水都烧干了。',
      'Chatting on my break again? Typical landlord! Told the kettle to come again soon, then realised it had boiled dry.',
    ],
  ],
  rahman: [
    [
      '老朋友，后仓曾经堆到门都关不上，我现在订货，先蹲下去数柜台底还有几袋米。',
      "My friend, I once packed the back room so full I couldn't shut the door. Now I crouch and count the rice under the counter before ordering.",
    ],
    [
      '这苹果碰伤了，我把伤的朝外，价签也改过。老朋友，你挑哪袋？今天拿回家煮的更便宜。',
      'Bruised apples, bruises facing out, price changed. Which bag, my friend? The ones for cooking today are cheaper.',
    ],
    [
      '这袋米漏了，我得扫柜台下。老朋友，袋子再给你套一个，刚才是我搬货勾破了角。',
      "Rice sack's leaking. Need to sweep under the counter. Another bag for you, my friend. Caught the corner carrying it in.",
    ],
    [
      '新进的茶我开一包先喝，老朋友，闻着比上批浓，泡出来却淡。供货商电话就在收银机旁。',
      "Opened a packet of the new tea, my friend. Smells stronger than the last batch, brews weaker. Supplier's number is beside the till.",
    ],
    [
      '今天收银差了点，我又翻送货单。老朋友，你那笔钱数对了，是我把纸箱也记进去了。',
      "Till's a little out today. Checking the delivery sheet again. Your change was right, my friend. I counted the boxes as stock.",
    ],
    [
      '你常买的饼干我留了，换口味的话直说。老朋友，上回给自己留一箱，吃到后来全送人了。',
      "Saved your usual biscuits. Say if you've changed tastes, my friend. Saved myself a case once and ended up giving the rest away.",
    ],
    [
      '来挑苹果，老朋友，我把蒂朝上摆，烂的另装了袋。那个空箱你也带走？我后仓已经挤满。',
      "Pick your apples, my friend. Stalks up, bad ones bagged separately. Want the empty box too? Back room's packed already.",
    ],
    [
      '熟客先问我吃没吃，我本想说吃了，肚子却先响。后来两个人在柜台边分掉那块冷薄饼。',
      "Regular asked if I'd eaten. Was going to say yes; stomach answered first. We ended up sharing a cold flatbread by the counter.",
    ],
    [
      '这包装绳我换粗的了，老朋友，以前勒手，拆货全得拿剪刀，省下的钱又花在创可贴上。',
      'Changed to thicker string, my friend. Old stuff cut my hands. Needed scissors for every delivery, then spent the savings on plasters.',
    ],
    [
      '香料先买小包试试，老朋友，你要做哪道菜？我家那罐孜然开过以后，到现在还剩半罐。',
      'Try a small spice packet first, my friend. What are you cooking? The cumin we opened at home is still half full.',
    ],
    [
      '有个孩子问秤会不会骗人，我拿自己的苹果称两遍，第二次多了点。他笑我手压在秤盘上。',
      'Child asked if scales tell lies. Weighed my own apple twice. Heavier the second time. They laughed: my hand was on the pan.',
    ],
    [
      '敲苹果听声音？老朋友，这招我也在学，敲了满满一箱，熟客还以为我在给水果排乐队。',
      'Tap apples and listen? Still learning, my friend. Tapped a whole case. Regular thought I was starting a fruit orchestra.',
    ],
    [
      '我去街对面看过招牌，老朋友，小字远处全看不见，尤其新写的营业时间，得重新描粗。',
      "Looked at the sign from across the street, my friend. Couldn't read the small print, especially the new hours. Need to thicken those letters.",
    ],
    [
      '这位熟客找零时还讲菜谱，我都掏完硬币了，手就那么摊着。最后问一句，姜到底放多少？',
      'Regular was sharing a recipe while I counted change. Stood there with the coins on my palm. Finally asked: how much ginger, then?',
    ],
    [
      '倒米撒了一地，老朋友，我扫完再给你称新的。刚才想快些收货，袋口那条线我都没拆齐。',
      "Rice everywhere, my friend. I'll sweep and weigh you a fresh bag. Rushed the delivery and hadn't even undone the sack stitching.",
    ],
    [
      '客人说店里味道没变，我领他闻新货的咖喱粉。他打个喷嚏，才想起上回来的时候也打过。',
      'Customer said the shop smells the same. Took him to the new curry powder. One sneeze and he remembered sneezing on his last visit too.',
    ],
    [
      '买姜炖什么？老朋友，这块分叉多，削皮费事，我替你换块直的。店主自己留着慢慢削。',
      "Ginger for what dish, my friend? That one's got fiddly branches. I'll swap it for a straight piece. Proprietor can peel the awkward one.",
    ],
    [
      '这茶回甘，我又拆了包自己喝，老朋友，你来试一口？同款货在第二排，我还藏了点饼干。',
      "Opened another packet of that tea for myself, my friend. Try a sip? Same one's on the second shelf. Got some biscuits tucked away too.",
    ],
    [
      '这批苹果擦得真亮，闻着却淡，老朋友，我打电话问产地，供货商先夸我价签写得好看。',
      "This batch of apples shines but smells faint, my friend. Rang to ask where they're from. Supplier started by praising my price labels.",
    ],
    [
      '旧围裙洗软了，系着舒服，老朋友，就是前袋破过，找零的硬币一走路，全滚柜台底下。',
      "Old apron's soft from washing, my friend. Comfortable, except the pocket split once. Walked off and sent the change rolling under the counter.",
    ],
    [
      '空店里我会唱两句，门铃一响就停。老朋友，客人问这歌哪买的，我只好承认唱错词了。',
      "Sing a little when the shop's empty. Stop at the bell. Customer asked where to buy that song, my friend. Had to admit I'd muddled the words.",
    ],
    [
      '薄饼脆边我先尝，老朋友，这包算店主自用。我刚把价签揭下来，底下还粘着上批的那张。',
      "Crisp edge first, my friend. This packet's for the proprietor. Peeled off the price label and found the last batch's label underneath.",
    ],
    [
      '老朋友，花生买散的还是整袋？我自己装散的总多抓一把，回来盘货，吃掉多少全忘了。',
      'Loose peanuts or a bag, my friend? When I bag some for myself I add another handful. Come stocktake, I forget how many I ate.',
    ],
    [
      '纸袋折齐就装得下，老朋友，外面那绳结我重绑一下。上回客人走到门口，饼干全掉了。',
      "Fold this bag neatly and it'll fit, my friend. Let me retie the string. Last time someone's biscuits fell out right at the door.",
    ],
  ],
  lina: [
    [
      '拒签以后我最烦「放轻松」，谁轻松了？材料找不到时，我连洗衣机里都翻过。',
      "After the refusal, I hated “relax”. Who's relaxed? Lost a document once and even searched the washing machine.",
    ],
    [
      '律师问我最想弄清什么，我张嘴就骂车费。烦死了，真正要问的到回家才想起。',
      'Solicitor asked what I needed to know. I started ranting about bus fares. Ugh, remembered the real question at home.',
    ],
    [
      '换个针法就像换线了！怪不得我老买同色，店员也真敢卖，明明家里还堆着一袋。',
      'Different stitch, looks like different yarn! No wonder I buy the same colour. Shop happily sells it. Bagful at home!',
    ],
    [
      '咨询机构的电话存好了，喂，名字别只写「咨询」。我上回拨到修锅炉那家去了。',
      "Saved the advice charity's number. Hey, label it properly. Last time I rang the boiler repair service.",
    ],
    [
      '补材料那阵一开邮箱就紧张，拜托，超市打折也用这种标题？吓完我还想赚我钱。',
      'Every email startled me while gathering documents. Please, why does the supermarket use that subject line? Scare me, then sell to me.',
    ],
    [
      '我想问律师能不能上诉，话到嘴边先打了嗝。咖啡喝太快，这下连生气都断断续续。',
      "Wanted to ask the solicitor whether I could appeal. Hiccupped instead. Too much coffee; couldn't even stay cross in one go.",
    ],
    [
      '毛线小样我得留，扔掉就忘针法。上回嫌乱收拾一通，结果拆了半条围巾才想起来。',
      'Have to keep yarn samples. Bin them, forget the stitch. Tidied up once, then unravelled half a scarf to remember.',
    ],
    [
      'Plan B 查过房租，喂，我要住处，又不是整栋楼。页面关了，计算器还亮着。',
      'Checked rent for Plan B. Hey, I need somewhere to live, not a whole building. Page closed, calculator still glowing.',
    ],
    [
      '拒签后那只包我还背着，拉链一响就想起赶咨询。现在买菜也背，里面终于有番茄了。',
      'Still use the bag from after the refusal. Zip reminds me of rushing for advice. Takes tomatoes shopping now, at least.',
    ],
    [
      '咨询要问的我录成语音，结果街上巴士太响，回家只听见刹车。问题倒是全被盖住了。',
      'Recorded my advice questions. Bus was so loud all I heard at home was brakes. Drowned out every question.',
    ],
    [
      '织一行我就停一下，漏针返工才真烦。你讲啊，我耳朵闲着，手上这节拆完才能接话。',
      'Pause after each row. Dropped stitches are a pain. Go on, ears are free. Need to undo this bit before I answer.',
    ],
    [
      '拒签那阵人人问下一步，烦，我连午饭都没定。后来真把「先吃饭」写进计划里了。',
      "Everyone wanted my next step after the refusal. Ugh, hadn't picked lunch. Actually put “eat first” in the plan eventually.",
    ],
    [
      '补材料跑了几趟，鞋底先薄了。拜托，清单还在加，至少让我坐着把新添那项看完。',
      'Wore my soles thin chasing documents. Please, the list keeps growing. Let me sit down to read the new item.',
    ],
    [
      '慈善机构回信说约个时间，我把问题写满手机。出门电量才剩一点，又得回头找充电器。',
      'Advice charity replied about a meeting. Filled my phone with questions. Nearly flat when I left; back for the charger.',
    ],
    [
      '拒签理由我能背了，喂，超市买什么倒忘光。拿着空篮子站半天，还以为自己在排咨询。',
      'Know the refusal reasons by heart. Hey, forgot the shopping instead. Stood with an empty basket as if waiting for advice.',
    ],
    [
      '我把截止日设成提醒，手机响一次就去拿包。后来连烤面包响，我都差点冲去车站。',
      'Set a deadline reminder and grabbed my bag whenever it rang. Toaster went off later; nearly ran for the bus.',
    ],
    [
      '拒签后的备选方案我会自己改，拜托，别一开口就替我选。咖啡我都还没决定喝哪种。',
      "I'll revise my own options after the refusal. Please don't choose them for me. Haven't even decided on coffee yet.",
    ],
    [
      '毛线贴手是真软，先让我摸会儿再问织什么！我买的时候脑子一热，图样还没挑。',
      "This yarn's so soft. Let me feel it before asking what I'm making! Impulse purchase. Haven't picked a pattern.",
    ],
    [
      '找律师那阵问了好多遍费用，烦，怕漏项也怕问多。最后人家说：先让我把这句讲完。',
      "Kept asking about solicitor's fees. Ugh, feared missing something and feared asking too much. They said, let me finish first.",
    ],
    [
      '补材料的备份我存了两份，偏偏都叫「最后版」。现在两份一起开，更分不清谁是最后。',
      "Two document backups, both called “final”. Opened them together. Still can't tell which one's final.",
    ],
    [
      '咨询后绕去买蛋糕，拜托，别问这算不算庆祝。我就是饿，奶油又不用写申请理由。',
      "Cake after the advice session. Please don't ask if it's a celebration. I'm hungry. Cream doesn't need an application reason.",
    ],
    [
      '拒签那阵我连线都拉太紧，衣服全皱了。现在一摸到那道褶，就想起等回信有多累。',
      'Pulled every stitch too tight after the refusal. Clothes all puckered. That crease still reminds me how tiring waiting was.',
    ],
    [
      '查 Plan B 时去烧水，回来网页全关了。喂，住处的名字我还没记下来啊。',
      "Boiled water halfway through researching Plan B. Came back to closed tabs. Hey, I hadn't even saved that place's name.",
    ],
    [
      '炭粉又抹上脸，画稿倒护好了，我这鼻子怎么办！先借镜子，别先拿手机拍我。',
      'Charcoal on my face again. Sketch is safe. What about my nose? Mirror first, please. Put the camera away.',
    ],
  ],
  gareth: [
    [
      '这段回程沿河走，过桥左拐。送信时从街对面来，今天终于看清那家屋顶补的瓦了。',
      'Return along the river, left after the bridge. Deliveries come from the other side. Finally saw those repaired roof tiles today.',
    ],
    [
      '到门口先停，雨棚下面才是门铃。上回我掀错盖子，弄出一窝蜘蛛，信还得护着走。',
      'Stop at the door. Bell under the little cover. Lifted the wrong lid last time. Spiders everywhere. Had to protect the post.',
    ],
    [
      '石板换沥青了。过拐角，鞋底声音一变就知道；邮袋往左挪点，那边新墙还没干透。',
      'Paving changed to tarmac. Turn the corner; sound underfoot changes. Shift the postbag left. New wall still wet on that side.',
    ],
    [
      '隔门问谁？我报加雷思，再说送信的。等脚步到门边，包先退半步，上回差点撞门板。',
      "Who's there through the door? Gareth, then postman. Footsteps approaching. Bag half a step back. Nearly hit the door last time.",
    ],
    [
      '陶瓷鸟挪到门牌右边了，我绕回来确认两次。原来住户刷了墙，连信箱也挪了半扇门。',
      "Ceramic bird's now right of the number. Came round twice to check. Fresh wall paint. Letterbox moved half a door across too.",
    ],
    [
      '进小巷轻按铃，前头有人就靠左停。我的邮车刹车慢，尤其下坡，得先空出那段距离。',
      'Light ring into the lane. Someone ahead, stop on the left. Postal bike brakes slowly, especially downhill. Leave that distance first.',
    ],
    [
      '旧地图这条巷到头是面包店后门。右拐才到正门，我头回把邮袋都卸了，才发现走错。',
      "Lane on the old map ends at the bakery's back door. Right for the front. First visit, unloaded the postbag before noticing.",
    ],
    [
      '住户要替我擦鞋，我退到台阶下。邮袋卡在栏杆里了，得先侧身抽出来，才够得到脚。',
      'Resident offered to wipe my shoes. Stepped below the stairs. Postbag stuck in the railings. Sideways to pull it out first.',
    ],
    [
      '空邮袋先张开晾。底部还有潮气，我摸过了；折好收进柜，明早再背出来，又是那味。',
      "Open the empty postbag to dry. Still damp at the bottom. Checked by hand. Fold it into the cupboard and it'll smell again tomorrow.",
    ],
    [
      '名字挤在地址边上，先停，认清再走。上回差一扇门，送错折回来，连狗都又闻了一遍。',
      'Name squeezed beside the address. Stop, read, then move. One door off last time. Went back. Even the dog sniffed me again.',
    ],
    [
      '扶手磨亮那截最滑，右手抓下面。送信走过好多回，雨靴一踩台阶，我就先摸这位置。',
      "Shiny stretch of handrail's slippery. Right hand below it. So many rounds here. Boot hits the step; hand finds that spot.",
    ],
    [
      '面包香是从右侧巷子飘来的，地址保密。邮袋我放门外吃的，面包屑全掉进帽檐里了。',
      'Bread smell came from the right-hand lane. Address private. Ate it with the postbag outside. Crumbs all in my cap brim.',
    ],
    [
      '过矮墙捡了根羽毛，我放墙头上。左口袋全是橡皮筋，右边钥匙，往哪放都得压坏了。',
      'Found a feather past the low wall. Left it on top. Left pocket: rubber bands. Right: keys. Would have crushed it in either.',
    ],
    [
      '窗里挥手，我先抬手再走近。太阳反光，原来认成别家的住户，人家还隔玻璃比门牌。',
      'Someone waved through a window. Waved back, walked nearer. Glare fooled me. Wrong person. They pointed at the house number.',
    ],
    [
      '过邮筒右转那段，有人叫加雷思，我就慢下来。以前以为漏送了，现在知道是叫我坐会儿。',
      "Right after the postbox, someone calls Gareth. I slow down. Used to think I'd missed a delivery. Now it's an invitation to sit.",
    ],
    [
      '这门慢推，先把邮袋移到左肩。右边那颗钉子勾衣服，我外套上那个洞就是从这儿来的。',
      "Push this gate slowly. Postbag to left shoulder first. Nail on the right catches clothes. That's where my coat got its hole.",
    ],
    [
      '过木桥靠左走，第三块木板空响。后头来车就到桥头停，我的邮车铃在这儿也听得清。',
      'Left across the wooden bridge. Third plank sounds hollow. Bike behind you, stop at the end. Can hear my postal bike bell here too.',
    ],
    [
      '新邮袋背带宽了，左肩舒服点。走到坡顶换右肩，过桥再换回来，我背惯了才发现换袋。',
      "New postbag strap's wider. Better on the left shoulder. Swap right at the hilltop, back after the bridge. Took ages to notice the bag change.",
    ],
    [
      '到长椅停，邮袋靠脚边，先吃三明治。纸包碎屑带走，绿地垃圾桶得再往前走一个路口。',
      'Stop at the bench. Postbag by my feet. Sandwich first. Wrap the crumbs. Bin on the green, one crossing farther along.',
    ],
    [
      '新路牌立在旧墙前。到这右拐，门牌按单数走；我旧路线本上还画着被拆掉的报亭。',
      'New sign before the old wall. Right here, odd numbers along. Old round book still shows the demolished newsstand.',
    ],
    [
      '买鞋先穿着绕店一圈，再试蹲下拿邮袋。上回光站着合脚，走半条投递路线后跟就破。',
      'New shoes: circuit of the shop, then crouch for the postbag. Last pair fitted standing. Half a round and my heel was raw.',
    ],
    [
      '粉笔画铺满小巷，我把邮车推过去。左脚落花外，右脚跨太阳，送完回来画面还在呢。',
      'Chalk drawings all along the lane. Pushed the postal bike. Left foot outside the flower, right across the sun. Still there coming back.',
    ],
    [
      '空邮车骑起来轻，路口照样先刹。往右看那辆白车，我天天到这儿，它也天天这会儿来。',
      "Postal bike's light empty. Brake at the crossing. White car on the right: we're both here at the same time every day.",
    ],
    [
      '门口收伞，邮袋挪干处，再甩帽檐的水。上回甩早了，住户刚开门，鞋尖全让我浇湿了。',
      "Umbrella away, postbag somewhere dry, shake rain off the cap. Did that too early last time. Soaked the resident's toes as the door opened.",
    ],
  ],
};

export const everydayDialogue: Record<string, Npc['lines']> =
  Object.fromEntries(
    Object.entries(everydayCopy).map(([npc, pairs]) => [
      npc,
      pairs.map(([zhCN, en], i) => ({
        id: `${npc}-everyday-${i + 1}`,
        text: { zhCN, en },
      })),
    ]),
  );
