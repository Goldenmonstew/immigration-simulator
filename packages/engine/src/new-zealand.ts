import { newZealand2026_11 as nz } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears } from './dates';
import { Days, HORIZON_YEARS, afterYears } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// New Zealand pilot (phase 18, task 60): resident visa travel conditions,
// the permanent resident visa by days in New Zealand, and citizenship
// presence. Residence categories themselves are out of scope.

export const NZ_RESIDENT_CATEGORIES = [
  'general',
  'parent',
  'religious-worker',
  'aip-growth',
  'aip-balanced',
] as const;

export type NzResidentCategory = (typeof NZ_RESIDENT_CATEGORIES)[number];

/** Left New Zealand on `departed`, came back on `returned`. */
export interface NzTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface NzRequest {
  simulationDate: IsoDate;
  dateOfBirth: IsoDate;
  /** First arrival in New Zealand on any visa. */
  firstArrival: IsoDate;
  residentVisa: { granted: IsoDate; category: NzResidentCategory };
  /** Grant date of a permanent resident visa, if any. */
  permanentResidentVisa?: IsoDate;
  trips: NzTrip[];
  locale?: Locale;
}

export type NzPathwayId = 'NZ-TRAVEL' | 'NZ-PRV' | 'NZ-CITIZENSHIP';
export type NzPathway = PilotPathway<NzPathwayId>;
export type NzResult = PilotResult<NzPathwayId>;

const v = nz.values;
const INVESTOR = new Set<NzResidentCategory>(['aip-growth', 'aip-balanced']);

export function evaluateNewZealand(req: NzRequest): NzResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const granted = req.residentVisa.granted;
  const prv = req.permanentResidentVisa;
  const days = new Days(
    addDays(addYears(sim, -v.citizenshipWindowYears.value), -1),
    addYears(sim, HORIZON_YEARS),
  );
  const flags = () => new Array<boolean>(days.count).fill(false);

  // Arrival and departure days count as days in New Zealand (RV1.15.5);
  // `strictAway` counts neither as in New Zealand (PD-086).
  const away = flags();
  const strictAway = flags();
  for (const trip of req.trips) {
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
    days.mark(strictAway, trip.departed, trip.returned);
  }

  // First day in New Zealand as a resident (R5.66.5(b)): the grant day if
  // granted in New Zealand, else the first entry after the grant. A grant on
  // a departure day is taken to be in New Zealand.
  const abroadAtGrant = req.trips.find(
    (trip) => trip.departed < granted && granted < trip.returned,
  );
  const firstDay =
    granted < req.firstArrival
      ? req.firstArrival
      : (abroadAtGrant?.returned ?? granted);
  const offshoreGrant = firstDay !== granted;
  const firstEntryBy = addDays(
    afterYears(granted, v.firstEntryYears.value),
    -1,
  );
  const firstEntryOk = !offshoreGrant || firstDay <= firstEntryBy;
  const travelYears = v.travelYears.value[req.residentVisa.category];
  const travelEnd = addDays(afterYears(firstDay, travelYears), -1);
  // PD-088: a return after the travel conditions without a permanent
  // resident visa by then.
  const lateReturn = req.trips
    .map((trip) => trip.returned)
    .filter((d) => d > travelEnd && !(prv && prv <= d))
    .sort()[0];

  const resident = (i: number, absent: boolean[]) =>
    days.date(i) >= firstDay && !absent[i];
  const sums = {
    resident: days.sums((i) => resident(i, away)),
    strict: days.sums((i) => resident(i, strictAway)),
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
  // PD-088: no date reached before a late return.
  const blocked = (earliest?: IsoDate) =>
    !!lateReturn && (!earliest || earliest >= lateReturn);

  const projection = L(
    '最早日期假设模拟日之后一直在新西兰（已录入的未来出境除外）。',
    'Projected dates assume you stay in New Zealand after the simulation date, apart from trips you entered.',
  );
  const firstDayNote = L(
    `首次以居民身份在新西兰之日按 ${firstDay} 计：境内获批的为获批日，境外获批的为之后首次入境日；出境当天获批的按在境内计。`,
    `Your first day in New Zealand as a resident is taken as ${firstDay}: the grant day if granted in New Zealand, otherwise your next arrival. A grant on a day you left counts as in New Zealand.`,
  );
  const lapsed = L(
    `居民签证在境外获批（${granted}），但首次入境（${firstDay}）晚于期限 ${firstEntryBy}；按 R5.66.1，须重新申请居民签证。`,
    `Your resident visa was granted outside New Zealand (${granted}) but your first arrival (${firstDay}) is after the deadline of ${firstEntryBy}; under R5.66.1 you would need to apply for a resident visa again.`,
  );
  const late = L(
    `录入的 ${lateReturn} 返回晚于旅行条件（到 ${travelEnd}），那时还没有永久居民签证：须先变更旅行条件（RV3）或拿到永久居民签证；那次返回之后的结果待确认（PD-088）。`,
    `You return on ${lateReturn}, after your travel conditions end (${travelEnd}), without a permanent resident visa by then: you would first need a variation of travel conditions (RV3) or a permanent resident visa, so results after that return cannot be worked out (PD-088).`,
  );
  const pathways: NzPathway[] = [];
  const hasPrv = !!prv && prv <= sim;

  // ---------- Travel conditions ----------
  {
    const title = L('居民签证的旅行条件', 'Resident visa travel conditions');
    const checks: NzPathway['checks'] = [];
    if (offshoreGrant)
      checks.push({
        text: L(
          `境外获批后在 ${firstEntryBy} 前首次入境（${firstDay}）`,
          `First arrival by ${firstEntryBy} after an offshore grant (${firstDay})`,
        ),
        met: firstEntryOk,
        sources: v.firstEntryYears.sources,
      });
    checks.push({
      text: L(
        `录入的返回日都在旅行条件内（到 ${travelEnd}），或返回前已有永久居民签证`,
        `Every return you entered is within the travel conditions (to ${travelEnd}) or after a permanent resident visa`,
      ),
      met: !lateReturn,
      sources: [
        ...v.travelYears.sources,
        { srcId: 'SRC-071', locator: 's74(2)' },
      ],
    });
    pathways.push(
      hasPrv
        ? {
            id: 'NZ-TRAVEL',
            title,
            status: 'NOT_APPLICABLE',
            summary: L(
              '模拟日已持永久居民签证，可随时往返新西兰（s73）。',
              'You hold a permanent resident visa on the simulation date, so you can travel to New Zealand at any time (s73).',
            ),
            checks: [],
            notChecked: [],
            assumptions: [],
          }
        : {
            id: 'NZ-TRAVEL',
            title,
            status: firstEntryOk && !lateReturn ? 'MET' : 'NOT_MET',
            earliestDate: firstEntryOk && !lateReturn ? sim : undefined,
            summary: !firstEntryOk
              ? lapsed
              : lateReturn
                ? late
                : L(
                    `多次入境的旅行条件约到 ${travelEnd}。留在新西兰不受影响；此后出境再回来，须先拿到永久居民签证或变更旅行条件（RV3）。`,
                    `Your multiple-entry travel conditions run to about ${travelEnd}. Staying in New Zealand is not affected; to leave and come back after that you need a permanent resident visa or a variation of travel conditions (RV3).`,
                  ),
            checks,
            notChecked: [
              L(
                '萨摩亚配额与太平洋准入类别的 3 个月首次入境期限、Active Investor Plus 子女随父母的旅行条件（R5.66）',
                'The 3-month first-entry deadline for the Samoan Quota and Pacific Access Category, and travel conditions that mirror an Active Investor Plus parent (R5.66)',
              ),
            ],
            assumptions: [
              firstDayNote,
              L(
                `旅行条件按类别自首次以居民身份在新西兰之日起 ${travelYears} 年，周年前一天为最后一天；首次入境期限同样计。签证上印有具体日期，以签证为准（PD-087）。`,
                `Travel conditions run ${travelYears} years from your first day as a resident for your category, ending the day before the anniversary; the first-entry deadline is counted the same way. Your visa shows the exact dates, and they take precedence (PD-087).`,
              ),
            ],
            pendingDetails: ['PD-087', ...(lateReturn ? ['PD-088'] : [])],
          },
    );
  }

  // ---------- Permanent resident visa ----------
  {
    const title = L(
      '永久居民签证（在境天数）',
      'Permanent resident visa (days in New Zealand)',
    );
    const heldFrom = addMonths(granted, v.prvHeldMonths.value);
    const firstDayFrom = addMonths(firstDay, v.prvFirstDayMonths.value);
    const portions = (d: IsoDate) => {
      const mid = addMonths(d, -12);
      const start = addMonths(d, -24);
      return [
        days.total(sums.resident, start, addDays(mid, -1)),
        days.total(sums.resident, mid, addDays(d, -1)),
      ];
    };
    const ok = (need: number) => (d: IsoDate) =>
      d >= heldFrom && d >= firstDayFrom && portions(d).every((n) => n >= need);
    const notChecked = [
      L(
        '品格，以及满足 s49(1)、s50 附加条件（RV2.5(d)–(e)）',
        'Character, and meeting conditions under s49(1) or s50 (RV2.5(d)–(e))',
      ),
      L(
        '投资、在新西兰经营或安家等其他表明承诺的方式（RV2.5.10–RV2.5.20），以及居民签证已到期的前持有人（RV2.5(a)(ii)）',
        'The other ways to show commitment, such as investment, a business or a base in New Zealand (RV2.5.10–RV2.5.20), and former holders whose resident visa has expired (RV2.5(a)(ii))',
      ),
    ];
    if (hasPrv) {
      pathways.push({
        id: 'NZ-PRV',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '模拟日已持永久居民签证。',
          'You already hold a permanent resident visa on the simulation date.',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else if (INVESTOR.has(req.residentVisa.category)) {
      pathways.push({
        id: 'NZ-PRV',
        title,
        status: 'UNKNOWN',
        summary: L(
          `Active Investor Plus 居民签证转永居按 RV2.10，看投资条件是否已满足，本试点不判断；持居民签证满 24 个月的日期是 ${heldFrom}。`,
          `An Active Investor Plus resident visa moves to permanent residence under RV2.10, which depends on meeting the investment conditions; this pilot does not check them. You will have held the resident visa for 24 months on ${heldFrom}.`,
        ),
        checks: [],
        notChecked: [
          L(
            '投资条件（RV2.10）与品格',
            'The investment conditions (RV2.10) and character',
          ),
        ],
        assumptions: [],
      });
    } else if (!firstEntryOk) {
      pathways.push({
        id: 'NZ-PRV',
        title,
        status: 'NOT_MET',
        summary: lapsed,
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const earliest = firstDate(ok(v.prvPortionDays.value));
      const tax = firstDate(ok(v.prvTaxPortionDays.value));
      const stuck = blocked(earliest);
      const [a, b] = portions(sim);
      pathways.push({
        id: 'NZ-PRV',
        title,
        status: stuck ? 'UNKNOWN' : statusOf(earliest),
        earliestDate: stuck ? undefined : earliest,
        summary:
          (stuck
            ? late
            : earliest === sim
              ? L(
                  '模拟日已满足永久居民签证的时间条件（RV2.5.1）。',
                  'You meet the time requirements for a permanent resident visa on the simulation date (RV2.5.1).',
                )
              : earliest
                ? L(
                    `满足永久居民签证时间条件的最早递交日是 ${earliest}。`,
                    `The earliest application date that meets the time requirements for a permanent resident visa is ${earliest}.`,
                  )
                : L(
                    '按现有记录，10 年内达不到在境天数要求。',
                    'With your record you will not meet the days requirement within 10 years.',
                  )) +
          (tax && (!earliest || tax < earliest) && !blocked(tax)
            ? L(
                `如果税务局确认你申请前 24 个月都是新西兰税务居民，走税务居民路线（每段 41 天）最早 ${tax}（RV2.5.5）。`,
                ` If Inland Revenue confirms you were a New Zealand tax resident for the 24 months before applying, the tax residence route (41 days in each part) is open from ${tax} (RV2.5.5).`,
              )
            : ''),
        checks: [
          {
            text: L(
              `持居民签证满 24 个月（${heldFrom}）`,
              `Held your resident visa for 24 months (on ${heldFrom})`,
            ),
            met: sim >= heldFrom,
            sources: v.prvHeldMonths.sources,
          },
          {
            text: L(
              `首次以居民身份在新西兰满 24 个月（${firstDayFrom}）`,
              `24 months since your first day in New Zealand as a resident (on ${firstDayFrom})`,
            ),
            met: sim >= firstDayFrom,
            sources: [
              ...v.prvFirstDayMonths.sources,
              { srcId: 'SRC-072', locator: 'R5.66.5(b)' },
            ],
          },
          {
            text: L(
              `申请前第 13–24 个月以居民身份在境 ${a} 天（至少 184 天）`,
              `${a} days in New Zealand as a resident in months 13–24 before applying (184 at least)`,
            ),
            met: a >= v.prvPortionDays.value,
            sources: v.prvPortionDays.sources,
          },
          {
            text: L(
              `申请前 12 个月以居民身份在境 ${b} 天（至少 184 天）`,
              `${b} days in New Zealand as a resident in the 12 months before applying (184 at least)`,
            ),
            met: b >= v.prvPortionDays.value,
            sources: v.prvPortionDays.sources,
          },
        ],
        notChecked,
        assumptions: [
          firstDayNote,
          L(
            '入境日与出境日都计为在境（RV1.15.5）。只算首次以居民身份在新西兰之日起的日子。',
            'Arrival and departure days both count as days in New Zealand (RV1.15.5). Only days from your first day as a resident count.',
          ),
          projection,
        ],
        pendingDetails: stuck ? ['PD-088'] : undefined,
      });
    }
  }

  // ---------- Citizenship by grant ----------
  {
    const title = L('入籍（在境天数）', 'Citizenship by grant (presence)');
    const notChecked = [
      L(
        '品格、英语、公民知识，以及打算继续在新西兰居住（s8(2)(c)–(f)）',
        'Good character, English, knowledge of citizenship, and intending to keep living in New Zealand (s8(2)(c)–(f))',
      ),
      L(
        '居民签证附加条件（如父母类、技术移民类的 s49(1) 条件）须已满足或取消（s8(3)）',
        'Any conditions on your resident visa (such as s49(1) conditions on Parent or Skilled Migrant visas) must be met or cancelled (s8(3))',
      ),
      L(
        'Crown service 视同在境、特殊情况下 20 个月内 450 天（s8(5)、s8(7)），以及澳大利亚公民、萨摩亚公民等特殊情形',
        'Crown service counted as presence, the 450 days in 20 months for exceptional circumstances (s8(5), s8(7)), and special cases such as Australian or Samoan citizens',
      ),
    ];
    if (!firstEntryOk) {
      pathways.push({
        id: 'NZ-CITIZENSHIP',
        title,
        status: 'NOT_MET',
        summary: lapsed,
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const adult = afterYears(req.dateOfBirth, v.citizenshipMinAge.value);
      const window = v.citizenshipWindowYears.value;
      const counts = (d: IsoDate, s: number[]) => {
        const years = Array.from({ length: window }, (_, k) =>
          days.total(s, addYears(d, -(k + 1)), addDays(addYears(d, -k), -1)),
        );
        return { total: years.reduce((x, y) => x + y, 0), years };
      };
      const ok = (s: number[]) => (d: IsoDate) => {
        const c = counts(d, s);
        return (
          d >= adult &&
          d >= firstDay &&
          c.total >= v.citizenshipTotalDays.value &&
          c.years.every((n) => n >= v.citizenshipYearDays.value)
        );
      };
      const earliest = firstDate(ok(sums.resident));
      const strict = firstDate(ok(sums.strict));
      const stuck = blocked(earliest);
      const c = counts(sim, sums.resident);
      pathways.push({
        id: 'NZ-CITIZENSHIP',
        title,
        status: stuck ? 'UNKNOWN' : statusOf(earliest),
        earliestDate: stuck ? undefined : earliest,
        summary:
          (stuck
            ? late
            : earliest === sim
              ? L(
                  '模拟日已满足入籍的在境天数要求。',
                  'You meet the presence requirement for citizenship on the simulation date.',
                )
              : earliest
                ? L(
                    `满足入籍在境天数要求的最早递交日是 ${earliest}。`,
                    `The earliest application date that meets the presence requirement is ${earliest}.`,
                  )
                : L(
                    '按现有记录，10 年内达不到入籍的在境天数要求。',
                    'With your record you will not meet the presence requirement within 10 years.',
                  )) +
          (stuck || strict === earliest
            ? ''
            : L(
                `若出入境当天都不算在境，${strict ? `最早为 ${strict}` : '10 年内达不到'}（PD-086）。`,
                ` If arrival and departure days do not count, ${strict ? `the earliest date is ${strict}` : 'it is not met within 10 years'} (PD-086).`,
              )),
        checks: [
          {
            text: L(
              `年满 16 岁（${adult}）`,
              `Aged 16 or over (from ${adult})`,
            ),
            met: sim >= adult,
            sources: v.citizenshipMinAge.sources,
          },
          {
            text: L(
              `持居民签证或永久居民签证并已入境（${firstDay}）`,
              `Hold a resident or permanent resident visa and have entered on it (${firstDay})`,
            ),
            met: sim >= firstDay,
            sources: [
              { srcId: 'SRC-070', locator: 's8(2)(a)' },
              { srcId: 'SRC-071', locator: 's74(1)(b)' },
            ],
          },
          {
            text: L(
              `前 5 年以居民身份在境合计 ${c.total} 天（至少 1,350 天）`,
              `${c.total} days in New Zealand as a resident in the past 5 years (1,350 at least)`,
            ),
            met: c.total >= v.citizenshipTotalDays.value,
            sources: v.citizenshipTotalDays.sources,
          },
          {
            text: L(
              `每一年至少 240 天（由近到远：${c.years.join('、')} 天）`,
              `At least 240 days in each year (latest first: ${c.years.join(', ')} days)`,
            ),
            met: c.years.every((n) => n >= v.citizenshipYearDays.value),
            sources: v.citizenshipYearDays.sources,
          },
        ],
        notChecked,
        assumptions: [
          firstDayNote,
          L(
            '5 年及每一年都从递交日往回数，不含递交当天（SRC-073）。只算持居民签证或永久居民签证、可无限期留在新西兰的日子（s8(2)(b)）。',
            'The 5 years and each year are counted back from the application date, not including it (SRC-073). Only days when you held a resident or permanent resident visa and could stay indefinitely count (s8(2)(b)).',
          ),
          L(
            '出入境当天都按在境计，与移民局对永久居民签证的计法一致（RV1.15.5）；入籍的计法未公开，两天都不算时的日期另列（PD-086）。',
            'Arrival and departure days both count as in New Zealand, as Immigration New Zealand counts them for the permanent resident visa (RV1.15.5); the citizenship counting is not published, so the date with neither day counted is also given (PD-086).',
          ),
          projection,
        ],
        pendingDetails: stuck
          ? ['PD-088']
          : strict === earliest
            ? undefined
            : ['PD-086'],
      });
    }
  }

  return { policyAsOf: nz.asOf, pathways };
}
