import { deFormZh, deFormEn } from './germany-form';
import { zhCN as moduleZh, en as moduleEn } from './germany-module';

export const zhCN = {
  ...deFormZh,
  ...moduleZh,
  'hub.de.code': 'DE',
  'hub.de.paths': '定居许可 · 欧盟长期居留 · 入籍 · 自由流动永久居住权',
  'hub.de.desc':
    '核对 20 条路径的居留年限、养老保险缴费、家庭预算与生计、德语及公民知识考试、无犯罪安全核查、出境存续与费用。支持情景对比、方案保存与官方来源检索。',
  'de.name': '德国',
  'de.entryLink': '打开德国模拟器',
  'de.entryDesc':
    '核对德国定居许可、欧盟长期居留、入籍、自由流动永久居住权及出境文书存续的全部法定条件、最早日期与待确认事项。',
  'de.title': '德国定居许可、欧盟长期居留、入籍与永久居住权模拟',
  'de.intro':
    '选择与你有关的路径，逐项核对德国居留法（AufenthG）、国籍法（StAG）与欧盟自由流动法（FreizügG/EU）的法定条件，查看最早日期与待补充材料。',
  'de.scope':
    '涵盖一般定居（§ 9）、技术人员（§ 18c Abs. 1）、欧盟蓝卡（§ 18c Abs. 2）、德国公民家属（§ 28 Abs. 2）、难民普通档与加速档（§ 26 Abs. 3）、辅助保护及其他人道定居（§ 26 Abs. 4）、企业经营者（§ 21 Abs. 4）、在德长大子女（§ 35）、技术人员配偶（§ 9 Abs. 3a）、高资质学者（§ 18c Abs. 3）、公务员（§ 19c Abs. 4）、婚姻终结后配偶（§ 31 Abs. 3）、欧盟长期居留（§§ 9a–9c）、一般入籍（StAG § 10）、德国人配偶入籍（StAG § 9）、家属随同入籍、裁量入籍（StAG § 8）、自由流动永久居住权（§ 4a FreizügG/EU）以及 § 51 许可存续与出境失效。',
  'de.prepare':
    '准备你的居留许可起止日期、出入境记录、养老保险缴费记录（Versicherungsverlauf）、家庭月净收入与暖租、医疗及护理保险、德语证书、Leben in Deutschland 或入籍考试成绩。机关裁量事项可留待确认。',
  'de.privacy':
    '问卷在浏览器本地计算，草稿与保存的方案留在这台设备上。分享链接包含你填写的全部信息，拿到链接的人可以还原问卷。',
  'de.error.date': '请填写有效日期。',
  'de.error.futureFact': '已发生事项的日期不能晚于模拟日期。',
  'de.error.order': '这个日期不能早于开始的日期。',
  'de.error.months': '请填写整数月数，或留空。',
  'de.error.score': '请填写 0 至 33 之间的整数题数。',
  'de.error.jobSeekingEnd':
    '求职许可（§ 20）有法定的最长期限，请填写许可上的到期日。',
  'de.error.opportunityCardEnd':
    '机会卡（§ 20a Abs. 5）有法定的最长期限，请填写卡上的到期日。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...deFormEn,
  ...moduleEn,
  'hub.de.code': 'DE',
  'hub.de.paths':
    'Settlement permit · EU long-term · Naturalisation · Free-movement permanent right',
  'hub.de.desc':
    'Check residence periods, pension contributions, household budget and livelihood, German and civic knowledge tests, criminal record and security checks, title retention during absences and fees across 20 pathways. Compare scenarios, save plans and inspect official sources.',
  'de.name': 'Germany',
  'de.entryLink': 'Open Germany',
  'de.entryDesc':
    'Check all statutory requirements, earliest dates and pending details for German settlement permits, EU long-term residence, naturalisation, free-movement permanent residence and title retention during absences.',
  'de.title':
    'Settlement, EU long-term residence, naturalisation and permanent residence in Germany',
  'de.intro':
    'Choose the pathways relevant to you, check the statutory requirements under the Residence Act (AufenthG), Nationality Act (StAG) and EU Free Movement Act (FreizügG/EU), and see your earliest dates and outstanding evidence.',
  'de.scope':
    'Covers general settlement (§ 9), skilled workers (§ 18c Abs. 1), EU Blue Card holders (§ 18c Abs. 2), family of German citizens (§ 28 Abs. 2), ordinary and accelerated refugee settlement (§ 26 Abs. 3), subsidiary protection and humanitarian settlement (§ 26 Abs. 4), entrepreneurs (§ 21 Abs. 4), children raised in Germany (§ 35), spouses of settled skilled workers (§ 9 Abs. 3a), highly qualified academics (§ 18c Abs. 3), civil servants (§ 19c Abs. 4), former spouses after marital community ends (§ 31 Abs. 3), EU long-term residence (§§ 9a–9c), ordinary naturalisation (StAG § 10), spouses/partners of German citizens (StAG § 9), family joint naturalisation, discretionary naturalisation (StAG § 8), free-movement permanent residence (§ 4a FreizügG/EU) and § 51 residence title retention during absences.',
  'de.prepare':
    'Have your residence permit dates, travel record, pension insurance record (Versicherungsverlauf), household net income and warm rent, health and care insurance, German certificate and Leben in Deutschland or naturalisation test score ready. Leave discretionary decisions open until confirmed.',
  'de.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
  'de.error.date': 'Enter a valid date.',
  'de.error.futureFact':
    'An event that has already occurred must be dated on or before the simulation date.',
  'de.error.order': 'This date cannot be before the start date.',
  'de.error.months': 'Enter a whole number of months, or leave it blank.',
  'de.error.score': 'Enter a whole number of correct answers from 0 to 33.',
  'de.error.jobSeekingEnd':
    'A § 20 job-seeking permit has a statutory maximum; enter the expiry date on the permit.',
  'de.error.opportunityCardEnd':
    'A § 20a opportunity card has a statutory maximum (Abs. 5); enter the expiry date on the card.',
};
