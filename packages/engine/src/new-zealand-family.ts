import {
  nzFamilyParameters,
  nzCommonParameters,
} from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addDays, addMonths, addYears, fullYears } from './dates';
import {
  all,
  any,
  atLeast,
  atMost,
  esolCharge,
  not,
  skilledEnglish,
  type NzContext,
} from './new-zealand-checks';

const partnership = nzFamilyParameters.partnership.value;
const parent = nzFamilyParameters.parentSponsorship.value;
const parentEnglish = nzFamilyParameters.parentEnglish.value;
const english = nzFamilyParameters.familyEnglishOverall.value;
const investor = nzFamilyParameters.activeInvestor.value;
const business = nzFamilyParameters.businessInvestor.value;
const religious = nzFamilyParameters.religiousWorker.value;
const historicFees = nzFamilyParameters.familyHistoricFeeProposals.value;

type Assessment = 'accepted' | 'declined' | 'pending';
type TestType = 'ielts' | 'toefl' | 'pte' | 'cambridge';
type EnglishEvidence =
  | {
      method: 'test';
      type: TestType | 'oet';
      overall?: number;
      skills?: [number, number, number, number];
      oetGrades?: [string, string, string, string];
      date?: string;
      atTestCentre?: boolean;
    }
  | {
      method:
        | 'accepted-alternative'
        | 'alternative-under-review'
        | 'none'
        | 'esol-paid';
    };

interface PartnerAnswers {
  goal?: 'resident' | 'direct-prv';
  partnerAge?: number;
  monthsTogetherAfterBothAdult?: number;
  metInPerson?: boolean;
  eligibleRelationshipFormAndKinship?: boolean;
  genuineStableEvidence?: Assessment;
  separation?: 'none' | Assessment;
  earlierNonDeclaration?: 'none' | 'barred-eoi' | Assessment;
  sponsorStatus?: 'citizen' | 'resident' | 'australian-basis' | 'other';
  sponsorPrimarilyResidentInNz?: boolean;
  previousSuccessfulApplications?: number;
  lastSuccessfulApplication?: string;
  sponsorFreeOfDeportationLiabilityAndS4Bar?: boolean;
  sponsorCharacter?: Assessment;
  sponsorPoliceEvidence?: boolean;
  earlierCategoryRequiredEnglish?: boolean;
  // Compliance with the applicable former category's secondary applicant rule,
  // including any ESOL alternative, at the time of the new application.
  earlierCategoryEnglish?: Assessment;
  // Rolling windows ending on application (offshore), or on return (onshore).
  citizenNzMonthsPerYear?: number[];
  citizenOffshore?: boolean;
  citizenLastReturn?: string;
}
interface ParentSponsor {
  age?: number;
  notDependentChild?: boolean;
  currentUnconditionalCitizenOrResident?: boolean;
  yearsAsCitizenOrResident?: number;
  normallyResidentInNz?: boolean;
  nzDaysInEachPriorYear?: number[];
  meetsOtherR4Conditions?: boolean;
  acceptsSupportUndertaking?: boolean;
}
interface ParentAnswers {
  relationship?: 'parent' | 'grandparent' | 'guardian' | 'ineligible';
  bothBiologicalParentsDeceased?: boolean;
  bothDiedAndGuardianshipBeforeAdulthood?: boolean;
  mostRecentLegalGuardian?: boolean;
  // Includes all children of either included applicant as defined by F4.30.1.
  children?: {
    age?: number;
    single?: boolean;
    hasOwnChildren?: boolean;
    financiallyDependent?: boolean;
  }[];
  eoiChannel?: 'online' | 'paper';
  eoi?: 'not-filed' | 'in-pool' | 'expired' | 'revoked' | 'invited';
  invitationDate?: string;
  selectionDate?: string;
  scheme?: 'child' | 'child-and-partner' | 'two-children';
  sponsors?: ParentSponsor[];
  jointPartnerCohabitationMonths?: number;
  jointPartnershipRecognised?: boolean;
  // All currently sponsored parents plus those in this application.
  parentsSponsored?: number;
  // Each entry represents one common 12-month period. IRD figures from each
  // sponsor are for exactly that interval, including eligible distributions.
  incomePeriods?: { from: string; irdIncomePerSponsor: number[] }[];
  applicantEnglish?: EnglishEvidence;
  includesPartner?: boolean;
  partnerEnglish?: EnglishEvidence;
  parentBoost?:
    'never-held' | 'covered' | 'insurer-bank-error-promptly-restored' | 'gap';
  outstandingBoostCrownDebt?: boolean;
}

interface ActiveInvestorAnswers {
  category?: 'growth' | 'balanced';
  goal?: 'resident' | 'investment-conditions';
  nominatedFunds?: number;
  totalInvested?: number;
  qualifyingInvestments?: Assessment;
  qualifyingPhilanthropy?: number;
  cleanFundsAndTransfer?: Assessment;
  fitAndProper?: Assessment;
  approvalInPrinciple?: string;
  allInvestmentsCompleted?: string;
  extensionGranted?: boolean;
  transferEvidenceFiled?: string;
  currentContactDetailsProvided?: boolean;
  // Retained, approved direct investment or managed funds nominated before AIP
  // specifically in addition to the base Balanced investment.
  eligibleBalancedTopUp?: number;
  residentDaysDuringInvestment?: number;
  retainedHoldingsAndUpdatedAddress?: boolean;
  interimEvidenceAndQuestionnaire?: string;
  finalEvidenceAndQuestionnaire?: string;
}
interface BusinessAnswers {
  stage?: 'work' | 'residence';
  workApplicationAge?: number;
  workApplicationDate?: string;
  principalEnglish?: EnglishEvidence;
  cleanBankruptcyYears?: number;
  fitAndProper?: Assessment;
  reserveFunds?: number;
  // Non-overlapping periods of lawful paid work, with annual revenue in NZD.
  experience?: {
    role: 'owner' | 'senior-manager';
    years: number;
    weeklyHours: number;
    fullTimeEmployees: number;
    revenue: number;
  }[];
  targetAndDueDiligence?: Assessment;
  capitalAndOperatingPlan?: boolean;
  holdsBusinessInvestorWorkVisa?: boolean;
  acquisitionExcludingRealEstate?: number;
  activeOwnershipMonths?: number;
  annualNzDays?: number[];
  retainedOwnershipAndSameApprovedBusiness?: boolean;
  solventRegisteredAndCompliant?: Assessment;
  currentFte?: number;
  additionalNzFte?: number;
  additionalJobMonths?: number;
  workApplicationEvidenceComplete?: boolean;
}
interface ReligiousAnswers {
  inNz?: boolean;
  compliantVisaYears?: number;
  qualifyingTrainingOrWorkYears?: number;
  eligibleSponsorAndLongTermNeed?: Assessment;
  sponsorshipUndertaking?: boolean;
  qualifyingReligiousDutiesAndOffer?: boolean;
  offerYears?: number | 'indefinite';
  welfareSinceWorkVisa?:
    'none' | 'claimed-or-granted' | 'tax-credit-or-unclear';
  principalEnglish?: EnglishEvidence;
}
export interface NzFamilyAnswers {
  partner?: PartnerAnswers;
  parent?: ParentAnswers;
  investment?: {
    route?: 'active' | 'business';
    active?: ActiveInvestorAnswers;
    business?: BusinessAnswers;
  };
  religious?: ReligiousAnswers;
}

function assessed(answer?: Assessment): boolean | undefined {
  return answer === 'accepted'
    ? true
    : answer === 'declined'
      ? false
      : undefined;
}
const source = (srcId: string, locator: string): SourceRef[] => [
  { srcId, locator },
];

function annualValues(
  values: number[] | undefined,
  count: number,
  test: (v: number) => boolean,
) {
  if (!values) return undefined;
  if (values.slice(0, count).some((v) => !test(v))) return false;
  return values.length === count ? true : undefined;
}

function englishEvidence(
  e: EnglishEvidence | undefined,
  date: string,
  role: 'parent' | 'principal',
  testRequested: boolean | undefined,
) {
  if (!e) return undefined;
  if (e.method === 'alternative-under-review')
    return all(not(testRequested), undefined);
  if (e.method === 'accepted-alternative') return not(testRequested);
  if (e.method === 'esol-paid') return role !== 'principal';
  if (e.method !== 'test') return false;
  const current =
    e.date === undefined
      ? undefined
      : e.date <= date && date <= addYears(e.date, english.validityYears);
  let scores: boolean | undefined;
  if (e.type === 'oet') {
    const grades = e.oetGrades;
    if (grades) {
      const general = grades.every((g) => ['A', 'B', 'C+', 'C'].includes(g));
      const lower = grades.filter((g) =>
        ['A', 'B', 'C+', 'C', 'D'].includes(g),
      ).length;
      scores =
        general || (role === 'parent' && lower >= parentEnglish.skillsNeeded);
    }
  } else {
    scores = atLeast(e.overall, english[e.type]);
    if (role === 'parent') {
      const thresholds =
        e.type === 'toefl'
          ? [
              parentEnglish.toeflListening,
              parentEnglish.toeflReading,
              parentEnglish.toeflWriting,
              parentEnglish.toeflSpeaking,
            ]
          : Array<number>(4).fill(
              {
                ielts: parentEnglish.ieltsSkill,
                pte: parentEnglish.pteSkill,
                cambridge: parentEnglish.cambridgeSkill,
              }[e.type],
            );
      const passingSkills = e.skills?.filter(
        (score, i) => score >= thresholds[i],
      ).length;
      scores = any(scores, atLeast(passingSkills, parentEnglish.skillsNeeded));
    }
  }
  return all(e.atTestCentre, current, scores);
}

function dependantEnglish(ctx: NzContext, route: 'religious' | 'business') {
  const bands = nzCommonParameters.englishEsolBands.value;
  const charges: number[] = [];
  const assessments = ctx.answers.dependants?.map((person) => {
    const exempt =
      person.dateOfBirth === undefined
        ? undefined
        : fullYears(person.dateOfBirth, ctx.date) < english.dependantAge;
    let passed = skilledEnglish(person, ctx.date, false, false);
    if (route === 'religious' && person.english?.method !== 'test') {
      // RW5.1 leaves non-test evidence to the officer rather than applying the SR2 citizenship and qualification rules.
      passed = all(
        not(person.testSpecificallyRequested),
        person.religiousEnglishBackground === undefined &&
          person.english?.method === 'none'
          ? false
          : assessed(person.religiousEnglishBackground),
      );
    }
    if (
      exempt === false &&
      passed !== true &&
      (person.esol === 'planned' || person.esol === 'paid-and-signed')
    ) {
      const charge = esolCharge(person, ctx.date, false);
      if (charge !== undefined) charges.push(charge);
    }
    return any(
      exempt,
      passed,
      person.esol === undefined ? undefined : person.esol === 'paid-and-signed',
    );
  });
  const amounts = charges
    .map((n) => 'NZ$' + n.toLocaleString('en'))
    .join(' + ');
  const feeBands = [
    bands.upperFee,
    bands.middleFee,
    bands.lowIeltsFee,
    bands.highFee,
  ]
    .map((n) => 'NZ$' + n.toLocaleString('en'))
    .join(' / ');
  return {
    met: assessments && all(...assessments),
    zh: `家属可按成绩档位签约并预付 ESOL（${feeBands}）。${amounts ? '已能估算的个人费用为 ' + amounts + '。' : ''}`,
    en: `Dependants may sign the agreement and prepay ESOL at the score-based rates (${feeBands}).${amounts ? ' Individual estimates: ' + amounts + '.' : ''}`,
  };
}

function fee(ctx: NzContext, id: string, zh: string, en: string) {
  return ctx.check(
    id,
    '费用参考',
    'Fee information',
    undefined,
    nzFamilyParameters.familyHistoricFeeProposals.sources,
    zh + '。现行收费须向 INZ 核实。',
    en + '. Confirm the current charge with INZ.',
    'PD-225',
  );
}

function partnerPath(ctx: NzContext, a: PartnerAnswers): CountryPathway {
  const ref = (loc: string) => source('SRC-242', loc);
  const c = ctx.check;
  const prior = a.previousSuccessfulApplications;
  const cooling =
    prior === 0
      ? true
      : a.lastSuccessfulApplication
        ? addYears(a.lastSuccessfulApplication, partnership.coolingYears) <=
          ctx.date
        : undefined;
  const sponsorStatus =
    a.sponsorStatus === 'australian-basis'
      ? a.sponsorPrimarilyResidentInNz
      : a.sponsorStatus === undefined
        ? undefined
        : a.sponsorStatus !== 'other';
  const declaration = a.earlierNonDeclaration;
  const disclosure =
    declaration === 'none' || declaration === 'accepted'
      ? true
      : declaration === 'barred-eoi' || declaration === 'declined'
        ? false
        : undefined;
  const earlierEnglish =
    ctx.familyOmission === false || a.earlierCategoryRequiredEnglish === false
      ? true
      : ctx.familyOmission && a.earlierCategoryRequiredEnglish
        ? assessed(a.earlierCategoryEnglish)
        : assessed(a.earlierCategoryEnglish) === true
          ? true
          : undefined;
  const inTime =
    a.citizenOffshore === true
      ? true
      : a.citizenOffshore === false && a.citizenLastReturn
        ? a.citizenLastReturn <= ctx.date &&
          ctx.date <= addMonths(a.citizenLastReturn, partnership.returnMonths)
        : undefined;
  const offshoreYears = annualValues(
    a.citizenNzMonthsPerYear,
    partnership.overseasYears,
    (n) => n < partnership.nzMonthsPerYearExclusive,
  );
  // In a dedicated partnership category, even a genuine relationship cannot
  // accrue recognised evidence before the younger partner's 18th birthday.
  const bothAdultForMonths = (months: number) =>
    all(
      atLeast(ctx.age, partnership.minimumAge + months / 12),
      atLeast(a.partnerAge, partnership.minimumAge + months / 12),
      atLeast(a.monthsTogetherAfterBothAdult, months),
    );
  const direct = all(
    a.sponsorStatus === undefined ? undefined : a.sponsorStatus === 'citizen',
    bothAdultForMonths(partnership.directPrvMonthsTogether),
    offshoreYears,
    inTime,
  );
  const checks = [
    c(
      'NZ-P7-1',
      '关系与同居证据',
      'Partnership and cohabitation',
      all(
        bothAdultForMonths(partnership.monthsTogether),
        a.metInPerson,
        a.eligibleRelationshipFormAndKinship,
        assessed(a.genuineStableEvidence),
        a.separation === 'none' ? true : assessed(a.separation),
        disclosure,
      ),
      ref('F2.5(a),(d),(e); F2.15.1; F2.30.1; F2.40.5'),
      '双方须已成年，成年后同居满规定月份，并有真实稳定关系证据。分居与此前漏报的解释须经核准，指定获邀 EOI 或成功父母申请的漏报会阻断申请。',
      'Both partners must be adults with the required cohabitation after adulthood and evidence of a genuine, stable relationship. Separation and non-disclosure need assessment. Omission from a specified selected EOI or successful Parent application bars a grant.',
      'PD-227',
    ),
    c(
      'NZ-P7-2',
      '担保人资格与品格',
      'Supporting partner',
      all(
        sponsorStatus,
        atMost(prior, partnership.previousSuccessfulApplications),
        cooling,
        a.sponsorFreeOfDeportationLiabilityAndS4Bar,
        assessed(a.sponsorCharacter),
        a.sponsorPoliceEvidence,
      ),
      ref('F2.10.5, F2.10.10; R5.95.1–5; F2.40.10'),
      '核查担保人身份、历次获批与间隔、驱逐责任、家暴受害者签证、警方证明与品格豁免。其未解除的 s49 条件随新签证附加。',
      'Check sponsor status, prior grants and interval, deportation liability, family violence, police evidence and any waiver. Outstanding sponsor s49 conditions attach to the new visa.',
      'PD-227',
    ),
    c(
      'NZ-P7-3',
      '先前申请与英语',
      'Earlier application and English',
      earlierEnglish,
      ref('F2.40.1; R5.96'),
      '无固定担保收入线。被早期申请遗漏或撤回时，原类别若要求副申请人英语，须证明符合该类别现行英语或 ESOL 要求，并核查完整体检。',
      'There is no sponsor income threshold. Omitted or withdrawn eligible partners need the earlier category’s current secondary English or ESOL standard if it required English, and a general medical certificate.',
      'PD-227',
    ),
    c(
      'NZ-P7-4',
      '直接获永久居民签证的附加条件',
      'Additional criteria for direct permanent residence',
      direct,
      ref('F2.5.1(a)–(d)'),
      '在普通伴侣条件外，须与新西兰公民同居满五年。核查逐年在境月份，以及公民伴侣是否在境外或近期回国。',
      'In addition to ordinary partnership criteria, check five years together with a citizen, each annual NZ stay and whether the citizen is offshore or recently returned.',
      'PD-227',
    ),
    fee(
      ctx,
      'NZ-P7-FEE',
      `历史家庭类费用建议为 NZ$${historicFees.family}`,
      `Historical Family Category proposal: NZ$${historicFees.family}`,
    ),
  ];
  const advisory =
    a.goal === 'direct-prv' ? ['NZ-P7-FEE'] : ['NZ-P7-FEE', 'NZ-P7-4'];
  return ctx.path(
    'NZ-P7',
    '伴侣类别居民签证',
    'Partnership residence',
    [
      ...checks,
      ...ctx.partnerCommon(
        checks.filter((check) => !advisory.includes(check.id)),
      ),
    ],
    advisory,
  );
}

function noDependentChildren(children: ParentAnswers['children']) {
  if (!children) return undefined;
  return all(
    ...children.map((child) => {
      if (
        child.single === false ||
        (child.age !== undefined && child.age > parent.dependentAge)
      )
        return true;
      if (child.age === undefined) return undefined;
      const dependent =
        child.age < parent.adultAge
          ? child.single
          : all(
              child.single,
              child.hasOwnChildren === undefined
                ? undefined
                : !child.hasOwnChildren,
              child.age <= parent.childAgeWithoutChildren ||
                child.financiallyDependent,
            );
      return dependent === undefined ? undefined : !dependent;
    }),
  );
}

function parentIncome(ctx: NzContext, a: ParentAnswers, sponsorCount?: number) {
  const count = a.parentsSponsored;
  const selection = a.selectionDate;
  if (a.incomePeriods?.length === 0) return false;
  if (count === undefined || !sponsorCount || !selection || !a.incomePeriods)
    return undefined;
  if (count < 1 || count > parent.maxParents) return false;
  const multiplier =
    parent.singleParentMultiplier +
    (count - 1 + sponsorCount - 1) * parent.additionalMultiplier;
  const medians = Object.entries(
    nzFamilyParameters.parentMedianIncome.value,
  ).reverse();
  const periods = a.incomePeriods.map((p) => {
    const end = addDays(addMonths(p.from, parent.periodMonths), -1);
    const median = medians.find(([from]) => from <= end)?.[1];
    const withinWindow =
      p.from >= addYears(selection, -parent.lookbackYears) && end < selection;
    // Compare in cents so exact thresholds ending in .20 or .60 stay inclusive.
    const amount = p.irdIncomePerSponsor.reduce(
      (sum, income) => sum + Math.round(income * 100),
      0,
    );
    return {
      from: p.from,
      end,
      met: all(
        withinWindow,
        end > ctx.policyAsOf ||
          median === undefined ||
          p.irdIncomePerSponsor.length !== sponsorCount
          ? undefined
          : amount >= Math.round(median * multiplier * 100),
      ),
    };
  });
  if (periods.length < parent.periodsNeeded) return undefined;
  return any(
    ...periods.flatMap((x, i) =>
      periods
        .slice(i + 1)
        .map((y) => all(x.met, y.met, x.end < y.from || y.end < x.from)),
    ),
  );
}

function parentPath(ctx: NzContext, a: ParentAnswers): CountryPathway {
  const c = ctx.check;
  const ref = (loc: string) => source('SRC-243', loc);
  const relationship =
    a.relationship === 'parent'
      ? true
      : a.relationship === 'grandparent'
        ? a.bothBiologicalParentsDeceased
        : a.relationship === 'guardian'
          ? all(
              a.bothDiedAndGuardianshipBeforeAdulthood,
              a.mostRecentLegalGuardian,
            )
          : a.relationship === 'ineligible'
            ? false
            : undefined;
  const invitation =
    a.eoi === 'invited'
      ? a.invitationDate
        ? a.invitationDate <= ctx.date &&
          ctx.date <= addMonths(a.invitationDate, parent.itaMonths)
        : undefined
      : a.eoi === 'not-filed' || a.eoi === 'expired' || a.eoi === 'revoked'
        ? false
        : undefined;
  const donors =
    a.scheme === undefined ? undefined : a.scheme === 'child' ? 1 : 2;
  const sponsors = a.sponsors?.map((s) =>
    all(
      atLeast(s.age, parent.adultAge),
      s.age !== undefined && s.age > parent.dependentAge
        ? true
        : s.notDependentChild,
      s.currentUnconditionalCitizenOrResident,
      atLeast(s.yearsAsCitizenOrResident, parent.residentYears),
      s.normallyResidentInNz,
      annualValues(
        s.nzDaysInEachPriorYear,
        parent.residentYears,
        (n) => n >= parent.daysPerYear,
      ),
      s.meetsOtherR4Conditions,
      s.acceptsSupportUndertaking,
    ),
  );
  const scheme =
    a.scheme === 'child-and-partner'
      ? all(
          atLeast(a.jointPartnerCohabitationMonths, partnership.monthsTogether),
          a.jointPartnershipRecognised,
        )
      : a.scheme === undefined
        ? undefined
        : true;
  const includedPartner = ctx.answers.dependants?.find(
    (person) => person.relation === 'partner',
  );
  // A declared partner needs a household entry for the shared health,
  // character and identity checks to assess that person.
  const partnerRosterComplete =
    a.includesPartner === true && includedPartner === undefined
      ? undefined
      : true;
  const includesPartner = includedPartner !== undefined || a.includesPartner;
  const parentTest = all(
    englishEvidence(
      a.applicantEnglish,
      ctx.date,
      'parent',
      ctx.testSpecificallyRequested,
    ),
    includesPartner === false
      ? true
      : includesPartner === true
        ? englishEvidence(
            a.partnerEnglish,
            ctx.date,
            'parent',
            includedPartner?.testSpecificallyRequested,
          )
        : undefined,
  );
  const eoiFee =
    a.eoiChannel === undefined
      ? undefined
      : a.eoiChannel === 'paper'
        ? historicFees.parentPaperEoi
        : historicFees.parentOnlineEoi;
  const applicants = includesPartner
    ? [a.applicantEnglish, a.partnerEnglish]
    : [a.applicantEnglish];
  const esolCost =
    parentEnglish.esol *
    applicants.filter((e) => e?.method === 'esol-paid').length;
  const estimate =
    eoiFee !== undefined && parentTest === true
      ? eoiFee + historicFees.family + esolCost
      : undefined;
  const boost =
    a.parentBoost === 'never-held'
      ? true
      : all(
          a.parentBoost === undefined ? undefined : a.parentBoost !== 'gap',
          a.outstandingBoostCrownDebt === undefined
            ? undefined
            : !a.outstandingBoostCrownDebt,
        );
  const checks = [
    c(
      'NZ-P8-1',
      '亲属关系与受抚养子女',
      'Family relationship and dependent children',
      all(relationship, noDependentChildren(a.children), partnerRosterComplete),
      ref('F4.20.1; F4.30.1–10'),
      '核实亲属或监护关系。随行伴侣须列入家属名单。任何纳入申请的父母仍有受抚养子女都会阻断申请。',
      'Verify the relationship or qualifying guardianship and list any accompanying partner. Dependent children of any included applicant bar the application.',
      'PD-227',
    ),
    c(
      'NZ-P8-1-ITA',
      '意向书及有效邀请',
      'Expression of interest and valid invitation',
      invitation,
      ref('F4.1.10; F4.5.1–10; F4.10.1'),
      `每年上限 ${parent.annualPlaces} 人。入池后每 ${parent.renewalYears} 年续期，宽限 ${parent.renewalGraceMonths} 个月。年度遴选约 ${parent.queuePercent}% 按提交顺序、${parent.ballotPercent}% 抽签，无法预测获邀日，须在未撤销的邀请发出后 ${parent.itaMonths} 个月内递交。`,
      `There are ${parent.annualPlaces} annual places. Reconfirm interest every ${parent.renewalYears} years within the ${parent.renewalGraceMonths}-month window. About ${parent.queuePercent}% of selections are in date order and ${parent.ballotPercent}% by ballot. An invitation date cannot be predicted. Lodge within ${parent.itaMonths} months of a valid invitation.`,
      'PD-227',
    ),
    c(
      'NZ-P8-2',
      '担保人资格',
      'Sponsor eligibility',
      all(
        scheme,
        sponsors && donors !== undefined
          ? sponsors.length === donors
          : undefined,
        ...(sponsors ?? []),
        atLeast(a.parentsSponsored, 1),
        atMost(a.parentsSponsored, parent.maxParents),
      ),
      ref('F4.20.5–15; F4.35.1; F4.35.5(e); R4.5(d); F4.45'),
      `核查每位担保人身份、独立生活、通常在境、前三年各住满 ${parent.daysPerYear} 天及履行 ${parent.yearsOfSupport} 年担保的资格。`,
      `Verify each sponsor’s status, independence, ordinary residence, ${parent.daysPerYear} days in each preceding year and eligibility to support the family for ${parent.yearsOfSupport} years.`,
      'PD-227',
    ),
    c(
      'NZ-P8-2-INCOME',
      '担保人应税收入',
      'Sponsor taxable income',
      parentIncome(ctx, a, donors),
      ref('F4.35.5–5.15, tables F4.35.5.1(b),(c)'),
      '按 EOI 被选定前三年内的两个不重叠年度，分别用期末费率核对 IRD 收入。联合担保人使用同一组区间，同时计入仍在担保的父母。未来费率待确认。',
      'Check two non-overlapping years in the three years before EOI selection, using the median in force at each period end. Joint sponsors use identical periods and include parents already sponsored. Future rates need confirmation.',
      'PD-227',
    ),
    c(
      'NZ-P8-3',
      '每位申请人的英语或 ESOL',
      'English or ESOL for each applicant',
      parentTest,
      ref('F4.25.1–10, F4.25.45'),
      `父母及随行伴侣分别提供合格英语证据，或签署协议并预付每人 NZ$${parentEnglish.esol} 的 ESOL。背景或面试证据待移民官判断。`,
      `Each included parent needs accepted English evidence or the signed ESOL agreement and NZ$${parentEnglish.esol} payment. Background or interview evidence awaits an officer’s assessment.`,
      'PD-227',
    ),
    c(
      'NZ-P8-4',
      'Parent Boost 保险及政府债务',
      'Parent Boost insurance and Crown debt',
      boost,
      ref('F4.15.1(f); F4.20.20–25'),
      '曾持 Parent Boost 者须保持合规保险且无相关政府欠款。保险商或银行失误且尽快恢复保险的中断可计入。',
      'Prior Parent Boost holders need acceptable cover and no outstanding related Crown debt. A bank or insurer error qualifies only if cover resumed promptly.',
      'PD-227',
    ),
    fee(
      ctx,
      'NZ-P8-5',
      `历史 EOI 建议价为网上 NZ$${historicFees.parentOnlineEoi}、纸质 NZ$${historicFees.parentPaperEoi}，家庭类申请 NZ$${historicFees.family}，另计适用 ESOL。${estimate === undefined ? '' : '按所选递交方式与 ESOL 合计 NZ$' + estimate}`,
      `Historical proposal: online EOI NZ$${historicFees.parentOnlineEoi}, paper NZ$${historicFees.parentPaperEoi}, family residence NZ$${historicFees.family}, plus any ESOL.${estimate === undefined ? '' : ' Estimated total for this filing method and ESOL: NZ$' + estimate}`,
    ),
    ...ctx.common('parent'),
  ];
  return ctx.path('NZ-P8', '父母类别居民签证', 'Parent residence', checks, [
    'NZ-P8-5',
  ]);
}

function activeChecks(
  ctx: NzContext,
  a: ActiveInvestorAnswers,
): CountryCheck[] {
  const ref = (loc: string) => source('SRC-244', loc);
  const c = ctx.check;
  const growth = a.category === 'growth';
  const min = growth ? investor.growth : investor.balanced;
  const period = growth ? investor.growthMonths : investor.balancedMonths;
  const start =
    a.approvalInPrinciple &&
    a.allInvestmentsCompleted &&
    (a.approvalInPrinciple > a.allInvestmentsCompleted
      ? a.approvalInPrinciple
      : a.allInvestmentsCompleted);
  const finish = a.category && start && addMonths(start, period);
  const interim = start && addMonths(start, investor.checkpointMonths);
  const donation =
    a.totalInvested === undefined
      ? undefined
      : atMost(
          a.qualifyingPhilanthropy,
          investor.growthGiftShare * a.totalInvested,
        );
  function byDeadline(filed?: string, until?: string, from?: string) {
    if (!until) return undefined;
    if (filed)
      return filed <= ctx.date && filed <= until && (!from || filed >= from);
    return undefined;
  }
  function transferWithin(months: number) {
    if (!a.approvalInPrinciple) return undefined;
    const deadline = addMonths(a.approvalInPrinciple, months);
    return all(
      a.approvalInPrinciple <= ctx.date,
      byDeadline(a.allInvestmentsCompleted, deadline),
      byDeadline(
        a.transferEvidenceFiled,
        addMonths(deadline, investor.proofMonths),
        a.allInvestmentsCompleted,
      ),
    );
  }
  const transferTime = any(
    transferWithin(investor.transferMonths),
    all(a.extensionGranted, transferWithin(investor.extendedMonths)),
  );
  const noEligibleIncrement = [
    a.nominatedFunds,
    a.totalInvested,
    a.eligibleBalancedTopUp === undefined
      ? undefined
      : investor.balanced + a.eligibleBalancedTopUp,
  ].some(
    (amount) =>
      amount !== undefined &&
      amount < investor.balanced + investor.topUpIncrement,
  );
  const cappedTopUp = noEligibleIncrement
    ? 0
    : a.eligibleBalancedTopUp === undefined ||
        a.totalInvested === undefined ||
        a.nominatedFunds === undefined
      ? undefined
      : Math.max(
          0,
          Math.min(
            a.eligibleBalancedTopUp,
            a.nominatedFunds - investor.balanced,
            a.totalInvested - investor.balanced,
          ),
        );
  const requiredDays = growth
    ? investor.growthDays
    : cappedTopUp === undefined
      ? undefined
      : investor.balancedDays -
        Math.min(
          investor.maxReductionDays,
          Math.floor(cappedTopUp / investor.topUpIncrement) *
            investor.daysPerIncrement,
        );
  // Without top-up evidence only the range between the minimum and maximum is unresolved.
  const possibleBalancedPresence = atLeast(
    a.residentDaysDuringInvestment,
    investor.balancedDays,
  )
    ? true
    : atLeast(
          a.residentDaysDuringInvestment,
          investor.balancedDays - investor.maxReductionDays,
        ) === false
      ? false
      : undefined;
  const presence =
    a.category === undefined
      ? undefined
      : requiredDays === undefined
        ? possibleBalancedPresence
        : atLeast(a.residentDaysDuringInvestment, requiredDays);
  const retention = all(
    a.category === undefined ? undefined : true,
    finish ? ctx.date >= finish : undefined,
    a.retainedHoldingsAndUpdatedAddress,
    presence,
    byDeadline(
      a.interimEvidenceAndQuestionnaire,
      interim && addMonths(interim, investor.proofMonths),
      interim,
    ),
    byDeadline(
      a.finalEvidenceAndQuestionnaire,
      finish && addMonths(finish, investor.proofMonths),
      finish,
    ),
  );
  return [
    c(
      'NZ-P9-1',
      '投资金额及合规资产',
      'Investment amount and asset classes',
      all(
        a.category === undefined
          ? undefined
          : all(
              atLeast(a.nominatedFunds, min),
              atLeast(a.totalInvested, min),
              growth ? donation : true,
            ),
        assessed(a.qualifyingInvestments),
      ),
      ref('BN3(a),(c), BN7.1; BN7.10'),
      '按所选 Growth 或 Balanced 档核查提名及已投入的资金、获认可标的和 Growth 慈善捐赠上限。该签证无年龄或英语门槛。',
      'Check both nominated and invested funds, approved asset classes and the Growth philanthropy cap. There is no age or English threshold.',
      'PD-228',
    ),
    c(
      'NZ-P9-1-FUNDS',
      '资金来源、转移与商业品格',
      'Source of funds, transfer and business conduct',
      all(assessed(a.cleanFundsAndTransfer), assessed(a.fitAndProper)),
      ref('BN6, BN6.5, BM1–2'),
      '核对权属、无负担或获准的融资、合法所得与换汇转款、企业移民劳动税务合规及本人商业品格。跨境来源与估值未经审验时需复核。',
      'Verify title, encumbrances or authorised financing, lawful acquisition and banking transfer, company compliance and business conduct. Unresolved valuation or foreign-exchange evidence requires review.',
      'PD-228',
    ),
    c(
      'NZ-P9-1-TRANSFER',
      '转款、投资与交证期限',
      'Transfer, investment and proof deadlines',
      all(transferTime, a.currentContactDetailsProvided),
      ref('BN8.5(b), BN8.15(a)–(c), BN8.15.1'),
      `原则批准后 ${investor.transferMonths} 个月内完成转投，获准延期后按批准期限，并须提供最新联系资料；交证最迟在转投截止后 ${investor.proofMonths} 个月。`,
      `Transfer and invest within ${investor.transferMonths} months after approval in principle, subject to a granted extension, and provide current contact details. File evidence within ${investor.proofMonths} months after the deadline.`,
      'PD-228',
    ),
    c(
      'NZ-P9-2',
      '获签后的投资期、在境及检查点',
      'Post-grant retention, presence and checkpoints',
      retention,
      ref('BN8.25, BN9.1.5–10; BN10.15.1'),
      `投资期从全部投资完成日与原则批准日中较晚者起算。核查两次到期后交证、问卷、持仓和地址。${finish && a.category ? '期末 ' + finish + '。' : ''}${requiredDays !== undefined && a.category ? '主申至少在境 ' + requiredDays + ' 天。' : '须核实档位与额外合规投资。'}`,
      `Count retention from the later of completed investment and approval in principle. Check both reports, questionnaires, holdings and contact details.${finish && a.category ? ' Period ends ' + finish + '.' : ''}${requiredDays !== undefined && a.category ? ' Required resident presence: ' + requiredDays + ' days.' : ' Confirm tier and qualifying top-up.'}`,
      'PD-228',
    ),
  ];
}

function businessExperience(segments: BusinessAnswers['experience']) {
  if (!segments) return undefined;
  const years = segments.reduce((sum, s) => {
    const qualifies =
      s.role === 'owner'
        ? s.fullTimeEmployees >= business.employees ||
          s.revenue >= business.ownerRevenue
        : s.fullTimeEmployees >= business.employees &&
          s.revenue >= business.managerRevenue;
    return qualifies
      ? sum + s.years * Math.min(s.weeklyHours / business.fullTimeHours, 1)
      : sum;
  }, 0);
  return years >= business.experienceYears;
}

function businessChecks(ctx: NzContext, a: BusinessAnswers): CountryCheck[] {
  const c = ctx.check;
  const ref = (loc: string) => source('SRC-245', loc);
  const familyEnglish = dependantEnglish(ctx, 'business');
  const duration = a.activeOwnershipMonths;
  const years =
    duration === undefined
      ? undefined
      : Math.floor(duration / business.yearMonths);
  const standard = all(
    atLeast(a.acquisitionExcludingRealEstate, business.standardPrice),
    atLeast(duration, business.standardMonths),
  );
  const fast = all(
    atLeast(a.acquisitionExcludingRealEstate, business.acceleratedPrice),
    atLeast(duration, business.acceleratedMonths),
  );
  const workDate =
    a.workApplicationDate ?? (a.stage === 'work' ? ctx.date : undefined);
  const eligibility = all(
    atMost(
      a.workApplicationAge ?? (a.stage === 'work' ? ctx.age : undefined),
      business.maxAge,
    ),
    workDate
      ? all(
          workDate <= ctx.date,
          englishEvidence(
            a.principalEnglish,
            workDate,
            'principal',
            ctx.testSpecificallyRequested,
          ),
        )
      : undefined,
    atLeast(a.cleanBankruptcyYears, business.bankruptcyYears),
    assessed(a.fitAndProper),
    atLeast(a.reserveFunds, business.reserve),
    businessExperience(a.experience),
    a.capitalAndOperatingPlan,
    assessed(a.targetAndDueDiligence),
  );
  return [
    c(
      'NZ-P9-3-WORK',
      'Business Investor 前置工作签证',
      'Business Investor work visa',
      eligibility,
      ref('BD2.1; BD2.20; BD2.25; BD2.30'),
      '在工签申请日核对年龄及英语、储备金、可认可的企业主或高管经验、近年破产或商业失败、适格品格、尽调与经营计划。行业准入须经 INZ 核实。',
      'At the work application date check age and English, reserves, qualifying owner or senior-management experience, bankruptcy or failure, business conduct, due diligence and operating plan. The nominated business requires INZ assessment.',
      'PD-228',
    ),
    c(
      'NZ-P9-3',
      '经营年限与双轨收购额',
      'Operating term and qualifying purchase',
      all(
        a.holdsBusinessInvestorWorkVisa,
        a.retainedOwnershipAndSameApprovedBusiness,
        any(standard, fast),
      ),
      ref('BI2.1(a)(i)–(iii), BI2.5, BI2.10, BI4.1'),
      `申请居民签时须持有 Business Investor 工签，保留获批持股比例并亲自经营同一企业。收购额扣除地产。加速轨仍须总共经营 ${business.standardMonths} 个月并在随后 ${business.proofMonths} 个月内交证。`,
      `Hold the work visa at residence application, retain the approved share and actively operate the same business. Exclude real estate. The fast track still requires ${business.standardMonths} total operating months and proof within the following ${business.proofMonths} months.`,
      'PD-228',
    ),
    c(
      'NZ-P9-3-OPERATIONS',
      '在境、员工与企业合规',
      'Presence, employment and compliance',
      all(
        assessed(a.fitAndProper),
        assessed(a.solventRegisteredAndCompliant),
        years === undefined
          ? undefined
          : annualValues(
              a.annualNzDays,
              years,
              (n) => n >= business.annualDays,
            ),
        atLeast(a.currentFte, business.employees),
        atLeast(a.additionalNzFte, business.newFte),
        atLeast(a.additionalJobMonths, business.jobMonths),
      ),
      ref('BI2.1(a)(iii)–(x); BI4.1(a)'),
      '逐年核对在境、全职当量及新增的持续新西兰公民或居民岗位。另核查清偿能力、牌照与税务、雇佣及移民合规。',
      'Check presence in each completed year, full-time equivalents and the sustained additional citizen or resident job. Verify solvency, registration, tax, employment and immigration compliance.',
      'PD-228',
    ),
    c(
      'NZ-P9-3-ENGLISH',
      '居民申请中的随行人英语',
      'Accompanying family English at residence',
      familyEnglish.met,
      [...ref('BI2.1(c)'), ...source('SRC-241', 'SR2.10.10, SR2.10.30')],
      '随行伴侣及达到年龄门槛的子女须有英语证据或预付 ESOL。' +
        familyEnglish.zh,
      'Each accompanying partner and child of qualifying age needs English evidence or prepaid ESOL. ' +
        familyEnglish.en,
      'PD-228',
    ),
  ];
}

function investmentPath(
  ctx: NzContext,
  a: NonNullable<NzFamilyAnswers['investment']>,
): CountryPathway {
  const stage = a.business?.stage;
  const work = a.route === 'business' && stage === 'work';
  const checks = ctx
    .common('general')
    .filter(
      (c) =>
        (a.route === 'active' &&
          !(
            a.active?.goal === 'investment-conditions' && c.id === 'NZ-R5-125'
          )) ||
        (a.route === 'business' && stage === 'residence') ||
        c.id === 'NZ-C1' ||
        c.id === 'NZ-C2',
    );
  const advisory = ['NZ-P9-4'];
  if (a.route === 'active') {
    checks.push(...activeChecks(ctx, a.active ?? {}));
    checks.push(
      ctx.check(
        'NZ-P9-HOME',
        '投资者购房提示',
        'Investor home purchase',
        undefined,
        source('SRC-250', 'LINZ investor visa holders guidance, pp1–2'),
        '通过投资者购房通道购买或建造住宅须事先取得 LINZ 许可。个人购房资格单独核实。',
        'Buying or building a home through the investor visa holder pathway requires prior LINZ consent. Individual purchase eligibility requires assessment.',
        'PD-233',
      ),
    );
    advisory.push('NZ-P9-HOME');
    if (a.active?.goal !== 'investment-conditions') advisory.push('NZ-P9-2');
  } else if (a.route === 'business' && stage) {
    checks.push(...businessChecks(ctx, a.business ?? {}));
    // Prior BD2 approval establishes the work-stage prerequisites. They are
    // shown for reference and are not reapplied at a later age or salary.
    if (work) {
      checks.push(
        ctx.dependantEligibility('business-work'),
        ctx.check(
          'NZ-P9-3-WORK-EVIDENCE',
          '前置工签递交与证明材料',
          'Work visa lodgement and evidence',
          all(
            ctx.identityDocumentsComplete,
            ctx.requiredFeePaid,
            a.business?.workApplicationEvidenceComplete,
          ),
          [
            ...source('SRC-245', 'BD2.1(a)–(c)'),
            ...source('SRC-239', 'A4.5, A4.25'),
            ...source('SRC-240', 'A5.10'),
            ...source('SRC-251', 'E4.50.1(a)–(c)'),
          ],
          '核查每名申请人的身份证件、工签所需的体检、胸片、警方证明及其他递交材料，并确认已支付应缴费用。',
          'Confirm identity documents for each applicant, the required medical, chest X-ray, police and other work visa evidence, and payment of all fees due.',
          'PD-220',
        ),
      );
      advisory.push('NZ-P9-3', 'NZ-P9-3-OPERATIONS', 'NZ-P9-3-ENGLISH');
    } else advisory.push('NZ-P9-3-WORK');
  } else {
    checks.push(
      ctx.check(
        'NZ-P9-ROUTE',
        '投资或经营通道',
        'Investment or business route',
        undefined,
        [...source('SRC-244', 'BN3'), ...source('SRC-245', 'BI2.1')],
        '请选择 Active Investor Plus 或 Business Investor。办理 Business Investor 时还需注明申请工签还是居留。',
        'Select Active Investor Plus or Business Investor. For Business Investor, specify whether you are applying for a work or resident visa.',
        'PD-220',
      ),
    );
  }
  checks.push(
    ctx.check(
      'NZ-P9-4',
      '费用参考',
      'Fee information',
      undefined,
      source(
        'SRC-249',
        'INZ 1028, fees and levies by application type and band, pp1–3',
      ),
      '按 INZ 费表中 Active Investor Plus、Business Investor 工签或居留的对应栏目核对申请费及征费。个人金额取决于适用费区和豁免。',
      'Check the INZ schedule for Active Investor Plus, Business Investor Work or Business Investor Resident fees and levies. Individual charges depend on the applicable band and exemptions.',
      'PD-225',
    ),
  );
  return ctx.path(
    'NZ-P9',
    '积极投资者及商业投资者',
    'Active Investor Plus and Business Investor',
    checks,
    advisory,
  );
}

function religiousPath(ctx: NzContext, a: ReligiousAnswers): CountryPathway {
  const ref = (loc: string) => source('SRC-246', loc);
  const c = ctx.check;
  const familyEnglish = dependantEnglish(ctx, 'religious');
  const welfare =
    a.welfareSinceWorkVisa === 'none'
      ? true
      : a.welfareSinceWorkVisa === 'claimed-or-granted'
        ? false
        : undefined;
  const checks = [
    c(
      'NZ-P10-1',
      '境内申请、年龄与宗教经验',
      'Onshore application, age and religious experience',
      all(
        a.inNz,
        atMost(ctx.age, religious.maxAge),
        atLeast(a.compliantVisaYears, religious.visaYears),
        atLeast(a.qualifyingTrainingOrWorkYears, religious.experienceYears),
      ),
      ref('RW7.5(a),(d),(f) and Note'),
      `须在新西兰递交，年龄不超过 ${religious.maxAge} 岁，合规持宗教工签满 ${religious.visaYears} 年，宗教培训或工作经验满 ${religious.experienceYears} 年。`,
      `Apply in New Zealand at age ${religious.maxAge} or younger with ${religious.visaYears} compliant visa years and ${religious.experienceYears} years of qualifying religious training or work.`,
      'PD-229',
    ),
    c(
      'NZ-P10-1-SPONSOR',
      '宗教慈善机构、担保与工作',
      'Religious charity, sponsorship and work',
      all(
        assessed(a.eligibleSponsorAndLongTermNeed),
        a.sponsorshipUndertaking,
        a.qualifyingReligiousDutiesAndOffer,
        a.offerYears === 'indefinite'
          ? true
          : atLeast(a.offerYears, religious.offerYears),
      ),
      ref('RW7.5.1, RW7.10, RW7.20'),
      `机构须为合资格注册宗教慈善机构，证明长期需要并承担 ${religious.supportYears} 年义务。宗教工作可有薪、领津贴或无薪。获签后从首个居民在境日起绑定担保机构，变更须批准。聘期须无固定期限或至少 ${religious.offerYears} 年。`,
      `An eligible registered religious charity must establish ongoing need and undertake ${religious.supportYears} years’ sponsorship. Qualifying work may be salaried, stipended or unpaid. The post-grant sponsor condition starts on the first resident day and changes require approval. The offer must be indefinite or for at least ${religious.offerYears} years.`,
      'PD-229',
    ),
    c(
      'NZ-P10-1-WELFARE',
      '全家福利申领记录',
      'Family welfare history',
      welfare,
      ref('RW7.5(h)'),
      '自宗教工签获批起，主申、伴侣或子女申领或获批法定福利即触发限制。仅有税务抵免或性质未清的补贴须核实。',
      'Check whether the worker, partner or children applied for or received welfare since work visa grant. Tax credits or unclassified assistance require confirmation.',
      'PD-229',
    ),
    c(
      'NZ-P10-1-ENGLISH',
      '宗教工作者及家属英语',
      'Worker and family English',
      all(
        englishEvidence(
          a.principalEnglish,
          ctx.date,
          'principal',
          ctx.testSpecificallyRequested,
        ),
        familyEnglish.met,
      ),
      ref('RW5.1, RW5.1.1, RW5.40'),
      '主申请人须达英语标准，其他背景证据须获接纳。' + familyEnglish.zh,
      'The principal must meet the English standard. Background evidence requires acceptance. ' +
        familyEnglish.en,
      'PD-229',
    ),
    fee(
      ctx,
      'NZ-P10-2',
      `历史境内费用建议为 NZ$${historicFees.religiousWorker}`,
      `Historical onshore proposal: NZ$${historicFees.religiousWorker}`,
    ),
    ...ctx.common('general'),
  ];
  return ctx.path(
    'NZ-P10',
    '宗教工作者居民签证',
    'Religious Worker residence',
    checks,
    ['NZ-P10-2'],
  );
}

export function familyPathways(
  ctx: NzContext,
  answers: NzFamilyAnswers,
): CountryPathway[] {
  return [
    partnerPath(ctx, answers.partner ?? {}),
    parentPath(ctx, answers.parent ?? {}),
    investmentPath(ctx, answers.investment ?? {}),
    religiousPath(ctx, answers.religious ?? {}),
  ];
}
