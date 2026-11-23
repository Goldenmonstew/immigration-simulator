import {
  germany2026_11,
  germanyFull2026_11,
} from '@uk-immigration/policy-data';
import type { CefrLevel } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addYears, daysBetween, fullYears } from './dates';
import type { DeFullRequest } from './germany-full';
import { householdBudget } from './germany-full-common';
import { all, any, check, src } from './germany-full-shared';
import { afterYears } from './pilot';
import type { IsoDate } from './types';

const p = germanyFull2026_11.values;
const time = germany2026_11.values;
type Answer = boolean | undefined;
type Decision = 'accepted' | 'refused' | 'pending';
// Exact printed AufenthG sections on the exclusion list in § 10(1) no. 2 StAG.
type Title =
  | '16a'
  | '16b'
  | '16d'
  | '16e'
  | '16f'
  | '17'
  | '18f'
  | '19'
  | '19b'
  | '19e'
  | '20'
  | '20a'
  | '22'
  | '23a'
  | '24'
  | '25(3)'
  | '25(4)'
  | '25(5)'
  | '104c'
  | 'permanent-right'
  | 'swiss-agreement'
  | 'blue-card'
  | 'other-eligible'
  | 'excluded-title'
  | 'section-23a-hardship'
  | 'toleration'
  | 'unverified';

interface FullTimeWork {
  workingFullTimeNow?: boolean;
  /** Actual full-time months in the statutory rolling window. */
  monthsInWindow?: number;
}

type CriminalRecord =
  | {
      kind:
        | 'none'
        | 'juvenile-educational-measure'
        | 'pending-proceedings'
        | 'bar-confirmed';
    }
  | { kind: 'foreign-record' | 'security-measure'; disregard?: Decision }
  | {
      /** Final domestic judgments; enter the lesser combined sentence if one was ordered. */
      kind: 'fines';
      dayRates: number[];
      lowerCombinedDayRates?: number;
      judgmentFoundHateMotive?: boolean;
      disregardExcess?: Decision;
    }
  | {
      kind: 'mixed-sentences';
      fineDayRates: number[];
      prisonDays: number;
      allCustodySuspendedAndRemitted?: boolean;
      judgmentFoundHateMotive?: boolean;
      lowerCombinedDays?: number;
      disregardExcess?: Decision;
    }
  | {
      kind: 'custody';
      months: number;
      suspendedAndRemitted?: boolean;
      judgmentFoundHateMotive?: boolean;
      disregardExcess?: Decision;
    };

export interface DeCitizenshipAnswers {
  applicationOn?: IsoDate;
  /** A specifically accelerated § 10(3) application still pending across the repeal. */
  historicAcceleratedApplicationPending?: boolean;
  foreignNationalOrStateless?: boolean;
  identityAndNationalityEstablished?: boolean;
  /** Capacity apart from the minimum age; account for incapacity or court-imposed consent. */
  canActWithoutGuardian?: boolean;
  representedByLaw?: boolean;
  lawfulHabitualResidence?: boolean;
  /** Section on the current permit, an independent right or an individually verified classification. */
  currentTitle?: Title;
  /** Confirmed start of the counted lawful period through the decision date, after § 12b examination. */
  countedResidenceSince?: IsoDate;
  constitutionalAndLoyaltyDeclaration?: boolean;
  historicalResponsibilityDeclaration?: boolean;
  sustainableHouseholdSupport?: boolean;
  withoutSgbIIorXII?: boolean;
  incomeException?: 'none' | 'worker' | 'partner' | 'legacy-worker';
  fullTime?: FullTimeWork;
  partnerFullTime?: FullTimeWork;
  livesWithPartnerAndMinorChild?: boolean;
  exceptionForecastAccepted?: boolean;
  historicalWorker?: {
    kind: 'west-agreement' | 'east-contract' | 'none';
    workerArrivedOn?: IsoDate;
    applicant: 'worker' | 'spouse';
    spouseJoinedInConnection?: boolean;
  };
  benefitsNotAttributable?: boolean;
  germanEvidence?: CefrLevel | 'none' | 'accepted-equivalent' | 'pending';
  ageAppropriateGerman?: boolean;
  oralEverydayGerman?: boolean;
  languageException?:
    | 'none'
    | 'legacy-worker'
    | 'approved-oral-hardship'
    | 'medical-age-accepted'
    | 'pending';
  knowledge?:
    | { kind: 'naturalisation-test' | 'lid'; correct: number }
    | { kind: 'accepted-equivalent' | 'none' | 'pending' };
  criminalRecord?: CriminalRecord;
  exclusionReview?: 'cleared' | 'excluded' | 'pending';
  solemnDeclaration?: boolean;
  certificateHandedOver?: boolean;
  spouse?: {
    status?: 'continuing' | 'died' | 'legally-ended' | 'unrecognised';
    genuineFamilyLife?: boolean;
    /** Effect of prolonged separation on the required residence; omit if no such separation. */
    prolongedSeparationPeriod?: Decision;
    /** Recognition of the marriage or registered partnership and of the partner's German citizenship. */
    recognisedGermanRelationship?: boolean;
    endedOn?: IsoDate;
    sharedGermanChildBornOn?: IsoDate;
    custodyAndFamilyLifeWithChild?: boolean;
    publicInterestShortening?: Decision;
  };
  family?: {
    mainRoute?: 'section-9' | 'section-10';
    relation?: 'spouse-or-registered-partner' | 'child' | 'other';
    mainNaturalisationAndTimelyJointApplication?: boolean;
    actualFamilyLifeSince?: IsoDate;
    custodyAndFamilyLife?: boolean;
    independentlyEligible?: boolean;
    decision?: Decision;
  };
  discretionary?: {
    accommodation?: boolean;
    sustainableSupportIncludingInsurance?: boolean;
    maintenanceWaiver?: Decision | 'none';
    convictionWaiver?: Decision | 'none';
    integrationException?: Decision;
    decision?: Decision;
  };
}

const decision = (value?: Decision | 'none'): Answer =>
  value === 'accepted'
    ? true
    : value === 'refused' || value === 'none'
      ? false
      : undefined;

const ageAt = (birth: IsoDate | undefined, on: IsoDate) =>
  birth && birth <= on ? fullYears(birth, on) : undefined;
const atLeast = (value: number | undefined, minimum: number): Answer =>
  value === undefined ? undefined : value >= minimum;
const below = (value: number | undefined, maximum: number): Answer =>
  value === undefined ? undefined : value < maximum;
const yearsSince = (
  start: IsoDate | undefined,
  end: IsoDate,
  years: number,
): Answer =>
  start === undefined ? undefined : afterYears(start, years) <= end;

function eligibleTitle(title?: Title): Answer {
  if (!title || title === 'unverified') return undefined;
  return [
    'permanent-right',
    'swiss-agreement',
    'blue-card',
    'other-eligible',
  ].includes(title);
}

function historicWorker(w: DeCitizenshipAnswers['historicalWorker']): Answer {
  if (!w) return undefined;
  if (w.kind === 'none') return false;
  const by =
    w.kind === 'west-agreement'
      ? p.legacyWestWorkerArrivalBy
      : p.legacyEastWorkerArrivalBy;
  return all(
    w.workerArrivedOn === undefined ? undefined : w.workerArrivedOn <= by.value,
    w.applicant === 'worker' ? true : w.spouseJoinedInConnection,
  );
}

function fullTime(work?: FullTimeWork): Answer {
  const rule = p.citizenshipFullTime.value;
  const months = work?.monthsInWindow;
  return all(
    work?.workingFullTimeNow,
    months !== undefined && months <= rule.window
      ? atLeast(months, rule.required)
      : undefined,
  );
}

function livelihood(a: DeCitizenshipAnswers, req: DeFullRequest): Answer {
  const ordinary = all(
    a.sustainableHouseholdSupport ?? householdBudget(req),
    a.withoutSgbIIorXII,
  );
  if (ordinary === true) return true;
  let exception: Answer;
  switch (a.incomeException) {
    case 'worker':
      exception = fullTime(a.fullTime);
      break;
    case 'partner':
      exception = all(
        a.livesWithPartnerAndMinorChild,
        fullTime(a.partnerFullTime),
      );
      break;
    case 'legacy-worker':
      exception = all(
        historicWorker(a.historicalWorker),
        a.benefitsNotAttributable,
      );
      break;
    case 'none':
      exception = false;
  }
  const legacy =
    a.applicationOn === undefined
      ? undefined
      : a.applicationOn <= p.legacyLivelihoodApplicationBy.value
        ? a.benefitsNotAttributable
        : false;
  return any(ordinary, all(exception, a.exceptionForecastAccepted), legacy);
}

function languageAndKnowledge(
  a: DeCitizenshipAnswers,
  age: number | undefined,
  capacity: Answer,
) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const e = a.germanEvidence;
  const certificate =
    e === undefined || e === 'pending'
      ? undefined
      : e === 'accepted-equivalent' ||
        levels.indexOf(e) >= levels.indexOf(p.citizenshipLanguageLevel.value);
  const child = all(
    below(age, p.citizenshipProcedureAge.value),
    a.ageAppropriateGerman,
  );
  const k = a.knowledge;
  let knowledge: Answer;
  if (k?.kind === 'lid' || k?.kind === 'naturalisation-test') {
    const test = p.citizenshipKnowledgeTest.value;
    if (
      Number.isInteger(k.correct) &&
      k.correct >= 0 &&
      k.correct <= test.total
    )
      knowledge = k.correct >= test.required;
  } else if (k?.kind === 'accepted-equivalent' || k?.kind === 'none')
    knowledge = k.kind === 'accepted-equivalent';
  let oralException: Answer;
  let medical: Answer;
  if (a.languageException && a.languageException !== 'pending') {
    medical = a.languageException === 'medical-age-accepted';
    oralException =
      a.languageException === 'legacy-worker'
        ? historicWorker(a.historicalWorker)
        : a.languageException === 'approved-oral-hardship';
  }
  return {
    language: any(
      certificate,
      child,
      medical,
      all(oralException, a.oralEverydayGerman),
    ),
    knowledge: any(
      knowledge,
      capacity === undefined ? undefined : !capacity,
      medical,
      oralException,
    ),
  };
}

function criminalRecord(record?: CriminalRecord): Answer {
  switch (record?.kind) {
    case 'none':
    case 'juvenile-educational-measure':
      return true;
    case 'bar-confirmed':
      return false;
    case 'foreign-record':
    case 'security-measure':
      return decision(record.disregard);
    case 'fines':
    case 'mixed-sentences':
    case 'custody': {
      const limit = p.citizenshipConvictions.value;
      const noHateMotive =
        record.judgmentFoundHateMotive === undefined
          ? undefined
          : !record.judgmentFoundHateMotive;
      let total: number;
      let remitted: Answer = true;
      if (record.kind === 'custody') {
        remitted = record.suspendedAndRemitted;
        total = record.months * (limit.fineDayRates / limit.probationMonths);
      } else if (record.kind === 'mixed-sentences') {
        remitted = record.allCustodySuspendedAndRemitted;
        total =
          record.lowerCombinedDays ??
          record.fineDayRates.reduce((sum, n) => sum + n, record.prisonDays);
      } else {
        if (!record.dayRates.length) return all(noHateMotive, undefined);
        total =
          record.lowerCombinedDayRates ??
          record.dayRates.reduce((a, b) => a + b, 0);
      }
      if (total > limit.fineDayRates + limit.minorExcessDayRates) return false;
      return all(
        noHateMotive,
        remitted,
        total <= limit.fineDayRates || decision(record.disregardExcess),
      );
    }
    default:
      return undefined;
  }
}

/** Use a confirmed § 12b period for rights outside the permit timeline (e.g. Swiss rights).
 * Changes to the public-interest period require an individual decision. A terminated
 * relationship cannot acquire extra marriage years after the death/final order. */
export function citizenshipTimeOverride(
  route: string,
  req: DeFullRequest,
  pilotResidence?: boolean,
  pilotDate?: IsoDate,
): Answer | 'pilot' {
  const a = req.citizenship ?? {};
  const sim = req.simulationDate;
  if (route === 'R07') {
    if (sim < time.fiveYearsFrom.value) return undefined;
    // PD-129: no specific transitional rule for a still-pending accelerated
    // application. Filing alone does not keep the abolished route available.
    const pendingOldCase =
      a.historicAcceleratedApplicationPending === true &&
      (a.applicationOn === undefined ||
        (a.applicationOn >= time.fiveYearsFrom.value &&
          a.applicationOn < time.turboAbolishedFrom.value));
    if (!a.countedResidenceSince) {
      if (
        pilotResidence !== true &&
        (a.currentTitle === 'permanent-right' ||
          a.currentTitle === 'swiss-agreement')
      )
        return undefined;
      if (
        pilotResidence !== true &&
        (pendingOldCase || sim < time.turboAbolishedFrom.value)
      )
        return undefined;
      return 'pilot';
    }
    const due = afterYears(
      a.countedResidenceSince,
      time.naturalisationYears.value.general,
    );
    if (due <= sim) return true;
    if (pendingOldCase || sim < time.turboAbolishedFrom.value) return undefined;
    // Keep the projection only when both timelines give the same due date.
    return pilotResidence === false && due === pilotDate ? 'pilot' : false;
  }
  if (route !== 'R08') return 'pilot';
  const s = a.spouse;
  const ended = s?.status === 'died' || s?.status === 'legally-ended';
  if (!ended && !a.countedResidenceSince && !s?.publicInterestShortening) {
    if (
      pilotResidence !== true &&
      (a.currentTitle === 'permanent-right' ||
        a.currentTitle === 'swiss-agreement')
    )
      return undefined;
    return 'pilot';
  }
  const end = ended ? s?.endedOn : sim;
  const since =
    req.marriedOn &&
    req.spouseGermanSince &&
    req.spouseGermanSince > req.marriedOn
      ? req.spouseGermanSince
      : req.marriedOn;
  const years = time.naturalisationYears.value.spouse;
  const ordinary = a.countedResidenceSince
    ? yearsSince(a.countedResidenceSince, sim, years)
    : pilotResidence;
  const marriage =
    end && end <= sim
      ? yearsSince(since, end, time.spouseMarriageYears.value)
      : undefined;
  const reduced =
    s?.publicInterestShortening === undefined
      ? false
      : all(
          decision(s.publicInterestShortening),
          end
            ? yearsSince(
                req.marriedOn,
                end,
                p.citizenshipSpouseException.value.publicInterestMarriageYears,
              )
            : undefined,
        );
  return all(marriage, any(ordinary, reduced));
}

function familyChecks(
  a: DeCitizenshipAnswers,
  req: DeFullRequest,
  age: number | undefined,
) {
  const f = a.family;
  let relation: Answer;
  let guidance: Answer;
  const g = p.citizenshipFamilyGuidance.value;
  const sim = req.simulationDate;
  if (f?.relation === 'other') relation = false;
  if (f?.relation === 'spouse-or-registered-partner') {
    relation =
      f.mainRoute === undefined ? undefined : f.mainRoute === 'section-10';
    guidance = all(
      yearsSince(a.countedResidenceSince, sim, g.spouseYears),
      yearsSince(f.actualFamilyLifeSince, sim, g.relationshipYears),
    );
  }
  if (f?.relation === 'child') {
    relation = all(
      below(age, p.citizenshipMinorAge.value),
      f.mainRoute === undefined ? undefined : true,
    );
    if (age !== undefined && age >= p.citizenshipProcedureAge.value)
      guidance = f.independentlyEligible;
    else if (age !== undefined) {
      let residence = yearsSince(a.countedResidenceSince, sim, g.childYears);
      if (age < g.youngChildAge && req.birthDate && a.countedResidenceSince) {
        const lifeDays = daysBetween(req.birthDate, sim);
        residence =
          daysBetween(a.countedResidenceSince, sim) >=
          lifeDays * g.youngChildLifeShare;
      }
      guidance = all(f.custodyAndFamilyLife, residence);
    }
  }
  return {
    family: all(relation, f?.mainNaturalisationAndTimelyJointApplication),
    guidance,
  };
}

// These checks describe procedure and administrative guidance. The actual exercise
// of discretion is a separate eligibility check on R16 and R17.
export const citizenshipAdvisoryIds = new Set<string>([
  'DE-C46-application',
  'DE-C54',
  'DE-C58-guidance',
  'DE-C61-guidance',
]);

export function citizenshipChecks(
  route: string,
  req: DeFullRequest,
): CountryCheck[] {
  const a = req.citizenship ?? {};
  const sim = req.simulationDate;
  const age = ageAt(req.birthDate, sim);
  const adultProcedure = p.citizenshipProcedureAge.value;
  const capacity = (on: IsoDate) =>
    all(
      atLeast(ageAt(req.birthDate, on), adultProcedure),
      a.canActWithoutGuardian,
    );
  const capable = capacity(sim);
  const statutoryCapacity = any(
    capacity(a.applicationOn ?? sim),
    a.representedByLaw,
  );
  const exemptFromDeclaration = capable === undefined ? undefined : !capable;
  const { language, knowledge } = languageAndKnowledge(a, age, capable);
  const d = a.discretionary;
  let convictions = criminalRecord(a.criminalRecord);
  if (route === 'R17' && a.criminalRecord?.kind !== 'pending-proceedings') {
    convictions = any(convictions, decision(d?.convictionWaiver));
  }
  const checks: CountryCheck[] = [];
  const add = (
    id: string,
    zh: string,
    en: string,
    met: Answer,
    refs: CountryCheck['sources'],
    pd: string,
    detail: readonly [string, string],
  ) =>
    checks.push(
      check(req.locale ?? 'zh-CN', 'DE-' + id, zh, en, met, refs, pd, detail),
    );
  add(
    'C46',
    '身份、国籍和代理权',
    'Identity, nationality and representation',
    all(
      a.foreignNationalOrStateless,
      a.identityAndNationalityEstablished,
      statutoryCapacity,
    ),
    [
      src(101, '§§ 8 Abs. 1, 10 Abs. 1 Satz 1, 34'),
      src(106, 'Nr. 10.1.0; Nr. 10.1 Rdn. 137'),
    ],
    'PD-340',
    [
      '核对外国国籍或获认定的无国籍身份、身份证明，以及申请时的行为能力或法定代理。',
      'Check foreign nationality or recognised statelessness, identity evidence and capacity or legal representation at filing.',
    ],
  );
  add(
    'C46-application',
    '提出入籍申请',
    'Filing the application',
    a.applicationOn === undefined ? undefined : a.applicationOn <= sim,
    [src(101, '§§ 8 Abs. 1, 10 Abs. 1 Satz 1')],
    'PD-340',
    [
      '以实际递交日期核对申请手续。',
      'Compare the actual filing date with the assessment date.',
    ],
  );
  add(
    'C52',
    '刑事记录及待决程序',
    'Convictions and pending proceedings',
    convictions,
    [
      src(101, '§§ 8 Abs. 1 Nr. 2, Abs. 2; 10 Abs. 1 Nr. 5; 12a Abs. 1–4'),
      ...p.citizenshipConvictions.sources,
      src(424, 'BZRG §§ 46, 51, 52'),
    ],
    'PD-345',
    [
      `核对合并刑量、判决载明的仇恨动机、缓刑期满免刑和境外记录。按 BMI 指引，罚金超过 ${p.citizenshipConvictions.value.fineDayRates} 个日额时，只有超出不多于 ${p.citizenshipConvictions.value.minorExcessDayRates} 个日额才可由机关决定是否忽略。侦查或判决未生效须等待。`,
      `Check aggregate sentences, a hate motive found in the judgment, remission after probation and foreign records. Under BMI guidance, the authority may disregard a fine above ${p.citizenshipConvictions.value.fineDayRates} day rates only if the excess is at most ${p.citizenshipConvictions.value.minorExcessDayRates} day rates. Pending proceedings suspend the decision.`,
    ],
  );
  add(
    'C53',
    '法定排除及安全核查',
    'Statutory exclusions and security review',
    a.exclusionReview === 'cleared'
      ? true
      : a.exclusionReview === 'excluded'
        ? false
        : undefined,
    [src(101, '§§ 11 Satz 1 Nr. 1–3, 37'), src(100, '§ 54 Abs. 1 Nr. 2, 4')],
    'PD-345',
    [
      '机关核对危害宪制活动及可信脱离、虚假声明、严重驱逐事由、多重婚姻及违反性别平等的行为。',
      'The authority assesses anti-constitutional activities or credible disengagement, false declarations, serious expulsion grounds, plural marriage and disregard for gender equality.',
    ],
  );
  add(
    'C54',
    '庄严声明及证书交付',
    'Solemn declaration and certificate delivery',
    all(
      any(exemptFromDeclaration, a.solemnDeclaration),
      a.certificateHandedOver,
    ),
    [
      src(101, '§ 16 Sätze 1–3; § 10 Abs. 1 Satz 2'),
      src(105, 'Art. 1 Nr. 6, Art. 6 Abs. 1'),
    ],
    'PD-358',
    [
      '适用者在交付证书前声明，证书交付时生效。',
      'Where required, the declaration precedes delivery. Citizenship takes effect on delivery of the certificate.',
    ],
  );
  if (route === 'R17') {
    add(
      'C59',
      '合法惯常居住及住宿',
      'Lawful habitual residence and accommodation',
      all(a.lawfulHabitualResidence, d?.accommodation),
      [src(101, '§ 8 Abs. 1 Nr. 3'), src(106, 'Nr. 8.1.1')],
      'PD-348',
      [
        '确认在德合法惯常居住且有自己的住所或可实际使用的住宿。',
        'Confirm lawful habitual residence in Germany and an existing home or available accommodation.',
      ],
    );
    add(
      'C60',
      '本人和亲属的长期供养',
      'Long-term maintenance of self and dependants',
      any(
        d?.sustainableSupportIncludingInsurance,
        decision(d?.maintenanceWaiver),
      ),
      [
        src(101, '§ 8 Abs. 1 Nr. 4, Abs. 2'),
        src(106, 'Nr. 8.1.1 Rdn. 13–19; Nr. 8.2 Rdn. 69 ff.'),
      ],
      'PD-341',
      [
        '核对稳定收入、资产或可执行扶养款及疾病、护理、养老风险；豁免需公共利益或特别困难的个案认定。',
        'Check sustainable income, assets or enforceable maintenance and provision for illness, care and old age. A waiver requires an individual public-interest or hardship decision.',
      ],
    );
    const ordinaryDuration = any(
      below(age, adultProcedure),
      yearsSince(
        a.countedResidenceSince,
        sim,
        time.naturalisationYears.value.general,
      ),
    );
    add(
      'C61-guidance',
      '通常整合标准',
      'Usual integration guidance',
      any(
        all(
          ordinaryDuration,
          language,
          knowledge,
          a.currentTitle === 'section-23a-hardship'
            ? true
            : eligibleTitle(a.currentTitle),
        ),
        decision(d?.integrationException),
      ),
      [src(106, 'Nr. 8.1.2 Rdn. 20–37 (pp24–28)')],
      'PD-359',
      [
        '分别核对指引通常要求的居住期、居留身份、语言、公民知识及个案例外。',
        'The guidance considers residence, status, language and civic knowledge, subject to individual exceptions.',
      ],
    );
    add(
      'C62',
      '裁量入籍决定',
      'Discretionary naturalisation decision',
      decision(d?.decision),
      [src(101, '§ 8 Abs. 1'), src(106, 'Nr. 8.1.2, Nr. 8.2')],
      'PD-359',
      [
        '法定前提齐备后仍需机关作出裁量决定。',
        'The authority must exercise discretion even when the statutory prerequisites are met.',
      ],
    );
    return checks;
  }
  add(
    'C47',
    '惯常居住与完成日的居留身份',
    'Habitual residence and status at naturalisation',
    all(a.lawfulHabitualResidence, eligibleTitle(a.currentTitle)),
    [
      src(101, '§§ 10 Abs. 1 Satz 1 Nr. 2, 12b, 16'),
      src(106, 'Nr. 10.1.2 Rdn. 59'),
    ],
    'PD-122',
    [
      '确认德国生活中心及决定时的永久权、瑞士协定许可、蓝卡或清单以外的适格许可。仅凭居留卡名称或待批文书不能判断。',
      'Confirm the centre of life in Germany and a permanent right, Swiss-agreement permit, Blue Card or other qualifying status at decision. An unidentified card or provisional document needs review.',
    ],
  );
  add(
    'C48',
    '宪制、忠诚及历史责任声明',
    'Constitutional, loyalty and historical-responsibility declarations',
    any(
      exemptFromDeclaration,
      all(
        a.constitutionalAndLoyaltyDeclaration,
        a.historicalResponsibilityDeclaration,
      ),
    ),
    [
      src(101, '§ 10 Abs. 1 Satz 1 Nr. 1, 1a, Sätze 2–3; § 11'),
      src(106, 'Nr. 10.1.1 Rdn. 14; Rdn. 137'),
    ],
    'PD-358',
    [
      '核对本人对自由民主宪制、历史责任和保护犹太生活等事项的真实声明及行为能力。',
      'Check personal, truthful declarations on the democratic constitutional order, historical responsibility and protection of Jewish life, subject to capacity.',
    ],
  );
  add(
    'C49',
    '家庭生计及法定福利例外',
    'Family maintenance and statutory benefit exceptions',
    livelihood(a, req),
    [
      src(101, '§ 10 Abs. 1 Satz 1 Nr. 3a–c; § 40a'),
      src(106, 'Nr. 10.1.3 Rdn. 61–121'),
    ],
    'PD-358',
    [
      `核对家庭生计、SGB II/XII、历史劳工及过渡申请；全职例外要求决定时为全职并在近 ${p.citizenshipFullTime.value.window} 个月中全职至少 ${p.citizenshipFullTime.value.required} 个月，另看持续性。`,
      `Check family support, SGB II/XII, historical workers and transitional filings. The work exception requires full time at decision and at least ${p.citizenshipFullTime.value.required} of the last ${p.citizenshipFullTime.value.window} months, with a sustainable outlook.`,
    ],
  );
  add(
    'C50',
    '德语证明或适用豁免',
    'German language evidence or exemption',
    language,
    [
      src(101, '§ 10 Abs. 1 Nr. 6, Abs. 4, 4a, 6'),
      src(106, 'Nr. 10.4, 10.4a, 10.6'),
    ],
    'PD-347',
    [
      `通常须有 ${p.citizenshipLanguageLevel.value} 或认可的同等证明；完成时未满 ${adultProcedure} 岁可用年龄相称的语言发展，另核口语及医学／年龄例外。`,
      `Normally ${p.citizenshipLanguageLevel.value} or accepted equivalent. Age-appropriate development may suffice before age ${adultProcedure}; oral and medical/age exceptions depend on the evidence.`,
    ],
  );
  add(
    'C51',
    '公民知识及入籍考试',
    'Civic knowledge and naturalisation test',
    knowledge,
    [
      src(101, '§ 10 Abs. 1 Nr. 7, Satz 2, Abs. 5–7'),
      ...p.citizenshipKnowledgeTest.sources,
      src(414, 'Nachweis der staatsbürgerlichen Kenntnisse'),
    ],
    'PD-347',
    [
      `入籍考试或 LiD 需 ${p.citizenshipKnowledgeTest.value.total} 题中至少答对 ${p.citizenshipKnowledgeTest.value.required} 题；认可的学校证明或法定豁免也可满足。`,
      `At least ${p.citizenshipKnowledgeTest.value.required} of ${p.citizenshipKnowledgeTest.value.total} correct in the naturalisation test or LiD. Accepted educational evidence or a statutory exemption also suffices.`,
    ],
  );
  if (route === 'R08') {
    const s = a.spouse;
    const ended = s?.status === 'died' || s?.status === 'legally-ended';
    add(
      'C56',
      '与德国公民的法定关系和实际家庭生活',
      'Recognised relationship and family life with a German citizen',
      all(
        s?.status === undefined ? undefined : s.status !== 'unrecognised',
        s?.recognisedGermanRelationship,
        s?.genuineFamilyLife,
        s?.prolongedSeparationPeriod === undefined
          ? true
          : decision(s.prolongedSeparationPeriod),
      ),
      [
        src(101, '§ 9 Abs. 1 Sätze 1–4, Abs. 2'),
        src(106, 'Nr. 9.0–9.1 Rdn. 1–8 (pp41–43)'),
      ],
      'PD-352',
      [
        '核对认可的婚姻或登记伴侣关系及共同生活。关系结束时核对结束前的情况，长期分居影响居住期。',
        'Confirm a recognised marriage or registered partnership and genuine family life. For an ended relationship examine the period before its end. Prolonged separation affects residence.',
      ],
    );
    const deadline =
      s?.endedOn && a.applicationOn
        ? s.endedOn <= a.applicationOn &&
          a.applicationOn <= sim &&
          a.applicationOn <=
            addYears(
              s.endedOn,
              p.citizenshipSpouseException.value.endedApplicationYears,
            )
        : undefined;
    add(
      'C57',
      '配偶死亡或关系依法终结的特例',
      'Exception after death or legal termination',
      s?.status === 'continuing'
        ? true
        : ended
          ? all(
              deadline,
              below(
                ageAt(s.sharedGermanChildBornOn, sim),
                p.citizenshipMinorAge.value,
              ),
              s.custodyAndFamilyLifeWithChild,
            )
          : undefined,
      [src(101, '§ 9 Abs. 2'), src(106, 'Nr. 9.2 Rdn. 9–10 (p43)')],
      'PD-352',
      [
        '关系仍存续时适用通常路径；关系终结后核对一年内递交、监护及与双方未成年德国籍子女的实际家庭生活。',
        'For an ongoing relationship the ordinary branch applies. After its end check filing within one year, custody and family life with a shared minor German child.',
      ],
    );
  }
  if (route === 'R16') {
    const f = familyChecks(a, req, age);
    const refs = [
      src(101, '§ 10 Abs. 2; § 9 Abs. 1 Satz 3'),
      ...p.citizenshipFamilyGuidance.sources,
    ];
    add(
      'C58',
      '主申请关联、关系及子女年龄',
      'Principal application, relationship and child age',
      f.family,
      refs,
      'PD-359',
      [
        '核对主申请人的路径与入籍、随同申请是否及时以及适用的亲属关系。',
        'Check the principal naturalisation, timely linked application and the family relationship eligible under that route.',
      ],
    );
    add(
      'C58-guidance',
      '随同入籍的居住和家庭指引',
      'Residence and family guidance for joint naturalisation',
      f.guidance,
      refs,
      'PD-359',
      [
        '配偶核对居住和关系年限；子女按完成日年龄核对半生、通常居住年限或独立资格。',
        'For a partner check residence and relationship duration. For a child assess half a lifetime, ordinary residence duration or independent eligibility according to age at completion.',
      ],
    );
    add(
      'C58-decision',
      '家属随同入籍裁量',
      'Discretion on joint naturalisation',
      decision(a.family?.decision),
      refs,
      'PD-359',
      [
        '家属须各自符合条件，并由机关裁定是否准予随同入籍。',
        'Each relative must meet their own conditions and receive an individual decision on joint naturalisation.',
      ],
    );
  }
  return checks;
}
