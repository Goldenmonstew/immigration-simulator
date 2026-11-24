import { addMonths, addYears, daysBetween, fullYears } from './dates';
import { monthSpan } from './pilot';
import { all, any, compare, p, reviewed, src } from './portugal-full-common';
import type { PtFullContext, Verdict } from './portugal-full-common';
import type { PtFreeMovementEvidence } from './portugal-full-types';

const law = (locator: string) => src('SRC-478', locator);

function familyEligibility(
  ctx: PtFullContext,
  e?: PtFreeMovementEvidence,
  join = true,
): Verdict {
  const kind = e?.relationship;
  const relation =
    kind === 'descendant'
      ? any(
          compare(
            ctx.req.birthDate,
            (date) =>
              ctx.at < addYears(date, p.freeMovementDescendantAge.value),
          ),
          e?.dependant,
        )
      : kind === 'ascendant'
        ? e?.dependant
        : kind === 'spouse' || kind === 'partner'
          ? true
          : kind === 'other-family'
            ? e?.relationshipVerified === true
              ? true
              : undefined
            : undefined;
  return all(
    relation,
    e?.relationshipVerified,
    e?.sponsorEligible,
    join ? e?.accompaniesOrJoins : true,
  );
}

function freeMovementTime(ctx: PtFullContext) {
  const { req, at } = ctx;
  const e = req.freeMovement;
  const from = e?.continuousResidenceFrom;
  const limits = p.freeMovementAbsence.value;
  if (e?.expulsionExecuted === true) return false;
  if (!from) return undefined;
  if (at < addYears(from, p.freeMovementYears.value)) return false;

  const trips = (
    e?.absences ??
    req.trips.map((t) => ({ ...t, reason: undefined, accepted: undefined }))
  ).filter((trip) => trip.departed < at && trip.returned > from);
  let justified = 0;
  const ordinary: { from: string; to: string }[] = [];
  let uncertain = false;
  for (const trip of trips) {
    const start = trip.departed < from ? from : trip.departed;
    const end = trip.returned > at ? at : trip.returned;
    if (trip.reason === 'military' && trip.accepted === true) continue;
    if (end <= addMonths(start, limits.ordinaryMonths)) {
      ordinary.push({ from: start, to: end });
      continue;
    }
    if (trip.reason === 'ordinary' || trip.accepted === false) return false;
    if (
      trip.reason === 'justified' &&
      end > addMonths(start, limits.justifiedMonths)
    )
      return false;
    if (trip.reason === 'justified' && trip.accepted === true) justified += 1;
    else uncertain = true;
  }
  if (justified > limits.maxJustifiedAbsences) return false;
  // Leave borderline cumulative absences to the authority. Short trips
  // safely below the minimum number of days in six months can be counted.
  const [threshold] = monthSpan(limits.ordinaryMonths);
  const cumulativeUnclear =
    ordinary.length > 1 &&
    ordinary.some((trip) => {
      const end = addYears(trip.from, limits.ordinaryWindowYears);
      const days = ordinary.reduce((total, candidate) => {
        const from = candidate.from < trip.from ? trip.from : candidate.from;
        const to = candidate.to > end ? end : candidate.to;
        return total + (to > from ? daysBetween(from, to) : 0);
      }, 0);
      return (
        days > threshold &&
        ordinary.filter(
          (candidate) => candidate.from < end && candidate.to > trip.from,
        ).length > 1
      );
    });
  const continuity = uncertain || cumulativeUnclear ? undefined : true;
  const thirdCountry = e.applicant === 'third-country-family';
  const joint =
    thirdCountry && e.basis !== 'retained-family' ? e.livedWithSponsor : true;
  return all(
    continuity,
    joint,
    compare(e.expulsionExecuted, (value) => !value),
  );
}

function historicalBasis(ctx: PtFullContext) {
  const e = ctx.req.freeMovement;
  if (e?.historicalBasisReview) return reviewed(e.historicalBasisReview);
  if (e?.identityAtEntryValid === false) return undefined; // Arts. 4(4), 21 allow other proof.
  const insurance =
    e?.healthInsuranceRequired === false
      ? true
      : e?.healthInsuranceRequired
        ? e.healthInsuranceCovered
        : undefined;
  const basis = e?.residenceBasis;
  const facts =
    basis === 'worker' || basis === 'self-employed'
      ? true
      : basis === 'student'
        ? all(e?.enrolledInRecognizedSchool, e?.sufficientResources, insurance)
        : basis === 'self-sufficient'
          ? all(e?.sufficientResources, insurance)
          : basis === 'retained-worker'
            ? e?.workerStatusRetained
            : basis === 'family'
              ? all(
                  e?.sponsorResidenceBasisEstablished,
                  familyEligibility(ctx, e),
                )
              : undefined;
  return all(e?.identityAtEntryValid, facts);
}

function retainFamily(
  e: PtFreeMovementEvidence | undefined,
  historical: Verdict,
): Verdict {
  if (!e?.retentionEvent) return undefined;
  if (
    (e.retentionEvent === 'death' || e.retentionEvent === 'departure') &&
    e.retainedAsSchoolChildOrCarer
  )
    return true;
  if (e.applicant === 'eu-eea-swiss') return historical;
  switch (e.retainedBasis) {
    case 'worker':
    case 'self-employed':
    case 'qualifying-household':
      return true;
    case 'resources-and-insurance':
      return all(e.sufficientResources, e.healthInsuranceCovered);
    case 'none':
      return false;
    default:
      return undefined;
  }
}

function earlyWorker(ctx: PtFullContext): Verdict {
  const { at, req } = ctx;
  const e = req.freeMovement?.earlyWorker;
  const rule = p.workerEarlyResidence.value;
  const residence = e?.continuousResidenceFrom;
  const work = e?.creditedWorkFrom;
  if (e?.reason === 'retirement') {
    const retirement = e.selfEmployedWithoutPension
      ? compare(
          req.birthDate,
          (date) => at >= addYears(date, rule.selfEmployedAge),
        )
      : e.retirementQualifies;
    const required = all(
      compare(
        residence,
        (date) => at > addYears(date, rule.retirementResidenceYears),
      ),
      compare(work, (date) => at >= addMonths(date, rule.workMonths)),
    );
    return all(retirement, any(e.portuguesePartnerException, required));
  }
  if (e?.reason === 'permanent-disability') {
    return any(
      e.portuguesePartnerException,
      e.occupationalBenefit,
      compare(
        residence,
        (date) => at > addYears(date, rule.disabilityResidenceYears),
      ),
    );
  }
  if (e?.reason === 'cross-border') {
    return all(
      e.otherMemberStateWork,
      e.returnsWeekly,
      compare(residence, (date) => at >= addYears(date, rule.crossBorderYears)),
      compare(work, (date) => at >= addYears(date, rule.crossBorderYears)),
    );
  }
  return undefined;
}

function earlyFamily(e: PtFreeMovementEvidence | undefined): Verdict {
  const worker = e?.earlyFamily;
  const death = worker?.deathDate;
  const priorResidence = death
    ? compare(
        worker?.workerResidenceFrom,
        (date) => death >= addYears(date, p.workerFamilyResidenceYears.value),
      )
    : undefined;
  return all(
    worker?.livedWithWorker,
    any(
      worker?.workerEarlyRight,
      all(
        worker?.workerDiedWhileWorking,
        any(
          priorResidence,
          worker?.occupationalDeath,
          worker?.survivorLostPortugueseNationality,
        ),
      ),
    ),
  );
}

function freeMovementFee(ctx: PtFullContext) {
  const { req, at, L, check } = ctx;
  const e = req.freeMovement;
  const f = p.freeMovementFees.value;
  const age = req.birthDate ? fullYears(req.birthDate, at) : undefined;
  const mode = e?.feeMode;
  let amount: number | undefined;
  if (at >= f.from && mode === 'address-only') amount = f.addressOnly;
  else if (at >= f.from && age !== undefined && age !== f.age) {
    if (mode === 'digital')
      amount = age > f.age ? f.olderDigital : f.youngerDigital;
    if (mode === 'in-person')
      amount =
        age <= f.infantAge
          ? f.infantInPerson
          : age > f.age
            ? f.olderInPerson
            : f.youngerInPerson;
    if (mode === 'urgent')
      amount = age > f.age ? f.urgentOlder : f.urgentYounger;
  }
  return check(
    'F09',
    amount === undefined
      ? undefined
      : amount === f.infantInPerson
        ? true
        : e?.feePaid,
    '自由流动永久证明费用',
    'Charges for permanent free-movement documentation',
    [law('art. 29, p5723'), ...p.freeMovementFees.sources],
    ['PD-398'],
    amount === undefined
      ? L(
          '请核对年龄、办理方式和适用费表；该费表没有明确列出正好处于年龄分界者的费用。',
          'Confirm the age, procedure and applicable table. This table leaves the boundary age unpriced.',
        )
      : L(
          `所选费目 EUR ${amount.toFixed(2)}。`,
          `Selected charge: EUR ${amount.toFixed(2)}.`,
        ),
  );
}

export function freeMovementResidence(ctx: PtFullContext) {
  const { req, at, L, check, pathway } = ctx;
  const e = req.freeMovement;
  const applicant =
    e?.applicant ??
    (req.route === 'eu' || req.route === 'eea' ? 'eu-eea-swiss' : undefined);
  const basis = e?.basis ?? 'ordinary';
  const title = L(
    '自由流动永久居留权',
    'Permanent residence under free movement',
  );
  const id = 'PT-FREE-MOVEMENT-PERMANENT';
  const f = p.freeMovementRegistration.value;
  const restrictions = check(
    'F08',
    reviewed(e?.publicRestrictions),
    '正式公序、安全与公共卫生限制',
    'Formal public order, security and public health restrictions',
    [law('arts. 22–24, pp5721–5722'), ...p.freeMovementProtectionYears.sources],
    ['PD-396'],
    L(
      `主管机关须审查实际而严重的风险及比例。已获永久权、此前在葡 ${p.freeMovementProtectionYears.value} 年或未成年人可能享有强化保护。`,
      `The authority reviews a real and sufficiently serious risk and proportionality. Enhanced safeguards may apply to permanent residents, residents of the preceding ${p.freeMovementProtectionYears.value} years or minors.`,
    ),
  );
  const notes = [
    check(
      'F07',
      e?.documents === 'standard' || e?.documents === 'accepted-alternative'
        ? true
        : undefined,
      '登记、身份、关系与住址证明',
      'Registration, identity, relationship and address evidence',
      [
        ...p.freeMovementRegistration.sources,
        law('arts. 16–17, 21'),
        src('SRC-485', 'DL 41/2023 art. 25'),
        src('SRC-484', 'Quem pode requerer / Documentos necessários'),
      ],
      ['PD-396'],
      L(
        `最初 ${f.initialMonths} 个月后通常有 ${f.registrationDays} 天办理登记或家属卡。永久权也可用其他获接受的证据证明。`,
        `Registration or a family card is normally required within ${f.registrationDays} days after the first ${f.initialMonths} months. Other accepted evidence may prove permanent residence rights.`,
      ),
    ),
    freeMovementFee(ctx),
  ];
  if (e?.operation === 'retain') {
    const prior = e.permanentRightAcquiredOn;
    const limit = p.freeMovementAbsence.value.lossYears;
    const loss =
      prior &&
      (e.absences ?? req.trips).some((trip) => {
        const start = trip.departed < prior ? prior : trip.departed;
        const end = trip.returned > at ? at : trip.returned;
        return end > addYears(start, limit);
      });
    return pathway(
      id,
      title,
      [
        check(
          'F02-RETENTION',
          all(
            compare(prior, (date) => date <= at),
            compare(loss, (value) => !value),
          ),
          '已取得永久权及取得后离境',
          'Existing permanent right and subsequent absence',
          [law('art. 10(3), (5), p5719'), ...p.freeMovementAbsence.sources],
          ['PD-396'],
          L(
            `取得后，连续离开葡萄牙超过 ${limit} 年丧失永久权。`,
            `After acquisition, more than ${limit} continuous years outside Portugal causes loss of the permanent right.`,
          ),
        ),
        restrictions,
      ],
      { notes },
    );
  }
  const familyBasis =
    applicant === 'third-country-family' ||
    basis === 'early-family' ||
    basis === 'retained-family';
  const identity =
    applicant === 'other'
      ? false
      : applicant === 'andorra'
        ? undefined
        : familyBasis
          ? familyEligibility(ctx, e, basis === 'ordinary')
          : applicant === 'eu-eea-swiss'
            ? true
            : undefined;
  const historical = historicalBasis(ctx);
  const early = basis === 'early-worker' || basis === 'early-family';
  const hasContinuity = compare(e?.expulsionExecuted, (value) => !value);
  const checks = [
    check(
      'F01',
      identity,
      '自由流动身份与合资格家属关系',
      'Free-movement status and qualifying family relationship',
      [
        law('arts. 1(2), 2(e), 3, 10(1)–(2)'),
        ...p.freeMovementDescendantAge.sources,
        src('SRC-484', 'Quem pode requerer'),
      ],
      ['PD-396'],
      L(
        `直系后代未满 ${p.freeMovementDescendantAge.value} 岁可按年龄分支核对；成年受养关系、其他家属及安道尔适用范围可能需专门确认。`,
        `Direct descendants under ${p.freeMovementDescendantAge.value} can use the age branch. Adult dependency, other relatives and Andorran cases may need individual confirmation.`,
      ),
    ),
    ...(early
      ? [
          check(
            'F02-EARLY-CONTINUITY',
            hasContinuity,
            '连续居留无已执行驱逐',
            'Continuity without executed expulsion',
            [law('art. 10(7), p5719')],
            ['PD-396'],
          ),
        ]
      : [
          check(
            'F02',
            freeMovementTime(ctx),
            '连续合法居留、出境及共同居住',
            'Continuous lawful residence, absences and shared residence',
            [
              ...p.freeMovementYears.sources,
              ...p.freeMovementAbsence.sources,
              law('art. 10(7)'),
            ],
            ['PD-396'],
            L(
              `通常须连续 ${p.freeMovementYears.value} 年。每年不超过 ${p.freeMovementAbsence.value.ordinaryMonths} 个连续月、必要兵役或一次不超过 ${p.freeMovementAbsence.value.justifiedMonths} 个连续月的正当离境可保留连续性。`,
              `The ordinary period is ${p.freeMovementYears.value} continuous years. Up to ${p.freeMovementAbsence.value.ordinaryMonths} consecutive months per year, required military service, or one justified absence up to ${p.freeMovementAbsence.value.justifiedMonths} consecutive months can preserve continuity.`,
            ),
          ),
        ]),
    ...(basis === 'early-family'
      ? []
      : [
          check(
            'F03',
            historical,
            '申请前的自由流动合法居留基础',
            'Lawful free-movement residence before acquisition',
            [law('arts. 2(f), 6–9, pp5717–5719')],
            ['PD-397'],
            L(
              '按居留期间的工作、学习、资源或家庭来源核对。非经济活动及学习的医保取决于互惠。',
              'Check work, study, resources or family status during the qualifying residence. Health insurance for inactive people and students depends on reciprocity.',
            ),
          ),
        ]),
    ...(basis === 'retained-family'
      ? [
          check(
            'F04',
            retainFamily(e, historical),
            '家庭变化后保留居留权',
            'Retained residence rights after a family event',
            [law('arts. 8–9, 13, pp5718–5720')],
            ['PD-396', 'PD-397'],
          ),
        ]
      : []),
    ...(basis === 'early-worker'
      ? [
          check(
            'F05',
            earlyWorker(ctx),
            '工作者提前取得永久权',
            'Early permanent residence for workers',
            p.workerEarlyResidence.sources,
            ['PD-396', 'PD-397'],
          ),
        ]
      : []),
    ...(basis === 'early-family'
      ? [
          check(
            'F06',
            earlyFamily(e),
            '工作者同住家属提前取得永久权',
            'Early permanent residence for family living with a worker',
            p.workerFamilyResidenceYears.sources,
            ['PD-396'],
          ),
        ]
      : []),
    restrictions,
  ];
  return pathway(id, title, checks, {
    applicable: applicant !== 'other',
    notes,
  });
}
