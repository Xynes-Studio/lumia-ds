import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Radio } from './radio';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Radio component', () => {
  it('renders radio buttons with labels and hint', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <div>
          <Radio
            name="role"
            value="admin"
            label="Admin"
            hint="Full access"
            defaultChecked
          />
          <Radio name="role" value="viewer" label="Viewer" />
        </div>,
      );
    });

    const inputs = host.querySelectorAll('input[type="radio"]');
    const hint = host.querySelector('span[id]');

    expect(inputs[0]?.checked).toBe(true);
    expect(inputs[1]?.checked).toBe(false);
    expect(inputs[0]?.getAttribute('aria-describedby')).toBe(hint?.id);
    expect(inputs[0]?.name).toBe('role');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies invalid styles and disabled tone', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Radio
          invalid
          disabled
          label="Cannot select"
          aria-describedby="other"
        />,
      );
    });

    const input = host.querySelector('input[type="radio"]');
    const indicator = host.querySelector('span[aria-hidden="true"]');
    const label = host.querySelector('label');

    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(indicator?.className).toContain('border-destructive');
    expect(label?.className).toContain('opacity-70');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
