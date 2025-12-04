import type { SelectHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
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

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> &
  FieldProps & {
    label?: string;
  };

const selectAdditionalClasses = 'appearance-none pr-10 cursor-pointer';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
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
      <div className={fieldWrapperClasses}>
        {label ? (
          <label
            htmlFor={controlId}
            className={cn(
              'text-sm font-medium leading-5 text-foreground',
              isDisabled && 'text-muted-foreground',
            )}
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={controlId}
            aria-invalid={invalid || undefined}
            aria-describedby={ariaDescribedBy}
            className={cn(
              baseFieldClasses,
              selectAdditionalClasses,
              invalid && invalidFieldClasses,
              className,
            )}
            {...props}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M6 8l4 4 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
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
