// Germany's town game: its own stat, plus `de.game.*` wording that replaces
// the shared game strings or adds its own, recipe steps included (see gameKey
// in app/game-shell/game-ui.tsx).
export const deGameZh = {
  'game.german': '德语',
  'de.game.prepare-kartoffelsalat': '土豆煮好切片，拌上黄瓜和醋汁',
  'de.game.prepare-bratkartoffeln': '土豆切片，下锅煎到两面金黄',
  'de.game.prepare-eintopf': '芜菁甘蓝切块，小火炖软',
  'de.game.prepare-barsch-kartoffeln': '河鲈两面煎香，配上煮土豆',
  'de.game.prepare-erdbeermarmelade': '加糖，慢慢熬',
  'de.game.prepare-tomatensuppe': '番茄煮烂，打成浓汤',
  'de.game.settleColumn': '定居许可',
  'de.game.natColumn': '入籍',
  'de.game.timeDate': '时间条件推算日期',
  'de.game.timeFuture': '时间条件最早 {date} 满足',
  'de.game.entry': '玩一局 · 林登岸生活',
  'de.game.entryDesc':
    '在柏林运河边的像素街区上班、钓鱼、逛节日集市，看看日常选择怎样影响定居许可与入籍的时间线。',
  'de.game.title': '移民生活 · 林登岸',
  'de.game.intro':
    '在柏林运河边的林登岸街区安顿下来。上班、学德语、逛集市，把四季过成自己的故事。',
  'de.game.chooseCharacter': '谁将搬进林登岸？',
  'de.game.visa': '居留许可剩余 {count} 个月',
  'de.game.visaUrgent': '居留许可即将到期',
  'de.game.visaReminderTitle': '新一季，看看居留许可',
  'de.game.visaReminder':
    '居留许可还剩 {count} 个月。到期前去外管局看看：蓝卡可以申请延期，条件满足时可以递交定居申请，也可以到入籍科递交入籍申请。',
  'de.game.renewedThisSeason': '本季已办好蓝卡延期。',
  'de.game.renewedThrough': '本季已办好蓝卡延期，新卡有效至 {date}。',
  'de.game.fastVisaWarning':
    '居留许可到 {date} 为止。快进会直接过完这一季、跨过这一天，先去外管局看看吧。',
  'de.game.fastVisaWarningNone':
    '当前没有有效的居留许可记录。快进会直接过完这一季，先去外管局看看吧。',
  'de.game.visaVisit': '去外管局',
  'de.game.noVisaActions': '眼下这里没有可办的居留手续。',
  'de.game.councilDetails': '去移民咨询处看详情',
  'de.game.collectionMemory.pond': '那天{weather}，你在林登运河岸边钓到了它。',
  'de.game.fishJunk': '运河里的小意外，也一起带上岸吧。',
  'de.game.openTimeline': '在德国模拟器里打开这条时间线',
  'de.game.settlementSource.walkingClub': '运河跑步团',
  'de.game.noSeeds': '背包里没有当季种子，去街角小店看看吧。',
  'de.game.kitchenNoIngredients':
    '现在凑不齐任何一道菜的食材：蔬菜来自小菜园协会的收成，河鲈要去林登运河钓。',
  'de.game.rentFirst': '先在小菜园协会租一块地。',
} as const;

export const deGameEn: Record<keyof typeof deGameZh, string> = {
  'game.german': 'German',
  'de.game.prepare-kartoffelsalat':
    'Boil and slice the potatoes, toss with cucumber and vinegar',
  'de.game.prepare-bratkartoffeln': 'Slice the potatoes and fry them golden',
  'de.game.prepare-eintopf': 'Cube the swede and simmer it soft',
  'de.game.prepare-barsch-kartoffeln':
    'Pan-fry the perch and serve with boiled potatoes',
  'de.game.prepare-erdbeermarmelade': 'Add sugar and simmer slowly',
  'de.game.prepare-tomatensuppe': 'Cook the tomatoes down and blend',
  'de.game.settleColumn': 'Settlement permit',
  'de.game.natColumn': 'Naturalisation',
  'de.game.timeDate': 'Projected date for the time conditions',
  'de.game.timeFuture': 'Time requirement met from {date}',
  'de.game.entry': 'Play a round · Life in Lindenufer',
  'de.game.entryDesc':
    'Work, fish and visit the festival markets in a pixel-art canal-side Kiez in Berlin, and see how everyday choices shape your settlement and naturalisation timeline.',
  'de.game.title': 'Immigration Life · Lindenufer',
  'de.game.intro':
    'Settle into Lindenufer, a canal-side Kiez in Berlin. Work, learn German, browse the markets and make the seasons your own.',
  'de.game.chooseCharacter': 'Who is moving to Lindenufer?',
  'de.game.visa': 'Residence permit: {count} month{count:s} left',
  'de.game.visaUrgent': 'Residence permit ending soon',
  'de.game.visaReminderTitle': 'A new quarter: check your residence permit',
  'de.game.visaReminder':
    'Your residence permit has {count} month{count:s} left. Before it ends, visit the Ausländerbehörde: a Blue Card can be extended there, and you can apply for settlement once you qualify, or for naturalisation at the naturalisation office.',
  'de.game.renewedThisSeason': 'You extended your Blue Card this season.',
  'de.game.renewedThrough':
    'You extended your Blue Card this season; the new card runs to {date}.',
  'de.game.fastVisaWarning':
    'Your residence permit runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the Ausländerbehörde first.',
  'de.game.fastVisaWarningNone':
    'No current residence permit is recorded. Fast-forwarding runs to the end of the quarter, so visit the Ausländerbehörde first.',
  'de.game.visaVisit': 'Visit the Ausländerbehörde',
  'de.game.noVisaActions':
    'No residence procedures are available here right now.',
  'de.game.councilDetails': 'Visit the migration advice centre for details',
  'de.game.collectionMemory.pond':
    'You caught it on the Lindenkanal bank on a {weather} day.',
  'de.game.fishJunk': 'A little canal surprise, brought safely ashore.',
  'de.game.openTimeline': 'Open this timeline in the Germany simulator',
  'de.game.settlementSource.walkingClub': 'Canal running club',
  'de.game.noSeeds': 'No seeds for this season. Try the Späti corner shop.',
  'de.game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from allotment harvests, and perch from the Lindenkanal.',
  'de.game.rentFirst': 'Rent a bed at the allotment colony first.',
};
