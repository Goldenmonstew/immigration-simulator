import type { Parameter } from '../types';

// Australia pilot (phase 17): Migration Regulations 1994 Compilation No. 291
// (SRC-062) and Australian Citizenship Act 2007 Compilation No. 37 (SRC-061).
export const australia2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Subclass 191, Regional Provisional Visas stream: years holding the
    // current 491 or 494 visa.
    regionalProvisionalYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3)(c)(ii)' },
        { srcId: 'SRC-063', locator: 'Eligibility → Have an eligible visa' },
      ],
    },
    // Hong Kong streams: years holding the current 457, 482 or 485 visa, and
    // years usually resident in Australia immediately before applying.
    hongKongIndependentYears: {
      value: 4,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4L)(e)(iii)' },
        { srcId: 'SRC-062', locator: '189.242' },
      ],
    },
    // The Hong Kong streams' 457, 482 and 485 visas allow a stay of this many
    // years from when they came into effect (granted from 9 July 2020).
    hongKongVisaYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4M)(c)(ii)' },
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3A)(c)(ii)' },
      ],
    },
    hongKongRegionalYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3)(ca)(iii)' },
        { srcId: 'SRC-062', locator: '191.231(2)' },
        { srcId: 'SRC-062', locator: '191.232' },
      ],
    },
    // Subclass 186 Temporary Residence Transition stream: in the window
    // before applying, 457/482 visas and full-time sponsored work for a
    // total of the held years.
    trtWindowYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-062', locator: '186.226(1)' },
        { srcId: 'SRC-062', locator: '186.227(1)' },
      ],
    },
    trtHeldYears: {
      value: 2,
      sources: [
        { srcId: 'SRC-062', locator: '186.226(1)' },
        { srcId: 'SRC-062', locator: '186.227(1)' },
        {
          srcId: 'SRC-064',
          locator:
            'Eligibility → Have 2 years eligible sponsored employment in the 3 years prior to your application',
        },
      ],
    },
    // Age at application must be below this, unless in an exempt class.
    trtMaxAge: {
      value: 45,
      sources: [{ srcId: 'SRC-062', locator: '186.221' }],
    },
    // Partner visas: years since the combined application, unless already in
    // a long-term partner relationship when applying (reg 1.03).
    partnerWaitYears: {
      value: 2,
      sources: [
        { srcId: 'SRC-062', locator: '801.221(2)(d), (6A)' },
        { srcId: 'SRC-062', locator: '100.221(2)(c), (5)' },
        { srcId: 'SRC-065', locator: 'Eligibility → Visa requirements' },
      ],
    },
    // Resident Return visa: days in Australia as a permanent visa holder in
    // the window before applying; arrival and departure days count.
    rrvWindowYears: {
      value: 5,
      sources: [{ srcId: 'SRC-062', locator: '155.212(2)' }],
    },
    rrvPresenceDays: {
      value: 730,
      sources: [
        { srcId: 'SRC-062', locator: '155.212(2)' },
        {
          srcId: 'SRC-066',
          locator:
            'Eligibility → Option 1: Present in Australia for 2 of the last 5 years',
        },
      ],
    },
    // Permanent visas let the holder travel to and enter Australia for this
    // many years from grant; so does a 155 granted under 155.212(2).
    travelFacilityYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-062', locator: '100.511' },
        { srcId: 'SRC-062', locator: '186.511' },
        { srcId: 'SRC-062', locator: '189.511' },
        { srcId: 'SRC-062', locator: '190.511' },
        { srcId: 'SRC-062', locator: '191.511' },
        { srcId: 'SRC-062', locator: '801.511' },
        { srcId: 'SRC-062', locator: '155.511(b)' },
      ],
    },
    // Citizenship by conferral, general residence requirement.
    citizenshipMinAge: {
      value: 18,
      sources: [{ srcId: 'SRC-061', locator: 's21(2)(a)' }],
    },
    citizenshipResidenceYears: {
      value: 4,
      sources: [
        { srcId: 'SRC-061', locator: 's22(1)(a)–(b)' },
        { srcId: 'SRC-068', locator: 'p5 §3.3' },
      ],
    },
    // "12 months" of absences in the 4 years, counted as 365 days.
    citizenshipAbsenceDays: {
      value: 365,
      sources: [
        { srcId: 'SRC-061', locator: 's22(1A)' },
        { srcId: 'SRC-068', locator: 'p6 scenario' },
      ],
    },
    citizenshipPermanentMonths: {
      value: 12,
      sources: [
        { srcId: 'SRC-061', locator: 's22(1)(c)' },
        { srcId: 'SRC-061', locator: 's22(1B)(c)' },
      ],
    },
    citizenshipRecentAbsenceDays: {
      value: 90,
      sources: [{ srcId: 'SRC-061', locator: 's22(1B)(b)' }],
    },
  },
} satisfies { asOf: string; values: Record<string, Parameter<number>> };
