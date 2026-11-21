import { greece2026_11 as gr } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, monthSpan } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Greece pilot (phase 18, task 64): long-term residence (Μ1, Migration Code
// art. 144), golden visa (Β.5) renewal, and naturalisation (Citizenship Code
// art. 5). Investment thresholds and the naturalisation exam are out of scope.

/**
 * regular: work, family and other ordinary permits; investor: golden visa
 * (Β.5); study: study or training; temporary: national visa stays (Ζ).
 */
export const GR_PERMIT_KINDS = [
  'regular',
  'investor',
  'study',
  'temporary',
] as const;
export type GrPermitKind = (typeof GR_PERMIT_KINDS)[number];

export const GR_NATIONALITY_ROUTES = [
  'general',
  'three-year',
  'twelve-year',
] as const;
export type GrNationalityRoute = (typeof GR_NATIONALITY_ROUTES)[number];

export interface GrPermit {
  kind: GrPermitKind;
  from: IsoDate;
  /** Last day of validity; absent = renewed on time. */
  to?: IsoDate;
}

/** Left Greece on `departed`, came back on `returned`. */
export interface GrTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface GrRequest {
  simulationDate: IsoDate;
  dateOfBirth: IsoDate;
  permits: GrPermit[];
  trips: GrTrip[];
  route: GrNationalityRoute;
  locale?: Locale;
}

export type GrPathwayId = 'GR-LONG-TERM' | 'GR-GOLDEN-VISA' | 'GR-NATIONALITY';
export type GrPathway = PilotPathway<GrPathwayId>;
export type GrResult = PilotResult<GrPathwayId>;

const v = gr.values;
type Verdict = 'yes' | 'maybe' | 'no';

export function evaluateGreece(req: GrRequest): GrResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const longest = Math.max(...Object.values(v.nationalityYears.value));
  const days = new Days(
    addDays(addYears(sim, -longest), -1),
    addYears(sim, HORIZON_YEARS),
  );
  const flags = () => new Array<boolean>(days.count).fill(false);
  const byKind = Object.fromEntries(
    GR_PERMIT_KINDS.map((k) => [k, flags()]),
  ) as Record<GrPermitKind, boolean[]>;
  for (const permit of req.permits)
    days.mark(byKind[permit.kind], permit.from, permit.to);
  // Departure and return days are taken as days in Greece (PD-102).
  const away = flags();
  for (const trip of req.trips)
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
  const held = (kinds: GrPermitKind[]) =>
    days.sums((i) => kinds.some((k) => byKind[k][i]));
  const sums = {
    regular: held(['regular']),
    regularInvestor: held(['regular', 'investor']),
    any: held([...GR_PERMIT_KINDS]),
    away: days.sums((i) => away[i]),
  };
  const covered = (s: number[], from: IsoDate, to: IsoDate) =>
    days.total(s, from, to) === daysBetween(from, to) + 1;
  const tripsIn = (from: IsoDate, to: IsoDate) =>
    req.trips.filter(
      (t) => addDays(t.departed, 1) <= to && addDays(t.returned, -1) >= from,
    );

  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  const statusOf = (earliest?: IsoDate): PilotStatus =>
    !earliest ? 'NOT_MET' : earliest === sim ? 'MET' : 'FUTURE';
  const projection = L(
    '最早日期假设模拟日之后一直在希腊（已录入的未来出境除外），没有到期日的许可都按时续期。',
    'Projected dates assume you stay in Greece after the simulation date (apart from trips you entered) and that permits without an end date are renewed on time.',
  );
  const hasInvestor = req.permits.some((p) => p.kind === 'investor');
  const pathways: GrPathway[] = [];

  // ---------- Long-term residence Μ1 (art. 144) ----------
  {
    const years = v.longTermYears.value;
    const [totalMin, totalMax] = monthSpan(v.totalAbsenceMonths.value);
    const facts = (d: IsoDate) => {
      const from = addYears(d, -years);
      const to = addDays(d, -1);
      return {
        regular: covered(sums.regular, from, to),
        any: covered(sums.any, from, to),
        long: tripsIn(from, to).filter(
          (t) =>
            t.returned > addMonths(t.departed, v.singleAbsenceMonths.value),
        ),
        absent: days.total(sums.away, from, to),
      };
    };
    const verdict = (d: IsoDate): Verdict => {
      const f = facts(d);
      if (f.long.length || f.absent > totalMax || !f.any) return 'no';
      return f.regular && f.absent <= totalMin ? 'yes' : 'maybe';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const f = facts(sim);
    pathways.push({
      id: 'GR-LONG-TERM',
      title: L(
        '长期居留（άδεια επί μακρόν διαμένοντος，Μ1）',
        'Long-term residence (άδεια επί μακρόν διαμένοντος, Μ1)',
      ),
      // Only uncertain readings reach a date: unknown, not unmet.
      status: !earliest && possible ? 'UNKNOWN' : statusOf(earliest),
      earliestDate: earliest,
      summary:
        (earliest === sim
          ? L(
              '模拟日已满足长期居留的时间条件。',
              'You meet the time requirements for long-term residence on the simulation date.',
            )
          : earliest
            ? L(
                `满足长期居留时间条件的最早递交日是 ${earliest}。`,
                `The earliest application date that meets the time requirements for long-term residence is ${earliest}.`,
              )
            : L(
                '按现有记录，10 年内达不到长期居留的时间条件。',
                'With your record you will not meet the time requirements for long-term residence within 10 years.',
              )) +
        (possible && (!earliest || possible < earliest)
          ? L(
              `若把黄金签证、学习或国家签证期间计入，或出境合计按 10 个月的较宽口径，最早 ${possible}，原文未写明（PD-101～103）。`,
              ` Counting golden visa, study or national visa periods, or reading the 10 months of absence generously, it could be ${possible}; the rules do not say (PD-101 to PD-103).`,
            )
          : ''),
      checks: [
        {
          text: L(
            `前 ${years} 年一直持有普通居留许可（黄金签证、学习、国家签证期间待确认）`,
            `An ordinary residence permit throughout the past ${years} years (golden visa, study and national visa periods uncertain)`,
          ),
          met: f.regular ? true : f.any ? undefined : false,
          sources: [
            ...v.longTermYears.sources,
            { srcId: 'SRC-086', locator: 'άρθ. 143 παρ. 2 (p91)' },
          ],
        },
        {
          text: L(
            `前 ${years} 年每次出境都短于 ${v.singleAbsenceMonths.value} 个月`,
            `Every absence in the past ${years} years shorter than ${v.singleAbsenceMonths.value} months`,
          ),
          met: f.long.length === 0,
          sources: v.singleAbsenceMonths.sources,
        },
        {
          text: L(
            `前 ${years} 年出境合计 ${f.absent} 天（不超过 ${v.totalAbsenceMonths.value} 个月，即 ${totalMin}–${totalMax} 天以内）`,
            `${f.absent} days abroad in the past ${years} years (${v.totalAbsenceMonths.value} months at most, ${totalMin}–${totalMax} days)`,
          ),
          met:
            f.absent <= totalMin
              ? true
              : f.absent > totalMax
                ? false
                : undefined,
          sources: v.totalAbsenceMonths.sources,
        },
      ],
      notChecked: [
        L(
          '收入、医疗保险、社会融入（希腊语或连续 12 年居留等）与公共秩序（άρθ. 144 παρ. 1 α–γ，άρθ. 147、160）',
          'Income, health insurance, integration (Greek language, 12 years of residence and so on) and public order (άρθ. 144 παρ. 1 α–γ, άρθ. 147, 160)',
        ),
        L(
          '国际保护期间的计入（άρθ. 144 παρ. 2），以及取得后离开欧盟 12 个月或离开希腊超过 6 年会失去身份（άρθ. 148）',
          'How international protection periods count (άρθ. 144 παρ. 2), and losing the status after 12 months outside the EU or more than 6 years outside Greece (άρθ. 148)',
        ),
      ],
      assumptions: [
        L(
          '5 年从递交日往回数，不含递交当天；出入境当天按在希腊计；单次出境按离境日起的日历月判断，合计出境没有换算成天数的规定（PD-102）。',
          'The 5 years are counted back from the application date, not including it; departure and return days count as days in Greece; a single absence is measured in calendar months from the day you left, and total absence has no day count in the rules (PD-102).',
        ),
        L(
          '只有普通居留许可算满足；黄金签证期间能否计入法条未排除也未确认（PD-101），学习期间按一半计但没有换算方法（PD-103），国家签证可能属于不计的临时居留（PD-101）。许可之间有空档即中断（PD-107）。',
          'Only ordinary permits count as met; whether golden visa time counts is neither excluded nor confirmed (PD-101), study counts half with no method given (PD-103), and national visa stays may be excluded temporary residence (PD-101). Any gap between permits breaks continuity (PD-107).',
        ),
        projection,
      ],
      pendingDetails: ['PD-101', 'PD-102', 'PD-103', 'PD-107'],
    });
  }

  // ---------- Golden visa Β.5 renewal (art. 100, art. 11) ----------
  {
    const title = L('黄金签证（Β.5）续期', 'Golden visa (Β.5) renewal');
    const current = req.permits
      .filter((p) => p.kind === 'investor')
      .sort((a, b) => (a.from < b.from ? 1 : -1))[0];
    if (!current) {
      pathways.push({
        id: 'GR-GOLDEN-VISA',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '记录中没有黄金签证（投资者许可）。',
          'Your record has no golden visa (investor permit).',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else if (!current.to) {
      pathways.push({
        id: 'GR-GOLDEN-VISA',
        title,
        status: 'UNKNOWN',
        summary: L(
          '请填写当前黄金签证许可卡上的到期日，才能算出续期时间。',
          'Enter the expiry date on your current golden visa permit to work out the renewal dates.',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else {
      const expiry = current.to;
      const opens = addMonths(expiry, -v.renewalWindowMonths.value);
      const lateUntil = addMonths(expiry, v.lateRenewalMonths.value);
      const status: PilotStatus =
        sim < opens ? 'FUTURE' : sim <= expiry ? 'MET' : 'NOT_MET';
      pathways.push({
        id: 'GR-GOLDEN-VISA',
        title,
        status,
        earliestDate:
          status === 'FUTURE' ? opens : status === 'MET' ? sim : undefined,
        summary:
          (status === 'NOT_MET'
            ? sim <= lateUntil
              ? L(
                  `许可已于 ${expiry} 到期；${lateUntil} 前仍可逾期递交续期，每逾期一个月罚款 ${v.lateFinePerMonthEur.value} 欧元。`,
                  `The permit expired on ${expiry}; you can still apply late until ${lateUntil}, with a fine of ${v.lateFinePerMonthEur.value} euros for each month late.`,
                )
              : L(
                  `许可已于 ${expiry} 到期，逾期递交的期限（${lateUntil}）也已过，除不可抗力外不再受理续期。`,
                  `The permit expired on ${expiry} and the late application period (to ${lateUntil}) has passed; renewal is no longer accepted except for force majeure.`,
                )
            : L(
                `续期申请在 ${opens} 至 ${expiry} 之间递交；逾期最迟到 ${lateUntil}，每月罚款 ${v.lateFinePerMonthEur.value} 欧元。`,
                `Apply to renew from ${opens} to ${expiry}; late applications are accepted until ${lateUntil} with a fine of ${v.lateFinePerMonthEur.value} euros a month.`,
              )) +
          L(
            `续期后的许可同样 ${v.goldenVisaYears.value} 年，须仍持有该房产；在境外的时间不影响续期。`,
            ` A renewed permit also lasts ${v.goldenVisaYears.value} years as long as you still own the property; time abroad does not prevent renewal.`,
          ),
        checks: [
          {
            text: L(
              `在续期期间内（${opens} 至 ${expiry}）`,
              `Within the renewal period (${opens} to ${expiry})`,
            ),
            met: status === 'MET',
            sources: [
              ...v.renewalWindowMonths.sources,
              ...v.goldenVisaYears.sources,
            ],
          },
        ],
        notChecked: [
          L(
            '投资金额门槛与房产是否仍符合条件（άρθ. 100 παρ. 2、4），家属许可与子女满 21 岁后的单独许可（άρθ. 95 παρ. 2）',
            'The investment threshold and whether the property still qualifies (άρθ. 100 παρ. 2, 4), and family members’ permits, including children after 21 (άρθ. 95 παρ. 2)',
          ),
        ],
        assumptions: [
          L(
            '"到期前 2 个月""到期后 3 个月"按日历月计；续期后的新许可从哪天起算法条没写，以新许可卡为准（PD-104）。',
            '"2 months before" and "3 months after" expiry are calendar months; when a renewed permit starts is not stated, so go by the new permit (PD-104).',
          ),
        ],
        pendingDetails: ['PD-104'],
      });
    }
  }

  // ---------- Naturalisation (Citizenship Code art. 5) ----------
  {
    const years = v.nationalityYears.value[req.route];
    const verdict = (d: IsoDate): Verdict => {
      const from = addYears(d, -years);
      const to = addDays(d, -1);
      if (covered(sums.regularInvestor, from, to)) return 'yes';
      return covered(sums.any, from, to) ? 'maybe' : 'no';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const window = earliest && {
      from: addYears(earliest, -years),
      to: addDays(earliest, -1),
    };
    const absences = window ? tripsIn(window.from, window.to) : [];
    const absent = window ? days.total(sums.away, window.from, window.to) : 0;
    const unsure = !!earliest && absences.length > 0;
    pathways.push({
      id: 'GR-NATIONALITY',
      title: L('入籍（πολιτογράφηση）', 'Naturalisation (πολιτογράφηση)'),
      status:
        unsure || (!earliest && possible) ? 'UNKNOWN' : statusOf(earliest),
      earliestDate: unsure ? undefined : earliest,
      summary:
        (earliest === sim
          ? L(
              `模拟日已有 ${years} 年连续的合法居留。`,
              `You have ${years} years of continuous legal residence on the simulation date.`,
            )
          : earliest
            ? L(
                `合法居留满 ${years} 年的最早递交日是 ${earliest}。`,
                `The earliest application date with ${years} years of legal residence is ${earliest}.`,
              )
            : L(
                `按现有记录，10 年内达不到 ${years} 年的合法居留。`,
                `With your record you will not reach ${years} years of legal residence within 10 years.`,
              )) +
        (unsure
          ? L(
              `这 ${years} 年里有 ${absences.length} 次出境、合计 ${absent} 天；法律没有规定"连续"允许多少缺席，由审批个案判断（PD-106）。`,
              ` In those ${years} years you have ${absences.length} trips abroad, ${absent} days in all; the law sets no limit on absences for "continuous" residence, so it is decided case by case (PD-106).`,
            )
          : '') +
        (possible && (!earliest || possible < earliest)
          ? L(
              `若学习或国家签证期间也算合法居留，最早 ${possible}，原文未写明（PD-103）。`,
              ` If study or national visa periods also count as legal residence, it could be ${possible}; the rules do not say (PD-103).`,
            )
          : ''),
      checks: [
        {
          text: L(
            `递交前 ${years} 年一直持有居留许可（普通许可或黄金签证）`,
            `A residence permit throughout the ${years} years before applying (ordinary or golden visa)`,
          ),
          met:
            verdict(sim) === 'yes'
              ? true
              : verdict(sim) === 'maybe'
                ? undefined
                : false,
          sources: [
            ...v.nationalityYears.sources,
            {
              srcId: 'SRC-089',
              locator: 'Προϋποθέσεις πολιτογράφησης (p1–p2)',
            },
          ],
        },
      ],
      notChecked: [
        L(
          '递交时已成年，且持有法定清单内的居留身份（άρθ. 5 παρ. 1 α、ε）；希腊语与历史知识证书（Π.Ε.Γ.Π.）、经济与社会融入、公共秩序（άρθ. 5Α、5Β）',
          'Being an adult and holding a residence status on the legal list when applying (άρθ. 5 παρ. 1 α, ε); the Greek language and history certificate (Π.Ε.Γ.Π.), economic and social integration, and public order (άρθ. 5Α, 5Β)',
        ),
        L(
          '3 年类别（欧盟公民、与希腊人结婚并有子女、在希腊出生的希腊籍子女的父母、无国籍人）与 12 年类别的资格本身',
          'Eligibility for the 3-year categories (EU citizens, spouses of Greeks with children, parents of Greek children born in Greece, stateless people) and the 12-year route',
        ),
      ],
      assumptions: [
        L(
          '年限从递交日往回数，不含递交当天。黄金签证期间按内政部指引计为认可的居留身份，法条只点名旧法许可（PD-105）；许可之间有空档即中断（PD-107）。',
          'Years are counted back from the application date, not including it. Golden visa time counts as a recognised status under Ministry of Interior guidance, though the law names only permits under the old law (PD-105); any gap between permits breaks continuity (PD-107).',
        ),
        projection,
      ],
      pendingDetails: [
        ...(hasInvestor ? ['PD-105'] : []),
        'PD-107',
        ...(unsure ? ['PD-106'] : []),
        ...(possible && (!earliest || possible < earliest) ? ['PD-103'] : []),
      ],
    });
  }

  return { policyAsOf: gr.asOf, pathways };
}
