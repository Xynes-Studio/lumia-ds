import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DashboardShell,
  type DashboardNavItem,
  type DashboardNotification,
  type DashboardWorkspace,
} from './dashboard-shell';

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

const createRelativeIso = (daysAgo: number, hoursAgo = 0) => {
  const value = new Date();
  value.setDate(value.getDate() - daysAgo);
  value.setHours(value.getHours() - hoursAgo);
  return value.toISOString();
};

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true,
  });
  window.dispatchEvent(new Event('resize'));
};

const navItems: DashboardNavItem[] = [
  { id: 'users', label: 'Users', href: '/dashboard/users', icon: 'users' },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
  },
];

const directoryNavItems: DashboardNavItem[] = [
  {
    id: 'contents',
    label: 'Contents',
    href: '/dashboard/contents',
    icon: 'file-text',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
  },
];

const directoryNodes = [
  {
    id: 'blogs',
    label: 'Blogs',
    children: [
      {
        id: 'guides',
        label: 'Guides',
      },
    ],
  },
];

const workspaceOptions: DashboardWorkspace[] = [
  { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
  { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
];

const notifications: DashboardNotification[] = [
  {
    id: 'n1',
    title: 'Deployment complete',
    description: 'Production deploy finished successfully.',
    createdAt: createRelativeIso(0, 1),
    unread: true,
    deepLinkHref: '/dashboard/deployments/1',
  },
  {
    id: 'n2',
    title: 'Workspace invite',
    createdAt: createRelativeIso(1, 2),
    unread: false,
  },
  {
    id: 'n3',
    title: 'Policy update',
    createdAt: createRelativeIso(2, 2),
    unread: true,
  },
];

describe('DashboardShell', () => {
  beforeEach(() => {
    setViewportWidth(1024);
  });

  afterEach(() => {
    setViewportWidth(1024);
  });

  it('renders landmarks and sidebar/main slots', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    expect(host.querySelector('aside')).toBeTruthy();
    expect(host.querySelector('main')).toBeTruthy();
    expect(host.textContent).toContain('Page content');
    expect(host.textContent).toContain('Users');
    expect(
      host.querySelector('nav[aria-label="Dashboard navigation"]')?.className,
    ).toContain('mt-3');
    expect(host.querySelector('nav svg')).toBeTruthy();

    const usersLink = host.querySelector('a[href="/dashboard/users"]');
    expect(usersLink?.getAttribute('aria-current')).toBe('page');

    await act(async () => root.unmount());
    host.remove();
  });

  it('emits navigate and workspace callbacks', async () => {
    const { root, host } = createTestRoot();
    const onNavigate = vi.fn();
    const onWorkspaceSelect = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          onNavigate={onNavigate}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={onWorkspaceSelect}
          userMenu={{ name: 'Ada', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const settingsLink = host.querySelector('a[href="/dashboard/settings"]');
    await act(async () => {
      settingsLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onNavigate).toHaveBeenCalledWith('/dashboard/settings', navItems[1]);

    const workspaceTrigger = host.querySelector(
      '[data-testid="dashboard-workspace-trigger"]',
    );
    expect(workspaceTrigger?.className).toContain('cursor-pointer');
    await act(async () => {
      workspaceTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      workspaceTrigger?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    const workspaceItem = document.body.querySelector(
      '[data-workspace-id="ws-2"]',
    );
    await act(async () => {
      workspaceItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onWorkspaceSelect).toHaveBeenCalledWith('ws-2');

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders configured directory section on desktop and wires create/expand callbacks', async () => {
    const { root, host } = createTestRoot();
    const onCreateDirectory = vi.fn();
    const onExpandedIdsChange = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/contents"
          navItems={directoryNavItems}
          onNavigate={vi.fn()}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          directorySection={{
            navItemId: 'contents',
            rootHref: '/dashboard/contents',
            nodes: directoryNodes,
            expandedIds: ['blogs'],
            onExpandedIdsChange,
            onCreateDirectory,
          }}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    expect(
      host.querySelector('[data-testid="directory-tree-root-link"]'),
    ).toBeTruthy();
    expect(host.textContent).toContain('Blogs');

    await act(async () => {
      host
        .querySelector('[data-testid="directory-tree-create-root"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = host.querySelector(
      'input[data-testid="directory-tree-composer-input"]',
    ) as HTMLInputElement | null;

    await act(async () => {
      if (!input) return;
      input.value = 'News';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      if (!input) return;
      input.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
      );
    });

    expect(onCreateDirectory).toHaveBeenCalledWith({
      parentId: null,
      name: 'News',
    });

    const blogsLabel = host.querySelector(
      '[data-testid="directory-tree-node-label-blogs"]',
    ) as HTMLButtonElement | null;
    expect(blogsLabel).toBeTruthy();

    await act(async () => {
      blogsLabel?.click();
    });

    expect(onExpandedIdsChange).toHaveBeenCalledWith([]);

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders configured directory section inside the mobile menu sheet', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/contents"
          navItems={directoryNavItems}
          onNavigate={vi.fn()}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          directorySection={{
            navItemId: 'contents',
            rootHref: '/dashboard/contents',
            nodes: directoryNodes,
            expandedIds: ['blogs'],
            onExpandedIdsChange: vi.fn(),
            onCreateDirectory: vi.fn(),
          }}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-menu-tab"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const mobileMenuSheet = document.body.querySelector(
      '[data-testid="dashboard-mobile-menu-sheet"]',
    );
    expect(mobileMenuSheet).toBeTruthy();
    expect(mobileMenuSheet?.textContent).toContain('Contents');
    expect(
      mobileMenuSheet?.querySelector(
        '[data-testid="directory-tree-root-link"]',
      ),
    ).toBeTruthy();

    await act(async () => root.unmount());
    host.remove();
  });

  it('supports workspace creation toggle and disabled guidance message', async () => {
    const { root, host } = createTestRoot();
    const onCreateWorkspace = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          onCreateWorkspace={onCreateWorkspace}
          userMenu={{ name: 'Ada', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const workspaceTrigger = host.querySelector(
      '[data-testid="dashboard-workspace-trigger"]',
    );
    await act(async () => {
      workspaceTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      workspaceTrigger?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    const createItem = document.body.querySelector(
      '[data-testid="dashboard-workspace-create"]',
    );
    expect(createItem).toBeTruthy();
    const defaultWidthMenu = document.body.querySelector(
      '[data-lumia-menu-content]',
    ) as HTMLElement | null;
    expect(defaultWidthMenu?.style.width).toBe('22rem');

    await act(async () => {
      createItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onCreateWorkspace).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          enableWorkspaceCreation={false}
          isSidebarCollapsed
          workspaceCreationDisabledMessage="Workspace limit reached. Check settings or contact admin."
          userMenu={{ name: 'Ada', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      workspaceTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      workspaceTrigger?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    await flushTimers();

    expect(
      document.body.querySelector('[data-testid="dashboard-workspace-create"]'),
    ).toBeNull();
    expect(
      document.body.querySelector(
        '[data-testid="dashboard-workspace-create-disabled"]',
      ),
    ).toBeTruthy();
    expect(document.body.textContent).toContain(
      'Workspace limit reached. Check settings or contact admin.',
    );
    const collapsedWidthMenu = document.body.querySelector(
      '[data-lumia-menu-content]',
    ) as HTMLElement | null;
    expect(collapsedWidthMenu?.style.width).toBe('5rem');

    await act(async () => root.unmount());
    host.remove();
  });

  it('supports profile menu and notification drawer interactions', async () => {
    const { root, host } = createTestRoot();
    const onProfileOpen = vi.fn();
    const onLogout = vi.fn();
    const onNotificationsViewed = vi.fn();
    const onNotificationClick = vi.fn();
    const onNotificationDelete = vi.fn();
    const onNotificationNavigate = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onProfileOpen={onProfileOpen}
          onLogout={onLogout}
          notifications={[
            {
              ...notifications[0],
              deepLinkHref: 'https://xynes.com/alerts/1',
              deepLinkTarget: '_blank',
            },
            notifications[1],
            notifications[2],
          ]}
          onNotificationsViewed={onNotificationsViewed}
          onNotificationClick={onNotificationClick}
          onNotificationDelete={onNotificationDelete}
          onNotificationNavigate={onNotificationNavigate}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const profileTrigger = host.querySelector(
      '[data-testid="dashboard-profile-trigger"]',
    );
    await act(async () => {
      profileTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      profileTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const profileItem = document.body.querySelector(
      '[data-testid="dashboard-profile-item"]',
    );
    const logoutItem = document.body.querySelector(
      '[data-testid="dashboard-logout-item"]',
    );

    await act(async () => {
      profileItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      logoutItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onProfileOpen).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);

    const notificationTrigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    ) as HTMLElement | null;
    const notificationBadge = host.querySelector(
      '[data-testid="dashboard-notification-badge"]',
    );
    expect(notificationBadge?.textContent).toBe('2');

    await act(async () => {
      notificationTrigger?.click();
    });
    await flushTimers();

    expect(
      document.body.querySelector(
        '[data-testid="dashboard-notification-drawer"]',
      ),
    ).toBeTruthy();
    expect(
      document.body.querySelector(
        '[data-testid="dashboard-notification-title"]',
      )?.textContent,
    ).toContain('Notifications (2)');
    expect(document.body.textContent).toContain('Today');
    expect(document.body.textContent).toContain('Yesterday');
    expect(onNotificationsViewed).toHaveBeenCalledTimes(0);
    expect(
      document.body.querySelector(
        '[data-testid="dashboard-notification-unread-dot-n1"]',
      ),
    ).toBeTruthy();

    const notificationItem = document.body.querySelector(
      '[data-testid="dashboard-notification-item-n1"]',
    );
    await act(async () => {
      notificationItem?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(onNotificationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );
    expect(onNotificationNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );
    expect(openSpy).toHaveBeenCalledWith(
      'https://xynes.com/alerts/1',
      '_blank',
      expect.stringContaining('noopener'),
    );

    const deleteButton = document.body.querySelector(
      '[data-testid="dashboard-notification-delete-n1"]',
    );
    await act(async () => {
      deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onNotificationDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );

    const closeButton = document.body.querySelector(
      '[aria-label="Close drawer"]',
    );
    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const drawerRoot = document.body.querySelector('[data-lumia-drawer-root]');
    expect(drawerRoot?.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBeTruthy();
    expect(onNotificationsViewed).toHaveBeenCalledWith(['n1', 'n3']);

    openSpy.mockRestore();
    await act(async () => root.unmount());
    host.remove();
  });

  it('does not auto navigate for unsafe deep links', async () => {
    const { root, host } = createTestRoot();
    const onNotificationNavigate = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={[
            {
              id: 'n-unsafe',
              title: 'Unsafe',
              createdAt: createRelativeIso(0, 0),
              deepLinkHref: 'javascript:alert(1)',
              unread: true,
            },
          ]}
          onNotificationNavigate={onNotificationNavigate}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const notificationTrigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      notificationTrigger?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    await flushTimers();

    const notificationItem = document.body.querySelector(
      '[data-testid="dashboard-notification-item-n-unsafe"]',
    );

    await act(async () => {
      notificationItem?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(onNotificationNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n-unsafe' }),
    );
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
    await act(async () => root.unmount());
    host.remove();
  });

  it('emits drawer open and close callbacks in uncontrolled mode', async () => {
    const { root, host } = createTestRoot();
    const onNotificationDrawerOpenChange = vi.fn();
    const onNotificationsViewed = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          onNotificationDrawerOpenChange={onNotificationDrawerOpenChange}
          onNotificationsViewed={onNotificationsViewed}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onNotificationDrawerOpenChange).toHaveBeenCalledWith(true);
    expect(onNotificationsViewed).toHaveBeenCalledTimes(0);

    const closeButton = document.body.querySelector(
      '[aria-label="Close drawer"]',
    );
    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onNotificationDrawerOpenChange).toHaveBeenCalledWith(false);
    expect(onNotificationsViewed).toHaveBeenCalledWith(['n1', 'n3']);

    await act(async () => root.unmount());
    host.remove();
  });

  it('supports controlled drawer mode and only requests open through callback', async () => {
    const { root, host } = createTestRoot();
    const onNotificationDrawerOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          isNotificationDrawerOpen={false}
          onNotificationDrawerOpenChange={onNotificationDrawerOpenChange}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onNotificationDrawerOpenChange).toHaveBeenCalledWith(true);
    expect(
      document.body.querySelector(
        '[data-testid="dashboard-notification-drawer"]',
      ),
    ).toBeNull();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          isNotificationDrawerOpen
          onNotificationDrawerOpenChange={onNotificationDrawerOpenChange}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    expect(
      document.body.querySelector(
        '[data-testid="dashboard-notification-drawer"]',
      ),
    ).toBeTruthy();

    await act(async () => root.unmount());
    host.remove();
  });

  it('does not trigger tile click callback when delete icon is clicked', async () => {
    const { root, host } = createTestRoot();
    const onNotificationClick = vi.fn();
    const onNotificationDelete = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onNotificationDelete={onNotificationDelete}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const deleteButton = document.body.querySelector(
      '[data-testid="dashboard-notification-delete-n1"]',
    );
    await act(async () => {
      deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onNotificationDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );
    expect(onNotificationClick).toHaveBeenCalledTimes(0);

    await act(async () => root.unmount());
    host.remove();
  });

  it('does not auto navigate when auto navigation is disabled', async () => {
    const { root, host } = createTestRoot();
    const onNotificationNavigate = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={[
            {
              id: 'n-external',
              title: 'External link',
              createdAt: createRelativeIso(0, 0),
              deepLinkHref: 'https://xynes.com/external',
              deepLinkTarget: '_blank',
              unread: true,
            },
          ]}
          enableNotificationAutoNavigate={false}
          onNotificationNavigate={onNotificationNavigate}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const notificationItem = document.body.querySelector(
      '[data-testid="dashboard-notification-item-n-external"]',
    );
    await act(async () => {
      notificationItem?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(onNotificationNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n-external' }),
    );
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
    await act(async () => root.unmount());
    host.remove();
  });

  it('does not emit viewed callback when there are no unread notifications', async () => {
    const { root, host } = createTestRoot();
    const onNotificationsViewed = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={[
            {
              id: 'n-read',
              title: 'Already read',
              createdAt: createRelativeIso(0, 0),
              unread: false,
            },
          ]}
          onNotificationsViewed={onNotificationsViewed}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const closeButton = document.body.querySelector(
      '[aria-label="Close drawer"]',
    );
    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onNotificationsViewed).toHaveBeenCalledTimes(0);

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders mobile bottom tabs and hides desktop nav below breakpoint', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    expect(
      host.querySelector('[data-testid="dashboard-mobile-bottom-bar"]'),
    ).toBeTruthy();
    expect(
      host.querySelector('[data-testid="dashboard-mobile-notifications-tab"]'),
    ).toBeTruthy();
    expect(
      host.querySelector('[data-testid="dashboard-mobile-menu-tab"]'),
    ).toBeTruthy();
    expect(
      host.querySelector('[data-testid="dashboard-mobile-nav-tab-users"]'),
    ).toBeTruthy();
    expect(
      host.querySelector('[data-testid="dashboard-mobile-nav-tab-settings"]'),
    ).toBeTruthy();
    expect(
      host.querySelector('nav[aria-label="Dashboard navigation"]'),
    ).toBeNull();

    await act(async () => root.unmount());
    host.remove();
  });

  it('shows exactly three mobile bottom items when only one nav item exists', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={[navItems[0] as DashboardNavItem]}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const bar = host.querySelector(
      '[data-testid="dashboard-mobile-bottom-bar"]',
    );
    const tabs = bar?.querySelectorAll('button');
    expect(tabs?.length).toBe(3);
    expect(
      host.querySelector('[data-testid="dashboard-mobile-nav-tab-users"]'),
    ).toBeTruthy();

    await act(async () => root.unmount());
    host.remove();
  });

  it('renders dedicated mobile quick-nav icons for apps and directory', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/apps"
          navItems={[
            {
              id: 'apps',
              label: 'Apps',
              href: '/dashboard/apps',
              icon: 'package',
            },
            {
              id: 'directory',
              label: 'Directory',
              href: '/dashboard/directory',
              icon: 'users-round',
            },
          ]}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const appsIconSvg = host
      .querySelector('[data-testid="dashboard-mobile-nav-tab-apps"]')
      ?.querySelector('svg');
    const directoryIconSvg = host
      .querySelector('[data-testid="dashboard-mobile-nav-tab-directory"]')
      ?.querySelector('svg');

    expect(appsIconSvg).toBeTruthy();
    expect(directoryIconSvg).toBeTruthy();
    expect(appsIconSvg?.querySelector('rect')).toBeNull();
    expect(directoryIconSvg?.querySelector('rect')).toBeNull();
    expect(
      Array.from(appsIconSvg?.querySelectorAll('path') ?? []).some((path) =>
        path.getAttribute('d')?.includes('M21 8a2 2 0 0 0-1-1.73l-7-4'),
      ),
    ).toBe(true);

    await act(async () => root.unmount());
    host.remove();
  });

  it('does not navigate mobile quick nav for unsafe href values', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();
    const assignSpy = vi
      .spyOn(window.location, 'assign')
      .mockImplementation(() => undefined);

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={[
            {
              id: 'users',
              label: 'Users',
              href: 'javascript:alert(1)',
              icon: 'users',
            },
          ]}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-nav-tab-users"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(assignSpy).not.toHaveBeenCalled();

    assignSpy.mockRestore();
    await act(async () => root.unmount());
    host.remove();
  });

  it('opens mobile notification and menu sheets and keeps only one open', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-notifications-tab"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const notificationSheet = document.body.querySelector(
      '[data-testid="dashboard-mobile-notifications-sheet"]',
    );
    expect(notificationSheet?.getAttribute('data-state')).toBe('open');

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-menu-tab"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const menuSheet = document.body.querySelector(
      '[data-testid="dashboard-mobile-menu-sheet"]',
    );
    expect(menuSheet?.getAttribute('data-state')).toBe('open');
    expect(notificationSheet?.getAttribute('data-state')).toBe('closed');

    await act(async () => root.unmount());
    host.remove();
  });

  it('fires mobile notification callbacks and viewed callback on close', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();
    const onNotificationClick = vi.fn();
    const onNotificationDelete = vi.fn();
    const onNotificationNavigate = vi.fn();
    const onNotificationsViewed = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onNotificationDelete={onNotificationDelete}
          onNotificationNavigate={onNotificationNavigate}
          onNotificationsViewed={onNotificationsViewed}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-notifications-tab"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    await act(async () => {
      document.body
        .querySelector('[data-testid="dashboard-notification-item-n1"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onNotificationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );
    expect(onNotificationNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );

    await act(async () => {
      document.body
        .querySelector('[data-testid="dashboard-notification-delete-n1"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onNotificationDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
    );

    await act(async () => {
      document.body
        .querySelector('[aria-label="Close drawer"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onNotificationsViewed).toHaveBeenCalledWith(['n1', 'n3']);

    await act(async () => root.unmount());
    host.remove();
  });

  it('supports mobile menu callbacks for workspace and profile actions', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();
    const onWorkspaceSelect = vi.fn();
    const onCreateWorkspace = vi.fn();
    const onProfileOpen = vi.fn();
    const onLogout = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={onWorkspaceSelect}
          onCreateWorkspace={onCreateWorkspace}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onProfileOpen={onProfileOpen}
          onLogout={onLogout}
          notifications={notifications}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-menu-tab"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    const workspaceTrigger = document.body.querySelector(
      '[data-testid="dashboard-workspace-trigger"]',
    );
    await act(async () => {
      workspaceTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      workspaceTrigger?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    await act(async () => {
      document.body
        .querySelector('[data-testid="dashboard-workspace-create"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onCreateWorkspace).toHaveBeenCalledTimes(1);

    await act(async () => {
      workspaceTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      workspaceTrigger?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    await act(async () => {
      document.body
        .querySelector('[data-workspace-id="ws-2"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onWorkspaceSelect).toHaveBeenCalledWith('ws-2');

    const profileTrigger = document.body.querySelector(
      '[data-testid="dashboard-profile-trigger"]',
    );
    await act(async () => {
      profileTrigger?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      profileTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {
      document.body
        .querySelector('[data-testid="dashboard-profile-item"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document.body
        .querySelector('[data-testid="dashboard-logout-item"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onProfileOpen).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    host.remove();
  });

  it('uses 9+ cap for mobile notification badge', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={Array.from({ length: 12 }, (_, index) => ({
            id: `n-mobile-${index + 1}`,
            title: `Notification ${index + 1}`,
            createdAt: createRelativeIso(0, index),
            unread: true,
          }))}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    expect(
      host.querySelector('[data-testid="dashboard-mobile-notification-badge"]')
        ?.textContent,
    ).toBe('9+');

    await act(async () => root.unmount());
    host.remove();
  });

  it('auto-closes desktop drawer when viewport switches to mobile', async () => {
    setViewportWidth(1100);
    const { root, host } = createTestRoot();
    const onNotificationDrawerOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          onNotificationDrawerOpenChange={onNotificationDrawerOpenChange}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    const trigger = host.querySelector(
      '[data-testid="dashboard-notification-trigger"]',
    );
    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onNotificationDrawerOpenChange).toHaveBeenCalledWith(true);

    await act(async () => {
      setViewportWidth(700);
    });
    await flushTimers();

    expect(onNotificationDrawerOpenChange).toHaveBeenCalledWith(false);

    await act(async () => root.unmount());
    host.remove();
  });

  it('auto-closes mobile sheets when viewport switches to desktop', async () => {
    setViewportWidth(700);
    const { root, host } = createTestRoot();
    const onMobileMenuOpenChange = vi.fn();
    const onMobileNotificationsOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <DashboardShell
          activePath="/dashboard/users"
          navItems={navItems}
          workspace={{ id: 'ws-1', name: 'Xynes' }}
          workspaceOptions={workspaceOptions}
          onWorkspaceSelect={vi.fn()}
          userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
          onLogout={vi.fn()}
          notifications={notifications}
          onMobileMenuOpenChange={onMobileMenuOpenChange}
          onMobileNotificationsOpenChange={onMobileNotificationsOpenChange}
        >
          <section>Page content</section>
        </DashboardShell>,
      );
    });

    await act(async () => {
      host
        .querySelector('[data-testid="dashboard-mobile-menu-tab"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await flushTimers();

    expect(onMobileMenuOpenChange).toHaveBeenCalledWith(true);

    await act(async () => {
      setViewportWidth(1024);
    });
    await flushTimers();

    expect(onMobileMenuOpenChange).toHaveBeenCalledWith(false);
    expect(onMobileNotificationsOpenChange).toHaveBeenCalledWith(false);

    await act(async () => root.unmount());
    host.remove();
  });
});
