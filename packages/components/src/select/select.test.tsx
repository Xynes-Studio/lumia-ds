import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Select } from './select';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Select component', () => {
  it('renders with label, options, and hint wiring', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Select label="Role" hint="Choose a role">
          <option value="">Select</option>
          <option value="admin">Admin</option>
        </Select>,
      );
    });

    const select = host.querySelector('select');
    const label = host.querySelector('label');
    const hint = host.querySelector('p');

    expect(label?.textContent).toBe('Role');
    expect(select?.getAttribute('aria-describedby')).toBe(hint?.id);
    expect(select?.className).toContain('appearance-none');
    expect(select?.className).toContain('border-border');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies invalid state and merges describedby ids', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Select
          id="status"
          invalid
          hint="Pick a status"
          aria-describedby="external"
          defaultValue="open"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>,
      );
    });

    const select = host.querySelector('select');
    const hint = host.querySelector('p');
    const describedBy = select?.getAttribute('aria-describedby')?.split(' ');

    expect(select?.getAttribute('aria-invalid')).toBe('true');
    expect(select?.value).toBe('open');
    expect(select?.className).toContain('border-destructive');
    expect(describedBy).toContain('external');
    expect(describedBy).toContain(hint?.id);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
  it('renders loading state', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Select label="Loading" isLoading>
          <option>Option</option>
        </Select>,
      );
    });

    const select = host.querySelector('select');
    expect(select?.disabled).toBe(true);

    // Check for spinner
    const spinner = host.querySelector('[role="status"]'); // Select wrapper renders spinner
    expect(spinner).toBeTruthy();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
