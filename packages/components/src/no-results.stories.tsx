/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { NoResults } from './empty-state';

const meta = {
  title: 'Components/NoResults',
  component: NoResults,
  tags: ['autodocs'],
  args: {
    title: 'No results found',
    description: 'No rows match your current filters.',
    resetHint: 'Clear filters or search again to see more rows.',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NoResults>;

export default meta;
type Story = StoryObj<typeof NoResults>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    primaryAction: { label: 'Reset filters' },
    secondaryAction: { label: 'Edit search' },
  },
};

export const InTableShell: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl rounded-md border bg-background p-4">
      <NoResults {...args} />
    </div>
  ),
  args: {
    description:
      'Try widening your filters or clearing the search to see more rows.',
    resetHint: 'You can also remove all filters to start fresh.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Inline styling keeps the message compact so it fits inside list or table containers without feeling like a first-time empty state.',
      },
    },
  },
};
