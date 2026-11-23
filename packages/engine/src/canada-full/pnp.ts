import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addDays, addYears } from '../dates';
import type { IsoDate } from '../types';
import {
  all,
  any,
  documentValidAtReceipt,
  filingDatesForRoute,
  receivedBy,
  receivedInWindow,
  ref,
  type Context,
  type Item,
} from './shared';

const on = ca.values.ontarioWorkforce.value;

export interface PnpAnswers {
  stream?: 'ontario-workforce' | 'other';
  mode?: 'base' | 'enhanced';
  /** Current disposition: expired means natural expiry without withdrawal. */
  nomination?: 'valid' | 'pending' | 'withdrawn' | 'expired' | 'refused';
  intendsNominatingProvince?: boolean;
  investment?: 'none' | 'scheme' | 'business';
  equityShare?: number;
  equityInvestment?: number;
  activeOngoingManagement?: boolean;
  noRedemptionOption?: boolean;
  capitalInActiveBusinessInNominatingProvince?: boolean;
  investmentExceptionDocumented?: boolean;
  nominationIssued?: IsoDate;
  nominationExpires?: IsoDate;
  federalFiled?: IsoDate;
  viaPrPortal?: boolean;
  qualifiesUnderlyingEeProgram?: boolean;
  electronicNominationMatchedAndAccepted?: boolean;
  ontario?: OntarioAnswers;
}

interface OntarioAnswers {
  category?: 'high' | 'lower' | 'physician';
  eoi?: IsoDate;
  invited?: IsoDate;
  /** An official cancellation of this invitation by the simulation date. */
  invitationRevoked?: boolean;
  employerFiled?: IsoDate;
  filed?: IsoDate;
  employerPortalPosition?: boolean;
  eoiClaimsDocumented?: boolean;
  lawfulStatusIfInCanada?: boolean;
  intendsOntario?: boolean;
  region?: 'gta' | 'designated-division' | 'other';
  activeBusinessYears?: number;
  ontarioPremises?: boolean;
  workPrimarilyInOntario?: boolean;
  cvorWithAcceptableRating?: boolean;
  lastYearRevenue?: number;
  priorYearRevenue?: number;
  localFullTimeCitizensOrPr?: number;
  labourOrdersClear?: boolean;
  recruitmentSatisfiedIfRequired?: boolean;
  offerNoc?: string;
  permanentEmployeeJob?: boolean;
  urgentBusinessNeed?: boolean;
  labourDisputeUnaffected?: boolean;
  directorApproval?: 'approved' | 'pending' | 'refused';
  jobConditionsMaintained?: boolean;
  weeklyHours?: number;
  annualHours?: number;
  offeredHourlyWage?: number;
  /** Applicable dated Job Bank wages (regional, historical regional, then national), adjusted for a collective agreement where applicable. */
  applicableMedianWage?: number;
  applicableLowWage?: number;
  /** Zero if not already working in the job. */
  currentHourlyWage?: number;
  familyEquityPercent?: number;
  equityOnlyFromPay?: boolean;
  licenceRequired?: boolean;
  validLicence?: boolean;
  /** Paid full-time, lawfully resident and working in Ontario, same position, consecutive months in the year before filing. */
  consecutiveOntarioMonths?: number;
  /** Paid full-time, lawfully resident and working in Ontario, same position, total months in the two years before filing. */
  lowerOntarioMonths?: number;
  /** Paid full-time equivalents in the five years preceding application; non-overlapping periods. */
  work?: { noc: string; months: number }[];
  recentGraduate?:
    | {
        eligibleOntarioInstitution: boolean;
        graduation: IsoDate;
        credential:
          'degree-diploma' | 'masters-phd-graduate-certificate' | 'other';
        fullTimeYears?: number;
      }
    | false;
  education?:
    'secondary' | 'postsecondary' | 'ontario-33102-certificate' | 'none';
  fullTimeStudyYears?: number;
  origin?: 'canadian-eligible' | 'foreign-equivalent' | 'unrecognised';
  designatedEcaDate?: IsoDate;
  designatedEcaRevoked?: boolean;
  /** Approved English/French test: all four CLB/NCLC scores. */
  language?: {
    date: IsoDate;
    scores: [number, number, number, number];
    revoked?: boolean;
  };
  selfEmployedPhysician?: boolean;
  cpsoGoodStanding?: boolean;
  physicianLicence?:
    'independent' | 'academic' | 'provisional' | 'postgraduate' | 'none';
  ohipBillingEligible?: boolean;
  feePaid?: number;
}

function meets(amount?: number, minimum?: number) {
  return amount === undefined || minimum === undefined
    ? undefined
    : amount >= minimum;
}

function recentGraduate(a: OntarioAnswers, date: IsoDate | undefined) {
  const g = a.recentGraduate;
  if (!g) return g;
  return all(
    g.eligibleOntarioInstitution,
    date
      ? g.graduation <= date &&
          g.graduation >= addYears(date, -on.graduateWindowYears)
      : undefined,
    any(
      g.credential === 'masters-phd-graduate-certificate',
      all(
        g.credential === 'degree-diploma',
        meets(g.fullTimeYears, on.graduateStudyYears),
      ),
    ),
  );
}

function relatedWork(a: OntarioAnswers) {
  if (!a.work || !a.offerNoc) return undefined;
  const offer = a.offerNoc;
  return (
    a.work
      .filter(
        ({ noc }) =>
          noc === offer ||
          (offer.startsWith(on.engineeringOfferPrefix) &&
            noc.startsWith(on.engineeringWorkPrefix)) ||
          (offer === on.pharmacyAssistantNoc && noc === on.pharmacistNoc) ||
          (offer === on.nurseAideNoc && on.acceptedNursingNocs.includes(noc)),
      )
      .reduce((sum, x) => sum + x.months, 0) >= on.relatedJobMonths
  );
}

function education(
  a: OntarioAnswers,
  date: IsoDate | undefined,
  secondary: boolean,
) {
  const recognised =
    a.origin === undefined
      ? undefined
      : a.origin === 'foreign-equivalent'
        ? all(
            !a.designatedEcaRevoked,
            a.designatedEcaDate && date
              ? a.designatedEcaDate <= date &&
                  a.designatedEcaDate > addYears(date, -on.ecaYears)
              : undefined,
          )
        : a.origin === 'canadian-eligible';
  const level =
    a.education === undefined
      ? undefined
      : a.education !== 'none' &&
        (secondary ||
          a.education === 'postsecondary' ||
          (a.education === 'ontario-33102-certificate' &&
            a.offerNoc === on.nurseAideNoc &&
            a.origin === 'canadian-eligible'));
  return all(
    recognised,
    level,
    secondary || meets(a.fullTimeStudyYears, on.postsecondaryYears),
  );
}

function language(
  a: OntarioAnswers,
  date: IsoDate | undefined,
  threshold: number,
) {
  if (!a.language) return undefined;
  return all(
    !a.language.revoked,
    date
      ? a.language.date <= date &&
          a.language.date > addYears(date, -on.languageYears)
      : undefined,
    a.language.scores.every((score) => score >= threshold),
  );
}

export function pnpChecks({ req, L, check }: Context): Item[] {
  const p = req.pnp ?? {};
  const a = p.ontario ?? {};
  const sim = req.simulationDate;
  const {
    federal: filed,
    provincial,
    employer,
  } = filingDatesForRoute(req, 'CA-PNP');
  const provincialDate = provincial ?? sim;
  const provincialReceipt = receivedBy(provincial, sim);
  const nomination = documentValidAtReceipt(
    p.nomination,
    p.nominationIssued,
    p.nominationExpires,
    filed,
    sim,
  );
  const investment = ca.values.pnpInvestment.value;
  const investmentEligible =
    p.investment === undefined
      ? undefined
      : p.investment === 'none' ||
        all(
          any(
            meets(p.equityShare, investment.minEquityShare),
            meets(p.equityInvestment, investment.minEquityInvestment),
          ),
          p.activeOngoingManagement,
          p.noRedemptionOption,
          p.capitalInActiveBusinessInNominatingProvince,
          p.investmentExceptionDocumented,
        );
  const nominationSources = [
    ref('SRC-261', 'IRPR s87(1)–(6), (12)'),
    ref(
      'SRC-271',
      'Confirmation of provincial nomination; BC, Post-nomination support for workers / Conditions of nomination',
    ),
    ref('SRC-279', 'Canada Gazette, SOR/2026-63, s1'),
  ];
  const checks = [
    check(
      'CA-R45',
      L('省提名与定居意图', 'Provincial nomination and intention to reside'),
      all(nomination, p.intendsNominatingProvince, investmentEligible),
      L(
        '须持有效提名并打算在提名地定居。投资例外须有主动经营、股权或投资额及省级证明。待审提名、定居意图或投资依据须由省方确认。安省 Workforce Priority 以外的省级甄选依各地 stream 核实。',
        'A valid nomination and intention to settle in the nominating province are required. An investment exception needs documented active management, qualifying equity or investment, and provincial evidence. Pending decisions require provincial confirmation. For streams outside Ontario Workforce Priority, verify local selection with the nominating province.',
      ),
      nominationSources,
      ['PD-250'],
    ),
    check(
      'CA-R46',
      L('提名后的联邦递交', 'Federal filing after nomination'),
      all(
        nomination,
        p.nominationExpires ? true : undefined,
        p.mode === 'base'
          ? p.viaPrPortal
          : p.mode === 'enhanced'
            ? all(
                p.qualifiesUnderlyingEeProgram,
                p.electronicNominationMatchedAndAccepted,
              )
            : undefined,
      ),
      L(
        '联邦收件时提名须有效。按期收件后证书自然到期可继续审理，省方撤回提名则不满足条件。Base 经 PR Portal；enhanced 须符合 EE 项目要求，匹配并接受电子提名，再按 ITA 递交。',
        'The nomination must be valid at federal receipt. A timely application can continue past the printed expiry if the province maintains the nomination. Base nominees use the PR Portal. Enhanced nominees must qualify under an EE program, match and accept the nomination, and file under an ITA.',
      ),
      [
        ref('SRC-261', 'IRPR s87'),
        ref(
          'SRC-271',
          'Confirmation of provincial nomination; Non-Express Entry process; Express Entry process and withdrawal of a nomination',
        ),
        ref('SRC-269', 'EE ministerial instructions, s28'),
      ],
      ['PD-250'],
    ),
  ];
  if (p.stream !== 'ontario-workforce') return checks;
  const categoriesKnown = a.category !== undefined;
  const doctor = a.category === 'physician';
  const high = a.category === 'high';
  const evidence = [
    ref(
      'SRC-272',
      'O. Reg. 422/17 ss2.1–7; Ontario Workforce Priority: Steps to apply; OINP application process / Deadlines to apply: Ontario Workforce Priority',
    ),
  ];
  const invited = receivedBy(a.invited, sim);
  const employerReceipt = receivedBy(employer, sim);
  const employerWindow = receivedInWindow(
    employer,
    sim,
    invited,
    invited && addDays(invited, on.employerDays),
  );
  const applicantWindow = receivedInWindow(
    provincial,
    sim,
    invited,
    invited && addDays(invited, on.applicantDays),
  );
  checks.push(
    check(
      'CA-R47',
      L('安省 EOI、邀请与递交', 'Ontario EOI, invitation and filing'),
      all(
        categoriesKnown ? true : undefined,
        !a.invitationRevoked,
        a.eoi && a.invited
          ? a.eoi >= on.eoiOpens && a.eoi <= a.invited
          : undefined,
        applicantWindow,
        a.eoiClaimsDocumented,
        a.lawfulStatusIfInCanada,
        a.intendsOntario,
        doctor ||
          all(
            a.employerPortalPosition,
            employerWindow,
            employerReceipt && provincialReceipt
              ? employerReceipt <= provincialReceipt
              : undefined,
          ),
      ),
      L(
        `须有有效 EOI 和邀请、能证明申报条件、合法居留并打算在安省工作居住。雇主须在邀请后 ${on.employerDays} 天内递交，申请人随后在邀请后 ${on.applicantDays} 天内递交；自雇医生直接递交。`,
        `Document the EOI claims, invitation, lawful status and Ontario settlement intent. Employers have ${on.employerDays} days from invitation; applicants file after the employer within ${on.applicantDays} days of invitation. Physicians file directly.`,
      ),
      evidence,
      ['PD-250'],
    ),
  );
  if (categoriesKnown && !doctor) {
    const gta = a.region === 'gta';
    const lastRevenue =
      a.region === undefined
        ? undefined
        : gta
          ? on.gtaRevenue
          : a.region === 'designated-division'
            ? on.designatedRevenue
            : on.otherRevenue;
    const driving =
      a.offerNoc === undefined ? undefined : on.driverNocs.includes(a.offerNoc);
    checks.push(
      check(
        'CA-R48',
        L('安省雇主与工作地点', 'Ontario employer and work location'),
        all(
          meets(a.activeBusinessYears, on.businessYears),
          a.ontarioPremises,
          driving === undefined
            ? undefined
            : driving
              ? a.cvorWithAcceptableRating
              : a.workPrimarilyInOntario,
          a.labourOrdersClear,
          a.recruitmentSatisfiedIfRequired,
          meets(a.lastYearRevenue, lastRevenue),
          a.region !== 'other' || meets(a.priorYearRevenue, on.otherRevenue),
          meets(
            a.localFullTimeCitizensOrPr,
            a.region === undefined
              ? undefined
              : gta
                ? on.gtaEmployees
                : on.outsideEmployees,
          ),
        ),
        L(
          `至少经营 ${on.businessYears} 年。按工作或汇报地点核实完整财年收入与当地全职公民/PR 人数。GTA 为 ${on.gtaRevenue} CAD / ${on.gtaEmployees} 人；指定区为 ${on.designatedRevenue} / ${on.outsideEmployees}；其余每个适用财年均需 ${on.otherRevenue} / ${on.outsideEmployees}。驾驶岗另核 CVOR 及安全评级。`,
          `At least ${on.businessYears} active years. At the work/reporting site verify gross revenue and full-time Canadian/PR staff: GTA CAD ${on.gtaRevenue} / ${on.gtaEmployees}; designated divisions ${on.designatedRevenue} / ${on.outsideEmployees}; elsewhere ${on.otherRevenue} in each of the last two fiscal years / ${on.outsideEmployees}. Drivers need a qualifying CVOR and rating.`,
        ),
        [
          ref('SRC-272', 'O. Reg. 422/17 s4(1), paras 1–3.1, 10–11'),
          ref('SRC-279', 'OINP Employer guide: Employer requirements'),
        ],
        ['PD-251'],
      ),
    );
    const graduate = recentGraduate(a, provincialDate);
    const median = meets(a.offeredHourlyWage, a.applicableMedianWage);
    const low = meets(a.offeredHourlyWage, a.applicableLowWage);
    const wage = high ? any(median, all(graduate, low)) : median;
    const teer = a.offerNoc ? Number(a.offerNoc[1]) : undefined;
    const teerMatches =
      teer === undefined
        ? undefined
        : high
          ? teer <= on.highTeerMax
          : teer > on.highTeerMax && teer <= on.teerMax;
    const equity =
      a.familyEquityPercent === undefined
        ? undefined
        : a.familyEquityPercent === 0 ||
          all(
            a.equityOnlyFromPay,
            a.familyEquityPercent < on.equityPercentExclusive,
          );
    checks.push(
      check(
        'CA-R49',
        L('安省岗位、工资与股权', 'Ontario offer, wage and equity'),
        all(
          teerMatches,
          a.permanentEmployeeJob,
          a.urgentBusinessNeed,
          a.labourDisputeUnaffected,
          a.jobConditionsMaintained,
          a.directorApproval === 'pending' || !a.directorApproval
            ? undefined
            : a.directorApproval === 'approved',
          meets(a.weeklyHours, on.hoursPerWeek),
          meets(a.annualHours, on.hoursPerYear),
          wage,
          meets(a.offeredHourlyWage, a.currentHourlyWage),
          equity,
        ),
        L(
          `核对获批永久岗位、TEER、每周 ${on.hoursPerWeek} 和每年 ${on.hoursPerYear} 小时。比较申请日适用中位工资（合资格毕业生可用低位）、现薪和集体合同。薪酬所得家庭股权须低于 ${on.equityPercentExclusive}%。`,
          `Verify the approved permanent job, TEER, ${on.hoursPerWeek} hours/week and ${on.hoursPerYear} hours/year. Check the applicable median (low wage for qualifying graduates), current pay and collective agreement. Family equity received as pay must be under ${on.equityPercentExclusive}%.`,
        ),
        [
          ref(
            'SRC-272',
            'O. Reg. 422/17 ss1, 4(1) paras 4–9.1, 4(2), 5(1) para 10, 6 para 8; Workforce Priority: Job offer requirements',
          ),
          ref('SRC-279', 'OINP Employer guide: Job offer requirements'),
        ],
        ['PD-251'],
      ),
    );
    const licensed = all(a.licenceRequired, a.validLicence);
    const licensing = any(
      a.licenceRequired === undefined ? undefined : !a.licenceRequired,
      a.validLicence,
    );
    if (high) {
      const sameJob = meets(a.consecutiveOntarioMonths, on.sameJobMonths);
      const experience = any(
        sameJob,
        all(graduate, meets(a.consecutiveOntarioMonths, on.graduateJobMonths)),
        relatedWork(a),
        licensed,
      );
      checks.push(
        check(
          'CA-R50',
          L(
            '安省高技能岗位经验与执照',
            'Ontario higher-skilled experience and licence',
          ),
          all(
            licensing,
            driving === undefined ? undefined : driving ? sameJob : experience,
          ),
          L(
            `同岗连续 ${on.sameJobMonths} 个月，近期合资格安省毕业生为 ${on.graduateJobMonths} 个月；或近五年相关 NOC 等值 ${on.relatedJobMonths} 个月。必需的执照须有效，驾驶岗位仍须连续同岗经历。`,
            `Verify ${on.sameJobMonths} consecutive months in the job, ${on.graduateJobMonths} for recent eligible Ontario graduates, or ${on.relatedJobMonths} equivalent months in eligible NOCs in the last five years. A mandatory valid licence may exempt experience, except for drivers.`,
          ),
          [ref('SRC-272', 'O. Reg. 422/17 ss1, 5(1) paras 4–8, 5(2)–(4), 16')],
          ['PD-251'],
        ),
      );
      const trade =
        a.offerNoc === undefined
          ? undefined
          : on.tradePrefixes.some((prefix) => a.offerNoc!.startsWith(prefix)) &&
            !on.excludedTradePrefixes.some((prefix) =>
              a.offerNoc!.startsWith(prefix),
            );
      const langEd = (skilledTrade: boolean) =>
        all(
          any(
            recentGraduate(a, provincialReceipt),
            language(
              a,
              provincialReceipt,
              skilledTrade ? on.tradeLanguage : on.highLanguage,
            ),
          ),
          any(
            !driving ? licensed : false,
            education(a, provincialReceipt, skilledTrade),
          ),
        );
      const ordinary = langEd(false);
      const trades = langEd(true);
      const status =
        trade === undefined
          ? undefined
          : driving && ordinary !== trades
            ? undefined
            : trade
              ? trades
              : ordinary;
      checks.push(
        check(
          'CA-R51',
          L(
            '安省高技能岗位语言与学历',
            'Ontario higher-skilled language and education',
          ),
          status,
          L(
            `四项 CLB/NCLC 通常均须 ${on.highLanguage}，指定技工为 ${on.tradeLanguage}。近期安省毕业资历可免测试。普通岗需高教学历，指定技工可用中学学历；驾驶岗与技工规则不同且影响结论时须省方核实。`,
            `All four CLB/NCLC scores must normally reach ${on.highLanguage}, or ${on.tradeLanguage} for listed trades. Eligible recent graduates can use their credential. Check postsecondary education or secondary education for trades, with official review if overlapping driver/trade rules change the answer.`,
          ),
          [
            ref(
              'SRC-272',
              'O. Reg. 422/17 ss5, 15; Workforce Priority: Language and Education',
            ),
          ],
          ['PD-251'],
        ),
      );
    } else {
      checks.push(
        check(
          'CA-R52',
          L(
            '安省 TEER 4–5 经验、执照、语言与学历',
            'Ontario TEER 4–5 experience, licence, language and education',
          ),
          all(
            licensing,
            meets(a.lowerOntarioMonths, on.lowerTeerMonths),
            language(a, provincialReceipt, on.lowerLanguage),
            education(a, provincialReceipt, true),
          ),
          L(
            `两年内安省合法同岗累计 ${on.lowerTeerMonths} 个月，持所需执照、中学或等值学历，四项均达 CLB/NCLC ${on.lowerLanguage}。`,
            `Within the past two years accumulate ${on.lowerTeerMonths} lawful months in the offered Ontario job. Check any mandatory licence, secondary or equivalent education and CLB/NCLC ${on.lowerLanguage} in all four skills.`,
          ),
          [
            ref(
              'SRC-272',
              'O. Reg. 422/17 ss6, 15; Workforce Priority: Applicant requirements',
            ),
          ],
          ['PD-251'],
        ),
      );
    }
  }
  if (doctor)
    checks.push(
      check(
        'CA-R53',
        L('安省自雇医生', 'Ontario self-employed physician'),
        all(
          a.selfEmployedPhysician,
          a.cpsoGoodStanding,
          a.ohipBillingEligible,
          a.physicianLicence === undefined
            ? undefined
            : ['independent', 'academic', 'provisional'].includes(
                a.physicianLicence,
              ),
        ),
        L(
          '须自雇或将自雇，CPSO 状态良好，持独立、学术或临时类注册证并具 OHIP 公共支付资格。',
          'Verify current or planned self-employment, CPSO good standing, independent, academic or provisional registration and OHIP public billing eligibility.',
        ),
        [
          ref(
            'SRC-272',
            'O. Reg. 422/17 s7; Workforce Priority: Self-employed physicians',
          ),
        ],
        ['PD-251'],
      ),
    );
  const fee =
    a.region === undefined ||
    provincialDate < on.eoiOpens ||
    provincialDate > ca.asOf
      ? undefined
      : a.region === 'gta'
        ? on.gtaFee
        : on.outsideFee;
  checks.push(
    check(
      'CA-R54',
      L('安省申请费', 'Ontario filing fee'),
      meets(a.feePaid, fee),
      fee === undefined
        ? L(
            '请核对工作或执业地址及递交日费表。',
            'Confirm the work or practice address and published fee on the filing date.',
          )
        : L(
            `本次安省费用为 CAD ${fee}，需核对付款凭证。联邦费用另计。`,
            `Ontario filing fee: CAD ${fee}. Confirm the receipt; federal fees are separate.`,
          ),
      [ref('SRC-272', 'OINP application process: Cost to apply')],
      ['PD-250'],
      true,
    ),
  );
  return checks;
}
