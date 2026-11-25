import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, test, vi } from 'vitest';
import { ES_FULL_TARGETS } from '@uk-immigration/engine';
import SpainSimulatePage from '../app/spain/simulate/page';
import { LocaleContext } from '../i18n/locale';
import { readPageResult } from '../lib/page-result';
import { encodeDraft } from '../lib/share';
import { activeSpainAnswers, type SpainDraft } from '../lib/spain-draft';
import { spainModule as es } from '../lib/spain-module';

type Change = (name: string, value: unknown) => void;
const changes = new Map<string, Change>();
vi.mock('../app/spain/simulate/evidence-fields', async (original) => {
  const actual =
    await original<typeof import('../app/spain/simulate/evidence-fields')>();
  return {
    ...actual,
    EvidenceFields: (props: Parameters<typeof actual.EvidenceFields>[0]) => {
      for (const field of props.fields)
        changes.set(`${props.prefix}-${field.name}`, props.change);
      return <actual.EvidenceFields {...props} />;
    },
  };
});
beforeEach(() => changes.clear());

function form(
  draft: SpainDraft,
  update: (patch: Partial<SpainDraft>) => void = () => {},
  errors = es.validateStep(draft),
) {
  changes.clear();
  return renderToStaticMarkup(
    <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
      {SpainSimulatePage().props.children({ draft, errors, update })}
    </LocaleContext>,
  );
}

// Apply a page change the way QuestionnaireShell merges its patch.
function answer(draft: SpainDraft, id: string, value: unknown) {
  let next = draft;
  form(draft, (patch) => {
    next = { ...draft, ...patch, completed: false };
  });
  const name = id.slice(id.lastIndexOf('-') + 1);
  changes.get(id)!(name, value);
  return next;
}

const history = (): SpainDraft => ({
  ...es.createDraft(),
  step: 1,
  simulationDate: '2026-11-24',
  targets: ['N', 'L'],
  timeRecordsComplete: true,
  permits: [{ from: '2020-01-01', study: false }],
  trips: [],
});

test('step 1 and 2 answers can return to unconfirmed and the last record can be removed', () => {
  let draft = history();
  draft = answer(draft, 'es-timeRecordsComplete', undefined);
  expect(draft.timeRecordsComplete).toBeUndefined();
  // Removing the only permit, then marking the empty trip list unconfirmed.
  draft = answer(draft, 'es-permits', undefined);
  expect(draft.permits).toBeUndefined();
  draft = answer(draft, 'es-trips', undefined);
  expect(draft.trips).toBeUndefined();
  expect(JSON.parse(JSON.stringify(draft))).not.toHaveProperty('permits');

  draft = {
    ...draft,
    step: 2,
    route: 'marriage',
    marriedToSpaniard: '2024-05-01',
  };
  draft = answer(draft, 'es-nat-marriedToSpaniard', undefined);
  expect(draft.marriedToSpaniard).toBeUndefined();
  draft = answer(draft, 'es-nat-route', undefined);
  expect(draft.route).toBeUndefined();
  expect(es.validateStep(draft)).toEqual({});
});

test('a permit left unconfirmed as study or not is required before results', () => {
  const draft = { ...history(), permits: [{ from: '2020-01-01' }] };
  expect(es.validateStep(draft)).toEqual({
    'es-permits-0-study': 'es.form.required',
  });
  const html = form(draft);
  expect(html).toMatch(
    /<select id="es-permits-0-study"[^>]*required=""[^>]*><option value=""[^>]*>Choose one<\/option>/,
  );
  expect(
    es.validateStep({
      ...draft,
      permits: [{ from: '2020-01-01', study: false }],
    }),
  ).toEqual({});
  // A completed draft without the answer reopens at the history step.
  const completed = { ...draft, step: 5, completed: true };
  expect(es.decodeDraft(completed)).toBeUndefined();
  expect(es.decodeDraft(completed, 'show-correction')).toMatchObject({
    completed: false,
    step: 1,
  });
  // Legacy forms always answered the study checkbox.
  expect(
    es.decodeDraft({
      simulationDate: '2026-11-21',
      permits: [{ from: '2020-03-15', to: '' }],
      trips: [],
      route: 'general',
    })?.permits,
  ).toEqual([{ from: '2020-03-15', study: false }]);
});

test('a blank office holiday row survives reload and is flagged on its own input', () => {
  const draft: SpainDraft = {
    ...es.createDraft(),
    step: 3,
    simulationDate: '2026-11-24',
    targets: ['L'],
    residence: { officeHolidays: ['2026-01-06', ''] },
  };
  expect(es.decodeDraft(draft)).toEqual(draft);
  const errors = es.validateStep(draft);
  expect(errors).toEqual({ 'es-res-officeHolidays-1': 'es.error.date' });
  const html = form(draft, () => {}, errors);
  expect(html).toContain('<details open=""');
  expect(html).toMatch(
    /<input id="es-res-officeHolidays-1" aria-invalid="true" aria-describedby="es-res-officeHolidays-1-error"/,
  );
  expect(html).toMatch(
    /<input id="es-res-officeHolidays-0"(?![^>]*aria-invalid)/,
  );
  expect(html.match(/id="es-res-officeHolidays-1-error"/g)).toHaveLength(1);
  expect(html.match(/Enter a valid date/g)).toHaveLength(1);
});

test('schooling dates without a confirmed child list are assessed as unconfirmed', () => {
  const draft: SpainDraft = {
    ...es.createDraft(),
    step: 3,
    completed: true,
    simulationDate: '2026-11-24',
    targets: ['L'],
    timeRecordsComplete: true,
    permits: [{ from: '2017-01-01', study: false }],
    trips: [],
    residence: {
      nationalAlternatives: [],
      // The page can save the dates before the child list is answered.
      schooling: {
        noticeDate: '2026-10-01',
        cureDeadline: '2026-11-02',
      } as NonNullable<SpainDraft['residence']['schooling']>,
    },
  };
  expect(es.validateStep(draft)).toEqual({});
  const lt = es.run(draft, 'en').columns[0].pathways[0];
  expect(lt.checks.find((check) => check.id === 'ES-L13')?.status).toBe(
    'UNKNOWN',
  );
  const shared = readPageResult(es, 'en', encodeDraft(es, draft));
  expect(shared.result?.columns[0].pathways[0].id).toBe('ES-LONG-TERM');
});

test('answers left in a deselected route do not discard the saved draft', () => {
  const draft: SpainDraft = {
    ...history(),
    targets: ['L'],
    nationality: { birthDate: '1990-13-45', ccse: { correct: 30 } },
    freeMovement: { history: [{ from: 'soon' } as never] },
  };
  expect(es.decodeDraft(draft)).toEqual(draft);
  // The routes still selected keep their format check.
  expect(es.decodeDraft({ ...draft, targets: ['L', 'N'] })).toBeUndefined();
});

test('CCSE scores and paired dates are checked before results', () => {
  const draft: SpainDraft = {
    ...history(),
    step: 2,
    nationality: {
      ccse: { correct: 26, issued: '2026-06-01', validThrough: '2026-05-01' },
    },
  };
  expect(es.validateStep(draft)).toEqual({
    'es-nat-ccse-correct': 'es.form.ccseCorrectError',
    'es-nat-ccse-validThrough': 'es.error.order',
  });
  expect(
    es.validateStep({
      ...draft,
      nationality: { ccse: { correct: 25, issued: '2026-06-01' } },
    }),
  ).toEqual({});
  expect(
    es.validateStep({
      ...draft,
      step: 3,
      targets: ['E', 'L'],
      residence: {
        schooling: {
          children: [],
          noticeDate: '2026-10-01',
          cureDeadline: '2026-09-01',
        },
        blueMobility: { firstCardFrom: '2024-01-01', moveDate: '2023-06-01' },
      },
    }),
  ).toEqual({
    'es-res-schooling-cureDeadline': 'es.error.order',
    'es-res-blueMobility-moveDate': 'es.error.order',
  });
});

test('a legacy form with an unknown citizenship category is not imported as general', () => {
  const legacy = {
    simulationDate: '2026-11-21',
    permits: [],
    trips: [],
    route: 'made-up',
  };
  expect(es.decodeDraft(legacy)).toBeUndefined();
  expect(es.decodeDraft({ ...legacy, route: 'ibero' })?.route).toBe('ibero');
});

test('record completeness and a notarial suspension after grant must be answered', () => {
  const draft = { ...history(), timeRecordsComplete: undefined };
  expect(es.validateStep(draft)).toEqual({
    'es-timeRecordsComplete': 'es.form.required',
  });
  expect(form(draft)).toContain(
    '<label for="es-timeRecordsComplete">Residence permit and travel records are complete *</label>',
  );

  const granted: SpainDraft = {
    ...history(),
    step: 2,
    nationality: { grantNotifiedOn: '2026-06-01' },
  };
  expect(es.validateStep(granted)).toEqual({
    'es-nat-notarialSuspensionAwaitingConfirmation': 'es.form.required',
  });
  expect(form(granted)).toMatch(
    /<label for="es-nat-notarialSuspensionAwaitingConfirmation">[^<]* \*<\/label>/,
  );
  expect(
    es.validateStep({
      ...granted,
      nationality: {
        grantNotifiedOn: '2026-06-01',
        notarialSuspensionAwaitingConfirmation: false,
      },
    }),
  ).toEqual({});
  // Before a grant, the question stays optional.
  expect(es.validateStep({ ...granted, nationality: {} })).toEqual({});
});

test('labels shared across questions read correctly in each place', () => {
  const row = {} as never;
  const draft: SpainDraft = {
    ...history(),
    targets: [...ES_FULL_TARGETS],
    residence: {
      periods: [row],
      tripDetails: [row],
      resources: { income: [row] },
    },
  };
  const step = (n: number, locale: 'zh-CN' | 'en' = 'en') =>
    renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        {SpainSimulatePage().props.children({
          draft: { ...draft, step: n },
          errors: {},
          update: () => {},
        })}
      </LocaleContext>,
    );
  const option = (html: string, id: string, value: string) =>
    html.match(
      new RegExp(`<select id="${id}"[^]*?<option value="${value}">([^<]*)<`),
    )?.[1];
  const label = (html: string, id: string) =>
    html.match(new RegExp(`<label for="${id}">([^<]*)<`))?.[1];

  const free = step(6);
  expect(label(free, 'es-fm-relationship')).toBe(
    'Family relationship with the EU or Spanish sponsor (U02/U03)',
  );
  expect(option(free, 'es-fm-relationship', 'ascendant')).toBe(
    'Dependent direct ascendant',
  );
  expect(free).toContain('work accident or occupational disease');

  const residence = step(3);
  expect(label(residence, 'es-res-insurance-kind')).toBe('Health cover type');
  expect(residence).toContain('Income type');
  expect(residence).toContain('Permit or stay category');
  expect(residence).toContain('Ordinary absence (no exception claimed)');
  expect(residence).not.toContain('or ordinary absence');
  expect(residence).toContain('Retirement (Spanish contributory pension)');

  const nationality = step(2);
  expect(nationality).toContain('Exam centre outside Spain');
  expect(nationality).toContain('Other country (not exempt)');
  expect(step(4)).toContain('Employer type');
  expect(step(4)).toContain('Relationship category');
  expect(step(6)).toContain('Retirement (early free-movement acquisition)');
  expect(step(3, 'zh-CN')).not.toContain('散星');
  // The Spanish-born continuity question names no period in either language.
  for (const locale of ['zh-CN', 'en'] as const)
    expect(
      label(step(3, locale), 'es-res-birthRouteContinuityAccepted'),
    ).not.toMatch(/\d/);
});

test('each route only shows and keeps the questions its assessment reads', () => {
  const html = (draft: SpainDraft) => form(draft, () => {}, {});
  const residence: SpainDraft['residence'] = {
    nationalAlternatives: [],
    periods: [{ from: '2017-01-01', territory: 'spain', kind: 'residence' }],
    tripDetails: [],
  };
  const national = {
    ...history(),
    step: 3,
    targets: ['L'] as const,
    residence,
  };
  const l = html({ ...national, targets: ['L'] });
  expect(l).toContain('id="es-res-nationalAlternatives"');
  expect(l).toContain('Absence reasons and continuity exceptions');
  expect(l).not.toContain('es-res-periods');
  expect(l).toContain('Confirmed: ordinary residence period only');
  expect(activeSpainAnswers({ ...national, targets: ['L'] }).residence).toEqual(
    {
      nationalAlternatives: [],
      tripDetails: [],
    },
  );
  const e = html({ ...national, targets: ['E'] });
  expect(e).not.toContain('id="es-res-nationalAlternatives"');
  expect(e).toContain('es-res-periods');
  expect(activeSpainAnswers({ ...national, targets: ['E'] }).residence).toEqual(
    {
      periods: residence.periods,
      tripDetails: [],
    },
  );

  const mobility = { ...history(), step: 4 };
  const holder = html({ ...mobility, targets: ['M'] });
  expect(holder).toContain(
    'id="es-mob-holder-grant-registeredSocialSecurityOn"',
  );
  expect(holder).not.toContain('es-mob-holder-grant-permitEnd');
  expect(holder).not.toContain('es-mob-holder-grant-cardCategory');
  const family = html({ ...mobility, targets: ['F'] });
  expect(family).toContain('id="es-mob-family-grant-cardCategory"');
  expect(family).not.toContain(
    'es-mob-family-grant-registeredSocialSecurityOn',
  );

  // Free-movement history does not use Spanish residence permits.
  const free = { ...history(), targets: ['U'] as SpainDraft['targets'] };
  expect(html(free)).not.toContain('Spanish residence permits');
  expect(activeSpainAnswers(free).permits).toBeUndefined();
  expect(
    es.validateStep({ ...free, permits: [{ from: 'x' } as never] }),
  ).toEqual({});
});
