// Canada's town game: its civics stat, plus `ca.game.*` wording (recipes too)
// that replaces the shared game strings (see gameKey in app/game-shell/game-ui.tsx).
export const caGameZh = {
  'game.civics': '公民知识',
  'ca.game.prepare-poutine': '炸好薯条，撒奶酪粒，浇上热肉汁',
  'ca.game.prepare-fish-cakes': '把鱼和土豆捏成饼，煎到两面金黄',
  'ca.game.prepare-chowder': '小火慢炖，加一勺奶油',
  'ca.game.prepare-corn-boil': '水开了下玉米，抹上黄油',
  'ca.game.prepare-strawberry-jam': '加糖慢熬，装进梅森罐',
  'ca.game.prepare-garden-salad': '切块，淋上枫糖油醋汁',
  'ca.game.prepare-turnip-mash': '煮软压成泥，拌进黄油',
  'ca.game.prColumn': '永久居民',
  'ca.game.citColumn': '入籍',
  'ca.game.entry': '玩一局 · 枫港生活',
  'ca.game.entryDesc':
    '在哈利法克斯港边的像素小镇上班、钓鲭鱼、溜冰、赶百家宴，看看日常选择怎样影响永久居民和入籍的时间线。',
  'ca.game.title': '移民生活 · 枫港',
  'ca.game.intro':
    '在哈利法克斯港边的枫港安顿下来。上班、学英语、赶节日，把四季过成自己的故事。',
  'ca.game.chooseCharacter': '谁将搬进枫港？',
  'ca.game.visa': '身份证件剩余 {count} 个月',
  'ca.game.visaUrgent': '身份证件即将到期',
  'ca.game.visaReminderTitle': '新一季，看看证件日期',
  'ca.game.visaReminder':
    '你的工作许可或 PR 卡还剩 {count} 个月。工作许可到期前要把申请递出去，去 IRCC 办公室看看能办什么。',
  'ca.game.fastVisaWarning':
    '证件有效期到 {date} 为止。快进会直接过完这一季、跨过这一天，先去 IRCC 办公室看看吧。',
  'ca.game.fastVisaWarningNone':
    '当前没有有效的证件记录。快进会直接过完这一季，先去 IRCC 办公室看看吧。',
  'ca.game.visaVisit': '去 IRCC 办公室',
  'ca.game.noVisaActions': '眼下这里没有可办的手续。',
  'ca.game.councilDetails': '去移民顾问事务所看详情',
  'ca.game.collectionMemory.pond': '那天{weather}，你在钓鱼码头钓到了它。',
  'ca.game.fishJunk': '港口的小意外，也一起带上岸吧。',
  'ca.game.openTimeline': '在加拿大模拟器里打开这条时间线',
  'ca.game.settlementSource.brighterHome': '港景公寓',
  'ca.game.settlementSource.walkingClub': '海滨健走会',
  'ca.game.noSeeds':
    '背包里没有当季种子，去海港杂货铺看看吧。冬天菜园盖着雪，春天再来。',
  'ca.game.rentFirst': '先在社区菜园租一块地。',
  'ca.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自社区菜园的收成，青鳕和比目鱼要去钓鱼码头钓。',
  'ca.game.oathLabel': '参加入籍宣誓仪式，成为加拿大公民',
  'ca.game.oathConfirm':
    '宣誓之后你就是加拿大公民了，这一局也到此结束。准备好了吗？',
} as const;

export const caGameEn: Record<keyof typeof caGameZh, string> = {
  'game.civics': 'Civics',
  'ca.game.prepare-poutine': 'Fry the chips, add curds and hot gravy',
  'ca.game.prepare-fish-cakes':
    'Shape fish and potato into cakes and fry golden',
  'ca.game.prepare-chowder': 'Simmer gently and stir in cream',
  'ca.game.prepare-corn-boil': 'Drop the corn in the boiling pot and butter it',
  'ca.game.prepare-strawberry-jam':
    'Simmer with sugar and pour into Mason jars',
  'ca.game.prepare-garden-salad': 'Chop and dress with maple vinaigrette',
  'ca.game.prepare-turnip-mash': 'Boil soft, mash and fold in butter',
  'ca.game.prColumn': 'Permanent residence',
  'ca.game.citColumn': 'Citizenship',
  'ca.game.entry': 'Play a round · Life in Maple Harbour',
  'ca.game.entryDesc':
    'Work, fish for mackerel, skate and join the potluck in a pixel-art corner of Halifax harbour, and see how everyday choices shape your PR and citizenship timeline.',
  'ca.game.title': 'Immigration Life · Maple Harbour',
  'ca.game.intro':
    'Settle into Maple Harbour on Halifax harbour. Work, learn English, join the festivals and make the seasons your own.',
  'ca.game.chooseCharacter': 'Who is moving to Maple Harbour?',
  'ca.game.visa': 'Status document: {count} month{count:s} left',
  'ca.game.visaUrgent': 'Status document ending soon',
  'ca.game.visaReminderTitle': 'A new quarter: check your status document',
  'ca.game.visaReminder':
    'Your work permit or PR card has {count} month{count:s} left. File before a work permit ends; visit the IRCC office to see what you can do.',
  'ca.game.fastVisaWarning':
    'Your status document runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the IRCC office first.',
  'ca.game.fastVisaWarningNone':
    'No current status document is recorded. Fast-forwarding runs to the end of the quarter, so visit the IRCC office first.',
  'ca.game.visaVisit': 'Visit the IRCC office',
  'ca.game.noVisaActions': 'Nothing to file here right now.',
  'ca.game.councilDetails': 'Visit the consultant for details',
  'ca.game.collectionMemory.pond':
    'You caught it off the fishing wharf on a {weather} day.',
  'ca.game.fishJunk': 'A little harbour surprise, brought safely ashore.',
  'ca.game.openTimeline': 'Open this timeline in the Canada simulator',
  'ca.game.settlementSource.brighterHome': 'A harbour-view flat',
  'ca.game.settlementSource.walkingClub': 'Boardwalk walking club',
  'ca.game.noSeeds':
    'No seeds for this season. Try the harbour general store; the garden sleeps under snow in winter.',
  'ca.game.rentFirst': 'Rent a plot at the community garden first.',
  'ca.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from community garden harvests, and pollock and flounder from the fishing wharf.',
  'ca.game.oathLabel': 'Take the oath and become a Canadian citizen',
  'ca.game.oathConfirm':
    'After the oath you are a Canadian citizen, and this game ends. Ready?',
};
