import { caFormEn, caFormZh } from './canada-form';

export const zhCN = {
  ...caFormZh,
  'ca.name': '加拿大',
  'hub.ca.code': 'CA',
  'hub.ca.paths':
    '永居居住义务 · 入籍 · Express Entry · 省提名 · 魁北克 · 大西洋 · 家庭担保',
  'hub.ca.desc':
    '核对维持永居与入籍的居住天数、报税、语言和禁止情形，以及 Express Entry、省提名、魁北克甄选、大西洋项目和配偶子女担保的法定条件。查看最早日期、待确认事项与官方依据。',
  'ca.title': '加拿大永居、入籍与移民路径模拟',
  'ca.intro':
    '选择与你有关的路径，逐项核对法定条件，查看最早可满足的日期和还需要确认的事项。',
  'ca.scope':
    '已持有永居的人可核对居住义务、PR card 与旅行证件、普通入籍和未成年人入籍。取得永居可核对 Express Entry 的 FSW、CEC、FST，省提名（安省 Workforce Priority 全流程，其他省只核提名后的联邦阶段），魁北克 PSTQ，大西洋移民项目，以及配偶、伴侣和受抚养子女担保。个案裁量、尚未公布的轮次或费表会列为待确认。',
  'ca.prepare':
    '准备成为永久居民的日期、出入境记录、报税年份和语言成绩。申请永居时，再准备邀请或提名、工作经历、学历评估、资金、体检、警证与家庭成员资料。不确定的项目可以留空。',
  'ca.privacy':
    '问卷在浏览器内计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
  'ca.goal.CA-RESIDENCY': '维持永久居民身份（居住义务、PR card、旅行证件）',
  'ca.goal.CA-CITIZENSHIP': '普通入籍（s.5(1)）',
  'ca.goal.CA-CIT-MINOR-52': '未成年人入籍（s.5(2)）',
  'ca.goal.CA-EE-FSW': 'Express Entry：联邦技术工人（FSW）',
  'ca.goal.CA-EE-CEC': 'Express Entry：加拿大经验类（CEC）',
  'ca.goal.CA-EE-FST': 'Express Entry：联邦技工（FST）',
  'ca.goal.CA-PNP': '省提名（PNP）',
  'ca.goal.CA-QC-PSTQ': '魁北克技术移民甄选（PSTQ）',
  'ca.goal.CA-AIP': '大西洋移民项目（AIP）',
  'ca.goal.CA-FAMILY': '配偶、伴侣及受抚养子女担保',
  'ca.form.goals': '要核对哪些路径？',
  'ca.form.goalsResidence': '已是永久居民',
  'ca.form.goalsInitial': '申请永久居民',
  'ca.form.simulationDateHint':
    '按这一天判断，默认今天。入籍按下文填写的签署日核对，未填时按这一天。',
  'ca.form.optional': '不确定或还没有的项目可以留空，结果会把它列为待确认。',
  'ca.form.optionalGroup': '填了这一组的任一项时，标 * 的项目必填。',
  'ca.form.tripsHint':
    '每次离开加拿大填一行，计划中的出行也可以填。没有出境时请点“确认没有记录”，否则居住天数无法计算。',
  'ca.form.periodsHint':
    '在加拿大以访客、学生、工作者或受保护人身份合法停留的期间，每段一行。没有身份或等待难民申请决定的时间不要填。',
  'ca.form.taxYearsHint':
    '按签署日（未填时按模拟日期）之前的计算期间列出日历年；签署日不是 1 月 1 日时也列出签署当年。未列出的年份不影响结果。',
  'ca.form.tupleHint': '请填写全部数值，或全部留空。',
  'ca.form.add': '添加',
  'ca.form.remove': '删除',
  'ca.form.noRecords': '确认没有记录',
  'ca.form.resetRecords': '改回未填',
  'ca.form.emptyConfirmed': '已确认没有记录。',
  'ca.form.applies': '适用，填写详情',
  'ca.form.notApplicable': '不适用',
  'ca.form.score': '第 {n} 项',
  'ca.form.weekday0': '周日',
  'ca.form.weekday1': '周一',
  'ca.form.weekday2': '周二',
  'ca.form.weekday3': '周三',
  'ca.form.weekday4': '周四',
  'ca.form.weekday5': '周五',
  'ca.form.weekday6': '周六',
  'ca.error.date': '请填写有效日期。',
  'ca.error.required': '请填写这一项。',
  'ca.error.number': '请填写有效的非负数值。',
  'ca.error.integer': '请填写整数。',
  'ca.error.range': '数值超出允许范围。',
  'ca.error.order': '这个日期不能早于开始的日期。',
  'ca.error.goals': '请至少选择一条路径。',
  'ca.whatif.dateHint': '入籍按问卷中的签署日核对；没有签署日时按这个日期。',
  'ca.whatif.trip': '再加一次出境',
  'ca.whatif.tripFrom': '离开加拿大的日期',
  'ca.whatif.tripTo': '回到加拿大的日期',
  'ca.whatif.citizenshipLevel': '入籍语言：听、说等级（CLB/NCLC）',
  'ca.whatif.citizenshipTest': '公民考试结果',
  'ca.whatif.eeLanguage': 'Express Entry 第一官方语言：四项等级（CLB/NCLC）',
  'ca.whatif.crs': '该轮 IRCC 确认的 CRS 分数',
  'ca.whatif.eeFunds': 'Express Entry 申请时可用安家资金（CAD）',
  'ca.whatif.aipFunds': '大西洋项目申请时可用安家资金（CAD）',
  'ca.whatif.qcFunds': '魁北克可用资金（CAD）',
  'ca.whatif.qcFrench': '魁北克本人法语：四项等级',
  'ca.whatif.income': '担保人合资格的 NOA 收入（CAD）',
  'ca.whatif.invalidDates':
    '请填写有效日期；回到加拿大的日期不能早于离开的日期。',
  'ca.whatif.invalidNumber': '请填写有效的非负数值。',
  'ca.policy.title': '加拿大现行法律',
  'ca.policy.pageTitle': '加拿大政策依据',
  'ca.policy.feeChange': '联邦永居申请费调整',
  'ca.policy.feeSummary':
    '永居处理费、永久居留权费、担保费和生物识别费按该日起的费表核对，下一次调整日为 {date}。',
  'ca.policy.rightFeeChange': '入籍权利费调整',
  'ca.policy.rightFeeSummary':
    '自该日起，成年人入籍须另缴 CAD {fee} 的入籍权利费。',
  'ca.policy.categoryChange': 'Express Entry 类别轮次职业清单更新',
  'ca.policy.categorySummary':
    '自该日起，类别轮次按新的职业清单核对，包括有加拿大工作经验的研究人员。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...caFormEn,
  'ca.name': 'Canada',
  'hub.ca.code': 'CA',
  'hub.ca.paths':
    'PR residency obligation · Citizenship · Express Entry · Provincial nomination · Québec · Atlantic · Family sponsorship',
  'hub.ca.desc':
    'Check days in Canada, tax filing, language and prohibitions for keeping PR and for citizenship, and the legal requirements for Express Entry, provincial nomination, Québec selection, the Atlantic program and spouse or child sponsorship. See the earliest dates, what still needs confirming and the official sources.',
  'ca.title':
    'Permanent residence, citizenship and immigration routes in Canada',
  'ca.intro':
    'Choose the routes relevant to you, check each legal requirement, and see the earliest date it can be met and what still needs confirming.',
  'ca.scope':
    'If you already hold PR, check the residency obligation, the PR card and travel document, and citizenship for adults and minors. To get PR, check the Express Entry FSW, CEC and FST programs, provincial nomination (the full Ontario Workforce Priority process; for other provinces only the federal stage after nomination), Québec PSTQ, the Atlantic Immigration Program, and sponsorship of a spouse, partner or dependent child. Individual discretion, unpublished rounds and fee tables are listed as to be confirmed.',
  'ca.prepare':
    'Have your PR date, travel record, tax years and language results ready. To get PR you will also need your invitation or nomination, work history, credential assessment, funds, medical exam, police certificates and family details. You can leave anything you are unsure of blank.',
  'ca.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
  'ca.goal.CA-RESIDENCY':
    'Keeping PR status (residency obligation, PR card, travel document)',
  'ca.goal.CA-CITIZENSHIP': 'Citizenship grant under s.5(1)',
  'ca.goal.CA-CIT-MINOR-52': 'Minor citizenship grant under s.5(2)',
  'ca.goal.CA-EE-FSW': 'Express Entry: Federal Skilled Worker (FSW)',
  'ca.goal.CA-EE-CEC': 'Express Entry: Canadian Experience Class (CEC)',
  'ca.goal.CA-EE-FST': 'Express Entry: Federal Skilled Trades (FST)',
  'ca.goal.CA-PNP': 'Provincial Nominee Program (PNP)',
  'ca.goal.CA-QC-PSTQ': 'Québec Skilled Worker Selection Program (PSTQ)',
  'ca.goal.CA-AIP': 'Atlantic Immigration Program (AIP)',
  'ca.goal.CA-FAMILY': 'Spouse, partner and dependent child sponsorship',
  'ca.form.goals': 'Which routes do you want to check?',
  'ca.form.goalsResidence': 'Already a permanent resident',
  'ca.form.goalsInitial': 'Applying for permanent residence',
  'ca.form.simulationDateHint':
    'Results are worked out for this date, which starts as today. Citizenship uses the signing date you enter later, or this date if you leave it blank.',
  'ca.form.optional':
    'Leave anything you are unsure of or do not have yet blank. The result lists it as to be confirmed.',
  'ca.form.optionalGroup':
    'If you fill in any item in this group, the items marked * are required.',
  'ca.form.tripsHint':
    'Add a row for each time you left Canada, including planned trips. If you have not left Canada, select “No records”, otherwise your days cannot be counted.',
  'ca.form.periodsHint':
    'Add a row for each period you were in Canada lawfully as a visitor, student, worker or protected person. Do not include time without status or waiting on a refugee claim.',
  'ca.form.taxYearsHint':
    'Calendar years in the period before the signing date (or the simulation date if none), including the signing year unless you sign on 1 January. Years not listed do not affect the result.',
  'ca.form.tupleHint': 'Fill in every value, or leave them all blank.',
  'ca.form.add': 'Add',
  'ca.form.remove': 'Remove',
  'ca.form.noRecords': 'No records',
  'ca.form.resetRecords': 'Back to unanswered',
  'ca.form.emptyConfirmed': 'Confirmed: no records.',
  'ca.form.applies': 'Applies, enter details',
  'ca.form.notApplicable': 'Does not apply',
  'ca.form.score': 'Skill {n}',
  'ca.form.weekday0': 'Sunday',
  'ca.form.weekday1': 'Monday',
  'ca.form.weekday2': 'Tuesday',
  'ca.form.weekday3': 'Wednesday',
  'ca.form.weekday4': 'Thursday',
  'ca.form.weekday5': 'Friday',
  'ca.form.weekday6': 'Saturday',
  'ca.error.date': 'Enter a valid date.',
  'ca.error.required': 'Answer this question.',
  'ca.error.number': 'Enter a valid number of zero or more.',
  'ca.error.integer': 'Enter a whole number.',
  'ca.error.range': 'This number is outside the allowed range.',
  'ca.error.order': 'This date cannot be before the start date.',
  'ca.error.goals': 'Choose at least one route.',
  'ca.whatif.dateHint':
    'Citizenship uses the signing date from the questionnaire, or this date if there is none.',
  'ca.whatif.trip': 'Add another trip',
  'ca.whatif.tripFrom': 'Date you leave Canada',
  'ca.whatif.tripTo': 'Date you come back to Canada',
  'ca.whatif.citizenshipLevel':
    'Citizenship language: listening and speaking level (CLB/NCLC)',
  'ca.whatif.citizenshipTest': 'Citizenship test result',
  'ca.whatif.eeLanguage':
    'Express Entry first official language: level in all four skills (CLB/NCLC)',
  'ca.whatif.crs': 'CRS score confirmed by IRCC for the round',
  'ca.whatif.eeFunds': 'Express Entry settlement funds when you apply (CAD)',
  'ca.whatif.aipFunds':
    'Atlantic program settlement funds when you apply (CAD)',
  'ca.whatif.qcFunds': 'Funds available for Québec (CAD)',
  'ca.whatif.qcFrench': 'Your French for Québec: level in all four skills',
  'ca.whatif.income': "Sponsor's eligible NOA income (CAD)",
  'ca.whatif.invalidDates':
    'Enter valid dates. The date you come back cannot be before the date you leave.',
  'ca.whatif.invalidNumber': 'Enter a valid number of zero or more.',
  'ca.policy.title': 'Current Canadian law',
  'ca.policy.pageTitle': 'Policy basis for Canada',
  'ca.policy.feeChange': 'Federal permanent residence fees adjusted',
  'ca.policy.feeSummary':
    'Processing, right of permanent residence, sponsorship and biometrics fees are checked against the schedule from this date. The next adjustment is on {date}.',
  'ca.policy.rightFeeChange': 'Right of citizenship fee adjusted',
  'ca.policy.rightFeeSummary':
    'From this date, adults applying for citizenship also pay a right of citizenship fee of CAD {fee}.',
  'ca.policy.categoryChange': 'Express Entry category occupation lists updated',
  'ca.policy.categorySummary':
    'From this date, category rounds use the new occupation lists, including researchers with Canadian work experience.',
};
