import type { Parameter, SourceRef } from '../types';

// United States pilot (phase 18, task 62): INA (8 U.S.C., SRC-079), 8 CFR
// (SRC-080) and the USCIS Policy Manual (SRC-081).
export const unitedStates2026_11 = {
  asOf: '2026-11-21',
  values: {
    // INA 316(a): years of continuous residence after becoming a permanent
    // resident, and days in the United States in that time (30 months).
    naturalizationYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(a)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.2(a)(3)' },
      ],
    },
    physicalPresenceDays: {
      value: 913,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(a)' },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part D Ch 4(A)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-4',
        },
      ],
    },
    // INA 319(a): spouse of a U.S. citizen (18 months in the United States).
    spouseYears: {
      value: 3,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1430(a)',
          url: 'https://uscode.house.gov/us/usc/t8/s1430/',
        },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part G Ch 3(A)–(B)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-3',
        },
      ],
    },
    spousePresenceDays: {
      value: 548,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1430(a)',
          url: 'https://uscode.house.gov/us/usc/t8/s1430/',
        },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part G Ch 3(D)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-3',
        },
      ],
    },
    // Filing up to this many days before continuous residence is met.
    earlyFilingDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 334.2(b)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=334',
        },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part D Ch 6(D)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-6',
        },
      ],
    },
    // An absence of more than this many days is presumed to break
    // continuous residence; one of this many days or more breaks it.
    // An absence of more than this many days is presumed to break continuity
    // (the Policy Manual states 180 days)...
    presumptionDays: {
      value: 180,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(b)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.5(c)(1)(i)' },
        { srcId: 'SRC-081', locator: 'Vol 12 Part D Ch 3(C)(1)' },
      ],
    },
    // ...while its worked examples count calendar months (PD-093).
    presumptionMonths: {
      value: 6,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(b)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.5(c)(1)(i)' },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part D Ch 3(C)(1) example; Ch 3(C)(3) table',
        },
      ],
    },
    breakDays: {
      value: 365,
      sources: [
        { srcId: 'SRC-080', locator: '8 CFR 316.5(c)(1)(ii)' },
        { srcId: 'SRC-081', locator: 'Vol 12 Part D Ch 3(C)(2)' },
      ],
    },
    stateResidenceMonths: {
      value: 3,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(a)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.2(a)(5)' },
      ],
    },
    minAge: {
      value: 18,
      sources: [{ srcId: 'SRC-080', locator: '8 CFR 316.2(a)(1)' }],
    },
    // Conditional residence: the petition is filed in the days before the
    // second anniversary.
    conditionalYears: {
      value: 2,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1186a(d)(2)(A)',
          url: 'https://uscode.house.gov/us/usc/t8/s1186a/',
        },
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1186b(d)(2)(A)(i)',
          url: 'https://uscode.house.gov/us/usc/t8/s1186b/',
        },
      ],
    },
    // A child is in the parent's joint I-751 only with status from the same
    // day or within this many days after the parent.
    childConcurrentDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 216.4(a)(2)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216',
        },
      ],
    },
    conditionsWindowDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 216.4(a)(1)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216',
        },
        {
          srcId: 'SRC-080',
          locator: '8 CFR 216.6(a)(1)(i)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216',
        },
        {
          srcId: 'SRC-082',
          locator: 'When to File Your Petition to Remove Conditions',
        },
      ],
    },
    // A green card is an entry document after an absence of less than this.
    greenCardReturnYears: {
      value: 1,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 211.1(a)(2)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=211',
        },
      ],
    },
    // Returning after more than this many days away is seeking admission.
    seekingAdmissionDays: {
      value: 180,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1101(a)(13)(C)(ii)',
          url: 'https://uscode.house.gov/us/usc/t8/s1101/',
        },
      ],
    },
  },
} satisfies { asOf: string; values: Record<string, Parameter<number>> };

const source = (srcId: string, locator: string, url?: string) => ({
  srcId,
  locator,
  ...(url ? { url } : {}),
});

const usc = (id: string, section: string, subdivision = '') =>
  source(
    id,
    `8 U.S.C. § ${section}${subdivision}`,
    `https://uscode.house.gov/us/usc/t8/s${section}/`,
  );

const pm = (
  id: string,
  volume: number,
  part: string,
  chapter: number,
  subdivision = '',
) =>
  source(
    id,
    `USCIS-PM ${volume}.${part}.${chapter}${subdivision}`,
    `https://www.uscis.gov/policy-manual/volume-${volume}-part-${part.toLowerCase()}-chapter-${chapter}`,
  );

/** Primary sources for the full assessment, including qualitative conditions. */
export const unitedStatesFullSources = {
  age: [usc('SRC-290', '1445', '(b)')],
  lpr: [
    usc('SRC-290', '1429'),
    pm('SRC-081', 12, 'D', 2),
    source(
      'SRC-082',
      'N-400 Instructions p8, Conditional Permanent Residents',
      'https://www.uscis.gov/sites/default/files/document/forms/n-400instr.pdf',
    ),
  ],
  paperReceipt: [pm('SRC-081', 1, 'B', 6, '(E)')],
  onlineFiling: [
    source(
      'SRC-082',
      'Forms Available to File Online, Fill Out Form Online (N-400) and Upload Completed PDF Online (I-485, I-751)',
      'https://www.uscis.gov/file-online/forms-available-to-file-online',
    ),
  ],
  english: [
    usc('SRC-291', '1423', '(a)–(b)'),
    pm('SRC-292', 12, 'E', 2, '(A)–(C)'),
    source(
      'SRC-082',
      'N-400 Instructions p8, Naturalization Testing and Exceptions',
      'https://www.uscis.gov/sites/default/files/document/forms/n-400instr.pdf#page=8',
    ),
  ],
  civics: [
    pm('SRC-292', 12, 'E', 2, '(A)(2), (C)(2)'),
    source(
      'SRC-292',
      'PA-2025-24 pp1–2',
      'https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20251020-CivicsTest.pdf',
    ),
  ],
  disability: [
    usc('SRC-291', '1423', '(b)(1)'),
    pm('SRC-292', 12, 'E', 3, '(B)–(E), (I)(1)'),
  ],
  gmc: [
    usc('SRC-079', '1427', '(a)(3), (e)'),
    pm('SRC-293', 12, 'F', 2, '(A)–(B)'),
    source(
      'SRC-293',
      'PM-602-0188 pp3–5',
      'https://www.uscis.gov/sites/default/files/document/policy-alerts/08.15.2025-Restoring_a_Rigorous_Holistic_and_Comprehensive_Good_Moral_Character_Evaluation_Standard-PM-602-0188.pdf',
    ),
  ],
  gmcPermanent: [
    usc('SRC-079', '1101', '(a)(43), (f)(8)–(9)'),
    pm('SRC-293', 12, 'F', 4),
  ],
  gmcConditional: [
    usc('SRC-079', '1101', '(f)'),
    pm('SRC-293', 12, 'F', 5),
    source(
      'SRC-293',
      'PM-602-0201 pp2–5',
      'https://www.uscis.gov/sites/default/files/document/policy-alerts/11.04.2026-GMC_PublicBenefits_PM-602-0201.pdf',
    ),
  ],
  attachment: [
    usc('SRC-294', '1424', '(a)–(d)'),
    source('SRC-294', '8 CFR 313.1–313.4'),
  ],
  selective: [
    source(
      'SRC-295',
      '50 U.S.C. § 3802(a)',
      'https://uscode.house.gov/us/usc/t50/s3802/',
    ),
    pm('SRC-295', 12, 'D', 7, '(B)'),
  ],
  militaryBars: [
    usc('SRC-294', '1425'),
    usc('SRC-294', '1426'),
    source('SRC-294', '8 CFR 315.2'),
  ],
  oath: [usc('SRC-296', '1448', '(a)–(b)'), pm('SRC-296', 12, 'J', 3)],
  spouse: [
    usc('SRC-079', '1430', '(a)'),
    pm('SRC-290', 12, 'G', 2, '(A)–(C)'),
    pm('SRC-081', 12, 'G', 3, '(E)'),
  ],
  district: [
    ...unitedStates2026_11.values.stateResidenceMonths.sources,
    usc('SRC-290', '1451', '(a)'),
  ],
  earlyDistrict: [
    ...unitedStates2026_11.values.stateResidenceMonths.sources,
    source('SRC-080', '8 CFR 316.5(b)(1)(i), 334.2(b)'),
    pm('SRC-081', 12, 'D', 6, '(D)'),
  ],
  marriage: [usc('SRC-079', '1186a', '(a), (d)'), pm('SRC-297', 6, 'I', 2)],
  marriageWaiver: [
    usc('SRC-079', '1186a', '(c)(1), (c)(4), (d)(2)'),
    pm('SRC-297', 6, 'I', 3),
  ],
  i829: [
    usc('SRC-079', '1186b', '(d)'),
    pm('SRC-298', 6, 'G', 7, '(A), fn. 4'),
  ],
  registration: [
    usc('SRC-299', '1304', '(e)'),
    source(
      'SRC-299',
      '8 CFR 264.1; Alien Registration Requirement, Who Must Register and What to Do',
      'https://www.uscis.gov/alienregistration',
    ),
  ],
  address: [
    usc('SRC-299', '1305', '(a)'),
    source('SRC-299', '8 CFR 264.5(b), 265.1'),
  ],
  seekingAdmission: [usc('SRC-079', '1101', '(a)(13)(C)')],
  removal: [usc('SRC-301', '1227', '(a)')],
  return: [
    source('SRC-080', '8 CFR 211.1(a), 211.3'),
    source('SRC-300', '8 CFR 223.2(b), 223.3(a)'),
    source(
      'SRC-300',
      '22 CFR 42.22(a); 9 FAM 502.7-2',
      'https://fam.state.gov/FAM/09FAM/09FAM050207.html',
    ),
  ],
  relationship: [
    usc('SRC-302', '1151', '(b)(2)(A)(i), (f)(1)–(2)'),
    usc('SRC-302', '1153', '(a), (h)'),
    usc('SRC-079', '1101', '(b)(1)'),
    pm('SRC-302', 6, 'B', 7, '(A)'),
    source(
      'SRC-302',
      '9 FAM 502.1-1(D)(7)(1)–(2), conversion of petition status',
      'https://fam.state.gov/FAM/09FAM/09FAM050201.html#M502_1_1_D_7',
    ),
  ],
  petitionBars: [
    usc('SRC-302', '1154', '(a)(1), (c), (g)'),
    source('SRC-302', '8 CFR 204.2(a)(1)(i), (iii)'),
  ],
  poverty: [
    source('SRC-304', '91 FR 1797–1798, 2026 regional tables'),
    source(
      'SRC-304',
      'I-864P, 2026 regional tables',
      'https://www.uscis.gov/i-864p',
    ),
  ],
  sponsor: [
    usc('SRC-303', '1183a', '(a), (f)'),
    source('SRC-303', '8 CFR 213a.1; 213a.2(c)(1), (c)(2)'),
    source(
      'SRC-303',
      'I-864 Instructions pp8, 14, 16',
      'https://www.uscis.gov/sites/default/files/document/forms/i-864instr.pdf',
    ),
  ],
  supportExemption: [
    source('SRC-303', '8 CFR 213a.2(a)(2)(i)–(ii)'),
    usc('SRC-303', '1183a', '(a)(3), (f)'),
    source(
      'SRC-303',
      'I-864 Instructions p3, Other Applicants Not Required to Submit Form I-864, items 1–2',
      'https://www.uscis.gov/sites/default/files/document/forms/i-864instr.pdf#page=3',
    ),
  ],
  perm: [
    source(
      'SRC-305',
      '20 CFR 656.10(c)(1), (d)(1)(i)–(ii), (2)(ii), (3)(iv), (6), 656.12(b)–(c), 656.15(b), (e), 656.17(e), 656.24(b)–(d), 656.30(b), 656.40',
    ),
    pm('SRC-305', 6, 'E', 6, '(B)(1)'),
    usc('SRC-302', '1153', '(b)(2)–(3)'),
  ],
  approvedEmployment: [
    source('SRC-302', '8 CFR 204.5(k)(3)–(4), (l)(3)'),
    source(
      'SRC-309',
      '8 CFR 245.25(a)',
      'https://www.ecfr.gov/current/title-8/section-245.25#p-245.25(a)',
    ),
    pm('SRC-309', 7, 'A', 6, '(B)'),
  ],
  employerClassification: [
    source('SRC-302', '8 CFR 204.5(i)(3), (j)(2)–(3), (5)'),
  ],
  portability: [
    usc('SRC-302', '1154', '(j)'),
    source(
      'SRC-309',
      '8 CFR 245.25(a)(2)–(3), (b); I-485 Instructions pp10, 19',
      'https://www.ecfr.gov/current/title-8/section-245.25#p-245.25(a)(2)',
    ),
  ],
  initialSupplementJ: [
    source(
      'SRC-309',
      'I-485 Instructions p10, Item 8',
      'https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=10',
    ),
  ],
  pay: [
    source('SRC-302', '8 CFR 204.5(g)(2)'),
    pm('SRC-305', 6, 'E', 4, '(A)–(C)'),
  ],
  selfPetition: [
    source('SRC-302', '8 CFR 204.5(h), (k)'),
    pm('SRC-306', 6, 'F', 2, '(B)'),
    pm('SRC-306', 6, 'F', 5, '(D)'),
  ],
  approvedSelfPetition: [
    source(
      'SRC-309',
      'I-485 Instructions p10, evidence of intent for EB-1A and NIW',
      'https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=10',
    ),
  ],
  eb5: [usc('SRC-302', '1153', '(b)(5)(A)–(D), (F)'), pm('SRC-307', 6, 'G', 2)],
  eb5JobPlan: [
    source(
      'SRC-307',
      'I-526 Instructions p9, Item 5 (Job Creation)',
      'https://www.uscis.gov/sites/default/files/document/forms/i-526instr.pdf',
    ),
  ],
  gold: [
    source('SRC-308', 'EO 14351 §§ 2–3'),
    source(
      'SRC-308',
      'I-140G Instructions pp1–2; p3, Items 1–3',
      'https://www.uscis.gov/sites/default/files/document/forms/i-140ginstr.pdf',
    ),
  ],
  adjustment: [
    usc('SRC-309', '1255', '(a), (h)(1), (i), (n)'),
    source('SRC-309', '8 CFR 245.2(a)(2)(i)(A)–(C)'),
    pm('SRC-309', 7, 'A', 6, '(A), (C)'),
    source(
      'SRC-309',
      'I-485 Instructions pp3, 17–21',
      'https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf',
    ),
  ],
  adjustmentFilingPresence: [
    source(
      'SRC-309',
      'I-485 Instructions p2, Who May File Form I-485?',
      'https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf#page=2',
    ),
  ],
  adjustmentEligibility: [
    usc('SRC-309', '1255', '(a)'),
    source(
      'SRC-309',
      '8 CFR 103.2(b)(1), eligibility at filing through adjudication',
      'https://www.ecfr.gov/current/title-8/section-103.2#p-103.2(b)(1)',
    ),
  ],
  consularFiling: [
    source(
      'SRC-309',
      'DOS NVC Processing, Step 2 (transfer after petition approval)',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-2-begin-nvc-processing.html',
    ),
    source(
      'SRC-309',
      'DOS National Visa Center, What happens after USCIS sends my petition to the NVC?',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html',
    ),
  ],
  consularApplication: [
    source(
      'SRC-309',
      'DOS Pay Fees, Step 3',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-3-pay-fees.html',
    ),
    source(
      'SRC-309',
      'DOS Online Application, Step 6',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-evidence-and-other-supporting-documents/step-6-complete-online-visa-application.html',
    ),
    source(
      'SRC-309',
      'DOS CEAC FAQs, IV Application and Civil Documents columns',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-1-submit-a-petition/step-2-begin-nvc-processing/ceac-faqs.html',
    ),
  ],
  consularDocuments: [
    source(
      'SRC-309',
      'DOS Civil Documents, Court and Prison Records and Police Certificates',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-5-collect-financial-evidence-and-other-supporting-documents/step-7-collect-civil-documents.html',
    ),
    source(
      'SRC-309',
      'DOS Submit Documents, Step 9 and Documentarily Complete',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-8-scan-collected-documents/step-9-upload-and-submit-scanned-documents.html',
    ),
    source(
      'SRC-309',
      'DOS Civil Documents FAQs, I can’t get one of the required civil documents',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/civil-documents-faq.html',
    ),
  ],
  consularExecution: [
    source(
      'SRC-309',
      '22 CFR 42.67(a)(3), oath and signature on Form DS-260 at interview',
      'https://www.ecfr.gov/current/title-22/section-42.67#p-42.67(a)(3)',
    ),
  ],
  consularInterview: [
    source(
      'SRC-312',
      'DOS Applicant Interview, Step 11',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview/step-11-applicant-interview.html',
    ),
  ],
  adjustmentBars: [
    usc('SRC-309', '1255', '(c) (especially (c)(7)), (d), (k), (n)'),
    source('SRC-309', '8 CFR 245.1(b)(4)–(6), (9)–(10)'),
  ],
  discretion: [
    source('SRC-310', 'PM-602-0199 pp2–5, fn24'),
    pm('SRC-310', 7, 'A', 10),
  ],
  health: [
    usc('SRC-311', '1182', '(a)(1), (g)'),
    source('SRC-312', '42 CFR 34.2–34.3; PA-2025-08 pp1–2'),
    source(
      'SRC-312',
      'Form I-693, introduction, Dec. 2, 2024 effective date',
      'https://www.uscis.gov/i-693',
    ),
    pm('SRC-312', 8, 'B', 9),
    source(
      'SRC-309',
      'I-485 Instructions p11, Item 9',
      'https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf',
    ),
  ],
  consularHealth: [
    source(
      'SRC-312',
      'DOS Appointment, Medical Examination',
      'https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/step-10-prepare-for-the-interview/appointment.html',
    ),
  ],
  publicCharge: [
    usc('SRC-311', '1182', '(a)(4)'),
    source('SRC-313', '91 FR 45324, DATES and § I.D, Implementation'),
    source(
      'SRC-313',
      '9 FAM 302.8-2(B), including (6) for exemptions',
      'https://fam.state.gov/FAM/09FAM/09FAM030208.html',
    ),
  ],
  publicChargeExemptions: [
    source(
      'SRC-313',
      'Form I-485 p18, Part 9 Item 56',
      'https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf',
    ),
  ],
  criminal: [
    usc('SRC-311', '1182', '(a)(2), (h)'),
    source(
      'SRC-311',
      'PA criminal inadmissibility pp1–2',
      'https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20260923-CriminalInadmissibility.pdf',
    ),
  ],
  security: [usc('SRC-311', '1182', '(a)(3), including (D)(ii)–(iv)')],
  consularSecurity: [
    source(
      'SRC-311',
      '9 FAM 504.8-3, Clearing Immigrant Visa Applicants',
      'https://fam.state.gov/FAM/09FAM/09FAM050408.html',
    ),
  ],
  immigrationBars: [usc('SRC-311', '1182', '(a)(6), (a)(9), (i)')],
  otherImmigrationGrounds: [usc('SRC-311', '1182', '(a)(5)–(10)')],
  sijAdmissionExemptions: [usc('SRC-309', '1255', '(h)(2)(A)')],
  vawaAdmissionExemptions: [
    usc('SRC-311', '1182', '(a)(4)(E)(i), (a)(6)(A)(ii), (a)(9)(B)(iii)(IV)'),
    source(
      'SRC-311',
      'Form I-601 Instructions pp14–15, Approved VAWA Self-Petitioners',
      'https://www.uscis.gov/sites/default/files/document/forms/i-601instr.pdf#page=14',
    ),
  ],
  humanitarianAdmissionExemptions: [
    usc('SRC-314', '1159', '(c)'),
    pm('SRC-314', 7, 'L', 3, '(A)'),
    pm('SRC-314', 7, 'M', 3, '(A)'),
  ],
  humanitarian: [
    usc('SRC-314', '1159', '(a)–(b)'),
    pm('SRC-314', 7, 'L', 2, '(B)'),
    pm('SRC-314', 7, 'M', 2, '(A)'),
  ],
  humanitarianWaiver: [
    usc('SRC-314', '1159', '(c)'),
    pm('SRC-314', 7, 'L', 3, '(C)–(D)'),
    pm('SRC-314', 7, 'M', 3),
  ],
  military: [
    usc('SRC-315', '1439'),
    usc('SRC-315', '1440'),
    pm('SRC-315', 12, 'I', 2),
    pm('SRC-315', 12, 'I', 3),
  ],
  fee: [
    source(
      'SRC-316',
      'Form G-1055 edition 11/19/26, form number rows and Appendix B',
    ),
  ],
  consularFee: [source('SRC-317', '22 CFR 22.1, items 32–34')],
  ds117Fee: [source('SRC-317', '22 CFR 22.1, item 35(a)')],
  n336Fee: [source('SRC-316', 'Form G-1055 edition 11/19/26, p30, N-336')],
  eb5Fee: [source('SRC-318', '91 FR 61940 (DATES), 61984–61985 (8 CFR 106.2)')],
  hr1Fee: [
    source('SRC-319', '91 FR 22952 and 91 FR 62541, DATES and fee tables'),
  ],
  feeRelief: [
    source(
      'SRC-316',
      '8 CFR 106.2(b), 106.3; Form I-912 Instructions, Who May File',
      'https://www.uscis.gov/sites/default/files/document/forms/i-912instr.pdf',
    ),
  ],
} satisfies Record<string, SourceRef[]>;

const s = unitedStatesFullSources;
const parameter = <T>(value: T, sources: SourceRef[]): Parameter<T> => ({
  value,
  sources,
});

export const unitedStatesFull2026_11 = {
  asOf: '2026-11-23',
  values: {
    englishExemptions: parameter(
      [
        { age: 50, lprYears: 20 },
        { age: 55, lprYears: 15 },
      ],
      s.english,
    ),
    englishTest: parameter({ sentences: 3, correct: 1 }, s.english),
    civicsTest: parameter(
      {
        switchDate: '2025-10-20',
        old: { bank: 100, asked: 10, correct: 6 },
        current: { bank: 128, asked: 20, correct: 12 },
        special: { bank: 20, asked: 10, correct: 6, age: 65, lprYears: 20 },
        retestDays: { earliest: 60, latest: 90 },
      },
      s.civics,
    ),
    disabilityMonths: parameter(12, s.disability),
    aggravatedFelony: parameter(
      { from: '1990-11-29', sentenceYears: 1, proceedsOverUsd: 10000 },
      s.gmcPermanent,
    ),
    crime: parameter(
      {
        imprisonmentDays: 180,
        multipleConvictions: 2,
        combinedSentenceMonths: 60,
        pettyMaxMonths: 12,
        pettySentenceMonths: 6,
        cannabisGrams: 30,
        duiPresumptionCount: 2,
        juvenileAge: 18,
        juvenileYears: 5,
      },
      [...s.gmcConditional, ...s.criminal],
    ),
    gmcBenefitsFrom: parameter('2026-11-04', s.gmcConditional),
    party: parameter(
      {
        naturalizationYears: 10,
        minimumAge: 16,
        formerYears: 2,
        formerRulingYears: 5,
      },
      [...s.attachment, ...s.security],
    ),
    selective: parameter(
      { startAge: 18, endAge: 26, registrationDays: 30 },
      s.selective,
    ),
    natoServiceMonths: parameter(18, s.militaryBars),
    denaturalizationInquiryYears: parameter(10, s.district),
    registration: parameter(
      {
        carryAge: 18,
        renewAge: 14,
        reRegisterDays: 30,
        stayDays: 30,
        carryFineUsd: 100,
        carryJailDays: 30,
        registrationFineUsd: 1000,
        registrationJailMonths: 6,
      },
      s.registration,
    ),
    address: parameter(
      {
        days: 10,
        sponsorDays: 30,
        renewalMonths: 6,
        cardYears: 10,
        expiresBeforeAge: 16,
        fineUsd: 200,
        jailDays: 30,
      },
      [...s.address, ...s.sponsor],
    ),
    deportability: parameter(
      { cimtYears: 5, witnessYears: 10, cimtSentenceMonths: 12 },
      s.removal,
    ),
    reentryPermit: parameter(
      {
        years: 2,
        restrictedYears: 1,
        residenceLookbackYears: 5,
        abroadYears: 4,
      },
      s.return,
    ),
    familyAge: parameter(
      {
        adultSponsor: 21,
        child: 21,
        stepchild: 18,
        adoption: 16,
        siblingAdoption: 18,
        adoptionYears: 2,
        seekVisaYears: 1,
        priorMarriageYears: 5,
        proceedingsAbroadYears: 2,
      },
      [...s.relationship, ...s.petitionBars],
    ),
    poverty: parameter(
      {
        year: 2026,
        effective: '2026-01-13',
        i864Effective: '2026-03-01',
        i864ListedHouseholdSize: 8,
        contiguous: { first: 15960, additional: 5680 },
        alaska: { first: 19950, additional: 7100 },
        hawaii: { first: 18360, additional: 6530 },
      },
      s.poverty,
    ),
    sponsor: parameter(
      {
        age: 18,
        regular: 1.25,
        activeDuty: 1,
        assets: 5,
        citizenFamilyAssets: 3,
        orphanAssets: 1,
        assetLiquidationMonths: 12,
        quarters: 40,
        qualifyingFamilyOwnershipPct: 5,
      },
      s.sponsor,
    ),
    perm: parameter(
      {
        orderDays: 30,
        advertisements: 2,
        professionalSteps: 3,
        availableSteps: 10,
        minDays: 30,
        maxDays: 180,
        noticeWorkdays: 10,
        validDays: 180,
        wageRatio: 1,
      },
      s.perm,
    ),
    pay: parameter({ financialOfficerMinEmployees: 100 }, s.pay),
    portability: parameter({ pendingDays: 180 }, s.portability),
    selfPetition: parameter(
      {
        extraordinaryEvidence: 3,
        extraordinaryOptions: 10,
        progressiveExperienceYears: 5,
        exceptionalEvidence: 3,
        exceptionalOptions: 6,
        niwProngs: 3,
      },
      s.selfPetition,
    ),
    eb5: parameter(
      {
        rulesFrom: '2022-03-15',
        standardUsd: 1050000,
        reducedUsd: 800000,
        sustainmentYears: 2,
        jobs: 10,
        weeklyHours: 35,
        indirectMaxPct: 90,
        shortConstructionYears: 2,
        shortConstructionIndirectMaxPct: 75,
        reasonableJobYears: 3,
        firstAdjustment: '2027-01-01',
        adjustmentEveryYears: 5,
        cpiBase: '2022-01-01',
        roundDownUsd: 50000,
        reducedRatio: 0.75,
        unemploymentRatio: 1.5,
        reservedPct: { rural: 20, unemployment: 10, infrastructure: 2 },
      },
      [...s.eb5, ...s.i829],
    ),
    gold: parameter(
      {
        personGiftUsd: 1000000,
        companyGiftUsd: 2000000,
        dependentGiftUsd: 1000000,
        feePerPersonUsd: 15000,
      },
      s.gold,
    ),
    adjustment: parameter({ kDays: 180 }, s.adjustmentBars),
    medical: parameter(
      {
        covidRemoved: '2025-03-11',
        requiredWithI485From: '2024-12-02',
        applicationLinkedFrom: '2025-06-11',
        previousSignatureCutoff: '2023-11-01',
        previousValidityYears: 2,
      },
      s.health,
    ),
    publicCharge: parameter(
      { effective: '2026-09-18', minimumBondUsd: 1000, bondReviewYears: 5 },
      s.publicCharge,
    ),
    otherImmigrationGrounds: parameter(
      [
        '5(A)(i)',
        '5(B)',
        '5(C)',
        '6(A)(i)',
        '6(B)',
        '6(D)',
        '6(E)(i)',
        '6(F)(i)',
        '6(G)',
        '7(A)(i)',
        '8(A)',
        '8(B)',
        '9(A)(i)',
        '9(A)(ii)',
        '10(A)',
        '10(B)',
        '10(C)(i)',
        '10(C)(ii)',
        '10(D)',
        '10(E)',
      ] as const,
      s.otherImmigrationGrounds,
    ),
    sijAdmissionExemptions: parameter(
      ['4', '5(A)', '6(A)', '6(C)', '6(D)', '7(A)', '9(B)'],
      s.sijAdmissionExemptions,
    ),
    vawaAdjustmentAdmissionExemptions: parameter(
      ['4(A)', '4(B)', '4(C)', '6(A)(i)'],
      s.vawaAdmissionExemptions,
    ),
    vawaConsularAdmissionExemptions: parameter(
      ['4(A)', '4(B)', '4(C)'],
      s.vawaAdmissionExemptions,
    ),
    humanitarianAdmissionExemptions: parameter(
      ['4', '5', '7(A)'],
      s.humanitarianAdmissionExemptions,
    ),
    unlawfulPresence: parameter(
      {
        shortDays: 180,
        longDays: 365,
        shortBarYears: 3,
        longBarYears: 10,
        childAge: 18,
        citizenshipBeliefAge: 16,
      },
      s.immigrationBars,
    ),
    humanitarian: parameter(
      { presenceDays: 365, asyleeRollbackYears: 1 },
      s.humanitarian,
    ),
    military: parameter(
      {
        serviceYears: 1,
        lateFilingMonths: 6,
        peacetimeGmcYears: 5,
        hostilitiesGmcYears: 1,
        hostilities: [
          ['1917-04-06', '1918-11-11'],
          ['1939-09-01', '1946-12-31'],
          ['1950-06-25', '1955-07-01'],
          ['1961-02-28', '1978-10-15'],
          ['1990-08-02', '1991-04-11'],
          ['2001-09-11', undefined],
        ],
      },
      s.military,
    ),
    fees: parameter(
      {
        none: 0,
        registration: 0,
        address: 0,
        i90: { paper: 465, online: 415 },
        i130: { paper: 675, online: 625 },
        i864: 0,
        i140: { paper: 715, online: 665 },
        i140AsylumProgram: { regular: 600, small: 300, nonprofit: 0 },
        smallEmployerMax: 25,
        i907: 2965,
        i485: { paper: 1440, online: 1390 },
        i485Child: { paper: 950, online: 900 },
        i485ChildAge: 14,
        immigrantFee: 235,
        reentryPermit: 630,
        advanceParole: { paper: 630, online: 580 },
        refugeeTravel: { adult: 165, minor: 135, adultAge: 16 },
        i131a: 575,
        i751: { paper: 750, online: 700 },
        n400: { paper: 760, online: 710 },
        n400Reduced: 380,
        n336: { paper: 830, online: 780 },
        waiverRatio: 1.5,
        reducedRatio: 4,
        supplementAUsd: 1000,
      },
      [...s.fee, ...s.feeRelief],
    ),
    consularFees: parameter(
      {
        family: 325,
        employment: 345,
        other: 205,
        diversity: 330,
        i864: 120,
        ds117: 180,
      },
      [...s.consularFee, ...s.ds117Fee],
    ),
    eb5Fees: parameter(
      {
        effective: '2026-11-30',
        old: {
          i526: 3675,
          i526e: 3675,
          integrity: 1000,
          amendment: 3675,
          i829: 3750,
        },
        current: {
          i526: 7615,
          i526e: 7850,
          integrity: 1100,
          amendment: 7775,
          i829: 5000,
        },
      },
      [...s.eb5Fee, ...s.fee],
    ),
    hr1Fees: parameter(
      {
        effective: '2026-10-16',
        asylumInitial: 100,
        asylumAnnual: [102, 105],
        workInitial: [560, 570],
        asylumWorkRenewal: 275,
        otherWorkRenewal: 280,
        tps: [510, 520],
        sij: 250,
        parole: [1020, 1050],
        i94: [24, 24],
      },
      s.hr1Fee,
    ),
  },
} satisfies { asOf: string; values: Record<string, Parameter<unknown>> };
