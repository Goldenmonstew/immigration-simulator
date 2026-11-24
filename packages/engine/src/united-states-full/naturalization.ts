import { unitedStates2026_11 } from '@uk-immigration/policy-data';
import { addMonths } from '../dates';
import { afterYears } from '../pilot';
import {
  all,
  any,
  atLeast,
  atMost,
  checksFor,
  checkStatus,
  not,
  reviewed,
  s,
  v,
} from './check';
import type { Answer } from './check';
import type { UsCrime, UsFullRequest, UsPartyMembership } from './types';
import type { IsoDate } from '../types';

const legacy = unitedStates2026_11.values;

export function pettyOffense(crime?: UsCrime): Answer {
  const law = v.crime.value;
  return all(
    atMost(crime?.cimtCount, 1),
    atMost(crime?.cimtMaximumMonths, law.pettyMaxMonths),
    atMost(crime?.cimtSentenceMonths, law.pettySentenceMonths),
  );
}

export function multipleConvictionBar(crime?: UsCrime): Answer {
  return all(
    atLeast(crime?.convictionCount, v.crime.value.multipleConvictions),
    atLeast(
      crime?.combinedSentenceMonths,
      v.crime.value.combinedSentenceMonths,
    ),
  );
}

export function partyCheck(
  party: UsPartyMembership | undefined,
  date: IsoDate,
  naturalizing: boolean,
): Answer {
  if (!party?.membership) return undefined;
  if (party.membership === 'none') return true;
  const law = v.party.value;
  if (
    party.exception === 'involuntary' ||
    (!naturalizing && ['law', 'necessities'].includes(party.exception ?? ''))
  )
    return true;
  if (
    naturalizing &&
    (party.exception === 'law' || party.exception === 'necessities')
  )
    return not(party.functionary);
  if (naturalizing && party.exception === 'unknowing') return true;
  if (party.membership === 'former') {
    if (party.ageEnded !== undefined && party.ageEnded < law.minimumAge)
      return true;
    if (!party.endedOn || (!naturalizing && party.rulingParty === undefined))
      return undefined;
    const years = naturalizing
      ? law.naturalizationYears
      : party.rulingParty
        ? law.formerRulingYears
        : law.formerYears;
    const anniversary = afterYears(party.endedOn, years);
    if (naturalizing ? date > anniversary : date >= anniversary) {
      return naturalizing
        ? true
        : any(party.noSecurityThreat, reviewed(party.waiver));
    }
    if (party.ageEnded === undefined) return undefined;
  }
  return naturalizing ? false : reviewed(party.waiver);
}

function disabilityClaim(request: UsFullRequest) {
  const claim = request.naturalization?.disability;
  if (claim?.requested !== true)
    return claim?.requested === false ? true : undefined;
  const evidence = all(
    atLeast(claim.months, v.disabilityMonths.value),
    not(claim.illegalDrugCause),
    claim.clinicianCertified,
  );
  return all(
    evidence,
    any(reviewed(claim.englishWaived), reviewed(claim.civicsWaived)),
  );
}

function exemption(
  request: UsFullRequest,
  age: number,
  residence: number,
): Answer {
  const oldEnough = request.dateOfBirth && afterYears(request.dateOfBirth, age);
  return all(
    oldEnough ? request.simulationDate >= oldEnough : undefined,
    atLeast(request.naturalization?.lprResidenceYears, residence),
  );
}

function statutoryGmc(request: UsFullRequest): Answer {
  const answer = request.naturalization;
  const crime = answer?.statutoryPeriodCrime;
  const law = v.crime.value;
  const cimt = crime?.cimtCount === 0 ? true : pettyOffense(crime);
  const drug =
    crime?.controlledSubstance === 'none'
      ? true
      : crime?.controlledSubstance === 'single-simple-cannabis'
        ? atMost(crime.cannabisGrams, law.cannabisGrams)
        : crime?.controlledSubstance === 'other'
          ? false
          : undefined;
  const benefit = answer?.benefitsAndSupport;
  const benefitsClear =
    benefit === 'clear'
      ? true
      : benefit === 'fraud' || benefit === 'wilful-nonsupport'
        ? false
        : undefined;
  const duiClear = atMost(crime?.duiCount, law.duiPresumptionCount - 1);
  const record = all(
    crime?.unclassifiedRecord === false ? true : undefined,
    duiClear === true ? true : reviewed(answer?.duiPresumptionRebutted),
  );
  return all(
    cimt,
    drug,
    not(atLeast(crime?.confinementDays, law.imprisonmentDays)),
    not(multipleConvictionBar(crime)),
    not(answer?.falseOralTestimony),
    reviewed(answer?.otherGmcBar),
    benefitsClear,
    record,
  );
}

function selectiveService(request: UsFullRequest, gmcYears: number): Answer {
  const answer = request.naturalization;
  const { startAge, endAge } = v.selective.value;
  const birth = request.dateOfBirth;
  const date = request.simulationDate;
  if (
    answer?.selectiveService === 'registered' ||
    answer?.selectiveService === 'not-required'
  )
    return true;
  if (birth && date < afterYears(birth, startAge)) return true;
  if (birth && date >= afterYears(birth, endAge + gmcYears)) return true;
  if (!birth || answer?.selectiveService !== 'required-unregistered')
    return undefined;
  if (date < afterYears(birth, endAge)) return false;
  return reviewed(answer.selectiveNonWillful);
}

export function naturalizationChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.naturalization;
  const date = request.simulationDate;
  const military = request.pathway === 'US-MILITARY';
  const hostilities = military && request.military?.basis === 'hostilities';
  const spouse = request.pathway === 'US-SPOUSE';
  const gmcYears = military
    ? hostilities
      ? v.military.value.hostilitiesGmcYears
      : v.military.value.peacetimeGmcYears
    : spouse
      ? legacy.spouseYears.value
      : legacy.naturalizationYears.value;
  const age = request.dateOfBirth
    ? date >= afterYears(request.dateOfBirth, legacy.minAge.value)
    : undefined;
  const language = v.englishExemptions.value.map((rule) =>
    exemption(request, rule.age, rule.lprYears),
  );
  const englishWaived =
    a?.disability?.requested === true
      ? all(disabilityClaim(request), reviewed(a.disability.englishWaived))
      : a?.disability?.requested === false
        ? false
        : undefined;
  const civicsWaived =
    a?.disability?.requested === true
      ? all(disabilityClaim(request), reviewed(a.disability.civicsWaived))
      : a?.disability?.requested === false
        ? false
        : undefined;
  const english = any(
    a?.english === 'passed'
      ? true
      : a?.english === 'failed'
        ? false
        : undefined,
    ...language,
    englishWaived,
  );
  const civics = v.civicsTest.value;
  const special = exemption(
    request,
    civics.special.age,
    civics.special.lprYears,
  );
  const version = date >= civics.switchDate ? civics.current : civics.old;
  const test = special ? civics.special : version;
  const score = a?.civicsCorrect;
  const scored =
    special === undefined && score !== undefined
      ? score >= version.correct
        ? true
        : score < civics.special.correct
          ? false
          : undefined
      : atLeast(score, test.correct);
  const civicsResult = any(
    civicsWaived,
    a?.civics === 'passed'
      ? true
      : a?.civics === 'failed'
        ? false
        : a?.civics === 'retest' || a?.civics === 'preparing'
          ? undefined
          : scored,
  );
  const felony = a?.aggravatedFelonyConvictedOn;
  const noFelony =
    !felony || felony === 'unclassified'
      ? undefined
      : felony === 'none' || felony < v.aggravatedFelony.value.from;
  const lpr =
    hostilities && request.military?.qualifyingLocationAtEnlistment === true
      ? true
      : reviewed(a?.lawfulAdmission);
  const noFinalOrder =
    a?.removalProcess === 'final' || a?.removalProcess === 'pending'
      ? military
        ? undefined
        : false
      : a?.removalProcess === 'none'
        ? true
        : undefined;
  const oath =
    a?.oath === 'willing' || a?.oath === 'affirmation'
      ? true
      : a?.oath === 'refuses'
        ? false
        : a?.oath
          ? reviewed(a.oathApproval)
          : undefined;
  const conditionsExempt = request.conditional === 'none' || hostilities;
  const filingLpr = all(
    military && !hostilities ? true : lpr,
    noFinalOrder,
    conditionsExempt || a?.conditionalStatusResolved !== undefined || undefined,
  );
  const spouseAtFiling = all(
    a?.spouse?.validMarriage,
    reviewed(a?.spouse?.livedTogetherRequiredPeriod),
    a?.spouse?.spouseCitizenRequiredPeriod,
  );
  return [
    check(
      'C01-AGE',
      '入籍最低年龄',
      'Minimum age for naturalization',
      hostilities ? true : age,
      [...s.age, ...(military ? s.military : [])],
      'PD-279',
      hostilities
        ? [
            '敌对时期军人入籍免最低年龄。',
            'Hostilities-based military naturalization has no minimum age.',
          ]
        : [
            `递交日须年满 ${legacy.minAge.value} 岁。`,
            `You must be at least ${legacy.minAge.value} on the filing date.`,
          ],
    ),
    check(
      'C02-LAWFUL-LPR',
      '合法取得永居及递解程序',
      'Lawful permanent residence and removal proceedings',
      all(
        lpr,
        noFinalOrder,
        conditionsExempt || a?.conditionalStatusResolved === true
          ? true
          : undefined,
      ),
      s.lpr,
      'PD-274',
      [
        '核对合法取得永居及递解记录。条件身份仍有效且移除条件申请待决时，可以递交 N-400。除适用例外外，USCIS 须在核准 N-400 前处理移除条件。',
        'Check lawful permanent residence and removal proceedings. A pending petition to remove conditions with status maintained permits N-400 filing. Unless an exception applies, USCIS must resolve the conditions before approving N-400.',
      ],
      checkStatus(filingLpr),
    ),
    check(
      'C03-ENGLISH',
      '英语读写与口语',
      'English reading, writing and speaking',
      english,
      s.english,
      'PD-275',
      [
        `需要通过现场评估，或符合年龄／居美年限或医学例外。读、写各最多 ${v.englishTest.value.sentences} 句，分别答对 ${v.englishTest.value.correct} 句。`,
        `Meet the interview standard or an age/residence or medical exception. Reading and writing each require ${v.englishTest.value.correct} correct sentence out of up to ${v.englishTest.value.sentences}.`,
      ],
      'NOT_APPLICABLE',
    ),
    check(
      'C04-CIVICS',
      '美国历史与政府公民考试',
      'U.S. history and government civics test',
      civicsResult,
      s.civics,
      'PD-271',
      a?.civics === 'retest'
        ? [
            `重考通常在首次面谈后 ${civics.retestDays.earliest}–${civics.retestDays.latest} 天安排，具体日期待通知。`,
            `A retest is usually scheduled ${civics.retestDays.earliest}–${civics.retestDays.latest} days after the first interview. Await the notice.`,
          ]
        : [
            `适用题库 ${test.bank} 题，最多问 ${test.asked} 题，答对 ${test.correct} 题。简版资格未确认时仍需核实年龄和在美永居年限。`,
            `The indicated bank has ${test.bank} questions, with up to ${test.asked} asked and ${test.correct} correct required. Confirm age and LPR residence for special consideration.`,
          ],
      'NOT_APPLICABLE',
    ),
    {
      ...check(
        'C05-N648',
        '医学残障考试例外',
        'Medical disability exception for testing',
        disabilityClaim(request),
        s.disability,
        'PD-275',
        [
          `申请 N-648 须由合资格医师或临床心理学家证明障碍持续或预计持续至少 ${v.disabilityMonths.value} 个月，并由 USCIS 确定免试范围。`,
          `For N-648, a qualified physician or clinical psychologist must certify a qualifying impairment lasting or expected to last at least ${v.disabilityMonths.value} months. USCIS decides which tests are excused.`,
        ],
      ),
      informational: true as const,
    },
    check(
      'C06-GMC',
      '良好品格全貌审查',
      'Good moral character in the totality of circumstances',
      reviewed(a?.goodMoralCharacter),
      s.gmc,
      'PD-263',
      [
        `审查递交前 ${gmcYears} 年至宣誓的品格，兼顾期外行为及正面证据。`,
        `The review covers the ${gmcYears} years before filing through the oath and considers earlier conduct and positive evidence.`,
      ],
    ),
    check(
      'C07-PERMANENT-GMC-BARS',
      '永久性品格禁令',
      'Permanent good-moral-character bars',
      all(not(a?.murderConviction), noFelony, not(a?.persecutionBar)),
      s.gmcPermanent,
      'PD-269',
      [
        '核对谋杀、法定日期起定罪的加重重罪、迫害及其他永久禁令。罪名未经移民法律分类时待复核。',
        'Check murder, aggravated felony convictions from the statutory date and persecution-related permanent bars. Unclassified offenses require review.',
      ],
    ),
    check(
      'C08-STATUTORY-GMC-BARS',
      '期间品格禁令、福利与扶养',
      'Statutory-period GMC bars, benefits and support',
      statutoryGmc(request),
      s.gmcConditional,
      ['PD-262', 'PD-263', 'PD-269'],
      [
        `核对监禁、CIMT、毒品、虚假口头证言、扶养与福利欺诈。多次酒驾须个案判断。${date >= v.gmcBenefitsFrom.value ? '有意减工保留福利按新版备忘录评估。' : ''}`,
        `Check confinement, CIMTs, controlled substances, false oral testimony, support and benefit fraud. Repeated DUI requires individual review.${date >= v.gmcBenefitsFrom.value ? ' The new memorandum addresses reducing work to keep benefits.' : ''}`,
      ],
    ),
    check(
      'C09-ATTACHMENT',
      '宪法依附与极权党籍',
      'Constitutional attachment and totalitarian-party membership',
      all(a?.constitutionalAttachment, partyCheck(a?.party, date, true)),
      s.attachment,
      'PD-275',
    ),
    check(
      'C10-SELECTIVE-SERVICE',
      'Selective Service 兵役登记',
      'Selective Service registration',
      selectiveService(request, gmcYears),
      s.selective,
      'PD-275',
      [
        '曾须登记者应核对是否已登记、是否仍可补登、以及明知或故意不登记是否落在本路径的品格期间。',
        'If registration was required, check enrollment, whether late registration is still possible, and whether a knowing or willful failure falls within this route’s GMC period.',
      ],
    ),
    check(
      'C11-MILITARY-BARS',
      '战时逃兵与外国人身份免役禁令',
      'Wartime desertion and alienage-based service exemption bars',
      reviewed(a?.warDesertionOrAlienageExemption),
      s.militaryBars,
      'PD-275',
    ),
    check(
      'C12-OATH',
      '宣誓效忠及放弃贵族头衔',
      'Oath of Allegiance and renunciation of titles',
      all(oath, a?.titlesRenounced),
      s.oath,
      'PD-275',
      [
        '可用郑重声明。持械或非战斗军役誓词的修正、医学免誓须审定；文职国家工作誓词不可单独删去。',
        'An affirmation is allowed. Modifications for arms or noncombatant service and a disability waiver require approval. The civilian national service clause cannot be removed on its own.',
      ],
      'NOT_APPLICABLE',
    ),
    ...(spouse
      ? [
          check(
            'C13-MARITAL-UNION',
            '有效婚姻、配偶公民身份和共同生活',
            'Valid marriage, spouse’s citizenship and marital union',
            all(spouseAtFiling, a?.spouse?.marriageAndCitizenshipThroughOath),
            s.spouse,
            'PD-274',
            [
              '同住期算到递交日。婚姻和配偶公民身份须持续至宣誓。',
              'The marital-union period runs to filing. The marriage and the spouse’s U.S. citizenship must continue through the oath.',
            ],
            checkStatus(spouseAtFiling),
          ),
        ]
      : []),
    check(
      'C14-TRUTHFULNESS',
      '申请披露与归化撤销风险',
      'Application disclosure and denaturalization',
      a?.truthfulApplication,
      s.district,
      'PD-274',
    ),
    ...(!military || (!hostilities && lateMilitaryFiling(request) !== false)
      ? [
          check(
            'C14-RESIDENCE-THROUGH-OATH',
            '持续居住至宣誓',
            'Continuous residence through the oath',
            a?.residenceThroughOath,
            s.gmc,
            'PD-274',
            undefined,
            'NOT_APPLICABLE',
          ),
        ]
      : []),
  ];
}

export function lateMilitaryFiling(request: UsFullRequest): Answer {
  const separated = request.military?.separatedOn;
  return separated === 'serving'
    ? false
    : separated
      ? request.simulationDate >
        addMonths(separated, v.military.value.lateFilingMonths)
      : undefined;
}

export function militaryChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const a = request.military;
  const law = v.military.value;
  const date = request.simulationDate;
  const overlap = a?.service?.some(
    ({ from, to }) =>
      from <= date &&
      law.hostilities.some(
        ([began, ended]) =>
          !!began &&
          began <= date &&
          (!ended || from <= ended) &&
          (!to || to >= began),
      ),
  );
  const service =
    a?.basis === 'hostilities'
      ? overlap
      : a?.basis === 'peacetime'
        ? atLeast(a.honorableServiceYears, law.serviceYears)
        : undefined;
  const location =
    a?.basis === 'hostilities'
      ? any(
          reviewed(request.naturalization?.lawfulAdmission),
          a.qualifyingLocationAtEnlistment,
        )
      : a?.basis === 'peacetime'
        ? a.lprAtInterview
        : undefined;
  const certification =
    a?.evidence && a.separatedOn
      ? a.separatedOn === 'serving'
        ? a.evidence === 'n426'
        : a.evidence === 'dd214-or-ngb22'
      : undefined;
  return [
    check(
      'C43-SERVICE',
      '适用服役期、军种与荣誉服役',
      'Qualifying period, component and honorable military service',
      all(service, a?.eligibleServiceComponent, a?.honorableService),
      s.military,
      'PD-279',
    ),
    check(
      'C43-LPR-OR-ENLISTMENT',
      '面谈时永居或合资格入伍地点',
      'LPR status at examination or qualifying enlistment location',
      location,
      s.military,
      'PD-279',
      undefined,
      a?.basis === 'peacetime' ? 'NOT_APPLICABLE' : undefined,
    ),
    check(
      'C43-CERTIFICATION',
      '军方服役认证与背景核查',
      'Military certification and background checks',
      all(certification, reviewed(a?.backgroundCheck)),
      s.military,
      'PD-279',
      undefined,
      checkStatus(certification),
    ),
    check(
      'C43-FILING-BASIS',
      '在役或退役后递交的居住规则',
      'Residence rules when filing in service or after separation',
      a?.basis === 'hostilities'
        ? true
        : a?.basis === 'peacetime' && lateMilitaryFiling(request) !== undefined
          ? true
          : undefined,
      s.military,
      'PD-279',
      [
        '敌对时期免连续居住和实际居住。和平时期退役逾期递交须核对通常的居住条件与合资格服役期间抵算。',
        'Hostilities cases are exempt from continuous residence and physical presence. A late peacetime filing requires the ordinary residence assessment and credit for qualifying service.',
      ],
    ),
    ...(a?.basis === 'peacetime' && lateMilitaryFiling(request) === true
      ? [
          check(
            'C43-LATE-RESIDENCE',
            '退役逾期递交的服役期间抵算',
            'Residence credit for a late filing after separation',
            a.lateResidenceMet,
            s.military,
            'PD-279',
          ),
        ]
      : []),
  ];
}
