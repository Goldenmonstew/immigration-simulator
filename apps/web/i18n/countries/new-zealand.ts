import { nzFormEn, nzFormZh } from './new-zealand-form';

export const zhCN = {
  ...nzFormZh,
  'nz.name': '新西兰',
  'hub.nz.code': 'NZ',
  'hub.nz.paths':
    '永居 PRV 与入籍 · 旅行条件 · 技术与工作居民 · 家庭与投资居民',
  'hub.nz.desc':
    '核对十条路径的法定条件：居民签证旅行条件、永久居民签证、入籍，以及技术移民、绿名单、护理与运输、伴侣、父母、投资者和宗教工作者居民签证。比较不同情形，查看待确认事项与官方依据。',
  'nz.title': '新西兰居民签证、永居与入籍模拟',
  'nz.intro':
    '选择与你有关的路径，逐项核对法定条件，查看最早可以申请的日期，以及还需要确认或补充的事项。',
  'nz.scope':
    '涵盖十条路径：已持居民签证者的旅行条件（首次入境、变更、失效后再次申请）、永久居民签证和入籍；Skilled Migrant Category、Green List、护理与运输工签转居民；伴侣、父母、Active Investor Plus 与 Business Investor、宗教工作者居民签证。每条路径列出全部法定条件和来源；需要主管机关裁量或政府尚未公布的细节显示为待确认。',
  'nz.prepare':
    '准备居民签证和出入境日期、身份与体检及警方证明，以及所选路径需要的工作、收入、英语、家庭关系或投资资料。不确定的事项可以留待确认。',
  'nz.privacy':
    '问卷在浏览器内计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
  'nz.policy.pageTitle': '新西兰政策依据',
  'nz.policy.title': '新西兰现行规则',
  'nz.policy.unlawfulChildChange': '居民签证新增非法居留受抚养子女的筛查',
  'nz.policy.unlawfulChildSummary':
    '自该日起，居民签证申请须核对每位申请人在新西兰非法居留的受抚养子女（包括不随行的子女），只有全部符合年龄及无权迁出的例外才能通过（R5.125）。',
  'nz.policy.feeChange': '入籍申请费按 DIA 新公告收取',
  'nz.policy.feeSummary':
    '入籍申请费按 DIA 自该日起公布的费率核对；模拟日早于该日时，费用显示为待确认。',
  'nz.policy.smcChange': 'Skilled Migrant Category 新规则开始适用',
  'nz.policy.smcSummary':
    '该日及之后受邀的申请按新版 SR3 的积分与经历规则评估；更早受邀或模拟日更早时，须按旧版指引核对，结果显示为待确认。',
  'nz.whatif.date': '模拟日期（假设在这一天递交）',
  'nz.whatif.dateHint':
    '年龄、证明有效期和在境天数都按这一天重新计算；问卷中的其他事实保持不变。',
  'nz.whatif.noTrips': '假设没有任何出境记录',
  'nz.whatif.lastReturn': '最近一次出境的返回日期',
  'nz.whatif.englishScore': '主申请人的英语考试总分',
  'nz.whatif.englishHint':
    '问卷已填 IELTS、TOEFL、PTE 或 Cambridge 时只改分数；没有考试记录或填的是按等级评分的 OET 时，按在模拟日线下参加 IELTS 计算。',
  'nz.whatif.invalid':
    '对比后的资料不完整或日期无效，请调整旋钮或返回问卷修改。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...nzFormEn,
  'nz.name': 'New Zealand',
  'hub.nz.code': 'NZ',
  'hub.nz.paths':
    'PRV and citizenship · Travel conditions · Skilled and work residence · Family and investor residence',
  'hub.nz.desc':
    'Check the requirements of ten pathways: resident visa travel conditions, the permanent resident visa and citizenship, plus Skilled Migrant, Green List, care and transport, partner, parent, investor and Religious Worker residence. Compare scenarios and see outstanding items and official sources.',
  'nz.title': 'Residence, permanent residence and citizenship in New Zealand',
  'nz.intro':
    'Choose the pathways relevant to you, check each requirement and see the earliest date you could apply and what still needs to be confirmed.',
  'nz.scope':
    'Ten pathways are covered: travel conditions for resident visa holders (first entry, variation and a new visa after expiry), the permanent resident visa and citizenship; the Skilled Migrant Category, the Green List and care or transport work to residence; partner, parent, Active Investor Plus and Business Investor, and Religious Worker residence. Each pathway lists every requirement with its source. Matters left to an officer or details the government has not published are shown as to be confirmed.',
  'nz.prepare':
    'Have your resident visa and travel dates, identity, medical and police certificates ready, plus any work, income, English, family or investment details your pathways need. You can leave uncertain items to be confirmed.',
  'nz.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
  'nz.policy.pageTitle': 'Policy basis for New Zealand',
  'nz.policy.title': 'Current New Zealand rules',
  'nz.policy.unlawfulChildChange':
    'Residence screening for dependent children unlawfully in New Zealand',
  'nz.policy.unlawfulChildSummary':
    'From this date, residence applications check every applicant’s dependent children who are unlawfully in New Zealand, including children not applying. The application can proceed only if each child meets the age and no-removal-right exception (R5.125).',
  'nz.policy.feeChange': 'Citizenship fee from the new DIA notice',
  'nz.policy.feeSummary':
    'The citizenship fee is checked against the rates DIA published from this date. For an earlier simulation date the fee is shown as to be confirmed.',
  'nz.policy.smcChange': 'New Skilled Migrant Category rules apply',
  'nz.policy.smcSummary':
    'Invitations from this date are assessed under the revised SR3 points and experience rules. Earlier invitations or simulation dates need the previous instructions and are shown as to be confirmed.',
  'nz.whatif.date': 'Simulation date (as if you applied that day)',
  'nz.whatif.dateHint':
    'Age, certificate validity and days in New Zealand are worked out for this date; your other answers stay the same.',
  'nz.whatif.noTrips': 'Assume no trips abroad',
  'nz.whatif.lastReturn': 'Return date of your latest trip',
  'nz.whatif.englishScore': 'Principal applicant’s overall English test score',
  'nz.whatif.englishHint':
    'With an IELTS, TOEFL, PTE or Cambridge result in your answers only the score changes. Without a test, or with a graded OET result, an in-person IELTS on the simulation date is assumed.',
  'nz.whatif.invalid':
    'The compared answers are incomplete or have an invalid date. Adjust the controls or return to the questionnaire.',
};
