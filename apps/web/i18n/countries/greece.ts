export const zhCN = {
  'gr.name': '希腊',
  'gr.entryLink': '打开希腊模拟器',
  'gr.entryDesc':
    '按居留许可（含黄金签证）与出入境记录，计算长期居留、黄金签证续期与入籍的时间节点。',
  'gr.title': '希腊：长期居留、黄金签证续期与入籍的时间',
  'gr.intro':
    '按你在希腊的居留许可（含黄金签证）和出入境记录，计算三个只看时间的节点：长期居留（Μ1）、黄金签证（Β.5）的续期期间，以及入籍的居留年限。投资金额门槛与入籍考试不在范围内。',
  'gr.scope':
    '这里只检查移民法典与国籍法典写明的时间条件；收入、保险、融入、语言考试等不检查，结果里逐项列出。黄金签证期间能否计入长期居留等原文没说清的地方会标出。所填内容只在你的浏览器里计算，不保存、不上传。',
  'gr.basics': '基本信息',
  'gr.simulationDate': '模拟日期',
  'gr.simulationDateHint': '按这一天判断（按递交日），默认今天。',
  'gr.permits': '居留许可',
  'gr.permitsHint':
    '每张许可填一行，按时续期的接着填下一张；仍有效的到期日可留空（黄金签证请填卡上的到期日，才能算续期时间）。',
  'gr.permit': '许可 {n}',
  'gr.from': '生效日期',
  'gr.to': '到期日期（仍有效可留空）',
  'gr.kind': '许可类型',
  'gr.kind.regular': '普通居留许可（工作、家庭团聚等）',
  'gr.kind.investor': '黄金签证（不动产投资者许可 Β.5）',
  'gr.kind.study': '学习或职业培训',
  'gr.kind.temporary': '国家签证（如数字游民）',
  'gr.addPermit': '添加许可',
  'gr.trips': '出境记录',
  'gr.tripsHint': '每次离开希腊填一行，计划中的出行也可以填。',
  'gr.trip': '出境 {n}',
  'gr.departed': '离开希腊的日期',
  'gr.returned': '回到希腊的日期',
  'gr.addTrip': '添加出境记录',
  'gr.nationality': '入籍路线',
  'gr.route': '适用的入籍年限',
  'gr.route.choose': '请选择',
  'gr.route.general':
    '7 年：递交时持清单内的身份（如长期居留 Μ1、10 年许可、黄金签证等投资者许可）',
  'gr.route.three-year':
    '3 年：欧盟公民、与希腊人结婚并有子女、对在希腊出生的希腊籍子女有亲权者、无国籍人（递交时同样须持清单内的身份）',
  'gr.route.twelve-year': '12 年：递交时持其他非临时居留许可（如普通工作许可）',
  'gr.remove': '删除',
  'gr.submit': '计算',
  'gr.errorSummary': '请先修正标红的项目。',
  'gr.error.date': '请填写有效日期。',
  'gr.error.order': '这个日期不能早于开始的日期。',
  'gr.error.route': '请选择适用的入籍年限。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'gr.name': 'Greece',
  'gr.entryLink': 'Open Greece',
  'gr.entryDesc':
    'Use your residence permits (golden visa included) and travel record to work out the dates for long-term residence, golden visa renewal and naturalisation.',
  'gr.title':
    'Greece: dates for long-term residence, golden visa renewal and naturalisation',
  'gr.intro':
    'From your Greek residence permits (golden visa included) and trips, this works out three steps that depend on time alone: long-term residence (Μ1), the golden visa (Β.5) renewal period, and the years of residence for naturalisation. Investment thresholds and the naturalisation exam are out of scope.',
  'gr.scope':
    'This checks only the time requirements in the Migration Code and the Citizenship Code. It does not check income, insurance, integration, language exams or other requirements; each result lists them, and open questions such as whether golden visa time counts towards long-term residence are flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'gr.basics': 'About you',
  'gr.simulationDate': 'Simulation date',
  'gr.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'gr.permits': 'Residence permits',
  'gr.permitsHint':
    'Add a row for each permit, then the next one if renewed on time; leave the end blank if it is still valid (for a golden visa, enter the expiry on the card to get the renewal dates).',
  'gr.permit': 'Permit {n}',
  'gr.from': 'Valid from',
  'gr.to': 'Valid until (leave blank if still valid)',
  'gr.kind': 'Permit type',
  'gr.kind.regular': 'Ordinary residence permit (work, family and others)',
  'gr.kind.investor': 'Golden visa (real estate investor permit Β.5)',
  'gr.kind.study': 'Study or vocational training',
  'gr.kind.temporary': 'National visa (such as digital nomad)',
  'gr.addPermit': 'Add a permit',
  'gr.trips': 'Trips abroad',
  'gr.tripsHint':
    'Add a row for each time you left Greece. You can include planned trips.',
  'gr.trip': 'Trip {n}',
  'gr.departed': 'Date you left Greece',
  'gr.returned': 'Date you came back to Greece',
  'gr.addTrip': 'Add a trip',
  'gr.nationality': 'Naturalisation route',
  'gr.route': 'Years of residence that apply to you',
  'gr.route.choose': 'Choose one',
  'gr.route.general':
    '7 years: holding a listed status when applying (such as long-term residence Μ1, a 10-year permit, or an investor permit such as the golden visa)',
  'gr.route.three-year':
    '3 years: EU citizen, spouse of a Greek with children, with parental responsibility for a Greek child born in Greece, or stateless (also holding a listed status when applying)',
  'gr.route.twelve-year':
    '12 years: holding another non-temporary permit when applying (such as an ordinary work permit)',
  'gr.remove': 'Remove',
  'gr.submit': 'Work out dates',
  'gr.errorSummary': 'Fix the items marked in red first.',
  'gr.error.date': 'Enter a valid date.',
  'gr.error.order': 'This date cannot be before the start date.',
  'gr.error.route': 'Choose the years of residence that apply to you.',
};
