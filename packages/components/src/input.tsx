import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import {
  baseFieldClasses,
  buildAriaDescribedBy,
  FieldProps,
  fieldWrapperClasses,
  hintClasses,
  invalidFieldClasses,
  invalidHintClasses,
} from './field';
import { cn } from './utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldProps;
const textareaAdditionalClasses = 'min-h-[120px] resize-y';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    hint,
    invalid = false,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const generatedHintId = useId();
  const hintId = hint ? generatedHintId : undefined;
  const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);

  return (
    <div className={fieldWrapperClasses}>
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={cn(
          baseFieldClasses,
          invalid && invalidFieldClasses,
          className,
        )}
        {...props}
      />
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
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      hint,
      invalid = false,
      'aria-describedby': describedBy,
      ...props
    },
    ref,
  ) {
    const generatedHintId = useId();
    const hintId = hint ? generatedHintId : undefined;
    const ariaDescribedBy = buildAriaDescribedBy(describedBy, hintId);

    return (
      <div className={fieldWrapperClasses}>
        <textarea
          ref={ref}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          className={cn(
            baseFieldClasses,
            textareaAdditionalClasses,
            invalid && invalidFieldClasses,
            className,
          )}
          {...props}
        />
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
