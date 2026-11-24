import { greeceFull2026_11, grSource } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addDays, addYears } from './dates';
import type { GrFullRequest } from './greece-full';
import { ageOn, all, any, insuranceMet, type GrContext } from './greece-rules';
import type { IsoDate } from './types';

interface WorkAnswers {
  permit?: 'E1' | 'E4';
  stage?: 'initial' | 'renewal';
  admission?: 'ordinary' | 'domestic-switch' | 'strategic-project';
  /** For a domestic switch from a national visa. A standalone Z visa does not lead to its own permit. */
  switchVisa?: {
    kind: 'standalone-Z' | 'leads-to-permit';
    expiresOn?: IsoDate;
  };
  contractMonths?: number;
  /** Legacy Ε.4 renewal input. Filing does not require a current employment contract. */
  hasCurrentEmploymentContract?: boolean;
  grossAnnualEur?: number;
  payBasis?: 'monthly' | 'daily';
  grossPayEur?: number;
  /** Credentials for the current position, including prior verification that still applies. */
  qualification?:
    | 'regulated-recognised'
    | 'unregulated-documented'
    | 'previously-verified-in-Greece'
    | 'missing';
  /** The permanent address is due by issue of the Blue Card. */
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
  /** Only for Ε.4 renewal with a historical insurance gap: active public cover on the filing date. */
  activePublicCoverAfterGap?: boolean;
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
  sponsorLawfulFrom?: IsoDate;
  /** Original permit term. A zero term denotes that the sponsor has no permit. */
  sponsorPermitDurationYears?: number;
  sponsorPermitLeadsToPermanentResidence?: boolean;
  /** Whether the sponsor currently holds qualifying residence for Ο.1. */
  sponsorPermitValid?: boolean;
  /** Evidence for a pending renewal of the qualifying permit. A valid art. 11(10) certificate preserves its rights. */
  sponsorRenewal?: 'pending' | 'valid-certificate';
  /** The sponsor and family member are filing their complete first applications together. */
  jointInitialApplication?: boolean;
  /** Earlier Blue Card requests use this when jointInitialApplication is absent. */
  jointBlueCardApplication?: boolean;
  /** Personal net income excludes social assistance and other household members' income. */
  sponsorPersonalNetEur?: number;
  /** At renewal, evidence of compliance must cover both the sponsor and applicant. */
  priorYearTaxAndInsuranceEvidence?: boolean;
  stableIncome?: boolean;
  spouseIncluded?: boolean;
  childrenIncluded?: number;
  bothParentsLawfullyInGreece?: boolean;
  housingDocument?: 'E9' | 'Taxisnet' | 'E2' | 'none';
  housingMeetsFamilyNeeds?: boolean;
  /** Child includes recognised adoptions and either parent's children. Ascendant means a direct ascendant. */
  member?: 'spouse' | 'registered-partner' | 'child' | 'ascendant' | 'other';
  unmarriedChildWithCustodyAndConsent?: boolean;
  adultChildIncapacityDependencyProved?: boolean;
  soleEligibleSpouse?: boolean;
  formedLegallyInGreece?: boolean;
  /** Includes the civil-status record for this relationship and the applicable filing stage. */
  relationshipAndDocumentsGenuine?: boolean;
  familyLifeContinues?: boolean;
  autonomousBasis?:
    'residence' | 'bereavement' | 'divorce' | 'hardship' | 'child';
  previousFamilyCard?: boolean;
  previousAutonomousChildCard?: boolean;
  familyResidenceYears?: number;
  /** Uninterrupted family residence in Greece, including the current period. */
  familyResidenceFrom?: IsoDate;
  blueFamilyYearsInEU?: number;
  /** First day of continuous qualifying family residence across Member States, including Greece. */
  blueFamilyResidenceFrom?: IsoDate;
  /** For dissolution, these periods refer to the marriage or registered partnership. */
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
type Filing = Answer | IsoDate;

function dueOn(earliest: IsoDate, today: IsoDate): true | IsoDate {
  return earliest <= today ? true : earliest;
}

function residenceDue(
  from: IsoDate | undefined,
  years: number | undefined,
  required: number,
  today: IsoDate,
): Filing {
  if (from) return dueOn(addYears(from, required), today);
  return atLeast(years, required);
}

function allDue(...facts: Filing[]): Filing {
  if (facts.includes(false)) return false;
  if (facts.includes(undefined)) return undefined;
  return (
    facts
      .filter((fact): fact is IsoDate => typeof fact === 'string')
      .sort()
      .at(-1) ?? true
  );
}

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

function employerFinance(w: WorkAnswers, reformed: boolean) {
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
      (reformed
        ? all(
            atLeast(w.agencyCapitalEur, limits.agencyCapital),
            w.agencyManagementClear,
            w.hostContractAndTaxEvidence,
          )
        : undefined),
  );
}

function workChecks(
  req: GrFullRequest,
  { check, filingYear }: GrContext,
): CountryCheck[] {
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
  const employeeRenewal = !isBlue && renewal;
  const isSwitch = w.admission === 'domestic-switch';
  const project = !isBlue && w.admission === 'strategic-project';
  const reformed = req.simulationDate >= p.workReformEffective.value;
  const contracts = p.workContractMonths.value;
  const qualified =
    w.qualification === undefined ? undefined : w.qualification !== 'missing';
  if (isBlue && renewal && w.blueRenewalInterruption) {
    const limits = p.workBlueInterruption.value;
    const unemployment = w.blueRenewalInterruption === 'unemployment';
    const months = w.interruptionMonths;
    const withinLimit =
      months === undefined
        ? undefined
        : unemployment
          ? any(
              months <= limits.shortServiceMonths,
              all(
                months <= limits.longerServiceMonths,
                atLeast(w.blueCardYears, limits.serviceYears),
              ),
            )
          : months <= limits.protectedLeaveMonths;
    checks.push(
      check(
        'WK-07-INTERRUPTION',
        '蓝卡就业中断与续期保护',
        'Protection during an interruption of Blue Card employment',
        all(
          withinLimit,
          unemployment || w.protectedLeaveAccepted,
          unemployment || qualified,
        ),
        p.workBlueInterruption.sources,
        `累计失业保护期按持卡是否满 ${limits.serviceYears} 年分别为 ${limits.longerServiceMonths} 或 ${limits.shortServiceMonths} 个月。疾病、残障或育儿假造成的暂时中断最多 ${limits.protectedLeaveMonths} 个月，由主管机关决定；岗位所需的职业资格仍须有效。`,
        `Cumulative unemployment can last up to ${limits.longerServiceMonths} months after ${limits.serviceYears} years on the card, or ${limits.shortServiceMonths} months earlier. An interruption for illness, disability or parental leave of up to ${limits.protectedLeaveMonths} months requires an authority decision and the qualifications for the job must remain valid.`,
      ),
    );
  } else if (isBlue) {
    const salary = p.workBlueSalary.value;
    const knownYear =
      filingYear(req.simulationDate) === salary.lastPublishedYear;
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
        all(atLeast(w.contractMonths, contracts.blue), qualified),
        [
          grSource('F16', 'arts. 31(1)(α–γ), (3), 36(1)(β)'),
          grSource('F21', 'art. 4(1), (5)'),
        ],
        `合同至少 ${contracts.blue} 个月。首签和续期均须具备现岗位所需的执业资格或高级资历。此前希腊许可核验的资格对现岗位仍有效时，可复用该证明。`,
        `A highly qualified contract of at least ${contracts.blue} months is required. At issue and renewal, the applicant needs recognition for a regulated profession or relevant higher qualifications for other jobs. Prior verification on a Greek permit counts if it still applies to the current job.`,
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
  } else if (!renewal) {
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
          grSource('F21', 'art. 7(1)(α), (3)(β)'),
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
      const knownThreshold =
        req.simulationDate >= p.workEmployerEffective.value;
      checks.push(
        check(
          'WK-05',
          '雇主财务能力',
          'Employer financial capacity',
          knownThreshold ? employerFinance(w, reformed) : undefined,
          [...p.workEmployer.sources, ...p.workEmployerEffective.sources],
          !knownThreshold
            ? '须核实模拟日适用的雇主财务门槛。'
            : `上年税单须支持合同工资。蓝卡和企业每名 €${p.workEmployer.value.business}，普通个人或农业雇主每名 €${p.workEmployer.value.individualOrAgriculture}。普通岗位须匹配业务。派遣机构自 ${p.workReformEffective.value} 起可按专门程序申请，需核实 €${p.workEmployer.value.agencyCapital} 资本、管理层和用工方材料。`,
          !knownThreshold
            ? 'Verify the employer threshold in force on the simulation date.'
            : `Last year's tax evidence must support the offered wages. The Blue Card and business threshold is €${p.workEmployer.value.business}, or €${p.workEmployer.value.individualOrAgriculture} for an ordinary private or agricultural employer. Ordinary jobs must match the activity. Agency sponsorship from ${p.workReformEffective.value} requires €${p.workEmployer.value.agencyCapital} capital, management clearance and host evidence.`,
          !knownThreshold || (w.employer === 'agency' && !reformed)
            ? ['PD-317']
            : undefined,
        ),
      );
    }
    let quota: Filing = w.quotaAvailable;
    if (project) {
      const withinLimit =
        w.projectWorkersTotal === undefined
          ? undefined
          : w.projectWorkersTotal <= p.workEmployer.value.projectWorkers;
      quota = all(reformed, w.projectCertified, withinLimit);
    } else if (isSwitch) {
      switch (req.entry) {
        case 'permit':
          quota = true;
          break;
        case 'national-visa': {
          const expiry = w.switchVisa?.expiresOn;
          if (!reformed)
            quota = expiry === undefined || req.simulationDate <= expiry;
          else if (w.switchVisa?.kind === 'leads-to-permit') quota = false;
          else
            quota =
              expiry &&
              req.simulationDate <= expiry &&
              dueOn(expiry, req.simulationDate);
          break;
        }
        case 'short-stay':
          quota = isBlue && w.quotaAvailable;
          break;
        case 'outside':
        case 'unlawful':
          quota = false;
          break;
        default:
          quota = undefined;
      }
    }
    checks.push(
      check(
        'WK-06',
        '用工配额与邀请批准',
        'Admission quota and recruitment approval',
        w.admission === undefined
          ? undefined
          : allDue(quota, isSwitch || w.employerApproval),
        [
          grSource('F16', 'arts. 12, 26, 32, 33(3)'),
          grSource('F36', 'arts. 13, 17, 18, 21 (arts. 12(3), 61(6)–(7))'),
        ],
        `Ε.1 在合法短停期间可凭合同递交，岗位计入配额。可转换的居留许可或长期签证按第 12(3) 条办理；自 ${p.workReformEffective.value} 起，独立 Ζ 类签证在到期时转换，通往居留卡的 D 签须先领卡。认证战略或公共工程自该日起最多邀请 ${p.workEmployer.value.projectWorkers} 人。`,
        `An Ε.1 applicant may file with a contract during a lawful short stay. The job counts towards the quota. Article 12(3) covers switches from eligible permits or long-stay visas. From ${p.workReformEffective.value} a standalone Z visa can be switched at expiry, whereas a visa leading to a permit requires that permit first. A certified strategic or public project can then invite up to ${p.workEmployer.value.projectWorkers} people.`,
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
            : dueOn(
                addDays(addYears(req.birthDate, p.workInvitationAge.value), 1),
                req.simulationDate,
              ),
          p.workInvitationAge.sources,
          `第 26(6) 条要求受邀人超过 ${p.workInvitationAge.value} 岁。`,
          `Article 26(6) requires the recruited worker to be over ${p.workInvitationAge.value}.`,
        ),
      );
    }
  }
  const deferred =
    !renewal &&
    req.deferredInitialEvidence?.includes('public-insurance-application') ===
      true;
  const cover = renewal
    ? insuranceMet(req.insurance, 'work')
    : any(
        w.insuranceApplicationFiled ??
          (deferred && req.insurance?.kind !== 'uninsured' ? true : undefined),
        insuranceMet(req.insurance, 'work'),
      );
  const currentCover =
    employeeRenewal && req.insurance?.kind === 'gap'
      ? w.activePublicCoverAfterGap
      : true;
  checks.push(
    check(
      'WK-07',
      renewal ? '续期税务与有效公保' : '工作医保与蓝卡地址',
      renewal
        ? 'Renewal tax and active insurance evidence'
        : 'Employment insurance and Blue Card address',
      all(cover, currentCover, !renewal || w.taxesSettledDuringPermit),
      employeeRenewal
        ? [
            grSource('F57', 'p. 1, reply on art. 7(4), paras. 2–3'),
            grSource('F58', 'Προϋποθέσεις 2–3; Δικαιολογητικά 2–3'),
            grSource('F21', 'art. 2(δ), evidence for gaps in past coverage'),
          ]
        : [
            grSource('F16', 'arts. 10(9), 31(1)(ε, ζ)'),
            grSource('F21', 'arts. 2(δ), 4(3), (5), 7(3)–(4)'),
          ],
      renewal
        ? '提供原卡有效期间的纳税义务履行证明及保险机构出具的有效公保证明。曾有参保空档时，核对同期失业补助或获认可的不可抗力证明。'
        : `首签核对公保登记申请或参保证明。按第 10(9) 条递件后，须在 ${p.initialEvidenceMonths.value} 个月内补交欠缺的参保申请凭证。蓝卡申请人须申报已知住址，最迟在发卡时提供永久地址。`,
      renewal
        ? 'Provide evidence of tax compliance during the expiring permit and active coverage from the public insurer. For earlier gaps, document unemployment benefits for that period or accepted force majeure.'
        : `Show public insurance registration or active cover at first issue. Article 10(9) allows ${p.initialEvidenceMonths.value} months after filing to supply the outstanding registration certificate. Blue Card applicants must disclose any known address and provide the permanent address by issue.`,
      renewal && cover === undefined && req.insurance ? ['PD-303'] : undefined,
    ),
  );
  const validity = p.workValidity.value;
  const years = !reformed
    ? isBlue
      ? validity.blueBeforeReformYears
      : validity.employeeBeforeReformYears
    : renewal
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
      `按递件日法律，${w.permit} ${renewal ? '续签' : '首次'}有效期 ${years} 年。${isBlue ? `短合同加 ${validity.blueShortContractExtraMonths} 个月，上限 ${years} 年；护照有效期也影响发卡时长。` : ''}`,
      `Under the law on the filing date the ${w.permit} ${renewal ? 'renewal' : 'initial permit'} lasts ${years} years.${isBlue ? ` For a shorter contract add ${validity.blueShortContractExtraMonths} months, up to ${years} years. Passport validity can affect the period issued.` : ''}`,
    ),
  );
  const invitation =
    !renewal && w.admission !== undefined && !isSwitch && !isBlue
      ? project
        ? reformed
          ? fees.projectInvitation
          : undefined
        : fees.invitation
      : undefined;
  checks.push(
    check(
      'WK-09',
      '雇主和雇员费用及办理时间',
      'Employer and applicant fees and timing',
      true,
      employeeRenewal ? [grSource('F58', 'Κόστος 1–2')] : p.workFees.sources,
      `许可 €${fees.permit}，制卡 €${fees.print}。${renewal ? '' : `需国家签证时另付 €${fees.visa}。`}${invitation === undefined ? '' : `雇主每人邀请费 €${invitation}，不退。`}${isBlue ? `蓝卡完整申请的审理时限为 ${fees.blueDecisionDays} 天。` : reformed && !renewal ? `领馆决定后 ${fees.consulateNotificationDays} 天内通知主管机关，主管机关再于 ${fees.employerNotificationDays} 天内通知雇主。` : ''}`,
      `Permit €${fees.permit}, printing €${fees.print}.${renewal ? '' : ` A national visa, when required, costs €${fees.visa}.`}${invitation === undefined ? '' : ` The employer pays a non-refundable €${invitation} per recruit.`}${isBlue ? ` A complete Blue Card application has a ${fees.blueDecisionDays}-day decision period.` : reformed && !renewal ? ` Following a decision, the consulate has ${fees.consulateNotificationDays} days to notify the authority, which has ${fees.employerNotificationDays} days to inform the employer.` : ''}`,
    ),
  );
  return checks;
}

export function isJointInitialApplication(f: FamilyAnswers) {
  return (
    f.stage === 'initial' &&
    !f.formedLegallyInGreece &&
    (f.jointInitialApplication ??
      (f.sponsor === 'blue-card' && f.jointBlueCardApplication))
  );
}

function sponsorPermitForFiling(f: FamilyAnswers, L: GrContext['L']) {
  const joint = isJointInitialApplication(f);
  if (joint) {
    switch (f.sponsor) {
      case 'blue-card':
        return {
          met: true,
          note: L(
            '蓝卡与家属的完整首签申请同步递交时，两项决定同时作出并通知。',
            'When both complete applications are filed together, the Blue Card and family decisions are issued and notified together.',
          ),
        };
      case 'intra-corporate':
        return {
          met: true,
          note: L(
            '企业内部调动许可与家属首签同时递交时，主管机关同时审查两份申请。',
            'When filed together, the intra-corporate transfer and family applications are examined together.',
          ),
        };
      case 'researcher':
        return {
          met: true,
          note: L(
            '家属的完整首签申请可与研究人员申请同时审查。研究人员获准后，主管机关才可签发家属许可。',
            'The complete family application can be examined with the researcher’s application. The family permit can be issued only after the researcher is granted a permit.',
          ),
        };
      case 'refugee':
      case undefined:
        return { met: undefined };
    }
  }
  if (f.sponsorPermitValid || f.sponsorRenewal === 'valid-certificate')
    return { met: true };
  if (joint && (f.sponsor === 'special-employment' || f.sponsor === 'investor'))
    return {
      met: undefined,
      note: L(
        '该类别允许家属随行。主申请仍待批时，须核实本案适用的家属首签递件程序。',
        'Family members may accompany the sponsor. Check the applicable family filing procedure while the principal application is pending.',
      ),
      pendingDetails: ['PD-319'],
    };
  if (f.sponsorRenewal === 'pending') return { met: undefined };
  return {
    met:
      f.sponsorPermitValid ??
      (f.sponsorPermitDurationYears === 0 ? false : undefined),
  };
}

function familySponsor(
  f: FamilyAnswers,
  today: IsoDate,
  validPermit: Answer,
): Filing {
  if (f.sponsor === 'excluded') return false;
  if (f.sponsor === 'refugee')
    return f.stage === 'initial' ? all(validPermit, undefined) : undefined;
  if (!f.sponsor) return all(validPermit, undefined);
  if (
    f.stage === 'renewal' ||
    f.sponsor !== 'ordinary' ||
    f.formedLegallyInGreece
  )
    return validPermit;
  return allDue(
    validPermit,
    residenceDue(
      f.sponsorLawfulFrom,
      f.sponsorLawfulYears,
      p.familySponsor.value.years,
      today,
    ),
    atLeast(f.sponsorPermitDurationYears, p.familySponsor.value.permitYears),
    f.sponsorPermitLeadsToPermanentResidence,
  );
}

function familyIncome(f: FamilyAnswers, date: string) {
  // The gross minimum wage is an upper bound on take-home pay, not a rejection threshold.
  const knownMethod = date >= p.incomeMethodEffective.value;
  const floor = knownMethod ? wageFloor(date) : undefined;
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
    result: all(
      knownMethod ? f.priorYearTaxAndInsuranceEvidence : undefined,
      f.stableIncome,
      comparison,
    ),
    netUnresolved:
      !knownMethod || (enough === false && f.sponsorPersonalNetEur !== 0),
  };
}

function familyMember(f: FamilyAnswers, req: GrFullRequest): Filing {
  const age = ageOn(req.birthDate, req.simulationDate);
  if (!f.member || !f.sponsor) return undefined;
  if (f.member === 'spouse')
    return allDue(
      f.sponsor === 'investor' ||
        (req.birthDate &&
          dueOn(
            addYears(req.birthDate, p.familyMembers.value.adultAge),
            req.simulationDate,
          )),
      f.soleEligibleSpouse,
    );
  if (f.member === 'registered-partner')
    return f.sponsor === 'investor' || f.formedLegallyInGreece;
  if (f.member === 'ascendant') return f.sponsor === 'investor';
  if (f.member !== 'child') return false;
  const adultException = all(
    req.simulationDate >= p.workReformEffective.value,
    f.adultChildIncapacityDependencyProved,
  );
  if (age === undefined)
    return f.unmarriedChildWithCustodyAndConsent === adultException
      ? adultException
      : undefined;
  const ageLimit =
    f.sponsor === 'investor'
      ? p.familyMembers.value.investorChildLimit
      : p.familyMembers.value.adultAge;
  return any(
    all(age < ageLimit, f.unmarriedChildWithCustodyAndConsent),
    all(age >= p.familyMembers.value.adultAge, adultException),
  );
}

function autonomousResidenceDue(f: FamilyAnswers, today: IsoDate): Filing {
  const limits = p.familyAutonomy.value;
  const domestic = residenceDue(
    f.familyResidenceFrom,
    f.familyResidenceYears,
    limits.residenceYears,
    today,
  );
  if (domestic === true || (f.sponsor && f.sponsor !== 'blue-card'))
    return domestic;

  // Greek residence also counts toward the Member State total under article 42(6).
  const acrossEU = residenceDue(
    f.blueFamilyResidenceFrom,
    f.blueFamilyYearsInEU,
    limits.residenceYears,
    today,
  );
  const finalGreek = residenceDue(
    f.familyResidenceFrom,
    f.familyResidenceYears,
    limits.blueGreekYears,
    today,
  );
  const mobility = allDue(acrossEU, finalGreek);
  if (
    mobility === undefined &&
    (typeof acrossEU === 'string' || typeof finalGreek === 'string')
  )
    return false; // An outstanding period is known, but its combined end date is not.
  if (
    typeof domestic === 'string' &&
    typeof mobility === 'string' &&
    domestic <= mobility
  )
    return domestic;
  if (f.sponsor === 'blue-card' || domestic === mobility) return mobility;

  // With no sponsor category, both possible routes must agree before we can date eligibility.
  return mobility === true || mobility === undefined ? undefined : false;
}

function autonomous(f: FamilyAnswers, req: GrFullRequest): Filing {
  const a = p.familyAutonomy.value;
  const age = ageOn(req.birthDate, req.simulationDate);
  const adulthood =
    req.birthDate &&
    dueOn(
      addYears(req.birthDate, p.familyMembers.value.adultAge),
      req.simulationDate,
    );
  switch (f.autonomousBasis) {
    case 'child':
      if (f.member && f.member !== 'child') return false;
      if (age === undefined || !f.member) return undefined;
      return allDue(
        age < a.finalChildAge,
        adulthood,
        age < a.childRenewalAge || f.sponsor === 'investor'
          ? f.previousFamilyCard
          : f.previousAutonomousChildCard,
      );
    case 'residence': {
      const member =
        f.member &&
        (f.member === 'spouse' ||
          f.member === 'registered-partner' ||
          (f.member === 'child' && adulthood));
      return allDue(
        f.previousFamilyCard,
        autonomousResidenceDue(f, req.simulationDate),
        member,
      );
    }
    case 'bereavement':
      return all(
        f.previousFamilyCard,
        atLeast(f.familyResidenceYears, a.bereavementYears),
      );
    case 'divorce':
      return all(
        f.previousFamilyCard,
        f.member &&
          (f.member === 'spouse' || f.member === 'registered-partner'),
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
  { check, L }: GrContext,
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
  if (!isAutonomous) {
    const permit = sponsorPermitForFiling(f, L);
    const sponsorEligibility = familySponsor(f, req.simulationDate, permit.met);
    const articles = {
      ordinary: 'arts. 83(1), 84(1), 92',
      'blue-card': 'arts. 42(2), 42(3), 42(4)',
      'intra-corporate': 'art. 56(5)(α), 56(5)(β)',
      researcher: 'arts. 112(1), 112(2)',
      'special-employment': 'art. 60(2)',
      investor: 'arts. 10(11), 95(2)',
      refugee: 'art. 83',
      excluded: 'art. 83(2)',
    };
    const sponsorRefs = [
      grSource('F16', f.sponsor ? articles[f.sponsor] : 'arts. 83–84'),
      grSource('F16', 'arts. 11(10), 87(1), 88(1)(ε)'),
      grSource('F21', 'art. 23(I), (II)'),
    ];
    if (f.sponsor === 'special-employment')
      sponsorRefs.push(grSource('F36', 'art. 20 (art. 60(2))'));
    if (f.sponsor === 'investor')
      sponsorRefs.push(grSource('F36', 'art. 29 (art. 95(2), p. 466)'));
    if (f.sponsor === 'refugee')
      return [
        check(
          'FT-01',
          'Ο.1 担保资格与国际保护专门程序',
          'Ο.1 sponsorship and the protection-specific procedure',
          sponsorEligibility,
          sponsorRefs,
          'Ο.1 单独首签须核对担保人的合资格居留。难民身份涉及的专门团聚程序、申请时间与材料豁免须另行核实。',
          'A separate initial Ο.1 filing requires qualifying sponsor residence. Verify the protection-specific procedure, timing and document exemptions for a recognised refugee.',
          ['PD-319'],
        ),
      ];
    let sponsorNote =
      permit.note ??
      L(
        '核对担保人的当前许可。许可到期后，有效的续期申请证明可证明担保人仍享有相应的居留权利。',
        'Check the sponsor’s current permit. After expiry, a valid renewal filing certificate confirms that the sponsor retains the corresponding residence rights.',
      );
    if (!initial)
      sponsorNote += L(
        '担保人居留已终止时，家属可另按 Ο.2 核对自主居留权。',
        ' If the sponsor’s residence has ended, assess any independent right under Ο.2 separately.',
      );
    else if (f.sponsor === 'ordinary' && !f.formedLegallyInGreece)
      sponsorNote += L(
        `普通担保人须合法居住满 ${p.familySponsor.value.years} 年，原许可期限至少 ${p.familySponsor.value.permitYears} 年且可通往永久居留。可填写连续居住起始日计算递件日期。`,
        ` An ordinary sponsor needs ${p.familySponsor.value.years} years of lawful residence and a permit issued for at least ${p.familySponsor.value.permitYears} years with a prospect of permanent residence. Supply the residence start date to calculate a future filing date.`,
      );
    checks.push(
      check(
        'FT-01',
        '担保人资格与先期居留',
        'Sponsor permit and prior residence',
        sponsorEligibility,
        sponsorRefs,
        sponsorNote,
        sponsorNote,
        permit.pendingDetails,
      ),
    );
    if (!initial) {
      checks.push(
        check(
          'FT-02',
          '担保人与家属的续期税保凭证',
          'Renewal tax and insurance evidence for the sponsor and applicant',
          f.priorYearTaxAndInsuranceEvidence,
          [
            grSource('F16', 'art. 87(1)–(2)'),
            grSource('F21', 'art. 23(I)(4)(β–γ), (II)(2)(β–γ), p. 16498'),
          ],
          '普通团聚及在希组建家庭的续期都须核对担保人与家属的税务履行凭证及医保资格。',
          'Both ordinary and domestically formed families must show tax compliance and insurance entitlement for the sponsor and applicant at renewal.',
        ),
      );
    } else if (
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
            ...p.incomeMethodEffective.sources,
            ...p.annualPayPeriods.sources,
            ...p.minimumMonthlyGrossEur.sources,
            ...p.previousMonthlyGrossEur.sources,
            ...p.wage2024GrossEur.sources,
          ],
          `担保人须有经常性个人净收入，剔除社会救助。配偶加 ${sponsor.spousePercent}%，每名子女加 ${sponsor.childPercent}%，父母均在希合法居住免子女加计。${income.ceiling === undefined ? '请核对家庭构成及当期适用的年度净额算法。' : `按现有毛薪计算的充分金额为 €${income.ceiling}，低于该数时仍需核实适用年度净额。`}`,
          `Show personal recurring net income, excluding social assistance. Add ${sponsor.spousePercent}% for a spouse and ${sponsor.childPercent}% per child unless both parents lawfully reside in Greece. ${income.ceiling === undefined ? 'Confirm household composition and the annual net wage calculation then in force.' : `€${income.ceiling} is a sufficient upper bound based on gross wages. Below that bound verify the applicable annual net wage.`}`,
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
          grSource('F21', 'art. 23(I)(1)(ε), (4)(β), (II)(2)(β)'),
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
        allDue(familyMember(f, req), admission),
        [
          grSource(
            'F16',
            'arts. 4(λε), 42(1), 84(1), (3), 86(3), 92(1), 95(2)',
          ),
          grSource('F36', 'arts. 9(2), 29'),
          grSource('F21', 'art. 23(I)(1)–(4), (II)(1)–(2)'),
        ],
        `一般团聚包括年满 ${deadlines.adultAge} 岁的配偶、未满 ${deadlines.adultAge} 岁的未婚子女，蓝卡适用相同范围。双方持希腊居留许可并在希登记的民事伴侣可依第 92 条申请。投资者家属还包括登记伴侣及双方的直系尊亲属，未婚子女的年龄上限为未满 ${deadlines.investorChildLimit} 岁。子女须核对适用的收养、监护及同意材料。无行为能力的成年子女另核对失能、同住及供养证明。普通境外入境批准通常限 ${deadlines.decisionMonths} 个月，特殊情况可再延 ${deadlines.extensionMonths} 个月。`,
        `Ordinary and Blue Card reunification covers spouses aged ${deadlines.adultAge} or over and unmarried children under ${deadlines.adultAge}. Partners who hold Greek residence permits and register their partnership in Greece can apply under article 92. Investors can also sponsor registered partners and either partner’s direct ascendants. Their unmarried children must be under ${deadlines.investorChildLimit}. Verify adoption, custody and parental consent where applicable. For adult children without legal capacity, verify incapacity, co-residence and support. Ordinary admission from abroad normally takes up to ${deadlines.decisionMonths} months, exceptionally extended by ${deadlines.extensionMonths} months.`,
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
      fee === undefined ? undefined : true,
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
        autonomous(f, req),
        [
          ...p.familyAutonomy.sources,
          grSource('F21', 'art. 24(1.1)–(1.2)'),
          grSource('F36', 'art. 29 (art. 95(2))'),
        ],
        `持家属卡满 ${a.residenceYears} 年的配偶、登记伴侣或成年子女可申请。蓝卡家属可合计成员国居留，但最后 ${a.blueGreekYears} 年须在希腊。丧偶前在希至少 ${a.bereavementYears} 年，婚姻或登记伴侣关系解除前须持续至少 ${a.marriageYears} 年且在希至少 ${a.marriageInGreeceYears} 年。另核对成年子女专用卡和有证据的特殊困难。Ο.2 最长 ${a.cardYears} 年。`,
        `Spouses, registered partners and adult children with ${a.residenceYears} years on family permits can apply. Blue Card families can count residence in other Member States if the final ${a.blueGreekYears} years were in Greece. Alternatives include ${a.bereavementYears} year before bereavement, a marriage or registered partnership of ${a.marriageYears} years with ${a.marriageInGreeceYears} in Greece before dissolution, the child permit on adulthood, or documented exceptional hardship. Autonomous residence runs for up to ${a.cardYears} years.`,
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
          grSource('F16', 'arts. 84(2), 88(1)–(2), 92(1)'),
          grSource(
            'F21',
            'art. 23(I)(1)(β), (3)(β), (4)(α), (II)(1)(α), (2)(α)',
          ),
          ...(f.sponsor === 'blue-card' && initial
            ? [grSource('F60', 'procedure 517141, documents 4–5')]
            : []),
        ],
        '境内组建家庭首签须按关系出示结婚、在希登记民事伴侣或子女出生记录。境外团聚须提供获认证及翻译的亲属证明，按情况附监护、同意材料。续期须声明家庭状况未变并确认家庭生活持续。',
        'For domestic family formation, provide the applicable marriage record, Greek partnership registration or birth record. For admission from abroad, provide certified and translated evidence of the relationship, with custody and consent evidence where required. Renewal requires a declaration of unchanged family circumstances and continuing family life.',
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
