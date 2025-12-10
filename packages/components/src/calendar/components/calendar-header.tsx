import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export interface CalendarHeaderProps {
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  onMonthClick?: () => void;
  onYearClick?: () => void;
  isMonthSelectorOpen?: boolean;
  isYearSelectorOpen?: boolean;
}

export const CalendarHeader = ({
  month,
  onPrevMonth,
  onNextMonth,
  onMonthClick,
  onYearClick,
  isMonthSelectorOpen,
  isYearSelectorOpen,
}: CalendarHeaderProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between pt-1 relative',
        // className, // className is removed from destructuring, so this line is commented out or removed
      )}
    >
      {/* 1. Chevron Left */}
      <button
        aria-label="Previous Month"
        onClick={onPrevMonth}
        disabled={isMonthSelectorOpen || isYearSelectorOpen}
        type="button"
        className={cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center hover:bg-muted rounded-md transition-colors',
          (isMonthSelectorOpen || isYearSelectorOpen) &&
            'opacity-20 cursor-not-allowed hover:bg-transparent hover:opacity-20',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">
        {/* 2. Month - Clickable */}
        {/* 2. Month - Clickable */}
        <button
          type="button"
          onClick={onMonthClick}
          className={cn(
            'text-sm font-medium hover:bg-muted px-2 py-1 rounded-md transition-colors',
            (isMonthSelectorOpen || isYearSelectorOpen) && 'bg-muted',
          )}
        >
          {format(month, 'MMMM')}
        </button>

        {/* 3. Year - Clickable */}
        <button
          type="button"
          onClick={onYearClick}
          className={cn(
            'text-sm font-medium hover:bg-muted px-2 py-1 rounded-md transition-colors',
            (isMonthSelectorOpen || isYearSelectorOpen) && 'bg-muted',
          )}
        >
          {format(month, 'yyyy')}
        </button>
      </div>

      {/* 4. Chevron Right */}
      <button
        aria-label="Next Month"
        onClick={onNextMonth}
        disabled={isMonthSelectorOpen || isYearSelectorOpen}
        type="button"
        className={cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center hover:bg-muted rounded-md transition-colors',
          (isMonthSelectorOpen || isYearSelectorOpen) &&
            'opacity-20 cursor-not-allowed hover:bg-transparent hover:opacity-20',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
