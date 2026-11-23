export const zhCN = {
  'au.name': '澳大利亚',
  'au.entryDesc':
    '按签证与出入境记录，计算 191、186 TRT、伴侣签永久阶段、回头签与入籍居住的时间节点。',
  'au.entryLink': '打开澳大利亚模拟器',
  'au.title': '澳大利亚：转永居、回头签与入籍的时间',
  'au.intro':
    '按你在澳洲的签证和出入境记录，计算只看时间的几个节点：191、香港类别（189、191）、186 TRT、伴侣签永久阶段、回头签 RRV 和入籍居住要求。靠打分邀请的签证（189 打分类、190、491 等）不在范围内。',
  'au.scope':
    '这里只检查条例写明的时间条件；英语、健康、品格、雇主提名、地区居住等条件不检查（191 香港地区类别按你填写的指定地区起始日计算），结果里逐项列出。所填内容只在你的浏览器里计算，不保存、不上传。',
  'au.basics': '基本信息',
  'au.simulationDate': '模拟日期',
  'au.simulationDateHint': '按这一天判断，默认今天。',
  'au.dateOfBirth': '出生日期',
  'au.firstArrival': '首次入境澳洲的日期（还没入境可留空）',
  'au.visas': '签证记录',
  'au.visasHint':
    '按时间顺序填写每一份签证，包括 bridging visa；不用填 ETA、特殊目的签证或船员签证。生效日填签证开始有效的那天。新的实质签证生效时，之前的签证即终止；新的 bridging visa 只终止之前的 bridging visa，不终止实质签证（Migration Act s82）。被终止的旧签证和仍有效的签证，到期日都可以留空；同一天生效的签证按填写顺序处理。',
  'au.visa': '签证 {n}',
  'au.subclass': '签证类别',
  'au.from': '生效日',
  'au.to': '到期日（仍有效可留空）',
  'au.addVisa': '添加签证',
  'au.remove': '删除',
  'au.trips': '出境记录',
  'au.tripsHint': '每次离开澳洲填一行，计划中的出行也可以填。',
  'au.trip': '出境 {n}',
  'au.departed': '离开澳洲的日期',
  'au.returned': '回到澳洲的日期',
  'au.addTrip': '添加出境记录',
  'au.sponsored':
    '持 457／482 或相关 bridging visa 期间，入境后一直在澳洲、在获批职业全职为担保雇主工作（带薪假可以，无薪假不行）',
  'au.partner': '我递交了伴侣签（820／801 或 309／100）',
  'au.hongKong':
    '我持香港特区或 BN(O) 护照，当前的 457／482／485 签证是作为主申请人获批、自生效起准许停留 5 年的签证（看香港类别 189、191）',
  'au.regionalSince': '从哪天起只在指定地区（191 香港地区类别用，可留空）',
  'au.regionalSinceHint':
    '从这天起没有在非指定地区居住、工作或学习。一直如此的，填首次入境日。',
  'au.partnerLodged': '伴侣签递交日期',
  'au.partnerStream': '递交地点',
  'au.onshore': '澳洲境内（820／801）',
  'au.offshore': '澳洲境外（309／100）',
  'au.longTerm':
    '递交时已是长期伴侣关系：以配偶或事实伴侣身份满 3 年；有双方共同的受抚养子女（不含继子女）时满 2 年',
  'au.submit': '计算',
  'au.errorSummary': '请先修正标红的项目。',
  'au.error.date': '请填写有效日期。',
  'au.error.order': '这个日期不能早于开始的日期。',
  'au.error.beforeBirth': '首次入境日不能早于出生日期。',
  'au.error.beforeArrival':
    '出境日不能早于首次入境日；有出境记录时须填首次入境日。',
  'au.sub.491': '491 技术移民地区（临时）',
  'au.sub.494': '494 雇主担保地区（临时）',
  'au.sub.482': '482 技能需求／临时技能短缺',
  'au.sub.457': '457 临时工作（技术）',
  'au.sub.820': '820 伴侣（境内临时）',
  'au.sub.309': '309 伴侣（境外临时）',
  'au.sub.bridging-trt': 'Bridging visa（因申请 457、482、186 或 187 获发）',
  'au.sub.bridging': 'Bridging visa（其他申请）',
  'au.sub.485': '485 临时毕业生',
  'au.sub.other-temporary': '其他临时签证（学生、旅游等）',
  'au.sub.189': '189 独立技术移民（永久）',
  'au.sub.190': '190 州担保技术移民（永久）',
  'au.sub.191': '191 地区永居（永久）',
  'au.sub.186': '186 雇主担保（永久）',
  'au.sub.801': '801 伴侣（境内永久）',
  'au.sub.100': '100 伴侣（境外永久）',
  'au.sub.155': '155 回头签 RRV（永久）',
  'au.sub.other-permanent': '其他永久签证',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'au.name': 'Australia',
  'au.entryDesc':
    'Use your visa and travel record to work out the dates for subclass 191, 186 TRT, the partner permanent stage, the Resident Return visa and citizenship residence.',
  'au.entryLink': 'Open Australia',
  'au.title':
    'Australia: permanent residence, return visa and citizenship dates',
  'au.intro':
    'From your Australian visas and trips, this works out the steps that depend on time alone: subclass 191, the Hong Kong streams of 189 and 191, the 186 Temporary Residence Transition stream, the partner visa permanent stage, the Resident Return visa and the citizenship residence requirement. Points-tested visas (such as the points-tested 189, 190 and 491) are out of scope.',
  'au.scope':
    'This checks only the time requirements written in the regulations. It does not check English, health, character, employer nomination, regional residence or other requirements (the 191 Hong Kong (Regional) stream uses the regional start date you enter); each result lists them. Your entries are processed in your browser and are not saved or uploaded.',
  'au.basics': 'About you',
  'au.simulationDate': 'Simulation date',
  'au.simulationDateHint':
    'Results are worked out for this date. It starts as today.',
  'au.dateOfBirth': 'Date of birth',
  'au.firstArrival':
    'Date you first arrived in Australia (leave blank if you have not arrived yet)',
  'au.visas': 'Your visas',
  'au.visasHint':
    'Enter each visa in date order, including bridging visas; leave out ETAs, special purpose visas and maritime crew visas. The start date is the day it came into effect. A new substantive visa ends the visas before it; a new bridging visa ends only an earlier bridging visa, not a substantive one (Migration Act s82). You can leave the end date blank for a visa that was ended this way or is still in effect; visas starting on the same day are taken in the order entered.',
  'au.visa': 'Visa {n}',
  'au.subclass': 'Visa subclass',
  'au.from': 'Start date',
  'au.to': 'End date (leave blank if still in effect)',
  'au.addVisa': 'Add a visa',
  'au.remove': 'Remove',
  'au.trips': 'Trips outside Australia',
  'au.tripsHint':
    'Add a row for each time you left Australia. You can include planned trips.',
  'au.trip': 'Trip {n}',
  'au.departed': 'Date you left Australia',
  'au.returned': 'Date you came back',
  'au.addTrip': 'Add a trip',
  'au.sponsored':
    'While on a 457/482 or related bridging visa, after arriving I always worked full time in Australia for my sponsor in the visa occupation (paid leave is fine, unpaid leave is not)',
  'au.partner': 'I applied for a partner visa (820/801 or 309/100)',
  'au.hongKong':
    'I hold a Hong Kong or BN(O) passport, and my current 457, 482 or 485 visa was granted to me as the primary applicant and allows a 5-year stay from when it came into effect (for the Hong Kong streams of 189 and 191)',
  'au.regionalSince':
    'Date from which you have been only in designated regional areas (for the 191 Hong Kong (Regional) stream; optional)',
  'au.regionalSinceHint':
    'From this day on you have not lived, worked or studied outside designated regional areas. If always, enter your first arrival.',
  'au.partnerLodged': 'Date you applied for the partner visa',
  'au.partnerStream': 'Where you applied',
  'au.onshore': 'In Australia (820/801)',
  'au.offshore': 'Outside Australia (309/100)',
  'au.longTerm':
    'We were already in a long-term partner relationship when I applied: 3 years as spouses or de facto partners, or 2 years with a dependent child of us both (not a step-child)',
  'au.submit': 'Calculate',
  'au.errorSummary': 'Fix the items marked in red first.',
  'au.error.date': 'Enter a valid date.',
  'au.error.order': 'This date cannot be before the start date.',
  'au.error.beforeBirth':
    'The first arrival cannot be before your date of birth.',
  'au.error.beforeArrival':
    'A trip cannot start before your first arrival; enter your first arrival if you have trips.',
  'au.sub.491': '491 Skilled Work Regional (Provisional)',
  'au.sub.494': '494 Skilled Employer Sponsored Regional (Provisional)',
  'au.sub.482': '482 Skills in Demand / Temporary Skill Shortage',
  'au.sub.457': '457 Temporary Work (Skilled)',
  'au.sub.820': '820 Partner (temporary, in Australia)',
  'au.sub.309': '309 Partner (temporary, outside Australia)',
  'au.sub.bridging-trt':
    'Bridging visa (for a 457, 482, 186 or 187 application)',
  'au.sub.bridging': 'Bridging visa (for another application)',
  'au.sub.485': '485 Temporary Graduate',
  'au.sub.other-temporary': 'Other temporary visa (student, visitor and so on)',
  'au.sub.189': '189 Skilled Independent (permanent)',
  'au.sub.190': '190 Skilled Nominated (permanent)',
  'au.sub.191': '191 Permanent Residence (Skilled Regional)',
  'au.sub.186': '186 Employer Nomination Scheme (permanent)',
  'au.sub.801': '801 Partner (permanent, in Australia)',
  'au.sub.100': '100 Partner (permanent, outside Australia)',
  'au.sub.155': '155 Resident Return visa (permanent)',
  'au.sub.other-permanent': 'Other permanent visa',
};
