import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './drawer';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  return { root, host };
};

describe('Drawer', () => {
  const flushAnimationFrames = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };

  it('renders open state and handles close actions', async () => {
    const { root, host } = createTestRoot();
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <Drawer open onOpenChange={onOpenChange} side="left">
          <div>Drawer body</div>
        </Drawer>,
      );
    });

    const content = document.body.querySelector('[data-lumia-drawer-content]');
    expect(content?.getAttribute('data-lumia-drawer-side')).toBe('left');
    expect(document.body.textContent).toContain('Drawer body');

    const closeButton = document.body.querySelector(
      '[aria-label="Close drawer"]',
    );
    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await act(async () => {
      root.render(
        <Drawer open onOpenChange={onOpenChange}>
          <div>Drawer body</div>
        </Drawer>,
      );
    });

    const overlay = document.body.querySelector('[data-lumia-drawer-overlay]');
    await act(async () => {
      overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await act(async () => root.unmount());
    host.remove();
  });

  it('closes on escape', async () => {
    const { root, host } = createTestRoot();
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <Drawer open onOpenChange={onOpenChange}>
          <div>Drawer body</div>
        </Drawer>,
      );
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);

    await act(async () => root.unmount());
    host.remove();
  });

  it('traps focus within drawer and focuses first element on open', async () => {
    const { root, host } = createTestRoot();
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <Drawer open onOpenChange={onOpenChange}>
          <button type="button" data-testid="drawer-action-one">
            Action one
          </button>
          <button type="button" data-testid="drawer-action-two">
            Action two
          </button>
        </Drawer>,
      );
    });

    await flushAnimationFrames();

    const closeButton = document.body.querySelector(
      '[aria-label="Close drawer"]',
    ) as HTMLButtonElement;
    const actionTwo = document.body.querySelector(
      '[data-testid="drawer-action-two"]',
    ) as HTMLButtonElement;

    expect(document.activeElement).toBe(closeButton);

    actionTwo.focus();
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    });
    expect(document.activeElement).toBe(closeButton);

    closeButton.focus();
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }),
      );
    });
    expect(document.activeElement).toBe(actionTwo);

    await act(async () => root.unmount());
    host.remove();
  });
});
