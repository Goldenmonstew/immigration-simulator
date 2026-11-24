import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addDays, addYears, fullYears } from '../dates';
import {
  all,
  any,
  filingDatesForRoute,
  receivedBy,
  ref,
  type Context,
  type Item,
} from './shared';

const p = ca.values;
const work = p.eeWork.value;
const procedure = p.eeProcedure.value;
const selection = p.fswSelection.value;
const offers = p.eeOffers.value;

type Answer = boolean | undefined;
type Program = 'CA-EE-FSW' | 'CA-EE-CEC' | 'CA-EE-FST' | 'CA-PNP';
export type Teer = 0 | 1 | 2 | 3 | 4 | 5;
type Education =
  | Exclude<
      keyof typeof selection.education,
      'multiple' | 'mastersOrProfessional'
    >
  | 'multipleIncludingThreeYears'
  | 'masters'
  | 'regulatedTeerOneEntryToPractice';
type Levels = Partial<
  Record<'speaking' | 'listening' | 'reading' | 'writing', number>
>;
export interface LanguageEvidence {
  test?:
    | 'CELPIP-General'
    | 'IELTS General Training'
    | 'PTE Core'
    | 'TEF Canada'
    | 'TCF Canada'
    | 'other';
  resultDate?: string;
  /** The issuing body invalidated this result, independently of its age. */
  revoked?: boolean;
  /** CLB/NCLC equivalents from the approved test's conversion table. */
  levels?: Levels;
}
export interface EducationEvidence {
  /** Highest completed Canadian or assessed equivalent. For multiple credentials,
   * at least two are post-secondary and at least one took three or more years.
   * The professional degree must be an entry-to-practice degree in a regulated
   * TEER 1 occupation under IRPR s78(1)(f), including the licensing condition. */
  level?: Education;
  origin?: 'Canada' | 'foreign';
  ecaDate?: string;
  /** The designated body withdrew the ECA used for this application. */
  ecaRevoked?: boolean;
  /** Designated body, immigration purpose, and applicable professional body. */
  appropriateEca?: boolean;
}
export interface SettlementFunds {
  /** Applicant, partner and both partners' dependent children, including non-accompanying members. */
  familySize?: number;
  availableAtApplication?: number;
  availableAtIssue?: number;
  /** Transferable and unencumbered CAD amounts supported by the bank's evidence. */
  verified?: boolean;
  /** For a visa already issued or a reassessment at issuance. */
  atIssuance?: boolean;
}
export interface WorkPeriod {
  from: string;
  /** Inclusive final date of employment. */
  to: string;
  noc: string;
  teer: Teer;
  /** Actual repeating paid hours, Sunday through Saturday. Split periods at schedule changes or unpaid gaps. */
  dailyHours?: [number, number, number, number, number, number, number];
  /** Lead statement, substantial main duties including all essential duties, unrestricted NOC. */
  dutiesConfirmed?: boolean;
  pay?: 'paid' | 'unpaid' | 'lecturer-stipend';
  canadianEntityPays?: boolean;
  inCanada?: boolean;
  canadianEmployer?: boolean;
  remoteWork?: boolean;
  authorizedTemporaryResident?: boolean;
  fullTimeStudent?: boolean;
  selfEmployed?: boolean;
  /** Official physician public policy recognition, including publicly funded services. */
  physicianException?: boolean;
  /** First date qualified for independent practice in the territory of this job. */
  independentlyQualifiedFrom?: string;
}
export interface OfferEvidence {
  exists?: boolean;
  employers?: number;
  teer?: Teer;
  noc?: string;
  weeklyHours?: number;
  monthsAfterPr?: number;
  permanent?: boolean;
  continuousPaidNonseasonal?: boolean;
  eligibleEmployers?: boolean;
  genuineAndAble?: boolean;
  oldLmiaOrPermitRequirementsMet?: boolean;
  /** Confirmation that the new policy dispenses with the relevant old clauses. */
  policyExemptionConfirmed?: boolean;
  /** Official medical-services exemption from duration and continuity. */
  physicianDurationExemption?: boolean;
  physicianPaidNonseasonal?: boolean;
  fstPermitGroupRequirementsMet?: boolean;
}
export interface ExpressAnswers {
  profileDate?: string;
  profileUpdated?: boolean;
  invitation?: {
    date: string;
    program: Program;
    deadline?: string;
    revoked?: boolean;
  };
  /** Receipt of the application for invitation.program. */
  applicationDate?: string;
  completeElectronicApplication?: boolean;
  /** IRPA s11.2 at ITA and receipt, including an applicable statutory exception. */
  qualificationsRetained?: boolean;
  round?: {
    date: string;
    cutoff?: number;
    /** IRCC CRS for this specific round under the instructions then in force. */
    confirmedCrs?: number;
    /** UTC ISO timestamp of profile and the round's published tie break. */
    profileTimestamp?: string;
    tieBreakTimestamp?: string;
    category?:
      'general' | 'program' | 'french' | 'occupation' | 'military' | 'other';
    occupationCategory?: Exclude<
      keyof typeof p.eeCategorySelection.value.occupations,
      'military'
    >;
    /** Full-time-equivalent months per single NOC during the three years
     * before this round. Each row is the total including nonconsecutive work. */
    categoryExperience?: {
      noc: string;
      months?: number;
      canadianMonths?: number;
    }[];
    military?: {
      servingInRecognizedForeignMilitary?: boolean;
      continuousServiceYears?: number;
      trainedNoc?: string;
      recruitingGroupOfferNoc?: string;
      offerYears?: number;
      continuousFullTimeOfferInCanada?: boolean;
      completedPostsecondaryYears?: number;
      canadianCredentialOrAssessedEquivalent?: boolean;
    };
    /** Confirmation of any additional instructions specific to this round. */
    roundSpecificRequirementsMet?: boolean;
    /** Documentary result for a round whose detailed selection table is not available here. */
    otherCategoryRequirementsConfirmed?: boolean;
  };
  /** Use these if evidence was renewed between profile and filing. */
  profileLanguage?: LanguageEvidence;
  profileEducation?: EducationEvidence;
  primary?: LanguageEvidence;
  secondary?: LanguageEvidence;
  french?: LanguageEvidence;
  education?: EducationEvidence;
  /** Set when claiming CRS for foreign education on a route with no education minimum. */
  usingForeignEducationPoints?: boolean;
  workHistory?: WorkPeriod[];
  primaryNoc?: string;
  /** Verified qualifying years under IRPR s80, including work beyond the primary occupation. */
  fswSelectionWorkYears?: number;
  adaptability?: {
    spouseAccompanying?: boolean;
    spouseLanguage?: LanguageEvidence;
    /** Confirmed s83 factors: eligible two-year full-time Canadian study, at least a year of authorized
     * full-time work (TEER 0–3 for the applicant), or a qualifying Canadian citizen/PR relative aged 18+. */
    applicantStudy?: boolean;
    spouseStudy?: boolean;
    applicantWork?: boolean;
    spouseWork?: boolean;
    qualifyingRelative?: boolean;
  };
  offer?: OfferEvidence;
  certificateForTrade?: boolean;
  tradeEmploymentRequirementsMet?: boolean;
  workAuthorizedInCanada?: boolean;
  fundsExemptionConfirmed?: boolean;
  funds?: SettlementFunds;
  intendsOutsideQuebec?: boolean;
}

const skills = ['listening', 'speaking', 'reading', 'writing'] as const;
export function atLeast(value: number | undefined, threshold: number): Answer {
  return value === undefined ? undefined : value >= threshold;
}
export function levelMet(
  levels: Levels | undefined,
  oral: number,
  written = oral,
): Answer {
  return all(
    ...skills.map((skill) =>
      atLeast(
        levels?.[skill],
        skill === 'reading' || skill === 'writing' ? written : oral,
      ),
    ),
  );
}
function validAt(
  issue: string | undefined,
  when: string | undefined,
  years: number,
): Answer {
  return issue && when
    ? issue <= when && when < addYears(issue, years)
    : undefined;
}
export function languageValid(
  language: LanguageEvidence | undefined,
  when: string | undefined,
): Answer {
  return all(
    language?.test === undefined ? undefined : language.test !== 'other',
    !language?.revoked,
    validAt(language?.resultDate, when, procedure.testYears),
  );
}
export function educationValid(
  education: EducationEvidence | undefined,
  when: string | undefined,
): Answer {
  if (education?.origin === 'Canada') return true;
  if (education?.origin !== 'foreign') return undefined;
  return all(
    education.appropriateEca,
    !education.ecaRevoked,
    validAt(education.ecaDate, when, procedure.ecaYears),
  );
}
export function fundsAssessment(
  funds: SettlementFunds | undefined,
  exempt: Answer,
  when: string,
  table: { amounts: number[]; additional: number; published: string },
) {
  const size = funds?.familySize;
  const amount =
    size && size >= 1
      ? table.amounts[Math.min(size, table.amounts.length) - 1] +
        Math.max(0, size - table.amounts.length) * table.additional
      : undefined;
  // An annual table cannot establish an amount for a different, unverified year.
  const applicable =
    when >= table.published && when.slice(0, 4) <= ca.asOf.slice(0, 4);
  const enough =
    applicable && amount !== undefined
      ? all(
          atLeast(funds?.availableAtApplication, amount),
          funds?.atIssuance ? atLeast(funds.availableAtIssue, amount) : true,
        )
      : undefined;
  return {
    amount: applicable ? amount : undefined,
    ok: any(exempt, funds?.verified ? enough : undefined),
  };
}
const occupations = p.economicOccupations.value;
function tradeNoc(noc: string) {
  return (
    occupations.tradeGroups.some((prefix) => noc.startsWith(prefix)) &&
    !occupations.excludedTradeGroups.some((prefix) => noc.startsWith(prefix))
  );
}
type WorkKind = 'FSW' | 'FSW-selection' | 'CEC' | 'FST' | 'AIP';

function jobQualifies(
  job: WorkPeriod,
  kind: WorkKind,
  primaryNoc: string | undefined,
  when: string,
  ita?: string,
): Answer {
  const paid =
    job.pay === undefined
      ? undefined
      : job.pay === 'paid' ||
        (job.pay === 'lecturer-stipend' &&
          when >= offers.lecturerStipendFrom &&
          job.noc === occupations.lecturer &&
          all(job.inCanada, job.canadianEntityPays));
  if (kind === 'AIP')
    return all(
      job.dutiesConfirmed,
      job.pay === undefined ? undefined : job.pay === 'paid',
      job.teer <= p.atlanticWork.value.maxTeer,
      job.selfEmployed === undefined ? undefined : !job.selfEmployed,
      any(
        job.inCanada === undefined ? undefined : !job.inCanada,
        job.authorizedTemporaryResident,
      ),
    );
  if (kind === 'CEC') {
    const medical =
      occupations.doctors.includes(job.noc) &&
      all(
        ita ? ita >= offers.physicianPolicyFrom : undefined,
        job.physicianException,
      );
    return all(
      paid,
      job.dutiesConfirmed,
      job.teer <= work.skilledTeerMax,
      job.inCanada,
      any(
        job.remoteWork === undefined ? undefined : !job.remoteWork,
        job.canadianEmployer,
      ),
      job.authorizedTemporaryResident,
      job.fullTimeStudent === undefined ? undefined : !job.fullTimeStudent,
      any(
        job.selfEmployed === undefined ? undefined : !job.selfEmployed,
        medical,
      ),
    );
  }
  if (kind === 'FSW-selection')
    return all(paid, job.dutiesConfirmed, job.teer <= work.skilledTeerMax);
  const primary = primaryNoc ? primaryNoc === job.noc : undefined;
  return all(
    primary,
    paid,
    job.dutiesConfirmed,
    kind === 'FSW' ? job.teer <= work.skilledTeerMax : tradeNoc(job.noc),
    kind !== 'FST'
      ? true
      : job.fullTimeStudent === undefined
        ? undefined
        : !job.fullTimeStudent,
  );
}

interface WorkTotals {
  meets: boolean;
  completedYears: number;
  byOccupation: Map<string, { hours: number; teer: Teer }>;
}
/** Use actual work schedules within the lookback. Concurrent jobs share one weekly cap. */
export function workAssessment(
  history: WorkPeriod[] | undefined,
  kind: WorkKind,
  when: string,
  primary?: string,
  ita?: string,
) {
  if (!history)
    return { ok: undefined, leading: undefined, yearsRange: undefined };
  const years = kind === 'FST' ? work.fstYears : 1;
  const window = {
    FSW: work.fswWindow,
    'FSW-selection': work.fswWindow,
    CEC: work.cecWindow,
    FST: work.fstWindow,
    AIP: p.atlanticWork.value.window,
  }[kind];
  const windowStart = addYears(when, -window);
  const periods = history
    .map((job) => {
      const eligible = jobQualifies(job, kind, primary, when, ita);
      const qualified =
        kind === 'FST' ? job.independentlyQualifiedFrom : undefined;
      return {
        job,
        eligible: all(
          eligible,
          kind === 'FST' && !qualified ? undefined : true,
        ),
        from: [windowStart, job.from, qualified ?? windowStart].sort().at(-1)!,
        to: job.to < when ? job.to : addDays(when, -1),
      };
    })
    .filter((row) => row.from <= row.to && row.eligible !== false);
  function count(includeUnconfirmed: boolean): WorkTotals {
    const byOccupation: WorkTotals['byOccupation'] = new Map();
    const days = new Map<string, typeof periods>();
    for (const row of periods) {
      if (!includeUnconfirmed && (row.eligible !== true || !row.job.dailyHours))
        continue;
      for (let d = row.from; d <= row.to; d = addDays(d, 1)) {
        const jobs = days.get(d) ?? [];
        jobs.push(row);
        days.set(d, jobs);
      }
    }
    const occupationWeek = new Map<string, number>();
    let hours = 0,
      weekHours = 0;
    let previous: string | undefined,
      previousWeek: string | undefined,
      start: string | undefined;
    let meets = false;
    for (const date of [...days.keys()].sort()) {
      const weekday = new Date(date + 'T00:00:00Z').getUTCDay();
      const monday = addDays(date, -((weekday + 6) % 7));
      if (previousWeek !== monday) {
        weekHours = 0;
        occupationWeek.clear();
      }
      if (
        !start ||
        (kind === 'FSW' && previous && date !== addDays(previous, 1))
      ) {
        start = date;
        hours = 0;
      }
      let dailyTotal = 0;
      for (const { job } of days.get(date)!) {
        const daily = job.dailyHours?.[weekday] ?? work.weeklyHours;
        dailyTotal += daily;
        const noc = byOccupation.get(job.noc) ?? { hours: 0, teer: job.teer };
        const used = occupationWeek.get(job.noc) ?? 0;
        const credit =
          kind === 'AIP' ? daily : Math.min(daily, work.weeklyHours - used);
        noc.hours += credit;
        occupationWeek.set(job.noc, used + credit);
        byOccupation.set(job.noc, noc);
      }
      const credited =
        kind === 'AIP'
          ? dailyTotal
          : Math.min(dailyTotal, work.weeklyHours - weekHours);
      hours += credited;
      weekHours += credited;
      if (
        hours >= work.annualHours * years &&
        addDays(date, 1) >= addYears(start, years)
      )
        meets = true;
      previous = date;
      previousWeek = monday;
    }
    const completedYears =
      start && previous
        ? Math.min(
            Math.floor(hours / work.annualHours),
            fullYears(start, addDays(previous, 1)),
          )
        : 0;
    return { meets, byOccupation, completedYears };
  }
  const known = count(false);
  const incomplete = periods.some(
    (row) => row.eligible === undefined || !row.job.dailyHours,
  );
  const possible = incomplete ? count(true) : known;
  const max = Math.max(
    0,
    ...[...known.byOccupation.values()].map((o) => o.hours),
  );
  const leading =
    !incomplete && max > 0
      ? [...known.byOccupation.entries()]
          .filter(([, o]) => o.hours === max)
          .map(([noc, o]) => ({ noc, teer: o.teer }))
      : undefined;
  return {
    ok: known.meets ? true : possible.meets ? undefined : false,
    leading,
    yearsRange: { low: known.completedYears, high: possible.completedYears },
  };
}

function offerMet(
  a: ExpressAnswers,
  fst: boolean,
  actualIta: string | undefined,
): Answer {
  const o = a.offer;
  if (o?.exists === false) return false;
  const physician =
    o?.physicianDurationExemption &&
    o.noc &&
    occupations.doctors.includes(o.noc)
      ? o.physicianPaidNonseasonal
      : false;
  const duration =
    o?.permanent === true || atLeast(o?.monthsAfterPr, offers.monthsAfterPr);
  const employerMax = fst ? offers.fstEmployers : offers.fswEmployers;
  const lawful = actualIta
    ? actualIta < offers.lmiaPolicyFrom
      ? o?.oldLmiaOrPermitRequirementsMet
      : any(o?.oldLmiaOrPermitRequirementsMet, o?.policyExemptionConfirmed)
    : o?.oldLmiaOrPermitRequirementsMet || undefined;
  return all(
    o?.exists,
    o?.employers === undefined
      ? undefined
      : o.employers >= 1 && o.employers <= employerMax,
    fst
      ? o?.noc && a.primaryNoc
        ? tradeNoc(o.noc) && o.noc === a.primaryNoc
        : undefined
      : o?.teer === undefined
        ? undefined
        : o.teer <= work.skilledTeerMax,
    atLeast(o?.weeklyHours, work.weeklyHours),
    any(all(o?.continuousPaidNonseasonal, duration), fst ? false : physician),
    o?.eligibleEmployers,
    o?.genuineAndAble,
    lawful,
    fst
      ? any(
          o?.fstPermitGroupRequirementsMet,
          actualIta && actualIta >= offers.lmiaPolicyFrom
            ? o?.policyExemptionConfirmed
            : false,
        )
      : true,
  );
}

function fswScore(
  a: ExpressAnswers,
  birth: string | undefined,
  when: string,
  received: string | undefined,
  offer: Answer,
) {
  let low = 0,
    high = 0;
  function points(n: number | undefined, max: number) {
    low += n ?? 0;
    high += n ?? max;
  }
  const education = a.education;
  const eca = educationValid(education, received);
  const degree = education?.level;
  const band =
    degree === 'masters' || degree === 'regulatedTeerOneEntryToPractice'
      ? 'mastersOrProfessional'
      : degree === 'multipleIncludingThreeYears'
        ? 'multiple'
        : degree;
  const educationPoints =
    band === undefined ? undefined : selection.education[band];
  points(
    eca === false ? 0 : eca === true ? educationPoints : undefined,
    educationPoints ?? selection.education.doctorate,
  );
  const primaryValid = languageValid(a.primary, received);
  for (const skill of skills) {
    const lv = a.primary?.levels?.[skill];
    const rules = selection.firstLanguage;
    const skillPoints =
      lv === undefined
        ? undefined
        : lv < rules.minimum
          ? 0
          : Math.min(rules.maxPoints, rules.initialPoints + lv - rules.minimum);
    points(
      primaryValid === false
        ? 0
        : primaryValid === true
          ? skillPoints
          : undefined,
      skillPoints ?? rules.maxPoints,
    );
  }
  function award(value: Answer, max: number) {
    points(value === undefined ? undefined : value ? max : 0, max);
  }
  award(
    all(
      a.primary?.test && a.secondary?.test
        ? ['TCF Canada', 'TEF Canada'].includes(a.primary.test) !==
            ['TCF Canada', 'TEF Canada'].includes(a.secondary.test)
        : undefined,
      languageValid(a.secondary, received),
      levelMet(a.secondary?.levels, selection.secondLanguage.minimum),
    ),
    selection.secondLanguage.points,
  );
  const years = a.fswSelectionWorkYears;
  // IRPR s80 allows multiple skilled occupations and discontinuous periods.
  // An independently verified s80 total may cover jobs beyond this work diary.
  const workRange =
    years === undefined
      ? workAssessment(a.workHistory, 'FSW-selection', when).yearsRange
      : { low: years, high: years };
  const workPoints = (n: number) =>
    selection.work[Math.min(Math.floor(n), selection.work.length - 1)];
  low += workRange ? workPoints(workRange.low) : 0;
  high += workRange ? workPoints(workRange.high) : selection.work.at(-1)!;
  const age = birth ? fullYears(birth, when) : undefined;
  points(
    age === undefined
      ? undefined
      : age < selection.minAge
        ? 0
        : Math.max(
            0,
            selection.agePoints - Math.max(0, age - selection.fullAgeThrough),
          ),
    selection.agePoints,
  );
  award(offer, selection.arranged);
  const s = selection.adaptability,
    ad = a.adaptability;
  const factors: [Answer, number][] = [
    [
      all(
        ad?.spouseAccompanying,
        languageValid(ad?.spouseLanguage, received),
        levelMet(ad?.spouseLanguage?.levels, s.spouseLanguage),
      ),
      s.otherFactor,
    ],
    [ad?.applicantStudy, s.otherFactor],
    [all(ad?.spouseAccompanying, ad?.spouseStudy), s.otherFactor],
    [ad?.applicantWork, s.applicantWork],
    [all(ad?.spouseAccompanying, ad?.spouseWork), s.otherFactor],
    [offer, s.otherFactor],
    [ad?.qualifyingRelative, s.otherFactor],
  ];
  low += Math.min(
    s.cap,
    factors.reduce((sum, [ok, n]) => sum + (ok === true ? n : 0), 0),
  );
  high += Math.min(
    s.cap,
    factors.reduce((sum, [ok, n]) => sum + (ok !== false ? n : 0), 0),
  );
  return {
    low,
    high,
    ok:
      low >= selection.pass ? true : high < selection.pass ? false : undefined,
  };
}

export function expressChecks({ req, L, check }: Context, id: Program): Item[] {
  const a = req.express ?? {};
  const filed = filingDatesForRoute(req, id).federal;
  const received = receivedBy(filed, req.simulationDate);
  const when = filed ?? req.simulationDate;
  const { round, invitation, profileDate } = a;
  const observedThrough =
    req.simulationDate < ca.asOf ? req.simulationDate : ca.asOf;
  const fsw = id === 'CA-EE-FSW',
    fst = id === 'CA-EE-FST';
  const ee = ref(
    'SRC-269',
    'ee-mi §§2–7, 8–19, 28–32; ee-changes / November instructions',
  );
  const languageSource = ref(
    'SRC-268',
    'ee-language, Language requirements / How long your results are valid for; ee-eca, Who needs an ECA / How long your ECA is valid for',
  );
  const workSource = ref(
    'SRC-261',
    fsw ? 'IRPR §§73, 75–83' : fst ? 'IRPR §87.2(1)–(5)' : 'IRPR §87.1(2)–(3)',
  );
  const workGuide = ref(
    'SRC-267',
    fsw
      ? 'ee-fsw, Minimum requirements / Selection factors'
      : fst
        ? 'ee-fst, Skilled trades work experience / job offer'
        : 'ee-cec, Canadian work experience and language',
  );
  const issuedInvitationDate = receivedBy(invitation?.date, observedThrough);
  const profileValid = validAt(
    profileDate,
    issuedInvitationDate,
    procedure.profileYears,
  );
  // SRC-269e §6 counts from the day after issue through the 60th day after that start.
  const invitationStart = invitation && addDays(invitation.date, 1);
  const deadline =
    invitation?.deadline ??
    (invitationStart && addDays(invitationStart, procedure.invitationDays));
  const invitationValid =
    invitation && issuedInvitationDate && invitationStart
      ? all(
          invitation.program === id,
          !invitation.revoked,
          received && deadline
            ? invitationStart <= received && received <= deadline
            : undefined,
        )
      : undefined;
  const result: Item[] = [
    check(
      'CA-R29',
      L(
        'EE 建档、邀请与正式递交',
        'EE profile, invitation and electronic application',
      ),
      all(
        profileValid,
        a.profileUpdated,
        invitationValid,
        received ? a.completeElectronicApplication : undefined,
        a.qualificationsRetained,
      ),
      L(
        `须在有效 profile 内获本项目邀请，核对邀请未撤销，并按本申请的实际收件日确认是否按期递交。资格须在邀请和收件时均满足。${deadline ? ' 截止日 ' + deadline + '。' : ' 尚需有效邀请及截止日期。'}`,
        `Confirm an active, updated profile, an unrevoked invitation for this class, and the actual receipt date of the complete application. Qualifications must be met at invitation and receipt.${deadline ? ' Deadline ' + deadline + '.' : ' Supply the issued invitation and deadline.'}`,
      ),
      [
        ee,
        ref('SRC-261', 'IRPA §§10.1(1), 10.2(5), 11.2'),
        ref(
          'SRC-277',
          'ee-apply, 1. Fill out the application form; 4. Submit your application',
        ),
      ],
      ['PD-246'],
    ),
  ];
  const actual =
    round &&
    round.date <= observedThrough &&
    (!invitation || invitation.date === round.date);
  let ranking: Answer;
  if (
    actual &&
    round.confirmedCrs !== undefined &&
    round.cutoff !== undefined
  ) {
    if (round.confirmedCrs !== round.cutoff)
      ranking = round.confirmedCrs > round.cutoff;
    else if (round.profileTimestamp && round.tieBreakTimestamp)
      ranking = round.profileTimestamp <= round.tieBreakTimestamp;
  }
  result.push(
    check(
      'CA-R30',
      L(
        '该轮 CRS 排名与同分顺序',
        'CRS ranking and tie break in the selected round',
      ),
      ranking,
      L(
        '以该轮适用部长指令下的 IRCC 分数、已公布的最低分及同分时点核对。11 月新规取加拿大工作经验分（含高薪职业经验分）与合资格高薪工作邀请分中的较高值。已接受的提名由 IRCC 计入总分。未来轮次或未确认新版分数须待核。',
        'Compare IRCC’s score under the instructions for this round with its published cutoff and tie break. The November instructions use the higher of the Canadian work experience score (including high-wage experience) and the score for a qualifying high-wage job offer. Use the score incorporating any accepted nomination. Future rounds and unconfirmed scores remain pending.',
      ),
      [ee, ref('SRC-269', 'ee-rounds; ee-mi §§15–15.2, 28; ee-high-wage')],
      ['PD-246', 'PD-247'],
    ),
  );
  const profileLanguage =
    a.profileLanguage ??
    (a.primary?.resultDate && profileDate && a.primary.resultDate <= profileDate
      ? a.primary
      : undefined);
  const profileEducation =
    a.profileEducation ??
    (a.education?.origin === 'Canada' ||
    (a.education?.ecaDate && profileDate && a.education.ecaDate <= profileDate)
      ? a.education
      : undefined);
  const hasEducation =
    a.profileEducation !== undefined || a.education !== undefined;
  const ecaExempt =
    !fsw &&
    (hasEducation && a.usingForeignEducationPoints === undefined
      ? undefined
      : !a.usingForeignEducationPoints);
  result.push(
    check(
      'CA-R31',
      L('语言测试与适用学历评估的效期', 'Test and applicable ECA validity'),
      all(
        languageValid(profileLanguage, profileDate),
        languageValid(a.primary, received),
        any(
          ecaExempt,
          all(
            educationValid(profileEducation, profileDate),
            educationValid(a.education, received),
          ),
        ),
      ),
      L(
        `核对认可测试在建档与递交时均未满 ${procedure.testYears} 年。用于资格或积分的外国学历评估须来自适用指定机构，两个时点均未满 ${procedure.ecaYears} 年。如报告在建档后换发，请提供建档时的报告。`,
        `Check an approved test less than ${procedure.testYears} years old at profile and filing. A foreign credential relied on for eligibility or points needs an appropriate ECA less than ${procedure.ecaYears} years old at both dates. If the ECA was renewed after profile creation, provide the report used for the profile.`,
      ),
      [languageSource, ref('SRC-261', 'IRPR §§74–75, 79, 87.1–87.2')],
    ),
  );
  let category: Answer;
  if (actual && round.category) {
    if (round.category === 'general' || round.category === 'program')
      category = true;
    else if (round.category === 'french') {
      const french =
        a.french ??
        [a.primary, a.secondary].find(
          (test) => test?.test === 'TEF Canada' || test?.test === 'TCF Canada',
        );
      category = all(
        french?.test === undefined
          ? undefined
          : french.test === 'TEF Canada' || french.test === 'TCF Canada',
        languageValid(french, round.date),
        levelMet(french?.levels, procedure.frenchCategoryLevel),
      );
    } else {
      const rules = p.eeCategorySelection.value;
      if (
        round.date >= rules.currentListFrom &&
        round.category === 'occupation' &&
        round.occupationCategory
      ) {
        const categoryNocs = rules.occupations[round.occupationCategory];
        const canadaOnly = [
          'physicians',
          'seniorManagers',
          'researchers',
        ].includes(round.occupationCategory);
        const duration =
          round.categoryExperience &&
          any(
            ...round.categoryExperience.map(
              (row) =>
                categoryNocs.includes(row.noc) &&
                atLeast(
                  canadaOnly ? row.canadianMonths : row.months,
                  rules.skilledMonths,
                ),
            ),
          );
        category = all(duration, round.roundSpecificRequirementsMet);
      } else if (
        round.date >= rules.currentListFrom &&
        round.category === 'military'
      ) {
        const m = round.military,
          eligible = rules.occupations.military;
        category = all(
          m?.servingInRecognizedForeignMilitary,
          atLeast(m?.continuousServiceYears, rules.militaryServiceYears),
          m?.trainedNoc ? eligible.includes(m.trainedNoc) : undefined,
          m?.recruitingGroupOfferNoc
            ? eligible.includes(m.recruitingGroupOfferNoc)
            : undefined,
          atLeast(m?.offerYears, rules.militaryOfferYears),
          m?.continuousFullTimeOfferInCanada,
          atLeast(m?.completedPostsecondaryYears, rules.militaryEducationYears),
          m?.canadianCredentialOrAssessedEquivalent,
          round.roundSpecificRequirementsMet,
        );
      } else category = round.otherCategoryRequirementsConfirmed;
    }
  }
  result.push(
    check(
      'CA-R32',
      L('邀请类别附加要求', 'Additional category requirements'),
      category,
      L(
        `普通或项目轮次无类别附加门槛；法语类别四项均须 NCLC ${procedure.frenchCategoryLevel}。职业轮次核对公布的 NOC、近 ${p.eeCategorySelection.value.lookbackYears} 年单一职业满 ${p.eeCategorySelection.value.skilledMonths} 个月及该类别地点；军队招募另核服役、报价和学历。还须满足当轮特别指令。`,
        `General and program rounds have no category filter. French rounds require NCLC ${procedure.frenchCategoryLevel} in each skill. Occupation rounds require the published NOC and ${p.eeCategorySelection.value.skilledMonths} months in a single qualifying occupation within ${p.eeCategorySelection.value.lookbackYears} years, in the specified location. Military recruitment has separate service, offer and education conditions. Verify any round-specific instructions.`,
      ),
      [
        ref('SRC-276', 'category-rounds, Who is eligible under each category'),
        ee,
      ],
      ['PD-246'],
    ),
  );
  if (id === 'CA-PNP') return result;

  const actualIta = issuedInvitationDate;
  const experience = workAssessment(
    a.workHistory,
    fsw ? 'FSW' : fst ? 'FST' : 'CEC',
    when,
    a.primaryNoc,
    actualIta,
  );
  const offer = offerMet(a, fst, actualIta);
  if (fsw) {
    result.push(
      check(
        'CA-R33',
        L('FSW 连续技术工作', 'Continuous skilled work for FSW'),
        experience.ok,
        L(
          `近 ${work.fswWindow} 年内同一主要 NOC 的连续合资格带薪工作须满一年和 ${work.annualHours} 小时，每周最多 ${work.weeklyHours} 小时。核对申报职业及实际职责。`,
          `Within ${work.fswWindow} years, show one continuous year and ${work.annualHours} qualifying paid hours in the primary NOC, capped at ${work.weeklyHours} hours per week. Confirm the occupation and duties.`,
        ),
        [workGuide, workSource],
        ['PD-247'],
      ),
    );
    result.push(
      check(
        'CA-R34',
        L('FSW 第一官方语言', 'First official language for FSW'),
        levelMet(a.primary?.levels, p.eeLanguage.value.fsw),
        L(
          `听说读写分别至少 CLB/NCLC ${p.eeLanguage.value.fsw}；请填写官方换算的每项等级。`,
          `Enter each converted level. Listening, speaking, reading and writing must each reach CLB/NCLC ${p.eeLanguage.value.fsw}.`,
        ),
        [languageSource, workSource],
      ),
    );
    result.push(
      check(
        'CA-R35',
        L('FSW 中学以上学历及等值', 'Secondary or higher credential for FSW'),
        all(
          a.education?.level === undefined
            ? undefined
            : a.education.level !== 'none',
          educationValid(a.education, received),
        ),
        L(
          '须有已完成的加拿大中学或以上文凭，或已获适用机构移民用途 ECA 确认的外国等值资格。',
          'Supply a completed Canadian secondary or higher credential or a foreign equivalent assessed for immigration by the appropriate body.',
        ),
        [languageSource, workSource, workGuide],
      ),
    );
    const score = fswScore(a, req.dateOfBirth, when, received, offer);
    result.push(
      check(
        'CA-R36',
        L('FSW 六项选拔分', 'Six FSW selection factors'),
        score.ok,
        L(
          `学历、两种官方语言、工作、年龄、安排就业和适应力合计 ${score.low}–${score.high} 分，门槛 ${selection.pass}。区间反映尚未确认的因素。`,
          `Education, languages, experience, age, arranged employment and adaptability yield ${score.low}–${score.high} points against ${selection.pass}. The interval covers unconfirmed factors.`,
        ),
        [workGuide, workSource],
        ['PD-247'],
      ),
    );
  }
  if (fsw || fst) {
    result.push(
      check(
        'CA-R37',
        L('安排就业与适用豁免', 'Arranged employment and applicable exemption'),
        offer,
        L(
          '查雇主资格、时数、岗位及期限、真实性、履职能力和适用 ITA 的许可或豁免。此项影响选拔分、资金豁免或技工证替代项。',
          'Check employer eligibility, hours, duration, duties, genuineness and the permit or exemption applicable at ITA. This affects points, a funds exemption or the alternative to a trade certificate.',
        ),
        [
          workSource,
          ref('SRC-269', 'ee-lmia-policy Parts 1–2'),
          ref('SRC-277', 'ee-job-offers, What makes a job offer valid'),
          ref('SRC-279', 'ee-doctors Part 1'),
        ],
        ['PD-247'],
        true,
      ),
    );
    const funds = fundsAssessment(
      a.funds,
      all(a.workAuthorizedInCanada, offer, a.fundsExemptionConfirmed),
      when,
      p.eeFunds.value,
    );
    result.push(
      check(
        'CA-R38',
        L('联邦安家资金', 'Federal settlement funds'),
        funds.ok,
        L(
          `按适用家庭人数核对无债务、可转移的资金（申请及发签时）；合法工作及有效报价的豁免须已确认。${funds.amount !== undefined ? ' 当前表要求 CAD ' + funds.amount + '。' : ' 需确认人数与适用年度金额。'}`,
          `Verify transferable, unencumbered funds at application and visa issue, or a confirmed exemption for authorized work and a valid offer.${funds.amount !== undefined ? ' Required CAD ' + funds.amount + '.' : ' Confirm family size and the applicable annual amount.'}`,
        ),
        [
          ref(
            'SRC-268',
            'ee-funds, How much money you need / What we accept as proof',
          ),
          workSource,
        ],
        ['PD-248'],
      ),
    );
  }
  result.push(
    check(
      'CA-R39',
      L('在魁北克以外定居', 'Intent to settle outside Quebec'),
      a.intendsOutsideQuebec,
      L(
        '确认计划定居在魁省以外。在魁省取得的合资格工作仍可计入。',
        'Confirm settlement outside Quebec. Otherwise qualifying work in Quebec can count.',
      ),
      [workGuide, workSource],
      ['PD-250'],
    ),
  );
  if (!fsw && !fst) {
    result.push(
      check(
        'CA-R40',
        L('CEC 在加合资格工作', 'Qualifying Canadian experience for CEC'),
        experience.ok,
        L(
          `近 ${work.cecWindow} 年须累计至少一年、${work.annualHours} 小时在加合法技术工作；自雇、全日制学期间及无授权经历须排查，医师公共政策与讲师报酬须有证据。`,
          `In the last ${work.cecWindow} years show one year and ${work.annualHours} hours of authorized skilled work in Canada. Check self-employment, full-time study, authorization and evidence for physician or lecturer treatment.`,
        ),
        [workSource, workGuide, ref('SRC-279', 'ee-doctors Part 2'), ee],
        ['PD-247'],
      ),
    );
    const levels = a.primary?.levels;
    const needed = experience.leading?.map((o) =>
      o.teer <= work.higherTeerMax
        ? p.eeLanguage.value.cecHigher
        : p.eeLanguage.value.cecOther,
    ) ?? [p.eeLanguage.value.cecHigher, p.eeLanguage.value.cecOther];
    const outcomes = needed.map((min) => levelMet(levels, min));
    const ok = outcomes.every((v) => v === true)
      ? true
      : outcomes.every((v) => v === false)
        ? false
        : undefined;
    result.push(
      check(
        'CA-R41',
        L(
          'CEC 主要经验对应的语言',
          'CEC language for the predominant occupation',
        ),
        ok,
        L(
          `合资格经历最多的职业决定四项门槛，TEER 0–1 为 ${p.eeLanguage.value.cecHigher}，TEER 2–3 为 ${p.eeLanguage.value.cecOther}。各占同量且结论不同需确认。无最低学历、报价或安家资金要求。`,
          `The occupation with the most qualifying experience sets all four thresholds: ${p.eeLanguage.value.cecHigher} for TEER 0–1, ${p.eeLanguage.value.cecOther} for TEER 2–3. A tie affecting the outcome needs clarification. No education, offer or minimum funds requirement applies.`,
        ),
        [workSource, workGuide, languageSource],
        ['PD-249'],
      ),
    );
  }
  if (fst) {
    result.push(
      check(
        'CA-R42',
        L('FST 指定技工及合资格经验', 'Eligible trade and experience for FST'),
        all(
          a.primaryNoc ? tradeNoc(a.primaryNoc) : undefined,
          experience.ok,
          a.tradeEmploymentRequirementsMet,
        ),
        L(
          `近 ${work.fstWindow} 年指定技工须在有独立执业资格后累计 ${work.fstYears} 年、${work.annualHours * work.fstYears} 工时，核对职业职责和就业要求。`,
          `Within ${work.fstWindow} years the listed trade requires ${work.fstYears} years and ${work.annualHours * work.fstYears} hours after qualification for independent practice. Confirm trade duties and employment requirements.`,
        ),
        [workGuide, workSource],
        ['PD-247'],
      ),
    );
    result.push(
      check(
        'CA-R43',
        L(
          '技工资格证或合资格报价',
          'Canadian trade certificate or eligible offer',
        ),
        any(a.certificateForTrade, offer),
        L(
          '须取得加拿大有权机关颁发的对应技工证书，或满足安排就业条件。待审批证书或报价需核。',
          'Supply a matching certificate from the competent Canadian authority or a qualifying offer. Pending decisions need confirmation.',
        ),
        [workGuide, workSource],
        ['PD-247'],
      ),
    );
    result.push(
      check(
        'CA-R44',
        L('FST 口语与书面语言', 'Oral and written proficiency for FST'),
        levelMet(
          a.primary?.levels,
          p.eeLanguage.value.fstOral,
          p.eeLanguage.value.fstWritten,
        ),
        L(
          `听说分别至少 ${p.eeLanguage.value.fstOral}，读写分别至少 ${p.eeLanguage.value.fstWritten}。无最低学历要求。`,
          `Listening and speaking each need ${p.eeLanguage.value.fstOral}, reading and writing each need ${p.eeLanguage.value.fstWritten}. No minimum education applies.`,
        ),
        [workGuide, workSource, languageSource],
      ),
    );
  }
  return result;
}
