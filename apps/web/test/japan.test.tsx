import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { JpFullReentryRequest } from '@uk-immigration/engine';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import JapanPage from '../app/japan/page';
import { JapanWhatIfControls } from '../app/japan/whatif/controls';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import { GapSummary } from '../components/gap-summary';
import { ResultView } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import type { JapanDraft } from '../lib/japan-draft';
import { japanModule as jp } from '../lib/japan-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import { ukModule } from '../lib/uk-module';
import { sourceUrls } from '../lib/sources';

const ordinary = {
  route: 'ordinary',
  departureOn: '2027-04-12',
  returnOn: '2027-04-19',
  lawfulStatus: true,
  inJapanWhenApplying: true,
  intendsReturn: true,
  excludedStatusOrDetention: false,
  passportOrApprovedAlternative: true,
  residentCardOrCertificate: true,
  stayIndefinite: true,
  visits: 'multiple',
  channel: 'counter',
  permitVoided: false,
  permit: { effectiveOn: '2027-04-05', expiresOn: '2028-04-04' },
} satisfies JpFullReentryRequest;

function travelDraft(): JapanDraft {
  return {
    ...jp.createDraft(),
    step: 6,
    completed: true,
    simulationDate: '2027-04-03',
    stayStart: '2014-04-01',
    reentry: [structuredClone(ordinary)],
  };
}

test.each(['zh-CN', 'en'] as const)(
  'Japan home links to the questionnaire and sources in %s',
  (locale) => {
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <JapanPage />
      </LocaleContext>,
    );
    expect(html).toContain('href="/japan/simulate"');
    expect(html).toContain('href="/japan/policy"');
    expect(html).toContain(locale === 'en' ? 'Japan' : '日本');
  },
);

test('all five Japan pages are exported in the offline and sitemap lists', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const path of [
    '/japan',
    '/japan/simulate',
    '/japan/result',
    '/japan/whatif',
    '/japan/policy',
  ]) {
    expect(offline).toContain(path);
    expect(paths).toContain(path);
  }
});

test('versioned drafts round-trip inside their country envelope, including negative and unknown evidence', () => {
  const draft = travelDraft();
  const encoded = encodeDraft(jp, draft);
  expect(decodeDraft(jp, encoded)).toEqual(draft);
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(jp, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();
  const fresh = jp.createDraft();
  expect(jp.decodeDraft(fresh)).toEqual(fresh);
  for (const bad of [
    null,
    { ...draft, version: draft.version + 1 },
    { ...draft, step: 3 },
    { ...draft, trips: [null] },
    { ...draft, reentry: [{ route: 'made-up' }] },
    { ...draft, reentry: 'ordinary' },
  ])
    expect(jp.decodeDraft(bad)).toBeUndefined();
});

test('step validation requires residence and a selected pathway, then validates trip dates', () => {
  const fresh = jp.createDraft();
  expect(jp.validateStep(fresh)).toEqual({ 'jp-routes': 'jp.form.routeError' });
  expect(
    jp.validateStep({
      ...fresh,
      permanentResidence: { routes: [{ route: 'child' }], evidence: {} },
    }),
  ).toHaveProperty('jp-stayStart');
  expect(jp.validateStep({ ...fresh, stayStart: '2014-04-01' })).not.toEqual(
    {},
  );
  const draft = travelDraft();
  expect(jp.validateStep({ ...draft, step: 0 })).toEqual({});
  const trip = {
    departed: '2024-02-01',
    returned: '2024-02-12',
    reentryPermit: false,
  };
  const validateTrips = (trips: JapanDraft['trips']) =>
    jp.validateStep({ ...draft, step: 1, trips });
  expect(
    validateTrips([
      trip,
      { ...trip, departed: trip.returned, returned: '2024-02-14' },
    ]),
  ).toEqual({});
  expect(
    validateTrips([
      trip,
      { ...trip, departed: '2024-02-04', returned: '2024-02-14' },
    ]),
  ).not.toEqual({});
  expect(validateTrips([{ ...trip, returned: '2024-01-31' }])).not.toEqual({});
  expect(
    validateTrips([
      { ...trip, stayExpiry: '2024-01-01', renewalPending: true },
    ]),
  ).toEqual({});
  expect(
    validateTrips([
      { ...trip, stayExpiry: '2023-02-01', renewalPending: true },
    ]),
  ).not.toEqual({});
});

test('general permanent residence preserves the old and revised status-start choices', () => {
  const draft = travelDraft();
  const validate = (oldStart: string, newStart?: string) =>
    jp.validateStep({
      ...draft,
      step: 2,
      permanentResidence: {
        routes: [
          { route: 'general', statusStart: oldStart, newStatusStart: newStart },
        ],
        evidence: {},
      },
    });
  expect(validate('none', 'none')).toEqual({});
  expect(validate('2019-04-01')).not.toEqual({});
  expect(validate('none', '2020-04-01')).not.toEqual({});
  expect(validate('2021-04-01', '2020-04-01')).not.toEqual({});
  expect(validate('2019-04-01', '2020-04-01')).toEqual({});
});

test('a counter application made on Saturday is met on the next open day, while missing eligibility remains pending', () => {
  const draft = travelDraft();
  expect(jp.validateStep(draft)).toEqual({});
  const assessed = jp.run(draft, 'en').columns[0].pathways[0];
  expect(assessed).toMatchObject({
    id: 'jp.reentry.ordinary',
    title: 'Ordinary re-entry permit',
    status: 'MET',
    earliestDate: '2027-04-05',
  });
  expect(assessed.checks).toContainEqual(
    expect.objectContaining({
      id: 'jp.reentry.ordinary-eligibility',
      status: 'MET',
      sources: expect.arrayContaining([
        expect.objectContaining({ srcId: 'SRC-461' }),
      ]),
    }),
  );
  const pending = jp.run(
    {
      ...draft,
      reentry: [{ ...ordinary, inJapanWhenApplying: undefined }],
    },
    'zh-CN',
  ).columns[0].pathways[0];
  expect(pending).toMatchObject({
    title: '普通再入国許可',
    status: 'UNKNOWN',
    pendingDetails: expect.arrayContaining(['PD-379']),
  });
  expect(pending.earliestDate).toBeUndefined();
});

test('a future residence milestone is distinct from confirmed permission to file', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-22',
    stayStart: '2025-10-01',
    permanentResidence: {
      routes: [{ route: 'spouse', marriedLifeFrom: '2023-12-01' }],
      evidence: {},
    },
  };
  const path = jp.run(draft, 'en').columns[0].pathways[0];
  expect(path).toMatchObject({
    id: 'jp.pr.spouse',
    status: 'NOT_MET',
    timeStatus: 'FUTURE',
    timeEarliestDate: '2026-12-01',
  });
  expect(path.earliestDate).toBeUndefined();
});

test('the birth route keeps an unspecified departure distinct from leaving without a permit', () => {
  const born: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-16',
    stayStart: '2026-11-10',
    permanentResidence: {
      routes: [{ route: 'child-birth', bornOn: '2026-11-10' }],
      evidence: {},
    },
  };
  const trip = { departed: '2026-11-27', returned: '2026-12-01' };
  const leaving = (departure?: 'none' | 'deemed' | 'permit') =>
    jp.run({ ...born, trips: [{ ...trip, departure }] }, 'en').columns[0]
      .pathways[0];
  expect(leaving().timeStatus).toBe('UNKNOWN');
  expect(leaving('none').status).toBe('NOT_APPLICABLE');
  expect(leaving('deemed').timeStatus).toBe('MET');
});

test('naturalisation retains the age of majority under the home-country law', () => {
  const child: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-23',
    stayStart: '2016-04-01',
    dateOfBirth: '2008-11-24',
  };
  const adulthood = (homeMajorityAge: number) =>
    jp.run(
      {
        ...child,
        naturalisation: {
          routes: [{ route: 'general', homeMajorityAge }],
          evidence: {},
        },
      },
      'en',
    ).columns[0].pathways[0].timeEarliestDate;
  expect(adulthood(18)).toBe('2026-11-24');
  expect(adulthood(19)).toBe('2027-11-24');
});

test('the result view separates a future time milestone, an unknown filing date, a zero fee and an inapplicable oath', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-22',
    stayStart: '2025-10-01',
    dateOfBirth: '2015-02-01',
    naturalisation: {
      routes: [{ route: 'general', homeMajorityAge: 18 }],
      evidence: {},
    },
  };
  const result = jp.run(draft, 'en');
  const nat = result.columns[0].pathways[0];
  expect(nat.timeEarliestDate).toBe('2035-10-01');
  expect(nat.earliestDate).toBeUndefined();
  const html = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
      <ResultView country={jp} result={result} draft={draft} />
    </LocaleContext>,
  );
  expect(html).toContain(
    '<dt>Date based on time requirements alone</dt><dd><time dateTime="2035-10-01">2035-10-01</time></dd>',
  );
  expect(html).toContain(
    '<dt>Earliest projected application date</dt><dd>Not yet determined</dd>',
  );
  expect(html).toContain('<p>Fee: JPY 0</p>');
  expect(html).toContain(
    'data-status="NOT_APPLICABLE"><strong>Motivation statement and oath</strong>',
  );
});

test('a planned deemed departure leaves the declaration pending and labels the planned day', () => {
  const draft = travelDraft();
  draft.reentry = [
    {
      route: 'deemed',
      departureOn: '2027-04-12',
      returnOn: '2027-04-19',
      stayIndefinite: true,
      specialPermanentResident: false,
      lawfulStatus: true,
      temporaryVisitor: false,
      passportValid: true,
      residentCardOrCertificate: true,
      formalPermitRequired: false,
      permitVoided: false,
    },
  ];
  const path = jp.run(draft, 'en').columns[0].pathways[0];
  expect(path).toMatchObject({ status: 'UNKNOWN' });
  expect(path.earliestDate).toBeUndefined();
  expect(path.summary).toContain('2027-04-12');
  expect(path.checks).toContainEqual(
    expect.objectContaining({
      id: 'jp.reentry.deemed-eligibility',
      status: 'UNKNOWN',
    }),
  );
});

test('moving the filing date clears ordinary permit evidence for the original date', () => {
  const baseline = travelDraft();
  baseline.reentry = [
    { ...ordinary, onlineConcurrentEligibleApplication: true },
  ];
  const initial = jp.whatif.initial(baseline);
  const knobs = { ...initial, applicationDate: '2027-04-06' };
  const after = jp.whatif.apply(baseline, knobs);
  expect(jp.whatif.validate(after, knobs)).toEqual({});
  const compared = jp.run(after, 'en').columns[0].pathways[0];
  expect(compared.status).toBe('UNKNOWN');
  expect(compared.earliestDate).toBeUndefined();
  expect(after.reentry[0]).toMatchObject({
    lawfulStatus: undefined,
    inJapanWhenApplying: undefined,
    onlineConcurrentEligibleApplication: undefined,
    channel: 'counter',
    permit: ordinary.permit,
  });
  expect(jp.run(baseline, 'en').columns[0].pathways[0].earliestDate).toBe(
    '2027-04-05',
  );
});

test('the filing date knob clears dated residence and talent answers without altering the original evidence', () => {
  const baseline: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-24',
    stayStart: '2010-01-01',
    permanentResidence: {
      routes: [
        {
          route: 'hsp70',
          statusStart: '2015-01-01',
          mode: 'recognised',
          current: { on: '2026-11-24', confirmedPoints: 80 },
          historical: { on: '2023-11-24', confirmedPoints: 70 },
          recognisedOn: '2022-01-01',
          recognisedPoints: 70,
          maintained: true,
        },
        {
          route: 'j-skip',
          current: { on: '2026-11-24', confirmed: true },
          historical: { on: '2025-11-24', confirmed: true },
          remainedRecognised: true,
        },
      ],
      evidence: {
        inJapan: true,
        status: {
          kind: 'engineer',
          valid: true,
          expiresOn: '2026-11-30',
          timelyRenewalPending: false,
        },
        pendingOnIncomeReviewDate: true,
        addressNotices: [
          { eventOn: '2026-11-12', notifiedOn: null },
          { eventOn: '2026-09-01', notifiedOn: '2026-09-02' },
        ],
      },
    },
    naturalisation: {
      routes: [{ route: 'general' }],
      evidence: { inJapan: true, lawfulDomicile: true },
    },
  };
  const original = structuredClone(baseline);
  const initial = jp.whatif.initial(baseline);
  const knobs = { ...initial, applicationDate: '2026-12-01' };
  const adjusted = jp.whatif.apply(baseline, knobs);
  const pr = (draft: JapanDraft) => jp.run(draft, 'en').columns[0].pathways[0];
  const check = (draft: JapanDraft, key: string) =>
    pr(draft).checks.find((item) => item.id === key)?.status;
  expect(check(baseline, 'jp.pr.lawful-filing-status')).toBe('MET');
  expect(check(adjusted, 'jp.pr.lawful-filing-status')).toBe('NOT_MET');
  expect(pr(adjusted).earliestDate).toBeUndefined();
  expect(check(adjusted, 'jp.pr.hsp-current-points')).toBe('UNKNOWN');
  expect(adjusted.permanentResidence.evidence).toMatchObject({
    pendingOnIncomeReviewDate: true,
    addressNotices: [
      { eventOn: '2026-11-12', notifiedOn: undefined },
      { eventOn: '2026-09-01', notifiedOn: '2026-09-02' },
    ],
  });
  expect(adjusted.permanentResidence.routes).toMatchObject([
    {
      current: undefined,
      historical: undefined,
      maintained: undefined,
      recognisedOn: '2022-01-01',
      recognisedPoints: 70,
    },
    {
      current: undefined,
      historical: undefined,
      remainedRecognised: undefined,
    },
  ]);
  expect(adjusted.naturalisation.evidence).toMatchObject({
    inJapan: undefined,
    lawfulDomicile: undefined,
  });
  expect(jp.whatif.apply(baseline, initial).permanentResidence).toEqual(
    original.permanentResidence,
  );
  expect(baseline).toEqual(original);
  const renewed = structuredClone(baseline);
  renewed.permanentResidence.evidence.status!.timelyRenewalPending = true;
  const comparedRenewal = jp.whatif.apply(renewed, knobs);
  expect(
    comparedRenewal.permanentResidence.evidence.status?.timelyRenewalPending,
  ).toBeUndefined();
  expect(check(comparedRenewal, 'jp.pr.lawful-filing-status')).toBe('UNKNOWN');
  const html = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
      <JapanWhatIfControls
        afterDraft={adjusted}
        knobs={knobs}
        update={() => {}}
        errors={{}}
      />
    </LocaleContext>,
  );
  expect(html).toContain('aria-describedby="jp-whatif-date-hint"');
  expect(html).toContain('Set the new filing date in the questionnaire');
});

test('language, household evidence and travel knobs update only the comparison', () => {
  const draft: JapanDraft = {
    ...travelDraft(),
    trips: [
      { departed: '2026-06-01', returned: '2026-06-15', reentryPermit: true },
    ],
    permanentResidence: {
      routes: [{ route: 'child' }],
      evidence: { tax: 'on-time' },
    },
    naturalisation: {
      routes: [{ route: 'general', homeMajorityAge: 18 }],
      evidence: { japaneseLanguage: { reading: 'independent' } },
    },
  };
  const original = structuredClone(draft);
  const knobs = {
    ...jp.whatif.initial(draft),
    prIncome: 0,
    prHousehold: false,
    natJapanese: true,
    noTrips: true,
    returns: { ordinary: '2027-04-20' },
  };
  const compared = jp.whatif.apply(draft, knobs);
  expect(compared.permanentResidence.evidence).toMatchObject({
    applicantAnnualIncomeYen: 0,
    householdIncomeConfirmed: false,
    tax: 'on-time',
  });
  expect(compared.naturalisation.evidence.japaneseLanguage).toEqual({
    reading: 'independent',
    authorityConfirmed: true,
  });
  expect(compared.trips).toEqual([]);
  expect(compared.reentry[0].returnOn).toBe('2027-04-20');
  expect(draft).toEqual(original);
});

test('each re-entry continuity gap links to the return date for its own route', () => {
  const draft = travelDraft();
  draft.reentry = [
    { ...ordinary, returnOn: '2028-04-10' },
    {
      route: 'deemed',
      departureOn: '2027-04-12',
      returnOn: '2028-04-13',
      stayIndefinite: true,
      specialPermanentResident: false,
    },
    {
      route: 'refugee-travel-document',
      departureOn: '2027-04-12',
      returnOn: '2028-04-10',
      permit: {
        effectiveOn: '2027-04-05',
        expiresOn: '2028-04-05',
        entryDeadlineNotSpecified: true,
      },
    },
  ];
  const paths = jp.run(draft, 'en').columns[0].pathways;
  for (const { route } of draft.reentry) {
    const assessment = paths.find((path) => path.id === 'jp.reentry.' + route)!;
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
        <GapSummary country={jp} assessment={assessment} canWhatIf />
      </LocaleContext>,
    );
    const links = html.match(/<a\b[^>]*>/g) ?? [];
    expect(
      links.find((link) => link.includes('Return and continuity of status')),
    ).toContain('href="/japan/whatif?focus=' + route + '"');
  }
  expect(
    jp.whatif.focusForRule(
      'jp.reentry.ordinary-validity',
      'jp.reentry.ordinary',
    ),
  ).toBeUndefined();
  expect(
    jp.whatif.focusForRule(
      'jp.reentry.refugee-document-validity',
      'jp.reentry.refugee-travel-document',
    ),
  ).toBeUndefined();
});

test('Japan policy lists every cited source exactly once and includes pathway-specific rules', () => {
  const policy = jp.policy;
  const sources = [
    ...policy.ruleSets.flatMap((s) => s.sources),
    ...Object.values(policy.rules)
      .flat()
      .flatMap((r) => r.sources),
    ...Object.values(policy.parameters).flatMap((p) =>
      Object.values(p.values).flatMap((v) => v.sources),
    ),
    ...policy.changelog.flatMap((c) => c.sources),
  ];
  expect(Object.keys(policy.sourceUrls).sort()).toEqual(
    [...new Set(sources.map((s) => s.srcId))].sort(),
  );
  for (const { srcId } of sources) {
    expect(sourceUrls[srcId], srcId).toMatch(/^https:\/\//);
    expect(policy.sourceUrls[srcId]).toBe(sourceUrls[srcId]);
  }
  expect(policy.sourceUrls).not.toHaveProperty('SRC-001');
  const rules = policy.rules[japanFull2026_11.ruleSetId].map((r) => r.id);
  for (const id of [
    'jp.pr.hsp-current-points',
    'jp.nat.japanese-language',
    'jp.reentry.ordinary-validity',
    'jp.reentry.consular-extension-fee',
  ])
    expect(rules).toContain(id);
});
