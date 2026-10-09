import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from '../button/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../dialog/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

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

const SheetFixture = ({
  side,
  closeOnOverlayClick,
}: {
  side?: 'top' | 'right' | 'bottom' | 'left';
  closeOnOverlayClick?: boolean;
}) => (
  <Sheet closeOnOverlayClick={closeOnOverlayClick}>
    <SheetTrigger asChild>
      <Button type="button">Open drawer</Button>
    </SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Sheet title</SheetTitle>
        <SheetDescription>Sheet description</SheetDescription>
      </SheetHeader>
      <p>Sheet body</p>
      <SheetFooter>
        <Button variant="secondary">Cancel</Button>
        <Button>Apply</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

describe('Sheet', () => {
  it('rejects content and triggers used without their Sheet context', () => {
    expect(() => renderToString(<SheetContent>Body</SheetContent>)).toThrow(
      'SheetContent must be used within Sheet',
    );
    expect(() => renderToString(<SheetTrigger>Open</SheetTrigger>)).toThrow(
      'SheetTrigger must be used within Sheet',
    );
  });

  it('places its scrim and content above a full-screen editor layer', async () => {
    const { root, host } = createTestRoot();
    try {
      await act(async () => {
        root.render(
          <>
            <div className="fixed inset-0 z-50">Editor</div>
            <Sheet defaultOpen>
              <SheetContent>
                <SheetTitle>API panel</SheetTitle>
                <SheetDescription>Read-only API access</SheetDescription>
              </SheetContent>
            </Sheet>
          </>,
        );
      });
      expect(
        document
          .querySelector('[data-lumia-sheet-overlay]')
          ?.classList.contains('z-[200]'),
      ).toBe(true);
      expect(
        document
          .querySelector('[data-lumia-sheet-content]')
          ?.classList.contains('z-[200]'),
      ).toBe(true);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });

  it('keeps a nested dialog scrim and content above the parent sheet', async () => {
    const { root, host } = createTestRoot();
    try {
      await act(async () => {
        root.render(
          <Sheet defaultOpen>
            <SheetContent>
              <SheetTitle>Parent sheet</SheetTitle>
              <SheetDescription>Sheet description</SheetDescription>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button">Open nested dialog</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Nested dialog</DialogTitle>
                  <DialogDescription>Dialog description</DialogDescription>
                </DialogContent>
              </Dialog>
            </SheetContent>
          </Sheet>,
        );
      });
      const trigger = Array.from(document.querySelectorAll('button')).find(
        (button) => button.textContent === 'Open nested dialog',
      );
      await act(async () => trigger?.click());
      const sheet = document.querySelector('[data-lumia-sheet-content]');
      const overlay = document.querySelector('[data-lumia-dialog-overlay]');
      const dialog = document.querySelector('[data-lumia-dialog-content]');
      const layer = (element: Element | null) =>
        Number(element?.className.match(/z-\[(\d+)\]/)?.[1]);
      expect(layer(overlay)).toBeGreaterThanOrEqual(layer(sheet));
      expect(layer(dialog)).toBeGreaterThanOrEqual(layer(overlay));
      expect(
        sheet &&
          overlay &&
          Boolean(
            sheet.compareDocumentPosition(overlay) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ),
      ).toBe(true);
      expect(
        overlay &&
          dialog &&
          Boolean(
            overlay.compareDocumentPosition(dialog) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ),
      ).toBe(true);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });

  it('uses an optional translated close label without leaking it onto content', async () => {
    const { root, host } = createTestRoot();
    try {
      await act(async () => {
        root.render(
          <Sheet defaultOpen>
            <SheetContent closeLabel="Fermer">
              <SheetTitle>API panel</SheetTitle>
              <SheetDescription>Description</SheetDescription>
            </SheetContent>
          </Sheet>,
        );
      });
      expect(
        document
          .querySelector('button[aria-label="Fermer"]')
          ?.getAttribute('aria-label'),
      ).toBe('Fermer');
      expect(
        document
          .querySelector('[data-lumia-sheet-content]')
          ?.hasAttribute('closelabel'),
      ).toBe(false);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)(
    'uses a fade without sliding in reduced motion on the %s side',
    async (side) => {
      const { root, host } = createTestRoot();
      try {
        await act(async () => root.render(<SheetFixture side={side} />));
        await act(async () => host.querySelector('button')?.click());
        const content = document.querySelector('[data-lumia-sheet-content]');
        expect(
          content?.classList.contains('motion-reduce:transition-opacity'),
        ).toBe(true);
        expect(
          content?.classList.contains(
            'motion-reduce:data-[state=closed]:opacity-0',
          ),
        ).toBe(true);
        const axis = side === 'left' || side === 'right' ? 'x' : 'y';
        expect(
          content?.classList.contains(
            `motion-reduce:data-[state=closed]:translate-${axis}-0`,
          ),
        ).toBe(true);
      } finally {
        await act(async () => root.unmount());
        host.remove();
      }
    },
  );

  it('opens from trigger and closes with close button', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<SheetFixture />);
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toBe('Open drawer');
    expect(trigger?.hasAttribute('aria-controls')).toBe(false);

    await act(async () => {
      trigger?.focus();
      trigger?.click();
    });

    const overlay = document.body.querySelector('[data-lumia-sheet-overlay]');
    const content = document.body.querySelector('[data-lumia-sheet-content]');
    const labelId = content?.getAttribute('aria-labelledby');

    expect(overlay).toBeTruthy();
    expect(content?.getAttribute('role')).toBe('dialog');
    expect(content?.getAttribute('aria-modal')).toBe('true');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId ?? '')?.textContent).toBe(
      'Sheet title',
    );

    const closeButton = document.body.querySelector(
      '[aria-label="Close sheet"]',
    );

    await act(async () => {
      closeButton?.click();
    });
    await act(async () => {});

    const closedContent = document.body.querySelector(
      '[data-lumia-sheet-content]',
    );
    expect(closedContent).toBeTruthy();
    expect(closedContent?.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('closes on overlay click when allowed and ignores when disabled', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<SheetFixture />);
    });

    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.focus();
      trigger?.click();
    });

    const overlay = document.body.querySelector('[data-lumia-sheet-overlay]');
    expect(overlay).toBeTruthy();

    await act(async () => {
      overlay?.click();
    });
    await act(async () => {});

    const closedOverlay = document.body.querySelector(
      '[data-lumia-sheet-overlay]',
    );
    expect(closedOverlay).toBeTruthy();
    expect(closedOverlay?.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);

    const { root: root2, host: host2 } = createTestRoot();

    await act(async () => {
      root2.render(<SheetFixture closeOnOverlayClick={false} />);
    });

    const trigger2 = host2.querySelector('button');

    await act(async () => {
      trigger2?.focus();
      trigger2?.click();
    });

    const overlay2 = document.body.querySelector('[data-lumia-sheet-overlay]');
    expect(overlay2).toBeTruthy();

    await act(async () => {
      overlay2?.click();
    });
    await act(async () => {});

    const content2 = document.body.querySelector('[data-lumia-sheet-content]');
    expect(content2).toBeTruthy();

    await act(async () => {
      content2?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    await act(async () => {});

    const escapedContent = document.body.querySelector(
      '[data-lumia-sheet-content]',
    );
    expect(escapedContent).toBeTruthy();
    expect(escapedContent?.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger2);

    await act(async () => root2.unmount());
    document.body.removeChild(host2);
  });

  it('applies side positioning classes', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<SheetFixture side="left" />);
    });

    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.click();
    });

    const content = document.body.querySelector('[data-lumia-sheet-content]');

    expect(content?.getAttribute('data-lumia-sheet-side')).toBe('left');
    expect(content?.className.includes('left-0')).toBe(true);
    expect(content?.className.includes('data-[state=open]:translate-x-0')).toBe(
      true,
    );
    expect(
      content?.className.includes('data-[state=closed]:-translate-x-full'),
    ).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
