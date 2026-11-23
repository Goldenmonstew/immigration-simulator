import {
  germanyFull2026_11 as policy,
  type CefrLevel,
} from '@uk-immigration/policy-data';
import { addDays } from './dates';
import type { CountryCheck } from './country-result';
import type { DeFullRequest } from './germany-full';
import { all, any, check, src } from './germany-full-shared';
import { germanFamilyLivelihoodException } from './germany-settlement';

const p = policy.values;
type Ruling = 'granted' | 'pending' | 'denied';
type Insurance =
  'statutory' | 'family' | 'equivalent-confirmed' | 'unconfirmed' | 'none';
type NeedBand = keyof typeof p.monthlyNeeds2026.value;

export interface DeCommonAnswers {
  identityEstablished?: boolean;
  nationalityEstablishedOrNotRequired?: boolean;
  passport?: 'valid' | 'recognised-substitute' | 'unconfirmed' | 'none';
  capableOrRepresented?: boolean;
  humanitarianIdentityOrPassportWaiver?: Ruling;
  evidenceAndAttendance?: boolean;
  entry?:
    | 'required-visa-and-disclosed'
    | 'domestic-application'
    | 'waived'
    | 'waiver-pending'
    | 'insufficient';
  security?:
    | 'no-known-ground'
    | 'authority-cleared'
    | 'investigation'
    | 'weighing'
    | 'refusal-ground';
  securityAuthority?: 'clear' | 'pending' | 'refused';
  movedOn?: string;
  registeredOn?: string;
  benefits?: 'none-or-permitted' | 'disqualifying-entitlement' | 'unclassified';
  livelihoodConfirmed?: boolean;
  household?: {
    /** One applicable statutory band per member in the assessed maintenance unit. */
    members?: NeedBand[];
    /** Accepted net amounts after applicable deductions, including enforceable maintenance. */
    countableMonthlyIncome?: number;
    warmRent?: number;
    additionalNeeds?: number;
    uncoveredPremiums?: number;
    sustainable?: boolean;
    scopeAndDeductionsConfirmed?: boolean;
  };
  insurance?: Insurance[];
  livelihoodMedicalWaiver?: Ruling;
  insuranceWaiver?: Ruling;
  spouseContributionMonths?: number;
  creditedCareMonths?: number;
  pensionEquivalentOrMedicalWaiver?: Ruling;
  recognisedEducation?: boolean;
  spouseInHousehold?: boolean;
  employmentAuthorisedOrNotRequired?: boolean;
  permanentProfessionalPermissionOrNotRequired?: boolean;
  spouseEmploymentAuthorised?: boolean;
  spouseProfessionalPermission?: boolean;
  /** An accepted exam or equivalent evidence. A self-assessment is left unknown. */
  provenGerman?: CefrLevel | 'none';
  integrationCoursePassed?: boolean;
  simpleSpokenGerman?: boolean;
  courseRightOrDutyException?: boolean;
  languageWaiver?: Ruling;
  knowledgeWaiver?: Ruling;
  orientationScore?: number;
  knowledgeEvidence?: 'school' | 'interview-accepted' | 'none' | 'pending';
  housing?: {
    authorityAccepted?: boolean;
    localMinimumM2?: number;
    usableM2?: number;
    qualityAndOccupancyConfirmed?: boolean;
    householdAges?: number[];
  };
  address?:
    | 'registered'
    | 'authority-accepted'
    | 'exempt'
    | 'unverified'
    | 'wrong-jurisdiction';
  /** Historical documents can change individual requirements; a pending claim is not a refusal. */
  transition?: 'ordinary' | 'pre-2005' | 'pending' | 'authority-applied';
}

export function householdBudget(req: DeFullRequest): boolean | undefined {
  const h = req.common?.household;
  if (
    !h ||
    !h.scopeAndDeductionsConfirmed ||
    !h.members?.length ||
    h.countableMonthlyIncome === undefined ||
    h.warmRent === undefined ||
    h.additionalNeeds === undefined ||
    h.uncoveredPremiums === undefined ||
    !req.simulationDate.startsWith(p.monthlyNeedsYear.value + '-')
  )
    return undefined;
  const basic = h.members.reduce(
    (sum, band) => sum + p.monthlyNeeds2026.value[band],
    0,
  );
  // Monetary inputs are euros. Compare cents at the budget boundary.
  const need = basic + h.warmRent + h.additionalNeeds + h.uncoveredPremiums;
  return all(
    Math.round(h.countableMonthlyIncome * 100) >= Math.round(need * 100),
    h.sustainable,
  );
}

function waiver(decision?: Ruling) {
  return decision === 'pending' ? undefined : decision === 'granted';
}

function covered(insurance?: Insurance[]) {
  if (!insurance?.length) return undefined;
  return all(
    ...insurance.map((i) => (i === 'unconfirmed' ? undefined : i !== 'none')),
  );
}

export function commonChecks(
  route: string,
  req: DeFullRequest,
): CountryCheck[] {
  const c = req.common ?? {};
  const tests: CountryCheck[] = [];
  const record = (
    id: string,
    zh: string,
    en: string,
    met: boolean | undefined,
    section: string,
    pd: string,
    ...extra: ReturnType<typeof src>[]
  ) => {
    tests.push(
      check(
        req.locale,
        'DE-' + id,
        zh,
        en,
        met,
        [src(100, section), ...extra],
        pd,
      ),
    );
  };
  const refugee = route === 'R05' || route === 'R05-fast';
  const ordinary = [
    'R01',
    'R02',
    'R03',
    'R06',
    'R09',
    'R12',
    'R14',
    'R15',
  ].includes(route);
  record(
    'C01',
    '身份、国籍、认可证件和申请代理',
    'Identity, nationality, accepted documents and representation',
    all(
      c.capableOrRepresented,
      any(
        all(
          c.identityEstablished,
          c.nationalityEstablishedOrNotRequired,
          c.passport === undefined || c.passport === 'unconfirmed'
            ? undefined
            : c.passport !== 'none',
        ),
        refugee || route === 'R09'
          ? waiver(c.humanitarianIdentityOrPassportWaiver)
          : false,
      ),
    ),
    '§§ 3, 5 Abs. 1 Nr. 1a, 4, 80, 81',
    'PD-340',
  );
  record(
    'C01-procedure',
    '提交所需证明并配合到场、采集证件资料',
    'Evidence, attendance and document formalities',
    c.evidenceAndAttendance,
    '§§ 81, 82 Abs. 1, 4–5',
    'PD-340',
  );
  record(
    'C02',
    '入境签证、境内申请资格或豁免',
    'Entry visa, domestic application or exemption',
    refugee ||
      (c.entry === undefined || c.entry === 'waiver-pending'
        ? undefined
        : c.entry !== 'insufficient'),
    '§ 5 Abs. 2–3; § 26 Abs. 3',
    'PD-340',
    src(410, '§§ 39, 41'),
  );
  const medicalApplies = [
    'R01',
    'R02',
    'R03',
    'R05',
    'R09',
    'R12',
    'R14',
    'R15',
  ].includes(route);
  const healthWaiver = medicalApplies
    ? waiver(c.livelihoodMedicalWaiver)
    : false;
  if (!refugee && route !== 'R11') {
    const benefits =
      c.benefits === undefined || c.benefits === 'unclassified'
        ? undefined
        : c.benefits === 'none-or-permitted';
    const livelihood =
      c.livelihoodConfirmed ?? all(householdBudget(req), benefits);
    record(
      'C03',
      '可持续负担家庭生活、暖租及必要保费',
      'Sustainable support for the household, warm rent and insurance',
      any(
        livelihood,
        healthWaiver,
        route === 'R04' ? germanFamilyLivelihoodException(req) : false,
      ),
      '§§ 2 Abs. 3, 5 Abs. 1 Nr. 1, 9 Abs. 2; 9c',
      'PD-341 PD-342',
      src(415, 'Voraussetzungen / Erforderliche Unterlagen'),
      ...p.monthlyNeeds2026.sources,
      src(435, '1 C 21.09, Leitsätze; 1 C 12.10, Leitsatz'),
    );
  }
  if (route !== 'R11')
    record(
      'C04',
      '本人及相关家属的医疗保障',
      'Health cover for the applicant and relevant family members',
      any(
        covered(c.insurance),
        medicalApplies ? waiver(c.insuranceWaiver) : false,
      ),
      '§ 2 Abs. 3 Sätze 1, 3; § 9c Satz 1 Nr. 3',
      'PD-343',
      src(415, 'Krankenversicherung'),
    );
  const familyTransition =
    route === 'R04' &&
    req.permits?.some(
      (permit) =>
        permit.kind === 'german-family' &&
        permit.from <= p.familyTransitionDay.value &&
        (!permit.to || permit.to >= p.familyTransitionDay.value),
    );
  const transition =
    c.transition ??
    (familyTransition
      ? 'pending'
      : req.firstEntry && req.firstEntry >= p.oldTitleBefore.value
        ? 'ordinary'
        : undefined);
  const legacy = transition === 'pre-2005';
  const uncertainTransition =
    transition === 'pending' ||
    (transition === undefined &&
      req.firstEntry !== undefined &&
      req.firstEntry < p.oldTitleBefore.value);
  const spouseSubstitution = ['R01', 'R05', 'R05-fast', 'R09'].includes(route);
  if (route === 'R01' || route === 'R09') {
    const months = req.contributionMonths;
    const threshold = p.generalContributionMonths.value;
    record(
      'C05',
      '本人、同住配偶的养老记录或法定免除',
      'Pension record, cohabiting spouse’s contributions or exemption',
      any(
        months === undefined
          ? undefined
          : months + (c.creditedCareMonths ?? 0) >= threshold,
        c.spouseInHousehold && c.spouseContributionMonths !== undefined
          ? c.spouseContributionMonths >= threshold
          : false,
        route === 'R01' && c.recognisedEducation === true,
        waiver(c.pensionEquivalentOrMedicalWaiver),
        uncertainTransition ? undefined : legacy,
      ),
      '§ 9 Abs. 2 Satz 1 Nr. 3, Satz 6, Abs. 3; § 104 Abs. 2',
      'PD-344 PD-349',
    );
  }
  record(
    'C06',
    '驱逐事由、公共安全与在办调查',
    'Expulsion grounds, public security and pending investigations',
    c.securityAuthority === 'refused' || c.security === 'refusal-ground'
      ? false
      : c.securityAuthority === 'clear' ||
          c.security === 'authority-cleared' ||
          c.security === 'no-known-ground'
        ? true
        : undefined,
    '§§ 5 Abs. 1 Nr. 2–3, Abs. 4, 9 Abs. 2 Nr. 4, 9a Abs. 2 Nr. 5, 54, 58a, 73, 79',
    'PD-345',
  );
  record(
    'C06-authority',
    '主管机关的安全核查结果',
    'Authority security clearance',
    c.securityAuthority === 'refused' || c.security === 'refusal-ground'
      ? false
      : c.securityAuthority === 'clear' || c.security === 'authority-cleared'
        ? true
        : undefined,
    '§§ 73 Abs. 2, 79 Abs. 2',
    'PD-345',
  );
  if ((ordinary && !['R06', 'R15'].includes(route)) || refugee) {
    const own = all(
      c.employmentAuthorisedOrNotRequired,
      c.permanentProfessionalPermissionOrNotRequired,
    );
    record(
      'C07',
      '受雇许可和长期执业资格',
      'Employment and permanent professional authorisation',
      any(
        own,
        spouseSubstitution && c.spouseInHousehold === true
          ? all(c.spouseEmploymentAuthorised, c.spouseProfessionalPermission)
          : false,
      ),
      '§ 9 Abs. 2 Satz 1 Nr. 5–6, Abs. 3 Satz 1; §§ 18c, 26',
      'PD-346',
      src(107, 'Nr. 18c.1.1.5, Druckseite 117'),
    );
  }
  if (ordinary || refugee || route === 'R04') {
    const sentenceFive = !['R02', 'R03', 'R05-fast'].includes(route);
    const oralException =
      sentenceFive && c.courseRightOrDutyException === true
        ? c.simpleSpokenGerman
        : false;
    // An accelerated refugee case needs separate authority confirmation of exceptions.
    const level =
      c.provenGerman ??
      (req.germanC1
        ? p.refugeeFastGerman.value
        : req.germanB1
          ? p.settlementGerman.value
          : undefined);
    const target =
      route === 'R05'
        ? p.refugeeGerman.value
        : route === 'R05-fast'
          ? p.refugeeFastGerman.value
          : p.settlementGerman.value;
    const legacyOral = legacy ? c.simpleSpokenGerman : false;
    if (route !== 'R03')
      record(
        'C08',
        `德语证明（${legacy ? '简单口语' : target}）或获准豁免`,
        `German evidence (${legacy ? 'basic spoken German' : target}) or exemption`,
        any(
          level === undefined ? undefined : level !== 'none' && level >= target,
          route !== 'R05-fast' && c.integrationCoursePassed === true,
          oralException,
          legacyOral,
          waiver(c.languageWaiver),
          uncertainTransition ? undefined : false,
        ),
        '§§ 2 Abs. 9–12, 9 Abs. 2 Nr. 7 und Sätze 2–5, 18c, 26 Abs. 3, 28 Abs. 2, 104 Abs. 2',
        'PD-347 PD-349',
      );
    if (route !== 'R04') {
      const knowledge =
        c.knowledgeEvidence === 'pending'
          ? undefined
          : c.knowledgeEvidence === 'school' ||
              c.knowledgeEvidence === 'interview-accepted'
            ? true
            : c.orientationScore !== undefined
              ? Number.isInteger(c.orientationScore) &&
                c.orientationScore >= 0 &&
                c.orientationScore <= p.citizenshipKnowledgeTest.value.total
                ? c.orientationScore >= p.orientationPass.value
                : undefined
              : c.knowledgeEvidence === 'none'
                ? false
                : undefined;
      record(
        'C09',
        '法律、社会秩序与德国生活知识',
        'Knowledge of the legal and social order and life in Germany',
        any(
          knowledge,
          c.integrationCoursePassed === true,
          oralException,
          waiver(c.knowledgeWaiver),
          uncertainTransition || (route === 'R06' && legacy)
            ? undefined
            : legacy,
        ),
        '§ 9 Abs. 2 Nr. 8, Sätze 2–5; §§ 9a, 18c, 26, 104 Abs. 2',
        'PD-347 PD-349',
        src(412, '§ 17 Abs. 1–2'),
        ...p.orientationPass.sources,
      );
      const h = c.housing;
      record(
        'C10',
        '符合当地居住面积、质量和占用标准',
        'Housing meets local space, quality and occupancy standards',
        h?.authorityAccepted ??
          (h?.usableM2 === undefined || h.localMinimumM2 === undefined
            ? undefined
            : all(
                h.usableM2 >= h.localMinimumM2,
                h.qualityAndOccupancyConfirmed,
              )),
        '§ 2 Abs. 4; § 9 Abs. 2 Nr. 9; § 9a Abs. 2 Nr. 6',
        'PD-348',
        src(108, 'Nr. 2.4.0–2.4.3'),
      );
      if (
        h?.householdAges?.length &&
        h.authorityAccepted === undefined &&
        h.localMinimumM2 === undefined
      ) {
        const guide = p.housingGuidance.value;
        if (!h.householdAges.includes(guide.childBoundary)) {
          const guideArea = h.householdAges.reduce(
            (sum, age) =>
              sum +
              (age < guide.omitUnderAge
                ? 0
                : age < guide.childBoundary
                  ? guide.childArea
                  : guide.olderArea),
            0,
          );
          tests[tests.length - 1].explanation =
            req.locale === 'en'
              ? `Federal guidance gives a reference of ${guideArea} m² for these ages. Local space and occupancy standards still need confirmation.`
              : `按所填年龄，联邦指引参考面积为 ${guideArea} 平方米。仍须核实当地面积和占用标准。`;
        }
      }
    }
  }
  record(
    'C11',
    '主要住所、登记证明和受理机关',
    'Principal address, registration evidence and jurisdiction',
    c.address === undefined || c.address === 'unverified'
      ? undefined
      : c.address !== 'wrong-jurisdiction',
    '§§ 71, 81',
    'PD-348',
    src(413, 'BMG §§ 17, 19, 27'),
  );
  if (c.movedOn && req.simulationDate >= c.movedOn) {
    const by = addDays(c.movedOn, p.registrationWeeks.value * 7);
    const timely =
      c.address === 'exempt' ||
      (c.registeredOn && c.registeredOn <= req.simulationDate
        ? c.registeredOn >= c.movedOn && c.registeredOn <= by
        : undefined);
    record(
      'C11-deadline',
      `入住登记期限（${by}）`,
      `Residence registration deadline (${by})`,
      timely,
      '§§ 71, 81',
      'PD-348',
      src(413, 'BMG §§ 17, 19, 27'),
    );
  }
  record(
    'C12',
    '历史居留文件与过渡条款',
    'Historical permits and transitional provisions',
    transition === undefined || transition === 'pending' ? undefined : true,
    '§ 104 Abs. 1, 2, 5, 7, 8',
    'PD-349',
  );
  return tests;
}
