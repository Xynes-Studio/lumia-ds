import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

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
    vi.runAllTimers();
  });
};

describe('DatePicker', () => {
  it('opens calendar in a popover and selects a date', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    await act(async () => {
      root.render(<DatePicker onChange={onChange} />);
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toContain('Select date');

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

    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    const dayButton = document.body.querySelector(
      'button[aria-label*="January 5"]',
    ) as HTMLButtonElement | null;
    expect(dayButton).not.toBeNull();

    await act(async () => {
      dayButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const [selected] = onChange.mock.calls.at(-1) as [Date | undefined] | [];
    expect(selected?.getFullYear()).toBe(2024);
    expect(selected?.getMonth()).toBe(0);
    expect(selected?.getDate()).toBe(5);
    expect(
      document.body.querySelector('[data-lumia-popover-content]'),
    ).toBeNull();

    vi.useRealTimers();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('respects min/max bounds', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    await act(async () => {
      root.render(
        <DatePicker
          onChange={onChange}
          minDate={new Date(2024, 0, 10)}
          maxDate={new Date(2024, 0, 20)}
        />,
      );
    });

    const trigger = host.querySelector('button');
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

    const disabledDate = document.body.querySelector(
      'button[aria-label*="January 5"]',
    );
    expect(
      disabledDate &&
        (disabledDate.hasAttribute('disabled') ||
          disabledDate.getAttribute('aria-disabled') === 'true'),
    ).toBe(true);

    vi.useRealTimers();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
