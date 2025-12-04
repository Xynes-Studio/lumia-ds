/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './segmented-control';

const defaultOptions = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'archived', label: 'Archived' },
];

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    options: defaultOptions,
    value: 'all',
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <SegmentedControl
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
    );
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Playground: Story = {};

export const WithIcons: Story = {
  args: {
    options: [
      { value: 'list', label: 'List', icon: 'chat-bubble' },
      { value: 'spark', label: 'Spark', icon: 'sparkle' },
      { value: 'calendar', label: 'Calendar' },
    ],
    value: 'list',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Optional icons align with toolbar usage. Arrow keys move focus, Enter/Space selects.',
      },
    },
  },
};

export const ToolbarExample: Story = {
  render: () => {
    const [filter, setFilter] = useState('all');
    return (
      <div className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 shadow-sm">
        <SegmentedControl
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <span className="text-sm text-muted-foreground">
          Showing {filter === 'all' ? 'everything' : `${filter} items`}
        </span>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drop-in toolbar usage with inline text. Control stays compact and reuses the same keyboard behavior.',
      },
    },
  },
};
