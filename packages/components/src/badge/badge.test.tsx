import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Badge component', () => {
  it('renders children and variant styles', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Badge variant="outline" className="custom">
          Label
        </Badge>,
      );
    });

    const badge = host.querySelector('[data-lumia-badge]');

    expect(badge?.textContent).toContain('Label');
    expect(badge?.getAttribute('data-variant')).toBe('outline');
    expect(badge?.className).toContain('border-border');
    expect(badge?.className).toContain('custom');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('defaults to the primary badge styling', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Badge>Default</Badge>);
    });

    const badge = host.querySelector('[data-lumia-badge]');

    expect(badge?.className).toContain('bg-primary');
    expect(badge?.getAttribute('data-variant')).toBe('default');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
