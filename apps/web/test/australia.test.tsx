import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import AustraliaPage from '../app/australia/page';
import AustraliaPolicyPage from '../app/australia/policy/page';
import AustraliaSimulatePage from '../app/australia/simulate/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import Home from '../app/page';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { australiaSteps, type AustraliaDraft } from '../lib/australia-draft';
import { australiaModule as au } from '../lib/australia-module';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft } from '../lib/share';
import { ukModule } from '../lib/uk-module';
import { gapRules } from '../lib/gap-summary';
import { diffPathways } from '../lib/whatif';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

function fullAustraliaDraft(): AustraliaDraft {
  return {
    ...au.createDraft(),
    simulationDate: '2026-11-23',
    completed: true,
    dateOfBirth: '1990-01-01',
    firstArrival: '2020-01-01',
    visas: [
      { subclass: '482', from: '2020-01-01', to: '2023-06-30' },
      { subclass: '491', from: '2023-07-01' },
    ],
    trips: [],
    locationAtApplication: 'onshore',
    locationAtDecision: 'onshore',
    permissibleOnshoreVisa: true,
    noFurtherStay: 'clear',
    section48History: 'none',
    regionalLockException: 'none',
    visaCompliance: 'complied',
    regional: {
      assessmentYears: [2024, 2025, 2026],
      regionalCondition: 'complied',
      changeNotice: 'complied',
      evidenceAndInterview: 'complied',
    },
    english: {
      passport: 'GB',
      test: 'none',
    },
    fees: {
      pacificRegionalPassport: false,
      additionalAdults: 0,
      additionalMinors: 0,
    },
    skills: {
      invitations: {
        'AU-190': {
          issued: '2026-11-15',
          deadline: '2027-01-13',
          score: 65,
        },
      },
      occupationList: 'MLTSSL',
      occupationInInvitation: { 'AU-190': true },
      assessment: { kind: 'positive', issued: '2026-10-01' },
      nomination: 'active',
      points: {
        overseasMonths: 96,
        australianMonths: 0,
        professionalMonths: 0,
        education: 'bachelor',
        specialistStudyYears: 0,
        australianStudy: { qualifying: false },
        communityLanguageCredential: false,
        partner: 'singleOrAustralian',
      },
    },
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
      childInterestsSatisfied: true,
    },
  };
}

test.each(['zh-CN', 'en'] as const)(
  'Australia home links to the questionnaire and policy page in %s',
  (locale) => {
    const html = render(<AustraliaPage />, locale);
    expect(html).toContain('href="/australia/simulate"');
    expect(html).toContain('href="/australia/policy"');
    expect(html).toContain(t('au.title', locale));
    expect(html).toContain(t('au.scope', locale));
    expect(render(<Home />, locale)).toContain('href="/australia"');
  },
);

test('all five Australia pages are exported in the offline and sitemap lists', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const path of [
    '/australia',
    '/australia/simulate',
    '/australia/result',
    '/australia/whatif',
    '/australia/policy',
  ]) {
    expect(offline).toContain(path);
    expect(paths).toContain(path);
  }
});

test('versioned drafts round-trip inside the Australia envelope and migrate legacy AuForm inputs', () => {
  const draft = fullAustraliaDraft();
  const encoded = encodeDraft(au, draft);
  expect(decodeDraft(au, encoded)).toEqual(draft);
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(au, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();

  const fresh = au.createDraft();
  expect(au.decodeDraft(fresh)).toEqual(fresh);

  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, step: 9 },
    { ...draft, visas: 'not-an-array' },
    { ...draft, pathway: 'AU-MADE-UP' },
    { ...draft, locationAtApplication: 'mars' },
  ]) {
    expect(au.decodeDraft(bad)).toBeUndefined();
  }

  // Legacy time-only AuForm object migrates into version 1 AustraliaDraft.
  const legacyForm = {
    simulationDate: '2026-11-21',
    dateOfBirth: '1990-05-01',
    firstArrival: '2021-02-01',
    visas: [
      { subclass: '485', from: '2022-12-01', to: '2027-11-30' },
      { subclass: '186', from: '2023-09-01', to: '' },
    ],
    trips: [{ departed: '2025-01-10', returned: '2025-02-10' }],
    sponsoredFullTime: true,
    partner: true,
    partnerLodged: '2025-03-10',
    partnerStream: 'onshore',
    longTermRelationship: false,
    hongKong: true,
    regionalSince: '2024-06-01',
  };
  const migrated = au.decodeDraft(legacyForm);
  expect(migrated).toMatchObject({
    version: 1,
    completed: true,
    simulationDate: '2026-11-21',
    dateOfBirth: '1990-05-01',
    firstArrival: '2021-02-01',
    sponsoredFullTime: true,
    hongKongPassport: true,
    hongKongPrimaryVisaTerms: true,
    regional: { hongKongOnlySince: '2024-06-01' },
    partnerApplication: {
      lodged: '2025-03-10',
      stream: 'onshore',
      longTermRelationship: false,
    },
  });
  expect(migrated?.visas?.[1]).toEqual({
    subclass: '186',
    from: '2023-09-01',
  });
  const legacyEncoded = Buffer.from(
    JSON.stringify(legacyForm),
    'utf8',
  ).toString('base64url');
  expect(decodeDraft(au, legacyEncoded)).toEqual(au.activeAnswers?.(migrated!));
});

test('step validation checks required dates, ordering, arrival vs birth/trips and nested step fields', () => {
  const fresh = au.createDraft();
  expect(au.validateStep({ ...fresh, simulationDate: '' })).toHaveProperty(
    'au-simulationDate',
  );
  expect(
    au.validateStep({
      ...fresh,
      simulationDate: '2026-11-21',
      dateOfBirth: '2021-03-01',
      firstArrival: '2021-02-01',
    }),
  ).toEqual({
    'au-firstArrival': 'au.error.beforeBirth',
  });
  expect(
    au.validateStep({
      ...fresh,
      simulationDate: '2026-11-21',
      visas: [{ subclass: '482', from: '2025-01-01', to: '2024-12-31' }],
      trips: [{ departed: '2025-03-01', returned: '2025-02-01' }],
    }),
  ).toEqual({
    'au-visas-0-to': 'au.error.order',
    'au-trips-0-returned': 'au.error.order',
    'au-trips-0-departed': 'au.error.beforeArrival',
  });

  // Step 2: nomination approved date before lodged date is flagged.
  expect(
    au.validateStep({
      ...fresh,
      step: 2,
      employer: {
        nominations: {
          'AU-186-TRT': {
            status: 'approved',
            lodged: '2026-07-10',
            approved: '2026-07-01',
          },
        },
      },
    }),
  ).toEqual({
    'au-employer-nominations-AU-186-TRT-approved': 'au.error.order',
  });

  // Step 4: invalid fiscal year in assessmentYears is flagged.
  expect(
    au.validateStep({
      ...fresh,
      step: 4,
      regional: { assessmentYears: [1800] },
    }),
  ).toEqual({
    'au-regional-assessmentYears-0': 'au.form.yearError',
  });

  // Visible steps filter when a specific pathway is chosen.
  expect(australiaSteps(fresh)).toHaveLength(7);
  expect(
    australiaSteps({ ...fresh, pathway: 'AU-CITIZENSHIP' }).map((s) => s.step),
  ).toEqual([0, 1, 6]);
});

test('run produces MET, FUTURE and UNKNOWN pathways on a typical scenario', () => {
  const draft: AustraliaDraft = {
    ...fullAustraliaDraft(),
    // 491 started 2023-12-01: 3 years not yet completed on 2026-11-23 -> AU-190 is FUTURE (2026-12-01),
    // while AU-191 is also FUTURE (2026-12-01) and AU-189-PT is UNKNOWN (no 189 invitation).
    // Adding an earlier 491 from 2023-07-01 makes AU-191 MET on 2026-11-23!
    visas: [{ subclass: '491', from: '2023-12-01' }],
  };
  const futureAndUnknown = au.run(draft, 'zh-CN').columns[0].pathways;
  const p190 = futureAndUnknown.find((p) => p.id === 'AU-190')!;
  const p189 = futureAndUnknown.find((p) => p.id === 'AU-189-PT')!;
  expect(p190).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-12-01',
  });
  expect(p189).toMatchObject({
    status: 'UNKNOWN',
  });
  expect(p189.earliestDate).toBeUndefined();

  // With 491 held since 2023-07-01, both AU-191 and AU-190 are MET on 2026-11-23, while AU-189-PT stays UNKNOWN.
  const metResult = au.run(fullAustraliaDraft(), 'en').columns[0].pathways;
  expect(metResult.find((p) => p.id === 'AU-191')).toMatchObject({
    status: 'MET',
    earliestDate: '2026-11-23',
  });
  expect(metResult.find((p) => p.id === 'AU-190')).toMatchObject({
    status: 'MET',
    earliestDate: '2026-11-23',
  });
  expect(metResult.find((p) => p.id === 'AU-189-PT')?.status).toBe('UNKNOWN');
});

test('what-if knobs update simulation date, trips, IELTS band, 186 salary, 191 tax years, citizenship test and health', () => {
  const base: AustraliaDraft = {
    ...fullAustraliaDraft(),
    visas: [{ subclass: '491', from: '2023-12-01' }],
    employer: {
      exemption: 'none',
      sponsorshipConduct: 'clear',
      csolOccupation: true,
      assessment: { kind: 'positive', issued: '2026-01-01' },
      fullTimeExperienceYears: 4,
      nominations: {
        'AU-186-DE': {
          status: 'approved',
          lodged: '2026-07-01',
          approved: '2026-07-10',
          positionAvailable: true,
          fullTimeRenewable: true,
          offeredYears: 2,
          annualSalary: 70000,
          acceptedMarketRate: 70000,
          licensing: 'unregulated',
        },
      },
    },
  };

  // Baseline: AU-190 is FUTURE (2026-12-01), AU-186-DE is NOT_MET (salary 70,000 < 79,423 and 491 regional lock).
  expect(
    au.run(base, 'zh-CN').columns[0].pathways.find((p) => p.id === 'AU-190'),
  ).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-12-01',
  });

  // Moving date knob to 2026-12-01 turns AU-190 from FUTURE to MET, and raising salary to 80,000 turns AU-186-DE to MET.
  const knobs = {
    ...au.whatif.initial(base),
    simulationDate: '2026-12-01',
    annualSalary: 80000,
    ieltsBand: 8,
    taxNoticeCount: 2,
    citizenshipTestPassed: true,
    health: 'cost-risk' as const,
  };
  expect(au.whatif.validate(base, knobs)).toEqual({});
  const after = au.whatif.apply(base, knobs);
  expect(after.simulationDate).toBe('2026-12-01');
  expect(after.employer?.nominations?.['AU-186-DE']?.annualSalary).toBe(80000);
  expect(after.regional?.assessmentYears).toEqual([2025, 2026]);
  expect(after.citizenship?.test).toEqual({ correct: 20, valuesCorrect: 5 });
  expect(after.publicInterest?.health).toBe('cost-risk');

  // Focusing rules maps to the right What-if control IDs.
  expect(au.whatif.focusForRule('AU-191-time-held', 'AU-191')).toBe('date');
  expect(
    au.whatif.focusForRule('AU-CIT-time-recent-absences', 'AU-CITIZENSHIP'),
  ).toBe('trips');
  expect(au.whatif.focusForRule('AU-189-PT-english', 'AU-189-PT')).toBe(
    'english',
  );
  expect(au.whatif.focusForRule('AU-186-DE-salary', 'AU-186-DE')).toBe(
    'salary',
  );
  expect(au.whatif.focusForRule('AU-191-tax-notices', 'AU-191')).toBe(
    'taxYears',
  );
  expect(au.whatif.focusForRule('AU-CIT-test', 'AU-CITIZENSHIP')).toBe(
    'citizenshipTest',
  );
  expect(au.whatif.focusForRule('AU-PIC-HEALTH', 'AU-191')).toBe('health');
});

test.each(['zh-CN', 'en'] as const)(
  'questionnaire, result, what-if and policy views render in %s',
  (locale) => {
    const draft = fullAustraliaDraft();
    const formHtml = render(
      AustraliaSimulatePage().props.children({
        draft,
        errors: {},
        update: () => {},
      }),
      locale,
    );
    expect(formHtml).toContain('id="au-simulationDate"');
    expect(formHtml).toContain('id="au-pathway"');

    const result = readPageResult(au, locale, encodeDraft(au, draft)).result!;
    const resultHtml = render(
      <ResultView country={au} result={result} draft={draft} />,
      locale,
    );
    expect(resultHtml).toContain('2026-11-23');
    expect(resultHtml).toContain('SRC-200');

    const whatIfHtml = render(
      <WhatIfView country={au} draft={draft} />,
      locale,
    );
    expect(whatIfHtml).toContain('id="au-whatif-date"');
    expect(whatIfHtml).toContain('id="au-whatif-salary"');

    const policyHtml = render(<AustraliaPolicyPage />, locale);
    expect(policyHtml).toContain(t('au.policy.pageTitle', locale));
    expect(policyHtml).toContain('data-source="SRC-200"');
    expect(policyHtml).not.toContain('data-source="SRC-001"');
    expect(policyHtml).not.toContain('data-source="SRC-110"');
  },
);

const pathways = (draft: AustraliaDraft) =>
  au.run(draft, 'zh-CN').columns[0].pathways;
const check = (draft: AustraliaDraft, pathway: string, id: string) =>
  pathways(draft)
    .find((p) => p.id === pathway)
    ?.checks.find((c) => c.id === id)?.status;

test('opening the comparison without changing a knob keeps every pathway and each nomination unchanged', () => {
  for (const acceptedMarketRate of [95000, undefined]) {
    const base: AustraliaDraft = {
      ...fullAustraliaDraft(),
      employer: {
        nominations: {
          'AU-186-TRT': {
            status: 'approved',
            annualSalary: 85000,
            acceptedMarketRate,
          },
          'AU-186-DE': {
            status: 'approved',
            annualSalary: 70000,
            acceptedMarketRate: 70000,
          },
        },
      },
    };
    const after = au.whatif.apply(base, au.whatif.initial(base));
    expect(after.employer).toEqual(base.employer);
    const before = pathways(base);
    const compared = pathways(after);
    for (const pathway of before)
      expect(
        diffPathways(
          pathway,
          compared.find((p) => p.id === pathway.id),
        ).changed,
        pathway.id,
      ).toBe(false);
    const html = render(<WhatIfView country={au} draft={base} />);
    expect(html.split(t('whatif.unchanged')).length - 1).toBe(before.length);
  }
});

test('the IELTS knob dates the test for the invitations and lodgement being assessed', () => {
  const base: AustraliaDraft = {
    ...fullAustraliaDraft(),
    english: { passport: 'other' },
    skills: {
      ...fullAustraliaDraft().skills,
      invitations: {
        'AU-189-PT': { issued: '2023-01-01' },
        'AU-190': { issued: '2026-11-15', deadline: '2027-01-13', score: 65 },
      },
    },
  };
  const after = au.whatif.apply(base, {
    ...au.whatif.initial(base),
    ieltsBand: 8,
  });
  expect(after.english?.test).toMatchObject({ date: '2026-11-14' });
  expect(check(after, 'AU-190', 'AU-190-english')).toBe('MET');
  expect(check(after, 'AU-858', 'AU-858-functional-english')).toBe('MET');
  // With both invitations recent, the day before the earlier one serves all.
  const recent = au.whatif.apply(
    {
      ...base,
      skills: {
        ...base.skills,
        invitations: {
          ...base.skills!.invitations,
          'AU-189-PT': { issued: '2026-10-01' },
        },
      },
    },
    { ...au.whatif.initial(base), ieltsBand: 8 },
  );
  expect(recent.english?.test).toMatchObject({ date: '2026-09-30' });
  expect(check(recent, 'AU-189-PT', 'AU-189-PT-english')).toBe('MET');
  expect(check(recent, 'AU-190', 'AU-190-english')).toBe('MET');
});

test('the 191 knob counts completed income years in which a 491 or 494 was actually held', () => {
  const base: AustraliaDraft = {
    ...fullAustraliaDraft(),
    visas: [
      { subclass: '491', from: '2022-07-01', to: '2025-06-30' },
      { subclass: '191', from: '2025-07-01' },
    ],
  };
  const after = au.whatif.apply(base, {
    ...au.whatif.initial(base),
    taxNoticeCount: 3,
  });
  expect(after.regional?.assessmentYears).toEqual([2023, 2024, 2025]);
  expect(check(after, 'AU-191', 'AU-191-tax-notices')).toBe('MET');
});

test('comparison dates are validated like the questionnaire, and a salary without a nomination is explained', () => {
  const base = fullAustraliaDraft();
  const knobs = { ...au.whatif.initial(base), simulationDate: '1989-12-31' };
  expect(au.whatif.validate(au.whatif.apply(base, knobs), knobs)).toEqual({
    date: 'au.whatif.invalidDates',
  });
  expect(render(<WhatIfView country={au} draft={base} />)).toContain(
    t('au.whatif.noNomination'),
  );
  expect(
    render(
      <WhatIfView
        country={au}
        draft={{
          ...base,
          employer: { nominations: { 'AU-186-DE': { annualSalary: 1 } } },
        }}
      />,
    ),
  ).not.toContain(t('au.whatif.noNomination'));
});

test('a no-trips assumption from a comparison stays visible in the questionnaire and can be withdrawn', () => {
  const draft: AustraliaDraft = {
    ...fullAustraliaDraft(),
    pathway: 'AU-CITIZENSHIP',
    visas: [
      { subclass: '482', from: '2020-01-01', to: '2025-11-22' },
      { subclass: '189', from: '2025-11-23' },
    ],
    trips: [{ departed: '2023-01-01', returned: '2024-03-01' }],
    noTrips: true,
  };
  const form = (d: AustraliaDraft) =>
    render(
      AustraliaSimulatePage().props.children({
        draft: d,
        errors: {},
        update: () => {},
      }),
    );
  expect(form(draft)).toMatch(
    new RegExp(
      `id="au-noTrips" type="checkbox" checked=""/>${t('au.form.noTripsAssumed')}`,
    ),
  );
  expect(form({ ...draft, noTrips: false })).toContain(
    t('au.form.noTripsAssumed'),
  );
  expect(form({ ...draft, noTrips: undefined })).not.toContain(
    t('au.form.noTripsAssumed'),
  );
  expect(check(draft, 'AU-CITIZENSHIP', 'AU-CIT-time-absences')).toBe('MET');
  expect(
    check(
      { ...draft, noTrips: false },
      'AU-CITIZENSHIP',
      'AU-CIT-time-absences',
    ),
  ).toBe('NOT_MET');
});

function rrvDraft(): AustraliaDraft {
  return {
    ...au.createDraft(),
    completed: true,
    simulationDate: '2026-11-23',
    pathway: 'AU-RRV',
    firstArrival: '2025-01-01',
    locationAtApplication: 'onshore',
    locationAtDecision: 'onshore',
    noFurtherStay: 'clear',
    section48History: 'none',
    visas: [{ subclass: '189', from: '2025-01-01' }],
    trips: [],
    rrv: {
      status: 'current-pr',
      ties: 'none',
      familyBasis: 'none',
      compassionateDeparture: 'none',
      returnApplicationBar: false,
    },
    publicInterest: {
      officialPassport: true,
      character: 'clear-history',
      returnBan5001: false,
    },
  };
}

test.each(['zh-CN', 'en'] as const)(
  'the projected date is labelled as meeting the assessed requirements in results, gaps and comparisons (%s)',
  (locale) => {
    const draft = rrvDraft();
    const result = au.run(draft, locale);
    expect(result.columns[0].pathways[0]).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-01-01',
    });
    const html = render(
      <ResultView country={au} result={result} draft={draft} />,
      locale,
    );
    expect(html).toContain(`<dt>${t('au.result.earliest', locale)}</dt>`);
    expect(html).toContain(
      t('au.result.earliest', locale) +
        (locale === 'en' ? ': ' : '：') +
        '2027-01-01',
    );
    expect(html).toContain(t('au.result.timing', locale));
    expect(html).not.toContain(t('result.earliest', locale));
    const whatIf = render(<WhatIfView country={au} draft={draft} />, locale);
    expect(whatIf).toContain(`<dt>${t('au.result.earliest', locale)}</dt>`);
    expect(whatIf).not.toContain(t('result.earliest', locale));
  },
);

test('Resident Return alternatives, the fee budget and the citizenship pledge are labelled apart and left out of the gaps', () => {
  const rrv = au.run(rrvDraft(), 'zh-CN').columns[0].pathways[0];
  const kinds = Object.fromEntries(rrv.checks.map((c) => [c.id, c.kind]));
  expect(kinds).toMatchObject({
    'AU-RRV-option-residence': 'alternative',
    'AU-RRV-option-ties': 'alternative',
    'AU-RRV-basis': 'requirement',
    'AU-FEES-APPLICATION': 'budget',
  });
  expect(gapRules(rrv).map((c) => c.id)).toEqual(['AU-RRV-basis']);

  const citizenship = au.run(
    {
      ...rrvDraft(),
      pathway: 'AU-CITIZENSHIP',
      dateOfBirth: '1990-01-01',
      firstArrival: '2020-01-01',
      visas: [
        { subclass: '482', from: '2020-01-01', to: '2025-12-31' },
        { subclass: '189', from: '2026-01-01' },
      ],
    },
    'zh-CN',
  ).columns[0].pathways[0];
  const ids = citizenship.checks.map((c) => [c.id, c.kind]);
  expect(ids).toContainEqual(['AU-CIT-pledge', 'afterApproval']);
  expect(ids).toContainEqual(['AU-CIT-time-permanent', 'time']);
  expect(gapRules(citizenship).map((c) => c.id)).toContain(
    'AU-CIT-time-permanent',
  );
  for (const id of ['AU-CIT-pledge', 'AU-FEES-APPLICATION'])
    expect(gapRules(citizenship).map((c) => c.id)).not.toContain(id);

  const html = render(
    <ResultView
      country={au}
      result={au.run(rrvDraft(), 'zh-CN')}
      draft={rrvDraft()}
    />,
  );
  for (const kind of ['alternative', 'budget', 'requirement'] as const)
    expect(html).toContain(`· ${t(`country.check.${kind}`)}`);
});

test('case-by-case pending details are not presented as details awaiting a government decision', () => {
  const draft: AustraliaDraft = { ...rrvDraft(), pathway: 'AU-PARTNER' };
  const result = au.run(draft, 'zh-CN');
  const partner = result.columns[0].pathways[0];
  expect(
    partner.checks.find((c) => c.id === 'AU-PARTNER-evidence')?.pendingDetails,
  ).toEqual(['PD-213']);
  const html = render(
    <ResultView country={au} result={result} draft={draft} />,
  );
  expect(html).toContain(t('pilot.pending'));
  expect(html).not.toContain(t('result.pendingDetails'));
  expect(html).not.toContain(t('gap.pending'));
});
