import type { CharacterProfile, Text } from '../types';

const t = (zhCN: string, en: string): Text => ({ zhCN, en });

export const skilledWorkerProfile: CharacterProfile = {
  id: 'skilled-worker',
  name: { zhCN: '林遥', en: 'Yao Lin' },
  intro: {
    zhCN: '林遥是一名来自中国的软件开发者，2024 年初独自持 Skilled Worker 许可来英，年薪 £38,000，正在慢慢安顿生活。人物与事件均为虚构。',
    en: 'Yao Lin is a software developer from China, settling into life after arriving alone in early 2024 with Skilled Worker permission and a £38,000 salary. All characters and events are fictional.',
  },
  sprite: 'characters/3.png',
};

export const hongKongBnoProfile: CharacterProfile = {
  id: 'hong-kong-bno',
  name: { zhCN: '陈嘉宁', en: 'Ka Ning Chan' },
  intro: {
    zhCN: '嘉宁在 2022 年中以 BN(O) Status Holder 身份来英，伴侣和一个孩子同行。一年后，校门口渐渐有了熟面孔。本局只评估嘉宁，人物与事件均为虚构。',
    en: 'Ka Ning arrived in mid-2022 as a BN(O) Status Holder with a partner and one child. A year later, familiar faces are appearing at the school gate. Only Ka Ning is assessed; all characters and events are fictional.',
  },
  sprite: 'characters/1.png',
};

export const familyPartnerProfile: CharacterProfile = {
  id: 'family-partner',
  name: t('索菲娅·莫拉', 'Sofia Mora'),
  intro: t(
    '索菲娅于 2024 年中以英国公民杰米的伴侣身份来英，兼职年薪 £12,000，杰米年薪 £20,000。两人正在学着把班表、账单和晚饭放进同一本日历。只评估索菲娅本人，人物与事件均为虚构。',
    'Sofia arrived in mid-2024 as British citizen Jamie’s partner. She earns £12,000 part-time and Jamie earns £20,000. They are learning to fit shifts, bills and dinner into one calendar. Only Sofia is assessed; all characters and events are fictional.',
  ),
  sprite: 'characters/7.png',
};

export const graduateProfile: CharacterProfile = {
  id: 'graduate',
  name: t('诺拉·阿齐兹', 'Nora Aziz'),
  intro: t(
    '诺拉来自马来西亚，刚读完软件工程硕士。她爱给失败的演示取绰号，毕业后仍把镇上的路认成校园捷径。持 Graduate 许可，想在到期前找到担保工作。人物与事件均为虚构。',
    'Nora Aziz from Malaysia has just completed an MSc in software engineering. She gives failed demos nicknames and still navigates town by campus shortcuts. With Graduate permission, she is looking for sponsored work before expiry. All characters and events are fictional.',
  ),
  sprite: 'urban/skilled-worker.png',
};
