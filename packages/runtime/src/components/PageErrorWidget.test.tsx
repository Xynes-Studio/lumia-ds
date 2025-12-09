import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PageErrorWidget } from './PageErrorWidget';
import type { PageConfigError } from '../validation';

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

describe('PageErrorWidget', () => {
  const mockError: PageConfigError = {
    type: 'page-config-error',
    pageId: 'test-page',
    issues: [
      { path: ['layout'], message: 'Required', code: 'invalid_type' },
      {
        path: ['blocks', 0, 'kind'],
        message: 'Invalid value',
        code: 'invalid_enum_value',
      },
    ],
  };

  describe('basic rendering', () => {
    it('renders with page config error', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      expect(
        host.querySelector('[data-testid="page-error-widget"]'),
      ).not.toBeNull();
      expect(host.querySelector('[role="alert"]')).not.toBeNull();

      await act(async () => root.unmount());
      host.remove();
    });

    it('displays default error title', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('Configuration Error');

      await act(async () => root.unmount());
      host.remove();
    });

    it('displays default error description with page ID', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('test-page');
      expect(host.textContent ?? '').toContain('page configuration is invalid');

      await act(async () => root.unmount());
      host.remove();
    });
  });

  describe('customization props', () => {
    it('supports custom title', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(
          <PageErrorWidget error={mockError} title="Custom Error Title" />,
        );
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('Custom Error Title');

      await act(async () => root.unmount());
      host.remove();
    });

    it('supports custom description', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(
          <PageErrorWidget
            error={mockError}
            description="Custom error message"
          />,
        );
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('Custom error message');

      await act(async () => root.unmount());
      host.remove();
    });

    it('renders children slot', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(
          <PageErrorWidget error={mockError}>
            <button>Retry</button>
          </PageErrorWidget>,
        );
        await flushEffects();
      });

      expect(host.querySelector('button')?.textContent).toBe('Retry');

      await act(async () => root.unmount());
      host.remove();
    });
  });

  describe('development mode details', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      /* eslint-disable no-undef */
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      /* eslint-disable no-undef */
      process.env.NODE_ENV = originalEnv;
    });

    it('shows detailed issues in development mode', async () => {
      /* eslint-disable no-undef */
      process.env.NODE_ENV = 'development';

      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('layout');
      expect(host.textContent ?? '').toContain('Required');

      await act(async () => root.unmount());
      host.remove();
    });

    it('shows issue paths in development mode', async () => {
      /* eslint-disable no-undef */
      process.env.NODE_ENV = 'development';

      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      expect(host.textContent ?? '').toContain('blocks.0.kind');

      await act(async () => root.unmount());
      host.remove();
    });

    it('hides detailed issues in production mode', async () => {
      /* eslint-disable no-undef */
      process.env.NODE_ENV = 'production';

      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      // Should not show detailed paths in production
      expect(host.textContent ?? '').not.toContain('blocks.0.kind');

      await act(async () => root.unmount());
      host.remove();
    });
  });

  describe('accessibility', () => {
    it('has proper role="alert" for screen readers', async () => {
      const { host, root } = createTestRoot();

      await act(async () => {
        root.render(<PageErrorWidget error={mockError} />);
        await flushEffects();
      });

      expect(host.querySelector('[role="alert"]')).not.toBeNull();

      await act(async () => root.unmount());
      host.remove();
    });
  });
});
