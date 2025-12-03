/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@lumia/icons';
import { Button } from './button';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from './menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof Menu>;

const BaseMenu = () => (
  <Menu>
    <MenuTrigger asChild>
      <Button variant="secondary">Open menu</Button>
    </MenuTrigger>
    <MenuContent>
      <MenuItem label="Profile" />
      <MenuItem label="Settings" />
      <MenuSeparator />
      <MenuItem label="Sign out" />
    </MenuContent>
  </Menu>
);

export const Playground: Story = {
  render: () => <BaseMenu />,
};

export const WithIcons: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost">More actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem
          label="Create"
          icon={<Icon id="sparkle" size={16} className="text-primary-600" />}
        />
        <MenuItem
          label="Edit"
          icon={<Icon id="user" size={16} className="text-foreground" />}
        />
        <MenuSeparator />
        <MenuItem
          label="Delete"
          icon={
            <Icon id="chat-bubble" size={16} className="text-destructive" />
          }
        />
      </MenuContent>
    </Menu>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Items can display optional icons for quicker scanning. All items remain keyboard accessible and support Enter/Space to trigger onSelect.',
      },
    },
  },
};

export const CustomTrigger: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <span className="cursor-pointer text-primary underline underline-offset-4">
          Inline trigger
        </span>
      </MenuTrigger>
      <MenuContent>
        <MenuItem label="First action" />
        <MenuItem label="Second action" />
      </MenuContent>
    </Menu>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'MenuTrigger accepts any ReactNode via asChild, enabling icon buttons, text links, or custom controls as triggers.',
      },
    },
  },
};
