// Spain's town game: its own stat and recipes, plus `es.game.*` wording that
// replaces the shared game strings (see gameKey in app/game-shell/game-ui.tsx).
export const esGameZh = {
  'game.spanish': '西语',
  'es.game.prepare-all-i-pebre': '鳗鱼和土豆加蒜、辣椒粉慢炖',
  'es.game.prepare-tortilla-de-patatas': '土豆煎软，倒进蛋液翻个面',
  'es.game.prepare-gazpacho': '番茄黄瓜打碎，淋橄榄油冰镇',
  'es.game.prepare-arros-a-banda': '用鱼汤煮米，锅底留一层焦',
  'es.game.prepare-maduixes-amb-nata': '草莓对半切，挤一圈奶油',
  'es.game.ltColumn': '长期居留',
  'es.game.natColumn': '入籍',
  'es.game.timeDate': '居住年限最早满足',
  'es.game.timeFuture': '时间条件最早 {date} 满足',
  'es.game.feeOnFiling':
    '790-026 入籍申请费在递交当天一并缴纳，所以递交前评估里「已缴付 790-026」一项显示未满足。',
  'es.game.entry': '玩一局 · 维拉马尔生活',
  'es.game.entryDesc':
    '在瓦伦西亚海边的像素街区上班、钓鱼、过法雅节，看看日常选择怎样影响长期居留与入籍的时间线。',
  'es.game.title': '移民生活 · 维拉马尔',
  'es.game.intro':
    '在瓦伦西亚海边的维拉马尔街区安顿下来。上班、学西语、过节、去海边，把四季过成自己的故事。',
  'es.game.chooseCharacter': '谁将搬进维拉马尔？',
  'es.game.visa': '居留卡剩余 {count} 个月',
  'es.game.visaUrgent': '居留卡即将到期',
  'es.game.visaReminderTitle': '新一季，看看居留卡',
  'es.game.visaReminder':
    '居留卡还剩 {count} 个月。游戏不办理临时居留续期：有效期内可以递交长期居留或入籍；过期后入籍已不能递交，长期居留只能在到期后的递交期内递交，截止日见外国人办公室。',
  'es.game.fastVisaWarning':
    '{date} 前要把申请递出去：居留卡有效期内可以递交入籍或长期居留；过期后入籍已不能递交，只能在到期后的递交期内递交长期居留。快进会直接过完这一季、跨过这一天，先去外国人办公室看看吧。',
  'es.game.fastVisaWarningNone':
    '居留卡已经过期。快进会直接过完这一季，先去外国人办公室看看吧。',
  'es.game.visaVisit': '去外国人办公室',
  'es.game.noVisaActions': '眼下这里没有可办的居留手续。',
  'es.game.renewedThisSeason': '本季已办好居留手续。',
  'es.game.renewedThrough': '本季已办好，居留卡有效期至 {date}。',
  'es.game.councilDetails': '去代办所看详情',
  'es.game.collectionMemory.pond': '那天{weather}，你在防波堤钓到了它。',
  'es.game.fishJunk': '海里的小意外，也一起带上岸吧。',
  'es.game.openTimeline': '在西班牙模拟器里打开这条时间线',
  'es.game.settlementSource.brighterHome': '带阳台的公寓',
  'es.game.settlementSource.walkingClub': '海滨晨跑小组',
  'es.game.noSeeds': '背包里没有当季种子，去维拉马尔市场看看吧。',
  'es.game.rentFirst': '先在街区菜园租一块地。',
  'es.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自街区菜园的收成，鱼要去防波堤钓，大米在市场买。',
} as const;

export const esGameEn: Record<keyof typeof esGameZh, string> = {
  'game.spanish': 'Spanish',
  'es.game.prepare-all-i-pebre':
    'Simmer eel and potato with garlic and paprika',
  'es.game.prepare-tortilla-de-patatas':
    'Soften the potatoes, pour in the egg and flip',
  'es.game.prepare-gazpacho':
    'Blend tomato and cucumber, add olive oil and chill',
  'es.game.prepare-arros-a-banda':
    'Cook the rice in fish stock and leave a crust',
  'es.game.prepare-maduixes-amb-nata': 'Halve the strawberries and add cream',
  'es.game.ltColumn': 'Long-term residence',
  'es.game.natColumn': 'Nationality',
  'es.game.timeDate': 'Residence period met from',
  'es.game.timeFuture': 'Time requirement met from {date}',
  'es.game.feeOnFiling':
    'The 790-026 nationality fee is paid on the day you apply, so until then the assessment shows it as not yet paid.',
  'es.game.entry': 'Play a round · Life in Vilamar',
  'es.game.entryDesc':
    'Work, fish and celebrate the Fallas in a pixel-art seaside corner of València, and see how everyday choices shape your long-term residence and nationality timeline.',
  'es.game.title': 'Immigration Life · Vilamar',
  'es.game.intro':
    'Settle into Vilamar, a seaside corner of València. Work, learn Spanish, join the fiestas, head for the beach and make the seasons your own.',
  'es.game.chooseCharacter': 'Who is moving to Vilamar?',
  'es.game.visa': 'Residence card: {count} month{count:s} left',
  'es.game.visaUrgent': 'Residence card ending soon',
  'es.game.visaReminderTitle': 'A new quarter: check your residence card',
  'es.game.visaReminder':
    'Your residence card has {count} month{count:s} left. The game does not renew temporary permits: while the card is valid you can apply for long-term residence or nationality; once it has expired, nationality can no longer be filed and long-term residence only within the late filing period (see the immigration office for the deadline).',
  'es.game.fastVisaWarning':
    'Apply by {date}: while your residence card is valid you can apply for nationality or long-term residence; once it has expired, nationality can no longer be filed and only long-term residence, within the late filing period. Fast-forwarding runs past that date to the end of the quarter, so visit the immigration office first.',
  'es.game.fastVisaWarningNone':
    'Your residence card has expired. Fast-forwarding runs to the end of the quarter, so visit the immigration office first.',
  'es.game.visaVisit': 'Visit the immigration office',
  'es.game.noVisaActions':
    'No residence procedures are available here right now.',
  'es.game.renewedThisSeason': 'Your residence paperwork is done this season.',
  'es.game.renewedThrough':
    'Done this season; your residence card now runs to {date}.',
  'es.game.councilDetails': 'Visit the gestor for details',
  'es.game.collectionMemory.pond':
    'You caught it off the breakwater on a {weather} day.',
  'es.game.fishJunk': 'A little sea surprise, brought safely ashore.',
  'es.game.openTimeline': 'Open this timeline in the Spain simulator',
  'es.game.settlementSource.brighterHome': 'A flat with a balcony',
  'es.game.settlementSource.walkingClub': 'Seafront running club',
  'es.game.noSeeds': 'No seeds for this season. Try the Vilamar market.',
  'es.game.rentFirst': 'Rent a plot at the neighbourhood allotments first.',
  'es.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from the neighbourhood allotments, fish from the breakwater and rice from the market.',
};
