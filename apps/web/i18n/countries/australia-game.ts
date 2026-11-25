// Australia's town game: `au.game.*` wording that replaces the shared game
// strings or adds its own, recipe steps included (see gameKey in
// app/game-shell/game-ui.tsx).
export const auGameZh = {
  'au.game.prepare-flathead-and-chips': '裹上面糊，炸到金黄',
  'au.game.prepare-roast-spuds': '刷油撒盐，烤到外脆里软',
  'au.game.prepare-bbq-corn': '在烤架上转一转，抹上黄油',
  'au.game.prepare-winter-veg-soup': '小火慢炖，搅一搅汤锅',
  'au.game.prepare-scone-jam': '加糖，慢慢熬稠',
  'au.game.prepare-summer-salad': '切块，挤一点柠檬汁',
  'au.game.english': '澳式口语',
  'au.game.season1': '夏',
  'au.game.season2': '秋',
  'au.game.season3': '冬',
  'au.game.season4': '春',
  'au.game.prColumn': '永久居留（191）',
  'au.game.timeDate': '时间条件最早满足',
  'au.game.entry': '玩一局 · 金合欢湾生活',
  'au.game.entryDesc':
    '在维多利亚州海边的像素小镇上班、钓鱼、过节，看看日常选择怎样影响 191 永居的时间线。',
  'au.game.title': '移民生活 · 金合欢湾',
  'au.game.intro':
    '在维多利亚州的海边小镇金合欢湾安顿下来。上班、报税、码头钓鱼、过节，把南半球的四季过成自己的故事。',
  'au.game.chooseCharacter': '谁将搬进金合欢湾？',
  'au.game.visa': '签证剩余 {count} 个月',
  'au.game.visaUrgent': '签证即将到期',
  'au.game.visaReminderTitle': '新一季，看看签证日期',
  'au.game.visaReminder':
    '当前签证还剩 {count} 个月。到期前可到政府服务中心递交下一步申请。',
  'au.game.fastVisaWarning':
    '当前签证到 {date} 为止。快进会直接过完这一季、跨过这一天，先去政府服务中心看看吧。',
  'au.game.fastVisaWarningNone':
    '当前没有有效的签证记录。快进会直接过完这一季，先去政府服务中心看看吧。',
  'au.game.visaVisit': '去政府服务中心',
  'au.game.noVisaActions': '眼下这里没有可办的签证手续。',
  'au.game.councilDetails': '去移民代理事务所看详情',
  'au.game.collectionMemory.pond': '那天{weather}，你在码头钓到了它。',
  'au.game.fishJunk': '海湾的小意外，也一起带上岸吧。',
  'au.game.openTimeline': '在澳大利亚模拟器里打开这条时间线',
  'au.game.settlementSource.brighterHome': '海景木板屋',
  'au.game.settlementSource.walkingClub': '海滨晨跑团',
  'au.game.noSeeds': '背包里没有当季种子，去街角牛奶吧看看吧。',
  'au.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自社区菜园的收成，鲬鱼要去码头钓。',
  'au.game.rentFirst': '先在社区菜园租一块地。',
} as const;

export const auGameEn: Record<keyof typeof auGameZh, string> = {
  'au.game.prepare-flathead-and-chips': 'Batter and fry until golden',
  'au.game.prepare-roast-spuds': 'Oil, salt and roast until crisp',
  'au.game.prepare-bbq-corn': 'Turn on the grill and add butter',
  'au.game.prepare-winter-veg-soup': 'Simmer low and stir the pot',
  'au.game.prepare-scone-jam': 'Add sugar and simmer until thick',
  'au.game.prepare-summer-salad': 'Chop and squeeze over some lemon',
  'au.game.english': 'Aussie English',
  'au.game.season1': 'Summer',
  'au.game.season2': 'Autumn',
  'au.game.season3': 'Winter',
  'au.game.season4': 'Spring',
  'au.game.prColumn': 'Permanent residence (191)',
  'au.game.timeDate': 'Time requirement met from',
  'au.game.entry': 'Play a round · Life in Wattle Bay',
  'au.game.entryDesc':
    'Work, fish and join the town days in a pixel-art seaside town in regional Victoria, and see how everyday choices shape your 191 permanent residence timeline.',
  'au.game.title': 'Immigration Life · Wattle Bay',
  'au.game.intro':
    'Settle into Wattle Bay, a seaside town in regional Victoria. Work, lodge your tax, fish off the jetty, join the town days and make the southern seasons your own.',
  'au.game.chooseCharacter': 'Who is moving to Wattle Bay?',
  'au.game.visa': 'Visa: {count} month{count:s} left',
  'au.game.visaUrgent': 'Visa ending soon',
  'au.game.visaReminderTitle': 'A new quarter: check your visa',
  'au.game.visaReminder':
    'Your visa has {count} month{count:s} left. Lodge your next application at the government service centre before it ends.',
  'au.game.fastVisaWarning':
    'Your visa runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the government service centre first.',
  'au.game.fastVisaWarningNone':
    'No current visa is recorded. Fast-forwarding runs to the end of the quarter, so visit the government service centre first.',
  'au.game.visaVisit': 'Visit the government service centre',
  'au.game.noVisaActions': 'No visa applications are available here right now.',
  'au.game.councilDetails': 'Visit the migration agent for details',
  'au.game.collectionMemory.pond':
    'You caught it off the jetty on a {weather} day.',
  'au.game.fishJunk': 'A little surprise from the bay, brought safely ashore.',
  'au.game.openTimeline': 'Open this timeline in the Australia simulator',
  'au.game.settlementSource.brighterHome': 'A sea-view weatherboard',
  'au.game.settlementSource.walkingClub': 'Foreshore running club',
  'au.game.noSeeds': 'No seeds for this season. Try the corner milk bar.',
  'au.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from community garden harvests, and flathead from the jetty.',
  'au.game.rentFirst': 'Rent a plot at the community garden first.',
};
