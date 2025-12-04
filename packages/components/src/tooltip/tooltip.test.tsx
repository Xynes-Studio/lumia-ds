import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Button } from '../button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

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

const flushTimers = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
};

describe('Tooltip', () => {
  it('renders content with design tokens when open', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <TooltipProvider delayDuration={0}>
          <Tooltip open>
            <TooltipTrigger asChild>
              <Button type="button" variant="secondary">
                Trigger
              </Button>
            </TooltipTrigger>
            <TooltipContent forceMount side="right">
              Tooltip text
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
    });

    await flushTimers();

    const content = document.body.querySelector('[data-lumia-tooltip-content]');
    const className = content?.getAttribute('class') ?? '';

    expect(content?.textContent).toContain('Tooltip text');
    expect(content?.getAttribute('role')).toBe('tooltip');
    expect(className).toContain('bg-foreground');
    expect(className).toContain('text-background');
    expect(className).toContain('text-xs');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('opens on hover/focus and closes on leave/blur', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button">Hover me</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toBe('Hover me');

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
    });
    await flushTimers();

    const hoveredContent = document.body.querySelector(
      '[data-lumia-tooltip-content]',
    );
    expect(hoveredContent).not.toBeNull();
    expect(['delayed-open', 'instant-open']).toContain(
      hoveredContent?.getAttribute('data-state'),
    );

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointerout', {
          bubbles: true,
          relatedTarget: document.body,
          pointerType: 'mouse',
        }),
      );
    });
    await flushTimers();

    expect(
      document.body.querySelector('[data-lumia-tooltip-content]'),
    ).toBeNull();

    await act(async () => {
      trigger?.focus();
    });
    await flushTimers();

    const focusedContent = document.body.querySelector(
      '[data-lumia-tooltip-content]',
    );
    expect(focusedContent).not.toBeNull();
    expect(['delayed-open', 'instant-open']).toContain(
      focusedContent?.getAttribute('data-state'),
    );

    await act(async () => {
      trigger?.blur();
    });
    await flushTimers();

    expect(
      document.body.querySelector('[data-lumia-tooltip-content]'),
    ).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
