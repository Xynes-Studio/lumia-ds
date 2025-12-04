/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {
    label: 'Sample tag',
  },
  argTypes: {
    onRemove: { action: 'remove' },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline chip for selected items or statuses. Built on the shadcn badge primitives with Lumia colors and an optional remove affordance.',
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {};

export const Removable: Story = {
  args: {
    label: 'Closable chip',
    onRemove: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `onRemove` is provided the chip renders a close icon with `aria-label="Remove tag <label>"`.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag label="Default" />
      <Tag label="Success" variant="success" />
      <Tag label="Warning" variant="warning" />
      <Tag label="Error" variant="error" />
    </div>
  ),
};

export const InlineFlow: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Assigned to{' '}
      <Tag
        label="Data services"
        variant="success"
        className="ml-2 align-middle"
      />
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tags stay inline with surrounding text and inherit natural line height for dense layouts.',
      },
    },
  },
};

export const DenseWrap: Story = {
  render: () => (
    <div className="max-w-sm rounded-lg border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Filters</p>
        <span className="text-xs text-muted-foreground">Compact view</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag label="Owner: Taylor" onRemove={() => {}} />
        <Tag label="Status: Active" variant="success" onRemove={() => {}} />
        <Tag
          label="Segment: Enterprise accounts"
          variant="warning"
          onRemove={() => {}}
          className="max-w-[220px]"
        />
        <Tag label="Trials disabled" variant="error" onRemove={() => {}} />
      </div>
    </div>
  ),
};
