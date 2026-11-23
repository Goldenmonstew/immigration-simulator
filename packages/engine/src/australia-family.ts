import {
  auFamilyParameters as f,
  australia2026_11,
} from '@uk-immigration/policy-data';
import { type AuRequest } from './australia';
import { checker } from './australia-check';
import type { AuFullPathId, AuFullRequest } from './australia-full';
import type { CountryCheck } from './country-result';
import { addMonths, fullYears } from './dates';
import { afterYears, type PilotPathway } from './pilot';
import type { IsoDate } from './types';

type Finding = 'confirmed' | 'refused' | 'pending';
type PartnerStream = 'onshore' | 'offshore';

export interface AuFamilyAnswers {
  partner?: {
    stream?: PartnerStream;
    relationship?: 'married' | 'de-facto' | 'intended-marriage' | 'none';
    marriedByDecision?: boolean;
    relationshipFrom?: IsoDate;
    sharedDependentChildAtLodgement?: boolean;
    partnerAgeAtLodgement?: number;
    registeredAtLodgement?: boolean;
    humanitarianDeFactoException?: boolean;
    compassionateDeFactoClaim?: boolean;
    relationshipEvidenceAtLodgement?: Finding;
    eligiblePartnerStatus?: boolean;
    eligibleAdultGuardianSponsor?: boolean;
    priorSponsoredPeople?: number;
    /** Latest application date giving rise to a grant, whether by or for this sponsor. */
    lastRelevantPartnerApplication?: IsoDate | 'none';
    historyException?: Finding;
    parentVisaException?: Finding;
    sponsorOffenceException?: Finding;
    /** Date of a 143/864 grant with an already existing relationship, or no such grant. */
    parentVisaGrant?: IsoDate | 'none';
    subclass204RestrictedAtLodgement?: boolean;
    childOffenceBarApplies?: boolean;
    relevantSentenceMonths?: number;
    consentToDisclosure?: boolean;
    sponsorPoliceCheckIfRequested?: boolean;
    sponsorshipApprovedInForce?: boolean;
    onshoreStatus?:
      'substantive' | 'schedule-3-satisfied' | 'needs-review' | 'transit';
    noFurtherStay?: 'clear' | 'waiver-pending' | 'barred';
    temporaryStageGranted?: boolean;
    continuingSponsorship?: boolean;
    relationshipAtDecision?:
      'continuing' | 'ended' | 'death' | 'family-violence' | 'child-orders';
    exceptionEvidence?: Finding;
    enteredAfterApplication?: boolean;
    offshoreHumanitarianRelationshipDisclosed?: boolean;
  };
  rrv?: {
    status?:
      'current-pr' | 'former-pr' | 'former-citizen' | 'cancelled-pr' | 'never';
    /** Verified qualifying PR/citizen days; also supports former citizens absent from visa history. */
    qualifyingDays?: number;
    ties?: Finding | 'none';
    /** All presence/departure qualifications for the applicable limb of 155.212(3)/(3A). */
    tiesDepartureRequirements?: boolean;
    continuousAbsenceYears?: number;
    longAbsenceReasons?: Finding;
    familyBasis?: 'qualifying-155' | 'qualifying-157' | 'none';
    compassionateDeparture?: Finding | 'none';
    /** First day of the current period outside Australia. */
    absentSince?: IsoDate;
    compassionateAbsence?: Finding;
    /** Sch 1 item 1128(3)(c)–(e), including a pending s135 notice or an unrevoked s134 cancellation. */
    returnApplicationBar?: boolean;
  };
  citizenship?: {
    medicalBranch?:
      | 'none'
      | 'incapacity-claimed'
      | 'incapacity-confirmed'
      | 'sensory-claimed'
      | 'sensory-confirmed';
    understandsApplication?: boolean;
    /** Continuous qualifying SCV status from first grant, including any periods abroad. */
    scv?: { firstGrant: IsoDate; continuousEligible?: boolean };
    permanentAtApplication?: boolean;
    permanentAtDecision?: boolean;
    otherResidenceBasis?: Finding;
    /** No confinement in the relevant window, or the first day at liberty after the last confinement. */
    confinementEnded?: IsoDate | 'none' | 'ongoing';
    confinementDiscretion?: Finding;
    test?:
      | { correct: number; valuesCorrect: number }
      | 'awaiting'
      | 'retest-pending';
    character?: Finding | 'no-known-record' | 'record';
    policeCertificatesIfRequired?: boolean;
    identity?: Finding;
    securityBar?: boolean;
    currentCriminalBar?: boolean;
    /** Latest relevant serious sentence, including any still within the repeat-offender bar. */
    lastPrisonSentence?:
      | 'none'
      | {
          months: number;
          firstFreeDay: IsoDate;
          seriousRepeatOffender?: boolean;
        };
    mostRecentCessation?: IsoDate | 'never';
    intention?: 'reside' | 'links-confirmed' | 'links-claimed' | 'no-links';
    inAustraliaAtApproval?: boolean;
    approvalAbroadException?: Finding;
    willingToPledge?: boolean;
    /** Confirmation of discretionary evidence for a child (responsible parent or independent teenager). */
    minorEvidence?: Finding;
  };
}

const v = australia2026_11.values;
type Tri = boolean | undefined;
const finding = (decision?: Finding | 'none'): Tri =>
  decision === 'confirmed'
    ? true
    : decision === 'refused' || decision === 'none'
      ? false
      : undefined;
const every = (...conditions: Tri[]): Tri =>
  conditions.includes(false)
    ? false
    : conditions.includes(undefined)
      ? undefined
      : true;
const any = (...conditions: Tri[]): Tri =>
  conditions.includes(true)
    ? true
    : conditions.includes(undefined)
      ? undefined
      : false;

function relationshipIsLong(r: AuFullRequest): Tri {
  const application = r.partnerApplication;
  if (!application) return undefined;
  const start = r.partner?.relationshipFrom;
  if (!start) return application.longTermRelationship;
  if (afterYears(start, f.longRelationshipYears.value) <= application.lodged)
    return true;
  if (
    afterYears(start, f.longRelationshipChildYears.value) > application.lodged
  )
    return false;
  return (
    r.partner?.sharedDependentChildAtLodgement ??
    application.longTermRelationship
  );
}

export function partnerTimeRequest(
  r: AuFullRequest,
  base: Omit<AuRequest, 'partnerApplication'> &
    Pick<AuFullRequest, 'partnerApplication'>,
): AuRequest {
  return {
    ...base,
    partnerApplication: base.partnerApplication && {
      ...base.partnerApplication,
      longTermRelationship: relationshipIsLong(r) === true,
    },
  };
}

export function citizenshipTimeRequest(
  r: AuFullRequest,
  base: AuRequest,
): AuRequest {
  const scv = r.citizenship?.scv;
  if (
    !scv?.continuousEligible ||
    scv.firstGrant > r.simulationDate ||
    r.simulationDate < f.scvFrom.value
  )
    return base;
  // The reform's earliest application date is already a full year after
  // backdating began. Continuity here is confirmed only for citizenship.
  return {
    ...base,
    visas: [
      // Legacy histories encode individual SCV entries as other-temporary.
      // Once continuous SCV coverage is confirmed those entries belong to
      // this same citizenship-only period.
      ...base.visas.filter(
        (visa) =>
          visa.from < scv.firstGrant || visa.subclass !== 'other-temporary',
      ),
      { subclass: 'other-permanent', from: scv.firstGrant },
    ],
  };
}

function partnerChecks(r: AuFullRequest, pilot?: PilotPathway): CountryCheck[] {
  const p = r.partner ?? {};
  const q = checker(r.locale);
  const application = r.partnerApplication;
  const stream = application?.stream ?? p.stream;
  const lodged = application?.lodged ?? r.simulationDate;
  const age = r.dateOfBirth && fullYears(r.dateOfBirth, lodged);
  const partnerAdult =
    p.partnerAgeAtLodgement === undefined
      ? undefined
      : p.partnerAgeAtLodgement >= f.partnerAdultAge.value;
  const relationshipLongEnough =
    p.relationshipFrom === undefined
      ? undefined
      : addMonths(p.relationshipFrom, f.deFactoMonths.value) <= lodged;
  let relationship: Tri;
  switch (p.relationship) {
    case 'married':
      relationship = true;
      break;
    case 'intended-marriage':
      relationship = every(
        stream === undefined ? undefined : stream === 'offshore',
        p.marriedByDecision,
      );
      break;
    case 'de-facto': {
      const duration = any(
        relationshipLongEnough,
        p.registeredAtLodgement,
        p.humanitarianDeFactoException,
        p.compassionateDeFactoClaim === false ? false : undefined,
      );
      relationship = every(
        typeof age === 'number' ? age >= f.partnerAdultAge.value : undefined,
        partnerAdult,
        duration,
      );
      break;
    }
    case 'none':
      relationship = false;
      break;
  }
  const eligibleSponsor = every(
    p.eligiblePartnerStatus,
    any(partnerAdult, p.eligibleAdultGuardianSponsor),
  );
  const withinLimit =
    p.priorSponsoredPeople === undefined
      ? undefined
      : p.priorSponsoredPeople <= f.maximumOtherSponsorships.value;
  const gap = (from: IsoDate | 'none' | undefined) =>
    from === undefined
      ? undefined
      : from === 'none' ||
        afterYears(from, f.sponsorshipIntervalYears.value) <= r.simulationDate;
  // These are separate statutory bars. A claimed exception has to be decided.
  const sponsorBar = (clear: Tri, waiver?: Finding) =>
    clear === false && waiver ? finding(waiver) : clear;
  const exception =
    p.relationshipAtDecision === 'death' ||
    p.relationshipAtDecision === 'family-violence' ||
    p.relationshipAtDecision === 'child-orders';
  const evidence = finding(p.exceptionEvidence);
  const episode = exception
    ? every(
        evidence,
        stream === 'offshore' && p.relationshipAtDecision === 'family-violence'
          ? p.enteredAfterApplication
          : true,
      )
    : p.relationshipAtDecision === undefined
      ? undefined
      : every(
          p.relationshipAtDecision === 'continuing',
          stream === 'onshore' ? p.continuingSponsorship : true,
        );
  const waiting =
    application && application.lodged <= r.simulationDate
      ? any(
          pilot?.checks[0]?.met,
          relationshipIsLong(r),
          stream === 'offshore' &&
            p.offshoreHumanitarianRelationshipDisclosed === true,
          exception ? episode : false,
        )
      : application
        ? false
        : undefined;
  const location =
    stream === undefined || r.locationAtApplication === undefined
      ? undefined
      : stream === r.locationAtApplication;
  const onshoreVisa =
    stream === 'offshore'
      ? true
      : stream === undefined
        ? undefined
        : every(
            p.onshoreStatus === undefined || p.onshoreStatus === 'needs-review'
              ? undefined
              : p.onshoreStatus !== 'transit',
            p.noFurtherStay === 'clear'
              ? true
              : p.noFurtherStay === 'barred'
                ? false
                : undefined,
          );
  return [
    q(
      'AU-PARTNER-relationship',
      relationship,
      '婚姻或事实伴侣身份',
      'Marriage or de facto status',
      '按递交时的年龄、关系时长、关系注册及人道例外判断；同情理由需个案审理。',
      'Use age, duration, registration and humanitarian exceptions at lodgement. A compassionate claim requires individual review.',
      'SRC-200',
      'regs 2.03A(2)–(5); 309.211, 309.224; 820.211',
      p.compassionateDeFactoClaim ? 'PD-213' : undefined,
    ),
    q(
      'AU-PARTNER-evidence',
      finding(p.relationshipEvidenceAtLodgement),
      '关系真实性证据',
      'Evidence of a genuine relationship',
      '财务、家庭生活、社交与共同承诺由内政部审查。',
      'Home Affairs assesses finances, household, social evidence and mutual commitment.',
      'SRC-200',
      'regs 1.09A, 1.15A',
      'PD-213',
    ),
    q(
      'AU-PARTNER-sponsor-status',
      eligibleSponsor,
      '担保人身份及年龄',
      'Sponsor status and age',
      '伴侣须为澳洲公民、永居或合资格新西兰公民；未成年配偶须由合资格成年父母或监护人担保。',
      'The partner must be a citizen, permanent resident or eligible NZ citizen. A minor spouse requires an eligible adult parent or guardian as sponsor.',
      'SRC-200',
      '309.211–213; 820.211(2)',
    ),
    q(
      'AU-PARTNER-sponsorship-history',
      sponsorBar(
        every(withinLimit, gap(p.lastRelevantPartnerApplication)),
        p.historyException,
      ),
      '历次担保与间隔',
      'Previous sponsorships and spacing',
      '核对曾获担保获批的人数及往次相关申请的递交日，包括担保人本人受担保的申请。',
      'Check previous successful sponsorships and the lodgement dates of relevant applications, including the sponsor’s own sponsored application.',
      'SRC-200',
      'reg 1.20J(1)–(2)',
    ),
    q(
      'AU-PARTNER-parent-visa',
      sponsorBar(gap(p.parentVisaGrant), p.parentVisaException),
      '付费父母签担保限制',
      'Contributory parent restriction',
      '关系在担保人的付费父母签获批时已存在的，核对获批日期和法定例外。',
      'Where the relationship existed at the sponsor’s contributory parent grant, check the grant date and any exception.',
      'SRC-200',
      'reg 1.20KA',
    ),
    q(
      'AU-PARTNER-humanitarian-bar',
      p.subclass204RestrictedAtLodgement === undefined
        ? undefined
        : !p.subclass204RestrictedAtLodgement,
      '特定人道签担保禁令',
      'Woman at Risk sponsorship bar',
      '核对递交前法定期间内的 204 签证及与原伴侣的婚史、分居与申报记录。',
      'Check subclass 204, previous separation and disclosure of the relationship in the statutory period before lodgement.',
      'SRC-200',
      '309.212; 820.211(2B)',
    ),
    q(
      'AU-PARTNER-sponsor-offences',
      sponsorBar(
        every(
          p.childOffenceBarApplies === undefined
            ? undefined
            : !p.childOffenceBarApplies,
          p.relevantSentenceMonths === undefined
            ? undefined
            : p.relevantSentenceMonths < f.significantSentenceMonths.value,
        ),
        p.sponsorOffenceException,
      ),
      '担保人犯罪记录',
      'Sponsor offence restrictions',
      '分别核对涉未成年人的可登记犯罪与相关罪行的重大犯罪记录；豁免须有正式决定。',
      'Check registrable offences involving minor applicants and significant records for relevant offences. Exceptions require an official decision.',
      'SRC-200',
      'regs 1.20KB–1.20KD',
    ),
    q(
      'AU-PARTNER-disclosure',
      every(p.consentToDisclosure, p.sponsorPoliceCheckIfRequested),
      '披露同意与警方证明',
      'Disclosure consent and police checks',
      '担保人须同意披露相关定罪，并提供被要求的警方证明。',
      'The sponsor must consent to disclosure of relevant convictions and provide requested police checks.',
      'SRC-200',
      'reg 1.20KC(5)–(6); 309.222; 820.221(4)',
    ),
    q(
      'AU-PARTNER-sponsorship',
      p.sponsorshipApprovedInForce,
      '首阶段担保获准',
      'Approved first-stage sponsorship',
      '通常须有获批且仍有效的首阶段担保。',
      'The first stage normally requires an approved sponsorship still in force.',
      'SRC-200',
      '309.222; 820.221(4)',
    ),
    q(
      'AU-PARTNER-location',
      location,
      '递交地点',
      'Location at lodgement',
      '按递交日实际所在地核对境内 820 或境外 309。',
      'Match physical location at lodgement to the onshore 820 or offshore 309 stream.',
      'SRC-200',
      'Sch 1 items 1214C(3), 1220A(3)',
    ),
    q(
      'AU-PARTNER-onshore-status',
      onshoreVisa,
      '境内签证与 Schedule 3',
      'Onshore status and Schedule 3',
      '境外不受此限制；境内须核对 771、后续停留限制及无实质签证时的 Schedule 3 或豁免决定。',
      'For onshore applications check transit status, no-further-stay conditions and Schedule 3 or its waiver if there is no substantive visa. Offshore applications are exempt.',
      'SRC-200',
      '820.211(1), (2)(d); Sch 3; reg 2.05(4)',
      'PD-214',
    ),
    q(
      'AU-PARTNER-temporary-stage',
      p.temporaryStageGranted,
      '取得临时配偶签',
      'Temporary partner stage',
      '批准永久阶段前通常须持对应的 820 或 309 签证。',
      'The corresponding 820 or 309 must normally be held for the permanent stage.',
      'SRC-200',
      '801.221; 100.221',
    ),
    q(
      'AU-PARTNER-continuity',
      episode,
      '永久阶段的关系或例外',
      'Continuing relationship or exception',
      '关系持续且继续获所需担保，或死亡、家庭暴力、子女监护等法定例外已获认定。',
      'The relationship and required sponsorship must continue, or an applicable death, family violence or child-order exception must be established.',
      'SRC-200',
      '801.221(2)–(6AB); 100.221(2)–(4AA)',
    ),
    q(
      'AU-PARTNER-time',
      waiting,
      '永久阶段等待期',
      'Permanent-stage waiting period',
      exception ||
        relationshipIsLong(r) ||
        (stream === 'offshore' && p.offshoreHumanitarianRelationshipDisclosed)
        ? '按递交时的长期关系、人道或关系终止例外评估免等候资格。'
        : (pilot?.checks[0]?.text ?? '请提供合并申请的递交日期。'),
      exception ||
        relationshipIsLong(r) ||
        (stream === 'offshore' && p.offshoreHumanitarianRelationshipDisclosed)
        ? 'An established long-term relationship at lodgement, humanitarian or relationship-ending exception can remove the wait.'
        : (pilot?.checks[0]?.text ??
            'Provide the date of the combined application.'),
      'SRC-200',
      'reg 1.03; 801.221(2), (6A)–(7); 100.221(2), (5)–(7)',
    ),
  ];
}

function rrvChecks(r: AuFullRequest, pilot?: PilotPathway): CountryCheck[] {
  const a = r.rrv ?? {};
  const q = checker(r.locale);
  const priorVisa = pilot?.checks[0];
  const eligibleStatus =
    a.status === undefined
      ? priorVisa
        ? true
        : undefined
      : a.status !== 'cancelled-pr' && a.status !== 'never';
  const days = a.qualifyingDays;
  const residence =
    priorVisa && (a.status === 'current-pr' || a.status === undefined)
      ? priorVisa.met
      : days === undefined
        ? undefined
        : days >= v.rrvPresenceDays.value;
  const longAbsence =
    a.continuousAbsenceYears === undefined
      ? undefined
      : a.continuousAbsenceYears >= f.returnAbsenceYears.value;
  const ties = every(
    finding(a.ties),
    a.tiesDepartureRequirements,
    longAbsence === false
      ? true
      : longAbsence === true
        ? finding(a.longAbsenceReasons)
        : undefined,
  );
  const family155 =
    a.familyBasis === undefined
      ? undefined
      : a.familyBasis === 'qualifying-155';
  const family157 =
    a.familyBasis === undefined
      ? undefined
      : a.familyBasis === 'qualifying-157';
  const enoughForShort =
    days === undefined
      ? undefined
      : days >= f.shortReturnMinDays.value && days < v.rrvPresenceDays.value;
  const prolonged =
    a.absentSince === undefined
      ? undefined
      : addMonths(a.absentSince, f.shortReturnMonths.value) < r.simulationDate;
  const absence157 =
    r.locationAtApplication === 'onshore' || prolonged === false
      ? true
      : r.locationAtApplication === 'offshore' && prolonged
        ? finding(a.compassionateAbsence)
        : undefined;
  const short = every(
    any(family157, every(enoughForShort, finding(a.compassionateDeparture))),
    absence157,
  );
  const residenceExplanation =
    priorVisa && (a.status === 'current-pr' || a.status === undefined)
      ? priorVisa.text
      : undefined;
  return [
    q(
      'AU-RRV-status',
      eligibleStatus,
      '永居或前公民身份',
      'Current or former status',
      '核对现有永居、已丧失澳籍或最近永居签未被取消的前永居身份。',
      'Confirm current PR, loss of citizenship, or former PR whose last permanent visa was not cancelled.',
      'SRC-200',
      '155.211; 157.211',
    ),
    q(
      'AU-RRV-valid-application',
      a.returnApplicationBar === undefined
        ? undefined
        : !a.returnApplicationBar,
      '过渡签证及撤签程序',
      'Transitional visa and cancellation proceedings',
      '须排除指定过渡永居、未结的法定撤签通知或未获撤销的撤签决定。',
      'Check the specified transitional visa, outstanding statutory cancellation notice and cancellation decision not set aside.',
      'SRC-200',
      'Sch 1 item 1128(3)(c)–(e)',
    ),
    q(
      'AU-RRV-clearance',
      every(
        r.locationAtApplication === undefined
          ? undefined
          : r.locationAtApplication !== 'clearance',
        r.locationAtDecision === undefined
          ? undefined
          : r.locationAtDecision !== 'clearance',
      ),
      '递交与获批所在地',
      'Location at application and grant',
      '申请时及获批时可在境内或境外，但须在移民查验区以外。',
      'Lodgement and grant can occur in or outside Australia, outside immigration clearance.',
      'SRC-200',
      'Sch 1 item 1128(3)(b); 155.411; 157.411',
    ),
    q(
      'AU-RRV-option-residence',
      residence,
      '155 居住天数途径',
      '155 residence alternative',
      residenceExplanation ??
        '核对五年窗口内以永久居民或公民身份在澳的合资格天数。',
      residenceExplanation ??
        'Check qualifying citizen or PR presence in the five-year window.',
      'SRC-200',
      '155.212(2); 155.511',
    ),
    q(
      'AU-RRV-option-ties',
      ties,
      '155 实质联系途径',
      '155 substantial ties alternative',
      '须证明联系对澳大利亚有益，并满足境内外相应的离境、身份或迫切理由要求。',
      'Demonstrate ties of benefit to Australia and meet the applicable departure, status or compelling-reasons limb.',
      'SRC-200',
      '155.212(3), (3A); 155.511(c)',
      'PD-216',
    ),
    q(
      'AU-RRV-option-family',
      family155,
      '155 家庭成员途径',
      '155 family unit alternative',
      '主要家庭成员须已持有效 155，或符合独立资格并已另行递交。',
      'A family-unit member must hold a current 155 or qualify in their own right and have lodged separately.',
      'SRC-200',
      '155.212(4); 155.511(a), (aa)',
    ),
    q(
      'AU-RRV-option-short',
      short,
      '157 短期返澳途径',
      '157 short return alternative',
      '核对至少一天的居住与离境理由，或合资格 157 家庭成员；境外连续超期另须证明未归理由。',
      'Check qualifying presence and reasons for leaving, or a qualifying 157 family member. A prolonged current absence also needs compassionate reasons.',
      'SRC-200',
      '157.212(2)–(3); 157.213; 157.511',
      'PD-216',
    ),
    q(
      'AU-RRV-basis',
      any(residence, ties, family155, short),
      '满足一项返澳依据',
      'Qualifying return basis',
      '达到一项 155 或 157 依据即可。未定的联系或同情理由须由内政部裁定。',
      'Any one 155 or 157 basis is sufficient. Home Affairs decides outstanding ties or compassionate claims.',
      'SRC-200',
      '155.212; 157.212–213',
      'PD-216',
    ),
  ];
}

const timeTitles = [
  ['arrival', '在澳居住年限', 'Residence since arrival', 's 22(1)(a)'],
  [
    'absences',
    '整个居住期的离境天数',
    'Absences over the residence period',
    's 22(1A)',
  ],
  ['lawful', '在澳合法居留', 'Lawful stay in Australia', 's 22(1)(b)'],
  [
    'permanent',
    '最后一年的永居身份',
    'Permanent residence in the final year',
    's 22(1)(c), (1B)',
  ],
  [
    'recent-absences',
    '最后一年的离境天数',
    'Absences in the final year',
    's 22(1B)(b)',
  ],
] as const;

function citizenshipChecks(
  r: AuFullRequest,
  pilot?: PilotPathway,
): CountryCheck[] {
  const c = r.citizenship ?? {};
  const q = checker(r.locale);
  const age =
    r.dateOfBirth === undefined
      ? undefined
      : fullYears(r.dateOfBirth, r.simulationDate);
  const minor = age === undefined ? undefined : age < v.citizenshipMinAge.value;
  const underPledgeAge =
    age === undefined ? undefined : age < f.pledgeAge.value;
  const senior = age === undefined ? undefined : age >= f.seniorTestAge.value;
  const incapacity = c.medicalBranch === 'incapacity-confirmed';
  const sensory = c.medicalBranch === 'sensory-confirmed';
  const medicalClaim =
    c.medicalBranch === 'incapacity-claimed' ||
    c.medicalBranch === 'sensory-claimed';
  const exemptTest = minor === true || senior === true || incapacity || sensory;
  const exception = finding(c.otherResidenceBasis);
  const residenceOverride = minor === true || exception === true;
  const scv = c.scv;
  const scvEligible =
    scv &&
    r.simulationDate >= f.scvFrom.value &&
    r.simulationDate >= scv.firstGrant &&
    scv.continuousEligible;
  const prAtLodgement =
    c.permanentAtApplication ??
    (scvEligible || pilot?.checks[4]?.met
      ? true
      : !scv && r.visas !== undefined && pilot?.status === 'NOT_APPLICABLE'
        ? false
        : undefined);
  const timeChecks = timeTitles.map(([key, zh, en, locator], index) => {
    const old = pilot?.checks[index + 1];
    const met =
      residenceOverride ||
      (old?.met === true
        ? true
        : minor === undefined ||
            c.otherResidenceBasis === 'pending' ||
            (scv && scv.continuousEligible === undefined)
          ? undefined
          : old?.met);
    const replaced =
      residenceOverride ||
      (c.otherResidenceBasis === 'pending' && old?.met !== true);
    const zhText = minor
      ? '未满成年年龄按 s 21(5) 评估，无须满足成年人的一般居住条件。'
      : c.otherResidenceBasis === 'confirmed'
        ? '已确认适用法定替代居住或国防服役要求。'
        : '请提供完整居住记录或法定替代资格决定。';
    const enText = minor
      ? 'Section 21(5) does not impose the adult general residence test.'
      : c.otherResidenceBasis === 'confirmed'
        ? 'A statutory alternative residence or defence service basis has been confirmed.'
        : 'Provide the residence history or the decision on a statutory alternative.';
    const result = q(
      `AU-CIT-time-${key}`,
      met,
      zh,
      en,
      (!replaced && old?.text) || zhText,
      (!replaced && old?.text) || enText,
      'SRC-061',
      locator,
      c.otherResidenceBasis === 'pending' ? 'PD-219' : undefined,
    );
    if (old && !replaced) result.sources = old.sources;
    if (scv)
      result.sources = [
        ...result.sources,
        {
          srcId: 'SRC-216',
          locator: 'Direct pathway to Australian citizenship for SCV holders',
        },
      ];
    return result;
  });
  const confined = c.confinementEnded;
  const confinementClear =
    confined === undefined
      ? undefined
      : confined === 'none' ||
        (confined !== 'ongoing' &&
          afterYears(confined, v.citizenshipResidenceYears.value) <=
            r.simulationDate);
  const confinement =
    residenceOverride || confinementClear === true
      ? true
      : minor === undefined || c.otherResidenceBasis === 'pending'
        ? undefined
        : confinementClear === false && c.confinementDiscretion
          ? finding(c.confinementDiscretion)
          : confinementClear;
  const test = c.test;
  const marks =
    typeof test === 'object'
      ? test.correct >= f.citizenshipTest.value.pass &&
        test.valuesCorrect === f.citizenshipTest.value.values
      : undefined;
  const passed =
    exemptTest || marks === true
      ? true
      : medicalClaim || age === undefined
        ? undefined
        : marks;
  const report = c.lastPrisonSentence;
  let elapsed: Tri;
  if (report === 'none') elapsed = true;
  else if (report) {
    if (report.months < f.significantSentenceMonths.value) elapsed = true;
    else if (
      afterYears(report.firstFreeDay, f.sentenceBarYears.value) >
      r.simulationDate
    )
      elapsed = false;
    else if (
      afterYears(report.firstFreeDay, f.repeatBarYears.value) <=
      r.simulationDate
    )
      elapsed = true;
    else if (report.seriousRepeatOffender !== undefined)
      elapsed = !report.seriousRepeatOffender;
  }
  const criminalBarClear =
    c.currentCriminalBar === undefined ? undefined : !c.currentCriminalBar;
  const cessation =
    c.mostRecentCessation === undefined
      ? undefined
      : c.mostRecentCessation === 'never' ||
        addMonths(c.mostRecentCessation, f.formerCitizenBarMonths.value) <=
          r.simulationDate;
  const residenceIntended =
    c.intention === undefined || c.intention === 'links-claimed'
      ? undefined
      : c.intention !== 'no-links';
  const location =
    c.inAustraliaAtApproval ??
    (r.locationAtDecision === undefined
      ? undefined
      : r.locationAtDecision !== 'offshore');
  const section = minor
    ? 's 21(5)'
    : incapacity || c.medicalBranch === 'incapacity-claimed'
      ? 's 21(3)'
      : sensory || senior || c.medicalBranch === 'sensory-claimed'
        ? 's 21(4)'
        : 's 21(2)';
  return [
    q(
      'AU-CIT-branch',
      age === undefined || (medicalClaim && !senior && !minor)
        ? undefined
        : true,
      '适用的年龄或医疗资格',
      'Age or medical category',
      `按递交日年龄与医学证据评估 ${section}。申请中的医疗豁免须经认定。`,
      `Assess ${section} using age at application and medical evidence. Claimed exemptions need an official determination.`,
      'SRC-061',
      's 21(2)–(5)',
    ),
    q(
      'AU-CIT-pr',
      every(prAtLodgement, c.permanentAtDecision),
      '申请与决定时的永居身份',
      'PR at application and decision',
      '两个时点均须符合入籍法的永居定义；合资格新西兰 SCV 持有人可按特别规则满足。',
      'Permanent residence for citizenship purposes is required on both dates. Qualifying New Zealand SCV holders can meet this under the special rules.',
      'SRC-061',
      'ss 5, 21(2)–(5)',
    ),
    ...timeChecks,
    q(
      'AU-CIT-confinement',
      confinement,
      '居住期间的监禁或法院收容',
      'Confinement during residence',
      '核对一般居住期内的监禁或法院命令的刑事精神收容；部长可依法另行认定。',
      'Check imprisonment or court-ordered psychiatric confinement during general residence, subject to a ministerial determination.',
      'SRC-061',
      's 22(1C), (5A)',
      c.confinementDiscretion === 'pending' ||
        c.otherResidenceBasis === 'pending'
        ? 'PD-219'
        : undefined,
    ),
    q(
      'AU-CIT-test',
      passed,
      '入籍考试、英语与公民知识',
      'Citizenship test, English and civics',
      exemptTest
        ? '按所选法定分支免考。'
        : `官方考试须答对至少 ${f.citizenshipTest.value.pass}/${f.citizenshipTest.value.total} 题，且全部 ${f.citizenshipTest.value.values} 道价值观题正确。尚未应考或等待重考时无法判定。`,
      exemptTest
        ? 'This statutory category is exempt from the test.'
        : `The official test requires at least ${f.citizenshipTest.value.pass}/${f.citizenshipTest.value.total} correct and every one of the ${f.citizenshipTest.value.values} values questions correct. A pending sitting or resit is unresolved.`,
      'SRC-215',
      'Pass the test; Citizenship Act ss 21(2A), 23A',
      test === 'retest-pending' ? 'PD-217' : undefined,
    ),
    q(
      'AU-CIT-understanding',
      minor ||
        incapacity ||
        (!senior && !sensory && !medicalClaim && age !== undefined)
        ? true
        : c.understandsApplication,
      '免考申请人的理解能力',
      'Understanding the application',
      '高龄或听说视障碍免考者仍须理解申请性质；普通申请人由考试检查。',
      'Senior and sensory-impairment applicants must still understand the application. For general applicants the test covers this.',
      'SRC-061',
      's 21(2A), (3), (4)(c), (5)',
    ),
    q(
      'AU-CIT-minor-evidence',
      minor === false ? true : minor ? finding(c.minorEvidence) : undefined,
      '未成年人申请材料',
      'Minor applicant evidence',
      '未成年人须按单独申请或随家长申请的情形提交材料，由内政部审理。',
      'Home Affairs reviews the evidence for an independent child application or a child applying with a responsible parent.',
      'SRC-061',
      'ss 21(5), 24(2)',
    ),
    q(
      'AU-CIT-character',
      minor === true
        ? true
        : finding(
            c.character === 'no-known-record' || c.character === 'record'
              ? 'pending'
              : c.character,
          ),
      '决定时的良好品格',
      'Good character at decision',
      '成年人由部长综合评定；自报无记录仍待核查。未成年人另按警方核查与个案材料审查。',
      'Adults need a good-character finding. Self-reported clean history still requires verification. Minors have separate evidence and police checks.',
      'SRC-061',
      's 21(2)(h), (3)(f), (4)(f), (5)',
      'PD-218',
    ),
    q(
      'AU-CIT-police',
      underPledgeAge === true ? true : c.policeCertificatesIfRequired,
      '警方核查及证明',
      'Required police checks',
      '按年龄、在澳及海外居住经历提供被要求的警方记录及同意。',
      'Provide the police documents and consent required for the applicant’s age and Australian or overseas residence.',
      'SRC-067',
      'Gather your documents → Character documents',
    ),
    q(
      'AU-CIT-identity',
      finding(c.identity),
      '身份核验',
      'Identity determination',
      '身份材料缺失或尚未核实时须待内政部认定。',
      'Missing or unverified identity evidence needs a Home Affairs determination.',
      'SRC-061',
      's 24(3)',
    ),
    q(
      'AU-CIT-security',
      c.securityBar === undefined ? undefined : !c.securityBar,
      '国家安全禁令',
      'National security prohibition',
      '核对是否有现行的不利或保留安全评估及适用的其他安全禁令。',
      'Check for an operative adverse or qualified security assessment or other applicable security prohibition.',
      'SRC-061',
      's 24(4)–(4D)',
    ),
    q(
      'AU-CIT-criminal-bars',
      every(criminalBarClear, elapsed),
      '刑事诉讼、刑罚与释放后禁令',
      'Proceedings, sentences and post-release bars',
      '核对未决案件、监禁、可执行的释放条件、刑事精神收容及严重监禁刑释放后的法定期限。',
      'Check pending proceedings, imprisonment, enforceable release conditions, court confinement and the statutory period after release for a serious sentence.',
      'SRC-061',
      's 3 serious prison sentence, serious repeat offender; s 24(6)',
    ),
    q(
      'AU-CIT-prior-cessation',
      cessation,
      '曾丧失澳籍后的期限',
      'Period after losing citizenship',
      '曾失去澳籍须等法定期间届满才能获批。',
      'Former citizens must complete the statutory period after their last cessation before approval.',
      'SRC-061',
      's 24(7)',
    ),
    q(
      'AU-CIT-intention',
      minor ? true : residenceIntended,
      '在澳定居或持续联系',
      'Residence or continuing association',
      '成年申请人拟居海外时须举证与澳大利亚的紧密持续联系。未成年人另按 s 21(5) 及个案材料评估。',
      'Adults planning to live abroad must substantiate a close and continuing association. Children are assessed under s 21(5) with their individual evidence.',
      'SRC-061',
      's 21(2)(g), (3)(e), (4)(e); s 24(2)',
      'PD-205',
    ),
    q(
      'AU-CIT-at-approval',
      minor || location === true
        ? true
        : location === false
          ? c.approvalAbroadException === undefined
            ? false
            : finding(c.approvalAbroadException)
          : undefined,
      '批准当日在澳',
      'Presence at approval',
      '普通成年路径须在决定当日身处澳洲，除非满足法定例外。',
      'Adult applicants must normally be in Australia on the decision date unless a statutory exception applies.',
      'SRC-061',
      's 24(5)',
      c.approvalAbroadException === 'pending' ? 'PD-219' : undefined,
    ),
    q(
      'AU-CIT-pledge',
      underPledgeAge || incapacity
        ? true
        : c.willingToPledge === true
          ? true
          : age === undefined || c.medicalBranch === 'incapacity-claimed'
            ? undefined
            : c.willingToPledge,
      '获批后的宣誓',
      'Pledge after approval',
      `此项记录宣誓意愿或豁免。需宣誓者于宣誓日入籍；接获批准通知后 ${f.pledgeMonths.value} 个月内未宣誓，若无规定理由，部长可撤销批准。`,
      `This records willingness or exemption. Where required, citizenship begins at the pledge. Approval may be cancelled if no pledge is made within ${f.pledgeMonths.value} months of receipt of notice without a prescribed reason.`,
      'SRC-061',
      'ss 25(3), 26, 28',
    ),
  ];
}

export function familyChecks(
  id: AuFullPathId,
  r: AuFullRequest,
  pilot?: PilotPathway,
): CountryCheck[] {
  switch (id) {
    case 'AU-PARTNER':
      return partnerChecks(r, pilot);
    case 'AU-RRV':
      return rrvChecks(r, pilot);
    case 'AU-CITIZENSHIP':
      return citizenshipChecks(r, pilot);
    default:
      return [];
  }
}
