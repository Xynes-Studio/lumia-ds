import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button/button';
import { ConfirmDialog, useConfirmDialog } from './confirm-dialog';

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

const findButtonByText = (text: string) =>
  Array.from(document.body.querySelectorAll('button')).find(
    (button) => button.textContent === text,
  );

describe('ConfirmDialog', () => {
  it('opens from trigger and closes on cancel', async () => {
    const { root, host } = createTestRoot();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <ConfirmDialog
          title="Delete project?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
          trigger={<Button type="button">Open confirm dialog</Button>}
        />,
      );
    });

    const trigger = host.querySelector('button');
    await act(async () => {
      trigger?.click();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(
      document.body.querySelector('[data-lumia-dialog-content]'),
    ).toBeTruthy();
    expect(findButtonByText('Delete')).toBeTruthy();
    expect(findButtonByText('Cancel')).toBeTruthy();

    const cancelButton = findButtonByText('Cancel');
    await act(async () => {
      cancelButton?.click();
    });
    await act(async () => {});

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector('[data-lumia-dialog-content]')).toBe(
      null,
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('auto focuses confirm and submits on Enter', async () => {
    const { root, host } = createTestRoot();
    const onConfirm = vi.fn();

    const HookedConfirmDialog = () => {
      const dialog = useConfirmDialog();

      return (
        <div>
          <Button type="button" onClick={dialog.openDialog}>
            Show dialog
          </Button>
          <ConfirmDialog
            {...dialog.dialogProps}
            title="Sign out?"
            description="You can sign back in anytime."
            confirmLabel="Sign out"
            cancelLabel="Stay signed in"
            onConfirm={onConfirm}
          />
        </div>
      );
    };

    await act(async () => {
      root.render(<HookedConfirmDialog />);
    });

    const trigger = host.querySelector('button');
    await act(async () => {
      trigger?.click();
    });

    const form = document.body.querySelector('form');
    const confirmButton = findButtonByText('Sign out');

    expect(confirmButton === document.activeElement).toBe(true);

    await act(async () => {
      form?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
    });
    await act(async () => {});

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[data-lumia-dialog-content]')).toBe(
      null,
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('closes on Escape without confirming', async () => {
    const { root, host } = createTestRoot();
    const onConfirm = vi.fn();

    await act(async () => {
      root.render(
        <ConfirmDialog
          defaultOpen
          title="Archive item?"
          description="You can restore it later."
          onConfirm={onConfirm}
        />,
      );
    });

    const content = document.body.querySelector('[data-lumia-dialog-content]');
    expect(content).toBeTruthy();

    await act(async () => {
      content?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    await act(async () => {});

    expect(onConfirm).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-lumia-dialog-content]')).toBe(
      null,
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
