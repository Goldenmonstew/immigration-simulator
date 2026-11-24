export const zhCN = {
  'jp.policy.title': '日本现行及已公布规则',
  'jp.policy.naturalisationChange': '帰化居住与融和审查调整',
  'jp.policy.naturalisationSummary':
    '法务局的审查实务考虑居住时间和在日本的融和情况，分别核对国籍法规定的条件。',
  'jp.policy.feeChange': '永住许可手续费调整',
  'jp.policy.feeSummary':
    '永住许可手续费按受理日期确定。符合条件的申请人可以申请人道减额。',
  'jp.policy.guidelineChange': '新版永住许可指南开始适用',
  'jp.policy.guidelineSummary':
    '按递交日期适用新版指南，核对在留、出境、语言、生活规则与适龄子女就学等事项。',
  'jp.whatif.date': '拟递交日期',
  'jp.whatif.dateEvidence':
    '改动递交日后，需要重新确认与原日期绑定的证据，例如当天是否在日本、在留是否有效、高度人材积分。要补录，请在问卷中先设定新递交日，再填写相应证据。',
  'jp.whatif.prJapanese': '入管已认可永住所需的日语能力',
  'jp.whatif.natJapanese': '法务局已认可帰化所需的日语能力',
  'jp.whatif.interview': '已完成法务局面谈及适用评估',
  'jp.whatif.prIncome': '申请人年收入（日元）',
  'jp.whatif.prHousehold': '入管已确认世带收入符合要求',
  'jp.whatif.natLivelihood': '已确认帰化生计条件',
  'jp.whatif.noTrips': '假设在留期间没有出境记录',
  'jp.whatif.return.ordinary': '使用普通再入国許可的返日日期',
  'jp.whatif.return.deemed': '使用みなし再入国許可的返日日期',
  'jp.whatif.return.refugee-travel-document': '持難民旅行証明書的返日日期',
  'jp.whatif.invalidIncome': '请输入零或正整数金额（日元）。',
  'jp.whatif.invalidDates': '调整后的日期与问卷资料冲突，请核对日期和行程。',
  'jp.result.plannedDeparture':
    '拟于 {date} 出境。请在出境时向入国审查官表明返日意图。',
};

export const en: Record<keyof typeof zhCN, string> = {
  'jp.policy.title': 'Japan’s current and published rules',
  'jp.policy.naturalisationChange':
    'Revised residence and integration review for naturalisation',
  'jp.policy.naturalisationSummary':
    'Legal Affairs Bureaux consider residence and integration in Japan alongside the statutory conditions in the Nationality Act.',
  'jp.policy.feeChange': 'Revised permanent residence fees',
  'jp.policy.feeSummary':
    'The filing date determines the applicable permission fee. Eligible applicants can request a humanitarian reduction.',
  'jp.policy.guidelineChange':
    'Revised permanent residence guidelines take effect',
  'jp.policy.guidelineSummary':
    'The filing date determines when the new guidance applies to residence, absences, Japanese language, knowledge of everyday rules and school attendance.',
  'jp.whatif.date': 'Proposed filing date',
  'jp.whatif.dateEvidence':
    'Changing the filing date clears evidence tied to the previous date, such as presence in Japan, lawful status and highly skilled points. Set the new filing date in the questionnaire before entering the evidence for your route.',
  'jp.whatif.prJapanese':
    'Immigration has confirmed Japanese ability for permanent residence',
  'jp.whatif.natJapanese':
    'The bureau has confirmed Japanese ability for naturalisation',
  'jp.whatif.interview': 'Bureau interview and applicable assessment completed',
  'jp.whatif.prIncome': 'Applicant’s annual income (JPY)',
  'jp.whatif.prHousehold':
    'Immigration has confirmed that household income meets the requirement',
  'jp.whatif.natLivelihood': 'Means of support confirmed for naturalisation',
  'jp.whatif.noTrips': 'Assume no trips abroad during residence',
  'jp.whatif.return.ordinary': 'Return date using an ordinary re-entry permit',
  'jp.whatif.return.deemed': 'Return date using deemed re-entry',
  'jp.whatif.return.refugee-travel-document':
    'Return date using a refugee travel document',
  'jp.whatif.invalidIncome': 'Enter a whole amount in yen, zero or above.',
  'jp.whatif.invalidDates':
    'The changed dates conflict with the questionnaire. Check the dates and itinerary.',
  'jp.result.plannedDeparture':
    'Planned departure on {date}. Declare the intention to return to the immigration officer at departure.',
};

export const japanConditionTitles = {
  'jp.pr.continuous-stay': ['连续在留', 'Continuous stay'],
  'jp.pr.qualifying-status-stay': [
    '合资格在留年限',
    'Years with a qualifying status',
  ],
  'jp.pr.old-guideline-absences': [
    '旧指南下的出境记录',
    'Absences under the earlier guidelines',
  ],
  'jp.pr.single-absence': ['单次出境时长', 'Duration of an individual absence'],
  'jp.pr.total-absence': ['累计出境时长', 'Cumulative duration of absences'],
  'jp.pr.filing-in-japan': ['在日本递交', 'Filing in Japan'],
  'jp.pr.lawful-filing-status': [
    '在日身份及申请',
    'Status and filing in Japan',
  ],
  'jp.pr.longest-period': [
    '现持最长在留期间',
    'Longest grant for current status',
  ],
  'jp.pr.good-conduct': ['法定品格', 'Statutory good conduct'],
  'jp.pr.criminal-record': ['刑事及少年处分', 'Criminal and juvenile record'],
  'jp.pr.national-interest': [
    '日本国利益及生活本拠',
    'Japan’s national interest and main home',
  ],
  'jp.pr.immigration-duties': [
    '入管义务及活动合规',
    'Immigration duties and permitted activities',
  ],
  'jp.pr.tax': ['国税与地方税', 'National and local tax'],
  'jp.pr.pension-payments': [
    '公的年金与缴付',
    'Public pension and timely payment',
  ],
  'jp.pr.public-health-insurance': [
    '公的医疗保险与缴付',
    'Public health insurance and timely payment',
  ],
  'jp.pr.address-registration': [
    '实际住所及住址登记',
    'Actual address and registration',
  ],
  'jp.pr.independent-livelihood': ['独立生计', 'Independent livelihood'],
  'jp.pr.household-income': [
    '新版世带收入水平',
    'Revised household income standard',
  ],
  'jp.pr.projected-pension': [
    '预计年金及金融资产补足',
    'Projected pension and supplementary assets',
  ],
  'jp.pr.public-burden': [
    '公共负担及人道因素',
    'Public burden and humanitarian circumstances',
  ],
  'jp.pr.public-health': ['公衆衛生与健康', 'Public health grounds'],
  'jp.pr.landing-and-security': [
    '上陸拒否与治安安全',
    'Landing and security grounds',
  ],
  'jp.pr.status-criteria': [
    '现有资格实体条件及雇主',
    'Current status criteria and employer',
  ],
  'jp.pr.guarantor': ['在日身元保証人', 'Guarantor residing in Japan'],
  'jp.pr.japanese-language': [
    '新版日语能力',
    'Revised Japanese language factor',
  ],
  'jp.pr.life-rules': [
    '制度与生活规则理解',
    'Understanding institutions and everyday rules',
  ],
  'jp.pr.school-attendance': [
    '学龄本人或子女就学',
    'School attendance for applicant or children',
  ],
  'jp.pr.filing-documents': ['窗口递交人与材料', 'Counter filer and documents'],
  'jp.pr.approval-fee': ['永住许可费', 'Permanent residence fee'],
  'jp.pr.fee-reduction': ['人道减额', 'Humanitarian fee reduction'],
  'jp.pr.integrated-card-fee': [
    '可选一体在留卡收费',
    'Optional integrated residence card fee',
  ],
  'jp.pr.special-permission': [
    '特别许可与新版捷径',
    'Special permission and revised exceptions',
  ],
  'jp.pr.married-life': ['婚姻共同生活期间', 'Duration of married life'],
  'jp.pr.qualifying-family': [
    '符合路径的亲属身份',
    'Qualifying family relationship',
  ],
  'jp.pr.birth-filing-window': [
    '出生后取得在留资格的递交期限',
    'Filing window after birth',
  ],
  'jp.pr.birth-acquisition': [
    '在日出生与资格取得',
    'Birth in Japan and acquisition of status',
  ],
  'jp.pr.birth-registration': ['出生届', 'Birth registration'],
  'jp.pr.long-term-resident': ['定住者身份', 'Long-term resident status'],
  'jp.pr.recognised-protection': [
    '难民或补完的保护认定',
    'Recognised refugee or complementary protection',
  ],
  'jp.pr.hsp-current-points': [
    '递交日高度人材积分',
    'Highly skilled points at filing',
  ],
  'jp.pr.hsp-history': [
    '历史积分及连续保持',
    'Historical points and continuous maintenance',
  ],
  'jp.pr.j-skip-current': [
    '递交日特別高度人材基准',
    'J-Skip criteria at filing',
  ],
  'jp.pr.j-skip-history': [
    'J-Skip 认定或历史基准',
    'J-Skip recognition or retrospective criteria',
  ],
  'jp.pr.international-protection': [
    '国际机构推荐与获准上陆',
    'International protection recommendation and landing approval',
  ],
  'jp.pr.regional-regeneration': [
    '地域再生計画及指定活动',
    'Regional regeneration plan and designated activity',
  ],
  'jp.pr.structural-zone': [
    '特区特定事业及贡献',
    'Special-zone business and contribution',
  ],
  'jp.pr.recognised-contribution': [
    '获认定的対日貢献',
    'Recognised contribution to Japan',
  ],
  'jp.nat.foreign-national': ['外国人申请身份', 'Foreign applicant'],
  'jp.nat.lawful-domicile': [
    '申请时的合法日本住所',
    'Lawful domicile in Japan',
  ],
  'jp.nat.domicile-years': ['连续住所年限', 'Years of continuous domicile'],
  'jp.nat.age-and-capacity': [
    '年龄及本国法行为能力',
    'Age and capacity under home law',
  ],
  'jp.nat.good-conduct': ['法定素行善良', 'Statutory good conduct'],
  'jp.nat.livelihood': ['共同生计', 'Means of support'],
  'jp.nat.nationality-loss': [
    '防止重国籍',
    'Avoidance of multiple nationality',
  ],
  'jp.nat.nationality-loss-exception': [
    '不能失籍的法定例外',
    'Exception where loss is beyond the applicant’s control',
  ],
  'jp.nat.constitutional-condition': ['宪法遵守', 'Constitutional condition'],
  'jp.nat.residence-practice': [
    '审查运用在留年限',
    'Residence under review practice',
  ],
  'jp.nat.integration': ['融入日本社会', 'Integration into Japanese society'],
  'jp.nat.japanese-language': [
    '日语会话、阅读与书写',
    'Spoken and written Japanese',
  ],
  'jp.nat.interview-and-assessment': [
    '法务局面谈与指定评估',
    'Bureau interview and applicable assessment',
  ],
  'jp.nat.tax': ['税务缴付', 'Tax payments'],
  'jp.nat.pension-payments': ['公的年金缴付', 'Public pension payments'],
  'jp.nat.public-health-insurance': [
    '公的医疗保险缴付',
    'Public health insurance payments',
  ],
  'jp.nat.housing-and-health-evidence': [
    '住房与医保材料',
    'Housing and public health insurance evidence',
  ],
  'jp.nat.motivation-and-oath': [
    '动机书与宣誓',
    'Motivation statement and oath',
  ],
  'jp.nat.filing-and-documents': [
    '递交人、法务局及申请材料',
    'Filer, competent bureau and required documents',
  ],
  'jp.nat.application-fee': ['帰化申请费', 'Naturalisation application fee'],
  'jp.nat.gazette-and-family-registration': [
    '官報生效与帰化届',
    'Gazette commencement and family registration',
  ],
  'jp.nat.filing-in-japan': ['在日本递交', 'Filing in Japan'],
  'jp.nat.spouse-article-7': [
    '第7条日本国民配偶者',
    'Article 7 spouse of a Japanese national',
  ],
  'jp.nat.former-national-child': [
    '第6条 · 曾为日本国民者的亲生子女',
    'Article 6 · biological child of a former national',
  ],
  'jp.nat.japan-birth': [
    '第6条 · 出生地与居住条件',
    'Article 6 · birthplace and residence',
  ],
  'jp.nat.long-residence': ['第6条 · 长期居所', 'Article 6 · long residence'],
  'jp.nat.japanese-child': [
    '第8条 · 日本国民的亲生子女',
    'Article 8 · biological child of a Japanese national',
  ],
  'jp.nat.adopted-child': [
    '第8条 · 日本国民的养子女',
    'Article 8 · adopted child of a Japanese national',
  ],
  'jp.nat.former-national': [
    '第8条 · 曾持日本国籍',
    'Article 8 · former Japanese nationality',
  ],
  'jp.nat.stateless-from-birth': [
    '第8条 · 出生时起无国籍',
    'Article 8 · stateless from birth',
  ],
  'jp.nat.special-merit': [
    '对日特別功労与国会承认',
    'Special merit and approval of the Diet',
  ],
  'jp.reentry.ordinary-eligibility': [
    '普通再入国资格与材料',
    'Ordinary permit eligibility and documents',
  ],
  'jp.reentry.ordinary-validity': [
    '普通许可期限与延期',
    'Ordinary validity and extension',
  ],
  'jp.reentry.online-application': [
    '再入国在线渠道',
    'Online re-entry application',
  ],
  'jp.reentry.return-continuity': [
    '返日及在留连续性',
    'Return and continuity of status',
  ],
  'jp.reentry.travel-fee': ['旅行手续基础费', 'Base travel procedure fee'],
  'jp.reentry.consular-extension-fee': [
    '境外延期领事费',
    'Overseas consular extension fee',
  ],
  'jp.reentry.deemed-eligibility': [
    'みなし再入国资格与出境表明',
    'Deemed re-entry eligibility and departure declaration',
  ],
  'jp.reentry.deemed-validity': ['みなし再入国期限', 'Deemed re-entry period'],
  'jp.reentry.refugee-document': ['難民旅行証明書', 'Refugee travel document'],
  'jp.reentry.refugee-document-validity': [
    '难民旅行证件期限及延期',
    'Validity and extension of refugee travel document',
  ],
} as const;
