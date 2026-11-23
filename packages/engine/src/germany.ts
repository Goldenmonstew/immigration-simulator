import { germany2026_11 as de } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, afterYears, monthSpan } from './pilot';
import type {
  PilotCheck,
  PilotPathway,
  PilotResult,
  PilotStatus,
} from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Germany pilot (phase 19, task 69): Niederlassungserlaubnis (AufenthG § 9,
// § 18c, § 26 Abs. 3, § 28 Abs. 2), Daueraufenthalt-EU (§§ 9a, 9b), losing
// a title on long trips (§ 51) and Einbürgerung (StAG §§ 9, 10, 12b).
// Income, language, housing and the other conditions are not checked.

/**
 * study: university study (§ 16b); training: vocational training (§ 16a);
 * skilled: skilled worker or researcher (§§ 18a, 18b, 18d); blue-card:
 * Blaue Karte EU (§ 18g); german-family: family of a German (§ 28); other:
 * any other permit for a lasting purpose; temporary: a permit for a
 * temporary purpose (such as § 20 job seeking or au pair); protection:
 * asylum or refugee status (§ 25 Abs. 1, Abs. 2 Satz 1); subsidiary:
 * subsidiary protection (§ 25 Abs. 2 Satz 2); humanitarian: another
 * humanitarian permit (Chapter 2 Section 5, such as § 25 Abs. 3–5, § 25a,
 * § 25b); asylum:
 * Aufenthaltsgestattung while the asylum claim is decided; settlement:
 * Niederlassungserlaubnis; eu-long-term: Daueraufenthalt-EU. A national
 * visa is entered as the permit it was issued for.
 */
export const DE_PERMIT_KINDS = [
  'study',
  'training',
  'skilled',
  'blue-card',
  'german-family',
  'other',
  'temporary',
  'protection',
  'subsidiary',
  'humanitarian',
  'asylum',
  'settlement',
  'eu-long-term',
] as const;
export type DePermitKind = (typeof DE_PERMIT_KINDS)[number];

/**
 * Unlimited titles (§ 9 Abs. 1 Satz 1, § 9a Abs. 1 Satz 1): the date on the
 * card only concerns the document, so they have no end date.
 */
export const DE_UNLIMITED_KINDS: readonly DePermitKind[] = [
  'settlement',
  'eu-long-term',
];

export const DE_SETTLEMENT_ROUTES = [
  'general',
  'skilled',
  'blue-card',
  'german-family',
  'refugee',
] as const;
export type DeSettlementRoute = (typeof DE_SETTLEMENT_ROUTES)[number];

export const DE_NATURALISATION_ROUTES = ['general', 'spouse'] as const;
export type DeNaturalisationRoute = (typeof DE_NATURALISATION_ROUTES)[number];

export interface DePermit {
  kind: DePermitKind;
  from: IsoDate;
  /** Last day of validity; absent = runs until the next permit starts. */
  to?: IsoDate;
  /**
   * Renewal or a new permit applied for before `to`: the permit continues
   * until the next one starts (§ 81 Abs. 4 Satz 1).
   */
  renewing?: boolean;
}

/** Left Germany on `departed`, came back on `returned`. */
export interface DeTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface DeRequest {
  simulationDate: IsoDate;
  /** First arrival in Germany: permits count only from here. */
  firstEntry: IsoDate;
  permits: DePermit[];
  trips: DeTrip[];
  settlementRoute: DeSettlementRoute;
  /** Months of pension contributions by the simulation date; absent = not entered. */
  contributionMonths?: number;
  /**
   * Months employed on a Blue Card (§ 18g) with contributions for them, by
   * the simulation date (route `blue-card`); absent = not entered.
   */
  blueCardEmploymentMonths?: number;
  /** Vocational training or a degree completed in Germany (§ 18c Abs. 1 Satz 2). */
  trainedInGermany?: boolean;
  /** German at B1 (§ 18c Abs. 2 Satz 3). */
  germanB1?: boolean;
  /** German at C1 (§ 26 Abs. 3 Satz 3). */
  germanC1?: boolean;
  naturalisationRoute: DeNaturalisationRoute;
  /** Married to, or in a registered partnership with, a German since (route `spouse`). */
  marriedOn?: IsoDate;
  /** The spouse became German on this date; absent = German throughout. */
  spouseGermanSince?: IsoDate;
  locale?: Locale;
}

export type DePathwayId =
  'DE-SETTLEMENT' | 'DE-EU-LONG-TERM' | 'DE-NATURALISATION' | 'DE-TRAVEL';
export type DePathway = PilotPathway<DePathwayId>;
export type DeResult = PilotResult<DePathwayId>;

const v = de.values;
type Verdict = 'yes' | 'maybe' | 'no';

const aufenthG = (locator: string, section: string): SourceRef => ({
  srcId: 'SRC-100',
  locator,
  url: `https://www.gesetze-im-internet.de/aufenthg_2004/__${section}.html`,
});
const stAG = (locator: string, section: string): SourceRef => ({
  srcId: 'SRC-101',
  locator,
  url: `https://www.gesetze-im-internet.de/stag/__${section}.html`,
});

// Permits under Chapter 2 Section 5 (humanitarian): their settlement permit
// is under § 26, not § 9.
const SECTION_5: DePermitKind[] = ['protection', 'subsidiary', 'humanitarian'];

// Titles for a lasting purpose: not study, training, a temporary purpose,
// another humanitarian permit or the asylum procedure.
const TITLES: DePermitKind[] = [
  'skilled',
  'blue-card',
  'german-family',
  'other',
  'protection',
  'subsidiary',
  'settlement',
  'eu-long-term',
];

const KIND_NAMES: Record<DePermitKind, [string, string]> = {
  study: ['学习许可', 'a study permit'],
  training: ['职业培训许可', 'a vocational training permit'],
  skilled: ['技术工人许可', 'a skilled worker permit'],
  'blue-card': ['欧盟蓝卡', 'an EU Blue Card'],
  'german-family': ['德国人家属许可', 'a permit as family of a German'],
  other: ['居留许可', 'a residence permit'],
  temporary: ['临时目的的许可', 'a permit for a temporary purpose'],
  protection: ['庇护或难民许可', 'an asylum or refugee permit'],
  subsidiary: ['辅助保护许可', 'a subsidiary protection permit'],
  humanitarian: ['人道居留许可', 'a humanitarian residence permit'],
  asylum: ['庇护程序中的居留', 'leave to remain while claiming asylum'],
  settlement: ['定居许可', 'a settlement permit'],
  'eu-long-term': ['欧盟长期居留', 'EU long-term residence'],
};

const ROUTE_NAMES: Record<DeSettlementRoute, [string, string]> = {
  general: ['一般路径（§ 9）', 'the general route (§ 9)'],
  skilled: [
    '技术工人路径（§ 18c Abs. 1）',
    'the skilled worker route (§ 18c Abs. 1)',
  ],
  'blue-card': [
    '欧盟蓝卡路径（§ 18c Abs. 2）',
    'the EU Blue Card route (§ 18c Abs. 2)',
  ],
  'german-family': [
    '德国人家属路径（§ 28 Abs. 2）',
    'the route for family of a German (§ 28 Abs. 2)',
  ],
  refugee: [
    '庇护权人与难民路径（§ 26 Abs. 3）',
    'the asylum and refugee route (§ 26 Abs. 3)',
  ],
};

/** How a settlement route counts time. */
interface SettlementRule {
  /** Count in full, at half; hold one of `hold` on the day. */
  full: DePermitKind[];
  half: DePermitKind[];
  hold: DePermitKind[];
  years: number;
  /** Months of contributions, or of Blue Card employment. */
  months?: number;
  what: [string, string];
  sources: SourceRef[];
}

function settlementRule(req: DeRequest): SettlementRule {
  switch (req.settlementRoute) {
    case 'general':
      return {
        full: [...TITLES, 'temporary', 'humanitarian'],
        half: ['study', 'training'],
        hold: TITLES.filter((k) => !SECTION_5.includes(k)),
        years: v.generalYears.value,
        months: v.generalContributionMonths.value,
        what: [
          `持居留许可满 ${v.generalYears.value} 年（学习或职业培训期间折半，每次出境最多计 ${v.abroadCreditMonths.value} 个月）`,
          `${v.generalYears.value} years holding residence permits (study or vocational training at half, at most ${v.abroadCreditMonths.value} months counted for each trip abroad)`,
        ],
        sources: [
          ...v.generalYears.sources,
          ...v.abroadCreditMonths.sources,
          ...v.priorSettlementCreditYears.sources,
          aufenthG('§ 16b Abs. 4 Satz 2', '16b'),
          aufenthG('§ 16a Abs. 1 Satz 3', '16a'),
        ],
      };
    case 'skilled': {
      const years = req.trainedInGermany
        ? v.skilledTrainedYears
        : v.skilledYears;
      return {
        full: ['skilled', 'blue-card'],
        half: [],
        hold: ['skilled', 'blue-card'],
        years: years.value,
        months: req.trainedInGermany
          ? v.skilledTrainedContributionMonths.value
          : v.skilledContributionMonths.value,
        what: [
          `持技术工人许可或欧盟蓝卡满 ${years.value} 年`,
          `${years.value} years holding a skilled worker permit or EU Blue Card`,
        ],
        sources: years.sources,
      };
    }
    case 'blue-card': {
      const months = req.germanB1 ? v.blueCardB1Months : v.blueCardMonths;
      return {
        full: ['blue-card'],
        half: [],
        hold: ['blue-card'],
        years: 0,
        months: months.value,
        what: ['模拟日持有欧盟蓝卡', 'Holding an EU Blue Card'],
        sources: months.sources,
      };
    }
    case 'german-family':
      return {
        full: ['german-family'],
        half: [],
        hold: ['german-family'],
        years: v.germanFamilyYears.value,
        what: [
          `持德国人家属许可满 ${v.germanFamilyYears.value} 年`,
          `${v.germanFamilyYears.value} years holding a permit as family of a German`,
        ],
        sources: v.germanFamilyYears.sources,
      };
    case 'refugee': {
      const years = req.germanC1 ? v.refugeeC1Years : v.refugeeYears;
      return {
        full: ['protection', 'asylum'],
        half: ['study', 'training'],
        hold: ['protection'],
        years: years.value,
        what: [
          `持庇护或难民许可满 ${years.value} 年（此前的庇护程序计入，学习或职业培训期间折半，每次出境最多计 ${v.abroadCreditMonths.value} 个月）`,
          `${years.value} years holding an asylum or refugee permit (the asylum procedure before it counts, study or vocational training at half, at most ${v.abroadCreditMonths.value} months counted for each trip abroad)`,
        ],
        sources: [...years.sources, ...v.abroadCreditMonths.sources],
      };
    }
  }
}

interface Exit {
  trip: DeTrip;
  kind: DePermitKind;
  /** The last day to come back. */
  by: IsoDate;
  /** `by` is the day the title itself expired (§ 51 Abs. 1 Nr. 1). */
  expires?: boolean;
  /** Back after the old permit's expiry while a renewal is pending. */
  pendingRenewal?: boolean;
  /**
   * Away too long on a study permit: it does not lapse for study in another
   * member state under Directive (EU) 2016/801 (§ 51 Abs. 1a Satz 2).
   */
  mobility?: boolean;
  /**
   * A study permit that ran out before you came back: lapsed then even under
   * EU student mobility, which spares only Nr. 6 and 7 (§ 51 Abs. 1 Nr. 1).
   */
  studyEnd?: IsoDate;
  /** EU long-term residence: the last day if the time was outside the EU. */
  euBy?: IsoDate;
  lapses: boolean;
  unsure: boolean;
}

export function evaluateGermany(req: DeRequest): DeResult {
  const L = textFor(req);
  const N = ([zh, en]: [string, string]) => L(zh, en);
  const sim = req.simulationDate;
  const first = [
    sim,
    req.firstEntry,
    ...req.permits.map((p) => p.from),
    ...req.trips.map((t) => t.departed),
  ].sort()[0];
  const days = new Days(addDays(first, -1), addYears(sim, HORIZON_YEARS));

  // The title held each day: a later permit replaces an earlier one, so a
  // permit ends when the next one starts, whatever its printed expiry, and
  // one without an end date runs until then. Time before
  // the first arrival is not residence in Germany, even on a national visa
  // (§ 6 Abs. 3 Satz 3 counts lawful residence with it).
  const kinds = new Array<DePermitKind | undefined>(days.count).fill(undefined);
  const sorted = [...req.permits].sort((a, b) =>
    a.from < b.from ? -1 : a.from > b.from ? 1 : 0,
  );
  const clear = (from: number, to: number) => {
    for (let i = Math.max(0, from); i <= Math.min(days.count - 1, to); i++)
      kinds[i] = undefined;
  };
  // A renewal applied for before expiry keeps the permit until the decision
  // (§ 81 Abs. 4 Satz 1). With no later permit entered the decision is still
  // pending: for settlement and EU long-term residence whether that time
  // counts depends on the renewal being granted; for naturalisation it is
  // lawful residence (PD-124).
  const pending = new Array<boolean>(days.count).fill(false);
  sorted.forEach((p, n) => {
    const next = sorted.slice(n + 1).find((q) => q.from > p.from);
    const cut = next && addDays(next.from, -1);
    const end =
      DE_UNLIMITED_KINDS.includes(p.kind) || p.renewing ? undefined : p.to;
    const to = end && (!cut || end < cut) ? end : cut;
    const a = Math.max(0, days.index(p.from));
    const b = Math.min(days.count - 1, to ? days.index(to) : days.count - 1);
    for (let i = a; i <= b; i++) kinds[i] = p.kind;
    if (p.renewing && p.to && !next && !DE_UNLIMITED_KINDS.includes(p.kind))
      days.mark(pending, addDays(p.to, 1));
  });
  clear(0, days.index(req.firstEntry) - 1);
  const kindAt = (i: number) =>
    i >= 0 && i < days.count ? kinds[i] : undefined;
  // Days abroad run from the day after leaving to the day before coming
  // back: travel days count as days in Germany (PD-120).
  const tripOn = new Array<number>(days.count).fill(-1);
  req.trips.forEach((t, n) => {
    const a = Math.max(0, days.index(addDays(t.departed, 1)));
    const b = Math.min(days.count - 1, days.index(addDays(t.returned, -1)));
    for (let i = a; i <= b; i++) tripOn[i] = n;
  });
  // International protection: asylum or refugee status, or subsidiary
  // protection.
  const recognised = req.permits.some(
    (p) => p.kind === 'protection' || p.kind === 'subsidiary',
  );

  // § 51: the title held when leaving and the last day to come back. It
  // lapses when that day passes (AVwV 51.1.6.6), not on leaving, and only a
  // later permit replaces it. Trips are taken in order, so a later trip
  // sees the title an earlier one ended.
  const exits = new Array<Exit | undefined>(req.trips.length);
  const order = req.trips
    .map((_, n) => n)
    .sort((a, b) => (req.trips[a].departed < req.trips[b].departed ? -1 : 1));
  for (const n of order) {
    const trip = req.trips[n];
    const kind = kindAt(days.index(trip.departed));
    if (!kind || kind === 'asylum') continue;
    let exit: Exit;
    if (kind === 'eu-long-term') {
      const afterBlueCard = req.permits.some(
        (p) => p.kind === 'blue-card' && p.from < trip.departed,
      );
      const euBy = addMonths(
        trip.departed,
        afterBlueCard ? v.euLapseBlueCardMonths.value : v.euLapseMonths.value,
      );
      const by = addYears(trip.departed, v.euLapseYears.value);
      exit = {
        trip,
        kind,
        by,
        euBy,
        lapses: trip.returned > by,
        unsure: trip.returned > euBy && trip.returned <= by,
      };
    } else {
      const months = addMonths(
        trip.departed,
        kind === 'blue-card'
          ? v.blueCardLapseMonths.value
          : v.lapseMonths.value,
      );
      // A title that runs out while you are away has lapsed by then (§ 51
      // Abs. 1 Nr. 1); the 6 months never reach past it (AVwV 51.1.6.7).
      let k = days.index(trip.departed);
      while (k + 1 < days.count && kinds[k + 1]) k++;
      const end =
        !DE_UNLIMITED_KINDS.includes(kind) && k < days.count - 1
          ? days.date(k)
          : undefined;
      const expires = !!end && end < months;
      const by = expires ? end! : months;
      // Coming back after the simulation date and the old expiry with the
      // renewal still pending: the permit only continues until the decision
      // (§ 81 Abs. 4), so the months are a conditional limit (PD-124). A return
      // by the simulation date, still pending then, was on the old permit.
      const pendingRenewal =
        trip.returned > sim && !!pending[days.index(trip.returned)];
      const studyEnd =
        kind === 'study' && !expires && end && end < trip.returned
          ? end
          : undefined;
      const mobility =
        kind === 'study' && !expires && !studyEnd && trip.returned > by;
      exit = {
        trip,
        kind,
        by,
        expires,
        pendingRenewal,
        mobility,
        studyEnd,
        lapses: trip.returned > by && !mobility,
        unsure: (pendingRenewal && trip.returned <= by) || mobility,
      };
    }
    exits[n] = exit;
    if (exit.lapses) {
      const next = sorted.find((p) => p.from > trip.departed);
      clear(
        days.index(exit.by) + 1,
        next ? days.index(next.from) - 1 : days.count - 1,
      );
    }
  }

  // EU long-term residence lapses after its months outside the EU, which the
  // trips do not show: after that deadline whether it is still held is
  // unknown until a later permit starts.
  const doubt = new Array<boolean>(days.count).fill(false);
  const doubtful: Exit[] = [];
  // The same after a study permit that may have lapsed or not (§ 51 Abs. 1a).
  const doubtFrom = (e: Exit) => (e.mobility ? e.by : e.euBy);
  for (const n of order) {
    const e = exits[n];
    const from = e?.unsure && doubtFrom(e);
    if (!e || !from) continue;
    doubtful.push(e);
    const next = sorted.find((p) => p.from > e.trip.departed);
    days.mark(doubt, addDays(from, 1), next && addDays(next.from, -1));
  }
  const tripText = (e: Exit) =>
    L(
      `${e.trip.departed} 至 ${e.trip.returned}`,
      `${e.trip.departed} to ${e.trip.returned}`,
    );
  /** Why holding EU long-term residence on day `k` is uncertain. */
  const doubtText = (k: number) => {
    const e = doubtful.filter((x) => doubtFrom(x)! < days.date(k)).at(-1)!;
    if (e.mobility)
      return L(
        `你的学习许可可能已因 ${tripText(e)} 的出境失效：若这段时间是按欧盟学生流动（指令 2016/801）在其他成员国学习，许可不失效（§ 51 Abs. 1a Satz 2），否则在 ${e.by} 之后失效，试点无法判断（见"出境与居留失效"）。`,
        `Your study permit may have lapsed on the trip ${tripText(e)}: it does not lapse if you were studying in another member state under Directive (EU) 2016/801 (§ 51 Abs. 1a Satz 2), otherwise it lapsed after ${e.by}, which this pilot cannot tell (see “Trips abroad and loss of residence”).`,
      );
    return L(
      `你持有的欧盟长期居留可能已因 ${tripText(e)} 的出境失效：这段时间若都在欧盟以外，许可在 ${e.euBy} 之后失效（§ 51 Abs. 9 Satz 1 Nr. 3），在其他欧盟国家的不失效，试点无法判断（见"出境与居留失效"）。`,
      `Your EU long-term residence may have lapsed on the trip ${tripText(e)}: if all of that time was outside the EU it lapsed after ${e.euBy} (§ 51 Abs. 9 Satz 1 Nr. 3); time in other EU countries does not count against it, which this pilot cannot tell (see “Trips abroad and loss of residence”).`,
    );
  };
  /** A date that holds only if no trip that may have ended a title did. */
  const lapseText = (d: IsoDate) =>
    L(
      `${doubtful.map(tripText).join('、')} 的出境是否使许可失效，试点无法判断（见"出境与居留失效"）；确定的日期按已失效计，未失效的话，最早 ${d}。`,
      ` Whether the trip ${doubtful.map(tripText).join(', ')} ended your title cannot be told (see “Trips abroad and loss of residence”); certain dates take it as ended, and if it did not, it could be ${d}.`,
    );
  const doubtCheck = (k: number): PilotCheck => ({
    text: L(
      '模拟日所持的欧盟长期居留仍有效（离开欧盟的期间未超过期限）',
      'The EU long-term residence you hold is still valid on the simulation date (time outside the EU within the limit)',
    ),
    met: doubt[k] ? undefined : true,
    sources: [...v.euLapseMonths.sources, ...v.euLapseBlueCardMonths.sources],
  });

  /**
   * Half days counted each day towards a holding period (`weight`: 2 in
   * full, 1 at half, 0 breaks it) and the first day of the unbroken stretch
   * each day belongs to (-1 = broken). A trip that ended the title breaks
   * the stretch; days abroad on other trips count while `abroad` allows.
   */
  const count = (
    weight: (k: DePermitKind) => number,
    abroad: (n: number, i: number) => boolean,
    /** Take trips that may have ended the title as having ended it. */
    lapsed = false,
  ) => {
    const run = new Array<number>(days.count).fill(-1);
    const sums = [0];
    for (let i = 0; i < days.count; i++) {
      const k = kinds[i];
      const n = tripOn[i];
      const w = k ? weight(k) : 0;
      const e = n >= 0 ? exits[n] : undefined;
      const broken =
        w === 0 ||
        !!e?.lapses ||
        (lapsed && ((!!e && doubtful.includes(e)) || doubt[i]));
      if (!broken) run[i] = i > 0 && run[i - 1] >= 0 ? run[i - 1] : i;
      sums.push(sums[i] + (broken || (n >= 0 && !abroad(n, i)) ? 0 : w));
    }
    return { run, sums };
  };
  type Count = ReturnType<typeof count>;
  /** The latest start of a stretch ending the day before `k` worth `need`. */
  const stretch = (c: Count, k: number, need: number) => {
    const r = c.run[k - 1];
    if (r < 0 || c.sums[k] - c.sums[r] < need) return undefined;
    let lo = r;
    let hi = k - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (c.sums[k] - c.sums[mid] >= need) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };
  // § 9 Abs. 4 Nr. 2: each trip that did not end the title counts for at
  // most 6 months.
  const creditUntil = req.trips.map((t) =>
    addMonths(t.departed, v.abroadCreditMonths.value),
  );
  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  // Met on the simulation date only under an uncertain reading: unknown,
  // even when a later date is certain.
  const statusOf = (earliest?: IsoDate, possible?: IsoDate): PilotStatus =>
    earliest === sim
      ? 'MET'
      : possible && (possible === sim || !earliest)
        ? 'UNKNOWN'
        : earliest
          ? 'FUTURE'
          : 'NOT_MET';
  const dateOf = (status: PilotStatus, earliest?: IsoDate) =>
    status === 'MET' || status === 'FUTURE' ? earliest : undefined;
  const held = kindAt(days.index(sim));
  const projection = L(
    '最早日期假设模拟日之后一直在德国（已录入的未来出境除外）。新许可生效时之前的许可即结束（不论卡上的到期日）；没有到期日的许可一直延续到下一张许可生效。',
    'Projected dates assume you stay in Germany after the simulation date (apart from trips you entered). A new permit ends the one before it, whatever that card’s expiry date; a permit without an end date lasts until the next one starts.',
  );
  const counting = L(
    '年限按日历计：从许可生效日（在首次入境前生效的，从首次入境日）起算，到对应的周年日（或月份对应日）满足；若起点当天不计入，晚 1 天（BGB § 187，PD-120）。出入境当天按在德国计。',
    'Periods are calendar periods: counted from the day a permit starts (or your first arrival, if later) and met on the anniversary (or the same day of the month); if the first day does not count, it is one day later (BGB § 187, PD-120). The days you leave and come back count as days in Germany.',
  );
  const gaps = L(
    '录入的许可之间有空档即中断（§ 85 允许不计 1 年以内的中断，属裁量，PD-124）。到期前已申请续期的请勾选"到期前已申请续期"：录入了续期后的新许可，等待期间照常计入；还在等待决定的，定居许可与欧盟长期居留依赖等待期间的结果为待确认，入籍则按合法居留计入（§ 81 Abs. 4，PD-124）。',
    'Any gap between the permits you entered breaks continuity (§ 85 lets gaps of up to a year be disregarded at discretion, PD-124). If you applied to renew before expiry, tick “Renewal or a new permit applied for before it ran out”: once the new permit is entered the wait counts; while the decision is pending, settlement and EU long-term results that rely on the wait are uncertain, while for naturalisation it counts as lawful residence (§ 81 Abs. 4, PD-124).',
  );
  /** The reason a date relies on a renewal still being decided. */
  const pendingText = (possible: IsoDate) =>
    L(
      `你的许可到期后正在等待续期决定（§ 81 Abs. 4 视为继续有效），这段时间能否计入取决于续期获批；获批的话，最早 ${possible}（PD-124）。`,
      ` Your permit ran out while a renewal is being decided (it continues meanwhile, § 81 Abs. 4), and whether that time counts depends on the renewal being granted; if it is, it could be ${possible} (PD-124).`,
    );
  const lapse = L(
    '导致许可失效的出境（§ 51，见"出境与居留失效"）使计时归零；失效后要等录入的下一张许可生效才重新起算。',
    'A trip that ended your title (§ 51, see “Trips abroad and loss of residence”) resets the count, which starts again only when the next permit you entered begins.',
  );
  const pathways: DePathway[] = [];

  // ---------- Niederlassungserlaubnis ----------
  {
    const route = req.settlementRoute;
    const rule = settlementRule(req);
    const routeName = N(ROUTE_NAMES[route]);
    const settleWeight = (k: DePermitKind) =>
      rule.full.includes(k) ? 2 : rule.half.includes(k) ? 1 : 0;
    const settleAbroad = (n: number, i: number) =>
      days.date(i) <= creditUntil[n];
    // Certain: a trip that may have ended the title did; a later date when
    // it did not is shown separately.
    const c = count(settleWeight, settleAbroad, true);
    const notLapsed = doubtful.length ? count(settleWeight, settleAbroad) : c;
    // § 9 Abs. 4 Nr. 1: when a settlement permit lapsed abroad, the time
    // held before, less that time abroad (AVwV 9.4.1.3), counts for up to
    // 4 years (365 days each, BGB § 191) once you hold a permit again.
    const bonusOf = (c: Count) => {
      const bonus = new Map<number, number>();
      if (route !== 'general') return bonus;
      for (const e of exits) {
        if (!e?.lapses || e.kind !== 'settlement') continue;
        const dep = days.index(e.trip.departed);
        const abroad = daysBetween(e.trip.departed, e.trip.returned) - 1;
        let i = days.index(e.trip.returned);
        while (i < days.count && c.run[i] !== i) i++;
        bonus.set(
          i,
          Math.max(
            0,
            Math.min(
              2 * v.priorSettlementCreditYears.value * v.daysPerYear.value,
              c.sums[dep + 1] - c.sums[c.run[dep]] - 2 * abroad,
            ),
          ),
        );
      }
      return bonus;
    };
    // § 16b Abs. 4 Satz 2: no § 9 while studying. § 16a Abs. 1 Satz 3: none
    // in in-company training either, unless you held a § 18a or § 18b permit
    // before it; school-based training (Abs. 2) and some temporary permits
    // differ, so those are uncertain (PD-122).
    const holds = (k: number): Verdict => {
      const kd = kinds[k];
      if (!kd) return 'no';
      if (rule.hold.includes(kd))
        return doubt[k] || pending[k] ? 'maybe' : 'yes';
      if (route !== 'general') return 'no';
      if (kd === 'temporary') return 'maybe';
      if (kd !== 'training') return 'no';
      const since = req.permits
        .filter((p) => p.kind === 'training' && p.from <= days.date(k))
        .map((p) => p.from)
        .sort()
        .at(-1);
      return req.permits.some(
        (p) => p.kind === 'skilled' && !!since && p.from < since,
      ) &&
        !doubt[k] &&
        !pending[k]
        ? 'yes'
        : 'maybe';
    };
    const timeWith = (c: Count) => {
      const bonus = bonusOf(c);
      return (d: IsoDate): Verdict => {
        const k = days.index(d);
        if (k < 1 || c.run[k] < 0) return 'no';
        const h = holds(k);
        // On a Blue Card only holding it is timed; the months come from the
        // employment you entered.
        if (route === 'blue-card' || h === 'no') return h;
        const r = c.run[k - 1];
        if (r < 0) return 'no';
        const have = c.sums[k] - c.sums[r] + (bonus.get(r) ?? 0);
        return have >= 2 * daysBetween(addYears(d, -rule.years), d) ? h : 'no';
      };
    };
    const sureTime = timeWith(c);
    const ifNotLapsed = notLapsed === c ? sureTime : timeWith(notLapsed);
    /** Met only if a trip that may have ended the title did not. */
    const needsNoLapse = (d: IsoDate) =>
      sureTime(d) === 'no' && ifNotLapsed(d) !== 'no';
    const time = (d: IsoDate): Verdict =>
      needsNoLapse(d) ? 'maybe' : sureTime(d);
    const need = rule.months;
    const entered =
      route === 'blue-card'
        ? req.blueCardEmploymentMonths
        : req.contributionMonths;
    // The months are assumed to continue every month after the simulation
    // date; Blue Card employment only while holding the card, from the start
    // of the unbroken Blue Card stretch if that is later (§ 18c Abs. 2).
    const countedBy = (d: IsoDate): IsoDate | undefined => {
      if (need === undefined || entered === undefined) return undefined;
      const r = route === 'blue-card' ? c.run[days.index(d)] : -1;
      const from = r >= 0 && days.date(r) > sim ? days.date(r) : sim;
      return addMonths(from, Math.max(0, need - entered));
    };
    const missing = need !== undefined && entered === undefined;
    const ok = (d: IsoDate, accept: Verdict[]) => {
      const by = countedBy(d);
      return accept.includes(time(d)) && (!by || d >= by);
    };
    const timeEarliest = firstDate((d) => time(d) !== 'no');
    const earliest = missing ? undefined : firstDate((d) => ok(d, ['yes']));
    const possible = missing
      ? undefined
      : firstDate((d) => ok(d, ['yes', 'maybe']));
    /** Why a settlement date is met only on an uncertain reading. */
    const reason = (d: IsoDate) => {
      const k = days.index(d);
      return doubt[k]
        ? `${L('', ' ')}${doubtText(k)}${L(`仍有效的话，最早 ${d}。`, ` If it is still valid, it could be ${d}.`)}`
        : needsNoLapse(d)
          ? lapseText(d)
          : pending[k]
            ? pendingText(d)
            : L(
                `若你当时所持的许可不排除定居许可（如学校职业培训 § 16a Abs. 2；企业内培训、§ 16d、§ 16f、§ 20a 等排除），最早 ${d}（PD-122）。`,
                ` If the permit you hold then does not rule out a settlement permit (school-based training under § 16a Abs. 2 does not; in-company training, § 16d, § 16f, § 20a and others do), it could be ${d} (PD-122).`,
              );
    };
    const status: PilotStatus = missing
      ? timeEarliest
        ? 'UNKNOWN'
        : 'NOT_MET'
      : statusOf(earliest, possible);
    const length =
      route === 'blue-card'
        ? L('持有欧盟蓝卡', 'holding an EU Blue Card')
        : L(`${rule.years} 年`, `${rule.years} years`);
    const counted =
      route === 'blue-card'
        ? L(
            `符合 § 18g 条件就业并缴费的月数（需 ${need} 个月）`,
            `your months of employment meeting the § 18g criteria with contributions (${need} needed)`,
          )
        : L(
            `已缴的养老保险月数（需 ${need} 个月）`,
            `your months of pension contributions (${need} needed)`,
          );
    const now = time(sim);
    const notChecked: Record<DeSettlementRoute, string> = {
      general: L(
        '生计、德语 B1、法律与社会知识（入籍课程）、住房、公共安全、就业许可（§ 9 Abs. 2 Satz 1 Nr. 2、4–9）；育儿或居家护理的中断折算缴费月、夫妻一方满足缴费（Nr. 3、§ 9 Abs. 3）',
        'Livelihood, German at B1, knowledge of the legal and social order, housing, public safety and permission to work (§ 9 Abs. 2 Satz 1 Nr. 2, 4–9); counting breaks for childcare or home care towards contributions, and one spouse meeting them for both (Nr. 3, § 9 Abs. 3)',
      ),
      skilled: L(
        '有符合 §§ 18a、18b、18d、18g 的工作岗位，德语 B1，生计、住房、公共安全等（§ 18c Abs. 1 Satz 1 Nr. 2、4、5）；是否在德完成职业培训或学业按你的勾选',
        'A job that fits §§ 18a, 18b, 18d or 18g, German at B1, livelihood, housing, public safety and so on (§ 18c Abs. 1 Satz 1 Nr. 2, 4, 5); whether you completed training or a degree in Germany is taken from your answer',
      ),
      'blue-card': L(
        '所填月数是否都符合 § 18g 的条件（薪资门槛等）且同期缴费，基本德语（A1；勾选 B1 时按较短期限），生计、住房、公共安全等（§ 18c Abs. 2）',
        'Whether the months you entered all met the § 18g criteria (salary threshold and so on) with contributions for them, basic German (A1; the shorter period with B1 as you answered), livelihood, housing, public safety and so on (§ 18c Abs. 2)',
      ),
      'german-family': L(
        '与德国人的家庭共同生活在德国持续、没有驱逐利益、德语 B1（§ 28 Abs. 2 Satz 1）',
        'That family life with the German continues in Germany, no interest in expulsion, and German at B1 (§ 28 Abs. 2 Satz 1)',
      ),
      refugee: L(
        'BAMF 未通知撤销保护、生计大部分有保障、德语 A2（3 年路径须 C1 并且生计基本有保障，C1 按你的勾选）以及 § 9 Abs. 2 Satz 1 Nr. 4–6、8、9（§ 26 Abs. 3）；辅助保护与其他人道类居留（§ 26 Abs. 4，裁量）不在本路径',
        'BAMF not reporting grounds to withdraw protection, livelihood mostly secured, German at A2 (C1 and livelihood largely secured for the 3-year route; C1 is taken from your answer), and § 9 Abs. 2 Satz 1 Nr. 4–6, 8, 9 (§ 26 Abs. 3); subsidiary protection and other humanitarian permits (§ 26 Abs. 4, at discretion) are not this route',
      ),
    };
    const checks: PilotCheck[] = [
      {
        text:
          route === 'blue-card'
            ? L(rule.what[0], rule.what[1])
            : L(
                `${rule.what[0]}，当天仍持有可申请的许可`,
                `${rule.what[1]}, still holding a permit you can apply on`,
              ),
        met: now === 'yes' ? true : now === 'maybe' ? undefined : false,
        sources: rule.sources,
      },
    ];
    if (need !== undefined)
      checks.push({
        text:
          route === 'blue-card'
            ? entered === undefined
              ? L(
                  `符合 § 18g 条件就业并缴费满 ${need} 个月（未填写月数）`,
                  `${need} months of employment meeting the § 18g criteria with contributions (not entered)`,
                )
              : L(
                  `符合 § 18g 条件就业并缴费满 ${need} 个月（已填 ${entered} 个月）`,
                  `${need} months of employment meeting the § 18g criteria with contributions (${entered} entered)`,
                )
            : entered === undefined
              ? L(
                  `养老保险缴费满 ${need} 个月（未填写缴费月数）`,
                  `${need} months of pension contributions (not entered)`,
                )
              : L(
                  `养老保险缴费满 ${need} 个月（已缴 ${entered} 个月）`,
                  `${need} months of pension contributions (${entered} paid)`,
                ),
        met: entered === undefined ? undefined : entered >= need,
        sources:
          route === 'general'
            ? v.generalContributionMonths.sources
            : route === 'skilled'
              ? req.trainedInGermany
                ? v.skilledTrainedContributionMonths.sources
                : v.skilledContributionMonths.sources
              : [
                  ...rule.sources,
                  { srcId: 'SRC-107', locator: 'Nr. 18c.2.1.3 (p117–p118)' },
                ],
      });
    const assumptions = [
      counting,
      route === 'general' || route === 'refugee'
        ? L(
            `学习或职业培训期间按一半计（§ 9 Abs. 4 Nr. 3，按半天精确折算，PD-121）；未导致许可失效的每次出境最多计 ${v.abroadCreditMonths.value} 个月（§ 9 Abs. 4 Nr. 2）。`,
            `Study or vocational training counts at half (§ 9 Abs. 4 Nr. 3, worked out in half days, PD-121); each trip abroad that did not end your permit counts for at most ${v.abroadCreditMonths.value} months (§ 9 Abs. 4 Nr. 2).`,
          )
        : route === 'blue-card'
          ? L(
              `就业月数按你填写的截至模拟日、符合 § 18g 条件并缴费的月数（按柏林外国人管理局的说明，也包括持其他许可期间的这类就业，联邦条文未明，PD-123）；之后只在持蓝卡期间按每月 1 个月累计（其他许可下的就业将来是否符合 § 18g 无法判断），假设一直以蓝卡就业并缴费；中间有失业或换雇主空档的，空档前后的月数能否合计未明（PD-123）。递交当天须仍持蓝卡。${req.germanB1 ? '按你勾选的 B1 德语用较短期限。' : ''}`,
              `Employment months are the months meeting the § 18g criteria with contributions that you entered for the simulation date (following the Berlin immigration office, these include such employment under another permit; the federal text does not say, PD-123). After it a month is added only for each month on the Blue Card, since whether future work on another permit meets § 18g cannot be told, assuming you stay employed with contributions. Whether months either side of a gap between jobs add up is not settled (PD-123). You must still hold the Blue Card when applying.${req.germanB1 ? ' The shorter period follows your answer that you have German at B1.' : ''}`,
            )
          : L(
              `该路径的条文没有引用 § 9 Abs. 4：学习期间不计，每次出境按 § 9 Abs. 4 Nr. 2 类推最多计 ${v.abroadCreditMonths.value} 个月（PD-122）。`,
              `This route does not refer to § 9 Abs. 4: study does not count, and each trip abroad counts for at most ${v.abroadCreditMonths.value} months by analogy with § 9 Abs. 4 Nr. 2 (PD-122).`,
            ),
      lapse,
      gaps,
      L(
        '入境用的国家签证按其目的录入为同类许可，入境后的期间计入（§ 6 Abs. 3 Satz 3）。',
        'A national visa entered as the permit it was issued for counts from your arrival (§ 6 Abs. 3 Satz 3).',
      ),
    ];
    if (route === 'general')
      assumptions.push(
        L(
          `出境时持定居许可而失效的，此前持许可的时间减去那次出境的时间后最多计 ${v.priorSettlementCreditYears.value} 年（§ 9 Abs. 4 Nr. 1，AVwV 9.4.1.3，每年按 ${v.daysPerYear.value} 天，PD-121）。持学习许可（§ 16b）时不能取得；持职业培训许可（§ 16a）的，只有此前持过技术工人许可才能取得，持临时目的许可的另看具体条款；持第 5 节人道许可（含庇护、难民、辅助保护）的，定居许可按 § 26 办理，不走本路径（PD-122）。`,
          `If a settlement permit lapsed abroad, the time held before, less the time abroad that ended it, counts for up to ${v.priorSettlementCreditYears.value} years (§ 9 Abs. 4 Nr. 1, AVwV 9.4.1.3, ${v.daysPerYear.value} days a year, PD-121). You cannot get it on a study permit (§ 16b); on a vocational training permit (§ 16a) only if you held a skilled worker permit before, and on a permit for a temporary purpose it depends on the section; with a Section 5 humanitarian permit (asylum, refugee and subsidiary protection included) the settlement permit is under § 26, not this route (PD-122).`,
        ),
      );
    if (route === 'refugee')
      assumptions.push(
        L(
          '庇护程序期间从你录入的"庇护程序中"开始日计；按欧盟程序条例，提出、登记、正式递交哪一天算申请未核实（PD-126）。',
          'The asylum procedure counts from the start date you entered for it; which of making, registering or lodging the claim counts under the EU procedures regulation is not settled (PD-126).',
        ),
      );
    if (route === 'general' || route === 'skilled')
      assumptions.push(
        L(
          '缴费月数按你填写的截至模拟日的数字，之后假设每月都缴费。',
          'Contribution months are the number you entered for the simulation date; after it every month is assumed to be paid.',
        ),
      );
    assumptions.push(projection);
    const title = L(
      '定居许可（Niederlassungserlaubnis）',
      'Settlement permit (Niederlassungserlaubnis)',
    );
    const simIndex = days.index(sim);
    if (held === 'eu-long-term' && doubt[simIndex])
      pathways.push({
        id: 'DE-SETTLEMENT',
        title,
        status: 'UNKNOWN',
        summary:
          doubtText(simIndex) +
          L(
            '仍有效的话，它可以与定居许可并持，本试点不计算并持的情形；已失效的话，须重新取得居留许可后再计时。',
            ' If it is still valid it can be held together with a settlement permit, which this pilot does not work out; if it has lapsed, the count starts again with a new residence permit.',
          ),
        checks: [doubtCheck(simIndex)],
        notChecked: [],
        assumptions: [],
      });
    else if (held === 'settlement' || held === 'eu-long-term')
      pathways.push({
        id: 'DE-SETTLEMENT',
        title,
        status: 'NOT_APPLICABLE',
        summary:
          held === 'settlement'
            ? L(
                '模拟日你已持有定居许可。',
                'You already hold a settlement permit on the simulation date.',
              )
            : L(
                '模拟日你持有欧盟长期居留。它可以与定居许可并持，两者的出境失效规则不同（§ 51 Abs. 1 Nr. 7 与 Abs. 9），本试点不计算并持的情形。',
                'You hold EU long-term residence on the simulation date. It can be held together with a settlement permit, and the two lapse differently on trips abroad (§ 51 Abs. 1 Nr. 7 and Abs. 9); this pilot does not work out holding both.',
              ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    // Section 5 permits settle under § 26 (Abs. 3 for asylum and refugee
    // status, otherwise Abs. 4 at discretion), not under § 9 (PD-122).
    else if (route === 'general' && held && SECTION_5.includes(held))
      pathways.push({
        id: 'DE-SETTLEMENT',
        title,
        status: 'NOT_APPLICABLE',
        summary:
          held === 'protection'
            ? L(
                '模拟日你持有庇护或难民许可（第 5 节）。这类许可的定居许可按 § 26 办理，不适用一般路径 § 9：请改选"庇护权人或难民"路径（§ 26 Abs. 3）。',
                'You hold asylum or refugee status (Section 5) on the simulation date. Its settlement permit is under § 26, not the general route § 9: choose the asylum and refugee route (§ 26 Abs. 3) instead.',
              )
            : L(
                `模拟日你持有${N(KIND_NAMES[held])}（第 5 节）。这类许可的定居许可按 § 26 Abs. 4 办理（属裁量，本试点不计算），不适用一般路径 § 9。`,
                `You hold ${N(KIND_NAMES[held])} (Section 5) on the simulation date. Its settlement permit is under § 26 Abs. 4 (at discretion, not worked out by this pilot), not the general route § 9.`,
              ),
        checks: [
          {
            text: L(
              '模拟日所持许可不属于第 5 节（人道居留）',
              'The permit held on the simulation date is not under Section 5 (humanitarian)',
            ),
            met: false,
            sources: [aufenthG('§ 26 Abs. 3 Satz 1, Abs. 4 Satz 1', '26')],
          },
        ],
        notChecked: [],
        assumptions: [],
        pendingDetails: ['PD-122'],
      });
    else
      pathways.push({
        id: 'DE-SETTLEMENT',
        title,
        status,
        earliestDate: dateOf(status, earliest),
        summary: missing
          ? timeEarliest
            ? time(timeEarliest) === 'maybe'
              ? L(
                  `按${routeName}，${length}的条件只在下述待确认的情形下满足；请同时填写${counted}。`,
                  `On ${routeName}, ${route === 'blue-card' ? 'holding the Blue Card' : `the ${length} held`} is met only in the uncertain case below; enter ${counted} as well.`,
                ) + reason(timeEarliest)
              : L(
                  `按${routeName}，${length}的条件最早 ${timeEarliest} 满足；请填写${counted}，才能确认。`,
                  `On ${routeName}, ${route === 'blue-card' ? 'holding the Blue Card' : `the ${length} held`} is met from ${timeEarliest}; enter ${counted} to confirm the date.`,
                )
            : L(
                `按${routeName}和现有记录，10 年内达不到${length}的条件；月数也未填写。`,
                `On ${routeName}, with your record ${route === 'blue-card' ? 'you will not hold a Blue Card' : `the time held will not reach ${length}`} within 10 years; the months were not entered either.`,
              )
          : (earliest === sim
              ? L(
                  `按${routeName}，模拟日已满足定居许可的时间条件。`,
                  `On ${routeName}, you meet the time requirements for a settlement permit on the simulation date.`,
                )
              : earliest
                ? L(
                    `按${routeName}，确定满足定居许可时间条件的最早日期是 ${earliest}${countedBy(earliest) === earliest && earliest !== timeEarliest ? '（由所填月数决定）' : ''}。`,
                    `On ${routeName}, the earliest date that certainly meets the time requirements for a settlement permit is ${earliest}${countedBy(earliest) === earliest && earliest !== timeEarliest ? ' (set by the months you entered)' : ''}.`,
                  )
                : possible
                  ? L(
                      `按${routeName}，只在下述待确认的读法下满足定居许可的时间条件。`,
                      `On ${routeName}, the time requirements for a settlement permit are met only on the uncertain reading below.`,
                    )
                  : L(
                      `按${routeName}和现有记录，10 年内达不到定居许可的时间条件。`,
                      `On ${routeName}, with your record you will not meet the time requirements for a settlement permit within 10 years.`,
                    )) +
            (possible && (!earliest || possible < earliest)
              ? reason(possible)
              : ''),
        checks,
        notChecked: [
          notChecked[route],
          L(
            '其他路径：§ 18c 定居者的配偶（§ 9 Abs. 3a）、自雇（§ 21 Abs. 4）、子女（§ 35）、公务员（§ 19c Abs. 4）、高素质人才（§ 18c Abs. 3）',
            'Other routes: spouses of § 18c settlement permit holders (§ 9 Abs. 3a), the self-employed (§ 21 Abs. 4), children (§ 35), civil servants (§ 19c Abs. 4) and highly qualified people (§ 18c Abs. 3)',
          ),
        ],
        assumptions,
        pendingDetails: [
          'PD-120',
          ...(route === 'general' || route === 'refugee'
            ? ['PD-121', 'PD-122']
            : ['PD-122']),
          ...(route === 'blue-card' ? ['PD-123'] : []),
          'PD-124',
          ...(route === 'refugee' ? ['PD-126'] : []),
        ],
      });
  }

  // ---------- Daueraufenthalt-EU (§§ 9a, 9b) ----------
  {
    const years = v.euLongTermYears.value;
    // Up to 10 months of 30 days (BGB § 191) all count; up to the most days
    // 10 calendar months can span only on the generous reading (PD-125).
    const totalMin = v.euTotalAbsenceMonths.value * v.daysPerMonth.value;
    const totalMax = monthSpan(v.euTotalAbsenceMonths.value)[1];
    // Study and vocational training count at half (§ 9b Abs. 1 Nr. 4);
    // temporary purposes do not count (Satz 2); the asylum procedure counts
    // once international protection was granted (Nr. 5). Whether other
    // humanitarian time (such as § 24 temporary protection) counts is not
    // stated (§ 9a Abs. 3 Nr. 1 only bars applying): certain without it,
    // possible with it (PD-122).
    const weight = (humanitarian: number) => (k: DePermitKind) =>
      k === 'study' || k === 'training'
        ? 1
        : k === 'temporary'
          ? 0
          : k === 'humanitarian'
            ? humanitarian
            : k === 'asylum'
              ? recognised
                ? 2
                : 0
              : 2;
    const short = req.trips.map(
      (t) => t.returned <= addMonths(t.departed, v.euSingleAbsenceMonths.value),
    );
    // Short trips count; other trips that did not end the title pause the
    // count (§ 9b Abs. 1 Satz 3).
    const reading = (humanitarian: number, lapsed: boolean) => ({
      withTrips: count(weight(humanitarian), (n) => short[n], lapsed),
      paused: count(weight(humanitarian), () => false, lapsed),
    });
    // Certain: no humanitarian time, and a trip that may have ended the title
    // did.
    const strict = reading(0, true);
    const hasHumanitarian = req.permits.some((p) => p.kind === 'humanitarian');
    const notLapsed = doubtful.length ? reading(0, false) : strict;
    const generous =
      hasHumanitarian || doubtful.length ? reading(2, false) : strict;
    const shortAway = days.sums((i) => tripOn[i] >= 0 && short[tripOn[i]]);
    const judge = (r: typeof strict, d: IsoDate): Verdict => {
      const k = days.index(d);
      const kd = kinds[k];
      // You cannot apply on a study, training, temporary or humanitarian
      // permit (§ 9a Abs. 3 Nr. 1, 4, 5).
      if (k < 1 || !kd || !TITLES.includes(kd) || r.withTrips.run[k] < 0)
        return 'no';
      const need = 2 * daysBetween(addYears(d, -years), d);
      const start = stretch(r.withTrips, k, need);
      const absent = start === undefined ? 0 : shortAway[k] - shortAway[start];
      if (
        stretch(r.paused, k, need) !== undefined ||
        (start !== undefined && absent <= totalMin)
      )
        return 'yes';
      return start !== undefined && absent <= totalMax ? 'maybe' : 'no';
    };
    const verdict = (d: IsoDate): Verdict => {
      const sure = judge(strict, d);
      return sure === 'yes'
        ? pending[days.index(d)]
          ? 'maybe'
          : 'yes'
        : sure === 'maybe' || judge(generous, d) !== 'no'
          ? 'maybe'
          : 'no';
    };
    const already = held === 'eu-long-term';
    const simIndex = days.index(sim);
    // Holding it on the simulation date depends on where a trip was spent.
    const unsureHeld = already && doubt[simIndex];
    // § 9a Abs. 3 Nr. 1: not while holding another humanitarian permit.
    const humanitarian = held === 'humanitarian';
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const status = unsureHeld
      ? 'UNKNOWN'
      : already || humanitarian
        ? 'NOT_APPLICABLE'
        : statusOf(earliest, possible);
    const now = verdict(sim);
    pathways.push({
      id: 'DE-EU-LONG-TERM',
      title: L(
        '欧盟长期居留（Daueraufenthalt-EU）',
        'EU long-term residence (Daueraufenthalt-EU)',
      ),
      status,
      earliestDate: dateOf(status, earliest),
      summary: unsureHeld
        ? doubtText(simIndex) +
          L(
            '仍有效的话不需要再申请；已失效的话，须重新取得居留许可后再计时。',
            ' If it is still valid there is nothing to apply for; if it has lapsed, the count starts again with a new residence permit.',
          )
        : already
          ? L(
              '模拟日你已持有欧盟长期居留。',
              'You already hold EU long-term residence on the simulation date.',
            )
          : humanitarian
            ? L(
                '模拟日你持有人道居留许可（第 5 节）：持这类许可时不能取得欧盟长期居留（§ 9a Abs. 3 Nr. 1），获国际保护的除外。',
                'You hold a humanitarian residence permit (Section 5) on the simulation date: EU long-term residence cannot be granted while you hold one (§ 9a Abs. 3 Nr. 1), unless you have international protection.',
              )
            : (earliest === sim
                ? L(
                    '模拟日递交已满足欧盟长期居留的时间条件。',
                    'Applying on the simulation date meets the time requirements for EU long-term residence.',
                  )
                : earliest
                  ? L(
                      `确定满足欧盟长期居留时间条件的最早递交日是 ${earliest}。`,
                      `The earliest application date that certainly meets the time requirements for EU long-term residence is ${earliest}.`,
                    )
                  : possible
                    ? L(
                        '只在下述待确认的读法下满足欧盟长期居留的时间条件。',
                        'The time requirements for EU long-term residence are met only on the uncertain reading below.',
                      )
                    : L(
                        '按现有记录，10 年内达不到欧盟长期居留的时间条件。',
                        'With your record you will not meet the time requirements for EU long-term residence within 10 years.',
                      )) +
              (possible && (!earliest || possible < earliest)
                ? pending[days.index(possible)]
                  ? pendingText(possible) +
                    (judge(strict, possible) === 'no'
                      ? L(
                          '同时还须"其他人道居留许可"的期间（如 § 24 临时保护）也计入 5 年，条文没有写明（PD-122）。',
                          ' It also needs time on another humanitarian permit (such as § 24 temporary protection) to count towards the 5 years, which the law does not state (PD-122).',
                        )
                      : judge(strict, possible) === 'maybe'
                        ? L(
                            `同时还须出境合计按 ${v.euTotalAbsenceMonths.value} 个月的较宽口径全部计入（PD-125）。`,
                            ` It also needs all of your absences to count under a generous reading of the ${v.euTotalAbsenceMonths.value} months (PD-125).`,
                          )
                        : '')
                  : judge(strict, possible) === 'no' &&
                      notLapsed !== strict &&
                      judge(notLapsed, possible) !== 'no'
                    ? lapseText(possible)
                    : judge(strict, possible) === 'no'
                      ? L(
                          `若"其他人道居留许可"的期间（如 § 24 临时保护）也计入 5 年，最早 ${possible}；这类期间能否计入，条文没有写明（§ 9a Abs. 3 Nr. 1 只规定持有时不能申请，PD-122）。`,
                          ` If time on another humanitarian permit (such as § 24 temporary protection) also counts towards the 5 years, it could be ${possible}; the law does not say whether it does (§ 9a Abs. 3 Nr. 1 only bars applying while holding one, PD-122).`,
                        )
                      : L(
                          `若出境合计按 ${v.euTotalAbsenceMonths.value} 个月的较宽口径全部计入，最早 ${possible}；超过上限时怎样扣除，条文未写明（PD-125）。`,
                          ` Counting all of your absences under a generous reading of the ${v.euTotalAbsenceMonths.value} months, it could be ${possible}; how time over the limit is taken off is not stated (PD-125).`,
                        )
                : ''),
      checks: unsureHeld
        ? [doubtCheck(simIndex)]
        : humanitarian
          ? [
              {
                text: L(
                  '模拟日所持许可不是第 5 节的人道居留许可（国际保护除外）',
                  'The permit held on the simulation date is not a Section 5 humanitarian permit (international protection aside)',
                ),
                met: false,
                sources: [aufenthG('§ 9a Abs. 3 Nr. 1', '9a')],
              },
            ]
          : already
            ? []
            : [
                {
                  text: L(
                    `折算后在德持居留许可满 ${years} 年（学习或职业培训期间折半，临时目的与其他人道居留的期间不计；单次不超过 ${v.euSingleAbsenceMonths.value} 个月、合计不超过 ${v.euTotalAbsenceMonths.value} 个月的出境计入），递交当天持长期目的的许可`,
                    `${years} years in Germany with a residence title (study or vocational training at half, temporary purposes and other humanitarian time not counted; absences of up to ${v.euSingleAbsenceMonths.value} months each and ${v.euTotalAbsenceMonths.value} months in all count), holding a permit for a lasting purpose on the application day`,
                  ),
                  met:
                    now === 'yes' ? true : now === 'maybe' ? undefined : false,
                  sources: [
                    ...v.euLongTermYears.sources,
                    ...v.euSingleAbsenceMonths.sources,
                    aufenthG(
                      '§ 9b Abs. 1 Satz 1 Nr. 4, Nr. 5, Satz 2, Satz 3, Satz 4',
                      '9b',
                    ),
                    aufenthG('§ 9a Abs. 3 Nr. 4, Nr. 5', '9a'),
                  ],
                },
              ],
      notChecked:
        already || humanitarian
          ? []
          : [
              L(
                '生计、德语 B1、法律与社会知识、住房、公共安全（§ 9a Abs. 2 Satz 1 Nr. 2–6）',
                'Livelihood, German at B1, knowledge of the legal and social order, housing and public safety (§ 9a Abs. 2 Satz 1 Nr. 2–6)',
              ),
              L(
                '因工作外派的出境（§ 9b Abs. 1 Satz 1 Nr. 1 a）、旧定居许可最多 4 年的折算（Nr. 2）、欧盟自由流动期间（Nr. 3），以及欧盟蓝卡持有人在其他成员国的期间与较宽的出境限度（§ 9b Abs. 2）',
                'Absences on a posting abroad for work (§ 9b Abs. 1 Satz 1 Nr. 1 a), up to 4 years of an earlier settlement permit (Nr. 2), time with EU free movement rights (Nr. 3), and Blue Card holders’ time in other member states with their wider absence limits (§ 9b Abs. 2)',
              ),
            ],
      assumptions:
        already || humanitarian
          ? []
          : [
              L(
                '以递交日判断（AVwV 9a.2.1.1.1），从递交日往回数，不含递交当天。',
                'Judged on the application date (AVwV 9a.2.1.1.1), counting back from it and not including it.',
              ),
              counting,
              L(
                `学习或职业培训期间按一半计（§ 9b Abs. 1 Nr. 4，按半天精确折算，PD-121）；临时目的的许可（如互惠生、求职）期间不计，持有时也不能申请（§ 9a Abs. 3 Nr. 5、§ 9b Abs. 1 Satz 2，PD-122）；其他人道居留许可（如 § 24 临时保护）持有时不能申请（§ 9a Abs. 3 Nr. 1），其期间能否计入没有写明，确定日期不计、计入后的日期另列（PD-122）；获国际保护（庇护、难民或辅助保护）的，从你录入的"庇护程序中"开始日全部计入（Nr. 5，PD-126）。`,
                `Study or vocational training counts at half (§ 9b Abs. 1 Nr. 4, worked out in half days, PD-121); time on a permit for a temporary purpose (such as au pair or job seeking) does not count, and you cannot apply while holding one (§ 9a Abs. 3 Nr. 5, § 9b Abs. 1 Satz 2, PD-122); you cannot apply on another humanitarian permit (such as § 24 temporary protection, § 9a Abs. 3 Nr. 1) and whether its time counts is not stated, so the certain date leaves it out and the date counting it is shown separately (PD-122); with international protection (asylum, refugee or subsidiary protection), the asylum procedure counts in full from the start date you entered (Nr. 5, PD-126).`,
              ),
              L(
                `单次出境按离境日起 ${v.euSingleAbsenceMonths.value} 个日历月判断；计入期间内这类出境合计不超过 ${totalMin} 天（BGB § 191 每月按 ${v.daysPerMonth.value} 天）算全部计入，否则按不计入（计时暂停、不中断）处理，${totalMin}–${totalMax} 天之间的较宽读法另列（PD-125）。更长但未导致失效的出境计时暂停（§ 9b Abs. 1 Satz 3）。`,
                `A single absence is measured as ${v.euSingleAbsenceMonths.value} calendar months from the day you left. If these absences total no more than ${totalMin} days in the counted period (${v.daysPerMonth.value}-day months, BGB § 191) they all count; otherwise they are treated as not counted (the count pauses but is not broken), with the generous reading for ${totalMin}–${totalMax} days shown separately (PD-125). Longer absences that did not end your title pause the count (§ 9b Abs. 1 Satz 3).`,
              ),
              lapse,
              gaps,
              projection,
            ],
      pendingDetails:
        already || humanitarian
          ? undefined
          : ['PD-120', 'PD-121', 'PD-122', 'PD-124', 'PD-125', 'PD-126'],
    });
  }

  // ---------- Einbürgerung (StAG §§ 9, 10, 12b) ----------
  {
    const route = req.naturalisationRoute;
    const years = v.naturalisationYears.value[route];
    // § 12b Abs. 1 Satz 5: more than half the years abroad (365-day years,
    // BGB § 191) within the years before ends habitual residence; it starts
    // again after the trip that went over (PD-127).
    const half = (years * v.daysPerYear.value) / 2;
    const away = days.sums((i) => tripOn[i] >= 0);
    const longTrip = req.trips.map(
      (t) =>
        t.returned > addMonths(t.departed, v.naturalisationAbsenceMonths.value),
    );
    // Lawful habitual residence: any title, the asylum procedure once
    // international protection was granted (AsylG § 55 Abs. 3). For each
    // unbroken stretch, the stretch before it (first and last day).
    const run = new Array<number>(days.count).fill(-1);
    const before = new Map<number, [number, number]>();
    let start = -1;
    let last: [number, number] = [0, -1];
    let cut = -1;
    for (let i = 0; i < days.count; i++) {
      const k = kinds[i];
      const n = tripOn[i];
      const lawful = !!k && (k !== 'asylum' || recognised);
      if (!lawful || (n >= 0 && (longTrip[n] || n === cut))) {
        if (start >= 0) last = [start, i - 1];
        start = -1;
        continue;
      }
      if (start < 0) {
        start = i;
        before.set(i, last);
      }
      const from = Math.max(
        start,
        days.index(addYears(days.date(i), -years)) + 1,
      );
      if (n >= 0 && away[i + 1] - away[from] > half) {
        cut = n;
        last = [start, i - 1];
        start = -1;
        continue;
      }
      run[i] = start;
    }
    // § 12b Abs. 2: residence before an interruption may be counted, up to
    // 3 years (2 for spouses, and only while married: AH-StAG Nr. 9.1
    // Rdn. 5), at discretion (PD-128).
    const cap = v.priorResidenceCreditYears.value[route] * v.daysPerYear.value;
    const marriedIndex =
      route === 'spouse' && req.marriedOn
        ? days.index(req.marriedOn)
        : undefined;
    const credit = (r: number) => {
      const [a, b] = before.get(r) ?? [0, -1];
      const from = marriedIndex === undefined ? a : Math.max(a, marriedIndex);
      return Math.min(cap, Math.max(0, b - from + 1));
    };
    // When naturalised you must hold a title not listed in § 10 Abs. 1
    // Satz 1 Nr. 2 (study, training, § 20 job seeking and others); whether
    // a temporary or other humanitarian permit is listed depends on its
    // section (§ 25 Abs. 3–5 is, § 25a and § 25b are not), and holding EU
    // long-term residence may be uncertain after a long trip.
    const holds = (k: number): Verdict => {
      const kd = kinds[k];
      return !kd
        ? 'no'
        : TITLES.includes(kd)
          ? doubt[k] || pending[k]
            ? 'maybe'
            : 'yes'
          : kd === 'temporary' || kd === 'humanitarian'
            ? 'maybe'
            : 'no';
    };
    const residence = (d: IsoDate): Verdict => {
      const k = days.index(d);
      if (k < 1 || run[k] < 0) return 'no';
      const h = holds(k);
      const r = run[k - 1];
      if (h === 'no' || r < 0) return 'no';
      const need = daysBetween(addYears(d, -years), d);
      if (k - r >= need) return h;
      return k - r + credit(r) >= need ? 'maybe' : 'no';
    };
    // Married for 2 years to someone German throughout them and on the day
    // (AH-StAG Nr. 9.1 Rdn. 6).
    const marriage =
      route === 'spouse' && req.marriedOn
        ? req.spouseGermanSince && req.spouseGermanSince > req.marriedOn
          ? req.spouseGermanSince
          : req.marriedOn
        : undefined;
    const marriedFrom =
      marriage && afterYears(marriage, v.spouseMarriageYears.value);
    const married = (d: IsoDate) =>
      route !== 'spouse' || (!!marriedFrom && d >= marriedFrom);
    const earliest = firstDate((d) => married(d) && residence(d) === 'yes');
    const possible = firstDate((d) => married(d) && residence(d) !== 'no');
    const status = statusOf(earliest, possible);
    const now = residence(sim);
    const turbo = v.turboAbolishedFrom.value;
    const fiveFrom = v.fiveYearsFrom.value;
    const asylum = req.permits.some((p) => p.kind === 'asylum');
    const unsureAt = possible ? days.index(possible) : -1;
    const why =
      unsureAt < 0 || (earliest && possible! >= earliest)
        ? undefined
        : doubt[unsureAt]
          ? 'doubt'
          : pending[unsureAt]
            ? 'pending'
            : kinds[unsureAt] === 'temporary' ||
                kinds[unsureAt] === 'humanitarian'
              ? 'temporary'
              : 'credit';
    const onTemporary = why === 'temporary';
    // The uncertain date may also rest on discretionary credit.
    const withCredit =
      why === 'doubt' &&
      unsureAt - run[unsureAt - 1] <
        daysBetween(addYears(possible!, -years), possible!);
    pathways.push({
      id: 'DE-NATURALISATION',
      title: L('入籍（Einbürgerung）', 'Naturalisation (Einbürgerung)'),
      status,
      earliestDate: dateOf(status, earliest),
      summary:
        (earliest === sim
          ? L(
              `模拟日已有 ${years} 年合法惯常居住。`,
              `You have ${years} years of lawful habitual residence on the simulation date.`,
            )
          : earliest
            ? L(
                `确定满足入籍时间条件的最早日期是 ${earliest}。`,
                `The earliest date that certainly meets the time requirements for naturalisation is ${earliest}.`,
              )
            : possible
              ? L(
                  '只在下述待确认的情形下满足入籍的时间条件。',
                  'The time requirements for naturalisation are met only in the uncertain case below.',
                )
              : L(
                  `按现有记录，10 年内达不到入籍的时间条件。`,
                  `With your record you will not meet the time requirements for naturalisation within 10 years.`,
                )) +
        (why === 'pending'
          ? L(
              `你的许可到期后正在等待续期决定：等待时间按合法居留计（§ 81 Abs. 4），但入籍当天只凭续期申请的延续效力，算不算持有 § 10 Abs. 1 Satz 1 Nr. 2 要求的许可有争议；模拟日之后的等待还要看申请仍在等待或续期获批。续期获批的话，最早 ${possible}（PD-124）。`,
              ` Your permit ran out while a renewal is being decided: the wait counts as lawful residence (§ 81 Abs. 4), but whether the continuing effect of the application alone counts as holding the permit § 10 Abs. 1 Satz 1 Nr. 2 requires on the day is disputed, and waiting time after the simulation date also depends on the application still pending or the renewal being granted. If the renewal is granted, it could be ${possible} (PD-124).`,
            )
          : why === 'doubt'
            ? `${L('', ' ')}${doubtText(unsureAt)}${
                withCredit
                  ? L(
                      `仍有效、且主管机关酌情把中断前的居住最多 ${v.priorResidenceCreditYears.value[route]} 年计入的话，最早 ${possible}（§ 12b Abs. 2，裁量，PD-128）。`,
                      ` If it is still valid and the authority uses its discretion to count up to ${v.priorResidenceCreditYears.value[route]} years of residence before the interruption, it could be ${possible} (§ 12b Abs. 2, PD-128).`,
                    )
                  : L(
                      `仍有效的话，最早 ${possible}。`,
                      ` If it is still valid, it could be ${possible}.`,
                    )
              }`
            : why
              ? onTemporary
                ? L(
                    `若你当时所持的许可不在 § 10 Abs. 1 Satz 1 Nr. 2 的清单内（§ 20 求职、§ 25 Abs. 3–5 在清单内，§ 25a、§ 25b 不在），最早 ${possible}（PD-122）。`,
                    ` If the permit you hold then is not on the list in § 10 Abs. 1 Satz 1 Nr. 2 (§ 20 job seeking and § 25 Abs. 3–5 are; § 25a and § 25b are not), it could be ${possible} (PD-122).`,
                  )
                : L(
                    `若主管机关酌情把中断前的居住最多 ${v.priorResidenceCreditYears.value[route]} 年计入${route === 'spouse' ? '（只计婚后的居住）' : ''}，最早 ${possible}（§ 12b Abs. 2，裁量，PD-128）。`,
                    ` If the authority uses its discretion to count up to ${v.priorResidenceCreditYears.value[route]} years of residence before the interruption${route === 'spouse' ? ' (only while married)' : ''}, it could be ${possible} (§ 12b Abs. 2, PD-128).`,
                  )
              : '') +
        (route === 'general'
          ? L(
              `3 年快速入籍（§ 10 Abs. 3）自 ${turbo} 起取消，一般须满 ${years} 年。`,
              ` The 3-year fast track (§ 10 Abs. 3) was abolished from ${turbo}; the general requirement is ${years} years.`,
            )
          : ''),
      checks: [
        {
          text: L(
            `入籍前 ${years} 年合法惯常居住不中断（单次出境不超过 ${v.naturalisationAbsenceMonths.value} 个月不中断），入籍时持 § 10 Abs. 1 Satz 1 Nr. 2 清单以外的许可`,
            `${years} years of lawful habitual residence without interruption before naturalisation (absences of up to ${v.naturalisationAbsenceMonths.value} months do not interrupt it), holding a title not listed in § 10 Abs. 1 Satz 1 Nr. 2 when naturalised`,
          ),
          met: now === 'yes' ? true : now === 'maybe' ? undefined : false,
          sources: [
            ...v.naturalisationYears.sources,
            ...v.naturalisationAbsenceMonths.sources,
            stAG('§ 10 Abs. 1 Satz 1 Nr. 2', '10'),
            stAG('§ 12b Abs. 1 Satz 5', '12b'),
            { srcId: 'SRC-106', locator: 'Nr. 12b.1.5 Rdn. 23 (p98)' },
            { srcId: 'SRC-105', locator: 'BT-Drs. 20/9044 (p40)' },
            ...(asylum
              ? [
                  {
                    srcId: 'SRC-103',
                    locator: 'AsylG § 55 Abs. 3',
                    url: 'https://www.gesetze-im-internet.de/asylvfg_1992/__55.html',
                  },
                ]
              : []),
          ],
        },
        ...(route === 'spouse'
          ? [
              {
                text: marriedFrom
                  ? L(
                      `与德国人结婚（或登记伴侣关系）满 ${v.spouseMarriageYears.value} 年，配偶在这 ${v.spouseMarriageYears.value} 年里和入籍时都是德国人（${marriedFrom} 起）`,
                      `Married to, or in a registered partnership with, a German for ${v.spouseMarriageYears.value} years, your spouse being German throughout them and when you are naturalised (from ${marriedFrom})`,
                    )
                  : L(
                      `与德国人结婚（或登记伴侣关系）满 ${v.spouseMarriageYears.value} 年（未填结婚日期）`,
                      `Married to, or in a registered partnership with, a German for ${v.spouseMarriageYears.value} years (no date entered)`,
                    ),
                met: marriedFrom ? sim >= marriedFrom : undefined,
                sources: v.spouseMarriageYears.sources,
              },
            ]
          : []),
      ],
      notChecked: [
        L(
          '身份与国籍已查明、宪法与历史责任声明、生计、无犯罪记录、德语 B1、入籍考试（§ 10 Abs. 1 Satz 1 Nr. 1、1a、3、5–7）',
          'Identity and nationality established, the declarations on the constitution and historical responsibility, livelihood, no criminal convictions, German at B1 and the naturalisation test (§ 10 Abs. 1 Satz 1 Nr. 1, 1a, 3, 5–7)',
        ),
        L(
          '外国人管理局准许的更长出境期限、因服兵役超期（§ 12b Abs. 1 Satz 2、3），以及因迟交续期申请造成的合法性中断可不计（§ 12b Abs. 3）',
          'A longer absence allowed by the immigration authority or overstayed for military service (§ 12b Abs. 1 Satz 2, 3), and gaps in lawful status from a late renewal application being disregarded (§ 12b Abs. 3)',
        ),
        ...(route === 'spouse'
          ? [
              L(
                '3 年内长期分居的年限相应延长（AH-StAG Nr. 9.1 Rdn. 4）；婚姻满 3 年时可因公共利益缩短居住年限（§ 9 Abs. 1 Satz 2，裁量）；配偶去世或离婚后 1 年内的情形（§ 9 Abs. 2）',
                'A longer period after living apart for a long time (AH-StAG Nr. 9.1 Rdn. 4); a shorter residence period in the public interest once married for 3 years (§ 9 Abs. 1 Satz 2, at discretion); the year after the German spouse dies or the marriage ends (§ 9 Abs. 2)',
              ),
            ]
          : []),
      ],
      assumptions: [
        L(
          `以入籍日判断（AH-StAG Nr. 10.1.0 Rdn. 1），从该日往回数，不含当天；${years} 年按日历计（PD-120）。${route === 'general' ? `一般 ${years} 年自 StARModG 施行日 ${fiveFrom} 起适用；` : ''}3 年快速入籍（§ 10 Abs. 3）自 ${turbo} 起取消（BGBl. 2025 I Nr. 256，没有过渡条款，PD-129）。`,
          `Judged on the naturalisation date (AH-StAG Nr. 10.1.0 Rdn. 1), counting back from it and not including it; the ${years} years are calendar years (PD-120). ${route === 'general' ? `The general ${years} years apply from ${fiveFrom}, when the StARModG came into force; the` : 'The'} 3-year fast track (§ 10 Abs. 3) was abolished from ${turbo} (BGBl. 2025 I Nr. 256, with no transitional provision, PD-129).`,
        ),
        L(
          `首次入境后的所有居留许可（含学习、培训）都算合法居留，到期前已申请续期、等待决定的期间也算（§ 81 Abs. 4，PD-124），庇护程序期间在获得国际保护（庇护、难民或辅助保护）后计入（AsylG § 55 Abs. 3）。单次不超过 ${v.naturalisationAbsenceMonths.value} 个月的出境不中断（§ 12b Abs. 1 Satz 1）；更长的出境中断，回德后从返回日重新起算；所需年限内出境合计超过其一半（每年按 ${v.daysPerYear.value} 天）也中断，从越过一半的那次出境返回后重新起算（§ 12b Abs. 1 Satz 5，PD-127）。`,
          `Every residence permit after your first arrival (study and training included) is lawful residence, and so is the wait for a renewal applied for before expiry (§ 81 Abs. 4, PD-124); the asylum procedure counts once international protection (asylum, refugee or subsidiary protection) was granted (AsylG § 55 Abs. 3). Absences of up to ${v.naturalisationAbsenceMonths.value} months do not interrupt residence (§ 12b Abs. 1 Satz 1); a longer absence interrupts it and the count starts again on the day you came back; so do absences totalling more than half the years required (${v.daysPerYear.value}-day years) within those years, starting again after the trip that went over half (§ 12b Abs. 1 Satz 5, PD-127).`,
        ),
        gaps,
        ...(sim < fiveFrom
          ? [
              L(
                `模拟日早于 ${fiveFrom}：当时适用 StARModG 之前的旧法，年限不同；本试点只按现行法计算。`,
                `The simulation date is before ${fiveFrom}: the law before the StARModG applied then, with different periods; this pilot uses current law only.`,
              ),
            ]
          : sim < turbo
            ? [
                L(
                  `模拟日早于 ${turbo}：当时还有 3 年路径（须特别融入成绩与 C1 德语），本试点只按现行法计算；${turbo} 前已递交、尚未决定的 3 年申请如何处理，法律没有规定（PD-129）。`,
                  `The simulation date is before ${turbo}: a 3-year route then existed (with special integration achievements and German at C1); this pilot uses current law only, and the law does not say what happens to 3-year applications made before ${turbo} and still undecided (PD-129).`,
                ),
              ]
            : []),
        projection,
      ],
      pendingDetails: [
        'PD-120',
        ...(onTemporary ? ['PD-122'] : []),
        'PD-124',
        'PD-127',
        ...(why === 'credit' || withCredit ? ['PD-128'] : []),
        'PD-129',
      ],
    });
  }

  // ---------- Trips abroad and loss of a title (§ 51) ----------
  {
    const title = L(
      '出境与居留失效（§ 51）',
      'Trips abroad and loss of residence (§ 51)',
    );
    const relevant = exits.filter((e) => e !== undefined);
    const lapsed = relevant.filter((e) => e.lapses);
    const unsure = relevant.filter((e) => e.unsure);
    const euUnsure = unsure.filter((e) => e.euBy);
    const renewalUnsure = unsure.filter((e) => e.pendingRenewal);
    const mobilityUnsure = unsure.filter((e) => e.mobility);
    // Back by the simulation date while the renewal was still pending.
    const backPending = (e: Exit) =>
      e.trip.returned <= sim && !!pending[days.index(e.trip.returned)];
    const notChecked = [
      L(
        '出于非临时原因出境（如迁居国外）的，许可在出境时即失效（§ 51 Abs. 1 Nr. 6），取决于本人意图，无法计算',
        'Leaving for a reason that is not temporary (such as moving abroad) ends the title when you leave (§ 51 Abs. 1 Nr. 6); this depends on your intentions and cannot be worked out',
      ),
      L(
        '外国人管理局准许的更长返回期限（Nr. 7，持定居许可的通常会准许，Abs. 4）；合法居留满 15 年的定居许可持有人、与德国人共同生活的配偶（Abs. 2）、服兵役（Abs. 3）、持德国难民旅行证件（Abs. 7）的例外；蓝卡持有人家属的 12 个月（Abs. 10）；多次入境或超过 90 天的签证不按 Nr. 7 失效',
        'A longer deadline set by the immigration authority (Nr. 7; usually given to settlement permit holders, Abs. 4); the exceptions for settlement permit holders with 15 years of lawful residence, spouses living with a German (Abs. 2), military service (Abs. 3) and holders of a German refugee travel document (Abs. 7); 12 months for Blue Card holders’ family (Abs. 10); multiple-entry visas and visas for more than 90 days do not lapse under Nr. 7',
      ),
    ];
    if (relevant.length === 0) {
      pathways.push({
        id: 'DE-TRAVEL',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '没有持居留许可期间的出境记录。',
          'You entered no trips abroad while holding a residence title.',
        ),
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const trip = (e: Exit) =>
        L(
          `${e.trip.departed} 至 ${e.trip.returned}`,
          `${e.trip.departed} to ${e.trip.returned}`,
        );
      pathways.push({
        id: 'DE-TRAVEL',
        title,
        status: lapsed.length ? 'NOT_MET' : unsure.length ? 'UNKNOWN' : 'MET',
        earliestDate: lapsed.length || unsure.length ? undefined : sim,
        summary: lapsed.length
          ? L(
              `${lapsed.map(trip).join('、')} 的出境返回日晚于期限，所持许可在期限届满后失效（§ 51）：此前的时间不再计入定居许可与欧盟长期居留，回德须重新取得许可。`,
              `For the trip${lapsed.length > 1 ? 's' : ''} ${lapsed.map(trip).join(', ')} the return is after the deadline, so the title lapses once the deadline has passed (§ 51): earlier time no longer counts for a settlement permit or EU long-term residence, and you need a new title to come back.`,
            )
          : unsure.length
            ? (euUnsure.length
                ? L(
                    `${euUnsure.map(trip).join('、')} 持欧盟长期居留离开德国较久：若这段时间都在欧盟以外，许可会在期限届满后失效（§ 51 Abs. 9 Satz 1 Nr. 3）；在其他欧盟国家的不失效，试点无法判断。`,
                    `On EU long-term residence you are away ${euUnsure.map(trip).join(', ')}: if all of that time is outside the EU the title lapses once the deadline has passed (§ 51 Abs. 9 Satz 1 Nr. 3); time in other EU countries does not count against it, which this pilot cannot tell.`,
                  )
                : '') +
              (renewalUnsure.length
                ? L(
                    `${renewalUnsure.map(trip).join('、')} 的返回日在原许可到期之后，续期还在等待决定：原许可只延续到决定作出（§ 81 Abs. 4）。续期获批或申请仍在等待的话，按检查项里的期限判断（一般 ${v.lapseMonths.value} 个月，欧盟蓝卡 ${v.blueCardLapseMonths.value} 个月）；否则许可在到期后已失效（§ 51 Abs. 1 Nr. 1），试点无法判断。`,
                    `${euUnsure.length ? ' ' : ''}For ${renewalUnsure.map(trip).join(', ')} you come back after the old permit ran out while the renewal is pending: the permit only continues until the decision (§ 81 Abs. 4). If the renewal is granted or still pending, the limit in the check below applies (usually ${v.lapseMonths.value} months, ${v.blueCardLapseMonths.value} on an EU Blue Card); otherwise the permit lapsed when it ran out (§ 51 Abs. 1 Nr. 1), which this pilot cannot tell.`,
                  )
                : '') +
              (mobilityUnsure.length
                ? L(
                    `${mobilityUnsure.map(trip).join('、')} 持学习许可在外超过期限：若这段时间是按欧盟学生流动（指令 2016/801）在其他成员国学习，许可不失效（§ 51 Abs. 1a Satz 2）；否则许可在期限后失效，试点无法判断。`,
                    `${euUnsure.length || renewalUnsure.length ? ' ' : ''}On a study permit you are away past the limit for ${mobilityUnsure.map(trip).join(', ')}: it does not lapse if you were studying in another member state under Directive (EU) 2016/801 (§ 51 Abs. 1a Satz 2); otherwise it lapsed after the limit, which this pilot cannot tell.`,
                  )
                : '')
            : L(
                '录入的出境都在期限内返回，许可不因长期出境（§ 51 Abs. 1 Nr. 7）失效。',
                'You come back in time from every trip you entered, so no title lapses for a long absence (§ 51 Abs. 1 Nr. 7).',
              ),
        checks: relevant.map((e) =>
          e.kind === 'eu-long-term'
            ? {
                text: L(
                  `${trip(e)}（持欧盟长期居留）：${e.by} 前返回德国；若在欧盟以外，须 ${e.euBy} 前返回`,
                  `${trip(e)} (on EU long-term residence): back in Germany by ${e.by}, or by ${e.euBy} if outside the EU`,
                ),
                met: e.lapses ? false : e.unsure ? undefined : true,
                sources: [
                  ...v.euLapseMonths.sources,
                  ...v.euLapseYears.sources,
                ],
              }
            : {
                text: e.pendingRenewal
                  ? L(
                      `${trip(e)}（出境时持${N(KIND_NAMES[e.kind])}，到期后续期待决定）：续期获批或申请仍在等待的话，最晚 ${e.by} 返回`,
                      `${trip(e)} (holding ${N(KIND_NAMES[e.kind])} when you left, renewal pending after it ran out): if the renewal is granted or still pending, back by ${e.by}`,
                    )
                  : e.expires
                    ? L(
                        `${trip(e)}（出境时持${N(KIND_NAMES[e.kind])}）：许可 ${e.by} 到期、没有录入续期，最晚当天返回`,
                        `${trip(e)} (holding ${N(KIND_NAMES[e.kind])} when you left): the permit expires on ${e.by} with no renewal entered, so back by that day`,
                      )
                    : e.studyEnd
                      ? L(
                          `${trip(e)}（出境时持${N(KIND_NAMES[e.kind])}）：最晚 ${e.by} 返回；即使按欧盟学生流动在其他成员国学习，也须在许可 ${e.studyEnd} 到期前返回（§ 51 Abs. 1 Nr. 1、Abs. 1a Satz 2）`,
                          `${trip(e)} (holding ${N(KIND_NAMES[e.kind])} when you left): back by ${e.by}; even when studying in another member state under EU student mobility, back before the permit ran out on ${e.studyEnd} (§ 51 Abs. 1 Nr. 1, Abs. 1a Satz 2)`,
                        )
                      : e.mobility
                        ? L(
                            `${trip(e)}（出境时持${N(KIND_NAMES[e.kind])}）：最晚 ${e.by} 返回，按欧盟学生流动在其他成员国学习的除外（§ 51 Abs. 1a Satz 2）`,
                            `${trip(e)} (holding ${N(KIND_NAMES[e.kind])} when you left): back by ${e.by}, unless you were studying in another member state under EU student mobility (§ 51 Abs. 1a Satz 2)`,
                          )
                        : backPending(e)
                          ? L(
                              `${trip(e)}（出境时持${N(KIND_NAMES[e.kind])}，返回时续期仍待决定）：§ 51 的返回期限为 ${e.by}；原许可在续期决定前延续（§ 81 Abs. 4），返回时仍在等待`,
                              `${trip(e)} (holding ${N(KIND_NAMES[e.kind])} when you left, renewal still pending when you came back): the § 51 limit is ${e.by}; the permit continued until the decision (§ 81 Abs. 4), which was still pending when you came back`,
                            )
                          : L(
                              `${trip(e)}（出境时持${N(KIND_NAMES[e.kind])}）：最晚 ${e.by} 返回`,
                              `${trip(e)} (holding ${N(KIND_NAMES[e.kind])} when you left): back by ${e.by}`,
                            ),
                met: e.lapses ? false : e.unsure ? undefined : true,
                sources: [
                  ...(e.kind === 'blue-card'
                    ? v.blueCardLapseMonths.sources
                    : v.lapseMonths.sources),
                  ...(e.pendingRenewal || backPending(e)
                    ? [aufenthG('§ 81 Abs. 4 Satz 1', '81')]
                    : []),
                  ...(e.mobility || e.studyEnd
                    ? [aufenthG('§ 51 Abs. 1 Nr. 1, Abs. 1a Satz 2', '51')]
                    : []),
                  ...(e.expires
                    ? [
                        aufenthG('§ 51 Abs. 1 Nr. 1', '51'),
                        { srcId: 'SRC-108', locator: 'Nr. 51.1.6.7 (p236)' },
                      ]
                    : []),
                ],
              },
        ),
        notChecked,
        assumptions: [
          L(
            `期限从离境日起按日历月计，对应日当天返回仍算按时（BGB §§ 187、188，PD-120）；一般 ${v.lapseMonths.value} 个月，欧盟蓝卡 ${v.blueCardLapseMonths.value} 个月；欧盟长期居留离开欧盟 ${v.euLapseMonths.value} 个月（之前持过蓝卡的 ${v.euLapseBlueCardMonths.value} 个月）或离开德国 ${v.euLapseYears.value} 年。出境期间许可本身到期、又没有录入续期的，以到期日为最晚返回日（§ 51 Abs. 1 Nr. 1）。失效的许可在期限届满后不再算持有，直到录入的下一张许可生效。未来的出境按你填写的返回日判断。`,
            `Deadlines run in calendar months from the day you left, and coming back on the same day of the month is still in time (BGB §§ 187, 188, PD-120): usually ${v.lapseMonths.value} months, ${v.blueCardLapseMonths.value} on an EU Blue Card; EU long-term residence lapses after ${v.euLapseMonths.value} months outside the EU (${v.euLapseBlueCardMonths.value} after a Blue Card) or ${v.euLapseYears.value} years outside Germany. If the permit itself expires while you are away and no renewal is entered, its expiry is the last day to come back (§ 51 Abs. 1 Nr. 1). A lapsed title is no longer held after the deadline until the next permit you entered begins. Future trips are judged by the return date you entered.`,
          ),
        ],
        pendingDetails: ['PD-120'],
      });
    }
  }

  return { policyAsOf: de.asOf, pathways };
}
