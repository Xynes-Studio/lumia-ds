import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendar } from './use-calendar';
import { cn } from '../lib/utils';
import { format, isSameDay, isSameMonth, isToday, isBefore, isAfter, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export type CalendarProps = {
  mode?: 'single' | 'range' | 'default';
  selected?: Date | DateRange | undefined;
  onSelect?: (date: any) => void;
  className?: string;
  classNames?: Record<string, string>;
  startMonth?: Date; // minDate
  endMonth?: Date; // maxDate
  disabled?: boolean | ((date: Date) => boolean) | Date[] | { from: Date; to: Date } | { before: Date } | { after: Date } | any[];
  autoFocus?: boolean;
  showOutsideDays?: boolean;
  defaultMonth?: Date;
  numberOfMonths?: number;
  captionLayout?: string;
  navLayout?: string;
};

const isDateDisabled = (date: Date, disabled?: CalendarProps['disabled']): boolean => {
  if (!disabled) return false;
  
  if (Array.isArray(disabled)) {
    return disabled.some(matcher => isDateDisabled(date, matcher));
  }

  if (typeof disabled === 'boolean') return disabled;
  
  if (disabled instanceof Date) {
      return isSameDay(date, disabled);
  }

  if (typeof disabled === 'function') {
      return disabled(date);
  }

  // Handle Matcher objects
  if ('from' in disabled && 'to' in disabled) { // DateRange
      if (!disabled.from) return false;
      const from = startOfDay(disabled.from);
      const to = disabled.to ? startOfDay(disabled.to) : from;
      return date >= from && date <= to;
  }
  
  if ('before' in disabled) {
     return isBefore(date, startOfDay(disabled.before));
  }

  if ('after' in disabled) {
      return isAfter(date, startOfDay(disabled.after));
  }

  return false;
}

export const Calendar = ({
  mode = 'single',
  selected,
  onSelect,
  className,
  startMonth,
  endMonth,
  disabled,
  defaultMonth,
  showOutsideDays = true,
  numberOfMonths = 1,
  ...props
}: CalendarProps) => {
  const { month, setMonth, nextMonth, prevMonth } = useCalendar({ defaultMonth: defaultMonth || (mode === 'single' ? (selected as Date) : undefined) });

  const getDays = (m: Date) => {
      const start = startOfWeek(startOfMonth(m));
      const end = endOfWeek(endOfMonth(m));
      return eachDayOfInterval({ start, end });
  }

  const monthsToRender = [];
  for (let i = 0; i < numberOfMonths; i++) {
        monthsToRender.push(addMonths(month, i));
  }

  const handleDayClick = (date: Date) => {
    if (isDateDisabled(date, disabled)) return;

    if (mode === 'single') {
        const isSelected = selected instanceof Date && isSameDay(date, selected);
        if (onSelect) {
            onSelect(isSelected ? undefined : date);
        }
    } else if (mode === 'range') {
        const range = selected as DateRange || { from: undefined, to: undefined };
        let newRange: DateRange = { ...range };

        if (!range.from || (range.from && range.to)) {
            newRange = { from: date, to: undefined };
        } else if (range.from && !range.to) {
            if (isBefore(date, range.from)) {
                newRange = { from: date, to: range.from };
            } else {
                newRange = { from: range.from, to: date };
            }
        }
        
        if (onSelect) {
             onSelect(newRange);
        }
    }
  };
  
  const isSelected = (date: Date) => {
      if (mode === 'single') {
          return selected instanceof Date && isSameDay(date, selected);
      }
      if (mode === 'range') {
          const range = selected as DateRange;
          if (!range?.from) return false;
          if (isSameDay(date, range.from)) return true;
          if (range.to && isSameDay(date, range.to)) return true;
          return false;
      }
      return false;
  };

  const isRangeStart = (date: Date) => {
      if (mode !== 'range') return false;
      const range = selected as DateRange;
      return range?.from && isSameDay(date, range.from);
  }

  const isRangeEnd = (date: Date) => {
      if (mode !== 'range') return false;
      const range = selected as DateRange;
      return range?.to && isSameDay(date, range.to);
  }
  
  const isRangeMiddle = (date: Date) => {
      if (mode !== 'range') return false;
      const range = selected as DateRange;
      if (!range?.from || !range?.to) return false;
      return isAfter(date, range.from) && isBefore(date, range.to);
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 sm:gap-6", className)} {...props}>
      {monthsToRender.map((m, i) => (
        <div key={m.toString()} className="space-y-4">
            <div className="flex items-center justify-between pt-1 relative">
                <span className="text-sm font-medium w-full text-center absolute">
                    {format(m, 'MMMM yyyy')}
                </span>
                 <div className="flex items-center justify-between w-full h-7 z-10">
                    {i === 0 ? (
                        <button aria-label="Previous Month" onClick={prevMonth} type="button" className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 items-center justify-center flex hover:bg-muted rounded-md transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    ) : <div className="w-7" />}
                    
                    {i === monthsToRender.length - 1 ? (
                        <button aria-label="Next Month" onClick={nextMonth} type="button" className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 items-center justify-center flex hover:bg-muted rounded-md transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : <div className="w-7" />}
                 </div>
            </div>
            <div role="grid" className="w-full border-collapse space-y-1">
                <div className="flex">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="h-9 w-9 flex items-center justify-center font-medium text-xs text-muted-foreground rounded-md">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {getDays(m).map((day) => {
                        const isOutside = !isSameMonth(day, m);
                        if (!showOutsideDays && isOutside) return <div key={day.toString()} className="h-9 w-9" />;
                        
                        const isDisabled = isDateDisabled(day, disabled) || 
                                            (startMonth && isBefore(day, startMonth)) || 
                                            (endMonth && isAfter(day, endMonth));
                         // Basic aria-label
                         const label = format(day, 'MMMM d, yyyy');

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                disabled={isDisabled}
                                type="button"
                                aria-label={label}
                                className={cn(
                                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                    isSelected(day) && "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                                    isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground",
                                    isOutside && !isSelected(day) && "text-muted-foreground opacity-50",
                                    isRangeMiddle(day) && "bg-secondary text-secondary-foreground rounded-none",
                                    isRangeStart(day) && "rounded-r-none",
                                    isRangeEnd(day) && "rounded-l-none"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};
