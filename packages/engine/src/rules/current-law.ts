// Current Immigration Rules, modelled for Skilled Worker settlement (SRC-004),
// Long Residence (SRC-005) and the main applicants of Hong Kong BN(O)
// (SRC-020) and Global Talent (SRC-021), Appendix FM partners on the
// 10-year (SRC-022) and 5-year (SRC-024, SRC-025) routes, people with
// refugee status or humanitarian protection (SRC-023), and UK Ancestry
// (SRC-026), Innovator Founder (SRC-027) and Private Life (SRC-028) main
// applicants.
// Split by route under ./current-law/; this barrel keeps existing imports.
export * from './current-law/shared';
export * from './current-law/scope';
export * from './current-law/skilled-worker';
export * from './current-law/hong-kong-bno';
export * from './current-law/global-talent';
export * from './current-law/family';
export * from './current-law/protection';
export * from './current-law/ancestry';
export * from './current-law/innovator';
export * from './current-law/private-life';
export * from './current-law/dependants';
export * from './current-law/english';
export * from './current-law/long-residence';
