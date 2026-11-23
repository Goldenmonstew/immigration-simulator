import { expect, test } from 'vitest';
import {
  functionalEnglish,
  functionalEnglishCheck,
  skilledChecks,
} from '../src/australia-skilled';
import {
  evaluateAustraliaFull,
  type AuFullPathId,
  type AuFullRequest,
} from '../src/australia-full';

const base: AuFullRequest = {
  simulationDate: '2026-11-23',
  dateOfBirth: '1994-11-23',
  locale: 'en',
};
const offer = {
  status: 'approved',
  lodged: '2026-07-01',
  approved: '2026-07-10',
  positionAvailable: true,
  fullTimeRenewable: true,
  offeredYears: 2,
  annualSalary: 79423,
  acceptedMarketRate: 79423,
  licensing: 'licensed-or-eligible',
} as const;
const employer: NonNullable<AuFullRequest['employer']> = {
  exemption: 'none',
  nominations: { 'AU-186-DE': offer, 'AU-186-TRT': offer },
  sponsorshipConduct: 'clear',
  trtPrimaryVisa: true,
  trtOccupationMatches: true,
  trtSkillsDemonstration: 'not-requested',
  csolOccupation: true,
  assessment: { kind: 'positive', issued: '2023-11-23' },
  fullTimeExperienceYears: 3,
};
const english: AuFullRequest['english'] = {
  passport: 'other',
  education: 'none',
  test: {
    name: 'ielts',
    date: '2026-01-01',
    format: 'approved',
    components: [7, 7, 7, 7],
  },
};
const skills: NonNullable<AuFullRequest['skills']> = {
  invitations: {
    'AU-189-PT': { issued: '2026-11-20', deadline: '2027-01-19', score: 65 },
    'AU-190': { issued: '2026-11-20', deadline: '2027-01-19', score: 70 },
  },
  occupationList: 'MLTSSL',
  occupationInInvitation: { 'AU-189-PT': true, 'AU-190': true },
  assessment: { kind: 'positive', issued: '2023-11-20' },
  nomination: 'active',
  points: {
    overseasMonths: 0,
    australianMonths: 0,
    professionalMonths: 0,
    education: 'bachelor',
    specialistStudyYears: 0,
    australianStudy: { qualifying: false },
    communityLanguageCredential: false,
    partner: 'singleOrAustralian',
  },
};
const innovation: NonNullable<AuFullRequest['innovation']> = {
  invitation: { issued: '2026-11-22', deadline: '2026-11-23' },
  achievement: 'accepted',
  achievementsMatchInvitation: true,
  form1000: 'confirmed',
};
const full = { ...base, employer, english, skills, innovation };
const get = (id: AuFullPathId, suffix: string, r: AuFullRequest) =>
  skilledChecks(id, r).find((c) => c.id === id + '-' + suffix)!;

function pointsPath(
  pathway: 'AU-189-PT' | 'AU-190',
  answers: Partial<AuFullRequest>,
) {
  return evaluateAustraliaFull({
    ...full,
    pathway,
    visas: [],
    locationAtApplication: 'offshore',
    locationAtDecision: 'offshore',
    fees: { additionalAdults: 0, additionalMinors: 0 },
    publicInterest: {
      officialPassport: true,
      character: 'clear-history',
      health: 'cleared',
      policeDocuments: 'supplied',
      securityAndForeignPolicy: 'cleared',
      criticalTechnology: 'cleared',
      commonwealthDebt: 'none',
      valuesSigned: true,
      integrity: {
        identityEstablished: true,
        accurateDocuments: true,
        lastIdentityRefusal: null,
        lastDocumentRefusal: null,
      },
      returnBan5001: false,
      removedOn: null,
      sponsoredStudy: { applies: false },
      settlementWithoutUndueDifficulty: true,
    },
    ...answers,
  }).columns[0].pathways[0];
}

for (const id of [
  'AU-186-TRT',
  'AU-186-DE',
  'AU-189-PT',
  'AU-190',
  'AU-858',
] as const) {
  test(
    id + ' has bilingual, sourced checks; complete versus missing evidence',
    () => {
      const checks = skilledChecks(id, full);
      const zh = skilledChecks(id, { ...full, locale: 'zh-CN' });
      const missing = skilledChecks(id, {
        simulationDate: base.simulationDate,
      });
      expect(zh.map((c) => c.id)).toEqual(checks.map((c) => c.id));
      expect(new Set(checks.map((c) => c.id)).size).toBe(checks.length);
      for (const [i, c] of checks.entries()) {
        expect(c.status, c.id).toBe('MET');
        expect(missing[i].status, c.id).toBe('UNKNOWN');
        expect(c.sources.every((s) => s.srcId && s.locator)).toBe(true);
        expect(zh[i].explanation).not.toBe(c.explanation);
      }
    },
  );
}

test('186 age, FWHIT and distinct LIN 19/216 classes', () => {
  const older = { ...full, dateOfBirth: '1981-11-23' };
  for (const id of ['AU-186-DE', 'AU-186-TRT'] as const) {
    expect(get(id, 'age', older).status).toBe('NOT_MET');
    expect(get(id, 'age', { ...older, dateOfBirth: '1981-11-24' }).status).toBe(
      'MET',
    );
    expect(
      get(id, 'age', { ...older, employer: { exemption: 'academic' } }).status,
    ).toBe('MET');
    expect(
      get(id, 'age', { ...older, employer: { exemption: '444-461' } }).status,
    ).toBe(id === 'AU-186-DE' ? 'MET' : 'NOT_MET');
  }
  expect(
    get('AU-186-TRT', 'age', {
      ...older,
      employer: { exemption: 'high-income-457-482' },
    }).pendingDetails,
  ).toEqual(['PD-206']);
  expect(
    get('AU-186-TRT', 'age', {
      ...older,
      employer: { exemption: 'legacy-457' },
    }).status,
  ).toBe('NOT_MET');
  expect(
    get('AU-186-TRT', 'age', {
      ...older,
      dateOfBirth: '1976-11-23',
      employer: { exemption: 'transitional-457' },
    }).status,
  ).toBe('NOT_MET');
  expect(
    get('AU-186-TRT', 'age', {
      ...older,
      dateOfBirth: '1976-11-24',
      employer: { exemption: 'transitional-457' },
    }).status,
  ).toBe('MET');
});

test('DE experience and short assessments, including statutory exemptions', () => {
  expect(
    get('AU-186-DE', 'experience', {
      ...full,
      employer: { ...employer, fullTimeExperienceYears: 2.99 },
    }).status,
  ).toBe('NOT_MET');
  for (const assessment of [
    { kind: '485' as const },
    { kind: 'positive' as const, issued: '2023-11-22' },
    { kind: 'positive' as const, issued: '2025-01-01', expires: '2026-11-22' },
  ])
    expect(
      get('AU-186-DE', 'assessment', {
        ...full,
        employer: { ...employer, assessment },
      }).status,
    ).toBe('NOT_MET');
  for (const name of ['experience', 'assessment'])
    expect(
      get('AU-186-DE', name, { ...full, employer: { exemption: 'science' } })
        .status,
    ).toBe('MET');
});

test('186 salary on the nomination date, AMSR and offer duration', () => {
  for (const id of ['AU-186-TRT', 'AU-186-DE'] as const) {
    const check = (
      suffix: string,
      nomination: NonNullable<typeof employer.nominations>[typeof id],
    ) =>
      get(id, suffix, {
        ...full,
        employer: { ...employer, nominations: { [id]: nomination } },
      });
    expect(check('salary', { ...offer, annualSalary: 79422 }).status).toBe(
      'NOT_MET',
    );
    expect(
      check('salary', { ...offer, lodged: '2026-06-30', annualSalary: 76515 })
        .status,
    ).toBe('MET');
    expect(
      check('market-salary', { ...offer, acceptedMarketRate: 79424 }).status,
    ).toBe('NOT_MET');
    expect(
      check('market-salary', { ...offer, acceptedMarketRate: 79422 }).status,
    ).toBe('NOT_MET');
    expect(
      check('market-salary', { annualSalary: 249999 }).pendingDetails,
    ).toEqual(['PD-208']);
    expect(check('market-salary', { annualSalary: 250000 }).status).toBe('MET');
    expect(check('position', { ...offer, offeredYears: 1.99 }).status).toBe(
      'NOT_MET',
    );
    expect(
      check('nomination', { ...offer, approved: '2026-05-23' }).status,
    ).toBe('MET');
    expect(
      check('nomination', { ...offer, approved: '2026-05-22' }).status,
    ).toBe('NOT_MET');
  }
});

test('points at invitation: age, list, legal pass and separate invitation score', () => {
  // 25–32: 30; proficient: 10; bachelor: 15; single: 10. Total 65, plus 5 for 190.
  for (const [id, score] of [
    ['AU-189-PT', 65],
    ['AU-190', 70],
  ] as const) {
    expect(get(id, 'points', full).explanation).toContain(score + ' points');
    const higher = {
      ...skills,
      invitations: {
        [id]: {
          issued: '2026-11-20',
          deadline: '2027-01-19',
          score: score + 1,
        },
      },
    };
    expect(get(id, 'invited-score', { ...full, skills: higher }).status).toBe(
      'NOT_MET',
    );
    expect(get(id, 'age', { ...full, dateOfBirth: '1981-11-21' }).status).toBe(
      'MET',
    );
    expect(get(id, 'age', { ...full, dateOfBirth: '1981-11-20' }).status).toBe(
      'NOT_MET',
    );
    expect(
      get(id, 'occupation', {
        ...full,
        skills: { ...skills, occupationList: 'STSOL' },
      }).status,
    ).toBe(id === 'AU-190' ? 'MET' : 'NOT_MET');
    expect(
      get(id, 'assessment', {
        ...full,
        skills: {
          ...skills,
          assessment: { kind: 'positive', issued: '2023-11-19' },
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      get(id, 'invitation', { ...full, simulationDate: '2027-01-20' }).status,
    ).toBe('NOT_MET');
  }
  expect(
    get('AU-189-PT', 'invitation', {
      ...full,
      skills: { ...skills, invitations: { 'AU-189-PT': 'awaiting' } },
    }).pendingDetails,
  ).toEqual(['PD-209']);
  expect(
    get('AU-190', 'nomination', {
      ...full,
      skills: { ...skills, nomination: 'withdrawn' },
    }).status,
  ).toBe('NOT_MET');
  expect(
    get('AU-190', 'nomination', {
      ...full,
      skills: { ...skills, nomination: 'awaiting' },
    }).pendingDetails,
  ).toEqual(['PD-211']);
});

test('189 confirms each points threshold independently of an unreported English test', () => {
  const id = 'AU-189-PT';
  // Age 36 (25), eight overseas years (15), bachelor (15), single (10).
  const result = (score: number, test?: 'none') =>
    pointsPath(id, {
      dateOfBirth: '1990-01-01',
      english: { passport: 'GB', test },
      skills: {
        ...skills,
        invitations: {
          [id]: { issued: '2026-11-20', deadline: '2027-01-19', score },
        },
        points: { ...skills.points, overseasMonths: 96 },
      },
    });
  for (const test of [undefined, 'none'] as const) {
    const p = result(65, test);
    for (const suffix of ['english', 'points', 'invited-score'])
      expect(p.checks.find((c) => c.id === id + '-' + suffix)?.status).toBe(
        'MET',
      );
    expect(p).toMatchObject({ status: 'MET', earliestDate: '2026-11-23' });
  }
  for (const [score, test, status] of [
    [70, undefined, 'UNKNOWN'],
    [70, 'none', 'NOT_MET'],
    [90, undefined, 'NOT_MET'],
  ] as const) {
    const p = result(score, test);
    expect(p.checks.find((c) => c.id === id + '-points')?.status).toBe('MET');
    expect(p.checks.find((c) => c.id === id + '-invited-score')?.status).toBe(
      status,
    );
    expect(p.status).toBe(status);
    expect(p.earliestDate).toBeUndefined();
  }
});

test.each(['AU-189-PT', 'AU-190'] as const)(
  '%s accepts an assessment obtained within the invitation window',
  (id) => {
    const result = (
      assessment: NonNullable<AuFullRequest['skills']>['assessment'],
      simulationDate = '2026-11-23',
      deadline = '2026-11-30',
    ) =>
      pointsPath(id, {
        simulationDate,
        skills: {
          ...skills,
          invitations: { [id]: { issued: '2026-10-01', deadline, score: 65 } },
          assessment,
        },
      });
    const assessmentId = id + '-assessment';
    for (const issued of ['2026-10-15', '2026-10-01']) {
      const p = result({ kind: 'positive', issued });
      const check = p.checks.find((c) => c.id === assessmentId)!;
      expect(check.status).toBe('MET');
      expect(check.sources.map((s) => s.srcId)).toEqual(['SRC-200', 'SRC-225']);
      expect(check.pendingDetails).toBeUndefined();
      expect(p).toMatchObject({ status: 'MET', earliestDate: '2026-11-23' });
    }
    const lastDay = result(
      { kind: 'positive', issued: '2026-11-30' },
      '2026-11-30',
    );
    expect(lastDay.checks.find((c) => c.id === assessmentId)?.status).toBe(
      'MET',
    );
    expect(lastDay).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-30',
    });
    for (const waiting of [
      result({ kind: 'awaiting' }),
      result({ kind: 'positive', issued: '2026-11-24' }),
    ]) {
      expect(waiting.checks.find((c) => c.id === assessmentId)).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-210'],
      });
      expect(waiting.status).toBe('UNKNOWN');
      expect(waiting.earliestDate).toBeUndefined();
    }
    for (const p of [
      result({ kind: '485', issued: '2026-10-15' }),
      result({ kind: 'positive', issued: '2026-10-15', expires: '2026-11-22' }),
      result(
        { kind: 'positive', issued: '2026-12-01' },
        '2026-12-01',
        '2026-12-03',
      ),
      result(
        { kind: 'positive', issued: '2026-10-15' },
        '2026-10-15',
        '2026-10-14',
      ),
    ]) {
      expect(p.checks.find((c) => c.id === assessmentId)?.status).toBe(
        'NOT_MET',
      );
      expect(p.status).toBe('NOT_MET');
      expect(p.earliestDate).toBeUndefined();
    }
  },
);

test('each Schedule 6D increment, including the combined employment cap', () => {
  const total = (
    points: NonNullable<NonNullable<AuFullRequest['skills']>['points']>,
  ) =>
    get('AU-189-PT', 'points', {
      ...full,
      skills: { ...skills, points: { ...skills.points, ...points } },
    }).explanation;
  for (const [months, points] of [
    [35, 0],
    [36, 5],
    [59, 5],
    [60, 10],
    [95, 10],
    [96, 15],
  ])
    expect(total({ overseasMonths: months })).toContain(
      65 + points + ' points',
    );
  for (const [months, points] of [
    [11, 0],
    [12, 5],
    [36, 10],
    [60, 15],
    [96, 20],
  ])
    expect(total({ australianMonths: months })).toContain(
      65 + points + ' points',
    );
  expect(total({ overseasMonths: 96, australianMonths: 96 })).toContain(
    '85 points',
  );
  // 65+20 work+5 PY+5 doctorate upgrade+10 specialist+5 study+5 regional+5 language=120.
  expect(
    total({
      overseasMonths: 96,
      australianMonths: 96,
      professionalMonths: 12,
      education: 'doctorate',
      specialistStudyYears: 2,
      australianStudy: {
        qualifying: true,
        academicYears: 2,
        calendarMonths: 16,
      },
      regionalCampusAndResidenceNoDistanceStudy: true,
      communityLanguageCredential: true,
    }),
  ).toContain('120 points');
  expect(
    total({
      professionalMonths: 11,
      specialistStudyYears: 1,
      australianStudy: {
        qualifying: true,
        academicYears: 2,
        calendarMonths: 15,
      },
      regionalCampusAndResidenceNoDistanceStudy: true,
    }),
  ).toContain('65 points');
  expect(total({ partner: 'competent' })).toContain('60 points');
  expect(total({ education: 'diplomaTradeOrAssessed' })).toContain('60 points');
  for (const [birth, score] of [
    ['2008-11-20', 60],
    ['2001-11-21', 60],
    ['2001-11-20', 65],
    ['1993-11-20', 60],
    ['1986-11-20', 50],
    ['1981-11-20', 35],
  ]) {
    expect(
      get('AU-189-PT', 'points', { ...full, dateOfBirth: String(birth) })
        .explanation,
    ).toContain(score + ' points');
  }
});

test('test scores change on commencement, and each component is required', () => {
  const assessed = (
    name: 'pte' | 'ielts',
    date: string,
    components: [number, number, number, number],
  ) =>
    get('AU-186-DE', 'english', {
      ...base,
      english: {
        passport: 'other',
        test: { name, date, format: 'approved', components },
      },
    }).status;
  expect(assessed('pte', '2025-08-06', [50, 50, 50, 50])).toBe('MET');
  expect(assessed('pte', '2025-08-07', [50, 50, 50, 50])).toBe('NOT_MET');
  expect(assessed('pte', '2025-08-07', [47, 48, 51, 54])).toBe('MET');
  expect(assessed('pte', '2025-08-07', [47, 48, 51, 53])).toBe('NOT_MET');
  expect(assessed('ielts', '2023-11-23', [6, 6, 6, 6])).toBe('MET');
  expect(assessed('ielts', '2023-11-22', [6, 6, 6, 6])).toBe('NOT_MET');
  expect(assessed('ielts', '2026-11-23', [8, 8, 8, 8])).toBe('NOT_MET');
  expect(
    get('AU-186-DE', 'english', {
      ...base,
      english: {
        test: {
          name: 'pte',
          date: '2026-01-01',
          format: 'single-skill-retake',
        },
      },
    }).pendingDetails,
  ).toEqual(['PD-200']);
  expect(
    get('AU-189-PT', 'points', {
      ...full,
      english: { passport: 'GB', test: 'none' },
    }).explanation,
  ).toContain('55 points');
  expect(
    get('AU-189-PT', 'english', {
      ...full,
      english: { passport: 'GB', test: 'none' },
    }).status,
  ).toBe('MET');
});

test('legacy TOEFL iBT approval dates and the disputed competent speaking score', () => {
  const evidence = (
    date: string,
    speaking: number,
    passport = 'other',
  ): AuFullRequest => ({
    ...base,
    simulationDate: '2025-01-01',
    english: {
      passport,
      education: 'none',
      test: {
        name: 'toefl',
        date,
        format: 'approved',
        components: [30, 30, 30, speaking],
        overall: 90 + speaking,
      },
    },
  });
  const check = (date: string, speaking: number, passport?: string) =>
    get('AU-186-DE', 'english', evidence(date, speaking, passport));
  expect(check('2023-07-25', 30).status).toBe('MET');
  for (const date of ['2023-07-26', '2024-02-01', '2024-05-04']) {
    expect(check(date, 30)).toMatchObject({
      status: 'NOT_MET',
      sources: expect.arrayContaining([
        expect.objectContaining({ srcId: 'SRC-226' }),
      ]),
    });
  }
  expect(functionalEnglish(evidence('2024-05-04', 30))).toBe(false);
  expect(functionalEnglish(evidence('2024-05-05', 30))).toBe(true);
  expect(check('2024-05-05', 17).status).toBe('NOT_MET');
  for (const speaking of [18, 20]) {
    expect(check('2024-05-05', speaking)).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-200'],
    });
  }
  expect(check('2024-05-05', 21).status).toBe('MET');
  expect(check('2024-05-05', 18, 'GB').status).toBe('MET');
});

test('functional English assessment date, score, education, passport and instalment alternatives', () => {
  const score = (
    name: 'pte' | 'cambridge',
    date: string,
    overall: number,
    lodged: string,
  ) =>
    functionalEnglish({
      ...base,
      english: {
        passport: 'other',
        education: 'none',
        functionalApplicationDate: lodged,
        test: { name, date, overall, format: 'approved' },
      },
    });
  expect(score('pte', '2025-08-06', 29, '2026-08-06')).toBe(false);
  expect(score('pte', '2025-08-06', 30, '2026-08-06')).toBe(true);
  expect(score('pte', '2025-08-06', 30, '2026-08-07')).toBe(false);
  expect(score('pte', '2025-08-07', 24, '2025-08-07')).toBe(true);
  expect(score('cambridge', '2025-08-07', 200, '2025-08-07')).toBe(false);
  expect(score('pte', '2026-11-23', 24, '2026-11-01')).toBe(true);
  expect(score('pte', '2026-11-24', 24, '2026-11-01')).toBe(false);
  expect(
    functionalEnglish({
      ...base,
      english: {
        education: { allPrimaryInEnglish: true, secondaryYearsInEnglish: 3 },
      },
    }),
  ).toBe(true);
  expect(
    functionalEnglish({
      ...base,
      english: { education: { australianTertiaryYearsInEnglish: 1 } },
    }),
  ).toBe(true);
  expect(
    functionalEnglish({
      ...base,
      english: { education: { completedAwardYearsInEnglish: 2 } },
    }),
  ).toBe(true);
  expect(
    functionalEnglish({
      ...base,
      english: { education: { secondaryYearsInEnglish: 5 } },
    }),
  ).toBe(true);
  expect(functionalEnglish({ ...base, english: { passport: 'IE' } })).toBe(
    true,
  );
  const noEnglish = {
    ...base,
    english: { passport: 'other', education: 'none', test: 'none' } as const,
    secondInstalmentPaid: false,
  };
  for (const id of ['AU-858', 'AU-189-HK', 'AU-191-HK'] as const) {
    expect(functionalEnglishCheck(id, noEnglish).status).toBe('NOT_MET');
    expect(
      functionalEnglishCheck(id, { ...noEnglish, secondInstalmentPaid: true })
        .status,
    ).toBe('MET');
    expect(
      functionalEnglishCheck(id, { ...noEnglish, dateOfBirth: '2008-11-24' })
        .status,
    ).toBe('MET');
    expect(
      functionalEnglishCheck(id, { ...noEnglish, dateOfBirth: '2008-11-23' })
        .status,
    ).toBe('NOT_MET');
  }
});

test('858 merits, age and ministerial security-assistance alternative', () => {
  expect(
    get('AU-858', 'invitation', {
      ...full,
      innovation: { invitation: 'awaiting' },
    }).pendingDetails,
  ).toEqual(['PD-215']);
  expect(
    get('AU-858', 'achievement', {
      ...full,
      innovation: { achievement: 'submitted' },
    }).pendingDetails,
  ).toEqual(['PD-215']);
  expect(
    get('AU-858', 'nominator', { ...full, innovation: { form1000: 'missing' } })
      .status,
  ).toBe('NOT_MET');
  expect(
    get('AU-858', 'invited-field', {
      ...full,
      innovation: { achievementsMatchInvitation: false },
    }).status,
  ).toBe('NOT_MET');
  for (const birth of ['1971-11-23', '2008-11-24']) {
    expect(
      get('AU-858', 'age-benefit', { ...full, dateOfBirth: birth }).status,
    ).toBe('UNKNOWN');
    expect(
      get('AU-858', 'age-benefit', {
        ...full,
        dateOfBirth: birth,
        innovation: { exceptionalBenefit: 'refused' },
      }).status,
    ).toBe('NOT_MET');
  }
  const security = {
    ...base,
    dateOfBirth: '1966-01-01',
    innovation: { securityAssistance: 'accepted' as const },
  };
  for (const name of [
    'achievement',
    'age-benefit',
    'invited-field',
    'nominator',
  ])
    expect(get('AU-858', name, security).status).toBe('MET');
  expect(get('AU-858', 'invitation', security).status).toBe('UNKNOWN');
});

test('a primary TRT grant or qualifying bridging status is required; visa lodgement may precede nomination approval', () => {
  expect(
    get('AU-186-TRT', 'primary-visa', {
      ...full,
      employer: { ...employer, trtPrimaryVisa: false },
    }).status,
  ).toBe('NOT_MET');
  for (const id of ['AU-186-DE', 'AU-186-TRT'] as const) {
    const concurrent = {
      ...offer,
      lodged: '2026-11-23',
      approved: '2026-12-01',
    };
    expect(
      get(id, 'nomination', {
        ...full,
        employer: { nominations: { [id]: concurrent } },
      }).status,
    ).toBe('MET');
    expect(
      get(id, 'nomination', {
        ...full,
        employer: {
          nominations: { [id]: { ...concurrent, lodged: '2026-11-24' } },
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      get(id, 'nomination', {
        ...full,
        employer: {
          nominations: {
            [id]: { ...concurrent, status: 'pending', approved: undefined },
          },
        },
      }).status,
    ).toBe('UNKNOWN');
  }
});

test('190 pending invitation at 60 points depends on the five nomination points', () => {
  const pendingSkills = {
    ...skills,
    invitations: { 'AU-190': 'awaiting' as const },
    nomination: 'awaiting' as const,
  };
  const pending = {
    ...full,
    skills: {
      ...pendingSkills,
      points: { ...skills.points, partner: 'competent' as const },
    },
  };
  const points = get('AU-190', 'points', pending);
  expect(points.status).toBe('UNKNOWN');
  expect(points.pendingDetails).toEqual(['PD-211']);
  expect(points.explanation).toContain('60 points');
  expect(
    get('AU-190', 'points', { ...full, skills: pendingSkills }).status,
  ).toBe('MET');
  expect(
    get('AU-190', 'points', {
      ...pending,
      english: { passport: 'US', test: 'none' },
    }).status,
  ).toBe('NOT_MET');
});
