import { addDays, addMonths, addYears, daysBetween } from './dates';
import { monthSpan } from './pilot';
import { all, compare, p, reviewed, src, time } from './portugal-full-common';
import type { PtFullContext, Verdict } from './portugal-full-common';
import { basicPortugueseLevel } from './portugal-full-nationality';
import type { PtPathway, PtTrip } from './portugal';
import type { PtResidenceEvidence } from './portugal-full-types';
import type { IsoDate } from './types';

export const foreignLaw = (locator: string) => src('SRC-123', locator);
export const residenceReg = (locator: string) => src('SRC-471', locator);
export const aimaPermanent = (locator: string) =>
  src(
    'SRC-126',
    locator,
    'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
  );
export const aimaLongTerm = (locator: string) =>
  src(
    'SRC-126',
    locator,
    'https://aima.gov.pt/pt/viver/aquisicao-do-estatuto-de-residente-de-longa-duracao-erld-art-125-o',
  );
export const isFreeMovement = (ctx: PtFullContext) =>
  ctx.req.route === 'eu' || ctx.req.route === 'eea';

export function means(
  ctx: PtFullContext,
  id: string,
  routeSource: ReturnType<typeof src>,
  standard?: 'permanent' | 'long-term' | 'employment-renewal',
) {
  const { req, at, L, check } = ctx;
  const e = req.residence?.means;
  const employment = standard === 'employment-renewal';
  const months = employment
    ? p.purposeMeans.value.ordinaryMonths
    : p.residenceMeansMonths.value;
  const coverage = employment
    ? e?.supportedMonths !== undefined && e.supportedMonths >= months
      ? true
      : undefined
    : standard
      ? compare(e?.supportedMonths, (n) => n >= months)
      : undefined;
  const solidarity =
    standard === 'long-term'
      ? compare(e?.solidarityReliance, (value) => !value)
      : true;
  const net = e?.confirmedMonthlyMinimumEur;
  const amount =
    net === undefined
      ? undefined
      : compare(e?.monthlyEligibleEur, (n) => n >= net);
  const confirmed = reviewed(e?.officialAssessment);
  const floor = p.minimumWage2026.value;
  const reference =
    e?.region &&
    e.otherAdults !== undefined &&
    e.dependantChildren !== undefined &&
    at >= floor.from &&
    at < floor.until
      ? (e.region === 'mainland'
          ? floor.mainland
          : e.region === 'madeira'
            ? p.madeiraMinimumWage.value
            : p.azoresMinimumWage.value) *
        (p.householdWeights.value.firstAdult +
          e.otherAdults * p.householdWeights.value.otherAdult +
          e.dependantChildren * p.householdWeights.value.dependant)
      : undefined;
  const referenceText =
    reference === undefined
      ? ''
      : L(
          ` 家庭名义月参考 EUR ${reference.toFixed(2)}；普通雇员扣社保示例 EUR ${(reference * (1 - p.employeeSocialSecurityRate.value)).toFixed(2)}。`,
          ` Nominal monthly household reference: EUR ${reference.toFixed(2)}. Ordinary employee example after social security: EUR ${(reference * (1 - p.employeeSocialSecurityRate.value)).toFixed(2)}.`,
        );
  const minimumText =
    net === undefined
      ? ''
      : L(
          ` 已确认的个案月净额门槛 EUR ${net.toFixed(2)}。`,
          ` Confirmed individual net monthly threshold: EUR ${net.toFixed(2)}.`,
        );
  const result =
    confirmed === false || coverage === false || solidarity === false
      ? false
      : confirmed === true
        ? true
        : e?.officialAssessment === 'pending' || !standard
          ? undefined
          : all(amount, coverage, solidarity, e?.stable);
  return check(
    id,
    result,
    '稳定生计与可计入资金',
    'Stable means and countable resources',
    [
      routeSource,
      ...p.householdWeights.sources,
      ...(standard && !employment
        ? p.residenceMeansMonths.sources
        : p.purposeMeans.sources),
      src('SRC-475', 'Montante / Forma de comprovar'),
      ...(reference === undefined
        ? []
        : [
            ...p.minimumWage2026.sources,
            ...p.employeeSocialSecurityRate.sources,
            ...(e?.region === 'madeira'
              ? p.madeiraMinimumWage.sources
              : e?.region === 'azores'
                ? p.azoresMinimumWage.sources
                : []),
          ]),
    ],
    ['PD-385', ...(id.startsWith('E') ? ['PD-395'] : [])],
    (employment
      ? L(
          `按已确认的个案净额门槛和稳定性核对。${months} 个月的覆盖可用于判定，较短期间须另行核实。`,
          `Use the confirmed individual net threshold and stability of resources. Evidence covering ${months} months can be assessed here. Confirm shorter periods individually.`,
        )
      : standard
        ? L(
            `资源须至少保障 ${months} 个月，并按个案核实可计收入、净额及稳定性。`,
            `Resources must cover at least ${months} months. Confirm countable income, net amounts and stability for this case.`,
          )
        : L(
            '按许可目的核对可用资源、收入证据与减免。',
            'Confirm available resources, income evidence and relief for the particular permit purpose.',
          )) +
      (standard === 'long-term'
        ? L(
            ' 须可维持生活而无须依赖团结子系统。',
            ' Resources must suffice without relying on the solidarity subsystem.',
          )
        : '') +
      referenceText +
      minimumText,
  );
}

export function housing(
  ctx: PtFullContext,
  id: string,
  sources: ReturnType<typeof src>[],
) {
  const evidence = ctx.req.residence?.accommodation;
  return ctx.check(
    id,
    evidence === 'documented' ? true : evidence === 'none' ? false : undefined,
    '葡萄牙住房与合法占用证明',
    'Portuguese accommodation and evidence of lawful occupancy',
    sources,
    ['PD-386'],
  );
}

export function health(
  ctx: PtFullContext,
  id: string,
  sources: ReturnType<typeof src>[],
) {
  const evidence = ctx.req.residence?.healthCoverage;
  return ctx.check(
    id,
    evidence === 'sns-proof' || evidence === 'valid-insurance'
      ? true
      : evidence === 'none'
        ? false
        : undefined,
    '有效医保或 SNS 覆盖证明',
    'Valid health insurance or proof of SNS coverage',
    sources,
    ['PD-390'],
  );
}

export function compliance(value: PtResidenceEvidence['tax']): Verdict {
  return value === 'compliant' ||
    value === 'recognized-arrangement' ||
    value === 'exempt'
    ? true
    : value === 'arrears'
      ? false
      : undefined;
}

function basicPortuguese(ctx: PtFullContext, id: string, longTerm: boolean) {
  const proof = ctx.req.residence?.language;
  const guideline = longTerm ? aimaLongTerm : aimaPermanent;
  let result: Verdict;
  switch (proof?.kind) {
    case 'accepted':
    case 'ciple':
    case 'portuguese-school':
      result = true;
      break;
    case 'pla':
      result = all(proof.recognized, basicPortugueseLevel(proof.level));
      break;
    case 'basic-course':
      result = proof.recognized === true ? true : undefined;
      break;
    case 'foreign-portuguese-school':
      result = !longTerm && proof.recognized === true ? true : undefined;
      break;
    case 'none':
      result = !longTerm && !proof.accommodationRequested ? false : undefined;
      break;
  }
  return ctx.check(
    id,
    result,
    '基础葡语证明',
    'Evidence of basic Portuguese',
    [
      foreignLaw(longTerm ? 'art. 126(1)(e), p101' : 'art. 80(1)(e), p67'),
      residenceReg(
        longTerm ? 'DR 84/2007 art. 74(1)(g)' : 'DR 84/2007 art. 64(1)(e)',
      ),
      guideline('Documentos necessários · português básico'),
      ...p.basicPortuguese.sources,
    ],
    ['PD-387'],
  );
}

export function generalRefusal(
  ctx: PtFullContext,
  id: string,
  permanent = false,
) {
  const e = ctx.req.residence?.generalRefusal;
  const bounds = p.generalRefusal.value;
  const noTrigger = all(
    compare(e?.sisAlert, (value) => !value),
    compare(e?.ucfeExclusion, (value) => !value),
    compare(
      e?.longestFinalPortuguesePrisonYears,
      (n) => n <= bounds.prisonYears,
    ),
    compare(
      e?.comparablePortugueseConvictions,
      (n) => n < bounds.repeatedSentences,
    ),
  );
  const result = e?.review
    ? reviewed(e.review)
    : permanent && noTrigger === false
      ? undefined
      : noTrigger;
  return ctx.check(
    id,
    result,
    'SIS、葡萄牙判刑与 UCFE 拒绝事由',
    'SIS, Portuguese convictions and UCFE grounds for refusal',
    [
      ...p.generalRefusal.sources,
      foreignLaw('Lei 62/2026 art. 2 (Lei 23/2007 arts. 81–82)'),
    ],
    ['PD-388'],
  );
}

function sentencing(ctx: PtFullContext, permanent: boolean): Verdict {
  const e = ctx.req.residence?.criminalSentence;
  if (
    e?.scope !== 'complete' ||
    (permanent && e.permanentWindowVerified !== true)
  )
    return undefined;
  const maximum = permanent
    ? p.permanentPrisonYears.value
    : p.renewalPrisonYears.value;
  if (!e.convictions) return compare(e.totalYears, (years) => years <= maximum);
  const from = addYears(ctx.at, -p.permanentCrimeWindowYears.value);
  let total = 0;
  let unresolved = false;
  for (const conviction of e.convictions) {
    if (conviction.date > ctx.at || (permanent && conviction.date < from))
      continue;
    if (conviction.fallsUnderPortugueseRule === false) continue;
    if (
      conviction.fallsUnderPortugueseRule !== true ||
      conviction.suspended === undefined ||
      (conviction.suspended &&
        conviction.expresslyCountedSuspendedOffence !== true)
    ) {
      unresolved = true;
    } else {
      total += conviction.years;
    }
  }
  return total > maximum ? false : unresolved ? undefined : true;
}

export function aimaFees(
  ctx: PtFullContext,
  id: string,
  fees: {
    entries: [string, string, number[]][];
    sources: ReturnType<typeof src>[];
    statutoryExemption?: Verdict;
  },
) {
  const { req, at, L, check } = ctx;
  const e = req.residence?.fees;
  const dates = p.aimaFeeDates.value;
  const confirmedExempt =
    fees.statutoryExemption === true || e?.exemption === 'confirmed';
  const fromTable = dates.from <= at && at < dates.until;
  const detail = confirmedExempt
    ? L(
        '已确认适用费目免缴。',
        'The applicable charges are confirmed as exempt.',
      )
    : !fromTable
      ? L(
          '评估日期没有对应的已归档 AIMA 费表。',
          'There is no archived AIMA fee table for the assessment date.',
        )
      : fees.entries
          .map(([zh, en, table]) => {
            const [left, right] = table;
            const applicable =
              e?.column === 'left'
                ? left
                : e?.column === 'right'
                  ? right
                  : undefined;
            const values =
              applicable === undefined
                ? `${left.toFixed(2)} / ${right.toFixed(2)}`
                : applicable.toFixed(2);
            return `${L(zh, en)} EUR ${values}`;
          })
          .join(' · ') +
        L(
          '。实际费目、渠道及叠加费用以 DUC 为准。',
          '. Confirm the applicable items, channel and combinations against the DUC payment notice.',
        );
  return check(
    id,
    confirmedExempt
      ? true
      : !fromTable ||
          e?.exemption === 'unresolved' ||
          (fees.statutoryExemption === undefined && id === 'C09-FEE') ||
          !e?.column ||
          !fees.entries.length
        ? undefined
        : e.paid,
    '费用与缴付情况',
    'Charges and payment status',
    [...fees.sources, ...p.aimaFeeDates.sources],
    ['PD-398'],
    detail,
  );
}

export function permanentResidence(ctx: PtFullContext, pilot: PtPathway) {
  const { req, L, check, pathway, pilotChecks } = ctx;
  const e = req.residence;
  const converting = req.investment?.operation === 'convert';
  const currentPermit = req.permits.some(
    (card) => card.kind === 'permanent' && card.from <= ctx.at,
  );
  const currentAri = req.permits.some(
    (card) => card.kind === 'ari-permanent' && card.from <= ctx.at,
  );
  const hasPermanent = currentPermit || currentAri;
  const operation =
    req.permanentOperation ?? (hasPermanent ? 'retain' : 'grant');
  const ari =
    currentAri ||
    converting ||
    req.permits.some(
      (card) =>
        card.kind === 'golden-visa' &&
        card.from <= ctx.at &&
        (!card.to || card.to >= ctx.at),
    );
  const fees = p.aimaOrdinaryFees.value;
  const investFees = p.aimaInvestmentFees.value;
  const cancellation = e?.statusCancellation
    ? reviewed(e.statusCancellation)
    : undefined;
  const documents = check(
    'B06',
    all(
      e?.travelDocumentValid,
      e?.criminalRecordAvailable,
      compliance(e?.tax),
      compliance(e?.socialSecurity),
    ),
    '旅行文件、刑事记录及税社保证明',
    'Travel document, criminal record, tax and social security evidence',
    [
      residenceReg('DR 84/2007 art. 64(1)(a), (d), (4)'),
      aimaPermanent('Documentos para o atendimento'),
    ],
    ['PD-388'],
  );
  const issues = pilotChecks(
    pilot,
    hasPermanent ? ['B07-ABSENCE'] : ['B01', 'B01-CANCELLATION-RISK'],
  );
  const fee = aimaFees(ctx, 'B07-FEE', {
    entries:
      operation === 'replace'
        ? [['换卡', 'Replacement', ari ? investFees.replace : fees.replace]]
        : ari
          ? [
              [
                '投资类永久卡',
                'Permanent investment card',
                investFees.permanent,
              ],
            ]
          : [
              ['审理', 'Analysis', fees.analysis],
              ['首次永久卡', 'First permanent card', fees.permanent],
            ],
    sources: ari ? p.aimaInvestmentFees.sources : p.aimaOrdinaryFees.sources,
  });
  if (operation !== 'grant')
    return pathway(
      pilot.id,
      pilot.title,
      [
        check(
          'B07',
          all(hasPermanent, cancellation),
          '永久许可持有及正式注销决定',
          'Permanent title and formal cancellation decision',
          [
            foreignLaw('arts. 76, 85, pp65, 69'),
            residenceReg('DR 84/2007 arts. 65, 65-K'),
          ],
          ['PD-146', 'PD-394'],
        ),
      ],
      {
        applicable: !isFreeMovement(ctx),
        notes: [
          ...issues,
          ...(operation === 'replace'
            ? [
                check(
                  'B07-REPLACE-DOCUMENTS',
                  all(e?.criminalRecordAvailable, e?.travelDocumentValid),
                  '永久卡换发资料',
                  'Permanent-card replacement evidence',
                  [
                    residenceReg('DR 84/2007 art. 65'),
                    aimaPermanent('Documentos'),
                  ],
                  ['PD-394'],
                ),
                fee,
              ]
            : []),
        ],
      },
    );

  const timeChecks = issues.length
    ? issues
    : [
        check(
          'B01',
          pilot.status === 'NOT_APPLICABLE' ? false : undefined,
          '合资格临时许可与持有期限',
          'Qualifying temporary title and holding period',
          time.permanentYears.sources,
          ['PD-145'],
          pilot.summary,
        ),
      ];
  const reviewCancellation =
    e?.statusCancellation ||
    (timeChecks[1]?.status !== undefined && timeChecks[1].status !== 'MET')
      ? [
          check(
            'B01-TITLE',
            cancellation,
            '许可有效性与注销',
            'Validity and cancellation of the title',
            [foreignLaw('arts. 80(1)(a), 85(1)–(2)')],
            ['PD-146'],
          ),
        ]
      : [];
  return pathway(
    pilot.id,
    L('葡萄牙永久居留', 'Portuguese permanent residence'),
    [
      ...reviewCancellation,
      check(
        'B02',
        sentencing(ctx, true),
        '葡萄牙居住期间刑期累计',
        'Cumulative sentence in the Portuguese residence window',
        [
          ...p.permanentCrimeWindowYears.sources,
          ...p.permanentPrisonYears.sources,
        ],
        ['PD-388'],
        L(
          `核对最近 ${p.permanentCrimeWindowYears.value} 年在葡居住期间的适用刑期。单一或累计超过 ${p.permanentPrisonYears.value} 年触发门槛。`,
          `Check qualifying sentences during the last ${p.permanentCrimeWindowYears.value} years of residence in Portugal. The threshold is more than ${p.permanentPrisonYears.value} year in a single sentence or cumulatively.`,
        ),
      ),
      means(ctx, 'B03', foreignLaw('art. 80(1)(c), p67'), 'permanent'),
      housing(ctx, 'B04', [
        foreignLaw('art. 80(1)(d), p67'),
        residenceReg('DR 84/2007 art. 64(1)(c)'),
      ]),
      basicPortuguese(ctx, 'B05', false),
      generalRefusal(ctx, 'B02-GENERAL', true),
    ],
    {
      pilot,
      timeChecks: timeChecks.slice(0, 1),
      notes: [...timeChecks.slice(1), documents, fee],
    },
  );
}

function regularLongTermAbsences(
  { req }: PtFullContext,
  at: IsoDate,
  residenceFrom?: IsoDate,
): Verdict {
  const window = addYears(at, -time.longTermYears.value);
  const start =
    residenceFrom && residenceFrom > window ? residenceFrom : window;
  const trips = req.trips.filter(
    (trip) =>
      trip.departed < at &&
      trip.returned > start &&
      !req.longTerm?.acceptedWorkPostings?.some(
        (posting) =>
          posting.departed === trip.departed &&
          posting.returned === trip.returned,
      ),
  );
  let total = 0;
  for (const trip of trips) {
    const from = trip.departed < start ? start : trip.departed;
    const to = trip.returned > at ? at : trip.returned;
    if (to >= addMonths(from, time.longTermSingleAbsenceMonths.value))
      return false;
    total += daysBetween(from, to);
  }
  const [low, high] = monthSpan(time.longTermTotalAbsenceMonths.value);
  return total <= low ? true : total > high ? false : undefined;
}

function blueCardTime(ctx: PtFullContext, at: IsoDate) {
  const e = ctx.req.longTerm?.blueCard;
  const rule = p.blueCard.value;
  const window = addYears(at, -rule.euYears);
  const trips = e?.euAbsences
    ?.filter((trip) => trip.departed < at && trip.returned > window)
    .map((trip) => ({
      departed: trip.departed < window ? window : trip.departed,
      returned: trip.returned > at ? at : trip.returned,
    }));
  const single = trips?.every(
    (trip) =>
      trip.returned < addMonths(trip.departed, rule.singleAbsenceMonths),
  );
  const total = trips?.reduce(
    (n, trip) => n + daysBetween(trip.departed, trip.returned),
    0,
  );
  const [minimum, maximum] = monthSpan(rule.totalAbsenceMonths);
  const totalOk =
    total === undefined
      ? undefined
      : total <= minimum
        ? true
        : total > maximum
          ? false
          : undefined;
  const old = at < rule.from;
  return old
    ? undefined
    : all(
        e?.issuedByPortugal,
        compare(
          e?.continuousPortugueseBlueCardFrom,
          (date) => at >= addYears(date, rule.portugalYears),
        ),
        compare(
          e?.continuousQualifyingEuFrom,
          (date) => at >= addYears(date, rule.euYears),
        ),
        e?.staysVerified === true ? true : undefined,
        single,
        totalOk,
      );
}

function longTermLoss(ctx: PtFullContext, hasStatus: boolean): Verdict {
  const { req, at } = ctx;
  const e = req.longTerm;
  if (!hasStatus) return false;
  if (e?.lossReview) return reviewed(e.lossReview);
  const issued = req.permits
    .filter((card) => card.kind === 'eu-long-term' && card.from <= at)
    .sort((a, b) => b.from.localeCompare(a.from))[0].from;
  if (e?.lossReason && e.lossReason !== 'none' && e.lossReason !== 'absence')
    return false;
  const portugalLimit = time.longTermLossYears.value;
  const euLimit =
    e?.formerBlueCard === true
      ? p.blueCard.value.lossEuMonths
      : time.longTermLossEuMonths.value;
  const breaches = (trips: PtTrip[], deadline: (date: IsoDate) => IsoDate) =>
    trips.some((trip) => {
      const start = trip.departed < issued ? issued : trip.departed;
      return (
        start < at && deadline(start) <= at && trip.returned > deadline(start)
      );
    });
  const portugal = breaches(req.trips, (d) => addYears(d, portugalLimit));
  const eu = breaches(e?.euAbsences ?? [], (d) => addMonths(d, euLimit));
  if (portugal || eu || e?.lossReason === 'absence')
    return e?.lossException === 'clear'
      ? true
      : e?.lossException === 'barred'
        ? false
        : undefined;
  if (
    e?.euAbsences === undefined &&
    breaches(req.trips, (d) => addMonths(d, time.longTermLossEuMonths.value))
  )
    return undefined;
  return e?.lossReason === 'none' ? true : undefined;
}

export function longTermResidence(ctx: PtFullContext, pilot: PtPathway) {
  const { req, at, L, check, pathway, pilotChecks } = ctx;
  const e = req.longTerm;
  const r = req.residence;
  const hasStatus = req.permits.some(
    (card) => card.kind === 'eu-long-term' && card.from <= at,
  );
  const operation = e?.operation ?? (hasStatus ? 'retain' : 'grant');
  const protectedStatus =
    e?.qualifyingProtectionGranted === true
      ? true
      : e?.qualifyingProtectionGranted === false || e?.basis === 'ordinary'
        ? false
        : undefined;
  const fees = p.aimaLongTermFees.value;
  const fee = aimaFees(ctx, 'C09-FEE', {
    entries:
      operation === 'replace'
        ? [['换卡', 'Replacement card', fees.card]]
        : [
            ['分析', 'Analysis', fees.analysis],
            ['发卡', 'Card issue', fees.card],
          ],
    sources: p.aimaLongTermFees.sources,
    statutoryExemption: protectedStatus,
  });
  const resource = means(
    ctx,
    'C04',
    foreignLaw('art. 126(1)(b), (6), p101'),
    'long-term',
  );
  const coverage = health(ctx, 'C05', [
    foreignLaw('art. 126(1)(c), p101'),
    residenceReg('DR 84/2007 art. 74(1)(d)'),
    aimaLongTerm('Documentos necessários'),
  ]);
  const accommodation = housing(ctx, 'C06', [
    foreignLaw('art. 126(1)(d), p101'),
    residenceReg('DR 84/2007 art. 74(1)(c)'),
  ]);
  const documents = check(
    'C09',
    all(
      r?.travelDocumentValid,
      compliance(r?.tax),
      compliance(r?.socialSecurity),
      reviewed(e?.memberStateChecks),
    ),
    '旅行文件、税社保及成员国核验',
    'Travel documentation, compliance and member-state verification',
    [
      foreignLaw('arts. 129(2)–(4), 130, p102'),
      residenceReg('DR 84/2007 art. 74'),
    ],
    ['PD-389'],
  );
  if (operation === 'recover') {
    return pathway(
      pilot.id,
      pilot.title,
      [
        check(
          'C10',
          compare(e?.lossReason, (reason) => reason === 'absence'),
          '仅因法定缺席丧失身份',
          'Status lost only because of a statutory absence',
          [
            foreignLaw('art. 131(4)–(5), p104'),
            ...p.longTermRecoveryDecisionMonths.sources,
          ],
          ['PD-147'],
          L(
            `符合缺席恢复分支的申请，法定决定时间为 ${p.longTermRecoveryDecisionMonths.value} 个月。`,
            `The statutory decision period for this absence-based recovery application is ${p.longTermRecoveryDecisionMonths.value} months.`,
          ),
        ),
        resource,
        coverage,
        accommodation,
      ],
      { applicable: !isFreeMovement(ctx), notes: [documents, fee] },
    );
  }
  if (operation !== 'grant')
    return pathway(
      pilot.id,
      pilot.title,
      [
        check(
          'C10',
          longTermLoss(ctx, hasStatus),
          '长期居民身份保持及例外',
          'Retention of long-term resident status and exceptions',
          [
            foreignLaw('arts. 129(9), 130(2), 131(1)–(6), pp102–103'),
            ...p.blueCard.sources,
          ],
          ['PD-147', 'PD-389'],
        ),
      ],
      {
        applicable: !isFreeMovement(ctx),
        notes: [
          ...(hasStatus ? pilotChecks(pilot, ['C10-PILOT-ABSENCE']) : []),
          ...(operation === 'replace' ? [documents, fee] : []),
        ],
      },
    );

  const blue = e?.basis === 'blue-card';
  const protection = e?.basis === 'international-protection';
  const protectionEligibleOn =
    e?.protectionApplicationDate &&
    addDays(addYears(e.protectionApplicationDate, time.longTermYears.value), 1);
  const protectionFacts = all(
    e?.qualifyingProtectionGranted,
    e?.protectionContinuityVerified,
    regularLongTermAbsences(ctx, at, e?.protectionApplicationDate),
  );
  const selectedTime = blue
    ? check(
        'C01',
        compare(e?.blueCard?.issuedByPortugal, (value) => value),
        '合资格的葡萄牙蓝卡身份',
        'Qualifying Portuguese EU Blue Card status',
        [foreignLaw('arts. 121-I, 125–126'), ...p.blueCard.sources],
        ['PD-389'],
      )
    : protection
      ? check(
          'C01',
          all(
            protectionFacts,
            compare(protectionEligibleOn, (date) => at >= date),
          ),
          '获保护申请起算的连续合法居留',
          'Continuous lawful residence from the successful protection application',
          [foreignLaw('arts. 125, 126(2), (4)–(5), pp100–101')],
          ['PD-145', 'PD-147'],
          L(
            '须核对最终获保护的申请起点、期间连续性及出境。',
            'Verify the application that led to protection, the continuity of residence and absences.',
          ),
        )
      : undefined;
  const rule = p.blueCard.value;
  const card = e?.blueCard;
  const blueEligibleOn =
    card?.continuousPortugueseBlueCardFrom && card.continuousQualifyingEuFrom
      ? [
          addYears(card.continuousPortugueseBlueCardFrom, rule.portugalYears),
          addYears(card.continuousQualifyingEuFrom, rule.euYears),
        ].sort()[1]
      : undefined;
  const blueCheck = blue
    ? check(
        'C03',
        blueCardTime(ctx, at),
        '蓝卡欧盟累计及葡萄牙蓝卡年限',
        'EU Blue Card qualifying residence and Portuguese Blue Card period',
        p.blueCard.sources,
        ['PD-389'],
        L(
          `核对欧盟 ${rule.euYears} 年、紧接申请前持葡萄牙蓝卡 ${rule.portugalYears} 年，离开欧盟单次少于 ${rule.singleAbsenceMonths} 个月且合计不超过 ${rule.totalAbsenceMonths} 个月。混合许可须确认其可计时间。`,
          `Check ${rule.euYears} EU years, ${rule.portugalYears} immediately preceding years on a Portuguese Blue Card, and absences from the EU shorter than ${rule.singleAbsenceMonths} months each and no more than ${rule.totalAbsenceMonths} in total. Confirm how mixed permits count.`,
        ),
      )
    : undefined;
  const waits = [];
  if (
    blueCheck &&
    blueEligibleOn &&
    blueEligibleOn > at &&
    at >= rule.from &&
    blueCardTime(ctx, blueEligibleOn) === true
  ) {
    waits.push({ check: blueCheck, until: blueEligibleOn });
  }
  if (
    protection &&
    selectedTime &&
    protectionEligibleOn &&
    protectionEligibleOn > at &&
    protectionFacts === true &&
    regularLongTermAbsences(
      ctx,
      protectionEligibleOn,
      e?.protectionApplicationDate,
    ) === true
  ) {
    waits.push({ check: selectedTime, until: protectionEligibleOn });
  }
  const category = check(
    'C01-CATEGORY',
    compare(e?.currentCategory, (category) => category === 'qualifying'),
    '申请时属于合资格的第三国居留类别',
    'Qualifying third-country residence category on application',
    [foreignLaw('art. 125(1)–(2), pp100–101')],
    ['PD-147'],
  );
  const baseTime = pilotChecks(pilot, [
    'C01',
    'C01-SINGLE-ABSENCE',
    'C01-TOTAL-ABSENCE',
  ]);
  if (!baseTime.length)
    baseTime.push(
      check(
        'C01',
        undefined,
        '连续合法居留时间',
        'Continuous lawful residence',
        time.longTermYears.sources,
        ['PD-147'],
        pilot.summary,
      ),
    );
  return pathway(
    pilot.id,
    pilot.title,
    [
      category,
      ...(selectedTime && !waits.some(({ check }) => check === selectedTime)
        ? [selectedTime]
        : []),
      ...(protection
        ? [
            check(
              'C02',
              reviewed(e?.protectionWithdrawal),
              '国际保护撤销或不续予',
              'Withdrawal or non-renewal of international protection',
              [foreignLaw('art. 127(3), p101; Lei 27/2008 art. 41(1)(a)–(b)')],
              ['PD-147'],
            ),
          ]
        : []),
      ...(blueCheck && !waits.some(({ check }) => check === blueCheck)
        ? [blueCheck]
        : []),
      resource,
      coverage,
      accommodation,
      basicPortuguese(ctx, 'C07', true),
      check(
        'C08',
        reviewed(e?.publicOrder),
        '公序与公共安全',
        'Public order and public security',
        [foreignLaw('art. 127(1)–(2), p101')],
        ['PD-388'],
      ),
    ],
    {
      applicable: !isFreeMovement(ctx),
      waits,
      ...(selectedTime ? {} : { pilot, timeChecks: baseTime }),
      notes: [documents, fee],
    },
  );
}

export function renewalCrime(ctx: PtFullContext, id: string) {
  const e = ctx.req.renewal;
  return ctx.check(
    id,
    all(
      sentencing(ctx, false),
      compare(e?.contumacia, (value) => value !== 'active'),
      reviewed(e?.publicOrder),
      compare(e?.euRestrictiveMeasure, (value) => !value),
      e?.servingSentence
        ? compare(e.expulsionOrdered, (value) => !value)
        : true,
    ),
    '续期刑期、公序、安全、制裁与 contumácia',
    'Renewal sentences, public order, security, sanctions and contumácia',
    [
      ...p.renewalPrisonYears.sources,
      foreignLaw('arts. 77(3), 78(2)(d), (3)–(5), 79, pp66–67'),
    ],
    ['PD-388'],
  );
}

export function ordinaryRenewal(ctx: PtFullContext) {
  const { req, at, L, check, pathway } = ctx;
  const e = req.renewal;
  const r = req.residence;
  const date = e?.filedOn ?? at;
  const card = req.permits
    .filter(
      (card) =>
        (card.kind === 'temporary' || card.kind === 'study') &&
        card.from <= date,
    )
    .sort((a, b) => b.from.localeCompare(a.from))[0];
  const opens = card?.to && addDays(card.to, -time.renewalWindowDays.value);
  const deadline =
    card?.to && addDays(card.to, -time.renewalDeadlineDays.value);
  const inWindow =
    opens && deadline ? date >= opens && date <= deadline : undefined;
  const late = deadline && date > deadline;
  const lateAccepted = late ? e?.lateSubmissionAccepted : false;
  const permitUsable = all(
    compare(e?.residencePermitCancelled, (value) => !value),
    e?.servingSentence ? compare(e.expulsionOrdered, (value) => !value) : true,
  );
  const valid = all(permitUsable, late ? lateAccepted : inWindow);
  const state = !card
    ? 'NOT_MET'
    : valid === true
      ? 'MET'
      : valid === undefined
        ? 'UNKNOWN'
        : opens && date < opens && !e?.filedOn && permitUsable !== false
          ? permitUsable === true
            ? 'FUTURE'
            : 'UNKNOWN'
          : 'NOT_MET';
  const purpose =
    e?.purpose === 'study'
      ? e.studyInterruptionAccepted === true
        ? true
        : all(
            e.purposeEvidence,
            e.studyEnrolled,
            e.studyProgress,
            e.feesAndInternshipEvidence,
          )
      : e?.purpose && e.purpose !== 'other'
        ? e.purposeEvidence
        : undefined;
  const fees = e?.purpose === 'blue-card' ? p.aimaBlueFees : p.aimaOrdinaryFees;
  const notes = [
    ...(e?.receiptIssuedOn
      ? [
          check(
            'E01-RECEIPT',
            e.receiptIssuedOn <= at &&
              at <=
                (e.receiptExtendedThrough ??
                  addDays(e.receiptIssuedOn, p.renewalReceiptDays.value)),
            '续期回执的效力期限',
            'Validity period of the renewal receipt',
            p.renewalReceiptDays.sources,
            ['PD-145'],
          ),
        ]
      : []),
    ...(e?.releasedOn && e.filedOn
      ? [
          check(
            'E01-RELEASE',
            e.filedOn >= e.releasedOn &&
              e.filedOn <= addDays(e.releasedOn, p.renewalReleaseDays.value),
            '出狱后续期的免罚期限',
            'Post-release renewal deadline for the fine exception',
            p.renewalReleaseDays.sources,
            ['PD-395'],
          ),
        ]
      : []),
    check(
      'E06-DOCUMENTS',
      all(r?.travelDocumentValid, r?.criminalRecordAvailable),
      '旅行文件和葡萄牙犯罪记录查询',
      'Travel document and Portuguese criminal-record check',
      [residenceReg('DR 84/2007 art. 63(1), (15)')],
      ['PD-395'],
    ),
    aimaFees(ctx, 'E07', {
      entries: [
        ['分析', 'Analysis', fees.value.analysis],
        ['续卡', 'Renewal card', fees.value.renew],
      ],
      sources: fees.sources,
    }),
  ];
  const window = check(
    'E01',
    !card ? false : state === 'UNKNOWN' ? undefined : valid,
    '临时许可及续期窗口',
    'Temporary title and renewal window',
    [
      foreignLaw('arts. 75, 78(1), (7), 79, 81-A, pp65–69'),
      ...time.renewalDeadlineDays.sources,
      src(
        'SRC-472',
        'DR 9/2018 art. 2 (DR 84/2007 art. 63(16))',
        'https://files.diariodarepublica.pt/1s/2018/09/17500/0471804757.pdf',
      ),
    ],
    ['PD-145', 'PD-149'],
    opens && deadline
      ? L(
          `按卡面日期的常规窗口为 ${opens} 至 ${deadline}。逾期或例外请核对正式受理。`,
          `The ordinary window for this card is ${opens} to ${deadline}. Verify formal acceptance for late filings and exceptions.`,
        )
      : undefined,
  );
  return pathway(
    'PT-TEMPORARY-RENEWAL',
    L('一般临时居留续期', 'Ordinary temporary residence renewal'),
    [
      means(
        ctx,
        'E02',
        foreignLaw('art. 78(2)(a), p66'),
        e?.purpose === 'employment' ? 'employment-renewal' : undefined,
      ),
      housing(ctx, 'E03', [
        foreignLaw('art. 78(2)(b), p66'),
        residenceReg('DR 84/2007 art. 63(1)(c)'),
      ]),
      check(
        'E04',
        all(compliance(r?.tax), compliance(r?.socialSecurity)),
        '税务与社保合规',
        'Tax and social security compliance',
        [
          foreignLaw('art. 78(2)(c), p66'),
          residenceReg('DR 84/2007 art. 63(3)–(4)'),
        ],
        ['PD-395'],
      ),
      renewalCrime(ctx, 'E05'),
      generalRefusal(ctx, 'E05-GENERAL'),
      check(
        'E06',
        purpose,
        '维持原许可目的及相应证明',
        'Continuing to meet the original permit purpose',
        [
          foreignLaw('arts. 78(2), 91(1)(d)'),
          residenceReg('DR 84/2007 art. 63(1)–(11), (15)'),
        ],
        ['PD-395'],
      ),
      ...(e?.purpose === 'study'
        ? [
            health(ctx, 'E06-STUDY-HEALTH', [
              residenceReg('DR 84/2007 art. 63'),
              foreignLaw('art. 91(1)(d)'),
            ]),
          ]
        : []),
    ],
    {
      applicable: !isFreeMovement(ctx),
      timing: {
        status: state,
        earliestDate: state === 'FUTURE' ? opens || undefined : undefined,
      },
      timeChecks: [window],
      notes,
    },
  );
}
