/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import { FilterBar, QuickFilter } from './filter-bar';

const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    searchPlaceholder: 'Search users',
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof FilterBar>;

const buildFilters = (status: string, role: string): QuickFilter[] => [
  {
    type: 'select',
    name: 'status',
    placeholder: 'Status',
    value: status,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Invited', value: 'invited' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
  {
    type: 'chip',
    name: 'role',
    label: 'All roles',
    value: 'all',
    selected: role === 'all',
  },
  {
    type: 'chip',
    name: 'role',
    label: 'Admins',
    value: 'admin',
    selected: role === 'admin',
  },
  {
    type: 'chip',
    name: 'role',
    label: 'Editors',
    value: 'editor',
    selected: role === 'editor',
  },
];

export const Playground: Story = {
  render: (args) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [role, setRole] = useState('all');

    const quickFilters = buildFilters(status, role);

    return (
      <div className="space-y-3">
        <FilterBar
          {...args}
          searchValue={search}
          onSearchChange={setSearch}
          quickFilters={quickFilters}
          onFilterChange={(name, value) => {
            if (name === 'status') {
              setStatus(value);
              return;
            }

            if (name === 'role') {
              setRole(value);
            }
          }}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                Export
              </Button>
              <Button size="sm">Add user</Button>
            </div>
          }
        />
        <div className="text-sm text-muted">
          <p>
            Search: <span className="font-medium">{search || '—'}</span>
          </p>
          <p>
            Status:{' '}
            <span className="font-medium">
              {status ? status : 'any status'}
            </span>
          </p>
          <p>
            Role:{' '}
            <span className="font-medium">
              {role === 'all' ? 'all roles' : role}
            </span>
          </p>
        </div>
      </div>
    );
  },
};

export const ActionsOnly: Story = {
  render: (args) => (
    <FilterBar
      {...args}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary">
            Export CSV
          </Button>
          <Button size="sm" variant="primary">
            Add user
          </Button>
        </div>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Layout remains balanced when search or quick filters are omitted.',
      },
    },
  },
};
