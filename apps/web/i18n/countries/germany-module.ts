export const zhCN = {
  'de.policy.title': '德国现行法律',
  'de.policy.pageTitle': '德国政策依据',
  'de.policy.skilledChange': '技术人员定居年限与养老缴费期下调',
  'de.policy.skilledSummary':
    '《技术移民法》改革生效后，§ 18c Abs. 1 技术人员定居年限由 4 年降至 3 年（养老缴费 36 个月），德国毕业档为 2 年（24 个月）。',
  'de.policy.starmodgChange': '国籍法现代化法（StARModG）生效',
  'de.policy.starmodgSummary':
    'StAG § 10 一般入籍的合法惯常居住年限由 8 年改为 5 年，放宽多重国籍限制，并完善全职工作生计例外与历史责任声明要求。',
  'de.policy.turboChange': '取消 3 年加速入籍条款',
  'de.policy.turboSummary':
    'BGBl. 2025 I Nr. 256 删除了 StAG § 10 Abs. 3 的 3 年特别融合加速入籍路径，一般入籍统一适用 5 年居住要求。',
  'de.policy.cardFeeChange': '身份证件与关联居留文书收费标准更新',
  'de.policy.cardFeeSummary':
    'PAuswGebV 修订自 2026-02-07 起调整身份证费率（24 岁以下 €27.60，24 岁及以上 €46.00），并联动影响非欧盟家属永久居留卡与协定权利人收费。',
  'de.policy.protectionNoticeChange': '难民定居的 BAMF 机关间通知条件修订',
  'de.policy.protectionNoticeSummary':
    'BGBl. 2026 I Nr. 111 修订 AufenthG § 26 Abs. 3，自 2026-06-12 起区分难民定居普通档与加速档对 BAMF 剥夺（Entzug）、废止与撤回通知的核查标准。',
  'de.whatif.date': '模拟日期',
  'de.whatif.noTrips': '假设居留期间没有出境记录',
  'de.whatif.dateHint':
    '改到更晚的日期时，养老缴费月数和蓝卡月数按结果页预计日期的同一口径推算：下方填的月数截至问卷模拟日，之后每满一个月加 1（蓝卡月数只计持有蓝卡的月份）。改动日期后，按原模拟日确认的「有效期覆盖模拟日」、§ 81 续期效力和决定日持有蓝卡改按待确认处理，依赖它们的路径显示待确认，而结果页的预计日期沿用这些确认；要按新日期核对，请回到问卷改模拟日期并重新确认。',
  'de.whatif.factAfterDate':
    '这个日期早于问卷中已发生事项的日期（如首次入境日），请改晚，或回到问卷修改。',
  'de.whatif.noTripsHint':
    '清空出境记录、逐份文书与自由流动的离境记录；在德长大子女的境外上学天数按 0 计；欧盟长期居留的离欧区间按前一段居留类别计入，最早一段离欧区间前面没有居留类别，保持不变。',
  'de.whatif.mixed': '保持问卷中的原答案',
  'de.whatif.provenGerman': '定居：已获认可的德语等级（CEFR）',
  'de.whatif.knowledge': '定居：LiD 考试答对题数（0–33）',
  'de.whatif.contributions': '法定或可比养老保险已缴月数',
  'de.whatif.blueCardMonths': '欧盟蓝卡合格就业并同期缴费月数',
  'de.whatif.salary': '决定日可计税前年薪（欧元）',
  'de.whatif.livelihoodConfirmed':
    '定居：家庭生计稳定且不依赖 SGB II / XII 福利',
  'de.whatif.blueCardItemised':
    '蓝卡就业月数按问卷中的逐段就业记录计算；如需调整，请回到问卷修改就业记录。',
  'de.whatif.natGerman': '入籍：德语证明等级（CEFR）',
  'de.whatif.natKnowledge': '入籍：入籍考试或 LiD 答对题数（0–33）',
  'de.whatif.natLivelihood':
    '入籍：本人及家属生计可持续保障，且未领取 SGB II / XII 福利',
  'de.whatif.invalidDate': '请填写有效的模拟日期。',
  'de.whatif.invalidMonths': '请填写不小于 0 的整数月数。',
  'de.whatif.invalidScore': '请填写 0 至 33 之间的整数题数。',
  'de.whatif.invalidSalary': '请填写不小于 0 的年薪金额（欧元）。',
  'de.result.finishQuestionnaire':
    '请返回问卷，完成所选路径的必填项目后再查看结果。',
  'de.result.earliest': '预计满足评估条件的日期',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'de.policy.title': 'Current German law',
  'de.policy.pageTitle': 'Policy basis for Germany',
  'de.policy.skilledChange':
    'Reduced residence and pension periods for skilled worker settlement',
  'de.policy.skilledSummary':
    'Under the skilled immigration reform, § 18c Abs. 1 skilled worker settlement requires 3 years of residence and 36 months of pension contributions, or 2 years and 24 months for qualifying German graduates.',
  'de.policy.starmodgChange':
    'Act to Modernise Nationality Law (StARModG) takes effect',
  'de.policy.starmodgSummary':
    'StAG § 10 ordinary naturalisation requires 5 years of lawful habitual residence instead of 8, permits multiple nationality and updates the full-time work livelihood exception and historical-responsibility declaration.',
  'de.policy.turboChange':
    'Repeal of the 3-year accelerated naturalisation route',
  'de.policy.turboSummary':
    'BGBl. 2025 I Nr. 256 repealed StAG § 10 Abs. 3, removing the 3-year special-integration track so ordinary naturalisation uniformly requires 5 years of residence.',
  'de.policy.cardFeeChange':
    'Updated identity card and linked residence document fee schedule',
  'de.policy.cardFeeSummary':
    'The PAuswGebV amendment effective 2026-02-07 updated identity card charges (€27.60 under age 24, €46.00 at age 24 or over), affecting non-EU family permanent residence cards and association-right fees.',
  'de.policy.protectionNoticeChange':
    'Revised BAMF notification rules for refugee settlement',
  'de.policy.protectionNoticeSummary':
    'BGBl. 2026 I Nr. 111 amended AufenthG § 26 Abs. 3 from 2026-06-12, distinguishing ordinary and accelerated refugee settlement checks for BAMF deprivation, revocation and withdrawal notifications.',
  'de.whatif.date': 'Simulation date',
  'de.whatif.noTrips': 'Assume no trips abroad during residence',
  'de.whatif.dateHint':
    'For a later date, pension and Blue Card months are counted as for the result page’s projected date: the months below are as of the questionnaire’s simulation date, plus one for each full month after it (Blue Card months only while the card is held). After a date change, confirmations made for the original date (validity covering the simulation date, § 81 continuation and holding the Blue Card on the decision date) are treated as pending, so routes relying on them show as pending, whereas the result page’s projected date keeps them. To check them for the new date, change the simulation date in the questionnaire and confirm them again.',
  'de.whatif.factAfterDate':
    'This date is before a fact recorded in the questionnaire (such as the first entry). Choose a later date or edit the questionnaire.',
  'de.whatif.noTripsHint':
    'Clears trips, per-document departures and free movement absences; counts no school days abroad for a child raised in Germany; periods outside the EU for EU long-term residence count under the preceding status, and an earliest period outside the EU, with no status before it, stays as it is.',
  'de.whatif.mixed': 'Keep the questionnaire answers',
  'de.whatif.provenGerman': 'Settlement: recognised German level (CEFR)',
  'de.whatif.knowledge': 'Settlement: correct answers in the LiD test (0–33)',
  'de.whatif.contributions':
    'Months of statutory or comparable pension contributions',
  'de.whatif.blueCardMonths':
    'Months of qualifying EU Blue Card employment with pension contributions',
  'de.whatif.salary':
    'Countable annual gross salary on the decision date (EUR)',
  'de.whatif.livelihoodConfirmed':
    'Settlement: sustainable household livelihood without SGB II / XII benefits',
  'de.whatif.blueCardItemised':
    'Blue Card employment months come from the itemised employment record. Edit those records in the questionnaire to change them.',
  'de.whatif.natGerman': 'Naturalisation: German evidence level (CEFR)',
  'de.whatif.natKnowledge':
    'Naturalisation: correct answers in the naturalisation test or LiD (0–33)',
  'de.whatif.natLivelihood':
    'Naturalisation: sustainable livelihood for the applicant and dependants without SGB II / XII benefits',
  'de.whatif.invalidDate': 'Enter a valid simulation date.',
  'de.whatif.invalidMonths': 'Enter a whole number of months of 0 or more.',
  'de.whatif.invalidScore':
    'Enter a whole number of correct answers from 0 to 33.',
  'de.whatif.invalidSalary':
    'Enter an annual salary amount in EUR of 0 or more.',
  'de.result.finishQuestionnaire':
    'Return to the questionnaire and complete the required fields for your selected pathways to see your result.',
  'de.result.earliest': 'Projected date the assessed requirements are met',
};

export const germanyConditionTitles = {
  'DE-C01': [
    '身份、国籍、认可证件和申请代理',
    'Identity, nationality, accepted documents and representation',
  ],
  'DE-C01-procedure': [
    '提交所需证明并配合到场、采集证件资料',
    'Evidence, attendance and document formalities',
  ],
  'DE-C02': [
    '入境签证、境内申请资格或豁免',
    'Entry visa, domestic application or exemption',
  ],
  'DE-C03': [
    '可持续负担家庭生活、暖租及必要保费',
    'Sustainable support for the household, warm rent and insurance',
  ],
  'DE-C04': [
    '本人及相关家属的医疗保障或适用豁免',
    'Health cover for the applicant and relevant family members or an applicable waiver',
  ],
  'DE-C05': [
    '本人、同住配偶的养老记录或法定免除',
    'Pension record, cohabiting spouse’s contributions or exemption',
  ],
  'DE-C06': [
    '驱逐事由、公共安全与在办调查',
    'Expulsion grounds, public security and pending investigations',
  ],
  'DE-C06-authority': [
    '主管机关的安全核查结果',
    'Authority security clearance',
  ],
  'DE-C07': [
    '受雇许可和长期执业资格',
    'Employment and permanent professional authorisation',
  ],
  'DE-C08': [
    '德语证明（B1 / A2 / C1）或获准豁免',
    'German evidence (B1 / A2 / C1) or exemption',
  ],
  'DE-C09': [
    '法律、社会秩序与德国生活知识',
    'Knowledge of the legal and social order and life in Germany',
  ],
  'DE-C10': [
    '符合当地居住面积、质量和占用标准',
    'Housing meets local space, quality and occupancy standards',
  ],
  'DE-C11': [
    '主要住所、登记证明和受理机关',
    'Principal address, registration evidence and jurisdiction',
  ],
  'DE-C11-deadline': ['入住登记期限', 'Residence registration deadline'],
  'DE-C12': [
    '历史居留文件与过渡条款',
    'Historical permits and transitional provisions',
  ],
  'DE-C13': [
    '一般定居居留与许可期间（§ 9 Abs. 2 Nr. 1, Abs. 4）',
    'General settlement residence and permit period (§ 9 Abs. 2 Nr. 1, Abs. 4)',
  ],
  'DE-C15': [
    '符合 Fachkraft 法定资格，具备认可的职业或学术资格',
    'Recognised professional or academic qualification as a skilled worker',
  ],
  'DE-C15-time': [
    '技术人员持证期间（§ 18c Abs. 1 Satz 1 Nr. 1, Satz 2）',
    'Skilled worker permit period (§ 18c Abs. 1 Satz 1 Nr. 1, Satz 2)',
  ],
  'DE-C16': [
    '目前实际从事许可涵盖的合格工作或科研',
    'Currently employed in a qualifying job or research position',
  ],
  'DE-C16-initial': [
    '首次申请 §§ 18a/b 时的岗位、认可、执业许可、就业同意与年龄工资档',
    'Job, recognition, licences, employment approval, age and salary for a first §§ 18a/b permit',
  ],
  'DE-C17': [
    '本人养老缴费（通常 36 个月，德国毕业档 24 个月）或认可替代',
    'Own pension contributions (36 months, or 24 for qualifying German graduates) or an accepted alternative',
  ],
  'DE-C19': ['决定日仍持有效蓝卡', 'A current EU Blue Card at decision'],
  'DE-C19-months': [
    '合格就业与同期养老缴费月数',
    'Qualifying employment months with matching pension contributions',
  ],
  'DE-C19-time': [
    '蓝卡定居居留与就业时间线（§ 18c Abs. 2）',
    'Blue Card settlement residence and employment timeline (§ 18c Abs. 2)',
  ],
  'DE-C20': [
    '蓝卡定居档对应的德语证明',
    'German evidence for the selected Blue Card tier',
  ],
  'DE-C21-job': [
    '当前岗位、合同期限、职业许可与签发排除',
    'Current job, contract term, professional licence and exclusions',
  ],
  'DE-C21-pay': [
    '按决定年份核定工资、资格与低档批准',
    'Pay, qualifications and lower-band approval in the decision year',
  ],
  'DE-C22': [
    '与德国公民在德国继续实际家庭生活，并符合对应的亲属身份',
    'Continuing family life in Germany with the German citizen in a qualifying family relationship',
  ],
  'DE-C22-time': [
    '德国公民家属持证期间（§ 28 Abs. 2）',
    'German family permit period (§ 28 Abs. 2)',
  ],
  'DE-C24-title': [
    '目前持法定保护或重新安置许可，并符合相应撤回限制',
    'Current qualifying protection or resettlement permit and applicable withdrawal condition',
  ],
  'DE-C24-notice': [
    '已核实 BAMF 未发出适用档次所列的机关间通知',
    'BAMF confirmed no inter-agency notification barring this band',
  ],
  'DE-C25': [
    '达到难民普通档的生计要求或适用法定豁免',
    'Livelihood is predominantly secured or a statutory exemption applies',
  ],
  'DE-C25-time': [
    '难民定居普通档持证期间（§ 26 Abs. 3 Sätze 1–2）',
    'Refugee settlement ordinary-tier period (§ 26 Abs. 3 Sätze 1–2)',
  ],
  'DE-C26': [
    '达到难民加速档的较高生计要求',
    'Livelihood is secured to the higher accelerated-band standard',
  ],
  'DE-C26-time': [
    '难民定居加速档持证期间（§ 26 Abs. 3 Sätze 3–4）',
    'Refugee settlement accelerated-tier period (§ 26 Abs. 3 Sätze 3–4)',
  ],
  'DE-C27': [
    '现持身份符合长期居留法对临时居留、外交和保护身份的规定',
    'No exclusion for a temporary, diplomatic, protection or other excluded residence status',
  ],
  'DE-C28': [
    '欧盟长期居留五年持证与出境限制（§§ 9a Abs. 2 Nr. 1, 9b）',
    'Five-year residence and absence period for EU long-term residence (§§ 9a Abs. 2 Nr. 1, 9b)',
  ],
  'DE-C29-income': [
    '本人和法定扶养家属有可持续的固定、规律收入',
    'Fixed and regular income for the applicant and legal dependants',
  ],
  'DE-C29-tax': ['已履行适用税务义务', 'Applicable tax obligations fulfilled'],
  'DE-C29-work': [
    '以工作获得收入时，本人或同住配偶具备所需就业及执业许可',
    'Required work and professional licences where regular income is earned through work, including the cohabiting spouse alternative',
  ],
  'DE-C30-pension': [
    '本人或同住配偶的预期养老足够，或因疾病、残障不能满足',
    'Adequate retirement provision of the applicant or cohabiting spouse, or the medical exception',
  ],
  'DE-C30-care': [
    '本人及适用家属的医疗和护理风险均有法定或认可的长期保险保障',
    'Statutory or accepted lasting cover for illness and long-term care for the applicant and relevant family',
  ],
  'DE-C32-title': [
    '目前持第 5 节许可，可按 § 26 Abs. 4 办理',
    'Current Section 5 residence permit within § 26(4)',
  ],
  'DE-C32-time': [
    '持证年限达到要求，计入符合条件的先前庇护程序',
    'Required permit period including the qualifying preceding asylum procedure',
  ],
  'DE-C32-discretion': [
    '人道定居的主管机关裁量决定',
    'Discretionary decision on humanitarian settlement',
  ],
  'DE-C34-title': [
    '目前持 § 21 企业经营许可',
    'Current § 21 entrepreneurial permit',
  ],
  'DE-C34-time': [
    '在合格许可下连续实际经营达到法定年限',
    'Required period of continuous actual business operation under the qualifying permit',
  ],
  'DE-C34-initial': [
    '首次企业许可的经济依据、融资及适用的养老要求',
    'Economic basis, financing and applicable old-age provision for a first business permit',
  ],
  'DE-C35-business': [
    '现有经营的成功和期间足以证明业务能够持续发展',
    'Success and duration of the existing business support sustainable future development',
  ],
  'DE-C35-discretion': [
    '企业经营定居的主管机关裁量决定',
    'Discretionary decision on entrepreneurial settlement',
  ],
  'DE-C36-title': [
    '家庭居留许可，或未成年入境并经机关准用子女条款的人道许可',
    'Family residence permit, or a humanitarian referral for a child who entered before majority',
  ],
  'DE-C36-time': [
    '在法律规定的生日或成年决定日达到可计持证年限',
    'Credited permit period on the statutory birthday or the decision date for an adult',
  ],
  'DE-C36-language': [
    '成年分支达到 B1 或适用因疾病、残障导致的豁免',
    'B1 German on the adult branch or the applicable medical or disability exemption',
  ],
  'DE-C36-livelihood': [
    '成年分支生计稳妥、接受认可学历教育或适用疾病豁免',
    'Secure livelihood, recognised education or applicable medical exemption for an adult',
  ],
  'DE-C37-conduct': [
    '无个人行为驱逐利益或条文所列裁判，或已获个案授予',
    'No personal-conduct expulsion interest or listed conviction, or a discretionary grant',
  ],
  'DE-C37-aid': [
    '无指定福利依赖，或符合学校、职业教育、疾病或已认可的个案例外',
    'No reliance on specified benefits, or an applicable education, medical or discretionary exception',
  ],
  'DE-C38-family': [
    '与持 § 18c 定居许可的配偶继续夫妻共同生活',
    'Continuing marital community with a spouse holding § 18c settlement',
  ],
  'DE-C38-time': [
    '申请人本人已持居留许可达到规定期间',
    'Required period holding a residence permit in the applicant’s own right',
  ],
  'DE-C38-work': [
    '本人实际每周工作至少 20 小时',
    'Applicant actually works at least 20 hours per week',
  ],
  'DE-C39-post': [
    '具备认可的学术资质，且主管机关认可高资质特殊个案',
    'Academic qualification and an accepted exceptional highly qualified case',
  ],
  'DE-C39-consent': [
    '已获州要求的同意或该州无需此项同意',
    'Required state consent given or not required in the state concerned',
  ],
  'DE-C40': [
    '对融入在德生活的前景已有主管机关认定',
    'Assessment of prospects for integration into life in Germany',
  ],
  'DE-C41-appointment': [
    '正式任命为德国公法雇主的公务员',
    'Formal appointment as a civil servant of a German public-law employer',
  ],
  'DE-C41-time': [
    '正式公务员任用及相应许可达到规定期间',
    'Required period of formal service under the corresponding permit',
  ],
  'DE-C42-family': [
    '夫妻共同生活已经结束，原配偶目前持有指定永久许可',
    'Marital community has ended and the former spouse holds a qualifying permanent title',
  ],
  'DE-C42-maintenance': [
    '原配偶以自有资金支付可执行的扶养款，结合本人收入可保障生计',
    'Enforceable maintenance from the former spouse’s own funds secures livelihood together with available own income',
  ],
  'DE-C42-time': [
    '共同生活结束后的配偶定居五年持证期间（§§ 9 Abs. 2 Nr. 1, 31 Abs. 3）',
    'Five-year permit period for settlement after marital community ends (§§ 9 Abs. 2 Nr. 1, 31 Abs. 3)',
  ],
  'DE-C43': ['自由流动法适用身份', 'Personal scope of EU/EEA free movement'],
  'DE-C44': [
    '通常居留期限或提前取得永久权',
    'Ordinary residence period or early acquisition',
  ],
  'DE-C45': [
    '取得后仍保有永久居住权',
    'Retention of the permanent right after acquisition',
  ],
  'DE-C46': ['身份、国籍和代理权', 'Identity, nationality and representation'],
  'DE-C46-application': ['提出入籍申请', 'Filing the application'],
  'DE-C47': [
    '惯常居住与完成日的居留身份',
    'Habitual residence and status at naturalisation',
  ],
  'DE-C48': [
    '宪制、忠诚及历史责任声明',
    'Constitutional, loyalty and historical-responsibility declarations',
  ],
  'DE-C49': [
    '家庭生计及法定福利例外',
    'Family maintenance and statutory benefit exceptions',
  ],
  'DE-C50': ['德语证明或适用豁免', 'German language evidence or exemption'],
  'DE-C51': ['公民知识及入籍考试', 'Civic knowledge and naturalisation test'],
  'DE-C52': ['刑事记录及待决程序', 'Convictions and pending proceedings'],
  'DE-C53': ['法定排除及安全核查', 'Statutory exclusions and security review'],
  'DE-C54': [
    '庄严声明及证书交付',
    'Solemn declaration and certificate delivery',
  ],
  'DE-C55': [
    '一般入籍五年合法惯常居住期间（StAG §§ 10 Abs. 1, 12b）',
    'Five-year lawful habitual residence period for ordinary naturalisation (StAG §§ 10 Abs. 1, 12b)',
  ],
  'DE-C56': [
    '与德国公民的法定关系和实际家庭生活',
    'Recognised relationship and family life with a German citizen',
  ],
  'DE-C56-time': [
    '德国公民配偶或伴侣入籍的三年居住与两年婚姻期间（StAG §§ 9, 12b）',
    'Three-year residence and two-year marriage period for a German citizen’s spouse or partner (StAG §§ 9, 12b)',
  ],
  'DE-C57': [
    '配偶死亡或关系依法终结的特例',
    'Exception after death or legal termination',
  ],
  'DE-C58': [
    '主申请关联、关系及子女年龄',
    'Principal application, relationship and child age',
  ],
  'DE-C58-guidance': [
    '随同入籍的居住和家庭指引',
    'Residence and family guidance for joint naturalisation',
  ],
  'DE-C58-decision': ['家属随同入籍裁量', 'Discretion on joint naturalisation'],
  'DE-C59': [
    '合法惯常居住及住宿',
    'Lawful habitual residence and accommodation',
  ],
  'DE-C60': [
    '本人和亲属的长期供养',
    'Long-term maintenance of self and dependants',
  ],
  'DE-C61-guidance': ['通常整合标准', 'Usual integration guidance'],
  'DE-C62': ['裁量入籍决定', 'Discretionary naturalisation decision'],
  'DE-C63': ['许可和出境失效依据', 'Title and grounds for loss during absence'],
  'DE-C63-time': [
    '出境期限与居留许可存续时间线（§ 51 Abs. 1, 9–10）',
    'Absence deadlines and residence title retention timeline (§ 51 Abs. 1, 9–10)',
  ],
  'DE-C63-current': [
    '本路径所依赖的许可仍有效',
    'The title relied on for this route remains effective',
  ],
  'DE-C64-settlement': [
    '定居许可存续与长期居留例外（§ 51 Abs. 1–4, 10）',
    'Settlement permit retention and long-residence exceptions (§ 51 Abs. 1–4, 10)',
  ],
  'DE-C64-eu-long-term': [
    '欧盟长期居留存续与离欧／离德期限（§ 51 Abs. 9, Abs. 2–4）',
    'EU long-term residence retention and absence limits (§ 51 Abs. 9, Abs. 2–4)',
  ],
  'DE-C65': ['定居许可申请规费', 'Settlement permit application charge'],
  'DE-C65-advance': [
    '包含在定居总费用内的处理费',
    'Processing advance included in the settlement total',
  ],
  'DE-C65-express': [
    '定居许可加急制证附加费',
    'Express issuance surcharge for settlement permit',
  ],
  'DE-C65-paid': [
    '已付款是否覆盖定居申请费用',
    'Payment covers the assessed settlement charge',
  ],
  'DE-C66': [
    '欧盟长期居留申请规费',
    'EU long-term residence application charge',
  ],
  'DE-C66-advance': [
    '包含在欧盟长居总费用内的处理费',
    'Processing advance included in the EU long-term residence total',
  ],
  'DE-C66-express': [
    '欧盟长居加急制证附加费',
    'Express issuance surcharge for EU long-term residence',
  ],
  'DE-C66-paid': [
    '已付款是否覆盖欧盟长居申请费用',
    'Payment covers the assessed EU long-term residence charge',
  ],
  'DE-C67': [
    '减免资格与机关核定',
    'Statutory fee reductions and individual decisions',
  ],
  'DE-C68': [
    '自由流动永久居留文书规费',
    'Free-movement permanent residence document charge',
  ],
  'DE-C68-paid': [
    '已付款是否覆盖自由流动文书费用',
    'Payment covers the assessed free-movement document charge',
  ],
  'DE-C69': ['入籍申请规费', 'Naturalisation application charge'],
  'DE-C69-review': [
    '撤回或拒绝后的机关核费',
    'Fee assessment on withdrawal or refusal',
  ],
  'DE-C69-paid': [
    '已付款是否覆盖入籍申请费用',
    'Payment covers the assessed naturalisation charge',
  ],
  'DE-C70': ['入籍考试费用', 'Citizenship test charge'],
  'DE-C71': [
    '整合课程、LiD 或语言考试费用',
    'Integration course, LiD or language exam charge',
  ],
  'DE-C71-exemption': [
    '按子女人数及受雇工资申请整合课费用豁免',
    'Employee earnings threshold for a course contribution exemption',
  ],
} as const;

// Policy page: units, column names and item labels for nested parameters.
export const germanyParameterText = {
  unit: {
    years: ['{n} 年', '{n} year{n:s}'],
    months: ['{n} 个月', '{n} month{n:s}'],
    days: ['{n} 天', '{n} day{n:s}'],
    hours: ['{n} 小时', '{n} hour{n:s}'],
    age: ['{n} 岁', 'age {n}'],
    m2: ['{n} 平方米', '{n} m²'],
    dayRates: ['{n} 个日额', '{n} day rate{n:s}'],
    questions: ['{n} 题', '{n} question{n:s}'],
    minutes: ['{n} 分钟', '{n} minute{n:s}'],
    level: ['第 {n} 级', 'level {n}'],
    share: ['{n}%', '{n}%'],
    calendarYear: ['{n}', '{n}'],
    eur: ['€{n}', '€{n}'],
    eurMonth: ['每月 €{n}', '€{n} a month'],
    eurYear: ['每年 €{n}', '€{n} a year'],
  },
  item: ['项目', 'Item'],
  value: ['数值', 'Value'],
  year: ['年份', 'Year'],
  annualPay: ['税前年薪下限', 'Minimum gross annual salary'],
  birthYear: ['出生年份', 'Year of birth'],
  addedMonths: ['在 {n} 岁基础上增加', 'Added to age {n}'],
  blueCardTrack: ['就业 {n} 个月档', '{n}-month track'],
  isco: ['ISCO-08 职业组：{list}', 'ISCO-08 groups: {list}'],
} as const;

type ParameterUnit = keyof typeof germanyParameterText.unit;

export const germanyParameterLabels: Record<
  string,
  Record<string, readonly [string, string, ParameterUnit]>
> = {
  naturalisationYears: {
    general: [
      '一般入籍所需合法惯常居住',
      'Lawful habitual residence for ordinary naturalisation',
      'years',
    ],
    spouse: [
      '德国公民配偶或伴侣入籍所需居住',
      'Residence for the spouse or partner of a German',
      'years',
    ],
  },
  priorResidenceCreditYears: {
    general: [
      '一般入籍：中断后可计入的先前居住',
      'Ordinary naturalisation: earlier residence counted after an interruption',
      'years',
    ],
    spouse: [
      '配偶或伴侣入籍：中断后可计入的先前居住',
      'Spouse or partner: earlier residence counted after an interruption',
      'years',
    ],
  },
  monthlyNeeds2026: {
    single: [
      '单身成年人或单亲家长（Regelbedarfsstufe 1）',
      'Single adult or lone parent (Regelbedarfsstufe 1)',
      'eurMonth',
    ],
    partner: [
      '同住成年配偶或伴侣，每人（Regelbedarfsstufe 2）',
      'Cohabiting adult spouse or partner, each (Regelbedarfsstufe 2)',
      'eurMonth',
    ],
    otherAdult: [
      '家庭内其他成年成员（Regelbedarfsstufe 3）',
      'Other adult in the household (Regelbedarfsstufe 3)',
      'eurMonth',
    ],
    child14to17: [
      '14 至 17 岁青少年（Regelbedarfsstufe 4）',
      'Adolescent aged 14 to 17 (Regelbedarfsstufe 4)',
      'eurMonth',
    ],
    child6to13: [
      '6 至 13 岁儿童（Regelbedarfsstufe 5）',
      'Child aged 6 to 13 (Regelbedarfsstufe 5)',
      'eurMonth',
    ],
    childUnder6: [
      '6 岁以下幼儿（Regelbedarfsstufe 6）',
      'Child under age 6 (Regelbedarfsstufe 6)',
      'eurMonth',
    ],
  },
  housingGuidance: {
    omitUnderAge: [
      '不计面积的幼儿（未满）',
      'Children not counted (under)',
      'age',
    ],
    childBoundary: [
      '儿童与其他成员的面积分界',
      'Age dividing the two reference areas',
      'age',
    ],
    childArea: [
      '分界年龄以下儿童，每人参考面积',
      'Reference area per child below the dividing age',
      'm2',
    ],
    olderArea: [
      '其他家庭成员，每人参考面积',
      'Reference area per other household member',
      'm2',
    ],
    shortfallFraction: [
      '联邦指引容许的面积不足（约）',
      'Shortfall tolerated by federal guidance (about)',
      'share',
    ],
  },
  settlementFees: {
    general: ['定居许可（一般）', 'Settlement permit (general)', 'eur'],
    academic: [
      '高资质学术人才定居许可',
      'Settlement permit for a highly qualified academic',
      'eur',
    ],
    business: [
      '企业经营者定居许可',
      'Settlement permit for an entrepreneur',
      'eur',
    ],
    familyChild: [
      '在德长大的未成年子女定居许可',
      'Settlement permit for a minor raised in Germany',
      'eur',
    ],
    euLongTerm: ['欧盟长期居留许可', 'EU long-term residence permit', 'eur'],
    advanceShare: [
      '处理费占规费的比例（含在总费用内）',
      'Processing fee as a share of the charge (included in the total)',
      'share',
    ],
    minorShare: [
      '未成年申请人适用的规费比例',
      'Share of the charge for a minor applicant',
      'share',
    ],
    euCertificate: [
      '自由流动永久居住证明',
      'Certificate of permanent residence under free movement',
      'eur',
    ],
  },
  identityCardFees: {
    age: ['年龄分界', 'Age threshold', 'age'],
    under: ['未满分界年龄', 'Under the age threshold', 'eur'],
    standard: ['达到分界年龄', 'At or above the age threshold', 'eur'],
  },
  naturalisationFees: {
    standard: ['入籍规费，每人', 'Naturalisation charge, per person', 'eur'],
    childJoining: [
      '随父母入籍且无应税收入的未成年子女',
      'Minor naturalised with a parent and without taxable income',
      'eur',
    ],
    minimumOnWithdrawal: [
      '撤回或拒绝后的最低规费',
      'Minimum charge after withdrawal or refusal',
      'eur',
    ],
  },
  integrationCourseShare: {
    personal: [
      '个人承担的课程费用比例',
      'Share of course costs paid personally',
      'share',
    ],
    employee: [
      '受雇者豁免工资线：占养老保险缴费上限',
      'Employee exemption threshold: share of the pension contribution ceiling',
      'share',
    ],
    oneChildAddition: ['有一名子女时加计', 'Added with one child', 'share'],
    multipleChildrenAddition: [
      '有两名及以上子女时加计',
      'Added with two or more children',
      'share',
    ],
  },
  citizenshipFullTime: {
    required: ['所需全职月数', 'Required months of full-time work', 'months'],
    window: ['最近核算期间', 'Within the most recent', 'months'],
  },
  citizenshipKnowledgeTest: {
    required: ['及格所需答对', 'Correct answers to pass', 'questions'],
    total: ['总题数', 'Total questions', 'questions'],
    stateQuestions: [
      '其中关于所在州',
      'Of which about the federal state',
      'questions',
    ],
    minutes: ['考试时长', 'Test duration', 'minutes'],
  },
  citizenshipConvictions: {
    fineDayRates: [
      '不予考虑的罚金，最多',
      'Fines disregarded up to',
      'dayRates',
    ],
    probationMonths: [
      '不予考虑的缓刑自由刑，最多',
      'Suspended prison sentences disregarded up to',
      'months',
    ],
    minorExcessDayRates: [
      '超出上述上限时可由机关决定忽略的幅度',
      'Excess the authority may decide to disregard',
      'dayRates',
    ],
  },
  citizenshipSpouseException: {
    publicInterestMarriageYears: [
      '机关缩短居住年限时所需婚姻存续',
      'Marriage needed for a shortened residence period',
      'years',
    ],
    endedApplicationYears: [
      '配偶去世或关系依法终结后的申请期限',
      'Deadline to apply after death or legal termination',
      'years',
    ],
  },
  citizenshipFamilyGuidance: {
    spouseYears: ['随同入籍的配偶：居住', 'Joining spouse: residence', 'years'],
    relationshipYears: [
      '随同入籍的配偶：婚姻或共同生活',
      'Joining spouse: marriage or family life',
      'years',
    ],
    childYears: ['随同入籍的子女：居住', 'Joining child: residence', 'years'],
    youngChildAge: ['低龄子女（未满）', 'Young child (under)', 'age'],
    youngChildLifeShare: [
      '低龄子女：在德居住占其年龄的比例',
      'Young child: share of life lived in Germany',
      'share',
    ],
  },
  blueCardCeilingShares: {
    standard: [
      '标准工资线：占养老保险缴费上限',
      'Standard threshold: share of the pension contribution ceiling',
      'share',
    ],
    reduced: [
      '降低工资线：占养老保险缴费上限',
      'Reduced threshold: share of the pension contribution ceiling',
      'share',
    ],
  },
  blueCardJob: {
    minimumContractMonths: ['最短合同期', 'Minimum contract term', 'months'],
    recentDegreeYears: [
      '毕业后可按降低工资线申请的期限',
      'Reduced threshold after graduating, within',
      'years',
    ],
    renewalMonths: [
      '按毕业生降低工资线续签：自首张蓝卡起',
      'Graduate threshold on renewal: from the first card, within',
      'months',
    ],
    experienceYears: [
      'IT 专业人员所需相关经验',
      'Relevant experience for IT specialists',
      'years',
    ],
    experienceWindowYears: [
      'IT 经验的回溯期间',
      'IT experience gained within the last',
      'years',
    ],
    tertiaryYears: [
      '同等高等教育资格的最短学制',
      'Minimum length of an equivalent tertiary programme',
      'years',
    ],
    tertiaryLevel: [
      '同等高等教育资格的最低 DQR／EQF 级别',
      'Minimum DQR/EQF level of an equivalent tertiary programme',
      'level',
    ],
    jobChangeMonths: [
      '换岗须通报的首次就业期间',
      'Job changes are notified during the first',
      'months',
    ],
    suspensionDays: [
      '暂停换岗后机关可拒绝的期限',
      'Rejection after a suspension, within',
      'days',
    ],
  },
  freeMovementPeriods: {
    residenceYears: [
      '通常取得永久居住权所需合法居住',
      'Lawful residence for permanent residence',
      'years',
    ],
    ordinaryAbsenceMonths: [
      '每年出境不中断居住的上限',
      'Absence per year that does not break residence',
      'months',
    ],
    importantAbsenceMonths: [
      '重要原因的单次出境上限',
      'One absence for an important reason',
      'months',
    ],
    jobseekingMonths: [
      '求职者身份的通常期限',
      'Jobseeker status, usual period',
      'months',
    ],
    retirementAge: [
      '退休提前取得：退休年龄',
      'Early acquisition on retirement: retirement age',
      'age',
    ],
    retirementResidenceYears: [
      '退休提前取得：连续居住',
      'Early acquisition on retirement: continuous residence',
      'years',
    ],
    retirementWorkMonths: [
      '退休提前取得：最后在德工作',
      'Early acquisition on retirement: final work in Germany',
      'months',
    ],
    disabilityResidenceYears: [
      '丧失工作能力提前取得：连续居住',
      'Early acquisition on incapacity: continuous residence',
      'years',
    ],
    frontierWorkYears: [
      '跨境工作者提前取得：此前在德连续工作和居住',
      'Early acquisition as a frontier worker: prior continuous work and residence in Germany',
      'years',
    ],
    bereavementResidenceYears: [
      '劳动者去世后家属提前取得：劳动者生前连续居住',
      'Family members after a worker’s death: the worker’s continuous residence',
      'years',
    ],
    lossYears: [
      '取得后离开德国超过此期限即丧失',
      'Lost after an absence from Germany of more than',
      'years',
    ],
    cardIssueMonths: [
      '非欧盟家属永久居留卡的签发期限',
      'Permanent residence card for a non-EU family member issued within',
      'months',
    ],
  },
  permanentTitleAbsence: {
    longResidenceYears: [
      '出境例外所需的长期合法居留',
      'Long lawful residence for the absence exceptions',
      'years',
    ],
    olderResidentAge: [
      '定居许可：长期居留且离境时年满该年龄可延长返回期',
      'Settlement permit: longer return period after long residence from',
      'age',
    ],
    returnMonths: [
      '强迫婚姻解除或兵役结束后的返回期限',
      'Return after a forced marriage or military service ends, within',
      'months',
    ],
    coercionMaximumYears: [
      '强迫婚姻情形自离境起的最长期限',
      'Forced marriage: longest period from departure',
      'years',
    ],
    longVisaDays: [
      '不按出境期限失效的签证：多次入境，或授权停留超过',
      'Visas outside the absence limit: multiple-entry, or a stay of more than',
      'days',
    ],
  },
  refugeeBerlinBenefitShare: {
    ordinary: [
      '普通档（柏林机关做法）：SGB II／XII 福利占总收入须低于',
      'Ordinary tier (Berlin practice): SGB II / XII benefits below this share of income',
      'share',
    ],
    accelerated: [
      '加速档（柏林机关做法）：SGB II／XII 福利占总收入须低于',
      'Accelerated tier (Berlin practice): SGB II / XII benefits below this share of income',
      'share',
    ],
  },
  retirementAge: {
    earlierYears: ['原标准退休年龄', 'Former standard retirement age', 'age'],
    standardYears: ['标准退休年龄', 'Standard retirement age', 'age'],
    firstRaisedCohort: [
      '首个逐步提高退休年龄的出生年份',
      'First year of birth with a raised age',
      'calendarYear',
    ],
    firstStandardCohort: [
      '首个适用标准退休年龄的出生年份',
      'First year of birth at the standard age',
      'calendarYear',
    ],
  },
  euMobility: {
    germanBlueYears: [
      '在德国持蓝卡至少',
      'Blue Card held in Germany for at least',
      'years',
    ],
    maxConsecutiveMonthsOutsideEu: [
      '连续离开欧盟的上限',
      'Longest single period outside the EU',
      'months',
    ],
    maxTotalMonthsOutsideEu: [
      '累计离开欧盟的上限',
      'Total time outside the EU',
      'months',
    ],
    studyCredit: [
      '学习或职业培训期间的计入比例',
      'Share of study or vocational training counted',
      'share',
    ],
  },
  childSettlement: {
    birthday: [
      '未成年人可取得定居许可的年龄',
      'Age from which a minor may qualify',
      'age',
    ],
    adulthood: ['成年年龄', 'Age of majority', 'age'],
    years: ['所需持证年限', 'Required permit period', 'years'],
    offenceWindowYears: [
      '核查裁判的期间',
      'Convictions considered within the last',
      'years',
    ],
    youthMonths: [
      '排除：故意犯罪的少年刑至少',
      'Excluded by a youth sentence for an intentional offence of at least',
      'months',
    ],
    prisonMonths: [
      '排除：故意犯罪的自由刑至少',
      'Excluded by a prison sentence for an intentional offence of at least',
      'months',
    ],
    fineUnits: [
      '排除：故意犯罪的罚金至少',
      'Excluded by a fine for an intentional offence of at least',
      'dayRates',
    ],
  },
  skilledSpouse: {
    permitYears: ['本人持居留许可', 'Own residence permit held', 'years'],
    weeklyHours: ['每周工作至少', 'Weekly work of at least', 'hours'],
  },
  initialSkilledSalary: {
    age: [
      '首次申请时年满此年龄须证明工资或养老保障',
      'From this age at first application, salary or pension provision is needed',
      'age',
    ],
    year: ['工资线年份', 'Threshold year', 'calendarYear'],
    annualGross: ['税前年薪下限', 'Minimum gross annual salary', 'eur'],
    ceilingShare: [
      '占养老保险缴费上限',
      'Share of the pension contribution ceiling',
      'share',
    ],
  },
};
