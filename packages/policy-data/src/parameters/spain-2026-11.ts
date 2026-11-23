import type { Parameter, ParameterSet } from '../types';

// Spain pilot (phase 18, task 63): Reglamento de extranjería (RD 1155/2024,
// SRC-083) and Código Civil (SRC-084).
export const spain2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Residencia de larga duración nacional: years of legal, continuous
    // residence before applying.
    longTermYears: {
      value: 5,
      sources: [{ srcId: 'SRC-083', locator: 'art. 183.1 (p133)' }],
    },
    // Applying within this many months after the permit expired extends it.
    longTermLateMonths: {
      value: 3,
      sources: [
        { srcId: 'SRC-083', locator: 'art. 184.2 (p134–p135)' },
        // Ending on a Saturday or Sunday, it moves to the next working day.
        { srcId: 'SRC-090', locator: 'art. 30.2, 30.4, 30.5 (p29–p30)' },
      ],
    },
    // Absences that do not break continuity: each up to this many months...
    singleAbsenceMonths: {
      value: 6,
      sources: [{ srcId: 'SRC-083', locator: 'art. 183.2 (p133)' }],
    },
    // ...and up to this many months in total within the five years.
    totalAbsenceMonths: {
      value: 10,
      sources: [{ srcId: 'SRC-083', locator: 'art. 183.2 (p133)' }],
    },
    // Nacionalidad por residencia: years of residence by route.
    nationalityYears: {
      value: {
        general: 10,
        refugee: 5,
        ibero: 2,
        marriage: 1,
        'one-year': 1,
      },
      sources: [{ srcId: 'SRC-084', locator: 'art. 22.1–22.2 (p21)' }],
    },
    // Married to a Spanish citizen for this many years when applying.
    marriageYears: {
      value: 1,
      sources: [{ srcId: 'SRC-084', locator: 'art. 22.2.d) (p21)' }],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | Record<string, number>>>;
};

const nationalityValues = {
  nationalityRefugeeCertificateMonths: {
    value: 6,
    sources: [{ srcId: 'SRC-322', locator: 'Orden JUS/1625/2016 anexo §2.h' }],
  },
  nationalityGuardianshipYears: {
    value: 2,
    sources: [{ srcId: 'SRC-084', locator: 'art. 22.2.c' }],
  },
  nationalityOptionExpiryAge: {
    value: 20,
    sources: [{ srcId: 'SRC-084', locator: 'art. 20.2.c' }],
  },
  nationalityOptionExtensionYears: {
    value: 2,
    sources: [{ srcId: 'SRC-084', locator: 'art. 20.2.c/e' }],
  },
  nationalityAssistedAge: {
    value: 14,
    sources: [{ srcId: 'SRC-084', locator: 'arts. 20.2, 21.3, 23.a/b' }],
  },
  nationalityAdultAge: {
    value: 18,
    sources: [
      { srcId: 'SRC-084', locator: 'arts. 21.3, 240' },
      { srcId: 'SRC-322', locator: 'Orden JUS/1625/2016 art. 10.6' },
    ],
  },
  nationalityDeleMinimum: {
    value: 'A2',
    sources: [{ srcId: 'SRC-321', locator: 'art. 6.1, DA 4' }],
  },
  nationalityDeleExemptCountries: {
    value: [
      'AR',
      'BO',
      'CL',
      'CO',
      'CR',
      'CU',
      'EC',
      'SV',
      'GT',
      'GQ',
      'HN',
      'MX',
      'NI',
      'PA',
      'PY',
      'PE',
      'PR',
      'DO',
      'UY',
      'VE',
    ],
    sources: [
      { srcId: 'SRC-321', locator: 'art. 6.5' },
      { srcId: 'SRC-322', locator: 'Orden JUS/1625/2016 art. 10.2' },
    ],
  },
  nationalityCcseQuestions: {
    value: 25,
    sources: [{ srcId: 'SRC-335', locator: 'Guía para la prueba CCSE §5' }],
  },
  nationalityCcsePass: {
    value: 15,
    sources: [{ srcId: 'SRC-335', locator: 'Guía para la prueba CCSE §5' }],
  },
  nationalityCcseYears: {
    value: 4,
    sources: [{ srcId: 'SRC-322', locator: 'Orden JUS/1625/2016 art. 10.4' }],
  },
  nationalityDispensaMonths: {
    value: 6,
    sources: [{ srcId: 'SRC-322', locator: 'Orden JUS/1625/2016 art. 10.5' }],
  },
  nationalityApplicationFee: {
    value: 104.05,
    sources: [
      { srcId: 'SRC-323', locator: 'Nueva tasa desde el 1 de enero de 2022' },
      { srcId: 'SRC-334', locator: 'DF 7.4' },
    ],
  },
  nationalityCcseFee: {
    value: 85,
    sources: [
      { srcId: 'SRC-335', locator: 'Precio de la prueba CCSE (desde 2023)' },
    ],
  },
  nationalityCcseRetakeMonths: {
    value: 6,
    sources: [
      {
        srcId: 'SRC-335',
        locator:
          'Términos y condiciones, C. CCSE: Condiciones particulares, Procedimiento de inscripción',
      },
    ],
  },
  nationalityDeleSpainFee: {
    value: 138,
    sources: [{ srcId: 'SRC-336', locator: 'DELE 2026 p4 España/A2' }],
  },
  nationalityExamPriceYear: {
    value: '2026',
    sources: [
      { srcId: 'SRC-336', locator: 'DELE 2026 p4 España/A2' },
      { srcId: 'SRC-335', locator: 'Precio de la prueba CCSE' },
    ],
  },
  nationalityDeclarationDays: {
    value: 180,
    sources: [
      { srcId: 'SRC-084', locator: 'art. 21.4' },
      { srcId: 'SRC-321', locator: 'art. 12.1' },
    ],
  },
  nationalityFrenchTreatyFrom: {
    value: '2022-04-01',
    sources: [
      {
        srcId: 'SRC-346',
        locator:
          'Convenio art. 1, entrada en vigor; Instrucción de 31-03-2022 §2',
      },
    ],
  },
};

const residenceValues = {
  workAbsenceMonths: {
    value: 18,
    sources: [{ srcId: 'SRC-083', locator: 'arts. 176.a, 183.2 (pp128, 134)' }],
  },
  schoolAgeFrom: {
    value: 6,
    sources: [{ srcId: 'SRC-341', locator: 'art. 4.2' }],
  },
  schoolAgeUntil: {
    value: 16,
    sources: [{ srcId: 'SRC-341', locator: 'art. 4.2' }],
  },
  schoolRemedyMonths: {
    value: 1,
    sources: [{ srcId: 'SRC-083', locator: 'art. 184.4 (p135)' }],
  },
  residenceMajorityAge: {
    value: 18,
    sources: [{ srcId: 'SRC-084', locator: 'art. 240' }],
  },
  spanishBornResidenceYears: {
    value: 3,
    sources: [{ srcId: 'SRC-083', locator: 'art. 183.3.c (p134)' }],
  },
  publicCareYears: {
    value: 5,
    sources: [{ srcId: 'SRC-083', locator: 'art. 183.3.e (p134)' }],
  },
  criminalRecordYears: {
    value: 5,
    sources: [
      { srcId: 'SRC-083', locator: 'arts. 177.3.f, 184.3.e (pp129, 135)' },
    ],
  },
  earlyFilingMonths: {
    value: 2,
    sources: [{ srcId: 'SRC-083', locator: 'arts. 177.2, 184.2 (pp129, 135)' }],
  },
  euResidenceYears: {
    value: 5,
    sources: [{ srcId: 'SRC-083', locator: 'art. 176.a (p128)' }],
  },
  euAbsenceMonths: {
    value: { single: 6, total: 10 },
    sources: [{ srcId: 'SRC-083', locator: 'art. 176.a (p128)' }],
  },
  blueAbsenceMonths: {
    value: { single: 12, total: 18 },
    sources: [{ srcId: 'SRC-083', locator: 'art. 176.a.1 (p128)' }],
  },
  blueSpainYears: {
    value: 2,
    sources: [{ srcId: 'SRC-083', locator: 'art. 176.a.2 (p129)' }],
  },
  blueMobilityMonths: {
    value: { first: 12, subsequent: 6 },
    sources: [{ srcId: 'SRC-332', locator: 'art. 71 bis.4' }],
  },
  euStudyCredit: {
    value: 0.5,
    sources: [
      { srcId: 'SRC-083', locator: 'art. 176.a, including 1.º (p128)' },
    ],
  },
  ipremMonthly: {
    value: 600,
    sources: [
      {
        srcId: 'SRC-326',
        locator: 'Ley 31/2022 DA 90.a–c; SEPE Valores mensuales y anuales',
      },
    ],
  },
  ipremYear: {
    value: 2026,
    sources: [
      {
        srcId: 'SRC-326',
        locator: 'SEPE Cuantías anuales, Valores mensuales y anuales, 2026',
      },
    ],
  },
  familyResourceFactors: {
    value: { baseSize: 2, base: 1.5, additional: 0.5 },
    sources: [{ srcId: 'SRC-083', locator: 'art. 67.1 (p55)' }],
  },
  resourceAssetMonths: {
    value: 6,
    sources: [{ srcId: 'SRC-083', locator: 'art. 67.1.d (p56)' }],
  },
  imvAnnualIndividual: {
    value: 8803.2,
    sources: [
      {
        srcId: 'SRC-337',
        locator: 'Ley 19/2021 art. 13.2; RDL 3/2026 art. 2.5, DF 4',
      },
    ],
  },
  imvReductionFactors: {
    value: { base: 1.1, additional: 0.1 },
    sources: [{ srcId: 'SRC-083', locator: 'art. 67.1 (p55)' }],
  },
};

const mobilityValues = {
  mobilityApplicationMonths: {
    value: 3,
    sources: [{ srcId: 'SRC-083', locator: 'arts. 179.2, 180.2 (pp131–132)' }],
  },
  mobilityEntryMonths: {
    value: 3,
    sources: [
      { srcId: 'SRC-083', locator: 'arts. 179.5–6, 180.5 (pp132–133)' },
    ],
  },
  mobilityDecisionMonths: {
    value: 2,
    sources: [{ srcId: 'SRC-083', locator: 'arts. 179.4, 180.4 (pp132–133)' }],
  },
  mobilityNonWorkingFactors: {
    value: { applicant: 4, dependant: 1 },
    sources: [
      { srcId: 'SRC-083', locator: 'arts. 62.1.a–b, 179.3.d.1º (pp51, 131)' },
    ],
  },
  smiMonthly: {
    value: 1221,
    sources: [
      { srcId: 'SRC-340', locator: 'RD 126/2026 art. 1, DF tercera (2026)' },
    ],
  },
  smiAnnual: {
    value: 17094,
    sources: [
      { srcId: 'SRC-340', locator: 'RD 126/2026 art. 3.1, DF tercera (2026)' },
    ],
  },
  smiYear: {
    value: 2026,
    sources: [{ srcId: 'SRC-340', locator: 'RD 126/2026 DF tercera' }],
  },
  employerSmiFactors: {
    value: { single: 0.5, pair: 1, pairSize: 2, extra: 0.25 },
    sources: [{ srcId: 'SRC-083', locator: 'art. 76.2.a–c (p64)' }],
  },
  employmentAge: {
    value: { minimum: 16, unrestricted: 18 },
    sources: [
      {
        srcId: 'SRC-340',
        locator: 'RDL 2/2015 arts. 6–7 (edad y capacidad para contratar)',
      },
    ],
  },
  reunificationAge: {
    value: { adult: 18, ascendant: 65 },
    sources: [
      { srcId: 'SRC-320', locator: 'art. 17.1.b–d (familiares reagrupables)' },
    ],
  },
  familyCardThresholdMonths: {
    value: 6,
    sources: [{ srcId: 'SRC-083', locator: 'art. 180.7 (p133)' }],
  },
};

export const spainFull2026_11 = {
  ruleSetId: 'es.current-law',
  asOf: '2026-11-23',
  values: {
    ...spain2026_11.values,
    ...nationalityValues,
    ...residenceValues,
    ...mobilityValues,
    applicationFeeEur: {
      value: 21.87,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 2.6' }],
    },
    recoveryFeeEur: {
      value: 21.87,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 2.7' }],
    },
    paymentWorkingDays: {
      value: 10,
      sources: [
        {
          srcId: 'SRC-324',
          locator: 'Hoja 50, Procedimiento: tasa (also Hojas 49, 51–54)',
        },
      ],
    },
    tieFeeEur: {
      value: 21.87,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 4.5' }],
    },
    firstCardMonths: {
      value: 1,
      sources: [
        {
          srcId: 'SRC-083',
          locator: 'arts. 177.7, 179.7, 184.7, 187.6, 189.7',
        },
      ],
    },
    initialCardYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-083', locator: 'arts. 178, 179.7, 185, 187.6, 189.7' },
      ],
    },
    euCardFeeEur: {
      value: 12,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 4.6' }],
    },
    initialTemporaryCardFeeEur: {
      value: 16.08,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 4.2' }],
    },
    renewedTemporaryCardFeeEur: {
      value: 19.3,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 4.3' }],
    },
    publicWardCardFeeEur: {
      value: 0,
      sources: [{ srcId: 'SRC-325', locator: 'anexo 4.7' }],
    },
    residenceLawFrom: {
      value: '2025-05-20',
      sources: [{ srcId: 'SRC-338', locator: 'RD 1155/2024 DT 2, DF 4' }],
    },
    feeScheduleFrom: {
      value: '2025-06-16',
      sources: [{ srcId: 'SRC-325', locator: 'DF 4' }],
    },
    tieRenewal: {
      value: { age: 30, olderYears: 10, earlyMonths: 2, lateMonths: 3 },
      sources: [{ srcId: 'SRC-083', locator: 'arts. 178.1–3, 185.1–3' }],
    },
    statusLoss: {
      value: {
        euMonths: 12,
        blueMonths: 24,
        spainYears: 6,
        hearingDays: 10,
        decisionMonths: 6,
      },
      sources: [{ srcId: 'SRC-083', locator: 'arts. 201.1.c, 201.2, 202–203' }],
    },
    returnCommitment: {
      value: { years: 3, visitMonths: 3 },
      sources: [{ srcId: 'SRC-083', locator: 'art. 189.4' }],
    },
    recoveryPassportYears: {
      value: 1,
      sources: [{ srcId: 'SRC-083', locator: 'arts. 38.d, 187.2, 189.2' }],
    },
    recoveryDecisionMonths: {
      value: 3,
      sources: [{ srcId: 'SRC-083', locator: 'arts. 187.5, 189.6' }],
    },
    euFamily: {
      value: { dependentAge: 21, householdMonths: 24, partnerYears: 1 },
      sources: [{ srcId: 'SRC-327', locator: 'arts. 2.c and 2 bis.4' }],
    },
    freeMovementResidence: {
      value: {
        years: 5,
        annualAwayMonths: 6,
        importantMonths: 12,
        lossYears: 2,
      },
      sources: [{ srcId: 'SRC-330', locator: 'arts. 16.1–4, 21' }],
    },
    retainedWorker: {
      value: {
        longEmploymentYears: 1,
        shortEmploymentMonths: 12,
        retainedMonths: 6,
      },
      sources: [{ srcId: 'SRC-327', locator: 'art. 7.3' }],
    },
    euRetention: {
      value: { beforeDeathYears: 1, relationshipYears: 3, inSpainYears: 1 },
      sources: [{ srcId: 'SRC-330', locator: 'arts. 12.2, 13.2.a' }],
    },
    earlyPermanent: {
      value: {
        retirementWorkMonths: 12,
        retirementResidenceYears: 3,
        incapacityYears: 2,
        crossBorderYears: 3,
        deathYears: 2,
      },
      sources: [{ srcId: 'SRC-327', locator: 'art. 10.2–5' }],
    },
    retirementTable: {
      value: {
        year: 2026,
        contributionMonths: 459,
        ageMonths: 780,
        otherAgeMonths: 802,
      },
      sources: [
        {
          srcId: 'SRC-344',
          locator:
            'Jubilación ordinaria, Edad, 2026: 38 años y 3 meses, 65 años o 66 años y 10 meses',
        },
      ],
    },
    euDocument: {
      value: {
        photos: 3,
        earlyMonths: 1,
        lateMonths: 3,
        issueMonths: 3,
        cardYears: 10,
      },
      sources: [
        {
          srcId: 'SRC-328',
          locator: 'Hoja 63: DOCUMENTACIÓN, PROCEDIMIENTO; RD 240/2007 art. 11',
        },
      ],
    },
    euHealthReviewMonths: {
      value: 3,
      sources: [{ srcId: 'SRC-327', locator: 'art. 15.9' }],
    },
  },
} satisfies ParameterSet;
