import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { Button } from '../button/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

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

const DialogFixture = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button type="button">Open dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog title</DialogTitle>
        <DialogDescription>Dialog description</DialogDescription>
      </DialogHeader>
      <p>Dialog body</p>
      <DialogFooter>
        <Button variant="secondary">Cancel</Button>
        <Button>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

describe('Dialog', () => {
  it('forwards object refs through DialogTrigger', async () => {
    const { root, host } = createTestRoot();
    const triggerRef = createRef<HTMLButtonElement>();

    await act(async () => {
      root.render(
        <Dialog>
          <DialogTrigger ref={triggerRef} asChild>
            <Button type="button">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
    });

    const trigger = host.querySelector('button');
    expect(triggerRef.current).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('forwards function refs through DialogTrigger', async () => {
    const { root, host } = createTestRoot();
    const triggerRef = vi.fn();

    await act(async () => {
      root.render(
        <Dialog>
          <DialogTrigger ref={triggerRef} asChild>
            <Button type="button">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
    });

    const trigger = host.querySelector('button');
    expect(triggerRef).toHaveBeenCalledWith(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('opens from trigger and closes with close button', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<DialogFixture />);
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toBe('Open dialog');
    expect(trigger?.hasAttribute('aria-controls')).toBe(false);

    await act(async () => {
      trigger?.focus();
      trigger?.click();
    });

    const overlay = document.body.querySelector('[data-lumia-dialog-overlay]');
    const content = document.body.querySelector('[data-lumia-dialog-content]');
    const labelId = content?.getAttribute('aria-labelledby');

    expect(overlay).toBeTruthy();
    expect(content?.getAttribute('role')).toBe('dialog');
    expect(content?.getAttribute('aria-modal')).toBe('true');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId ?? '')?.textContent).toBe(
      'Dialog title',
    );

    const closeButton = document.body.querySelector(
      '[aria-label="Close dialog"]',
    );

    await act(async () => {
      closeButton?.click();
    });
    await act(async () => {});

    expect(document.body.querySelector('[data-radix-dialog-content]')).toBe(
      null,
    );
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('closes on overlay pointer down and Escape press', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<DialogFixture />);
    });

    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.focus();
      trigger?.click();
    });

    const overlay = document.body.querySelector('[data-lumia-dialog-overlay]');
    expect(overlay).toBeTruthy();

    await act(async () => {
      overlay?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, button: 0 }),
      );
      overlay?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, button: 0 }),
      );
    });

    await waitFor(() => {
      expect(document.body.querySelector('[data-lumia-dialog-overlay]')).toBe(
        null,
      );
    });
    expect(document.activeElement).toBe(trigger);

    await act(async () => {
      trigger?.focus();
      trigger?.click();
    });

    const content = document.body.querySelector('[data-lumia-dialog-content]');
    expect(content).toBeTruthy();

    await act(async () => {
      content?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    await act(async () => {});

    expect(document.body.querySelector('[data-lumia-dialog-content]')).toBe(
      null,
    );
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('uses a darker theme-aware overlay backdrop', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<DialogFixture />);
    });

    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.click();
    });

    const overlay = document.body.querySelector(
      '[data-lumia-dialog-overlay]',
    ) as HTMLElement | null;
    expect(overlay?.style.backgroundColor).toBe('rgba(9, 9, 11, 0.78)');

    await act(async () => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    await waitFor(() => {
      expect(overlay?.style.backgroundColor).toBe('rgba(0, 0, 0, 0.82)');
    });

    document.documentElement.removeAttribute('data-theme');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders the overlay and content above transient editor chrome layers', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<DialogFixture />);
    });

    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.click();
    });

    const overlay = document.body.querySelector(
      '[data-lumia-dialog-overlay]',
    ) as HTMLElement | null;
    const content = document.body.querySelector(
      '[data-lumia-dialog-content]',
    ) as HTMLElement | null;

    expect(overlay?.className).toContain('z-[200]');
    expect(content?.className).toContain('z-[210]');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('falls back to the dark html class when data-theme is absent', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<DialogFixture />);
    });

    document.documentElement.classList.add('dark');
    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.click();
    });

    const overlay = document.body.querySelector(
      '[data-lumia-dialog-overlay]',
    ) as HTMLElement | null;
    expect(overlay?.style.backgroundColor).toBe('rgba(0, 0, 0, 0.82)');

    document.documentElement.classList.remove('dark');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
