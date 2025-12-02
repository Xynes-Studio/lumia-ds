# Pagination (DS-702)

Reusable pagination bar for tables and flat lists with accessible navigation controls.

## Exports
- `Pagination` from `@lumia/components`.

## Props
- `page: number` – current 1-based page.
- `pageSize: number` – items per page.
- `total: number` – total item count; navigation disables automatically when zero.
- `onPageChange: (page: number) => void` – called when Prev/Next is activated.
- `onPageSizeChange?: (size: number) => void` – show a page-size dropdown and emit numeric size.
- `pageSizeOptions?: number[]` (default: `[10, 20, 50]`) – dropdown values; always includes the current `pageSize`.

## Usage
```tsx
import { Pagination, Table, TableBody, TableCell, TableHeader, TableRow } from '@lumia/components';
import { useMemo, useState } from 'react';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const data = useUsers({ page, pageSize }); // returns { total, rows }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / pageSize)),
    [data.total, pageSize],
  );

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Role</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={data.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
```

## Notes
- Prev/Next buttons are keyboard-accessible (Tab + Enter/Space) and use DS focus rings.
- Buttons disable when on the first/last page or when `total` is 0; page display clamps invalid inputs.
- Dropdown only appears when `onPageSizeChange` is provided; current page size is always selectable.
