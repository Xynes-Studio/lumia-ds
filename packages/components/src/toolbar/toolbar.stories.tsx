/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './toolbar';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { SegmentedControl } from '../segmented-control/segmented-control';

const meta = {
  title: 'Layout/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  args: {
    align: 'center',
    gap: 'md',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-full max-w-5xl space-y-4 p-4">
      <Toolbar
        {...args}
        className="rounded-lg border border-border bg-background p-4 shadow-sm"
        left={
          <>
            <Input
              placeholder="Search items"
              className="min-w-[200px] sm:min-w-[260px]"
            />
            <SegmentedControl
              options={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
              ]}
              value="all"
              onChange={() => {}}
            />
            <Button size="sm" variant="ghost">
              Refresh
            </Button>
          </>
        }
        right={
          <>
            <Button size="sm" variant="ghost">
              Reset
            </Button>
            <Button size="sm">Create</Button>
          </>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Recommended usage: a left-aligned control group and a right-aligned action group. On very small screens, groups stack vertically while keeping consistent gaps.',
      },
    },
  },
};

export const DenseToolbar: Story = {
  args: {
    align: 'start',
    gap: 'sm',
  },
  render: (args) => (
    <div className="w-full max-w-4xl space-y-4 p-4">
      <Toolbar
        {...args}
        className="rounded-md border border-border bg-muted/40 p-3"
        left={
          <>
            <Button size="sm" variant="secondary">
              Filters
            </Button>
            <Button size="sm" variant="outline">
              Sort
            </Button>
            <Button size="sm" variant="ghost">
              Columns
            </Button>
          </>
        }
        right={
          <>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
            <Button size="sm">Apply</Button>
          </>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Compact alignment with smaller gaps for dense toolbars. Content still wraps and stacks on narrow viewports using the same layout helper.',
      },
    },
  },
};
