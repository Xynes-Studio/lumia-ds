import type { InputHTMLAttributes } from 'react';
import { forwardRef, useEffect, useId, useRef } from 'react';
import {
  buildAriaDescribedBy,
  FieldProps,
  hintClasses,
  invalidHintClasses,
} from './field';
import { cn } from './utils';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className'
> &
  FieldProps & {
    label?: string;
    className?: string;
    indeterminate?: boolean;
  };

const indicatorBaseClasses =
  'relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background text-background shadow-sm transition';
const focusRingClasses =
  'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ring-offset-background';
const stateClasses =
  'peer-checked:border-primary peer-checked:bg-primary peer-data-[indeterminate=true]:border-primary peer-data-[indeterminate=true]:bg-primary';
const childVisibilityClasses =
  'peer-checked:[&>svg]:opacity-100 peer-data-[indeterminate=true]:[&>svg]:opacity-0 peer-data-[indeterminate=true]:[&>.checkbox-indeterminate]:opacity-100';
const disabledClasses =
  'peer-disabled:cursor-not-allowed peer-disabled:border-border peer-disabled:bg-muted peer-disabled:text-muted peer-disabled:opacity-60';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      className,
      hint,
      label,
      invalid = false,
      indeterminate = false,
      id,
      'aria-describedby': describedBy,
      'aria-checked': ariaChecked,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const hintId = hint ? `${controlId}-hint` : undefined;
    const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isDisabled = props.disabled ?? false;

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <label
        htmlFor={controlId}
        className={cn(
          'flex items-start gap-3 text-foreground',
          isDisabled && 'cursor-not-allowed opacity-70',
        )}
      >
        <input
          {...props}
          ref={setRefs}
          id={controlId}
          type="checkbox"
          aria-checked={indeterminate ? 'mixed' : ariaChecked}
          aria-describedby={ariaDescribedBy}
          aria-invalid={invalid || undefined}
          className="peer sr-only"
          data-indeterminate={indeterminate || undefined}
        />
        <span
          aria-hidden="true"
          className={cn(
            indicatorBaseClasses,
            focusRingClasses,
            stateClasses,
            childVisibilityClasses,
            invalid
              ? 'border-destructive peer-focus-visible:ring-destructive'
              : 'peer-focus-visible:ring-primary-500',
            disabledClasses,
            className,
          )}
        >
          <svg
            viewBox="0 0 12 10"
            className="h-3 w-3 opacity-0 transition-opacity duration-150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 5.2 4.5 8.5 11 1.5" />
          </svg>
          <span className="checkbox-indeterminate absolute block h-0.5 w-3 rounded bg-background opacity-0 transition-opacity duration-150" />
        </span>
        <div className="flex flex-col gap-1">
          {label ? (
            <span className="text-sm font-medium leading-5">{label}</span>
          ) : null}
          {hint ? (
            <span
              id={hintId}
              className={cn(hintClasses, invalid && invalidHintClasses)}
            >
              {hint}
            </span>
          ) : null}
        </div>
      </label>
    );
  },
);
