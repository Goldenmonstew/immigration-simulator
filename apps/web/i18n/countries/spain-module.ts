export const zhCN = {
  'es.policy.title': '西班牙现行法律',
  'es.policy.pageTitle': '西班牙政策依据',
  'es.policy.frenchChange': '西法双边国籍协定生效',
  'es.policy.frenchSummary':
    '《西班牙王国与法兰西共和国国籍协定》生效，法国公民取得西班牙国籍时免于声明放弃原国籍。',
  'es.policy.regulationChange': '新《外国人条例》（RD 1155/2024）施行',
  'es.policy.regulationSummary':
    'RD 1155/2024 施行，规范国内长期居留、欧盟长期居留、其他成员国欧盟长居者迁入西班牙与随迁家属，以及长期居留身份的恢复与换卡。',
  'es.policy.feeChange': '居留与身份证明费表更新（Orden PJC/617/2025）',
  'es.policy.feeSummary':
    '更新长期居留许可、恢复申请、TIE 卡件及欧盟公民登记证明与家属卡的 790 费表标准。',
  'es.target.N': '按居住入籍（nacionalidad por residencia）',
  'es.target.L': '国内长期居留（residencia de larga duración nacional）',
  'es.target.E': '西班牙欧盟长期居留（residencia de larga duración-UE）',
  'es.target.M': '其他成员国欧盟长期居民迁入西班牙',
  'es.target.F': '跨境欧盟长期居民的随迁家属',
  'es.target.R-N': '恢复国内长期居留',
  'es.target.R-E': '恢复欧盟长期居留',
  'es.target.U': '欧盟自由流动制度下的永久居留',
  'es.whatif.date': '模拟／拟递交日期',
  'es.whatif.noTrips': '假设居留期间没有出境记录',
  'es.whatif.natRoute': '入籍居住年限类别',
  'es.whatif.dele': 'DELE A2 或以上西班牙语证书／法定免试已核实',
  'es.whatif.ccse': 'CCSE 公民知识考试合格且在有效期内',
  'es.whatif.familySize': '家庭人数（含申请人，用于 IPREM 资源门槛）',
  'es.whatif.income': '可计入的固定家庭月收入（EUR／月）',
  'es.whatif.salary': '跨境迁居受雇年薪（EUR／年）',
  'es.whatif.insurance': '递交时在西班牙有效的合规公共或私人医疗保险已备凭证',
  'es.whatif.conduct': '公民品格、公共秩序与安全及刑事记录审查均通过',
  'es.whatif.invalidNumber': '请填写有效的非负数。',
  'es.whatif.invalidFamilySize': '请填写大于或等于 1 的整数家庭人数。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'es.policy.title': 'Spanish law in force',
  'es.policy.pageTitle': 'Policy basis for Spain',
  'es.policy.frenchChange':
    'Franco-Spanish nationality convention takes effect',
  'es.policy.frenchSummary':
    'The Bilateral Nationality Convention between Spain and France enters into force, exempting French nationals from declaring renunciation of their nationality.',
  'es.policy.regulationChange':
    'New Aliens Regulation (RD 1155/2024) enters into force',
  'es.policy.regulationSummary':
    'RD 1155/2024 takes effect, governing national long-term residence, EU long-term residence, mobility of EU long-term residents and their family, and recovery and card renewal.',
  'es.policy.feeChange':
    'Updated residence and card fee schedule (Orden PJC/617/2025)',
  'es.policy.feeSummary':
    'Updates the form 790 fee schedule for long-term residence, recovery applications, TIE cards, EU registration certificates and family cards.',
  'es.target.N': 'Citizenship by residence (nacionalidad por residencia)',
  'es.target.L':
    'National long-term residence (residencia de larga duración nacional)',
  'es.target.E':
    'Spanish EU long-term residence (residencia de larga duración-UE)',
  'es.target.M':
    'Moving to Spain with EU long-term resident status from another Member State',
  'es.target.F': 'Family of an EU long-term resident moving to Spain',
  'es.target.R-N': 'Recovery of national long-term residence',
  'es.target.R-E': 'Recovery of EU long-term residence',
  'es.target.U': 'Permanent residence under EU free movement',
  'es.whatif.date': 'Simulation / proposed filing date',
  'es.whatif.noTrips': 'Assume no trips abroad during residence',
  'es.whatif.natRoute': 'Citizenship residence period category',
  'es.whatif.dele':
    'DELE A2+ Spanish certificate or statutory exemption confirmed',
  'es.whatif.ccse': 'Verified CCSE pass valid on the filing date',
  'es.whatif.familySize':
    'Household size (including applicant, for IPREM threshold)',
  'es.whatif.income': 'Eligible stable monthly household income (EUR/month)',
  'es.whatif.salary': 'Annual gross salary for mobility employment (EUR/year)',
  'es.whatif.insurance':
    'Valid public or authorised private health insurance in Spain documented',
  'es.whatif.conduct':
    'Civic conduct, criminal records and public-order/security checks cleared',
  'es.whatif.invalidNumber': 'Enter a valid non-negative number.',
  'es.whatif.invalidFamilySize': 'Enter a whole household size of 1 or more.',
};

export const spainConditionTitles = {
  'ES-N01': ['入籍合格居留与连续性', 'Qualifying residence and continuity'],
  'ES-N02': [
    '难民身份五年期缩短',
    'Five-year reduction for recognised refugees',
  ],
  'ES-N03': [
    '法定原始国籍或塞法迪两年期缩短',
    'Two-year reduction by origin or Sephardic status',
  ],
  'ES-N04': [
    '西班牙出生或错过选择权一年期缩短',
    'One-year reduction by birth in Spain or missed option',
  ],
  'ES-N05': [
    '西班牙监护或安置一年期缩短',
    'One-year reduction by Spanish guardianship or placement',
  ],
  'ES-N06': [
    '西籍配偶一年期缩短',
    'One-year reduction as spouse of a Spaniard',
  ],
  'ES-N07': [
    '西籍配偶遗属一年期缩短',
    'One-year reduction as widow or widower of a Spaniard',
  ],
  'ES-N08': [
    '西班牙原籍父母或祖父母后代一年期缩短',
    'One-year reduction by Spanish origin parent or grandparent',
  ],
  'ES-N-ONE-YEAR': [
    '一年居留组法定事由',
    'Statutory ground for one-year residence',
  ],
  'ES-N09': [
    '申请主体、签署与代表权',
    'Applicant capacity, signature and representation',
  ],
  'ES-N10-RECORDS': [
    '原籍与西班牙刑事记录及军人程序',
    'Criminal records and Defence procedure',
  ],
  'ES-N10': ['公民品格与公共秩序审查', 'Civic conduct and public-order review'],
  'ES-N11': [
    'DELE 西班牙语能力或免试',
    'DELE Spanish proficiency or exemption',
  ],
  'ES-N12': [
    'CCSE 公民知识考试或免试',
    'CCSE constitutional and cultural exam or exemption',
  ],
  'ES-N13': [
    '免试决定、学龄机构证明与社会融合',
    'Dispensation, school certificate and integration',
  ],
  'ES-N14': [
    '入籍申请表与身份出生住址文件',
    'Application form, identity, birth and residence documents',
  ],
  'ES-N15': ['入籍申请费（790-026）', 'Citizenship application fee (790-026)'],
  'ES-N16': [
    '尚需报名的 DELE／CCSE 考试预算',
    'Remaining DELE and CCSE exam registration budget',
  ],
  'ES-N17': [
    '获批后宣誓、放弃原籍声明与民事邻里权',
    'Post-grant oath, renunciation and civil neighbourhood',
  ],
  'ES-N18': [
    '西班牙民事登记与生效',
    'Spanish Civil Register entry and effectiveness',
  ],
  'ES-L-BASIS': [
    '国内长居普通居留或直接取得依据',
    'Ordinary residence or direct ground for national long-term status',
  ],
  'ES-L01': [
    '五年连续合法居留（含工作出境核算）',
    'Five years continuous legal residence (including work absences)',
  ],
  'ES-L01-PERMIT': [
    '前五年连续持有合格居留许可',
    'Continuous qualifying residence permit over the past five years',
  ],
  'ES-L01-SINGLE': [
    '普通长居单次离境上限',
    'Single absence limit for national long-term residence',
  ],
  'ES-L01-TOTAL': [
    '普通长居累计离境上限',
    'Total absence limit for national long-term residence',
  ],
  'ES-L02': [
    '不可抗力或公益合作项目离境例外',
    'Force majeure or development cooperation absence exception',
  ],
  'ES-L03': [
    '西班牙社保缴费型退休金直接事由',
    'Spanish contributory retirement pension ground',
  ],
  'ES-L04': [
    '西班牙绝对永久或重大失能待遇直接事由',
    'Spanish absolute permanent or severe disability pension ground',
  ],
  'ES-L05': [
    '在西出生成年且连续居留满三年直接事由',
    'Spanish-born adult resident with three years continuous residence',
  ],
  'ES-L06': ['原籍西班牙国籍丧失直接事由', 'Former Spaniard by origin ground'],
  'ES-L07': [
    '西班牙公共机构监护至成年直接事由',
    'Spanish public guardianship until majority ground',
  ],
  'ES-L08': [
    '在西无国籍、难民或辅助保护直接事由',
    'Stateless, refugee or subsidiary protection status in Spain',
  ],
  'ES-L09': [
    '部长决定认可显著贡献直接事由',
    'Recognised outstanding contribution to Spain',
  ],
  'ES-L10': [
    '第三国国民适用范围与入境禁返核查',
    'Third-country scope, entry alert and return commitment clearance',
  ],
  'ES-L11': [
    '国内长居递交机关、有效证件与递交窗口',
    'Competent office, valid identity document and filing window',
  ],
  'ES-L12': [
    '国内长居公共秩序、安全与健康审查',
    'Public order, security and health clearance for national status',
  ],
  'ES-L12-CERT': [
    '国内长居五年居住国刑事记录证明',
    'Criminal record certificates for the previous five years',
  ],
  'ES-L13': [
    '受扶养义务教育学龄子女入学证明',
    'School enrolment proof for compulsory school-age children',
  ],
  'ES-L14': [
    '国内长居申请费（790-052）',
    'National long-term residence fee (790-052)',
  ],
  'ES-E-TIME': [
    '欧盟长居常规或蓝卡累计居留年限',
    'Spanish residence or EU Blue Card accumulation period',
  ],
  'ES-E01': [
    '西班牙五年连续合法居留与折算',
    'Five continuous lawful years in Spain with eligible credits',
  ],
  'ES-E01-SCOPE': [
    '欧盟长居第三国国民适用范围与禁入核查',
    'Third-country regime scope and entry-alert clearance',
  ],
  'ES-E02': [
    '学习、培训与志愿停留减半折算',
    'Half credit for study, training and volunteering stays',
  ],
  'ES-E03': [
    '欧盟蓝卡跨境累计与近两年西班牙蓝卡',
    'EU Blue Card mobility accumulation and last two years in Spain',
  ],
  'ES-E04': [
    '西班牙已获国际保护的申请等待期折算',
    'Credit for Spanish international protection waiting period',
  ],
  'ES-E05': [
    '欧盟长居固定经常且充足的家庭资源',
    'Stable, regular and sufficient resources for EU long-term residence',
  ],
  'ES-E06': [
    '欧盟长居公共或合规私人医疗保险',
    'Public or authorised private health insurance for EU long-term residence',
  ],
  'ES-E07': [
    '欧盟长居递交机关、证件与递交窗口',
    'Competent office, identity document and filing window for EU status',
  ],
  'ES-E08': [
    '欧盟长居公共秩序、安全与健康审查',
    'Public order, security and health review for EU long-term residence',
  ],
  'ES-E08-CERT': [
    '欧盟长居五年居住国刑事记录证明',
    'Criminal record certificates for EU long-term residence',
  ],
  'ES-E09': [
    '欧盟长居申请费（790-052）',
    'EU long-term residence application fee (790-052)',
  ],
  'ES-M01': [
    '另一成员国欧盟长居身份、证件与递交期限',
    'Other Member State EU long-term status, travel document and filing deadline',
  ],
  'ES-M02': [
    '跨境迁居非营利资金与住所证明',
    'Non-working financial means and accommodation for mobility',
  ],
  'ES-M03': [
    '跨境迁居非营利医疗保险',
    'Health insurance for non-working mobility',
  ],
  'ES-M04': [
    '跨境迁居受雇工作合同、年龄与 SMI 薪资',
    'Employment contract, working age and SMI salary floor',
  ],
  'ES-M05': [
    '跨境迁居雇主税务社保合规与履约资金',
    'Employer tax/social security compliance and solvency',
  ],
  'ES-M06': [
    '跨境迁居自雇开业许可、资质与投资',
    'Self-employment licences, qualifications and investment',
  ],
  'ES-M07': [
    '跨境迁居法定工签豁免事由与正式证明',
    'Statutory work-permit exemption ground and formal evidence',
  ],
  'ES-M08': [
    '跨境迁居拒入禁返核查与治安健康审查',
    'No entry alert or return bar and public-order/health clearance',
  ],
  'ES-M09': [
    '跨境迁居获批后入境与社保登记生效',
    'Post-approval entry and social security activation (alta)',
  ],
  'ES-M09-card': [
    '跨境迁居生效后一个月内申领 TIE',
    'In-person TIE application within one month of effectiveness',
  ],
  'ES-M10': [
    '跨境迁居主申请费（790-052）',
    'Mobility principal application fee (790-052)',
  ],
  'ES-M10-work-fee': [
    '跨境迁居另付工作许可费（如适用）',
    'Separate work authorisation fee where applicable',
  ],
  'ES-M11': [
    '后续转换为西班牙欧盟长居身份',
    'Subsequent conversion to Spanish EU long-term residence',
  ],
  'ES-F01': [
    '随迁家属原成员国共同居住、证件与递交顺序',
    'Prior family unit in issuing state, travel document and filing order',
  ],
  'ES-F01-grant': [
    '随迁家属获批顺序（不早于主申请人）',
    'Principal approved before or alongside the family member',
  ],
  'ES-F02': [
    '法定团聚亲属范围与未成年子女迁居同意',
    'Eligible family relationship and child relocation permission',
  ],
  'ES-F03': [
    '随迁家属家庭固定经常资源',
    'Household financial resources for accompanying family',
  ],
  'ES-F04': [
    '非工作类随迁家属医疗保险覆盖',
    'Health insurance cover for family of non-working holder',
  ],
  'ES-F05': [
    '随迁家属居留申请费（790-052）',
    'Family reunification application fee (790-052)',
  ],
  'ES-F05-effective': [
    '随迁家属获批后三个月内入境生效',
    'Family post-grant entry within three months of notification',
  ],
  'ES-F05-effective-card': [
    '随迁家属生效后一个月内申领 TIE',
    'Family in-person TIE application within one month',
  ],
  'ES-F05-card-fee': [
    '随迁家属 TIE 制卡费（790-012）',
    'Family TIE card issuance fee (790-012)',
  ],
  'ES-R01': [
    '曾持西班牙长居身份与法定恢复事由',
    'Previous Spanish long-term status and statutory recovery ground',
  ],
  'ES-R02': [
    '独立取得原身份或未成年团聚家属恢复边界',
    'Independently obtained status or minor regrouped dependant rule',
  ],
  'ES-R03': [
    '自愿返乡三年承诺期满与短期访西合规',
    'Completion of three-year return commitment and lawful short visits',
  ],
  'ES-R04': [
    '恢复申请递交地、合法停留、护照余期与刑事证明',
    'Recovery filing place, lawful stay, passport validity and criminal records',
  ],
  'ES-R05': [
    '恢复申请公共秩序、安全与健康审查',
    'Public order, security and health clearance for recovery',
  ],
  'ES-R06': [
    '恢复欧盟长居的固定定期充足资源',
    'Fixed and regular resources for EU long-term recovery',
  ],
  'ES-R07': [
    '恢复欧盟长居的合规医疗保险',
    'Health insurance for EU long-term recovery',
  ],
  'ES-R08': [
    '恢复长居申请费（790-052 §2.7）',
    'Long-term residence recovery fee (790-052 §2.7)',
  ],
  'ES-R08-visa': [
    '领馆获批后签证与合法入境',
    'Consular visa and lawful entry after overseas grant',
  ],
  'ES-R09': [
    '恢复获批或入境后一个月内申领 TIE',
    'TIE application within one month of recovery notification or entry',
  ],
  'ES-T01': [
    '长期居留 TIE 首领与到期换卡窗口及卡费',
    'Long-term TIE initial application, renewal window and card fee',
  ],
  'ES-T02': [
    '长期居留身份维持与离境丧失风险',
    'Long-term status retention and absence loss risks',
  ],
  'ES-U01': [
    '欧盟／欧洲经济区／瑞士公民及自由流动家属适用制度',
    'EU/EEA/Swiss citizen or covered free-movement family regime',
  ],
  'ES-U02': [
    '自由流动直系亲属与伴侣关系及扶养条件',
    'Direct family or partner relationship and dependency',
  ],
  'ES-U03': [
    '扩展亲属与稳定伴侣原居住国共居或照料证明',
    'Extended family and durable partner cohabitation or care evidence',
  ],
  'ES-U04': [
    '自由流动五年连续合法居留与年度离境上限',
    'Five years continuous residence and annual absence limits',
  ],
  'ES-U04-basis': [
    '自由流动永久权取得依据（普通、提前或已取得）',
    'Permanent residence acquisition basis (ordinary, early or existing)',
  ],
  'ES-U04-retention': [
    '取得自由流动永久权后连续离西不超过两年',
    'Retention of permanent right without two-year absence from Spain',
  ],
  'ES-U05': [
    '取得永久权前的合资格工作、学生或资源医保期间',
    'Qualifying work, study or resources and comprehensive insurance periods',
  ],
  'ES-U06': [
    '主申请人死亡、离婚或子女就学后的独立保留居留权',
    'Personal retention of residence right after death, divorce or child schooling',
  ],
  'ES-U07': [
    '退休或提前退休提前取得自由流动永久权',
    'Early permanent residence upon retirement',
  ],
  'ES-U08': [
    '永久失能停工提前取得自由流动永久权',
    'Early permanent residence due to permanent incapacity',
  ],
  'ES-U09': [
    '跨境工作者提前取得自由流动永久权',
    'Early permanent residence for cross-border workers',
  ],
  'ES-U10': [
    '提前取得永久权工人的共居家属',
    'Co-resident family member of a worker acquiring early permanent right',
  ],
  'ES-U11': [
    '在职死亡工人的共居家属提前取得永久权',
    'Early permanent residence for family of a worker who died in active service',
  ],
  'ES-U12': [
    '自由流动公共秩序、公共安全与公共健康审查',
    'Free-movement public order, public security and health review',
  ],
  'ES-U13': [
    '永久居留证明或 EX-19 家属永久卡与费用',
    'Permanent residence certificate or EX-19 family card and fee',
  ],
  'ES-TRANSITION': [
    '新《外国人条例》施行前历史申请的适用法规与过渡选择',
    'Applicable law and transitional election for historical applications',
  ],
} as const;

// Labels for the fields of nested policy parameters, with their units.
export const spainParameterLabels: Record<
  string,
  Record<string, readonly [string, string]>
> = {
  nationalityYears: {
    general: ['一般（年）', 'General (years)'],
    refugee: ['难民（年）', 'Refugee (years)'],
    ibero: [
      '伊比利亚美洲等原始国籍或塞法迪人（年）',
      'Ibero-American or other listed origin, or Sephardic (years)',
    ],
    marriage: ['西班牙公民配偶（年）', 'Spouse of a Spanish citizen (years)'],
    'one-year': ['其他一年居留情形（年）', 'Other one-year grounds (years)'],
  },
  euAbsenceMonths: {
    single: ['单次离境上限（月）', 'Single absence limit (months)'],
    total: ['累计离境上限（月）', 'Total absence limit (months)'],
  },
  blueAbsenceMonths: {
    single: ['单次离境上限（月）', 'Single absence limit (months)'],
    total: ['累计离境上限（月）', 'Total absence limit (months)'],
  },
  blueMobilityMonths: {
    first: [
      '首次跨境迁居前持卡（月）',
      'Months on the card before a first move',
    ],
    subsequent: [
      '此前已迁居过时持卡（月）',
      'Months on the card before a later move',
    ],
  },
  familyResourceFactors: {
    baseSize: ['基准家庭人数', 'Base household size'],
    base: ['基准家庭的 IPREM 倍数', 'IPREM multiple for the base household'],
    additional: [
      '每多一人加计的 IPREM 倍数',
      'Added IPREM multiple per extra member',
    ],
  },
  imvReductionFactors: {
    base: [
      '未成年减额参照的年度 IMV 倍数',
      'Multiple of annual IMV for the minor-child reduction',
    ],
    additional: [
      '每多一名未成年加计的倍数',
      'Added multiple per additional minor',
    ],
  },
  mobilityNonWorkingFactors: {
    applicant: ['申请人的 IPREM 倍数', "Applicant's IPREM multiple"],
    dependant: ['每名受扶养人的 IPREM 倍数', "Each dependant's IPREM multiple"],
  },
  employerSmiFactors: {
    single: ['单人家庭的 SMI 倍数', 'SMI multiple for a one-person household'],
    pair: ['两人家庭的 SMI 倍数', 'SMI multiple for a two-person household'],
    pairSize: [
      '两人档对应的家庭人数',
      'Household size for the two-person rate',
    ],
    extra: ['每多一人加计的 SMI 倍数', 'Added SMI multiple per extra member'],
  },
  employmentAge: {
    minimum: ['最低就业年龄', 'Minimum working age'],
    unrestricted: [
      '不受未成年限制的就业年龄',
      'Working age without restrictions for minors',
    ],
  },
  reunificationAge: {
    adult: ['子女成年年龄', 'Age of majority for children'],
    ascendant: ['直系尊亲属年龄下限', 'Minimum age for ascendants'],
  },
  tieRenewal: {
    age: ['卡有效期分界年龄', 'Age at which card validity changes'],
    olderYears: [
      '达到该年龄后的卡有效期（年）',
      'Card validity from that age (years)',
    ],
    earlyMonths: [
      '到期前最早可申请（月）',
      'Earliest application before expiry (months)',
    ],
    lateMonths: [
      '到期后最晚可申请（月）',
      'Latest application after expiry (months)',
    ],
  },
  statusLoss: {
    euMonths: [
      '离开欧盟致丧失长居（月）',
      'Absence from the EU ending status (months)',
    ],
    blueMonths: [
      '前蓝卡持有人及家属离开欧盟（月）',
      'Absence from the EU for former Blue Card families (months)',
    ],
    spainYears: [
      '欧盟长居离开西班牙（年）',
      'Absence from Spain for EU status (years)',
    ],
    hearingDays: ['听取陈述期限（日）', 'Time to respond (days)'],
    decisionMonths: ['丧失程序决定期限（月）', 'Decision period (months)'],
  },
  returnCommitment: {
    years: ['自愿返乡承诺期（年）', 'Voluntary return undertaking (years)'],
    visitMonths: [
      '承诺期内每次访西上限（月）',
      'Each visit during the undertaking, at most (months)',
    ],
  },
  euFamily: {
    dependentAge: [
      '后代无需证明受扶养的年龄上限',
      'Descendants under this age need no proof of dependency',
    ],
    householdMonths: [
      '扩展亲属共同生活（月）',
      'Extended relative shared household (months)',
    ],
    partnerYears: [
      '稳定伴侣共同生活（年）',
      'Durable partner cohabitation (years)',
    ],
  },
  freeMovementResidence: {
    years: ['连续居住（年）', 'Continuous residence (years)'],
    annualAwayMonths: ['每年离境上限（月）', 'Annual absence limit (months)'],
    importantMonths: [
      '重要事由单次离境上限（月）',
      'Single absence for important reasons (months)',
    ],
    lossYears: [
      '取得后连续离境致丧失（年）',
      'Consecutive absence ending the right (years)',
    ],
  },
  retainedWorker: {
    longEmploymentYears: [
      '失业前受雇超过（年）',
      'Employment before unemployment, more than (years)',
    ],
    shortEmploymentMonths: [
      '短期受雇或受雇之初（月）',
      'Short or early employment (months)',
    ],
    retainedMonths: [
      '短期受雇后保留工作者身份（月）',
      'Worker status kept after short employment (months)',
    ],
  },
  euRetention: {
    beforeDeathYears: [
      '主申请人去世前在西居住（年）',
      'Residence in Spain before the sponsor died (years)',
    ],
    relationshipYears: [
      '婚姻或伴侣关系存续（年）',
      'Marriage or partnership duration (years)',
    ],
    inSpainYears: ['其中在西班牙（年）', 'Of which in Spain (years)'],
  },
  earlyPermanent: {
    retirementWorkMonths: [
      '退休前在西从业（月）',
      'Work in Spain before retirement (months)',
    ],
    retirementResidenceYears: [
      '退休前连续居住超过（年）',
      'Residence before retirement, more than (years)',
    ],
    incapacityYears: [
      '失能前连续居住超过（年）',
      'Residence before incapacity, more than (years)',
    ],
    crossBorderYears: [
      '跨境工作前在西工作和居住（年）',
      'Work and residence before cross-border work (years)',
    ],
    deathYears: [
      '工人去世前连续居住（年）',
      "Worker's residence before death (years)",
    ],
  },
  retirementTable: {
    year: ['适用年度', 'Year'],
    contributionMonths: [
      '适用较低退休年龄的缴费月数',
      'Contribution months for the lower retirement age',
    ],
    ageMonths: [
      '缴费达标时的退休年龄（月）',
      'Retirement age with that record (months)',
    ],
    otherAgeMonths: [
      '其他情形的退休年龄（月）',
      'Retirement age otherwise (months)',
    ],
  },
  euDocument: {
    photos: ['家属卡照片（张）', 'Photographs for a family card'],
    earlyMonths: [
      '到期前最早可申请（月）',
      'Earliest application before expiry (months)',
    ],
    lateMonths: [
      '到期后最晚可申请（月）',
      'Latest application after expiry (months)',
    ],
    issueMonths: ['受理后发卡期限（月）', 'Card issued within (months)'],
    cardYears: ['家属卡有效期（年）', 'Family card validity (years)'],
  },
};
