import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryTreeNav, type DirectoryTreeNode } from './directory-tree-nav';

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

  it('opens context menu actions for owners and delegates rename handler', async () => {
    const { host, root } = createTestRoot();
    const onRenameDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          onRenameDirectory={onRenameDirectory}
          canManageDirectories
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const menu = document.body.querySelector('[data-lumia-menu-content]');
    expect(menu).toBeTruthy();

    const renameItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Rename directory'));
    expect(renameItem).toBeTruthy();
    const updateItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Update directory'));
    expect(updateItem).toBeUndefined();

    await act(async () => {
      renameItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      renameItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const renameInput = host.querySelector(
      'input[data-testid="directory-tree-inline-composer-input"]',
    ) as HTMLInputElement | null;
    expect(renameInput).toBeTruthy();
    expect(
      host.querySelector('[data-testid="directory-tree-node-label-blogs"]'),
    ).toBeNull();

    await act(async () => {
      if (!renameInput) return;
      renameInput.value = 'Blogs v2';
      renameInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      if (!renameInput) return;
      renameInput.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      );
    });

    expect(onRenameDirectory).toHaveBeenCalledWith({
      nodeId: 'blogs',
      name: 'Blogs v2',
    });

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows delete confirmation with breadcrumb and deletes only after confirm', async () => {
    const { host, root } = createTestRoot();
    const onDeleteDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          onDeleteDirectory={onDeleteDirectory}
          canManageDirectories
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const deleteItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Delete directory'));
    expect(deleteItem).toBeTruthy();

    await act(async () => {
      deleteItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      deleteItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onDeleteDirectory).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Delete “Blogs”?');
    expect(document.body.textContent).toContain(
      'This will permanently delete this directory, all nested subdirectories, and every content item inside them.',
    );
    expect(document.body.textContent).toContain(
      'This action cannot be undone.',
    );
    expect(document.body.textContent).toContain('Directory path');
    expect(document.body.textContent).toContain('Contents / Blogs');

    const confirmDeleteButton = Array.from(
      document.body.querySelectorAll('button'),
    ).find((button) => button.textContent === 'Delete directory');
    expect(confirmDeleteButton).toBeTruthy();

    await act(async () => {
      confirmDeleteButton?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(onDeleteDirectory).toHaveBeenCalledWith({ nodeId: 'blogs' });
    expect(document.body.querySelector('[data-lumia-dialog-content]')).toBe(
      null,
    );

    await act(async () => root.unmount());
    host.remove();
  });

  it('closes delete confirmation on cancel without deleting', async () => {
    const { host, root } = createTestRoot();
    const onDeleteDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          onDeleteDirectory={onDeleteDirectory}
          canManageDirectories
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const deleteItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Delete directory'));
    expect(deleteItem).toBeTruthy();

    await act(async () => {
      deleteItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      deleteItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const cancelButton = Array.from(
      document.body.querySelectorAll('button'),
    ).find((button) => button.textContent === 'Cancel');
    expect(cancelButton).toBeTruthy();

    await act(async () => {
      cancelButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onDeleteDirectory).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-lumia-dialog-content]')).toBe(
      null,
    );

    await act(async () => root.unmount());
    host.remove();
  });

  it('cancels inline rename on escape', async () => {
    const { host, root } = createTestRoot();
    const onRenameDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          onRenameDirectory={onRenameDirectory}
          canManageDirectories
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const renameItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Rename directory'));
    expect(renameItem).toBeTruthy();

    await act(async () => {
      renameItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      renameItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const renameInput = host.querySelector(
      'input[data-testid="directory-tree-inline-composer-input"]',
    ) as HTMLInputElement | null;
    expect(renameInput).toBeTruthy();

    await act(async () => {
      renameInput?.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      );
    });

    expect(
      host.querySelector(
        'input[data-testid="directory-tree-inline-composer-input"]',
      ),
    ).toBeNull();
    expect(onRenameDirectory).not.toHaveBeenCalled();

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows access disabled pop-up for non-owners and keeps request buttons disabled', async () => {
    const { host, root } = createTestRoot();
    const onCreateDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={onCreateDirectory}
          canManageDirectories={false}
          directoryActionDisabledReason="Only workspace owners can manage directories right now."
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-root"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onCreateDirectory).not.toHaveBeenCalled();
    expect(
      host.querySelector('[data-testid="directory-tree-access-toast"]')
        ?.textContent,
    ).toContain('Only workspace owners can manage directories right now.');

    const requestButton = host.querySelector(
      '[data-testid="directory-tree-access-request-button"]',
    ) as HTMLButtonElement | null;
    const contactButton = host.querySelector(
      '[data-testid="directory-tree-access-contact-button"]',
    ) as HTMLButtonElement | null;
    expect(requestButton?.disabled).toBe(true);
    expect(contactButton?.disabled).toBe(true);

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const renameItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Rename directory'));
    expect(renameItem).toBeTruthy();

    await act(async () => {
      renameItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      renameItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(
      host.querySelector('[data-testid="directory-tree-access-toast"]')
        ?.textContent,
    ).toContain('Only workspace owners can manage directories right now.');

    await act(async () => root.unmount());
    host.remove();
  });

  it('disables rename and delete actions when handlers are not provided', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          canManageDirectories
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const renameItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Rename directory'));
    const deleteItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Delete directory'));

    expect(renameItem?.getAttribute('aria-disabled')).toBe('true');
    expect(deleteItem?.getAttribute('aria-disabled')).toBe('true');

    await act(async () => root.unmount());
    host.remove();
  });

  it('treats case-only rename changes as no-op', async () => {
    const { host, root } = createTestRoot();
    const onRenameDirectory = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          onRenameDirectory={onRenameDirectory}
          canManageDirectories
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
        );
      host
        .querySelector('[data-testid="directory-tree-node-label-blogs"]')
        ?.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
          }),
        );
    });
    await act(async () => {});

    const renameItem = Array.from(
      document.body.querySelectorAll('[data-lumia-menu-item]'),
    ).find((item) => item.textContent?.includes('Rename directory'));
    expect(renameItem).toBeTruthy();

    await act(async () => {
      renameItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      renameItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const renameInput = host.querySelector(
      'input[data-testid="directory-tree-inline-composer-input"]',
    ) as HTMLInputElement | null;
    expect(renameInput).toBeTruthy();

    await act(async () => {
      if (!renameInput) return;
      renameInput.value = 'blogs';
      renameInput.dispatchEvent(new Event('change', { bubbles: true }));
      renameInput.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      );
    });

    expect(onRenameDirectory).not.toHaveBeenCalled();
    expect(
      host.querySelector(
        'input[data-testid="directory-tree-inline-composer-input"]',
      ),
    ).toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });

  it('auto-dismisses access toast after delay', async () => {
    vi.useFakeTimers();
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          canManageDirectories={false}
        />,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-root"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(
      host.querySelector('[data-testid="directory-tree-access-toast"]'),
    ).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(
      host.querySelector('[data-testid="directory-tree-access-toast"]'),
    ).toBeNull();

    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
  });

  it('keeps context menu open path stable on ctrl-click triggers', async () => {
    const { host, root } = createTestRoot();
    const onNavigate = vi.fn();

    await act(async () => {
      root.render(
        <DirectoryTreeNav
          rootLabel="Contents"
          rootHref="/dashboard/acme"
          nodes={fixture}
          expandedIds={['blogs']}
          onExpandedIdsChange={vi.fn()}
          onCreateDirectory={vi.fn()}
          onNavigate={onNavigate}
        />,
      );
    });

    const target = host.querySelector(
      '[data-testid="directory-tree-node-label-blogs"]',
    );

    await act(async () => {
      target?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, button: 2 }),
      );
      target?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          clientX: 12,
          clientY: 12,
          ctrlKey: true,
        }),
      );
      target?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, ctrlKey: true }),
      );
    });
    await act(async () => {});

    expect(onNavigate).not.toHaveBeenCalled();
    expect(
      document.body.querySelector('[data-lumia-menu-content]'),
    ).toBeTruthy();

    await act(async () => root.unmount());
    host.remove();
  });
});
