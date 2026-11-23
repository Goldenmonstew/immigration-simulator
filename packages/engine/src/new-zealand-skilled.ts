import { nzSkilledParameters as v } from '@uk-immigration/policy-data';
import { addDays, addMonths } from './dates';
import type { CountryPathway } from './country-result';
import {
  all,
  any,
  atLeast,
  atMost,
  type NzContext,
} from './new-zealand-checks';

type SmcRoute = 'points' | 'experience' | 'trades';
type WorkType = 'tier2' | 'care' | 'transport' | 'high-pay';
type Visa =
  | 'work'
  | 'critical-purpose-work'
  | 'interim-work-renewal'
  | 'other-interim-work'
  | 'WI21'
  | 'WI22'
  | 'other';

interface Employment {
  occupationCode?: string;
  genuineOfferInNZ?: boolean;
  employerCompliant?: boolean;
  // Unexpired, unsuspended accreditation on the date required by this route.
  accreditedAtApplication?: boolean;
  accreditedAtDecision?: boolean;
  guaranteedWeeklyHours?: number;
  contract?: 'permanent' | 'fixed' | 'services';
  contractMonths?: number;
  // Guaranteed SR2.5 remuneration only. For a salary use maximum contract hours.
  hourlyPay?: number;
  annualPay?: number;
  maximumWeeklyHours?: number;
  // If sleep hours are excluded, the normal and sleep pay must be documented.
  sleepHoursExcluded?: boolean;
  sleepExclusionVerified?: boolean;
  occupationMatch?: boolean;
}

interface WageLock {
  // First qualifying accrual date for this claim; omit visaGranted if no earlier grant applies.
  accrualStarted?: string;
  visaGranted?: string;
}

interface SmcAnswers extends WageLock {
  route?: SmcRoute;
  invitedRoute?: SmcRoute | 'none';
  invitedOn?: string;
  invitationCurrent?: boolean;
  eoiDisclosure?: 'accurate' | 'under-review' | 'declined';
  skillLevel?: 'one' | 'two-three' | 'four-five-or-unlisted';
  registration?: 'held' | 'not-required' | 'required-missing';
  // A current registration matching an entry and all conditions in SR3.30.
  sr330Registration?: boolean;
  anzscoQualificationOrSubstitution?: boolean;
  relevantWorkYears?: number;
  contractRecordSustainable?: boolean;
  contractorNZSkilledMonths?: number;
  independentMidwifeAuthorityAndRegistration?: boolean;
  claim?: 'income' | 'registration' | 'qualification';
  registrationPoints?: 0 | 3 | 4 | 5 | 6;
  qualification?:
    | 'doctorate'
    | 'nz-masters'
    | 'overseas-masters'
    | 'nz-postgrad'
    | 'overseas-postgrad'
    | 'nz-bachelor'
    | 'overseas-bachelor'
    | 'iqa-level10'
    | 'iqa-level9'
    | 'iqa-level8'
    | 'other';
  qualificationRecognised?: boolean;
  holdsBachelor?: boolean;
  nzMastersFullTimeWeeks?: number;
  // Months in each rolling window for the selected claim. Omit disputed periods.
  pointsMonthsInLast24?: number;
  pointsMonthsInLast36?: number;
  pointsMonthsInLast48?: number;
  // Direct experience excludes the additional NZ months. For trades, count only post-qualification work.
  directMonthsInLast10Years?: number;
  directNzMonthsInLast10Years?: number;
  additionalNzMonthsInWindow?: number;
  // Lowest guaranteed hourly pay throughout the additional NZ months claimed.
  minimumAdditionalHourlyPay?: number;
  // Confirms lawful, genuine full-time work, pay at the applicable multiplier in every
  // period, WI21/WI22 excluded, and (for registration points) post-registration accrual.
  workEvidenceVerified?: boolean;
  tradeListedAtAccrual?: boolean;
  tradeQualificationLevel?: number;
  tradeQualificationRelevant?: boolean;
  tradeQualificationOrigin?: 'nz' | 'overseas';
  nzCreditsExcludingRpl?: number;
  overseasTradeIqa?: boolean;
}

interface TransportHistory {
  qualifyingBeforeRemoval?: boolean;
  aewvAppliedOn?: string;
  otherWorkVisaGrantedOn?: string;
  offerOn?: string;
  employmentSignedOn?: string;
  startedOn?: string;
  busOperatorEligible?: boolean;
  classFourFiveVehicleAndLicence?: boolean;
}

interface WorkPeriod extends WageLock {
  kind: WorkType;
  // The number of distinct months from this period INSIDE the preceding 30 months.
  monthsInWindow: number;
  occupationCode?: string;
  guaranteedWeeklyHours?: number;
  minimumHourlyPay?: number;
  visa?: Visa;
  occupationRequirementsVerified?: boolean;
  // Same job, retained on removal, carrying on under its archived row.
  maintainedRemovedOccupation?: boolean;
  // Actual archived wage verified for a removed role.
  archivedHourlyFloor?: number;
  telecomLevelThreeCertificate?: boolean;
  visaAppliedOn?: string;
  transport?: TransportHistory;
}

interface WorkResidenceAnswers extends WageLock {
  currentVisa?: Visa;
  periods?: WorkPeriod[];
  distinctMonthsAndEarningsVerified?: boolean;
  maintainedRemovedOccupation?: boolean;
  archivedHourlyFloor?: number;
}

export interface NzSkilledAnswers {
  job?: Employment;
  feeBand?: 'A' | 'B' | 'C';
  smc?: SmcAnswers;
  green?: WorkResidenceAnswers & {
    tier?: 'straight' | 'work';
    rowRequirementsVerified?: boolean;
    telecomLevelThreeCertificate?: boolean;
    contractorRelevantYears?: number;
    independentMidwifeAuthorityAndRegistration?: boolean;
  };
  sector?: WorkResidenceAnswers & {
    category?: 'care' | 'transport';
    transport?: TransportHistory;
    maritimeCertificateHeld?: boolean;
  };
}

const ref = (srcId: string, locator: string) => [{ srcId, locator }];
const smcRef = (locator: string) => ref('SRC-236', locator);
const greenRef = (locator: string) => ref('SRC-237', locator);
const sectorRef = (locator: string) => ref('SRC-238', locator);
const points = v.skilledPoints.value;
const knownIn = (code: string | undefined, list: string[]) =>
  code === undefined ? undefined : list.includes(code);

function rateAt(table: Record<string, number>, date?: string) {
  if (!date) return undefined;
  const effective = Object.keys(table)
    .filter((d) => d <= date)
    .sort()
    .pop();
  return effective ? table[effective] : undefined;
}

function lockDate(answer: WageLock, applicationDate: string) {
  const start = answer.accrualStarted;
  if (!start || start > applicationDate) return undefined;
  const visa = answer.visaGranted;
  return visa &&
    visa <= start &&
    start <= addMonths(visa, v.wageLockMonths.value)
    ? visa
    : start;
}

function hourlyRate(job: Employment) {
  if (job.sleepHoursExcluded && !job.sleepExclusionVerified) return undefined;
  if (job.hourlyPay !== undefined) return job.hourlyPay;
  if (job.annualPay === undefined || !job.maximumWeeklyHours) return undefined;
  return job.annualPay / v.weeksInSalaryYear.value / job.maximumWeeklyHours;
}

function paid(rate?: number, threshold?: number) {
  return threshold === undefined ? undefined : atLeast(rate, threshold);
}

function contract(job: Employment, services?: boolean) {
  if (!job.contract) return undefined;
  if (job.contract === 'services') return services;
  return (
    job.contract === 'permanent' ||
    atLeast(job.contractMonths, v.employmentMonths.value)
  );
}

function jobEvidence(
  job: Employment,
  term: boolean | undefined,
  transport = false,
  midwife = false,
) {
  return all(
    job.genuineOfferInNZ,
    job.employerCompliant,
    job.occupationMatch,
    job.sleepHoursExcluded ? job.sleepExclusionVerified : true,
    transport
      ? job.accreditedAtApplication
      : any(job.accreditedAtApplication, job.accreditedAtDecision),
    midwife || atLeast(job.guaranteedWeeklyHours, v.employmentHours.value),
    term,
  );
}

function ageCheck(ctx: NzContext, id: string, src: ReturnType<typeof ref>) {
  return ctx.check(
    id,
    '主申请人递交年龄',
    'Principal applicant’s age at lodgement',
    atMost(ctx.age, v.skilledAge.value),
    src,
    `递交当日主申请人须为 ${v.skilledAge.value} 岁或以下。`,
    `The principal applicant must be ${v.skilledAge.value} or younger on lodgement.`,
  );
}

function fee(
  ctx: NzContext,
  id: string,
  band: NzSkilledAnswers['feeBand'],
  priority = false,
) {
  const amount = band
    ? 'NZ$' + v.skilledFees.value[band].toLocaleString('en-NZ')
    : undefined;
  const eoi = id === 'NZ-P4-FEE' ? `EOI NZ$${v.skilledFees.value.eoi}. ` : '';
  return ctx.check(
    id,
    '费用与审理顺序',
    'Fees and processing order',
    undefined,
    [...v.skilledFees.sources, ...ref('SRC-235', 'SR1.1(c)')],
    `${eoi}历史费用表${amount ? '所列本地区费用为 ' + amount : '按递交地区计费'}，实际金额须核对 INZ 现行费表。随行人员英语课另计。${priority ? '绿名单优先审理。' : ''}`,
    `${eoi}Historical fee table${amount ? ' lists ' + amount : ' varies by lodgement band'}. Confirm the current INZ fee and any separate tuition for dependants.${priority ? ' Green List applications have processing priority.' : ''}`,
    'PD-225',
  );
}

function qualificationPoints(s: SmcAnswers) {
  if (s.qualification === 'other' || s.qualificationRecognised === false)
    return 0;
  if (s.qualificationRecognised === undefined) return undefined;
  const withBachelor = (score: number) =>
    s.holdsBachelor === undefined ? undefined : s.holdsBachelor ? score : 0;
  switch (s.qualification) {
    case 'doctorate':
      return points.six;
    case 'nz-masters': {
      const qualifies = all(
        s.holdsBachelor,
        atLeast(s.nzMastersFullTimeWeeks, v.nzMastersWeeks.value),
      );
      return qualifies === undefined
        ? undefined
        : qualifies
          ? points.six
          : points.five;
    }
    case 'overseas-masters':
    case 'nz-postgrad':
      return withBachelor(points.five);
    case 'nz-bachelor':
    case 'iqa-level10':
      return points.five;
    case 'overseas-postgrad':
    case 'iqa-level9':
      return withBachelor(points.four);
    case 'overseas-bachelor':
      return points.four;
    case 'iqa-level8':
      return withBachelor(points.three);
  }
}

function pointsCheck(s: SmcAnswers, job: Employment, date: string) {
  const rate = hourlyRate(job);
  const invitation =
    s.invitedOn && s.invitedOn <= date ? s.invitedOn : undefined;
  const lock = lockDate(s, date);
  function core(anchor: string | undefined, pay: number | undefined) {
    if (s.claim === 'qualification') return qualificationPoints(s);
    if (s.claim === 'registration')
      return s.sr330Registration === false
        ? 0
        : s.sr330Registration
          ? s.registrationPoints
          : undefined;
    if (
      s.claim !== 'income' ||
      pay === undefined ||
      !rateAt(v.smcRateBase.value, anchor)
    )
      return undefined;
    if (paid(pay, rateAt(v.smcRateTriple.value, anchor))) return points.six;
    if (paid(pay, rateAt(v.smcRateTwice.value, anchor))) return points.four;
    if (paid(pay, rateAt(v.smcRateOneHalf.value, anchor))) return points.three;
    return 0;
  }
  function skilledPay(anchor?: string) {
    const table =
      s.skillLevel === 'four-five-or-unlisted'
        ? v.smcRateOneHalf
        : v.smcRateBase;
    return s.skillLevel ? paid(rate, rateAt(table.value, anchor)) : undefined;
  }
  const directCore = core(invitation, rate);
  const direct = all(
    directCore === undefined ? undefined : directCore >= points.six,
    skilledPay(invitation),
    job.contract && job.contract !== 'services'
      ? true
      : job.contract === 'services'
        ? all(
            atLeast(s.pointsMonthsInLast24, v.pointsMonths.value.one),
            s.workEvidenceVerified,
          )
        : undefined,
  );
  const lowerPay =
    rate !== undefined && s.minimumAdditionalHourlyPay !== undefined
      ? Math.min(rate, s.minimumAdditionalHourlyPay)
      : undefined;
  const base = core(lock, lowerPay);
  const experience = (
    extra: number,
    months: number | undefined,
    required: number,
  ) =>
    all(
      base === undefined
        ? undefined
        : base >= points.three && base + extra >= points.six,
      atLeast(months, required),
      s.accrualStarted === undefined
        ? undefined
        : addMonths(s.accrualStarted, required) <= date,
    );
  // A six-point service contractor must also meet the wage on the invitation date.
  const needsInvitationPay = base === points.six && job.contract === 'services';
  const combined = all(
    s.workEvidenceVerified,
    skilledPay(lock),
    needsInvitationPay
      ? all(
          skilledPay(invitation),
          directCore === undefined ? undefined : directCore === points.six,
          atLeast(s.pointsMonthsInLast24, v.pointsMonths.value.one),
        )
      : true,
    any(
      experience(points.one, s.pointsMonthsInLast24, v.pointsMonths.value.one),
      experience(points.two, s.pointsMonthsInLast36, v.pointsMonths.value.two),
      experience(
        points.three,
        s.pointsMonthsInLast48,
        v.pointsMonths.value.three,
      ),
    ),
  );
  return { met: any(direct, combined), directCore, base };
}

function smcPath(ctx: NzContext, input: NzSkilledAnswers) {
  const s = input.smc ?? {};
  const job = input.job ?? {};
  const feeId = 'NZ-P4-FEE';
  const beforeReform =
    ctx.date < v.smcFrom.value ||
    (s.invitedOn !== undefined && s.invitedOn < v.smcFrom.value);
  const checks = [ageCheck(ctx, 'NZ-P4-1-AGE', smcRef('SR3.10(b)(i)'))];
  if (beforeReform) {
    checks.push(
      ctx.check(
        'NZ-P4-1',
        '旧制邀请',
        'Pre-reform invitation',
        undefined,
        smcRef('SR3.5.15'),
        '该申请适用旧版 SR3 指引，须按受邀当时的规则核对。',
        'This application needs assessment under the pre-reform SR3 instructions.',
        'PD-226',
      ),
    );
    checks.push(
      ...ctx.common('smc', s.sr330Registration),
      fee(ctx, feeId, input.feeBand),
    );
    return ctx.path(
      'NZ-SMC',
      '技术移民类别',
      'Skilled Migrant Category',
      checks,
      [feeId],
    );
  }
  checks.push(...ctx.common('smc', s.sr330Registration));
  const invitation = s.invitedOn
    ? s.invitedOn <= ctx.date &&
      ctx.date <= addMonths(s.invitedOn, v.itaMonths.value)
    : undefined;
  const sameRoute =
    s.invitedRoute === 'none'
      ? false
      : s.invitedRoute && s.route
        ? s.invitedRoute === s.route
        : undefined;
  checks.push(
    ctx.check(
      'NZ-P4-1',
      'EOI 与受邀通道',
      'EOI and invitation',
      all(
        invitation,
        sameRoute,
        s.invitationCurrent,
        s.eoiDisclosure === 'declined'
          ? false
          : s.eoiDisclosure === 'accurate'
            ? true
            : undefined,
      ),
      smcRef('SR3.5.1, SR3.5.5–SR3.5.10'),
      `EOI 披露须完整，按有效邀请所列通道在 ${v.itaMonths.value} 个月内递交。披露争议须个案审查。`,
      `Disclose the EOI facts and changes, and apply under the invited pathway within ${v.itaMonths.value} months. Disputed disclosures require review.`,
    ),
  );
  const midwife = s.independentMidwifeAuthorityAndRegistration === true;
  const services = all(
    atLeast(s.contractorNZSkilledMonths, v.employmentMonths.value),
    midwife ||
      all(
        s.contractRecordSustainable,
        atLeast(job.contractMonths, v.serviceMonths.value),
      ),
  );
  const levelExperience =
    s.skillLevel === 'one'
      ? atLeast(s.relevantWorkYears, v.skilledLevelExperienceYears.value.one)
      : s.skillLevel === 'two-three'
        ? atLeast(
            s.relevantWorkYears,
            v.skilledLevelExperienceYears.value.twoThree,
          )
        : s.skillLevel
          ? false
          : undefined;
  const registered =
    s.registration === undefined ? undefined : s.registration === 'held';
  const qualification = all(
    s.registration === undefined
      ? undefined
      : s.registration !== 'required-missing',
    any(
      registered,
      s.sr330Registration,
      s.anzscoQualificationOrSubstitution,
      levelExperience,
    ),
  );
  checks.push(
    ctx.check(
      'NZ-P4-2',
      '技术雇佣与胜任资格',
      'Skilled employment and qualifications',
      all(
        jobEvidence(job, contract(job, services), false, midwife),
        qualification,
      ),
      [
        ...smcRef('SR3.15(a)–(d), SR3.15.1, SR3.15.5'),
        ...ref('SRC-235', 'SR2.1; R5.110'),
      ],
      '核对认证雇主、实际职责、工时、合同期限、资格及法定注册。服务合同另核在新经验与持续接单记录。',
      'Verify accreditation, duties, hours, term, qualifications and statutory registration. Services contracts require NZ experience and a sustainable contracting record.',
    ),
  );
  const code = job.occupationCode;
  const skilledLevel =
    s.skillLevel === undefined
      ? undefined
      : s.skillLevel !== 'four-five-or-unlisted';
  if (s.route === 'points') {
    const result = pointsCheck(s, job, ctx.date);
    const stated = (score: number | undefined) =>
      score === undefined ? '—' : score;
    checks.push(
      ctx.check(
        'NZ-P4-3',
        '单项技能与在新经验积分',
        'One skill category and NZ experience',
        result.met,
        smcRef('SR3.10(f)–(i), SR3.25.1–SR3.25.25, SR3.30'),
        `目标 ${points.six} 分；所选技能单独申报 ${stated(result.directCore)} 分，按所报经历的工资基准为 ${stated(result.base)} 分。补分经历须在回溯期内、达到对应工资；注册积分仅计获证之后。核对 IQA 或免评依据。`,
        `The target is ${points.six} points. The selected skill scores ${stated(result.directCore)} alone and ${stated(result.base)} under the wage table for the claimed work. Count qualifying NZ months within the relevant window and after registration where required. Verify IQA or exemption.`,
      ),
    );
  } else if (s.route === 'experience') {
    const amber = knownIn(code, v.amberCodes.value);
    const red = knownIn(code, v.redCodes.value);
    const threshold = rateAt(
      amber ? v.smcRateAmber.value : v.smcRateOrdinary.value,
      lockDate(s, ctx.date),
    );
    checks.push(
      ctx.check(
        'NZ-P4-4',
        '技术工作经验通道',
        'Skilled work experience',
        all(
          skilledLevel,
          red === undefined ? undefined : !red,
          amber === undefined
            ? undefined
            : all(
                paid(hourlyRate(job), threshold),
                paid(s.minimumAdditionalHourlyPay, threshold),
              ),
          s.accrualStarted === undefined
            ? undefined
            : addMonths(
                s.accrualStarted,
                v.experienceMonths.value.additional,
              ) <= ctx.date,
          amber === undefined
            ? undefined
            : atLeast(
                amber
                  ? s.directNzMonthsInLast10Years
                  : s.directMonthsInLast10Years,
                v.experienceMonths.value.direct,
              ),
          atLeast(
            s.additionalNzMonthsInWindow,
            v.experienceMonths.value.additional,
          ),
          s.workEvidenceVerified,
        ),
        smcRef('SR3.10.5, SR3.35.1–SR3.35.10; Appendices 21–22'),
        '直接相关经验与近四年内额外的新西兰技术工作须分开计时；琥珀名单两段都须在新西兰，红色名单限积分通道。',
        'Count distinct directly relevant months and additional skilled NZ months in the prior four years. Amber requires both in NZ. Red occupations may use the points pathway.',
      ),
    );
  } else if (s.route === 'trades') {
    const recognised =
      s.tradeQualificationOrigin === 'nz'
        ? atLeast(s.nzCreditsExcludingRpl, v.tradeQualification.value.credits)
        : s.tradeQualificationOrigin === 'overseas'
          ? s.overseasTradeIqa
          : undefined;
    checks.push(
      ctx.check(
        'NZ-P4-5',
        '技工与技术员通道',
        'Trades and technician pathway',
        all(
          code === undefined ? undefined : !v.redCodes.value.includes(code),
          any(
            knownIn(code, v.tradesCodes.value),
            s.tradeListedAtAccrual ?? false,
          ),
          skilledLevel,
          paid(
            hourlyRate(job),
            rateAt(v.smcRateBase.value, lockDate(s, ctx.date)),
          ),
          paid(
            s.minimumAdditionalHourlyPay,
            rateAt(v.smcRateBase.value, lockDate(s, ctx.date)),
          ),
          s.accrualStarted === undefined
            ? undefined
            : addMonths(s.accrualStarted, v.tradesMonths.value.additional) <=
                ctx.date,
          atLeast(s.tradeQualificationLevel, v.tradeQualification.value.level),
          s.tradeQualificationRelevant,
          recognised,
          atLeast(s.directMonthsInLast10Years, v.tradesMonths.value.direct),
          atLeast(
            s.additionalNzMonthsInWindow,
            v.tradesMonths.value.additional,
          ),
          s.workEvidenceVerified,
        ),
        smcRef('SR3.40.1–SR3.40.15; Appendix 23'),
        '核对职业表、学历与获证后两段互不重叠的经验。新西兰学分扣除 RPL，海外学历须有 IQA；额外在新经历采近三年。',
        'Verify the occupation, qualification and two non-overlapping periods after qualification. Exclude RPL credits, verify overseas IQA and count additional NZ work in the last three years.',
      ),
    );
  }
  checks.push(fee(ctx, feeId, input.feeBand));
  return ctx.path(
    'NZ-SMC',
    '技术移民类别',
    'Skilled Migrant Category',
    checks,
    [feeId],
  );
}

const visaAllowsLodgement = (visa?: Visa) =>
  visa === undefined
    ? undefined
    : ['work', 'critical-purpose-work', 'WI21', 'WI22'].includes(visa);

function roadTransition(t: TransportHistory = {}) {
  const timely = (d?: string) =>
    d === undefined ? undefined : d <= v.transportCutoff.value;
  const commencedWithin = (d?: string) =>
    d && t.startedOn
      ? t.startedOn >= d &&
        t.startedOn <= addDays(d, v.transportStartDays.value)
      : undefined;
  return any(
    t.qualifyingBeforeRemoval,
    timely(t.aewvAppliedOn),
    all(
      timely(t.offerOn),
      t.otherWorkVisaGrantedOn === undefined ? undefined : true,
      any(
        commencedWithin(t.employmentSignedOn),
        commencedWithin(t.otherWorkVisaGrantedOn),
      ),
    ),
  );
}

function tierTwoRate(
  code: string | undefined,
  date?: string,
  telecomCert?: boolean,
) {
  if (!code) return undefined;
  if (code === v.telecomCode.value && telecomCert)
    return rateAt(v.greenRateBase.value, date);
  if (v.tierTwoPlus15Codes.value.includes(code))
    return rateAt(v.greenRatePlus15.value, date);
  if (v.tierTwoPlus30Codes.value.includes(code))
    return rateAt(v.greenRatePlus30.value, date);
  if (v.tierTwoPlus50Codes.value.includes(code))
    return rateAt(v.greenRatePlus50.value, date);
  return rateAt(v.greenRateBase.value, date);
}

function greenPay(
  rate: number | undefined,
  code: string | undefined,
  date?: string,
  telecomCert?: boolean,
) {
  const above = paid(rate, tierTwoRate(code, date, telecomCert));
  // A telecommunications qualification is an alternative to the premium.
  if (
    code === v.telecomCode.value &&
    telecomCert === undefined &&
    above === false &&
    paid(rate, rateAt(v.greenRateBase.value, date))
  )
    return undefined;
  return above;
}

function transportEvidence(
  code?: string,
  t?: TransportHistory,
  maritimeCertificate?: boolean,
) {
  if (!code) return undefined;
  if (v.seaCodes.value.includes(code)) return maritimeCertificate;
  if (code === v.busCode.value)
    return all(roadTransition(t), t?.busOperatorEligible);
  if (v.truckCodes.value.includes(code))
    return all(roadTransition(t), t?.classFourFiveVehicleAndLicence);
  return false;
}

function transportFloor(code?: string, date?: string) {
  return code === v.busCode.value
    ? v.busHourlyRate.value
    : rateAt(v.smcRateBase.value, date);
}

function qualifyingPeriod(
  p: WorkPeriod,
  date: string,
  currentPay: number | undefined,
) {
  const lock = lockDate(p, date);
  const visa =
    p.visa === undefined
      ? undefined
      : p.visa === 'work' ||
        p.visa === 'critical-purpose-work' ||
        p.visa === 'interim-work-renewal' ||
        (p.kind === 'care' && p.visa === 'other-interim-work');
  const base = all(
    visa,
    atLeast(p.guaranteedWeeklyHours, v.employmentHours.value),
    p.accrualStarted === undefined ? undefined : true,
  );
  if (p.kind === 'high-pay')
    return all(
      base,
      paid(p.minimumHourlyPay, rateAt(v.greenRateTwice.value, lock)),
    );
  const code = p.occupationCode;
  if (p.kind === 'care')
    return all(
      base,
      code === undefined
        ? undefined
        : v.careCodes.value.includes(code) ||
            (p.maintainedRemovedOccupation ?? false),
      paid(p.minimumHourlyPay, rateAt(v.careRates.value, lock)),
    );
  if (p.kind === 'transport')
    return all(
      base,
      transportEvidence(code, p.transport, true),
      paid(p.minimumHourlyPay, transportFloor(code, lock)),
    );
  const listed = knownIn(code, v.greenTierTwoCodes.value);
  let wage =
    !listed && p.maintainedRemovedOccupation
      ? paid(p.minimumHourlyPay, p.archivedHourlyFloor)
      : greenPay(
          p.minimumHourlyPay,
          code,
          lock,
          p.telecomLevelThreeCertificate,
        );
  if (
    p.visaAppliedOn &&
    p.visaAppliedOn < v.greenWageExceptionBefore.value &&
    code &&
    listed &&
    ![
      ...v.tierTwoPlus15Codes.value,
      ...v.tierTwoPlus30Codes.value,
      ...v.tierTwoPlus50Codes.value,
    ].includes(code)
  )
    wage = any(wage, paid(currentPay, rateAt(v.greenRateBase.value, date)));
  return all(
    base,
    listed === undefined
      ? undefined
      : listed || (p.maintainedRemovedOccupation ?? false),
    p.occupationRequirementsVerified,
    wage,
  );
}

function monthsRequirement(
  a: WorkResidenceAnswers,
  date: string,
  currentPay: number | undefined,
  requiredKind: WorkType | undefined,
  accept: (p: WorkPeriod) => boolean = () => true,
) {
  if (!a.periods) return all(undefined, a.distinctMonthsAndEarningsVerified);
  let met = 0;
  let possible = 0;
  let hasRouteWork: boolean | undefined =
    requiredKind === undefined ? undefined : false;
  for (const p of a.periods.filter(accept)) {
    const status = qualifyingPeriod(p, date, currentPay);
    // An accrual date cannot support a larger number of elapsed whole months.
    if (
      p.accrualStarted &&
      addMonths(p.accrualStarted, Math.floor(p.monthsInWindow)) > date
    )
      continue;
    if (status !== false) possible += p.monthsInWindow;
    if (status === true) met += p.monthsInWindow;
    if (p.kind === requiredKind && p.monthsInWindow > 0)
      hasRouteWork = any(hasRouteWork, status);
  }
  const required = v.workResidenceMonths.value.required;
  if (possible < required) return false;
  return all(
    hasRouteWork,
    met >= required ? true : undefined,
    a.distinctMonthsAndEarningsVerified,
  );
}

function greenPath(ctx: NzContext, input: NzSkilledAnswers) {
  const g = input.green ?? {};
  const job = input.job ?? {};
  const code = job.occupationCode;
  const rate = hourlyRate(job);
  const feeId = 'NZ-P5-4';
  const tier = g.tier;
  const checks = [
    ...ctx.common('skilled'),
    ageCheck(ctx, 'NZ-P5-1-AGE', greenRef('SR4.5(b)(ii), SR5.5(b)(v)')),
  ];
  const visa =
    tier === 'straight'
      ? true
      : tier === 'work'
        ? visaAllowsLodgement(g.currentVisa)
        : undefined;
  checks.push(
    ctx.check(
      'NZ-P5-1',
      '层级与申请时签证',
      'Tier and visa at lodgement',
      visa,
      greenRef('SR4.5, SR5.5(b)(i)'),
      '直通居留可从海外递交；工签转居留在递交时须持有效工签或有工作条件的关键目的访客签。',
      'Straight to Residence accepts offshore offers. Work to Residence requires a work visa or a critical purpose visitor visa with work conditions at lodgement.',
    ),
  );
  if (tier === 'straight') {
    const employeeRates: Record<string, number> = v.tierOneEmployeeRates.value;
    const contractRates: Record<string, number> = v.tierOneContractRates.value;
    const contractor = job.contract === 'services';
    const specialPay =
      code &&
      (contractor
        ? (contractRates[code] ?? employeeRates[code])
        : employeeRates[code]);
    const services = all(
      any(
        g.independentMidwifeAuthorityAndRegistration ?? false,
        atLeast(job.contractMonths, v.serviceMonths.value),
      ),
      code && contractRates[code] !== undefined
        ? atLeast(g.contractorRelevantYears, v.tierOneContractYears.value)
        : true,
    );
    checks.push(
      ctx.check(
        'NZ-P5-2',
        'Tier 1 职业、合同与薪酬',
        'Tier 1 occupation, contract and pay',
        all(
          knownIn(code, v.greenTierOneCodes.value),
          g.rowRequirementsVerified,
          jobEvidence(job, contract(job, services)),
          paid(rate, specialPay || rateAt(v.greenRateBase.value, ctx.date)),
        ),
        greenRef('SR4.10(a)–(c); Appendix 13 Tier 1, selected occupation row'),
        '按所选职业核对 ANZSCO 职责、工资、资格、注册与合同。仅知道职业位于绿名单不足以确认该行的要求。',
        'Verify duties, pay, credentials, registration and contract against the selected occupation row. List membership alone leaves its requirements unresolved.',
        'PD-226',
      ),
    );
  }
  if (tier === 'work') {
    const lock = lockDate(g, ctx.date);
    const listed = knownIn(code, v.greenTierTwoCodes.value);
    const retained = all(
      g.maintainedRemovedOccupation ?? false,
      monthsRequirement(
        g,
        ctx.date,
        rate,
        'tier2',
        (p) => p.kind === 'tier2' && p.occupationCode === code,
      ),
    );
    const wage =
      !listed && g.maintainedRemovedOccupation
        ? paid(rate, g.archivedHourlyFloor)
        : greenPay(rate, code, lock, g.telecomLevelThreeCertificate);
    checks.push(
      ctx.check(
        'NZ-P5-3-JOB',
        'Tier 2 当前岗位',
        'Current Tier 2 job',
        all(
          listed === undefined ? undefined : any(listed, retained),
          g.rowRequirementsVerified,
          jobEvidence(job, contract(job, false)),
          wage,
        ),
        greenRef(
          'SR5.5(b)(iv), SR5.10, SR5.15.1; Appendix 13 Tier 2, selected occupation row',
        ),
        '核对该行规定的资格与起算时工资；从清单移除的现职须在原岗位累计满规定月份。',
        'Check the row’s credentials and applicable locked wage. A removed current role requires the qualifying months in that occupation.',
        'PD-226',
      ),
    );
    checks.push(
      ctx.check(
        'NZ-P5-3',
        'Tier 2 与高薪工作月数',
        'Tier 2 and high-pay months',
        monthsRequirement(
          g,
          ctx.date,
          rate,
          'tier2',
          (p) => p.kind === 'tier2' || p.kind === 'high-pay',
        ),
        [...greenRef('SR5.15(a)–(m), SR5.20'), ...ref('SRC-235', 'SR2.15.1')],
        `过去 ${v.workResidenceMonths.value.window} 个月内累计 ${v.workResidenceMonths.value.required} 个不重叠的合格月。须有 Tier 2 合格工作经历，其余月份可用两倍中位数工资的工作补足。`,
        `Count ${v.workResidenceMonths.value.required} distinct qualifying months in the last ${v.workResidenceMonths.value.window}. Some qualifying Tier 2 work is required. Work at twice the median wage can cover the balance.`,
      ),
    );
  }
  checks.push(fee(ctx, feeId, input.feeBand, true));
  return ctx.path(
    'NZ-GREEN-LIST',
    '绿名单居民签证',
    'Green List residence',
    checks,
    [feeId],
  );
}

function sectorPath(ctx: NzContext, input: NzSkilledAnswers) {
  const s = input.sector ?? {};
  const job = input.job ?? {};
  const code = job.occupationCode;
  const rate = hourlyRate(job);
  const lock = lockDate(s, ctx.date);
  const feeId = 'NZ-P6-3';
  const checks = [
    ...ctx.common('skilled'),
    ageCheck(ctx, 'NZ-P6-AGE', sectorRef('SR6.5(b)(v), SR7.5(b)(v)')),
  ];
  checks.push(
    ctx.check(
      'NZ-P6-VISA',
      '所选行业与申请时签证',
      'Sector and visa at lodgement',
      all(s.category ? true : undefined, visaAllowsLodgement(s.currentVisa)),
      sectorRef('SR6.5(b)(i), SR7.5(b)(i)'),
      '须指明申请行业，递交当天持有效工签或带工作条件的关键目的访客签。',
      'Select the sector and hold a work visa or critical purpose visitor visa with work conditions at lodgement.',
    ),
  );
  if (s.category === 'care') {
    const retained = all(
      s.maintainedRemovedOccupation ?? false,
      monthsRequirement(
        s,
        ctx.date,
        rate,
        'care',
        (p) => p.kind === 'care' && p.occupationCode === code,
      ),
    );
    checks.push(
      ctx.check(
        'NZ-P6-1',
        '护理岗位、工资与合同',
        'Care occupation, pay and contract',
        all(
          code === undefined
            ? undefined
            : any(v.careCodes.value.includes(code), retained),
          paid(rate, rateAt(v.careRates.value, lock)),
          jobEvidence(job, contract(job, false)),
        ),
        [
          ...sectorRef(
            'SR6.5(b)(iv), SR6.10, SR6.15(l); Appendix 14 Care Workforce',
          ),
          ...ref('SRC-235', 'SR2.5.5'),
        ],
        '按护理栏职业及固定行业工资审查。若排除夜间睡眠时间，须核对正常保证工时和睡眠期工资。',
        'Verify the Care Workforce row and sector wage. Excluding sleep hours requires evidence of normal guaranteed hours and sleep pay.',
        'PD-226',
      ),
    );
  }
  if (s.category === 'transport') {
    const sea = knownIn(code, v.seaCodes.value);
    const protectedMonths =
      sea === false
        ? monthsRequirement(
            s,
            ctx.date,
            rate,
            'transport',
            (p) =>
              p.kind === 'transport' &&
              (p.occupationCode === v.busCode.value ||
                v.truckCodes.value.includes(p.occupationCode ?? '')),
          )
        : sea;
    checks.push(
      ctx.check(
        'NZ-P6-2',
        '运输职业、证书与过渡条款',
        'Transport role, credentials and transition',
        all(
          transportEvidence(code, s.transport, s.maritimeCertificateHeld),
          protectedMonths,
          paid(rate, transportFloor(code, lock)),
          jobEvidence(job, contract(job, false), true),
        ),
        sectorRef('SR7.5(b), SR7.10(a)–(b), SR7.15(j)–(n)'),
        '海运岗位须在申请时持相应海事证书；已退出的巴士、重型运输岗位须满足过渡日期、雇主或驾照条件及运输工作月数。',
        'Maritime qualifications must be held at lodgement. Removed road occupations need the transitional dates, operator or vehicle/licence evidence and qualifying transport months.',
      ),
    );
  }
  checks.push(
    ctx.check(
      'NZ-P6-WORK',
      '行业工签转居留月数',
      'Work to Residence months',
      monthsRequirement(s, ctx.date, rate, s.category),
      [
        ...sectorRef('SR6.15(a)–(l), SR7.15(a)–(n)'),
        ...greenRef('SR5.15, SR5.20'),
        ...ref('SRC-235', 'SR2.15.1'),
      ],
      `过去 ${v.workResidenceMonths.value.window} 个月内累计 ${v.workResidenceMonths.value.required} 个不重叠的合格月。须有所选行业的合格工作经历，其他合格行业、Tier 2 或高薪工作可补足其余月份。逐段核对工签、工时和薪资。`,
      `Count ${v.workResidenceMonths.value.required} distinct qualifying months in the last ${v.workResidenceMonths.value.window}. Some work must qualify in the selected sector. Other eligible sector, Tier 2 or high-pay work can cover the balance. Check each period’s visa, hours and wage.`,
    ),
  );
  checks.push(fee(ctx, feeId, input.feeBand));
  return ctx.path(
    'NZ-SECTOR',
    '护理或运输行业工签转居留',
    'Care or transport Work to Residence',
    checks,
    [feeId],
  );
}

export function skilledPathways(
  ctx: NzContext,
  answers: NzSkilledAnswers,
): CountryPathway[] {
  const paths = [
    smcPath(ctx, answers),
    greenPath(ctx, answers),
    sectorPath(ctx, answers),
  ];
  if (ctx.date > ctx.policyAsOf) {
    for (const path of paths)
      path.assumptions.push(
        ctx.L(
          '未来递交日按已公布工资表及职业清单估算。新的生效日、金额与名单须复核（PD-226）。',
          'Future applications use the published wages and occupation lists. Recheck future effective dates, rates and lists (PD-226).',
        ),
      );
  }
  return paths;
}
