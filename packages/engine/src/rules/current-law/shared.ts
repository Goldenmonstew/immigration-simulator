import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { addDays, fullYears } from '../../dates';
import { applicationLocationIssue, episodeOn } from '../../residence';
import type { CurrentResidence } from '../../residence';
import type { Lang } from '../../rule';
import type { Route } from '@uk-immigration/policy-data';
import type {
  ImmigrationEpisode,
  IsoDate,
  PersonTimeline,
  RuleResult,
} from '../../types';

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

export const isSkilledWorkerPartner = (e: ImmigrationEpisode) =>
  isSkilledWorkerDependant(e) && e.dependantOf === 'PARTNER';

/** SW 39.1(b)(i): the current partner already held partner permission when P settled. */
export function hasSettledSkilledWorkerPartner(
  timeline: PersonTimeline,
  principal: PersonTimeline,
  date: IsoDate,
): boolean {
  const settled = principal.settled;
  return (
    settled?.route === 'SKILLED_WORKER' &&
    settled.date !== '' &&
    settled.date <= date &&
    onSkilledWorkerPartner(timeline, date) &&
    onSkilledWorkerPartner(timeline, settled.date)
  );
}

export function onSkilledWorkerPartner(
  timeline: PersonTimeline,
  date: IsoDate,
): boolean {
  const current = episodeOn(timeline, date);
  return current !== undefined && isSkilledWorkerPartner(current);
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

export const crResidenceSources = [
  { srcId: 'SRC-008', locator: 'CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3' },
];

/** Dates on a travel day establish neither presence nor absence at filing time. */
export function applicationPresence(
  timeline: PersonTimeline,
  date: IsoDate,
  L: Lang,
): Omit<RuleResult, 'sources'> | undefined {
  const issue = applicationLocationIssue(timeline, date);
  if (issue === 'FAIL') {
    return {
      status: 'FAIL',
      explanation: L(
        `已申报的行程显示申请日 ${date} 在英国境外。此路线要求申请时人在英国。`,
        `The travel record places the applicant outside the UK on ${date}. This route requires the applicant to be in the UK when applying.`,
      ),
    };
  }
  if (issue === 'UNKNOWN') {
    return {
      status: 'UNKNOWN',
      explanation: L(
        `申报的行程无法确定 ${date} 递交申请时是否在英国。`,
        `The travel record does not establish whether the applicant was in the UK when applying on ${date}.`,
      ),
    };
  }
  return undefined;
}

export const absenceAssumption = (L: Lang) =>
  L(
    '缺席按 CR 3.1–3.2 计算，只计出境与返英之间在境外度过的整天；旧许可规则按许可起始日推定，CR 3.4 的豁免理由未建模。',
    'Absences follow CR 3.1–3.2 and count only whole days abroad between departure and return. The permission start date is used to infer whether the old permission rules apply. CR 3.4 exemptions are outside the model.',
  );

export function residenceAssumptions(
  timeline: PersonTimeline,
  applied: IsoDate,
  residence: CurrentResidence | undefined,
  L: Lang,
): string[] {
  if (!residence) return [];
  const { start, completion, referenceDate, deductedDays } = residence;
  const ordered = [...timeline.episodes].sort((a, b) =>
    a.validFrom.localeCompare(b.validFrom),
  );
  let coveredTo = ordered[0]?.validTo;
  const hasGap = ordered.slice(1).some((episode) => {
    const gap = episode.validFrom > addDays(coveredTo, 1);
    if (episode.validTo > coveredTo) coveredTo = episode.validTo;
    return gap;
  });
  return [
    ...(referenceDate !== applied && residence.applicationDate === applied
      ? [
          L(
            `按 CR 1.1 从 ${referenceDate} 回溯检查，合格期于 ${completion} 满期。申请日仍为 ${applied}。`,
            `Under CR 1.1 the period is assessed as of ${referenceDate} and completes on ${completion}. The application date remains ${applied}.`,
          ),
        ]
      : []),
    ...(deductedDays
      ? [
          L(
            `自 ${start} 起的连续期按 CR 4.2 扣除 ${deductedDays} 天无许可空档。`,
            `The continuous period from ${start} excludes ${deductedDays} days without permission under CR 4.2.`,
          ),
        ]
      : []),
    ...(hasGap
      ? [
          L(
            '许可记录的空档按无许可处理。CR 4.1(d)(i)、(ii)、(iv) 所需的递交和审批资料未收集，不能据此保留连续性。符合 CR 4.3 的 2020 年宽限期按已申报行程判断。',
            'Gaps in the permission record are treated as time without permission. The dates and decisions needed to confirm CR 4.1(d)(i), (ii) and (iv) are unavailable. Declared travel is used to assess the 2020 grace period under CR 4.3.',
          ),
        ]
      : []),
  ];
}

export function residenceCompleted(
  residence: CurrentResidence,
  applied: IsoDate,
  years: number,
  L: Lang,
): string {
  return residence.completion > applied
    ? L(
        `于 ${residence.completion} 满 ${years} 年，落在 ${applied} 申请的 CR 1.1 参考期内`,
        `${years} years completed on ${residence.completion}, within the CR 1.1 reference window for ${applied}`,
      )
    : L(`已满 ${years} 年`, `${years} years completed`);
}

export function residencePending(
  residence: CurrentResidence,
  years: number,
  L: Lang,
): string {
  if (!residence.applicationDate) {
    return L(
      '按已申报的许可和行程，无法给出满足居留要求的申请日',
      'the recorded permissions and travel do not support an application date for the residence requirement',
    );
  }
  return L(
    `预计 ${residence.completion} 满 ${years} 年，按 CR 1.1 最早于 ${residence.applicationDate} 满足申请的居留年限条件`,
    `expected to complete ${years} years on ${residence.completion}; the earliest projected application date for the residence requirement is ${residence.applicationDate} under CR 1.1`,
  );
}
