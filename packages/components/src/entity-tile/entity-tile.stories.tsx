/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import {
  EntityTile,
  type TileActionItem,
  UserTile,
  AppTile,
} from './entity-tile';

const appActions: TileActionItem<{ id: string; name: string }>[] = [
  {
    id: 'pin',
    label: 'Pin app',
    icon: 'check',
    onSelect: () => undefined,
  },
  {
    id: 'settings',
    label: 'Configure app',
    icon: 'settings',
    onSelect: () => undefined,
  },
  {
    id: 'remove',
    label: 'Remove app',
    icon: 'delete',
    destructive: true,
    onSelect: () => undefined,
  },
];

const userActions: TileActionItem<{ id: string; name: string }>[] = [
  {
    id: 'message',
    label: 'Message user',
    icon: 'chat-bubble',
    onSelect: () => undefined,
  },
  {
    id: 'settings',
    label: 'User settings',
    icon: 'settings',
    onSelect: () => undefined,
  },
];

const meta = {
  title: 'Components/EntityTile',
  component: EntityTile,
  tags: ['autodocs'],
  args: {
    tileId: 'tile-1',
    view: 'grid',
    title: 'Xynes-CMS',
    avatarSrc: 'https://avatar.vercel.sh/xynes-cms',
    actions: appActions,
    selectable: true,
    selected: false,
  },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof EntityTile>;

export default meta;

type Story = StoryObj<typeof EntityTile>;

export const Grid: Story = {
  render: (args) => <EntityTile {...args} view="grid" />,
};

export const List: Story = {
  render: (args) => (
    <div className="w-full max-w-3xl">
      <EntityTile
        {...args}
        view="list"
        title="Xynes-CMS"
        avatarSrc="https://avatar.vercel.sh/xynes-cms-list"
      />
    </div>
  ),
};

export const AppAndUserVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <AppTile
          tileId="app-grid"
          view="grid"
          title="Xynes-CMS"
          avatarSrc="https://avatar.vercel.sh/xynes-cms-app"
          selectable
          actions={appActions}
        />
        <UserTile
          tileId="user-grid"
          view="grid"
          name="User Name"
          designation="Designation"
          teamName="Team Name"
          avatarSrc="https://avatar.vercel.sh/user-grid"
          selectable
          actions={userActions}
        />
      </div>
      <div className="space-y-3">
        <AppTile
          tileId="app-list"
          view="list"
          title="Xynes-CMS"
          avatarSrc="https://avatar.vercel.sh/xynes-cms-list-app"
          selectable
          actions={appActions}
        />
        <UserTile
          tileId="user-list"
          view="list"
          name="User Name"
          designation="Designation"
          teamName="Team Name"
          avatarSrc="https://avatar.vercel.sh/user-list"
          selectable
          actions={userActions}
        />
      </div>
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div data-theme="dark" className="rounded-lg bg-background p-4">
      <div className="w-full max-w-3xl space-y-3">
        <AppTile
          tileId="dark-app"
          view="list"
          title="Xynes-CMS"
          avatarSrc="https://avatar.vercel.sh/dark-app"
          selectable
          selected
          actions={appActions}
        />
        <UserTile
          tileId="dark-user"
          view="list"
          name="User Name"
          designation="Designation"
          teamName="Team Name"
          avatarSrc="https://avatar.vercel.sh/dark-user"
          selectable
          actions={userActions}
        />
      </div>
    </div>
  ),
};
