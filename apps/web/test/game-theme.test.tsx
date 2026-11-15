import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { SiteShell } from '../components/site-shell';
import { LocaleContext } from '../i18n/locale';
import { t } from '../i18n';
import game from '../app/game/game.module.css';
import site from '../app/site.module.css';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
afterEach(() => vi.resetAllMocks());

const css = readFileSync(
  new URL('../app/game/game.module.css', import.meta.url),
  'utf8',
);
const canvasCss = readFileSync(
  new URL('../app/game/town-canvas.module.css', import.meta.url),
  'utf8',
);

test.each(['zh-CN', 'en'] as const)(
  'entering and leaving /game scopes the warm theme and compact header in %s',
  (locale) => {
    for (const path of [
      '/simulate',
      '/game',
      '/policy',
      '/game/',
      '/result',
      '/about',
      '/whatif',
      '/',
      '/game-preview',
    ]) {
      vi.mocked(usePathname).mockReturnValue(path);
      const html = renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <SiteShell>
            <main id="main">Content</main>
          </SiteShell>
        </LocaleContext>,
      );
      const isGame = path === '/game' || path === '/game/';
      expect(html.includes(`class="${game.theme}"`)).toBe(isGame);
      expect(html.includes(`class="${game.siteHeader}"`)).toBe(isGame);
      expect(html.includes(`class="${site.header}"`)).toBe(!isGame);
      expect(html.includes(`class="${site.navigation}"`)).toBe(!isGame);
      expect(html).toContain(
        t(isGame ? 'game.returnSimulator' : 'site.name', locale),
      );
      expect(html).toContain('href="/"');
      expect(html).toContain('lang="zh-CN"');
      expect(html).toContain('lang="en"');
    }
  },
);

test('mobile layout switches the sidebar to a dock and sheet while reserving canvas and safe-area space', () => {
  // CSS contract only: actual geometry and Retina rendering are reviewed by Fable.
  const mobile = css
    .split('@media (max-width: 760px) {')[1]
    .split('@media (max-width: 600px) {')[0];
  expect(css).toMatch(/\.hudTop\s*\{[^}]*flex-wrap: nowrap/s);
  expect(css).toMatch(
    /\.characters\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/s,
  );
  expect(css).toMatch(/\.character \.buttons\s*\{[^}]*margin-top: auto/s);
  expect(css).toMatch(/\.statIcon,\s*\.mobileOnly\s*\{\s*display: none/s);
  expect(css).toMatch(/\.toolbar \.destinationTrigger\s*\{\s*display: none/s);
  expect(mobile).toMatch(
    /\.desktopDestinations,\s*\.controls\s*\{\s*display: none/s,
  );
  expect(mobile).toMatch(/\.mobileOnly\s*\{\s*display: block/s);
  expect(mobile).toMatch(/\.toolbar\s*\{[^}]*position: fixed;[^}]*bottom: 0/s);
  expect(mobile).toMatch(
    /\.toolbar \.destinationTrigger\s*\{\s*display: inline-flex/s,
  );
  expect(mobile).toMatch(/\.destinationSheet\s*\{[^}]*max-height: 65dvh/s);
  expect(mobile).toContain('env(safe-area-inset-bottom)');
  expect(canvasCss).toContain(
    'calc(100dvh - 420px - env(safe-area-inset-bottom))',
  );
  expect(canvasCss).toMatch(
    /\.canvas\.interior\s*\{[^}]*height: auto;[^}]*aspect-ratio: 18 \/ 13;[^}]*max-height: 310px/s,
  );
  expect(css).toMatch(/\.interactionBar\s*\{[^}]*min-height: 60px/s);
  const interaction = css.match(/\.interactButton\s*\{([^}]*)\}/)![1];
  expect(interaction).toContain('white-space: nowrap');
  expect(interaction).not.toContain('position: absolute');
  expect(css).not.toContain(':root');
  expect(css).not.toContain(':global');
});

const tokens = Object.fromEntries(
  [...css.matchAll(/--([a-z-]+): (#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]),
);
function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((c) => {
      const value = parseInt(c, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
test('actual game text tokens meet AA contrast on their panel, button and HUD backgrounds', () => {
  const pairs = [
    ['ink', 'panel'],
    ['muted', 'panel'],
    ['muted', 'lining'],
    ['ink', 'secondary'],
    ['ink', 'choice'],
    ['heart', 'panel'],
    ['amber-ink', 'stage'],
    ['panel', 'hud'],
    ['panel', 'hud-control'],
    ['gold', 'hud'],
    ['#ffffff', 'primary'],
    ['#ffffff', 'primary-hover'],
  ];
  for (const [foreground, background] of pairs) {
    const values = [foreground, background]
      .map((key) => luminance(tokens[key] ?? key))
      .sort((a, b) => b - a);
    expect(
      (values[0] + 0.05) / (values[1] + 0.05),
      `${foreground} on ${background}`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});

test('the five attribute fills have graphical contrast against the meter track', () => {
  for (const key of ['money', 'mood', 'health', 'english', 'career']) {
    const values = [tokens[key], tokens.slot]
      .map(luminance)
      .sort((a, b) => b - a);
    expect((values[0] + 0.05) / (values[1] + 0.05), key).toBeGreaterThanOrEqual(
      3,
    );
  }
});

test('nearby places have a lighter frame while only the current interaction gets a large gold frame', () => {
  const highlighted = canvasCss.match(
    /\.label\[data-highlighted='true'\]\s*\{([^}]*)\}/,
  )![1];
  expect(highlighted).toContain('border-color: #c89b54');
  expect(highlighted).not.toContain('font-size: 14px');
  const nearby = canvasCss.match(
    /\.homeLabel\[data-nearby='true'\]\s*\{([^}]*)\}/,
  )![1];
  expect(nearby).toContain('font-size: 14px');
  expect(nearby).toContain('font-weight: 700');
  expect(nearby).toContain('box-shadow: 0 0 0 2px #ffe082');
  expect(css).toMatch(
    /\.theme\.theme \.hud :focus-visible\s*\{[^}]*outline-color: var\(--gold\)/s,
  );
});

test('assessment theming preserves website defaults and supplies warm game overrides', () => {
  const result = readFileSync(
    new URL('../app/result/result.module.css', import.meta.url),
    'utf8',
  );
  const siteCss = readFileSync(
    new URL('../app/site.module.css', import.meta.url),
    'utf8',
  );
  expect(result).toContain('var(--assessment-outcome, #f3f2f1)');
  expect(result).toContain('var(--assessment-outcome-margin, 24px -8px)');
  expect(result).toContain('var(--assessment-link, #1d70b8)');
  expect(css).toContain('--assessment-outcome-margin: 24px 0');
  expect(css).toContain('--assessment-outcome: var(--lining)');
  expect(css).toContain('--assessment-link: var(--primary-hover)');
  expect(siteCss).toContain('var(--badge-background, #e5eef5)');
  expect(siteCss).toContain('var(--badge-announced-background, #fff2cc)');
});
