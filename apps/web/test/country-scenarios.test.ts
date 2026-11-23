import { afterEach, expect, test, vi } from 'vitest';
import type { CountryResult } from '@uk-immigration/engine';
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

afterEach(() => vi.unstubAllGlobals());

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
  rememberResult(other, result, 'en');
  loadScenario(ukModule, legacy);
  expect(getRememberedResult(other, 'en')).toBe(result);
  expect(getRememberedResult(ukModule, 'en')).toBeUndefined();
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
