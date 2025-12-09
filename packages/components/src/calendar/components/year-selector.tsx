import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';

export interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export const YearSelector = ({
  value,
  onChange,
  minYear = 1900,
  maxYear = 2100,
  className,
}: YearSelectorProps) => {
  const years = useMemo(() => {
    const result = [];
    // Ensure the current value is within the range to some extent or handled
    // But we generate the list based on min/max
    for (let year = minYear; year <= maxYear; year++) {
      result.push(year);
    }
    return result;
  }, [minYear, maxYear]);

  return (
    <div
      className={cn(
        'flex flex-wrap gap-4 p-2 max-h-64 overflow-y-auto justify-center',
        className,
      )}
    >
      {years.map((year) => (
        <button
          key={year}
          onClick={(e) => {
            e.stopPropagation();
            onChange(year);
          }}
          type="button"
          ref={(element) => {
            // Scroll to selected year on mount
            if (value === year && element) {
              element.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
          }}
          className={cn(
            'px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center justify-center border border-transparent min-w-[72px]',
            value === year &&
              'bg-primary text-white hover:bg-primary shadow-sm',
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
};
