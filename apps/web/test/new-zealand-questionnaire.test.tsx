import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import NewZealandSimulatePage from '../app/new-zealand/simulate/page';
import { t, type TranslationKey } from '../i18n';
import {
  nzStepDefinitions,
  nzSteps,
  type NzDraft,
} from '../lib/new-zealand-draft';
import { newZealandModule as nz } from '../lib/new-zealand-module';
import { decodeDraft, encodeDraft } from '../lib/share';

// Components read the locale through useTranslation; a plain function lets the
// tests call them outside React and invoke their handlers.
vi.mock('../i18n/locale', async (original) => {
  const actual = await original<typeof import('../i18n/locale')>();
  const { t } = await import('../i18n');
  return {
    ...actual,
    useTranslation: () => ({
      locale: 'zh-CN',
      setLocale: () => {},
      t: (key: TranslationKey) => t(key),
    }),
  };
});

interface Host {
  type: string;
  props: Record<string, unknown>;
  children: Host[];
  text: string;
}
type Handler = (event: unknown) => void;

function expand(node: ReactNode): Host[] {
  if (node === null || node === undefined || typeof node === 'boolean')
    return [];
  if (typeof node === 'string' || typeof node === 'number')
    return [{ type: '#text', props: {}, children: [], text: String(node) }];
  if (Array.isArray(node)) return node.flatMap(expand);
  if (!isValidElement(node)) return [];
  const { type, props } = node as ReactElement<
    Record<string, unknown> & { children?: ReactNode }
  >;
  if (typeof type === 'function')
    return expand((type as (props: object) => ReactNode)(props));
  if (typeof type !== 'string') return expand(props.children);
  const children = expand(props.children);
  return [
    { type, props, children, text: children.map((c) => c.text).join('') },
  ];
}
const flat = (nodes: Host[]): Host[] =>
  nodes.flatMap((node) => [node, ...flat(node.children)]);

const stepIndex = (key: string) =>
  nzStepDefinitions.findIndex((item) => item.key === key);

// One questionnaire step with its elements and the patches it sends.
function form(draft: NzDraft, key: string, errors = {}) {
  const updates: Partial<NzDraft>[] = [];
  const nodes = flat(
    expand(
      NewZealandSimulatePage().props.children({
        draft: { ...draft, step: stepIndex(key) },
        errors,
        update: (patch: Partial<NzDraft>) => updates.push(patch),
      }),
    ),
  );
  const byId = (id: string) => nodes.find((node) => node.props.id === id);
  return {
    nodes,
    updates,
    byId,
    ids: nodes.map((node) => node.props.id).filter(Boolean),
    change: (id: string, value: string) =>
      (byId(id)!.props.onChange as Handler)({ target: { value } }),
    click: (text: string, within?: string) =>
      (
        flat(within ? [byId(within)!] : nodes).find(
          (node) => node.type === 'button' && node.text === text,
        )!.props.onClick as Handler
      )({}),
  };
}

const citizenship = {
  fullCapacity: true,
  character: 'clear',
  foreignPoliceEvidence: 'not-requested',
  understandsResponsibilities: true,
  english: 'evidenced',
  residenceIntent: 'nz-or-realm',
  identityDocumentsAndWitness: true,
  oath: 'willing',
  presenceException: 'none',
  feeCategory: 'standard',
} as const;
const prv = {
  role: 'principal',
  conditions: 'none',
  deportationLiability: 'none',
  furtherPoliceEvidence: 'not-requested',
  otherCommitments: [] as never[],
} as const;

// A resident since 2020 who has not answered the trip question.
function residentDraft(goals: NzDraft['goals']): NzDraft {
  return {
    version: 1,
    step: 0,
    completed: true,
    simulationDate: '2026-11-23',
    goals,
    answers: {
      dateOfBirth: '1990-01-01',
      firstArrival: '2020-01-01',
      residentVisa: { granted: '2020-01-01', category: 'general' },
      resident: {
        travel: { currentlyInNz: true, restrictedEntry: false },
        prv,
        citizenship,
      },
      common: {
        requiredFeePaid: true,
        identityDocuments: true,
        character: 'clear',
        dependants: [],
        residenceFiling: {
          currentVisa: 'other-eligible-temporary-or-resident',
          statutoryBar: 'none',
          atImmigrationControlArea: false,
          hasOmittedRelationshipVisaDependant: false,
        },
      },
    },
  };
}

const pathways = (draft: NzDraft) => nz.run(draft, 'zh-CN').columns[0].pathways;
const withAnswers = (draft: NzDraft, answers: object): NzDraft => ({
  ...draft,
  answers: { ...draft.answers, ...answers },
});

test('a new draft leaves the trips unanswered, so no date follows from a skipped trip question', () => {
  const fresh = nz.createDraft();
  expect(fresh.answers).toEqual({});
  const history = form({ ...fresh, goals: ['prv'] }, 'history');
  expect(
    history.nodes.some((n) => n.text === t('nz.form.emptyConfirmed')),
  ).toBe(false);
  history.click(t('nz.form.noRecords'));
  expect(history.updates[0].answers?.trips).toEqual([]);

  const skipped = pathways(residentDraft(['travel', 'prv', 'citizenship']));
  for (const path of skipped) {
    expect(path.status, path.id).toBe('UNKNOWN');
    expect(path.earliestDate, path.id).toBeUndefined();
  }
  // Confirming no trips is still an answer that can give a date.
  const confirmed = pathways(
    withAnswers(residentDraft(['prv', 'citizenship']), { trips: [] }),
  );
  expect(confirmed.map((path) => path.status)).toEqual(['MET', 'MET']);
});

test('clearing an English method drops its hidden answers so the group can be left blank', () => {
  const draft = residentDraft(['smc', 'parent']);
  const english = form(
    withAnswers(draft, {
      common: { english: { method: 'test', test: 'ielts', score: 7 } },
    }),
    'english',
  );
  // The top-level English group explains that it can be left blank.
  expect(english.nodes.some((n) => n.text === t('nz.form.optionalGroup'))).toBe(
    true,
  );
  english.change('nz-common-english-method', '');
  const cleared = {
    ...draft,
    ...english.updates[0],
    step: stepIndex('english'),
  };
  expect(cleared.answers.common?.english ?? {}).toEqual({});
  expect(nz.validateStep(cleared)).toEqual({});

  const parent = form(
    withAnswers(draft, {
      family: {
        parent: {
          applicantEnglish: { method: 'test', type: 'ielts', overall: 5 },
        },
      },
    }),
    'parent',
  );
  parent.change('nz-family-parent-applicantEnglish-method', '');
  const parentCleared = {
    ...draft,
    ...parent.updates[0],
    step: stepIndex('parent'),
  };
  expect(parentCleared.answers.family?.parent).not.toHaveProperty(
    'applicantEnglish',
  );
  expect(nz.validateStep(parentCleared)).toEqual({});

  const family = form(
    withAnswers(draft, {
      common: {
        ...draft.answers.common,
        dependants: [{ english: { method: 'test', test: 'ielts', score: 6 } }],
      },
    }),
    'family',
  );
  family.change('nz-common-dependants-0-english-method', '');
  expect(family.updates[0].answers?.common?.dependants).toEqual([{}]);

  // Answers left hidden by an older draft do not block the step either.
  expect(
    nz.validateStep({
      ...withAnswers(draft, {
        common: { english: { test: 'ielts', score: 7 } },
      }),
      step: stepIndex('english'),
    }),
  ).toEqual({});
});

test('the PRV base commitment can confirm that no family members are included', () => {
  const draft = withAnswers(residentDraft(['prv']), {
    travelConditionsEnd: '2027-01-01',
    trips: [{ departed: '2025-01-01', returned: '2025-09-01' }],
  });
  const base = (days?: number[]) =>
    withAnswers(draft, {
      resident: {
        ...draft.answers.resident,
        prv: {
          ...prv,
          otherCommitments: ['base'],
          qualifyingEmploymentMonthsInTwoYears: 9,
          ...(days && { includedFamilyDaysInTwoYears: days }),
        },
      },
    });
  const id = 'nz-resident-prv-includedFamilyDaysInTwoYears';
  const unanswered = form(base(), 'prv');
  unanswered.click(t('nz.form.noRecords'), id);
  const none = {
    ...base(),
    ...unanswered.updates[0],
    step: stepIndex('prv'),
  };
  expect(none.answers.resident?.prv?.includedFamilyDaysInTwoYears).toEqual([]);
  expect(nz.validateStep(none)).toEqual({});

  const confirmed = form(none, 'prv');
  expect(
    flat([confirmed.byId(id)!]).some(
      (n) => n.text === t('nz.form.emptyConfirmed'),
    ),
  ).toBe(true);
  confirmed.click(t('nz.form.resetRecords'), id);
  expect(confirmed.updates[0].answers?.resident?.prv).not.toHaveProperty(
    'includedFamilyDaysInTwoYears',
  );

  expect(pathways(none)[0]).toMatchObject({ id: 'NZ-PRV', status: 'MET' });
  expect(pathways(base())[0]).toMatchObject({
    id: 'NZ-PRV',
    status: 'UNKNOWN',
  });
  // Yearly lists cannot be confirmed empty: an empty year list proves nothing.
  const sponsors = form(
    withAnswers(draft, { family: { parent: { sponsors: [{}] } } }),
    'parent',
  );
  expect(
    flat([sponsors.byId('nz-family-parent-sponsors-0-nzDaysInEachPriorYear')!])
      .filter((n) => n.type === 'button')
      .map((n) => n.text),
  ).toEqual([`${t('nz.form.addValue')} · ${t('nz.f.nzDaysInEachPriorYear')}`]);
});

test('answers that contradict an earlier step are flagged on the later question', () => {
  const draft = residentDraft(['prv', 'religious']);
  const filing = (residenceFiling: object, prvAnswers = {}) =>
    nz.validateStep({
      ...withAnswers(draft, {
        resident: {
          ...draft.answers.resident,
          prv: { ...prv, ...prvAnswers },
        },
        common: {
          ...draft.answers.common,
          residenceFiling: {
            ...draft.answers.common!.residenceFiling,
            ...residenceFiling,
          },
        },
      }),
      step: stepIndex('filing'),
    });
  expect(filing({ filingFromOverseas: false })).toEqual({});
  expect(filing({ filingFromOverseas: true })).toEqual({
    'nz-common-residenceFiling-filingFromOverseas': 'nz.error.overseasConflict',
  });
  expect(filing({}, { deportationLiability: 'liable' })).toEqual({
    'nz-common-residenceFiling-statutoryBar': 'nz.error.deportationConflict',
  });
  expect(
    filing(
      { statutoryBar: 'liable-for-deportation' },
      { deportationLiability: 'none' },
    ),
  ).toEqual({
    'nz-common-residenceFiling-statutoryBar': 'nz.error.deportationConflict',
  });
  expect(
    filing(
      { statutoryBar: 'liable-for-deportation' },
      { deportationLiability: 'liable' },
    ),
  ).toEqual({});

  const religious = (inNz: boolean) =>
    nz.validateStep({
      ...withAnswers(draft, { family: { religious: { inNz } } }),
      step: stepIndex('religious'),
    });
  expect(religious(true)).toEqual({});
  expect(religious(false)).toEqual({
    'nz-family-religious-inNz': 'nz.error.inNzConflict',
  });
  // Hidden steps are not compared.
  expect(
    nz.validateStep({
      ...withAnswers(draft, {
        family: { religious: { inNz: false } },
      }),
      goals: ['religious'],
      step: stepIndex('religious'),
    }),
  ).toEqual({});
  const shared = withAnswers(draft, { family: { religious: { inNz: false } } });
  expect(nz.decodeDraft(shared)).toBeUndefined();
});

test('a required income list cannot be empty, including in a shared link', () => {
  const draft = withAnswers(residentDraft(['parent']), {
    family: {
      parent: {
        incomePeriods: [{ from: '2025-01-01', irdIncomePerSponsor: [] }],
      },
    },
  });
  expect(nz.validateStep({ ...draft, step: stepIndex('parent') })).toEqual({
    'nz-family-parent-incomePeriods-0-irdIncomePerSponsor': 'nz.form.required',
  });
  expect(decodeDraft(nz, encodeDraft(nz, draft))).toBeUndefined();
});

test('required value lists are marked, list help is announced and invalid lists are flagged', () => {
  const draft = withAnswers(residentDraft(['parent', 'prv']), {
    trips: [],
    family: { parent: { incomePeriods: [{ from: '2025-01-01' }] } },
  });
  const id = 'nz-family-parent-incomePeriods-0-irdIncomePerSponsor';
  const parent = form(draft, 'parent', { [id]: 'nz.form.required' });
  const fieldset = parent.byId(id)!;
  expect(fieldset.props['aria-invalid']).toBe(true);
  expect(fieldset.children.find((n) => n.type === 'legend')?.text).toBe(
    `${t('nz.f.irdIncomePerSponsor')} *`,
  );
  const history = form(draft, 'history');
  const trips = history.nodes.find(
    (n) =>
      n.type === 'fieldset' &&
      n.children.some((child) => child.props.id === 'nz-trips-hint'),
  );
  expect(trips?.props['aria-describedby']).toBe('nz-trips-hint');
});

test('citizenship alone skips residence filing, health and family questions it does not use', () => {
  const steps = (goals: NzDraft['goals']) =>
    nzSteps({ goals }).map(({ step }) => nzStepDefinitions[step].key);
  expect(steps(['citizenship'])).toEqual([
    'basics',
    'history',
    'travel',
    'prv',
    'citizenship',
    'filing',
  ]);
  expect(steps(['citizenship', 'prv'])).toContain('family');
  const draft = withAnswers(residentDraft(['citizenship']), {
    trips: [{ departed: '2026-05-01', returned: '2026-10-15' }],
  });
  const filing = form(draft, 'filing');
  expect(filing.ids).toContain('nz-common-requiredFeePaid');
  for (const hidden of [
    'nz-common-residenceFiling-currentVisa',
    'nz-common-residenceFiling-filingFromOverseas',
    'nz-common-identityDocuments',
    'nz-common-levyBasis',
  ])
    expect(filing.ids).not.toContain(hidden);
  expect(form({ ...draft, goals: ['prv'] }, 'filing').ids).toContain(
    'nz-common-residenceFiling-currentVisa',
  );

  const active = nz.activeAnswers!(draft).answers.common;
  expect(active).toEqual({ requiredFeePaid: true });
  // The hidden answers cannot change the citizenship result.
  const other = withAnswers(draft, {
    common: {
      ...draft.answers.common,
      character: 'statutory-bar',
      dependants: [{ relation: 'partner' }],
      residenceFiling: {
        filingFromOverseas: true,
        statutoryBar: 'section-150',
      },
    },
  });
  expect(pathways(other)).toEqual(pathways(draft));
});

test('the principal is asked only English questions read for the principal', () => {
  const draft = withAnswers(residentDraft(['smc']), {
    common: { dependants: [{}] },
  });
  const english = form(draft, 'english');
  expect(english.ids).toContain('nz-common-testSpecificallyRequested');
  for (const id of ['religiousEnglishBackground', 'registeredForSmc', 'esol'])
    expect(english.ids).not.toContain(`nz-common-${id}`);
  const family = form(draft, 'family');
  for (const id of ['religiousEnglishBackground', 'registeredForSmc', 'esol'])
    expect(family.ids).toContain(`nz-common-dependants-0-${id}`);

  // A principal cannot replace English evidence with prepaid ESOL.
  const options = (key: string, id: string, answers: object) =>
    form(
      withAnswers(residentDraft(['investor', 'religious', 'parent']), answers),
      key,
    )
      .byId(id)!
      .children.map((n) => n.props.value);
  expect(
    options(
      'investor',
      'nz-family-investment-business-principalEnglish-method',
      {
        family: { investment: { route: 'business' } },
      },
    ),
  ).not.toContain('esol-paid');
  expect(
    options('religious', 'nz-family-religious-principalEnglish-method', {}),
  ).not.toContain('esol-paid');
  expect(
    options('parent', 'nz-family-parent-applicantEnglish-method', {}),
  ).toContain('esol-paid');
});

test('occupation codes are saved without surrounding spaces', () => {
  const job = form(residentDraft(['smc']), 'job');
  job.change('nz-skilled-job-occupationCode', ' 261313 ');
  expect(job.updates[0].answers?.skilled?.job?.occupationCode).toBe('261313');
});
