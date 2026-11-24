import {
  ireland2026_11 as pilot,
  irelandFull2026_11 as full,
} from '@uk-immigration/policy-data';
import { addDays, addYears, daysBetween } from '../dates';
import { evaluateIreland, permissionValidity, RECKONABLE } from '../ireland';
import type { IeRequest, IeTrip } from '../ireland';
import { Days } from '../pilot';
import type { IsoDate } from '../types';
import { ageAtLeast, all, covers, mergePeriods } from './common';
import type {
  IrelandAssessment,
  IrelandCharacter,
  IrelandResidencePeriod,
  IrelandRegistration,
} from './common';

const p = full.naturalisation;

type Place = 'state' | 'northern-ireland' | 'elsewhere';
type IdentityDocument =
  | 'validPassport'
  | 'irp'
  | 'licence'
  | 'servicesCard'
  | 'ppsLetter'
  | 'euId'
  | 'protectionId';

export interface IrelandCitizenship {
  entitlement?:
    'none' | 'already-citizen' | 'birth-descent-or-fbr' | 'uncertain';
  recognisedEarlyMarriage?: boolean;
  character?: IrelandCharacter;
  vetting?: 'completed' | 'authorised' | 'outstanding' | 'pending-review';
  vettingRequired?: boolean;
  intendToReside?: Place;
  willingToDeclare?: boolean;
  declarationCompleted?: boolean;
  approvedAlternativeDeclaration?: boolean;
  identityDocuments?: IdentityDocument[];
  passportExpiredOn?: IsoDate;
  alternativeIdentityEvidence?: boolean;
  birthCertificateOrAcceptedAlternative?: boolean;
  prescribedFormAndWitness?: boolean;
  refereeCount?: number;
  /** One row for every evidence year requested by ISD. Count distinct eligible documents in the applicant's name. */
  residenceEvidence?: {
    requiredYears: number[];
    years: { year: number; strong: number; supporting: number }[];
    affidavit?: boolean;
  };
  applicationFeePrepared?: boolean;
  approved?: boolean;
  certificateFeePaid?: boolean;
  certificateIssuedOn?: IsoDate;
  survivorFeeConditions?: boolean;
  additionalEvidence?: {
    requestedOn: IsoDate;
    deadline?: IsoDate;
    suppliedOn?: IsoDate;
  };
  addressUpdated?: boolean;
  /** Actual legal and factual residence. Record permission validity and trips separately. */
  residence?: (IrelandResidencePeriod & {
    basis: 'reckonable' | 'excluded' | 'uncertain';
  })[];
  /** Verified dates of reckonable legal residence without an IRP, including any trip being supported. */
  unregisteredResidenceEvidence?: (IrelandResidencePeriod & { to: IsoDate })[];
  spouse?: {
    relationship?: 'spouse' | 'civil-partner' | 'de-facto' | 'ended';
    irishCitizen?: boolean;
    recognised?: boolean;
    livingTogether?: boolean;
    affidavit?: boolean;
    jointAddressEvidenceMonths?: number;
    jointAddressDocuments?: number;
    /** Validated s15A(4) periods with an Irish citizen spouse in the public service abroad. */
    postingPeriods?: IrelandResidencePeriod[];
    postingUnconfirmed?: boolean;
    waiver?: 'none' | 'pending' | 'denied' | 'granted';
    waivedConditions?: ('marriage' | 'continuous' | 'prior' | 'intent')[];
  };
  minor?: {
    authorisedRepresentative?: boolean;
    listedSeriousOffence?: boolean;
    backgroundFormPrepared?: boolean;
    characterWaived?: boolean;
    declarationWaived?: boolean;
    naturalisedParentCertificateOn?: IsoDate;
    relationshipAndConsentEvidence?: boolean;
    childResidenceAndSchoolEvidence?: boolean;
    parentRouteWaiverGranted?: boolean;
  };
  association?: {
    qualifyingRelationship?: boolean;
    relativeEligibleAtRelevantDate?: boolean;
    waiverGranted?: boolean;
    evidence?: {
      residenceYears: number;
      taxResident: boolean;
      currentlyResident: boolean;
      /** Visits in the applicable lookback. */
      visits: number;
      residentFamily: boolean;
      significantContribution: boolean;
      nfqLevel?: number;
      juniorCertificate: boolean;
      leavingCertificate: boolean;
      irishInsurance: boolean;
      prsiContributions: number;
      irishPension: boolean;
      fullIrishLicence: boolean;
      activeIrishBank: boolean;
    };
  };
  protection?: {
    kind?:
      | 'convention-refugee'
      | 'programme-refugee'
      | 'stateless'
      | 'subsidiary'
      | 'pending'
      | 'none';
    grantOn?: IsoDate;
    validRecognition?: boolean;
    identityEvidence?: {
      nationalPassportUnavailable?: boolean;
      certifiedIrishTravelDocument?: boolean;
      refugeeStatusLetter?: boolean;
      /** The official passport affidavit is complete and signed before a legal witness. */
      witnessedPassportAffidavit?: boolean;
    };
    certificationFeeExemptionConfirmed?: boolean;
    /** Confirm an official decision waiving the residence requirements. */
    waiverGranted?: boolean;
    waiverPending?: boolean;
    /** Omit for a decision waiving both residence requirements. */
    waivedResidenceConditions?: ('continuous' | 'prior')[];
  };
  publicService?: {
    qualifyingIrishPublicAppointment?: boolean;
    residesAbroadDuringService?: boolean;
    appointmentEvidence?: boolean;
    waiverGranted?: boolean;
  };
}

export type IrelandNaturalisationPath =
  | 'IE-NATURALISATION'
  | 'IE-SPOUSE'
  | 'IE-MINOR-BORN-IN-STATE'
  | 'IE-MINOR-NATURALISED-PARENT'
  | 'IE-IRISH-ASSOCIATIONS'
  | 'IE-PROTECTION'
  | 'IE-PUBLIC-SERVICE';

function identityScore(c: IrelandCitizenship, day: IsoDate) {
  const params = p.identity.value;
  if (!c.identityDocuments && !c.passportExpiredOn) return undefined;
  const expiredDays = c.passportExpiredOn
    ? daysBetween(c.passportExpiredOn, day)
    : undefined;
  const documents = new Set(c.identityDocuments ?? []);
  const knownPoints = [...documents].reduce((sum, doc) => sum + params[doc], 0);
  if (knownPoints >= params.minimum) return knownPoints;
  if (
    expiredDays === params.expiredBoundaryDays &&
    !documents.has('validPassport')
  )
    return undefined;
  return (
    knownPoints +
    (expiredDays === undefined ||
    expiredDays < 0 ||
    documents.has('validPassport')
      ? 0
      : expiredDays < params.expiredBoundaryDays
        ? params.expiredRecent
        : params.expiredOlder)
  );
}

function tripPeriods(trips: IeTrip[]) {
  return trips.map((trip) => ({
    from: addDays(trip.departed, 1),
    to: addDays(trip.returned, -1),
  }));
}

function residenceWithTrips(c: IrelandCitizenship, req: IeRequest) {
  let residence = c.residence;
  if (!residence || !req.trips.length) return residence;
  const day = req.simulationDate;
  const away = mergePeriods(tripPeriods(req.trips), day);
  const ranges = mergePeriods(residence.filter(({ basis }) => basis !== 'excluded'), day);
  const permissions = permissionValidity(req.permissions);
  const reckonable = permissions.filter(({ kind }) => RECKONABLE.includes(kind));
  const excluded = [
    ...residence.filter(({ basis }) => basis === 'excluded'),
    ...permissions.filter(({ kind }) => kind === 'ni-residence'),
  ];
  const supported = away.map(({ from, to }) => {
    const departed = addDays(from, -1);
    const returned = addDays(to, 1);
    return covers(reckonable, departed, returned) ||
      covers(c.unregisteredResidenceEvidence ?? [], departed, returned);
  });

  // A merged residence period does not itself establish legal cover while abroad.
  for (const [i, { from, to }] of away.entries()) {
    if (supported[i] || !covers(ranges, addDays(from, -1), addDays(to, 1))) continue;
    residence = residence.flatMap((period): NonNullable<IrelandCitizenship['residence']> => {
      if (period.basis !== 'reckonable' || period.from > to ||
        (period.to && period.to < from)) return [period];
      return [
        ...(period.from < from ? [{ ...period, to: addDays(from, -1) }] : []),
        {
          from: period.from > from ? period.from : from,
          to: period.to && period.to < to ? period.to : to,
          basis: 'uncertain',
        },
        ...(!period.to || period.to > to ? [{ ...period, from: addDays(to, 1) }] : []),
      ];
    });
  }
  const confirmed = residence.filter(({ basis }) => basis === 'reckonable');
  const gaps: NonNullable<IrelandCitizenship['residence']> = [];
  for (let i = 1; i < ranges.length; i++) {
    const departed = ranges[i - 1].to;
    const returned = ranges[i].from;
    const from = addDays(departed, 1);
    const to = addDays(returned, -1);
    const trip = away.findIndex((period) => period.from <= from && period.to >= to);
    if (
      trip === -1 ||
      excluded.some(
        (period) => period.from <= to && (!period.to || period.to >= from),
      )
    ) continue;
    // Travel explains the physical gap. Count it as legally covered only
    // when reckonable residence on both sides and legal cover throughout agree.
    const basis = covers(confirmed, departed, departed) &&
      covers(confirmed, returned, returned) &&
      supported[trip]
      ? 'reckonable'
      : 'uncertain';
    gaps.push({ from, to, basis });
  }
  return [...residence, ...gaps];
}

function periodDays(periods: IrelandResidencePeriod[], from: IsoDate, to: IsoDate) {
  return mergePeriods(periods, to).reduce(
    (sum, range) =>
      sum +
      Math.max(
        0,
        daysBetween(range.from > from ? range.from : from, range.to) + 1,
      ),
    0,
  );
}

function absenceDays(trips: IeTrip[], from: IsoDate, to: IsoDate) {
  return periodDays(tripPeriods(trips), from, to);
}

function confirmedResidenceDays(periods: IrelandResidencePeriod[], trips: IeTrip[], through: IsoDate) {
  return mergePeriods(periods, through).reduce(
    (sum, { from, to }) => sum + daysBetween(from, addDays(to, 1)) - absenceDays(trips, from, to),
    0,
  );
}

function finalYearResidence(
  day: IsoDate,
  residence: IrelandCitizenship['residence'],
  trips: IeTrip[],
  continuousYears: number,
) {
  if (!residence) return undefined;
  const from = addYears(day, -continuousYears);
  const through = addDays(day, -1);
  const confirmed = residence.filter(({ basis }) => basis === 'reckonable');
  const possible = residence.filter(({ basis }) => basis !== 'excluded');
  const away = absenceDays(trips, from, through);
  const { absenceDays: ordinary, exceptionalDays } = pilot.values;
  if (away > ordinary.value + exceptionalDays.value ||
    !covers(possible, from, through))
    return false;
  if (away > ordinary.value || !covers(confirmed, from, through))
    return undefined;
  return true;
}

function discretionaryResidence(
  a: IrelandAssessment,
  residence: IrelandCitizenship['residence'],
  trips: IeTrip[],
  waived: boolean | undefined,
) {
  const continuous = finalYearResidence(
    a.day, residence, trips, pilot.values.continuousYears.value,
  );
  a.add(
    'A04',
    waived === true ? true : continuous === false && waived === undefined ? undefined : continuous,
    a.L(
      '核对递交前一年的连续合法居住，或适用的正式部长豁免。酌情路径的居住口径须按个案确认（PD-325）。',
      'Check continuous lawful residence in the year before filing, or a formal ministerial waiver. Confirm how residence is assessed for discretionary cases (PD-325).',
    ),
    ['PD-323', 'PD-325'],
  );
}

function minorResidence(
  a: IrelandAssessment,
  residence: IrelandCitizenship['residence'],
  trips: IeTrip[],
) {
  const { priorYears, windowYears, from: effective } = p.minor.value;
  const v = pilot.values;
  const from = addYears(a.day, -v.continuousYears.value);
  const previousStart = addYears(from, -windowYears);
  const previousEnd = addDays(from, -1);
  const days = new Days(previousStart, a.day);
  const count = (
    includeUncertain: boolean,
    deductTrips: boolean,
    begin: IsoDate,
    end: IsoDate,
  ) => {
    const flags = new Array<boolean>(days.count).fill(false);
    for (const period of residence ?? []) {
      if (
        period.basis === 'reckonable' ||
        (includeUncertain && period.basis === 'uncertain')
      )
        days.mark(flags, period.from, period.to);
    }
    if (deductTrips) {
      for (const trip of trips) {
        for (
          let i = Math.max(0, days.index(trip.departed) + 1);
          i < Math.min(days.count, days.index(trip.returned));
          i++
        )
          flags[i] = false;
      }
    }
    return days.total(
      days.sums((i) => flags[i]),
      begin,
      end,
    );
  };
  const priorDays = daysBetween(addYears(from, -priorYears), from);
  const away = absenceDays(trips, from, addDays(a.day, -1));
  const lastNeeded = daysBetween(from, a.day) + 1;
  const lower = count(false, true, previousStart, previousEnd);
  const upper = count(true, false, previousStart, previousEnd);
  const permitted = count(false, false, from, a.day);
  const possible = count(true, false, from, a.day);
  a.add(
    'A04',
    !residence || a.day < effective
      ? undefined
      : all(
          permitted === lastNeeded
            ? true
            : possible === lastNeeded
              ? undefined
              : false,
          away <= v.absenceDays.value
            ? true
            : away <= v.absenceDays.value + v.exceptionalDays.value
              ? undefined
              : false,
          lower >= priorDays ? true : upper < priorDays ? false : undefined,
        ),
    a.L(
      `递交前连续居住自 ${from} 起，缺席 ${away} 天。此前 ${windowYears} 年累计已确认 ${lower} 天，需 ${priorYears} 年（本窗口按 ${priorDays} 天）。许可、出境和酌情认定见 PD-110–114、PD-323。`,
      `The continuous period starts on ${from}, with ${away} days absent. ${lower} days are confirmed in the preceding ${windowYears} years. The ${priorYears}-year requirement is ${priorDays} days in this window. See PD-110–114 and PD-323 for permissions, trips and discretion.`,
    ),
    ['PD-110', 'PD-111', 'PD-112', 'PD-113', 'PD-114', 'PD-323'],
  );
}

function spouseClock(
  req: IeRequest,
  s: NonNullable<IrelandCitizenship['spouse']>,
) {
  const postings = mergePeriods(s.postingPeriods ?? [], req.simulationDate);
  const trips = req.trips.flatMap((trip) => {
    let from = addDays(trip.departed, 1);
    const segments: IeTrip[] = [];
    for (const posting of postings) {
      if (posting.to < from || posting.from >= trip.returned) continue;
      if (posting.from > from)
        segments.push({ departed: addDays(from, -1), returned: posting.from });
      from = addDays(posting.to, 1);
    }
    if (from < trip.returned)
      segments.push({ departed: addDays(from, -1), returned: trip.returned });
    return segments;
  });
  return evaluateIreland({
    ...req,
    stamp4Route: 'none',
    trips,
    permissions: [
      ...req.permissions,
      ...postings.map((period) => ({
        ...period,
        kind: 'ni-residence' as const,
      })),
    ],
  }).pathways[1];
}

export function naturalisation(
  a: IrelandAssessment,
  route: IrelandNaturalisationPath,
  req: IeRequest,
  c: IrelandCitizenship,
  dob: IsoDate | undefined,
  birthplace: Place | undefined,
  location: Place | undefined,
  registration: IrelandRegistration | undefined,
  legacy: ReturnType<typeof evaluateIreland> | undefined,
) {
  const { add, L, day } = a;
  const isSpouse = route === 'IE-SPOUSE';
  const isMinor = route === 'IE-MINOR-BORN-IN-STATE';
  const parent = route === 'IE-MINOR-NATURALISED-PARENT';
  const associated = route === 'IE-IRISH-ASSOCIATIONS';
  const protection = route === 'IE-PROTECTION';
  const publicService = route === 'IE-PUBLIC-SERVICE';
  const residence = residenceWithTrips(c, req);
  const adultAge = ageAtLeast(dob, day, p.age.value.adult);
  const appropriateAge =
    isMinor || parent
      ? adultAge === undefined
        ? undefined
        : !adultAge
      : associated || publicService
        ? adultAge === false
          ? c.minor?.authorisedRepresentative
          : adultAge
        : adultAge === false && c.recognisedEarlyMarriage
          ? undefined
          : adultAge;
  const applies =
    c.entitlement === 'already-citizen' ||
    c.entitlement === 'birth-descent-or-fbr'
      ? false
      : c.entitlement === 'none'
        ? true
        : undefined;
  add(
    'A01',
    all(appropriateAge, applies),
    L(
      '核对递交日年龄与是否已是爱尔兰公民或可循出生、血统或 FBR。获承认的特殊未满龄婚姻须个案核实（PD-320）。',
      'Check age on filing and whether citizenship or a birth, descent or FBR route already applies. A recognised marriage below full age needs individual confirmation (PD-320).',
    ),
    ['PD-320'],
  );
  const minorAge = ageAtLeast(dob, day, p.age.value.minorCharacter);
  const minorNeedsCharacter =
    minorAge === true
      ? true
      : minorAge === false
        ? c.minor?.listedSeriousOffence
        : undefined;
  const needsCharacter = isMinor ? minorNeedsCharacter : true;
  if (needsCharacter !== false) {
    const facts = c.character;
    const waived = isMinor && c.minor?.characterWaived === true;
    const known =
      waived || (facts?.officialFinding === true && facts.disclosed === true)
        ? true
        : facts?.officialFinding === false || facts?.disclosed === false
          ? false
          : facts?.record === 'none' && facts.disclosed === true
            ? true
            : undefined;
    add(
      'A02',
      needsCharacter === undefined && known !== true ? undefined : known,
      L(
        '按自报核对如实披露与已有正式品格认定。有定罪、调查或在审事项时由 ISD 个案判断。',
        'Check truthful disclosure and any official character finding. ISD assesses convictions, investigations and pending cases individually.',
      ),
    );
  }
  if (
    c.vettingRequired !== false &&
    (day >= p.proof.value.vettingFrom || c.vettingRequired === true) &&
    needsCharacter !== false
  ) {
    add(
      'A03',
      c.vetting === 'completed'
        ? true
        : c.vetting === 'outstanding'
          ? false
          : undefined,
      L(
        '核对 Garda e-vetting 的授权、递交和审查状态。未决安全或未成年人流程须确认。',
        'Check Garda e-vetting authorisation, submission and review. Outstanding security checks or a minor’s procedure may need confirmation.',
      ),
      isMinor ? ['PD-324'] : undefined,
      false,
    );
  }

  const spouse = c.spouse;
  const posted =
    isSpouse &&
    spouse?.postingPeriods?.some(
      (period) => period.from <= day && (!period.to || day <= period.to),
    );
  const waiver =
    isSpouse && spouse?.waiver === 'granted'
      ? (spouse.waivedConditions ?? [])
      : [];
  if (route === 'IE-NATURALISATION' || isSpouse) {
    const spouseWithoutDate = isSpouse && !req.marriedOn;
    const clockRequest = spouseWithoutDate ? { ...req, marriedOn: day } : req;
    const original =
      isSpouse && spouse?.postingPeriods?.length
        ? spouseClock(clockRequest, spouse)
        : spouseWithoutDate
          ? evaluateIreland(clockRequest).pathways[1]
          : legacy!.pathways[isSpouse ? 1 : 0];
    const clock = { ...original, checks: [...original.checks] };
    const waivedIndexes = ['marriage', 'continuous', 'continuous', 'prior'].map(
      (condition) => isSpouse && waiver.some((item) => item === condition),
    );
    if (
      isSpouse &&
      original.checks.length &&
      (spouseWithoutDate ||
        waivedIndexes.includes(true) ||
        spouse?.waiver === 'pending' ||
        spouse?.postingUnconfirmed === true)
    ) {
      clock.checks = original.checks.map((check, i) =>
        waivedIndexes[i]
          ? {
              ...check,
              met: true,
              text: L(
                '主管机关已豁免此条件。',
                'The competent authority has waived this condition.',
              ),
            }
          : spouseWithoutDate && i === 0
            ? {
                ...check,
                met: undefined,
                text: L(
                  '缺少婚姻或民事伴侣登记日期。',
                  'Enter the marriage or civil partnership date.',
                ),
              }
            : check.met === true
              ? check
              : spouse?.waiver === 'pending' || spouse?.postingUnconfirmed
                ? { ...check, met: undefined }
                : check,
      );
      clock.status = clock.checks.some((check) => check.met === false)
        ? 'NOT_MET'
        : clock.checks.some((check) => check.met === undefined)
          ? 'UNKNOWN'
          : 'MET';
      clock.summary = L(
        '配偶入籍计时已按录入的外派或豁免资料核对。',
        'Spouse residence timing reflects the posting or waiver information entered.',
      );
    }
    const ids = ['NAT-CONTINUOUS', 'NAT-ABSENCES', 'NAT-PRIOR'];
    const pending = [
      ['PD-114', 'PD-321'],
      ['PD-111'],
      ['PD-112', 'PD-113', 'PD-114'],
    ];
    a.time(
      clock,
      isSpouse ? ['SPOUSE-MARRIAGE', ...ids] : ids,
      isSpouse
        ? [[], ...pending.map((items) => ['PD-115', ...items])]
        : pending,
    );
    const eligibleLocation =
      location === undefined
        ? undefined
        : location === 'state' || (isSpouse && location === 'northern-ireland');
    const exempt =
      registration?.basis === 'exempt' ||
      (isSpouse && location === 'northern-ireland');
    const identity = exempt
      ? true
      : registration?.renewalPending && registration.validPermission !== true
        ? undefined
        : registration?.validPermission;
    add(
      'A04',
      waiver.includes('continuous') || posted
        ? true
        : isSpouse &&
            (spouse?.waiver === 'pending' || spouse?.postingUnconfirmed) &&
            all(eligibleLocation, identity) !== true
          ? undefined
          : all(eligibleLocation, identity),
      L(
        '核对实际居住地及递交时的合法身份；续期待决时需确认正式延续（PD-321）。',
        'Check actual residence and lawful status on filing. A pending renewal may need evidence of extension (PD-321).',
      ),
      ['PD-321'],
    );
    const intent = c.intendToReside;
    add(
      'A05',
      posted || waiver.includes('intent')
        ? true
        : intent === undefined ||
            (isSpouse &&
              (spouse?.postingUnconfirmed || spouse?.waiver === 'pending'))
          ? undefined
          : intent === 'state' || (isSpouse && intent === 'northern-ireland'),
      L(
        isSpouse
          ? '计划继续居住于爱尔兰岛；合格外派或批准豁免可改变适用性。'
          : '计划善意继续居住于爱尔兰共和国。',
        isSpouse
          ? 'Intend to remain on the island of Ireland. A qualifying posting or granted waiver can change applicability.'
          : 'Intend in good faith to continue residing in the State.',
      ),
    );
  }
  if (isMinor) minorResidence(a, residence, req.trips);

  const declarationRequired = !isMinor || minorAge === true;
  if (declarationRequired) {
    add(
      'A06',
      (isMinor && c.minor?.declarationWaived) || c.declarationCompleted
        ? true
        : c.willingToDeclare,
      c.approvedAlternativeDeclaration
        ? L(
            '部长已准许以其他方式作声明。仍需核对意愿，并按获准方式完成。',
            'The Minister approved an alternative way to make the declaration. Check willingness and complete it by that method.',
          )
        : L(
            '核对是否愿作效忠声明、守法并尊重民主价值。获批后按指定方式完成。',
            'Check willingness to declare fidelity, observe the law and respect democratic values. Complete the declaration as directed after approval.',
          ),
      isMinor ? ['PD-324'] : undefined,
    );
  }
  const points = identityScore(c, day);
  const protectedKind = c.protection?.kind;
  const refugee =
    protectedKind === 'convention-refugee' ||
    protectedKind === 'programme-refugee';
  const refugeeIdentity = c.protection?.identityEvidence;
  const refugeeEvidenceMet =
    refugee && refugeeIdentity
      ? all(
          c.protection?.validRecognition,
          refugeeIdentity.nationalPassportUnavailable,
          refugeeIdentity.certifiedIrishTravelDocument,
          refugeeIdentity.refugeeStatusLetter,
          refugeeIdentity.witnessedPassportAffidavit,
        )
      : undefined;
  const identityMet =
    points !== undefined && points >= p.identity.value.minimum
      ? true
      : refugee && refugeeIdentity
        ? refugeeEvidenceMet
        : points === undefined || c.alternativeIdentityEvidence
          ? undefined
          : false;
  const form8 =
    route === 'IE-NATURALISATION' ||
    isSpouse ||
    protection ||
    publicService ||
    (associated && adultAge === true);
  const referees =
    form8 && day >= p.identity.value.formFrom
      ? c.refereeCount === undefined
        ? undefined
        : c.refereeCount >= p.identity.value.referees
      : true;
  add(
    'A07',
    all(
      identityMet,
      referees,
      c.birthCertificateOrAcceptedAlternative,
      c.prescribedFormAndWitness,
    ),
    refugee &&
      refugeeIdentity &&
      (points === undefined || points < p.identity.value.minimum)
      ? L(
          '难民无法取得本国护照时，核对经认证的爱尔兰旅行证件、难民认定信和见证后的护照宣誓书。出生证明、表格、见证及适用推荐人仍需核对。',
          'For a refugee unable to obtain a national passport, check the certified Irish-issued travel document, refugee status letter and witnessed passport affidavit. Also check birth evidence, prescribed form, witnesses and applicable referees.',
        )
      : L(
          `身份分 ${points ?? '待确认'}，门槛 ${p.identity.value.minimum}；同时核对出生证明、表格、见证及适用推荐人（PD-322）。`,
          `Identity score ${points ?? 'unconfirmed'}, minimum ${p.identity.value.minimum}. Also check birth evidence, prescribed form, witnesses and applicable referees (PD-322).`,
        ),
    ['PD-322'],
  );
  const evidence = c.residenceEvidence;
  const evidenceMet =
    evidence && evidence.requiredYears.length > 0
      ? all(
          ...evidence.requiredYears.map((year) => {
            const record = evidence.years.find((item) => item.year === year);
            if (!record) return undefined;
            const n = p.proof.value;
            return (
              record.strong > 0 &&
              record.strong * n.strong + record.supporting * n.supporting >=
                n.minimum
            );
          }),
        )
      : undefined;
  add(
    'A08',
    evidenceMet === false && evidence?.affidavit ? undefined : evidenceMet,
    L(
      `每个适用年份至少一件强证明并达 ${p.proof.value.minimum} 分。宣誓书、北爱或替代材料待 ISD 确认（PD-322）。`,
      `Each required year needs strong evidence and at least ${p.proof.value.minimum} points. ISD assesses affidavits and alternative or Northern Ireland evidence (PD-322).`,
    ),
    ['PD-322'],
  );
  const fees = p.fee.value;
  add(
    'A09',
    day < fees.from ? undefined : c.applicationFeePrepared,
    day < fees.from
      ? L(
          '所选日期的递交费用待确认（PD-339）。',
          'The application fee on the selected historical date requires confirmation (PD-339).',
        )
      : L(`递交费 €${fees.apply}。`, `Application fee €${fees.apply}.`),
    ['PD-339'],
    false,
  );
  const recognisedFeeExemption =
    c.protection?.certificationFeeExemptionConfirmed === true ||
    (protection && c.protection?.validRecognition === true && refugee);
  const certificationFee =
    day < fees.from
      ? undefined
      : recognisedFeeExemption
        ? fees.exempt
        : protection && protectedKind !== 'none' && protectedKind !== 'pending'
          ? undefined
          : c.survivorFeeConditions === true || adultAge === false
            ? fees.minorOrSurvivor
            : adultAge === true &&
                (!isSpouse || c.survivorFeeConditions === false)
              ? fees.adult
              : undefined;
  add(
    'A10',
    certificationFee === undefined
      ? undefined
      : certificationFee === fees.exempt
        ? true
        : c.approved
          ? c.certificateFeePaid
          : undefined,
    certificationFee === undefined
      ? L(
          '发证费依据保护身份、年龄或遗属资格待确认（PD-323、PD-339）。',
          'Confirm the certification fee using protection status, age or survivor eligibility (PD-323, PD-339).',
        )
      : L(
          `发证费 €${certificationFee}，签发证书时取得国籍${c.certificateIssuedOn ? `（${c.certificateIssuedOn}）` : ''}。`,
          `Certification fee €${certificationFee}. Citizenship takes effect on issue${c.certificateIssuedOn ? ` (${c.certificateIssuedOn})` : ''}.`,
        ),
    ['PD-323', 'PD-339'],
    false,
  );
  add(
    'A11',
    true,
    L(
      '入籍没有独立的语言、公民知识考试、固定收入、体检、私保或住房面积门槛；居住与关系证明另核。',
      'Naturalisation has no standalone language, civics test, fixed income, medical exam, private insurance or housing size requirement. Residence and relationship evidence are checked separately.',
    ),
    undefined,
    false,
  );
  const additional = c.additionalEvidence;
  const deadline =
    additional &&
    (additional.deadline ??
      addDays(additional.requestedOn, p.proof.value.replyDays));
  add(
    'A12',
    all(
      c.addressUpdated,
      !deadline
        ? true
        : additional.suppliedOn
          ? additional.suppliedOn <= deadline
          : day > deadline
            ? false
            : undefined,
    ),
    L(
      `核对补件${deadline ? `截止日 ${deadline}` : '和截止日'}及联系方式。最终入籍由部长决定。`,
      `Check additional evidence${deadline ? ` due ${deadline}` : ' and its deadline'} and contact details. The Minister makes the final naturalisation decision.`,
    ),
    undefined,
    false,
  );

  if (isSpouse) {
    const relationship = spouse?.relationship;
    const qualifies =
      relationship === undefined
        ? undefined
        : relationship === 'spouse' || relationship === 'civil-partner';
    const joint =
      spouse?.jointAddressEvidenceMonths === undefined ||
      spouse.jointAddressDocuments === undefined
        ? undefined
        : spouse.jointAddressEvidenceMonths >= p.proof.value.jointMonths &&
          spouse.jointAddressDocuments >= p.proof.value.jointDocuments;
    add(
      'A13',
      all(
        qualifies,
        spouse?.irishCitizen,
        spouse?.recognised,
        spouse?.livingTogether,
        spouse?.affidavit,
        joint,
      ),
      L(
        `需有效婚姻或民事伴侣、同住与配偶声明，核对最近 ${p.proof.value.jointMonths} 个月及 ${p.proof.value.jointDocuments} 份不同同址证明。`,
        `A recognised marriage or civil partnership, cohabitation and spouse declaration are required. Check ${p.proof.value.jointDocuments} different joint address documents for the last ${p.proof.value.jointMonths} months.`,
      ),
    );
    if (
      spouse?.postingPeriods?.length ||
      spouse?.postingUnconfirmed ||
      (spouse?.waiver && spouse.waiver !== 'none')
    ) {
      add(
        'A14',
        spouse?.postingUnconfirmed || spouse?.waiver === 'pending'
          ? undefined
          : spouse?.waiver !== 'denied',
        L(
          '合格公共服务外派可计入 s15A；严重伤害豁免只适用于法条列明的条件，须有部长决定。',
          'Qualifying public service abroad counts under s15A. The serious-harm waiver covers only specified conditions and requires a ministerial decision.',
        ),
        undefined,
        false,
      );
    }
  }
  if (isMinor) {
    add(
      'A15',
      all(
        day >= p.minor.value.from,
        birthplace === undefined ? undefined : birthplace === 'state',
        adultAge === undefined ? undefined : !adultAge,
        c.minor?.authorisedRepresentative,
        applies,
      ),
      L(
        '出生于共和国、递交时未成年，且由获授权者代办；先核出生或血统国籍。',
        'Born in the State, below full age on filing and represented by an authorised applicant. Check citizenship by birth or descent first.',
      ),
    );
    const backgroundAge = ageAtLeast(dob, day, p.age.value.minorForm);
    add(
      'A16',
      all(
        minorNeedsCharacter === false || c.minor?.characterWaived
          ? true
          : minorNeedsCharacter,
        backgroundAge === false ? true : c.minor?.backgroundFormPrepared,
        minorAge === false || c.minor?.declarationWaived
          ? true
          : c.willingToDeclare,
      ),
      L(
        `品格及声明按 s15B 的 ${p.age.value.minorCharacter} 岁界线分流；背景表从 ${p.age.value.minorForm} 岁适用。较小儿童若有法列严重事项仍需核查（PD-324）。`,
        `Apply the s15B age ${p.age.value.minorCharacter} boundary for character and declaration. The background form applies from age ${p.age.value.minorForm}. Specified serious offences can still trigger review for younger children (PD-324).`,
      ),
      ['PD-324'],
    );
  }
  if (parent) {
    const m = c.minor;
    add(
      'A17',
      all(
        m?.naturalisedParentCertificateOn
          ? m.naturalisedParentCertificateOn <= day
          : undefined,
        m?.authorisedRepresentative,
        m?.relationshipAndConsentEvidence,
        m?.childResidenceAndSchoolEvidence,
      ),
      L(
        '核对父母入籍证书签发日、Form 9、亲子授权及子女居住材料。',
        'Check the parent’s naturalisation certificate date, Form 9, parental authority and the child’s residence evidence.',
      ),
    );
    discretionaryResidence(a, residence, req.trips, m?.parentRouteWaiverGranted);
  }
  if (associated) {
    const data = c.association;
    discretionaryResidence(a, residence, req.trips, data?.waiverGranted);
    add(
      'A18',
      all(data?.qualifyingRelationship, data?.relativeEligibleAtRelevantDate),
      L(
        '核对血缘、姻亲、收养或民事伴侣关联，以及关联人在相关日期的爱尔兰国籍或资格。',
        'Check the relationship by blood, affinity, adoption or civil partnership and the relative’s Irish citizenship or entitlement at the relevant date.',
      ),
    );
    const e = data?.evidence;
    const n = p.association.value;
    const scores = e && [
      Math.min(n.residenceMax, e.residenceYears * n.residencePoints) +
        (e.taxResident ? n.taxPoints : 0) +
        (!e.currentlyResident
          ? Math.min(n.visitMax, e.visits * n.visitPoints)
          : 0),
      e.residentFamily ? n.residentFamily : 0,
      (e.significantContribution ? n.contribution : 0) +
        (e.nfqLevel !== undefined &&
        e.nfqLevel >= n.minNfq &&
        e.nfqLevel <= n.maxNfq
          ? n.qualification
          : 0) +
        (Number(e.juniorCertificate) + Number(e.leavingCertificate)) *
          n.qualification,
      (e.irishInsurance ? n.insurance : 0) +
        Math.min(
          n.prsiMax,
          Math.floor(e.prsiContributions / n.prsiBatch) * n.prsiPoints,
        ) +
        (e.irishPension ? n.pension : 0) +
        (e.fullIrishLicence ? n.licence : 0) +
        (e.activeIrishBank ? n.bank : 0),
    ];
    const strong = scores?.filter(
      (score, i) => score >= n.maxByCategory[i] * n.minimumShare,
    ).length;
    add(
      'A19',
      data?.waiverGranted,
      L(
        `关联证据有 ${strong ?? '待确认'} 类达到各自半数。指引指标为至少 ${n.requiredCategories} 类；豁免由部长判断（PD-325）。`,
        `${strong ?? 'An unknown number of'} evidence categories reach half of their available points. Guidance uses at least ${n.requiredCategories} such categories. The Minister decides the waiver (PD-325).`,
      ),
      ['PD-325'],
    );
  }
  if (protection) {
    const n = p.refugee.value;
    const data = c.protection;
    const years = day < n.changedOn ? n.previousYears : n.currentYears;
    const grant = data?.grantOn;
    const finalYearStarts = addYears(day, -n.continuousYears);
    const priorYears = years - n.continuousYears;
    const earliestPriorStart = addYears(finalYearStarts, -priorYears);
    const afterRecognition = grant ? residence?.map((period) => ({
      ...period,
      from: period.from < grant ? grant : period.from,
    })) : undefined;
    const continuous = all(
      location === undefined ? undefined : location === 'state',
      grant && grant > finalYearStarts
        ? false
        : finalYearResidence(day, afterRecognition, req.trips, n.continuousYears),
    );
    let prior: boolean | undefined;
    if (grant && grant > earliestPriorStart) {
      prior = false;
    } else if (afterRecognition) {
      const through = addDays(finalYearStarts, -1);
      const needed = daysBetween(earliestPriorStart, finalYearStarts);
      const confirmed = afterRecognition.filter(({ basis }) => basis === 'reckonable');
      const possible = afterRecognition.filter(({ basis }) => basis !== 'excluded');
      prior = confirmedResidenceDays(confirmed, req.trips, through) >= needed
        ? true
        : confirmedResidenceDays(possible, req.trips, through) < needed
          ? false
          : undefined;
    }
    const waived = (condition: 'continuous' | 'prior') =>
      data?.waiverGranted === true && (data.waivedResidenceConditions?.includes(condition) ?? true);
    const residenceCondition = (condition: 'continuous' | 'prior', meets: boolean | undefined) =>
      waived(condition) || meets === true ? true : data?.waiverPending ? undefined : meets;
    const residenceMet = all(
      residenceCondition('continuous', continuous),
      residenceCondition('prior', prior),
    );
    const met =
      refugee
        ? all(data?.validRecognition, grant ? grant <= day : undefined, residenceMet)
        : protectedKind === 'none' || protectedKind === 'pending'
          ? false
          : protectedKind === 'stateless' && waived('continuous') && waived('prior')
            ? data?.validRecognition
            : undefined;
    add(
      'A20',
      met,
      L(
        `难民通常须有递交前连续 ${n.continuousYears} 年居住，并在此前累计 ${priorYears} 年。认定日之后的可计居住才计入；按正式决定核对各项豁免（PD-323）。`,
        `Refugees ordinarily need ${n.continuousYears} continuous year of residence before filing and ${priorYears} years in total before that. Count reckonable residence from recognition and check any formal waiver by condition (PD-323).`,
      ),
      ['PD-323'],
    );
  }
  if (publicService) {
    const data = c.publicService;
    discretionaryResidence(a, residence, req.trips, data?.waiverGranted);
    add(
      'A21',
      all(
        data?.qualifyingIrishPublicAppointment,
        data?.residesAbroadDuringService,
        data?.appointmentEvidence,
        data?.waiverGranted,
      ),
      L(
        '核对本人爱尔兰公共服务任命和境外居住；部长是否豁免须看决定（PD-325）。',
        'Check the applicant’s Irish public appointment and residence abroad. The Minister decides any waiver (PD-325).',
      ),
      ['PD-325'],
    );
  }
  return applies;
}
