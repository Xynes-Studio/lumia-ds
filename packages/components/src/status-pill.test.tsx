import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { StatusPill } from './status-pill';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('StatusPill component', () => {
  it('applies semantic variant classes', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<StatusPill variant="success">Live</StatusPill>);
    });

    const pill = host.querySelector('[data-lumia-status-pill]');

    expect(pill?.textContent).toContain('Live');
    expect(pill?.getAttribute('data-variant')).toBe('success');
    expect(pill?.className).toContain('bg-emerald-50');
    expect(pill?.className).toContain('text-emerald-800');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('defaults to info styling and merges className', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <StatusPill className="custom-class">Awaiting sync</StatusPill>,
      );
    });

    const pill = host.querySelector('[data-lumia-status-pill]');

    expect(pill?.getAttribute('data-variant')).toBe('info');
    expect(pill?.className).toContain('bg-blue-50');
    expect(pill?.className).toContain('custom-class');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
