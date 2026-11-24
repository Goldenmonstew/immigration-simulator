import { Children, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { prEvidence } from '../../../packages/engine/test/japan-pr-fixture';
import JapanSimulatePage from '../app/japan/simulate/page';
import { ShareLink } from '../components/share-link';
import { WhatIfView } from '../components/whatif-lab';
import { readPageResult } from '../lib/page-result';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { japanSteps, type JapanDraft } from '../lib/japan-draft';
import { japanModule as jp } from '../lib/japan-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import { draftStorage, loadScenario, readScenarios } from '../lib/storage';

const fields = new Map<
  string,
  (event: { target: { value: string } }) => void
>();
vi.mock('../app/simulate/field', async (original) => {
  const { Field } = await original<typeof import('../app/simulate/field')>();
  return {
    Field: (props: Parameters<typeof Field>[0]) => {
      if (
        isValidElement<{
          onChange: (event: { target: { value: string } }) => void;
        }>(props.children)
      )
        fields.set(props.id, props.children.props.onChange);
      return <Field {...props} />;
    },
  };
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function form(
  draft: JapanDraft,
  update: (patch: Partial<JapanDraft>) => void = () => {},
  errors = jp.validateStep(draft),
) {
  fields.clear();
  return renderToStaticMarkup(
    <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
      {JapanSimulatePage().props.children({
        draft,
        errors,
        update,
      })}
    </LocaleContext>,
  );
}

test('ordinary permit edits keep lawful status only for the date the answer describes', () => {
  let draft: JapanDraft = {
    ...jp.createDraft(),
    step: 0,
    simulationDate: '2026-11-23',
    applicationDate: '2026-11-24',
    reentry: [
      {
        route: 'ordinary',
        departureOn: '2026-11-26',
        lawfulStatus: true,
        permit: { effectiveOn: '2026-11-25' },
      },
    ],
  };
  function answer(id: string, value: string) {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get(id)!({ target: { value } });
  }
  answer('jp-simulationDate', '2026-11-25');
  expect(draft.applicationDate).toBe('2026-11-24');
  expect(draft.reentry[0].lawfulStatus).toBeUndefined();
  draft.step = 6;
  expect(form(draft)).toContain(t('jp.form.ordinaryLawfulStatus', 'en'));
  answer('jp-travel-ordinary-lawfulStatus', 'no');
  answer('jp-travel-ordinary-permit-effectiveOn', '2026-11-25');
  expect(draft.reentry[0].lawfulStatus).toBe(false);
  answer('jp-travel-ordinary-permit-effectiveOn', '2026-11-26');
  expect(draft.reentry[0].lawfulStatus).toBeUndefined();
});

test('birth departure method and return within permit validity can be answered and edited independently', () => {
  let draft: JapanDraft = {
    ...jp.createDraft(),
    step: 1,
    stayStart: '2026-10-01',
    permanentResidence: {
      routes: [{ route: 'child-birth', bornOn: '2026-10-01' }],
      evidence: {},
    },
    trips: [{ departed: '2026-10-15', returned: '2026-12-01' }],
  };
  function answer(key: string, value: string) {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-trips-0-' + key)!({ target: { value } });
  }
  answer('departure', 'permit');
  expect(draft.trips[0]).not.toHaveProperty('reentryPermit');
  answer('reentryPermit', 'no');
  expect(draft.trips[0]).toMatchObject({
    departure: 'permit',
    reentryPermit: false,
  });
  expect(jp.validateStep(draft)).toEqual({});
  expect(
    decodeDraft(jp, encodeDraft(jp, { ...draft, completed: true }))?.trips,
  ).toEqual(draft.trips);
  answer('departure', '');
  expect(draft.trips[0]).not.toHaveProperty('reentryPermit');
  form(draft);
  expect(fields.has('jp-trips-0-reentryPermit')).toBe(false);
});

test('selecting To confirm removes a previous explicit negative renewal answer before evaluation', () => {
  let draft: JapanDraft = {
    ...jp.createDraft(),
    step: 1,
    simulationDate: '2026-11-24',
    stayStart: '2013-01-01',
    permanentResidence: {
      routes: [
        {
          route: 'general',
          statusStart: '2016-10-01',
          newStatusStart: '2016-10-01',
        },
      ],
      evidence: {},
    },
    trips: [
      {
        departed: '2026-10-01',
        returned: '2026-11-10',
        stayExpiry: '2026-10-15',
        departure: 'permit',
        reentryPermit: true,
        renewalPending: false,
      },
    ],
  };
  expect(jp.run(draft, 'en').columns[0].pathways[0].timeEarliestDate).toBe(
    '2036-11-10',
  );
  form(draft, (patch) => {
    draft = { ...draft, ...patch };
  });
  fields.get('jp-trips-0-renewalPending')!({ target: { value: '' } });
  expect(draft.trips[0]).not.toHaveProperty('renewalPending');
  expect(jp.validateStep(draft)).toEqual({});
  expect(
    decodeDraft(jp, encodeDraft(jp, { ...draft, completed: true }))?.trips,
  ).toEqual(draft.trips);
  const assessed = jp.run(draft, 'en').columns[0].pathways[0];
  expect(assessed.timeStatus).toBe('UNKNOWN');
  expect(assessed.timeEarliestDate).toBeUndefined();
  expect(assessed.summary).toContain('confirm whether a timely renewal');
});

function generalTripDraft(): JapanDraft {
  return {
    ...jp.createDraft(),
    step: 1,
    simulationDate: '2027-04-03',
    stayStart: '2015-04-01',
    permanentResidence: {
      routes: [
        {
          route: 'general',
          statusStart: '2016-04-01',
          newStatusStart: '2016-04-01',
        },
      ],
      evidence: {},
    },
    trips: [{ departed: '2026-10-01', returned: '2026-11-10' }],
  };
}

test('refugee PR and the travel document use the recorded method and evidence for the same return', () => {
  let draft = generalTripDraft();
  draft.completed = true;
  draft.permanentResidence = {
    routes: [{ route: 'refugee', statusStart: '2017-04-01' }],
    evidence: { ...prEvidence, protectionRecognition: 'refugee' },
  };
  const trip = draft.trips[0];
  const document = {
    route: 'refugee-travel-document',
    departureOn: trip.departed,
    returnOn: trip.returned,
    refugeeRecognition: true,
    hasJapaneseTravelDocument: true,
    permitVoided: false,
    permit: {
      effectiveOn: '2026-04-01',
      expiresOn: '2027-04-01',
      entryDeadlineNotSpecified: true,
      extensionApproved: false,
    },
  } as const;
  draft.reentry = [document];
  const markup = form(draft, (patch) => {
    draft = { ...draft, ...patch };
  });
  expect(markup).toContain(
    '<option value="refugee-travel-document">Japanese refugee travel document</option>',
  );
  fields.get('jp-trips-0-departure')!({ target: { value: document.route } });
  const restored = decodeDraft(jp, encodeDraft(jp, draft))!;
  expect(restored.trips[0].departure).toBe(document.route);
  function continuity(answers: JapanDraft) {
    return jp.run(answers, 'en').columns[0].pathways.map((path) =>
      path.checks.find((c) =>
        ['jp.pr.continuous-stay', 'jp.reentry.return-continuity'].includes(c.id),
      )?.status,
    );
  }
  expect(continuity(restored)).toEqual(['MET', 'MET']);
  const voided = { ...restored, reentry: [{ ...document, permitVoided: true }] };
  expect(continuity(voided)).toEqual(['NOT_MET', 'NOT_MET']);
  expect(continuity({ ...restored, reentry: [] })).toEqual(['UNKNOWN']);
});

test.each([
  ['2024-04-05', 'NOT_MET', '2034-04-07', undefined],
  ['2024-04-08', 'MET', '2027-04-03', '2027-04-05'],
  ['', 'UNKNOWN', undefined, undefined],
] as const)(
  'general PR alone evaluates the shared trip decision "%s" after sharing',
  (decision, status, milestone, filing) => {
    let draft = generalTripDraft();
    draft.completed = true;
    draft.dateOfBirth = '1990-05-01';
    draft.permanentResidence.evidence = prEvidence;
    draft.trips = [
      {
        departed: '2024-04-01',
        returned: '2024-04-07',
        departure: 'deemed',
        stayExpiry: '2024-04-03',
        renewalPending: true,
      },
    ];
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-trips-0-renewalDecisionOn')!({
      target: { value: decision },
    });
    const restored = decodeDraft(jp, encodeDraft(jp, draft))!;
    expect(restored.trips[0].renewalDecisionOn).toBe(decision || undefined);
    const paths = jp.run(restored, 'en').columns[0].pathways;
    expect(paths).toHaveLength(1);
    expect(
      paths[0].checks.find((check) => check.id === 'jp.pr.continuous-stay')
        ?.status,
    ).toBe(status);
    expect(paths[0].timeEarliestDate).toBe(milestone);
    expect(paths[0].earliestDate).toBe(filing);
  },
);

test.each([
  ['stayExpiry', 'stayExpiresOn', '2026-11-16', '2026-11-17'],
  ['renewalPending', 'timelyRenewalPending', 'yes', 'no'],
  ['specialPermanentResident', 'specialPermanentResident', 'yes', 'no'],
  ['newLandingOn', 'newLandingOn', '2026-11-10', '2026-11-09'],
] as const)(
  'history and re-entry share edits and clear %s',
  (historyKey, travelKey, first, second) => {
    let draft = generalTripDraft();
    const trip = draft.trips[0];
    trip.departure = 'deemed';
    draft.reentry = [
      { route: 'deemed', departureOn: trip.departed, returnOn: trip.returned },
      {
        route: 'ordinary',
        departureOn: trip.departed,
        returnOn: trip.returned,
      },
      {
        route: 'refugee-travel-document',
        departureOn: trip.departed,
        returnOn: '2026-11-11',
      },
    ];
    const edit = (step: number, id: string, value: string) => {
      draft.step = step;
      form(draft, (patch) => {
        draft = { ...draft, ...patch };
      });
      fields.get(id)!({ target: { value } });
    };
    edit(1, 'jp-trips-0-' + historyKey, first);
    const displayed = form({ ...draft, step: 6 });
    for (const route of draft.reentry.slice(0, 2)) {
      expect(route[travelKey]).toBeUndefined();
      const input = displayed.split(
        'id="jp-travel-' + route.route + '-' + travelKey + '"',
      )[1];
      expect(input).toBeDefined();
      if (first === 'yes')
        expect(input.split('</select>')[0]).toContain(
          '<option value="yes" selected',
        );
      else expect(input.split('/>')[0]).toContain('value="' + first + '"');
    }
    expect(draft.reentry[2][travelKey]).toBeUndefined();
    edit(6, 'jp-travel-ordinary-' + travelKey, second);
    const restored = decodeDraft(jp, encodeDraft(jp, draft))!;
    expect(restored.trips[0][historyKey]).toBeUndefined();
    expect(restored.reentry[0][travelKey]).toBeUndefined();
    expect(restored.reentry[1][travelKey]).toBe(
      second === 'no' ? false : second,
    );
    edit(1, 'jp-trips-0-' + historyKey, '');
    for (const route of draft.reentry) expect(route[travelKey]).toBeUndefined();
  },
);

test('editing one shared answer leaves other explicit disagreements visible until corrected', () => {
  let draft = generalTripDraft();
  const trip = draft.trips[0];
  trip.stayExpiry = '2026-11-14';
  trip.renewalPending = false;
  draft.reentry = [
    {
      route: 'deemed',
      departureOn: trip.departed,
      returnOn: trip.returned,
      stayExpiresOn: '2026-11-16',
      timelyRenewalPending: true,
    },
  ];
  const edit = (id: string, value: string) => {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-trips-0-' + id)!({ target: { value } });
  };
  edit('renewalDecisionOn', '2026-11-13');
  expect(draft.trips[0]).toMatchObject({
    stayExpiry: '2026-11-14',
    renewalPending: false,
  });
  expect(draft.reentry[0]).toMatchObject({
    stayExpiresOn: '2026-11-16',
    timelyRenewalPending: true,
  });
  expect(draft.trips[0].renewalDecisionOn).toBe('2026-11-13');
  expect(draft.reentry[0].renewalDecisionOn).toBeUndefined();
  edit('renewalPending', 'no');
  expect(draft.reentry[0].stayExpiresOn).toBe('2026-11-16');
  expect(draft.reentry[0].timelyRenewalPending).toBeUndefined();
  expect(draft.trips[0].renewalPending).toBe(false);
});

test.each(['ordinary', 'deemed', 'refugee-travel-document'] as const)(
  '%s flags a pre-departure decision on an application marked pending at departure',
  (route) => {
    const draft: JapanDraft = {
      ...jp.createDraft(),
      step: 6,
      completed: true,
      simulationDate: '2026-11-24',
      reentry: [
        {
          route,
          departureOn: '2024-04-01',
          stayExpiresOn: '2024-04-03',
          returnOn: '2024-04-07',
          timelyRenewalPending: true,
          renewalDecisionOn: '2024-03-29',
        },
      ],
    };
    const prefix = 'jp-travel-' + route + '-';
    expect(jp.validateStep(draft)).toEqual({
      [prefix + 'timelyRenewalPending']: 'jp.error.renewalBeforeDeparture',
      [prefix + 'renewalDecisionOn']: 'jp.error.renewalBeforeDeparture',
    });
    expect(form(draft)).toContain(prefix + 'renewalDecisionOn-error');
    expect(decodeDraft(jp, encodeDraft(jp, draft))).toBeUndefined();
    expect(jp.restoreStoredDraft!(draft)).toEqual({
      ...draft,
      completed: false,
    });
    expect(jp.run(draft, 'en').shortCircuit?.reason).toBe(
      'renewal-before-departure',
    );

    // Day-only dates allow a decision later on departure day.
    draft.reentry[0].renewalDecisionOn = '2024-04-01';
    expect(jp.validateStep(draft)).toEqual({});
    // A later decision alone does not establish the application was pending at departure.
    draft.reentry[0].timelyRenewalPending = false;
    draft.reentry[0].renewalDecisionOn = '2024-04-05';
    expect(decodeDraft(jp, encodeDraft(jp, draft))).toEqual(draft);
  },
);

test('loading, refreshing and sharing an old named plan agree about a renewal pending at departure', async () => {
  const plan = {
    id: 'legacy',
    name: 'Renewal',
    savedAt: '2026-11-24',
    draft: {
      ...jp.createDraft(),
      completed: true,
      simulationDate: '2026-11-24',
      reentry: [
        {
          route: 'ordinary' as const,
          departureOn: '2024-04-01',
          returnOn: '2024-04-07',
          stayExpiresOn: '2024-04-03',
          timelyRenewalPending: true,
          renewalDecisionOn: '2024-03-29',
        },
      ],
    },
  };
  const planKey = 'jp-immigration-scenarios-v1';
  const draftKey = 'jp-immigration-draft-v1';
  const storage = new Map([[planKey, JSON.stringify([plan])]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const readAndLoad = () => {
    const saved = readScenarios(jp).scenarios[0];
    expect(JSON.parse(storage.get(planKey)!)[0].draft).toEqual(saved.draft);
    const loaded = loadScenario(jp, saved);
    expect(loaded).toEqual(saved.draft);
    expect(JSON.parse(storage.get(draftKey)!)).toEqual(loaded);
    const refreshed = draftStorage(jp).draft!;
    expect(refreshed).toEqual(loaded);
    expect(JSON.parse(storage.get(draftKey)!)).toEqual(loaded);
    return refreshed;
  };
  const unfinished = jp.createDraft();
  draftStorage(jp, unfinished);
  const finish = t('jp.result.finishQuestionnaire', 'en');
  expect(readPageResult(jp, 'en')).toEqual({
    draft: unfinished,
    correction: finish,
  });
  expect(readPageResult(jp, 'en', encodeDraft(jp, unfinished))).toEqual({
    correction: finish,
  });

  const invalid = readAndLoad();
  const legacyShare = encodeDraft(jp, plan.draft);
  const correction = t('jp.result.correctRenewalAtDeparture', 'en').replace(
    '{step}',
    t('jp.form.step6', 'en'),
  );
  expect(readPageResult(jp, 'en', invalid)).toEqual({
    draft: invalid,
    correction,
  });
  expect(readPageResult(jp, 'en')).toEqual({ draft: invalid, correction });
  expect(readPageResult(jp, 'en', legacyShare)).toEqual({ correction });
  expect(invalid).toMatchObject({ completed: false, step: 6 });
  expect(renderToStaticMarkup(<ShareLink country={jp} draft={invalid} />)).toBe(
    '',
  );
  expect(decodeDraft(jp, encodeDraft(jp, invalid), true)).toBeUndefined();

  // An old comparison can also carry a stale incomplete flag after a valid edit.
  plan.draft.completed = false;
  plan.draft.reentry[0].renewalDecisionOn = '2024-04-05';
  storage.set(planKey, JSON.stringify([plan]));
  const corrected = readAndLoad();
  expect(corrected.completed).toBe(true);
  expect(readPageResult(jp, 'en', legacyShare)).toEqual({ correction });
  expect(JSON.parse(storage.get(draftKey)!)).toEqual(corrected);
  expect(readPageResult(jp, 'en').result).toEqual(jp.run(corrected, 'en'));

  const writeText = vi
    .fn<(url: string) => Promise<void>>()
    .mockResolvedValue(undefined);
  vi.stubGlobal('window', { location: { origin: 'https://example.test' } });
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  let copy: (() => Promise<void>) | undefined;
  function findCopy(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (
        !isValidElement<{
          children?: ReactNode;
          onClick?: () => Promise<void>;
        }>(child)
      )
        return;
      if (child.type === 'button') copy = child.props.onClick;
      else findCopy(child.props.children);
    });
  }
  function Probe() {
    const share = ShareLink({ country: jp, draft: corrected });
    findCopy(share);
    return share;
  }
  renderToStaticMarkup(<Probe />);
  expect(copy).toBeDefined();
  await copy!();
  const url = new URL(writeText.mock.calls[0][0]);
  expect(url.pathname).toMatch(/\/japan\/result$/);
  const encoded = new URLSearchParams(url.hash.slice(1)).get('s')!;
  expect(decodeDraft(jp, encoded, true)).toEqual(corrected);
  expect(readPageResult(jp, 'en', encoded)).toEqual({
    draft: corrected,
    result: jp.run(corrected, 'en'),
    shared: true,
  });
  expect(decodeDraft(jp, encodeDraft(jp, plan.draft), true)).toEqual(corrected);
});

test('a contradictory permit extension is never assessed from a draft, scenario preview or share', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    completed: true,
    reentry: [
      {
        route: 'ordinary',
        permit: { expiresOn: '2027-04-05', extendedUntil: '2027-04-04' },
      },
    ],
  };
  const country = { ...jp, run: vi.fn(jp.run) };
  const correction = t('jp.result.finishQuestionnaire', 'en');
  expect(readPageResult(country, 'en', draft)).toMatchObject({
    draft: { completed: false, step: 6 },
    correction,
  });
  expect(
    readPageResult(country, 'en', draft, 'preview').result,
  ).toBeUndefined();
  expect(readPageResult(country, 'en', encodeDraft(country, draft))).toEqual({
    correction,
  });
  const comparison = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
      <WhatIfView country={country} draft={draft} />
    </LocaleContext>,
  );
  expect(comparison).toContain(correction);
  expect(comparison).not.toContain(t('share.copy', 'en'));
  expect(country.run).not.toHaveBeenCalled();
});

test.each([true, false])(
  'matching history and re-entry answers expose a renewal chronology error (decision in history: %s)',
  (decisionInHistory) => {
    const draft = generalTripDraft();
    const departed = '2024-04-01';
    const returned = '2024-04-07';
    const decision = '2024-03-29';
    draft.completed = true;
    draft.trips = [
      {
        departed,
        returned,
        stayExpiry: '2024-04-03',
        ...(decisionInHistory
          ? { renewalDecisionOn: decision }
          : { renewalPending: true }),
      },
    ];
    draft.reentry = [
      {
        route: 'ordinary',
        departureOn: departed,
        returnOn: returned,
        ...(decisionInHistory
          ? { timelyRenewalPending: true }
          : { renewalDecisionOn: decision }),
      },
    ];
    for (const [step, field] of [
      [
        1,
        'jp-trips-0-' +
          (decisionInHistory ? 'renewalDecisionOn' : 'renewalPending'),
      ],
      [
        6,
        'jp-travel-ordinary-' +
          (decisionInHistory ? 'timelyRenewalPending' : 'renewalDecisionOn'),
      ],
    ] as const)
      expect(jp.validateStep({ ...draft, step })).toEqual({
        [field]: 'jp.error.renewalBeforeDeparture',
      });
    expect(decodeDraft(jp, encodeDraft(jp, draft))).toBeUndefined();

    draft.reentry[0].returnOn = '2024-04-08';
    expect(jp.validateStep(draft)).toEqual({});
    expect(decodeDraft(jp, encodeDraft(jp, draft))).toEqual(draft);
  },
);

test.each([false, true])(
  'renewal chronology uses explicit evidence across re-entry routes even when copies disagree (with history: %s)',
  (withHistory) => {
    const draft = generalTripDraft();
    const departureOn = '2024-04-01';
    const returnOn = '2024-04-07';
    draft.step = 6;
    draft.completed = true;
    draft.trips = withHistory
      ? [
          {
            departed: departureOn,
            returned: returnOn,
            stayExpiry: '2024-04-03',
            renewalPending: false,
            renewalDecisionOn: '2024-04-05',
          },
        ]
      : [];
    if (!withHistory) draft.permanentResidence.routes = [];
    draft.reentry = [
      { route: 'ordinary', departureOn, returnOn, timelyRenewalPending: true },
      {
        route: 'deemed',
        departureOn,
        newLandingOn: returnOn,
        renewalDecisionOn: '2024-03-29',
      },
    ];
    expect(jp.validateStep(draft)).toEqual({
      'jp-travel-ordinary-timelyRenewalPending':
        'jp.error.renewalBeforeDeparture',
      'jp-travel-deemed-renewalDecisionOn': 'jp.error.renewalBeforeDeparture',
    });
    expect(decodeDraft(jp, encodeDraft(jp, draft))).toBeUndefined();

    draft.reentry[1].newLandingOn = '2024-04-08';
    expect(jp.validateStep(draft)).toEqual({});
    expect(decodeDraft(jp, encodeDraft(jp, draft))).toBeDefined();
  },
);

test('both forms display, edit and clear the renewal decision for the same itinerary', () => {
  let draft = generalTripDraft();
  const trip = draft.trips[0];
  draft.reentry = [
    {
      route: 'deemed',
      departureOn: trip.departed,
      returnOn: trip.returned,
      renewalDecisionOn: '2026-11-09',
    },
    {
      route: 'ordinary',
      departureOn: trip.departed,
      returnOn: '2026-11-15',
      renewalDecisionOn: '2026-11-14',
    },
  ];
  const atStep = (step: number) => {
    draft = { ...draft, step };
    return form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
  };
  const history = 'jp-trips-0-renewalDecisionOn';
  const travel = 'jp-travel-deemed-renewalDecisionOn';
  expect(atStep(1)).toMatch(
    new RegExp('id="' + history + '"[^>]*value="2026-11-09"'),
  );
  fields.get(history)!({ target: { value: '2026-11-11' } });
  expect(atStep(6)).toMatch(
    new RegExp('id="' + travel + '"[^>]*value="2026-11-11"'),
  );
  fields.get(travel)!({ target: { value: '' } });
  expect(atStep(1)).toMatch(new RegExp('id="' + history + '"[^>]*value=""'));
  fields.get(history)!({ target: { value: '2026-11-12' } });
  atStep(6);
  fields.get(travel)!({ target: { value: '2026-11-13' } });
  expect(atStep(1)).toMatch(
    new RegExp('id="' + history + '"[^>]*value="2026-11-13"'),
  );
  fields.get(history)!({ target: { value: '' } });
  const shared = decodeDraft(jp, encodeDraft(jp, draft))!;
  expect(shared.trips[0].renewalDecisionOn).toBeUndefined();
  expect(shared.reentry[0].renewalDecisionOn).toBeUndefined();
  expect(shared.reentry[1].renewalDecisionOn).toBe('2026-11-14');
});

test.each([false, true])(
  'clearing a landing used as the sole return date preserves other explicit answers (different explicit answer: %s)',
  (conflict) => {
    let draft = generalTripDraft();
    const trip = draft.trips[0];
    draft.trips.push({
      departed: '2018-01-01',
      returned: '2018-01-15',
      newLandingOn: '2018-01-15',
    });
    draft.reentry = [
      {
        route: 'deemed',
        departureOn: trip.departed,
        newLandingOn: trip.returned,
      },
      {
        route: 'ordinary',
        departureOn: trip.departed,
        returnOn: trip.returned,
      },
    ];
    draft.step = 6;
    const edit = (key: string, value: string) => {
      form(draft, (patch) => {
        draft = { ...draft, ...patch };
      });
      fields.get('jp-travel-deemed-' + key)!({ target: { value } });
    };
    edit('passportValid', 'yes');
    if (conflict)
      draft.reentry.push({
        route: 'refugee-travel-document',
        departureOn: trip.departed,
        returnOn: trip.returned,
        newLandingOn: '2026-11-09',
      });
    draft = decodeDraft(jp, encodeDraft(jp, draft))!;
    expect(draft.trips[0].newLandingOn).toBeUndefined();
    expect(draft.reentry[1].newLandingOn).toBeUndefined();
    expect(draft.reentry[0].newLandingOn).toBe(trip.returned);
    edit('newLandingOn', '');
    const saved = decodeDraft(jp, encodeDraft(jp, draft))!;
    expect(saved.trips[0].newLandingOn).toBeUndefined();
    expect(saved.reentry[0].newLandingOn).toBeUndefined();
    expect(saved.reentry[1].newLandingOn).toBeUndefined();
    expect(saved.trips[1].newLandingOn).toBe('2018-01-15');
    if (conflict) expect(saved.reentry[2].newLandingOn).toBe('2026-11-09');
  },
);

test.each([1, 6])(
  'correcting the expiry on step %i clears both obsolete expiry copies from a saved comparison',
  (step) => {
    let draft = generalTripDraft();
    const trip = draft.trips[0];
    trip.departure = 'deemed';
    trip.stayExpiry = '2026-12-01';
    trip.reentryStayExpiry = '2026-12-02';
    draft.reentry = [
      {
        route: 'deemed',
        departureOn: trip.departed,
        returnOn: trip.returned,
        stayExpiresOn: '2026-12-02',
        historyStayExpiry: '2026-12-01',
      },
    ];
    draft.step = step;
    draft = decodeDraft(jp, encodeDraft(jp, draft))!;
    expect(jp.run(draft, 'en').columns[0].pathways[0].summary).toContain(
      'Check both records',
    );
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    const input =
      step === 1 ? 'jp-trips-0-stayExpiry' : 'jp-travel-deemed-stayExpiresOn';
    fields.get(input)!({ target: { value: '2026-12-03' } });
    const saved = decodeDraft(jp, encodeDraft(jp, draft))!;
    expect(saved.trips[0].stayExpiry).toBe(
      step === 1 ? '2026-12-03' : undefined,
    );
    expect(saved.trips[0]).not.toHaveProperty('reentryStayExpiry');
    expect(saved.reentry[0].stayExpiresOn).toBe(
      step === 6 ? '2026-12-03' : undefined,
    );
    expect(saved.reentry[0]).not.toHaveProperty('historyStayExpiry');
    expect(jp.run(saved, 'en').columns[0].pathways[0].summary).not.toContain(
      'Check both records',
    );
  },
);

test('changing travel dates in a saved comparison releases the original history match', () => {
  let draft = generalTripDraft();
  const trip = draft.trips[0];
  trip.renewalPending = false;
  draft.reentry = [
    {
      route: 'ordinary',
      departureOn: trip.departed,
      returnOn: '2026-11-12',
      comparisonHistoryReturnOn: trip.returned,
    },
  ];
  draft.step = 6;
  const edit = (key: string, value: string) => {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-travel-ordinary-' + key)!({ target: { value } });
  };
  edit('timelyRenewalPending', 'yes');
  expect(draft.trips[0].renewalPending).toBeUndefined();
  expect(form({ ...draft, step: 1 })).toMatch(
    /id="jp-trips-0-renewalPending"[^>]*>.*?<option value="yes" selected/s,
  );
  edit('returnOn', '2026-11-13');
  expect(draft.reentry[0].comparisonHistoryReturnOn).toBeUndefined();
  edit('timelyRenewalPending', 'no');
  expect(draft.trips[0].renewalPending).toBeUndefined();
  expect(draft.reentry[0].timelyRenewalPending).toBe(false);
});

test('a new landing before departure has a field error even without a separate return date', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    step: 6,
    completed: true,
    reentry: [
      {
        route: 'deemed',
        departureOn: '2024-04-01',
        newLandingOn: '2024-03-31',
      },
    ],
  };
  const id = 'jp-travel-deemed-newLandingOn';
  expect(jp.validateStep(draft)).toEqual({ [id]: 'jp.error.order' });
  expect(form(draft)).toContain('aria-describedby="' + id + '-error"');
  expect(decodeDraft(jp, encodeDraft(jp, draft))).toBeUndefined();
  draft.reentry[0].newLandingOn = '2024-04-01';
  expect(jp.validateStep(draft)).toEqual({});
  expect(decodeDraft(jp, encodeDraft(jp, draft))).toEqual(draft);
});

test.each([
  ['2026-11-24', undefined, true, true],
  ['2026-11-24', '2026-12-01', true, true],
  ['2026-11-26', undefined, false, true],
  ['2026-11-27', undefined, false, false],
] as const)(
  'shared PR result describes the trip as of %s, with filing date %s',
  (simulationDate, applicationDate, plannedDeparture, plannedReturn) => {
    const draft: JapanDraft = {
      ...generalTripDraft(),
      simulationDate,
      applicationDate,
      completed: true,
      trips: [
        { departed: '2026-11-26', returned: '2026-11-27', departure: 'none' },
      ],
    };
    expect(jp.validateStep(draft)).toEqual({});
    const restored = decodeDraft(jp, encodeDraft(jp, draft))!;
    const zh = jp.run(restored, 'zh-CN').columns[0].pathways[0].summary;
    const en = jp.run(restored, 'en').columns[0].pathways[0].summary;
    expect(zh).toContain(
      plannedDeparture
        ? '计划于 2026-11-26 不持再入国许可出境'
        : '于 2026-11-26 未持再入国许可出境',
    );
    expect(en).toContain(
      plannedDeparture
        ? 'You plan to leave without re-entry permission on 2026-11-26'
        : 'You left without re-entry permission on 2026-11-26',
    );
    expect(zh).toContain(
      plannedReturn
        ? '若按计划于 2026-11-27 返日，连续在留将从该日重新起算'
        : '连续在留从返日的 2026-11-27 重新起算',
    );
    expect(en).toContain(
      plannedReturn
        ? 'If you return as planned on 2026-11-27, your unbroken stay would restart'
        : 'The unbroken stay restarted on return on 2026-11-27',
    );
  },
);

test.each(['ordinary', 'deemed', 'refugee-travel-document'] as const)(
  '%s accepts a future return plan and flags a future landing as an invalid fact',
  (route) => {
    const simulationDate = '2026-11-24';
    const planned: JapanDraft = {
      ...jp.createDraft(),
      simulationDate,
      step: 6,
      completed: true,
      reentry: [{ route, departureOn: '2026-11-26', returnOn: '2026-11-27' }],
    };
    expect(jp.validateStep(planned)).toEqual({});
    expect(decodeDraft(jp, encodeDraft(jp, planned))).toEqual(planned);

    const invalid = {
      ...planned,
      reentry: [
        { route, departureOn: '2026-11-26', newLandingOn: '2026-11-27' },
      ],
    };
    const field = 'jp-travel-' + route + '-newLandingOn';
    expect(jp.validateStep(invalid)).toEqual({
      [field]: 'jp.error.futureFact',
    });
    expect(form(invalid)).toContain('aria-describedby="' + field + '-error"');
    expect(decodeDraft(jp, encodeDraft(jp, invalid))).toBeUndefined();

    const editable = { ...invalid, completed: false };
    expect(jp.restoreStoredDraft!(invalid)).toEqual(editable);
    expect(jp.decodeDraft(editable)).toEqual(editable);
    const oldResult = jp.run(invalid, 'en');
    expect(oldResult.columns).toEqual([]);
    expect(oldResult.shortCircuit?.message).toContain(
      'after the simulation date',
    );

    const actual = {
      ...planned,
      reentry: [
        { route, departureOn: simulationDate, newLandingOn: simulationDate },
      ],
    };
    expect(jp.validateStep(actual)).toEqual({});
    expect(decodeDraft(jp, encodeDraft(jp, actual))).toEqual(actual);
  },
);

test('a departure explicitly recorded as completed must have occurred by the simulation date', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    step: 6,
    simulationDate: '2026-11-24',
    reentry: [
      { route: 'deemed', departureOn: '2026-11-26', alreadyDeparted: true },
    ],
  };
  expect(jp.validateStep(draft)).toEqual({
    'jp-travel-deemed-departureOn': 'jp.error.futureFact',
  });
  expect(
    jp.validateStep({
      ...draft,
      reentry: [{ ...draft.reentry[0], alreadyDeparted: false }],
    }),
  ).toEqual({});
});

test('a comparison can retain the original planned return only as a valid date', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-24',
    completed: true,
    stayStart: '2016-04-01',
    permanentResidence: { routes: [{ route: 'child' }], evidence: {} },
    trips: [{ departed: '2026-11-26', returned: '2026-11-27' }],
    reentry: [
      {
        route: 'deemed',
        departureOn: '2026-11-26',
        returnOn: '2026-11-28',
        comparisonHistoryReturnOn: '2026-11-27',
      },
    ],
  };
  expect(decodeDraft(jp, encodeDraft(jp, draft))).toEqual(draft);
  for (const invalid of ['2026-02-30', 27, null])
    expect(
      jp.decodeDraft({
        ...draft,
        reentry: [{ ...draft.reentry[0], comparisonHistoryReturnOn: invalid }],
      }),
    ).toBeUndefined();
});

test('dated facts use the simulation day across nested questionnaire fields', () => {
  const future = '2026-11-25';
  const draft: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-24',
    applicationDate: future,
    dateOfBirth: future,
    stayStart: future,
    trips: [
      {
        departed: future,
        returned: future,
        newLandingOn: future,
        stayExpiry: future,
        renewalDecisionOn: future,
      },
    ],
    permanentResidence: {
      routes: [
        {
          route: 'general',
          statusStart: future,
          newStatusStart: future,
          excluded: [{ from: future, to: future }],
        },
        { route: 'spouse', marriedLifeFrom: future },
        { route: 'child-birth', bornOn: future, birthRegisteredOn: future },
        { route: 'teijusha', statusStart: future },
        { route: 'refugee', statusStart: future },
        {
          route: 'hsp70',
          statusStart: future,
          recognisedOn: future,
          historical: { on: future },
          current: { on: future },
        },
        { route: 'j-skip', recognisedOn: future },
      ],
      evidence: {
        status: {
          kind: 'engineer',
          decisionOn: future,
          expiresOn: future,
          transitionPermitExpiresOn: future,
        },
        addressNotices: [{ eventOn: future, notifiedOn: future }],
        affiliationNotices: [{ eventOn: future, notifiedOn: future }],
        schoolChildren: [{ bornOn: future }],
        specialPermission: { kind: 'stay', grantedOn: future },
      },
    },
    naturalisation: {
      routes: [{ route: 'spouse', marriedOn: future }],
      evidence: {
        domicileFrom: future,
        residenceFrom: future,
        officialGazetteOn: future,
        familyRegistrationOn: future,
      },
    },
    reentry: [
      {
        route: 'ordinary',
        departureOn: future,
        returnOn: future,
        stayExpiresOn: future,
        newLandingOn: future,
        renewalDecisionOn: future,
        extensionFeeOn: future,
        permit: {
          effectiveOn: future,
          expiresOn: future,
          extendedUntil: future,
        },
      },
    ],
  };
  const futureFacts = [
    ['jp-dateOfBirth', 'jp-stayStart'],
    ['jp-trips-0-newLandingOn', 'jp-trips-0-renewalDecisionOn'],
    [
      'jp-pr-general-statusStart',
      'jp-pr-general-newStatusStart',
      'jp-pr-general-excluded-0-from',
      'jp-pr-general-excluded-0-to',
      'jp-pr-spouse-marriedLifeFrom',
      'jp-pr-child-birth-bornOn',
      'jp-pr-child-birth-birthRegisteredOn',
      'jp-pr-teijusha-statusStart',
      'jp-pr-refugee-statusStart',
      'jp-pr-hsp70-statusStart',
      'jp-pr-hsp70-recognisedOn',
      'jp-pr-j-skip-recognisedOn',
    ],
    [
      'jp-pr-status-decisionOn',
      'jp-pr-addressNotices-0-eventOn',
      'jp-pr-addressNotices-0-notifiedOn',
      'jp-pr-affiliationNotices-0-eventOn',
      'jp-pr-affiliationNotices-0-notifiedOn',
    ],
    ['jp-pr-schoolChildren-0-bornOn', 'jp-pr-specialPermission-grantedOn'],
    [
      'jp-nat-spouse-marriedOn',
      'jp-nat-domicileFrom',
      'jp-nat-residenceFrom',
      'jp-nat-officialGazetteOn',
      'jp-nat-familyRegistrationOn',
    ],
    ['jp-travel-ordinary-newLandingOn', 'jp-travel-ordinary-renewalDecisionOn'],
  ];

  for (const [step, fields] of futureFacts.entries()) {
    expect(jp.validateStep({ ...draft, step })).toEqual(
      Object.fromEntries(fields.map((field) => [field, 'jp.error.futureFact'])),
    );
    expect(jp.validateStep({ ...draft, step, simulationDate: future })).toEqual(
      {},
    );
  }
});

test('the general PR questionnaire sends the departure method and permit validity through to the stay calculation', () => {
  let draft = generalTripDraft();
  const answer = (field: string, value: string) => {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-trips-0-' + field)!({ target: { value } });
  };
  const assessed = () => jp.run(draft, 'en').columns[0].pathways[0];
  const missingMethod = form(draft);
  expect(missingMethod).toContain('Check your departure record');
  expect(missingMethod).toContain(
    'aria-describedby="jp-trips-0-departure-hint"',
  );
  expect(fields.has('jp-trips-0-reentryPermit')).toBe(false);
  expect(jp.validateStep(draft)).toEqual({});
  const missing = assessed();
  expect(missing.timeStatus).toBe('UNKNOWN');
  expect(missing.earliestDate).toBeUndefined();
  expect(missing.timeEarliestDate).toBeUndefined();
  answer('departure', 'none');
  expect(assessed().timeEarliestDate).toBe('2036-11-10');
  answer('departure', 'deemed');
  expect(assessed().timeStatus).toBe('MET');
  expect(form(draft)).not.toContain('Check your departure record');
  expect(fields.has('jp-trips-0-reentryPermit')).toBe(false);
  expect(fields.has('jp-trips-0-specialPermanentResident')).toBe(true);
  answer('specialPermanentResident', 'yes');
  expect(
    decodeDraft(jp, encodeDraft(jp, draft))?.trips[0].specialPermanentResident,
  ).toBe(true);
  answer('departure', 'permit');
  expect(draft.trips[0]).not.toHaveProperty('specialPermanentResident');
  form(draft);
  expect(fields.has('jp-trips-0-specialPermanentResident')).toBe(false);
  expect(assessed().timeStatus).toBe('UNKNOWN');
  expect(jp.validateStep(draft)).toEqual({});
  answer('reentryPermit', 'no');
  expect(draft.trips[0]).toMatchObject({
    departure: 'permit',
    reentryPermit: false,
  });
  const expired = assessed();
  expect(expired.status).toBe('NOT_MET');
  expect(expired.earliestDate).toBeUndefined();
  expect(expired.timeEarliestDate).toBe('2036-11-10');
  const natOnly = {
    ...draft,
    permanentResidence: { routes: [], evidence: {} },
    naturalisation: { routes: [{ route: 'general' as const }], evidence: {} },
  };
  form(draft);
  const prFields = [...fields.keys()];
  form(natOnly);
  expect([...fields.keys()]).toEqual(prFields);
  answer('reentryPermit', 'yes');
  expect(assessed().timeStatus).toBe('MET');
  answer('departure', '');
  expect(draft.trips[0]).not.toHaveProperty('reentryPermit');
  expect(assessed().timeStatus).toBe('UNKNOWN');
  const shared = decodeDraft(
    jp,
    encodeDraft(jp, { ...draft, completed: true }),
  );
  expect(shared?.trips).toEqual(draft.trips);
  expect(jp.run(shared!, 'en').columns[0].pathways[0].timeStatus).toBe(
    'UNKNOWN',
  );
});

test.each([true, false])(
  'a shared trip with no departure method and a stale permit answer (%s) still needs confirmation',
  (previousAnswer) => {
    const previous = generalTripDraft();
    previous.trips[0].reentryPermit = previousAnswer;
    previous.completed = true;
    let draft = decodeDraft(jp, encodeDraft(jp, previous))!;
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    expect(fields.has('jp-trips-0-reentryPermit')).toBe(false);
    const result = jp.run(draft, 'en').columns[0].pathways[0];
    expect(result.timeStatus).toBe('UNKNOWN');
    expect(result.earliestDate).toBeUndefined();
    fields.get('jp-trips-0-departure')!({ target: { value: 'permit' } });
    expect(draft.trips[0]).not.toHaveProperty('reentryPermit');
    form(draft);
    expect(fields.has('jp-trips-0-reentryPermit')).toBe(true);
  },
);

test.each([
  ['2026-11-24', '2027-04-26', '2027-04-19'],
  ['2027-04-26', '2027-04-18', '2027-04-19'],
])(
  'the declaration requires departure by both today (%s) and the simulation date (%s)',
  (today, simulationDate, departureOn) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(today + 'T12:00:00Z'));
    const draft: JapanDraft = {
      ...jp.createDraft(),
      simulationDate,
      step: 6,
      reentry: [
        { route: 'deemed', departureOn, declaredIntentAtDeparture: true },
      ],
    };
    expect(jp.validateStep(draft)).toHaveProperty(
      'jp-travel-deemed-declaredIntentAtDeparture',
    );
    for (const completed of [true, false])
      expect(
        decodeDraft(jp, encodeDraft(jp, { ...draft, completed })),
      ).toBeUndefined();
    const planned = {
      ...draft,
      reentry: [{ route: 'deemed' as const, departureOn }],
    };
    const html = form(planned);
    expect(html).toContain('Planned departure on ' + departureOn);
    expect(html).not.toContain(
      'id="jp-travel-deemed-declaredIntentAtDeparture"',
    );
    const route = jp.run(draft, 'en').columns[0].pathways[0];
    expect(route.summary).toContain('Planned departure on ' + departureOn);
    expect(
      route.checks.find((c) => c.id === 'jp.reentry.deemed-eligibility')
        ?.status,
    ).toBe('UNKNOWN');
  },
);

test.each([
  ['yes', true],
  ['no', false],
] as const)(
  'a %s answer confirmed for an actual departure survives sharing and changing a separate filing date',
  (answer, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-24T12:00:00Z'));
    let draft: JapanDraft = {
      ...jp.createDraft(),
      step: 6,
      completed: true,
      stayStart: '2013-01-01',
      permanentResidence: { routes: [{ route: 'child' }], evidence: {} },
      reentry: [
        {
          route: 'deemed',
          departureOn: '2026-11-24',
        },
      ],
    };
    const answerField = (field: string, value: string) => {
      form(draft, (patch) => {
        draft = { ...draft, ...patch };
      });
      fields.get('jp-travel-deemed-' + field)!({ target: { value } });
    };
    expect(form(draft)).not.toContain(
      'id="jp-travel-deemed-declaredIntentAtDeparture"',
    );
    answerField('alreadyDeparted', 'yes');
    answerField('declaredIntentAtDeparture', answer);
    const adjusted = jp.whatif.apply(draft, {
      ...jp.whatif.initial(draft),
      applicationDate: '2026-11-01',
    });
    expect(adjusted.reentry[0]).toMatchObject({
      declaredIntentAtDeparture: expected,
      declarationForDepartureOn: '2026-11-24',
    });
    expect(jp.restoreStoredDraft!(adjusted)).toEqual(adjusted);
    expect(jp.validateStep(adjusted)).toEqual({});
    expect(decodeDraft(jp, encodeDraft(jp, adjusted))?.reentry).toEqual(
      draft.reentry,
    );
    expect(form(adjusted)).toContain(
      'id="jp-travel-deemed-declaredIntentAtDeparture"',
    );
    answerField('departureOn', '2026-11-23');
    expect(draft.reentry[0]).toEqual({
      route: 'deemed',
      departureOn: '2026-11-23',
    });
    answerField('declaredIntentAtDeparture', answer);
    expect(decodeDraft(jp, encodeDraft(jp, draft))?.reentry[0]).toMatchObject({
      alreadyDeparted: true,
      declaredIntentAtDeparture: expected,
      declarationForDepartureOn: '2026-11-23',
    });
  },
);

test('a recorded return without a departure date uses historical departure wording', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-24',
    reentry: [{ route: 'deemed', returnOn: '2026-11-23' }],
  };
  const [travel] = jp.run(draft, 'en').columns[0].pathways;
  expect(
    travel.checks.find(({ id }) => id === 'jp.reentry.deemed-validity')?.explanation,
  ).toContain('were a special permanent resident at departure');
});

test('a same-day departure answer controls the shared PR summary and re-entry details', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-24T12:00:00Z'));
  const departure = '2026-11-24';
  const returned = '2026-11-25';
  let draft: JapanDraft = {
    ...generalTripDraft(),
    completed: true,
    step: 6,
    simulationDate: departure,
    trips: [{ departed: departure, returned, departure: 'deemed' }],
    reentry: [{ route: 'deemed', departureOn: departure, returnOn: returned }],
  };
  for (const alreadyDeparted of ['no', 'yes']) {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-travel-deemed-alreadyDeparted')!({
      target: { value: alreadyDeparted },
    });
    expect(jp.validateStep(draft)).toEqual({});
    const restored = decodeDraft(jp, encodeDraft(jp, draft))!;
    const sameDayReturn = {
      ...restored,
      trips: restored.trips.map((trip) => ({ ...trip, returned: departure })),
      reentry: restored.reentry.map((route) => ({
        ...route,
        returnOn: departure,
      })),
    };
    expect(
      jp.run(sameDayReturn, 'en').columns[0].pathways[0].summary,
    ).toContain(
      alreadyDeparted === 'no'
        ? 'You plan to return on 2026-11-24'
        : 'You returned on 2026-11-24',
    );
    for (const locale of ['en', 'zh-CN'] as const) {
      const [pr, travel] = jp.run(restored, locale).columns[0].pathways;
      const planned = alreadyDeparted === 'no';
      expect(pr.summary).toContain(
        locale === 'en'
          ? planned
            ? 'You plan to leave under deemed re-entry'
            : 'You left under deemed re-entry'
          : planned
            ? '计划于 2026-11-24 使用みなし再入国许可出境'
            : '于 2026-11-24 使用みなし再入国许可出境',
      );
      expect(pr.summary).toContain(
        locale === 'en'
          ? 'You plan to return on 2026-11-25'
          : '计划于 2026-11-25 返日',
      );
      expect(travel.summary).toContain(
        locale === 'en'
          ? planned
            ? 'Planned departure on 2026-11-24'
            : 'when you departed on 2026-11-24'
          : planned
            ? '拟于 2026-11-24 出境'
            : '于 2026-11-24 实际出境时',
      );
      const detail = travel.checks.find(
        ({ id }) => id === 'jp.reentry.deemed-validity',
      )!.explanation;
      expect(detail).toContain(
        locale === 'en'
          ? planned
            ? 'will be a special permanent resident'
            : 'were a special permanent resident'
          : planned
            ? '核对计划出境时的身份'
            : '核对出境时的身份',
      );
    }
  }
});

test.each([
  ['2026-09-30', 'old-guideline-absences'],
  ['2027-04-02', 'total-absence'],
])(
  'absence counts through %s identify a trip that has not yet happened',
  (simulationDate, rule) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T12:00:00Z'));
    const departed = '2026-08-10';
    const returned = '2026-08-12';
    const draft: JapanDraft = {
      ...generalTripDraft(),
      simulationDate,
      dateOfBirth: '1990-01-01',
      stayStart: '2010-04-01',
      naturalisation: { routes: [{ route: 'general' }], evidence: {} },
      trips: [{ departed, returned, departure: 'permit', reentryPermit: true }],
      reentry: [
        {
          route: 'deemed',
          departureOn: departed,
          alreadyDeparted: false,
          returnOn: returned,
        },
      ],
    };
    const [pr, nat] = jp.run(draft, 'en').columns[0].pathways;
    expect(
      pr.checks.find(({ id }) => id === 'jp.pr.' + rule)?.explanation,
    ).toContain('Projected through ' + simulationDate);
    if (rule === 'old-guideline-absences')
      expect(pr.summary).toContain('would have 1 trip abroad');
    expect(nat.summary).toContain('would have 1 trip abroad');
  },
);

test('a same-day plan drops the actual declaration from the form, share and assessment', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-24T12:00:00Z'));
  let draft: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-26',
    step: 6,
    completed: true,
    reentry: [
      {
        route: 'deemed',
        departureOn: '2026-11-24',
        returnOn: '2026-11-25',
        stayIndefinite: true,
        lawfulStatus: true,
        passportValid: true,
        residentCardOrCertificate: true,
        formalPermitRequired: false,
        permitVoided: false,
      },
    ],
  };
  function answer(name: string, value: string) {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get('jp-travel-deemed-' + name)!({ target: { value } });
  }
  const shared = () => decodeDraft(jp, encodeDraft(jp, draft))!;
  const continuity = (restored = shared()) =>
    jp
      .run(restored, 'en')
      .columns[0].pathways[0].checks.find(
        (c) => c.id === 'jp.reentry.return-continuity',
      )?.status;
  answer('alreadyDeparted', 'yes');
  answer('declaredIntentAtDeparture', 'yes');
  expect(continuity()).toBe('MET');
  const legacy = {
    ...draft,
    reentry: draft.reentry.map((route) => ({
      ...route,
      alreadyDeparted: undefined,
    })),
  };
  const legacyShare = encodeDraft(jp, legacy);
  const confirmedShare = encodeDraft(jp, draft);
  answer('alreadyDeparted', 'no');
  expect(form(shared())).toContain('Planned departure on 2026-11-24');
  expect(fields.has('jp-travel-deemed-declaredIntentAtDeparture')).toBe(false);
  expect(JSON.stringify(draft.reentry[0])).not.toContain(
    'declaredIntentAtDeparture',
  );
  expect(shared().reentry[0]).not.toHaveProperty('declaredIntentAtDeparture');
  expect(shared().reentry[0]).not.toHaveProperty('declarationForDepartureOn');
  expect(continuity()).toBe('UNKNOWN');
  for (const readDate of ['2026-11-24', '2026-11-25']) {
    vi.setSystemTime(new Date(readDate + 'T12:00:00Z'));
    expect(continuity(decodeDraft(jp, confirmedShare)!)).toBe('MET');
    for (const restored of [
      jp.restoreStoredDraft!(legacy),
      decodeDraft(jp, legacyShare)!,
    ]) {
      expect(restored.reentry[0].departureOn).toBe('2026-11-24');
      expect(JSON.stringify(restored.reentry[0])).not.toContain(
        'declaredIntentAtDeparture',
      );
      expect(continuity(restored)).toBe('UNKNOWN');
    }
  }
});

test('a travel-only questionnaire goes straight to route details and restores older trip-history drafts there', () => {
  const draft: JapanDraft = {
    ...jp.createDraft(),
    reentry: [{ route: 'ordinary' }],
  };
  expect(jp.validateStep(draft)).toEqual({});
  expect(form(draft)).not.toContain('id="jp-stayStart"');
  expect(japanSteps(draft).map(({ step }) => step)).toEqual([0, 6]);
  expect(jp.decodeDraft({ ...draft, step: 1 })).toEqual({ ...draft, step: 6 });
  draft.naturalisation.routes.push({ route: 'general', homeMajorityAge: 18 });
  expect(jp.validateStep(draft)).toHaveProperty('jp-stayStart');
  expect(form(draft)).toContain('id="jp-stayStart"');
  expect(japanSteps(draft).map(({ step }) => step)).toEqual([0, 1, 5, 6]);
});

test('deselecting residence gives the same shared and compared return assessment as a fresh ordinary permit questionnaire', () => {
  const ordinary: JapanDraft['reentry'][number] = {
    route: 'ordinary',
    departureOn: '2026-11-26',
    returnOn: '2026-11-27',
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
      effectiveOn: '2026-11-24',
      expiresOn: '2027-11-24',
      extensionApproved: false,
    },
  };
  const fresh: JapanDraft = {
    ...jp.createDraft(),
    simulationDate: '2026-11-24',
    completed: true,
    step: 6,
    reentry: [ordinary],
  };
  const selected: JapanDraft = {
    ...fresh,
    stayStart: '2010-05-10',
    trips: [
      {
        departed: ordinary.departureOn!,
        returned: ordinary.returnOn!,
        departure: 'none',
        renewalDecisionOn: '2026-11-20',
      },
    ],
    permanentResidence: {
      routes: [
        {
          route: 'general',
          statusStart: '2011-05-10',
          newStatusStart: '2011-05-10',
        },
      ],
      evidence: { applicantAnnualIncomeYen: 5456789 },
    },
  };
  const path = (draft: JapanDraft) =>
    jp
      .run(draft, 'en')
      .columns[0].pathways.find((p) => p.id === 'jp.reentry.ordinary')!;
  const continuity = (draft: JapanDraft) =>
    path(draft).checks.find((c) => c.id === 'jp.reentry.return-continuity')
      ?.status;
  expect(continuity(selected)).toBe('NOT_MET');

  let switched: JapanDraft = {
    ...selected,
    permanentResidence: { ...selected.permanentResidence, routes: [] },
  };
  expect(japanSteps(switched).map(({ step }) => step)).toEqual([0, 6]);
  const html = form(switched, (patch) => {
    switched = { ...switched, ...patch };
  });
  expect(html).toMatch(
    /id="jp-travel-ordinary-renewalDecisionOn"[^>]*value=""/,
  );
  fields.get('jp-travel-ordinary-intendsReturn')!({ target: { value: 'yes' } });
  expect(switched.trips).toEqual(selected.trips);
  expect(switched.reentry).toEqual(fresh.reentry);
  const encoded = encodeDraft(jp, switched);
  const payload = JSON.parse(
    atob(encoded.replaceAll('-', '+').replaceAll('_', '/')),
  );
  expect(payload.draft).toEqual(fresh);
  const shared = decodeDraft(jp, encoded)!;
  const older = encodeDraft({ ...jp, activeAnswers: undefined }, switched);
  expect(decodeDraft(jp, older)).toEqual(fresh);
  const actual = path(shared);
  expect(continuity(shared)).toBe('MET');
  expect(actual.earliestDate).toBeUndefined();
  expect(actual.travelDate).toBeNull();
  expect(actual).toEqual(path(fresh));
  expect(path(switched)).toEqual(actual);
  const knobs = {
    ...jp.whatif.initial(switched),
    returns: { ordinary: '2026-11-28' },
  };
  expect(knobs.prIncome).toBeUndefined();
  const compared = jp.whatif.apply(switched, knobs);
  expect(jp.whatif.validate(compared, knobs)).toEqual({});
  expect(decodeDraft(jp, encodeDraft(jp, compared))).toEqual({
    ...fresh,
    reentry: [{ ...ordinary, returnOn: '2026-11-28' }],
  });
  expect(path(compared)).toEqual(path(jp.whatif.apply(fresh, knobs)));
});

test('shared trip history remains visible to either residence family and inactive family evidence stays local', () => {
  const both = generalTripDraft();
  both.permanentResidence.evidence = { householdIncomeConfirmed: true };
  both.naturalisation = {
    routes: [{ route: 'general', homeMajorityAge: 18 }],
    evidence: { livelihoodConfirmed: true },
  };
  for (const group of ['permanentResidence', 'naturalisation'] as const) {
    const one = { ...both, [group]: { ...both[group], routes: [] } };
    const restored = decodeDraft(jp, encodeDraft(jp, one))!;
    expect(restored[group].evidence).toEqual({});
    expect(restored.trips).toEqual(both.trips);
    expect(restored.stayStart).toBe(both.stayStart);
    expect(jp.decodeDraft(one)?.[group].evidence).toEqual(both[group].evidence);
  }
});

test('the empty-selection error describes the focusable group containing all three route families', () => {
  const draft = jp.createDraft();
  expect(jp.validateStep(draft)).toEqual({ 'jp-routes': 'jp.form.routeError' });
  const html = form(draft);
  expect(html).toMatch(
    /<fieldset id="jp-routes"[^>]*tabindex="-1"[^>]*aria-invalid="true"[^>]*aria-describedby="jp-routes-error"[^>]*>.*id="jp-routes-error".*id="jp-route-pr-general".*id="jp-route-nat-general".*id="jp-route-travel-ordinary".*<\/fieldset>/s,
  );
  const selected = { ...draft, reentry: [{ route: 'deemed' as const }] };
  const corrected = form(selected, undefined, jp.validateStep(draft));
  expect(corrected).not.toContain('jp-routes-error');
  expect(corrected).not.toContain('aria-invalid="true"');
});

test.each([
  ['history', 'travel', 'UNKNOWN'],
  ['history', 'history', 'UNKNOWN'],
  ['travel', 'travel', 'NOT_MET'],
  ['travel', 'history', 'MET'],
] as const)(
  'an expiry entered in %s follows its source when %s changes itinerary',
  (source, changed, validity) => {
    let draft = generalTripDraft();
    draft.simulationDate = '2026-11-24';
    draft.completed = true;
    const expiry = '2026-11-25';
    draft.trips = [
      {
        departed: '2026-11-20',
        returned: '2026-11-24',
        departure: 'deemed',
        ...(source === 'history' && { stayExpiry: expiry }),
      },
    ];
    draft.reentry = [
      {
        route: 'deemed',
        departureOn: '2026-11-20',
        returnOn: '2026-11-23',
        specialPermanentResident: false,
        timelyRenewalPending: false,
        ...(source === 'travel' && { stayExpiresOn: expiry }),
      },
    ];
    function edit(step: number, id: string, value: string) {
      draft.step = step;
      form(draft, (patch) => {
        draft = { ...draft, ...patch };
      });
      fields.get(id)!({ target: { value } });
    }
    function term(answers: JapanDraft) {
      return jp
        .run(answers, 'en')
        .columns[0].pathways.find((path) => path.id === 'jp.reentry.deemed')!
        .checks.find((check) => check.id === 'jp.reentry.deemed-validity')!
        .status;
    }
    function checkStored(answers: JapanDraft) {
      expect(answers.trips[0].stayExpiry).toBe(
        source === 'history' ? expiry : undefined,
      );
      expect(answers.reentry[0].stayExpiresOn).toBe(
        source === 'travel' ? expiry : undefined,
      );
    }
    edit(6, 'jp-travel-deemed-returnOn', '2026-11-24');
    edit(6, 'jp-travel-deemed-passportValid', 'yes');
    edit(1, 'jp-trips-0-departure', 'deemed');
    const linked = decodeDraft(jp, encodeDraft(jp, draft))!;
    checkStored(linked);
    expect(term(linked)).toBe('MET');
    const compared = jp.whatif.apply(linked, {
      ...jp.whatif.initial(linked),
      returns: { deemed: '2026-11-28' },
    });
    const savedComparison = decodeDraft(jp, encodeDraft(jp, compared))!;
    checkStored(savedComparison);
    expect(term(savedComparison)).toBe('NOT_MET');
    if (changed === 'travel') {
      draft = savedComparison;
      edit(6, 'jp-travel-deemed-departureOn', '2026-11-26');
    } else {
      edit(1, 'jp-trips-0-returned', '2026-11-23');
    }
    const detached = decodeDraft(jp, encodeDraft(jp, draft))!;
    checkStored(detached);
    expect(term(detached)).toBe(validity);
  },
);

test('correcting a borrowed expiry only keeps independent entries of the new value after detaching', () => {
  let draft = generalTripDraft();
  const trip = draft.trips[0];
  trip.stayExpiry = '2026-11-25';
  const dates = { departureOn: trip.departed, returnOn: trip.returned };
  draft.reentry = [
    { route: 'deemed', ...dates },
    {
      route: 'ordinary',
      ...dates,
      returnOn: '2026-11-15',
      stayExpiresOn: '2026-11-30',
    },
  ];
  draft.step = 6;
  const edit = (id: string, value: string) => {
    form(draft, (patch) => {
      draft = { ...draft, ...patch };
    });
    fields.get(id)!({ target: { value } });
  };
  const inherited = 'jp-travel-deemed-stayExpiresOn';
  expect(form(draft)).toMatch(
    new RegExp('id="' + inherited + '"[^>]*value="2026-11-25"'),
  );
  edit(inherited, '2026-11-30');
  draft = decodeDraft(jp, encodeDraft(jp, draft))!;
  expect(draft.trips[0].stayExpiry).toBeUndefined();
  expect(form({ ...draft, step: 1 })).toMatch(
    /id="jp-trips-0-stayExpiry"[^>]*value="2026-11-30"/,
  );
  edit('jp-travel-deemed-returnOn', '2026-11-11');
  expect(form({ ...draft, step: 1 })).toMatch(
    /id="jp-trips-0-stayExpiry"[^>]*value=""/,
  );

  edit(inherited, '2026-11-27');
  edit('jp-travel-ordinary-returnOn', dates.returnOn);
  edit('jp-travel-deemed-returnOn', dates.returnOn);
  edit(inherited, '2026-11-30');
  edit('jp-travel-deemed-returnOn', '2026-11-11');
  const detached = decodeDraft(jp, encodeDraft(jp, draft))!;
  expect(detached.trips[0].stayExpiry).toBeUndefined();
  expect(detached.reentry.map((route) => route.stayExpiresOn)).toEqual([
    '2026-11-30',
    '2026-11-30',
  ]);
});
