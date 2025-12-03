import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from './segmented-control';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const options: SegmentedControlOption[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const ControlledSegmentedControl = () => {
  const [current, setCurrent] = useState('all');

  return (
    <SegmentedControl options={options} value={current} onChange={setCurrent} />
  );
};

describe('SegmentedControl', () => {
  it('selects an option on click', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledSegmentedControl />);
    });

    const radios = host.querySelectorAll('[role="radio"]');
    expect(radios).toHaveLength(3);
    expect(radios[0]?.getAttribute('aria-checked')).toBe('true');

    await act(async () => {
      (radios[1] as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(radios[1]?.getAttribute('aria-checked')).toBe('true');
    expect(radios[0]?.getAttribute('aria-checked')).toBe('false');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('moves focus with arrow keys and selects on Enter', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledSegmentedControl />);
    });

    const radios = host.querySelectorAll('[role="radio"]');

    await act(async () => {
      (radios[0] as HTMLButtonElement).focus();
      (radios[0] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(radios[1]);
    expect(radios[0]?.getAttribute('aria-checked')).toBe('true');

    await act(async () => {
      (radios[1] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    });

    expect(radios[1]?.getAttribute('aria-checked')).toBe('true');
    expect(radios[0]?.getAttribute('aria-checked')).toBe('false');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
