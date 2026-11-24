const messages = {
  'jp.form.optionalGroup': [
    '本组可留空。如果填写了组内资料，请同时完成标星号的项目。',
    'You can leave this group blank. If you enter details, also complete the fields marked with an asterisk.',
  ],
  'jp.form.step0': ['模拟日期与申请路径', 'Dates and routes to assess'],
  'jp.form.step1': ['出境记录', 'Trips abroad'],
  'jp.form.step2': [
    '永住许可路径条件',
    'Permanent residence route requirements',
  ],
  'jp.form.step3': [
    '在留身份、品行与公共义务',
    'Status, conduct and public obligations',
  ],
  'jp.form.step4': [
    '永住的生计、语言与申请材料',
    'Permanent residence finances, language and documents',
  ],
  'jp.form.step5': [
    '帰化条件与材料',
    'Naturalisation requirements and documents',
  ],
  'jp.form.step6': ['再入国与旅行证件', 'Re-entry and travel documents'],
  'jp.form.scope': [
    '请选择需要一起评估的路径，可多选。',
    'Select all the routes you would like to assess together.',
  ],
  'jp.form.optional': [
    '只填写已知事实。标有星号的项目必填，其余证据可留待确认。',
    'Enter the facts you know. Fields marked with an asterisk are required. Other evidence can be left open for confirmation.',
  ],
  'jp.form.baseline': [
    '留空时按模拟日期评估。改动评估所用的递交日后，请重新确认当天的在日情况、合法在留及适用的高度人材证据。',
    'Leave blank to use the simulation date. If the filing date changes, confirm presence in Japan, lawful status and any applicable highly skilled evidence for the new date.',
  ],
  'jp.form.history': [
    '添加每次离境和返日的日期，包括需要纳入计算的计划行程。没有出境记录可直接继续。',
    'Add the departure and return dates of each trip, including planned travel you want to count. Continue directly if there are no trips.',
  ],
  'jp.form.talent': [
    '当前和历史积分证据须分别注明基准日。遇窗口休息日顺延，请核对顺延后递交日的证据。',
    'Date each current and historical record separately. If the counter is closed, check the evidence for the next filing day.',
  ],
  'jp.form.travelHint': [
    '拟出境可先填行程。只有实际出境时已经表明返日意图，才能将该项选为“是”。',
    'For a planned trip, enter the itinerary. Select Yes for the declaration of intent only after you have actually made it at departure.',
  ],
  'jp.form.unknown': ['待确认', 'To confirm'],
  'jp.form.choose': ['请选择', 'Choose one'],
  'jp.form.yes': ['是', 'Yes'],
  'jp.form.no': ['否', 'No'],
  'jp.form.noneYet': ['尚未持有符合条件的资格', 'No qualifying status held'],
  'jp.form.sameStart': [
    '与旧指南的起点相同',
    'Same as under the earlier guideline',
  ],
  'jp.form.noNotice': ['已确认尚未申报', 'Confirmed still unreported'],
  'jp.form.indefinite': ['无限期', 'Indefinite'],
  'jp.form.add': ['添加一条记录', 'Add a record'],
  'jp.form.noRecords': ['确认没有此类记录', 'Confirm there are no records'],
  'jp.form.emptyConfirmed': ['已确认没有此类记录', 'Confirmed no records'],
  'jp.form.resetRecords': ['改为待确认', 'Mark as unconfirmed'],
  'jp.form.remove': ['删除这条记录', 'Remove this record'],
  'jp.form.noExtra': [
    '此路径使用共同信息，无需另填路径专属字段。',
    'This route uses your shared details and needs no further route-specific entries.',
  ],
  'jp.form.routeError': [
    '请至少选择一条要评估的路径。',
    'Choose at least one route to assess.',
  ],
  'jp.form.required': ['请填写或选择这一项。', 'Complete this field.'],
  'jp.form.numberError': [
    '请填写有效的非负数。',
    'Enter a valid non-negative number.',
  ],
  'jp.form.integerError': [
    '请填写有效的非负整数。',
    'Enter a valid non-negative whole number.',
  ],
  'jp.form.declarationError': [
    '请先核对实际出境日期，拟出境的返日意图尚待确认。',
    'Check the actual departure date. Intent at departure is still unconfirmed for a planned journey.',
  ],
  'jp.form.pr': ['永住許可', 'Permanent residence (永住許可)'],
  'jp.form.nat': ['帰化', 'Naturalisation (帰化)'],
  'jp.form.travel': ['再入国与旅行证件', 'Re-entry and travel documents'],
  'jp.form.prIdentity': ['身份与家庭', 'Identity and family'],
  'jp.form.prConduct': [
    '素行、公共义务与在留活动',
    'Conduct, public obligations and activities',
  ],
  'jp.form.prFinances': ['家庭收入与保障', 'Household finances and support'],
  'jp.form.prLanguage': [
    '日语、融入与子女就学',
    'Japanese, integration and schooling',
  ],
  'jp.form.prFiling': ['担保、材料与费用', 'Guarantor, documents and fees'],
  'jp.form.natDomicile': [
    '住所、行为能力与生计',
    'Domicile, capacity and means of support',
  ],
  'jp.form.natIntegration': ['国籍与融入', 'Nationality and integration'],
  'jp.form.natFiling': ['公共义务与递交手续', 'Public obligations and filing'],
  'jp.form.dateOrNone': [
    '如已持有，填写连续持有的起始日期。',
    'If you hold a qualifying status, enter the date you began holding it continuously.',
  ],
  'jp.form.newStatusHint': [
    '若新旧指南的起点相同，可复制上方日期。如不符合新版要求，请选择尚未持有。',
    'Copy the earlier date if the same start applies. If your status no longer qualifies, select “No qualifying status held”.',
  ],
  'jp.form.tripExpiry': [
    '填出境时获准在留的最后一天。留空表示在返日前未到期，或属于无限期在留。',
    'Enter the last day of the stay permitted at departure. A blank means it did not end before your return or your stay is indefinite.',
  ],
  'jp.form.noticeHint': [
    '已申报请填日期。明确尚未申报可勾选下方选项，其余情况留空。',
    'Enter the date if filed. Tick the box if you know it remains unreported. Otherwise leave it blank.',
  ],
  'jp.form.domicileHint': [
    '未另填起算日时，使用第一步填写的在留开始日。',
    'If you leave this date blank, the start of your stay from the first step is used.',
  ],
  'jp.pr.general': ['一般永住', 'General permanent residence'],
  'jp.pr.spouse': [
    '日本人、永住者或特別永住者的配偶者',
    'Spouse of a Japanese national, permanent resident or special permanent resident',
  ],
  'jp.pr.child': [
    '日本人、永住者或特別永住者的子女（变更资格）',
    'Child of a Japanese national, permanent resident or special permanent resident (change of status)',
  ],
  'jp.pr.child-birth': [
    '在日出生取得永住者资格',
    'Acquisition of permanent resident status at birth in Japan',
  ],
  'jp.pr.teijusha': ['定住者', 'Long-term resident (定住者)'],
  'jp.pr.refugee': [
    '难民或补完的保护对象者',
    'Refugee or beneficiary of complementary protection',
  ],
  'jp.pr.hsp70': [
    '高度人材 70 点路线',
    'Highly skilled professional, 70-point route',
  ],
  'jp.pr.hsp80': [
    '高度人材 80 点路线',
    'Highly skilled professional, 80-point route',
  ],
  'jp.pr.j-skip': [
    '特別高度人材（J-Skip）',
    'Special highly skilled professional (J-Skip)',
  ],
  'jp.pr.international-protection': [
    '国际保护推荐',
    'International protection recommendation',
  ],
  'jp.pr.regional-regeneration': ['地域再生计划', 'Regional regeneration plan'],
  'jp.pr.structural-zone': [
    '構造改革特別区域',
    'Structural reform special zone',
  ],
  'jp.pr.japan-contribution': ['对日本有贡献者', 'Contribution to Japan'],
  'jp.nat.general': ['一般帰化', 'Ordinary naturalisation'],
  'jp.nat.spouse': ['日本国民配偶者', 'Spouse of a Japanese national'],
  'jp.nat.article-6-former-national-child': [
    '第6条 · 原日本国民的实子',
    'Article 6 · biological child of a former Japanese national',
  ],
  'jp.nat.article-6-japan-birth': [
    '第6条 · 在日本出生',
    'Article 6 · birth in Japan',
  ],
  'jp.nat.article-6-long-residence': [
    '第6条 · 长期居住',
    'Article 6 · long residence',
  ],
  'jp.nat.article-8-japanese-child': [
    '第8条 · 日本国民的实子',
    'Article 8 · biological child of a Japanese national',
  ],
  'jp.nat.article-8-adopted-child': [
    '第8条 · 日本国民的养子',
    'Article 8 · adopted child of a Japanese national',
  ],
  'jp.nat.article-8-former-national': [
    '第8条 · 原日本国民',
    'Article 8 · former Japanese national',
  ],
  'jp.nat.article-8-stateless-from-birth': [
    '第8条 · 出生起无国籍',
    'Article 8 · stateless since birth',
  ],
  'jp.nat.article-9-special-merit': [
    '第9条 · 对日本有特别功劳',
    'Article 9 · exceptional service to Japan',
  ],
  'jp.travel.ordinary': ['普通再入国許可', 'Ordinary re-entry permit'],
  'jp.travel.deemed': ['みなし再入国許可', 'Deemed re-entry'],
  'jp.travel.refugee-travel-document': [
    '難民旅行証明書',
    'Refugee travel document',
  ],
  'jp.field.simulationDate': ['模拟日期', 'Simulation date'],
  'jp.field.stayStart': [
    '在日本连续在留的开始日',
    'Start of your unbroken stay in Japan',
  ],
  'jp.field.applicationDate': ['拟递交日期', 'Intended filing date'],
  'jp.field.dateOfBirth': ['出生日期', 'Date of birth'],
  'jp.field.trips': ['出境记录', 'Trips abroad'],
  'jp.field.departed': ['离开日本的日期', 'Date you left Japan'],
  'jp.field.returned': ['回到日本的日期', 'Date you returned to Japan'],
  'jp.field.departure': ['孩子的出境方式', 'How the child leaves Japan'],
  'jp.field.stayExpiry': [
    '出境时的在留期限',
    'Period of stay expiry at departure',
  ],
  'jp.field.reentryPermit': [
    '返日时是否持有仍在有效期内的普通再入国许可？',
    'Did you hold a valid ordinary re-entry permit when you returned?',
  ],
  'jp.field.renewalPending': [
    '出境时，是否已按期申请续期或变更并仍在等待决定？',
    'Was a timely renewal or change application still pending at departure?',
  ],
  'jp.field.statusStart': [
    '连续持有旧指南认可的就労或居住资格的起始日',
    'Continuous work or residence status under the earlier guideline, from',
  ],
  'jp.field.longTermFrom': [
    '连续持定住者资格的起始日',
    'Continuous long-term resident status, from',
  ],
  'jp.field.protectionFrom': [
    '难民或补完的保护认定日',
    'Date refugee or complementary protection was recognised',
  ],
  'jp.field.pointsFrom': [
    '持续达到所选路径积分的起始日',
    'Date you began continuously meeting this route’s points level',
  ],
  'jp.field.newStatusStart': [
    '按新版指南连续持有符合条件资格的起始日',
    'Continuous qualifying status under the revised guideline, from',
  ],
  'jp.field.excluded': [
    '新版指南不计入在留年限的期间',
    'Periods excluded under the revised guideline',
  ],
  'jp.field.from': ['开始日期', 'Start date'],
  'jp.field.to': ['结束日期', 'End date'],
  'jp.field.marriedLifeFrom': ['实际婚姻生活开始日', 'Date married life began'],
  'jp.field.bornInJapan': ['是否在日本出生？', 'Born in Japan?'],
  'jp.field.bornOn': ['出生日期', 'Date of birth'],
  'jp.field.withoutLanding': [
    '是否未经上陆手续而出生在留？',
    'Resident from birth without a landing procedure?',
  ],
  'jp.field.acquisitionAccepted': [
    '取得在留资格的申请是否已获认可？',
    'Has acquisition of the status of residence been accepted?',
  ],
  'jp.field.birthRegisteredOn': [
    '出生届申报日期',
    'Date the birth was registered',
  ],
  'jp.field.plansToStayPastPermitlessPeriod': [
    '是否计划在无需许可的期间结束后继续留日？',
    'Planning to remain after the period allowed without status?',
  ],
  'jp.field.heldAnotherStatus': [
    '是否已取得其他在留资格？',
    'Has another status of residence been obtained?',
  ],
  'jp.field.mode': [
    '人才资格的证明方式',
    'How the highly skilled status is evidenced',
  ],
  'jp.field.recognisedOn': ['正式认定日期', 'Date of official recognition'],
  'jp.field.recognisedPoints': [
    '认定时的官方积分',
    'Points at official recognition',
  ],
  'jp.field.maintained': [
    '从认定起是否一直保持所需积分？',
    'Were the required points maintained after recognition?',
  ],
  'jp.field.remainedRecognised': [
    '是否持续持有特別高度人材认定？',
    'Has special highly skilled recognition been maintained?',
  ],
  'jp.field.current': [
    '当前基准日证据',
    'Evidence at the current reference date',
  ],
  'jp.field.historical': [
    '历史基准日证据',
    'Evidence at the historical reference date',
  ],
  'jp.field.on': ['证据对应的基准日', 'Reference date for this evidence'],
  'jp.field.confirmedPoints': [
    '有官方记录的积分总数',
    'Officially confirmed total points',
  ],
  'jp.field.complete': [
    '是否已列全加分材料？',
    'Have all bonus items been accounted for?',
  ],
  'jp.field.age': [
    '基准日年龄（周岁）',
    'Age in whole years on the reference date',
  ],
  'jp.field.activity': ['活动类别', 'Activity category'],
  'jp.field.qualifyingActivity': [
    '合同、活动及所属机构是否符合要求？',
    'Do the contract, activity and host institution qualify?',
  ],
  'jp.field.remunerationYen': [
    '符合范围的年报酬（日元）',
    'Qualifying annual remuneration (JPY)',
  ],
  'jp.field.education': ['最高学历或学位', 'Highest qualifying degree'],
  'jp.field.relevantExperienceYears': [
    '相关从业年数',
    'Years of relevant experience',
  ],
  'jp.field.multipleGraduateFields': [
    '是否有多个专业领域的研究生学位？',
    'Graduate degrees in multiple fields?',
  ],
  'jp.field.patents': ['符合要求的专利数量', 'Qualifying patents'],
  'jp.field.qualifyingResearchGrants': [
    '符合要求的研究资助项目数',
    'Qualifying research grants',
  ],
  'jp.field.qualifyingPublications': [
    '符合要求的学术论文数',
    'Qualifying research publications',
  ],
  'jp.field.equivalentResearch': [
    '是否有获认定的同等研究成就？',
    'Equivalent research achievements recognised?',
  ],
  'jp.field.technicalQualifications': [
    '符合要求的技术资格',
    'Qualifying technical qualifications',
  ],
  'jp.field.position': ['企业职务', 'Management position'],
  'jp.field.innovationEmployer': [
    '所属机构的创新支援类别',
    'Innovation support category of the employer',
  ],
  'jp.field.smallBusinessResearchPercent': [
    '中小企业研究支出占比（%）',
    'Small business research expenditure (%)',
  ],
  'jp.field.foreignQualification': [
    '是否持有认可的外国资格？',
    'Do you hold a recognised foreign qualification?',
  ],
  'jp.field.japanHigherEducation': [
    '是否在日本完成高等教育？',
    'Did you complete higher education in Japan?',
  ],
  'jp.field.japaneseEvidence': [
    '已取得的日语证明',
    'Japanese language evidence held',
  ],
  'jp.field.bjtScore': ['BJT 成绩', 'BJT score'],
  'jp.field.advancedProject': [
    '是否参与指定先进项目？',
    'Participating in a designated advanced project?',
  ],
  'jp.field.designatedUniversity': [
    '是否毕业于指定大学？',
    'Graduate of a designated university?',
  ],
  'jp.field.designatedTraining': [
    '完成的指定培训',
    'Designated training completed',
  ],
  'jp.field.regionalEmployer': [
    '所属机构是否为指定地域机构？',
    'Is the host a designated regional organisation?',
  ],
  'jp.field.designatedFinance': [
    '是否从事指定金融业务？',
    'Engaged in designated financial activities?',
  ],
  'jp.field.personalInvestmentYen': [
    '个人投资金额（日元）',
    'Personal investment (JPY)',
  ],
  'jp.field.confirmed': [
    '该基准日的 J-Skip 资格是否已获确认？',
    'Was J-Skip eligibility confirmed on this reference date?',
  ],
  'jp.field.planRecognised': [
    '地域再生计划是否获认定？',
    'Has the regional regeneration plan been recognised?',
  ],
  'jp.field.institutionInArea': [
    '所属机构是否位于计划区域？',
    'Is the institution within the plan area?',
  ],
  'jp.field.designatedInstitutionAndContract': [
    '是否与指定机构签订符合要求的合同？',
    'Do you have a qualifying contract with a designated institution?',
  ],
  'jp.field.activityNotice': [
    '适用的特定活動告示编号',
    'Applicable Designated Activities notice number',
  ],
  'jp.field.activityQualified': [
    '活动内容是否符合告示？',
    'Does the activity qualify under the notice?',
  ],
  'jp.field.comparableJapanesePay': [
    '报酬是否达到同岗位日本人的水平？',
    'Is pay comparable to that of a Japanese worker in the same role?',
  ],
  'jp.field.qualifyingTechnologyEducation': [
    '是否接受过符合要求的技术教育？',
    'Do you have qualifying technical education?',
  ],
  'jp.field.designatedItQualification': [
    '是否具备指定 IT 资格？',
    'Do you hold a designated IT qualification?',
  ],
  'jp.field.technologyExperienceYears': [
    '技术相关工作年数',
    'Years of technical work',
  ],
  'jp.field.recognisedContribution': [
    '贡献是否获主管部门认可？',
    'Has the authority recognised the contribution?',
  ],
  'jp.field.recognisedZone': [
    '是否属于获认可的特区？',
    'Is the special zone recognised?',
  ],
  'jp.field.designatedBusiness': [
    '是否从事指定事业？',
    'Are you engaged in the designated business?',
  ],
  'jp.field.category': ['贡献类别', 'Contribution category'],
  'jp.field.roleYears': ['从事该职务的年数', 'Years in the role'],
  'jp.field.investmentYen': ['投资金额（日元）', 'Investment (JPY)'],
  'jp.field.designatedCategoryEvidence': [
    '能否证明符合指定贡献类别？',
    'Is there evidence for the designated category?',
  ],
  'jp.field.oldSocialLifeClear': [
    '是否满足旧指南的社会生活条件？',
    'Is the social conduct requirement under the earlier guideline satisfied?',
  ],
  'jp.field.japaneseCitizen': [
    '是否已具日本国籍？',
    'Do you already have Japanese nationality?',
  ],
  'jp.field.inJapan': ['递交时是否在日本？', 'In Japan when filing?'],
  'jp.field.status': ['当前在留资格', 'Current status of residence'],
  'jp.field.statusKind': ['在留资格类别', 'Status of residence category'],
  'jp.field.valid': [
    '递交当日的在留是否有效？',
    'Is the status valid on the filing date?',
  ],
  'jp.field.grantedPeriodMonths': [
    '获准在留期间（月）',
    'Granted period of stay (months)',
  ],
  'jp.field.expiresOn': ['到期日', 'Expiry date'],
  'jp.field.timelyRenewalPending': [
    '是否已按期申请续期或资格变更，且尚待决定？',
    'Is a timely renewal or change still pending?',
  ],
  'jp.field.heldThreeYearPeriodOnTransitionDay': [
    '在过渡基准日（{date}）是否持三年在留期间？',
    'Did you hold a three-year period of stay on the transition date ({date})?',
  ],
  'jp.field.transitionPermitExpiresOn': [
    '过渡安排所涉许可的到期日',
    'Expiry of the permit covered by the transition',
  ],
  'jp.field.firstApplicationAfterTransition': [
    '是否为过渡日后的首次永住申请？',
    'Is this the first permanent residence application after the transition?',
  ],
  'jp.field.decisionOn': ['处分决定日期', 'Date of the decision'],
  'jp.field.authorityConfirmedLongest': [
    '入管是否确认已持最长在留期间？',
    'Has immigration confirmed you hold the longest period of stay?',
  ],
  'jp.field.fitsCurrentCriteria': [
    '是否符合目前在留资格的许可标准？',
    'Are the current criteria for this status met?',
  ],
  'jp.field.businessManager': [
    '経営・管理资格材料',
    'Business Manager evidence',
  ],
  'jp.field.subjectToRevisedCriteria': [
    '是否适用修订后的経営・管理标准？',
    'Do the revised Business Manager criteria apply?',
  ],
  'jp.field.officeInJapan': [
    '是否在日本设有营业场所？',
    'Is there a business office in Japan?',
  ],
  'jp.field.eligibleEmployees': [
    '符合条件的雇员人数',
    'Number of eligible employees',
  ],
  'jp.field.assetsYen': ['事业资产（日元）', 'Business assets (JPY)'],
  'jp.field.confirmedB2': [
    '经营者或符合条件的雇员是否已证明 B2 日语能力？',
    'Has the manager or an eligible employee established B2 Japanese?',
  ],
  'jp.field.relevantGraduateDegree': [
    '是否取得符合要求的研究生学位？',
    'Do you hold a qualifying graduate degree?',
  ],
  'jp.field.managementExperienceYears': [
    '经营管理经验年数',
    'Years of management experience',
  ],
  'jp.field.planProfessionallyConfirmed': [
    '事业计划是否已由专业人士确认？',
    'Has the business plan been confirmed by a qualified professional?',
  ],
  'jp.field.family': [
    '家庭关系与亲属身份',
    'Family relationship and relative’s status',
  ],
  'jp.field.relativeStatus': ['有关家庭成员的身份', 'Relative’s status'],
  'jp.field.relation': [
    '与该家庭成员的关系',
    'Your relationship to this relative',
  ],
  'jp.field.genuineMarriage': [
    '婚姻是否真实且持续？',
    'Is the marriage genuine and continuing?',
  ],
  'jp.field.confirmedStatutoryFamily': [
    '是否获认定为法定家庭例外？',
    'Has the statutory family exception been confirmed?',
  ],
  'jp.field.protectionRecognition': [
    '保护认定状态',
    'Protection recognition status',
  ],
  'jp.field.internationalProtectionConfirmed': [
    '国际保护推荐是否已确认？',
    'Has the international protection recommendation been confirmed?',
  ],
  'jp.field.goodConductConfirmed': [
    '主管部门是否认可素行善良？',
    'Has the authority confirmed good conduct?',
  ],
  'jp.field.criminalHistory': ['刑事或交通记录', 'Criminal or traffic history'],
  'jp.field.nationalInterestConfirmed': [
    '是否已获认定符合日本国益？',
    'Has the authority confirmed the national interest requirement?',
  ],
  'jp.field.absenceReasonsConfirmedReasonable': [
    '入管是否认可长期离境理由？',
    'Has immigration accepted the reasons for extended absences?',
  ],
  'jp.field.japanMainHomeIntended': [
    '是否打算以日本为主要住所？',
    'Do you intend to make Japan your main home?',
  ],
  'jp.field.contributionEvidence': [
    '能否提供对日本作出贡献的证据？',
    'Is there evidence of contributions to Japan?',
  ],
  'jp.field.statusActivitiesCompliant': [
    '活动是否符合在留资格？',
    'Have activities complied with the status of residence?',
  ],
  'jp.field.residenceCardDutiesCompliant': [
    '是否履行在留卡相关义务？',
    'Have you complied with residence card duties?',
  ],
  'jp.field.affiliationNotices': [
    '所属机构或相关身份变动申报记录',
    'Notices of changes in affiliation or status',
  ],
  'jp.field.addressNotices': ['住居地申报记录', 'Address notifications'],
  'jp.field.eventOn': ['发生变动的日期', 'Date of the change'],
  'jp.field.notifiedOn': [
    '向主管机构申报的日期',
    'Date the change was reported',
  ],
  'jp.field.tax': ['纳税情况', 'Tax payments'],
  'jp.field.pension': ['公共年金缴费情况', 'Public pension payments'],
  'jp.field.publicHealthInsurance': [
    '公共医疗保险缴费情况',
    'Public health insurance payments',
  ],
  'jp.field.actualAddressAndRegister': [
    '实际住址与登记是否相符？',
    'Does the registered address match the actual address?',
  ],
  'jp.field.livelihoodConfirmed': [
    '主管部门是否认可生计能力？',
    'Has the authority confirmed your means of support?',
  ],
  'jp.field.applicantAnnualIncomeYen': [
    '本人可计入的年收入（日元）',
    'Your includable annual income (JPY)',
  ],
  'jp.field.household': [
    '家庭成员与受扶养人',
    'Household members and dependants',
  ],
  'jp.field.relationship': [
    '该成员的共同生活或扶养关系',
    'Household or dependency relationship',
  ],
  'jp.field.incomeTreatment': [
    '该成员收入的认定类别',
    'Treatment of this member’s income',
  ],
  'jp.field.annualIncomeYen': [
    '该成员的年收入（日元）',
    'Member’s annual income (JPY)',
  ],
  'jp.field.householdIncomeConfirmed': [
    '家庭收入是否已获主管部门认可？',
    'Has the authority accepted the household income?',
  ],
  'jp.field.pendingOnIncomeReviewDate': [
    '收入审查切换日当天申请是否仍在审理？',
    'Was the application pending on the income review transition date?',
  ],
  'jp.field.expectedAnnualPensionYen': [
    '本人预计年金年额（日元）',
    'Your expected annual pension (JPY)',
  ],
  'jp.field.spouseExpectedAnnualPensionYen': [
    '配偶预计年金年额（日元）',
    'Spouse’s expected annual pension (JPY)',
  ],
  'jp.field.pensionSupplementAssetsYen': [
    '可补充年金的长期资产（日元）',
    'Assets available to supplement the pension (JPY)',
  ],
  'jp.field.pensionComparisonConfirmed': [
    '年金与补充资产比较是否获认可？',
    'Has the pension and asset comparison been accepted?',
  ],
  'jp.field.publicAssistance': [
    '社会援助领取情况',
    'Public assistance received',
  ],
  'jp.field.publicBurdenConfirmedAcceptable': [
    '主管部门是否认可公共负担情况？',
    'Has the authority accepted the public burden assessment?',
  ],
  'jp.field.humanitarianCircumstances': [
    '是否有人道情形？',
    'Are humanitarian circumstances present?',
  ],
  'jp.field.publicHealthCleared': [
    '公共卫生条件是否已确认满足？',
    'Have the public health requirements been cleared?',
  ],
  'jp.field.otherLandingGroundsCleared': [
    '其他上陆拒否事由是否已排除？',
    'Have other grounds for refusal of landing been cleared?',
  ],
  'jp.field.guarantor': ['身元保証人的在日身份', 'Guarantor’s status in Japan'],
  'jp.field.guarantorDocumentsReady': [
    '身元保証人材料是否齐备？',
    'Are the guarantor’s documents ready?',
  ],
  'jp.field.guarantorAcceptedOrWaived': [
    '身元保証人是否获认可或已获豁免？',
    'Has the guarantor been accepted or the requirement waived?',
  ],
  'jp.field.qualifyingHspApplicantOrFamily': [
    '是否属于认可的高度人才本人或家属？',
    'Are you a qualifying highly skilled applicant or family member?',
  ],
  'jp.field.otherLanguageExemptionConfirmed': [
    '其他日语豁免是否获确认？',
    'Has another Japanese language exemption been confirmed?',
  ],
  'jp.field.qualifyingSchoolYears': [
    '符合条件的日本学校教育年数',
    'Qualifying years of schooling in Japan',
  ],
  'jp.field.raisingParentB1Confirmed': [
    '养育者的 B1 日语是否获认可？',
    'Has the parent raising the child established B1 Japanese?',
  ],
  'jp.field.japaneseB1Confirmed': [
    '本人的 B1 日语是否获入管认可？',
    'Has immigration accepted your B1 Japanese?',
  ],
  'jp.field.integrationKnowledgeConfirmed': [
    '对日本制度及生活规则的理解是否获认可？',
    'Has knowledge of Japanese institutions and daily life been accepted?',
  ],
  'jp.field.schoolChildren': [
    '学龄申请人及其养育的子女',
    'School-age applicant and children being raised',
  ],
  'jp.field.attendance': ['就学情况', 'School attendance'],
  'jp.field.authorityAccepted': [
    '替代就学安排是否获认可？',
    'Has the authority accepted the alternative schooling arrangement?',
  ],
  'jp.field.filer': ['递交申请的人', 'Person filing the application'],
  'jp.field.documentsReady': [
    '所需材料是否齐备？',
    'Are the required documents ready?',
  ],
  'jp.field.photoReady': ['照片是否备妥？', 'Is the photograph ready?'],
  'jp.field.photoRequiredByAuthority': [
    '主管部门是否要求提供照片？',
    'Has the authority requested a photograph?',
  ],
  'jp.field.specialPermission': ['特别许可经历', 'Special permission history'],
  'jp.field.permissionKind': ['特别许可类别', 'Type of special permission'],
  'jp.field.grantedOn': ['许可日期', 'Date granted'],
  'jp.field.feeReduction': ['手续费减免状态', 'Fee reduction status'],
  'jp.field.integratedCard': ['一体化在留卡', 'Integrated residence card'],
  'jp.field.requested': [
    '是否申请一体化在留卡？',
    'Do you request an integrated card?',
  ],
  'jp.field.immigrationChargeApplies': [
    '是否适用入管手续费？',
    'Does the immigration charge apply?',
  ],
  'jp.field.jLisChargeApplies': [
    '是否适用 J-LIS 费用？',
    'Does the J-LIS fee apply?',
  ],
  'jp.field.electronicCertificate': [
    '是否需要电子证书？',
    'Do you request an electronic certificate?',
  ],
  'jp.field.homeMajorityAge': [
    '本国法成年年龄（周岁）',
    'Age of majority under your home law (whole years)',
  ],
  'jp.field.marriedOn': ['结婚登记日', 'Date the marriage was registered'],
  'jp.field.stillJapaneseSpouse': [
    '目前是否仍是日本国民的配偶者？',
    'Are you still married to a Japanese national?',
  ],
  'jp.field.biologicalChildOfFormerNational': [
    '是否为原日本国民的亲生子女？',
    'Are you a biological child of a former Japanese national?',
  ],
  'jp.field.biologicalParentBornInJapan': [
    '亲生父母之一是否在日本出生？',
    'Was a biological parent born in Japan?',
  ],
  'jp.field.authorityConfirmsOverseasBirthBranch': [
    '法务局是否认可境外出生情形适用本条？',
    'Has the bureau accepted the overseas birth branch of this article?',
  ],
  'jp.field.biologicalChildOfJapaneseNational': [
    '是否为日本国民的亲生子女？',
    'Are you a biological child of a Japanese national?',
  ],
  'jp.field.adoptedByJapaneseNational': [
    '是否已被日本国民收养？',
    'Have you been adopted by a Japanese national?',
  ],
  'jp.field.adoptedWhileMinorUnderHomeLaw': [
    '收养时按本国法是否未成年？',
    'Were you a minor under your home law when adopted?',
  ],
  'jp.field.lostJapaneseNationality': [
    '是否曾失去日本国籍？',
    'Have you previously lost Japanese nationality?',
  ],
  'jp.field.lostAfterNaturalising': [
    '是否在归化成为日本国民后失去该国籍？',
    'Was Japanese nationality lost after naturalising in Japan?',
  ],
  'jp.field.statelessSinceBirth': [
    '是否自出生起无国籍？',
    'Have you been stateless since birth?',
  ],
  'jp.field.domiciledContinuouslySinceBirth': [
    '是否从出生起连续在日本设有住所？',
    'Continuously domiciled in Japan since birth?',
  ],
  'jp.field.specialMeritConfirmed': [
    '对日本的特别功劳是否获认可？',
    'Has exceptional service to Japan been recognised?',
  ],
  'jp.field.dietApproval': [
    '国会是否已批准？',
    'Has the National Diet approved?',
  ],
  'jp.field.lawfulDomicile': [
    '日本住所是否建立在合法在留基础上？',
    'Is your domicile in Japan based on lawful status?',
  ],
  'jp.field.domicileFrom': [
    '在日本设有住所的起始日',
    'Start of domicile in Japan',
  ],
  'jp.field.residenceFrom': [
    '在日本设有居所的起始日',
    'Start of residence in Japan',
  ],
  'jp.field.capacityUnderHomeLaw': [
    '按本国法是否具有行为能力？',
    'Do you have legal capacity under your home law?',
  ],
  'jp.field.criminalOrTrafficHistory': [
    '刑事与交通违规记录',
    'Criminal and traffic records',
  ],
  'jp.field.nationality': [
    '归化时现国籍的处理',
    'Effect of naturalisation on current nationality',
  ],
  'jp.field.cannotLoseNationalityByOwnChoice': [
    '本人是否无法主动退出原国籍？',
    'Is loss of the current nationality beyond your control?',
  ],
  'jp.field.ministerialExceptionConfirmed': [
    '法务大臣是否已认可国籍例外？',
    'Has the Minister accepted a nationality exception?',
  ],
  'jp.field.constitutionalConditionConfirmed': [
    '是否已确认符合宪法遵守条件？',
    'Has the constitutional condition been confirmed?',
  ],
  'jp.field.integratedIntoJapanConfirmed': [
    '是否已确认融入日本社会？',
    'Has integration into Japanese society been confirmed?',
  ],
  'jp.field.japaneseLanguage': [
    '归化的日语能力',
    'Japanese proficiency for naturalisation',
  ],
  'jp.field.speaking': ['日语会话能力', 'Spoken Japanese'],
  'jp.field.reading': ['日语阅读能力', 'Japanese reading'],
  'jp.field.writing': ['日语书写能力', 'Japanese writing'],
  'jp.field.authorityConfirmed': [
    '日语能力是否获法务局确认？',
    'Has the Legal Affairs Bureau confirmed your Japanese proficiency?',
  ],
  'jp.field.requiredInterviewAndAssessmentComplete': [
    '要求的面谈与评估是否已完成？',
    'Have the required interview and assessment been completed?',
  ],
  'jp.field.residenceEvidenceReady': [
    '在留与住所证明是否备妥？',
    'Is evidence of residence and domicile ready?',
  ],
  'jp.field.healthInsuranceEvidenceReady': [
    '医疗保险材料是否备妥？',
    'Is health insurance evidence ready?',
  ],
  'jp.field.motivationReady': [
    '归化动机书是否备妥？',
    'Is the written statement of motivation ready?',
  ],
  'jp.field.oathReady': ['宣誓材料是否备妥？', 'Are the oath materials ready?'],
  'jp.field.plansToLiveInJapan': [
    '是否计划继续在日本生活？',
    'Do you plan to continue living in Japan?',
  ],
  'jp.field.filedAtJurisdictionalBureau': [
    '是否向管辖法务局递交？',
    'Is the application filed with the competent bureau?',
  ],
  'jp.field.writtenDocumentsAndTranslationsReady': [
    '书面材料与译文是否齐备？',
    'Are written documents and translations ready?',
  ],
  'jp.field.officialGazetteOn': [
    '官报公告日期',
    'Official Gazette publication date',
  ],
  'jp.field.familyRegistrationOn': ['户籍届出日期', 'Family registration date'],
  'jp.field.departureOn': [
    '出境日期（实际或计划）',
    'Departure date (actual or planned)',
  ],
  'jp.field.returnOn': [
    '返日日期（实际或计划）',
    'Return date (actual or planned)',
  ],
  'jp.field.stayExpiresOn': ['在留期限届满日', 'End of period of stay'],
  'jp.field.stayIndefinite': [
    '在留期间是否为无限期？',
    'Is your period of stay indefinite?',
  ],
  'jp.field.renewalDecisionOn': [
    '续期或变更决定日期',
    'Date of renewal or change decision',
  ],
  'jp.field.specialPermanentResident': [
    '是否为特別永住者？',
    'Are you a special permanent resident?',
  ],
  'jp.field.lawfulStatus': [
    '是否持合法在留资格？',
    'Do you hold lawful status?',
  ],
  'jp.field.permitVoided': [
    '许可是否已失效或被撤销？',
    'Has the permit been voided?',
  ],
  'jp.field.travelDocumentLost': [
    '旅行证件是否遗失？',
    'Has the travel document been lost?',
  ],
  'jp.field.expiryCertificateObtained': [
    '是否已取得再入国许可期限证明？',
    'Have you obtained a certificate of re-entry permit validity?',
  ],
  'jp.field.newLandingOn': ['重新上陆日期', 'Date of new landing'],
  'jp.field.permit': [
    '签发的许可或旅行证件',
    'Issued permit or travel document',
  ],
  'jp.field.effectiveOn': ['生效日期', 'Effective date'],
  'jp.field.extendedUntil': ['延期后的有效期截止日', 'Extended expiry date'],
  'jp.field.extensionApproved': [
    '延期是否已获批准？',
    'Has the extension been approved?',
  ],
  'jp.field.entryDeadline': [
    '证件上另行指定的入境期限',
    'Separate entry deadline shown on the document',
  ],
  'jp.field.entryDeadlineNotSpecified': [
    '是否已确认证件未另行指定入境期限？',
    'Is it confirmed that no separate entry deadline was specified?',
  ],
  'jp.field.excludedStatusOrDetention': [
    '是否属于排除资格或处于收容中？',
    'Do you have an excluded status or are you in detention?',
  ],
  'jp.field.inJapanWhenApplying': [
    '申请再入国许可时是否在日本？',
    'Are you in Japan when applying for the permit?',
  ],
  'jp.field.intendsReturn': [
    '是否有返日意图？',
    'Do you intend to return to Japan?',
  ],
  'jp.field.passportOrApprovedAlternative': [
    '是否有护照或认可的替代文件？',
    'Do you have a passport or approved alternative?',
  ],
  'jp.field.residentCardOrCertificate': [
    '是否持有所需的在留卡或特別永住者证明书？',
    'Do you hold the required residence card or special permanent resident certificate?',
  ],
  'jp.field.visits': [
    '申请单次或多次许可',
    'Single or multiple entries requested',
  ],
  'jp.field.channel': ['递交渠道', 'Filing channel'],
  'jp.field.onlineConcurrentEligibleApplication': [
    '是否同时在线递交符合条件的在留申请？',
    'Is an eligible status application being filed online at the same time?',
  ],
  'jp.field.previouslyUsedSingleEntry': [
    '单次许可是否已使用？',
    'Has the single-entry permit already been used?',
  ],
  'jp.field.consularExtension': [
    '是否通过领事机构延期？',
    'Is the extension handled at a consulate?',
  ],
  'jp.field.consularArea': [
    '办理延期的领区',
    'Consular area handling the extension',
  ],
  'jp.field.extensionFeeOn': [
    '延期手续费适用日期',
    'Date for the extension fee',
  ],
  'jp.field.temporaryVisitor': [
    '是否持短期滞在资格？',
    'Do you hold Temporary Visitor status?',
  ],
  'jp.field.originalStayMonths': [
    '原获准在留期间（月）',
    'Original period of stay (months)',
  ],
  'jp.field.passportValid': ['护照是否有效？', 'Is your passport valid?'],
  'jp.field.formalPermitRequired': [
    '是否被要求取得普通再入国许可？',
    'Are you required to obtain an ordinary re-entry permit?',
  ],
  'jp.field.declaredIntentAtDeparture': [
    '实际出境时，是否已向入管表明将返日？',
    'Did you declare your intention to return when you actually departed?',
  ],
  'jp.field.refugeeRecognition': [
    '是否已获难民认定？',
    'Have you been recognised as a refugee?',
  ],
  'jp.field.hasJapaneseTravelDocument': [
    '是否持日本签发的難民旅行証明書？',
    'Do you hold a refugee travel document issued by Japan?',
  ],
  'jp.option.none': ['无', 'None'],
  'jp.option.deemed': ['みなし再入国許可', 'Deemed re-entry'],
  'jp.option.permit': ['普通再入国許可', 'Ordinary re-entry permit'],
  'jp.option.recognised': ['以正式认定证明', 'Official recognition'],
  'jp.option.retrospective': [
    '按基准日回溯核算',
    'Retrospective assessment on reference dates',
  ],
  'jp.option.research': ['高度学术研究活动', 'Advanced academic research'],
  'jp.option.technical': [
    '高度专门或技术活动',
    'Advanced specialised or technical activities',
  ],
  'jp.option.management': [
    '高度经营或管理活动',
    'Advanced business management',
  ],
  'jp.option.doctorate': ['博士', 'Doctorate'],
  'jp.option.businessProfessional': [
    '经营管理专业学位',
    'Professional business degree',
  ],
  'jp.option.graduate': ['研究生学位', 'Graduate degree'],
  'jp.option.undergraduate': [
    '大学本科学历或同等资格',
    'Undergraduate degree or equivalent',
  ],
  'jp.option.one': ['一项', 'One'],
  'jp.option.two': ['两项', 'Two'],
  'jp.option.equivalent-higher-category': [
    '认可的更高或同等类别',
    'Equivalent or higher category',
  ],
  'jp.option.representative': ['代表取締役', 'Representative director'],
  'jp.option.director': ['取締役', 'Director'],
  'jp.option.standard': ['受创新支援的机构', 'Innovation-supported employer'],
  'jp.option.small-business': [
    '受创新支援的中小企业',
    'Innovation-supported small business',
  ],
  'jp.option.N1-equivalent': ['相当于 JLPT N1', 'JLPT N1 equivalent'],
  'jp.option.N2-equivalent': ['相当于 JLPT N2', 'JLPT N2 equivalent'],
  'jp.option.foreign-japanese-major': [
    '海外大学日语专业',
    'Japanese major at an overseas university',
  ],
  'jp.option.japanese-higher-education': [
    '在日本高等教育机构培训',
    'Training at a Japanese higher education institution',
  ],
  'jp.option.other': ['其他', 'Other'],
  'jp.option.government-award': ['日本政府表彰', 'Japanese government award'],
  'jp.option.public-service': ['公务或公共服务', 'Public service'],
  'jp.option.international-award': ['国际奖项', 'International award'],
  'jp.option.diplomatic': ['外交贡献', 'Diplomatic contribution'],
  'jp.option.international-organisation': [
    '国际组织任职',
    'International organisation role',
  ],
  'jp.option.prime-director': [
    '上市企业董事（Prime 市场）',
    'Director of a Prime Market company',
  ],
  'jp.option.national-award': ['全国性奖项', 'National award'],
  'jp.option.cultural-award': ['文化奖项', 'Cultural award'],
  'jp.option.world-sport': [
    '世界级体育成绩',
    'World-level sporting achievement',
  ],
  'jp.option.old-company-management': [
    '旧指南 · 企业经营',
    'Earlier guideline · company management',
  ],
  'jp.option.old-investment': [
    '旧指南 · 投资',
    'Earlier guideline · investment',
  ],
  'jp.option.old-professional-contribution': [
    '旧指南 · 专业贡献',
    'Earlier guideline · professional contribution',
  ],
  'jp.option.old-cultural-leadership': [
    '旧指南 · 文化领导力',
    'Earlier guideline · cultural leadership',
  ],
  'jp.option.old-education': ['旧指南 · 教育', 'Earlier guideline · education'],
  'jp.option.old-research': ['旧指南 · 研究', 'Earlier guideline · research'],
  'jp.option.old-international-sport': [
    '旧指南 · 国际体育',
    'Earlier guideline · international sport',
  ],
  'jp.option.old-public-interest': [
    '旧指南 · 公益',
    'Earlier guideline · public interest',
  ],
  'jp.option.old-management': [
    '旧指南 · 经营管理',
    'Earlier guideline · management',
  ],
  'jp.option.old-growing-sector': [
    '旧指南 · 成长产业',
    'Earlier guideline · growth industry',
  ],
  'jp.option.official': ['公用', 'Official'],
  'jp.option.professor': ['教授', 'Professor'],
  'jp.option.artist': ['芸術', 'Artist'],
  'jp.option.religious': ['宗教', 'Religious activities'],
  'jp.option.journalist': ['報道', 'Journalist'],
  'jp.option.hsp1': ['高度専門職1号', 'Highly Skilled Professional (i)'],
  'jp.option.hsp2': ['高度専門職2号', 'Highly Skilled Professional (ii)'],
  'jp.option.businessManager': ['経営・管理', 'Business Manager'],
  'jp.option.legalAccounting': [
    '法律・会計業務',
    'Legal and accounting services',
  ],
  'jp.option.medical': ['医療', 'Medical services'],
  'jp.option.researcher': ['研究', 'Researcher'],
  'jp.option.instructor': ['教育', 'Instructor'],
  'jp.option.engineer': [
    '技術・人文知識・国際業務',
    'Engineer / Specialist in Humanities / International Services',
  ],
  'jp.option.transfer': ['企業内転勤', 'Intra-company transferee'],
  'jp.option.nursing': ['介護', 'Nursing care'],
  'jp.option.entertainer': ['興行', 'Entertainer'],
  'jp.option.skilledLabour': ['技能', 'Skilled labour'],
  'jp.option.specifiedSkilled1': [
    '特定技能1号',
    'Specified Skilled Worker (i)',
  ],
  'jp.option.specifiedSkilled2': [
    '特定技能2号',
    'Specified Skilled Worker (ii)',
  ],
  'jp.option.technicalIntern1': [
    '技能実習1号',
    'Technical Intern Training (i)',
  ],
  'jp.option.technicalIntern2or3': [
    '技能実習2号或3号',
    'Technical Intern Training (ii) or (iii)',
  ],
  'jp.option.cultural': ['文化活動', 'Cultural activities'],
  'jp.option.student': ['留学', 'Student'],
  'jp.option.clinicalTraining': ['临床研修', 'Clinical training'],
  'jp.option.trainee': ['研修', 'Trainee'],
  'jp.option.dependent': ['家族滞在', 'Dependent'],
  'jp.option.designatedActivity': ['特定活動', 'Designated activities'],
  'jp.option.designatedEpa': ['特定活動（EPA）', 'Designated activities (EPA)'],
  'jp.option.japaneseFamily': [
    '日本人の配偶者等',
    'Spouse or child of a Japanese national',
  ],
  'jp.option.prFamily': [
    '永住者の配偶者等',
    'Spouse or child of a permanent resident',
  ],
  'jp.option.teijusha': ['定住者', 'Long-term resident'],
  'jp.option.permanent': ['永住者', 'Permanent resident'],
  'jp.option.special-permanent': ['特別永住者', 'Special permanent resident'],
  'jp.option.diplomat': ['外交', 'Diplomat'],
  'jp.option.temporary-visitor': ['短期滞在', 'Temporary visitor'],
  'jp.option.japanese': ['日本国民', 'Japanese national'],
  'jp.option.spouse': ['配偶者', 'Spouse'],
  'jp.option.biological-child': ['亲生子女', 'Biological child'],
  'jp.option.special-adoption': ['特別養子', 'Special adoption'],
  'jp.option.other-adoption': ['其他收养', 'Other adoption'],
  'jp.option.refugee': ['难民', 'Refugee'],
  'jp.option.complementary-protection': [
    '补完的保护对象者',
    'Beneficiary of complementary protection',
  ],
  'jp.option.pending': ['正在审理', 'Pending'],
  'jp.option.custody': ['拘禁刑等', 'Custodial sentence'],
  'jp.option.fine': ['罚金', 'Criminal fine'],
  'jp.option.juvenile-order': ['少年保护处分', 'Juvenile order'],
  'jp.option.arrest-only': ['仅曾被逮捕', 'Arrest only'],
  'jp.option.traffic-penalty': ['交通处罚', 'Traffic penalty'],
  'jp.option.on-time': ['按期缴纳', 'Paid on time'],
  'jp.option.lawful-exemption': ['依法豁免', 'Lawfully exempt'],
  'jp.option.late-paid': ['迟缴后缴清', 'Paid after the deadline'],
  'jp.option.unpaid': ['仍欠缴', 'Outstanding'],
  'jp.option.shared-home-and-budget': [
    '同住且共同生计',
    'Shares your home and finances',
  ],
  'jp.option.nonresident-dependant': [
    '非同住受扶养人',
    'Non-resident dependant',
  ],
  'jp.option.excluded': ['不计入的成员', 'Excluded member'],
  'jp.option.eligible': ['可计入', 'Eligible income'],
  'jp.option.nonqualifying-activity': [
    '不符合条件的活动收入',
    'Income from non-qualifying activities',
  ],
  'jp.option.parents-not-supporting-applicant': [
    '未扶养申请人的父母收入',
    'Income of parents who do not support the applicant',
  ],
  'jp.option.received': ['已领取生活保護', 'Received public assistance'],
  'jp.option.statutory-insurance': [
    '法定社会保险给付',
    'Statutory insurance benefit',
  ],
  'jp.option.japanese-resident': [
    '在日日本国民',
    'Japanese national resident in Japan',
  ],
  'jp.option.permanent-resident': ['永住者', 'Permanent resident'],
  'jp.option.special-permanent-resident': [
    '特別永住者',
    'Special permanent resident',
  ],
  'jp.option.other-resident': ['其他在留者', 'Other resident'],
  'jp.option.primary-or-junior-high': [
    '就读小学或初中',
    'Attending primary or junior high school',
  ],
  'jp.option.not-attending': ['未就学', 'Not attending'],
  'jp.option.alternative': ['其他安排', 'Alternative schooling'],
  'jp.option.self': ['本人', 'Applicant'],
  'jp.option.legal-representative': ['法定代理人', 'Legal representative'],
  'jp.option.approved-intermediary': ['获准代办者', 'Approved intermediary'],
  'jp.option.stay': ['在留特別許可', 'Special permission to stay'],
  'jp.option.landing-refusal': ['上陸特別許可', 'Special permission to land'],
  'jp.option.approved': ['已批准', 'Approved'],
  'jp.option.denied': ['已拒绝', 'Denied'],
  'jp.option.requested': ['已申请，尚待决定', 'Requested and pending'],
  'jp.option.not-requested': ['未申请', 'Not requested'],
  'jp.option.relevant-record': ['有相关记录', 'Relevant record'],
  'jp.option.uncertain': ['尚不清楚', 'Uncertain'],
  'jp.option.confirmed-stateless': ['已确认无国籍', 'Confirmed stateless'],
  'jp.option.all-nationalities-lost-on-naturalisation': [
    '归化后将失去现有全部国籍',
    'All current nationalities lost on naturalisation',
  ],
  'jp.option.will-retain-nationality': [
    '将保留其他国籍',
    'Will retain another nationality',
  ],
  'jp.option.independent': ['能够独立完成', 'Independent'],
  'jp.option.needs-help': ['需要协助', 'Needs help'],
  'jp.option.unable': ['尚不能完成', 'Unable'],
  'jp.option.single': ['单次', 'Single entry'],
  'jp.option.multiple': ['多次', 'Multiple entry'],
  'jp.option.counter': ['窗口', 'Counter'],
  'jp.option.online': ['线上', 'Online'],
  'jp.option.china-mainland': ['中国大陆领区', 'Mainland China'],
} as const;

type JapanFormMessages = Record<keyof typeof messages, string>;

function translations(language: 0 | 1): JapanFormMessages {
  return Object.fromEntries(
    Object.entries(messages).map(([key, values]) => [key, values[language]]),
  ) as JapanFormMessages;
}

export const jpFormZh = translations(0);
export const jpFormEn = translations(1);
