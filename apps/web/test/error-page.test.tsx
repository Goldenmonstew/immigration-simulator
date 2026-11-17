import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import ErrorPage from '../app/error';

vi.mock('next/navigation', () => ({ usePathname: () => '/game' }));
afterEach(() => vi.unstubAllGlobals());

function retryButton(error: Error, reset: () => void) {
  let retry: (() => void) | undefined;
  const find = (node: React.ReactNode) =>
    React.Children.forEach(node, (child) => {
      if (
        !React.isValidElement<{
          children?: React.ReactNode;
          onClick?: () => void;
        }>(child)
      )
        return;
      if (child.type === 'button') retry = child.props.onClick;
      find(child.props.children);
    });
  function Probe() {
    const page = ErrorPage({ error, reset });
    find(page);
    return page;
  }
  renderToStaticMarkup(<Probe />);
  return retry!;
}

test('retry reloads the page only when a lazily loaded file is missing', () => {
  const reload = vi.fn();
  const reset = vi.fn();
  vi.stubGlobal('window', { location: { reload } });
  const missing = Object.assign(new Error('Failed to load chunk'), {
    name: 'ChunkLoadError',
  });
  retryButton(missing, reset)();
  expect(reload).toHaveBeenCalledOnce();
  expect(reset).not.toHaveBeenCalled();
  // Other errors keep in-memory state, such as a draft storage refused.
  retryButton(new Error('render failed'), reset)();
  expect(reset).toHaveBeenCalledOnce();
  expect(reload).toHaveBeenCalledOnce();
});
