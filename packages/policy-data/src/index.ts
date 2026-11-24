export const POLICY_DATA_VERSION = '0.0.0';

export type {
  BestYears,
  CefrLevel,
  DatedEnglishRequirement,
  Parameter,
  ParameterSet,
  RuleSetId,
  SourceRef,
} from './types';
export { RULE_SET_IDS, RULE_SET_IDS_BY_COUNTRY } from './types';
export { PARAMETERS, PARAMETERS_BY_COUNTRY } from './parameters';
export { ROUTE_GROUPS, ROUTE_GROUP_SOURCES } from './routes';
export type { Route, RouteGroup } from './routes';
export { currentLaw2026_11 } from './parameters/current-law-2026-11';
export { earnedSettlement2026_11 } from './parameters/earned-settlement-2026-11';
export {
  australia2026_11,
  australiaFull2026_11,
  auFamilyParameters,
  auRegionalParameters,
  australiaSkilledParameters,
  auPublicCriteria,
  auCharges,
} from './parameters/australia-2026-11';
export { newZealand2026_11 } from './parameters/new-zealand-2026-11';
export { canada2026_11 } from './parameters/canada-2026-11';
export { unitedStates2026_11 } from './parameters/united-states-2026-11';
export { spain2026_11, spainFull2026_11 } from './parameters/spain-2026-11';
export { greece2026_11 } from './parameters/greece-2026-11';
export { ireland2026_11 } from './parameters/ireland-2026-11';
export { portugal2026_11 } from './parameters/portugal-2026-11';
export { japan2026_11, japanFull2026_11 } from './parameters/japan-2026-11';
export {
  germany2026_11,
  germanyFull2026_11,
} from './parameters/germany-2026-11';
export { publicFundsBenefits } from './data/public-funds-benefits';
export type { Benefit } from './data/public-funds-benefits';
export { annexCOccupations, careWorkerOccupations } from './data/occupations';
export type { Occupation } from './data/occupations';
export { policyChangelog } from './data/policy-changelog';
export type { PolicyChange } from './data/policy-changelog';
export {
  goingRates,
  nationalPayScaleBelowRqf6Occupations,
  nationalPayScaleOccupations,
} from './data/skilled-occupations';
export type { GoingRate } from './data/skilled-occupations';
export {
  healthAndCareAsheOccupations,
  table3DirectPayOccupations,
} from './data/occupations';
export { healthEducationTransitionalExamples } from './data/occupations';
export { immigrationSalaryListOccupations } from './data/immigration-salary-list';
export type { ImmigrationSalaryListEntry } from './data/immigration-salary-list';
export {
  asylumSupportRepaymentNames,
  breachTypeNames,
  resettlementSchemeNames,
  routeGroupNames,
  routeNames,
  sustainedActivityNames,
} from './data/display-names';
export type { DisplayName } from './data/display-names';
export { settlementEnglishNationalities } from './data/settlement-english-nationalities';
