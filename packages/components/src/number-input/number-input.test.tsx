import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type { NumberInputProps } from './number-input';
import { NumberInput } from './number-input';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

const ControlledNumberInput = ({
  onChange,
  value = 5,
  ...props
}: Partial<NumberInputProps> & {
  onChange?: (value: number | undefined) => void;
}) => {
  const [current, setCurrent] = useState<number | undefined>(value);

  return (
    <NumberInput
      value={current}
      onChange={(next) => {
        setCurrent(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
};

describe('NumberInput', () => {
  it('steps with controls and clamps to bounds', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <ControlledNumberInput
          value={4}
          min={0}
          max={10}
          step={2}
          onChange={handleChange}
          aria-label="Quantity"
        />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement | null;
    const increment = host.querySelector(
      'button[aria-label="Increase value"]',
    ) as HTMLButtonElement | null;
    const decrement = host.querySelector(
      'button[aria-label="Decrease value"]',
    ) as HTMLButtonElement | null;

    expect(input?.value).toBe('4');

    await act(async () => {
      increment?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      increment?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      increment?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      decrement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleChange).toHaveBeenLastCalledWith(8);
    expect(input?.value).toBe('8');
    expect(input?.getAttribute('aria-valuemax')).toBe('10');
    expect(input?.getAttribute('aria-valuenow')).toBe('8');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('accepts manual entry and keyboard stepping', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <ControlledNumberInput
          value={2}
          min={0}
          max={5}
          step={0.5}
          onChange={handleChange}
          aria-label="Score"
        />,
      );
    });

    const input = host.querySelector('input') as HTMLInputElement | null;
    expect(input).not.toBeNull();

    await act(async () => {
      if (!input) return;
      input.value = '-3';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      input.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'ArrowUp', bubbles: true }),
      );
    });

    expect(handleChange).toHaveBeenLastCalledWith(0.5);
    expect(input?.value).toBe('0.5');

    await act(async () => {
      if (!input) return;
      input.value = 'abc';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    });

    expect(input?.value).toBe('0.5');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
