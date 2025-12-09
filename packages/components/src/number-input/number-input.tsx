import type React from 'react';
import type {
  ChangeEventHandler,
  FocusEventHandler,
  InputHTMLAttributes,
  KeyboardEventHandler,
} from 'react';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@lumia/icons';
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

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> &
  FieldProps & {
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    min?: number;
    max?: number;
    step?: number;
  };

const wrapperClasses =
  'flex w-full items-stretch rounded-md border border-border bg-background text-sm text-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 ring-offset-background';

const inputClasses =
  'flex-1 bg-transparent px-3 py-2 placeholder:text-muted-foreground  focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

const controlsClasses = 'flex w-11 flex-col border-l border-border';

const controlButtonClasses =
  'flex flex-1 items-center justify-center text-muted-foreground  transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

const clampValue = (value: number | undefined, min?: number, max?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;

  let next = value;

  if (typeof min === 'number') {
    next = Math.max(min, next);
  }

  if (typeof max === 'number') {
    next = Math.min(max, next);
  }

  return next;
};

const formatValue = (value: number | undefined) =>
  typeof value === 'number' && !Number.isNaN(value) ? `${value}` : '';

const parseRawValue = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { parsed: undefined, isValid: false, isEmpty: true };
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { parsed: undefined, isValid: false, isEmpty: false };
  }

  return { parsed, isValid: true, isEmpty: false };
};

const resolveNumber = (
  raw: string,
  fallback: number | undefined,
  min?: number,
  max?: number,
) => {
  const parsed = parseRawValue(raw);
  if (parsed.isValid) {
    return clampValue(parsed.parsed, min, max);
  }

  return clampValue(fallback, min, max);
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      className,
      hint,
      invalid = false,
      'aria-describedby': describedBy,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const hintId = hint ? `${generatedId}-hint` : undefined;
    const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);
    const initialClamped = clampValue(value, min, max);
    const [inputValue, setInputValue] = useState(() =>
      formatValue(initialClamped),
    );
    const [, forceRender] = useState(0);
    const currentNumberRef = useRef(initialClamped);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      const clamped = clampValue(value, min, max);
      currentNumberRef.current = clamped;
      setInputValue(formatValue(clamped));
    }, [value, min, max]);

    useEffect(() => {
      const node = inputRef.current;
      if (!node) return;

      const handleNativeBlur = (event: FocusEvent) => {
        const target = event.currentTarget as HTMLInputElement;
        const { parsed, isValid, isEmpty } = parseRawValue(target.value);

        if (isValid) {
          setClampedValue(parsed);
        } else if (isEmpty) {
          currentNumberRef.current = undefined;
          onChange(undefined);
          setInputValue('');
        } else {
          const clamped = clampValue(currentNumberRef.current, min, max);
          const fallback = formatValue(clamped);
          currentNumberRef.current = clamped;
          setInputValue(fallback);
          forceRender((counter) => counter + 1);
          target.value = fallback;
        }

        onBlur?.(event as unknown as React.FocusEvent<HTMLInputElement>);
      };

      node.addEventListener('blur', handleNativeBlur);
      return () => {
        node.removeEventListener('blur', handleNativeBlur);
      };
    }, [min, max, onBlur, onChange]);

    const setClampedValue = (next: number | undefined) => {
      const clamped = clampValue(next, min, max);
      currentNumberRef.current = clamped;
      setInputValue(formatValue(clamped));
      onChange(clamped);
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const raw = event.currentTarget.value;
      const { parsed, isValid, isEmpty } = parseRawValue(raw);

      if (isValid) {
        setClampedValue(parsed);
      } else if (isEmpty) {
        currentNumberRef.current = undefined;
        onChange(undefined);
        setInputValue('');
      } else {
        const fallback = formatValue(currentNumberRef.current);
        setInputValue(fallback);
        forceRender((counter) => counter + 1);
        event.currentTarget.value = fallback;
      }
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      const { parsed, isValid, isEmpty } = parseRawValue(
        event.currentTarget.value,
      );

      if (isValid) {
        setClampedValue(parsed);
      } else if (isEmpty) {
        currentNumberRef.current = undefined;
        onChange(undefined);
        setInputValue('');
      } else {
        const clamped = clampValue(currentNumberRef.current, min, max);
        const fallback = formatValue(clamped);
        currentNumberRef.current = clamped;
        setInputValue(fallback);
        forceRender((counter) => counter + 1);
        event.currentTarget.value = fallback;
      }

      onBlur?.(event);
    };

    const applyStep = (direction: 1 | -1) => {
      const base =
        currentNumberRef.current ?? (typeof min === 'number' ? min : 0);
      const next = base + direction * step;
      const clamped = clampValue(next, min, max);
      currentNumberRef.current = clamped;
      setInputValue(formatValue(clamped));
      onChange(clamped);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || props.disabled) return;

      const resolved = resolveNumber(
        event.currentTarget.value,
        currentNumberRef.current,
        min,
        max,
      );
      if (resolved !== currentNumberRef.current) {
        currentNumberRef.current = resolved;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        applyStep(1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        applyStep(-1);
      }
    };

    const ariaValue = resolveNumber(
      inputValue,
      currentNumberRef.current,
      min,
      max,
    );
    const isDisabled = props.disabled ?? false;

    return (
      <div className={fieldWrapperClasses}>
        <div
          className={cn(
            wrapperClasses,
            invalid && invalidFieldClasses,
            invalid && 'focus-within:ring-destructive',
            isDisabled && 'opacity-50',
            className,
          )}
        >
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="text"
            role="spinbutton"
            inputMode="decimal"
            aria-invalid={invalid || undefined}
            aria-describedby={ariaDescribedBy}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={ariaValue}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              baseFieldClasses,
              inputClasses,
              'rounded-r-none border-0 ring-0 focus-visible:ring-0',
            )}
            min={min}
            max={max}
            step={step}
            {...props}
          />
          <div className={controlsClasses}>
            <button
              type="button"
              aria-label="Increase value"
              className={controlButtonClasses}
              onClick={() => applyStep(1)}
              disabled={isDisabled}
            >
              <Icon name="chevron-up" className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Decrease value"
              className={cn(controlButtonClasses, 'border-t border-border')}
              onClick={() => applyStep(-1)}
              disabled={isDisabled}
            >
              <Icon name="chevron-down" className="h-4 w-4" aria-hidden />
            </button>
          </div>
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
  },
);
