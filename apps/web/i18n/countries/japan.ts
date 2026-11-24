import { jpFormZh, jpFormEn } from './japan-form';
import { zhCN as moduleZh, en as moduleEn } from './japan-module';

export const zhCN = {
  ...jpFormZh,
  ...moduleZh,
  'jp.prepare':
    '准备在留及出入境日期、在留资格、家庭关系和与你所选路径有关的证明，例如缴税、年金、医保、日语或人才积分记录。裁量事项可留待主管机关确认。',
  'jp.privacy':
    '问卷在浏览器内计算，草稿与保存的方案留在这台设备。分享链接包含所填资料，拿到链接的人可以还原问卷。',
  'hub.jp.code': 'JP',
  'hub.jp.paths': '永住许可 · 帰化（入籍） · 再入国',
  'hub.jp.desc':
    '核对在留年限、家庭与生计、公共义务、日语及出入境证据。比较不同情形的申请日期，查看待确认条件与官方依据。',
  'jp.name': '日本',
  'jp.title': '日本永住、帰化与再入国模拟',
  'jp.intro':
    '选择与你有关的路径，逐项核对申请条件，查看最早可考虑的日期，以及还需要补充哪些材料。',
  'jp.scope':
    '永住許可涵盖一般、家族、高度人材及特别路径。帰化涵盖一般条件和国籍法的特别条款。再入国包括普通许可、みなし再入国許可和难民旅行证件。评估使用与递交日相应的规则，分别显示时间条件和完整申请条件。',
  'jp.error.date': '请填写有效日期。',
  'jp.error.futureFact': '已发生事项的日期不能晚于模拟日期。',
  'jp.result.correctFutureFact':
    '请在问卷的「{step}」中核对日期。有一项已发生事项晚于模拟日期。',
  'jp.error.order': '这个日期不能早于开始的日期。',
  'jp.error.specialPeriod':
    '更新申请中也只能在在留期限届满后 2 个月内离开日本，请核对日期。',
  'jp.error.age': '请填写 1 至 99 之间的整数岁数。',
  'jp.error.newBeforeOld':
    '新版认可的资格比旧版少，这个起点不能早于上面旧版的起点。',
  'jp.error.newWithoutOld':
    '旧指南下尚未持有符合条件的资格，请核对上一项，或在新版起点选择“尚未持有符合条件的资格”。',
  'jp.error.overlap': '这次出境与前面的出境日期重叠。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  ...jpFormEn,
  ...moduleEn,
  'jp.prepare':
    'Have your residence status, dates of stay and travel, and family details ready. Depending on your route, you may also need tax, pension, health insurance, language or points records. Leave discretionary decisions open until the authority confirms them.',
  'jp.privacy':
    'Calculations run in your browser. Drafts and saved scenarios stay on this device. Anyone with a share link can read the answers it contains.',
  'hub.jp.code': 'JP',
  'hub.jp.paths': 'Permanent residence · Naturalisation · Re-entry',
  'hub.jp.desc':
    'Check residence, family, livelihood, public obligations, language and travel evidence. Compare application dates and see outstanding requirements and official sources.',
  'jp.name': 'Japan',
  'jp.title': 'Permanent residence, naturalisation and re-entry in Japan',
  'jp.intro':
    'Choose the routes relevant to you, check their requirements and see the earliest date you could consider applying and the evidence you still need.',
  'jp.scope':
    'Permanent residence covers general, family, highly skilled and special routes. Naturalisation covers the ordinary requirements and special provisions of the Nationality Act. Travel options include ordinary and deemed re-entry and refugee travel documents. The assessment uses the rules for your filing date and shows both the timing and the full set of application checks.',
  'jp.error.date': 'Enter a valid date.',
  'jp.error.futureFact':
    'An event that has already occurred must be dated on or before the simulation date.',
  'jp.result.correctFutureFact':
    'Review the dates in “{step}”. A recorded event is dated after the simulation date.',
  'jp.error.order': 'This date cannot be before the start date.',
  'jp.error.specialPeriod':
    'Even with a renewal pending you can leave only within 2 months after your period of stay ended; check the dates.',
  'jp.error.age': 'Enter a whole number of years from 1 to 99.',
  'jp.error.newBeforeOld':
    'The new guideline counts fewer statuses than the old one, so this start cannot be before the old-guideline start above.',
  'jp.error.newWithoutOld':
    'The earlier guideline must also count any status that qualifies under the revised guideline. Check the earlier start or select “No qualifying status held”.',
  'jp.error.overlap': 'This trip overlaps an earlier one.',
};
