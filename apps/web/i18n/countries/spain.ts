export const zhCN = {
  'es.name': '西班牙',
  'es.entryLink': '打开西班牙试点',
  'es.entryDesc':
    '按居留许可与出入境记录，计算国内长期居留与按居住入籍的时间节点。',
  'es.title': '西班牙：长期居留与入籍的时间（试点）',
  'es.intro':
    '按你在西班牙的居留许可和出入境记录，计算两个只看时间的节点：国内长期居留（residencia de larga duración nacional）与按居住入籍（nacionalidad por residencia）。工作、投资等入境许可与 arraigo 的资格不在范围内。',
  'es.scope':
    '试点只检查条例与民法典写明的时间条件；语言与宪法考试、品行、放弃原国籍等不检查，结果里逐项列出。原文没说清的计法会标出。所填内容只在你的浏览器里计算，不保存、不上传。',
  'es.basics': '基本信息',
  'es.simulationDate': '模拟日期',
  'es.simulationDateHint': '按这一天判断（按递交日），默认今天。',
  'es.permits': '居留许可',
  'es.permitsHint':
    '每张许可填一行，按时续期的接着填下一张；仍有效的结束日期可留空。国内长期居留许可本身没有期限，TIE 卡到期不影响，结束日期请留空。学习停留请勾选。',
  'es.permit': '许可 {n}',
  'es.from': '生效日期',
  'es.to': '到期日期（仍有效可留空）',
  'es.study': '这是学习停留（estancia por estudios）',
  'es.addPermit': '添加许可',
  'es.trips': '出境记录',
  'es.tripsHint': '每次离开西班牙填一行，计划中的出行也可以填。',
  'es.trip': '出境 {n}',
  'es.departed': '离开西班牙的日期',
  'es.returned': '回到西班牙的日期',
  'es.addTrip': '添加出境记录',
  'es.nationality': '入籍路线',
  'es.route': '适用的入籍年限',
  'es.route.general': '一般（中国公民适用）',
  'es.route.refugee': '已获难民身份',
  'es.route.ibero':
    '伊比利亚美洲国家、安道尔、菲律宾、赤道几内亚、葡萄牙原始国籍公民或塞法迪人',
  'es.route.marriage': '与西班牙公民结婚且未分居',
  'es.route.one-year': '其他 1 年的情形（如在西班牙出生）',
  'es.marriedOn': '与西班牙公民结婚的日期',
  'es.remove': '删除',
  'es.submit': '计算',
  'es.errorSummary': '请先修正标红的项目。',
  'es.error.date': '请填写有效日期。',
  'es.error.order': '这个日期不能早于开始的日期。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'es.name': 'Spain',
  'es.entryLink': 'Open the Spain pilot',
  'es.entryDesc':
    'Use your residence permits and travel record to work out the dates for national long-term residence and citizenship by residence.',
  'es.title': 'Spain: dates for long-term residence and citizenship (pilot)',
  'es.intro':
    'From your Spanish residence permits and trips, this works out two steps that depend on time alone: national long-term residence (residencia de larga duración nacional) and citizenship by residence (nacionalidad por residencia). Eligibility for work, investment or arraigo permits is out of scope.',
  'es.scope':
    'The pilot checks only the time requirements in the regulations and the Civil Code. It does not check the language and constitution tests, conduct, giving up your nationality or other requirements; each result lists them, and counting the rules leave open is flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'es.basics': 'About you',
  'es.simulationDate': 'Simulation date',
  'es.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'es.permits': 'Residence permits',
  'es.permitsHint':
    'Add a row for each permit, then the next one if renewed on time; leave the end blank if it is still valid. A national long-term residence permit has no end date and an expired TIE card does not end it, so leave its end blank. Tick study stays.',
  'es.permit': 'Permit {n}',
  'es.from': 'Valid from',
  'es.to': 'Valid until (leave blank if still valid)',
  'es.study': 'This is a study stay (estancia por estudios)',
  'es.addPermit': 'Add a permit',
  'es.trips': 'Trips abroad',
  'es.tripsHint':
    'Add a row for each time you left Spain. You can include planned trips.',
  'es.trip': 'Trip {n}',
  'es.departed': 'Date you left Spain',
  'es.returned': 'Date you came back to Spain',
  'es.addTrip': 'Add a trip',
  'es.nationality': 'Citizenship route',
  'es.route': 'Years of residence that apply to you',
  'es.route.general': 'General (applies to Chinese citizens)',
  'es.route.refugee': 'Granted refugee status',
  'es.route.ibero':
    'National by origin of an Ibero-American country, Andorra, the Philippines, Equatorial Guinea or Portugal, or Sephardic',
  'es.route.marriage': 'Married to a Spanish citizen and not separated',
  'es.route.one-year': 'Another one-year case (such as born in Spain)',
  'es.marriedOn': 'Date you married a Spanish citizen',
  'es.remove': 'Remove',
  'es.submit': 'Work out dates',
  'es.errorSummary': 'Fix the items marked in red first.',
  'es.error.date': 'Enter a valid date.',
  'es.error.order': 'This date cannot be before the start date.',
};
