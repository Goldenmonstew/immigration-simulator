import {
  newZealandFull2026_11,
  nzCommonParameters as p,
  nzFamilyParameters,
} from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addMonths, addYears, fullYears } from './dates';
import type { NzRequest } from './new-zealand';
import type { NzResidentAnswers } from './new-zealand-resident';
import { textFor, type Lang } from './rule';
import type { IsoDate, Locale } from './types';

type Answer = boolean | undefined;
export const not = (value: Answer): Answer =>
  value === undefined ? undefined : !value;

// A known failure decides AND; a known success decides OR, even with missing answers.
export const all = (...values: Answer[]): Answer =>
  values.includes(false)
    ? false
    : values.includes(undefined)
      ? undefined
      : true;
export const any = (...values: Answer[]): Answer =>
  values.includes(true) ? true : values.includes(undefined) ? undefined : false;
export const atLeast = (value: number | undefined, minimum: number): Answer =>
  value === undefined ? undefined : value >= minimum;
export const atMost = (value: number | undefined, maximum: number): Answer =>
  value === undefined ? undefined : value <= maximum;

type ResidenceCategory = 'smc' | 'skilled' | 'partner' | 'parent' | 'general';
type OetGrade = 'A' | 'B' | 'C+' | 'C' | 'D' | 'E';
type TestName = keyof typeof p.skilledEnglish.value;

/** One of the evidence routes in SR2.10.1 or SR2.10.10. */
export type NzEnglishEvidence =
  | {
      method: 'test';
      test: TestName | 'oet';
      score?: number;
      grades?: [OetGrade, OetGrade, OetGrade, OetGrade];
      date?: IsoDate;
      inPerson?: boolean;
    }
  | {
      method: 'citizenship';
      eligibleCitizenship?: boolean;
      workOrStudyYearsInSixCountries?: number;
    }
  | {
      method: 'qualification';
      level?: number;
      isBachelor?: boolean;
      eligibleCountry?: boolean;
      academicYearsInSixCountries?: number;
      assessedOrExempt?: boolean;
    }
  | { method: 'none' };

interface Certificate {
  issued?: IsoDate;
  /** Submitted with an earlier application. For medicals INZ must have accepted it as ASH. */
  reusable?: boolean;
}

interface NzEvidence {
  medical?: Certificate & {
    limited?: boolean;
    /** An officer's A4.20(f) decision to use a General certificate in place of a Limited one. */
    generalAsLimited?: 'accepted' | 'declined' | 'pending';
  };
  xray?: Certificate;
  pregnant?: boolean;
  /** Since the previous chest X-ray. */
  consecutiveMonthsInTbRiskCountries?: number;
  freshMedicalRequested?: boolean;
  freshXrayRequested?: boolean;
  /** Includes all citizenship countries and countries with enough cumulative residence during the lookback. */
  policeCountriesComplete?: boolean;
  /** One entry per country. Without country details the entry is a required certificate. */
  police?: (Certificate & {
    isCitizenshipCountry?: boolean;
    monthsInCountryDuringLookback?: number;
    provided?: boolean;
  })[];
  policeWaiverGranted?: boolean;
}

/** One person's facts. Give each included family member a separate record. */
export interface NzPersonAnswers {
  dateOfBirth?: IsoDate;
  identityDocuments?: boolean;
  health?:
    | 'clear'
    | 'assessed-acceptable'
    | 'assessed-unacceptable'
    | 'excluded-from-waiver'
    | 'needs-assessment';
  /** INZ assessor's projected public cost for the applicable acute/chronic period. */
  medicalCostNzd?: number;
  medicalWaiver?: 'granted' | 'declined' | 'pending';
  familyOmission?: boolean;
  character?:
    | 'clear'
    | 'statutory-bar'
    | 'waiver-required'
    | 'pending-charge'
    | 'security-review'
    | 'sanctions-review';
  /** Disclosable sentences; same-proceedings cumulative terms are entered as one. */
  convictions?: { convictionDate: IsoDate; imprisonmentMonths: number }[];
  specialDirection?: 'granted' | 'declined' | 'pending';
  characterWaiver?: 'granted' | 'declined' | 'pending';
  evidence?: NzEvidence;
  english?: NzEnglishEvidence;
  testSpecificallyRequested?: boolean;
  religiousEnglishBackground?: 'accepted' | 'declined' | 'pending';
  registeredForSmc?: boolean;
  esol?: 'paid-and-signed' | 'declined' | 'planned';
}

export interface NzDependantAnswers extends NzPersonAnswers {
  /** A child is a biological or adopted child of the applicant or their included partner. */
  relation?: 'partner' | 'child' | 'other';
  /** Includes the recognised relationship and the applicable partnership evidence. */
  partnershipRequirementsMet?: boolean;
  /** This family member's own RV2 timeline and evidence. Use the original resident visa role. */
  prvApplication?: Partial<
    Pick<
      NzRequest,
      | 'firstArrival'
      | 'residentVisa'
      | 'travelConditionsEnd'
      | 'trips'
      | 'conditions'
    >
  > &
    Pick<NzResidentAnswers, 'travel' | 'prv'> & {
      /** The joint principal is this member's original principal, including a confirmed RV1.20(a)(ii) investor child. */
      linkedToJointPrincipal?: boolean;
    };
  /** For this child: applicable right/consent evidenced, an established exemption, or neither right nor consent. */
  relocationAuthority?:
    'right-evidenced' | 'consent-evidenced' | 'not-required' | 'none';
  single?: boolean;
  hasOwnChildren?: boolean;
  /** Totally or substantially reliant on the applicant or their included partner. */
  financiallyDependent?: boolean;
}

type ResidenceFiling = 'first' | 'permanent' | 'subsequent';

type InclusionCategory = 'partner' | 'parent' | 'business-work';

export interface NzCommonAnswers extends Omit<NzPersonAnswers, 'dateOfBirth'> {
  /** An explicitly empty list confirms there are no accompanying applicants. */
  dependants?: NzDependantAnswers[];
  residenceFiling?: {
    atImmigrationControlArea?: boolean;
    /** For a first resident visa at the border: Australian citizen or holder of an Australian permanent residence visa, R2.40.2(a). */
    eligibleForFirstResidenceAtControlArea?: boolean;
    /** Any omitted partner or dependent child holding or applying for temporary entry on the basis of their relationship to the principal. */
    hasOmittedRelationshipVisaDependant?: boolean;
    /** Every applicant's biological/adopted dependent children unlawfully in NZ, including those not applying. */
    dependentChildrenUnlawfullyInNz?: {
      dateOfBirth?: IsoDate;
      /** Demonstrated lack of removal rights in the jurisdiction specified by R5.125(b). */
      lackOfRemovalRightDemonstrated?: boolean;
    }[];
  };
  /** All fees due at lodgement have been paid or acceptably arranged, or none is due. */
  requiredFeePaid?: boolean;
  levyBasis?:
    | 'ordinary'
    | 'samoan-citizen'
    | 'refugee-or-protected'
    | 'confirmed-exemption'
    | 'under-review';
}

type TimeAnswers = Partial<NzRequest> & Pick<NzRequest, 'simulationDate'>;
export interface NzContext {
  date: IsoDate;
  age?: number;
  locale: Locale;
  time: TimeAnswers;
  history?: NzRequest;
  policyAsOf: string;
  familyOmission?: boolean;
  answers: NzCommonAnswers;
  L: Lang;
  check(
    id: string,
    zh: string,
    en: string,
    met: Answer,
    sources: SourceRef[],
    reasonZh: string,
    reasonEn: string,
    pd?: string,
  ): CountryCheck;
  path(
    id: string,
    zh: string,
    en: string,
    checks: CountryCheck[],
    advisoryIds?: string[],
  ): CountryPathway;
  common(
    category: ResidenceCategory,
    registeredForSmc?: boolean,
  ): CountryCheck[];
  requiredFeePaid?: boolean;
  identityDocumentsComplete?: boolean;
  testSpecificallyRequested?: boolean;
  dependantEligibility(category?: InclusionCategory): CountryCheck;
  residenceFamilyFiling(kind: ResidenceFiling): CountryCheck;
  partnerCommon(otherRequirements: CountryCheck[]): CountryCheck[];
  character(): CountryCheck;
}

function character(person: NzPersonAnswers, date: string): Answer {
  const thresholds = p.character.value;
  const sentences = person.convictions?.filter((c) => c.convictionDate <= date);
  const statutoryBar =
    person.character === 'statutory-bar' ||
    sentences?.some(
      (c) =>
        c.imprisonmentMonths >= thresholds.lifetimeCustodyMonths ||
        (c.imprisonmentMonths >= thresholds.recentCustodyMonths &&
          date < addYears(c.convictionDate, thresholds.lookbackYears)),
    );
  if (statutoryBar && person.specialDirection !== 'granted')
    return person.specialDirection === 'pending' ? undefined : false;
  if (
    person.character === undefined ||
    person.character === 'pending-charge' ||
    person.character === 'security-review' ||
    person.character === 'sanctions-review'
  )
    return undefined;
  if (
    person.character === 'waiver-required' ||
    sentences?.some((c) => c.imprisonmentMonths > 0)
  ) {
    return person.characterWaiver === 'granted'
      ? true
      : person.characterWaiver === 'declined'
        ? false
        : undefined;
  }
  return true;
}

function health(
  person: NzPersonAnswers,
  category: ResidenceCategory,
  otherF2Met: boolean,
): Answer {
  if (person.health === 'excluded-from-waiver') return false;
  if (
    person.health === 'assessed-acceptable' ||
    person.medicalWaiver === 'granted'
  )
    return true;
  const highCost =
    person.medicalCostNzd !== undefined &&
    person.medicalCostNzd > p.health.value.significantCostNzd;
  if (highCost || person.health === 'assessed-unacceptable') {
    if (person.medicalWaiver === 'declined') return false;
    if (category === 'partner' || category === 'parent') {
      if (person.familyOmission) return false;
      if (
        category === 'partner' &&
        person.familyOmission === false &&
        person.health === 'assessed-unacceptable'
      )
        return otherF2Met ? true : undefined;
    }
    return undefined;
  }
  return person.health === 'clear' ? true : undefined;
}

function currentCertificate(
  cert: Certificate | undefined,
  date: string,
  freshMonths: number,
  reuseMonths: number,
  mayReuse: Answer,
): Answer {
  if (!cert?.issued) return undefined;
  if (cert.issued > date) return false;
  if (date < addMonths(cert.issued, freshMonths)) return true;
  return all(
    cert.reusable,
    mayReuse,
    date < addMonths(cert.issued, reuseMonths),
  );
}

function medicalEvidence(
  person: NzPersonAnswers,
  category: ResidenceCategory,
  date: string,
  age?: number,
): Answer {
  const v = p.health.value;
  const e = person.evidence;
  const requiresLimited =
    category === 'partner' ? not(person.familyOmission) : false;
  const form = e?.medical;
  let correctType: Answer;
  if (form?.limited !== undefined && requiresLimited !== undefined) {
    correctType = requiresLimited === form.limited;
    if (requiresLimited && !form.limited)
      correctType =
        form.generalAsLimited === 'pending'
          ? undefined
          : form.generalAsLimited === 'accepted';
  }
  const medical = all(
    correctType,
    currentCertificate(
      e?.medical,
      date,
      v.certificateMonths,
      v.reuseMonths,
      not(e?.freshMedicalRequested),
    ),
  );
  const xrayExempt = any(
    e?.pregnant,
    age === undefined ? undefined : age < v.xrayAge,
  );
  const canReuseXray =
    e?.consecutiveMonthsInTbRiskCountries === undefined
      ? undefined
      : e.consecutiveMonthsInTbRiskCountries < v.tbResidenceMonths;
  const xray = currentCertificate(
    e?.xray,
    date,
    v.certificateMonths,
    v.reuseMonths,
    all(not(e?.freshXrayRequested), canReuseXray),
  );
  return all(medical, any(xrayExempt, xray));
}

function policeEvidence(
  person: NzPersonAnswers,
  category: ResidenceCategory,
  date: string,
  age?: number,
): Answer {
  const v = p.character.value;
  if (age !== undefined && age < v.policeAge) return true;
  const e = person.evidence;
  if (e?.policeWaiverGranted) return true;
  const certificates = e?.police;
  const complete = all(
    e?.policeCountriesComplete,
    certificates && certificates.length > 0,
    ...(certificates ?? []).map((c) => {
      const needed =
        c.isCitizenshipCountry === undefined &&
        c.monthsInCountryDuringLookback === undefined
          ? true
          : any(
              c.isCitizenshipCountry,
              atLeast(c.monthsInCountryDuringLookback, v.residenceMonths),
            );
      const available =
        c.provided === false
          ? false
          : currentCertificate(
              c,
              date,
              v.certificateMonths,
              v.partnershipReuseMonths,
              category === 'partner',
            );
      return any(needed === undefined ? undefined : !needed, available);
    }),
  );
  return age === undefined && complete !== true ? undefined : complete;
}

const testEvidence = p.englishEvidence.value;

function validTest(
  e: Extract<NzEnglishEvidence, { method: 'test' }>,
  date: string,
  registered: Answer,
): Answer {
  if (!e.date) return all(e.inPerson, undefined);
  return all(
    e.inPerson,
    e.date <= date,
    any(
      date <= addYears(e.date, testEvidence.testYears),
      all(registered, date <= addYears(e.date, testEvidence.registeredYears)),
    ),
  );
}

export function skilledEnglish(
  person: NzPersonAnswers,
  date: string,
  principal: boolean,
  registered: Answer,
): Answer {
  const e = person.english;
  if (!e) return undefined;
  if (
    e.method === 'none' ||
    (e.method !== 'test' && person.testSpecificallyRequested)
  )
    return false;
  if (e.method === 'citizenship')
    return all(
      not(person.testSpecificallyRequested),
      e.eligibleCitizenship,
      atLeast(e.workOrStudyYearsInSixCountries, testEvidence.citizenshipYears),
    );
  if (e.method === 'qualification')
    return all(
      not(person.testSpecificallyRequested),
      e.eligibleCountry,
      e.assessedOrExempt,
      any(
        all(
          e.level === undefined
            ? undefined
            : e.level === testEvidence.bachelorLevel,
          e.isBachelor,
          atLeast(e.academicYearsInSixCountries, testEvidence.bachelorYears),
        ),
        all(
          atLeast(e.level, testEvidence.postgraduateLevel),
          atLeast(
            e.academicYearsInSixCountries,
            testEvidence.postgraduateYears,
          ),
        ),
      ),
    );
  const scores = principal ? p.skilledEnglish.value : p.dependantEnglish.value;
  const grades = p.englishOetGrades.value;
  const scoreMet =
    e.test === 'oet'
      ? e.grades?.every(
          (g) => grades.indexOf(g) >= grades.indexOf(principal ? 'C+' : 'C'),
        )
      : atLeast(e.score, scores[e.test]);
  return all(validTest(e, date, registered), scoreMet);
}

export function esolCharge(
  person: NzPersonAnswers,
  date: string,
  registered: Answer,
): number | undefined {
  const e = person.english;
  const v = p.englishEsolBands.value;
  if (!e) return undefined;
  if (e.method === 'none') return v.highFee;
  if (e.method !== 'test') return undefined;
  const valid = validTest(e, date, registered);
  if (valid !== true) return valid === false ? v.highFee : undefined;
  if (e.test === 'oet') {
    const grades = p.englishOetGrades.value;
    return (
      e.grades &&
      (e.grades.every((g) => grades.indexOf(g) >= grades.indexOf('D'))
        ? v.middleFee
        : v.highFee)
    );
  }
  if (e.score === undefined) return undefined;
  if (e.score >= v[`${e.test}Upper`]) return v.upperFee;
  if (e.score >= v[`${e.test}Middle`]) return v.middleFee;
  if (e.test === 'ielts' && e.score >= v.ieltsLow) return v.lowIeltsFee;
  return v.highFee;
}

export function createNzContext(
  time: TimeAnswers,
  answers: NzCommonAnswers,
): NzContext {
  const date = time.simulationDate;
  const age =
    time.dateOfBirth === undefined
      ? undefined
      : fullYears(time.dateOfBirth, date);
  const locale = time.locale ?? 'zh-CN';
  const L = textFor({ locale });
  const { dateOfBirth, residentVisa, firstArrival, trips } = time;
  const history =
    dateOfBirth && residentVisa && firstArrival && trips
      ? { ...time, dateOfBirth, residentVisa, firstArrival, trips }
      : undefined;
  function check(
    id: string,
    zh: string,
    en: string,
    met: Answer,
    sources: SourceRef[],
    reasonZh: string,
    reasonEn: string,
    pd = 'PD-220',
  ): CountryCheck {
    return {
      id,
      title: L(zh, en),
      status: met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET',
      explanation: L(reasonZh, reasonEn),
      sources,
      ...(met === undefined ? { pendingDetails: [pd] } : {}),
    };
  }
  function path(
    id: string,
    zh: string,
    en: string,
    checks: CountryCheck[],
    advisoryIds: string[] = [],
  ): CountryPathway {
    const requirements = checks.filter(
      (c) => c.id !== 'NZ-C6-LEVY' && !advisoryIds.includes(c.id),
    );
    const status = requirements.some((c) => c.status === 'NOT_MET')
      ? 'NOT_MET'
      : requirements.some((c) => c.status === 'UNKNOWN')
        ? 'UNKNOWN'
        : 'MET';
    return {
      id,
      title: L(zh, en),
      checks,
      status,
      ...(status === 'MET' ? { earliestDate: date } : {}),
      assumptions:
        checks.some((c) => c.id === 'NZ-C1' && c.status === 'MET') &&
        [answers, ...(answers.dependants ?? [])].some(
          (person) => person.health === 'clear',
        )
          ? [
              L(
                '按申报的健康情况筛查；最终以 INZ 的体检或豁免决定为准。',
                'Health screening uses the conditions reported. INZ determines medical acceptability or waiver.',
              ),
            ]
          : [],
      decidedBy: requirements.map((c) => c.id),
      pendingDetails: [
        ...new Set(checks.flatMap((c) => c.pendingDetails ?? [])),
      ],
    };
  }
  function household(
    evaluate: (person: NzPersonAnswers, age?: number) => Answer,
  ): Answer {
    return all(
      evaluate(answers, age),
      answers.dependants !== undefined ? true : undefined,
      ...(answers.dependants ?? []).map((d) =>
        evaluate(
          d,
          d.dateOfBirth === undefined
            ? undefined
            : fullYears(d.dateOfBirth, date),
        ),
      ),
    );
  }
  function characterCheck(): CountryCheck {
    return check(
      'NZ-C2',
      '品格与安全审查',
      'Character and security',
      household((person) => character(person, date)),
      [
        ...p.character.sources,
        { srcId: 'SRC-240', locator: 'A5.25.5–10, A5.30, A5.35; R5.100' },
      ],
      '逐人核对须申报的刑期、遣返、虚假陈述和安全问题。法定禁令须有特别指令，普通品格豁免、未决案件或制裁审查须有主管机关结论。',
      'Disclosable sentences, removal, false information and security concerns are checked for everyone included. A statutory bar needs a special direction. Waivers, pending charges and sanctions may require a decision.',
      'PD-231',
    );
  }
  const identityDocumentsComplete = household(
    (person) => person.identityDocuments,
  );

  function dependantEligibility(category?: InclusionCategory): CountryCheck {
    const temporary = category === 'business-work';
    const limits = nzFamilyParameters.parentSponsorship.value;
    const assessments = answers.dependants?.map((person) => {
      if (person.relation === undefined) return undefined;
      if (person.relation === 'partner')
        return all(category !== 'partner', person.partnershipRequirementsMet);
      if (person.relation !== 'child' || category === 'parent') return false;
      const years =
        person.dateOfBirth === undefined
          ? undefined
          : fullYears(person.dateOfBirth, date);
      const minor = years === undefined ? undefined : years < limits.adultAge;
      const youngAdult = atMost(years, limits.childAgeWithoutChildren);
      return all(
        person.single,
        any(
          atLeast(years, p.childRemovalAge.value),
          person.relocationAuthority === undefined
            ? undefined
            : person.relocationAuthority !== 'none',
        ),
        atMost(
          years,
          temporary ? p.temporaryChildMaxAge.value : limits.dependentAge,
        ),
        any(minor, not(person.hasOwnChildren)),
        temporary
          ? any(
              all(minor, person.financiallyDependent !== false),
              person.financiallyDependent,
            )
          : any(youngAdult, person.financiallyDependent),
      );
    });
    return check(
      'NZ-DEPENDANTS',
      '随行家属纳入资格',
      'Eligibility of included family members',
      assessments && all(...assessments),
      temporary
        ? [
            ...p.temporaryChildMaxAge.sources,
            { srcId: 'SRC-251', locator: 'E4.1.15(a)–(b)' },
          ]
        : [
            {
              srcId: 'SRC-230',
              locator: 'R2.1(b), R2.1.10–15, R2.1.30–35, R2.1.45–50',
            },
            ...(category === 'parent'
              ? [{ srcId: 'SRC-243', locator: 'F4.15.1(c), F4.20.1, F4.30.5' }]
              : []),
            ...(category === 'partner'
              ? [{ srcId: 'SRC-242', locator: 'F2.5(a)–(d)' }]
              : []),
          ],
      `逐人核对伴侣关系及子女的单身、子女和经济依赖情况。未满 ${p.childRemovalAge.value} 岁时，按父母是否分居、是否同申及签证类别核对迁居权或另一方同意的证明，或确认该要求不适用。`,
      `Check partnership, and each child's single status, children of their own and financial dependence. For a child under ${p.childRemovalAge.value}, confirm the applicable evidence of removal rights or parental consent, or that the requirement does not apply to the parents' circumstances and visa type.`,
    );
  }

  const filing = answers.residenceFiling;
  const singleApplicant = answers.dependants && answers.dependants.length === 0;
  const validFirstBorderFiling = all(
    filing?.eligibleForFirstResidenceAtControlArea,
    singleApplicant,
  );

  function residenceFamilyFiling(kind: ResidenceFiling): CountryCheck {
    if (filing?.atImmigrationControlArea)
      return check(
        'NZ-FAMILY-FILING',
        '入境管制区递交资格',
        'Eligibility to lodge at an immigration control area',
        kind === 'first'
          ? validFirstBorderFiling
          : kind === 'subsequent' && singleApplicant,
        [{ srcId: 'SRC-230', locator: 'R2.40.2(a), (b)(ii); RV1.10.10' }],
        '入境管制区每份申请仅限一人。首次申请居民签证者须为澳大利亚公民或持澳大利亚永久居民签证。前新西兰居民可在此申请再次居民签证。',
        'Each border application covers one person. A first resident visa applicant must be an Australian citizen or Australian permanent visa holder. Former New Zealand residents may apply here for a subsequent resident visa.',
      );
    return check(
      'NZ-FAMILY-FILING',
      '必须同申的家属',
      'Family members who must be included',
      not(filing?.hasOmittedRelationshipVisaDependant),
      [
        {
          srcId: 'SRC-230',
          locator: 'R2.40(d); Immigration Regulations 2010, reg 20(2A)(a)–(b)',
        },
      ],
      '确认已列入所有基于与主申请人的关系持有或正在申请临时入境类签证的伴侣及受抚养子女。',
      'Include every partner or dependent child who holds or has applied for a temporary entry class visa based on their relationship to the principal applicant.',
    );
  }

  function common(
    category: ResidenceCategory,
    registered?: boolean,
    f2Requirements?: CountryCheck[],
  ): CountryCheck[] {
    const checks = [
      check(
        'NZ-IDENTITY',
        '身份与递交材料',
        'Identity and lodging documents',
        all(identityDocumentsComplete, answers.requiredFeePaid),
        [{ srcId: 'SRC-230', locator: 'R2.40, R2.40.1' }],
        '确认每人的身份证件、照片、规定表格及声明齐备，并确认应缴费已付或已按认可方式安排付款。',
        'Confirm identity documents, photos, required forms and declarations for everyone included, and confirm payment or an accepted arrangement for fees due.',
      ),
      residenceFamilyFiling('first'),
      dependantEligibility(
        category === 'partner' || category === 'parent' ? category : undefined,
      ),
      check(
        'NZ-C1-EVIDENCE',
        '体检与胸片',
        'Medical and chest X-ray certificates',
        household((person, age) =>
          medicalEvidence(person, category, date, age),
        ),
        [{ srcId: 'SRC-239', locator: 'A4.20(a)–(f)' }],
        '逐人核对体检表及有效期。普通伴侣居留须交限定表，适用 R5.96 时须交普通表。以普通表代限定表须有签证官按 A4.20(f) 采纳的结论。复用胸片还须核对结核风险地区居住史。',
        'Check certificate type and validity for each applicant. Partnership residence requires the Limited form unless R5.96 requires the General form. A General form in place of a Limited form requires an officer’s acceptance under A4.20(f). Check TB exposure before X-ray reuse.',
      ),
      characterCheck(),
      check(
        'NZ-C2-POLICE',
        '无犯罪证明',
        'Police certificates',
        household((person, age) => policeEvidence(person, category, date, age)),
        p.character.sources,
        `年满 ${p.character.value.policeAge} 岁通常须提供国籍国和过去 ${p.character.value.lookbackYears} 年累计居住满 ${p.character.value.residenceMonths} 个月各国的证明。核对签发日、伴侣类复用或已获批准的豁免。`,
        `From age ${p.character.value.policeAge}, cover citizenship countries and every country of cumulative residence of ${p.character.value.residenceMonths} months in the last ${p.character.value.lookbackYears} years. Check issue dates, partnership reuse or an approved waiver.`,
      ),
      check(
        'NZ-C4',
        '住房、地址与医疗保险',
        'Housing, address registration and insurance',
        true,
        [
          {
            srcId: 'SRC-230',
            locator: 'R2.40 and R2.40.1, application requirements',
          },
          { srcId: 'SRC-239', locator: 'A4.10.2(d)' },
          { srcId: 'SRC-243', locator: 'R4.10, F4.15.1(f)' },
        ],
        '一般居留资格没有购房、最低面积、住址登记或购买商业医保门槛。担保住宿、同居、Parent Boost 保险及投资期的地址义务按各类别另查。',
        'There is no general home ownership, floor area, address registration or private insurance threshold. Sponsorship, cohabitation, Parent Boost insurance and investment contact obligations depend on the category.',
      ),
    ];
    if (
      date >= p.unlawfulChildRuleFrom.value &&
      !(filing?.atImmigrationControlArea && validFirstBorderFiling === true)
    ) {
      const children = filing?.dependentChildrenUnlawfullyInNz;
      // R5.125(b) lifts this bar only if every affected child meets the exception.
      const exceptions =
        children &&
        all(
          ...children.map((child) =>
            all(
              child.dateOfBirth === undefined
                ? undefined
                : fullYears(child.dateOfBirth, date) < p.childRemovalAge.value,
              child.lackOfRemovalRightDemonstrated,
            ),
          ),
        );
      checks.push(
        check(
          'NZ-R5-125',
          '在新西兰非法居留的受抚养子女',
          'Dependent children unlawfully in New Zealand',
          any(
            all(filing?.atImmigrationControlArea, validFirstBorderFiling),
            exceptions,
          ),
          [
            ...p.unlawfulChildRuleFrom.sources,
            { srcId: 'SRC-230', locator: 'R2.40.2(a), (b)(ii)' },
          ],
          `核对所有申请人的亲生及收养受抚养子女，包括未随行子女。普通递交时，每名在新西兰非法居留的子女均须未满 ${p.childRemovalAge.value} 岁，且申请人能证明无权将其迁出监护或探视权授予国（未授予这些权利时为居住国），才可适用例外。`,
          `Include every applicant’s biological or adopted dependent children, even if not applying. At ordinary lodgement, each child unlawfully in New Zealand must be under ${p.childRemovalAge.value} and the applicant must demonstrate no right of removal from the country granting custody or visitation rights, or the country of residence if no such rights were granted.`,
          'PD-234',
        ),
      );
    }
    // A4.60(d) depends on all applicable F2 requirements, including the other common checks.
    const otherF2Met =
      f2Requirements !== undefined &&
      [...f2Requirements, ...checks].every(
        (condition) => condition.status === 'MET',
      );
    checks.push(
      check(
        'NZ-C1',
        '健康及医疗豁免',
        'Health and medical waiver',
        household((person) => health(person, category, otherF2Met)),
        p.health.sources,
        `须核对每名申请人的健康状况。急性病按 ${p.health.value.acuteYears} 年、慢性病按预计病程评估；成本超过 NZ$${p.health.value.significantCostNzd.toLocaleString('en')}、公共服务供给或其他健康问题须由 INZ 评估。适用的伴侣豁免以其余条件均满足为前提。`,
        `Check each applicant. INZ assesses acute conditions over ${p.health.value.acuteYears} years and chronic conditions over their predicted course. Costs exceeding NZ$${p.health.value.significantCostNzd.toLocaleString('en')}, service demand and other concerns require assessment. A partnership waiver assumes the other requirements are met.`,
        'PD-230',
      ),
    );
    const levy = answers.levyBasis;
    const ordinary = levy === 'ordinary';
    const known = levy !== undefined && levy !== 'under-review';
    checks.push(
      check(
        'NZ-C6-LEVY',
        '移民征费',
        'Immigration levy',
        known ? true : undefined,
        [{ srcId: 'SRC-233', locator: 'A6.11.5, A6.11.15, A6.11.20' }],
        !known
          ? '按递交地、签证类型及国籍或保护身份核实。萨摩亚公民申请居留或符合其他法定豁免时免征。'
          : ordinary
            ? '主申请人按递交时适用费区缴纳征费。'
            : '按所填身份免征移民征费。含征费的历史预算总额不适用于这份申请。',
        !known
          ? 'Confirm the filing band, visa and any nationality or protection exemption. Samoan citizens applying for residence and other exempt applicants pay no levy.'
          : ordinary
            ? 'The principal applicant pays the levy applicable at lodgement.'
            : 'The reported exemption removes the levy. Historical totals including the levy do not apply to this application.',
        'PD-225',
      ),
    );
    if (category === 'smc' || category === 'skilled') {
      const smc = category === 'smc';
      checks.push(
        check(
          'NZ-C3',
          '主申请人英语',
          'Principal applicant English',
          skilledEnglish(answers, date, true, smc ? registered : false),
          [...p.skilledEnglish.sources, ...p.englishEvidence.sources],
          '核对线下考试的成绩与日期，或符合国籍、工作学习经历、经认可学历的免考条件。签证官仍可指定补考。主申不能用 ESOL 抵替。',
          'Check an in-person result and test date, or qualifying citizenship, work, study or assessed qualifications. An officer may specifically require a test. ESOL cannot replace the principal applicant’s evidence.',
          'PD-232',
        ),
      );
      const charges: number[] = [];
      const family = answers.dependants?.map((person) => {
        const age = person.dateOfBirth && fullYears(person.dateOfBirth, date);
        const exempt =
          typeof age === 'number' ? age < testEvidence.dependantAge : undefined;
        const reg = smc ? person.registeredForSmc : false;
        const passed = skilledEnglish(person, date, false, reg);
        if (
          exempt === false &&
          passed !== true &&
          (person.esol === 'planned' || person.esol === 'paid-and-signed')
        ) {
          const amount = esolCharge(person, date, reg);
          if (amount !== undefined) charges.push(amount);
        }
        return any(
          exempt,
          passed,
          person.esol === undefined
            ? undefined
            : person.esol === 'paid-and-signed',
        );
      });
      const fees = charges
        .map((n) => 'NZ$' + n.toLocaleString('en'))
        .join(' + ');
      checks.push(
        check(
          'NZ-C3-FAMILY',
          '随行家属英语或 ESOL',
          'Accompanying family English or ESOL',
          family && all(...family),
          [...p.dependantEnglish.sources, ...p.englishEsolBands.sources],
          `逐人核对：未满 ${testEvidence.dependantAge} 岁免查，其他家属可提交英语证明或签署协议并预付 ESOL。计划付款尚未满足预付要求。${fees ? ' 可按已有资料估算的个人费用为 ' + fees + '。' : ''}`,
          `Check each person aged ${testEvidence.dependantAge} or over for English evidence or signed, prepaid ESOL. Planned payment is still outstanding.${fees ? ' Individual charges estimable from these answers: ' + fees + '.' : ''}`,
          'PD-232',
        ),
      );
    }
    return checks;
  }
  return {
    date,
    age,
    locale,
    time,
    history,
    policyAsOf: newZealandFull2026_11.asOf,
    familyOmission: answers.familyOmission,
    requiredFeePaid: answers.requiredFeePaid,
    identityDocumentsComplete,
    testSpecificallyRequested: answers.testSpecificallyRequested,
    dependantEligibility,
    residenceFamilyFiling,
    partnerCommon: (otherRequirements) =>
      common('partner', undefined, otherRequirements),
    answers,
    L,
    check,
    path,
    common,
    character: characterCheck,
  };
}
