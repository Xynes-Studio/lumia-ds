/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ViewToggle, type ViewMode } from './view-toggle';

const meta = {
  title: 'Components/ViewToggle',
  component: ViewToggle,
  tags: ['autodocs'],
  args: {
    mode: 'grid',
  },
  render: (args) => {
    const [mode, setMode] = useState<ViewMode>(args.mode);

    return (
      <ViewToggle
        {...args}
        mode={mode}
        onChange={(next) => {
          setMode(next);
          args.onChange?.(next);
        }}
      />
    );
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ViewToggle>;

export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Compact grid/list switcher with aria-pressed state, keyboard activation, and focus rings out of the box.',
      },
    },
  },
};

export const InlineUsage: Story = {
  render: () => {
    const [mode, setMode] = useState<ViewMode>('grid');

    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 p-4 shadow-sm">
        <ViewToggle mode={mode} onChange={setMode} />
        <span className="text-sm text-muted-foreground ">
          Showing {mode === 'grid' ? 'cards' : 'rows'} layout
        </span>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Drop into toolbars or cards; buttons stay compact while reflecting the current view mode.',
      },
    },
  },
};
