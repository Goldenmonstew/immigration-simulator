import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import AustraliaSimulatePage from '../app/australia/simulate/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import {
  activeAustraliaAnswers,
  australiaSteps,
  type AustraliaDraft,
} from '../lib/australia-draft';
import { australiaModule as au } from '../lib/australia-module';
import { decodeDraft, encodeDraft } from '../lib/share';

// Capture each rendered control's change handler by its id.
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

function form(
  draft: AustraliaDraft,
  update: (patch: Partial<AustraliaDraft>) => void = () => {},
  errors = {},
) {
  fields.clear();
  return renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      {AustraliaSimulatePage().props.children({ draft, errors, update })}
    </LocaleContext>,
  );
}

function editField(draft: AustraliaDraft, id: string, value: string) {
  let next = draft;
  form(draft, (patch) => {
    next = { ...draft, ...patch };
  });
  const change = fields.get(id);
  if (!change) throw new Error(`No field ${id}`);
  change({ target: { value } });
  return next;
}

const status = (draft: AustraliaDraft, pathway: string, id: string) =>
  au
    .run(draft, 'zh-CN')
    .columns[0].pathways.find((p) => p.id === pathway)
    ?.checks.find((c) => c.id === id)?.status;

test('a new draft leaves the travel history unanswered instead of confirming no trips', () => {
  const fresh = au.createDraft();
  expect(fresh.trips).toBeUndefined();
  const html = form(fresh);
  expect(html).not.toContain(t('au.form.emptyConfirmed'));

  // review93-1 #1: the same timeline is UNKNOWN until no trips are confirmed.
  const draft: AustraliaDraft = {
    ...fresh,
    completed: true,
    simulationDate: '2026-11-23',
    pathway: 'AU-CITIZENSHIP',
    dateOfBirth: '1990-01-01',
    firstArrival: '2020-01-01',
    visas: [
      { subclass: '482', from: '2020-01-01', to: '2025-11-22' },
      { subclass: '189', from: '2025-11-23' },
    ],
  };
  for (const id of ['AU-CIT-time-absences', 'AU-CIT-time-recent-absences'])
    expect(status(draft, 'AU-CITIZENSHIP', id)).toBe('UNKNOWN');
  for (const id of ['AU-CIT-time-absences', 'AU-CIT-time-recent-absences'])
    expect(status({ ...draft, trips: [] }, 'AU-CITIZENSHIP', id)).toBe('MET');
});

test('the questionnaire edits and clears invitations and the combined partner application in the engine structure', () => {
  let draft: AustraliaDraft = {
    ...au.createDraft(),
    step: 3,
    skills: {
      invitations: {
        'AU-190': { issued: '2026-11-15', deadline: '2027-01-13', score: 65 },
      },
      occupationInInvitation: { 'AU-190': true },
    },
    partnerApplication: { lodged: '2024-11-01', stream: 'onshore' },
  };
  draft = editField(draft, 'au-skills-invitations-AU-190', 'awaiting');
  expect(draft.skills).toEqual({
    invitations: { 'AU-190': 'awaiting' },
    occupationInInvitation: { 'AU-190': true },
  });
  expect(form(draft)).toMatch(/<option value="awaiting" selected="">/);
  draft = editField(draft, 'au-skills-invitations-AU-190', '');
  draft = editField(draft, 'au-skills-occupationInInvitation-AU-190', '');
  expect(draft.skills).toBeUndefined();
  expect(activeAustraliaAnswers(draft).skills).toBeUndefined();

  draft = { ...draft, step: 5 };
  draft = editField(draft, 'au-partnerApplication-lodged', '2025-05-01');
  expect(draft.partnerApplication).toEqual({
    lodged: '2025-05-01',
    stream: 'onshore',
  });
  expect(form(draft)).toContain('value="2025-05-01"');
  draft = editField(draft, 'au-partnerApplication-lodged', '');
  draft = editField(draft, 'au-partnerApplication-stream', '');
  expect(draft.partnerApplication).toBeUndefined();
  expect(activeAustraliaAnswers(draft).partnerApplication).toBeUndefined();
});

test('component scores are stored as the engine tuple without rewriting the draft during rendering', () => {
  let draft: AustraliaDraft = {
    ...au.createDraft(),
    step: 1,
    english: Object.freeze({
      test: Object.freeze({
        name: 'ielts',
        components: Object.freeze([7, 7, 7, 7]),
      }),
    }) as AustraliaDraft['english'],
  };
  expect(() => form(draft)).not.toThrow();
  draft = editField(draft, 'au-english-test-components-1', '6.5');
  expect(draft.english).toEqual({
    test: { name: 'ielts', components: [7, 6.5, 7, 7] },
  });

  draft = {
    ...draft,
    english: { test: { name: 'ielts' } },
  };
  draft = editField(draft, 'au-english-test-components-0', '7');
  expect(draft.english?.test).toEqual({
    name: 'ielts',
    components: [7, null, null, null],
  });
  expect(au.validateStep(draft)).toEqual({
    'au-english-test-components': 'au.form.scoresError',
  });
  expect(au.decodeDraft(draft)).toEqual(draft);
});

test('partly answered groups must be completed instead of being dropped or filled with confirmations', () => {
  const base: AustraliaDraft = { ...au.createDraft(), step: 6 };
  const integrity = {
    identityEstablished: true,
    accurateDocuments: true,
    lastIdentityRefusal: '2024-01-01',
  };
  const partial = {
    ...base,
    publicInterest: { integrity },
  } as unknown as AustraliaDraft;
  expect(au.validateStep(partial)).toEqual({
    'au-publicInterest-integrity-lastDocumentRefusal': 'au.form.required',
  });
  // Nothing fills in a missing refusal date as a confirmed "no refusal".
  const falseDocuments = {
    ...base,
    publicInterest: {
      integrity: { identityEstablished: true, accurateDocuments: false },
    },
  } as unknown as AustraliaDraft;
  expect(activeAustraliaAnswers(falseDocuments).publicInterest).toEqual(
    falseDocuments.publicInterest,
  );
  expect(au.validateStep(falseDocuments)).toEqual({
    'au-publicInterest-integrity-lastIdentityRefusal': 'au.form.required',
    'au-publicInterest-integrity-lastDocumentRefusal': 'au.form.required',
  });

  // A completed answer keeps its failure: an identity refusal within 10 years.
  const complete: AustraliaDraft = {
    ...base,
    completed: true,
    simulationDate: '2026-11-23',
    pathway: 'AU-189-HK',
    publicInterest: {
      integrity: { ...integrity, lastDocumentRefusal: null },
    },
  };
  expect(au.validateStep(complete)).toEqual({});
  expect(status(complete, 'AU-189-HK', 'AU-PIC-INTEGRITY')).toBe('NOT_MET');

  expect(
    au.validateStep({
      ...base,
      citizenship: {
        test: { correct: 10 },
        lastPrisonSentence: { firstFreeDay: '2020-01-01' },
      },
    } as unknown as AustraliaDraft),
  ).toEqual({
    'au-citizenship-test-valuesCorrect': 'au.form.required',
    'au-citizenship-lastPrisonSentence-months': 'au.form.required',
  });
  expect(
    au.validateStep({
      ...base,
      step: 5,
      partnerApplication: { lodged: '2025-03-10' },
    } as unknown as AustraliaDraft),
  ).toEqual({ 'au-partnerApplication-stream': 'au.form.required' });
});

test('answers on steps hidden by the selected pathway are neither assessed nor shared', () => {
  const draft: AustraliaDraft = {
    ...au.createDraft(),
    completed: true,
    simulationDate: '2026-11-23',
    pathway: 'AU-CITIZENSHIP',
    partnerApplication: { lodged: '2025-03-10', stream: 'onshore' },
    partner: { noFurtherStay: 'barred' },
    skills: { occupationList: 'MLTSSL' },
  };
  const shared = decodeDraft(au, encodeDraft(au, draft));
  expect(shared).toBeDefined();
  expect(shared).not.toHaveProperty('partnerApplication');
  expect(shared).not.toHaveProperty('partner');
  expect(shared).not.toHaveProperty('skills');
  expect(activeAustraliaAnswers({ ...draft, pathway: undefined })).toEqual({
    ...draft,
    pathway: undefined,
  });
});

test('an unfinished draft with a temporary date reversal, cleared subclass or partial year is restored', () => {
  const unfinished: AustraliaDraft = {
    ...au.createDraft(),
    dateOfBirth: '2030-01-01',
    firstArrival: '2020-01-01',
    visas: [{ from: '2025-01-01', to: '2024-01-01' } as never],
    trips: [{ departed: '2025-03-01', returned: '2025-02-01' }],
    regional: { assessmentYears: [2, null] as never },
    employer: {
      nominations: {
        'AU-186-DE': { lodged: '2026-07-10', approved: '2026-07-01' },
      },
    },
  };
  expect(au.decodeDraft(unfinished)).toEqual(unfinished);
  expect(Object.keys(au.validateStep(unfinished)).sort()).toEqual([
    'au-dateOfBirth',
    'au-firstArrival',
    'au-trips-0-returned',
    'au-visas-0-subclass',
    'au-visas-0-to',
  ]);
  expect(au.validateStep({ ...unfinished, step: 4 })).toEqual({
    'au-regional-assessmentYears-0': 'au.form.yearError',
    'au-regional-assessmentYears-1': 'au.form.yearError',
  });
  // A completed result still has to pass every visible step.
  expect(au.decodeDraft({ ...unfinished, completed: true })).toBeUndefined();
});

test('each income year row keeps a blank entry and announces its own error', () => {
  let draft: AustraliaDraft = {
    ...au.createDraft(),
    step: 4,
    regional: { assessmentYears: [2024, 2025] },
  };
  draft = editField(draft, 'au-regional-assessmentYears-1', '');
  expect(draft.regional?.assessmentYears).toEqual([2024, null]);
  const html = form(
    { ...draft, regional: { assessmentYears: [2024, 1800] } },
    () => {},
    au.validateStep({ ...draft, regional: { assessmentYears: [2024, 1800] } }),
  );
  expect(html).toContain(
    'id="au-regional-assessmentYears-1" type="number" min="1900" max="2100" step="1" aria-invalid="true" aria-describedby="au-regional-assessmentYears-1-error"',
  );
  expect(html).toContain(`<p id="au-regional-assessmentYears-1-error" class="`);
  expect(html).not.toContain('au-regional-assessmentYears-0-error');
});

test('confirmation checkboxes sit with their date in a named group and optional groups explain the asterisks', () => {
  const html = form({ ...au.createDraft(), step: 6 });
  for (const name of [
    'confinementEnded',
    'mostRecentCessation',
    'lastIdentityRefusal',
    'lastDocumentRefusal',
    'removedOn',
  ] as const) {
    const label = t(`au.field.${name}`);
    const group = new RegExp(
      `<fieldset[^>]*><legend>${label.replace(/[()（）]/g, '.')}( \\*)?</legend>(?:(?!</fieldset>).)*type="checkbox"`,
    );
    expect(html, name).toMatch(group);
  }
  expect(html).toContain(t('au.form.optionalGroup'));
  expect(
    form({ ...au.createDraft(), step: 1, english: { education: {} } }),
  ).toContain(t('au.field.allPrimaryInEnglish'));
});

test('the 189 Hong Kong stream skips the regional step, and step 1 keeps its fields in a section', () => {
  const fresh = au.createDraft();
  expect(
    australiaSteps({ ...fresh, pathway: 'AU-189-HK' }).map((s) => s.step),
  ).toEqual([0, 1, 6]);
  expect(
    australiaSteps({ ...fresh, pathway: 'AU-191-HK' }).map((s) => s.step),
  ).toEqual([0, 1, 4, 6]);
  expect(form(fresh)).toMatch(/^<p[^>]*>[^<]*<\/p><section/);
});
