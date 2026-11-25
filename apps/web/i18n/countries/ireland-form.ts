// Questionnaire wording for Ireland: ie.field.<label>, ie.hint.<hint> and
// ie.option.<label>.<value> follow lib/ireland-fields.ts.
const messages = {
  'ie.form.step0': ['日期与评估路径', 'Dates and pathways'],
  'ie.form.step1': [
    '许可、出入境与登记',
    'Permissions, travel and registration',
  ],
  'ie.form.step2': ['入籍条件与材料', 'Naturalisation requirements'],
  'ie.form.step3': ['就业类 Stamp 4 升级', 'Work Stamp 4 upgrade'],
  'ie.form.step4': ['家庭居留', 'Family permission'],
  'ie.form.step5': [
    'Stamp 5 与 Long Term Residency',
    'Stamp 5 and Long Term Residency',
  ],
  'ie.form.step6': [
    'EU Treaty Rights 与 Withdrawal Agreement',
    'EU Treaty Rights and the Withdrawal Agreement',
  ],
  'ie.form.intro0': [
    '模拟日期按递交日理解。选择要一起核对的路径，可多选。标星号的项目必填，其余不清楚可留空，结果里会显示为待确认。',
    'The simulation date is treated as the filing date. Select every pathway to check together. Fields marked with an asterisk are required; leave others blank if unsure and they will show as to be confirmed.',
  ],
  'ie.form.intro1': [
    '许可与出境记录用于入籍、Stamp 4／5、LTR 与家庭路径的计时。没有记录时请点「确认没有」，不要直接留空。IRP 登记的问题适用于所有路径。',
    'Permissions and trips drive the clocks for naturalisation, Stamp 4 or 5, LTR and family pathways. If there are none, choose “Confirm there are none” rather than leaving the list blank. The IRP registration questions apply to every pathway.',
  ],
  'ie.form.intro2': [
    '按所选入籍路径作答。品格、身份与居住证明等共用资料只填一次。',
    'Answer for the naturalisation pathways you selected. Shared facts such as character, identity and residence evidence are entered once.',
  ],
  'ie.form.intro3': [
    '就业升级按开始在爱尔兰凭该许可工作的日期计时。只有同时模拟新办或续签就业许可时，才需要填写许可申请一节。',
    'The work upgrade counts from the date you started work in Ireland on the permit. Complete the permit application section only if you are also checking a new or renewed employment permit.',
  ],
  'ie.form.intro4': [
    '家庭团聚、独立 Stamp 4 与爱尔兰公民伴侣的 Stamp 4 共用这些问题。涉及家庭暴力时只问是否适用及已有的许可或认定，不需要描述案情。',
    'These questions are shared by family reunification, independent Stamp 4 and Stamp 4 for partners of Irish citizens. For domestic abuse only whether it applies and any permission or finding is asked; no details of what happened are needed.',
  ],
  'ie.form.intro5': [
    '按所选路径填写 Stamp 5（Without Condition As To Time）或 Long Term Residency 的条件。',
    'Answer the Stamp 5 (Without Condition As To Time) or Long Term Residency questions for the pathways you selected.',
  ],
  'ie.form.intro6': [
    '按欧盟自由流动规定（S.I. 548/2015）或 Withdrawal Agreement（S.I. 728/2020）填写居住活动、出境与证件。两条路径分开作答。',
    'Enter residence activities, absences and documents under the free movement regulations (S.I. 548/2015) or the Withdrawal Agreement (S.I. 728/2020). Each pathway has its own answers.',
  ],
  'ie.form.pathways': ['要核对的路径 *', 'Pathways to check *'],
  'ie.form.group.naturalisation': ['入籍', 'Naturalisation'],
  'ie.form.group.stamps': [
    'Stamp 4／5 与 Long Term Residency',
    'Stamp 4 or 5 and Long Term Residency',
  ],
  'ie.form.group.treaty': [
    'EU Treaty Rights 与 Withdrawal Agreement',
    'EU Treaty Rights and the Withdrawal Agreement',
  ],
  'ie.form.section.registration': [
    'IRP 登记与现行许可',
    'IRP registration and current permission',
  ],
  'ie.form.section.natEligibility': [
    '资格、品格与声明',
    'Eligibility, character and declaration',
  ],
  'ie.form.section.natDocuments': [
    '身份与居住证明',
    'Identity and residence evidence',
  ],
  'ie.form.section.natProcess': [
    '申请、费用与决定',
    'Fees, process and decision',
  ],
  'ie.form.section.natSpouse': [
    '爱尔兰公民配偶／民事伴侣',
    'Spouse or civil partner of an Irish citizen',
  ],
  'ie.form.section.natMinor': ['未成年人申请', 'Applications for minors'],
  'ie.form.section.natAssociation': [
    'Irish descent／Irish associations',
    'Irish descent or Irish associations',
  ],
  'ie.form.section.natProtection': [
    '难民、无国籍与保护身份',
    'Refugees, stateless people and protection status',
  ],
  'ie.form.section.natPublicService': [
    '境外爱尔兰公共服务',
    'Irish public service abroad',
  ],
  'ie.form.section.workUpgrade': [
    '现有许可与升级材料',
    'Current permit and upgrade evidence',
  ],
  'ie.form.section.workPermit': [
    '新办或续签就业许可（可选）',
    'New or renewed employment permit (optional)',
  ],
  'ie.form.section.famRelationship': [
    '关系与担保人',
    'Relationship and sponsor',
  ],
  'ie.form.section.famPermission': [
    '现有家庭许可与关系变化',
    'Existing family permission and changes',
  ],
  'ie.form.section.famChannel': [
    '申请渠道与登记阶段',
    'Application channel and registration stage',
  ],
  'ie.form.section.famFinances': [
    '担保人收入与福利',
    'Sponsor income and welfare',
  ],
  'ie.form.section.famDocuments': [
    '材料、品格、签证与保险',
    'Documents, character, visa and insurance',
  ],
  'ie.form.section.famHousing': ['住房', 'Accommodation'],
  'ie.form.section.stamp5': [
    'Stamp 5（Without Condition As To Time）',
    'Stamp 5 (Without Condition As To Time)',
  ],
  'ie.form.section.ltr': ['Long Term Residency', 'Long Term Residency'],
  'ie.form.section.treatyBasis': [
    '身份与家庭关系',
    'Status and family relationship',
  ],
  'ie.form.section.treatyResidence': [
    '居住活动、出境与取得方式',
    'Residence activities, absences and acquisition',
  ],
  'ie.form.section.treatyWa': [
    'Withdrawal Agreement 适用范围',
    'Withdrawal Agreement personal scope',
  ],
  'ie.form.section.treatyDocument': [
    '证件、通知与审查',
    'Documents, notices and review',
  ],
  'ie.form.section.eu': ['EU Treaty Rights', 'EU Treaty Rights'],
  'ie.form.section.wa': ['Withdrawal Agreement', 'Withdrawal Agreement'],
  'ie.form.unknown': ['不清楚／暂不回答', 'Not sure / skip for now'],
  'ie.form.choose': ['请选择', 'Choose one'],
  'ie.form.yes': ['是', 'Yes'],
  'ie.form.no': ['否', 'No'],
  'ie.form.add': ['添加一条', 'Add'],
  'ie.form.remove': ['删除这一条', 'Remove this entry'],
  'ie.form.confirmNone': ['确认没有', 'Confirm there are none'],
  'ie.form.resetNone': ['改回未回答', 'Mark as unanswered'],
  'ie.form.noneConfirmed': ['已确认没有。', 'Confirmed: none.'],
  'ie.form.optionalGroup': [
    '本组可留空。填写组内资料时，请同时完成标星号的项目。',
    'You can leave this group blank. If you enter details, also complete the fields marked with an asterisk.',
  ],

  'ie.hint.simulationDate': [
    '按这一天（递交日）判断，默认今天。规则按 2026-11 核对的现行版本。',
    'Results are worked out for this date (the filing date). It starts as today. The rules are the current ones checked in 2026-11.',
  ],
  'ie.hint.currentLocation': [
    '模拟日当天你在哪里。在境内登记、续期和多数入籍条件按这一天判断。',
    'Where you are on the simulation date. In-State registration, renewal and most naturalisation checks use this day.',
  ],
  'ie.hint.permissions': [
    '按 IRP 卡或护照印章，每段许可填一行；按时续期的接着填下一段。学生许可、等待国际保护决定的期间和在北爱尔兰合法居住的期间也请填上，它们按规则分别计入或不计入。',
    'Going by your IRP cards or passport stamps, add a row for each permission, then the next one if renewed on time. Include student permissions, time waiting for a protection decision and lawful residence in Northern Ireland: the rules count or exclude them as applicable.',
  ],
  'ie.hint.permissionTo': [
    '仍有效可留空。旧许可在卡上到期日之前就被新许可取代的，填实际的最后一天。',
    'Leave blank if still valid. If a permission was replaced before the expiry printed on its card, enter its actual last day.',
  ],
  'ie.hint.trips': [
    '每次离开爱尔兰填一行，计划中的出行也可以填。出境当天和回来当天不算缺席。',
    'Add a row for each time you left Ireland; you can include planned trips. The days you leave and come back are not absences.',
  ],
  'ie.hint.marriedOn': [
    '只用于爱尔兰公民配偶入籍（s15A），婚姻或民事伴侣年限从这一天算起。',
    'Used for naturalisation as an Irish citizen’s spouse (s15A); the length of the marriage or civil partnership counts from this date.',
  ],
  'ie.hint.employmentStart': [
    '以 Revenue 的 Employment Detail Summary 为准；先持其他许可、后转 Stamp 1 的，填该雇佣许可的生效日。',
    'As in Revenue’s Employment Detail Summary; if you moved to Stamp 1 from another permission, the date the employment permit became valid.',
  ],
  'ie.hint.irpExpiresOn': [
    'IRP 卡上印的到期日，不是登记或预约日期。',
    'The expiry printed on the IRP card, not the registration or appointment date.',
  ],
  'ie.hint.residenceEvidence': [
    'ISD 要求的每个年份填一行，分别数出以你名义出具的强证明和辅助证明件数；计分规则见政策页的 naturalisation.proof。',
    'Add one row for each year ISD asks about and count the strong and supporting documents in your name. The points are listed under naturalisation.proof on the policy page.',
  ],
  'ie.hint.residence': [
    '实际在爱尔兰居住的时段及其法律性质。许可和出境另行记录。',
    'Periods you actually lived in Ireland and their legal basis. Record permissions and trips separately.',
  ],
  'ie.hint.unregisteredResidenceEvidence': [
    '无 IRP 时（例如 EEA、瑞士或英国公民）经核实的可计合法居住起止日，须覆盖所申报的出境、境外行程与返回日。',
    'Verified start and end dates of reckonable lawful residence without an IRP (for example as an EEA, Swiss or UK citizen). They must cover the departure, time abroad and return for any trip relied on.',
  ],
  'ie.hint.to': ['仍在持续可留空。', 'Leave blank if ongoing.'],
  'ie.hint.minor': [
    '申请人未满 18 岁时填写。Irish associations 与境外公共服务路径只问是否由获授权者代为申请。',
    'Complete if the applicant is under 18. The Irish associations and public service routes only ask whether an authorised person applies on their behalf.',
  ],
  'ie.hint.protection': [
    '有难民、无国籍或其他保护身份时填写。身份证明与发证费豁免适用于所有入籍路径，认定日与居住豁免只用于难民或无国籍人入籍。',
    'Complete if you have refugee, stateless or other protection status. Identity evidence and the certification fee exemption apply on every naturalisation route; the recognition date and residence waiver only on the refugee or stateless route.',
  ],
  'ie.hint.waivedResidenceConditions': [
    '不勾选任何一项而直接留空，表示正式决定同时豁免两项居住条件。',
    'Leaving this unanswered means the decision waived both residence requirements.',
  ],
  'ie.hint.employerLetterOn': [
    '雇主确认信的出具日期。递交日这封信须仍在 ISD 要求的时限内（见政策页 work.upgrade）。',
    'The date of the employer’s letter. It must still be within ISD’s time limit on the filing date (see work.upgrade on the policy page).',
  ],
  'ie.hint.permitApplication': [
    '只在同时模拟新办或续签就业许可时填写；只评估已有许可时请留空。',
    'Complete only if you are also checking a new or renewed employment permit. Leave blank to assess an existing permit only.',
  ],
  'ie.hint.eeaStaffShare': [
    '按比例填写，例如 0.25 表示 25%。ICT 按境外关联公司计算。',
    'Enter a fraction, for example 0.25 for 25%. For an ICT, use the connected employer abroad.',
  ],
  'ie.hint.remuneration': [
    '只计法定可计入的部分，不含奖金。',
    'Count only the statutory components, excluding bonuses.',
  ],
  'ie.hint.nextRenewalOn': [
    '满足条件当天或之后最早一次线上续期的日期。',
    'The earliest online renewal on or after the day you become eligible.',
  ],
  'ie.hint.entryOrConversionOnReturn': [
    '仅在本次行程返回爱尔兰当天重新入境或转换身份时填写，日期须对应这次返回。',
    'Complete only if you re-enter or convert status on the day you return from this trip. The date must match that return.',
  ],
  'ie.hint.grossTaxYears': [
    '按税年从早到晚各填一行税前收入（€），最后一行为最近一个税年。配偶事务组（Spouse Unit）渠道不计国家福利。',
    'Add each tax year’s gross income (€), earliest first, so the last row is the latest year. For the Spouse Unit, exclude State welfare benefits.',
  ],
  'ie.hint.registeredPeriods': [
    'IRP 上每段登记许可填一行，并选择其所依据的许可。',
    'Add one row for each registered permission on your IRP and choose the grant it was based on.',
  ],
  'ie.hint.maintenance': [
    '已持有 LTR 时，填写获批后的条件与续期材料。',
    'If you already hold LTR, enter the post-grant conditions and renewal evidence.',
  ],
  'ie.hint.activities': [
    '按日填写每段居住所依据的活动（工作、自雇、自给、学习、家属等）。',
    'Enter the activity each residence period was based on (work, self-employment, self-sufficiency, study, family and so on), by date.',
  ],
  'ie.hint.relevantStart': [
    '按爱尔兰当地时间填写开始居住或取得资格的时刻（2020 年底时为 GMT）。',
    'Enter the moment relevant residence or eligibility began, in Irish local time (GMT at the end of 2020).',
  ],

  'ie.field.simulationDate': ['模拟日期', 'Simulation date'],
  'ie.field.dateOfBirth': ['出生日期', 'Date of birth'],
  'ie.field.birthplace': ['出生地', 'Place of birth'],
  'ie.field.currentLocation': [
    '模拟日所在地',
    'Where you are on the simulation date',
  ],
  'ie.field.permissions': ['居留许可', 'Immigration permissions'],
  'ie.field.permissionKind': ['许可类型', 'Permission type'],
  'ie.field.from': ['开始日期', 'From'],
  'ie.field.to': ['结束日期', 'Until'],
  'ie.field.trips': ['出境记录', 'Trips abroad'],
  'ie.field.departed': ['离开爱尔兰的日期', 'Date you left Ireland'],
  'ie.field.returned': ['回到爱尔兰的日期', 'Date you came back to Ireland'],
  'ie.field.marriedOn': [
    '与爱尔兰公民结婚或登记民事伴侣的日期',
    'Date of marriage or civil partnership with an Irish citizen',
  ],
  'ie.field.employmentStart': [
    '在爱尔兰凭该许可开始工作的日期',
    'Date you started work in Ireland on the permit',
  ],
  'ie.field.registration': ['IRP 登记', 'IRP registration'],
  'ie.field.registrationBasis': ['登记义务', 'Registration requirement'],
  'ie.field.registrationStage': [
    '本次是首次登记还是续期',
    'First registration or renewal',
  ],
  'ie.field.checklistComplete': [
    '本次登记或续期的清单材料已齐备',
    'The checklist documents for this registration or renewal are complete',
  ],
  'ie.field.irpExpiresOn': ['现有 IRP 卡到期日', 'Expiry on your current IRP'],
  'ie.field.validPermission': [
    '模拟日持有有效的居留许可',
    'You hold valid permission on the simulation date',
  ],
  'ie.field.renewalPending': [
    '已按时递交续期、正在等待决定',
    'A renewal was filed on time and is awaiting a decision',
  ],
  'ie.field.addressCurrent': [
    '登记的住址是现住址（变更已通知）',
    'Your registered address is current (changes notified)',
  ],
  'ie.field.passportValid': ['护照在有效期内', 'Your passport is valid'],
  'ie.field.registrationDate': [
    '计划登记或续期的日期',
    'Planned registration or renewal date',
  ],
  'ie.field.feeExemption': ['登记费豁免', 'Registration fee exemption'],
  'ie.field.feePrepared': ['已备好登记费', 'Registration fee ready'],
  'ie.field.citizenship': ['入籍', 'Naturalisation'],
  'ie.field.entitlement': [
    '是否已有爱尔兰国籍或其他取得途径',
    'Existing Irish citizenship or another route to it',
  ],
  'ie.field.recognisedEarlyMarriage': [
    '未成年但已缔结获承认的婚姻',
    'Under full age but in a recognised marriage',
  ],
  'ie.field.character': ['品格与刑事记录', 'Character and criminal record'],
  'ie.field.record': ['刑事记录', 'Criminal record'],
  'ie.field.disclosed': [
    '已如实披露所有相关事项',
    'Everything relevant has been disclosed truthfully',
  ],
  'ie.field.officialFinding': [
    '已有官方对品格的正式认定（满足）',
    'An official character finding in your favour exists',
  ],
  'ie.field.vetting': ['Garda e-vetting 状态', 'Garda e-vetting status'],
  'ie.field.vettingRequired': [
    '本次申请需要 Garda e-vetting',
    'Garda e-vetting is required for this application',
  ],
  'ie.field.intendToReside': [
    '入籍后打算继续居住的地方',
    'Where you intend to continue living after naturalisation',
  ],
  'ie.field.willingToDeclare': [
    '愿意作效忠声明并承诺守法与尊重民主价值',
    'Willing to make the declaration of fidelity and undertaking',
  ],
  'ie.field.declarationCompleted': [
    '已完成效忠声明',
    'The declaration has been made',
  ],
  'ie.field.approvedAlternativeDeclaration': [
    '已获准以替代方式作声明',
    'An alternative way of making the declaration was approved',
  ],
  'ie.field.identityDocuments': [
    '可提供的身份证明（Citizenship Identity Scorecard）',
    'Identity documents you can provide (Citizenship Identity Scorecard)',
  ],
  'ie.field.passportExpiredOn': [
    '护照已过期时的过期日',
    'Expiry date of an expired passport',
  ],
  'ie.field.alternativeIdentityEvidence': [
    'ISD 接受的替代身份证明',
    'Alternative identity evidence accepted by ISD',
  ],
  'ie.field.birthCertificateOrAcceptedAlternative': [
    '出生证明或获接受的替代材料',
    'Birth certificate or an accepted alternative',
  ],
  'ie.field.prescribedFormAndWitness': [
    '使用法定表格并经适当见证',
    'Prescribed form completed and properly witnessed',
  ],
  'ie.field.refereeCount': ['推荐人（referee）人数', 'Number of referees'],
  'ie.field.residenceEvidence': ['逐年居住证明', 'Residence evidence by year'],
  'ie.field.requiredYears': ['ISD 要求证明的年份', 'Year ISD asks about'],
  'ie.field.evidenceYears': ['年份证明', 'Evidence for a year'],
  'ie.field.year': ['年份', 'Year'],
  'ie.field.strong': ['强证明件数', 'Strong documents'],
  'ie.field.supporting': ['辅助证明件数', 'Supporting documents'],
  'ie.field.residencyAffidavit': [
    '已准备 Residency Affidavit',
    'Residency Affidavit prepared',
  ],
  'ie.field.residence': ['实际居住时段', 'Actual residence periods'],
  'ie.field.residenceBasis': ['这段居住的性质', 'Basis of this residence'],
  'ie.field.unregisteredResidenceEvidence': [
    '无 IRP 的已核实合法居住',
    'Verified lawful residence without an IRP',
  ],
  'ie.field.applicationFeePrepared': [
    '已备好入籍申请费',
    'Naturalisation application fee ready',
  ],
  'ie.field.approved': [
    '部长已批准入籍',
    'The Minister has approved the application',
  ],
  'ie.field.certificateFeePaid': ['已缴纳发证费', 'Certification fee paid'],
  'ie.field.certificateIssuedOn': [
    '入籍证书签发日',
    'Date the certificate of naturalisation was issued',
  ],
  'ie.field.survivorFeeConditions': [
    '符合遗孀、鳏夫或在世民事伴侣的减费条件',
    'Eligible for the reduced fee as a widow, widower or surviving civil partner',
  ],
  'ie.field.additionalEvidence': [
    'ISD 补件要求',
    'Request for further documents',
  ],
  'ie.field.requestedOn': ['要求日期', 'Requested on'],
  'ie.field.deadline': ['补件截止日', 'Deadline'],
  'ie.field.suppliedOn': ['补交日期', 'Supplied on'],
  'ie.field.addressUpdated': [
    '地址变更已通知 ISD',
    'Address changes have been notified to ISD',
  ],
  'ie.field.spouse': ['配偶或民事伴侣', 'Spouse or civil partner'],
  'ie.field.spouseRelationship': ['与对方的关系', 'Your relationship'],
  'ie.field.irishCitizen': [
    '对方是爱尔兰公民',
    'Your partner is an Irish citizen',
  ],
  'ie.field.recognised': [
    '婚姻或民事伴侣关系在爱尔兰获承认',
    'The marriage or civil partnership is recognised in Ireland',
  ],
  'ie.field.livingTogether': ['你们共同居住', 'You live together'],
  'ie.field.spouseAffidavit': [
    '已准备配偶法定声明（Statutory Declaration）',
    'Statutory Declaration for spouses prepared',
  ],
  'ie.field.jointAddressEvidenceMonths': [
    '共同地址证明覆盖的月数',
    'Months covered by joint address evidence',
  ],
  'ie.field.jointAddressDocuments': [
    '共同地址证明的份数',
    'Number of joint address documents',
  ],
  'ie.field.postingPeriods': [
    '配偶在境外从事爱尔兰公共服务的经核实时段',
    'Validated periods of your spouse’s Irish public service abroad',
  ],
  'ie.field.postingUnconfirmed': [
    '外派时段尚待确认',
    'The posting periods are not yet confirmed',
  ],
  'ie.field.waiver': ['部长豁免（s15A）', 'Ministerial waiver (s15A)'],
  'ie.field.waivedConditions': ['获豁免的条件', 'Conditions waived'],
  'ie.field.minor': ['未成年人', 'Minor'],
  'ie.field.authorisedRepresentative': [
    '由父母或法定监护人代为申请',
    'A parent or legal guardian applies on the child’s behalf',
  ],
  'ie.field.listedSeriousOffence': [
    '未到品格审查年龄但涉及所列严重事项',
    'Below the age for character checks but a listed serious matter applies',
  ],
  'ie.field.backgroundFormPrepared': [
    '已准备背景资料表',
    'Background information form prepared',
  ],
  'ie.field.characterWaived': [
    '品格要求已获豁免',
    'Character requirement waived',
  ],
  'ie.field.declarationWaived': [
    '声明要求已获豁免',
    'Declaration requirement waived',
  ],
  'ie.field.naturalisedParentCertificateOn': [
    '父母入籍证书的日期',
    'Date of the parent’s naturalisation certificate',
  ],
  'ie.field.relationshipAndConsentEvidence': [
    '亲子关系与同意证明齐备',
    'Relationship and consent evidence ready',
  ],
  'ie.field.childResidenceAndSchoolEvidence': [
    '子女居住与就学证明齐备',
    'The child’s residence and school evidence ready',
  ],
  'ie.field.parentRouteWaiverGranted': [
    'Form 9 路径的居住要求已获豁免',
    'Residence requirement waived for the Form 9 route',
  ],
  'ie.field.association': [
    'Irish descent／Irish associations',
    'Irish descent or associations',
  ],
  'ie.field.qualifyingRelationship': [
    '与爱尔兰公民有血缘、姻亲、收养或民事伴侣关系',
    'Related to an Irish citizen by blood, affinity, adoption or civil partnership',
  ],
  'ie.field.relativeEligibleAtRelevantDate': [
    '该亲属在相关日期是或有权成为爱尔兰公民',
    'That relative was, or was entitled to be, an Irish citizen at the relevant date',
  ],
  'ie.field.waiverGranted': [
    '已获部长豁免的正式决定',
    'A formal ministerial waiver was granted',
  ],
  'ie.field.associationEvidence': [
    '与爱尔兰的关联证据',
    'Evidence of links with Ireland',
  ],
  'ie.field.residenceYears': ['在爱尔兰居住的年数', 'Years lived in Ireland'],
  'ie.field.taxResident': ['曾是爱尔兰税务居民', 'Tax resident in Ireland'],
  'ie.field.currentlyResident': [
    '目前住在爱尔兰',
    'Currently living in Ireland',
  ],
  'ie.field.visits': [
    '适用回溯期内访问爱尔兰的次数',
    'Visits to Ireland in the applicable period',
  ],
  'ie.field.residentFamily': [
    '有住在爱尔兰的家人',
    'Family members living in Ireland',
  ],
  'ie.field.significantContribution': [
    '对爱尔兰有重大贡献',
    'A significant contribution to Ireland',
  ],
  'ie.field.nfqLevel': [
    '在爱尔兰取得的学历 NFQ 等级',
    'NFQ level of an Irish qualification',
  ],
  'ie.field.juniorCertificate': [
    '取得 Junior Certificate',
    'Junior Certificate',
  ],
  'ie.field.leavingCertificate': [
    '取得 Leaving Certificate',
    'Leaving Certificate',
  ],
  'ie.field.irishInsurance': ['持有爱尔兰保险', 'Irish insurance'],
  'ie.field.prsiContributions': ['PRSI 缴费次数', 'PRSI contributions'],
  'ie.field.irishPension': ['有爱尔兰养老金', 'Irish pension'],
  'ie.field.fullIrishLicence': [
    '持有爱尔兰正式驾照',
    'Full Irish driving licence',
  ],
  'ie.field.activeIrishBank': [
    '有在用的爱尔兰银行账户',
    'Active Irish bank account',
  ],
  'ie.field.protection': ['保护身份', 'Protection status'],
  'ie.field.protectionKind': ['保护身份类型', 'Protection status'],
  'ie.field.protectionGrantOn': ['认定日期', 'Date of recognition'],
  'ie.field.validRecognition': [
    '认定目前仍有效',
    'The recognition is still valid',
  ],
  'ie.field.identityEvidence': [
    '无法取得本国护照时的身份材料',
    'Identity evidence if you cannot get a national passport',
  ],
  'ie.field.nationalPassportUnavailable': [
    '无法取得本国护照',
    'You cannot obtain a national passport',
  ],
  'ie.field.certifiedIrishTravelDocument': [
    '经认证的爱尔兰签发旅行证件',
    'Certified Irish-issued travel document',
  ],
  'ie.field.refugeeStatusLetter': ['难民认定信', 'Refugee status letter'],
  'ie.field.witnessedPassportAffidavit': [
    '经法律见证签署的护照宣誓书',
    'Passport affidavit signed before a legal witness',
  ],
  'ie.field.certificationFeeExemptionConfirmed': [
    '发证费豁免已确认',
    'Certification fee exemption confirmed',
  ],
  'ie.field.waiverPending': ['豁免申请正在处理', 'A waiver request is pending'],
  'ie.field.waivedResidenceConditions': [
    '获豁免的居住条件',
    'Residence requirements waived',
  ],
  'ie.field.publicService': ['境外公共服务', 'Public service abroad'],
  'ie.field.qualifyingIrishPublicAppointment': [
    '担任合格的爱尔兰公共职位',
    'Holds a qualifying Irish public appointment',
  ],
  'ie.field.residesAbroadDuringService': [
    '任职期间居住在境外',
    'Lives abroad during the service',
  ],
  'ie.field.appointmentEvidence': [
    '任职证明齐备',
    'Appointment evidence ready',
  ],
  'ie.field.work': ['就业升级', 'Work upgrade'],
  'ie.field.workBasis': ['所持就业许可类型', 'Employment permit held'],
  'ie.field.validCorrespondingPermission': [
    '持有与之对应的有效 Stamp 1／1H',
    'You hold the matching valid Stamp 1 or 1H',
  ],
  'ie.field.employedInState': [
    '目前在爱尔兰境内受雇',
    'Currently employed in Ireland',
  ],
  'ie.field.passportIrpAndPermits': [
    '护照、IRP 与各份许可的副本齐备',
    'Passport, IRP and copies of each permit ready',
  ],
  'ie.field.payslipAndRevenueEvidence': [
    '工资单与 Revenue 就业记录齐备',
    'Payslips and Revenue employment record ready',
  ],
  'ie.field.employerLetterOn': [
    '雇主确认信日期',
    'Date of the employer’s letter',
  ],
  'ie.field.recordsConsistent': [
    '各项记录相互一致',
    'The records are consistent',
  ],
  'ie.field.termsComplied': [
    '一直遵守许可条件',
    'You have complied with the conditions of your permission',
  ],
  'ie.field.permissionRevoked': ['许可曾被撤销', 'A permission was revoked'],
  'ie.field.isdApproved': ['ISD 已批准', 'ISD has approved'],
  'ie.field.hostingAgreementValid': [
    'Hosting Agreement 有效',
    'The Hosting Agreement is valid',
  ],
  'ie.field.doctorPermitAndQualificationsValid': [
    '医生许可与注册资格有效',
    'The doctor’s permit and registration are valid',
  ],
  'ie.field.permitApplication': [
    '就业许可申请',
    'Employment permit application',
  ],
  'ie.field.permitApplicationDate': ['许可申请日期', 'Permit application date'],
  'ie.field.termMonths': ['许可期限（月）', 'Permit term (months)'],
  'ie.field.permitRenewal': ['这是续签申请', 'This is a renewal'],
  'ie.field.permitFeePrepared': ['已备好许可费用', 'Permit fee ready'],
  'ie.field.permitTier': ['许可类别与薪资档', 'Permit type and salary tier'],
  'ie.field.occupationEligible': [
    '职业符合该许可的清单',
    'The occupation is eligible for this permit',
  ],
  'ie.field.recognisedQualifications': [
    '学历或资格获承认',
    'Qualifications are recognised',
  ],
  'ie.field.employerEligible': ['雇主符合条件', 'The employer is eligible'],
  'ie.field.eeaStaffShare': [
    'EEA、瑞士和英国籍雇员所占比例',
    'Share of EEA, Swiss and UK employees',
  ],
  'ie.field.staffShareExemption': [
    '雇员比例要求获豁免',
    'Exempt from the staff share requirement',
  ],
  'ie.field.graduateNfqLevel': [
    '毕业学历 NFQ 等级',
    'NFQ level of the graduate award',
  ],
  'ie.field.graduateAwardOn': ['学历授予日期', 'Date of the award'],
  'ie.field.irishRegisteredQualification': [
    '学历在爱尔兰登记',
    'The qualification is registered in Ireland',
  ],
  'ie.field.offerFrom': ['工作邀约开始日', 'Job offer start'],
  'ie.field.offerEnd': ['工作邀约结束日', 'Job offer end'],
  'ie.field.labourMarketTestOrExemption': [
    '已做劳动力市场测试或获豁免',
    'Labour market needs test done or exempt',
  ],
  'ie.field.foreignEmploymentFrom': [
    '在境外关联公司受雇的开始日',
    'Start of employment with the connected employer abroad',
  ],
  'ie.field.transferOn': ['调派到爱尔兰的日期', 'Date of transfer to Ireland'],
  'ie.field.associatedEmployersAndAssignment': [
    '两地雇主相关联且属内部调派',
    'The employers are connected and this is an internal assignment',
  ],
  'ie.field.hoursPerWeek': ['每周工时', 'Hours per week'],
  'ie.field.eligibleAnnualRemuneration': [
    '可计入的年薪（€）',
    'Eligible annual remuneration (€)',
  ],
  'ie.field.eligibleHourlyRemuneration': [
    '可计入的时薪（€）',
    'Eligible hourly remuneration (€)',
  ],
  'ie.field.baseWageLawMet': [
    '符合最低工资等基础工资法律',
    'Meets minimum and other base wage law',
  ],
  'ie.field.publicPayAgreement': [
    '经核实的公共部门薪资协议',
    'Verified public pay agreement',
  ],
  'ie.field.annual': ['年薪（€）', 'Annual (€)'],
  'ie.field.hourly': ['时薪（€）', 'Hourly (€)'],
  'ie.field.publicPayAgreementUnconfirmed': [
    '适用的公共薪资协议尚待确认',
    'The applicable public pay agreement is not yet confirmed',
  ],
  'ie.field.family': ['家庭', 'Family'],
  'ie.field.familyRelationship': [
    '与担保人的关系',
    'Relationship to the sponsor',
  ],
  'ie.field.relationshipValidAndGenuine': [
    '关系合法且真实',
    'The relationship is valid and genuine',
  ],
  'ie.field.intendsToLiveTogetherInState': [
    '打算在爱尔兰共同生活',
    'You intend to live together in Ireland',
  ],
  'ie.field.cohabitationFrom': [
    '开始同居的日期',
    'Date you started living together',
  ],
  'ie.field.compelledSeparation': [
    '因不得已原因暂时分开居住',
    'Living apart for reasons beyond your control',
  ],
  'ie.field.childUnmarriedDependent': [
    '子女未婚且受抚养',
    'The child is unmarried and dependent',
  ],
  'ie.field.custodyConsent': [
    '已取得监护或另一方父母的同意',
    'Custody or the other parent’s consent is in place',
  ],
  'ie.field.sponsorAdult': [
    '双方均已达适用政策规定的年龄',
    'Both partners meet the applicable age',
  ],
  'ie.field.sponsorCategory': ['担保人类别', 'Sponsor category'],
  'ie.field.sponsorIrish': [
    '担保人是爱尔兰公民',
    'The sponsor is an Irish citizen',
  ],
  'ie.field.sponsorLawfulAndResident': [
    '担保人合法居住在爱尔兰',
    'The sponsor lives lawfully in Ireland',
  ],
  'ie.field.sponsorQualifyingFrom': [
    '担保人开始符合担保资格的日期',
    'Date the sponsor became eligible to sponsor',
  ],
  'ie.field.protectionRelationshipFormedAfterEntry': [
    '受保护担保人的关系在其入境后建立',
    'The protected sponsor’s relationship began after arrival',
  ],
  'ie.field.sponsorNaturalisedOn': [
    '担保人入籍日期',
    'Date the sponsor naturalised',
  ],
  'ie.field.nextRenewalOn': ['下次线上续期日期', 'Next online renewal date'],
  'ie.field.establishedFamilyPermission': [
    '已持有相关的家庭许可',
    'You already hold the relevant family permission',
  ],
  'ie.field.dependentPeriods': [
    '凭合格依亲许可合法居住的时段',
    'Lawful residence on a qualifying dependent permission',
  ],
  'ie.field.change': ['关系变化', 'Change in the relationship'],
  'ie.field.changeKind': ['变化类型', 'Type of change'],
  'ie.field.endedOn': ['关系结束日期', 'Date the relationship ended'],
  'ie.field.relationshipFrom': ['关系开始日期', 'Date the relationship began'],
  'ie.field.lastCohabitationFrom': [
    '最后一段同居的开始日期',
    'Start of the last period living together',
  ],
  'ie.field.notificationWorkingDays': [
    '通知 ISD 用了几个工作日',
    'Working days taken to notify ISD',
  ],
  'ie.field.changeApproval': ['ISD 已批准变更', 'ISD has approved the change'],
  'ie.field.abusePermissionEvidence': [
    '已有基于家庭暴力的许可或认定',
    'A permission or finding based on domestic abuse exists',
  ],
  'ie.field.application': ['家庭申请', 'Family application'],
  'ie.field.familyApplicationDate': ['申请日期', 'Application date'],
  'ie.field.familyRegistrationStage': [
    '首次登记还是续期',
    'First registration or renewal',
  ],
  'ie.field.renewalInsuranceRequired': [
    '批准信对续期附加了医疗保险条件',
    'The permission letter requires insurance on renewal',
  ],
  'ie.field.renewalInsuranceConditionMet': [
    '已满足续期保险条件',
    'The renewal insurance condition is met',
  ],
  'ie.field.familyChannel': ['申请渠道', 'Application channel'],
  'ie.field.entryOrConversionValid': [
    '已获准入境，或可使用所选境内渠道',
    'Entry was approved, or you can use the chosen in-State channel',
  ],
  'ie.field.entryOrConversionOnReturn': [
    '本次返爱当天的入境或转换依据',
    'Basis for entry or conversion on this return',
  ],
  'ie.field.returnDate': ['返回日期', 'Return date'],
  'ie.field.returnBasisValid': [
    '当天的入境与可转换身份已确认',
    'Re-entry and a status eligible for conversion are confirmed for that day',
  ],
  'ie.field.spouseInStateEntry': [
    '境内配偶入口',
    'In-State spouse entry point',
  ],
  'ie.field.spouseUnitUndueBurdenCleared': [
    'Spouse Unit 已确认留在境内不构成过度负担',
    'The Spouse Unit confirmed no undue burden from remaining in the State',
  ],
  'ie.field.sponsorResponsible': [
    '由一名担保人承担支持义务',
    'One sponsor takes responsibility for support',
  ],
  'ie.field.grossTaxYears': [
    '各税年税前收入（€）',
    'Gross income by tax year (€)',
  ],
  'ie.field.previousTaxYearNet': [
    '上一税年净收入（€）',
    'Net income in the previous tax year (€)',
  ],
  'ie.field.minorChildren': ['未成年子女人数', 'Number of minor children'],
  'ie.field.incomeMaintained': [
    '收入将持续维持',
    'The income will be maintained',
  ],
  'ie.field.chieflyOnStateSupportYears': [
    '主要依赖国家支持的年数',
    'Years mainly dependent on State support',
  ],
  'ie.field.verifiedSavingsMaySupplement': [
    '有可核实的储蓄可补足',
    'Verifiable savings could make up the difference',
  ],
  'ie.field.noSocialWelfare': ['未领取社会福利', 'No social welfare received'],
  'ie.field.differentPartnerGrantOn': [
    '曾为另一位伴侣获批担保的日期',
    'Date a different partner was previously granted',
  ],
  'ie.field.priorSponsorshipHistoryComplete': [
    '过往担保记录已完整申报',
    'Previous sponsorship history declared in full',
  ],
  'ie.field.sponsorBankMonths': [
    '担保人银行流水月数',
    'Months of sponsor bank statements',
  ],
  'ie.field.familyEvidenceComplete': [
    '所选阶段的清单材料齐备',
    'Checklist documents for the chosen stage are complete',
  ],
  'ie.field.addressEvidence': ['住址证明齐备', 'Address evidence ready'],
  'ie.field.applicantCharacter': ['申请人品格', 'Applicant’s character'],
  'ie.field.sponsorCharacter': ['担保人品格', 'Sponsor’s character'],
  'ie.field.publicInterestCleared': [
    '安全与公共利益审查已通过',
    'Security and public interest checks cleared',
  ],
  'ie.field.visa': ['签证或预审', 'Visa or preclearance'],
  'ie.field.visaFeePrepared': ['已备好签证费', 'Visa fee ready'],
  'ie.field.visaFeeExempt': ['签证费获豁免', 'Exempt from the visa fee'],
  'ie.field.insuranceRequiredForEntry': [
    '入境须提供医疗保险',
    'Insurance is required for entry',
  ],
  'ie.field.insuranceEvidenceAtEntry': [
    '入境时有保险证明',
    'Insurance evidence at entry',
  ],
  'ie.field.insurance': ['医疗保险', 'Medical insurance'],
  'ie.field.insuranceKind': ['保险类型', 'Insurance type'],
  'ie.field.hiaAuthorised': [
    '保险公司获 HIA 授权',
    'The insurer is authorised by the HIA',
  ],
  'ie.field.coversRequiredPeople': [
    '覆盖所有须投保的人',
    'Covers everyone who must be insured',
  ],
  'ie.field.coverageMonths': ['保障月数', 'Months of cover'],
  'ie.field.permissionMonths': ['许可期限（月）', 'Permission term (months)'],
  'ie.field.hospitalAndMedical': [
    '涵盖住院与医疗',
    'Covers hospital and medical care',
  ],
  'ie.field.accidentCover': ['意外保额（€）', 'Accident cover (€)'],
  'ie.field.illnessCover': ['疾病保额（€）', 'Illness cover (€)'],
  'ie.field.coversUntilPrivateStarts': [
    '覆盖到私人保险开始为止',
    'Covers you until private insurance starts',
  ],
  'ie.field.overseasLawfulAndRemainsAbroad': [
    '在境外合法居住并留在境外等待',
    'Lawfully abroad and waiting abroad',
  ],
  'ie.field.applicationSummaryOn': [
    '申请摘要日期',
    'Date of the application summary',
  ],
  'ie.field.submittedDocumentsOn': [
    '递交材料的日期',
    'Date documents were submitted',
  ],
  'ie.field.policeCertificates': ['无犯罪记录证明', 'Police certificates'],
  'ie.field.allRequiredCountriesCovered': [
    '覆盖所有须提供的国家',
    'All required countries are covered',
  ],
  'ie.field.issueDates': ['证明签发日期', 'Certificate issue date'],
  'ie.field.housing': ['住房', 'Accommodation'],
  'ie.field.housingKind': ['住房类型', 'Type of accommodation'],
  'ie.field.rooms': ['房间', 'Room'],
  'ie.field.floorSquareFeet': ['地面面积（平方英尺）', 'Floor area (sq ft)'],
  'ie.field.ceilingFeet': ['层高（英尺）', 'Ceiling height (ft)'],
  'ie.field.occupantCount': ['同住人数', 'Number of occupants'],
  'ie.field.oppositeSexOccupantsAtLeastTenNotCouple': [
    '同室有达到规定年龄（见政策页 family.housing）的异性且非伴侣',
    'Shared with someone of the opposite sex over the set age (see family.housing on the policy page) who is not a partner',
  ],
  'ie.field.bedroomCount': ['卧室数', 'Number of bedrooms'],
  'ie.field.childrenShareCompatibly': [
    '子女同室安排符合规定',
    'Children share rooms as allowed',
  ],
  'ie.field.unrelatedAdultsWithChildren': [
    '有无亲属关系的成年人与子女同住',
    'Unrelated adults live with the children',
  ],
  'ie.field.entireHome': ['使用整套住房', 'Use of the whole home'],
  'ie.field.titleOrRtbAndAccom1': [
    '产权证明或 RTB 登记及 Accom 1 表',
    'Title, or RTB registration and the Accom 1 form',
  ],
  'ie.field.affordable': ['住房负担得起', 'The accommodation is affordable'],
  'ie.field.evidenceRequestedOn': [
    'ISD 要求住房证明的日期',
    'Date ISD requested housing evidence',
  ],
  'ie.field.evidenceSubmittedOn': [
    '提交住房证明的日期',
    'Date housing evidence was submitted',
  ],
  'ie.field.stamp5': ['Stamp 5', 'Stamp 5'],
  'ie.field.nonEea': ['非 EEA 国民', 'Non-EEA national'],
  'ie.field.validPermissionWhileProcessing': [
    '审理期间一直持有有效许可',
    'Valid permission throughout processing',
  ],
  'ie.field.burden': ['公帑负担', 'Burden on the State'],
  'ie.field.benefit': ['领取的福利', 'Benefits received'],
  'ie.field.officialUndueBurden': [
    '已有官方认定构成过度负担',
    'An official finding of undue burden exists',
  ],
  'ie.field.employmentEfforts': [
    '一直就业或积极求职',
    'Working or actively seeking work',
  ],
  'ie.field.passportAndIrpEvidence': [
    '护照与 IRP 材料齐备',
    'Passport and IRP evidence ready',
  ],
  'ie.field.bankEvidenceMonths': ['银行流水月数', 'Months of bank statements'],
  'ie.field.exceptionalTravelConfirmed': [
    '超限出境的特殊理由已获确认',
    'Exceptional reasons for longer travel confirmed',
  ],
  'ie.field.longestAnnualAbsenceMonths': [
    '获批后单一年度最长出境月数',
    'Longest time abroad in a grant year (months)',
  ],
  'ie.field.grantReceived': ['已获批 Stamp 5', 'Stamp 5 granted'],
  'ie.field.passportExpiresOn': ['护照到期日', 'Passport expiry date'],
  'ie.field.renewWithPassport': [
    '随新护照续期 Stamp 5',
    'Renewing Stamp 5 with a new passport',
  ],
  'ie.field.ltr': ['Long Term Residency', 'Long Term Residency'],
  'ie.field.registeredPeriods': [
    'IRP 登记时段',
    'Registered periods on your IRP',
  ],
  'ie.field.ltrBasis': ['所依据的许可', 'Grant it was based on'],
  'ie.field.grantEvidence': [
    '有该许可及对应 Stamp／IRP 的证明',
    'Evidence of the grant and matching stamp or IRP',
  ],
  'ie.field.councilRegisteredOn': [
    '在医学委员会注册的日期',
    'Date of Medical Council registration',
  ],
  'ie.field.historicPublicDoctorEvidence': [
    '过往公立医院医生任职证明',
    'Evidence of past public hospital doctor posts',
  ],
  'ie.field.ltrEmployment': ['目前的就业状态', 'Current employment'],
  'ie.field.canContinueEmployment': [
    '可以继续受雇',
    'Able to continue in employment',
  ],
  'ie.field.pastBreachUnderReview': [
    '过往违反许可条件的事项仍在审查',
    'A past breach of conditions is under review',
  ],
  'ie.field.ltrValidPermission': [
    '续期时现有 LTR 许可有效',
    'Your current LTR permission is valid (renewal)',
  ],
  'ie.field.residenceAndApplicationEvidence': [
    '居住与申请材料齐备',
    'Residence and application evidence ready',
  ],
  'ie.field.ltrFamily': ['家属申请', 'Dependant’s application'],
  'ie.field.eligibleDependentRelationship': [
    '属合格的配偶或受抚养家属',
    'An eligible spouse or dependant',
  ],
  'ie.field.principalHoldsLtr': [
    '主申请人已持有 LTR',
    'The principal holds LTR',
  ],
  'ie.field.principalQualifyingPeriods': [
    '主申请人的合格居住时段',
    'Principal’s qualifying periods',
  ],
  'ie.field.dependentRegisteredPeriods': [
    '家属本人的登记时段',
    'Dependant’s registered periods',
  ],
  'ie.field.maintenance': [
    '已持有 LTR 的维持与续期',
    'Keeping and renewing LTR',
  ],
  'ie.field.largestCalendarYearAbsenceDays': [
    '单一日历年最长出境天数',
    'Most days abroad in one calendar year',
  ],
  'ie.field.tripsPermittedOrExceptionConfirmed': [
    '出境在允许范围内或例外已获确认',
    'Travel within the limit or an exception confirmed',
  ],
  'ie.field.workEffortsAndResidence': [
    '持续就业或求职并在境内居住',
    'Working or seeking work and living in the State',
  ],
  'ie.field.previousGrantYearsEvidence': [
    '上一期 LTR 各年的居住与就业证明',
    'Residence and work evidence for the previous LTR grant',
  ],
  'ie.field.ltrRenewal': ['这是 LTR 续期', 'This is an LTR renewal'],
  'ie.field.approvalLetterOn': ['批准信日期', 'Date of the approval letter'],
  'ie.field.feePaidOn': ['缴费日期', 'Date the fee was paid'],
  'ie.field.familyOrRenewalFeeConfirmed': [
    '家属或续期费用已确认',
    'The dependant or renewal fee is confirmed',
  ],
  'ie.field.eu': ['EU Treaty Rights', 'EU Treaty Rights'],
  'ie.field.wa': ['Withdrawal Agreement', 'Withdrawal Agreement'],
  'ie.field.treatyRole': [
    '你是本人还是家属',
    'Applying as the citizen or a family member',
  ],
  'ie.field.qualifyingNationality': [
    '持有合格国籍（欧盟、EEA、瑞士或英国，视路径）',
    'Qualifying nationality (EU, EEA, Swiss or UK as applicable)',
  ],
  'ie.field.regulatedFreeMovementBasis': [
    '居住依据属自由流动法规范围',
    'Residence falls under the free movement regulations',
  ],
  'ie.field.returningIrishOrDualNationality': [
    '回流的爱尔兰公民或双重国籍情形',
    'A returning Irish citizen or dual national',
  ],
  'ie.field.qualifyingSponsor': ['担保人符合条件', 'The sponsor qualifies'],
  'ie.field.sponsorStudent': ['担保人是学生', 'The sponsor is a student'],
  'ie.field.treatyRelationship': [
    '与担保人的关系',
    'Relationship to the sponsor',
  ],
  'ie.field.dependency': ['受担保人抚养', 'Dependent on the sponsor'],
  'ie.field.relationshipEvidence': [
    '关系证明齐备',
    'Relationship evidence ready',
  ],
  'ie.field.permittedFamilyApproval': [
    '作为许可家属（permitted family member）已获批准',
    'Approved as a permitted family member',
  ],
  'ie.field.nonEuFamily': [
    '你是非欧盟籍家属',
    'You are a non-EU family member',
  ],
  'ie.field.activities': ['居住活动', 'Residence activities'],
  'ie.field.activityBasis': ['活动依据', 'Activity'],
  'ie.field.residenceAndTravelComplete': [
    '实际居住、需要的同住与出行记录已完整填写',
    'Actual residence, any required co-residence and travel are fully recorded',
  ],
  'ie.field.activityVerified': [
    '有这段活动依据的证明',
    'Evidence of this basis for the whole period',
  ],
  'ie.field.sufficientResources': ['有足够资金', 'Sufficient resources'],
  'ie.field.comprehensiveSicknessInsurance': [
    '有全面医疗保险（CSI）',
    'Comprehensive sickness insurance',
  ],
  'ie.field.recognisedEducation': [
    '就读获认可的教育机构',
    'Enrolled at a recognised institution',
  ],
  'ie.field.sufficientIdentity': [
    '有足够的身份证明',
    'Sufficient identity evidence',
  ],
  'ie.field.unreasonableBurden': [
    '对社会援助构成不合理负担',
    'An unreasonable burden on social assistance',
  ],
  'ie.field.enteredOn': ['入境日期', 'Date of entry'],
  'ie.field.previousWorkerFrom': ['此前开始工作的日期', 'Previous work began'],
  'ie.field.employmentEndedOn': ['工作结束日期', 'Employment ended'],
  'ie.field.shortFixedTerm': [
    '不足一年的定期合同',
    'A fixed-term contract of less than a year',
  ],
  'ie.field.trainingRelatedOrInvoluntary': [
    '培训与此前工作相关，或属非自愿失业',
    'Training related to previous work, or involuntary unemployment',
  ],
  'ie.field.treatyAbsences': ['出境', 'Absence'],
  'ie.field.leftOn': ['离开日期', 'Left on'],
  'ie.field.returnedOn': ['返回日期', 'Returned on'],
  'ie.field.absenceReason': ['出境原因', 'Reason'],
  'ie.field.exceptionConfirmed': [
    '例外理由已有证据',
    'Evidence of the exception',
  ],
  'ie.field.acquisition': [
    '取得永久居留的方式',
    'How permanent residence is acquired',
  ],
  'ie.field.early': ['提前取得', 'Early acquisition'],
  'ie.field.earlyKind': ['提前取得的情形', 'Basis for early acquisition'],
  'ie.field.eventOn': ['相关事件日期', 'Date of the event'],
  'ie.field.residenceFrom': [
    '开始在境内居住的日期',
    'Residence in the State began',
  ],
  'ie.field.workFrom': ['开始在境内工作的日期', 'Work in the State began'],
  'ie.field.pensionAgeOrEarlyRetirementConfirmed': [
    '已达养老金年龄或提前退休已确认',
    'Pension age reached or early retirement confirmed',
  ],
  'ie.field.workerOrSelfEmployed': [
    '身为雇员或自雇者',
    'A worker or self-employed',
  ],
  'ie.field.permanentIncapacityConfirmed': [
    '永久丧失工作能力已确认',
    'Permanent incapacity confirmed',
  ],
  'ie.field.statePaidOccupationalInjuryBenefit': [
    '领取国家支付的工伤福利',
    'Receives a State occupational injury benefit',
  ],
  'ie.field.irishSpouseOrCivilPartner': [
    '配偶或民事伴侣是爱尔兰公民',
    'Spouse or civil partner is an Irish citizen',
  ],
  'ie.field.homeInStateAndWeeklyReturns': [
    '住在境内并至少每周返回',
    'Lives in the State and returns at least weekly',
  ],
  'ie.field.worksInOtherMemberState': [
    '在另一成员国工作',
    'Works in another Member State',
  ],
  'ie.field.coResidingQualifiedFamily': [
    '与取得资格的家属同住',
    'Lives with the qualifying family member',
  ],
  'ie.field.occupationalDeath': [
    '工作者因工伤或职业病去世',
    'The worker died from an occupational accident or disease',
  ],
  'ie.field.retention': ['保留居留权', 'Retained right of residence'],
  'ie.field.retentionEvent': ['导致需要保留权利的事件', 'Event'],
  'ie.field.livedInStateAsFamilyFrom': [
    '以家属身份在境内居住的开始日期',
    'Lived in the State as a family member from',
  ],
  'ie.field.sponsorHadRightOfResidence': [
    '担保人当时享有居留权',
    'The sponsor had a right of residence',
  ],
  'ie.field.sponsorStillInStateAtProceedings': [
    '程序开始时担保人仍在境内',
    'The sponsor was still in the State when proceedings began',
  ],
  'ie.field.custodyGranted': [
    '已获子女监护权',
    'Custody of the children granted',
  ],
  'ie.field.particularlyDifficultCircumstancesConfirmed': [
    '特别困难情形已获确认',
    'Particularly difficult circumstances confirmed',
  ],
  'ie.field.contactRightMustBeInState': [
    '须在境内行使探视权',
    'Access rights must be exercised in the State',
  ],
  'ie.field.contactChildDob': ['相关子女出生日期', 'Child’s date of birth'],
  'ie.field.personalBasis': ['你本人的居留依据', 'Your own basis of residence'],
  'ie.field.economicBasisConfirmed': [
    '经济依据已确认',
    'Economic basis confirmed',
  ],
  'ie.field.resourcesAndCsi': [
    '有足够资金与全面医疗保险（CSI）',
    'Sufficient resources and comprehensive sickness insurance',
  ],
  'ie.field.determination': [
    '主管机关已作决定',
    'A determination has been made',
  ],
  'ie.field.waScope': [
    'Withdrawal Agreement 适用范围',
    'Withdrawal Agreement scope',
  ],
  'ie.field.britishOrQualifyingFamily': [
    '英国公民或其合格家属',
    'A British citizen or qualifying family member',
  ],
  'ie.field.relevantStart': [
    '开始在爱尔兰居住或取得资格的时间',
    'When relevant residence or eligibility began',
  ],
  'ie.field.protectedBeforeAndContinued': [
    '过渡期结束前已受保护并延续至今',
    'Protected before the transition ended and continued since',
  ],
  'ie.field.familyCategory': ['家属类别', 'Family category'],
  'ie.field.qualifyingFamilyEventConfirmed': [
    '合格家属事件已确认',
    'The qualifying family event is confirmed',
  ],
  'ie.field.recognisedWaScope': [
    '已获承认属于 WA 适用范围',
    'Recognised as within WA scope',
  ],
  'ie.field.postLossScopeConfirmed': [
    '因长期离境失权后，返爱后的 WA 适用范围已确认',
    'WA scope confirmed for residence after returning from an absence that ended permanent residence',
  ],
  'ie.field.treatyDocument': ['证件与审查', 'Documents and review'],
  'ie.field.documentInState': [
    '申请证件时在境内',
    'In the State when applying for the document',
  ],
  'ie.field.currentCardCategory': ['现有居留卡类别', 'Current card type'],
  'ie.field.identityAndResidenceEvidence': [
    '身份与居住材料齐备',
    'Identity and residence evidence ready',
  ],
  'ie.field.currentCardExpiresOn': ['现有居留卡到期日', 'Current card expiry'],
  'ie.field.filedOn': ['递交日期', 'Filing date'],
  'ie.field.addressAndStatusNotified': [
    '住址与身份变化已通知',
    'Address and status changes notified',
  ],
  'ie.field.prolongedAbsenceNotified': [
    '长期出境已按时通知',
    'Prolonged absence notified on time',
  ],
  'ie.field.publicInterest': [
    '公共政策与安全审查',
    'Public policy and security review',
  ],
  'ie.field.examRequested': [
    '被要求进行健康检查',
    'A medical examination was requested',
  ],
  'ie.field.examDone': ['已完成健康检查', 'The medical examination was done'],
  'ie.field.priorPermanentRightOn': [
    '此前取得永久居留权的日期',
    'Date a permanent right was acquired earlier',
  ],
  'ie.field.postGrantAbsence': [
    '取得后连续离境',
    'Continuous absence after acquisition',
  ],
  'ie.field.absenceFrom': ['离境开始日期', 'Absence began'],
  'ie.field.extraFeeRequested': [
    '被要求缴纳额外费用',
    'An extra fee was requested',
  ],

  'ie.option.birthplace.state': ['爱尔兰（共和国）', 'Ireland (the State)'],
  'ie.option.birthplace.northern-ireland': ['北爱尔兰', 'Northern Ireland'],
  'ie.option.birthplace.elsewhere': ['其他地方', 'Elsewhere'],
  'ie.option.currentLocation.state': [
    '在爱尔兰（共和国）',
    'In Ireland (the State)',
  ],
  'ie.option.currentLocation.northern-ireland': [
    '在北爱尔兰',
    'In Northern Ireland',
  ],
  'ie.option.currentLocation.elsewhere': [
    '在爱尔兰岛以外',
    'Off the island of Ireland',
  ],
  'ie.option.intendToReside.state': ['爱尔兰（共和国）', 'Ireland (the State)'],
  'ie.option.intendToReside.northern-ireland': ['北爱尔兰', 'Northern Ireland'],
  'ie.option.intendToReside.elsewhere': ['其他地方', 'Elsewhere'],
  'ie.option.permissionKind.stamp1': [
    'Stamp 1（经营、打工度假、ISD 准许免雇佣许可工作等）',
    'Stamp 1 (business, working holiday, ISD letter to work without a permit and so on)',
  ],
  'ie.option.permissionKind.stamp1-csep': [
    'Stamp 1 或 1H（Critical Skills、研究员 Hosting Agreement、多地点 GEP 医生）',
    'Stamp 1 or 1H (Critical Skills, researcher Hosting Agreement, Multi-Site GEP doctor)',
  ],
  'ie.option.permissionKind.stamp1-gep': [
    'Stamp 1（General Employment Permit）',
    'Stamp 1 (General Employment Permit)',
  ],
  'ie.option.permissionKind.stamp1-ict': [
    'Stamp 1（公司内调 ICT）',
    'Stamp 1 (intra-company transfer)',
  ],
  'ie.option.permissionKind.stamp1g-graduate': [
    'Stamp 1G（毕业生计划）',
    'Stamp 1G (Third Level Graduate Programme)',
  ],
  'ie.option.permissionKind.stamp1g-spouse': [
    'Stamp 1G（雇佣许可持有人或研究员的配偶、伴侣）',
    'Stamp 1G (spouse or partner of an employment permit holder or researcher)',
  ],
  'ie.option.permissionKind.stamp1g-ict': [
    'Stamp 1G（ICT 持有人的配偶、伴侣）',
    'Stamp 1G (spouse or partner of an ICT holder)',
  ],
  'ie.option.permissionKind.stamp1a': [
    'Stamp 1A（见习会计）',
    'Stamp 1A (trainee accountant)',
  ],
  'ie.option.permissionKind.stamp0': [
    'Stamp 0（经济独立者、访问学者等）',
    'Stamp 0 (independent means, visiting academic and so on)',
  ],
  'ie.option.permissionKind.stamp3': [
    'Stamp 3（志愿者、宗教人员等）',
    'Stamp 3 (volunteers, ministers of religion and so on)',
  ],
  'ie.option.permissionKind.stamp3-family': [
    'Stamp 3（家庭团聚下的配偶、伴侣，改发 1G 之前）',
    'Stamp 3 (spouse or partner under family reunification, before 1G)',
  ],
  'ie.option.permissionKind.stamp4': ['Stamp 4', 'Stamp 4'],
  'ie.option.permissionKind.stamp4d': ['Stamp 4D 或 4S', 'Stamp 4D or 4S'],
  'ie.option.permissionKind.stamp4-eufam': [
    'Stamp 4 EUFam（欧盟公民家属）',
    'Stamp 4 EUFam (family member of an EU citizen)',
  ],
  'ie.option.permissionKind.stamp5': [
    'Stamp 5（Without Condition As To Time）',
    'Stamp 5 (Without Condition As To Time)',
  ],
  'ie.option.permissionKind.student': [
    '学生 Stamp 2 或 2A',
    'Student Stamp 2 or 2A',
  ],
  'ie.option.permissionKind.protection-applicant': [
    '等待国际保护决定',
    'Waiting for an international protection decision',
  ],
  'ie.option.permissionKind.ni-residence': [
    '在北爱尔兰合法居住',
    'Lawful residence in Northern Ireland',
  ],
  'ie.option.permissionKind.other': [
    '其他（临时保护等）',
    'Other (temporary protection and so on)',
  ],
  'ie.option.registrationBasis.required': ['须登记', 'Must register'],
  'ie.option.registrationBasis.exempt': ['依法免登记', 'Exempt by law'],
  'ie.option.registrationBasis.minister-directed': [
    '部长指示须登记',
    'Registration directed by the Minister',
  ],
  'ie.option.registrationStage.first': ['首次登记', 'First registration'],
  'ie.option.registrationStage.renewal': ['续期', 'Renewal'],
  'ie.option.familyRegistrationStage.first': ['首次登记', 'First registration'],
  'ie.option.familyRegistrationStage.renewal': ['续期', 'Renewal'],
  'ie.option.feeExemption.confirmed': ['已确认免费', 'Exemption confirmed'],
  'ie.option.feeExemption.none': ['不免费', 'No exemption'],
  'ie.option.feeExemption.protection-mapping-uncertain': [
    '保护身份是否免费尚不确定',
    'Unclear whether the protection status is exempt',
  ],
  'ie.option.entitlement.none': [
    '没有爱尔兰国籍，也没有其他取得途径',
    'Not Irish and no other route',
  ],
  'ie.option.entitlement.already-citizen': [
    '已是爱尔兰公民',
    'Already an Irish citizen',
  ],
  'ie.option.entitlement.birth-descent-or-fbr': [
    '可凭出生、血统或外籍出生登记（FBR）取得',
    'Entitled by birth, descent or Foreign Births Registration',
  ],
  'ie.option.entitlement.uncertain': ['不确定', 'Not sure'],
  'ie.option.record.none': ['没有', 'None'],
  'ie.option.record.conviction-or-other': [
    '有定罪或其他须申报事项',
    'A conviction or other matter to declare',
  ],
  'ie.option.record.awaiting-trial': ['有案件待审', 'Awaiting trial'],
  'ie.option.vetting.completed': ['已完成', 'Completed'],
  'ie.option.vetting.authorised': [
    '已授权、正在进行',
    'Authorised and in progress',
  ],
  'ie.option.vetting.outstanding': ['未完成', 'Outstanding'],
  'ie.option.vetting.pending-review': ['等待审查', 'Pending review'],
  'ie.option.identityDocuments.validPassport': ['有效护照', 'Valid passport'],
  'ie.option.identityDocuments.irp': ['IRP 卡', 'IRP card'],
  'ie.option.identityDocuments.licence': [
    '爱尔兰驾照',
    'Irish driving licence',
  ],
  'ie.option.identityDocuments.servicesCard': [
    'Public Services Card',
    'Public Services Card',
  ],
  'ie.option.identityDocuments.ppsLetter': ['PPS 号码信', 'PPS number letter'],
  'ie.option.identityDocuments.euId': ['欧盟身份证', 'EU identity card'],
  'ie.option.identityDocuments.protectionId': [
    '保护身份证件',
    'Protection identity document',
  ],
  'ie.option.residenceBasis.reckonable': ['可计入', 'Reckonable'],
  'ie.option.residenceBasis.excluded': ['不计入', 'Does not count'],
  'ie.option.residenceBasis.uncertain': ['不确定', 'Not sure'],
  'ie.option.spouseRelationship.spouse': ['配偶', 'Spouse'],
  'ie.option.spouseRelationship.civil-partner': ['民事伴侣', 'Civil partner'],
  'ie.option.spouseRelationship.de-facto': [
    '事实伴侣（de facto）',
    'De facto partner',
  ],
  'ie.option.spouseRelationship.ended': [
    '关系已结束',
    'The relationship has ended',
  ],
  'ie.option.waiver.none': ['未申请', 'Not requested'],
  'ie.option.waiver.pending': ['正在处理', 'Pending'],
  'ie.option.waiver.denied': ['被拒绝', 'Refused'],
  'ie.option.waiver.granted': ['已批准', 'Granted'],
  'ie.option.waivedConditions.marriage': ['婚姻年限', 'Length of marriage'],
  'ie.option.waivedConditions.continuous': [
    '递交前连续居住',
    'Continuous residence before filing',
  ],
  'ie.option.waivedConditions.prior': [
    '此前累计居住',
    'Earlier total residence',
  ],
  'ie.option.waivedConditions.intent': [
    '继续居住的意愿',
    'Intention to reside',
  ],
  'ie.option.protectionKind.convention-refugee': [
    '公约难民',
    'Convention refugee',
  ],
  'ie.option.protectionKind.programme-refugee': [
    '项目难民',
    'Programme refugee',
  ],
  'ie.option.protectionKind.stateless': ['无国籍人', 'Stateless person'],
  'ie.option.protectionKind.subsidiary': ['附属保护', 'Subsidiary protection'],
  'ie.option.protectionKind.pending': ['申请中', 'Pending'],
  'ie.option.protectionKind.none': ['无', 'None'],
  'ie.option.waivedResidenceConditions.continuous': [
    '递交前连续居住',
    'Continuous residence before filing',
  ],
  'ie.option.waivedResidenceConditions.prior': [
    '此前累计居住',
    'Earlier total residence',
  ],
  'ie.option.workBasis.csep': [
    'Critical Skills Employment Permit',
    'Critical Skills Employment Permit',
  ],
  'ie.option.workBasis.hosting': [
    '研究员 Hosting Agreement',
    'Researcher Hosting Agreement',
  ],
  'ie.option.workBasis.multi-site-doctor': [
    'NCHD 医生的多地点 GEP',
    'Multi-Site GEP for hospital doctors',
  ],
  'ie.option.workBasis.gep': [
    'General Employment Permit',
    'General Employment Permit',
  ],
  'ie.option.workBasis.ict': ['公司内调 ICT', 'Intra-company transfer'],
  'ie.option.permitTier.csep': [
    'Critical Skills（标准薪资）',
    'Critical Skills (standard salary)',
  ],
  'ie.option.permitTier.csepGraduate': [
    'Critical Skills（相关学位）',
    'Critical Skills (relevant degree)',
  ],
  'ie.option.permitTier.csepHigh': [
    'Critical Skills（高薪档）',
    'Critical Skills (higher salary)',
  ],
  'ie.option.permitTier.gep': [
    'General Employment（标准薪资）',
    'General Employment (standard salary)',
  ],
  'ie.option.permitTier.gepLower': [
    'General Employment（较低薪资档）',
    'General Employment (lower salary)',
  ],
  'ie.option.permitTier.gepGraduate': [
    'General Employment（毕业生）',
    'General Employment (graduate)',
  ],
  'ie.option.permitTier.ict': ['ICT（关键人员）', 'ICT (key personnel)'],
  'ie.option.permitTier.ictTrainee': ['ICT（培训生）', 'ICT (trainee)'],
  'ie.option.familyRelationship.spouse': ['配偶', 'Spouse'],
  'ie.option.familyRelationship.civil-partner': ['民事伴侣', 'Civil partner'],
  'ie.option.familyRelationship.de-facto': [
    '事实伴侣（de facto）',
    'De facto partner',
  ],
  'ie.option.familyRelationship.child': ['子女', 'Child'],
  'ie.option.familyRelationship.other': ['其他亲属', 'Other relative'],
  'ie.option.sponsorCategory.A': [
    'A 类（爱尔兰公民）',
    'Category A (Irish citizen)',
  ],
  'ie.option.sponsorCategory.B': [
    'B 类（Critical Skills、研究员、ICT 等）',
    'Category B (Critical Skills, researchers, ICT and others)',
  ],
  'ie.option.sponsorCategory.C': [
    'C 类（General Employment Permit、其他 Stamp 4 等）',
    'Category C (General Employment Permit, other Stamp 4 and others)',
  ],
  'ie.option.changeKind.separation': [
    '分居或关系破裂',
    'Separation or breakdown',
  ],
  'ie.option.changeKind.death': ['担保人去世', 'Death of the sponsor'],
  'ie.option.changeKind.domestic-abuse': ['家庭暴力', 'Domestic abuse'],
  'ie.option.familyChannel.ordinary': [
    '普通家庭团聚',
    'Ordinary family reunification',
  ],
  'ie.option.familyChannel.spouse-registration': [
    '爱尔兰公民配偶直接登记',
    'Direct registration as an Irish citizen’s spouse',
  ],
  'ie.option.familyChannel.spouse-in-state': [
    '爱尔兰公民配偶境内申请',
    'In-State application as an Irish citizen’s spouse',
  ],
  'ie.option.familyChannel.de-facto-in-state': [
    '境内 de facto 申请',
    'In-State de facto application',
  ],
  'ie.option.familyChannel.de-facto-overseas': [
    '境外 de facto 申请',
    'Overseas de facto application',
  ],
  'ie.option.spouseInStateEntry.with-permission': [
    '持有有效许可的境内转换',
    'In-State change while holding permission',
  ],
  'ie.option.spouseInStateEntry.spouse-unit': [
    'Spouse Unit（短期签证、被拒登记等特殊情形）',
    'Spouse Unit (short-stay visa, refused registration and other special cases)',
  ],
  'ie.option.visa.single': ['单次入境签证', 'Single-entry visa'],
  'ie.option.visa.multiple': ['多次入境签证', 'Multiple-entry visa'],
  'ie.option.visa.preclearance': ['预审（preclearance）', 'Preclearance'],
  'ie.option.visa.exempt': ['免签', 'Visa exempt'],
  'ie.option.insuranceKind.private': [
    '私人医疗保险',
    'Private medical insurance',
  ],
  'ie.option.insuranceKind.travel-bridge': [
    '过渡期旅行保险',
    'Travel insurance until private cover starts',
  ],
  'ie.option.housingKind.private-owned': ['自有住房', 'Owned privately'],
  'ie.option.housingKind.private-rented': ['私人租房', 'Rented privately'],
  'ie.option.housingKind.excluded-public': [
    '不计入的公共住房',
    'Public housing that does not count',
  ],
  'ie.option.housingKind.other-support': [
    '其他住房支持',
    'Other housing support',
  ],
  'ie.option.benefit.none': ['没有', 'None'],
  'ie.option.benefit.prsi-only': [
    '只领取基于 PRSI 缴费的福利',
    'Only PRSI-based benefits',
  ],
  'ie.option.benefit.non-insurance': [
    '非缴费型福利',
    'Non-contributory benefits',
  ],
  'ie.option.benefit.means-tested': ['经济审查型福利', 'Means-tested benefits'],
  'ie.option.benefit.other': ['其他', 'Other'],
  'ie.option.ltrBasis.gep': [
    'General Employment Permit',
    'General Employment Permit',
  ],
  'ie.option.ltrBasis.csep': [
    'Critical Skills Employment Permit',
    'Critical Skills Employment Permit',
  ],
  'ie.option.ltrBasis.legacy-employment': [
    '旧制就业许可',
    'Legacy work permit',
  ],
  'ie.option.ltrBasis.employment-stamp4': [
    '就业升级后的 Stamp 4',
    'Stamp 4 after a work upgrade',
  ],
  'ie.option.ltrBasis.hosting': [
    '研究员 Hosting Agreement',
    'Researcher Hosting Agreement',
  ],
  'ie.option.ltrBasis.hosting-stamp4': [
    '研究员升级后的 Stamp 4',
    'Stamp 4 after a researcher upgrade',
  ],
  'ie.option.ltrBasis.public-sho-registrar': [
    '公立医院 SHO／Registrar 医生',
    'Public hospital SHO or Registrar',
  ],
  'ie.option.ltrBasis.multi-site-doctor': [
    '多地点 GEP 医生',
    'Multi-Site GEP doctor',
  ],
  'ie.option.ltrBasis.ict': ['公司内调 ICT', 'Intra-company transfer'],
  'ie.option.ltrBasis.other-excluded': [
    '其他不计入的许可',
    'Other permission that does not count',
  ],
  'ie.option.ltrBasis.uncertain': ['不确定', 'Not sure'],
  'ie.option.ltrEmployment.employed': ['受雇', 'Employed'],
  'ie.option.ltrEmployment.self-employed': ['自雇', 'Self-employed'],
  'ie.option.ltrEmployment.unemployed': ['失业', 'Unemployed'],
  'ie.option.treatyRole.citizen': [
    '本人（欧盟、EEA、瑞士或英国公民）',
    'The citizen (EU, EEA, Swiss or UK)',
  ],
  'ie.option.treatyRole.family': ['家属', 'A family member'],
  'ie.option.treatyRelationship.spouse': ['配偶', 'Spouse'],
  'ie.option.treatyRelationship.civil-partner': ['民事伴侣', 'Civil partner'],
  'ie.option.treatyRelationship.descendant': [
    '直系卑亲属（子女等）',
    'Descendant',
  ],
  'ie.option.treatyRelationship.ascendant': [
    '直系尊亲属（父母等）',
    'Ascendant',
  ],
  'ie.option.treatyRelationship.other-dependent': [
    '其他受抚养家属',
    'Other dependant',
  ],
  'ie.option.treatyRelationship.durable-partner': [
    '稳定伴侣',
    'Durable partner',
  ],
  'ie.option.treatyRelationship.care': ['需要照护', 'Needing care'],
  'ie.option.activityBasis.initial': [
    '入境后的初始居留期',
    'Initial period after arrival',
  ],
  'ie.option.activityBasis.employed': ['受雇', 'Employed'],
  'ie.option.activityBasis.self-employed': ['自雇', 'Self-employed'],
  'ie.option.activityBasis.self-sufficient': ['经济自给', 'Self-sufficient'],
  'ie.option.activityBasis.student': ['学生', 'Student'],
  'ie.option.activityBasis.family': ['家属', 'Family member'],
  'ie.option.activityBasis.retained-family': [
    '保留权利的家属',
    'Retained-rights family member',
  ],
  'ie.option.activityBasis.registered-involuntary-unemployment': [
    '已登记的非自愿失业',
    'Registered involuntary unemployment',
  ],
  'ie.option.activityBasis.temporary-incapacity': [
    '暂时丧失工作能力',
    'Temporary incapacity',
  ],
  'ie.option.activityBasis.vocational-training': [
    '职业培训',
    'Vocational training',
  ],
  'ie.option.activityBasis.jobseeker': ['求职', 'Jobseeker'],
  'ie.option.activityBasis.ineligible': [
    '不合格的居住',
    'Ineligible residence',
  ],
  'ie.option.absenceReason.temporary': ['短期出境', 'Temporary absence'],
  'ie.option.absenceReason.military': ['服兵役', 'Military service'],
  'ie.option.absenceReason.important': [
    '重要原因（怀孕、重病、学习等）',
    'Important reasons (pregnancy, serious illness, study and so on)',
  ],
  'ie.option.acquisition.ordinary': [
    '通常方式（连续居住期满）',
    'Ordinary (continuous residence)',
  ],
  'ie.option.acquisition.early': ['提前取得', 'Early acquisition'],
  'ie.option.acquisition.retained': [
    '保留权利后取得',
    'After retaining a right',
  ],
  'ie.option.earlyKind.retired': ['退休', 'Retirement'],
  'ie.option.earlyKind.incapacity': [
    '永久丧失工作能力',
    'Permanent incapacity',
  ],
  'ie.option.earlyKind.frontier': ['跨境工作者', 'Frontier worker'],
  'ie.option.earlyKind.worker-death': [
    '工作者去世后的家属',
    'Family of a worker who died',
  ],
  'ie.option.retentionEvent.death': ['欧盟公民去世', 'Death of the EU citizen'],
  'ie.option.retentionEvent.departure': [
    '欧盟公民离境',
    'Departure of the EU citizen',
  ],
  'ie.option.retentionEvent.dissolution': [
    '离婚或解除民事伴侣关系',
    'Divorce or dissolution',
  ],
  'ie.option.retentionEvent.child-education-only': [
    '仅因子女在读',
    'Children in education only',
  ],
  'ie.option.personalBasis.work': ['工作或自雇', 'Work or self-employment'],
  'ie.option.personalBasis.self-support': ['经济自给', 'Self-sufficiency'],
  'ie.option.personalBasis.qualified-family': [
    '合格家属',
    'Family member of a qualifying person',
  ],
  'ie.option.familyCategory.already-resident': [
    '过渡期结束前已在爱尔兰居住',
    'Already resident before the transition ended',
  ],
  'ie.option.familyCategory.prior-relationship': [
    '关系在过渡期结束前已存在',
    'Relationship existed before the transition ended',
  ],
  'ie.option.familyCategory.later-child': [
    '之后出生或收养的子女',
    'Child born or adopted later',
  ],
  'ie.option.familyCategory.retention': ['保留权利', 'Retained rights'],
  'ie.option.familyCategory.permitted-relative': [
    '许可家属（permitted family member）',
    'Permitted family member',
  ],
  'ie.option.familyCategory.necessary-carer': ['必要照护人', 'Necessary carer'],
  'ie.option.currentCardCategory.ordinary': ['普通居留卡', 'Residence card'],
  'ie.option.currentCardCategory.permanent': [
    '永久居留卡',
    'Permanent residence card',
  ],
  'ie.option.publicInterest.clear': ['已通过', 'Cleared'],
  'ie.option.publicInterest.pending': ['审查中', 'Pending'],
  'ie.option.publicInterest.restricting-order': [
    '已有限制居留权的决定',
    'A restriction order was made',
  ],
} as const;

type IrelandFormMessages = Record<keyof typeof messages, string>;

function translations(language: 0 | 1): IrelandFormMessages {
  return Object.fromEntries(
    Object.entries(messages).map(([key, values]) => [key, values[language]]),
  ) as IrelandFormMessages;
}

export const ieFormZh = translations(0);
export const ieFormEn = translations(1);
