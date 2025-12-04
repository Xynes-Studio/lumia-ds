import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Toolbar } from './toolbar';
import { Button } from './button';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Toolbar component', () => {
  it('renders left and right groups with default alignment and gap', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Toolbar
          data-testid="toolbar"
          left={<Button data-testid="left-item">New</Button>}
          right={<Button data-testid="right-item">Export</Button>}
        />,
      );
    });

    const toolbar = host.querySelector('[data-testid="toolbar"]');
    expect(toolbar?.className).toContain('flex');
    expect(toolbar?.className).toContain('flex-col');
    expect(toolbar?.className).toContain('sm:flex-row');
    expect(toolbar?.className).toContain('sm:items-center');
    expect(toolbar?.className).toContain('sm:justify-between');
    expect(toolbar?.className).toContain('gap-3');
    expect(toolbar?.className).toContain('items-center');

    const leftGroup = host.querySelector(
      '[data-testid="left-item"]',
    )?.parentElement;
    expect(leftGroup?.className).toContain('flex-wrap');
    expect(leftGroup?.className).toContain('sm:flex-1');
    expect(leftGroup?.className).toContain('sm:min-w-0');
    expect(leftGroup?.className).toContain('gap-3');
    expect(leftGroup?.className).toContain('items-center');

    const rightGroup = host.querySelector(
      '[data-testid="right-item"]',
    )?.parentElement;
    expect(rightGroup?.className).toContain('flex-wrap');
    expect(rightGroup?.className).toContain('sm:justify-end');
    expect(rightGroup?.className).toContain('gap-3');
    expect(rightGroup?.className).toContain('items-center');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports custom alignment, gaps, and children content', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Toolbar
          data-testid="custom-toolbar"
          align="end"
          gap="lg"
          className="custom-toolbar"
          right={<span data-testid="right-only">Actions</span>}
        >
          <span data-testid="child-item">Filters</span>
        </Toolbar>,
      );
    });

    const toolbar = host.querySelector('[data-testid="custom-toolbar"]');
    expect(toolbar?.className).toContain('items-end');
    expect(toolbar?.className).toContain('gap-4');
    expect(toolbar?.className).toContain('custom-toolbar');

    const leftGroup = host.querySelector(
      '[data-testid="child-item"]',
    )?.parentElement;
    expect(leftGroup?.className).toContain('items-end');
    expect(leftGroup?.className).toContain('gap-4');

    const rightGroup = host.querySelector(
      '[data-testid="right-only"]',
    )?.parentElement;
    expect(rightGroup?.className).toContain('items-end');
    expect(rightGroup?.className).toContain('gap-4');
    expect(rightGroup?.className).toContain('sm:justify-end');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders only one group when right or left content is omitted', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Toolbar
          data-testid="single-toolbar"
          right={<span>Only right</span>}
        />,
      );
    });

    const toolbar = host.querySelector('[data-testid="single-toolbar"]');
    expect(toolbar?.className).toContain('flex-col');
    expect(toolbar?.className).toContain('sm:flex-row');

    const groups = toolbar?.querySelectorAll('div');
    expect(groups?.length).toBe(1);
    expect(groups?.[0].className).toContain('sm:justify-end');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
