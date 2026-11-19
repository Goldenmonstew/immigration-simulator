import type { SourceRef } from '../types';

export interface PolicyChange {
  /** YYYY-MM-DD */
  date: string;
  title: string;
  /** One or two sentences in Chinese, retaining English legal terms. */
  summary: string;
  /** English translation of `title`; every entry has one. */
  titleEn?: string;
  /** English translation of `summary`; every entry has one. */
  summaryEn?: string;
  sources: SourceRef[];
}

export const policyChangelog: PolicyChange[] = [
  {
    date: '2025-05-12',
    title:
      'White Paper CP 1326 "Restoring control over the immigration system"：提出定居基准期 10 年与定居英语 B2；发布日成为 Earned Settlement 过渡安排的截止点',
    summary:
      '提出将 settlement 标准合格期提高到 10 年，并将定居英语要求提高到 B2。CP 1707 的相关过渡安排以 White Paper 的发布日作为截止点。',
    titleEn:
      'White Paper CP 1326 “Restoring control over the immigration system”: proposes a 10-year settlement baseline and B2 English; publication becomes the Earned Settlement transitional cut-off',
    summaryEn:
      'Proposes increasing the standard settlement qualifying period to 10 years and settlement English to B2. The relevant transitional arrangements in CP 1707 use the White Paper publication date as their cut-off.',
    sources: [
      { srcId: 'SRC-012', locator: '¶257' },
      { srcId: 'SRC-012', locator: '¶264' },
      { srcId: 'SRC-001', locator: 'p42' },
    ],
  },
  {
    date: '2025-11-20',
    title: 'CP 1448 "A Fairer Pathway to Settlement" 咨询（至 2026-02-13）',
    summary:
      '发布 Earned Settlement 咨询文件 CP 1448，咨询期为 2025-11-20 至 2026-02-13。',
    titleEn:
      'CP 1448 “A Fairer Pathway to Settlement” consultation (until 2026-02-13)',
    summaryEn:
      'Publishes the Earned Settlement consultation CP 1448, running from 2025-11-20 to 2026-02-13.',
    sources: [{ srcId: 'SRC-013', locator: 'cover' }],
  },
  {
    date: '2026-03-05',
    title: 'Statement of Changes HC 1691：2027-03-26 起多条路线定居英语升至 B2',
    summary:
      'HC 1691 提交议会，规定自 2027-03-26 起提交的 settlement 申请在多条路线须满足 CEFR B2 英语要求，适用路线包括 Skilled Worker 与 Long Residence，并保留相应豁免。',
    titleEn:
      'Statement of Changes HC 1691: settlement English rises to B2 on multiple routes from 2027-03-26',
    summaryEn:
      'HC 1691 is laid before Parliament, requiring CEFR B2 English for settlement applications on multiple routes from 2027-03-26, including Skilled Worker and Long Residence, with the relevant exemptions retained.',
    sources: [
      { srcId: 'SRC-007', locator: 'EM 5.60–5.62' },
      { srcId: 'SRC-004', locator: 'SW 22A.1' },
      { srcId: 'SRC-005', locator: 'LR 13.1' },
    ],
  },
  {
    date: '2026-10-08',
    title:
      'Statement of Changes HC 584：Appendix Skilled Worker / Long Residence 当前快照版本',
    summary:
      '登记 Appendix Skilled Worker 与 Appendix Long Residence 的 2026-10-08 版本快照，两者的该次变更记录均对应 Statement of Changes HC 584。',
    titleEn:
      'Statement of Changes HC 584: current snapshot versions of Appendix Skilled Worker / Long Residence',
    summaryEn:
      'Records the 2026-10-08 snapshots of Appendix Skilled Worker and Appendix Long Residence. Both change histories associate this version with Statement of Changes HC 584.',
    sources: [
      { srcId: 'SRC-004', locator: 'version 2026-10-08' },
      { srcId: 'SRC-005', locator: 'version 2026-10-08' },
    ],
  },
  {
    date: '2026-11-02',
    title:
      'CP 1707 政府回应：Earned Settlement 最终框架（3 / 5 / 10 / 20 年路径、强制要求、过渡安排）；两院陈述给出实施时间表',
    summary:
      '政府回应公布 Earned Settlement 的 3 / 5 / 10 / 20 年路径、强制要求和过渡安排。两院同日陈述后的问答给出分阶段实施时间表。',
    titleEn:
      'CP 1707 government response: final Earned Settlement framework (3 / 5 / 10 / 20-year pathways, mandatory requirements and transitional arrangements); statements in both Houses set out the implementation timetable',
    summaryEn:
      'The government response announces the 3 / 5 / 10 / 20-year Earned Settlement pathways, mandatory requirements and transitional arrangements. Questions following statements in both Houses on the same day give the phased implementation timetable.',
    sources: [
      { srcId: 'SRC-001', locator: 'p46' },
      { srcId: 'SRC-002', locator: 'col 593' },
      { srcId: 'SRC-003', locator: 'cols 1423–1424' },
    ],
  },
  {
    date: '2026-11-04',
    title:
      'Finance Bill 2026–27 刊印，拟将 CoS 费和 Immigration Skills Charge 的所得税豁免写入法律',
    summary:
      '第 15 条拟豁免雇主自 2026-10-28 起支付上述费用所产生的所得税。法案仍在审议，临时税务效力来自下议院预算决议 15。',
    titleEn:
      'Finance Bill 2026–27 published with a proposed income tax exemption for CoS fees and the Immigration Skills Charge',
    summaryEn:
      'Clause 15 would exempt employer payments of these charges from income tax for payments made on or after 28 October 2026. The Bill is still before Parliament, and Commons Budget Resolution 15 provides the provisional tax effect.',
    sources: [
      { srcId: 'SRC-049', locator: 'clause 15(1)–(2), p21' },
      { srcId: 'SRC-047', locator: 'Budget Resolution 15(1)–(2)' },
    ],
  },
  {
    date: '2026-11-04',
    title: 'Home Office 说明拟扩大 HPI 大学名单的筛选方法',
    summary:
      '院校须在相关年份的 THE、QS 和 ARWU 榜单中至少两个进入前 150。正式扩容名单、新申请 cap 和生效日仍待公布。',
    titleEn:
      'Home Office clarifies university criteria for the planned HPI expansion',
    summaryEn:
      'Universities must rank in the top 150 in at least two of the THE, QS and ARWU rankings for the relevant years. The expanded list, new application cap and effective date are still pending.',
    sources: [{ srcId: 'SRC-058', locator: '40091, Answer ¶1–2' }],
  },
];
