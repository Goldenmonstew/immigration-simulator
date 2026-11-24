import { addDays } from '../dates';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import {
  all,
  any,
  atLeast,
  atMost,
  checksFor,
  checkStatus,
  not,
  reviewed,
  s,
  v,
} from './check';
import type { Answer } from './check';
import { immediateRelative } from './immigration';
import {
  multipleConvictionBar,
  partyCheck,
  pettyOffense,
} from './naturalization';
import type { UsAdmissionAnswers, UsFullRequest, UsReview } from './types';

function waived(grounds: Answer[], decision: Answer): Answer[] {
  return grounds.map((ground) => (ground === false ? decision : ground));
}

function ordinaryWaiver(grounds: Answer[], waiver?: UsReview): Answer[] {
  return waiver === undefined ? grounds : waived(grounds, reviewed(waiver));
}

function medicalEvidenceCheck(
  a: UsAdmissionAnswers | undefined,
  date: string,
  adjustment: boolean,
): Answer {
  const law = v.medical.value;
  const signed = a?.i693SignedOn;
  const signedValid =
    adjustment && signed
      ? signed <= date &&
        (signed >= law.previousSignatureCutoff ||
          date <= afterYears(signed, law.previousValidityYears))
      : true;
  const linked =
    adjustment && date >= law.applicationLinkedFrom
      ? not(a?.i693LinkedToAnotherClosedCase)
      : true;
  return all(reviewed(a?.medicalEvidence), signedValid, linked);
}

function criminalGrounds(
  a: UsAdmissionAnswers | undefined,
  date: string,
): Answer[] {
  const crime = a?.crime;
  const rule = v.crime.value;
  const juvenile = all(
    atMost(crime?.cimtCount, 1),
    crime?.cimtAgeAtOffense === undefined
      ? undefined
      : crime.cimtAgeAtOffense < rule.juvenileAge,
    crime?.cimtOffenseOrReleaseOn
      ? date > afterYears(crime.cimtOffenseOrReleaseOn, rule.juvenileYears)
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
  date: string,
): Answer {
  const departure = a?.unlawfulDeparture;
  if (departure === 'none') return true;
  if (!departure || departure.leftOn > date) return undefined;
  const law = v.unlawfulPresence.value;
  if (departure.qualifyingDays >= law.longDays)
    return date >= afterYears(departure.leftOn, law.longBarYears);
  if (
    departure.qualifyingDays <= law.shortDays ||
    date >= afterYears(departure.leftOn, law.shortBarYears)
  )
    return true;
  return not(departure.voluntaryBeforeProceedings);
}

export function admissionChecks(
  request: UsFullRequest,
  a: UsAdmissionAnswers | undefined,
  scope: 'immigrant' | 'return' | 'humanitarian' = 'immigrant',
) {
  const check = checksFor(request);
  const date = request.simulationDate;
  const adjustment = a?.process === 'adjustment';
  const consular = a?.process === 'consular';
  const consularInterview = consular && scope === 'immigrant';
  const humanitarian = scope === 'humanitarian';
  const optionalMedicalForm =
    humanitarian && request.humanitarian?.status === 'refugee';
  const approvedExemptBasis =
    scope === 'immigrant' &&
    a?.petitionStatus === 'approved' &&
    ((a.adjustmentBasis === 'vawa' && (adjustment || consular)) ||
      (a.adjustmentBasis === 'sij' && adjustment));
  const publicExempt =
    humanitarian || approvedExemptBasis || a?.publicChargeExempt === true;
  const publicResult = publicExempt ? true : reviewed(a?.publicCharge);
  const noFraud = not(a?.immigrationFraud);
  const falseClaim =
    a?.falseCitizenship === true
      ? a.falseCitizenshipException
      : not(a?.falseCitizenship);
  const other = reviewed(a?.otherInadmissibility);
  const immigration = [
    falseClaim,
    not(a?.unlawfulReentryBar),
    ...ordinaryWaiver(
      [unlawfulPresence(a, date), noFraud, other],
      a?.immigrationWaiver,
    ),
  ];
  const { waiver, waiverFiling } = request.humanitarian ?? {};
  const waiverDecision = waiver === 'not-needed' ? false : reviewed(waiver);
  const waiverMaterials =
    waiverFiling !== undefined
      ? reviewed(waiverFiling)
      : waiver === 'pending' || waiver === 'cleared'
        ? true
        : waiver === 'not-needed'
          ? false
          : undefined;
  const assessGround = (grounds: Answer[], prerequisite: Answer) => {
    return {
      answer: all(
        prerequisite,
        ...(humanitarian ? waived(grounds, waiverDecision) : grounds),
      ),
      filingStatus: humanitarian
        ? checkStatus(all(prerequisite, ...waived(grounds, waiverMaterials)))
        : undefined,
    };
  };
  const party = scope === 'return' ? true : partyCheck(a?.party, date, false);
  const security =
    a?.securityGround === 'clear'
      ? true
      : a?.securityGround === 'nonwaivable' || a?.securityGround === 'other-bar'
        ? false
        : undefined;
  const health = [reviewed(a?.classAHealth), reviewed(a?.vaccines)];
  const medical = assessGround(
    optionalMedicalForm ? health : ordinaryWaiver(health, a?.healthWaiver),
    optionalMedicalForm
      ? reviewed(a?.medicalEvidence)
      : medicalEvidenceCheck(a, date, adjustment || humanitarian),
  );
  const criminal = assessGround(
    criminalGrounds(a, date),
    not(a?.drugTraffickingBar),
  );
  const securityResult = assessGround(
    [security, party],
    a?.securityGround === undefined || a.securityGround === 'pending'
      ? undefined
      : a.securityGround !== 'nonwaivable',
  );
  const immigrationResult = assessGround(immigration, true);
  return [
    check(
      'C36-HEALTH',
      '健康、移民体检与疫苗',
      'Health, immigrant medical exam and vaccination',
      medical.answer,
      consularInterview ? [...s.health, ...s.consularHealth] : s.health,
      'PD-275',
      consularInterview
        ? [
            '收到面谈通知后安排指定医生体检。健康结论、疫苗及体检材料在签证核准前核对。',
            'Arrange the panel physician exam after receiving the interview notice. Health findings, vaccination and the exam report are checked before visa issuance.',
          ]
        : [
            '核对 Class A 传染病、伴有有害行为的疾病、药物滥用、适龄疫苗及当前有效的体检材料。新冠疫苗已从清单移除。',
            'Check Class A infectious diseases, disorders with harmful behavior, drug abuse, age-appropriate vaccination and currently valid medical evidence. COVID-19 vaccination was removed from the list.',
          ],
      consularInterview ? 'NOT_APPLICABLE' : medical.filingStatus,
    ),
    {
      ...check(
        'C37-PUBLIC-CHARGE',
        '公共负担资格或法定豁免',
        'Public charge assessment or statutory exemption',
        publicResult,
        adjustment
          ? [...s.publicCharge, ...s.publicChargeExemptions]
          : s.publicCharge,
        consular ? 'PD-273' : 'PD-261',
        publicExempt
          ? [
              '该类别免公共负担审查。',
              'This category is exempt from public charge review.',
            ]
          : consular
            ? [
                '领馆采用国务院 FAM 口径。需由领馆个案判断现金维持补助和长期机构护理等因素。',
                'The consulate applies State Department FAM guidance and assesses factors including cash support and long-term institutional care.',
              ]
            : date < v.publicCharge.value.effective
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
      s.criminal,
      humanitarian ? ['PD-269', 'PD-275'] : 'PD-269',
      [
        '确认移民法罪名分类、轻罪或未成年例外、合计刑期、毒品与无需定罪的贩运或洗钱事由。',
        'Confirm immigration-law classifications, petty or juvenile exceptions, aggregate sentences, controlled substances and trafficking or money laundering grounds that can apply without a conviction.',
      ],
      criminal.filingStatus,
    ),
    check(
      'C39-SECURITY',
      '国家安全、出口管制及极权党籍',
      'National security, export controls and totalitarian-party membership',
      securityResult.answer,
      consularInterview ? [...s.security, ...s.consularSecurity] : s.security,
      'PD-275',
      undefined,
      consularInterview ? 'NOT_APPLICABLE' : securityResult.filingStatus,
    ),
    check(
      'C40-IMMIGRATION-HISTORY',
      '移民欺诈、虚称公民、非法居留及再入境',
      'Immigration fraud, false citizenship, unlawful presence and reentry',
      immigrationResult.answer,
      s.immigrationBars,
      humanitarian ? ['PD-274', 'PD-275'] : 'PD-274',
      [
        '按合资格非法居留天数与离境日期计算禁令；另核对虚称公民、递解、非法再入境及可用豁免。',
        'Use qualifying unlawful-presence days and the departure date to assess the bars. Separately check false citizenship claims, removal, unlawful reentry and available waivers.',
      ],
      immigrationResult.filingStatus,
    ),
  ];
}

function adjustmentBar(a?: UsAdmissionAnswers, immediate?: Answer): Answer {
  const basis = a?.adjustmentBasis;
  const other =
    a?.otherAdjustmentBar === 'none'
      ? true
      : a?.otherAdjustmentBar === 'barred'
        ? false
        : a?.otherAdjustmentBar === 'vwp'
          ? immediate
          : undefined;
  const exempt = any(immediate, basis === 'vawa' || basis === 'sij');
  const violations = a?.qualifyingViolationsDays;
  const k = all(
    a?.lawfulAdmissionFor245k,
    atMost(violations, v.adjustment.value.kDays),
  );
  const status = any(
    exempt,
    violations === undefined ? undefined : violations === 0,
    basis === 'employment' ? k : basis === undefined ? undefined : false,
  );
  return basis === '245i' ? reviewed(a?.entryException) : all(other, status);
}

export function adjustmentChecks(
  request: UsFullRequest,
  receipt: IsoDate,
  decision: IsoDate,
) {
  const check = checksFor(request);
  const a = request.admission;
  const basis = a?.adjustmentBasis;
  const usesFamilyClassification =
    request.pathway === 'US-FAMILY' ||
    (basis === 'family-preference' && request.family !== undefined);
  const immediate: Answer = usesFamilyClassification
    ? immediateRelative(request.family)
    : basis
      ? basis === 'immediate-relative'
      : request.pathway === 'US-EMPLOYMENT'
        ? false
        : undefined;
  const availability = (value?: UsAdmissionAnswers['visaAtFiling']): Answer =>
    value === 'available' ? true : value === 'unavailable' ? false : undefined;
  const consular = a?.process === 'consular';
  const simulationMonth = request.simulationDate.slice(0, 7);
  const receiptMonth = receipt.slice(0, 7);
  const decisionMonth = decision.slice(0, 7);
  const filingChart =
    a?.process === 'adjustment'
      ? (a.visaAtFilingByMonth?.[receiptMonth] ??
        (receiptMonth === simulationMonth ? a.visaAtFiling : undefined))
      : a?.visaAtFiling;
  const decisionChart =
    a?.visaAtDecisionByMonth?.[decisionMonth] ??
    (decisionMonth === simulationMonth ? a?.visaAtDecision : undefined);
  const visaAtFiling = consular
    ? receipt > request.simulationDate || availability(filingChart)
    : any(immediate, availability(filingChart));
  const visaAtDecision = any(immediate, availability(decisionChart));
  const entry =
    a?.legalEntry === 'admitted' || a?.legalEntry === 'paroled'
      ? true
      : a?.legalEntry === 'without-inspection'
        ? basis === 'vawa'
          ? true
          : basis === 'sij' || basis === '245i'
            ? reviewed(a.entryException)
            : basis === undefined && request.pathway === 'US-ADJUSTMENT'
              ? undefined
              : false
        : undefined;
  const employment = request.employment;
  const employmentBasis =
    basis === 'employment' ||
    (basis === undefined && request.pathway === 'US-EMPLOYMENT');
  const i140Category =
    employment?.category === 'eb1a' ||
    employment?.category === 'eb2-niw' ||
    employment?.category === 'eb2-perm' ||
    employment?.category === 'eb3';
  const usesI140 = employmentBasis && (i140Category || !employment?.category);
  const i140Status = usesI140 ? employment?.i140Status : undefined;
  const i140FiledOn = usesI140 ? employment?.i140FiledOn : undefined;
  const inconsistentI140Date =
    i140FiledOn !== undefined && i140FiledOn > request.simulationDate;
  const petition = a?.petitionStatus ?? i140Status;
  const awaitingPetition =
    petition === 'pending' || petition === 'filed-with-i485';
  const concurrent =
    a?.process === 'adjustment'
      ? usesFamilyClassification ||
        basis === 'immediate-relative' ||
        basis === 'family-preference' ||
        basis === 'vawa' ||
        basis === 'sij' ||
        (employmentBasis &&
          (i140Category ||
            i140Status !== undefined ||
            employment?.category === 'eb5')) ||
        undefined
      : consular
        ? false
        : undefined;
  const qualifyingBasis = reviewed(a?.qualifyingBasis);
  const filingBasis = awaitingPetition
    ? all(concurrent, a?.qualifyingBasis === 'pending' ? true : qualifyingBasis)
    : qualifyingBasis;
  const filing = inconsistentI140Date
    ? undefined
    : all(
        filingBasis,
        visaAtFiling,
        consular ? true : a?.process === 'adjustment' ? entry : undefined,
      );
  return [
    check(
      'C33-VISA-AND-ENTRY',
      '移民类别、签证名额与入境查验',
      'Immigrant basis, visa availability and admission or parole',
      inconsistentI140Date
        ? undefined
        : all(
            filing,
            awaitingPetition ? undefined : qualifyingBasis,
            visaAtDecision,
          ),
      [
        ...s.adjustment,
        ...(consular ? s.consularFiling : []),
        ...(usesFamilyClassification ? s.relationship : []),
      ],
      'PD-272',
      inconsistentI140Date
        ? [
            '已填的 I-140 实际收件日晚于模拟日。请核对收件日和请愿状态。',
            'The reported I-140 receipt is after the simulation date. Verify the receipt date and petition status.',
          ]
        : [
            `境内按 USCIS 收件月份（${receiptMonth}）指定表确认能否递交，领馆材料按 NVC 通知提交。允许同时递交的案件仍须等基础请愿案获批。受排期限制的案件按裁决月份（${decisionMonth}）的 Final Action Dates 确认名额。未满龄或 CSPA 锁龄的美国公民未婚子女可能属于即时亲属。`,
            `Use the USCIS chart designated for the receipt month (${receiptMonth}), or NVC authorization to submit consular documents. Where concurrent filing is allowed, approval still depends on approval of the underlying petition. For numerically limited cases, use the Final Action Dates for the decision month (${decisionMonth}). An unmarried child of a U.S. citizen may qualify as an immediate relative based on age or CSPA protection.`,
          ],
      checkStatus(filing),
    ),
    ...(consular
      ? []
      : [
          check(
            'C34-ADJUSTMENT-BARS',
            '境内调整禁令及 INA 245(k) 例外',
            'Adjustment bars and INA 245(k) exception',
            adjustmentBar(a, immediate),
            s.adjustmentBars,
            'PD-274',
            [
              `合资格职业类按最近一次合法入境后的违规累计最多 ${v.adjustment.value.kDays} 天；假释返美不重置。其他禁令须分别检查。`,
              `Eligible employment applicants may have up to ${v.adjustment.value.kDays} violation days since the last lawful admission. Parole does not reset the count. Check independent bars separately.`,
            ],
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
        ]),
    ...admissionChecks(request, a),
  ];
}

export function humanitarianChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.humanitarian;
  const refugee = a?.status === 'refugee';
  const law = v.humanitarian.value;
  const presence = atLeast(a?.presenceDays, law.presenceDays);
  const approvalRequirementDate =
    a?.presenceDays !== undefined && presence === false
      ? addDays(request.simulationDate, law.presenceDays - a.presenceDays)
      : undefined;
  const statusAtFiling = all(
    a?.statusRetained,
    not(a?.alreadyLpr),
    refugee
      ? true
      : a?.status === 'asylee'
        ? all(a.refugeeDefinitionOrDerivative, not(a.firmlyResettled))
        : undefined,
  );
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
              `在 I-485 裁决时须累积至少一年实际在美时间。若模拟日后持续在美，预计于 ${approvalRequirementDate} 满足。`,
              `Accumulate at least one year of U.S. physical presence by I-485 adjudication. If you remain in the U.S. after the simulation date, you meet it on ${approvalRequirementDate}.`,
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
      s.humanitarian,
      'PD-274',
      undefined,
      checkStatus(statusAtFiling),
    ),
    check(
      'C42-HUMANITARIAN-WAIVER',
      'INA 209(c) 豁免适用性',
      'INA 209(c) exemptions and waivers',
      a?.waiver === 'not-needed' ? true : reviewed(a?.waiver),
      s.humanitarianWaiver,
      'PD-275',
      [
        '免公共负担、劳工证及移民签证文件要求。可豁免事由分别核对能否随案提交材料及豁免是否获准。毒品贩运及指定安全事由不得豁免。',
        'Public charge, labor certification and immigrant document requirements are waived by statute. For waivable grounds, assess the evidence that can be submitted with the application and the waiver decision separately. Drug trafficking and specified security grounds cannot be waived.',
      ],
      'NOT_APPLICABLE',
    ),
    ...admissionChecks(request, request.admission, 'humanitarian'),
  ];
}
