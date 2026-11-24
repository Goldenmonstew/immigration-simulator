import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addYears, fullYears } from '../dates';
import {
  accompanyingChildrenEligible,
  all,
  any,
  completePrApplication,
  filingDatesForRoute,
  receivedBy,
  ref,
  type Context,
  type DependentChildAnswers,
  type Item,
} from './shared';
import { biometrics, medicalExam, policeDocuments } from './federal-documents';
import type { CaFullPathwayId } from './index';
import type {
  DocumentAnswers,
  MedicalExam,
  PrProcedure,
} from './federal-documents';

type Finding = 'clear' | 'inadmissible' | 'under-review';
type Scope = 'required' | 'officially-exempt' | 'under-review';
type SafetyGround = 'security' | 'humanRights' | 'sanctions' | 'organisedCrime';
const criminal = ca.values.federalCriminality.value;
const fees = ca.values.federalFees.value;

export interface FederalPerson extends DocumentAnswers {
  dateOfBirth?: string;
  /** Record the disposition for each ground, after any effective relief/declaration. */
  safety?: Partial<Record<SafetyGround, Finding>>;
  criminalFinding?: Finding;
  /** Only use legally established classifications, including Canadian equivalency. */
  classifiedOffence?: {
    jurisdiction: 'Canada' | 'abroad';
    maximumCanadianYears?: number;
    imposedMonths?: number;
    ordinaryGroundEstablished?: boolean;
    outstandingWithoutRelief?: boolean;
    rehabilitationClockStart?: string;
  };
  publicHealth?: Finding;
  publicSafety?: Finding;
  excessiveDemand?: Finding;
  /** IRCC has confirmed membership of an exempt family class under s38(2)/IRPR s24. */
  familyExcessiveDemandExemption?: boolean;
  exam?: MedicalExam;
}

export interface FederalMember extends FederalPerson, DependentChildAnswers {
  relationship: 'spouse' | 'common-law' | 'child' | 'grandchild';
  relationshipBrokenDown?: boolean;
  custodyOrAuthorityUnderSection23?: boolean;
  otherAdmissibility?: Finding;
  accompanying?: boolean;
  /** For non-accompanying family under IRPR s23, including custody or separation. */
  statutoryFamilyScope?: Scope;
  /** A separate decision about IME and document examination. */
  examinationScope?: Scope;
}

export type InitialPrRoute = Exclude<
  CaFullPathwayId,
  'CA-RESIDENCY' | 'CA-CITIZENSHIP' | 'CA-CIT-MINOR-52'
>;

export interface FederalApplication {
  /** Receipt date of the federal application; absent during preparation. */
  filedOn?: string;
  signed?: boolean;
  allFamilyDeclared?: boolean;
  changesReported?: boolean;
  validIdentityAndTravelDocuments?: boolean;
  applicationEvidenceComplete?: boolean;
  processingFeesPaid?: boolean;
  paymentOn?: string;
  newFeeScheduleConfirmed?: boolean;
  biometricPayers?: number;
  singleEligibleFamilyApplyingTogether?: boolean;
  rightFeeExemptForPrincipal?: boolean;
  /** An individual IRCC assessment for this payment date and full family, including biometrics. */
  assessedTotalByIrcc?: number;
  amountPaidIncludingBiometrics?: number;
}

export interface FederalAnswers {
  principal?: FederalPerson;
  /** All applicable family, including non-accompanying members; [] means none. */
  members?: FederalMember[];
  adequateSupportArrangements?: boolean;
  misrepresentation?: Finding;
  /** Outside Canada: final determination. In Canada: day removal was enforced. */
  misrepresentationClockStart?: string;
  protectionAndCompliance?: Finding;
  /** Each receipt, signature and fee belongs to a particular federal application. */
  applications?: Partial<Record<InitialPrRoute, FederalApplication>>;
}

function cleared(finding?: Finding) {
  return finding === undefined || finding === 'under-review'
    ? undefined
    : finding === 'clear';
}

function misrepresentationCleared(
  a: FederalAnswers,
  filed: string | undefined,
  asOf: string,
) {
  const start = a.misrepresentationClockStart;
  if (a.misrepresentation !== 'inadmissible' || !start)
    return cleared(a.misrepresentation);
  if (asOf < start) return undefined;
  const end = addYears(start, criminal.misrepresentationYears);
  return asOf >= end && (!filed || filed < start || filed >= end);
}

function criminality(person: FederalPerson) {
  if (person.criminalFinding) return cleared(person.criminalFinding);
  const offence = person.classifiedOffence;
  if (!offence || !offence.outstandingWithoutRelief) return undefined;
  const serious = any(
    offence.maximumCanadianYears === undefined
      ? undefined
      : offence.maximumCanadianYears >= criminal.seriousMaximumYears,
    offence.jurisdiction === 'Canada'
      ? offence.imposedMonths === undefined
        ? undefined
        : offence.imposedMonths > criminal.seriousSentenceMonthsExclusive
      : false,
  );
  const barred = any(serious, offence.ordinaryGroundEstablished);
  return barred === undefined ? undefined : !barred;
}

function requiredForMember(member: FederalMember, documents: boolean) {
  const scope = documents
    ? member.examinationScope
    : member.statutoryFamilyScope;
  if (scope === 'officially-exempt')
    return documents ? false : member.accompanying;
  if (scope === 'required' || member.accompanying) return true;
  if (documents || scope === 'under-review' || member.accompanying !== false)
    return undefined;
  if (member.relationship === 'common-law') return true;
  if (member.relationship === 'spouse')
    return member.relationshipBrokenDown === undefined
      ? undefined
      : !member.relationshipBrokenDown;
  return member.custodyOrAuthorityUnderSection23;
}

function peopleMeet(
  a: FederalAnswers,
  documents: boolean,
  assess: (p: FederalPerson) => boolean | undefined,
) {
  return all(
    assess(a.principal ?? {}),
    a.members &&
      all(
        ...a.members.map((member) => {
          const needed = requiredForMember(member, documents);
          if (needed === false) return true;
          const result = assess(member);
          return needed === true || result === true ? result : undefined;
        }),
      ),
  );
}

function federalFee(
  ctx: Context,
  a: FederalAnswers & FederalApplication,
  family: boolean,
  filing: string,
): Item {
  const { req, L, check } = ctx;
  const date = a.paymentOn ?? filing;
  const published =
    date >= fees.from &&
    date < fees.nextAdjustment &&
    (date !== fees.from || a.newFeeScheduleConfirmed === true);
  const relationship = req.family?.relationship;
  const sponsoredChild = family && relationship === 'child';
  const birth = req.dateOfBirth ?? a.principal?.dateOfBirth;
  const age = birth && fullYears(birth, filing);
  const familyClassKnown =
    !family ||
    (relationship &&
      (!sponsoredChild ||
        (typeof age === 'number' && age < ca.values.familyChildAge.value)));
  const right = sponsoredChild || a.rightFeeExemptForPrincipal ? 0 : fees.right;
  let total: number | undefined;
  if (
    published &&
    familyClassKnown &&
    a.members &&
    a.members.every((m) => m.accompanying !== undefined)
  ) {
    const basic = family
      ? fees.sponsorship +
        (sponsoredChild ? fees.familyPrincipalChild : fees.familyPartner)
      : fees.economicAdult;
    const applicants = a.members.filter((m) => m.accompanying);
    const processing = applicants.reduce(
      (sum, m) =>
        sum +
        (m.relationship === 'spouse' || m.relationship === 'common-law'
          ? (family ? fees.familyAccompanyingPartner : fees.economicAdult) +
            fees.right
          : family
            ? fees.familyAccompanyingChild
            : fees.economicChild),
      basic + right,
    );
    if (a.biometricPayers !== undefined) {
      const fingerprints = a.biometricPayers * fees.biometric;
      if (
        fingerprints <= fees.biometricFamilyCap ||
        a.singleEligibleFamilyApplyingTogether !== undefined
      ) {
        total =
          processing +
          (a.singleEligibleFamilyApplyingTogether
            ? Math.min(fingerprints, fees.biometricFamilyCap)
            : fingerprints);
      }
    }
  }
  total = a.assessedTotalByIrcc ?? total;
  const quote =
    total === undefined
      ? L(
          '请核对付款日适用的费表、家庭组成、生物识别人数及个别豁免。',
          'Check the schedule on the payment date, family composition, biometric payers and any individual exemption.',
        )
      : L(
          `联邦费用合计 CAD ${total}（含适用的永久居留权费及生物识别费）。`,
          `Federal fees total CAD ${total}, including applicable right of permanent residence and biometric fees.`,
        );
  const explanation =
    quote +
    L(
      '省费与第三方体检、语言、学历认证和警证费用另计。',
      ' Provincial and third-party medical, language, credential and police costs are separate.',
    );
  return check(
    family ? 'CA-R28' : 'CA-R27',
    L('联邦费用与付款', 'Federal fees and payment'),
    total === undefined || a.amountPaidIncludingBiometrics === undefined
      ? undefined
      : a.amountPaidIncludingBiometrics >= total,
    explanation,
    ca.values.federalFees.sources,
    published || total !== undefined ? [] : ['PD-258'],
    true,
  );
}

export function federalChecks(ctx: Context, id: InitialPrRoute): Item[] {
  const { req, L, check } = ctx;
  const a = { ...req.federal, ...req.federal?.applications?.[id] };
  const family = id === 'CA-FAMILY';
  const ee =
    id.startsWith('CA-EE-') ||
    (id === 'CA-PNP' && req.pnp?.mode === 'enhanced');
  const procedure: PrProcedure = ee
    ? 'express'
    : family
      ? 'family'
      : id === 'CA-AIP'
        ? 'atlantic'
        : id === 'CA-PNP' && !req.pnp?.mode
          ? 'unknown'
          : 'checklist';
  const { federal: filed, childAgeLockIn } = filingDatesForRoute(req, id);
  const date = filed ?? req.simulationDate;
  const principalDob = (p: FederalPerson) =>
    p.dateOfBirth ?? (p === a.principal ? req.dateOfBirth : undefined);
  const checks: Item[] = [];
  checks.push(
    check(
      'CA-R20',
      L(
        '身份、家庭申报与申请材料',
        'Identity, family declarations and application documents',
      ),
      all(completePrApplication(a), a.changesReported),
      L(
        '核对签名、身份及旅行证件、适用费用、家属、变更和材料。须提供通信地址与地址史；没有购房、住房面积或地址登记门槛。递交后须另行维持临时身份，获批后完成 PR 确认。',
        'Check signature, identity and travel documents, processing fees, family, updates and supporting evidence. Provide a mailing address and address history. There is no home ownership, floor area or address registration test. Maintain temporary status separately and complete PR confirmation after approval.',
      ),
      [
        ref(
          'SRC-261',
          'IRPA ss.11–12, 15–16, 20–21; IRPR ss.1(3), 2, 10–12, 50–51, 70–72',
        ),
      ],
    ),
  );
  checks.push(
    check(
      'CA-R21',
      L(
        '安全、人权、制裁和有组织犯罪',
        'Security, human rights, sanctions and organised crime',
      ),
      peopleMeet(a, false, (p) =>
        all(
          cleared(p.safety?.security),
          cleared(p.safety?.humanRights),
          cleared(p.safety?.sanctions),
          cleared(p.safety?.organisedCrime),
        ),
      ),
      L(
        '逐人核对四类事由及适用于该事由的正式豁免。审查进行中时，请依据书面决定更新。',
        'Check all four grounds for each relevant person and any relief granted for that ground. Update an open review from its written decision.',
      ),
      [
        ref('SRC-261', 'IRPA ss.33–35.1, 37, 42.1'),
        ref(
          'SRC-266',
          'Reasons for inadmissibility: security, human rights, sanctions, organised criminality',
        ),
      ],
      ['PD-243'],
    ),
  );
  const rehabDate = a.principal?.classifiedOffence?.rehabilitationClockStart;
  const rehabilitation = rehabDate
    ? addYears(rehabDate, criminal.rehabilitationYears)
    : undefined;
  checks.push(
    check(
      'CA-R22',
      L('犯罪及严重犯罪的准入审查', 'Criminality and serious criminality'),
      peopleMeet(a, false, criminality),
      L(
        `核对所有适用成员的正式刑事分类、境外等效及豁免。最高刑至少 ${criminal.seriousMaximumYears} 年，或在加拿大定罪实际判超过 ${criminal.seriousSentenceMonthsExclusive} 个月，属于严重犯罪。其他犯罪事由仍单独审查。`,
        `Check each applicable member's established classification, foreign equivalency and relief. A maximum of at least ${criminal.seriousMaximumYears} years or a Canadian sentence exceeding ${criminal.seriousSentenceMonthsExclusive} months qualifies as serious criminality. Ordinary criminality is checked separately.`,
      ) +
        (rehabilitation
          ? L(
              ` 个人 rehabilitation 等候期参考日为 ${rehabilitation}，须另核正式结果。`,
              ` The individual rehabilitation waiting period reaches its anniversary on ${rehabilitation}. Verify the disposition separately.`,
            )
          : ''),
      [ref('SRC-261', 'IRPA s.36; IRPR ss.17–19')],
      ['PD-243'],
    ),
  );
  const health = ca.values.federalMedical.value;
  const healthResult = peopleMeet(a, false, (p) =>
    all(
      cleared(p.publicHealth),
      cleared(p.publicSafety),
      any(
        family && p.familyExcessiveDemandExemption,
        cleared(p.excessiveDemand),
      ),
    ),
  );
  checks.push(
    check(
      'CA-R23',
      L(
        '公共健康、安全及 excessive demand',
        'Public health, public safety and excessive demand',
      ),
      healthResult,
      L(
        `逐人核对公共健康、安全及 excessive demand 的裁定。获确认属豁免家庭类别者免第三项。${health.referenceYear} 年成本参考为 CAD ${health.fiveYearCost}／五年（每年 ${health.annualCost}）；等候名单影响也须官方判断。`,
        `Check each person's public health, public safety and excessive-demand decisions. Confirmed exempt family classes are excused from the third ground. The ${health.referenceYear} cost reference is CAD ${health.fiveYearCost} over five years (${health.annualCost} annually). Wait-list effects also require an assessment.`,
      ),
      [
        ref('SRC-261', 'IRPA s.38; IRPR ss.1(1), 20, 24, 31–34'),
        ref(
          'SRC-266',
          'Medical inadmissibility: Excessive demand cost threshold, Exceptions',
        ),
      ],
      ['PD-244'],
    ),
  );
  const missedDeadlines = new Set<string>();
  const invitation = req.express?.invitation;
  const invitedOn = invitation?.program === id ? invitation.date : undefined;
  const examResult = peopleMeet(a, true, (p) => {
    const result = medicalExam(
      p.exam,
      procedure,
      filed,
      req.simulationDate,
      invitedOn,
    );
    if (result.missedDeadline) missedDeadlines.add(result.missedDeadline);
    return result.met;
  });
  checks.push(
    check(
      'CA-R24',
      L('移民体检及复用决定', 'Immigration medical examination and reuse'),
      examResult,
      L(
        `核对各成员的指定医师体检、指示和有效期。EE 常规体检须在获邀后、递交前完成。获邀前的体检能否使用，由 IRCC 确认。其他类别收到指示后一般有 ${health.instructionDays} 天。这些项目没有通用私人医保要求。`,
        `Check panel exams, instructions and validity for each member. For Express Entry, complete the routine exam after receiving the invitation and before filing. IRCC must confirm whether an earlier exam can be used. Other applicants normally have ${health.instructionDays} days after instructions. These routes have no general private insurance requirement.`,
      ) +
        (missedDeadlines.size
          ? L(
              ` 未满足原体检期限（${[...missedDeadlines].join('、')}）。按 IRCC 批准的延长期限或接受补做的决定核对。`,
              ` The original medical exam deadline was missed (${[...missedDeadlines].join(', ')}). Check the deadline IRCC extended or its decision to accept a late exam.`,
            )
          : ''),
      [
        ref('SRC-261', 'IRPA s.16(2)(b); IRPR s.30'),
        ...ca.values.federalMedical.sources,
      ],
      ['PD-244', 'PD-245'],
    ),
  );
  const familyScope =
    a.members &&
    all(
      ...a.members.map((m) => {
        const needed = requiredForMember(m, false);
        return needed === false
          ? true
          : needed === true
            ? cleared(m.otherAdmissibility)
            : undefined;
      }),
    );
  checks.push(
    check(
      'CA-R25',
      L(
        '生计、虚报、不合规与家属范围',
        'Support, misrepresentation, noncompliance and family scope',
      ),
      all(
        a.adequateSupportArrangements,
        misrepresentationCleared(a, filed, req.simulationDate),
        cleared(a.protectionAndCompliance),
        familyScope,
        family || accompanyingChildrenEligible(a.members, childAgeLockIn),
      ),
      L(
        `分别核对非社会救助生计安排、保护身份和合规决定。虚报禁期自境外最终认定或境内遣返令执行日起 ${criminal.misrepresentationYears} 年。核对模拟日是否仍在禁期内，以及 PR 申请是否在禁期内递交。未随行家属按关系、监护及正式决定核对。`,
        `Check support without social assistance, protection and compliance decisions. The ${criminal.misrepresentationYears}-year misrepresentation bar runs from the final overseas finding or enforcement of an inland removal order. Check whether the bar applies on the simulation date and whether the PR application was filed during the bar. Review relationship and custody for non-accompanying family members.`,
      ) +
        (family
          ? ''
          : L(
              ' 随行子女以本项目完整申请的收件日锁龄。低于年龄上限者须持续无配偶或同居伴侣，已达上限者核对持续经济依赖及身心状况。',
              ' For each accompanying child, use the age at complete receipt for the applicable program stage. Children under the age limit must remain unmarried and without a common-law partner. For older children, check continued financial dependency and the disabling condition.',
            )),
      [
        ref(
          'SRC-261',
          'IRPA ss.39–42, especially s.40(2)(a), (3); IRPR ss.1(3), 2 (dependent child), 23, 25.1(1), (3)–(5), 70(1)(e), 72(1), 125',
        ),
      ],
      ['PD-243', 'PD-245'],
    ),
  );
  checks.push(
    check(
      'CA-R26',
      L('警证与 PR 生物识别', 'Police certificates and PR biometrics'),
      peopleMeet(a, true, (p) =>
        all(
          policeDocuments(
            p,
            principalDob(p),
            id,
            procedure,
            receivedBy(filed, req.simulationDate),
            req.simulationDate,
          ),
          biometrics(p, principalDob(p), date),
        ),
      ),
      L(
        `现居国警证以 IRCC 收到该份证书的日期核对：随申请提交用本路径联邦收件日，补交用本路径的补件收件日。证书须在此前 ${ca.values.federalPolice.value.currentCertificateMonths} 个月内签发，且符合签发机关注明的效期。原居国警证可在到期后使用，须覆盖最后一次符合条件的停留。需要 IRCC 索证信时，随申请上传说明，等候发信及补件；香港警方直送的警证以 IRCC 对该份警证的收件回执确认。AIP 可先递交申请。另核本次 PR 生物识别。`,
        `Use the date IRCC received the current-country certificate for this application, whether at initial filing or as a supplement. It must have been issued within the previous ${ca.values.federalPolice.value.currentCertificateMonths} months and must meet the issuer’s validity limit. An expired former-country certificate can qualify if it covers the last qualifying stay. Where IRCC requires a request letter, upload the explanation with the application and await the letter and certificate. For Hong Kong, confirm IRCC received the certificate from the police. AIP permits initial filing without all certificates. Check PR biometrics separately.`,
      ),
      [
        ref('SRC-261', 'IRPA ss.10.01, 16; IRPR Part 1, Division 2.1'),
        ...ca.values.federalPolice.sources,
      ],
      ['PD-245'],
    ),
  );
  checks.push(federalFee(ctx, a, family, date));
  return checks;
}
