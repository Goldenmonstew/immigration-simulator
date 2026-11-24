import type { CountryPathway } from './country-result';
import { addDays, addMonths } from './dates';
import {
  all,
  any,
  compare,
  p,
  reviewed,
  src,
  time,
} from './portugal-full-common';
import type { PtFullContext } from './portugal-full-common';
import {
  aimaFees,
  compliance,
  foreignLaw,
  generalRefusal,
  health,
  housing,
  isFreeMovement,
  means,
  renewalCrime,
  residenceReg,
} from './portugal-full-residence';
import type { PtPathway } from './portugal';
import type { PtInvestment } from './portugal-full-types';

const ariGuide = (locator: string) => src('SRC-126', locator);
const ariFaq = (locator: string) => src('SRC-481', locator);
const investmentLaw = () =>
  src(
    'SRC-123',
    'Lei 56/2023 arts. 42–44, 55',
    'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
  );

function investmentOption(
  ctx: PtFullContext,
  investment: Exclude<PtInvestment, { kind: 'legacy' }>,
) {
  const { check, L } = ctx;
  const { kind } = investment;
  if (kind === 'jobs' || kind === 'research' || kind === 'culture') {
    const parameter =
      kind === 'jobs'
        ? p.ariJobs
        : kind === 'research'
          ? p.ariResearchEur
          : p.ariCultureEur;
    const floor = parameter.value;
    const reduced = Math.round(floor * (1 - p.ariLowDensity.value.reduction));
    const reported = kind === 'jobs' ? investment.jobs : investment.eur;
    const minimum = compare(
      reported,
      (n) => n >= (investment.lowDensity ? reduced : floor),
    );
    const applies =
      investment.lowDensity === undefined &&
      reported !== undefined &&
      reported >= reduced &&
      reported < floor
        ? undefined
        : minimum;
    const qualification =
      kind === 'jobs' ? true : investment.recipientQualified;
    const names =
      kind === 'jobs'
        ? ['D06A', '创造就业', 'Job creation']
        : kind === 'research'
          ? ['D06B', '合资格科研投资', 'Qualifying research investment']
          : [
              'D06C',
              '艺术或文化遗产投资',
              'Art or cultural-heritage investment',
            ];
    const unit = kind === 'jobs' ? '' : 'EUR ';
    return check(
      names[0],
      all(applies, qualification),
      names[1],
      names[2],
      [
        ...parameter.sources,
        ...p.ariLowDensity.sources,
        residenceReg('DR 84/2007 arts. 65-A, 65-D'),
        src('SRC-490', 'Portaria 208/2017 arts. 1–2 and annex'),
      ],
      ['PD-393'],
      L(
        `标准门槛 ${unit}${floor}；经确认的低密度地区门槛 ${unit}${reduced}。`,
        `Standard minimum: ${unit}${floor}. Confirmed low-density minimum: ${unit}${reduced}.`,
      ),
    );
  }
  if (kind === 'fund') {
    const fund = p.ariFund.value;
    return check(
      'D06D',
      all(
        compare(investment.eur, (n) => n >= fund.eur),
        compare(investment.maturityYears, (n) => n >= fund.maturityYears),
        compare(investment.portugalShare, (n) => n >= fund.portugalShare),
        investment.portugueseLaw,
        compare(ctx.req.investment?.realEstateExposure, (value) => !value),
      ),
      '葡萄牙非房地产集合投资',
      'Non-real-estate collective investment governed by Portuguese law',
      [...p.ariFund.sources, residenceReg('DR 84/2007 art. 65-D(9)')],
      ['PD-393'],
      L(
        `转资至少 EUR ${fund.eur}，投资时剩余期限至少 ${fund.maturityYears} 年，至少 ${fund.portugalShare * 100}% 投向葡萄牙注册公司。`,
        `Transfer at least EUR ${fund.eur}; maturity at investment must be at least ${fund.maturityYears} years and at least ${fund.portugalShare * 100}% must be invested in Portuguese-registered companies.`,
      ),
    );
  }
  if (kind === 'company') {
    const company = p.ariCompany.value;
    const created = compare(
      investment.permanentJobsCreated,
      (n) => n >= company.permanentJobs,
    );
    const maintained = all(
      compare(investment.jobsMaintained, (n) => n >= company.maintainedJobs),
      compare(
        investment.permanentJobsMaintained,
        (n) => n >= company.permanentJobs,
      ),
    );
    const jobs =
      investment.transaction === 'incorporation'
        ? created
        : investment.transaction === 'capital-increase'
          ? any(created, maintained)
          : undefined;
    return check(
      'D06E',
      all(
        compare(investment.eur, (n) => n >= company.eur),
        investment.portugueseCompany,
        jobs,
        investment.jobPeriodConfirmed,
      ),
      '葡萄牙公司出资与合资格岗位',
      'Portuguese company capital and qualifying jobs',
      [...p.ariCompany.sources, residenceReg('DR 84/2007 art. 65-D(10)')],
      ['PD-393'],
      L(
        `出资至少 EUR ${company.eur}。新设或增资可用创造 ${company.permanentJobs} 个永久岗位；增资也可维持 ${company.maintainedJobs} 个岗位且其中至少 ${company.permanentJobs} 个永久岗位。请核实法定 ${company.jobYears} 年条款的适用。`,
        `Capital must be at least EUR ${company.eur}. Incorporation or a capital increase may qualify by creating ${company.permanentJobs} permanent jobs. A capital increase may also retain ${company.maintainedJobs} jobs, including at least ${company.permanentJobs} permanent jobs. Confirm application of the ${company.jobYears}-year requirement.`,
      ),
    );
  }
}

function legacyInvestment(
  ctx: PtFullContext,
  investment: Extract<PtInvestment, { kind: 'legacy' }>,
  renewing: boolean,
) {
  const { at, check, L } = ctx;
  const from = p.ariInvestmentReform.value;
  const original = investment.originalApplication;
  const potentialProtected =
    renewing ||
    investment.protectedProceeding === true ||
    (original && original < from);
  const verdict =
    at >= from &&
    !potentialProtected &&
    (investment.protectedProceeding === false || (original && original >= from))
      ? false
      : reviewed(investment.transition);
  return check(
    'D09',
    verdict,
    '旧资本或房产投资的过渡手续',
    'Transitional procedure for legacy capital or property investment',
    [
      investmentLaw(),
      residenceReg('DR 1/2024 art. 5(5)–(8)'),
      src('SRC-486', 'DL 37-A/2024 art. 3'),
      ...p.ariHistoricalInvestment.sources,
    ],
    ['PD-394'],
    L(
      `自 ${from} 起，新申请不得依已废止的资本或房产方式办理。历史获批、在审或受保护手续的转换须确认。`,
      `From ${from}, new applications cannot use the repealed capital or property options. Confirm how the transition applies to historic grants, pending or protected proceedings.`,
    ),
  );
}

export function investmentResidence(
  ctx: PtFullContext,
  pilot: PtPathway,
  permanent: CountryPathway,
) {
  const { req, at, L, check, pathway, pilotChecks } = ctx;
  const r = req.residence;
  const e = req.investment;
  const card = req.permits.some(
    (c) => c.kind === 'golden-visa' && c.from <= at,
  );
  const permanentCard = req.permits.some(
    (c) => c.kind === 'ari-permanent' && c.from <= at,
  );
  const operation =
    e?.operation ??
    (permanentCard ? 'replace-permanent' : card ? 'renew' : 'grant');
  const converting =
    operation === 'convert' || operation === 'replace-permanent';
  const renewing = operation === 'renew';
  const applicable = !isFreeMovement(ctx);
  const title = L('投资居留 ARI', 'Investment residence (ARI)');
  const id = pilot.id;
  const fees = p.aimaInvestmentFees.value;
  const fee = aimaFees(ctx, 'D-FEE', {
    entries: converting
      ? operation === 'convert'
        ? [['投资类永久卡', 'Permanent investment card', fees.permanent]]
        : [
            [
              '投资类永久卡换发',
              'Permanent investment card replacement',
              fees.replace,
            ],
          ]
      : [
          ['审理', 'Analysis', fees.analysis],
          renewing
            ? ['续期', 'Renewal', fees.renew]
            : ['首次发卡', 'Initial card', fees.grant],
        ],
    sources: p.aimaInvestmentFees.sources,
  });
  if (converting) {
    const replacing = operation === 'replace-permanent';
    const link = replacing ? permanentCard : card;
    const qualified = replacing
      ? reviewed(r?.statusCancellation)
      : permanent.status === 'MET'
        ? true
        : permanent.status === 'NOT_MET'
          ? false
          : undefined;
    const conversion = check(
      'D10',
      all(link, qualified),
      replacing
        ? '已有投资类永久居留及正式注销决定'
        : '投资类永久居留及普通永久条件',
      replacing
        ? 'Existing permanent investment residence and formal cancellation decision'
        : 'Permanent investment residence and the permanent-residence requirements',
      [
        residenceReg('DR 84/2007 art. 65-K'),
        foreignLaw('art. 80, p67'),
        investmentLaw(),
        ariFaq('FAQ 28–29'),
      ],
      ['PD-394'],
      replacing
        ? undefined
        : L(
            '适用 B 路径的永久居留检查；投资类永居适用专门的缺席规则。',
            'See the permanent-residence pathway for the applicable checks. Permanent investment residence has special absence rules.',
          ),
    );
    const waitUntil =
      link && !replacing && permanent.status === 'FUTURE'
        ? permanent.earliestDate
        : undefined;
    return pathway(id, title, waitUntil ? [] : [conversion], {
      applicable,
      waits: waitUntil ? [{ check: conversion, until: waitUntil }] : [],
      notes: [
        check(
          'D10-TERMS',
          reviewed(e?.permanentTerms),
          '批件所列持续投资义务',
          'Continuing investment obligations under the decision',
          [residenceReg('DR 84/2007 art. 65-K'), ariFaq('FAQ 26–29')],
          ['PD-394'],
        ),
        fee,
      ],
    });
  }
  const investment = e?.investment;
  const legacy =
    investment?.kind === 'legacy'
      ? legacyInvestment(ctx, investment, renewing)
      : undefined;
  const validInvestment =
    investment && investment.kind !== 'legacy' ? investment : undefined;
  const resource = means(
    ctx,
    'D02',
    foreignLaw('arts. 77(1)(d)–(f), 90-A(1)(a), pp65–66, 72'),
  );
  const accommodation = housing(ctx, 'D02-HOUSING', [
    foreignLaw('arts. 77(1)(e), 78(2)(b)'),
    ariFaq('FAQ 12, 23'),
  ]);
  const coverage = health(ctx, 'D04-HEALTH', [
    residenceReg('DR 84/2007 arts. 65-D/E'),
    ariGuide('Documentos e requisitos gerais'),
    ariFaq('FAQ 11, 23'),
  ]);
  const complianceEvidence = all(
    compliance(r?.tax),
    compliance(r?.socialSecurity),
  );
  const recordAge = p.ariDocumentAge.value;
  const recordTimely = compare(
    e?.foreignRecordDate,
    (date) => date <= at && date >= addMonths(at, -recordAge.criminalMonths),
  );
  const taxTimely = compare(
    e?.accompanyingTaxEvidenceDate,
    (date) => date <= at && date >= addDays(at, -recordAge.complianceDays),
  );
  const documents = check(
    'D04',
    all(
      e?.documentsReady,
      r?.travelDocumentValid,
      r?.criminalRecordAvailable,
      complianceEvidence,
      renewing ? true : all(recordTimely, taxTimely),
    ),
    '身份、刑事证明、税社保及投资材料',
    'Identity, criminal, compliance and investment documents',
    [
      ...p.ariDocumentAge.sources,
      residenceReg('DR 84/2007 arts. 65-D/E'),
      src('SRC-472', 'DR 4/2022 arts. 65-A, 65-D/E'),
      ariFaq('FAQ 11–13, 23'),
    ],
    ['PD-392'],
    L(
      `首次材料参考：其他长期居住国超过 ${recordAge.otherCountryYears} 年，刑事证明 ${recordAge.criminalMonths} 个月内，税社保证明 ${recordAge.complianceDays} 天内。具体国别和起算日请核对当期要求。`,
      `Initial checklist reference: other countries of residence for more than ${recordAge.otherCountryYears} year, criminal evidence within ${recordAge.criminalMonths} months and compliance certificates within ${recordAge.complianceDays} days. Confirm countries and the procedural date for your case.`,
    ),
  );
  const family = e?.holder === 'family';
  if (renewing) {
    const maintenance = e?.investmentReview
      ? reviewed(e.investmentReview)
      : e?.maintenance === 'maintained'
        ? true
        : e?.maintenance === 'ended'
          ? false
          : undefined;
    const timing =
      !card && !permanentCard ? { status: 'UNKNOWN' as const } : undefined;
    const timeChecks = card
      ? pilotChecks(pilot, ['D07-WINDOW', 'D07-STAY'])
      : [];
    if (!timeChecks.length)
      timeChecks.push(
        check(
          'D07-STAY',
          undefined,
          'ARI 卡与最低在葡停留',
          'ARI card and minimum stay',
          time.goldenVisaLaterPeriodDays.sources,
          ['PD-148', 'PD-392'],
          pilot.summary,
        ),
      );
    return pathway(
      id,
      title,
      [
        resource,
        accommodation,
        coverage,
        check(
          'D07',
          maintenance,
          '续期时仍维持合资格投资',
          'Continued qualifying investment at renewal',
          [
            ...time.goldenVisaInvestmentYears.sources,
            residenceReg('DR 84/2007 art. 65-E'),
            ariFaq('FAQ 23–28'),
          ],
          ['PD-394'],
          L(
            `一般投资维持期自获批起至少 ${time.goldenVisaInvestmentYears.value} 年；继续凭 ARI 续期须维持合格投资。`,
            `The general holding period is at least ${time.goldenVisaInvestmentYears.value} years from grant. Continued ARI renewal requires qualifying investment to be maintained.`,
          ),
        ),
        renewalCrime(ctx, 'D08-CRIME'),
        generalRefusal(ctx, 'D08-GENERAL'),
        check(
          'D08',
          all(
            complianceEvidence,
            compare(req.renewal?.residencePermitCancelled, (value) => !value),
            family
              ? all(e.relationshipContinues, e.familyEvidenceAccepted)
              : e?.holder === 'investor'
                ? true
                : undefined,
          ),
          '续期合规、许可与家属持续资格',
          'Renewal compliance, current title and continued family qualification',
          [
            foreignLaw('arts. 78, 81, 98, 90-A(2)'),
            residenceReg('DR 84/2007 art. 65-E'),
            ariFaq('FAQ 11–12, 23–25'),
          ],
          ['PD-392', 'PD-395'],
        ),
        ...(legacy ? [legacy] : []),
      ],
      { applicable, pilot, timing, timeChecks, notes: [documents, fee] },
    );
  }

  const entryLimit = p.ariEntryDays.value;
  const entryTiming =
    e?.firstEntry !== undefined && e.regularizedOn !== undefined
      ? e.regularizedOn >= e.firstEntry &&
        e.regularizedOn <= at &&
        e.regularizedOn <= addDays(e.firstEntry, entryLimit)
      : undefined;
  const legalEntry = e?.entryReview
    ? reviewed(e.entryReview)
    : e?.entry === 'irregular'
      ? false
      : family && e?.entry
        ? true
        : e?.entry === 'schengen-visa'
          ? entryTiming
          : undefined;
  const conviction =
    e?.qualifyingConviction === false
      ? true
      : e?.qualifyingConviction === true
        ? compare(
            e.convictionMaximumYears,
            (n) => n <= p.ariPunishableYears.value,
          )
        : undefined;
  const invested = compare(e?.investedOn, (date) => date <= at);
  const newRegime = at >= p.ariInvestmentReform.value;
  return pathway(
    id,
    title,
    [
      check(
        'D01',
        all(
          legalEntry,
          e?.lawfullyInPortugal,
          r?.travelDocumentValid,
          compare(e?.visaRefusalGround, (value) => !value),
          family
            ? all(
                e.sponsorAriValid,
                e.familyEvidenceAccepted,
                e.relationshipContinues === false ? false : true,
              )
            : e?.holder === 'investor'
              ? true
              : undefined,
        ),
        family ? '合法入境及 ARI 家庭团聚资格' : '身份、合法入境及办理期限',
        family
          ? 'Lawful entry and ARI family reunification eligibility'
          : 'Identity, lawful entry and regularisation deadline',
        family
          ? [
              foreignLaw(
                'Lei 61/2025 art. 2 (Lei 23/2007 arts. 98(1), (3)(c), 99, 103(2)), pp4–6',
              ),
              ariFaq('FAQ 11'),
            ]
          : [
              ...p.ariEntryDays.sources,
              foreignLaw('arts. 4(2)(a), 77(1)(b)–(c), 90-A(1)(a)–(c)'),
              ariGuide('Documentos e requisitos gerais'),
            ],
        family ? ['PD-392'] : ['PD-391'],
        family
          ? L(
              '核对合法入境、有效证件、担保人的有效 ARI 和家庭团聚资格。ARI 家属适用法定等待期豁免。',
              'Verify lawful entry, valid documents, a valid sponsor ARI and eligibility for family reunification. ARI family members are exempt from the statutory waiting period.',
            )
          : L(
              `条文列有效申根签证及自首次入境起 ${entryLimit} 天办理；免签和首入境起点须向 AIMA 确认。`,
              `The law lists a valid Schengen visa and regularisation within ${entryLimit} days of first entry. Confirm visa-free cases and the starting event with AIMA.`,
            ),
      ),
      resource,
      accommodation,
      check(
        'D02-SOCIAL',
        compare(e?.socialRegistration, (value) => value !== 'missing'),
        '按需办理社保登记',
        'Social security registration where required',
        [foreignLaw('art. 77(1)(f), p65')],
        ['PD-385'],
      ),
      check(
        'D03',
        all(
          conviction,
          reviewed(e?.admissionReview),
          reviewed(e?.healthReview),
          compare(e?.domesticImmigrationAlert, (value) => !value),
          compare(e?.euRestrictiveMeasure, (value) => !value),
        ),
        '首次刑事、入境、公序、安全、卫生及制裁审查',
        'Initial criminal, entry, public order, security, health and sanctions checks',
        [
          ...p.ariPunishableYears.sources,
          foreignLaw('art. 77(1)(g)–(j), (2)–(7)'),
          investmentLaw(),
          ...p.generalRefusal.sources,
        ],
        ['PD-388', 'PD-391'],
      ),
      generalRefusal(ctx, 'D03-GENERAL'),
      coverage,
      ...(family
        ? []
        : legacy
          ? [legacy]
          : [
              check(
                'D05',
                newRegime
                  ? all(
                      invested,
                      e?.commercialVehicleQualified,
                      e?.investmentEvidenceAccepted,
                      compare(e?.realEstateExposure, (value) => !value),
                    )
                  : undefined,
                '投资已完成、渠道合规且无房地产用途',
                'Completed investment through a qualifying vehicle with no real-estate exposure',
                [investmentLaw(), residenceReg('DR 84/2007 arts. 65-A, 65-D')],
                ['PD-393', 'PD-394'],
              ),
              ...(validInvestment && newRegime
                ? [investmentOption(ctx, validInvestment)].filter(
                    (c) => c !== undefined,
                  )
                : [
                    check(
                      'D06',
                      undefined,
                      '合资格投资方式',
                      'Qualifying investment option',
                      [investmentLaw()],
                      ['PD-393', 'PD-394'],
                    ),
                  ]),
            ]),
    ],
    { applicable, notes: [documents, fee] },
  );
}
