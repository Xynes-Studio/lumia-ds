import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type TimeParts = { hours: number; minutes: number };

export type TimePickerProps = FieldProps & {
  value?: string | Date;
  onChange: (value?: string | Date) => void;
  placeholder?: string;
  label?: string;
  format?: '24h' | '12h';
  intervalMinutes?: number;
  returnType?: 'string' | 'date';
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
};

const clampInterval = (interval?: number) => {
  if (!interval || Number.isNaN(interval) || interval <= 0) return 30;
  return Math.min(interval, 240);
};

const formatTimeValue = ({ hours, minutes }: TimeParts) =>
  `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;

const formatDisplayTime = (
  parts: TimeParts | undefined,
  format: '24h' | '12h',
) => {
  if (!parts) return '';
  if (format === '12h') {
    const suffix = parts.hours >= 12 ? 'PM' : 'AM';
    const normalizedHours = parts.hours % 12 || 12;
    return `${normalizedHours}:${`${parts.minutes}`.padStart(2, '0')} ${suffix}`;
  }
  return formatTimeValue(parts);
};

const parseTimeParts = (value?: string | Date): TimeParts | undefined => {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { hours: value.getHours(), minutes: value.getMinutes() };
  }

  if (typeof value === 'string') {
    const [hoursRaw, minutesRaw] = value.split(':').map(Number);
    if (
      Number.isInteger(hoursRaw) &&
      Number.isInteger(minutesRaw) &&
      hoursRaw >= 0 &&
      hoursRaw < 24 &&
      minutesRaw >= 0 &&
      minutesRaw < 60
    ) {
      return { hours: hoursRaw, minutes: minutesRaw };
    }
  }

  return undefined;
};

const buildTimeOptions = (intervalMinutes: number, format: '24h' | '12h') => {
  const options: Array<TimeParts & { label: string; value: string }> = [];
  const totalSlots = Math.floor(1440 / intervalMinutes);

  for (let index = 0; index < totalSlots; index += 1) {
    const minutesFromStart = index * intervalMinutes;
    const hours = Math.floor(minutesFromStart / 60);
    const minutes = minutesFromStart % 60;
    const parts = { hours, minutes };
    options.push({
      ...parts,
      value: formatTimeValue(parts),
      label: formatDisplayTime(parts, format),
    });
  }

  return options;
};

export const TimePicker = ({
  value,
  onChange,
  placeholder = 'Select time',
  label,
  hint,
  invalid = false,
  disabled = false,
  format = '24h',
  intervalMinutes,
  returnType,
  className,
  id,
  'aria-describedby': describedBy,
}: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const controlId = useId();
  const resolvedId = id ?? controlId;
  const hintId = hint ? `${resolvedId}-hint` : undefined;
  const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);
  const selectedParts = useMemo(() => parseTimeParts(value), [value]);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const resolvedInterval = clampInterval(intervalMinutes);
  const options = useMemo(
    () => buildTimeOptions(resolvedInterval, format),
    [resolvedInterval, format],
  );
  const selectedValue = selectedParts
    ? formatTimeValue(selectedParts)
    : undefined;
  const displayValue =
    formatDisplayTime(selectedParts, format) || placeholder || '';
  const shouldReturnDate =
    returnType === 'date' || value instanceof Date ? 'date' : 'string';

  optionRefs.current = [];
  selectedRef.current = null;

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const target = selectedRef.current ?? optionRefs.current.find(Boolean);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'nearest' });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  const commitChange = (next: TimeParts | undefined) => {
    if (!next) {
      onChange(undefined);
      setOpen(false);
      return;
    }

    if (shouldReturnDate === 'date') {
      const base = value instanceof Date ? new Date(value) : new Date();
      base.setHours(next.hours, next.minutes, 0, 0);
      onChange(base);
    } else {
      onChange(formatTimeValue(next));
    }
    setOpen(false);
  };

  const focusByDelta = (delta: number) => {
    const focusable = optionRefs.current.filter(
      (node): node is HTMLButtonElement => Boolean(node),
    );
    if (!focusable.length) return;
    const active = document.activeElement as HTMLButtonElement | null;
    const currentIndex = focusable.findIndex((node) => node === active);
    const fallbackIndex =
      selectedValue !== undefined
        ? focusable.findIndex((node) => node?.dataset.value === selectedValue)
        : 0;
    const startIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;
    const nextIndex =
      (startIndex + delta + focusable.length) % focusable.length;
    focusable[nextIndex]?.focus();
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusByDelta(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusByDelta(-1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const active = document.activeElement as HTMLButtonElement | null;
      const activeValue = active?.dataset.value;
      if (!activeValue) return;
      const parts = parseTimeParts(activeValue);
      if (parts) {
        event.preventDefault();
        commitChange(parts);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
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
                !selectedParts && 'text-muted',
                disabled && 'text-muted',
              )}
            >
              {displayValue}
            </span>
            <span className="ml-3 inline-flex h-5 w-5 items-center justify-center text-muted">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  d="M12 7v5l3 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          role="dialog"
          align="start"
          className="w-56 p-3"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium leading-5 text-foreground">
              <span>Select time</span>
              {value ? (
                <button
                  type="button"
                  onClick={() => commitChange(undefined)}
                  className="text-xs font-medium text-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div
              role="listbox"
              aria-label="Time options"
              aria-activedescendant={selectedRef.current?.id}
              tabIndex={-1}
              className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/40 p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onKeyDown={handleListKeyDown}
            >
              {options.map((option, index) => {
                const isSelected = option.value === selectedValue;

                return (
                  <button
                    key={option.value}
                    id={`time-option-${option.value.replace(':', '-')}`}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                      if (isSelected) {
                        selectedRef.current = node;
                      }
                    }}
                    type="button"
                    role="option"
                    data-value={option.value}
                    aria-selected={isSelected}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-muted/40',
                      isSelected
                        ? 'bg-primary text-secondary'
                        : 'text-foreground hover:bg-muted',
                    )}
                    onClick={() =>
                      commitChange({
                        hours: option.hours,
                        minutes: option.minutes,
                      })
                    }
                  >
                    <span>{option.label}</span>
                    <span className="text-xs text-muted">
                      {formatTimeValue(option)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
