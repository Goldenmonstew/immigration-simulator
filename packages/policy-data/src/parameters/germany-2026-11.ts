import type { Parameter, SourceRef } from '../types';

// Germany pilot (phase 19, task 69): Aufenthaltsgesetz (SRC-100),
// Staatsangehörigkeitsgesetz (SRC-101) and BGB § 191 (SRC-102), with the
// federal guidance in SRC-104 to SRC-109.

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

export const germany2026_11 = {
  asOf: '2026-11-22',
  values: {
    // Niederlassungserlaubnis (§ 9): years holding a residence permit and
    // months of pension contributions.
    generalYears: {
      value: 5,
      sources: [
        aufenthG('§ 9 Abs. 2 Satz 1 Nr. 1', '9'),
        { srcId: 'SRC-109', locator: 'In Deutschland niederlassen' },
      ],
    },
    generalContributionMonths: {
      value: 60,
      sources: [aufenthG('§ 9 Abs. 2 Satz 1 Nr. 3', '9')],
    },
    // § 9 Abs. 4: each stay abroad that did not end the permit counts up to
    // this many months...
    abroadCreditMonths: {
      value: 6,
      sources: [
        aufenthG('§ 9 Abs. 4 Nr. 2', '9'),
        { srcId: 'SRC-108', locator: 'Nr. 9.4.2 (p69–p70)' },
      ],
    },
    // ...and earlier time, when a settlement permit lapsed abroad, up to
    // this many years.
    priorSettlementCreditYears: {
      value: 4,
      sources: [aufenthG('§ 9 Abs. 4 Nr. 1', '9')],
    },
    // § 18c Abs. 1: skilled workers (§§ 18a, 18b, 18d, 18g permits).
    skilledYears: {
      value: 3,
      sources: [aufenthG('§ 18c Abs. 1 Satz 1 Nr. 1', '18c')],
    },
    skilledContributionMonths: {
      value: 36,
      sources: [aufenthG('§ 18c Abs. 1 Satz 1 Nr. 3', '18c')],
    },
    // After vocational training or a degree completed in Germany.
    skilledTrainedYears: {
      value: 2,
      sources: [aufenthG('§ 18c Abs. 1 Satz 2', '18c')],
    },
    skilledTrainedContributionMonths: {
      value: 24,
      sources: [aufenthG('§ 18c Abs. 1 Satz 2', '18c')],
    },
    // § 18c Abs. 2: months employed on a Blue Card, with contributions for
    // the same period; fewer with German at B1.
    blueCardMonths: {
      value: 27,
      sources: [
        aufenthG('§ 18c Abs. 2 Satz 1', '18c'),
        { srcId: 'SRC-107', locator: 'Nr. 18c.2.1.1 (p117)' },
        { srcId: 'SRC-109', locator: 'Die Blaue Karte EU' },
      ],
    },
    blueCardB1Months: {
      value: 21,
      sources: [
        aufenthG('§ 18c Abs. 2 Satz 3', '18c'),
        { srcId: 'SRC-107', locator: 'Nr. 18c.2.1.1 (p117)' },
      ],
    },
    // § 28 Abs. 2: family of a German, years holding the family permit.
    germanFamilyYears: {
      value: 3,
      sources: [
        aufenthG('§ 28 Abs. 2 Satz 1', '28'),
        { srcId: 'SRC-108', locator: 'Nr. 28.2 (p165)' },
      ],
    },
    // § 26 Abs. 3: recognised refugees and people granted asylum, counting
    // the asylum procedure; fewer years with German at C1.
    refugeeYears: {
      value: 5,
      sources: [aufenthG('§ 26 Abs. 3 Satz 1 Nr. 1, Satz 2', '26')],
    },
    refugeeC1Years: {
      value: 3,
      sources: [aufenthG('§ 26 Abs. 3 Satz 3 Nr. 1, Nr. 3, Satz 4', '26')],
    },
    // Daueraufenthalt-EU (§ 9a): years with a residence title.
    euLongTermYears: {
      value: 5,
      sources: [
        aufenthG('§ 9a Abs. 2 Satz 1 Nr. 1', '9a'),
        { srcId: 'SRC-108', locator: 'Nr. 9a.2.1.1.1 (p71)' },
      ],
    },
    // § 9b: absences count when each is at most this many months in a row...
    euSingleAbsenceMonths: {
      value: 6,
      sources: [aufenthG('§ 9b Abs. 1 Satz 1 Nr. 1 Buchst. b', '9b')],
    },
    // ...and they total no more than this many months.
    euTotalAbsenceMonths: {
      value: 10,
      sources: [aufenthG('§ 9b Abs. 1 Satz 1 Nr. 1 Buchst. b', '9b')],
    },
    // § 51: a title lapses when you do not come back within this many
    // months (Nr. 7)...
    lapseMonths: {
      value: 6,
      sources: [
        aufenthG('§ 51 Abs. 1 Nr. 7', '51'),
        { srcId: 'SRC-108', locator: 'Nr. 51.1.6.6 (p236)' },
      ],
    },
    // ...12 for a Blue Card...
    blueCardLapseMonths: {
      value: 12,
      sources: [aufenthG('§ 51 Abs. 10 Satz 1', '51')],
    },
    // ...and Daueraufenthalt-EU after this many months in a row outside the
    // EU (more after a Blue Card), or years outside Germany.
    euLapseMonths: {
      value: 12,
      sources: [aufenthG('§ 51 Abs. 9 Satz 1 Nr. 3', '51')],
    },
    euLapseBlueCardMonths: {
      value: 24,
      sources: [aufenthG('§ 51 Abs. 9 Satz 1 Nr. 3', '51')],
    },
    euLapseYears: {
      value: 6,
      sources: [aufenthG('§ 51 Abs. 9 Satz 1 Nr. 4', '51')],
    },
    // Einbürgerung: years of lawful habitual residence by route.
    naturalisationYears: {
      value: { general: 5, spouse: 3 },
      sources: [
        stAG('§ 10 Abs. 1 Satz 1', '10'),
        stAG('§ 9 Abs. 1 Satz 1', '9'),
        { srcId: 'SRC-106', locator: 'Nr. 10.1.0 Rdn. 1 (p44)' },
        { srcId: 'SRC-109', locator: 'Einbürgerung' },
      ],
    },
    // Married to (or partnered with) a German for this many years.
    spouseMarriageYears: {
      value: 2,
      sources: [
        stAG('§ 9 Abs. 1 Satz 1', '9'),
        { srcId: 'SRC-106', locator: 'Nr. 9.1 Rdn. 6 (p42)' },
      ],
    },
    // § 12b: absences up to this many months do not interrupt residence.
    naturalisationAbsenceMonths: {
      value: 6,
      sources: [
        stAG('§ 12b Abs. 1 Satz 1', '12b'),
        { srcId: 'SRC-106', locator: 'Nr. 12b.1.1 Rdn. 18 (p97)' },
      ],
    },
    // § 12b Abs. 2: after an interruption, earlier residence may be counted
    // up to this many years (two thirds of 3 years for spouses).
    priorResidenceCreditYears: {
      value: { general: 3, spouse: 2 },
      sources: [
        stAG('§ 12b Abs. 2 Satz 1', '12b'),
        { srcId: 'SRC-106', locator: 'Nr. 9.1 Rdn. 5 (p42)' },
        { srcId: 'SRC-106', locator: 'Nr. 12b.2.1 Rdn. 24 (p98)' },
      ],
    },
    // StARModG in force: 5 years instead of 8 from this date.
    fiveYearsFrom: {
      value: '2024-06-27',
      sources: [
        { srcId: 'SRC-106', locator: 'Deckblatt (p1)' },
        { srcId: 'SRC-104', locator: 'BT-Drs. 21/537 (p6)' },
      ],
    },
    // The 3-year route (§ 10 Abs. 3 StAG) was struck out from this date.
    turboAbolishedFrom: {
      value: '2025-10-30',
      sources: [
        {
          srcId: 'SRC-104',
          locator: 'BGBl. 2025 I Nr. 256 Art. 1, Art. 6 Abs. 1',
          url: 'https://www.recht.bund.de/bgbl/1/2025/256/VO.html',
        },
        {
          srcId: 'SRC-104',
          locator: 'BMI Gesetzgebungsverfahren: Gesetz ist verkündet',
          url: 'https://www.bmi.bund.de/SharedDocs/gesetzgebungsverfahren/DE/VII5/gesetz-6-aenderung-des-staatsangehoerigkeitsrechts.html',
        },
        stAG('§ 10 Abs. 3 (weggefallen)', '10'),
      ],
    },
    // Months and years that need not run in one stretch: a year is 365 days.
    daysPerYear: {
      value: 365,
      sources: [
        {
          srcId: 'SRC-102',
          locator: 'BGB § 191',
          url: 'https://www.gesetze-im-internet.de/bgb/__191.html',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | string | Record<string, number>>>;
};
