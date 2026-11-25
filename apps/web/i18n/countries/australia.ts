import { auFormZh, auFormEn } from './australia-form';
import { auModuleZh, auModuleEn } from './australia-module';

export const zhCN = {
  ...auFormZh,
  ...auModuleZh,
  'hub.au.code': 'AU',
  'hub.au.paths':
    '雇主担保 186 · 技术与创新 189 / 190 / 191 / 858 · 香港通道 · 配偶 · 返程 RRV · 入籍',
  'hub.au.desc':
    '评估 186（TRT 与直接申请）、189（打分类与香港类别）、190、191（偏远地区与香港类别）、配偶签（820→801 与 309→100）、858 国家创新签证、155/157 居民返程签证和授予澳大利亚公民身份的全部法定条件、最早日期与费用预算。',
  'au.name': '澳大利亚',
  'au.entryDesc':
    '核对澳大利亚永居、居民返程签证与入籍的法定资格、最早日期、待确认事项与官方来源。',
  'au.entryLink': '打开澳大利亚模拟器',
  'au.title': '澳大利亚永居、返程签证与入籍模拟',
  'au.intro':
    '覆盖雇主担保、独立与州担保技术移民、偏远地区、香港通道、配偶移民、国家创新签证、居民返程签证及授予公民身份共 11 条路径，逐项核对法定条件、预计满足日期与费用预算。',
  'au.scope':
    '建模范围涵盖 186（TRT、Direct Entry）、189（Points-tested、Hong Kong）、190、191（Regional Provisional、Hong Kong Regional）、配偶（820→801、309→100）、858 National Innovation、155/157 Resident Return 及 Citizenship by conferral。时间线自动结合签证终止规则（Migration Act s 82）、过桥签、境内递交限制（8503 与 s 48）、偏远地区锁定期及满期日复核。',
  'au.prepare':
    '准备各段澳大利亚签证起止日期、出入境记录、英语考试成绩或合资格护照、职业评估、雇主提名或 EOI 邀请函、已结束财年 ATO 评税通知、伴侣担保记录以及体检、无犯罪与入籍考试资料。尚未收到官方认定的裁量事项可留待确认。',
  'au.privacy':
    '问卷在浏览器本地计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，收到链接的人可以还原并修改问卷。',
  'au.error.date': '请填写有效日期。',
  'au.error.order': '结束日期不能早于开始日期。',
  'au.error.beforeBirth': '该日期不能早于出生日期。',
  'au.error.beforeArrival':
    '出境日不能早于首次入境日；有出境记录时须填首次入境日。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...auFormEn,
  ...auModuleEn,
  'hub.au.code': 'AU',
  'hub.au.paths':
    'ENS 186 · Skilled and Innovation 189 / 190 / 191 / 858 · HK streams · Partner · RRV · Citizenship',
  'hub.au.desc':
    'Assess statutory requirements, earliest projected dates and fee budgets across subclasses 186 (TRT and Direct Entry), 189 (Points-tested and Hong Kong), 190, 191 (Regional Provisional and Hong Kong Regional), Partner (820→801 and 309→100), 858 National Innovation, 155/157 Resident Return and citizenship by conferral.',
  'au.name': 'Australia',
  'au.entryDesc':
    'Check statutory eligibility, earliest projected dates, pending evidence and official sources for Australian permanent residence, Resident Return visas and citizenship.',
  'au.entryLink': 'Open Australia',
  'au.title':
    'Australian permanent residence, Resident Return visa and citizenship simulator',
  'au.intro':
    'Evaluate 11 pathways across employer-sponsored, points-tested, regional, Hong Kong, partner, National Innovation, Resident Return and citizenship by conferral routes, checking statutory criteria, projected dates and fee budgets.',
  'au.scope':
    'Models subclasses 186 (TRT and Direct Entry), 189 (Points-tested and Hong Kong), 190, 191 (Regional Provisional and Hong Kong Regional), Partner (820→801 and 309→100), 858 National Innovation, 155/157 Resident Return and citizenship by conferral. Combines Migration Act s 82 visa cessation rules, bridging visas, onshore bars (8503 and s 48), regional locks and projected milestone re-checks.',
  'au.prepare':
    'Have your Australian visa dates, travel history, English test scores or passport details, skills assessment, employer nomination or EOI invitation, completed-year ATO notices of assessment, partner sponsorship details, and health, character or citizenship test records ready. Leave unconfirmed official determinations open.',
  'au.privacy':
    'Calculations run locally in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can load and edit the answers it contains.',
  'au.error.date': 'Enter a valid date.',
  'au.error.order': 'This date cannot be before the start date.',
  'au.error.beforeBirth': 'This date cannot be before your date of birth.',
  'au.error.beforeArrival':
    'A trip cannot start before your first arrival; enter your first arrival if you have trips.',
};
