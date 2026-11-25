// Questionnaire wording for the United States: [Chinese, English].
const messages = {
  'us.form.optional': [
    '只填写已知事实。标星号的项目必填，其余可以留空，留空的条件会在结果中显示为待确认。',
    'Enter the facts you know. Fields marked with an asterisk are required. Anything left blank is shown as still to be confirmed.',
  ],
  'us.form.choose': ['请选择', 'Choose one'],
  'us.form.unknown': ['不清楚／待确认', 'Not known / to confirm'],
  'us.form.enterDate': ['填写日期', 'Enter a date'],
  'us.form.enterNumber': ['填写数字', 'Enter a number'],
  'us.form.enterDetails': ['填写详情', 'Enter details'],
  'us.form.remove': ['删除', 'Remove'],
  'us.form.add': ['添加', 'Add'],
  'us.form.noRecords': ['确认没有记录', 'Confirm there are none'],
  'us.form.reset': ['撤销“没有记录”', 'Undo “none”'],
  'us.form.noneConfirmed': [
    '已确认没有记录。',
    'You have confirmed there are none.',
  ],
  'us.review.cleared': ['已确认符合', 'Confirmed: met'],
  'us.review.barred': ['已确认不符合', 'Confirmed: not met'],
  'us.review.pending': [
    '证据已提交，待审核',
    'Evidence submitted, awaiting review',
  ],

  'us.step.start': ['评估日期与路径', 'Date and pathway'],
  'us.step.status': ['身份与出入境记录', 'Status and trips abroad'],
  'us.step.military': ['军人服役', 'Military service'],
  'us.step.naturalization': [
    '入籍资格与考试',
    'Naturalization eligibility and tests',
  ],
  'us.step.character': [
    '良好品格、宪法依附与宣誓',
    'Good moral character, attachment and oath',
  ],
  'us.step.conditions': ['取消条件申请', 'Removing conditions'],
  'us.step.travel': [
    '永久居民身份维持与返美',
    'Keeping permanent residence and returning',
  ],
  'us.step.family': ['亲属关系与 I-130', 'Family relationship and I-130'],
  'us.step.employment': ['职业类别与请愿', 'Employment category and petition'],
  'us.step.humanitarian': ['难民或庇护身份', 'Refugee or asylee status'],
  'us.step.process': [
    '调整身份或领馆程序',
    'Adjustment of status or consular process',
  ],
  'us.step.support': ['经济担保 I-864', 'Affidavit of support (I-864)'],
  'us.step.admissibility': [
    '不予入境事由（INA 212）',
    'Grounds of inadmissibility (INA 212)',
  ],
  'us.step.fees': ['费用与递交方式', 'Fees and filing method'],
  'us.intro.start': [
    '每份问卷评估一条路径。想比较不同路径，可以分别填写并保存为方案。',
    'Each questionnaire assesses one pathway. To compare pathways, complete one for each and save them as scenarios.',
  ],
  'us.intro.status': [
    '出入境记录用于计算连续居住、在美天数、I-485 递交时是否在美国以及返美条件。没有出境请点“确认没有记录”。',
    'Trips are used for continuous residence, physical presence, presence in the U.S. when filing I-485 and return travel. If you have not travelled, choose “Confirm there are none”.',
  ],
  'us.intro.military': [
    '按 INA 328（和平时期）或 INA 329（指定敌对期）核对服役条件。',
    'Service is checked under INA 328 (peacetime) or INA 329 (designated hostilities).',
  ],
  'us.intro.naturalization': [
    '考试和医学例外按 N-400 收件日判断。尚未考试可选“准备中”。',
    'Tests and medical exceptions are assessed at N-400 receipt. Choose “Preparing” if you have not taken a test.',
  ],
  'us.intro.character': [
    '品格按本路径的法定期间至宣誓日审查。刑事记录请按美国移民法的分类填写，未分类的可勾选相应项目。',
    'Character is reviewed over this pathway’s statutory period through the oath. Enter criminal records as classified under U.S. immigration law, or mark them as unclassified.',
  ],
  'us.intro.conditions': [
    '按上一步选择的条件绿卡类型填写 I-751 或 I-829 的资料。',
    'Answer the I-751 or I-829 questions for the conditional green card chosen in the previous step.',
  ],
  'us.intro.travel': [
    '返美相关答案适用于返美日期最晚的那次行程。',
    'Return answers apply to the trip with the latest return date.',
  ],
  'us.intro.family': [
    '请愿人是递交 I-130 的美国公民或永久居民，受益人是申请绿卡的人。',
    'The petitioner is the U.S. citizen or permanent resident filing Form I-130. The beneficiary is the person seeking a green card.',
  ],
  'us.intro.employment': [
    '先选类别，其余问题按类别显示。雇主支付能力按优先日所在年度至今逐年核对。',
    'Choose a category first. The other questions depend on it. The employer’s ability to pay is checked for each year from the priority-date year.',
  ],
  'us.intro.humanitarian': [
    '按 INA 209 核对难民或受庇护者转为永久居民的条件。',
    'Requirements for refugees and asylees to become permanent residents under INA 209.',
  ],
  'us.intro.process': [
    '请明确选择基础请愿的状态，不要留空。排期按 Visa Bulletin 的递交表和 Final Action Dates 填写。',
    'Choose the status of the underlying petition. Enter visa availability from the Visa Bulletin filing chart and Final Action Dates.',
  ],
  'us.intro.support': [
    '亲属移民和由亲属提交或持股的职业移民需要 I-864。不需要时规则会显示为不适用。',
    'Form I-864 applies to family cases and to employment cases filed by, or owned in part by, a relative. Otherwise the rules show it as not applicable.',
  ],
  'us.intro.admissibility': [
    '每项填豁免或例外处理之后的结论。没有分类结论的项目可以留空。',
    'Give each finding after any waiver or exception. Leave a question blank if it has not been classified.',
  ],
  'us.intro.fees': [
    '费用与资格结果分开显示。纸质递交按 USCIS 下一个工作日收件。',
    'Fees are shown separately from eligibility. Paper filings are received on the next USCIS business day.',
  ],
  'us.section.greenCard': ['绿卡', 'Green card'],
  'us.section.trips': ['出入境记录', 'Trips abroad'],
  'us.section.spouse': ['与美国公民的婚姻', 'Marriage to a U.S. citizen'],
  'us.section.marriageConditions': [
    '婚姻条件绿卡（I-751）',
    'Marriage-based conditions (I-751)',
  ],
  'us.section.investorConditions': [
    '投资条件绿卡（I-829）',
    'Investor conditions (I-829)',
  ],
  'us.section.returnAdmission': [
    '返美时重新申请入境的审查',
    'Admission review on return',
  ],

  'us.field.simulationDate': ['评估日期', 'Assessment date'],
  'us.field.pathway': ['要评估的路径', 'Pathway to assess'],
  'us.field.dateOfBirth': ['出生日期', 'Date of birth'],
  'us.field.process': ['办理方式', 'Processing route'],
  'us.field.adjustmentBasis': ['调整身份的依据', 'Basis for adjustment'],
  'us.field.permanentResident': [
    '取得永久居民身份的日期（绿卡上的 Resident Since）',
    'Date you became a permanent resident (Resident Since on the card)',
  ],
  'us.field.conditional': ['绿卡类型', 'Green card type'],
  'us.field.principalConditional': [
    '主申请人取得条件绿卡的日期',
    'Date the principal applicant became a conditional resident',
  ],
  'us.field.separatePetition': [
    '不随父母或投资人一并递交，单独递交',
    'Filing separately rather than with a parent or the investor',
  ],
  'us.field.marriage': ['婚姻', 'Marriage'],
  'us.field.married': ['结婚日期', 'Date of marriage'],
  'us.field.spouseCitizenSince': [
    '配偶成为美国公民的日期',
    'Date your spouse became a U.S. citizen',
  ],
  'us.field.trips': ['出境', 'Trip'],
  'us.field.departed': ['离开美国的日期', 'Date you left the United States'],
  'us.field.returned': [
    '回到美国的日期',
    'Date you came back to the United States',
  ],
  'us.field.i485Travel': [
    'I-485 待决期间的出行依据',
    'Travel while Form I-485 is pending',
  ],
  'us.field.route': ['出境及返美依据', 'Basis for leaving and returning'],
  'us.field.travelEvidence': [
    '依据的全部条件已满足（含出境前授权及返美查验）',
    'All conditions of the basis are met, including any prior authorization and inspection on return',
  ],
  'us.field.inRemovalProceedings': [
    '出境时处于排除、递解或移除程序中',
    'In exclusion, deportation or removal proceedings when leaving',
  ],
  'us.field.basis': ['服役依据', 'Service basis'],
  'us.field.service': ['服役期间', 'Service period'],
  'us.field.serviceFrom': ['开始日期', 'Start date'],
  'us.field.serviceTo': [
    '结束日期（仍在服役可留空）',
    'End date (blank if still serving)',
  ],
  'us.field.honorableServiceYears': [
    '递交时经认证的合格服役年数（扣除中断）',
    'Certified qualifying service at filing, in years, excluding breaks',
  ],
  'us.field.eligibleServiceComponent': [
    '服役单位属于合格的军种或组成部分',
    'Service is in an eligible branch or component',
  ],
  'us.field.honorableService': ['荣誉服役', 'Honorable service'],
  'us.field.militaryEvidence': ['服役证明', 'Service evidence'],
  'us.field.separatedOn': ['退役日期', 'Separation date'],
  'us.field.lprAtInterview': [
    '面谈时是永久居民',
    'A permanent resident at the interview',
  ],
  'us.field.qualifyingLocationAtEnlistment': [
    '入伍或应征时身处美国或其他合格地点',
    'Enlisted or inducted in the U.S. or another qualifying place',
  ],
  'us.field.backgroundCheck': ['背景审查', 'Background check'],
  'us.field.lateResidenceMet': [
    '退役后递交时已满足一般居住条件（可计入服役时间）',
    'Ordinary residence met when filing after separation, counting military service',
  ],
  'us.field.stateResidenceFrom': [
    '开始住在现在所在州或 USCIS 辖区的日期',
    'Date you started living in your current state or USCIS district',
  ],
  'us.field.lawfulAdmission': [
    '合法取得永久居民身份（无欺诈或不符合资格的情形）',
    'Lawfully admitted for permanent residence',
  ],
  'us.field.removalProcess': ['递解程序', 'Removal proceedings'],
  'us.field.residenceThroughOath': [
    '会一直居住到宣誓',
    'Will continue to reside until the oath',
  ],
  'us.field.interviewOn': ['N-400 面谈日期', 'N-400 interview date'],
  'us.field.conditionalStatusResolved': [
    '条件已取消（否：取消条件申请待决且身份有效）',
    'Conditions removed (No: petition pending with status maintained)',
  ],
  'us.field.lprResidenceYears': [
    'N-400 收件时作为永久居民在美居住的总年数',
    'Total years living in the U.S. as a permanent resident at N-400 receipt',
  ],
  'us.field.english': ['英语考试', 'English test'],
  'us.field.civics': ['公民知识考试', 'Civics test'],
  'us.field.civicsCorrect': [
    '公民知识考试答对题数',
    'Civics questions answered correctly',
  ],
  'us.field.disability': [
    '医学例外（N-648）',
    'Medical exception (Form N-648)',
  ],
  'us.field.disabilityRequested': ['申请了医学例外', 'Exception requested'],
  'us.field.disabilityMonths': [
    '残疾或损伤已持续或预计持续的月数',
    'Months the disability has lasted or is expected to last',
  ],
  'us.field.illegalDrugCause': ['由非法用药导致', 'Caused by illegal drug use'],
  'us.field.clinicianCertified': [
    '由有资格的医生填写并认证',
    'Certified by a qualifying medical professional',
  ],
  'us.field.englishWaived': ['英语要求获豁免', 'English requirement waived'],
  'us.field.civicsWaived': ['公民知识要求获豁免', 'Civics requirement waived'],
  'us.field.validMarriage': ['婚姻合法有效', 'Valid marriage'],
  'us.field.livedTogetherRequiredPeriod': [
    '在法定期间与配偶共同生活',
    'Living in marital union for the required period',
  ],
  'us.field.spouseCitizenRequiredPeriod': [
    '配偶在法定期间一直是美国公民',
    'Spouse a U.S. citizen for the required period',
  ],
  'us.field.marriageAndCitizenshipThroughOath': [
    '婚姻和配偶公民身份会持续到宣誓',
    'Marriage and spouse’s citizenship continue through the oath',
  ],
  'us.field.unclassifiedRecord': [
    '有尚未按移民法分类的刑事记录',
    'Record not yet classified under immigration law',
  ],
  'us.field.cimtCount': [
    '道德败坏罪行（CIMT）数量',
    'Crimes involving moral turpitude (CIMT)',
  ],
  'us.field.cimtMaximumMonths': [
    'CIMT 法定最高刑（月）',
    'Maximum possible CIMT sentence (months)',
  ],
  'us.field.cimtSentenceMonths': [
    'CIMT 实际判处刑期（月）',
    'CIMT sentence imposed (months)',
  ],
  'us.field.cimtAgeAtOffense': ['CIMT 犯罪时年龄', 'Age at the CIMT offense'],
  'us.field.cimtOffenseOrReleaseOn': [
    'CIMT 犯罪或出狱日期（取较晚者）',
    'Later of the CIMT offense and release',
  ],
  'us.field.convictionCount': ['定罪次数', 'Number of convictions'],
  'us.field.combinedSentenceMonths': [
    '合计判处刑期（月）',
    'Combined sentences (months)',
  ],
  'us.field.confinementDays': [
    '法定期间内的合格羁押天数',
    'Qualifying days of confinement in the statutory period',
  ],
  'us.field.controlledSubstance': ['受管制物质', 'Controlled substance'],
  'us.field.cannabisGrams': ['大麻重量（克）', 'Cannabis (grams)'],
  'us.field.duiCount': ['酒驾或毒驾定罪次数', 'DUI convictions'],
  'us.field.membership': [
    '共产党或其他极权政党党籍',
    'Communist or totalitarian party membership',
  ],
  'us.field.partyEndedOn': ['退党日期', 'Date membership ended'],
  'us.field.ageEnded': ['退党时年龄', 'Age when membership ended'],
  'us.field.rulingParty': ['该党为执政党', 'Ruling party'],
  'us.field.partyException': ['适用的例外', 'Exception'],
  'us.field.functionary': ['曾任党内职务', 'Held a party position'],
  'us.field.noSecurityThreat': [
    '对美国没有安全威胁',
    'No threat to U.S. security',
  ],
  'us.field.partyWaiver': ['党籍豁免', 'Membership waiver'],
  'us.field.goodMoralCharacter': [
    '法定期间至宣誓日的良好品格（整体审查）',
    'Good moral character through the oath (whole record)',
  ],
  'us.field.murderConviction': ['曾被判谋杀罪', 'Convicted of murder'],
  'us.field.aggravatedFelonyConvictedOn': [
    '加重重罪（aggravated felony）定罪日期',
    'Aggravated felony conviction date',
  ],
  'us.field.persecutionBar': [
    '曾参与迫害、种族灭绝、酷刑或严重侵犯宗教自由',
    'Took part in persecution, genocide, torture or severe violations of religious freedom',
  ],
  'us.field.statutoryPeriodCrime': [
    '法定期间内的刑事记录',
    'Criminal record in the statutory period',
  ],
  'us.field.otherGmcBar': [
    '其他法定或裁量品格障碍',
    'Other statutory or discretionary character bars',
  ],
  'us.field.duiPresumptionRebutted': [
    '多次酒驾的不良品格推定已被反驳',
    'Presumption from multiple DUIs rebutted',
  ],
  'us.field.falseOralTestimony': [
    '为取得移民利益作过虚假口头证词',
    'Gave false oral testimony for an immigration benefit',
  ],
  'us.field.benefitsAndSupport': [
    '公共福利与抚养义务',
    'Public benefits and support obligations',
  ],
  'us.field.constitutionalAttachment': [
    '依附美国宪法原则',
    'Attached to the principles of the U.S. Constitution',
  ],
  'us.field.party': ['党籍', 'Party membership'],
  'us.field.selectiveService': [
    'Selective Service 登记',
    'Selective Service registration',
  ],
  'us.field.selectiveNonWillful': [
    '未登记并非有意',
    'Failure to register was not knowing and willful',
  ],
  'us.field.warDesertionOrAlienageExemption': [
    '战时逃兵或以外国人身份免除兵役的禁令已排除',
    'Wartime desertion or alienage exemption bar cleared',
  ],
  'us.field.oath': ['效忠宣誓', 'Oath of allegiance'],
  'us.field.oathApproval': [
    '修改誓词或豁免宣誓获批',
    'Modified oath or oath waiver approved',
  ],
  'us.field.titlesRenounced': [
    '已放弃世袭头衔或贵族爵位（如有）',
    'Hereditary titles or orders of nobility renounced, if any',
  ],
  'us.field.truthfulApplication': [
    'N-400 如实填写并披露重要事实',
    'N-400 truthful, with material facts disclosed',
  ],
  'us.field.project': ['投资项目类型', 'Project type'],
  'us.field.capitalUsd': ['投资金额（美元）', 'Capital invested (USD)'],
  'us.field.lawfullySourcedFunds': ['资金来源合法', 'Lawfully sourced funds'],
  'us.field.atRisk': ['资金处于风险之中', 'Capital at risk'],
  'us.field.sustainmentYears': [
    '已维持投资的年数',
    'Years the investment has been sustained',
  ],
  'us.field.qualifiesAsNewEnterprise': [
    '属于新商业企业',
    'Qualifies as a new commercial enterprise',
  ],
  'us.field.qualifyingJobs': ['合格全职岗位数', 'Qualifying full-time jobs'],
  'us.field.minimumWeeklyHours': [
    '每个岗位的最低周工时',
    'Minimum weekly hours per job',
  ],
  'us.field.regionalCenter': ['通过区域中心投资', 'Through a regional center'],
  'us.field.projectFiled': [
    '区域中心项目已递交（I-956F）',
    'Regional center project filed (I-956F)',
  ],
  'us.field.indirectJobsPct': ['间接岗位占比（%）', 'Indirect jobs (%)'],
  'us.field.shortConstructionIndirectJobsPct': [
    '短期建设间接岗位占比（%）',
    'Short-term construction indirect jobs (%)',
  ],
  'us.field.marriedOn': ['结婚日期', 'Date of marriage'],
  'us.field.bonaFide': [
    '婚姻真实（非为移民而结婚）',
    'Marriage entered in good faith',
  ],
  'us.field.improperConsideration': [
    '为递交请愿支付过不当报酬（律师费除外）',
    'Paid improper consideration for the petition, other than attorney fees',
  ],
  'us.field.filing': ['递交方式', 'Filing basis'],
  'us.field.spouseJoins': ['配偶一同递交', 'Spouse joins the petition'],
  'us.field.finalRemovalOrder': [
    '已有最终递解令',
    'Subject to a final removal order',
  ],
  'us.field.waiverBasis': ['豁免依据的证据', 'Evidence for the waiver basis'],
  'us.field.interviewRequirement': [
    '面谈要求已满足或获免',
    'Interview requirement met or waived',
  ],
  'us.field.lateFilingExcuse': [
    '逾期递交有正当理由并获接受',
    'Good cause for late filing accepted',
  ],
  'us.field.originalPetitionFiledOn': [
    '原 I-526／I-526E 收件日',
    'Original I-526 or I-526E receipt date',
  ],
  'us.field.requiredCapitalFullyInvested': [
    '所需资金已全部投入',
    'Required capital fully invested',
  ],
  'us.field.continuousInvestmentDuringConditionalResidence': [
    '条件居留期间持续维持投资（RIA 前案件）',
    'Investment sustained during conditional residence (pre-RIA cases)',
  ],
  'us.field.jobsAccepted': ['就业创造获认可', 'Job creation accepted'],
  'us.field.registration': ['外国人登记', 'Alien registration'],
  'us.field.carryingEvidence': [
    '随身携带登记证明',
    'Carrying evidence of registration',
  ],
  'us.field.movedOn': ['最近搬家日期', 'Most recent move'],
  'us.field.addressReportedOn': [
    '新地址报备日期',
    'Date the new address was reported',
  ],
  'us.field.cardExpiresOn': ['绿卡到期日', 'Green card expiry date'],
  'us.field.otherReplacementGround': [
    '绿卡遗失、损坏、改名或信息有误',
    'Card lost, damaged, name changed or data incorrect',
  ],
  'us.field.replacementFiledOn': [
    'I-90 换卡申请收件日',
    'I-90 replacement filing date',
  ],
  'us.field.replacementReason': ['换卡原因', 'Replacement reason'],
  'us.field.admissionTriggers': [
    '返美时触发重新申请入境的情形（INA 101(a)(13)(C)）',
    'Return triggers seeking admission (INA 101(a)(13)(C))',
  ],
  'us.field.deportability': [
    '不属于可在境内递解的情形（INA 237）',
    'Not deportable (INA 237)',
  ],
  'us.field.deportabilityFacts': [
    '可递解事由的事实',
    'Facts for deportability grounds',
  ],
  'us.field.unclassifiedGround': [
    '有尚未分类的定罪或其他事由',
    'Unclassified convictions or other grounds',
  ],
  'us.field.singleCimt': ['一项 CIMT 的详情', 'Details of a single CIMT'],
  'us.field.admittedOn': ['入境日期', 'Date of admission'],
  'us.field.committedOn': ['犯罪日期', 'Date of the offense'],
  'us.field.possibleSentenceMonths': [
    '可判处的最高刑期（月）',
    'Possible sentence (months)',
  ],
  'us.field.sWitness': ['S 签证证人', 'S-visa witness'],
  'us.field.independentCimtCount': [
    '彼此独立的 CIMT 数量',
    'Separate CIMTs not arising from one scheme',
  ],
  'us.field.aggravatedFelony': ['加重重罪定罪', 'Aggravated felony conviction'],
  'us.field.earlyMarriageTermination': [
    '婚姻提前结束的递解事由已排除',
    'Early marriage termination ground cleared',
  ],
  'us.field.otherDeportabilityGround': [
    '其他可递解事由已排除',
    'Other deportability grounds cleared',
  ],
  'us.field.returnDocument': ['返美证件', 'Return document'],
  'us.field.documentValidAtReturn': [
    '证件在返美时有效',
    'Document valid on return',
  ],
  'us.field.permitFiledOn': [
    '回美证 I-131 收件日',
    'Reentry permit I-131 receipt date',
  ],
  'us.field.permitAppliedInUs': ['递交时身在美国', 'In the U.S. when filing'],
  'us.field.permitIssuedOn': ['回美证签发日', 'Permit issue date'],
  'us.field.permitExpiresOn': ['回美证到期日', 'Permit expiry date'],
  'us.field.permitRestrictedToOneYear': [
    '回美证有效期限于 1 年',
    'Permit limited to one year',
  ],
  'us.field.permitBiometricsInUs': [
    '在美国完成生物信息采集',
    'Biometrics taken in the U.S.',
  ],
  'us.field.abandonment': [
    '未放弃永久居留（保有美国住所的意图）',
    'Residence not abandoned (intent to keep a U.S. residence)',
  ],
  'us.field.sb1OutsideControl': [
    '因无法控制的原因滞留境外',
    'Delay abroad beyond your control',
  ],
  'us.field.continuousJourneyStartedInTime': [
    '连续行程在绿卡有效时限内开始',
    'Continuous journey began in time',
  ],
  'us.field.feeForm': ['本次要递交的表格', 'Form to file'],
  'us.field.petitioner': ['请愿人现在的身份', 'Petitioner’s current status'],
  'us.field.petitionerAtFiling': [
    'I-130 收件时请愿人的身份',
    'Petitioner’s status at I-130 receipt',
  ],
  'us.field.petitionerNaturalizedOn': [
    '请愿人入籍日期',
    'Date the petitioner naturalized',
  ],
  'us.field.relationship': ['与请愿人的关系', 'Relationship to the petitioner'],
  'us.field.petitionerAge': ['请愿人年龄', 'Petitioner’s age'],
  'us.field.beneficiaryAge': ['受益人年龄', 'Beneficiary’s age'],
  'us.field.childRelationship': [
    '亲子关系类型',
    'Type of parent-child relationship',
  ],
  'us.field.relationshipEstablishedAtAge': [
    '继亲或收养关系成立时子女年龄',
    'Child’s age when the step or adoptive relationship began',
  ],
  'us.field.siblingAdoption': [
    '与已被同一父母收养的兄弟姐妹一并收养',
    'Adopted together with, or after, a sibling adopted by the same parent',
  ],
  'us.field.custodyYears': ['法定监护年数', 'Years of legal custody'],
  'us.field.livedTogetherYears': [
    '与收养父母共同居住年数',
    'Years living with the adoptive parent',
  ],
  'us.field.relationshipValid': [
    '亲属关系有效且有证据',
    'Qualifying relationship established',
  ],
  'us.field.cspaAge': ['CSPA 年龄', 'CSPA age'],
  'us.field.priorMarriageLprSince': [
    '请愿人因前次婚姻取得永久居民身份的日期',
    'Date the petitioner became a permanent resident through a prior marriage',
  ],
  'us.field.priorMarriageException': [
    '前次婚姻限制的例外已证明',
    'Prior marriage exception established',
  ],
  'us.field.marriageDuringRemoval': [
    '在移民程序进行中结婚',
    'Married during immigration proceedings',
  ],
  'us.field.removalMarriageException': [
    '程序中结婚的善意例外已证明',
    'Bona fide marriage exception established',
  ],
  'us.field.livedAbroadAfterMarriageYears': [
    '程序中结婚后在境外居住年数',
    'Years lived abroad after that marriage',
  ],
  'us.field.priorMarriageFraud': [
    '受益人曾有婚姻欺诈认定',
    'Beneficiary previously found to have committed marriage fraud',
  ],
  'us.field.adamWalsh': [
    'Adam Walsh Act 限制已排除',
    'Adam Walsh Act bar cleared',
  ],
  'us.field.category': ['职业移民类别', 'Employment category'],
  'us.field.categoryQualifications': [
    '符合该类别的资格（学历、经验或职位）',
    'Meets the category requirements (degree, experience or position)',
  ],
  'us.field.i140FiledOn': ['I-140 收件日', 'I-140 receipt date'],
  'us.field.priorityDate': ['本请愿的优先日', 'Priority date of this petition'],
  'us.field.i140SelfPetition': ['本人自行递交 I-140', 'Self-petitioned I-140'],
  'us.field.relativePetitioner': [
    '由亲属作为雇主递交',
    'Filed by a relative as employer',
  ],
  'us.field.relativeOwnershipPct': [
    '亲属在雇主中的持股比例（%）',
    'Relatives’ ownership of the employer (%)',
  ],
  'us.field.employerEmployees': ['雇主员工人数', 'Employer’s employees'],
  'us.field.employerNonprofit': ['雇主是非营利机构', 'Nonprofit employer'],
  'us.field.employmentOffer': [
    '请愿职位的有效工作邀约，本人打算接受',
    'Valid offer for the petitioned job that you intend to accept',
  ],
  'us.field.initialSupplementJIncluded': [
    '首次 I-485 附签署的 Supplement J',
    'Signed Supplement J with the initial I-485',
  ],
  'us.field.jobPortability': [
    '更换工作（INA 204(j)）',
    'Job portability (INA 204(j))',
  ],
  'us.field.i485PendingSince': ['I-485 待决起算日', 'Start of I-485 pendency'],
  'us.field.originalOfferValidAtFiling': [
    '递交时原邀约有效且打算接受',
    'Original offer valid at filing and intended to be accepted',
  ],
  'us.field.newOffer': [
    '有真实的永久全职新邀约',
    'Bona fide new permanent full-time offer',
  ],
  'us.field.sameOrSimilarOccupation': [
    '新职位与原职位相同或相似',
    'Same or similar occupation',
  ],
  'us.field.supplementJFiledOn': [
    '新邀约的 Supplement J 递交日',
    'Supplement J filing date for the new offer',
  ],
  'us.field.perm': ['劳工认证（PERM）', 'Labor certification (PERM)'],
  'us.field.permCertificationValidity': [
    '已认证的 PERM 仍然有效',
    'Certified PERM still valid',
  ],
  'us.field.permCertifiedOn': ['PERM 认证日期', 'PERM certification date'],
  'us.field.prevailingWageUsd': [
    '现行工资（美元／年）',
    'Prevailing wage (USD per year)',
  ],
  'us.field.profferedWageUsd': [
    '承诺工资（美元／年）',
    'Proffered wage (USD per year)',
  ],
  'us.field.recruitmentAndFeesCompliant': [
    '招聘程序及费用承担合规',
    'Recruitment and fee payment compliant',
  ],
  'us.field.permRecruitment': ['PERM 招聘记录', 'PERM recruitment record'],
  'us.field.laborCertificationFiledOn': [
    'ETA-9089 收件日（实际或计划）',
    'ETA-9089 receipt date (actual or planned)',
  ],
  'us.field.stateJobOrder': [
    '州劳工局职位登记',
    'State workforce agency job order',
  ],
  'us.field.jobOrderFrom': ['登记开始', 'Job order start'],
  'us.field.jobOrderThrough': ['登记结束', 'Job order end'],
  'us.field.advertisementDates': [
    '必要广告刊登日期',
    'Mandatory advertisement date',
  ],
  'us.field.notice': ['职位通知', 'Notice of filing'],
  'us.field.noticeMethod': ['通知方式', 'Notice method'],
  'us.field.notifiedOn': ['通知工会日期', 'Date the union was notified'],
  'us.field.businessDates': [
    '张贴覆盖的完整工作日',
    'Business day covered by the posting',
  ],
  'us.field.professional': ['属于专业职位', 'Professional occupation'],
  'us.field.extraDistinctSteps': [
    '额外招聘步骤数（专业职位）',
    'Additional recruitment steps (professional occupations)',
  ],
  'us.field.qualifiedAvailableUsWorker': [
    '有合格且可用的美国工人应聘',
    'A qualified and available U.S. worker applied',
  ],
  'us.field.employerPaidPermCosts': [
    '雇主承担全部 PERM 费用',
    'Employer paid all PERM costs',
  ],
  'us.field.officerStatementAccepted': [
    '财务主管声明获接受（大雇主）',
    'Financial officer statement accepted (large employers)',
  ],
  'us.field.wageYears': ['年度支付能力记录', 'Ability-to-pay record'],
  'us.field.wageYear': ['年度', 'Year'],
  'us.field.wageFrom': ['记录开始日', 'Record start date'],
  'us.field.wageThrough': ['记录截止日', 'Record end date'],
  'us.field.paidUsd': [
    '付给受益人的工资（美元）',
    'Wages paid to the beneficiary (USD)',
  ],
  'us.field.netIncomeUsd': ['雇主净收入（美元）', 'Employer net income (USD)'],
  'us.field.netCurrentAssetsUsd': [
    '期末净流动资产（美元）',
    'Net current assets at period end (USD)',
  ],
  'us.field.wagePeriodComplete': [
    '所需初始财务证据完整',
    'Required initial financial evidence complete',
  ],
  'us.field.wagePeriodThrough': [
    '年度记录覆盖至',
    'Annual records cover through',
  ],
  'us.field.priorityYearProration': [
    '优先日所在年度按比例核算',
    'Proration for the priority-date year',
  ],
  'us.field.prorationFinding': [
    'USCIS 接受按比例核算',
    'USCIS accepts proration',
  ],
  'us.field.proratedWageUsd': [
    '该年度确认的按比例工资（美元）',
    'Established prorated wage for that year (USD)',
  ],
  'us.field.abilityToPayTotality': [
    '综合证据认定有支付能力',
    'Ability to pay established on the totality of evidence',
  ],
  'us.field.internationalAward': [
    '获国际重要奖项',
    'Major international award',
  ],
  'us.field.extraordinaryEvidenceCount': [
    '满足的 EB-1A 证据类别数',
    'EB-1A evidence criteria met',
  ],
  'us.field.comparableEvidenceAccepted': [
    '可比证据获接受',
    'Comparable evidence accepted',
  ],
  'us.field.extraordinaryFinalMerits': [
    'EB-1A 终局审查',
    'EB-1A final merits determination',
  ],
  'us.field.continuesWorkInField': [
    '打算继续从事该领域工作并有证据',
    'Intends to continue work in the field, with evidence',
  ],
  'us.field.benefitsUnitedStates': [
    '将显著惠及美国',
    'Will substantially benefit the United States',
  ],
  'us.field.degree': ['学历', 'Degree'],
  'us.field.progressiveExperienceYears': [
    '学士后递进工作经验年数',
    'Years of progressive post-bachelor experience',
  ],
  'us.field.exceptionalEvidenceCount': [
    '满足的特殊能力证据类别数',
    'Exceptional ability criteria met',
  ],
  'us.field.niwProngs': ['NIW 三项标准', 'NIW three prongs'],
  'us.field.nationalImportance': [
    '计划有实质价值和国家重要性',
    'Endeavor has substantial merit and national importance',
  ],
  'us.field.wellPositioned': [
    '本人有能力推进该计划',
    'Well positioned to advance the endeavor',
  ],
  'us.field.waiverBeneficial': [
    '豁免工作邀约和劳工认证对美国有利',
    'Waiving the job offer and labor certification benefits the U.S.',
  ],
  'us.field.niwDetermination': [
    'NIW 国家利益认定',
    'NIW national interest determination',
  ],
  'us.field.investment': ['EB-5 投资', 'EB-5 investment'],
  'us.field.expectedSustainmentYears': [
    '预计维持投资的总年数（含已维持）',
    'Total expected years at risk, including time completed',
  ],
  'us.field.jobCreationPlan': ['就业创造计划', 'Job creation plan'],
  'us.field.jobPlanEvidence': ['计划证据', 'Plan evidence'],
  'us.field.gold': ['Gold Card', 'Gold Card'],
  'us.field.registrationAccepted': ['登记获接受', 'Registration accepted'],
  'us.field.donor': ['赠与方', 'Donor'],
  'us.field.giftUsd': ['赠与金额（美元）', 'Gift amount (USD)'],
  'us.field.processingFundsUsd': [
    '处理费资金（美元）',
    'Processing funds (USD)',
  ],
  'us.field.includedPeople': ['申请包含人数', 'People included'],
  'us.field.fundsAndWire': [
    '资金与电汇合规',
    'Funds and wire transfer compliant',
  ],
  'us.field.giftTransferred': [
    '赠与款已全额转给商务部',
    'Gift fully transferred to Commerce',
  ],
  'us.field.humanitarianStatus': ['身份', 'Status'],
  'us.field.presenceDays': [
    '入境为难民或获批庇护后在美天数',
    'Days in the U.S. since refugee admission or asylum grant',
  ],
  'us.field.presenceThrough': ['天数计算至', 'Days counted through'],
  'us.field.statusRetained': [
    '难民或庇护身份未被终止',
    'Refugee or asylee status not terminated',
  ],
  'us.field.alreadyLpr': ['已是永久居民', 'Already a permanent resident'],
  'us.field.refugeeDefinitionOrDerivative': [
    '仍符合难民定义或为其配偶子女',
    'Still meets the refugee definition or is a spouse or child',
  ],
  'us.field.firmlyResettled': [
    '已在第三国稳定定居',
    'Firmly resettled in another country',
  ],
  'us.field.humanitarianDiscretion': ['裁量审查', 'Discretion'],
  'us.field.waiverFiling': [
    'INA 209(c) 豁免材料可随申请递交',
    'INA 209(c) waiver evidence can be filed with the application',
  ],
  'us.field.humanitarianWaiver': [
    'INA 209(c) 豁免决定',
    'INA 209(c) waiver decision',
  ],
  'us.field.i485PendingEvents': [
    'I-485 待决期间的事件',
    'Event while I-485 is pending',
  ],
  'us.field.eventOn': ['事件日期', 'Event date'],
  'us.field.eventKind': ['事件类型', 'Event type'],
  'us.field.eventFinding': [
    '对裁决的影响（个案结论）',
    'Effect through decision (case finding)',
  ],
  'us.field.eventGround': ['新的不予入境事由', 'New inadmissibility ground'],
  'us.field.eventViolationDays': [
    '截至该事件的累计违规天数',
    'Cumulative violation days through this event',
  ],
  'us.field.qualifyingViolationsThrough': [
    '累计记录覆盖至',
    'Cumulative record covers through',
  ],
  'us.field.eventException': ['个案例外', 'Case-specific exception'],
  'us.field.petitionStatus': ['基础请愿状态', 'Underlying petition status'],
  'us.field.petitionFiledOn': [
    '基础请愿收件日（I-140 以外）',
    'Underlying petition receipt date (other than I-140)',
  ],
  'us.field.qualifyingBasis': [
    '目前仍符合请愿依据（含获批后的重大变化）',
    'Still eligible on the basis, including changes since approval',
  ],
  'us.field.i485FiledOn': ['I-485 收件日', 'I-485 receipt date'],
  'us.field.i485ApplicantRole': [
    '在职业类 I-485 中的身份',
    'Role in the employment-based I-485',
  ],
  'us.field.visaAtFiling': [
    '递交时排期（递交表或 NVC 授权）',
    'Visa availability for filing (filing chart or NVC authorization)',
  ],
  'us.field.nvcFilingOpensOn': [
    '确认的 NVC 开放递件日',
    'Confirmed NVC submission opening date',
  ],
  'us.field.nvcDs260': ['DS-260 提交', 'DS-260 submission'],
  'us.field.nvcCivilDocuments': ['民事文件', 'Civil documents'],
  'us.field.visaAtFilingByMonth': [
    '按月份的递交表排期',
    'Filing chart by month',
  ],
  'us.field.month': ['月份', 'Month'],
  'us.field.availability': ['排期', 'Availability'],
  'us.field.visaAtDecision': [
    '裁决时排期（Final Action Dates）',
    'Visa availability at decision (Final Action Dates)',
  ],
  'us.field.visaAtDecisionByMonth': [
    '按月份的 Final Action Dates',
    'Final Action Dates by month',
  ],
  'us.field.visaInterviewOn': [
    '移民签证面谈日',
    'Immigrant visa interview date',
  ],
  'us.field.decisionOn': ['预计裁决日', 'Expected decision date'],
  'us.field.legalEntry': ['最近一次入境方式', 'Most recent entry'],
  'us.field.entryException': [
    '入境要求的例外已证明',
    'Entry requirement exception established',
  ],
  'us.field.otherAdjustmentBar': ['其他调整身份禁令', 'Other adjustment bars'],
  'us.field.qualifyingViolationsDays': [
    'I-485 收件时的累计违规天数',
    'Cumulative violation days at I-485 receipt',
  ],
  'us.field.lawfulNonimmigrantStatusAtFiling': [
    'I-485 收件时持合法非移民身份',
    'Lawful nonimmigrant status at I-485 receipt',
  ],
  'us.field.lawfulAdmissionFor245k': [
    'I-485 收件时基于合法入境在美（INA 245(k)）',
    'Present after a lawful admission at I-485 receipt (INA 245(k))',
  ],
  'us.field.discretion': ['裁量审查', 'Discretion'],
  'us.field.i485BasisTransfer': [
    'I-485 换基请求',
    'I-485 transfer of underlying basis',
  ],
  'us.field.transferApprovedOn': [
    '换基获批日期',
    'Date the transfer was granted',
  ],
  'us.field.originalPetition': [
    '原请愿（递交时）',
    'Original petition at filing',
  ],
  'us.field.originalFiledOn': [
    '原请愿收件日',
    'Original petition receipt date',
  ],
  'us.field.originalBasis': ['原调整依据', 'Original basis'],
  'us.field.qualifyingBasisAtFiling': [
    '递交时原依据符合（含所需批准）',
    'Original basis met at filing, including any required approval',
  ],
  'us.field.employmentOfferAtFiling': [
    '递交时原邀约有效且打算接受',
    'Original offer valid and intended to be accepted at filing',
  ],
  'us.field.abilityToPayAtFiling': [
    '原雇主至递交时有支付能力',
    'Original employer able to pay through filing',
  ],
  'us.field.originalVisaAtFiling': [
    '原请愿在递交月份的排期',
    'Original petition’s availability in the filing month',
  ],
  'us.field.originalEntryException': [
    '原依据下入境例外',
    'Entry exception under the original basis',
  ],
  'us.field.healthWaiverAtFiling': [
    '递交时健康豁免',
    'Health waiver at filing',
  ],
  'us.field.criminalWaiverAtFiling': [
    '递交时刑事豁免',
    'Criminal waiver at filing',
  ],
  'us.field.immigrationWaiverAtFiling': [
    '递交时移民违规豁免',
    'Immigration violation waiver at filing',
  ],
  'us.field.vawaUnlawfulPresenceExceptionAtFiling': [
    '递交时 VAWA 非法居留例外',
    'VAWA unlawful presence exception at filing',
  ],
  'us.field.supportExemption': ['I-864 法定豁免', 'I-864 statutory exemption'],
  'us.field.qualifyingQuarters': [
    '可计入的社保季度数',
    'Qualifying quarters of work',
  ],
  'us.field.exemptionEvidence': ['豁免证据', 'Exemption evidence'],
  'us.field.sponsorAge': ['担保人年龄', 'Sponsor’s age'],
  'us.field.relationshipToBeneficiary': [
    '担保人与受益人的关系',
    'Sponsor’s relationship to the beneficiary',
  ],
  'us.field.sponsorStatus': ['担保人身份', 'Sponsor’s status'],
  'us.field.supportBeneficiaryAge': ['受益人年龄', 'Beneficiary’s age'],
  'us.field.domiciledInUs': [
    '担保人在美国有住所（domicile）',
    'Sponsor domiciled in the U.S.',
  ],
  'us.field.affidavitSubmitted': [
    '已签署并提交 I-864',
    'I-864 signed and submitted',
  ],
  'us.field.household': ['担保人家庭', 'Sponsor’s household'],
  'us.field.region': ['所在地区', 'Region'],
  'us.field.householdSize': ['家庭人数', 'Household size'],
  'us.field.householdIncomeUsd': [
    '家庭年收入（美元）',
    'Household income (USD per year)',
  ],
  'us.field.activeDuty': [
    '担保人为现役军人，担保配偶或子女',
    'Sponsor on active duty, sponsoring a spouse or child',
  ],
  'us.field.qualifyingAssetsUsd': [
    '可计入的净资产（美元）',
    'Qualifying net assets (USD)',
  ],
  'us.field.orphanException': ['孤儿领养例外', 'Orphan adoption exception'],
  'us.field.jointSponsor': [
    '有独立合格的共同担保人',
    'Independently qualified joint sponsor',
  ],
  'us.field.classAHealth': [
    '无 A 类健康状况或已获处理',
    'No Class A condition, or resolved',
  ],
  'us.field.vaccines': ['疫苗要求', 'Vaccination requirements'],
  'us.field.medicalEvidence': ['体检报告（I-693）', 'Medical report (I-693)'],
  'us.field.i693SignedOn': [
    'I-693 医生签署日',
    'I-693 civil surgeon signature date',
  ],
  'us.field.i693LinkedToAnotherClosedCase': [
    'I-693 曾用于另一宗已结案件',
    'I-693 linked to another closed case',
  ],
  'us.field.i693AtFiling': [
    '随 I-485 提交的原体检报告',
    'Original medical report filed with I-485',
  ],
  'us.field.i693AtDecision': [
    '裁决所用的补充体检报告',
    'Supplemental medical report used at decision',
  ],
  'us.field.healthWaiver': ['健康豁免', 'Health waiver'],
  'us.field.publicChargeExempt': [
    '本申请免于公共负担审查',
    'Exempt from public charge for this application',
  ],
  'us.field.publicCharge': ['公共负担审查', 'Public charge assessment'],
  'us.field.benefits': ['领取的公共福利', 'Public benefits received'],
  'us.field.crime': ['刑事记录', 'Criminal record'],
  'us.field.criminalOtherGround': [
    '其他刑事不予入境事由已排除',
    'Other criminal grounds cleared',
  ],
  'us.field.drugTraffickingBar': [
    '有毒品走私事由',
    'Drug trafficking ground applies',
  ],
  'us.field.criminalWaiver': ['刑事豁免', 'Criminal waiver'],
  'us.field.securityGround': ['安全相关事由', 'Security-related grounds'],
  'us.field.immigrationFraud': [
    '曾以欺诈或虚假陈述获取移民利益',
    'Fraud or misrepresentation for an immigration benefit',
  ],
  'us.field.falseCitizenship': [
    '曾冒称美国公民',
    'False claim to U.S. citizenship',
  ],
  'us.field.falseCitizenshipException': [
    '冒称公民的法定例外适用',
    'Statutory exception to the false claim applies',
  ],
  'us.field.unlawfulDeparture': [
    '非法居留后离境（INA 212(a)(9)(B)）',
    'Departure after unlawful presence (INA 212(a)(9)(B))',
  ],
  'us.field.leftOn': ['离境日期', 'Departure date'],
  'us.field.qualifyingDays': [
    '离境前累计非法居留天数',
    'Unlawful presence days before departure',
  ],
  'us.field.voluntaryBeforeProceedings': [
    '在程序开始前自愿离境',
    'Left voluntarily before proceedings began',
  ],
  'us.field.vawaUnlawfulPresenceException': [
    'VAWA 非法居留例外',
    'VAWA unlawful presence exception',
  ],
  'us.field.unlawfulReentryBar': [
    '仍受非法再入境永久禁令（INA 212(a)(9)(C)）',
    'Still barred for unlawful reentry (INA 212(a)(9)(C))',
  ],
  'us.field.otherInadmissibility': [
    '其他不予入境事由已排除（整体）',
    'Other inadmissibility grounds cleared (overall)',
  ],
  'us.field.otherInadmissibilityByGround': [
    '按款项的其他不予入境事由',
    'Other inadmissibility ground',
  ],
  'us.field.ground': ['INA 212(a) 款项', 'INA 212(a) paragraph'],
  'us.field.groundFinding': ['结论', 'Finding'],
  'us.field.immigrationWaiver': [
    '移民违规豁免',
    'Immigration violation waiver',
  ],
  'us.field.channel': ['递交渠道', 'Filing channel'],
  'us.field.filingOn': ['递交或邮戳日期', 'Filing or postmark date'],
  'us.field.onlineCategoryAvailable': [
    '该表格和类别可以网申',
    'Online filing available for the form and category',
  ],
  'us.field.relief': ['费用减免', 'Fee relief'],
  'us.field.feeHousehold': ['家庭收入', 'Household income'],
  'us.field.receivesMeansTestedBenefit': [
    '正在领取资检福利',
    'Receiving a means-tested benefit',
  ],
  'us.field.extremeFinancialHardship': [
    '极端经济困难',
    'Extreme financial hardship',
  ],
  'us.field.applyingWithParent': [
    '与父母一同递交 I-485（儿童费率）',
    'Filing I-485 with a parent (child fee)',
  ],
  'us.field.premiumProcessing': [
    '申请加急处理（I-907）',
    'Premium processing (I-907)',
  ],
  'us.field.eb5Amendment': ['EB-5 修改申请', 'EB-5 amendment'],
  'us.field.specialFeeExemption': [
    '属于法定免费类别',
    'In a statutory fee-exempt category',
  ],
  'us.field.adjustmentSupplementA': [
    '附 I-485 Supplement A（245(i)）',
    'I-485 Supplement A (245(i))',
  ],
  'us.field.consularFeeCategory': [
    '移民签证费类别',
    'Immigrant visa fee category',
  ],
  'us.field.travelForm': ['出行证件申请', 'Travel document application'],
  'us.field.hr1': ['H.R. 1 附加费项目', 'H.R. 1 fee item'],
  'us.field.pendingI485AdvanceParole': [
    '为待决 I-485 申请 advance parole',
    'Advance parole for a pending I-485',
  ],

  'us.hint.simulationDate': [
    '按这一天判断能否递交或返美，默认今天。',
    'Eligibility to file or return is tested on this date. It starts as today.',
  ],
  'us.hint.pathway': [
    '亲属和职业移民已包含调整身份或领馆程序的核对。“调整身份或领馆移民签证”用于 VAWA、SIJ、245(i) 等其他依据。',
    'Family and employment pathways include the adjustment or consular checks. Use adjustment or consular immigrant visa for other bases such as VAWA, SIJ or 245(i).',
  ],
  'us.hint.dateOfBirth': [
    '用于年龄条件、英语例外、儿童费率和换卡。',
    'Used for age requirements, English exceptions, child fees and card renewal.',
  ],
  'us.hint.process': [
    '在美国境内递交 I-485，或经 NVC 和领馆办理移民签证。',
    'File Form I-485 in the U.S., or apply for an immigrant visa through NVC and a consulate.',
  ],
  'us.hint.adjustmentBasis': [
    '亲属路径只在 VAWA 依据、职业路径只在 SIJ 依据时需要另选。',
    'For the family pathway, choose this only for a VAWA basis. For the employment pathway, choose it only for an SIJ basis.',
  ],
  'us.hint.permanentResident': [
    '条件绿卡也填你本人取得条件身份的那天。',
    'For a conditional green card, enter the date you got conditional status.',
  ],
  'us.hint.conditional': [
    '结婚未满规定年限时取得的婚姻绿卡，以及 EB-5 绿卡，为条件绿卡。',
    'Green cards through a recent marriage, or through EB-5, are conditional.',
  ],
  'us.hint.principalConditional': [
    '随父母或投资人取得条件绿卡时填写。',
    'Enter if you became a conditional resident with a parent or the investor.',
  ],
  'us.hint.separatePetition': [
    '配偶或子女不包括在主申请人的申请中时选“是”。',
    'Choose Yes if a spouse or child is not included in the principal’s petition.',
  ],
  'us.hint.spouseCitizenSince': [
    '出生即为公民可留空。',
    'Leave blank if your spouse is a citizen by birth.',
  ],
  'us.hint.returned': [
    '计划中的行程也可以填。',
    'Planned trips can be included.',
  ],
  'us.hint.i485Travel': [
    '只适用于递交 I-485 之后、裁决之前的出境。',
    'Only for trips after I-485 filing and before the decision.',
  ],
  'us.hint.trips': [
    '取得绿卡后（或 I-485 待决期间）每次离开美国填一行。',
    'Add a row for each time you left the United States after becoming a permanent resident, or while your I-485 is pending.',
  ],
  'us.hint.stateResidenceFrom': [
    '入籍须在递交前在该州或 USCIS 辖区住满规定时间。',
    'Naturalization requires a minimum period in the state or USCIS district before filing.',
  ],
  'us.hint.interviewOn': [
    '提前递交时，辖区居住按面谈日核对。尚无面谈通知可留空。',
    'For early filing, district residence is checked at the interview. Leave blank if not scheduled.',
  ],
  'us.hint.lprResidenceYears': [
    '用于按年龄和永居年数适用的英语与公民考试例外。',
    'Used for the English and civics exceptions based on age and years as a permanent resident.',
  ],
  'us.hint.goodMoralCharacter': [
    '这是对整个记录的整体结论。下列具体禁令会另行核对。',
    'This is the overall finding on the whole record. The specific bars below are checked separately.',
  ],
  'us.hint.crime': [
    '按美国移民法的分类填写，没有记录可填 0。',
    'Use classifications under U.S. immigration law. Enter 0 if there are none.',
  ],
  'us.hint.admissionTriggers': [
    '例如放弃身份、境外犯罪或未经查验入境。离境时长按出入境记录另行计算。',
    'For example abandonment, an offense abroad or entry without inspection. Time abroad is calculated separately from your trips.',
  ],
  'us.hint.returnDocument': [
    '离境未超过规定时长时可凭有效绿卡返美，时限在结果中另行核对。',
    'A valid green card can be used to return after a shorter absence. The time limit is checked separately in the results.',
  ],
  'us.hint.abandonment': [
    '例如保留住所、工作、报税及离境目的的证据。',
    'For example evidence of a home, work, tax filing and the purpose of the trip.',
  ],
  'us.hint.petitionerAtFiling': [
    '请愿人在 I-130 收件后身份有变时填写。',
    'Enter if the petitioner’s status changed after I-130 receipt.',
  ],
  'us.hint.cspaAge': [
    '用于子女类别的年龄认定。尚待个案认定时选“待决／待审”。',
    'Used for child categories. Choose pending if it awaits a case finding.',
  ],
  'us.hint.i140FiledOn': [
    '已递交时填写实际收件日。',
    'Enter the actual receipt date if filed.',
  ],
  'us.hint.priorityDate': [
    '普通 PERM 的优先日是 ETA-9089 收件日，其他类别是 I-140 收件日。缺少这些收件日时填写本请愿的优先日。',
    'Ordinary PERM cases use the ETA-9089 receipt date; other categories use the I-140 receipt date. Enter this petition’s priority date if those receipts are not available.',
  ],
  'us.hint.relativePetitioner': [
    '亲属作为雇主或持股达到规定比例时需要 I-864。',
    'Form I-864 applies when a relative is the employer or owns the required share.',
  ],
  'us.hint.initialSupplementJ': [
    'I-140 已获批时，主申请人首次递交 I-485 须附 Supplement J。',
    'With an approved I-140, the principal applicant includes Supplement J with the initial I-485.',
  ],
  'us.hint.jobPortability': [
    '只在 I-485 待决后更换雇主或职位时填写。',
    'Only if you change employer or job while the I-485 is pending.',
  ],
  'us.hint.laborCertificationFiledOn': [
    '招聘和通知时间按这一天核对。',
    'Recruitment and notice timing are checked against this date.',
  ],
  'us.hint.wageYears': [
    '从优先日所在年度起每年至少一条。同一年分开填写时，各条记录的期间不要重叠；年初至今的累计记录用相同的开始日。',
    'Add at least one entry for each year from the priority-date year. When a year has several entries, their periods must not overlap. Year-to-date entries share the same start date.',
  ],
  'us.hint.wageFrom': [
    '留空表示 1 月 1 日。未获准按比例核算时，优先日所在年度的净收入从 1 月 1 日起填写；按比例核算被拒时，当年所有记录都从 1 月 1 日起。',
    'Blank means 1 January. Without accepted proration, net income for the priority-date year starts on 1 January. If proration was refused, every entry for that year starts on 1 January.',
  ],
  'us.hint.wageThrough': [
    '留空表示年末；在“年度记录覆盖至”所在的年度，表示该日期（未填时为评估日）。',
    'Blank means the end of the year. In the year of “Annual records cover through”, it means that date (or the assessment date if that is blank).',
  ],
  'us.hint.priorityYearProration': [
    'USCIS 按个案接受后，优先日所在年度可只核对优先日之后的部分。',
    'If USCIS accepts it for the case, only the part of the priority-date year after the priority date is checked.',
  ],
  'us.hint.presenceDays': [
    '不含在境外的整天。',
    'Exclude full days spent abroad.',
  ],
  'us.hint.i485PendingEvents': [
    '例如请愿依据丧失、身份到期或新出现的不予入境事由。',
    'For example loss of the qualifying basis, status expiry or a new inadmissibility ground.',
  ],
  'us.hint.petitionStatus': [
    '已获批但不记得收件日也选“已获批”。与 I-485 同时递交选“与 I-485 一同递交”。',
    'Choose approved even if you do not know the receipt date. Choose filed with I-485 for concurrent filing.',
  ],
  'us.hint.petitionFiledOn': [
    '例如 I-130、I-360。I-140 收件日在职业步骤填写。',
    'For example I-130 or I-360. Enter the I-140 receipt date in the employment step.',
  ],
  'us.hint.i485FiledOn': [
    '已递交时填写实际收件日；未递交留空。',
    'Enter the actual receipt date if filed. Leave blank if not yet filed.',
  ],
  'us.hint.visaAtFiling': [
    '境内递交按收件月份的 USCIS 指定排期表；领馆按 NVC 是否授权递件。',
    'In the U.S., use the chart USCIS designates for the receipt month. For consular cases, use whether NVC has authorized submission.',
  ],
  'us.hint.visaAtDecision': [
    '按评估日所在月份的 Final Action Dates。',
    'Use Final Action Dates for the month of the assessment date.',
  ],
  'us.hint.decisionOn': [
    '核准条件按这一天评估。领馆案件为面谈后的裁决日。',
    'Approval requirements are assessed on this date. For consular cases, use the decision date after the interview.',
  ],
  'us.hint.qualifyingViolationsDays': [
    '自相关合法入境起的失去身份、非法工作等违规天数，不重复计算。',
    'Days of status violations or unauthorized work since the relevant lawful admission, counted once.',
  ],
  'us.hint.i485BasisTransfer': [
    '只在 USCIS 处理换基请求时填写。上面的请愿资料填写替换后的依据。',
    'Only for a transfer of basis. The petition answers above describe the replacement basis.',
  ],
  'us.hint.supportHousehold': [
    '包括所有须计入的人，含被担保的移民。',
    'Include everyone required, including the sponsored immigrants.',
  ],
  'us.hint.ground': ['例如 6 或 6(C)。', 'For example 6 or 6(C).'],
  'us.hint.otherInadmissibilityByGround': [
    '逐项填写豁免后的结论。能覆盖所有适用事由时代替上面的整体结论。',
    'Enter findings by ground after any waiver. Complete findings replace the overall answer above.',
  ],
  'us.hint.channel': [
    '留空时按可用渠道推算。',
    'If blank, the available channels are assumed.',
  ],
  'us.hint.filingOn': [
    '用于费用生效日和 I-485 公共负担政策的适用。',
    'Used for fee effective dates and for I-485 public charge policy.',
  ],

  'us.option.US-NATURALIZATION': ['一般入籍', 'General naturalization'],
  'us.option.US-NATURALIZATION.desc': [
    '核对永久居民年限、在美天数、英语与公民考试、品格及宣誓。',
    'Checks years as a permanent resident, physical presence, tests, character and the oath.',
  ],
  'us.option.US-SPOUSE': [
    '美国公民配偶入籍',
    'Naturalization as a U.S. citizen’s spouse',
  ],
  'us.option.US-SPOUSE.desc': [
    '与美国公民结婚并共同生活，适用较短的居住年限。',
    'Married to and living with a U.S. citizen, with a shorter residence period.',
  ],
  'us.option.US-MILITARY': ['军人入籍', 'Military naturalization'],
  'us.option.US-MILITARY.desc': [
    '和平时期或指定敌对期服役。',
    'Peacetime service or service in designated hostilities.',
  ],
  'us.option.US-CONDITIONS': [
    '取消条件绿卡条件',
    'Removal of conditions on residence',
  ],
  'us.option.US-CONDITIONS.desc': [
    '婚姻 I-751 或投资 I-829。',
    'Form I-751 for marriage or Form I-829 for investors.',
  ],
  'us.option.US-TRAVEL': [
    '永久居民身份维持与返美',
    'Retention of permanent residence and return travel',
  ],
  'us.option.US-TRAVEL.desc': [
    '离境时长、返美证件、登记与地址报备。',
    'Time abroad, return documents, registration and address reporting.',
  ],
  'us.option.US-FAMILY': ['亲属移民绿卡', 'Family-based immigration'],
  'us.option.US-FAMILY.desc': [
    'I-130、I-864 及境内调整或领馆程序。',
    'Form I-130, Form I-864 and adjustment or consular processing.',
  ],
  'us.option.US-EMPLOYMENT': [
    '职业、投资与 Gold Card 移民',
    'Employment, investor and Gold Card immigration',
  ],
  'us.option.US-EMPLOYMENT.desc': [
    'EB-1 至 EB-3、NIW、EB-5 与 Gold Card。',
    'EB-1 to EB-3, NIW, EB-5 and the Gold Card.',
  ],
  'us.option.US-ADJUSTMENT': [
    '调整身份或领馆移民签证',
    'Adjustment of status or consular immigrant visa',
  ],
  'us.option.US-ADJUSTMENT.desc': [
    'VAWA、SIJ、245(i) 或其他依据。',
    'VAWA, SIJ, 245(i) or another basis.',
  ],
  'us.option.US-HUMANITARIAN': [
    '难民与受庇护者转永居',
    'Refugee and asylee adjustment of status',
  ],
  'us.option.US-HUMANITARIAN.desc': [
    '按 INA 209 申请绿卡。',
    'Apply for a green card under INA 209.',
  ],
  'us.option.adjustment': [
    '境内调整身份（I-485）',
    'Adjustment of status (I-485)',
  ],
  'us.option.consular': ['领馆移民签证', 'Consular immigrant visa'],
  'us.option.immediate-relative': ['直系亲属', 'Immediate relative'],
  'us.option.family-preference': ['亲属优先类别', 'Family preference'],
  'us.option.employment': ['职业类', 'Employment-based'],
  'us.option.vawa': ['VAWA', 'VAWA'],
  'us.option.sij': [
    'SIJ（特殊未成年移民）',
    'SIJ (Special Immigrant Juvenile)',
  ],
  'us.option.245i': ['245(i)', '245(i)'],
  'us.option.other': ['其他', 'Other'],
  'us.option.none': ['无', 'None'],
  'us.option.regular': ['一般绿卡（无条件）', 'Regular (no conditions)'],
  'us.option.marriage': [
    '婚姻条件绿卡（I-751）',
    'Conditional through marriage (I-751)',
  ],
  'us.option.investor': [
    '投资条件绿卡（I-829）',
    'Conditional through investment (I-829)',
  ],
  'us.option.advance-parole': ['Advance parole', 'Advance parole'],
  'us.option.nonimmigrant': [
    '有效非移民身份（如 H-1B、L-1）',
    'Valid nonimmigrant status (such as H-1B or L-1)',
  ],
  'us.option.tps': ['TPS', 'TPS'],
  'us.option.refugee-travel-document': [
    '难民旅行证件',
    'Refugee travel document',
  ],
  'us.option.other-209': [
    'INA 209 下的其他返美依据',
    'Other INA 209 return basis',
  ],
  'us.option.peacetime': ['和平时期（INA 328）', 'Peacetime (INA 328)'],
  'us.option.hostilities': [
    '指定敌对期（INA 329）',
    'Designated hostilities (INA 329)',
  ],
  'us.option.n426': ['经认证的 N-426', 'Certified Form N-426'],
  'us.option.dd214-or-ngb22': ['DD-214 或 NGB-22', 'DD-214 or NGB-22'],
  'us.option.serving': ['仍在服役', 'Still serving'],
  'us.option.pending': ['待决／待审', 'Pending'],
  'us.option.final': ['已有最终递解令', 'Final order'],
  'us.option.passed': ['已通过', 'Passed'],
  'us.option.failed': ['未通过', 'Failed'],
  'us.option.retest': ['待重考', 'Retest scheduled'],
  'us.option.preparing': ['准备中', 'Preparing'],
  'us.option.single-simple-cannabis': [
    '仅一次单纯持有大麻供自用',
    'A single offense of simple possession of marijuana for own use',
  ],
  'us.option.otherSubstance': [
    '其他受管制物质罪行',
    'Another controlled substance offense',
  ],
  'us.option.current': ['现在是党员', 'Current member'],
  'us.option.former': ['曾是党员', 'Former member'],
  'us.option.involuntary': ['非自愿', 'Involuntary'],
  'us.option.unknowing': ['不知情', 'Without knowledge'],
  'us.option.law': ['依法强制', 'Required by law'],
  'us.option.necessities': ['为获取生活必需', 'For necessities of life'],
  'us.option.unclassified': ['尚未分类', 'Not yet classified'],
  'us.option.clear': ['无问题', 'Clear'],
  'us.option.fraud': ['欺诈领取福利', 'Benefits obtained by fraud'],
  'us.option.wilful-nonsupport': [
    '故意不履行抚养义务',
    'Wilful failure to support dependants',
  ],
  'us.option.intentional-reduced-work': [
    '为领福利故意减少工作',
    'Intentionally reduced work to obtain benefits',
  ],
  'us.option.review': ['须个案审查', 'Needs case review'],
  'us.option.not-required': ['无须登记', 'Not required to register'],
  'us.option.registered': ['已登记', 'Registered'],
  'us.option.required-unregistered': [
    '应登记但未登记',
    'Required but did not register',
  ],
  'us.option.willing': [
    '愿意按标准誓词宣誓',
    'Willing to take the standard oath',
  ],
  'us.option.affirmation': [
    '以声明代替宣誓',
    'Affirmation in place of an oath',
  ],
  'us.option.refuses': ['拒绝宣誓', 'Refuses'],
  'us.option.modified': ['申请修改誓词', 'Modified oath requested'],
  'us.option.disability-waiver': [
    '因残疾申请豁免宣誓',
    'Disability waiver of the oath',
  ],
  'us.option.standard': ['一般项目', 'Standard project'],
  'us.option.tea': ['目标就业区（TEA）', 'Targeted employment area (TEA)'],
  'us.option.infrastructure': ['基础设施项目', 'Infrastructure project'],
  'us.option.joint': ['夫妻联名递交', 'Joint filing'],
  'us.option.separate-child': ['子女单独递交', 'Child filing separately'],
  'us.option.death': ['配偶已去世', 'Spouse has died'],
  'us.option.divorce': ['已离婚或婚姻撤销', 'Divorce or annulment'],
  'us.option.abuse': ['遭受家暴或极端残忍对待', 'Battery or extreme cruelty'],
  'us.option.hardship': ['极端困难', 'Extreme hardship'],
  'us.option.unregistered': ['未登记', 'Not registered'],
  'us.option.diplomatic-child-review': [
    '外交豁免人员子女，需另行核对',
    'Child of a diplomat, needs review',
  ],
  'us.option.no-move': ['未搬家', 'Have not moved'],
  'us.option.not-reported': ['尚未报备', 'Not reported'],
  'us.option.not-filed': ['尚未递交', 'Not filed'],
  'us.option.age-14': ['达到换卡年龄', 'Reaching the re-registration age'],
  'us.option.renewal': ['到期换发', 'Renewal'],
  'us.option.error-or-not-delivered': [
    'USCIS 错误或卡未送达',
    'USCIS error or card not delivered',
  ],
  'us.option.triggered': ['已触发', 'Triggered'],
  'us.option.green-card': ['有效绿卡', 'Valid green card'],
  'us.option.reentry-permit': ['回美证', 'Reentry permit'],
  'us.option.sb1': ['SB-1 返美签证', 'SB-1 returning resident visa'],
  'us.option.continuous-journey': ['连续行程', 'Continuous journey'],
  'us.option.i90': ['I-90 换卡', 'I-90 card replacement'],
  'us.option.i131': ['I-131 回美证', 'I-131 reentry permit'],
  'us.option.ds117': ['DS-117 SB-1 资格申请', 'DS-117 SB-1 eligibility'],
  'us.option.i131a': ['I-131A 运输信', 'I-131A carrier documentation'],
  'us.option.ar11': ['AR-11 地址变更', 'AR-11 change of address'],
  'us.option.g325r': ['G-325R 登记', 'G-325R registration'],
  'us.option.citizen': ['美国公民', 'U.S. citizen'],
  'us.option.lpr': ['永久居民', 'Permanent resident'],
  'us.option.spouse': ['配偶', 'Spouse'],
  'us.option.unmarried-child': ['未婚子女', 'Unmarried son or daughter'],
  'us.option.married-child': ['已婚子女', 'Married son or daughter'],
  'us.option.parent': ['父母', 'Parent'],
  'us.option.sibling': ['兄弟姐妹', 'Brother or sister'],
  'us.option.biological': ['亲生', 'Biological'],
  'us.option.step': ['继亲', 'Step'],
  'us.option.adopted': ['收养', 'Adopted'],
  'us.option.not-applicable': ['不适用', 'Not applicable'],
  'us.option.eb1a': ['EB-1A 杰出人才', 'EB-1A extraordinary ability'],
  'us.option.eb1b': [
    'EB-1B 杰出教授或研究人员',
    'EB-1B outstanding professor or researcher',
  ],
  'us.option.eb1c': [
    'EB-1C 跨国经理或高管',
    'EB-1C multinational manager or executive',
  ],
  'us.option.eb2-perm': ['EB-2（PERM）', 'EB-2 (PERM)'],
  'us.option.eb2-niw': [
    'EB-2 国家利益豁免（NIW）',
    'EB-2 national interest waiver (NIW)',
  ],
  'us.option.eb3': ['EB-3', 'EB-3'],
  'us.option.eb5': ['EB-5 投资移民', 'EB-5 investor'],
  'us.option.gold-card': ['Gold Card', 'Gold Card'],
  'us.option.principal': ['主申请人', 'Principal'],
  'us.option.derivative': ['随行家属', 'Derivative'],
  'us.option.certified': ['已认证', 'Certified'],
  'us.option.schedule-a': ['Schedule A', 'Schedule A'],
  'us.option.union': [
    '通知工会代表',
    'Notice to the bargaining representative',
  ],
  'us.option.posting': ['在工作地点张贴', 'Posting at the worksite'],
  'us.option.advanced': ['硕士或以上', 'Advanced degree'],
  'us.option.bachelor': ['学士', 'Bachelor’s degree'],
  'us.option.individual': ['个人', 'Individual'],
  'us.option.company': ['公司', 'Company'],
  'us.option.refugee': ['难民', 'Refugee'],
  'us.option.asylee': ['受庇护者', 'Asylee'],
  'us.option.not-needed': ['不需要豁免', 'No waiver needed'],
  'us.option.qualifying-basis': ['请愿依据变化', 'Change in qualifying basis'],
  'us.option.procedure': [
    '程序事项（如未到面谈）',
    'Procedural event (such as a missed interview)',
  ],
  'us.option.nonimmigrant-status-expiry': [
    '非移民身份到期',
    'Nonimmigrant status expired',
  ],
  'us.option.admissibility': ['新的不予入境事由', 'New inadmissibility ground'],
  'us.option.unauthorized-employment': ['非法工作', 'Unauthorized employment'],
  'us.option.immigrationFraud': ['移民欺诈', 'Immigration fraud'],
  'us.option.falseCitizenship': ['冒称公民', 'False claim to citizenship'],
  'us.option.unlawfulReentryBar': ['非法再入境禁令', 'Unlawful reentry bar'],
  'us.option.filed-with-i485': ['与 I-485 一同递交', 'Filed with the I-485'],
  'us.option.approved': ['已获批', 'Approved'],
  'us.option.available': ['有名额', 'Available'],
  'us.option.unavailable': ['无名额', 'Unavailable'],
  'us.option.future-bulletin': ['待未来排期公布', 'Awaiting a future bulletin'],
  'us.option.submitted': ['已提交', 'Submitted'],
  'us.option.not-submitted': ['未提交', 'Not submitted'],
  'us.option.complete': ['齐全', 'Complete'],
  'us.option.missing': ['缺少', 'Missing'],
  'us.option.nonavailability-explained': [
    '无法取得并已说明',
    'Unavailable and explained',
  ],
  'us.option.admitted': ['经查验入境', 'Inspected and admitted'],
  'us.option.paroled': ['假释入境（parole）', 'Paroled'],
  'us.option.without-inspection': [
    '未经查验入境',
    'Entered without inspection',
  ],
  'us.option.vwp': ['免签计划（VWP）入境', 'Visa Waiver Program entry'],
  'us.option.barred': ['受禁令限制', 'Barred'],
  'us.option.quarters': ['社保工作季度', 'Qualifying quarters of work'],
  'us.option.citizenship-on-admission': [
    '入境即取得公民身份的子女',
    'Child who will become a citizen on admission',
  ],
  'us.option.widow': [
    '美国公民的遗孀／鳏夫',
    'Widow or widower of a U.S. citizen',
  ],
  'us.option.national': ['美国国民', 'U.S. national'],
  'us.option.contiguous': [
    '美国本土 48 州及华盛顿特区',
    '48 contiguous states and D.C.',
  ],
  'us.option.alaska': ['阿拉斯加', 'Alaska'],
  'us.option.hawaii': ['夏威夷', 'Hawaii'],
  'us.option.pre-change-cash-or-institutional': [
    '政策变更前的现金援助或长期机构照护',
    'Cash assistance or long-term institutional care before the policy change',
  ],
  'us.option.pre-change-other': [
    '政策变更前的其他福利',
    'Other benefits before the policy change',
  ],
  'us.option.post-change-means-tested': [
    '政策变更后的资检福利',
    'Means-tested benefits after the policy change',
  ],
  'us.option.nonwaivable': [
    '不可豁免的安全事由',
    'Non-waivable security ground',
  ],
  'us.option.other-bar': ['其他安全禁令', 'Other security bar'],
  'us.option.online': ['网申', 'Online'],
  'us.option.paper': ['纸质', 'Paper'],
  'us.option.waiver': ['费用豁免（I-912）', 'Fee waiver (I-912)'],
  'us.option.reduced': ['减费（N-400）', 'Reduced fee (N-400)'],
  'us.option.family': ['亲属类', 'Family'],
  'us.option.diversity': ['多元化签证', 'Diversity visa'],
  'us.option.refugee-document': ['难民旅行证件', 'Refugee travel document'],
  'us.option.asylum-initial': ['庇护申请首年费', 'Initial asylum fee'],
  'us.option.asylum-annual': ['庇护待决年费', 'Annual asylum fee'],
  'us.option.work-initial': ['工卡首次申请', 'Initial work permit'],
  'us.option.work-renewal-asylum': [
    '庇护类工卡续期',
    'Asylum work permit renewal',
  ],
  'us.option.work-renewal-other': ['其他工卡续期', 'Other work permit renewal'],
  'us.option.parole': ['假释（parole）申请', 'Parole request'],
  'us.option.i94': ['I-94', 'I-94'],
} as const;

type Messages = Record<keyof typeof messages, string>;

function translations(language: 0 | 1): Messages {
  return Object.fromEntries(
    Object.entries(messages).map(([key, values]) => [key, values[language]]),
  ) as Messages;
}

export const usFormZh = translations(0);
export const usFormEn = translations(1);
