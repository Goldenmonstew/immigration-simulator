export const ENGINE_VERSION = '0.0.0';

export function getEngineVersion(): string {
  return ENGINE_VERSION;
}

export type * from './types';
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
