import type {
  ChangeEvent,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  FormEvent,
} from 'react';
import { Button } from './button';
import { Input } from './input';
import { Select } from './select';
import { cn } from './utils';

type QuickFilterOption = {
  label: string;
  value: string;
};

type SelectQuickFilter = {
  type: 'select';
  name: string;
  placeholder?: string;
  value?: string;
  options: QuickFilterOption[];
  disabled?: boolean;
};

type ChipQuickFilter = {
  type: 'chip';
  name: string;
  label: string;
  value: string;
  selected?: boolean;
  disabled?: boolean;
};

export type QuickFilter = SelectQuickFilter | ChipQuickFilter;

export type FilterBarProps = HTMLAttributes<HTMLDivElement> & {
  searchValue?: string;
  defaultSearchValue?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  searchSlot?: ReactNode;
  quickFilters?: QuickFilter[];
  filtersSlot?: ReactNode;
  actions?: ReactNode;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (name: string, value: string) => void;
};

export const FilterBar = ({
  className,
  searchValue,
  defaultSearchValue,
  searchPlaceholder = 'Search',
  searchLabel = 'Search',
  searchSlot,
  quickFilters,
  filtersSlot,
  actions,
  onSearchChange,
  onFilterChange,
  ...props
}: FilterBarProps): ReactElement => {
  const shouldRenderSearch =
    searchSlot !== undefined ||
    onSearchChange !== undefined ||
    searchValue !== undefined ||
    defaultSearchValue !== undefined;

  const hasFilters = Boolean(quickFilters?.length || filtersSlot);

  const searchValueProps =
    searchValue !== undefined
      ? { value: searchValue }
      : defaultSearchValue !== undefined
        ? { defaultValue: defaultSearchValue }
        : {};

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>,
  ) => {
    onSearchChange?.(event.currentTarget.value);
  };

  const renderQuickFilter = (filter: QuickFilter, index: number) => {
    if (filter.type === 'select') {
      const valueProps =
        filter.value !== undefined ? { value: filter.value } : {};

      return (
        <Select
          key={`select-${filter.name}-${index}`}
          aria-label={filter.placeholder ?? filter.name}
          className="min-w-[160px]"
          disabled={filter.disabled}
          {...valueProps}
          onChange={(event) =>
            onFilterChange?.(filter.name, event.target.value)
          }
        >
          {filter.placeholder ? (
            <option value="">{filter.placeholder}</option>
          ) : null}
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }

    return (
      <Button
        key={`chip-${filter.name}-${filter.value}-${index}`}
        variant={filter.selected ? 'secondary' : 'ghost'}
        size="sm"
        className="rounded-full px-3"
        aria-pressed={filter.selected || undefined}
        disabled={filter.disabled}
        onClick={() => onFilterChange?.(filter.name, filter.value)}
      >
        {filter.label}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3',
        className,
      )}
      {...props}
    >
      {shouldRenderSearch || hasFilters ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          {shouldRenderSearch ? (
            <div className="min-w-[220px] flex-1 sm:w-72 sm:flex-none">
              {searchSlot ?? (
                <Input
                  aria-label={searchLabel}
                  placeholder={searchPlaceholder}
                  {...searchValueProps}
                  onChange={handleSearchChange}
                  onInput={handleSearchChange}
                />
              )}
            </div>
          ) : null}
          {hasFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              {quickFilters?.map(renderQuickFilter)}
              {filtersSlot}
            </div>
          ) : null}
        </div>
      ) : null}
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};
