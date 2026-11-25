import { usFormEn, usFormZh } from './united-states-form';

export const zhCN = {
  ...usFormZh,
  'us.name': '美国',
  'hub.us.code': 'US',
  'hub.us.paths': '入籍 · 绿卡维持与返美 · 亲属、职业与人道移民',
  'hub.us.desc':
    '逐项核对入籍、取消条件、返美、亲属与职业移民、调整身份及难民庇护转永居的法定条件。比较不同情形的递交与核准日期，查看待确认事项与官方依据。',
  'us.title': '美国入籍、绿卡与移民路径模拟',
  'us.intro':
    '选择一条路径，逐项核对法定条件，查看递交与核准的最早日期，以及还需要补充哪些资料。',
  'us.scope':
    '涵盖一般入籍、公民配偶入籍、军人入籍、取消条件、永久居民身份维持与返美、亲属移民、职业与投资移民（含 Gold Card）、调整身份或领馆移民签证，以及难民与受庇护者转永居。递交与核准分开评估，费用单独列出。',
  'us.outOfScope':
    '不包括 T 签证、U 签证、多元化签证抽签（DV）、Registry 及其他特别立法类别；签证排期与个案裁量按你填写的资料评估。',
  'us.prepare':
    '准备绿卡、出入境日期及与所选路径有关的材料，例如入籍考试结果、婚姻证明、I-130 或 I-140 收件通知、雇主财务资料、Visa Bulletin 排期、体检和刑事记录。还没有结论的事项可以留空。',
  'us.privacy':
    '问卷在浏览器内计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
  'us.policy.pageTitle': '美国政策依据',
  'us.policy.title': '美国现行规则',
  'us.policy.change.civics': '入籍公民知识考试启用新题库',
  'us.policy.change.civics.summary':
    '按 N-400 收件日适用新版考试：题库 {bank} 题，问 {asked} 题，答对 {correct} 题通过。之前收件的申请沿用旧版考试。',
  'us.policy.change.poverty': '2026 年贫困线生效',
  'us.policy.change.poverty.summary':
    '费用减免按新的贫困线核对；I-864 自 {i864} 起使用 2026 年标准。',
  'us.policy.change.hr1': 'H.R. 1 附加费调整',
  'us.policy.change.hr1.summary':
    '庇护、工卡、TPS、假释和 I-94 等附加费按生效日适用新费率。',
  'us.policy.change.eb5': 'EB-5 申请费调整',
  'us.policy.change.eb5.summary':
    'I-526、I-526E、I-829 及区域中心诚信费按收件日适用新费率。',
  'us.result.approval': '核准阶段：{status}。',
  'us.result.returnDate': '计划返美日',
  'us.whatif.date': '评估日期',
  'us.whatif.dateHint':
    '按这一天判断能否递交或返美。改动后请核对与日期有关的答案，例如面谈和裁决日。',
  'us.whatif.noTrips': '假设没有出境记录',
  'us.whatif.returnOn': '最近一次返美日期',
  'us.whatif.noReturnTrip':
    '问卷里没有出入境记录，没有可调整的返美日期。可以勾选“假设没有出境记录”，或回到问卷补填出境和返美日期。',
  'us.whatif.income': 'I-864 担保家庭年收入（美元）',
  'us.whatif.decisionOn': '预计裁决日',
  'us.whatif.invalid': '调整后的答案与问卷资料冲突，请核对日期和行程。',
  'us.error.required': '请回答这一项。',
  'us.error.entered': '请填写，或改选其他选项。',
  'us.error.date': '请填写有效日期。',
  'us.error.month': '请填写有效月份。',
  'us.error.number': '请填写零或正数。',
  'us.error.integer': '请填写整数。',
  'us.error.order': '这个日期不能早于开始的日期。',
  'us.error.beforeGreenCard': '只填取得绿卡之后的出境。',
  'us.error.overlap': '这次出境与前面的出境日期重叠。',
  'us.error.principalOrder': '主申请人的日期不能晚于你取得绿卡的日期。',
  'us.error.wageYear': '日期须在这条记录的年度内。',
  'us.error.year': '请填写四位数的年份。',
  'us.error.wageOverlap':
    '同一年度的两条记录期间重叠。请合并，或拆成不重叠的期间；年初至今的累计记录请使用相同的开始日。',
  'us.error.wageCumulative':
    '同一开始日的累计工资不能随截止日期减少，请核对金额。',
  'us.error.wageProration':
    '未获 USCIS 接受按比例核算时，优先日所在年度的净收入须从 1 月 1 日起算，以便计入优先日前的亏损；按比例核算被拒时，当年所有记录都从 1 月 1 日开始。',
  'us.error.ground': '请按 INA 212(a) 款项填写，例如 6 或 6(C)。',
  'us.error.duplicate': '这一项与前面的记录重复。',
  'us.error.consularPetition':
    '领馆程序不能与 I-485 一同递交请愿，请选择待审或已获批。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...usFormEn,
  'us.name': 'United States',
  'hub.us.code': 'US',
  'hub.us.paths':
    'Naturalization · Keeping a green card · Family, employment and humanitarian immigration',
  'hub.us.desc':
    'Check the requirements for naturalization, removing conditions, returning, family and employment immigration, adjustment of status and refugee or asylee adjustment. Compare filing and approval dates and see outstanding items and official sources.',
  'us.title': 'U.S. naturalization, green card and immigration pathways',
  'us.intro':
    'Choose a pathway, check each requirement and see the earliest filing and approval dates, and what information you still need.',
  'us.scope':
    'Covers general naturalization, naturalization as the spouse of a citizen, military naturalization, removing conditions, keeping permanent residence and returning, family immigration, employment and investor immigration (including the Gold Card), adjustment of status or consular immigrant visas, and refugee and asylee adjustment. Filing and approval are assessed separately, and fees are listed on their own.',
  'us.outOfScope':
    'T visas, U visas, the Diversity Visa lottery (DV), Registry and other special legislation categories are not covered. Visa availability and discretionary findings are taken from your answers.',
  'us.prepare':
    'Have your green card, travel dates and documents for your pathway ready, such as naturalization test results, marriage records, I-130 or I-140 receipt notices, employer financial records, Visa Bulletin dates, medical and criminal records. You can leave unresolved items blank.',
  'us.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
  'us.policy.pageTitle': 'Policy basis for the United States',
  'us.policy.title': 'Current U.S. rules',
  'us.policy.change.civics': 'New naturalization civics test',
  'us.policy.change.civics.summary':
    'The new test applies by N-400 receipt date: a bank of {bank} questions, {asked} asked and {correct} correct answers to pass. Earlier receipts keep the previous test.',
  'us.policy.change.poverty': '2026 poverty guidelines take effect',
  'us.policy.change.poverty.summary':
    'Fee relief uses the new guidelines. Form I-864 uses the 2026 figures from {i864}.',
  'us.policy.change.hr1': 'H.R. 1 fee adjustment',
  'us.policy.change.hr1.summary':
    'New amounts apply from the effective date to asylum, work permit, TPS, parole and I-94 fees.',
  'us.policy.change.eb5': 'EB-5 fee adjustment',
  'us.policy.change.eb5.summary':
    'New amounts apply by receipt date to Forms I-526, I-526E and I-829 and the regional center integrity fee.',
  'us.result.approval': 'Approval stage: {status}.',
  'us.result.returnDate': 'Planned return date',
  'us.whatif.date': 'Assessment date',
  'us.whatif.dateHint':
    'Eligibility to file or return is tested on this date. Check date-related answers such as interview and decision dates after changing it.',
  'us.whatif.noTrips': 'Assume no trips abroad',
  'us.whatif.returnOn': 'Most recent return date',
  'us.whatif.noReturnTrip':
    'The questionnaire has no trips, so there is no return date to change. Tick “Assume no trips abroad”, or add the departure and return dates in the questionnaire.',
  'us.whatif.income': 'I-864 sponsor household income (USD per year)',
  'us.whatif.decisionOn': 'Expected decision date',
  'us.whatif.invalid':
    'The changed answers conflict with the questionnaire. Check the dates and trips.',
  'us.error.required': 'Answer this question.',
  'us.error.entered': 'Enter a value, or choose another option.',
  'us.error.date': 'Enter a valid date.',
  'us.error.month': 'Enter a valid month.',
  'us.error.number': 'Enter zero or a positive number.',
  'us.error.integer': 'Enter a whole number.',
  'us.error.order': 'This date cannot be before the start date.',
  'us.error.beforeGreenCard': 'Enter only trips after you got your green card.',
  'us.error.overlap': 'This trip overlaps an earlier one.',
  'us.error.principalOrder':
    'The principal applicant’s date cannot be after the date you got your green card.',
  'us.error.wageYear': 'The date must be within this entry’s year.',
  'us.error.year': 'Enter a four-digit year.',
  'us.error.wageOverlap':
    'Two entries for the same year overlap. Combine them or split them into periods that do not overlap. Year-to-date entries should share the same start date.',
  'us.error.wageCumulative':
    'Year-to-date wages from the same start date cannot fall as the end date moves later. Check the amounts.',
  'us.error.wageProration':
    'Unless USCIS accepts proration, net income for the priority-date year must start on 1 January so that losses before the priority date are included. If proration was refused, every entry for that year starts on 1 January.',
  'us.error.ground': 'Use an INA 212(a) paragraph, such as 6 or 6(C).',
  'us.error.duplicate': 'This repeats an earlier entry.',
  'us.error.consularPetition':
    'A consular case cannot have a petition filed with an I-485. Choose pending or approved.',
};
