import { addDays, addMonths, addYears, daysBetween } from './dates';
import { marriageRegistration } from './malaysia-full-pr';
import {
  age,
  assemble,
  birthday,
  check,
  daysIn,
  fullyCovered,
  info,
  latest,
  minus,
  passSpan,
  ref,
  timing,
  union,
  v,
  withFee,
  type MyCheck,
  type MyContext,
  type MyPathway,
  type Span,
} from './malaysia-full-shared';
import type { IsoDate } from './types';

const fc = (locator: string) => ref('SRC-500', locator);
const amendment = v.constitutionAmendment2025;

/**
 * Residence under the Second Schedule Part III s.20: permanent residence
 * counts from the Permit Masuk issue date; short absences and those for
 * health or government service count; time on a pass, and long absences for
 * study or any other reason, count only with the Minister's consent,
 * approval or prescription.
 */
function residence(ctx: MyContext, until: IsoDate) {
  const { req } = ctx;
  const since = req.citizenship?.permanentResidentSince;
  const pr: Span[] = since ? [{ start: since, end: until }] : [];
  const longTrips = (req.trips ?? []).filter(
    (t) => t.returned >= addMonths(t.departed, v.shortAbsenceMonths.value),
  );
  const counted = ['health', 'government-service'];
  return {
    prKnown: since !== undefined,
    tripsKnown: req.trips !== undefined,
    passesKnown: req.passes !== undefined,
    strict: minus(
      pr,
      longTrips
        .filter((t) => !counted.includes(t.reason ?? 'other'))
        .map((t) => ({ start: t.departed, end: t.returned })),
    ),
    // The most the Minister could count: time on a pass (s.20(2)(c)) and
    // every long absence (s.20(1)(b), (e)).
    withConsent: union([
      ...pr,
      ...(req.passes ?? []).filter((p) => p.kind !== 'unhcr').map(passSpan),
    ]),
    longTrips: longTrips.length,
  };
}

type Residence = ReturnType<typeof residence>;

// Unanswered absences can only shorten residence, and unanswered passes
// could hold time the Minister may count.
function verdict(r: Residence, ok: (spans: Span[]) => boolean) {
  if (ok(r.strict)) return r.tripsKnown ? true : undefined;
  if (!r.prKnown || !r.passesKnown || ok(r.withConsent)) return undefined;
  return false;
}

const answered = (r: Residence) => r.prKnown && r.tripsKnown;
const consentPending = (r: Residence) =>
  r.prKnown && r.tripsKnown && r.passesKnown;

function firstDay(
  from: IsoDate,
  to: IsoDate,
  test: (d: IsoDate) => boolean | undefined,
) {
  for (let d = from; d <= to; d = addDays(d, 1)) if (test(d) === true) return d;
  return undefined;
}

function residenceText(ctx: MyContext, r: Residence) {
  const { req, L } = ctx;
  const since = req.citizenship?.permanentResidentSince;
  return (
    (since
      ? L(
          `永久居留自 Permit Masuk 签发日 ${since} 起计算，获批至签发之间仍属凭准证居留。`,
          ` Permanent residence is counted from ${since}, the date the Permit Masuk was issued; between approval and issue the applicant is still on a pass.`,
        )
      : since === null
        ? L('所填未持永久居留。', ' No permanent residence is reported.')
        : '') +
    (r.longTrips
      ? L(
          `有 ${r.longTrips} 次 ${v.shortAbsenceMonths.value} 个月或更长的出境：健康或公务原因计入，教育或其他原因须部长批准或指定才计入。`,
          ` ${r.longTrips} absence(s) of ${v.shortAbsenceMonths.value} months or more: those for health or government service count; study or any other reason counts only if the Minister approves or prescribes it.`,
        )
      : '') +
    (r.tripsKnown
      ? ''
      : L(
          '未填出境记录，无法确认居住是否连续。',
          ' No absences were entered, so continuous residence cannot be confirmed.',
        )) +
    (r.passesKnown
      ? ''
      : L(
          '未填准证记录，无法判断有无可经部长同意计入的准证期间。',
          ' No passes were entered, so time on a pass that the Minister could count is unknown.',
        ))
  );
}

const residenceRules = (ctx: MyContext) =>
  ctx.L(
    `少于 ${v.shortAbsenceMonths.value} 个月的出境、因健康或为联邦或州服务的出境计入；凭准证居留的期间须部长同意，为教育或其他原因的长期出境须部长批准或指定，才计入。因此按永久居留期间计算，只有计入这些期间才满足时待确认。`,
    ` Absences under ${v.shortAbsenceMonths.value} months and those for health or federal or state service count. Time on a pass counts only with the Minister’s consent, and longer absences for education or any other reason only if the Minister approves or prescribes them, so permanent residence is used and the result needs confirmation when only those periods would meet it.`,
  );

function oath(ctx: MyContext): MyCheck {
  const { req, L } = ctx;
  const answer = req.citizenship?.renounceOtherNationality;
  return check(
    'my.cit.renunciation-oath',
    L('宣誓与放弃原国籍', 'Oath and giving up other nationality'),
    answer === undefined || answer === 'unsure' ? undefined : answer === 'yes',
    [
      fc('Art. 19(9) p46'),
      fc('附表一 p359'),
      fc('Art. 24(1) p49'),
      ref('SRC-516', 'p3'),
    ],
    L(
      '获证前须宣誓放弃对任何外国的一切效忠；宪法不承认双重国籍，自愿取得外国国籍可被褫夺。放弃原国籍的期限与证明方式未公布。',
      'Before the certificate is granted the applicant swears to renounce all allegiance to any other country. The Constitution does not recognise dual citizenship, and voluntarily acquiring another may lead to deprivation. No deadline or proof for renouncing the old nationality is published.',
    ),
    ['PD-418'],
  );
}

function amendmentInfo(ctx: MyContext, change: string): MyCheck {
  const { L } = ctx;
  const a = amendment.value;
  return info(
    'my.cit.constitution-amendment',
    L('2025 年宪法修正案', 'Constitution (Amendment) Act 2025'),
    amendment.sources,
    L(
      `Act A1752 已于 ${a.royalAssent} 御准、${a.gazetted} 刊宪，但法律库仍标"尚未生效"，生效日由最高元首另行公告；生效前已递交的申请按旧法处理。`,
      `Act A1752 received royal assent on ${a.royalAssent} and was gazetted on ${a.gazetted}, but the legal database still lists it as not yet in force; the King appoints the date. Applications pending before then are decided under the old text.`,
    ) + change,
    false,
    ['PD-417'],
  );
}

export function assessNaturalisation(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const n = v.naturalisation.value;
  const c = req.citizenship;
  const years = age(req.dateOfBirth, date);
  const adult = req.dateOfBirth && birthday(req.dateOfBirth, n.minAge);
  const ageCheck = check(
    'my.cit.age',
    L('申请日年龄', 'Age on the application date'),
    years === undefined ? undefined : years >= n.minAge,
    [fc('Art. 19(1) p44'), ref('SRC-512', 'Conditions')],
    L(
      `申请日须年满 ${n.minAge} 岁。`,
      `The applicant must be at least ${n.minAge} on the application date.`,
    ) +
      (adult && adult > date
        ? L(
            `${adult} 满 ${n.minAge} 岁。`,
            ` They turn ${n.minAge} on ${adult}.`,
          )
        : ''),
  );

  const r = residence(ctx, addYears(date, n.windowYears + 1));
  const test = (d: IsoDate) =>
    verdict(
      r,
      (s) =>
        daysIn(s, addYears(d, -n.windowYears), d) >=
          daysBetween(addYears(d, -n.residenceYears), d) &&
        fullyCovered(s, addMonths(d, -n.recentMonths), d),
    );
  const met = test(date);
  const start = latest(date, adult ?? date) as IsoDate;
  const first = answered(r)
    ? firstDay(start, addYears(date, n.windowYears), test)
    : undefined;
  const residenceCheck = check(
    'my.cit.residence',
    L('居住年限', 'Residence period'),
    met,
    [
      fc('Art. 19(3) p46'),
      fc('附表二第三部分 s.20 p372–373'),
      ref('SRC-512', 'Conditions；清单第 2 项'),
    ],
    L(
      `申请日前 ${n.windowYears} 年内须累计居住至少 ${n.residenceYears} 年，并包括紧接申请日前的 ${n.recentMonths} 个月。`,
      `At least ${n.residenceYears} years’ residence in the ${n.windowYears} years before applying, including the ${n.recentMonths} months immediately before.`,
    ) +
      residenceRules(ctx) +
      residenceText(ctx, r),
    consentPending(r) ? ['PD-413', 'PD-429'] : [],
  );

  const intent = c?.intendsToResidePermanently;
  const intentCheck = check(
    'my.cit.intent',
    L('永久居住意向', 'Intention to live in Malaysia permanently'),
    intent === undefined || intent === 'undecided'
      ? undefined
      : intent === 'yes',
    [fc('Art. 19(1)(a)(i) p44'), ref('SRC-512', 'Conditions')],
    L(
      '获证后须打算在马来西亚永久居住，由政府认可。',
      'The applicant must intend to live in Malaysia permanently if granted, to the Government’s satisfaction.',
    ),
  );

  const character = check(
    'my.cit.character',
    L('品格良好', 'Good character'),
    undefined,
    [fc('Art. 19(1)(b) p44'), ref('SRC-516', 'p2、p4')],
    L(
      '宪法未定义"berkelakuan baik"，由政府认定，并经移民局安全审查。',
      'The Constitution does not define "berkelakuan baik"; the Government decides, after Immigration security screening.',
    ) +
      (req.criminalRecord === 'convicted'
        ? L(
            '所填有刑事判决，可能影响认定。',
            ' A conviction is reported and may count against the application.',
          )
        : ''),
    ['PD-415'],
  );

  const malay = req.language?.malay;
  const language = check(
    'my.cit.malay-language',
    L('马来语知识', 'Knowledge of Malay'),
    undefined,
    [fc('Art. 19(1)(c) p44'), ref('SRC-516', 'p2')],
    L(
      '须有足够的马来语知识；国民登记局以马来语知识测试（UPBM）评估，形式、及格线与豁免未公开。',
      'Adequate knowledge of Malay is required. The National Registration Department assesses it with the Malay knowledge test (UPBM), whose format, pass mark and exemptions are not published.',
    ) +
      (malay
        ? L(
            `所填自评为${{ weak: '弱', moderate: '一般', good: '良好', 'very-good': '很好' }[malay]}。`,
            ` Self-rated ${{ weak: 'weak', moderate: 'moderate', good: 'good', 'very-good': 'very good' }[malay]}.`,
          )
        : ''),
    ['PD-414'],
  );

  const refs = c?.qualifyingReferees;
  const referees = check(
    'my.cit.referees',
    L('推荐人', 'Referees'),
    refs === undefined ? undefined : refs >= n.referees,
    [ref('SRC-512', 'Conditions；清单第 4 项')],
    L(
      `须有 ${n.referees} 名推荐人：年满 ${n.refereeMinAge} 岁的公民，认识申请人不少于 ${n.refereeKnownYears} 年，非亲属、非受雇者、非律师，递交时到场。`,
      `${n.referees} referees are needed: citizens aged ${n.refereeMinAge} or over who have known the applicant for at least ${n.refereeKnownYears} years, are not relatives, not paid and not lawyers, and attend the filing.`,
    ),
  );

  const documents = check(
    'my.cit.documents',
    L('护照记录与纳税证明', 'Passport records and tax evidence'),
    c?.completeTravelRecords && c.taxReturnsFiveYears ? true : undefined,
    [ref('SRC-512', '清单第 2、5 项及注 7')],
    L(
      `须本人到国民登记局填 Form C，交清单所列期间内的全部护照及现时护照；辅助材料包括近年所得税或雇主 BE 表、财产与贡献证明。宪法未设收入或财产条件；虚假陈述可被检控。`,
      `Apply in person at the National Registration Department with Form C, every passport held in the period the checklist sets and the current one. Supporting evidence includes recent income tax or employer BE forms, property and community contribution. The Constitution sets no income or property condition; false statements can be prosecuted.`,
    ),
    [],
    'factor',
  );

  const discretion = check(
    'my.cit.discretion',
    L('政府批准', 'Government approval'),
    undefined,
    [fc('Art. 19(1) p44'), ref('SRC-515', 'appeal 一问')],
    L(
      '宪法写政府"boleh"（可以）授予；部长的决定为终局，不能上诉，但可重新申请。处理时限未公布。',
      'The Constitution says the Government "boleh" (may) grant it. The Minister’s decision is final with no appeal, but a new application can be made. No processing time is published.',
    ),
    ['PD-416'],
  );

  const special = info(
    'my.cit.special-circumstances',
    L('特殊情形下的归化', 'Naturalisation in special circumstances'),
    [fc('Art. 19(2) p44'), ref('SRC-516', 'p2–3')],
    L(
      '宪法另允许政府在其认为合适的特殊情形下授予，条件文字相同；没有公开准则，执法机构诚信委员会建议制定标准作业程序。',
      'The Constitution also lets the Government grant it in special circumstances on the same wording. No criteria are published, and the Enforcement Agency Integrity Commission has recommended a standard procedure.',
    ),
    false,
    ['PD-413'],
  );

  const f = v.citizenshipFeesRm.value;
  const merdeka = c?.inFederationOnMerdekaDay;
  const certificate = merdeka
    ? f.naturalisationCertificateMerdeka
    : f.naturalisationCertificate;
  const fees = [
    withFee(
      info(
        'my.cit.application-fee',
        L('申请登记费', 'Application fee'),
        v.citizenshipFeesRm.sources,
        L('递交时缴付。', 'Paid when filing.'),
      ),
      f.application,
    ),
    withFee(
      info(
        'my.cit.certificate-fee',
        L('公民证书费', 'Citizenship certificate fee'),
        v.citizenshipFeesRm.sources,
        L(
          `获批后缴付；${f.merdekaDay} 默迪卡日在联邦者为 RM${f.naturalisationCertificateMerdeka}，否则 RM${f.naturalisationCertificate}。`,
          `Paid on approval: RM${f.naturalisationCertificateMerdeka} for those in the Federation on Merdeka Day, ${f.merdekaDay}, otherwise RM${f.naturalisationCertificate}.`,
        ),
        merdeka !== undefined,
        ['PD-419'],
      ),
      certificate,
    ),
  ];

  const d = v.deprivation.value;
  const afterGrant = info(
    'my.cit.after-grant',
    L('归化后的维持', 'Keeping citizenship after naturalisation'),
    v.deprivation.sources,
    L(
      `获证后 ${d.withinYears} 年内在任何国家被判监禁不少于 ${d.prisonMonths} 个月或罚款不少于 RM${d.fineRm} 且未获赦免，或通常在境外连续居住 ${d.abroadYears} 年而未每年向领馆登记，政府可褫夺公民身份。`,
      `Citizenship may be removed for a prison sentence of at least ${d.prisonMonths} months or a fine of at least RM${d.fineRm} in any country within ${d.withinYears} years of the grant without a free pardon, or for ${d.abroadYears} continuous years living abroad without registering yearly at a consulate.`,
    ),
  );

  const checks = [
    ageCheck,
    residenceCheck,
    intentCheck,
    character,
    language,
    referees,
    oath(ctx),
    documents,
    discretion,
    special,
    ...fees,
    afterGrant,
    amendmentInfo(
      ctx,
      L(
        `生效后归化年龄将由 ${n.minAge} 岁降为 ${amendment.value.newMinAge} 岁。`,
        ` Once in force, the naturalisation age falls from ${n.minAge} to ${amendment.value.newMinAge}.`,
      ),
    ),
  ];
  return assemble(
    ctx,
    'my.cit.naturalisation',
    L(
      '公民身份：归化（宪法第 19 条）',
      'Citizenship: naturalisation (Article 19)',
    ),
    checks,
    {
      discretionary: true,
      time: timing(
        answered(r)
          ? (first ?? (met === undefined ? undefined : null))
          : undefined,
        date,
      ),
      assumptions:
        first && first > date
          ? [
              L(
                '最早日期假设保持永久居留，且除已录入的行程外不再出境。',
                'The earliest date assumes permanent residence continues and no absences beyond those entered.',
              ),
            ]
          : [],
    },
  );
}

export function assessWifeRegistration(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const w = v.wifeRegistration.value;
  const tie = req.family?.tie;
  const separated = req.family?.separatedOrDivorced === true;
  const category = check(
    'my.cit.category',
    L('公民之妻', 'Wife of a citizen'),
    tie === undefined
      ? undefined
      : tie !== 'wife-of-citizen'
        ? false
        : separated
          ? undefined
          : true,
    [fc('Art. 15(1) p39'), ref('SRC-513', 'Description')],
    L(
      '已婚女性，丈夫为马来西亚公民且婚姻仍存续；外籍丈夫没有登记途径，只能申请归化。',
      'A married woman whose husband is a Malaysian citizen, with the marriage subsisting. A foreign husband has no registration route and must apply for naturalisation.',
    ) +
      (separated
        ? L(
            '所填已分居或离婚：离婚后婚姻不再存续，不能按此条登记；只分居而婚姻仍存续的，宪法未另设条件。此项未区分两者，待确认。',
            ' A separation or divorce is reported: after a divorce the marriage no longer subsists and this route closes, while a separation alone sets no further condition; the answer does not say which.',
          )
        : ''),
    ['PD-405'],
  );
  const registration = marriageRegistration(
    ctx,
    'my.cit.marriage-registration',
    [fc('Art. 15(5) p39–40'), ref('SRC-513', 'Description；清单第 2(d) 项')],
  );
  const r = residence(ctx, addYears(date, w.residenceYears + 1));
  const test = (d: IsoDate) =>
    verdict(r, (s) => fullyCovered(s, addYears(d, -w.residenceYears), d));
  const met = test(date);
  const first = answered(r)
    ? firstDay(date, addYears(date, w.residenceYears), test)
    : undefined;
  const residenceCheck = check(
    'my.cit.residence',
    L('居住年限', 'Residence period'),
    met,
    [
      fc('Art. 15(1)(a) p39'),
      fc('附表二第三部分 s.20 p372–373'),
      ref('SRC-513', '清单第 2(a) 项及注 5'),
    ],
    L(
      `申请日前 ${w.residenceYears} 年须一直在马来西亚居住。宪法未写须先取得永久居留，但登记局清单把永久居留身份证列为必交。`,
      `Residence in Malaysia throughout the ${w.residenceYears} years before applying. The Constitution does not require permanent residence first, but the registration checklist lists the permanent resident identity card as mandatory.`,
    ) +
      residenceRules(ctx) +
      residenceText(ctx, r),
    consentPending(r) ? ['PD-413', 'PD-418', 'PD-429'] : [],
  );
  const intent = req.citizenship?.intendsToResidePermanently;
  const checks: MyCheck[] = [
    category,
    registration,
    residenceCheck,
    check(
      'my.cit.intent',
      L('永久居住意向', 'Intention to live in Malaysia permanently'),
      intent === undefined || intent === 'undecided'
        ? undefined
        : intent === 'yes',
      [fc('Art. 15(1)(a) p39')],
      L(
        '须打算在马来西亚永久居住，由政府认可。',
        'The applicant must intend to live in Malaysia permanently, to the Government’s satisfaction.',
      ),
    ),
    check(
      'my.cit.character',
      L('品格良好', 'Good character'),
      undefined,
      [fc('Art. 15(1)(b) p39')],
      L(
        '宪法未定义"berkelakuan baik"，由政府认定。',
        'The Constitution does not define "berkelakuan baik"; the Government decides.',
      ) +
        (req.criminalRecord === 'convicted'
          ? L(
              '所填有刑事判决，可能影响认定。',
              ' A conviction is reported and may count against the application.',
            )
          : ''),
      ['PD-415'],
    ),
    oath(ctx),
    info(
      'my.cit.entitlement',
      L('登记的性质', 'Nature of registration'),
      [fc('Art. 15(1) p39'), ref('SRC-513', 'Conditions、Procedure')],
      L(
        '政府认可居住与品格后，申请人"berhak"（有权）登记，不属一般裁量；夫妻须一同到国民登记局递交 Form A。',
        'Once the Government is satisfied about residence and character, the applicant is "berhak" (entitled) to registration rather than subject to general discretion. Both spouses file Form A together at the National Registration Department.',
      ),
    ),
  ];
  const f = v.citizenshipFeesRm.value;
  checks.push(
    withFee(
      info(
        'my.cit.application-fee',
        L('申请登记费', 'Application fee'),
        v.citizenshipFeesRm.sources,
        L('递交时缴付。', 'Paid when filing.'),
      ),
      f.application,
    ),
    withFee(
      info(
        'my.cit.certificate-fee',
        L('公民证书费', 'Citizenship certificate fee'),
        v.citizenshipFeesRm.sources,
        L('获批后缴付。', 'Paid on approval.'),
      ),
      f.wifeCertificate,
    ),
    info(
      'my.cit.after-grant',
      L('登记后的维持', 'Keeping citizenship after registration'),
      [fc('Art. 26(2) p54'), fc('Art. 24(4) p51')],
      L(
        `婚姻自结婚日起 ${w.dissolutionYears} 年内因死亡以外原因解除的，政府可褫夺公民身份；因与非公民结婚而取得外国国籍的也可被褫夺。`,
        `Citizenship may be removed if the marriage ends other than by death within ${w.dissolutionYears} years of the marriage date, or if she acquires another country’s citizenship by marrying a non-citizen.`,
      ),
    ),
    amendmentInfo(
      ctx,
      L(
        '生效后须有足够的马来语知识，褫夺的两年改自取得公民身份之日起算。',
        ' Once in force, adequate knowledge of Malay is required and the two-year deprivation period runs from the date of registration.',
      ),
    ),
  );
  return assemble(
    ctx,
    'my.cit.wife-registration',
    L(
      '公民身份：公民之妻登记（宪法第 15(1) 条）',
      'Citizenship: registration as a citizen’s wife (Article 15(1))',
    ),
    checks,
    {
      time: timing(
        answered(r)
          ? (first ?? (met === undefined ? undefined : null))
          : undefined,
        date,
      ),
      assumptions:
        first && first > date
          ? [
              L(
                '最早日期假设保持永久居留，且除已录入的行程外不再出境。',
                'The earliest date assumes permanent residence continues and no absences beyond those entered.',
              ),
            ]
          : [],
    },
  );
}

export function assessChildRegistration(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const under = v.childRegistration.value.underAge;
  const tie = req.family?.tie;
  const years = age(req.dateOfBirth, date);
  const deadline = req.dateOfBirth && birthday(req.dateOfBirth, under);
  const f = v.citizenshipFeesRm.value;
  const checks: MyCheck[] = [
    check(
      'my.cit.category',
      L('公民的子女', 'Child of a citizen'),
      tie === undefined ? undefined : tie === 'child-of-citizen',
      [fc('Art. 15(2) p39'), ref('SRC-514', 'Conditions')],
      L(
        '父母至少一方现为（或去世时为）马来西亚公民。',
        'At least one parent is, or was at death, a Malaysian citizen.',
      ),
    ),
    check(
      'my.cit.age',
      L('申请日年龄', 'Age on the application date'),
      years === undefined ? undefined : years < under,
      v.childRegistration.sources,
      L(
        `须在未满 ${under} 岁时递交。`,
        `The application must be made before age ${under}.`,
      ) +
        (deadline
          ? L(`须在 ${deadline} 之前递交。`, ` Apply before ${deadline}.`)
          : ''),
    ),
    info(
      'my.cit.applicant',
      L('由谁申请', 'Who applies'),
      [ref('SRC-514', 'Conditions、Procedure')],
      L(
        '由父母或监护人以 Form B 申请，申请人与被登记人须一同到国民登记局。',
        'A parent or guardian applies with Form B, and both the applicant and the child attend the National Registration Department.',
      ),
    ),
    check(
      'my.cit.discretion',
      L('政府批准', 'Government approval'),
      undefined,
      [fc('Art. 15(2) p39'), ref('SRC-515', 'appeal 一问')],
      L(
        '宪法写政府"boleh"（可以）登记；部长的决定为终局，可重新申请。',
        'The Constitution says the Government "boleh" (may) register the child. The Minister’s decision is final, but a new application can be made.',
      ),
      ['PD-416'],
    ),
    info(
      'my.cit.special-circumstances',
      L('特殊情形下的子女登记', 'Registering a child in special circumstances'),
      [fc('Art. 15A p40'), ref('SRC-514', 'Perkara 15A Syarat')],
      L(
        `不符合第 15(2) 条的，政府也可在其认为合适的特殊情形下为未满 ${under} 岁者登记，须说明理由，由有亲属关系的父母或监护人申请。`,
        `Outside Article 15(2), the Government may register a person under ${under} in special circumstances it thinks fit; a related parent or guardian applies and gives the reasons.`,
      ),
    ),
    withFee(
      info(
        'my.cit.application-fee',
        L('申请登记费', 'Application fee'),
        v.citizenshipFeesRm.sources,
        L('递交时缴付。', 'Paid when filing.'),
      ),
      f.application,
    ),
    withFee(
      info(
        'my.cit.certificate-fee',
        L('公民证书费', 'Citizenship certificate fee'),
        v.citizenshipFeesRm.sources,
        L('获批后缴付。', 'Paid on approval.'),
      ),
      f.childCertificate,
    ),
    amendmentInfo(
      ctx,
      L(
        `生效后年龄上限由 ${under} 岁降为 ${amendment.value.newMinAge} 岁，登记的未成年人成年后须宣誓。`,
        ` Once in force, the age limit falls from ${under} to ${amendment.value.newMinAge}, and a minor registered must take the oath on reaching adulthood.`,
      ),
    ),
  ];
  return assemble(
    ctx,
    'my.cit.child-registration',
    L(
      '公民身份：公民子女登记（宪法第 15(2) 条）',
      'Citizenship: registration of a citizen’s child (Article 15(2))',
    ),
    checks,
    {
      discretionary: true,
      time: timing(
        years === undefined ? undefined : years < under ? date : null,
        date,
      ),
    },
  );
}
