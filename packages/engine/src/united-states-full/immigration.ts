import { addDays, daysBetween } from '../dates';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import { nextUsBusinessDay } from '../united-states';
import {
  all,
  any,
  atLeast,
  atMost,
  checksFor,
  checkStatus,
  not,
  poverty,
  reviewed,
  s,
  v,
} from './check';
import type { Answer } from './check';
import { jobsCheck } from './maintenance';
import {
  beneficiaryAtLeastAge,
  carryForward,
  currentFamilyPetitioner,
  isFamilyCategory,
  originalEmploymentAtFiling,
  reportedAgeAtLeast,
  underlyingPetitionApproved,
} from './petition';
import type { AdjustmentCategory } from './petition';
import type { preapprovedFacts } from './petition';
import type { UsEmploymentAnswers, UsFullCheck, UsFullRequest } from './types';

function petitionChecksFor(
  request: UsFullRequest,
  originalFilingStatus: UsFullCheck['filingStatus'] = 'NOT_APPLICABLE',
): ReturnType<typeof checksFor> {
  const check = checksFor(request);
  const a = request.admission;
  if (a?.process !== 'adjustment' || !a.i485BasisTransfer) return check;
  // The original basis is assessed in C33. Evidence for a replacement is approval-only.
  return (id, zh, en, answer, sources, pending, detail) =>
    check(
      id,
      zh,
      en,
      answer,
      [...sources, ...s.adjustmentTransfer],
      pending,
      detail,
      originalFilingStatus,
    );
}

export function familyChecks(
  request: UsFullRequest,
  receipt: IsoDate,
  facts: ReturnType<typeof preapprovedFacts>,
) {
  const check = petitionChecksFor(request);
  const a = request.family;
  const date = request.admission?.petitionFiledOn ?? receipt;
  const law = v.familyAge.value;
  const petitioner = currentFamilyPetitioner(request, receipt);
  const citizen = petitioner === 'citizen';
  const history = facts.has('familyRelationshipHistory');
  const barsCovered = facts.has('familyPetitionBars');
  const relation =
    a?.relationship === 'married-child'
      ? petitioner && citizen
      : a?.relationship === 'parent' || a?.relationship === 'sibling'
        ? all(
            petitioner ? citizen : undefined,
            carryForward(
              history,
              reportedAgeAtLeast(
                request.simulationDate,
                date,
                a.petitionerAge,
                law.adultSponsor,
              ),
            ),
          )
        : a?.relationship
          ? petitioner !== undefined || undefined
          : undefined;
  const child =
    a?.relationship === 'unmarried-child' || a?.relationship === 'married-child'
      ? a.childRelationship === 'biological'
        ? true
        : a.childRelationship === 'step'
          ? a.relationshipEstablishedAtAge === undefined
            ? undefined
            : a.relationshipEstablishedAtAge < law.stepchild
          : a.childRelationship === 'adopted'
            ? all(
                a.relationshipEstablishedAtAge === undefined
                  ? undefined
                  : a.relationshipEstablishedAtAge < law.adoption ||
                      (a.relationshipEstablishedAtAge < law.siblingAdoption &&
                        a.siblingAdoption),
                atLeast(a.custodyYears, law.adoptionYears),
                atLeast(a.livedTogetherYears, law.adoptionYears),
              )
            : undefined
      : true;
  let marriageBars: Answer = a?.relationship === undefined ? undefined : true;
  if (a?.relationship === 'spouse') {
    const prior = a.priorMarriageLprSince;
    const petitioningAsCitizen =
      currentFamilyPetitioner(request, date) === 'citizen';
    const priorMarriage =
      petitioningAsCitizen ||
      prior === 'not-applicable' ||
      (prior !== undefined && afterYears(prior, law.priorMarriageYears) <= date)
        ? true
        : reviewed(a.priorMarriageException);
    const removalMarriage =
      a.marriageDuringRemoval === false
        ? true
        : a.marriageDuringRemoval
          ? any(
              atLeast(
                a.livedAbroadAfterMarriageYears,
                law.proceedingsAbroadYears,
              ),
              reviewed(a.removalMarriageException),
            )
          : undefined;
    marriageBars = all(
      a.priorMarriageException === 'pending'
        ? priorMarriage
        : carryForward(barsCovered, priorMarriage),
      a.removalMarriageException === 'pending'
        ? removalMarriage
        : carryForward(barsCovered, removalMarriage),
    );
  }
  return [
    check(
      'C23-RELATIONSHIP',
      '亲属类别、年龄与关系效力',
      'Family classification, age and valid relationship',
      all(
        relation,
        carryForward(history, child),
        reviewed(a?.relationshipValid),
      ),
      s.relationship,
      'PD-272',
      [
        '按公民／永居担保人、亲属关系、缔结地效力及适用年龄分类。年龄保护须核对 CSPA 和适用排期。',
        'Classification depends on petitioner status, relationship validity and applicable age. Confirm CSPA and the visa chart for any age protection.',
      ],
    ),
    check(
      'C24-PETITION-BARS',
      '前婚担保、婚姻欺诈与 Adam Walsh 禁令',
      'Prior marriage, marriage fraud and Adam Walsh petition bars',
      all(
        a?.relationship ? true : undefined,
        marriageBars,
        carryForward(barsCovered, not(a?.priorMarriageFraud)),
        carryForward(barsCovered, a?.adamWalsh),
      ),
      s.petitionBars,
      'PD-274',
    ),
  ];
}

function i864Required(
  request: UsFullRequest,
  category: AdjustmentCategory,
): Answer {
  if (request.pathway === 'US-HUMANITARIAN') return false;
  if (isFamilyCategory(category)) return true;
  const job = request.employment;
  if (category === 'employment') {
    if (job?.category === 'eb5' || job?.i140SelfPetition === true) return false;
    return any(
      job?.relativePetitioner,
      atLeast(
        job?.relativeOwnershipPct,
        v.sponsor.value.qualifyingFamilyOwnershipPct,
      ),
    );
  }
  if (category === 'vawa' || category === 'sij') return false;
  return request.support?.affidavitSubmitted === true ? true : undefined;
}

export function supportExemption(
  request: UsFullRequest,
  category: AdjustmentCategory,
): Answer {
  return individualSupportExemption(request, i864Required(request, category));
}

function individualSupportExemption(
  request: UsFullRequest,
  required: Answer,
): Answer {
  if (required === false) return true;
  const a = request.support;
  if (!a?.exemption) return a?.affidavitSubmitted ? not(required) : undefined;
  if (a.exemption === 'none') return not(required);
  if (a.exemption === 'quarters')
    return all(
      atLeast(a.qualifyingQuarters, v.sponsor.value.quarters),
      reviewed(a.exemptionEvidence),
    );
  return reviewed(a.exemptionEvidence);
}

export function supportChecks(
  request: UsFullRequest,
  category: AdjustmentCategory,
  receipt: IsoDate,
  formalApplicationOn: IsoDate,
) {
  const check = petitionChecksFor(request);
  const law = v.sponsor.value;
  const required = i864Required(request, category);
  const skip = ['无需提交 I-864。', 'Form I-864 is not required.'] satisfies [
    string,
    string,
  ];
  const incomeCheck = (answer: Answer, detail: [string, string]) =>
    check(
      'C25-SUPPORT-INCOME',
      'I-864 收入、资产或合格共同担保',
      'I-864 income, assets or qualified joint sponsor',
      answer,
      [...s.poverty, ...s.sponsor],
      ['PD-260', 'PD-276'],
      detail,
    );
  const sponsorCheck = (answer: Answer, detail?: [string, string]) =>
    check(
      'C26-SPONSOR',
      'I-864 主担保人的年龄、身份、住所与签署',
      'I-864 primary sponsor age, status, domicile and affidavit',
      answer,
      s.sponsor,
      'PD-276',
      detail,
    );
  const exemptionCheck = (answer: Answer, detail?: [string, string]) =>
    check(
      'C27-SUPPORT-EXEMPTION',
      'I-864 适用或法定豁免',
      'I-864 applicability or statutory exemption',
      answer,
      s.supportExemption,
      'PD-276',
      detail,
    );
  const exempt = individualSupportExemption(request, required);
  if (exempt === true)
    return [
      { ...incomeCheck(true, skip), applicable: false },
      { ...sponsorCheck(true, skip), applicable: false },
      {
        ...exemptionCheck(true, skip),
        ...(required === false ? { applicable: false } : {}),
      },
    ];
  const a = request.support;
  const usingExemption = a?.exemption !== undefined && a.exemption !== 'none';
  const family = isFamilyCategory(category) ? request.family : undefined;
  const sponsorStatus =
    a?.sponsorStatus ??
    (family ? currentFamilyPetitioner(request, receipt) : undefined);
  const sponsor = all(
    reportedAgeAtLeast(
      request.simulationDate,
      receipt,
      a?.sponsorAge ?? family?.petitionerAge,
      law.age,
    ),
    sponsorStatus ? sponsorStatus !== 'other' : undefined,
    reviewed(a?.domiciledInUs),
    a?.affidavitSubmitted,
  );
  const benefit = family?.relationship ?? a?.relationshipToBeneficiary;
  const beneficiaryAge = family?.beneficiaryAge ?? a?.beneficiaryAge;
  const child =
    benefit === 'unmarried-child'
      ? not(
          beneficiaryAtLeastAge(
            request,
            formalApplicationOn,
            beneficiaryAge,
            v.familyAge.value.child,
          ),
        )
      : benefit === undefined
        ? undefined
        : false;
  const petitioningSponsor = isFamilyCategory(category)
    ? true
    : request.employment?.relativePetitioner;
  const active = all(
    petitioningSponsor,
    a?.activeDuty,
    any(benefit === 'spouse', child),
  );
  const household = a?.household;
  const povertyLaw = v.poverty.value;
  const applicable =
    formalApplicationOn >= povertyLaw.i864Effective &&
    formalApplicationOn.startsWith(String(povertyLaw.year));
  const listedSize = povertyLaw.i864ListedHouseholdSize;
  const baseline = household?.size
    ? poverty({ ...household, size: Math.min(household.size, listedSize) })
    : undefined;
  const minimumAt = (multiplier: number) =>
    applicable && baseline !== undefined && household?.region && household.size
      ? Math.round(baseline * multiplier) +
        Math.max(0, household.size - listedSize) *
          Math.round(povertyLaw[household.region].additional * multiplier)
      : undefined;
  const minimum =
    active === undefined
      ? undefined
      : minimumAt(active ? law.activeDuty : law.regular);
  const income = household?.incomeUsd;
  const citizenAssets = all(
    sponsorStatus === undefined ? undefined : sponsorStatus === 'citizen',
    any(
      benefit === 'spouse',
      all(
        child,
        beneficiaryAtLeastAge(
          request,
          formalApplicationOn,
          beneficiaryAge,
          law.age,
        ),
      ),
    ),
  );
  const ratio = a?.orphanException
    ? law.orphanAssets
    : citizenAssets
      ? law.citizenFamilyAssets
      : law.assets;
  const financialAt = (minimum: number | undefined): Answer =>
    minimum !== undefined && income !== undefined
      ? income >= minimum ||
        (a?.qualifyingAssetsUsd !== undefined
          ? a.qualifyingAssetsUsd >= (minimum - income) * ratio
            ? true
            : citizenAssets === undefined &&
                a.qualifyingAssetsUsd >=
                  (minimum - income) * law.citizenFamilyAssets
              ? undefined
              : false
          : undefined)
      : undefined;
  const atRegularRate = financialAt(minimumAt(law.regular));
  const atActiveRate = financialAt(minimumAt(law.activeDuty));
  const financial =
    active === undefined
      ? atRegularRate === atActiveRate
        ? atRegularRate
        : undefined
      : active
        ? atActiveRate
        : atRegularRate;
  return [
    incomeCheck(
      any(exempt, financial, reviewed(a?.jointSponsor)),
      minimum !== undefined
        ? [
            `按地区与家庭人口，年收入门槛 USD ${minimum}。适用资产须补足收入差额的 ${ratio} 倍，或有独立达标共同担保人。`,
            `The regional household threshold is USD ${minimum} per year. Use qualifying assets worth ${ratio} times any income shortfall or an independently qualified joint sponsor.`,
          ]
        : [
            '按可能适用的收入门槛核对所填资料。补充足以改变判断的担保证据。',
            'The income assessment uses the rates that may apply. Supply sponsor evidence where it could change the result.',
          ],
    ),
    sponsorCheck(any(exempt, sponsor)),
    exemptionCheck(
      usingExemption ? exempt : required === undefined ? undefined : true,
      [
        `按类别核对担保要求。个人豁免可按至少 ${law.quarters} 个合格社保季度或其他经确认的法定例外判断。`,
        `Check the category's sponsorship requirement. An individual exemption may be based on at least ${law.quarters} qualifying Social Security quarters or another established statutory exception.`,
      ],
    ),
  ];
}

function permRecruitment(a: UsEmploymentAnswers, i140Date?: IsoDate): Answer {
  const record = a.permRecruitment;
  const law = v.perm.value;
  const scheduleA = a.perm === 'schedule-a';
  const receipt = scheduleA ? i140Date : record?.laborCertificationFiledOn;
  const inWindow = (on: IsoDate) => {
    if (!receipt) return undefined;
    const days = daysBetween(on, receipt);
    return days >= law.minDays && days <= law.maxDays;
  };
  const notice = record?.notice;
  const noticeCompliant = !receipt
    ? undefined
    : notice?.method === 'union' && notice.notifiedOn
      ? inWindow(notice.notifiedOn)
      : notice?.method === 'posting' && notice.businessDates !== undefined
        ? new Set(notice.businessDates.filter(inWindow)).size >=
          law.noticeWorkdays
        : undefined;
  if (scheduleA)
    return all(
      a.recruitmentAndFeesCompliant !== false,
      noticeCompliant,
      record?.employerPaidPermCosts ?? a.recruitmentAndFeesCompliant,
    );
  if (!record) return a.recruitmentAndFeesCompliant;
  const order = record.stateJobOrder;
  const ads = record.advertisementDates;
  return all(
    a.recruitmentAndFeesCompliant !== false,
    order && daysBetween(order.from, order.through) + 1 >= law.orderDays,
    receipt && order ? inWindow(order.through) : undefined,
    atLeast(ads?.length, law.advertisements),
    receipt && ads?.length ? ads.every(inWindow) : undefined,
    noticeCompliant,
    record.professional === true
      ? all(
          atLeast(record.extraDistinctSteps, law.professionalSteps),
          atMost(record.extraDistinctSteps, law.availableSteps),
        )
      : not(record.professional),
    not(record.qualifiedAvailableUsWorker),
    record.employerPaidPermCosts,
  );
}

function abilityToPay(request: UsFullRequest): Answer {
  const a = request.employment;
  const proffered = a?.profferedWageUsd;
  const officer = all(
    atLeast(a?.employerEmployees, v.pay.value.financialOfficerMinEmployees),
    reviewed(a?.officerStatementAccepted),
  );
  const annual = a?.wageYears?.map(
    ({ paidUsd, netIncomeUsd, netCurrentAssetsUsd }) => {
      if (proffered === undefined) return undefined;
      const coversShortfall = (amount: number | undefined): Answer =>
        paidUsd === undefined
          ? atLeast(amount, proffered) === true || undefined
          : atLeast(amount, proffered - paidUsd);
      return any(
        atLeast(paidUsd, proffered),
        coversShortfall(netIncomeUsd),
        coversShortfall(netCurrentAssetsUsd),
      );
    },
  );
  const records = annual?.length
    ? all(a?.wagePeriodComplete === true ? true : undefined, ...annual)
    : undefined;
  return any(officer, records, reviewed(a?.abilityToPayTotality));
}

export function employmentChecks(
  request: UsFullRequest,
  {
    receipt,
    decision,
    facts,
    filedI485On,
  }: {
    receipt: IsoDate;
    decision?: IsoDate;
    facts: ReturnType<typeof preapprovedFacts>;
    filedI485On?: IsoDate;
  },
) {
  const check = petitionChecksFor(request);
  const a = request.employment ?? {};
  const date = request.simulationDate;
  const admission = request.admission;
  const transfer =
    admission?.process === 'adjustment'
      ? admission.i485BasisTransfer
      : undefined;
  const petitionApproved = underlyingPetitionApproved(admission);
  const petitionAlreadyFiled =
    admission?.petitionStatus === 'pending' || petitionApproved;
  const prospectivePetitionReceipt =
    admission?.process === 'adjustment'
      ? receipt
      : request.fees?.channel === 'paper'
        ? nextUsBusinessDay(date)
        : date;
  const category = a.category;
  const based = [
    check(
      'EMPLOYMENT-MARRIAGE-FRAUD',
      '既往婚姻欺诈批准禁令',
      'Prior marriage fraud petition bar',
      carryForward(
        facts.has('employmentPetitionBars'),
        not(a.priorMarriageFraud),
      ),
      s.petitionBars,
      'PD-274',
    ),
  ];
  if (
    category === 'eb1b' ||
    category === 'eb1c' ||
    category === 'eb2-perm' ||
    category === 'eb3'
  ) {
    const needsPerm = category === 'eb2-perm' || category === 'eb3';
    const priorI140 = petitionAlreadyFiled || a.i140FiledOn !== undefined;
    const inconsistentI140Date =
      a.i140FiledOn !== undefined && a.i140FiledOn > date;
    const i140Date = priorI140 ? a.i140FiledOn : prospectivePetitionReceipt;
    const valid =
      a.permCertifiedOn && i140Date && !inconsistentI140Date
        ? a.permCertifiedOn <= i140Date &&
          i140Date <= addDays(a.permCertifiedOn, v.perm.value.validDays)
        : undefined;
    const wages =
      a.prevailingWageUsd !== undefined
        ? atLeast(
            a.profferedWageUsd,
            a.prevailingWageUsd * v.perm.value.wageRatio,
          )
        : undefined;
    const certification =
      a.perm === 'schedule-a'
        ? true
        : a.perm === 'certified'
          ? valid
          : a.perm === 'none'
            ? false
            : undefined;
    const classification = carryForward(
      facts.has('employmentClassification'),
      a.categoryQualifications,
    );
    const perm =
      !needsPerm ||
      all(
        a.perm === 'pending'
          ? undefined
          : carryForward(facts.has('permFiling'), certification),
        a.permCertificationValidity === undefined
          ? true
          : reviewed(a.permCertificationValidity),
        carryForward(facts.has('permWage'), wages),
        carryForward(
          facts.has('permRecruitment'),
          permRecruitment(a, inconsistentI140Date ? undefined : i140Date),
        ),
      );
    const portability =
      admission?.process === 'adjustment' ? a.jobPortability : undefined;
    const portabilitySources = portability
      ? [...s.portability, ...(transfer ? s.transferPortability : [])]
      : [];
    const pendingSince = transfer ? portability?.i485PendingSince : filedI485On;
    const requestedOn = portability?.supplementJFiledOn;
    const pendingDays = v.portability.value.pendingDays;
    const port =
      portability &&
      all(
        pendingSince && decision
          ? daysBetween(pendingSince, decision) >= pendingDays
          : undefined,
        pendingSince && requestedOn && decision
          ? requestedOn <= decision &&
              daysBetween(pendingSince, requestedOn) >= pendingDays
          : undefined,
        portability.originalOfferValidAtFiling,
        portability.newOffer,
        reviewed(portability.sameOrSimilarOccupation),
      );
    const offerAtFiling =
      portability && (filedI485On || transfer)
        ? portability.originalOfferValidAtFiling
        : all(
            a.employmentOffer,
            portability?.originalOfferValidAtFiling !== false,
          );
    const currentOffer = portability
      ? all(offerAtFiling, any(a.employmentOffer, port))
      : a.employmentOffer;
    const petitionDates =
      petitionApproved && inconsistentI140Date ? undefined : true;
    const offer = all(currentOffer, classification, perm, petitionDates);
    const needsInitialSupplementJ =
      admission?.process === 'adjustment' &&
      admission.i485ApplicantRole !== 'derivative' &&
      !filedI485On &&
      !transfer &&
      petitionApproved;
    const pay = abilityToPay(request);
    const approvedEmployment = facts.has('employmentClassification');
    const payAtDecision =
      port === true ? carryForward(approvedEmployment, pay) : pay;
    const payAtFiling =
      portability && filedI485On ? carryForward(approvedEmployment, pay) : pay;
    const original = originalEmploymentAtFiling(transfer);
    const offerCheck = petitionChecksFor(
      request,
      original ? checkStatus(original.offer) : 'NOT_APPLICABLE',
    );
    const payCheck = petitionChecksFor(
      request,
      original ? checkStatus(original.pay) : 'NOT_APPLICABLE',
    );
    return [
      ...based,
      offerCheck(
        'C28-OFFER-PERM',
        needsPerm ? '永久全职工作、职业资格及 PERM' : '永久职位与职业资格',
        needsPerm
          ? 'Permanent full-time offer, category qualifications and PERM'
          : 'Permanent offer and category qualifications',
        offer,
        [
          ...(needsPerm ? s.perm : s.employerClassification),
          ...(facts.has('employmentClassification')
            ? s.approvedEmployment
            : []),
          ...portabilitySources,
        ],
        'PD-277',
        transfer
          ? [
              '原递交按原请愿的邀约核对。核准按替换请愿的邀约、职业资格及适用的劳工认证核对。',
              'Use the original petition’s offer for filing. For approval, check the replacement petition’s offer, classification and any applicable labor certification.',
            ]
          : portability
            ? [
                `原邀约须在 I-485 递交时有效。待决满 ${pendingDays} 天后，可为真实的同类或相似职位提交 Supplement J。`,
                `The original offer must have been valid at I-485 filing. Submit Supplement J for a bona fide offer in the same or a similar occupation after ${pendingDays} days pending.`,
              ]
            : facts.has('employmentClassification')
              ? [
                  '本案请愿获批已确认当时的分类条件和适用的劳工认证。请核实工作邀约仍有效。',
                  'The approved petition establishes classification and any applicable labor certification requirements at filing. Confirm that the job offer is still valid.',
                ]
              : !needsPerm
                ? undefined
                : a.perm === 'schedule-a'
                  ? [
                      `Schedule A 在 I-140 收件前 ${v.perm.value.minDays}–${v.perm.value.maxDays} 天通知有管辖权的工会代表；无代表时在该窗口内连续张贴至少 ${v.perm.value.noticeWorkdays} 个工作日。另核对雇主承担费用。`,
                      `For Schedule A, notify the applicable bargaining representative ${v.perm.value.minDays}–${v.perm.value.maxDays} days before I-140 receipt. Where there is no representative, post for at least ${v.perm.value.noticeWorkdays} consecutive business days within that window. Verify employer-paid costs separately.`,
                    ]
                  : [
                      '按 ETA-9089 收件日核对招聘与通知。PERM 有效期按实际或预计的 I-140 收件日核对。',
                      'Check recruitment and notice against ETA-9089 receipt. Check PERM validity against actual or expected I-140 receipt.',
                    ],
        portability
          ? checkStatus(all(offerAtFiling, classification, perm, petitionDates))
          : petitionApproved
            ? checkStatus(offer)
            : undefined,
      ),
      ...(needsInitialSupplementJ
        ? [
            check(
              'I485-INITIAL-SUPPLEMENT-J',
              '首次递交 I-485 随附 Supplement J',
              'Supplement J with the initial I-485',
              a.initialSupplementJIncluded,
              s.initialSupplementJ,
              'PD-277',
              [
                '雇主担保 I-140 已获批时，主申请人须将签署的 Supplement J 随首次 I-485 提交。',
                'The principal applicant must include a signed Supplement J with the initial I-485 when the employer-sponsored I-140 has already been approved.',
              ],
            ),
          ]
        : []),
      payCheck(
        'C29-ABILITY-TO-PAY',
        '雇主持续支付承诺工资',
        'Employer’s continuing ability to pay the proffered wage',
        payAtDecision,
        [...s.pay, ...portabilitySources],
        'PD-277',
        undefined,
        payAtFiling !== payAtDecision ? checkStatus(payAtFiling) : undefined,
      ),
    ];
  }
  if (category === 'eb1a' || category === 'eb2-niw') {
    const law = v.selfPetition.value;
    const approvedEvidence = facts.has(
      category === 'eb1a' ? 'eb1aEvidence' : 'niwEvidence',
    );
    const approvedMerits = facts.has(
      category === 'eb1a' ? 'eb1aMerits' : 'niwMerits',
    );
    const primary =
      category === 'eb1a'
        ? any(
            a.internationalAward,
            atLeast(a.extraordinaryEvidenceCount, law.extraordinaryEvidence),
            ...(a.comparableEvidenceAccepted === undefined
              ? []
              : [reviewed(a.comparableEvidenceAccepted)]),
          )
        : any(
            a.degree === 'advanced'
              ? true
              : a.degree === 'bachelor'
                ? atLeast(
                    a.progressiveExperienceYears,
                    law.progressiveExperienceYears,
                  )
                : a.degree
                  ? false
                  : undefined,
            atLeast(a.exceptionalEvidenceCount, law.exceptionalEvidence),
          );
    const adjustment = admission?.process === 'adjustment';
    const intent = a.continuesWorkInField;
    const factsAtFiling =
      category === 'eb1a'
        ? all(intent, a.benefitsUnitedStates)
        : all(
            a.niwProngs?.nationalImportance,
            a.niwProngs?.wellPositioned,
            a.niwProngs?.waiverBeneficial,
            intent !== false,
          );
    const determination =
      category === 'eb1a' ? a.extraordinaryFinalMerits : a.niwDetermination;
    const merits = all(
      carryForward(approvedMerits, factsAtFiling),
      carryForward(approvedMerits, determination),
      approvedMerits ? intent : true,
    );
    return [
      ...based,
      check(
        'C30-SELF-PETITION-EVIDENCE',
        '自申类别基础证据',
        'Initial evidence for the self-petition classification',
        carryForward(approvedEvidence, primary),
        s.selfPetition,
        'PD-277',
      ),
      check(
        'C30-SELF-PETITION-MERITS',
        'EB-1A 终局审查或 NIW 国家利益',
        'EB-1A final merits or NIW national interest',
        merits,
        approvedMerits || adjustment
          ? [...s.selfPetition, ...s.selfPetitionIntent]
          : s.selfPetition,
        'PD-277',
        approvedMerits
          ? [
              '已获批的原分类与终局审查可沿用。请确认仍拟从事原请愿的领域或工作计划，并具备适用的意向证明。',
              'The petition approval establishes the original classification and merits. Confirm intent to continue the petitioned work or endeavor and the applicable evidence of intent.',
            ]
          : undefined,
        checkStatus(approvedMerits ? merits : factsAtFiling),
      ),
    ];
  }
  if (category === 'eb5') {
    const law = v.eb5.value;
    const input = a.investment;
    const expectedYears = input?.expectedSustainmentYears;
    const sustainment =
      expectedYears === undefined
        ? atLeast(input?.sustainmentYears, law.sustainmentYears) || undefined
        : atLeast(expectedYears, law.sustainmentYears);
    const plan = input?.jobCreationPlan;
    const jobs = any(
      jobsCheck(input),
      plan === 'none'
        ? false
        : plan &&
            all(
              reviewed(plan.evidence),
              jobsCheck({
                ...input,
                qualifyingJobs: plan.qualifyingJobs,
                minimumWeeklyHours: plan.minimumWeeklyHours,
              }),
            ),
    );
    const petitionReceipt =
      admission?.petitionFiledOn ??
      (petitionAlreadyFiled ? undefined : prospectivePetitionReceipt);
    const current =
      petitionReceipt !== undefined &&
      (!admission?.petitionFiledOn || petitionReceipt <= date) &&
      petitionReceipt >= law.rulesFrom &&
      petitionReceipt < law.firstAdjustment;
    const minimum =
      input?.project === 'standard'
        ? law.standardUsd
        : input?.project
          ? law.reducedUsd
          : undefined;
    const approvedProject = facts.has('investmentProject');
    return [
      ...based,
      check(
        'C31-INVESTMENT-AMOUNT',
        'EB-5 投资本金门槛',
        'Minimum EB-5 capital investment',
        carryForward(
          facts.has('investmentAmount'),
          current && minimum !== undefined
            ? atLeast(input?.capitalUsd, minimum)
            : undefined,
        ),
        s.eb5,
        'PD-264',
        facts.has('investmentAmount')
          ? [
              '沿用获批投资请愿对本金的认定。',
              'The approved investor petition establishes the original capital requirement.',
            ]
          : [
              `本版标准项目 USD ${law.standardUsd}，合资格 TEA 或基建 USD ${law.reducedUsd}。自 ${law.firstAdjustment} 起需核对新门槛。`,
              `This schedule uses USD ${law.standardUsd} for standard projects and USD ${law.reducedUsd} for eligible TEA or infrastructure projects. Confirm the new amounts from ${law.firstAdjustment}.`,
            ],
      ),
      check(
        'C31-INVESTMENT-PROJECT',
        '合法资金、在险期限与合资格项目',
        'Lawful funds, at-risk period and qualifying project',
        all(
          carryForward(approvedProject, input?.lawfullySourcedFunds),
          carryForward(approvedProject, input?.atRisk),
          carryForward(approvedProject, input?.qualifiesAsNewEnterprise),
          carryForward(approvedProject, sustainment),
          carryForward(
            approvedProject,
            input?.regionalCenter === false
              ? true
              : input?.regionalCenter
                ? input.projectFiled
                : undefined,
          ),
        ),
        s.eb5,
        'PD-278',
        facts.has('investmentProject')
          ? [
              '沿用原资金及项目认定，并在 C33 核对当前投资基础和重大变化。',
              'The original funds and project determinations carry forward. C33 checks the current investment basis and material changes.',
            ]
          : [
              `初次申请核对资金预计持续在险至少 ${law.sustainmentYears} 年。`,
              `The initial petition evaluates whether the capital is expected to remain at risk for at least ${law.sustainmentYears} years.`,
            ],
      ),
      check(
        'C31-INVESTMENT-JOBS',
        '合资格岗位与工时',
        'Qualifying job creation and hours',
        carryForward(facts.has('investmentJobs'), jobs),
        [...s.eb5, ...s.eb5JobPlan],
        'PD-278',
        [
          '初次请愿可用已创造的合资格岗位或经记录的招聘计划。已获批时仍须确认投资基础继续有效。',
          'The initial petition can use qualifying jobs already created or a documented job creation plan. An approved petition still requires a continuing qualifying investment basis.',
        ],
      ),
    ];
  }
  if (category === 'gold-card') {
    const gold = a.gold;
    const approvedGold = facts.has('goldPetition');
    const filedGold =
      admission?.petitionFiledOn && admission.petitionFiledOn <= date;
    const consular = admission?.process
      ? admission.process === 'consular'
      : undefined;
    const law = v.gold.value;
    const principalGift =
      gold?.donor === 'individual'
        ? law.personGiftUsd
        : gold?.donor === 'company'
          ? law.companyGiftUsd
          : undefined;
    const gift =
      principalGift !== undefined && gold?.includedPeople
        ? principalGift + (gold.includedPeople - 1) * law.dependentGiftUsd
        : undefined;
    const processingFunds = gold?.includedPeople
      ? atLeast(
          gold.processingFundsUsd,
          gold.includedPeople * law.feePerPersonUsd,
        )
      : undefined;
    const giftAmount =
      gift === undefined ? undefined : atLeast(gold?.giftUsd, gift);
    const giftAtFiling = all(
      carryForward(approvedGold, giftAmount),
      carryForward(approvedGold, processingFunds),
    );
    const transfer = reviewed(gold?.giftTransferred);
    const transferAtDecision = approvedGold || transfer === false;
    return [
      ...based,
      check(
        'C32-GOLD-PROCESS',
        'Gold Card 预登记与领馆流程',
        'Gold Card preregistration and consular process',
        all(
          consular,
          carryForward(approvedGold, gold?.registrationAccepted),
          approvedGold ||
            filedGold ||
            (request.fees?.channel
              ? request.fees.channel === 'online'
              : undefined),
          carryForward(approvedGold, gold?.fundsAndWire),
        ),
        s.gold,
        'PD-276',
      ),
      check(
        'C32-GOLD-GIFT',
        'Gold Card 赠与及按人计处理费',
        'Gold Card gift and per-person processing fee',
        transferAtDecision ? all(transfer, giftAtFiling) : giftAtFiling,
        s.gold,
        'PD-276',
        approvedGold && gift === undefined
          ? [
              '核对领馆签发前已向 Department of Commerce 汇足赠与款并提交凭证。',
              'Confirm the full transfer to the Department of Commerce and proof of payment before visa issuance.',
            ]
          : gift === undefined
            ? [
                `主申请人个人赠与 USD ${law.personGiftUsd} 或企业代捐 USD ${law.companyGiftUsd}，每位随行配偶或子女另加 USD ${law.dependentGiftUsd}，处理费为每人 USD ${law.feePerPersonUsd}。`,
                `The principal's gift is USD ${law.personGiftUsd} for self-petitioners or USD ${law.companyGiftUsd} for corporate petitioners. Add USD ${law.dependentGiftUsd} per accompanying spouse or child and a processing fee of USD ${law.feePerPersonUsd} per person.`,
              ]
            : [
                `按赠与方及人数，需赠与 USD ${gift}，另付每人 USD ${law.feePerPersonUsd} 处理费。`,
                `The donor type and number of applicants require a gift of USD ${gift} and a processing fee of USD ${law.feePerPersonUsd} per person.`,
              ],
        transferAtDecision ? checkStatus(giftAtFiling) : undefined,
      ),
      check(
        'C32-GOLD-ALLOCATION',
        'Gold Card 法定分类与排期',
        'Gold Card statutory classification and allocation',
        undefined,
        s.gold,
        'PD-266',
        undefined,
        'NOT_APPLICABLE',
      ),
    ];
  }
  return [
    ...based,
    check(
      'EMPLOYMENT-CATEGORY',
      '职业申请类别',
      'Employment petition classification',
      undefined,
      s.selfPetition,
      'PD-277',
    ),
  ];
}
