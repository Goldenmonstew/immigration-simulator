// New Zealand's town game: its own stat, seasons and recipes, plus
// `nz.game.*` wording that replaces the shared game strings (see gameKey in
// app/game-shell/game-ui.tsx).
export const nzGameZh = {
  'game.tereo': '毛利语',
  'nz.game.prepare-fish-and-chips': '鱼裹薄粉，和薯条一起炸到金黄',
  'nz.game.prepare-corn-fritters': '玉米粒拌进面糊，煎成小圆饼',
  'nz.game.prepare-roast-veg': '土豆切块，撒盐和迷迭香进烤箱',
  'nz.game.prepare-vege-soup': '芜菁切丁，和洋葱一起慢慢煮',
  'nz.game.prepare-pavlova': '蛋白饼上抹奶油，铺满草莓',
  'nz.game.prepare-salad': '切块，淋一点橄榄油',
  'nz.game.prvColumn': '永久居民签证',
  'nz.game.citColumn': '入籍',
  'nz.game.presenceDate': '在境天数最早满足',
  'nz.game.entry': '玩一局 · 凯雷鲁湾生活',
  'nz.game.entryDesc':
    '在新西兰北岛的像素海湾小镇上班、钓鱼、种菜、逛节日，看看日常选择怎样影响永久居民签证与入籍的时间线。',
  'nz.game.title': '移民生活 · 凯雷鲁湾',
  'nz.game.intro':
    '在北岛的海湾小镇凯雷鲁湾安顿下来。上班、学毛利语、在码头钓鱼、逛节日，把南半球的四季过成自己的故事。',
  'nz.game.chooseCharacter': '谁将搬进凯雷鲁湾？',
  'nz.game.season1': '夏',
  'nz.game.season2': '秋',
  'nz.game.season3': '冬',
  'nz.game.season4': '春',
  'nz.game.visa': '旅行条件剩余 {count} 个月',
  'nz.game.visaUrgent': '旅行条件即将或已经到期',
  'nz.game.visaReminderTitle': '新一季，看看旅行条件',
  'nz.game.visaReminder':
    '居民签证的旅行条件还剩 {count} 个月。到期后你仍可住在新西兰，但出境会让居民签证失效；满足条件后可到移民局服务点申请永久居民签证。',
  'nz.game.fastVisaWarning':
    '旅行条件到 {date} 为止，之后出境会让居民签证失效。快进会直接过完这一季，先去移民局服务点看看吧。',
  'nz.game.fastVisaWarningNone':
    '旅行条件已经到期。你仍可住在新西兰，但现在出境会让居民签证失效。快进前可以先去移民局服务点看看。',
  'nz.game.visaVisit': '去移民局服务点',
  'nz.game.noVisaActions': '眼下这里没有可办的手续。',
  'nz.game.councilDetails': '去社区咨询处看详情',
  'nz.game.collectionMemory.pond': '那天{weather}，你在海湾码头钓到了它。',
  'nz.game.fishJunk': '海里的小意外，也一起捞上来吧。',
  'nz.game.openTimeline': '在新西兰模拟器里打开这条时间线',
  'nz.game.settlementSource.brighterHome': '朝北的木屋',
  'nz.game.settlementSource.walkingClub': '海岸步道徒步小组',
  'nz.game.noSeeds': '背包里没有当季种子，去街角小店看看吧。',
  'nz.game.rentFirst': '先在社区菜园租一块地。',
  'nz.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自社区菜园的收成，真鲷要去海湾码头钓。',
  'nz.game.travelUntil': '居民签证的旅行条件到 {date}，出境须在这天前回来。',
  'nz.game.travelEnded':
    '旅行条件已在 {date} 到期。你仍是居民，但出境会让居民签证失效。',
  'nz.game.prvFrom': '永久居民签证最早 {date} 可以申请。',
  'nz.game.prvNow': '现在可以申请永久居民签证。',
} as const;

export const nzGameEn: Record<keyof typeof nzGameZh, string> = {
  'game.tereo': 'Te reo',
  'nz.game.prepare-fish-and-chips':
    'Batter the fish thinly and fry it golden with the chips',
  'nz.game.prepare-corn-fritters':
    'Stir the corn into batter and fry small rounds',
  'nz.game.prepare-roast-veg':
    'Cut the potatoes, add salt and rosemary, and roast',
  'nz.game.prepare-vege-soup':
    'Dice the turnip and simmer it slowly with onion',
  'nz.game.prepare-pavlova':
    'Spread cream on the meringue and pile on strawberries',
  'nz.game.prepare-salad': 'Chop and drizzle with olive oil',
  'nz.game.prvColumn': 'Permanent resident visa',
  'nz.game.citColumn': 'Citizenship',
  'nz.game.presenceDate': 'Days in New Zealand met from',
  'nz.game.entry': 'Play a round · Life in Kererū Bay',
  'nz.game.entryDesc':
    'Work, fish, garden and join the festivals in a pixel-art harbour town on the North Island, and see how everyday choices shape your permanent residence and citizenship timeline.',
  'nz.game.title': 'Immigration Life · Kererū Bay',
  'nz.game.intro':
    'Settle into Kererū Bay, a harbour town on the North Island. Work, learn te reo, fish off the wharf, join the festivals and make the southern seasons your own.',
  'nz.game.chooseCharacter': 'Who is moving to Kererū Bay?',
  'nz.game.season1': 'Summer',
  'nz.game.season2': 'Autumn',
  'nz.game.season3': 'Winter',
  'nz.game.season4': 'Spring',
  'nz.game.visa': 'Travel conditions: {count} month{count:s} left',
  'nz.game.visaUrgent': 'Travel conditions ending or ended',
  'nz.game.visaReminderTitle': 'A new quarter: check your travel conditions',
  'nz.game.visaReminder':
    'Your resident visa’s travel conditions have {count} month{count:s} left. Afterwards you can still live in New Zealand, but leaving would end the visa. Once eligible, apply for a permanent resident visa at the Immigration NZ office.',
  'nz.game.fastVisaWarning':
    'Your travel conditions run until {date}; leaving after that ends the resident visa. Fast-forwarding runs to the end of the quarter, so visit the Immigration NZ office first.',
  'nz.game.fastVisaWarningNone':
    'Your travel conditions have ended. You can still live in New Zealand, but leaving now would end the resident visa. Visit the Immigration NZ office before fast-forwarding.',
  'nz.game.visaVisit': 'Visit the Immigration NZ office',
  'nz.game.noVisaActions': 'Nothing to apply for here right now.',
  'nz.game.councilDetails': 'Visit the advice centre for details',
  'nz.game.collectionMemory.pond':
    'You caught it off the harbour wharf on a {weather} day.',
  'nz.game.fishJunk': 'A little surprise from the sea, brought safely ashore.',
  'nz.game.openTimeline': 'Open this timeline in the New Zealand simulator',
  'nz.game.settlementSource.brighterHome': 'A north-facing house',
  'nz.game.settlementSource.walkingClub': 'Coastal walking group',
  'nz.game.noSeeds': 'No seeds for this season. Try the corner dairy.',
  'nz.game.rentFirst': 'Rent a plot at the community garden first.',
  'nz.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from community garden harvests, and snapper from the harbour wharf.',
  'nz.game.travelUntil':
    'Your resident visa’s travel conditions run to {date}. Trips must be back by then.',
  'nz.game.travelEnded':
    'Your travel conditions ended on {date}. You remain a resident, but leaving would end the visa.',
  'nz.game.prvFrom': 'You can apply for a permanent resident visa from {date}.',
  'nz.game.prvNow': 'You can apply for a permanent resident visa now.',
};
