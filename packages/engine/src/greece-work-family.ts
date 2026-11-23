import { greeceFull2026_11, grSource } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addYears } from './dates';
import type { GrFullRequest } from './greece-full';
import { ageOn, all, any, insuranceMet, type GrContext } from './greece-rules';

interface WorkAnswers {
  permit?: 'E1' | 'E4';
  stage?: 'initial' | 'renewal';
  admission?: 'ordinary' | 'domestic-switch' | 'strategic-project';
  contractMonths?: number;
  grossAnnualEur?: number;
  payBasis?: 'monthly' | 'daily';
  grossPayEur?: number;
  qualification?:
    | 'regulated-recognised'
    | 'unregulated-documented'
    | 'previously-verified-in-Greece'
    | 'missing';
  permanentAddressAvailable?: boolean;
  employerApproval?: boolean;
  employer?: 'private-individual' | 'agriculture' | 'business' | 'agency';
  sponsoredWorkers?: number;
  employerLastYearGrossEur?: number;
  taxEvidenceSupportsContractPay?: boolean;
  occupationMatchesBusiness?: boolean;
  agencyCapitalEur?: number;
  agencyManagementClear?: boolean;
  hostContractAndTaxEvidence?: boolean;
  quotaAvailable?: boolean;
  projectCertified?: boolean;
  projectWorkersTotal?: number;
  blueRenewalInterruption?:
    'unemployment' | 'illness-disability-parental-leave';
  blueCardYears?: number;
  interruptionMonths?: number;
  protectedLeaveAccepted?: boolean;
  taxesSettledDuringPermit?: boolean;
  insuranceApplicationFiled?: boolean;
}

interface FamilyAnswers {
  stage?: 'initial' | 'renewal' | 'autonomous';
  sponsor?:
    | 'ordinary'
    | 'blue-card'
    | 'intra-corporate'
    | 'special-employment'
    | 'investor'
    | 'researcher'
    | 'refugee'
    | 'excluded';
  sponsorLawfulYears?: number;
  sponsorPermitDurationYears?: number;
  sponsorPermitLeadsToPermanentResidence?: boolean;
  sponsorPersonalNetEur?: number;
  /** Personal net income excludes social assistance and other household members' income. */
  priorYearTaxAndInsuranceEvidence?: boolean;
  stableIncome?: boolean;
  spouseIncluded?: boolean;
  childrenIncluded?: number;
  bothParentsLawfullyInGreece?: boolean;
  housingDocument?: 'E9' | 'Taxisnet' | 'E2' | 'none';
  housingMeetsFamilyNeeds?: boolean;
  member?: 'spouse' | 'child' | 'ascendant' | 'other';
  unmarriedChildWithCustodyAndConsent?: boolean;
  adultChildIncapacityDependencyProved?: boolean;
  soleEligibleSpouse?: boolean;
  formedLegallyInGreece?: boolean;
  relationshipAndDocumentsGenuine?: boolean;
  familyLifeContinues?: boolean;
  autonomousBasis?:
    'residence' | 'bereavement' | 'divorce' | 'hardship' | 'child';
  previousFamilyCard?: boolean;
  previousAutonomousChildCard?: boolean;
  familyResidenceYears?: number;
  blueFamilyYearsInEU?: number;
  priorMarriageYears?: number;
  priorMarriageYearsInGreece?: number;
  hardshipDocumented?: boolean;
}

export interface GrWorkFamilyAnswers {
  work?: WorkAnswers;
  familyTcn?: FamilyAnswers;
}

const p = greeceFull2026_11.values;
type Answer = boolean | undefined;

function atLeast(value: number | undefined, limit: number | undefined): Answer {
  return value === undefined || limit === undefined
    ? undefined
    : value >= limit;
}

export function wageFloor(date: string, daily = false) {
  if (date >= p.minimumWageEffective.value) {
    return daily
      ? p.minimumDailyGrossEur.value
      : p.minimumMonthlyGrossEur.value;
  }
  if (date >= p.previousWageEffective.value) {
    return daily
      ? p.previousDailyGrossEur.value
      : p.previousMonthlyGrossEur.value;
  }
  if (date >= p.wage2024Effective.value) {
    return daily
      ? p.wage2024GrossEur.value.daily
      : p.wage2024GrossEur.value.monthly;
  }
  return undefined;
}

function employerFinance(w: WorkAnswers) {
  const limits = p.workEmployer.value;
  const smallEmployer =
    w.employer === 'private-individual' || w.employer === 'agriculture';
  const perWorker =
    w.permit === 'E1' || !smallEmployer
      ? limits.business
      : limits.individualOrAgriculture;
  const threshold =
    w.sponsoredWorkers === undefined || !w.employer
      ? undefined
      : w.sponsoredWorkers * perWorker;
  return all(
    atLeast(w.employerLastYearGrossEur, threshold),
    w.taxEvidenceSupportsContractPay,
    w.permit === 'E1' || w.occupationMatchesBusiness,
    w.employer !== 'agency' ||
      all(
        atLeast(w.agencyCapitalEur, limits.agencyCapital),
        w.agencyManagementClear,
        w.hostContractAndTaxEvidence,
      ),
  );
}

function workChecks(req: GrFullRequest, { check }: GrContext): CountryCheck[] {
  const w = req.work ?? {};
  const checks: CountryCheck[] = [];
  if (!w.permit) {
    return [
      check(
        'WK-TYPE',
        '工作许可类别',
        'Work permit category',
        undefined,
        [grSource('F16', 'arts. 31, 61')],
        '请选择高技能蓝卡 Ε.1 或普通受雇 Ε.4。',
        'Select the EU Blue Card (Ε.1) or the employed-worker permit (Ε.4).',
      ),
    ];
  }
  if (!w.stage) {
    return [
      check(
        'WK-08',
        '工作许可申请阶段',
        'Employment permit application stage',
        undefined,
        p.workValidity.sources,
        '请选择首次申领或续签。',
        'Select initial issue or renewal.',
      ),
    ];
  }
  const isBlue = w.permit === 'E1';
  const renewal = w.stage === 'renewal';
  const isSwitch = w.admission === 'domestic-switch';
  const project = !isBlue && w.admission === 'strategic-project';
  const reformed = req.simulationDate >= p.workReformEffective.value;
  const contracts = p.workContractMonths.value;
  if (isBlue && renewal && w.blueRenewalInterruption) {
    const limits = p.workBlueInterruption.value;
    const unemployment = w.blueRenewalInterruption === 'unemployment';
    const months = unemployment
      ? w.blueCardYears === undefined
        ? undefined
        : w.blueCardYears >= limits.serviceYears
          ? limits.longerServiceMonths
          : limits.shortServiceMonths
      : limits.protectedLeaveMonths;
    checks.push(
      check(
        'WK-07-INTERRUPTION',
        '蓝卡就业中断与续期保护',
        'Protection during an interruption of Blue Card employment',
        all(
          months === undefined || w.interruptionMonths === undefined
            ? undefined
            : w.interruptionMonths <= months,
          unemployment || w.protectedLeaveAccepted,
        ),
        p.workBlueInterruption.sources,
        `累计失业保护期按持卡是否满 ${limits.serviceYears} 年分别为 ${limits.longerServiceMonths} 或 ${limits.shortServiceMonths} 个月。疾病、残障或育儿假造成的暂时中断最多 ${limits.protectedLeaveMonths} 个月，由主管机关决定。`,
        `Cumulative unemployment can last up to ${limits.longerServiceMonths} months after ${limits.serviceYears} years on the card, or ${limits.shortServiceMonths} months earlier. An interruption for illness, disability or parental leave of up to ${limits.protectedLeaveMonths} months requires an authority decision.`,
      ),
    );
  } else if (isBlue) {
    const salary = p.workBlueSalary.value;
    const knownYear =
      Number(req.simulationDate.split('-')[0]) === salary.lastPublishedYear;
    checks.push(
      check(
        'WK-01',
        '蓝卡税前年薪',
        'Blue Card gross annual salary',
        knownYear
          ? atLeast(w.grossAnnualEur, salary.lastPublishedEur)
          : undefined,
        p.workBlueSalary.sources,
        `合同毛年薪须达到全国平均毛年薪的 ${salary.multiplier} 倍。存档的 ${salary.lastPublishedYear} 年门槛为 €${salary.lastPublishedEur}。${knownYear ? '请用合同年度总额比较。' : '模拟年度的官方金额待核实。'}`,
        `The gross annual contract salary must reach ${salary.multiplier} times the national average. The published threshold for ${salary.lastPublishedYear} is €${salary.lastPublishedEur}. ${knownYear ? 'Compare the annual total on the contract.' : 'The official figure for the simulation year is unverified.'}`,
        knownYear ? undefined : ['PD-317'],
      ),
    );
    checks.push(
      check(
        'WK-02',
        '高技能合同与职业资格',
        'Highly qualified contract and credentials',
        all(
          atLeast(w.contractMonths, contracts.blue),
          w.qualification === undefined
            ? undefined
            : w.qualification !== 'missing',
        ),
        [
          grSource('F16', 'art. 31(1)(α–γ), (3)'),
          grSource('F21', 'art. 4(1), (5)'),
        ],
        `合同至少 ${contracts.blue} 个月。受监管职业须认可执业资格，其他职业须提供相关高级资历；已由希腊在对应高技能许可中核验的证明可复用。`,
        `A highly qualified contract of at least ${contracts.blue} months is required. Provide recognition for regulated professions or relevant higher qualifications for other jobs. Prior verification on the qualifying Greek permit counts.`,
      ),
    );
    if (!renewal) {
      const lawful =
        !req.entry ||
        req.entry === 'restricted-permit' ||
        req.entry === 'receipt'
          ? undefined
          : req.entry !== 'unlawful';
      checks.push(
        check(
          'WK-03',
          '蓝卡申请与入境方式',
          'Blue Card admission procedure',
          all(lawful, isSwitch || w.employerApproval),
          [
            grSource('F16', 'arts. 12(4), 33(1)–(4)'),
            grSource('F21', 'art. 4(1)–(3)'),
          ],
          '境外由雇主申请批准及国家签证。合法短期停留须在届满前申报；合法持卡人可按境内程序申请。',
          'From abroad the employer obtains approval and a national visa. A lawful short-stay applicant must file before expiry. Lawful permit holders can use the domestic procedure.',
        ),
      );
    }
  } else {
    const months = reformed
      ? contracts.employee
      : contracts.employeeBeforeReform;
    const floor =
      w.payBasis && wageFloor(req.simulationDate, w.payBasis === 'daily');
    checks.push(
      check(
        'WK-04',
        '受雇合同与最低工资',
        'Employment contract and minimum wage',
        all(atLeast(w.contractMonths, months), atLeast(w.grossPayEur, floor)),
        [
          ...p.workContractMonths.sources,
          ...(w.payBasis === 'daily'
            ? p.minimumDailyGrossEur
            : p.minimumMonthlyGrossEur
          ).sources,
          ...(w.payBasis === 'daily'
            ? p.previousDailyGrossEur
            : p.previousMonthlyGrossEur
          ).sources,
          ...p.wage2024GrossEur.sources,
        ],
        `合同至少 ${months} 个月。按全职雇员月薪或体力劳动者日薪比较${floor === undefined ? '；请核对工资类别及当期费率' : `，相应毛额下限 €${floor}`}。`,
        `The contract must cover at least ${months} months. Compare full-time monthly employee pay or daily manual-worker pay${floor === undefined ? ' once the rate and period are known' : ` with a gross minimum of €${floor}`}.`,
      ),
    );
  }
  if (!renewal) {
    if ((isBlue || (w.admission && !isSwitch)) && !project) {
      checks.push(
        check(
          'WK-05',
          '雇主财务能力',
          'Employer financial capacity',
          employerFinance(w),
          p.workEmployer.sources,
          `上年税单须支持合同工资。蓝卡和企业每名 €${p.workEmployer.value.business}，普通个人或农业雇主每名 €${p.workEmployer.value.individualOrAgriculture}。普通岗位须匹配业务；派遣机构另须满足 €${p.workEmployer.value.agencyCapital} 资本及管理层、用工方审查。`,
          `Last year's tax evidence must support the offered wages. The Blue Card and business threshold is €${p.workEmployer.value.business}, or €${p.workEmployer.value.individualOrAgriculture} for an ordinary private or agricultural employer. Ordinary jobs must match the activity. Agencies also require €${p.workEmployer.value.agencyCapital} capital, management clearance and host evidence.`,
        ),
      );
    }
    const projectWithinLimit =
      w.projectWorkersTotal === undefined
        ? undefined
        : w.projectWorkersTotal <= p.workEmployer.value.projectWorkers;
    const quota = project
      ? all(reformed, w.projectCertified, projectWithinLimit)
      : isSwitch
        ? req.entry === undefined ||
          req.entry === 'restricted-permit' ||
          req.entry === 'receipt'
          ? undefined
          : req.entry === 'permit'
        : w.quotaAvailable;
    checks.push(
      check(
        'WK-06',
        '用工配额与邀请批准',
        'Admission quota and recruitment approval',
        w.admission === undefined
          ? undefined
          : all(quota, isSwitch || w.employerApproval),
        [
          grSource('F16', 'arts. 12, 26, 32, 33(3)'),
          grSource('F36', 'arts. 13, 17, 18, 21 (arts. 12(3), 61(6)–(7))'),
        ],
        `请用当地工种配额与批准决定核对。境内 Ε.4 须持可转换许可；获认证的战略或公共工程最多邀请 ${p.workEmployer.value.projectWorkers} 人。`,
        `Check the local occupation quota and recruitment approval. An Ε.4 switch requires a convertible permit. A certified strategic or public project can invite up to ${p.workEmployer.value.projectWorkers} people.`,
      ),
    );
    if (
      reformed &&
      !isSwitch &&
      (req.entry === 'outside' || req.entry === 'national-visa' || project)
    ) {
      checks.push(
        check(
          'WK-INVITATION-AGE',
          '受邀工人的年龄',
          'Age for recruitment from abroad',
          req.birthDate === undefined
            ? undefined
            : req.simulationDate >
                addYears(req.birthDate, p.workInvitationAge.value),
          p.workInvitationAge.sources,
          `第 26(6) 条要求受邀人超过 ${p.workInvitationAge.value} 岁。`,
          `Article 26(6) requires the recruited worker to be over ${p.workInvitationAge.value}.`,
        ),
      );
    }
  }
  const cover = renewal
    ? insuranceMet(req.insurance, 'work')
    : any(w.insuranceApplicationFiled, insuranceMet(req.insurance, 'work'));
  checks.push(
    check(
      'WK-07',
      '工作医保、地址和续期税单',
      'Employment insurance, address and renewal tax record',
      all(
        cover,
        !isBlue || w.permanentAddressAvailable,
        !renewal || w.taxesSettledDuringPermit,
      ),
      [
        grSource('F16', 'art. 31(1)(ε, ζ)'),
        grSource('F21', 'arts. 2(δ), 4(3), (5), 7(3)–(4)'),
      ],
      '首签须提交公保登记申请或参保证明。蓝卡发卡时要有永久地址。续期核查原卡期间医保及纳税义务，医保断档须核实失业或不可抗力证明。',
      'Show public insurance registration or active cover at first issue. A permanent address is due by Blue Card issue. Renewals require cover and tax compliance during the previous permit. Insurance gaps need unemployment or force majeure evidence.',
      renewal && cover === undefined && req.insurance ? ['PD-303'] : undefined,
    ),
  );
  const validity = p.workValidity.value;
  const years = renewal
    ? isBlue
      ? validity.blueRenewalYears
      : validity.employeeRenewalYears
    : validity.initialYears;
  const fees = p.workFees.value;
  checks.push(
    check(
      'WK-08',
      '工作许可阶段与有效期',
      'Permit stage and duration',
      true,
      p.workValidity.sources,
      `请选择首签或续签。自 ${p.workReformEffective.value} 起，${w.permit} ${renewal ? '续签' : '首次'}有效期 ${years} 年。${isBlue ? `短合同加 ${validity.blueShortContractExtraMonths} 个月，上限 ${years} 年；护照有效期也影响发卡时长。` : ''}`,
      `Specify initial issue or renewal. From ${p.workReformEffective.value} the ${w.permit} ${renewal ? 'renewal' : 'initial permit'} lasts ${years} years.${isBlue ? ` For a shorter contract add ${validity.blueShortContractExtraMonths} months, up to ${years} years. Passport validity can affect the period issued.` : ''}`,
    ),
  );
  const invitation =
    !renewal && w.admission !== undefined && !isSwitch && !isBlue
      ? project
        ? fees.projectInvitation
        : fees.invitation
      : undefined;
  checks.push(
    check(
      'WK-09',
      '雇主和雇员费用及办理时间',
      'Employer and applicant fees and timing',
      true,
      p.workFees.sources,
      `许可 €${fees.permit}，制卡 €${fees.print}。需国家签证时另付 €${fees.visa}。${invitation === undefined ? '' : `雇主每人邀请费 €${invitation}，不退。`}${isBlue ? `蓝卡完整申请的审理时限为 ${fees.blueDecisionDays} 天。` : `领馆决定后 ${fees.consulateNotificationDays} 天内通知主管机关，主管机关再于 ${fees.employerNotificationDays} 天内通知雇主。`}`,
      `Permit €${fees.permit}, printing €${fees.print}. A national visa, when required, costs €${fees.visa}.${invitation === undefined ? '' : ` The employer pays a non-refundable €${invitation} per recruit.`}${isBlue ? ` A complete Blue Card application has a ${fees.blueDecisionDays}-day decision period.` : ` Following a decision, the consulate has ${fees.consulateNotificationDays} days to notify the authority, which has ${fees.employerNotificationDays} days to inform the employer.`}`,
    ),
  );
  return checks;
}

function familySponsor(f: FamilyAnswers): Answer {
  if (!f.sponsor || f.sponsor === 'refugee') return undefined;
  if (f.sponsor === 'excluded') return false;
  if (f.formedLegallyInGreece || f.sponsor !== 'ordinary') return true;
  return all(
    atLeast(f.sponsorLawfulYears, p.familySponsor.value.years),
    atLeast(f.sponsorPermitDurationYears, p.familySponsor.value.permitYears),
    f.sponsorPermitLeadsToPermanentResidence,
  );
}

function familyIncome(f: FamilyAnswers, date: string) {
  // The gross minimum wage is an upper bound on take-home pay, not a rejection threshold.
  const floor = wageFloor(date);
  const spousePercent = f.spouseIncluded
    ? p.familySponsor.value.spousePercent
    : 0;
  const children = f.bothParentsLawfullyInGreece ? 0 : f.childrenIncluded;
  const surchargesKnown =
    f.spouseIncluded !== undefined &&
    children !== undefined &&
    (children === 0 || f.bothParentsLawfullyInGreece !== undefined);
  const ceiling =
    surchargesKnown && floor !== undefined
      ? (floor *
          p.annualPayPeriods.value *
          (100 +
            spousePercent +
            children * p.familySponsor.value.childPercent)) /
        100
      : undefined;
  const enough = atLeast(f.sponsorPersonalNetEur, ceiling);
  const comparison =
    f.sponsorPersonalNetEur !== undefined && f.sponsorPersonalNetEur <= 0
      ? false
      : enough === true
        ? true
        : undefined;
  return {
    ceiling,
    result: all(f.priorYearTaxAndInsuranceEvidence, f.stableIncome, comparison),
    netUnresolved: enough === false && f.sponsorPersonalNetEur !== 0,
  };
}

function familyMember(f: FamilyAnswers, req: GrFullRequest): Answer {
  const age = ageOn(req.birthDate, req.simulationDate);
  if (!f.member || !f.sponsor) return undefined;
  if (f.member === 'spouse')
    return all(
      atLeast(age, p.familyMembers.value.adultAge),
      f.soleEligibleSpouse,
    );
  if (f.member === 'ascendant') return f.sponsor === 'investor';
  if (f.member !== 'child') return false;
  if (age === undefined) return undefined;
  const ageLimit =
    f.sponsor === 'investor'
      ? p.familyMembers.value.investorChildLimit
      : p.familyMembers.value.adultAge;
  return any(
    all(age < ageLimit, f.unmarriedChildWithCustodyAndConsent),
    all(
      req.simulationDate >= p.workReformEffective.value,
      age >= p.familyMembers.value.adultAge,
      f.adultChildIncapacityDependencyProved,
    ),
  );
}

function autonomous(f: FamilyAnswers, age: number | undefined): Answer {
  const a = p.familyAutonomy.value;
  switch (f.autonomousBasis) {
    case 'child':
      if (age === undefined || !f.member) return undefined;
      return (
        f.member === 'child' &&
        age >= p.familyMembers.value.adultAge &&
        age < a.finalChildAge &&
        (age < a.childRenewalAge || f.sponsor === 'investor'
          ? f.previousFamilyCard
          : f.previousAutonomousChildCard)
      );
    case 'residence': {
      const duration =
        f.sponsor === 'blue-card'
          ? any(
              atLeast(f.familyResidenceYears, a.residenceYears),
              all(
                atLeast(f.blueFamilyYearsInEU, a.residenceYears),
                atLeast(f.familyResidenceYears, a.blueGreekYears),
              ),
            )
          : atLeast(f.familyResidenceYears, a.residenceYears);
      const member = !f.member
        ? undefined
        : f.member === 'spouse' ||
          (f.member === 'child' &&
            atLeast(age, p.familyMembers.value.adultAge));
      return all(f.previousFamilyCard, duration, member);
    }
    case 'bereavement':
      return all(
        f.previousFamilyCard,
        atLeast(f.familyResidenceYears, a.bereavementYears),
      );
    case 'divorce':
      return all(
        f.previousFamilyCard,
        f.member === undefined ? undefined : f.member === 'spouse',
        atLeast(f.priorMarriageYears, a.marriageYears),
        atLeast(f.priorMarriageYearsInGreece, a.marriageInGreeceYears),
      );
    case 'hardship':
      return all(f.previousFamilyCard, f.hardshipDocumented);
    default:
      return undefined;
  }
}

function familyChecks(
  req: GrFullRequest,
  { check }: GrContext,
): CountryCheck[] {
  const f = req.familyTcn ?? {};
  const age = ageOn(req.birthDate, req.simulationDate);
  const checks: CountryCheck[] = [];
  if (!f.stage) {
    return [
      check(
        'FT-STAGE',
        '家庭居留申请阶段',
        'Family residence application stage',
        undefined,
        [grSource('F16', 'arts. 83–90')],
        '请选择 Ο.1 首次团聚、续期，或已持家属卡转 Ο.2 自主居留。',
        'Select initial Ο.1 reunification, renewal, or conversion from a family card to autonomous Ο.2 residence.',
      ),
    ];
  }
  const isAutonomous = f.stage === 'autonomous';
  const initial = f.stage === 'initial';
  const sponsorRefs = [
    grSource('F16', 'arts. 42(2), 56(5), 83(1)–(2), 84(1), 92, 112(1)'),
    grSource('F36', 'arts. 20, 29'),
    grSource('F21', 'art. 23(I), (II)'),
  ];
  if (!isAutonomous && f.sponsor === 'refugee') {
    return [
      check(
        'FT-01',
        '国际保护家属团聚程序',
        'Family reunification under international protection',
        undefined,
        sponsorRefs,
        '已获难民身份的担保人须核对国际保护专门团聚程序、申请时间与材料豁免。',
        'For a recognised refugee sponsor, verify the protection-specific procedure, application timing and document exemptions.',
        ['PD-319'],
      ),
    ];
  }
  if (!isAutonomous) {
    checks.push(
      check(
        'FT-01',
        '担保人资格与先期居留',
        'Sponsor permit and prior residence',
        familySponsor(f),
        sponsorRefs,
        `普通担保人合法居住满 ${p.familySponsor.value.years} 年，持有效期至少 ${p.familySponsor.value.permitYears} 年且允许取得永久居留的卡。确认蓝卡、投资等随行类别或在希合法组成家庭的专门程序。`,
        `An ordinary sponsor needs ${p.familySponsor.value.years} years of lawful residence and a permit issued for at least ${p.familySponsor.value.permitYears} years with a prospect of permanent residence. Identify any simultaneous-family or domestic family-formation procedure.`,
      ),
    );
    if (
      f.sponsor &&
      f.sponsor !== 'special-employment' &&
      !f.formedLegallyInGreece
    ) {
      const income = familyIncome(f, req.simulationDate);
      const sponsor = p.familySponsor.value;
      checks.push(
        check(
          'FT-02',
          '担保人个人稳定净收入',
          'Sponsor’s personal regular net income',
          income.result,
          [
            ...p.familySponsor.sources,
            ...p.annualPayPeriods.sources,
            ...p.minimumMonthlyGrossEur.sources,
            ...p.previousMonthlyGrossEur.sources,
            ...p.wage2024GrossEur.sources,
          ],
          `上年个人纳税及社保记录须支持经常性净收入，剔除社会救助。配偶加 ${sponsor.spousePercent}%，每名子女加 ${sponsor.childPercent}%，父母均在希合法居住免子女加计。${income.ceiling === undefined ? '请补充家庭构成。' : `按现有毛薪计算的充分金额为 €${income.ceiling}，低于该数时仍需核实适用年度净额。`}`,
          `Show personal recurring net income and last year's tax and insurance record, excluding social assistance. Add ${sponsor.spousePercent}% for a spouse and ${sponsor.childPercent}% per child unless both parents lawfully reside in Greece. ${income.ceiling === undefined ? 'Confirm the family composition.' : `€${income.ceiling} is a sufficient upper bound based on gross wages. Below that bound verify the applicable annual net wage.`}`,
          income.netUnresolved ? ['PD-304'] : undefined,
        ),
      );
      checks.push(
        check(
          'FT-03',
          '适足住房与税务登记',
          'Suitable accommodation and tax registration',
          all(
            f.housingDocument === undefined
              ? undefined
              : f.housingDocument !== 'none',
            f.housingMeetsFamilyNeeds,
          ),
          [
            grSource('F16', 'art. 84(2)(α)'),
            grSource('F21', 'art. 23(I)(1)(γ)'),
          ],
          '提供自有房 Ε9、双方确认的 Taxisnet 租约或无偿借住 Ε2。住房须满足该家庭的实际需要，法律未给出最低面积。',
          'Provide an ownership Ε9, accepted Taxisnet lease or free-use Ε2. Accommodation must meet the household’s needs. No statutory floor area is specified.',
          f.housingDocument &&
            f.housingDocument !== 'none' &&
            f.housingMeetsFamilyNeeds === undefined
            ? ['PD-318']
            : undefined,
        ),
      );
    }
    checks.push(
      check(
        'FT-04',
        '担保人与家属的全额医保',
        'Full cover for sponsor and family',
        all(insuranceMet(req.insurance, 'either'), req.insurance?.coversFamily),
        [
          grSource('F16', 'art. 84(2)(γ)'),
          grSource('F21', 'art. 23(I)(1)(ε), (4)(β)'),
          ...p.privateInsurance.sources,
        ],
        '核对公保家属资格或合规保单，须覆盖担保人及拟团聚家属。',
        'Verify public family coverage or a compliant private policy covering the sponsor and the family members.',
      ),
    );
    const entry = req.entry;
    const admission = !initial
      ? true
      : f.formedLegallyInGreece
        ? entry === undefined
          ? undefined
          : entry === 'permit'
        : f.sponsor !== undefined && f.sponsor !== 'ordinary'
          ? true
          : entry === undefined
            ? undefined
            : entry === 'permit' && f.formedLegallyInGreece === undefined
              ? undefined
              : entry === 'outside' || entry === 'national-visa';
    const deadlines = p.familyMembers.value;
    checks.push(
      check(
        'FT-05',
        '团聚成员及入境手续',
        'Eligible family member and admission procedure',
        all(familyMember(f, req), admission),
        [
          grSource('F16', 'arts. 4(λε), 42, 84(1), (3), 86(3), 92'),
          grSource('F36', 'arts. 9(2), 29'),
          grSource('F21', 'art. 23(I)(1)–(3)'),
        ],
        `配偶须满 ${deadlines.adultAge} 岁。普通和蓝卡家属的未婚子女须未满 ${deadlines.adultAge} 岁，投资类为未满 ${deadlines.investorChildLimit} 岁；另核对监护、同意书及无行为能力成年子女的同住供养证明。普通首签由境外申请入境批准，通常 ${deadlines.decisionMonths} 个月，特殊情况可再延 ${deadlines.extensionMonths} 个月。`,
        `A spouse must be at least ${deadlines.adultAge}. Unmarried children must be under ${deadlines.adultAge} for ordinary and Blue Card families, or under ${deadlines.investorChildLimit} for investors. Check custody, consent, or documented dependency and co-residence of an adult child without legal capacity. Ordinary first admissions start from abroad, normally within ${deadlines.decisionMonths} months with up to ${deadlines.extensionMonths} additional months exceptionally.`,
      ),
    );
  }
  const fees = p.familyFees.value;
  const a = p.familyAutonomy.value;
  const fee =
    age === undefined
      ? undefined
      : age < p.familyMembers.value.adultAge
        ? 0
        : isAutonomous &&
            f.autonomousBasis === 'child' &&
            age >= a.childRenewalAge
          ? fees.childRenewal
          : fees.permit;
  checks.push(
    check(
      'FT-06',
      '家庭居留规费',
      'Family residence fees',
      true,
      [...p.familyFees.sources, grSource('F21', 'art. 2(γ)')],
      `${fee === undefined ? `按年龄及卡别核对：未成年人免申请费，成人 €${fees.permit}，满 ${a.childRenewalAge} 岁的子女专项续卡 €${fees.childRenewal}。` : `申请费 €${fee}。`}另付制卡 €${p.workFees.value.print}。${initial ? `须办理团聚 D 签时领事费 €${fees.nationalVisa}。` : ''}`,
      `${fee === undefined ? `Verify age and permit: minors are exempt, adults pay €${fees.permit}, and the special child renewal at ${a.childRenewalAge} costs €${fees.childRenewal}.` : `Application fee €${fee}.`} Printing costs €${p.workFees.value.print}.${initial ? ` Add €${fees.nationalVisa} if a family national visa is required.` : ''}`,
    ),
  );
  if (isAutonomous) {
    checks.push(
      check(
        'FT-07',
        '家属转自主居留 Ο.2',
        'Autonomous family residence (Ο.2)',
        autonomous(f, age),
        [...p.familyAutonomy.sources, grSource('F36', 'art. 29 (art. 95(2))')],
        `持家属卡满 ${a.residenceYears} 年的配偶或成年子女可申请。丧偶前在希至少 ${a.bereavementYears} 年，离婚前婚姻至少 ${a.marriageYears} 年且在希至少 ${a.marriageInGreeceYears} 年；另核对成年子女专用卡和有证据的特殊困难。Ο.2 最长 ${a.cardYears} 年。`,
        `Spouses or adult children with ${a.residenceYears} years on family permits can apply. Alternatives include ${a.bereavementYears} year before bereavement, marriage of ${a.marriageYears} years with ${a.marriageInGreeceYears} in Greece before divorce, the child permit on adulthood, or documented exceptional hardship. Autonomous residence runs for up to ${a.cardYears} years.`,
      ),
    );
  } else {
    checks.push(
      check(
        'FT-08',
        '真实亲属关系与共同生活',
        'Genuine family relationship and family life',
        all(
          f.relationshipAndDocumentsGenuine,
          initial || f.familyLifeContinues,
        ),
        [
          grSource('F16', 'arts. 84(2), 88(1)–(2)'),
          grSource('F21', 'art. 23(I)(1)(β), (3)(β), (4)(α)'),
        ],
        '核对经认证的亲属文件。续签还须确认家庭关系及共同生活持续。',
        'Verify authentic family records. Renewal also requires a continuing family relationship and family life.',
      ),
    );
  }
  return checks;
}

export function workFamilyChecks(
  id: 'GR-WORK' | 'GR-FAMILY-TCN',
  req: GrFullRequest,
  c: GrContext,
): CountryCheck[] {
  return id === 'GR-WORK' ? workChecks(req, c) : familyChecks(req, c);
}
