import type { ChangeEvent, FocusEvent } from 'react';
import { forwardRef, useCallback, useRef, useState } from 'react';
import type { InputProps } from '@lumia-ui/components';
import { Input } from '@lumia-ui/components';
import type { ValidationRule } from '../validation/validation';

type ValidatedInputProps = {
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule<string>[];
  hint?: string;
  errorMessage?: string | null;
} & Omit<InputProps, 'value' | 'onChange' | 'invalid' | 'hint'>;

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  function ValidatedInput(
    { value, onChange, rules = [], hint, onBlur, errorMessage, ...inputProps },
    ref,
  ) {
    const [internalError, setInternalError] = useState<string | null>(null);
    const validationRun = useRef(0);

    const runValidation = useCallback(
      async (nextValue: string) => {
        const runId = ++validationRun.current;

        if (!rules.length) {
          setInternalError(null);
          return;
        }

        for (const rule of rules) {
          const result = rule.validate(nextValue);
          const isValid = typeof result === 'boolean' ? result : await result;

          if (!isValid) {
            if (validationRun.current === runId) {
              setInternalError(rule.message);
            }
            return;
          }
        }

        if (validationRun.current === runId) {
          setInternalError(null);
        }
      },
      [rules],
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;
        onChange(nextValue);
        void runValidation(nextValue);
      },
      [onChange, runValidation],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        const nextValue = event.currentTarget.value;
        void runValidation(nextValue);
      },
      [onBlur, runValidation],
    );

    const displayError = errorMessage ?? internalError;
    const displayHint = displayError ?? hint;
    const isInvalid = Boolean(displayError);

    return (
      <Input
        {...inputProps}
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        hint={displayHint}
        invalid={isInvalid}
      />
    );
  },
);
