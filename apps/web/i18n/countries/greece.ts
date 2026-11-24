import { grFormEn, grFormZh } from './greece-form';
import { grGameEn, grGameZh } from './greece-game';

export const zhCN = {
  ...grFormZh,
  ...grGameZh,
  'gr.name': '希腊',
  'gr.title': '希腊居留与入籍模拟',
  'gr.intro':
    '选择与你有关的路径，逐项核对希腊居留许可或入籍的法定条件，查看最早可递交的日期，以及还需要补充哪些资料。',
  'gr.scope':
    '涵盖八条路径：欧盟长期居民 Μ.1、十年居留 Μ.2、归化入籍、黄金签证 Β.5、希腊公民家属 Ο.3／Μ.3、欧盟公民家属 Ν、受雇工作 Ε.1／Ε.4 和第三国家庭团聚 Ο.1／Ο.2。按移民法典、国籍法典和欧盟自由流动规定，分别核对首签、续期、转永久或宣誓等阶段的时间、收入、语言、保险、品行与材料。主管机关尚未明确的事项会标为待确认，并列出待定细节编号。',
  'gr.prepare':
    '准备好希腊居留许可的起止日期和签发日、每次离开希腊的日期，以及与所选路径有关的证明，例如收入与纳税记录、医疗保险、希腊语或入籍考试成绩、家庭关系文件、房产或雇佣合同。记不清的项目可以留空。',
  'gr.privacy':
    '问卷在浏览器内计算，草稿与保存的方案只留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
  'hub.gr.code': 'GR',
  'hub.gr.paths': '长期居留 Μ.1／Μ.2 · 黄金签证 · 家属与工作 · 入籍',
  'hub.gr.desc':
    '核对长期居民、十年居留、黄金签证、希腊或欧盟公民家属、受雇工作、家庭团聚与归化入籍的全部法定条件，比较不同情形下的最早递交日期。',
  'gr.policy.pageTitle': '希腊政策依据',
  'gr.policy.title': '希腊现行法律',
  'gr.policy.rule.ltResidence': '长期居留所需的合法居留年限',
  'gr.policy.rule.ltSingleAbsence': '长期居留的单次离境上限',
  'gr.policy.rule.ltTotalAbsence': '长期居留的累计离境上限',
  'gr.policy.rule.natResidence': '入籍前的合法居留年限',
  'gr.policy.rule.gvRenewal': '黄金签证的正常续期期间',
  'gr.policy.rule.gvLate': '黄金签证的逾期续期',
  'gr.policy.migrationCodeChange': '移民法典 ν. 5038/2023 施行',
  'gr.policy.migrationCodeSummary':
    '新的移民法典取代原有规定，统一各类居留许可的入境、续期、长期居留和家庭团聚规则。',
  'gr.policy.goldenVisaChange': '黄金签证投资门槛按区位分档',
  'gr.policy.goldenVisaSummary':
    'ν. 5100/2024 重述房产投资许可的条件，按区位和投资类型设不同金额，并限制短租用途；符合旧制或过渡规定的交易保留原条件。',
  'gr.policy.naturalisationChange': '入籍程序与考试规则修订',
  'gr.policy.naturalisationSummary':
    'ν. 5225/2025 修订国籍法典的考试、宣誓与驳回后再申请等待期等规定。',
  'gr.policy.reform2026Change': '工作、家属与续期规则修订',
  'gr.policy.reform2026Summary':
    'ν. 5275/2026 修订续期窗口与宽限、受雇许可、十年居留、希腊公民家属永久卡和积压续期的计算。',
  'gr.policy.protectionChange': '国际保护等待期计入长期居留',
  'gr.policy.protectionSummary':
    '修订后的第 144(2)–(2Α) 条按获批记录计入庇护等待期，并排除依法不计的既往居留。',
  'gr.policy.economicChange': '入籍经济融入的综合判断',
  'gr.policy.economicSummary':
    '内政部 52779/2026 通函适用于新申请和待决申请：综合持续合法的经济活动、生活来源和税保合规，而不只看收入数字。',
  'gr.result.finishQuestionnaire':
    '请返回问卷，完成所选路径的必填项目后再查看结果。',
  'gr.result.met': '根据所填资料，这项条件已满足。',
  'gr.result.notMet': '根据所填资料，这项条件未满足。',
  'gr.result.moreInformation': '请补充或核实这项条件所需的资料。',
  'gr.whatif.date': '模拟日期（递交日）',
  'gr.whatif.noTrips': '假设期间没有离开希腊',
  'gr.whatif.language': '希腊语证书等级（Μ.1／Μ.2 融入）',
  'gr.whatif.exam': '入籍考试（Π.Ε.Γ.Π.）',
  'gr.whatif.income': '上一纳税年度家庭净收入（€）',
  'gr.whatif.salary': '税前年薪（€）',
  'gr.whatif.sponsorIncome': '担保人个人年净收入（€）',
  'gr.whatif.investment': '黄金签证计入的投资金额（€）',
  'gr.whatif.invalidDate': '请填写有效日期。',
  'gr.whatif.invalidAmount': '请填写不小于 0 的金额。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...grFormEn,
  ...grGameEn,
  'gr.name': 'Greece',
  'gr.title': 'Greek residence and citizenship simulator',
  'gr.intro':
    'Choose the routes that apply to you to check each legal requirement for a Greek residence permit or naturalisation, see the earliest date you could apply, and find out what you still need to provide.',
  'gr.scope':
    'Eight routes are covered: EU long-term resident Μ.1, ten-year residence Μ.2, naturalisation, golden visa Β.5, family of a Greek citizen Ο.3/Μ.3, family of an EU citizen Ν, employment Ε.1/Ε.4 and third-country family reunification Ο.1/Ο.2. Under the Migration Code, the Citizenship Code and the EU free movement rules, each stage (first permit, renewal, permanent card or oath) is checked for timing, income, language, insurance, conduct and documents. Points the authorities have not settled are shown as to be confirmed with their pending-detail numbers.',
  'gr.prepare':
    'Have the start, end and issue dates of your Greek permits, the dates of each trip outside Greece, and the evidence for your routes ready, such as income and tax records, health insurance, Greek language or naturalisation exam results, family documents, and property or employment contracts. You can leave out anything you are unsure of.',
  'gr.privacy':
    'The questionnaire is worked out in your browser. Drafts and saved scenarios stay on this device. A share link contains your answers, so anyone with the link can restore them.',
  'hub.gr.code': 'GR',
  'hub.gr.paths':
    'Long-term residence Μ.1/Μ.2 · Golden visa · Family and work · Naturalisation',
  'hub.gr.desc':
    'Check every legal requirement for long-term and ten-year residence, the golden visa, family of Greek or EU citizens, employment, family reunification and naturalisation, and compare the earliest filing dates in different scenarios.',
  'gr.policy.pageTitle': 'Policy basis for Greece',
  'gr.policy.title': 'Current Greek law',
  'gr.policy.rule.ltResidence': 'Years of legal residence for long-term status',
  'gr.policy.rule.ltSingleAbsence': 'Single absence limit for long-term status',
  'gr.policy.rule.ltTotalAbsence': 'Total absence limit for long-term status',
  'gr.policy.rule.natResidence': 'Legal residence before naturalisation',
  'gr.policy.rule.gvRenewal': 'Golden visa ordinary renewal period',
  'gr.policy.rule.gvLate': 'Late golden visa renewal',
  'gr.policy.migrationCodeChange': 'Migration Code ν. 5038/2023 in force',
  'gr.policy.migrationCodeSummary':
    'The new Migration Code replaced the earlier provisions and set common rules for entry, renewal, long-term residence and family reunification.',
  'gr.policy.goldenVisaChange': 'Golden visa thresholds set by location',
  'gr.policy.goldenVisaSummary':
    'ν. 5100/2024 restated the real estate investor permit, with amounts set by location and investment type and limits on short lets. Transactions under the former or transitional rules keep their original conditions.',
  'gr.policy.naturalisationChange': 'Naturalisation procedure and exam revised',
  'gr.policy.naturalisationSummary':
    'ν. 5225/2025 amended the Citizenship Code on the exam, the oath and the waiting period after a rejection.',
  'gr.policy.reform2026Change': 'Work, family and renewal rules revised',
  'gr.policy.reform2026Summary':
    'ν. 5275/2026 changed the renewal window and grace period, employment permits, ten-year residence, permanent cards for family of Greek citizens and the credit for backlogged renewals.',
  'gr.policy.protectionChange':
    'Protection waiting period counts towards long-term residence',
  'gr.policy.protectionSummary':
    'Amended article 144(2)–(2Α) counts the asylum waiting period as recorded at the grant and excludes earlier residence that the law leaves out.',
  'gr.policy.economicChange': 'Overall assessment of economic integration',
  'gr.policy.economicSummary':
    'Interior Ministry circular 52779/2026 applies to new and pending applications: continuing lawful economic activity, living resources and tax and insurance compliance are weighed together rather than income figures alone.',
  'gr.result.finishQuestionnaire':
    'Go back to the questionnaire and complete the required items for your routes before viewing results.',
  'gr.result.met': 'Met on the answers given.',
  'gr.result.notMet': 'Not met on the answers given.',
  'gr.result.moreInformation':
    'More information is needed to assess this condition.',
  'gr.whatif.date': 'Simulation date (filing date)',
  'gr.whatif.noTrips': 'Assume no time outside Greece',
  'gr.whatif.language': 'Greek certificate level (Μ.1/Μ.2 integration)',
  'gr.whatif.exam': 'Naturalisation exam (Π.Ε.Γ.Π.)',
  'gr.whatif.income': 'Household net income in the previous tax year (€)',
  'gr.whatif.salary': 'Gross annual salary (€)',
  'gr.whatif.sponsorIncome': 'Sponsor’s personal annual net income (€)',
  'gr.whatif.investment': 'Golden visa qualifying value (€)',
  'gr.whatif.invalidDate': 'Enter a valid date.',
  'gr.whatif.invalidAmount': 'Enter an amount of 0 or more.',
};
