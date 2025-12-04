import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
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

  it('closes on overlay click and Escape press', async () => {
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
      overlay?.click();
    });
    await act(async () => {});

    expect(document.body.querySelector('[data-lumia-dialog-overlay]')).toBe(
      null,
    );
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
});
