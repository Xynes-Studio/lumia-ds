import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Button } from '../button/button';
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

    expect(document.body.querySelector('[data-lumia-sheet-content]')).toBe(
      null,
    );
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

    expect(document.body.querySelector('[data-lumia-sheet-overlay]')).toBe(
      null,
    );
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

    expect(document.body.querySelector('[data-lumia-sheet-content]')).toBe(
      null,
    );
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
    expect(content?.className.includes('-translate-x-full')).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
