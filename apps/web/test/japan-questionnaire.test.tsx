import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { prEvidence } from '../../../packages/engine/test/japan-pr-fixture';
import JapanSimulatePage from '../app/japan/simulate/page';
import { LocaleContext } from '../i18n/locale';
import { japanSteps, type JapanDraft } from '../lib/japan-draft';
import { japanModule as jp } from '../lib/japan-module';
import { decodeDraft, encodeDraft } from '../lib/share';

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
