import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addDays, addYears, fullYears } from '../dates';
import type { IsoDate } from '../types';
import {
  all,
  any,
  filingDatesForRoute,
  ref,
  type Context,
  type Item,
} from './shared';

const q = ca.values.quebecSelection.value;
const rates = ca.values.quebecSelection2026.value;

interface QuebecFrench {
  evidence?: 'approved-test' | 'accepted-education' | 'unrecognised';
  testDate?: IsoDate;
  listening?: number;
  speaking?: number;
  reading?: number;
  writing?: number;
}

interface ValuesAttestation {
  confirmedDisabilityExemption?: boolean;
  issued?: IsoDate;
  requestDate?: IsoDate;
  /** Completion recorded by the designated Objectif Intégration provider. */
  authorisedSessionCompleted?: IsoDate;
  /** Official result transmitted by the ministry's online assessment platform. */
  online?: {
    completed: IsoDate;
    correctAnswers: number;
    attempt: 'first' | 'second' | 'final';
    previousAttempt?: IsoDate;
    validStudyOrWorkPermit?: boolean;
  };
  /** An official final refusal after any permitted retry or session. */
  refused?: boolean;
}

interface QuebecEducation {
  /** Recognised equivalence for the diploma specified in the selected stream. */
  eligibleDiploma?: boolean;
  level?: 'des' | 'vocational' | 'college' | 'university';
  directlyLeadsToOccupation?: boolean;
  fullTimeYears?: number;
  obtained?: IsoDate;
  fromQuebec?: boolean;
  hours?: number;
  credits?: number;
  /** Current guidance and Gazette give different decisive results on this document. */
  unresolvedEquivalence?: boolean;
}

export interface QuebecAnswers {
  stream?: 'high' | 'intermediate' | 'regulated' | 'talent';
  feer?: number;
  intendsQuebec?: boolean;
  capableOfProposedJob?: boolean;
  noApplicantControlOfEmployer?: boolean;
  eligibleIndustry?: boolean;
  scholarshipReturnConditionsSatisfiedIfAny?: boolean;
  eoi?: IsoDate;
  invited?: IsoDate;
  accepted?: IsoDate;
  filed?: IsoDate;
  invitationCriteriaProven?: boolean;
  sameInvitedOccupationAndStream?: boolean;
  hadRecognitionAtAcceptance?: boolean;
  officialFilingDeadline?: IsoDate;
  accompanyingPartner?: boolean;
  accompanyingMinorChildren?: number;
  accompanyingAdultDependants?: number;
  hasCanadianCitizenDependentChildren?: boolean;
  contractSigned?: boolean;
  availableFunds?: number;
  /** Amount formally established by MIFI for this household and application. */
  officialContractAmount?: number;
  principalValues?: ValuesAttestation;
  /** One record for each accompanying partner and adult dependant. */
  familyValues?: ValuesAttestation[];
  french?: QuebecFrench;
  partnerFrench?: QuebecFrench;
  authorisationRequiredInProposedSetting?: boolean;
  education?: QuebecEducation;
  /** Full-time-equivalent, non-overlapping qualifying work in the five years before filing; exclude internships. */
  mainOccupationMonths?: number;
  compulsoryInternshipMonths?: number;
  /** Stream 2: Québec months in main occupation; outside months in same NOC broad category. */
  localMainMonths?: number;
  localInternshipMonths?: number;
  outsideRelatedMonths?: number;
  outsideInternshipMonths?: number;
  occupationOnRegulatedList?: boolean;
  recognition?:
    | 'valid-licence'
    | 'partial'
    | 'full'
    | 'receipt-only'
    | 'pending'
    | 'refused';
  recognitionDate?: IsoDate;
  exceptionalExpertiseAndTrackRecord?: boolean;
  listedAchievement?: boolean;
  favourableOfficialPartnerOpinion?: boolean;
  principalCsq?: 'valid' | 'pending' | 'expired' | 'revoked';
  principalCsqIssued?: IsoDate;
  principalCsqExpires?: IsoDate;
  accompanyingCsqsValid?: boolean;
  /** Receipt by the federal Québec-selected skilled workers program. CSQ validity is checked at that date. */
  federalReceived?: IsoDate;
  feePaid?: number;
}

function meets(amount?: number, minimum?: number) {
  return amount === undefined || minimum === undefined
    ? undefined
    : amount >= minimum;
}

function inWindow(when: IsoDate, start: IsoDate, end: IsoDate) {
  return when >= start && when <= end;
}

function amountForHousehold(a: QuebecAnswers, date: IsoDate) {
  if (a.officialContractAmount !== undefined) return a.officialContractAmount;
  if (
    !inWindow(date, rates.from, rates.to) ||
    a.hasCanadianCitizenDependentChildren !== false ||
    a.accompanyingPartner === undefined ||
    a.accompanyingMinorChildren === undefined ||
    a.accompanyingAdultDependants === undefined ||
    (!a.accompanyingPartner && a.accompanyingAdultDependants > 0)
  )
    return undefined;
  const scale = a.accompanyingPartner ? rates.couple : rates.single;
  const last = scale.length - 1;
  const extraMinor = a.accompanyingPartner
    ? rates.extraMinorCouple
    : rates.extraMinorSingle;
  return (
    scale[Math.min(a.accompanyingMinorChildren, last)] +
    Math.max(0, a.accompanyingMinorChildren - last) * extraMinor +
    a.accompanyingAdultDependants * rates.extraAdultCouple
  );
}

function attested(
  v: ValuesAttestation | undefined,
  filing: IsoDate,
  asOf: IsoDate,
) {
  if (!v) return undefined;
  if (v.confirmedDisabilityExemption) return true;
  if (v.refused) return false;
  const deadline = v.requestDate && addDays(v.requestDate, q.valuesDays);
  let proof = v.issued ?? v.authorisedSessionCompleted;
  const exam = v.online;
  if (!proof && exam && exam.completed <= asOf) {
    const retryAllowed =
      exam.attempt === 'first' ||
      (exam.previousAttempt !== undefined &&
        exam.completed >= addDays(exam.previousAttempt, q.retryDays));
    const finalAllowed =
      exam.attempt !== 'final' || exam.validStudyOrWorkPermit === false;
    if (retryAllowed && finalAllowed) {
      if (exam.correctAnswers * 100 >= q.valuesPassPercent * q.valuesQuestions)
        proof = exam.completed;
      else if (exam.attempt === 'final') return false;
    }
  }
  if (!proof || proof > asOf)
    return deadline && asOf > deadline ? false : undefined;
  return (
    proof > addYears(filing, -q.valuesYears) && (!deadline || proof <= deadline)
  );
}

function french(
  f: QuebecFrench | undefined,
  date: IsoDate,
  oral: number,
  written?: number,
) {
  if (!f) return undefined;
  const valid =
    f.evidence === undefined
      ? undefined
      : f.evidence === 'accepted-education' ||
        (f.evidence === 'approved-test' &&
          (f.testDate === undefined
            ? undefined
            : inWindow(f.testDate, addYears(date, -q.languageYears), date)));
  return all(
    valid,
    meets(f.speaking, oral),
    meets(f.listening, oral),
    written === undefined ||
      all(meets(f.reading, written), meets(f.writing, written)),
  );
}

function schooling(
  e: QuebecEducation | undefined,
  date: IsoDate,
  high: boolean,
) {
  if (!e) return undefined;
  const level = e.level === undefined ? undefined : !high || e.level !== 'des';
  const duration =
    (!high && e.level === 'des') || meets(e.fullTimeYears, q.educationYears);
  const localHours =
    e.level === undefined
      ? undefined
      : e.level === 'university'
        ? meets(e.credits, q.universityCredits)
        : meets(
            e.hours,
            high || e.level === 'college'
              ? q.vocationalHours
              : q.lowerSecondaryHours,
          );
  const localRule =
    e.fromQuebec === false
      ? true
      : e.fromQuebec === true
        ? localHours
        : localHours === true
          ? true
          : undefined;
  return all(
    e.eligibleDiploma,
    level,
    high ? e.directlyLeadsToOccupation : true,
    duration,
    e.obtained === undefined ? undefined : e.obtained <= date,
    e.unresolvedEquivalence ? undefined : localRule,
  );
}

function occupationMonths(a: QuebecAnswers, need: number) {
  if (a.mainOccupationMonths === undefined) return undefined;
  if (a.mainOccupationMonths >= need) return true;
  if (a.mainOccupationMonths + q.internshipMonths < need) return false;
  return a.compulsoryInternshipMonths === undefined
    ? undefined
    : a.mainOccupationMonths +
        Math.min(q.internshipMonths, a.compulsoryInternshipMonths) >=
        need;
}

// Use local internship months first: only they satisfy the Québec minimum;
// both in- and out-of-province placements share one statutory internship cap.
function intermediateExperience(a: QuebecAnswers) {
  const qualifies = (
    local: number,
    localPlacement: number,
    outside: number,
    outsidePlacement: number,
  ) => {
    const creditLocal = Math.min(q.internshipMonths, localPlacement);
    const localTotal = local + creditLocal;
    const combined =
      localTotal +
      Math.min(
        q.lowerOutsideMax,
        outside + Math.min(q.internshipMonths - creditLocal, outsidePlacement),
      );
    return localTotal >= q.lowerLocalMonths && combined >= q.lowerWorkMonths;
  };
  if (
    qualifies(
      a.localMainMonths ?? 0,
      a.localInternshipMonths ?? 0,
      a.outsideRelatedMonths ?? 0,
      a.outsideInternshipMonths ?? 0,
    )
  )
    return true;
  if (
    !qualifies(
      a.localMainMonths ?? Infinity,
      a.localInternshipMonths ?? Infinity,
      a.outsideRelatedMonths ?? Infinity,
      a.outsideInternshipMonths ?? Infinity,
    )
  )
    return false;
  return undefined;
}

function invitation(
  a: QuebecAnswers,
  sim: IsoDate,
  provincial: IsoDate | undefined,
) {
  if (!a.invited || a.invited > sim) return undefined;
  const replyDue = addDays(a.invited, q.responseDays);
  if (!a.accepted || a.accepted > sim)
    return sim > replyDue ? false : undefined;
  const normalEnd = addDays(a.accepted, q.filingDays);
  const submitted = provincial && provincial <= sim ? provincial : undefined;
  const timely = (end: IsoDate) =>
    submitted
      ? inWindow(submitted, a.accepted!, end)
      : sim > end
        ? false
        : undefined;
  let filing: boolean | undefined;
  if (a.officialFilingDeadline) filing = timely(a.officialFilingDeadline);
  else if (a.stream === 'regulated' && a.hadRecognitionAtAcceptance !== true) {
    const fromInvite = timely(addYears(a.invited, q.recognitionWindowYears));
    const fromAcceptance = timely(
      addYears(a.accepted, q.recognitionWindowYears),
    );
    const longWindow = fromInvite === fromAcceptance ? fromInvite : undefined;
    filing =
      a.hadRecognitionAtAcceptance === false || longWindow === timely(normalEnd)
        ? longWindow
        : undefined;
  } else if (a.stream) filing = timely(normalEnd);
  return all(
    a.eoi === undefined ? undefined : a.eoi <= a.invited,
    inWindow(a.accepted, a.invited, replyDue),
    filing,
    a.sameInvitedOccupationAndStream,
    a.invitationCriteriaProven,
  );
}

const guide = (section: string) => ref('SRC-273', section);
const gazette = (articles: string) =>
  ref(
    'SRC-278',
    `PSTQ Gazette, ${articles}, printed pp.4959–4961 (PDF pp.3–5); MIFI exigences`,
  );

export function quebecChecks({ req, L, check }: Context): Item[] {
  const a = req.quebec ?? {};
  const sim = req.simulationDate;
  const filing = filingDatesForRoute(req, 'CA-QC-PSTQ');
  const date = filing.provincial ?? sim;
  const age = req.dateOfBirth ? fullYears(req.dateOfBirth, date) : undefined;
  const amount = amountForHousehold(a, date);
  const familyCount =
    a.accompanyingPartner === undefined ||
    a.accompanyingAdultDependants === undefined
      ? undefined
      : Number(a.accompanyingPartner) + a.accompanyingAdultDependants;
  const familyAttested =
    familyCount === 0
      ? true
      : familyCount === undefined ||
          a.familyValues === undefined ||
          a.familyValues.length !== familyCount
        ? undefined
        : all(...a.familyValues.map((v) => attested(v, date, sim)));
  const high =
    a.stream === 'high' ||
    (a.stream === 'regulated' &&
      a.feer !== undefined &&
      a.feer <= q.highFeerMax);
  const frenchKnown =
    !!a.stream && (a.stream !== 'regulated' || a.feer !== undefined);
  const frenchMet = !frenchKnown
    ? undefined
    : a.stream === 'talent' ||
      all(
        french(
          a.french,
          date,
          high ? q.highOral : q.lowerOral,
          high ? q.highWritten : undefined,
        ),
        any(
          a.accompanyingPartner === undefined
            ? undefined
            : !a.accompanyingPartner,
          french(a.partnerFrench, date, q.partnerOral),
        ),
      );
  const checks = [
    check(
      'CA-R60',
      L('魁省技术甄选基本条件', 'Québec skilled selection requirements'),
      all(
        meets(age, q.minimumAge),
        a.intendsQuebec,
        a.capableOfProposedJob,
        a.noApplicantControlOfEmployer,
        a.eligibleIndustry,
        a.scholarshipReturnConditionsSatisfiedIfAny,
      ),
      L(
        `申请日须年满 ${q.minimumAge} 岁，打算在魁省从事能胜任的工作。核对企业控制、排除行业、奖学金返国义务；无普遍购房、私人医保或已验证 offer 门槛。`,
        `At filing you must be at least ${q.minimumAge}, intend to live in Québec and be capable of the proposed job. Verify employer control, excluded sectors and any scholarship return condition. There is no general home ownership, private insurance or validated offer requirement.`,
      ),
      [
        guide('PSTQ Requirements: General requirements'),
        gazette('arts.31, 32.1'),
      ],
      ['PD-250', 'PD-257'],
    ),
    check(
      'CA-R61',
      L('Arrima 邀请与递交期限', 'Arrima invitation and deadlines'),
      invitation(a, sim, filing.provincial),
      L(
        `核对 EOI、邀请时主职业、类别和获邀依据。应在 ${q.responseDays} 天内接受，通常于接受后 ${q.filingDays} 天内递交。受规管职业等待认可时，若两种官方起算口径会改变结果，须核邀请信。`,
        `Verify the EOI, invited occupation, stream and selection criteria. Accept within ${q.responseDays} days and normally file within ${q.filingDays} days after acceptance. For pending regulated credentials, check the letter if the two official starting dates change the result.`,
      ),
      [
        guide(
          'PSTQ Requirements, Invitation and Applying: Actions to be taken',
        ),
        ref(
          'SRC-278',
          'Gazette, immigration procedure amendment; MIFI exigences: profession principale',
        ),
      ],
      ['PD-253'],
    ),
    check(
      'CA-R62',
      L(
        '魁省财政自足合同与资金',
        'Québec financial self-sufficiency contract and funds',
      ),
      all(a.contractSigned, meets(a.availableFunds, amount)),
      amount === undefined
        ? L(
            '需确认当年费表适用的家庭组成。单成人带成年依赖子女、公民子女或未公布年度须有 MIFI 书面金额。',
            'Confirm the household and year. A single adult with an adult dependant, Canadian citizen dependants or an unpublished year needs an amount confirmed by MIFI.',
          )
        : L(
            `本人和随行家庭的三个月所需金额为 CAD ${amount}。须签署合同并有相应可用资金。`,
            `The three-month requirement for this household is CAD ${amount}. Check the signed contract and available funds.`,
          ),
      [
        guide('PSTQ Requirements: General requirements; quebec-funds.pdf p.1'),
        gazette('art.32.1 para.3'),
      ],
      ['PD-254'],
    ),
    check(
      'CA-R63',
      L('魁省价值观证明', 'Québec values attestations'),
      all(attested(a.principalValues, date, sim), familyAttested),
      L(
        `逐人确认有效证明或已认可的障碍豁免。收到请求通常须在 ${q.valuesDays} 天内完成，证明有效 ${q.valuesYears} 年。线上 ${q.valuesQuestions} 题、${q.valuesHours} 小时、至少 ${q.valuesPassPercent}%，重试须间隔 ${q.retryDays} 天；也可按身份和尝试次数参加 Objectif Intégration。`,
        `Verify each required person's attestation or documented disability exemption. The normal request deadline is ${q.valuesDays} days and the attestation lasts ${q.valuesYears} years. Online: ${q.valuesQuestions} questions, ${q.valuesHours} hours, ${q.valuesPassPercent}% to pass, ${q.retryDays} days between attempts. Permit status and attempts determine the Objectif Intégration option.`,
      ),
      [
        guide(
          'PSTQ General requirements; Values: Who needs an attestation; Online assessment: Success or failure',
        ),
      ],
      ['PD-253'],
    ),
    check(
      'CA-R64',
      L('魁省法语证明', 'Québec French evidence'),
      frenchMet,
      a.stream === 'talent'
        ? L(
            '卓越人才无统一法语等级。邀请轮次的个别要求按邀请核对。',
            'Exceptional talent has no common French minimum. Check any language condition in the invitation.',
          )
        : L(
            `核对魁省 Échelle 四项及认可证明。高技能听说各 ${q.highOral}、读写各 ${q.highWritten}；中级听说各 ${q.lowerOral}，受规管职业按 FEER 档。随行伴侣听说各 ${q.partnerOral}，考试成绩递交时不超过 ${q.languageYears} 年。`,
            `Verify recognised Québec-scale scores. Highly skilled: ${q.highOral} in each oral and ${q.highWritten} in each written skill; intermediate: ${q.lowerOral} in each oral skill. Regulated occupations follow their FEER band. Accompanying partners need ${q.partnerOral} in each oral skill. Test results may be at most ${q.languageYears} years old at filing.`,
          ),
      [
        guide(
          'PSTQ Requirements: Streams 1–4; Demonstrate your knowledge of French',
        ),
        gazette('arts.32.3, 32.6, 32.11'),
      ],
      ['PD-253'],
    ),
  ];
  const unregulated =
    a.authorisationRequiredInProposedSetting === undefined
      ? undefined
      : !a.authorisationRequiredInProposedSetting;
  if (a.stream === 'high')
    checks.push(
      check(
        'CA-R65',
        L(
          'PSTQ 高资质与专门技能',
          'PSTQ highly qualified and specialized skills',
        ),
        all(
          a.feer === undefined ? undefined : a.feer <= q.highFeerMax,
          unregulated,
          occupationMonths(a, q.highWorkMonths),
          schooling(a.education, date, true),
        ),
        L(
          `在近五年主职业有偿全职等值至少 ${q.highWorkMonths} 个月，必修实习最多 ${q.internshipMonths} 个月。核对 FEER、拟工作场景和直接通向职业的学历；魁省中学或学院项目至少 ${q.vocationalHours} 学时，大学至少 ${q.universityCredits} 学分。`,
          `Check the FEER band, whether a licence is needed, and at least ${q.highWorkMonths} paid full-time equivalent months in the main occupation within the past five years. Compulsory internships count up to ${q.internshipMonths} months. Check an occupational diploma, including ${q.vocationalHours} hours or ${q.universityCredits} university credits for Québec programs.`,
        ),
        [
          guide('PSTQ Requirements: Stream 1, Work experience and Schooling'),
          gazette('arts.32.3–32.5'),
        ],
        ['PD-253', 'PD-257'],
      ),
    );
  if (a.stream === 'intermediate')
    checks.push(
      check(
        'CA-R66',
        L('PSTQ 中级与手工技能', 'PSTQ intermediate and manual skills'),
        all(
          a.feer === undefined
            ? undefined
            : a.feer > q.highFeerMax && a.feer <= q.feerMax,
          unregulated,
          intermediateExperience(a),
          schooling(a.education, date, false),
        ),
        L(
          `近五年全职等值至少 ${q.lowerWorkMonths} 个月，其中魁省主职业至少 ${q.lowerLocalMonths} 个月；魁外同职业大类最多 ${q.lowerOutsideMax} 个月。核对执业场景和 DES 或合资格职业学历。`,
          `Check at least ${q.lowerWorkMonths} full-time equivalent months in the past five years, including ${q.lowerLocalMonths} in the main occupation in Québec; count at most ${q.lowerOutsideMax} months outside Québec in the same broad NOC category. Verify the work setting and DES or qualifying vocational education.`,
        ),
        [
          guide('PSTQ Requirements: Stream 2, Work experience and Schooling'),
          gazette('arts.32.6–32.10'),
        ],
        ['PD-253', 'PD-257'],
      ),
    );
  if (a.stream === 'regulated') {
    const recognised =
      a.recognition === 'valid-licence'
        ? true
        : a.recognition === 'refused'
          ? false
          : a.recognition === 'partial' || a.recognition === 'full'
            ? a.recognitionDate === undefined
              ? undefined
              : inWindow(
                  a.recognitionDate,
                  addYears(date, -q.equivalenceYears),
                  date,
                )
            : undefined;
    checks.push(
      check(
        'CA-R67',
        L('PSTQ 受规管职业认可', 'PSTQ regulated-occupation recognition'),
        all(
          a.occupationOnRegulatedList,
          a.authorisationRequiredInProposedSetting,
          recognised,
        ),
        L(
          `核对 MIFI 名单和职位是否须执业许可。接受有效执照或递交前 ${q.equivalenceYears} 年内主管机构发出的部分或完全等值认可。只有收件回执时须等正式结果。`,
          `Verify the MIFI list and actual regulated setting. Supply a valid licence or partial/full equivalence issued by the regulator within ${q.equivalenceYears} years before filing. A receipt alone leaves the result pending.`,
        ),
        [
          guide(
            'PSTQ Stream 3; quebec-regulated.pdf, regulated-occupation list',
          ),
          gazette('arts.32.11–32.12'),
        ],
        ['PD-253'],
      ),
    );
  }
  if (a.stream === 'talent')
    checks.push(
      check(
        'CA-R68',
        L('PSTQ 卓越人才', 'PSTQ exceptional talent'),
        all(
          occupationMonths(a, q.talentWorkMonths),
          a.exceptionalExpertiseAndTrackRecord,
          any(a.listedAchievement, a.favourableOfficialPartnerOpinion),
        ),
        L(
          `近五年在主职业实践至少 ${q.talentWorkMonths} 个月，并有对魁省的贡献及可证成就。须有 MIFI 名单内成就或有权合作机构的书面正面意见。`,
          `Verify ${q.talentWorkMonths} months practising the main occupation in the past five years, exceptional expertise and a proven track record. Supply a listed achievement or favourable written opinion from a designated partner.`,
        ),
        [
          guide(
            'PSTQ Stream 4; quebec-achievements.pdf, list of exceptional achievements',
          ),
          gazette('arts.32.13–32.14'),
        ],
        ['PD-253'],
      ),
    );
  const hasFamily =
    familyCount !== undefined && a.accompanyingMinorChildren !== undefined
      ? familyCount + a.accompanyingMinorChildren > 0
      : undefined;
  const federalDate = filing.federal ?? sim;
  const granted =
    a.principalCsq === undefined ||
    a.principalCsq === 'pending' ||
    (a.principalCsqIssued !== undefined && a.principalCsqIssued > sim)
      ? undefined
      : a.principalCsq === 'valid' &&
        (!a.principalCsqExpires || federalDate <= a.principalCsqExpires) &&
        (!a.principalCsqIssued || federalDate >= a.principalCsqIssued);
  checks.push(
    check(
      'CA-R69',
      L(
        'CSQ 与魁省技术移民联邦递交',
        'CSQ and federal Québec skilled-worker filing',
      ),
      all(
        a.intendsQuebec,
        granted,
        any(
          hasFamily === undefined ? undefined : !hasFamily,
          a.accompanyingCsqsValid,
        ),
        filing.federal && filing.federal <= sim ? true : undefined,
      ),
      L(
        '须有本人及适用随员的有效 CSQ、定居魁省的意图及联邦收件。CSQ 本身不授予 PR 或工作权限。',
        'Confirm valid CSQs for the principal and relevant accompanying members, intent to live in Québec and federal receipt. A CSQ confers neither permanent residence nor work authorisation.',
      ),
      [
        ref('SRC-261', 'IRPR ss70(3)–(4), 86'),
        guide(
          'Québec-selected skilled workers: Who can apply; Examination: Decision',
        ),
      ],
      ['PD-250', 'PD-253'],
    ),
  );
  const fee =
    inWindow(date, rates.from, rates.to) &&
    familyCount !== undefined &&
    a.accompanyingMinorChildren !== undefined
      ? rates.principalFee +
        (familyCount + a.accompanyingMinorChildren) * rates.memberFee
      : undefined;
  checks.push(
    check(
      'CA-R70',
      L('魁省 PSTQ 甄选费', 'Québec PSTQ selection fee'),
      meets(a.feePaid, fee),
      fee === undefined
        ? L(
            '须核实递交年度公布费率及随员人数。',
            'Confirm the published rate for the filing year and accompanying family size.',
          )
        : L(
            `本次魁省甄选费 CAD ${fee}，须核对付款回执。联邦费用另算。`,
            `Québec selection fees total CAD ${fee}. Verify the receipt; federal fees are separate.`,
          ),
      [guide('Applying: Paying the fees for examining an application')],
      ['PD-253'],
      true,
    ),
  );
  return checks;
}
