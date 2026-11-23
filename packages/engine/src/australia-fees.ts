import {
  auCharges as charges,
  auPublicCriteria,
  australiaFull2026_11,
} from '@uk-immigration/policy-data';
import { checker } from './australia-check';
import type { AuFullPathId, AuFullRequest } from './australia-full';
import { functionalEnglish } from './australia-skilled';
import type { CountryCheck } from './country-result';
import { fullYears } from './dates';
import type { IsoDate } from './types';

export interface AuFeeAnswers {
  pacificRegionalPassport?: boolean;
  additionalAdults?: number;
  additionalMinors?: number;
  /** Home Affairs' determination that the non-exempt adult 186 primary applicant owes the second instalment. */
  chargeablePrimaryApplicant?: boolean;
  /** Non-exempt additional adults assessed as lacking functional English. */
  chargeableAdditionalAdults?: number;
  /** Payment before grant for every chargeable secondary applicant. */
  additionalInstalmentsPaid?: boolean;
  /** Item 1114B(2)(b) religious nomination exemption. */
  religiousNominationExemption?: boolean;
  employerAnnualTurnover?: number;
  regionalPosition?: boolean;
  paperReturnApplication?: boolean;
  /** Confirm the actual Schedule 1 fee category at combined lodgement. */
  partnerCategory?:
    'ordinary' | 'qualifying-current-300' | 'qualifying-former-300';
  citizenship?: {
    concessionCard?: 'none' | 'holder' | 'listed-dependant';
    includedWithResponsibleParent?: boolean;
    qualifyingPermanentForcesDays?: number;
    /** Qualifying historical child migrant or section 21(8) statelessness application. */
    otherExemption?: boolean;
    previousApplicationWithTest?: IsoDate | 'none';
  };
}

const money = (n: number) => 'AUD ' + n.toLocaleString('en-AU');
const budgetId = 'AU-FEES-APPLICATION';

function citizenshipBudget(r: AuFullRequest) {
  const params = charges.citizenship.value;
  const a = r.fees?.citizenship;
  const age = r.dateOfBirth
    ? fullYears(r.dateOfBirth, r.simulationDate)
    : undefined;
  const branch = r.citizenship?.medicalBranch;
  const minor =
    age === undefined ? undefined : age < auPublicCriteria.adult.value;
  const withParent =
    age !== undefined &&
    age < params.childWithParentAge &&
    a?.includedWithResponsibleParent;
  const exempt =
    withParent ||
    a?.otherExemption ||
    (a?.qualifyingPermanentForcesDays !== undefined &&
      a.qualifyingPermanentForcesDays >= params.defenceDays);
  const ordinary =
    age !== undefined &&
    age >= auPublicCriteria.adult.value &&
    age < params.seniorAge &&
    branch === 'none';
  const other =
    minor ||
    (age !== undefined && age >= params.seniorAge) ||
    branch === 'incapacity-confirmed' ||
    branch === 'sensory-confirmed';
  const retest =
    a?.previousApplicationWithTest &&
    a.previousApplicationWithTest !== 'none' &&
    a.previousApplicationWithTest >= params.priorApplicationFrom;
  const concession =
    a?.concessionCard === 'holder' ||
    (a?.concessionCard === 'listed-dependant' && minor);
  let total: number | undefined;
  if (exempt) total = 0;
  else if (
    (ordinary || other) &&
    a?.concessionCard !== undefined &&
    a.otherExemption === false &&
    a.qualifyingPermanentForcesDays !== undefined &&
    age !== undefined &&
    (age >= params.childWithParentAge ||
      a.includedWithResponsibleParent !== undefined) &&
    (other || a.previousApplicationWithTest !== undefined)
  ) {
    if (other || retest)
      total = concession ? params.otherConcession : params.other;
    else total = concession ? params.generalConcession : params.general;
  }
  const amountZh =
    total === undefined
      ? '请补充年龄、申请类别、优惠卡、免收费及重申情况。'
      : `本次申请 ${money(total)}。`;
  const amountEn =
    total === undefined
      ? 'Confirm age, eligibility category, concession, exemption and prior application.'
      : `This application costs ${money(total)}.`;
  const result = checker(r.locale)(
    budgetId,
    total === undefined ? undefined : true,
    '入籍申请费用',
    'Citizenship application fee',
    `${amountZh} 普通申请 ${money(params.general)}，优惠 ${money(params.generalConcession)}；其他类别 ${money(params.other)}，优惠 ${money(params.otherConcession)}。符合条件且随家长同表的未满 ${params.childWithParentAge} 岁子女免费，入籍考试及重考免费。`,
    `${amountEn} General eligibility ${money(params.general)} (concession ${money(params.generalConcession)}); other situations ${money(params.other)} (concession ${money(params.otherConcession)}). Eligible children under ${params.childWithParentAge} on their parent's form and citizenship tests or resits are free.`,
    'SRC-209',
    'Sch 3 items 5–18',
  );
  result.sources.push(
    ...charges.citizenship.sources.filter((s) => s.srcId !== 'SRC-209'),
    { srcId: 'SRC-215', locator: 'Citizenship test → Cost' },
  );
  return result;
}

function returnBudget(r: AuFullRequest) {
  const rate = charges.returnVisa.value;
  const f = r.fees;
  const total =
    f?.pacificRegionalPassport !== undefined &&
    f.paperReturnApplication !== undefined
      ? (f.pacificRegionalPassport ? rate.pacific : rate.standard) +
        (f.paperReturnApplication ? rate.nonInternet : 0)
      : undefined;
  const result = checker(r.locale)(
    budgetId,
    total === undefined ? undefined : true,
    '返程签证申请费用',
    'Resident Return visa application fee',
    `${total === undefined ? '请确认护照及递交方式。' : `每份申请 ${money(total)}。`} 每人单独申请，标准 ${money(rate.standard)}，太平洋地区护照 ${money(rate.pacific)}；获准纸质递交另加 ${money(rate.nonInternet)}。`,
    `${total === undefined ? 'Confirm passport and lodgement method.' : `Each application costs ${money(total)}.`} Each person applies separately. Standard ${money(rate.standard)}, Pacific-regional passport ${money(rate.pacific)}. Add ${money(rate.nonInternet)} for an authorised paper application.`,
    'SRC-200',
    charges.returnVisa.sources[0].locator,
  );
  result.sources.push({
    srcId: 'SRC-066',
    locator: 'Step by step → Apply on paper',
  });
  return result;
}

function employerBudget(id: AuFullPathId, r: AuFullRequest) {
  const f = r.fees;
  const levy = charges.trainingLevy.value;
  const training =
    f?.employerAnnualTurnover === undefined
      ? undefined
      : f.employerAnnualTurnover < levy.turnover
        ? levy.small
        : levy.other;
  const nomination =
    id === 'AU-186-DE' || f?.regionalPosition === false
      ? charges.nomination.value
      : f?.regionalPosition
        ? 0
        : undefined;
  const total =
    training === undefined || nomination === undefined
      ? undefined
      : training + nomination;
  const nominationText =
    nomination === undefined
      ? `AUD 0 / ${money(charges.nomination.value)}`
      : money(nomination);
  const levyText =
    training === undefined
      ? `${money(levy.small)} / ${money(levy.other)}`
      : money(training);
  const result = checker(r.locale)(
    'AU-FEES-EMPLOYER',
    total === undefined ? undefined : true,
    '雇主承担的费用',
    'Employer charges',
    `雇主提名费 ${nominationText}，SAF 培训税 ${levyText}。${total === undefined ? '确认岗位地区及雇主营业额后计算。' : `雇主合计 ${money(total)}。`}`,
    `Employer nomination ${nominationText}, SAF levy ${levyText}. ${total === undefined ? 'Confirm position location and annual turnover to calculate the total.' : `Employer total ${money(total)}.`}`,
    'SRC-200',
    'reg 5.37(2)–(3)',
  );
  result.sources.push(...charges.trainingLevy.sources);
  return result;
}

const tariffs = {
  'AU-186-TRT': charges.employer,
  'AU-186-DE': charges.employer,
  'AU-189-PT': charges.independent,
  'AU-189-HK': charges.independent,
  'AU-190': charges.nominated,
  'AU-191': charges.regional,
  'AU-191-HK': charges.regionalHk,
  'AU-PARTNER': charges.partner,
  'AU-858': charges.innovation,
};

function primarySecondInstalment(
  id: keyof typeof tariffs,
  r: AuFullRequest,
): number | undefined {
  const employer = id === 'AU-186-TRT' || id === 'AU-186-DE';
  if (!employer && id !== 'AU-189-HK' && id !== 'AU-191-HK' && id !== 'AU-858')
    return 0;
  const age = r.dateOfBirth
    ? fullYears(
        r.dateOfBirth,
        r.english?.functionalApplicationDate ?? r.simulationDate,
      )
    : undefined;
  if (age !== undefined && age < auPublicCriteria.adult.value) return 0;
  if (employer) {
    if (r.fees?.religiousNominationExemption) return 0;
    if (r.fees?.chargeablePrimaryApplicant !== undefined)
      return r.fees.chargeablePrimaryApplicant
        ? charges.employerPrimarySecond.value
        : 0;
  }
  const functional = functionalEnglish(r);
  if (functional === true) return 0;
  if (!employer && functional === false && age !== undefined)
    return tariffs[id].value.second;
  return undefined;
}

function currentBudget(id: AuFullPathId, r: AuFullRequest): CountryCheck[] {
  if (id === 'AU-CITIZENSHIP') return [citizenshipBudget(r)];
  if (id === 'AU-RRV') return [returnBudget(r)];
  const f = r.fees;
  const employer = id === 'AU-186-TRT' || id === 'AU-186-DE';
  const partner = id === 'AU-PARTNER';
  const offshore =
    (r.partnerApplication?.stream ?? r.partner?.stream) === 'offshore';
  let tariff = tariffs[id];
  if (partner && !offshore) {
    if (f?.partnerCategory === 'qualifying-current-300')
      tariff = charges.currentProspectiveMarriage;
    if (f?.partnerCategory === 'qualifying-former-300')
      tariff = charges.formerProspectiveMarriage;
  }
  const rate = tariff.value;
  const chosen = f?.pacificRegionalPassport ? rate.pacific : rate.standard;
  const first =
    f?.pacificRegionalPassport !== undefined &&
    f.additionalAdults !== undefined &&
    f.additionalMinors !== undefined &&
    (!partner || offshore || f.partnerCategory !== undefined)
      ? chosen[0] +
        chosen[1] * f.additionalAdults +
        chosen[2] * f.additionalMinors
      : undefined;

  const primarySecond = primarySecondInstalment(id, r);
  const additional =
    f?.additionalAdults === 0 || (employer && f?.religiousNominationExemption)
      ? 0
      : f?.chargeableAdditionalAdults;
  const second =
    rate.second === 0
      ? 0
      : primarySecond === undefined || additional === undefined
        ? undefined
        : primarySecond + additional * rate.second;
  const total =
    first !== undefined && second !== undefined ? first + second : undefined;
  const firstText = first === undefined ? undefined : money(first);
  const std = rate.standard.map(money).join(' / ');
  const concession = rate.pacific.map(money).join(' / ');
  const secondText = second === undefined ? undefined : money(second);
  const secondRatesZh = employer
    ? `经正式评定须缴费的主申 ${money(charges.employerPrimarySecond.value)}，成年副申每人 ${money(rate.second)}。`
    : `适用者每人 ${money(rate.second)}。`;
  const secondRatesEn = employer
    ? `For applicants assessed as chargeable, ${money(charges.employerPrimarySecond.value)} for the primary applicant and ${money(rate.second)} for each additional adult.`
    : `${money(rate.second)} per chargeable person.`;
  const extraPartnerZh = partner
    ? '费用在合并申请时缴纳，已合并递交的永久阶段另收 AUD 0。符合条件的现持或曾持 300 签证者适用不同的境内费率。'
    : '';
  const extraPartnerEn = partner
    ? ' Pay once at combined lodgement. Additional permanent-stage charge AUD 0. Different onshore tariffs apply to qualifying current and former 300 holders.'
    : '';
  const result = checker(r.locale)(
    budgetId,
    total === undefined ? undefined : true,
    '申请人家庭签证费预算',
    'Applicant family visa budget',
    `${total === undefined ? '总额待确认。' : `家庭合计 ${money(total)}。`} 第一期${firstText ? '合计 ' + firstText : '待确认'}。主申／成年副申／未成年副申标准费率 ${std}；太平洋地区护照费率 ${concession}。第二期${secondText ?? '待确认'}。${secondRatesZh}${extraPartnerZh}`,
    `${total === undefined ? 'Total awaits your answers.' : `Family total ${money(total)}.`} First instalment ${firstText ?? 'pending'}. Primary / additional adult / additional minor rates: standard ${std}; Pacific-regional passport ${concession}. Second instalment ${secondText ?? 'pending'}. ${secondRatesEn}${extraPartnerEn}`,
    'SRC-200',
    tariff.sources[0].locator,
  );
  return employer ? [result, employerBudget(id, r)] : [result];
}

/** The second instalment is a grant condition, separate from the household budget. */
export function instalmentChecks(
  id: AuFullPathId,
  r: AuFullRequest,
): CountryCheck[] {
  if (id === 'AU-RRV' || id === 'AU-CITIZENSHIP') return [];
  const tariff = tariffs[id];
  if (tariff.value.second === 0) return [];
  const f = r.fees;
  const exempt =
    (id === 'AU-186-DE' || id === 'AU-186-TRT') &&
    f?.religiousNominationExemption;
  const met =
    exempt ||
    f?.additionalAdults === 0 ||
    f?.chargeableAdditionalAdults === 0 ||
    f?.additionalInstalmentsPaid === true
      ? true
      : f?.chargeableAdditionalAdults === undefined
        ? undefined
        : f.additionalInstalmentsPaid;
  const checks = [
    checker(r.locale)(
      'AU-additional-english',
      met,
      '成年副申请人的英语或第二期费用',
      'Functional English or payment for additional adults',
      '确认所有适用的成年副申请人具备 Functional English、属于免费类别，或已在批签前缴清其第二期费用。',
      'Confirm each additional adult has functional English, is exempt, or has paid the required second instalment before grant.',
      'SRC-200',
      tariff.sources[0].locator,
    ),
  ];
  if (id === 'AU-186-DE' || id === 'AU-186-TRT') {
    const amount = primarySecondInstalment(id, r);
    checks.push(
      checker(r.locale)(
        'AU-186-primary-instalment',
        amount === 0 || r.secondInstalmentPaid === true
          ? true
          : amount === undefined
            ? undefined
            : r.secondInstalmentPaid,
        '主申请人批签前第二期费用',
        'Primary applicant second instalment before grant',
        '成年主申请人如经内政部正式评定缺少 Functional English，须在批签前缴清适用的第二期费用。符合免费类别或已证明 Functional English 时，此项满足。',
        'An adult primary applicant assessed by Home Affairs as lacking functional English must pay any applicable second instalment before grant. An exemption or evidence of functional English also satisfies this check.',
        'SRC-200',
        'Sch 1 item 1114B(2)(b) rows 1, 3–4',
      ),
    );
  }
  return checks;
}

export function feeChecks(id: AuFullPathId, r: AuFullRequest): CountryCheck[] {
  const date =
    id === 'AU-PARTNER'
      ? (r.partnerApplication?.lodged ?? r.simulationDate)
      : r.simulationDate;
  const from = charges.effectiveFrom.value;
  const asOf = australiaFull2026_11.asOf;
  const historical = date < from;
  const projected = date > asOf;
  return currentBudget(id, r).map((check) => {
    const en = r.locale === 'en';
    const timing = historical
      ? en
        ? `The fee at lodgement on ${date} requires the historical tariff or receipt. Illustrative budget for a new application at the ${from} rates.`
        : `${date} 递交时的金额须按当时费表或收据核实。以下按 ${from} 费率估算重新递交的金额。`
      : projected
        ? en
          ? `Estimate for ${date} using the ${from} rates checked on ${asOf}. The charge at future lodgement may change.`
          : `依 ${asOf} 核实的 ${from} 费率估算 ${date} 的预算，实际金额以届时费表为准。`
        : en
          ? `Rates effective ${from}.`
          : `采用 ${from} 生效的费率。`;
    return {
      ...check,
      status: historical || projected ? 'UNKNOWN' : check.status,
      explanation: timing + ' ' + check.explanation,
    };
  });
}
