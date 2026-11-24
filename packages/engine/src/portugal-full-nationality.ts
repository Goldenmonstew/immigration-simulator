import { addDays, addMonths, addYears } from './dates';
import {
  all,
  any,
  compare,
  fullContext,
  nationalityLaw,
  p,
  reviewed,
  src,
  time,
} from './portugal-full-common';
import type { PtFullContext, Verdict } from './portugal-full-common';
import type {
  PtNationalityCrime,
  PtNationalityEvidence,
} from './portugal-full-types';
import { evaluatePortugal } from './portugal';
import type { PtPathway } from './portugal';
import type { CountryPathway } from './country-result';
import type { IsoDate } from './types';

const newLaw = (locator: string) => src('SRC-120', locator);
const oldLaw = (locator: string) => src('SRC-121', locator);
const regulation = (locator: string) => src('SRC-470', locator);

export function basicPortugueseLevel(level: string | undefined): Verdict {
  const levels = ['A1', p.basicPortuguese.value, 'B1', 'B2', 'C1', 'C2'];
  return compare(
    level,
    (value) => levels.indexOf(value) >= levels.indexOf(p.basicPortuguese.value),
  );
}

function oldPortuguese(
  e: PtNationalityEvidence | undefined,
  portugueseNational: Verdict,
): Verdict {
  const presumption = all(
    portugueseNational,
    e?.bornInOfficialPortugueseCountry,
  );
  return any(presumption, oldPortugueseProof(e?.language));
}

function oldPortugueseProof(proof: PtNationalityEvidence['language']): Verdict {
  if (proof?.kind === 'none')
    return proof.accommodationRequested ? undefined : false;
  switch (proof?.kind) {
    case 'accepted':
    case 'ciple':
    case 'pan':
      return true;
    case 'recognized-ple-test':
    case 'foreign-portuguese-school':
      return proof.recognized;
    case 'portuguese-school':
      return all(
        proof.recognized,
        compare(
          proof.schoolYears,
          (n) => n >= p.oldPortugueseEvidence.value.schoolYears,
        ),
      );
    case 'pla':
    case 'basic-course':
      return all(proof.recognized, basicPortugueseLevel(proof.level));
    case 'dual-certificate':
      return all(
        proof.recognized,
        compare(
          proof.courseHours,
          (n) => n >= p.oldPortugueseEvidence.value.dualCertificateHours,
        ),
      );
    default:
      return undefined;
  }
}

function nationalityCrime(
  crime: PtNationalityCrime | undefined,
  old: boolean,
): Verdict {
  if (!crime) return undefined;
  if (crime.review) return reviewed(crime.review);
  if (crime.record === 'none') return true;
  if (crime.record !== 'conviction' || crime.suspendedOrRehabilitationUnclear)
    return undefined;
  if (
    crime.final === false ||
    crime.imprisonment === false ||
    crime.punishableInPortugal === false
  )
    return true;
  if (old) {
    if (
      crime.years !== undefined &&
      crime.years < p.oldNationalityPrisonYears.value
    )
      return true;
    return crime.final &&
      crime.imprisonment &&
      crime.punishableInPortugal &&
      crime.years !== undefined
      ? false
      : undefined;
  }
  if (
    crime.effective === false ||
    crime.category === 'other' ||
    (crime.years !== undefined && crime.years <= p.nationalityPrisonYears.value)
  )
    return true;
  // A conviction within the new statute creates a rebuttable presumption.
  return undefined;
}

function nationalityFee(
  ctx: PtFullContext,
  id: string,
  at: IsoDate,
  stateless: Verdict,
  old: boolean,
) {
  const { check, L } = ctx;
  const adult = p.adultNationalityFee.value;
  const isMinor =
    ctx.req.birthDate && at < addYears(ctx.req.birthDate, p.adulthood.value);
  const fee =
    stateless === undefined ||
    (stateless === false && isMinor) ||
    at < adult.from
      ? undefined
      : stateless
        ? p.statelessNationalityFee.value
        : adult.eur;
  const proof = ctx.req.nationality?.language;
  const exam =
    id === 'A11' && old && proof?.kind === 'ciple'
      ? L(
          ` CIPLE 公布价 EUR ${p.cipleFee.value}。`,
          ` Published CIPLE price: EUR ${p.cipleFee.value}.`,
        )
      : id === 'A11' &&
          old &&
          proof?.kind === 'pan' &&
          at >= p.panFees.value.from
        ? L(
            ` PaN 报名 EUR ${p.panFees.value.registration}，另有查阅及复核费，开放情况需核实。`,
            ` PaN registration is EUR ${p.panFees.value.registration}, with separate inspection and review fees; confirm availability.`,
          )
        : '';
  const detail =
    fee === undefined
      ? L(
          '尚无可确定的程序费。请核对申请版本、代表手续或无国籍资格。',
          'Confirm the law, any representation procedure and stateless recognition to identify the fee.',
        )
      : L(
          `国籍程序费 EUR ${fee}。考试、翻译及其他外部证明费用另计。`,
          `Nationality procedure fee: EUR ${fee}. Exams, translations and other external evidence may cost extra.`,
        );
  const feeDetail = detail + exam;
  return [
    check(
      `${id}-FEE`,
      fee === undefined ? undefined : true,
      '国籍程序费参考',
      'Nationality procedure fee',
      [
        ...(stateless === true
          ? p.statelessNationalityFee.sources
          : p.adultNationalityFee.sources),
        ...(exam
          ? proof?.kind === 'pan'
            ? p.panFees.sources
            : p.cipleFee.sources
          : []),
      ],
      ['PD-384'],
      feeDetail,
    ),
    ...(id === 'A11' && !old
      ? [
          check(
            'A11-EXAM-FEE',
            undefined,
            '新制考试费用',
            'New examination costs',
            [
              newLaw('art. 6(1)(c)–(d)'),
              src('SRC-127', '2026-10-29 Conselho de Ministros, n.º 2'),
            ],
            ['PD-380'],
            L(
              '新制考试的收费和可能的等效证明待公布。',
              'The examination fees and any accepted equivalent evidence still require published rules.',
            ),
          ),
        ]
      : []),
  ];
}

export function naturalisation(
  ctx: PtFullContext,
  pilot: PtPathway,
): CountryPathway {
  const { req, at, L, check, pathway, pilotChecks } = ctx;
  const law = nationalityLaw(at, req.pendingApplication);
  const filing =
    req.pendingApplication && req.pendingApplication <= at
      ? req.pendingApplication
      : at;
  const e = req.nationality;
  const old = law === 'old';
  const stateless = !old && req.route === 'stateless';
  const portugueseNational =
    e?.officialPortugueseCountryNational ?? req.route === 'cplp';
  const timeChecks = pilotChecks(pilot, ['A02', 'A02-CURRENT-ALTERNATIVE']);
  if (!timeChecks.length)
    timeChecks.push(
      check(
        'A02',
        undefined,
        '合法居留时间',
        'Qualifying legal residence',
        [newLaw('arts. 6, 15; LO 1/2026 art. 7'), oldLaw('arts. 6, 15')],
        ['PD-143'],
        pilot.summary,
      ),
    );
  const title = pilot.title;
  if (law === 'uncertain') {
    return pathway(
      pilot.id,
      title,
      [
        check(
          'A-VERSION',
          undefined,
          '递交时适用的国籍法',
          'Nationality law applicable at filing',
          [newLaw('LO 1/2026 arts. 7–8'), oldLaw('LO 1/2024 art. 9')],
          ['PD-143'],
        ),
      ],
      { pilot, timing: { status: 'UNKNOWN' }, timeChecks },
    );
  }
  const adult = compare(
    req.birthDate,
    (date) => filing >= addYears(date, p.adulthood.value),
  );
  const notes = [
    check(
      'A11',
      e?.documentsReady,
      '出生登记、身份、居留与刑事记录材料',
      'Birth, identity, residence and criminal-record documents',
      [
        regulation('arts. 18–19, 25, 27, 37, 44'),
        src('SRC-485', 'art. 26'),
        newLaw('art. 6(11)–(12)'),
      ],
      ['PD-384', 'PD-382'],
    ),
    ...nationalityFee(
      ctx,
      'A11',
      filing,
      stateless ? (e?.statelessRecognized === true ? true : undefined) : false,
      old,
    ),
  ];

  const checks = old
    ? [
        check(
          'A12',
          any(
            adult,
            req.emancipation === 'recognized'
              ? req.emancipationFrom === undefined
                ? true
                : req.emancipationFrom <= filing &&
                  req.emancipationFrom < p.emancipationReform.value
              : req.emancipation === 'none'
                ? false
                : undefined,
          ),
          '成年或当时有效的 emancipação',
          'Adult or valid emancipation at filing',
          [
            oldLaw('art. 6(1)(a), p7'),
            ...p.adulthood.sources,
            ...p.emancipationReform.sources,
          ],
          ['PD-143'],
        ),
        check(
          'A13',
          oldPortuguese(e, portugueseNational),
          '旧制葡语证明',
          'Portuguese evidence under the earlier law',
          [
            oldLaw('art. 6(1)(c), p8'),
            ...p.oldPortugueseEvidence.sources,
            ...p.basicPortuguese.sources,
            regulation('art. 25(9), p42'),
          ],
          ['PD-380'],
          portugueseNational &&
            e?.bornInOfficialPortugueseCountry === undefined &&
            e?.language?.kind === 'none'
            ? L(
                '请确认申请人是否出生于以葡萄牙语为官方语言的国家。',
                'Confirm whether the applicant was born in a country where Portuguese is an official language.',
              )
            : undefined,
        ),
        check(
          'A14',
          nationalityCrime(e?.crime, true),
          '旧制终局刑事判决',
          'Final convictions under the earlier law',
          p.oldNationalityPrisonYears.sources,
          ['PD-382'],
          e?.crime?.years === undefined
            ? undefined
            : L(
                `旧制门槛为符合条文的监禁刑至少 ${p.oldNationalityPrisonYears.value} 年。`,
                `The earlier threshold is a qualifying prison sentence of at least ${p.oldNationalityPrisonYears.value} years.`,
              ),
        ),
        check(
          'A15',
          reviewed(e?.security),
          '国家安全与国防审查',
          'National security and defence review',
          [oldLaw('art. 6(1)(e), p8')],
          ['PD-382'],
        ),
        check(
          'A15-SUSPENSION',
          e?.sanctions === 'clear' ? true : undefined,
          '旧制限制措施程序中止',
          'Suspension of the earlier procedure for restrictive measures',
          [oldLaw('art. 13(2)–(4), p10')],
          ['PD-382'],
          e?.sanctions === 'barred'
            ? L(
                '正式适用限制措施期间，程序中止。',
                'The procedure is suspended while the restrictive measure applies.',
              )
            : undefined,
        ),
      ]
    : [
        ...(stateless
          ? [
              check(
                'A-STATELESS',
                e?.statelessRecognized,
                '法定无国籍身份',
                'Recognised stateless status',
                [newLaw('art. 6(3), (12), p3')],
                ['PD-384'],
              ),
            ]
          : [
              check('A01', adult, '成年', 'Adult status', [
                newLaw('art. 6(1)(a), pp2, 9–10'),
                ...p.adulthood.sources,
              ]),
            ]),
        check(
          'A03',
          portugueseNational && !e?.languagePresumptionDisputed
            ? true
            : e?.newLanguageAccepted,
          '新制葡语能力',
          'Portuguese language under the current law',
          [newLaw('art. 6(1)(c), (10), pp2–3')],
          ['PD-380'],
          !portugueseNational &&
            e?.language &&
            e.newLanguageAccepted === undefined
            ? L(
                '旧制葡语证明能否用于新制仍待确认。',
                'Acceptance of this earlier language evidence under the current law needs confirmation.',
              )
            : undefined,
        ),
        check(
          'A04',
          e?.cultureAccepted,
          '文化、历史与国家象征',
          'Culture, history and national symbols',
          [newLaw('art. 6(1)(c), p2')],
          ['PD-380'],
        ),
        check(
          'A05',
          e?.civicsAccepted,
          '公民权利、义务与政治组织',
          'Civic rights, duties and political institutions',
          [newLaw('art. 6(1)(d), p2')],
          ['PD-380'],
        ),
        check(
          'A06',
          e?.declaration === 'completed'
            ? true
            : e?.declaration === 'refused'
              ? false
              : undefined,
          '民主法治庄严声明',
          'Solemn declaration on democratic rule of law',
          [newLaw('art. 6(1)(e), p2')],
          ['PD-381'],
        ),
        check(
          'A07',
          nationalityCrime(e?.crime, false),
          '新制刑事障碍',
          'Criminal bar under the current law',
          p.nationalityPrisonYears.sources,
          ['PD-382'],
          e?.crime?.years === undefined
            ? undefined
            : L(
                `法律筛查符合指定罪类的终局实刑超过 ${p.nationalityPrisonYears.value} 年；达到门槛仍可进入反驳推定程序。`,
                `The law screens for final, effective imprisonment exceeding ${p.nationalityPrisonYears.value} years for specified offences. The presumption can be challenged.`,
              ),
        ),
        check(
          'A08',
          reviewed(e?.security),
          '国家安全与国防审查',
          'National security and defence review',
          [newLaw('art. 6(1)(g), p2')],
          ['PD-382'],
        ),
        check(
          'A09',
          reviewed(e?.sanctions),
          '联合国或欧盟限制措施',
          'UN or EU restrictive measures',
          [newLaw('art. 6(1)(h), p2')],
          ['PD-382'],
        ),
        ...(stateless
          ? []
          : [
              check(
                'A10',
                undefined,
                '新制生计能力',
                'Ability to support oneself under the current law',
                [
                  newLaw('art. 6(1)(i), p2'),
                  src('SRC-127', '2026-10-29 Conselho de Ministros, n.º 2'),
                ],
                ['PD-383'],
                L(
                  '公布法律未给出适用的金额、期间、扣除方式或证据标准。',
                  'The published statute leaves amounts, duration, deductions and acceptable evidence unresolved.',
                ) +
                  (e?.meansSources?.length && e.meansEvidenceAvailable
                    ? L(
                        ' 已记录收入来源和现有证明。',
                        ' Income sources and available evidence have been recorded.',
                      )
                    : ''),
              ),
            ]),
      ];
  // The time-only result can also report a fresh-law projection when the
  // earlier application was short. Keep that projection on its own check.
  const timing =
    old && timeChecks.length > 1 ? { status: 'NOT_MET' as const } : undefined;
  const [qualifyingTime, alternative] = timeChecks;
  const adultOn = req.birthDate && addYears(req.birthDate, p.adulthood.value);
  const waitingForAge =
    adultOn &&
    adultOn > at &&
    !req.pendingApplication &&
    checks[0].status === 'NOT_MET' &&
    (checks[0].id === 'PT-A01' || checks[0].id === 'PT-A12');
  const current = pathway(
    pilot.id,
    title,
    waitingForAge ? checks.slice(1) : checks,
    {
      pilot,
      timing,
      timeChecks: [qualifyingTime],
      waits: waitingForAge ? [{ check: checks[0], until: adultOn }] : [],
      notes: alternative ? [alternative, ...notes] : notes,
    },
  );
  const projectedAt = current.earliestDate;
  if (
    old &&
    waitingForAge &&
    current.status === 'FUTURE' &&
    projectedAt &&
    projectedAt >= time.lawInForce.value
  ) {
    const projectionRequest = { ...req, simulationDate: projectedAt };
    const projected = naturalisation(
      fullContext(projectionRequest),
      evaluatePortugal(projectionRequest).pathways[0],
    );
    return {
      ...projected,
      status: projected.status === 'MET' ? 'FUTURE' : projected.status,
      earliestDate:
        projected.status === 'MET' ? projectedAt : projected.earliestDate,
      summary:
        L(
          `尚未递交。预计成年日 ${projectedAt} 将适用新国籍法，下列条件按该日复算（SRC-120 第 7–8 条）。`,
          `No application is on file. The new nationality law will apply on the projected adulthood date of ${projectedAt}. The checks below use that date (SRC-120, arts. 7–8).`,
        ) +
        ' ' +
        projected.summary,
    };
  }
  return current;
}

export function partnerNationality(ctx: PtFullContext) {
  const { req, at, L, check, pathway } = ctx;
  const e = req.partner;
  const n = req.nationality;
  const law = nationalityLaw(at, e?.pendingApplication);
  const old = law === 'old';
  const filing = e?.pendingApplication ?? at;
  const title = L(
    '与葡萄牙公民结婚或为事实伴侣取得国籍',
    'Nationality by marriage or de facto partnership',
  );
  const id = 'PT-PARTNER-NATIONALITY';
  if (law === 'uncertain')
    return pathway(id, title, [
      check(
        'G-VERSION',
        undefined,
        '声明时适用的国籍法',
        'Nationality law applicable at declaration',
        [newLaw('LO 1/2026 arts. 7–8'), oldLaw('LO 1/2024 art. 9')],
        ['PD-143'],
      ),
    ]);
  const lawSrc = old ? oldLaw : newLaw;
  const since = e?.relationshipFrom;
  const eligibleOn =
    since && addDays(addYears(since, p.relationshipYears.value), 1);
  const duration = compare(eligibleOn, (date) => filing >= date);
  const portugueseSince = e?.partnerPortugueseSince;
  const citizen =
    e?.portuguesePartner === false
      ? false
      : (compare(portugueseSince, (date) => date <= filing) ??
        e?.portuguesePartner);
  const citizenshipTiming = all(
    citizen,
    portugueseSince &&
      since &&
      (portugueseSince <= since ||
        filing > addYears(portugueseSince, p.relationshipYears.value))
      ? true
      : undefined,
  );
  const relationship = all(e?.current, duration, citizenshipTiming);
  const civil = e?.kind === 'civil-partnership';
  const noRelationship = e?.kind === 'none';
  const knownRelationship = civil || e?.kind === 'marriage';
  const exemptionByTime = compare(since, (from) =>
    old
      ? filing >= addYears(from, p.oldOppositionYears.value.relationship)
      : filing > addYears(from, p.oppositionYears.value.relationship),
  );
  const exception =
    e?.current === true && citizen === true
      ? any(e.commonPortugueseChild, exemptionByTime)
      : undefined;
  const connection = exception === true ? true : reviewed(e?.connectionReview);
  const service =
    !old && exception === true
      ? true
      : e?.serviceReview
        ? reviewed(e.serviceReview)
        : e?.foreignService === 'none' ||
            e?.foreignService === 'technical-or-compulsory'
          ? true
          : undefined;
  const conviction = nationalityCrime(n?.crime, old);
  const oppositionPeriod = old
    ? p.oldOppositionYears.value.period
    : p.oppositionYears.value.period;
  const main = check(
    civil ? 'G02' : 'G01',
    noRelationship
      ? false
      : !knownRelationship
        ? undefined
        : civil
          ? all(relationship, e?.courtRecognition)
          : all(relationship, e?.registrationAccepted),
    civil ? '事实伴侣年限与法院认定' : '婚姻或事实伴侣资格与年限',
    civil
      ? 'De facto partnership duration and judicial recognition'
      : 'Qualifying relationship and duration',
    [lawSrc(civil ? 'art. 3(3)' : 'art. 3(1)–(2)'), regulation('art. 14')],
    ['PD-399'],
    L(
      `声明时关系须仍持续且超过 ${p.relationshipYears.value} 年。登记、法院认定或伴侣后取得葡籍的个案须核对。`,
      `The relationship must still subsist at declaration and exceed ${p.relationshipYears.value} years. Check registration, judicial recognition or later acquisition of Portuguese nationality where relevant.`,
    ),
  );
  const waitingForRelationship =
    !e?.pendingApplication &&
    eligibleOn &&
    eligibleOn > at &&
    knownRelationship &&
    all(
      e?.current,
      citizenshipTiming,
      civil ? e?.courtRecognition : e?.registrationAccepted,
    ) === true;
  return pathway(
    id,
    title,
    [
      ...(waitingForRelationship ? [] : [main]),
      check(
        'G03-CRIME',
        conviction,
        old ? '旧制刑事异议' : '刑事实体障碍',
        old
          ? 'Criminal grounds for opposition under the earlier law'
          : 'Substantive criminal bar',
        [
          lawSrc(
            old ? 'art. 9(1)(b), (4), p9' : 'arts. 3(4), 6(1)(f), (14)–(16)',
          ),
        ],
        ['PD-382'],
      ),
      check(
        'G03-SECURITY',
        reviewed(n?.security),
        '国家安全与国防审查',
        'National security and defence review',
        [lawSrc(old ? 'art. 9(1)(d)' : 'arts. 3(4), 6(1)(g)')],
        ['PD-382'],
      ),
      check(
        'G03-SANCTIONS',
        old
          ? n?.sanctions === 'clear'
            ? true
            : undefined
          : reviewed(n?.sanctions),
        '限制措施审查',
        'Restrictive measures review',
        [lawSrc(old ? 'art. 13(2)–(4)' : 'arts. 3(4), 6(1)(h)')],
        ['PD-382'],
      ),
      check(
        'G04',
        connection,
        '实际联系及异议例外',
        'Effective links and the exception to opposition',
        [
          lawSrc(
            old ? 'arts. 9(1)(a), (2)–(3), 10(1)' : 'arts. 9(1)(a), (2), 10(1)',
          ),
          regulation('art. 56'),
        ],
        ['PD-399'],
        L(
          `检察院异议期自国籍取得登记起 ${oppositionPeriod} 年。异议例外及联系依所选法律版本判断。`,
          `The opposition period is ${oppositionPeriod} year(s) from registration of acquisition. The applicable law governs effective links and exceptions.`,
        ) +
          (e?.effectiveLinksEvidence && connection === undefined
            ? L(
                ' 已有联系证明，仍待个案判断。',
                ' Evidence of links is available for individual assessment.',
              )
            : ''),
      ),
      check(
        'G05',
        service,
        '外国公职或非义务军役异议',
        'Opposition based on foreign public service or voluntary military service',
        [lawSrc('art. 9(1)(c), (2)')],
        ['PD-399'],
      ),
    ],
    {
      waits: waitingForRelationship ? [{ check: main, until: eligibleOn }] : [],
      notes: [
        check(
          'G06',
          e?.documentsReady,
          '声明、出生、关系和刑事记录材料',
          'Declaration, birth, relationship and criminal-record documents',
          [
            regulation('arts. 14, 44'),
            src('SRC-483', 'Documentos necessários'),
          ],
          ['PD-399'],
        ),
        ...(civil
          ? [
              check(
                'G06-PARTNER-STATEMENT',
                compare(
                  e?.partnerStatementDate,
                  (date) =>
                    date <= filing &&
                    date >= addMonths(filing, -p.partnerStatementMonths.value),
                ),
                '事实伴侣近期声明',
                'Recent statement from the Portuguese partner',
                p.partnerStatementMonths.sources,
                ['PD-399'],
              ),
            ]
          : []),
        ...nationalityFee(ctx, 'G06', filing, false, old),
      ],
    },
  );
}
