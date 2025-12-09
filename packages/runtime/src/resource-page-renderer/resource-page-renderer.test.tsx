import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { ResourcePageRenderer } from './resource-page-renderer';
import type { DataFetcher, PageSchema, ResourceConfig } from '../index';

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

const baseResource: ResourceConfig = {
  id: 'users',
  pages: { list: 'users-list' },
};

const basePage: PageSchema = { id: 'users-list', layout: 'stack', blocks: [] };

describe('ResourcePageRenderer', () => {
  it('denies access when canAccess returns false', async () => {
    const { host, root } = createTestRoot();
    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue(baseResource),
      getPageSchema: vi.fn().mockResolvedValue(basePage),
      canAccess: vi.fn().mockResolvedValue(false),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.querySelector('[role="alert"]')?.textContent ?? '').toContain(
      'do not have access',
    );

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows an error when the resource or page is missing', async () => {
    const { host, root } = createTestRoot();
    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue({
        ...baseResource,
        pages: { list: 'missing-page' },
      }),
      getPageSchema: vi.fn().mockResolvedValue(undefined),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.textContent ?? '').toContain(
      "Page 'missing-page' was not found",
    );

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders an error when the resource is missing', async () => {
    const { host, root } = createTestRoot();
    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue(undefined),
      getPageSchema: vi.fn(),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="ghost"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.textContent ?? '').toContain("Resource 'ghost' was not found");

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders blocks inside the admin shell layout', async () => {
    const { host, root } = createTestRoot();
    const adminPage: PageSchema = {
      id: 'users-list',
      layout: 'admin-shell',
      blocks: [
        {
          id: 'table',
          kind: 'table',
          dataSourceId: 'users',
          props: {
            columns: [{ key: 'name', label: 'Name' }],
          },
        },
      ],
    };

    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue(baseResource),
      getPageSchema: vi.fn().mockResolvedValue(adminPage),
      getDataSource: vi.fn().mockResolvedValue({
        records: [{ name: 'Aster' }],
      }),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.querySelector('h1')?.textContent).toContain('users');
    expect(host.textContent ?? '').toContain('Aster');
    expect(host.querySelector('[data-slot="resource-blocks"]')).not.toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders drawer layout with grid placements and data sources', async () => {
    const { host, root } = createTestRoot();
    const drawerPage: PageSchema = {
      id: 'users-drawer',
      layout: 'drawer',
      grid: {
        columns: 2,
        gap: 8,
        placements: [{ blockId: 'table', column: 2, row: 3, columnSpan: 1 }],
      },
      blocks: [
        {
          id: 'table',
          kind: 'table',
          dataSourceId: 'users',
          props: {
            columns: [{ key: 'name', label: 'Name' }],
          },
        },
      ],
    };

    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue({
        ...baseResource,
        pages: { list: 'users-drawer' },
      }),
      getPageSchema: vi.fn().mockResolvedValue(drawerPage),
      getDataSource: vi.fn().mockResolvedValue({ records: [{ name: 'Nova' }] }),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    const grid = host.querySelector('[data-slot="resource-blocks"]');
    expect(grid?.getAttribute('class')).toContain('grid');

    const block = host.querySelector('[data-block-id="table"]') as HTMLElement;
    expect(block?.style.gridColumn).toBe('2 / span 1');
    expect(block?.style.gridRow).toBe('3 / span 1');
    expect(host.textContent ?? '').toContain('Nova');

    await act(async () => root.unmount());
    host.remove();
  });

  it('uses edit page fallback for update screens', async () => {
    const { host, root } = createTestRoot();
    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue({
        id: 'users',
        pages: { edit: 'edit-page' },
      }),
      getPageSchema: vi.fn().mockResolvedValue({
        id: 'edit-page',
        layout: 'stack',
        blocks: [],
      }),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="update"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(fetcher.getPageSchema).toHaveBeenCalledWith('edit-page');

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders detail and form blocks with data sources even without getDataSource', async () => {
    const { host, root } = createTestRoot();
    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue({
        id: 'orders',
        pages: { detail: 'orders-detail' },
      }),
      getPageSchema: vi.fn().mockResolvedValue({
        id: 'orders-detail',
        layout: 'stack',
        blocks: [
          {
            id: 'detail',
            kind: 'detail',
            props: {
              record: { id: 'o-1', total: 25 },
              fields: [
                { key: 'id', label: 'ID' },
                { key: 'total', label: 'Total' },
              ],
            },
          },
          {
            id: 'form',
            kind: 'form',
            props: {
              mode: 'create',
              resource: {
                id: 'orders',
                fields: [{ name: 'note', label: 'Note' }],
              },
              dataFetcher: { create: vi.fn() },
            },
          },
        ],
      }),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="orders"
          screen="detail"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.textContent ?? '').toContain('o-1');
    expect(host.querySelector('form')).not.toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows an error message when fetcher throws', async () => {
    const { host, root } = createTestRoot();
    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockRejectedValue(new Error('boom')),
      getPageSchema: vi.fn(),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.textContent ?? '').toContain('boom');

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows validation error when page config is invalid', async () => {
    const { host, root } = createTestRoot();
    // Invalid page: missing required 'layout' field
    const invalidPage = {
      id: 'invalid-page',
      blocks: [],
    };

    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue(baseResource),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPageSchema: vi.fn().mockResolvedValue(invalidPage as any),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    expect(host.textContent ?? '').toContain('Configuration validation failed');

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows validation error when resource config is invalid', async () => {
    const { host, root } = createTestRoot();
    // Invalid resource: missing required 'id' field
    const invalidResource = {
      pages: { list: 'users-list' },
    };

    const fetcher: DataFetcher = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getResourceConfig: vi.fn().mockResolvedValue(invalidResource as any),
      getPageSchema: vi.fn().mockResolvedValue(basePage),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    expect(host.textContent ?? '').toContain('Configuration validation failed');

    await act(async () => root.unmount());
    host.remove();
  });

  it('does not crash when page config has invalid blocks', async () => {
    const { host, root } = createTestRoot();
    // Invalid page: block has invalid 'kind'
    const invalidPage = {
      id: 'users-list',
      layout: 'stack',
      blocks: [{ id: 'block-1', kind: 'invalid-kind' }],
    };

    const fetcher: DataFetcher = {
      getResourceConfig: vi.fn().mockResolvedValue(baseResource),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPageSchema: vi.fn().mockResolvedValue(invalidPage as any),
    };

    await act(async () => {
      root.render(
        <ResourcePageRenderer
          resourceName="users"
          screen="list"
          fetcher={fetcher}
        />,
      );
      await flushEffects();
    });

    // Should show validation error, not crash
    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    expect(host.textContent ?? '').toContain('Configuration validation failed');

    await act(async () => root.unmount());
    host.remove();
  });
});
