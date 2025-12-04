import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker';
import { Button } from '../button/button';
import {
  baseFieldClasses,
  buildAriaDescribedBy,
  FieldProps,
  fieldWrapperClasses,
  hintClasses,
  invalidFieldClasses,
  invalidHintClasses,
} from '../shared/field';
import { cn } from '../lib/utils';

export type DateRangeValue = {
  from?: Date;
  to?: Date;
};

export type DateRangePreset = {
  label: string;
  getValue: () => DateRangeValue;
};

export type DateRangeFilterProps = FieldProps & {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  presets?: DateRangePreset[];
  placeholder?: string;
  label?: string;
  hint?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  minDate?: Date;
  maxDate?: Date;
  maxRangeDays?: number;
  variant?: 'classic' | 'modern';
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

const startOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const shiftDays = (value: Date, offset: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + offset);
  return startOfDay(date);
};

const formatInputDate = (value?: Date) => {
  if (!value) return '';
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseInputDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDisplayDate = (value: Date) => {
  const month = monthNames[value.getMonth()];
  const day = value.getDate();
  const year = value.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatDisplayRange = (value?: DateRangeValue) => {
  if (!value?.from && !value?.to) return '';
  if (value.from && value.to) {
    return `${formatDisplayDate(value.from)} – ${formatDisplayDate(value.to)}`;
  }
  if (value.from) {
    return `From ${formatDisplayDate(value.from)}`;
  }
  return `Until ${formatDisplayDate(value.to as Date)}`;
};

const defaultPresets = (): DateRangePreset[] => {
  const today = startOfDay(new Date());
  const startOfMonth = startOfDay(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  return [
    {
      label: 'Today',
      getValue: () => ({ from: today, to: today }),
    },
    {
      label: 'Last 7 days',
      getValue: () => ({
        from: shiftDays(today, -6),
        to: today,
      }),
    },
    {
      label: 'This month',
      getValue: () => ({
        from: startOfMonth,
        to: today,
      }),
    },
  ];
};

export const DateRangeFilter = ({
  value,
  onChange,
  presets,
  placeholder = 'Select date range',
  label,
  hint,
  invalid = false,
  disabled = false,
  className,
  id,
  'aria-describedby': describedBy,
  minDate,
  maxDate,
  maxRangeDays,
  variant = 'modern',
}: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  const [fromValue, setFromValue] = useState(formatInputDate(value?.from));
  const [toValue, setToValue] = useState(formatInputDate(value?.to));
  const controlId = id ?? useId();
  const hintId = hint ? `${controlId}-hint` : undefined;
  const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const normalizedMinDate = minDate ? startOfDay(minDate) : undefined;
  const normalizedMaxDate = maxDate ? startOfDay(maxDate) : undefined;

  const resolvedPresets = useMemo(() => presets ?? defaultPresets(), [presets]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        overlayRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      triggerRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    const timer = window.setTimeout(() => {
      if (variant === 'classic') {
        fromInputRef.current?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [open, variant]);

  useEffect(() => {
    if (open) return;
    setFromValue(formatInputDate(value?.from));
    setToValue(formatInputDate(value?.to));
  }, [value?.from, value?.to, open]);

  const clampToBounds = (candidate?: Date) => {
    if (!candidate) return undefined;
    const start = startOfDay(candidate);
    if (normalizedMinDate && start < normalizedMinDate) {
      return normalizedMinDate;
    }
    if (normalizedMaxDate && start > normalizedMaxDate) {
      return normalizedMaxDate;
    }
    return start;
  };

  const applyChange = (nextFrom?: string, nextTo?: string) => {
    const rawFrom = parseInputDate(nextFrom);
    const rawTo = parseInputDate(nextTo);
    let from = clampToBounds(rawFrom);
    let to = clampToBounds(rawTo);

    if (from && to && to < from) {
      to = from;
    }

    if (from && typeof maxRangeDays === 'number') {
      const cap = clampToBounds(shiftDays(from, maxRangeDays));
      if (cap && to && to > cap) {
        to = cap;
      }
    }

    const nextFromValue = formatInputDate(from);
    const nextToValue = formatInputDate(to);
    setFromValue(nextFromValue);
    setToValue(nextToValue);

    onChange({
      from,
      to,
    });
  };

  const displayValue = formatDisplayRange(value);
  const renderedLabel = displayValue || placeholder;
  const parsedFrom = parseInputDate(fromValue);
  const parsedTo = parseInputDate(toValue);
  const toMinDate = parsedFrom ?? normalizedMinDate;
  const toMaxByRange =
    parsedFrom && typeof maxRangeDays === 'number'
      ? clampToBounds(shiftDays(parsedFrom, maxRangeDays))
      : undefined;
  const toMaxCandidate = toMaxByRange ?? normalizedMaxDate;
  const gridLayoutClasses =
    variant === 'modern' ? 'grid gap-2 sm:grid-cols-2 sm:gap-3' : 'grid gap-3';
  const overlayWidth =
    variant === 'modern'
      ? 'w-[min(640px,calc(100vw-2rem))]'
      : 'w-[min(360px,calc(100vw-2rem))]';
  const disabledMatchers: Matcher[] = useMemo(() => {
    const matchers: Matcher[] = [];
    if (normalizedMinDate) {
      matchers.push({ before: normalizedMinDate });
    }
    if (normalizedMaxDate) {
      matchers.push({ after: normalizedMaxDate });
    }
    if (parsedFrom && typeof maxRangeDays === 'number') {
      const cap = clampToBounds(shiftDays(parsedFrom, maxRangeDays));
      if (cap) {
        matchers.push({ after: cap });
      }
    }
    if (parsedFrom) {
      matchers.push({ before: parsedFrom });
    }
    return matchers;
  }, [normalizedMinDate, normalizedMaxDate, parsedFrom, maxRangeDays]);
  const selectedRange: DateRange | undefined =
    parsedFrom || parsedTo
      ? {
          from: parsedFrom,
          to: parsedTo,
        }
      : undefined;

  return (
    <div className={cn(fieldWrapperClasses, className)}>
      {label ? (
        <label
          htmlFor={controlId}
          className="text-sm font-medium leading-5 text-foreground"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          id={controlId}
          type="button"
          ref={triggerRef}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={ariaDescribedBy}
          onClick={() => !disabled && setOpen((current) => !current)}
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
              !displayValue && 'text-muted-foreground ',
              disabled && 'text-muted-foreground ',
            )}
          >
            {renderedLabel}
          </span>
          <span className="ml-3 inline-flex h-5 w-5 items-center justify-center text-muted-foreground ">
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

        {open ? (
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="false"
            aria-label="Date range picker"
            className={cn(
              'absolute left-0 z-50 mt-2 rounded-lg border border-border bg-background p-4 shadow-lg',
              overlayWidth,
            )}
            tabIndex={-1}
          >
            <div className="grid gap-3">
              {variant === 'modern' ? (
                <DayPicker
                  mode="range"
                  numberOfMonths={2}
                  defaultMonth={parsedFrom ?? normalizedMinDate ?? undefined}
                  selected={selectedRange}
                  onSelect={(next) =>
                    applyChange(
                      formatInputDate(next?.from),
                      formatInputDate(next?.to),
                    )
                  }
                  disabled={disabledMatchers}
                  fromDate={normalizedMinDate}
                  toDate={toMaxCandidate}
                  showOutsideDays
                  className="rounded-md"
                  classNames={{
                    months:
                      'flex flex-col gap-4 sm:flex-row sm:gap-6 sm:space-y-0',
                    month: 'space-y-4',
                    caption:
                      'flex justify-center pt-1 relative items-center text-foreground',
                    caption_label: 'text-sm font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button:
                      'h-8 w-8 rounded-md border border-border bg-transparent p-0 text-muted-foreground  transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell:
                      'text-muted-foreground  rounded-md w-8 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                    day: cn(
                      'h-9 w-9 p-0 font-normal rounded-md transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      'aria-selected:opacity-100 aria-selected:bg-primary aria-selected:text-secondary',
                      'aria-selected:rounded-none',
                      '[data-outside-month]:text-muted-foreground ',
                    ),
                    day_range_start:
                      'day-range-start rounded-l-md aria-selected:bg-primary aria-selected:text-secondary',
                    day_range_end:
                      'day-range-end rounded-r-md aria-selected:bg-primary aria-selected:text-secondary',
                    day_range_middle:
                      'aria-selected:bg-primary/15 aria-selected:text-foreground aria-selected:rounded-none',
                    day_outside:
                      'text-muted-foreground  aria-selected:bg-primary/10 aria-selected:text-muted-foreground  aria-selected:opacity-30',
                    day_disabled:
                      'text-muted-foreground  opacity-50 cursor-not-allowed',
                  }}
                />
              ) : (
                <div className={gridLayoutClasses}>
                  <div className="grid gap-1">
                    <label
                      className="text-sm font-medium leading-5 text-foreground"
                      htmlFor={`${controlId}-from`}
                    >
                      From
                    </label>
                    <input
                      ref={fromInputRef}
                      id={`${controlId}-from`}
                      type="date"
                      value={fromValue}
                      min={formatInputDate(normalizedMinDate)}
                      max={formatInputDate(normalizedMaxDate)}
                      onChange={(event) =>
                        applyChange(event.target.value, toValue)
                      }
                      className={cn(
                        baseFieldClasses,
                        invalid && invalidFieldClasses,
                      )}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label
                      className="text-sm font-medium leading-5 text-foreground"
                      htmlFor={`${controlId}-to`}
                    >
                      To
                    </label>
                    <input
                      id={`${controlId}-to`}
                      type="date"
                      value={toValue}
                      min={formatInputDate(toMinDate)}
                      max={formatInputDate(toMaxCandidate)}
                      onChange={(event) =>
                        applyChange(fromValue, event.target.value)
                      }
                      className={cn(
                        baseFieldClasses,
                        invalid && invalidFieldClasses,
                      )}
                    />
                  </div>
                </div>
              )}

              {resolvedPresets.length ? (
                <div className="grid gap-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground ">
                    Presets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resolvedPresets.map((preset) => (
                      <Button
                        key={preset.label}
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          const next = preset.getValue();
                          setFromValue(formatInputDate(next.from));
                          setToValue(formatInputDate(next.to));
                          onChange(next);
                          setOpen(false);
                          triggerRef.current?.focus();
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
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
