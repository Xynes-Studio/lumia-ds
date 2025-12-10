/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from './context-menu';
import type { MenuItemConfig } from '../shared/menu-shared';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof ContextMenu>;

const defaultItems: MenuItemConfig[] = [
  { id: 'edit', label: 'Edit', icon: 'user' },
  { id: 'duplicate', label: 'Duplicate', icon: 'settings' },
  { id: 'delete', label: 'Delete', icon: 'delete', variant: 'destructive' },
];

const BaseContextMenu = () => (
  <ContextMenu items={defaultItems}>
    <div
      tabIndex={0}
      className="w-64 cursor-context-menu rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Right-click, long-press, or press{' '}
      <span className="font-semibold">Shift</span>
      {' + '}
      <span className="font-semibold">F10</span>
    </div>
  </ContextMenu>
);

export const Playground: Story = {
  render: () => <BaseContextMenu />,
  parameters: {
    docs: {
      description: {
        story:
          'Wraps `@radix-ui/react-context-menu` with Lumia menu styling. The trigger area is focusable for keyboard open (Shift+F10 or the Context Menu key) in addition to right-click and long-press.',
      },
    },
  },
};

export const InlineTarget: Story = {
  render: () => (
    <ContextMenu
      items={[
        { id: 'rename', label: 'Rename', icon: 'settings' },
        { id: 'archive', label: 'Archive', icon: 'alert', disabled: true },
        {
          id: 'remove',
          label: 'Remove',
          icon: 'delete',
          variant: 'destructive',
        },
      ]}
    >
      <span className="cursor-context-menu text-primary underline underline-offset-4">
        Context menu on inline text
      </span>
    </ContextMenu>
  ),
};
