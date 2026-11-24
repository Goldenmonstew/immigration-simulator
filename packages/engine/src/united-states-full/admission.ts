import { afterYears } from '../pilot';
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

function waived(result: Answer, waiver?: UsReview): Answer {
  return result === false && waiver !== undefined ? reviewed(waiver) : result;
}

function medicalCheck(
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
  return all(
    waived(
      all(reviewed(a?.classAHealth), reviewed(a?.vaccines)),
      a?.healthWaiver,
    ),
    reviewed(a?.medicalEvidence),
    signedValid,
    linked,
  );
}

function criminalCheck(
  a: UsAdmissionAnswers | undefined,
  date: string,
): Answer {
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
  const noCrime = all(
    cimt,
    drug,
    not(multipleConvictionBar(crime)),
    reviewed(a?.criminalOtherGround),
    crime?.unclassifiedRecord === false ? true : undefined,
  );
  const waiver =
    crime?.controlledSubstance === 'other' ||
    (crime?.controlledSubstance === 'single-simple-cannabis' &&
      atMost(crime.cannabisGrams, rule.cannabisGrams) === false)
      ? 'barred'
      : a?.criminalWaiver;
  return all(not(a?.drugTraffickingBar), waived(noCrime, waiver));
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
  a = request.admission,
  scope: 'immigrant' | 'return' | 'humanitarian' = 'immigrant',
) {
  const check = checksFor(request);
  const date = request.simulationDate;
  const adjustment = a?.process === 'adjustment';
  const consular = a?.process === 'consular';
  const humanitarian = scope === 'humanitarian';
  const optionalMedicalForm =
    humanitarian && request.humanitarian?.status === 'refugee';
  const publicExempt = humanitarian || a?.publicChargeExempt === true;
  const publicResult = publicExempt ? true : reviewed(a?.publicCharge);
  const noFraud = not(a?.immigrationFraud);
  const falseClaim =
    a?.falseCitizenship === true
      ? a.falseCitizenshipException
      : not(a?.falseCitizenship);
  const other = reviewed(a?.otherInadmissibility);
  const immigration = all(
    falseClaim,
    not(a?.unlawfulReentryBar),
    waived(
      all(unlawfulPresence(a, date), noFraud, other),
      a?.immigrationWaiver,
    ),
  );
  const humanitarianWaiver = request.humanitarian?.waiver;
  const waiver =
    humanitarianWaiver === 'not-needed' ? undefined : humanitarianWaiver;
  const party = scope === 'return' ? true : partyCheck(a?.party, date, false);
  const security =
    a?.securityGround === 'clear'
      ? true
      : a?.securityGround === 'nonwaivable' || a?.securityGround === 'other-bar'
        ? false
        : undefined;
  const medical = optionalMedicalForm
    ? all(
        reviewed(a?.classAHealth),
        reviewed(a?.vaccines),
        reviewed(a?.medicalEvidence),
      )
    : medicalCheck(a, date, adjustment || humanitarian);
  const criminal = criminalCheck(a, date);
  const finalMedical = humanitarian ? waived(medical, waiver) : medical;
  const finalCriminal =
    humanitarian && a?.drugTraffickingBar === false
      ? waived(criminal, waiver)
      : criminal;
  const finalSecurity =
    humanitarian && a?.securityGround !== 'nonwaivable'
      ? waived(all(security, party), waiver)
      : all(security, party);
  return [
    check(
      'C36-HEALTH',
      '健康、移民体检与疫苗',
      'Health, immigrant medical exam and vaccination',
      finalMedical,
      s.health,
      'PD-275',
      [
        '核对 Class A 传染病、伴有有害行为的疾病、药物滥用、适龄疫苗及当前有效的体检材料。新冠疫苗已从清单移除。',
        'Check Class A infectious diseases, disorders with harmful behavior, drug abuse, age-appropriate vaccination and currently valid medical evidence. COVID-19 vaccination was removed from the list.',
      ],
    ),
    check(
      'C37-PUBLIC-CHARGE',
      '公共负担资格或法定豁免',
      'Public charge assessment or statutory exemption',
      publicResult,
      s.publicCharge,
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
      scope === 'return' ? undefined : 'NOT_APPLICABLE',
    ),
    check(
      'C38-CRIMINAL-INADMISSIBILITY',
      '犯罪、毒品、贩运及洗钱事由',
      'Criminal, drug, trafficking and money laundering grounds',
      finalCriminal,
      s.criminal,
      'PD-269',
      [
        '确认移民法罪名分类、轻罪或未成年例外、合计刑期、毒品与无需定罪的贩运或洗钱事由。',
        'Confirm immigration-law classifications, petty or juvenile exceptions, aggregate sentences, controlled substances and trafficking or money laundering grounds that can apply without a conviction.',
      ],
    ),
    check(
      'C39-SECURITY',
      '国家安全、出口管制及极权党籍',
      'National security, export controls and totalitarian-party membership',
      finalSecurity,
      s.security,
      'PD-275',
    ),
    check(
      'C40-IMMIGRATION-HISTORY',
      '移民欺诈、虚称公民、非法居留及再入境',
      'Immigration fraud, false citizenship, unlawful presence and reentry',
      humanitarian ? waived(immigration, waiver) : immigration,
      s.immigrationBars,
      'PD-274',
      [
        '按合资格非法居留天数与离境日期计算禁令；另核对虚称公民、递解、非法再入境及可用豁免。',
        'Use qualifying unlawful-presence days and the departure date to assess the bars. Separately check false citizenship claims, removal, unlawful reentry and available waivers.',
      ],
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

export function adjustmentChecks(request: UsFullRequest) {
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
  const availability = (
    value?: 'available' | 'unavailable' | 'future-bulletin',
  ): Answer =>
    value === 'available' ? true : value === 'unavailable' ? false : undefined;
  const visaAtFiling = any(immediate, availability(a?.visaAtFiling));
  const visaAtDecision = any(immediate, availability(a?.visaAtDecision));
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
  const consular = a?.process === 'consular';
  const filing = all(
    reviewed(a?.qualifyingBasis),
    visaAtFiling,
    consular ? true : a?.process === 'adjustment' ? entry : undefined,
  );
  return [
    check(
      'C33-VISA-AND-ENTRY',
      '移民类别、签证名额与入境查验',
      'Immigrant basis, visa availability and admission or parole',
      all(filing, visaAtDecision),
      usesFamilyClassification
        ? [...s.adjustment, ...s.relationship]
        : s.adjustment,
      'PD-272',
      [
        '境内按 USCIS 当月指定表确认能否递交。领馆材料按 NVC 通知提交。受排期限制的案件须在裁决时有 Final Action Dates 名额。未满龄或 CSPA 锁龄的美国公民未婚子女可能属于即时亲属。',
        'Use the USCIS chart designated for the filing month, or NVC authorization to submit consular documents. A numerically limited case needs a current Final Action Date at decision. An unmarried child of a U.S. citizen may qualify as an immediate relative based on age or CSPA protection.',
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
    ...admissionChecks(request),
  ];
}

export function humanitarianChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.humanitarian;
  const refugee = a?.status === 'refugee';
  const law = v.humanitarian.value;
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
    check(
      'C41-HUMANITARIAN-PRESENCE',
      '难民／庇护批准后的在美时间',
      'U.S. physical presence after refugee admission or asylum grant',
      atLeast(a?.presenceDays, law.presenceDays),
      s.humanitarian,
      'PD-274',
      [
        '在 I-485 裁决时须累积至少一年实际在美时间。难民自抵美日起算永居，庇护者自核准日前一年起算永居。',
        'Accumulate at least one year of U.S. physical presence by I-485 adjudication. Refugee residence dates back to arrival and asylee residence dates back one year from approval.',
      ],
      'NOT_APPLICABLE',
    ),
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
        '免公共负担、劳工证及移民签证文件要求。其他事由须分别判断能否豁免，毒品贩运及指定安全事由不得豁免。',
        'Public charge, labor certification and immigrant document requirements are waived by statute. Other grounds are assessed separately. Drug trafficking and specified security grounds cannot be waived.',
      ],
      'NOT_APPLICABLE',
    ),
    ...admissionChecks(request, request.admission, 'humanitarian'),
  ];
}
