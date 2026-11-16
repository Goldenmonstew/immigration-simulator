import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { fullYears } from '../../dates';
import { episodeOn } from '../../residence';
import type { Lang } from '../../rule';
import type { Route } from '@uk-immigration/policy-data';
import type { ImmigrationEpisode, IsoDate, PersonTimeline } from '../../types';

export const RULE_SET = 'current-law-2026-11';

export const isSkilledWorker = (e: ImmigrationEpisode) =>
  e.route === 'SKILLED_WORKER' && e.role === 'MAIN';

export function onSkilledWorker(
  timeline: PersonTimeline,
  date: IsoDate,
): boolean {
  const current = episodeOn(timeline, date);
  return current !== undefined && isSkilledWorker(current);
}

/** Main applicant on `route` on `date`. */
const onMain = (timeline: PersonTimeline, date: IsoDate, route: Route) => {
  const current = episodeOn(timeline, date);
  return current?.route === route && current.role === 'MAIN';
};

export const onHongKongBno = (timeline: PersonTimeline, date: IsoDate) =>
  onMain(timeline, date, 'HONG_KONG_BNO');

export const onGlobalTalent = (timeline: PersonTimeline, date: IsoDate) =>
  onMain(timeline, date, 'GLOBAL_TALENT');

export const onUkAncestry = (timeline: PersonTimeline, date: IsoDate) =>
  onMain(timeline, date, 'UK_ANCESTRY');

export const onInnovatorFounder = (timeline: PersonTimeline, date: IsoDate) =>
  onMain(timeline, date, 'INNOVATOR_FOUNDER');

export const onPrivateLife = (timeline: PersonTimeline, date: IsoDate) =>
  onMain(timeline, date, 'FAMILY_AND_PRIVATE_LIFE');

/** Appendix FM partner on the date (any kind but PARENT, contracts §12.8). */
export function onFamilyPartner(timeline: PersonTimeline, date: IsoDate) {
  return (
    onMain(timeline, date, 'FAMILY_PARTNER_OR_PARENT') &&
    episodeOn(timeline, date)!.familyPermission !== 'PARENT'
  );
}

/** Appendix FM partner on the 10-year route on the date. */
export const onFamilyPartnerTenYear = (
  timeline: PersonTimeline,
  date: IsoDate,
) =>
  onFamilyPartner(timeline, date) &&
  episodeOn(timeline, date)!.familyPermission === 'PARTNER_TEN_YEAR';

/** Appendix FM partner on the 5-year route on the date. */
export const onFamilyPartnerFiveYear = (
  timeline: PersonTimeline,
  date: IsoDate,
) =>
  onFamilyPartner(timeline, date) &&
  episodeOn(timeline, date)!.familyPermission === 'PARTNER_FIVE_YEAR';

/** The episode on `date` if it is a dependant one on `route`. */
const dependantOn = (timeline: PersonTimeline, date: IsoDate, route: Route) => {
  const current = episodeOn(timeline, date);
  return current?.route === route && current.role === 'DEPENDANT'
    ? current
    : undefined;
};

export const minorOn = (timeline: PersonTimeline, date: IsoDate) =>
  fullYears(timeline.dateOfBirth, date) < cl.values.settlementMinorAge.value;

/**
 * Hong Kong BN(O) dependant on `date` (contracts §15.3): OWN = a partner or a
 * child aged 18 or over, assessed on their own 5 years (HK 62.1); CHILD =
 * under 18 (HK 57); RELATIVE = adult dependant relative (HK 59.1).
 */
export function hongKongBnoDependant(
  timeline: PersonTimeline,
  date: IsoDate,
): 'OWN' | 'CHILD' | 'RELATIVE' | undefined {
  const of = dependantOn(timeline, date, 'HONG_KONG_BNO')?.dependantOf;
  if (of === 'PARTNER') return 'OWN';
  if (of === 'PARENT') return minorOn(timeline, date) ? 'CHILD' : 'OWN';
  return of === 'RELATIVE' ? 'RELATIVE' : undefined;
}

/** Global Talent dependent partner or child on `date` (GT 25–34). */
export function globalTalentDependant(
  timeline: PersonTimeline,
  date: IsoDate,
): 'PARTNER' | 'PARENT' | undefined {
  const of = dependantOn(timeline, date, 'GLOBAL_TALENT')?.dependantOf;
  return of === 'PARTNER' || of === 'PARENT' ? of : undefined;
}

/** Child of an Appendix FM partner or parent on `date`. */
export const onFamilyChild = (timeline: PersonTimeline, date: IsoDate) =>
  dependantOn(timeline, date, 'FAMILY_PARTNER_OR_PARENT')?.dependantOf ===
  'PARENT';

// Refugee status or humanitarian protection under current law, whichever
// Earned Settlement protection route the user entered (contracts §14.3).
const PROTECTION_ROUTES: Route[] = [
  'CORE_PROTECTION',
  'PROTECTION_WORK_AND_STUDY',
  'SAFE_AND_LEGAL',
  'LEGACY_SAFE_AND_LEGAL',
];

export const isProtection = (e: ImmigrationEpisode) =>
  e.role === 'MAIN' && PROTECTION_ROUTES.includes(e.route);

/** Main applicant with refugee status or humanitarian protection on `date`. */
export function onProtection(timeline: PersonTimeline, date: IsoDate) {
  const current = episodeOn(timeline, date);
  return current !== undefined && isProtection(current);
}

// Routes modelled for main applicants only: their dependants are out of scope.
export const MAIN_ONLY_ROUTES: Route[] = [
  'HONG_KONG_BNO',
  'GLOBAL_TALENT',
  'FAMILY_PARTNER_OR_PARENT',
  ...PROTECTION_ROUTES,
  'UK_ANCESTRY',
  'INNOVATOR_FOUNDER',
  'FAMILY_AND_PRIVATE_LIFE',
];

// A Skilled Worker's dependant: the run of such permissions counts towards
// settlement as a dependent partner (SW 42.1).
export const isSkilledWorkerDependant = (e: ImmigrationEpisode) =>
  e.route === 'SKILLED_WORKER' && e.role === 'DEPENDANT';

export function onSkilledWorkerPartner(
  timeline: PersonTimeline,
  date: IsoDate,
): boolean {
  const current = episodeOn(timeline, date);
  return (
    current !== undefined &&
    isSkilledWorkerDependant(current) &&
    current.dependantOf === 'PARTNER'
  );
}

export function onSkilledWorkerChild(
  timeline: PersonTimeline,
  date: IsoDate,
): boolean {
  const current = episodeOn(timeline, date);
  return (
    current !== undefined &&
    isSkilledWorkerDependant(current) &&
    current.dependantOf === 'PARENT'
  );
}

export const CR_3_1 = {
  maxDays: cl.values.continuousResidenceMaxAbsenceDays.value,
  windowMonths: cl.values.continuousResidenceWindowMonths.value,
};

export const absenceAssumption = (L: Lang) =>
  L(
    `缺席按 Appendix Continuous Residence CR 3.1 计算，出境与入境当日都计入缺席；CR 3.4 的可豁免缺席理由未建模。`,
    'Absences are counted under Appendix Continuous Residence CR 3.1, with the days of departure and return both counted as absence; the permitted reasons for absence in CR 3.4 are not modelled.',
  );
