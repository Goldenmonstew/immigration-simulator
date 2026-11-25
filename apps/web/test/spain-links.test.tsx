import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { SiteShell } from '../components/site-shell';
import { LocaleContext } from '../i18n/locale';
import { readPageResult } from '../lib/page-result';
import { encodeDraft, linkedResultDraft } from '../lib/share';
import type { SpainDraft } from '../lib/spain-draft';
import { spainModule as es } from '../lib/spain-module';
import { draftStorage } from '../lib/storage';
import site from '../app/site.module.css';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

function sharedDraft(): SpainDraft {
  return {
    ...es.createDraft(),
    step: 3,
    completed: true,
    simulationDate: '2026-11-23',
    targets: ['L'],
    timeRecordsComplete: true,
    permits: [{ from: '2017-01-01', study: false }],
    trips: [],
    residence: {
      thirdCountryRegime: true,
      entryRestrictionsClear: true,
      noReturnCommitmentClear: true,
      residentInSpain: true,
      validIdentityDocument: true,
      competentOfficeAndApplication: true,
      criminalCertificatesWhereRequired: true,
      securityDecision: 'clear',
      nationalAlternatives: [],
      schooling: { children: [] },
    },
  };
}

test('opening a Spanish share link keeps the existing local draft', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  const local: SpainDraft = {
    ...es.createDraft(),
    simulationDate: '2026-10-01',
    targets: ['N'],
  };
  draftStorage(es, local);
  const page = readPageResult(es, 'zh-CN', encodeDraft(es, sharedDraft()));
  expect(page.shared).toBe(true);
  expect(page.draft?.simulationDate).toBe('2026-11-23');
  expect(JSON.parse(storage.get('es-immigration-draft-v1')!)).toEqual(local);
  expect(draftStorage(es).draft).toEqual(local);
});

test('result, edit and comparison links carry the Spanish scenario', () => {
  const encoded = encodeDraft(es, sharedDraft());
  const shared = linkedResultDraft(es, `#s=${encoded}`);
  expect(shared?.draft?.simulationDate).toBe('2026-11-23');
  expect(shared?.resultHash).toBe(`#s=${encoded}`);
  const own = linkedResultDraft(es, `#draft=${encoded}`);
  expect(own?.draft?.targets).toEqual(['L']);
  expect(own?.resultHash).toBe('');
});

test.each(['zh-CN', 'en'] as const)(
  'skipping to the main content keeps a Spanish scenario fragment in %s',
  (locale) => {
    for (const page of ['', 'simulate', 'result', 'whatif', 'policy']) {
      vi.mocked(usePathname).mockReturnValue(`/spain${page && `/${page}`}`);
      const html = renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <SiteShell>
            <main id="main">Content</main>
          </SiteShell>
        </LocaleContext>,
      );
      const scenario = ['simulate', 'result', 'whatif'].includes(page);
      expect(html.includes(`<button type="button" class="${site.skip}">`)).toBe(
        scenario,
      );
      expect(html.includes(`class="${site.skip}" href="#main"`)).toBe(
        !scenario,
      );
    }
  },
);
