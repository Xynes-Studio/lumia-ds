import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from './tag';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Tag component', () => {
  it('renders label text and variant styles', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Tag label="Ready" variant="success" className="custom" />);
    });

    const tag = host.querySelector('[data-lumia-tag]');

    expect(tag?.textContent).toContain('Ready');
    expect(tag?.getAttribute('data-variant')).toBe('success');
    expect(tag?.className).toContain('bg-emerald-50');
    expect(tag?.className).toContain('custom');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('shows a remove control when onRemove is provided', async () => {
    const { root, host } = createTestRoot();
    const onRemove = vi.fn();

    await act(async () => {
      root.render(<Tag label="Dismiss me" onRemove={onRemove} />);
    });

    const removeButton = host.querySelector(
      'button[aria-label="Remove tag Dismiss me"]',
    ) as HTMLButtonElement | null;

    expect(removeButton).toBeTruthy();

    await act(async () => {
      if (removeButton) {
        Simulate.click(removeButton);
        await Promise.resolve();
      }
    });

    expect(onRemove).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('omits the remove button when onRemove is not passed', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Tag label="Static chip" />);
    });

    const removeButton = host.querySelector('button[aria-label^="Remove tag"]');

    expect(removeButton).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
