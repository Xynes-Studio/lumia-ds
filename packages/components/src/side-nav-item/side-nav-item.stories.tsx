/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import type { IconId } from '@lumia-ui/icons';
import { SideNavItem } from './side-nav-item';

const dashboardIcon = 'home' as IconId;
const reportsIcon = 'reports' as IconId;
const settingsIcon = 'settings' as IconId;
const teamIcon = 'users' as IconId;

const meta = {
  title: 'Components/SideNavItem',
  component: SideNavItem,
  tags: ['autodocs'],
  args: {
    label: 'Dashboard',
    href: '#dashboard',
    icon: dashboardIcon,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SideNavItem>;

export default meta;
type Story = StoryObj<typeof SideNavItem>;

export const Default: Story = {};

export const ActiveWithBadge: Story = {
  args: {
    label: 'Reports',
    icon: reportsIcon,
    badgeCount: 12,
    active: true,
  },
};

export const VerticalNavigation: Story = {
  render: () => (
    <nav className="w-64 space-y-1 rounded-lg border border-border bg-background p-2">
      <SideNavItem
        label="Dashboard"
        icon={dashboardIcon}
        href="#dashboard"
        active
      />
      <SideNavItem
        label="Reports"
        icon={reportsIcon}
        badgeCount={8}
        href="#reports"
      />
      <SideNavItem label="Settings" icon={settingsIcon} href="#settings" />
      <SideNavItem label="Team" icon={teamIcon} badgeCount={3} href="#team" />
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Works inside any vertical navigation stack. Active items use a filled background and color shift; badges only render when the count is above zero.',
      },
    },
  },
};
