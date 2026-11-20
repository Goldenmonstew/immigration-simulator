// Current Immigration Rules, modelled for Skilled Worker settlement (SRC-004),
// Long Residence (SRC-005) and the main applicants of Hong Kong BN(O)
// (SRC-020) and Global Talent (SRC-021), Appendix FM partners on the
// 10-year (SRC-022) and 5-year (SRC-024, SRC-025) routes, people with
// refugee status or humanitarian protection (SRC-023), and UK Ancestry
// (SRC-026), Innovator Founder (SRC-027) and Private Life (SRC-028) main
// applicants.
// Split by route under ./current-law/; only the original public names are re-exported.
export {
  onSkilledWorker,
  onHongKongBno,
  onUkAncestry,
  onInnovatorFounder,
  onFamilyPartner,
  hongKongBnoDependant,
  onProtection,
  onSkilledWorkerPartner,
  onSkilledWorkerChild,
} from './current-law/shared';
export { clScope } from './current-law/scope';
export {
  skilledWorkerResidence,
  clSwResidence5Y,
  clSwSalary,
  clSwGoingRate,
  skilledWorkerPartnerResidence,
  clSwPartner5Y,
  skilledWorkerChildFiling,
  clSwChild,
} from './current-law/skilled-worker';
export {
  hongKongBnoResidence,
  clHkbnoResidence5Y,
  hongKongBnoDependantPathway,
  clHkbnoDependant,
} from './current-law/hong-kong-bno';
export {
  globalTalentQualifying,
  clGtResidence,
  globalTalentDependantPathway,
  clGtDependant,
} from './current-law/global-talent';
export {
  familyTenYearResidence,
  familyFiveYearStart,
  clFamilyResidence,
  clFamilyRelationship,
  familyIncomeThreshold,
  clFamilyFinancial,
  onFiveYearFamilyChild,
  familyChildPathway,
  clFamilyChild,
} from './current-law/family';
export {
  protectionStart,
  clProtectionResidence5Y,
  clProtectionStatus,
} from './current-law/protection';
export {
  ukAncestryResidence,
  clAncestryResidence5Y,
} from './current-law/ancestry';
export {
  innovatorFounderResidence,
  clInnovatorResidence3Y,
  clInnovatorEndorsement,
} from './current-law/innovator';
export {
  privateLifeQualifying,
  clPrivateLifeResidence,
} from './current-law/private-life';
export { ageExempt, clEnglish, clKol } from './current-law/english';
export { longResidence, clLrResidence10Y } from './current-law/long-residence';
