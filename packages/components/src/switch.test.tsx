import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Switch } from './switch';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

const ControlledSwitch = ({
  initialChecked = false,
  onChange,
}: {
  initialChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <Switch
      label="Demo switch"
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        onChange?.(next);
      }}
    />
  );
};

describe('Switch', () => {
  it('renders label and toggles via click', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledSwitch />);
    });

    const control = host.querySelector('[role="switch"]');
    const label = host.querySelector('label');

    expect(control?.getAttribute('aria-checked')).toBe('false');

    await act(async () => {
      label?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(control?.getAttribute('aria-checked')).toBe('true');
    expect(label?.textContent).toContain('Demo switch');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports toggling with Enter and Space', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();

    await act(async () => {
      root.render(<ControlledSwitch onChange={handleChange} />);
    });

    const control = host.querySelector(
      '[role="switch"]',
    ) as HTMLButtonElement | null;
    expect(control).not.toBeNull();

    const pressKey = async (key: string) => {
      // Simulate browser behavior where Enter/Space on a button triggers a click.
      await act(async () => {
        control?.focus();
        control?.dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true }),
        );
        control?.dispatchEvent(
          new KeyboardEvent('keyup', { key, bubbles: true }),
        );
        control?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    };

    await pressKey('Enter');

    expect(handleChange).toHaveBeenLastCalledWith(true);
    expect(control?.getAttribute('aria-checked')).toBe('true');

    await pressKey(' ');

    expect(handleChange).toHaveBeenLastCalledWith(false);
    expect(control?.getAttribute('aria-checked')).toBe('false');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
