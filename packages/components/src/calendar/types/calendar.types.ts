import React from 'react';
import { DayCellRenderProps, DayCellProps } from './index';

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export type CalendarMode = 'single' | 'range' | 'default';
export type CalendarVariant = 'compact' | 'full';
export type CalendarViewMode = 'day' | 'week' | 'month';

export type DisabledMatcher =
  | boolean
  | Date
  | Date[]
  | ((date: Date) => boolean)
  | { from: Date; to: Date }
  | { before: Date }
  | { after: Date };

export interface CalendarProps {
  mode?: CalendarMode;
  variant?: CalendarVariant;
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  className?: string;
  classNames?: Record<string, string>;
  startMonth?: Date;
  endMonth?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabled?: DisabledMatcher | DisabledMatcher[];
  defaultMonth?: Date;
  numberOfMonths?: number;
  showOutsideDays?: boolean;
  autoFocus?: boolean;

  // HOC Pattern - Custom DayCell
  renderDay?: (props: DayCellRenderProps) => React.ReactNode;
  dayComponent?: React.ComponentType<DayCellProps>;

  // Full variant specific
  viewMode?: CalendarViewMode;
  onViewChange?: (view: CalendarViewMode) => void;

  // Props for backward compatibility or extra features
  captionLayout?: string;
  navLayout?: string;
}
