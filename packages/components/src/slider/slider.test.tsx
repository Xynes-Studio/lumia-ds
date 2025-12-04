import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import type { SliderProps } from './slider';
import { Slider } from './slider';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

const ControlledSlider = ({
  onChange,
  showValue = false,
  value = 25,
  ...props
}: Partial<SliderProps> & { onChange?: (value: number) => void }) => {
  const [current, setCurrent] = useState(value);

  return (
    <Slider
      min={0}
      max={100}
      step={5}
      value={current}
      showValue={showValue}
      onChange={(next) => {
        setCurrent(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
};

describe('Slider', () => {
  it('renders current value and aria attributes', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <ControlledSlider value={30} showValue aria-label="Slider" />,
      );
    });

    const thumb = host.querySelector('[role="slider"]');
    const valueDisplay = host.querySelector('.tabular-nums');

    expect(thumb?.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb?.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb?.getAttribute('aria-valuenow')).toBe('30');
    expect(valueDisplay?.textContent).toBe('30');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('updates value through keyboard interaction', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <ControlledSlider
          value={20}
          onChange={handleChange}
          aria-label="Volume"
        />,
      );
    });

    const thumb = host.querySelector('[role="slider"]') as HTMLElement | null;
    expect(thumb).not.toBeNull();

    await act(async () => {
      thumb?.focus();
      thumb?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      thumb?.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }),
      );
    });

    expect(handleChange).toHaveBeenCalledWith(25);
    expect(thumb?.getAttribute('aria-valuenow')).toBe('25');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('does not change when disabled', async () => {
    const { root, host } = createTestRoot();
    const handleChange = vi.fn();

    await act(async () => {
      root.render(
        <ControlledSlider
          disabled
          onChange={handleChange}
          aria-label="Opacity"
        />,
      );
    });

    const thumb = host.querySelector('[role="slider"]') as HTMLElement | null;
    expect(thumb?.getAttribute('aria-disabled')).toBe('true');

    await act(async () => {
      thumb?.focus();
      thumb?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      thumb?.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }),
      );
    });

    expect(handleChange).not.toHaveBeenCalled();
    expect(thumb?.getAttribute('aria-valuenow')).toBe('25');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
