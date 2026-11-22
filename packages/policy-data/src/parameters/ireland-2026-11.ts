import type { Parameter } from '../types';

// Ireland pilot (phase 19, task 68): Irish Nationality and Citizenship Act
// 1956 as revised (SRC-091), with Immigration Service Delivery guidance on
// counting (SRC-095) and on Stamp 4 and Stamp 5 (SRC-096, SRC-097), which
// are policy, not statute. The 2026 General Scheme (SRC-098) is a draft.
const ISD_GUIDE =
  'https://www.irishimmigration.ie/how-to-become-an-irish-citizen-guide/';
const ISD_CALCULATOR = 'https://irishimmigration.ie/residency-calculator';
const ISD_STAMPS =
  'https://www.irishimmigration.ie/registering-your-immigration-permission/information-on-registering/immigration-permission-stamps/';
const ISD_STAMP4 =
  'https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-renew-your-current-permission/information-on-stamp-4-upgrades/';
const GENERAL_SCHEME =
  'https://assets.gov.ie/static/documents/cadca21c/General_Scheme_of_the_Irish_Nationality_and_Citizenship_Amendment_Bill_2026.pdf';

export const ireland2026_11 = {
  asOf: '2026-11-22',
  values: {
    // One year's continuous residence immediately before applying (s15, and
    // in the island of Ireland for spouses, s15A).
    continuousYears: {
      value: 1,
      sources: [
        { srcId: 'SRC-091', locator: 's15(1)(c) (p19)' },
        { srcId: 'SRC-091', locator: 's15A(1)(e) (p21)' },
      ],
    },
    // Then a total residence within this many years before that year...
    priorWindowYears: {
      value: { general: 8, spouse: 4 },
      sources: [
        { srcId: 'SRC-091', locator: 's15(1)(c) (p19)' },
        { srcId: 'SRC-091', locator: 's15A(1)(f) (p21)' },
      ],
    },
    // ...of 4 years (general) or 2 years (spouse), in days; ISD adds a day
    // for each 29 February.
    priorResidenceDays: {
      value: { general: 1460, spouse: 730 },
      sources: [
        { srcId: 'SRC-091', locator: 's15(1)(c) (p19), s15A(1)(f) (p21)' },
        {
          srcId: 'SRC-095',
          locator: "Guide: What is 'Reckonable Residency'",
          url: ISD_GUIDE,
        },
        {
          srcId: 'SRC-095',
          locator: 'Calculator: 1095 or 1096 days over 5 years',
          url: ISD_CALCULATOR,
        },
      ],
    },
    // Days not present in the continuous year that still count as residence
    // (s15C(3)(a))...
    absenceDays: {
      value: 70,
      sources: [
        { srcId: 'SRC-091', locator: 's15C(1)–(3)(a) (p23)' },
        {
          srcId: 'SRC-095',
          locator: 'Guide: 70 Days Absence Rule',
          url: ISD_GUIDE,
        },
      ],
    },
    // ...plus up to this many more when the Minister accepts exceptional
    // circumstances (s15C(3)(b), (5)); over the total ISD has no discretion.
    exceptionalDays: {
      value: 30,
      sources: [
        { srcId: 'SRC-091', locator: 's15C(3)(b), (5) (p23)' },
        {
          srcId: 'SRC-095',
          locator: 'Guide: 70 Days Absence Rule',
          url: ISD_GUIDE,
        },
      ],
    },
    // Spouses and civil partners: married or in partnership this long.
    marriageYears: {
      value: 3,
      sources: [{ srcId: 'SRC-091', locator: 's15A(1)(c) (p20)' }],
    },
    // Stamp 4 upgrade: months from starting employment in the State.
    stamp4Months: {
      value: { csep: 21, gep: 57 },
      sources: [
        {
          srcId: 'SRC-096',
          locator: 'Stamp 4 upgrades: Eligibility criteria',
          url: ISD_STAMP4,
        },
      ],
    },
    // Spouses or partners of CSEP holders and researchers on Stamp 1G.
    spouse1gYears: {
      value: 5,
      sources: [
        {
          srcId: 'SRC-096',
          locator: 'Immigration permission/stamps: Stamp 1G',
          url: ISD_STAMPS,
        },
      ],
    },
    // Stamp 5 (without condition as to time): months of legal residence...
    wcattMonths: {
      value: 96,
      sources: [{ srcId: 'SRC-097', locator: 'Introduction; Eligibility' }],
    },
    // ...with absences of no more than this many months in a year.
    wcattAbsenceMonths: {
      value: 4,
      sources: [
        {
          srcId: 'SRC-097',
          locator:
            'FAQ: What are the conditions attached to my Stamp 5 permission',
        },
      ],
    },
    // Draft only (General Scheme, Heads 5 and 6): not used in any date.
    draftBill: {
      value: {
        continuousYears: 2,
        windowYears: 10,
        totalYears: 6,
        spouseMarriageYears: 5,
        spouseContinuousYears: 2,
        spouseWindowYears: 5,
        spouseTotalYears: 3,
      },
      sources: [
        {
          srcId: 'SRC-098',
          locator: 'General Scheme Head 5 (p7)',
          url: GENERAL_SCHEME,
        },
        {
          srcId: 'SRC-098',
          locator: 'General Scheme Head 6 (p11)',
          url: GENERAL_SCHEME,
        },
        {
          srcId: 'SRC-098',
          locator:
            'Oireachtas press release 2026-11-19 (pre-legislative scrutiny)',
          url: 'https://www.oireachtas.ie/en/press-centre/press-releases/20261119-joint-committee-on-justice-home-affairs-and-migration-to-meet-for-pre-legislative-scrutiny-of-the-general-scheme-of-the-irish-nationality-and-citizenship-amendment-bill-2026/',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | Record<string, number>>>;
};
