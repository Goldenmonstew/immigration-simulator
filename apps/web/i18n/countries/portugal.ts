import { ptFormEn, ptFormZh } from './portugal-form';
import { en as moduleEn, zhCN as moduleZh } from './portugal-module';

export const zhCN = {
  ...ptFormZh,
  ...moduleZh,
  'pt.name': '葡萄牙',
  'hub.pt.code': 'PT',
  'hub.pt.paths':
    '入籍 · 永久居留 · 欧盟长居 · ARI · 续期 · 自由流动 · 伴侣入籍',
  'hub.pt.desc':
    '逐项核对入籍、永久居留、欧盟长期居民、投资居留 ARI、临时居留续期、欧盟自由流动永久权和伴侣取得国籍的法定条件，查看最早日期、待确认事项与官方依据。',
  'pt.title': '葡萄牙入籍、居留与 ARI 模拟',
  'pt.intro':
    '选择与你有关的路径，逐项核对法定条件，查看最早可以考虑递交的日期，以及还需要补充哪些材料或主管机关结论。',
  'pt.scope':
    '入籍涵盖 2026 年新国籍法与施行前在审申请适用的旧文本，以及与葡萄牙公民结婚或为事实伴侣的声明。居留涵盖永久居留、欧盟长期居民身份、投资居留 ARI 的首次申请、续期与转永久，以及一般临时居留续期和欧盟自由流动永久居留权。政府尚未公布细则的事项（如新制葡语考试和生计标准）会标为待确认。',
  'pt.prepare':
    '准备居留证件和出入境日期，以及与所选路径有关的证明，例如收入、住房、医保、葡语证书、税务和社保情况、投资材料或婚姻登记。刑事、安全等事项只需填写有无正式结论，不要填写案件细节。',
  'pt.privacy':
    '问卷在浏览器内计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...ptFormEn,
  ...moduleEn,
  'pt.name': 'Portugal',
  'hub.pt.code': 'PT',
  'hub.pt.paths':
    'Naturalisation · Permanent residence · EU long-term · ARI · Renewal · Free movement · Partner nationality',
  'hub.pt.desc':
    'Check the legal requirements for naturalisation, permanent residence, EU long-term resident status, investment residence (ARI), temporary residence renewal, permanent residence under free movement and nationality through a Portuguese partner. See the earliest dates, open questions and official sources.',
  'pt.title': 'Portuguese nationality, residence and ARI',
  'pt.intro':
    'Choose the routes relevant to you, check their legal requirements and see the earliest date you could consider applying and the evidence or authority findings you still need.',
  'pt.scope':
    'Naturalisation covers the 2026 nationality law, the earlier text for applications pending when it came into force, and the declaration route for spouses and de facto partners of Portuguese citizens. Residence covers permanent residence, EU long-term resident status, the first grant, renewal and conversion of investment residence (ARI), ordinary temporary residence renewal and permanent residence under EU free movement. Details the government has not yet published, such as the new Portuguese test and means standard, are marked as to be confirmed.',
  'pt.prepare':
    'Have your residence permits and travel dates ready, plus evidence for the routes you choose, such as income, accommodation, health cover, Portuguese certificates, tax and social security status, investment documents or marriage registration. For criminal and security matters, only record whether there is a formal finding; do not enter case details.',
  'pt.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
};
