import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { createRoot } from 'react-dom/client';
import { Flex } from './flex';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Flex component', () => {
  it('renders with default props', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Flex data-testid="flex">
          <span>Child</span>
        </Flex>,
      );
    });

    const flex = host.querySelector('[data-testid="flex"]');
    expect(flex?.className).toContain('flex');
    expect(flex?.className).toContain('flex-row');
    expect(flex?.className).toContain('items-stretch');
    expect(flex?.className).toContain('justify-start');
    expect(flex?.className).toContain('flex-nowrap');
    expect(flex?.className).toContain('gap-0');
    expect(flex?.tagName.toLowerCase()).toBe('div');
    expect(flex?.textContent).toContain('Child');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies layout props and gap tokens', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Flex
          direction="col"
          align="center"
          justify="between"
          wrap="wrap-reverse"
          gap="md"
          className="custom-flex"
          data-testid="flex"
        >
          Content
        </Flex>,
      );
    });

    const flex = host.querySelector('[data-testid="flex"]');
    expect(flex?.className).toContain('flex-col');
    expect(flex?.className).toContain('items-center');
    expect(flex?.className).toContain('justify-between');
    expect(flex?.className).toContain('flex-wrap-reverse');
    expect(flex?.className).toContain('gap-4');
    expect(flex?.className).toContain('custom-flex');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports polymorphic rendering and all alignment options', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Flex
          as="section"
          direction="row-reverse"
          align="baseline"
          justify="around"
          wrap="wrap"
          gap="xl"
          aria-label="layout-section"
          data-testid="flex"
        >
          Baseline
        </Flex>,
      );
    });

    const flex = host.querySelector('section[data-testid="flex"]');
    expect(flex?.getAttribute('aria-label')).toBe('layout-section');
    expect(flex?.className).toContain('flex-row-reverse');
    expect(flex?.className).toContain('items-baseline');
    expect(flex?.className).toContain('justify-around');
    expect(flex?.className).toContain('flex-wrap');
    expect(flex?.className).toContain('gap-8');
    expect(flex?.textContent).toContain('Baseline');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
