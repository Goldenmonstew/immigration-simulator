// Greece's town game: its own stat and recipes, plus `gr.game.*` wording that
// replaces the shared game strings (see gameKey in app/game-shell/game-ui.tsx).
export const grGameZh = {
  'game.greek': '希腊语',
  'game.prepare-horiatiki': '切番茄黄瓜，放一大块菲达奶酪',
  'game.prepare-gemista': '番茄挖空塞进米饭，进烤箱',
  'game.prepare-lemon-potatoes': '淋上柠檬汁和橄榄油，烤到金黄',
  'game.prepare-grilled-sardines': '撒盐，在炭火上烤到皮脆',
  'game.prepare-kakavia': '鱼和土豆一锅炖，挤半个柠檬',
  'game.prepare-spoon-sweet': '加糖慢慢熬，装进小玻璃罐',
  'game.prepare-grilled-corn': '在炭火上翻烤，撒一点盐',
  'gr.game.prColumn': '长期居留',
  'gr.game.natColumn': '入籍',
  'gr.game.cardValidTo': '居留卡有效至',
  'gr.game.entry': '玩一局 · 利马纳基生活',
  'gr.game.entryDesc':
    '在雅典海边的像素小镇上班、钓鱼、逛周六菜市和节日，看看日常选择怎样影响长期居留与入籍的时间线。',
  'gr.game.title': '移民生活 · 利马纳基',
  'gr.game.intro':
    '在阿提卡海边的利马纳基安顿下来。上班、学希腊语、逛菜市和教堂广场的节日，把四季过成自己的故事。',
  'gr.game.chooseCharacter': '谁将搬进利马纳基？',
  'gr.game.visa': '居留卡剩余 {count} 个月',
  'gr.game.visaUrgent': '居留卡即将到期',
  'gr.game.visaReminderTitle': '新一季，看看居留卡',
  'gr.game.visaReminder':
    '居留卡还剩 {count} 个月。到期前可到移民局办事处续期，条件满足时也可以申请转为长期居留。',
  'gr.game.fastVisaWarning':
    '居留卡到 {date} 为止。快进会直接过完这一季、跨过这一天，先去移民局办事处看看吧。',
  'gr.game.fastVisaWarningNone':
    '当前没有有效的居留卡记录。快进会直接过完这一季，先去移民局办事处看看吧。',
  'gr.game.visaVisit': '去移民局办事处',
  'gr.game.noVisaActions': '眼下这里没有可办的居留手续。',
  'gr.game.renewedThisSeason': '本季已续期居留卡。',
  'gr.game.renewedThrough': '本季已续期，新的居留卡有效至 {date}。',
  'gr.game.councilDetails': '去会计师事务所看详情',
  'gr.game.collectionMemory.pond': '那天{weather}，你在港口防波堤钓到了它。',
  'gr.game.fishJunk': '海里的小意外，也一起带上岸吧。',
  'gr.game.openTimeline': '在希腊模拟器里打开这条时间线',
  'gr.game.settlementSource.brighterHome': '海景公寓',
  'gr.game.settlementSource.walkingClub': '海滨健走会',
  'gr.game.noSeeds': '背包里没有当季种子，去阿尔迪特超市看看吧。',
  'gr.game.rentFirst': '先在市立菜园租一块地。',
} as const;

export const grGameEn: Record<keyof typeof grGameZh, string> = {
  'game.greek': 'Greek',
  'game.prepare-horiatiki': 'Chop tomato and cucumber, top with a slab of feta',
  'game.prepare-gemista': 'Hollow the tomatoes, fill with rice and bake',
  'game.prepare-lemon-potatoes':
    'Douse in lemon and olive oil, roast until golden',
  'game.prepare-grilled-sardines': 'Salt and grill over charcoal until crisp',
  'game.prepare-kakavia':
    'Stew the fish with potatoes, squeeze in half a lemon',
  'game.prepare-spoon-sweet': 'Simmer slowly with sugar and pour into a jar',
  'game.prepare-grilled-corn': 'Turn over charcoal and sprinkle with salt',
  'gr.game.prColumn': 'Long-term residence',
  'gr.game.natColumn': 'Naturalisation',
  'gr.game.cardValidTo': 'Residence card valid to',
  'gr.game.entry': 'Play a round · Life in Limanaki',
  'gr.game.entryDesc':
    'Work, fish and join the Saturday market and feasts in a pixel-art harbour by Athens, and see how everyday choices shape your long-term residence and naturalisation timeline.',
  'gr.game.title': 'Immigration Life · Limanaki',
  'gr.game.intro':
    'Settle into Limanaki on the Attic coast. Work, learn Greek, shop at the street market, join the feasts on the church square and make the seasons your own.',
  'gr.game.chooseCharacter': 'Who is moving to Limanaki?',
  'gr.game.visa': 'Residence card: {count} month{count:s} left',
  'gr.game.visaUrgent': 'Residence card ending soon',
  'gr.game.visaReminderTitle': 'A new quarter: check your residence card',
  'gr.game.visaReminder':
    'Your residence card has {count} month{count:s} left. Renew it at the migration office before it ends, or apply for long-term residence once you qualify.',
  'gr.game.fastVisaWarning':
    'Your residence card runs until {date}. Fast-forwarding runs past that date to the end of the quarter, so visit the migration office first.',
  'gr.game.fastVisaWarningNone':
    'No current residence card is recorded. Fast-forwarding runs to the end of the quarter, so visit the migration office first.',
  'gr.game.visaVisit': 'Visit the migration office',
  'gr.game.noVisaActions':
    'No residence procedures are available here right now.',
  'gr.game.renewedThisSeason': 'You renewed your residence card this season.',
  'gr.game.renewedThrough':
    'You renewed this season; your new card is valid to {date}.',
  'gr.game.councilDetails': 'Visit the accountant for details',
  'gr.game.collectionMemory.pond':
    'You caught it off the harbour breakwater on a {weather} day.',
  'gr.game.fishJunk': 'A little sea surprise, brought safely ashore.',
  'gr.game.openTimeline': 'Open this timeline in the Greece simulator',
  'gr.game.settlementSource.brighterHome': 'A sea-view flat',
  'gr.game.settlementSource.walkingClub': 'Seafront walking club',
  'gr.game.noSeeds': 'No seeds for this season. Try Ardit’s mini market.',
  'gr.game.rentFirst': 'Rent a municipal garden plot first.',
};
