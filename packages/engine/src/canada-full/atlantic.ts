import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addYears } from '../dates';
import {
  atLeast,
  educationValid,
  fundsAssessment,
  languageValid,
  levelMet,
  workAssessment,
  type EducationEvidence,
  type LanguageEvidence,
  type SettlementFunds,
  type Teer,
  type WorkPeriod,
} from './express';
import { all, any, ref, type Context, type Item } from './shared';

type Province = 'NS' | 'NB' | 'PE' | 'NL' | 'other';
export interface AtlanticAnswers {
  applicationDate?: string;
  destination?: Province;
  jobProvince?: Province;
  settlementPlanGivenToEmployer?: boolean;
  employerDesignated?: boolean;
  endorsement?: {
    province: Province;
    issued: string;
    expires: string;
    revoked?: boolean;
  };
  offer?: {
    noc?: string;
    teer?: Teer;
    hoursPerWeek?: number;
    permanent?: boolean;
    monthsAfterPr?: number;
    continuousPaidNonseasonal?: boolean;
    eligibleNamedEmployer?: boolean;
    applicantAndPartnerOwnershipPercent?: number;
    ableAndLikelyToAccept?: boolean;
    genuine?: boolean;
  };
  workHistory?: WorkPeriod[];
  graduate?: {
    claimsExemption?: boolean;
    awarded?: string;
    recognizedInstitution?: boolean;
    yearsOfStudy?: number;
    fullTimeThroughout?: boolean;
    monthsResidentInInstitutionProvinceDuringLastTwoYears?: number;
    temporaryStatusAndAuthorizationThroughout?: boolean;
    distanceLearningPercent?: number;
    secondLanguageStudyPercent?: number;
    returnHomeObligation?: boolean;
  };
  education?: EducationEvidence;
  /** Foreign ECA body's designation for immigration and for the offered occupation. */
  ecaIssuer?: 'CACB' | 'MCC' | 'PEBC' | 'general-designated' | 'other';
  language?: LanguageEvidence;
  funds?: SettlementFunds;
  workingInCanada?: boolean;
  /** A valid work permit, or written confirmation that other authorization qualifies for the exemption. */
  fundsExemptionAuthorization?: boolean;
}

const p = ca.values,
  aip = p.atlanticWork.value;
const irpr = ref('SRC-261', 'IRPR §87.3(1)–(9)');
const jobGuide = ref(
  'SRC-270',
  'aip-job / Get a job offer; aip-work / What counts as related work experience',
);
function graduateMet(g: AtlanticAnswers['graduate'], when: string) {
  if (g?.claimsExemption === false) return false;
  return all(
    g?.claimsExemption,
    g?.awarded === undefined
      ? undefined
      : g.awarded <= when && when < addYears(g.awarded, aip.graduateYears),
    g?.recognizedInstitution,
    atLeast(g?.yearsOfStudy, aip.graduateYears),
    g?.fullTimeThroughout,
    atLeast(
      g?.monthsResidentInInstitutionProvinceDuringLastTwoYears,
      aip.residenceMonths,
    ),
    g?.temporaryStatusAndAuthorizationThroughout,
    g?.distanceLearningPercent === undefined
      ? undefined
      : g.distanceLearningPercent < aip.graduateMaxDistancePercent,
    g?.secondLanguageStudyPercent === undefined
      ? undefined
      : g.secondLanguageStudyPercent < aip.excludedStudyPercent,
    g?.returnHomeObligation === undefined ? undefined : !g.returnHomeObligation,
  );
}

type Match = 'yes' | 'no' | 'disputed-yes' | 'disputed-no';
function offerLevel(
  offerNoc: string | undefined,
  offerTeer: Teer,
  occupation: { noc: string; teer: Teer },
): Match {
  const occupations = p.economicOccupations.value;
  const nursingOffer =
    offerNoc !== undefined && occupations.nursingOffers.includes(offerNoc);
  const nursingLaw =
    nursingOffer && occupations.nursingLaw.includes(occupation.noc);
  const nursingGuide =
    nursingOffer && occupations.nursingGuide.includes(occupation.noc);
  const tier = (teer: Teer) => (teer === 3 ? 2 : teer);
  const law = nursingLaw || tier(offerTeer) <= tier(occupation.teer);
  const table = nursingGuide || offerTeer <= occupation.teer;
  // IRCC's work-experience prose reverses its offer table, while the
  // regulation also groups TEER 2 and 3 and uses a different nursing code.
  const workProse = nursingGuide || occupation.teer <= offerTeer;
  if (law !== table || law !== workProse)
    return law ? 'disputed-yes' : 'disputed-no';
  return law ? 'yes' : 'no';
}

export function atlanticChecks({ req, L, check }: Context): Item[] {
  const a = req.atlantic ?? {},
    when = a.applicationDate ?? req.simulationDate;
  const o = a.offer,
    teer = o?.teer,
    e = a.endorsement;
  const province =
    a.destination === undefined ? undefined : a.destination !== 'other';
  const destinationMatches =
    a.destination && e && a.jobProvince
      ? a.destination === e.province && a.jobProvince === e.province
      : undefined;
  const r55 = all(
    province,
    destinationMatches,
    a.settlementPlanGivenToEmployer,
    a.employerDesignated,
    e && e.issued <= req.simulationDate
      ? e.issued <= when && when <= e.expires
      : undefined,
    e?.revoked === undefined ? undefined : !e.revoked,
  );
  const experience = workAssessment(a.workHistory, 'AIP', when);
  const graduate = graduateMet(a.graduate, when);
  const matches =
    teer === undefined
      ? undefined
      : experience.leading?.map((noc) => offerLevel(o?.noc, teer, noc));
  const level = matches?.every((m) => m === 'yes')
    ? true
    : matches?.every((m) => m === 'no')
      ? false
      : undefined;
  const disputed =
    graduate !== true && matches?.some((m) => m.startsWith('disputed'));
  const statuteAllows = matches?.every(
    (m) => m === 'yes' || m === 'disputed-yes',
  );
  const statuteRejects = matches?.every(
    (m) => m === 'no' || m === 'disputed-no',
  );
  const duration =
    teer === undefined
      ? undefined
      : teer === aip.maxTeer
        ? (o?.permanent ?? (o?.monthsAfterPr === undefined ? undefined : false))
        : o?.permanent === true ||
          atLeast(o?.monthsAfterPr, p.eeOffers.value.monthsAfterPr);
  const r56 = all(
    teer === undefined ? undefined : teer <= aip.maxTeer,
    atLeast(o?.hoursPerWeek, p.eeWork.value.weeklyHours),
    duration,
    o?.continuousPaidNonseasonal,
    o?.eligibleNamedEmployer,
    o?.genuine,
    o?.ableAndLikelyToAccept,
    o?.applicantAndPartnerOwnershipPercent === undefined
      ? undefined
      : o.applicantAndPartnerOwnershipPercent <= aip.maxOwnershipPercent,
    any(graduate, level),
  );
  const oral =
    teer === undefined
      ? undefined
      : teer <= p.eeWork.value.skilledTeerMax
        ? aip.higherLanguage
        : aip.otherLanguage;
  const edu = a.education;
  const degree =
    edu?.level === undefined || teer === undefined
      ? undefined
      : edu.level !== 'none' &&
        (teer > p.eeWork.value.higherTeerMax || edu.level !== 'secondary');
  let issuer: boolean | undefined;
  if (edu?.origin === 'Canada') issuer = true;
  else if (a.ecaIssuer && o?.noc) {
    const special =
      o.noc === p.economicOccupations.value.architect
        ? 'CACB'
        : p.economicOccupations.value.doctors.includes(o.noc)
          ? 'MCC'
          : o.noc === p.economicOccupations.value.pharmacist
            ? 'PEBC'
            : 'general-designated';
    issuer = a.ecaIssuer === special;
  }
  const r58 = all(
    teer === undefined ? undefined : teer <= aip.maxTeer,
    degree,
    issuer,
    educationValid(edu, when),
    languageValid(a.language, when),
    oral === undefined ? undefined : levelMet(a.language?.levels, oral),
  );
  const funds = fundsAssessment(
    a.funds,
    all(a.workingInCanada, a.fundsExemptionAuthorization),
    when,
    p.atlanticFunds.value,
  );
  return [
    check(
      'CA-R55',
      L(
        '安家计划、目的省与 endorsement',
        'Settlement plan, province and endorsement',
      ),
      r55,
      L(
        '目的省、工作省和签发省须一致。核对安家计划已交指定雇主、证书递交时有效、其后未被撤销。',
        'The destination, job and endorsing province must match. Confirm the plan reached the designated employer and the endorsement was valid at filing and remains unrevoked.',
      ),
      [
        irpr,
        ref(
          'SRC-270',
          'aip-program, aip-settlement / Get a settlement plan and provincial endorsement',
        ),
      ],
      ['PD-252'],
    ),
    check(
      'CA-R56',
      L('AIP 工作报价', 'Atlantic job offer'),
      r56,
      L(
        `须有指定雇主的全年带薪全职报价，核对履职能力、控制权及依 TEER 的任期和经验要求。${disputed ? ' 法规的职业层级判断为' + (statuteAllows ? '符合' : statuteRejects ? '不符合' : '取决于主要职业') + '；官网说明存在冲突，需人工核实。' : ''}`,
        `Confirm the named employer, genuine year-round paid full-time offer, ability to perform, ownership, duration and experience level.${disputed ? ' The regulation ' + (statuteAllows ? 'accepts this pairing' : statuteRejects ? 'rejects this pairing' : 'depends on the predominant occupation') + ', but IRCC guidance conflicts; seek confirmation.' : ''}`,
      ),
      [irpr, jobGuide],
      ['PD-252'],
    ),
    check(
      'CA-R57',
      L(
        '大西洋工作经验或当地毕业豁免',
        'Atlantic work experience or graduate exemption',
      ),
      any(experience.ok, graduate),
      L(
        `近 ${aip.window} 年至少一年合资格工作、${p.eeWork.value.annualHours} 小时；或近 ${aip.graduateYears} 年当地认可院校毕业，满足全日制、当地居住 ${aip.residenceMonths} 月、授课方式、身份和资助条件。`,
        `Show a year and ${p.eeWork.value.annualHours} qualifying hours in the past ${aip.window} years, or a recognized recent Atlantic credential within ${aip.graduateYears} years, with full-time study, ${aip.residenceMonths} months' local residence, eligible delivery, status and funding.`,
      ),
      [
        irpr,
        ref(
          'SRC-270',
          'aip-work / What counts as related work experience; Exemption; aip-institutions',
        ),
      ],
      ['PD-252'],
    ),
    check(
      'CA-R58',
      L('AIP 学历、评估与语言', 'Atlantic education, equivalency and language'),
      r58,
      L(
        `按报价核对学历、指定机构 ECA 及有效语言测试。TEER 0–1 须至少一年高教，其余合资格岗位须中学；语言四项最低 ${oral ?? '须先确认 TEER'}。无公民考试要求。`,
        `Check the offer-specific credential, designated ECA and current approved test. TEER 0–1 need at least one post-secondary year, other eligible offers need secondary school. Each language skill needs ${oral ?? 'the level for the offer TEER'}. No citizenship test applies.`,
      ),
      [
        irpr,
        ref(
          'SRC-270',
          'aip-education / Jobs that need a special ECA; aip-language / Minimum language requirements',
        ),
      ],
    ),
    check(
      'CA-R59',
      L('大西洋安家资金', 'Atlantic settlement funds'),
      funds.ok,
      L(
        `核对家庭规模、申请及发签时无债务的可转资金；已获授权且正于加拿大工作可获豁免。${funds.amount === undefined ? ' 人数或年度表待确认。' : ' 所需金额 CAD ' + funds.amount + '。'}`,
        `Check family size and available, transferable, unencumbered funds at filing and issue, or confirmed authorized work already underway in Canada.${funds.amount === undefined ? ' Family size or annual table needed.' : ' Required CAD ' + funds.amount + '.'}`,
      ),
      [
        irpr,
        ref(
          'SRC-270',
          'aip-funds / Who needs proof of funds; How much money you need',
        ),
      ],
      ['PD-248'],
    ),
  ];
}
