import { irelandFull2026_11 as full } from '@uk-immigration/policy-data';
import { addDays, addMonths, daysBetween } from '../dates';
import { afterYears, monthSpan } from '../pilot';
import type { IsoDate } from '../types';
import { ageAtLeast, all, any, mergePeriods } from './common';
import type { IrelandAssessment, IrelandResidencePeriod } from './common';

const p = full.treaty.value;

export type IrelandTreatyActivity = IrelandResidencePeriod & {
  basis:
    | 'initial'
    | 'employed'
    | 'self-employed'
    | 'self-sufficient'
    | 'student'
    | 'family'
    | 'retained-family'
    | 'registered-involuntary-unemployment'
    | 'temporary-incapacity'
    | 'vocational-training'
    | 'jobseeker'
    | 'ineligible';
  /**
   * Evidence of the named basis for this whole period. A family period confirms
   * qualifying residence with the sponsor. A retained-family period confirms
   * residence under the retained right after the family event.
   */
  verified?: boolean;
  sufficientResources?: boolean;
  comprehensiveSicknessInsurance?: boolean;
  recognisedEducation?: boolean;
  sufficientIdentity?: boolean;
  unreasonableBurden?: boolean;
  enteredOn?: IsoDate;
  previousWorkerFrom?: IsoDate;
  employmentEndedOn?: IsoDate;
  shortFixedTerm?: boolean;
  trainingRelatedOrInvoluntary?: boolean;
};

export interface IrelandTreatyResidence {
  role?: 'citizen' | 'family';
  qualifyingNationality?: boolean;
  regulatedFreeMovementBasis?: boolean;
  returningIrishOrDualNationality?: boolean;
  qualifyingSponsor?: boolean;
  sponsorStudent?: boolean;
  relationship?:
    | 'spouse'
    | 'civil-partner'
    | 'descendant'
    | 'ascendant'
    | 'other-dependent'
    | 'durable-partner'
    | 'care';
  dependency?: boolean;
  relationshipEvidence?: boolean;
  permittedFamilyApproval?: boolean;
  nonEuFamily?: boolean;
  activities?: IrelandTreatyActivity[];
  /** True when actual residence, co-residence where required and travel history are complete. */
  residenceAndTravelComplete?: boolean;
  absences?: {
    leftOn: IsoDate;
    returnedOn?: IsoDate;
    reason?: 'temporary' | 'military' | 'important';
    exceptionConfirmed?: boolean;
  }[];
  acquisition?: 'ordinary' | 'early' | 'retained';
  early?: {
    kind?: 'retired' | 'incapacity' | 'frontier' | 'worker-death';
    eventOn?: IsoDate;
    residenceFrom?: IsoDate;
    workFrom?: IsoDate;
    pensionAgeOrEarlyRetirementConfirmed?: boolean;
    workerOrSelfEmployed?: boolean;
    permanentIncapacityConfirmed?: boolean;
    statePaidOccupationalInjuryBenefit?: boolean;
    irishSpouseOrCivilPartner?: boolean;
    homeInStateAndWeeklyReturns?: boolean;
    worksInOtherMemberState?: boolean;
    coResidingQualifiedFamily?: boolean;
    occupationalDeath?: boolean;
  };
  retention?: {
    event?: 'death' | 'departure' | 'dissolution' | 'child-education-only';
    eventOn?: IsoDate;
    relationshipFrom?: IsoDate;
    livedInStateAsFamilyFrom?: IsoDate;
    sponsorHadRightOfResidence?: boolean;
    sponsorStillInStateAtProceedings?: boolean;
    custodyGranted?: boolean;
    particularlyDifficultCircumstancesConfirmed?: boolean;
    contactRightMustBeInState?: boolean;
    contactChildDob?: IsoDate;
    personalBasis?: 'work' | 'self-support' | 'qualified-family';
    economicBasisConfirmed?: boolean;
    resourcesAndCsi?: boolean;
    determination?: boolean;
  };
  wa?: {
    britishOrQualifyingFamily?: boolean;
    /** Timestamp with zone for the start of relevant residence or eligibility before the transition ended. */
    relevantStart?: string;
    protectedBeforeAndContinued?: boolean;
    familyCategory?:
      | 'already-resident'
      | 'prior-relationship'
      | 'later-child'
      | 'retention'
      | 'permitted-relative'
      | 'necessary-carer';
    qualifyingFamilyEventConfirmed?: boolean;
    recognisedWaScope?: boolean;
    /** WA scope for residence after returning from the latest absence that ended permanent residence. */
    postLossScopeConfirmed?: boolean;
  };
  document?: {
    inState?: boolean;
    identityAndResidenceEvidence?: boolean;
    currentCardExpiresOn?: IsoDate;
    filedOn?: IsoDate;
    addressAndStatusNotified?: boolean;
    prolongedAbsenceNotified?: boolean;
    publicInterest?: 'clear' | 'pending' | 'restricting-order';
    examRequested?: boolean;
    examDone?: boolean;
    priorPermanentRightOn?: IsoDate;
    /** Start of a continuous absence after acquisition; may be paired with a return date. */
    postGrantAbsence?: { from: IsoDate; returnedOn?: IsoDate };
    extraFeeRequested?: boolean;
  };
}

function activityMet(activity: IrelandTreatyActivity) {
  const a = activity;
  switch (a.basis) {
    case 'ineligible':
      return false;
    case 'jobseeker':
      return a.verified === false ? false : undefined;
    case 'initial':
      return all(
        a.verified,
        a.sufficientIdentity,
        a.unreasonableBurden === undefined ? undefined : !a.unreasonableBurden,
      );
    case 'student':
      return all(
        a.verified,
        a.recognisedEducation,
        a.sufficientResources,
        a.comprehensiveSicknessInsurance,
      );
    case 'self-sufficient':
      return all(
        a.verified,
        a.sufficientResources,
        a.comprehensiveSicknessInsurance,
      );
    case 'vocational-training':
      return all(a.verified, a.trainingRelatedOrInvoluntary);
    case 'registered-involuntary-unemployment':
      return all(
        a.verified,
        a.previousWorkerFrom ? true : undefined,
        a.employmentEndedOn ? true : undefined,
      );
    default:
      return a.verified;
  }
}

function eligibleActivityPeriod(activity: IrelandTreatyActivity, day: IsoDate) {
  const a = activity;
  const isInitial = a.basis === 'initial';
  if (isInitial && !a.enteredOn) return undefined;
  const limit =
    isInitial && a.enteredOn
      ? addMonths(a.enteredOn, p.initialMonths)
      : a.basis === 'registered-involuntary-unemployment' &&
          a.previousWorkerFrom &&
          a.employmentEndedOn &&
          (a.shortFixedTerm ||
            a.employmentEndedOn <
              afterYears(a.previousWorkerFrom, p.workerFirstYears))
        ? addMonths(a.employmentEndedOn, p.retainedWorkerMonths)
        : undefined;
  const to = [a.to ?? day, day, limit ? addDays(limit, -1) : day].sort()[0];
  const from = a.enteredOn && a.enteredOn > a.from ? a.enteredOn : a.from;
  return { from, to };
}

function familyStatus(
  a: IrelandAssessment,
  r: IrelandTreatyResidence,
  dob: IsoDate | undefined,
) {
  if (
    r.returningIrishOrDualNationality &&
    r.regulatedFreeMovementBasis !== true
  )
    return undefined;
  if (r.role === 'family' && r.acquisition === 'retained')
    return all(r.qualifyingSponsor, r.relationshipEvidence);
  if (
    r.role === 'family' &&
    r.acquisition === 'early' &&
    r.early?.kind === 'worker-death'
  ) {
    return all(
      r.qualifyingSponsor,
      r.relationshipEvidence,
      r.early.coResidingQualifiedFamily,
    );
  }
  const role = r.role;
  if (!role) return undefined;
  if (role === 'citizen')
    return all(r.qualifyingNationality, r.regulatedFreeMovementBasis);
  const relation = r.relationship;
  const underAge = ageAtLeast(dob, a.day, p.descendantAge);
  const partner = relation === 'spouse' || relation === 'civil-partner';
  const dependent =
    relation === 'descendant'
      ? any(underAge === undefined ? undefined : !underAge, r.dependency)
      : r.dependency;
  const regular = partner
    ? true
    : relation === 'descendant'
      ? r.sponsorStudent
        ? r.dependency
        : dependent
      : relation === 'ascendant'
        ? r.sponsorStudent
          ? false
          : r.dependency
        : relation
          ? r.permittedFamilyApproval
          : undefined;
  return all(r.qualifyingSponsor, r.relationshipEvidence, regular);
}

/** Permitted absences preserve continuity. They are not a new residence basis. */
function absenceCompliance(
  r: IrelandTreatyResidence,
  start: IsoDate,
  end: IsoDate,
  day: IsoDate,
) {
  const windows: { from: IsoDate; to: IsoDate }[] = [];
  let important = false;
  let uncertain = false;
  for (const absence of [...(r.absences ?? [])].sort((a, b) =>
    a.leftOn.localeCompare(b.leftOn),
  )) {
    if (
      absence.leftOn >= end ||
      (absence.returnedOn && absence.returnedOn <= start)
    )
      continue;
    const returned =
      absence.returnedOn && absence.returnedOn < day ? absence.returnedOn : day;
    const from = absence.leftOn < start ? start : absence.leftOn;
    if (returned <= from) continue;
    if (absence.reason === 'military' && absence.exceptionConfirmed === true)
      continue;
    if (
      absence.reason === 'important' &&
      !important &&
      returned <= addMonths(absence.leftOn, p.importantAbsenceMonths)
    ) {
      if (absence.exceptionConfirmed === true) {
        important = true;
        continue;
      }
      if (absence.exceptionConfirmed === undefined) uncertain = true;
    }
    if (
      absence.reason === undefined ||
      (absence.reason === 'military' &&
        absence.exceptionConfirmed === undefined)
    )
      uncertain = true;
    windows.push({ from, to: addDays(returned, -1) });
  }
  const periods = mergePeriods(windows, end);
  const [shortest, longest] = monthSpan(p.absenceMonths);
  let fractionalMonths = false;
  for (const { from, to } of periods) {
    // Rolling windows around each period, with calendar-month bounds.
    for (
      let window = addMonths(from, -p.absenceWindowMonths);
      window <= to;
      window = addDays(window, 1)
    ) {
      const windowEnd = addMonths(window, p.absenceWindowMonths);
      const total = periods.reduce((sum, period) => {
        const first = window > period.from ? window : period.from;
        const last =
          windowEnd < addDays(period.to, 1) ? windowEnd : addDays(period.to, 1);
        return sum + Math.max(0, daysBetween(first, last));
      }, 0);
      if (periods.length === 1) {
        if (addDays(to, 1) > addMonths(from, p.absenceMonths))
          return uncertain ? undefined : false;
        break;
      }
      if (total > longest) return uncertain ? undefined : false;
      if (total > shortest) fractionalMonths = true;
    }
  }
  return r.absences === undefined || uncertain || fractionalMonths
    ? undefined
    : true;
}

function treatyActivities(r: IrelandTreatyResidence) {
  const retainedOn =
    r.role === 'family' && r.acquisition === 'retained'
      ? r.retention?.eventOn
      : undefined;
  return r.activities?.flatMap((activity) => {
    if (activity.basis === 'retained-family') {
      if (!retainedOn || (activity.to && activity.to < retainedOn)) return [];
      const from = activity.from < retainedOn ? retainedOn : activity.from;
      return [{ ...activity, from }];
    }
    if (r.role !== 'family') return [activity];
    if (activity.basis !== 'family') return [];
    if (!retainedOn || (activity.to && activity.to < retainedOn))
      return [activity];
    return activity.from < retainedOn
      ? [{ ...activity, to: addDays(retainedOn, -1) }]
      : [];
  });
}

function ordinaryResidence(
  r: IrelandTreatyResidence,
  activities: IrelandTreatyActivity[] | undefined,
  day: IsoDate,
  notBefore?: IsoDate,
) {
  const certain: IrelandResidencePeriod[] = [];
  const possible: IrelandResidencePeriod[] = [];
  for (const activity of activities ?? []) {
    const period = eligibleActivityPeriod(activity, day);
    const status = activityMet(activity);
    const range = period ?? activity;
    const from = notBefore && notBefore > range.from ? notBefore : range.from;
    if (status !== false) possible.push({ ...range, from });
    if (status === true && period) certain.push({ ...period, from });
  }
  const away = mergePeriods(
    (r.absences ?? []).map(({ leftOn, returnedOn }) => ({
      from: leftOn,
      to: returnedOn ? addDays(returnedOn, -1) : undefined,
    })),
    addDays(day, -1),
  );
  const returns = away.map(({ to }) => addDays(to, 1));
  function qualifyingSpan(periods: IrelandResidencePeriod[]) {
    const residence = mergePeriods(periods, day);
    // A trip can bridge a gap in the activity records, but cannot begin a
    // residence period. Test the statutory absence rules on each candidate.
    const spans = mergePeriods([...residence, ...away], day);
    let uncertain = false;
    for (const span of spans) {
      const evidence = residence.filter(
        ({ from }) => span.from <= from && from <= span.to,
      );
      const last = evidence.at(-1)?.to;
      if (!last) continue;
      const starts = [
        ...evidence.map(({ from }) => from),
        ...returns.filter((date) =>
          evidence.some(({ from, to }) => from <= date && date <= to),
        ),
      ].sort();
      for (const start of starts) {
        const acquired = afterYears(start, p.ordinaryYears);
        if (
          acquired > day ||
          acquired > addDays(last, 1) ||
          away.some(({ from, to }) => from <= start && start <= to)
        )
          continue;
        const absence = absenceCompliance(r, start, acquired, day);
        if (absence === true) return { met: true, acquired } as const;
        if (absence === undefined) uncertain = true;
      }
    }
    return { met: uncertain ? undefined : false, acquired: undefined };
  }
  if (r.residenceAndTravelComplete !== true || !activities)
    return { met: undefined, acquired: undefined };
  const proven = qualifyingSpan(certain);
  if (proven.met !== false) return proven;
  return {
    met: qualifyingSpan(possible).met === false ? false : undefined,
    acquired: undefined,
  };
}

function earlyResidence(r: IrelandTreatyResidence, day: IsoDate) {
  const e = r.early;
  const date = e?.eventOn;
  if (!date || !e.kind) return undefined;
  if (date > day) return false;
  const residence = e.residenceFrom;
  const work = e.workFrom;
  switch (e.kind) {
    case 'retired':
      return all(
        e.workerOrSelfEmployed,
        e.pensionAgeOrEarlyRetirementConfirmed,
        e.irishSpouseOrCivilPartner
          ? true
          : all(
              residence
                ? date > afterYears(residence, p.retirementResidenceYears)
                : undefined,
              work
                ? date >= addMonths(work, p.retirementWorkMonths)
                : undefined,
            ),
        r.role === 'family' ? e.coResidingQualifiedFamily : true,
      );
    case 'incapacity':
      return all(
        e.workerOrSelfEmployed,
        e.permanentIncapacityConfirmed,
        any(
          e.irishSpouseOrCivilPartner,
          e.statePaidOccupationalInjuryBenefit,
          residence
            ? date > afterYears(residence, p.incapacityResidenceYears)
            : undefined,
        ),
        r.role === 'family' ? e.coResidingQualifiedFamily : true,
      );
    case 'frontier':
      return all(
        e.workerOrSelfEmployed,
        e.worksInOtherMemberState,
        e.homeInStateAndWeeklyReturns,
        residence ? date >= afterYears(residence, p.frontierYears) : undefined,
        work ? date >= afterYears(work, p.frontierYears) : undefined,
        r.role === 'family' ? e.coResidingQualifiedFamily : true,
      );
    case 'worker-death':
      return all(
        r.role === undefined ? undefined : r.role === 'family',
        e.workerOrSelfEmployed,
        e.coResidingQualifiedFamily,
        any(
          e.occupationalDeath,
          residence
            ? date >= afterYears(residence, p.deathResidenceYears)
            : undefined,
        ),
      );
  }
}

function retainedResidence(r: IrelandTreatyResidence, day: IsoDate) {
  const t = r.retention;
  if (!t?.event) return undefined;
  if (t.event === 'child-education-only' || t.determination === false)
    return false;
  if (t.eventOn && t.eventOn > day) return false;
  const qualifyingRelationship =
    t.eventOn && t.relationshipFrom
      ? t.eventOn >= afterYears(t.relationshipFrom, p.retainedRelationYears)
      : undefined;
  const inState =
    t.eventOn && t.livedInStateAsFamilyFrom
      ? t.eventOn >=
        afterYears(t.livedInStateAsFamilyFrom, p.retainedInStateYears)
      : undefined;
  const age = ageAtLeast(
    t.contactChildDob,
    t.eventOn ?? day,
    p.contactChildAge,
  );
  const contact = all(
    t.contactRightMustBeInState,
    age === undefined ? undefined : !age,
  );
  const eu = r.nonEuFamily === undefined ? undefined : !r.nonEuFamily;
  const event = eu
    ? true
    : r.nonEuFamily === true
      ? t.event === 'death'
        ? inState
        : t.event === 'dissolution'
          ? all(
              t.sponsorStillInStateAtProceedings,
              any(
                all(qualifyingRelationship, inState),
                t.custodyGranted,
                t.particularlyDifficultCircumstancesConfirmed,
                contact,
              ),
            )
          : false
      : undefined;
  const self =
    t.personalBasis === 'work' || t.personalBasis === 'qualified-family'
      ? t.economicBasisConfirmed
      : t.personalBasis === 'self-support'
        ? all(t.economicBasisConfirmed, t.resourcesAndCsi)
        : undefined;
  return all(
    eu === true ? true : t.determination,
    t.eventOn ? true : undefined,
    t.sponsorHadRightOfResidence,
    event,
    self,
  );
}

function waScope(r: IrelandTreatyResidence) {
  const w = r.wa;
  if (!w) return undefined;
  if (w.recognisedWaScope === false) return false;
  const instant =
    w.relevantStart === undefined ? undefined : Date.parse(w.relevantStart);
  const preTransition =
    instant === undefined || Number.isNaN(instant)
      ? undefined
      : instant < Date.parse(p.transitionEnd);
  return all(
    w.britishOrQualifyingFamily,
    w.recognisedWaScope === true
      ? true
      : r.role === 'citizen'
        ? all(preTransition, w.protectedBeforeAndContinued)
        : r.role === 'family'
          ? all(
              w.protectedBeforeAndContinued,
              w.qualifyingFamilyEventConfirmed,
              w.familyCategory === 'later-child' ||
                w.familyCategory === 'necessary-carer'
                ? true
                : preTransition,
            )
          : undefined,
  );
}

export function treatyResidence(
  a: IrelandAssessment,
  r: IrelandTreatyResidence,
  wa: boolean,
  dob: IsoDate | undefined,
  renewal: boolean,
  renewalInState: boolean | undefined,
) {
  const { add, L, day } = a;
  const d = r.document;
  const acquisition = r.acquisition ?? 'ordinary';
  const holder =
    d?.priorPermanentRightOn && d.priorPermanentRightOn <= day
      ? d.priorPermanentRightOn
      : undefined;
  const activities = treatyActivities(r);
  const ordinary = ordinaryResidence(r, activities, day);
  const early = acquisition === 'early' ? earlyResidence(r, day) : undefined;
  const retained =
    acquisition === 'retained' ? retainedResidence(r, day) : undefined;
  const acquired =
    holder ??
    (acquisition === 'early'
      ? early === true
        ? r.early?.eventOn
        : undefined
      : acquisition !== 'retained' || retained === true
        ? ordinary.acquired
        : undefined);
  const lossYears = wa ? p.waLossYears : p.euLossYears;
  const postGrant = d?.postGrantAbsence;
  const trips = [
    ...(r.absences ?? []),
    ...(postGrant
      ? [{ leftOn: postGrant.from, returnedOn: postGrant.returnedOn }]
      : []),
  ];
  const lastLoss =
    acquired &&
    mergePeriods(
      trips.map(({ leftOn, returnedOn }) => ({
        from: leftOn < acquired ? acquired : leftOn,
        to: returnedOn ? addDays(returnedOn, -1) : undefined,
      })),
      addDays(day, -1),
    )
      .reverse()
      .find(({ from, to }) => addDays(to, 1) > afterYears(from, lossYears));
  const afterLoss = lastLoss ? addDays(lastLoss.to, 1) : undefined;
  const requalified =
    afterLoss && afterLoss < day
      ? ordinaryResidence(r, activities, day, afterLoss).met
      : false;
  const scope = wa
    ? afterLoss
      ? r.wa?.postLossScopeConfirmed
      : waScope(r)
    : holder
      ? true
      : familyStatus({ ...a, day: ordinary.acquired ?? day }, r, dob);
  add(
    wa ? 'E01' : 'D01',
    scope,
    wa
      ? L(
          `适用 Withdrawal Agreement 个人范围，过渡截止 ${p.transitionEnd}。长期离境失权后，须重新确认返爱后的 WA 适用范围。仅凭 Common Travel Area 权利返爱不足以确认（PD-338）。`,
          `Apply the Withdrawal Agreement personal scope and transition cutoff ${p.transitionEnd}. After loss through absence, confirm WA scope for residence since return. Common Travel Area rights alone are insufficient (PD-338).`,
        )
      : L(
          `核对自由流动国籍或家属类别。直系后代未满 ${p.descendantAge} 岁或受扶养；学生、其他家属与回流情形另核（PD-336）。`,
          `Check free-movement nationality or family status. Descendants are under ${p.descendantAge} or dependent. Student, permitted family member and returning citizen cases need separate confirmation (PD-336).`,
        ),
    wa ? ['PD-338'] : ['PD-336'],
  );
  const recorded = activities?.filter((period) => period.from <= day);
  const basis =
    recorded === undefined
      ? undefined
      : recorded.length === 0
        ? false
        : all(...recorded.map((period) => activityMet(period)));
  add(
    'D02',
    basis,
    L(
      `核对合规居留依据。家属按与担保人一起合规居留或保留权利的期间核对。本人核对初期 ${p.initialMonths} 个月的身份及公帑条件、就业、自雇、学生或自足的资源与全面医疗保险。短期工作后的登记失业可保留工作者身份 ${p.retainedWorkerMonths} 个月（PD-336、PD-337）。`,
      `Check the residence basis. Family periods require qualifying residence with the sponsor or a retained right. For citizens, check identity and burden during the first ${p.initialMonths} months, work or self-employment, and resources and comprehensive sickness insurance for students or self-sufficient residents. Registered unemployment after short employment can retain worker status for ${p.retainedWorkerMonths} months (PD-336, PD-337).`,
    ),
    ['PD-336', 'PD-337'],
    false,
  );
  if (acquisition === 'early') {
    add(
      'D04',
      early,
      L(
        `核对退休（住逾 ${p.retirementResidenceYears} 年且此前工作至少 ${p.retirementWorkMonths} 个月）、永久失能（通常住逾 ${p.incapacityResidenceYears} 年）、跨境工作（先居住工作 ${p.frontierYears} 年）或在职死亡的例外。`,
        `Check the early rules for retirement (more than ${p.retirementResidenceYears} years of residence and ${p.retirementWorkMonths} months of prior work), permanent incapacity (normally more than ${p.incapacityResidenceYears} years), frontier work (prior residence and work for ${p.frontierYears} years), or death while working.`,
      ),
      ['PD-336', 'PD-338'],
      !wa && !holder,
    );
  }
  if (acquisition === 'retained') {
    add(
      'D05',
      all(retained, ordinary.met),
      L(
        `核对死亡、离境或关系终止后的权利保留、个人居留依据与连续居住。非欧盟离婚常规看关系满 ${p.retainedRelationYears} 年、其中境内满 ${p.retainedInStateYears} 年，或适用监护、困难及探视替代条件（PD-338）。`,
        `Check retained rights after death, departure or dissolution, a personal basis and continuous residence. The usual non-EU divorce limb requires ${p.retainedRelationYears} years of relationship including ${p.retainedInStateYears} in the State, with custody, hardship or access alternatives (PD-338).`,
      ),
      ['PD-336', 'PD-338'],
      !wa && !holder,
    );
  }
  const ordinaryMet = day < p.euFrom && !wa ? undefined : ordinary.met;
  if (!wa) {
    add(
      'D03',
      holder ? true : ordinaryMet,
      L(
        `按合规居留与出境核对连续 ${p.ordinaryYears} 年。每 ${p.absenceWindowMonths} 个月通常可缺席 ${p.absenceMonths} 个月；一次重要原因最长 ${p.importantAbsenceMonths} 个月，义务兵役另核（PD-337）。`,
        `Check ${p.ordinaryYears} continuous years of lawful residence, normally allowing ${p.absenceMonths} months away per ${p.absenceWindowMonths} months. One important absence can last ${p.importantAbsenceMonths} months. Compulsory military service is considered separately (PD-337).`,
      ),
      ['PD-337'],
      acquisition === 'ordinary',
    );
  }
  const retainsRight = afterLoss ? all(requalified, wa ? scope : true) : true;
  if (wa) {
    add(
      'E02',
      all(
        holder
          ? true
          : acquisition === 'early'
            ? early
            : acquisition === 'retained'
              ? all(retained, ordinary.met)
              : ordinary.met,
        retainsRight,
      ),
      L(
        `合并过渡前 EU 与其后 WA 合规居住；一般需连续 ${p.ordinaryYears} 年。取得后连续离境超过 ${lossYears} 年会丧失权利（PD-337、PD-338）。`,
        `Combine lawful EU and WA residence across transition. The ordinary requirement is ${p.ordinaryYears} continuous years. Absence exceeding ${lossYears} consecutive years after acquisition causes loss (PD-337, PD-338).`,
      ),
      ['PD-337', 'PD-338'],
    );
  }
  const card = d?.currentCardExpiresOn;
  const filing = d?.filedOn;
  const beforeExpiry = !r.nonEuFamily
    ? true
    : !card
      ? undefined
      : filing
        ? filing < card
        : day < card
          ? undefined
          : false;
  const notification =
    r.role === 'citizen' || r.nonEuFamily === false
      ? true
      : all(d?.addressAndStatusNotified, d?.prolongedAbsenceNotified);
  const document = all(
    renewal ? renewalInState : d?.inState,
    d?.identityAndResidenceEvidence,
    renewal ? true : beforeExpiry,
    notification,
  );
  const cleared =
    d?.publicInterest === 'clear'
      ? true
      : d?.publicInterest === 'restricting-order'
        ? false
        : undefined;
  const exam = d?.examRequested ? d.examDone : true;
  if (!wa) {
    add(
      'D06',
      document,
      renewal ? L(
        '按 Stamp 4EUFam 续期清单核对身份、居住材料及适用的住址和离境通知。卡片到期日另按 IRP 续期窗口核对（PD-338）。',
        'Check identity and residence evidence under the Stamp 4EUFam renewal checklist and any required address and absence notices. The IRP renewal window checks the card expiry separately (PD-338).',
      ) : L(
        `EU 本人用 EUTR2，非欧盟家属用 EUTR3。核对现有卡到期、住址及超过 ${p.absenceNoticeMonths} 个月的离境通知（另有 ${p.absenceNoticeDays} 日通知期限）。证件与实体权利分别判断（PD-338）。`,
        `Use EUTR2 for the EU applicant or EUTR3 for non-EU family. Check card expiry, address and notice for absences beyond ${p.absenceNoticeMonths} month(s), due within a further ${p.absenceNoticeDays} days. Document and substantive right are separate (PD-338).`,
      ),
      ['PD-338'],
      renewal,
    );
    add(
      'D07',
      all(cleared, exam),
      L(
        `核对正式限制与公共利益审查。入境 ${p.healthReviewMonths} 个月内若依法要求，才另核公共卫生体检；旧定罪不自动排除。`,
        `Check official restrictions and public interest review. A public health exam is assessed if directed within ${p.healthReviewMonths} months of entry. A past conviction does not automatically disqualify.`,
      ),
      undefined,
      renewal,
    );
    add(
      'D08',
      retainsRight !== true
        ? retainsRight
        : d?.extraFeeRequested
          ? undefined
          : acquired
            ? true
            : undefined,
      L(
        `连续离境超过 ${lossYears} 年可失去永久权，证件通常 ${p.documentYears} 年换发。指定有效证件免登记费，额外收费核官方通知（PD-339）。`,
        `Absence exceeding ${lossYears} consecutive years can end permanent rights. The document usually renews after ${p.documentYears} years. Specified valid documents are exempt from registration fees. Verify any extra charge (PD-339).`,
      ),
      afterLoss ? ['PD-337', 'PD-338', 'PD-339'] : ['PD-339'],
      (afterLoss !== undefined && requalified !== true) ||
        (renewal && d?.extraFeeRequested === true),
    );
  } else {
    add(
      'E03',
      all(document, cleared, exam, d?.extraFeeRequested ? undefined : true),
      renewal ? L(
        '按 Withdrawal Agreement Beneficiary 续期清单核对身份、居住材料和适用的审查。卡片到期日另按 IRP 续期窗口核对（PD-338、PD-339）。',
        'Check identity and residence evidence and any applicable review under the Withdrawal Agreement Beneficiary renewal checklist. The IRP renewal window checks the card expiry separately (PD-338, PD-339).',
      ) : L(
        `按身份选择 EUTR2／EUTR3，核对旧证、材料及公共利益审查；WA 文件费 €${p.waFee}，证件通常 ${p.documentYears} 年续期（PD-338、PD-339）。`,
        `Use EUTR2 or EUTR3 by status. Check the former card, evidence and public interest review. WA documents cost €${p.waFee} and normally renew after ${p.documentYears} years (PD-338, PD-339).`,
      ),
      ['PD-338', 'PD-339'],
      renewal,
    );
  }
  add('TREATY-RESTRICTION', cleared, undefined, undefined, cleared === false);
}
