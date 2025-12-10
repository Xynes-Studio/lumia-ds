import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from './time-picker';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof PointerEvent === 'undefined') {
  // happy-dom does not provide PointerEvent which Radix listens for
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const flushTimers = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
};

describe('TimePicker', () => {
  it('renders time options and returns a string value', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    await act(async () => {
      root.render(<TimePicker onChange={onChange} />);
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toContain('Select time');

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    const option = document.body.querySelector(
      'button[data-value="09:00"]',
    ) as HTMLButtonElement | null;
    expect(option).not.toBeNull();

    await act(async () => {
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const [value] = onChange.mock.calls.at(-1) as [string | undefined] | [];
    expect(value).toBe('09:00');
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('returns a Date when configured', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();
    const baseDate = new Date(2024, 0, 1, 8, 15);

    await act(async () => {
      root.render(
        <TimePicker
          value={baseDate}
          onChange={onChange}
          format="12h"
          returnType="date"
        />,
      );
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toContain('8:15 AM');

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const option = document.body.querySelector(
      'button[data-value="14:30"]',
    ) as HTMLButtonElement | null;
    expect(option).not.toBeNull();

    await act(async () => {
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const [value] = onChange.mock.calls.at(-1) as [Date | undefined] | [];
    expect(value).toBeInstanceOf(Date);
    expect(value?.getFullYear()).toBe(2024);
    expect(value?.getMonth()).toBe(0);
    expect(value?.getDate()).toBe(1);
    expect(value?.getHours()).toBe(14);
    expect(value?.getMinutes()).toBe(30);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
