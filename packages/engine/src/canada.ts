import { canada2026_11 as ca } from '@uk-immigration/policy-data';
import { addDays, addYears, fullYears } from './dates';
import { Days, HORIZON_YEARS, afterYears } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Canada pilot (phase 18, task 61): the permanent resident residency
// obligation (IRPA s28) and citizenship physical presence (Citizenship Act
// s5(1)(c)(i), s5(1.001)). Express Entry and other selection is out of scope.

/** In Canada as a temporary resident or protected person before PR. */
export interface CaPeriod {
  from: IsoDate;
  /** Absent = until the day before you became a permanent resident. */
  to?: IsoDate;
}

/** Left Canada on `departed`, came back on `returned`. */
export interface CaTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface CaRequest {
  simulationDate: IsoDate;
  dateOfBirth: IsoDate;
  /** The day you became a permanent resident. */
  permanentResident: IsoDate;
  temporaryPeriods: CaPeriod[];
  trips: CaTrip[];
  locale?: Locale;
}

export type CaPathwayId = 'CA-RESIDENCY' | 'CA-CITIZENSHIP';
export type CaPathway = PilotPathway<CaPathwayId>;
export type CaResult = PilotResult<CaPathwayId>;

const v = ca.values;

export function evaluateCanada(req: CaRequest): CaResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const pr = req.permanentResident;
  const days = new Days(
    addDays(addYears(sim, -v.citizenshipWindowYears.value), -1),
    addYears(sim, HORIZON_YEARS),
  );
  const flags = () => new Array<boolean>(days.count).fill(false);

  // Departure and return days are days in Canada (PDI; calculator FAQ A3).
  const away = flags();
  for (const trip of req.trips)
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
  const temporary = flags();
  for (const period of req.temporaryPeriods)
    days.mark(temporary, period.from, period.to ?? addDays(pr, -1));

  const sums = {
    resident: days.sums((i) => days.date(i) >= pr && !away[i]),
    temporary: days.sums((i) => days.date(i) < pr && temporary[i] && !away[i]),
  };

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
    '最早日期假设模拟日之后一直在加拿大（已录入的未来出境除外）。',
    'Projected dates assume you stay in Canada after the simulation date, apart from trips you entered.',
  );
  const travelDays = L(
    '离境日与返回日都按在加拿大计，当天往返不算离境。',
    'The days you leave and come back count as days in Canada, and a same-day trip is not an absence.',
  );
  const leapNote = L(
    '审查日或签署日为 2 月 29 日时，5 年前取 2 月 28 日（PD-091）。',
    'If the examination or signing date is 29 February, 5 years earlier is taken as 28 February (PD-091).',
  );
  // PD-091 applies when the date the result rests on is 29 February.
  const leap = (d?: IsoDate) => (d ?? sim).slice(5) === '02-29';
  const pathways: CaPathway[] = [];

  // ---------- Residency obligation (IRPA s28) ----------
  {
    const fiveYears = afterYears(pr, v.prWindowYears.value);
    const firstEnd = addDays(fiveYears, -1);
    const first = days.total(sums.resident, pr, firstEnd);
    const rolling = (d: IsoDate) =>
      days.total(
        sums.resident,
        addYears(d, -v.prWindowYears.value),
        addDays(d, -1),
      );
    const need = v.prObligationDays.value;
    const ok = (d: IsoDate) =>
      d < fiveYears ? first >= need : rolling(d) >= need;
    const earliest = firstDate(ok);
    const within = sim < fiveYears;
    const sofar = days.total(sums.resident, pr, addDays(sim, -1));
    pathways.push({
      id: 'CA-RESIDENCY',
      title: L(
        '维持永久居民身份的居住义务',
        'Permanent resident residency obligation',
      ),
      status: statusOf(earliest),
      earliestDate: earliest,
      summary:
        (earliest === sim
          ? within
            ? L(
                `按录入的行程，成为永久居民后的首个 5 年（到 ${firstEnd}）可在加拿大 ${first} 天，满足 730 天。`,
                `With the trips you entered, you can spend ${first} days in Canada in your first 5 years as a permanent resident (to ${firstEnd}), meeting the 730 days.`,
              )
            : L(
                '模拟日前 5 年在加拿大满 730 天。',
                'You spent at least 730 days in Canada in the 5 years before the simulation date.',
              )
          : earliest
            ? L(
                `按录入的行程，最早 ${earliest} 起前 5 年在加拿大满 730 天。`,
                `With the trips you entered, the 5 years before ${earliest} are the first to include 730 days in Canada.`,
              )
            : L(
                '按现有记录，10 年内达不到 730 天。',
                'With your record you will not reach 730 days within 10 years.',
              )) +
        L(
          '不满足不等于自动失去身份：须经正式决定才会失去永久居民身份（s46(1)(b)）。',
          ' Not meeting it does not end your status by itself: you lose permanent resident status only after a final decision (s46(1)(b)).',
        ),
      checks: within
        ? [
            {
              text: L(
                `截至模拟日已在加拿大 ${sofar} 天；首个 5 年（${pr} 至 ${firstEnd}）按录入的行程共 ${first} 天（至少 730 天）`,
                `${sofar} days in Canada so far; ${first} days in your first 5 years (${pr} to ${firstEnd}) with the trips you entered (730 at least)`,
              ),
              met: first >= need,
              sources: [
                ...v.prObligationDays.sources,
                { srcId: 'SRC-075', locator: 's28(2)(b)(i)' },
              ],
            },
          ]
        : [
            {
              text: L(
                `模拟日前 5 年在加拿大 ${rolling(sim)} 天（至少 730 天）`,
                `${rolling(sim)} days in Canada in the 5 years before the simulation date (730 at least)`,
              ),
              met: rolling(sim) >= need,
              sources: [
                ...v.prObligationDays.sources,
                { srcId: 'SRC-075', locator: 's28(2)(b)(ii)' },
              ],
            },
          ],
      notChecked: [
        L(
          '在境外陪同加拿大公民配偶或父母、为加拿大企业或公共部门全职派驻境外，以及陪同这样的永久居民的日子（s28(2)(a)(ii)–(iv)）',
          'Days outside Canada accompanying a Canadian citizen spouse or parent, employed full time abroad by a Canadian business or public service, or accompanying such a permanent resident (s28(2)(a)(ii)–(iv))',
        ),
        L(
          '人道理由的裁量（s28(2)(c)），以及收到违反居住义务的报告或决定之后的日子不计（IRPR s62）',
          'Humanitarian and compassionate relief (s28(2)(c)), and days after a report or decision on the residency obligation, which do not count (IRPR s62)',
        ),
      ],
      assumptions: [
        travelDays,
        L(
          '成为永久居民满 5 年后，按审查日（模拟日）前 5 年计，不含审查当天；审查当天是否计入原文未写（PD-089）。',
          'After 5 years as a permanent resident, the 5 years before the examination date (the simulation date) are counted, not including that day; whether it counts is not stated (PD-089).',
        ),
        leapNote,
        projection,
      ],
      pendingDetails: [
        ...(within ? [] : ['PD-089']),
        ...(leap(earliest) ? ['PD-091'] : []),
      ],
    });
  }

  // ---------- Citizenship (s5(1)(c)(i), s5(1.001)) ----------
  {
    const window = v.citizenshipWindowYears.value;
    const cap = v.preResidenceCreditCap.value;
    const count = (d: IsoDate) => {
      const start = addYears(d, -window);
      const end = addDays(d, -1);
      const resident = days.total(sums.resident, start, end);
      const temporary = days.total(sums.temporary, start, end);
      // Half days, kept exact: 2 units a day as a resident, 1 before.
      const units = 2 * resident + Math.min(temporary, 2 * cap);
      return { resident, temporary, units };
    };
    const need = 2 * v.citizenshipDays.value;
    const ok = (d: IsoDate) => d >= pr && count(d).units >= need;
    const earliest = firstDate(ok);
    const c = count(sim);
    const credited = c.units / 2;
    const age = fullYears(req.dateOfBirth, sim);
    const languageAge =
      age >= v.languageMinAge.value && age < v.languageMaxAge.value;
    pathways.push({
      id: 'CA-CITIZENSHIP',
      title: L('入籍（实际居住）', 'Citizenship (physical presence)'),
      status: statusOf(earliest),
      earliestDate: earliest,
      summary:
        earliest === sim
          ? L(
              '模拟日签署申请已满足 1,095 天实际居住。',
              'Signing your application on the simulation date meets the 1,095 days of physical presence.',
            )
          : earliest
            ? L(
                `满足 1,095 天实际居住的最早签署日是 ${earliest}。`,
                `The earliest date to sign your application with 1,095 days of physical presence is ${earliest}.`,
              )
            : L(
                '按现有记录，10 年内达不到 1,095 天。',
                'With your record you will not reach 1,095 days within 10 years.',
              ),
      checks: [
        {
          text: L(
            `递交时是永久居民（${pr} 起）`,
            `A permanent resident when you apply (from ${pr})`,
          ),
          met: sim >= pr,
          sources: [{ srcId: 'SRC-074', locator: 's5(1)(c)' }],
        },
        {
          text: L(
            `前 5 年折算在加拿大 ${credited} 天：永久居民 ${c.resident} 天，成为永久居民前 ${c.temporary} 天按半天计、最多 365 天（至少 1,095 天）`,
            `${credited} days of physical presence in the past 5 years: ${c.resident} days as a permanent resident, plus ${c.temporary} days before at half a day each, 365 at most (1,095 at least)`,
          ),
          met: c.units >= need,
          sources: [
            ...v.citizenshipDays.sources,
            ...v.preResidenceCreditCap.sources,
          ],
        },
      ],
      notChecked: [
        L(
          '5 年内 3 个税年按要求报税（s5(1)(c)(iii)）',
          'Filing tax returns for 3 tax years in the 5 years, where required (s5(1)(c)(iii))',
        ),
        languageAge
          ? L(
              '你在 18 至 54 岁之间：须证明语言能力并通过公民知识考试（s5(1)(d)–(e)）',
              'You are between 18 and 54: you need to show language ability and pass the citizenship test (s5(1)(d)–(e))',
            )
          : L(
              '18 至 54 岁的申请人须证明语言能力并通过公民知识考试（s5(1)(d)–(e)）',
              'Applicants aged 18 to 54 need to show language ability and pass the citizenship test (s5(1)(d)–(e))',
            ),
        L(
          '没有未履行的永居条件、不在遣返令之下等禁止情形（s5(1)(c)、(f)，s22）；服刑、假释、缓刑期间不计（s21）',
          'No unfulfilled conditions of permanent residence, no removal order or other prohibition (s5(1)(c), (f), s22); time in prison, on parole or on probation does not count (s21)',
        ),
        L(
          '随公务员、军人配偶在境外视同在加拿大的日子（s5(1.01)–(1.03)）',
          'Days abroad with a spouse or parent in the Canadian Armed Forces or public service, which count as in Canada (s5(1.01)–(1.03))',
        ),
      ],
      assumptions: [
        travelDays,
        L(
          '5 年从签署日往回数，不含签署当天；网上申请以哪天为准原文未写，按签署日计（PD-090）。',
          'The 5 years are counted back from the date you sign, not including that day; for online applications the date used is not stated, so the signing date is used (PD-090).',
        ),
        L(
          '成为永久居民前，只算录入的临时居民或受保护人身份期间在加拿大的日子，每天半天、不取整；没有身份、难民申请待决的日子不算。',
          'Before you became a permanent resident, only days in Canada in the temporary resident or protected person periods you entered count, at half a day each with no rounding; days without status or waiting on a refugee claim do not count.',
        ),
        leapNote,
        projection,
      ],
      pendingDetails: ['PD-090', ...(leap(earliest) ? ['PD-091'] : [])],
    });
  }

  return { policyAsOf: ca.asOf, pathways };
}
