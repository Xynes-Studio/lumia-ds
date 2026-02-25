/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DashboardShell, type DashboardNavItem } from '@lumia-ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@lumia-ui/components';
import type { DirectoryTreeNode } from '@lumia-ui/components';

const navItems: DashboardNavItem[] = [
  { id: 'users', label: 'Users', href: '/dashboard/users', icon: 'users' },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    href: '/dashboard/audit',
    icon: 'reports',
    badgeCount: 3,
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

const directorySeed: DirectoryTreeNode[] = [
  {
    id: 'blogs',
    label: 'Blogs',
    children: [{ id: 'guides', label: 'Guides' }],
  },
];

const meta = {
  title: 'Runtime/DashboardShell',
  component: DashboardShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DashboardShell>;

export default meta;
type Story = StoryObj<typeof DashboardShell>;

const createRelativeIso = (daysAgo: number, hoursAgo = 0) => {
  const value = new Date();
  value.setDate(value.getDate() - daysAgo);
  value.setHours(value.getHours() - hoursAgo);
  return value.toISOString();
};

const baseNotifications = [
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
    title: 'Workspace invitation',
    description: 'You have been added to the Lumia workspace.',
    createdAt: createRelativeIso(1, 3),
    unread: false,
    deepLinkHref: '/dashboard/workspaces',
  },
  {
    id: 'n3',
    title: 'Audit export ready',
    description: 'Download the latest export from the audit module.',
    createdAt: createRelativeIso(2, 2),
    unread: true,
    deepLinkHref: 'https://xynes.com/reports/audit-export',
    deepLinkTarget: '_blank' as const,
  },
];

export const BasicDashboardShell: Story = {
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      onCreateWorkspace={() => undefined}
      enableWorkspaceCreation
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onProfileOpen={() => undefined}
      onLogout={() => undefined}
      notifications={baseNotifications}
      onNotificationsViewed={() => undefined}
      onNotificationClick={() => undefined}
      onNotificationDelete={() => undefined}
      onNotificationNavigate={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Live users', 'Open issues', 'Storage'].map((metric, index) => (
          <Card key={metric} className="bg-background/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {metric}
              </CardTitle>
              <p className="text-2xl font-semibold text-foreground">
                {index === 0 ? '1,284' : index === 1 ? '42' : '78%'}
              </p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Updated just now.
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  ),
};

export const WorkspaceCreationDisabled: Story = {
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      enableWorkspaceCreation={false}
      workspaceCreationDisabledMessage="Workspace limit reached. Check settings or contact admin."
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onProfileOpen={() => undefined}
      onLogout={() => undefined}
      notifications={[]}
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Workspace limits
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">Plan limit</p>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Open the workspace switcher to view the disabled creation guidance.
        </CardContent>
      </Card>
    </DashboardShell>
  ),
};

export const DirectorySectionContents: Story = {
  render: () => {
    const [nodes, setNodes] = useState<DirectoryTreeNode[]>(directorySeed);
    const [expandedIds, setExpandedIds] = useState<string[]>(['blogs']);

    return (
      <DashboardShell
        activePath="/dashboard/contents"
        navItems={directoryNavItems}
        workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
        workspaceOptions={[
          { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
          { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
        ]}
        onWorkspaceSelect={() => undefined}
        onNavigate={() => undefined}
        userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
        onLogout={() => undefined}
        notifications={[]}
        directorySection={{
          navItemId: 'contents',
          rootHref: '/dashboard/contents',
          nodes,
          expandedIds,
          onExpandedIdsChange: setExpandedIds,
          onCreateDirectory: ({ parentId, name }) => {
            const nextNode: DirectoryTreeNode = {
              id: `${Date.now()}`,
              label: name,
              children: [],
            };
            if (parentId === null) {
              setNodes((previous) => [...previous, nextNode]);
              return;
            }

            const insertNested = (
              tree: DirectoryTreeNode[],
            ): DirectoryTreeNode[] =>
              tree.map((item) => {
                if (item.id === parentId) {
                  return {
                    ...item,
                    children: [...(item.children ?? []), nextNode],
                  };
                }

                if (!item.children?.length) {
                  return item;
                }

                return {
                  ...item,
                  children: insertNested(item.children),
                };
              });

            setNodes((previous) => insertNested(previous));
          },
        }}
      >
        <Card className="bg-background/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Content directories
            </CardTitle>
            <p className="text-2xl font-semibold text-foreground">
              Nested sidebar tree
            </p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use the plus actions in the sidebar to add nested directories.
          </CardContent>
        </Card>
      </DashboardShell>
    );
  },
};

export const MobileBottomTabsBasic: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onLogout={() => undefined}
      notifications={baseNotifications}
      onNotificationsViewed={() => undefined}
      onNotificationClick={() => undefined}
      onNotificationDelete={() => undefined}
      onNotificationNavigate={() => undefined}
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Mobile bottom tabs
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">
            Default mobile
          </p>
        </CardHeader>
      </Card>
    </DashboardShell>
  ),
};

export const MobileMenuSheetOpen: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      onCreateWorkspace={() => undefined}
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onProfileOpen={() => undefined}
      onLogout={() => undefined}
      notifications={baseNotifications}
      defaultMobileMenuOpen
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Mobile menu sheet
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">Open state</p>
        </CardHeader>
      </Card>
    </DashboardShell>
  ),
};

export const MobileNotificationsSheetOpen: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onLogout={() => undefined}
      notifications={baseNotifications}
      defaultMobileNotificationsOpen
      onNotificationsViewed={() => undefined}
      onNotificationClick={() => undefined}
      onNotificationDelete={() => undefined}
      onNotificationNavigate={() => undefined}
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Mobile notifications sheet
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">Open state</p>
        </CardHeader>
      </Card>
    </DashboardShell>
  ),
};

export const MobileTabSwitching: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onLogout={() => undefined}
      notifications={Array.from({ length: 12 }, (_, index) => ({
        id: `n-${index + 1}`,
        title: `Notification ${index + 1}`,
        description:
          'Tap notifications and menu tabs to validate handoff behavior.',
        createdAt: createRelativeIso(Math.floor(index / 4), index),
        unread: index < 10,
      }))}
      onNotificationsViewed={() => undefined}
      onNotificationClick={() => undefined}
      onNotificationDelete={() => undefined}
      onNotificationNavigate={() => undefined}
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Mobile tab switching
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">
            Mutual exclusivity
          </p>
        </CardHeader>
      </Card>
    </DashboardShell>
  ),
};

export const DesktopManualCollapseUnaffected: Story = {
  render: () => (
    <DashboardShell
      activePath="/dashboard/users"
      navItems={navItems}
      workspace={{ id: 'ws-1', name: 'Xynes', slug: 'xynes' }}
      workspaceOptions={[
        { id: 'ws-1', name: 'Xynes', slug: 'xynes' },
        { id: 'ws-2', name: 'Lumia', slug: 'lumia' },
      ]}
      onWorkspaceSelect={() => undefined}
      onNavigate={() => undefined}
      userMenu={{ name: 'Ada Lovelace', email: 'ada@xynes.com' }}
      onLogout={() => undefined}
      notifications={baseNotifications}
      isSidebarCollapsed
      onNotificationsViewed={() => undefined}
    >
      <Card className="bg-background/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Manual collapse
          </CardTitle>
          <p className="text-2xl font-semibold text-foreground">Desktop only</p>
        </CardHeader>
      </Card>
    </DashboardShell>
  ),
};
