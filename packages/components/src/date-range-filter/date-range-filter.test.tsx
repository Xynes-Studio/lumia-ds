import { act } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { DateRangeFilter } from './date-range-filter';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

describe('DateRangeFilter', () => {
  it('renders placeholder and toggles the picker surface', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    await act(async () => {
      root.render(<DateRangeFilter onChange={onChange} variant="classic" />);
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toContain('Select date range');

    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(host.querySelector('[role="dialog"]')).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });

    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('calls onChange when either date input updates', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    await act(async () => {
      root.render(<DateRangeFilter onChange={onChange} variant="classic" />);
    });

    const trigger = host.querySelector('button');
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(host.querySelector('[role="dialog"]')).not.toBeNull();

    const inputs = host.querySelectorAll('input[type="date"]');
    expect(inputs.length).toBe(2);
    const fromInput = inputs[0];

    await act(async () => {
      Simulate.change(fromInput, {
        target: { value: '2024-06-01' },
      } as unknown as Event);
    });

    expect(onChange).toHaveBeenCalled();
    const [{ from, to }] = onChange.mock.calls.at(-1) as [
      { from?: Date; to?: Date },
    ];
    expect(from?.getFullYear()).toBe(2024);
    expect(to).toBeUndefined();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies preset ranges and closes the popup', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));

    await act(async () => {
      root.render(<DateRangeFilter onChange={onChange} />);
    });

    const trigger = host.querySelector('button');
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const todayButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Today',
    );

    await act(async () => {
      todayButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const [{ from, to }] = onChange.mock.calls.at(-1) as [
      { from?: Date; to?: Date },
    ];

    expect(from?.toDateString()).toBe('Fri Mar 15 2024');
    expect(to?.toDateString()).toBe('Fri Mar 15 2024');
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    vi.useRealTimers();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('formats incoming values for display', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <DateRangeFilter
          onChange={onChange}
          value={{ from: new Date(2024, 0, 1), to: new Date(2024, 0, 7) }}
        />,
      );
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toContain('Jan 1, 2024 – Jan 7, 2024');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('enforces min/max bounds and range caps when selecting', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();
    const formatDate = (value?: Date) =>
      value
        ? `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, '0')}-${`${value.getDate()}`.padStart(2, '0')}`
        : undefined;

    await act(async () => {
      root.render(
        <DateRangeFilter
          onChange={onChange}
          minDate={new Date(2024, 5, 1)}
          maxDate={new Date(2024, 5, 30)}
          maxRangeDays={5}
          variant="classic"
        />,
      );
    });

    const trigger = host.querySelector('button');
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const [fromInput, toInput] = host.querySelectorAll('input[type="date"]');

    await act(async () => {
      Simulate.change(
        fromInput as HTMLInputElement,
        {
          target: { value: '2024-06-20' },
        } as unknown as Event,
      );
    });

    expect((toInput as HTMLInputElement).getAttribute('min')).toBe(
      '2024-06-20',
    );
    expect((toInput as HTMLInputElement).getAttribute('max')).toBe(
      '2024-06-25',
    );

    await act(async () => {
      Simulate.change(
        toInput as HTMLInputElement,
        {
          target: { value: '2024-07-01' },
        } as unknown as Event,
      );
    });

    const [{ to: cappedTo }] = onChange.mock.calls.at(-1) as [
      { from?: Date; to?: Date },
    ];
    expect(formatDate(cappedTo)).toBe('2024-06-25');

    await act(async () => {
      Simulate.change(
        toInput as HTMLInputElement,
        {
          target: { value: '2024-06-10' },
        } as unknown as Event,
      );
    });

    const [{ to: correctedTo }] = onChange.mock.calls.at(-1) as [
      { from?: Date; to?: Date },
    ];
    expect(formatDate(correctedTo)).toBe('2024-06-20');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('shows dual-month calendar in modern variant with bounds applied', async () => {
    const { host, root } = createTestRoot();
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <DateRangeFilter
          variant="modern"
          minDate={new Date(2024, 5, 10)}
          maxDate={new Date(2024, 5, 20)}
          onChange={onChange}
        />,
      );
    });

    const trigger = host.querySelector('button');
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const tables = host.querySelectorAll('[role="grid"]');
    expect(tables.length).toBeGreaterThanOrEqual(2);

    const disabledDate = host.querySelector(
      '[aria-label="June 9, 2024"]',
    ) as HTMLButtonElement | null;
    expect(disabledDate?.getAttribute('disabled')).not.toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
