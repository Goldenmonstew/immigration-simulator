import {
  ireland2026_11,
  irelandFull2026_11,
} from '@uk-immigration/policy-data';
import { ieFormEn, ieFormZh } from './ireland-form';

// Policy figures in the change summaries come from the parameters.
const euro = (amount: number) => `€${amount.toLocaleString('en')}`;
const { income, relationship } = irelandFull2026_11.family;
const { categoryA, previousCategoryA, categoryC, taxYearsA } = income.value;
const { categoryCWaitMonths } = relationship.value;
const registrationFee = euro(irelandFull2026_11.registration.value.fee);
const minor = irelandFull2026_11.naturalisation.minor.value;
const minorContinuous = ireland2026_11.values.continuousYears.value;

export const zhCN = {
  ...ieFormZh,
  'hub.ie.code': 'IE',
  'hub.ie.paths': '入籍 · Stamp 4／5 · LTR · EU／WA 永久居留',
  'hub.ie.desc':
    '核对七类入籍、就业与家庭 Stamp 4、Stamp 5、Long Term Residency 及 EU／Withdrawal Agreement 永久居留的全部条件，比较不同情形的日期，查看待确认事项与官方依据。',
  'ie.name': '爱尔兰',
  'ie.title': '爱尔兰入籍与长期居留模拟',
  'ie.intro':
    '选择与你有关的路径，逐项核对法定条件，查看最早可递交的日期，以及还需要补充或等待确认的事项。',
  'ie.scope':
    '入籍涵盖一般入籍、爱尔兰公民配偶、境内出生或父母已入籍的未成年人、Irish descent／associations、难民与无国籍人、境外公共服务。居留涵盖就业与家庭 Stamp 4、Stamp 5、Long Term Residency，以及 EU Treaty Rights 与 Withdrawal Agreement 下的永久居留。Stamp 4、Stamp 5 和 LTR 是 ISD 的行政政策。2026 年公布的入籍修法草案尚未成为法律，不进入计算。裁量与个案认定保留为待确认。',
  'ie.prepare':
    '准备每段居留许可（Stamp）与 IRP 的起止日、出入境记录，以及与所选路径有关的材料，例如雇主信与工资单、身份与逐年居住证明、担保人收入、住房和保险资料，或欧盟居住活动记录。',
  'ie.privacy':
    '问卷在浏览器内计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
  'ie.policy.pageTitle': '爱尔兰政策依据',
  'ie.policy.title': '爱尔兰现行法律与 ISD 政策',
  'ie.policy.rule.natContinuous': '递交前连续居住与合法许可',
  'ie.policy.rule.natAbsences': '最后一年的缺席（70 天规则）',
  'ie.policy.rule.natPrior': '此前回溯期内累计居住',
  'ie.policy.rule.spouseMarriage': '婚姻或民事伴侣满年限',
  'ie.policy.rule.stamp4WorkTime': '就业 Stamp 4 升级所需受雇时间',
  'ie.policy.rule.familyLegacyTime':
    '原 Stamp 1G／Stamp 3 家庭团聚时间（旧计时参考）',
  'ie.policy.rule.wcattTime': 'Stamp 5 合格许可时间',
  'ie.policy.change.family2026': '家庭团聚政策 2026 年 6 月版',
  'ie.policy.change.family2026Summary': `申请日在此日及之后，A 类（爱尔兰公民）担保人须在申请前 ${taxYearsA} 个税年税前合计至少 ${euro(categoryA)}（此前为 ${euro(previousCategoryA)}）。`,
  'ie.policy.change.family2025': '家庭团聚政策 2025 年 11 月修订',
  'ie.policy.change.family2025Summary': `自此日起，C 类担保人按修订版等满 ${categoryCWaitMonths} 个月，无子女伴侣按上一税年税前收入超过 ${euro(categoryC)} 核对。`,
  'ie.policy.change.registrationFee': 'IRP 登记费调整',
  'ie.policy.change.registrationFeeSummary': `自此日起，须缴费的登记或续期按 S.I. 421/2025 收费 ${registrationFee}，法定豁免情形除外。`,
  'ie.policy.change.minor': '境内出生未成年人入籍居住要求',
  'ie.policy.change.minorSummary': `自此日起，在共和国出生的未成年人按递交前连续 ${minorContinuous} 年加此前 ${minor.windowYears} 年内累计 ${minor.priorYears} 年的居住核对（s15B 修订）。`,
  'ie.policy.category': '类别',
  'ie.policy.maxPoints': '满分',
  'ie.policy.association.experiential': '经历关联',
  'ie.policy.association.family': '家庭关联',
  'ie.policy.association.cultural': '文化关联',
  'ie.policy.association.establishment': '在境内立足',
  'ie.policy.children': '子女数',
  'ie.policy.minimumNetIncome': '最低年净收入（{year}）',
  'ie.result.finishQuestionnaire':
    '请返回问卷，完成所选路径的必填项目后再查看结果。',
  'ie.result.projected':
    '这是按所填资料推算的日期：届时请确认所用材料与身份仍然有效，并用实际递交日和更新后的材料重新计算。',
  'ie.result.projectedWork':
    '这是按所填资料推算的日期：届时请确认雇主信、IRP 卡等材料仍在有效期内，并用实际递交日和更新后的材料重新计算。',
  'ie.result.legacyReference': '旧计时参考，不影响本路径结论。',
  'ie.result.checkMet': '按所填资料满足。',
  'ie.result.checkNotMet': '按所填资料不满足。',
  'ie.result.checkUnknown': '还缺少可以确认这一项的资料。',
  'ie.error.required': '请填写或选择这一项。',
  'ie.error.list': '请添加记录，或点「确认没有」。',
  'ie.error.date': '请填写有效日期。',
  'ie.error.number': '请填写不小于 0 的数字（件数、人数等须为整数）。',
  'ie.error.fraction': '请填写 0 到 1 之间的比例，例如 0.25 表示 25%。',
  'ie.error.order': '这个日期不能早于开始的日期。',
  'ie.error.pathways': '请至少选择一条要核对的路径。',
  'ie.error.familyFirstChannel':
    '评估首次登记时，请在「申请日期与渠道」一节选择普通家庭团聚、境外 de facto 申请或爱尔兰公民配偶直接登记。',
  'ie.error.familySpouseRegistration':
    '爱尔兰公民配偶直接登记按首次登记或续期核对：请在「本次评估的是」选「已获准入境，评估首次登记」或续期，或在「申请日期与渠道」一节改选其他渠道。',
  'ie.whatif.date': '模拟（递交）日期',
  'ie.whatif.dateHint':
    '改动日期只影响对比。所填材料在新日期是否仍然有效，需要另行确认。',
  'ie.whatif.noTrips': '假设没有出境记录',
  'ie.whatif.employmentStart': '在爱尔兰凭就业许可开始工作的日期',
  'ie.whatif.irpExpiresOn': '现有 IRP 卡到期日',
  'ie.whatif.irpHint':
    'EU／WA 永久居留卡续期已填写证件到期日时，按证件到期日计算，这一项不影响。',
  'ie.whatif.income': '担保人最近一个税年税前收入（€）',
  'ie.whatif.incomeHint': `只在核对家庭许可申请时显示。替换问卷中最近一个税年的数字，问卷没有填税年时按只有这一个税年核对；留空则沿用问卷资料。A 类按最近 ${taxYearsA} 个税年合计核对。`,
  'ie.whatif.invalid': '对比后的资料有未通过问卷校验的项目，请先核对问卷。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...ieFormEn,
  'hub.ie.code': 'IE',
  'hub.ie.paths':
    'Naturalisation · Stamp 4 or 5 · LTR · EU or WA permanent residence',
  'hub.ie.desc':
    'Check every requirement for seven naturalisation routes, work and family Stamp 4, Stamp 5, Long Term Residency and permanent residence under EU Treaty Rights or the Withdrawal Agreement. Compare dates and see what is still to be confirmed, with official sources.',
  'ie.name': 'Ireland',
  'ie.title': 'Naturalisation and long-term residence in Ireland',
  'ie.intro':
    'Choose the pathways relevant to you, check each statutory requirement and see the earliest date you could apply, with anything you still need to provide or have confirmed.',
  'ie.scope':
    'Naturalisation covers ordinary naturalisation, spouses of Irish citizens, minors born in the State or with a naturalised parent, Irish descent or associations, refugees and stateless people, and public service abroad. Residence covers work and family Stamp 4, Stamp 5, Long Term Residency and permanent residence under EU Treaty Rights and the Withdrawal Agreement. Stamp 4, Stamp 5 and LTR are ISD policy. The 2026 draft citizenship bill is not law and is not used. Discretionary and individual decisions stay to be confirmed.',
  'ie.prepare':
    'Have the start and end dates of each permission (stamp) and IRP, your trips abroad and the evidence for your pathways ready, such as employer letters and payslips, identity and yearly residence evidence, sponsor income, housing and insurance details, or a record of EU residence activities.',
  'ie.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
  'ie.policy.pageTitle': 'Policy basis for Ireland',
  'ie.policy.title': 'Irish law and ISD policy in force',
  'ie.policy.rule.natContinuous':
    'Continuous residence and lawful permission before filing',
  'ie.policy.rule.natAbsences': 'Absences in the final year (70-day rule)',
  'ie.policy.rule.natPrior': 'Total residence in the earlier window',
  'ie.policy.rule.spouseMarriage': 'Length of marriage or civil partnership',
  'ie.policy.rule.stamp4WorkTime': 'Employment period for a work Stamp 4',
  'ie.policy.rule.familyLegacyTime':
    'Time on Stamp 1G or Stamp 3 under family reunification (legacy reference)',
  'ie.policy.rule.wcattTime': 'Qualifying permission period for Stamp 5',
  'ie.policy.change.family2026': 'Family reunification policy, June 2026',
  'ie.policy.change.family2026Summary': `For applications on or after this date, a Category A (Irish citizen) sponsor needs gross income of at least ${euro(categoryA)} over the ${taxYearsA} tax years before applying (previously ${euro(previousCategoryA)}).`,
  'ie.policy.change.family2025':
    'Family reunification policy, November 2025 revision',
  'ie.policy.change.family2025Summary': `From this date, Category C sponsors wait ${categoryCWaitMonths} months under the revised policy, and a couple without children needs gross income above ${euro(categoryC)} in the previous tax year.`,
  'ie.policy.change.registrationFee': 'IRP registration fee',
  'ie.policy.change.registrationFeeSummary': `From this date, a registration or renewal that is not exempt costs ${registrationFee} under S.I. 421/2025.`,
  'ie.policy.change.minor': 'Residence for minors born in the State',
  'ie.policy.change.minorSummary': `From this date, a minor born in the State needs ${minorContinuous} year of continuous residence before filing plus ${minor.priorYears} years in the ${minor.windowYears} before that (amended s15B).`,
  'ie.policy.category': 'Category',
  'ie.policy.maxPoints': 'Maximum points',
  'ie.policy.association.experiential': 'Experiential connection',
  'ie.policy.association.family': 'Family connection',
  'ie.policy.association.cultural': 'Cultural connection',
  'ie.policy.association.establishment': 'Establishment in the State',
  'ie.policy.children': 'Number of children',
  'ie.policy.minimumNetIncome': 'Minimum annual net income ({year})',
  'ie.result.finishQuestionnaire':
    'Return to the questionnaire and complete the required fields for your pathways before viewing results.',
  'ie.result.projected':
    'This date is projected from your answers. Check that your documents and status will still be valid then, and work it out again with the actual filing date and updated documents.',
  'ie.result.projectedWork':
    'This date is projected from your answers. Check that documents such as the employer’s letter and IRP card will still be valid then, and work it out again with the actual filing date and updated documents.',
  'ie.result.legacyReference':
    'Legacy timing for reference only; it does not affect this pathway.',
  'ie.result.checkMet': 'Met on your answers.',
  'ie.result.checkNotMet': 'Not met on your answers.',
  'ie.result.checkUnknown': 'More information is needed to confirm this.',
  'ie.error.required': 'Complete this field.',
  'ie.error.list': 'Add a record, or choose “Confirm there are none”.',
  'ie.error.date': 'Enter a valid date.',
  'ie.error.number': 'Enter a number of 0 or more (whole numbers for counts).',
  'ie.error.fraction':
    'Enter a fraction from 0 to 1, for example 0.25 for 25%.',
  'ie.error.order': 'This date cannot be before the start date.',
  'ie.error.pathways': 'Select at least one pathway to check.',
  'ie.error.familyFirstChannel':
    'To check a first registration, choose ordinary family reunification, an overseas de facto application or direct registration as an Irish citizen’s spouse under “Application date and channel”.',
  'ie.error.familySpouseRegistration':
    'Direct registration as an Irish citizen’s spouse is checked as a first registration or renewal. Under what to assess, choose “Granted entry: first registration” or renewal, or choose another channel under “Application date and channel”.',
  'ie.whatif.date': 'Simulation (filing) date',
  'ie.whatif.dateHint':
    'Changing the date only affects the comparison. Check separately whether your documents would still be valid then.',
  'ie.whatif.noTrips': 'Assume no trips abroad',
  'ie.whatif.employmentStart':
    'Date you started work in Ireland on the employment permit',
  'ie.whatif.irpExpiresOn': 'Expiry on your current IRP',
  'ie.whatif.irpHint':
    'An EU or WA permanent residence card renewal uses the card expiry date when you entered it, so this control does not change it.',
  'ie.whatif.income': 'Sponsor’s gross income in the latest tax year (€)',
  'ie.whatif.incomeHint': `Shown only when a family permission application is checked. Replaces the latest tax year in the questionnaire, or is used as the only tax year if none was entered. Leave blank to keep your answers. Category A adds up the latest ${taxYearsA} tax years.`,
  'ie.whatif.invalid':
    'The compared answers fail a questionnaire check. Review the questionnaire first.',
};
