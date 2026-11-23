import type { SourceRef } from '@uk-immigration/policy-data';

type Condition = readonly [
  string,
  string,
  readonly (readonly [string, string])[],
];

const conditions = {
  A01: [
    '成年与国籍',
    'Adult age and citizenship',
    [
      ['SRC-091', 'ss14, 15(1)(a), 15A(1)(a)'],
      ['SRC-401', 's2'],
    ],
  ],
  A02: [
    '良好品格与如实披露',
    'Good character and truthful disclosure',
    [
      ['SRC-091', 'ss15(1)(b), 15A(1)(b), 29A'],
      ['SRC-095', 'Good Character'],
    ],
  ],
  A03: [
    'Garda e-vetting 与背景核查',
    'Garda e-vetting and background checks',
    [
      ['SRC-382', 'What is e-Vetting? and eligibility'],
      ['SRC-380', 'Form 8 §8'],
    ],
  ],
  A04: [
    '递交时居住与合法身份',
    'Residence and lawful status at filing',
    [
      ['SRC-091', 'ss15(1)(c), 15A(1)(e)–(f), 15B(1)(c), 15C, 16(1), 16A'],
      ['SRC-093', 's295'],
      ['SRC-095', 'Time That Does Not Count'],
    ],
  ],
  A05: [
    '善意继续居住',
    'Good-faith intention to continue residing',
    [['SRC-091', 'ss15(1)(d), 15A(1)(g), 15A(4)']],
  ],
  A06: [
    '效忠声明、守法与民主价值承诺',
    'Declaration of fidelity and undertaking',
    [
      ['SRC-091', 'ss15(1)(e), 15A(1)(h), 15B(1)(d)'],
      ['SRC-380', 'S.I. 569/2011 reg. 9'],
    ],
  ],
  A07: [
    '身份与申请材料',
    'Identity and application documents',
    [
      ['SRC-091', 's17'],
      ['SRC-095', 'Citizenship Identity Scorecard; If You Are a Refugee'],
      ['SRC-380', 'Forms 8–11'],
      ['SRC-381', 'Proof of identity'],
    ],
  ],
  A08: [
    '逐年居住证明',
    'Residence evidence for each required year',
    [
      ['SRC-095', 'The 150-Point Rule'],
      ['SRC-381', 'Proof of residence and Residency Affidavit'],
    ],
  ],
  A09: [
    '入籍申请费',
    'Naturalisation application fee',
    [['SRC-380', 'S.I. 569/2011 reg. 13(1)(a)']],
  ],
  A10: [
    '发证费与取得国籍',
    'Certification fee and acquisition of citizenship',
    [
      ['SRC-091', 's18'],
      ['SRC-380', 'S.I. 569/2011 reg. 13(1)(b), (2)'],
    ],
  ],
  A11: [
    '其他入籍门槛的适用性',
    'Applicability of other naturalisation requirements',
    [
      ['SRC-091', 'ss15(1), 15A(1), 15B(1)'],
      ['SRC-095', 'Who can apply'],
    ],
  ],
  A12: [
    '补件、地址更新及部长决定',
    'Additional evidence, address changes and ministerial decision',
    [
      ['SRC-091', 'ss15–18'],
      ['SRC-095', 'Deadlines for Additional Documents'],
      ['SRC-381', 'Change of address form'],
    ],
  ],
  A13: [
    '有效关系、同住及配偶声明',
    'Recognised relationship, cohabitation and spouse declaration',
    [
      ['SRC-091', 's15A(1)(c)–(d)'],
      ['SRC-095', 'Statutory Declaration for Spouses or Civil Partners'],
    ],
  ],
  A14: [
    '公共服务外派与特别豁免',
    'Public service posting and serious-harm waiver',
    [['SRC-091', 'ss15A(2)–(4), 15C(4)']],
  ],
  A15: [
    '在境内出生、未成年及代申请',
    'Birth in the State, minority and application on behalf of the child',
    [
      ['SRC-091', 'ss6–7, 15B(1), (5)'],
      ['SRC-092', 's8 and S.I. 389/2023'],
      ['SRC-095', 'Document requirements for minors'],
    ],
  ],
  A16: [
    '未成年人品格与声明规则',
    'Character and declaration rules for minors',
    [
      ['SRC-091', 's15B(1)–(4)'],
      ['SRC-380', 'Form 11 §5'],
    ],
  ],
  A17: [
    '已入籍父母与 Form 9',
    'Naturalised parent and Form 9',
    [
      ['SRC-091', 's16(1)(c)'],
      ['SRC-095', 'Application by a parent with Irish Citizenship'],
    ],
  ],
  A18: [
    'Irish descent 或 Irish associations',
    'Irish descent or Irish associations',
    [
      ['SRC-091', 's16(1)(a)–(b), (2)'],
      ['SRC-400', 'What Irish associations means'],
    ],
  ],
  A19: [
    '关联证据与豁免裁量',
    'Irish association evidence and discretionary waiver',
    [
      ['SRC-400', 'December 2025 guidance Steps 1–4 and Table 1 (p3)'],
      ['SRC-091', 's16(1)'],
    ],
  ],
  A20: [
    '保护类别、认可日期与入籍居住政策',
    'Protection status, grant date and residence policy',
    [
      ['SRC-091', 'ss16(1)(g), 16A'],
      [
        'SRC-381',
        'Changes to citizenship for people granted International Protection',
      ],
      ['SRC-095', 'Reckonable Residence for Refugees or people with international protection; 70 Days Absence Rule'],
    ],
  ],
  A21: [
    '本人在境外从事爱尔兰公共服务',
    'Applicant serving abroad in the Irish public service',
    [['SRC-091', 'ss2(1), 16(1)(f)']],
  ],
  B01: [
    '登记、现行许可及住址',
    'Registration, current permission and address',
    [
      ['SRC-383', 'Immigration Act 2004 ss4–5, 9'],
      ['SRC-384', 'Renewing your registration permission'],
      ['SRC-405', 'Registration requirements for minors'],
    ],
  ],
  B02: [
    '登记费及法定豁免',
    'Registration fee and statutory exemptions',
    [['SRC-383', 'Immigration Act s19 and S.I. 421/2025 regs. 1, 3–5']],
  ],
  'IRP-RENEWAL-WINDOW': [
    'IRP 线上续期开放日',
    'IRP online renewal opening date',
    [['SRC-384', 'Online renewal: When should I submit a Renewal Application?']],
  ],
  'IRP-CHECKLIST': [
    '适用 Stamp 的登记清单',
    'Registration checklist for the applicable Stamp',
    [['SRC-384', 'Stamp 1, Stamp 1G and Stamp 4: First Time Registrations and Renewals']],
  ],
  B03: [
    '在境内实际受雇与合格许可',
    'Employment in the State and qualifying permission',
    [
      ['SRC-096', 'Stamp 4 upgrades: Eligibility criteria'],
      ['SRC-384', 'Stamp 4 Registrations and Renewals (1)–(2)'],
    ],
  ],
  B04: [
    '起算与在职材料',
    'Employment and commencement evidence',
    [
      ['SRC-096', 'Determining the commencement of employment'],
      ['SRC-384', 'Stamp 4 Registrations and Renewals (1)–(2)'],
    ],
  ],
  B05: [
    '就业升级的合规、品格及审查',
    'Compliance, character and review for a work upgrade',
    [
      ['SRC-394', 'CSEP: What is next?'],
      ['SRC-383', 'Immigration Act s4(6)'],
      ['SRC-096', 'Online renewal'],
    ],
  ],
  B06: [
    '就业升级与续期手续',
    'Work upgrade and renewal procedure',
    [
      ['SRC-096', 'Information on Stamp 4 upgrades'],
      ['SRC-384', 'Stamp 4 Registrations and Renewals'],
    ],
  ],
  B07: [
    '基础 CSEP 的职业、雇主及工资',
    'Underlying CSEP occupation, employer and remuneration',
    [
      ['SRC-393', 'Act ss4,18,21,47 and S.I. 643/2025 Schedule 8 Part 1'],
      ['SRC-394', 'CSEP: Eligibility and fees'],
    ],
  ],
  B08: [
    '基础 GEP 的职业、雇主及工资',
    'Underlying GEP occupation, employer and remuneration',
    [
      ['SRC-393', 'Act ss18,22–23,47–48 and S.I. 643/2025 Schedule 8 Part 3'],
      ['SRC-394', 'GEP: Eligibility and Labour Market Needs Test'],
    ],
  ],
  B09: [
    '基础 ICT、研究员及医师条件',
    'Underlying ICT, researcher and medical doctor conditions',
    [
      [
        'SRC-393',
        'Act ss9,22(1)(c),22(2),24,47–48 and S.I. 444/2024 regs. 42–46',
      ],
      ['SRC-394', 'ICT: Eligibility'],
      ['SRC-096', 'Stamp 4 upgrades: Eligibility criteria'],
    ],
  ],
  B10: [
    '基础就业许可签发和续期费用',
    'Underlying employment permit and renewal fees',
    [
      ['SRC-393', 'Act ss36(2)(a),55 and S.I. 444/2024 reg. 7, Schedule 1'],
      ['SRC-404', 'Indexation'],
    ],
  ],
  B11: [
    '家属身份和担保资格',
    'Family member and sponsor status',
    [
      ['SRC-387', 'June 2026 §§6.5–6.6, 16 and Appendix C'],
      ['SRC-096', 'Joining family FAQ 30'],
    ],
  ],
  B12: [
    '依亲年限、担保人入籍及独立资格',
    'Family residence, sponsor naturalisation and independence',
    [
      ['SRC-387', 'June 2026 §16.2, footnote 41 and Appendix C'],
      ['SRC-096', 'Joining family FAQ 30'],
    ],
  ],
  'FAMILY-INDEPENDENCE': [
    '独立于担保人',
    'Independence from the sponsor',
    [['SRC-387', 'June 2026 §16.2 and footnote 41']],
  ],
  'FAMILY-IRISH-SPONSOR': [
    '爱尔兰公民担保',
    'Irish citizen sponsor',
    [
      ['SRC-388', 'Am I eligible?'],
      ['SRC-387', 'June 2026 §6.2'],
    ],
  ],
  'FAMILY-CHANNEL': [
    '适用的家庭办理入口',
    'Applicable family application channel',
    [
      ['SRC-388', 'Am I eligible?'],
      ['SRC-387', 'June 2026 §§5–7'],
    ],
  ],
  B13: [
    '分居、死亡或家暴后的居留',
    'Residence after separation, death or domestic abuse',
    [
      ['SRC-387', 'June 2026 §§16.3–17.2'],
      ['SRC-399', 'Independent immigration permission'],
    ],
  ],
  B14: [
    '团聚入口、担保人及等待期',
    'Family entry, sponsor and waiting period',
    [
      ['SRC-387', 'June 2026 §§2–6, especially §6.2'],
      ['SRC-409', 'Eligibility'],
      ['SRC-388', 'Am I eligible?; Overseas de facto: Who can sponsor me?'],
    ],
  ],
  B15: [
    '合格关系、年龄、照护授权与同住',
    'Qualifying relationship, age, parental consent and cohabitation',
    [['SRC-387', 'June 2026 §§7.2–7.16, 7.21–7.27']],
  ],
  B16: [
    '担保义务、福利及储蓄',
    'Sponsor responsibility, benefits and savings',
    [
      ['SRC-387', 'June 2026 §§9.1–9.7, 10.2–10.6'],
      ['SRC-386', 'Introduction'],
    ],
  ],
  B17: [
    '担保人税前收入',
    'Sponsor gross income',
    [
      ['SRC-387', 'June 2026 §§10.7–10.14 and November 2025 §10'],
      ['SRC-386', 'Financial thresholds'],
    ],
  ],
  B18: [
    'C 类家庭子女净收入门槛',
    'Category C net income thresholds with children',
    [
      ['SRC-387', 'June 2026 §§10.13–10.14 and Appendix D'],
      ['SRC-386', 'Table 1'],
    ],
  ],
  B19: [
    '住房适格与居住空间',
    'Suitable accommodation and space',
    [
      ['SRC-387', 'June 2026 §9.3–9.5 and Appendix E'],
      ['SRC-402', 's63'],
    ],
  ],
  B20: [
    '团聚材料、安全、医疗与签证办理',
    'Family application evidence, security, health and visa process',
    [
      ['SRC-387', 'June 2026 §§2–3, 12–15'],
      ['SRC-409', 'Join non-EEA family member §9'],
      ['SRC-406', 'Visa Fees'],
    ],
  ],
  'FAMILY-ENTRY-FEE': [
    '家庭签证或预审费用',
    'Family visa or preclearance fee',
    [
      ['SRC-406', 'Visa Fees and Visa fee exemptions'],
      ['SRC-388', 'Overseas de facto: Fees'],
    ],
  ],
  B21: [
    '爱尔兰公民配偶／民事伴侣境内登记',
    'Irish spouse or civil partner registration in Ireland',
    [
      ['SRC-388', 'Irish spouse and civil partner scheme: Am I eligible?; Recently entered the State on a D (Join Family) Visa'],
      ['SRC-384', 'Stamp 4 (3), First Time Registrations and Renewals'],
      ['SRC-384', 'Online renewal: When should I submit a Renewal Application?'],
    ],
  ],
  'FAMILY-FIRST-REGISTRATION': [
    '家庭入境后的首次登记',
    'First registration after family entry',
    [
      ['SRC-384', 'Stamp 1G (1), Stamp 3 (3), Stamp 4 (3), (7)–(8), (12): First Time Registrations'],
      ['SRC-388', 'Overseas de facto: What happens when I arrive in Ireland?'],
      ['SRC-409', 'Join non-EEA family member: Type of immigration permission'],
    ],
  ],
  'FAMILY-RENEWAL': [
    '现有家庭许可的普通续期',
    'Ordinary renewal of existing family permission',
    [
      ['SRC-384', 'Stamp 1G (1), Stamp 3 (3), Stamp 4 (4), (7)–(8), (12): Renewals'],
      ['SRC-384', 'Online renewal: When should I submit a Renewal Application?'],
      ['SRC-388', 'In-State de facto: What happens next?'],
    ],
  ],
  B22: [
    '境内 de facto 办理',
    'In-State de facto permission',
    [
      [
        'SRC-388',
        'De facto: Am I eligible?, Police clearance, What happens next?',
      ],
    ],
  ],
  B23: [
    '境外 de facto 办理',
    'Overseas de facto visa or preclearance',
    [
      [
        'SRC-388',
        'Overseas de facto: How do I apply?, Medical insurance, Police clearance',
      ],
      ['SRC-387', 'June 2026 §§7.16, 10.7'],
    ],
  ],
  B24: [
    'Stamp 5 合格许可及递交地点',
    'Qualifying Stamp 5 permission and filing location',
    [
      ['SRC-097', 'Eligibility and form p1'],
      ['SRC-383', 'Immigration Act s5'],
    ],
  ],
  B25: [
    'Stamp 5 品格、刑事程序与合规',
    'Stamp 5 character, criminal proceedings and compliance',
    [['SRC-097', 'Eligibility and criminal proceedings FAQ']],
  ],
  B26: [
    'Stamp 5 公帑负担及就业努力',
    'Stamp 5 undue burden and efforts to gain employment',
    [['SRC-097', 'Eligibility and conditions of permission']],
  ],
  B27: [
    'Stamp 5 居住、材料及获批后出境',
    'Stamp 5 residence documents and post-grant absences',
    [['SRC-097', 'Required documents, conditions of permission and form p1']],
  ],
  B28: [
    'Stamp 5 登记、护照期限与续期',
    'Stamp 5 registration, passport expiry and renewal',
    [
      ['SRC-097', 'Introduction'],
      ['SRC-384', 'Stamp 5 Registrations and Renewals'],
    ],
  ],
  C01: [
    'LTR 合格就业许可和登记期间',
    'LTR qualifying employment permission and registered periods',
    [['SRC-398', 'Conditions, Eligibility and Which stamps count']],
  ],
  C02: [
    'LTR 研究员与医生特殊计时',
    'LTR residence for researchers and doctors',
    [
      [
        'SRC-398',
        'Hosting Agreement and medical doctor FAQs; medical doctor guidance',
      ],
    ],
  ],
  C03: [
    'LTR 主申请人在境内持续受雇',
    'LTR principal applicant employed in the State',
    [['SRC-398', 'Eligibility and application form p1']],
  ],
  C04: [
    'LTR 许可合规及居住材料',
    'LTR compliance and residence evidence',
    [['SRC-398', 'Eligibility, required documents and form §§3–6']],
  ],
  C05: [
    'LTR 福利与公帑负担',
    'LTR benefits and undue burden',
    [['SRC-398', 'FAQ: What does an undue burden on the State mean?']],
  ],
  C06: [
    'LTR 品格、案情及披露',
    'LTR character, proceedings and disclosure',
    [['SRC-398', 'Eligibility and conviction or pending trial FAQs']],
  ],
  C07: [
    'LTR 家属身份及同期居住',
    'LTR family status and overlapping residence',
    [['SRC-398', 'Conditions and spouse or dependent FAQ']],
  ],
  C08: [
    'LTR 获批后居住和续期',
    'LTR residence after grant and renewal',
    [['SRC-398', 'Conditions of permission and renewal FAQ']],
  ],
  C09: [
    'LTR 批准费和付款期限',
    'LTR approval fee and payment deadline',
    [
      ['SRC-398', 'What happens if my application is approved?'],
      ['SRC-383', 'S.I. 421/2025 regs. 3–4'],
    ],
  ],
  C10: [
    'LTR 其他条件适用性',
    'Applicability of other LTR requirements',
    [
      ['SRC-398', 'Eligibility and application checklist'],
      ['SRC-383', 'Immigration Act s9'],
    ],
  ],
  D01: [
    '自由流动本人或合格家属',
    'Free-movement citizen or qualifying family member',
    [
      ['SRC-390', 'regs. 2–6'],
      ['SRC-389', 'Irish citizens and qualifying family members'],
    ],
  ],
  D02: [
    '欧盟居留基础、资源和医疗保险',
    'EU residence basis, resources and sickness insurance',
    [['SRC-390', 'regs. 2(3), 6, 11(1)']],
  ],
  D03: [
    '通常取得永久居留的连续期间',
    'Ordinary continuous residence for permanent residence',
    [['SRC-390', 'reg. 12(1)(a)–(b), (2)–(7)']],
  ],
  D04: [
    '提前取得永久居留',
    'Early acquisition of permanent residence',
    [['SRC-390', 'reg. 13(1)–(7)']],
  ],
  D05: [
    '家庭状态变化后的保留权利',
    'Retention of rights after a family event',
    [
      ['SRC-390', 'regs. 9–12'],
      ['SRC-391', 'EUTR5 and EUTR3 pp2–3'],
    ],
  ],
  D06: [
    '永久居留证明、地址与通知',
    'Permanent residence documents, address and notifications',
    [
      ['SRC-390', 'regs. 11(2), 14–15 and Schedules 5–8'],
      ['SRC-391', 'EUTR2 and EUTR3'],
    ],
  ],
  D07: [
    '公共政策、安全和公共卫生',
    'Public policy, security and public health',
    [['SRC-390', 'regs. 14(4), 15(4), 18–20 and Schedule 1']],
  ],
  D08: [
    '永久权维持、续证及收费',
    'Retention of permanent status, document renewal and fees',
    [
      ['SRC-390', 'regs. 12(6), 14(8), 15(8)–(9)'],
      ['SRC-383', 'S.I. 421/2025 reg. 4(a)(iv)–(v)'],
      ['SRC-389', 'Permanent Residence'],
    ],
  ],
  'TREATY-RESTRICTION': [
    '正式居留限制',
    'Formal restriction of residence rights',
    [
      ['SRC-390', 'regs. 18–20'],
      ['SRC-392', 'regs. 14–21'],
    ],
  ],
  E01: [
    'Withdrawal Agreement 保护范围',
    'Withdrawal Agreement personal scope',
    [['SRC-392', 'Agreement Arts. 9–10; S.I. 728/2020 regs. 1–4, 23']],
  ],
  E02: [
    'WA 连续合法居住及永久权',
    'WA lawful continuous residence and permanent rights',
    [
      [
        'SRC-392',
        'Agreement Arts. 13,15–17 and S.I. 728/2020 regs. 5–7, 10, 22–23',
      ],
    ],
  ],
  E03: [
    'WA 文件、公共审查、费用和续期',
    'WA documents, public interest review, fees and renewal',
    [
      ['SRC-392', 'S.I. 728/2020 regs. 11–12, 14–21 and Brexit FAQ'],
      ['SRC-383', 'S.I. 421/2025 reg. 4(a)(vi)–(vii)'],
    ],
  ],
} as const satisfies Record<string, Condition>;

export type IrelandConditionId = keyof typeof conditions;

export function irelandCondition(id: IrelandConditionId) {
  const [zh, en, refs] = conditions[id];
  const sources: SourceRef[] = refs.map(([srcId, locator]) => ({
    srcId,
    locator,
  }));
  return { id: `IE-${id}`, zh, en, sources };
}
