import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { JpFullReentryRequest } from '@uk-immigration/engine';
import { prEvidence } from '../../../packages/engine/test/japan-pr-fixture';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import JapanPage from '../app/japan/page';
import JapanPolicyPage from '../app/japan/policy/page';
import JapanSimulatePage from '../app/japan/simulate/page';
import { JapanWhatIfControls } from '../app/japan/whatif/controls';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import UkPolicyPage from '../app/uk/policy/page';
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
  permit: {
    effectiveOn: '2027-04-05',
    expiresOn: '2028-04-04',
    extensionApproved: false,
  },
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

test('a planned deemed departure leaves continuity pending and a shared negative declaration rules it out', () => {
  const draft = travelDraft();
  const deemed = {
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
  } satisfies JpFullReentryRequest;
  draft.reentry = [deemed];
  const path = jp.run(draft, 'en').columns[0].pathways[0];
  expect(path).toMatchObject({ status: 'UNKNOWN' });
  expect(path.earliestDate).toBeUndefined();
  expect(path.summary).toContain('2027-04-12');
  const departed = '2024-04-01';
  draft.reentry[0] = {
    ...deemed,
    departureOn: departed,
    returnOn: '2024-04-07',
    declaredIntentAtDeparture: false,
    declarationForDepartureOn: departed,
  };
  const shared = jp.run(decodeDraft(jp, encodeDraft(jp, draft))!, 'en')
    .columns[0].pathways[0];
  for (const id of [
    'jp.reentry.deemed-eligibility',
    'jp.reentry.return-continuity',
  ]) {
    expect(path.checks.find((check) => check.id === id)?.status).toBe(
      'UNKNOWN',
    );
    expect(shared.checks.find((check) => check.id === id)?.status).toBe(
      'NOT_MET',
    );
  }
});

const aprilTrip = { departureOn: '2024-04-01', returnOn: '2024-04-07' };
const aprilPermit = {
  effectiveOn: aprilTrip.departureOn,
  expiresOn: '2025-04-01',
  extensionApproved: false,
};
const ordinaryTrip = { ...ordinary, ...aprilTrip, permit: aprilPermit };
const ordinaryTripAtStayLimit = {
  ...ordinaryTrip,
  stayIndefinite: false,
  stayExpiresOn: aprilPermit.expiresOn,
  timelyRenewalPending: false,
};
const deemedTrip = {
  ...aprilTrip,
  route: 'deemed',
  lawfulStatus: true,
  specialPermanentResident: false,
  temporaryVisitor: false,
  originalStayMonths: 12,
  passportValid: true,
  residentCardOrCertificate: true,
  formalPermitRequired: false,
  declaredIntentAtDeparture: true,
  declarationForDepartureOn: aprilTrip.departureOn,
  permitVoided: false,
  stayExpiresOn: '2024-09-01',
  timelyRenewalPending: false,
} as const;
const renewalTrip = {
  ...deemedTrip,
  stayExpiresOn: '2024-04-30',
  timelyRenewalPending: true,
  returnOn: '2024-05-20',
};
const longDeemedTrip = {
  ...deemedTrip,
  returnOn: '2025-10-01',
  stayIndefinite: true,
  stayExpiresOn: undefined,
};
const refugeeTrip = {
  ...aprilTrip,
  route: 'refugee-travel-document',
  refugeeRecognition: true,
  hasJapaneseTravelDocument: true,
  permitVoided: false,
  permit: { ...aprilPermit, entryDeadlineNotSpecified: true },
} as const;

test.each([
  ['ordinary permit effective on departure', ordinaryTrip, 'MET', 'MET', 'MET'],
  [
    'ordinary permit effective later',
    { ...ordinaryTrip, permit: { ...aprilPermit, effectiveOn: '2024-04-02' } },
    'MET',
    'NOT_MET',
    'NOT_MET',
  ],
  [
    'ordinary permit missing start',
    { ...ordinaryTrip, permit: { ...aprilPermit, effectiveOn: undefined } },
    'MET',
    'UNKNOWN',
    'UNKNOWN',
  ],
  [
    'ordinary passport or alternative missing',
    { ...ordinaryTrip, passportOrApprovedAlternative: false },
    'NOT_MET',
    'MET',
    'NOT_MET',
  ],
  [
    'ordinary extension decision unknown, return within original term',
    {
      ...ordinaryTrip,
      permit: { ...aprilPermit, extensionApproved: undefined },
    },
    'MET',
    'UNKNOWN',
    'MET',
  ],
  [
    'single entry already used',
    { ...ordinaryTrip, visits: 'single', previouslyUsedSingleEntry: true },
    'MET',
    'MET',
    'NOT_MET',
  ],
  ['deemed passport valid', deemedTrip, 'MET', 'MET', 'MET'],
  [
    'deemed passport invalid',
    { ...deemedTrip, passportValid: false },
    'NOT_MET',
    'MET',
    'NOT_MET',
  ],
  [
    'deemed passport unconfirmed',
    { ...deemedTrip, passportValid: undefined },
    'UNKNOWN',
    'MET',
    'UNKNOWN',
  ],
  [
    'deemed declaration refused',
    { ...deemedTrip, declaredIntentAtDeparture: false },
    'NOT_MET',
    'MET',
    'NOT_MET',
  ],
  [
    'deemed declaration missing',
    { ...deemedTrip, declaredIntentAtDeparture: undefined },
    'UNKNOWN',
    'MET',
    'UNKNOWN',
  ],
  [
    'ordinary resident beyond the deemed term',
    longDeemedTrip,
    'MET',
    'NOT_MET',
    'NOT_MET',
  ],
  [
    'special permanent resident within the deemed term',
    { ...longDeemedTrip, specialPermanentResident: true },
    'MET',
    'MET',
    'MET',
  ],
  [
    'unconfirmed special status between the two terms',
    { ...longDeemedTrip, specialPermanentResident: undefined },
    'MET',
    'UNKNOWN',
    'UNKNOWN',
  ],
  ['renewal decision missing', renewalTrip, 'MET', 'UNKNOWN', 'UNKNOWN'],
  [
    'renewal decided before return',
    { ...renewalTrip, renewalDecisionOn: '2024-05-10' },
    'MET',
    'NOT_MET',
    'NOT_MET',
  ],
  [
    'renewal decided on return',
    { ...renewalTrip, renewalDecisionOn: renewalTrip.returnOn },
    'MET',
    'MET',
    'MET',
  ],
  [
    'return after special-period ceiling',
    { ...renewalTrip, returnOn: '2024-07-01' },
    'MET',
    'NOT_MET',
    'NOT_MET',
  ],
  [
    'original stay still covers the return, renewal end unknown',
    { ...renewalTrip, returnOn: renewalTrip.stayExpiresOn },
    'MET',
    'UNKNOWN',
    'MET',
  ],
  ['refugee document valid', refugeeTrip, 'MET', 'MET', 'MET'],
  [
    'refugee document absent',
    { ...refugeeTrip, hasJapaneseTravelDocument: false },
    'NOT_MET',
    'MET',
    'NOT_MET',
  ],
  [
    'refugee recognition missing',
    { ...refugeeTrip, refugeeRecognition: undefined },
    'UNKNOWN',
    'MET',
    'UNKNOWN',
  ],
  [
    'refugee document effective later',
    {
      ...refugeeTrip,
      permit: {
        ...refugeeTrip.permit,
        effectiveOn: '2024-04-02',
        expiresOn: '2025-04-02',
      },
    },
    'MET',
    'NOT_MET',
    'NOT_MET',
  ],
] as const)(
  'shared re-entry assessment and result groups agree for %s',
  (_label, route, eligibility, period, continuity) => {
    const draft = decodeDraft(
      jp,
      encodeDraft(jp, {
        ...travelDraft(),
        applicationDate: '2024-03-29',
        reentry: [route],
      }),
    )!;
    const result = jp.run(draft, 'zh-CN');
    const path = result.columns[0].pathways[0];
    const html = renderToStaticMarkup(
      <ResultView country={jp} result={result} draft={draft} />,
    );
    const [eligibilityId, periodId] = {
      ordinary: ['ordinary-eligibility', 'ordinary-validity'],
      deemed: ['deemed-eligibility', 'deemed-validity'],
      'refugee-travel-document': [
        'refugee-document',
        'refugee-document-validity',
      ],
    }[route.route];
    for (const [id, expected] of [
      [eligibilityId, eligibility],
      [periodId, period],
      ['return-continuity', continuity],
    ] as const) {
      const row = path.checks.find((item) => item.id === 'jp.reentry.' + id)!;
      expect(row.status).toBe(expected);
      const group = { MET: 'PASS', NOT_MET: 'FAIL', UNKNOWN: 'UNKNOWN' }[
        expected
      ];
      expect(html).toContain(
        `data-status="${group}"><strong>${row.title}</strong>`,
      );
      if (id !== eligibilityId && 'renewalDecisionOn' in route)
        expect(row.explanation).toContain(route.renewalDecisionOn);
      if (id !== eligibilityId && route === renewalTrip) {
        expect(row.explanation).toContain('上限');
        expect(row.explanation).toContain('2024-06-30');
        expect(row.explanation).toContain('截止日待确认');
        expect(row.explanation).not.toMatch(/可核对截止日为|截止 2024-06-30/);
      }
      if (
        id === 'return-continuity' &&
        _label ===
          'ordinary extension decision unknown, return within original term'
      ) {
        expect(row.explanation).toContain('返日在原许可期限内');
        expect(row.explanation).not.toContain('延期审批待确认');
      }
    }
  },
);

test.each([
  ['2024-04-03', 'no proposed filing date', ordinaryTrip, undefined, 'NOT_MET'],
  ['2024-04-03', 'filing before departure', ordinaryTrip, '2024-03-29', 'MET'],
  ['2024-04-08', 'no proposed filing date', ordinaryTrip, undefined, 'NOT_MET'],
  ['2024-04-08', 'filing before departure', ordinaryTrip, '2024-03-29', 'MET'],
  [
    '2024-04-08',
    'extension declined at the stay limit',
    ordinaryTripAtStayLimit,
    '2024-03-29',
    'MET',
  ],
  [
    '2024-04-08',
    'extension unanswered at the stay limit',
    {
      ...ordinaryTripAtStayLimit,
      permit: { ...aprilPermit, extensionApproved: undefined },
    },
    '2024-03-29',
    'MET',
  ],
] as const)(
  'the departed ordinary trip keeps its deadline and continuity on %s with %s',
  (simulationDate, _label, route, applicationDate, filingStatus) => {
    const draft = decodeDraft(
      jp,
      encodeDraft(jp, {
        ...travelDraft(),
        simulationDate,
        applicationDate,
        reentry: [route],
      }),
    )!;
    const result = jp.run(draft, 'zh-CN');
    const path = result.columns[0].pathways[0];
    const html = renderToStaticMarkup(
      <ResultView country={jp} result={result} draft={draft} />,
    );
    expect(path.status).toBe(filingStatus);
    const filing = path.checks.find(
      (row) => row.id === 'jp.reentry.ordinary-eligibility',
    )!;
    expect(filing.status).toBe(filingStatus);
    expect(html).toContain(
      `data-status="${filingStatus === 'MET' ? 'PASS' : 'FAIL'}"><strong>${filing.title}</strong>`,
    );
    for (const id of ['ordinary-validity', 'return-continuity']) {
      const row = path.checks.find((check) => check.id === 'jp.reentry.' + id)!;
      expect(row.status).toBe('MET');
      expect(row.explanation).toContain(aprilPermit.expiresOn);
      expect(html).toContain(
        `data-status="PASS"><strong>${row.title}</strong>`,
      );
      expect(html).toContain(row.explanation);
    }
    expect(html).not.toMatch(
      /延期审批待确认|法定延期上限为 2026-04-01|出境时所需的再入国条件未满足/,
    );
  },
);

test.each([
  ['zh-CN', '本次出境前，这份单次许可是否已经用过？'],
  [
    'en',
    'Had you already used this single-entry permit before this departure?',
  ],
] as const)(
  'the single-entry question and shared return result agree in %s',
  (locale, label) => {
    for (const previouslyUsedSingleEntry of [false, true]) {
      const draft = decodeDraft(
        jp,
        encodeDraft(jp, {
          ...travelDraft(),
          simulationDate: '2024-04-08',
          reentry: [
            { ...ordinaryTrip, visits: 'single', previouslyUsedSingleEntry },
          ],
        }),
      )!;
      const form = renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          {JapanSimulatePage().props.children({
            draft,
            errors: {},
            update: () => {},
          })}
        </LocaleContext>,
      );
      expect(form).toContain(
        `for="jp-travel-ordinary-previouslyUsedSingleEntry">${label}</label>`,
      );
      const result = jp.run(draft, locale);
      const continuity = result.columns[0].pathways[0].checks.find(
        (row) => row.id === 'jp.reentry.return-continuity',
      )!;
      expect(continuity.status).toBe(
        previouslyUsedSingleEntry ? 'NOT_MET' : 'MET',
      );
      const html = renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <ResultView country={jp} result={result} draft={draft} />
        </LocaleContext>,
      );
      expect(html).toContain(
        `data-status="${previouslyUsedSingleEntry ? 'FAIL' : 'PASS'}"><strong>${continuity.title}</strong>`,
      );
    }
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Japan result details group currency amounts and ranges in %s',
  (locale) => {
    const draft: JapanDraft = {
      ...travelDraft(),
      permanentResidence: {
        routes: [{ route: 'general', statusStart: '2014-04-01' }],
        evidence: {
          spouseExpectedAnnualPensionYen: 0,
          pensionSupplementAssetsYen: 1_234_567,
        },
      },
      reentry: [
        { ...ordinary, consularExtension: true, consularArea: 'other' },
      ],
    };
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <ResultView country={jp} result={jp.run(draft, locale)} draft={draft} />
      </LocaleContext>,
    );
    expect(html).toContain('JPY 30,000,000');
    expect(html).toContain('JPY 2,900–3,100');
    expect(html).toContain(
      (locale === 'en' ? 'unreported' : '待填') + ' / 0 / 1,234,567',
    );
    expect(html).not.toMatch(/JPY \d{4,}/);
  },
);

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

test.each([
  ['matching special status', '2025-10-01', true, undefined, 'MET'],
  ['matching ordinary status', '2025-10-01', false, undefined, 'NOT_MET'],
  ['conflicting answers', '2025-10-01', true, false, 'UNKNOWN'],
  ['another return', '2025-09-30', true, undefined, 'UNKNOWN'],
] as const)(
  'changing the deemed return date preserves the baseline evidence for %s',
  (_case, historyReturn, historyStatus, routeStatus, expected) => {
    const departed = '2024-04-01';
    const baseline: JapanDraft = {
      ...travelDraft(),
      naturalisation: {
        routes: [{ route: 'general', homeMajorityAge: 18 }],
        evidence: {},
      },
      trips: [
        {
          departure: 'deemed',
          departed,
          returned: historyReturn,
          specialPermanentResident: historyStatus,
        },
      ],
      reentry: [
        {
          route: 'deemed',
          departureOn: departed,
          returnOn: '2025-10-01',
          specialPermanentResident: routeStatus,
          lawfulStatus: true,
          passportValid: true,
          residentCardOrCertificate: true,
          formalPermitRequired: false,
          stayIndefinite: true,
          declaredIntentAtDeparture: true,
          declarationForDepartureOn: departed,
          permitVoided: false,
        },
      ],
    };
    const continuity = (draft: JapanDraft) =>
      jp
        .run(draft, 'en')
        .columns[0].pathways.find((path) => path.id === 'jp.reentry.deemed')!
        .checks.find((check) => check.id === 'jp.reentry.return-continuity')!
        .status;
    const knobs = {
      ...jp.whatif.initial(baseline),
      returns: { deemed: '2025-10-02' },
    };
    expect(continuity(baseline)).toBe(expected);
    const compared = jp.whatif.apply(baseline, knobs);
    expect(jp.whatif.validate(compared, knobs)).toEqual({});
    expect(compared.reentry[0].returnOn).toBe('2025-10-02');
    expect(continuity(compared)).toBe(expected);
    expect(continuity(decodeDraft(jp, encodeDraft(jp, compared))!)).toBe(
      expected,
    );
    expect(baseline.reentry[0].returnOn).toBe('2025-10-01');
    expect(baseline.reentry[0].specialPermanentResident).toBe(routeStatus);
    expect(baseline.trips[0].specialPermanentResident).toBe(historyStatus);
  },
);

test.each([
  ['valid departure documents', deemedTrip, 'MET'],
  ['invalid passport', { ...deemedTrip, passportValid: false }, 'NOT_MET'],
  ['voided permission', { ...deemedTrip, permitVoided: true }, 'NOT_MET'],
  [
    'lost document without validity evidence',
    { ...deemedTrip, travelDocumentLost: true },
    'UNKNOWN',
  ],
  [
    'missing residence card',
    { ...deemedTrip, residentCardOrCertificate: false },
    'NOT_MET',
  ],
  [
    'unconfirmed passport',
    { ...deemedTrip, passportValid: undefined },
    'UNKNOWN',
  ],
  [
    'no declaration',
    { ...deemedTrip, declaredIntentAtDeparture: false },
    'NOT_MET',
  ],
] as const)(
  'shared PR and deemed results use the same trip evidence for %s',
  (_label, route, expected) => {
    const baseline: JapanDraft = {
      ...travelDraft(),
      permanentResidence: {
        routes: [
          {
            route: 'general',
            statusStart: '2014-04-01',
            newStatusStart: '2014-04-01',
          },
        ],
        evidence: {},
      },
      trips: [
        {
          departed: aprilTrip.departureOn,
          returned: aprilTrip.returnOn,
          departure: 'deemed',
        },
      ],
      reentry: [route],
    };
    const knobs = {
      ...jp.whatif.initial(baseline),
      returns: { deemed: '2024-04-08' },
    };
    const compared = jp.whatif.apply(baseline, knobs);
    expect(compared.reentry[0].returnOn).toBe(knobs.returns.deemed);
    for (const scenario of [baseline, compared]) {
      const draft = decodeDraft(jp, encodeDraft(jp, scenario))!;
      const result = jp.run(draft, 'zh-CN');
      const [pr, deemed] = result.columns[0].pathways;
      expect(pr.timeEarliestDate).toBe(
        expected === 'NOT_MET'
          ? '2034-04-07'
          : expected === 'MET'
            ? draft.simulationDate
            : undefined,
      );
      const html = renderToStaticMarkup(
        <ResultView country={jp} result={result} draft={draft} />,
      );
      for (const row of [
        pr.checks.find((item) => item.id === 'jp.pr.continuous-stay')!,
        deemed.checks.find(
          (item) => item.id === 'jp.reentry.return-continuity',
        )!,
      ]) {
        expect(row.status).toBe(expected);
        const group = { MET: 'PASS', NOT_MET: 'FAIL', UNKNOWN: 'UNKNOWN' }[
          expected
        ];
        expect(html).toContain(
          `data-status="${group}"><strong>${row.title}</strong>`,
        );
      }
    }
    expect(baseline.trips[0].departure).toBe('deemed');
  },
);

test.each([
  ['2024-04-05', undefined, 'NOT_MET', '2034-04-07', undefined],
  ['2024-04-08', undefined, 'MET', '2027-04-03', '2027-04-05'],
  [undefined, undefined, 'UNKNOWN', undefined, undefined],
  ['2024-04-08', '2024-04-07', 'NOT_MET', '2034-04-07', undefined],
  ['2024-04-08', '2024-04-09', 'UNKNOWN', undefined, undefined],
] as const)(
  'shared deemed return and general PR use decision %s and new landing %s',
  (renewalDecisionOn, newLandingOn, status, timeEarliestDate, earliestDate) => {
    const stayExpiry = '2024-04-03';
    const scenario: JapanDraft = {
      ...travelDraft(),
      dateOfBirth: '1990-05-01',
      permanentResidence: {
        routes: [
          {
            route: 'general',
            statusStart: '2014-04-01',
            newStatusStart: '2014-04-01',
          },
        ],
        evidence: prEvidence,
      },
      trips: [
        {
          departed: aprilTrip.departureOn,
          returned: aprilTrip.returnOn,
          departure: 'deemed',
          stayExpiry,
          renewalPending: true,
        },
      ],
      reentry: [
        {
          ...deemedTrip,
          stayExpiresOn: stayExpiry,
          timelyRenewalPending: true,
          renewalDecisionOn,
          newLandingOn,
        },
      ],
    };
    const shared = decodeDraft(jp, encodeDraft(jp, scenario))!;
    const [pr, deemed] = jp.run(shared, 'en').columns[0].pathways;
    expect(
      deemed.checks.find((c) => c.id === 'jp.reentry.return-continuity')
        ?.status,
    ).toBe(status);
    expect(
      pr.checks.find((c) => c.id === 'jp.pr.continuous-stay')?.status,
    ).toBe(status);
    expect(pr.timeEarliestDate).toBe(timeEarliestDate);
    expect(pr.earliestDate).toBe(earliestDate);
    if (status === 'NOT_MET') {
      const onRestartedAnniversary: JapanDraft = {
        ...shared,
        applicationDate: timeEarliestDate,
        permanentResidence: {
          ...shared.permanentResidence,
          evidence: {
            ...prEvidence,
            status: { ...prEvidence.status, expiresOn: '2034-04-30' },
          },
        },
      };
      expect(
        jp.run(onRestartedAnniversary, 'en').columns[0].pathways[0]
          .earliestDate,
      ).toBe('2034-04-07');
    }
  },
);

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

test('Japan policy links every SRC-116 locator to its official document', () => {
  const html = renderToStaticMarkup(<JapanPolicyPage />);
  const links = [
    ...html.matchAll(/<a href="([^"]+)"[^>]*>SRC-116 ([^<]+)<\/a>/g),
  ].map(([, href, locator]) => [locator.replaceAll('&amp;', '&'), href]);
  const isa = 'https://www.moj.go.jp/isa';
  const qa = isa + '/immigration/faq/kanri_qa.html';
  const expected = {
    '出入国審査・在留審査Q&A Q28': qa + '#q28',
    '出入国審査・在留審査 Q&A Q53': qa + '#q54',
    '出入国審査・在留審査Q&A Q57–61': qa + '#q58',
    '出入国審査・在留審査Q&A Q61': qa + '#q62',
    再入国許可: isa + '/immigration/procedures/sainyukoku_00002.html',
    みなし再入国許可:
      isa + '/immigration/procedures/minashisainyukoku_00001.html',
    '永住者の在留資格について p5': isa + '/content/930003741.pdf',
  };
  expect(new Set(links.map(([locator]) => locator))).toEqual(
    new Set(Object.keys(expected)),
  );
  for (const [locator, href] of links)
    expect(expected).toHaveProperty([locator], href);
});

test.each(['zh-CN', 'en'] as const)(
  'Japan policy names the country and groups amounts, and the UK retains its heading in %s',
  (locale) => {
    const render = (Page: typeof JapanPolicyPage) =>
      renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <Page />
        </LocaleContext>,
      );
    const japan = render(JapanPolicyPage);
    expect(japan).toContain(
      locale === 'en'
        ? '<h1>Policy basis for Japan</h1>'
        : '<h1>日本政策依据</h1>',
    );
    expect(japan).toContain('businessAssetsYen 30,000,000');
    expect(japan).toContain(locale === 'en' ? '2,900, 3,100' : '2,900、3,100');
    expect(render(UkPolicyPage)).toContain(
      locale === 'en' ? '<h1>Policy basis</h1>' : '<h1>政策依据</h1>',
    );
  },
);
