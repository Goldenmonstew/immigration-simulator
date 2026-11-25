import { addMonths, addYears } from './dates';
import type { IsoDate } from './types';
import { marriageRegistration } from './malaysia-full-pr';
import {
  age,
  all,
  assemble,
  atLeast,
  birthday,
  check,
  heldRun,
  inapplicable,
  info,
  marriageSubsists,
  planned,
  ref,
  renewal,
  timing,
  v,
  withFee,
  type MyCheck,
  type MyContext,
  type MyPassKind,
  type MyPathway,
} from './malaysia-full-shared';

const guide = (locator: string) => ref('SRC-505', locator);
const ANY_PASS: MyPassKind[] = [
  'ltsvp-spouse',
  'ltsvp-other',
  'employment',
  'student',
  'professional-visit',
  'residence',
  'dependant',
  'mm2h',
  'pvip',
  'plks',
  'unhcr',
  'imm13',
];

export function assessSpouseLtsvp(ctx: MyContext): MyPathway {
  const { req, L } = ctx;
  const tie = req.family?.tie;
  const spouse = tie === 'wife-of-citizen' || tie === 'husband-of-citizen';
  const subsists = marriageSubsists(ctx);
  const p = v.spouseLtsvp.value;
  const e = req.evidence;
  const page = ref(
    'SRC-509',
    'LTSVP Introduction、Conditions and Regulations for Permission to Work',
  );
  const newApplication = ref('SRC-509', '公民配偶新申请清单及注');
  const nationality = req.nationality;
  const bond = v.securityBondRm.value;
  const conflicting = nationality !== undefined && nationality in bond.mdecOnly;
  const bondAmount =
    nationality === undefined || conflicting
      ? undefined
      : (bond.byNationality[nationality] ?? bond.otherCountries);
  const checks: MyCheck[] = [
    check(
      'my.pass.category',
      L('公民的配偶', 'Spouse of a citizen'),
      tie === undefined ? undefined : spouse ? subsists.met : false,
      [page, ref('SRC-509', '"Husband / Wife to Citizen" 清单')],
      L(
        '依法与马来西亚公民结婚的外籍丈夫或妻子；清单要求最新宣誓书证明婚姻仍存续，离婚者另有单独的准证类别。',
        'A foreign husband or wife lawfully married to a Malaysian citizen. The checklist asks for a recent affidavit that the marriage still exists; divorced spouses have a separate pass category.',
      ) + (spouse ? subsists.text : ''),
      spouse ? subsists.pending : [],
    ),
    marriageRegistration(ctx, 'my.pass.marriage-registration', [
      page,
      newApplication,
    ]),
    check(
      'my.pass.sponsor',
      L('公民配偶同到场', 'Citizen spouse attends'),
      req.citizenSponsor,
      [newApplication, ref('SRC-509', '续签清单')],
      L(
        '新申请与续签都须由公民配偶一同到移民局递交并作担保声明；中国与非洲国家公民须到移民局总部递交。',
        'For new applications and renewals the citizen spouse attends the Immigration office and signs the sponsor statement. Chinese and African nationals file at Immigration headquarters.',
      ),
    ),
    check(
      'my.pass.income-evidence',
      L('收入证明', 'Proof of income'),
      e?.applicantIncome || e?.sponsorIncome ? true : undefined,
      [newApplication],
      L(
        '清单要求工资单、存折或 Borang J 等收入证明，未公布最低金额。',
        'The checklist asks for payslips, a bank book or Borang J as proof of income, without a published minimum.',
      ),
      [],
      'factor',
    ),
    info(
      'my.pass.duration',
      L('准证期限与上门核查', 'Pass length and home checks'),
      [page],
      L(
        `公民配偶的长期社交访问准证最短 ${p.minMonths} 个月，最长可批 ${p.maxYears} 年，视批准与遵守条件而定；移民局可上门、观察、面谈并查文件（Naziran），结果用于批准或续签。`,
        `The spouse pass runs for at least ${p.minMonths} months and up to ${p.maxYears} years, subject to approval and compliance. Immigration may visit, observe, interview and review documents (Naziran) to decide grants and renewals.`,
      ),
      false,
      ['PD-427'],
    ),
    info(
      'my.pass.work',
      L('工作与经商', 'Work and business'),
      [page],
      L(
        '持公民配偶准证可工作、经商或从事专业工作，无须改持就业准证；须与公民配偶同到工作所在州的移民局申请护照背书，附雇主录用信与贴印花的雇佣合同。',
        'The spouse pass allows employment, business or professional work without an Employment Pass. Apply with the citizen spouse at the Immigration office of the state of work for an endorsement, with the offer letter and a stamped employment contract.',
      ),
    ),
    withFee(
      info(
        'my.pass.fee',
        L('准证费用', 'Pass fee'),
        [ref('SRC-506', '§11.1 p25')],
        L(
          `REP 指南写长期社交访问准证每年 RM${p.feePerYearRm}，是否适用于一般公民配偶待确认。`,
          `The REP guideline gives RM${p.feePerYearRm} a year for the long-term social visit pass; whether this applies to other citizens’ spouses needs confirmation.`,
        ),
        false,
        ['PD-427'],
      ),
      p.feePerYearRm,
    ),
    withFee(
      info(
        'my.pass.security-bond',
        L('担保金（Security Bond）', 'Security bond'),
        v.securityBondRm.sources,
        L(
          `新申请须交担保金，按国籍分档，未列国家为 RM${bond.otherCountries}。`,
          `New applications need a security bond by nationality, RM${bond.otherCountries} for countries not listed.`,
        ) +
          (conflicting
            ? L(
                `移民局费率表把日本、韩国、澳门、香港同列在 RM1000 与 RM750 两档，未列孟加拉、印度、巴基斯坦、菲律宾、缅甸、斯里兰卡、尼泊尔；MDEC 同名费率表把这四地列为 RM1000、这七国列为 RM750。所填国籍属冲突档位，金额待确认。`,
                ` The Immigration rate table lists Japan, South Korea, Macao and Hong Kong under both RM1000 and RM750 and does not list Bangladesh, India, Pakistan, the Philippines, Myanmar, Sri Lanka or Nepal; MDEC's table of the same name puts the four at RM1000 and the seven at RM750. The nationality entered falls in a conflicting rate, so the amount needs confirmation.`,
              )
            : bondAmount !== undefined
              ? L(
                  `按所填国籍为 RM${bondAmount}。`,
                  ` For the nationality entered it is RM${bondAmount}.`,
                )
              : ''),
        bondAmount !== undefined,
        ['PD-411'],
      ),
      bondAmount,
    ),
    info(
      'my.pass.pr-link',
      L(
        '与永久居留及公民身份的关系',
        'Link to permanent residence and citizenship',
      ),
      [
        guide('§5.1(d) p18'),
        guide('§5.2(d) p19'),
        ref('SRC-500', '附表二第三部分 s.20(2)(c) p373'),
      ],
      L(
        `公民之妻持此准证超过 ${v.prWife.value.ltsvpMonths} 个月、公民之夫连续 ${v.prHusband.value.ltsvpYears} 年，可申请永久居留；凭准证居留的期间须部长同意才计入公民身份的居住年限。`,
        `A wife may apply for permanent residence after more than ${v.prWife.value.ltsvpMonths} months on this pass and a husband after ${v.prHusband.value.ltsvpYears} continuous years. Time on a pass counts towards citizenship residence only with the Minister’s consent.`,
      ),
    ),
  ];
  return assemble(
    ctx,
    'my.pass.spouse-ltsvp',
    L(
      '公民配偶长期社交访问准证（LTSVP）',
      'Long-term social visit pass for a citizen’s spouse',
    ),
    checks,
  );
}

export function assessMm2h(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const m = req.mm2h ?? {};
  const cat = m.category;
  const years = age(req.dateOfBirth, date);
  const a = v.mm2hAge.value;
  const deposit = v.mm2hDepositUsd.value;
  const property = v.mm2hProperty.value;
  const stay = v.mm2hStay.value;
  const screening = v.mm2hScreening.value;
  const sezOlder =
    cat === 'sez' && years !== undefined && years >= a.sezOlderAge;
  const requiredDeposit =
    cat === undefined
      ? undefined
      : cat === 'sez'
        ? years === undefined
          ? undefined
          : sezOlder
            ? deposit.sezOlder
            : deposit.sez
        : deposit[cat];
  const names = {
    platinum: 'Platinum',
    gold: 'Gold',
    silver: 'Silver',
    sez: L('经济特区／金融特区（SEZ/SFZ）', 'SEZ/SFZ'),
  };
  const catText = cat
    ? L(`所选类别为 ${names[cat]}。`, ` The category chosen is ${names[cat]}.`)
    : '';

  const checks: MyCheck[] = [
    check(
      'my.pass.diplomatic-relations',
      L('原籍国与马来西亚的外交关系', 'Diplomatic relations with Malaysia'),
      m.fromCountryWithDiplomaticRelations,
      [ref('SRC-517', '一般条件 (i) p1')],
      L(
        '只接受与马来西亚有外交关系国家的公民申请。',
        'Only nationals of countries with diplomatic relations with Malaysia may apply.',
      ),
    ),
    check(
      'my.pass.age',
      L('主申请人年龄', 'Main applicant’s age'),
      cat === undefined || years === undefined ? undefined : years >= a[cat],
      v.mm2hAge.sources,
      L(
        `Platinum、Gold、Silver 须年满 ${a.platinum} 岁，SEZ/SFZ 须年满 ${a.sez} 岁。`,
        `Platinum, Gold and Silver applicants must be at least ${a.platinum}; SEZ/SFZ applicants at least ${a.sez}.`,
      ) + catText,
    ),
    check(
      'my.pass.licensed-operator',
      L('经持牌 MM2H 业者申请', 'Application through a licensed MM2H operator'),
      m.viaLicensedOperator,
      [ref('SRC-517', '一般条件 (iii)–(iv) p1')],
      L(
        '须经旅游部依《1992 年旅游业法》发牌的 MM2H 业者向一站式中心递交，不受理个人或现场申请；移民事项与上诉归内政部。',
        'Applications go through a MM2H operator licensed under the Tourism Industry Act 1992 to the one-stop centre; individual or walk-in applications are not accepted. Immigration matters and appeals rest with the Ministry of Home Affairs.',
      ),
    ),
    check(
      'my.pass.fixed-deposit',
      L('定期存款', 'Fixed deposit'),
      requiredDeposit === undefined
        ? undefined
        : atLeast(m.fixedDepositUsd, requiredDeposit),
      v.mm2hDepositUsd.sources,
      L(
        `须存于马来西亚持牌金融机构：Platinum USD${deposit.platinum}、Gold USD${deposit.gold}、Silver USD${deposit.silver}，SEZ/SFZ ${a.sezOlderAge} 岁以下 USD${deposit.sez}、${a.sezOlderAge} 岁及以上 USD${deposit.sezOlder}。获批后最多可提取本金的 ${deposit.withdrawalPercent}% 用于购房、教育、医疗与旅游；境外收入要求已取消。`,
        `Held at a licensed Malaysian financial institution: Platinum USD${deposit.platinum}, Gold USD${deposit.gold}, Silver USD${deposit.silver}, SEZ/SFZ USD${deposit.sez} under ${a.sezOlderAge} and USD${deposit.sezOlder} from ${a.sezOlderAge}. Up to ${deposit.withdrawalPercent}% of the principal may be withdrawn after approval for a home, education, health care or travel. The offshore income requirement has been dropped.`,
      ) + catText,
    ),
    check(
      'my.pass.property',
      L('购买住宅', 'Buying a residence'),
      cat === undefined
        ? undefined
        : cat === 'sez'
          ? undefined
          : atLeast(m.propertyValueRm, property[cat]),
      v.mm2hProperty.sources,
      L(
        `获批后须购买并持有住宅：Platinum 至少 RM${property.platinum}、Gold RM${property.gold}、Silver RM${property.silver}，须在准证背书后 ${property.purchaseYears} 年内完成，${property.resaleYears} 年内不得转售（可换购更贵的住宅），违反可撤销准证。SEZ/SFZ 只能在背书前向柔佛 Forest City 发展商直接购买，底价由州政策决定。`,
        `After approval a residence must be bought and kept: at least RM${property.platinum} for Platinum, RM${property.gold} for Gold and RM${property.silver} for Silver, completed within ${property.purchaseYears} year of the pass endorsement and not resold for ${property.resaleYears} years except to upgrade; breaches can cancel the pass. SEZ/SFZ participants buy from a Forest City (Johor) developer before endorsement, at a state-set floor price.`,
      ),
      cat === 'sez' ? ['PD-423'] : [],
    ),
    check(
      'my.pass.minimum-stay',
      L('每年在马天数', 'Days in Malaysia each year'),
      years === undefined
        ? undefined
        : years >= stay.exemptAge
          ? atLeast(m.daysPerYear, stay.days) || undefined
          : atLeast(m.daysPerYear, stay.days),
      v.mm2hStay.sources,
      L(
        `每年须累计在马 ${stay.days} 天，${stay.exemptAge} 岁以下由主申请人或受养人满足即可。官网写 ${stay.exemptAge} 岁及以上不设要求，资格条件原文未写这一豁免，${stay.exemptAge} 岁及以上未达 ${stay.days} 天时待确认。`,
        `${stay.days} days a year in total, which the main applicant or dependants may meet when under ${stay.exemptAge}. The website exempts those aged ${stay.exemptAge} or over but the conditions document does not, so below ${stay.days} days from ${stay.exemptAge} needs confirmation.`,
      ),
      years !== undefined && years >= stay.exemptAge ? ['PD-420'] : [],
    ),
    check(
      'my.pass.good-conduct',
      L('良民证', 'Certificate of good conduct'),
      m.goodConductCertificates,
      [ref('SRC-519', '第 5 项')],
      L(
        `主申请人与 ${screening.minAge} 岁以上受养人须交原籍国或居住国的良民证，距到期至少 ${screening.validMonths} 个月。`,
        `The main applicant and dependants aged ${screening.minAge} or over provide a certificate of good conduct from their home or residence country with at least ${screening.validMonths} months left.`,
      ),
    ),
    check(
      'my.pass.security-screening',
      L('警方安全审查', 'Police screening'),
      undefined,
      [ref('SRC-522', '第 E(i) 点 p2'), ref('SRC-517', '一般条件 (iv) p1')],
      L(
        '须通过皇家警察（PDRM）安全审查，并可能被随机面谈，结果无法预判。',
        'Royal Malaysia Police (PDRM) screening, with possible random interviews, cannot be predicted.',
      ),
      [],
      'factor',
    ),
    check(
      'my.pass.medical-insurance',
      L('体检与健康保险', 'Medical examination and health insurance'),
      years !== undefined && years > screening.insuranceMaxAge
        ? true
        : m.healthInsurance,
      [
        ref('SRC-517', '健康检查 p5'),
        ref('SRC-520', 'p12（印刷 p22–23）、p26'),
      ],
      L(
        `获批后主申请人与受养人须到旅游部指定诊所体检；${screening.insuranceMaxAge} 岁及以下须有全球保障的健康保险，最低保额未公布。`,
        `After approval the main applicant and dependants have a medical at a ministry panel clinic; those aged ${screening.insuranceMaxAge} or under need health insurance with worldwide cover. No minimum cover is published.`,
      ),
    ),
    info(
      'my.pass.work',
      L('工作与经商', 'Work and business'),
      [
        ref('SRC-517', '经商与工作 p5、p10、p15'),
        ref('SRC-518', '经商与工作 p4'),
      ],
      L(
        '只有 Platinum 可经商、投资和工作；其他类别须另申请相关准证。子女可在认可院校读到大学，允许长期就医。',
        'Only Platinum allows business, investment and work; other categories need a separate pass. Children may study up to university at recognised institutions, and long-term medical treatment is allowed.',
      ) +
        (m.needsToWork && cat && cat !== 'platinum'
          ? L(
              '所选类别不能在马工作。',
              ' The category chosen does not allow work in Malaysia.',
            )
          : ''),
    ),
    info(
      'my.pass.term',
      L('准证期限与续签', 'Pass term and renewal'),
      [...v.mm2hPassYears.sources, ...v.mm2hRenewalFeeRm.sources],
      L(
        `Platinum ${v.mm2hPassYears.value.platinum} 年、Gold ${v.mm2hPassYears.value.gold} 年、Silver ${v.mm2hPassYears.value.silver} 年、SEZ/SFZ ${v.mm2hPassYears.value.sez} 年，含多次入境签证，以护照效期为限。期满后每 ${v.mm2hRenewalFeeRm.value.everyYears} 年续签，费用 Platinum RM${v.mm2hRenewalFeeRm.value.platinum}、Gold RM${v.mm2hRenewalFeeRm.value.gold}、Silver RM${v.mm2hRenewalFeeRm.value.silver}、SEZ/SFZ RM${v.mm2hRenewalFeeRm.value.sez}。`,
        `Platinum ${v.mm2hPassYears.value.platinum} years, Gold ${v.mm2hPassYears.value.gold}, Silver ${v.mm2hPassYears.value.silver}, SEZ/SFZ ${v.mm2hPassYears.value.sez}, with a multiple-entry visa, limited by passport validity. After that it is renewed every ${v.mm2hRenewalFeeRm.value.everyYears} years for RM${v.mm2hRenewalFeeRm.value.platinum} (Platinum), RM${v.mm2hRenewalFeeRm.value.gold} (Gold), RM${v.mm2hRenewalFeeRm.value.silver} (Silver) or RM${v.mm2hRenewalFeeRm.value.sez} (SEZ/SFZ).`,
      ),
    ),
    withFee(
      info(
        'my.pass.participation-fee',
        L('参与费', 'Participation fee'),
        v.mm2hParticipationFeeRm.sources,
        L(
          '只向主申请人一次性收取，受养人不收。',
          'A one-off fee for the main applicant only; none for dependants.',
        ),
        cat !== undefined,
      ),
      cat && v.mm2hParticipationFeeRm.value[cat],
    ),
  ];
  const f = v.mm2hPassFeesRm.value;
  const dependants = m.dependants;
  checks.push(
    withFee(
      info(
        'my.pass.pass-fees',
        L('签发处理费', 'Processing fee per issue'),
        v.mm2hPassFeesRm.sources,
        L(
          `移民条例准证费的处理费部分：每次签发主申请人 RM${f.principalIssuance}、每名受养人 RM${f.dependantIssuance}，金额为主申请人与所填受养人之和。年费、参与费、系统处理费另列，官方未列总额。`,
          `The processing part of the immigration pass fee: RM${f.principalIssuance} per issue for the main applicant and RM${f.dependantIssuance} per dependant, summed for the dependants entered. The annual fee, participation fee and system fee are separate, and no total is published.`,
        ),
        dependants !== undefined,
        ['PD-422'],
      ),
      dependants === undefined
        ? undefined
        : f.principalIssuance + dependants * f.dependantIssuance,
    ),
    withFee(
      info(
        'my.pass.annual-fee',
        L('准证年费', 'Annual pass fee'),
        v.mm2hPassFeesRm.sources,
        L(
          `移民条例准证费的申请费部分：主申请人与每名受养人每年或不足一年各 RM${f.principalPerYear}，金额为一年的合计。`,
          `The application part of the immigration pass fee: RM${f.principalPerYear} a year or part of a year for the main applicant and each dependant; the amount is one year for everyone entered.`,
        ),
        dependants !== undefined,
        ['PD-422'],
      ),
      dependants === undefined
        ? undefined
        : f.principalPerYear + dependants * f.dependantPerYear,
    ),
    withFee(
      info(
        'my.pass.system-fee',
        L('MM2H 系统处理费', 'MM2H system processing fee'),
        v.mm2hSystemFeeRm.sources,
        L(
          `${v.mm2hSystemFeeRm.value.from} 起新申请经 MM2H 系统递交，每宗另收此费（不含销售与服务税）。`,
          `From ${v.mm2hSystemFeeRm.value.from} new applications go through the MM2H system, with this fee per application before sales and service tax.`,
        ),
      ),
      date >= v.mm2hSystemFeeRm.value.from
        ? v.mm2hSystemFeeRm.value.amount
        : undefined,
    ),
    info(
      'my.pass.dependants',
      L('可携受养人', 'Dependants'),
      v.mm2hDependants.sources,
      L(
        `可带配偶、${v.mm2hDependants.value.childUnconditionalAge} 岁以下子女（含继、养子女）、${v.mm2hDependants.value.childUnconditionalAge} 至 ${v.mm2hDependants.value.childMaxAge} 岁且"tidak bekerja atau tidak berkahwin di Malaysia"（不在马来西亚工作或未在马来西亚结婚）的子女、经医学认证的残障子女、父母或公婆；Platinum 另可带外籍女佣。另一份官方表格写子女上限 ${v.mm2hDependants.value.childMaxAgeOther} 岁。`,
        `Dependants are a spouse, children under ${v.mm2hDependants.value.childUnconditionalAge} (including step and adopted), children aged ${v.mm2hDependants.value.childUnconditionalAge} to ${v.mm2hDependants.value.childMaxAge} who are "tidak bekerja atau tidak berkahwin di Malaysia" (not working or not married in Malaysia), medically certified disabled children, and parents or parents-in-law; Platinum may add a foreign domestic helper. Another official table gives ${v.mm2hDependants.value.childMaxAgeOther} as the child limit.`,
      ),
      false,
      ['PD-421'],
    ),
    info(
      'my.pass.pr-link',
      L(
        '与永久居留及公民身份的关系',
        'Link to permanent residence and citizenship',
      ),
      [
        guide('§2.5 p12'),
        guide('§3.14 p14'),
        ref('SRC-500', '附表二第三部分 s.20(2)(c) p373'),
      ],
      L(
        'MM2H 持有人不得申请完全外国人类永久居留，持有期间也不计入；凭准证居留的期间须部长同意才计入公民身份的居住年限。',
        'MM2H holders may not apply for permanent residence as a fully foreign national, and time on MM2H does not count. Time on a pass counts towards citizenship residence only with the Minister’s consent.',
      ),
    ),
  );
  return assemble(
    ctx,
    'my.pass.mm2h',
    L('马来西亚第二家园（MM2H）', 'Malaysia My Second Home (MM2H)'),
    checks,
  );
}

export function assessRpt(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const p = v.rpt.value;
  const src = v.rpt.sources;
  const run = heldRun(req.passes, ['employment'], date);
  const plan = planned(req.passes, ['employment'], date, (d) => {
    const at = heldRun(req.passes, ['employment'], d);
    return !at ? undefined : at.valid ? addYears(at.start, p.workYears) : null;
  });
  // The page says "worked in Malaysia" without naming a pass, and work on
  // other passes is not asked (PD-431).
  const anyPass = heldRun(req.passes, ANY_PASS, date);
  const r = req.rpt;
  const checks: MyCheck[] = [
    check(
      'my.pass.work-years',
      L('在马连续工作年数', 'Continuous years working in Malaysia'),
      !run
        ? undefined
        : run.valid && date >= addYears(run.start, p.workYears)
          ? true
          : anyPass?.valid && date >= addYears(anyPass.start, p.workYears)
            ? undefined
            : false,
      src,
      L(
        `递交时须已在马来西亚连续工作至少 ${p.workYears} 年。`,
        `At least ${p.workYears} consecutive years working in Malaysia when applying.`,
      ) +
        (run?.valid
          ? L(
              `当前就业准证自 ${run.start} 起连续持有。`,
              ` The current Employment Pass run began on ${run.start}.`,
            )
          : '') +
        (anyPass?.valid && anyPass.start < (run?.valid ? run.start : date)
          ? L(
              `连同其他准证自 ${anyPass.start} 起连续在马；持其他准证期间的工作能否计入待确认。`,
              ` Counting other passes, the stay has been unbroken since ${anyPass.start}; whether work on other passes counts needs confirmation.`,
            )
          : ''),
      ['PD-431'],
    ),
    check(
      'my.pass.ep-validity',
      L('就业准证剩余效期', 'Employment Pass validity left'),
      req.passes === undefined
        ? undefined
        : req.passes.some(
            (e) =>
              e.kind === 'employment' &&
              e.from <= date &&
              e.to > addMonths(date, p.epValidityMonths),
          ),
      src,
      L(
        `递交时就业准证须还有超过 ${p.epValidityMonths} 个月效期。`,
        `The Employment Pass must have more than ${p.epValidityMonths} months left when applying.`,
      ),
    ),
    check(
      'my.pass.tax',
      L('马来西亚纳税记录', 'Malaysian tax record'),
      atLeast(r?.taxYearsPaid, p.taxYears),
      src,
      L(
        `须有马来西亚税号，并已缴最近至少 ${p.taxYears} 年的所得税。`,
        `A Malaysian tax file with income tax paid for at least the last ${p.taxYears} years.`,
      ),
    ),
    check(
      'my.pass.salary',
      L('基本月薪', 'Basic monthly salary'),
      atLeast(req.work?.basicMonthlySalaryRm, p.basicSalaryRm),
      src,
      L(
        `基本月薪至少 RM${p.basicSalaryRm}，不含津贴与花红。`,
        `A basic monthly salary of at least RM${p.basicSalaryRm}, excluding allowances and bonuses.`,
      ),
    ),
    check(
      'my.pass.qualification',
      L('学历或专业资格', 'Qualification'),
      r?.qualification,
      src,
      L(
        '须有认可大学的博士、硕士、学士或文凭，或认可专业机构的证书。',
        'A doctorate, master’s, bachelor’s degree or diploma from a recognised university, or a certificate from a recognised professional body.',
      ),
    ),
    check(
      'my.pass.experience',
      L('总工作经验', 'Total work experience'),
      atLeast(r?.totalExperienceYears, p.experienceYears),
      src,
      L(
        `总工作经验至少 ${p.experienceYears} 年。`,
        `At least ${p.experienceYears} years of work experience in total.`,
      ),
    ),
    info(
      'my.pass.benefits',
      L('准证期限与家属', 'Pass term and family'),
      src,
      L(
        `最长 ${p.passYears} 年，换雇主无须换证；合法配偶与 ${p.dependantUnderAge} 岁以下受养人可获受养人准证，配偶可直接在马工作。`,
        `Up to ${p.passYears} years, with no new pass needed to change employer. A lawful spouse and dependants under ${p.dependantUnderAge} can get dependant passes, and the spouse may work without an Employment Pass.`,
      ),
    ),
    info(
      'my.pass.fee',
      L('申请费用', 'Application fee'),
      src,
      L(
        'TalentCorp 页面没有列出费用；薪资门槛在 2026 年就业准证新政后是否调整也未说明。',
        'The TalentCorp page lists no fee and does not say whether the salary threshold changed with the 2026 Employment Pass policy.',
      ),
      false,
      ['PD-425'],
    ),
    info(
      'my.pass.pr-link',
      L('与永久居留的关系', 'Link to permanent residence'),
      [guide('§5.4(b) p21')],
      L(
        `RP-T 属 Residence Pass，可计入完全外国人类永久居留所需的连续 ${v.prWas.value.passYears} 年准证。`,
        `RP-T is a Residence Pass and counts towards the ${v.prWas.value.passYears} continuous years needed for permanent residence as a fully foreign national.`,
      ),
    ),
  ];
  return assemble(
    ctx,
    'my.pass.rpt',
    L('人才居留准证（RP-T）', 'Residence Pass-Talent (RP-T)'),
    checks,
    {
      time: timing(plan.earliest, date),
      assumptions: renewal(ctx, plan.renewed),
    },
  );
}

export function assessPvip(ctx: MyContext): MyPathway {
  const { L } = ctx;
  return assemble(
    ctx,
    'my.pass.pvip',
    L('马来西亚优质签证计划（PVIP）', 'Premium Visa Programme (PVIP)'),
    [
      check(
        'my.pass.pvip-terms',
        L('参与条件与费用', 'Eligibility and fees'),
        undefined,
        [guide('§3.15 p14')],
        L(
          '移民局把 PVIP 定义为吸引合资格外国人长期居住的长期访问准证；参与费、定存、收入门槛、准证期限与受养人等参数没有取得官方原文。',
          'The Immigration Department describes PVIP as a long-term visit pass to attract eligible foreign nationals. Its fees, deposits, income thresholds, term and dependants could not be confirmed from an official source.',
        ),
        ['PD-424'],
      ),
      info(
        'my.pass.pr-link',
        L('与永久居留的关系', 'Link to permanent residence'),
        [guide('§2.5 p12')],
        L(
          'PVIP 持有人不得申请完全外国人类永久居留，持有期间也不计入。',
          'PVIP holders may not apply for permanent residence as a fully foreign national, and time on PVIP does not count.',
        ),
      ),
    ],
  );
}

export function assessDeRantau(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const d = req.deRantau ?? {};
  const p = v.deRantau.value;
  const bond = v.securityBondRm.value;
  const bondAmount =
    req.nationality === undefined
      ? undefined
      : (bond.mdecOnly[req.nationality] ??
        bond.byNationality[req.nationality] ??
        bond.otherCountries);
  const income = v.deRantauIncomeUsd.value;
  const tech = date >= income.techFrom ? income.tech : income.techBefore;
  const threshold =
    d.talent === undefined
      ? undefined
      : d.talent === 'tech'
        ? tech
        : income.nonTech;
  const years = age(req.dateOfBirth, date);
  let employer = check(
    'my.pass.remote-employer',
    L('远程雇主与合同', 'Remote employer and contract'),
    d.workType === undefined
      ? undefined
      : all(
          d.employerRegisteredInMalaysia === undefined
            ? undefined
            : !d.employerRegisteredInMalaysia,
          d.contractStart === undefined
            ? undefined
            : d.contractStart <= addMonths(date, -p.contractMonths),
        ),
    [ref('SRC-528', 'v11 Section B Q3 p4')],
    L(
      `远程雇员的雇主不得在马来西亚注册，雇佣合同须在递交前至少 ${p.contractMonths} 个月开始。`,
      `A remote employee’s employer must not be registered in Malaysia, and the contract must have started at least ${p.contractMonths} months before applying.`,
    ),
  );
  if (d.workType === 'freelancer')
    employer = inapplicable(
      employer,
      L(
        '自由职业者改交合同、发票与收款记录。',
        'Freelancers provide contracts, invoices and payment records instead.',
      ),
    );
  const checks: MyCheck[] = [
    check(
      'my.pass.nationality',
      L('国籍', 'Nationality'),
      req.nationality === undefined
        ? undefined
        : req.nationality !== p.excludedNationality,
      [ref('SRC-528', 'v11 Section A Q7 p2')],
      L(
        '除以色列公民外，所有国籍均可申请。',
        'Open to every nationality except citizens of Israel.',
      ),
    ),
    check(
      'my.pass.age',
      L('主申请人年龄', 'Main applicant’s age'),
      years === undefined
        ? undefined
        : years < p.minAge
          ? false
          : date === birthday(req.dateOfBirth as IsoDate, p.minAge)
            ? undefined
            : true,
      [ref('SRC-528', 'v11 Section A Q8 p2')],
      L(
        `FAQ 写主申请人须"over eighteen (18) years old"，${p.minAge} 岁生日之后符合，生日当天是否符合待确认。`,
        `The FAQ says the main applicant must be "over eighteen (18) years old": met after the ${p.minAge}th birthday; the birthday itself needs confirmation.`,
      ),
      ['PD-430'],
    ),
    check(
      'my.pass.income',
      L('年收入', 'Annual income'),
      threshold === undefined || d.annualIncomeUsd === undefined
        ? undefined
        : d.annualIncomeUsd === threshold
          ? undefined
          : d.annualIncomeUsd > threshold,
      [
        ...v.deRantauIncomeUsd.sources,
        ref('SRC-528', 'v11 Section B Q3 p4、Q4 p5'),
      ],
      L(
        `科技类（软件、云、网络安全、人工智能、数码营销等）USD${tech}，非科技类（列明的管理、财务、营销、法律等职位）USD${income.nonTech}。科技类门槛自 ${income.techFrom} 版 FAQ 起由 USD${income.techBefore} 提高。Section A 写最低收入为该数，Section B 写须高于该数，收入恰为门槛时待确认。`,
        `Tech talent (software, cloud, cybersecurity, AI, digital marketing and similar) USD${tech}; listed non-tech roles (management, finance, marketing, legal and similar) USD${income.nonTech}. The tech threshold rose from USD${income.techBefore} in the FAQ dated ${income.techFrom}. Section A calls the figure the minimum while Section B asks for more than it, so income exactly at the threshold needs confirmation.`,
      ),
      d.annualIncomeUsd === threshold ? ['PD-430'] : ['PD-426'],
    ),
    employer,
    check(
      'my.pass.passport',
      L('护照有效期', 'Passport validity'),
      req.passportExpiry === undefined
        ? undefined
        : req.passportExpiry > addMonths(date, p.passportMonths),
      [ref('SRC-528', 'v11 Section A Q13 p3')],
      L(
        `递交时护照须有超过 ${p.passportMonths} 个月效期。`,
        `The passport must have more than ${p.passportMonths} months left when applying.`,
      ),
    ),
    info(
      'my.pass.term',
      L('准证期限与限制', 'Pass term and limits'),
      [ref('SRC-528', 'v11 Section A Q4、Q9–Q10 p2、Q16–Q17 p3')],
      L(
        `属专业访问准证，首次 ${p.initialMinMonths} 至 ${p.initialMaxMonths} 个月，最多再续 ${p.renewals} 次、每次 ${p.renewalMonths} 个月，合计不超过 ${p.maxMonths} 个月。可带配偶、${p.childUnderAge} 岁以下子女与父母，配偶不得工作；只可在半岛与纳闽居留；不得由游客准证转换。`,
        `A professional visit pass for ${p.initialMinMonths} to ${p.initialMaxMonths} months at first, renewable up to ${p.renewals} times for ${p.renewalMonths} months each, ${p.maxMonths} months in total. A spouse, children under ${p.childUnderAge} and parents may come, but the spouse may not work. Stays are limited to the Peninsula and Labuan, and a tourist pass cannot be converted.`,
      ),
    ),
    withFee(
      info(
        'my.pass.fees',
        L('处理费与准证费', 'Processing and pass fees'),
        [ref('SRC-528', 'v11 Section D Q1 p14')],
        L(
          `递交时向 MDEC 缴付不退还的处理费：主申请人 RM${p.processingFeeRm}、每名受养人 RM${p.dependantFeeRm}（含销售与服务税）。背书时另缴移民准证费每 ${p.passFeeQuarterMonths} 个月 RM${p.passFeeQuarterRm} 或每年 RM${p.passFeeYearRm}，及按国籍的多次入境签证费。`,
          `A non-refundable processing fee is paid to MDEC on applying: RM${p.processingFeeRm} for the main applicant and RM${p.dependantFeeRm} per dependant, including sales and service tax. On endorsement the immigration pass fee is RM${p.passFeeQuarterRm} per ${p.passFeeQuarterMonths} months or RM${p.passFeeYearRm} a year, plus a multiple-entry visa fee by nationality.`,
        ),
        d.dependants !== undefined,
      ),
      d.dependants === undefined
        ? undefined
        : p.processingFeeRm + d.dependants * p.dependantFeeRm,
    ),
    withFee(
      info(
        'my.pass.security-bond',
        L('担保金（Personal/Security Bond）', 'Personal or security bond'),
        [ref('SRC-528', 'v11 Section D Q2 p15')],
        L(
          `MDEC 作担保机构时，背书前按国籍缴交担保金，未列国家为 RM${bond.otherCountries}，准证到期全额退还。`,
          `When MDEC is the sponsoring organisation, a bond set by nationality is paid before endorsement, RM${bond.otherCountries} for countries not listed, and refunded in full when the pass expires.`,
        ) +
          (bondAmount === undefined
            ? ''
            : L(
                `按所填国籍为 RM${bondAmount}。`,
                ` For the nationality entered it is RM${bondAmount}.`,
              )),
        bondAmount !== undefined,
      ),
      bondAmount,
    ),
    info(
      'my.pass.pr-link',
      L('与永久居留的关系', 'Link to permanent residence'),
      [guide('§5.4(b) p21')],
      L(
        `专业访问准证可计入完全外国人类永久居留的准证年数，但本准证最长 ${p.maxMonths} 个月，单独不足 ${v.prWas.value.passYears} 年；能否与之后的就业准证合并计算待确认。`,
        `Professional visit passes count towards the pass years for permanent residence as a fully foreign national, but this pass lasts at most ${p.maxMonths} months, short of ${v.prWas.value.passYears} years on its own; whether it combines with a later Employment Pass needs confirmation.`,
      ),
      false,
      ['PD-426'],
    ),
  ];
  return assemble(
    ctx,
    'my.pass.de-rantau',
    L('数字游民准证（DE Rantau）', 'DE Rantau Nomad Pass'),
    checks,
  );
}

export function assessEmploymentPass(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const e = v.employmentPass.value;
  const revised = date >= e.revisedFrom;
  const t = revised ? e.revised : e.previous;
  const salary = req.work?.basicMonthlySalaryRm;
  const category =
    salary === undefined
      ? undefined
      : salary >= t.category1
        ? 'I'
        : salary >= t.category2
          ? 'II'
          : salary >= t.category3
            ? 'III'
            : null;
  const checks: MyCheck[] = [
    check(
      'my.pass.salary-category',
      L('基本月薪与类别', 'Basic monthly salary and category'),
      category === undefined ? undefined : category !== null,
      v.employmentPass.sources,
      L(
        `${revised ? `${e.revisedFrom} 起递交的新申请与续签` : `${e.revisedFrom} 前递交的申请`}：Category I 至少 RM${t.category1}，Category II 至少 RM${t.category2}，Category III 至少 RM${t.category3}。只计在马应税的基本月薪，不含津贴、奖励、花红与境外支付。`,
        `${revised ? `New and renewal applications from ${e.revisedFrom}` : `Applications before ${e.revisedFrom}`}: Category I at least RM${t.category1}, Category II at least RM${t.category2}, Category III at least RM${t.category3}. Only basic monthly salary taxable in Malaysia counts, excluding allowances, incentives, bonuses and pay from abroad.`,
      ) +
        (category
          ? L(
              `所填月薪属 Category ${category}。`,
              ` The salary entered falls in Category ${category}.`,
            )
          : category === null
            ? L(
                '所填月薪低于最低类别。',
                ' The salary entered is below the lowest category.',
              )
            : ''),
    ),
    info(
      'my.pass.terms',
      L('准证期限、家属与接班计划', 'Pass term, family and succession plan'),
      v.employmentPass.sources,
      L(
        `准证期 ${e.minPassMonths} 至 ${e.maxPassMonths} 个月，视合同与外籍人士委员会批准；雇佣期自首次批准起按雇主计算，换雇主重新起算。新政下三类均可带配偶与 ${e.childUnderAge} 岁以下子女；Category II、III 自 ${e.successionPlanFrom} 起须提交接班计划。现有准证有效至到期。`,
        `The pass runs for ${e.minPassMonths} to ${e.maxPassMonths} months depending on the contract and the Expatriate Committee. Employment duration runs from the first approval and is tied to the employer, restarting with a new one. Under the revised policy all three categories may bring a spouse and children under ${e.childUnderAge}, and Categories II and III need a succession plan from ${e.successionPlanFrom}. Existing passes stay valid until expiry.`,
      ),
    ),
    info(
      'my.pass.pr-link',
      L(
        '与永久居留及公民身份的关系',
        'Link to permanent residence and citizenship',
      ),
      [guide('§5.4(b) p21'), ref('SRC-500', '附表二第三部分 s.20(2)(c) p373')],
      L(
        `就业准证计入完全外国人类永久居留所需的连续 ${v.prWas.value.passYears} 年准证（中断不超过 ${v.prWas.value.maxGapMonths} 个月），换雇主的空档是否算中断待确认；凭准证居留的期间须部长同意才计入公民身份的居住年限。`,
        `Employment Pass time counts towards the ${v.prWas.value.passYears} continuous pass years for permanent residence as a fully foreign national (breaks of at most ${v.prWas.value.maxGapMonths} months); whether a gap between employers is a break needs confirmation. Time on a pass counts towards citizenship residence only with the Minister’s consent.`,
      ),
      false,
      ['PD-407'],
    ),
  ];
  return assemble(
    ctx,
    'my.pass.employment',
    L('就业准证（Employment Pass）', 'Employment Pass'),
    checks,
  );
}
