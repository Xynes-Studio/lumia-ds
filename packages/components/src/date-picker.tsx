import { useId, useMemo, useState } from 'react';
import type { Matcher } from 'react-day-picker';
import { Calendar, calendarClassNames } from './calendar';
import {
  baseFieldClasses,
  buildAriaDescribedBy,
  FieldProps,
  fieldWrapperClasses,
  hintClasses,
  invalidFieldClasses,
  invalidHintClasses,
} from './field';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

export type DatePickerProps = FieldProps & {
  value?: Date;
  onChange: (value?: Date) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  minDate?: Date;
  maxDate?: Date;
};

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const startOfDay = (value: Date | undefined) => {
  if (!value) return undefined;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDisplayDate = (value?: Date) => {
  if (!value) return '';
  return `${monthNames[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`;
};

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  hint,
  invalid = false,
  disabled = false,
  className,
  id,
  'aria-describedby': describedBy,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const controlId = useId();
  const resolvedId = id ?? controlId;
  const hintId = hint ? `${resolvedId}-hint` : undefined;
  const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);
  const normalizedValue = useMemo(() => startOfDay(value), [value]);
  const fromDate = useMemo(() => startOfDay(minDate), [minDate]);
  const toDate = useMemo(() => startOfDay(maxDate), [maxDate]);
  const displayValue = formatDisplayDate(normalizedValue) || placeholder;
  const disabledDays = useMemo(() => {
    const matchers: Matcher[] = [];
    if (fromDate) {
      matchers.push({ before: fromDate });
    }
    if (toDate) {
      matchers.push({ after: toDate });
    }
    return matchers;
  }, [fromDate, toDate]);

  const handleSelect = (next?: Date) => {
    const normalizedNext = startOfDay(next);
    onChange(normalizedNext ?? undefined);
    setOpen(false);
  };

  return (
    <div className={cn(fieldWrapperClasses, className)}>
      {label ? (
        <label
          htmlFor={resolvedId}
          className={cn(
            'text-sm font-medium leading-5 text-foreground',
            disabled && 'text-muted',
          )}
        >
          {label}
        </label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={resolvedId}
            type="button"
            aria-describedby={ariaDescribedBy}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            className={cn(
              baseFieldClasses,
              'flex items-center justify-between text-left',
              invalid && invalidFieldClasses,
            )}
          >
            <span
              className={cn(
                'truncate text-sm',
                !normalizedValue && 'text-muted',
                disabled && 'text-muted',
              )}
            >
              {displayValue}
            </span>
            <span className="ml-3 inline-flex h-5 w-5 items-center justify-center text-muted">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="4" y="5" width="12" height="11" rx="2" ry="2" />
                <path d="M7 3v3M13 3v3M4 9h12" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          role="dialog"
          align="start"
          className="w-auto p-2"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={normalizedValue}
            onSelect={handleSelect}
            fromDate={fromDate}
            toDate={toDate}
            disabled={disabledDays}
            initialFocus
            classNames={{
              ...calendarClassNames,
              day: cn(calendarClassNames.day, 'aria-selected:rounded-md'),
            }}
          />
        </PopoverContent>
      </Popover>
      {hint ? (
        <p
          id={hintId}
          className={cn(hintClasses, invalid && invalidHintClasses)}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
};
