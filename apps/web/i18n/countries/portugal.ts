export const zhCN = {
  'pt.name': '葡萄牙',
  'pt.entryLink': '打开葡萄牙试点',
  'pt.entryDesc':
    '按居留证件（含黄金签证）与出入境记录，计算入籍、永久居留、欧盟长期居民与黄金签证续期的时间节点。',
  'pt.title': '葡萄牙：入籍、永久居留与黄金签证的时间（试点）',
  'pt.intro':
    '按你在葡萄牙的居留证件（含黄金签证）和出入境记录，计算四个只看时间的节点：入籍的居留年限（2026 年 5 月起的新国籍法）、永久居留、欧盟长期居民，以及黄金签证（ARI）的最低停留与续期时间。投资金额与语言考试不在范围内。',
  'pt.scope':
    '试点只检查国籍法与外国人法写明的时间条件；语言、刑事记录、收入、住房等不检查，结果里逐项列出。新国籍法从哪天起算、分段累计怎么算等原文没说清的地方会标出。所填内容只在你的浏览器里计算，不保存、不上传。',
  'pt.basics': '基本信息',
  'pt.simulationDate': '模拟日期',
  'pt.simulationDateHint': '按这一天判断（按递交日），默认今天。',
  'pt.permits': '居留证件',
  'pt.permitsHint':
    '每张证件填一行，按时续期的接着填下一张；仍有效的到期日可留空（黄金签证请填卡上的到期日，才能算续期时间）。拿到许可前持居留签证的期间也可以填一行。永久居留许可与欧盟长期居民身份本身没有期限，卡面到期不影响；临时居留卡到期后 6 个月内的居留权会另作说明。',
  'pt.permit': '证件 {n}',
  'pt.from': '生效日期',
  'pt.to': '到期日期（仍有效可留空）',
  'pt.kind': '证件类型',
  'pt.kind.temporary': '临时居留许可（工作、家庭团聚等）',
  'pt.kind.golden-visa': '黄金签证（投资居留许可 ARI）',
  'pt.kind.study': '学习、无薪实习或志愿居留许可',
  'pt.kind.visa': '居留签证（拿到居留许可之前）',
  'pt.kind.permanent': '永久居留许可（autorização de residência permanente）',
  'pt.kind.ari-permanent':
    '投资类永久居留（由黄金签证转来，autorização de residência para atividade de investimento permanente）',
  'pt.kind.eu-long-term':
    '欧盟长期居民身份（título UE de residência de longa duração）',
  'pt.addPermit': '添加证件',
  'pt.trips': '出境记录',
  'pt.tripsHint':
    '每次离开葡萄牙填一行，计划中的出行也可以填。大部分时间在境外的黄金签证持有人，请把每次离开到回来的整段都填上。',
  'pt.trip': '出境 {n}',
  'pt.departed': '离开葡萄牙的日期',
  'pt.returned': '回到葡萄牙的日期',
  'pt.addTrip': '添加出境记录',
  'pt.nationality': '入籍',
  'pt.route': '你的国籍',
  'pt.route.choose': '请选择',
  'pt.route.cplp': '葡语国家国民（7 年）',
  'pt.route.eu': '欧盟成员国公民（7 年）',
  'pt.route.eea': '挪威、冰岛、列支敦士登或瑞士公民（10 年）',
  'pt.route.other': '其他国家国民，含中国（10 年）',
  'pt.route.stateless': '无国籍（4 年）',
  'pt.pending':
    '我在 2026 年 5 月 19 日新法施行前（或当天）已递交入籍申请，施行时仍在审理（施行前递交的适用旧法；恰在当天递交的适用哪一版待确认）',
  'pt.appliedOn': '入籍申请的递交日期',
  'pt.residenceApplied': '首张临时居留许可的申请日期（可留空）',
  'pt.residenceAppliedHint':
    '旧法从申请临时居留许可之日起算（以获批为前提）；留空则从许可生效日起算。',
  'pt.remove': '删除',
  'pt.submit': '计算',
  'pt.errorSummary': '请先修正标红的项目。',
  'pt.error.date': '请填写有效日期。',
  'pt.error.order': '这个日期不能早于开始的日期。',
  'pt.error.route': '请选择你的国籍类别。',
  'pt.error.pendingDate':
    '新法施行（2026-05-19）后递交的申请不适用旧法；请检查日期或取消勾选。',
  'pt.error.afterSimulation': '递交日期不能晚于模拟日期。',
} as const;

export const en: Record<keyof typeof zhCN, string> = {
  'pt.name': 'Portugal',
  'pt.entryLink': 'Open the Portugal pilot',
  'pt.entryDesc':
    'Use your residence permits (golden visa included) and travel record to work out the dates for naturalisation, permanent residence, EU long-term residence and golden visa renewal.',
  'pt.title':
    'Portugal: dates for naturalisation, permanent residence and the golden visa (pilot)',
  'pt.intro':
    'From your Portuguese residence permits (golden visa included) and trips, this works out four steps that depend on time alone: the years of residence for naturalisation (under the nationality law in force since May 2026), permanent residence, EU long-term resident status, and the golden visa (ARI) minimum stays and renewal period. Investment amounts and language tests are out of scope.',
  'pt.scope':
    'The pilot checks only the time requirements in the nationality law and the foreigners law. It does not check language, criminal record, income, accommodation or other requirements; each result lists them, and open questions such as when the new law starts counting or how periods with gaps add up are flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'pt.basics': 'About you',
  'pt.simulationDate': 'Simulation date',
  'pt.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'pt.permits': 'Residence permits',
  'pt.permitsHint':
    'Add a row for each permit, then the next one if renewed on time; leave the end blank if it is still valid (for a golden visa, enter the expiry on the card to get the renewal dates). You can also add a row for time on a residence visa before your first permit. Permanent residence and EU long-term resident status have no time limit, so an expired card does not end them; the right of residence for 6 months after a temporary card expires is explained in the results.',
  'pt.permit': 'Permit {n}',
  'pt.from': 'Valid from',
  'pt.to': 'Valid until (leave blank if still valid)',
  'pt.kind': 'Permit type',
  'pt.kind.temporary': 'Temporary residence permit (work, family and others)',
  'pt.kind.golden-visa': 'Golden visa (residence permit for investment, ARI)',
  'pt.kind.study': 'Study, unpaid traineeship or volunteering permit',
  'pt.kind.visa': 'Residence visa (before your residence permit)',
  'pt.kind.permanent':
    'Permanent residence (autorização de residência permanente)',
  'pt.kind.ari-permanent':
    'Permanent residence for investment, from a golden visa (autorização de residência para atividade de investimento permanente)',
  'pt.kind.eu-long-term':
    'EU long-term resident status (título UE de residência de longa duração)',
  'pt.addPermit': 'Add a permit',
  'pt.trips': 'Trips abroad',
  'pt.tripsHint':
    'Add a row for each time you left Portugal. You can include planned trips. If you hold a golden visa and live mostly abroad, enter each whole stretch from leaving to coming back.',
  'pt.trip': 'Trip {n}',
  'pt.departed': 'Date you left Portugal',
  'pt.returned': 'Date you came back to Portugal',
  'pt.addTrip': 'Add a trip',
  'pt.nationality': 'Naturalisation',
  'pt.route': 'Your nationality',
  'pt.route.choose': 'Choose one',
  'pt.route.cplp': 'National of a Portuguese-speaking country (7 years)',
  'pt.route.eu': 'Citizen of an EU member state (7 years)',
  'pt.route.eea':
    'Citizen of Norway, Iceland, Liechtenstein or Switzerland (10 years)',
  'pt.route.other': 'National of another country, China included (10 years)',
  'pt.route.stateless': 'Stateless (4 years)',
  'pt.pending':
    'I applied for naturalisation before (or on) 19 May 2026, when the new law came into force, and it was still pending then (an application made before that day falls under the earlier law; for one made on the day itself, which law applies is uncertain)',
  'pt.appliedOn': 'Date you applied for naturalisation',
  'pt.residenceApplied':
    'Date you applied for your first temporary residence permit (optional)',
  'pt.residenceAppliedHint':
    'The earlier law counts from the application for temporary residence, once granted; if left blank, it counts from the permit start.',
  'pt.remove': 'Remove',
  'pt.submit': 'Work out dates',
  'pt.errorSummary': 'Fix the items marked in red first.',
  'pt.error.date': 'Enter a valid date.',
  'pt.error.order': 'This date cannot be before the start date.',
  'pt.error.route': 'Choose your nationality group.',
  'pt.error.pendingDate':
    'Applications made after the new law came into force (2026-05-19) do not fall under the earlier law; check the date or untick the box.',
  'pt.error.afterSimulation':
    'The application date cannot be after the simulation date.',
};
