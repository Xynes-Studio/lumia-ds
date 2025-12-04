import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Button } from './button';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Button component', () => {
  it('renders with default props', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Button>Click</Button>);
    });

    const button = host.querySelector('button');
    expect(button?.textContent).toBe('Click');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.className).toContain('bg-primary');
    expect(button?.className).toContain('rounded-md');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies variants, sizes, and layout props', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Button variant="secondary" size="lg" fullWidth>
          Wide Secondary
        </Button>,
      );
    });

    const button = host.querySelector('button');
    expect(button?.className).toContain('bg-secondary');
    expect(button?.className).toContain('h-11');
    expect(button?.className).toContain('w-full');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
