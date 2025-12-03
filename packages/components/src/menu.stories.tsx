/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
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
      <MenuItem label="Profile" icon="user" />
      <MenuItem label="Settings" icon="settings" />
      <MenuSeparator />
      <MenuItem label="Help" icon="info" />
    </MenuContent>
  </Menu>
);

export const Playground: Story = {
  render: () => <BaseMenu />,
};

export const SectionsAndStates: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost">Workspace</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Workspace</MenuLabel>
        <MenuItem label="Invite teammates" icon="users" />
        <MenuItem label="Create project" icon="add" />
        <MenuSeparator />
        <MenuLabel>Danger zone</MenuLabel>
        <MenuItem label="Archive workspace" icon="alert" disabled />
        <MenuItem
          label="Delete workspace"
          icon="delete"
          variant="destructive"
        />
      </MenuContent>
    </Menu>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Section labels, disabled states, and destructive variants help convey hierarchy and intent. Icons use the design system icon ids.',
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
