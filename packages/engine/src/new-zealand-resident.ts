import {
  newZealand2026_11,
  nzResidentParameters as p,
  type SourceRef,
} from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import {
  all,
  any,
  atLeast,
  atMost,
  createNzContext,
  not,
  type NzContext,
  type NzDependantAnswers,
} from './new-zealand-checks';
import {
  evaluateNewZealand,
  type NzResult,
  type NzPathway,
} from './new-zealand';
import { afterYears } from './pilot';

const time = newZealand2026_11.values;
const travel = p.travel.value;
const commitment = p.commitment.value;
const grant = p.citizenship.value;
const conviction = p.conviction.value;
const ref = (id: string, locator: string): SourceRef[] => [
  { srcId: id, locator },
];

type Commitment =
  'tax' | 'investment' | 'legacy-investment' | 'business' | 'base';

interface TravelEvidence {
  action?: 'initial' | 'variation' | 'subsequent';
  firstEntryClass?: 'standard' | 'pacific-quota' | 'aip-child';
  parentFirstEntry?: 'completed' | { deadline: string };
  parentTravelEnd?: string;
  firstResidentEntry?: string | null;
  /** Current location if an open trip has no return date yet. */
  currentlyInNz?: boolean;
  passportCoversInitialConditions?: boolean;
  restrictedEntry?: boolean;
  variationBasis?:
    | 'ordinary'
    | 'australian'
    | 'partner'
    | 'secondment'
    | 'old-investor'
    | 'aip';
  previouslyUsedAustralianVariation?: boolean;
  nzCitizenPartnerSupportsInWriting?: boolean;
  sameOngoingSponsoredPartnership?: boolean;
  genuineCohabitationMonths?: number;
  employerConfirmsSecondmentAndResidence?: boolean;
  /** Total including the period applied for. */
  totalSecondmentYears?: number;
  taxConfirmedForAnnualVariation?: boolean;
  conditionsCompliedWithToDate?: boolean;
  /** The principal's underlying eligibility or confirmed varied travel end, RV1.20. */
  principalQualifiesForTravel?: boolean;
  /** Facts at the date of expiry, distinct from today's circumstances. */
  atExpiry?: {
    eligibleForPrv?: boolean;
    /** INZ-confirmed or independently established eligibility at expiry. */
    variation?: 'none' | '14-days' | '12-months' | '24-months';
    secondmentQualified?: boolean;
    noEntryRestrictions?: boolean;
    conditionsCompliedWith?: boolean;
    taxResidenceConfirmed?: boolean;
  };
  filipinoDairyExceptionClaimed?: boolean;
}

interface PrvEvidence {
  category?:
    | 'ordinary'
    | 'migrant-investor'
    | 'parent-retirement'
    | 'active-investor-plus';
  /** For a former holder, the day their resident visa ceased to be valid. */
  expiredOn?: string;
  role?: 'principal' | 'linked' | 'independent' | 'independent-review';
  principalHoldsPrv?: boolean;
  /** Completion confirmed by INZ, or no such conditions. */
  conditions?:
    'none' | 'confirmed' | 'compliant-pending' | 'outstanding' | 'breached';
  deportationLiability?: 'none' | 'liable' | 'suspended';
  furtherPoliceEvidence?:
    'not-requested' | 'provided' | 'requested-outstanding';
  formerResidentIssue?:
    'none' | 'false-identity' | 'deportation-notice' | 'other-adverse';
  /** Additional claimed routes; an empty list explicitly rules all four out. */
  otherCommitments?: Commitment[];
  taxResidenceConfirmedForWholePeriod?: boolean;
  treatyResidentElsewhere?: boolean;
  qualifyingNzInvestmentNzd?: number;
  investmentMonthsAfterGrant?: number;
  oldBusinessInvestorConditionsMet?: boolean;
  businessFoundedOrPurchased?: boolean;
  businessSharePercent?: number;
  successfulBusinessMonthsImmediatelyBeforeApplication?: number;
  goingConcernAccountsCertified?: boolean;
  includedFamilyDaysInTwoYears?: number[];
  homePurchasedOn?: string;
  stillOwnAndOccupyFamilyHome?: boolean;
  qualifyingEmploymentMonthsInTwoYears?: number;
}

interface CitizenshipEvidence {
  ageAtDecision?: number;
  parentCitizenOrAboutToBe?: boolean;
  fullCapacity?: boolean;
  capacityException?: 'referred' | 'granted' | 'declined';
  entitlementConfirmed?: boolean;
  presenceException?: 'none' | 'exceptional' | 'realm' | 'crown-service';
  exceptionalResidentDaysInWindow?: number;
  specialPresenceAcceptedByDia?: boolean;
  character?:
    | 'clear'
    | 'old-conviction'
    | 'pending-charge'
    | 'protection-order'
    | 'other-adverse';
  /** Most serious unshielded prison term; includes the possible term of an indefinite sentence. */
  longestPrisonYears?: number;
  lastShortSentenceOrParoleOn?: string;
  lastNonCustodialConvictionOn?: string;
  demeritPoints?: number;
  ministerialConvictionException?: 'requested' | 'granted';
  overseasMonthsRecent?: number;
  overseasMonthsLong?: number;
  foreignPoliceEvidence?:
    'provided' | 'not-requested' | 'requested-outstanding';
  understandsResponsibilities?: boolean;
  testExemptionConfirmed?: boolean;
  english?:
    'evidenced' | 'waived' | 'interview' | 'waiver-requested' | 'insufficient';
  residenceIntent?:
    | 'nz-or-realm'
    | 'documented-overseas-service'
    | 'accompany-citizen-in-service'
    | 'long-trip'
    | 'emigrate';
  identityDocumentsAndWitness?: boolean;
  oath?: 'willing' | 'exempt' | 'unwilling';
  feeCategory?: 'standard' | 'samoa-s7a';
}

export interface NzResidentAnswers {
  travel?: TravelEvidence;
  prv?: PrvEvidence;
  citizenship?: CitizenshipEvidence;
}

const hasDate = (d: string | undefined, by: string) =>
  d === undefined ? undefined : d <= by;

function residentRecord(ctx: NzContext, a: NzResidentAnswers) {
  const req = ctx.time;
  const t = a.travel ?? {};
  const granted = req.residentVisa?.granted;
  const trips = req.trips;
  const abroadAtGrant =
    granted &&
    trips?.find((trip) => trip.departed < granted && granted < trip.returned);
  const inferredFirst =
    granted &&
    req.firstArrival &&
    (req.firstArrival > granted
      ? req.firstArrival
      : trips && (abroadAtGrant ? abroadAtGrant.returned : granted));
  const first =
    t.firstResidentEntry === null
      ? undefined
      : (t.firstResidentEntry ?? inferredFirst);
  let deadline =
    granted && t.firstEntryClass === 'standard'
      ? addDays(afterYears(granted, time.firstEntryYears.value), -1)
      : undefined;
  if (granted && t.firstEntryClass === 'pacific-quota')
    deadline = addDays(addMonths(granted, travel.quotaEntryMonths), -1);
  if (t.firstEntryClass === 'aip-child')
    deadline =
      typeof t.parentFirstEntry === 'object'
        ? t.parentFirstEntry.deadline
        : undefined;
  const entryValid =
    first && granted
      ? first === granted ||
        (t.firstEntryClass === 'aip-child' &&
          t.parentFirstEntry === 'completed') ||
        (deadline === undefined ? undefined : first <= deadline)
      : undefined;
  const end =
    req.travelConditionsEnd ??
    (t.firstEntryClass === 'aip-child'
      ? t.parentTravelEnd
      : first &&
        req.residentVisa &&
        addDays(
          afterYears(first, time.travelYears.value[req.residentVisa.category]),
          -1,
        ));
  const tripLapse =
    first &&
    end &&
    trips
      ?.filter((trip) => trip.returned > first && trip.returned > end)
      .map((trip) => addDays(trip.departed > end ? trip.departed : end, 1))
      .filter(
        (date) =>
          !req.permanentResidentVisa || req.permanentResidentVisa >= date,
      )
      .sort()[0];
  const tripOnDate = trips?.find(
    (trip) => trip.departed <= ctx.date && ctx.date <= trip.returned,
  );
  // A completed-trip list alone cannot tell us whether the person has left again.
  const onshore =
    t.currentlyInNz ??
    (tripOnDate
      ? tripOnDate.departed === ctx.date || tripOnDate.returned === ctx.date
      : req.firstArrival && req.firstArrival >= ctx.date
        ? req.firstArrival === ctx.date
        : undefined);
  const openTrip = onshore === false && !tripOnDate;
  const offshoreAfterEnd = end && end < ctx.date && openTrip;
  const datedLapse = a.prv?.expiredOn ?? tripLapse;
  const lapse =
    offshoreAfterEnd && datedLapse && datedLapse > ctx.date
      ? undefined
      : datedLapse;
  // RV1.5 establishes loss of status in either expiry scenario. The open
  // trip could have started before OR after travel conditions ended.
  const expired =
    lapse && lapse <= ctx.date
      ? true
      : offshoreAfterEnd
        ? true
        : trips &&
            first &&
            end &&
            (ctx.date <= end || onshore === true || tripOnDate)
          ? false
          : undefined;
  const entered =
    t.firstResidentEntry === null
      ? false
      : all(entryValid, hasDate(first, ctx.date));
  // If the visa lapsed strictly after the first possible expiry day, it
  // lapsed on departure, fixing the start of the current absence.
  const departureEstablishedByLapse =
    openTrip &&
    !hasDate(req.permanentResidentVisa, ctx.date) &&
    end &&
    lapse &&
    lapse <= ctx.date &&
    lapse > addDays(end, 1);
  const knownPresence =
    onshore === true || !!tripOnDate || departureEstablishedByLapse;
  // Count each NZ day once even if the travel history contains overlapping trips.
  const residentDays = (from: string, until: string) => {
    if (!trips || !first || entryValid !== true || !knownPresence)
      return undefined;
    let count = 0;
    for (let d = from; d < until; d = addDays(d, 1)) {
      if (
        d >= first &&
        (!lapse ||
          d < lapse ||
          (req.permanentResidentVisa && d >= req.permanentResidentVisa)) &&
        !trips.some((trip) => trip.departed < d && d < trip.returned)
      )
        count++;
    }
    return count;
  };
  const portions = (on: string): [number, number] | undefined => {
    const split = addDays(on, -time.prvPeriodDays.value);
    const recent = residentDays(split, on);
    const earlier = residentDays(addDays(on, -time.prvHeldDays.value), split);
    return recent === undefined || earlier === undefined
      ? undefined
      : [recent, earlier];
  };
  const standardTimeline =
    knownPresence &&
    !openTrip &&
    (first === granted || t.firstEntryClass === 'standard') &&
    first !== undefined &&
    first === inferredFirst &&
    t.firstEntryClass !== 'pacific-quota' &&
    t.firstEntryClass !== 'aip-child' &&
    datedLapse === tripLapse;
  return {
    first,
    granted,
    deadline,
    entryValid,
    end,
    lapse,
    expired,
    entered,
    onshore,
    portions,
    residentDays,
    standardTimeline,
  };
}
type ResidentRecord = ReturnType<typeof residentRecord>;

function formerReview(ctx: NzContext, a: PrvEvidence) {
  const issue = a.formerResidentIssue;
  const clear =
    issue === undefined || issue === 'other-adverse'
      ? undefined
      : issue === 'none';
  return ctx.check(
    'NZ-RV-FORMER',
    '前居民签证记录',
    'Former resident record',
    clear,
    ref('SRC-230', 'RV1.25(a)–(f), RV1.25.1'),
    '核对虚假身份、驱逐通知、欺诈、行政错误、定罪及其他不利信息。须结合案情裁决的事项保留待确认。',
    'Check identity, deportation notices, deception, grant errors, convictions and other adverse information. Other adverse findings require an individual INZ decision.',
    'PD-221',
  );
}

function furtherPolice(ctx: NzContext, evidence: PrvEvidence) {
  const status = evidence.furtherPoliceEvidence;
  return ctx.check(
    'NZ-RV-POLICE',
    '再次居民申请的无犯罪证明',
    'Police evidence for further residence',
    status === undefined ? undefined : status !== 'requested-outstanding',
    ref('SRC-240', 'A5.5(b), police and other character evidence'),
    '再次居民申请通常免主动提交无犯罪证明；若签证官已要求，须提交所要求的证明。',
    'A further residence applicant does not routinely file fresh police certificates. Supply any evidence the officer has requested.',
  );
}

function filingFee(ctx: NzContext, citizenship = false) {
  return ctx.check(
    'NZ-FILING-FEE',
    '递交时应缴的申请费',
    'Required fee at lodgement',
    ctx.requiredFeePaid,
    citizenship
      ? ref('SRC-231', 'pp9, 37: receipt of a complete application and fee')
      : ref('SRC-230', 'RV1.10.10(c)(iii), (d)(vi)'),
    '确认本次申请应缴的费用已支付，或无需缴费。',
    'Confirm payment of the fee due for this application, or that no fee is due.',
  );
}

function residentFilingChecks(ctx: NzContext) {
  return [
    ctx.check(
      'NZ-IDENTITY',
      '居民申请身份文件',
      'Identity evidence for residence',
      ctx.identityDocumentsComplete,
      ref('SRC-230', 'RV1.10.10(c)–(d)'),
      '核对各位申请人按递交方式所需的身份文件与照片。',
      'Confirm the identity documents and photographs required for each applicant and the filing method.',
    ),
    ctx.dependantEligibility(),
    filingFee(ctx),
  ];
}

function currentCompliance(ctx: NzContext, a: NzResidentAnswers) {
  return (
    a.travel?.conditionsCompliedWithToDate ??
    (a.prv?.conditions
      ? a.prv.conditions === 'breached'
        ? false
        : a.prv.conditions === 'outstanding'
          ? undefined
          : true
      : ctx.time.conditions === 'none' || ctx.time.conditions === 'met'
        ? true
        : undefined)
  );
}

function partnerVariation(t: TravelEvidence) {
  return all(
    t.nzCitizenPartnerSupportsInWriting,
    any(
      t.sameOngoingSponsoredPartnership,
      atLeast(t.genuineCohabitationMonths, travel.annualMonths),
    ),
  );
}

function travelPath(
  ctx: NzContext,
  a: NzResidentAnswers,
  r: ResidentRecord,
  permanent: CountryPathway,
  old?: NzPathway,
): CountryPathway {
  const t = a.travel ?? {};
  const pr = a.prv ?? {};
  const action = t.action ?? 'initial';
  const checks: CountryCheck[] = [];
  const finish = () =>
    ctx.path(
      'NZ-TRAVEL',
      '居民签证旅行条件',
      'Resident visa travel conditions',
      checks,
      ['NZ-P1-FEE'],
    );
  if (hasDate(ctx.time.permanentResidentVisa, ctx.date))
    return {
      id: 'NZ-TRAVEL',
      title: ctx.L('居民签证旅行条件', 'Resident visa travel conditions'),
      checks: [],
      assumptions: [],
      status: 'NOT_APPLICABLE',
      summary: ctx.L(
        '已持永久居民签证，可无限次往返。',
        'A permanent resident visa allows unrestricted travel.',
      ),
    };
  const initial = action === 'initial';
  const standardTimeChecks = r.standardTimeline ? old?.checks : undefined;
  const initialEntry = standardTimeChecks?.find((check) =>
    check.sources.some((source) => source.locator === 'R5.66.1(a)'),
  );
  const pendingEntry = r.entryValid === true && !!r.first && r.first > ctx.date;
  const awaitingFirstEntry =
    t.firstResidentEntry === null && (!r.deadline || ctx.date <= r.deadline);
  checks.push(
    ctx.check(
      'NZ-P1-1',
      '首次居民入境',
      'First resident entry',
      (pendingEntry || awaitingFirstEntry) && initial
        ? undefined
        : (initialEntry?.met ?? r.entered),
      ref('SRC-072', 'R5.66(c), R5.66.1, R5.66.5(b)–(c); RV1.5(d)'),
      `核对首次居民入境日${r.first ?? '（未填写）'}与境外获批首入期限${r.deadline ?? '（见签证或父母条件）'}。再次申请须曾以居民身份入境。`,
      `Check first resident entry ${r.first ?? '(not supplied)'} against the offshore entry deadline ${r.deadline ?? '(see the visa or parent’s conditions)'}. A further application requires prior resident entry.`,
    ),
  );
  if (initial) {
    checks.push(
      ctx.check(
        'NZ-P1-1-TRAVEL',
        '多次往返条件',
        'Multiple-entry conditions',
        all(
          not(r.expired),
          r.end === undefined ? undefined : ctx.date <= r.end,
        ),
        ref('SRC-072', 'R5.66.5; RV1.5(a)–(b)'),
        `按签证与行程核对旅行条件末日 ${r.end ?? '待确认'}。末日后不能凭原条件往返；仍在境内的居民可继续居留，离境或在境外到期会使签证失效。`,
        `Last travel day: ${r.end ?? 'unknown'}. After this day the holder may remain onshore, but cannot re-enter on these conditions. Leaving without valid travel conditions, or being overseas at expiry, ends the visa.`,
      ),
    );
    // Currency of the passport is a condition of the original grant.
    checks.push(
      ctx.check(
        'NZ-P1-1-PASSPORT',
        '获签时旅行证件期限',
        'Travel document at initial grant',
        t.passportCoversInitialConditions,
        ref('SRC-072', 'R5.66.1(e)'),
        '获批时旅行证件须覆盖初始旅行条件期限。',
        'The travel document must cover the proposed initial travel period at grant.',
      ),
    );
    const path = finish();
    if (pendingEntry && checks.slice(1).every((c) => c.status === 'MET'))
      return {
        ...path,
        status: 'FUTURE',
        earliestDate: r.first,
        assumptions: old?.assumptions ?? [],
      };
    return {
      ...path,
      assumptions:
        t.firstEntryClass === 'aip-child' ||
        t.firstEntryClass === 'pacific-quota'
          ? []
          : (old?.assumptions ?? []),
      ...(path.status === 'MET' ? { earliestDate: ctx.date } : {}),
    };
  }
  const linked = pr.role === 'linked';
  const roleKnown = pr.role
    ? pr.role !== 'independent-review'
    : ctx.time.nonPrincipal === false;
  const eligiblePrincipal = t.principalQualifiesForTravel;
  const cannotGetPrv =
    permanent.status === 'MET'
      ? false
      : permanent.status === 'UNKNOWN'
        ? undefined
        : true;
  const complies = currentCompliance(ctx, a);
  const restricted = t.restrictedEntry;
  if (action === 'variation') {
    const counts = r.portions(ctx.date);
    const annualPresence = counts && Math.max(...counts);
    const ordinary = all(
      r.first
        ? daysBetween(r.first, ctx.date) >= time.prvPeriodDays.value
        : undefined,
      any(
        atLeast(annualPresence, time.prvPortionDays.value),
        all(
          atLeast(annualPresence, time.prvTaxPortionDays.value),
          t.taxConfirmedForAnnualVariation,
        ),
      ),
    );
    const elapsed = r.granted ? daysBetween(r.granted, ctx.date) : undefined;
    const basis = t.variationBasis;
    let extended: boolean | undefined;
    switch (basis) {
      case 'ordinary':
        extended = false;
        break;
      case 'old-investor':
        extended = r.first
          ? daysBetween(r.first, ctx.date) >= time.prvFirstDayDays.value
          : undefined;
        break;
      case 'australian':
        extended = all(
          atMost(elapsed, time.prvHeldDays.value),
          t.previouslyUsedAustralianVariation === undefined
            ? undefined
            : !t.previouslyUsedAustralianVariation,
        );
        break;
      case 'partner':
        extended = all(cannotGetPrv, partnerVariation(t));
        break;
      case 'secondment':
        extended = all(
          cannotGetPrv,
          t.employerConfirmsSecondmentAndResidence,
          atMost(t.totalSecondmentYears, travel.maximumSecondmentYears),
        );
        break;
    }
    const unrestricted = restricted === undefined ? undefined : !restricted;
    const long = all(
      unrestricted,
      complies,
      roleKnown
        ? linked
          ? eligiblePrincipal
          : any(ordinary, extended)
        : undefined,
    );
    const valid = r.expired === undefined ? undefined : !r.expired;
    checks.push(
      ctx.check(
        'NZ-P1-2',
        '有效居民签证与旅行变更',
        'Valid residence and variation',
        all(valid, any(r.onshore, long)),
        ref('SRC-230', 'RV3.1, RV3.5, RV3.10, RV3.15'),
        `境内有效居民至少可变更 ${travel.shortDays} 天；境外须无禁令、持续履约并符合较长期限。一般延长 ${travel.annualMonths} 个月。`,
        `A resident in NZ can obtain at least ${travel.shortDays} days. Offshore applicants need a longer provision, continuing compliance and no ban. The ordinary extension is ${travel.annualMonths} months.`,
      ),
    );
    checks.push(
      ctx.check(
        'NZ-P1-3',
        '较长及特别旅行期限',
        'Longer or special travel period',
        long,
        ref('SRC-230', 'RV3.5, RV3.15, RV3.20.1–.10'),
        restricted === true
          ? `受入境禁令限制，仅在境内可批 ${travel.shortDays} 天。`
          : extended && long
            ? `特别条款支持 ${travel.extendedMonths} 个月，澳洲条款从当前居民签获批日起算。`
            : ordinary && long
              ? `在境或税务证明支持 ${travel.annualMonths} 个月。`
              : '核对在境天数、税务、旧投资类、澳籍或澳永居首次变更、公民伴侣或海外外派的书面证明。AIP 单独适用 RV3.15 待确认。',
        restricted === true
          ? `An entry restriction permits only ${travel.shortDays} days and only onshore.`
          : extended && long
            ? `The special provision supports ${travel.extendedMonths} months; the Australian period runs from the current resident visa grant.`
            : ordinary && long
              ? `Presence or tax residence supports ${travel.annualMonths} months.`
              : 'Check presence, tax residence, legacy investment, first Australian variation, written partner support or documented secondment. RV3.15 does not expressly cover AIP.',
        'PD-221',
      ),
    );
    // Failure to qualify for a longer duration does not block an onshore variation.
  } else {
    const elapsed =
      r.lapse && r.lapse <= ctx.date
        ? daysBetween(r.lapse, ctx.date)
        : undefined;
    const within = (months: number) =>
      r.lapse ? ctx.date < addMonths(r.lapse, months) : undefined;
    const expiry = t.atExpiry;
    const variation =
      expiry?.variation === undefined
        ? undefined
        : expiry.variation === '14-days'
          ? atMost(elapsed, travel.shortDays)
          : expiry.variation === '12-months'
            ? within(travel.annualMonths)
            : expiry.variation === '24-months'
              ? within(travel.extendedMonths)
              : false;
    const special =
      t.variationBasis === 'partner'
        ? partnerVariation(t)
        : t.variationBasis === 'secondment'
          ? all(
              expiry?.secondmentQualified,
              t.employerConfirmsSecondmentAndResidence,
              atMost(t.totalSecondmentYears, travel.maximumSecondmentYears),
              within(travel.extendedMonths),
            )
          : t.variationBasis === undefined
            ? undefined
            : false;
    // At expiry, a 12-month variation can also be established from actual recorded trips.
    // Current compliance, character and tax answers cannot prove their historical values.
    const historicalCounts = r.lapse && r.portions(r.lapse);
    const historicalMax = historicalCounts
      ? Math.max(...historicalCounts)
      : undefined;
    const calculatedAnnual = all(
      expiry?.conditionsCompliedWith,
      expiry?.noEntryRestrictions,
      r.first && r.lapse
        ? daysBetween(r.first, r.lapse) >= time.prvPeriodDays.value
        : undefined,
      any(
        atLeast(historicalMax, time.prvPortionDays.value),
        all(
          atLeast(historicalMax, time.prvTaxPortionDays.value),
          expiry?.taxResidenceConfirmed,
        ),
      ),
      within(travel.annualMonths),
    );
    const variationAtExpiry =
      expiry?.variation === undefined ? calculatedAnnual : variation;
    const basis = linked
      ? eligiblePrincipal
      : !roleKnown
        ? undefined
        : any(
            variationAtExpiry,
            all(expiry?.eligibleForPrv, within(travel.extendedMonths)),
            special,
          );
    checks.push(
      ctx.check(
        'NZ-P1-4',
        '失效后的再次居民签证',
        'Second or subsequent residence',
        all(
          r.expired,
          basis,
          complies,
          restricted === undefined ? undefined : !restricted,
        ),
        ref('SRC-230', 'RV4.1, RV4.5, RV4.10, RV4.15, RV4.20'),
        `须为旅行原因失效且未违反附加条件，失效时符合的变更至今有效、当时符合永居且距今未满 ${travel.extendedMonths} 个月，或符合特别条款。`,
        `The visa must have expired through travel, without a breach. A variation available at expiry must still run, PRV eligibility at expiry must be less than ${travel.extendedMonths} months ago, or a special provision must apply.`,
        'PD-221',
      ),
    );
    const character = ctx.character();
    checks.push(
      t.filipinoDairyExceptionClaimed && character.status !== 'MET'
        ? ctx.check(
            character.id,
            '特定历史奶农品格条款',
            'Historical dairy-worker character exception',
            undefined,
            [...character.sources, ...ref('SRC-230', 'RV4.20.10')],
            '须核实菲律宾奶农历史签证、后续披露及其他品格条件。',
            'INZ must verify the historical Filipino dairy visas, later disclosures and remaining character grounds.',
            'PD-221',
          )
        : character,
    );
    checks.push(formerReview(ctx, pr), furtherPolice(ctx, pr));
  }
  const fee =
    action === 'variation'
      ? p.residentFeeReference.value.variation
      : p.residentFeeReference.value.subsequent;
  checks.push(
    ...residentFilingChecks(ctx),
    ...(action === 'subsequent'
      ? [ctx.residenceFamilyFiling('subsequent')]
      : []),
    ctx.check(
      'NZ-P1-FEE',
      '旅行申请费用',
      'Travel application fee',
      undefined,
      p.residentFeeReference.sources,
      `官方费用审查表参考 NZ$${fee}，递交费率须查询 INZ。`,
      `Official review reference NZ$${fee}. Confirm the filing charge with INZ.`,
      'PD-225',
    ),
  );
  return ctx.path(
    'NZ-TRAVEL',
    '居民签证旅行条件',
    'Resident visa travel conditions',
    checks,
    ['NZ-P1-FEE', 'NZ-P1-3'],
  );
}

function commitmentMet(
  pr: PrvEvidence,
  r: ResidentRecord,
  on: string,
  counts: [number, number] | undefined,
  legacyDaysMet?: boolean,
) {
  const ordinary =
    legacyDaysMet ?? counts?.every((days) => days >= time.prvPortionDays.value);
  const alternatives = pr.otherCommitments?.map((method) => {
    switch (method) {
      case 'tax':
        return all(
          counts?.every((days) => days >= time.prvTaxPortionDays.value),
          pr.taxResidenceConfirmedForWholePeriod,
          pr.treatyResidentElsewhere === undefined
            ? undefined
            : !pr.treatyResidentElsewhere,
        );
      case 'legacy-investment':
        return pr.oldBusinessInvestorConditionsMet;
      case 'investment':
        return all(
          atLeast(pr.qualifyingNzInvestmentNzd, commitment.investmentNzd),
          atLeast(pr.investmentMonthsAfterGrant, commitment.investmentMonths),
        );
      case 'business':
        return all(
          any(
            pr.businessFoundedOrPurchased,
            atLeast(pr.businessSharePercent, commitment.businessSharePercent),
          ),
          atLeast(
            pr.successfulBusinessMonthsImmediatelyBeforeApplication,
            commitment.businessMonths,
          ),
          pr.goingConcernAccountsCertified,
        );
      case 'base': {
        const home =
          pr.homePurchasedOn && r.first
            ? pr.homePurchasedOn >= r.first &&
              pr.homePurchasedOn <=
                addMonths(r.first, commitment.homePurchaseMonths) &&
              pr.homePurchasedOn <= on
            : undefined;
        return all(
          pr.includedFamilyDaysInTwoYears?.every(
            (days) => days >= time.prvPortionDays.value,
          ),
          atLeast(counts?.[0], time.prvTaxPortionDays.value),
          any(
            all(home, pr.stillOwnAndOccupyFamilyHome),
            atLeast(
              pr.qualifyingEmploymentMonthsInTwoYears,
              commitment.employmentMonths,
            ),
          ),
        );
      }
    }
  });
  return any(ordinary, ...(alternatives ?? [undefined]));
}

function attachedConditions(
  ctx: NzContext,
  a: PrvEvidence,
  forCitizenship: boolean,
) {
  if (hasDate(ctx.time.permanentResidentVisa, ctx.date)) return true;
  if (a.conditions === 'none' || a.conditions === 'confirmed') return true;
  if (a.conditions === 'outstanding' || a.conditions === 'breached')
    return false;
  if (a.conditions === 'compliant-pending') return undefined;
  return ctx.time.conditions === 'none'
    ? true
    : ctx.time.conditions === 'outstanding'
      ? false
      : ctx.time.conditions === 'met' && forCitizenship
        ? true
        : undefined;
}

function prvPath(
  ctx: NzContext,
  a: NzResidentAnswers,
  r: ResidentRecord,
  old?: NzPathway,
): CountryPathway {
  const pr = a.prv ?? {};
  const checks: CountryCheck[] = [];
  const finish = () =>
    ctx.path('NZ-PRV', '永久居民签证', 'Permanent Resident Visa', checks, [
      'NZ-P2-7',
    ]);
  if (hasDate(ctx.time.permanentResidentVisa, ctx.date))
    return {
      id: 'NZ-PRV',
      title: ctx.L('永久居民签证', 'Permanent Resident Visa'),
      checks: [],
      assumptions: [],
      status: 'NOT_APPLICABLE' as const,
      summary: ctx.L(
        '已持永久居民签证。',
        'You already hold a Permanent Resident Visa.',
      ),
    };
  const linked =
    pr.role === 'linked' || (ctx.time.nonPrincipal === true && !pr.role);
  const unclearRole =
    pr.role === 'independent-review' ||
    (!pr.role && ctx.time.nonPrincipal !== false);
  const investor =
    pr.category === 'active-investor-plus' ||
    pr.category === 'migrant-investor' ||
    pr.category === 'parent-retirement' ||
    ctx.time.residentVisa?.category.startsWith('aip-');
  const standardTimeChecks =
    r.standardTimeline && r.expired === false ? old?.checks : undefined;
  const fromPilot = (locator: string) =>
    standardTimeChecks?.find((check) =>
      check.sources.some((source) => source.locator === locator),
    )?.met;
  const holdingEnd = r.expired && r.lapse ? r.lapse : ctx.date;
  const held =
    fromPilot('RV2.5(a)(i)') ??
    (r.granted
      ? daysBetween(r.granted, holdingEnd) >= time.prvHeldDays.value
      : undefined);
  const grace =
    r.expired && r.lapse
      ? investor
        ? ctx.date <=
          addMonths(r.lapse, p.formerResident.value.investorGraceMonths)
        : daysBetween(r.lapse, ctx.date) <=
          p.formerResident.value.ordinaryGraceDays
      : r.expired === false
        ? true
        : undefined;
  const roleEligible = unclearRole
    ? undefined
    : linked
      ? pr.principalHoldsPrv
      : true;
  checks.push(
    ctx.check(
      'NZ-P2-6',
      '原申请身份与首次居民入境',
      'Original application role and first resident entry',
      all(r.entered, roleEligible),
      ref('SRC-072', 'RV1.5(d), RV1.20(b), RV1.20.1–.20'),
      '随同者通常随原主申获永居，无需自行满足在境天数。离异、保护令、主申定罪、死亡或入籍时，核对独立评估或子女的监护及居住证明。',
      'Linked applicants normally qualify through their original principal. For separation, protection orders, convictions, death or citizenship, verify independent assessment or the child’s custody and household.',
      'PD-222',
    ),
  );
  if (!linked) {
    if (investor) {
      checks.push(
        ctx.check(
          'NZ-P2-3',
          '投资类居民持签期',
          'Investor residence period',
          all(held, grace),
          ref('SRC-072', 'RV2.10(a)–(b)'),
          `投资、父母退休或 AIP 申请人须持居民签满 ${time.prvHeldDays.value} 天，若已失效须在 ${p.formerResident.value.investorGraceMonths} 个自然月内申请。`,
          `Migrant investors, Parent Retirement and AIP holders need ${time.prvHeldDays.value} days on residence; former holders must apply within ${p.formerResident.value.investorGraceMonths} calendar months.`,
        ),
      );
    } else {
      checks.push(
        ctx.check(
          'NZ-P2-1',
          '连续持签与首次居民入境期',
          'Continuous residence visa and first resident day',
          all(
            held,
            grace,
            fromPilot('RV2.5(b)') ??
              (r.first
                ? daysBetween(r.first, ctx.date) >= time.prvFirstDayDays.value
                : undefined),
          ),
          [...time.prvHeldDays.sources, ...p.formerResident.sources],
          `持签和首次居民入境分别满 ${time.prvHeldDays.value} 天。曾持有人须在签证失效前满足持签期；${p.formerResident.value.ordinaryGraceDays} 天宽限从实际失效日起算，缺该日期时待确认。`,
          `Check ${time.prvHeldDays.value} days on the visa and since first resident entry. A former holder must meet the holding period before expiry. The ${p.formerResident.value.ordinaryGraceDays}-day grace period needs the actual lapse date.`,
        ),
      );
      const oldPortions = standardTimeChecks?.filter((check) =>
        check.sources.some((source) => source.locator === 'RV2.5.1'),
      );
      const legacyDaysMet = oldPortions?.length
        ? all(...oldPortions.map((check) => check.met))
        : undefined;
      const needsCounts =
        !oldPortions?.length ||
        (legacyDaysMet !== true &&
          pr.otherCommitments?.some(
            (method) => method === 'tax' || method === 'base',
          ));
      const counts = needsCounts ? r.portions(ctx.date) : undefined;
      const details =
        oldPortions?.map((check) => check.text).join(' / ') ??
        counts?.join(', ');
      checks.push(
        ctx.check(
          'NZ-P2-2',
          '对新西兰的五种承诺证明',
          'Five ways to show commitment',
          commitmentMet(pr, r, ctx.date, counts, legacyDaysMet),
          [
            ...ref('SRC-072', 'RV2.5.1–RV2.5.20; RV1.15.5, RV1.15.10'),
            ...ref('SRC-247', 'Becoming a New Zealand tax resident'),
          ],
          `两个区间各需 ${time.prvPortionDays.value} 天（${details ?? '待填写'}）。未达时可选择税务居民、投资、经营或安家，以 IRD 证明、合规投资、认证账目或家庭及工作证据核对。`,
          `Each portion needs ${time.prvPortionDays.value} resident days (${details ?? 'unknown'}). Alternative evidence is confirmed tax residence, qualifying investment, certified business accounts, or family and work/home records.`,
          'PD-222',
        ),
      );
    }
    let conditions = attachedConditions(ctx, pr, false);
    if (
      ctx.time.residentVisa?.category === 'religious-worker' &&
      r.first &&
      ctx.date < afterYears(r.first, time.religiousWorkerYears.value)
    )
      conditions = false;
    checks.push(
      ctx.check(
        'NZ-P2-4',
        '居民签证附加条件',
        'Conditions on residence',
        conditions,
        ref('SRC-072', 'RV2.5(d), RV2.10(b)(iii)'),
        '须已满足全部 s49/s50 条件。投资、担保或工作条件期满时应核对 INZ 书面确认，可免费申请解除。',
        'All s49/s50 conditions must be fulfilled. Verify INZ confirmation of investment, sponsorship or work conditions; removal is free.',
        'PD-222',
      ),
    );
  }
  checks.push(
    ...residentFilingChecks(ctx),
    ctx.character(),
    furtherPolice(ctx, pr),
    ctx.check(
      'NZ-P2-5',
      '驱逐责任与体检豁免',
      'Deportation liability and medical exemption',
      all(
        not(a.travel?.restrictedEntry),
        pr.deportationLiability === undefined
          ? undefined
          : pr.deportationLiability === 'none',
      ),
      ref('SRC-230', 'RV2.1(b)–(d)'),
      '入境禁令、现行驱逐责任或责任暂停期阻止通常申请。永久居民签证无需重新体检或英语测试。',
      'An entry ban, deportation liability or its suspension bars ordinary application. No fresh medical examination or English test is required.',
    ),
  );
  if (r.expired) checks.push(formerReview(ctx, pr));
  checks.push(
    ctx.check(
      'NZ-P2-7',
      '永久居民申请费用',
      'Permanent residence fee',
      undefined,
      p.residentFeeReference.sources,
      `官方费用审查表参考 NZ$${p.residentFeeReference.value.permanent}。独立递表须另付，递交时向 INZ 核对。`,
      `Official review reference NZ$${p.residentFeeReference.value.permanent}. Separate applications attract separate charges; confirm with INZ.`,
      'PD-225',
    ),
  );
  const path = finish();
  // Keep the original standard-route projection only if non-time conditions are known.
  const onlyTime = checks
    .filter((c) => !['NZ-P2-1', 'NZ-P2-2', 'NZ-P2-7'].includes(c.id))
    .every((c) => c.status === 'MET');
  if (
    !investor &&
    !linked &&
    onlyTime &&
    r.standardTimeline &&
    r.expired === false &&
    old?.status === 'FUTURE' &&
    pr.otherCommitments?.length === 0
  )
    return {
      ...path,
      status: 'FUTURE' as const,
      earliestDate: old.earliestDate,
      assumptions: old.assumptions,
    };
  return {
    ...path,
    ...(path.status === 'MET' ? { earliestDate: ctx.date } : {}),
  };
}

function assessPrv(ctx: NzContext, answers: NzResidentAnswers) {
  const old =
    ctx.history &&
    evaluateNewZealand(ctx.history).pathways.find((p) => p.id === 'NZ-PRV');
  return prvPath(ctx, answers, residentRecord(ctx, answers), old);
}

function includedPrv(ctx: NzContext, member: NzDependantAnswers, date: string) {
  const application = member.prvApplication;
  const role = application?.prv?.role;
  if (!role || role === 'independent-review') return undefined;
  const person = createNzContext(
    {
      ...application,
      dateOfBirth: member.dateOfBirth,
      simulationDate: date,
      locale: ctx.locale,
    },
    { ...member, dependants: [], requiredFeePaid: ctx.requiredFeePaid },
  );
  return assessPrv(person, {
    travel: application.travel,
    prv: {
      ...application.prv,
      principalHoldsPrv: any(
        application.prv?.principalHoldsPrv,
        application.linkedToJointPrincipal,
      ),
    },
  });
}

function jointPrvPath(
  ctx: NzContext,
  resident: NzResidentAnswers,
  principal: CountryPathway,
): CountryPathway {
  if (principal.status === 'NOT_APPLICABLE') return principal;
  const members = (ctx.answers.dependants ?? []).filter(
    (person) => person.relation === 'partner' || person.relation === 'child',
  );
  const filing = ctx.residenceFamilyFiling('permanent');

  const individual = members.map((member) =>
    includedPrv(ctx, member, ctx.date),
  );
  const firstPartner = members.findIndex(
    (member) => member.relation === 'partner',
  );
  const memberChecks = members.map((member, index) => {
    const own = individual[index];
    const partner = member.relation === 'partner';
    const id =
      partner && index === firstPartner
        ? 'NZ-P2-PARTNER'
        : `NZ-P2-${partner ? 'PARTNER' : 'CHILD'}-${index + 1}`;
    const detail =
      own?.status === 'FUTURE'
        ? own.earliestDate
        : own?.checks
            .filter((c) => own.decidedBy?.includes(c.id) && c.status !== 'MET')
            .map((c) => c.title)
            .join(', ');
    return ctx.check(
      id,
      partner
        ? '同表伴侣的永久居民资格'
        : `同表子女的永久居民资格（随行人 ${index + 1}）`,
      partner
        ? 'Permanent residence eligibility of the included partner'
        : `Permanent residence eligibility of child (family member ${index + 1})`,
      !own || own.status === 'UNKNOWN' ? undefined : own.status === 'MET',
      ref('SRC-072', 'RV1.20(a)–(b), RV1.20.5 and examples; RV2.5, RV2.10'),
      `核对本人原居民签的申请角色。独立获签者按自己的首入、持签、承诺和附加条件判断。原随同者按与原主申的关系核对。${detail ? '个人评估：' + detail + '。' : ''}`,
      `Check this member’s original residence role. Independently granted residents qualify on their own entry, residence, commitment and conditions. Linked members qualify through their original principal.${detail ? ' Individual assessment: ' + detail + '.' : ''}`,
      'PD-222',
    );
  });
  const joint = ctx.path(
    principal.id,
    '永久居民签证',
    'Permanent Resident Visa',
    [...principal.checks, filing, ...memberChecks],
    ['NZ-P2-7'],
  );
  const results = [principal, ...individual];
  if (
    filing.status === 'NOT_MET' ||
    results.some((result) => result?.status === 'NOT_MET')
  )
    return joint;
  const allDatesKnown =
    filing.status === 'MET' && results.every((result) => result?.earliestDate);
  const date = results.reduce(
    (latest, result) =>
      result?.earliestDate && result.earliestDate > latest
        ? result.earliestDate
        : latest,
    ctx.date,
  );
  if (date === ctx.date || !members.length) {
    if (!allDatesKnown)
      return { ...joint, status: 'UNKNOWN', earliestDate: undefined };
    return {
      ...joint,
      status: date === ctx.date ? 'MET' : 'FUTURE',
      earliestDate: date,
      assumptions: principal.assumptions,
    };
  }

  // Recheck the whole application on the first date everyone could file together.
  const later = createNzContext(
    { ...ctx.time, simulationDate: date },
    ctx.answers,
  );
  const projected = [
    assessPrv(later, resident),
    ...members.map((member) => includedPrv(ctx, member, date)),
  ];
  if (!allDatesKnown || projected.some((result) => result?.status !== 'MET')) {
    // Once any child ages out or a resident's expiry grace ends, waiting longer cannot help.
    const agedOut = projected[0]?.checks.some(
      (c) => c.id === 'NZ-DEPENDANTS' && c.status === 'NOT_MET',
    );
    const pastGrace = projected.some(
      (result, index) =>
        results[index]?.earliestDate &&
        result?.checks.some(
          (c) =>
            (c.id === 'NZ-P2-1' || c.id === 'NZ-P2-3') &&
            c.status === 'NOT_MET',
        ),
    );
    const forecast = ctx.check(
      'NZ-P2-JOINT-DATE',
      '预测日的同表申请资格',
      'Joint application eligibility on the projected date',
      agedOut || pastGrace ? false : undefined,
      [
        ...ref('SRC-230', 'R2.1.30–35'),
        ...ref('SRC-072', 'RV1.20, RV2.5, RV2.10'),
      ],
      agedOut
        ? `到 ${date}，已有子女不符合该年龄段的随行条件。`
        : pastGrace
          ? `到 ${date}，先达标的申请人已超过签证失效宽限期。`
          : `根据所填资料，无法确认所有申请人在 ${date} 同时满足永居条件。`,
      agedOut
        ? `By ${date}, a child no longer meets the inclusion requirements for their age.`
        : pastGrace
          ? `By ${date}, an applicant who qualified earlier is outside the visa expiry grace period.`
          : `The evidence does not establish that all applicants qualify together on ${date}.`,
      'PD-222',
    );
    return {
      ...joint,
      checks: [...joint.checks, forecast],
      decidedBy: [...(joint.decidedBy ?? []), forecast.id],
      pendingDetails: [
        ...new Set([
          ...(joint.pendingDetails ?? []),
          ...(forecast.pendingDetails ?? []),
        ]),
      ],
      summary: forecast.explanation,
      status: forecast.status,
      earliestDate: undefined,
    };
  }
  return {
    ...joint,
    status: 'FUTURE',
    earliestDate: date,
    assumptions: [
      ...new Set(results.flatMap((result) => result?.assumptions ?? [])),
    ],
  };
}

function citizenshipCharacter(
  ctx: NzContext,
  c: CitizenshipEvidence,
): boolean | undefined {
  // Clean Slate convictions are omitted from the questionnaire.
  const recent = (date: string | undefined, years: number) =>
    date !== undefined && date <= ctx.date && ctx.date < addYears(date, years);
  const barred =
    atLeast(c.longestPrisonYears, conviction.permanentBarYears) ||
    recent(c.lastShortSentenceOrParoleOn, conviction.custodialBarYears) ||
    recent(c.lastNonCustodialConvictionOn, conviction.otherBarYears);
  if (barred && c.ministerialConvictionException !== 'granted')
    return c.ministerialConvictionException === 'requested' ? undefined : false;
  if (c.character === 'protection-order') return false;
  if (
    c.character !== 'clear' ||
    atLeast(c.demeritPoints, conviction.demeritsForReview) ||
    (c.lastShortSentenceOrParoleOn &&
      c.lastShortSentenceOrParoleOn <= ctx.date) ||
    (c.lastNonCustodialConvictionOn &&
      c.lastNonCustodialConvictionOn <= ctx.date) ||
    (c.longestPrisonYears !== undefined && c.longestPrisonYears > 0)
  )
    return undefined;
  return true;
}

function citizenshipPath(
  ctx: NzContext,
  a: NzResidentAnswers,
  r: ResidentRecord,
  old?: NzPathway,
) {
  const c = a.citizenship ?? {};
  const dob = ctx.time.dateOfBirth;
  const adultAge = time.citizenshipMinAge.value;
  const reviewThrough = addMonths(ctx.date, grant.possibleDecisionMonths);
  const crosses =
    dob &&
    [grant.childReviewAge, adultAge].some(
      (threshold) =>
        ctx.date < afterYears(dob, threshold) &&
        afterYears(dob, threshold) <= reviewThrough,
    );
  const age = c.ageAtDecision ?? (crosses ? undefined : ctx.age);
  const young = age === undefined ? undefined : age < grant.childReviewAge;
  const minor = age === undefined ? undefined : age < adultAge;
  const checks: CountryCheck[] = [];
  const entitled =
    r.expired === true && !hasDate(ctx.time.permanentResidentVisa, ctx.date)
      ? false
      : (c.entitlementConfirmed ??
        (hasDate(ctx.time.permanentResidentVisa, ctx.date)
          ? true
          : all(r.entered, not(r.expired))));
  checks.push(
    ctx.check(
      'NZ-P3-1-STATUS',
      '无限期居留及附加条件',
      'Indefinite residence and visa conditions',
      all(entitled, attachedConditions(ctx, a.prv ?? {}, true)),
      ref('SRC-070', 's8(2)(a), s8(3)'),
      '须有无限期居留权，签证条件已履行或取消；可在居民签证阶段申请。',
      'Indefinite residence and fulfilled or cancelled visa conditions are required. A resident visa can qualify.',
    ),
  );
  const presenceChecks = (r.standardTimeline ? old : undefined)?.checks.filter(
    (check) =>
      check.sources.some(
        (source) =>
          source.srcId === 'SRC-070' && source.locator.startsWith('s8(2)(b)'),
      ),
  );
  let standard =
    presenceChecks && presenceChecks.length > 0
      ? all(...presenceChecks.map((check) => check.met))
      : undefined;
  // Special first-entry rules and a missing DOB can bypass the pilot's standard adult branch.
  if (standard === undefined && r.entryValid === true) {
    const years = Array.from(
      { length: time.citizenshipWindowYears.value },
      (_, i) =>
        r.residentDays(addYears(ctx.date, -i - 1), addYears(ctx.date, -i)),
    );
    if (years.every((n) => n !== undefined))
      standard =
        years.every((n) => n >= time.citizenshipYearDays.value) &&
        years.reduce((sum, n) => sum + n, 0) >= time.citizenshipTotalDays.value;
  }
  const childException = all(minor, c.parentCitizenOrAboutToBe);
  let special: boolean | undefined;
  if (c.presenceException === 'none') special = false;
  else if (c.presenceException === 'exceptional')
    special = all(
      atLeast(
        c.exceptionalResidentDaysInWindow ??
          r.residentDays(
            addMonths(ctx.date, -grant.exceptionalPresenceMonths),
            ctx.date,
          ),
        grant.exceptionalPresenceDays,
      ),
      c.specialPresenceAcceptedByDia,
    );
  else if (c.presenceException) special = c.specialPresenceAcceptedByDia;
  const presence = any(standard, childException, special);
  checks.push(
    ctx.check(
      'NZ-P3-1-PRESENCE',
      '在境或法定例外',
      'Presence or statutory exception',
      presence,
      [
        ...time.citizenshipTotalDays.sources,
        ...time.citizenshipYearDays.sources,
        ...ref('SRC-231', 'pp7–11; s8(4)–(7)'),
      ],
      (presenceChecks ?? []).map((check) => check.text).join('。') +
        ` 标准路径按 DIA 在惠灵顿收到完整申请并缴费的日期计算。父母入籍的子女、王国领地或 Crown Service 可用替代依据；例外情形须近 ${grant.exceptionalPresenceMonths} 个月至少 ${grant.exceptionalPresenceDays} 天且获认可。`,
      (presenceChecks ?? []).map((check) => check.text).join('. ') +
        ` Use the Wellington receipt date of a complete paid application. A citizen parent, Realm residence or Crown service may qualify. Exceptional circumstances require at least ${grant.exceptionalPresenceDays} days in ${grant.exceptionalPresenceMonths} months and acceptance by DIA.`,
      'PD-223',
    ),
  );
  checks.push(
    ctx.check(
      'NZ-P3-2',
      '批准日年龄与完全行为能力',
      'Age at decision and full capacity',
      age === undefined
        ? undefined
        : any(
            minor,
            c.fullCapacity,
            c.capacityException === 'referred'
              ? undefined
              : c.capacityException === 'granted',
          ),
      ref('SRC-231', 'pp6–7, 23; ss8(1), 9(1)(a), 9(1)(c)'),
      '按批准日年龄判断。成人须有完全行为能力，或已获部长特许；已转呈而尚未决定时待确认。',
      'Assess age at decision. Adults need full capacity or a ministerial grant. A pending referral requires an individual decision.',
      'PD-223',
    ),
  );
  checks.push(
    ctx.check(
      'NZ-P3-3',
      '入籍品格及刑事禁止期',
      'Citizenship character and conviction bars',
      any(young, citizenshipCharacter(ctx, c)),
      p.conviction.sources,
      `须披露未受 Clean Slate 保护的定罪、未决指控、保护令及违章记录。监禁满 ${conviction.permanentBarYears} 年、近 ${conviction.custodialBarYears} 年较短监禁或假释、近 ${conviction.otherBarYears} 年非监禁定罪受 s9A 限制；其他不利信息须个案裁定。`,
      `Disclose unshielded convictions, charges, protection orders and infringements. Section 9A covers terms of ${conviction.permanentBarYears}+ years, shorter sentences or parole within ${conviction.custodialBarYears} years, and non-custodial convictions within ${conviction.otherBarYears} years. Other adverse records require review.`,
      'PD-223',
    ),
  );
  const overseasTrigger =
    (c.overseasMonthsRecent ?? 0) > conviction.overseasRecentMonths ||
    (c.overseasMonthsLong ?? 0) > conviction.overseasLongMonths;
  const police =
    c.foreignPoliceEvidence === 'requested-outstanding'
      ? false
      : c.foreignPoliceEvidence === 'provided' ||
          c.foreignPoliceEvidence === 'not-requested' ||
          (!overseasTrigger &&
            c.overseasMonthsRecent !== undefined &&
            c.overseasMonthsLong !== undefined)
        ? true
        : undefined;
  checks.push(
    ctx.check(
      'NZ-P3-3-POLICE',
      '海外无犯罪证明',
      'Overseas police clearances',
      any(young, police),
      ref('SRC-232', 'Character requirements → Police clearances'),
      `近 ${conviction.overseasRecentYears} 年在一国超过 ${conviction.overseasRecentMonths} 个月或近 ${conviction.overseasLongYears} 年超过 ${conviction.overseasLongMonths} 个月，DIA 可要求当地证明。`,
      `DIA may request clearance for more than ${conviction.overseasRecentMonths} months in a country in the last ${conviction.overseasRecentYears} years, or over ${conviction.overseasLongMonths} months in the last ${conviction.overseasLongYears} years.`,
      'PD-223',
    ),
  );
  const exemption = any(
    minor,
    age === undefined || age === grant.testExemptAge
      ? undefined
      : age > grant.testExemptAge,
    c.testExemptionConfirmed,
    c.english === 'waived',
    c.fullCapacity === false,
  );
  const testDate =
    old?.status === 'FUTURE' && old.earliestDate && presence !== true
      ? old.earliestDate
      : ctx.date;
  const test =
    testDate < p.citizenshipTestReviewFrom.value || exemption === true
      ? true
      : undefined;
  checks.push(
    ctx.check(
      'NZ-P3-4',
      '公民责任声明与考试',
      'Citizenship declaration and test',
      all(any(young, c.understandsResponsibilities), test),
      [
        ...ref('SRC-231', 'p18, s8(2)(d)'),
        ...p.citizenshipTestReviewFrom.sources,
      ],
      `当前由申请人确认理解责任与特权。官方拟于 ${p.citizenshipTestReviewFrom.value.slice(0, 4)} 年底实施考试，本评估从该年下半年起提示实施日及考试费待定。`,
      `Applicants currently confirm that they understand their responsibilities and privileges. DIA announced a test for late ${p.citizenshipTestReviewFrom.value.slice(0, 4)}. This assessment flags the second half of that year pending a start date and fee.`,
      'PD-224',
    ),
  );
  const english =
    c.english === 'evidenced' || c.english === 'waived'
      ? true
      : c.english === 'insufficient'
        ? false
        : undefined;
  checks.push(
    ctx.check(
      'NZ-P3-5',
      '日常英语沟通',
      'Everyday spoken English',
      any(young, english),
      ref('SRC-231', 'pp18–19, s8(2)(e), s8(8)'),
      '按日常独立沟通、已认可证据或已批豁免判断。面试或困难豁免申请仍待裁定。',
      'Evidence of independent everyday English or an approved waiver qualifies. A pending interview or hardship waiver needs a decision.',
      'PD-223',
    ),
  );
  const intent =
    c.residenceIntent === 'emigrate'
      ? false
      : c.residenceIntent === 'nz-or-realm' ||
          c.residenceIntent === 'documented-overseas-service'
        ? true
        : undefined;
  checks.push(
    ctx.check(
      'NZ-P3-6',
      '继续居住意图',
      'Intention to reside',
      intent,
      ref('SRC-231', 'pp20–21, s8(2)(f), s8(9)(b)'),
      '继续在新西兰或王国领地居住，或有符合条文的政府、国际机构、NZ 雇主服务证明。随同公民伴侣海外公职或长期出境须核对证据。',
      'Intend to reside in NZ or the Realm, or document qualifying Crown, international or NZ employment. DIA assesses accompanying a citizen partner in service or a prolonged absence.',
      'PD-223',
    ),
  );
  checks.push(
    ctx.check(
      'NZ-P3-7-IDENTITY',
      '身份文件与见证人',
      'Identity documents and witness',
      c.identityDocumentsAndWitness,
      ref('SRC-231', 'p36; Establishing identity'),
      '确认身份材料及合格见证人齐备；替代材料须经 DIA 认可。',
      'Confirm the identity evidence and a qualified witness. Alternative documents must be accepted by DIA.',
      'PD-223',
    ),
  );
  checks.push(
    filingFee(ctx, true),
    ctx.check(
      'NZ-P3-7-OATH',
      '获批后的宣誓',
      'Oath after approval',
      any(
        young,
        c.fullCapacity === false,
        c.oath === undefined ? undefined : c.oath !== 'unwilling',
      ),
      ref('SRC-231', 'pp29–32; Regulation 7(3)'),
      `通常须在收到批准通知 ${grant.oathYears} 年内宣誓或确认，否则批准失效。已获豁免者除外。`,
      `Normally take the oath or affirmation within ${grant.oathYears} year of written advice or the grant lapses. Approved exemptions apply.`,
    ),
  );
  const fee =
    c.feeCategory === 'samoa-s7a'
      ? p.grantFee.value.samoa7A
      : ctx.age === undefined
        ? undefined
        : ctx.age < adultAge
          ? p.grantFee.value.child
          : p.grantFee.value.adult;
  const feeKnown =
    c.feeCategory !== undefined &&
    fee !== undefined &&
    ctx.date >= p.grantFeeEffective.value;
  checks.push(
    ctx.check(
      'NZ-P3-7-FEE',
      '入籍申请费',
      'Citizenship application fee',
      feeKnown ? true : undefined,
      p.grantFee.sources,
      feeKnown
        ? `按递交年龄及类别，已公布申请费 NZ$${fee}。`
        : '须确认递交年龄、类别及该日适用费率。',
      feeKnown
        ? `Published filing fee for the age and category: NZ$${fee}.`
        : 'Confirm filing age, category and applicable fee.',
      'PD-225',
    ),
  );
  const path = ctx.path(
    'NZ-CITIZENSHIP',
    '归化入籍',
    'Citizenship by grant',
    checks,
    ['NZ-P3-7-OATH', 'NZ-P3-7-FEE'],
  );
  if (
    r.standardTimeline &&
    old?.status === 'FUTURE' &&
    presence === false &&
    checks
      .filter(
        (item) =>
          !['NZ-P3-1-PRESENCE', 'NZ-P3-7-OATH', 'NZ-P3-7-FEE'].includes(
            item.id,
          ),
      )
      .every((item) => item.status === 'MET')
  )
    return {
      ...path,
      status: 'FUTURE' as const,
      earliestDate: old.earliestDate,
      assumptions: old.assumptions,
    };
  return {
    ...path,
    ...(path.status === 'MET' ? { earliestDate: ctx.date } : {}),
  };
}

export function residentPathways(
  ctx: NzContext,
  answers: NzResidentAnswers,
  pilot?: NzResult,
): CountryPathway[] {
  const record = residentRecord(ctx, answers);
  const find = (id: NzPathway['id']) =>
    pilot?.pathways.find((item) => item.id === id);
  const permanent = prvPath(ctx, answers, record, find('NZ-PRV'));
  return [
    travelPath(ctx, answers, record, permanent, find('NZ-TRAVEL')),
    jointPrvPath(ctx, answers, permanent),
    citizenshipPath(ctx, answers, record, find('NZ-CITIZENSHIP')),
  ];
}
