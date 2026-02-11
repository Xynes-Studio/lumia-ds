import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Ticker } from './ticker';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Ticker component', () => {
  it('renders children in a row flex track by default', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Ticker data-testid="ticker">
          <span>One</span>
          <span>Two</span>
        </Ticker>,
      );
    });

    const track = host.querySelector('[data-testid="ticker-track"]');
    expect(track?.className).toContain('flex-row');
    expect(track?.textContent).toContain('One');
    expect(track?.textContent).toContain('Two');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports column direction and alignment', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Ticker direction="column" alignment="center" data-testid="ticker">
          <span>Item</span>
        </Ticker>,
      );
    });

    const track = host.querySelector('[data-testid="ticker-track"]');
    expect(track?.className).toContain('flex-col');
    expect(track?.className).toContain('items-center');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('duplicates content when loop is enabled', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Ticker loop data-testid="ticker">
          <span>Looped</span>
        </Ticker>,
      );
    });

    const groups = host.querySelectorAll('[data-testid="ticker-group"]');
    expect(groups.length).toBe(2);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders a single content group when loop is disabled', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Ticker loop={false} data-testid="ticker">
          <span>No loop</span>
        </Ticker>,
      );
    });

    const groups = host.querySelectorAll('[data-testid="ticker-group"]');
    expect(groups.length).toBe(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('marks reduced motion preference on the root element', async () => {
    const originalMatchMedia = window.matchMedia;
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      dispatchEvent: vi.fn(),
    });
    window.matchMedia = matchMediaMock;

    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Ticker data-testid="ticker">
          <span>Reduce motion</span>
        </Ticker>,
      );
    });

    const ticker = host.querySelector('[data-testid="ticker"]');
    expect(ticker?.getAttribute('data-reduced-motion')).toBe('true');

    await act(async () => root.unmount());
    document.body.removeChild(host);

    window.matchMedia = originalMatchMedia;
  });
});
