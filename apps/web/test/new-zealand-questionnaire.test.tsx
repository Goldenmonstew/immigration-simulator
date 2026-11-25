import {
  evaluateNewZealandFull,
  type NzFullRequest,
} from '@uk-immigration/engine';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import NewZealandSimulatePage from '../app/new-zealand/simulate/page';
import { NzWhatIfControls } from '../app/new-zealand/whatif/controls';
import { ResultView } from '../components/result-view';
import { t, type TranslationKey } from '../i18n';
import {
  nzGoalGroups,
  nzGoals,
  nzStepDefinitions,
  nzSteps,
  type NzDraft,
} from '../lib/new-zealand-draft';
import type { NzField } from '../lib/new-zealand-fields';
import { newZealandModule as nz } from '../lib/new-zealand-module';
import { newZealandPolicy } from '../lib/new-zealand-policy';
import { gapRules } from '../lib/gap-summary';
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

const createBlank = (): NzDraft => ({
  version: 1,
  step: 0,
  completed: false,
  simulationDate: '2026-11-23',
  goals: nzGoals,
  answers: {},
});

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

type Key = string | number;
const getIn = (root: unknown, keys: Key[]) =>
  keys.reduce<unknown>(
    (value, key) => (value as Record<Key, unknown> | undefined)?.[key],
    root,
  );
function setIn(root: unknown, keys: Key[], value: unknown): unknown {
  if (!keys.length) return value;
  const [key, ...rest] = keys;
  if (typeof key === 'number') return [setIn(undefined, rest, value)];
  const record = (root ?? {}) as Record<string, unknown>;
  return { ...record, [key]: setIn(record[key], rest, value) };
}

test('removing the last row of a list leaves it unanswered, so the outcome stays to be confirmed', () => {
  const statuses = (draft: NzDraft) =>
    pathways(draft).map((path) => [path.status, path.earliestDate]);
  const step = (draft: NzDraft, key: string) => ({
    ...draft,
    step: stepIndex(key),
  });
  const removeLabel = (label: string) =>
    `${t('nz.form.remove')} · ${t(`nz.f.${label}` as TranslationKey)} 1`;
  const addLabel = (label: string) =>
    `${t('nz.form.add')} · ${t(`nz.f.${label}` as TranslationKey)}`;

  // Trips: a resident who adds a trip and then removes it has not answered.
  const resident = residentDraft(['prv', 'citizenship']);
  expect(statuses(resident)).toEqual([
    ['UNKNOWN', undefined],
    ['UNKNOWN', undefined],
  ]);
  const added = form(resident, 'history');
  added.click(addLabel('trips'));
  const withTrip = { ...resident, ...added.updates[0] };
  expect(withTrip.answers.trips).toEqual([{}]);
  const removed = form(withTrip, 'history');
  removed.click(removeLabel('trips'));
  const tripless = step({ ...resident, ...removed.updates[0] }, 'history');
  expect(tripless.answers).not.toHaveProperty('trips');
  expect(
    form(tripless, 'history').nodes.some(
      (n) => n.text === t('nz.form.emptyConfirmed'),
    ),
  ).toBe(false);
  expect(statuses(tripless)).toEqual(statuses(resident));

  // Dependants: adding one and removing it leaves the family unanswered.
  const common = { ...resident.answers.common };
  delete common.dependants;
  const family = withAnswers(residentDraft(['prv']), { trips: [], common });
  expect(statuses(family)).toEqual([['UNKNOWN', undefined]]);
  const addedDependant = form(family, 'family');
  addedDependant.click(addLabel('dependants'));
  const withDependant = { ...family, ...addedDependant.updates[0] };
  const removedDependant = form(withDependant, 'family');
  removedDependant.click(removeLabel('dependants'));
  const noDependant = { ...family, ...removedDependant.updates[0] };
  expect(noDependant.answers.common).not.toHaveProperty('dependants');
  expect(statuses(noDependant)).toEqual([['UNKNOWN', undefined]]);
  // Only the button records that there are none.
  const confirm = form(noDependant, 'family');
  confirm.click(t('nz.form.noRecords'));
  const none = { ...family, ...confirm.updates[0] };
  expect(none.answers.common?.dependants).toEqual([]);
  expect(statuses(none)).toEqual([['MET', '2026-11-23']]);

  // Every list and value list, nested ones included, behaves the same way.
  const lists: { key: string; keys: Key[]; field: NzField }[] = [];
  const walk = (key: string, fields: NzField[], keys: Key[]) => {
    for (const field of fields) {
      if (field.type === 'list' || field.type === 'numbers')
        lists.push({ key, keys: [...keys, field.name], field });
      if (field.type === 'group')
        walk(key, field.fields, [...keys, field.name]);
      if (field.type === 'list')
        walk(key, field.fields, [...keys, field.name, 0]);
    }
  };
  for (const { key, sections } of nzStepDefinitions)
    for (const section of sections) walk(key, section.fields, section.path);
  const checked: string[] = [];
  for (const { key, keys, field } of lists) {
    const row = field.type === 'list' ? {} : null;
    const draft: NzDraft = {
      ...createBlank(),
      // The business investor questions show once that route is chosen.
      answers: setIn({ family: { investment: { route: 'business' } } }, keys, [
        row,
      ]) as NzDraft['answers'],
    };
    const page = form(draft, key);
    const id = ['nz', ...keys].join('-');
    const text =
      field.type === 'list'
        ? removeLabel(field.label)
        : `${t('nz.form.remove')} · ${t('nz.form.value').replace('{n}', '1')}`;
    const scope = field.type === 'list' ? page.nodes : flat([page.byId(id)!]);
    const button = scope.find((n) => n.type === 'button' && n.text === text);
    (button!.props.onClick as Handler)({});
    const answers = page.updates[0].answers;
    expect(getIn(answers, keys), id).toBeUndefined();
    checked.push(id);
  }
  expect(checked).toEqual(
    expect.arrayContaining([
      'nz-trips',
      'nz-common-dependants',
      'nz-common-dependants-0-prvApplication-trips',
      'nz-common-convictions',
      'nz-common-residenceFiling-dependentChildrenUnlawfullyInNz',
      'nz-common-evidence-police',
      'nz-family-parent-sponsors',
      'nz-family-parent-incomePeriods',
      'nz-resident-prv-includedFamilyDaysInTwoYears',
      'nz-family-investment-business-experience',
    ]),
  );
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

test('comparison controls follow the pay conditions, model IELTS for an OET result and need a valid return date', () => {
  for (const id of [
    'NZ-P4-3',
    'NZ-P4-4',
    'NZ-P4-5',
    'NZ-P5-2',
    'NZ-P6-1',
    'NZ-P6-2',
  ])
    expect(nz.whatif.focusForRule(id, 'NZ-SMC'), id).toBe('pay');
  expect(nz.whatif.focusForRule('NZ-P4-2', 'NZ-SMC')).toBeUndefined();

  const oet = withAnswers(residentDraft(['smc']), {
    trips: [],
    common: {
      ...residentDraft(['smc']).answers.common,
      english: {
        method: 'test',
        test: 'oet',
        grades: ['C', 'C', 'C', 'C'],
        date: '2026-01-01',
        inPerson: true,
      },
    },
  });
  const initial = nz.whatif.initial(oet);
  expect(initial.englishScore).toBeUndefined();
  expect(nz.whatif.apply(oet, initial).answers).toEqual(oet.answers);
  const scored = nz.whatif.apply(oet, { ...initial, englishScore: 8 });
  expect(scored.answers.common?.english).toEqual({
    method: 'test',
    test: 'ielts',
    inPerson: true,
    date: '2026-11-23',
    score: 8,
  });
  const c3 = (draft: NzDraft) =>
    pathways(draft)[0].checks.find((check) => check.id === 'NZ-C3')?.status;
  expect([c3(oet), c3(scored)]).toEqual(['NOT_MET', 'MET']);

  const trips = withAnswers(residentDraft(['citizenship']), {
    trips: [{ departed: '2026-05-01', returned: '2026-10-15' }],
  });
  const knobs = nz.whatif.initial(trips);
  const lastReturn = (value?: string) => {
    const changed = { ...knobs, lastReturn: value };
    return nz.whatif.validate(nz.whatif.apply(trips, changed), changed);
  };
  expect(lastReturn(undefined)).toEqual({ lastReturn: 'nz.error.date' });
  expect(lastReturn('2026-02-30')).toEqual({ lastReturn: 'nz.error.date' });
  expect(lastReturn('2026-04-01')).toEqual({ lastReturn: 'nz.error.order' });
  expect(lastReturn('2026-10-01')).toEqual({});
  // Assuming no trips leaves no return date to check.
  expect(
    nz.whatif.validate(trips, {
      ...knobs,
      noTrips: true,
      lastReturn: undefined,
    }),
  ).toEqual({});

  // Partly typed numbers have no value yet.
  const updates: object[] = [];
  const controls = flat(
    expand(
      <NzWhatIfControls
        afterDraft={residentDraft(['smc'])}
        knobs={nz.whatif.initial(residentDraft(['smc']))}
        errors={{}}
        update={(patch) => updates.push(patch)}
      />,
    ),
  );
  const pay = controls.find((n) => n.props.id === 'nz-whatif-pay')!;
  (pay.props.onChange as Handler)({
    target: { value: '1e', valueAsNumber: Number.NaN },
  });
  (pay.props.onChange as Handler)({
    target: { value: '42.5', valueAsNumber: 42.5 },
  });
  expect(updates).toEqual([{ hourlyPay: undefined }, { hourlyPay: 42.5 }]);
});

test('pathways a held PRV replaces show no date', () => {
  const held = withAnswers(residentDraft(['travel', 'prv']), {
    trips: [],
    permanentResidentVisa: '2022-02-01',
  });
  const result = nz.run(held, 'zh-CN');
  for (const path of result.columns[0].pathways)
    expect(path).toMatchObject({ status: 'NOT_APPLICABLE', travelDate: null });
  const html = renderToStaticMarkup(
    <ResultView country={nz} result={result} draft={held} />,
  );
  expect(html).not.toContain(t('nz.result.earliest'));
  expect(html).not.toContain(t('result.earliest'));
});

test('fees, the levy, after-approval steps, notes and the longer travel ground are labelled apart and left out of the gaps', () => {
  const budget = [
    'NZ-P1-FEE',
    'NZ-P2-7',
    'NZ-P3-7-FEE',
    'NZ-P4-FEE',
    'NZ-P5-4',
    'NZ-P6-3',
    'NZ-P7-FEE',
    'NZ-P8-5',
    'NZ-P9-4',
    'NZ-P10-2',
    'NZ-C6-LEVY',
  ];
  const expected: Record<string, string> = {
    ...Object.fromEntries(budget.map((id) => [id, 'budget'])),
    'NZ-P3-7-OATH': 'afterApproval',
    'NZ-P9-2': 'afterApproval',
    'NZ-P9-HOME': 'information',
    // Only a direct PRV application reads the five-year criteria.
    'NZ-P7-4': 'information',
    // Being in New Zealand or a longer provision: one is enough (RV3.1).
    'NZ-P1-3': 'alternative',
    'NZ-P1-1': 'time',
    'NZ-P2-1': 'time',
    'NZ-P2-2': 'time',
    'NZ-P3-1-PRESENCE': 'time',
  };
  const all = residentDraft([
    'travel',
    'prv',
    'citizenship',
    'smc',
    'green',
    'sector',
    'partner',
    'parent',
    'investor',
    'religious',
  ]);
  const every = withAnswers(all, {
    trips: [],
    resident: { ...all.answers.resident, travel: { action: 'variation' } },
    family: { investment: { route: 'active' } },
  });
  const result = nz.run(every, 'zh-CN');
  const paths = result.columns[0].pathways;
  const checks = paths.flatMap((path) => path.checks);
  expect(
    Object.keys(expected).filter(
      (id) => !checks.some((check) => check.id === id),
    ),
  ).toEqual([]);
  for (const check of checks)
    expect(check.kind, check.id).toBe(expected[check.id] ?? 'requirement');
  for (const path of paths) {
    // Every condition is shown on its pathway with its group.
    expect(path.decidedBy, path.id).toBeUndefined();
    for (const gap of gapRules(path))
      expect(['requirement', 'time'], gap.id).toContain(gap.kind);
  }
  const citizenship = paths.find((path) => path.id === 'NZ-CITIZENSHIP')!;
  const unpaid = {
    ...citizenship,
    checks: citizenship.checks.map((check) => ({
      ...check,
      status: 'UNKNOWN' as const,
    })),
  };
  const gaps = gapRules(unpaid).map((check) => check.id);
  expect(gaps).toContain('NZ-P3-1-PRESENCE');
  for (const id of ['NZ-P3-7-FEE', 'NZ-P3-7-OATH'])
    expect(gaps).not.toContain(id);

  const html = renderToStaticMarkup(
    <ResultView country={nz} result={result} draft={every} />,
  );
  expect(html).not.toContain(t('result.otherPathways'));
  for (const kind of [
    'budget',
    'afterApproval',
    'information',
    'alternative',
    'time',
    'requirement',
  ] as const)
    expect(html).toContain(`· ${t(`country.check.${kind}`)}`);

  // First entry, the travel period and the investor residence period.
  const timing = pathways(
    withAnswers(residentDraft(['travel', 'prv']), {
      trips: [],
      resident: {
        ...every.answers.resident,
        travel: { action: 'initial' },
        prv: { ...prv, category: 'migrant-investor' },
      },
    }),
  ).flatMap((path) => path.checks);
  for (const id of ['NZ-P1-1', 'NZ-P1-1-TRAVEL', 'NZ-P2-3'])
    expect(timing.find((check) => check.id === id)?.kind, id).toBe('time');

  // Business Investor: residence criteria follow the work visa, whose own
  // criteria are shown for reference at the residence stage.
  const stage = (s: 'work' | 'residence') =>
    pathways(
      withAnswers(residentDraft(['investor']), {
        family: { investment: { route: 'business', business: { stage: s } } },
      }),
    )[0].checks;
  const kinds = (s: 'work' | 'residence') =>
    Object.fromEntries(stage(s).map((check) => [check.id, check.kind]));
  expect(kinds('work')).toMatchObject({
    'NZ-P9-3-WORK': 'requirement',
    'NZ-P9-3': 'afterApproval',
    'NZ-P9-3-OPERATIONS': 'afterApproval',
    'NZ-P9-3-ENGLISH': 'afterApproval',
  });
  expect(kinds('residence')).toMatchObject({
    'NZ-P9-3-WORK': 'information',
    'NZ-P9-3': 'requirement',
  });
});

test('the policy page lists the sources and pending details of every branch the results can show', () => {
  const rules = new Map(
    newZealandPolicy.rules['nz.current-law'].map((rule) => [rule.id, rule]),
  );
  const joint = residentDraft(['prv']).answers;
  const requests: NzFullRequest[] = [
    // Pre-reform SMC invitation, dairy-worker character exception, border filing.
    {
      simulationDate: '2026-11-23',
      resident: {
        travel: { action: 'subsequent', filipinoDairyExceptionClaimed: true },
      },
      skilled: { smc: { invitedOn: '2025-11-01' } },
      common: { residenceFiling: { atImmigrationControlArea: true } },
    },
    // A joint PRV whose common date cannot be confirmed.
    {
      ...joint,
      simulationDate: '2026-11-23',
      firstArrival: '2025-11-01',
      residentVisa: { granted: '2025-11-01', category: 'general' },
      trips: [],
      resident: {
        prv,
        travel: {
          currentlyInNz: true,
          restrictedEntry: false,
          firstEntryClass: 'standard',
        },
      },
      common: {
        ...joint.common,
        dependants: [
          {
            relation: 'child',
            dateOfBirth: '2012-01-01',
            relocationAuthority: 'right-evidenced',
            single: true,
            hasOwnChildren: false,
            financiallyDependent: true,
            identityDocuments: true,
            character: 'clear',
            prvApplication: {
              firstArrival: '2025-11-01',
              residentVisa: { granted: '2025-11-01', category: 'general' },
              trips: [],
              linkedToJointPrincipal: true,
              travel: { currentlyInNz: true, restrictedEntry: false },
              prv: { ...prv, role: 'linked' },
            },
          },
        ],
      },
    },
    { ...joint, trips: [], simulationDate: '2026-11-23' },
  ];
  const missing: string[] = [];
  for (const request of requests)
    for (const path of evaluateNewZealandFull(request).columns[0].pathways)
      for (const check of path.checks) {
        if (/^NZ-P2-(PARTNER|CHILD)-\d+$/.test(check.id)) continue;
        const rule = rules.get(check.id);
        for (const source of check.sources)
          if (
            !rule?.sources.some(
              (known) =>
                known.srcId === source.srcId &&
                known.locator === source.locator,
            ) ||
            !(source.srcId in newZealandPolicy.sourceUrls)
          )
            missing.push(`${check.id} ${source.srcId} ${source.locator}`);
        for (const pd of check.pendingDetails ?? [])
          if (!rule?.pendingDetails.includes(pd))
            missing.push(`${check.id} ${pd}`);
      }
  expect(missing).toEqual([]);
  // The branches named in review94-1.
  expect(rules.get('NZ-P4-1')?.pendingDetails).toContain('PD-226');
  expect(rules.get('NZ-C2')?.pendingDetails).toContain('PD-221');
  expect(rules.get('NZ-P2-JOINT-DATE')?.pendingDetails).toContain('PD-222');
  expect(rules.get('NZ-FAMILY-FILING')?.sources.map((s) => s.srcId)).toContain(
    'SRC-252',
  );
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

test('the visa held when applying must agree with the religious and investor visa answers', () => {
  const visaError = {
    'nz-common-residenceFiling-currentVisa': 'nz.error.visaConflict',
  };
  const filing = (
    goals: NzDraft['goals'],
    family: object,
    currentVisa?: string,
  ) => {
    const draft = residentDraft(goals);
    return withAnswers(draft, {
      family,
      common: {
        ...draft.answers.common,
        residenceFiling: {
          ...draft.answers.common!.residenceFiling,
          currentVisa,
        },
      },
    });
  };
  const check = (draft: NzDraft) =>
    nz.validateStep({ ...draft, step: stepIndex('filing') });
  const religious = (holdsQualifyingWorkVisa: boolean, visa?: string) =>
    filing(
      ['religious'],
      { religious: { inNz: true, holdsQualifyingWorkVisa } },
      visa,
    );
  // A named visa decides the check, so a different flag would be ignored.
  expect(check(religious(false, 'religious-work'))).toEqual(visaError);
  expect(check(religious(true, 'critical-purpose-work'))).toEqual(visaError);
  expect(check(religious(true, 'none'))).toEqual(visaError);
  expect(check(religious(true, 'religious-work'))).toEqual({});
  expect(check(religious(false, 'critical-purpose-work'))).toEqual({});
  // A general work visa, other or no answer leaves the flag to decide.
  expect(check(religious(true, 'work'))).toEqual({});
  expect(check(religious(false, 'other'))).toEqual({});
  expect(check(religious(true))).toEqual({});

  const investor = (holdsBusinessInvestorWorkVisa: boolean, visa: string) =>
    filing(
      ['investor'],
      {
        investment: {
          route: 'business',
          business: { holdsBusinessInvestorWorkVisa },
        },
      },
      visa,
    );
  expect(check(investor(false, 'business-investor-work'))).toEqual(visaError);
  expect(check(investor(true, 'religious-work'))).toEqual(visaError);
  expect(check(investor(true, 'business-investor-work'))).toEqual({});
  // Answers on a step the goals hide are not compared.
  expect(
    check({ ...investor(false, 'business-investor-work'), goals: ['smc'] }),
  ).toEqual({});
  expect(nz.decodeDraft(religious(false, 'religious-work'))).toBeUndefined();
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

  // Only the skilled pathways read the principal's English evidence here; the
  // family pathways ask for it on their own step.
  expect(english.ids).toContain('nz-common-english-method');
  for (const goal of nzGoalGroups.family) {
    const familyOnly = withAnswers(residentDraft([goal]), {
      common: { english: { method: 'none' } },
    });
    const step = form(familyOnly, 'english');
    expect(step.ids, goal).toContain('nz-common-testSpecificallyRequested');
    expect(step.ids, goal).not.toContain('nz-common-english-method');
    expect(
      step.nodes.some((n) => n.text === t('nz.form.optionalGroup')),
      goal,
    ).toBe(false);
    expect(
      nz.activeAnswers!(familyOnly).answers.common?.english,
      goal,
    ).toBeUndefined();
  }

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
