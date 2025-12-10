import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { DrawerLayout } from './drawer-layout';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('DrawerLayout', () => {
  it('shows a drawer with overlay and handles closing interactions', async () => {
    const onClose = vi.fn();
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DrawerLayout isOpen onClose={onClose}>
          <p>Drawer content</p>
        </DrawerLayout>,
      );
    });

    const overlay = host.querySelector('[data-slot="drawer-overlay"]');
    const panel = host.querySelector('[data-slot="drawer-panel"]');

    expect(overlay).toBeTruthy();
    expect(panel?.textContent).toContain('Drawer content');
    expect(panel?.className).toContain('border-border');

    await act(async () => {
      overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onClose).toHaveBeenCalledTimes(2);

    await act(async () => root.unmount());
    host.remove();
  });

  it('does not render when closed', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DrawerLayout isOpen={false} onClose={() => undefined}>
          <p>Hidden drawer content</p>
        </DrawerLayout>,
      );
    });

    expect(host.children.length).toBe(0);

    await act(async () => root.unmount());
    host.remove();
  });
});
