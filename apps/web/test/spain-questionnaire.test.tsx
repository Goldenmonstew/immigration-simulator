import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, test, vi } from 'vitest';
import SpainSimulatePage from '../app/spain/simulate/page';
import { LocaleContext } from '../i18n/locale';
import { readPageResult } from '../lib/page-result';
import { encodeDraft } from '../lib/share';
import type { SpainDraft } from '../lib/spain-draft';
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
