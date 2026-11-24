import { afterEach, expect, test, vi } from 'vitest';
import type { CountryResult } from '@uk-immigration/engine';
import type { CountryDraft } from '../lib/country-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import {
  deleteScenario,
  draftStorage,
  getRememberedResult,
  loadScenario,
  readScenarios,
  rememberResult,
  saveScenario,
} from '../lib/storage';
import { ukModule } from '../lib/uk-module';
import { japanModule } from '../lib/japan-module';

const encodeJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

// A second draft schema exercises the module boundary without migrating a pilot.
const otherDraft = {
  version: 1,
  completed: true,
  step: 1,
  simulationDate: '2030-01-02',
  name: '家',
};
const other = {
  id: 'ca' as const,
  version: otherDraft.version,
  createDraft: () => otherDraft,
  decodeDraft(value: unknown) {
    const draft = value as typeof otherDraft | null;
    return draft?.version === otherDraft.version &&
      typeof draft.name === 'string'
      ? draft
      : undefined;
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test('only the UK module opens an unwrapped version-one UK share', () => {
  const draft = ukModule.createDraft();
  const legacy = encodeJson(draft);
  expect(decodeDraft(ukModule, legacy)).toEqual(draft);
  expect(decodeDraft(other, legacy)).toBeUndefined();
  expect(decodeDraft(other, encodeJson(otherDraft))).toBeUndefined();
});

test('the share envelope round trips UTF-8 drafts and checks the country and version', () => {
  const draft = ukModule.createDraft();
  const ukShare = encodeDraft(ukModule, draft);
  expect(
    JSON.parse(Buffer.from(ukShare, 'base64url').toString('utf8')),
  ).toEqual({
    country: 'uk',
    v: 1,
    draft,
  });
  expect(decodeDraft(ukModule, ukShare)).toEqual(draft);
  const otherShare = encodeDraft(other, otherDraft);
  expect(decodeDraft(other, otherShare)).toEqual(otherDraft);
  expect(decodeDraft(ukModule, otherShare)).toBeUndefined();
  expect(decodeDraft(other, ukShare)).toBeUndefined();
  expect(
    decodeDraft(ukModule, encodeJson({ country: 'ca', v: 1, draft })),
  ).toBeUndefined();
  expect(
    decodeDraft(ukModule, encodeJson({ country: 'uk', v: 2, draft })),
  ).toBeUndefined();
  // A broken envelope must not fall back to legacy UK decoding.
  expect(
    decodeDraft(ukModule, encodeJson({ ...draft, country: 'ca' })),
  ).toBeUndefined();
});

test('existing UK drafts and scenarios stay accessible alongside another country and its fallback cache', () => {
  const draft = ukModule.createDraft();
  const legacy = { id: 'old', name: 'Old', savedAt: '2026-10-01', draft };
  const storage = new Map([
    ['uk-immigration-draft-v1', JSON.stringify(draft)],
    ['uk-immigration-scenarios-v1', JSON.stringify([legacy])],
  ]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  expect(draftStorage(ukModule).draft).toEqual(draft);
  expect(readScenarios(ukModule).scenarios).toEqual([legacy]);
  expect(readScenarios(other).scenarios).toEqual([]);
  draftStorage(other, otherDraft);
  const [scenario] = saveScenario(other, 'Other', otherDraft).scenarios;
  expect(readScenarios(other).scenarios).toEqual([scenario]);
  const result: CountryResult = { policyAsOf: '2026-11-01', columns: [] };
  rememberResult(other, otherDraft, result, 'en');
  loadScenario(ukModule, legacy);
  expect(getRememberedResult(other, otherDraft, 'en')).toBe(result);
  expect(getRememberedResult(ukModule, draft, 'en')).toBeUndefined();
  deleteScenario(other, scenario.id);
  expect(readScenarios(other).scenarios).toEqual([]);
  expect(readScenarios(ukModule).scenarios).toEqual([legacy]);
  vi.stubGlobal('localStorage', undefined);
  expect(draftStorage(ukModule)).toEqual({
    draft: { ...draft, completed: true },
    available: false,
  });
  expect(draftStorage(other)).toEqual({ draft: otherDraft, available: false });
});

test.each([ukModule, japanModule])(
  'a $id result cache misses when another tab replaces answers for the same date',
  (country) => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const first = {
      ...country.createDraft(),
      ...(country.id === 'jp' ? { reentry: [{ route: 'ordinary' }] } : {}),
      completed: true,
    };
    const second =
      country.id === 'jp'
        ? { ...first, reentry: [{ route: 'deemed' }] }
        : { ...first, screening: { criminality: 'yes' } };
    const result: CountryResult = {
      policyAsOf: first.simulationDate,
      columns: [],
    };
    draftStorage(country, first);
    rememberResult(country, first, result, 'en');
    const restored = draftStorage<CountryDraft>(country).draft!;
    expect(getRememberedResult(country, restored, 'en')).toBe(result);

    storage.set(country.id + '-immigration-draft-v1', JSON.stringify(second));
    const latest = draftStorage<CountryDraft>(country).draft!;
    expect(latest).toEqual(second);
    expect(getRememberedResult(country, latest, 'en')).toBeUndefined();
  },
);

test.each([
  ['2026-10-01', true],
  ['2026-10-03', true],
  ['2026-10-03', false],
] as const)(
  'first opening a legacy Japan draft or saved plan on %s clears its unverified declaration of %s',
  (firstRead, declaredIntentAtDeparture) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(firstRead + 'T12:00:00Z'));
    const original = {
      ...japanModule.createDraft(),
      answerFormat: undefined,
      completed: true,
      step: 6,
      simulationDate: '2026-10-10',
      reentry: [
        {
          route: 'deemed' as const,
          departureOn: '2026-10-02',
          returnOn: '2026-10-10',
          stayIndefinite: true,
          lawfulStatus: true,
          passportValid: true,
          residentCardOrCertificate: true,
          formalPermitRequired: false,
          permitVoided: false,
          declaredIntentAtDeparture,
        },
      ],
    };
    const scenario = {
      id: 'old',
      name: 'saved',
      savedAt: '2026-10-01',
      draft: original,
    };
    const draftKey = 'jp-immigration-draft-v1';
    const scenariosKey = 'jp-immigration-scenarios-v1';
    const storage = new Map([
      [draftKey, JSON.stringify(original)],
      [scenariosKey, JSON.stringify([scenario])],
    ]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const local = draftStorage(japanModule).draft!;
    const oldShare = decodeDraft(
      japanModule,
      encodeDraft(japanModule, original),
    );
    if (firstRead < original.reentry[0].departureOn)
      expect(oldShare).toBeUndefined();
    else expect(oldShare).toEqual(local);
    expect(local.reentry).toEqual([
      { ...original.reentry[0], declaredIntentAtDeparture: undefined },
    ]);
    expect(decodeDraft(japanModule, encodeDraft(japanModule, local))).toEqual(
      local,
    );
    const cleanedPlans = [{ ...scenario, draft: local }];
    expect(readScenarios(japanModule).scenarios).toEqual(cleanedPlans);
    expect(JSON.parse(storage.get(draftKey)!)).toEqual(local);
    expect(JSON.parse(storage.get(scenariosKey)!)).toEqual(cleanedPlans);

    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    expect(draftStorage(japanModule).draft).toEqual(local);
    const plansAfterDeparture = readScenarios(japanModule).scenarios;
    expect(plansAfterDeparture).toEqual(cleanedPlans);
    const loaded = loadScenario(japanModule, plansAfterDeparture[0]);
    expect(loaded).toEqual(local);
    for (const draft of [local, loaded]) {
      const route = japanModule.run(draft, 'en').columns[0].pathways[0];
      expect(route.status).toBe('UNKNOWN');
      expect(route.summary).toContain('whether you declared your intention');
    }
  },
);
