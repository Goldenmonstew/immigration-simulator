export const zhCN = {
  'nz.name': '新西兰',
  'nz.entryLink': '打开新西兰模拟器',
  'nz.entryDesc':
    '按居民签证与出入境记录，计算旅行条件到期日、永久居民签证和入籍在境天数的时间节点。',
  'nz.title': '新西兰：永久居民签证与入籍的时间',
  'nz.intro':
    '按你在新西兰的居民签证和出入境记录，计算只看时间的三个节点：居民签证的旅行条件何时到期、永久居民签证（PRV）的在境天数，以及入籍的在境天数。居民签证本身能否获批（技术移民打分、雇主、投资等）不在范围内。',
  'nz.scope':
    '这里只检查移民局操作手册和入籍法写明的时间条件；品格、英语、居民签证附加条件等不检查，结果里逐项列出。所填内容只在你的浏览器里计算，不保存、不上传。',
  'nz.basics': '基本信息',
  'nz.simulationDate': '模拟日期',
  'nz.simulationDateHint': '按这一天判断，默认今天。',
  'nz.dateOfBirth': '出生日期',
  'nz.firstArrival': '首次入境新西兰的日期（持任何签证）',
  'nz.visas': '居民签证',
  'nz.residentGranted': '居民签证（Resident Visa）获批日期',
  'nz.residentGrantedHint':
    '在境外获批的，要等之后首次入境才算"以居民身份在新西兰"。',
  'nz.category': '居民签证类别',
  'nz.category.general': '一般类别（技术移民、伴侣、工作转居民等）',
  'nz.category.parent': '父母类（Parent）',
  'nz.category.religious-worker': '宗教工作者（Religious Worker）',
  'nz.category.aip-growth': 'Active Investor Plus：Growth',
  'nz.category.aip-balanced': 'Active Investor Plus：Balanced',
  'nz.travelConditionsEnd': '签证上的旅行条件到期日（可留空）',
  'nz.travelConditionsEndHint':
    '即 eVisa 上的 Expiry date travel。留空则按现行规则推算；早年获批的签证规则可能不同，建议填写。',
  'nz.conditions': '模拟日时居民签证的 s49 条件（如受雇、投资、担保要求）',
  'nz.conditions.unsure': '不确定（按签证类别判断）',
  'nz.conditions.none': '没有，或已办理取消',
  'nz.conditions.met': '已满足，尚未办理取消',
  'nz.conditions.outstanding': '尚未满足',
  'nz.nonPrincipal': '我是随同获批的伴侣或子女（不是主申请人）',
  'nz.prvGranted': '永久居民签证（PRV）获批日期（还没有可留空）',
  'nz.trips': '出境记录',
  'nz.tripsHint':
    '成为居民后每次离开新西兰都填一行；居民签证在境外获批的，把获批时那次出境也填上。计划中的出行也可以填。',
  'nz.trip': '出境 {n}',
  'nz.departed': '离开新西兰的日期',
  'nz.returned': '回到新西兰的日期',
  'nz.addTrip': '添加出境记录',
  'nz.remove': '删除',
  'nz.submit': '计算',
  'nz.errorSummary': '请先修正标红的项目。',
  'nz.error.date': '请填写有效日期。',
  'nz.error.order': '这个日期不能早于开始的日期。',
  'nz.error.beforeBirth': '首次入境日不能早于出生日期。',
  'nz.error.beforeArrival': '出境日不能早于首次入境日。',
  'nz.error.prvOrder': '永久居民签证获批日不能早于居民签证获批日。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'nz.name': 'New Zealand',
  'nz.entryLink': 'Open New Zealand',
  'nz.entryDesc':
    'Use your resident visa and travel record to work out when your travel conditions end and the dates for the permanent resident visa and citizenship presence.',
  'nz.title':
    'New Zealand: dates for the permanent resident visa and citizenship',
  'nz.intro':
    'From your New Zealand resident visa and trips, this works out three steps that depend on time alone: when your resident visa travel conditions end, the days needed for a permanent resident visa, and the presence requirement for citizenship. Whether you can get a resident visa (Skilled Migrant points, employers, investment and so on) is out of scope.',
  'nz.scope':
    'This checks only the time requirements written in the immigration instructions and the Citizenship Act. It does not check character, English, conditions on your resident visa or other requirements; each result lists them. Your entries are processed in your browser and are not saved or uploaded.',
  'nz.basics': 'About you',
  'nz.simulationDate': 'Simulation date',
  'nz.simulationDateHint':
    'Results are worked out for this date. It starts as today.',
  'nz.dateOfBirth': 'Date of birth',
  'nz.firstArrival': 'Date you first arrived in New Zealand (on any visa)',
  'nz.visas': 'Resident visa',
  'nz.residentGranted': 'Date your resident visa was granted',
  'nz.residentGrantedHint':
    'If it was granted outside New Zealand, you are in New Zealand as a resident only from your next arrival.',
  'nz.category': 'Residence category',
  'nz.category.general':
    'General (Skilled Migrant, partner, work to residence and others)',
  'nz.category.parent': 'Parent',
  'nz.category.religious-worker': 'Religious Worker',
  'nz.category.aip-growth': 'Active Investor Plus: Growth',
  'nz.category.aip-balanced': 'Active Investor Plus: Balanced',
  'nz.travelConditionsEnd':
    'Travel conditions expiry date on your visa (optional)',
  'nz.travelConditionsEndHint':
    'The Expiry date travel on your eVisa. If blank, it is worked out under the current rule; older visas may differ, so entering it is better.',
  'nz.conditions':
    's49 conditions on your resident visa on the simulation date (such as employment, investment or sponsorship)',
  'nz.conditions.unsure': 'Not sure (go by the visa category)',
  'nz.conditions.none': 'None, or already removed',
  'nz.conditions.met': 'Met, not yet removed',
  'nz.conditions.outstanding': 'Not yet met',
  'nz.nonPrincipal':
    'I was included as a partner or child (not the principal applicant)',
  'nz.prvGranted':
    'Date your permanent resident visa was granted (leave blank if you do not have one)',
  'nz.trips': 'Trips abroad',
  'nz.tripsHint':
    'Add a row for each time you left New Zealand after becoming a resident. If your resident visa was granted while you were abroad, include that trip too. You can include planned trips.',
  'nz.trip': 'Trip {n}',
  'nz.departed': 'Date you left New Zealand',
  'nz.returned': 'Date you came back to New Zealand',
  'nz.addTrip': 'Add a trip',
  'nz.remove': 'Remove',
  'nz.submit': 'Work out dates',
  'nz.errorSummary': 'Fix the items marked in red first.',
  'nz.error.date': 'Enter a valid date.',
  'nz.error.order': 'This date cannot be before the start date.',
  'nz.error.beforeBirth':
    'Your first arrival cannot be before your date of birth.',
  'nz.error.beforeArrival': 'A trip cannot start before your first arrival.',
  'nz.error.prvOrder':
    'The permanent resident visa cannot be granted before the resident visa.',
};
