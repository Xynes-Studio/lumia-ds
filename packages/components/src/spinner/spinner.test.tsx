import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Spinner } from './spinner';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Spinner component', () => {
  it('renders with default sizing and aria label', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Spinner />);
    });

    const spinner = host.querySelector('[role="status"]');
    const indicator = spinner?.querySelector('span[aria-hidden="true"]');

    expect(spinner?.getAttribute('aria-label')).toBe('Loading');
    expect(indicator?.className).toContain('animate-spin');
    expect(indicator?.style.width).toBe('20px');
    expect(indicator?.style.height).toBe('20px');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('accepts custom size and color', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Spinner
          size={32}
          aria-label="Processing"
          className="text-secondary"
        />,
      );
    });

    const spinner = host.querySelector('[role="status"]');
    const indicator = spinner?.querySelector('span[aria-hidden="true"]');

    expect(spinner?.getAttribute('aria-label')).toBe('Processing');
    expect(spinner?.className).toContain('text-secondary');
    expect(indicator?.style.width).toBe('32px');
    expect(indicator?.style.height).toBe('32px');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
