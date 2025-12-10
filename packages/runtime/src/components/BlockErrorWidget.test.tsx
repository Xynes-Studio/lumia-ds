import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { BlockErrorWidget } from './BlockErrorWidget';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const flushEffects = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('BlockErrorWidget', () => {
  describe('basic rendering', () => {
    it('renders placeholder for invalid block', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<BlockErrorWidget blockId="block-1" />);
        await flushEffects();
      });

      expect(
        host.querySelector('[data-testid="block-error-widget"]'),
      ).not.toBeNull();

      await act(async () => root.unmount());
      host.remove();
    });

    it('displays block ID', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<BlockErrorWidget blockId="my-table-block" />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('my-table-block');

      await act(async () => root.unmount());
      host.remove();
    });

    it('displays block kind when provided', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<BlockErrorWidget blockId="block-1" blockKind="table" />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('table');

      await act(async () => root.unmount());
      host.remove();
    });

    it('shows default error message', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<BlockErrorWidget blockId="block-1" />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('failed to render');

      await act(async () => root.unmount());
      host.remove();
    });
  });

  describe('customization props', () => {
    it('supports custom message', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(
          <BlockErrorWidget blockId="block-1" message="Custom block error" />,
        );
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('Custom block error');

      await act(async () => root.unmount());
      host.remove();
    });

    it('renders children slot', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(
          <BlockErrorWidget blockId="block-1">
            <button>Reload Block</button>
          </BlockErrorWidget>,
        );
        await flushEffects();
      });

      expect(host.querySelector('button')?.textContent).toBe('Reload Block');

      await act(async () => root.unmount());
      host.remove();
    });
  });

  describe('styling', () => {
    it('applies error styling classes', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<BlockErrorWidget blockId="block-1" />);
        await flushEffects();
      });

      const widget = host.querySelector('[data-testid="block-error-widget"]');
      expect(widget?.className).toContain('border');

      await act(async () => root.unmount());
      host.remove();
    });

    it('includes data attributes for block info', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<BlockErrorWidget blockId="block-1" blockKind="form" />);
        await flushEffects();
      });

      const widget = host.querySelector('[data-testid="block-error-widget"]');
      expect(widget?.getAttribute('data-block-id')).toBe('block-1');
      expect(widget?.getAttribute('data-block-kind')).toBe('form');

      await act(async () => root.unmount());
      host.remove();
    });
  });
});
