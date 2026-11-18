import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, vi } from 'vitest';
import type { Locale } from '@uk-immigration/engine';
import { LocaleContext } from '../i18n/locale';
import GameClient from '../app/game/game-client';

vi.mock('react', { spy: true });
vi.mock('../app/game/town-canvas', () => ({ default: () => null }));
// game-client loads the canvas through next/dynamic; hand back the mock above.
vi.mock('next/dynamic', async () => {
  const canvas = await import('../app/game/town-canvas');
  return { default: () => canvas.default };
});
vi.mock('../app/game/sound', () => ({
  playSound: vi.fn(),
  hideSound: vi.fn(),
  readMuted: () => true,
  setMuted: vi.fn(),
  setSoundSeason: vi.fn(),
  stopSound: vi.fn(),
  unlockSound: vi.fn(),
}));
const actualReact = await vi.importActual<typeof React>('react');

type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  onChange?: (event: { target: { value: string } }) => void;
};
function walk(
  node: React.ReactNode,
  visit: (e: React.ReactElement<Props>) => void,
) {
  React.Children.forEach(node, (c) => {
    if (React.isValidElement<Props>(c)) {
      visit(c);
      walk(c.props.children, visit);
    }
  });
}
function content(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((c) =>
      React.isValidElement<Props>(c) ? content(c.props.children) : String(c),
    )
    .join('');
}
export function renderView(
  make: () => React.ReactNode,
  locale: Locale = 'zh-CN',
) {
  const buttons: {
    label: string;
    accessibleLabel?: string;
    click: () => void;
    disabled?: boolean;
  }[] = [];
  let tree: React.ReactNode;
  function Probe() {
    tree = make();
    walk(tree, (e) => {
      if (e.type === 'button' && e.props.onClick)
        buttons.push({
          label: content(e.props.children),
          accessibleLabel: e.props['aria-label'],
          click: e.props.onClick,
          disabled: e.props.disabled,
        });
    });
    return tree;
  }
  const html = renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      <Probe />
    </LocaleContext>,
  );
  return {
    html,
    buttons,
    click(prefix: string) {
      const b = buttons.find(
        (b) => b.label.startsWith(prefix) || b.accessibleLabel === prefix,
      );
      expect(b, `Button: ${prefix}`).toBeDefined();
      expect(b!.disabled).not.toBe(true);
      b!.click();
    },
    props<P extends object>(component: React.JSXElementConstructor<P>): P {
      let result: P | undefined;
      walk(tree, (e) => {
        if (e.type === component) result = e.props as P;
      });
      expect(result).toBeDefined();
      return result!;
    },
    input(value: string) {
      walk(tree, (e) => {
        if (e.type === 'input') e.props.onChange?.({ target: { value } });
      });
    },
  };
}
// Minimal hook runner for controller transitions and timed overlays, without a DOM or Phaser.
export function harness(make: () => React.ReactNode, locale: Locale = 'zh-CN') {
  const stateHook = actualReact.useState,
    refHook = actualReact.useRef,
    effectHook = actualReact.useEffect;
  const values: unknown[] = [],
    refs: { current: unknown }[] = [],
    effects: { deps?: React.DependencyList; cleanup?: () => void }[] = [];
  let running = false,
    si = 0,
    ri = 0,
    ei = 0;
  let pending: {
    i: number;
    fn: React.EffectCallback;
    deps?: React.DependencyList;
  }[] = [];
  vi.spyOn(React, 'useState').mockImplementation(((initial: unknown) => {
    if (!running) return stateHook(initial);
    const i = si++;
    if (!(i in values))
      values[i] = typeof initial === 'function' ? initial() : initial;
    return [
      values[i],
      (next: unknown) => {
        values[i] = typeof next === 'function' ? next(values[i]) : next;
      },
    ];
  }) as typeof React.useState);
  vi.spyOn(React, 'useRef').mockImplementation(((initial: unknown) => {
    if (!running) return refHook(initial);
    const i = ri++;
    return refs[i] ?? (refs[i] = { current: initial });
  }) as typeof React.useRef);
  vi.spyOn(React, 'useEffect').mockImplementation((fn, deps) => {
    if (!running) return effectHook(fn, deps);
    const i = ei++,
      old = effects[i];
    if (!old || !deps || deps.some((d, j) => !Object.is(d, old.deps?.[j])))
      pending.push({ i, fn, deps });
  });
  return {
    render() {
      si = ri = ei = 0;
      pending = [];
      return renderView(() => {
        running = true;
        const tree = make();
        running = false;
        return tree;
      }, locale);
    },
    flush() {
      const work = pending;
      pending = [];
      for (const { i, fn, deps } of work) {
        effects[i]?.cleanup?.();
        effects[i] = { deps, cleanup: fn() || undefined };
      }
    },
    dispose() {
      effects.forEach((e) => e.cleanup?.());
    },
    values,
  };
}

export function mountClient(locale: Locale = 'zh-CN') {
  const documentStub = {
    hidden: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('document', documentStub);
  const h = harness(() => GameClient(), locale);
  const initialHtml = h.render().html;
  h.flush();
  return { ...h, documentStub, initialHtml };
}
