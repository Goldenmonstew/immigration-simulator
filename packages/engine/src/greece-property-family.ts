import { greeceFull2026_11, grSource } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addDays, addMonths, addYears, daysBetween, fullYears } from './dates';
import { monthSpan } from './pilot';
import { overseasInvestorFiling } from './greece-common';
import type { GrFullRequest } from './greece-full';
import {
  absencePeriods,
  ageOn,
  all,
  any,
  insuranceMet,
  underAgeOn,
} from './greece-rules';
import type { GrContext } from './greece-rules';
import type { IsoDate } from './types';

type Answer = boolean | undefined;
type PropertyPath = 'GR-GOLDEN-VISA' | 'GR-GREEK-FAMILY-PR' | 'GR-EU-FAMILY-PR';

interface InvestorFamilyMember {
  // A third-country family member applying for a residence card alongside the investor.
  // spouse-partner is the earlier combined answer for a spouse or registered partner.
  kind:
    | 'spouse'
    | 'registered-partner'
    | 'spouse-partner'
    | 'ascendant'
    | 'child'
    | 'other';
  /** Relationship records and, as applicable, travel/entry or prior card, custody, unchanged-family declaration and renewal tax evidence. */
  filingDocumentsReady?: boolean;
  birthDate?: IsoDate;
  // For children of only one parent, that parent must have legal custody.
  unmarriedWithRequiredCustody?: boolean;
  incapacityDocumentedAndLivingAsDependant?: boolean;
  convertingPreviousFamilyCard?: boolean;
}

interface GoldenVisaAnswers {
  stage?: 'initial' | 'renewal';
  /** If supplied, assess completion of the application already filed from abroad. */
  overseasFilingDate?: IsoDate;
  /** Entry and completion of the outstanding insurance and biometric evidence. */
  overseasEvidenceCompletedOn?: IsoDate;
  regime?: 'current' | 'legacy-card' | 'transition';
  /** Legal basis recorded in the original grant, for use restrictions at renewal. */
  originalGrantTier?: 'standard' | 'conversion' | 'listed';
  originalConditionsStillMet?: boolean;
  // Original statutory zone for a transitional investment (older issued cards retain their grant conditions).
  legacyZone?: 'legacy-high' | 'legacy-other';
  depositPercent?: number;
  depositDate?: IsoDate;
  closingDate?: IsoDate;
  replacementProperty?: boolean;
  kind?:
    | 'standard'
    | 'construction'
    | 'conversion'
    | 'factory-conversion'
    | 'listed';
  zone?: 'named-high-cost' | 'other-mainland' | 'other-island';
  censusPopulation?: number;
  propertyCount?: number;
  // Combined price for spouses/partners, own share for unrelated co-owners.
  qualifyingValueEur?: number;
  acquisition?: 'purchase' | 'inheritance' | 'parental-gift';
  // Personal ownership categories denote full ownership and possession of the qualifying share.
  title?:
    | 'sole'
    | 'spouses'
    | 'own-share'
    | 'wholly-owned-eu-company'
    | 'qualifying-tourist-lease'
    | 'qualifying-company-timeshare'
    | 'ineligible';
  /** Objective value recorded for an inheritance or parental gift. */
  assessedValueEur?: number;
  /** Evidence for this filing. True includes a lawyer's proof of completed registration. */
  registeredTransferEvidence?:
    boolean | 'application-receipt' | 'lawyer-application-certificate';
  /** At renewal, was proof of completed registration already submitted at the initial grant? */
  registrationProofSubmittedAtGrant?: boolean;
  /** Copy of the investor's Ε9 declaration for this filing. */
  e9DeclarationCopy?: boolean;
  /** The earlier document list expressly covered timeshare leases. */
  touristLeaseKind?: 'timeshare' | 'long-term-complex';
  /** ΕΟΤ certificate acknowledging this specific lease. */
  eotLeaseAcknowledgment?: boolean;
  builtOrBuildingPermit?: boolean;
  mainAreaSqm?: number;
  /** Whether the main spaces had been converted to housing by filing. */
  conversionComplete?: boolean;
  /** Physical completion date, also used under Circular 9/2024 before the 2025 decision. */
  conversionCompletedOn?: IsoDate;
  /** Date of the qualifying act certified by the engineer, including a file update or permit revision. */
  conversionActDate?: IsoDate;
  factoryIdleYears?: number;
  fullyPaidAndConditionsReleased?: boolean;
  payment?: 'bank-transfer' | 'crossed-cheque' | 'greek-pos' | 'other';
  payer?:
    'applicant' | 'spouse-partner' | 'relative-within-second-degree' | 'other';
  /** The notary attests the transaction, payment and previous use; for the listed tier this includes the listing gazette and any applicable additions. */
  notarialEvidence?: boolean;
  /** Title documents showing that the investor holds every share of the Greek/EU company. */
  companyOwnershipDocumentsReady?: boolean;
  /** Permit and building evidence required at filing, including contract/payment, valuation or completion evidence where applicable. */
  constructionDocumentsReady?: boolean;
  /** Signed no-short-letting declaration and, for the conversion tier, continued residential use and no business registration. */
  renewalUseDeclarationsReady?: boolean;
  use?:
    | 'residential-or-long-let'
    | 'short-let-or-short-sublet'
    | 'sharing-economy-short-let'
    | 'short-sublet'
    | 'sublet-terms-unknown'
    | 'long-tourist-sublet-with-services'
    | 'business-office';
  worksInGreeceUnderThisPermit?: boolean;
  retainsInvestment?: boolean;
  /** Restoration certified by the engineer at first renewal; on later renewals includes the previously certified completion. */
  listedRestorationComplete?: boolean;
  family?: InvestorFamilyMember[];
  // Include every person obtaining a consular national investment visa.
  nationalVisas?: number;
}

interface Retention {
  basis?:
    | 'widowhood'
    | 'divorce'
    | 'custody'
    | 'access-in-greece'
    | 'domestic-violence'
    | 'none';
  eventDate?: IsoDate;
  /** For access in Greece, the child covered by the continuing agreement or court order. */
  childBirthDate?: IsoDate;
  applicationDate?: IsoDate;
  marriageFrom?: IsoDate;
  // Petition date or consensual dissolution date; this may precede the final divorce.
  divorceDurationEnd?: IsoDate;
  greeceResidenceFrom?: IsoDate;
  livelihood?: 'employment' | 'qualifying-family' | 'resources' | 'none';
  resourcesAssessment?: 'accepted' | 'rejected' | 'pending';
}

interface FamilyResidence {
  stage?: 'initial' | 'permanent' | 'retained' | 'maintain';
  // First day of qualifying joint residence (including later lawful retained periods).
  residenceFrom?: IsoDate;
  qualifyingResidenceDocumented?: boolean;
  priorCardExpiry?: IsoDate;
  /** Actual acquisition of the permanent right, if known. */
  permanentRightAcquiredOn?: IsoDate;
  // Longest continuous absence since acquiring permanent residence.
  longestAbsenceAfterPrYears?: number;
  retention?: Retention;
}

interface GreekFamilyAnswers extends Omit<FamilyResidence, 'stage'> {
  stage?: FamilyResidence['stage'] | 'renewal';
  relationship?:
    | 'spouse'
    | 'registered-partner'
    | 'descendant'
    | 'child-with-incapacity'
    | 'ascendant'
    | 'parent-of-resident-greek-minor'
    | 'minor-sibling-of-resident-greek-minor'
    | 'dependent-needs-personal-care'
    | 'other';
  /** Greek marriage registration, or the earlier answer for a partnership concluded in Greece. */
  registeredInGreece?: boolean;
  partnershipConcludedAt?: 'greece' | 'greek-consulate' | 'other';
  /** Incapacity of a child of the Greek citizen or spouse, documented by a recognised decision or equivalent, with dependency and co-residence. */
  incapacityDocumentedAndLivingAsDependant?: boolean;
  /** Greek child or sibling through whom the applicant claims under Article 93(2). */
  greekRelativeBirthDate?: IsoDate;
  /** Date of the original Ο.3 for a family member admitted under Article 93(2). */
  initialCardGrantedOn?: IsoDate;
  /** Whether the expiring Ο.3 qualifies for automatic permanent conversion. */
  permanentRightAtCardExpiry?: boolean;
  /** Prior card, Greek sponsor ID, declaration of continued kinship, and renewed dependency evidence if required at grant. */
  ordinaryRenewalDocumentsReady?: boolean;
  /** Article 93(2) permits a single additional Ο.3 term for the sibling. */
  siblingExtensionAlreadyGranted?: boolean;
  dependent?: boolean;
  /** Applicable Article 25(1) sponsor ID, civil records, custody/adoption, dependency/care and support declarations. */
  initialFamilyDocumentsReady?: boolean;
  /** Prior card, applicable death, registered divorce/dissolution, custody, or hardship evidence and documents for the livelihood basis. */
  retainedRightDocumentsReady?: boolean;
  genuineRelationship?: boolean;
  /** For the initial Ο.3, does the applicant live in Greece on a stable basis? */
  stableResidenceInGreece?: boolean;
  appliedForFullPublicCover?: boolean;
  // Entry or subsequent qualifying civil-registry event (for an initial Ο.3).
  initialFilingFrom?: IsoDate;
  // Longest period of interrupted residence after the old card expired.
  interruptionAfterExpiryYears?: number;
  /** Former Μ.2 conversion: prior Greek family card (including registry) and all travel-document pages for the statutory period. */
  historicalConversionDocumentsReady?: boolean;
  // Longest absence over the declared joint residence for historical Article 161(1)(δ),(2).
  longestConsecutiveAbsenceYears?: number;
  // Annual maximum over the whole declared residence, using residence anniversaries.
  maxAnnualAbsenceMonths?: number;
  // All time beyond the ordinary limit is attributable to this exemption.
  extendedAbsence?: 'compulsory-service' | 'single-serious-reason' | 'ordinary';
  extendedAbsenceMonths?: number;
}

interface EuFamilyAnswers extends Omit<FamilyResidence, 'stage'> {
  stage?:
    | 'initial'
    | 'renewal'
    | 'permanent'
    | 'permanent-renewal'
    | 'retained'
    | 'maintain';
  /** Date of arrival for the first ordinary residence card. */
  arrivedOn?: IsoDate;
  /** Onset of the disease under public health review; EU-law restrictions apply only to qualifying diseases. */
  publicHealthConditionBeganOn?: IsoDate;
  appliedForFullPublicCover?: boolean;
  /** Article 59(2),(4),(6) ordinary renewal where the permanent right has not been acquired. */
  permanentRightAcquired?: boolean;
  partnerRenewal?: {
    sponsorConfirmsContinuingRelationship?: boolean;
    separationOn?: IsoDate;
    marriageFrom?: IsoDate;
    greeceResidenceFrom?: IsoDate;
    resourcesAssessment?: Retention['resourcesAssessment'];
  };
  /** False if no residence card was ever issued; a missing expiry alone leaves the deadline unknown. */
  priorCardIssued?: boolean;
  /** Legacy attestation for requests without separate sponsor and relationship answers. */
  qualifyingNonGreekEuSponsorAndRelationship?: boolean;
  qualifyingNonGreekEuSponsor?: boolean;
  relationship?:
    | 'spouse'
    | 'registered-partner'
    | 'descendant'
    | 'ascendant'
    | 'primary-carer-of-mobile-eu-minor'
    | 'durable-partner'
    | 'extended-family'
    | 'other';
  partnershipRecognisedAsMarriageEquivalent?: boolean;
  /** Dependency establishing the residence right of the sponsor's or either partner's direct relative. */
  dependent?: boolean;
  /** The child relies on this non-EU primary carer to exercise free movement in Greece. */
  primaryCare?: {
    childBirthDate?: IsoDate;
    /** Use self-sufficient if any of the claimed period relied on Article 7(1)(b).
     * Otherwise the child held worker/self-employed status or permanent residence throughout. */
    residenceBasis?:
      'self-sufficient' | 'worker-or-self-employed' | 'permanent';
    /** Resources and insurance for both during the Article 7(1)(b) period, from either person. */
    sufficientResourcesForBoth?: boolean;
    comprehensiveCoverForBoth?: boolean;
  };
  /** Recognised incapacity evidence, shared home and support for a child of either partner. */
  incapacityDocumentedAndLivingAsDependant?: boolean;
  /** The EU citizen's residence rests solely on the student provision in Article 7(1)(c). */
  studentSponsor?: boolean;
  /** Individual recognition as a family member under Article 3(2), including a student sponsor's ascendant. */
  extendedFamilyRecognised?: boolean;
  sponsorExercisedTreatyRights?: boolean;
  /** The applicable Article 59 dossier (for permanent renewal, the old permanent card) for the selected card, including applicable card/alternative residence evidence, relationship, event, resources and insurance evidence. */
  rightsDocumentsReady?: boolean;
  shamOrFraud?: boolean;
  /** Retention until the end of studies under Article 11(3). */
  schooling?: {
    sponsorEvent?: 'departure' | 'death';
    applicant?: 'child' | 'parent-with-actual-custody' | 'other';
    childResidesInGreece?: boolean;
    childStillEnrolledInGreece?: boolean;
  };
  // These pre-acquisition summaries cover the whole declared residence history.
  // The ordinary annual maximum excludes military service and the serious-reason absence.
  maxOrdinaryAnnualAbsenceMonths?: number;
  seriousAbsenceCount?: number;
  maxSeriousAbsenceMonths?: number;
  early?: {
    /** Retirement denotes a pension-age or actual employee early retirement event. */
    basis:
      | 'none'
      | 'retirement'
      | 'self-employed-retirement-without-pension'
      | 'permanent-incapacity'
      | 'occupational-incapacity'
      | 'worker-death'
      | 'occupational-death'
      | 'cross-border-worker';
    eventDate?: IsoDate;
    sponsorBirthDate?: IsoDate;
    sponsorResidentFrom?: IsoDate;
    precedingWorkMonths?: number;
    livedTogetherAtEvent?: boolean;
    greekSpouseDurationExemption?: boolean;
    survivingSpouseLostGreekNationalityByMarriage?: boolean;
    // Working in another Member State and returning to Greece at least weekly.
    weeklyReturnAndPriorContinuousWork?: boolean;
  };
}

export interface GrPropertyFamilyAnswers {
  goldenVisa?: GoldenVisaAnswers;
  greekFamily?: GreekFamilyAnswers;
  euFamily?: EuFamilyAnswers;
}

const p = greeceFull2026_11.values;
const investment = p.gvInvestment.value;
const family = p.gfPeriods.value;
const eu = p.efPeriods.value;
const [ordinaryMinDays, ordinaryMaxDays] = monthSpan(eu.ordinaryAbsenceMonths);

function minimum(value: number | undefined, threshold: number): Answer {
  return value === undefined ? undefined : value >= threshold;
}

function maximum(value: number | undefined, threshold: number): Answer {
  return value === undefined ? undefined : value <= threshold;
}

function beforeOrOn(date: IsoDate | undefined, cutoff: IsoDate): Answer {
  return date === undefined ? undefined : date <= cutoff;
}

function yearsBy(
  from: IsoDate | undefined,
  end: IsoDate | undefined,
  years: number,
): Answer {
  return from && end ? addYears(from, years) <= end : undefined;
}

type FamilyTrips = NonNullable<GrFullRequest['trips']>;

function ordinaryPeriodsWithinLimit(
  periods: ReturnType<typeof absencePeriods>,
): Answer {
  if (periods.length === 1) {
    const [period] = periods;
    return period.until <= addMonths(period.from, eu.ordinaryAbsenceMonths);
  }
  const days = periods.reduce(
    (total, period) => total + daysBetween(period.from, period.until),
    0,
  );
  if (days > ordinaryMaxDays) return false;
  return days <= ordinaryMinDays || undefined;
}

// SRC-377 §9.2 (pp. 45–46): count ordinary absences within actual residence years.
function ordinaryTripsWithinLimit(
  trips: FamilyTrips,
  from: IsoDate | undefined,
  until: IsoDate,
  residenceFrom: IsoDate | undefined,
): Answer {
  if (!residenceFrom)
    return (
      ordinaryPeriodsWithinLimit(absencePeriods(trips, from, until)) === true ||
      undefined
    );
  let result: Answer = true;
  for (let year = 0; addYears(residenceFrom, year) < until; year++) {
    const start = addYears(residenceFrom, year);
    const next = addYears(residenceFrom, year + 1);
    if (from && next <= from) continue;
    const periods = absencePeriods(
      trips,
      from && start < from ? from : start,
      next < until ? next : until,
    );
    const within = ordinaryPeriodsWithinLimit(periods);
    if (within === false) return false;
    if (within === undefined) result = undefined;
  }
  return result;
}

// Only the reasons attached to dated trips identify exemptions within the window.
function familyTripContinuity(
  trips: FamilyTrips,
  from: IsoDate | undefined,
  until: IsoDate,
  residenceFrom = from,
): Answer {
  const ordinary = trips.filter((t) => t.familyAbsenceReason === 'ordinary');
  const unknown = trips.filter(
    (t) =>
      !t.familyAbsenceReason &&
      (!from || t.returned > from) &&
      t.departed < until,
  );
  const serious = absencePeriods(
    trips.filter((t) => t.familyAbsenceReason === 'serious-reason'),
    from,
    until,
  );
  if (
    serious.length > eu.seriousAbsences ||
    serious.some((t) => t.until > addMonths(t.from, eu.seriousAbsenceMonths))
  )
    return false;
  const definite = ordinaryTripsWithinLimit(
    ordinary,
    from,
    until,
    residenceFrom,
  );
  if (!unknown.length || definite === false) return definite;
  const inclusive = ordinaryTripsWithinLimit(
    [...ordinary, ...unknown],
    from,
    until,
    residenceFrom,
  );
  return inclusive === true ? true : undefined;
}

function greekAbsenceSummary(a: GreekFamilyAnswers): Answer {
  if (a.maxAnnualAbsenceMonths === undefined && a.extendedAbsence === undefined)
    return undefined;
  return (
    maximum(a.maxAnnualAbsenceMonths, eu.ordinaryAbsenceMonths) === true ||
    a.extendedAbsence === 'compulsory-service' ||
    (a.extendedAbsence === 'single-serious-reason' &&
      maximum(a.extendedAbsenceMonths, eu.seriousAbsenceMonths) === true)
  );
}

function euAbsenceSummary(a: EuFamilyAnswers): Answer {
  return all(
    maximum(a.maxOrdinaryAnnualAbsenceMonths, eu.ordinaryAbsenceMonths),
    maximum(a.seriousAbsenceCount, eu.seriousAbsences),
    a.seriousAbsenceCount === 0 ||
      maximum(a.maxSeriousAbsenceMonths, eu.seriousAbsenceMonths),
  );
}

// A whole-history maximum within the limit also bounds any contained window.
// An excess in a longer history does not locate it in the qualifying period.
function summaryWithinWindow(reported: Answer, wholePeriod: boolean): Answer {
  return reported === false && !wholePeriod ? undefined : reported;
}

function ordinaryCardContinuity(
  req: GrFullRequest,
  from: IsoDate | undefined,
  expiry: IsoDate | undefined,
  summary: Answer,
  residenceFrom = from,
): Answer {
  // Ordinary renewal requires further evidence if the declared absences may break continuity.
  if (!req.trips?.length) return summary !== false || undefined;
  const until =
    expiry && expiry < req.simulationDate ? expiry : req.simulationDate;
  return (
    familyTripContinuity(req.trips, from, until, residenceFrom) === true ||
    undefined
  );
}

function consecutiveAbsenceWithin(
  req: GrFullRequest,
  from: IsoDate | undefined,
  years: number,
  reported: Answer,
  strict = false,
  until = req.simulationDate,
): Answer {
  if (!req.trips || (!req.trips.length && reported !== undefined))
    return reported;
  if (from && from > until) return true;
  const periods = absencePeriods(req.trips, from, until);
  const exceeded = periods.some((period) => {
    const limit = addYears(period.from, years);
    return strict ? period.until >= limit : period.until > limit;
  });
  return !exceeded || (from ? false : undefined);
}

function heldAfterAcquisition(
  req: GrFullRequest,
  years: number,
  reportedYears: number | undefined,
  earliest: IsoDate | undefined,
  latest: IsoDate | undefined,
): Answer {
  const reported = maximum(reportedYears, years);
  if (!req.trips || (!req.trips.length && reported !== undefined))
    return reported;
  if (!req.trips.length && !earliest) return undefined;
  if (latest && consecutiveAbsenceWithin(req, latest, years, true) === false)
    return false;
  return (
    consecutiveAbsenceWithin(req, earliest, years, undefined) === true ||
    undefined
  );
}

// A documented return can start a new qualifying period after an interruption.
function jointResidenceWindow(
  a: Pick<FamilyResidence, 'residenceFrom' | 'qualifyingResidenceDocumented'>,
  req: GrFullRequest,
  years: number,
  lossYears: number,
  canProjectReturn: boolean,
  greek?: GreekFamilyAnswers,
) {
  const start = a.residenceFrom;
  const longSeriousAbsences = greek
    ? []
    : absencePeriods(
        (req.trips ?? []).filter(
          (t) => t.familyAbsenceReason === 'serious-reason',
        ),
      ).filter((t) => t.until > addMonths(t.from, eu.seriousAbsenceMonths));
  const assess = (from: IsoDate | undefined) => {
    const anniversary = from && addYears(from, years);
    const until =
      anniversary && anniversary < req.simulationDate
        ? anniversary
        : req.simulationDate;
    const continuity =
      req.trips && from ? familyTripContinuity(req.trips, from, until) : true;
    // SRC-350 art. 13(2)–(3) does not allocate a single over-limit absence
    // straddling acquisition between the qualifying and retention periods.
    const disputedReturn =
      anniversary && continuity !== false
        ? longSeriousAbsences.find(
            (t) => t.from < anniversary && anniversary < t.until,
          )?.until
        : undefined;
    return {
      from,
      anniversary,
      until,
      continuity: disputedReturn ? undefined : continuity,
      disputedReturn,
    };
  };
  const first = assess(start);
  if (!start || !req.trips || !a.qualifyingResidenceDocumented) return first;
  // A Greek family may have received its permanent grant after the anniversary.
  const grantDateUnclear =
    greek &&
    !greek.permanentRightAcquiredOn &&
    req.simulationDate >= p.workReformEffective.value;
  let uncertain: typeof first | undefined;
  let window = first;
  const returns = absencePeriods(req.trips, start).map((t) => t.until);
  for (const from of [start, ...returns]) {
    if (window.from && from > window.from) {
      const until = from < window.until ? from : window.until;
      const continuity = familyTripContinuity(req.trips, window.from, until);
      // If the reason for an earlier trip could change the anniversary, a later
      // break on this calendar alone cannot establish the earliest future date.
      if (continuity === undefined)
        uncertain ??= { ...window, continuity: undefined };
      const lost =
        consecutiveAbsenceWithin(
          req,
          window.anniversary,
          lossYears,
          true,
          false,
          from < req.simulationDate ? from : req.simulationDate,
        ) === false;
      // For PD-315, retain the earlier unresolved claim while checking whether
      // a whole new period has since elapsed after that same serious absence.
      if (continuity !== false && !lost && from !== window.disputedReturn)
        continue;
      window = assess(from);
    }
    const retained = consecutiveAbsenceWithin(
      req,
      window.anniversary,
      lossYears,
      true,
    );
    const held = all(
      window.continuity,
      retained || (grantDateUnclear ? undefined : false),
    );
    if (held === true) {
      // A later completed window proves eligibility today. A future window
      // cannot establish the earliest date while an earlier claim is unresolved.
      if (window.anniversary && window.anniversary > req.simulationDate)
        return uncertain ?? (canProjectReturn ? window : first);
      return window;
    }
    if (held === undefined) uncertain ??= window;
  }
  return uncertain ?? first;
}

function meetsStandardPrice(
  a: GoldenVisaAnswers,
  price: number | undefined,
): Answer {
  if (price === undefined) return;
  if (price >= investment.highEur) return true;
  if (price < investment.otherEur) return false;
  if (a.zone === 'named-high-cost') return false;
  if (a.zone === 'other-mainland') return true;
  if (a.zone === 'other-island' && a.censusPopulation !== undefined)
    return a.censusPopulation <= investment.islandPopulation;
}

function conversionTier(a: GoldenVisaAnswers, filed: IsoDate): Answer {
  const completed =
    a.conversionCompletedOn === undefined
      ? a.conversionComplete
      : a.conversionComplete !== false && a.conversionCompletedOn <= filed;
  const date =
    filed < p.gvConversionDecisionEffective.value
      ? a.conversionCompletedOn
      : a.conversionActDate;
  return all(
    completed,
    date === undefined
      ? undefined
      : date >= p.gvReformEffective.value && date <= filed,
    a.kind === 'factory-conversion'
      ? minimum(a.factoryIdleYears, investment.factoryIdleYears)
      : true,
  );
}

function legacyTerms(
  a: GoldenVisaAnswers,
  sim: IsoDate,
  renewal: boolean,
): Answer {
  if (a.regime === 'current') return true;
  if (a.regime === 'legacy-card')
    return all(renewal, a.originalConditionsStillMet);
  if (a.regime !== 'transition') return;
  const ordinaryCutoff = beforeOrOn(a.closingDate, p.gvLegacyCompleteBy.value);
  const replacementCutoff = all(
    a.replacementProperty,
    beforeOrOn(a.closingDate, p.gvLegacyReplacementBy.value),
  );
  const threshold =
    a.legacyZone === 'legacy-high'
      ? p.gvTransitionalValues.value.legacyHigh
      : p.gvTransitionalValues.value.legacyOther;
  return all(
    a.originalConditionsStillMet,
    a.legacyZone === undefined
      ? undefined
      : minimum(a.qualifyingValueEur, threshold),
    minimum(a.depositPercent, p.gvLegacyDepositPercent.value),
    beforeOrOn(a.depositDate, p.gvLegacyDepositBy.value),
    beforeOrOn(a.closingDate, sim),
    a.depositDate && a.closingDate ? a.depositDate <= a.closingDate : undefined,
    any(ordinaryCutoff, replacementCutoff),
  );
}

function investorMember(m: InvestorFamilyMember, on: IsoDate): Answer {
  if (m.birthDate && m.birthDate > on) return false;
  if (m.kind !== 'child') return m.kind !== 'other';
  const age = ageOn(m.birthDate, on);
  const limit = p.gvFamily.value.childAge;
  const incapacity =
    on >= p.workReformEffective.value &&
    m.incapacityDocumentedAndLivingAsDependant;
  // The ordinary and incapacity grounds together can cover every age.
  if (m.unmarriedWithRequiredCustody && incapacity) return true;
  return any(
    all(
      age === undefined ? undefined : age < limit,
      m.unmarriedWithRequiredCustody,
    ),
    all(minimum(age, p.gvFamily.value.adultAge), incapacity),
    all(
      m.convertingPreviousFamilyCard,
      age === undefined
        ? undefined
        : age >= limit && age < limit + p.gvFamily.value.independentYears,
    ),
  );
}

function investorFees(a: GoldenVisaAnswers, on: IsoDate): number | undefined {
  const fee = p.gvFees.value;
  if (!a.family || a.nationalVisas === undefined) return;
  let total = fee.main + fee.card + a.nationalVisas * fee.visaD;
  for (const m of a.family) {
    const age = ageOn(m.birthDate, on);
    if (age === undefined) return;
    const independent =
      m.kind === 'child' &&
      age >= p.gvFamily.value.childAge &&
      m.convertingPreviousFamilyCard &&
      !(
        on >= p.workReformEffective.value &&
        m.incapacityDocumentedAndLivingAsDependant
      );
    total +=
      fee.card +
      (age < fee.minorAge
        ? fee.minor
        : independent
          ? fee.independentChild
          : fee.adultFamily);
  }
  return total;
}

function goldenChecks(req: GrFullRequest, c: GrContext): CountryCheck[] {
  const a = req.goldenVisa;
  if (!a?.stage)
    return [
      c.check(
        'GV-STAGE',
        '投资许可申请阶段',
        'Investor permit application stage',
        undefined,
        [grSource('F21', 'art. 31(2)–(3)'), grSource('F59', 'art. 2, §§2–3')],
        '请选择本次申请是首次签发还是续期。',
        'Select initial grant or renewal for this application.',
      ),
    ];
  const sim = req.simulationDate;
  const renewal = a.stage === 'renewal';
  const historical = sim < p.gvReformEffective.value;
  const legacy = a.regime === 'legacy-card' || a.regime === 'transition';
  const current = a.regime === 'current' && !historical;
  const transfer =
    a.acquisition === 'inheritance' || a.acquisition === 'parental-gift';
  const companyLease = a.title === 'qualifying-company-timeshare';
  const lease = a.title === 'qualifying-tourist-lease' || companyLease;
  const filingDate = renewal ? sim : (a.overseasFilingDate ?? sim);
  const currentDocuments = filingDate >= p.gvConversionDecisionEffective.value;
  const ownershipE9Required = renewal
    ? currentDocuments
    : filingDate >= p.gvReformEffective.value;
  const e9 =
    !ownershipE9Required ||
    any(a.title === undefined ? undefined : lease, a.e9DeclarationCopy);
  const e9Zh =
    ownershipE9Required && !lease
      ? '产权投资须提供投资者的 Ε9 房产申报表副本。'
      : '';
  const e9En =
    ownershipE9Required && !lease
      ? ' For property ownership, provide a copy of the investor’s Ε9 property declaration.'
      : '';
  const registration = a.registeredTransferEvidence;
  const receiptOnly = typeof registration === 'string';
  const acquisitionKnown = lease || a.acquisition !== undefined;
  const conversion =
    !lease &&
    !transfer &&
    (a.kind === 'conversion' || a.kind === 'factory-conversion');
  const specialTier = conversion
    ? conversionTier(a, filingDate)
    : !lease && !transfer && a.kind === 'listed';
  const price = transfer ? a.assessedValueEur : a.qualifyingValueEur;
  const standardPrice = meetsStandardPrice(a, price);
  const priceMet =
    !transfer && a.kind === undefined
      ? undefined
      : any(
          standardPrice,
          all(specialTier, minimum(price, investment.specialEur)),
        );
  const built =
    conversion || a.kind === 'construction' || a.builtOrBuildingPermit;
  const standardArea =
    transfer || lease || built === false
      ? true
      : built
        ? minimum(a.mainAreaSqm, investment.minMainAreaSqm)
        : undefined;
  const areaMet = any(specialTier, standardArea);
  const constructionEvidence = any(
    a.kind === undefined
      ? lease || transfer || undefined
      : a.kind !== 'construction',
    a.constructionDocumentsReady,
  );
  const property = all(
    priceMet,
    a.title === undefined ? undefined : a.title !== 'ineligible',
    !transfer || (!lease && a.title !== 'wholly-owned-eu-company'),
    lease && a.kind !== undefined ? a.kind === 'standard' : true,
    !companyLease || a.touristLeaseKind !== 'long-term-complex',
    transfer || lease
      ? true
      : a.propertyCount === undefined
        ? undefined
        : a.propertyCount === investment.properties,
  );
  const oldTerms = historical
    ? a.originalConditionsStillMet
    : legacyTerms(a, sim, renewal);
  const deferredCover = overseasInvestorFiling(req);
  const shortLet =
    a.use === 'short-let-or-short-sublet' ||
    a.use === 'sharing-economy-short-let' ||
    a.use === 'short-sublet';
  let use: Answer;
  if (a.use !== undefined) {
    if (historical) use = true;
    else if (shortLet) use = current ? false : oldTerms;
    else if (a.use === 'sublet-terms-unknown')
      use = legacy && oldTerms === true ? true : undefined;
    else if (
      a.use === 'business-office' ||
      a.use === 'long-tourist-sublet-with-services'
    ) {
      if (legacy) use = oldTerms;
      else if (renewal)
        use =
          a.originalGrantTier === undefined
            ? lease || undefined
            : a.originalGrantTier !== 'conversion';
      else if (
        a.kind === 'standard' ||
        a.kind === 'construction' ||
        a.kind === 'listed'
      )
        use = true;
      else if (!renewal && a.kind !== undefined)
        use = current && all(standardPrice, standardArea);
    } else use = true;
  }
  const fee = p.gvFees.value;
  const total = investorFees(a, sim);
  const amountZh =
    total === undefined
      ? '提供家属出生日期、卡种及领事 D 签人数以计算合计。'
      : `本次合计 €${total}。`;
  const amountEn =
    total === undefined
      ? 'Enter family dates of birth, card types and the number of national visas for a total.'
      : `Total €${total}.`;
  const checks: CountryCheck[] = [];
  if (!renewal && !legacy && !historical) {
    checks.push(
      c.check(
        'GV-01',
        '投资区位、产权及金额',
        'Investment zone, title and value',
        current && acquisitionKnown ? property : undefined,
        [...p.gvInvestment.sources, ...p.gvConversionDecisionEffective.sources],
        `核对单处购房或合格旅游租约，继承和父母赠与按完整产权的评估价值。标准档 €${investment.highEur}/€${investment.otherEur}，合格改住宅或保护建筑购置 €${investment.specialEur}。改住宅须在递件前完成。${p.gvConversionDecisionEffective.value} 起递件，工程师须核实相关行政文件签发于 ${p.gvReformEffective.value} 当日或之后，包括旧许可的更新或修订；在部令生效前递件按实际竣工日核对。适用标准档时核区位、持分和面积。`,
        `Verify a single property purchase or qualifying tourist lease. For inherited property or a parental gift, verify full ownership and assessed value. Standard tiers €${investment.highEur}/€${investment.otherEur}, qualifying converted or listed purchases €${investment.specialEur}. Complete the conversion before filing. For applications from ${p.gvConversionDecisionEffective.value}, the engineer must verify an act dated on or after ${p.gvReformEffective.value}, including an update or revision of an earlier permit. Earlier filings use the completion date. Standard purchases need the applicable zone, share and floor area.`,
        current &&
          acquisitionKnown &&
          property === undefined &&
          priceMet === undefined &&
          price !== undefined &&
          ((conversion && specialTier === undefined) ||
            ((a.kind !== undefined || transfer) && standardPrice === undefined))
          ? ['PD-306']
          : undefined,
      ),
    );
    checks.push(
      c.check(
        'GV-02',
        '主要使用面积',
        'Main floor area',
        current && acquisitionKnown ? areaMet : undefined,
        p.gvInvestment.sources,
        `标准档已建房或已获建筑许可的地块主空间至少 ${investment.minMainAreaSqm} m²。`,
        `Standard built property or land with a building permit needs at least ${investment.minMainAreaSqm} m² of main space.`,
        current &&
          acquisitionKnown &&
          areaMet === undefined &&
          conversion &&
          specialTier === undefined
          ? ['PD-306']
          : undefined,
      ),
    );
  }
  if (!renewal) {
    // Article 3 of KYA 214926/2025 also admits application receipts for earlier pending filings.
    const acceptsReceipt = sim >= p.gvConversionDecisionEffective.value;
    const uncertainLeaseEvidence =
      lease &&
      !currentDocuments &&
      !companyLease &&
      a.touristLeaseKind !== 'timeshare' &&
      a.eotLeaseAcknowledgment !== true;
    const acquisitionEvidence = all(
      a.notarialEvidence,
      !(companyLease || a.title === 'wholly-owned-eu-company') ||
        a.companyOwnershipDocumentsReady,
      constructionEvidence,
      receiptOnly ? acceptsReceipt : registration,
      e9,
      !lease || (uncertainLeaseEvidence ? undefined : a.eotLeaseAcknowledgment),
    );
    const registrationZh = acceptsReceipt
      ? '须提供登记凭证、登记申请回执或律师对登记或登记申请的证明。'
      : lease
        ? '须提供已完成租约登记的凭证。'
        : '须提供已完成登记的凭证或律师对该登记的证明。';
    const registrationEn = acceptsReceipt
      ? ' Provide proof of registration, the registration application receipt, or a lawyer’s certificate confirming either.'
      : lease
        ? ' Provide proof of completed lease registration.'
        : ' Provide proof of completed registration or a lawyer’s certificate confirming registration.';
    const adultOn =
      req.birthDate && addYears(req.birthDate, investment.adultRecipientAge);
    checks.push(
      c.check(
        'GV-03',
        '取得产权或租约的证明',
        'Evidence of acquisition or lease',
        a.title === undefined || !acquisitionKnown
          ? undefined
          : transfer
            ? c.whenDue(acquisitionEvidence, adultOn, sim)
            : all(
                a.fullyPaidAndConditionsReleased,
                a.payment === undefined ? undefined : a.payment !== 'other',
                a.payer === undefined ? undefined : a.payer !== 'other',
                acquisitionEvidence,
              ),
        [
          grSource(
            'F23',
            'art. 64(1), art. 100(1)(ε),(3),(5),(6) final sentence,(11), pp. 1198–1200; art. 69(1)',
          ),
          grSource('F21', 'art. 31, §§2.1–2.4'),
          grSource('F59', 'art. 2, §§2.1–2.7; arts. 3–4'),
        ],
        (transfer
          ? '成年继承人或受父母赠与人应提供公证估值，公证材料须列明房产此前的用卡记录。'
          : lease
            ? uncertainLeaseEvidence
              ? '提供合格旅游租约及租金付款公证。旧部令明列分时租约须有希腊国家旅游组织（ΕΟΤ）知悉该租约的证明；综合旅游住宿长期租约须核实当时的材料要求。'
              : '提供合格旅游租约、公证人的租金及付款证明，以及希腊国家旅游组织（ΕΟΤ）已知悉该具体租约的证明。'
            : '确认价款付清、解除条件已撤销、付款渠道和汇款人合规，且已核对原业主用卡记录。') +
          registrationZh +
          e9Zh +
          (companyLease || a.title === 'wholly-owned-eu-company'
            ? '须附公司全部权益的持股证明。'
            : '') +
          (a.kind === 'construction'
            ? '另附建筑许可及本次清单要求的工程、付款或估价材料。'
            : ''),
        (transfer
          ? 'An adult heir or recipient of a parental gift must document the assessed value and prior investor-card use in the notarial record.'
          : lease
            ? uncertainLeaseEvidence
              ? 'Provide the qualifying lease and notarised evidence of rent and payment. The earlier decision expressly required ΕΟΤ acknowledgment of a specific timeshare lease. Verify the historical requirement for a long-term lease in a tourist complex.'
              : 'Provide the qualifying tourist lease, the notary’s certificate of rent and payment, and proof that the Greek National Tourism Organisation (ΕΟΤ) has acknowledged this specific lease.'
            : 'Confirm full payment, released conditions, a qualifying bank channel and payer, and the seller’s investor-card record.') +
          registrationEn +
          e9En +
          (companyLease || a.title === 'wholly-owned-eu-company'
            ? ' Supply proof of ownership of all company shares.'
            : '') +
          (a.kind === 'construction'
            ? ' Supply the building permit and the construction, payment or valuation evidence required for this filing.'
            : ''),
        uncertainLeaseEvidence || (!transfer && a.payer === undefined)
          ? ['PD-307']
          : undefined,
      ),
    );
  }
  checks.push(
    c.check(
      'GV-04',
      '房产使用限制',
      'Permitted use',
      use,
      [
        grSource('F23', 'art. 64(1),(3), art. 100(7),(7Α)'),
        grSource('F53', 'Circular 9/2024, I(Δ)(α)–(β), p4'),
        grSource('F59', 'art. 2, §3(ζ), renewal of permits granted under §2.6'),
      ],
      `新制禁止共享经济短租及短期转租。按用途变更档取得许可的房产还禁止用作营业注册地或分支机构，续期须核对原批准档位。违规可撤销许可并罚款 €${p.gvFines.value.prohibitedUse}。核对转租期限及服务内容，按旧制或合格过渡规定取得的房产豁免短租限制。`,
      `Current rules prohibit sharing-economy short lets and short sublets. Property approved under the conversion tier may not serve as a business headquarters or branch. Check the original grant tier at renewal. Breaches risk revocation and a €${p.gvFines.value.prohibitedUse} fine. Check sublease terms and services. Properties acquired under older rules or a valid transition are exempt from the short-let restriction.`,
      (shortLet && !current) || a.use === 'sublet-terms-unknown'
        ? ['PD-308']
        : undefined,
    ),
  );
  checks.push(
    c.check(
      'GV-05',
      '投资许可的就业限制',
      'Work restriction',
      a.worksInGreeceUnderThisPermit === undefined
        ? undefined
        : !a.worksInGreeceUnderThisPermit,
      [grSource('F23', 'art. 64, art. 100(9)')],
      'Β.5 许可不赋予在希腊工作的权利。',
      'The Β.5 permit gives no access to work in Greece.',
    ),
  );
  checks.push(
    c.check(
      'GV-06',
      '投资者与家属的私人医保',
      'Private cover for investor and family',
      deferredCover ||
        all(
          insuranceMet(req.insurance, 'private', renewal),
          a.family?.length === 0 ? true : req.insurance?.coversFamily,
        ),
      [
        grSource('F21', 'art. 31, initial grant and renewal'),
        grSource('F06', 'sole article'),
        grSource('F16', 'art. 10(11), p. 4120'),
      ],
      deferredCover
        ? `境外授权递件可先领回执。须在递件后 ${p.investorEntryMonths.value} 个月内入境并补交私保及生物识别资料，核发前核验。`
        : '核发及续期均须为主申请人及随行家属提供合标私保。',
      deferredCover
        ? `A representative can file abroad and obtain a receipt. Enter within ${p.investorEntryMonths.value} months of filing to supply private insurance and biometrics before grant.`
        : 'For grant and renewal investors need qualifying private cover for themselves and accompanying family.',
    ),
  );
  checks.push(
    c.check(
      'GV-07',
      '申请及制卡费用',
      'Filing and card costs',
      a.family?.every((member) => member.birthDate !== undefined) || undefined,
      p.gvFees.sources,
      `主申请 €${fee.main}，每张制卡 €${fee.card}。随行成人 €${fee.adultFamily}，未成年人 €${fee.minor}，转独立卡 €${fee.independentChild}，每人领事 D 签 €${fee.visaD}。${amountZh}`,
      `Investor €${fee.main}, each card €${fee.card}. Adult dependant €${fee.adultFamily}, minor €${fee.minor}, independent card €${fee.independentChild}, national visa €${fee.visaD} per person. ${amountEn}`,
    ),
  );
  if (renewal) {
    const registrationZh = currentDocuments
      ? '首签未交正式登记凭证者，续期须补登记凭证或律师对已完成登记的证明。'
      : '';
    const registrationEn = currentDocuments
      ? ' If proof of completed registration was missing at the initial grant, supply it at renewal. A lawyer’s certificate confirming registration is accepted.'
      : '';
    checks.push(
      c.check(
        'GV-08',
        '保留投资与续期材料',
        'Continued investment and renewal evidence',
        all(
          a.retainsInvestment,
          constructionEvidence,
          !currentDocuments || lease || legacy || a.renewalUseDeclarationsReady,
          a.title === undefined ? undefined : a.title !== 'ineligible',
          e9,
          !currentDocuments ||
            any(
              a.registrationProofSubmittedAtGrant,
              receiptOnly ? false : registration,
            ),
          any(
            legacy || historical,
            a.originalGrantTier === undefined
              ? lease || undefined
              : a.originalGrantTier !== 'listed',
            a.listedRestorationComplete,
          ),
        ),
        [
          grSource('F23', 'art. 64, art. 100(4),(7Α),(8)'),
          grSource('F21', 'art. 31(3)(α), p. 16505'),
          grSource('F59', 'art. 2, §3(α–η) and final paragraph; arts. 3–4'),
        ],
        `须证明产权或租约持续有效。适用时附房产用途声明及工程证明。${registrationZh}${e9Zh}保护建筑首次续期前须完成修复，否则罚 €${p.gvFines.value.listedRestoration}；离境不阻碍续期。`,
        `Document continued title or lease, with the applicable signed use declarations and construction evidence.${registrationEn}${e9En} Listed buildings require full restoration by first renewal, with a €${p.gvFines.value.listedRestoration} fine for breach. Absence does not prevent renewal.`,
      ),
    );
  }
  checks.push(
    c.check(
      'GV-09',
      '随行家属与子女独立卡',
      'Accompanying family and independent child card',
      a.family &&
        all(
          ...a.family.map((member) =>
            all(investorMember(member, sim), member.filingDocumentsReady),
          ),
        ),
      [
        grSource('F16', 'art. 95(2)(α–δ)'),
        ...p.gvFamily.sources,
        grSource('F21', 'art. 23(I)(1)(β),(3)–(4)'),
      ],
      `首签及续期均包括配偶、登记民事伴侣、双方的直系尊亲属，以及未满 ${p.gvFamily.value.childAge} 岁的未婚子女。非共同子女须由相应父母依法取得监护权。${sim >= p.workReformEffective.value ? '成年子女可凭认可的无行为能力证明及受养同住事实随行。' : ''}按本次手续逐人提供亲属及监护文件、旧卡或入境证明、家庭状况声明，续期另核纳税材料。已持家属卡的适龄子女可凭旧卡转独立卡。`,
      `At first grant and renewal, family includes a spouse or registered partner, either partner’s direct ascendants, and unmarried children under ${p.gvFamily.value.childAge}. For a child of only one parent, that parent needs legal custody.${sim >= p.workReformEffective.value ? ' An adult child may qualify with recognised evidence of legal incapacity, dependency and co-residence.' : ''} Check each applicant’s applicable kinship, custody, prior card or entry evidence, family declaration and renewal tax records. An independent child card requires the previous family card.`,
    ),
  );
  checks.push(
    c.check(
      'GV-10',
      '原批条件与过渡日期',
      'Grandfathering and transition deadlines',
      oldTerms,
      [
        grSource('F23', 'art. 64(3)–(4), p. 1200'),
        ...p.gvLegacyCompleteBy.sources,
        ...p.gvTransitionalValues.sources,
      ],
      historical
        ? '按模拟日有效的原始投资条件核验，请确认当时适用的金额、区域与产权。'
        : '旧卡按原批条件续期。过渡购房须按法定日期锁定并完成交易；换房另有截止日。',
      historical
        ? 'Confirm that the investment meets the value, zone and title rules in force on the simulation date.'
        : 'Legacy cards renew under their original terms. Transitional purchases need a timely deposit and closing, with a separate replacement deadline.',
      historical || legacy ? ['PD-308'] : undefined,
    ),
  );
  return checks;
}

function security(order: GrFullRequest['publicOrder']): Answer {
  if (order === 'clear') return true;
  if (order === 'adverse') return false;
}

function residenceBeforeEvent(
  req: GrFullRequest,
  from: IsoDate | undefined,
  event: IsoDate | undefined,
  marriageFrom?: IsoDate,
  widowhood = false,
): Answer {
  const years = p.familyRetention.value.inGreeceYears;
  const start =
    from && marriageFrom && marriageFrom > from ? marriageFrom : from;
  const elapsed = yearsBy(start, event, years);
  if (!elapsed || !start || !event || !req.trips) return elapsed;
  const window = widowhood ? addYears(event, -years) : start;
  const periods = absencePeriods(req.trips, window, event);
  if (!periods.length) return true;
  // The domestic year can occur anywhere within the marriage before dissolution.
  let presentFrom = window;
  for (const period of periods) {
    if (addYears(presentFrom, years) <= period.from) return true;
    presentFrom = period.until;
  }
  if (addYears(presentFrom, years) <= event) return true;
  // The event provisions require residence in Greece. Card-validity exceptions
  // do not independently establish this year. Time spent in Greece during a
  // marriage can also be shown by several periods, without double-counting trips.
  if (!widowhood) {
    const awayDays = periods.reduce(
      (sum, period) => sum + daysBetween(period.from, period.until),
      0,
    );
    const [, longestYear] = monthSpan(years * 12);
    if (daysBetween(window, event) - awayDays >= longestYear) return true;
  }
  return undefined;
}

function retainedGround(
  r: Retention,
  greek: boolean,
  req: GrFullRequest,
): Answer {
  const t = p.familyRetention.value;
  const durationEnd =
    r.basis === 'divorce' ? r.divorceDurationEnd : r.eventDate;
  const inGreece = residenceBeforeEvent(
    req,
    r.greeceResidenceFrom,
    durationEnd,
    r.basis === 'divorce' ? r.marriageFrom : undefined,
    r.basis === 'widowhood',
  );
  switch (r.basis) {
    case 'widowhood':
      return inGreece;
    case 'divorce':
      return all(
        inGreece,
        yearsBy(r.marriageFrom, r.divorceDurationEnd, t.marriageYears),
      );
    case 'access-in-greece':
      return !greek;
    case 'custody':
    case 'domestic-violence':
      return true;
    case 'none':
      return false;
  }
}

function retainedLivelihood(r: Retention, req: GrFullRequest): Answer {
  if (r.livelihood === 'employment' || r.livelihood === 'qualifying-family')
    return true;
  if (r.livelihood === 'none') return false;
  if (r.livelihood === 'resources') {
    const resources =
      r.resourcesAssessment === 'accepted'
        ? true
        : r.resourcesAssessment === 'rejected'
          ? false
          : undefined;
    return all(resources, insuranceMet(req.insurance, 'either'));
  }
}

function greekKin(a: GreekFamilyAnswers, req: GrFullRequest): Answer {
  const on =
    a.stage === 'retained' || a.retention
      ? a.retention?.eventDate
      : req.simulationDate;
  const age = on === undefined ? undefined : ageOn(req.birthDate, on);
  switch (a.relationship) {
    case 'spouse':
      return a.registeredInGreece;
    case 'registered-partner':
      return a.partnershipConcludedAt === undefined
        ? a.registeredInGreece
        : a.partnershipConcludedAt !== 'other';
    case 'descendant':
    case 'child-with-incapacity': {
      const descendant = any(
        age === undefined ? undefined : age >= 0 && age < family.childAge,
        a.dependent,
      );
      if (a.relationship === 'descendant') return descendant;
      return any(
        descendant,
        all(
          on === undefined ? undefined : on >= p.workReformEffective.value,
          minimum(age, family.minorAge),
          a.incapacityDocumentedAndLivingAsDependant,
        ),
      );
    }
    case 'ascendant':
      return a.dependent;
    case 'parent-of-resident-greek-minor':
    case 'minor-sibling-of-resident-greek-minor': {
      // Article 93(2) preserves the card through its term even after a birthday.
      // On conversion, check the minority basis at grant of the original Ο.3.
      const originalCard =
        (a.stage === 'permanent' && !a.retention) ||
        (a.stage === 'renewal' &&
          a.relationship === 'minor-sibling-of-resident-greek-minor');
      const at = originalCard ? a.initialCardGrantedOn : on;
      const minor = (dob: IsoDate | undefined): Answer => {
        if (!dob || !on) return;
        if (dob > on) return false;
        if (!at) return;
        return dob <= at && at <= on && fullYears(dob, at) < family.minorAge;
      };
      return all(
        minor(a.greekRelativeBirthDate),
        a.relationship === 'parent-of-resident-greek-minor' ||
          minor(req.birthDate),
      );
    }
    case 'dependent-needs-personal-care':
      return a.dependent !== false;
    case 'other':
      return false;
  }
}

function greekChecks(req: GrFullRequest, c: GrContext): CountryCheck[] {
  const a = req.greekFamily ?? {};
  const sim = req.simulationDate;
  const reformed = sim >= p.workReformEffective.value;
  const checks: CountryCheck[] = [];
  // The stage is required: the permanent right has no initial-card insurance test.
  if (!a.stage)
    return [
      c.check(
        'GF-01',
        '亲属关系与申请阶段',
        'Family relationship and application stage',
        undefined,
        familySource(),
        '请选择 Ο.3 首签或续期、关系终止后保留、转永久卡或永居保有。',
        'Select initial Ο.3 or renewal, a retained right, permanent conversion or continued permanent status.',
      ),
    ];
  if (a.stage !== 'maintain')
    checks.push(
      c.check(
        'GF-01',
        '与希腊公民的真实亲属关系',
        'Genuine relationship to a Greek citizen',
        all(
          greekKin(a, req),
          a.genuineRelationship,
          a.stage !== 'initial' || a.initialFamilyDocumentsReady,
        ),
        familySource(),
        '婚姻须在希腊登记，民事伴侣协议可在希腊或希腊领事机关订立。首卡按类别提供希腊籍亲属身份证、家庭状况、亲属或收养文书，以及适用的监护、受养、医疗照护证明和同居供养声明。在希希腊籍未成年人的父母或未成年手足需提供相应家庭关系证明。',
        'Document the registered marriage or a partnership concluded in Greece or at a Greek consulate. For the initial card supply the applicable Greek relative’s ID, family status, kinship or adoption records, custody, dependency or medical evidence and declarations of co-residence and support. Parents and minor siblings of a Greek minor resident in Greece need proof of that relationship.',
      ),
    );
  if (a.stage === 'initial') {
    const deferred =
      req.deferredInitialEvidence?.includes('public-insurance-application') ===
        true && a.appliedForFullPublicCover !== false;
    checks.push(
      c.check(
        'GF-07',
        '申请人在希腊稳定居住',
        'Stable residence in Greece',
        a.stableResidenceInGreece,
        [grSource('F16', 'art. 93(1), p4163')],
        '请确认申请人已在希腊安家。仍常住境外、仅短期来访的家属不满足这项条件。',
        'Confirm that the applicant has established a home in Greece. A family member who normally lives abroad and is visiting temporarily does not meet this condition.',
      ),
      c.check(
        'GF-02',
        'Ο.3 的医保及首卡条件',
        'Health cover for the initial Ο.3',
        any(
          deferred,
          a.appliedForFullPublicCover,
          insuranceMet(req.insurance, 'either'),
        ),
        [
          grSource('F21', 'art. 25(1.1)(ε)'),
          grSource('F16', 'arts. 10(9), 93(3),(4),(7)'),
        ],
        `可提供公保申请回执或合标医保。公保申请凭证可在首次递件后 ${p.initialEvidenceMonths.value} 个月内补交。初次申请原则上在入境后 ${family.initialMonths} 个月内递交，卡期 ${family.residenceYears} 年。`,
        `A full public insurance application or qualifying cover is accepted. Evidence of an insurance application can follow within ${p.initialEvidenceMonths.value} months of filing. Normally apply within ${family.initialMonths} months of entry. The initial card lasts ${family.residenceYears} years.`,
      ),
    );
  }
  if (a.stage === 'renewal') {
    const expiry = a.priorCardExpiry ?? req.currentCardExpiresOn;
    const siblingAtExpiry =
      expiry === undefined ? undefined : ageOn(req.birthDate, expiry);
    const from = a.initialCardGrantedOn ?? a.residenceFrom;
    checks.push(
      c.check(
        'GF-08',
        'Ο.3 普通续卡资格及材料',
        'Ordinary Ο.3 renewal and evidence',
        all(
          a.permanentRightAtCardExpiry === undefined
            ? undefined
            : !a.permanentRightAtCardExpiry,
          a.relationship !== 'minor-sibling-of-resident-greek-minor' ||
            all(
              siblingAtExpiry === undefined
                ? undefined
                : siblingAtExpiry < family.siblingRenewalAge,
              a.siblingExtensionAlreadyGranted === undefined
                ? undefined
                : !a.siblingExtensionAlreadyGranted,
            ),
          ordinaryCardContinuity(
            req,
            from,
            expiry,
            greekAbsenceSummary(a),
            a.residenceFrom ?? from,
          ),
          a.ordinaryRenewalDocumentsReady,
          insuranceMet(req.insurance, 'either', true),
        ),
        [
          grSource('F16', 'art. 93(2),(4),(7),(9)–(10)'),
          grSource('F36', 'arts. 27(1), 28'),
          grSource('F21', 'art. 25(2)(α–ε)'),
        ],
        '确认旧卡到期时未取得自动转永久卡的权利。提供旧卡记录、希腊籍家属身份证、关系持续声明和有效医保，初次获卡依赖受养事实者须再证明受养。在希希腊籍未成年人的手足依第 93(2) 条仅可再续一期，以旧卡到期日核对年龄。',
        'Confirm that the expiring card does not qualify for automatic permanent conversion. Supply the prior card record, Greek sponsor ID, declaration of continued kinship, active insurance and any dependency evidence required at first grant. A sibling may extend once under Article 93(2), subject to their age at expiry.',
      ),
    );
  }
  if (a.stage === 'permanent') {
    const window = jointResidenceWindow(
      a,
      req,
      family.residenceYears,
      family.interruptionYears,
      !a.permanentRightAcquiredOn,
      a,
    );
    const { anniversary, until: at, continuity: dated } = window;
    const summary = greekAbsenceSummary(a);
    const useTrips =
      !!req.trips?.length || (!!req.trips && summary === undefined);
    // Article 93(7) lists the protected absences. Other cases need confirmation (PD-314).
    const continuity = useTrips ? (window.from ? dated : undefined) : summary;
    const allowedAbsence = continuity === true || undefined;
    const tolerableGap = !reformed
      ? all(
          !req.trips?.length && a.longestConsecutiveAbsenceYears !== undefined
            ? summaryWithinWindow(
                a.longestConsecutiveAbsenceYears <
                  p.tenYearCard.value.absenceYears,
                !!window.from && window.from === a.residenceFrom && at === sim,
              )
            : consecutiveAbsenceWithin(
                req,
                window.from,
                p.tenYearCard.value.absenceYears,
                undefined,
                true,
                at,
              ),
          consecutiveAbsenceWithin(
            req,
            addYears(sim, -p.tenYearCard.value.absenceYears),
            p.tenYearCard.value.absenceYears,
            true,
            true,
          ),
        )
      : a.priorCardExpiry && sim <= a.priorCardExpiry
        ? true
        : consecutiveAbsenceWithin(
            req,
            a.priorCardExpiry && addDays(a.priorCardExpiry, 1),
            family.interruptionYears,
            maximum(a.interruptionAfterExpiryYears, family.interruptionYears),
          );
    // Automatic conversion at expiry and an actual permanent grant are distinct.
    // If the old card chronology cannot resolve a long intervening trip, verify the right.
    const reportedRetention = maximum(
      a.longestAbsenceAfterPrYears,
      family.interruptionYears,
    );
    const survived = consecutiveAbsenceWithin(
      req,
      a.permanentRightAcquiredOn ?? anniversary,
      family.interruptionYears,
      reportedRetention ?? true,
    );
    const knownGrantPeriod =
      !!a.permanentRightAcquiredOn ||
      (!req.trips?.length && reportedRetention === false);
    const documented = all(
      !reformed || survived || (knownGrantPeriod ? false : undefined),
      a.qualifyingResidenceDocumented,
      tolerableGap,
      allowedAbsence,
      reformed || insuranceMet(req.insurance, 'either'),
      reformed ||
        all(
          a.historicalConversionDocumentsReady,
          req.tenYear?.travelDocumentPagesReady !== false,
        ),
    );
    checks.push(
      c.check(
        'GF-03',
        '连续合法共居与卡到期后中断',
        'Continuous qualifying residence and interruptions',
        c.whenDue(documented, anniversary, sim),
        [
          grSource('F36', 'art. 28, art. 93Α(1)'),
          grSource('F16', 'arts. 93(7),(9), 161(1)(δ),(2)'),
          grSource('F21', 'arts. 25(1), 58(1)(ε–η)'),
        ],
        reformed
          ? `与希腊籍家属共同合法居住满 ${family.residenceYears} 年。卡到期后实际居留中断不超过 ${family.interruptionYears} 年可保留转换权。核实共居期间的离境。`
          : `旧制共同合法居住满 ${family.residenceYears} 年后转 Μ.2，须核对原家属卡、全额医保、连续离境期及递件前 ${p.tenYearCard.value.absenceYears} 年旅行证件的全部内页。`,
        reformed
          ? `Establish ${family.residenceYears} years of qualifying residence together. A residence interruption of up to ${family.interruptionYears} years after card expiry preserves conversion. Verify absences during those years.`
          : `Under the earlier law, ${family.residenceYears} years of qualifying residence together lead to Μ.2. Verify the former family card, full insurance, consecutive absences and all travel-document pages for the ${p.tenYearCard.value.absenceYears} years before filing.`,
        continuity === false || (useTrips && dated !== true)
          ? ['PD-314']
          : undefined,
      ),
    );
  }
  if (a.stage === 'retained' || (a.stage === 'permanent' && a.retention)) {
    const r = a.retention ?? {};
    const filed =
      r.applicationDate ?? (a.stage === 'retained' ? sim : undefined);
    const onTime =
      r.eventDate === undefined || filed === undefined
        ? undefined
        : r.eventDate <= filed &&
          filed <= sim &&
          filed <= addMonths(r.eventDate, p.familyRetention.value.filingMonths);
    checks.push(
      c.check(
        'GF-04',
        '关系终止后的个人居留权',
        'Retained personal residence right',
        reformed
          ? all(
              a.retainedRightDocumentsReady,
              retainedGround(r, true, req),
              retainedLivelihood(r, req),
              onTime,
            )
          : all(
              a.retainedRightDocumentsReady,
              r.basis !== 'custody',
              retainedGround(r, true, req),
              filed === undefined ? undefined : beforeOrOn(r.eventDate, filed),
              beforeOrOn(filed, sim),
            ),
        [
          grSource('F36', 'art. 27(2), art. 93(11)(α)–(γ)'),
          grSource('F16', 'arts. 90, 93(7),(11)'),
          grSource('F21', 'art. 24(2)(α–ε), pp. 16498–16499'),
        ],
        reformed
          ? '提供先前居留卡、死亡登记、离婚或关系解除登记、监护裁决或家暴／困难证据中适用的材料。核对相应就业或生计医保依据和事件后递件期限。'
          : '旧制按丧偶、离婚或家暴等困难情形转 Ο.2。',
        reformed
          ? 'Document the prior card, the applicable death, divorce/dissolution, custody or hardship evidence, the livelihood/insurance basis, and timely filing after the event.'
          : 'The earlier law routes widowhood, qualifying divorce or hardship such as domestic violence to an autonomous Ο.2.',
      ),
    );
  }
  checks.push(
    c.check(
      'GF-05',
      '现实公共安全威胁与永居保有',
      'Present security threat and continued status',
      all(
        security(req.publicOrder),
        a.stage === 'maintain'
          ? reformed &&
              heldAfterAcquisition(
                req,
                family.interruptionYears,
                a.longestAbsenceAfterPrYears,
                a.permanentRightAcquiredOn ?? a.residenceFrom,
                a.permanentRightAcquiredOn,
              )
          : true,
      ),
      [grSource('F36', 'art. 28, art. 93Α(3)–(4)'), grSource('F16', 'art. 93')],
      `前科本身不足以认定现时严重威胁。取得永居后连续离境超过 ${family.interruptionYears} 年会丧失权利。`,
      `A conviction alone does not establish a serious present threat. After acquisition an absence exceeding ${family.interruptionYears} consecutive years ends permanent residence.`,
      req.publicOrder === 'review' ? ['PD-301'] : undefined,
    ),
  );
  const feeDate =
    a.stage === 'initial' ? a.initialFilingFrom : a.priorCardExpiry;
  const late = feeDate && sim > addYears(feeDate, family.lateFeeAfterYears);
  const card = p.gvFees.value.card;
  const lateFeeZh =
    (reformed && a.stage === 'permanent') || a.stage === 'initial'
      ? feeDate === undefined
        ? `按入境、登记或旧卡到期日期另核 €${family.lateFee} 罚款。`
        : late
          ? `逾期另加 €${family.lateFee}。`
          : '本次无需逾期罚款。'
      : '';
  const lateFeeEn =
    (reformed && a.stage === 'permanent') || a.stage === 'initial'
      ? feeDate === undefined
        ? ` Check entry, civil registration or card expiry for a possible €${family.lateFee} fine.`
        : late
          ? ` Add €${family.lateFee} for late filing.`
          : ' No late filing fine.'
      : '';
  checks.push(
    c.check(
      'GF-06',
      '希腊公民家属办卡费用',
      'Greek family card fees',
      true,
      [
        grSource('F36', 'art. 27(2) and art. 28, art. 93Α(2)–(3)'),
        grSource('F21', 'art. 2(γ)'),
        grSource('F16', 'arts. 93(3), 171(2)(ε)'),
      ],
      `申请费 €${family.applicationFee}，每张制卡 €${card}。${reformed ? `Μ.3 每 ${family.cardYears} 年更新。` : ''}${lateFeeZh}`,
      `Application €${family.applicationFee}, card €${card}.${reformed ? ` Renew Μ.3 every ${family.cardYears} years.` : ''}${lateFeeEn}`,
    ),
  );
  return checks;
}

function familySource() {
  return [
    grSource('F36', 'arts. 9(3), 27–28; arts. 4(λζ), 93, 93Α(1)'),
    grSource('F16', 'arts. 4(λζ), 93(2)–(4)'),
    grSource('F21', 'art. 25, §§1.1–1.6 and 2'),
  ];
}

function earlyRight(e: EuFamilyAnswers['early'], sim: IsoDate): Answer {
  if (!e) return;
  if (e.basis === 'none') return false;
  const end = e.eventDate;
  const since = e.sponsorResidentFrom;
  const durationOver = (years: number) =>
    end && since ? end > addYears(since, years) : undefined;
  let basis: Answer;
  switch (e.basis) {
    case 'retirement':
    case 'self-employed-retirement-without-pension':
      basis = all(
        e.basis === 'retirement' ||
          minimum(ageOn(e.sponsorBirthDate, end), eu.noPensionRetirementAge),
        any(
          e.greekSpouseDurationExemption,
          all(
            durationOver(eu.retirementYears),
            minimum(e.precedingWorkMonths, eu.priorWorkMonths),
          ),
        ),
      );
      break;
    case 'permanent-incapacity':
      basis = any(
        e.greekSpouseDurationExemption,
        durationOver(eu.incapacityYears),
      );
      break;
    case 'occupational-incapacity':
    case 'occupational-death':
      basis = true;
      break;
    case 'worker-death':
      basis = any(
        e.survivingSpouseLostGreekNationalityByMarriage,
        yearsBy(since, end, eu.incapacityYears),
      );
      break;
    case 'cross-border-worker':
      basis = all(
        e.weeklyReturnAndPriorContinuousWork,
        yearsBy(since, end, eu.crossBorderYears),
      );
      break;
  }
  return all(beforeOrOn(end, sim), e.livedTogetherAtEvent, basis);
}

function euFamilyLink(
  a: EuFamilyAnswers,
  req: GrFullRequest,
  ordinaryFrom: IsoDate | undefined,
  acquired: IsoDate | undefined,
): Answer {
  if (a.stage === 'retained' && a.schooling)
    return a.schooling.applicant === undefined
      ? undefined
      : a.schooling.applicant !== 'other';
  const nonStudent =
    a.studentSponsor === undefined ? undefined : !a.studentSponsor;
  switch (a.relationship) {
    case 'spouse':
      return true;
    case 'registered-partner':
      return a.partnershipRecognisedAsMarriageEquivalent;
    case 'descendant': {
      // Under-21 descendants retain their derived residence on turning 21.
      const on =
        a.residenceFrom ?? a.retention?.eventDate ?? req.simulationDate;
      const age = ageOn(req.birthDate, on);
      let underLimit: Answer;
      if (age !== undefined) {
        if (age < eu.childAge) underLimit = age >= 0;
        else if (a.residenceFrom || a.stage === 'initial') underLimit = false;
      }
      return any(
        a.dependent,
        // This combined evidence also establishes dependency, which has no age limit.
        a.incapacityDocumentedAndLivingAsDependant === true,
        all(underLimit, nonStudent),
      );
    }
    case 'ascendant':
      return all(a.dependent, any(nonStudent, a.extendedFamilyRecognised));
    case 'primary-carer-of-mobile-eu-minor': {
      const care = a.primaryCare;
      let end = a.retention?.eventDate ?? req.simulationDate;
      if (a.stage === 'permanent') {
        // Count care up to acquisition; the claim can be made after the child reaches majority.
        if (acquired && acquired <= end)
          end =
            a.early?.eventDate === acquired &&
            earlyRight(a.early, req.simulationDate)
              ? acquired
              : addDays(acquired, -1);
      }
      return all(
        ordinaryFrom ? beforeOrOn(care?.childBirthDate, ordinaryFrom) : true,
        underAgeOn(care?.childBirthDate, end, eu.minorAge),
        any(
          care?.residenceBasis === undefined
            ? undefined
            : care.residenceBasis !== 'self-sufficient',
          all(
            care?.sufficientResourcesForBoth,
            care?.comprehensiveCoverForBoth,
          ),
        ),
      );
    }
    case 'durable-partner':
    case 'extended-family':
      return a.extendedFamilyRecognised;
    case 'other':
      return false;
    case undefined:
      if (a.qualifyingNonGreekEuSponsor === undefined)
        return a.qualifyingNonGreekEuSponsorAndRelationship;
  }
}

function euChecks(req: GrFullRequest, c: GrContext): CountryCheck[] {
  const a = req.euFamily ?? {};
  const sim = req.simulationDate;
  const checks: CountryCheck[] = [];
  const primaryCarer =
    a.relationship === 'primary-carer-of-mobile-eu-minor' &&
    !(a.stage === 'retained' && a.schooling);
  const ordinaryCard = a.stage === 'initial' || a.stage === 'renewal';
  const existingPermanent =
    a.stage === 'maintain' || a.stage === 'permanent-renewal';
  const amendedLateFiling = sim >= p.euCardFineReformFrom.value;
  if (!a.stage)
    return [
      c.check(
        'EF-01',
        '欧盟家属身份与申请阶段',
        'EU family status and application stage',
        undefined,
        [grSource('F02', 'arts. 11–15,17')],
        '请选择普通卡首领或续期、关系终止后个人保留、永久卡首领或换卡，或永居保有。',
        'Select first issue or renewal of an ordinary or permanent card, retention after a family event, or continued permanent status.',
      ),
    ];
  const early = earlyRight(a.early, sim);
  const window =
    a.stage === 'permanent'
      ? jointResidenceWindow(
          a,
          req,
          eu.residenceYears,
          eu.lossYears,
          early !== undefined && !a.permanentRightAcquiredOn,
        )
      : undefined;
  const anniversary = window?.anniversary;
  const earlyDate = early === true ? a.early?.eventDate : undefined;
  const earlyHeld =
    earlyDate && consecutiveAbsenceWithin(req, earlyDate, eu.lossYears, true);
  // Where an early right was lost, a later completed ordinary period can establish a new one.
  const relyOnEarly =
    !!earlyDate &&
    (!anniversary || earlyDate <= anniversary || window?.continuity !== true) &&
    (earlyHeld === true ||
      !anniversary ||
      anniversary > sim ||
      window?.continuity !== true);
  const acquired =
    a.permanentRightAcquiredOn ?? (relyOnEarly ? earlyDate : anniversary);
  if (!existingPermanent) {
    checks.push(
      c.check(
        'EF-01',
        '欧盟家属资格与条约居留',
        'EU family status and treaty residence',
        all(
          a.qualifyingNonGreekEuSponsor ??
            a.qualifyingNonGreekEuSponsorAndRelationship,
          euFamilyLink(a, req, window?.from ?? a.residenceFrom, acquired),
          a.sponsorExercisedTreatyRights,
          a.qualifyingResidenceDocumented,
        ),
        [
          grSource('F02', 'arts. 2(2), 3(2)–(3), 7(4),(6), 13(1), 15'),
          grSource('F16', 'art. 4(λη)'),
          grSource('F36', 'arts. 9(4), 53'),
          grSource('F21', 'art. 59(1)–(13)'),
          grSource('F61', '§§2.2.2.4, 2.2.2.5, 2.2.3, 5.2.4, 9.1–9.2'),
          ...(primaryCarer
            ? [grSource('F63', 'art. 3, Civil Code art. 127, p. 430')]
            : []),
        ],
        primaryCarer
          ? '核实行使自由流动权的欧盟未成年人在希腊依赖申请人作为主要照护人。以自给自足为依据的期间，须有足以供养双方的资源和覆盖双方的全面医保。资源或保险可由任一方提供。子女取得永久居留权后免核这两项。'
          : `核对非希腊籍欧盟、EEA 或瑞士担保人的条约居留。配偶、获认可的登记伴侣、双方的直系后裔（含收养子女）及受养尊亲属可适用。后裔按取得家属居留时未满 ${eu.childAge} 岁或受养核实，此后成年可保留资格。学生的子女须受养。学生的受养尊亲属、其他亲属及稳定未登记伴侣须确认第 3(2) 条的个案认定。学业保留权另核在学子女及实际监护人。`,
        primaryCarer
          ? 'Verify that the mobile EU child depended on the applicant as primary carer in Greece. During residence based on self-sufficiency, resources must support both and comprehensive sickness insurance must cover both. Either person may provide them. These requirements cease once the child acquires permanent residence.'
          : `Verify the non-Greek EU/EEA/Swiss sponsor's treaty residence. Spouses, recognised registered partners, either partner's direct descendants (including adopted children) and dependent ascendants can qualify. Descendants who acquired residence while under ${eu.childAge} or dependent retain that basis. Children of student-only sponsors must be dependent. Confirm individual recognition for their ascendants, extended relatives or a durable unregistered partner. The education provision covers the enrolled child and the parent with actual custody.`,
      ),
    );
  }
  if (a.stage === 'initial') {
    const lateOnset =
      a.arrivedOn &&
      a.publicHealthConditionBeganOn &&
      a.publicHealthConditionBeganOn <= sim &&
      a.publicHealthConditionBeganOn >
        addMonths(a.arrivedOn, eu.publicHealthMonths);
    checks.push(
      c.check(
        'EF-08',
        '首卡公共卫生依据',
        'Public health for the first ordinary card',
        req.publicHealth === 'entry-refused'
          ? false
          : req.publicHealth === 'cleared' || lateOnset
            ? true
            : undefined,
        [grSource('F02', 'arts. 9(3)–(4), 21(8)–(10)')],
        `仅核法定公共卫生事由。须有具体严重迹象方可要求免费体检；入境 ${eu.publicHealthMonths} 个月后发生的疾病不能作为驱逐依据。`,
        `Verify a statutory public health ground. Medical examinations require serious indications and are free. Disease first arising more than ${eu.publicHealthMonths} months after arrival cannot justify expulsion.`,
        req.publicHealth === 'possible-risk' && !lateOnset
          ? ['PD-302']
          : undefined,
      ),
    );
  }
  if (ordinaryCard) {
    const partner =
      a.relationship === 'spouse' || a.relationship === 'registered-partner';
    const article59Family =
      partner ||
      a.relationship === 'descendant' ||
      a.relationship === 'ascendant';
    const r = a.partnerRenewal;
    const evidenceOfSeparation = all(
      beforeOrOn(r?.separationOn, sim),
      yearsBy(
        r?.marriageFrom,
        r?.separationOn,
        p.familyRetention.value.marriageYears,
      ),
      residenceBeforeEvent(
        req,
        r?.greeceResidenceFrom,
        r?.separationOn,
        r?.marriageFrom,
      ),
    );
    const finances =
      r?.resourcesAssessment === 'accepted'
        ? true
        : r?.resourcesAssessment === 'rejected'
          ? false
          : undefined;
    const appliesToSpouse = a.stage === 'renewal' && partner;
    const residenceStart = a.residenceFrom ?? a.arrivedOn;
    const due = a.arrivedOn && addMonths(a.arrivedOn, eu.initialFilingMonths);
    const afterFineDeadline =
      a.arrivedOn && sim > addYears(a.arrivedOn, eu.lateYears);
    const timelyInitial =
      a.arrivedOn === undefined
        ? undefined
        : a.arrivedOn <= sim &&
          (amendedLateFiling || !afterFineDeadline || undefined);
    checks.push(
      c.check(
        'EF-07',
        '普通居留卡首领或续期',
        'First or renewed ordinary residence card',
        a.stage === 'initial'
          ? timelyInitial
          : all(
              a.relationship === undefined ? undefined : true,
              ordinaryCardContinuity(
                req,
                residenceStart,
                a.priorCardExpiry,
                euAbsenceSummary(a),
              ),
              !article59Family ||
                (a.permanentRightAcquired === undefined
                  ? undefined
                  : !a.permanentRightAcquired),
              !appliesToSpouse ||
                all(
                  any(
                    r?.sponsorConfirmsContinuingRelationship,
                    evidenceOfSeparation,
                  ),
                  finances,
                ),
              a.priorCardIssued === false
                ? false
                : (a.priorCardIssued ?? (a.priorCardExpiry ? true : undefined)),
            ),
        [
          grSource('F02', 'arts. 7, 9(2)–(5), 10'),
          grSource('F21', 'art. 59(1)–(6),(10)–(13)'),
          grSource('F64', 'art. 42(8), p. 2302; art. 47'),
        ],
        a.stage === 'initial'
          ? `自入境之日起 ${eu.initialFilingMonths} 个月内申请。${due ? `本案期限 ${due}。` : ''}${afterFineDeadline && amendedLateFiling ? `另缴逾期罚款 €${eu.lateFine}。` : ''}`
          : '配偶、直系亲属普通续卡核尚未取得永久权；配偶另核家庭关系持续或分居前的婚姻、在希期间，以及按个人情况认定的资源。扩展成员及稳定伴侣按获认可关系及其续期材料审查。',
        a.stage === 'initial'
          ? `Apply within ${eu.initialFilingMonths} months of arrival.${due ? ` Filing deadline ${due}.` : ''}${afterFineDeadline && amendedLateFiling ? ` Late fine €${eu.lateFine}.` : ''}`
          : 'For a spouse or direct relative, check that permanent residence has not been acquired. For spouses check the continuing link or durations before separation and individually assessed resources. Extended family and durable partners renew on their recognised basis and evidence.',
        appliesToSpouse && finances === undefined ? ['PD-316'] : undefined,
      ),
    );
  }
  if (a.stage === 'permanent') {
    const ordinary = beforeOrOn(anniversary, sim);
    checks.push(
      c.check(
        'EF-02',
        '五年居留或提早取得权利',
        'Residence period or early acquisition',
        ordinary === false && (early === false || earlyHeld === false)
          ? anniversary
          : any(ordinary, early),
        [grSource('F02', 'arts. 13(1),14(1)–(4),15, pp. 2982–2984')],
        `合法居留满 ${eu.residenceYears} 年，或由一同生活的劳动者满足退休、失能、跨境工作或在职死亡的特别条件。`,
        `Complete ${eu.residenceYears} years of lawful residence or qualify through a worker who lived with you under retirement, incapacity, frontier-work or death provisions.`,
      ),
    );
  }
  if (a.stage === 'permanent' || existingPermanent) {
    const timely =
      a.priorCardIssued === false ||
      (a.priorCardExpiry === undefined
        ? undefined
        : sim <= addYears(a.priorCardExpiry, eu.lateYears));
    const hasSummary =
      a.maxOrdinaryAnnualAbsenceMonths !== undefined ||
      a.seriousAbsenceCount !== undefined ||
      a.maxSeriousAbsenceMonths !== undefined;
    const useTrips = !!req.trips?.length || (!!req.trips && !hasSummary);
    const disputedAbsence = !!window?.disputedReturn && !relyOnEarly;
    const reported = euAbsenceSummary(a);
    const coversWholePeriod =
      !!window?.from && window.from === a.residenceFrom && window.until === sim;
    const summaryNeedsDates =
      a.stage === 'permanent' &&
      !relyOnEarly &&
      !useTrips &&
      reported === false &&
      !coversWholePeriod;
    const absences = useTrips
      ? window?.from
        ? window.continuity
        : undefined
      : summaryWithinWindow(reported, coversWholePeriod);
    // The ordinary anniversary sets a lower bound only when an earlier
    // acquisition is excluded, or is itself too recent to have been lost.
    const tooRecentForLoss = (date: IsoDate | undefined) =>
      date !== undefined && sim <= addYears(date, eu.lossYears);
    const noTimeForLoss = a.permanentRightAcquiredOn
      ? a.permanentRightAcquiredOn <= sim &&
        tooRecentForLoss(a.permanentRightAcquiredOn)
      : tooRecentForLoss(anniversary) &&
        (early === false ||
          tooRecentForLoss(a.early?.eventDate ?? a.residenceFrom));
    const retainedPermanentRight =
      a.stage === 'permanent' &&
      (req.trips?.length || a.longestAbsenceAfterPrYears === undefined) &&
      noTimeForLoss
        ? true
        : heldAfterAcquisition(
            req,
            eu.lossYears,
            a.longestAbsenceAfterPrYears,
            a.permanentRightAcquiredOn ??
              (a.stage === 'permanent' && early !== undefined
                ? acquired
                : a.residenceFrom),
            a.permanentRightAcquiredOn ??
              (a.stage === 'permanent' ? acquired : undefined),
          );
    checks.push(
      c.check(
        'EF-03',
        '离境与旧卡递交期限',
        'Absences and filing deadline',
        existingPermanent
          ? retainedPermanentRight
          : all(
              relyOnEarly || absences,
              retainedPermanentRight,
              timely === false ? amendedLateFiling || undefined : timely,
            ),
        [
          grSource('F02', 'arts. 13(2)–(3),17(2),(4),18'),
          grSource('F61', '§§9.1–9.3, 12.3'),
          grSource('F64', 'art. 42(10), p. 2302; art. 47'),
        ],
        disputedAbsence
          ? `同一次重大事由离境跨过 ${eu.residenceYears} 年居住期届满日，全程超过 ${eu.seriousAbsenceMonths} 个月。须核实该次离境对取得永久权的影响。`
          : summaryNeedsDates
            ? '所填居留期间的离境汇总超过上限。请补充行程日期与事由，以确定超限发生在哪个资格窗口。'
            : `取得前每年普通离境最多 ${eu.ordinaryAbsenceMonths} 个月，强制兵役除外；一次重大理由最多 ${eu.seriousAbsenceMonths} 个月。取得后连续离境超过 ${eu.lossYears} 年丧失权利。${amendedLateFiling ? '已领旧卡者按到期日核对逾期罚款。' : '旧制逾期过久须核实发卡。'}从未领卡者可用其他材料证明合格居留。`,
        disputedAbsence
          ? `One serious absence spans the ${eu.residenceYears}-year anniversary and exceeds ${eu.seriousAbsenceMonths} months in total. Verify how it affects acquisition of permanent residence.`
          : summaryNeedsDates
            ? 'The reported absence exceeds the limit for the declared residence history. Supply trip dates and reasons to establish which qualifying window it affected.'
            : `Before acquisition, ordinary absences total at most ${eu.ordinaryAbsenceMonths} months annually, apart from compulsory service and one serious absence up to ${eu.seriousAbsenceMonths} months. After acquisition, absence over ${eu.lossYears} consecutive years ends the right. ${amendedLateFiling ? 'Use the former card expiry to determine the late fine.' : 'A late filing under the earlier law may need review.'} Applicants never issued a card can document qualifying residence by other means.`,
        disputedAbsence ||
          summaryNeedsDates ||
          (a.stage === 'permanent' && timely === false && !amendedLateFiling)
          ? ['PD-315']
          : undefined,
      ),
    );
  }
  if (a.stage === 'retained' || (a.stage === 'permanent' && a.retention)) {
    const r = a.retention ?? {};
    const school = a.stage === 'retained' && a.schooling;
    const qualifies = school
      ? all(
          school.sponsorEvent === undefined ? undefined : true,
          school.applicant === undefined
            ? undefined
            : school.applicant !== 'other',
          school.childResidesInGreece,
          school.childStillEnrolledInGreece,
        )
      : all(
          retainedGround(r, false, req),
          retainedLivelihood(r, req),
          r.basis === 'access-in-greece'
            ? underAgeOn(r.childBirthDate, sim, eu.minorAge)
            : true,
        );
    checks.push(
      c.check(
        'EF-04',
        '婚姻或家庭关系终止后的保留权',
        'Retained right after a family event',
        all(qualifies, beforeOrOn(r.eventDate, sim)),
        [
          grSource('F02', 'arts. 10(2),11(2)–(3),12(2),15, pp. 2981–2984'),
          grSource('F21', 'art. 59(7)(α)–(δ)'),
        ],
        school
          ? '欧盟公民离境或死亡后，在希居住且仍在希就学的子女及实际监护的父母可保留居留至学业完成，须提供在学证明。'
          : '核对丧偶、离婚、监护探视或家暴及就业依据。以资源及医保保留时，最低养老金由当局结合个人处境评定。',
        school
          ? 'After the EU citizen departs or dies, a child residing and enrolled in Greece and the parent with actual custody retain residence until completion of studies. Provide proof of enrolment.'
          : 'Check the qualifying family event and employment basis. On a resources-and-cover basis the authorities assess resources with reference to the minimum pension and personal circumstances.',
        !school &&
          r.livelihood === 'resources' &&
          (r.resourcesAssessment === undefined ||
            r.resourcesAssessment === 'pending')
          ? ['PD-316']
          : undefined,
      ),
    );
  }
  checks.push(
    c.check(
      'EF-05',
      '公共秩序与关系真实性',
      'Public order and genuine relationship',
      all(
        security(req.publicOrder),
        a.shamOrFraud === undefined ? undefined : !a.shamOrFraud,
      ),
      [grSource('F02', 'arts. 21(1)–(2),26')],
      '仅个人行为造成的现实严重威胁可触发公共秩序限制；欺诈或虚假关系可撤销权利。',
      'Public-order restrictions require a genuine, present and sufficiently serious threat. Fraud or a sham relationship can invalidate the right.',
      req.publicOrder === 'review' ? ['PD-301'] : undefined,
    ),
  );
  const docs = ordinaryCard
    ? [
        '按亲属类别提供担保人登记或永久证、亲属及适用的监护、受养或同居供养文件。稳定伴侣须证明关系及共同生活。首卡可交全面公保申请或私保；续卡查有效医保和持续关系材料。',
        'Supply sponsor registration or permanent status, relationship and any required custody, dependency or household/support records. A durable partnership needs evidence of the relationship and shared life. Supply a full public cover application or private policy at first filing, active cover and continued family evidence at renewal.',
      ]
    : existingPermanent
      ? [
          '实际换卡须交旧永久卡。',
          'Present the old permanent card for an actual renewal.',
        ]
      : a.stage === 'retained'
        ? [
            '提供旧卡、家庭事件及当事人适用的收入和医保证据。',
            'Document the prior card, family event and applicable livelihood and insurance evidence.',
          ]
        : primaryCarer
          ? [
              '提供实际照护关系和适用期间的条约居留证明。可用原卡或其他证明材料。',
              'Document the primary care relationship and qualifying residence for the relevant period using a prior card or other evidence.',
            ]
          : [
              '提供旧卡或其他合格居留证明、担保人登记和亲属关系及有效医保证明。提前取得时另核适用的死亡或职业事故证明。',
              'Supply the former card or alternative qualifying residence evidence, sponsor registration, family records and insurance. For early acquisition, include applicable evidence of death or occupational accident.',
            ];
  const expiry = a.priorCardIssued === false ? undefined : a.priorCardExpiry;
  const late =
    a.stage === 'permanent' &&
    expiry &&
    (amendedLateFiling ? sim > addYears(expiry, eu.lateYears) : sim >= expiry);
  const insuranceEvidence =
    primaryCarer ||
    !req.insurance ||
    (a.stage === 'initial' && a.appliedForFullPublicCover === true) ||
    insuranceMet(req.insurance, 'either', a.stage === 'renewal');
  checks.push(
    c.check(
      'EF-06',
      '家属证件与费用',
      'Family documents and fees',
      a.stage === 'maintain'
        ? true
        : all(
            a.rightsDocumentsReady,
            a.stage !== 'permanent-renewal' || a.priorCardIssued !== false,
            existingPermanent || insuranceEvidence,
          ),
      [
        grSource('F02', 'arts. 9(2)–(5), 17(2)–(5)'),
        grSource('F64', 'art. 42(8),(10), p. 2302; art. 47'),
        grSource('F21', 'arts. 2(γ),59'),
        ...(a.stage === 'permanent' ? [grSource('F61', '§§9, 12.3')] : []),
        ...(primaryCarer ? [grSource('F61', '§§2.2.2.5, 5.2.4, 9.1')] : []),
      ],
      `${docs[0]}申请费 €${family.applicationFee}，制卡 €${p.gvFees.value.card}。${late ? (amendedLateFiling ? `本次逾期罚款 €${eu.lateFine}。` : `本次逾期罚款最高 €${eu.maxFine}。`) : ''}永久卡每 ${eu.cardYears} 年更新，核发最长 ${eu.decisionMonths} 个月。`,
      `${docs[1]} Filing €${family.applicationFee}, card €${p.gvFees.value.card}.${late ? (amendedLateFiling ? ` Late fine €${eu.lateFine}.` : ` Late fine up to €${eu.maxFine}.`) : ''} The permanent card renews every ${eu.cardYears} years; issue within ${eu.decisionMonths} months.`,
    ),
  );
  return checks;
}

export function propertyFamilyChecks(
  id: PropertyPath,
  req: GrFullRequest,
  c: GrContext,
): CountryCheck[] {
  if (id === 'GR-GOLDEN-VISA') return goldenChecks(req, c);
  if (id === 'GR-GREEK-FAMILY-PR') return greekChecks(req, c);
  return euChecks(req, c);
}
