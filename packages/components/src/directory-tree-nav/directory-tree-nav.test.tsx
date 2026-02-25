import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryTreeNav, type DirectoryTreeNode } from './directory-tree-nav';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

const fixture: DirectoryTreeNode[] = [
  {
    id: 'blogs',
    label: 'Blogs',
    children: [{ id: 'guides', label: 'Guides' }],
  },
  { id: 'docs', label: 'Docs' },
];

describe('DirectoryTreeNav', () => {
  it('renders root link and nested items', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          rootActive
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
        />,
      );
    });

    const rootLink = host.querySelector(
      '[data-testid="directory-tree-root-link"]',
    );
    expect(rootLink?.getAttribute('aria-current')).toBe('page');
    expect(
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.getAttribute('aria-current'),
    ).toBeNull();
    expect(host.textContent).toContain('Blogs');
    expect(host.textContent).toContain('Guides');
    expect(
      host.querySelector('[data-testid^="directory-tree-node-toggle-"]'),
    ).toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });

  it('normalizes root directory creation and rejects duplicate sibling names', async () => {
    const { host, root } = createTestRoot();
    const onCreateDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={[]}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={onCreateDirectory}
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-root"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = host.querySelector(
      'input[data-testid="directory-tree-composer-input"]',
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();

    await act(async () => {
      if (!input) return;
      input.value = ' blogs ';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      if (!input) return;
      input.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      );
    });

    expect(onCreateDirectory).not.toHaveBeenCalled();
    expect(
      host.querySelector('[data-testid="directory-tree-composer-error"]')
        ?.textContent,
    ).toContain('already exists');

    await act(async () => {
      if (!input) return;
      input.value = '  New folder ';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      if (!input) return;
      input.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      );
    });

    expect(onCreateDirectory).toHaveBeenCalledWith({
      parentId: null,
      name: 'New folder',
    });

    await act(async () => root.unmount());
    host.remove();
  });

  it('creates nested directories under the selected parent and supports escape cancel', async () => {
    const { host, root } = createTestRoot();
    const onCreateDirectory = vi.fn();
    const onExpandedIdsChange = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={onExpandedIdsChange}
          onCreateDirectory={onCreateDirectory}
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-blogs"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = host.querySelector(
      'input[data-testid="directory-tree-composer-input"]',
    ) as HTMLInputElement | null;

    await act(async () => {
      if (!input) return;
      input.value = 'How to';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      if (!input) return;
      input.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      );
    });

    expect(onCreateDirectory).toHaveBeenCalledWith({
      parentId: 'blogs',
      name: 'How to',
    });
    expect(onExpandedIdsChange).not.toHaveBeenCalledWith([]);

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-root"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const cancelInput = host.querySelector(
      'input[data-testid="directory-tree-composer-input"]',
    ) as HTMLInputElement | null;
    expect(cancelInput).toBeTruthy();

    await act(async () => {
      cancelInput?.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      );
    });

    expect(
      host.querySelector('[data-testid="directory-tree-composer-input"]'),
    ).toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });

  it('calls navigate callback from root link and expands collapsed nodes from label click', async () => {
    const { host, root } = createTestRoot();
    const onNavigate = vi.fn();
    const onExpandedIdsChange = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={[]}
          onExpandedIdsChange={onExpandedIdsChange}
          onCreateDirectory={vi.fn()}
          onNavigate={onNavigate}
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-root-link"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onNavigate).toHaveBeenCalledWith('/dashboard/acme');

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onExpandedIdsChange).toHaveBeenCalledWith(['blogs']);

    await act(async () => root.unmount());
    host.remove();
  });

  it('keeps typing stable and toggles parent expansion from row click', async () => {
    const { host, root } = createTestRoot();
    const onExpandedIdsChange = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={[]}
          onExpandedIdsChange={onExpandedIdsChange}
          onCreateDirectory={vi.fn()}
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-root"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = host.querySelector(
      'input[data-testid="directory-tree-composer-input"]',
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();

    await act(async () => {
      if (!input) return;
      input.value = 'B';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.value = 'Bl';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.value = 'Blog';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(input?.value).toBe('Blog');

    expect(host.textContent).not.toContain('Guides');

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onExpandedIdsChange).toHaveBeenCalledWith(['blogs']);
    expect(host.textContent).not.toContain('Guides');

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
        />,
      );
    });
    expect(host.textContent).toContain('Guides');

    await act(async () => root.unmount());
    host.remove();
  });
});
