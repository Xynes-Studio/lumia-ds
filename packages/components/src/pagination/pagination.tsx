import type { ChangeEvent, HTMLAttributes } from 'react';
import { useMemo } from 'react';
import { Button } from '../button/button';
import { cn } from '../lib/utils';

export type PaginationProps = HTMLAttributes<HTMLElement> & {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

const pageSizeSelectClasses =
  'h-9 w-24 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  ...props
}: PaginationProps) {
  const safeTotal = Math.max(0, total);
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const isEmpty = safeTotal === 0;

  const normalizedPageSizeOptions = useMemo(() => {
    const merged = new Set<number>([...pageSizeOptions, safePageSize]);
    return Array.from(merged).sort((a, b) => a - b);
  }, [pageSizeOptions, safePageSize]);

  const canGoPrev = !isEmpty && currentPage > 1;
  const canGoNext = !isEmpty && currentPage < totalPages;

  const changePage = (target: number) => {
    if (isEmpty) return;
    const clamped = Math.min(Math.max(target, 1), totalPages);
    if (clamped === currentPage) return;
    onPageChange(clamped);
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!onPageSizeChange) return;
    const nextSize = Number(event.target.value);
    if (Number.isNaN(nextSize)) return;
    onPageSizeChange(nextSize);
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col gap-3 rounded-md border border-border/80 bg-background px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <select
              aria-label="Rows per page"
              value={safePageSize}
              className={pageSizeSelectClasses}
              onChange={handlePageSizeChange}
            >
              {normalizedPageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={!canGoPrev}
          onClick={() => changePage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={!canGoNext}
          onClick={() => changePage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
