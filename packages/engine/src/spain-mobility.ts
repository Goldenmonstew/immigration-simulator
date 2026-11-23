import { spainFull2026_11 as policy } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addMonths, addYears, fullYears } from './dates';
import { afterYears } from './pilot';
import { textFor } from './rule';
import type { EsFullRequest } from './spain-full';
import {
  all,
  any,
  applicationFee,
  byFilingDeadline,
  check,
  pathway,
  projectFilingDates,
} from './spain-full-common';
import type { EsApplicationFee } from './spain-full-common';
import {
  familyResourcesCheck,
  insuranceCheck,
  insuranceEvidence,
} from './spain-residence';
import type { EsFamilyResources, EsHealthCover } from './spain-residence';
import type { IsoDate } from './types';

const v = policy.values;
const rd = (locator: string) => ({ srcId: 'SRC-083', locator });
const holderGuide = {
  srcId: 'SRC-345',
  locator: 'Hoja 51, requisitos y documentación exigible',
};
const familyGuide = {
  srcId: 'SRC-345',
  locator: 'Hoja 52, requisitos y documentación a aportar',
  url: 'https://www.inclusion.gob.es/web/migraciones/w/51.-residencia-de-larga-duracion-en-espana-del-residente-de-larga-duracion-ue-en-otro-eemm-de-la-ue-duplicar-0',
};

type Purpose = 'non-working' | 'employment' | 'self-employment' | 'exempt-work';
type CardCategory = 'initial-temporary' | 'renewed-temporary' | 'public-ward';

interface Application {
  /** Date actually filed. Defaults to a proposed filing on the simulation date. */
  filedOn?: IsoDate;
  /** Positive confirmation that the application is being made before entry. */
  beforeEntry?: boolean;
  enteredOn?: IsoDate;
  /** Non-working dates in the applicable official filing calendar, in addition to weekends. */
  officeHolidays?: IsoDate[];
  thirdCountryNational?: boolean;
  validPassportOrTravelDocument?: boolean;
  signedEx11?: boolean;
  competentOffice?: boolean;
  fee?: EsApplicationFee;
  grant?: {
    notifiedOn?: IsoDate;
    inSpainWhenNotified?: boolean;
    enteredAfterGrantOn?: IsoDate;
    registeredSocialSecurityOn?: IsoDate;
    appliedForCardOn?: IsoDate;
    permitEnd?: IsoDate;
    cardCategory?: CardCategory;
    cardFeePaidEur?: number;
  };
}

interface Employment {
  birthDate?: IsoDate;
  minorConditionsAndConsent?: boolean;
  signedContinuousContract?: boolean;
  startsWhenPermitEffective?: boolean;
  compliesWithCollectiveAgreement?: boolean;
  qualifiedForOccupation?: boolean;
  annualGrossSalary?: number;
  employer?: {
    kind?: 'individual' | 'company';
    taxAndSocialSecurityCurrent?: boolean;
    projectAndPayrollSupported?: boolean;
    householdSize?: number;
    monthlyResourcesAfterGrossSalary?: number;
  };
}

type ExemptionBasis =
  | 'public-research'
  | 'university'
  | 'cultural-institution'
  | 'intergovernmental-cooperation'
  | 'correspondent'
  | 'scientific-mission'
  | 'religious'
  | 'international-organisation-representative'
  | 'eu-posting'
  | 'specific-performance'
  | 'none';

interface FamilyRelationship {
  kind?: 'spouse' | 'partner' | 'child' | 'represented' | 'ascendant' | 'other';
  birthDate?: IsoDate;
  soleGenuineUnseparatedSpouse?: boolean;
  previousMarriagesResolved?: boolean; // Includes no previous marriage.
  exclusivePartnershipEffectiveInSpain?: boolean;
  childOfSponsorOrPartner?: boolean;
  adoptionRecognisedIfApplicable?: boolean;
  soleCustodyAndSupportIfApplicable?: boolean;
  disabledAndUnableToProvideForSelf?: boolean;
  legalRepresentationValidInSpain?: boolean;
  unableToProvideForSelfDueToHealth?: boolean;
  dependentFirstDegreeAscendant?: boolean;
  residenceInSpainNecessary?: boolean;
  humanitarianGroundsApproved?: boolean;
}

export interface EsMobilityFacts {
  /** Valid EU long-term resident status in another participating Member State. */
  otherMemberStatus?: 'eu-long-term' | 'national-only' | 'none' | 'unconfirmed';
  purpose?: Purpose;
  holder?: Application & {
    statusDocument?: boolean;
    healthCover?: EsHealthCover & {
      /** Whether the holder's cover also includes the family member applying. */
      coversFamilyMember?: boolean;
    };
    nonWorking?: {
      dependants?: number;
      monthlyNonWorkIncome?: number;
      availableCapitalEur?: number;
      confirmedCoverageMonths?: number;
      sourceAndAvailabilityDocumented?: boolean;
      accommodationAvailable?: boolean;
      accommodationDocumented?: boolean;
    };
    employment?: Employment;
    selfEmployment?: {
      businessPermits?: boolean;
      professionalQualifications?: boolean;
      investmentAndJobsSupported?: boolean;
    };
    exemptWork?: {
      basis?: ExemptionBasis;
      activityAndInstitutionQualify?: boolean;
      formalEvidence?: boolean;
      specificPerformanceAccepted?: boolean;
    };
    noRefusalAlert?: boolean;
    noReturnBar?: boolean;
    /** Officials' public order, security and health assessment, including police records. */
    securityDecision?: 'cleared' | 'adverse' | 'pending';
    separateWorkFeeRequired?: boolean;
    separateWorkFeePaid?: boolean;
    spanishEuLongTermGranted?: boolean;
  };
  family?: Application & {
    healthCover?: EsHealthCover;
    priorFamilyUnitAndResidenceProved?: boolean;
    noRefusalAlert?: boolean;
    principalFiledOn?: IsoDate;
    principalDecision?: 'granted' | 'refused' | 'pending';
    relationship?: FamilyRelationship;
    resources?: EsFamilyResources;
  };
}

const administrativeCalendar = {
  srcId: 'SRC-090',
  locator: 'art. 30.2, 30.4–6 (pp29–30)',
};
function filedInTime(app: Application, day: IsoDate) {
  if (app.enteredOn)
    return byFilingDeadline(
      day,
      addMonths(app.enteredOn, v.mobilityApplicationMonths.value),
      app.officeHolidays,
    );
  return app.beforeEntry === true ? true : undefined;
}

function relationshipMet(f: FamilyRelationship, day: IsoDate) {
  const age = f.birthDate ? fullYears(f.birthDate, day) : undefined;
  const child =
    typeof age === 'number' ? age < v.reunificationAge.value.adult : undefined;
  switch (f.kind) {
    case 'spouse':
      return all(f.soleGenuineUnseparatedSpouse, f.previousMarriagesResolved);
    case 'partner':
      return f.exclusivePartnershipEffectiveInSpain;
    case 'child':
      return all(
        f.childOfSponsorOrPartner,
        f.adoptionRecognisedIfApplicable,
        f.soleCustodyAndSupportIfApplicable,
        any(child, f.disabledAndUnableToProvideForSelf),
      );
    case 'represented':
      return all(
        f.legalRepresentationValidInSpain,
        any(child, f.unableToProvideForSelfDueToHealth),
      );
    case 'ascendant': {
      const birthday =
        f.birthDate &&
        addYears(f.birthDate, v.reunificationAge.value.ascendant);
      // The law uses both "older than" and "younger than"; it does not settle the birthday itself.
      const older = birthday && day !== birthday ? day > birthday : undefined;
      return all(
        f.dependentFirstDegreeAscendant,
        f.residenceInSpainNecessary,
        any(older, f.humanitarianGroundsApproved),
      );
    }
    case 'other':
      return false;
  }
}

function afterGrant(
  req: EsFullRequest,
  app: Application,
  kind: 'M' | 'F',
  purpose?: Purpose,
) {
  const L = textFor(req);
  const {
    notifiedOn,
    enteredAfterGrantOn,
    inSpainWhenNotified,
    registeredSocialSecurityOn,
    appliedForCardOn,
    permitEnd,
    cardCategory,
    cardFeePaidEur,
  } = app.grant ?? {};
  const observed = (date?: IsoDate) =>
    date && date <= req.simulationDate ? date : undefined;
  const notified = observed(notifiedOn);
  const entered = observed(enteredAfterGrantOn);
  const registered = observed(registeredSocialSecurityOn);
  const deadline = notified && addMonths(notified, v.mobilityEntryMonths.value);
  const inTime = (event?: IsoDate) =>
    deadline && notified && event
      ? event >= notified && event <= deadline
      : undefined;
  const entry =
    inSpainWhenNotified === true
      ? true
      : inSpainWhenNotified === false
        ? inTime(entered)
        : undefined;
  const arrival = inSpainWhenNotified === true ? notified : entered;
  const needsAlta = kind === 'M' && purpose !== 'non-working';
  const effective = needsAlta ? registered : arrival;
  const alta = needsAlta
    ? purpose && registered && arrival
      ? all(inTime(registered), registered >= arrival)
      : undefined
    : true;
  const effectiveness = all(notified ? true : undefined, entry, alta);
  const id = kind === 'M' ? 'ES-M09' : 'ES-F05-effective';
  const sources = [
    rd(kind === 'M' ? 'art. 179.4–7 (p132)' : 'art. 180.4–8 (pp132–133)'),
  ];
  const entryMonths = v.mobilityEntryMonths.value;
  const activation = check(
    L,
    id,
    `获准后：通知时在西班牙，或在通知后 ${entryMonths} 个月内入境。${needsAlta ? '从业者须在同一期限内办理社保 alta。' : ''}`,
    `After approval: already in Spain on notification, or entered within ${entryMonths} months.${needsAlta ? ' For work, social security registration (alta) is due within the same period.' : ''}`,
    effectiveness,
    sources,
    needsAlta ? ['PD-293'] : [],
  );
  if (
    kind === 'F' &&
    effective &&
    permitEnd &&
    permitEnd <= addMonths(effective, v.familyCardThresholdMonths.value)
  )
    return [activation];
  const cardDeadline =
    effective && addMonths(effective, v.firstCardMonths.value);
  const applied = observed(appliedForCardOn);
  const needsCard =
    kind === 'M' ||
    (!!effective &&
      !!permitEnd &&
      permitEnd > addMonths(effective, v.familyCardThresholdMonths.value));
  const cardInTime =
    needsCard && effectiveness === true && applied && effective && cardDeadline
      ? all(
          applied >= effective,
          byFilingDeadline(applied, cardDeadline, app.officeHolidays),
        )
      : undefined;
  const card = check(
    L,
    id + '-card',
    `获准后：${kind === 'F' ? '团聚许可超过 ' + v.familyCardThresholdMonths.value + ' 个月时，' : ''}许可生效起 ${v.firstCardMonths.value} 个月内亲自申请 TIE。${kind === 'M' ? '首卡有效 ' + v.initialCardYears.value + ' 年。' : ''}`,
    `After approval: apply for the TIE in person within ${v.firstCardMonths.value} month of the permit taking effect${kind === 'F' ? ', for family permits longer than ' + v.familyCardThresholdMonths.value + ' months' : ''}.${kind === 'M' ? ' The first card lasts ' + v.initialCardYears.value + ' years.' : ''}`,
    cardInTime,
    [...sources, administrativeCalendar],
    kind === 'F' ? ['PD-099', 'PD-294'] : ['PD-099'],
  );
  if (kind === 'M') return [activation, card];

  const fees = {
    'initial-temporary': v.initialTemporaryCardFeeEur.value,
    'renewed-temporary': v.renewedTemporaryCardFeeEur.value,
    'public-ward': v.publicWardCardFeeEur.value,
  };
  const fee = cardCategory && fees[cardCategory];
  return [
    activation,
    card,
    check(
      L,
      'ES-F05-card-fee',
      `发卡：按获发卡类别核对 790-012 费用${fee === undefined ? '，须先确认费目' : ' EUR ' + fee.toFixed(2)}。`,
      `Card issuance: check the 790-012 charge${fee === undefined ? ' once the card category is confirmed' : ' of EUR ' + fee.toFixed(2)}.`,
      needsCard &&
        (applied ?? req.simulationDate) >= v.feeScheduleFrom.value &&
        fee !== undefined &&
        (cardFeePaidEur !== undefined || fee === v.publicWardCardFeeEur.value)
        ? (cardFeePaidEur ?? 0) === fee
        : undefined,
      [...sources, { srcId: 'SRC-325', locator: 'anexo 4.2, 4.3, 4.7' }],
      ['PD-294'],
    ),
  ];
}

function mobilityApplication(
  req: EsFullRequest,
  kind: 'M' | 'F',
): CountryPathway {
  const L = textFor(req);
  const m = req.mobility ?? {};
  const h = m.holder ?? {};
  const f = m.family ?? {};
  const app = kind === 'M' ? h : f;
  const day = app.filedOn ?? req.simulationDate;
  const annual = (year: number) => day.startsWith(String(year) + '-');
  const status =
    m.otherMemberStatus && m.otherMemberStatus !== 'unconfirmed'
      ? m.otherMemberStatus === 'eu-long-term'
      : undefined;
  const identity = all(
    app.thirdCountryNational,
    status,
    app.validPassportOrTravelDocument,
    app.signedEx11,
    app.competentOffice,
    filedInTime(app, day),
  );
  const decisionMonths = v.mobilityDecisionMonths.value;
  const assumptions = [
    L(
      `法定决定期限为 ${decisionMonths} 个月，超期可构成否定默示。本结果须核对通知、暂停及补件记录。递交和申卡截止日顺延至下一工作日，超过周末顺延期而未提供当地假日表时待确认（PD-099）。`,
      `The decision period is ${decisionMonths} months, with negative administrative silence. Check the file for notice, suspensions and requests for evidence. Filing and card deadlines extend to the next working day. Beyond a weekend extension the local holiday calendar is needed (PD-099).`,
    ),
  ];
  if (kind === 'F') {
    const principalFiled = f.principalFiledOn ?? h.filedOn;
    const submittedInOrder = principalFiled ? principalFiled <= day : undefined;
    const relative = f.relationship;
    const ascendantBirthday =
      relative?.kind === 'ascendant' &&
      relative.birthDate &&
      addYears(relative.birthDate, v.reunificationAge.value.ascendant);
    const checks = [
      check(
        L,
        'ES-F01',
        `家属此前在发证成员国作为持有人的家属居住、有证明，持有效完整旅行证件、签署 EX-11、无拒入标记，向主管辖区在入西前或入境 ${v.mobilityApplicationMonths.value} 个月内递交，且主件已递交或同批递交。`,
        `The third-country family member lived with the holder as family in the issuing Member State, has evidence, a valid complete travel document, signed EX-11 and no entry alert, and files with the competent office before entry or within ${v.mobilityApplicationMonths.value} months, alongside or after the principal.`,
        all(
          identity,
          f.priorFamilyUnitAndResidenceProved,
          f.noRefusalAlert,
          submittedInOrder,
          f.principalDecision === 'refused' ? false : true,
        ),
        [rd('art. 180.1–4 (pp132–133)'), familyGuide, administrativeCalendar],
        ['PD-099'],
      ),
      check(
        L,
        'ES-F02',
        '关系属于法定团聚亲属，且已证实适用的婚姻或伴侣、监护、扶养、年龄及人道条件。',
        'The relationship is eligible for reunification, with the applicable marriage, partnership, custody, dependency, age or humanitarian grounds evidenced.',
        relationshipMet(f.relationship ?? {}, day),
        [rd('art. 180.1 (p132)'), ...v.reunificationAge.sources, familyGuide],
        day === ascendantBirthday ? ['PD-294'] : [],
      ),
      familyResourcesCheck(
        { ...req, simulationDate: day },
        f.resources,
        'ES-F03',
      ),
    ];
    if (!m.purpose || m.purpose === 'non-working') {
      checks.push(
        check(
          L,
          'ES-F04',
          '主申请人以非工作为居留目的时，随迁家属须有递交时在西班牙有效的公共医保或获准承保且保障相当的私保。家属可提供自己的凭证，也可提供覆盖本人的主申请人医保证明。',
          'If the holder applies for non-working residence, document public entitlement or authorised equivalent private cover in Spain at filing. The family member may use their own evidence or the holder’s cover if it includes them.',
          m.purpose
            ? any(
                insuranceEvidence(day, f.healthCover),
                all(
                  h.healthCover?.coversFamilyMember,
                  insuranceEvidence(day, h.healthCover),
                ),
              )
            : undefined,
          [rd('arts. 179.3.d.1º, 180.3.e (pp131–132)'), familyGuide],
          ['PD-291'],
        ),
      );
    }
    const principalApproved =
      f.principalDecision === 'pending' || !f.principalDecision
        ? undefined
        : f.principalDecision === 'granted';
    const info = [
      check(
        L,
        'ES-F01-grant',
        '核准阶段：主件须在家属获批之前或同时获批。',
        'At approval: the principal must be approved before or at the same time as the family member.',
        principalApproved,
        [rd('art. 180.4 (pp132–133)')],
      ),
      applicationFee(L, 'ES-F05', f.fee, day),
      ...afterGrant(req, f, 'F'),
    ];
    return pathway(
      'ES-F',
      L(
        '跨境长期居民的随迁家属',
        'Family of an EU long-term resident moving to Spain',
      ),
      checks,
      info,
      assumptions,
    );
  }

  const checks: CountryCheck[] = [
    check(
      L,
      'ES-M01',
      `第三国公民持另一成员国的有效欧盟长居身份与证明、有效完整旅行证件及签署的 EX-11，说明居住目的，向主管辖区在入西前或入境 ${v.mobilityApplicationMonths.value} 个月内申请。`,
      `A third-country national holds documented EU long-term resident status in another Member State, a valid complete travel document and signed EX-11, and declares the purpose to the competent office before entry or within ${v.mobilityApplicationMonths.value} months.`,
      all(identity, h.statusDocument, m.purpose ? true : undefined),
      [
        rd('art. 179.1–3 (p131)'),
        { srcId: 'SRC-320', locator: 'art. 32.3' },
        holderGuide,
        administrativeCalendar,
      ],
      ['PD-099'],
    ),
  ];
  if (m.purpose === 'non-working') {
    const n = h.nonWorking ?? {};
    const factors = v.mobilityNonWorkingFactors.value;
    const monthly =
      n.dependants !== undefined && n.dependants >= 0
        ? v.ipremMonthly.value *
          (factors.applicant + factors.dependant * n.dependants)
        : undefined;
    const periodTotal =
      monthly !== undefined &&
      n.confirmedCoverageMonths &&
      n.confirmedCoverageMonths > 0
        ? monthly * n.confirmedCoverageMonths
        : undefined;
    let sufficient: boolean | undefined;
    if (annual(v.ipremYear.value) && monthly !== undefined) {
      const income = n.monthlyNonWorkIncome;
      const capital = n.availableCapitalEur;
      if (income !== undefined && income >= monthly) sufficient = true;
      else if (
        periodTotal !== undefined &&
        capital !== undefined &&
        n.confirmedCoverageMonths
      ) {
        const provided = capital + (income ?? 0) * n.confirmedCoverageMonths;
        sufficient =
          provided >= periodTotal
            ? true
            : income === undefined
              ? undefined
              : false;
      } else if (income !== undefined && capital === 0) sufficient = false;
    }
    // Hoja 51 requires accommodation but does not specify every acceptable form of proof (PD-292).
    const accommodation =
      n.accommodationAvailable === false
        ? false
        : n.accommodationDocumented || undefined;
    checks.push(
      check(
        L,
        'ES-M02',
        `非营利居住须证明可动用的非工作资金。Hoja 51 另列住所要求，证明形式待确认时须向主管机关核实。${v.ipremYear.value} 年参考${monthly === undefined ? '取决于随行受扶养人数' : '每月 EUR ' + monthly}${periodTotal === undefined ? '' : '，已确认期间合计 EUR ' + periodTotal}；其他年度另核。`,
        `Document available non-work resources. Hoja 51 also requires accommodation. Check with the competent office if the form of proof is uncertain. The ${v.ipremYear.value} reference ${monthly === undefined ? 'depends on the number of dependants' : 'is EUR ' + monthly + ' a month'}${periodTotal === undefined ? '' : ', EUR ' + periodTotal + ' for the confirmed period'}. Other years need verification.`,
        all(sufficient, n.sourceAndAvailabilityDocumented, accommodation),
        [
          rd('arts. 61–62, 179.3.d.1º (pp51–52, 131)'),
          holderGuide,
          ...v.ipremMonthly.sources,
        ],
        ['PD-292'],
      ),
      insuranceCheck({ ...req, simulationDate: day }, h.healthCover, 'ES-M03'),
    );
  }
  if (m.purpose === 'employment') {
    const e = h.employment ?? {};
    const age = e.birthDate ? fullYears(e.birthDate, day) : undefined;
    const ageRules = v.employmentAge.value;
    const ageMet =
      age === undefined
        ? undefined
        : all(
            age >= ageRules.minimum,
            age >= ageRules.unrestricted ? true : e.minorConditionsAndConsent,
          );
    const salary =
      annual(v.smiYear.value) && e.annualGrossSalary !== undefined
        ? e.annualGrossSalary >= v.smiAnnual.value
        : undefined;
    checks.push(
      check(
        L,
        'ES-M04',
        `双方签署持续工作合同，起效与许可挂钩，符合当地集体协议和职业资质。自 ${ageRules.minimum} 岁起可受雇，未满 ${ageRules.unrestricted} 岁另核限制与授权。${v.smiYear.value} 年全时年工资基准 EUR ${v.smiAnnual.value}，兼职也按全年全时基准核对。`,
        `Signed continuous employment starting on permit effectiveness, compliant with the local collective agreement and professional qualifications. Minimum age ${ageRules.minimum}, with restrictions and consent below ${ageRules.unrestricted}. The ${v.smiYear.value} gross full-time annual floor of EUR ${v.smiAnnual.value} applies to part-time contracts too.`,
        all(
          ageMet,
          salary,
          e.signedContinuousContract,
          e.startsWhenPermitEffective,
          e.compliesWithCollectiveAgreement,
          e.qualifiedForOccupation,
        ),
        [
          rd('arts. 74.1.b–c,f, 179.3.d.2º'),
          ...v.smiAnnual.sources,
          ...v.employmentAge.sources,
        ],
        ['PD-293'],
      ),
    );
    const employer = e.employer ?? {};
    const { householdSize, monthlyResourcesAfterGrossSalary } = employer;
    const factors = v.employerSmiFactors.value;
    const factor =
      householdSize === 1
        ? factors.single
        : householdSize && householdSize >= factors.pairSize
          ? factors.pair + (householdSize - factors.pairSize) * factors.extra
          : undefined;
    const needed =
      employer.kind === 'individual' && factor !== undefined
        ? factor * v.smiMonthly.value
        : undefined;
    const employerMeans =
      employer.kind === 'company'
        ? true
        : annual(v.smiYear.value) &&
            needed !== undefined &&
            monthlyResourcesAfterGrossSalary !== undefined
          ? monthlyResourcesAfterGrossSalary >= needed
          : undefined;
    checks.push(
      check(
        L,
        'ES-M05',
        `雇主税务、社保及项目和工资履约能力已证实。${needed === undefined ? '自然人另查支付总工资后的家户资金。' : v.smiYear.value + ' 年该家户付薪后每月至少 EUR ' + needed.toFixed(2) + '。'}`,
        `Employer tax, social security, project and payroll obligations are supported. ${needed === undefined ? 'Individual employers must also document household funds after gross payroll.' : 'Monthly resources after payroll for this household in ' + v.smiYear.value + ': EUR ' + needed.toFixed(2) + '.'}`,
        all(
          employer.taxAndSocialSecurityCurrent,
          employer.projectAndPayrollSupported,
          employerMeans,
        ),
        [
          rd('arts. 74.1.d–e, 76, 179.3.d.2º'),
          ...v.smiMonthly.sources,
          holderGuide,
        ],
        ['PD-293'],
      ),
    );
  }
  if (m.purpose === 'self-employment') {
    const s = h.selfEmployment ?? {};
    checks.push(
      check(
        L,
        'ES-M06',
        '依法有开业许可、职业资格、足额投资及项目就业证明（含本人自雇）。',
        'Document the required business licences, professional qualifications, sufficient investment and jobs created, including self-employment.',
        all(
          s.businessPermits,
          s.professionalQualifications,
          s.investmentAndJobsSupported,
        ),
        [rd('arts. 84.a–c, 179.3.d.2º'), holderGuide],
        ['PD-293'],
      ),
    );
  }
  if (m.purpose === 'exempt-work') {
    const e = h.exemptWork ?? {};
    const eligible =
      e.basis === 'specific-performance'
        ? e.specificPerformanceAccepted
        : e.basis
          ? e.basis !== 'none'
          : undefined;
    checks.push(
      check(
        L,
        'ES-M07',
        '有适用的法定工签豁免类别，且有活动范围、机构资格与正式邀请或委派等证明。',
        'A statutory work-permit exception applies, with formal evidence of the qualifying activity and institution.',
        all(eligible, e.activityAndInstitutionQualify, e.formalEvidence),
        [
          rd('arts. 88.a–i, 89.2, 179.3.d.2º'),
          { srcId: 'SRC-320', locator: 'art. 41.1 (excepciones, incl. g)' },
          holderGuide,
        ],
        ['PD-293'],
      ),
    );
  }
  const cleared =
    h.securityDecision && h.securityDecision !== 'pending'
      ? h.securityDecision === 'cleared'
      : undefined;
  checks.push(
    check(
      L,
      'ES-M08',
      '无拒入或适用的禁返限制；机关已依据刑事及警方记录核对公共秩序、安全与公共健康。',
      'No refusal-of-entry alert or applicable return bar, with official clearance on public order, security and public health after checking criminal and police records.',
      all(h.noRefusalAlert, h.noReturnBar, cleared),
      [
        rd('arts. 61.2.c–e, 74.1.g–i, 84.d–f, 89.2.b–d'),
        { srcId: 'SRC-331', locator: 'Directive 2003/109/CE arts. 17–18' },
        holderGuide,
      ],
      ['PD-293'],
    ),
  );
  const info = [
    ...afterGrant(req, h, 'M', m.purpose),
    applicationFee(L, 'ES-M10', h.fee, day),
    check(
      L,
      'ES-M11',
      '后续转换：取得西班牙欧盟长居须另行满足 E 路径，西班牙批准后原成员国的欧盟长居身份不再保留。',
      'Subsequent conversion: the Spanish EU long-term status requires a separate assessment under route E; its grant ends retention of that status in the first Member State.',
      h.spanishEuLongTermGranted,
      [rd('art. 181.1–3 (p133)')],
    ),
  ];
  if (
    m.purpose &&
    m.purpose !== 'non-working' &&
    h.separateWorkFeeRequired !== false
  ) {
    info.push(
      check(
        L,
        'ES-M10-work-fee',
        '办理费用：若机关要求另办工作许可，核对适用的工作费和收据。',
        'Procedure: if the authority requires a separate work authorisation, verify its applicable charge and receipt.',
        h.separateWorkFeeRequired ? h.separateWorkFeePaid : undefined,
        [
          { srcId: 'SRC-320', locator: 'arts. 45–47' },
          { srcId: 'SRC-325', locator: 'anexo 3' },
        ],
        ['PD-293'],
      ),
    );
  }
  return pathway(
    'ES-M',
    L(
      '其他成员国欧盟长期居民迁入西班牙',
      'Moving to Spain with EU long-term resident status from another Member State',
    ),
    checks,
    info,
    assumptions,
  );
}

export function mobilityPath(
  req: EsFullRequest,
  kind: 'M' | 'F',
): CountryPathway {
  const today = mobilityApplication(req, kind);
  const m = req.mobility;
  const app = kind === 'M' ? m?.holder : m?.family;
  // An actual filing is assessed on its recorded date.
  if (app?.filedOn || today.status !== 'NOT_MET') return today;
  const dates: (IsoDate | undefined)[] = [];
  if (kind === 'F') {
    const f = m?.family;
    dates.push(f?.principalFiledOn ?? m?.holder?.filedOn);
    const relative = f?.relationship;
    if (relative?.kind === 'ascendant' && relative.birthDate)
      dates.push(
        addYears(relative.birthDate, v.reunificationAge.value.ascendant),
      );
    if (m?.purpose === 'non-working') {
      dates.push(f?.healthCover?.validFrom);
      if (m.holder?.healthCover?.coversFamilyMember)
        dates.push(m.holder.healthCover.validFrom);
    }
  } else if (m?.purpose === 'non-working') {
    dates.push(m.holder?.healthCover?.validFrom);
  } else if (m?.purpose === 'employment') {
    const employee = m.holder?.employment;
    if (employee?.birthDate) {
      const years =
        employee.minorConditionsAndConsent === false
          ? v.employmentAge.value.unrestricted
          : v.employmentAge.value.minimum;
      dates.push(afterYears(employee.birthDate, years));
    }
  }
  return projectFilingDates(
    today,
    req.simulationDate,
    dates,
    (simulationDate) => mobilityApplication({ ...req, simulationDate }, kind),
    req.locale,
  );
}
