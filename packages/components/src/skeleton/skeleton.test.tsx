import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Skeleton component', () => {
  it('applies dimensions and pulse animation', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<Skeleton width={120} height={14} />);
    });

    const skeleton = host.querySelector('div');

    expect(skeleton?.className).toContain('animate-pulse');
    expect(skeleton?.style.width).toBe('120px');
    expect(skeleton?.style.height).toBe('14px');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports rounded variants and custom class names', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Skeleton
          width="50%"
          height={20}
          rounded="full"
          className="bg-primary/10"
        />,
      );
    });

    const skeleton = host.querySelector('div');

    expect(skeleton?.className).toContain('rounded-full');
    expect(skeleton?.className).toContain('bg-primary/10');
    expect(skeleton?.style.width).toBe('50%');
    expect(skeleton?.style.height).toBe('20px');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
