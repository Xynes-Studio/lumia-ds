import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { ToastProvider, useToast } from './toast';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const ToastHarness = () => {
  const { show } = useToast();

  return (
    <div className="flex gap-2">
      <button
        id="trigger-success"
        onClick={() =>
          show({
            title: 'Saved',
            description: 'Profile updated successfully.',
            variant: 'success',
          })
        }
      >
        Launch success toast
      </button>
      <button
        id="trigger-error"
        onClick={() =>
          show({
            title: 'Error',
            description: 'Something went wrong.',
            variant: 'error',
          })
        }
      >
        Launch error toast
      </button>
    </div>
  );
};

describe('ToastProvider and useToast', () => {
  it('shows a toast when the hook is invoked', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <ToastProvider>
          <ToastHarness />
        </ToastProvider>,
      );
    });

    const trigger = host.querySelector<HTMLButtonElement>('#trigger-success');
    expect(trigger).toBeTruthy();

    await act(async () => trigger?.click());

    const toasts = document.querySelectorAll('[data-lumia-toast]');
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.textContent).toContain('Profile updated successfully.');
    expect(toasts[0]?.getAttribute('role')).toBe('status');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('stacks toasts up to the configured limit and uses alert role for errors', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <ToastProvider maxVisible={2}>
          <ToastHarness />
        </ToastProvider>,
      );
    });

    const successTrigger =
      host.querySelector<HTMLButtonElement>('#trigger-success');
    const errorTrigger =
      host.querySelector<HTMLButtonElement>('#trigger-error');

    await act(async () => {
      successTrigger?.click();
      successTrigger?.click();
      errorTrigger?.click();
    });

    const toasts = document.querySelectorAll('[data-lumia-toast]');
    expect(toasts.length).toBe(2);
    expect(toasts[toasts.length - 1]?.getAttribute('role')).toBe('alert');

    await act(async () => {
      (
        toasts[0]?.querySelector('[aria-label="Dismiss notification"]') as
          | HTMLButtonElement
          | undefined
      )?.click();
    });

    expect(document.querySelectorAll('[data-lumia-toast]').length).toBe(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
