import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Drawer, DrawerHeader, DrawerTitle } from './drawer';

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
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    onOpenChange.mockClear();

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
    expect(onOpenChange).toHaveBeenCalledTimes(1);

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

describe('Drawer localization', () => {
  it('uses a consumer-provided close label for both accessible name and screen-reader text', async () => {
    const { root, host } = createTestRoot();
    const onOpenChange = vi.fn();
    await act(async () => {
      root.render(
        <Drawer
          open
          onOpenChange={onOpenChange}
          closeLabel="[CClloossee mmeettaaddaattaa]"
          ariaLabel="[CCoonntteenntt ppaanneellss]"
        >
          <p>Body</p>
        </Drawer>,
      );
    });
    try {
      const button = document.body.querySelector(
        '[aria-label="[CClloossee mmeettaaddaattaa]"]',
      );
      expect(button).not.toBeNull();
      expect(
        document.body
          .querySelector('[role="dialog"]')
          ?.getAttribute('aria-label'),
      ).toBe('[CCoonntteenntt ppaanneellss]');
      expect(button?.textContent).toContain('[CClloossee mmeettaaddaattaa]');
      expect(
        document.body.querySelector('[aria-label="Close drawer"]'),
      ).toBeNull();
      await act(async () => {
        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });
});

describe('Drawer labelled keyboard and lifecycle regressions', () => {
  it('restores the supplied trigger and removes the closed drawer after its transition', async () => {
    const { root, host } = createTestRoot();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const onOpenChange = vi.fn();
    try {
      await act(async () =>
        root.render(
          <Drawer
            open
            onOpenChange={onOpenChange}
            restoreFocusElement={trigger}
            ariaLabel="Metadata"
            closeLabel="Close metadata"
          >
            <DrawerHeader>
              <DrawerTitle>Metadata</DrawerTitle>
            </DrawerHeader>
            <button type="button">Customize</button>
          </Drawer>,
        ),
      );
      const modal = document.body.querySelector('[role="dialog"]');
      expect(modal?.getAttribute('aria-label')).toBe('Metadata');
      expect(modal?.querySelector('h2')?.textContent).toBe('Metadata');
      await act(async () =>
        root.render(
          <Drawer
            open={false}
            onOpenChange={onOpenChange}
            restoreFocusElement={trigger}
          >
            <p>Body</p>
          </Drawer>,
        ),
      );
      expect(document.activeElement).toBe(trigger);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 320));
      });
      expect(
        document.body.querySelector('[data-lumia-drawer-root]'),
      ).toBeNull();
    } finally {
      await act(async () => root.unmount());
      host.remove();
      trigger.remove();
    }
  });
  it('keeps translated close semantics when overlay dismissal is disabled', async () => {
    const { root, host } = createTestRoot();
    const onOpenChange = vi.fn();
    try {
      await act(async () =>
        root.render(
          <Drawer
            open
            onOpenChange={onOpenChange}
            closeOnOverlayClick={false}
            closeLabel="Close metadata"
          >
            <p>Body</p>
          </Drawer>,
        ),
      );
      await act(async () => {
        document.body
          .querySelector('[data-lumia-drawer-overlay]')
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown' }),
        );
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      expect(onOpenChange).toHaveBeenCalledOnce();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  });
  it('recovers keyboard focus from outside and excludes hidden/disabled actions', async () => {
    const { root, host } = createTestRoot();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    try {
      await act(async () =>
        root.render(
          <Drawer open onOpenChange={vi.fn()} closeLabel="Close metadata">
            <button type="button" aria-hidden="true">
              Hidden
            </button>
            <button type="button" disabled>
              Disabled
            </button>
            <button type="button" data-last>
              Last action
            </button>
          </Drawer>,
        ),
      );
      const close = document.body.querySelector(
        '[aria-label="Close metadata"]',
      );
      const last = document.body.querySelector('[data-last]');
      if (
        !(close instanceof HTMLButtonElement) ||
        !(last instanceof HTMLButtonElement)
      )
        throw new Error('Expected labelled drawer actions');
      outside.focus();
      await act(async () => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Tab',
            shiftKey: true,
            cancelable: true,
          }),
        );
      });
      expect(document.activeElement).toBe(last);
      outside.focus();
      await act(async () => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }),
        );
      });
      expect(document.activeElement).toBe(close);
      last.focus();
      const reverse = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        cancelable: true,
      });
      await act(async () => {
        window.dispatchEvent(reverse);
      });
      expect(reverse.defaultPrevented).toBe(false);
      await act(async () =>
        root.render(
          <Drawer
            open={false}
            onOpenChange={vi.fn()}
            closeLabel="Close metadata"
          >
            <p>Closed</p>
          </Drawer>,
        ),
      );
      expect(document.activeElement).toBe(outside);
    } finally {
      await act(async () => root.unmount());
      host.remove();
      outside.remove();
    }
  });
  it.each(['bottom', 'top'] as const)(
    'preserves labelled %s placement through opening animation',
    async (side) => {
      const { root, host } = createTestRoot();
      try {
        await act(async () =>
          root.render(
            <Drawer
              open
              onOpenChange={vi.fn()}
              side={side}
              ariaLabel="Metadata"
              closeLabel="Close metadata"
            >
              <p>Body</p>
            </Drawer>,
          ),
        );
        const content = document.body.querySelector(
          '[data-lumia-drawer-content]',
        );
        if (!(content instanceof HTMLElement))
          throw new Error('Expected drawer content');
        expect(content.dataset.lumiaDrawerSide).toBe(side);
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 40));
        });
        expect(content.style.transform).toBe('translate3d(0, 0, 0)');
      } finally {
        await act(async () => root.unmount());
        host.remove();
      }
    },
  );
});
