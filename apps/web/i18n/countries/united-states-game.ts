// The US town game: `us.game.*` wording that replaces the shared game strings
// or adds its own, recipe steps included (see gameKey in
// app/game-shell/game-ui.tsx).
export const usGameZh = {
  'us.game.prepare-mashed-potatoes': '煮软土豆，加黄油压成泥',
  'us.game.prepare-corn-chowder': '玉米和土豆丁一起炖到浓稠',
  'us.game.prepare-fish-fry': '鱼裹上面糊，下锅炸到金黄',
  'us.game.prepare-strawberry-shortcake': '草莓切片，铺在饼干和奶油上',
  'us.game.prepare-garden-salad': '切块，淋上农场沙拉酱',
  'us.game.prepare-potstickers': '芜菁剁碎拌馅，包好煎到底部焦脆',
  'us.game.english': '英语·公民',
  'us.game.gcColumn': '绿卡',
  'us.game.citColumn': '入籍',
  'us.game.approval': '核准条件',
  'us.game.oath': '参加入籍宣誓典礼',
  'us.game.oathConfirm':
    '宣誓之后你就是美国公民了，这一局在典礼上收尾。准备好了吗？',
  'us.game.entry': '玩一局 · 湖湾生活',
  'us.game.entryDesc':
    '在芝加哥湖边的像素小镇上班、钓黄鲈、过节，看看日常选择怎样影响绿卡与入籍的时间线。',
  'us.game.title': '移民生活 · 湖湾',
  'us.game.intro':
    '在芝加哥北边的湖湾街区安顿下来。上班、准备入籍考试、跳湖过新年，把四季过成自己的故事。',
  'us.game.chooseCharacter': '谁将搬进湖湾？',
  'us.game.visa': '绿卡有效期剩余 {count} 个月',
  'us.game.visaUrgent': '绿卡即将到期',
  'us.game.visaPending': '绿卡申请待决',
  'us.game.visaReminderTitle': '新一季，看看绿卡日期',
  'us.game.visaReminder':
    '绿卡还剩 {count} 个月。条件绿卡要在到期前递交 I-751，普通绿卡可在到期前换卡，都在联邦大楼的邮局窗口办理。',
  'us.game.fastVisaWarning':
    '绿卡有效期到 {date}。快进会直接过完这一季、跨过这一天，先去联邦大楼看看吧。',
  'us.game.fastVisaWarningNone':
    '当前没有有效的绿卡记录。快进会直接过完这一季，先去联邦大楼看看吧。',
  'us.game.visaVisit': '去联邦大楼',
  'us.game.noVisaActions': '眼下这里没有可办的移民手续。',
  'us.game.renewedThisSeason': '本季已寄出绿卡申请，等待 USCIS 裁定。',
  'us.game.councilDetails': '去法律援助中心看详情',
  'us.game.collectionMemory.pond': '那天{weather}，你在湖边防波堤钓到了它。',
  'us.game.fishJunk': '湖里的小意外，也一起带上岸吧。',
  'us.game.openTimeline': '在美国模拟器里打开这条时间线',
  'us.game.settlementSource.brighterHome': '湖景顶层公寓',
  'us.game.settlementSource.walkingClub': '湖滨步道跑团',
  'us.game.noSeeds': '背包里没有当季种子，去街角杂货店看看吧。',
  'us.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自社区菜园的收成，黄鲈要去湖边防波堤钓。',
  'us.game.rentFirst': '先在社区菜园租一块地。',
} as const;

export const usGameEn: Record<keyof typeof usGameZh, string> = {
  'us.game.prepare-mashed-potatoes':
    'Boil the potatoes and mash them with butter',
  'us.game.prepare-corn-chowder': 'Simmer corn and diced potato until thick',
  'us.game.prepare-fish-fry': 'Batter the fish and fry it golden',
  'us.game.prepare-strawberry-shortcake':
    'Slice the berries over biscuits and cream',
  'us.game.prepare-garden-salad': 'Chop and toss with ranch',
  'us.game.prepare-potstickers':
    'Mince the turnip, fold and pan-fry until crisp',
  'us.game.english': 'English · civics',
  'us.game.gcColumn': 'Green card',
  'us.game.citColumn': 'Citizenship',
  'us.game.approval': 'Approval requirements',
  'us.game.oath': 'Take the Oath of Allegiance',
  'us.game.oathConfirm':
    'After the oath you are a U.S. citizen, and this game ends at the ceremony. Ready?',
  'us.game.entry': 'Play a round · Life in Lakebend',
  'us.game.entryDesc':
    'Work, fish for perch and join the block parties in a pixel-art corner of Chicago by the lake, and see how everyday choices shape your green card and citizenship timeline.',
  'us.game.title': 'Immigration Life · Lakebend',
  'us.game.intro':
    'Settle into Lakebend on Chicago’s North Side. Work, prepare for the citizenship test, plunge into the lake on New Year’s Day and make the seasons your own.',
  'us.game.chooseCharacter': 'Who is moving to Lakebend?',
  'us.game.visa': 'Green card: {count} month{count:s} left',
  'us.game.visaUrgent': 'Green card expiring soon',
  'us.game.visaPending': 'Green card: application pending',
  'us.game.visaReminderTitle': 'A new quarter: check your green card',
  'us.game.visaReminder':
    'Your green card has {count} month{count:s} left. A conditional card needs an I-751 before it expires, and a regular card can be renewed; both go through the post office counter at the Federal Building.',
  'us.game.fastVisaWarning':
    'Your green card runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the Federal Building first.',
  'us.game.fastVisaWarningNone':
    'No valid green card is recorded. Fast-forwarding runs to the end of the quarter, so visit the Federal Building first.',
  'us.game.visaVisit': 'Visit the Federal Building',
  'us.game.noVisaActions':
    'No immigration paperwork is available here right now.',
  'us.game.renewedThisSeason':
    'You mailed your green card paperwork this season; USCIS has yet to decide.',
  'us.game.councilDetails': 'Visit the legal aid clinic for details',
  'us.game.collectionMemory.pond':
    'You caught it off the lakefront pier on a {weather} day.',
  'us.game.fishJunk': 'A little lake surprise, brought safely ashore.',
  'us.game.openTimeline': 'Open this timeline in the U.S. simulator',
  'us.game.settlementSource.brighterHome': 'A top-floor lake-view apartment',
  'us.game.settlementSource.walkingClub': 'Lakefront Trail running club',
  'us.game.noSeeds': 'No seeds for this season. Try the corner store.',
  'us.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from community garden harvests, and perch from the lakefront pier.',
  'us.game.rentFirst': 'Rent a plot at the community garden first.',
};
