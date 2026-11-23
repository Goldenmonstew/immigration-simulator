import { australiaSkilledParameters } from '@uk-immigration/policy-data';
import { checker } from './australia-check';
import type { AuFullPathId, AuFullRequest } from './australia-full';
import type { CountryCheck } from './country-result';
import { addDays, addMonths, addYears, fullYears } from './dates';
import type { IsoDate } from './types';

const language = australiaSkilledParameters.english.value;
const ens = australiaSkilledParameters.employer.value;
const scale = australiaSkilledParameters.points.value;
const niv = australiaSkilledParameters.innovation.value;

type Finding = boolean | undefined;
type TestName = keyof typeof language.current;
type EnglishLevel = keyof typeof scale.english;
type SkilledPath = 'AU-189-PT' | 'AU-190';
type EmployerPath = 'AU-186-TRT' | 'AU-186-DE';
type EmployerNomination = {
  status?: 'pending' | 'approved' | 'withdrawn' | 'refused';
  lodged?: IsoDate;
  approved?: IsoDate;
  positionAvailable?: boolean;
  fullTimeRenewable?: boolean;
  offeredYears?: number;
  annualSalary?: number;
  acceptedMarketRate?: number;
  licensing?: 'unregulated' | 'licensed-or-eligible' | 'ineligible';
};
type Assessment = {
  // A positive assessment covers this nominated occupation and its competent authority.
  // For points visas, any Australian student qualification must be from a registered course.
  kind: 'positive' | 'negative' | '485' | 'awaiting';
  issued?: IsoDate;
  expires?: IsoDate;
};
type Invitation =
  { issued: IsoDate; deadline?: IsoDate; score?: number } | 'awaiting';

export interface AuSkilledAnswers {
  english?: {
    // Issuing country of a valid passport held as its citizen; "other" includes no passport.
    passport?: string;
    education?:
      | 'none'
      | {
          allPrimaryInEnglish?: boolean;
          secondaryYearsInEnglish?: number;
          australianTertiaryYearsInEnglish?: number;
          completedAwardYearsInEnglish?: number;
        };
    functionalDeterminedAtInterview?: boolean;
    test?:
      | 'none'
      | 'not-yet'
      | {
          name: TestName;
          date?: IsoDate;
          // "approved" confirms the test centre, format and registration for Australian visas.
          format?: 'approved' | 'unapproved' | 'single-skill-retake';
          components?: [number, number, number, number];
          overall?: number;
          legacyOetLowestGrade?: 'A' | 'B' | 'C' | 'D' | 'E';
        };
    // If assessing evidence after lodgement, use the actual visa application date.
    functionalApplicationDate?: IsoDate;
  };
  secondInstalmentPaid?: boolean;
  employer?: {
    // A class means all statutory elements of the class in LIN 19/216 s 5 hold.
    exemption?:
      | 'none'
      | 'academic'
      | 'science'
      | 'regional-doctor'
      | 'legacy-457'
      | 'transitional-457'
      | 'high-income-457-482'
      | '444-461';
    // Complete list of nominations, keyed by the stream named in each application.
    // Omit the map if unknown. An omitted key in a supplied map means no nomination for that stream.
    nominations?: Partial<Record<EmployerPath, EmployerNomination>>;
    sponsorshipConduct?: 'clear' | 'being-assessed' | 'disregarded' | 'adverse';
    trtPrimaryVisa?: boolean;
    trtOccupationMatches?: boolean;
    trtSkillsDemonstration?: 'not-requested' | 'demonstrated' | 'outstanding';
    csolOccupation?: boolean;
    assessment?: Assessment;
    fullTimeExperienceYears?: number;
  };
  skills?: {
    invitations?: Partial<Record<SkilledPath, Invitation>>;
    occupationList?: 'MLTSSL' | 'STSOL' | 'other';
    // Checked against the occupation in this subclass's invitation.
    occupationInInvitation?: Partial<Record<SkilledPath, boolean>>;
    assessment?: Assessment;
    nomination?: 'active' | 'withdrawn' | 'awaiting';
    points?: {
      // Months of skilled employment in the nominated/closely related occupation
      // during the statutory lookback immediately before invitation.
      overseasMonths?: number;
      australianMonths?: number;
      // Months of a completed prescribed professional year in the lookback period.
      professionalMonths?: number;
      education?: keyof typeof scale.education;
      specialistStudyYears?: number;
      // Registered English-taught course(s) leading to eligible awards in Australia,
      // while on a visa permitting study.
      australianStudy?: {
        qualifying: boolean;
        academicYears?: number;
        calendarMonths?: number;
      };
      regionalCampusAndResidenceNoDistanceStudy?: boolean;
      communityLanguageCredential?: boolean;
      // "skilled" includes co-application, age, nominated occupation, suitable
      // assessment and competent English as specified in item 6D111.
      partner?: keyof typeof scale.partner;
    };
  };
  innovation?: {
    invitation?: Invitation;
    achievement?: 'accepted' | 'submitted' | 'none' | 'refused';
    achievementsMatchInvitation?: boolean;
    form1000?: 'confirmed' | 'awaiting-verification' | 'missing';
    exceptionalBenefit?: 'accepted' | 'awaiting' | 'refused';
    securityAssistance?: 'accepted' | 'awaiting' | 'refused';
  };
}

function all(...facts: Finding[]): Finding {
  return facts.includes(false)
    ? false
    : facts.includes(undefined)
      ? undefined
      : true;
}
function any(...facts: Finding[]): Finding {
  return facts.includes(true)
    ? true
    : facts.includes(undefined)
      ? undefined
      : false;
}
function atLeast(actual: number | undefined, threshold: number): Finding {
  return actual === undefined ? undefined : actual >= threshold;
}
function ageAt(r: AuFullRequest, date: IsoDate | undefined) {
  return date && r.dateOfBirth ? fullYears(r.dateOfBirth, date) : undefined;
}
function passportEnglish(r: AuFullRequest): Finding {
  const passport = r.english?.passport;
  return passport === undefined
    ? undefined
    : language.passports.includes(passport);
}

type EnglishTest = NonNullable<AuSkilledAnswers['english']>['test'];
const toeflGuidance = { srcId: 'SRC-226', locator: 'Table 2, TOEFL iBT' };
function suspendedToefl(test: EnglishTest): boolean {
  return (
    typeof test === 'object' &&
    test.name === 'toefl' &&
    test.date !== undefined &&
    test.date >= language.legacyToefl.suspendedFrom &&
    test.date <= language.legacyToefl.suspendedThrough
  );
}

function testedLevel(
  r: AuFullRequest,
  date: IsoDate | undefined,
): EnglishLevel | undefined {
  const test = r.english?.test;
  if (test === 'none') return 'below';
  if (!date || !test || test === 'not-yet' || !test.date) return undefined;
  if (
    test.date < addYears(date, -language.skilledYears) ||
    test.date >= date ||
    test.format === 'unapproved' ||
    suspendedToefl(test)
  )
    return 'below';
  if (test.format !== 'approved') return undefined;
  const legacy = test.date < language.newTestsFrom;
  if (legacy && test.date < addYears(r.simulationDate, -language.skilledYears))
    return 'below';
  if (legacy && test.name === 'oet') {
    const grade = test.legacyOetLowestGrade;
    if (!grade) return undefined;
    if (grade === language.legacy.oet[2]) return 'superior';
    return grade === language.legacy.oet[1] ? 'proficient' : 'below';
  }
  const current = language.current[test.name];
  const oldTables: Partial<Record<TestName, number[][]>> = {
    ielts: language.legacy.ielts,
    cambridge: language.legacy.cambridge,
    toefl: language.legacy.toefl,
    pte: language.legacy.pte,
  };
  const bands = legacy ? oldTables[test.name] : current;
  if (!bands) return 'below';
  const components = test.components;
  if (!components) return undefined;
  const levels = ['competent', 'proficient', 'superior'] as const;
  let level: EnglishLevel = 'below';
  bands.forEach((band, i) => {
    if (band.every((minimum, j) => components[j] >= minimum)) level = levels[i];
  });
  return level;
}

/** Functional English evidence is independent of the skilled three-year rule. */
export function functionalEnglish(r: AuFullRequest): Finding {
  const evidence = r.english;
  const education = evidence?.education;
  const educated =
    education === 'none'
      ? false
      : education &&
        any(
          all(
            education.allPrimaryInEnglish,
            atLeast(
              education.secondaryYearsInEnglish,
              language.primaryPlusSecondaryYears,
            ),
          ),
          atLeast(education.secondaryYearsInEnglish, language.secondaryYears),
          atLeast(
            education.australianTertiaryYearsInEnglish,
            language.australianTertiaryYears,
          ),
          atLeast(
            education.completedAwardYearsInEnglish,
            language.tertiaryAwardYears,
          ),
        );
  const test = evidence?.test;
  const lodged = evidence?.functionalApplicationDate ?? r.simulationDate;
  let passed: Finding;
  if (test === 'none') passed = false;
  else if (test && test !== 'not-yet' && test.date) {
    if (
      test.format === 'unapproved' ||
      suspendedToefl(test) ||
      test.date < addMonths(lodged, -language.functionalMonths) ||
      test.date > r.simulationDate
    )
      passed = false;
    else if (test.format === 'approved') {
      const scores: Partial<Record<TestName, number>> =
        test.date < language.newTestsFrom
          ? language.legacyFunctional
          : language.functional;
      const minimum = scores[test.name];
      let score = test.overall;
      if (test.name === 'ielts' && test.components) {
        const mean =
          test.components.reduce((sum, part) => sum + part, 0) /
          test.components.length;
        const step = language.ieltsBandStep;
        score = Math.round(mean / step) * step;
      }
      passed = minimum === undefined ? false : atLeast(score, minimum);
    }
  }
  return any(
    passportEnglish(r),
    educated,
    passed,
    evidence?.functionalDeterminedAtInterview === true,
  );
}

export function functionalEnglishCheck(
  id: AuFullPathId,
  r: AuFullRequest,
): CountryCheck {
  const age = ageAt(
    r,
    r.english?.functionalApplicationDate ?? r.simulationDate,
  );
  const met = any(
    age === undefined ? undefined : age < niv.adultAge,
    functionalEnglish(r),
    r.secondInstalmentPaid,
  );
  const result = checker(r.locale)(
    id + '-functional-english',
    met,
    'Functional English 或第二期签证费',
    'Functional English or second instalment',
    '按递交时年龄判断。成年申请人可用合资格护照、英语授课学历、获认可的成绩或部长面试结论证明英语，也可在获批前缴纳适用的第二期费用。',
    'Age is measured at lodgement. Adults may provide eligible passport, education, test or ministerial interview evidence, or pay the applicable second instalment before grant.',
    'SRC-205',
    'ss 6–8, Sch 1',
    typeof r.english?.test === 'object' &&
      r.english.test.format === 'single-skill-retake'
      ? 'PD-200'
      : undefined,
  );
  result.sources.push({
    srcId: 'SRC-200',
    locator:
      'vol 1 reg 5.17; Sch 1 item ' +
      (id === 'AU-858'
        ? '1113(2)'
        : id === 'AU-189-HK'
          ? '1137(4)'
          : '1139(2)'),
  });
  if (suspendedToefl(r.english?.test)) result.sources.push(toeflGuidance);
  if (typeof r.english?.test === 'object' && r.english.test.name === 'ielts')
    result.sources.push({
      srcId: 'SRC-229',
      locator: 'Understanding IELTS test scores → Overall band score',
    });
  return result;
}

function competentCheck(
  id: AuFullPathId,
  r: AuFullRequest,
  date: IsoDate | undefined,
) {
  const tested = testedLevel(r, date);
  const test = r.english?.test;
  // The instrument and the published guidance disagree only at the competent level.
  // This cannot affect Schedule 6D English points, which start at proficient.
  const legacyToefl =
    typeof test === 'object' &&
    test.name === 'toefl' &&
    test.date !== undefined &&
    test.date < language.newTestsFrom;
  const speaking = legacyToefl ? test.components?.[3] : undefined;
  const disputed =
    tested === 'competent' &&
    speaking !== undefined &&
    speaking < language.legacyToefl.guidanceCompetentSpeaking;
  const met = any(
    passportEnglish(r),
    tested === undefined || disputed ? undefined : tested !== 'below',
  );
  const suspended = suspendedToefl(test);
  const result = checker(r.locale)(
    id + '-english',
    met,
    'Competent English',
    'Competent English',
    suspended
      ? '这次 TOEFL iBT 考试在内政部停认期间举行。符合资格的有效护照仍可证明英语。'
      : disputed
        ? '这次旧版 TOEFL iBT 的口语达到文书分数，低于内政部表 2。仅凭该成绩能否获认可待确认。符合资格的有效护照仍可证明英语。'
        : '有资格的国籍及有效护照可满足本项。考试须在适用的递交或获邀日前的有效期内，各单项均达当时标准。未知成绩、日期或考试形式待核查。',
    suspended
      ? 'This TOEFL iBT was taken during the Home Affairs suspension. An eligible passport can still establish competent English.'
      : disputed
        ? 'The legacy TOEFL iBT speaking score meets the instrument but falls below Home Affairs Table 2. Acceptance of this test alone needs confirmation. An eligible passport can still establish competent English.'
        : 'Eligible citizenship with a valid passport qualifies. Otherwise all components must meet the standards for the test date, within the period before lodgement or invitation. Missing evidence needs confirmation.',
    'SRC-206',
    'ss 7–10, Schs 2–3',
    disputed ||
      (typeof test === 'object' && test.format === 'single-skill-retake')
      ? 'PD-200'
      : undefined,
  );
  result.sources.push({
    srcId: 'SRC-200',
    locator: 'vol 1 reg 1.15C; vol 2 cls 186.222, 186.232, 189.223, 190.213',
  });
  if (legacyToefl) result.sources.push(toeflGuidance);
  return result;
}

function assessmentAt(
  assessment: Assessment | undefined,
  date: IsoDate | undefined,
  maxYears: number,
): Finding {
  if (!assessment || assessment.kind === 'awaiting') return undefined;
  if (assessment.kind !== 'positive') return false;
  if (!date || !assessment.issued) return undefined;
  if (assessment.expires && date > assessment.expires) return false;
  return (
    assessment.issued <= date && date <= addYears(assessment.issued, maxYears)
  );
}

function employerChecks(id: EmployerPath, r: AuFullRequest) {
  const trt = id === 'AU-186-TRT';
  const e = r.employer ?? {};
  const age = ageAt(r, r.simulationDate);
  const check = checker(r.locale);
  const exemption = e.exemption;
  const exemptDE =
    exemption === undefined
      ? undefined
      : exemption === 'academic' ||
        exemption === 'science' ||
        exemption === '444-461';
  let exempt = exemptDE;
  if (trt) {
    switch (exemption) {
      case undefined:
      case 'high-income-457-482':
        exempt = undefined;
        break;
      case 'academic':
      case 'science':
      case 'regional-doctor':
        exempt = true;
        break;
      case 'transitional-457':
        exempt = age === undefined ? undefined : age < ens.transitionalAge;
        break;
      case 'legacy-457':
        exempt = r.simulationDate <= ens.lastLegacyApplication;
        break;
      default:
        exempt = false;
    }
  }
  const ageMet = any(age === undefined ? undefined : age < ens.maxAge, exempt);
  const offer = e.nominations?.[id];
  const nomination = offer?.status;
  const approved =
    nomination === 'approved'
      ? true
      : (e.nominations && !offer) ||
          nomination === 'refused' ||
          nomination === 'withdrawn'
        ? false
        : undefined;
  // The nomination must have been lodged for the position when the visa application
  // was made. Its approval can follow lodgement; approval starts the outer deadline.
  const nominationFiled = offer?.lodged
    ? offer.lodged <= r.simulationDate
    : offer?.approved && offer.approved <= r.simulationDate
      ? true
      : undefined;
  const timely =
    offer?.approved === undefined
      ? undefined
      : r.simulationDate <= addMonths(offer.approved, ens.nominationMonths);
  const salary = offer?.annualSalary;
  // A proposed nomination uses the simulation date. Existing nominations use their lodgement date.
  const lodged =
    offer?.lodged ??
    (offer && nomination === undefined ? r.simulationDate : undefined);
  const threshold =
    lodged &&
    ens.salaryThresholds.find((b) => b.from <= lodged && lodged <= b.to);
  const marketExempt = atLeast(salary, ens.marketSalaryExemption);
  const marketMet =
    salary === undefined ||
    offer?.acceptedMarketRate === undefined ||
    !threshold
      ? undefined
      : offer.acceptedMarketRate >= threshold.salary &&
        salary >= offer.acceptedMarketRate;
  const checks = [
    check(
      id + '-age',
      ageMet,
      '递交时年龄及法定豁免',
      'Age at application and exemptions',
      trt
        ? '递交时未满年龄上限，或属于适用的学术、科研、偏远医生或过渡工人类别。高薪工人的历年收入和 FWHIT 须核对。'
        : '递交时未满年龄上限，或属于法定大学学术、科研或符合条件的 444/461 工人类别。',
      trt
        ? 'Apply below the age limit or qualify under the academic, science, regional doctor or worker exemptions. High-income workers need their earnings checked against each applicable FWHIT.'
        : 'Apply below the age limit or qualify under the statutory academic, science or eligible 444/461 worker exemption.',
      'SRC-203',
      'ss 5–6, age exemptions',
      trt && exemption === 'high-income-457-482' ? 'PD-206' : undefined,
    ),
    competentCheck(id, r, r.simulationDate),
    check(
      id + '-nomination',
      all(approved, nominationFiled, timely, offer?.positionAvailable),
      '有效雇主提名',
      'Approved employer nomination',
      `递交时须已有${trt ? '最近担保雇主的 TRT' : ' Direct Entry'} 岗位提名。批准可在递交后作出，已获批的提名须在法定期限内用于申请。决定时提名须仍有效且岗位可供职。`,
      `At lodgement the position must already have a ${trt ? 'TRT nomination from the most recent sponsor' : 'Direct Entry nomination'}. Approval may follow lodgement. An approved nomination has a statutory filing deadline and must remain current, with the job available at decision.`,
      'SRC-200',
      trt
        ? 'vol 1 reg 5.19(4)–(5); vol 2 cl 186.223(1)(a)(ii), (2)–(5)'
        : 'vol 1 reg 5.19(4), (9); vol 2 cl 186.233(1)(a)(ii), (2)–(6)',
    ),
    check(
      id + '-position',
      all(
        offer?.fullTimeRenewable,
        atLeast(offer?.offeredYears, ens.positionYears),
      ),
      '提名岗位与雇用期',
      'Position and term of employment',
      `雇主须提供至少 ${ens.positionYears} 年全职岗位，合同须允许续约。`,
      `The employer must offer full-time employment for at least ${ens.positionYears} years without excluding renewal.`,
      'SRC-200',
      trt ? 'vol 1 reg 5.19(5)(l)–(n)' : 'vol 1 reg 5.19(9)(e)–(g)',
    ),
    check(
      id + '-salary',
      threshold ? atLeast(salary, threshold.salary) : undefined,
      '提名基本年薪',
      'Guaranteed annual earnings',
      threshold
        ? `按提名递交日期，保证货币年薪须达到 AUD ${threshold.salary}。`
        : '需提供提名递交日和适用财年的官方 CSIT。',
      threshold
        ? `The CSIT for this nomination date is AUD ${threshold.salary} in guaranteed monetary earnings.`
        : 'Confirm the nomination lodgement date and the published CSIT for that year.',
      'SRC-214',
      'Core Skills Income Threshold → ENS nominations',
    ),
    check(
      id + '-market-salary',
      any(marketExempt, marketMet),
      '同岗市场薪资',
      'Annual market salary rate',
      `年薪达到 AUD ${ens.marketSalaryExemption} 时豁免薪资举证。其余情形须核对获认可的市场薪资、该财年 CSIT 和实际报价。`,
      `Annual earnings of AUD ${ens.marketSalaryExemption} satisfy the high-earner exception. Otherwise check the accepted market rate against the CSIT and the offered earnings against the market rate.`,
      'SRC-210',
      'ss 5, 7–8; SRC-200 vol 1 reg 5.19(5)(o), (9)(h)',
      marketExempt === false && offer?.acceptedMarketRate === undefined
        ? 'PD-208'
        : undefined,
    ),
    check(
      id + '-licence',
      offer?.licensing === undefined
        ? undefined
        : offer.licensing !== 'ineligible',
      '执业注册与牌照',
      'Occupational licence or registration',
      '递交时须持有或有资格取得工作所在地规定的执照、注册或专业会员资格。无需牌照的岗位满足本项。',
      'At lodgement, hold or be eligible for any licence, registration or professional membership required where the work is performed.',
      'SRC-200',
      'vol 2 cl 186.211',
    ),
    check(
      id + '-sponsor-conduct',
      e.sponsorshipConduct === undefined ||
        e.sponsorshipConduct === 'being-assessed'
        ? undefined
        : e.sponsorshipConduct !== 'adverse',
      '与担保利益交换有关的行为',
      'Payments or benefits for sponsorship',
      '检查法定回溯期内是否曾以利益换取担保。存在记录时需有部长关于是否忽略该行为的认定。',
      'Check for prohibited sponsorship benefits during the statutory lookback. Reported conduct requires a decision on whether it can reasonably be disregarded.',
      'SRC-200',
      'vol 2 cl 186.212A',
    ),
  ];
  if (trt) {
    checks.push(
      check(
        id + '-primary-visa',
        e.trtPrimaryVisa,
        '主申请人签证身份',
        'Primary visa holder',
        '核对是否为 457、482 主签证持有人，或为合资格申请获发过桥签证且上一份实质签证是 457 或 482。',
        'Confirm primary 457 or 482 status, or a bridging visa linked to a qualifying application after a substantive 457 or 482.',
        'SRC-064',
        'Eligibility → Have this visa',
      ),
      check(
        id + '-occupation',
        e.trtOccupationMatches,
        '最近担保职业',
        'Most recent sponsored occupation',
        '提名须与最近一次合资格担保签证的职业一致，并与 ANZSCO 职责相符。',
        'The nomination must match the occupation on the most recent qualifying sponsored visa and its ANZSCO tasks.',
        'SRC-200',
        'vol 1 reg 5.19(5)(b), (d)',
      ),
      check(
        id + '-skills-demonstration',
        e.trtSkillsDemonstration === undefined
          ? undefined
          : e.trtSkillsDemonstration !== 'outstanding',
        '按要求证明职业技能',
        'Demonstration of skills if requested',
        '如部长要求证明职业技能，须按指定方式完成。',
        'If the Minister requires a demonstration of skills, complete it in the specified manner.',
        'SRC-200',
        'vol 2 cl 186.225',
      ),
    );
  } else {
    checks.push(
      check(
        id + '-occupation',
        e.csolOccupation,
        'CSOL 职业及适用条件',
        'Eligible CSOL occupation',
        '核对提名工作在澳履行，任务和适用限制符合 CSOL 指定职业。',
        'Confirm that duties in Australia match the CSOL occupation and all its applicable caveats.',
        'SRC-208',
        'ss 6–8, occupations and applicable circumstances',
      ),
      check(
        id + '-assessment',
        any(
          assessmentAt(e.assessment, r.simulationDate, ens.assessmentYears),
          exemptDE,
        ),
        '递交时职业评估',
        'Skills assessment at lodgement',
        '由指定机构对提名职业作出有效正面评估，485 评估不适用。法定技能豁免类别可替代评估。',
        'A valid positive assessment by the appropriate authority is required. A 485 assessment does not qualify. A statutory skills exemption can apply.',
        'SRC-200',
        'vol 2 cl 186.234(2)–(3); SRC-203 s 6(2)',
      ),
      check(
        id + '-experience',
        any(atLeast(e.fullTimeExperienceYears, ens.experienceYears), exemptDE),
        '全职相关工作经验',
        'Relevant full-time experience',
        `递交时须在提名职业的相应技能水平全职工作至少 ${ens.experienceYears} 年，或符合法定技能豁免。`,
        `At lodgement, have at least ${ens.experienceYears} years of full-time experience at the required skill level in the nominated occupation or qualify for a statutory skills exemption.`,
        'SRC-200',
        'vol 2 cl 186.234(2)(b), (3); SRC-203 s 6(2)',
      ),
    );
  }
  return checks;
}

function bandsFor(value: number, bands: number[][]) {
  let points = 0;
  for (const [minimum, score] of bands) if (value >= minimum) points = score;
  return points;
}

function minimumPointsAt(
  r: AuFullRequest,
  age: number | undefined,
  level: EnglishLevel | undefined,
  nomination: Finding,
) {
  const p = r.skills?.points;
  if (
    !p ||
    age === undefined ||
    nomination === undefined ||
    p.overseasMonths === undefined ||
    p.australianMonths === undefined ||
    p.professionalMonths === undefined ||
    !p.education ||
    p.specialistStudyYears === undefined ||
    !p.australianStudy ||
    p.communityLanguageCredential === undefined ||
    !p.partner
  )
    return undefined;
  const study = all(
    p.australianStudy.qualifying,
    atLeast(p.australianStudy.academicYears, scale.studyYears),
    atLeast(p.australianStudy.calendarMonths, scale.studyMonths),
  );
  const regionalStudy = all(study, p.regionalCampusAndResidenceNoDistanceStudy);
  if (study === undefined || regionalStudy === undefined) return undefined;
  const work = Math.min(
    scale.workCap,
    bandsFor(p.overseasMonths, scale.overseasMonths) +
      bandsFor(p.australianMonths, scale.australianMonths),
  );
  return (
    bandsFor(age, scale.ageBands) +
    scale.english[level ?? 'below'] +
    work +
    (p.professionalMonths >= scale.professionalYearMonths
      ? scale.professional
      : 0) +
    scale.education[p.education] +
    (p.specialistStudyYears >= scale.specialistStudyYears
      ? scale.specialist
      : 0) +
    (study ? scale.study : 0) +
    (regionalStudy ? scale.regionalStudy : 0) +
    (p.communityLanguageCredential ? scale.communityLanguage : 0) +
    scale.partner[p.partner] +
    (nomination ? scale.nomination : 0)
  );
}

function meetsScore(
  confirmed: number | undefined,
  possibleExtra: number,
  threshold: number | undefined,
): Finding {
  if (confirmed === undefined || threshold === undefined) return undefined;
  if (confirmed >= threshold) return true;
  return confirmed + possibleExtra < threshold ? false : undefined;
}

function invitationCheck(
  id: AuFullPathId,
  r: AuFullRequest,
  invitation: Invitation | undefined,
) {
  const actual = typeof invitation === 'object' ? invitation : undefined;
  const valid =
    actual && actual.deadline !== undefined
      ? actual.issued <= r.simulationDate && r.simulationDate <= actual.deadline
      : undefined;
  return checker(r.locale)(
    id + '-invitation',
    valid,
    '书面邀请及其期限',
    'Written invitation and deadline',
    actual
      ? '须在本路径书面邀请列明的期限内递交。'
      : '尚无已核对的本路径邀请函，EOI 的竞争结果无法预测。',
    actual
      ? 'Lodge within the period specified on the written invitation for this subclass.'
      : 'A written invitation for this subclass has yet to be confirmed. The outcome of a competitive EOI cannot be predicted.',
    'SRC-200',
    id === 'AU-858'
      ? 'vol 1 Sch 1 item 1113(3A); vol 3 cl 858.211'
      : id === 'AU-190'
        ? 'vol 1 Sch 1 item 1138(4); vol 2 cl 190.211'
        : 'vol 1 Sch 1 item 1137(4B); vol 2 cl 189.221',
    invitation === 'awaiting'
      ? id === 'AU-858'
        ? 'PD-215'
        : 'PD-209'
      : undefined,
  );
}

function pointsChecks(id: SkilledPath, r: AuFullRequest): CountryCheck[] {
  const skills = r.skills ?? {};
  const check = checker(r.locale);
  const state = id === 'AU-190';
  const invitation = skills.invitations?.[id];
  const written = typeof invitation === 'object' ? invitation : undefined;
  // Before an invitation, show how today's attributes would score. An actual
  // written invitation always locks in its own date and declared score.
  const date =
    written?.issued ??
    (invitation === 'awaiting' ? r.simulationDate : undefined);
  const age = ageAt(r, date);
  const level = testedLevel(r, date);
  const nomination = state
    ? skills.nomination === undefined
      ? undefined
      : skills.nomination === 'active' && written !== undefined
    : false;
  const score = minimumPointsAt(r, age, level, nomination);
  const possibleEnglish = level === undefined ? scale.english.superior : 0;
  const possibleNomination =
    state && invitation === 'awaiting' && skills.nomination !== 'withdrawn'
      ? scale.nomination
      : 0;
  const pass = meetsScore(
    score,
    possibleEnglish + possibleNomination,
    scale.pass,
  );
  const pendingNominationPoints =
    pass === undefined &&
    score !== undefined &&
    score + possibleEnglish < scale.pass;
  let reasonZh =
    score === undefined
      ? '需核对获邀日期或 EOI 状态、年龄及各项加分资料。'
      : `按 ${date} 的 Schedule 6D 已确认${possibleEnglish ? '至少' : ''} ${score} 分，及格线为 ${scale.pass} 分。工作经验取前 ${scale.workYearsWindow} 年，职业年取前 ${scale.professionalWindowMonths} 个月。`;
  let reasonEn =
    score === undefined
      ? 'Confirm the invitation date or pending EOI, age and points evidence.'
      : `Schedule 6D awards ${possibleEnglish ? 'at least ' : ''}${score} points on ${date}. The statutory pass mark is ${scale.pass}. Employment covers the previous ${scale.workYearsWindow} years and the professional year the preceding ${scale.professionalWindowMonths} months.`;
  if (score !== undefined && possibleEnglish) {
    reasonZh += ' 尚未核实的英语考试成绩可能带来额外加分。';
    reasonEn += ' A qualifying English test could add points.';
  }
  if (pendingNominationPoints) {
    reasonZh += ` 若取得邀请且提名仍有效，可再计 ${scale.nomination} 分。`;
    reasonEn += ` Invitation with an active nomination would add ${scale.nomination} points.`;
  }
  const listed =
    skills.occupationList === undefined
      ? undefined
      : skills.occupationList === 'MLTSSL' ||
        (state && skills.occupationList === 'STSOL');
  const occupation = written
    ? all(listed, skills.occupationInInvitation?.[id])
    : listed;
  const issued = skills.assessment?.issued;
  let assessment = assessmentAt(skills.assessment, date, scale.assessmentYears);
  if (
    written &&
    skills.assessment?.kind === 'positive' &&
    issued &&
    issued > written.issued
  ) {
    const windowEnd = addDays(written.issued, scale.assessmentInvitationDays);
    assessment = all(
      issued <= windowEnd && (!written.deadline || issued <= written.deadline),
      issued > r.simulationDate
        ? undefined
        : assessmentAt(
            skills.assessment,
            r.simulationDate,
            scale.assessmentYears,
          ),
    );
  }
  const assessmentCheck = check(
    id + '-assessment',
    assessment,
    '受邀职业的技能评估',
    'Skills assessment for the invited occupation',
    `条文以获邀时为基准。按 Thapa 的办理口径，递交时也可提供在 ${scale.assessmentInvitationDays} 天邀请期内取得的有效正面职评。评估须由指定机构针对受邀职业作出，符合有效期、非 485 用途及适用的注册课程要求。`,
    `The regulations refer to the time of invitation. Under Thapa, Home Affairs also accepts a suitable assessment obtained in the ${scale.assessmentInvitationDays}-day invitation period and provided at lodgement. Check the assessing authority, occupation, validity, non-485 purpose and any registered-course requirement.`,
    'SRC-200',
    state ? 'vol 2 cl 190.212(1)–(2)' : 'vol 2 cl 189.222(1)–(2)',
    written &&
      (skills.assessment?.kind === 'awaiting' ||
        (issued && issued > r.simulationDate))
      ? 'PD-210'
      : undefined,
  );
  assessmentCheck.sources.push({
    srcId: 'SRC-225',
    locator: 'Visas → General Skilled Migration (GSM) visas, Thapa',
  });
  const checks = [
    invitationCheck(id, r, invitation),
    check(
      id + '-age',
      age === undefined ? undefined : age < scale.maxAge,
      '获邀时年龄',
      'Age at invitation',
      `收到邀请时须未满 ${scale.maxAge} 岁。仍在等邀请的，按模拟日期检查。`,
      `Be under ${scale.maxAge} at invitation. Pending invitations are assessed as of the simulation date.`,
      'SRC-200',
      state ? 'vol 1 Sch 1 item 1138(4)' : 'vol 1 Sch 1 item 1137(4B)',
    ),
    check(
      id + '-occupation',
      occupation,
      '提名职业清单',
      'Nominated occupation list',
      state
        ? '职业须在 MLTSSL 或 STSOL，且与邀请函一致。'
        : '职业须在 MLTSSL，且与邀请函一致。',
      state
        ? 'The invited occupation must be on the MLTSSL or STSOL.'
        : 'The invited occupation must be on the MLTSSL.',
      'SRC-207',
      state ? 'ss 7–9, MLTSSL and STSOL' : 'ss 7–8, MLTSSL',
    ),
    assessmentCheck,
    competentCheck(id, r, date),
    check(
      id + '-points',
      pass,
      '法定打分及格线',
      'Statutory points pass mark',
      reasonZh,
      reasonEn,
      'SRC-201',
      's 6, pool and pass marks',
      pendingNominationPoints ? 'PD-211' : undefined,
    ),
    check(
      id + '-invited-score',
      meetsScore(score, possibleEnglish, written?.score),
      '邀请函声明分数',
      'Score stated in the invitation',
      written?.score === undefined
        ? '需核对书面邀请中列明的分数。'
        : `${reasonZh} 邀请函要求 ${written.score} 分。`,
      written?.score === undefined
        ? 'Confirm the score specified on the written invitation.'
        : `${reasonEn} The invitation requires ${written.score}.`,
      'SRC-200',
      state ? 'vol 2 cl 190.214(1)' : 'vol 2 cl 189.224(1)',
    ),
  ];
  checks
    .find((c) => c.id === id + '-points')!
    .sources.push({
      srcId: 'SRC-200',
      locator: 'vol 1 reg 2.26AC; vol 3 Sch 6D Parts 1–12',
    });
  if (state)
    checks.push(
      check(
        id + '-nomination',
        skills.nomination === 'active'
          ? true
          : skills.nomination === 'withdrawn'
            ? false
            : undefined,
        '有效的州或领地提名',
        'Active state or territory nomination',
        '已获正式提名且未被撤回才满足。各州遴选标准和剩余配额需核查。',
        'Confirm a formal nomination remains in effect. State selection criteria and quotas vary.',
        'SRC-200',
        'vol 2 cl 190.215; vol 3 Sch 6D item 6D121',
        skills.nomination === 'awaiting' ? 'PD-211' : undefined,
      ),
    );
  return checks;
}

function innovationChecks(id: 'AU-858', r: AuFullRequest) {
  const n = r.innovation ?? {};
  const check = checker(r.locale);
  const age = ageAt(r, r.simulationDate);
  const assistance =
    n.securityAssistance === 'awaiting'
      ? undefined
      : n.securityAssistance === 'accepted';
  const accepted =
    n.achievement === 'accepted'
      ? true
      : n.achievement === 'none' || n.achievement === 'refused'
        ? false
        : undefined;
  const hasForm =
    n.form1000 === 'confirmed'
      ? true
      : n.form1000 === 'missing'
        ? false
        : undefined;
  const benefit =
    n.exceptionalBenefit === 'accepted'
      ? true
      : n.exceptionalBenefit === 'refused'
        ? false
        : undefined;
  const exceptionalAge =
    age === undefined
      ? undefined
      : age < niv.adultAge || age >= niv.exceptionalBenefitAge;
  const specialZh = assistance
    ? '部长已依据安全机构意见确认申请人提供了法定特别协助。'
    : undefined;
  const specialEn = assistance
    ? 'The Minister has accepted specialised security assistance on the statutory advice.'
    : undefined;
  return [
    invitationCheck(id, r, n.invitation),
    check(
      id + '-achievement',
      any(assistance, accepted),
      '国际杰出成就与在澳发展',
      'Outstanding achievement and establishment',
      specialZh ??
        '国际公认成就、现有影响、对澳洲的价值及在澳就业或独立发展能力均由审理官评定。只有已获认定的材料才能确认。',
      specialEn ??
        'International achievement, current prominence, benefit to Australia and ability to establish in the field require a substantive finding. Self-reported awards alone leave the outcome open.',
      'SRC-200',
      'vol 3 cl 858.212(2)(a)–(d), (4)',
      n.achievement === 'submitted' ? 'PD-215' : undefined,
    ),
    check(
      id + '-invited-field',
      any(assistance, n.achievementsMatchInvitation),
      '邀请所列领域与成就',
      'Field and achievements in the invitation',
      specialZh ?? '核对书面邀请所列的领域及成就是否与申报相符。',
      specialEn ??
        'Both the area and the achievements claimed must match the written invitation.',
      'SRC-200',
      'vol 3 cl 858.212(3)–(4)',
    ),
    check(
      id + '-nominator',
      any(assistance, hasForm),
      'Form 1000 提名',
      'Form 1000 nomination',
      specialZh ??
        '由同领域有全国声誉的澳籍、PR、合资格新西兰公民或澳洲机构签署表格。提名人声誉尚在核查时需待确认。',
      specialEn ??
        'The completed form must be signed by an eligible Australian citizen, permanent resident, eligible NZ citizen or Australian organisation of national reputation in the field.',
      'SRC-200',
      'vol 1 Sch 1 item 1113(3)(d)–(e); vol 3 cl 858.212(2)(e), (4)',
    ),
    check(
      id + '-age-benefit',
      any(
        assistance,
        exceptionalAge === undefined ? undefined : !exceptionalAge,
        benefit,
      ),
      '特定年龄的非凡利益要求',
      'Exceptional benefit by age',
      specialZh ??
        `未满 ${niv.adultAge} 岁或已满 ${niv.exceptionalBenefitAge} 岁的申请人须让审理官认可其对澳洲的非凡利益。`,
      specialEn ??
        `Below ${niv.adultAge} or from age ${niv.exceptionalBenefitAge}, the decision-maker must accept exceptional benefit to Australia.`,
      'SRC-200',
      'vol 3 cl 858.212(2)(f), (4)',
    ),
    functionalEnglishCheck(id, r),
  ];
}

export function skilledChecks(
  id: AuFullPathId,
  r: AuFullRequest,
): CountryCheck[] {
  switch (id) {
    case 'AU-186-TRT':
    case 'AU-186-DE':
      return employerChecks(id, r);
    case 'AU-189-PT':
    case 'AU-190':
      return pointsChecks(id, r);
    case 'AU-858':
      return innovationChecks(id, r);
    default:
      return [];
  }
}
