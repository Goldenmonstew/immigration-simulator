export const zhCN = {
  'us.name': '美国',
  'us.entryLink': '打开美国试点',
  'us.entryDesc':
    '按绿卡日期与出入境记录，计算入籍、配偶入籍、取消绿卡条件与离境时长的时间节点。',
  'us.title': '美国：入籍与绿卡的时间（试点）',
  'us.intro':
    '按你的绿卡日期和出入境记录，计算只看时间的几个节点：一般入籍、美国公民配偶入籍、条件绿卡的取消条件递交期，以及离境多久会影响凭绿卡回美。绿卡本身怎么拿（亲属、雇主、投资类别与排期）不在范围内。',
  'us.scope':
    '试点只检查法律与 USCIS 政策手册写明的时间条件；英语与公民考试、品行、是否放弃居住等不检查，结果里逐项列出。所填内容只在你的浏览器里计算，不保存、不上传。',
  'us.basics': '基本信息',
  'us.simulationDate': '模拟日期',
  'us.simulationDateHint': '按这一天判断（入籍按递交日），默认今天。',
  'us.dateOfBirth': '出生日期',
  'us.greenCard': '绿卡',
  'us.permanentResident': '取得永久居民身份的日期（绿卡上的 Resident Since）',
  'us.permanentResidentHint': '条件绿卡也填你本人取得条件身份的那天。',
  'us.conditional': '绿卡类型',
  'us.conditional.none': '一般绿卡',
  'us.conditional.marriage': '婚姻条件绿卡（须递交 I-751）',
  'us.conditional.investor': '投资条件绿卡（须递交 I-829）',
  'us.stateResidenceFrom': '开始住在现在所在州或 USCIS 辖区的日期（可留空）',
  'us.role': '你的条件绿卡是',
  'us.role.choose': '请选择',
  'us.role.principal': '本人凭婚姻或投资取得',
  'us.roleHint':
    '配偶或子女随父母、投资人取得的，按是否与对方一并递交取消条件申请选择。',
  'us.role.joint': '随父母或投资人取得，一并递交',
  'us.role.separate': '随父母或投资人取得，单独递交',
  'us.principalSince': '主申请人取得条件绿卡的日期',
  'us.married': '我与美国公民结婚并同住',
  'us.marriedOn': '结婚日期',
  'us.spouseCitizenSince': '配偶成为美国公民的日期（出生即是公民可留空）',
  'us.trips': '出境记录',
  'us.tripsHint': '取得绿卡后每次离开美国填一行，计划中的出行也可以填。',
  'us.trip': '出境 {n}',
  'us.departed': '离开美国的日期',
  'us.returned': '回到美国的日期',
  'us.addTrip': '添加出境记录',
  'us.remove': '删除',
  'us.submit': '计算',
  'us.errorSummary': '请先修正标红的项目。',
  'us.error.date': '请填写有效日期。',
  'us.error.order': '这个日期不能早于开始的日期。',
  'us.error.beforeGreenCard': '只填取得绿卡之后的出境。',
  'us.error.role': '请选择你的条件绿卡是怎样取得的。',
  'us.error.principalOrder': '主申请人的日期不能晚于你取得绿卡的日期。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'us.name': 'United States',
  'us.entryLink': 'Open the United States pilot',
  'us.entryDesc':
    'Use your green card date and travel record to work out the dates for naturalization, naturalization as the spouse of a citizen, removing conditions and time abroad.',
  'us.title':
    'United States: dates for naturalization and your green card (pilot)',
  'us.intro':
    'From your green card date and trips, this works out the steps that depend on time alone: general naturalization, naturalization as the spouse of a U.S. citizen, the filing period for removing conditions, and how long you can be away and still return on your green card. How you get a green card (family, employment and investment categories, priority dates) is out of scope.',
  'us.scope':
    'The pilot checks only the time requirements in the law and the USCIS Policy Manual. It does not check the English and civics tests, good moral character, abandonment of residence or other requirements; each result lists them. Your entries are processed in your browser and are not saved or uploaded.',
  'us.basics': 'About you',
  'us.simulationDate': 'Simulation date',
  'us.simulationDateHint':
    'Results are worked out for this date (for naturalization, the filing date). It starts as today.',
  'us.dateOfBirth': 'Date of birth',
  'us.greenCard': 'Green card',
  'us.permanentResident':
    'Date you became a permanent resident (Resident Since on the card)',
  'us.permanentResidentHint':
    'For a conditional green card, enter the date you yourself got conditional status.',
  'us.conditional': 'Green card type',
  'us.conditional.none': 'Regular green card',
  'us.conditional.marriage': 'Conditional, based on marriage (file I-751)',
  'us.conditional.investor': 'Conditional, based on investment (file I-829)',
  'us.stateResidenceFrom':
    'Date you started living in your current state or USCIS district (optional)',
  'us.role': 'You got your conditional green card',
  'us.role.choose': 'Choose one',
  'us.role.principal': 'Yourself, through marriage or investment',
  'us.roleHint':
    'A spouse or child who got the card with a parent or the investor chooses by whether they file together with that person.',
  'us.role.joint': 'With a parent or the investor, filing together',
  'us.role.separate': 'With a parent or the investor, filing separately',
  'us.principalSince':
    'Date the principal applicant got their conditional green card',
  'us.married': 'I am married to and living with a U.S. citizen',
  'us.marriedOn': 'Date of marriage',
  'us.spouseCitizenSince':
    'Date your spouse became a U.S. citizen (leave blank if a citizen by birth)',
  'us.trips': 'Trips abroad',
  'us.tripsHint':
    'Add a row for each time you left the United States after getting your green card. You can include planned trips.',
  'us.trip': 'Trip {n}',
  'us.departed': 'Date you left the United States',
  'us.returned': 'Date you came back to the United States',
  'us.addTrip': 'Add a trip',
  'us.remove': 'Remove',
  'us.submit': 'Work out dates',
  'us.errorSummary': 'Fix the items marked in red first.',
  'us.error.date': 'Enter a valid date.',
  'us.error.order': 'This date cannot be before the start date.',
  'us.error.beforeGreenCard': 'Enter only trips after you got your green card.',
  'us.error.role': 'Choose how you got your conditional green card.',
  'us.error.principalOrder':
    'The principal applicant’s date cannot be after the date you got your green card.',
};
