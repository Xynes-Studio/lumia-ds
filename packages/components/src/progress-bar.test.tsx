import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './progress-bar';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('ProgressBar component', () => {
  it('renders determinate progress with clamped value', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ProgressBar value={45} aria-label="Uploading" />);
    });

    const bar = host.querySelector('[role="progressbar"]');
    const indicator = bar?.querySelector('div');

    expect(bar?.getAttribute('aria-valuemin')).toBe('0');
    expect(bar?.getAttribute('aria-valuemax')).toBe('100');
    expect(bar?.getAttribute('aria-valuenow')).toBe('45');
    expect(indicator?.style.width).toBe('45%');

    await act(async () => {
      root.render(<ProgressBar value={150} />);
    });

    const clampedIndicator = host.querySelector('[role="progressbar"] div');
    expect(clampedIndicator?.style.width).toBe('100%');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports an indeterminate state without aria-valuenow', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <ProgressBar value={30} indeterminate aria-label="Loading" />,
      );
    });

    const bar = host.querySelector('[role="progressbar"]');
    const indicator = bar?.querySelector('div');

    expect(bar?.getAttribute('aria-valuenow')).toBe(null);
    expect(indicator?.className).toContain('animate-pulse');
    expect(indicator?.style.width).toBe('');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
