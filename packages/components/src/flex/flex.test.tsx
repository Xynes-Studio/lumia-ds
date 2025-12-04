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

  it('handles responsive props, sizing helpers, and visibility', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <Flex
          data-testid="responsive-flex"
          direction={{ base: 'col', md: 'row' }}
          align={{ base: 'start', md: 'center' }}
          justify={{ md: 'between' }}
          wrap={{ base: 'wrap', xl: 'nowrap' }}
          gap={{ base: 'xs', md: 'lg' }}
          flex="1"
          shrink={{ md: 0 }}
          hiddenUntil="md"
        >
          Responsive flex
        </Flex>,
      );
    });

    const flex = host.querySelector('[data-testid="responsive-flex"]');
    expect(flex?.className).toContain('hidden');
    expect(flex?.className).toContain('md:flex');
    expect(flex?.className).toContain('flex-col');
    expect(flex?.className).toContain('md:flex-row');
    expect(flex?.className).toContain('items-start');
    expect(flex?.className).toContain('md:items-center');
    expect(flex?.className).toContain('justify-between');
    expect(flex?.className).toContain('flex-wrap');
    expect(flex?.className).toContain('xl:flex-nowrap');
    expect(flex?.className).toContain('gap-2');
    expect(flex?.className).toContain('md:gap-6');
    expect(flex?.className).toContain('flex-1');
    expect(flex?.className).toContain('md:shrink-0');

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
          inline
          aria-label="layout-section"
          data-testid="flex"
        >
          Baseline
        </Flex>,
      );
    });

    const flex = host.querySelector('section[data-testid="flex"]');
    expect(flex?.getAttribute('aria-label')).toBe('layout-section');
    expect(flex?.className).toContain('inline-flex');
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
