# Table wrapper (DS-701, DS-703, DS-704)

Design-system table wrapper around Shadcn primitives with DS tokens and a minimal API. Supports optional column configs and sortable headers; data ordering remains the caller’s responsibility.

## Exports
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableRowActions` from `@lumia-ui/components`.

## Props
- `Table`
  - `density?: 'comfortable' | 'compact'` (default: `comfortable`) – controls row height and padding.
  - `zebra?: boolean` (default: `false`) – applies `odd` row striping in the body.
  - `stickyHeader?: boolean` (default: `false`) – keeps header cells pinned with a subtle backdrop blur.
  - `selectable?: boolean` (default: `false`) – shows a selection column with row and header checkboxes.
  - `selectedRowIds?: string[]` – controlled selection state; when omitted the table tracks selection internally.
  - `onSelectionChange?: (ids: string[]) => void` – fired when rows are toggled or select-all is used.
  - `bulkActions?: (selectedIds: string[]) => React.ReactNode` – optional render prop placed above the table with the current selection.
  - `columns?: { id: string; label: string; sortable?: boolean; align?: 'left' | 'center' | 'right'; type?: 'data' | 'actions'; renderCell?: (row: RowData) => React.ReactNode }[]` – when provided (and no custom `<TableHeader>` is rendered) the header row is generated from this config. Set `type: 'actions'` for a dedicated actions column; it renders right-aligned with sorting disabled.
  - `sort?: { columnId: string; direction: 'asc' | 'desc' | 'none' } | null` – controlled sort state.
  - `defaultSort?: { columnId: string; direction: 'asc' | 'desc' | 'none' } | null` – uncontrolled initial sort state.
  - `sortCycle?: Array<'asc' | 'desc' | 'none'>` – optional custom order for cycling directions (defaults to `['asc', 'desc', 'none']`).
  - `onSortChange?: (sort: { columnId: string; direction: 'asc' | 'desc' | 'none' }) => void` – fired when a sortable header is clicked.
- `TableRow`
  - `rowId?: string` – supply when `selectable` is enabled so the table can track selection for the row.
  - `disableSelection?: boolean` – renders the selection checkbox disabled for a specific row.
  - `selectionLabel?: string` – accessible label for the row’s checkbox (default: `Select row`).
- `TableCell`
  - `as?: 'td' | 'th'` – defaults to `td`; use `th` for headers.
  - `align?: 'left' | 'center' | 'right'` (default: `left`).
- `TableRowActions`
  - `row: RowData` – row payload passed to action callbacks.
  - `primaryAction?: { label: string; icon?: React.ReactNode; onClick: (row: RowData) => void }`.
  - `secondaryActions?: Array<{ label: string; icon?: React.ReactNode; onClick: (row: RowData) => void }>` – rendered in an overflow menu.
  - `menuLabel?: string` – accessible label for the overflow trigger (default: `More actions`).

## Usage
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@lumia-ui/components';

export function UsersTable() {
  return (
    <Table density="compact" zebra stickyHeader>
      <TableHeader>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Role</TableCell>
          <TableCell as="th" align="right">
            Status
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Engineer</TableCell>
          <TableCell align="right">Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### With selectable rows and bulk actions
```tsx
import { useState } from 'react';
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@lumia-ui/components';

export function SelectableUsers({
  rows,
}: {
  rows: { id: string; name: string; role: string; status: string }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Table
      selectable
      selectedRowIds={selected}
      onSelectionChange={setSelected}
      bulkActions={(ids) => (
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground -foreground">
            {ids.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelected([])}
              disabled={ids.length === 0}
            >
              Clear
            </Button>
            <Button size="sm" disabled={ids.length === 0}>
              Export
            </Button>
          </div>
        </div>
      )}
    >
      <TableHeader>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Role</TableCell>
          <TableCell as="th" align="right">
            Status
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} rowId={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell align="right">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### With generated sortable headers
```tsx
import { useMemo, useState } from 'react';
import type { TableColumn, TableSortState } from '@lumia-ui/components';
import { Table, TableBody, TableCell, TableRow } from '@lumia-ui/components';

const columns: TableColumn[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'role', label: 'Role', sortable: true },
  { id: 'status', label: 'Status', sortable: true, align: 'right' },
];

export function SortableRoster({ rows }: { rows: { name: string; role: string; status: string }[] }) {
  const [sort, setSort] = useState<TableSortState | null>(null);

  const sorted = useMemo(() => {
    if (!sort || sort.direction === 'none') return rows;
    const sortedRows = [...rows].sort((a, b) =>
      a[sort.columnId as keyof typeof a]?.toString().localeCompare(
        b[sort.columnId as keyof typeof b]?.toString(),
        undefined,
        { sensitivity: 'base' },
      ),
    );
    return sort.direction === 'asc' ? sortedRows : sortedRows.reverse();
  }, [rows, sort]);

  return (
    <Table columns={columns} sort={sort} onSortChange={setSort}>
      <TableBody>
        {(sort ? sorted : rows).map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell align="right">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Inline row actions (actions column + overflow menu)
```tsx
import type React from 'react';
import type { TableColumn } from '@lumia-ui/components';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableRowActions,
} from '@lumia-ui/components';

type Row = { id: string; name: string; role: string; location: string };

const columns: TableColumn<Row>[] = [
  { id: 'name', label: 'Name', sortable: true, renderCell: (row) => row.name },
  { id: 'role', label: 'Role', sortable: true, renderCell: (row) => row.role },
  { id: 'location', label: 'Location', renderCell: (row) => row.location },
  {
    id: 'actions',
    type: 'actions',
    label: 'Actions',
    renderCell: (row) => (
      <TableRowActions
        row={row}
        primaryAction={{ label: 'Edit', onClick: () => console.log('Edit', row.id) }}
        secondaryActions={[
          { label: 'Duplicate', onClick: () => console.log('Duplicate', row.id) },
          { label: 'Archive', onClick: () => console.log('Archive', row.id) },
        ]}
      />
    ),
  },
];

export function RosterWithActions({ rows }: { rows: Row[] }) {
  return (
    <Table columns={columns}>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} rowId={row.id}>
            {columns.map((column) => (
              <TableCell
                key={`${row.id}-${column.id}`}
                align={column.type === 'actions' ? 'right' : column.align}
              >
                {column.renderCell ? column.renderCell(row) : (row as Record<string, React.ReactNode>)[column.id]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Notes
- Styling aligns with DS tokens for borders, hover state, and typography.
- No built-in pagination/virtualization; intended for straightforward data lists up to a few hundred rows. Sorting is header-only and leaves data ordering to the consumer.
- Sticky header works when the table sits inside a scrollable container.
- When `selectable` is enabled, rows need a stable `rowId`. The header checkbox is disabled for empty pages and moves to an indeterminate state when only some rows are selected.
