import { esFormZh, esFormEn } from './spain-form';
import { zhCN as moduleZh, en as moduleEn } from './spain-module';
import { esGameZh, esGameEn } from './spain-game';

export const zhCN = {
  ...esFormZh,
  ...moduleZh,
  ...esGameZh,
  'es.name': '西班牙',
  'es.entryLink': '打开西班牙模拟器',
  'es.entryDesc':
    '核对西班牙按居住入籍、国内与欧盟长期居留、跨境欧盟长居迁入与随迁家属、恢复长期居留及欧盟自由流动永久居留的全部法定条件与时间节点。',
  'es.title': '西班牙：入籍、长期居留、跨境迁居与自由流动模拟',
  'es.intro':
    '选择与你有关的路径，按你的居留许可、出入境记录与各项法定证明，逐项核对申请条件、最早可申请日期与待确认事项。',
  'es.scope':
    '涵盖八条路径：按居住入籍（Código Civil art. 22 及 RD 1004/2015）、国内长期居留（RD 1155/2024 art. 183）、西班牙欧盟长期居留（art. 176）、其他成员国欧盟长居者迁入西班牙（art. 179）及随迁家属（art. 180）、恢复国内或欧盟长期居留（arts. 186–189）和欧盟自由流动制度下的永久居留（RD 240/2007 art. 10）。同时核对时间条件、DELE／CCSE 考试、IPREM 家庭资源、SMI 薪资、医保、刑事与公共秩序审查，以及获批后的 TIE 申领与宣誓登记。',
  'es.prepare':
    '准备各段居留或学习停留的起止日期、离境与返回日期，以及与所选路径相关的婚姻或亲属证明、DELE／CCSE 成绩、家庭月收入或雇主合同薪资、医疗保险、无犯罪记录及缴费凭证。不确定的项目可留待确认。',
  'es.privacy':
    '问卷在浏览器本地计算，草稿与保存的情景仅留在这台设备。分享链接包含所填资料，收到链接的人可以还原并查看同一情景。',
  'es.result.finishQuestionnaire':
    '请返回问卷，完成所选路径的必填项目后再查看结果。',
  'es.error.date': '请填写有效日期。',
  'es.error.order': '结束或返回日期不能早于开始或离开日期。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...esFormEn,
  ...moduleEn,
  ...esGameEn,
  'es.name': 'Spain',
  'es.entryLink': 'Open Spain simulator',
  'es.entryDesc':
    'Check statutory requirements and dates for Spanish citizenship by residence, national and EU long-term residence, EU mobility and family, recovery of status and EU free-movement permanent residence.',
  'es.title':
    'Spain: citizenship, long-term residence, EU mobility and free movement',
  'es.intro':
    'Choose the pathways relevant to you and check every statutory requirement, your earliest projected filing date and any unconfirmed details from your residence, travel and supporting evidence.',
  'es.scope':
    'Covers eight pathways: citizenship by residence (Código Civil art. 22 and RD 1004/2015), national long-term residence (RD 1155/2024 art. 183), Spanish EU long-term residence (art. 176), mobility of EU long-term residents from another Member State (art. 179) and their accompanying family (art. 180), recovery of national or EU long-term residence (arts. 186–189) and permanent residence under EU free movement (RD 240/2007 art. 10). Checks time requirements, DELE/CCSE exams, IPREM household resources, SMI salary, health cover, criminal and public-order reviews, and post-grant TIE and oath steps.',
  'es.prepare':
    'Have your residence permit and study stay dates, travel history, and route-specific evidence ready, such as family records, DELE/CCSE certificates, monthly household income or employment contract pay, health insurance, criminal record certificates and fee receipts. Leave uncertain items open for confirmation.',
  'es.privacy':
    'Calculations run locally in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can load and inspect the answers it contains.',
  'es.result.finishQuestionnaire':
    'Return to the questionnaire and complete the required fields for your selected pathways to see your result.',
  'es.error.date': 'Enter a valid date.',
  'es.error.order': 'The end or return date cannot be before the start or departure date.',
};
