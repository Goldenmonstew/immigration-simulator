import { addDays } from '../dates';
import { afterYears } from '../pilot';
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
import type {
  UsEmploymentAnswers,
  UsFamilyAnswers,
  UsFullRequest,
} from './types';

export function immediateRelative(family?: UsFamilyAnswers): Answer {
  if (!family?.petitioner || !family.relationship) return undefined;
  if (family.petitioner !== 'citizen') return false;
  if (family.relationship === 'spouse') return true;
  if (family.relationship === 'parent')
    return atLeast(family.petitionerAge, v.familyAge.value.adultSponsor);
  if (family.relationship !== 'unmarried-child') return false;
  const limit = v.familyAge.value.child;
  if (family.cspaAge !== undefined) return family.cspaAge < limit;
  return family.beneficiaryAge !== undefined && family.beneficiaryAge < limit
    ? true
    : undefined;
}

export function familyChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.family;
  const date = request.simulationDate;
  const law = v.familyAge.value;
  const citizen = a?.petitioner === 'citizen';
  const relation =
    a?.relationship === 'married-child'
      ? a.petitioner && citizen
      : a?.relationship === 'parent' || a?.relationship === 'sibling'
        ? all(
            a.petitioner ? citizen : undefined,
            atLeast(a.petitionerAge, law.adultSponsor),
          )
        : a?.relationship
          ? a.petitioner !== undefined || undefined
          : undefined;
  const childAge = a?.relationshipEstablishedAtAge;
  const child =
    a?.relationship === 'unmarried-child' || a?.relationship === 'married-child'
      ? a.childRelationship === 'biological'
        ? true
        : a.childRelationship === 'step'
          ? childAge === undefined
            ? undefined
            : childAge < law.stepchild
          : a.childRelationship === 'adopted'
            ? all(
                childAge === undefined
                  ? undefined
                  : childAge <
                      (a.siblingAdoption ? law.siblingAdoption : law.adoption),
                atLeast(a.custodyYears, law.adoptionYears),
                atLeast(a.livedTogetherYears, law.adoptionYears),
              )
            : undefined
      : true;
  const spouse = a?.relationship === 'spouse';
  const prior = a?.priorMarriageLprSince;
  const priorMarriage = !a?.relationship
    ? undefined
    : !spouse || citizen || prior === 'not-applicable'
      ? true
      : prior && afterYears(prior, law.priorMarriageYears) <= date
        ? true
        : reviewed(a?.priorMarriageException);
  const removalMarriage = !a?.relationship
    ? undefined
    : !spouse || a?.marriageDuringRemoval === false
      ? true
      : a?.marriageDuringRemoval
        ? any(
            atLeast(
              a.livedAbroadAfterMarriageYears,
              law.proceedingsAbroadYears,
            ),
            reviewed(a.removalMarriageException),
          )
        : undefined;
  return [
    check(
      'C23-RELATIONSHIP',
      '亲属类别、年龄与关系效力',
      'Family classification, age and valid relationship',
      all(relation, child, reviewed(a?.relationshipValid)),
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
        priorMarriage,
        removalMarriage,
        not(a?.priorMarriageFraud),
        reviewed(a?.adamWalsh),
      ),
      s.petitionBars,
      'PD-274',
    ),
  ];
}

export function i864Required(request: UsFullRequest): Answer {
  if (request.pathway === 'US-HUMANITARIAN') return false;
  if (request.pathway === 'US-FAMILY') return true;
  const job = request.employment;
  if (
    request.pathway === 'US-EMPLOYMENT' ||
    request.admission?.adjustmentBasis === 'employment'
  ) {
    if (job?.relativePetitioner === true) return true;
    if (job?.relativeOwnershipPct !== undefined)
      return (
        job.relativeOwnershipPct >=
          v.sponsor.value.qualifyingFamilyOwnershipPct ||
        (job.relativePetitioner === false ? false : undefined)
      );
    return undefined;
  }
  const basis = request.admission?.adjustmentBasis;
  if (basis === 'immediate-relative' || basis === 'family-preference')
    return true;
  if (basis === 'vawa' || basis === 'sij') return false;
  return request.support ? true : undefined;
}

export function supportExemption(request: UsFullRequest): Answer {
  const required = i864Required(request);
  if (required === false) return true;
  const a = request.support;
  if (!a?.exemption) return undefined;
  if (a.exemption === 'none') return not(required);
  if (a.exemption === 'quarters')
    return all(
      atLeast(a.qualifyingQuarters, v.sponsor.value.quarters),
      reviewed(a.exemptionEvidence),
    );
  return reviewed(a.exemptionEvidence);
}

export function supportChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.support;
  const law = v.sponsor.value;
  const exempt = supportExemption(request);
  const usingExemption = a?.exemption !== undefined && a.exemption !== 'none';
  const required = i864Required(request);
  const sponsor = all(
    atLeast(a?.sponsorAge, law.age),
    a?.sponsorStatus ? a.sponsorStatus !== 'other' : undefined,
    reviewed(a?.domiciledInUs),
    a?.affidavitSubmitted,
  );
  const benefit = request.family?.relationship ?? a?.relationshipToBeneficiary;
  const beneficiaryAge = request.family?.beneficiaryAge ?? a?.beneficiaryAge;
  const child =
    benefit === 'unmarried-child'
      ? not(atLeast(beneficiaryAge, v.familyAge.value.child))
      : benefit === undefined
        ? undefined
        : false;
  const active = all(a?.activeDuty, any(benefit === 'spouse', child));
  const household = a?.household;
  const date = request.fees?.filingOn ?? request.simulationDate;
  const povertyLaw = v.poverty.value;
  const applicable =
    date >= povertyLaw.i864Effective &&
    date.startsWith(String(povertyLaw.year));
  const multiplier = active ? law.activeDuty : law.regular;
  const listedSize = povertyLaw.i864ListedHouseholdSize;
  const baseline = household?.size
    ? poverty({ ...household, size: Math.min(household.size, listedSize) })
    : undefined;
  const minimum =
    applicable &&
    baseline !== undefined &&
    active !== undefined &&
    household?.region &&
    household.size
      ? Math.round(baseline * multiplier) +
        Math.max(0, household.size - listedSize) *
          Math.round(povertyLaw[household.region].additional * multiplier)
      : undefined;
  const income = a?.household?.incomeUsd;
  const citizenAssets =
    a?.sponsorStatus === 'citizen' &&
    (benefit === 'spouse' ||
      (child === true && atLeast(beneficiaryAge, law.age) === true));
  const unresolvedChildAge =
    a?.sponsorStatus === 'citizen' &&
    benefit === 'unmarried-child' &&
    beneficiaryAge === undefined;
  const ratio = a?.orphanException
    ? law.orphanAssets
    : citizenAssets
      ? law.citizenFamilyAssets
      : law.assets;
  const financial =
    minimum !== undefined && income !== undefined
      ? income >= minimum ||
        (a?.qualifyingAssetsUsd !== undefined
          ? a.qualifyingAssetsUsd >= (minimum - income) * ratio
            ? true
            : unresolvedChildAge &&
                a.qualifyingAssetsUsd >=
                  (minimum - income) * law.citizenFamilyAssets
              ? undefined
              : false
          : undefined)
      : undefined;
  const joint = reviewed(a?.jointSponsor);
  const meetsIncome = any(exempt, financial, joint);
  return [
    check(
      'C25-SUPPORT-INCOME',
      'I-864 收入、资产或合格共同担保',
      'I-864 income, assets or qualified joint sponsor',
      meetsIncome,
      [...s.poverty, ...s.sponsor],
      ['PD-260', 'PD-276'],
      minimum !== undefined
        ? [
            `按地区与家庭人口，年收入门槛 USD ${minimum}。适用资产须补足收入差额的 ${ratio} 倍，或有独立达标共同担保人。`,
            `The regional household threshold is USD ${minimum} per year. Use qualifying assets worth ${ratio} times any income shortfall or an independently qualified joint sponsor.`,
          ]
        : [
            '核对适用年份、地区、家庭人口和收入，或确认无需 I-864。',
            'Confirm the applicable year, region, household size and income, or confirm that I-864 is not required.',
          ],
    ),
    check(
      'C26-SPONSOR',
      'I-864 主担保人的年龄、身份、住所与签署',
      'I-864 primary sponsor age, status, domicile and affidavit',
      any(exempt, sponsor),
      s.sponsor,
      'PD-276',
    ),
    check(
      'C27-SUPPORT-EXEMPTION',
      'I-864 适用或法定豁免',
      'I-864 applicability or statutory exemption',
      usingExemption ? exempt : required === undefined ? undefined : true,
      s.supportExemption,
      'PD-276',
      [
        `核对适用类别、至少 ${law.quarters} 个合格社保季度或其他法定例外。职业路径同时核对亲属申请人或持股门槛。`,
        `Check the classification, at least ${law.quarters} qualifying Social Security quarters, or another statutory exception. For employment cases also check relative petitioners or ownership.`,
      ],
    ),
  ];
}

function permRecruitment(a: UsEmploymentAnswers): Answer {
  const record = a.permRecruitment;
  if (a.perm === 'schedule-a' || !record) return a.recruitmentAndFeesCompliant;
  const law = v.perm.value;
  const timing = record.mandatoryRecruitmentDaysBeforeFiling;
  return all(
    atLeast(record.stateJobOrderDays, law.orderDays),
    atLeast(record.advertisements, law.advertisements),
    timing?.length
      ? timing.every((days) => days >= law.minDays && days <= law.maxDays)
      : undefined,
    atLeast(record.noticeWorkdays, law.noticeWorkdays),
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
      return any(
        paidUsd >= proffered,
        atLeast(netIncomeUsd, proffered - paidUsd),
        atLeast(netCurrentAssetsUsd, proffered - paidUsd),
      );
    },
  );
  const records = annual?.length
    ? all(a?.wagePeriodComplete === true ? true : undefined, ...annual)
    : undefined;
  return any(officer, records, reviewed(a?.abilityToPayTotality));
}

export function employmentChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.employment ?? {};
  const date = request.simulationDate;
  const category = a.category;
  const based = [
    check(
      'EMPLOYMENT-MARRIAGE-FRAUD',
      '既往婚姻欺诈批准禁令',
      'Prior marriage fraud petition bar',
      not(a?.priorMarriageFraud),
      s.petitionBars,
      'PD-274',
    ),
  ];
  if (category === 'eb2-perm' || category === 'eb3') {
    const petition = request.admission?.petitionStatus;
    const priorI140 =
      petition === 'pending' ||
      petition === 'approved' ||
      a.i140FiledOn !== undefined;
    const inconsistentI140Date =
      a.i140FiledOn !== undefined && a.i140FiledOn > date;
    const i140Date = priorI140
      ? a.i140FiledOn
      : request.fees?.channel === 'paper'
        ? nextUsBusinessDay(date)
        : date;
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
    const offer = all(
      a.employmentOffer,
      reviewed(a.categoryQualifications),
      wages,
      permRecruitment(a),
    );
    return [
      ...based,
      check(
        'C28-OFFER-PERM',
        '永久全职工作、职业资格及 PERM',
        'Permanent full-time offer, category qualifications and PERM',
        all(offer, certification),
        s.perm,
        'PD-277',
        [
          'PERM 有效期按使用它的 I-140 收件日核对。拟递交 I-140 时使用预计收件日。',
          'Check PERM validity on the date USCIS received the I-140 using it. For a prospective I-140, use the expected receipt date.',
        ],
        petition === 'approved' ? checkStatus(offer) : undefined,
      ),
      check(
        'C29-ABILITY-TO-PAY',
        '雇主持续支付承诺工资',
        'Employer’s continuing ability to pay the proffered wage',
        abilityToPay(request),
        s.pay,
        'PD-277',
      ),
    ];
  }
  if (category === 'eb1a' || category === 'eb2-niw') {
    const law = v.selfPetition.value;
    const basic = any(
      a.internationalAward,
      atLeast(a.extraordinaryEvidenceCount, law.extraordinaryEvidence),
    );
    const original =
      a.comparableEvidenceAccepted === undefined
        ? basic
        : any(basic, reviewed(a.comparableEvidenceAccepted));
    const qualification = any(
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
    const primary = category === 'eb1a' ? original : qualification;
    const factsAtFiling =
      category === 'eb1a'
        ? all(a.continuesWorkInField, a.benefitsUnitedStates)
        : all(
            a.niwProngs?.nationalImportance,
            a.niwProngs?.wellPositioned,
            a.niwProngs?.waiverBeneficial,
          );
    const merits = all(
      factsAtFiling,
      reviewed(
        category === 'eb1a' ? a.extraordinaryFinalMerits : a.niwDetermination,
      ),
    );
    return [
      ...based,
      check(
        'C30-SELF-PETITION-EVIDENCE',
        '自申类别基础证据',
        'Initial evidence for the self-petition classification',
        primary,
        s.selfPetition,
        'PD-277',
      ),
      check(
        'C30-SELF-PETITION-MERITS',
        'EB-1A 终局审查或 NIW 国家利益',
        'EB-1A final merits or NIW national interest',
        merits,
        s.selfPetition,
        'PD-277',
        undefined,
        checkStatus(factsAtFiling),
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
    const current = date >= law.rulesFrom && date < law.firstAdjustment;
    const minimum =
      input?.project === 'standard'
        ? law.standardUsd
        : input?.project
          ? law.reducedUsd
          : undefined;
    return [
      ...based,
      check(
        'C31-INVESTMENT-AMOUNT',
        'EB-5 投资本金门槛',
        'Minimum EB-5 capital investment',
        current && minimum !== undefined
          ? atLeast(input?.capitalUsd, minimum)
          : undefined,
        s.eb5,
        'PD-264',
        [
          `本版标准项目 USD ${law.standardUsd}，合资格 TEA 或基建 USD ${law.reducedUsd}。自 ${law.firstAdjustment} 起需核对新门槛。`,
          `This schedule uses USD ${law.standardUsd} for standard projects and USD ${law.reducedUsd} for eligible TEA or infrastructure projects. Confirm the new amounts from ${law.firstAdjustment}.`,
        ],
      ),
      check(
        'C31-INVESTMENT-PROJECT',
        '合法资金、在险期限与合资格项目',
        'Lawful funds, at-risk period and qualifying project',
        all(
          reviewed(input?.lawfullySourcedFunds),
          input?.atRisk,
          input?.qualifiesAsNewEnterprise,
          sustainment,
          input?.regionalCenter === false
            ? true
            : input?.regionalCenter
              ? input.projectFiled
              : undefined,
        ),
        s.eb5,
        'PD-278',
        [
          `初次申请核对资金预计持续在险至少 ${law.sustainmentYears} 年。`,
          `The initial petition evaluates whether the capital is expected to remain at risk for at least ${law.sustainmentYears} years.`,
        ],
      ),
      check(
        'C31-INVESTMENT-JOBS',
        '合资格岗位与工时',
        'Qualifying job creation and hours',
        jobs,
        [...s.eb5, ...s.eb5JobPlan],
        'PD-278',
        [
          '初次申请可用已创造的合资格岗位，或有证据支持的招聘计划。',
          'The initial petition can use qualifying jobs already created or a documented job creation plan.',
        ],
      ),
    ];
  }
  if (category === 'gold-card') {
    const gold = a.gold;
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
    return [
      ...based,
      check(
        'C32-GOLD-PROCESS',
        'Gold Card 预登记与领馆流程',
        'Gold Card preregistration and consular process',
        all(
          gold?.registrationAccepted,
          request.admission?.process
            ? request.admission.process === 'consular'
            : undefined,
          request.fees?.channel ? request.fees.channel === 'online' : undefined,
          reviewed(gold?.fundsAndWire),
        ),
        s.gold,
        'PD-276',
      ),
      check(
        'C32-GOLD-GIFT',
        'Gold Card 赠与及按人计处理费',
        'Gold Card gift and per-person processing fee',
        all(
          gift === undefined ? undefined : atLeast(gold?.giftUsd, gift),
          processingFunds,
        ),
        s.gold,
        'PD-276',
        gift === undefined
          ? [
              `主申请人个人赠与 USD ${law.personGiftUsd} 或企业代捐 USD ${law.companyGiftUsd}，每位随行配偶或子女另加 USD ${law.dependentGiftUsd}，处理费为每人 USD ${law.feePerPersonUsd}。`,
              `The principal's gift is USD ${law.personGiftUsd} for self-petitioners or USD ${law.companyGiftUsd} for corporate petitioners. Add USD ${law.dependentGiftUsd} per accompanying spouse or child and a processing fee of USD ${law.feePerPersonUsd} per person.`,
            ]
          : [
              `按赠与方及人数，需赠与 USD ${gift}，另付每人 USD ${law.feePerPersonUsd} 处理费。`,
              `The donor type and number of applicants require a gift of USD ${gift} and a processing fee of USD ${law.feePerPersonUsd} per person.`,
            ],
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
