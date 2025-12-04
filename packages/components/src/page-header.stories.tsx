/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { PageHeader } from './page-header';
import type { BreadcrumbItem } from './breadcrumbs';

const crumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Lumia Design System' },
];

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: {
    title: 'Projects',
    subtitle: 'Manage product workstreams and collaborators.',
    breadcrumbs: crumbs,
    secondaryActions: [
      <Button key="secondary" variant="ghost" size="sm">
        Share
      </Button>,
    ],
    primaryAction: (
      <Button key="primary" size="sm">
        New project
      </Button>
    ),
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};

export const InCard: Story = {
  render: (args) => (
    <Card className="max-w-3xl">
      <PageHeader {...args} />
      <CardContent className="text-sm text-muted-foreground">
        Use the header inside surfaces like cards for sub-pages or detail views.
      </CardContent>
    </Card>
  ),
  args: {
    breadcrumbs: [
      { label: 'Accounts', href: '#accounts' },
      { label: 'Acme Corp' },
    ],
    title: 'Account overview',
    subtitle: 'Key metrics and recent activity.',
  },
};
