import type {
  FocusEvent,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
} from 'react';
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Button } from '../button/button';
import { cn } from '../lib/utils';

type TableDensity = 'comfortable' | 'compact';
type TableAlignment = 'left' | 'center' | 'right';
export type TableSortDirection = 'asc' | 'desc' | 'none';
export type TableSortState = {
  columnId: string;
  direction: TableSortDirection;
};
export type TableRowAction<RowData = unknown> = {
  label: string;
  icon?: ReactNode;
  onClick: (row: RowData) => void;
};

export type TableColumn<RowData = unknown> = {
  id: string;
  label: string;
  sortable?: boolean;
  align?: TableAlignment;
  type?: 'data' | 'actions';
  renderCell?: (row: RowData) => ReactNode;
};

type TableContextValue = {
  density: TableDensity;
  zebra: boolean;
  stickyHeader: boolean;
  selectable: boolean;
  selectedRowIds: string[];
  registeredRowIds: string[];
  registerRow: (rowId: string) => void;
  unregisterRow: (rowId: string) => void;
  toggleRow: (rowId: string) => void;
  toggleAll: () => void;
  isRowSelected: (rowId: string) => boolean;
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
  selectAllDisabled: boolean;
};

const TableContext = createContext<TableContextValue>({
  density: 'comfortable',
  zebra: false,
  stickyHeader: false,
  selectable: false,
  selectedRowIds: [],
  registeredRowIds: [],
  registerRow: () => {},
  unregisterRow: () => {},
  toggleRow: () => {},
  toggleAll: () => {},
  isRowSelected: () => false,
  selectAllChecked: false,
  selectAllIndeterminate: false,
  selectAllDisabled: true,
});

const TableSectionContext = createContext<'header' | 'body'>('body');

const densityClasses: Record<TableDensity, string> = {
  comfortable: 'h-12 px-4 py-3',
  compact: 'h-10 px-3 py-2',
};

const alignmentClasses: Record<TableAlignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const useTableContext = () => useContext(TableContext);
const useTableSection = () => useContext(TableSectionContext);
const defaultSortCycle: TableSortDirection[] = ['asc', 'desc', 'none'];

const toAriaSort = (direction: TableSortDirection) => {
  switch (direction) {
    case 'asc':
      return 'ascending';
    case 'desc':
      return 'descending';
    default:
      return 'none';
  }
};

const getNextDirection = (
  current: TableSortDirection,
  cycle: TableSortDirection[],
): TableSortDirection => {
  if (cycle.length === 0) return current;

  const currentIndex = cycle.indexOf(current);
  if (currentIndex === -1) return cycle[0] ?? 'none';

  const nextIndex = (currentIndex + 1) % cycle.length;
  return cycle[nextIndex] ?? 'none';
};

const SortIcon = ({ direction }: { direction: TableSortDirection }) => (
  <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M5.25 9.5 8 12.25 10.75 9.5"
        className={cn(
          'transition-opacity',
          direction === 'desc' ? 'opacity-100' : 'opacity-50',
        )}
      />
      <path
        d="M5.25 6.5 8 3.75 10.75 6.5"
        className={cn(
          'transition-opacity',
          direction === 'asc' ? 'opacity-100' : 'opacity-50',
        )}
      />
    </svg>
  </span>
);

export type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  density?: TableDensity;
  zebra?: boolean;
  stickyHeader?: boolean;
  columns?: TableColumn[];
  selectable?: boolean;
  selectedRowIds?: string[];
  sort?: TableSortState | null;
  defaultSort?: TableSortState | null;
  sortCycle?: TableSortDirection[];
  bulkActions?: (selectedIds: string[]) => ReactNode;
  onSelectionChange?: (ids: string[]) => void;
  onSortChange?: (sort: TableSortState) => void;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    children,
    className,
    density = 'comfortable',
    zebra = false,
    stickyHeader = false,
    columns,
    selectable = false,
    selectedRowIds: controlledSelectedRowIds,
    sort: controlledSort,
    defaultSort = null,
    sortCycle,
    bulkActions,
    onSelectionChange,
    onSortChange,
    ...props
  },
  ref,
) {
  const tableRef = useRef<HTMLTableElement | null>(null);

  const isControlled = controlledSort !== undefined;
  const [internalSort, setInternalSort] = useState<TableSortState | null>(
    defaultSort,
  );

  const resolvedSort = isControlled ? (controlledSort ?? null) : internalSort;
  const resolvedCycle =
    sortCycle && sortCycle.length > 0 ? sortCycle : defaultSortCycle;

  const isSelectionControlled = controlledSelectedRowIds !== undefined;
  const [internalSelectedRowIds, setInternalSelectedRowIds] = useState<
    string[]
  >([]);
  const [registeredRowIds, setRegisteredRowIds] = useState<string[]>([]);
  const resolvedSelectedRowIds = isSelectionControlled
    ? (controlledSelectedRowIds ?? [])
    : internalSelectedRowIds;

  const handleSelectionChange = useCallback(
    (updater: (current: string[]) => string[]) => {
      if (isSelectionControlled) {
        const next = updater(resolvedSelectedRowIds);
        onSelectionChange?.(next);
        return;
      }

      setInternalSelectedRowIds((current) => {
        const next = updater(current);
        onSelectionChange?.(next);
        return next;
      });
    },
    [isSelectionControlled, onSelectionChange, resolvedSelectedRowIds],
  );

  const registerRow = useCallback((rowId: string) => {
    setRegisteredRowIds((current) =>
      current.includes(rowId) ? current : [...current, rowId],
    );
  }, []);

  const unregisterRow = useCallback(
    (rowId: string) => {
      setRegisteredRowIds((current) => current.filter((id) => id !== rowId));
      if (!isSelectionControlled) {
        setInternalSelectedRowIds((current) =>
          current.filter((id) => id !== rowId),
        );
      }
    },
    [isSelectionControlled],
  );

  const toggleRow = useCallback(
    (rowId: string) => {
      handleSelectionChange((current) => {
        const set = new Set(current);
        if (set.has(rowId)) {
          set.delete(rowId);
        } else {
          set.add(rowId);
        }
        return Array.from(set);
      });
    },
    [handleSelectionChange],
  );

  const toggleAll = useCallback(() => {
    handleSelectionChange((current) => {
      if (registeredRowIds.length === 0) return current;

      const allSelected = registeredRowIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !registeredRowIds.includes(id));
      }

      const set = new Set(current);
      registeredRowIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
  }, [handleSelectionChange, registeredRowIds]);

  const selectedOnPage = registeredRowIds.filter((id) =>
    resolvedSelectedRowIds.includes(id),
  );
  const selectAllChecked =
    registeredRowIds.length > 0 &&
    selectedOnPage.length === registeredRowIds.length;
  const selectAllIndeterminate =
    selectedOnPage.length > 0 &&
    selectedOnPage.length < registeredRowIds.length;
  const selectAllDisabled = registeredRowIds.length === 0;
  const bulkActionsContent = bulkActions?.(resolvedSelectedRowIds);
  const showBulkActions = Boolean(bulkActionsContent);

  useImperativeHandle(ref, () => tableRef.current as HTMLTableElement);

  const hasColumns = Boolean(columns && columns.length > 0);
  const headerDisplayName = TableHeader.displayName;
  const hasCustomHeader = Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      (child.type === TableHeader ||
        (!!headerDisplayName &&
          (child.type as { displayName?: string })?.displayName ===
            headerDisplayName)),
  );

  const handleSortToggle = (columnId: string) => {
    const currentDirection =
      resolvedSort?.columnId === columnId ? resolvedSort.direction : 'none';
    const nextDirection = getNextDirection(currentDirection, resolvedCycle);
    const nextSort: TableSortState = { columnId, direction: nextDirection };

    if (!isControlled) {
      setInternalSort(nextSort);
    }
    onSortChange?.(nextSort);
  };

  const autogeneratedHeader =
    hasColumns && !hasCustomHeader ? (
      <TableHeader>
        <TableRow>
          {columns?.map((column) => {
            const isActionsColumn = column.type === 'actions';
            const align: TableAlignment = isActionsColumn
              ? 'right'
              : (column.align ?? 'left');
            const direction =
              resolvedSort?.columnId === column.id
                ? resolvedSort.direction
                : 'none';
            const ariaSort =
              !isActionsColumn && column.sortable
                ? toAriaSort(direction)
                : undefined;
            const justifyContent =
              align === 'right'
                ? 'justify-end text-right'
                : align === 'center'
                  ? 'justify-center text-center'
                  : 'justify-start text-left';
            const label =
              column.label || (isActionsColumn ? 'Actions' : column.id);

            return (
              <TableCell
                key={column.id}
                as="th"
                align={align}
                aria-sort={ariaSort}
              >
                {!isActionsColumn && column.sortable ? (
                  <button
                    type="button"
                    aria-pressed={direction !== 'none'}
                    onClick={() => handleSortToggle(column.id)}
                    className={cn(
                      'group inline-flex w-full items-center gap-2 font-semibold tracking-wide text-muted-foreground',
                      justifyContent,
                    )}
                  >
                    <span className="whitespace-nowrap">{label}</span>
                    <SortIcon direction={direction} />
                  </button>
                ) : (
                  label
                )}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHeader>
    ) : null;

  return (
    <TableContext.Provider
      value={{
        density,
        zebra,
        stickyHeader,
        selectable,
        selectedRowIds: resolvedSelectedRowIds,
        registeredRowIds,
        registerRow,
        unregisterRow,
        toggleRow,
        toggleAll,
        isRowSelected: (rowId: string) =>
          resolvedSelectedRowIds.includes(rowId),
        selectAllChecked,
        selectAllIndeterminate,
        selectAllDisabled,
      }}
    >
      {showBulkActions ? (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/80 bg-muted/40 px-3 py-2 text-sm">
          {bulkActionsContent}
        </div>
      ) : null}
      <table
        ref={tableRef}
        className={cn(
          'w-full border border-border/80 bg-background text-sm text-foreground border-separate border-spacing-0 rounded-lg shadow-sm overflow-hidden',
          className,
        )}
        {...props}
      >
        {autogeneratedHeader}
        {children}
      </table>
    </TableContext.Provider>
  );
});

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(function TableHeader({ children, className, ...props }, ref) {
  return (
    <TableSectionContext.Provider value="header">
      <thead
        ref={ref}
        className={cn('bg-muted/60 text-muted-foreground', className)}
        {...props}
      >
        {children}
      </thead>
    </TableSectionContext.Provider>
  );
});

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ children, className, ...props }, ref) {
    return (
      <TableSectionContext.Provider value="body">
        <tbody
          ref={ref}
          className={cn(
            'bg-background [&_tr:last-child_td]:border-b-0 [&_tr:last-child_th]:border-b-0 [&_tr:last-child_td:first-child]:rounded-bl-lg [&_tr:last-child_td:last-child]:rounded-br-lg',
            className,
          )}
          {...props}
        >
          {children}
        </tbody>
      </TableSectionContext.Provider>
    );
  },
);

const OverflowIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className="h-4 w-4 text-muted-foreground"
    fill="currentColor"
  >
    <circle cx="8" cy="3.5" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="8" cy="12.5" r="1.25" />
  </svg>
);

export type TableRowActionsProps<RowData = unknown> = {
  row: RowData;
  primaryAction?: TableRowAction<RowData>;
  secondaryActions?: TableRowAction<RowData>[];
  menuLabel?: string;
  className?: string;
};

export function TableRowActions<RowData>({
  row,
  primaryAction,
  secondaryActions = [],
  menuLabel = 'More actions',
  className,
}: TableRowActionsProps<RowData>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSecondaryAction = (action: TableRowAction<RowData>) => {
    action.onClick(row);
    setOpen(false);
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && containerRef.current?.contains(next)) return;
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'inline-flex items-center justify-end gap-2 whitespace-nowrap',
        className,
      )}
      onBlurCapture={handleBlurCapture}
    >
      {primaryAction ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => primaryAction.onClick(row)}
          aria-label={primaryAction.label}
        >
          {primaryAction.icon ? (
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {primaryAction.icon}
              </span>
              <span>{primaryAction.label}</span>
            </span>
          ) : (
            primaryAction.label
          )}
        </Button>
      ) : null}
      {secondaryActions.length > 0 ? (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={menuLabel}
            onClick={() => setOpen((prev) => !prev)}
          >
            <OverflowIcon />
          </Button>
          {open ? (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-md border border-border/80 bg-background shadow-lg"
            >
              {secondaryActions.map((action, index) => (
                <button
                  key={`${action.label}-${index.toString()}`}
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => handleSecondaryAction(action)}
                >
                  {action.icon ? (
                    <span className="text-muted-foreground">{action.icon}</span>
                  ) : null}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type SelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onChange: () => void;
};

const SelectionCheckbox = ({
  checked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onChange,
}: SelectionCheckboxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-checked={indeterminate ? 'mixed' : checked}
        data-indeterminate={indeterminate || undefined}
      />
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-background shadow-sm transition',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ring-offset-background',
          'peer-checked:border-primary peer-checked:bg-primary peer-data-[indeterminate=true]:border-primary peer-data-[indeterminate=true]:bg-primary',
          'peer-disabled:border-border peer-disabled:bg-muted peer-disabled:text-muted-foreground peer-disabled:opacity-60',
          'peer-checked:[&>svg]:opacity-100 peer-data-[indeterminate=true]:[&>svg]:opacity-0 peer-data-[indeterminate=true]:[&>.checkbox-indeterminate]:opacity-100',
        )}
      >
        <svg
          viewBox="0 0 12 10"
          className="h-3 w-3 opacity-0 transition-opacity duration-150"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 5.2 4.5 8.5 11 1.5" />
        </svg>
        <span className="checkbox-indeterminate absolute block h-0.5 w-3 rounded bg-background opacity-0 transition-opacity duration-150" />
      </span>
    </label>
  );
};

type SelectionCellProps = SelectionCheckboxProps & {
  as: 'td' | 'th';
};

const SelectionCell = ({
  as,
  checked,
  disabled,
  indeterminate,
  ariaLabel,
  onChange,
}: SelectionCellProps) => (
  <TableCell
    as={as}
    align="center"
    className="w-12 px-3 text-center"
    aria-label={ariaLabel}
  >
    <SelectionCheckbox
      checked={checked}
      disabled={disabled}
      indeterminate={indeterminate}
      onChange={onChange}
      ariaLabel={ariaLabel}
    />
  </TableCell>
);

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  rowId?: string;
  disableSelection?: boolean;
  selectionLabel?: string;
};
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow(
    {
      className,
      children,
      rowId,
      disableSelection = false,
      selectionLabel,
      ...props
    },
    ref,
  ) {
    const {
      zebra,
      selectable,
      registerRow,
      unregisterRow,
      toggleRow,
      isRowSelected,
      selectAllChecked,
      selectAllDisabled,
      selectAllIndeterminate,
      toggleAll,
    } = useTableContext();
    const section = useTableSection();
    const shouldHandleSelection =
      selectable && section === 'body' && !disableSelection && !!rowId;

    useEffect(() => {
      if (!rowId) return;
      if (!shouldHandleSelection) {
        unregisterRow(rowId);
        return;
      }

      registerRow(rowId);
      return () => unregisterRow(rowId);
    }, [registerRow, unregisterRow, rowId, shouldHandleSelection]);

    const selectionCell =
      selectable && section === 'header' ? (
        <SelectionCell
          as="th"
          ariaLabel="Select all rows"
          checked={selectAllChecked}
          indeterminate={selectAllIndeterminate}
          disabled={selectAllDisabled}
          onChange={toggleAll}
        />
      ) : selectable && section === 'body' ? (
        <SelectionCell
          as="td"
          ariaLabel={selectionLabel ?? 'Select row'}
          checked={rowId ? isRowSelected(rowId) : false}
          disabled={!rowId || disableSelection}
          onChange={() => (rowId ? toggleRow(rowId) : undefined)}
          indeterminate={false}
        />
      ) : null;

    return (
      <tr
        ref={ref}
        className={cn(
          'transition-colors',
          section === 'body' && 'hover:bg-muted/40',
          section === 'body' && zebra && 'odd:bg-muted/30',
          section === 'body' &&
            selectable &&
            rowId &&
            isRowSelected(rowId) &&
            'bg-primary/5',
          className,
        )}
        aria-selected={
          section === 'body' && selectable && rowId
            ? isRowSelected(rowId)
            : undefined
        }
        {...props}
      >
        {selectionCell}
        {children}
      </tr>
    );
  },
);

export type TableCellProps = HTMLAttributes<HTMLTableCellElement> & {
  as?: 'td' | 'th';
  align?: TableAlignment;
};

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell(
    { as = 'td', align = 'left', className, children, ...props },
    ref,
  ) {
    const { density, stickyHeader } = useTableContext();
    const section = useTableSection();
    const Component = as;
    const isHeaderCell = section === 'header' || as === 'th';

    return (
      <Component
        ref={ref as never}
        className={cn(
          'align-middle border-b border-border/70',
          densityClasses[density],
          alignmentClasses[align],
          isHeaderCell
            ? 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'
            : 'text-sm text-foreground',
          stickyHeader &&
            isHeaderCell &&
            'sticky top-0 z-10 bg-muted/70 backdrop-blur-sm',
          section === 'header' && 'first:rounded-tl-lg last:rounded-tr-lg',
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
