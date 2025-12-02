import type { ReactNode } from 'react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  type TableSortState,
} from './table';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const renderIntoDom = async (node: ReactNode) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  await act(async () => {
    root.render(node);
  });

  return { host, root };
};

describe('Table component suite', () => {
  it('renders with comfortable density and base styling', async () => {
    const { host, root } = await renderIntoDom(
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Role</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = host.querySelector('table');
    const bodyCell = host.querySelector('tbody td');

    expect(table?.className).toContain('border-border/80');
    expect(bodyCell?.className).toContain('h-12');
    expect(bodyCell?.className).toContain('px-4');
    expect(bodyCell?.className).toContain('border-b');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies compact density, zebra striping, and alignment', async () => {
    const { host, root } = await renderIntoDom(
      <Table density="compact" zebra>
        <TableBody>
          <TableRow>
            <TableCell align="right">1</TableCell>
            <TableCell>First</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="right">2</TableCell>
            <TableCell>Second</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const rows = host.querySelectorAll('tbody tr');
    const cell = host.querySelector('tbody td');

    expect(rows[0]?.className).toContain('hover:bg-muted/40');
    expect(rows[0]?.className).toContain('odd:bg-muted/30');
    expect(cell?.className).toContain('h-10');
    expect(cell?.className).toContain('px-3');
    expect(cell?.className).toContain('text-right');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports sticky headers with styled header cells', async () => {
    const { host, root } = await renderIntoDom(
      <Table stickyHeader>
        <TableHeader>
          <TableRow>
            <TableCell as="th">ID</TableCell>
            <TableCell as="th">Status</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>001</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const headerCell = host.querySelector('thead th');

    expect(headerCell?.className).toContain('sticky');
    expect(headerCell?.className).toContain('top-0');
    expect(headerCell?.className).toContain('bg-muted/70');
    expect(headerCell?.className).toContain('uppercase');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports row selection and select-all toggling', async () => {
    const onSelectionChange = vi.fn((ids: string[]) => ids);

    const { host, root } = await renderIntoDom(
      <Table selectable onSelectionChange={onSelectionChange}>
        <TableHeader>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Role</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow rowId="1">
            <TableCell>Ada</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
          <TableRow rowId="2">
            <TableCell>Lin</TableCell>
            <TableCell>Designer</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const checkboxes = host.querySelectorAll('input[type="checkbox"]');
    const headerCheckbox = checkboxes[0] as HTMLInputElement | undefined;
    const firstRowCheckbox = checkboxes[1] as HTMLInputElement | undefined;

    expect(headerCheckbox?.disabled).toBe(false);
    expect(firstRowCheckbox?.disabled).toBe(false);

    await act(async () => {
      firstRowCheckbox?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1']);
    expect(firstRowCheckbox?.checked).toBe(true);

    await act(async () => {
      headerCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2']);

    await act(async () => {
      headerCheckbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('disables select-all for empty tables', async () => {
    const { host, root } = await renderIntoDom(
      <Table selectable>
        <TableHeader>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Role</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>,
    );

    const emptyHeaderCheckbox = host.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement | null;
    expect(emptyHeaderCheckbox?.disabled).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('shows an indeterminate select-all checkbox for partial selections', async () => {
    const { host, root } = await renderIntoDom(
      <Table selectable selectedRowIds={['1']}>
        <TableHeader>
          <TableRow>
            <TableCell as="th">Name</TableCell>
            <TableCell as="th">Role</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow rowId="1">
            <TableCell>Ada</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
          <TableRow rowId="2">
            <TableCell>Lin</TableCell>
            <TableCell>Designer</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const headerCheckbox = host.querySelector(
      'thead input[type="checkbox"]',
    ) as HTMLInputElement | null;
    expect(headerCheckbox?.getAttribute('aria-checked')).toBe('mixed');
    expect(headerCheckbox?.indeterminate).toBe(true);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders sortable column headers and cycles through directions', async () => {
    const onSortChange = vi.fn((state: TableSortState) => state);

    const { host, root } = await renderIntoDom(
      <Table
        columns={[
          { id: 'name', label: 'Name', sortable: true },
          { id: 'role', label: 'Role' },
        ]}
        defaultSort={{ columnId: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      >
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const headerCells = host.querySelectorAll('thead th');
    expect(headerCells[0]?.getAttribute('aria-sort')).toBe('ascending');
    expect(headerCells[1]?.getAttribute('aria-sort')).toBeNull();

    const toggle = headerCells[0]?.querySelector('button');
    expect(toggle).not.toBeNull();

    await act(async () => {
      toggle!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onSortChange).toHaveBeenLastCalledWith({
      columnId: 'name',
      direction: 'desc',
    });
    expect(headerCells[0]?.getAttribute('aria-sort')).toBe('descending');

    await act(async () => {
      toggle!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onSortChange).toHaveBeenLastCalledWith({
      columnId: 'name',
      direction: 'none',
    });
    expect(headerCells[0]?.getAttribute('aria-sort')).toBe('none');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
