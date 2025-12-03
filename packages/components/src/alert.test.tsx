import { act } from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Alert } from './alert';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Alert component', () => {
  it('renders info variant with status role by default', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Alert
          title="Notice"
          description="Inline alerts keep users informed."
        />,
      );
    });

    const alert = host.querySelector('[role="status"]');
    expect(alert?.textContent).toContain('Notice');
    expect(alert?.className).toContain('bg-blue-50');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('can be dismissed in uncontrolled mode', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Alert
          closable
          title="Closable alert"
          description="Click the close button to hide me."
        />,
      );
    });

    const closeButton = host.querySelector(
      'button[aria-label="Dismiss alert"]',
    ) as HTMLButtonElement | null;
    expect(closeButton).toBeTruthy();

    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(host.querySelector('[role="status"]')).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports controlled open state', async () => {
    const ControlledAlert = () => {
      const [open, setOpen] = useState(true);

      return (
        <div>
          <Alert
            variant="warning"
            title="Review changes"
            description="Double-check your inputs before continuing."
            open={open}
            onOpenChange={setOpen}
            closable
          />
          <button
            type="button"
            data-testid="reopen"
            onClick={() => setOpen(true)}
          >
            Reopen
          </button>
        </div>
      );
    };

    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<ControlledAlert />);
    });

    const getAlert = () => host.querySelector('[role="alert"]');
    expect(getAlert()).toBeTruthy();

    const closeButton = host.querySelector(
      'button[aria-label="Dismiss alert"]',
    ) as HTMLButtonElement | null;

    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(getAlert()).toBeNull();

    const reopenButton = host.querySelector(
      '[data-testid="reopen"]',
    ) as HTMLButtonElement | null;
    await act(async () => {
      reopenButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(getAlert()).toBeTruthy();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
