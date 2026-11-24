import { addDays, daysBetween } from '../dates';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import {
  all,
  any,
  atLeast,
  atMost,
  checksFor,
  checkStatus,
  cumulativeDaysAt,
  not,
  physicalPresenceAtReceipt,
  returnFromTrip,
  reviewed,
  s,
  v,
} from './check';
import type { Answer } from './check';
import {
  multipleConvictionBar,
  partyCheck,
  pettyOffense,
} from './naturalization';
import {
  carryForward,
  employmentPetitionDates,
  immediateRelative,
  isFamilyCategory,
  isI140Category,
  originalEmploymentAtFiling,
  underlyingPetitionApproved,
} from './petition';
import type { AdjustmentCategory, preapprovedFacts } from './petition';
import type { UsAdmissionAnswers, UsFullRequest, UsReview } from './types';

function waived(grounds: Answer[], decision: Answer): Answer[] {
  return grounds.map((ground) => (ground === false ? decision : ground));
}

function ordinaryWaiver(grounds: Answer[], waiver?: UsReview): Answer[] {
  return waiver === undefined ? grounds : waived(grounds, reviewed(waiver));
}

function medicalEvidenceCheck(
  a: UsAdmissionAnswers['i693AtFiling'],
  date: IsoDate | undefined,
): Answer {
  const law = v.medical.value;
  const signed = a?.i693SignedOn;
  const signedValid = !signed
    ? true
    : date
      ? signed <= date &&
        (signed >= law.previousSignatureCutoff ||
          date <= afterYears(signed, law.previousValidityYears))
      : undefined;
  const unlinked = not(a?.i693LinkedToAnotherClosedCase);
  const linkageValid =
    date && date < law.applicationLinkedFrom
      ? true
      : date || unlinked === true
        ? unlinked
        : undefined;
  return all(reviewed(a?.medicalEvidence), signedValid, linkageValid);
}

function i693Checks(
  a: UsAdmissionAnswers | undefined,
  receipt: IsoDate,
  decision: IsoDate | undefined,
  filedI485On: IsoDate | undefined,
) {
  const requiredAtFiling = receipt >= v.medical.value.requiredWithI485From;
  const original = a?.i693AtFiling;
  const signedOn = a?.i693SignedOn;
  const lateSignature = filedI485On && signedOn && signedOn > receipt;
  const filing = requiredAtFiling
    ? medicalEvidenceCheck(original ?? (lateSignature ? undefined : a), receipt)
    : true;
  const legacyAtDecision =
    signedOn && decision && signedOn > decision ? undefined : a;
  const supplemental = a?.i693AtDecision;
  const supplementalAtDecision =
    supplemental?.i693SignedOn &&
    decision &&
    supplemental.i693SignedOn > decision
      ? undefined
      : supplemental;
  const atDecision =
    supplementalAtDecision ??
    (legacyAtDecision?.medicalEvidence !== undefined ||
    legacyAtDecision?.i693SignedOn
      ? legacyAtDecision
      : (original ?? legacyAtDecision));
  return {
    requiredAtFiling,
    filing,
    decision: medicalEvidenceCheck(atDecision, decision),
  };
}

function criminalGrounds(
  a: UsAdmissionAnswers | undefined,
  applicationDate: IsoDate | undefined,
): Answer[] {
  const crime = a?.crime;
  const rule = v.crime.value;
  const juvenile = all(
    atMost(crime?.cimtCount, 1),
    crime?.cimtAgeAtOffense === undefined
      ? undefined
      : crime.cimtAgeAtOffense < rule.juvenileAge,
    crime?.cimtOffenseOrReleaseOn && applicationDate
      ? applicationDate >
          afterYears(crime.cimtOffenseOrReleaseOn, rule.juvenileYears)
      : undefined,
  );
  const cimt =
    crime?.cimtCount === 0
      ? true
      : atLeast(crime?.cimtCount, rule.multipleConvictions) === true
        ? false
        : any(pettyOffense(crime), juvenile);
  const drug =
    crime?.controlledSubstance === 'none'
      ? true
      : crime?.controlledSubstance
        ? false
        : undefined;
  const waiver =
    crime?.controlledSubstance === 'other' ||
    (crime?.controlledSubstance === 'single-simple-cannabis' &&
      atMost(crime.cannabisGrams, rule.cannabisGrams) === false)
      ? 'barred'
      : a?.criminalWaiver;
  return ordinaryWaiver(
    [
      cimt,
      drug,
      not(multipleConvictionBar(crime)),
      reviewed(a?.criminalOtherGround),
      crime?.unclassifiedRecord === false ? true : undefined,
    ],
    waiver,
  );
}

function unlawfulPresence(
  a: UsAdmissionAnswers | undefined,
  date: IsoDate | undefined,
): Answer {
  const departure = a?.unlawfulDeparture;
  if (departure === 'none') return true;
  if (!departure || !date || departure.leftOn > date) return undefined;
  const law = v.unlawfulPresence.value;
  const afterDeparture = date > departure.leftOn;
  if (departure.qualifyingDays >= law.longDays)
    return afterDeparture
      ? date >= afterYears(departure.leftOn, law.longBarYears)
      : undefined;
  if (
    departure.qualifyingDays <= law.shortDays ||
    date >= afterYears(departure.leftOn, law.shortBarYears)
  )
    return true;
  return not(departure.voluntaryBeforeProceedings) === true
    ? true
    : afterDeparture
      ? not(departure.voluntaryBeforeProceedings)
      : undefined;
}

const immigrationEventGrounds = [
  'immigrationFraud',
  'falseCitizenship',
  'unlawfulReentryBar',
] as const;

function immigrationAnswersAt(
  a: UsAdmissionAnswers | undefined,
  on: IsoDate | undefined,
) {
  const events = a?.i485PendingEvents?.filter(
    (event) => event.kind === 'admissibility',
  );
  if (!events?.length) return a;
  const adverse = immigrationEventGrounds.filter(
    (ground) => a?.[ground] === true,
  );
  const otherAdverse =
    a?.classAHealth === 'barred' ||
    a?.vaccines === 'barred' ||
    a?.publicCharge === 'barred' ||
    a?.criminalOtherGround === 'barred' ||
    all(...criminalGrounds(a, on)) === false ||
    a?.drugTraffickingBar === true ||
    a?.securityGround === 'nonwaivable' ||
    a?.securityGround === 'other-bar' ||
    (a?.unlawfulDeparture !== undefined && a.unlawfulDeparture !== 'none') ||
    a?.otherInadmissibility === 'barred' ||
    Object.values(a?.otherInadmissibilityByGround ?? {}).includes('barred');
  const undifferentiated = events.filter(
    (event) => event.ground === undefined && event.finding === 'barred',
  );
  const stage = { ...a };
  for (const ground of adverse) {
    const dated = events.reduce<IsoDate | undefined>(
      (earliest, event) =>
        event.ground === ground && (!earliest || event.on < earliest)
          ? event.on
          : earliest,
      undefined,
    );
    // An unlabelled finding can date the sole reported ground. Mixed records need a ground identifier.
    const inferred =
      !otherAdverse && adverse.length === 1 && undifferentiated.length === 1
        ? undifferentiated[0]
        : undefined;
    const occurredOn = dated ?? inferred?.on;
    if (occurredOn)
      stage[ground] = !on || on === occurredOn ? undefined : occurredOn < on;
  }
  return stage;
}

function i485FilingPresence(
  request: UsFullRequest,
  receipt: IsoDate,
  filedI485On?: IsoDate,
): Answer {
  const trips = request.trips;
  if (!trips) return filedI485On !== undefined || undefined;
  return filedI485On
    ? physicalPresenceAtReceipt(trips, receipt)
    : !returnFromTrip(trips, receipt);
}

function admissionExemptions(
  scope: 'immigrant' | 'return' | 'humanitarian',
  process: UsAdmissionAnswers['process'],
  classification: { sij?: boolean; vawa?: boolean },
) {
  if (scope === 'humanitarian') return v.humanitarianAdmissionExemptions;
  if (classification.sij && process === 'adjustment')
    return v.sijAdmissionExemptions;
  if (classification.vawa) {
    if (process === 'adjustment') return v.vawaAdjustmentAdmissionExemptions;
    if (process === 'consular') return v.vawaConsularAdmissionExemptions;
  }
}

function matchesGround(ground: string, provision: string): boolean {
  return ground === provision || ground.startsWith(`${provision}(`);
}

function petitionApprovalUnconfirmed(
  status: UsAdmissionAnswers['petitionStatus'],
  filedOn?: IsoDate,
): boolean {
  return (
    status === 'pending' ||
    status === 'filed-with-i485' ||
    (status === undefined && filedOn !== undefined)
  );
}

function admissionGrounds(
  a: UsAdmissionAnswers | undefined,
  exemptions: ReturnType<typeof admissionExemptions>,
  pendingSij: boolean,
  vawa: boolean,
) {
  const isExempt = (ground: string) =>
    exemptions?.value.some((exemption) => matchesGround(ground, exemption));
  const assessExemption = (ground: string, answer: Answer): Answer => {
    if (isExempt(ground)) return true;
    if (
      pendingSij &&
      answer !== true &&
      v.sijAdmissionExemptions.value.some(
        (exemption) =>
          matchesGround(ground, exemption) || matchesGround(exemption, ground),
      )
    )
      return undefined;
    return answer;
  };
  const publicExempt = isExempt('4(A)') || a?.publicChargeExempt === true;
  const publicResult = publicExempt
    ? true
    : assessExemption('4(A)', reviewed(a?.publicCharge));
  const falseClaim = assessExemption(
    '6(C)(ii)',
    a?.falseCitizenship === true
      ? a.falseCitizenshipException
      : not(a?.falseCitizenship),
  );
  const otherGrounds = Object.entries(a?.otherInadmissibilityByGround ?? {});
  const identifiedGrounds = otherGrounds.flatMap(([ground, finding]) =>
    finding === undefined ? [] : [assessExemption(ground, reviewed(finding))],
  );
  const aggregateReview = reviewed(a?.otherInadmissibility);
  const completeReview = v.otherImmigrationGrounds.value.every(
    (ground) =>
      isExempt(ground) ||
      otherGrounds.some(
        ([provision, finding]) =>
          (finding === 'cleared' || (pendingSij && finding !== undefined)) &&
          matchesGround(ground, provision),
      ),
  );
  // Until SIJ is approved, an unexplained aggregate bar may include an exempt ground.
  const unexplainedSijBar =
    pendingSij &&
    aggregateReview === false &&
    (!completeReview ||
      !otherGrounds.some(([, finding]) => finding === 'barred'));
  const otherReview = unexplainedSijBar
    ? undefined
    : completeReview || aggregateReview;
  const presenceAt = (on: IsoDate | undefined) => {
    if (isExempt('9(B)')) return true;
    const presence = unlawfulPresence(a, on);
    return vawa
      ? any(presence, reviewed(a?.vawaUnlawfulPresenceException))
      : presence;
  };
  const immigration = (bar: Answer) => {
    const [presence, fraud, other] = ordinaryWaiver(
      [bar, isExempt('6(C)(i)') ? true : not(a?.immigrationFraud), otherReview],
      a?.immigrationWaiver,
    );
    return [
      falseClaim,
      not(a?.unlawfulReentryBar),
      assessExemption('9(B)', presence),
      assessExemption('6(C)(i)', fraud),
      other,
      ...identifiedGrounds,
    ];
  };
  return { publicExempt, publicResult, presenceAt, immigration };
}

type AdmissionTiming = {
  receipt: IsoDate;
  filedI485On?: IsoDate;
  decision?: IsoDate;
  formalApplicationOn?: IsoDate;
  postmark?: IsoDate;
};

export function admissionChecks(
  request: UsFullRequest,
  scope: 'immigrant' | 'return' | 'humanitarian',
  {
    receipt,
    decision,
    formalApplicationOn,
    postmark,
    filedI485On,
  }: AdmissionTiming,
  category?: AdjustmentCategory,
  facts?: ReturnType<typeof preapprovedFacts>,
) {
  const check = checksFor(request);
  const a = scope === 'return' ? request.travel?.admission : request.admission;
  const adjustment = scope === 'immigrant' && a?.process === 'adjustment';
  const adjustmentSources = adjustment ? s.adjustmentEligibility : [];
  const consular = a?.process === 'consular';
  const consularVisa = consular && scope === 'immigrant';
  const approvalOnly = consularVisa ? 'NOT_APPLICABLE' : undefined;
  const applicationDate = consularVisa ? formalApplicationOn : receipt;
  const approvalDate = scope === 'return' ? receipt : decision;
  const publicChargeDate = adjustment ? (postmark ?? receipt) : receipt;
  const humanitarian = scope === 'humanitarian';
  const refugee = humanitarian && request.humanitarian?.status === 'refugee';
  const sij = facts?.has('sijClassification');
  const vawa = facts?.has('vawaClassification');
  const exemptions = admissionExemptions(scope, a?.process, { sij, vawa });
  const pendingSij =
    adjustment &&
    category === 'sij' &&
    !sij &&
    petitionApprovalUnconfirmed(a.petitionStatus, a.petitionFiledOn);
  const immigrationAt = (on?: IsoDate) =>
    admissionGrounds(
      adjustment || humanitarian ? immigrationAnswersAt(a, on) : a,
      exemptions,
      pendingSij,
      (adjustment || consularVisa) && vawa === true,
    );
  const current = immigrationAt(approvalDate);
  const transfer = adjustment ? a.i485BasisTransfer : undefined;
  const original = transfer?.originalPetition;
  const originalConfirmed = original?.qualifyingBasisAtFiling === 'cleared';
  const originalSij = original?.adjustmentBasis === 'sij';
  const originalSijUnconfirmed =
    original?.adjustmentBasis === undefined ||
    (originalSij &&
      !originalConfirmed &&
      original.qualifyingBasisAtFiling !== 'barred');
  const originalVawa =
    original?.adjustmentBasis === 'vawa' && originalConfirmed;
  const originalExemptions = admissionExemptions(scope, a?.process, {
    sij: originalSij && originalConfirmed,
    vawa: originalVawa,
  });
  const originalAdmission = transfer
    ? {
        ...a,
        healthWaiver: original?.healthWaiverAtFiling,
        criminalWaiver: original?.criminalWaiverAtFiling,
        immigrationWaiver: original?.immigrationWaiverAtFiling,
        vawaUnlawfulPresenceException:
          original?.vawaUnlawfulPresenceExceptionAtFiling,
      }
    : undefined;
  const atFiling = originalAdmission
    ? admissionGrounds(
        immigrationAnswersAt(originalAdmission, receipt),
        originalExemptions,
        originalSijUnconfirmed,
        originalVawa,
      )
    : adjustment || humanitarian
      ? immigrationAt(receipt)
      : current;
  const exemptionSources =
    (pendingSij ? v.sijAdmissionExemptions : exemptions)?.sources ?? [];
  const { publicExempt, publicResult } = current;
  const { waiver, waiverFiling } = (humanitarian && request.humanitarian) || {};
  const waiverDecision = waiver === 'not-needed' ? false : reviewed(waiver);
  const waiverMaterials =
    waiverFiling !== undefined
      ? reviewed(waiverFiling)
      : waiver === 'pending' || waiver === 'cleared'
        ? true
        : waiver === 'not-needed'
          ? false
          : undefined;
  const assessGround = (
    grounds: Answer[],
    prerequisite: Answer,
    filingPrerequisite = prerequisite,
  ) => {
    return {
      answer: all(
        prerequisite,
        ...(humanitarian ? waived(grounds, waiverDecision) : grounds),
      ),
      filingStatus: humanitarian
        ? checkStatus(
            all(filingPrerequisite, ...waived(grounds, waiverMaterials)),
          )
        : undefined,
    };
  };
  const party =
    scope === 'return'
      ? true
      : partyCheck(a?.party, applicationDate, false, request.dateOfBirth);
  const security =
    a?.securityGround === 'clear'
      ? true
      : a?.securityGround === 'nonwaivable' || a?.securityGround === 'other-bar'
        ? false
        : undefined;
  const health = [reviewed(a?.classAHealth), reviewed(a?.vaccines)];
  const healthGrounds = refugee
    ? health
    : ordinaryWaiver(health, a?.healthWaiver);
  const healthAtFiling = originalAdmission
    ? ordinaryWaiver(health, originalAdmission.healthWaiver)
    : healthGrounds;
  const i693 =
    adjustment || humanitarian
      ? i693Checks(a, receipt, approvalDate, filedI485On)
      : undefined;
  const medicalAtFiling = i693 ? i693.filing : true;
  const medical = assessGround(
    originalAdmission && i693?.requiredAtFiling
      ? [...healthAtFiling, ...healthGrounds]
      : healthGrounds,
    all(medicalAtFiling, i693 ? i693.decision : reviewed(a?.medicalEvidence)),
    medicalAtFiling,
  );
  const medicalFilingStatus =
    i693 && !i693.requiredAtFiling
      ? 'MET'
      : adjustment
        ? checkStatus(all(medicalAtFiling, ...healthAtFiling))
        : (approvalOnly ?? medical.filingStatus);
  const crime = criminalGrounds(a, applicationDate);
  const crimeAtFiling = originalAdmission
    ? criminalGrounds(originalAdmission, applicationDate)
    : crime;
  const criminal = assessGround(
    originalAdmission ? [...crimeAtFiling, ...crime] : crime,
    not(a?.drugTraffickingBar),
  );
  const criminalFiling = all(not(a?.drugTraffickingBar), ...crimeAtFiling);
  const securityResult = assessGround(
    [security, party],
    a?.securityGround === undefined || a.securityGround === 'pending'
      ? undefined
      : a.securityGround !== 'nonwaivable',
  );
  const barAtFiling = adjustment ? atFiling.presenceAt(receipt) : true;
  const barAtDecision = current.presenceAt(approvalDate);
  const immigrationAtFiling = atFiling.immigration(barAtFiling);
  const originalExemptionSources =
    transfer &&
    (originalSij ||
      (originalSijUnconfirmed && immigrationAtFiling.includes(undefined))) &&
    !pendingSij &&
    exemptions !== v.sijAdmissionExemptions
      ? v.sijAdmissionExemptions.sources
      : transfer && originalExemptions !== exemptions
        ? (originalExemptions?.sources ?? [])
        : [];
  const immigrationResult = assessGround(
    adjustment
      ? [...immigrationAtFiling, ...current.immigration(barAtDecision)]
      : current.immigration(barAtDecision),
    true,
  );
  return [
    check(
      'C36-HEALTH',
      '健康、移民体检与疫苗',
      'Health, immigrant medical exam and vaccination',
      medical.answer,
      consularVisa
        ? [...s.health, ...s.consularHealth]
        : [...s.health, ...(i693 ? s.i693Scope : []), ...adjustmentSources],
      'PD-275',
      consularVisa
        ? [
            '收到面谈通知后安排指定医生体检。健康结论、疫苗及体检材料在签证核准前核对。',
            'Arrange the panel physician exam after receiving the interview notice. Health findings, vaccination and the exam report are checked before visa issuance.',
          ]
        : i693
          ? i693.requiredAtFiling
            ? [
                '所需 I-693 或部分疫苗记录须随 I-485 递交，并在核准时复核健康结论和材料有效性。',
                'Submit any required I-693 or partial vaccination record with Form I-485. Health findings and validity are rechecked at approval.',
              ]
            : [
                '该收件日可在递交 I-485 后补交所需体检材料。核准仍须确认健康、疫苗和体检材料。',
                'For this receipt date, required medical evidence can follow Form I-485. Health, vaccination and medical evidence must still be established at approval.',
              ]
          : [
              '核对 Class A 传染病、伴有有害行为的疾病、药物滥用、适龄疫苗及当前有效的体检材料。新冠疫苗已从清单移除。',
              'Check Class A infectious diseases, disorders with harmful behavior, drug abuse, age-appropriate vaccination and currently valid medical evidence. COVID-19 vaccination was removed from the list.',
            ],
      medicalFilingStatus,
    ),
    {
      ...check(
        'C37-PUBLIC-CHARGE',
        '公共负担资格或法定豁免',
        'Public charge assessment or statutory exemption',
        publicResult,
        [
          ...s.publicCharge,
          ...(adjustment ? s.publicChargeExemptions : []),
          ...exemptionSources,
        ],
        pendingSij ? 'PD-274' : consular ? 'PD-273' : 'PD-261',
        publicExempt
          ? [
              '该类别免公共负担审查。',
              'This category is exempt from public charge review.',
            ]
          : pendingSij && publicResult === undefined
            ? [
                '公共负担例外待 SIJ 分类获批后确认。',
                'Confirm the public charge exemption after SIJ classification is approved.',
              ]
            : consular
              ? [
                  '领馆采用国务院 FAM 口径。需由领馆个案判断现金维持补助和长期机构护理等因素。',
                  'The consulate applies State Department FAM guidance and assesses factors including cash support and long-term institutional care.',
                ]
              : publicChargeDate < v.publicCharge.value.effective
                ? [
                    '按原政策综合评估，重点核对现金维持补助和政府出资长期机构护理。',
                    'The prior policy weighs the overall circumstances, including cash income maintenance and publicly funded long-term institutional care.',
                  ]
                : a?.benefits === 'post-change-means-tested'
                  ? [
                      '生效日后申领、获批或领取的资检福利可纳入 DHS 的全貌审查，结果取决于个案。',
                      'DHS may consider means-tested benefits applied for, approved or received since the effective date. The outcome depends on the whole case.',
                    ]
                  : [
                      'DHS 综合评估年龄、健康、家庭、财务和技能。生效日前的福利按旧口径核对。',
                      'DHS weighs age, health, family, finances and skills. Pre-effective-date benefits are assessed using the prior standards.',
                    ],
        scope === 'return' && !publicExempt ? undefined : 'NOT_APPLICABLE',
      ),
      ...(publicExempt ? { applicable: false } : {}),
    },
    check(
      'C38-CRIMINAL-INADMISSIBILITY',
      '犯罪、毒品、贩运及洗钱事由',
      'Criminal, drug, trafficking and money laundering grounds',
      criminal.answer,
      consularVisa
        ? [...s.criminal, ...s.consularExecution, ...s.consularInterview]
        : [...s.criminal, ...adjustmentSources],
      humanitarian ? ['PD-269', 'PD-275'] : 'PD-269',
      [
        '确认移民法罪名分类、轻罪或未成年例外、合计刑期、毒品与无需定罪的贩运或洗钱事由。',
        'Confirm immigration-law classifications, petty or juvenile exceptions, aggregate sentences, controlled substances and trafficking or money laundering grounds that can apply without a conviction.',
      ],
      originalAdmission && criminalFiling !== criminal.answer
        ? checkStatus(criminalFiling)
        : (approvalOnly ?? criminal.filingStatus),
    ),
    check(
      'C39-SECURITY',
      '国家安全、出口管制及极权党籍',
      'National security, export controls and totalitarian-party membership',
      securityResult.answer,
      consularVisa
        ? [...s.security, ...s.consularExecution, ...s.consularSecurity]
        : [...s.security, ...adjustmentSources],
      'PD-275',
      undefined,
      approvalOnly ?? securityResult.filingStatus,
    ),
    check(
      'C40-IMMIGRATION-HISTORY',
      '移民欺诈、虚称公民、非法居留及再入境',
      'Immigration fraud, false citizenship, unlawful presence and reentry',
      immigrationResult.answer,
      [
        ...s.immigrationBars,
        ...s.otherImmigrationGrounds,
        ...adjustmentSources,
        ...exemptionSources,
        ...originalExemptionSources,
      ],
      humanitarian ? ['PD-274', 'PD-275'] : 'PD-274',
      pendingSij && immigrationResult.answer === undefined
        ? [
            'SIJ 归类待决。须待分类获批才能确认法定例外，仍须核对独立的不准入事由。',
            'SIJ classification is pending. Confirm statutory exemptions after classification is approved and assess independent inadmissibility grounds separately.',
          ]
        : consularVisa
          ? [
              '在签证裁决日核对非法居留禁令是否届满，以及其他移民史不准入事由和可用豁免。',
              'At visa adjudication, check whether the unlawful-presence bar has expired and assess other immigration-history grounds and available waivers.',
            ]
          : [
              '按申请类别核对适用的移民史事由。若适用非法居留禁令，按合资格天数与离境日期计算。非法再入境及个案豁免另行核对。',
              'Check the immigration-history grounds that apply to this category. Where the unlawful-presence bar applies, use qualifying days and the departure date. Check unlawful reentry and individual waivers separately.',
            ],
      adjustment
        ? checkStatus(all(...immigrationAtFiling))
        : humanitarian
          ? assessGround(
              atFiling.immigration(atFiling.presenceAt(receipt)),
              true,
            ).filingStatus
          : approvalOnly,
    ),
  ];
}

function adjustmentBar(
  a: UsAdmissionAnswers | undefined,
  category: AdjustmentCategory,
  immediate: Answer,
  employment: UsFullRequest['employment'],
): Answer {
  if (category === '245i') return reviewed(a?.entryException);
  const other =
    a?.otherAdjustmentBar === 'none'
      ? true
      : a?.otherAdjustmentBar === 'barred'
        ? false
        : a?.otherAdjustmentBar === 'vwp'
          ? immediate
          : undefined;
  if (immediate === true || category === 'vawa' || category === 'sij')
    return other;
  const violations = a?.qualifyingViolationsDays;
  const employmentStatus =
    category !== 'employment'
      ? true
      : (a?.lawfulNonimmigrantStatusAtFiling ??
        (a?.legalEntry === 'paroled' ? false : undefined));
  if (violations === 0 && employmentStatus) return other;
  const kCategory =
    category === 'employment'
      ? employment?.category
        ? isI140Category(employment.category) || employment.category === 'eb5'
        : employment?.i140FiledOn
          ? true
          : undefined
      : false;
  const k =
    kCategory === false
      ? false
      : all(
          kCategory,
          a?.lawfulAdmissionFor245k,
          atMost(violations, v.adjustment.value.kDays),
        );
  const status = any(
    immediate,
    violations === undefined ? undefined : violations === 0,
    k,
  );
  return all(other, status, any(employmentStatus, k));
}

export function adjustmentChecks(
  request: UsFullRequest,
  category: AdjustmentCategory,
  timing: AdmissionTiming,
  facts: ReturnType<typeof preapprovedFacts>,
) {
  const { receipt: filingReceipt, decision, filedI485On } = timing;
  const check = checksFor(request);
  const a = request.admission;
  const transfer =
    a?.process === 'adjustment' ? a.i485BasisTransfer : undefined;
  const original = transfer?.originalPetition;
  const originalEmployment = originalEmploymentAtFiling(transfer);
  const petition = a?.petitionStatus;
  const petitionApproved = underlyingPetitionApproved(a);
  const { employment } = request;
  const familyBasis = isFamilyCategory(category);
  const availability = (value?: UsAdmissionAnswers['visaAtFiling']): Answer =>
    value === 'available' ? true : value === 'unavailable' ? false : undefined;
  const consular = a?.process === 'consular';
  const immediateAtFiling = immediateRelative(
    request,
    category,
    filingReceipt,
    facts,
  );
  const immediateAtDecision = decision
    ? immediateRelative(
        request,
        category,
        transfer?.approvedOn ?? filingReceipt,
        facts,
        decision,
      )
    : undefined;
  const simulationMonth = request.simulationDate.slice(0, 7);
  const receiptMonth = filingReceipt.slice(0, 7);
  const decisionMonth = decision?.slice(0, 7);
  const visaAtFiling = consular
    ? filingReceipt > request.simulationDate || availability(a.visaAtFiling)
    : a?.process === 'adjustment'
      ? immediateAtFiling === true
        ? true
        : any(
            immediateAtFiling,
            availability(
              a.visaAtFilingByMonth?.[receiptMonth] ??
                (receiptMonth === simulationMonth ? a.visaAtFiling : undefined),
            ),
          )
      : undefined;
  const visaAtDecision = !decisionMonth
    ? undefined
    : immediateAtDecision === true
      ? true
      : any(
          immediateAtDecision,
          availability(
            a?.visaAtDecisionByMonth?.[decisionMonth] ??
              (decisionMonth === simulationMonth
                ? a?.visaAtDecision
                : undefined),
          ),
        );
  const sijFiling =
    a?.process === 'adjustment' &&
    category === 'sij' &&
    (facts.has('sijClassification') ||
      petitionApprovalUnconfirmed(petition, a.petitionFiledOn));
  const entryAt = (
    basis: AdjustmentCategory,
    exception: UsReview | undefined,
    sij: boolean,
  ): Answer =>
    sij || a?.legalEntry === 'admitted' || a?.legalEntry === 'paroled'
      ? true
      : a?.legalEntry === 'without-inspection'
        ? basis === 'vawa'
          ? true
          : basis === 'sij' || basis === '245i'
            ? reviewed(exception)
            : basis === undefined || basis === 'ambiguous'
              ? undefined
              : false
        : undefined;
  const i140Category = isI140Category(employment?.category);
  const usesI140 =
    category === 'employment' && (i140Category || !employment?.category);
  const i140 = usesI140
    ? employmentPetitionDates(request, filingReceipt)
    : undefined;
  const i140FiledOn = i140?.i140FiledOn;
  const petitionFiledOn = i140FiledOn ?? a?.petitionFiledOn;
  const petitionReceipt =
    petitionFiledOn ??
    (a?.process === 'adjustment' ? i140?.i140Receipt : undefined);
  const awaitingPetition = petitionApprovalUnconfirmed(
    petition,
    petitionFiledOn,
  );
  const inconsistentPetitionDate =
    petitionFiledOn !== undefined && petitionFiledOn > request.simulationDate;
  const familyOrSpecialPetition =
    familyBasis || category === 'vawa' || category === 'sij';
  const requiresPetition =
    familyOrSpecialPetition ||
    category === 'employment' ||
    awaitingPetition ||
    category === 'ambiguous';
  const ds260 = a?.nvcDs260;
  const concurrent =
    a?.process === 'adjustment' &&
    (familyOrSpecialPetition ||
      (category === 'employment' &&
        (i140Category ||
          i140FiledOn !== undefined ||
          employment?.category === 'eb5')));
  const petitionAtFiling =
    petitionApproved || !requiresPetition || concurrent
      ? true
      : consular && petition !== undefined
        ? false
        : undefined;
  const qualifyingBasis = reviewed(a?.qualifyingBasis);
  const filingBasis = all(
    petitionAtFiling,
    concurrent && awaitingPetition && a?.qualifyingBasis === 'pending'
      ? true
      : qualifyingBasis,
  );
  const presenceAtReceipt = i485FilingPresence(
    request,
    filingReceipt,
    filedI485On,
  );
  const filing = transfer
    ? all(
        filedI485On && (!original?.filedOn || original.filedOn <= filedI485On)
          ? true
          : undefined,
        reviewed(original?.qualifyingBasisAtFiling),
        originalEmployment ? originalEmployment.offer : true,
        originalEmployment ? originalEmployment.pay : true,
        original?.adjustmentBasis === 'immediate-relative'
          ? true
          : availability(original?.visaAtFiling),
        entryAt(original?.adjustmentBasis, original?.entryException, false),
        presenceAtReceipt,
      )
    : all(
        inconsistentPetitionDate ||
          (petitionReceipt &&
            a?.process === 'adjustment' &&
            petitionReceipt > filingReceipt)
          ? undefined
          : true,
        filingBasis,
        visaAtFiling,
        consular
          ? true
          : a?.process === 'adjustment'
            ? all(
                entryAt(category, a.entryException, sijFiling),
                presenceAtReceipt,
              )
            : undefined,
      );
  const transferOn = transfer?.approvedOn;
  const transferInEffect =
    filedI485On &&
    transferOn &&
    decision &&
    filedI485On <= transferOn &&
    transferOn <= request.simulationDate &&
    transferOn <= decision &&
    (!petitionFiledOn || petitionFiledOn <= transferOn);
  const decisionBasis = transfer
    ? transferInEffect
      ? all(
          qualifyingBasis,
          petitionApproved || undefined,
          visaAtDecision,
          entryAt(category, a?.entryException, sijFiling),
        )
      : undefined
    : all(
        decision && petitionReceipt && petitionReceipt > decision
          ? undefined
          : true,
        petitionApproved || (category !== undefined && !requiresPetition)
          ? qualifyingBasis
          : undefined,
        visaAtDecision,
      );
  const civilDocuments = a?.nvcCivilDocuments;
  const originalBars = original?.adjustmentBasis
    ? carryForward(
        original.qualifyingBasisAtFiling === 'cleared',
        adjustmentBar(
          { ...a, entryException: original.entryException },
          original.adjustmentBasis,
          original.adjustmentBasis === 'immediate-relative',
          undefined,
        ),
      )
    : undefined;
  return [
    check(
      'C33-VISA-AND-ENTRY',
      '移民类别、签证名额与入境查验',
      'Immigrant basis, visa availability and admission or parole',
      all(filing, decisionBasis),
      [
        ...s.adjustment,
        ...(transfer ? s.adjustmentTransfer : []),
        ...(consular
          ? [
              ...s.consularFiling,
              ...s.consularApplication,
              ...s.consularInterview,
            ]
          : s.adjustmentFilingPresence),
        ...(familyBasis ? s.relationship : []),
      ],
      'PD-272',
      inconsistentPetitionDate
        ? [
            '所填基础请愿案的实际收件日晚于模拟日。请核对收件日和请愿状态。',
            'The reported underlying petition receipt is after the simulation date. Verify the receipt date and petition status.',
          ]
        : transfer
          ? [
              '首次递交按原请愿及原收件月指定表核对。USCIS 准予转换后，按替换请愿和裁决月的 Final Action Dates 核对核准。',
              'Use the original petition and the designated chart for the original receipt month. Once USCIS grants transfer, use the replacement petition and the decision month’s Final Action Dates for approval.',
            ]
          : decisionMonth === undefined
            ? [
                '按 NVC 通知的开放日递件。请提供面谈后的裁决日，再核对签证核准条件及适用的 Final Action Dates。',
                'Submit on the opening date confirmed by NVC. Provide the post-interview adjudication date to assess visa approval and any applicable Final Action Dates.',
              ]
            : [
                `境内按 USCIS 收件月份（${receiptMonth}）指定表确认能否递交，领馆材料按 NVC 通知提交。允许同时递交的案件仍须等基础请愿案获批。受排期限制的案件按裁决月份（${decisionMonth}）的 Final Action Dates 确认名额。未满龄或 CSPA 锁龄的美国公民未婚子女可能属于即时亲属。`,
                `Use the USCIS chart designated for the receipt month (${receiptMonth}), or NVC authorization to submit consular documents. Where concurrent filing is allowed, approval still depends on approval of the underlying petition. For numerically limited cases, use the Final Action Dates for the decision month (${decisionMonth}). An unmarried child of a U.S. citizen may qualify as an immediate relative based on age or CSPA protection.`,
              ],
      checkStatus(filing),
    ),
    ...(consular
      ? [
          check(
            'NVC-DS-260',
            'NVC 费用与 DS-260 提交',
            'NVC fees and DS-260 submission',
            ds260 === undefined ? undefined : ds260 === 'submitted',
            s.consularApplication,
            'PD-272',
            [
              '适用费用经 NVC 处理后，须在 CEAC 提交本案各签证申请人的 DS-260，才能上传民事文件。',
              'Once NVC has processed the applicable fees, submit Form DS-260 in CEAC for each visa applicant in the case before uploading civil documents.',
            ],
          ),
          check(
            'NVC-CIVIL-DOCUMENTS',
            'NVC 必需民事文件',
            'Required NVC civil documents',
            civilDocuments === 'complete'
              ? true
              : civilDocuments === 'missing'
                ? false
                : undefined,
            s.consularDocuments,
            'PD-272',
            [
              '递件须备齐适用的民事文件，包括法院、监狱和警方记录，或所需的缺件说明。若以说明递件，签证核准前仍须由领馆确认能否接受缺件。',
              'Prepare the required civil documents, including applicable court, prison, and police records, or statements of non-availability. If you submit a statement, the consular officer must confirm whether the visa can be issued without the document.',
            ],
            civilDocuments === 'nonavailability-explained' ? 'MET' : undefined,
          ),
        ]
      : a?.process === 'adjustment'
        ? [
            check(
              'C34-ADJUSTMENT-BARS',
              '境内调整禁令及 INA 245(k) 例外',
              'Adjustment bars and INA 245(k) exception',
              adjustmentBar(a, category, immediateAtFiling, employment),
              s.adjustmentBars,
              'PD-274',
              [
                `职业类须核对递交时的合法非移民身份或适用例外。合资格职业类按最近一次合法入境后的违规累计最多 ${v.adjustment.value.kDays} 天。假释返美不重置。其他禁令须分别检查。`,
                `For employment-based adjustment, check lawful nonimmigrant status at filing or an applicable exception. Eligible applicants may have up to ${v.adjustment.value.kDays} violation days since the last lawful admission. Parole does not reset the count. Check independent bars separately.`,
              ],
              transfer ? checkStatus(originalBars) : undefined,
            ),
            check(
              'C35-DISCRETION',
              '境内调整身份裁量',
              'Discretionary adjustment of status',
              reviewed(a?.discretion),
              s.discretion,
              'PD-270',
              undefined,
              'NOT_APPLICABLE',
            ),
          ]
        : []),
    ...(a?.process
      ? admissionChecks(request, 'immigrant', timing, category, facts)
      : []),
  ];
}

export function humanitarianChecks(
  request: UsFullRequest,
  { receipt, decision, filedI485On }: AdmissionTiming,
) {
  const check = checksFor(request);
  const a = request.humanitarian;
  const refugee = a?.status === 'refugee';
  const law = v.humanitarian.value;
  const presenceDays = a?.presenceDays;
  const through = a?.presenceThrough ?? request.simulationDate;
  let projectedPresenceOn: IsoDate | undefined;
  if (
    presenceDays !== undefined &&
    presenceDays < law.presenceDays &&
    through === request.simulationDate &&
    !request.admission?.decisionOn &&
    request.trips
  ) {
    let accrualFrom = addDays(request.simulationDate, 1);
    let remaining = law.presenceDays - presenceDays;
    const trips = [...request.trips].sort((first, second) =>
      first.departed.localeCompare(second.departed),
    );
    for (const trip of trips) {
      if (trip.returned <= accrualFrom) continue;
      const daysBeforeDeparture = Math.max(
        0,
        daysBetween(accrualFrom, trip.departed),
      );
      if (remaining <= daysBeforeDeparture) break;
      remaining -= daysBeforeDeparture;
      accrualFrom = trip.returned;
    }
    projectedPresenceOn = addDays(accrualFrom, remaining - 1);
  }
  const approvalRequirementDate = projectedPresenceOn;
  const range =
    decision && presenceDays !== undefined
      ? cumulativeDaysAt(presenceDays, through, decision)
      : undefined;
  const presence =
    projectedPresenceOn && decision
      ? decision >= projectedPresenceOn
      : !range
        ? undefined
        : range.minimum >= law.presenceDays
          ? true
          : range.maximum < law.presenceDays
            ? false
            : undefined;
  const statusAtFiling = all(
    i485FilingPresence(request, receipt, filedI485On),
    a?.statusRetained,
    not(a?.alreadyLpr),
    refugee
      ? true
      : a?.status === 'asylee'
        ? all(a.refugeeDefinitionOrDerivative, not(a.firmlyResettled))
        : undefined,
  );
  const admission = admissionChecks(request, 'humanitarian', {
    receipt,
    filedI485On,
    decision:
      approvalRequirementDate && decision && approvalRequirementDate > decision
        ? approvalRequirementDate
        : decision,
  });
  const waiver = a?.waiver;
  const waiverResult =
    waiver === 'not-needed' ||
    (waiver === undefined &&
      a?.waiverFiling === undefined &&
      admission.every((item) => item.status === 'MET'))
      ? true
      : reviewed(waiver);
  return [
    {
      ...check(
        'C41-HUMANITARIAN-PRESENCE',
        '难民／庇护批准后的在美时间',
        'U.S. physical presence after refugee admission or asylum grant',
        presence,
        s.humanitarian,
        'PD-274',
        approvalRequirementDate
          ? [
              `在 I-485 裁决时须累积至少一年实际在美时间。按所填行程推算，假定其余日期在美国，预计于 ${approvalRequirementDate} 满足。`,
              `Accumulate at least one year of U.S. physical presence by I-485 adjudication. With the reported trips and continued presence otherwise, the projected date is ${approvalRequirementDate}.`,
            ]
          : [
              '在 I-485 裁决时须累积至少一年实际在美时间。难民自抵美日起算永居，庇护者自核准日前一年起算永居。',
              'Accumulate at least one year of U.S. physical presence by I-485 adjudication. Refugee residence dates back to arrival and asylee residence dates back one year from approval.',
            ],
        'NOT_APPLICABLE',
      ),
      ...(approvalRequirementDate ? { approvalRequirementDate } : {}),
    },
    check(
      'C41-HUMANITARIAN-STATUS',
      '难民或庇护资格与裁量',
      'Refugee or asylum status and discretion',
      all(statusAtFiling, refugee ? true : reviewed(a?.discretion)),
      [...s.humanitarian, ...s.adjustmentFilingPresence],
      'PD-274',
      undefined,
      checkStatus(statusAtFiling),
    ),
    check(
      'C42-HUMANITARIAN-WAIVER',
      'INA 209(c) 豁免适用性',
      'INA 209(c) exemptions and waivers',
      waiverResult,
      s.humanitarianWaiver,
      'PD-275',
      [
        '免公共负担、劳工证及移民签证文件要求。可豁免事由分别核对能否随案提交材料及豁免是否获准。毒品贩运及指定安全事由不得豁免。',
        'Public charge, labor certification and immigrant document requirements are waived by statute. For waivable grounds, assess the evidence that can be submitted with the application and the waiver decision separately. Drug trafficking and specified security grounds cannot be waived.',
      ],
      'NOT_APPLICABLE',
    ),
    ...admission,
  ];
}
