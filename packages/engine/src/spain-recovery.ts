import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addMonths, addYears, fullYears } from './dates';
import { textFor } from './rule';
import type { EsFullRequest } from './spain-full';
import {
  all,
  any,
  applicationFee,
  byFilingDeadline,
  check,
  pathway,
  projectFilingDates,
} from './spain-full-common';
import type { Evidence, EsApplicationFee } from './spain-full-common';
import { insuranceCheck } from './spain-residence';
import type { EsHealthCover } from './spain-residence';
import type { IsoDate } from './types';

const v = spainFull2026_11.values;
const rd = (locator: string) => [{ srcId: 'SRC-083', locator }];

export interface EsRecoveryFacts {
  previousStatus?: 'national' | 'eu' | 'neither';
  ground?:
    | 'outside-eu'
    | 'another-eu-status'
    | 'outside-spain'
    | 'voluntary-return'
    | 'expired-card'
    | 'other';
  lossDecision?: 'confirmed' | 'retained' | 'pending';
  // The start of the uninterrupted absence, after the last physical return.
  outsideSpainSince?: IsoDate;
  derivedFromReunification?: boolean;
  birthDate?: IsoDate;
  returnCommitmentFrom?: IsoDate;
  visitsDuringCommitment?: { enteredSpain: IsoDate; leftSpain: IsoDate }[];
  visitsLawful?: boolean;
  place?: 'spain' | 'consulate';
  correctOfficeAndSignedForm?: boolean;
  lawfulStay?: boolean;
  noEntryAlert?: boolean;
  recognizedTravelDocument?: boolean;
  passportExpires?: IsoDate;
  subjectToCriminalRecordRequirement?: boolean;
  clearRecordsInAllCountries?: boolean;
  publicOrderAndSecurityCleared?: boolean;
  publicHealthCleared?: boolean;
  consularRequirementsConflict?: boolean;
  regularResourcesDocumented?: boolean;
  resourcesAcceptedAsSufficient?: boolean;
  insurance?: EsHealthCover;
  fee?: EsApplicationFee;
  consularVisa?:
    'issued-and-paid' | 'confirmed-exempt' | 'refused' | 'unconfirmed';
  lawfulEntry?: IsoDate;
  grantNotification?: IsoDate;
  cardApplied?: IsoDate;
  officeHolidays?: IsoDate[];
}

function recoveryApplication(
  req: EsFullRequest,
  kind: 'R-N' | 'R-E',
): CountryPathway {
  const L = textFor(req),
    f = req.recovery ?? {},
    d = req.simulationDate;
  const eu = kind === 'R-E';
  const loss = v.statusLoss.value;
  const prior =
    f.previousStatus === undefined
      ? undefined
      : f.previousStatus === (eu ? 'eu' : 'national');
  let ground: Evidence;
  switch (f.ground) {
    case 'outside-eu':
    case 'another-eu-status':
      ground =
        f.lossDecision === 'confirmed'
          ? true
          : f.lossDecision === 'retained'
            ? false
            : undefined;
      break;
    case 'voluntary-return':
      ground = !eu;
      break;
    case 'outside-spain': {
      if (!eu || f.lossDecision === 'retained') {
        ground = false;
        break;
      }
      const anniversary =
        f.outsideSpainSince && addYears(f.outsideSpainSince, loss.spainYears);
      ground =
        anniversary === undefined || d === anniversary
          ? undefined
          : d < anniversary
            ? false
            : f.lossDecision === 'confirmed'
              ? true
              : undefined;
      break;
    }
    case 'expired-card':
    case 'other':
      ground = false;
      break;
  }
  const checks: CountryCheck[] = [
    check(
      L,
      'ES-R01',
      '曾持相应西班牙长居，具备法定恢复理由；卡片到期可换卡。失效与恢复可同办。',
      'Previous Spanish status of this type and a statutory ground for recovery. An expired card can be renewed. Loss and recovery can be decided together.',
      all(prior, ground),
      rd('arts. 186.1, 188.1, 201.1.c–d, 201.2'),
      ['PD-295'],
    ),
    check(
      L,
      'ES-R02',
      '核对原身份是否独立取得；仅国内恢复允许申请时仍未成年的派生团聚家属。',
      'Check whether status was independently obtained. A formerly regrouped dependant can use national recovery while still a minor.',
      any(
        f.derivedFromReunification === undefined
          ? undefined
          : !f.derivedFromReunification,
        !eu &&
          (f.birthDate
            ? fullYears(f.birthDate, d) < v.residenceMajorityAge.value
            : undefined),
      ),
      rd('arts. 186.2, 188.2'),
    ),
  ];
  if (!eu && f.ground === 'voluntary-return') {
    const { years, visitMonths } = v.returnCommitment.value;
    // Only visits before the end of the undertaking can breach it.
    const end =
      f.returnCommitmentFrom && addYears(f.returnCommitmentFrom, years);
    const visits =
      end &&
      f.returnCommitmentFrom &&
      f.visitsDuringCommitment?.filter(
        (t) => t.leftSpain >= f.returnCommitmentFrom! && t.enteredSpain < end,
      );
    checks.push(
      check(
        L,
        'ES-R03',
        `禁返承诺已满 ${years} 年，承诺期间访西每次最多 ${visitMonths} 个月，且无非法逾期。`,
        `The ${years}-year voluntary return undertaking is complete, with lawful visits of at most ${visitMonths} months each.`,
        all(
          end ? d >= end : undefined,
          Array.isArray(visits)
            ? visits.every(
                (t) =>
                  (t.leftSpain < end! ? t.leftSpain : end!) <=
                  addMonths(t.enteredSpain, visitMonths),
              )
            : undefined,
          Array.isArray(visits) && !visits.length ? true : f.visitsLawful,
        ),
        v.returnCommitment.sources,
      ),
    );
  }
  const passport = v.recoveryPassportYears.value;
  const years = v.criminalRecordYears.value;
  checks.push(
    check(
      L,
      'ES-R04',
      `本人向辖区机关签署 EX-11，核实在西合法状态、无拒入标记、获认可的护照余期满 ${passport} 年，适用刑责者过去 ${years} 年各居住国记录合规。`,
      `File a signed EX-11 with the competent office. Confirm lawful status in Spain, no entry alert, a recognised passport valid for ${passport} year and, where required, clear records from all countries of residence over the previous ${years} years.`,
      all(
        f.place === undefined ? undefined : true,
        f.correctOfficeAndSignedForm,
        f.place === 'consulate' ? true : f.lawfulStay,
        f.noEntryAlert,
        f.recognizedTravelDocument,
        f.passportExpires
          ? f.passportExpires >= addYears(d, passport)
          : undefined,
        any(
          f.subjectToCriminalRecordRequirement === undefined
            ? undefined
            : !f.subjectToCriminalRecordRequirement,
          f.clearRecordsInAllCountries,
        ),
        f.consularRequirementsConflict && f.place === 'consulate'
          ? undefined
          : true,
      ),
      rd('arts. 38.a–e, 187.1–2, 189.1–3'),
      ['PD-296'],
    ),
  );
  checks.push(
    check(
      L,
      'ES-R05',
      eu
        ? '机关确认公共秩序、安全及公共健康审查结果。'
        : '机关根据刑事及警方报告确认公共秩序及安全审查结果。',
      eu
        ? 'The authority has cleared public order, security and public health.'
        : 'The authority has assessed public order and security after obtaining criminal and police reports.',
      all(f.publicOrderAndSecurityCleared, eu ? f.publicHealthCleared : true),
      rd('arts. 187.4, 189.4–5'),
      ['PD-283', 'PD-296'],
    ),
  );
  if (eu) {
    checks.push(
      check(
        L,
        'ES-R06',
        '有固定且定期的资源，机关已确认足以维持本人和家属生活。恢复条款没有统一数额。',
        'Document fixed, regular means accepted as sufficient for the applicant and family. The recovery provision sets no numerical threshold.',
        all(f.regularResourcesDocumented, f.resourcesAcceptedAsSufficient),
        [
          ...rd('art. 187.3.a'),
          { srcId: 'SRC-333', locator: 'Hoja 54, Requisitos' },
        ],
        ['PD-286'],
      ),
    );
    checks.push(insuranceCheck(req, f.insurance, 'ES-R07'));
  }
  const info = [applicationFee(L, 'ES-R08', f.fee, d, true)];
  if (f.place === 'consulate')
    info.push(
      check(
        L,
        'ES-R08-visa',
        '境外获批后，核领馆的签证费或已确认的免签依据，并确认合法入境。',
        'After a grant abroad, verify the consular visa and fee or a confirmed exemption, and lawful entry.',
        all(
          f.consularVisa === undefined || f.consularVisa === 'unconfirmed'
            ? undefined
            : f.consularVisa !== 'refused',
          f.lawfulEntry ? f.lawfulEntry <= d : undefined,
        ),
        [
          ...rd('arts. 38.h, 187.2, 189.2'),
          { srcId: 'SRC-347', locator: 'arts. 6–7, 18–19' },
          {
            srcId: 'SRC-333',
            locator: 'Hoja 53/54; Hanoi §5 (previous regulation)',
          },
        ],
        ['PD-296'],
      ),
    );
  const trigger =
    f.place === 'spain'
      ? f.grantNotification
      : f.place === 'consulate'
        ? f.lawfulEntry
        : undefined;
  info.push(
    check(
      L,
      'ES-R09',
      `获批通知或合法入境后 ${v.firstCardMonths.value} 个月内本人申卡，有效 ${v.initialCardYears.value} 年。决定期 ${v.recoveryDecisionMonths.value} 个月，默示批准需核官方起算、暂停与证明。`,
      `Apply in person within ${v.firstCardMonths.value} month of notification or lawful entry for a ${v.initialCardYears.value}-year card. Confirm the official start, suspensions and evidence before relying on tacit approval after ${v.recoveryDecisionMonths.value} months.`,
      trigger && f.cardApplied
        ? all(
            trigger <= f.cardApplied,
            f.cardApplied <= d,
            byFilingDeadline(
              f.cardApplied,
              addMonths(trigger, v.firstCardMonths.value),
              f.officeHolidays,
            ),
          )
        : undefined,
      [
        ...rd('arts. 187.5–7, 189.6–8'),
        { srcId: 'SRC-090', locator: 'art. 30.4–6' },
      ],
      ['PD-099'],
    ),
  );
  return pathway(
    'ES-' + kind,
    eu
      ? L('恢复欧盟长期居留', 'Recovery of EU long-term residence')
      : L('恢复国内长期居留', 'Recovery of national long-term residence'),
    checks,
    info,
  );
}

export function recoveryPath(
  req: EsFullRequest,
  kind: 'R-E' | 'R-N',
): CountryPathway {
  const today = recoveryApplication(req, kind);
  const f = req.recovery;
  const dates: (IsoDate | undefined)[] = [];
  if (
    kind === 'R-N' &&
    f?.ground === 'voluntary-return' &&
    f.returnCommitmentFrom
  )
    dates.push(
      addYears(f.returnCommitmentFrom, v.returnCommitment.value.years),
    );
  if (kind === 'R-E') {
    dates.push(f?.insurance?.validFrom);
    // The sixth anniversary itself needs an authority finding (PD-295).
    if (f?.ground === 'outside-spain' && f.outsideSpainSince)
      dates.push(addYears(f.outsideSpainSince, v.statusLoss.value.spainYears));
  }
  return projectFilingDates(
    today,
    req.simulationDate,
    dates,
    (simulationDate) => recoveryApplication({ ...req, simulationDate }, kind),
    req.locale,
  );
}

export interface EsLongTermCardFacts {
  officeHolidays?: IsoDate[];
  operation?: 'first' | 'renew';
  triggerDate?: IsoDate;
  expiry?: IsoDate;
  applied?: IsoDate;
  validIdAndPhoto?: boolean;
  cardFeePaid?: number;
  publicWard?: boolean;
  nationalConditionsRetained?: boolean;
  // Used for the validity of the next card.
  birthDate?: IsoDate;
  validityConfirmedAtAgeBoundary?: boolean;
  decision?: 'lost' | 'held' | 'pending';
  otherLossGround?: boolean;
  /** Actual uninterrupted absences since obtaining status; returns split periods. */
  absences?: {
    departed: IsoDate;
    returned?: IsoDate;
    area: 'outside-eu' | 'outside-spain';
  }[];
  /** Additional continuous periods outside Spain, including travel within the EU. */
  outsideSpainPeriods?: { departed: IsoDate; returned?: IsoDate }[];
  formerBlueCardOrQualifyingFamily?: boolean;
  qualifyingCooperation?: boolean;
  shortReturnDisputed?: boolean;
}

export function longTermDocuments(
  req: EsFullRequest,
  kind: 'L' | 'E' | 'M',
): CountryCheck[] {
  const L = textFor(req),
    f = req.longTermCard ?? {},
    d = req.simulationDate;
  const renewal = v.tieRenewal.value;
  const age =
    f.birthDate && f.applied ? fullYears(f.birthDate, f.applied) : undefined;
  const validity =
    f.operation === 'first'
      ? v.initialCardYears.value
      : age === undefined ||
          (f.birthDate &&
            f.applied === addYears(f.birthDate, renewal.age) &&
            !f.validityConfirmedAtAgeBoundary)
        ? undefined
        : age < renewal.age
          ? v.initialCardYears.value
          : renewal.olderYears;
  const inWindow =
    f.operation === 'renew' && f.expiry && f.applied
      ? all(
          f.applied >= addMonths(f.expiry, -renewal.earlyMonths),
          byFilingDeadline(
            f.applied,
            addMonths(f.expiry, renewal.lateMonths),
            f.officeHolidays,
          ),
        )
      : f.operation === 'first' && f.triggerDate && f.applied
        ? all(
            f.applied >= f.triggerDate,
            byFilingDeadline(
              f.applied,
              addMonths(f.triggerDate, v.firstCardMonths.value),
              f.officeHolidays,
            ),
          )
        : undefined;
  const due =
    f.publicWard === true ? v.publicWardCardFeeEur.value : v.tieFeeEur.value;
  const card = check(
    L,
    'ES-T01',
    `长居 TIE：首次生效后 ${v.firstCardMonths.value} 个月内申请，换卡在到期前 ${renewal.earlyMonths} 至到期后 ${renewal.lateMonths} 个月，核对证件、照片、卡费（通常 €${v.tieFeeEur.value}）。卡有效期 ${validity ?? '待核'} 年；过期本身不终止许可。`,
    `Long-term TIE: first application within ${v.firstCardMonths.value} month, renewal from ${renewal.earlyMonths} months before to ${renewal.lateMonths} months after expiry. Verify ID, photograph and card fee (usually €${v.tieFeeEur.value}). Card validity: ${validity ?? 'unconfirmed'} years. Card expiry alone does not extinguish residence.`,
    all(
      inWindow,
      f.applied ? f.applied <= d : undefined,
      f.validIdAndPhoto,
      (f.applied ?? d) < v.feeScheduleFrom.value || f.cardFeePaid === undefined
        ? undefined
        : f.cardFeePaid === due ||
            (f.publicWard === undefined && f.cardFeePaid === 0
              ? undefined
              : false),
      f.operation === 'renew' && kind === 'L'
        ? f.nationalConditionsRetained
        : true,
      validity === undefined ? undefined : true,
    ),
    [
      ...rd('arts. 177.7, 178, 179.7, 184.7, 185'),
      ...v.tieFeeEur.sources,
      ...v.publicWardCardFeeEur.sources,
      { srcId: 'SRC-090', locator: 'art. 30.4–6' },
    ],
    ['PD-294', 'PD-099'],
  );
  const loss = v.statusLoss.value;
  const months =
    kind === 'E' && f.formerBlueCardOrQualifyingFamily
      ? loss.blueMonths
      : loss.euMonths;
  // Overlapping intervals describe the same absence. A documented physical
  // return between EU absences interrupts continuity, even on the same day.
  function reaches(
    periods: { departed: IsoDate; returned?: IsoDate }[] | undefined,
    limit: number,
  ) {
    if (!periods) return undefined;
    let start: IsoDate | undefined, through: IsoDate | undefined;
    for (const trip of [...periods].sort((a, b) =>
      a.departed.localeCompare(b.departed),
    )) {
      if (trip.departed > d) continue;
      const end = trip.returned && trip.returned < d ? trip.returned : d;
      if (!through || trip.departed >= through) start = trip.departed;
      through = through && through > end ? through : end;
      if (start && through >= addMonths(start, limit)) return true;
    }
    return false;
  }
  const euRisk = reaches(
    f.absences?.filter((t) => t.area === 'outside-eu'),
    months,
  );
  const spanishRisk =
    kind === 'E' &&
    reaches(
      f.absences || f.outsideSpainPeriods
        ? [...(f.absences ?? []), ...(f.outsideSpainPeriods ?? [])]
        : undefined,
      loss.spainYears * 12,
    );
  const referred = any(
    f.otherLossGround,
    f.qualifyingCooperation === true ? false : euRisk,
    spanishRisk,
  );
  const held =
    f.decision === 'lost'
      ? false
      : f.decision === 'held'
        ? true
        : f.decision === 'pending' ||
            referred !== false ||
            f.shortReturnDisputed
          ? undefined
          : true;
  const status = check(
    L,
    'ES-T02',
    `维持身份：境外连续期间从实际返回重新起算；离开欧盟 ${loss.euMonths} 个月（蓝卡特例 ${loss.blueMonths}）、欧盟长居离西 ${loss.spainYears} 年，或欺诈、驱逐、另一国欧盟长居、保护撤销、法定终审罪名须核实。机关听取陈述至少 ${loss.hearingDays} 日，一般 ${loss.decisionMonths} 个月内决定。`,
    `Retention: actual returns interrupt continuous absences. Check ${loss.euMonths} months outside the EU (${loss.blueMonths} for qualifying former Blue Card families), ${loss.spainYears} years outside Spain for EU status, fraud, expulsion, another EU long-term status, revoked protection or specified convictions. The authority allows at least ${loss.hearingDays} days to respond and normally decides within ${loss.decisionMonths} months.`,
    held,
    [
      ...v.statusLoss.sources,
      { srcId: 'SRC-348', locator: 'C-432/20, p1' },
      { srcId: 'SRC-320', locator: 'art. 32.5' },
    ],
    ['PD-295'],
  );
  return [card, status];
}
