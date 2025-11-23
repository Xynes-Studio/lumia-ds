import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Checkbox } from './checkbox';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Checkbox component', () => {
  it('renders with label, hint, and checked state', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Checkbox
          defaultChecked
          label="Accept terms"
          hint="You must accept to continue"
          name="terms"
        />,
      );
    });

    const input = host.querySelector('input[type="checkbox"]');
    const hint = host.querySelector('span[id]');
    const indicator = host.querySelector('span[aria-hidden="true"]');

    expect(input?.checked).toBe(true);
    expect(input?.getAttribute('aria-describedby')).toBe(hint?.id);
    expect(indicator?.className).toContain('rounded');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports invalid and indeterminate visuals', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Checkbox invalid indeterminate aria-describedby="note" />);
    });

    const input = host.querySelector('input[type="checkbox"]');
    const indicator = host.querySelector('span[aria-hidden="true"]');

    expect(input?.indeterminate).toBe(true);
    expect(input?.dataset.indeterminate).toBe('true');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(indicator?.className).toContain('border-destructive');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
