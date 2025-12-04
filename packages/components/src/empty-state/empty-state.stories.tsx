/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent } from '../card/card';
import { EmptyState } from './empty-state';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No data yet',
    description:
      'When content arrives, it will show up here. Try adding a new item to get started.',
    icon: 'sparkle',
    primaryAction: { label: 'Create item' },
    secondaryAction: { label: 'Learn more' },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    description: undefined,
    icon: undefined,
    primaryAction: undefined,
    secondaryAction: undefined,
  },
};

export const InCard: Story = {
  render: (args) => (
    <div className="bg-muted p-6">
      <Card className="max-w-xl">
        <CardContent>
          <EmptyState {...args} />
        </CardContent>
      </Card>
    </div>
  ),
  args: {
    title: 'This table is empty',
    description: 'Add a row to see it rendered in this space.',
    primaryAction: { label: 'Add row' },
    secondaryAction: { label: 'Invite teammate' },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component embedded within a Card, matching layouts like an empty table or list container.',
      },
    },
  },
};
