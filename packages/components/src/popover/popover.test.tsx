import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Button } from '../button/button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })[
  'IS_REACT_ACT_ENVIRONMENT'
] = true;

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

const flushTimers = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
};

describe('Popover', () => {
  it('renders content with card styling when forced open', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Popover open>
          <PopoverTrigger asChild>
            <Button type="button" variant="secondary">
              Trigger
            </Button>
          </PopoverTrigger>
          <PopoverContent forceMount side="right">
            Popover text
          </PopoverContent>
        </Popover>,
      );
    });

    await flushTimers();

    const content = document.body.querySelector('[data-lumia-popover-content]');
    const className = content?.getAttribute('class') ?? '';

    expect(host.textContent).toContain('Trigger');
    expect(content?.textContent).toContain('Popover text');
    expect(className).toContain('border');
    expect(className).toContain('bg-background');
    expect(className).toContain('shadow-lg');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('toggles aria-expanded and visibility when trigger is clicked (uncontrolled)', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Popover>
          <PopoverTrigger asChild>
            <button type="button">Click me</button>
          </PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>,
      );
    });

    const trigger = host.querySelector('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const openedContent = document.body.querySelector(
      '[data-lumia-popover-content]',
    );
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(openedContent).not.toBeNull();

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(
      document.body.querySelector('[data-lumia-popover-content]'),
    ).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
