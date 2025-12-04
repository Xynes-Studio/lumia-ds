/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { StatTile } from './stat-tile';

const meta = {
  title: 'Components/StatTile',
  component: StatTile,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof StatTile>;

export const Grid: Story = {
  render: () => (
    <div className="min-h-screen bg-muted p-6">
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          label="Monthly revenue"
          value="$128k"
          delta={{ value: 12.4, direction: 'up' }}
          icon="reports"
        />
        <StatTile
          label="New signups"
          value="3,482"
          delta={{ value: 3.1, direction: 'up' }}
          icon="users"
        />
        <StatTile
          label="Churn rate"
          value="4.3%"
          delta={{ value: 0.8, direction: 'down' }}
          icon="alert"
        />
      </div>
    </div>
  ),
};

export const Minimal: Story = {
  render: () => (
    <div className="max-w-sm">
      <StatTile label="Open tickets" value="17" />
    </div>
  ),
};
