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
export {
  AU_PERMANENT_SUBCLASSES,
  AU_TEMPORARY_SUBCLASSES,
  evaluateAustralia,
} from './australia';
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
