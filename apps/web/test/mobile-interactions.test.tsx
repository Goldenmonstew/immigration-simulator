import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import SimulatePage from '../app/uk/simulate/page';
import { AssessmentColumns, ResultView } from './uk-result-views';
import { SiteShell } from '../components/site-shell';
import { LocaleContext } from '../i18n/locale';
import { displayedRuleSets } from '../lib/policy';
import { mockResults } from '../lib/mock-results';
import * as questionnaire from '../lib/questionnaire';

vi.mock('react', { spy: true });
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/uk',
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test.each(['zh-CN', 'en'] as const)(
  'column navigation moves focus and scrolls to applicant or principal headings without replacing a shared URL in %s',
  (locale) => {
    const focus = vi.fn();
    const scrollIntoView = vi.fn();
    const getElementById = vi.fn(() => ({ focus, scrollIntoView }));
    const location = { hash: '#s=shared-scenario' };
    vi.stubGlobal('document', { getElementById });
    vi.stubGlobal('window', { location });
    for (const prefix of [undefined, '', 'principal-']) {
      const buttons: (() => void)[] = [];
      const capture = (node: React.ReactNode) => {
        React.Children.forEach(node, (child) => {
          if (
            !React.isValidElement<{
              children?: React.ReactNode;
              onClick?: () => void;
            }>(child)
          )
            return;
          if (child.type === 'button' && child.props.onClick)
            buttons.push(child.props.onClick);
          capture(child.props.children);
        });
      };
      function Probe() {
        const result = mockResults('zh-CN')['1'];
        const view =
          prefix === undefined
            ? ResultView({ result })
            : AssessmentColumns({ result, idPrefix: prefix });
        capture(view);
        return view;
      }
      const html = renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <Probe />
        </LocaleContext>,
      );
      expect(buttons).toHaveLength(2);
      const targets =
        prefix === undefined
          ? displayedRuleSets
          : [...displayedRuleSets].reverse();
      buttons.forEach((click, i) => {
        click();
        const id = `${prefix ?? ''}${targets[i].id}-heading`;
        expect(getElementById).toHaveBeenLastCalledWith(id);
        expect(html).toContain(`id="${id}"`);
        expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
        expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start' });
        expect(location.hash).toBe('#s=shared-scenario');
      });
      expect(html).toContain('tabindex="-1"');
    }
  },
);

test('printing opens every disclosure, restores mixed states after printing, and removes listeners on unmount', () => {
  let setup: React.EffectCallback | undefined;
  vi.spyOn(React, 'useEffect').mockImplementation((effect) => {
    setup ??= effect;
  });
  const events = new EventTarget();
  const details = [false, true, false, false].map((open) => ({ open }));
  vi.stubGlobal('window', events);
  vi.stubGlobal('document', { querySelectorAll: () => details });
  renderToStaticMarkup(
    <SiteShell>
      <p>Print test</p>
    </SiteShell>,
  );
  const cleanup = setup!();
  const states = () => details.map((detail) => detail.open);
  events.dispatchEvent(new Event('beforeprint'));
  expect(states()).toEqual([true, true, true, true]);
  events.dispatchEvent(new Event('beforeprint'));
  events.dispatchEvent(new Event('afterprint'));
  expect(states()).toEqual([false, true, false, false]);
  details[2].open = true;
  events.dispatchEvent(new Event('beforeprint'));
  expect(states()).toEqual([true, true, true, true]);
  if (typeof cleanup === 'function') cleanup();
  expect(states()).toEqual([false, true, true, false]);
  events.dispatchEvent(new Event('beforeprint'));
  expect(states()).toEqual([false, true, true, false]);
});

test.each(['zh-CN', 'en'] as const)(
  'route selects retain their values while narrow labels respond to viewport changes in %s',
  (locale) => {
    const draft = questionnaire.createDraft();
    draft.step = 2;
    draft.timeline.episodes = [
      {
        route: 'HONG_KONG_BNO',
        role: 'MAIN',
        validFrom: '2021-01-01',
        validTo: '2028-01-01',
      },
    ];
    vi.spyOn(questionnaire, 'createDraft').mockReturnValue(draft);
    const effects: React.EffectCallback[] = [];
    vi.spyOn(React, 'useEffect').mockImplementation((effect) => {
      effects.push(effect);
    });
    let compact = false;
    const setCompact = vi.fn((value: unknown) => {
      compact = value as boolean;
    });
    const media = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('window', { matchMedia: vi.fn(() => media) });
    const state = vi.spyOn(React, 'useState');
    const render = () => {
      state
        .mockReturnValueOnce([true, vi.fn()])
        .mockReturnValueOnce([true, vi.fn()])
        .mockReturnValueOnce([{}, vi.fn()])
        .mockReturnValueOnce([compact, setCompact]);
      return renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <SimulatePage />
        </LocaleContext>,
      );
    };
    render();
    const cleanup = effects[0]();
    const label = (html: string) =>
      html.match(
        /<option value="HONG_KONG_BNO" selected="">(.*?)<\/option>/,
      )![1];
    expect(label(render())).toBe(
      locale === 'zh-CN' ? '香港英国国民（海外）' : 'Hong Kong BN(O)',
    );
    media.matches = false;
    media.addEventListener.mock.calls[0][1]();
    expect(label(render())).toBe(
      locale === 'zh-CN'
        ? '香港英国国民（海外） · Hong Kong BN(O)'
        : 'Hong Kong BN(O)',
    );
    if (typeof cleanup === 'function') cleanup();
    expect(media.removeEventListener).toHaveBeenCalledWith(
      'change',
      media.addEventListener.mock.calls[0][1],
    );
  },
);

test.each(['zh-CN', 'en'] as const)(
  'CSS step progress follows forward/back steps and the principal branch in %s',
  (locale) => {
    let draft = questionnaire.createDraft();
    const createDraft = vi
      .spyOn(questionnaire, 'createDraft')
      .mockImplementation(() => draft);
    const state = vi.spyOn(React, 'useState');
    const check = (current: number, total: number) => {
      state
        .mockReturnValueOnce([true, vi.fn()])
        .mockReturnValueOnce([true, vi.fn()])
        .mockReturnValueOnce([{}, vi.fn()])
        .mockReturnValueOnce([false, vi.fn()]);
      const html = renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <SimulatePage />
        </LocaleContext>,
      );
      expect(html).toContain(
        `aria-valuemax="${total}" aria-valuenow="${current}"`,
      );
      expect(html).toContain(`width:${(current / total) * 100}%`);
      expect(html).toContain('aria-labelledby="form-progress-label"');
    };
    check(1, 9);
    draft = questionnaire.draftReducer(draft, { type: 'step', step: 1 });
    check(2, 9);
    draft = questionnaire.draftReducer(draft, { type: 'step', step: 0 });
    check(1, 9);
    draft.timeline.episodes = [
      {
        route: 'SKILLED_WORKER',
        role: 'DEPENDANT',
        validFrom: '2021-01-01',
        validTo: '2030-01-01',
      },
    ];
    draft.step = 9;
    check(4, 10);
    // principal-start creates a fresh timeline with the real factory.
    createDraft.mockRestore();
    draft = questionnaire.draftReducer(draft, { type: 'principal-start' });
    vi.spyOn(questionnaire, 'createDraft').mockImplementation(() => draft);
    check(1, 8);
    draft.principalStep = 7;
    check(8, 8);
    draft = questionnaire.draftReducer(draft, {
      type: 'principal-return',
      completed: true,
    });
    draft.step = 8;
    check(10, 10);
  },
);
