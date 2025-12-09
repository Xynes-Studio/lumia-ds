import React from 'react';
import { cn } from '../../lib/utils';
import { MONTH_NAMES_SHORT } from '../utils/constants';

// We use 0-11 for months
export interface MonthSelectorProps {
  value: number; // 0-11
  onChange: (month: number) => void;
  className?: string;
}

export const MonthSelector = ({
  value,
  onChange,
  className,
}: MonthSelectorProps) => {
  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-4 p-2', className)}>
      {MONTH_NAMES_SHORT.map((month, index) => (
        <button
          key={month}
          onClick={(e) => {
            e.stopPropagation();
            onChange(index);
          }}
          type="button"
          className={cn(
            'px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center justify-center h-full',
            value === index && 'bg-primary text-white hover:bg-primary',
          )}
        >
          {month}
        </button>
      ))}
    </div>
  );
};
