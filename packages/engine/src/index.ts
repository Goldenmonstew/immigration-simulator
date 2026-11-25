export const ENGINE_VERSION = '0.0.0';

export function getEngineVersion(): string {
  return ENGINE_VERSION;
}

export type * from './types';
export type {
  CountryCheck,
  CountryColumn,
  CountryPathway,
  CountryResult,
} from './country-result';
export { adaptUkResult } from './country-result';
export { addDays, addMonths, addYears } from './dates';
export type {
  CefrLevel,
  Route,
  RouteGroup,
  RuleSetId,
  SourceRef,
} from '@uk-immigration/policy-data';
export { evaluate, RULE_SETS } from './evaluate';
export { RULES } from './rules';
export { withRuleSet } from './rule';
export { hasSettledSkilledWorkerPartner } from './rules/current-law/shared';
export { skilledWorkerApplication } from './rules/current-law/sw-application';
export type {
  SkilledWorkerApplication,
  SkilledWorkerApplicationResult,
} from './rules/current-law/sw-application';
export {
  familyFiveYearStart,
  familyIncomeThreshold,
  onProtection,
} from './rules/current-law';
export { AU_FULL_PATHWAYS, evaluateAustraliaFull } from './australia-full';
export type { AuFullPathId, AuFullRequest } from './australia-full';
export {
  AU_PERMANENT_SUBCLASSES,
  AU_TEMPORARY_SUBCLASSES,
  evaluateAustralia,
} from './australia';
export { evaluateGreeceFull } from './greece-full';
export type { GrFullRequest, GrFullPathwayId } from './greece-full';
export type { GrEntry, GrInsurance } from './greece-rules';
export {
  GR_NATIONALITY_ROUTES,
  GR_PERMIT_KINDS,
  evaluateGreece,
} from './greece';
export type {
  GrNationalityRoute,
  GrPathway,
  GrPathwayId,
  GrPermit,
  GrPermitKind,
  GrRequest,
  GrResult,
  GrTrip,
} from './greece';
export {
  IE_PERMISSION_KINDS,
  IE_STAMP4_ROUTES,
  evaluateIreland,
} from './ireland';
export type {
  IePathway,
  IePathwayId,
  IePermission,
  IePermissionKind,
  IeRequest,
  IeResult,
  IeStamp4Route,
  IeTrip,
} from './ireland';
export {
  PT_NATIONALITY_ROUTES,
  PT_PERMIT_KINDS,
  evaluatePortugal,
} from './portugal';
export type {
  PtNationalityRoute,
  PtPathway,
  PtPathwayId,
  PtPermit,
  PtPermitKind,
  PtRequest,
  PtResult,
  PtTrip,
} from './portugal';
export { evaluatePortugalFull } from './portugal-full';
export type {
  PtFreeMovementEvidence,
  PtFullRequest,
  PtInvestment,
  PtInvestmentEvidence,
  PtLanguageEvidence,
  PtLongTermEvidence,
  PtMeansEvidence,
  PtNationalityCrime,
  PtNationalityEvidence,
  PtOfficialReview,
  PtPartnerEvidence,
  PtRenewalEvidence,
  PtResidenceEvidence,
} from './portugal-full-types';
export {
  DE_NATURALISATION_ROUTES,
  DE_PERMIT_KINDS,
  DE_SETTLEMENT_ROUTES,
  DE_UNLIMITED_KINDS,
  evaluateGermany,
} from './germany';
export type {
  DeNaturalisationRoute,
  DePathway,
  DePathwayId,
  DePermit,
  DePermitKind,
  DeRequest,
  DeResult,
  DeSettlementRoute,
  DeTrip,
} from './germany';
export { ES_FULL_TARGETS, evaluateSpainFull } from './spain-full';
export type { EsFullInput, EsFullRequest, EsFullTarget } from './spain-full';
export type { EsNationalityFacts } from './spain-nationality';
export type {
  EsResidenceFacts,
  EsEuPeriod,
  EsFamilyResources,
  EsHealthCover,
} from './spain-residence';
export type { EsMobilityFacts } from './spain-mobility';
export type { EsFreeMovementFacts } from './spain-free-movement';
export type { EsLongTermCardFacts, EsRecoveryFacts } from './spain-recovery';
export { ES_NATIONALITY_ROUTES, evaluateSpain } from './spain';
export type {
  EsNationalityRoute,
  EsPathway,
  EsPathwayId,
  EsPermit,
  EsRequest,
  EsResult,
  EsTrip,
} from './spain';
export { US_CONDITIONAL, evaluateUnitedStates } from './united-states';
export type {
  UsConditional,
  UsPathway,
  UsPathwayId,
  UsRequest,
  UsResult,
  UsTrip,
} from './united-states';
export { evaluateCanadaFull } from './canada-full';
export type {
  CaFullCheck,
  CaFullPathwayId,
  CaFullRequest,
  CaFullResult,
} from './canada-full';
export { evaluateCanada } from './canada';
export type {
  CaPathway,
  CaPathwayId,
  CaPeriod,
  CaRequest,
  CaResult,
  CaTrip,
} from './canada';
export {
  JP_NATURALISATION_ROUTES,
  JP_PR_ROUTES,
  evaluateJapan,
  jpStayLimit,
} from './japan';
export type {
  JpNaturalisationRequest,
  JpNaturalisationRoute,
  JpPathway,
  JpPathwayId,
  JpPrRequest,
  JpPrRoute,
  JpRequest,
  JpResult,
  JpTrip,
} from './japan';
export { evaluateJapanFull } from './japan-full';
export {
  editJapanTripAnswer,
  isJapanReturnComparison,
  japanDepartureByRoute,
  japanTripOccurrences,
  japanTripReturnOn,
  sameJapanTrip,
  shareJapanTripAnswers,
} from './japan-trip-answers';
export type { JpFullRequest } from './japan-full';
export { nextCounterFilingDay } from './japan-full-shared';
export {
  clearJapanPrFilingEvidence,
  clearJapanTalentMaintenance,
  japanTalentHistoricalDate,
} from './japan-full-pr';
export type {
  JpFullCheck,
  JpFullPathway,
  JpFullResult,
} from './japan-full-shared';
export type {
  JpFullPrRequest,
  JpFullPrRoute,
  JpPrCommonEvidence,
} from './japan-full-pr';
export type {
  JpFullNaturalisationRequest,
  JpFullNaturalisationRoute,
  JpNaturalisationEvidence,
} from './japan-full-naturalisation';
export {
  japanOrdinaryFiling,
  type JpFullReentryRequest,
} from './japan-full-reentry';
export type { JpHspSnapshot, JpJSkipSnapshot } from './japan-full-talent';
export { NZ_RESIDENT_CATEGORIES, evaluateNewZealand } from './new-zealand';
export type {
  NzPathway,
  NzPathwayId,
  NzRequest,
  NzResidentCategory,
  NzResult,
  NzTrip,
} from './new-zealand';
export type {
  PilotCheck,
  PilotPathway,
  PilotResult,
  PilotStatus,
} from './pilot';
export type {
  AuCheck,
  AuPathway,
  AuPathwayId,
  AuRequest,
  AuResult,
  AuStatus,
  AuSubclass,
  AuTrip,
  AuVisa,
} from './australia';
export {
  DE_FULL_ROUTES,
  DE_PROCEDURE_CHECKS,
  evaluateGermanyFull,
} from './germany-full';
export type { DeFullRequest, DeFullRoute } from './germany-full';
export { evaluateIrelandFull } from './ireland-full';
export type {
  IrelandBurden,
  IrelandCharacter,
  IrelandCitizenship,
  IrelandFamily,
  IrelandFullPathwayId,
  IrelandFullRequest,
  IrelandLtr,
  IrelandRegistration,
  IrelandResidencePeriod,
  IrelandTreatyActivity,
  IrelandTreatyResidence,
  IrelandWcatt,
  IrelandWorkPermit,
  IrelandWorkUpgrade,
} from './ireland-full';
export { evaluateNewZealandFull, type NzFullRequest } from './new-zealand-full';
export type {
  NzCommonAnswers,
  NzDependantAnswers,
  NzPersonAnswers,
  NzEnglishEvidence,
} from './new-zealand-checks';
export type { NzResidentAnswers } from './new-zealand-resident';
export type { NzSkilledAnswers } from './new-zealand-skilled';
export type { NzFamilyAnswers } from './new-zealand-family';

export { evaluateUnitedStatesFull } from './united-states-full';
export type * from './united-states-full';
export { MY_FULL_PATHWAYS, evaluateMalaysiaFull } from './malaysia-full';
export type {
  MyFamilyTie,
  MyFullRequest,
  MyMm2hCategory,
  MyPassKind,
  MyPassPeriod,
  MyPathway,
  MyPathwayId,
  MyTrip,
} from './malaysia-full';
