export const zhCN = {
  'ca.name': '加拿大',
  'ca.entryLink': '打开加拿大试点',
  'ca.entryDesc':
    '按成为永久居民的日期与出入境记录，计算维持永居的居住义务与入籍实际居住的时间节点。',
  'ca.title': '加拿大：维持永居与入籍的时间（试点）',
  'ca.intro':
    '按你成为加拿大永久居民的日期、此前的临时身份和出入境记录，计算两个只看时间的节点：维持永久居民身份的居住义务，以及入籍的实际居住天数。永居本身怎么拿（Express Entry 打分、省提名、担保等）不在范围内。',
  'ca.scope':
    '试点只检查法律写明的天数条件；报税、语言、公民考试、禁止情形等不检查，结果里逐项列出。网上申请请以账户内的官方计算器为准。所填内容只在你的浏览器里计算，不保存、不上传。',
  'ca.basics': '基本信息',
  'ca.simulationDate': '模拟日期',
  'ca.simulationDateHint': '按这一天判断（入籍按签署申请的日期），默认今天。',
  'ca.dateOfBirth': '出生日期',
  'ca.permanentResident': '成为永久居民（PR）的日期',
  'ca.periods': '成为永久居民前的临时身份',
  'ca.periodsHint':
    '在加拿大以访客、学生、工作者或受保护人身份合法停留的期间，每段一行；结束日留空表示一直到成为永久居民前一天。没有身份或等待难民申请决定的时间不要填。',
  'ca.period': '临时身份 {n}',
  'ca.from': '开始日期',
  'ca.to': '结束日期（到成为永久居民前一天可留空）',
  'ca.addPeriod': '添加临时身份',
  'ca.trips': '出境记录',
  'ca.tripsHint':
    '每次离开加拿大填一行，计划中的出行也可以填；仍在境外的，回程填预计日期，结果会随之变化。',
  'ca.trip': '出境 {n}',
  'ca.departed': '离开加拿大的日期',
  'ca.returned': '回到加拿大的日期',
  'ca.addTrip': '添加出境记录',
  'ca.remove': '删除',
  'ca.submit': '计算',
  'ca.errorSummary': '请先修正标红的项目。',
  'ca.error.date': '请填写有效日期。',
  'ca.error.order': '这个日期不能早于开始的日期。',
  'ca.error.afterPr': '临时身份须在成为永久居民之前开始。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'ca.name': 'Canada',
  'ca.entryLink': 'Open the Canada pilot',
  'ca.entryDesc':
    'Use the date you became a permanent resident and your travel record to work out the residency obligation and the physical presence for citizenship.',
  'ca.title':
    'Canada: dates for keeping permanent residence and for citizenship (pilot)',
  'ca.intro':
    'From the date you became a Canadian permanent resident, your status before that and your trips, this works out two steps that depend on time alone: the residency obligation for keeping permanent resident status, and the physical presence for citizenship. How you get permanent residence (Express Entry points, provincial nomination, sponsorship and so on) is out of scope.',
  'ca.scope':
    'The pilot checks only the day counts written in the law. It does not check tax filing, language, the citizenship test, prohibitions or other requirements; each result lists them. For an online application, the official calculator in your account takes precedence. Your entries are processed in your browser and are not saved or uploaded.',
  'ca.basics': 'About you',
  'ca.simulationDate': 'Simulation date',
  'ca.simulationDateHint':
    'Results are worked out for this date (for citizenship, the date you sign). It starts as today.',
  'ca.dateOfBirth': 'Date of birth',
  'ca.permanentResident': 'Date you became a permanent resident',
  'ca.periods': 'Temporary status before permanent residence',
  'ca.periodsHint':
    'Add a row for each period you were in Canada lawfully as a visitor, student, worker or protected person. Leave the end blank if it ran until the day before you became a permanent resident. Do not include time without status or waiting on a refugee claim.',
  'ca.period': 'Status {n}',
  'ca.from': 'Start date',
  'ca.to':
    'End date (leave blank if it ran until you became a permanent resident)',
  'ca.addPeriod': 'Add a period',
  'ca.trips': 'Trips abroad',
  'ca.tripsHint':
    'Add a row for each time you left Canada. You can include planned trips; if you are abroad now, enter the date you expect to return, and the results follow it.',
  'ca.trip': 'Trip {n}',
  'ca.departed': 'Date you left Canada',
  'ca.returned': 'Date you came back to Canada',
  'ca.addTrip': 'Add a trip',
  'ca.remove': 'Remove',
  'ca.submit': 'Work out dates',
  'ca.errorSummary': 'Fix the items marked in red first.',
  'ca.error.date': 'Enter a valid date.',
  'ca.error.order': 'This date cannot be before the start date.',
  'ca.error.afterPr':
    'A temporary status must start before you became a permanent resident.',
};
