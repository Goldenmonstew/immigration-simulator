// Japan's town game: its own stat, plus `jp.game.*` wording that replaces the
// shared game strings or adds its own, recipe steps included (see gameKey in
// app/game-shell/game-ui.tsx).
export const jpGameZh = {
  'game.japanese': '日语',
  'jp.game.prepare-miso-soup': '把芜菁放进味噌汤里煮软',
  'jp.game.prepare-jaga-butter': '蒸好土豆，放一块黄油',
  'jp.game.prepare-yaki-corn': '刷上酱油，烤出焦香',
  'jp.game.prepare-shioyaki': '撒盐，把鱼烤到皮脆',
  'jp.game.prepare-ichigo-jam': '加糖，慢慢熬',
  'jp.game.prepare-salad': '切块，拌上芝麻酱',
  'jp.game.prColumn': '永住許可',
  'jp.game.natColumn': '帰化',
  'jp.game.timeDate': '时间条件最早满足',
  'jp.game.timeFuture': '时间条件最早 {date} 满足',
  'jp.game.entry': '玩一局 · 港坂生活',
  'jp.game.entryDesc':
    '在横滨的像素小镇上班、钓鱼、逛祭典，看看日常选择怎样影响永住与帰化的时间线。',
  'jp.game.title': '移民生活 · 港坂',
  'jp.game.intro':
    '在横滨一角的港坂町安顿下来。上班、学日语、逛祭典，把四季过成自己的故事。',
  'jp.game.chooseCharacter': '谁将搬进港坂？',
  'jp.game.visa': '在留期限剩余 {count} 个月',
  'jp.game.visaUrgent': '在留期限即将到期',
  'jp.game.visaReminderTitle': '新一季，看看在留期限',
  'jp.game.visaReminder':
    '当前在留期限还剩 {count} 个月。到期前可到入管窗口办理在留期间更新。',
  'jp.game.fastVisaWarning':
    '在留期限到 {date} 为止。快进会直接过完这一季、跨过这一天，先去入管窗口看看吧。',
  'jp.game.fastVisaWarningNone':
    '当前没有有效的在留期限记录。快进会直接过完这一季，先去入管窗口看看吧。',
  'jp.game.visaVisit': '去入管窗口',
  'jp.game.noVisaActions': '眼下这里没有可办的在留手续。',
  'jp.game.renewedThisSeason': '本季已办好在留期间更新。',
  'jp.game.renewedThrough': '本季已更新，新的在留期限至 {date}。',
  'jp.game.councilDetails': '去行政书士事务所看详情',
  'jp.game.collectionMemory.pond': '那天{weather}，你在大冈川河岸钓到了它。',
  'jp.game.fishJunk': '河里的小意外，也一起带上岸吧。',
  'jp.game.openTimeline': '在日本模拟器里打开这条时间线',
  'jp.game.settlementSource.brighterHome': '朝南的公寓',
  'jp.game.settlementSource.walkingClub': '河边健走会',
  'jp.game.noSeeds': '背包里没有当季种子，去商店街杂货铺看看吧。',
  'jp.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自市民农园的收成，鲈鱼要去大冈川钓。',
  'jp.game.rentFirst': '先在市民农园租一块地。',
} as const;

export const jpGameEn: Record<keyof typeof jpGameZh, string> = {
  'game.japanese': 'Japanese',
  'jp.game.prepare-miso-soup': 'Simmer the turnip in miso',
  'jp.game.prepare-jaga-butter': 'Steam the potato and add butter',
  'jp.game.prepare-yaki-corn': 'Brush with soy and grill',
  'jp.game.prepare-shioyaki': 'Salt the fish and grill it crisp',
  'jp.game.prepare-ichigo-jam': 'Add sugar and simmer slowly',
  'jp.game.prepare-salad': 'Chop and toss with sesame dressing',
  'jp.game.prColumn': 'Permanent residence',
  'jp.game.natColumn': 'Naturalisation',
  'jp.game.timeDate': 'Time requirement met from',
  'jp.game.timeFuture': 'Time requirement met from {date}',
  'jp.game.entry': 'Play a round · Life in Minatozaka',
  'jp.game.entryDesc':
    'Work, fish and join the festivals in a pixel-art corner of Yokohama, and see how everyday choices shape your permanent residence and naturalisation timeline.',
  'jp.game.title': 'Immigration Life · Minatozaka',
  'jp.game.intro':
    'Settle into Minatozaka, a corner of Yokohama. Work, learn Japanese, join the festivals and make the seasons your own.',
  'jp.game.chooseCharacter': 'Who is moving to Minatozaka?',
  'jp.game.visa': 'Period of stay: {count} month{count:s} left',
  'jp.game.visaUrgent': 'Period of stay ending soon',
  'jp.game.visaReminderTitle': 'A new quarter: check your period of stay',
  'jp.game.visaReminder':
    'Your period of stay has {count} month{count:s} left. Renew at the immigration office before it ends.',
  'jp.game.fastVisaWarning':
    'Your period of stay runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the immigration office first.',
  'jp.game.fastVisaWarningNone':
    'No current period of stay is recorded. Fast-forwarding runs to the end of the quarter, so visit the immigration office first.',
  'jp.game.visaVisit': 'Visit the immigration office',
  'jp.game.noVisaActions':
    'No residence procedures are available here right now.',
  'jp.game.renewedThisSeason': 'You renewed your period of stay this season.',
  'jp.game.renewedThrough':
    'You renewed this season; your period of stay now runs to {date}.',
  'jp.game.councilDetails': 'Visit the scrivener for details',
  'jp.game.collectionMemory.pond':
    'You caught it on the Ōoka riverbank on a {weather} day.',
  'jp.game.fishJunk': 'A little river surprise, brought safely ashore.',
  'jp.game.openTimeline': 'Open this timeline in the Japan simulator',
  'jp.game.settlementSource.brighterHome': 'A south-facing flat',
  'jp.game.settlementSource.walkingClub': 'Riverside walking club',
  'jp.game.noSeeds': 'No seeds for this season. Try the shopping-street store.',
  'jp.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from community garden harvests, and sea bass from the Ōoka River.',
  'jp.game.rentFirst': 'Rent a plot at the community garden first.',
};
