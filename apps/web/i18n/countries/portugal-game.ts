// Portugal's town game: its own stat, plus `pt.game.*` wording that replaces
// the shared game strings or adds its own, recipe steps included (see gameKey
// in app/game-shell/game-ui.tsx).
export const ptGameZh = {
  'game.portuguese': '葡语',
  'pt.game.prepare-caldo-verde': '土豆煮烂压碎，放进切成细丝的菜叶',
  'pt.game.prepare-batatas-murro': '烤熟后一拳压扁，淋上橄榄油',
  'pt.game.prepare-broa': '揉好玉米面团，烤出硬壳',
  'pt.game.prepare-peixe-grelhado': '撒粗盐，在炭火上把鱼烤到皮脆',
  'pt.game.prepare-doce-morango': '加糖，小火慢慢熬',
  'pt.game.prepare-salada': '切块，拌上橄榄油和牛至',
  'pt.game.prColumn': '永久居留',
  'pt.game.natColumn': '国籍',
  'pt.game.timeDate': '时间条件最早满足',
  'pt.game.timeFuture': '时间条件最早 {date} 满足',
  'pt.game.entry': '玩一局 · 燕子街区生活',
  'pt.game.entryDesc':
    '在里斯本山坡上的像素街区上班、钓鱼、逛街坊晚会，看看日常选择怎样影响永久居留与国籍的时间线。',
  'pt.game.title': '移民生活 · 燕子街区',
  'pt.game.intro':
    '在里斯本河边山坡上的燕子街区安顿下来。上班、学葡语、逛节日，把四季过成自己的故事。',
  'pt.game.chooseCharacter': '谁将搬进燕子街区？',
  'pt.game.visa': '居留卡剩余 {count} 个月',
  'pt.game.visaUrgent': '居留卡即将到期',
  'pt.game.visaReminderTitle': '新一季，看看居留卡',
  'pt.game.visaReminder':
    '居留卡还剩 {count} 个月。游戏不办理续期，到期前可去 AIMA 递交永久居留，或到民事登记处递交国籍声明。',
  'pt.game.fastVisaWarning':
    '居留卡到 {date} 为止。快进会直接过完这一季、跨过这一天，先去 AIMA 窗口看看吧。',
  'pt.game.fastVisaWarningNone':
    '当前没有有效的居留卡记录。快进会直接过完这一季，先去 AIMA 窗口看看吧。',
  'pt.game.visaVisit': '去 AIMA 窗口',
  'pt.game.noVisaActions': '眼下这里没有可办的居留手续。',
  'pt.game.councilDetails': '去移民支援中心看详情',
  'pt.game.collectionMemory.pond': '那天{weather}，你在特茹河岸钓到了它。',
  'pt.game.fishJunk': '河里的小意外，也一起带上岸吧。',
  'pt.game.openTimeline': '在葡萄牙模拟器里打开这条时间线',
  'pt.game.settlementSource.brighterHome': '带阳台的老公寓',
  'pt.game.settlementSource.walkingClub': '河边慢跑团',
  'pt.game.noSeeds': '背包里没有当季种子，去街角杂货铺看看吧。',
  'pt.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自社区菜园的收成，狼鲈要去特茹河岸钓。',
  'pt.game.rentFirst': '先在社区菜园认领一块地。',
} as const;

export const ptGameEn: Record<keyof typeof ptGameZh, string> = {
  'game.portuguese': 'Portuguese',
  'pt.game.prepare-caldo-verde':
    'Mash the potato and stir in the shredded greens',
  'pt.game.prepare-batatas-murro':
    'Roast, punch flat and drizzle with olive oil',
  'pt.game.prepare-broa': 'Knead the maize dough and bake a hard crust',
  'pt.game.prepare-peixe-grelhado':
    'Rub with coarse salt and grill the skin crisp over charcoal',
  'pt.game.prepare-doce-morango': 'Add sugar and simmer slowly',
  'pt.game.prepare-salada': 'Chop and dress with olive oil and oregano',
  'pt.game.prColumn': 'Permanent residence',
  'pt.game.natColumn': 'Nationality',
  'pt.game.timeDate': 'Time requirement met from',
  'pt.game.timeFuture': 'Time requirement met from {date}',
  'pt.game.entry': 'Play a round · Life in Andorinhas',
  'pt.game.entryDesc':
    'Work, fish and join the street festivals in a pixel-art bairro on a Lisbon hill, and see how everyday choices shape your permanent residence and nationality timeline.',
  'pt.game.title': 'Immigration Life · Andorinhas',
  'pt.game.intro':
    'Settle into Andorinhas, a bairro on a Lisbon hill above the river. Work, learn Portuguese, join the festivals and make the seasons your own.',
  'pt.game.chooseCharacter': 'Who is moving to Andorinhas?',
  'pt.game.visa': 'Residence card: {count} month{count:s} left',
  'pt.game.visaUrgent': 'Residence card ending soon',
  'pt.game.visaReminderTitle': 'A new quarter: check your residence card',
  'pt.game.visaReminder':
    'Your residence card has {count} month{count:s} left. The game does not renew it: before it ends, apply for permanent residence at AIMA or make a nationality declaration at the civil registry.',
  'pt.game.fastVisaWarning':
    'Your residence card runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the AIMA office first.',
  'pt.game.fastVisaWarningNone':
    'No current residence card is recorded. Fast-forwarding runs to the end of the quarter, so visit the AIMA office first.',
  'pt.game.visaVisit': 'Visit the AIMA office',
  'pt.game.noVisaActions':
    'No residence procedures are available here right now.',
  'pt.game.councilDetails': 'Visit the support centre for details',
  'pt.game.collectionMemory.pond':
    'You caught it on the Tagus riverside on a {weather} day.',
  'pt.game.fishJunk': 'A little river surprise, brought safely ashore.',
  'pt.game.openTimeline': 'Open this timeline in the Portugal simulator',
  'pt.game.settlementSource.brighterHome': 'An old flat with a balcony',
  'pt.game.settlementSource.walkingClub': 'Riverside running club',
  'pt.game.noSeeds': 'No seeds for this season. Try the corner mercearia.',
  'pt.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from community garden harvests, and sea bass from the Tagus riverside.',
  'pt.game.rentFirst': 'Rent a plot at the community garden first.',
};
