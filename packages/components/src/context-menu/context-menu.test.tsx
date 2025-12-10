import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './context-menu';
import type { MenuItemConfig } from '../shared/menu-shared';

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

  return { root, host };
};

const contextItems = (onSelect?: () => void): MenuItemConfig[] => [
  { id: 'edit', label: 'Edit', icon: 'user', onSelect },
  { id: 'duplicate', label: 'Duplicate', icon: 'settings' },
  { id: 'delete', label: 'Delete', icon: 'delete', variant: 'destructive' },
];

const waitFor = async (
  callback: () => void | Promise<void>,
  timeout = 1000,
) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await callback();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  await callback();
};

describe('ContextMenu', () => {
  it('opens on context click, reuses menu styling, and closes after selection', async () => {
    const { root, host } = createTestRoot();
    const onSelect = vi.fn();

    await act(async () => {
      root.render(
        <ContextMenu items={contextItems(onSelect)}>
          <div data-testid="target" tabIndex={0}>
            Right click me
          </div>
        </ContextMenu>,
      );
    });

    const target = host.querySelector('[data-testid="target"]');
    expect(target).toBeTruthy();

    await act(async () => {
      target?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
      );
      target?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          clientX: 10,
          clientY: 10,
        }),
      );
    });
    await act(async () => {});

    const content = document.body.querySelector(
      '[data-lumia-menu-content]',
    ) as HTMLElement | null;
    expect(content).not.toBeNull();
    expect(content?.className).toContain('rounded-md');

    const firstItem = content?.querySelector('[data-lumia-menu-item]');
    expect(firstItem?.textContent).toContain('Edit');

    await act(async () => {
      firstItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      firstItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await act(async () => {});

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[data-lumia-menu-content]')).toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toBe(target);
    });

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports keyboard open and arrow navigation', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <ContextMenu items={contextItems()}>
          <div data-testid="target" tabIndex={0}>
            Focus then press Shift+F10
          </div>
        </ContextMenu>,
      );
    });

    const target = host.querySelector('[data-testid="target"]');

    await act(async () => {
      target?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      target?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'F10',
          shiftKey: true,
          bubbles: true,
        }),
      );
    });
    await act(async () => {});

    const content = document.body.querySelector(
      '[data-lumia-menu-content]',
    ) as HTMLElement | null;
    expect(content).toBeTruthy();

    const highlightedText = () =>
      content?.querySelector('[data-highlighted]')?.textContent ?? '';

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });
    await act(async () => {});

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });
    await act(async () => {});

    await waitFor(() => {
      expect(highlightedText()).toMatch(/Duplicate|Delete/);
    });

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    await act(async () => {});

    expect(document.body.querySelector('[data-lumia-menu-content]')).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(target);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
