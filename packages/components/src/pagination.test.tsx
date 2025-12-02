import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Pagination component', () => {
  it('shows page info and disables navigation when total is zero', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />,
      );
    });

    const buttons = host.querySelectorAll('button');
    const textContent = host.textContent ?? '';

    expect(textContent).toContain('Page 1 of 1');
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Previous page');
    expect(buttons[0]?.disabled).toBe(true);
    expect(buttons[1]?.getAttribute('aria-label')).toBe('Next page');
    expect(buttons[1]?.disabled).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('invokes onPageChange within bounds', async () => {
    const { host, root } = createTestRoot();
    const onPageChange = vi.fn();

    await act(async () => {
      root.render(
        <Pagination
          page={2}
          pageSize={10}
          total={45}
          onPageChange={onPageChange}
        />,
      );
    });

    const [prev, next] = host.querySelectorAll('button');

    await act(async () =>
      prev?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );
    await act(async () =>
      next?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );

    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(3);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders a page size dropdown when provided and forwards numeric values', async () => {
    const { host, root } = createTestRoot();
    const onPageSizeChange = vi.fn();

    await act(async () => {
      root.render(
        <Pagination
          page={1}
          pageSize={20}
          total={200}
          onPageChange={() => {}}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50]}
        />,
      );
    });

    const select = host.querySelector('select');
    expect(select).not.toBeNull();

    await act(async () => {
      if (select) {
        select.value = '50';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    expect(onPageSizeChange).toHaveBeenCalledWith(50);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('omits the page size dropdown when no callback is provided', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={() => {}}
        />,
      );
    });

    expect(host.querySelector('select')).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
