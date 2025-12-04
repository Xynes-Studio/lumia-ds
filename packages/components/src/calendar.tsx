import type { ClassNames, DayPickerProps } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import { cn } from './utils';

const baseDayPickerClassNames: ClassNames = {
  months: 'flex flex-col gap-4 sm:flex-row sm:gap-6 sm:space-y-0',
  month: 'space-y-4',
  caption: 'flex justify-center pt-1 relative items-center text-foreground',
  caption_label: 'text-sm font-medium',
  nav: 'space-x-1 flex items-center',
  nav_button:
    'h-8 w-8 rounded-md border border-border bg-transparent p-0 text-muted transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  nav_button_previous: 'absolute left-1',
  nav_button_next: 'absolute right-1',
  table: 'w-full border-collapse space-y-1',
  head_row: 'flex',
  head_cell: 'text-muted rounded-md w-8 font-normal text-[0.8rem]',
  row: 'flex w-full mt-2',
  cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
  day: cn(
    'h-9 w-9 p-0 font-normal rounded-md transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'aria-selected:opacity-100 aria-selected:bg-primary aria-selected:text-secondary',
    'aria-selected:rounded-none',
    '[data-outside-month]:text-muted',
  ),
  day_range_start:
    'day-range-start rounded-l-md aria-selected:bg-primary aria-selected:text-secondary',
  day_range_end:
    'day-range-end rounded-r-md aria-selected:bg-primary aria-selected:text-secondary',
  day_range_middle:
    'aria-selected:bg-primary/15 aria-selected:text-foreground aria-selected:rounded-none',
  day_outside:
    'text-muted aria-selected:bg-primary/10 aria-selected:text-muted aria-selected:opacity-30',
  day_disabled: 'text-muted opacity-50 cursor-not-allowed',
};

const mergeClassNames = (overrides?: ClassNames) => {
  const merged = { ...baseDayPickerClassNames, ...overrides };

  merged.day = cn(baseDayPickerClassNames.day, overrides?.day);
  merged.day_range_start = cn(
    baseDayPickerClassNames.day_range_start,
    overrides?.day_range_start,
  );
  merged.day_range_end = cn(
    baseDayPickerClassNames.day_range_end,
    overrides?.day_range_end,
  );
  merged.day_range_middle = cn(
    baseDayPickerClassNames.day_range_middle,
    overrides?.day_range_middle,
  );
  merged.day_outside = cn(
    baseDayPickerClassNames.day_outside,
    overrides?.day_outside,
  );
  merged.day_disabled = cn(
    baseDayPickerClassNames.day_disabled,
    overrides?.day_disabled,
  );

  return merged;
};

export type CalendarProps = DayPickerProps;

export const calendarClassNames = baseDayPickerClassNames;

export const Calendar = ({
  showOutsideDays = true,
  className,
  classNames,
  ...props
}: CalendarProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn('p-1', className)}
    classNames={mergeClassNames(classNames)}
    {...props}
  />
);
