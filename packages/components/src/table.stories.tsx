/* istanbul ignore file */
import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Button } from './button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './table';
import type { TableColumn, TableSortState } from './table';

const roster = [
  {
    name: 'Ava Green',
    role: 'Product Designer',
    location: 'Remote',
    status: 'Active',
  },
  {
    name: 'Miles Hart',
    role: 'Engineering Manager',
    location: 'New York, USA',
    status: 'Active',
  },
  {
    name: 'Priya Shah',
    role: 'Staff Engineer',
    location: 'Toronto, CA',
    status: 'On leave',
  },
  {
    name: 'Kai Lee',
    role: 'Researcher',
    location: 'Seoul, KR',
    status: 'Active',
  },
  {
    name: 'Lucia Gomez',
    role: 'Data Scientist',
    location: 'Madrid, ES',
    status: 'Contract',
  },
  {
    name: 'Robin Xu',
    role: 'QA Lead',
    location: 'Singapore',
    status: 'Active',
  },
];

const rosterColumns: TableColumn[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'role', label: 'Role', sortable: true },
  { id: 'location', label: 'Location' },
  { id: 'status', label: 'Status', sortable: true, align: 'right' },
];

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  args: {
    density: 'comfortable',
    zebra: true,
    stickyHeader: false,
    selectable: false,
  },
  argTypes: {
    density: {
      control: 'select',
      options: ['comfortable', 'compact'],
    },
    zebra: {
      control: 'boolean',
    },
    stickyHeader: {
      control: 'boolean',
    },
    selectable: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof Table>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-5xl overflow-hidden rounded-lg border border-border bg-background p-4 shadow-sm">
      <Table {...args}>
        <TableHeader>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Role</TableCell>
            <TableCell as="th">Location</TableCell>
            <TableCell as="th" align="right">
              Status
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster.map((person) => (
            <TableRow key={person.name} rowId={person.name}>
              <TableCell>{person.name}</TableCell>
              <TableCell>{person.role}</TableCell>
              <TableCell>{person.location}</TableCell>
              <TableCell align="right">{person.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

export const SortableColumns: Story = {
  render: (args) => {
    const [sortState, setSortState] = useState<TableSortState | null>(null);

    const sortedRoster = useMemo(() => {
      if (!sortState || sortState.direction === 'none') return roster;

      const sorted = [...roster].sort((a, b) => {
        const key = sortState.columnId as keyof (typeof roster)[number];
        const first = a[key]?.toString() ?? '';
        const second = b[key]?.toString() ?? '';
        return first.localeCompare(second, undefined, { sensitivity: 'base' });
      });

      return sortState.direction === 'asc' ? sorted : sorted.reverse();
    }, [sortState]);

    return (
      <div className="max-w-5xl overflow-hidden rounded-lg border border-border bg-background p-4 shadow-sm">
        <Table
          {...args}
          columns={rosterColumns}
          sort={sortState}
          onSortChange={setSortState}
        >
          <TableBody>
            {(sortState ? sortedRoster : roster).map((person) => (
              <TableRow key={person.name} rowId={person.name}>
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell>{person.location}</TableCell>
                <TableCell align="right">{person.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Headers are derived from the columns config. Sorting is handled by the consuming screen while the table only emits the requested direction.',
      },
    },
  },
};

export const RowSelectionWithBulkActions: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const clearSelection = () => setSelectedIds([]);

    return (
      <div className="max-w-5xl overflow-hidden rounded-lg border border-border bg-background p-4 shadow-sm">
        <Table
          {...args}
          selectable
          selectedRowIds={selectedIds}
          onSelectionChange={setSelectedIds}
          bulkActions={(ids) => (
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {ids.length === 0
                  ? 'No rows selected'
                  : `${ids.length} selected`}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={ids.length === 0}
                  onClick={clearSelection}
                >
                  Clear
                </Button>
                <Button size="sm" disabled={ids.length === 0}>
                  Archive
                </Button>
              </div>
            </div>
          )}
        >
          <TableHeader>
            <TableRow>
              <TableCell as="th">Name</TableCell>
              <TableCell as="th">Role</TableCell>
              <TableCell as="th">Location</TableCell>
              <TableCell as="th" align="right">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((person) => (
              <TableRow key={person.name} rowId={person.name}>
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell>{person.location}</TableCell>
                <TableCell align="right">{person.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Enables row selection with a select-all checkbox and a bulk actions bar that receives the selected row IDs.',
      },
    },
  },
};

const manyRows = Array.from({ length: 120 }, (_, index) => ({
  id: index + 1,
  owner: index % 3 === 0 ? 'Platform' : index % 2 === 0 ? 'Design' : 'Payments',
  uptime: `${99 + (index % 5) * 0.1}%`,
  alerts: index % 4 === 0 ? '2 open' : 'None',
}));

export const StickyHeaderWithManyRows: Story = {
  render: () => (
    <div className="max-w-5xl rounded-lg border border-border bg-background p-4 shadow-sm">
      <p className="mb-3 text-sm text-muted">
        Sticky headers stay visible while scrolling, and compact density keeps
        high row counts legible.
      </p>
      <div className="max-h-[420px] overflow-auto rounded-md border border-border/80">
        <Table density="compact" zebra stickyHeader>
          <TableHeader>
            <TableRow>
              <TableCell as="th">Service</TableCell>
              <TableCell as="th">Owner</TableCell>
              <TableCell as="th" align="right">
                Uptime
              </TableCell>
              <TableCell as="th" align="right">
                Alerts
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manyRows.map((row) => (
              <TableRow key={row.id} rowId={row.id.toString()}>
                <TableCell>svc-{row.id.toString().padStart(3, '0')}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell align="right">{row.uptime}</TableCell>
                <TableCell align="right">{row.alerts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Shows sticky headers and compact padding while rendering 100+ rows without pagination or virtualization.',
      },
    },
  },
};
