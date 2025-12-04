import type { InputHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import {
  buildAriaDescribedBy,
  FieldProps,
  hintClasses,
  invalidHintClasses,
} from '../shared/field';
import { cn } from '../lib/utils';

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className'
> &
  FieldProps & {
    label?: string;
    className?: string;
  };

const indicatorBaseClasses =
  'relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm transition';
const focusRingClasses =
  'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ring-offset-background';
const stateClasses =
  'peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>.radio-dot]:opacity-100';
const disabledClasses =
  'peer-disabled:cursor-not-allowed peer-disabled:border-border peer-disabled:bg-muted peer-disabled:opacity-60';

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    className,
    hint,
    label,
    invalid = false,
    id,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);
  const isDisabled = props.disabled ?? false;

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
        ref={ref}
        id={controlId}
        type="radio"
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          indicatorBaseClasses,
          focusRingClasses,
          stateClasses,
          invalid
            ? 'border-destructive peer-focus-visible:ring-destructive'
            : 'peer-focus-visible:ring-primary-500',
          disabledClasses,
          className,
        )}
      >
        <span className="radio-dot h-2.5 w-2.5 rounded-full bg-background opacity-0 transition-opacity duration-150" />
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
});
