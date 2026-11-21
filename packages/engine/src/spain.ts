import { spain2026_11 as es } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, monthSpan } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Spain pilot (phase 18, task 63): residencia de larga duración nacional
// (RD 1155/2024 art. 183) and nacionalidad por residencia (Código Civil
// art. 22). Entry permits and arraigo are out of scope.

export const ES_NATIONALITY_ROUTES = [
  'general',
  'refugee',
  'ibero',
  'marriage',
  'one-year',
] as const;
export type EsNationalityRoute = (typeof ES_NATIONALITY_ROUTES)[number];

/** A residence permit, or a study stay (estancia por estudios). */
export interface EsPermit {
  from: IsoDate;
  /** Absent = still valid and renewed on time. */
  to?: IsoDate;
  study?: boolean;
}

/** Left Spain on `departed`, came back on `returned`. */
export interface EsTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface EsRequest {
  simulationDate: IsoDate;
  permits: EsPermit[];
  trips: EsTrip[];
  route: EsNationalityRoute;
  /** Married to a Spanish citizen on this date (route `marriage`). */
  marriedToSpaniard?: IsoDate;
  locale?: Locale;
}

export type EsPathwayId = 'ES-LONG-TERM' | 'ES-NATIONALITY';
export type EsPathway = PilotPathway<EsPathwayId>;
export type EsResult = PilotResult<EsPathwayId>;

const v = es.values;

type Verdict = 'yes' | 'maybe' | 'no';

export function evaluateSpain(req: EsRequest): EsResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const longest = Math.max(...Object.values(v.nationalityYears.value));
  const days = new Days(
    addDays(addYears(sim, -longest), -1),
    addYears(sim, HORIZON_YEARS),
  );
  const flags = () => new Array<boolean>(days.count).fill(false);
  const residence = flags();
  const study = flags();
  for (const permit of req.permits)
    days.mark(permit.study ? study : residence, permit.from, permit.to);
  // Departure and return days are taken as days in Spain (PD-097).
  const away = flags();
  for (const trip of req.trips)
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
  const sums = {
    residence: days.sums((i) => residence[i]),
    withStudy: days.sums((i) => residence[i] || study[i]),
    away: days.sums((i) => away[i]),
  };
  const covered = (s: number[], from: IsoDate, to: IsoDate) =>
    days.total(s, from, to) === daysBetween(from, to) + 1;
  /** Trips with full days abroad inside [from, to]. */
  /** For each day, the first day from it on without a counted permit. */
  const nextGap = (flag: (i: number) => boolean) => {
    const next = new Array<number>(days.count + 1).fill(days.count);
    for (let i = days.count - 1; i >= 0; i--)
      next[i] = flag(i) ? next[i + 1] : i;
    return next;
  };
  const gaps = {
    residence: nextGap((i) => residence[i]),
    withStudy: nextGap((i) => residence[i] || study[i]),
  };
  /**
   * Covered from `from` to the day before `d`, or until a permit that expired
   * at most 3 months before `d` with nothing after it, when the five years
   * were already complete on its last day: applying for long-term residence
   * then extends it (art. 184.2).
   */
  const extended = (s: number[], gap: number[], from: IsoDate, d: IsoDate) => {
    const to = addDays(d, -1);
    const a = days.index(from);
    if (a < 0 || gap[a] > days.index(to)) return covered(s, from, to);
    if (gap[a] === a) return false;
    const end = days.date(gap[a] - 1);
    return (
      days.total(s, addDays(end, 1), to) === 0 &&
      d <= addMonths(end, v.longTermLateMonths.value) &&
      covered(s, addYears(addDays(end, 1), -v.longTermYears.value), end)
    );
  };
  /** Trips under way on any day of [from, to], travel days included. */
  const tripsTouching = (from: IsoDate, to: IsoDate) =>
    req.trips.filter((t) => t.departed <= to && t.returned >= from);
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
    '最早日期假设模拟日之后一直在西班牙（已录入的未来出境除外），没有到期日的许可都按时续期。',
    'Projected dates assume you stay in Spain after the simulation date (apart from trips you entered) and that permits without an end date are renewed on time.',
  );
  const pathways: EsPathway[] = [];

  // ---------- Residencia de larga duración nacional (art. 183) ----------
  {
    const years = v.longTermYears.value;
    const [totalMin, totalMax] = monthSpan(v.totalAbsenceMonths.value);
    const facts = (d: IsoDate) => {
      const from = addYears(d, -years);
      const to = addDays(d, -1);
      const trips = tripsIn(from, to);
      return {
        legal: extended(sums.residence, gaps.residence, from, d),
        withStudy: extended(sums.withStudy, gaps.withStudy, from, d),
        long: trips.filter(
          (t) =>
            t.returned > addMonths(t.departed, v.singleAbsenceMonths.value),
        ),
        absent: days.total(sums.away, from, to),
      };
    };
    const verdict = (d: IsoDate): Verdict => {
      const f = facts(d);
      if (f.long.length || f.absent > totalMax || !f.withStudy) return 'no';
      return f.legal && f.absent <= totalMin ? 'yes' : 'maybe';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const f = facts(sim);
    pathways.push({
      id: 'ES-LONG-TERM',
      title: L(
        '长期居留（residencia de larga duración nacional）',
        'Long-term residence (residencia de larga duración nacional)',
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
            : possible
              ? L(
                  '仅按已录入的居留许可计算，10 年内达不到长期居留的时间条件。',
                  'Counting only the residence permits you entered, you will not meet the time requirements for long-term residence within 10 years.',
                )
              : L(
                  '按现有记录，10 年内达不到长期居留的时间条件。',
                  'With your record you will not meet the time requirements for long-term residence within 10 years.',
                )) +
        (possible && (!earliest || possible < earliest)
          ? L(
              `若把学习停留计入、或出境合计按 10 个月的较宽口径，最早 ${possible}，原文未写明（PD-097、PD-098）。`,
              ` Counting study stays, or reading the 10 months of absence generously, it could be ${possible}; the rules do not say (PD-097, PD-098).`,
            )
          : ''),
      checks: [
        {
          text: L(
            `前 ${years} 年一直持有居留许可（不含学习停留；许可到期后 3 个月内递交的，原许可延长至决定作出）`,
            `A residence permit throughout the past ${years} years (study stays not included; applying within 3 months of expiry extends the permit until the decision)`,
          ),
          met: f.legal ? true : f.withStudy ? undefined : false,
          sources: v.longTermYears.sources,
        },
        {
          text: L(
            `前 ${years} 年没有单次超过 ${v.singleAbsenceMonths.value} 个月的出境`,
            `No absence of more than ${v.singleAbsenceMonths.value} months in the past ${years} years`,
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
          '因工作出境的较宽上限、不可抗力与 NGO 合作者的例外，以及非正常出境（art. 183.2）',
          'The wider limit for absences for work, the exceptions for force majeure and NGO workers, and irregular departures (art. 183.2)',
        ),
        L(
          '直接取得长期居留的其他情形（art. 183.3）、长期居留-欧盟（art. 176，学习停留按一半计入），以及无犯罪记录等材料（art. 184）',
          'Other direct routes to long-term residence (art. 183.3), EU long-term residence (art. 176, where study stays count half), and documents such as criminal records (art. 184)',
        ),
        L(
          '取得后离开欧盟连续 12 个月可被宣告失效（art. 201）',
          'Losing it after 12 months in a row outside the EU (art. 201)',
        ),
      ],
      assumptions: [
        L(
          '5 年从递交日往回数（Código Civil art. 5.1 的"对应日"计法），不含递交当天；出入境当天按在西班牙计（PD-097）。',
          'The 5 years are counted back from the application date to the same date (Código Civil art. 5.1), not including it; departure and return days count as days in Spain (PD-097).',
        ),
        L(
          `单次出境按离境日起 ${v.singleAbsenceMonths.value} 个日历月判断；合计出境没有换算成天数的规定，${totalMin} 天以内算满足、超过 ${totalMax} 天算不满足，其间待确认（PD-097）。学习停留不算合法居留（PD-098）；许可之间有空档即中断（PD-099）。`,
          `A single absence is measured as ${v.singleAbsenceMonths.value} calendar months from the day you left. Total absence has no day count in the rules: up to ${totalMin} days counts as met, over ${totalMax} as not met, and in between it is uncertain (PD-097). Study stays are not legal residence (PD-098); any gap between permits breaks continuity (PD-099).`,
        ),
        projection,
      ],
      pendingDetails: ['PD-097', 'PD-098', 'PD-099'],
    });
  }

  // ---------- Nacionalidad por residencia (art. 22) ----------
  {
    const years = v.nationalityYears.value[req.route];
    const married =
      req.route === 'marriage' && req.marriedToSpaniard
        ? addYears(req.marriedToSpaniard, v.marriageYears.value)
        : undefined;
    // Legal residence through the application day itself (art. 22.3).
    const ok = (d: IsoDate) =>
      covered(sums.residence, addYears(d, -years), d) &&
      (req.route !== 'marriage' || (!!married && d >= married));
    const earliest = firstDate(ok);
    const window = earliest && {
      from: addYears(earliest, -years),
      to: addDays(earliest, -1),
    };
    const absences = window ? tripsTouching(window.from, window.to) : [];
    const absent = window ? days.total(sums.away, window.from, window.to) : 0;
    const unsure = !!earliest && absences.length > 0;
    pathways.push({
      id: 'ES-NATIONALITY',
      title: L(
        '入籍（nacionalidad por residencia）',
        'Citizenship by residence (nacionalidad por residencia)',
      ),
      status: unsure ? 'UNKNOWN' : statusOf(earliest),
      earliestDate: unsure ? undefined : earliest,
      summary:
        (earliest === sim
          ? L(
              `模拟日已有 ${years} 年不间断的居留许可。`,
              `You have held residence permits for ${years} years without a gap on the simulation date.`,
            )
          : earliest
            ? unsure
              ? L(
                  `仅按许可年限计算的候选递交日是 ${earliest}。`,
                  `Counting permit years alone, the candidate application date is ${earliest}.`,
                )
              : L(
                  `合法居留满 ${years} 年的最早递交日是 ${earliest}。`,
                  `The earliest application date with ${years} years of legal residence is ${earliest}.`,
                )
            : L(
                `按现有记录，10 年内达不到 ${years} 年的合法居留。`,
                `With your record you will not reach ${years} years of legal residence within 10 years.`,
              )) +
        (unsure
          ? L(
              `这 ${years} 年里有 ${absences.length} 次出境、合计 ${absent} 天；法律没有规定"连续"允许多少缺席，由审批个案判断（PD-100）。`,
              ` In those ${years} years you have ${absences.length} trips abroad, ${absent} days in all; the law sets no limit on absences for "continuous" residence, so it is decided case by case (PD-100).`,
            )
          : ''),
      checks: [
        {
          text: L(
            `递交前 ${years} 年及递交当天一直持有居留许可（不含学习停留）`,
            `A residence permit throughout the ${years} years before applying and on the application day (study stays not included)`,
          ),
          met: covered(sums.residence, addYears(sim, -years), sim),
          sources: [
            ...v.nationalityYears.sources,
            { srcId: 'SRC-084', locator: 'art. 22.3 (p21)' },
            { srcId: 'SRC-085', locator: 'Adquisición de la nacionalidad' },
          ],
        },
        ...(req.route === 'marriage'
          ? [
              {
                text: married
                  ? L(
                      `与西班牙公民结婚满 ${v.marriageYears.value} 年且未分居（${married}）`,
                      `Married to a Spanish citizen for ${v.marriageYears.value} year and not separated (on ${married})`,
                    )
                  : L(
                      `与西班牙公民结婚满 ${v.marriageYears.value} 年（未填结婚日期）`,
                      `Married to a Spanish citizen for ${v.marriageYears.value} year (no date entered)`,
                    ),
                met: married ? sim >= married : undefined,
                sources: v.marriageYears.sources,
              },
            ]
          : []),
      ],
      notChecked: [
        L(
          'DELE A2 西班牙语与 CCSE 宪法和社会文化考试（RD 1004/2015 art. 6），良好公民品行与社会融入（art. 22.4）',
          'The DELE A2 Spanish and CCSE constitution and culture tests (RD 1004/2015 art. 6), good civic conduct and integration (art. 22.4)',
        ),
        L(
          '中国公民须声明放弃原国籍（art. 23.b），入籍后 3 年只使用原国籍会失去西班牙国籍（art. 25.1.a）',
          'Chinese citizens must declare that they renounce their nationality (art. 23.b), and lose Spanish nationality by using only the former one for 3 years (art. 25.1.a)',
        ),
        L(
          '难民年限从哪天起算、各个 1 年情形的资格本身（art. 22.2）',
          'When the refugee period starts, and eligibility for each of the one-year cases (art. 22.2)',
        ),
      ],
      assumptions: [
        L(
          '年限从递交日往回数到对应日（Código Civil art. 5.1），不含递交当天；只算居留许可，学习停留不算（SRC-085；PD-098）；许可之间有空档即中断（PD-099）。',
          'Years are counted back from the application date to the same date (Código Civil art. 5.1), not including it; only residence permits count, not study stays (SRC-085; PD-098); any gap between permits breaks continuity (PD-099).',
        ),
        projection,
      ],
      pendingDetails: ['PD-098', 'PD-099', ...(unsure ? ['PD-100'] : [])],
    });
  }

  return { policyAsOf: es.asOf, pathways };
}
