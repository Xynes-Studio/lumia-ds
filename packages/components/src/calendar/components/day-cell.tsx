import React from 'react';
import { DayCellProps } from '../types/day-cell.types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export const DayCell = ({
  date,
  isSelected,
  isToday,
  isOutside,
  isDisabled,
  isRangeStart,
  isRangeEnd,
  isRangeMiddle,
  onClick,
  className,
  children,
}: DayCellProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={format(date, 'MMMM d, yyyy')}
      className={cn(
        'h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md text-sm transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        isSelected && 'bg-primary text-white hover:bg-primary',
        isToday && !isSelected && 'bg-accent text-accent-foreground',
        isOutside && !isSelected && 'text-muted-foreground opacity-50',
        isRangeMiddle && 'bg-secondary text-secondary-foreground rounded-none',
        isRangeStart && 'rounded-r-none',
        isRangeEnd && 'rounded-l-none',
        className,
      )}
    >
      {children ?? format(date, 'd')}
    </button>
  );
};
